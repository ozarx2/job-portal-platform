import React, { useState, useEffect } from 'react';
import axios from 'axios';

const SimpleOnboardingForm = ({ userId }) => {
  const [formData, setFormData] = useState({
    // Personal Information
    name: '',
    email: '',
    phone: '',
    address: '',
    
    // Emergency Contact
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelation: '',
    
    // Documents (File uploads)
    aadharCard: null,
    panCard: null,
    marksheet: null,
    certificates: null,
    experienceCertificate: null,
    payslip: null,
    bankPassbook: null,
    photo: null
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    if (userId) {
      fetchUserProfile();
    }
  }, [userId]);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
      const response = await axios.get(`${API_BASE_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const user = response.data.user;
      setUserProfile(user);
      
      // Pre-fill form with existing user data
      setFormData(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.location || ''
      }));
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, files } = e.target;
    
    if (type === 'file') {
      setFormData(prev => ({
        ...prev,
        [name]: files[0] || null
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const validateForm = () => {
    const requiredFields = ['name', 'email', 'phone', 'address', 'emergencyContactName', 'emergencyContactPhone', 'emergencyContactRelation'];
    const missingFields = requiredFields.filter(field => !formData[field] || formData[field].trim() === '');
    
    if (missingFields.length > 0) {
      setMessage(`Please fill in all required fields: ${missingFields.join(', ')}`);
      setMessageType('error');
      return false;
    }

    // Validate email format
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setMessage('Please enter a valid email address');
      setMessageType('error');
      return false;
    }

    // Validate phone format (basic)
    if (!/^[0-9+\-\s()]+$/.test(formData.phone)) {
      setMessage('Please enter a valid phone number');
      setMessageType('error');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const token = localStorage.getItem('token');
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

      // Create FormData for file uploads
      const submitData = new FormData();
      
      // Add text fields
      submitData.append('name', formData.name);
      submitData.append('email', formData.email);
      submitData.append('phone', formData.phone);
      submitData.append('address', formData.address);
      submitData.append('emergencyContactName', formData.emergencyContactName);
      submitData.append('emergencyContactPhone', formData.emergencyContactPhone);
      submitData.append('emergencyContactRelation', formData.emergencyContactRelation);

      // Add file uploads if present
      const documentFields = [
        'aadharCard', 'panCard', 'marksheet', 'certificates', 
        'experienceCertificate', 'payslip', 'bankPassbook', 'photo'
      ];

      documentFields.forEach(field => {
        if (formData[field]) {
          submitData.append(field, formData[field]);
        }
      });

      const response = await axios.post(`${API_BASE_URL}/onboarding/simple-submit`, submitData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        setMessage('Onboarding completed successfully!');
        setMessageType('success');
        
        // Clear form after successful submission
        setFormData({
          name: '',
          email: '',
          phone: '',
          address: '',
          emergencyContactName: '',
          emergencyContactPhone: '',
          emergencyContactRelation: '',
          aadharCard: null,
          panCard: null,
          marksheet: null,
          certificates: null,
          experienceCertificate: null,
          payslip: null,
          bankPassbook: null,
          photo: null
        });
      }

    } catch (error) {
      console.error('Onboarding submission error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to submit onboarding form. Please try again.';
      setMessage(errorMessage);
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const documentFields = [
    { name: 'aadharCard', label: 'Aadhar Card (Clear front and back scan)', required: true },
    { name: 'panCard', label: 'PAN Card (Clear scan of the card)', required: true },
    { name: 'marksheet', label: 'Marksheet (All academic marksheets)', required: true },
    { name: 'certificates', label: 'Certificates (Degree/diploma certificates)', required: true },
    { name: 'experienceCertificate', label: 'Experience Certificate (From previous employers - if applicable)', required: false },
    { name: 'payslip', label: 'Payslip (Recent payslips - if applicable)', required: false },
    { name: 'bankPassbook', label: 'Bank Passbook (First page with account details)', required: true },
    { name: 'photo', label: 'Photo (Recent passport-size photograph)', required: true }
  ];

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Onboarding Form</h2>
        <p className="text-gray-600">Please complete all required fields and upload necessary documents</p>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-lg ${
          messageType === 'success' 
            ? 'bg-green-100 text-green-800 border border-green-200' 
            : 'bg-red-100 text-red-800 border border-red-200'
        }`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Personal Information */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Personal Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                Address <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Emergency Contact</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="emergencyContactName" className="block text-sm font-medium text-gray-700 mb-1">
                Contact Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="emergencyContactName"
                name="emergencyContactName"
                value={formData.emergencyContactName}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label htmlFor="emergencyContactPhone" className="block text-sm font-medium text-gray-700 mb-1">
                Contact Phone <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                id="emergencyContactPhone"
                name="emergencyContactPhone"
                value={formData.emergencyContactPhone}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label htmlFor="emergencyContactRelation" className="block text-sm font-medium text-gray-700 mb-1">
                Relationship <span className="text-red-500">*</span>
              </label>
              <select
                id="emergencyContactRelation"
                name="emergencyContactRelation"
                value={formData.emergencyContactRelation}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select relationship</option>
                <option value="Spouse">Spouse</option>
                <option value="Parent">Parent</option>
                <option value="Sibling">Sibling</option>
                <option value="Friend">Friend</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
        </div>

        {/* Document Uploads */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Required Documents</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {documentFields.map((field) => (
              <div key={field.name} className="space-y-2">
                <label htmlFor={field.name} className="block text-sm font-medium text-gray-700">
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </label>
                <input
                  type="file"
                  id={field.name}
                  name={field.name}
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  onChange={handleInputChange}
                  required={field.required}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                {formData[field.name] && (
                  <p className="text-sm text-green-600">
                    ✓ Selected: {formData[field.name].name}
                  </p>
                )}
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 bg-blue-50 rounded-md">
            <p className="text-sm text-blue-800">
              <strong>Accepted formats:</strong> PDF, JPG, PNG, DOC, DOCX • <strong>Max size:</strong> 10MB per document
            </p>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className={`px-8 py-3 rounded-lg font-medium text-white transition-all duration-300 ${
              loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
            }`}
          >
            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Submitting...</span>
              </div>
            ) : (
              'Submit Onboarding Form'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SimpleOnboardingForm;















