import React, { useState, useEffect } from 'react';
import axios from 'axios';

const IndividualDocumentUpload = ({ userId }) => {
  const [formData, setFormData] = useState({
    // Personal Information
    name: '',
    email: '',
    phone: '',
    address: '',
    
    // Emergency Contact
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelation: ''
  });

  const [documents, setDocuments] = useState({
    aadharCard: null,
    panCard: null,
    marksheet: null,
    certificates: null,
    experienceCertificate: null,
    payslip: null,
    bankPassbook: null,
    photo: null
  });

  const [uploadingDocuments, setUploadingDocuments] = useState({});
  const [uploadedDocuments, setUploadedDocuments] = useState({});
  const [loading, setLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [userProfile, setUserProfile] = useState(null);
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);
  const [onboardingStatus, setOnboardingStatus] = useState(null);

  useEffect(() => {
    fetchUserProfile();
    checkOnboardingStatus();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setProfileLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        setProfileLoading(false);
        return;
      }

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

      console.log('User profile loaded:', {
        name: user.name,
        email: user.email,
        phone: user.phone,
        location: user.location
      });

    } catch (error) {
      console.error('Error fetching user profile:', error);
      setMessage('Failed to load user profile. Please refresh the page.');
      setMessageType('error');
    } finally {
      setProfileLoading(false);
    }
  };

  const checkOnboardingStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
      const response = await axios.get(`${API_BASE_URL}/onboarding/status`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        const status = response.data.data;
        setOnboardingStatus(status);
        setOnboardingCompleted(status.onboardingCompleted || false);
        
        console.log('Onboarding status:', status);
      }
    } catch (error) {
      console.error('Error checking onboarding status:', error);
    }
  };

  const documentFields = [
    { 
      name: 'aadharCard', 
      label: 'Aadhar Card', 
      description: 'Clear front and back scan', 
      required: true,
      icon: '🆔'
    },
    { 
      name: 'panCard', 
      label: 'PAN Card', 
      description: 'Clear scan of the card', 
      required: true,
      icon: '📄'
    },
    { 
      name: 'marksheet', 
      label: 'Marksheet', 
      description: 'All academic marksheets', 
      required: true,
      icon: '📊'
    },
    { 
      name: 'certificates', 
      label: 'Certificates', 
      description: 'Degree/diploma certificates', 
      required: true,
      icon: '🎓'
    },
    { 
      name: 'experienceCertificate', 
      label: 'Experience Certificate', 
      description: 'From previous employers (if applicable)', 
      required: false,
      icon: '💼'
    },
    { 
      name: 'payslip', 
      label: 'Payslip', 
      description: 'Recent payslips (if applicable)', 
      required: false,
      icon: '💰'
    },
    { 
      name: 'bankPassbook', 
      label: 'Bank Passbook', 
      description: 'First page with account details', 
      required: true,
      icon: '🏦'
    },
    { 
      name: 'photo', 
      label: 'Photo', 
      description: 'Recent passport-size photograph', 
      required: true,
      icon: '📷'
    }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDocumentUpload = async (fieldName, file) => {
    if (!file) return;

    setUploadingDocuments(prev => ({ ...prev, [fieldName]: true }));
    setMessage('');
    setMessageType('');

    try {
      const token = localStorage.getItem('token');
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

      const formData = new FormData();
      formData.append(fieldName, file);

      const response = await axios.post(`${API_BASE_URL}/onboarding/upload-document`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        setUploadedDocuments(prev => ({
          ...prev,
          [fieldName]: {
            filename: response.data.filename,
            originalName: file.name,
            uploadedAt: new Date()
          }
        }));
        
        setMessage(`✅ ${documentFields.find(f => f.name === fieldName)?.label} uploaded successfully!`);
        setMessageType('success');
      }

    } catch (error) {
      console.error(`Error uploading ${fieldName}:`, error);
      setMessage(`❌ Failed to upload ${documentFields.find(f => f.name === fieldName)?.label}. Please try again.`);
      setMessageType('error');
    } finally {
      setUploadingDocuments(prev => ({ ...prev, [fieldName]: false }));
    }
  };

  const handleDocumentChange = (e, fieldName) => {
    const file = e.target.files[0];
    if (file) {
      setDocuments(prev => ({ ...prev, [fieldName]: file }));
      handleDocumentUpload(fieldName, file);
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

    // Check required documents
    const requiredDocs = documentFields.filter(field => field.required);
    const missingDocs = requiredDocs.filter(field => !uploadedDocuments[field.name]);
    
    if (missingDocs.length > 0) {
      setMessage(`Please upload all required documents: ${missingDocs.map(d => d.label).join(', ')}`);
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

      const submitData = new FormData();
      
      // Add text fields
      submitData.append('name', formData.name);
      submitData.append('email', formData.email);
      submitData.append('phone', formData.phone);
      submitData.append('address', formData.address);
      submitData.append('emergencyContactName', formData.emergencyContactName);
      submitData.append('emergencyContactPhone', formData.emergencyContactPhone);
      submitData.append('emergencyContactRelation', formData.emergencyContactRelation);

      const response = await axios.post(`${API_BASE_URL}/onboarding/simple-submit`, submitData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        setMessage('🎉 Onboarding completed successfully!');
        setMessageType('success');
        
        // Check onboarding status after successful submission
        await checkOnboardingStatus();
        
        // Clear form after successful submission
        setFormData({
          name: '',
          email: '',
          phone: '',
          address: '',
          emergencyContactName: '',
          emergencyContactPhone: '',
          emergencyContactRelation: ''
        });
        setUploadedDocuments({});
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

  const getUploadStatus = (fieldName) => {
    if (uploadingDocuments[fieldName]) return 'uploading';
    if (uploadedDocuments[fieldName]) return 'uploaded';
    if (documents[fieldName]) return 'selected';
    return 'none';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'uploading': return 'text-blue-600';
      case 'uploaded': return 'text-green-600';
      case 'selected': return 'text-yellow-600';
      default: return 'text-gray-500';
    }
  };

  const getStatusText = (fieldName) => {
    const status = getUploadStatus(fieldName);
    switch (status) {
      case 'uploading': return '⏳ Uploading...';
      case 'uploaded': return '✅ Uploaded successfully';
      case 'selected': return '📁 File selected';
      default: return '📤 Click to upload';
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Onboarding Form</h2>
        <p className="text-gray-600">Complete your profile and upload documents individually</p>
        
        {profileLoading ? (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
              <span className="text-sm text-blue-800">Loading your profile...</span>
            </div>
          </div>
        ) : userProfile ? (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="text-green-600 mr-2">✅</span>
                <span className="text-sm text-green-800">
                  <strong>Profile loaded:</strong> {userProfile.name} ({userProfile.email})
                  {userProfile.phone && ` • Phone: ${userProfile.phone}`}
                </span>
              </div>
              <button
                onClick={fetchUserProfile}
                disabled={profileLoading}
                className="text-xs text-green-600 hover:text-green-800 underline disabled:opacity-50"
              >
                Refresh
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="text-yellow-600 mr-2">⚠️</span>
                <span className="text-sm text-yellow-800">
                  Profile not loaded. Please fill in your details manually.
                </span>
              </div>
              <button
                onClick={fetchUserProfile}
                disabled={profileLoading}
                className="text-xs text-yellow-600 hover:text-yellow-800 underline disabled:opacity-50"
              >
                Try Again
              </button>
            </div>
          </div>
        )}
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

      {onboardingCompleted ? (
        <div className="text-center py-12">
          <div className="mb-6">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Onboarding Completed!</h3>
            <p className="text-gray-600 mb-6">
              Your onboarding process has been completed successfully. All your documents have been submitted and are being reviewed.
            </p>
            {onboardingStatus?.onboardingCompletedAt && (
              <p className="text-sm text-gray-500 mb-6">
                Completed on: {new Date(onboardingStatus.onboardingCompletedAt).toLocaleDateString()}
              </p>
            )}
          </div>
          
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h4 className="font-semibold text-gray-900 mb-4">Submitted Documents:</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              {Object.entries(onboardingStatus?.documents || {}).map(([key, doc]) => (
                doc && doc.filename && (
                  <div key={key} className="flex items-center space-x-2">
                    <span className="text-green-600">✅</span>
                    <span className="text-gray-700 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                  </div>
                )
              ))}
            </div>
          </div>
          
          <button
            onClick={checkOnboardingStatus}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Refresh Status
          </button>
        </div>
      ) : (
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

        {/* Individual Document Uploads */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Document Uploads</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {documentFields.map((field) => (
              <div key={field.name} className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex items-center mb-3">
                  <span className="text-2xl mr-3">{field.icon}</span>
                  <div>
                    <h4 className="font-medium text-gray-900">{field.label}</h4>
                    <p className="text-sm text-gray-500">{field.description}</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <input
                    type="file"
                    id={field.name}
                    name={field.name}
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    onChange={(e) => handleDocumentChange(e, field.name)}
                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  
                  <div className={`text-sm ${getStatusColor(getUploadStatus(field.name))}`}>
                    {getStatusText(field.name)}
                  </div>
                  
                  {uploadedDocuments[field.name] && (
                    <div className="text-xs text-gray-600">
                      <p>📁 {uploadedDocuments[field.name].originalName}</p>
                      <p>⏰ {uploadedDocuments[field.name].uploadedAt.toLocaleTimeString()}</p>
                    </div>
                  )}
                  
                  {field.required && (
                    <div className="text-xs text-red-500">
                      * Required
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Upload Guidelines:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• <strong>Accepted formats:</strong> PDF, JPG, PNG, DOC, DOCX</li>
              <li>• <strong>Max size:</strong> 10MB per document</li>
              <li>• <strong>Quality:</strong> Ensure documents are clear and readable</li>
              <li>• <strong>Required documents:</strong> Must be uploaded before submission</li>
            </ul>
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
              'Complete Onboarding'
            )}
          </button>
        </div>
      </form>
      )}
    </div>
  );
};

export default IndividualDocumentUpload;
