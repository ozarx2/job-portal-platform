import { useEffect, useState } from 'react';
import { useApp } from '../contexts/AppContext';
import apiService from '../services/apiService';
import dashboardHub from '../services/dashboardHub';
import { formatJobId } from '../utils/jobIdGenerator';

export default function EmployerDashboard() {
  const { state, updateApplicationStatus, createJob } = useApp();
  const { jobs, applications } = state;
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [jobForm, setJobForm] = useState(() => ({ title: '', description: '', location: '', salary: '', type: 'Full-time' }));
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);

  const statusOptions = ['Applied', 'Shortlisted', 'Selected', 'Interviewed', 'Hired', 'Rejected'];
  const jobTypes = ['Full-time', 'Part-time', 'Contract', 'Internship', 'Remote'];

  useEffect(() => {
    // Register this dashboard with the hub
    dashboardHub.registerDashboard('EmployerDashboard');
    
    return () => {
      dashboardHub.unregisterDashboard('EmployerDashboard');
    };
  }, []);

  // ✅ Post a new job
  const postJob = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const result = await createJob(jobForm);
      
      if (result.success) {
        setMessage('Job posted successfully!');
        setMessageType('success');
        setJobForm({ title: '', description: '', location: '', salary: '', type: 'Full-time' });
        
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
  };

  // 🔁 Update status
  const updateStatus = async (appId, newStatus) => {
    console.log('🔄 Updating status:', { appId, newStatus });
    
    const result = await updateApplicationStatus(appId, newStatus);
    
    if (result.success) {
      setMessage('Status updated successfully!');
      setMessageType('success');
      
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
  };

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
            <button 
              onClick={testApiEndpoint}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm font-medium"
            >
              🧪 Test API
            </button>
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
      </div>
    </div>
  );
}


