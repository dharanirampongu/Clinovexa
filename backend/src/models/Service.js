const mongoose = require('mongoose');
const { SERVICE_CATEGORY } = require('../utils/constants');

const serviceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    category: {
      type: String,
      enum: Object.values(SERVICE_CATEGORY),
      required: true
    },
    description: {
      type: String,
      default: ''
    },
    cost: {
      type: Number,
      required: true
    },
    department: {
      type: String,
      default: 'General Clinic'
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

module.exports = mongoose.model('Service', serviceSchema);
