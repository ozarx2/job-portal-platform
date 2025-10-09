import React, { useState, useEffect } from 'react';
import axios from 'axios';

const SimpleJobApplicationForm = ({ jobId, jobTitle, companyName, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    experience: '',
    education: '',
    skills: '',
    resume: null,
    coverLetter: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [alreadyApplied, setAlreadyApplied] = useState(false);

  useEffect(() => {
    // Get token from localStorage
    const token = localStorage.getItem('token');
    if (token) {
      fetchUserProfile();
    }
  }, []);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found in localStorage');
        setMessage('Please log in to continue.');
        return;
      }

      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.ozarx.in/api';
      console.log('Fetching user profile from:', `${API_BASE_URL}/auth/me`);
      
      const response = await axios.get(`${API_BASE_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('User profile response:', response.data);
      
      // Pre-fill form with existing profile data
      const user = response.data.user;
      if (!user) {
        console.error('No user data in response');
        setMessage('Error loading profile data. Please try again.');
        return;
      }

      setFormData(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        location: user.location || '',
        experience: user.experience || '',
        education: user.education || '',
        skills: Array.isArray(user.skills) ? user.skills.join(', ') : (user.skills || '')
      }));

      console.log('Form data updated with user profile');
    } catch (error) {
      console.error('Error fetching user profile:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      setMessage('Error loading profile data. Please try again.');
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
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    
    // Clear message
    if (message) {
      setMessage('');
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Required fields
    if (!formData.name.trim()) newErrors.name = 'Full name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.location.trim()) newErrors.location = 'Location is required';
    if (!formData.experience) newErrors.experience = 'Years of experience is required';
    if (!formData.education.trim()) newErrors.education = 'Education is required';
    if (!formData.skills.trim()) newErrors.skills = 'Skills are required';
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    // Phone validation (basic)
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    if (formData.phone && !phoneRegex.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setMessage('Please fix the errors above before submitting.');
      return;
    }
    
    setLoading(true);
    setMessage('');
    
    try {
      const token = localStorage.getItem('token');
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.ozarx.in/api';
      
      // Prepare form data for submission
      const submitData = new FormData();
      submitData.append('jobId', jobId);
      submitData.append('name', formData.name.trim());
      submitData.append('email', formData.email.trim());
      submitData.append('phone', formData.phone.trim());
      submitData.append('location', formData.location.trim());
      submitData.append('experience', formData.experience);
      submitData.append('education', formData.education.trim());
      submitData.append('skills', formData.skills.trim());
      submitData.append('bio', formData.coverLetter.trim());
      submitData.append('notes', formData.coverLetter.trim());
      
      // Add missing fields that backend expects
      submitData.append('age', formData.age || '');
      submitData.append('currentEmployer', '');
      submitData.append('expectedSalary', '');
      submitData.append('availability', '');
      
      if (formData.resume) {
        submitData.append('resume', formData.resume);
      }
      
      // Submit application
      const response = await axios.post(`${API_BASE_URL}/applications`, submitData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response.data.success) {
        setMessage('Application submitted successfully!');
        setTimeout(() => {
          onSuccess(response.data);
        }, 1500);
      }
      
    } catch (error) {
      console.error('Application submission error:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      if (error.response?.status === 400) {
        if (error.response.data.requiresProfileCompletion) {
          setMessage('Please complete your profile before applying to jobs.');
        } else if (error.response.data.msg === "Already applied to this job" || 
                   error.response.data.message === "Already applied to this job") {
          setMessage('You have already applied to this job. Please check your applications or try a different job.');
          setAlreadyApplied(true);
        } else {
          setMessage(error.response.data.message || error.response.data.msg || 'Invalid application data. Please check your information.');
        }
      } else if (error.response?.status === 409) {
        setMessage('You have already applied to this job. Please check your applications or try a different job.');
        setAlreadyApplied(true);
      } else if (error.response?.status === 404) {
        setMessage('Job not found. Please try again.');
      } else if (error.response?.status === 401) {
        setMessage('Please log in again to apply for jobs.');
      } else if (error.response?.status === 500) {
        setMessage('Server error. Please try again later.');
      } else {
        setMessage(`Failed to submit application: ${error.response?.data?.message || error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-lg">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">Apply for Position</h2>
              <p className="text-blue-100 mt-1">{jobTitle} at {companyName}</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 text-2xl font-bold"
              disabled={loading}
            >
              ×
            </button>
          </div>
        </div>

        {/* Form */}
        <div className="p-6">
          {message && (
            <div className={`mb-4 p-3 rounded-lg ${
              message.includes('successfully') 
                ? 'bg-green-50 text-green-700 border border-green-200' 
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {message}
            </div>
          )}

          {alreadyApplied ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Already Applied</h3>
              <p className="text-gray-600 mb-4">
                You have already submitted an application for this job. 
                Please check your applications tab to see the status.
              </p>
              <button
                onClick={onClose}
                className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Close
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
            {/* Personal Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter your full name"
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter your email"
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.phone ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter your phone number"
                />
                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location *
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.location ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="City, State/Country"
                />
                {errors.location && <p className="text-red-500 text-xs mt-1">{errors.location}</p>}
              </div>
            </div>

            {/* Professional Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Years of Experience *
                </label>
                <select
                  name="experience"
                  value={formData.experience}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.experience ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select experience</option>
                  <option value="0">0 years (Fresh Graduate)</option>
                  <option value="1">1 year</option>
                  <option value="2">2 years</option>
                  <option value="3">3 years</option>
                  <option value="4">4 years</option>
                  <option value="5">5 years</option>
                  <option value="6">6 years</option>
                  <option value="7">7 years</option>
                  <option value="8">8 years</option>
                  <option value="9">9 years</option>
                  <option value="10">10 years</option>
                  <option value="15">15 years</option>
                  <option value="20">20 years</option>
                  <option value="25">25+ years</option>
                </select>
                {errors.experience && <p className="text-red-500 text-xs mt-1">{errors.experience}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Education *
                </label>
                <input
                  type="text"
                  name="education"
                  value={formData.education}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.education ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="e.g., Bachelor's in Computer Science"
                />
                {errors.education && <p className="text-red-500 text-xs mt-1">{errors.education}</p>}
              </div>
            </div>

            {/* Skills */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Skills *
              </label>
              <textarea
                name="skills"
                value={formData.skills}
                onChange={handleInputChange}
                rows={2}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.skills ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="List your key skills (e.g., JavaScript, React, Python, SQL)"
              />
              {errors.skills && <p className="text-red-500 text-xs mt-1">{errors.skills}</p>}
            </div>

            {/* Resume Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Resume (PDF, DOC, DOCX)
              </label>
              <input
                type="file"
                name="resume"
                onChange={handleInputChange}
                accept=".pdf,.doc,.docx"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">Upload your latest resume (optional but recommended)</p>
            </div>

            {/* Cover Letter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cover Letter / Additional Notes
              </label>
              <textarea
                name="coverLetter"
                value={formData.coverLetter}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Tell us why you're interested in this position and what makes you a great fit..."
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`px-6 py-2 rounded-lg font-medium ${
                  loading
                    ? 'bg-gray-400 text-white cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {loading ? 'Submitting...' : 'Submit Application'}
              </button>
            </div>
          </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default SimpleJobApplicationForm;
