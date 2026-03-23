/**
 * server.js — Entry point for the Smart Garbage Reporting System API
 * Connects to MongoDB, sets up middleware, mounts routes, starts server.
 */

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

const app = express();

// ─── Middleware ───────────────────────────────────────────────────────────────
// Allow requests from the React frontend (CORS)
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true,
}));

// Parse incoming JSON request bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth', require('./routes/auth'));
app.use('/api/complaints', require('./routes/complaints'));

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ message: '🟢 Smart Garbage API is running!', status: 'OK' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err.message);
  res.status(500).json({ success: false, message: err.message || 'Internal Server Error' });
});

// ─── Database + Server Start ──────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected successfully');
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  });
