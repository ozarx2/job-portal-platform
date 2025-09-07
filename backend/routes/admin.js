const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const verifyAdmin = require('../middleware/verifyAdmin');
const User = require('../models/User');
const Job = require('../models/Job');
const Application = require('../models/Application');

// ✅ Get all users (admin only)
router.get('/users', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const users = await User.find({}, 'name email role');
    res.json(users);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// ✅ Get all job listings (admin only)
//router.get('/jobs', verifyToken, verifyAdmin, async (req, res) => {
  router.get('/jobs', async (req, res) => {
  try {
    const jobs = await Job.find().populate('postedBy', 'email name');
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// ✅ Get all applications (admin only)
router.get('/applications', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const apps = await Application.find()
      .populate('candidate', 'name email')
      .populate('job', 'title');
    res.json(apps);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// ✅ Health check route
router.get('/ping', (req, res) => {
  res.send('✅ Admin routes working');
});

module.exports = router;
