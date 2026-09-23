const express = require('express');
const {
  getAdminStats,
  getUsers,
  createUser,
  updateUser,
  getServices,
  createService,
  updateService,
  getAuditLogs,
  getStaffRecords,
  createStaffRecord
} = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/rbacMiddleware');
const { ROLES } = require('../utils/constants');

const router = express.Router();

router.use(protect);

router.get('/stats', authorize(ROLES.ADMIN), getAdminStats);
router.get('/users', authorize(ROLES.ADMIN), getUsers);
router.post('/users', authorize(ROLES.ADMIN), createUser);
router.put('/users/:id', authorize(ROLES.ADMIN), updateUser);

router.get('/services', authorize(ROLES.ADMIN, ROLES.RECEPTIONIST, ROLES.DOCTOR), getServices);
router.post('/services', authorize(ROLES.ADMIN), createService);
router.put('/services/:id', authorize(ROLES.ADMIN), updateService);

router.get('/audit-logs', authorize(ROLES.ADMIN), getAuditLogs);
router.get('/staff-records', authorize(ROLES.ADMIN), getStaffRecords);
router.post('/staff-records', authorize(ROLES.ADMIN), createStaffRecord);

module.exports = router;
