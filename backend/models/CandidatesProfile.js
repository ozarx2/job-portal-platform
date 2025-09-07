const mongoose = require('mongoose');

const CandidateProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true,
  },
  education: {
    type: String,
    default: '',
  },
  experience: {
    type: Number,
    default: 0,
  },
  age: {
    type: Number,
    default: 0,
  },
  location: {
    type: String,
    default: '',
  },
  resumeUrl: {
    type: String,
    default: '',
  },
  currentEmployer: {
    type: String,
    default: '',
  },
  currentEmploymentStatus: {
    type: String,
    enum: ['Employed', 'Unemployed'],
    default: 'Unemployed',
  },
  skills: {
    type: [String],
    default: [],
  },
  appliedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('CandidateProfile', CandidateProfileSchema);
