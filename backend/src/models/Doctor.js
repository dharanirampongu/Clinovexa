const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    specialization: {
      type: String,
      required: true
    },
    department: {
      type: String,
      required: true
    },
    licenseNumber: {
      type: String,
      required: true
    },
    consultationFee: {
      type: Number,
      required: true,
      default: 100
    },
    workingDays: [{
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    }],
    timeSlots: [{
      startTime: { type: String, required: true }, // e.g. "09:00"
      endTime: { type: String, required: true }   // e.g. "17:00"
    }],
    slotDurationMinutes: {
      type: Number,
      default: 30
    },
    maxPatientsPerSlot: {
      type: Number,
      default: 1
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Doctor', doctorSchema);
