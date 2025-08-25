const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken'); // Ensure this path is correct
const Job = require('../models/Job');

// POST /api/jobs - Create a job
router.post('/', verifyToken, async (req, res) => {
  console.log('✅ JOB POST ROUTE HIT');
  console.log('Token User:', req.user);
  console.log('Request Body:', req.body);
  try {
    const job = new Job({ ...req.body, postedBy: req.user.id });
    await job.save();
    res.status(201).json(job);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});
router.get('/employer', verifyToken, async (req, res) => {
  try {
    const jobs = await Job.find({ postedBy: req.user.id });
    res.json({ jobs });
  } catch (err) {
    res.status(500).json({ msg: 'Error fetching jobs' });
  }
});

router.get('/', async (req, res) => {
  try {
    const jobs = await Job.find();
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});



module.exports = router;
