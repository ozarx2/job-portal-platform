import React, { useState, useEffect } from "react";
import axios from "axios";
import ImportLeads from "./ImportLeads";
import CompanyDebugger from "./CompanyDebugger";


export default function LeadsTable() {
  const [leads, setLeads] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [editingLead, setEditingLead] = useState(null);
  const [loading, setLoading] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [companies, setCompanies] = useState([]);

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

  // Fetch jobs and companies for dropdown
  const fetchJobsAndCompanies = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      console.log('Fetching jobs and companies...');

      // Fetch jobs
      const jobsRes = await axios.get('https://api.ozarx.in/api/jobs', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log('Jobs response:', jobsRes.data);
      setJobs(jobsRes.data || []);

      // Try to fetch companies from multiple possible endpoints
      let companiesData = [];
      try {
        // Try the companies endpoint first
        const companiesRes = await axios.get('https://api.ozarx.in/api/companies', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        companiesData = companiesRes.data || [];
        console.log('Companies from /api/companies:', companiesData);
      } catch (companiesError) {
        console.log('Companies endpoint failed, trying alternative approaches...');
        
        try {
          // Try to get companies from jobs data (extract unique companies from jobs)
          const jobsData = jobsRes.data || [];
          const uniqueCompanies = [];
          const companyMap = new Map();
          
          jobsData.forEach(job => {
            if (job.company && job.company.name) {
              if (!companyMap.has(job.company._id)) {
                companyMap.set(job.company._id, {
                  _id: job.company._id,
                  name: job.company.name
                });
              }
            }
          });
          
          companiesData = Array.from(companyMap.values());
          console.log('Companies extracted from jobs:', companiesData);
        } catch (extractError) {
          console.log('Could not extract companies from jobs:', extractError);
          
          // Create some default companies as fallback
          companiesData = [
            { _id: 'company1', name: 'Tech Corp' },
            { _id: 'company2', name: 'Finance Ltd' },
            { _id: 'company3', name: 'Healthcare Inc' },
            { _id: 'company4', name: 'Education Group' },
            { _id: 'company5', name: 'Manufacturing Co' }
          ];
          console.log('Using default companies:', companiesData);
        }
      }

      setCompanies(companiesData);
      console.log('Final companies data:', companiesData);
    } catch (err) {
      console.error("Error fetching jobs and companies:", err);
      
      // Set default companies as fallback
      const defaultCompanies = [
        { _id: 'company1', name: 'Tech Corp' },
        { _id: 'company2', name: 'Finance Ltd' },
        { _id: 'company3', name: 'Healthcare Inc' },
        { _id: 'company4', name: 'Education Group' },
        { _id: 'company5', name: 'Manufacturing Co' }
      ];
      setCompanies(defaultCompanies);
    }
  };

  useEffect(() => {
    fetchLeads();
    fetchJobsAndCompanies();
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
      const saveButton = document.querySelector(`[data-lead-id="${editingLead._id}"] .save-button`);
      if (saveButton) {
        saveButton.disabled = true;
        saveButton.textContent = 'Saving...';
        saveButton.className = saveButton.className.replace('bg-green-600', 'bg-gray-400');
      }

      // Prepare the lead data with company and job information
      const selectedCompany = companies.find(c => c._id === editingLead.companyId);
      const selectedJob = jobs.find(j => j._id === editingLead.jobId);
      
      const leadData = {
        ...editingLead,
        // Ensure company and job names are properly set
        companyName: editingLead.companyName || selectedCompany?.name || '',
        jobTitle: editingLead.jobTitle || selectedJob?.title || '',
        // Also include the IDs for reference
        companyId: editingLead.companyId || '',
        jobId: editingLead.jobId || '',
        // Update the status to reflect the assignment
        status: editingLead.status,
        // Add timestamp for tracking
        updatedAt: new Date().toISOString()
      };

      console.log('Saving lead data:', leadData);
      console.log('Company ID:', editingLead.companyId);
      console.log('Company Name:', editingLead.companyName);
      console.log('Job ID:', editingLead.jobId);
      console.log('Job Title:', editingLead.jobTitle);

      const response = await axios.put(
        `https://api.ozarx.in/api/crm/leads/${editingLead._id}`,
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
        
        // Check if company/job data is present in the response
        if (response.data.data.companyName || response.data.data.jobTitle) {
          console.log('✅ Company/Job data confirmed in database');
          
          // Show success notification
          const notification = document.createElement('div');
          notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50';
          notification.textContent = '✅ Company and Job assigned successfully!';
          document.body.appendChild(notification);
          
          setTimeout(() => {
            notification.remove();
          }, 3000);
        } else {
          console.log('⚠️ Company/Job data may not be saved correctly');
          
          // Show warning notification
          const notification = document.createElement('div');
          notification.className = 'fixed top-4 right-4 bg-yellow-500 text-white px-4 py-2 rounded shadow-lg z-50';
          notification.textContent = '⚠️ Assignment may not be saved correctly';
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
        notification.textContent = '❌ Failed to save assignment';
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
          lead._id === editingLead._id 
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

  return (
    <div className="p-0">
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-purple-200 px-6 py-4">
        <h2 className="text-xl font-bold text-gray-800">
          Leads ({total})
        </h2>
        <p className="text-sm text-gray-600 mt-1">Manage and track your lead pipeline</p>
        
        {/* Debug Information */}
        <div className="mt-2 text-xs text-gray-500">
          <div>Companies loaded: {companies.length}</div>
          <div>Jobs loaded: {jobs.length}</div>
          {companies.length > 0 && (
            <div>Available companies: {companies.map(c => c.name).join(', ')}</div>
          )}
          <button 
            onClick={() => {
              const testCompanies = [
                { _id: 'test1', name: 'Test Company 1' },
                { _id: 'test2', name: 'Test Company 2' },
                { _id: 'test3', name: 'Test Company 3' }
              ];
              setCompanies(testCompanies);
              console.log('Added test companies:', testCompanies);
            }}
            className="mt-1 px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
          >
            Add Test Companies
          </button>
        </div>
        
        {/* Company Debugger */}
        <div className="mt-4">
          <CompanyDebugger />
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
            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">Company/Job</th>
            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {leads.map((lead, index) => (
            <tr key={lead._id} className={`hover:bg-gray-50 transition-colors duration-150 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                  {new Date(lead.createdAt).toLocaleDateString()}
                </div>
              </td>

              {/* Name */}
              <td className="px-6 py-4 whitespace-nowrap">
                {editingLead && editingLead._id === lead._id ? (
                  <input
                    value={editingLead.name}
                    onChange={(e) =>
                      setEditingLead({ ...editingLead, name: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <div className="text-sm font-medium text-gray-900">{lead.name}</div>
                )}
              </td>
              
              {/* Phone */}
              <td className="px-6 py-4 whitespace-nowrap">
                {editingLead && editingLead._id === lead._id ? (
                  <input
                    value={editingLead.phone}
                    onChange={(e) =>
                      setEditingLead({ ...editingLead, phone: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <div className="text-sm text-gray-900">{lead.phone}</div>
                )}
              </td>
              
              {/* Location */}
              <td className="px-6 py-4 whitespace-nowrap">
                {editingLead && editingLead._id === lead._id ? (
                  <input
                    value={editingLead.location}
                    onChange={(e) =>
                      setEditingLead({ ...editingLead, location: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <div className="text-sm text-gray-900">{lead.location || 'N/A'}</div>
                )}
              </td>
              
              {/* Status */}
              <td className="px-6 py-4 whitespace-nowrap">
                {editingLead && editingLead._id === lead._id ? (
                  <select
                    value={editingLead.status}
                    onChange={(e) =>
                      setEditingLead({ ...editingLead, status: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option>New</option>
                    <option>Contacted</option>
                    <option>Interested</option>
                    <option>Shortlisted</option>
                    <option>Converted</option>
                    <option>Discarded</option>
                  </select>
                ) : (
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    lead.status === 'New' ? 'bg-blue-100 text-blue-800' :
                    lead.status === 'Contacted' ? 'bg-yellow-100 text-yellow-800' :
                    lead.status === 'Interested' ? 'bg-green-100 text-green-800' :
                    lead.status === 'Shortlisted' ? 'bg-purple-100 text-purple-800' :
                    lead.status === 'Converted' ? 'bg-emerald-100 text-emerald-800' :
                    lead.status === 'Discarded' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {lead.status}
                  </span>
                )}
              </td>

              {/* Company/Job Selection - Only visible when status is Shortlisted */}
              <td className="px-6 py-4 whitespace-nowrap">
                {(editingLead && editingLead._id === lead._id && editingLead.status === 'Shortlisted') || 
                 (lead.status === 'Shortlisted' && !editingLead) ? (
                  <div className="space-y-2">
                    {/* Company Selection */}
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">
                        <div className="flex items-center space-x-2">
                          <span>Company:</span>
                          {editingLead && editingLead._id === lead._id && editingLead.companyName && (
                            <span className="inline-flex items-center px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                              ✓ {editingLead.companyName}
                            </span>
                          )}
                        </div>
                      </label>
                      <select
                        value={editingLead?.companyId || lead.companyId || ''}
                        onChange={(e) => {
                          if (editingLead && editingLead._id === lead._id) {
                            console.log('Company selected:', e.target.value);
                            const selectedCompany = companies.find(c => c._id === e.target.value);
                            const updatedLead = { 
                              ...editingLead, 
                              companyId: e.target.value,
                              companyName: selectedCompany?.name || ''
                            };
                            console.log('Updated lead:', updatedLead);
                            setEditingLead(updatedLead);
                            
                            // Force re-render by updating the leads array
                            setLeads(prevLeads => 
                              prevLeads.map(l => 
                                l._id === lead._id ? { ...l, companyId: e.target.value, companyName: selectedCompany?.name || '' } : l
                              )
                            );
                            
                            // Add visual feedback with a brief highlight
                            const selectElement = e.target;
                            selectElement.style.backgroundColor = '#d1fae5';
                            setTimeout(() => {
                              selectElement.style.backgroundColor = '';
                            }, 500);
                          }
                        }}
                        className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        disabled={!editingLead || editingLead._id !== lead._id}
                      >
                        <option value="">Select Company</option>
                        {companies.length > 0 ? (
                          companies.map(company => (
                            <option key={company._id} value={company._id}>
                              {company.name}
                            </option>
                          ))
                        ) : (
                          <option disabled>No companies available</option>
                        )}
                      </select>
                      {companies.length === 0 && (
                        <div className="text-xs text-red-500 mt-1">
                          No companies found. Check console for details.
                        </div>
                      )}
                    </div>
                    
                    {/* Job Selection */}
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">
                        <div className="flex items-center space-x-2">
                          <span>Job:</span>
                          {editingLead && editingLead._id === lead._id && editingLead.jobTitle && (
                            <span className="inline-flex items-center px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                              ✓ {editingLead.jobTitle}
                            </span>
                          )}
                        </div>
                      </label>
                      <select
                        value={editingLead?.jobId || lead.jobId || ''}
                        onChange={(e) => {
                          if (editingLead && editingLead._id === lead._id) {
                            const selectedJob = jobs.find(j => j._id === e.target.value);
                            const updatedLead = { 
                              ...editingLead, 
                              jobId: e.target.value,
                              jobTitle: selectedJob?.title || ''
                            };
                            console.log('Updated job:', updatedLead);
                            setEditingLead(updatedLead);
                            
                            // Force re-render by updating the leads array
                            setLeads(prevLeads => 
                              prevLeads.map(l => 
                                l._id === lead._id ? { ...l, jobId: e.target.value, jobTitle: selectedJob?.title || '' } : l
                              )
                            );
                            
                            // Add visual feedback with a brief highlight
                            const selectElement = e.target;
                            selectElement.style.backgroundColor = '#dbeafe';
                            setTimeout(() => {
                              selectElement.style.backgroundColor = '';
                            }, 500);
                          }
                        }}
                        className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        disabled={!editingLead || editingLead._id !== lead._id}
                      >
                        <option value="">Select Job</option>
                        {jobs.map(job => (
                          <option key={job._id} value={job._id}>
                            {job.title} - {job.location}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                ) : lead.status === 'Shortlisted' ? (
                  <div className="text-sm space-y-1">
                    {(editingLead && editingLead._id === lead._id && editingLead.companyName) || lead.companyName ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-blue-600 font-medium">
                          {(editingLead && editingLead._id === lead._id) ? editingLead.companyName : lead.companyName}
                        </span>
                      </div>
                    ) : null}
                    {(editingLead && editingLead._id === lead._id && editingLead.jobTitle) || lead.jobTitle ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-gray-700">
                          {(editingLead && editingLead._id === lead._id) ? editingLead.jobTitle : lead.jobTitle}
                        </span>
                      </div>
                    ) : null}
                    {!((editingLead && editingLead._id === lead._id && editingLead.companyName) || lead.companyName) && 
                     !((editingLead && editingLead._id === lead._id && editingLead.jobTitle) || lead.jobTitle) && (
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                        <span className="text-gray-400 italic">Not assigned</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <span className="text-gray-400 italic">-</span>
                )}
              </td>

              {/* Actions */}
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                {editingLead && editingLead._id === lead._id ? (
                  <div className="flex space-x-2">
                    <button
                      className="save-button inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
                      onClick={saveEdit}
                      data-lead-id={editingLead._id}
                    >
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Save
                    </button>
                    <button
                      className="inline-flex items-center px-3 py-1 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200"
                      onClick={() => setEditingLead(null)}
                    >
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="flex space-x-2">
                    <button
                      className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                      onClick={() => setEditingLead(lead)}
                    >
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Edit
                    </button>
                    <button
                      className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
                      onClick={() => deleteLead(lead._id)}
                    >
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
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
    </div>
  );
}
