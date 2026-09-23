const mongoose = require('mongoose');
const { LAB_RESULT_STATUS } = require('../utils/constants');

const labResultSchema = new mongoose.Schema(
  {
    labOrder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LabOrder',
      required: true
    },
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true
    },
    technician: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    testName: {
      type: String,
      required: true
    },
    parameterResults: [
      {
        parameter: { type: String, required: true },
        value: { type: String, required: true },
        unit: { type: String, default: '' },
        referenceRange: { type: String, default: '' },
        isAbnormal: { type: Boolean, default: false }
      }
    ],
    remarks: {
      type: String,
      default: ''
    },
    pdfPath: {
      type: String,
      default: ''
    },
    pdfOriginalName: {
      type: String,
      default: ''
    },
    isPublished: {
      type: Boolean,
      default: false
    },
    publishedAt: {
      type: Date
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    verifiedAt: {
      type: Date
    },
    status: {
      type: String,
      enum: Object.values(LAB_RESULT_STATUS),
      default: LAB_RESULT_STATUS.DRAFT
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('LabResult', labResultSchema);
