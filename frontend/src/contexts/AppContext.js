import React, { createContext, useContext, useState, useEffect } from 'react';
import apiService from '../services/apiService';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [state, setState] = useState({
    user: null,
    applications: [],
    jobs: [],
    leads: [],
    users: [],
    companies: [],
    loading: false,
    error: null,
    lastUpdated: null,
    notifications: []
  });

  const refreshData = async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const [applicationsRes, jobsRes, leadsRes, companiesRes] = await Promise.all([
        apiService.getApplications().catch(() => ({ data: [] })),
        apiService.getJobs().catch(() => ({ data: [] })),
        apiService.getLeads().catch(() => ({ data: [] })),
        apiService.getCompanies().catch(() => ({ data: [] }))
      ]);

      setState(prev => ({
        ...prev,
        applications: applicationsRes.data || [],
        jobs: jobsRes.data || [],
        leads: leadsRes.data || [],
        companies: companiesRes.data || [],
        loading: false,
        lastUpdated: Date.now()
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message
      }));
    }
  };

  const updateApplicationStatus = async (applicationId, newStatus) => {
    try {
      const response = await apiService.updateApplicationStatus(applicationId, newStatus);
      
      if (response.data.success) {
        setState(prev => ({
          ...prev,
          applications: prev.applications.map(app =>
            app.id === applicationId ? { ...app, status: newStatus } : app
          ),
          lastUpdated: Date.now()
        }));
        
        return { success: true, data: response.data };
      } else {
        throw new Error('Failed to update application status');
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const createJob = async (jobData) => {
    try {
      const response = await apiService.createJob(jobData);
      
      if (response.data.success) {
        setState(prev => ({
          ...prev,
          jobs: [...prev.jobs, response.data.job],
          lastUpdated: Date.now()
        }));
        
        return { success: true, data: response.data };
      } else {
        throw new Error('Failed to create job');
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const addNotification = (notification) => {
    setState(prev => ({
      ...prev,
      notifications: [...prev.notifications, notification]
    }));
  };

  const removeNotification = (notificationId) => {
    setState(prev => ({
      ...prev,
      notifications: prev.notifications.filter(n => n.id !== notificationId)
    }));
  };

  const clearNotifications = () => {
    setState(prev => ({
      ...prev,
      notifications: []
    }));
  };

  // Auto-refresh data every 30 seconds
  useEffect(() => {
    refreshData();
    const interval = setInterval(refreshData, 30000);
    return () => clearInterval(interval);
  }, []);

  const value = {
    state,
    refreshData,
    updateApplicationStatus,
    createJob,
    addNotification,
    removeNotification,
    clearNotifications
  };

  return React.createElement(AppContext.Provider, { value }, children);
}

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};