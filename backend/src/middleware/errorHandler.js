const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  logger.error(err.stack || err);

  // Mongoose Bad ObjectId
  if (err.name === 'CastError') {
    const message = `Resource not found with ID ${err.value}`;
    return res.status(404).json({ success: false, message });
  }

  // Mongoose Duplicate Key Error (no internal details leaked)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0];
    if (field === 'phone') {
      return res.status(409).json({
        success: false,
        message: 'This mobile number is already registered.'
      });
    }
    if (field === 'email') {
      return res.status(400).json({ success: false, message: 'Email is already registered' });
    }
    return res.status(409).json({ success: false, message: 'This value is already registered' });
  }

  // Mongoose Validation Error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    return res.status(400).json({ success: false, message });
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Internal Server Error'
  });
};

module.exports = errorHandler;
