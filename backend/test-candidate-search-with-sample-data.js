#!/usr/bin/env node

/**
 * Test Candidate Search with Sample Data
 * Tests candidate search functionality with the newly created sample data
 */

require('dotenv').config();
const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api';

async function testCandidateSearchWithSampleData() {
  console.log('🧪 Testing Candidate Search with Sample Data\n');
  
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
    
    // Test 1: Search by location
    console.log('\n2️⃣ Testing search by location (Bangalore)...');
    await testSearchByLocation(authToken, 'Bangalore');
    
    // Test 2: Search by skills
    console.log('\n3️⃣ Testing search by skills (JavaScript)...');
    await testSearchBySkills(authToken, 'JavaScript');
    
    // Test 3: Search by experience
    console.log('\n4️⃣ Testing search by experience (2-5 years)...');
    await testSearchByExperience(authToken, '2-5');
    
    // Test 4: Search by education
    console.log('\n5️⃣ Testing search by education (B.Tech)...');
    await testSearchByEducation(authToken, 'B.Tech');
    
    // Test 5: Search by current employer
    console.log('\n6️⃣ Testing search by current employer (Tech Corp)...');
    await testSearchByEmployer(authToken, 'Tech Corp');
    
    // Test 6: Combined search
    console.log('\n7️⃣ Testing combined search (Bangalore + JavaScript)...');
    await testCombinedSearch(authToken, 'developer', 'Bangalore', 'JavaScript');
    
    // Test 7: Search with no results
    console.log('\n8️⃣ Testing search with no results (NonExistentSkill)...');
    await testSearchNoResults(authToken, 'NonExistentSkill');
    
    console.log('\n🎉 All candidate search tests with sample data completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

async function testSearchByLocation(token, location) {
  try {
    const response = await axios.get(`${API_BASE_URL}/candidates/search`, {
      headers: { 'Authorization': `Bearer ${token}` },
      params: { location }
    });
    
    console.log(`✅ Location search for "${location}" successful`);
    console.log(`📊 Found ${response.data.data?.length || 0} candidates`);
    
    if (response.data.data && response.data.data.length > 0) {
      console.log('👥 Candidates found:');
      response.data.data.forEach((candidate, index) => {
        console.log(`   ${index + 1}. ${candidate.name} - ${candidate.location} (${candidate.experience} years)`);
      });
    }
    
  } catch (error) {
    console.log('❌ Location search failed:', error.response?.data?.message || error.message);
  }
}

async function testSearchBySkills(token, skill) {
  try {
    const response = await axios.get(`${API_BASE_URL}/candidates/search`, {
      headers: { 'Authorization': `Bearer ${token}` },
      params: { skills: skill }
    });
    
    console.log(`✅ Skills search for "${skill}" successful`);
    console.log(`📊 Found ${response.data.data?.length || 0} candidates`);
    
    if (response.data.data && response.data.data.length > 0) {
      console.log('👥 Candidates found:');
      response.data.data.forEach((candidate, index) => {
        console.log(`   ${index + 1}. ${candidate.name} - Skills: ${candidate.skills?.join(', ') || 'N/A'}`);
      });
    }
    
  } catch (error) {
    console.log('❌ Skills search failed:', error.response?.data?.message || error.message);
  }
}

async function testSearchByExperience(token, experience) {
  try {
    const response = await axios.get(`${API_BASE_URL}/candidates/search`, {
      headers: { 'Authorization': `Bearer ${token}` },
      params: { experience }
    });
    
    console.log(`✅ Experience search for "${experience}" years successful`);
    console.log(`📊 Found ${response.data.data?.length || 0} candidates`);
    
    if (response.data.data && response.data.data.length > 0) {
      console.log('👥 Candidates found:');
      response.data.data.forEach((candidate, index) => {
        console.log(`   ${index + 1}. ${candidate.name} - ${candidate.experience} years experience`);
      });
    }
    
  } catch (error) {
    console.log('❌ Experience search failed:', error.response?.data?.message || error.message);
  }
}

async function testSearchByEducation(token, education) {
  try {
    const response = await axios.get(`${API_BASE_URL}/candidates/search`, {
      headers: { 'Authorization': `Bearer ${token}` },
      params: { education }
    });
    
    console.log(`✅ Education search for "${education}" successful`);
    console.log(`📊 Found ${response.data.data?.length || 0} candidates`);
    
    if (response.data.data && response.data.data.length > 0) {
      console.log('👥 Candidates found:');
      response.data.data.forEach((candidate, index) => {
        console.log(`   ${index + 1}. ${candidate.name} - ${candidate.education}`);
      });
    }
    
  } catch (error) {
    console.log('❌ Education search failed:', error.response?.data?.message || error.message);
  }
}

async function testSearchByEmployer(token, employer) {
  try {
    const response = await axios.get(`${API_BASE_URL}/candidates/search`, {
      headers: { 'Authorization': `Bearer ${token}` },
      params: { currentEmployer: employer }
    });
    
    console.log(`✅ Employer search for "${employer}" successful`);
    console.log(`📊 Found ${response.data.data?.length || 0} candidates`);
    
    if (response.data.data && response.data.data.length > 0) {
      console.log('👥 Candidates found:');
      response.data.data.forEach((candidate, index) => {
        console.log(`   ${index + 1}. ${candidate.name} - ${candidate.currentEmployer}`);
      });
    }
    
  } catch (error) {
    console.log('❌ Employer search failed:', error.response?.data?.message || error.message);
  }
}

async function testCombinedSearch(token, query, location, skills) {
  try {
    const response = await axios.get(`${API_BASE_URL}/candidates/search`, {
      headers: { 'Authorization': `Bearer ${token}` },
      params: { 
        query,
        location,
        skills
      }
    });
    
    console.log(`✅ Combined search successful`);
    console.log(`📊 Found ${response.data.data?.length || 0} candidates`);
    console.log(`🔍 Search criteria: query="${query}", location="${location}", skills="${skills}"`);
    
    if (response.data.data && response.data.data.length > 0) {
      console.log('👥 Candidates found:');
      response.data.data.forEach((candidate, index) => {
        console.log(`   ${index + 1}. ${candidate.name} - ${candidate.location} - ${candidate.skills?.join(', ') || 'N/A'}`);
      });
    }
    
  } catch (error) {
    console.log('❌ Combined search failed:', error.response?.data?.message || error.message);
  }
}

async function testSearchNoResults(token, skill) {
  try {
    const response = await axios.get(`${API_BASE_URL}/candidates/search`, {
      headers: { 'Authorization': `Bearer ${token}` },
      params: { skills: skill }
    });
    
    console.log(`✅ Search for non-existent skill "${skill}" successful`);
    console.log(`📊 Found ${response.data.data?.length || 0} candidates (expected: 0)`);
    
  } catch (error) {
    console.log('❌ Search failed:', error.response?.data?.message || error.message);
  }
}

// Run test if called directly
if (require.main === module) {
  testCandidateSearchWithSampleData();
}

module.exports = testCandidateSearchWithSampleData;





