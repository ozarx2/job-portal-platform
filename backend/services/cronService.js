const cron = require('node-cron');
const Application = require('../models/Application');
const Job = require('../models/Job');
const User = require('../models/User');
const Notification = require('../models/Notification');
const EmailService = require('./emailService');
const sendEmail = require('../utils/email');

class CronService {
  constructor() {
    this.jobs = new Map();
    this.isRunning = false;
  }

  // Start all cron jobs
  start() {
    if (this.isRunning) {
      console.log('Cron service is already running');
      return;
    }

    console.log('Starting cron service...');
    this.isRunning = true;

    // Schedule application status update notifications
    this.scheduleApplicationStatusUpdates();
    
    // Schedule daily application summary
    this.scheduleDailyApplicationSummary();
    
    // Schedule weekly application reports
    this.scheduleWeeklyApplicationReports();

    console.log('Cron service started successfully');
  }

  // Stop all cron jobs
  stop() {
    if (!this.isRunning) {
      console.log('Cron service is not running');
      return;
    }

    console.log('Stopping cron service...');
    
    // Stop all scheduled jobs
    this.jobs.forEach((job, name) => {
      job.stop();
      console.log(`Stopped cron job: ${name}`);
    });
    
    this.jobs.clear();
    this.isRunning = false;
    
    console.log('Cron service stopped successfully');
  }

  // Schedule application status update notifications
  scheduleApplicationStatusUpdates() {
    const jobName = 'application-status-updates';
    
    // Run every 5 minutes to check for status changes
    const job = cron.schedule('*/5 * * * *', async () => {
      try {
        console.log('Running application status update check...');
        await this.checkAndSendStatusUpdates();
      } catch (error) {
        console.error('Error in application status update cron job:', error);
      }
    }, {
      scheduled: false,
      timezone: 'Asia/Kolkata'
    });

    this.jobs.set(jobName, job);
    job.start();
    console.log(`Scheduled cron job: ${jobName} (every 5 minutes)`);
  }

  // Schedule daily application summary
  scheduleDailyApplicationSummary() {
    const jobName = 'daily-application-summary';
    
    // Run daily at 9:00 AM
    const job = cron.schedule('0 9 * * *', async () => {
      try {
        console.log('Running daily application summary...');
        await this.sendDailyApplicationSummary();
      } catch (error) {
        console.error('Error in daily application summary cron job:', error);
      }
    }, {
      scheduled: false,
      timezone: 'Asia/Kolkata'
    });

    this.jobs.set(jobName, job);
    job.start();
    console.log(`Scheduled cron job: ${jobName} (daily at 9:00 AM)`);
  }

  // Schedule weekly application reports
  scheduleWeeklyApplicationReports() {
    const jobName = 'weekly-application-reports';
    
    // Run every Monday at 10:00 AM
    const job = cron.schedule('0 10 * * 1', async () => {
      try {
        console.log('Running weekly application reports...');
        await this.sendWeeklyApplicationReports();
      } catch (error) {
        console.error('Error in weekly application reports cron job:', error);
      }
    }, {
      scheduled: false,
      timezone: 'Asia/Kolkata'
    });

    this.jobs.set(jobName, job);
    job.start();
    console.log(`Scheduled cron job: ${jobName} (weekly on Monday at 10:00 AM)`);
  }

  // Check for application status changes and send notifications
  async checkAndSendStatusUpdates() {
    try {
      // Find applications that have been updated in the last 5 minutes
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      
      const updatedApplications = await Application.find({
        updatedAt: { $gte: fiveMinutesAgo },
        status: { $in: ['Shortlisted', 'Interviewed', 'Selected', 'Hired', 'Rejected', 'Onboarding'] }
      }).populate('candidate', 'name email')
        .populate('job', 'title company');

      console.log(`Found ${updatedApplications.length} applications with recent status updates`);

      for (const application of updatedApplications) {
        try {
          // Check if we've already sent a notification for this status change
          const lastNotification = await this.getLastNotificationTime(application._id, application.status);
          const statusChangedRecently = application.updatedAt > lastNotification;

          if (statusChangedRecently) {
            console.log(`Sending status update notification for application ${application._id} - Status: ${application.status}`);
            
            try {
              await EmailService.sendApplicationStatusUpdate(application, application.status);
              
              // Record successful notification
              await this.recordNotificationSent(
                application._id, 
                application.status, 
                application.candidate._id, 
                'sent'
              );
              
              console.log(`Status update notification sent for application ${application._id}`);
            } catch (emailError) {
              console.error(`Error sending email for application ${application._id}:`, emailError);
              
              // Record failed notification
              await this.recordNotificationSent(
                application._id, 
                application.status, 
                application.candidate._id, 
                'failed', 
                emailError.message
              );
            }
          }
        } catch (error) {
          console.error(`Error processing status update for application ${application._id}:`, error);
        }
      }
    } catch (error) {
      console.error('Error in checkAndSendStatusUpdates:', error);
    }
  }

  // Send daily application summary to candidates
  async sendDailyApplicationSummary() {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Get all candidates with applications
      const candidates = await User.find({ role: 'candidate' });
      
      for (const candidate of candidates) {
        try {
          const applications = await Application.find({
            candidate: candidate._id,
            createdAt: { $gte: today, $lt: tomorrow }
          }).populate('job', 'title company');

          if (applications.length > 0) {
            await this.sendDailySummaryEmail(candidate, applications);
          }
        } catch (error) {
          console.error(`Error sending daily summary to candidate ${candidate.email}:`, error);
        }
      }
    } catch (error) {
      console.error('Error in sendDailyApplicationSummary:', error);
    }
  }

  // Send weekly application reports
  async sendWeeklyApplicationReports() {
    try {
      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      
      // Get all candidates with recent activity
      const candidates = await User.find({ role: 'candidate' });
      
      for (const candidate of candidates) {
        try {
          const applications = await Application.find({
            candidate: candidate._id,
            updatedAt: { $gte: oneWeekAgo }
          }).populate('job', 'title company');

          if (applications.length > 0) {
            await this.sendWeeklyReportEmail(candidate, applications);
          }
        } catch (error) {
          console.error(`Error sending weekly report to candidate ${candidate.email}:`, error);
        }
      }
    } catch (error) {
      console.error('Error in sendWeeklyApplicationReports:', error);
    }
  }

  // Get last notification time for an application status
  async getLastNotificationTime(applicationId, status) {
    const lastNotification = await Notification.findOne({
      application: applicationId,
      type: 'status_update',
      status: status
    }).sort({ sentAt: -1 });

    return lastNotification ? lastNotification.sentAt : new Date(0);
  }

  // Record that a notification was sent
  async recordNotificationSent(applicationId, status, candidateId, emailStatus = 'sent', errorMessage = null) {
    try {
      const notification = new Notification({
        application: applicationId,
        candidate: candidateId,
        type: 'status_update',
        status: status,
        emailStatus: emailStatus,
        errorMessage: errorMessage
      });

      await notification.save();
      console.log(`Recorded notification sent for application ${applicationId} with status ${status}`);
    } catch (error) {
      console.error(`Error recording notification for application ${applicationId}:`, error);
    }
  }

  // Send daily summary email to candidate
  async sendDailySummaryEmail(candidate, applications) {
    try {
      const html = this.generateDailySummaryHTML(candidate, applications);
      
      await sendEmail({
        to: candidate.email,
        subject: 'Daily Application Summary - Ozarx',
        text: `Hello ${candidate.name}, here's your daily application summary.`,
        html: html
      });
      
      console.log(`Daily summary sent to ${candidate.email}`);
    } catch (error) {
      console.error(`Error sending daily summary to ${candidate.email}:`, error);
    }
  }

  // Send weekly report email to candidate
  async sendWeeklyReportEmail(candidate, applications) {
    try {
      const html = this.generateWeeklyReportHTML(candidate, applications);
      
      await sendEmail({
        to: candidate.email,
        subject: 'Weekly Application Report - Ozarx',
        text: `Hello ${candidate.name}, here's your weekly application report.`,
        html: html
      });
      
      console.log(`Weekly report sent to ${candidate.email}`);
    } catch (error) {
      console.error(`Error sending weekly report to ${candidate.email}:`, error);
    }
  }

  // Generate daily summary HTML
  generateDailySummaryHTML(candidate, applications) {
    const applicationList = applications.map(app => `
      <tr>
        <td>${app.job?.title || 'N/A'}</td>
        <td>${app.job?.company || 'N/A'}</td>
        <td><span class="status ${app.status.toLowerCase()}">${app.status}</span></td>
        <td>${new Date(app.createdAt).toLocaleDateString()}</td>
      </tr>
    `).join('');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Daily Application Summary</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
          .table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          .table th, .table td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
          .table th { background-color: #f8f9fa; font-weight: bold; }
          .status { padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; }
          .status.applied { background-color: #e3f2fd; color: #1976d2; }
          .status.shortlisted { background-color: #fff3e0; color: #f57c00; }
          .status.selected { background-color: #e8f5e8; color: #388e3c; }
          .status.hired { background-color: #e8f5e8; color: #2e7d32; }
          .status.rejected { background-color: #ffebee; color: #d32f2f; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📊 Daily Application Summary</h1>
            <p>Your application activity for today</p>
          </div>
          <div class="content">
            <h2>Hello ${candidate.name}!</h2>
            <p>Here's a summary of your application activity for today:</p>
            
            <table class="table">
              <thead>
                <tr>
                  <th>Job Title</th>
                  <th>Company</th>
                  <th>Status</th>
                  <th>Applied Date</th>
                </tr>
              </thead>
              <tbody>
                ${applicationList}
              </tbody>
            </table>
            
            <p>Keep up the great work! Continue applying to more positions to increase your chances of landing your dream job.</p>
            <p>Best regards,<br>The Ozarx Team</p>
          </div>
          <div class="footer">
            <p>© 2024 Ozarx. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Generate weekly report HTML
  generateWeeklyReportHTML(candidate, applications) {
    const statusCounts = applications.reduce((acc, app) => {
      acc[app.status] = (acc[app.status] || 0) + 1;
      return acc;
    }, {});

    const applicationList = applications.map(app => `
      <tr>
        <td>${app.job?.title || 'N/A'}</td>
        <td>${app.job?.company || 'N/A'}</td>
        <td><span class="status ${app.status.toLowerCase()}">${app.status}</span></td>
        <td>${new Date(app.updatedAt).toLocaleDateString()}</td>
      </tr>
    `).join('');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Weekly Application Report</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
          .stats { display: flex; justify-content: space-around; margin: 20px 0; }
          .stat { text-align: center; }
          .stat-number { font-size: 24px; font-weight: bold; color: #667eea; }
          .stat-label { font-size: 14px; color: #666; }
          .table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          .table th, .table td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
          .table th { background-color: #f8f9fa; font-weight: bold; }
          .status { padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; }
          .status.applied { background-color: #e3f2fd; color: #1976d2; }
          .status.shortlisted { background-color: #fff3e0; color: #f57c00; }
          .status.selected { background-color: #e8f5e8; color: #388e3c; }
          .status.hired { background-color: #e8f5e8; color: #2e7d32; }
          .status.rejected { background-color: #ffebee; color: #d32f2f; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📈 Weekly Application Report</h1>
            <p>Your application activity for the past week</p>
          </div>
          <div class="content">
            <h2>Hello ${candidate.name}!</h2>
            <p>Here's a summary of your application activity for the past week:</p>
            
            <div class="stats">
              <div class="stat">
                <div class="stat-number">${applications.length}</div>
                <div class="stat-label">Total Applications</div>
              </div>
              <div class="stat">
                <div class="stat-number">${statusCounts.Shortlisted || 0}</div>
                <div class="stat-label">Shortlisted</div>
              </div>
              <div class="stat">
                <div class="stat-number">${statusCounts.Selected || 0}</div>
                <div class="stat-label">Selected</div>
              </div>
              <div class="stat">
                <div class="stat-number">${statusCounts.Hired || 0}</div>
                <div class="stat-label">Hired</div>
              </div>
            </div>
            
            <table class="table">
              <thead>
                <tr>
                  <th>Job Title</th>
                  <th>Company</th>
                  <th>Status</th>
                  <th>Last Updated</th>
                </tr>
              </thead>
              <tbody>
                ${applicationList}
              </tbody>
            </table>
            
            <p>Great job on your job search progress! Keep applying and stay positive.</p>
            <p>Best regards,<br>The Ozarx Team</p>
          </div>
          <div class="footer">
            <p>© 2024 Ozarx. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Get status of all cron jobs
  getStatus() {
    const status = {
      isRunning: this.isRunning,
      jobs: []
    };

    this.jobs.forEach((job, name) => {
      status.jobs.push({
        name,
        running: job.running,
        nextDate: job.nextDate ? job.nextDate() : null
      });
    });

    return status;
  }
}

module.exports = CronService;
