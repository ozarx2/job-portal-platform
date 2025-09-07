const Lead = require('../models/Lead');

// Add new lead
exports.createLead = async (req, res) => {
  try {
    const lead = await Lead.create(req.body);
    res.status(201).json({ success: true, data: lead });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Get all leads with filters + pagination
exports.getLeads = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, agent } = req.query;

    const filter = { isDeleted: false };
    if (status) filter.status = status;
    if (agent) filter.agent = agent;

    const leads = await Lead.find(filter)
      .populate('agent', 'name email') // optional
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Lead.countDocuments(filter);

    res.json({ success: true, total, data: leads });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get total lead count (optionally by status)
exports.getLeadCount = async (req, res) => {
  try {
    const counts = await Lead.aggregate([
      { $match: { isDeleted: false } },
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);
    res.json({ success: true, data: counts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Update a lead
exports.updateLead = async (req, res) => {
  try {
    const lead = await Lead.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!lead) return res.status(404).json({ success: false, message: "Lead not found" });
    res.json({ success: true, data: lead });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Soft delete a lead
exports.deleteLead = async (req, res) => {
  try {
    const lead = await Lead.findByIdAndUpdate(req.params.id, { isDeleted: true }, { new: true });
    if (!lead) return res.status(404).json({ success: false, message: "Lead not found" });
    res.json({ success: true, message: "Lead deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
