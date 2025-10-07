const mongoose = require('mongoose');

const candidateSkillSchema = new mongoose.Schema({
  candidateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CandidatesProfile',
    required: true,
    index: true
  },
  skillId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Skill',
    required: true,
    index: true
  },
  skillName: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    index: true
  },
  proficiency: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced', 'expert'],
    default: 'intermediate',
    index: true
  },
  yearsOfExperience: {
    type: Number,
    min: 0,
    max: 50,
    default: 0
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  verifiedAt: Date,
  endorsements: [{
    endorserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    endorsedAt: {
      type: Date,
      default: Date.now
    }
  }],
  lastUsed: Date,
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
candidateSkillSchema.index({ candidateId: 1, skillId: 1 }, { unique: true });
candidateSkillSchema.index({ skillName: 1, proficiency: 1 });
candidateSkillSchema.index({ skillId: 1, proficiency: 1 });
candidateSkillSchema.index({ skillName: 1, yearsOfExperience: -1 });
candidateSkillSchema.index({ isVerified: 1, proficiency: 1 });

// Pre-save middleware
candidateSkillSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Static method to find candidates by skill
candidateSkillSchema.statics.findCandidatesBySkill = function(skillName, options = {}) {
  const {
    proficiency,
    minYearsExperience = 0,
    isVerified = null,
    limit = 50
  } = options;

  const query = {
    skillName: skillName.toLowerCase(),
    yearsOfExperience: { $gte: minYearsExperience }
  };

  if (proficiency) {
    query.proficiency = proficiency;
  }

  if (isVerified !== null) {
    query.isVerified = isVerified;
  }

  return this.find(query)
    .populate('candidateId', 'userId location experience education')
    .populate('candidateId.userId', 'name email phone')
    .sort({ yearsOfExperience: -1, proficiency: -1 })
    .limit(limit);
};

// Static method to get skill statistics
candidateSkillSchema.statics.getSkillStats = function(skillName) {
  const pipeline = [
    { $match: { skillName: skillName.toLowerCase() } },
    {
      $group: {
        _id: null,
        totalCandidates: { $sum: 1 },
        averageExperience: { $avg: '$yearsOfExperience' },
        proficiencyDistribution: {
          $push: '$proficiency'
        },
        verifiedCount: {
          $sum: { $cond: ['$isVerified', 1, 0] }
        }
      }
    }
  ];

  return this.aggregate(pipeline);
};

// Static method to find top skills for a candidate
candidateSkillSchema.statics.getTopSkillsForCandidate = function(candidateId, limit = 10) {
  return this.find({ candidateId })
    .populate('skillId', 'name category')
    .sort({ yearsOfExperience: -1, proficiency: -1 })
    .limit(limit);
};

// Static method to get skill recommendations
candidateSkillSchema.statics.getSkillRecommendations = function(candidateId, limit = 5) {
  // This would typically use ML algorithms, but for now we'll return popular skills
  // that the candidate doesn't already have
  return this.aggregate([
    {
      $lookup: {
        from: 'skills',
        localField: 'skillId',
        foreignField: '_id',
        as: 'skill'
      }
    },
    {
      $group: {
        _id: null,
        candidateSkills: { $push: '$skillName' }
      }
    },
    {
      $lookup: {
        from: 'skills',
        let: { candidateSkills: '$candidateSkills' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ['$isActive', true] },
                  { $not: { $in: ['$name', '$$candidateSkills'] } }
                ]
              }
            }
          },
          { $sort: { popularity: -1 } },
          { $limit: limit }
        ],
        as: 'recommendations'
      }
    }
  ]);
};

// Instance method to add endorsement
candidateSkillSchema.methods.addEndorsement = function(endorserId) {
  // Check if endorser already endorsed this skill
  const existingEndorsement = this.endorsements.find(
    endorsement => endorsement.endorserId.toString() === endorserId.toString()
  );

  if (!existingEndorsement) {
    this.endorsements.push({ endorserId });
    return this.save();
  }

  return Promise.resolve(this);
};

// Instance method to remove endorsement
candidateSkillSchema.methods.removeEndorsement = function(endorserId) {
  this.endorsements = this.endorsements.filter(
    endorsement => endorsement.endorserId.toString() !== endorserId.toString()
  );
  return this.save();
};

module.exports = mongoose.model('CandidateSkill', candidateSkillSchema);




