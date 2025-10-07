const express = require('express');
const router = express.Router();
const User = require('../models/User');
const verifyToken = require('../middleware/verifyToken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// GET /api/simple-onboarding - Get simple onboarding status
router.get('/', verifyToken, async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Simple onboarding service is available',
      endpoints: [
        'POST /api/simple-onboarding/upload-documents',
        'POST /api/simple-onboarding/complete-profile',
        'GET /api/simple-onboarding/status/:userId'
      ]
    });
  } catch (err) {
    console.error('Error checking simple onboarding service:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Error checking simple onboarding service' 
    });
  }
});

// Setup Multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const folder = 'uploads/onboarding/';
    fs.mkdirSync(folder, { recursive: true });
    cb(null, folder);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, `${req.user.id}-${Date.now()}-${file.fieldname}${ext}`);
  },
});

const upload = multer({ 
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

/**
 * Simple Onboarding Form Submission
 */
router.post('/simple-submit', verifyToken, upload.fields([
  { name: 'aadharCard', maxCount: 1 },
  { name: 'panCard', maxCount: 1 },
  { name: 'marksheet', maxCount: 1 },
  { name: 'certificates', maxCount: 1 },
  { name: 'experienceCertificate', maxCount: 1 },
  { name: 'payslip', maxCount: 1 },
  { name: 'bankPassbook', maxCount: 1 },
  { name: 'photo', maxCount: 1 }
]), async (req, res) => {
  try {
    console.log('Simple onboarding submission received:', req.body);
    console.log('Files uploaded:', req.files);

    const {
      name,
      email,
      phone,
      address,
      emergencyContactName,
      emergencyContactPhone,
      emergencyContactRelation
    } = req.body;

    // Validate required fields
    const requiredFields = ['name', 'email', 'phone', 'address', 'emergencyContactName', 'emergencyContactPhone', 'emergencyContactRelation'];
    const missingFields = requiredFields.filter(field => !req.body[field] || req.body[field].trim() === '');
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`
      });
    }

    // Get user
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update user profile with onboarding information
    const updateData = {
      name: name.trim(),
      phone: phone.trim(),
      location: address.trim(),
      // Add emergency contact information
      emergencyContact: {
        name: emergencyContactName.trim(),
        phone: emergencyContactPhone.trim(),
        relation: emergencyContactRelation.trim()
      },
      // Mark as onboarding completed
      onboardingCompleted: true,
      onboardingCompletedAt: new Date()
    };

    // Only update email if it's different from current email
    if (email.trim() !== user.email) {
      // Check if the new email already exists for another user
      const existingUser = await User.findOne({ email: email.trim(), _id: { $ne: user._id } });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email address is already in use by another account'
        });
      }
      updateData.email = email.trim();
    }

    // Handle file uploads
    if (req.files) {
      const documentFields = [
        'aadharCard', 'panCard', 'marksheet', 'certificates',
        'experienceCertificate', 'payslip', 'bankPassbook', 'photo'
      ];

      updateData.documents = {};

      documentFields.forEach(field => {
        if (req.files[field] && req.files[field][0]) {
          const file = req.files[field][0];
          updateData.documents[field] = {
            filename: file.filename,
            originalName: file.originalname,
            path: `/uploads/onboarding/${file.filename}`,
            uploadedAt: new Date(),
            fieldName: field
          };
        }
      });
    }

    // Update user record
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true, runValidators: true }
    );

    console.log('User updated successfully:', updatedUser._id);

    res.json({
      success: true,
      message: 'Onboarding completed successfully',
      data: {
        userId: updatedUser._id,
        onboardingCompleted: true,
        documentsUploaded: Object.keys(updateData.documents || {}).length
      }
    });

  } catch (error) {
    console.error('Simple onboarding error:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error: ' + validationErrors.join(', ')
      });
    }

    // Handle duplicate email error
    if (error.name === 'MongoError' && error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Email address is already in use'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to complete onboarding. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * Get onboarding status
 */
router.get('/status', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: {
        onboardingCompleted: user.onboardingCompleted || false,
        onboardingCompletedAt: user.onboardingCompletedAt,
        documentsUploaded: user.documents ? Object.keys(user.documents).length : 0,
        emergencyContact: user.emergencyContact || null
      }
    });

  } catch (error) {
    console.error('Error fetching onboarding status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch onboarding status'
    });
  }
});

/**
 * 2️⃣ Upload individual document
 */
router.post('/upload-document', verifyToken, upload.fields([
  { name: 'aadharCard', maxCount: 1 },
  { name: 'panCard', maxCount: 1 },
  { name: 'marksheet', maxCount: 1 },
  { name: 'certificates', maxCount: 1 },
  { name: 'experienceCertificate', maxCount: 1 },
  { name: 'payslip', maxCount: 1 },
  { name: 'bankPassbook', maxCount: 1 },
  { name: 'photo', maxCount: 1 }
]), async (req, res) => {
  try {
    const files = req.files;
    
    if (!files || Object.keys(files).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    // Get the first uploaded file
    const fieldName = Object.keys(files)[0];
    const file = files[fieldName][0];

    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.mimetype)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid file type. Please upload PDF, JPG, PNG, DOC, or DOCX files only.'
      });
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return res.status(400).json({
        success: false,
        message: 'File size too large. Maximum size is 10MB.'
      });
    }

    res.json({
      success: true,
      message: 'Document uploaded successfully',
      filename: file.filename,
      originalName: file.originalname,
      fieldName: fieldName,
      size: file.size,
      mimetype: file.mimetype
    });

  } catch (error) {
    console.error('Document upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload document'
    });
  }
});

module.exports = router;
