const express = require('express');
const { body } = require('express-validator');
const {
  getInvoices,
  createInvoice,
  processPayment
} = require('../controllers/billingController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/rbacMiddleware');
const { validateRequest } = require('../middleware/validateRequest');
const { ROLES } = require('../utils/constants');

const router = express.Router();

router.use(protect);

router.get('/invoices', getInvoices);
router.post(
  '/invoices',
  authorize(ROLES.ADMIN, ROLES.RECEPTIONIST),
  [
    body('patientId').notEmpty().withMessage('Patient ID is required'),
    body('items').isArray({ min: 1 }).withMessage('At least one line item is required')
  ],
  validateRequest,
  createInvoice
);
router.patch(
  '/invoices/:id/pay',
  authorize(ROLES.ADMIN, ROLES.RECEPTIONIST, ROLES.PATIENT),
  processPayment
);
router.put(
  '/invoices/:id/pay',
  authorize(ROLES.ADMIN, ROLES.RECEPTIONIST, ROLES.PATIENT),
  processPayment
);

module.exports = router;
