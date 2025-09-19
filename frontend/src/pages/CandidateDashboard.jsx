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
      setJobs(res.data); // <-- directly set data
    } catch (err) {
      console.error('Error fetching jobs:', err.message);
    }
  };
  

  const fetchApplications = async () => {
    const res = await axios.get('https://api.ozarx.in/api/applications/me', {
      headers: { Authorization: `Bearer ${token}` },
    });
    setApplications(res.data || []);
  };

  const fetchProfile = async () => {
    const res = await axios.get('https://api.ozarx.in/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    });
    setProfile(res.data.user);
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

      {/* Available Jobs */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Available Jobs</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {jobs.map((job) => (
            <div key={job._id} className="border p-4 rounded-xl shadow-sm bg-white">
              <h3 className="text-lg font-semibold">{job.title}</h3>
              <p>{job.description}</p>
              <p className="text-sm text-gray-500">{job.location}</p>
              <button
                onClick={() => applyJob(job._id)}
                className="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Apply Now
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Profile Update */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Update Profile</h2>
        <form onSubmit={updateProfile} className="space-y-4 bg-white p-6 rounded-xl shadow-sm">
          <input
            type="text"
            name="name"
            value={profile.name}
            onChange={handleProfileChange}
            placeholder="Name"
            className="w-full border p-2 rounded"
            required
          />
          <input
            type="email"
            name="email"
            value={profile.email}
            onChange={handleProfileChange}
            placeholder="Email"
            className="w-full border p-2 rounded"
            required
          />
          <input
            type="text"
            name="phone"
            value={profile.phone || ''}
            onChange={handleProfileChange}
            placeholder="Phone"
            className="w-full border p-2 rounded"
          />
          <input
            type="file"
            onChange={handleProfileImageChange}
            accept="image/*"
            className="w-full"
          />
          <button
            type="submit"
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Save Profile
          </button>
        </form>
      </section>

      {/* Resume Upload */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Upload Resume</h2>
        <div className="flex gap-4 items-center">
          <input type="file" accept=".pdf" onChange={handleResumeUpload} />
          <button
            onClick={uploadResume}
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
          >
            Upload
          </button>
        </div>
      </section>

      {/* Application Status */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Your Applications</h2>
        <table className="w-full text-left border-collapse bg-white shadow-sm">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-3">Job</th>
              <th className="p-3">Status</th>
              <th className="p-3">Date Applied</th>
            </tr>
          </thead>
          <tbody>
            {applications.map((app) => (
              <tr key={app._id} className="border-t">
                <td className="p-3">{app.job?.title || 'N/A'}</td>
                <td className="p-3">{app.status}</td>
                <td className="p-3">{new Date(app.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
