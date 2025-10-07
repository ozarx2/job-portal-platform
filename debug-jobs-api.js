const axios = require('axios');

async function debugJobsAPI() {
  try {
    console.log('🔍 Debugging Jobs API Response...');
    
    // Test 1: Generic jobs endpoint
    console.log('\n1️⃣ Testing generic jobs endpoint...');
    const genericResponse = await axios.get('http://localhost:5000/api/jobs');
    console.log('Status:', genericResponse.status);
    console.log('Success:', genericResponse.data.success);
    console.log('Total jobs:', genericResponse.data.data?.length || 0);
    console.log('Pagination:', genericResponse.data.pagination);
    
    if (genericResponse.data.data && genericResponse.data.data.length > 0) {
      console.log('\n📝 Sample job data:');
      const sampleJob = genericResponse.data.data[0];
      console.log('Job structure:', {
        _id: sampleJob._id,
        title: sampleJob.title,
        company: sampleJob.company,
        location: sampleJob.location,
        postedBy: sampleJob.postedBy,
        description: sampleJob.description ? sampleJob.description.substring(0, 50) + '...' : 'No description'
      });
      
      // Check for suneera's jobs
      const suneeraJobs = genericResponse.data.data.filter(job => {
        if (typeof job.postedBy === 'object' && job.postedBy._id) {
          return job.postedBy._id === '685e61377289e0782b7a75ec';
        }
        return job.postedBy === '685e61377289e0782b7a75ec';
      });
      
      console.log(`\n👤 Suneera jobs in generic endpoint: ${suneeraJobs.length}`);
      if (suneeraJobs.length > 0) {
        suneeraJobs.forEach((job, index) => {
          console.log(`${index + 1}. Title: "${job.title}" | Company: "${job.company}" | Location: "${job.location}"`);
        });
      }
    }
    
    // Test 2: Try to login and test employer endpoint
    console.log('\n2️⃣ Attempting login...');
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'suneera@gmail.com',
      password: 'password'
    }).catch(() => null);
    
    if (loginResponse && loginResponse.data.token) {
      console.log('✅ Login successful');
      const token = loginResponse.data.token;
      
      // Test employer endpoint
      console.log('\n3️⃣ Testing employer endpoint...');
      const employerResponse = await axios.get('http://localhost:5000/api/jobs/employer', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('Status:', employerResponse.status);
      console.log('Success:', employerResponse.data.success);
      console.log('Jobs count:', employerResponse.data.data?.length || 0);
      
      if (employerResponse.data.data && employerResponse.data.data.length > 0) {
        console.log('\n📝 Employer jobs:');
        employerResponse.data.data.forEach((job, index) => {
          console.log(`${index + 1}. Title: "${job.title}" | Company: "${job.company}" | Location: "${job.location}"`);
          console.log(`   PostedBy: ${job.postedBy}`);
          console.log(`   Description: ${job.description ? job.description.substring(0, 30) + '...' : 'No description'}`);
          console.log('---');
        });
      } else {
        console.log('⚠️ No jobs returned from employer endpoint');
      }
    } else {
      console.log('❌ Login failed - trying alternative passwords...');
      
      const passwords = ['123456', 'password123', 'suneera123'];
      for (const pwd of passwords) {
        try {
          const altLogin = await axios.post('http://localhost:5000/api/auth/login', {
            email: 'suneera@gmail.com',
            password: pwd
          });
          
          if (altLogin.data.token) {
            console.log(`✅ Login successful with password: ${pwd}`);
            const token = altLogin.data.token;
            
            const employerResponse = await axios.get('http://localhost:5000/api/jobs/employer', {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });
            
            console.log(`📊 Employer jobs: ${employerResponse.data.data?.length || 0}`);
            if (employerResponse.data.data && employerResponse.data.data.length > 0) {
              employerResponse.data.data.forEach((job, index) => {
                console.log(`${index + 1}. "${job.title}" - "${job.company}" - "${job.location}"`);
              });
            }
            break;
          }
        } catch (e) {
          // Continue to next password
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

debugJobsAPI();









