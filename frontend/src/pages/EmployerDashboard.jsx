import { useEffect, useState } from 'react';
import axios from 'axios';

export default function EmployerDashboard() {
  const token = localStorage.getItem('token');
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [jobForm, setJobForm] = useState({ title: '', description: '', location: '' });

  const statusOptions = ['Applied', 'Shortlisted', 'Selected', 'Interviewed', 'Hired', 'Rejected'];

  useEffect(() => {
    fetchJobs();
    fetchApplications();
  }, []);

  // 🔁 Fetch employer's jobs
  const fetchJobs = async () => {
    try {
      const res = await axios.get('https://api.ozarx.in/api/jobs/employer', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setJobs(res.data.jobs);
    } catch (err) {
      console.error('Error fetching jobs:', err.message);
    }
  };

  // 🔁 Fetch employer's applications
  const fetchApplications = async () => {
    try {
      const res = await axios.get('https://api.ozarx.in/api/applications/employer', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setApplications(res.data);
    } catch (err) {
      console.error('Error fetching applications:', err.message);
    }
  };

  // ✅ Post a new job
  const postJob = async (e) => {
    e.preventDefault();
    try {
      await axios.post('https://api.ozarx.in/api/jobs', jobForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage('Job posted successfully!');
      setMessageType('success');
      setJobForm({ title: '', description: '', location: '' });
      fetchJobs();
      
      // Clear message after 3 seconds
      setTimeout(() => {
        setMessage('');
        setMessageType('');
      }, 3000);
    } catch (err) {
      console.error('Error posting job:', err);
      setMessage(`Error posting job: ${err.response?.data?.message || err.message}`);
      setMessageType('error');
      setTimeout(() => {
        setMessage('');
        setMessageType('');
      }, 5000);
    }
  };

  // 🔁 Update status
  const updateStatus = async (appId, newStatus) => {
    try {
      console.log('🔄 Updating status:', { appId, newStatus });
      
      const payload = { status: newStatus };
      console.log('📤 Sending payload:', payload);
      
      // Try multiple endpoints to find the correct one
      let response;
      let endpointUsed = '';
      
      try {
        // Try 1: CRM leads endpoint
        endpointUsed = 'CRM Leads';
        response = await axios.put(`https://api.ozarx.in/api/crm/leads/${appId}`, payload, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      } catch (err1) {
        console.log('CRM leads failed, trying applications...');
        try {
          // Try 2: Applications endpoint with PUT
          endpointUsed = 'Applications PUT';
          response = await axios.put(`https://api.ozarx.in/api/applications/${appId}`, payload, {
            headers: { 
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
        } catch (err2) {
          console.log('Applications PUT failed, trying PATCH...');
          // Try 3: Applications endpoint with PATCH
          endpointUsed = 'Applications PATCH';
          response = await axios.patch(`https://api.ozarx.in/api/applications/${appId}`, payload, {
            headers: { 
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
        }
      }
      
      console.log(`✅ Success using endpoint: ${endpointUsed}`);
      
      console.log('📥 API Response:', response.data);
      
      if (response.data.success) {
        setMessage('Status updated successfully!');
        setMessageType('success');
        fetchApplications();
        
        // Clear message after 3 seconds
        setTimeout(() => {
          setMessage('');
          setMessageType('');
        }, 3000);
      } else {
        setMessage('Failed to update status. Please try again.');
        setMessageType('error');
        setTimeout(() => {
          setMessage('');
          setMessageType('');
        }, 3000);
      }
    } catch (err) {
      console.error('❌ Error updating status:', err);
      console.error('❌ Error response:', err.response?.data);
      console.error('❌ Error status:', err.response?.status);
      
      let errorMessage = 'Error updating status';
      
      if (err.response?.status === 400) {
        errorMessage = `Bad Request (400): ${err.response?.data?.message || 'Invalid request format'}`;
      } else if (err.response?.status === 401) {
        errorMessage = 'Unauthorized: Please login again';
      } else if (err.response?.status === 403) {
        errorMessage = 'Forbidden: You do not have permission to update this application';
      } else if (err.response?.status === 404) {
        errorMessage = 'Application not found';
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else {
        errorMessage = err.message;
      }
      
      setMessage(errorMessage);
      setMessageType('error');
      setTimeout(() => {
        setMessage('');
        setMessageType('');
      }, 5000);
    }
  };

  // 🧪 Test API endpoint
  const testApiEndpoint = async () => {
    if (applications.length === 0) {
      setMessage('No applications to test with');
      setMessageType('error');
      return;
    }
    
    const testApp = applications[0];
    const testStatus = 'Test Status';
    
    console.log('🧪 Testing API with:', { appId: testApp._id, status: testStatus });
    
    try {
      let response;
      let endpointUsed = '';
      
      try {
        // Try 1: CRM leads endpoint
        endpointUsed = 'CRM Leads';
        response = await axios.put(`https://api.ozarx.in/api/crm/leads/${testApp._id}`, 
          { status: testStatus }, 
          {
            headers: { 
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
      } catch (err1) {
        console.log('🧪 CRM leads failed, trying applications...');
        try {
          // Try 2: Applications endpoint
          endpointUsed = 'Applications';
          response = await axios.patch(`https://api.ozarx.in/api/applications/${testApp._id}`, 
            { status: testStatus }, 
            {
              headers: { 
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            }
          );
        } catch (err2) {
          throw err2; // Re-throw the last error
        }
      }
      
      console.log(`🧪 Test successful using endpoint: ${endpointUsed}`);
      console.log('🧪 Test response:', response.data);
      setMessage(`API test successful using ${endpointUsed}! Check console for details.`);
      setMessageType('success');
    } catch (err) {
      console.error('🧪 All endpoints failed:', err);
      setMessage(`API test failed: ${err.response?.data?.message || err.message}`);
      setMessageType('error');
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Employer Dashboard</h1>
        <button 
          onClick={testApiEndpoint}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          🧪 Test API
        </button>
      </div>
      {message && (
        <div className={`p-4 rounded-lg ${
          messageType === 'success' 
            ? 'bg-green-50 border border-green-200 text-green-800' 
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          <div className="flex justify-between items-center">
            <span>{message}</span>
            <button 
              onClick={() => {
                setMessage('');
                setMessageType('');
              }}
              className="text-gray-400 hover:text-gray-600 ml-4"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* ✅ 1. Post Job */}
      <section className="bg-white shadow p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Post a New Job</h2>
        <form onSubmit={postJob} className="space-y-3">
          <input
            type="text"
            placeholder="Job Title"
            value={jobForm.title}
            onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })}
            className="w-full border p-2 rounded"
            required
          />
          <textarea
            placeholder="Job Description"
            value={jobForm.description}
            onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })}
            className="w-full border p-2 rounded"
            required
          />
          <input
            type="text"
            placeholder="Location"
            value={jobForm.location}
            onChange={(e) => setJobForm({ ...jobForm, location: e.target.value })}
            className="w-full border p-2 rounded"
            required
          />
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Post Job
          </button>
        </form>
      </section>

      {/* ✅ 2. Your Jobs */}
      <section className="bg-white shadow p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Your Posted Jobs</h2>
        <ul className="space-y-3">
          {jobs.map((job) => (
            <li key={job._id} className="border p-4 rounded bg-gray-50">
              <h3 className="font-bold">{job.title}</h3>
              <p>{job.description}</p>
              <p className="text-sm text-gray-500">{job.location}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* ✅ 3. Applications */}
      <section className="bg-white shadow p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Applications Received</h2>
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3">Candidate</th>
              <th className="p-3">Job</th>
              <th className="p-3">Status</th>
              <th className="p-3">Change Status</th>
            </tr>
          </thead>
          <tbody>
            {applications.map((app) => (
              <tr key={app._id} className="border-t">
                <td className="p-3">{app.candidate?.name} <br />
                  <span className="text-gray-500">{app.candidate?.email}</span></td>
                <td className="p-3">{app.job?.title}</td>
                <td className="p-3 font-semibold">{app.status}</td>
                <td className="p-3">
                  <select
                    value={app.status}
                    onChange={(e) => updateStatus(app._id, e.target.value)}
                    className="border rounded px-2 py-1"
                  >
                    {statusOptions.map((status) => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}


