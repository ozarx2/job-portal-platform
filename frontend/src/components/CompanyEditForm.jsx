import { useState, useEffect } from 'react';
import apiService from '../services/apiService';

export default function CompanyEditForm({ company, onSuccess, onCancel, mode = 'create' }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    website: '',
    industry: '',
    size: '1-10',
    email: '',
    phone: '',
    city: '',
    state: '',
    country: '',
    zipCode: '',
    linkedinUrl: '',
    twitterUrl: '',
    facebookUrl: ''
  });

  const [logo, setLogo] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  // Populate form with company data if editing
  useEffect(() => {
    if (mode === 'edit' && company) {
      setFormData({
        name: company.name || '',
        description: company.description || '',
        website: company.website || '',
        industry: company.industry || '',
        size: company.size || '1-10',
        email: company.email || '',
        phone: company.phone || '',
        city: company.city || '',
        state: company.state || '',
        country: company.country || '',
        zipCode: company.zipCode || '',
        linkedinUrl: company.linkedinUrl || '',
        twitterUrl: company.twitterUrl || '',
        facebookUrl: company.facebookUrl || ''
      });
      
      if (company.logo) {
        setLogoPreview(`http://localhost:5000${company.logo}`);
      }
    }
  }, [company, mode]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogo(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const formDataToSend = new FormData();
      
      // Add all form fields (only non-empty values)
      Object.keys(formData).forEach(key => {
        const value = formData[key];
        if (value !== null && value !== undefined && value !== '') {
          if (typeof value === 'string' && value.trim() !== '') {
            formDataToSend.append(key, value.trim());
          } else if (typeof value !== 'string') {
            formDataToSend.append(key, value);
          }
        }
      });

      // Add logo if selected
      if (logo && logo instanceof File) {
        formDataToSend.append('logo', logo);
      }

      let response;
      if (mode === 'edit') {
        response = await apiService.updateCompany(company._id, formDataToSend);
      } else {
        response = await apiService.createCompany(formDataToSend);
      }
      
      setMessage(mode === 'edit' ? 'Company updated successfully!' : 'Company created successfully!');
      setMessageType('success');

      // Call success callback after a short delay
      setTimeout(() => {
        onSuccess(response.data.data);
      }, 1000);

    } catch (error) {
      console.error('Error saving company:', error);
      setMessage(error.response?.data?.message || 'An error occurred while saving the company');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!company || mode !== 'edit') return;
    
    if (!window.confirm('Are you sure you want to delete this company? This action cannot be undone.')) {
      return;
    }

    setLoading(true);
    try {
      await apiService.deleteCompany(company._id);
      setMessage('Company deleted successfully!');
      setMessageType('success');
      
      setTimeout(() => {
        onSuccess(null, 'deleted');
      }, 1000);
    } catch (error) {
      console.error('Error deleting company:', error);
      setMessage(error.response?.data?.message || 'An error occurred while deleting the company');
      setMessageType('error');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-white/20">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {mode === 'edit' ? 'Edit Company' : 'Create New Company'}
            </h2>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          {message && (
            <div className={`mb-6 p-4 rounded-lg ${
              messageType === 'success' 
                ? 'bg-green-50 text-green-800 border border-green-200' 
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information Section */}
            <div className="bg-white/60 backdrop-blur-sm border border-white/30 p-8 rounded-2xl">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-white/30 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white/50 backdrop-blur-sm transition-all duration-300"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Industry
                  </label>
                  <select
                    name="industry"
                    value={formData.industry}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-white/30 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white/50 backdrop-blur-sm transition-all duration-300"
                  >
                    <option value="">Select Industry</option>
                    <option value="Technology">Technology</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Finance">Finance</option>
                    <option value="Education">Education</option>
                    <option value="Manufacturing">Manufacturing</option>
                    <option value="Retail">Retail</option>
                    <option value="Consulting">Consulting</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Brief description of your company..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Website
                  </label>
                  <input
                    type="url"
                    name="website"
                    value={formData.website}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-white/30 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white/50 backdrop-blur-sm transition-all duration-300"
                    placeholder="https://example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Size
                  </label>
                  <select
                    name="size"
                    value={formData.size}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-white/30 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white/50 backdrop-blur-sm transition-all duration-300"
                  >
                    <option value="1-10">1-10 employees</option>
                    <option value="11-50">11-50 employees</option>
                    <option value="51-200">51-200 employees</option>
                    <option value="201-500">201-500 employees</option>
                    <option value="501-1000">501-1000 employees</option>
                    <option value="1000+">1000+ employees</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Contact Information Section */}
            <div className="bg-white/60 backdrop-blur-sm border border-white/30 p-8 rounded-2xl">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-white/30 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white/50 backdrop-blur-sm transition-all duration-300"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-white/30 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white/50 backdrop-blur-sm transition-all duration-300"
                  />
                </div>
              </div>
            </div>

            {/* Location Section */}
            <div className="bg-white/60 backdrop-blur-sm border border-white/30 p-8 rounded-2xl">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Location</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-white/30 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white/50 backdrop-blur-sm transition-all duration-300"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State/Province
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-white/30 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white/50 backdrop-blur-sm transition-all duration-300"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Country
                  </label>
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-white/30 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white/50 backdrop-blur-sm transition-all duration-300"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ZIP/Postal Code
                  </label>
                  <input
                    type="text"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-white/30 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white/50 backdrop-blur-sm transition-all duration-300"
                  />
                </div>
              </div>
            </div>

            {/* Social Media Section */}
            <div className="bg-white/60 backdrop-blur-sm border border-white/30 p-8 rounded-2xl">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Social Media</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    LinkedIn URL
                  </label>
                  <input
                    type="url"
                    name="linkedinUrl"
                    value={formData.linkedinUrl}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-white/30 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white/50 backdrop-blur-sm transition-all duration-300"
                    placeholder="https://linkedin.com/company/yourcompany"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Twitter URL
                    </label>
                    <input
                      type="url"
                      name="twitterUrl"
                      value={formData.twitterUrl}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-white/30 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white/50 backdrop-blur-sm transition-all duration-300"
                      placeholder="https://twitter.com/yourcompany"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Facebook URL
                    </label>
                    <input
                      type="url"
                      name="facebookUrl"
                      value={formData.facebookUrl}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-white/30 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white/50 backdrop-blur-sm transition-all duration-300"
                      placeholder="https://facebook.com/yourcompany"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Logo Upload Section */}
            <div className="bg-white/60 backdrop-blur-sm border border-white/30 p-8 rounded-2xl">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Company Logo</h3>
              
              <div className="space-y-4">
                {logoPreview && (
                  <div className="flex items-center space-x-4">
                    <img
                      src={logoPreview}
                      alt="Logo preview"
                      className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                    />
                    <div>
                      <p className="text-sm text-gray-600">Logo Preview</p>
                      <button
                        type="button"
                        onClick={() => {
                          setLogo(null);
                          setLogoPreview(null);
                        }}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload Logo (Optional)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="w-full px-4 py-3 border border-white/30 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white/50 backdrop-blur-sm transition-all duration-300"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Supported formats: JPG, PNG, GIF, SVG. Max size: 5MB
                  </p>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-between items-center pt-6 border-t border-gray-200">
              <div>
                {mode === 'edit' && (
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={loading}
                    className="bg-gradient-to-r from-red-500 to-pink-600 text-white px-6 py-3 rounded-xl hover:from-red-600 hover:to-pink-700 transition-all duration-300 disabled:opacity-50 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-semibold"
                  >
                    {loading ? 'Deleting...' : 'Delete Company'}
                  </button>
                )}
              </div>
              
              <div className="flex space-x-4">
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
                    : (mode === 'edit' ? 'Update Company' : 'Create Company')
                  }
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
