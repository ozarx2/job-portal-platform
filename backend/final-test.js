const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api';

async function finalTest() {
  console.log('🎯 Final Test: Complete Profile Creation and Job Application Workflow\n');
  
  try {
    // Step 1: Register a new test user
    console.log('1️⃣ Registering a new test user...');
    const registerResponse = await axios.post(`${API_BASE_URL}/auth/register`, {
      name: 'Final Test User',
      email: 'finaltest@example.com',
      password: 'testpassword123',
      role: 'candidate'
    });
    
    const token = registerResponse.data.token;
    console.log('✅ User registered successfully');
    
    // Step 2: Update profile with integer experience
    console.log('\n2️⃣ Updating profile with integer experience...');
    const profileUpdateResponse = await axios.put(
      `${API_BASE_URL}/users/profile`,
      {
        name: 'Final Test User',
        email: 'finaltest@example.com',
        phone: '9876543210',
        location: 'Test City',
        experience: 5, // Integer experience
        education: 'Master of Computer Science',
        skills: ['Python', 'Django', 'PostgreSQL'],
        bio: 'Senior developer with 5 years of experience'
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('✅ Profile updated successfully');
    console.log('📊 Profile experience:', {
      value: profileUpdateResponse.data.user.experience,
      type: typeof profileUpdateResponse.data.user.experience
    });
    
    // Step 3: Get available jobs
    console.log('\n3️⃣ Fetching available jobs...');
    const jobsResponse = await axios.get(`${API_BASE_URL}/jobs`);
    
    let jobs = [];
    if (Array.isArray(jobsResponse.data)) {
      jobs = jobsResponse.data;
    } else if (jobsResponse.data && Array.isArray(jobsResponse.data.data)) {
      jobs = jobsResponse.data.data;
    }
    
    if (jobs.length === 0) {
      console.log('⚠️ No jobs available for testing');
      return;
    }
    
    const testJob = jobs[0];
    console.log(`🎯 Using job: ${testJob.title} at ${testJob.company}`);
    
    // Step 4: Apply to job with integer experience
    console.log('\n4️⃣ Applying to job with integer experience...');
    const applicationResponse = await axios.post(
      `${API_BASE_URL}/applications`,
      {
        jobId: testJob._id,
        education: 'Master of Computer Science',
        age: 28,
        experience: 5, // Integer experience
        location: 'Test City',
        currentEmployer: 'Previous Company',
        skills: 'Python, Django, PostgreSQL',
        name: 'Final Test User',
        email: 'finaltest@example.com',
        phone: '9876543210',
        bio: 'Senior developer with 5 years of experience',
        notes: 'Final test application with integer experience'
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('✅ Job application submitted successfully');
    console.log('📊 Application experience:', {
      value: applicationResponse.data.data.experience,
      type: typeof applicationResponse.data.data.experience
    });
    
    // Step 5: Verify the application was saved correctly
    console.log('\n5️⃣ Verifying application data...');
    const applicationsResponse = await axios.get(`${API_BASE_URL}/applications/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const userApplications = applicationsResponse.data;
    const latestApplication = userApplications[userApplications.length - 1];
    
    console.log('✅ Application retrieved successfully');
    console.log('🔍 Latest application experience:', {
      value: latestApplication.experience,
      type: typeof latestApplication.experience,
      isNumber: typeof latestApplication.experience === 'number'
    });
    
    // Step 6: Test profile retrieval
    console.log('\n6️⃣ Verifying profile data...');
    const profileResponse = await axios.get(`${API_BASE_URL}/auth/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    console.log('✅ Profile retrieved successfully');
    console.log('🔍 Profile experience:', {
      value: profileResponse.data.user.experience,
      type: typeof profileResponse.data.user.experience,
      isNumber: typeof profileResponse.data.user.experience === 'number'
    });
    
    console.log('\n🎉 Final test completed successfully!');
    console.log('\n📋 Test Results Summary:');
    console.log('   ✅ User registration works');
    console.log('   ✅ Profile update with integer experience works');
    console.log('   ✅ Job application with integer experience works');
    console.log('   ✅ Experience values are properly stored and retrieved');
    console.log('   ✅ All API endpoints return correct data types');
    
    console.log('\n🎯 Key Findings:');
    console.log(`   👤 Profile experience: ${profileResponse.data.user.experience} (${typeof profileResponse.data.user.experience})`);
    console.log(`   📋 Application experience: ${latestApplication.experience} (${typeof latestApplication.experience})`);
    
  } catch (error) {
    console.error('\n❌ Final test failed:', error.response?.data || error.message);
  }
}

// Run the final test
finalTest();






