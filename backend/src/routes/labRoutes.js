const express = require('express');
const { body } = require('express-validator');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const {
  getLabOrders,
  createLabOrder,
  updateLabOrderStatus,
  getLabResults,
  createLabResult,
  uploadLabReportPdf,
  publishLabReport,
  getLabReportPdf,
  verifyAndReleaseLabResult
} = require('../controllers/labController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/rbacMiddleware');
const { validateRequest } = require('../middleware/validateRequest');
const { ROLES } = require('../utils/constants');

const router = express.Router();

// Ensure upload directory exists
const uploadsDir = path.join(__dirname, '../../uploads/lab-reports');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `report-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed for laboratory reports'), false);
    }
  }
});

router.use(protect);

router.get('/orders', getLabOrders);
router.post(
  '/orders',
  authorize(ROLES.DOCTOR, ROLES.ADMIN),
  [
    body('patientId').notEmpty().withMessage('Patient ID is required'),
    body('tests').isArray({ min: 1 }).withMessage('At least one lab test is required')
  ],
  validateRequest,
  createLabOrder
);
router.patch('/orders/:id/status', authorize(ROLES.LAB_TECH, ROLES.DOCTOR, ROLES.ADMIN), updateLabOrderStatus);
router.put('/orders/:id/status', authorize(ROLES.LAB_TECH, ROLES.DOCTOR, ROLES.ADMIN), updateLabOrderStatus);

router.get('/results', getLabResults);
router.post(
  '/results',
  authorize(ROLES.LAB_TECH, ROLES.ADMIN),
  [
    body('labOrderId').notEmpty().withMessage('Lab Order ID is required'),
    body('patientId').notEmpty().withMessage('Patient ID is required'),
    body('testName').notEmpty().withMessage('Test name is required')
  ],
  validateRequest,
  createLabResult
);

router.post('/results/:id/upload-pdf', authorize(ROLES.LAB_TECH, ROLES.ADMIN), upload.single('pdf'), uploadLabReportPdf);
router.post('/results/:id/publish', authorize(ROLES.LAB_TECH, ROLES.ADMIN, ROLES.DOCTOR), publishLabReport);
router.get('/results/:id/pdf', getLabReportPdf);
router.put('/results/:id/verify', authorize(ROLES.LAB_TECH, ROLES.DOCTOR, ROLES.ADMIN), verifyAndReleaseLabResult);

module.exports = router;
