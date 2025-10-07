const express = require('express');
const router = express.Router();
const CronService = require('../services/cronService');
const verifyToken = require('../middleware/verifyToken');
const verifyAdmin = require('../middleware/verifyAdmin');

// GET /api/cron - Get cron service overview
router.get('/', verifyToken, verifyAdmin, (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Cron service is available',
      endpoints: [
        'GET /api/cron/status',
        'POST /api/cron/start',
        'POST /api/cron/stop',
        'GET /api/cron/jobs'
      ]
    });
  } catch (err) {
    console.error('Error checking cron service:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Error checking cron service' 
    });
  }
});

// Global cron service instance
let cronService = null;

// Initialize cron service
const initializeCronService = () => {
  if (!cronService) {
    cronService = new CronService();
  }
  return cronService;
};

// Get cron service status
router.get('/status', verifyToken, verifyAdmin, (req, res) => {
  try {
    const service = initializeCronService();
    const status = service.getStatus();
    
    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    console.error('Error getting cron status:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting cron service status',
      error: error.message
    });
  }
});

// Start cron service
router.post('/start', verifyToken, verifyAdmin, (req, res) => {
  try {
    const service = initializeCronService();
    service.start();
    
    res.json({
      success: true,
      message: 'Cron service started successfully'
    });
  } catch (error) {
    console.error('Error starting cron service:', error);
    res.status(500).json({
      success: false,
      message: 'Error starting cron service',
      error: error.message
    });
  }
});

// Stop cron service
router.post('/stop', verifyToken, verifyAdmin, (req, res) => {
  try {
    const service = initializeCronService();
    service.stop();
    
    res.json({
      success: true,
      message: 'Cron service stopped successfully'
    });
  } catch (error) {
    console.error('Error stopping cron service:', error);
    res.status(500).json({
      success: false,
      message: 'Error stopping cron service',
      error: error.message
    });
  }
});

// Manually trigger application status updates
router.post('/trigger-status-updates', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const service = initializeCronService();
    await service.checkAndSendStatusUpdates();
    
    res.json({
      success: true,
      message: 'Application status updates triggered successfully'
    });
  } catch (error) {
    console.error('Error triggering status updates:', error);
    res.status(500).json({
      success: false,
      message: 'Error triggering status updates',
      error: error.message
    });
  }
});

// Manually trigger daily summary
router.post('/trigger-daily-summary', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const service = initializeCronService();
    await service.sendDailyApplicationSummary();
    
    res.json({
      success: true,
      message: 'Daily application summary triggered successfully'
    });
  } catch (error) {
    console.error('Error triggering daily summary:', error);
    res.status(500).json({
      success: false,
      message: 'Error triggering daily summary',
      error: error.message
    });
  }
});

// Manually trigger weekly reports
router.post('/trigger-weekly-reports', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const service = initializeCronService();
    await service.sendWeeklyApplicationReports();
    
    res.json({
      success: true,
      message: 'Weekly application reports triggered successfully'
    });
  } catch (error) {
    console.error('Error triggering weekly reports:', error);
    res.status(500).json({
      success: false,
      message: 'Error triggering weekly reports',
      error: error.message
    });
  }
});

module.exports = router;








