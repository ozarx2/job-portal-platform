const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const skillService = require('../services/skillService');

// GET /api/skills/search - Search skills with autocomplete
router.get('/search', async (req, res) => {
  try {
    const { q: query, limit = 10 } = req.query;
    
    if (!query || query.trim().length < 2) {
      return res.json({
        success: true,
        data: [],
        message: 'Query must be at least 2 characters long'
      });
    }

    const skills = await skillService.searchSkills(query, parseInt(limit));
    
    res.json({
      success: true,
      data: skills,
      query: query,
      count: skills.length
    });

  } catch (error) {
    console.error('❌ Error searching skills:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching skills',
      error: error.message
    });
  }
});

// GET /api/skills/popular - Get popular skills
router.get('/popular', async (req, res) => {
  try {
    const { category, limit = 20 } = req.query;
    
    const skills = await skillService.getPopularSkills(category, parseInt(limit));
    
    res.json({
      success: true,
      data: skills,
      category: category || 'all',
      count: skills.length
    });

  } catch (error) {
    console.error('❌ Error getting popular skills:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting popular skills',
      error: error.message
    });
  }
});

// GET /api/skills/categories - Get skill categories
router.get('/categories', async (req, res) => {
  try {
    const categories = [
      { name: 'programming', displayName: 'Programming Languages', count: 0 },
      { name: 'framework', displayName: 'Frameworks & Libraries', count: 0 },
      { name: 'database', displayName: 'Databases', count: 0 },
      { name: 'cloud', displayName: 'Cloud Platforms', count: 0 },
      { name: 'devops', displayName: 'DevOps & Tools', count: 0 },
      { name: 'design', displayName: 'Design Tools', count: 0 },
      { name: 'marketing', displayName: 'Marketing', count: 0 },
      { name: 'business', displayName: 'Business', count: 0 },
      { name: 'language', displayName: 'Languages', count: 0 },
      { name: 'tool', displayName: 'Tools', count: 0 },
      { name: 'other', displayName: 'Other', count: 0 }
    ];

    // Get count for each category
    const Skill = require('../models/Skill');
    for (const category of categories) {
      category.count = await Skill.countDocuments({ 
        category: category.name, 
        isActive: true 
      });
    }

    res.json({
      success: true,
      data: categories,
      count: categories.length
    });

  } catch (error) {
    console.error('❌ Error getting skill categories:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting skill categories',
      error: error.message
    });
  }
});

// GET /api/skills/candidates/:skillName - Find candidates by skill
router.get('/candidates/:skillName', verifyToken, async (req, res) => {
  try {
    const { skillName } = req.params;
    const {
      proficiency,
      minYearsExperience = 0,
      isVerified,
      limit = 50
    } = req.query;

    const options = {
      proficiency: proficiency || null,
      minYearsExperience: parseInt(minYearsExperience),
      isVerified: isVerified === 'true' ? true : isVerified === 'false' ? false : null,
      limit: parseInt(limit)
    };

    const results = await skillService.findCandidatesBySkills([skillName], options);
    
    res.json({
      success: true,
      data: results,
      skillName: skillName,
      options: options,
      count: results.length
    });

  } catch (error) {
    console.error('❌ Error finding candidates by skill:', error);
    res.status(500).json({
      success: false,
      message: 'Error finding candidates by skill',
      error: error.message
    });
  }
});

// POST /api/skills/candidates/search - Advanced skill-based candidate search
router.post('/candidates/search', verifyToken, async (req, res) => {
  try {
    const {
      skills = [],
      proficiency,
      minYearsExperience = 0,
      isVerified,
      limit = 50,
      sortBy = 'matchScore' // matchScore, totalExperience, skillCount
    } = req.body;

    if (!skills || skills.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one skill must be provided'
      });
    }

    const options = {
      proficiency: proficiency || null,
      minYearsExperience: parseInt(minYearsExperience),
      isVerified: isVerified === true ? true : isVerified === false ? false : null,
      limit: parseInt(limit)
    };

    const results = await skillService.findCandidatesBySkills(skills, options);
    
    // Apply sorting
    if (sortBy === 'totalExperience') {
      results.sort((a, b) => b.totalExperience - a.totalExperience);
    } else if (sortBy === 'skillCount') {
      results.sort((a, b) => b.skillCount - a.skillCount);
    }
    // Default sort by matchScore is already applied in service

    res.json({
      success: true,
      data: results,
      searchCriteria: {
        skills,
        options,
        sortBy
      },
      count: results.length
    });

  } catch (error) {
    console.error('❌ Error in advanced skill search:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching candidates by skills',
      error: error.message
    });
  }
});

// GET /api/skills/statistics/:skillName - Get skill statistics
router.get('/statistics/:skillName', async (req, res) => {
  try {
    const { skillName } = req.params;
    
    const stats = await skillService.getSkillStatistics(skillName);
    
    res.json({
      success: true,
      data: stats,
      skillName: skillName
    });

  } catch (error) {
    console.error('❌ Error getting skill statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting skill statistics',
      error: error.message
    });
  }
});

// GET /api/skills/candidate/:candidateId - Get candidate skills
router.get('/candidate/:candidateId', verifyToken, async (req, res) => {
  try {
    const { candidateId } = req.params;
    
    const skills = await skillService.getCandidateSkills(candidateId);
    
    res.json({
      success: true,
      data: skills,
      candidateId: candidateId,
      count: skills.length
    });

  } catch (error) {
    console.error('❌ Error getting candidate skills:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting candidate skills',
      error: error.message
    });
  }
});

// POST /api/skills/candidate/:candidateId - Add skill to candidate
router.post('/candidate/:candidateId', verifyToken, async (req, res) => {
  try {
    const { candidateId } = req.params;
    const { skillName, proficiency = 'intermediate', yearsOfExperience = 0 } = req.body;

    if (!skillName || skillName.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Skill name is required'
      });
    }

    const candidateSkill = await skillService.addSkillToCandidate(
      candidateId,
      skillName.trim(),
      proficiency,
      parseInt(yearsOfExperience)
    );
    
    res.json({
      success: true,
      data: candidateSkill,
      message: 'Skill added to candidate successfully'
    });

  } catch (error) {
    console.error('❌ Error adding skill to candidate:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding skill to candidate',
      error: error.message
    });
  }
});

// DELETE /api/skills/candidate/:candidateId/:skillId - Remove skill from candidate
router.delete('/candidate/:candidateId/:skillId', verifyToken, async (req, res) => {
  try {
    const { candidateId, skillId } = req.params;
    
    const result = await skillService.removeSkillFromCandidate(candidateId, skillId);
    
    if (result) {
      res.json({
        success: true,
        message: 'Skill removed from candidate successfully'
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Candidate skill not found'
      });
    }

  } catch (error) {
    console.error('❌ Error removing skill from candidate:', error);
    res.status(500).json({
      success: false,
      message: 'Error removing skill from candidate',
      error: error.message
    });
  }
});

// GET /api/skills/recommendations/:candidateId - Get skill recommendations for candidate
router.get('/recommendations/:candidateId', verifyToken, async (req, res) => {
  try {
    const { candidateId } = req.params;
    const { limit = 5 } = req.query;
    
    const recommendations = await skillService.getSkillRecommendations(
      candidateId, 
      parseInt(limit)
    );
    
    res.json({
      success: true,
      data: recommendations,
      candidateId: candidateId,
      count: recommendations.length
    });

  } catch (error) {
    console.error('❌ Error getting skill recommendations:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting skill recommendations',
      error: error.message
    });
  }
});

// POST /api/skills/initialize - Initialize default skills (Admin only)
router.post('/initialize', verifyToken, async (req, res) => {
  try {
    // Check if user is admin
    const User = require('../models/User');
    const user = await User.findById(req.user.id);
    
    if (!user || user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin role required.'
      });
    }

    await skillService.initializeDefaultSkills();
    
    res.json({
      success: true,
      message: 'Default skills initialized successfully'
    });

  } catch (error) {
    console.error('❌ Error initializing default skills:', error);
    res.status(500).json({
      success: false,
      message: 'Error initializing default skills',
      error: error.message
    });
  }
});

// POST /api/skills/index - Create skill index (Admin only)
router.post('/index', verifyToken, async (req, res) => {
  try {
    // Check if user is admin
    const User = require('../models/User');
    const user = await User.findById(req.user.id);
    
    if (!user || user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin role required.'
      });
    }

    await skillService.createSkillIndex();
    
    res.json({
      success: true,
      message: 'Skill index created successfully'
    });

  } catch (error) {
    console.error('❌ Error creating skill index:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating skill index',
      error: error.message
    });
  }
});

module.exports = router;




