const axios = require('axios');

async function testCompanyCreation() {
  console.log('🧪 Testing Company Creation API...\n');

  try {
    // First, let's login to get a token
    console.log('1. 🔐 Logging in to get authentication token...');
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'suneera@gmail.com',
      password: 'password123' // You may need to adjust this
    });

    const token = loginResponse.data.token;
    console.log('✅ Login successful, token obtained');

    // Test company creation without logo
    console.log('\n2. 🏢 Testing company creation without logo...');
    const companyData = {
      name: 'Test Company ' + Date.now(),
      description: 'A test company for validation testing',
      industry: 'Technology',
      website: 'https://testcompany.com',
      size: '11-50',
      email: 'contact@testcompany.com',
      phone: '+1234567890',
      city: 'Test City',
      state: 'Test State',
      country: 'Test Country',
      zipCode: '12345',
      linkedinUrl: 'https://linkedin.com/company/test',
      twitterUrl: 'https://twitter.com/test',
      facebookUrl: 'https://facebook.com/test'
    };

    const createResponse = await axios.post('http://localhost:5000/api/companies', companyData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Company created successfully!');
    console.log('📋 Company ID:', createResponse.data.data._id);
    console.log('📋 Company Name:', createResponse.data.data.name);

    // Test fetching companies
    console.log('\n3. 📋 Testing company retrieval...');
    const companiesResponse = await axios.get('http://localhost:5000/api/companies', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('✅ Companies retrieved successfully!');
    console.log('📊 Total companies:', companiesResponse.data.data.length);

    console.log('\n🎉 All tests passed! Company creation is working properly.');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    if (error.response?.data?.message) {
      console.error('❌ Error details:', error.response.data.message);
    }
  }
}

testCompanyCreation();









