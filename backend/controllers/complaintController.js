/**
 * controllers/complaintController.js — Handles complaint CRUD operations
 * Users create/view their complaints; Admins view and update all complaints.
 */

const Complaint = require('../models/Complaint');
const User = require('../models/User');
const axios = require('axios');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { cloudinary } = require('../middleware/upload');

/**
 * POST /api/complaints
 * Creates a new garbage complaint with image + GPS location.
 * Requires: multipart/form-data with image file, latitude, longitude
 */
const createComplaint = async (req, res) => {
  try {
    const { latitude, longitude, address, description, authorityId } = req.body;

    // Image file is uploaded via Multer → Cloudinary (see middleware/upload.js)
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Image is required' });
    }

    if (!latitude || !longitude) {
      return res.status(400).json({ success: false, message: 'Location is required' });
    }

    if (!authorityId) {
      return res.status(400).json({ success: false, message: 'Authority ID is required' });
    }

    // --- GEMINI AI IMAGE VALIDATION ---
    try {
      // 1. Download the uploaded image from Cloudinary into an array buffer
      const imageResponse = await axios.get(req.file.path, { responseType: 'arraybuffer' });
      const base64Data = Buffer.from(imageResponse.data, 'binary').toString('base64');

      // 2. Initialize Gemini
      const genAI = new GoogleGenerativeAI(process.env.G_API);
      const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

      // 3. Prompt Gemini
      const prompt = "Analyze this image. Does it show a garbage dump, overflowing trash, waste, or litter that needs cleaning? Reply with only a single word: YES or NO.";
      const imagePart = {
        inlineData: {
          data: base64Data,
          mimeType: req.file.mimetype || 'image/jpeg'
        }
      };

      const result = await model.generateContent([prompt, imagePart]);
      const aiResponse = result.response.text().trim().toLowerCase();
      console.log(`[AI Validation] Result for ${req.file.filename}: ${aiResponse}`);

      // 4. Reject if not garbage (strict match check)
      if (!aiResponse.includes('yes')) {
        // Delete invalid image from Cloudinary to clean up
        await cloudinary.uploader.destroy(req.file.filename);
        return res.status(400).json({ 
          success: false, 
          message: 'AI Validation Failed: No garbage or waste detected in this image. Please upload a valid photo.' 
        });
      }
    } catch (aiError) {
      console.error('[AI Validation Error]', aiError.message);
      return res.status(500).json({ 
        success: false, 
        message: 'AI Service Error. (Did you add the G_API key to Render?): ' + aiError.message 
      });
    }
    // --- END AI VALIDATION ---

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
      authorityId,
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

    const complaints = await Complaint.find(filter)
      .populate('workerId', 'workerDetails.truckNumber')
      .sort({ createdAt: -1 }); // Newest first

    res.json({ success: true, count: complaints.length, complaints });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * GET /api/complaints/worker
 * Returns complaints assigned to the logged-in worker.
 */
const getWorkerComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({ workerId: req.user._id })
      .populate('userId', 'name email').sort({ createdAt: -1 });
    res.json({ success: true, count: complaints.length, complaints });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * GET /api/complaints/all
 * Returns complaints formatted by role
 */
const getAllComplaints = async (req, res) => {
  try {
    const { status } = req.query;

    const filter = {};
    if (status) filter.status = status;
    
    // If the user is an admin (authority), only show complaints assigned to them
    if (req.user.role === 'admin') {
      filter.authorityId = req.user._id;
    }

    const complaints = await Complaint.find(filter)
      .populate('userId', 'name email') // Include user's name and email
      .populate('workerId', 'workerDetails.truckNumber')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: complaints.length, complaints });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * POST /api/complaints/:id/assign-truck
 * Admin only: Finds nearest idle truck and assigns it to this complaint.
 */
const assignTruck = async (req, res) => {
  try {
    const { id } = req.params;
    const complaint = await Complaint.findById(id);
    if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found' });
    
    // Ensure only the assigned authority can do this
    if (complaint.authorityId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to assign this complaint' });
    }

    // Find nearest idle worker assigned to this ward
    const nearestWorker = await User.findOne({
      role: 'worker',
      'workerDetails.status': 'idle',
      'workerDetails.assignedWard': req.user._id, // Enforce ward subset
      'workerDetails.location': {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [complaint.location.longitude, complaint.location.latitude]
          }
        }
      }
    });

    if (!nearestWorker) {
      return res.status(400).json({ success: false, message: 'No idle trucks available in your ward. You can wait or transfer this report to a nearby ward.' });
    }

    // Assign worker and set working
    complaint.workerId = nearestWorker._id;
    complaint.status = 'assigned';
    await complaint.save();

    await User.updateOne(
      { _id: nearestWorker._id }, 
      { $set: { 'workerDetails.status': 'busy' } }
    );

    res.json({ success: true, message: `Truck ${nearestWorker.workerDetails.truckNumber} assigned`, complaint, worker: nearestWorker.workerDetails });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * PATCH /api/complaints/:id/transfer
 * Admin only: Transfers a complaint to another nearby ward.
 */
const transferComplaint = async (req, res) => {
  try {
    const { id } = req.params;
    const { newAuthorityId, newAuthorityName } = req.body;

    if (!newAuthorityId || !newAuthorityName) {
      return res.status(400).json({ success: false, message: 'New authority ID and Name are required' });
    }

    const complaint = await Complaint.findById(id);
    if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found' });

    // Validate ownership
    if (complaint.authorityId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to transfer this complaint' });
    }

    // If it was already assigned to a worker, free the worker
    if (complaint.workerId) {
      const worker = await User.findById(complaint.workerId);
      if (worker) {
        await User.updateOne({ _id: worker._id }, { $set: { 'workerDetails.status': 'idle' } });
      }
      complaint.workerId = null;
      complaint.status = 'open'; // Reset to open for the new ward
    }

    // Save transfer history
    complaint.transferHistory.push({
      fromAuthorityName: req.user.authorityDetails?.name || req.user.name,
      toAuthorityName: newAuthorityName,
      timestamp: Date.now()
    });

    // Transfer ownership
    complaint.authorityId = newAuthorityId;
    await complaint.save();

    res.json({ success: true, message: `Successfully transferred to ${newAuthorityName}`, complaint });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * POST /api/complaints/:id/worker-submit
 * Worker only: Submits proof of cleanup (after image)
 */
const workerSubmit = async (req, res) => {
  try {
    const { id } = req.params;
    if (!req.file) return res.status(400).json({ success: false, message: 'After image proof is required' });

    const complaint = await Complaint.findById(id);
    if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found' });

    if (complaint.workerId?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'You are not assigned to this complaint' });
    }

    complaint.afterImageUrl = req.file.path;
    complaint.afterImagePublicId = req.file.filename;
    complaint.status = 'pending_verification';
    await complaint.save();

    await User.updateOne({ _id: req.user._id }, { $set: { 'workerDetails.status': 'idle' } });

    res.json({ success: true, message: 'Proof submitted. Pending verification.', complaint });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * PATCH /api/complaints/:id/verify
 * Admin only: Reviews after photo and marks resolved.
 */
const verifyComplaint = async (req, res) => {
  try {
    const { id } = req.params;
    const complaint = await Complaint.findById(id);
    if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found' });

    if (complaint.authorityId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (complaint.status !== 'pending_verification') {
      return res.status(400).json({ success: false, message: 'Complaint not pending verification' });
    }

    complaint.status = 'resolved';
    await complaint.save();

    res.json({ success: true, message: 'Complaint resolved', complaint });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * PATCH /api/complaints/:id
 * Legacy: Updates the status of a complaint (admin only).
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
  getWorkerComplaints,
  assignTruck,
  transferComplaint,
  workerSubmit,
  verifyComplaint
};
