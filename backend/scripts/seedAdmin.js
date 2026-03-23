/**
 * scripts/seedAdmin.js — Creates the admin user in MongoDB
 * Run once: node scripts/seedAdmin.js
 * 
 * This creates an admin account using credentials from your .env file.
 * Admin credentials default: admin@garbage.com / Admin@123
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');

dotenv.config();

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const email = process.env.ADMIN_EMAIL || 'admin@garbage.com';
    const password = process.env.ADMIN_PASSWORD || 'Admin@123';
    const name = 'Admin';

    // Check if admin already exists
    const existing = await User.findOne({ email });
    if (existing) {
      console.log(`ℹ️  Admin already exists: ${email}`);
      process.exit(0);
    }

    // Create admin (password gets hashed by the pre-save hook in User model)
    await User.create({ name, email, password, role: 'admin' });
    console.log(`✅ Admin created successfully!`);
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
    console.log(`   Role: admin`);
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
  } finally {
    mongoose.connection.close();
    process.exit(0);
  }
};

seedAdmin();
