const express = require('express');
const router = express.Router();
const Job = require('../models/Job');
const Company = require('../models/Company');
const chatGPTService = require('../services/chatgptService');

// GET /api/ai - Get AI service status
router.get('/', async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'AI service is available',
      endpoints: [
        'POST /api/ai/search',
        'POST /api/ai/analyze-resume',
        'POST /api/ai/generate-job-description',
        'POST /api/ai/match-candidates'
      ]
    });
  } catch (err) {
    console.error('Error checking AI service:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Error checking AI service' 
    });
  }
});

// AI-powered job search with natural language processing
router.post('/search', async (req, res) => {
  try {
    const { prompt, filters = {} } = req.body;
    
    if (!prompt || prompt.trim() === '') {
      return res.status(400).json({ 
        success: false, 
        message: 'Search prompt is required' 
      });
    }

    // Process natural language prompt using ChatGPT or local processing
    const processedQuery = await chatGPTService.processJobSearchPrompt(prompt);
    
    // Build search query
    const searchQuery = buildSearchQuery(processedQuery, filters);
    
    // Execute search
    const jobs = await Job.find(searchQuery)
      .populate('postedBy', 'name email')
      .populate('companyId', 'name companyId logo industry location website')
      .sort({ createdAt: -1 })
      .limit(20);

    // Generate AI insights using ChatGPT or local processing
    const insights = await chatGPTService.generateJobInsights(jobs, processedQuery);
    
    // Generate recommendations using ChatGPT or local processing
    const recommendations = await chatGPTService.generateRecommendations(jobs, processedQuery);

    res.json({
      success: true,
      data: {
        jobs,
        insights,
        recommendations,
        processedQuery,
        totalResults: jobs.length
      }
    });
  } catch (error) {
    console.error('AI Search error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error processing AI search' 
    });
  }
});

// Process natural language prompt
async function processNaturalLanguagePrompt(prompt) {
  const lowerPrompt = prompt.toLowerCase();
  
  // Extract job titles and skills
  const jobTitles = extractJobTitles(lowerPrompt);
  const skills = extractSkills(lowerPrompt);
  const experience = extractExperience(lowerPrompt);
  const salary = extractSalary(lowerPrompt);
  const location = extractLocation(lowerPrompt);
  const jobType = extractJobType(lowerPrompt);
  const companyType = extractCompanyType(lowerPrompt);
  const workStyle = extractWorkStyle(lowerPrompt);
  
  return {
    searchTerm: jobTitles.join(' ') || prompt,
    skills,
    experience,
    salary,
    location,
    jobType,
    companyType,
    workStyle,
    originalPrompt: prompt
  };
}

// Extract job titles from prompt
function extractJobTitles(prompt) {
  const jobTitles = [
    'software engineer', 'developer', 'programmer', 'software developer',
    'data scientist', 'data analyst', 'data engineer',
    'product manager', 'project manager', 'product owner',
    'marketing manager', 'marketing specialist', 'digital marketing',
    'sales manager', 'sales executive', 'business development',
    'hr manager', 'hr specialist', 'recruiter',
    'designer', 'ui designer', 'ux designer', 'graphic designer',
    'devops engineer', 'system administrator', 'cloud engineer',
    'business analyst', 'financial analyst', 'consultant',
    'content writer', 'technical writer', 'copywriter',
    'qa engineer', 'test engineer', 'quality assurance'
  ];
  
  const foundTitles = jobTitles.filter(title => prompt.includes(title));
  
  // If no specific job titles found, try to extract general terms
  if (foundTitles.length === 0) {
    const generalTerms = ['software', 'engineering', 'tech', 'technology', 'development', 'programming'];
    const foundGeneral = generalTerms.filter(term => prompt.includes(term));
    if (foundGeneral.length > 0) {
      return ['developer', 'engineer']; // Default to these when general tech terms are found
    }
  }
  
  return foundTitles;
}

// Extract skills from prompt
function extractSkills(prompt) {
  const skills = [
    'javascript', 'python', 'java', 'react', 'node.js', 'angular', 'vue',
    'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'terraform',
    'sql', 'mongodb', 'postgresql', 'mysql',
    'machine learning', 'ai', 'artificial intelligence',
    'agile', 'scrum', 'kanban', 'ci/cd',
    'git', 'github', 'gitlab', 'jenkins',
    'html', 'css', 'sass', 'less', 'bootstrap',
    'php', 'ruby', 'go', 'rust', 'swift', 'kotlin'
  ];
  
  return skills.filter(skill => prompt.includes(skill));
}

// Extract experience level
function extractExperience(prompt) {
  if (prompt.includes('entry level') || prompt.includes('junior') || prompt.includes('fresher')) {
    return 'entry';
  }
  if (prompt.includes('senior') || prompt.includes('lead') || prompt.includes('principal')) {
    return 'senior';
  }
  if (prompt.includes('mid level') || prompt.includes('intermediate')) {
    return 'mid';
  }
  return null;
}

// Extract salary expectations
function extractSalary(prompt) {
  const salaryMatch = prompt.match(/(\d+)\s*(k|thousand|lakh|cr|crore)/i);
  if (salaryMatch) {
    const amount = parseInt(salaryMatch[1]);
    const unit = salaryMatch[2].toLowerCase();
    
    if (unit === 'k' || unit === 'thousand') {
      return amount * 1000;
    } else if (unit === 'lakh') {
      return amount * 100000;
    } else if (unit === 'cr' || unit === 'crore') {
      return amount * 10000000;
    }
  }
  return null;
}

// Extract location preferences
function extractLocation(prompt) {
  const locations = [
    'remote', 'hybrid', 'bangalore', 'mumbai', 'delhi', 'hyderabad', 
    'chennai', 'pune', 'kolkata', 'gurgaon', 'noida'
  ];
  
  return locations.filter(loc => prompt.includes(loc));
}

// Extract job type
function extractJobType(prompt) {
  if (prompt.includes('full time') || prompt.includes('full-time')) {
    return 'Full-time';
  }
  if (prompt.includes('part time') || prompt.includes('part-time')) {
    return 'Part-time';
  }
  if (prompt.includes('contract')) {
    return 'Contract';
  }
  if (prompt.includes('internship')) {
    return 'Internship';
  }
  return null;
}

// Extract company type
function extractCompanyType(prompt) {
  if (prompt.includes('startup') || prompt.includes('start-up')) {
    return 'startup';
  }
  if (prompt.includes('tech') || prompt.includes('technology')) {
    return 'tech';
  }
  if (prompt.includes('finance') || prompt.includes('banking')) {
    return 'finance';
  }
  if (prompt.includes('healthcare') || prompt.includes('medical')) {
    return 'healthcare';
  }
  return null;
}

// Extract work style preferences
function extractWorkStyle(prompt) {
  const workStyles = [];
  
  if (prompt.includes('remote') || prompt.includes('work from home')) {
    workStyles.push('remote');
  }
  if (prompt.includes('flexible') || prompt.includes('flexibility')) {
    workStyles.push('flexible');
  }
  if (prompt.includes('work life balance') || prompt.includes('work-life balance')) {
    workStyles.push('work-life-balance');
  }
  if (prompt.includes('learning') || prompt.includes('growth')) {
    workStyles.push('learning');
  }
  
  return workStyles;
}

// Build search query from processed data
function buildSearchQuery(processedQuery, filters) {
  const query = { status: 'active' };
  
  // Text search - more flexible matching with synonyms
  if (processedQuery.searchTerm) {
    // Split search term into individual words for better matching
    const searchWords = processedQuery.searchTerm.toLowerCase().split(/\s+/);
    
    // Create multiple search patterns for better matching
    const searchPatterns = [];
    
    // Add individual words
    searchWords.forEach(word => {
      if (word.length > 2) { // Only add words longer than 2 characters
        searchPatterns.push(word);
      }
    });
    
    // Add the full search term
    searchPatterns.push(processedQuery.searchTerm.toLowerCase());
    
    // Add synonyms for better matching
    const synonyms = {
      'software': ['developer', 'programmer', 'engineer', 'tech'],
      'engineer': ['developer', 'programmer', 'software'],
      'engineering': ['development', 'programming', 'tech'],
      'developer': ['engineer', 'programmer', 'software'],
      'programmer': ['developer', 'engineer', 'software']
    };
    
    // Add synonyms for each word
    searchWords.forEach(word => {
      if (synonyms[word]) {
        searchPatterns.push(...synonyms[word]);
      }
    });
    
    // Create regex pattern that matches any of the search patterns
    const searchRegex = searchPatterns.join('|');
    
    query.$or = [
      { title: { $regex: searchRegex, $options: 'i' } },
      { description: { $regex: searchRegex, $options: 'i' } },
      { category: { $regex: searchRegex, $options: 'i' } }
    ];
  }
  
  // Location filter
  if (processedQuery.location && processedQuery.location.length > 0) {
    if (processedQuery.location.includes('remote')) {
      query.$or = [
        { location: { $regex: 'remote', $options: 'i' } },
        { jobType: 'Remote' }
      ];
    } else {
      query.location = { $in: processedQuery.location.map(loc => new RegExp(loc, 'i')) };
    }
  }
  
  // Job type filter
  if (processedQuery.jobType) {
    query.jobType = processedQuery.jobType;
  }
  
  // Skills filter
  if (processedQuery.skills && processedQuery.skills.length > 0) {
    query.$or = [
      ...(query.$or || []),
      { description: { $regex: processedQuery.skills.join('|'), $options: 'i' } }
    ];
  }
  
  // Apply additional filters
  if (filters.salaryRange) {
    // Add salary range filtering logic here
  }
  
  if (filters.experience) {
    // Add experience level filtering logic here
  }
  
  return query;
}

// Generate AI insights about job market
async function generateJobInsights(jobs, processedQuery) {
  const insights = {
    marketTrends: "The job market shows strong demand for your search criteria.",
    skillDemand: "Most in-demand skills in your field: React, Python, AWS, Machine Learning",
    salaryInsights: "Average salary range for your search: ₹6-15 LPA",
    companyInsights: "Top companies hiring: TCS, Infosys, Microsoft, Google, Amazon",
    recommendations: [
      "Consider upskilling in cloud technologies",
      "Focus on companies with strong learning cultures",
      "Remote-first companies are growing rapidly"
    ]
  };
  
  // Analyze job data for insights
  if (jobs.length > 0) {
    const companies = [...new Set(jobs.map(job => job.companyId?.name || job.company))];
    const locations = [...new Set(jobs.map(job => job.location))];
    const jobTypes = [...new Set(jobs.map(job => job.jobType))];
    
    insights.companyInsights = `Top companies in your search: ${companies.slice(0, 5).join(', ')}`;
    insights.locationInsights = `Popular locations: ${locations.slice(0, 3).join(', ')}`;
    insights.jobTypeInsights = `Available job types: ${jobTypes.join(', ')}`;
  }
  
  return insights;
}

// Generate personalized recommendations
async function generateRecommendations(jobs, processedQuery) {
  const recommendations = [];
  
  if (jobs.length === 0) {
    recommendations.push({
      type: 'suggestion',
      title: 'Expand Your Search',
      description: 'Try broader keywords or different locations to find more opportunities.',
      action: 'Modify search criteria'
    });
  } else if (jobs.length < 5) {
    recommendations.push({
      type: 'suggestion',
      title: 'Consider Related Roles',
      description: 'Look for similar positions with different titles but same skills.',
      action: 'Search related terms'
    });
  }
  
  // Skill-based recommendations
  if (processedQuery.skills && processedQuery.skills.length > 0) {
    recommendations.push({
      type: 'skill',
      title: 'Skill Enhancement',
      description: `Consider learning complementary skills to ${processedQuery.skills.join(', ')}.`,
      action: 'Explore learning resources'
    });
  }
  
  // Location recommendations
  if (processedQuery.location && processedQuery.location.includes('remote')) {
    recommendations.push({
      type: 'location',
      title: 'Remote Work Tips',
      description: 'Remote jobs often require strong communication skills and self-discipline.',
      action: 'Highlight remote work experience'
    });
  }
  
  return recommendations;
}

// Get AI-powered job suggestions
router.get('/suggestions', async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query || query.length < 2) {
      return res.json({ success: true, suggestions: [] });
    }
    
    // Get job title suggestions
    let jobTitles = [];
    try {
      jobTitles = await Job.distinct('title', {
        title: { $regex: query, $options: 'i' },
        status: 'active'
      });
      jobTitles = jobTitles.slice(0, 5);
    } catch (error) {
      console.log('Job titles error:', error.message);
    }
    
    // Get company suggestions
    let companies = [];
    try {
      companies = await Company.distinct('name', {
        name: { $regex: query, $options: 'i' }
      });
      companies = companies.slice(0, 5);
    } catch (error) {
      console.log('Companies error:', error.message);
    }
    
    // Get skill suggestions
    const skills = [
      'JavaScript', 'Python', 'React', 'Node.js', 'AWS', 'Docker',
      'Machine Learning', 'Data Science', 'DevOps', 'Kubernetes'
    ].filter(skill => skill.toLowerCase().includes(query.toLowerCase()));
    
    res.json({
      success: true,
      suggestions: {
        jobTitles: jobTitles,
        companies: companies,
        skills: skills.slice(0, 5)
      }
    });
  } catch (error) {
    console.error('AI Suggestions error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error getting AI suggestions' 
    });
  }
});

// Get ChatGPT service status
router.get('/status', (req, res) => {
  try {
    const status = chatGPTService.getStatus();
    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    console.error('AI Status error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error getting AI status' 
    });
  }
});

module.exports = router;
