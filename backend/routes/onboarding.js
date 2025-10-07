const express = require('express');
const router = express.Router();
const Onboarding = require('../models/Onboarding');
const Application = require('../models/Application');
const User = require('../models/User');
const Job = require('../models/Job');
const Company = require('../models/Company');
const verifyToken = require('../middleware/verifyToken');
const verifyAdmin = require('../middleware/verifyAdmin');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// GET /api/onboarding - Get all onboarding records
router.get('/', verifyToken, async (req, res) => {
  try {
    const onboardingRecords = await Onboarding.find()
      .populate('candidate', 'name email')
      .populate('company', 'name')
      .populate('job', 'title')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: onboardingRecords,
      count: onboardingRecords.length
    });
  } catch (err) {
    console.error('Error fetching onboarding records:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching onboarding records' 
    });
  }
});

// Setup Multer for document uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const folder = 'uploads/onboarding/';
    fs.mkdirSync(folder, { recursive: true });
    cb(null, folder);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, `${req.user.id}-${Date.now()}${ext}`);
  },
});

const upload = multer({ storage });

/**
 * 1️⃣ Create onboarding process for selected candidate
 */
router.post('/', verifyToken, async (req, res) => {
  try {
    console.log('Onboarding POST request received:', req.body);
    const { applicationId, startDate, assignedHR, assignedManager } = req.body;

    if (!applicationId) {
      console.log('Error: Application ID is missing');
      return res.status(400).json({ success: false, message: 'Application ID is required' });
    }

    console.log('Looking for application with ID:', applicationId);
    // Get application details
    const application = await Application.findById(applicationId)
      .populate('job')
      .populate('candidate');
    
    console.log('Application found:', application ? 'Yes' : 'No');

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    console.log('Onboarding validation - Application details:', {
      applicationId,
      applicationStatus: application.status,
      statusType: typeof application.status,
      allowedStatuses: ['Selected', 'Hired']
    });

    // Check if application status is 'Selected' or 'Hired'
    if (!['Selected', 'Hired'].includes(application.status)) {
      console.log('Onboarding rejected - Invalid status:', application.status);
      return res.status(400).json({ 
        success: false, 
        message: 'Onboarding can only be started for selected or hired candidates' 
      });
    }

    // Check if onboarding already exists
    const existingOnboarding = await Onboarding.findOne({ applicationId });
    if (existingOnboarding) {
      return res.status(400).json({ 
        success: false, 
        message: 'Onboarding process already exists for this application' 
      });
    }

    // Get job and company details
    console.log('Looking for job with ID:', application.job);
    const job = await Job.findById(application.job);
    if (!job) {
      console.log('Job not found for ID:', application.job);
      return res.status(404).json({ success: false, message: 'Job not found' });
    }
    console.log('Job found:', job.title);
    
    console.log('Looking for company with ID:', job.companyId);
    const company = await Company.findById(job.companyId);
    if (!company) {
      console.log('Company not found for ID:', job.companyId);
      return res.status(404).json({ success: false, message: 'Company not found' });
    }
    console.log('Company found:', company.name);

    // Create onboarding process
    console.log('Creating onboarding record...');
    const onboarding = new Onboarding({
      applicationId,
      candidateId: application.candidate,
      jobId: application.job,
      companyId: job.companyId,
      startDate: startDate || new Date(),
      assignedHR: assignedHR || req.user.id,
      assignedManager: assignedManager,
      status: 'pending',
      steps: {
        documentVerification: {
          status: 'pending',
          requiredDocuments: [
            'Aadhar Card (Clear front and back scan)',
            'PAN Card (Clear scan of the card)',
            'Marksheet (All academic marksheets)',
            'Certificates (Degree/diploma certificates)',
            'Experience Certificate (From previous employers - if applicable)',
            'Payslip (Recent payslips - if applicable)',
            'Bank Passbook (First page with account details)',
            'Photo (Recent passport-size photograph)'
          ],
          submittedDocuments: [],
          verificationNotes: ''
        },
        backgroundCheck: {
          status: 'pending',
          provider: '',
          referenceNumber: '',
          completedAt: null,
          notes: ''
        },
        hrPaperwork: {
          status: 'pending',
          documents: [
            'Employment Agreement',
            'NDA (Non-Disclosure Agreement)',
            'Code of Conduct',
            'Employee Handbook Acknowledgment'
          ],
          completedAt: null
        },
        itSetup: {
          status: 'pending',
          emailSetup: false,
          systemAccess: false,
          equipmentAssigned: false,
          completedAt: null
        },
        orientation: {
          status: 'pending',
          scheduledDate: null,
          completedAt: null,
          attended: false
        },
        training: {
          status: 'pending',
          modules: [
            { name: 'Company Policies', status: 'pending' },
            { name: 'Job Role Training', status: 'pending' },
            { name: 'Safety Training', status: 'pending' },
            { name: 'System Training', status: 'pending' },
            { name: 'Compliance Training', status: 'pending' }
          ],
          completedAt: null
        },
        finalApproval: {
          status: 'pending',
          approvedBy: null,
          approvedAt: null,
          notes: ''
        }
      }
    });

    console.log('Saving onboarding record...');
    await onboarding.save();
    console.log('Onboarding record saved with ID:', onboarding._id);

    // Update application status to 'onboarding'
    console.log('Updating application status to Onboarding...');
    await Application.findByIdAndUpdate(applicationId, { 
      status: 'Onboarding' 
    });
    console.log('Application status updated successfully');

    // Populate the response
    await onboarding.populate([
      { path: 'candidateId', select: 'name email phone' },
      { path: 'jobId', select: 'title location' },
      { path: 'companyId', select: 'name' },
      { path: 'assignedHR', select: 'name email' },
      { path: 'assignedManager', select: 'name email' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Onboarding process started successfully',
      data: onboarding
    });

  } catch (error) {
    console.error('Error creating onboarding:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    res.status(500).json({ 
      success: false, 
      message: 'Failed to start onboarding process',
      error: error.message 
    });
  }
});

/**
 * 2️⃣ Get onboarding details for candidate
 */
router.get('/candidate/:candidateId', verifyToken, async (req, res) => {
  try {
    const { candidateId } = req.params;
    const { status } = req.query;

    // Verify user can access this candidate's data
    if (req.user.role !== 'admin' && req.user.role !== 'hr' && req.user.id !== candidateId) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied' 
      });
    }

    const query = { candidateId };
    if (status) query.status = status;

    const onboarding = await Onboarding.find(query)
      .populate([
        { path: 'jobId', select: 'title location company' },
        { path: 'companyId', select: 'name' },
        { path: 'assignedHR', select: 'name email' },
        { path: 'assignedManager', select: 'name email' }
      ])
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: onboarding
    });

  } catch (error) {
    console.error('Error fetching candidate onboarding:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch onboarding data' 
    });
  }
});

/**
 * 3️⃣ Get onboarding details for company/HR
 */
router.get('/company/:companyId', verifyToken, async (req, res) => {
  try {
    const { companyId } = req.params;
    const { status } = req.query;

    // Verify user has access to this company's data
    if (req.user.role !== 'admin' && req.user.companyId?.toString() !== companyId) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied' 
      });
    }

    const query = { companyId };
    if (status) query.status = status;

    const onboarding = await Onboarding.find(query)
      .populate([
        { path: 'candidateId', select: 'name email phone' },
        { path: 'jobId', select: 'title location' },
        { path: 'assignedHR', select: 'name email' },
        { path: 'assignedManager', select: 'name email' }
      ])
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: onboarding
    });

  } catch (error) {
    console.error('Error fetching company onboarding:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch onboarding data' 
    });
  }
});

/**
 * 4️⃣ Update onboarding step status
 */
router.put('/:onboardingId/step', verifyToken, async (req, res) => {
  try {
    const { onboardingId } = req.params;
    const { step, status, data } = req.body;

    const onboarding = await Onboarding.findById(onboardingId);
    if (!onboarding) {
      return res.status(404).json({ 
        success: false, 
        message: 'Onboarding process not found' 
      });
    }

    // Verify user has permission to update
    const canUpdate = req.user.role === 'admin' || 
                     req.user.role === 'hr' || 
                     onboarding.assignedHR?.toString() === req.user.id ||
                     onboarding.candidateId?.toString() === req.user.id;

    if (!canUpdate) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied' 
      });
    }

    // Update the specific step
    if (onboarding.steps[step]) {
      onboarding.steps[step].status = status;
      
      if (data) {
        Object.assign(onboarding.steps[step], data);
      }
      
      if (status === 'completed') {
        onboarding.steps[step].completedAt = new Date();
      }
    }

    // Check if all steps are completed
    const allStepsCompleted = Object.values(onboarding.steps).every(step => 
      step.status === 'completed' || step.status === 'approved'
    );

    if (allStepsCompleted) {
      onboarding.status = 'completed';
      onboarding.completionDate = new Date();
      
      // Update application status to 'hired'
      await Application.findByIdAndUpdate(onboarding.applicationId, { 
        status: 'Hired' 
      });
    }

    await onboarding.save();

    res.json({
      success: true,
      message: 'Onboarding step updated successfully',
      data: onboarding
    });

  } catch (error) {
    console.error('Error updating onboarding step:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update onboarding step' 
    });
  }
});

/**
 * 5️⃣ Upload documents for onboarding
 */
router.post('/:onboardingId/documents', verifyToken, upload.array('documents'), async (req, res) => {
  try {
    const { onboardingId } = req.params;
    const { documentType } = req.body;

    const onboarding = await Onboarding.findById(onboardingId);
    if (!onboarding) {
      return res.status(404).json({ 
        success: false, 
        message: 'Onboarding process not found' 
      });
    }

    // Verify user has permission
    if (onboarding.candidateId?.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied' 
      });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'No documents uploaded' 
      });
    }

    // Add documents to the onboarding record
    const uploadedDocs = req.files.map(file => ({
      type: documentType,
      filename: file.filename,
      originalName: file.originalname,
      path: `/uploads/onboarding/${file.filename}`,
      uploadedAt: new Date()
    }));

    if (!onboarding.steps.documentVerification.submittedDocuments) {
      onboarding.steps.documentVerification.submittedDocuments = [];
    }
    
    onboarding.steps.documentVerification.submittedDocuments.push(...uploadedDocs);

    // Update document verification status
    if (onboarding.steps.documentVerification.submittedDocuments.length > 0) {
      onboarding.steps.documentVerification.status = 'in_progress';
    }

    await onboarding.save();

    res.json({
      success: true,
      message: 'Documents uploaded successfully',
      data: uploadedDocs
    });

  } catch (error) {
    console.error('Error uploading documents:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to upload documents' 
    });
  }
});

/**
 * 6️⃣ Add notes to onboarding
 */
router.post('/:onboardingId/notes', verifyToken, async (req, res) => {
  try {
    const { onboardingId } = req.params;
    const { content } = req.body;

    const onboarding = await Onboarding.findById(onboardingId);
    if (!onboarding) {
      return res.status(404).json({ 
        success: false, 
        message: 'Onboarding process not found' 
      });
    }

    // Add note
    onboarding.notes.push({
      author: req.user.id,
      content,
      createdAt: new Date()
    });

    await onboarding.save();

    res.json({
      success: true,
      message: 'Note added successfully',
      data: onboarding.notes
    });

  } catch (error) {
    console.error('Error adding note:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to add note' 
    });
  }
});

/**
 * 7️⃣ Get onboarding statistics (for admin/HR dashboard)
 */
router.get('/stats/:companyId', verifyToken, async (req, res) => {
  try {
    const { companyId } = req.params;

    // Verify user has access
    if (req.user.role !== 'admin' && req.user.companyId?.toString() !== companyId) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied' 
      });
    }

    const mongoose = require('mongoose');
    const stats = await Onboarding.aggregate([
      { $match: { companyId: mongoose.Types.ObjectId(companyId) } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const stepStats = await Onboarding.aggregate([
      { $match: { companyId: mongoose.Types.ObjectId(companyId) } },
      {
        $project: {
          documentVerification: '$steps.documentVerification.status',
          backgroundCheck: '$steps.backgroundCheck.status',
          hrPaperwork: '$steps.hrPaperwork.status',
          itSetup: '$steps.itSetup.status',
          orientation: '$steps.orientation.status',
          training: '$steps.training.status',
          finalApproval: '$steps.finalApproval.status'
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        statusStats: stats,
        stepStats: stepStats
      }
    });

  } catch (error) {
    console.error('Error fetching onboarding stats:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch onboarding statistics' 
    });
  }
});

module.exports = router;
