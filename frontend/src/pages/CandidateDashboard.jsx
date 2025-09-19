import { useEffect, useState } from 'react';
import axios from 'axios';

export default function CandidateDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [selectedJobs, setSelectedJobs] = useState([]);
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    image: null,
  });
  const [resumeFile, setResumeFile] = useState(null);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  // Onboarding documents state
  const [onboardingData, setOnboardingData] = useState({
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

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchJobs();
    fetchApplications();
    fetchProfile();
    fetchSelectedJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const res = await axios.get('https://api.ozarx.in/api/jobs');
      setJobs(res.data || []);
    } catch (err) {
      console.error('Error fetching jobs:', err.message);
    }
  };

  const fetchApplications = async () => {
    try {
      const res = await axios.get('https://api.ozarx.in/api/applications/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setApplications(res.data || []);
    } catch (error) {
      console.error('Error fetching applications:', error);
    }
  };

  const fetchProfile = async () => {
    try {
      const res = await axios.get('https://api.ozarx.in/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProfile(res.data.user || {});
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchSelectedJobs = async () => {
    try {
      const res = await axios.get('https://api.ozarx.in/api/applications/selected', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSelectedJobs(res.data || []);
    } catch (error) {
      console.error('Error fetching selected jobs:', error);
    }
  };

  const handleProfileChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleProfileImageChange = (e) => {
    setProfile({ ...profile, image: e.target.files[0] });
  };

  const handleResumeUpload = (e) => {
    setResumeFile(e.target.files[0]);
  };

  const updateProfile = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('name', profile.name);
      formData.append('email', profile.email);
      formData.append('phone', profile.phone);
      if (profile.image) formData.append('image', profile.image);

      await axios.put('https://api.ozarx.in/api/users/update', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      setMessage('Profile updated successfully!');
      setMessageType('success');
    } catch (error) {
      setMessage('Failed to update profile');
      setMessageType('error');
    }
  };

  const uploadResume = async () => {
    try {
      const formData = new FormData();
      formData.append('resume', resumeFile);

      await axios.post('https://api.ozarx.in/api/users/resume', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      setMessage('Resume uploaded successfully!');
      setMessageType('success');
    } catch (error) {
      setMessage('Failed to upload resume');
      setMessageType('error');
    }
  };

  const applyJob = async (jobId) => {
    try {
      await axios.post(
        `https://api.ozarx.in/api/applications/apply`,
        { jobId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage('Application submitted!');
      setMessageType('success');
      fetchApplications();
    } catch (error) {
      setMessage('Failed to submit application');
      setMessageType('error');
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

      await axios.post('https://api.ozarx.in/api/onboarding/submit', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
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
    } catch (error) {
      setMessage('Failed to submit onboarding documents');
      setMessageType('error');
    }
  };

  const clearMessage = () => {
    setMessage('');
    setMessageType('');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Candidate Dashboard</h1>
              <p className="text-gray-600">Welcome back, {profile.name || 'Candidate'}</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                {applications.length} Applications
              </div>
              <div className="text-sm text-gray-500">
                {selectedJobs.length} Selected
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation */}
        <nav className="flex flex-wrap gap-2 mb-8">
          <button 
            onClick={() => setActiveTab('dashboard')} 
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'dashboard' 
                ? 'bg-blue-600 text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-50 border'
            }`}
          >
            Dashboard
          </button>
          <button 
            onClick={() => setActiveTab('jobs')} 
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'jobs' 
                ? 'bg-green-600 text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-50 border'
            }`}
          >
            Available Jobs
          </button>
          <button 
            onClick={() => setActiveTab('applications')} 
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'applications' 
                ? 'bg-purple-600 text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-50 border'
            }`}
          >
            My Applications
          </button>
          <button 
            onClick={() => setActiveTab('onboarding')} 
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'onboarding' 
                ? 'bg-orange-600 text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-50 border'
            }`}
          >
            Onboarding
          </button>
          <button 
            onClick={() => setActiveTab('profile')} 
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'profile' 
                ? 'bg-indigo-600 text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-50 border'
            }`}
          >
            Profile
          </button>
        </nav>

        {/* Message Display */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            messageType === 'success' 
              ? 'bg-green-50 border border-green-200 text-green-800' 
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            <div className="flex justify-between items-center">
              <span>{message}</span>
              <button 
                onClick={clearMessage}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Applications</h3>
                <p className="text-3xl font-bold text-blue-600">{applications.length}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Selected Jobs</h3>
                <p className="text-3xl font-bold text-green-600">{selectedJobs.length}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Available Jobs</h3>
                <p className="text-3xl font-bold text-purple-600">{jobs.length}</p>
              </div>
            </div>

            {selectedJobs.length > 0 && (
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Selected for Onboarding</h3>
                <div className="space-y-3">
                  {selectedJobs.map((job) => (
                    <div key={job._id} className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-900">{job.title}</h4>
                        <p className="text-sm text-gray-600">{job.company}</p>
                      </div>
                      <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                        Selected
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Jobs Tab */}
        {activeTab === 'jobs' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Available Jobs</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {jobs.map((job) => (
                <div key={job._id} className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{job.title}</h3>
                  <p className="text-gray-600 mb-3 line-clamp-3">{job.description}</p>
                  <div className="space-y-2 mb-4">
                    <p className="text-sm text-gray-500"><strong>Company:</strong> {job.company}</p>
                    <p className="text-sm text-gray-500"><strong>Salary:</strong> {job.salary}</p>
                    <p className="text-sm text-gray-500"><strong>Location:</strong> {job.location}</p>
                  </div>
                  <button
                    onClick={() => applyJob(job._id)}
                    className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Apply Now
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Applications Tab */}
        {activeTab === 'applications' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">My Applications</h2>
            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Job</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Applied</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {applications.map((app) => (
                    <tr key={app._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{app.job?.title || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {app.job?.company || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          app.status === 'selected' ? 'bg-green-100 text-green-800' :
                          app.status === 'shortlisted' ? 'bg-blue-100 text-blue-800' :
                          app.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {app.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(app.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Onboarding Tab */}
        {activeTab === 'onboarding' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Onboarding Process</h2>
            
            {selectedJobs.length === 0 ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800">No Selected Jobs</h3>
                    <div className="mt-2 text-sm text-yellow-700">
                      <p>You need to be selected for a job before you can start the onboarding process.</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={submitOnboarding} className="space-y-8">
                {/* Job Selection */}
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Job for Onboarding</h3>
                  <select
                    value={onboardingData.selectedJobId}
                    onChange={(e) => handleOnboardingChange('selectedJobId', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select a job</option>
                    {selectedJobs.map((job) => (
                      <option key={job._id} value={job._id}>
                        {job.title} - {job.company}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Personal Information */}
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                      <input
                        type="text"
                        value={onboardingData.personalInfo.fullName}
                        onChange={(e) => handleOnboardingChange('personalInfo.fullName', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                      <input
                        type="date"
                        value={onboardingData.personalInfo.dateOfBirth}
                        onChange={(e) => handleOnboardingChange('personalInfo.dateOfBirth', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                      <textarea
                        value={onboardingData.personalInfo.address}
                        onChange={(e) => handleOnboardingChange('personalInfo.address', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={3}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Contact</label>
                      <input
                        type="text"
                        value={onboardingData.personalInfo.emergencyContact}
                        onChange={(e) => handleOnboardingChange('personalInfo.emergencyContact', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Blood Group</label>
                      <select
                        value={onboardingData.personalInfo.bloodGroup}
                        onChange={(e) => handleOnboardingChange('personalInfo.bloodGroup', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="">Select Blood Group</option>
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Document Uploads */}
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Required Documents</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Aadhar Card */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Aadhar Card</label>
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => handleDocumentUpload('aadharCard', e.target.files[0])}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>

                    {/* PAN Card */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">PAN Card</label>
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => handleDocumentUpload('panCard', e.target.files[0])}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>

                    {/* Resume */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Resume</label>
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => handleDocumentUpload('resume', e.target.files[0])}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>

                    {/* Marklist */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Marklist/Transcript</label>
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => handleDocumentUpload('marklist', e.target.files[0])}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>

                    {/* Bank Passbook */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Bank Passbook</label>
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => handleDocumentUpload('bankPassbook', e.target.files[0])}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>

                    {/* Passport Photo */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Passport Size Photo</label>
                      <input
                        type="file"
                        accept=".jpg,.jpeg,.png"
                        onChange={(e) => handleDocumentUpload('passportPhoto', e.target.files[0])}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
                  >
                    Submit Onboarding Documents
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Profile Management</h2>
            
            {/* Profile Update */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Update Profile</h3>
              <form onSubmit={updateProfile} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input
                      type="text"
                      name="name"
                      value={profile.name}
                      onChange={handleProfileChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={profile.email}
                      onChange={handleProfileChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input
                      type="text"
                      name="phone"
                      value={profile.phone || ''}
                      onChange={handleProfileChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Profile Image</label>
                    <input
                      type="file"
                      onChange={handleProfileImageChange}
                      accept="image/*"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Save Profile
                </button>
              </form>
            </div>

            {/* Resume Upload */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload Resume</h3>
              <div className="flex gap-4 items-center">
                <input 
                  type="file" 
                  accept=".pdf" 
                  onChange={handleResumeUpload}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={uploadResume}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Upload Resume
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
