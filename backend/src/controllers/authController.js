const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const Receptionist = require('../models/Receptionist');
const LabTechnician = require('../models/LabTechnician');
const StaffRecord = require('../models/StaffRecord');
const config = require('../config/env');
const { logAudit } = require('../middleware/auditMiddleware');
const { ROLES } = require('../utils/constants');
const { normalizePhone, isValidPhone } = require('../utils/phone');

const MOBILE_CONFLICT_MESSAGE = 'This mobile number is already registered.';

// Generate JWT helper
const generateToken = (id) => {
  return jwt.sign({ id }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn
  });
};

// Helper to format friendly role names
const getFriendlyRoleName = (roleKey) => {
  switch (roleKey) {
    case ROLES.ADMIN:
      return 'Admin';
    case ROLES.DOCTOR:
      return 'Doctor';
    case ROLES.RECEPTIONIST:
      return 'Receptionist';
    case ROLES.LAB_TECH:
      return 'Lab Technician';
    case ROLES.PATIENT:
      return 'Patient';
    default:
      return roleKey || 'User';
  }
};

// @desc    Register a new user (role-specific profile creation)
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const { 
      name, 
      email, 
      password, 
      role, 
      phone, 
      dob, 
      gender, 
      bloodGroup, 
      address,
      licenseNumber,
      specialization,
      qualification,
      yearsOfExperience,
      employeeId,
      staffId,
      section,
      certification,
      department
    } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'Email is already registered' });
    }

    // Mobile number: required, normalized, unique (formats like
    // `+91 98765 43210` and `919876543210` are treated as the same number).
    const normalizedPhone = normalizePhone(phone);
    if (!normalizedPhone) {
      return res.status(400).json({ success: false, message: 'Mobile number is required' });
    }
    if (!isValidPhone(normalizedPhone)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid mobile number (7-15 digits)'
      });
    }
    const phoneExists = await User.findOne({ phone: normalizedPhone });
    if (phoneExists) {
      return res.status(409).json({ success: false, message: MOBILE_CONFLICT_MESSAGE });
    }

    const assignedRole = role && Object.values(ROLES).includes(role) ? role : ROLES.PATIENT;
    const isStaff = [ROLES.ADMIN, ROLES.DOCTOR, ROLES.RECEPTIONIST, ROLES.LAB_TECH].includes(assignedRole);

    let matchedStaffRecord = null;

    if (isStaff) {
      const targetStaffId = staffId || employeeId;
      if (!targetStaffId) {
        return res.status(400).json({
          success: false,
          message: 'Hospital/Staff ID is required for staff registration. Please enter a valid Staff ID.'
        });
      }

      matchedStaffRecord = await StaffRecord.findOne({
        staffId: targetStaffId.trim().toUpperCase(),
        role: assignedRole
      });

      if (!matchedStaffRecord || matchedStaffRecord.isClaimed) {
        return res.status(400).json({
          success: false,
          message: 'Staff ID not found. Please contact hospital administration.'
        });
      }
    }

    const user = await User.create({
      name,
      email,
      password,
      role: assignedRole,
      staffId: isStaff && matchedStaffRecord ? matchedStaffRecord.staffId : '',
      phone: normalizedPhone
    });

    if (matchedStaffRecord) {
      matchedStaffRecord.isClaimed = true;
      matchedStaffRecord.claimedBy = user._id;
      await matchedStaffRecord.save();
    }

    let profileId = null;

    // Create corresponding domain profile based on selected role
    if (assignedRole === ROLES.PATIENT) {
      const p = await Patient.create({
        user: user._id,
        dob: dob ? new Date(dob) : new Date('1990-01-01'),
        gender: gender || 'Male',
        bloodGroup: bloodGroup || 'A+',
        address: address || ''
      });
      profileId = p._id;
    } else if (assignedRole === ROLES.DOCTOR) {
      const d = await Doctor.create({
        user: user._id,
        specialization: specialization || 'General Medicine',
        department: department || matchedStaffRecord?.department || 'Outpatient',
        licenseNumber: licenseNumber || `LIC-${matchedStaffRecord?.staffId || Date.now().toString().slice(-6)}`,
        consultationFee: 100,
        workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        timeSlots: [{ startTime: '09:00', endTime: '17:00' }]
      });
      profileId = d._id;
    } else if (assignedRole === ROLES.RECEPTIONIST) {
      const recEmpId = matchedStaffRecord?.staffId || employeeId || `REC-${Date.now().toString().slice(-6)}`;
      const r = await Receptionist.create({
        user: user._id,
        employeeId: recEmpId,
        deskNumber: 'Desk 1',
        shift: 'Full Day'
      });
      profileId = r._id;
    } else if (assignedRole === ROLES.LAB_TECH) {
      const labEmpId = matchedStaffRecord?.staffId || employeeId || `LAB-${Date.now().toString().slice(-6)}`;
      const lt = await LabTechnician.create({
        user: user._id,
        employeeId: labEmpId,
        section: section || department || 'Clinical Diagnostics',
        certification: certification || 'Certified Lab Specialist'
      });
      profileId = lt._id;
    }

    const token = generateToken(user._id);

    await logAudit(req, 'REGISTER', 'User', user._id, { role: assignedRole, email });

    res.status(201).json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        profileId
      }
    });
  } catch (error) {
    // Race guard: two simultaneous registrations with the same mobile number —
    // the unique index rejects the loser. Return 409 without internals.
    if (error && error.code === 11000) {
      const keyStr = JSON.stringify(error.keyValue || error.keyPattern || {}) + ' ' + (error.message || '');
      if (keyStr.includes('phone')) {
        return res.status(409).json({ success: false, message: MOBILE_CONFLICT_MESSAGE });
      }
      if (keyStr.includes('email')) {
        return res.status(400).json({ success: false, message: 'Email is already registered' });
      }
    }
    next(error);
  }
};

// @desc    Login user & get token
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'Account not found. Please use your existing hospital account email.' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Incorrect email or password.' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Account is deactivated' });
    }

    // Role validation check if role is supplied by the frontend
    if (role && user.role !== role) {
      const friendlyRole = getFriendlyRoleName(user.role);
      return res.status(400).json({
        success: false,
        message: `This account is registered as a ${friendlyRole}. Please select the ${friendlyRole} portal.`
      });
    }

    const token = generateToken(user._id);

    // Attach profile reference ID if applicable
    let profileId = null;
    if (user.role === ROLES.PATIENT) {
      const p = await Patient.findOne({ user: user._id });
      if (p) profileId = p._id;
    } else if (user.role === ROLES.DOCTOR) {
      const d = await Doctor.findOne({ user: user._id });
      if (d) profileId = d._id;
    } else if (user.role === ROLES.RECEPTIONIST) {
      const r = await Receptionist.findOne({ user: user._id });
      if (r) profileId = r._id;
    } else if (user.role === ROLES.LAB_TECH) {
      const lt = await LabTechnician.findOne({ user: user._id });
      if (lt) profileId = lt._id;
    }

    req.user = user;
    await logAudit(req, 'LOGIN', 'User', user._id, { role: user.role, email: user.email });

    res.json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        profileId
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Google Sign-In integration
// @route   POST /api/auth/google
// @access  Public
const googleLogin = async (req, res, next) => {
  try {
    const { email, name, googleId, role } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Google authentication email is required.' });
    }

    let user = await User.findOne({ email });

    if (!user) {
      // If user does not exist, check role restriction
      const requestedRole = role || ROLES.PATIENT;
      const isStaff = [ROLES.ADMIN, ROLES.DOCTOR, ROLES.RECEPTIONIST, ROLES.LAB_TECH].includes(requestedRole);

      if (isStaff) {
        return res.status(403).json({
          success: false,
          message: 'Google account is not associated with an authorized hospital staff account. Staff members must be registered with an existing Staff ID.'
        });
      }

      // Auto-register Patient account if signing in as Patient
      user = await User.create({
        name: name || email.split('@')[0],
        email: email.toLowerCase(),
        password: `GoogleAuth_${Date.now()}`,
        role: ROLES.PATIENT,
        googleId: googleId || `google_${Date.now()}`
      });

      await Patient.create({
        user: user._id,
        dob: new Date('1990-01-01'),
        gender: 'Male',
        bloodGroup: 'A+',
        address: ''
      });
    }

    // Role check
    if (role && user.role !== role) {
      const friendlyRole = getFriendlyRoleName(user.role);
      return res.status(400).json({
        success: false,
        message: `This email is registered as a ${friendlyRole}. Please select the ${friendlyRole} portal.`
      });
    }

    const token = generateToken(user._id);

    let profileId = null;
    if (user.role === ROLES.PATIENT) {
      const p = await Patient.findOne({ user: user._id });
      if (p) profileId = p._id;
    } else if (user.role === ROLES.DOCTOR) {
      const d = await Doctor.findOne({ user: user._id });
      if (d) profileId = d._id;
    } else if (user.role === ROLES.RECEPTIONIST) {
      const r = await Receptionist.findOne({ user: user._id });
      if (r) profileId = r._id;
    } else if (user.role === ROLES.LAB_TECH) {
      const lt = await LabTechnician.findOne({ user: user._id });
      if (lt) profileId = lt._id;
    }

    req.user = user;
    await logAudit(req, 'GOOGLE_LOGIN', 'User', user._id, { role: user.role, email: user.email });

    res.json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        profileId
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    let profile = null;

    if (user.role === ROLES.PATIENT) {
      profile = await Patient.findOne({ user: user._id });
    } else if (user.role === ROLES.DOCTOR) {
      profile = await Doctor.findOne({ user: user._id });
    } else if (user.role === ROLES.RECEPTIONIST) {
      profile = await Receptionist.findOne({ user: user._id });
    } else if (user.role === ROLES.LAB_TECH) {
      profile = await LabTechnician.findOne({ user: user._id });
    }

    res.json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        staffId: user.staffId,
        isActive: user.isActive,
        profile
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  googleLogin,
  getMe
};
