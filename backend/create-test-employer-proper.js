#!/usr/bin/env node

/**
 * Create Test Employer Account with Proper Password
 * Creates a test employer account with a password that meets validation requirements
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

async function createTestEmployerProper() {
  try {
    console.log('🚀 Creating test employer account with proper password...\n');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');
    
    // Delete existing test employer if exists
    await User.deleteOne({ email: 'testemployer@example.com' });
    console.log('🗑️ Removed existing test employer');
    
    // Hash password that meets validation requirements
    const hashedPassword = await bcrypt.hash('TestPass123!', 10);
    
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
    console.log(`🔑 Password: TestPass123!`);
    console.log(`🆔 ID: ${testEmployer._id}`);
    console.log(`👤 Role: ${testEmployer.role}`);
    
    console.log('\n💡 You can now use these credentials to test candidate search:');
    console.log('   Email: testemployer@example.com');
    console.log('   Password: TestPass123!');
    
  } catch (error) {
    console.error('❌ Error creating test employer:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Disconnected from MongoDB');
  }
}

// Run if called directly
if (require.main === module) {
  createTestEmployerProper();
}

module.exports = createTestEmployerProper;





