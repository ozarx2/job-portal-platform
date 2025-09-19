import React from 'react';
import { useApp } from '../contexts/AppContext';

export default function DashboardStatus() {
  const { state } = useApp();
  const { loading, error, lastUpdated, connectedDashboards } = state;

  const getStatusColor = () => {
    if (error) return 'bg-red-500';
    if (loading) return 'bg-blue-500';
    if (lastUpdated) return 'bg-green-500';
    return 'bg-gray-500';
  };

  const getStatusText = () => {
    if (error) return '❌ Connection Error';
    if (loading) return '🔄 Syncing Data...';
    if (lastUpdated) return '✅ Connected';
    return '⏳ Initializing...';
  };

  const getLastUpdatedText = () => {
    if (!lastUpdated) return '';
    const date = new Date(lastUpdated);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  return (
    <div className="fixed bottom-4 left-4 z-40">
      <div className={`${getStatusColor()} text-white px-3 py-2 rounded-lg shadow-lg text-sm font-medium flex items-center space-x-2`}>
        <span>{getStatusText()}</span>
        {lastUpdated && (
          <span className="text-xs opacity-75">
            ({getLastUpdatedText()})
          </span>
        )}
      </div>
      
      {connectedDashboards.length > 0 && (
        <div className="mt-2 bg-white rounded-lg shadow-lg p-2 text-xs text-gray-600">
          <div className="font-medium mb-1">Connected Dashboards:</div>
          <div className="flex flex-wrap gap-1">
            {connectedDashboards.map((dashboard, index) => (
              <span
                key={index}
                className="bg-green-100 text-green-800 px-2 py-1 rounded-full"
              >
                {dashboard}
              </span>
            ))}
          </div>
        </div>
      )}
      
      {error && (
        <div className="mt-2 bg-red-50 border border-red-200 rounded-lg p-2 text-xs text-red-800 max-w-xs">
          <div className="font-medium">Error Details:</div>
          <div className="mt-1">{error}</div>
        </div>
      )}
    </div>
  );
}
