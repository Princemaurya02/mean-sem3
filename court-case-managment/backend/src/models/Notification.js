const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['Hearing', 'Status Update', 'Document Upload', 'Assignment', 'Verdict', 'System'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  relatedCase: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Case'
  },
  relatedHearing: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hearing'
  },
  isRead: {
    type: Boolean,
    default: false
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Medium'
  },
  readAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Index for efficient querying
notificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
