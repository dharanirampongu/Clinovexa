const mongoose = require('mongoose');
const { APPOINTMENT_STATUS } = require('../utils/constants');

const appointmentSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      required: true
    },
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service'
    },
    appointmentDate: {
      type: Date,
      required: true
    },
    startTime: {
      type: String,
      required: true // HH:mm
    },
    endTime: {
      type: String,
      required: true // HH:mm
    },
    status: {
      type: String,
      enum: Object.values(APPOINTMENT_STATUS),
      default: APPOINTMENT_STATUS.SCHEDULED
    },
    reasonForVisit: {
      type: String,
      default: 'General Consultation'
    },
    queueNumber: {
      type: Number,
      default: 1
    },
    cancellationReason: {
      type: String,
      default: ''
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: true
  }
);

// Compound index to help efficiently query doctor's schedule on a specific date
appointmentSchema.index({ doctor: 1, appointmentDate: 1, startTime: 1 });

module.exports = mongoose.model('Appointment', appointmentSchema);
