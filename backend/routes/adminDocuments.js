const express = require('express');
const router = express.Router();
const User = require('../models/User');
const verifyToken = require('../middleware/verifyToken');
const verifyAdmin = require('../middleware/verifyAdmin');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

// GET /api/admin-documents - Get admin documents overview
router.get('/', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const usersWithDocs = await User.find({
      $or: [
        { 'documents.aadharCard.filename': { $exists: true } },
        { 'documents.panCard.filename': { $exists: true } },
        { 'documents.marksheet.filename': { $exists: true } },
        { 'documents.certificates.filename': { $exists: true } },
        { 'documents.experienceCertificate.filename': { $exists: true } }
      ]
    }, 'name email documents').sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: usersWithDocs,
      count: usersWithDocs.length
    });
  } catch (err) {
    console.error('Error fetching admin documents:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching admin documents' 
    });
  }
});

/**
 * Get all users with their documents (Admin only)
 */
router.get('/users/documents', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const users = await User.find({
      $or: [
        { 'documents.aadharCard.filename': { $exists: true } },
        { 'documents.panCard.filename': { $exists: true } },
        { 'documents.marksheet.filename': { $exists: true } },
        { 'documents.certificates.filename': { $exists: true } },
        { 'documents.experienceCertificate.filename': { $exists: true } },
        { 'documents.payslip.filename': { $exists: true } },
        { 'documents.bankPassbook.filename': { $exists: true } },
        { 'documents.photo.filename': { $exists: true } }
      ]
    }).select('name email phone onboardingCompleted onboardingCompletedAt documents emergencyContact');

    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('Error fetching users with documents:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users with documents'
    });
  }
});

/**
 * Get specific user documents (Admin only)
 */
router.get('/users/:userId/documents', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findById(userId).select('name email phone onboardingCompleted onboardingCompletedAt documents emergencyContact');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error fetching user documents:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user documents'
    });
  }
});

/**
 * Download document (Admin only)
 */
router.get('/documents/download/:filename', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { filename } = req.params;
    
    // Security check: ensure filename doesn't contain path traversal
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return res.status(400).json({
        success: false,
        message: 'Invalid filename'
      });
    }

    const filePath = path.join(__dirname, '..', 'uploads', 'onboarding', filename);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    // Set appropriate headers for file download
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'application/octet-stream');
    
    // Stream the file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);

    fileStream.on('error', (error) => {
      console.error('Error streaming file:', error);
      res.status(500).json({
        success: false,
        message: 'Error downloading file'
      });
    });

  } catch (error) {
    console.error('Error downloading document:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to download document'
    });
  }
});

/**
 * Get document statistics (Admin only)
 */
router.get('/documents/stats', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const completedOnboarding = await User.countDocuments({ onboardingCompleted: true });
    const pendingOnboarding = totalUsers - completedOnboarding;

    // Document type statistics
    const documentStats = {};
    const documentTypes = ['aadharCard', 'panCard', 'marksheet', 'certificates', 'experienceCertificate', 'payslip', 'bankPassbook', 'photo'];
    
    for (const docType of documentTypes) {
      const count = await User.countDocuments({
        [`documents.${docType}.filename`]: { $exists: true }
      });
      documentStats[docType] = count;
    }

    res.json({
      success: true,
      data: {
        totalUsers,
        completedOnboarding,
        pendingOnboarding,
        documentStats
      }
    });
  } catch (error) {
    console.error('Error fetching document statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch document statistics'
    });
  }
});

/**
 * Update document verification status (Admin only)
 */
router.put('/documents/:userId/:documentType/verify', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { userId, documentType } = req.params;
    const { verified, notes } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (!user.documents || !user.documents[documentType]) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // Update verification status
    user.documents[documentType].verified = verified || false;
    user.documents[documentType].verificationNotes = notes || '';
    user.documents[documentType].verifiedAt = new Date();
    user.documents[documentType].verifiedBy = req.user.id;

    await user.save();

    res.json({
      success: true,
      message: 'Document verification status updated',
      data: user.documents[documentType]
    });
  } catch (error) {
    console.error('Error updating document verification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update document verification'
    });
  }
});

/**
 * Get specific document (Admin only)
 */
router.get('/documents/:userId/:documentType', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { userId, documentType } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (!user.documents || !user.documents[documentType]) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    res.json({
      success: true,
      data: {
        userId: user._id,
        userName: user.name,
        userEmail: user.email,
        documentType,
        document: user.documents[documentType]
      }
    });
  } catch (error) {
    console.error('Error fetching document:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch document'
    });
  }
});

/**
 * Update document metadata (Admin only)
 */
router.put('/documents/:userId/:documentType', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { userId, documentType } = req.params;
    const { originalName, description, notes } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (!user.documents || !user.documents[documentType]) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // Update document metadata
    if (originalName) user.documents[documentType].originalName = originalName;
    if (description) user.documents[documentType].description = description;
    if (notes) user.documents[documentType].notes = notes;
    user.documents[documentType].updatedAt = new Date();
    user.documents[documentType].updatedBy = req.user.id;

    await user.save();

    res.json({
      success: true,
      message: 'Document metadata updated',
      data: user.documents[documentType]
    });
  } catch (error) {
    console.error('Error updating document metadata:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update document metadata'
    });
  }
});

/**
 * Delete document (Admin only)
 */
router.delete('/documents/:userId/:documentType', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { userId, documentType } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (!user.documents || !user.documents[documentType]) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // Get the filename for file deletion
    const filename = user.documents[documentType].filename;
    
    // Delete the document from user record
    delete user.documents[documentType];
    await user.save();

    // Delete the physical file if it exists
    if (filename) {
      const filePath = path.join(__dirname, '..', 'uploads', 'onboarding', filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    res.json({
      success: true,
      message: 'Document deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting document:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete document'
    });
  }
});

/**
 * Upload document (Admin only)
 */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '..', 'uploads', 'onboarding');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `admin-${uniqueSuffix}-${file.originalname}`);
  }
});
const upload = multer({ storage: storage });

router.post('/documents/upload', verifyToken, verifyAdmin, upload.single('document'), async (req, res) => {
  try {
    const { userId, documentType, description, originalName } = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Initialize documents object if it doesn't exist
    if (!user.documents) {
      user.documents = {};
    }

    // Store document information
    user.documents[documentType] = {
      filename: req.file.filename,
      originalName: originalName || req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      uploadedAt: new Date(),
      uploadedBy: req.user.id,
      description: description || '',
      verified: false,
      verificationNotes: ''
    };

    await user.save();

    res.json({
      success: true,
      message: 'Document uploaded successfully',
      data: user.documents[documentType]
    });
  } catch (error) {
    console.error('Error uploading document:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload document'
    });
  }
});

module.exports = router;












