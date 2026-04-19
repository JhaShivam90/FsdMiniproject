/**
 * middleware/upload.js — Configures Multer with Cloudinary storage
 * Images uploaded via /complaints are stored directly in Cloudinary.
 */

const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configure Cloudinary with credentials from .env
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Set up Cloudinary as the Multer storage destination
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'smart-garbage', // All images go into this Cloudinary folder
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [
      { width: 1200, height: 900, crop: 'limit' }, // Resize large images
      { quality: 'auto' }, // Auto-optimize quality
    ],
  },
});

// Multer middleware with 5MB file size limit
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  },
});

module.exports = { upload, cloudinary };
