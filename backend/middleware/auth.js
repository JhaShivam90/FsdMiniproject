/**
 * middleware/auth.js — JWT token verification middleware
 * Protects routes by validating the Bearer token in Authorization header.
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Verify token and attach user to request
const protect = async (req, res, next) => {
  try {
    // Check if Authorization header exists and starts with "Bearer"
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Not authorized. No token.' });
    }

    const token = authHeader.split(' ')[1];

    // Verify the token using our JWT secret
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach the user (without password) to the request object
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Token invalid or expired' });
  }
};

// Additional middleware to restrict access to admins only
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  return res.status(403).json({ success: false, message: 'Access denied. Admins only.' });
};

module.exports = { protect, adminOnly };
