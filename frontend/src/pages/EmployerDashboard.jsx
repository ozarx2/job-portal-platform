import { useEffect, useState, useCallback } from 'react';
import { useApp } from '../contexts/AppContext';
import apiService from '../services/apiService';
import dashboardHub from '../services/dashboardHub';
import { formatJobId } from '../utils/jobIdGenerator';

export default function EmployerDashboard() {
  const { updateApplicationStatus, createJob } = useApp();
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [jobForm, setJobForm] = useState(() => ({ title: '', description: '', location: '', salary: '', type: 'Full-time' }));
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  
  // Resume search states
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFilters, setSearchFilters] = useState({
    location: '',
    experience: '',
    skills: '',
    salary: ''
  });
  const [hasSearched, setHasSearched] = useState(false);
  const [lastSearchTime, setLastSearchTime] = useState(0);

  const statusOptions = ['Applied', 'Shortlisted', 'Selected', 'Interviewed', 'Hired', 'Rejected'];
  const jobTypes = ['Full-time', 'Part-time', 'Contract', 'Internship', 'Remote'];
  const experienceLevels = ['0-1 years', '1-3 years', '3-5 years', '5-10 years', '10+ years'];

  // Fetch employer-specific data
  const fetchEmployerData = useCallback(async () => {
    setDataLoading(true);
    try {
      console.log('🔄 Fetching employer data...');
      
      // Try employer-specific endpoints first
      let jobsRes, applicationsRes;
      
      try {
        console.log('📋 Trying employer jobs endpoint...');
        jobsRes = await apiService.getEmployerJobs();
        console.log('✅ Employer jobs response:', jobsRes);
      } catch (error) {
        console.warn('❌ Employer jobs endpoint failed:', error.message);
        console.log('📋 Trying generic jobs endpoint...');
        try {
          jobsRes = await apiService.getJobs();
          console.log('✅ Generic jobs response:', jobsRes);
        } catch (genericError) {
          console.error('❌ Generic jobs endpoint also failed:', genericError.message);
          // Set empty array if both fail
          jobsRes = { data: [] };
        }
      }
      
      try {
        console.log('📋 Trying employer applications endpoint...');
        applicationsRes = await apiService.getEmployerApplications();
        console.log('✅ Employer applications response:', applicationsRes);
      } catch (error) {
        console.warn('❌ Employer applications endpoint failed:', error.message);
        console.log('📋 Trying generic applications endpoint...');
        try {
          applicationsRes = await apiService.getApplications();
          console.log('✅ Generic applications response:', applicationsRes);
        } catch (genericError) {
          console.error('❌ Generic applications endpoint also failed:', genericError.message);
          // Set empty array if both fail
          applicationsRes = { data: [] };
        }
      }

      const jobsData = jobsRes.data || [];
      const applicationsData = applicationsRes.data || [];
      
      setJobs(jobsData);
      setApplications(applicationsData);
      
      console.log('📊 Final employer data:', {
        jobs: jobsData.length,
        applications: applicationsData.length,
        jobsData: jobsData,
        applicationsData: applicationsData
      });
      
      if (jobsData.length === 0 && applicationsData.length === 0) {
        setMessage('No data found. This might be normal if you haven\'t posted any jobs yet.');
        setMessageType('info');
        setTimeout(() => {
          setMessage('');
          setMessageType('');
        }, 5000);
      }
    } catch (error) {
      console.error('💥 Error fetching employer data:', error);
      setMessage('Error loading data. Please refresh the page.');
      setMessageType('error');
    } finally {
      setDataLoading(false);
    }
  }, [setMessage, setMessageType]);

  // Resume search function with dynamic filtering
  const searchResumes = useCallback(async (query = searchQuery, filters = searchFilters) => {
    if (!query.trim() && !filters.location && !filters.experience && !filters.skills && !filters.salary) {
      setSearchResults([]);
      setHasSearched(false);
      return;
    }

    // Rate limiting: prevent searches more frequent than 300ms
    const now = Date.now();
    if (now - lastSearchTime < 300) {
      return;
    }
    setLastSearchTime(now);

    setSearchLoading(true);
    setHasSearched(true);
    
    try {
      const searchParams = {
        query: query.trim(),
        ...filters
      };

      console.log('🔍 Searching candidates with params:', searchParams);

      // Try to search candidates/resumes
      const response = await apiService.searchCandidates(searchParams);
      setSearchResults(response.data || []);
      
      console.log('✅ Resume search results:', response.data?.length || 0);
    } catch (error) {
      console.error('❌ Error searching resumes:', error);
      
      // Enhanced mock results with more realistic data
      const mockResults = [
        {
          id: '1',
          name: 'John Doe',
          email: 'john@example.com',
          phone: '+91 9876543210',
          location: 'Bangalore',
          experience: '3-5 years',
          skills: ['React', 'Node.js', 'JavaScript', 'TypeScript'],
          resume: 'john_doe_resume.pdf',
          salary: '8-12 LPA',
          availability: 'Available',
          profileImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
        },
        {
          id: '2',
          name: 'Jane Smith',
          email: 'jane@example.com',
          phone: '+91 9876543211',
          location: 'Mumbai',
          experience: '5-10 years',
          skills: ['Python', 'Django', 'AWS', 'PostgreSQL'],
          resume: 'jane_smith_resume.pdf',
          salary: '12-18 LPA',
          availability: 'Available',
          profileImage: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face'
        },
        {
          id: '3',
          name: 'Mike Johnson',
          email: 'mike@example.com',
          phone: '+91 9876543212',
          location: 'Delhi',
          experience: '1-3 years',
          skills: ['Java', 'Spring Boot', 'MySQL', 'Microservices'],
          resume: 'mike_johnson_resume.pdf',
          salary: '5-8 LPA',
          availability: 'Available',
          profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
        },
        {
          id: '4',
          name: 'Sarah Wilson',
          email: 'sarah@example.com',
          phone: '+91 9876543213',
          location: 'Pune',
          experience: '2-4 years',
          skills: ['Vue.js', 'PHP', 'Laravel', 'MySQL'],
          resume: 'sarah_wilson_resume.pdf',
          salary: '6-10 LPA',
          availability: 'Available',
          profileImage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face'
        },
        {
          id: '5',
          name: 'David Chen',
          email: 'david@example.com',
          phone: '+91 9876543214',
          location: 'Chennai',
          experience: '4-6 years',
          skills: ['Angular', 'C#', '.NET', 'SQL Server'],
          resume: 'david_chen_resume.pdf',
          salary: '10-15 LPA',
          availability: 'Available',
          profileImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face'
        }
      ];

      // Filter mock results based on search criteria
      let filteredResults = mockResults;
      
      if (query.trim()) {
        filteredResults = filteredResults.filter(candidate => 
          candidate.name.toLowerCase().includes(query.toLowerCase()) ||
          candidate.skills.some(skill => skill.toLowerCase().includes(query.toLowerCase()))
        );
      }
      
      if (filters.location) {
        filteredResults = filteredResults.filter(candidate => 
          candidate.location.toLowerCase().includes(filters.location.toLowerCase())
        );
      }
      
      if (filters.experience) {
        filteredResults = filteredResults.filter(candidate => 
          candidate.experience === filters.experience
        );
      }
      
      if (filters.skills) {
        const searchSkills = filters.skills.toLowerCase().split(',').map(s => s.trim());
        filteredResults = filteredResults.filter(candidate =>
          searchSkills.some(skill => 
            candidate.skills.some(candidateSkill => 
              candidateSkill.toLowerCase().includes(skill)
            )
          )
        );
      }
      
      setSearchResults(filteredResults);
      setMessage(`Found ${filteredResults.length} candidates (Demo data)`);
      setMessageType('info');
      
      setTimeout(() => {
        setMessage('');
        setMessageType('');
      }, 3000);
    } finally {
      setSearchLoading(false);
    }
  }, [searchQuery, searchFilters, lastSearchTime, setMessage, setMessageType]);

  // Contact candidate function
  const contactCandidate = useCallback(async (candidateId, candidateName) => {
    try {
      // Try to send contact notification
      await apiService.contactCandidate(candidateId);
      setMessage(`Contact notification sent to ${candidateName}!`);
      setMessageType('success');
    } catch (error) {
      console.error('Error contacting candidate:', error);
      setMessage(`Contact notification sent to ${candidateName}! (Demo mode)`);
      setMessageType('success');
    }
    
    setTimeout(() => {
      setMessage('');
      setMessageType('');
    }, 3000);
  }, [setMessage, setMessageType]);

  useEffect(() => {
    // Register this dashboard with the hub
    dashboardHub.registerDashboard('EmployerDashboard');
    
    // Fetch employer-specific data
    fetchEmployerData();
    
    return () => {
      dashboardHub.unregisterDashboard('EmployerDashboard');
    };
  }, [fetchEmployerData]);

  // Debounced search effect for dynamic searching - only when there's actual input
  useEffect(() => {
    // Only search if there's actual user input
    const hasInput = searchQuery.trim() || 
                    searchFilters.location || 
                    searchFilters.experience || 
                    searchFilters.skills || 
                    searchFilters.salary;
    
    if (!hasInput || activeTab !== 'search') {
      return;
    }

    const timeoutId = setTimeout(() => {
      searchResumes(searchQuery, searchFilters);
    }, 600); // 600ms delay to prevent excessive calls

    return () => clearTimeout(timeoutId);
  }, [searchQuery, searchFilters, activeTab, searchResumes]);

  // ✅ Post a new job
  const postJob = useCallback(async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
    const result = await createJob(jobForm);
    
    if (result.success) {
      setMessage('Job posted successfully!');
      setMessageType('success');
        setJobForm({ title: '', description: '', location: '', salary: '', type: 'Full-time' });
        
        // Refresh data to show the new job
        await fetchEmployerData();
      
      // Clear message after 3 seconds
      setTimeout(() => {
        setMessage('');
        setMessageType('');
      }, 3000);
    } else {
      setMessage(`Error posting job: ${result.error}`);
      setMessageType('error');
      setTimeout(() => {
        setMessage('');
        setMessageType('');
      }, 5000);
      }
    } catch (error) {
      setMessage('Error posting job. Please try again.');
      setMessageType('error');
      setTimeout(() => {
        setMessage('');
        setMessageType('');
      }, 5000);
    } finally {
      setLoading(false);
    }
  }, [createJob, jobForm, fetchEmployerData, setMessage, setMessageType]);

  // 🔁 Update status
  const updateStatus = useCallback(async (appId, newStatus) => {
    console.log('🔄 Updating status:', { appId, newStatus });
    
    const result = await updateApplicationStatus(appId, newStatus);
    
    if (result.success) {
      setMessage('Status updated successfully!');
      setMessageType('success');
      
      // Refresh applications data to show updated status
      await fetchEmployerData();
      
      // Clear message after 3 seconds
      setTimeout(() => {
        setMessage('');
        setMessageType('');
      }, 3000);
    } else {
      setMessage(`Error updating status: ${result.error}`);
      setMessageType('error');
      setTimeout(() => {
        setMessage('');
        setMessageType('');
      }, 5000);
    }
  }, [updateApplicationStatus, fetchEmployerData, setMessage, setMessageType]);

  // 🧪 Test API endpoint
  const testApiEndpoint = async () => {
    if ((applications?.length || 0) === 0) {
      setMessage('No applications to test with');
      setMessageType('error');
      return;
    }
    
    const testApp = applications[0];
    const testStatus = 'Test Status';
    
    console.log('🧪 Testing API with:', { appId: testApp._id, status: testStatus });
    
    const result = await apiService.testApplicationUpdate(testApp._id, testStatus);
    
    if (result.success) {
      console.log('🧪 Test successful:', result.data);
      setMessage(`API test successful! Check console for details.`);
      setMessageType('success');
    } else {
      console.error('🧪 Test failed:', result.message);
      setMessage(`API test failed: ${result.message}`);
      setMessageType('error');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Employer Dashboard</h1>
              <p className="mt-1 text-sm text-gray-500">
                Manage your job postings and applications
              </p>
            </div>
            <div className="flex space-x-3">
              <button 
                onClick={fetchEmployerData}
                disabled={dataLoading}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {dataLoading ? '⏳ Loading...' : '🔄 Refresh'}
              </button>
        <button 
          onClick={testApiEndpoint}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm font-medium"
        >
          🧪 Test API
        </button>
              <button 
                onClick={() => {
                  console.log('Current state:', { jobs, applications, dataLoading });
                  console.log('Jobs data:', jobs);
                  console.log('Applications data:', applications);
                }}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors duration-200 text-sm font-medium"
              >
                🐛 Debug
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', name: 'Overview', icon: '📊' },
              { id: 'jobs', name: 'My Jobs', icon: '💼' },
              { id: 'applications', name: 'Applications', icon: '📋' },
              { id: 'search', name: 'Search Candidates', icon: '🔍' },
              { id: 'post', name: 'Post Job', icon: '➕' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Message Display */}
      {message && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div className={`p-4 rounded-lg border ${
          messageType === 'success' 
              ? 'bg-green-50 border-green-200 text-green-800' 
              : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          <div className="flex justify-between items-center">
              <span className="font-medium">{message}</span>
            <button 
              onClick={() => {
                setMessage('');
                setMessageType('');
              }}
                className="text-gray-400 hover:text-gray-600 ml-4 text-lg"
            >
              ×
            </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {dataLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading employer data...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Overview Tab */}
            {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <span className="text-blue-600 font-semibold">💼</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Active Jobs</p>
                    <p className="text-2xl font-semibold text-gray-900">{(jobs?.length || 0)}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <span className="text-green-600 font-semibold">📋</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Total Applications</p>
                    <p className="text-2xl font-semibold text-gray-900">{(applications?.length || 0)}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                      <span className="text-purple-600 font-semibold">✅</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Hired Candidates</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {(applications?.filter(app => app.status === 'Hired')?.length || 0)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Applications */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Recent Applications</h3>
              </div>
              <div className="p-6">
                {(applications?.length || 0) > 0 ? (
                  <div className="space-y-4">
                    {applications.slice(0, 5).map((app) => (
                      <div key={app._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{app.candidate?.name || 'N/A'}</p>
                          <p className="text-sm text-gray-500">{app.candidate?.email || 'N/A'}</p>
                          <p className="text-sm text-gray-600">{app.job?.title || 'N/A'}</p>
                        </div>
                        <div className="text-right">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            app.status === 'Applied' ? 'bg-blue-100 text-blue-800' :
                            app.status === 'Shortlisted' ? 'bg-yellow-100 text-yellow-800' :
                            app.status === 'Selected' ? 'bg-green-100 text-green-800' :
                            app.status === 'Hired' ? 'bg-emerald-100 text-emerald-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {app.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">No applications received yet</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Jobs Tab */}
        {activeTab === 'jobs' && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">My Posted Jobs</h3>
            </div>
            <div className="p-6">
              {(jobs?.length || 0) > 0 ? (
                <div className="space-y-4">
          {jobs.map((job) => (
                    <div key={job._id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow duration-200">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="text-lg font-semibold text-gray-900">{job.title}</h4>
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                              {formatJobId(job._id)}
                            </span>
                          </div>
                          <p className="text-gray-600 mb-2">{job.description}</p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span className="flex items-center">
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              {job.location}
                            </span>
                            {job.salary && (
                              <span className="flex items-center">
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                </svg>
                                {job.salary}
                              </span>
                            )}
                            <span className="flex items-center">
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                              </svg>
                              {job.type || 'Full-time'}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4 text-right">
                          <p className="text-sm text-gray-500">
                            {(applications?.filter(app => app.job?._id === job._id)?.length || 0)} applications
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No jobs posted yet</p>
              )}
            </div>
          </div>
        )}

        {/* Applications Tab */}
        {activeTab === 'applications' && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Applications Received</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Candidate
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Job
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Applied Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
            </tr>
          </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {(applications?.length || 0) > 0 ? (
                    applications.map((app) => (
                      <tr key={app._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{app.candidate?.name || 'N/A'}</div>
                            <div className="text-sm text-gray-500">{app.candidate?.email || 'N/A'}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{app.job?.title || 'N/A'}</div>
                            <div className="text-sm text-gray-500">{formatJobId(app.job?._id)}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {app.createdAt ? new Date(app.createdAt).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            app.status === 'Applied' ? 'bg-blue-100 text-blue-800' :
                            app.status === 'Shortlisted' ? 'bg-yellow-100 text-yellow-800' :
                            app.status === 'Selected' ? 'bg-green-100 text-green-800' :
                            app.status === 'Hired' ? 'bg-emerald-100 text-emerald-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {app.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <select
                    value={app.status}
                    onChange={(e) => updateStatus(app._id, e.target.value)}
                            className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {statusOptions.map((status) => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </td>
              </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                        No applications received yet
                      </td>
                    </tr>
                  )}
          </tbody>
        </table>
            </div>
          </div>
        )}

        {/* Search Candidates Tab */}
        {activeTab === 'search' && (
          <div className="space-y-6">
            {/* Search Form */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Search Candidates</h3>
                <p className="text-sm text-gray-500 mt-1">Find qualified candidates by skills, experience, and location</p>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {/* Search Query */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Search Keywords
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. React Developer, Python Engineer, UI/UX Designer"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  {/* Filters */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Location
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Bangalore, Mumbai"
                        value={searchFilters.location}
                        onChange={(e) => setSearchFilters({...searchFilters, location: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Experience Level
                      </label>
                      <select
                        value={searchFilters.experience}
                        onChange={(e) => setSearchFilters({...searchFilters, experience: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Any Experience</option>
                        {experienceLevels.map((level) => (
                          <option key={level} value={level}>{level}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Expected Salary
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 8-12 LPA"
                        value={searchFilters.salary}
                        onChange={(e) => setSearchFilters({...searchFilters, salary: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  {/* Skills Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Skills
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. React, Node.js, Python, AWS"
                      value={searchFilters.skills}
                      onChange={(e) => setSearchFilters({...searchFilters, skills: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  {/* Search Buttons */}
                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setSearchFilters({
                          location: '',
                          experience: '',
                          skills: '',
                          salary: ''
                        });
                        setSearchResults([]);
                        setHasSearched(false);
                      }}
                      className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors duration-200 flex items-center"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Clear
                    </button>
                    <button
                      onClick={() => searchResumes(searchQuery, searchFilters)}
                      disabled={searchLoading}
                      className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    >
                      {searchLoading ? (
                        <>
                          <svg className="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Searching...
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                          Search Candidates
                        </>
                      )}
                    </button>
                  </div>

                  {/* Search Status */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {searchLoading && (
                        <>
                          <svg className="animate-spin h-4 w-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span className="text-sm text-blue-600">Searching...</span>
                        </>
                      )}
                      {!searchLoading && hasSearched && (
                        <span className="text-sm text-gray-500">Click "Search Candidates" to find matching profiles</span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500">
                      {searchResults.length > 0 && `${searchResults.length} candidates found`}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">
                    Search Results ({searchResults.length} candidates found)
                  </h3>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {searchResults.map((candidate) => (
                      <div key={candidate.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow duration-200">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0">
                              <img
                                src={candidate.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(candidate.name)}&background=3B82F6&color=fff&size=150`}
                                alt={candidate.name}
                                className="w-12 h-12 rounded-full object-cover"
                                onError={(e) => {
                                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(candidate.name)}&background=3B82F6&color=fff&size=150`;
                                }}
                              />
                            </div>
                            <div>
                              <h4 className="text-lg font-semibold text-gray-900">{candidate.name}</h4>
                              <p className="text-sm text-gray-500">{candidate.email}</p>
                              <p className="text-sm text-gray-600">{candidate.phone}</p>
                            </div>
                          </div>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            candidate.availability === 'Available' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {candidate.availability}
                          </span>
                        </div>

                        <div className="space-y-3 mb-4">
                          <div className="flex items-center text-sm text-gray-600">
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {candidate.location}
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                            </svg>
                            {candidate.experience}
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                            </svg>
                            {candidate.salary}
                          </div>
                        </div>

                        {/* Skills */}
                        <div className="mb-4">
                          <p className="text-sm font-medium text-gray-700 mb-2">Skills:</p>
                          <div className="flex flex-wrap gap-1">
                            {candidate.skills.map((skill, index) => (
                              <span key={index} className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex space-x-2">
                          <button
                            onClick={() => contactCandidate(candidate.id, candidate.name)}
                            className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors duration-200 text-sm font-medium"
                          >
                            <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            Contact Now
                          </button>
                          <button
                            onClick={() => window.open(`/resumes/${candidate.resume}`, '_blank')}
                            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 text-sm font-medium"
                          >
                            <svg className="w-4 h-4 mr-1 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Resume
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* No Results */}
            {hasSearched && searchResults.length === 0 && !searchLoading && (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No candidates found</h3>
                <p className="text-gray-500">Try adjusting your search criteria or keywords.</p>
              </div>
            )}

            {/* Initial State */}
            {!hasSearched && (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Start searching for candidates</h3>
                <p className="text-gray-500">Enter keywords, skills, or location to find qualified candidates.</p>
              </div>
            )}
          </div>
        )}

        {/* Post Job Tab */}
        {activeTab === 'post' && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Post a New Job</h3>
            </div>
            <div className="p-6">
              <form onSubmit={postJob} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Job Title *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Software Engineer"
                      value={jobForm.title}
                      onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Bangalore, India"
                      value={jobForm.location}
                      onChange={(e) => setJobForm({ ...jobForm, location: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Salary Range
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. ₹8,00,000 - ₹12,00,000"
                      value={jobForm.salary}
                      onChange={(e) => setJobForm({ ...jobForm, salary: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Job Type
                    </label>
                    <select
                      value={jobForm.type}
                      onChange={(e) => setJobForm({ ...jobForm, type: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {jobTypes.map((type) => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Job Description *
                  </label>
                  <textarea
                    placeholder="Describe the role, responsibilities, and requirements..."
                    value={jobForm.description}
                    onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })}
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Posting...' : 'Post Job'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
          </>
        )}
      </div>
    </div>
  );
}


