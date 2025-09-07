const mongoose = require('mongoose');

const ApplicationSchema = new mongoose.Schema({
  job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job' },
  candidate: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: {
    type: String,
    enum: ['Applied', 'Shortlisted', 'Interviewed', 'Hired', 'Rejected'],
    default: 'Applied',
  },
}, { timestamps: true });

module.exports = mongoose.model('Application', ApplicationSchema);
