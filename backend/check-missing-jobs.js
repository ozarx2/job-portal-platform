const mongoose = require('mongoose');
require('dotenv').config();

const Job = require('./models/Job');

async function checkMissingJobs() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');
    
    const suneeraUserId = '685e61377289e0782b7a75ec';
    
    // Get all suneera's jobs
    const allSuneeraJobs = await Job.find({ postedBy: suneeraUserId });
    console.log(`📊 All suneera jobs in database: ${allSuneeraJobs.length}`);
    
    // Check each job's status
    console.log('\n📝 All suneera jobs:');
    allSuneeraJobs.forEach((job, index) => {
      console.log(`${index + 1}. ${job.title}`);
      console.log(`   Status: "${job.status}"`);
      console.log(`   Company: "${job.company}"`);
      console.log(`   Location: "${job.location}"`);
      console.log(`   Created: ${job.createdAt}`);
      console.log('---');
    });
    
    // Check which jobs have status 'active'
    const activeJobs = await Job.find({ 
      postedBy: suneeraUserId,
      status: 'active' 
    });
    console.log(`📊 Active suneera jobs: ${activeJobs.length}`);
    
    // Check all jobs with status 'active' in the database
    const allActiveJobs = await Job.find({ status: 'active' });
    console.log(`📊 All active jobs in database: ${allActiveJobs.length}`);
    
    console.log('\n📝 All active jobs:');
    allActiveJobs.forEach((job, index) => {
      console.log(`${index + 1}. ${job.title}`);
      console.log(`   PostedBy: ${job.postedBy}`);
      console.log(`   Status: "${job.status}"`);
      console.log(`   Company: "${job.company}"`);
      console.log('---');
    });
    
    // Check if there are any hidden characters or encoding issues in status field
    console.log('\n🔍 Checking status field encoding:');
    allSuneeraJobs.forEach((job, index) => {
      const status = job.status;
      console.log(`Job ${index + 1}: "${status}"`);
      console.log(`  Length: ${status.length}`);
      console.log(`  Char codes: [${status.split('').map(c => c.charCodeAt(0)).join(', ')}]`);
      console.log(`  === 'active': ${status === 'active'}`);
    });
    
    // Try to update the company field for suneera's jobs
    console.log('\n🔧 Fixing company field for suneera jobs...');
    const updateResult = await Job.updateMany(
      { postedBy: suneeraUserId },
      { $set: { company: 'Suneera Company' } }
    );
    console.log(`✅ Updated ${updateResult.modifiedCount} jobs with company name`);
    
    // Check the updated jobs
    const updatedJobs = await Job.find({ postedBy: suneeraUserId });
    console.log('\n📝 Updated jobs:');
    updatedJobs.forEach((job, index) => {
      console.log(`${index + 1}. ${job.title} - Company: "${job.company}"`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

checkMissingJobs();









