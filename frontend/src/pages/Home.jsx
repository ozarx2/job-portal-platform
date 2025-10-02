import React, { useState } from "react";
import {
  Briefcase,
  MapPin,
  Building2,
  Star,
  Users,
  ClipboardList,
  Search,
  Filter,
  TrendingUp,
  Award,
  Target,
  Zap,
  Brain,
  DollarSign,
} from "lucide-react";
import JobListing from "../components/JobListing";
import JobSearch from "../components/JobSearch";
import AISearch from "../components/AISearch";
import AggregatedJobListing from "../components/AggregatedJobListing";
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
  const [searchMode, setSearchMode] = useState('unified'); // 'traditional', 'ai', 'aggregated', or 'unified'
  const [showResults, setShowResults] = useState(false);
  const [aiInsights, setAiInsights] = useState(null);

  const stats = [
    { number: "10,000+", label: "Jobs Posted", icon: Briefcase },
    { number: "500+", label: "Companies", icon: Building2 },
    { number: "50,000+", label: "Candidates", icon: Users },
    { number: "95%", label: "Success Rate", icon: Award },
  ];

  const features = [
    {
      icon: Search,
      title: "Smart Job Search",
      description: "Advanced filtering and AI-powered job matching",
    },
    {
      icon: Target,
      title: "Career Guidance",
      description: "Expert advice to help you land your dream job",
    },
    {
      icon: Zap,
      title: "Quick Applications",
      description: "One-click applications with resume optimization",
    },
    {
      icon: TrendingUp,
      title: "Growth Opportunities",
      description: "Connect with companies that value your potential",
    },
  ];

  // Handle search results
  const handleSearchResults = (results, insights = null) => {
    setSearchResults(results);
    setShowResults(true);
    if (insights) {
      setAiInsights(insights);
    }
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
    setAiInsights(null);
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
            <p className="text-gray-600">Search and discover amazing career opportunities</p>
          </div>
          
          {/* Search Mode Toggle */}
          <div className="flex justify-center mb-6">
            <div className="bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setSearchMode('traditional')}
                className={`px-4 py-2 rounded-md font-medium transition-all duration-200 ${
                  searchMode === 'traditional'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Search className="w-4 h-4 inline mr-2" />
                Traditional
              </button>
              <button
                onClick={() => setSearchMode('ai')}
                className={`px-4 py-2 rounded-md font-medium transition-all duration-200 ${
                  searchMode === 'ai'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Brain className="w-4 h-4 inline mr-2" />
                AI Search
              </button>
              <button
                onClick={() => setSearchMode('aggregated')}
                className={`px-4 py-2 rounded-md font-medium transition-all duration-200 ${
                  searchMode === 'aggregated'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <TrendingUp className="w-4 h-4 inline mr-2" />
                Aggregated
              </button>
              <button
                onClick={() => setSearchMode('unified')}
                className={`px-4 py-2 rounded-md font-medium transition-all duration-200 ${
                  searchMode === 'unified'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Brain className="w-4 h-4 inline mr-2" />
                Unified
              </button>
            </div>
          </div>

          {/* Search Component */}
          <div className="max-w-4xl mx-auto">
            {searchMode === 'traditional' ? (
              <JobSearch 
                onSearchResults={handleSearchResults}
                onSearchChange={handleSearchChange}
              />
            ) : searchMode === 'ai' ? (
              <AISearch 
                onSearchResults={handleSearchResults}
                onSearchChange={handleSearchChange}
              />
            ) : searchMode === 'aggregated' ? (
              <AggregatedJobListing 
                searchParams={searchParams}
                onJobSelect={(job) => {
                  // Handle job selection for aggregated jobs
                  console.log('Selected aggregated job:', job);
                }}
              />
            ) : (
              <UnifiedSearch 
                onSearchResults={handleSearchResults}
                onSearchChange={handleSearchChange}
              />
            )}
          </div>
    </div>
  </div>

      {/* Search Results Section - Right after search bar */}
      {showResults && (
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-6xl mx-auto px-4 py-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">Search Results</h2>
                <p className="text-gray-600">
                  {searchResults?.length || 0} jobs found
                </p>
              </div>
              <button
                onClick={clearSearch}
                className="px-4 py-2 text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Clear Search
              </button>
            </div>
            
            {searchParams && (
              <div className="flex flex-wrap gap-2 mb-4">
                {searchParams.searchTerm && (
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                    "{searchParams.searchTerm}"
                  </span>
                )}
                {searchParams.location && (
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                    📍 {searchParams.location}
                  </span>
                )}
                {searchParams.filters && typeof searchParams.filters === 'object' && Object.entries(searchParams.filters).map(([key, value]) => 
                  value && (
                    <span key={key} className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">
                      {key}: {value}
                    </span>
                  )
                )}
              </div>
            )}
            
            {/* Display search results immediately */}
            {searchMode === 'unified' ? (
              // Unified search handles its own results display
              <div className="text-center py-8">
                <p className="text-gray-600">Unified search results are displayed above</p>
              </div>
            ) : searchMode === 'aggregated' ? (
              <div className="text-center py-8">
                <p className="text-gray-600">Aggregated search results are displayed above</p>
              </div>
            ) : (
              <JobListing searchResults={searchResults} />
            )}
            
            {/* AI Insights for AI Search Mode */}
            {searchMode === 'ai' && aiInsights && (
              <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
                <div className="flex items-center mb-4">
                  <Brain className="w-5 h-5 text-blue-600 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-900">AI Market Insights</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Market Trends */}
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <h4 className="font-medium text-blue-900 mb-2 flex items-center">
                      <TrendingUp className="w-4 h-4 mr-2" />
                      Market Trends
                    </h4>
                    <p className="text-blue-800 text-sm">
                      {aiInsights.marketTrends || "The job market shows strong demand for your search criteria."}
                    </p>
                  </div>
                  
                  {/* Skill Demand */}
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <h4 className="font-medium text-green-900 mb-2 flex items-center">
                      <Target className="w-4 h-4 mr-2" />
                      In-Demand Skills
                    </h4>
                    <p className="text-green-800 text-sm">
                      {aiInsights.skillDemand || "Most in-demand skills: React, Python, AWS, Machine Learning"}
                    </p>
                  </div>
                  
                  {/* Salary Insights */}
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <h4 className="font-medium text-purple-900 mb-2 flex items-center">
                      <DollarSign className="w-4 h-4 mr-2" />
                      Salary Insights
                    </h4>
                    <p className="text-purple-800 text-sm">
                      {aiInsights.salaryInsights || "Average salary range: ₹6-15 LPA"}
                    </p>
                  </div>
                  
                  {/* Company Insights */}
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <h4 className="font-medium text-orange-900 mb-2 flex items-center">
                      <Building2 className="w-4 h-4 mr-2" />
                      Top Companies
                    </h4>
                    <p className="text-orange-800 text-sm">
                      {aiInsights.companyInsights || "Top companies hiring: TCS, Infosys, Microsoft, Google"}
                    </p>
                  </div>
                </div>
                
                {/* AI Recommendations */}
                {aiInsights.recommendations && aiInsights.recommendations.length > 0 && (
                  <div className="mt-6 bg-white rounded-lg p-4 shadow-sm">
                    <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                      <Zap className="w-4 h-4 mr-2 text-yellow-600" />
                      AI Recommendations
                    </h4>
                    <ul className="space-y-2">
                      {aiInsights.recommendations.map((recommendation, index) => (
                        <li key={index} className="flex items-start">
                          <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                          <span className="text-gray-700 text-sm">{recommendation}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

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
      <div className="max-w-6xl mx-auto px-4 py-8">
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
