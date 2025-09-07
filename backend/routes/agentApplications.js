const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const User = require('../models/User');
const CandidateProfile = require('../models/CandidatesProfile');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '..', 'uploads', 'resumes');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});

const upload = multer({ storage });

/**
 * Candidate Registration Route
 * Expects: name, email, phone, password, jobId, resume + optional fields
 */
router.post('/', upload.single('resume'), async (req, res) => {
  try {
    const {
      name, email, phone, password,
      education, experience, age, location,
      currentEmployer, currentEmploymentStatus,
      skills, jobId
    } = req.body;

    // 1. Validate required fields
    if (!name || !email || !phone || !password || !jobId || !req.file) {
      return res.status(400).json({ error: 'Missing required fields.' });
    }

    // 2. Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email or phone already exists.' });
    }

    // 3. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Create User
    const user = new User({
      name,
      email,
      phone,
      password: hashedPassword,
      role: 'candidate',
    });
    await user.save();

    // 5. Create CandidateProfile
    const profile = new CandidateProfile({
      userId: user._id,
      jobId,
      education,
      experience: experience ? parseInt(experience) : null,
      age: age ? parseInt(age) : null,
      location,
      currentEmployer,
      currentEmploymentStatus,
      skills: skills ? skills.split(',').map(s => s.trim()) : [],
      resumeUrl: `/uploads/resumes/${req.file.filename}`
    });

    await profile.save();

    res.status(201).json({
      message: 'Candidate registered successfully.',
      user,
      profile
    });
  } catch (err) {
    console.error('❌ Error in candidate registration:', err);
    res.status(500).json({ error: 'Server error. Could not register candidate.' });
  }
});

module.exports = router;

