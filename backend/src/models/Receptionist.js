const mongoose = require('mongoose');

const receptionistSchema = new mongoose.Schema(
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
    deskNumber: {
      type: String,
      default: 'Desk 1'
    },
    shift: {
      type: String,
      enum: ['Morning', 'Evening', 'Night', 'Full Day'],
      default: 'Full Day'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Receptionist', receptionistSchema);
