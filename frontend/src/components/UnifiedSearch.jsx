import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Brain, 
  TrendingUp, 
  Loader2, 
  AlertCircle,
  ExternalLink,
  Building2,
  MapPin,
  Clock,
  DollarSign,
  Globe
} from 'lucide-react';
import axios from 'axios';
import aiService from '../services/aiService';
import aggregatedJobService from '../services/aggregatedJobService';
import JobApplicationModal from './JobApplicationModal';
import AggregatedJobModal from './AggregatedJobModal';
import LoginPrompt from './LoginPrompt';

const UnifiedSearch = ({ onSearchResults, onSearchChange }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [searchHistory, setSearchHistory] = useState([]);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [showAggregatedJobModal, setShowAggregatedJobModal] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    // Load search history from localStorage
    const savedHistory = localStorage.getItem('unifiedSearchHistory');
    if (savedHistory) {
      setSearchHistory(JSON.parse(savedHistory));
    }
  }, []);

  const saveToHistory = (searchData) => {
    const newEntry = {
      ...searchData,
      timestamp: new Date(),
      id: Date.now()
    };
    const updatedHistory = [newEntry, ...searchHistory.slice(0, 9)]; // Keep last 10
    setSearchHistory(updatedHistory);
    localStorage.setItem('unifiedSearchHistory', JSON.stringify(updatedHistory));
  };

  const handleSearch = async (e, page = 1) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    setLoading(true);
    setError(null);
    setCurrentPage(page);

    try {
      // Search from multiple sources in parallel
      const [traditionalResults, aiResults, aggregatedResults] = await Promise.allSettled([
        // Traditional search (internal jobs)
        axios.get(`http://localhost:5000/api/jobs`, {
          params: {
            search: searchTerm,
            location: location,
            page: page,
            limit: 20
          }
        }),
        
        // AI search
        aiService.searchJobs(searchTerm),
        
        // Aggregated search
        aggregatedJobService.searchJobs({
          searchTerm,
          location,
          page: page,
          limit: 20
        })
      ]);

      // Process results
      const processedResults = {
        traditional: traditionalResults.status === 'fulfilled' ? traditionalResults.value.data : null,
        ai: aiResults.status === 'fulfilled' ? aiResults.value : null,
        aggregated: aggregatedResults.status === 'fulfilled' ? aggregatedResults.value : null,
        searchTerm,
        location,
        timestamp: new Date()
      };

      // Combine and deduplicate results
      const combinedJobs = [];
      const seenJobs = new Set();

      // Add traditional jobs
      if (processedResults.traditional?.success && processedResults.traditional.data) {
        processedResults.traditional.data.forEach(job => {
          const key = `${job.title}-${job.company}`.toLowerCase();
          if (!seenJobs.has(key)) {
            seenJobs.add(key);
            combinedJobs.push({
              ...job,
              source: 'internal',
              sourceType: 'Traditional',
              sourceIcon: '🏢',
              sourceColor: 'bg-blue-100 text-blue-800'
            });
          }
        });
      }

      // Add AI results
      if (processedResults.ai?.success && processedResults.ai.data?.jobs) {
        processedResults.ai.data.jobs.forEach(job => {
          const key = `${job.title}-${job.company}`.toLowerCase();
          if (!seenJobs.has(key)) {
            seenJobs.add(key);
            combinedJobs.push({
              ...job,
              source: 'ai',
              sourceType: 'AI Recommended',
              sourceIcon: '🤖',
              sourceColor: 'bg-purple-100 text-purple-800'
            });
          }
        });
      }

      // Add aggregated jobs
      if (processedResults.aggregated?.success && processedResults.aggregated.data) {
        processedResults.aggregated.data.forEach(job => {
          const key = `${job.title}-${job.company}`.toLowerCase();
          if (!seenJobs.has(key)) {
            seenJobs.add(key);
            combinedJobs.push({
              ...job,
              source: job.source,
              sourceType: job.source.toUpperCase(),
              sourceIcon: getSourceIcon(job.source),
              sourceColor: getSourceColor(job.source)
            });
          }
        });
      }

      setResults({
        jobs: combinedJobs,
        insights: processedResults.ai?.data?.insights || null,
        aggregation: processedResults.aggregated?.aggregation || null,
        pagination: processedResults.aggregated?.pagination || null,
        searchTerm,
        location
      });

      // Save to history
      saveToHistory({ searchTerm, location, resultCount: combinedJobs.length });

      // Notify parent component
      if (onSearchResults) {
        onSearchResults(combinedJobs, processedResults.ai?.data?.insights);
      }
      if (onSearchChange) {
        onSearchChange({ searchTerm, location, filters: {} });
      }

    } catch (err) {
      console.error('Unified search error:', err);
      setError('Failed to search across all sources. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getSourceIcon = (source) => {
    const icons = {
      indeed: '🔍',
      linkedin: '💼',
      glassdoor: '🏢',
      naukri: '🇮🇳',
      monster: '👹'
    };
    return icons[source] || '🌐';
  };

  const getSourceColor = (source) => {
    const colors = {
      indeed: 'bg-blue-100 text-blue-800',
      linkedin: 'bg-blue-100 text-blue-800',
      glassdoor: 'bg-green-100 text-green-800',
      naukri: 'bg-orange-100 text-orange-800',
      monster: 'bg-purple-100 text-purple-800'
    };
    return colors[source] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  const handleHistoryClick = (historyItem) => {
    setSearchTerm(historyItem.searchTerm);
    setLocation(historyItem.location || '');
  };

  const handleApplyNow = (job) => {
    const token = localStorage.getItem('token');
    if (!token) {
      setShowLoginPrompt(true);
      return;
    }
    
    // Check if user is a candidate
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      if (user.role !== 'candidate') {
        alert(`Only candidates can apply for jobs. Your current role is: ${user.role}`);
        return;
      }
    }
    
    setSelectedJob(job);
    setShowApplicationModal(true);
  };

  // Helper function to check if current user is a candidate
  const isCandidate = () => {
    const userData = localStorage.getItem('user');
    if (!userData) return false;
    
    const user = JSON.parse(userData);
    return user.role === 'candidate';
  };

  const handleApplicationSuccess = () => {
    setShowApplicationModal(false);
    setSelectedJob(null);
  };

  return (
    <div className="w-full">
      {/* Search Form */}
      <form onSubmit={handleSearch} className="space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search for jobs (e.g., software engineer, data scientist...)"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>
          
          <div className="flex-1">
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Location (e.g., remote, New York, Bangalore...)"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[120px]"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Brain className="w-5 h-5 mr-2" />
                Unified Search
              </>
            )}
          </button>
        </div>
      </form>

      {/* Search History */}
      {searchHistory.length > 0 && (
        <div className="mt-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Recent Searches</h3>
          <div className="flex flex-wrap gap-2">
            {searchHistory.slice(0, 5).map((item) => (
              <button
                key={item.id}
                onClick={() => handleHistoryClick(item)}
                className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors"
              >
                {item.searchTerm} {item.location && `in ${item.location}`}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
            <span className="text-red-800">{error}</span>
          </div>
        </div>
      )}

      {/* Results */}
      {results && (
        <div className="mt-6">
          {/* Results Header */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Unified Search Results
                </h2>
                <p className="text-gray-600">
                  Found {results.jobs.length} jobs from multiple sources
                </p>
                {results.pagination && (
                  <div className="mt-2">
                    <div className="text-sm text-gray-500 mb-2">
                      <span className="font-medium text-blue-600">{results.jobs.length}</span> of <span className="font-medium text-purple-600">{results.pagination.totalJobs}</span> jobs found
                    </div>
                    {results.pagination.totalPages > 1 && (
                      <div className="text-xs text-gray-400">
                        Page {results.pagination.currentPage} of {results.pagination.totalPages} • Mixed from all sources
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                <span className="text-sm text-gray-600">
                  AI + Traditional + Aggregated
                </span>
              </div>
            </div>
          </div>

          {/* AI Insights */}
          {results.insights && (
            <div className="mb-6 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 border border-purple-200">
              <div className="flex items-center mb-3">
                <Brain className="w-5 h-5 text-purple-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">AI Insights</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {results.insights.marketTrends && (
                  <div className="bg-white rounded-lg p-3">
                    <h4 className="font-medium text-purple-900 mb-1">Market Trends</h4>
                    <p className="text-purple-800 text-sm">{results.insights.marketTrends}</p>
                  </div>
                )}
                {results.insights.skillDemand && (
                  <div className="bg-white rounded-lg p-3">
                    <h4 className="font-medium text-blue-900 mb-1">In-Demand Skills</h4>
                    <p className="text-blue-800 text-sm">{results.insights.skillDemand}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Job Listings */}
          <div className="space-y-4">
            {results.jobs.map((job, index) => (
              <div
                key={`${job.source}-${index}`}
                className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 mr-3">
                        {job.title}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${job.sourceColor}`}>
                        {job.sourceIcon} {job.sourceType}
                      </span>
                      <span className="ml-2 px-2 py-1 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 rounded-full text-xs font-medium">
                        Mixed Results
                      </span>
                    </div>
                    
                    <div className="flex items-center text-gray-600 mb-2">
                      <Building2 className="w-4 h-4 mr-1" />
                      <span className="mr-4">{job.company || 'Company not specified'}</span>
                      <MapPin className="w-4 h-4 mr-1" />
                      <span>{job.location || 'Location not specified'}</span>
                    </div>

                    {job.salary && (
                      <div className="flex items-center text-green-600 mb-2">
                        <DollarSign className="w-4 h-4 mr-1" />
                        <span className="font-medium">{job.salary}</span>
                      </div>
                    )}

                    {job.description && (
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {job.description}
                      </p>
                    )}

                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="w-4 h-4 mr-1" />
                      <span className="mr-4">{formatDate(job.postedDate || job.createdAt)}</span>
                      {job.jobType && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                          {job.jobType}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => {
                        setSelectedJob(job);
                        if (job.source === 'internal') {
                          // For internal jobs, we could show a different modal or the same one
                          setShowAggregatedJobModal(true);
                        } else {
                          setShowAggregatedJobModal(true);
                        }
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                      View Details
                    </button>
                    {job.source === 'internal' && isCandidate() ? (
                      <button 
                        onClick={() => handleApplyNow(job)}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                      >
                        Apply Now
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          if (job.sourceUrl) {
                            window.open(job.sourceUrl, '_blank', 'noopener,noreferrer');
                          }
                        }}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium flex items-center"
                      >
                        <ExternalLink className="w-4 h-4 mr-1" />
                        Search on {job.sourceType}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Simple Pagination */}
          {results.pagination && (
            <div className="bg-white border rounded-lg p-4 mt-6">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Showing {results.jobs.length} of {results.pagination.totalJobs} jobs
                </div>
                
                {results.pagination.totalPages > 1 && (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleSearch({ preventDefault: () => {} }, currentPage - 1)}
                      disabled={!results.pagination.hasPrevPage}
                      className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    
                    <span className="px-3 py-1 text-sm">
                      {results.pagination.currentPage} / {results.pagination.totalPages}
                    </span>
                    
                    <button
                      onClick={() => handleSearch({ preventDefault: () => {} }, currentPage + 1)}
                      disabled={!results.pagination.hasNextPage}
                      className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* No Results */}
          {results.jobs.length === 0 && (
            <div className="text-center py-8">
              <Globe className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
              <p className="text-gray-600">Try adjusting your search criteria or check back later.</p>
            </div>
          )}
        </div>
      )}

      {/* Application Modal */}
      {showApplicationModal && selectedJob && (
        <JobApplicationModal
          isOpen={showApplicationModal}
          onClose={() => setShowApplicationModal(false)}
          job={selectedJob}
          onSuccess={handleApplicationSuccess}
        />
      )}

      {/* Aggregated Job Modal */}
      {showAggregatedJobModal && selectedJob && (
        <AggregatedJobModal
          isOpen={showAggregatedJobModal}
          onClose={() => setShowAggregatedJobModal(false)}
          job={selectedJob}
        />
      )}

      {/* Login Prompt Modal */}
      {showLoginPrompt && (
        <LoginPrompt
          isOpen={showLoginPrompt}
          onClose={() => setShowLoginPrompt(false)}
        />
      )}
    </div>
  );
};

export default UnifiedSearch;
