const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: [true, 'Job title is required'],
    trim: true,
    minlength: [3, 'Job title must be at least 3 characters long']
  },
  description: { 
    type: String, 
    required: [true, 'Job description is required'],
    trim: true,
    minlength: [10, 'Job description must be at least 10 characters long']
  },
  location: { 
    type: String, 
    required: [true, 'Job location is required'],
    trim: true
  },
  salaryRange: {
    min: { type: Number, min: 0 },
    max: { type: Number, min: 0 }
  },
  jobType: { 
    type: String, 
    enum: ['Full-time', 'Part-time', 'Contract', 'Remote'], 
    default: 'Full-time',
    required: true
  },
  category: { 
    type: String, 
    default: 'General',
    trim: true
  },
  postedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true
  },
  companyId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Company',
    required: [true, 'Company ID is required']
  },
  deadline: { 
    type: Date,
    validate: {
      validator: function(value) {
        return !value || value > new Date();
      },
      message: 'Deadline must be in the future'
    }
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'closed'],
    default: 'active'
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});


module.exports = mongoose.model('Job', JobSchema);
