import { useEffect, useState } from 'react';
import axios from 'axios';

export default function EmployerDashboard() {
  const token = localStorage.getItem('token');
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [message, setMessage] = useState('');
  const [jobForm, setJobForm] = useState({ title: '', description: '', location: '' });

  const statusOptions = ['Applied', 'Shortlisted', 'Interviewed', 'Hired', 'Rejected'];

  useEffect(() => {
    fetchJobs();
    fetchApplications();
  }, []);

  // 🔁 Fetch employer's jobs
  const fetchJobs = async () => {
    try {
      const res = await axios.get('https://35.192.180.25:5000/api/jobs/employer', {
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
      const res = await axios.get('https://35.192.180.25:5000/api/applications/employer', {
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
      await axios.post('https://35.192.180.25:5000/api/jobs', jobForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage('Job posted!');
      setJobForm({ title: '', description: '', location: '' });
      fetchJobs();
    } catch (err) {
      console.error('Error posting job:', err.message);
    }
  };

  // 🔁 Update status
  const updateStatus = async (appId, newStatus) => {
    try {
      await axios.put(`https://35.192.180.25:5000/api/applications/${appId}/status`, {
        status: newStatus
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage('Status updated!');
      fetchApplications();
    } catch (err) {
      console.error('Error updating status:', err.message);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-10">
      <h1 className="text-3xl font-bold mb-6">Employer Dashboard</h1>
      {message && <p className="text-green-600">{message}</p>}

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


