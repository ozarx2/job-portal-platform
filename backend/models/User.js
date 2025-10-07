// models/User.js
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, enum: ['candidate', 'employer','admin','agent'], default: 'candidate' },
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' }, // Primary company (for backward compatibility)
  companies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Company' }], // Multiple companies support
  resumeUrl: String,
  createdAt: { type: Date, default: Date.now },
  profileImage: { type: String },
  skills: { type: [String] },
  experience: { type: Number, default: 0 },
  education: { type: String },
  location: { type: String },
  phone: { type: String },
  bio: { type: String },
  website: { type: String },
  linkedin: { type: String },
  github: { type: String },
  isVerified: { type: Boolean, default: false }
});



delete mongoose.connection.models['User']; // 💥 force refresh
module.exports = mongoose.model('User', UserSchema);
