const mongoose = require('mongoose');

const caseSchema = new mongoose.Schema({
  caseNumber: {
    type: String,
    required: false,
    unique: true,
    uppercase: true
  },
  caseType: {
    type: String,
    enum: ['Civil', 'Criminal', 'Family', 'Corporate', 'Tax', 'Property', 'Labour', 'Constitutional'],
    required: true
  },
  caseTitle: {
    type: String,
    required: true
  },
  filingDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['Filed', 'Under Review', 'Hearing Scheduled', 'In Progress', 'Adjourned', 'Verdict Delivered', 'Closed', 'Archived'],
    default: 'Filed'
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Urgent'],
    default: 'Medium'
  },
  plaintiff: {
    name: {
      type: String,
      required: true
    },
    lawyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    contactNumber: String,
    email: String,
    address: String
  },
  defendant: {
    name: {
      type: String,
      required: true
    },
    lawyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    contactNumber: String,
    email: String,
    address: String
  },
  assignedJudge: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  courtroom: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  documents: [{
    filename: String,
    originalName: String,
    path: String,
    uploadDate: {
      type: Date,
      default: Date.now
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    documentType: {
      type: String,
      enum: ['Petition', 'Evidence', 'Order', 'Judgment', 'Motion', 'Affidavit', 'Other']
    }
  }],
  timeline: [{
    event: {
      type: String,
      required: true
    },
    date: {
      type: Date,
      default: Date.now
    },
    description: String,
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  nextHearingDate: {
    type: Date
  },
  verdict: {
    decision: String,
    date: Date,
    description: String,
    decidedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }
}, {
  timestamps: true
});

// Generate unique case number
caseSchema.pre('save', async function (next) {
  if (!this.isNew) {
    return next();
  }

  const year = new Date().getFullYear();
  const count = await mongoose.model('Case').countDocuments();
  this.caseNumber = `CASE/${year}/${String(count + 1).padStart(6, '0')}`;
  next();
});

// Add timeline entry on status change
caseSchema.pre('save', function (next) {
  if (this.isModified('status') && !this.isNew) {
    this.timeline.push({
      event: 'Status Changed',
      description: `Case status changed to ${this.status}`,
      date: new Date()
    });
  }
  next();
});

module.exports = mongoose.model('Case', caseSchema);
