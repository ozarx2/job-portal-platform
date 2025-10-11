import React, { useState, useEffect } from 'react';
import apiService from '../services/apiService';

const JobEditForm = ({ job, mode, onSuccess, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [companies, setCompanies] = useState([]);
  const [loadingCompanies, setLoadingCompanies] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    salary: '',
    type: 'Full-time',
    companyId: '',
    status: 'active',
    deadline: ''
  });

  useEffect(() => {
    if (job && mode === 'edit') {
      setFormData({
        title: job.title || '',
        description: job.description || '',
        location: job.location || '',
        salary: job.salary || '',
        type: job.type || 'Full-time',
        companyId: job.companyId?._id || '',
        status: job.status || 'active',
        deadline: job.deadline || ''
      });
    }
  }, [job, mode]);

  useEffect(() => {
    const fetchCompanies = async () => {
      setLoadingCompanies(true);
      try {
        const response = await apiService.getUserCompanies();
        console.log('🏢 Companies response:', response.data);
        const companiesData = response.data.data || response.data; // Handle both formats
        console.log('🏢 Companies data:', companiesData);
        setCompanies(companiesData);
        
        // Set default company if none selected and companies available
        if (formData.companyId === '' && companiesData.length > 0) {
          setFormData(prev => ({
            ...prev,
            companyId: companiesData[0]._id
          }));
        }
      } catch (error) {
        console.error('Error fetching companies:', error);
      } finally {
        setLoadingCompanies(false);
      }
    };

    fetchCompanies();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === 'edit' && job) {
        await apiService.updateJob(job._id, formData);
      } else {
        await apiService.postJob(formData);
      }
      
      onSuccess();
    } catch (error) {
      console.error('Error saving job:', error);
      alert('Error saving job. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!job) return;
    
    const confirmed = window.confirm('Are you sure you want to delete this job? This action cannot be undone.');
    if (!confirmed) return;

    setLoading(true);
    try {
      await apiService.deleteJob(job._id);
      onSuccess();
    } catch (error) {
      console.error('Error deleting job:', error);
      alert('Error deleting job. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-white/20">
        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">
              {mode === 'edit' ? 'Edit Job' : 'Create New Job'}
            </h2>
            <button
              onClick={onCancel}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all duration-300"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Job Title */}
            <div className="bg-white/60 backdrop-blur-sm border border-white/30 p-8 rounded-2xl">
              <h3 className="text-lg font-bold text-gray-800 mb-6 tracking-wide">Job Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-800 mb-3 tracking-wide">
                    Job Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white/50 backdrop-blur-sm transition-all duration-300"
                    placeholder="e.g., Senior Frontend Developer"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-3 tracking-wide">
                    Job Type *
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white/50 backdrop-blur-sm transition-all duration-300"
                    required
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Internship">Internship</option>
                    <option value="Remote">Remote</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-3 tracking-wide">
                    Company *
                  </label>
                  <select
                    name="companyId"
                    value={formData.companyId}
                    onChange={handleInputChange}
                    disabled={loadingCompanies}
                    className="w-full px-4 py-3 border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white/50 backdrop-blur-sm transition-all duration-300 disabled:opacity-50"
                    required
                  >
                    {loadingCompanies ? (
                      <option value="">Loading companies...</option>
                    ) : companies.length > 0 ? (
                      companies.map(company => (
                        <option key={company._id} value={company._id}>
                          {company.name}
                        </option>
                      ))
                    ) : (
                      <option value="">No companies available</option>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-3 tracking-wide">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white/50 backdrop-blur-sm transition-all duration-300"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Location & Salary */}
            <div className="bg-white/60 backdrop-blur-sm border border-white/30 p-8 rounded-2xl">
              <h3 className="text-lg font-bold text-gray-800 mb-6 tracking-wide">Location & Compensation</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-3 tracking-wide">
                    Location *
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white/50 backdrop-blur-sm transition-all duration-300"
                    placeholder="e.g., New York, NY or Remote"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-3 tracking-wide">
                    Salary
                  </label>
                  <input
                    type="text"
                    name="salary"
                    value={formData.salary}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white/50 backdrop-blur-sm transition-all duration-300"
                    placeholder="e.g., $80,000 - $120,000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-3 tracking-wide">
                    Application Deadline
                  </label>
                  <input
                    type="date"
                    name="deadline"
                    value={formData.deadline}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white/50 backdrop-blur-sm transition-all duration-300"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>
            </div>

            {/* Job Description */}
            <div className="bg-white/60 backdrop-blur-sm border border-white/30 p-8 rounded-2xl">
              <h3 className="text-lg font-bold text-gray-800 mb-6 tracking-wide">Job Description</h3>
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-3 tracking-wide">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={6}
                  className="w-full px-4 py-3 border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white/50 backdrop-blur-sm transition-all duration-300 resize-none"
                  placeholder="Describe the role, responsibilities, and requirements..."
                  required
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between items-center pt-6">
              {mode === 'edit' && (
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={loading}
                  className="bg-gradient-to-r from-red-500 to-pink-600 text-white px-6 py-3 rounded-xl hover:from-red-600 hover:to-pink-700 transition-all duration-300 disabled:opacity-50 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-semibold"
                >
                  {loading ? 'Deleting...' : 'Delete Job'}
                </button>
              )}
              
              <div className="flex space-x-4 ml-auto">
                <button
                  type="button"
                  onClick={onCancel}
                  className="px-6 py-3 border border-white/30 text-gray-700 rounded-xl hover:bg-white/60 transition-all duration-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-semibold"
                >
                  {loading 
                    ? (mode === 'edit' ? 'Updating...' : 'Creating...') 
                    : (mode === 'edit' ? 'Update Job' : 'Create Job')
                  }
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default JobEditForm;



