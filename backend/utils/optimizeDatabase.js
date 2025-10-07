// Database optimization utilities
const mongoose = require('mongoose');

// Import models
const Job = require('../models/Job');
const Application = require('../models/Application');
const Lead = require('../models/Lead');
const User = require('../models/User');

// Create indexes for better query performance
async function createIndexes() {
  try {
    console.log('🔧 Creating database indexes for better performance...');
    
    // Job model indexes
    await Job.collection.createIndex({ status: 1, createdAt: -1 });
    await Job.collection.createIndex({ postedBy: 1, createdAt: -1 });
    await Job.collection.createIndex({ companyId: 1 });
    await Job.collection.createIndex({ title: 'text', description: 'text' });
    await Job.collection.createIndex({ location: 1 });
    await Job.collection.createIndex({ category: 1 });
    console.log('✅ Job indexes created');
    
    // Application model indexes
    await Application.collection.createIndex({ candidate: 1, createdAt: -1 });
    await Application.collection.createIndex({ job: 1, status: 1 });
    await Application.collection.createIndex({ status: 1, createdAt: -1 });
    console.log('✅ Application indexes created');
    
    // Lead model indexes
    await Lead.collection.createIndex({ agent: 1, status: 1 });
    await Lead.collection.createIndex({ status: 1, createdAt: -1 });
    await Lead.collection.createIndex({ createdAt: -1 });
    console.log('✅ Lead indexes created');
    
    // User model indexes
    await User.collection.createIndex({ email: 1 }, { unique: true });
    await User.collection.createIndex({ role: 1 });
    console.log('✅ User indexes created');
    
    // CandidateProfile model indexes
    await CandidateProfile.collection.createIndex({ userId: 1, appliedAt: -1 });
    await CandidateProfile.collection.createIndex({ location: 1 });
    await CandidateProfile.collection.createIndex({ experience: 1 });
    await CandidateProfile.collection.createIndex({ skills: 1 });
    await CandidateProfile.collection.createIndex({ education: 1 });
    await CandidateProfile.collection.createIndex({ currentEmployer: 1 });
    await CandidateProfile.collection.createIndex({ currentEmploymentStatus: 1 });
    await CandidateProfile.collection.createIndex({ appliedAt: -1 });
    console.log('✅ CandidateProfile indexes created');
    
    console.log('✅ All database indexes created successfully');
  } catch (error) {
    console.error('❌ Error creating indexes:', error);
  }
}

// Optimize queries with timeout handling
function withTimeout(promise, timeoutMs = 30000) {
  return Promise.race([
    promise,
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Query timeout')), timeoutMs)
    )
  ]);
}

module.exports = {
  createIndexes,
  withTimeout
};
