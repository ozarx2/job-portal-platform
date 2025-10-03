import React, { useState, useEffect } from "react";
import axios from "axios";
import ImportLeads from "./ImportLeads";
import CompanyDebugger from "./CompanyDebugger";
import LeadConversion from "./LeadConversion";
import LeadEditModal from "./LeadEditModal";
import { formatJobId } from "../utils/jobIdGenerator";


export default function LeadsTable() {
  const [leads, setLeads] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [convertingLead, setConvertingLead] = useState(null);
  const [conversionModalOpen, setConversionModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);

  const limit = 10;

  // Fetch leads
  const fetchLeads = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found');
        return;
      }

      const res = await axios.get(
        `https://api.ozarx.in/api/crm/leads?page=${page}&limit=${limit}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      if (res.data.success) {
        setLeads(res.data.data);
        setTotal(res.data.total);
      }
    } catch (err) {
      console.error("Error fetching leads:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch jobs for dropdown
  const fetchJobs = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      console.log('Fetching jobs...');

      // Fetch jobs
      const jobsRes = await axios.get('https://api.ozarx.in/api/jobs', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log('Jobs response:', jobsRes.data);
      setJobs(jobsRes.data.data || []);
      console.log('Jobs loaded:', jobsRes.data?.data?.length || 0);
    } catch (err) {
      console.error("Error fetching jobs:", err);
    }
  };

  useEffect(() => {
    fetchLeads();
    fetchJobs();
  }, [page]);

  // Delete lead
  const deleteLead = async (id) => {
    if (!window.confirm("Are you sure you want to delete this lead?")) return;
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found');
        return;
      }

      await axios.delete(`https://api.ozarx.in/api/crm/leads/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      fetchLeads();
    } catch (err) {
      console.error("Error deleting lead:", err);
    }
  };

  // Save edits
  const saveEdit = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found');
        return;
      }

      // Show loading state
      const saveButton = document.querySelector(`[data-lead-id="${editingLead?._id}"] .save-button`);
      if (saveButton) {
        saveButton.disabled = true;
        saveButton.textContent = 'Saving...';
        saveButton.className = saveButton.className.replace('bg-green-600', 'bg-gray-400');
      }

      // Prepare the lead data with job information only
      const selectedJob = jobs.find(j => j._id === editingLead.jobId);
      
      const leadData = {
        ...editingLead,
        // Ensure job name is properly set
        jobTitle: editingLead.jobTitle || selectedJob?.title || '',
        // Include the job ID for reference
        jobId: editingLead.jobId || '',
        // Update the status to reflect the assignment
        status: editingLead.status,
        // Add timestamp for tracking
        updatedAt: new Date().toISOString()
      };

      console.log('Saving lead data:', leadData);
      console.log('Job ID:', editingLead.jobId);
      console.log('Job Title:', editingLead.jobTitle);

      const response = await axios.put(
        `https://api.ozarx.in/api/crm/leads/${editingLead?._id}`,
        leadData,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      console.log('Save response:', response.data);
      
      // Verify the data was saved correctly
      if (response.data.success) {
        console.log('✅ Lead updated successfully in database');
        console.log('Updated lead data:', response.data.data);
        
        // Check if job data is present in the response
        if (response.data.data.jobTitle) {
          console.log('✅ Job data confirmed in database');
          
          // Show success notification
          const notification = document.createElement('div');
          notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50';
          notification.textContent = '✅ Job assigned successfully!';
          document.body.appendChild(notification);
          
          setTimeout(() => {
            notification.remove();
          }, 3000);
        } else {
          console.log('⚠️ Job data may not be saved correctly');
          
          // Show warning notification
          const notification = document.createElement('div');
          notification.className = 'fixed top-4 right-4 bg-yellow-500 text-white px-4 py-2 rounded shadow-lg z-50';
          notification.textContent = '⚠️ Job assignment may not be saved correctly';
          document.body.appendChild(notification);
          
          setTimeout(() => {
            notification.remove();
          }, 3000);
        }
      } else {
        console.log('❌ Failed to update lead in database');
        console.log('Error:', response.data.message);
        
        // Show error notification
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded shadow-lg z-50';
        notification.textContent = '❌ Failed to save job assignment';
        document.body.appendChild(notification);
        
        setTimeout(() => {
          notification.remove();
        }, 3000);
      }
      
      setEditingLead(null);
      
      // Force refresh of leads data
      console.log('Refreshing leads data...');
      await fetchLeads();
      
      // Also refresh the leads array to ensure UI updates
      setLeads(prevLeads => 
        prevLeads.map(lead => 
          lead._id === editingLead?._id 
            ? { ...lead, ...leadData }
            : lead
        )
      );
      
      // Restore save button state
      if (saveButton) {
        saveButton.disabled = false;
        saveButton.textContent = 'Save';
        saveButton.className = saveButton.className.replace('bg-gray-400', 'bg-green-600');
      }
    } catch (err) {
      console.error("Error updating lead:", err);
      
      // Restore save button state on error
      if (saveButton) {
        saveButton.disabled = false;
        saveButton.textContent = 'Save';
        saveButton.className = saveButton.className.replace('bg-gray-400', 'bg-green-600');
      }
    }
  };

  const handleStatusUpdate = async (leadId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found');
        return;
      }

      await axios.put(
        `https://api.ozarx.in/api/crm/leads/${leadId}`,
        { status: newStatus },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // Update local state
      setLeads(leads.map(lead => 
        lead._id === leadId ? { ...lead, status: newStatus } : lead
      ));
    } catch (err) {
      console.error('Error updating lead status:', err);
    }
  };

  const handleConversionStart = (lead) => {
    setConvertingLead(lead);
    setConversionModalOpen(true);
  };

  const handleConversionComplete = (convertedLead) => {
    // Update the lead in the local state
    setLeads(leads.map(lead => 
      lead._id === convertedLead?.leadId ? { ...lead, ...convertedLead } : lead
    ));
    setConversionModalOpen(false);
    setConvertingLead(null);
  };

  const getStatusColor = (status) => {
    const statusColors = {
      'New': 'bg-gray-100 text-gray-800',
      'Contacted': 'bg-blue-100 text-blue-800',
      'Interested': 'bg-indigo-100 text-indigo-800',
      'Shortlisted': 'bg-green-100 text-green-800',
      'Email Collected': 'bg-yellow-100 text-yellow-800',
      'Pre-User': 'bg-purple-100 text-purple-800',
      'User-Created': 'bg-emerald-100 text-emerald-800'
    };
    return statusColors[status] || 'bg-gray-100 text-gray-800';
  };

  const getAvailableActions = (status) => {
    const actions = {
      'New': ['Contacted'],
      'Contacted': ['Interested', 'New'],
      'Interested': ['Shortlisted', 'Contacted'],
      'Shortlisted': ['Email Collected'],
      'Email Collected': ['Convert to Pre-User'],
      'Pre-User': ['User-Created'],
      'User-Created': []
    };
    return actions[status] || [];
  };

  const handleEditLead = (lead) => {
    setEditingLead(lead);
    setEditModalOpen(true);
  };

  const handleSaveLead = async (formData) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found');
        return;
      }

      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://api.ozarx.in/api";
      
      const response = await axios.put(
        `${API_BASE_URL}/crm/leads/${editingLead._id}`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        // Update the lead in local state
        setLeads(leads.map(lead => 
          lead._id === editingLead._id ? { ...lead, ...formData } : lead
        ));
        
        // Show success message
        alert('Lead updated successfully!');
      }
    } catch (error) {
      console.error('Error updating lead:', error);
      alert('Error updating lead. Please try again.');
    }
  };

  const handleCloseEditModal = () => {
    setEditModalOpen(false);
    setEditingLead(null);
  };

  return (
    <div className="p-0">
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-purple-200 px-6 py-4">
        <h2 className="text-xl font-bold text-gray-800">
          Leads ({total})
        </h2>
        <p className="text-sm text-gray-600 mt-1">Manage and track your lead pipeline</p>
        
        {/* Debug Information */}
        <div className="mt-2 text-xs text-gray-500">
          <div>Jobs loaded: {jobs?.length || 0}</div>
          {(jobs?.length || 0) > 0 && (
            <div>Available jobs: {(jobs || []).map(j => j?.title || 'N/A').join(', ')}</div>
          )}
        </div>
        
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <span className="text-gray-600 font-medium">Loading leads...</span>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
        <thead>
          <tr className="bg-gradient-to-r from-gray-50 to-gray-100">
            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">Created Date</th>
            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">Name</th>
            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">Phone</th>
            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">Location</th>
            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">Status</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">Job Assignment</th>
            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {leads.map((lead, index) => (
            <tr key={lead?._id || index} className={`hover:bg-gray-50 transition-colors duration-150 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                  {lead?.createdAt ? new Date(lead.createdAt).toLocaleDateString() : 'N/A'}
                </div>
              </td>

              {/* Name */}
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">{lead?.name || 'N/A'}</div>
              </td>
              
              {/* Phone */}
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{lead?.phone || 'N/A'}</div>
              </td>
              
              {/* Location */}
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{lead?.location || 'N/A'}</div>
              </td>
              
              {/* Status */}
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(lead?.status)}`}>
                  {lead?.status || 'Unknown'}
                </span>
              </td>

              {/* Job Assignment */}
              <td className="px-6 py-4 whitespace-nowrap">
                {lead?.jobTitle ? (
                  <div className="text-sm">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-gray-700 font-medium">{lead.jobTitle}</span>
                    </div>
                    {lead?.jobId && (
                      <div className="text-xs text-gray-500 mt-1">
                        ID: {formatJobId(lead.jobId)}
                      </div>
                    )}
                  </div>
                ) : (
                  <span className="text-gray-400 italic text-sm">Not assigned</span>
                )}
              </td>

              {/* Actions */}
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div className="flex space-x-2">
                  <button
                    className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                    onClick={() => handleEditLead(lead)}
                  >
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit
                  </button>
                  
                  <button
                    className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
                    onClick={() => deleteLead(lead?._id)}
                  >
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
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

      {/* Enhanced Pagination */}
      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <button
            disabled={page <= 1}
            className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => setPage(page - 1)}
          >
            Previous
          </button>
          
          {/* Page Numbers */}
          <div className="flex items-center space-x-1">
            {Array.from({ length: Math.min(5, Math.ceil(total / limit)) }, (_, i) => {
              const pageNum = i + 1;
              const isCurrentPage = pageNum === page;
              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`px-3 py-2 text-sm font-medium rounded-md ${
                    isCurrentPage
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>
          
          <button
            disabled={page >= Math.ceil(total / limit)}
            className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => setPage(page + 1)}
          >
            Next
          </button>
        </div>
        
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-700">
            Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, total)} of {total} results
          </span>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-700">Page</span>
            <span className="px-2 py-1 text-sm font-medium text-gray-900 bg-gray-100 rounded">
              {page} of {Math.ceil(total / limit)}
            </span>
          </div>
        </div>
      </div>

      {/* Lead Conversion Modal */}
      <LeadConversion
        lead={convertingLead}
        open={conversionModalOpen}
        onClose={() => {
          setConversionModalOpen(false);
          setConvertingLead(null);
        }}
        onConversion={handleConversionComplete}
      />

      {/* Lead Edit Modal */}
      <LeadEditModal
        lead={editingLead}
        isOpen={editModalOpen}
        onClose={handleCloseEditModal}
        onSave={handleSaveLead}
        jobs={jobs}
      />
    </div>
  );
}
