const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  originalName: {
    type: String,
    required: true
  },
  filename: {
    type: String,
    required: true
  },
  path: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  mimetype: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    default: 'Other'
  },
  description: {
    type: String,
    default: ''
  },
  tags: {
    type: String,
    default: ''
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for better search performance
documentSchema.index({ originalName: 'text', description: 'text', tags: 'text' });
documentSchema.index({ category: 1 });
documentSchema.index({ uploadedBy: 1 });
documentSchema.index({ uploadedAt: -1 });

module.exports = mongoose.model('Document', documentSchema);

