const mongoose = require('mongoose');

// Clear the model cache to avoid conflicts
delete mongoose.connection.models['Onboarding'];

const OnboardingSchema = new mongoose.Schema({
  // References
  applicationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Application',
    required: true
  },
  candidateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  
  // Onboarding Status
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  
  // Onboarding Steps
  steps: {
    // Documentation & Verification
        documentVerification: {
          status: { type: String, enum: ['pending', 'in_progress', 'completed', 'rejected'], default: 'pending' },
          requiredDocuments: [String],
          submittedDocuments: [{
            type: { type: String, required: true },
            filename: { type: String, required: true },
            originalName: { type: String, required: true },
            path: { type: String, required: true },
            uploadedAt: { type: Date, default: Date.now },
            verified: { type: Boolean, default: false },
            verificationNotes: String
          }],
          verificationNotes: String,
          completedAt: Date
        },
    
    // Background Check
    backgroundCheck: {
      status: { type: String, enum: ['pending', 'in_progress', 'completed', 'failed'], default: 'pending' },
      provider: String,
      referenceNumber: String,
      completedAt: Date,
      notes: String
    },
    
    // HR Paperwork
    hrPaperwork: {
      status: { type: String, enum: ['pending', 'in_progress', 'completed'], default: 'pending' },
      documents: [String],
      completedAt: Date
    },
    
    // IT Setup
    itSetup: {
      status: { type: String, enum: ['pending', 'in_progress', 'completed'], default: 'pending' },
      emailSetup: { type: Boolean, default: false },
      systemAccess: { type: Boolean, default: false },
      equipmentAssigned: { type: Boolean, default: false },
      completedAt: Date
    },
    
    // Orientation
    orientation: {
      status: { type: String, enum: ['pending', 'scheduled', 'completed'], default: 'pending' },
      scheduledDate: Date,
      completedAt: Date,
      attended: { type: Boolean, default: false }
    },
    
    // Training
    training: {
      status: { type: String, enum: ['pending', 'in_progress', 'completed'], default: 'pending' },
      modules: [{
        name: String,
        status: { type: String, enum: ['pending', 'in_progress', 'completed'], default: 'pending' },
        completedAt: Date
      }],
      completedAt: Date
    },
    
    // Final Approval
    finalApproval: {
      status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
      approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      approvedAt: Date,
      notes: String
    }
  },
  
  // Additional Information
  startDate: Date,
  completionDate: Date,
  assignedHR: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  assignedManager: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  
  // Communication
  notes: [{
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    content: String,
    createdAt: { type: Date, default: Date.now }
  }],
  
  // Notifications
  notifications: [{
    type: String,
    message: String,
    sentAt: { type: Date, default: Date.now },
    read: { type: Boolean, default: false }
  }]
  
}, { timestamps: true });

// Index for efficient queries
OnboardingSchema.index({ candidateId: 1, status: 1 });
OnboardingSchema.index({ applicationId: 1 });
OnboardingSchema.index({ companyId: 1, status: 1 });

module.exports = mongoose.model('Onboarding', OnboardingSchema);
