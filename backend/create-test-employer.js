#!/usr/bin/env node

/**
 * Create Test Employer Account
 * Creates a test employer account for testing candidate search
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

async function createTestEmployer() {
  try {
    console.log('🚀 Creating test employer account...\n');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');
    
    // Check if test employer already exists
    const existingEmployer = await User.findOne({ email: 'testemployer@example.com' });
    if (existingEmployer) {
      console.log('ℹ️ Test employer already exists');
      console.log(`📧 Email: ${existingEmployer.email}`);
      console.log(`🆔 ID: ${existingEmployer._id}`);
      console.log(`👤 Role: ${existingEmployer.role}`);
      await mongoose.disconnect();
      return;
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash('testpassword123', 10);
    
    // Create test employer
    const testEmployer = new User({
      name: 'Test Employer',
      email: 'testemployer@example.com',
      password: hashedPassword,
      role: 'employer',
      phone: '+1234567890'
    });
    
    await testEmployer.save();
    console.log('✅ Test employer created successfully');
    console.log(`📧 Email: ${testEmployer.email}`);
    console.log(`🔑 Password: testpassword123`);
    console.log(`🆔 ID: ${testEmployer._id}`);
    console.log(`👤 Role: ${testEmployer.role}`);
    
    console.log('\n💡 You can now use these credentials to test candidate search:');
    console.log('   Email: testemployer@example.com');
    console.log('   Password: testpassword123');
    
  } catch (error) {
    console.error('❌ Error creating test employer:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Disconnected from MongoDB');
  }
}

// Run if called directly
if (require.main === module) {
  createTestEmployer();
}

module.exports = createTestEmployer;





