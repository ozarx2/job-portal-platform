const axios = require('axios');

async function debugResumeSearch() {
  const baseURL = 'http://localhost:5000';
  
  try {
    console.log('🔍 Debugging Resume Search Issues...\n');
    
    // Step 1: Check if server is running
    console.log('1. Checking if backend server is running...');
    try {
      const healthResponse = await axios.get(`${baseURL}/health`);
      console.log('✅ Backend server is running:', healthResponse.status);
    } catch (error) {
      console.log('❌ Backend server not responding:', error.message);
      return;
    }
    
    // Step 2: Test authentication
    console.log('\n2. Testing authentication...');
    let token;
    try {
      const loginResponse = await axios.post(`${baseURL}/api/auth/login`, {
        email: 'testemployer@example.com',
        password: 'TestPass123!'
      });
      token = loginResponse.data.token;
      console.log('✅ Authentication successful');
    } catch (error) {
      console.log('❌ Authentication failed:', error.response?.data || error.message);
      
      // Try to create test employer if it doesn't exist
      console.log('\n🔧 Creating test employer...');
      try {
        const { exec } = require('child_process');
        exec('node create-test-employer-proper.js', (error, stdout, stderr) => {
          if (error) {
            console.log('❌ Failed to create test employer:', error);
          } else {
            console.log('✅ Test employer created');
          }
        });
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Try login again
        const retryLogin = await axios.post(`${baseURL}/api/auth/login`, {
          email: 'testemployer@example.com',
          password: 'TestPass123!'
        });
        token = retryLogin.data.token;
        console.log('✅ Authentication successful after creating employer');
      } catch (retryError) {
        console.log('❌ Still failed to authenticate:', retryError.response?.data || retryError.message);
        return;
      }
    }
    
    // Step 3: Test candidate search with different approaches
    console.log('\n3. Testing candidate search API...');
    
    const testSearches = [
      { name: 'Empty search', params: {} },
      { name: 'Query only', params: { query: 'test' } },
      { name: 'Skills only', params: { skills: 'react' } },
      { name: 'Location only', params: { location: 'bangalore' } },
      { name: 'Experience only', params: { experience: '2-3 years' } },
      { name: 'Multiple params', params: { query: 'developer', location: 'bangalore' } }
    ];
    
    for (const test of testSearches) {
      try {
        console.log(`\n🔍 Testing: ${test.name}`);
        const response = await axios.get(`${baseURL}/api/candidates/search`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Cache-Control': 'no-cache'
          },
          params: test.params
        });
        
        console.log(`   Status: ${response.status}`);
        console.log(`   Success: ${response.data.success}`);
        console.log(`   Data count: ${response.data.data?.length || 0}`);
        console.log(`   Total candidates: ${response.data.pagination?.totalCandidates || 0}`);
        
        if (response.data.data && response.data.data.length > 0) {
          console.log(`   Sample candidate:`, {
            name: response.data.data[0].name || response.data.data[0].userId?.name,
            email: response.data.data[0].email || response.data.data[0].userId?.email,
            skills: response.data.data[0].skills
          });
        }
        
      } catch (error) {
        console.log(`   ❌ Error: ${error.response?.status} - ${error.response?.data?.message || error.message}`);
      }
    }
    
    // Step 4: Check database directly
    console.log('\n4. Checking database directly...');
    try {
      const { MongoClient } = require('mongodb');
      require('dotenv').config();
      
      const client = new MongoClient(process.env.MONGO_URI);
      await client.connect();
      
      const db = client.db();
      const candidatesCollection = db.collection('candidateprofiles');
      const usersCollection = db.collection('users');
      
      const totalCandidates = await candidatesCollection.countDocuments();
      const totalUsers = await usersCollection.countDocuments();
      const candidateUsers = await usersCollection.countDocuments({ role: 'candidate' });
      
      console.log(`   Total candidate profiles: ${totalCandidates}`);
      console.log(`   Total users: ${totalUsers}`);
      console.log(`   Users with candidate role: ${candidateUsers}`);
      
      if (totalCandidates > 0) {
        const sampleCandidate = await candidatesCollection.findOne();
        console.log(`   Sample candidate profile:`, {
          id: sampleCandidate._id,
          userId: sampleCandidate.userId,
          skills: sampleCandidate.skills,
          location: sampleCandidate.location,
          experience: sampleCandidate.experience
        });
      }
      
      await client.close();
      
    } catch (dbError) {
      console.log(`   ❌ Database check failed: ${dbError.message}`);
    }
    
    // Step 5: Test frontend API call simulation
    console.log('\n5. Simulating frontend API call...');
    try {
      const frontendCall = await axios.get(`${baseURL}/api/candidates/search?query=react`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Cache-Control': 'no-cache',
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      console.log(`   ✅ Frontend simulation successful`);
      console.log(`   Response structure:`, {
        success: frontendCall.data.success,
        hasData: !!frontendCall.data.data,
        dataLength: frontendCall.data.data?.length || 0,
        hasPagination: !!frontendCall.data.pagination,
        hasTimestamp: !!frontendCall.data.timestamp,
        hasRequestId: !!frontendCall.data.requestId
      });
      
    } catch (error) {
      console.log(`   ❌ Frontend simulation failed: ${error.response?.status} - ${error.response?.data?.message || error.message}`);
    }
    
    console.log('\n✅ Debug complete!');
    
  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  }
}

// Run the debug
debugResumeSearch()
  .then(() => {
    console.log('\n🎯 Recommendations:');
    console.log('   1. Check if MongoDB is running and connected');
    console.log('   2. Verify there are candidate profiles in the database');
    console.log('   3. Check if the frontend is making requests to the correct URL');
    console.log('   4. Verify authentication token is being sent correctly');
    console.log('   5. Check browser console for any JavaScript errors');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Debug script failed:', error);
    process.exit(1);
  });




