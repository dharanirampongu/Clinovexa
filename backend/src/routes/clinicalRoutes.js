const express = require('express');
const { body } = require('express-validator');
const {
  getClinicalNotes,
  createClinicalNote,
  getPrescriptions,
  createPrescription
} = require('../controllers/clinicalController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/rbacMiddleware');
const { validateRequest } = require('../middleware/validateRequest');
const { ROLES } = require('../utils/constants');

const router = express.Router();

router.use(protect);

router.get('/notes', getClinicalNotes);
router.post(
  '/notes',
  authorize(ROLES.DOCTOR, ROLES.ADMIN),
  [
    body('patientId').notEmpty().withMessage('Patient ID is required'),
    body('subjective').notEmpty().withMessage('Subjective findings required'),
    body('assessment').notEmpty().withMessage('Assessment diagnosis required')
  ],
  validateRequest,
  createClinicalNote
);

router.get('/prescriptions', getPrescriptions);
router.post(
  '/prescriptions',
  authorize(ROLES.DOCTOR, ROLES.ADMIN),
  [
    body('patientId').notEmpty().withMessage('Patient ID is required'),
    body('medications').isArray({ min: 1 }).withMessage('At least one medication is required')
  ],
  validateRequest,
  createPrescription
);

module.exports = router;
