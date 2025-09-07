const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const Application = require('../models/Application');
const User = require('../models/User');

// GET /api/reports/summary
router.get('/summary', verifyToken, async (req, res) => {
  try {
    // Parse optional date filters
    const { startDate, endDate } = req.query;
    const now = new Date();
    const start = startDate ? new Date(startDate) : new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30);
    const end = endDate ? new Date(endDate) : now;

    // New recruits in range (role=candidate)
    const newRecruitsRange = await User.countDocuments({ role: 'candidate', createdAt: { $gte: start, $lte: end } });

    // Daily job applications for last 7 days
    const sevenDaysAgo = new Date(end);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    const dailyApplications = await Application.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo, $lte: end } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    // Interview pipeline counts
    const statuses = ['Applied', 'Shortlisted', 'Interviewed', 'Hired', 'Rejected'];
    const statusCountsAgg = await Application.aggregate([
      { $match: { createdAt: { $gte: start, $lte: end } } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);
    const statusCounts = Object.fromEntries(statuses.map(s => [s, 0]));
    for (const row of statusCountsAgg) {
      statusCounts[row._id] = row.count;
    }

    res.json({ newRecruits: newRecruitsRange, dailyApplications, statusCounts, range: { start, end } });
  } catch (err) {
    res.status(500).json({ msg: 'Error building reports', error: err.message });
  }
});

module.exports = router;


