const mongoose = require('mongoose');

const CallLogSchema = new mongoose.Schema({
  lead: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead', required: true },
  agent: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  durationSeconds: { type: Number, default: 0 },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('CallLog', CallLogSchema);
