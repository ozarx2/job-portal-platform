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
      const response = await axios.put(`https://api.ozarx.in/api/applications/${appId}/status`, {
        status: newStatus
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
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
      console.error('Error updating status:', err);
      setMessage(`Error updating status: ${err.response?.data?.message || err.message}`);
      setMessageType('error');
      setTimeout(() => {
        setMessage('');
        setMessageType('');
      }, 5000);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-10">
      <h1 className="text-3xl font-bold mb-6">Employer Dashboard</h1>
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


