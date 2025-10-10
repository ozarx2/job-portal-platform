import React, { useState, useEffect } from 'react';
import { Search, MapPin, Filter, X, Clock, Building2, DollarSign } from 'lucide-react';
import axios from 'axios';

const JobSearch = ({ onSearchResults, onSearchChange }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [location, setLocation] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    jobType: '',
    salaryRange: '',
    experience: '',
    company: ''
  });
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchHistory, setSearchHistory] = useState([]);

  // Job type options
  const jobTypes = ['Full-time', 'Part-time', 'Contract', 'Remote', 'Internship'];
  
  // Salary ranges
  const salaryRanges = [
    '0-3 LPA', '3-6 LPA', '6-10 LPA', '10-15 LPA', 
    '15-25 LPA', '25-50 LPA', '50+ LPA'
  ];

  // Experience levels
  const experienceLevels = [
    'Fresher', '0-1 years', '1-3 years', '3-5 years', 
    '5-10 years', '10+ years'
  ];

  // Popular job titles for suggestions
  const popularJobs = [
    'Software Engineer', 'Data Scientist', 'Product Manager', 
    'UX Designer', 'Marketing Manager', 'Sales Executive',
    'HR Manager', 'Business Analyst', 'DevOps Engineer',
    'Full Stack Developer', 'Frontend Developer', 'Backend Developer'
  ];

  // Popular locations
  const popularLocations = [
    'Bangalore', 'Mumbai', 'Delhi', 'Hyderabad', 'Chennai',
    'Pune', 'Kolkata', 'Gurgaon', 'Noida', 'Remote'
  ];

  useEffect(() => {
    if (searchTerm.length > 2) {
      const filtered = popularJobs.filter(job => 
        job.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setSuggestions(filtered.slice(0, 5));
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [searchTerm]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim() && !location.trim() && !Object.values(filters).some(v => v.trim())) {
      return; // Don't search if no criteria provided
    }
    
    setLoading(true);
    
    try {
      const params = new URLSearchParams({
        search: searchTerm,
        location: location,
        jobType: filters.jobType,
        company: filters.company,
        page: 1,
        limit: 20
      });

      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL || 'https://api.ozarx.in/api'}/jobs?${params}`);
      
      // Handle direct array response from backend
      if (Array.isArray(response.data)) {
        onSearchResults(response.data);
        onSearchChange({ searchTerm, location, filters });
        
        // Add to search history
        const searchQuery = { searchTerm, location, filters, timestamp: new Date() };
        setSearchHistory(prev => [searchQuery, ...prev.slice(0, 4)]); // Keep last 5 searches
      } else if (response.data.success) {
        // Handle wrapped response format (if backend changes in future)
        onSearchResults(response.data.data);
        onSearchChange({ searchTerm, location, filters });
        
        // Add to search history
        const searchQuery = { searchTerm, location, filters, timestamp: new Date() };
        setSearchHistory(prev => [searchQuery, ...prev.slice(0, 4)]); // Keep last 5 searches
      }
    } catch (error) {
      console.error('Search error:', error);
      // You could add error handling here, like showing a toast notification
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchTerm(suggestion);
    setShowSuggestions(false);
  };

  const clearFilters = () => {
    setFilters({
      jobType: '',
      salaryRange: '',
      experience: '',
      company: ''
    });
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== '');

  return (
    <div className="w-full max-w-4xl mx-auto">
      <form onSubmit={handleSearch} className="space-y-4">
        {/* Main Search Bar */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-6 border border-white/20">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Job Title Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Job title, keywords, or company"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
              />
              
              {/* Search Suggestions */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-200 z-50">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 first:rounded-t-xl last:rounded-b-xl flex items-center"
                    >
                      <Search className="w-4 h-4 text-gray-400 mr-3" />
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Location Search */}
            <div className="flex-1 relative">
              <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="City, state, or remote"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
              />
            </div>

            {/* Search Button */}
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 transform hover:scale-105 font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <Search className="w-5 h-5 mr-2" />
                  Search Jobs
                </>
              )}
            </button>
          </div>

          {/* Advanced Filters Toggle */}
          <div className="mt-4 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center text-gray-600 hover:text-blue-600 transition-colors"
            >
              <Filter className="w-4 h-4 mr-2" />
              Advanced Filters
              {hasActiveFilters && (
                <span className="ml-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                  {Object.values(filters).filter(v => v !== '').length}
                </span>
              )}
            </button>
            
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="flex items-center text-red-600 hover:text-red-700 transition-colors"
              >
                <X className="w-4 h-4 mr-1" />
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Job Type Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job Type
                </label>
                <select
                  value={filters.jobType}
                  onChange={(e) => setFilters(prev => ({ ...prev, jobType: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Any Type</option>
                  {jobTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              {/* Salary Range Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Salary Range
                </label>
                <select
                  value={filters.salaryRange}
                  onChange={(e) => setFilters(prev => ({ ...prev, salaryRange: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Any Salary</option>
                  {salaryRanges.map(range => (
                    <option key={range} value={range}>{range}</option>
                  ))}
                </select>
              </div>

              {/* Experience Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Experience
                </label>
                <select
                  value={filters.experience}
                  onChange={(e) => setFilters(prev => ({ ...prev, experience: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Any Experience</option>
                  {experienceLevels.map(exp => (
                    <option key={exp} value={exp}>{exp}</option>
                  ))}
                </select>
              </div>

              {/* Company Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company
                </label>
                <input
                  type="text"
                  placeholder="Company name"
                  value={filters.company}
                  onChange={(e) => setFilters(prev => ({ ...prev, company: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* Quick Search Tags */}
        <div className="flex flex-wrap gap-2">
          <span className="text-sm text-gray-600 mr-2">Popular searches:</span>
          {popularJobs.slice(0, 4).map((job, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setSearchTerm(job)}
              className="px-3 py-1 bg-white/80 backdrop-blur-sm text-gray-700 rounded-full text-sm hover:bg-blue-50 hover:text-blue-700 transition-colors border border-gray-200"
            >
              {job}
            </button>
          ))}
        </div>
      </form>
    </div>
  );
};

export default JobSearch;
