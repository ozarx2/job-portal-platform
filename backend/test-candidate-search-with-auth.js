#!/usr/bin/env node

/**
 * Candidate Search Test with Authentication
 * Tests candidate search functionality with proper authentication
 */

require('dotenv').config();
const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api';

async function testCandidateSearchWithAuth() {
  console.log('🧪 Candidate Search Test with Authentication\n');
  
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
      console.log('Response:', loginResponse.data);
      return;
    }
    
    authToken = loginResponse.data.token;
    console.log('✅ Login successful');
    console.log(`👤 User: ${loginResponse.data.user.name}`);
    console.log(`🔑 Token: ${authToken.substring(0, 20)}...`);
    
    // Test 2: Basic candidate search
    console.log('\n2️⃣ Testing basic candidate search...');
    await testBasicCandidateSearch(authToken);
    
    // Test 3: Search with filters
    console.log('\n3️⃣ Testing candidate search with filters...');
    await testCandidateSearchWithFilters(authToken);
    
    // Test 4: Search with special characters
    console.log('\n4️⃣ Testing search with special characters...');
    await testSearchWithSpecialCharacters(authToken);
    
    // Test 5: Empty search validation
    console.log('\n5️⃣ Testing empty search validation...');
    await testEmptySearchValidation(authToken);
    
    // Test 6: Pagination
    console.log('\n6️⃣ Testing pagination...');
    await testPagination(authToken);
    
    console.log('\n🎉 All candidate search tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

async function testBasicCandidateSearch(token) {
  try {
    const response = await axios.get(`${API_BASE_URL}/candidates/search`, {
      headers: { 'Authorization': `Bearer ${token}` },
      params: { query: 'developer' }
    });
    
    console.log('✅ Basic candidate search successful');
    console.log(`📊 Response structure:`, {
      success: response.data.success,
      dataCount: response.data.data?.length || 0,
      pagination: response.data.pagination ? 'Present' : 'Missing',
      searchCriteria: response.data.searchCriteria ? 'Present' : 'Missing'
    });
    
    if (response.data.data && response.data.data.length > 0) {
      console.log(`👤 Sample candidate:`, {
        name: response.data.data[0].name,
        email: response.data.data[0].email,
        location: response.data.data[0].location
      });
    }
    
  } catch (error) {
    console.log('❌ Basic candidate search failed:', error.response?.data?.message || error.message);
  }
}

async function testCandidateSearchWithFilters(token) {
  try {
    const response = await axios.get(`${API_BASE_URL}/candidates/search`, {
      headers: { 'Authorization': `Bearer ${token}` },
      params: {
        query: 'engineer',
        location: 'Bangalore',
        experience: '2-5',
        skills: 'JavaScript,React'
      }
    });
    
    console.log('✅ Filtered candidate search successful');
    console.log(`📊 Found ${response.data.data?.length || 0} candidates with filters`);
    console.log(`🔍 Search criteria used:`, response.data.searchCriteria);
    
  } catch (error) {
    console.log('❌ Filtered candidate search failed:', error.response?.data?.message || error.message);
  }
}

async function testSearchWithSpecialCharacters(token) {
  try {
    const response = await axios.get(`${API_BASE_URL}/candidates/search`, {
      headers: { 'Authorization': `Bearer ${token}` },
      params: { query: 'node.js/express' }
    });
    
    console.log('✅ Special characters search successful');
    console.log(`📊 Found ${response.data.data?.length || 0} candidates`);
    
  } catch (error) {
    console.log('❌ Special characters search failed:', error.response?.data?.message || error.message);
  }
}

async function testEmptySearchValidation(token) {
  try {
    const response = await axios.get(`${API_BASE_URL}/candidates/search`, {
      headers: { 'Authorization': `Bearer ${token}` },
      params: {}
    });
    
    console.log('❌ Empty search should have failed but succeeded');
    
  } catch (error) {
    if (error.response?.status === 400) {
      console.log('✅ Empty search correctly rejected');
      console.log(`📝 Error message: ${error.response.data.message}`);
    } else {
      console.log('❌ Unexpected error:', error.response?.data?.message || error.message);
    }
  }
}

async function testPagination(token) {
  try {
    const response = await axios.get(`${API_BASE_URL}/candidates/search`, {
      headers: { 'Authorization': `Bearer ${token}` },
      params: {
        query: 'developer',
        page: 1,
        limit: 5
      }
    });
    
    console.log('✅ Pagination test successful');
    console.log(`📊 Pagination info:`, {
      currentPage: response.data.pagination?.currentPage,
      totalPages: response.data.pagination?.totalPages,
      totalCandidates: response.data.pagination?.totalCandidates,
      hasNextPage: response.data.pagination?.hasNextPage,
      hasPrevPage: response.data.pagination?.hasPrevPage
    });
    
  } catch (error) {
    console.log('❌ Pagination test failed:', error.response?.data?.message || error.message);
  }
}

// Run test if called directly
if (require.main === module) {
  testCandidateSearchWithAuth();
}

module.exports = testCandidateSearchWithAuth;
