import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser } from '../../api';

const LoginForm = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();

  // Simple role-based dashboard routing
  const getDashboardByRole = (role) => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return '/admin-dashboard';
      case 'employer':
        return '/employer-dashboard';
      case 'candidate':
        return '/candidate-dashboard';
      case 'agent':
        return '/agent-dashboard';
      case 'hr':
        return '/hr-dashboard';
      case 'manager':
        return '/manager-dashboard';
      default:
        return '/dashboard'; // fallback dashboard
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
      const response = await loginUser(formData);

      // Debug: Log the full response to see the actual structure
      console.log('Full API Response:', response.data);

      // Handle different possible response structures
      if (response.data && response.data.token && response.data.user) {
        // Store user data in localStorage
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        // Get user role from response
        const userRole = response.data.user.role;
        const userName = response.data.user.name;
        
        // Get appropriate dashboard route based on role
        const dashboardRoute = getDashboardByRole(userRole);
        
        console.log(`Login successful! User: ${userName}, Role: ${userRole}, Redirecting to: ${dashboardRoute}`);
        
        // Navigate to role-specific dashboard
        navigate(dashboardRoute);
        
      } else if (response.data && response.data.token) {
        // Alternative: Some APIs might not have a 'success' field
        console.log('Login response missing user object:', response.data);
        setError('Login successful but user information is missing. Please contact support.');
      } else {
        console.log('Unexpected response structure:', response.data);
        setError('Received invalid response from server. Expected login token and user information.');
      }
    } catch (err) {
      console.error('Login error:', err);
      
      if (err.response?.status === 401) {
        setError('Invalid email or password.');
      } else if (err.response?.status === 403) {
        setError('Account is deactivated. Contact support.');
      } else if (err.code === 'ERR_NETWORK') {
        setError('Network error. Check your connection.');
      } else {
        setError(
          err.response?.data?.message || 
          'Login failed. Please try again.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-6 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Sign In</h2>
          <p className="mt-2 text-gray-600">Access your dashboard</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your email"
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={formData.password}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your password"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Signing in...
              </div>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        

        <div className="text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <Link to="/register" className="text-blue-600 hover:text-blue-500">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;