const mongoose = require('mongoose');
const { LAB_ORDER_STATUS } = require('../utils/constants');

const labOrderSchema = new mongoose.Schema(
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
    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment'
    },
    tests: [
      {
        service: { type: mongoose.Schema.Types.ObjectId, ref: 'Service' },
        testName: { type: String, required: true }
      }
    ],
    status: {
      type: String,
      enum: Object.values(LAB_ORDER_STATUS),
      default: LAB_ORDER_STATUS.ORDERED
    },
    priority: {
      type: String,
      enum: ['ROUTINE', 'URGENT', 'STAT'],
      default: 'ROUTINE'
    },
    notes: {
      type: String,
      default: ''
    },
    sampleCollectedAt: {
      type: Date
    },
    sampleCollector: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('LabOrder', labOrderSchema);
