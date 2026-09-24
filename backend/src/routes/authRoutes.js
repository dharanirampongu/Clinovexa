const express = require('express');
const { body } = require('express-validator');
const { register, login, googleLogin, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { validateRequest } = require('../middleware/validateRequest');
const { isValidPhone } = require('../utils/phone');

const router = express.Router();

router.post(
  '/register',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('phone')
      .notEmpty()
      .withMessage('Mobile number is required')
      .bail()
      .custom((value) => isValidPhone(value))
      .withMessage('Please enter a valid mobile number (7-15 digits)')
  ],
  validateRequest,
  register
);

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required')
  ],
  validateRequest,
  login
);

router.post('/google', googleLogin);

router.get('/me', protect, getMe);

module.exports = router;
