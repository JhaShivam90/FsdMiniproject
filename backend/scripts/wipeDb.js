require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Complaint = require('../models/Complaint');

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB');
    await User.deleteMany({});
    await Complaint.deleteMany({});
    console.log('Database wiped completely.');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

run();
