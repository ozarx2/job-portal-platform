const mongoose = require('mongoose');

const CompanySchema = new mongoose.Schema({
  name: String,
  description: String,
  website: String,
  logoUrl: String,
  location: String,
  industry: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Company', CompanySchema);
