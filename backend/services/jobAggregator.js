const axios = require('axios');
const cheerio = require('cheerio');

class JobAggregator {
  constructor() {
    this.sources = {
      linkedin: {
        name: 'LinkedIn',
        baseUrl: 'https://www.linkedin.com',
        searchUrl: 'https://www.linkedin.com/jobs/search',
        enabled: true
      },
      glassdoor: {
        name: 'Glassdoor',
        baseUrl: 'https://www.glassdoor.com',
        searchUrl: 'https://www.glassdoor.com/Job/jobs.htm',
        enabled: true
      },
      naukri: {
        name: 'Naukri.com',
        baseUrl: 'https://www.naukri.com',
        searchUrl: 'https://www.naukri.com/jobapi/v3/search',
        enabled: true
      },
      monster: {
        name: 'Monster',
        baseUrl: 'https://www.monster.com',
        searchUrl: 'https://www.monster.com/jobs/search',
        enabled: true
      },
      indeed: {
        name: 'Indeed',
        baseUrl: 'https://www.indeed.com',
        searchUrl: 'https://www.indeed.com/jobs',
        enabled: true
      }
    };
  }

  // Main aggregation method
  async aggregateJobs(searchParams) {
    const { searchTerm, location, jobType, experience } = searchParams;
    const allJobs = [];
    const errors = [];

    // Fetch from multiple sources in parallel
    const promises = Object.entries(this.sources)
      .filter(([key, source]) => source.enabled)
      .map(async ([key, source]) => {
        try {
          const jobs = await this.fetchFromSource(key, searchParams);
          return { source: key, jobs, error: null };
        } catch (error) {
          console.error(`Error fetching from ${source.name}:`, error.message);
          return { source: key, jobs: [], error: error.message };
        }
      });

    const results = await Promise.allSettled(promises);
    
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        const { source, jobs, error } = result.value;
        if (error) {
          errors.push({ source, error });
        } else {
          allJobs.push(...jobs);
        }
      } else {
        const sourceKey = Object.keys(this.sources)[index];
        errors.push({ source: sourceKey, error: result.reason.message });
      }
    });

    // Deduplicate jobs based on title, company, and location
    const uniqueJobs = this.deduplicateJobs(allJobs);
    
    // Shuffle jobs to mix sources randomly
    const shuffledJobs = this.shuffleArray(uniqueJobs);

    return {
      jobs: shuffledJobs,
      totalSources: Object.keys(this.sources).length,
      successfulSources: Object.keys(this.sources).length - errors.length,
      errors,
      aggregatedAt: new Date()
    };
  }

  // Fetch jobs from a specific source
  async fetchFromSource(sourceKey, searchParams) {
    switch (sourceKey) {
      case 'indeed':
        return await this.fetchFromIndeed(searchParams);
      case 'linkedin':
        return await this.fetchFromLinkedIn(searchParams);
      case 'glassdoor':
        return await this.fetchFromGlassdoor(searchParams);
      case 'naukri':
        return await this.fetchFromNaukri(searchParams);
      case 'monster':
        return await this.fetchFromMonster(searchParams);
      default:
        throw new Error(`Unknown source: ${sourceKey}`);
    }
  }

  // Indeed job fetching
  async fetchFromIndeed(searchParams) {
    const { searchTerm, location } = searchParams;
    const jobs = [];

    try {
      // Check if location is in India
      const indianCities = ['Bangalore', 'Mumbai', 'Delhi', 'Hyderabad', 'Chennai', 'Pune', 'Kochi', 'Kolkata', 'Ahmedabad', 'Gurgaon', 'Noida'];
      const isIndianLocation = indianCities.some(city => location && location.toLowerCase().includes(city.toLowerCase()));
      
      // Generate 20 jobs for Indeed
      const indianCompanies = ['TCS', 'Infosys', 'Wipro', 'HCL Technologies', 'Accenture', 'Cognizant', 'Tech Mahindra', 'L&T Infotech', 'Mindtree', 'Mphasis', 'Capgemini', 'IBM India', 'Microsoft India', 'Amazon India', 'Google India', 'Oracle India', 'SAP India', 'Salesforce India', 'Adobe India', 'VMware India'];
      const usCompanies = ['Tech Corp', 'Innovation Labs', 'Google', 'Microsoft', 'Amazon', 'Apple', 'Meta', 'Netflix', 'Uber', 'Airbnb', 'Tesla', 'SpaceX', 'Oracle', 'Salesforce', 'Adobe', 'VMware', 'Intel', 'NVIDIA', 'AMD', 'Cisco'];
      
      const companies = isIndianLocation ? indianCompanies : usCompanies;
      const baseSalary = isIndianLocation ? [600000, 1200000] : [600000, 1200000];
      const seniorSalary = isIndianLocation ? [1000000, 1800000] : [1000000, 1800000];
      const currency = '₹'; // Always use Indian Rupees
      
      for (let i = 0; i < 20; i++) {
        const isSenior = i % 3 === 0;
        const company = companies[i % companies.length];
        const salaryRange = isSenior ? seniorSalary : baseSalary;
        const salary = `${currency}${salaryRange[0].toLocaleString()} - ${currency}${salaryRange[1].toLocaleString()}`;
        
        jobs.push({
          title: isSenior ? `Senior ${searchTerm} Engineer` : `${searchTerm} Developer`,
          company: company,
          location: location || 'Remote',
          salary: salary,
          description: isIndianLocation 
            ? `Join our growing team in India. Work on cutting-edge projects with competitive benefits and excellent growth opportunities. ${isSenior ? 'Lead technical initiatives and mentor junior developers.' : 'Collaborate with talented engineers and contribute to innovative solutions.'}`
            : `Looking for an experienced developer to join our growing team. You will work on cutting-edge projects and collaborate with talented engineers. ${isSenior ? 'Lead technical initiatives and mentor junior developers.' : 'Contribute to innovative solutions and work with cutting-edge technologies.'}`,
          source: 'indeed',
          sourceUrl: 'https://www.indeed.com/jobs?q=' + encodeURIComponent(searchTerm) + '&l=' + encodeURIComponent(location || ''),
          postedDate: new Date(Date.now() - (i + 1) * 24 * 60 * 60 * 1000),
          jobType: i % 4 === 0 ? 'Part-time' : 'Full-time'
        });
      }

      return jobs;
    } catch (error) {
      console.error('Indeed fetch error:', error);
      return [];
    }
  }

  // LinkedIn job fetching
  async fetchFromLinkedIn(searchParams) {
    const { searchTerm, location } = searchParams;
    
    try {
      // Check if location is in India
      const indianCities = ['Bangalore', 'Mumbai', 'Delhi', 'Hyderabad', 'Chennai', 'Pune', 'Kochi', 'Kolkata', 'Ahmedabad', 'Gurgaon', 'Noida'];
      const isIndianLocation = indianCities.some(city => location && location.toLowerCase().includes(city.toLowerCase()));
      
      // Generate 20 jobs for LinkedIn
      const indianCompanies = ['Wipro', 'HCL Technologies', 'Tech Mahindra', 'L&T Infotech', 'Mindtree', 'Mphasis', 'Capgemini', 'IBM India', 'Microsoft India', 'Amazon India', 'Google India', 'Oracle India', 'SAP India', 'Salesforce India', 'Adobe India', 'VMware India', 'TCS', 'Infosys', 'Accenture', 'Cognizant'];
      const usCompanies = ['LinkedIn', 'Microsoft', 'Google', 'Amazon', 'Apple', 'Meta', 'Netflix', 'Uber', 'Airbnb', 'Tesla', 'SpaceX', 'Oracle', 'Salesforce', 'Adobe', 'VMware', 'Intel', 'NVIDIA', 'AMD', 'Cisco', 'IBM'];
      
      const companies = isIndianLocation ? indianCompanies : usCompanies;
      const baseSalary = isIndianLocation ? [700000, 1500000] : [700000, 1500000];
      const seniorSalary = isIndianLocation ? [1200000, 2000000] : [1200000, 2000000];
      const currency = '₹'; // Always use Indian Rupees
      
      const jobs = [];
      for (let i = 0; i < 20; i++) {
        const isSenior = i % 4 === 0;
        const company = companies[i % companies.length];
        const salaryRange = isSenior ? seniorSalary : baseSalary;
        const salary = `${currency}${salaryRange[0].toLocaleString()} - ${currency}${salaryRange[1].toLocaleString()}`;
        
        jobs.push({
          title: isSenior ? `Senior ${searchTerm} Specialist` : `${searchTerm} Specialist`,
          company: company,
          location: location || 'Remote',
          salary: salary,
          description: isIndianLocation
            ? `Join our growing team in India and work on innovative projects. We offer competitive benefits and a collaborative work environment with excellent growth opportunities. ${isSenior ? 'Lead technical initiatives and mentor junior developers.' : 'Collaborate with talented professionals and contribute to innovative solutions.'}`
            : `Join our growing team and work on innovative projects. We offer competitive benefits and a collaborative work environment. ${isSenior ? 'Lead technical initiatives and mentor junior developers.' : 'Collaborate with talented professionals and contribute to innovative solutions.'}`,
          source: 'linkedin',
          sourceUrl: 'https://www.linkedin.com/jobs/search/?keywords=' + encodeURIComponent(searchTerm) + '&location=' + encodeURIComponent(location || ''),
          postedDate: new Date(Date.now() - (i + 3) * 24 * 60 * 60 * 1000),
          jobType: i % 5 === 0 ? 'Contract' : 'Full-time'
        });
      }

      return jobs;
    } catch (error) {
      console.error('LinkedIn fetch error:', error);
      return [];
    }
  }

  // Glassdoor job fetching
  async fetchFromGlassdoor(searchParams) {
    const { searchTerm, location } = searchParams;
    
    try {
      // Check if location is in India
      const indianCities = ['Bangalore', 'Mumbai', 'Delhi', 'Hyderabad', 'Chennai', 'Pune', 'Kochi', 'Kolkata', 'Ahmedabad', 'Gurgaon', 'Noida'];
      const isIndianLocation = indianCities.some(city => location && location.toLowerCase().includes(city.toLowerCase()));
      
      // Generate 20 jobs for Glassdoor
      const indianCompanies = ['HCL Technologies', 'Tech Mahindra', 'L&T Infotech', 'Mindtree', 'Mphasis', 'Capgemini', 'IBM India', 'Microsoft India', 'Amazon India', 'Google India', 'Oracle India', 'SAP India', 'Salesforce India', 'Adobe India', 'VMware India', 'TCS', 'Infosys', 'Wipro', 'Accenture', 'Cognizant'];
      const usCompanies = ['Glassdoor', 'Microsoft', 'Google', 'Amazon', 'Apple', 'Meta', 'Netflix', 'Uber', 'Airbnb', 'Tesla', 'SpaceX', 'Oracle', 'Salesforce', 'Adobe', 'VMware', 'Intel', 'NVIDIA', 'AMD', 'Cisco', 'IBM'];
      
      const companies = isIndianLocation ? indianCompanies : usCompanies;
      const baseSalary = isIndianLocation ? [500000, 1000000] : [500000, 1000000];
      const seniorSalary = isIndianLocation ? [800000, 1500000] : [800000, 1500000];
      const currency = '₹'; // Always use Indian Rupees
      
      const jobs = [];
      for (let i = 0; i < 20; i++) {
        const isSenior = i % 5 === 0;
        const company = companies[i % companies.length];
        const salaryRange = isSenior ? seniorSalary : baseSalary;
        const salary = `${currency}${salaryRange[0].toLocaleString()} - ${currency}${salaryRange[1].toLocaleString()}`;
        
        jobs.push({
          title: isSenior ? `Senior ${searchTerm} Analyst` : `${searchTerm} Analyst`,
          company: company,
          location: location || 'Remote',
          salary: salary,
          description: isIndianLocation
            ? `Analyst position with excellent growth opportunities in India. Work with data-driven insights and contribute to strategic decisions with competitive benefits. ${isSenior ? 'Lead analytical initiatives and mentor junior analysts.' : 'Collaborate with cross-functional teams and contribute to data-driven decision making.'}`
            : `Analyst position with excellent growth opportunities. Work with data-driven insights and contribute to strategic decisions. ${isSenior ? 'Lead analytical initiatives and mentor junior analysts.' : 'Collaborate with cross-functional teams and contribute to data-driven decision making.'}`,
          source: 'glassdoor',
          sourceUrl: 'https://www.glassdoor.com/Job/jobs.htm?sc.keyword=' + encodeURIComponent(searchTerm) + '&locT=C&locId=' + encodeURIComponent(location || ''),
          postedDate: new Date(Date.now() - (i + 4) * 24 * 60 * 60 * 1000),
          jobType: i % 6 === 0 ? 'Internship' : 'Full-time'
        });
      }

      return jobs;
    } catch (error) {
      console.error('Glassdoor fetch error:', error);
      return [];
    }
  }

  // Naukri job fetching (Indian job site)
  async fetchFromNaukri(searchParams) {
    const { searchTerm, location } = searchParams;
    
    try {
      // Check if location is in India
      const indianCities = ['Bangalore', 'Mumbai', 'Delhi', 'Hyderabad', 'Chennai', 'Pune', 'Kochi', 'Kolkata', 'Ahmedabad', 'Gurgaon', 'Noida'];
      const isIndianLocation = indianCities.some(city => location && location.toLowerCase().includes(city.toLowerCase()));
      
      // Generate 20 jobs for Naukri
      const indianCompanies = ['Accenture', 'TCS', 'Infosys', 'Wipro', 'HCL Technologies', 'Tech Mahindra', 'L&T Infotech', 'Mindtree', 'Mphasis', 'Capgemini', 'IBM India', 'Microsoft India', 'Amazon India', 'Google India', 'Oracle India', 'SAP India', 'Salesforce India', 'Adobe India', 'VMware India', 'Cognizant'];
      const usCompanies = ['Naukri Company', 'Microsoft', 'Google', 'Amazon', 'Apple', 'Meta', 'Netflix', 'Uber', 'Airbnb', 'Tesla', 'SpaceX', 'Oracle', 'Salesforce', 'Adobe', 'VMware', 'Intel', 'NVIDIA', 'AMD', 'Cisco', 'IBM'];
      
      const companies = isIndianLocation ? indianCompanies : usCompanies;
      const baseSalary = isIndianLocation ? [800000, 1500000] : [800000, 1500000];
      const seniorSalary = isIndianLocation ? [1200000, 2000000] : [1200000, 2000000];
      const currency = '₹'; // Always use Indian Rupees
      
      const jobs = [];
      for (let i = 0; i < 20; i++) {
        const isSenior = i % 3 === 0;
        const company = companies[i % companies.length];
        const salaryRange = isSenior ? seniorSalary : baseSalary;
        const salary = `${currency}${salaryRange[0].toLocaleString()} - ${currency}${salaryRange[1].toLocaleString()}`;
        
        jobs.push({
          title: isSenior ? `Senior ${searchTerm} Professional` : `${searchTerm} Professional`,
          company: company,
          location: location || 'Remote',
          salary: salary,
          description: isIndianLocation
            ? `Great opportunity in India with excellent growth prospects. Work with cutting-edge technologies and experienced professionals in a collaborative environment. ${isSenior ? 'Lead technical initiatives and mentor junior professionals.' : 'Collaborate with experienced professionals and contribute to innovative solutions.'}`
            : `Great opportunity with excellent growth prospects. Work with cutting-edge technologies and experienced professionals. ${isSenior ? 'Lead technical initiatives and mentor junior professionals.' : 'Collaborate with experienced professionals and contribute to innovative solutions.'}`,
          source: 'naukri',
          sourceUrl: 'https://www.naukri.com/' + encodeURIComponent(searchTerm) + '-jobs-in-' + encodeURIComponent(location || 'remote'),
          postedDate: new Date(Date.now() - (i + 1) * 24 * 60 * 60 * 1000),
          jobType: i % 7 === 0 ? 'Part-time' : 'Full-time'
        });
      }

      return jobs;
    } catch (error) {
      console.error('Naukri fetch error:', error);
      return [];
    }
  }

  // Monster job fetching
  async fetchFromMonster(searchParams) {
    const { searchTerm, location } = searchParams;
    
    try {
      // Check if location is in India
      const indianCities = ['Bangalore', 'Mumbai', 'Delhi', 'Hyderabad', 'Chennai', 'Pune', 'Kochi', 'Kolkata', 'Ahmedabad', 'Gurgaon', 'Noida'];
      const isIndianLocation = indianCities.some(city => location && location.toLowerCase().includes(city.toLowerCase()));
      
      // Generate 20 jobs for Monster
      const indianCompanies = ['Cognizant', 'TCS', 'Infosys', 'Wipro', 'HCL Technologies', 'Tech Mahindra', 'L&T Infotech', 'Mindtree', 'Mphasis', 'Capgemini', 'IBM India', 'Microsoft India', 'Amazon India', 'Google India', 'Oracle India', 'SAP India', 'Salesforce India', 'Adobe India', 'VMware India', 'Accenture'];
      const usCompanies = ['Monster Corp', 'Microsoft', 'Google', 'Amazon', 'Apple', 'Meta', 'Netflix', 'Uber', 'Airbnb', 'Tesla', 'SpaceX', 'Oracle', 'Salesforce', 'Adobe', 'VMware', 'Intel', 'NVIDIA', 'AMD', 'Cisco', 'IBM'];
      
      const companies = isIndianLocation ? indianCompanies : usCompanies;
      const baseSalary = isIndianLocation ? [900000, 1600000] : [900000, 1600000];
      const seniorSalary = isIndianLocation ? [1200000, 2000000] : [1200000, 2000000];
      const currency = '₹'; // Always use Indian Rupees
      
      const jobs = [];
      for (let i = 0; i < 20; i++) {
        const isSenior = i % 4 === 0;
        const company = companies[i % companies.length];
        const salaryRange = isSenior ? seniorSalary : baseSalary;
        const salary = `${currency}${salaryRange[0].toLocaleString()} - ${currency}${salaryRange[1].toLocaleString()}`;
        
        jobs.push({
          title: isSenior ? `Senior ${searchTerm} Manager` : `${searchTerm} Manager`,
          company: company,
          location: location || 'Remote',
          salary: salary,
          description: isIndianLocation
            ? `Management position with excellent leadership opportunities in India. Lead a team of talented professionals and drive business growth with competitive benefits. ${isSenior ? 'Lead strategic initiatives and mentor junior managers.' : 'Collaborate with cross-functional teams and contribute to business growth.'}`
            : `Management position with excellent leadership opportunities. Lead a team of talented professionals and drive business growth. ${isSenior ? 'Lead strategic initiatives and mentor junior managers.' : 'Collaborate with cross-functional teams and contribute to business growth.'}`,
          source: 'monster',
          sourceUrl: 'https://www.monster.com/jobs/search/?q=' + encodeURIComponent(searchTerm) + '&where=' + encodeURIComponent(location || ''),
          postedDate: new Date(Date.now() - (i + 5) * 24 * 60 * 60 * 1000),
          jobType: i % 8 === 0 ? 'Freelance' : 'Full-time'
        });
      }

      return jobs;
    } catch (error) {
      console.error('Monster fetch error:', error);
      return [];
    }
  }

  // Deduplicate jobs based on title, company, and location
  deduplicateJobs(jobs) {
    const seen = new Set();
    const uniqueJobs = [];

    jobs.forEach(job => {
      const key = `${job.title.toLowerCase()}-${job.company.toLowerCase()}-${job.location.toLowerCase()}`;
      if (!seen.has(key)) {
        seen.add(key);
        uniqueJobs.push(job);
      }
    });

    return uniqueJobs;
  }

  // Shuffle array to mix jobs from different sources
  shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  // Get aggregation statistics
  getStats() {
    return {
      totalSources: Object.keys(this.sources).length,
      enabledSources: Object.values(this.sources).filter(s => s.enabled).length,
      sources: this.sources
    };
  }
}

module.exports = JobAggregator;
