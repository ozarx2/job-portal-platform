const mongoose = require('mongoose');
require('dotenv').config();

const Job = require('./models/Job');

async function checkStatusValues() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');
    
    // Get suneera's user ID
    const suneeraUserId = '685e61377289e0782b7a75ec';
    
    // Get all suneera's jobs
    const suneeraJobs = await Job.find({ postedBy: suneeraUserId });
    
    console.log('📊 Suneera jobs and their status values:');
    suneeraJobs.forEach((job, index) => {
      console.log(`${index + 1}. ${job.title}`);
      console.log(`   Status: "${job.status}"`);
      console.log(`   Status type: ${typeof job.status}`);
      console.log(`   Status length: ${job.status ? job.status.length : 'null'}`);
      console.log(`   Status === 'active': ${job.status === 'active'}`);
      console.log('---');
    });
    
    // Check what status values exist in the database
    console.log('\n🔍 All unique status values in database:');
    const allJobs = await Job.find({});
    const uniqueStatuses = [...new Set(allJobs.map(job => job.status))];
    uniqueStatuses.forEach(status => {
      const count = allJobs.filter(job => job.status === status).length;
      console.log(`"${status}" (${count} jobs)`);
    });
    
    // Test the exact query used in the API
    console.log('\n🧪 Testing API query:');
    const apiQueryJobs = await Job.find({ status: 'active' });
    console.log(`Jobs with status 'active': ${apiQueryJobs.length}`);
    
    apiQueryJobs.forEach((job, index) => {
      console.log(`${index + 1}. ${job.title} - Status: "${job.status}"`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

checkStatusValues();











