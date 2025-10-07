const express = require('express');
const router = express.Router();
const User = require('../models/User');
const verifyToken = require('../middleware/verifyToken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// GET /api/users - Get all users
router.get('/', verifyToken, async (req, res) => {
  try {
    const users = await User.find({}, 'name email role createdAt')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: users,
      count: users.length
    });
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching users' 
    });
  }
});

// Setup Multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const folder = file.fieldname === 'resume' ? 'uploads/resumes/' : 'uploads/profiles/';
    fs.mkdirSync(folder, { recursive: true });
    cb(null, folder);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, `${req.user.id}-${Date.now()}${ext}`);
  },
});

const upload = multer({ storage });


// ✅ Update profile (name, email, role, and other fields)
router.put('/profile', verifyToken, upload.single('image'), async (req, res) => {
  try {
    console.log('📝 Profile update request body:', req.body);
    console.log('📁 Profile image file:', req.file);
    console.log('🔍 Experience field from request:', {
      value: req.body.experience,
      type: typeof req.body.experience,
      raw: JSON.stringify(req.body.experience)
    });
    
    const {
      name,
      email,
      phone,
      location,
      experience,
      education,
      skills,
      bio,
      website,
      linkedin,
      github,
      companyId
    } = req.body;

    // Prepare update data
    const updateData = {};
    
    if (name) updateData.name = name.trim();
    if (email) updateData.email = email.trim();
    if (phone) updateData.phone = phone.trim();
    if (location) updateData.location = location.trim();
    if (experience !== undefined && experience !== null && experience !== '') {
      // Convert experience to number
      const expValue = parseInt(experience);
      if (!isNaN(expValue) && expValue >= 0) {
        updateData.experience = expValue;
        console.log('🔍 Experience processing:', {
          original: experience,
          processed: updateData.experience,
          type: typeof updateData.experience
        });
      } else {
        console.warn('Invalid experience value:', experience);
        // Keep existing experience value if invalid
      }
    }
    if (education) updateData.education = education.trim();
    if (skills) {
      // Handle skills as comma-separated string or array
      const skillsArray = typeof skills === 'string' 
        ? skills.split(',').map(s => s.trim()).filter(s => s.length > 0)
        : Array.isArray(skills) ? skills : [];
      updateData.skills = skillsArray;
    }
    if (bio) updateData.bio = bio.trim();
    if (website) updateData.website = website.trim();
    if (linkedin) updateData.linkedin = linkedin.trim();
    if (github) updateData.github = github.trim();
    if (companyId) updateData.companyId = companyId.trim();
    
    // Handle profile image upload
    if (req.file) {
      updateData.profileImage = `/uploads/profiles/${req.file.filename}`;
    }

    console.log('📝 Update data:', updateData);
    console.log('🔍 Final experience value being sent to DB:', {
      value: updateData.experience,
      type: typeof updateData.experience,
      raw: JSON.stringify(updateData.experience)
    });
    console.log('🏢 Company ID processing:', {
      received: req.body.companyId,
      processed: updateData.companyId,
      type: typeof updateData.companyId
    });

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    console.log('✅ Profile updated successfully:', user._id);
    
    res.json({ 
      success: true,
      message: 'Profile updated successfully',
      user 
    });
  } catch (err) {
    console.error('❌ Profile update error:', err);
    console.error('❌ Error details:', {
      message: err.message,
      stack: err.stack,
      name: err.name
    });
    
    // Check for specific MongoDB validation errors
    if (err.name === 'ValidationError') {
      const validationErrors = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: validationErrors
      });
    }
    
    // Check for cast errors
    if (err.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: `Invalid value for field: ${err.path}`,
        error: `Cast to ${err.kind} failed for value "${err.value}"`
      });
    }
    
    res.status(500).json({ 
      success: false,
      message: 'Failed to update profile',
      error: err.message 
    });
  }
});


// ✅ Upload resume
router.post('/resume', verifyToken, upload.single('resume'), async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { resumeUrl: `/uploads/resumes/${req.file.filename}` },
      { new: true }
    );
    res.json({ msg: 'Resume uploaded', resumeUrl: user.resumeUrl });
  } catch (err) {
    res.status(500).json({ msg: 'Failed to upload resume' });
  }
});


// ✅ Upload profile picture
router.post('/profile-image', verifyToken, upload.single('profileImage'), async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { profileImage: `/uploads/profiles/${req.file.filename}` },
      { new: true }
    );
    res.json({ msg: 'Profile image uploaded', profileImage: user.profileImage });
  } catch (err) {
    res.status(500).json({ msg: 'Failed to upload profile image' });
  }
});

module.exports = router;
