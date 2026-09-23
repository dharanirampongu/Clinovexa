const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    userName: {
      type: String,
      default: 'System/Guest'
    },
    userRole: {
      type: String,
      default: 'SYSTEM'
    },
    action: {
      type: String,
      required: true // e.g., 'CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'AI_GENERATE'
    },
    entity: {
      type: String,
      required: true // e.g., 'Appointment', 'ClinicalNote', 'Prescription', 'LabOrder', 'Invoice'
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    ipAddress: {
      type: String,
      default: '127.0.0.1'
    }
  },
  {
    timestamps: true
  }
);

auditLogSchema.index({ entity: 1, entityId: 1, createdAt: -1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
