import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

class AIService {
  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  // AI-powered job search with natural language processing
  async searchJobs(prompt, filters = {}) {
    try {
      const response = await this.client.post('/ai/search', {
        prompt,
        filters
      });
      return response.data;
    } catch (error) {
      console.error('AI Search error:', error);
      throw error;
    }
  }

  // Get AI-powered suggestions
  async getSuggestions(query) {
    try {
      const response = await this.client.get('/ai/suggestions', {
        params: { query }
      });
      return response.data;
    } catch (error) {
      console.error('AI Suggestions error:', error);
      throw error;
    }
  }

  // Process natural language prompt (client-side processing)
  processPrompt(prompt) {
    const lowerPrompt = prompt.toLowerCase();
    
    // Extract job titles
    const jobTitles = [
      'software engineer', 'developer', 'programmer', 'data scientist',
      'product manager', 'marketing manager', 'sales manager', 'hr manager',
      'designer', 'devops engineer', 'business analyst', 'content writer'
    ].filter(title => lowerPrompt.includes(title));
    
    // Extract skills
    const skills = [
      'javascript', 'python', 'java', 'react', 'node.js', 'aws', 'docker',
      'machine learning', 'ai', 'sql', 'mongodb', 'git', 'html', 'css'
    ].filter(skill => lowerPrompt.includes(skill));
    
    // Extract location
    const locations = [
      'remote', 'hybrid', 'bangalore', 'mumbai', 'delhi', 'hyderabad',
      'chennai', 'pune', 'kolkata', 'gurgaon', 'noida'
    ].filter(loc => lowerPrompt.includes(loc));
    
    // Extract job type
    let jobType = null;
    if (lowerPrompt.includes('full time') || lowerPrompt.includes('full-time')) {
      jobType = 'Full-time';
    } else if (lowerPrompt.includes('part time') || lowerPrompt.includes('part-time')) {
      jobType = 'Part-time';
    } else if (lowerPrompt.includes('contract')) {
      jobType = 'Contract';
    } else if (lowerPrompt.includes('internship')) {
      jobType = 'Internship';
    }
    
    // Extract experience level
    let experience = null;
    if (lowerPrompt.includes('entry level') || lowerPrompt.includes('junior') || lowerPrompt.includes('fresher')) {
      experience = 'entry';
    } else if (lowerPrompt.includes('senior') || lowerPrompt.includes('lead')) {
      experience = 'senior';
    } else if (lowerPrompt.includes('mid level') || lowerPrompt.includes('intermediate')) {
      experience = 'mid';
    }
    
    return {
      searchTerm: jobTitles.join(' ') || prompt,
      skills,
      locations,
      jobType,
      experience,
      originalPrompt: prompt
    };
  }

  // Generate AI insights (mock implementation)
  generateInsights(jobs, processedQuery) {
    const insights = {
      marketTrends: "The job market shows strong demand for your search criteria.",
      skillDemand: "Most in-demand skills: React, Python, AWS, Machine Learning",
      salaryInsights: "Average salary range: ₹6-15 LPA",
      companyInsights: "Top companies hiring: TCS, Infosys, Microsoft, Google",
      recommendations: [
        "Consider upskilling in cloud technologies",
        "Focus on companies with strong learning cultures",
        "Remote-first companies are growing rapidly"
      ]
    };

    if (jobs && jobs.length > 0) {
      const companies = [...new Set(jobs.map(job => job.companyId?.name || job.company))];
      const locations = [...new Set(jobs.map(job => job.location))];
      
      insights.companyInsights = `Top companies in your search: ${companies.slice(0, 5).join(', ')}`;
      insights.locationInsights = `Popular locations: ${locations.slice(0, 3).join(', ')}`;
    }

    return insights;
  }

  // Generate personalized recommendations
  generateRecommendations(jobs, processedQuery) {
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
    if (processedQuery.locations && processedQuery.locations.includes('remote')) {
      recommendations.push({
        type: 'location',
        title: 'Remote Work Tips',
        description: 'Remote jobs often require strong communication skills and self-discipline.',
        action: 'Highlight remote work experience'
      });
    }
    
    return recommendations;
  }
}

export default new AIService();






