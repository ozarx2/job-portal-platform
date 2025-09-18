import { useEffect, useState } from 'react';
import axios from 'axios';

export default function CandidateDashboard() {
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    image: null,
  });
  const [resumeFile, setResumeFile] = useState(null);
  const [message, setMessage] = useState('');

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchJobs();
    fetchApplications();
    fetchProfile();
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
  };

  const uploadResume = async () => {
    const formData = new FormData();
    formData.append('resume', resumeFile);

    await axios.post('https://api.ozarx.in/api/users/resume', formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    });

    setMessage('Resume uploaded successfully!');
  };

  const applyJob = async (jobId) => {
    await axios.post(
      `https://api.ozarx.in/api/applications/apply`,
      { jobId },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setMessage('Application submitted!');
    fetchApplications();
  };

  return (
    <div className="p-8 space-y-12 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Candidate Dashboard</h1>

      {message && <p className="text-green-600">{message}</p>}

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
