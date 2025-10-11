import React, { useState } from "react";
import { Briefcase, Building2, Users, Award, TrendingUp, Search, ArrowRight } from "lucide-react";
import JobListing from "../components/JobListing";
import UnifiedSearch from "../components/UnifiedSearch";

const Clients = () => {
  const clients = [
    {
      name: "TCS",
      logo: "/img/tcs.png",
    },
    {
      name: "Infosys",
      logo: "/img/infosys.png",
    },
    {
      name: "Muthoot Finance",
      logo: "/img/muthoot.svg",
    },
    {
      name: "Vi",
      logo: "/img/vodafone.png",
    },
    {
      name: "Jio",
      logo: "/img/jio.svg",
    },
    {
      name: "Capgemini",
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/Capgemini_201x_logo.svg/512px-Capgemini_201x_logo.svg.png",
    },
    {
      name: "Microsoft",
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Microsoft_logo.svg/512px-Microsoft_logo.svg.png",
    },
    {
      name: "Google",
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Google_2015_logo.svg/512px-Google_2015_logo.svg.png",
    },
    {
      name: "Amazon",
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Amazon_logo.svg/512px-Amazon_logo.svg.png",
    },
    {
      name: "IBM",
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/IBM_logo.svg/512px-IBM_logo.svg.png",
    },
    {
      name: "Accenture",
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Accenture.svg/512px-Accenture.svg.png",
    },
    {
      name: "Deloitte",
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/Deloitte_Logo.svg/512px-Deloitte_Logo.svg.png",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-8 items-center justify-items-center">
        {clients.map((client, index) => (
        <div 
          key={index} 
          className="group bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-white/20 w-full flex items-center justify-center"
        >
            <img
              src={client.logo}
              alt={client.name}
            className="h-12 object-contain grayscale group-hover:grayscale-0 transition-all duration-300"
              title={client.name}
            />
          </div>
        ))}
      </div>
  );
};

const Home = () => {
  const [searchResults, setSearchResults] = useState(null);
  const [searchParams, setSearchParams] = useState(null);
  const [showResults, setShowResults] = useState(false);

  const stats = [
    { number: "10,000+", label: "Jobs Posted", icon: Briefcase },
    { number: "500+", label: "Companies", icon: Building2 },
    { number: "50,000+", label: "Candidates", icon: Users },
    { number: "95%", label: "Success Rate", icon: Award },
  ];

  const features = [];

  // Handle search results
  const handleSearchResults = (results, insights = null) => {
    setSearchResults(results);
    setShowResults(true);
  };

  // Handle search parameters
  const handleSearchChange = (params) => {
    setSearchParams(params);
  };

  // Clear search and show all jobs
  const clearSearch = () => {
    setSearchResults(null);
    setSearchParams(null);
    setShowResults(false);
  };

  const testimonials = [
    {
      quote: "Found my dream job in just 2 weeks! The platform made it so easy to connect with top companies.",
      name: "Sarah Johnson",
      role: "Software Engineer at Google",
      image: "https://randomuser.me/api/portraits/women/68.jpg",
      rating: 5,
    },
    {
      quote: "The career guidance helped me transition from finance to tech. Life-changing experience!",
      name: "Michael Chen",
      role: "Product Manager at Microsoft",
      image: "https://randomuser.me/api/portraits/men/76.jpg",
      rating: 5,
    },
    {
      quote: "As a recruiter, I've found some of my best candidates through this platform. Highly recommended!",
      name: "Emily Rodriguez",
      role: "HR Director at Amazon",
      image: "https://randomuser.me/api/portraits/women/44.jpg",
      rating: 5,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Clean Header with Search */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Find Your Dream Job</h1>
            <p className="text-gray-600 mb-6">Search and discover amazing career opportunities</p>
            
            {/* Apply Now CTA Button */}
            <div className="mb-8">
              <button
                onClick={() => {
                  const token = localStorage.getItem('token');
                  if (!token) {
                    window.location.href = '/signup';
                  } else {
                    // Scroll to job listings
                    const jobSection = document.querySelector('.job-listings-section');
                    if (jobSection) {
                      jobSection.scrollIntoView({ behavior: 'smooth' });
                    }
                  }
                }}
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                <Briefcase className="w-5 h-5 mr-2" />
                Apply Now
                <ArrowRight className="w-5 h-5 ml-2" />
              </button>
              <p className="text-sm text-gray-500 mt-2">
                {!localStorage.getItem('token') ? 'Sign up to start applying' : 'Browse available positions'}
              </p>
            </div>
          </div>
          {/* Search Component */}
          <div className="max-w-4xl mx-auto">
            <UnifiedSearch 
              onSearchResults={handleSearchResults}
              onSearchChange={handleSearchChange}
            />
          </div>
    </div>
  </div>
      {/* Search Results Section removed: UnifiedSearch displays its own results */}

      {/* Market Insights and Recent Searches Section - After search results */}
      {showResults && (
        <div className="bg-gray-50 border-b border-gray-200">
          <div className="max-w-6xl mx-auto px-4 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Market Insights */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center mb-4">
                  <TrendingUp className="w-5 h-5 text-blue-600 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-900">Market Insights</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h4 className="font-medium text-blue-900 mb-2">Job Market Trends</h4>
                    <p className="text-blue-800 text-sm">
                      The job market shows strong demand for your search criteria. 
                      Software engineering roles are experiencing 15% growth year-over-year.
                    </p>
            </div>
                  
                  <div className="bg-green-50 rounded-lg p-4">
                    <h4 className="font-medium text-green-900 mb-2">In-Demand Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {['React', 'Python', 'AWS', 'Machine Learning', 'Docker'].map((skill) => (
                        <span key={skill} className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
                          {skill}
                        </span>
          ))}
        </div>
                  </div>
                  
                  <div className="bg-purple-50 rounded-lg p-4">
                    <h4 className="font-medium text-purple-900 mb-2">Salary Insights</h4>
                    <p className="text-purple-800 text-sm">
                      Average salary range: ₹6-15 LPA for software engineering roles. 
                      Remote positions offer 20% higher compensation.
                </p>
              </div>
                </div>
              </div>

              {/* Recent Searches */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center mb-4">
                  <Search className="w-5 h-5 text-green-600 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-900">Recent Searches</h3>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Software Engineer</p>
                        <p className="text-xs text-gray-500">Remote • Full-time</p>
                      </div>
                    </div>
                    <span className="text-xs text-gray-400">2 min ago</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Data Scientist</p>
                        <p className="text-xs text-gray-500">Bangalore • 3+ years</p>
                      </div>
                    </div>
                    <span className="text-xs text-gray-400">15 min ago</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Product Manager</p>
                        <p className="text-xs text-gray-500">Mumbai • Startup</p>
                      </div>
                    </div>
                    <span className="text-xs text-gray-400">1 hour ago</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-orange-500 rounded-full mr-3"></div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">DevOps Engineer</p>
                        <p className="text-xs text-gray-500">Hybrid • AWS</p>
              </div>
            </div>
                    <span className="text-xs text-gray-400">2 hours ago</span>
                  </div>
        </div>
                
                <button className="w-full mt-4 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  View All Search History
                </button>
                  </div>
                </div>
              </div>
            </div>
      )}

      {/* Main Content Section */}
      <div className="max-w-6xl mx-auto px-4 py-8 job-listings-section">
        {!showResults && (
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Latest Jobs</h2>
            <p className="text-gray-600">Discover opportunities from top companies</p>
        </div>
        )}

        {!showResults && <JobListing searchResults={null} />}
      </div>
    </div>
  );
};

export default Home;
