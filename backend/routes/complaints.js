/**
 * routes/complaints.js — Complaint management routes
 * POST   /api/complaints        - Submit a new complaint (user)
 * GET    /api/complaints/user   - Get current user's complaints (user)
 * GET    /api/complaints/all    - Get all complaints (admin only)
 * PATCH  /api/complaints/:id    - Update complaint status (admin only)
 * GET    /api/complaints/:id    - Get single complaint details
 */

const express = require('express');
const router = express.Router();
const { upload } = require('../middleware/upload');
const { protect, adminOnly } = require('../middleware/auth');
const {
  createComplaint,
  getUserComplaints,
  getAllComplaints,
  updateComplaintStatus,
  getComplaintById,
  getWorkerComplaints,
  assignTruck,
  transferComplaint,
  workerSubmit,
  verifyComplaint
} = require('../controllers/complaintController');

// User routes (any authenticated user)
router.post('/', protect, upload.single('image'), createComplaint);
router.get('/user', protect, getUserComplaints);

// Worker routes
router.get('/worker', protect, getWorkerComplaints);
router.post('/:id/worker-submit', protect, upload.single('image'), workerSubmit);

// Admin-only routes
router.get('/all', protect, adminOnly, getAllComplaints);
router.post('/:id/assign-truck', protect, adminOnly, assignTruck);
router.patch('/:id/transfer', protect, adminOnly, transferComplaint);
router.patch('/:id/verify', protect, adminOnly, verifyComplaint);
router.patch('/:id', protect, adminOnly, updateComplaintStatus);

// Single complaint (authenticated)
router.get('/:id', protect, getComplaintById);

module.exports = router;
