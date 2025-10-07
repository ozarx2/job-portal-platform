const mongoose = require('mongoose');

const ApplicationSchema = new mongoose.Schema({
  job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  candidate: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: {
    type: String,
    enum: ['Applied', 'Shortlisted', 'Interviewed', 'Hired', 'Rejected'],
    default: 'Applied',
  },
  // Additional application fields
  education: { type: String },
  age: { type: Number },
  experience: { type: Number, default: 0 },
  location: { type: String },
  currentEmployer: { type: String },
  skills: [{ type: String }],
  resume: { type: String }, // File path
  notes: { type: String },
  bio: { type: String },
  // Contact information
  name: { type: String },
  email: { type: String },
  phone: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Application', ApplicationSchema);
