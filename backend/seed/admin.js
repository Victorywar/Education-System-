require('dotenv').config();
const bcrypt = require('bcryptjs');
const connectDB = require('../config/database');
const Admin = require('../models/Admin');

const seedAdmin = async () => {
  try {
    await connectDB();
    const username = 'admin';
    const password = await bcrypt.hash('admin123', 10);
    await Admin.findOneAndUpdate(
      { username },
      { $set: { name: 'System Administrator', username, password, role: 'admin' } },
      { upsert: true, new: true, runValidators: true }
    );
    console.log('Admin account seeded: username=admin');
    process.exit(0);
  } catch (error) {
    console.error('Admin seed failed:', error);
    process.exit(1);
  }
};

seedAdmin();
