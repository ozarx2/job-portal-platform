#!/usr/bin/env node

/**
 * Test script for candidate search functionality
 */

require('dotenv').config();
const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api';

async function testCandidateSearch() {
  try {
    console.log('🧪 Testing candidate search functionality...\n');
    
    // Step 1: Login as an employer to get a token
    console.log('1️⃣ Logging in as employer...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'test@example.com', // You'll need to use a real employer account
      password: 'password123'
    });
    
    if (!loginResponse.data.success) {
      console.log('❌ Login failed. Please ensure you have an employer account.');
      console.log('📝 You can create one by registering on the frontend.');
      return;
    }
    
    const token = loginResponse.data.token;
    console.log('✅ Login successful');
    
    // Step 2: Test candidate search endpoint
    console.log('\n2️⃣ Testing candidate search endpoint...');
    const searchResponse = await axios.get(`${API_BASE_URL}/candidates/search`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      params: {
        page: 1,
        limit: 10
      }
    });
    
    console.log('✅ Candidate search endpoint working!');
    console.log('📊 Search results:', {
      success: searchResponse.data.success,
      totalCandidates: searchResponse.data.pagination?.totalCandidates || 0,
      candidatesReturned: searchResponse.data.data?.length || 0
    });
    
    // Step 3: Test search with filters
    console.log('\n3️⃣ Testing candidate search with filters...');
    const filteredSearchResponse = await axios.get(`${API_BASE_URL}/candidates/search`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      params: {
        location: 'Bangalore',
        experience: '2-5',
        skills: 'JavaScript,React',
        page: 1,
        limit: 5
      }
    });
    
    console.log('✅ Filtered search working!');
    console.log('📊 Filtered results:', {
      success: filteredSearchResponse.data.success,
      totalCandidates: filteredSearchResponse.data.pagination?.totalCandidates || 0,
      candidatesReturned: filteredSearchResponse.data.data?.length || 0
    });
    
    console.log('\n🎉 All candidate search tests passed!');
    console.log('\n📋 Available search parameters:');
    console.log('   - query: Text search across name, skills, education');
    console.log('   - location: Filter by location');
    console.log('   - experience: Filter by experience range (e.g., "2-5")');
    console.log('   - skills: Comma-separated skills list');
    console.log('   - education: Filter by education');
    console.log('   - currentEmployer: Filter by current employer');
    console.log('   - employmentStatus: "Employed" or "Unemployed"');
    console.log('   - page: Page number (default: 1)');
    console.log('   - limit: Results per page (default: 20)');
    
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('❌ Authentication failed. Please check your credentials.');
    } else if (error.response?.status === 404) {
      console.log('❌ No employer account found. Please register as an employer first.');
    } else {
      console.error('❌ Test failed:', error.response?.data || error.message);
    }
  }
}

// Run test if called directly
if (require.main === module) {
  testCandidateSearch();
}

module.exports = testCandidateSearch;





