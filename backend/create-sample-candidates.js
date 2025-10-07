#!/usr/bin/env node

/**
 * Create Sample Candidate Data
 * Creates sample candidate profiles for testing the search functionality
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const CandidateProfile = require('./models/CandidatesProfile');
const Job = require('./models/Job');

async function createSampleCandidates() {
  try {
    console.log('🚀 Creating sample candidate data...\n');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');
    
    // Clear existing test data
    await User.deleteMany({ email: { $regex: /^testcandidate/ } });
    await CandidateProfile.deleteMany({ userId: { $in: await User.find({ email: { $regex: /^testcandidate/ } }).select('_id') } });
    console.log('🗑️ Cleared existing test candidate data');
    
    // Create sample users
    const sampleUsers = [
      {
        name: 'John Developer',
        email: 'testcandidate1@example.com',
        password: await bcrypt.hash('TestPass123!', 10),
        role: 'candidate',
        phone: '+1234567890'
      },
      {
        name: 'Sarah Engineer',
        email: 'testcandidate2@example.com',
        password: await bcrypt.hash('TestPass123!', 10),
        role: 'candidate',
        phone: '+1234567891'
      },
      {
        name: 'Mike Designer',
        email: 'testcandidate3@example.com',
        password: await bcrypt.hash('TestPass123!', 10),
        role: 'candidate',
        phone: '+1234567892'
      },
      {
        name: 'Lisa Analyst',
        email: 'testcandidate4@example.com',
        password: await bcrypt.hash('TestPass123!', 10),
        role: 'candidate',
        phone: '+1234567893'
      },
      {
        name: 'David Manager',
        email: 'testcandidate5@example.com',
        password: await bcrypt.hash('TestPass123!', 10),
        role: 'candidate',
        phone: '+1234567894'
      }
    ];
    
    const users = await User.insertMany(sampleUsers);
    console.log(`✅ Created ${users.length} test candidate users`);
    
    // Get a sample job for the candidates
    let sampleJob = await Job.findOne();
    if (!sampleJob) {
      // Create a sample job if none exists
      sampleJob = new Job({
        title: 'Sample Software Developer',
        description: 'A sample job for testing',
        location: 'Bangalore',
        salaryRange: '5-10 LPA',
        experience: '2-5 years',
        skills: ['JavaScript', 'React', 'Node.js'],
        postedBy: users[0]._id,
        companyId: null,
        status: 'active'
      });
      await sampleJob.save();
      console.log('✅ Created sample job');
    }
    
    // Create sample candidate profiles
    const sampleProfiles = [
      {
        userId: users[0]._id,
        jobId: sampleJob._id,
        name: 'John Developer',
        email: 'testcandidate1@example.com',
        phone: '+1234567890',
        location: 'Bangalore',
        experience: 3,
        skills: ['JavaScript', 'React', 'Node.js', 'MongoDB'],
        education: 'B.Tech Computer Science',
        currentEmployer: 'Tech Corp',
        currentEmploymentStatus: 'Employed',
        appliedAt: new Date()
      },
      {
        userId: users[1]._id,
        jobId: sampleJob._id,
        name: 'Sarah Engineer',
        email: 'testcandidate2@example.com',
        phone: '+1234567891',
        location: 'Mumbai',
        experience: 5,
        skills: ['Python', 'Django', 'PostgreSQL', 'AWS'],
        education: 'M.Tech Software Engineering',
        currentEmployer: 'Data Solutions Ltd',
        currentEmploymentStatus: 'Employed',
        appliedAt: new Date()
      },
      {
        userId: users[2]._id,
        jobId: sampleJob._id,
        name: 'Mike Designer',
        email: 'testcandidate3@example.com',
        phone: '+1234567892',
        location: 'Delhi',
        experience: 2,
        skills: ['UI/UX Design', 'Figma', 'Adobe Creative Suite', 'HTML/CSS'],
        education: 'B.Des Graphic Design',
        currentEmployer: 'Design Studio',
        currentEmploymentStatus: 'Employed',
        appliedAt: new Date()
      },
      {
        userId: users[3]._id,
        jobId: sampleJob._id,
        name: 'Lisa Analyst',
        email: 'testcandidate4@example.com',
        phone: '+1234567893',
        location: 'Chennai',
        experience: 4,
        skills: ['Data Analysis', 'SQL', 'Excel', 'Tableau', 'Python'],
        education: 'MBA Business Analytics',
        currentEmployer: 'Analytics Pro',
        currentEmploymentStatus: 'Employed',
        appliedAt: new Date()
      },
      {
        userId: users[4]._id,
        jobId: sampleJob._id,
        name: 'David Manager',
        email: 'testcandidate5@example.com',
        phone: '+1234567894',
        location: 'Bangalore',
        experience: 7,
        skills: ['Project Management', 'Team Leadership', 'Agile', 'Scrum'],
        education: 'MBA Project Management',
        currentEmployer: 'Management Inc',
        currentEmploymentStatus: 'Employed',
        appliedAt: new Date()
      }
    ];
    
    const profiles = await CandidateProfile.insertMany(sampleProfiles);
    console.log(`✅ Created ${profiles.length} test candidate profiles`);
    
    console.log('\n📊 Sample Data Summary:');
    console.log('👥 Users created:');
    users.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.name} (${user.email})`);
    });
    
    console.log('\n📋 Candidate Profiles created:');
    profiles.forEach((profile, index) => {
      console.log(`   ${index + 1}. ${profile.name}`);
      console.log(`      Location: ${profile.location}`);
      console.log(`      Experience: ${profile.experience} years`);
      console.log(`      Skills: ${profile.skills.join(', ')}`);
      console.log(`      Education: ${profile.education}`);
      console.log(`      Current Employer: ${profile.currentEmployer}`);
      console.log('');
    });
    
    console.log('🎉 Sample candidate data created successfully!');
    console.log('\n💡 You can now test candidate search with these sample profiles:');
    console.log('   - Search by location: "Bangalore", "Mumbai", "Delhi", "Chennai"');
    console.log('   - Search by skills: "JavaScript", "Python", "UI/UX Design", "Data Analysis"');
    console.log('   - Search by experience: "2-5", "5-7"');
    console.log('   - Search by education: "B.Tech", "MBA", "M.Tech"');
    console.log('   - Search by employer: "Tech Corp", "Data Solutions Ltd"');
    
  } catch (error) {
    console.error('❌ Error creating sample candidates:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Disconnected from MongoDB');
  }
}

// Run if called directly
if (require.main === module) {
  createSampleCandidates();
}

module.exports = createSampleCandidates;





