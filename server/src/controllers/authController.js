import jwt from 'jsonwebtoken';
import { UserRepo } from '../models/User.js';

const JWT_SECRET = process.env.JWT_SECRET || 'fieldsense-ai-jwt-secret-change-in-production-2024';
const JWT_EXPIRES = process.env.JWT_EXPIRES_IN || '7d';

const signToken = (userId) =>
  jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES });

/**
 * POST /api/auth/register
 */
export const register = async (req, res, next) => {
  try {
    const { name, email, password, organization } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, error: 'Name, email and password are required.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, error: 'Password must be at least 6 characters.' });
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      return res.status(400).json({ success: false, error: 'Invalid email address.' });
    }

    const user = await UserRepo.create({ name, email, password, organization });

    const token = signToken(user._id || user.id);
    const { password: _, comparePassword: __, ...safeUser } = user;

    return res.status(201).json({
      success: true,
      token,
      user: safeUser
    });
  } catch (err) {
    if (err.code === 11000 || err.message?.includes('already registered')) {
      return res.status(409).json({ success: false, error: 'Email already registered. Please log in.' });
    }
    next(err);
  }
};

/**
 * POST /api/auth/login
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required.' });
    }

    const user = await UserRepo.findByEmail(email);
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid credentials.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid credentials.' });
    }

    const token = signToken(user._id || user.id);
    const { password: _, comparePassword: __, ...safeUser } = user;

    return res.status(200).json({
      success: true,
      token,
      user: safeUser
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/auth/me  (protected)
 */
export const getMe = async (req, res, next) => {
  try {
    const user = await UserRepo.findById(req.userId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found.' });
    }
    return res.status(200).json({ success: true, user });
  } catch (err) {
    next(err);
  }
};
