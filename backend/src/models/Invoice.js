const mongoose = require('mongoose');
const { INVOICE_STATUS } = require('../utils/constants');

const invoiceSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true
    },
    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment'
    },
    invoiceNumber: {
      type: String,
      required: true,
      unique: true
    },
    items: [
      {
        description: { type: String, required: true },
        category: { type: String, default: 'General' },
        quantity: { type: Number, default: 1 },
        unitPrice: { type: Number, required: true },
        amount: { type: Number, required: true }
      }
    ],
    subtotal: {
      type: Number,
      required: true
    },
    discount: {
      type: Number,
      default: 0
    },
    tax: {
      type: Number,
      default: 0
    },
    total: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      enum: Object.values(INVOICE_STATUS),
      default: INVOICE_STATUS.UNPAID
    },
    paymentMethod: {
      type: String,
      enum: ['CASH', 'CARD', 'INSURANCE', 'ONLINE', 'UNPAID'],
      default: 'UNPAID'
    },
    paidAt: {
      type: Date
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

module.exports = mongoose.model('Invoice', invoiceSchema);
