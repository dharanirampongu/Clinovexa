const express = require('express');
const { summarizeNote, explainPrescription } = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/rbacMiddleware');
const { ROLES } = require('../utils/constants');

const router = express.Router();

router.use(protect);

router.post('/summarize-note', authorize(ROLES.DOCTOR, ROLES.ADMIN), summarizeNote);
router.post('/explain-prescription', explainPrescription); // Accessible by clinicians & patients

module.exports = router;
