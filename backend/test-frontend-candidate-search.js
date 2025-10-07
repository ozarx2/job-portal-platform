#!/usr/bin/env node

/**
 * Test Frontend Candidate Search Integration
 * Simulates frontend requests to test the candidate search API
 */

require('dotenv').config();
const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api';

async function testFrontendCandidateSearch() {
  console.log('🧪 Testing Frontend Candidate Search Integration\n');
  
  let authToken = null;
  
  try {
    // Step 1: Login as test employer
    console.log('1️⃣ Logging in as test employer...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'testemployer@example.com',
      password: 'TestPass123!'
    });
    
    if (!loginResponse.data.token) {
      console.log('❌ Login failed. Please check credentials.');
      return;
    }
    
    authToken = loginResponse.data.token;
    console.log('✅ Login successful');
    
    // Test 1: Empty search (should not make API call)
    console.log('\n2️⃣ Testing empty search (should be handled by frontend)...');
    await testEmptySearch(authToken);
    
    // Test 2: Search with only query
    console.log('\n3️⃣ Testing search with only query...');
    await testQueryOnlySearch(authToken, 'developer');
    
    // Test 3: Search with only location
    console.log('\n4️⃣ Testing search with only location...');
    await testLocationOnlySearch(authToken, 'Bangalore');
    
    // Test 4: Search with only skills
    console.log('\n5️⃣ Testing search with only skills...');
    await testSkillsOnlySearch(authToken, 'JavaScript');
    
    // Test 5: Search with only experience
    console.log('\n6️⃣ Testing search with only experience...');
    await testExperienceOnlySearch(authToken, '2-5');
    
    // Test 6: Combined search
    console.log('\n7️⃣ Testing combined search...');
    await testCombinedSearch(authToken, {
      query: 'engineer',
      location: 'Mumbai',
      skills: 'Python',
      experience: '3-7'
    });
    
    // Test 7: Frontend-like search with empty strings (should be filtered out)
    console.log('\n8️⃣ Testing frontend-like search with empty strings...');
    await testFrontendLikeSearch(authToken, {
      query: '',
      location: 'Bangalore',
      experience: '',
      skills: '',
      salary: ''
    });
    
    console.log('\n🎉 All frontend integration tests completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

async function testEmptySearch(token) {
  try {
    const response = await axios.get(`${API_BASE_URL}/candidates/search`, {
      headers: { 'Authorization': `Bearer ${token}` },
      params: {}
    });
    
    console.log('❌ Empty search should have been rejected by frontend');
    
  } catch (error) {
    if (error.response?.status === 400) {
      console.log('✅ Empty search correctly rejected by backend');
      console.log(`📝 Message: ${error.response.data.message}`);
    } else {
      console.log('❌ Unexpected error:', error.response?.data?.message || error.message);
    }
  }
}

async function testQueryOnlySearch(token, query) {
  try {
    const response = await axios.get(`${API_BASE_URL}/candidates/search`, {
      headers: { 'Authorization': `Bearer ${token}` },
      params: { query }
    });
    
    console.log(`✅ Query-only search for "${query}" successful`);
    console.log(`📊 Found ${response.data.data?.length || 0} candidates`);
    
  } catch (error) {
    console.log('❌ Query-only search failed:', error.response?.data?.message || error.message);
  }
}

async function testLocationOnlySearch(token, location) {
  try {
    const response = await axios.get(`${API_BASE_URL}/candidates/search`, {
      headers: { 'Authorization': `Bearer ${token}` },
      params: { location }
    });
    
    console.log(`✅ Location-only search for "${location}" successful`);
    console.log(`📊 Found ${response.data.data?.length || 0} candidates`);
    
  } catch (error) {
    console.log('❌ Location-only search failed:', error.response?.data?.message || error.message);
  }
}

async function testSkillsOnlySearch(token, skills) {
  try {
    const response = await axios.get(`${API_BASE_URL}/candidates/search`, {
      headers: { 'Authorization': `Bearer ${token}` },
      params: { skills }
    });
    
    console.log(`✅ Skills-only search for "${skills}" successful`);
    console.log(`📊 Found ${response.data.data?.length || 0} candidates`);
    
  } catch (error) {
    console.log('❌ Skills-only search failed:', error.response?.data?.message || error.message);
  }
}

async function testExperienceOnlySearch(token, experience) {
  try {
    const response = await axios.get(`${API_BASE_URL}/candidates/search`, {
      headers: { 'Authorization': `Bearer ${token}` },
      params: { experience }
    });
    
    console.log(`✅ Experience-only search for "${experience}" successful`);
    console.log(`📊 Found ${response.data.data?.length || 0} candidates`);
    
  } catch (error) {
    console.log('❌ Experience-only search failed:', error.response?.data?.message || error.message);
  }
}

async function testCombinedSearch(token, params) {
  try {
    const response = await axios.get(`${API_BASE_URL}/candidates/search`, {
      headers: { 'Authorization': `Bearer ${token}` },
      params
    });
    
    console.log('✅ Combined search successful');
    console.log(`📊 Found ${response.data.data?.length || 0} candidates`);
    console.log(`🔍 Search criteria:`, params);
    
  } catch (error) {
    console.log('❌ Combined search failed:', error.response?.data?.message || error.message);
  }
}

async function testFrontendLikeSearch(token, params) {
  try {
    // Filter out empty parameters (like frontend should do)
    const filteredParams = {};
    
    if (params.query && params.query.trim()) {
      filteredParams.query = params.query.trim();
    }
    
    if (params.location && params.location.trim()) {
      filteredParams.location = params.location.trim();
    }
    
    if (params.experience && params.experience.trim()) {
      filteredParams.experience = params.experience.trim();
    }
    
    if (params.skills && params.skills.trim()) {
      filteredParams.skills = params.skills.trim();
    }
    
    if (params.salary && params.salary.trim()) {
      filteredParams.salary = params.salary.trim();
    }
    
    console.log('🔍 Original params:', params);
    console.log('🔍 Filtered params:', filteredParams);
    
    const response = await axios.get(`${API_BASE_URL}/candidates/search`, {
      headers: { 'Authorization': `Bearer ${token}` },
      params: filteredParams
    });
    
    console.log('✅ Frontend-like search successful');
    console.log(`📊 Found ${response.data.data?.length || 0} candidates`);
    
  } catch (error) {
    console.log('❌ Frontend-like search failed:', error.response?.data?.message || error.message);
  }
}

// Run test if called directly
if (require.main === module) {
  testFrontendCandidateSearch();
}

module.exports = testFrontendCandidateSearch;





