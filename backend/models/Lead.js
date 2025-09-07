const mongoose = require('mongoose');

const LeadSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  location: { type: String },
  agent: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { 
    type: String, 
    enum: ['New','Contacted','Interested','Shortlisted','Converted','Discarded'], 
    default: 'New' 
  },
  source: { type: String, enum: ['CSV', 'Manual', 'Campaign', 'API'], default: 'Manual' },
  email: { type: String },
  notes: { type: String },
  isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

LeadSchema.index({ phone: 1 });
LeadSchema.index({ agent: 1 });
LeadSchema.index({ status: 1 });

module.exports = mongoose.model('Lead', LeadSchema);
