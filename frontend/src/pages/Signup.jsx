import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import GoogleAuth from '../components/auth/GoogleAuth';

export default function Signup() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: '',
    phone: '',
    company: '',
    experience: '',
    skills: '',
    location: ''
  });

  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState('');
  const [googleError, setGoogleError] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  // Role definitions with icons and descriptions
  const roles = [
    {
      id: 'candidate',
      name: 'Job Seeker',
      icon: '👤',
      description: 'Looking for job opportunities',
      color: 'from-blue-500 to-blue-600',
      features: ['Apply to jobs', 'Track applications', 'Build profile', 'Get matched']
    },
    {
      id: 'employer',
      name: 'Employer',
      icon: '🏢',
      description: 'Hiring for your company',
      color: 'from-green-500 to-green-600',
      features: ['Post jobs', 'Manage candidates', 'Track hiring', 'Analytics']
    },
    {
      id: 'agent',
      name: 'Recruitment Agent',
      icon: '🤝',
      description: 'Help others find jobs',
      color: 'from-purple-500 to-purple-600',
      features: ['Manage candidates', 'Commission earnings', 'Job matching', 'Client management']
    }
  ];

  // Validation functions
  const validateField = (name, value) => {
    const newErrors = { ...errors };
    
    switch (name) {
      case 'name':
        if (!value.trim()) {
          newErrors.name = 'Name is required';
        } else if (value.trim().length < 2) {
          newErrors.name = 'Name must be at least 2 characters';
        } else {
          delete newErrors.name;
        }
        break;
        
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!value) {
          newErrors.email = 'Email is required';
        } else if (!emailRegex.test(value)) {
          newErrors.email = 'Please enter a valid email';
        } else {
          delete newErrors.email;
        }
        break;
        
      case 'password':
        if (!value) {
          newErrors.password = 'Password is required';
        } else if (value.length < 8) {
          newErrors.password = 'Password must be at least 8 characters';
        } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
          newErrors.password = 'Password must contain uppercase, lowercase, and number';
        } else {
          delete newErrors.password;
        }
        break;
        
      case 'confirmPassword':
        if (!value) {
          newErrors.confirmPassword = 'Please confirm your password';
        } else if (value !== formData.password) {
          newErrors.confirmPassword = 'Passwords do not match';
        } else {
          delete newErrors.confirmPassword;
        }
        break;
        
      case 'phone':
        if (value && !/^[\+]?[1-9][\d]{0,15}$/.test(value.replace(/[\s\-\(\)]/g, ''))) {
          newErrors.phone = 'Please enter a valid phone number';
        } else {
          delete newErrors.phone;
        }
        break;
        
      case 'role':
        if (!value) {
          newErrors.role = 'Please select a role';
        } else {
          delete newErrors.role;
        }
        break;
    }
    
    setErrors(newErrors);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    validateField(name, value);
  };

  const handleRoleSelect = (roleId) => {
    setFormData({ ...formData, role: roleId });
    validateField('role', roleId);
  };

  // Simple role-based dashboard routing
  const getDashboardByRole = (role) => {
    switch (role?.toLowerCase()) {
      case 'employer':
        return '/employer-dashboard';
      case 'candidate':
        return '/candidate-dashboard';
      case 'agent':
        return '/agent-dashboard';
      default:
        return '/dashboard';
    }
  };

  const handleGoogleSuccess = (user, token) => {
    setGoogleError('');
    const dashboardRoute = getDashboardByRole(user.role);
    navigate(dashboardRoute);
  };

  const handleGoogleError = (errorMessage) => {
    setGoogleError(errorMessage);
  };

  const nextStep = () => {
    console.log('Next step clicked, current step:', currentStep);
    console.log('Form data:', formData);
    
    if (currentStep === 1) {
      // Validate role selection only
      const basicErrors = {};
      if (!formData.role) basicErrors.role = 'Please select a role';
      
      console.log('Step 1 validation errors:', basicErrors);
      
      if (Object.keys(basicErrors).length > 0) {
        setErrors(basicErrors);
        return;
      }
    }
    
    if (currentStep === 2) {
      // Validate basic info only (no password fields on step 2)
      const step2Errors = {};
      
      // Basic info validation
      if (!formData.name?.trim()) step2Errors.name = 'Name is required';
      if (!formData.email?.trim()) step2Errors.email = 'Email is required';
      if (!formData.phone?.trim()) step2Errors.phone = 'Phone is required';
      if (!formData.location?.trim()) step2Errors.location = 'Location is required';
      
      console.log('Step 2 validation errors:', step2Errors);
      console.log('Form data for step 2:', {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        location: formData.location
      });
      
      if (Object.keys(step2Errors).length > 0) {
        setErrors(step2Errors);
        return;
      }
    }
    
    if (currentStep === 3) {
      // Validate password and role-specific fields
      const step3Errors = {};
      
      // Password validation
      if (!formData.password) step3Errors.password = 'Password is required';
      if (formData.password !== formData.confirmPassword) {
        step3Errors.confirmPassword = 'Passwords do not match';
      }
      
      // Role-specific validation
      if (formData.role === 'candidate') {
        if (!formData.experience?.trim()) step3Errors.experience = 'Experience level is required';
        if (!formData.skills?.trim()) step3Errors.skills = 'Skills are required';
      } else if (formData.role === 'employer') {
        if (!formData.company?.trim()) step3Errors.company = 'Company name is required';
      }
      
      console.log('Step 3 validation errors:', step3Errors);
      console.log('Form data for step 3:', {
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        experience: formData.experience,
        skills: formData.skills,
        company: formData.company
      });
      
      if (Object.keys(step3Errors).length > 0) {
        setErrors(step3Errors);
        return;
      }
    }
    
    console.log('Moving to step:', currentStep + 1);
    setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    setSuccess('');

    // Final validation
    const finalErrors = {};
    if (!formData.name.trim()) finalErrors.name = 'Name is required';
    if (!formData.email.trim()) finalErrors.email = 'Email is required';
    if (!formData.password) finalErrors.password = 'Password is required';
    if (!formData.role) finalErrors.role = 'Please select a role';
    if (formData.password !== formData.confirmPassword) {
      finalErrors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(finalErrors).length > 0) {
      setErrors(finalErrors);
      setLoading(false);
      return;
    }

    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.ozarx.in/api';
      const res = await axios.post(`${API_BASE_URL}/auth/register`, {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        phone: formData.phone,
        company: formData.company,
        experience: formData.experience,
        skills: formData.skills,
        location: formData.location
      });

      setSuccess('Registration successful! Redirecting...');
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      
      setTimeout(() => {
        const dashboardRoute = getDashboardByRole(formData.role);
        navigate(dashboardRoute);
      }, 2000);
      
    } catch (err) {
      console.error(err);
      setErrors({ 
        submit: err.response?.data?.msg || err.message || 'Registration failed' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl mb-4">
            <span className="text-2xl">🚀</span>
          </div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-2">
            Join Our Platform
          </h1>
          <p className="text-lg text-gray-600 font-medium">
            Create your account and start your journey
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-4">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                  currentStep >= step 
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg' 
                    : 'bg-gray-200 text-gray-500'
                }`}>
                  {step}
                </div>
                {step < 3 && (
                  <div className={`w-8 h-1 mx-2 transition-all duration-300 ${
                    currentStep > step ? 'bg-gradient-to-r from-indigo-500 to-purple-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Main Form Container */}
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
          <form onSubmit={handleSubmit} className="p-8">
            {/* Step 1: Role Selection */}
            {currentStep === 1 && (
              <div className="space-y-8">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-black text-gray-900 tracking-tight mb-2">
                    Choose Your Role
                  </h2>
                  <p className="text-lg text-gray-600">
                    Select the role that best describes you
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {roles.map((role) => (
                    <div
                      key={role.id}
                      onClick={() => handleRoleSelect(role.id)}
                      className={`relative p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                        formData.role === role.id
                          ? 'border-indigo-500 bg-gradient-to-br from-indigo-50 to-purple-50 shadow-xl'
                          : 'border-gray-200 bg-white hover:border-indigo-300 hover:shadow-lg'
                      }`}
                    >
                      <div className="flex items-start space-x-4">
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${role.color} flex items-center justify-center text-2xl`}>
                          {role.icon}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-900 mb-1">
                            {role.name}
                          </h3>
                          <p className="text-gray-600 mb-3">
                            {role.description}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {role.features.map((feature, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                              >
                                {feature}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      {formData.role === role.id && (
                        <div className="absolute top-4 right-4">
                          <div className="w-6 h-6 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {errors.role && (
                  <div className="text-red-600 text-center text-sm bg-red-50 p-3 rounded-lg">
                    {errors.role}
                  </div>
                )}

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={nextStep}
                    disabled={!formData.role}
                    className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-8 py-3 rounded-xl hover:from-indigo-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-semibold"
                  >
                    Next Step
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Basic Information */}
            {currentStep === 2 && (
              <div className="space-y-8">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-black text-gray-900 tracking-tight mb-2">
                    Basic Information
                  </h2>
                  <p className="text-lg text-gray-600">
                    Tell us about yourself
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-800 mb-3 tracking-wide">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white/50 backdrop-blur-sm transition-all duration-300 ${
                        errors.name ? 'border-red-500' : 'border-white/30'
                      }`}
                      placeholder="Enter your full name"
                    />
                    {errors.name && (
                      <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-800 mb-3 tracking-wide">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white/50 backdrop-blur-sm transition-all duration-300 ${
                        errors.email ? 'border-red-500' : 'border-white/30'
                      }`}
                      placeholder="your@email.com"
                    />
                    {errors.email && (
                      <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-800 mb-3 tracking-wide">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white/50 backdrop-blur-sm transition-all duration-300 ${
                        errors.phone ? 'border-red-500' : 'border-white/30'
                      }`}
                      placeholder="+1 (555) 123-4567"
                    />
                    {errors.phone && (
                      <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-800 mb-3 tracking-wide">
                      Location
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white/50 backdrop-blur-sm transition-all duration-300"
                      placeholder="City, Country"
                    />
                  </div>
                </div>

                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={prevStep}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-300 font-semibold"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={nextStep}
                    className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-8 py-3 rounded-xl hover:from-indigo-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-semibold"
                  >
                    Next Step
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Password & Additional Info */}
            {currentStep === 3 && (
              <div className="space-y-8">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-black text-gray-900 tracking-tight mb-2">
                    Security & Details
                  </h2>
                  <p className="text-lg text-gray-600">
                    Set up your password and additional information
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-800 mb-3 tracking-wide">
                      Password *
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 pr-12 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white/50 backdrop-blur-sm transition-all duration-300 ${
                          errors.password ? 'border-red-500' : 'border-white/30'
                        }`}
                        placeholder="Create a strong password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showPassword ? '🙈' : '👁️'}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-800 mb-3 tracking-wide">
                      Confirm Password *
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 pr-12 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white/50 backdrop-blur-sm transition-all duration-300 ${
                          errors.confirmPassword ? 'border-red-500' : 'border-white/30'
                        }`}
                        placeholder="Confirm your password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showConfirmPassword ? '🙈' : '👁️'}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
                    )}
                  </div>

                  {formData.role === 'candidate' && (
                    <>
                      <div>
                        <label className="block text-sm font-bold text-gray-800 mb-3 tracking-wide">
                          Experience Level
                        </label>
                        <select
                          name="experience"
                          value={formData.experience}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white/50 backdrop-blur-sm transition-all duration-300"
                        >
                          <option value="">Select experience level</option>
                          <option value="entry">Entry Level (0-2 years)</option>
                          <option value="mid">Mid Level (3-5 years)</option>
                          <option value="senior">Senior Level (6-10 years)</option>
                          <option value="executive">Executive Level (10+ years)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-gray-800 mb-3 tracking-wide">
                          Skills
                        </label>
                        <input
                          type="text"
                          name="skills"
                          value={formData.skills}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white/50 backdrop-blur-sm transition-all duration-300"
                          placeholder="JavaScript, React, Python, etc."
                        />
                      </div>
                    </>
                  )}

                  {formData.role === 'employer' && (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-bold text-gray-800 mb-3 tracking-wide">
                        Company Name
                      </label>
                      <input
                        type="text"
                        name="company"
                        value={formData.company}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white/50 backdrop-blur-sm transition-all duration-300"
                        placeholder="Your company name"
                      />
                    </div>
                  )}
                </div>

                {/* Error Messages */}
                {errors.submit && (
                  <div className="text-red-600 text-center text-sm bg-red-50 p-4 rounded-lg">
                    {errors.submit}
                  </div>
                )}

                {success && (
                  <div className="text-green-600 text-center text-sm bg-green-50 p-4 rounded-lg">
                    {success}
                  </div>
                )}

                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={prevStep}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-300 font-semibold"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-8 py-3 rounded-xl hover:from-indigo-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-semibold"
                  >
                    {loading ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Creating Account...</span>
                      </div>
                    ) : (
                      'Create Account'
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Google Auth Section - Only on steps 2 and 3 */}
            {currentStep > 1 && (
              <>
                <div className="relative my-8">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-gray-500 font-medium">Or continue with</span>
                  </div>
                </div>

                <GoogleAuth 
                  role={formData.role || 'candidate'}
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                />

                {googleError && (
                  <div className="text-red-600 text-center text-sm bg-red-50 p-3 rounded-lg mt-4">
                    {googleError}
                  </div>
                )}
              </>
            )}
          </form>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-gray-600">
            Already have an account?{' '}
            <a href="/login" className="text-indigo-600 hover:text-indigo-500 font-semibold transition-colors">
              Sign in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
