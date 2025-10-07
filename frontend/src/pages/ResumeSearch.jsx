import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  MapPin, 
  Briefcase, 
  GraduationCap, 
  Building2, 
  Filter,
  User,
  Mail,
  Phone,
  Calendar,
  Star,
  Eye,
  Download,
  Loader2,
  AlertCircle,
  CheckCircle,
  X,
  RefreshCw,
  ArrowLeft
} from 'lucide-react';
import apiService from '../services/apiService';

const ResumeSearch = () => {
  const navigate = useNavigate();
  
  // Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFilters, setSearchFilters] = useState({
    location: '',
    experience: '',
    skills: '',
    education: '',
    currentEmployer: '',
    employmentStatus: ''
  });
  
  // Results and UI states
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState(null);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCandidates, setTotalCandidates] = useState(0);
  const [resultsPerPage] = useState(12);

  // Experience options
  const experienceOptions = [
    '0-1 years', '1-2 years', '2-3 years', '3-5 years', 
    '5-7 years', '7-10 years', '10+ years'
  ];

  // Employment status options
  const employmentStatusOptions = [
    'Employed', 'Unemployed', 'Freelancer', 'Student', 'Available'
  ];

  // Debounced search function
  const searchCandidates = useCallback(async (query = searchQuery, filters = searchFilters, page = 1) => {
    // Check if we have any search criteria
    const hasSearchCriteria = query.trim() || 
                              filters.location.trim() || 
                              filters.experience || 
                              filters.skills.trim() || 
                              filters.education.trim() || 
                              filters.currentEmployer.trim() || 
                              filters.employmentStatus;

    console.log('🔍 Search criteria check:', {
      query: query.trim(),
      location: filters.location.trim(),
      experience: filters.experience,
      skills: filters.skills.trim(),
      education: filters.education.trim(),
      currentEmployer: filters.currentEmployer.trim(),
      employmentStatus: filters.employmentStatus,
      hasSearchCriteria
    });

    if (!hasSearchCriteria) {
      console.log('⚠️ No search criteria provided, clearing results');
      setSearchResults([]);
      setHasSearched(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Build search parameters
      const searchParams = {
        page,
        limit: resultsPerPage
      };

      if (query.trim()) {
        searchParams.query = query.trim();
      }
      if (filters.location.trim()) {
        searchParams.location = filters.location.trim();
      }
      if (filters.experience) {
        searchParams.experience = filters.experience;
      }
      if (filters.skills.trim()) {
        searchParams.skills = filters.skills.trim();
      }
      if (filters.education.trim()) {
        searchParams.education = filters.education.trim();
      }
      if (filters.currentEmployer.trim()) {
        searchParams.currentEmployer = filters.currentEmployer.trim();
      }
      if (filters.employmentStatus) {
        searchParams.employmentStatus = filters.employmentStatus;
      }

      console.log('🔍 Searching candidates with params:', searchParams);

      const response = await apiService.searchCandidates(searchParams);
      
      console.log('🔍 Full API response:', response);
      
      if (response.data && response.data.success) {
        setSearchResults(response.data.data || []);
        setCurrentPage(response.data.pagination?.currentPage || 1);
        setTotalPages(response.data.pagination?.totalPages || 1);
        setTotalCandidates(response.data.pagination?.totalCandidates || 0);
        setHasSearched(true);
        console.log('✅ Search results set:', response.data.data?.length || 0, 'candidates');
      } else {
        setError(response.data?.message || response.message || 'Search failed');
        setSearchResults([]);
        console.log('❌ Search failed:', response.data?.message || response.message);
      }

    } catch (error) {
      console.error('❌ Error searching candidates:', error);
      setError('Failed to search candidates. Please try again.');
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, searchFilters, resultsPerPage]);

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchCandidates();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, searchFilters]);

  // Handle search form submission
  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    searchCandidates(searchQuery, searchFilters, 1);
  };

  // Handle filter changes
  const handleFilterChange = (filterName, value) => {
    setSearchFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
    setCurrentPage(1);
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchFilters({
      location: '',
      experience: '',
      skills: '',
      education: '',
      currentEmployer: '',
      employmentStatus: ''
    });
    setSearchQuery('');
    setCurrentPage(1);
  };

  // Handle pagination
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    searchCandidates(searchQuery, searchFilters, newPage);
  };

  // Contact candidate
  const handleContactCandidate = async (candidateId) => {
    try {
      const response = await apiService.contactCandidate(candidateId, {
        message: 'I am interested in your profile and would like to discuss potential opportunities.',
        subject: 'Interest in Your Profile'
      });
      
      if (response.success) {
        setError(null);
        // Show success message
        console.log('✅ Candidate contacted successfully');
      }
    } catch (error) {
      console.error('❌ Error contacting candidate:', error);
      setError('Failed to contact candidate. Please try again.');
    }
  };

  // View candidate details
  const viewCandidateDetails = async (candidateId) => {
    try {
      const response = await apiService.getCandidate(candidateId);
      console.log('🔍 View candidate response:', response);
      
      if (response.data && response.data.success) {
        setSelectedCandidate(response.data.data);
        console.log('✅ Candidate details loaded:', response.data.data);
      } else {
        console.log('❌ Invalid response structure:', response.data);
        setError('Invalid response from server. Please try again.');
      }
    } catch (error) {
      console.error('❌ Error fetching candidate details:', error);
      setError('Failed to fetch candidate details. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/employer-dashboard')}
                className="flex items-center px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Resume Search</h1>
                <p className="text-gray-600 mt-1">Find the perfect candidates for your open positions</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center px-4 py-2 rounded-lg border transition-colors ${
                  showFilters 
                    ? 'bg-blue-50 border-blue-200 text-blue-700' 
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Form */}
        <div className="bg-white rounded-lg shadow-sm border mb-8">
          <form onSubmit={handleSearch} className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Main Search Input */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search by name, skills, or keywords..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              {/* Search Button */}
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Search className="w-5 h-5 mr-2" />
                    Search
                  </>
                )}
              </button>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Location */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <MapPin className="w-4 h-4 inline mr-1" />
                      Location
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Bangalore, Remote"
                      value={searchFilters.location}
                      onChange={(e) => handleFilterChange('location', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {/* Experience */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Briefcase className="w-4 h-4 inline mr-1" />
                      Experience
                    </label>
                    <select
                      value={searchFilters.experience}
                      onChange={(e) => handleFilterChange('experience', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Any experience</option>
                      {experienceOptions.map(exp => (
                        <option key={exp} value={exp}>{exp}</option>
                      ))}
                    </select>
                  </div>

                  {/* Skills */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Star className="w-4 h-4 inline mr-1" />
                      Skills
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., JavaScript, Python, React"
                      value={searchFilters.skills}
                      onChange={(e) => handleFilterChange('skills', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {/* Education */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <GraduationCap className="w-4 h-4 inline mr-1" />
                      Education
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., B.Tech, MBA, MCA"
                      value={searchFilters.education}
                      onChange={(e) => handleFilterChange('education', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {/* Current Employer */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Building2 className="w-4 h-4 inline mr-1" />
                      Current Employer
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Google, Microsoft"
                      value={searchFilters.currentEmployer}
                      onChange={(e) => handleFilterChange('currentEmployer', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {/* Employment Status */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <CheckCircle className="w-4 h-4 inline mr-1" />
                      Employment Status
                    </label>
                    <select
                      value={searchFilters.employmentStatus}
                      onChange={(e) => handleFilterChange('employmentStatus', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Any status</option>
                      {employmentStatusOptions.map(status => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Filter Actions */}
                <div className="flex justify-end mt-4">
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
              <span className="text-red-800">{error}</span>
              <button
                onClick={() => setError(null)}
                className="ml-auto text-red-400 hover:text-red-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Search Results Header */}
        {hasSearched && (
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Search Results
              </h2>
              <p className="text-gray-600">
                {totalCandidates > 0 
                  ? `${totalCandidates} candidates found`
                  : 'No candidates found matching your criteria'
                }
              </p>
            </div>
            {totalCandidates > 0 && (
              <div className="text-sm text-gray-500">
                Page {currentPage} of {totalPages}
              </div>
            )}
          </div>
        )}

        {/* Search Results */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">Searching candidates...</span>
          </div>
        )}

        {!loading && hasSearched && searchResults.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {searchResults.map((candidate) => (
              <div key={candidate.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                <div className="p-6">
                  {/* Candidate Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {candidate.userId?.name || 'N/A'}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {candidate.currentEmployer || 'Not specified'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Candidate Info */}
                  <div className="space-y-2 mb-4">
                    {candidate.location && (
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="w-4 h-4 mr-2" />
                        {candidate.location}
                      </div>
                    )}
                    
                    {candidate.experience && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Briefcase className="w-4 h-4 mr-2" />
                        {candidate.experience} years experience
                      </div>
                    )}
                    
                    {candidate.education && (
                      <div className="flex items-center text-sm text-gray-600">
                        <GraduationCap className="w-4 h-4 mr-2" />
                        {candidate.education}
                      </div>
                    )}
                  </div>

                  {/* Skills */}
                  {candidate.skills && candidate.skills.length > 0 && (
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-1">
                        {candidate.skills.slice(0, 3).map((skill, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                          >
                            {skill}
                          </span>
                        ))}
                        {candidate.skills.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                            +{candidate.skills.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex space-x-2">
                    <button
                      onClick={() => viewCandidateDetails(candidate.id)}
                      className="flex-1 flex items-center justify-center px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </button>
                    <button
                      onClick={() => handleContactCandidate(candidate.id)}
                      className="flex-1 flex items-center justify-center px-3 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition-colors"
                    >
                      <Mail className="w-4 h-4 mr-1" />
                      Contact
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* No Results */}
        {!loading && hasSearched && searchResults.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
            <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No candidates found</h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your search criteria or filters to find more candidates.
            </p>
            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        )}

        {/* Pagination */}
        {!loading && hasSearched && totalPages > 1 && (
          <div className="flex justify-center items-center space-x-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`px-3 py-2 border rounded-md text-sm ${
                  page === currentPage
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {page}
              </button>
            ))}
            
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}

        {/* Initial State */}
        {!hasSearched && !loading && (
          <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
            <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">Start searching for candidates</h3>
            <p className="text-gray-600 mb-6">
              Use the search form above to find qualified candidates for your open positions.
            </p>
            <div className="flex flex-wrap justify-center gap-2 text-sm text-gray-500">
              <span>• Search by skills</span>
              <span>• Filter by location</span>
              <span>• Filter by experience</span>
              <span>• Filter by education</span>
            </div>
          </div>
        )}
      </div>

      {/* Candidate Details Modal */}
      {selectedCandidate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Candidate Details</h2>
                <button
                  onClick={() => setSelectedCandidate(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Basic Info */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Basic Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Name</label>
                      <p className="text-gray-900">{selectedCandidate.userId?.name || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Email</label>
                      <p className="text-gray-900">{selectedCandidate.userId?.email || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Phone</label>
                      <p className="text-gray-900">{selectedCandidate.userId?.phone || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Location</label>
                      <p className="text-gray-900">{selectedCandidate.location || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Professional Info */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Professional Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Experience</label>
                      <p className="text-gray-900">{selectedCandidate.experience ? `${selectedCandidate.experience} years` : 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Education</label>
                      <p className="text-gray-900">{selectedCandidate.education || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Current Employer</label>
                      <p className="text-gray-900">{selectedCandidate.currentEmployer || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Employment Status</label>
                      <p className="text-gray-900">{selectedCandidate.currentEmploymentStatus || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Skills */}
                {selectedCandidate.skills && selectedCandidate.skills.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedCandidate.skills.map((skill, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Applied Job */}
                {selectedCandidate.appliedForJob && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Applied For</h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900">{selectedCandidate.appliedForJob.title}</h4>
                      <p className="text-gray-600">{selectedCandidate.appliedForJob.location}</p>
                      <p className="text-gray-600">{selectedCandidate.appliedForJob.jobType}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={() => setSelectedCandidate(null)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => handleContactCandidate(selectedCandidate.id)}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Contact Candidate
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumeSearch;

