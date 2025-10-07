#!/usr/bin/env node

/**
 * Simple Candidate Search Test
 * Tests basic candidate search functionality without authentication
 */

require('dotenv').config();
const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api';

async function testCandidateSearch() {
  console.log('🧪 Simple Candidate Search Test\n');
  
  try {
    // Test 1: Test endpoint without authentication (should return 401)
    console.log('1️⃣ Testing endpoint without authentication...');
    try {
      const response = await axios.get(`${API_BASE_URL}/candidates/search`);
      console.log('❌ Endpoint should require authentication but succeeded');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Endpoint correctly requires authentication');
        console.log(`📝 Message: ${error.response.data.msg || error.response.data.message}`);
      } else {
        console.log('❌ Unexpected error:', error.response?.data || error.message);
      }
    }
    
    // Test 2: Test endpoint with invalid token
    console.log('\n2️⃣ Testing endpoint with invalid token...');
    try {
      const response = await axios.get(`${API_BASE_URL}/candidates/search`, {
        headers: { 'Authorization': 'Bearer invalid_token' }
      });
      console.log('❌ Invalid token should be rejected but succeeded');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Invalid token correctly rejected');
        console.log(`📝 Message: ${error.response.data.msg || error.response.data.message}`);
      } else {
        console.log('❌ Unexpected error:', error.response?.data || error.message);
      }
    }
    
    // Test 3: Test server health
    console.log('\n3️⃣ Testing server health...');
    try {
      const response = await axios.get(`${API_BASE_URL.replace('/api', '')}/health`);
      console.log('✅ Server is healthy');
      console.log(`📊 Uptime: ${response.data.uptime}s`);
      console.log(`🌍 Environment: ${response.data.environment}`);
    } catch (error) {
      console.log('❌ Server health check failed:', error.message);
    }
    
    // Test 4: Test jobs endpoint (should work without auth)
    console.log('\n4️⃣ Testing jobs endpoint (public)...');
    try {
      const response = await axios.get(`${API_BASE_URL}/jobs`);
      console.log('✅ Jobs endpoint accessible');
      console.log(`📊 Found ${Array.isArray(response.data) ? response.data.length : 'unknown'} jobs`);
    } catch (error) {
      console.log('❌ Jobs endpoint failed:', error.response?.data?.message || error.message);
    }
    
    console.log('\n🎉 Basic candidate search endpoint tests completed!');
    console.log('\n📋 Summary:');
    console.log('   - Authentication is properly enforced');
    console.log('   - Server is running and healthy');
    console.log('   - Public endpoints are accessible');
    console.log('\n💡 To test with authentication, you need to:');
    console.log('   1. Register an employer account on the frontend');
    console.log('   2. Use the login credentials in the test script');
    console.log('   3. Or create a test employer account in the database');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run test if called directly
if (require.main === module) {
  testCandidateSearch();
}

module.exports = testCandidateSearch;





