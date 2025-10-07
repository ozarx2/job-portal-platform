const OpenAI = require('openai');

class ChatGPTService {
  constructor() {
    // Initialize OpenAI client (will be configured when API key is available)
    this.openai = null;
    this.isConfigured = false;
    
    // Configure if API key is available
    if (process.env.OPENAI_API_KEY) {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
      this.isConfigured = true;
    }
  }

  // Process natural language job search prompt
  async processJobSearchPrompt(prompt) {
    if (!this.isConfigured) {
      // Fallback to local processing
      return this.localPromptProcessing(prompt);
    }

    try {
      const completion = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `You are an AI job search assistant. Analyze the user's job search prompt and extract:
            1. Job titles and roles
            2. Required skills
            3. Experience level (entry, mid, senior)
            4. Location preferences
            5. Job type (full-time, part-time, contract, internship)
            6. Company type preferences
            7. Work style preferences (remote, hybrid, office)
            
            Return a JSON object with these fields.`
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 500
      });

      const response = completion.choices[0].message.content;
      
      try {
        return JSON.parse(response);
      } catch (parseError) {
        console.error('Error parsing ChatGPT response:', parseError);
        return this.localPromptProcessing(prompt);
      }
    } catch (error) {
      console.error('ChatGPT API error:', error);
      return this.localPromptProcessing(prompt);
    }
  }

  // Generate job search insights
  async generateJobInsights(jobs, searchCriteria) {
    if (!this.isConfigured) {
      return this.generateLocalInsights(jobs, searchCriteria);
    }

    try {
      const completion = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `You are a job market analyst. Analyze the provided job data and generate insights about:
            1. Market trends
            2. Skill demand
            3. Salary insights
            4. Company insights
            5. Career recommendations
            
            Return a JSON object with these insights.`
          },
          {
            role: "user",
            content: `Jobs: ${JSON.stringify(jobs.slice(0, 10))}\nSearch Criteria: ${JSON.stringify(searchCriteria)}`
          }
        ],
        temperature: 0.4,
        max_tokens: 800
      });

      const response = completion.choices[0].message.content;
      
      try {
        return JSON.parse(response);
      } catch (parseError) {
        console.error('Error parsing ChatGPT insights:', parseError);
        return this.generateLocalInsights(jobs, searchCriteria);
      }
    } catch (error) {
      console.error('ChatGPT insights error:', error);
      return this.generateLocalInsights(jobs, searchCriteria);
    }
  }

  // Generate personalized recommendations
  async generateRecommendations(jobs, userProfile) {
    if (!this.isConfigured) {
      return this.generateLocalRecommendations(jobs, userProfile);
    }

    try {
      const completion = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `You are a career advisor. Based on the job search results and user profile, provide personalized recommendations for:
            1. Skill development
            2. Career advancement
            3. Job application strategies
            4. Interview preparation
            5. Networking opportunities
            
            Return a JSON array of recommendation objects.`
          },
          {
            role: "user",
            content: `Jobs: ${JSON.stringify(jobs.slice(0, 5))}\nUser Profile: ${JSON.stringify(userProfile)}`
          }
        ],
        temperature: 0.5,
        max_tokens: 600
      });

      const response = completion.choices[0].message.content;
      
      try {
        return JSON.parse(response);
      } catch (parseError) {
        console.error('Error parsing ChatGPT recommendations:', parseError);
        return this.generateLocalRecommendations(jobs, userProfile);
      }
    } catch (error) {
      console.error('ChatGPT recommendations error:', error);
      return this.generateLocalRecommendations(jobs, userProfile);
    }
  }

  // Local fallback processing
  localPromptProcessing(prompt) {
    const lowerPrompt = prompt.toLowerCase();
    
    // Extract job titles with improved logic
    const jobTitles = [
      'software engineer', 'developer', 'programmer', 'data scientist',
      'product manager', 'marketing manager', 'sales manager', 'hr manager',
      'designer', 'devops engineer', 'business analyst', 'content writer'
    ].filter(title => lowerPrompt.includes(title));
    
    // If no specific job titles found, try to extract general terms
    let searchTerm = jobTitles.join(' ') || prompt;
    if (jobTitles.length === 0) {
      const generalTerms = ['software', 'engineering', 'tech', 'technology', 'development', 'programming'];
      const foundGeneral = generalTerms.filter(term => lowerPrompt.includes(term));
      if (foundGeneral.length > 0) {
        searchTerm = 'developer engineer'; // Default to these when general tech terms are found
      }
    }
    
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
      searchTerm,
      skills,
      locations,
      jobType,
      experience,
      originalPrompt: prompt
    };
  }

  // Local insights generation
  generateLocalInsights(jobs, searchCriteria) {
    return {
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
  }

  // Local recommendations generation
  generateLocalRecommendations(jobs, userProfile) {
    const recommendations = [];
    
    if (jobs.length === 0) {
      recommendations.push({
        type: 'suggestion',
        title: 'Expand Your Search',
        description: 'Try broader keywords or different locations to find more opportunities.',
        action: 'Modify search criteria'
      });
    }
    
    if (userProfile.skills && userProfile.skills.length > 0) {
      recommendations.push({
        type: 'skill',
        title: 'Skill Enhancement',
        description: `Consider learning complementary skills to ${userProfile.skills.join(', ')}.`,
        action: 'Explore learning resources'
      });
    }
    
    return recommendations;
  }

  // Check if ChatGPT is configured
  isChatGPTConfigured() {
    return this.isConfigured;
  }

  // Get configuration status
  getStatus() {
    return {
      configured: this.isConfigured,
      hasApiKey: !!process.env.OPENAI_API_KEY,
      model: 'gpt-3.5-turbo'
    };
  }
}

module.exports = new ChatGPTService();
