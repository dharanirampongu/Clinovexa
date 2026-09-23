const Invoice = require('../models/Invoice');
const Patient = require('../models/Patient');
const { logAudit } = require('../middleware/auditMiddleware');
const { INVOICE_STATUS, ROLES } = require('../utils/constants');

// @desc    Get Invoices
// @route   GET /api/billing/invoices
// @access  Private
const getInvoices = async (req, res, next) => {
  try {
    const { patientId, status } = req.query;
    const query = {};

    if (patientId) query.patient = patientId;
    if (status) query.status = status;

    if (req.user.role === ROLES.PATIENT) {
      const patient = await Patient.findOne({ user: req.user._id });
      if (patient) {
        query.patient = patient._id;
      } else {
        return res.json({ success: true, count: 0, data: [] });
      }
    }

    const invoices = await Invoice.find(query)
      .populate({ path: 'patient', populate: { path: 'user', select: 'name email phone' } })
      .populate({ path: 'createdBy', select: 'name' })
      .sort({ createdAt: -1 });

    res.json({ success: true, count: invoices.length, data: invoices });
  } catch (error) {
    next(error);
  }
};

// @desc    Create Invoice
// @route   POST /api/billing/invoices
// @access  Private (Admin, Receptionist)
const createInvoice = async (req, res, next) => {
  try {
    const { patientId, appointmentId, items, discount = 0, tax = 0 } = req.body;

    const subtotal = items.reduce((acc, item) => acc + item.amount, 0);
    const total = Math.max(0, subtotal - discount + tax);

    const invoiceNumber = `INV-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

    const invoice = await Invoice.create({
      patient: patientId,
      appointment: appointmentId || null,
      invoiceNumber,
      items: items || [],
      subtotal,
      discount,
      tax,
      total,
      status: INVOICE_STATUS.UNPAID,
      createdBy: req.user._id
    });

    await logAudit(req, 'CREATE', 'Invoice', invoice._id, { invoiceNumber, total });

    res.status(201).json({ success: true, data: invoice });
  } catch (error) {
    next(error);
  }
};

// @desc    Process Invoice Payment
// @route   PUT /api/billing/invoices/:id/pay
// @access  Private (Admin, Receptionist, Patient)
const processPayment = async (req, res, next) => {
  try {
    const { paymentMethod, amountPaid } = req.body;
    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    invoice.status = INVOICE_STATUS.PAID;
    invoice.paymentMethod = paymentMethod || 'CASH';
    invoice.paidAt = new Date();

    await invoice.save();

    await logAudit(req, 'PAYMENT', 'Invoice', invoice._id, {
      invoiceNumber: invoice.invoiceNumber,
      amountPaid: amountPaid || invoice.total,
      paymentMethod
    });

    res.json({ success: true, data: invoice });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getInvoices,
  createInvoice,
  processPayment
};
