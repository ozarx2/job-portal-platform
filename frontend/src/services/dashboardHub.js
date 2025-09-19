import { EventEmitter } from 'events';

class DashboardHub extends EventEmitter {
  constructor() {
    super();
    this.setMaxListeners(50); // Allow multiple listeners
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

  applicationUpdated(application) {
    console.log(`📝 Application updated: ${application.id}`);
    this.emit('application:updated', { 
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

  jobDeleted(jobId) {
    console.log(`💼 Job deleted: ${jobId}`);
    this.emit('job:deleted', { 
      jobId,
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

  leadAssigned(leadId, agentId, agentName = null) {
    console.log(`👥 Lead ${leadId} assigned to agent ${agentId}`);
    this.emit('lead:assigned', { 
      leadId, 
      agentId, 
      agentName,
      timestamp: Date.now()
    });
  }

  leadUpdated(lead) {
    console.log(`👥 Lead updated: ${lead.id}`);
    this.emit('lead:updated', { 
      lead,
      timestamp: Date.now()
    });
  }

  // User events
  userRoleChanged(userId, newRole, oldRole = null) {
    console.log(`👤 User ${userId} role changed: ${oldRole} → ${newRole}`);
    this.emit('user:roleChanged', { 
      userId, 
      newRole, 
      oldRole,
      timestamp: Date.now()
    });
  }

  userCreated(user) {
    console.log(`👤 New user created: ${user.name}`);
    this.emit('user:created', { 
      user,
      timestamp: Date.now()
    });
  }

  userUpdated(user) {
    console.log(`👤 User updated: ${user.name}`);
    this.emit('user:updated', { 
      user,
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

  refreshUsers() {
    console.log(`🔄 Refreshing users data`);
    this.emit('data:refreshUsers', { timestamp: Date.now() });
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
    this.removeAllListeners();
    this.connectedDashboards.clear();
    console.log('🧹 Dashboard hub cleaned up');
  }
}

export default new DashboardHub();
