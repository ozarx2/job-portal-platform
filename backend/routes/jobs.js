const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const verifyEmployer = require('../middleware/verifyEmployer');
const { validateJobCreation, sanitizeBody, handleValidationError } = require('../middleware/validation');
const Job = require('../models/Job');
const User = require('../models/User');

// POST /api/jobs - Create a job
router.post('/', verifyToken, verifyEmployer, sanitizeBody, validateJobCreation, async (req, res) => {
  console.log('✅ JOB POST ROUTE HIT');
  console.log('Token User:', req.user);
  console.log('Request Body:', req.body);
  
  try {
    // Get user details to ensure they have companies
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    // Check if user has any companies (either primary or multiple)
    const hasCompanies = user.companyId || (user.companies && user.companies.length > 0);
    if (!hasCompanies) {
      return res.status(400).json({ 
        msg: 'User must be associated with at least one company to post jobs' 
      });
    }
    
    // Validate required fields
    const { title, description, location } = req.body;
    if (!title || !description || !location) {
      return res.status(400).json({ 
        msg: 'Missing required fields: title, description, and location are required' 
      });
    }
    
    // Determine which company to use for the job
    let selectedCompanyId;
    
    if (req.body.companyId && req.body.companyId !== '') {
      // Frontend provided a specific company
      selectedCompanyId = req.body.companyId;
      
      // Validate that user has access to this company
      const userCompanies = [];
      if (user.companyId) userCompanies.push(user.companyId.toString());
      if (user.companies) userCompanies.push(...user.companies.map(id => id.toString()));
      
      if (!userCompanies.includes(selectedCompanyId)) {
        return res.status(403).json({ 
          msg: 'You do not have permission to post jobs for this company' 
        });
      }
    } else {
      // No company specified, use primary company or first available
      selectedCompanyId = user.companyId || (user.companies && user.companies[0]);
      
      if (!selectedCompanyId) {
        return res.status(400).json({ 
          msg: 'No company specified and no default company available' 
        });
      }
    }
    
    // Map frontend fields to backend schema
    const jobData = {
      title: req.body.title,
      description: req.body.description,
      location: req.body.location,
      jobType: req.body.type || req.body.jobType || 'Full-time',
      category: req.body.category || 'General',
      salaryRange: req.body.salary ? {
        min: parseInt(req.body.salary) || 0,
        max: parseInt(req.body.salary) || 0
      } : req.body.salaryRange,
      deadline: req.body.deadline,
      status: req.body.status || 'active',
      postedBy: req.user.id,
      companyId: selectedCompanyId
    };
    
    const job = new Job(jobData);
    await job.save();
    
    // Populate the job with user and company details
    const populatedJob = await Job.findById(job._id)
      .populate('postedBy', 'name email')
      .populate('companyId', 'name industry location');
    
    console.log('✅ Job created successfully:', populatedJob.title);
    res.status(201).json({
      success: true,
      message: 'Job posted successfully',
      data: populatedJob
    });
  } catch (err) {
    console.error('❌ Job creation error:', err);
    
    // Handle validation errors
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ 
        success: false,
        msg: 'Validation error',
        errors: errors
      });
    }
    
    res.status(500).json({ 
      success: false,
      msg: 'Error creating job',
      error: err.message 
    });
  }
});
// GET /api/jobs - Get all jobs
router.get('/', async (req, res) => {
  try {
    // Optimized query with better indexing and limits
    const jobs = await Job.find({ status: 'active' })
      .populate('postedBy', 'name email')
      .populate('companyId', 'name industry location')
      .sort({ createdAt: -1 })
      .limit(100); // Limit results to prevent large queries
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// GET /api/jobs/employer - Get jobs by employer (must be before /:id route)
router.get('/employer', verifyToken, async (req, res) => {
  try {
    console.log('✅ EMPLOYER JOBS ROUTE HIT');
    console.log('User ID:', req.user.id);
    
    const jobs = await Job.find({ postedBy: req.user.id })
      .populate('postedBy', 'name email')
      .populate('companyId', 'name industry location')
      .sort({ createdAt: -1 });
    
    console.log(`📊 Found ${jobs.length} jobs for employer`);
    console.log('📤 Sending response structure:', Object.keys({ success: true, data: jobs, count: jobs.length }));
    
    res.json({
      success: true,
      data: jobs,
      count: jobs.length
    });
  } catch (err) {
    console.error('❌ Error fetching employer jobs:', err);
    res.status(500).json({ 
      success: false,
      msg: 'Error fetching jobs',
      error: err.message 
    });
  }
});

// GET /api/jobs/:id - Get a specific job by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const job = await Job.findById(id)
      .populate('postedBy', 'name email')
      .populate('companyId', 'name industry location');
    
    if (!job) {
      return res.status(404).json({ msg: 'Job not found' });
    }
    
    res.json(job);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// PUT /api/jobs/:id - Update a job
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const job = await Job.findByIdAndUpdate(id, req.body, { new: true });
    
    if (!job) {
      return res.status(404).json({ msg: 'Job not found' });
    }
    
    res.json(job);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// DELETE /api/jobs/:id - Delete a job
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const job = await Job.findByIdAndDelete(id);
    
    if (!job) {
      return res.status(404).json({ msg: 'Job not found' });
    }
    
    res.json({ msg: 'Job deleted successfully' });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// Add error handling middleware
router.use(handleValidationError);

module.exports = router;
