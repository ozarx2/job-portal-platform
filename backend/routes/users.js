const express = require('express');
const router = express.Router();
const User = require('../models/User');
const verifyToken = require('../middleware/verifyToken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

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


// ✅ Update profile (name, email, role)
router.put('/profile', verifyToken, async (req, res) => {
  const { name, email } = req.body;

  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, email },
      { new: true }
    );
    res.json({ user });
  } catch (err) {
    res.status(500).json({ msg: 'Failed to update profile' });
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
