const express = require('express');
const router = express.Router();
const multer = require('multer');
const xlsx = require('xlsx');
const path = require('path');
const fs = require('fs');

const verifyToken = require('../middleware/verifyToken');
const Lead = require('../models/Lead');
const CallLog = require('../models/CallLog');
const User = require('../models/User'); // existing

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const d = 'uploads/leads/';
    if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
    cb(null, d);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// 1) Upload Excel leads (agent only)
router.post('/upload', verifyToken, upload.single('file'), async (req, res) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ msg: 'Unauthorized' });
    if (user.role !== 'agent') return res.status(403).json({ msg: 'Only agents can upload leads' });

    if (!req.file) return res.status(400).json({ msg: 'No file uploaded' });

    // parse file
    const workbook = xlsx.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: '' });

    // Expected columns: name, phone, location (case-insensitive)
    const created = [];
    for (const row of data) {
      const name = row.name || row.Name || row.NAME;
      const phone = row.phone || row.Phone || row.PHONE || row.telephone || row.Telephone;
      const location = row.location || row.Location || row.LOCATION || '';

      if (!name || !phone) continue; // skip invalid rows

      const lead = new Lead({
        name: String(name).trim(),
        phone: String(phone).trim(),
        location: String(location).trim(),
        agent: user.id
      });
      await lead.save();
      created.push(lead);
    }

    return res.status(201).json({ createdCount: created.length, created });
  } catch (err) {
    console.error('Error uploading leads:', err);
    return res.status(500).json({ msg: 'Server error' });
  } finally {
    // optional: delete uploaded file to save disk
    // fs.unlinkSync(req.file.path);
  }
});

// 2) Log a call (from agent)
router.post('/call', verifyToken, async (req, res) => {
  try {
    const user = req.user;
    if (!user || user.role !== 'agent') return res.status(403).json({ msg: 'Agent only' });

    const { leadId, durationSeconds = 0, notes } = req.body;
    if (!leadId) return res.status(400).json({ msg: 'leadId required' });

    const lead = await Lead.findById(leadId);
    if (!lead) return res.status(404).json({ msg: 'Lead not found' });
    if (lead.agent.toString() !== user.id) return res.status(403).json({ msg: 'Not your lead' });

    const call = new CallLog({
      lead: lead.id,
      agent: user.id,
      durationSeconds,
      notes
    });
    await call.save();

    // mark lead as contacted
    lead.status = 'Contacted';
    await lead.save();

    return res.status(201).json({ call });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// 3) Shortlist lead (agent) -> this will mark lead as Shortlisted and optionally create a user / application
router.post('/lead/:id/shortlist', verifyToken, async (req, res) => {
  try {
    const user = req.user;
    if (!user || user.role !== 'agent') return res.status(403).json({ msg: 'Agent only' });

    const lead = await Lead.findById(req.params.id);
    if (!lead) return res.status(404).json({ msg: 'Lead not found' });
    if (lead.agent.toString() !== user.id) return res.status(403).json({ msg: 'Not your lead' });

    // mark shortlisted
    lead.status = 'Shortlisted';
    await lead.save();

    // Option A: Create a basic User record for shortlisted candidate (role: candidate)
    // Only create if you want them in User collection. Add a random password or send invite flow later.
    const existingUser = await User.findOne({ phone: lead.phone });
    let candidateUser = existingUser;
    if (!existingUser) {
      candidateUser = new User({
        name: lead.name,
        phone: lead.phone,
        role: 'candidate',
        // you may want to set a temporary password or none and send OTP on first login
      });
      await candidateUser.save();
    }

    // Optionally: create an Application entry if you use Applications
    // const Application = require('../models/Application');
    // const app = new Application({ job: someJobId, candidate: candidateUser._id, status: 'Applied' });
    // await app.save();

    return res.json({ msg: 'Shortlisted', lead, candidateUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// 4) Agent report: totals, calls, conversions and earnings
router.get('/agent/report/me', verifyToken, async (req, res) => {
  try {
    const user = req.user;
    if (!user || user.role !== 'agent') return res.status(403).json({ msg: 'Agent only' });

    const agentId = user.id;

    // lead counts
    const totalLeads = await Lead.countDocuments({ agent: agentId });
    const shortlisted = await Lead.countDocuments({ agent: agentId, status: 'Shortlisted' });
    const converted = await Lead.countDocuments({ agent: agentId, status: 'Converted' });

    // calls count
    const calls = await CallLog.countDocuments({ agent: agentId });

    // earnings: Rs 1 per call
    const earnings = calls * 1;

    return res.json({ totalLeads, shortlisted, converted, calls, earnings });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// 5) Admin consolidated report (by agent) - requires admin role
router.get('/admin/summary', verifyToken, async (req, res) => {
  try {
    const user = req.user;
    if (!user || user.role !== 'admin') return res.status(403).json({ msg: 'Admin only' });

    // aggregation: group leads by agent
    const leadAgg = await Lead.aggregate([
      { $group: { _id: '$agent', totalLeads: { $sum: 1 }, shortlisted: { $sum: { $cond: [{ $eq: ['$status', 'Shortlisted'] }, 1, 0] } }, converted: { $sum: { $cond: [{ $eq: ['$status', 'Converted'] }, 1, 0] } } } }
    ]);

    // calls per agent
    const callAgg = await CallLog.aggregate([
      { $group: { _id: '$agent', calls: { $sum: 1 } } }
    ]);

    // merge results
    const mapCalls = {};
    callAgg.forEach(c => { mapCalls[c._id.toString()] = c.calls; });

    // attach agent info
    const results = [];
    for (const item of leadAgg) {
      const agent = await User.findById(item._id).select('name phone email');
      const calls = mapCalls[item._id.toString()] || 0;
      results.push({
        agent: agent ? { id: agent._id, name: agent.name, phone: agent.phone, email: agent.email } : { id: item._id },
        totalLeads: item.totalLeads,
        shortlisted: item.shortlisted,
        converted: item.converted,
        calls,
        earnings: calls * 1
      });
    }

    // optional: daily consolidated (today)
    const todayStart = new Date(); todayStart.setHours(0,0,0,0);
    const todayEnd = new Date(); todayEnd.setHours(23,59,59,999);
    const dailyLeads = await Lead.aggregate([
      { $match: { createdAt: { $gte: todayStart, $lte: todayEnd } } },
      { $group: { _id: '$agent', count: { $sum: 1 } } }
    ]);

    return res.json({ results, dailyLeads });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// 6) Get all leads (paginated, filterable)
// =============================
router.get('/leads', verifyToken, async (req, res) => {
  try {
    const user = req.user;
    const { page = 1, limit = 20, status, agentId } = req.query;

    const filter = { isDeleted: { $ne: true } };

    // Agents see only their leads
    if (user.role === 'agent') filter.agent = user.id;
    else if (agentId) filter.agent = agentId; // Admin filter

    if (status) filter.status = status;

    const leads = await Lead.find(filter)
      .populate('agent', 'name email phone')
      .sort({ createdAt: -1 })
      .skip((page - 1) * parseInt(limit))
      .limit(parseInt(limit));

    const total = await Lead.countDocuments(filter);

    res.json({
      success: true,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: leads
    });
  } catch (err) {
    console.error('Error fetching leads:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// =============================
// 7) Edit a lead (update fields)
// =============================
router.put('/leads/:id', verifyToken, async (req, res) => {
  try {
    const user = req.user;
    const lead = await Lead.findById(req.params.id);
    if (!lead) return res.status(404).json({ success: false, message: 'Lead not found' });

    // Agent can only update their leads
    if (user.role === 'agent' && lead.agent.toString() !== user.id) {
      return res.status(403).json({ success: false, message: 'Not your lead' });
    }

    const updates = req.body;
    Object.assign(lead, updates);
    await lead.save();

    res.json({ success: true, data: lead });
  } catch (err) {
    console.error('Error updating lead:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// =============================
// 8) Delete a lead (soft delete)
// =============================
router.delete('/leads/:id', verifyToken, async (req, res) => {
  try {
    const user = req.user;
    const lead = await Lead.findById(req.params.id);
    if (!lead) return res.status(404).json({ success: false, message: 'Lead not found' });

    if (user.role === 'agent' && lead.agent.toString() !== user.id) {
      return res.status(403).json({ success: false, message: 'Not your lead' });
    }

    lead.isDeleted = true;
    await lead.save();

    res.json({ success: true, message: 'Lead deleted successfully' });
  } catch (err) {
    console.error('Error deleting lead:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});
// =============================
// 8.5) Test endpoint for debugging
// =============================
router.get('/test', verifyToken, async (req, res) => {
  try {
    const user = req.user;
    const leadCount = await Lead.countDocuments({ agent: user.id });
    res.json({ 
      success: true, 
      message: "CRM routes working", 
      user: user.id,
      leadCount: leadCount,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error("Test endpoint error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// =============================
// 9) Bulk Import Leads (CSV Upload)
// =============================
router.post('/leads/import', verifyToken, async (req, res) => {
  try {
    console.log("Import leads request received");
    console.log("Request body keys:", Object.keys(req.body));
    console.log("User:", req.user?.id);
    
    const { mappedData } = req.body; // [{ name, phone, location, status }]
    const user = req.user;

    if (!mappedData || !Array.isArray(mappedData)) {
      console.log("Invalid data format - mappedData:", typeof mappedData, Array.isArray(mappedData));
      return res.status(400).json({ success: false, message: "Invalid data format" });
    }

    if (mappedData.length === 0) {
      console.log("No data to import");
      return res.status(400).json({ success: false, message: "No data to import" });
    }

    console.log(`Processing ${mappedData.length} leads for user ${user.id}`);

    // Validate and prepare leads
    const validLeads = [];
    const errors = [];

    console.log("Starting validation of leads...");
    
    mappedData.forEach((row, index) => {
      // Check required fields
      if (!row.name || !row.phone) {
        errors.push(`Row ${index + 1}: Missing required fields (name or phone)`);
        return;
      }

      // Validate phone format (basic validation)
      const phone = String(row.phone).trim();
      if (phone.length < 10) {
        errors.push(`Row ${index + 1}: Invalid phone number (${phone})`);
        return;
      }

      // Validate status if provided
      if (row.status && !['New','Contacted','Interested','Shortlisted','Converted','Discarded'].includes(row.status)) {
        errors.push(`Row ${index + 1}: Invalid status (${row.status})`);
        return;
      }

      validLeads.push({
        name: String(row.name).trim(),
        phone: phone,
        location: row.location ? String(row.location).trim() : '',
        status: row.status || 'New',
        source: 'CSV',
        agent: user.id
      });
    });

    console.log(`Validation complete: ${validLeads.length} valid leads, ${errors.length} errors`);

    if (validLeads.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: "No valid leads found", 
        errors: errors.slice(0, 10) // Show first 10 errors
      });
    }

    // Insert valid leads
    console.log(`Attempting to insert ${validLeads.length} leads into database...`);
    const result = await Lead.insertMany(validLeads, { ordered: false });
    console.log(`Successfully inserted ${result.length} leads`);

    res.json({ 
      success: true, 
      message: "Leads imported successfully", 
      count: result.length,
      totalProcessed: mappedData.length,
      skipped: mappedData.length - result.length,
      errors: errors.length > 0 ? errors.slice(0, 5) : [] // Show first 5 errors if any
    });
  } catch (err) {
    console.error("Error importing leads:", err);
    console.error("Error details:", {
      message: err.message,
      code: err.code,
      name: err.name,
      stack: err.stack
    });
    
    // Handle duplicate key errors
    if (err.code === 11000) {
      return res.status(400).json({ 
        success: false, 
        message: "Some leads already exist (duplicate phone numbers)",
        error: err.message
      });
    }
    
    // Handle validation errors
    if (err.name === 'ValidationError') {
      return res.status(400).json({ 
        success: false, 
        message: "Data validation failed",
        error: err.message,
        details: err.errors
      });
    }
    
    // Handle bulk write errors
    if (err.name === 'BulkWriteError') {
      return res.status(400).json({ 
        success: false, 
        message: "Database write error",
        error: err.message,
        details: err.writeErrors ? err.writeErrors.slice(0, 5) : []
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: "Server error during import",
      error: err.message,
      code: err.code,
      name: err.name
    });
  }
});


module.exports = router;


