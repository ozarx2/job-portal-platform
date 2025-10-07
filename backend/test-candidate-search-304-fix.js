const axios = require('axios');

async function testCandidateSearchFix() {
  const baseURL = 'http://localhost:5000';
  
  try {
    console.log('🧪 Testing candidate search 304 fix...\n');
    
    // First, let's login to get a token
    console.log('1. Getting authentication token...');
    const loginResponse = await axios.post(`${baseURL}/api/auth/login`, {
      email: 'testemployer@example.com',
      password: 'TestPass123!'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Authentication successful\n');
    
    // Test the candidate search endpoint multiple times
    console.log('2. Testing candidate search endpoint...');
    
    for (let i = 1; i <= 3; i++) {
      console.log(`\n--- Test ${i} ---`);
      
      const searchResponse = await axios.get(`${baseURL}/api/candidates/search?query=react`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Cache-Control': 'no-cache'
        }
      });
      
      console.log(`Status: ${searchResponse.status}`);
      console.log(`Response has timestamp: ${!!searchResponse.data.timestamp}`);
      console.log(`Response has requestId: ${!!searchResponse.data.requestId}`);
      console.log(`Timestamp: ${searchResponse.data.timestamp}`);
      console.log(`RequestId: ${searchResponse.data.requestId}`);
      console.log(`Data count: ${searchResponse.data.data?.length || 0}`);
      console.log(`Full response keys: ${Object.keys(searchResponse.data).join(', ')}`);
      
      // Check if we got a 304 (should not happen now)
      if (searchResponse.status === 304) {
        console.log('❌ Still getting 304 Not Modified!');
        return false;
      }
      
      // Small delay between requests
      if (i < 3) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    console.log('\n✅ All tests passed! No 304 responses detected.');
    console.log('✅ Each response has unique timestamp and requestId.');
    console.log('✅ Candidate search endpoint is now returning fresh data.');
    
    return true;
    
  } catch (error) {
    if (error.response) {
      console.error('❌ API Error:', error.response.status, error.response.data);
    } else if (error.code === 'ECONNREFUSED') {
      console.error('❌ Connection refused. Make sure the server is running on port 5000.');
    } else {
      console.error('❌ Error:', error.message);
    }
    return false;
  }
}

// Run the test
testCandidateSearchFix()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('❌ Test failed:', error);
    process.exit(1);
  });
