const mongoose = require('mongoose');
require('dotenv').config();

const Job = require('./models/Job');

async function checkJobFilters() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');
    
    // Check all jobs in database
    const allJobs = await Job.find({});
    console.log('📊 Total jobs in database:', allJobs.length);
    
    // Check jobs with status 'active'
    const activeJobs = await Job.find({ status: 'active' });
    console.log('📊 Active jobs in database:', activeJobs.length);
    
    // Check suneera's jobs
    const suneeraJobs = await Job.find({ postedBy: '685e61377289e0782b7a75ec' });
    console.log('📊 Suneera jobs in database:', suneeraJobs.length);
    
    // Check suneera's active jobs
    const suneeraActiveJobs = await Job.find({ 
      postedBy: '685e61377289e0782b7a75ec',
      status: 'active' 
    });
    console.log('📊 Suneera active jobs in database:', suneeraActiveJobs.length);
    
    // Show all suneera's jobs
    console.log('\n📝 All suneera jobs:');
    suneeraJobs.forEach((job, index) => {
      console.log(`${index + 1}. ${job.title} - Status: ${job.status}`);
      console.log(`   Posted: ${job.createdAt}`);
    });
    
    // Show active suneera jobs
    console.log('\n📝 Active suneera jobs:');
    suneeraActiveJobs.forEach((job, index) => {
      console.log(`${index + 1}. ${job.title} - Status: ${job.status}`);
      console.log(`   Posted: ${job.createdAt}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

checkJobFilters();











