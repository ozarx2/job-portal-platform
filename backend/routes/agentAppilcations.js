const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const multer = require('multer');
const User = require('../models/User');
const CandidateProfile = require('../models/CandidateProfile');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/resumes/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});

const upload = multer({ storage });

router.post('/api/applications', upload.single('resume'), async (req, res) => {
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

    // 2. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Create User
    const user = new User({
      name,
      email,
      phone,
      password: hashedPassword,
      role: 'candidate',
    });

    await user.save();

    // 4. Create CandidateProfile
    const profile = new CandidateProfile({
      userId: user._id,
      jobId,
      education,
      experience: parseInt(experience),
      age: parseInt(age),
      location,
      currentEmployer,
      currentEmploymentStatus,
      skills: skills.split(',').map(s => s.trim()),
      resumeUrl: req.file.path
    });

    await profile.save();

    res.status(201).json({ message: 'Candidate registered successfully.', user, profile });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error. Could not register candidate.' });
  }
});
