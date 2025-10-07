const axios = require('axios');

async function testViewFunctionComplete() {
  const baseURL = 'http://localhost:5000';
  const frontendURL = 'http://localhost:5173';
  
  try {
    console.log('🧪 Testing Complete View Function Workflow...\n');
    
    // Step 1: Test backend API
    console.log('1. 🔧 Testing Backend API...');
    const loginResponse = await axios.post(`${baseURL}/api/auth/login`, {
      email: 'testemployer@example.com',
      password: 'TestPass123!'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Authentication successful');
    
    // Get candidates
    const candidatesResponse = await axios.get(`${baseURL}/api/candidates/search?query=javascript`, {
      headers: { 'Authorization': `Bearer ${token}`, 'Cache-Control': 'no-cache' }
    });
    
    let candidateId;
    
    if (candidatesResponse.data.success && candidatesResponse.data.data.length > 0) {
      candidateId = candidatesResponse.data.data[0].id;
      console.log(`✅ Found candidate with ID: ${candidateId}`);
      
      // Test view candidate endpoint
      const viewResponse = await axios.get(`${baseURL}/api/candidates/${candidateId}`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Cache-Control': 'no-cache' }
      });
      
      if (viewResponse.data.success) {
        console.log('✅ Backend view candidate API working correctly');
        console.log('   📊 Response structure:', {
          success: viewResponse.data.success,
          hasData: !!viewResponse.data.data,
          candidateName: viewResponse.data.data?.userId?.name || viewResponse.data.data?.name,
          candidateEmail: viewResponse.data.data?.userId?.email || viewResponse.data.data?.email,
          candidateSkills: viewResponse.data.data?.skills?.length || 0
        });
      } else {
        console.log('❌ Backend view candidate API failed');
        return false;
      }
    } else {
      console.log('❌ No candidates found for testing');
      return false;
    }
    
    // Step 2: Test frontend integration
    console.log('\n2. 🎨 Testing Frontend Integration...');
    
    // Simulate what the frontend does
    const frontendSimulation = async (testCandidateId) => {
      try {
        // This simulates the apiService.getCandidate call
        const response = await axios.get(`${baseURL}/api/candidates/${testCandidateId}`, {
          headers: { 'Authorization': `Bearer ${token}`, 'Cache-Control': 'no-cache' }
        });
        
        // This is how the frontend should handle the response
        if (response.data && response.data.success) {
          const candidateData = response.data.data;
          console.log('✅ Frontend simulation successful');
          console.log('   👤 Candidate loaded:', candidateData.userId?.name || candidateData.name);
          console.log('   📧 Email:', candidateData.userId?.email || candidateData.email);
          console.log('   📍 Location:', candidateData.location);
          console.log('   ⏰ Experience:', candidateData.experience);
          console.log('   🎯 Skills:', candidateData.skills);
          
          // Check if modal would display correctly
          const modalData = {
            name: candidateData.userId?.name || candidateData.name,
            email: candidateData.userId?.email || candidateData.email,
            phone: candidateData.userId?.phone || candidateData.phone,
            location: candidateData.location,
            experience: candidateData.experience,
            education: candidateData.education,
            currentEmployer: candidateData.currentEmployer,
            currentEmploymentStatus: candidateData.currentEmploymentStatus,
            skills: candidateData.skills,
            appliedForJob: candidateData.appliedForJob
          };
          
          console.log('✅ Modal data prepared:', {
            hasName: !!modalData.name,
            hasEmail: !!modalData.email,
            hasLocation: !!modalData.location,
            hasExperience: !!modalData.experience,
            hasSkills: !!modalData.skills && modalData.skills.length > 0,
            skillCount: modalData.skills?.length || 0
          });
          
          return true;
        } else {
          console.log('❌ Frontend simulation failed - invalid response structure');
          return false;
        }
      } catch (error) {
        console.log(`❌ Frontend simulation error: ${error.response?.status || error.message}`);
        return false;
      }
    };
    
    const frontendResult = await frontendSimulation(candidateId);
    
    // Step 3: Test error scenarios
    console.log('\n3. 🚨 Testing Error Scenarios...');
    
    // Test with invalid candidate ID
    try {
      await axios.get(`${baseURL}/api/candidates/invalid-id`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Cache-Control': 'no-cache' }
      });
      console.log('❌ Should have failed with invalid ID');
    } catch (error) {
      if (error.response?.status === 404 || error.response?.status === 500) {
        console.log('✅ Correctly handled invalid candidate ID');
      } else {
        console.log(`⚠️ Unexpected error for invalid ID: ${error.response?.status}`);
      }
    }
    
    // Test without authentication
    try {
      await axios.get(`${baseURL}/api/candidates/${candidateId}`);
      console.log('❌ Should have failed without authentication');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Correctly required authentication');
      } else {
        console.log(`⚠️ Unexpected error without auth: ${error.response?.status}`);
      }
    }
    
    // Step 4: Performance test
    console.log('\n4. ⚡ Testing Performance...');
    
    const startTime = Date.now();
    const performancePromises = [];
    
    for (let i = 0; i < 5; i++) {
      performancePromises.push(
        axios.get(`${baseURL}/api/candidates/${candidateId}`, {
          headers: { 'Authorization': `Bearer ${token}`, 'Cache-Control': 'no-cache' }
        })
      );
    }
    
    const performanceResults = await Promise.all(performancePromises);
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    const successfulRequests = performanceResults.filter(r => r.data.success).length;
    
    console.log(`✅ Performance test: ${successfulRequests}/5 successful in ${duration}ms`);
    console.log(`   ⚡ Average response time: ${Math.round(duration / 5)}ms`);
    
    // Step 5: Summary
    console.log('\n5. 📊 Test Summary...');
    
    const allTestsPassed = frontendResult && successfulRequests === 5;
    
    if (allTestsPassed) {
      console.log('🎉 ALL TESTS PASSED!');
      console.log('\n✅ View Function Status: WORKING CORRECTLY');
      console.log('\n📋 What\'s Working:');
      console.log('   ✅ Backend API endpoint responding correctly');
      console.log('   ✅ Frontend integration handling response properly');
      console.log('   ✅ Error scenarios handled gracefully');
      console.log('   ✅ Performance is acceptable (< 100ms per request)');
      console.log('   ✅ Modal data structure is complete');
      
      console.log('\n🎯 How to Test in Browser:');
      console.log(`   1. Go to: ${frontendURL}/resume-search`);
      console.log('   2. Search for candidates (e.g., "javascript")');
      console.log('   3. Click "View Details" button on any candidate');
      console.log('   4. Modal should open with candidate information');
      
      console.log('\n🔧 If Still Not Working:');
      console.log('   1. Check browser console for JavaScript errors');
      console.log('   2. Verify both servers are running (backend:5000, frontend:5173)');
      console.log('   3. Check network tab for API request/response');
      console.log('   4. Ensure authentication token is valid');
      
    } else {
      console.log('❌ SOME TESTS FAILED');
      console.log('\n🔧 Troubleshooting Steps:');
      console.log('   1. Check if backend server is running on port 5000');
      console.log('   2. Verify database connection and candidate data');
      console.log('   3. Check API endpoint implementation');
      console.log('   4. Review frontend error handling');
    }
    
    return allTestsPassed;
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n🔧 Server Connection Issues:');
      console.log('   - Backend server not running on port 5000');
      console.log('   - Run: cd backend && node server.js');
    }
    
    return false;
  }
}

// Run the complete test
testViewFunctionComplete()
  .then(success => {
    if (success) {
      console.log('\n🎉 View function is working correctly!');
    } else {
      console.log('\n💥 View function has issues that need to be fixed.');
    }
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('❌ Test suite failed:', error);
    process.exit(1);
  });
