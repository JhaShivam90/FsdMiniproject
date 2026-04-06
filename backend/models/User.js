/**
 * models/User.js — Mongoose schema for user accounts
 * Stores name, email, hashed password, and role (user or admin).
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user', // Regular users by default
    },
    authorityDetails: {
      name: { type: String },
      location: {
        // GeoJSON for $near queries
        type: {
          type: String,
          enum: ['Point'],
          default: 'Point',
        },
        coordinates: {
          type: [Number], // [longitude, latitude] required for GeoJSON
          default: [0, 0],
        },
        address: { type: String, default: '' },
      },
      rating: {
        score: { type: Number, default: 0 },
        count: { type: Number, default: 0 },
      },
    },
  },
  { timestamps: true }
);

// Geospatial index for nearby authorities
userSchema.index({ 'authorityDetails.location': '2dsphere' });


// Hash password BEFORE saving to database (pre-save hook)
userSchema.pre('save', async function (next) {
  // Only hash if password was modified (prevents re-hashing on other updates)
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Method to compare plain password with hashed password in DB
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
