#!/usr/bin/env node

/**
 * Comprehensive Candidate Search Test
 * Tests all aspects of the candidate search functionality
 */

require('dotenv').config();
const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api';

async function testCandidateSearch() {
  console.log('🧪 Comprehensive Candidate Search Test\n');
  
  let authToken = null;
  
  try {
    // Step 1: Login as an employer
    console.log('1️⃣ Logging in as employer...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'airahzarin@gmail.com', // Use the employer account from logs
      password: 'Kalanthode*123'
    });
    
    if (!loginResponse.data.success) {
      console.log('❌ Login failed. Please check credentials.');
      return;
    }
    
    authToken = loginResponse.data.token;
    console.log('✅ Login successful');
    
    // Test 1: Basic search with query
    console.log('\n2️⃣ Testing basic candidate search with query...');
    await testBasicSearch(authToken);
    
    // Test 2: Search with location filter
    console.log('\n3️⃣ Testing search with location filter...');
    await testLocationSearch(authToken);
    
    // Test 3: Search with skills filter
    console.log('\n4️⃣ Testing search with skills filter...');
    await testSkillsSearch(authToken);
    
    // Test 4: Search with experience filter
    console.log('\n5️⃣ Testing search with experience filter...');
    await testExperienceSearch(authToken);
    
    // Test 5: Combined filters
    console.log('\n6️⃣ Testing search with combined filters...');
    await testCombinedSearch(authToken);
    
    // Test 6: Empty search (should return error)
    console.log('\n7️⃣ Testing empty search (should return error)...');
    await testEmptySearch(authToken);
    
    // Test 7: Special characters in search
    console.log('\n8️⃣ Testing special characters in search...');
    await testSpecialCharacters(authToken);
    
    console.log('\n🎉 All candidate search tests completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

async function testBasicSearch(token) {
  try {
    const response = await axios.get(`${API_BASE_URL}/candidates/search`, {
      headers: { 'Authorization': `Bearer ${token}` },
      params: { query: 'developer' }
    });
    
    console.log('✅ Basic search successful');
    console.log(`📊 Found ${response.data.data?.length || 0} candidates`);
    console.log(`📋 Total candidates: ${response.data.pagination?.totalCandidates || 0}`);
  } catch (error) {
    console.log('❌ Basic search failed:', error.response?.data?.message || error.message);
  }
}

async function testLocationSearch(token) {
  try {
    const response = await axios.get(`${API_BASE_URL}/candidates/search`, {
      headers: { 'Authorization': `Bearer ${token}` },
      params: { location: 'Bangalore' }
    });
    
    console.log('✅ Location search successful');
    console.log(`📊 Found ${response.data.data?.length || 0} candidates in Bangalore`);
  } catch (error) {
    console.log('❌ Location search failed:', error.response?.data?.message || error.message);
  }
}

async function testSkillsSearch(token) {
  try {
    const response = await axios.get(`${API_BASE_URL}/candidates/search`, {
      headers: { 'Authorization': `Bearer ${token}` },
      params: { skills: 'JavaScript,React' }
    });
    
    console.log('✅ Skills search successful');
    console.log(`📊 Found ${response.data.data?.length || 0} candidates with JavaScript/React skills`);
  } catch (error) {
    console.log('❌ Skills search failed:', error.response?.data?.message || error.message);
  }
}

async function testExperienceSearch(token) {
  try {
    const response = await axios.get(`${API_BASE_URL}/candidates/search`, {
      headers: { 'Authorization': `Bearer ${token}` },
      params: { experience: '2-5' }
    });
    
    console.log('✅ Experience search successful');
    console.log(`📊 Found ${response.data.data?.length || 0} candidates with 2-5 years experience`);
  } catch (error) {
    console.log('❌ Experience search failed:', error.response?.data?.message || error.message);
  }
}

async function testCombinedSearch(token) {
  try {
    const response = await axios.get(`${API_BASE_URL}/candidates/search`, {
      headers: { 'Authorization': `Bearer ${token}` },
      params: {
        query: 'engineer',
        location: 'Mumbai',
        experience: '3-7',
        skills: 'Python'
      }
    });
    
    console.log('✅ Combined search successful');
    console.log(`📊 Found ${response.data.data?.length || 0} candidates matching all criteria`);
  } catch (error) {
    console.log('❌ Combined search failed:', error.response?.data?.message || error.message);
  }
}

async function testEmptySearch(token) {
  try {
    const response = await axios.get(`${API_BASE_URL}/candidates/search`, {
      headers: { 'Authorization': `Bearer ${token}` },
      params: {}
    });
    
    console.log('❌ Empty search should have failed but succeeded');
    console.log(`📊 Found ${response.data.data?.length || 0} candidates`);
  } catch (error) {
    if (error.response?.status === 400) {
      console.log('✅ Empty search correctly rejected with 400 error');
      console.log(`📝 Error message: ${error.response.data.message}`);
    } else {
      console.log('❌ Unexpected error:', error.response?.data?.message || error.message);
    }
  }
}

async function testSpecialCharacters(token) {
  try {
    const response = await axios.get(`${API_BASE_URL}/candidates/search`, {
      headers: { 'Authorization': `Bearer ${token}` },
      params: { query: 'node.js/express' } // Special characters that could cause regex errors
    });
    
    console.log('✅ Special characters search successful');
    console.log(`📊 Found ${response.data.data?.length || 0} candidates`);
  } catch (error) {
    console.log('❌ Special characters search failed:', error.response?.data?.message || error.message);
  }
}

// Run test if called directly
if (require.main === module) {
  testCandidateSearch();
}

module.exports = testCandidateSearch;





