import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { formatJobId } from '../../utils/jobIdGenerator';

const LeadsManagement = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalLeads, setTotalLeads] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedLeads, setSelectedLeads] = useState([]);
  const [editingLead, setEditingLead] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [agents, setAgents] = useState([]);
  
  // Filters
  const [filters, setFilters] = useState({
    status: '',
    agent: '',
    search: '',
    dateRange: ''
  });

  const [stats, setStats] = useState({
    total: 0,
    new: 0,
    contacted: 0,
    interested: 0,
    converted: 0,
    discarded: 0
  });

  const limit = 10;

  useEffect(() => {
    fetchLeads();
    fetchJobs();
    fetchAgents();
    fetchStats();
  }, [currentPage, filters]);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.ozarx.in/api';
      
      const params = {
        page: currentPage,
        limit,
        ...filters
      };

      const response = await axios.get(`${API_BASE_URL}/crm/leads`, {
        headers: { 'Authorization': `Bearer ${token}` },
        params
      });

      if (response.data.success) {
        setLeads(response.data.data);
        setTotalLeads(response.data.total);
      }
    } catch (error) {
      console.error('Error fetching leads:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchJobs = async () => {
    try {
      const token = localStorage.getItem('token');
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.ozarx.in/api';
      
      const response = await axios.get(`${API_BASE_URL}/jobs`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.data.success) {
        setJobs(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
    }
  };

  const fetchAgents = async () => {
    try {
      const token = localStorage.getItem('token');
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.ozarx.in/api';
      
      const response = await axios.get(`${API_BASE_URL}/users?role=agent`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.data.success) {
        setAgents(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching agents:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.ozarx.in/api';
      
      const response = await axios.get(`${API_BASE_URL}/crm/leads/stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching lead stats:', error);
    }
  };

  const updateLeadStatus = async (leadId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.ozarx.in/api';
      
      await axios.put(`${API_BASE_URL}/crm/leads/${leadId}`, 
        { status: newStatus },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      fetchLeads();
      fetchStats();
    } catch (error) {
      console.error('Error updating lead status:', error);
    }
  };

  const bulkUpdateStatus = async (status) => {
    if (selectedLeads.length === 0) return;
    
    try {
      const token = localStorage.getItem('token');
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.ozarx.in/api';
      
      await axios.put(`${API_BASE_URL}/crm/leads/bulk-update`, 
        { leadIds: selectedLeads, status },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      setSelectedLeads([]);
      fetchLeads();
      fetchStats();
    } catch (error) {
      console.error('Error bulk updating leads:', error);
    }
  };

  const deleteLead = async (leadId) => {
    if (!window.confirm('Are you sure you want to delete this lead?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.ozarx.in/api';
      
      await axios.delete(`${API_BASE_URL}/crm/leads/${leadId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      fetchLeads();
      fetchStats();
    } catch (error) {
      console.error('Error deleting lead:', error);
    }
  };

  const handleEditLead = (lead) => {
    setEditingLead(lead);
    setShowEditModal(true);
  };

  const handleSaveLead = async (leadData) => {
    try {
      const token = localStorage.getItem('token');
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.ozarx.in/api';
      
      await axios.put(`${API_BASE_URL}/crm/leads/${editingLead._id}`, 
        leadData,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      setShowEditModal(false);
      setEditingLead(null);
      fetchLeads();
      fetchStats();
    } catch (error) {
      console.error('Error saving lead:', error);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'New': 'bg-blue-100 text-blue-800',
      'Contacted': 'bg-yellow-100 text-yellow-800',
      'Interested': 'bg-green-100 text-green-800',
      'Shortlisted': 'bg-purple-100 text-purple-800',
      'Email Collected': 'bg-indigo-100 text-indigo-800',
      'Pre-User': 'bg-orange-100 text-orange-800',
      'User-Created': 'bg-teal-100 text-teal-800',
      'Converted': 'bg-emerald-100 text-emerald-800',
      'Discarded': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const handleSelectLead = (leadId) => {
    setSelectedLeads(prev => 
      prev.includes(leadId) 
        ? prev.filter(id => id !== leadId)
        : [...prev, leadId]
    );
  };

  const handleSelectAll = () => {
    if (selectedLeads.length === leads.length) {
      setSelectedLeads([]);
    } else {
      setSelectedLeads(leads.map(lead => lead._id));
    }
  };

  const totalPages = Math.ceil(totalLeads / limit);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Leads Management</h2>
          <p className="text-gray-600">Manage and track leads from CRM created by agents</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => bulkUpdateStatus('Contacted')}
            disabled={selectedLeads.length === 0}
            className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Mark as Contacted
          </button>
          <button
            onClick={() => bulkUpdateStatus('Interested')}
            disabled={selectedLeads.length === 0}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Mark as Interested
          </button>
          <button
            onClick={() => bulkUpdateStatus('Converted')}
            disabled={selectedLeads.length === 0}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Mark as Converted
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          <div className="text-sm text-gray-600">Total Leads</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-blue-600">{stats.new}</div>
          <div className="text-sm text-gray-600">New</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-yellow-600">{stats.contacted}</div>
          <div className="text-sm text-gray-600">Contacted</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-green-600">{stats.interested}</div>
          <div className="text-sm text-gray-600">Interested</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-emerald-600">{stats.converted}</div>
          <div className="text-sm text-gray-600">Converted</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-red-600">{stats.discarded}</div>
          <div className="text-sm text-gray-600">Discarded</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input
              type="text"
              placeholder="Search leads..."
              value={filters.search}
              onChange={(e) => setFilters({...filters, search: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="New">New</option>
              <option value="Contacted">Contacted</option>
              <option value="Interested">Interested</option>
              <option value="Shortlisted">Shortlisted</option>
              <option value="Email Collected">Email Collected</option>
              <option value="Pre-User">Pre-User</option>
              <option value="User-Created">User-Created</option>
              <option value="Converted">Converted</option>
              <option value="Discarded">Discarded</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Agent</label>
            <select
              value={filters.agent}
              onChange={(e) => setFilters({...filters, agent: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Agents</option>
              {agents.map(agent => (
                <option key={agent._id} value={agent._id}>
                  {agent.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
            <select
              value={filters.dateRange}
              onChange={(e) => setFilters({...filters, dateRange: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Leads ({totalLeads})</h3>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={selectedLeads.length === leads.length && leads.length > 0}
                onChange={handleSelectAll}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-600">Select All</span>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Loading leads...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <input type="checkbox" className="rounded border-gray-300" />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Lead
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assigned Job
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Agent
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {leads.map((lead) => (
                  <tr key={lead._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedLeads.includes(lead._id)}
                        onChange={() => handleSelectLead(lead._id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{lead.name}</div>
                        <div className="text-sm text-gray-500">{lead.location}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm text-gray-900">{lead.phone}</div>
                        {lead.email && (
                          <div className="text-sm text-gray-500">{lead.email}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={lead.status}
                        onChange={(e) => updateLeadStatus(lead._id, e.target.value)}
                        className={`text-xs font-semibold px-2 py-1 rounded-full border-0 focus:ring-2 focus:ring-blue-500 ${getStatusColor(lead.status)}`}
                      >
                        <option value="New">New</option>
                        <option value="Contacted">Contacted</option>
                        <option value="Interested">Interested</option>
                        <option value="Shortlisted">Shortlisted</option>
                        <option value="Email Collected">Email Collected</option>
                        <option value="Pre-User">Pre-User</option>
                        <option value="User-Created">User-Created</option>
                        <option value="Converted">Converted</option>
                        <option value="Discarded">Discarded</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {lead.jobTitle ? (
                        <div>
                          <div className="text-sm font-medium text-gray-900">{lead.jobTitle}</div>
                          <div className="text-xs text-gray-500">{formatJobId(lead.jobId)}</div>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">Not assigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {lead.agentName || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(lead.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditLead(lead)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteLead(lead._id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {((currentPage - 1) * limit) + 1} to {Math.min(currentPage * limit, totalLeads)} of {totalLeads} results
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="px-3 py-1 text-sm text-gray-700">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {showEditModal && editingLead && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Edit Lead</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-600 text-xl"
              >
                ×
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              const leadData = {
                name: formData.get('name'),
                phone: formData.get('phone'),
                location: formData.get('location'),
                email: formData.get('email'),
                status: formData.get('status'),
                jobId: formData.get('jobId')
              };
              handleSaveLead(leadData);
            }} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input
                  type="text"
                  name="name"
                  defaultValue={editingLead.name}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                <input
                  type="tel"
                  name="phone"
                  defaultValue={editingLead.phone}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input
                  type="text"
                  name="location"
                  defaultValue={editingLead.location}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  defaultValue={editingLead.email}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  name="status"
                  defaultValue={editingLead.status}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="New">New</option>
                  <option value="Contacted">Contacted</option>
                  <option value="Interested">Interested</option>
                  <option value="Shortlisted">Shortlisted</option>
                  <option value="Email Collected">Email Collected</option>
                  <option value="Pre-User">Pre-User</option>
                  <option value="User-Created">User-Created</option>
                  <option value="Converted">Converted</option>
                  <option value="Discarded">Discarded</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assign Job</label>
                <select
                  name="jobId"
                  defaultValue={editingLead.jobId}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a job (optional)</option>
                  {jobs.map(job => (
                    <option key={job._id} value={job._id}>
                      {job.title} - {job.company} [{formatJobId(job._id)}]
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeadsManagement;
