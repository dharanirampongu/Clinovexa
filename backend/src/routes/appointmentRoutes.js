const express = require('express');
const { body } = require('express-validator');
const {
  getAppointments,
  createAppointment,
  updateAppointment
} = require('../controllers/appointmentController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/rbacMiddleware');
const { validateRequest } = require('../middleware/validateRequest');
const { ROLES } = require('../utils/constants');

const router = express.Router();

router.use(protect);

router.get('/', getAppointments);

router.post(
  '/',
  authorize(ROLES.ADMIN, ROLES.RECEPTIONIST, ROLES.PATIENT),
  [
    body('doctorId').notEmpty().withMessage('Doctor is required'),
    body('appointmentDate').notEmpty().withMessage('Appointment date is required'),
    body('startTime').notEmpty().withMessage('Start time is required')
  ],
  validateRequest,
  createAppointment
);

router.patch('/:id/status', updateAppointment);
router.put('/:id/status', updateAppointment);
router.patch('/:id', updateAppointment);
router.put('/:id', updateAppointment);

module.exports = router;
