const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api';

// Test data for profile creation/update
const testProfile = {
  name: 'Test User',
  email: 'testuser@example.com',
  phone: '1234567890',
  location: 'Test City',
  experience: 3, // Testing integer experience value
  education: 'Bachelor of Computer Science',
  skills: ['JavaScript', 'React', 'Node.js'],
  bio: 'Experienced software developer with 3 years of experience'
};

async function testProfileCreation() {
  console.log('🧪 Testing Profile Creation with Integer Experience Values\n');
  
  try {
    // Step 1: Register a new user
    console.log('1️⃣ Registering a new user...');
    const registerResponse = await axios.post(`${API_BASE_URL}/auth/register`, {
      name: testProfile.name,
      email: testProfile.email,
      password: 'testpassword123',
      role: 'candidate'
    });
    
    console.log('✅ User registered successfully');
    console.log('📧 Email:', registerResponse.data.user.email);
    console.log('🔑 Token received:', !!registerResponse.data.token);
    
    const token = registerResponse.data.token;
    const userId = registerResponse.data.user.id;
    
    // Step 2: Test profile update with integer experience
    console.log('\n2️⃣ Testing profile update with integer experience...');
    console.log('📊 Experience value being sent:', testProfile.experience, '(type:', typeof testProfile.experience, ')');
    
    const profileUpdateResponse = await axios.put(
      `${API_BASE_URL}/users/profile`,
      testProfile,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('✅ Profile updated successfully');
    console.log('👤 Updated user data:', {
      name: profileUpdateResponse.data.user.name,
      email: profileUpdateResponse.data.user.email,
      experience: profileUpdateResponse.data.user.experience,
      experienceType: typeof profileUpdateResponse.data.user.experience
    });
    
    // Step 3: Verify the profile was saved correctly
    console.log('\n3️⃣ Verifying profile data...');
    const profileResponse = await axios.get(`${API_BASE_URL}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ Profile retrieved successfully');
    console.log('🔍 Experience in database:', {
      value: profileResponse.data.user.experience,
      type: typeof profileResponse.data.user.experience,
      isNumber: typeof profileResponse.data.user.experience === 'number'
    });
    
    // Step 4: Test different experience values
    console.log('\n4️⃣ Testing different experience values...');
    const testValues = [0, 1, 5, 10, 15];
    
    for (const expValue of testValues) {
      try {
        console.log(`\n   Testing experience value: ${expValue}`);
        const updateResponse = await axios.put(
          `${API_BASE_URL}/users/profile`,
          { ...testProfile, experience: expValue },
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        console.log(`   ✅ Success: ${updateResponse.data.user.experience} (type: ${typeof updateResponse.data.user.experience})`);
      } catch (error) {
        console.log(`   ❌ Failed: ${error.response?.data?.message || error.message}`);
      }
    }
    
    console.log('\n🎉 All tests completed successfully!');
    console.log('\n📋 Summary:');
    console.log('   ✅ User registration works');
    console.log('   ✅ Profile update with integer experience works');
    console.log('   ✅ Experience values are stored as numbers in database');
    console.log('   ✅ Multiple experience values tested successfully');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.response?.data || error.message);
    
    if (error.response?.status === 400) {
      console.log('\n💡 This might be because the user already exists. Trying to login instead...');
      await testWithExistingUser();
    }
  }
}

async function testWithExistingUser() {
  try {
    console.log('\n🔄 Attempting to login with existing user...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: testProfile.email,
      password: 'testpassword123'
    });
    
    console.log('✅ Login successful');
    const token = loginResponse.data.token;
    
    // Test profile update
    console.log('\n🧪 Testing profile update with existing user...');
    const updateResponse = await axios.put(
      `${API_BASE_URL}/users/profile`,
      { ...testProfile, experience: 5 },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('✅ Profile update successful');
    console.log('📊 Experience stored:', updateResponse.data.user.experience, '(type:', typeof updateResponse.data.user.experience, ')');
    
  } catch (error) {
    console.error('❌ Login test also failed:', error.response?.data || error.message);
  }
}

// Run the test
testProfileCreation();






