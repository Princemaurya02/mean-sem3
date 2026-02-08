const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Please provide a username'],
    unique: true,
    trim: true,
    minlength: 3
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 6,
    select: false
  },
  role: {
    type: String,
    enum: ['Admin', 'Staff'],
    default: 'Staff'
  },
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  contactNumber: {
    type: String,
    required: true
  },
  barCouncilId: {
    type: String,
    required: function () {
      return this.role === 'Lawyer';
    }
  },
  judgeId: {
    type: String,
    required: function () {
      return this.role === 'Judge';
    }
  },
  designation: {
    type: String,
    required: function () {
      return this.role === 'Court Staff';
    }
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  },
  assignedCases: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Case'
  }]
}, {
  timestamps: true
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

module.exports = mongoose.model('User', userSchema);
