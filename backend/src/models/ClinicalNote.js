const mongoose = require('mongoose');

const clinicalNoteSchema = new mongoose.Schema(
  {
    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
      required: true
    },
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
    vitals: {
      bp: { type: String, default: '120/80' },
      pulse: { type: Number, default: 72 },
      temp: { type: Number, default: 98.6 },
      weight: { type: Number, default: 70 },
      spo2: { type: Number, default: 98 }
    },
    subjective: {
      type: String,
      required: [true, 'Chief complaints/subjective symptoms required']
    },
    objective: {
      type: String,
      default: ''
    },
    assessment: {
      type: String,
      required: [true, 'Diagnosis/Clinical assessment required']
    },
    plan: {
      type: String,
      default: ''
    },
    aiSummary: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('ClinicalNote', clinicalNoteSchema);
