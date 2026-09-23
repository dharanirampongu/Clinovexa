const mongoose = require('mongoose');

const labTechnicianSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    employeeId: {
      type: String,
      required: true,
      unique: true
    },
    section: {
      type: String,
      default: 'General Hematology & Biochemistry'
    },
    certification: {
      type: String,
      default: 'Certified Medical Laboratory Technician'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('LabTechnician', labTechnicianSchema);
