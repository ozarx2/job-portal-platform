const mongoose = require('mongoose');
require('dotenv').config();

async function fixUndefinedExperienceMongoDB() {
  console.log('🔧 Fixing Undefined Experience Values using MongoDB Native Operations\n');
  
  try {
    // Connect to MongoDB
    console.log('1️⃣ Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');
    
    const db = mongoose.connection.db;
    
    // Find applications with undefined experience using native MongoDB query
    console.log('\n2️⃣ Finding applications with undefined experience...');
    const appsWithUndefinedExperience = await db.collection('applications').find({
      $or: [
        { experience: { $exists: false } },
        { experience: null },
        { experience: 'undefined' },
        { experience: undefined }
      ]
    }).toArray();
    
    console.log(`📋 Found ${appsWithUndefinedExperience.length} applications with undefined experience`);
    
    // Fix undefined experience values using native MongoDB update
    console.log('\n3️⃣ Fixing undefined experience values...');
    if (appsWithUndefinedExperience.length > 0) {
      const result = await db.collection('applications').updateMany(
        {
          $or: [
            { experience: { $exists: false } },
            { experience: null },
            { experience: 'undefined' },
            { experience: undefined }
          ]
        },
        { $set: { experience: 0 } }
      );
      
      console.log(`   ✅ Updated ${result.modifiedCount} applications: undefined → 0`);
    }
    
    // Also fix any remaining string values
    console.log('\n4️⃣ Fixing remaining string experience values...');
    const appsWithStringExperience = await db.collection('applications').find({
      experience: { $type: 'string' }
    }).toArray();
    
    console.log(`📋 Found ${appsWithStringExperience.length} applications with string experience`);
    
    for (const app of appsWithStringExperience) {
      try {
        const numericValue = parseInt(app.experience);
        if (!isNaN(numericValue)) {
          await db.collection('applications').updateOne(
            { _id: app._id },
            { $set: { experience: numericValue } }
          );
          console.log(`   ✅ Updated application ${app._id}: "${app.experience}" → ${numericValue}`);
        } else {
          // Set invalid string values to 0
          await db.collection('applications').updateOne(
            { _id: app._id },
            { $set: { experience: 0 } }
          );
          console.log(`   ✅ Updated application ${app._id}: "${app.experience}" → 0`);
        }
      } catch (error) {
        console.log(`   ❌ Failed to update application ${app._id}: ${error.message}`);
      }
    }
    
    // Verify the fix
    console.log('\n5️⃣ Verifying the fix...');
    const remainingUndefinedApps = await db.collection('applications').find({
      $or: [
        { experience: { $exists: false } },
        { experience: null },
        { experience: 'undefined' },
        { experience: undefined }
      ]
    }).toArray();
    
    const remainingStringApps = await db.collection('applications').find({
      experience: { $type: 'string' }
    }).toArray();
    
    console.log(`📊 Remaining undefined experience applications: ${remainingUndefinedApps.length}`);
    console.log(`📊 Remaining string experience applications: ${remainingStringApps.length}`);
    
    // Show final statistics
    const totalApps = await db.collection('applications').countDocuments();
    const numericApps = await db.collection('applications').countDocuments({ experience: { $type: 'number' } });
    
    console.log('\n📊 Final Statistics:');
    console.log(`   Total applications: ${totalApps}`);
    console.log(`   Numeric experience: ${numericApps}`);
    console.log(`   Undefined experience: ${remainingUndefinedApps.length}`);
    console.log(`   String experience: ${remainingStringApps.length}`);
    
    console.log('\n🎉 Undefined experience fix completed!');
    
  } catch (error) {
    console.error('\n❌ Fix failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run the fix
fixUndefinedExperienceMongoDB();






