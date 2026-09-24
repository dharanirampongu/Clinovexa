const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { ROLES } = require('../utils/constants');
const { normalizePhone } = require('../utils/phone');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
      select: false
    },
    role: {
      type: String,
      enum: Object.values(ROLES),
      required: [true, 'Role is required']
    },
    phone: {
      type: String,
      default: '',
      trim: true,
      set: (v) => normalizePhone(v)
    },
    staffId: {
      type: String,
      default: ''
    },
    googleId: {
      type: String,
      default: ''
    },
    avatar: {
      type: String,
      default: ''
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

// Unique mobile numbers: equivalent formats are normalized by the setter
// above, and empty/missing phones are excluded so legacy docs don't collide.
userSchema.index(
  { phone: 1 },
  {
    unique: true,
    sparse: true,
    partialFilterExpression: { phone: { $exists: true, $ne: '' } }
  }
);

// Hash password before save
userSchema.pre('save', async function (next) {
  if (this.isModified('phone') && typeof this.phone === 'string') {
    this.phone = normalizePhone(this.phone);
  }
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
