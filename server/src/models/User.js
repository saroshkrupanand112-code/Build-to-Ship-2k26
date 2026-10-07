import mongoosePkg from 'mongoose';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { getDBStatus } from '../config/db.js';

const { Schema, model } = mongoosePkg;

const UserSchema = new Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6 },
  role: { type: String, enum: ['technician', 'engineer', 'admin'], default: 'technician' },
  organization: { type: String, default: 'FieldSense' },
  lastLogin: { type: Date }
}, { timestamps: true });

// Hash password before save
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

let UserModel;
try {
  UserModel = model('User', UserSchema);
} catch (e) {
  UserModel = mongoosePkg.model('User');
}

// =================== In-Memory User Store ===================
const inMemoryUsers = new Map();

export const UserRepo = {
  async create(data) {
    const status = getDBStatus();
    if (status.connected && UserModel) {
      try {
        const user = new UserModel(data);
        return await user.save();
      } catch (err) {
        console.warn('[UserRepo] DB write error, falling back:', err.message);
      }
    }
    // Check uniqueness
    for (const u of inMemoryUsers.values()) {
      if (u.email === data.email.toLowerCase()) {
        const err = new Error('Email already registered');
        err.code = 11000;
        throw err;
      }
    }
    const id = uuidv4();
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(data.password, salt);
    const now = new Date();
    const record = {
      _id: id, id,
      name: data.name,
      email: data.email.toLowerCase(),
      password: hashed,
      role: data.role || 'technician',
      organization: data.organization || 'FieldSense',
      createdAt: now, updatedAt: now,
      comparePassword: async (candidate) => bcrypt.compare(candidate, hashed)
    };
    inMemoryUsers.set(id, record);
    return record;
  },

  async findByEmail(email) {
    const status = getDBStatus();
    if (status.connected && UserModel) {
      try {
        return await UserModel.findOne({ email: email.toLowerCase() });
      } catch (err) {}
    }
    for (const u of inMemoryUsers.values()) {
      if (u.email === email.toLowerCase()) return u;
    }
    return null;
  },

  async findById(id) {
    const status = getDBStatus();
    if (status.connected && UserModel) {
      try {
        return await UserModel.findById(id).select('-password').lean();
      } catch (err) {}
    }
    const u = inMemoryUsers.get(id);
    if (u) {
      const { password, comparePassword, ...safe } = u;
      return safe;
    }
    return null;
  }
};

export default UserModel;
