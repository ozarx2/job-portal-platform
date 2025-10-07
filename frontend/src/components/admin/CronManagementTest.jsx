import React, { useState } from 'react';

const CronManagementTest = () => {
  const [cronStatus, setCronStatus] = useState({
    isRunning: true,
    jobs: [
      {
        name: 'application-status-updates',
        running: true,
        nextDate: new Date(Date.now() + 5 * 60 * 1000).toISOString()
      },
      {
        name: 'daily-application-summary',
        running: true,
        nextDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      },
      {
        name: 'weekly-application-reports',
        running: true,
        nextDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      }
    ]
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  const handleCronAction = async (action, endpoint) => {
    setLoading(true);
    setMessage('');
    
    // Simulate API call
    setTimeout(() => {
      setMessage(`Successfully ${action} cron service`);
      setMessageType('success');
      setLoading(false);
    }, 1000);
  };

  const handleTriggerAction = async (action, endpoint) => {
    setLoading(true);
    setMessage('');
    
    // Simulate API call
    setTimeout(() => {
      setMessage(`Successfully triggered ${action}`);
      setMessageType('success');
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Cron Job Management (Test Mode)</h1>
          <button
            onClick={() => setMessage('Status refreshed (test mode)')}
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
          </div>
        </div>

        {/* Service Controls */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Service Controls</h2>
          <div className="flex space-x-4">
            <button
              onClick={() => handleCronAction('starting', 'start')}
              disabled={loading || cronStatus.isRunning}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Starting...' : 'Start Service'}
            </button>
            
            <button
              onClick={() => handleCronAction('stopping', 'stop')}
              disabled={loading || !cronStatus.isRunning}
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
              onClick={() => handleTriggerAction('status updates', 'trigger-status-updates')}
              disabled={loading}
              className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Processing...' : 'Check Status Updates'}
            </button>
            
            <button
              onClick={() => handleTriggerAction('daily summary', 'trigger-daily-summary')}
              disabled={loading}
              className="px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Processing...' : 'Send Daily Summary'}
            </button>
            
            <button
              onClick={() => handleTriggerAction('weekly reports', 'trigger-weekly-reports')}
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

        {/* Test Mode Notice */}
        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-yellow-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <span className="text-yellow-800 font-medium">Test Mode</span>
          </div>
          <p className="text-yellow-700 text-sm mt-1">
            This is a test version of the cron management interface. In production, this would connect to the actual API endpoints.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CronManagementTest;








