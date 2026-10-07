import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fieldsense-ai-jwt-secret-change-in-production-2024';

/**
 * Strict auth — rejects unauthenticated requests
 */
export const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'Access denied. No token provided.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, error: 'Invalid or expired token.' });
  }
};

/**
 * Soft auth — attaches userId if valid token present, but does NOT block
 * Useful for endpoints that work both authenticated and anonymously
 */
export const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET);
      req.userId = decoded.id;
    } catch (_) {}
  }
  next();
};
