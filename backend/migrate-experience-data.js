const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const User = require('./models/User');
const Application = require('./models/Application');

async function migrateExperienceData() {
  console.log('🔄 Migrating Experience Data to Integer Format\n');
  
  try {
    // Connect to MongoDB
    console.log('1️⃣ Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');
    
    // Migrate User experience fields
    console.log('\n2️⃣ Migrating User experience fields...');
    const usersWithStringExperience = await User.find({
      experience: { $type: 'string' }
    });
    
    console.log(`📋 Found ${usersWithStringExperience.length} users with string experience`);
    
    for (const user of usersWithStringExperience) {
      try {
        const numericExperience = parseInt(user.experience);
        if (!isNaN(numericExperience)) {
          await User.findByIdAndUpdate(user._id, { experience: numericExperience });
          console.log(`   ✅ Updated user ${user.name}: "${user.experience}" → ${numericExperience}`);
        } else {
          console.log(`   ⚠️ Skipped user ${user.name}: invalid experience value "${user.experience}"`);
        }
      } catch (error) {
        console.log(`   ❌ Failed to update user ${user.name}: ${error.message}`);
      }
    }
    
    // Migrate Application experience fields
    console.log('\n3️⃣ Migrating Application experience fields...');
    const applicationsWithStringExperience = await Application.find({
      experience: { $type: 'string' }
    });
    
    console.log(`📋 Found ${applicationsWithStringExperience.length} applications with string experience`);
    
    for (const app of applicationsWithStringExperience) {
      try {
        const numericExperience = parseInt(app.experience);
        if (!isNaN(numericExperience)) {
          await Application.findByIdAndUpdate(app._id, { experience: numericExperience });
          console.log(`   ✅ Updated application ${app._id}: "${app.experience}" → ${numericExperience}`);
        } else {
          console.log(`   ⚠️ Skipped application ${app._id}: invalid experience value "${app.experience}"`);
        }
      } catch (error) {
        console.log(`   ❌ Failed to update application ${app._id}: ${error.message}`);
      }
    }
    
    // Verify migration
    console.log('\n4️⃣ Verifying migration results...');
    
    const remainingStringUsers = await User.find({ experience: { $type: 'string' } });
    const remainingStringApps = await Application.find({ experience: { $type: 'string' } });
    
    console.log(`📊 Remaining string experience users: ${remainingStringUsers.length}`);
    console.log(`📊 Remaining string experience applications: ${remainingStringApps.length}`);
    
    // Show some examples of numeric experience
    const numericUsers = await User.find({ experience: { $type: 'number' } }).limit(3);
    const numericApps = await Application.find({ experience: { $type: 'number' } }).limit(3);
    
    console.log('\n📋 Examples of numeric experience data:');
    console.log('   Users:', numericUsers.map(u => ({ name: u.name, experience: u.experience, type: typeof u.experience })));
    console.log('   Applications:', numericApps.map(a => ({ id: a._id, experience: a.experience, type: typeof a.experience })));
    
    console.log('\n🎉 Migration completed successfully!');
    console.log('\n📋 Summary:');
    console.log(`   ✅ Migrated ${usersWithStringExperience.length} user experience fields`);
    console.log(`   ✅ Migrated ${applicationsWithStringExperience.length} application experience fields`);
    console.log(`   ✅ ${remainingStringUsers.length} users still have string experience`);
    console.log(`   ✅ ${remainingStringApps.length} applications still have string experience`);
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run the migration
migrateExperienceData();






