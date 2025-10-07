const axios = require('axios');

async function testViewCandidateFunction() {
  const baseURL = 'http://localhost:5000';
  
  try {
    console.log('🧪 Testing View Candidate Function...\n');
    
    // Step 1: Authentication
    console.log('1. Authenticating...');
    const loginResponse = await axios.post(`${baseURL}/api/auth/login`, {
      email: 'testemployer@example.com',
      password: 'TestPass123!'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Authentication successful');
    
    // Step 2: Get candidate list first
    console.log('\n2. Getting candidate list...');
    const candidatesResponse = await axios.get(`${baseURL}/api/candidates/search?query=javascript`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Cache-Control': 'no-cache'
      }
    });
    
    if (candidatesResponse.data.success && candidatesResponse.data.data.length > 0) {
      const candidateId = candidatesResponse.data.data[0].id;
      console.log(`✅ Found candidate with ID: ${candidateId}`);
      
      // Step 3: Test view candidate details
      console.log('\n3. Testing view candidate details...');
      try {
        const candidateDetailsResponse = await axios.get(`${baseURL}/api/candidates/${candidateId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Cache-Control': 'no-cache'
          }
        });
        
        console.log('✅ Candidate details response:', {
          success: candidateDetailsResponse.data.success,
          hasData: !!candidateDetailsResponse.data.data,
          candidateName: candidateDetailsResponse.data.data?.userId?.name || candidateDetailsResponse.data.data?.name,
          candidateEmail: candidateDetailsResponse.data.data?.userId?.email || candidateDetailsResponse.data.data?.email,
          candidateSkills: candidateDetailsResponse.data.data?.skills,
          candidateLocation: candidateDetailsResponse.data.data?.location,
          candidateExperience: candidateDetailsResponse.data.data?.experience
        });
        
        // Test the exact structure the frontend expects
        console.log('\n4. Testing frontend-compatible response...');
        const frontendCompatibleResponse = {
          success: candidateDetailsResponse.data.success,
          data: candidateDetailsResponse.data.data
        };
        
        console.log('✅ Frontend-compatible response structure:');
        console.log('   - success:', frontendCompatibleResponse.success);
        console.log('   - data exists:', !!frontendCompatibleResponse.data);
        
        if (frontendCompatibleResponse.data) {
          console.log('   - candidate name:', frontendCompatibleResponse.data.userId?.name || frontendCompatibleResponse.data.name);
          console.log('   - candidate email:', frontendCompatibleResponse.data.userId?.email || frontendCompatibleResponse.data.email);
          console.log('   - candidate skills:', frontendCompatibleResponse.data.skills);
          console.log('   - candidate location:', frontendCompatibleResponse.data.location);
          console.log('   - candidate experience:', frontendCompatibleResponse.data.experience);
        }
        
      } catch (error) {
        console.log(`❌ Error getting candidate details: ${error.response?.status} - ${error.response?.data?.message || error.message}`);
        
        if (error.response?.data) {
          console.log('   Response data:', error.response.data);
        }
      }
      
    } else {
      console.log('❌ No candidates found to test with');
    }
    
    // Step 4: Test with invalid candidate ID
    console.log('\n5. Testing with invalid candidate ID...');
    try {
      const invalidResponse = await axios.get(`${baseURL}/api/candidates/invalid-id`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Cache-Control': 'no-cache'
        }
      });
      
      console.log('❌ Should have failed with invalid ID');
    } catch (error) {
      if (error.response?.status === 404) {
        console.log('✅ Correctly returned 404 for invalid candidate ID');
      } else {
        console.log(`❌ Unexpected error: ${error.response?.status} - ${error.response?.data?.message || error.message}`);
      }
    }
    
    console.log('\n✅ View candidate function testing complete!');
    
  } catch (error) {
    if (error.response) {
      console.error('❌ API Error:', error.response.status, error.response.data);
    } else if (error.code === 'ECONNREFUSED') {
      console.error('❌ Connection refused. Make sure the server is running on port 5000.');
    } else {
      console.error('❌ Error:', error.message);
    }
  }
}

// Run the test
testViewCandidateFunction()
  .then(() => {
    console.log('\n🎉 View candidate function test complete!');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Test failed:', error);
    process.exit(1);
  });




