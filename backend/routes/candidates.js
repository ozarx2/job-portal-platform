const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const CandidateProfile = require('../models/CandidatesProfile');
const User = require('../models/User');
const Application = require('../models/Application');
const Job = require('../models/Job');
const skillService = require('../services/skillService');

// GET /api/candidates/search - Search candidates with filters
router.get('/search', verifyToken, async (req, res) => {
  // Disable ETag caching for this endpoint to ensure fresh data
  res.set({
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
    'ETag': ''
  });
  
  try {
    const {
      query,
      location,
      experience,
      skills,
      salary,
      education,
      currentEmployer,
      employmentStatus,
      page = 1,
      limit = 20
    } = req.query;

    // Validate that at least one search parameter is provided
    const hasSearchCriteria = query || location || experience || skills || education || currentEmployer || employmentStatus;
    
    if (!hasSearchCriteria) {
      return res.status(400).json({
        success: false,
        message: 'At least one search criteria must be provided'
      });
    }

    // Build search query
    const searchQuery = {};
    
    // Enhanced text search with skill indexing
    if (query && query.trim() && query.trim().length > 0) {
      try {
        const searchTerm = query.trim();
        
        // First, try to find matching skills
        const matchingSkills = await skillService.searchSkills(searchTerm, 10);
        
        if (matchingSkills.length > 0) {
          // Use skill-based search for better results
          const skillNames = matchingSkills.map(skill => skill.name);
          console.log('🔍 Found matching skills:', skillNames);
          
          // Create search query with skill matching
          searchQuery.$or = [
            { education: { $regex: searchTerm, $options: 'i' } },
            { currentEmployer: { $regex: searchTerm, $options: 'i' } },
            { skills: { $in: skillNames } }
          ];
        } else {
          // Fallback to regex search
          const escapedQuery = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          const searchRegex = new RegExp(escapedQuery, 'i');
          searchQuery.$or = [
            { education: searchRegex },
            { currentEmployer: searchRegex },
            { skills: { $in: [searchRegex] } }
          ];
          console.log('🔍 Using regex search for:', searchTerm);
        }
      } catch (error) {
        console.error('❌ Error in enhanced search:', error);
        // Fallback to simple regex search
        const escapedQuery = query.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        if (escapedQuery.length > 0) {
          const searchRegex = new RegExp(escapedQuery, 'i');
          searchQuery.$or = [
            { education: searchRegex },
            { currentEmployer: searchRegex },
            { skills: { $in: [searchRegex] } }
          ];
        }
      }
    }

    // Location filter
    if (location && location.trim() && location.trim().length > 0) {
      try {
        const escapedLocation = location.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        if (escapedLocation.length > 0) {
          searchQuery.location = { $regex: escapedLocation, $options: 'i' };
        }
      } catch (error) {
        console.error('❌ Error creating location regex:', error);
      }
    }

    // Experience filter (range)
    if (experience && experience.toString().trim().length > 0) {
      console.log('🔍 Processing experience:', experience);
      // Clean the experience string - remove non-numeric characters except dash
      const cleanExp = experience.toString().replace(/[^0-9\-]/g, '');
      console.log('🔍 Cleaned experience:', cleanExp);
      
      if (cleanExp.includes('-')) {
        const parts = cleanExp.split('-');
        console.log('🔍 Experience parts:', parts);
        if (parts.length === 2) {
          const min = parseInt(parts[0]);
          const max = parseInt(parts[1]);
          console.log('🔍 Parsed experience:', { min, max });
          if (!isNaN(min) && !isNaN(max) && min > 0 && max > 0) {
            searchQuery.experience = { $gte: min, $lte: max };
            console.log('🔍 Added experience filter:', searchQuery.experience);
          }
        }
      } else {
        const expNum = parseInt(cleanExp);
        console.log('🔍 Single experience value:', expNum);
        if (!isNaN(expNum) && expNum > 0) {
          searchQuery.experience = { $gte: expNum };
          console.log('🔍 Added experience filter:', searchQuery.experience);
        }
      }
    }

    // Skills filter
    if (skills && skills.trim() && skills.trim().length > 0) {
      try {
        const skillsArray = skills.split(',').map(skill => skill.trim()).filter(skill => skill.length > 0);
        if (skillsArray.length > 0) {
          const skillRegexes = skillsArray.map(skill => {
            const escapedSkill = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            if (escapedSkill.length > 0) {
              return new RegExp(escapedSkill, 'i');
            }
            return null;
          }).filter(regex => regex !== null);
          
          if (skillRegexes.length > 0) {
            searchQuery.skills = { $in: skillRegexes };
            console.log('🔍 Created skills search with regexes:', skillRegexes);
          }
        }
      } catch (error) {
        console.error('❌ Error creating skills regex:', error);
      }
    }

    // Education filter
    if (education && education.trim() && education.trim().length > 0) {
      try {
        const escapedEducation = education.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        if (escapedEducation.length > 0) {
          searchQuery.education = { $regex: escapedEducation, $options: 'i' };
        }
      } catch (error) {
        console.error('❌ Error creating education regex:', error);
      }
    }

    // Current employer filter
    if (currentEmployer && currentEmployer.trim() && currentEmployer.trim().length > 0) {
      try {
        const escapedEmployer = currentEmployer.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        if (escapedEmployer.length > 0) {
          searchQuery.currentEmployer = { $regex: escapedEmployer, $options: 'i' };
        }
      } catch (error) {
        console.error('❌ Error creating employer regex:', error);
      }
    }

    // Employment status filter
    if (employmentStatus && employmentStatus.trim() && employmentStatus.trim().length > 0) {
      searchQuery.currentEmploymentStatus = employmentStatus.trim();
    }

    // Additional validation to prevent empty queries
    if (Object.keys(searchQuery).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid search criteria provided'
      });
    }

    console.log('🔍 Received parameters:', {
      query: query,
      location: location,
      experience: experience,
      skills: skills,
      education: education,
      currentEmployer: currentEmployer,
      employmentStatus: employmentStatus
    });
    console.log('🔍 Candidate search query:', JSON.stringify(searchQuery, null, 2));

    // Execute search with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const candidates = await CandidateProfile.find(searchQuery)
      .populate({
        path: 'userId',
        select: 'name email phone role createdAt',
        match: { role: 'candidate' } // Only include actual candidates
      })
      .populate({
        path: 'jobId',
        select: 'title description location salaryRange jobType category'
      })
      .sort({ appliedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Filter out candidates where user doesn't exist or isn't a candidate
    const validCandidates = candidates.filter(candidate => candidate.userId);

    // Get total count for pagination
    const totalCount = await CandidateProfile.countDocuments(searchQuery);

    // Format response
    const formattedCandidates = validCandidates.map(candidate => ({
      id: candidate._id,
      userId: candidate.userId._id,
      name: candidate.userId.name,
      email: candidate.userId.email,
      phone: candidate.userId.phone,
      education: candidate.education,
      experience: candidate.experience,
      age: candidate.age,
      location: candidate.location,
      resumeUrl: candidate.resumeUrl,
      currentEmployer: candidate.currentEmployer,
      currentEmploymentStatus: candidate.currentEmploymentStatus,
      skills: candidate.skills,
      appliedAt: candidate.appliedAt,
      appliedForJob: {
        id: candidate.jobId._id,
        title: candidate.jobId.title,
        location: candidate.jobId.location,
        salaryRange: candidate.jobId.salaryRange,
        jobType: candidate.jobId.jobType,
        category: candidate.jobId.category
      }
    }));

    res.json({
      success: true,
      data: formattedCandidates,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / limit),
        totalCandidates: totalCount,
        hasNextPage: skip + parseInt(limit) < totalCount,
        hasPrevPage: parseInt(page) > 1
      },
      searchCriteria: {
        query,
        location,
        experience,
        skills,
        education,
        currentEmployer,
        employmentStatus
      },
      timestamp: new Date().toISOString(),
      requestId: Math.random().toString(36).substr(2, 9)
    });

  } catch (error) {
    console.error('❌ Candidate search error:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching candidates',
      error: error.message
    });
  }
});

// GET /api/candidates/:id - Get candidate details
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const candidateId = req.params.id;

    const candidate = await CandidateProfile.findById(candidateId)
      .populate({
        path: 'userId',
        select: 'name email phone role createdAt'
      })
      .populate({
        path: 'jobId',
        select: 'title description location salaryRange jobType category companyId',
        populate: {
          path: 'companyId',
          select: 'name industry location website'
        }
      });

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: 'Candidate not found'
      });
    }

    if (!candidate.userId || candidate.userId.role !== 'candidate') {
      return res.status(404).json({
        success: false,
        message: 'Invalid candidate profile'
      });
    }

    // Get candidate's application history
    const applications = await Application.find({ candidate: candidate.userId._id })
      .populate({
        path: 'job',
        select: 'title location salaryRange jobType category companyId',
        populate: {
          path: 'companyId',
          select: 'name industry'
        }
      })
      .sort({ createdAt: -1 })
      .limit(10);

    const formattedCandidate = {
      id: candidate._id,
      userId: candidate.userId._id,
      name: candidate.userId.name,
      email: candidate.userId.email,
      phone: candidate.userId.phone,
      education: candidate.education,
      experience: candidate.experience,
      age: candidate.age,
      location: candidate.location,
      resumeUrl: candidate.resumeUrl,
      currentEmployer: candidate.currentEmployer,
      currentEmploymentStatus: candidate.currentEmploymentStatus,
      skills: candidate.skills,
      appliedAt: candidate.appliedAt,
      appliedForJob: {
        id: candidate.jobId._id,
        title: candidate.jobId.title,
        location: candidate.jobId.location,
        salaryRange: candidate.jobId.salaryRange,
        jobType: candidate.jobId.jobType,
        category: candidate.jobId.category,
        company: candidate.jobId.companyId
      },
      applicationHistory: applications.map(app => ({
        id: app._id,
        job: app.job,
        status: app.status,
        appliedAt: app.createdAt
      }))
    };

    res.json({
      success: true,
      data: formattedCandidate
    });

  } catch (error) {
    console.error('❌ Get candidate details error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching candidate details',
      error: error.message
    });
  }
});

// POST /api/candidates/:id/contact - Contact candidate
router.post('/:id/contact', verifyToken, async (req, res) => {
  try {
    const candidateId = req.params.id;
    const { message, subject } = req.body;
    const employerId = req.user.id;

    // Verify candidate exists
    const candidate = await CandidateProfile.findById(candidateId)
      .populate('userId', 'name email');

    if (!candidate || !candidate.userId) {
      return res.status(404).json({
        success: false,
        message: 'Candidate not found'
      });
    }

    // Get employer details
    const employer = await User.findById(employerId);
    if (!employer || employer.role !== 'employer') {
      return res.status(403).json({
        success: false,
        message: 'Only employers can contact candidates'
      });
    }

    // Here you would typically send an email or notification
    // For now, we'll just log the contact attempt
    console.log(`📧 Contact attempt from ${employer.name} (${employer.email}) to candidate ${candidate.userId.name} (${candidate.userId.email})`);
    console.log(`Subject: ${subject || 'Job Opportunity'}`);
    console.log(`Message: ${message || 'Interested in your profile'}`);

    // TODO: Implement actual email/notification system
    // await emailService.sendCandidateContact({
    //   to: candidate.userId.email,
    //   from: employer.email,
    //   subject: subject || 'Job Opportunity',
    //   message: message || 'We are interested in your profile and would like to discuss potential opportunities.'
    // });

    res.json({
      success: true,
      message: 'Contact message sent successfully',
      data: {
        candidateName: candidate.userId.name,
        candidateEmail: candidate.userId.email,
        employerName: employer.name,
        message: message || 'Interested in your profile',
        timestamp: new Date()
      }
    });

  } catch (error) {
    console.error('❌ Contact candidate error:', error);
    res.status(500).json({
      success: false,
      message: 'Error contacting candidate',
      error: error.message
    });
  }
});

// GET /api/candidates - Get all candidates (for admin/employer)
router.get('/', verifyToken, async (req, res) => {
  try {
    const { page = 1, limit = 20, sortBy = 'appliedAt', sortOrder = 'desc' } = req.query;
    
    // Check if user is admin or employer
    const user = await User.findById(req.user.id);
    if (!user || !['admin', 'employer'].includes(user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only admins and employers can view all candidates.'
      });
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const candidates = await CandidateProfile.find()
      .populate({
        path: 'userId',
        select: 'name email phone role createdAt'
      })
      .populate({
        path: 'jobId',
        select: 'title location salaryRange jobType category'
      })
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    // Filter out invalid candidates
    const validCandidates = candidates.filter(candidate => candidate.userId);

    const totalCount = await CandidateProfile.countDocuments();

    const formattedCandidates = validCandidates.map(candidate => ({
      id: candidate._id,
      userId: candidate.userId._id,
      name: candidate.userId.name,
      email: candidate.userId.email,
      phone: candidate.userId.phone,
      education: candidate.education,
      experience: candidate.experience,
      age: candidate.age,
      location: candidate.location,
      resumeUrl: candidate.resumeUrl,
      currentEmployer: candidate.currentEmployer,
      currentEmploymentStatus: candidate.currentEmploymentStatus,
      skills: candidate.skills,
      appliedAt: candidate.appliedAt,
      appliedForJob: candidate.jobId ? {
        id: candidate.jobId._id,
        title: candidate.jobId.title,
        location: candidate.jobId.location,
        salaryRange: candidate.jobId.salaryRange,
        jobType: candidate.jobId.jobType,
        category: candidate.jobId.category
      } : null
    }));

    res.json({
      success: true,
      data: formattedCandidates,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / limit),
        totalCandidates: totalCount,
        hasNextPage: skip + parseInt(limit) < totalCount,
        hasPrevPage: parseInt(page) > 1
      }
    });

  } catch (error) {
    console.error('❌ Get all candidates error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching candidates',
      error: error.message
    });
  }
});

module.exports = router;
