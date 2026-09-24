const { validationResult } = require('express-validator');

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errList = errors.array();
    return res.status(400).json({
      success: false,
      message: errList[0]?.msg || 'Validation failed',
      errors: errList.map(err => ({
        field: err.path || err.param,
        message: err.msg
      }))
    });
  }
  next();
};

module.exports = { validateRequest };
