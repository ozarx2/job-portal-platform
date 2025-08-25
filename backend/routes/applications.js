const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const Application = require('../models/Application');
const Job = require('../models/Job');

// 1️⃣ Apply to a job
router.post('/apply', verifyToken, async (req, res) => {
  try {
    const { jobId } = req.body;

    const existing = await Application.findOne({
      job: jobId,
      candidate: req.user.id,
    });

    if (existing) {
      return res.status(400).json({ msg: 'Already applied to this job' });
    }

    const application = new Application({
      job: jobId,
      candidate: req.user.id,
      status: 'Applied',
    });

    await application.save();
    res.status(201).json(application);
  } catch (err) {
    console.error('❌ Error in /apply:', err.message);
    res.status(500).json({ msg: err.message });
  }
});

// 2️⃣ Get applications of current candidate
router.get('/me', verifyToken, async (req, res) => {
  try {
    const applications = await Application.find({ candidate: req.user.id })
      .populate('job');
    res.json(applications);
  } catch (err) {
    res.status(500).json({ msg: 'Error fetching applications' });
  }
});

// 3️⃣ Get applications for employer's jobs
router.get('/employer', verifyToken, async (req, res) => {
  try {
    const jobs = await Job.find({ postedBy: req.user.id });
    const jobIds = jobs.map(job => job._id);

    const applications = await Application.find({ job: { $in: jobIds } })
      .populate('job')
      .populate('candidate');

    res.json(applications);
  } catch (err) {
    console.error('❌ Error in /employer route:', err.message);
    res.status(500).json({ msg: 'Error fetching employer applications' });
  }
});

// 4️⃣ Get applications for a specific job
router.get('/job/:jobId', verifyToken, async (req, res) => {
  try {
    const { jobId } = req.params;

    const applications = await Application.find({ job: jobId })
      .populate('job')
      .populate('candidate');

    res.json(applications);
  } catch (err) {
    res.status(500).json({ msg: 'Error fetching applications for this job' });
  }
});

// 5️⃣ Update application status (employer only)
router.put('/:id/status', verifyToken, async (req, res) => {
  try {
    const applicationId = req.params.id;
    const { status } = req.body;

    const allowedStatuses = ['Applied', 'Shortlisted', 'Interviewed', 'Hired', 'Rejected'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ msg: 'Invalid status value' });
    }

    const application = await Application.findById(applicationId).populate('job');

    if (!application || !application.job) {
      return res.status(404).json({ msg: 'Application not found' });
    }

    if (application.job.postedBy.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Not authorized to update this application' });
    }

    application.status = status;
    await application.save();

    res.json({ msg: 'Status updated successfully', application });
  } catch (err) {
    console.error('❌ Error updating status:', err.message);
    res.status(500).json({ msg: 'Error updating application status' });
  }
});

module.exports = router;
