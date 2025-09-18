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
  const [leads, setLeads] = useState([]);
  const [leadsTotal, setLeadsTotal] = useState(0);
  const [leadsPage, setLeadsPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [showAllUsers, setShowAllUsers] = useState(false);
  const [showAllJobs, setShowAllJobs] = useState(false);
  const [showAllApps, setShowAllApps] = useState(false);
  const [activeTab, setActiveTab] = useState('users');
  const [leadFilters, setLeadFilters] = useState({
    status: '',
    agentId: ''
  });
  const [agents, setAgents] = useState([]);
  const [editingLead, setEditingLead] = useState(null);
  const [leadsLoading, setLeadsLoading] = useState(false);
  const [crmDashboard, setCrmDashboard] = useState([]);
  const [crmLoading, setCrmLoading] = useState(false);
  const [crmFilters, setCrmFilters] = useState({
    date: new Date().toISOString().split('T')[0],
    agentId: ''
  });

  useEffect(() => {
    if (token) {
      const decoded = jwtDecode(token);
      setAdminName(decoded.name || 'Admin');
    }
    fetchAllData();
  }, []);

  useEffect(() => {
    if (activeTab === 'leads') {
      fetchLeads();
    }
    if (activeTab === 'crm-dashboard') {
      fetchCrmDashboard();
    }
  }, [activeTab, leadsPage, leadFilters, crmFilters]);

  const fetchAllData = async () => {
    try {
      const headers = {
        Authorization: `Bearer ${token}`
      };

      const [userRes, jobRes, appRes] = await Promise.all([
        axios.get('https://35.192.180.25:5000/api/admin/users', { headers }),
        axios.get('https://35.192.180.25:5000/api/jobs', { headers }),
        axios.get('https://35.192.180.25:5000/api/admin/applications', { headers }),
      ]);

      setUsers(userRes.data);
      setJobs(jobRes.data);
      setApplications(appRes.data);

      const agentsList = userRes.data.filter(user => user.role === 'agent');
      setAgents(agentsList);
    } catch (err) {
      console.error('Error fetching admin data:', err);
      alert('Failed to load dashboard data.');
    }
  };

  const fetchCrmDashboard = async () => {
    setCrmLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const response = await axios.get('https://35.192.180.25:5000/api/crm/admin/summary', { headers });
      
      if (response.data.results) {
        setCrmDashboard(response.data.results);
      }
    } catch (err) {
      console.error('Error fetching CRM dashboard:', err);
      alert('Failed to load CRM dashboard data.');
    } finally {
      setCrmLoading(false);
    }
  };

  const fetchLeads = async () => {
    setLeadsLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const params = {
        page: leadsPage,
        limit: 10,
        ...leadFilters
      };

      const response = await axios.get('https://35.192.180.25:5000/api/crm/leads', {
        headers,
        params
      });

      if (response.data.success) {
        setLeads(response.data.data);
        setLeadsTotal(response.data.total);
      }
    } catch (err) {
      console.error('Error fetching leads:', err);
      alert('Failed to load leads data.');
    } finally {
      setLeadsLoading(false);
    }
  };

  const updateLead = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      await axios.put(
        `https://35.192.180.25:5000/api/crm/leads/${editingLead._id}`,
        editingLead,
        { headers }
      );
      setEditingLead(null);
      fetchLeads();
    } catch (err) {
      console.error('Error updating lead:', err);
      alert('Failed to update lead.');
    }
  };

  const deleteLead = async (id) => {
    if (!window.confirm('Are you sure you want to delete this lead?')) return;
    
    try {
      const headers = { Authorization: `Bearer ${token}` };
      await axios.delete(`https://35.192.180.25:5000/api/crm/leads/${id}`, { headers });
      fetchLeads();
    } catch (err) {
      console.error('Error deleting lead:', err);
      alert('Failed to delete lead.');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'New': 'bg-blue-100 text-blue-800',
      'Contacted': 'bg-yellow-100 text-yellow-800',
      'Interested': 'bg-green-100 text-green-800',
      'Shortlisted': 'bg-purple-100 text-purple-800',
      'Converted': 'bg-emerald-100 text-emerald-800',
      'Discarded': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <AdminLayout title={`Welcome, ${adminName}`}>
      <div className="space-y-12" id="top">
        <nav className="flex flex-wrap gap-2 mb-2">
          <button onClick={() => setActiveTab('users')} className={`px-3 py-2 rounded text-sm ${activeTab==='users' ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-700'}`}>Users</button>
          <button onClick={() => setActiveTab('jobs')} className={`px-3 py-2 rounded text-sm ${activeTab==='jobs' ? 'bg-emerald-600 text-white' : 'bg-emerald-50 text-emerald-700'}`}>Jobs</button>
          <button onClick={() => setActiveTab('applications')} className={`px-3 py-2 rounded text-sm ${activeTab==='applications' ? 'bg-indigo-600 text-white' : 'bg-indigo-50 text-indigo-700'}`}>Applications</button>
          <button onClick={() => setActiveTab('leads')} className={`px-3 py-2 rounded text-sm ${activeTab==='leads' ? 'bg-orange-600 text-white' : 'bg-orange-50 text-orange-700'}`}>Leads ({leadsTotal})</button>
          <button onClick={() => setActiveTab('crm-dashboard')} className={`px-3 py-2 rounded text-sm ${activeTab==='crm-dashboard' ? 'bg-purple-600 text-white' : 'bg-purple-50 text-purple-700'}`}>CRM Analytics</button>
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

        {/* Leads */}
        {activeTab === 'leads' && (
        <section id="leads">
          <div className="bg-gradient-to-r from-orange-50 to-amber-50 border-b border-orange-200 px-6 py-4 mb-6 rounded-lg">
            <h2 className="text-xl font-semibold text-orange-700 mb-2">All Leads ({leadsTotal})</h2>
            <p className="text-sm text-gray-600">Manage and oversee all CRM leads across agents</p>
          </div>

          {/* Filters */}
          <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
            <div className="flex flex-wrap gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={leadFilters.status}
                  onChange={(e) => setLeadFilters(prev => ({ ...prev, status: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">All Statuses</option>
                  <option value="New">New</option>
                  <option value="Contacted">Contacted</option>
                  <option value="Interested">Interested</option>
                  <option value="Shortlisted">Shortlisted</option>
                  <option value="Converted">Converted</option>
                  <option value="Discarded">Discarded</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Agent</label>
                <select
                  value={leadFilters.agentId}
                  onChange={(e) => setLeadFilters(prev => ({ ...prev, agentId: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">All Agents</option>
                  {agents.map(agent => (
                    <option key={agent._id} value={agent._id}>{agent.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                <button
                  onClick={() => setLeadFilters({ status: '', agentId: '' })}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md text-sm hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>

          {/* Leads Table */}
          {leadsLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
                <span className="text-gray-600 font-medium">Loading leads...</span>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">#</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Created</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Name</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Phone</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Location</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Agent</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Status</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {leads.map((lead, index) => (
                      <tr key={lead._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {((leadsPage - 1) * 10) + index + 1}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="flex items-center">
                            <div className="w-2 h-2 bg-orange-400 rounded-full mr-3"></div>
                            {new Date(lead.createdAt).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {editingLead && editingLead._id === lead._id ? (
                            <input
                              value={editingLead.name}
                              onChange={(e) => setEditingLead({...editingLead, name: e.target.value})}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                            />
                          ) : (
                            <div className="text-sm font-medium text-gray-900">{lead.name}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {editingLead && editingLead._id === lead._id ? (
                            <input
                              value={editingLead.phone}
                              onChange={(e) => setEditingLead({...editingLead, phone: e.target.value})}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                            />
                          ) : (
                            <div className="text-sm text-gray-900">{lead.phone}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {editingLead && editingLead._id === lead._id ? (
                            <input
                              value={editingLead.location || ''}
                              onChange={(e) => setEditingLead({...editingLead, location: e.target.value})}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                            />
                          ) : (
                            <div className="text-sm text-gray-900">{lead.location || 'N/A'}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {lead.agent?.name || 'N/A'}
                            {lead.agent?.email && (
                              <div className="text-xs text-gray-500">{lead.agent.email}</div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {editingLead && editingLead._id === lead._id ? (
                            <select
                              value={editingLead.status}
                              onChange={(e) => setEditingLead({...editingLead, status: e.target.value})}
                              className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                            >
                              <option>New</option>
                              <option>Contacted</option>
                              <option>Interested</option>
                              <option>Shortlisted</option>
                              <option>Converted</option>
                              <option>Discarded</option>
                            </select>
                          ) : (
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(lead.status)}`}>
                              {lead.status}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {editingLead && editingLead._id === lead._id ? (
                            <div className="flex space-x-2">
                              <button
                                onClick={updateLead}
                                className="inline-flex items-center px-2 py-1 text-xs font-medium rounded text-white bg-green-600 hover:bg-green-700"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => setEditingLead(null)}
                                className="inline-flex items-center px-2 py-1 text-xs font-medium rounded text-gray-700 bg-gray-200 hover:bg-gray-300"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <div className="flex space-x-2">
                              <button
                                onClick={() => setEditingLead(lead)}
                                className="inline-flex items-center px-2 py-1 text-xs font-medium rounded text-white bg-blue-600 hover:bg-blue-700"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => deleteLead(lead._id)}
                                className="inline-flex items-center px-2 py-1 text-xs font-medium rounded text-white bg-red-600 hover:bg-red-700"
                              >
                                Delete
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <button
                      disabled={leadsPage <= 1}
                      onClick={() => setLeadsPage(leadsPage - 1)}
                      className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    
                    <div className="flex items-center space-x-1">
                      {Array.from({ length: Math.min(5, Math.ceil(leadsTotal / 10)) }, (_, i) => {
                        const pageNum = i + 1;
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setLeadsPage(pageNum)}
                            className={`px-3 py-2 text-sm font-medium rounded-md ${
                              pageNum === leadsPage
                                ? 'bg-orange-600 text-white'
                                : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>
                    
                    <button
                      disabled={leadsPage >= Math.ceil(leadsTotal / 10)}
                      onClick={() => setLeadsPage(leadsPage + 1)}
                      className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-700">
                      Showing {((leadsPage - 1) * 10) + 1} to {Math.min(leadsPage * 10, leadsTotal)} of {leadsTotal} results
                    </span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-700">Page</span>
                      <span className="px-2 py-1 text-sm font-medium text-gray-900 bg-gray-100 rounded">
                        {leadsPage} of {Math.ceil(leadsTotal / 10)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>
        )}

        {/* CRM Dashboard */}
        {activeTab === 'crm-dashboard' && (
        <section id="crm-dashboard">
          <div className="bg-gradient-to-r from-purple-50 to-violet-50 border-b border-purple-200 px-6 py-4 mb-6 rounded-lg">
            <h2 className="text-xl font-semibold text-purple-700 mb-2">CRM Analytics Dashboard</h2>
            <p className="text-sm text-gray-600">Monitor agent performance, leads conversion, and earnings</p>
          </div>

          {/* Filters */}
          <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
            <div className="flex flex-wrap gap-4 items-end">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Filter Date</label>
                <input
                  type="date"
                  value={crmFilters.date}
                  onChange={(e) => setCrmFilters(prev => ({ ...prev, date: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Agent</label>
                <select
                  value={crmFilters.agentId}
                  onChange={(e) => setCrmFilters(prev => ({ ...prev, agentId: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">All Agents</option>
                  {agents.map(agent => (
                    <option key={agent._id} value={agent._id}>{agent.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <button
                  onClick={() => setCrmFilters({ date: new Date().toISOString().split('T')[0], agentId: '' })}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md text-sm hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Reset to Today
                </button>
              </div>
              <div>
                <button
                  onClick={fetchCrmDashboard}
                  className="px-4 py-2 bg-purple-600 text-white rounded-md text-sm hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  Refresh Data
                </button>
              </div>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-blue-400">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">Total Agents</p>
                  <p className="text-2xl font-bold text-gray-900">{crmDashboard.length}</p>
                </div>
                <div className="p-3bg-blue-100 rounded-full">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-green-400">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">Total Leads</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {crmDashboard.reduce((sum, agent) => sum + agent.totalLeads, 0)}
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-purple-400">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">Total Calls</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {crmDashboard.reduce((sum, agent) => sum + agent.calls, 0)}
                  </p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-yellow-400">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ₹{crmDashboard.reduce((sum, agent) => sum + agent.earnings, 0)}
                  </p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-full">
                  <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Agents Performance Table */}
          {crmLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                <span className="text-gray-600 font-medium">Loading performance data...</span>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Agent Performance Overview</h3>
                <p className="text-sm text-gray-600 mt-1">Individual agent metrics and conversion rates</p>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">#</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Agent</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Total Leads</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Shortlisted</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Converted</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Calls Made</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Conversion Rate</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Earnings (₹)</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Performance</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {crmDashboard
                      .filter(agent => !crmFilters.agentId || agent.agent?.id === crmFilters.agentId)
                      .sort((a, b) => b.converted - a.converted)
                      .map((agent, index) => {
                        const conversionRate = agent.totalLeads > 0 ? ((agent.converted / agent.totalLeads) * 100).toFixed(1) : '0.0';
                        const callsPerLead = agent.totalLeads > 0 ? (agent.calls / agent.totalLeads).toFixed(1) : '0.0';
                        
                        return (
                          <tr key={agent.agent?.id || index} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              <div className="flex items-center">
                                <div className={`w-3 h-3 rounded-full mr-3 ${
                                  index === 0 ? 'bg-yellow-400' : 
                                  index === 1 ? 'bg-gray-400' : 
                                  index === 2 ? 'bg-orange-400' : 'bg-blue-400'
                                }`}></div>
                                {index + 1}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10">
                                  <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                                    <span className="text-sm font-medium text-purple-700">
                                      {agent.agent?.name?.charAt(0) || 'N'}
                                    </span>
                                  </div>
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">
                                    {agent.agent?.name || 'Unknown Agent'}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {agent.agent?.email || 'No email'}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {agent.totalLeads}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                {agent.shortlisted}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                {agent.converted}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{agent.calls}</div>
                              <div className="text-xs text-gray-500">{callsPerLead} per lead</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-1">
                                  <div className={`text-sm font-medium ${
                                    parseFloat(conversionRate) >= 20 ? 'text-green-600' :
                                    parseFloat(conversionRate) >= 10 ? 'text-yellow-600' :
                                    'text-red-600'
                                  }`}>
                                    {conversionRate}%
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                                    <div 
                                      className={`h-2 rounded-full ${
                                        parseFloat(conversionRate) >= 20 ? 'bg-green-600' :
                                        parseFloat(conversionRate) >= 10 ? 'bg-yellow-600' :
                                        'bg-red-600'
                                      }`}
                                      style={{ width: `${Math.min(parseFloat(conversionRate), 100)}%` }}
                                    ></div>
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              <span className="font-medium">₹{agent.earnings}</span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {parseFloat(conversionRate) >= 20 ? (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  Excellent
                                </span>
                              ) : parseFloat(conversionRate) >= 10 ? (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                  Good
                                </span>
                              ) : parseFloat(conversionRate) >= 5 ? (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                  Average
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                  Needs Improvement
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>

              {crmDashboard.length === 0 && (
                <div className="px-6 py-12 text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No performance data</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    No agent performance data available for the selected filters.
                  </p>
                </div>
              )}
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