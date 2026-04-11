/**
 * controllers/authController.js — Handles user registration and login
 * Issues signed JWT tokens on successful authentication.
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Helper: generate a JWT token valid for 7 days
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

/**
 * POST /api/auth/register
 * Registers a new user account.
 */
const register = async (req, res) => {
  try {
    const { name, email, password, role, authorityName, latitude, longitude, address, garageName, truckNumber } = req.body;

    // Basic validation
    // Require email and password at minimum. Name is required by model.
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'Email already registered' });
    }

    const userData = { name, email, password };

    if (role === 'admin') {
      userData.role = 'admin';
      if (latitude && longitude) {
        userData.authorityDetails = {
          name: authorityName || name,
          location: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)],
            address: address || '',
          },
          rating: { score: 0, count: 0 },
        };
      } else {
        return res.status(400).json({ success: false, message: 'Location is required for an Authority account' });
      }
    } else if (role === 'worker') {
      userData.role = 'worker';
      if (latitude && longitude && garageName && truckNumber) {
        userData.workerDetails = {
          truckNumber,
          garageName,
          location: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)],
          },
          status: 'idle'
        };
      } else {
        return res.status(400).json({ success: false, message: 'Location, garage name, and truck number are required for Worker' });
      }
    }

    // Create user (password is hashed in the model's pre-save hook)
    const user = await User.create(userData);

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * POST /api/auth/login
 * Logs in an existing user and returns a JWT.
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password required' });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // Compare provided password with hashed password in DB
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    res.json({
      success: true,
      message: 'Login successful',
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * GET /api/auth/me
 * Returns the currently logged-in user's profile.
 */
const getMe = async (req, res) => {
  res.json({ success: true, user: req.user });
};

module.exports = { register, login, getMe };
