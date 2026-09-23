const AuditLog = require('../models/AuditLog');
const logger = require('../utils/logger');

const logAudit = async (req, action, entity, entityId, details = {}) => {
  try {
    await AuditLog.create({
      user: req.user ? req.user._id : null,
      userName: req.user ? req.user.name : 'System/Guest',
      userRole: req.user ? req.user.role : 'SYSTEM',
      action,
      entity,
      entityId,
      details,
      ipAddress: req.ip || req.connection.remoteAddress || '127.0.0.1'
    });
  } catch (error) {
    logger.error('Failed to create audit log entry:', error.message);
  }
};

module.exports = { logAudit };
