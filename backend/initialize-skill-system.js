#!/usr/bin/env node

/**
 * Initialize Skill Management System
 * This script sets up the skill indexing system for efficient candidate search
 */

require('dotenv').config();
const mongoose = require('mongoose');
const skillService = require('./services/skillService');

async function initializeSkillSystem() {
  try {
    console.log('🚀 Initializing Skill Management System...\n');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');
    
    // Initialize default skills
    console.log('\n📚 Initializing default skills...');
    await skillService.initializeDefaultSkills();
    
    // Create skill indexes
    console.log('\n🔍 Creating skill indexes...');
    await skillService.createSkillIndex();
    
    // Update existing candidate profiles with skill indexing
    console.log('\n👥 Updating candidate profiles with skill indexing...');
    await updateCandidateProfilesWithSkills();
    
    console.log('\n✅ Skill Management System initialized successfully!');
    console.log('\n📊 System Features:');
    console.log('   - ✅ Skill database with 50+ predefined skills');
    console.log('   - ✅ Skill indexing for fast search');
    console.log('   - ✅ Candidate-skill mapping');
    console.log('   - ✅ Skill-based candidate search');
    console.log('   - ✅ Skill popularity tracking');
    console.log('   - ✅ Skill autocomplete');
    console.log('   - ✅ Skill statistics');
    
    console.log('\n🌐 Available API Endpoints:');
    console.log('   - GET /api/skills/search?q=react - Search skills');
    console.log('   - GET /api/skills/popular - Get popular skills');
    console.log('   - GET /api/skills/categories - Get skill categories');
    console.log('   - POST /api/skills/candidates/search - Advanced skill search');
    console.log('   - GET /api/skills/statistics/:skillName - Get skill stats');
    
  } catch (error) {
    console.error('❌ Error initializing skill system:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Disconnected from MongoDB');
  }
}

async function updateCandidateProfilesWithSkills() {
  try {
    const CandidateProfile = require('./models/CandidatesProfile');
    const User = require('./models/User');
    const candidates = await CandidateProfile.find({}).populate('userId');
    
    console.log(`📋 Found ${candidates.length} candidate profiles to update`);
    
    let updatedCount = 0;
    for (const candidate of candidates) {
      if (candidate.skills && Array.isArray(candidate.skills) && candidate.skills.length > 0) {
        try {
          // Update candidate skills using the skill service
          await skillService.updateCandidateSkillsFromProfile(candidate._id, candidate.skills);
          updatedCount++;
          
          if (updatedCount % 10 === 0) {
            console.log(`   📝 Updated ${updatedCount}/${candidates.length} candidates...`);
          }
        } catch (error) {
          console.error(`❌ Error updating candidate ${candidate._id}:`, error.message);
        }
      }
    }
    
    console.log(`✅ Updated ${updatedCount} candidate profiles with skill indexing`);
    
  } catch (error) {
    console.error('❌ Error updating candidate profiles:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  initializeSkillSystem()
    .then(() => {
      console.log('\n🎉 Skill Management System setup complete!');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n💥 Setup failed:', error);
      process.exit(1);
    });
}

module.exports = initializeSkillSystem;
