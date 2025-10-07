const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true
  },
  normalizedName: {
    type: String,
    required: false,
    lowercase: true,
    trim: true,
    index: true
  },
  aliases: [{
    type: String,
    lowercase: true,
    trim: true
  }],
  category: {
    type: String,
    enum: [
      'programming', 'framework', 'database', 'cloud', 'devops', 
      'design', 'marketing', 'business', 'language', 'tool', 'other'
    ],
    default: 'other',
    index: true
  },
  popularity: {
    type: Number,
    default: 0,
    index: true
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  description: String,
  relatedSkills: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Skill'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Compound indexes for efficient querying
skillSchema.index({ name: 1, isActive: 1 });
skillSchema.index({ normalizedName: 1, isActive: 1 });
skillSchema.index({ category: 1, popularity: -1 });
skillSchema.index({ isActive: 1, popularity: -1 });

// Pre-save middleware to update normalizedName and updatedAt
skillSchema.pre('save', function(next) {
  if (this.isModified('name') || this.isNew || !this.normalizedName) {
    this.normalizedName = this.name.toLowerCase().replace(/[^a-z0-9]/g, '');
  }
  this.updatedAt = new Date();
  next();
});

// Static method to find skills by name or alias
skillSchema.statics.findByNameOrAlias = function(name) {
  const normalizedName = name.toLowerCase().replace(/[^a-z0-9]/g, '');
  
  return this.find({
    $and: [
      { isActive: true },
      {
        $or: [
          { name: { $regex: new RegExp(name, 'i') } },
          { normalizedName: normalizedName },
          { aliases: { $in: [new RegExp(name, 'i')] } }
        ]
      }
    ]
  }).sort({ popularity: -1 });
};

// Static method to get popular skills
skillSchema.statics.getPopularSkills = function(limit = 20, category = null) {
  const query = { isActive: true };
  if (category) {
    query.category = category;
  }
  
  return this.find(query)
    .sort({ popularity: -1 })
    .limit(limit)
    .select('name category popularity');
};

// Static method to search skills with fuzzy matching
skillSchema.statics.searchSkills = function(searchTerm, limit = 10) {
  const normalizedSearch = searchTerm.toLowerCase().replace(/[^a-z0-9]/g, '');
  
  return this.find({
    $and: [
      { isActive: true },
      {
        $or: [
          { name: { $regex: new RegExp(searchTerm, 'i') } },
          { normalizedName: { $regex: new RegExp(normalizedSearch, 'i') } },
          { aliases: { $in: [new RegExp(searchTerm, 'i')] } }
        ]
      }
    ]
  })
  .sort({ popularity: -1 })
  .limit(limit)
  .select('name category popularity aliases');
};

// Instance method to increment popularity
skillSchema.methods.incrementPopularity = function() {
  this.popularity += 1;
  return this.save();
};

// Instance method to add alias
skillSchema.methods.addAlias = function(alias) {
  if (!this.aliases.includes(alias.toLowerCase())) {
    this.aliases.push(alias.toLowerCase());
    return this.save();
  }
  return Promise.resolve(this);
};

// Virtual for skill usage count
skillSchema.virtual('usageCount').get(function() {
  return this.popularity;
});

// Ensure virtual fields are serialized
skillSchema.set('toJSON', { virtuals: true });
skillSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Skill', skillSchema);
