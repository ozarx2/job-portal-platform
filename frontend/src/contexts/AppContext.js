import React, { createContext, useContext, useReducer, useEffect } from 'react';
import apiService from '../services/apiService';
import dashboardHub from '../services/dashboardHub';

const AppContext = createContext();

const initialState = {
  user: null,
  applications: [],
  jobs: [],
  leads: [],
  users: [],
  companies: [],
  loading: false,
  error: null,
  lastUpdated: null,
  connectedDashboards: [],
  notifications: []
};

function appReducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'SET_ERROR':
      return { 
        ...state, 
        error: action.payload, 
        loading: false 
      };
    
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    
    case 'SET_USER':
      return { ...state, user: action.payload };
    
    case 'SET_APPLICATIONS':
      return { 
        ...state, 
        applications: action.payload, 
        lastUpdated: Date.now() 
      };
    
    case 'SET_JOBS':
      return { 
        ...state, 
        jobs: action.payload, 
        lastUpdated: Date.now() 
      };
    
    case 'SET_LEADS':
      return { 
        ...state, 
        leads: action.payload, 
        lastUpdated: Date.now() 
      };
    
    case 'SET_USERS':
      return { 
        ...state, 
        users: action.payload, 
        lastUpdated: Date.now() 
      };
    
    case 'SET_COMPANIES':
      return { 
        ...state, 
        companies: action.payload, 
        lastUpdated: Date.now() 
      };
    
    case 'UPDATE_APPLICATION':
      return {
        ...state,
        applications: state.applications.map(app =>
          app.id === action.payload.id ? { ...app, ...action.payload } : app
        ),
        lastUpdated: Date.now()
      };
    
    case 'ADD_APPLICATION':
      return {
        ...state,
        applications: [...state.applications, action.payload],
        lastUpdated: Date.now()
      };
    
    case 'UPDATE_JOB':
      return {
        ...state,
        jobs: state.jobs.map(job =>
          job.id === action.payload.id ? { ...job, ...action.payload } : job
        ),
        lastUpdated: Date.now()
      };
    
    case 'ADD_JOB':
      return {
        ...state,
        jobs: [...state.jobs, action.payload],
        lastUpdated: Date.now()
      };
    
    case 'UPDATE_LEAD':
      return {
        ...state,
        leads: state.leads.map(lead =>
          lead.id === action.payload.id ? { ...lead, ...action.payload } : lead
        ),
        lastUpdated: Date.now()
      };
    
    case 'ADD_LEAD':
      return {
        ...state,
        leads: [...state.leads, action.payload],
        lastUpdated: Date.now()
      };
    
    case 'SET_CONNECTED_DASHBOARDS':
      return { ...state, connectedDashboards: action.payload };
    
    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [...state.notifications, action.payload]
      };
    
    case 'REMOVE_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.filter(n => n.id !== action.payload)
      };
    
    case 'CLEAR_NOTIFICATIONS':
      return { ...state, notifications: [] };
    
    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Initialize dashboard hub
  useEffect(() => {
    const dashboardName = 'AppProvider';
    dashboardHub.registerDashboard(dashboardName);

    // Set up event listeners
    const handleApplicationStatusChanged = ({ applicationId, newStatus, oldStatus }) => {
      dispatch({
        type: 'UPDATE_APPLICATION',
        payload: { id: applicationId, status: newStatus }
      });
    };

    const handleApplicationCreated = ({ application }) => {
      dispatch({
        type: 'ADD_APPLICATION',
        payload: application
      });
    };

    const handleJobCreated = ({ job }) => {
      dispatch({
        type: 'ADD_JOB',
        payload: job
      });
    };

    const handleJobUpdated = ({ job }) => {
      dispatch({
        type: 'UPDATE_JOB',
        payload: job
      });
    };

    const handleLeadStatusChanged = ({ leadId, newStatus }) => {
      dispatch({
        type: 'UPDATE_LEAD',
        payload: { id: leadId, status: newStatus }
      });
    };

    const handleDataRefresh = () => {
      refreshData();
    };

    const handleNotification = ({ message, type, duration }) => {
      const notification = {
        id: Date.now(),
        message,
        type,
        duration,
        timestamp: Date.now()
      };
      dispatch({
        type: 'ADD_NOTIFICATION',
        payload: notification
      });

      // Auto-remove notification after duration
      setTimeout(() => {
        dispatch({
          type: 'REMOVE_NOTIFICATION',
          payload: notification.id
        });
      }, duration);
    };

    // Subscribe to events
    dashboardHub.on('application:statusChanged', handleApplicationStatusChanged);
    dashboardHub.on('application:created', handleApplicationCreated);
    dashboardHub.on('job:created', handleJobCreated);
    dashboardHub.on('job:updated', handleJobUpdated);
    dashboardHub.on('lead:statusChanged', handleLeadStatusChanged);
    dashboardHub.on('data:refreshAll', handleDataRefresh);
    dashboardHub.on('notification:show', handleNotification);

    return () => {
      dashboardHub.off('application:statusChanged', handleApplicationStatusChanged);
      dashboardHub.off('application:created', handleApplicationCreated);
      dashboardHub.off('job:created', handleJobCreated);
      dashboardHub.off('job:updated', handleJobUpdated);
      dashboardHub.off('lead:statusChanged', handleLeadStatusChanged);
      dashboardHub.off('data:refreshAll', handleDataRefresh);
      dashboardHub.off('notification:show', handleNotification);
      dashboardHub.unregisterDashboard(dashboardName);
    };
  }, []);

  const refreshData = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'CLEAR_ERROR' });
    
    try {
      const [applicationsRes, jobsRes, leadsRes, companiesRes] = await Promise.all([
        apiService.getApplications().catch(() => ({ data: [] })),
        apiService.getJobs().catch(() => ({ data: [] })),
        apiService.getLeads().catch(() => ({ data: [] })),
        apiService.getCompanies().catch(() => ({ data: [] }))
      ]);

      dispatch({ type: 'SET_APPLICATIONS', payload: applicationsRes.data || [] });
      dispatch({ type: 'SET_JOBS', payload: jobsRes.data || [] });
      dispatch({ type: 'SET_LEADS', payload: leadsRes.data || [] });
      dispatch({ type: 'SET_COMPANIES', payload: companiesRes.data || [] });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  };

  const refreshApplications = async () => {
    try {
      const response = await apiService.getApplications();
      dispatch({ type: 'SET_APPLICATIONS', payload: response.data });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  };

  const refreshJobs = async () => {
    try {
      const response = await apiService.getJobs();
      dispatch({ type: 'SET_JOBS', payload: response.data });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  };

  const refreshLeads = async () => {
    try {
      const response = await apiService.getLeads();
      dispatch({ type: 'SET_LEADS', payload: response.data });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  };

  const updateApplicationStatus = async (applicationId, newStatus) => {
    try {
      const oldStatus = state.applications.find(app => app.id === applicationId)?.status;
      
      const response = await apiService.updateApplicationStatus(applicationId, newStatus);
      
      if (response.data.success) {
        dispatch({
          type: 'UPDATE_APPLICATION',
          payload: { id: applicationId, status: newStatus }
        });
        
        // Notify other dashboards
        dashboardHub.applicationStatusChanged(applicationId, newStatus, oldStatus);
        dashboardHub.showSuccess(`Application status updated to ${newStatus}`);
        
        return { success: true, data: response.data };
      } else {
        throw new Error('Failed to update application status');
      }
    } catch (error) {
      dashboardHub.showError(`Failed to update application status: ${error.message}`);
      return { success: false, error: error.message };
    }
  };

  const createJob = async (jobData) => {
    try {
      const response = await apiService.createJob(jobData);
      
      if (response.data.success) {
        dispatch({
          type: 'ADD_JOB',
          payload: response.data.job
        });
        
        // Notify other dashboards
        dashboardHub.jobCreated(response.data.job);
        dashboardHub.showSuccess('Job created successfully');
        
        return { success: true, data: response.data };
      } else {
        throw new Error('Failed to create job');
      }
    } catch (error) {
      dashboardHub.showError(`Failed to create job: ${error.message}`);
      return { success: false, error: error.message };
    }
  };

  const removeNotification = (notificationId) => {
    dispatch({
      type: 'REMOVE_NOTIFICATION',
      payload: notificationId
    });
  };

  const clearNotifications = () => {
    dispatch({ type: 'CLEAR_NOTIFICATIONS' });
  };

  // Auto-refresh data every 30 seconds
  useEffect(() => {
    refreshData();
    const interval = setInterval(refreshData, 30000);
    return () => clearInterval(interval);
  }, []);

  const value = {
    state,
    dispatch,
    refreshData,
    refreshApplications,
    refreshJobs,
    refreshLeads,
    updateApplicationStatus,
    createJob,
    removeNotification,
    clearNotifications
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
