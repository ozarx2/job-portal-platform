import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Briefcase, Building2, Clock, DollarSign, Search } from 'lucide-react';
import JobApplicationModal from './JobApplicationModal';
import LoginPrompt from './LoginPrompt';

const JobListing = ({ searchResults = null }) => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalJobs, setTotalJobs] = useState(0);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const jobsPerPage = 20;

  useEffect(() => {
    if (searchResults) {
      setJobs(searchResults);
      setTotalJobs(searchResults.length);
      setTotalPages(1);
      setLoading(false);
    } else {
      fetchJobs();
    }
  }, [currentPage, searchResults]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage,
        limit: jobsPerPage
      });

      const response = await axios.get(`http://ec2-15-134-104-170.ap-southeast-2.compute.amazonaws.com/api/jobs?${params}`);
      
      // Handle direct array response from backend
      if (Array.isArray(response.data)) {
        setJobs(response.data);
        setTotalJobs(response.data.length);
        setTotalPages(Math.ceil(response.data.length / jobsPerPage));
      } else if (response.data.success) {
        // Handle wrapped response format (if backend changes in future)
        setJobs(response.data.data || []);
        if (response.data.pagination) {
          setTotalJobs(response.data.pagination.totalJobs);
          setTotalPages(response.data.pagination.totalPages);
        } else {
          setTotalJobs(response.data.data?.length || 0);
          setTotalPages(Math.ceil((response.data.data?.length || 0) / jobsPerPage));
        }
      } else {
        // Handle other response formats
        setJobs(response.data || []);
        setTotalJobs(response.data?.length || 0);
        setTotalPages(Math.ceil((response.data?.length || 0) / jobsPerPage));
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
      setError('Failed to fetch jobs. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Removed local search form; listing now shows jobs without additional filters

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

  const handleApplicationSuccess = () => {
    setShowApplicationModal(false);
    setSelectedJob(null);
    // Optionally refresh the jobs list or show a success message
  };

  // Helper function to check if current user is a candidate
  const isCandidate = () => {
    const userData = localStorage.getItem('user');
    if (!userData) return false;
    
    const user = JSON.parse(userData);
    return user.role === 'candidate';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getJobTypeColor = (jobType) => {
    switch (jobType) {
      case 'Full-time': return 'bg-green-50 text-green-700 border-green-200';
      case 'Part-time': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Contract': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Remote': return 'bg-orange-50 text-orange-700 border-orange-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const renderPagination = () => {
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-3 py-2 mx-1 rounded text-sm font-medium transition-colors ${
            i === currentPage
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          {i}
        </button>
      );
    }

    return (
      <div className="flex items-center justify-center space-x-2 mt-8">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-4 py-2 text-sm font-medium bg-white text-gray-700 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Previous
        </button>
        {pages}
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-4 py-2 text-sm font-medium bg-white text-gray-700 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Next
        </button>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading jobs...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-w-md mx-auto">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchJobs}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">

        {/* Search and Filters removed as requested */}

        {/* Clear Search Button */}
        {searchResults && (
          <div className="flex justify-center mb-8">
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-white/80 backdrop-blur-sm text-gray-700 rounded-xl hover:bg-white/90 transition-all duration-200 border border-white/30 shadow-lg"
            >
              <Search className="w-5 h-5 inline mr-2" />
              Clear Search & Show All Jobs
            </button>
          </div>
        )}

        {/* Job Cards */}
        {jobs.length === 0 ? (
          <div className="text-center py-12">
            <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              {searchResults ? 'No jobs found matching your search' : 'No jobs found'}
            </h3>
            <p className="text-gray-500">
              {searchResults ? 'Try adjusting your search criteria or browse all jobs' : 'Try adjusting your search criteria'}
            </p>
            {searchResults && (
              <button
                onClick={() => window.location.reload()}
                className="mt-4 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all duration-200"
              >
                Browse All Jobs
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => (
              <div
                key={job._id}
                className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-4 flex-1">
                    {/* Company Logo */}
                    <div className="flex-shrink-0">
                      {job.companyId?.logo ? (
                        <img
                          src={`http://ec2-15-134-104-170.ap-southeast-2.compute.amazonaws.com${job.companyId.logo}`}
                          alt={job.companyId?.name || job.company}
                          className="w-12 h-12 rounded-lg object-cover border border-gray-200"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                          <Building2 className="w-6 h-6 text-gray-500" />
                        </div>
                      )}
                    </div>
                    
                    {/* Job Details */}
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {job.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-1">
                        {job.companyId?.name || job.company || job.postedBy?.name || 'N/A'}
                      </p>
                      <p className="text-gray-500 text-sm mb-1">
                        {job.location || 'Location not specified'}
                      </p>
                      {job.salary && (
                        <p className="text-green-600 font-medium text-sm">
                          {job.salary}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end space-y-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium border ${getJobTypeColor(job.jobType)}`}>
                      {job.jobType}
                    </span>
                    {job.jobId && (
                      <span className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded">
                        {job.jobId}
                      </span>
                    )}
                  </div>
                </div>

                {job.description && (
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {job.description.length > 100 
                      ? `${job.description.substring(0, 100)}...` 
                      : job.description}
                  </p>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="w-4 h-4 mr-1" />
                    {job.lastDate ? formatDate(job.lastDate) : 
                     job.deadline ? formatDate(job.deadline) : 'No deadline'}
                  </div>
                  
                  {/* Only show Apply Now button for candidates */}
                  {isCandidate() && (
                    <button
                      onClick={() => handleApplyNow(job)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                      Apply Now
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && renderPagination()}

        {/* Results Info */}
        <div className="text-center mt-8 text-gray-600">
          Showing {((currentPage - 1) * jobsPerPage) + 1} to {Math.min(currentPage * jobsPerPage, totalJobs)} of {totalJobs} jobs
        </div>

        {/* Application Modal */}
        {showApplicationModal && selectedJob && (
          <JobApplicationModal
            isOpen={showApplicationModal}
            onClose={() => setShowApplicationModal(false)}
            job={selectedJob}
            onSuccess={handleApplicationSuccess}
          />
        )}

        {/* Login Prompt */}
        {showLoginPrompt && (
          <LoginPrompt
            onClose={() => setShowLoginPrompt(false)}
          />
        )}
    </div>
  );
};

export default JobListing;
