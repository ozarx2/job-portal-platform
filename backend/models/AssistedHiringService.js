const mongoose = require('mongoose');

const AssistedHiringServiceSchema = new mongoose.Schema({
  employer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  servicePackage: {
    type: String,
    enum: ['basic', 'premium', 'enterprise'],
    required: true
  },
  serviceName: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    amount: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      default: 'USD'
    }
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentId: {
    type: String // Stripe payment intent ID, Razorpay order/payment ID, or PayPal transaction ID
  },
  paymentMethod: {
    type: String,
    enum: ['stripe', 'razorpay', 'paypal', 'bank_transfer'],
    default: 'stripe'
  },
  status: {
    type: String,
    enum: ['requested', 'in_progress', 'completed', 'cancelled'],
    default: 'requested'
  },
  assignedAgent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User' // HR agent or recruitment specialist
  },
  features: [{
    name: String,
    description: String,
    included: {
      type: Boolean,
      default: true
    }
  }],
  deliverables: [{
    name: String,
    description: String,
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'completed'],
      default: 'pending'
    },
    dueDate: Date,
    completedAt: Date
  }],
  timeline: {
    startDate: Date,
    estimatedCompletion: Date,
    actualCompletion: Date
  },
  notes: [{
    text: String,
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  rating: {
    score: {
      type: Number,
      min: 1,
      max: 5
    },
    feedback: String,
    ratedAt: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field on save
AssistedHiringServiceSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('AssistedHiringService', AssistedHiringServiceSchema);









