import { useState, useEffect } from 'react';
import axios from 'axios';

export default function JobListing() {
  const [jobs, setJobs] = useState([]);
  const [message, setMessage] = useState('');
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const res = await axios.get('http://35.192.180.25:5000/api/jobs');
      setJobs(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const applyToJob = async (jobId) => {
    if (!token) {
      return setMessage('Please login to apply.');
    }

    try {
      await axios.post(
        `http://35.192.180.25:5000/api/applications`,
        { jobId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      setMessage('Application submitted!');
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.msg || 'Application failed.');
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Job Listings</h1>

      {message && (
        <p className="mb-4 text-sm text-center text-blue-600 font-medium">{message}</p>
      )}

      {jobs.length === 0 ? (
        <p className="text-gray-600">No jobs available right now.</p>
      ) : (
        <div className="space-y-6">
          {jobs.map((job) => (
            <div
              key={job._id}
              className="border p-6 rounded-xl shadow-md bg-white space-y-2"
            >
              <h2 className="text-xl font-semibold">{job.title}</h2>
              <p className="text-gray-700">{job.description}</p>
              <p className="text-sm text-gray-500">
                Location: {job.location || 'Not specified'}
              </p>
              <p className="text-sm text-gray-500">
                Posted by: {job.postedBy?.email || 'Unknown'}
              </p>
              <button
                onClick={() => applyToJob(job._id)}
                className="mt-3 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
              >
                Apply Now
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
