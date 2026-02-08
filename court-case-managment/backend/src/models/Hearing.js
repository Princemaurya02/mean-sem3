const mongoose = require('mongoose');

const hearingSchema = new mongoose.Schema({
  case: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Case',
    required: true
  },
  hearingDate: {
    type: Date,
    required: true
  },
  startTime: {
    type: String,
    required: true
  },
  endTime: {
    type: String
  },
  courtroom: {
    type: String,
    required: true
  },
  judge: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  hearingType: {
    type: String,
    enum: ['Initial', 'Evidence', 'Arguments', 'Final', 'Interim', 'Bail', 'Other'],
    required: true
  },
  status: {
    type: String,
    enum: ['Scheduled', 'In Progress', 'Completed', 'Adjourned', 'Cancelled'],
    default: 'Scheduled'
  },
  attendees: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: String,
    attended: {
      type: Boolean,
      default: false
    }
  }],
  minutes: {
    type: String
  },
  proceedingSummary: {
    type: String
  },
  nextHearingDate: {
    type: Date
  },
  adjournmentReason: {
    type: String
  },
  documentsPresented: [{
    type: String
  }],
  orderPassed: {
    type: String
  }
}, {
  timestamps: true
});

// Index for efficient querying
hearingSchema.index({ case: 1, hearingDate: 1 });
hearingSchema.index({ judge: 1, hearingDate: 1 });

module.exports = mongoose.model('Hearing', hearingSchema);
