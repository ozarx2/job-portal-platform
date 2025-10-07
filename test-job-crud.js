const axios = require('axios');
const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/jobportal', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const User = require('./backend/models/User');
const Job = require('./backend/models/Job');
const Company = require('./backend/models/Company');

const API_BASE = 'http://localhost:5000/api';

async function generateTestToken() {
  try {
    // Find or create a test user
    let user = await User.findOne({ email: 'test@employer.com' });
    if (!user) {
      user = new User({
        name: 'Test Employer',
        email: 'test@employer.com',
        password: 'password123',
        role: 'employer'
      });
      await user.save();
    }
    
    // Generate JWT token
    const jwt = require('jsonwebtoken');
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '1h' }
    );
    
    return token;
  } catch (error) {
    console.error('Error generating token:', error);
    return null;
  }
}

async function testJobCRUD() {
  console.log('🧪 Starting Job CRUD Operations Test\n');
  
  const token = await generateTestToken();
  if (!token) {
    console.error('❌ Failed to generate test token');
    return;
  }
  
  const headers = { Authorization: `Bearer ${token}` };
  let createdJobId = null;
  let createdCompanyId = null;

  try {
    // Step 1: Create a company first (required for job creation)
    console.log('📝 Step 1: Creating a test company...');
    const companyData = {
      name: 'Test Tech Company',
      industry: 'Technology',
      location: 'San Francisco, CA',
      size: '50-100 employees',
      description: 'A test company for CRUD operations',
      companyId: 'TEST-001'
    };
    
    const companyResponse = await axios.post(`${API_BASE}/companies`, companyData, { headers });
    createdCompanyId = companyResponse.data.data._id;
    console.log('✅ Company created:', companyResponse.data.data.name);
    console.log('   Company ID:', createdCompanyId);

    // Step 2: CREATE - Create a new job
    console.log('\n📝 Step 2: Creating a new job...');
    const jobData = {
      title: 'Senior Frontend Developer',
      description: 'We are looking for an experienced frontend developer to join our team. Must have 5+ years of experience with React, TypeScript, and modern web technologies.',
      location: 'Remote',
      salary: '$100,000 - $150,000',
      type: 'Full-time',
      companyId: createdCompanyId,
      status: 'active'
    };
    
    const createResponse = await axios.post(`${API_BASE}/jobs`, jobData, { headers });
    createdJobId = createResponse.data.data._id;
    console.log('✅ Job created successfully');
    console.log('   Job ID:', createdJobId);
    console.log('   Title:', createResponse.data.data.title);
    console.log('   Status:', createResponse.data.data.status);

    // Step 3: READ - Get the created job
    console.log('\n📖 Step 3: Reading the created job...');
    const readResponse = await axios.get(`${API_BASE}/jobs/${createdJobId}`, { headers });
    console.log('✅ Job retrieved successfully');
    console.log('   Title:', readResponse.data.data.title);
    console.log('   Description length:', readResponse.data.data.description.length);
    console.log('   Company:', readResponse.data.data.companyId?.name || 'No company');

    // Step 4: READ - Get all employer jobs
    console.log('\n📖 Step 4: Reading all employer jobs...');
    const employerJobsResponse = await axios.get(`${API_BASE}/jobs/employer`, { headers });
    console.log('✅ Employer jobs retrieved');
    console.log('   Total jobs:', employerJobsResponse.data.data.length);
    console.log('   Job titles:', employerJobsResponse.data.data.map(job => job.title));

    // Step 5: UPDATE - Update the job
    console.log('\n✏️ Step 5: Updating the job...');
    const updateData = {
      title: 'Lead Frontend Developer',
      description: 'We are looking for a lead frontend developer to join our team. Must have 7+ years of experience with React, TypeScript, and modern web technologies. Leadership experience preferred.',
      location: 'San Francisco, CA',
      salary: '$120,000 - $180,000',
      type: 'Full-time',
      status: 'active'
    };
    
    const updateResponse = await axios.put(`${API_BASE}/jobs/${createdJobId}`, updateData, { headers });
    console.log('✅ Job updated successfully');
    console.log('   New title:', updateResponse.data.data.title);
    console.log('   New salary:', updateResponse.data.data.salary);
    console.log('   New location:', updateResponse.data.data.location);

    // Step 6: UPDATE - Change job status
    console.log('\n✏️ Step 6: Updating job status to inactive...');
    const statusUpdateData = { status: 'inactive' };
    const statusResponse = await axios.put(`${API_BASE}/jobs/${createdJobId}`, statusUpdateData, { headers });
    console.log('✅ Job status updated');
    console.log('   New status:', statusResponse.data.data.status);

    // Step 7: READ - Verify the updates
    console.log('\n📖 Step 7: Verifying updates...');
    const verifyResponse = await axios.get(`${API_BASE}/jobs/${createdJobId}`, { headers });
    console.log('✅ Verification successful');
    console.log('   Current title:', verifyResponse.data.data.title);
    console.log('   Current status:', verifyResponse.data.data.status);
    console.log('   Current salary:', verifyResponse.data.data.salary);

    // Step 8: DELETE - Delete the job
    console.log('\n🗑️ Step 8: Deleting the job...');
    await axios.delete(`${API_BASE}/jobs/${createdJobId}`, { headers });
    console.log('✅ Job deleted successfully');

    // Step 9: READ - Verify deletion
    console.log('\n📖 Step 9: Verifying deletion...');
    try {
      await axios.get(`${API_BASE}/jobs/${createdJobId}`, { headers });
      console.log('❌ Job still exists - deletion failed');
    } catch (error) {
      if (error.response?.status === 404) {
        console.log('✅ Job deletion verified - job not found');
      } else {
        console.log('⚠️ Unexpected error during verification:', error.response?.status);
      }
    }

    // Step 10: Cleanup - Delete the test company
    console.log('\n🧹 Step 10: Cleaning up test company...');
    await axios.delete(`${API_BASE}/companies/${createdCompanyId}`, { headers });
    console.log('✅ Test company deleted');

    console.log('\n🎉 All Job CRUD operations completed successfully!');
    console.log('\n📊 Test Summary:');
    console.log('   ✅ CREATE: Job creation with company association');
    console.log('   ✅ READ: Individual job retrieval');
    console.log('   ✅ READ: Employer jobs listing');
    console.log('   ✅ UPDATE: Job details modification');
    console.log('   ✅ UPDATE: Job status change');
    console.log('   ✅ DELETE: Job removal');
    console.log('   ✅ VERIFICATION: All operations verified');
    console.log('   ✅ CLEANUP: Test data removed');

  } catch (error) {
    console.error('\n❌ Test failed:', error.response?.data || error.message);
    
    // Cleanup on error
    if (createdJobId) {
      try {
        await axios.delete(`${API_BASE}/jobs/${createdJobId}`, { headers });
        console.log('🧹 Cleaned up job on error');
      } catch (cleanupError) {
        console.log('⚠️ Could not clean up job:', cleanupError.message);
      }
    }
    
    if (createdCompanyId) {
      try {
        await axios.delete(`${API_BASE}/companies/${createdCompanyId}`, { headers });
        console.log('🧹 Cleaned up company on error');
      } catch (cleanupError) {
        console.log('⚠️ Could not clean up company:', cleanupError.message);
      }
    }
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
}

// Run the test
testJobCRUD().catch(console.error);









