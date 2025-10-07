const axios = require('axios');

async function testSuneeraJobs() {
  try {
    console.log('🧪 Testing suneera@gmail.com jobs visibility in frontend...');
    
    // First, let's login as suneera to get a token
    console.log('🔑 Attempting login for suneera@gmail.com...');
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'suneera@gmail.com',
      password: 'password123' // You might need to adjust this password
    });
    
    if (loginResponse.data.token) {
      console.log('✅ Login successful, token received');
      const token = loginResponse.data.token;
      
      // Test the employer jobs endpoint
      console.log('📋 Testing employer jobs endpoint...');
      const jobsResponse = await axios.get('http://localhost:5000/api/jobs/employer', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('✅ Employer jobs endpoint response:');
      console.log('📊 Jobs found:', jobsResponse.data.data.length);
      
      if (jobsResponse.data.data.length > 0) {
        console.log('📝 Job details:');
        jobsResponse.data.data.forEach((job, index) => {
          console.log(`${index + 1}. ${job.title} - ${job.company || 'No company'} - ${job.location}`);
          console.log(`   Status: ${job.status}`);
          console.log('---');
        });
      }
      
      // Test the generic jobs endpoint with filtering
      console.log('\n🔍 Testing generic jobs endpoint...');
      const allJobsResponse = await axios.get('http://localhost:5000/api/jobs');
      
      const suneeraJobs = allJobsResponse.data.data.filter(job => 
        job.postedBy === '685e61377289e0782b7a75ec' || 
        job.postedBy?._id === '685e61377289e0782b7a75ec'
      );
      
      console.log('📊 Suneera jobs found in generic endpoint:', suneeraJobs.length);
      
    } else {
      console.log('❌ Login failed - no token received');
    }
    
  } catch (error) {
    if (error.response?.status === 400) {
      console.log('❌ Login failed - invalid credentials. Trying with different password...');
      
      // Try with a common password
      try {
        const loginResponse2 = await axios.post('http://localhost:5000/api/auth/login', {
          email: 'suneera@gmail.com',
          password: '123456'
        });
        
        if (loginResponse2.data.token) {
          console.log('✅ Login successful with alternative password');
          const token = loginResponse2.data.token;
          
          // Test the employer jobs endpoint
          console.log('📋 Testing employer jobs endpoint...');
          const jobsResponse = await axios.get('http://localhost:5000/api/jobs/employer', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          console.log('✅ Employer jobs endpoint response:');
          console.log('📊 Jobs found:', jobsResponse.data.data.length);
          
          if (jobsResponse.data.data.length > 0) {
            console.log('📝 Job details:');
            jobsResponse.data.data.forEach((job, index) => {
              console.log(`${index + 1}. ${job.title} - ${job.company || 'No company'} - ${job.location}`);
              console.log(`   Status: ${job.status}`);
              console.log('---');
            });
          }
        }
      } catch (error2) {
        console.log('❌ Login failed with alternative password too');
        console.log('🔍 Testing without authentication...');
        
        // Test the generic jobs endpoint to see if suneera's jobs are there
        const allJobsResponse = await axios.get('http://localhost:5000/api/jobs');
        const suneeraJobs = allJobsResponse.data.data.filter(job => 
          job.postedBy === '685e61377289e0782b7a75ec' || 
          job.postedBy?._id === '685e61377289e0782b7a75ec'
        );
        
        console.log('📊 Suneera jobs found in generic endpoint (no auth):', suneeraJobs.length);
        if (suneeraJobs.length > 0) {
          console.log('📝 Job details:');
          suneeraJobs.forEach((job, index) => {
            console.log(`${index + 1}. ${job.title} - ${job.company || 'No company'} - ${job.location}`);
            console.log(`   Status: ${job.status}`);
            console.log('---');
          });
        }
      }
    } else {
      console.error('❌ Error:', error.message);
    }
  }
}

testSuneeraJobs();











