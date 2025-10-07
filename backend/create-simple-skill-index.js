#!/usr/bin/env node

/**
 * Create Simple Skill Index
 * This script creates a simple skill indexing system that works with existing data
 */

require('dotenv').config();
const mongoose = require('mongoose');

async function createSimpleSkillIndex() {
  try {
    console.log('🚀 Creating Simple Skill Index...\n');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');
    
    // Create a simple skills collection
    const skillSchema = new mongoose.Schema({
      name: { type: String, required: true, unique: true, lowercase: true },
      category: { type: String, default: 'other' },
      popularity: { type: Number, default: 0 },
      candidates: [{ type: mongoose.Schema.Types.ObjectId, ref: 'CandidatesProfile' }],
      createdAt: { type: Date, default: Date.now }
    });
    
    // Create index for fast searching
    skillSchema.index({ name: 1 });
    skillSchema.index({ category: 1 });
    skillSchema.index({ popularity: -1 });
    
    const Skill = mongoose.model('Skill', skillSchema);
    
    // Get all unique skills from candidate profiles
    const CandidateProfile = require('./models/CandidatesProfile');
    const candidates = await CandidateProfile.find({}).select('skills');
    
    console.log(`📋 Found ${candidates.length} candidate profiles`);
    
    // Collect all unique skills
    const skillMap = new Map();
    
    candidates.forEach(candidate => {
      if (candidate.skills && Array.isArray(candidate.skills)) {
        candidate.skills.forEach(skillName => {
          if (skillName && skillName.trim()) {
            const normalizedSkill = skillName.toLowerCase().trim();
            if (!skillMap.has(normalizedSkill)) {
              skillMap.set(normalizedSkill, {
                name: normalizedSkill,
                candidates: [],
                count: 0
              });
            }
            skillMap.get(normalizedSkill).candidates.push(candidate._id);
            skillMap.get(normalizedSkill).count++;
          }
        });
      }
    });
    
    console.log(`🔍 Found ${skillMap.size} unique skills`);
    
    // Clear existing skills collection
    await Skill.deleteMany({});
    console.log('🗑️ Cleared existing skills');
    
    // Create skill documents
    const skillsToCreate = Array.from(skillMap.values()).map(skillData => ({
      name: skillData.name,
      popularity: skillData.count,
      candidates: skillData.candidates,
      category: categorizeSkill(skillData.name)
    }));
    
    // Insert skills in batches
    const batchSize = 100;
    for (let i = 0; i < skillsToCreate.length; i += batchSize) {
      const batch = skillsToCreate.slice(i, i + batchSize);
      await Skill.insertMany(batch);
      console.log(`✅ Created ${Math.min(i + batchSize, skillsToCreate.length)}/${skillsToCreate.length} skills`);
    }
    
    // Create indexes
    await Skill.ensureIndexes();
    console.log('🔍 Created skill indexes');
    
    // Show top skills
    const topSkills = await Skill.find({}).sort({ popularity: -1 }).limit(10);
    console.log('\n📊 Top 10 Most Popular Skills:');
    topSkills.forEach((skill, index) => {
      console.log(`   ${index + 1}. ${skill.name} (${skill.category}) - ${skill.popularity} candidates`);
    });
    
    console.log('\n✅ Simple Skill Index created successfully!');
    console.log('\n📊 System Features:');
    console.log('   - ✅ Skill database with candidate mappings');
    console.log('   - ✅ Skill popularity tracking');
    console.log('   - ✅ Category-based organization');
    console.log('   - ✅ Fast skill-based searches');
    
    return true;
    
  } catch (error) {
    console.error('❌ Error creating skill index:', error);
    return false;
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Disconnected from MongoDB');
  }
}

function categorizeSkill(skillName) {
  const skill = skillName.toLowerCase();
  
  // Programming Languages
  if (['javascript', 'python', 'java', 'c++', 'c#', 'go', 'rust', 'swift', 'kotlin', 'php', 'ruby', 'scala', 'typescript'].includes(skill)) {
    return 'programming';
  }
  
  // Frameworks
  if (['react', 'angular', 'vue', 'svelte', 'next.js', 'nuxt.js', 'node.js', 'express.js', 'django', 'flask', 'spring boot', 'laravel', 'rails', 'asp.net'].includes(skill)) {
    return 'framework';
  }
  
  // Databases
  if (['mysql', 'postgresql', 'mongodb', 'redis', 'elasticsearch', 'sqlite', 'oracle', 'sql server', 'sql'].includes(skill)) {
    return 'database';
  }
  
  // Cloud & DevOps
  if (['aws', 'azure', 'google cloud', 'docker', 'kubernetes', 'jenkins', 'gitlab ci', 'github actions'].includes(skill)) {
    return 'cloud';
  }
  
  // Design
  if (['figma', 'photoshop', 'illustrator', 'sketch', 'adobe xd', 'ui/ux design', 'adobe creative suite', 'html/css'].includes(skill)) {
    return 'design';
  }
  
  // Tools
  if (['git', 'jira', 'confluence', 'slack', 'trello', 'excel', 'tableau'].includes(skill)) {
    return 'tool';
  }
  
  // Languages
  if (['english', 'hindi', 'spanish', 'french', 'german', 'mandarin', 'japanese', 'portuguese'].includes(skill)) {
    return 'language';
  }
  
  // Business & Management
  if (['project management', 'team leadership', 'agile', 'scrum', 'data analysis', 'business'].includes(skill)) {
    return 'business';
  }
  
  return 'other';
}

// Run if called directly
if (require.main === module) {
  createSimpleSkillIndex()
    .then(success => {
      if (success) {
        console.log('\n🎉 Simple Skill Index setup complete!');
      } else {
        console.log('\n💥 Setup failed');
      }
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('❌ Setup failed:', error);
      process.exit(1);
    });
}

module.exports = createSimpleSkillIndex;




