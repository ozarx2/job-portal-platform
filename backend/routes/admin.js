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

// ✅ Get dashboard stats (admin only)
router.get('/dashboard-stats', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalJobs = await Job.countDocuments();
    const totalApplications = await Application.countDocuments();
    
    // For now, set documents to 0 - you can add a Document model later
    const totalDocuments = 0;
    
    res.json({
      success: true,
      data: {
        totalUsers,
        totalJobs,
        totalApplications,
        totalDocuments
      }
    });
  } catch (err) {
    console.error('Error fetching dashboard stats:', err);
    res.status(500).json({ 
      success: false,
      msg: err.message 
    });
  }
});

// ✅ Update user (admin only)
router.put('/users/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // Remove sensitive fields that shouldn't be updated via this route
    delete updateData.password;
    delete updateData._id;
    
    const user = await User.findByIdAndUpdate(id, updateData, { new: true });
    
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    // Return user without password
    const { password, ...userWithoutPassword } = user.toObject();
    res.json({
      success: true,
      msg: 'User updated successfully',
      user: userWithoutPassword
    });
  } catch (err) {
    console.error('Error updating user:', err);
    res.status(500).json({ 
      success: false,
      msg: err.message 
    });
  }
});

// ✅ Delete user (admin only)
router.delete('/users/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findByIdAndDelete(id);
    
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    res.json({
      success: true,
      msg: 'User deleted successfully'
    });
  } catch (err) {
    console.error('Error deleting user:', err);
    res.status(500).json({ 
      success: false,
      msg: err.message 
    });
  }
});

// ✅ Health check route
router.get('/ping', (req, res) => {
  res.send('✅ Admin routes working');
});

module.exports = router;
