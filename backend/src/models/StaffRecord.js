const mongoose = require('mongoose');
const { ROLES } = require('../utils/constants');

const staffRecordSchema = new mongoose.Schema(
  {
    staffId: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true
    },
    role: {
      type: String,
      enum: [ROLES.ADMIN, ROLES.DOCTOR, ROLES.RECEPTIONIST, ROLES.LAB_TECH],
      required: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },
    department: {
      type: String,
      default: 'General Hospital Staff'
    },
    isClaimed: {
      type: Boolean,
      default: false
    },
    claimedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('StaffRecord', staffRecordSchema);
