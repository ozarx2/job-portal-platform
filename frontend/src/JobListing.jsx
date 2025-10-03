import { useState, useEffect } from 'react';
import apiService from './services/apiService';

export default function JobListing() {
  const [jobs, setJobs] = useState([]);
  const [message, setMessage] = useState('');
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const res = await apiService.getJobs();
      setJobs(res.data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const applyToJob = async (jobId) => {
    if (!token) {
      return setMessage('Please login to apply.');
    }

    // Check if user is a candidate
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      if (user.role !== 'candidate') {
        return setMessage(`Only candidates can apply for jobs. Your current role is: ${user.role}`);
      }
    }

    try {
      await apiService.applyForJob(jobId);
      setMessage('Application submitted!');
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.msg || 'Application failed.');
    }
  };

  // Helper function to check if current user is a candidate
  const isCandidate = () => {
    const userData = localStorage.getItem('user');
    if (!userData) return false;
    
    const user = JSON.parse(userData);
    return user.role === 'candidate';
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
              {/* Only show Apply Now button for candidates */}
              {isCandidate() && (
                <button
                  onClick={() => applyToJob(job._id)}
                  className="mt-3 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                >
                  Apply Now
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
