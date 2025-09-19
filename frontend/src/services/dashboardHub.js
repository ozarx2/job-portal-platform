class DashboardHub {
  constructor() {
    this.listeners = new Map();
    this.connectedDashboards = new Set();
  }

  // Register dashboard
  registerDashboard(dashboardName) {
    this.connectedDashboards.add(dashboardName);
    console.log(`📊 Dashboard ${dashboardName} connected`);
    this.emit('dashboard:connected', dashboardName);
  }

  // Unregister dashboard
  unregisterDashboard(dashboardName) {
    this.connectedDashboards.delete(dashboardName);
    console.log(`📊 Dashboard ${dashboardName} disconnected`);
    this.emit('dashboard:disconnected', dashboardName);
  }

  // Event system
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => callback(data));
    }
  }

  // Application events
  applicationStatusChanged(applicationId, newStatus, oldStatus = null) {
    console.log(`📝 Application ${applicationId} status changed: ${oldStatus} → ${newStatus}`);
    this.emit('application:statusChanged', { 
      applicationId, 
      newStatus, 
      oldStatus,
      timestamp: Date.now()
    });
  }

  applicationCreated(application) {
    console.log(`📝 New application created: ${application.id}`);
    this.emit('application:created', { 
      application,
      timestamp: Date.now()
    });
  }

  // Job events
  jobCreated(job) {
    console.log(`💼 New job created: ${job.title}`);
    this.emit('job:created', { 
      job,
      timestamp: Date.now()
    });
  }

  jobUpdated(job) {
    console.log(`💼 Job updated: ${job.title}`);
    this.emit('job:updated', { 
      job,
      timestamp: Date.now()
    });
  }

  // Lead events
  leadStatusChanged(leadId, newStatus, oldStatus = null) {
    console.log(`👥 Lead ${leadId} status changed: ${oldStatus} → ${newStatus}`);
    this.emit('lead:statusChanged', { 
      leadId, 
      newStatus, 
      oldStatus,
      timestamp: Date.now()
    });
  }

  // Data refresh events
  refreshApplications() {
    console.log(`🔄 Refreshing applications data`);
    this.emit('data:refreshApplications', { timestamp: Date.now() });
  }

  refreshJobs() {
    console.log(`🔄 Refreshing jobs data`);
    this.emit('data:refreshJobs', { timestamp: Date.now() });
  }

  refreshLeads() {
    console.log(`🔄 Refreshing leads data`);
    this.emit('data:refreshLeads', { timestamp: Date.now() });
  }

  refreshAll() {
    console.log(`🔄 Refreshing all data`);
    this.emit('data:refreshAll', { timestamp: Date.now() });
  }

  // Notification events
  showNotification(message, type = 'info', duration = 5000) {
    console.log(`🔔 Notification: ${message}`);
    this.emit('notification:show', { 
      message, 
      type, 
      duration,
      timestamp: Date.now()
    });
  }

  showSuccess(message, duration = 3000) {
    this.showNotification(message, 'success', duration);
  }

  showError(message, duration = 5000) {
    this.showNotification(message, 'error', duration);
  }

  showWarning(message, duration = 4000) {
    this.showNotification(message, 'warning', duration);
  }

  showInfo(message, duration = 3000) {
    this.showNotification(message, 'info', duration);
  }

  // Dashboard status
  getConnectedDashboards() {
    return Array.from(this.connectedDashboards);
  }

  isDashboardConnected(dashboardName) {
    return this.connectedDashboards.has(dashboardName);
  }

  // Cleanup
  cleanup() {
    this.listeners.clear();
    this.connectedDashboards.clear();
    console.log('🧹 Dashboard hub cleaned up');
  }
}

export default new DashboardHub();