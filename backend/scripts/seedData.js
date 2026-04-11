require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Complaint = require('../models/Complaint');

// Approximate static coordinates for Mumbai Wards
const wards = [
  {
    name: "R/Central Ward (Borivali)",
    email: "r_central@bmc.gov.in",
    address: "Chandavarkar Lane, S.V. Road, Borivali (West), Mumbai-400092.",
    lat: 19.2295,
    lng: 72.8573
  },
  {
    name: "R/South Ward (Kandivali)",
    email: "r_south@bmc.gov.in",
    address: "M.G. Road, Kandivali (West), Mumbai-400067.",
    lat: 19.2084,
    lng: 72.8453
  },
  {
    name: "P/North Ward (Malad)",
    email: "p_north@bmc.gov.in",
    address: "Mamletdar Wadi Road, Liberty Garden, Malad (West), Mumbai-400064.",
    lat: 19.1860,
    lng: 72.8480
  },
  {
    name: "P/South Ward (Goregaon)",
    email: "p_south@bmc.gov.in",
    address: "S.V. Road, Goregaon (West), Mumbai-400104.",
    lat: 19.1645,
    lng: 72.8465
  },
  {
    name: "K/West Ward (Andheri West)",
    email: "k_west@bmc.gov.in",
    address: "S.V. Road, Andheri (West), Mumbai-400058.",
    lat: 19.1136,
    lng: 72.8406
  },
  {
    name: "K/East Ward (Andheri East)",
    email: "k_east@bmc.gov.in",
    address: "Azad Road, Gundavali, Andheri (East), Mumbai-400069.",
    lat: 19.1155,
    lng: 72.8530
  },
  {
    name: "H/West Ward (Bandra)",
    email: "h_west@bmc.gov.in",
    address: "St. Martins Road, Behind Bandra Police Station, Bandra (West), Mumbai-400050.",
    lat: 19.0553,
    lng: 72.8335
  },
  {
    name: "H/East Ward (Santacruz East)",
    email: "h_east@bmc.gov.in",
    address: "Plot No.137, TPS-V, Prabhat Colony, Santacruz (East), Mumbai-400055.",
    lat: 19.0805,
    lng: 72.8455
  }
];

// Base GPS locations for Garages
const garages = [
  { name: "Borivali / Gorai Garage", lat: 19.2393, lng: 72.8270, prefix: "BRL" },
  { name: "Malad Garage", lat: 19.1860, lng: 72.8480, prefix: "MLD" },
  { name: "Santacruz Garage", lat: 19.0830, lng: 72.8410, prefix: "STC" },
  { name: "Versova Garage", lat: 19.1300, lng: 72.8150, prefix: "VRS" }
];

const seedDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`Connected to: ${conn.connection.name}`);

    console.log('Wiping database...');
    await User.deleteMany({});
    await Complaint.deleteMany({});
    
    // Seed test citizen
    await User.create({
      name: 'Ramesh Citizen',
      email: 'user@test.com',
      password: 'password123',
      role: 'user'
    });
    console.log('Created citizen user (user@test.com)');

    // Seed Authorities
    for (const ward of wards) {
      await User.create({
        name: 'Admin - ' + ward.name,
        email: ward.email,
        password: 'password123', // global password
        role: 'admin',
        authorityDetails: {
          name: ward.name,
          address: ward.address,
          location: {
            type: 'Point',
            coordinates: [ward.lng, ward.lat]
          },
          rating: {
            score: (Math.random() * 5).toFixed(1),
            count: Math.floor(Math.random() * 100)
          }
        }
      });
    }
    console.log(`Created ${wards.length} Ward Authorities`);

    // Seed Truck Workers
    let workerCount = 1;
    for (const garage of garages) {
      for (let i = 1; i <= 3; i++) {
        // e.g. MH-04-GA-1234
        const truckNo = `MH-04-${garage.prefix}-${1000 + workerCount}`;
        await User.create({
          name: `Driver ${workerCount} (${garage.name})`,
          email: `driver${workerCount}@test.com`,
          password: 'password123',
          role: 'worker',
          workerDetails: {
            truckNumber: truckNo,
            garageName: garage.name,
            location: {
              type: 'Point',
              // slight random offset so they aren't on top of each other exactly
              coordinates: [garage.lng + (Math.random()*0.005), garage.lat + (Math.random()*0.005)]
            },
            status: 'idle'
          }
        });
        workerCount++;
      }
    }
    console.log(`Created ${workerCount - 1} Truck Workers across ${garages.length} Garages`);
    
    console.log('Seeding Complete! You can login with password123');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding DB:', error);
    process.exit(1);
  }
};

seedDB();
