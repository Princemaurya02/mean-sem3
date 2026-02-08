require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');

mongoose.connect(process.env.MONGODB_URI);

const createUsers = async () => {
  try {
    console.log('🚀 Starting user creation...\n');

    // Check if users already exist
    const existingUsers = await User.countDocuments();
    if (existingUsers > 0) {
      console.log('⚠️  Users already exist. Deleting existing users...');
      await User.deleteMany({});
      console.log('✅ Existing users deleted.\n');
    }

    // Admin User
    const admin1 = await User.create({
      username: 'admin',
      email: 'admin@court.com',
      password: 'Admin@123',
      role: 'Admin',
      firstName: 'System',
      lastName: 'Administrator',
      contactNumber: '1234567890'
    });
    console.log('✅ Admin created:', admin1.email);

    // Staff User
    const staff1 = await User.create({
      username: 'williams',
      email: 'williams@court.com',
      password: 'Staff@123',
      role: 'Staff',
      firstName: 'Sarah',
      lastName: 'Williams',
      contactNumber: '1234567892'
    });
    console.log('✅ Staff created:', staff1.email);

    console.log('\n🎉 Users created successfully!\n');
    console.log('='.repeat(70));
    console.log('📋 LOGIN CREDENTIALS:');
    console.log('='.repeat(70));
    console.log('👑 ADMIN USER:');
    console.log('   Email:      admin@court.com          / Pass: Admin@123');
    console.log('');
    console.log('👥 STAFF USER:');
    console.log('   Email:      williams@court.com       / Pass: Staff@123');
    console.log('='.repeat(70));

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating users:', error.message);
    process.exit(1);
  }
};

createUsers();
