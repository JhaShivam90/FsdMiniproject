/**
 * models/Complaint.js — Mongoose schema for garbage complaints
 * Each complaint has an image URL, GPS location, status, and linked user.
 */

const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema(
  {
    // Cloudinary URL for the uploaded garbage image
    imageUrl: {
      type: String,
      required: [true, 'Image is required'],
    },

    // Cloudinary public ID (needed to delete image if required)
    imagePublicId: {
      type: String,
    },

    // GPS coordinates captured from browser
    location: {
      latitude: {
        type: Number,
        required: [true, 'Latitude is required'],
      },
      longitude: {
        type: Number,
        required: [true, 'Longitude is required'],
      },
      // Optional human-readable address
      address: {
        type: String,
        default: '',
      },
    },

    // Complaint lifecycle status
    status: {
      type: String,
      enum: ['open', 'assigned', 'resolved'],
      default: 'open',
    },

    // Optional description from the user
    description: {
      type: String,
      trim: true,
      default: '',
    },

    // Reference to the user who submitted this complaint
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // Name of the user (denormalized for quick display)
    userName: {
      type: String,
    },
  },
  { timestamps: true } // adds createdAt and updatedAt automatically
);

module.exports = mongoose.model('Complaint', complaintSchema);
