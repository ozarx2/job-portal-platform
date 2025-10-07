const Skill = require('../models/Skill');
const CandidateSkill = require('../models/CandidateSkill');
const CandidateProfile = require('../models/CandidatesProfile');

class SkillService {
  
  // Initialize default skills
  async initializeDefaultSkills() {
    const defaultSkills = [
      // Programming Languages
      { name: 'JavaScript', category: 'programming', aliases: ['js', 'ecmascript'] },
      { name: 'Python', category: 'programming', aliases: ['py'] },
      { name: 'Java', category: 'programming' },
      { name: 'C++', category: 'programming', aliases: ['cpp', 'cplusplus'] },
      { name: 'C#', category: 'programming', aliases: ['csharp'] },
      { name: 'Go', category: 'programming', aliases: ['golang'] },
      { name: 'Rust', category: 'programming' },
      { name: 'Swift', category: 'programming' },
      { name: 'Kotlin', category: 'programming' },
      { name: 'PHP', category: 'programming' },
      { name: 'Ruby', category: 'programming' },
      { name: 'Scala', category: 'programming' },
      { name: 'TypeScript', category: 'programming', aliases: ['ts'] },
      
      // Frontend Frameworks
      { name: 'React', category: 'framework', aliases: ['reactjs'] },
      { name: 'Angular', category: 'framework' },
      { name: 'Vue.js', category: 'framework', aliases: ['vue', 'vuejs'] },
      { name: 'Svelte', category: 'framework' },
      { name: 'Next.js', category: 'framework' },
      { name: 'Nuxt.js', category: 'framework' },
      
      // Backend Frameworks
      { name: 'Node.js', category: 'framework', aliases: ['nodejs', 'node'] },
      { name: 'Express.js', category: 'framework', aliases: ['express'] },
      { name: 'Django', category: 'framework' },
      { name: 'Flask', category: 'framework' },
      { name: 'Spring Boot', category: 'framework', aliases: ['spring'] },
      { name: 'Laravel', category: 'framework' },
      { name: 'Rails', category: 'framework', aliases: ['ruby on rails'] },
      { name: 'ASP.NET', category: 'framework', aliases: ['aspnet'] },
      
      // Databases
      { name: 'MySQL', category: 'database' },
      { name: 'PostgreSQL', category: 'database', aliases: ['postgres'] },
      { name: 'MongoDB', category: 'database' },
      { name: 'Redis', category: 'database' },
      { name: 'Elasticsearch', category: 'database' },
      { name: 'SQLite', category: 'database' },
      { name: 'Oracle', category: 'database' },
      { name: 'SQL Server', category: 'database' },
      
      // Cloud Platforms
      { name: 'AWS', category: 'cloud', aliases: ['amazon web services'] },
      { name: 'Azure', category: 'cloud', aliases: ['microsoft azure'] },
      { name: 'Google Cloud', category: 'cloud', aliases: ['gcp', 'gcloud'] },
      { name: 'Docker', category: 'devops', aliases: ['containerization'] },
      { name: 'Kubernetes', category: 'devops', aliases: ['k8s'] },
      { name: 'Jenkins', category: 'devops' },
      { name: 'GitLab CI', category: 'devops' },
      { name: 'GitHub Actions', category: 'devops' },
      
      // Design Tools
      { name: 'Figma', category: 'design' },
      { name: 'Adobe Photoshop', category: 'design', aliases: ['photoshop', 'ps'] },
      { name: 'Adobe Illustrator', category: 'design', aliases: ['illustrator', 'ai'] },
      { name: 'Sketch', category: 'design' },
      { name: 'Adobe XD', category: 'design', aliases: ['xd'] },
      
      // Other Tools
      { name: 'Git', category: 'tool' },
      { name: 'Jira', category: 'tool' },
      { name: 'Confluence', category: 'tool' },
      { name: 'Slack', category: 'tool' },
      { name: 'Trello', category: 'tool' },
      
      // Languages
      { name: 'English', category: 'language' },
      { name: 'Hindi', category: 'language' },
      { name: 'Spanish', category: 'language' },
      { name: 'French', category: 'language' },
      { name: 'German', category: 'language' },
      { name: 'Mandarin', category: 'language' },
      { name: 'Japanese', category: 'language' },
      { name: 'Portuguese', category: 'language' }
    ];

    console.log('🚀 Initializing default skills...');
    
    for (const skillData of defaultSkills) {
      try {
        const existingSkill = await Skill.findOne({ name: skillData.name });
        if (!existingSkill) {
          await Skill.create(skillData);
          console.log(`✅ Created skill: ${skillData.name}`);
        }
      } catch (error) {
        console.error(`❌ Error creating skill ${skillData.name}:`, error.message);
      }
    }
    
    console.log('✅ Default skills initialization complete');
  }

  // Search skills with autocomplete
  async searchSkills(query, limit = 10) {
    if (!query || query.trim().length < 2) {
      return [];
    }

    const searchTerm = query.trim();
    const skills = await Skill.searchSkills(searchTerm, limit);
    
    return skills.map(skill => ({
      id: skill._id,
      name: skill.name,
      category: skill.category,
      popularity: skill.popularity,
      aliases: skill.aliases
    }));
  }

  // Get popular skills by category
  async getPopularSkills(category = null, limit = 20) {
    const skills = await Skill.getPopularSkills(limit, category);
    
    return skills.map(skill => ({
      id: skill._id,
      name: skill.name,
      category: skill.category,
      popularity: skill.popularity
    }));
  }

  // Add skill to candidate
  async addSkillToCandidate(candidateId, skillName, proficiency = 'intermediate', yearsOfExperience = 0) {
    try {
      // Find or create skill
      let skill = await Skill.findOne({ name: skillName.toLowerCase() });
      if (!skill) {
        skill = await Skill.create({
          name: skillName,
          category: 'other'
        });
      }

      // Check if candidate already has this skill
      const existingCandidateSkill = await CandidateSkill.findOne({
        candidateId,
        skillId: skill._id
      });

      if (existingCandidateSkill) {
        // Update existing skill
        existingCandidateSkill.proficiency = proficiency;
        existingCandidateSkill.yearsOfExperience = yearsOfExperience;
        existingCandidateSkill.updatedAt = new Date();
        await existingCandidateSkill.save();
        return existingCandidateSkill;
      } else {
        // Create new candidate skill
        const candidateSkill = await CandidateSkill.create({
          candidateId,
          skillId: skill._id,
          skillName: skill.name,
          proficiency,
          yearsOfExperience
        });

        // Increment skill popularity
        await skill.incrementPopularity();
        
        return candidateSkill;
      }
    } catch (error) {
      console.error('Error adding skill to candidate:', error);
      throw error;
    }
  }

  // Remove skill from candidate
  async removeSkillFromCandidate(candidateId, skillId) {
    try {
      const result = await CandidateSkill.findOneAndDelete({
        candidateId,
        skillId
      });

      if (result) {
        // Decrement skill popularity
        const skill = await Skill.findById(skillId);
        if (skill && skill.popularity > 0) {
          skill.popularity -= 1;
          await skill.save();
        }
      }

      return result;
    } catch (error) {
      console.error('Error removing skill from candidate:', error);
      throw error;
    }
  }

  // Get candidate skills
  async getCandidateSkills(candidateId) {
    try {
      const candidateSkills = await CandidateSkill.find({ candidateId })
        .populate('skillId', 'name category')
        .sort({ yearsOfExperience: -1, proficiency: -1 });

      return candidateSkills.map(cs => ({
        id: cs._id,
        skillId: cs.skillId._id,
        skillName: cs.skillName,
        category: cs.skillId.category,
        proficiency: cs.proficiency,
        yearsOfExperience: cs.yearsOfExperience,
        isVerified: cs.isVerified,
        endorsements: cs.endorsements.length
      }));
    } catch (error) {
      console.error('Error getting candidate skills:', error);
      throw error;
    }
  }

  // Find candidates by skills
  async findCandidatesBySkills(skillNames, options = {}) {
    try {
      const {
        proficiency = null,
        minYearsExperience = 0,
        isVerified = null,
        limit = 50
      } = options;

      // Convert skill names to lowercase
      const normalizedSkillNames = skillNames.map(name => name.toLowerCase());

      // Find candidate skills matching the criteria
      const candidateSkills = await CandidateSkill.find({
        skillName: { $in: normalizedSkillNames },
        yearsOfExperience: { $gte: minYearsExperience },
        ...(proficiency && { proficiency }),
        ...(isVerified !== null && { isVerified })
      })
      .populate({
        path: 'candidateId',
        populate: {
          path: 'userId',
          select: 'name email phone role'
        }
      })
      .sort({ yearsOfExperience: -1, proficiency: -1 })
      .limit(limit);

      // Group by candidate
      const candidateMap = new Map();
      
      candidateSkills.forEach(cs => {
        const candidateId = cs.candidateId._id.toString();
        
        if (!candidateMap.has(candidateId)) {
          candidateMap.set(candidateId, {
            candidate: cs.candidateId,
            matchingSkills: []
          });
        }
        
        candidateMap.get(candidateId).matchingSkills.push({
          skillName: cs.skillName,
          proficiency: cs.proficiency,
          yearsOfExperience: cs.yearsOfExperience,
          isVerified: cs.isVerified
        });
      });

      // Convert to array and calculate match score
      const results = Array.from(candidateMap.values()).map(item => {
        const matchScore = item.matchingSkills.length / skillNames.length;
        const totalExperience = item.matchingSkills.reduce((sum, skill) => sum + skill.yearsOfExperience, 0);
        
        return {
          candidate: item.candidate,
          matchingSkills: item.matchingSkills,
          matchScore,
          totalExperience,
          skillCount: item.matchingSkills.length
        };
      });

      // Sort by match score and total experience
      return results.sort((a, b) => {
        if (a.matchScore !== b.matchScore) {
          return b.matchScore - a.matchScore;
        }
        return b.totalExperience - a.totalExperience;
      });

    } catch (error) {
      console.error('Error finding candidates by skills:', error);
      throw error;
    }
  }

  // Get skill statistics
  async getSkillStatistics(skillName) {
    try {
      const stats = await CandidateSkill.getSkillStats(skillName.toLowerCase());
      
      if (stats.length === 0) {
        return {
          totalCandidates: 0,
          averageExperience: 0,
          proficiencyDistribution: {},
          verifiedCount: 0
        };
      }

      const stat = stats[0];
      
      // Calculate proficiency distribution
      const proficiencyDistribution = stat.proficiencyDistribution.reduce((acc, proficiency) => {
        acc[proficiency] = (acc[proficiency] || 0) + 1;
        return acc;
      }, {});

      return {
        totalCandidates: stat.totalCandidates,
        averageExperience: Math.round(stat.averageExperience * 10) / 10,
        proficiencyDistribution,
        verifiedCount: stat.verifiedCount,
        verificationRate: Math.round((stat.verifiedCount / stat.totalCandidates) * 100)
      };
    } catch (error) {
      console.error('Error getting skill statistics:', error);
      throw error;
    }
  }

  // Get skill recommendations for candidate
  async getSkillRecommendations(candidateId, limit = 5) {
    try {
      const recommendations = await CandidateSkill.getSkillRecommendations(candidateId, limit);
      
      if (recommendations.length === 0) {
        // Return popular skills if no specific recommendations
        return await this.getPopularSkills(null, limit);
      }

      return recommendations[0].recommendations.map(skill => ({
        id: skill._id,
        name: skill.name,
        category: skill.category,
        popularity: skill.popularity
      }));
    } catch (error) {
      console.error('Error getting skill recommendations:', error);
      throw error;
    }
  }

  // Update candidate skills from profile
  async updateCandidateSkillsFromProfile(candidateId, skills) {
    try {
      if (!skills || !Array.isArray(skills)) {
        return [];
      }

      // Remove existing skills
      await CandidateSkill.deleteMany({ candidateId });

      // Add new skills
      const addedSkills = [];
      for (const skillName of skills) {
        if (skillName && skillName.trim()) {
          try {
            const candidateSkill = await this.addSkillToCandidate(
              candidateId,
              skillName.trim(),
              'intermediate',
              1 // Default 1 year experience
            );
            addedSkills.push(candidateSkill);
          } catch (error) {
            console.error(`Error adding skill ${skillName}:`, error.message);
          }
        }
      }

      return addedSkills;
    } catch (error) {
      console.error('Error updating candidate skills from profile:', error);
      throw error;
    }
  }

  // Create skill index for fast searching
  async createSkillIndex() {
    try {
      console.log('🔍 Creating skill index...');
      
      // Ensure all indexes are created
      await Skill.ensureIndexes();
      await CandidateSkill.ensureIndexes();
      
      console.log('✅ Skill index created successfully');
    } catch (error) {
      console.error('❌ Error creating skill index:', error);
      throw error;
    }
  }
}

module.exports = new SkillService();




