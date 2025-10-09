import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, Typography, TextField, Button, Alert, Box, Chip } from '@mui/material';
import axios from 'axios';

const PreUserLogin = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [jobDetails, setJobDetails] = useState(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Check for activation token in URL
  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      // Auto-fill credentials if token is provided
      handleTokenLogin(token);
    }
  }, [searchParams]);

  const handleTokenLogin = async (token) => {
    try {
      setLoading(true);
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://ec2-15-134-104-170.ap-southeast-2.compute.amazonaws.com/api";
      const response = await axios.post(`${API_BASE_URL}/auth/preuser-login`, {
        activationToken: token
      });

      if (response.data.success) {
        const { user, jobDetails, temporaryPassword } = response.data;
        setFormData({
          email: user.email,
          password: temporaryPassword
        });
        setJobDetails(jobDetails);
      }
    } catch (err) {
      console.error('Error with token login:', err);
      setError('Invalid activation link. Please try manual login.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://ec2-15-134-104-170.ap-southeast-2.compute.amazonaws.com/api";
      const response = await axios.post(`${API_BASE_URL}/auth/preuser-login`, {
        email: formData.email,
        password: formData.password
      });

      if (response.data.success) {
        const { user, jobDetails, token } = response.data;
        
        // Store authentication data
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('isPreUser', 'true');
        localStorage.setItem('assignedJob', JSON.stringify(jobDetails));
        
        // Redirect to candidate dashboard with welcome message
        navigate('/candidate-dashboard', { 
          state: { 
            welcomeMessage: true,
            jobDetails: jobDetails,
            isNewUser: true
          } 
        });
      }
    } catch (err) {
      console.error('Pre-user login error:', err);
      
      if (err.response?.status === 401) {
        setError('Incorrect email or password.');
      } else if (err.response?.status === 400 || /validation/i.test(err.response?.data?.message || '')) {
        setError('Please check your email and password and try again.');
      } else if (err.response?.status === 403) {
        setError('Your account has expired. Please contact support.');
      } else if (err.response?.status === 404) {
        setError('Account not found. Please check your email address.');
      } else {
        setError(err.response?.data?.message || 'Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Job Details Card */}
        {jobDetails && (
          <Card sx={{ mb: 3, bgcolor: 'success.50', border: '1px solid', borderColor: 'success.200' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom color="success.main">
                🎉 Welcome! You've been pre-selected for:
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle1" fontWeight="bold">
                  {jobDetails.jobTitle}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {jobDetails.companyName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  📍 {jobDetails.location}
                </Typography>
                {jobDetails.salary && (
                  <Typography variant="body2" color="text.secondary">
                    💰 {jobDetails.salary}
                  </Typography>
                )}
              </Box>
              <Chip 
                label="Auto-Applied" 
                color="success" 
                size="small" 
                sx={{ mt: 1 }} 
              />
            </CardContent>
          </Card>
        )}

        {/* Login Form */}
        <Card>
          <CardContent sx={{ p: 4 }}>
            <div className="text-center mb-6">
              <Typography variant="h4" gutterBottom>
                Welcome to Ozarx HR
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Your account has been created for a job opportunity
              </Typography>
            </div>

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <TextField
                fullWidth
                label="Email Address"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                disabled={loading}
                placeholder="candidate@example.com"
              />

              <TextField
                fullWidth
                label="Temporary Password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                disabled={loading}
                placeholder="Enter your temporary password"
                helperText="This is the password sent to your email"
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading || !formData.email || !formData.password}
                sx={{ 
                  mt: 3, 
                  mb: 2,
                  py: 1.5,
                  fontSize: '1.1rem',
                  fontWeight: 'bold'
                }}
              >
                {loading ? 'Logging in...' : 'Login to Your Account'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Typography variant="body2" color="text.secondary">
                After logging in, you'll need to:
              </Typography>
              <ul className="mt-2 text-sm text-gray-600 text-left">
                <li>• Change your temporary password</li>
                <li>• Complete your profile</li>
                <li>• Upload required documents</li>
                <li>• Review your job application</li>
              </ul>
            </div>

            <div className="mt-6 text-center">
              <Typography variant="body2" color="text.secondary">
                Having trouble? Contact support at{' '}
                <a href="mailto:support@ozarx.in" className="text-blue-600 hover:underline">
                  support@ozarx.in
                </a>
              </Typography>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PreUserLogin;
