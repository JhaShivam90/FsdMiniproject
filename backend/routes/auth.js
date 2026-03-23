/**
 * routes/auth.js — Authentication routes
 * POST /api/auth/register - Create a new account
 * POST /api/auth/login    - Login and get JWT token
 * GET  /api/auth/me       - Get current user profile (protected)
 */

const express = require('express');
const router = express.Router();
const { register, login, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe); // Protected: must be logged in

module.exports = router;
