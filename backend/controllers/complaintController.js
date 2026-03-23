/**
 * controllers/complaintController.js — Handles complaint CRUD operations
 * Users create/view their complaints; Admins view and update all complaints.
 */

const Complaint = require('../models/Complaint');

/**
 * POST /api/complaints
 * Creates a new garbage complaint with image + GPS location.
 * Requires: multipart/form-data with image file, latitude, longitude
 */
const createComplaint = async (req, res) => {
  try {
    const { latitude, longitude, address, description } = req.body;

    // Image file is uploaded via Multer → Cloudinary (see middleware/upload.js)
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Image is required' });
    }

    if (!latitude || !longitude) {
      return res.status(400).json({ success: false, message: 'Location is required' });
    }

    const complaint = await Complaint.create({
      imageUrl: req.file.path,           // Cloudinary secure URL
      imagePublicId: req.file.filename,  // Cloudinary public ID
      location: {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        address: address || '',
      },
      description: description || '',
      userId: req.user._id,
      userName: req.user.name,
    });

    res.status(201).json({
      success: true,
      message: 'Complaint submitted successfully',
      complaint,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * GET /api/complaints/user
 * Returns all complaints submitted by the currently logged-in user.
 */
const getUserComplaints = async (req, res) => {
  try {
    const { status } = req.query; // Optional filter: ?status=open

    const filter = { userId: req.user._id };
    if (status) filter.status = status;

    const complaints = await Complaint.find(filter).sort({ createdAt: -1 }); // Newest first

    res.json({ success: true, count: complaints.length, complaints });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * GET /api/complaints/all
 * Returns ALL complaints (admin only). Supports ?status= filter.
 */
const getAllComplaints = async (req, res) => {
  try {
    const { status } = req.query;

    const filter = {};
    if (status) filter.status = status;

    const complaints = await Complaint.find(filter)
      .populate('userId', 'name email') // Include user's name and email
      .sort({ createdAt: -1 });

    res.json({ success: true, count: complaints.length, complaints });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * PATCH /api/complaints/:id
 * Updates the status of a complaint (admin only).
 * Valid transitions: open → assigned → resolved
 */
const updateComplaintStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['open', 'assigned', 'resolved'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      });
    }

    const complaint = await Complaint.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true } // Return updated document
    );

    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    res.json({
      success: true,
      message: `Status updated to "${status}"`,
      complaint,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * GET /api/complaints/:id
 * Returns a single complaint by ID.
 */
const getComplaintById = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id).populate('userId', 'name email');
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }
    res.json({ success: true, complaint });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  createComplaint,
  getUserComplaints,
  getAllComplaints,
  updateComplaintStatus,
  getComplaintById,
};
