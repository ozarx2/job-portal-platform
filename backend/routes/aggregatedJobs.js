const express = require('express');
const router = express.Router();
const JobAggregator = require('../services/jobAggregator');

const jobAggregator = new JobAggregator();

// GET /api/aggregated-jobs - Search aggregated jobs
router.get('/', async (req, res) => {
  try {
    const {
      search,
      location,
      jobType,
      experience,
      page = 1,
      limit = 20,
      sources = 'all'
    } = req.query;

    const searchParams = {
      searchTerm: search,
      location,
      jobType,
      experience
    };

    // Get aggregated jobs
    const result = await jobAggregator.aggregateJobs(searchParams);

    // Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedJobs = result.jobs.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: paginatedJobs,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(result.jobs.length / limit),
        totalJobs: result.jobs.length,
        hasNextPage: endIndex < result.jobs.length,
        hasPrevPage: page > 1
      },
      aggregation: {
        totalSources: result.totalSources,
        successfulSources: result.successfulSources,
        errors: result.errors,
        aggregatedAt: result.aggregatedAt
      }
    });
  } catch (error) {
    console.error('Aggregated jobs error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching aggregated jobs',
      error: error.message
    });
  }
});

// GET /api/aggregated-jobs/sources - Get available sources
router.get('/sources', (req, res) => {
  try {
    const stats = jobAggregator.getStats();
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching sources info',
      error: error.message
    });
  }
});

// POST /api/aggregated-jobs/search - Advanced search with filters
router.post('/search', async (req, res) => {
  try {
    const {
      searchTerm,
      location,
      jobType,
      experience,
      salaryRange,
      company,
      page = 1,
      limit = 20
    } = req.body;

    const searchParams = {
      searchTerm,
      location,
      jobType,
      experience,
      salaryRange,
      company
    };

    // Get aggregated jobs
    const result = await jobAggregator.aggregateJobs(searchParams);

    // Apply additional filters if provided
    let filteredJobs = result.jobs;

    if (salaryRange) {
      filteredJobs = filteredJobs.filter(job => {
        // Simple salary filtering logic
        const jobSalary = job.salary || '';
        return jobSalary.includes(salaryRange.min) || jobSalary.includes(salaryRange.max);
      });
    }

    if (company) {
      filteredJobs = filteredJobs.filter(job => 
        job.company.toLowerCase().includes(company.toLowerCase())
      );
    }

    // Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedJobs = filteredJobs.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: paginatedJobs,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(filteredJobs.length / limit),
        totalJobs: filteredJobs.length,
        hasNextPage: endIndex < filteredJobs.length,
        hasPrevPage: page > 1
      },
      aggregation: {
        totalSources: result.totalSources,
        successfulSources: result.successfulSources,
        errors: result.errors,
        aggregatedAt: result.aggregatedAt
      }
    });
  } catch (error) {
    console.error('Advanced aggregated search error:', error);
    res.status(500).json({
      success: false,
      message: 'Error in advanced search',
      error: error.message
    });
  }
});

module.exports = router;













