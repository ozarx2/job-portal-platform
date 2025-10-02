import { useEffect, useState, useCallback } from 'react';
import { useApp } from '../contexts/AppContext';
import apiService from '../services/apiService';
import dashboardHub from '../services/dashboardHub';
import { formatJobId } from '../utils/jobIdGenerator';
import CompanyEditForm from '../components/CompanyEditForm';
import JobEditForm from '../components/JobEditForm';
import AssistedHiringService from '../components/AssistedHiringService';
import AssistedHiringServices from '../components/AssistedHiringServices';

export default function EmployerDashboard() {
  const { updateApplicationStatus, createJob } = useApp();
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [jobForm, setJobForm] = useState(() => ({ title: '', description: '', location: '', salary: '', type: 'Full-time', companyId: '' }));
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
  
  // Company management states
  const [showCompanyForm, setShowCompanyForm] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
  const [companies, setCompanies] = useState([]);
  
  // Job management states
  const [showJobForm, setShowJobForm] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  
  // Assisted hiring states
  const [showAssistedHiring, setShowAssistedHiring] = useState(false);
  const [selectedJobForService, setSelectedJobForService] = useState(null);

  const statusOptions = ['Applied', 'Shortlisted', 'Selected', 'Interviewed', 'Hired', 'Rejected'];
  const jobTypes = ['Full-time', 'Part-time', 'Contract', 'Internship', 'Remote'];
  const experienceLevels = ['0-1 years', '1-3 years', '3-5 years', '5-10 years', '10+ years'];

  // Fetch companies
  const fetchCompanies = useCallback(async () => {
    try {
      const companiesRes = await apiService.getCompanies();
      const companiesData = Array.isArray(companiesRes.data) 
        ? companiesRes.data 
        : companiesRes.data?.data || [];
      setCompanies(companiesData);
      console.log('🏢 Companies loaded:', companiesData.length);
    } catch (error) {
      console.warn('❌ Could not fetch companies:', error.message);
      setCompanies([]);
    }
  }, []);

  // Handle company form success
  const handleCompanySuccess = useCallback((company, action = 'created') => {
    console.log(`✅ Company ${action}:`, company);
    setShowCompanyForm(false);
    setEditingCompany(null);
    fetchCompanies(); // Refresh companies list
    setMessage(action === 'deleted' ? 'Company deleted successfully!' : 
              action === 'created' ? 'Company created successfully!' : 
              'Company updated successfully!');
    setMessageType('success');
    setTimeout(() => {
      setMessage('');
      setMessageType('');
    }, 3000);
  }, [fetchCompanies, setMessage, setMessageType]);

  // Handle company edit
  const handleEditCompany = useCallback((company) => {
    setEditingCompany(company);
    setShowCompanyForm(true);
  }, []);

  // Handle company delete
  const handleDeleteCompany = useCallback(async (company) => {
    if (!window.confirm(`Are you sure you want to delete "${company.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await apiService.deleteCompany(company._id);
      handleCompanySuccess(null, 'deleted');
    } catch (error) {
      console.error('❌ Error deleting company:', error);
      setMessage('Error deleting company: ' + (error.response?.data?.message || error.message));
      setMessageType('error');
      setTimeout(() => {
        setMessage('');
        setMessageType('');
      }, 3000);
    }
  }, [handleCompanySuccess, setMessage, setMessageType]);

  // Fetch employer-specific data
  const fetchEmployerData = useCallback(async () => {
    setDataLoading(true);
    try {
      console.log('🔄 Fetching employer data...');
      
      // Get current user info to identify employer
      let currentUser;
      try {
        const userRes = await apiService.getCurrentUser();
        currentUser = userRes.data;
        console.log('👤 Current user:', currentUser);
      } catch (error) {
        console.warn('❌ Could not get current user:', error.message);
        currentUser = null;
      }
      
      // Try employer-specific endpoints first
      let jobsRes, applicationsRes;
      
      try {
        console.log('📋 Trying employer jobs endpoint...');
        console.log('🔑 Current token:', localStorage.getItem('token'));
        jobsRes = await apiService.getEmployerJobs();
        console.log('✅ Employer jobs response:', jobsRes);
      } catch (error) {
        console.warn('❌ Employer jobs endpoint failed:', error.message);
        console.warn('❌ Error details:', error.response?.data || error);
        console.log('📋 Trying generic jobs endpoint...');
        try {
          jobsRes = await apiService.getJobs();
          console.log('✅ Generic jobs response:', jobsRes);
          
          // Filter jobs by current user ID if available
          if (currentUser && currentUser._id) {
            const filteredJobs = jobsRes.data?.filter(job => 
              job.postedBy === currentUser._id || 
              job.postedBy?._id === currentUser._id ||
              job.employer === currentUser._id || 
              job.employerId === currentUser._id ||
              job.createdBy === currentUser._id ||
              job.userId === currentUser._id ||
              job.employerName === currentUser.name ||
              job.company === currentUser.name
            ) || [];
            
            console.log('🔍 Filtered jobs by employer ID:', {
              totalJobs: jobsRes.data?.length || 0,
              filteredJobs: filteredJobs.length,
              currentUserId: currentUser._id,
              currentUserName: currentUser.name,
              filteredJobsData: filteredJobs
            });
            
            jobsRes = { data: filteredJobs };
          }
        } catch (genericError) {
          console.error('❌ Generic jobs endpoint also failed:', genericError.message);
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
          
          // Filter applications by employer if possible
          if (currentUser && currentUser._id) {
            const filteredApplications = applicationsRes.data?.filter(app => 
              app.job?.employer === currentUser._id ||
              app.job?.employerId === currentUser._id ||
              app.job?.createdBy === currentUser._id ||
              app.job?.employerName === currentUser.name ||
              app.job?.company === currentUser.name
            ) || [];
            
            console.log('🔍 Filtered applications by employer ID:', {
              totalApplications: applicationsRes.data?.length || 0,
              filteredApplications: filteredApplications.length,
              currentUserId: currentUser._id,
              currentUserName: currentUser.name
            });
            
            applicationsRes = { data: filteredApplications };
          }
        } catch (genericError) {
          console.error('❌ Generic applications endpoint also failed:', genericError.message);
          // Set empty array if both fail
          applicationsRes = { data: [] };
        }
      }

      // Handle both direct array and response object formats
      let jobsData = [];
      let applicationsData = [];
      
      if (Array.isArray(jobsRes.data)) {
        jobsData = jobsRes.data;
      } else if (jobsRes.data && Array.isArray(jobsRes.data.data)) {
        jobsData = jobsRes.data.data;
      } else if (Array.isArray(jobsRes)) {
        jobsData = jobsRes;
      }
      
      if (Array.isArray(applicationsRes.data)) {
        applicationsData = applicationsRes.data;
      } else if (applicationsRes.data && Array.isArray(applicationsRes.data.data)) {
        applicationsData = applicationsRes.data.data;
      } else if (Array.isArray(applicationsRes)) {
        applicationsData = applicationsRes;
      }
      
      console.log('🔧 Setting jobs state:', jobsData);
      console.log('🔧 Setting applications state:', applicationsData);
      console.log('🔧 Jobs is array:', Array.isArray(jobsData));
      console.log('🔧 Applications is array:', Array.isArray(applicationsData));
      setJobs(jobsData);
      setApplications(applicationsData);
      
      console.log('📊 Final employer data:', {
        jobs: jobsData.length,
        applications: applicationsData.length,
        currentUserId: currentUser?._id,
        currentUserName: currentUser?.name,
        currentUserRole: currentUser?.role,
        jobsData: jobsData,
        applicationsData: applicationsData
      });
      
      // Debug individual job structure
      if (jobsData.length > 0) {
        console.log('🔍 Sample job structure:', jobsData[0]);
        console.log('🔍 Job title:', jobsData[0].title);
        console.log('🔍 Job company:', jobsData[0].company);
        console.log('🔍 Job postedBy:', jobsData[0].postedBy);
      }
      
      if (jobsData.length === 0 && applicationsData.length === 0) {
        setMessage('No data found. This might be normal if you haven\'t posted any jobs yet.');
        setMessageType('info');
        setTimeout(() => {
          setMessage('');
          setMessageType('');
        }, 5000);
      } else if (jobsData.length > 0) {
        setMessage(`Found ${jobsData.length} job(s) and ${applicationsData.length} application(s)!`);
        setMessageType('success');
        setTimeout(() => {
          setMessage('');
          setMessageType('');
        }, 3000);
      }
    } catch (error) {
      console.error('💥 Error fetching employer data:', error);
      setMessage('Error loading data. Please refresh the page.');
      setMessageType('error');
    } finally {
      setDataLoading(false);
    }
  }, [setMessage, setMessageType]);

  // Job CRUD handlers
  const handleJobSuccess = useCallback(async () => {
    setShowJobForm(false);
    setEditingJob(null);
    await fetchEmployerData(); // Refresh jobs data
    setMessage('Job saved successfully');
    setMessageType('success');
  }, [fetchEmployerData, setMessage, setMessageType]);

  const handleEditJob = useCallback((job) => {
    setEditingJob(job);
    setShowJobForm(true);
  }, []);

  const handleDeleteJob = useCallback(async (job) => {
    if (!window.confirm(`Are you sure you want to delete "${job.title}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await apiService.deleteJob(job._id);
      await fetchEmployerData(); // Refresh the jobs list
      setMessage('Job deleted successfully');
      setMessageType('success');
    } catch (error) {
      console.error('Error deleting job:', error);
      setMessage('Error deleting job');
      setMessageType('error');
    }
  }, [fetchEmployerData, setMessage, setMessageType]);

  // Assisted hiring handlers
  const handleAssistedHiring = useCallback((job) => {
    setSelectedJobForService(job);
    setShowAssistedHiring(true);
  }, []);

  const handleAssistedHiringClose = useCallback(() => {
    setShowAssistedHiring(false);
    setSelectedJobForService(null);
  }, []);

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
    fetchCompanies();
    
    return () => {
      dashboardHub.unregisterDashboard('EmployerDashboard');
    };
  }, [fetchEmployerData, fetchCompanies]);

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
        setJobForm({ title: '', description: '', location: '', salary: '', type: 'Full-time', companyId: '' });
        
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-lg shadow-xl border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-8">
            <div className="flex items-center space-x-6">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-2xl">E</span>
                </div>
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-400 rounded-full border-2 border-white shadow-sm"></div>
              </div>
            <div>
                <h1 className="text-5xl font-black bg-gradient-to-r from-gray-900 via-indigo-900 to-purple-900 bg-clip-text text-transparent tracking-tight">
                  Employer Dashboard
                </h1>
                <p className="mt-3 text-base text-gray-600 font-semibold tracking-wide">
                Manage your job postings and applications
              </p>
              </div>
            </div>
            <div className="flex space-x-3">
              <button 
                onClick={fetchEmployerData}
                disabled={dataLoading}
                className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-6 py-3 rounded-xl hover:from-emerald-600 hover:to-teal-700 transition-all duration-300 text-sm font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5"
              >
                {dataLoading ? '⏳ Loading...' : '🔄 Refresh'}
              </button>
        <button 
          onClick={testApiEndpoint}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-3 rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 text-sm font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
          🧪 Test API
        </button>
              <button 
                onClick={() => {
                  console.log('Current state:', { jobs, applications, dataLoading });
                  console.log('Jobs data:', jobs);
                  console.log('Jobs type:', typeof jobs);
                  console.log('Jobs is array:', Array.isArray(jobs));
                  console.log('Jobs length:', jobs?.length);
                  console.log('Applications data:', applications);
                  console.log('Applications is array:', Array.isArray(applications));
                  console.log('Active tab:', activeTab);
                  console.log('Jobs array check:', Array.isArray(jobs) && jobs.length > 0);
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
      <div className="bg-white/60 backdrop-blur-md border-b border-white/30 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', name: 'Overview', icon: '📊' },
              { id: 'jobs', name: 'My Jobs', icon: '💼' },
              { id: 'companies', name: 'Companies', icon: '🏢' },
              { id: 'applications', name: 'Applications', icon: '📋' },
              { id: 'assisted-hiring', name: 'Assisted Hiring', icon: '🎯' },
              { id: 'search', name: 'Search Candidates', icon: '🔍' },
              { id: 'post', name: 'Post Job', icon: '➕' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-5 px-8 border-b-3 font-bold text-base transition-all duration-300 rounded-t-xl ${
                  activeTab === tab.id
                    ? 'border-indigo-500 text-indigo-600 bg-white/80 shadow-lg'
                    : 'border-transparent text-gray-600 hover:text-indigo-600 hover:bg-white/40 hover:border-indigo-300'
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
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <span className="text-white text-2xl">💼</span>
                    </div>
                  </div>
                  <div className="ml-6">
                    <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Active Jobs</p>
                    <p className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-blue-900 bg-clip-text text-transparent">{(jobs?.length || 0)}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <span className="text-white text-2xl">📋</span>
                    </div>
                  </div>
                  <div className="ml-6">
                    <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Total Applications</p>
                    <p className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-emerald-900 bg-clip-text text-transparent">{(applications?.length || 0)}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <span className="text-white text-2xl">✅</span>
                    </div>
                  </div>
                  <div className="ml-6">
                    <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Hired Candidates</p>
                    <p className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-purple-900 bg-clip-text text-transparent">
                      {(applications?.filter(app => app.status === 'Hired')?.length || 0)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Applications */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20">
              <div className="px-8 py-6 border-b border-white/30">
                <h3 className="text-xl font-bold text-gray-900">Recent Applications</h3>
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
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20">
              <div className="px-8 py-6 border-b border-white/30 flex justify-between items-center">
                <h3 className="text-2xl font-black text-gray-900 tracking-tight">My Posted Jobs</h3>
                <button
                  onClick={() => setShowJobForm(true)}
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 text-sm font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  ➕ Create Job
                </button>
            </div>
            <div className="p-6">
              {console.log('🎨 Rendering jobs section - jobs:', jobs, 'length:', jobs?.length, 'isArray:', Array.isArray(jobs))}
              {Array.isArray(jobs) && jobs.length > 0 ? (
                <div className="space-y-4">
          {jobs.map((job) => (
                    <div key={job._id} className="bg-white/70 backdrop-blur-sm border border-white/40 rounded-3xl p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 hover:scale-[1.02] group">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                            <span className="text-white text-xl font-bold">💼</span>
                          </div>
                          <div>
                            <h4 className="text-xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors duration-300">
                              {job.title || 'Untitled Job'}
                            </h4>
                            <p className="text-sm font-medium text-gray-600">
                              {job.companyId?.name || job.company || job.postedBy?.name || 'Company not specified'}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="inline-flex px-3 py-1 text-xs font-bold rounded-full bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-800 border border-indigo-200">
                              {formatJobId(job._id)}
                            </span>
                          <p className="text-sm font-semibold text-gray-600 mt-2">
                            {(applications?.filter(app => app.job?._id === job._id)?.length || 0)} applications
                          </p>
                          </div>
                      </div>

                      {/* Job Preview */}
                      <div className="mb-4">
                        <p className="text-gray-700 text-sm leading-relaxed line-clamp-2">
                          {job.description ? 
                            (job.description.length > 120 ? 
                              `${job.description.substring(0, 120)}...` : 
                              job.description
                            ) : 
                            'No description provided'
                          }
                        </p>
                      </div>

                      {/* Job Details */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div className="flex items-center space-x-2 text-sm">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center">
                            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                          </div>
                          <span className="font-medium text-gray-700 truncate">
                            {job.location || 'Remote'}
                            </span>
                        </div>

                        <div className="flex items-center space-x-2 text-sm">
                          <div className="w-8 h-8 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-xl flex items-center justify-center">
                            <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                </svg>
                          </div>
                          <span className="font-medium text-gray-700 truncate">
                            {job.salary || 'Competitive'}
                              </span>
                        </div>

                        <div className="flex items-center space-x-2 text-sm">
                          <div className="w-8 h-8 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl flex items-center justify-center">
                            <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                              </svg>
                          </div>
                          <span className="font-medium text-gray-700 truncate">
                              {job.type || 'Full-time'}
                            </span>
                          </div>

                        <div className="flex items-center space-x-2 text-sm">
                          <div className="w-8 h-8 bg-gradient-to-br from-orange-100 to-red-100 rounded-xl flex items-center justify-center">
                            <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                        </div>
                          <span className="font-medium text-gray-700 truncate">
                            {job.companyId?.industry || 'Technology'}
                          </span>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <div className="flex items-center justify-between">
                        <span className={`inline-flex px-3 py-1 text-xs font-bold rounded-full ${
                          job.status === 'active' 
                            ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200' 
                            : 'bg-gradient-to-r from-gray-100 to-slate-100 text-gray-800 border border-gray-200'
                        }`}>
                          {job.status === 'active' ? '🟢 Active' : '⭕ Inactive'}
                        </span>
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => handleEditJob(job)}
                            className="text-indigo-600 hover:text-white hover:bg-indigo-600 px-3 py-2 rounded-lg transition-all duration-300 text-sm font-semibold flex items-center space-x-1"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            <span>Edit</span>
                          </button>
                          <button 
                            onClick={() => handleAssistedHiring(job)}
                            className="text-purple-600 hover:text-white hover:bg-purple-600 px-3 py-2 rounded-lg transition-all duration-300 text-sm font-semibold flex items-center space-x-1"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>Assisted Hiring</span>
                          </button>
                          <button 
                            onClick={() => handleDeleteJob(job)}
                            className="text-red-600 hover:text-white hover:bg-red-600 px-3 py-2 rounded-lg transition-all duration-300 text-sm font-semibold flex items-center space-x-1"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            <span>Delete</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">No jobs posted yet</p>
                  <button 
                    onClick={() => {
                      console.log('🔍 Manual jobs check:', jobs);
                      console.log('🔍 Jobs type:', typeof jobs);
                      console.log('🔍 Jobs is array:', Array.isArray(jobs));
                      if (jobs && jobs.length > 0) {
                        console.log('🔍 Jobs exist but not rendering - forcing re-render');
                        setJobs([...jobs]); // Force re-render
                      }
                    }}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                  >
                    🔍 Check Jobs Data
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Companies Tab */}
        {activeTab === 'companies' && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20">
            <div className="px-8 py-6 border-b border-white/30 flex justify-between items-center">
              <h3 className="text-2xl font-black text-gray-900 tracking-tight">My Companies</h3>
              <button
                onClick={() => setShowCompanyForm(true)}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-3 rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 text-sm font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                ➕ Create Company
              </button>
            </div>
            <div className="p-6">
              {Array.isArray(companies) && companies.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {companies.map((company) => (
                    <div key={company._id} className="bg-white/60 backdrop-blur-sm border border-white/30 rounded-2xl p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                      <div className="flex items-start space-x-4">
                        {/* Company Logo */}
                        <div className="flex-shrink-0">
                          {company.logo ? (
                            <img
                              src={`http://localhost:5000${company.logo}`}
                              alt={company.name}
                              className="w-16 h-16 rounded-2xl object-cover border-2 border-white/50 shadow-lg"
                            />
                          ) : (
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                              <span className="text-white text-2xl font-bold">🏢</span>
                            </div>
                          )}
                        </div>
                        
                        {/* Company Details */}
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xl font-bold text-gray-900 truncate mb-2">
                            {company.name}
                          </h4>
                          <div className="space-y-2">
                            {company.industry && (
                              <div className="flex items-center space-x-2">
                                <div className="w-6 h-6 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center">
                                  <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                  </svg>
                                </div>
                                <span className="text-sm font-medium text-gray-600">{company.industry}</span>
                              </div>
                            )}
                            {company.location && (
                              <div className="flex items-center space-x-2">
                                <div className="w-6 h-6 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-lg flex items-center justify-center">
                                  <svg className="w-3 h-3 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                  </svg>
                                </div>
                                <span className="text-sm font-medium text-gray-600">{company.location}</span>
                              </div>
                            )}
                            {company.size && (
                              <div className="flex items-center space-x-2">
                                <div className="w-6 h-6 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg flex items-center justify-center">
                                  <svg className="w-3 h-3 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                                  </svg>
                                </div>
                                <span className="text-sm font-medium text-gray-600">{company.size} employees</span>
                              </div>
                            )}
                          </div>
                          {company.description && (
                            <p className="text-sm text-gray-600 mt-3 line-clamp-2 leading-relaxed">
                              {company.description}
                            </p>
                          )}
                          <div className="mt-4 flex space-x-2">
                            <span className="inline-flex px-3 py-1 text-xs font-bold rounded-full bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-800 border border-indigo-200">
                              {company.companyId}
                            </span>
                            {company.isActive && (
                              <span className="inline-flex px-3 py-1 text-xs font-bold rounded-full bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200">
                                🟢 Active
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex-shrink-0 flex space-x-2">
                          <button
                            onClick={() => handleEditCompany(company)}
                            className="p-3 text-indigo-600 hover:text-white hover:bg-indigo-600 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                            title="Edit Company"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeleteCompany(company)}
                            className="p-3 text-red-600 hover:text-white hover:bg-red-600 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                            title="Delete Company"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🏢</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Companies Yet</h3>
                  <p className="text-gray-500 mb-6">Create your first company profile to get started</p>
                  <button
                    onClick={() => setShowCompanyForm(true)}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
                  >
                    Create Your First Company
                  </button>
                </div>
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
                      className="w-full px-4 py-3 border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white/50 backdrop-blur-sm transition-all duration-300"
                    />
                  </div>

                  {/* Filters */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-800 mb-3 tracking-wide">
                        Location
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Bangalore, Mumbai"
                        value={searchFilters.location}
                        onChange={(e) => setSearchFilters({...searchFilters, location: e.target.value})}
                        className="w-full px-4 py-3 border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white/50 backdrop-blur-sm transition-all duration-300"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-800 mb-3 tracking-wide">
                        Experience Level
                      </label>
                      <select
                        value={searchFilters.experience}
                        onChange={(e) => setSearchFilters({...searchFilters, experience: e.target.value})}
                        className="w-full px-4 py-3 border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white/50 backdrop-blur-sm transition-all duration-300"
                      >
                        <option value="">Any Experience</option>
                        {experienceLevels.map((level) => (
                          <option key={level} value={level}>{level}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-800 mb-3 tracking-wide">
                        Expected Salary
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 8-12 LPA"
                        value={searchFilters.salary}
                        onChange={(e) => setSearchFilters({...searchFilters, salary: e.target.value})}
                        className="w-full px-4 py-3 border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white/50 backdrop-blur-sm transition-all duration-300"
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
                      className="w-full px-4 py-3 border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white/50 backdrop-blur-sm transition-all duration-300"
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

        {/* Assisted Hiring Tab */}
        {activeTab === 'assisted-hiring' && (
          <div className="space-y-6">
            <AssistedHiringServices />
          </div>
        )}

        {/* Post Job Tab */}
        {activeTab === 'post' && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20">
            <div className="px-8 py-6 border-b border-white/30">
              <h3 className="text-2xl font-black text-gray-900 tracking-tight">Post a New Job</h3>
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
                      className="w-full px-4 py-3 border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white/50 backdrop-blur-sm transition-all duration-300"
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
                      className="w-full px-4 py-3 border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white/50 backdrop-blur-sm transition-all duration-300"
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
                      className="w-full px-4 py-3 border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white/50 backdrop-blur-sm transition-all duration-300"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Job Type
                    </label>
                    <select
                      value={jobForm.type}
                      onChange={(e) => setJobForm({ ...jobForm, type: e.target.value })}
                      className="w-full px-4 py-3 border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white/50 backdrop-blur-sm transition-all duration-300"
                    >
                      {jobTypes.map((type) => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Company Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company *
                  </label>
                  <select
                    value={jobForm.companyId}
                    onChange={(e) => setJobForm({ ...jobForm, companyId: e.target.value })}
                      className="w-full px-4 py-3 border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white/50 backdrop-blur-sm transition-all duration-300"
                    required
                  >
                    <option value="">Select a company</option>
                    {Array.isArray(companies) && companies.map((company) => (
                      <option key={company._id} value={company._id}>
                        {company.name}
                      </option>
                    ))}
                  </select>
                  {Array.isArray(companies) && companies.length === 0 && (
                    <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                      <p className="text-sm text-yellow-800">
                        No companies found. 
                        <button
                          type="button"
                          onClick={() => setActiveTab('companies')}
                          className="ml-1 text-yellow-900 underline hover:text-yellow-700"
                        >
                          Create a company first
                        </button>
                      </p>
                    </div>
                  )}
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
                      className="w-full px-4 py-3 border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white/50 backdrop-blur-sm transition-all duration-300"
                    required
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-8 py-4 rounded-xl hover:from-indigo-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-semibold"
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

      {/* Company Form Modal */}
      {showCompanyForm && (
        <CompanyEditForm
          company={editingCompany}
          mode={editingCompany ? 'edit' : 'create'}
          onSuccess={handleCompanySuccess}
          onCancel={() => {
            setShowCompanyForm(false);
            setEditingCompany(null);
          }}
        />
      )}

      {/* Job Form Modal */}
      {showJobForm && (
        <JobEditForm
          job={editingJob}
          mode={editingJob ? 'edit' : 'create'}
          onSuccess={handleJobSuccess}
          onCancel={() => {
            setShowJobForm(false);
            setEditingJob(null);
          }}
        />
      )}

      {/* Assisted Hiring Service Modal */}
      {showAssistedHiring && selectedJobForService && (
        <AssistedHiringService
          job={selectedJobForService}
          onClose={handleAssistedHiringClose}
        />
      )}
    </div>
  );
}


