import React, { useState, useEffect } from 'react';
import axios from 'axios';

const OnboardingStatus = ({ userId }) => {
  const [onboardingData, setOnboardingData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (userId) {
      fetchOnboardingData();
    }
  }, [userId]);

  const fetchOnboardingData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
      
      const response = await axios.get(`${API_BASE_URL}/onboarding/candidate/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setOnboardingData(response.data.data || []);
    } catch (error) {
      console.error('Error fetching onboarding data:', error);
      
      // If it's a 404, it means no onboarding data exists yet - this is normal
      if (error.response?.status === 404) {
        setOnboardingData([]);
        setError('No onboarding process has been started yet. Contact HR to begin your onboarding.');
      } else {
        setError('Failed to load onboarding data');
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStepStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return '✅';
      case 'in_progress':
        return '🔄';
      case 'pending':
        return '⏳';
      case 'rejected':
      case 'failed':
        return '❌';
      default:
        return '⏸️';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading onboarding data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  if (onboardingData.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-500 text-lg mb-2">No Active Onboarding</div>
        <p className="text-gray-400">
          You don't have any active onboarding processes. Once you're selected for a position, 
          your onboarding process will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {onboardingData.map((onboarding, index) => (
        <div key={onboarding._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                {onboarding.jobId?.title} at {onboarding.companyId?.name}
              </h3>
              <p className="text-sm text-gray-600">
                Started: {new Date(onboarding.createdAt).toLocaleDateString()}
              </p>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(onboarding.status)}`}>
              {onboarding.status.replace('_', ' ').toUpperCase()}
            </span>
          </div>

          {/* Steps Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.entries(onboarding.steps).map(([stepName, stepData]) => (
              <div key={stepName} className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 capitalize">
                    {stepName.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                  <span className="text-lg">
                    {getStepStatusIcon(stepData.status)}
                  </span>
                </div>
                <div className={`text-xs px-2 py-1 rounded-full ${getStatusColor(stepData.status)}`}>
                  {stepData.status.replace('_', ' ')}
                </div>
              </div>
            ))}
          </div>

          {/* Contact Information */}
          <div className="mt-4 bg-blue-50 rounded-lg p-4">
            <h6 className="font-medium text-blue-900 mb-2">Need Help?</h6>
            <div className="text-sm text-blue-800">
              <p>Assigned HR: {onboarding.assignedHR?.name || 'TBA'}</p>
              <p>Manager: {onboarding.assignedManager?.name || 'TBA'}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default OnboardingStatus;
