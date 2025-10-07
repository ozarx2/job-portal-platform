/**
 * Test script to verify that created companies are visible in the dropdown
 */

require('dotenv').config({ path: './env.local' });
const axios = require('axios');

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000/api';

async function testCompanyCreationVisibility() {
  try {
    console.log('🧪 Testing Company Creation and Visibility\n');
    
    // 1. Register a user
    const testUser = {
      name: 'Test Employer Visibility',
      email: `test-visibility-${Date.now()}@example.com`,
      password: 'TestPassword123!',
      role: 'employer'
    };
    
    console.log('1️⃣ Registering user...');
    const registerRes = await axios.post(`${API_BASE_URL}/auth/register`, testUser);
    console.log('✅ User registered:', registerRes.data.user.email);
    const token = registerRes.data.token;
    
    // 2. Check initial companies (should be empty)
    console.log('\n2️⃣ Checking initial user companies...');
    const initialCompaniesRes = await axios.get(`${API_BASE_URL}/companies/user`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('📊 Initial companies:', {
      count: initialCompaniesRes.data.count,
      companies: initialCompaniesRes.data.data?.map(c => c.name) || []
    });
    
    // 3. Create a company
    console.log('\n3️⃣ Creating company...');
    const testCompany = {
      name: 'Visibility Test Company',
      description: 'A company to test visibility in dropdown',
      website: 'https://visibilitytest.com',
      location: 'Test City',
      industry: 'Technology'
    };
    
    const companyRes = await axios.post(`${API_BASE_URL}/companies`, testCompany, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Company created:', companyRes.data.company?.name || companyRes.data.name);
    console.log('📝 Response:', companyRes.data.message || 'Company created');
    console.log('📊 Full response:', JSON.stringify(companyRes.data, null, 2));
    
    // 4. Check companies after creation (should include the new company)
    console.log('\n4️⃣ Checking companies after creation...');
    const updatedCompaniesRes = await axios.get(`${API_BASE_URL}/companies/user`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('📊 Updated companies:', {
      count: updatedCompaniesRes.data.count,
      companies: updatedCompaniesRes.data.data?.map(c => c.name) || []
    });
    
    // 5. Verify user profile has companyId
    console.log('\n5️⃣ Checking user profile...');
    const profileRes = await axios.get(`${API_BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('👤 User profile:', {
      id: profileRes.data.user._id,
      email: profileRes.data.user.email,
      companyId: profileRes.data.user.companyId,
      hasCompanies: profileRes.data.user.companies?.length || 0
    });
    
    // 6. Test job creation with the company
    console.log('\n6️⃣ Testing job creation...');
    const testJob = {
      title: 'Visibility Test Job',
      description: 'A job to test company visibility',
      location: 'Test Location',
      salary: '50000-70000',
      type: 'Full-time',
      companyId: companyRes.data.company?._id || companyRes.data._id
    };
    
    const jobRes = await axios.post(`${API_BASE_URL}/jobs`, testJob, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Job created successfully:', jobRes.data.job.title);
    
    // Results
    console.log('\n🎉 Test Results:');
    if (updatedCompaniesRes.data.count > 0) {
      console.log('✅ SUCCESS: Company is visible in dropdown!');
      console.log('✅ SUCCESS: Job creation works with the company!');
    } else {
      console.log('❌ FAILED: Company is not visible in dropdown');
    }
    
    console.log('\n📋 Summary:');
    console.log(`   Initial companies: ${initialCompaniesRes.data.count}`);
    console.log(`   After creation: ${updatedCompaniesRes.data.count}`);
    console.log(`   Company visible: ${updatedCompaniesRes.data.count > 0 ? 'YES' : 'NO'}`);
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testCompanyCreationVisibility();
