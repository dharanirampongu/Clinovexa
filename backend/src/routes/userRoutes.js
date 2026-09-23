const express = require('express');
const {
  getPatients,
  getPatientById,
  getPatientTimeline,
  getDoctors
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/rbacMiddleware');
const { ROLES } = require('../utils/constants');

const router = express.Router();

router.get('/doctors', getDoctors); // Public or authenticated

router.use(protect);

router.get('/patients', authorize(ROLES.ADMIN, ROLES.DOCTOR, ROLES.RECEPTIONIST, ROLES.LAB_TECH), getPatients);
router.get('/patients/:id', getPatientById);
router.get('/patients/:id/timeline', getPatientTimeline);

module.exports = router;
