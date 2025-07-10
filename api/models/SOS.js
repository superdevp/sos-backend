const mongoose = require('mongoose');

const sosSchema = new mongoose.Schema({
  // User who sent the SOS
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // User details for quick reference
  userName: {
    type: String,
    required: true
  },
  userEmail: {
    type: String,
    required: true
  },
  // SOS request details
  location: {
    latitude: {
      type: Number,
      required: true
    },
    longitude: {
      type: Number,
      required: true
    },
    address: {
      type: String,
      required: true
    }
  },
  // Recipient information
  recipientEmail: {
    type: String,
    required: true
  },
  // Status tracking
  status: {
    type: String,
    enum: ['sent', 'received', 'resolved', 'cancelled'],
    default: 'sent'
  },
  // Additional details
  notes: {
    type: String,
    default: ''
  },
  // Emergency contact details (optional)
  emergencyContact: {
    name: String,
    phone: String,
    relationship: String
  },
  // Device information
  deviceInfo: {
    userAgent: String,
    ipAddress: String,
    deviceType: String
  },
  // Response tracking
  responseTime: {
    type: Date
  },
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  resolutionNotes: {
    type: String
  },
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for efficient queries
sosSchema.index({ userId: 1, createdAt: -1 });
sosSchema.index({ status: 1 });
sosSchema.index({ createdAt: -1 });

// Pre-save middleware to update updatedAt
sosSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Static method to get SOS statistics
sosSchema.statics.getStatistics = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        sent: { $sum: { $cond: [{ $eq: ['$status', 'sent'] }, 1, 0] } },
        received: { $sum: { $cond: [{ $eq: ['$status', 'received'] }, 1, 0] } },
        resolved: { $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] } },
        cancelled: { $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] } }
      }
    }
  ]);
  
  return stats[0] || { total: 0, sent: 0, received: 0, resolved: 0, cancelled: 0 };
};

// Instance method to mark as received
sosSchema.methods.markAsReceived = function() {
  this.status = 'received';
  this.responseTime = new Date();
  return this.save();
};

// Instance method to mark as resolved
sosSchema.methods.markAsResolved = function(resolvedBy, notes = '') {
  this.status = 'resolved';
  this.resolvedBy = resolvedBy;
  this.resolutionNotes = notes;
  return this.save();
};

// Instance method to cancel SOS
sosSchema.methods.cancelSOS = function(notes = '') {
  this.status = 'cancelled';
  this.notes = notes;
  return this.save();
};

const SOS = mongoose.model('SOS', sosSchema);

module.exports = SOS; 