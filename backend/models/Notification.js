const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  application: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Application',
    required: true
  },
  candidate: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['status_update', 'daily_summary', 'weekly_report', 'interview_reminder'],
    required: true
  },
  status: {
    type: String,
    enum: ['Applied', 'Shortlisted', 'Interviewed', 'Selected', 'Hired', 'Rejected', 'Onboarding'],
    required: function() {
      return this.type === 'status_update';
    }
  },
  sentAt: {
    type: Date,
    default: Date.now
  },
  emailSent: {
    type: Boolean,
    default: true
  },
  emailStatus: {
    type: String,
    enum: ['sent', 'failed', 'pending'],
    default: 'sent'
  },
  errorMessage: {
    type: String
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Index for efficient queries
NotificationSchema.index({ application: 1, type: 1, status: 1 });
NotificationSchema.index({ candidate: 1, sentAt: -1 });
NotificationSchema.index({ sentAt: -1 });

module.exports = mongoose.model('Notification', NotificationSchema);








