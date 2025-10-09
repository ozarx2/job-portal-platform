import { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import SimpleJobApplicationForm from '../components/SimpleJobApplicationForm';
import IndividualDocumentUpload from '../components/onboarding/IndividualDocumentUpload';
import ProfileImageUpload from '../components/ProfileImageUpload';
import { formatJobId } from '../utils/jobIdGenerator';
import onboardingService from '../services/onboardingService';

export default function CandidateDashboard() {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [selectedJobs, setSelectedJobs] = useState([]);
  const [profile, setProfile] = useState(() => ({
    name: '',
    email: '',
    phone: '',
    location: '',
    experience: '',
    education: '',
    skills: [],
    bio: '',
    website: '',
    linkedin: '',
    github: '',
  }));
  const [profileImage, setProfileImage] = useState(null);
  const [resumeFile, setResumeFile] = useState(null);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  
  // Loading states
  const [loading, setLoading] = useState(() => ({
    jobs: false,
    applications: false,
    profile: false,
    selectedJobs: false,
    submitting: false,
    profileStatus: false
  }));
  
  const [profileStatus, setProfileStatus] = useState({
    isComplete: false,
    missingFields: [],
    completionPercentage: 0
  });
  
  // Application form state
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  
  // Error handling states
  const [retryCount, setRetryCount] = useState(() => ({
    jobs: 0,
    applications: 0,
    profile: 0,
    selectedJobs: 0
  }));
  
  // Form validation states
  const [validationErrors, setValidationErrors] = useState(() => ({}));
  
  // Welcome message states
  const [showWelcomeMessage, setShowWelcomeMessage] = useState(false);
  const [assignedJob, setAssignedJob] = useState(null);
  
  // Check if candidate has selected/hired applications
  const hasSelectedOrHiredApplications = applications.some(app => 
    app.status === 'Selected' || app.status === 'Hired' || app.status === 'Onboarding'
  );
  const [isNewUser, setIsNewUser] = useState(false);
  
  // Ref to track current object URL for cleanup
  const currentImageUrl = useRef(null);

  // Onboarding documents state
  const [onboardingData, setOnboardingData] = useState(() => ({
    selectedJobId: '',
    documents: {
      aadharCard: null,
      panCard: null,
      resume: null,
      marklist: null,
      bankPassbook: null,
      passportPhoto: null
    },
    personalInfo: {
      fullName: '',
      dateOfBirth: '',
      address: '',
      emergencyContact: '',
      bloodGroup: ''
    }
  }));

  const token = localStorage.getItem('token');

  // Helper function to safely get skills as array
  const getSkillsAsArray = (skills) => {
    if (!skills) return [];
    if (Array.isArray(skills)) return skills;
    if (typeof skills === 'string') {
      return skills.split(',').map(s => s.trim()).filter(s => s.length > 0);
    }
    return [];
  };

  // Helper function to safely join skills
  const joinSkills = (skills) => {
    const skillsArray = getSkillsAsArray(skills);
    return skillsArray.join(', ');
  };

  useEffect(() => {
    fetchJobs();
    fetchApplications();
    fetchProfile();
    fetchSelectedJobs();
    fetchProfileStatus();
    
    // Handle welcome message from navigation state
    if (location.state?.welcomeMessage) {
      setShowWelcomeMessage(true);
      setAssignedJob(location.state.jobDetails);
      setIsNewUser(location.state.isNewUser);
    }
    
    // Check for assigned job in localStorage (for pre-users)
    const assignedJobData = localStorage.getItem('assignedJob');
    if (assignedJobData && !location.state?.welcomeMessage) {
      const jobData = JSON.parse(assignedJobData);
      setAssignedJob(jobData);
    }
  }, [location.state]);

  // Cleanup object URL on unmount or image change
  useEffect(() => {
    return () => {
      if (currentImageUrl.current) {
        URL.revokeObjectURL(currentImageUrl.current);
      }
    };
  }, []);

  // Cleanup object URL when profile image changes
  useEffect(() => {
    if (profileImage && profileImage instanceof File) {
      getImageUrl(profileImage);
    } else if (!profileImage) {
      // Clean up object URL when image is removed
      if (currentImageUrl.current) {
        URL.revokeObjectURL(currentImageUrl.current);
        currentImageUrl.current = null;
      }
    }
  }, [profileImage]);

  // Helper function to safely create object URL
  const getImageUrl = (imageFile) => {
    if (!imageFile) {
      return null;
    }
    
    // If it's already a URL string, return it (handle both relative and absolute URLs)
    if (typeof imageFile === 'string') {
      // If it's a relative URL, make it absolute
      if (imageFile.startsWith('/uploads/')) {
        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://ec2-15-134-104-170.ap-southeast-2.compute.amazonaws.com';
        return `${API_BASE_URL}${imageFile}`;
      }
      return imageFile;
    }
    
    // If it's not a File object, return null
    if (!(imageFile instanceof File)) {
      return null;
    }
    
    // Clean up previous URL
    if (currentImageUrl.current) {
      URL.revokeObjectURL(currentImageUrl.current);
    }
    
    // Create new URL
    try {
      const url = URL.createObjectURL(imageFile);
      currentImageUrl.current = url;
      return url;
    } catch (error) {
      console.error('Error creating object URL:', error);
      return null;
    }
  };

  const fetchJobs = async () => {
    setLoading(prev => ({ ...prev, jobs: true }));
    try {
      console.log('🔄 Fetching jobs for candidate...');
      const res = await axios.get(`http://ec2-15-134-104-170.ap-southeast-2.compute.amazonaws.com/api/jobs?t=${Date.now()}`, {
        timeout: 30000 // 30 second timeout for heavy operations
      });
      console.log('📦 Jobs API response:', res.data);
      
      // Handle both response formats: direct array or {data: array}
      let jobsArray = [];
      if (Array.isArray(res.data)) {
        jobsArray = res.data;
      } else if (res.data && Array.isArray(res.data.data)) {
        jobsArray = res.data.data;
      } else {
        console.warn('⚠️ Unexpected jobs response format:', res.data);
      }
      
      console.log('✅ Jobs loaded successfully:', jobsArray.length, 'jobs');
      setJobs(jobsArray);
      setRetryCount(prev => ({ ...prev, jobs: 0 })); // Reset retry count on success
    } catch (err) {
      console.error('❌ Error fetching jobs:', err.message);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch jobs';
      setMessage(`${errorMessage}. ${retryCount.jobs < 3 ? 'Retrying...' : 'Please check your connection and try again.'}`);
      setMessageType('error');
      
      if (retryCount.jobs < 3) {
        retryFetch(fetchJobs, 'jobs');
      }
    } finally {
      setLoading(prev => ({ ...prev, jobs: false }));
    }
  };

  const fetchApplications = async () => {
    setLoading(prev => ({ ...prev, applications: true }));
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://ec2-15-134-104-170.ap-southeast-2.compute.amazonaws.com/api';
      const res = await axios.get(`${API_BASE_URL}/applications/me?t=${Date.now()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('Applications API Response:', res.data);
      const applicationsArray = Array.isArray(res.data) ? res.data : [];
      console.log('Applications array length:', applicationsArray.length);
      applicationsArray.forEach((app, index) => {
        console.log(`Application ${index + 1}:`, {
          id: app._id,
          status: app.status,
          jobTitle: app.job?.title,
          candidate: app.candidate
        });
      });
      setApplications(applicationsArray);
    } catch (error) {
      console.error('Error fetching applications:', error);
      setMessage('Failed to fetch applications. Please try again.');
      setMessageType('error');
    } finally {
      setLoading(prev => ({ ...prev, applications: false }));
    }
  };

  const fetchProfile = async () => {
    setLoading(prev => ({ ...prev, profile: true }));
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://ec2-15-134-104-170.ap-southeast-2.compute.amazonaws.com/api';
      const res = await axios.get(`${API_BASE_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const userData = res.data.user || {};
      setProfile(userData);
      setProfileImage(userData.profileImage || null);
    } catch (error) {
      console.error('Error fetching profile:', error);
      setMessage('Failed to fetch profile. Please try again.');
      setMessageType('error');
    } finally {
      setLoading(prev => ({ ...prev, profile: false }));
    }
  };

  const fetchSelectedJobs = async () => {
    setLoading(prev => ({ ...prev, selectedJobs: true }));
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://ec2-15-134-104-170.ap-southeast-2.compute.amazonaws.com/api';
      const res = await axios.get(`${API_BASE_URL}/applications/selected?t=${Date.now()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSelectedJobs(res.data.selectedJobs || []);
    } catch (error) {
      console.error('Error fetching selected jobs:', error);
      setMessage('Failed to fetch selected jobs. Please try again.');
      setMessageType('error');
    } finally {
      setLoading(prev => ({ ...prev, selectedJobs: false }));
    }
  };

  const fetchProfileStatus = async () => {
    setLoading(prev => ({ ...prev, profileStatus: true }));
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://ec2-15-134-104-170.ap-southeast-2.compute.amazonaws.com/api';
      console.log('Fetching profile status from:', `${API_BASE_URL}/applications/profile-status`);
      const res = await axios.get(`${API_BASE_URL}/applications/profile-status?t=${Date.now()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('Profile status response:', res.data);
      setProfileStatus(res.data);
    } catch (error) {
      console.error('Error fetching profile status:', error);
      // Set default values if API fails
      setProfileStatus({
        isComplete: false,
        missingFields: [],
        completionPercentage: 0
      });
    } finally {
      setLoading(prev => ({ ...prev, profileStatus: false }));
    }
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    
    // Handle skills field specially - convert comma-separated string to array
    if (name === 'skills') {
      const skillsArray = value ? value.split(',').map(s => s.trim()).filter(s => s.length > 0) : [];
      setProfile({ ...profile, [name]: skillsArray });
    } else if (name === 'experience') {
      // Handle experience as number
      const numValue = value === '' ? '' : parseInt(value);
      setProfile({ ...profile, [name]: numValue });
    } else {
      setProfile({ ...profile, [name]: value });
    }
  };

  const handleProfileImageUpdate = (image) => {
    setProfileImage(image);
  };

  const handleResumeUpload = (e) => {
    setResumeFile(e.target.files[0]);
  };


  const updateProfile = async (e) => {
    e.preventDefault();
    
    // Validate form data
    const errors = validateProfile(profile);
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      setMessage('Please fix the errors below');
      setMessageType('error');
      return;
    }
    
    setValidationErrors({});
    setLoading(prev => ({ ...prev, submitting: true }));
    
    try {
      const formData = new FormData();
      formData.append('name', profile.name.trim());
      formData.append('email', profile.email.trim());
      if (profile.phone) formData.append('phone', profile.phone.trim());
      if (profile.location) formData.append('location', profile.location.trim());
      if (profile.experience !== undefined && profile.experience !== null && profile.experience !== '') {
        formData.append('experience', profile.experience);
      }
      if (profile.education) formData.append('education', profile.education.trim());
      const skillsArray = getSkillsAsArray(profile.skills);
      if (skillsArray.length > 0) formData.append('skills', skillsArray.join(', '));
      if (profile.bio) formData.append('bio', profile.bio.trim());
      if (profile.website) formData.append('website', profile.website.trim());
      if (profile.linkedin) formData.append('linkedin', profile.linkedin.trim());
      if (profile.github) formData.append('github', profile.github.trim());
      // Note: Profile image is handled separately by ProfileImageUpload component

      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://ec2-15-134-104-170.ap-southeast-2.compute.amazonaws.com/api';
      await axios.put(`${API_BASE_URL}/users/profile?t=${Date.now()}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
        timeout: 15000 // 15 second timeout for file upload
      });

      setMessage('Profile updated successfully!');
      setMessageType('success');
      setValidationErrors({});
      // Refresh profile status after successful update
      fetchProfileStatus();
    } catch (error) {
      console.error('Profile update error:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      let errorMessage = 'Failed to update profile';
      
      if (error.response?.status === 500) {
        errorMessage = 'Server error occurred. Please try again or contact support.';
      } else if (error.response?.status === 413) {
        errorMessage = 'File size too large. Please select a smaller image.';
      } else if (error.response?.status === 400) {
        errorMessage = error.response?.data?.message || 'Invalid data provided. Please check your inputs.';
      } else if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        errorMessage = 'Request timed out. Please try again.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setMessage(errorMessage);
      setMessageType('error');
    } finally {
      setLoading(prev => ({ ...prev, submitting: false }));
    }
  };

  const uploadResume = async () => {
    if (!resumeFile) {
      setMessage('Please select a resume file');
      setMessageType('error');
      return;
    }
    
    setLoading(prev => ({ ...prev, submitting: true }));
    try {
      const formData = new FormData();
      formData.append('resume', resumeFile);

      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://ec2-15-134-104-170.ap-southeast-2.compute.amazonaws.com/api';
      await axios.post(`${API_BASE_URL}/users/resume`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      setMessage('Resume uploaded successfully!');
      setMessageType('success');
      setResumeFile(null);
    } catch (error) {
      setMessage('Failed to upload resume. Please try again.');
      setMessageType('error');
    } finally {
      setLoading(prev => ({ ...prev, submitting: false }));
    }
  };

  const applyJob = (job) => {
    console.log('Profile Status:', profileStatus);
    
    // Check if user is a candidate
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      if (user.role !== 'candidate') {
        setMessage(`Only candidates can apply for jobs. Your current role is: ${user.role}`);
        setMessageType('error');
        return;
      }
    }
    
    // Check if profile is complete before showing application form
    if (!profileStatus.isComplete && profileStatus.missingFields && profileStatus.missingFields.length > 0) {
      setMessage(`Please complete your profile before applying for jobs. This helps employers find you more easily. Missing: ${profileStatus.missingFields.join(', ')}`);
      setMessageType('warning');
      setActiveTab('profile');
      return;
    }
    
    // Show application form
    console.log('Showing application form for job:', job);
    setSelectedJob(job);
    setShowApplicationForm(true);
  };

  const handleApplicationSuccess = (response) => {
    setMessage('Application submitted successfully!');
    setMessageType('success');
    setShowApplicationForm(false);
    setSelectedJob(null);
    fetchApplications();
  };

  const handleApplicationClose = () => {
    setShowApplicationForm(false);
    setSelectedJob(null);
  };

  const handleStartOnboarding = async (application) => {
    try {
      setLoading(prev => ({ ...prev, submitting: true }));
      
      console.log('Starting onboarding for application:', {
        applicationId: application._id,
        applicationStatus: application.status,
        applicationData: application
      });
      
      // Start onboarding process
      const result = await onboardingService.startOnboarding(application._id, {
        startDate: new Date(),
        assignedHR: null, // Will be assigned by system
        assignedManager: null // Will be assigned by system
      });
      
      setMessage('Onboarding process started successfully!');
      setMessageType('success');
      
      // Switch to onboarding tab to show the new process
      setActiveTab('onboarding');
      
      // Refresh applications to update status
      fetchApplications();
      
    } catch (error) {
      console.error('Error starting onboarding:', error);
      const errorMessage = error.response?.data?.message || 'Failed to start onboarding process';
      setMessage(errorMessage);
      setMessageType('error');
    } finally {
      setLoading(prev => ({ ...prev, submitting: false }));
    }
  };

  // Onboarding functions
  const handleOnboardingChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setOnboardingData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setOnboardingData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleDocumentUpload = (documentType, file) => {
    setOnboardingData(prev => ({
      ...prev,
      documents: {
        ...prev.documents,
        [documentType]: file
      }
    }));
  };

  const submitOnboarding = async (e) => {
    e.preventDefault();
    
    // Validate onboarding data
    const errors = validateOnboarding(onboardingData);
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      setMessage('Please fix the errors below');
      setMessageType('error');
      return;
    }
    
    setValidationErrors({});
    setLoading(prev => ({ ...prev, submitting: true }));
    
    try {
      const formData = new FormData();
      formData.append('selectedJobId', onboardingData.selectedJobId);
      formData.append('personalInfo', JSON.stringify(onboardingData.personalInfo));
      
      // Append all documents
      Object.entries(onboardingData.documents).forEach(([key, file]) => {
        if (file) {
          formData.append(key, file);
        }
      });

      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://ec2-15-134-104-170.ap-southeast-2.compute.amazonaws.com/api';
      await axios.post(`${API_BASE_URL}/users/onboarding/submit`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
        timeout: 30000 // 30 second timeout for large file uploads
      });

      setMessage('Onboarding documents submitted successfully!');
      setMessageType('success');
      
      // Reset form
      setOnboardingData({
        selectedJobId: '',
        documents: {
          aadharCard: null,
          panCard: null,
          resume: null,
          marklist: null,
          bankPassbook: null,
          passportPhoto: null
        },
        personalInfo: {
          fullName: '',
          dateOfBirth: '',
          address: '',
          emergencyContact: '',
          bloodGroup: ''
        }
      });
      setValidationErrors({});
    } catch (error) {
      console.error('Onboarding submission error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to submit onboarding documents';
      setMessage(errorMessage);
      setMessageType('error');
    } finally {
      setLoading(prev => ({ ...prev, submitting: false }));
    }
  };

  const clearMessage = () => {
    setMessage('');
    setMessageType('');
  };

  // Validation functions
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone) => {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  };

  const validateProfile = (profileData) => {
    const errors = {};
    
    if (!profileData.name || profileData.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters long';
    }
    
    if (!profileData.email || !validateEmail(profileData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (profileData.phone && !validatePhone(profileData.phone)) {
      errors.phone = 'Please enter a valid phone number';
    }
    
    return errors;
  };

  const validateOnboarding = (onboardingData) => {
    const errors = {};
    
    if (!onboardingData.selectedJobId) {
      errors.selectedJobId = 'Please select a job';
    }
    
    if (!onboardingData.personalInfo.fullName || onboardingData.personalInfo.fullName.trim().length < 2) {
      errors.fullName = 'Full name is required';
    }
    
    if (!onboardingData.personalInfo.dateOfBirth) {
      errors.dateOfBirth = 'Date of birth is required';
    } else {
      const birthDate = new Date(onboardingData.personalInfo.dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      if (age < 18) {
        errors.dateOfBirth = 'You must be at least 18 years old';
      }
    }
    
    if (!onboardingData.personalInfo.address || onboardingData.personalInfo.address.trim().length < 10) {
      errors.address = 'Address must be at least 10 characters long';
    }
    
    if (!onboardingData.personalInfo.emergencyContact || !validatePhone(onboardingData.personalInfo.emergencyContact)) {
      errors.emergencyContact = 'Please enter a valid emergency contact number';
    }
    
    if (!onboardingData.personalInfo.bloodGroup) {
      errors.bloodGroup = 'Please select your blood group';
    }
    
    // Check required documents
    const requiredDocs = ['aadharCard', 'panCard', 'resume', 'marklist', 'bankPassbook', 'passportPhoto'];
    const missingDocs = requiredDocs.filter(doc => !onboardingData.documents[doc]);
    if (missingDocs.length > 0) {
      errors.documents = `Please upload: ${missingDocs.join(', ')}`;
    }
    
    return errors;
  };

  // Retry functions
  const retryFetch = async (fetchFunction, key) => {
    const maxRetries = 3;
    if (retryCount[key] < maxRetries) {
      setRetryCount(prev => ({ ...prev, [key]: prev[key] + 1 }));
      setTimeout(() => {
        fetchFunction();
      }, 1000 * (retryCount[key] + 1)); // Exponential backoff
    }
  };

  // Helper functions
  const filteredJobs = Array.isArray(jobs) ? jobs.filter(job => 
    job?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job?.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job?.location?.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];
  
  // Debug logging (only when jobs change)
  // console.log('🔍 Jobs state:', jobs);
  // console.log('🔍 Jobs length:', jobs?.length);
  // console.log('🔍 Filtered jobs:', filteredJobs);
  // console.log('🔍 Filtered jobs length:', filteredJobs?.length);

  const filteredApplications = Array.isArray(applications) ? applications.filter(app => 
    filterStatus === 'all' || app?.status === filterStatus
  ) : [];

  // Loading spinner component
  const LoadingSpinner = ({ size = 'w-6 h-6' }) => (
    <div className={`animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 ${size}`}></div>
  );

  // Skeleton loader for cards
  const SkeletonCard = () => (
    <div className="bg-white p-6 rounded-lg shadow-sm border animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
      <div className="h-3 bg-gray-200 rounded w-1/2 mb-3"></div>
      <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
      <div className="h-3 bg-gray-200 rounded w-2/3 mb-4"></div>
      <div className="h-10 bg-gray-200 rounded"></div>
    </div>
  );

  return (
    <>
      <style jsx="true">{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-in {
          animation: slideIn 0.3s ease-out;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
      <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-8">
            <div className="transform transition-transform duration-300 hover:scale-105">
              <h1 className="text-4xl font-bold text-white mb-2">Candidate Dashboard</h1>
              <p className="text-blue-100 text-lg">
                Welcome back, <span className="font-semibold">{profile.name || 'Candidate'}</span>
              </p>
            </div>
            <div className="flex items-center space-x-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-3 text-center">
                <div className="text-2xl font-bold text-white">{applications?.length || 0}</div>
                <div className="text-sm text-blue-100">Applications</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-3 text-center">
                <div className="text-2xl font-bold text-white">{selectedJobs?.length || 0}</div>
                <div className="text-sm text-blue-100">Selected</div>
              </div>
              {profileImage && (
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/20">
                  <img 
                    src={getImageUrl(profileImage)} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.warn('Failed to load profile image');
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
              )}
              <button
                onClick={() => { localStorage.removeItem('token'); localStorage.removeItem('user'); window.location.href = '/login'; }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation */}
        <nav className="flex flex-wrap gap-3 mb-8">
          <button 
            onClick={() => setActiveTab('dashboard')} 
            className={`px-6 py-3 rounded-xl text-sm font-medium transition-all duration-300 transform hover:scale-105 ${
              activeTab === 'dashboard' 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25' 
                : 'bg-white text-gray-700 hover:bg-blue-50 hover:text-blue-600 border border-gray-200 hover:border-blue-300 shadow-sm'
            }`}
          >
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6a2 2 0 01-2 2H10a2 2 0 01-2-2V5z" />
              </svg>
              <span>Dashboard</span>
            </div>
          </button>
          <button 
            onClick={() => setActiveTab('jobs')} 
            className={`px-6 py-3 rounded-xl text-sm font-medium transition-all duration-300 transform hover:scale-105 ${
              activeTab === 'jobs' 
                ? 'bg-green-600 text-white shadow-lg shadow-green-600/25' 
                : 'bg-white text-gray-700 hover:bg-green-50 hover:text-green-600 border border-gray-200 hover:border-green-300 shadow-sm'
            }`}
          >
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0H8m8 0v2a2 2 0 01-2 2H10a2 2 0 01-2-2V6m8 0H8" />
              </svg>
              <span>Available Jobs</span>
            </div>
          </button>
          <button 
            onClick={() => setActiveTab('applications')} 
            className={`px-6 py-3 rounded-xl text-sm font-medium transition-all duration-300 transform hover:scale-105 ${
              activeTab === 'applications' 
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/25' 
                : 'bg-white text-gray-700 hover:bg-purple-50 hover:text-purple-600 border border-gray-200 hover:border-purple-300 shadow-sm'
            }`}
          >
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>My Applications</span>
            </div>
          </button>
          {hasSelectedOrHiredApplications && (
            <button 
              onClick={() => setActiveTab('onboarding')} 
              className={`px-6 py-3 rounded-xl text-sm font-medium transition-all duration-300 transform hover:scale-105 ${
                activeTab === 'onboarding' 
                  ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/25' 
                  : 'bg-white text-gray-700 hover:bg-orange-50 hover:text-orange-600 border border-gray-200 hover:border-orange-300 shadow-sm'
              }`}
            >
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <span>Onboarding</span>
                <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">
                  {applications.filter(app => 
                    app.status === 'Selected' || app.status === 'Hired' || app.status === 'Onboarding'
                  ).length}
                </span>
              </div>
            </button>
          )}
          <button 
            onClick={() => setActiveTab('profile')} 
            className={`px-6 py-3 rounded-xl text-sm font-medium transition-all duration-300 transform hover:scale-105 ${
              activeTab === 'profile' 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25' 
                : 'bg-white text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 border border-gray-200 hover:border-indigo-300 shadow-sm'
            }`}
          >
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>Profile</span>
            </div>
          </button>
        </nav>

        {/* Message Display */}
        {message && (
          <div className={`mb-6 p-4 rounded-xl border-l-4 shadow-sm animate-slide-in ${
            messageType === 'success' 
              ? 'bg-green-50 border-green-400 text-green-800' 
              : 'bg-red-50 border-red-400 text-red-800'
          }`}>
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-3 flex-1">
                {messageType === 'success' ? (
                  <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                )}
                <span className="font-medium">{message}</span>
              </div>
              <div className="flex items-center space-x-2">
                {messageType === 'error' && (retryCount.jobs > 0 || retryCount.applications > 0 || retryCount.profile > 0 || retryCount.selectedJobs > 0) && (
                  <button
                    onClick={() => {
                      if (retryCount.jobs > 0) fetchJobs();
                      if (retryCount.applications > 0) fetchApplications();
                      if (retryCount.profile > 0) fetchProfile();
                      if (retryCount.selectedJobs > 0) fetchSelectedJobs();
                    }}
                    className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors duration-200"
                  >
                    Retry
                  </button>
                )}
                <button 
                  onClick={clearMessage}
                  className="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-1 rounded-full hover:bg-gray-100"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Profile Completion Banner */}
        {!profileStatus.isComplete && profileStatus.missingFields.length > 0 && (
          <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-400 p-6 rounded-xl shadow-lg">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4 flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-blue-900">
                    🚀 Complete Your Profile for Better Job Matches
                  </h3>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600">{profileStatus.completionPercentage}%</div>
                    <div className="text-xs text-blue-600">Complete</div>
                  </div>
                </div>
                <div className="mt-3">
                  <div className="w-full bg-blue-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-500" 
                      style={{ width: `${profileStatus.completionPercentage}%` }}
                    ></div>
                  </div>
                </div>
                <div className="mt-4 text-sm text-blue-800">
                  <p className="font-medium mb-2">Complete your profile to:</p>
                  <ul className="space-y-1 text-sm">
                    <li className="flex items-center">
                      <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Apply for jobs more easily
                    </li>
                    <li className="flex items-center">
                      <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Get noticed by more employers
                    </li>
                    <li className="flex items-center">
                      <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Increase your chances of getting hired
                    </li>
                  </ul>
                </div>
                <div className="mt-4">
                  <p className="text-sm font-medium text-blue-800 mb-2">Still need to add:</p>
                  <div className="flex flex-wrap gap-2">
                    {profileStatus.missingFields.map((field, index) => (
                      <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {field}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="mt-4 flex space-x-3">
                  <button
                    onClick={() => setActiveTab('profile')}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors duration-200 flex items-center"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Complete Profile Now
                  </button>
                  <button
                    onClick={() => setActiveTab('jobs')}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors duration-200"
                  >
                    Browse Jobs Anyway →
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            {/* Welcome Message for Converted Users */}
            {showWelcomeMessage && assignedJob && (
              <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl p-6 shadow-lg">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-green-800 mb-2">
                      🎉 Welcome! You've been pre-selected for a job opportunity!
                    </h3>
                    <div className="bg-white rounded-lg p-4 mb-4 border border-green-200">
                      <h4 className="font-semibold text-gray-900 mb-2">{assignedJob.jobTitle}</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-700">Company:</span>
                          <p className="text-gray-900">{assignedJob.companyName}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Location:</span>
                          <p className="text-gray-900">{assignedJob.location}</p>
                        </div>
                        {assignedJob.salary && (
                          <div>
                            <span className="font-medium text-gray-700">Salary:</span>
                            <p className="text-gray-900">{assignedJob.salary}</p>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          ✓ Auto-Applied
                        </span>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          📧 Welcome Email Sent
                        </span>
                      </div>
                      <button
                        onClick={() => setShowWelcomeMessage(false)}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {loading.applications || loading.selectedJobs || loading.jobs ? (
                <>
                  <SkeletonCard />
                  <SkeletonCard />
                  <SkeletonCard />
                </>
              ) : (
                <>
                  <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Applications</h3>
                        <p className="text-4xl font-bold text-blue-600">{applications?.length || 0}</p>
                      </div>
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center text-sm text-gray-600">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                      Active applications
                    </div>
                  </div>
                  
                  <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Selected Jobs</h3>
                        <p className="text-4xl font-bold text-green-600">{selectedJobs?.length || 0}</p>
                      </div>
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center text-sm text-gray-600">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                      Ready for onboarding
                    </div>
                  </div>
                  
                  <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Available Jobs</h3>
                        <p className="text-4xl font-bold text-purple-600">{jobs?.length || 0}</p>
                      </div>
                      <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0H8m8 0v2a2 2 0 01-2 2H10a2 2 0 01-2-2V6m8 0H8" />
                        </svg>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center text-sm text-gray-600">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                      Open positions
                    </div>
                  </div>
                </>
              )}
            </div>

            {(selectedJobs?.length || 0) > 0 && (
              <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                  <svg className="w-6 h-6 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Selected for Onboarding
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(selectedJobs || []).map((job) => (
                    <div key={job?._id || Math.random()} className="flex justify-between items-center p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200 transform transition-all duration-300 hover:scale-105 hover:shadow-md">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-semibold text-gray-900 text-lg">{job?.title || 'N/A'}</h4>
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                            {formatJobId(job?._id)}
                          </span>
                        </div>
                        <p className="text-gray-600 mb-2">{job?.company || 'N/A'}</p>
                        <p className="text-sm text-gray-500">{job?.location || 'N/A'}</p>
                      </div>
                      <div className="flex flex-col items-end">
                        {(() => {
                          const application = applications.find(app => app.job?._id === job._id);
                          if (application?.status === 'Hired') {
                            return (
                              <span className="px-4 py-2 bg-green-100 text-green-800 text-sm font-medium rounded-full mb-2">
                                Hired
                              </span>
                            );
                          } else {
                            return (
                              <span className="px-4 py-2 bg-blue-100 text-blue-800 text-sm font-medium rounded-full mb-2">
                                Selected
                              </span>
                            );
                          }
                        })()}
                         {(() => {
                           const application = applications.find(app => app.job?._id === job._id);
                           console.log('Dashboard - Job:', job._id, 'Application found:', application);
                           console.log('Dashboard - Status check:', {
                             jobId: job._id,
                             applicationStatus: application?.status,
                             isHired: application?.status === 'Hired',
                             isSelected: application?.status === 'Selected'
                           });
                           if (application?.status === 'Hired') {
                             return (
                               <button 
                                 onClick={() => handleStartOnboarding(application)}
                                 disabled={loading.submitting}
                                 className={`text-xs font-medium ${
                                   loading.submitting 
                                     ? 'text-gray-400 cursor-not-allowed' 
                                     : 'text-green-600 hover:text-green-800'
                                 }`}
                               >
                                 {loading.submitting ? 'Starting...' : 'Start Onboarding →'}
                               </button>
                             );
                           } else if (application?.status === 'Selected') {
                             return (
                               <span className="text-xs text-blue-600 font-medium">
                                 Selected - Awaiting Final Decision
                               </span>
                             );
                           } else {
                             return (
                               <span className="text-xs text-gray-500">
                                 Status: {application?.status || 'No application found'}
                               </span>
                             );
                           }
                         })()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Informational message for candidates without selected applications */}
            {!hasSelectedOrHiredApplications && applications.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-blue-800 mb-1">
                      Onboarding Access
                    </h3>
                    <p className="text-blue-700">
                      The onboarding process will become available once an employer marks your application as "Selected" or "Hired".
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Jobs Tab */}
        {activeTab === 'jobs' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-3xl font-bold text-gray-900">Available Jobs</h2>
              <div className="w-full sm:w-96">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search jobs, companies, locations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <svg className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>

            {loading.jobs ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </div>
            ) : (filteredJobs?.length || 0) === 0 ? (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0H8m8 0v2a2 2 0 01-2 2H10a2 2 0 01-2-2V6m8 0H8" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No jobs found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchTerm ? 'Try adjusting your search terms.' : 'No jobs are currently available.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(filteredJobs || []).map((job) => (
                  <div key={job?._id || Math.random()} className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="text-xl font-bold text-gray-900 line-clamp-2">{job?.title || 'N/A'}</h3>
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                            {formatJobId(job?._id)}
                          </span>
                        </div>
                        <p className="text-blue-600 font-medium">{job?.company || 'N/A'}</p>
                      </div>
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center ml-4">
                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 mb-4 line-clamp-3 text-sm leading-relaxed">{job?.description || 'No description available'}</p>
                    
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center text-sm text-gray-600">
                        <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {job?.location || 'N/A'}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                        </svg>
                        {job?.salary || 'N/A'}
                      </div>
                    </div>
                    
                    {(() => {
                      const application = applications.find(app => app.job?._id === job._id);
                      
                      if (application) {
                        // User has already applied
                        return (
                          <div className="w-full bg-gray-100 text-gray-600 px-4 py-3 rounded-xl font-medium flex items-center justify-center space-x-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>Already Applied</span>
                          </div>
                        );
                      } else {
                        // User can apply
                        return (
                          <button
                            onClick={() => applyJob(job)}
                            disabled={loading.submitting}
                            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 font-medium flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {loading.submitting ? (
                              <>
                                <LoadingSpinner size="w-4 h-4" />
                                <span>Applying...</span>
                              </>
                            ) : (
                              <>
                                <span>Apply Now</span>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                              </>
                            )}
                          </button>
                        );
                      }
                    })()}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Applications Tab */}
        {activeTab === 'applications' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-3xl font-bold text-gray-900">My Applications</h2>
              <div className="flex gap-4">
                 <select
                   value={filterStatus}
                   onChange={(e) => setFilterStatus(e.target.value)}
                   className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                 >
                   <option value="all">All Status</option>
                   <option value="Applied">Applied</option>
                   <option value="Shortlisted">Shortlisted</option>
                   <option value="Selected">Selected</option>
                   <option value="Hired">Hired</option>
                   <option value="Rejected">Rejected</option>
                 </select>
              </div>
            </div>

            {loading.applications ? (
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8">
                <div className="animate-pulse space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center space-x-4">
                      <div className="h-12 bg-gray-200 rounded w-12"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/6"></div>
                      </div>
                      <div className="h-6 bg-gray-200 rounded w-20"></div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (filteredApplications?.length || 0) === 0 ? (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No applications found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {filterStatus !== 'all' ? 'Try changing the status filter.' : 'You haven\'t applied to any jobs yet.'}
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gradient-to-r from-purple-50 to-purple-100">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Job</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Company</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Date Applied</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {(filteredApplications || []).map((app) => (
                        <tr key={app?._id || Math.random()} className="hover:bg-gray-50 transition-colors duration-200">
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                              </div>
                              <div>
                                <div className="text-sm font-semibold text-gray-900">{app?.job?.title || 'N/A'}</div>
                                <div className="text-sm text-gray-500">{app?.job?.location || ''}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                            {app?.job?.company || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                             <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                               app?.status === 'Hired' ? 'bg-green-100 text-green-800' :
                               app?.status === 'Selected' ? 'bg-blue-100 text-blue-800' :
                               app?.status === 'Shortlisted' ? 'bg-purple-100 text-purple-800' :
                               app?.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                               'bg-yellow-100 text-yellow-800'
                             }`}>
                              {app?.status || 'Unknown'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {app?.createdAt ? new Date(app.createdAt).toLocaleDateString() : 'N/A'}
                          </td>
                           <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                             {(() => {
                               console.log('Application status check:', {
                                 appId: app?._id,
                                 status: app?.status,
                                 isHired: app?.status === 'Hired',
                                 isSelected: app?.status === 'Selected'
                               });
                               if (app?.status === 'Hired') {
                                 return (
                                   <button
                                     onClick={() => handleStartOnboarding(app)}
                                     disabled={loading.submitting}
                                     className={`text-orange-600 hover:text-orange-900 font-medium ${
                                       loading.submitting ? 'opacity-50 cursor-not-allowed' : ''
                                     }`}
                                   >
                                     {loading.submitting ? 'Starting...' : 'Start Onboarding'}
                                   </button>
                                 );
                               } else if (app?.status === 'Selected') {
                                 return (
                                   <span className="text-blue-600 font-medium">
                                     Selected - Awaiting Final Decision
                                   </span>
                                 );
                               } else {
                                 return (
                                   <span className="text-gray-500 text-xs">
                                     Status: {app?.status || 'Unknown'}
                                   </span>
                                 );
                               }
                             })()}
                           </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Onboarding Tab */}
        {activeTab === 'onboarding' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Onboarding Process</h2>
              <div className="text-sm text-gray-600">
                Track your onboarding journey and complete required steps
              </div>
            </div>
            
            {hasSelectedOrHiredApplications ? (
              <IndividualDocumentUpload userId={profile._id || (token ? JSON.parse(atob(token.split('.')[1])).id : null)} />
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center">
                <div className="flex items-center justify-center mb-4">
                  <svg className="w-12 h-12 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-yellow-800 mb-2">Onboarding Not Available</h3>
                <p className="text-yellow-700 mb-4">
                  The onboarding process is only available for candidates who have been selected or hired for a position.
                </p>
                <p className="text-sm text-yellow-600">
                  Once an employer marks your application as "Selected" or "Hired", you'll be able to access the onboarding process here.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold text-gray-900">Profile Management</h2>
              <div className="text-right">
                <div className="text-2xl font-bold text-indigo-600">{profileStatus.completionPercentage}%</div>
                <div className="text-sm text-gray-600">Profile Complete</div>
              </div>
            </div>
            
            {/* Profile Completion Progress */}
            <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-indigo-900">Profile Completion Status</h3>
                <div className="flex items-center space-x-2">
                  {profileStatus.isComplete ? (
                    <div className="flex items-center text-green-600">
                      <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="font-medium">Complete!</span>
                    </div>
                  ) : (
                    <div className="text-amber-600 font-medium">
                      {profileStatus.missingFields.length} fields remaining
                    </div>
                  )}
                </div>
              </div>
              
              <div className="mb-4">
                <div className="w-full bg-indigo-200 rounded-full h-3">
                  <div 
                    className="bg-indigo-600 h-3 rounded-full transition-all duration-500" 
                    style={{ width: `${profileStatus.completionPercentage}%` }}
                  ></div>
                </div>
              </div>
              
              {!profileStatus.isComplete && profileStatus.missingFields.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm text-indigo-800 mb-2">Complete these fields to finish your profile:</p>
                  <div className="flex flex-wrap gap-2">
                    {profileStatus.missingFields.map((field, index) => (
                      <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                        {field}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {profileStatus.isComplete && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-green-800 font-medium">Excellent! Your profile is complete and ready for job applications.</span>
                  </div>
                </div>
              )}
            </div>
            
            <form onSubmit={updateProfile} className="space-y-6">
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                    <input
                      type="text"
                      name="name"
                      value={profile.name || ''}
                      onChange={handleProfileChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                      placeholder="Enter your full name"
                    />
                    {validationErrors.name && <p className="mt-1 text-sm text-red-600">{validationErrors.name}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                    <input
                      type="email"
                      name="email"
                      value={profile.email || ''}
                      onChange={handleProfileChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                      placeholder="Enter your email address"
                    />
                    {validationErrors.email && <p className="mt-1 text-sm text-red-600">{validationErrors.email}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      value={profile.phone || ''}
                      onChange={handleProfileChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                      placeholder="Enter your phone number"
                    />
                    {validationErrors.phone && <p className="mt-1 text-sm text-red-600">{validationErrors.phone}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Location</label>
                    <input
                      type="text"
                      name="location"
                      value={profile.location || ''}
                      onChange={handleProfileChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                      placeholder="Enter your location"
                    />
                    {validationErrors.location && <p className="mt-1 text-sm text-red-600">{validationErrors.location}</p>}
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                  </svg>
                  Professional Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Experience Level</label>
                    <select
                      name="experience"
                      value={profile.experience || ''}
                      onChange={handleProfileChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                    >
                      <option value="">Select experience level</option>
                      <option value="0">0 years (Fresh Graduate)</option>
                      <option value="1">1 year</option>
                      <option value="2">2 years</option>
                      <option value="3">3 years</option>
                      <option value="4">4 years</option>
                      <option value="5">5 years</option>
                      <option value="6">6 years</option>
                      <option value="7">7 years</option>
                      <option value="8">8 years</option>
                      <option value="9">9 years</option>
                      <option value="10">10 years</option>
                      <option value="15">15 years</option>
                      <option value="20">20 years</option>
                      <option value="25">25+ years</option>
                    </select>
                    {validationErrors.experience && <p className="mt-1 text-sm text-red-600">{validationErrors.experience}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Education</label>
                    <input
                      type="text"
                      name="education"
                      value={profile.education || ''}
                      onChange={handleProfileChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                      placeholder="Enter your education"
                    />
                    {validationErrors.education && <p className="mt-1 text-sm text-red-600">{validationErrors.education}</p>}
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Skills</label>
                    <input
                      type="text"
                      name="skills"
                      value={joinSkills(profile.skills)}
                      onChange={handleProfileChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                      placeholder="Enter your skills (comma-separated)"
                    />
                    {validationErrors.skills && <p className="mt-1 text-sm text-red-600">{validationErrors.skills}</p>}
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Bio</label>
                    <textarea
                      name="bio"
                      value={profile.bio || ''}
                      onChange={handleProfileChange}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                      placeholder="Tell us about yourself..."
                    />
                    {validationErrors.bio && <p className="mt-1 text-sm text-red-600">{validationErrors.bio}</p>}
                  </div>
                </div>
              </div>

              <ProfileImageUpload 
                currentImage={profileImage}
                onImageUpdate={handleProfileImageUpdate}
                onError={(error) => {
                  console.error('Profile image error:', error);
                }}
              />

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading.profile}
                  className={`px-8 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 ${
                    loading.profile
                      ? 'bg-gray-400 text-white cursor-not-allowed'
                      : 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white hover:from-indigo-700 hover:to-indigo-800 shadow-lg shadow-indigo-600/25'
                  }`}
                >
                  {loading.profile ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Updating...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Update Profile
                    </div>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Job Application Form Modal */}
        {showApplicationForm && selectedJob && (
          <SimpleJobApplicationForm
            jobId={selectedJob._id}
            jobTitle={selectedJob.title}
            companyName={selectedJob.company}
            onClose={handleApplicationClose}
            onSuccess={handleApplicationSuccess}
          />
        )}
      </div>
      </div>
    </>
  );
}

