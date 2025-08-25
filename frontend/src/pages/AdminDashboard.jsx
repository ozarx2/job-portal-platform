import { useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { Modal, Box, Button } from '@mui/material';

export default function AdminDashboard() {
  const token = localStorage.getItem('token');
  const [adminName, setAdminName] = useState('Admin');
  const [users, setUsers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (token) {
      const decoded = jwtDecode(token);
      setAdminName(decoded.name || 'Admin');
    }
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      const headers = {
        Authorization: `Bearer ${token}`
      };

      const [userRes, jobRes, appRes] = await Promise.all([
        axios.get('http://localhost:5000/api/admin/users', { headers }),
        axios.get('http://localhost:5000/api/jobs', { headers }),
        axios.get('http://localhost:5000/api/admin/applications', { headers }),
      ]);

      setUsers(userRes.data);
      setJobs(jobRes.data);
      setApplications(appRes.data);
    } catch (err) {
      console.error('Error fetching admin data:', err);
      alert('Failed to load dashboard data.');
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-12">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Welcome, {adminName}</h1>

      {/* Users */}
      <section>
        <h2 className="text-xl font-semibold mb-4">All Users</h2>
        <div className="overflow-x-auto bg-white shadow-md rounded-lg">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-200">
              <tr>
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-left">Email</th>
                <th className="p-3 text-left">Role</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user._id} className="border-t hover:bg-gray-50">
                  <td className="p-3">{user.name}</td>
                  <td className="p-3">{user.email}</td>
                  <td className="p-3 capitalize">{user.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Jobs */}
      <section>
        <h2 className="text-xl font-semibold mb-4">All Job Listings</h2>
        <div className="space-y-4">
          {jobs.length === 0 ? (
            <p className="text-gray-500">No jobs found or failed to load.</p>
          ) : (
            jobs.map(job => (
              <div key={job._id} className="border p-4 rounded-lg bg-white shadow-sm">
                <h3 className="text-lg font-bold">{job.title}</h3>
                <p className="text-sm text-gray-700">{job.description}</p>
                <p className="text-sm text-gray-500">Location: {job.location}</p>
                <p className="text-sm text-gray-500">Posted by: {job.postedBy?.email || 'N/A'}</p>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Applications */}
      <section>
        <h2 className="text-xl font-semibold mb-4">All Applications</h2>
        <div className="overflow-x-auto bg-white shadow-md rounded-lg">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-200">
              <tr>
                <th className="p-3 text-left">Candidate</th>
                <th className="p-3 text-left">Job</th>
                <th className="p-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {applications.map(app => (
                <tr key={app._id} className="border-t hover:bg-gray-50">
                  <td className="p-3">{app.candidate?.name || 'N/A'}</td>
                  <td className="p-3">{app.job?.title || 'N/A'}</td>
                  <td className="p-3">{app.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <Button onClick={() => setOpen(true)}>Open Modal</Button>
      <AdminModal open={open} handleClose={() => setOpen(false)}>
        {/* Modal content here */}
      </AdminModal>
    </div>
  );
}

function AdminModal({ open, handleClose, children }) {
  return (
    <Modal open={open} onClose={handleClose}>
      <Box sx={{ p: 4, bgcolor: 'background.paper', borderRadius: 2 }}>
        {children}
      </Box>
    </Modal>
  );
}
