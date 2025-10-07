const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Application = require('./models/Application');

async function fixUndefinedExperience() {
  console.log('🔧 Fixing Undefined Experience Values\n');
  
  try {
    // Connect to MongoDB
    console.log('1️⃣ Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');
    
    // Find applications with undefined experience
    console.log('\n2️⃣ Finding applications with undefined experience...');
    const appsWithUndefinedExperience = await Application.find({
      $or: [
        { experience: undefined },
        { experience: null },
        { experience: 'undefined' }
      ]
    });
    
    console.log(`📋 Found ${appsWithUndefinedExperience.length} applications with undefined experience`);
    
    // Fix undefined experience values
    console.log('\n3️⃣ Fixing undefined experience values...');
    for (const app of appsWithUndefinedExperience) {
      try {
        await Application.findByIdAndUpdate(app._id, { experience: 0 });
        console.log(`   ✅ Updated application ${app._id}: undefined → 0`);
      } catch (error) {
        console.log(`   ❌ Failed to update application ${app._id}: ${error.message}`);
      }
    }
    
    // Verify the fix
    console.log('\n4️⃣ Verifying the fix...');
    const remainingUndefinedApps = await Application.find({
      $or: [
        { experience: undefined },
        { experience: null },
        { experience: 'undefined' }
      ]
    });
    
    console.log(`📊 Remaining undefined experience applications: ${remainingUndefinedApps.length}`);
    
    // Show final statistics
    const totalApps = await Application.countDocuments();
    const numericApps = await Application.countDocuments({ experience: { $type: 'number' } });
    const stringApps = await Application.countDocuments({ experience: { $type: 'string' } });
    
    console.log('\n📊 Final Statistics:');
    console.log(`   Total applications: ${totalApps}`);
    console.log(`   Numeric experience: ${numericApps}`);
    console.log(`   String experience: ${stringApps}`);
    console.log(`   Undefined experience: ${remainingUndefinedApps.length}`);
    
    console.log('\n🎉 Undefined experience fix completed!');
    
  } catch (error) {
    console.error('\n❌ Fix failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run the fix
fixUndefinedExperience();






