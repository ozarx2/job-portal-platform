const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
  title: String,
  description: String,
  location: String,
  salaryRange: {
    min: Number,
    max: Number
  },
  jobType: { type: String, enum: ['Full-time', 'Part-time', 'Contract', 'Remote'], default: 'Full-time' },
  category: String,
  postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  deadline: Date,
  createdAt: { type: Date, default: Date.now }
});


module.exports = mongoose.model('Job', JobSchema);
