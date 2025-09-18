import { useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { Modal, Box, Button } from '@mui/material';
import AdminLayout from '../components/admin/AdminLayout';

export default function AdminDashboard() {
  const token = localStorage.getItem('token');
  const [adminName, setAdminName] = useState('Admin');
  const [users, setUsers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [open, setOpen] = useState(false);
  const [showAllUsers, setShowAllUsers] = useState(false);
  const [showAllJobs, setShowAllJobs] = useState(false);
  const [showAllApps, setShowAllApps] = useState(false);
  const [activeTab, setActiveTab] = useState('users');
  

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
        axios.get('http://35.192.180.25:5000/api/admin/users', { headers }),
        axios.get('http://35.192.180.25:5000/api/jobs', { headers }),
        axios.get('http://35.192.180.25:5000/api/admin/applications', { headers }),
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
    <AdminLayout title={`Welcome, ${adminName}`}>
      <div className="space-y-12" id="top">
        <nav className="flex flex-wrap gap-2 mb-2">
          <button onClick={() => setActiveTab('users')} className={`px-3 py-2 rounded text-sm ${activeTab==='users' ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-700'}`}>Users</button>
          <button onClick={() => setActiveTab('jobs')} className={`px-3 py-2 rounded text-sm ${activeTab==='jobs' ? 'bg-emerald-600 text-white' : 'bg-emerald-50 text-emerald-700'}`}>Jobs</button>
          <button onClick={() => setActiveTab('applications')} className={`px-3 py-2 rounded text-sm ${activeTab==='applications' ? 'bg-indigo-600 text-white' : 'bg-indigo-50 text-indigo-700'}`}>Applications</button>
        </nav>

      {/* Users */}
      {activeTab === 'users' && (
      <section id="users">
        <h2 className="text-xl font-semibold mb-4 text-blue-700">All Users</h2>
        <div className="overflow-x-auto bg-white shadow-md rounded-lg">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-200">
              <tr>
                <th className="p-3 text-left w-12">#</th>
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-left">Email</th>
                <th className="p-3 text-left">Role</th>
                <th className="p-3 text-left">ID</th>
              </tr>
            </thead>
            <tbody>
              {(showAllUsers ? users : users.slice(0, 5)).map((user, idx) => (
                <tr key={user._id} className="border-t hover:bg-gray-50">
                  <td className="p-3">{idx + 1}</td>
                  <td className="p-3">{user.name}</td>
                  <td className="p-3">{user.email}</td>
                  <td className="p-3 capitalize">{user.role}</td>
                  <td className="p-3 font-mono text-xs">{user._id}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {users.length > 5 && (
          <div className="mt-3">
            <button className="px-3 py-2 text-sm rounded bg-blue-50 text-blue-700 hover:bg-blue-100" onClick={() => setShowAllUsers(v => !v)}>
              {showAllUsers ? 'Show less' : 'See more'}
            </button>
          </div>
        )}
      </section>
      )}

      {/* Jobs */}
      {activeTab === 'jobs' && (
      <section id="jobs">
        <h2 className="text-xl font-semibold mb-4 text-emerald-700">All Job Listings</h2>
        
        <div className="space-y-4">
          {jobs.length === 0 ? (
            <p className="text-gray-500">No jobs found or failed to load.</p>
          ) : (
            (showAllJobs ? jobs : jobs.slice(0, 5)).map((job, idx) => (
              <div key={job._id} className="border p-4 rounded-lg bg-white shadow-sm">
                <div className="flex items-center justify-between mb-1">
                  <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-emerald-50 text-emerald-700 text-sm font-semibold">{idx + 1}</span>
                  <span className="font-mono text-xs text-gray-500">{job._id}</span>
                </div>
                <h3 className="text-lg font-bold">{job.title}</h3>
                <p className="text-sm text-gray-700">{job.description}</p>
                <p className="text-sm text-gray-500">Location: {job.location}</p>
                <p className="text-sm text-gray-500">Posted by: {job.postedBy?.email || 'N/A'}</p>
              </div>
            ))
          )}
        </div>
        {jobs.length > 5 && (
          <div className="mt-3">
            <button className="px-3 py-2 text-sm rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100" onClick={() => setShowAllJobs(v => !v)}>
              {showAllJobs ? 'Show less' : 'See more'}
            </button>
          </div>
        )}
      </section>
      )}

      {/* Applications */}
      {activeTab === 'applications' && (
      <section id="applications">
        <h2 className="text-xl font-semibold mb-4 text-indigo-700">All Applications</h2>
        <div className="overflow-x-auto bg-white shadow-md rounded-lg">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-200">
              <tr>
                <th className="p-3 text-left w-12">#</th>
                <th className="p-3 text-left">Candidate</th>
                <th className="p-3 text-left">Job</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">ID</th>
              </tr>
            </thead>
            <tbody>
              {(showAllApps ? applications : applications.slice(0, 5)).map((app, idx) => (
                <tr key={app._id} className="border-t hover:bg-gray-50">
                  <td className="p-3">{idx + 1}</td>
                  <td className="p-3">{app.candidate?.name || 'N/A'}</td>
                  <td className="p-3">{app.job?.title || 'N/A'}</td>
                  <td className="p-3">{app.status}</td>
                  <td className="p-3 font-mono text-xs">{app._id}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {applications.length > 5 && (
          <div className="mt-3">
            <button className="px-3 py-2 text-sm rounded bg-indigo-50 text-indigo-700 hover:bg-indigo-100" onClick={() => setShowAllApps(v => !v)}>
              {showAllApps ? 'Show less' : 'See more'}
            </button>
          </div>
        )}
      </section>
      )}

      <Button variant="contained" onClick={() => setOpen(true)}>Open Modal</Button>
      <AdminModal open={open} handleClose={() => setOpen(false)}>
        {/* Modal content here */}
      </AdminModal>
      </div>
    </AdminLayout>
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
