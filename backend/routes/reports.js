const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const Application = require('../models/Application');
const User = require('../models/User');
const Lead = require('../models/Lead');
const Job = require('../models/Job');

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

    // Total leads in range
    const totalLeads = await Lead.countDocuments({ createdAt: { $gte: start, $lte: end } });

    // Leads by status
    const leadStatuses = ['New', 'Contacted', 'Interested', 'Shortlisted', 'Converted', 'Discarded'];
    const leadStatusCountsAgg = await Lead.aggregate([
      { $match: { createdAt: { $gte: start, $lte: end } } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);
    const leadStatusCounts = Object.fromEntries(leadStatuses.map(s => [s, 0]));
    for (const row of leadStatusCountsAgg) {
      leadStatusCounts[row._id] = row.count;
    }

    res.json({ 
      newRecruits: newRecruitsRange, 
      dailyApplications, 
      statusCounts, 
      totalLeads,
      leadStatusCounts,
      range: { start, end } 
    });
  } catch (err) {
    res.status(500).json({ msg: 'Error building reports', error: err.message });
  }
});

// GET /api/reports/agent-performance
router.get('/agent-performance', verifyToken, async (req, res) => {
  try {
    const { startDate, endDate, agentId } = req.query;
    const now = new Date();
    const start = startDate ? new Date(startDate) : new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30);
    const end = endDate ? new Date(endDate) : now;

    // Build match criteria
    const matchCriteria = {
      createdAt: { $gte: start, $lte: end }
    };
    if (agentId) {
      matchCriteria.agent = agentId;
    }

    // Get all agents with their performance metrics
    const agents = await User.find({ role: 'agent' }, 'name email createdAt').lean();

    const agentPerformanceData = await Promise.all(
      agents.map(async (agent) => {
        // Total leads assigned to this agent
        const totalLeads = await Lead.countDocuments({ 
          agent: agent._id,
          createdAt: { $gte: start, $lte: end }
        });

        // Leads by status for this agent
        const leadsByStatus = await Lead.aggregate([
          { $match: { agent: agent._id, createdAt: { $gte: start, $lte: end } } },
          { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);

        const statusCounts = {
          New: 0,
          Contacted: 0,
          Interested: 0,
          Shortlisted: 0,
          Converted: 0,
          Discarded: 0
        };

        leadsByStatus.forEach(item => {
          statusCounts[item._id] = item.count;
        });

        // Calculate conversion rate
        const converted = statusCounts.Converted;
        const totalContacted = statusCounts.Contacted + statusCounts.Interested + statusCounts.Shortlisted + statusCounts.Converted;
        const conversionRate = totalContacted > 0 ? (converted / totalContacted) * 100 : 0;

        // Calculate response rate (contacted vs new)
        const contacted = statusCounts.Contacted + statusCounts.Interested + statusCounts.Shortlisted + statusCounts.Converted;
        const responseRate = totalLeads > 0 ? (contacted / totalLeads) * 100 : 0;

        // Recent activity (last 7 days)
        const sevenDaysAgo = new Date(end);
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const recentLeads = await Lead.countDocuments({
          agent: agent._id,
          createdAt: { $gte: sevenDaysAgo, $lte: end }
        });

        return {
          agentId: agent._id,
          agentName: agent.name,
          agentEmail: agent.email,
          totalLeads,
          statusCounts,
          conversionRate: Math.round(conversionRate * 100) / 100,
          responseRate: Math.round(responseRate * 100) / 100,
          recentLeads,
          avgLeadsPerDay: Math.round((totalLeads / Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)))) * 100) / 100
        };
      })
    );

    // Sort by conversion rate (best performers first)
    agentPerformanceData.sort((a, b) => b.conversionRate - a.conversionRate);

    // Calculate team averages
    const teamStats = {
      totalLeads: agentPerformanceData.reduce((sum, agent) => sum + agent.totalLeads, 0),
      avgConversionRate: agentPerformanceData.length > 0 
        ? Math.round((agentPerformanceData.reduce((sum, agent) => sum + agent.conversionRate, 0) / agentPerformanceData.length) * 100) / 100 
        : 0,
      avgResponseRate: agentPerformanceData.length > 0 
        ? Math.round((agentPerformanceData.reduce((sum, agent) => sum + agent.responseRate, 0) / agentPerformanceData.length) * 100) / 100 
        : 0,
      topPerformer: agentPerformanceData[0] || null
    };

    res.json({
      success: true,
      data: {
        agents: agentPerformanceData,
        teamStats,
        dateRange: { start, end }
      }
    });

  } catch (err) {
    console.error('Error fetching agent performance:', err);
    res.status(500).json({ 
      success: false, 
      msg: 'Error building agent performance report', 
      error: err.message 
    });
  }
});

// GET /api/reports/agent-daily-activity
router.get('/agent-daily-activity', verifyToken, async (req, res) => {
  try {
    const { agentId, days = 30 } = req.query;
    const now = new Date();
    const startDate = new Date(now.getTime() - (parseInt(days) * 24 * 60 * 60 * 1000));

    const matchCriteria = {
      createdAt: { $gte: startDate, $lte: now }
    };
    if (agentId) {
      matchCriteria.agent = agentId;
    }

    // Daily lead activity
    const dailyActivity = await Lead.aggregate([
      { $match: matchCriteria },
      { 
        $group: { 
          _id: { 
            date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            status: '$status'
          }, 
          count: { $sum: 1 } 
        } 
      },
      { $sort: { '_id.date': 1 } }
    ]);

    // Convert to chart-friendly format
    const chartData = {};
    dailyActivity.forEach(item => {
      const date = item._id.date;
      const status = item._id.status;
      
      if (!chartData[date]) {
        chartData[date] = { date };
      }
      chartData[date][status] = item.count;
    });

    const formattedData = Object.values(chartData).map(item => ({
      date: item.date,
      New: item.New || 0,
      Contacted: item.Contacted || 0,
      Interested: item.Interested || 0,
      Shortlisted: item.Shortlisted || 0,
      Converted: item.Converted || 0,
      Discarded: item.Discarded || 0,
      Total: (item.New || 0) + (item.Contacted || 0) + (item.Interested || 0) + 
             (item.Shortlisted || 0) + (item.Converted || 0) + (item.Discarded || 0)
    }));

    res.json({
      success: true,
      data: formattedData
    });

  } catch (err) {
    console.error('Error fetching agent daily activity:', err);
    res.status(500).json({ 
      success: false, 
      msg: 'Error building agent daily activity report', 
      error: err.message 
    });
  }
});

module.exports = router;


