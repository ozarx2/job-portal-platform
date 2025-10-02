import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  MapPin, 
  Clock, 
  DollarSign, 
  ExternalLink, 
  Globe,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import aggregatedJobService from '../services/aggregatedJobService';
import AggregatedJobModal from './AggregatedJobModal';

const AggregatedJobListing = ({ searchParams, onJobSelect }) => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [aggregation, setAggregation] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedJob, setSelectedJob] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [location, setLocation] = useState('');

  useEffect(() => {
    if (searchParams) {
      fetchAggregatedJobs();
    }
  }, [searchParams, currentPage]);

  const fetchAggregatedJobs = async (params = null) => {
    setLoading(true);
    setError(null);

    try {
      const searchParamsToUse = params || searchParams;
      const response = await aggregatedJobService.searchJobs({
        ...searchParamsToUse,
        page: currentPage,
        limit: 20
      });

      if (response.success) {
        setJobs(response.data);
        setPagination(response.pagination);
        setAggregation(response.aggregation);
      } else {
        setError(response.message || 'Failed to fetch aggregated jobs');
      }
    } catch (err) {
      console.error('Error fetching aggregated jobs:', err);
      setError('Failed to fetch jobs from multiple sources');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    
    const params = {
      searchTerm: searchTerm.trim(),
      location: location.trim() || undefined
    };
    
    fetchAggregatedJobs(params);
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

  const handleJobSelect = (job) => {
    setSelectedJob(job);
    setShowModal(true);
    if (onJobSelect) {
      onJobSelect(job);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedJob(null);
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

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Aggregating jobs from multiple sources...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
          <span className="text-red-800">{error}</span>
        </div>
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="text-center py-8">
        <Globe className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No aggregated jobs found</h3>
        <p className="text-gray-600">Try adjusting your search criteria or check back later.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Simple Search Form */}
      {!searchParams && (
        <div className="bg-white border rounded-lg p-4 mb-6">
          <h3 className="text-lg font-medium mb-3">Search Jobs</h3>
          <form onSubmit={handleSearch} className="flex gap-3">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Job title or keywords"
              className="flex-1 px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
              required
            />
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Location (optional)"
              className="flex-1 px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </form>
        </div>
      )}

      {/* Aggregation Stats */}
      {aggregation && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <TrendingUp className="w-5 h-5 text-blue-600 mr-2" />
              <span className="text-blue-800 font-medium">
                Aggregated from {aggregation.successfulSources}/{aggregation.totalSources} sources
              </span>
            </div>
            <span className="text-blue-600 text-sm">
              {new Date(aggregation.aggregatedAt).toLocaleTimeString()}
            </span>
          </div>
          {aggregation.errors && aggregation.errors.length > 0 && (
            <div className="mt-2 text-sm text-blue-700">
              Some sources unavailable: {aggregation.errors.map(e => e.source).join(', ')}
            </div>
          )}
        </div>
      )}

      {/* Job Listings */}
      <div className="space-y-4">
        {jobs.map((job, index) => (
          <div
            key={`${job.source}-${index}`}
            className="bg-white border rounded-lg p-4 hover:shadow-sm transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center mb-2">
                  <h3 className="text-lg font-medium text-gray-900 mr-2">
                    {job.title}
                  </h3>
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                    {job.source.toUpperCase()}
                  </span>
                </div>
                
                <div className="text-gray-600 mb-2">
                  <span className="mr-4">{job.company}</span>
                  <span>{job.location}</span>
                </div>

                {job.salary && (
                  <div className="text-green-600 mb-2 font-medium">
                    {job.salary}
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    {formatDate(job.postedDate)}
                  </div>
                  <button
                    onClick={() => handleJobSelect(job)}
                    className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Simple Pagination */}
      {pagination && (
        <div className="bg-white border rounded-lg p-4 mt-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing {jobs.length} of {pagination.totalJobs} jobs
            </div>
            
            {pagination.totalPages > 1 && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={!pagination.hasPrevPage}
                  className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                
                <span className="px-3 py-1 text-sm">
                  {pagination.currentPage} / {pagination.totalPages}
                </span>
                
                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={!pagination.hasNextPage}
                  className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Job Details Modal */}
      <AggregatedJobModal
        job={selectedJob}
        isOpen={showModal}
        onClose={handleCloseModal}
      />
    </div>
  );
};

export default AggregatedJobListing;
