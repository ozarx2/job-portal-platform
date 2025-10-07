// Assisted Hiring Service Packages Configuration
const SERVICE_PACKAGES = {
  basic: {
    name: 'Basic Hiring Assistance',
    description: 'Essential recruitment support for small businesses',
    price: {
      amount: 999,
      currency: 'INR'
    },
    features: [
      {
        name: 'Job Posting Optimization',
        description: 'Professional job description writing and posting across major job boards',
        included: true
      },
      {
        name: 'Initial Candidate Screening',
        description: 'Resume review and initial candidate filtering (up to 50 candidates)',
        included: true
      },
      {
        name: 'Interview Scheduling',
        description: 'Coordinate interview schedules with candidates',
        included: true
      },
      {
        name: 'Basic Background Checks',
        description: 'Standard employment verification',
        included: true
      },
      {
        name: 'Email Support',
        description: 'Email support during business hours',
        included: true
      }
    ],
    deliverables: [
      {
        name: 'Optimized Job Description',
        description: 'Professional job posting ready for publication'
      },
      {
        name: 'Screened Candidate List',
        description: 'Top 10-15 pre-screened candidates'
      },
      {
        name: 'Interview Schedule',
        description: 'Coordinated interview calendar'
      },
      {
        name: 'Final Recommendation',
        description: 'Top 3 recommended candidates with detailed profiles'
      }
    ],
    timeline: {
      estimatedDays: 7
    }
  },

  premium: {
    name: 'Premium Hiring Package',
    description: 'Comprehensive recruitment solution for growing companies',
    price: {
      amount: 2299,
      currency: 'INR'
    },
    features: [
      {
        name: 'Advanced Job Posting',
        description: 'Multi-platform posting with ATS optimization',
        included: true
      },
      {
        name: 'Comprehensive Candidate Screening',
        description: 'Detailed screening including skills assessment (up to 100 candidates)',
        included: true
      },
      {
        name: 'Video Interview Coordination',
        description: 'Setup and moderate initial video interviews',
        included: true
      },
      {
        name: 'Advanced Background Checks',
        description: 'Employment, education, and reference verification',
        included: true
      },
      {
        name: 'Priority Support',
        description: 'Phone and email support with dedicated account manager',
        included: true
      },
      {
        name: 'Market Analysis',
        description: 'Salary benchmarking and market insights',
        included: true
      }
    ],
    deliverables: [
      {
        name: 'Multi-Platform Job Posting',
        description: 'Job posted across 5+ major job boards'
      },
      {
        name: 'Detailed Candidate Profiles',
        description: 'Top 15-20 candidates with comprehensive assessments'
      },
      {
        name: 'Video Interview Recordings',
        description: 'Recorded initial interviews with candidate notes'
      },
      {
        name: 'Market Analysis Report',
        description: 'Salary ranges and hiring insights for the role'
      },
      {
        name: 'Final Recommendations',
        description: 'Top 5 candidates with detailed hiring recommendations'
      }
    ],
    timeline: {
      estimatedDays: 14
    }
  },

  enterprise: {
    name: 'Enterprise Recruitment Solution',
    description: 'Full-service recruitment for large organizations',
    price: {
      amount: 4499,
      currency: 'INR'
    },
    features: [
      {
        name: 'Executive Job Posting',
        description: 'Premium job posting across all major platforms including LinkedIn',
        included: true
      },
      {
        name: 'Executive Search',
        description: 'Active headhunting and talent sourcing (up to 200 candidates)',
        included: true
      },
      {
        name: 'Multi-Round Interview Coordination',
        description: 'Full interview process management including panel interviews',
        included: true
      },
      {
        name: 'Executive Background Checks',
        description: 'Comprehensive background verification including social media screening',
        included: true
      },
      {
        name: 'Dedicated Recruitment Manager',
        description: 'Personal recruitment manager with direct phone access',
        included: true
      },
      {
        name: 'Talent Pipeline Development',
        description: 'Build and maintain talent pipeline for future roles',
        included: true
      },
      {
        name: 'Negotiation Support',
        description: 'Assist with salary negotiations and offer management',
        included: true
      },
      {
        name: 'Onboarding Support',
        description: '30-day post-hire support and integration assistance',
        included: true
      }
    ],
    deliverables: [
      {
        name: 'Executive Job Campaign',
        description: 'Comprehensive job posting and talent sourcing campaign'
      },
      {
        name: 'Executive Candidate Pool',
        description: 'Top 20-30 executive-level candidates with detailed profiles'
      },
      {
        name: 'Interview Process Management',
        description: 'Complete interview coordination and feedback compilation'
      },
      {
        name: 'Executive Background Reports',
        description: 'Comprehensive background verification reports'
      },
      {
        name: 'Talent Pipeline Database',
        description: 'Curated database of qualified candidates for future roles'
      },
      {
        name: 'Hiring Decision Support',
        description: 'Detailed analysis and recommendations for final hiring decision'
      },
      {
        name: 'Onboarding Plan',
        description: 'Customized 30-day onboarding strategy'
      }
    ],
    timeline: {
      estimatedDays: 21
    }
  }
};

module.exports = SERVICE_PACKAGES;
