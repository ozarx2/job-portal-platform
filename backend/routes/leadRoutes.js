const express = require('express');
const router = express.Router();
const {
  createLead,
  getLeads,
  getLeadCount,
  updateLead,
  deleteLead
} = require('../controllers/leadController');

router.post('/', createLead);        // Add new lead
router.get('/', getLeads);           // Get leads (with filters + pagination)
router.get('/count', getLeadCount);  // Get count by status
router.put('/:id', updateLead);      // Update lead
router.delete('/:id', deleteLead);   // Soft delete

module.exports = router;
