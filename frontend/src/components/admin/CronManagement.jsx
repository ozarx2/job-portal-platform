import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CronManagement = () => {
  const [cronStatus, setCronStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  useEffect(() => {
    fetchCronStatus();
  }, []);

  const fetchCronStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.ozarx.in/api';
      
      const response = await axios.get(`${API_BASE_URL}/cron/status`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setCronStatus(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching cron status:', error);
      setMessage('Error fetching cron service status');
      setMessageType('error');
    }
  };

  const handleCronAction = async (action, endpoint) => {
    setLoading(true);
    setMessage('');
    
    try {
      const token = localStorage.getItem('token');
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.ozarx.in/api';
      
      const response = await axios.post(`${API_BASE_URL}/cron/${endpoint}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setMessage(response.data.message);
        setMessageType('success');
        fetchCronStatus(); // Refresh status
      }
    } catch (error) {
      console.error(`Error ${action}:`, error);
      setMessage(`Error ${action}: ${error.response?.data?.message || error.message}`);
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const handleTriggerAction = async (action, endpoint) => {
    setLoading(true);
    setMessage('');
    
    try {
      const token = localStorage.getItem('token');
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.ozarx.in/api';
      
      const response = await axios.post(`${API_BASE_URL}/cron/${endpoint}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setMessage(response.data.message);
        setMessageType('success');
      }
    } catch (error) {
      console.error(`Error ${action}:`, error);
      setMessage(`Error ${action}: ${error.response?.data?.message || error.message}`);
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Cron Job Management</h1>
          <button
            onClick={fetchCronStatus}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Refresh Status
          </button>
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

        {/* Cron Service Status */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Service Status</h2>
          <div className="bg-gray-50 rounded-lg p-4">
            {cronStatus ? (
              <div className="space-y-3">
                <div className="flex items-center">
                  <span className="font-medium text-gray-700">Service Running:</span>
                  <span className={`ml-2 px-2 py-1 rounded-full text-sm font-medium ${
                    cronStatus.isRunning 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {cronStatus.isRunning ? 'Running' : 'Stopped'}
                  </span>
                </div>
                
                <div>
                  <span className="font-medium text-gray-700">Active Jobs:</span>
                  <div className="mt-2 space-y-2">
                    {cronStatus.jobs.map((job, index) => (
                      <div key={index} className="bg-white p-3 rounded border">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-gray-800">{job.name}</span>
                          <span className={`px-2 py-1 rounded-full text-sm ${
                            job.running 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {job.running ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        {job.nextDate && (
                          <p className="text-sm text-gray-600 mt-1">
                            Next run: {new Date(job.nextDate).toLocaleString()}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">Loading status...</p>
            )}
          </div>
        </div>

        {/* Service Controls */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Service Controls</h2>
          <div className="flex space-x-4">
            <button
              onClick={() => handleCronAction('starting', 'start')}
              disabled={loading || (cronStatus?.isRunning)}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Starting...' : 'Start Service'}
            </button>
            
            <button
              onClick={() => handleCronAction('stopping', 'stop')}
              disabled={loading || (!cronStatus?.isRunning)}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Stopping...' : 'Stop Service'}
            </button>
          </div>
        </div>

        {/* Manual Triggers */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Manual Triggers</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => handleTriggerAction('triggering status updates', 'trigger-status-updates')}
              disabled={loading}
              className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Processing...' : 'Check Status Updates'}
            </button>
            
            <button
              onClick={() => handleTriggerAction('triggering daily summary', 'trigger-daily-summary')}
              disabled={loading}
              className="px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Processing...' : 'Send Daily Summary'}
            </button>
            
            <button
              onClick={() => handleTriggerAction('triggering weekly reports', 'trigger-weekly-reports')}
              disabled={loading}
              className="px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Processing...' : 'Send Weekly Reports'}
            </button>
          </div>
        </div>

        {/* Cron Job Information */}
        <div className="bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">Cron Job Schedule</h3>
          <div className="space-y-2 text-sm text-blue-800">
            <div className="flex justify-between">
              <span><strong>Application Status Updates:</strong></span>
              <span>Every 5 minutes</span>
            </div>
            <div className="flex justify-between">
              <span><strong>Daily Application Summary:</strong></span>
              <span>Daily at 9:00 AM</span>
            </div>
            <div className="flex justify-between">
              <span><strong>Weekly Application Reports:</strong></span>
              <span>Every Monday at 10:00 AM</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CronManagement;











