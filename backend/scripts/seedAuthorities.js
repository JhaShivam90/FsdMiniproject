require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB');

    const authorities = [
      {
        name: 'Admin North',
        email: 'north@garbage.gov',
        password: 'password123',
        role: 'admin',
        authorityDetails: {
          name: 'North Zone Municipal Office',
          location: { type: 'Point', coordinates: [77.2029, 28.6139], address: 'North Delhi' },
          rating: { score: 4.2, count: 10 }
        }
      },
      {
        name: 'Admin South',
        email: 'south@garbage.gov',
        password: 'password123',
        role: 'admin',
        authorityDetails: {
          name: 'South Zone Authority',
          location: { type: 'Point', coordinates: [77.2065, 28.5355], address: 'South Delhi' },
          rating: { score: 3.8, count: 5 }
        }
      },
      {
        name: 'Admin West',
        email: 'west@garbage.gov',
        password: 'password123',
        role: 'admin',
        authorityDetails: {
          name: 'West Ward Sanitation Dept',
          location: { type: 'Point', coordinates: [77.0866, 28.6508], address: 'West Delhi' },
          rating: { score: 4.5, count: 20 }
        }
      }
    ];

    for (const auth of authorities) {
      const exists = await User.findOne({ email: auth.email });
      if (!exists) {
        await User.create(auth);
        console.log(`Created authority: ${auth.authorityDetails.name}`);
      } else {
        console.log(`Authority ${auth.email} already exists`);
      }
    }

    console.log('Seeding complete.');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

run();
