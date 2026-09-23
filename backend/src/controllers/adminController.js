const User = require('../models/User');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const Receptionist = require('../models/Receptionist');
const LabTechnician = require('../models/LabTechnician');
const Service = require('../models/Service');
const Appointment = require('../models/Appointment');
const Invoice = require('../models/Invoice');
const AuditLog = require('../models/AuditLog');
const { logAudit } = require('../middleware/auditMiddleware');
const { ROLES } = require('../utils/constants');

// @desc    Get dashboard statistics (Users count, revenue, appointment stats)
// @route   GET /api/admin/stats
// @access  Private (Admin)
const getAdminStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalPatients = await Patient.countDocuments();
    const totalDoctors = await Doctor.countDocuments();
    const totalAppointments = await Appointment.countDocuments();
    const totalServices = await Service.countDocuments();

    // Financial revenue calculate
    const paidInvoices = await Invoice.find({ status: 'PAID' });
    const totalRevenue = paidInvoices.reduce((acc, inv) => acc + (inv.total || 0), 0);

    const appointmentsByStatus = await Appointment.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    res.json({
      success: true,
      data: {
        totalUsers,
        totalPatients,
        totalDoctors,
        totalAppointments,
        totalServices,
        totalRevenue,
        appointmentsByStatus
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users with filtering
// @route   GET /api/admin/users
// @access  Private (Admin)
const getUsers = async (req, res, next) => {
  try {
    const { role, search } = req.query;
    const query = {};

    if (role) query.role = role;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query).sort({ createdAt: -1 });
    res.json({ success: true, count: users.length, data: users });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new user (Staff/Patient) by Admin
// @route   POST /api/admin/users
// @access  Private (Admin)
const createUser = async (req, res, next) => {
  try {
    const { name, email, password, role, phone, specialization, department, licenseNumber, consultationFee, workingDays, employeeId, deskNumber, section } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User with this email already exists' });
    }

    const user = await User.create({
      name,
      email,
      password: password || 'Password123!',
      role,
      phone: phone || ''
    });

    // Handle role specific profile creation
    if (role === ROLES.PATIENT) {
      await Patient.create({
        user: user._id,
        dob: req.body.dob ? new Date(req.body.dob) : new Date('1995-01-01'),
        gender: req.body.gender || 'Other',
        bloodGroup: req.body.bloodGroup || 'Unknown',
        address: req.body.address || ''
      });
    } else if (role === ROLES.DOCTOR) {
      await Doctor.create({
        user: user._id,
        specialization: specialization || 'General Practitioner',
        department: department || 'General Medicine',
        licenseNumber: licenseNumber || `LIC-${Date.now()}`,
        consultationFee: consultationFee || 100,
        workingDays: workingDays || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        timeSlots: [{ startTime: '09:00', endTime: '17:00' }]
      });
    } else if (role === ROLES.RECEPTIONIST) {
      await Receptionist.create({
        user: user._id,
        employeeId: employeeId || `EMP-REC-${Date.now()}`,
        deskNumber: deskNumber || 'Desk 1'
      });
    } else if (role === ROLES.LAB_TECH) {
      await LabTechnician.create({
        user: user._id,
        employeeId: employeeId || `EMP-LAB-${Date.now()}`,
        section: section || 'General Lab'
      });
    }

    await logAudit(req, 'CREATE', 'User', user._id, { role: user.role, email: user.email });

    res.status(201).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user status / profile
// @route   PUT /api/admin/users/:id
// @access  Private (Admin)
const updateUser = async (req, res, next) => {
  try {
    const { name, phone, isActive, role } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (isActive !== undefined) user.isActive = isActive;
    if (role) user.role = role;

    await user.save();
    await logAudit(req, 'UPDATE', 'User', user._id, { name, isActive, role });

    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all clinic services
// @route   GET /api/admin/services
// @access  Private (Admin, Receptionist, Doctor)
const getServices = async (req, res, next) => {
  try {
    const services = await Service.find().sort({ name: 1 });
    res.json({ success: true, count: services.length, data: services });
  } catch (error) {
    next(error);
  }
};

// @desc    Create clinic service
// @route   POST /api/admin/services
// @access  Private (Admin)
const createService = async (req, res, next) => {
  try {
    const { name, category, description, cost, department } = req.body;
    const service = await Service.create({
      name,
      category,
      description: description || '',
      cost,
      department: department || 'General Clinic'
    });

    await logAudit(req, 'CREATE', 'Service', service._id, { name, cost, category });

    res.status(201).json({ success: true, data: service });
  } catch (error) {
    next(error);
  }
};

// @desc    Update clinic service
// @route   PUT /api/admin/services/:id
// @access  Private (Admin)
const updateService = async (req, res, next) => {
  try {
    const service = await Service.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }

    await logAudit(req, 'UPDATE', 'Service', service._id, req.body);

    res.json({ success: true, data: service });
  } catch (error) {
    next(error);
  }
};

// @desc    Get system audit logs
// @route   GET /api/admin/audit-logs
// @access  Private (Admin)
const getAuditLogs = async (req, res, next) => {
  try {
    const logs = await AuditLog.find().sort({ createdAt: -1 }).limit(100);
    res.json({ success: true, count: logs.length, data: logs });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all pre-authorized Staff Records
// @route   GET /api/admin/staff-records
// @access  Private (Admin)
const getStaffRecords = async (req, res, next) => {
  try {
    const StaffRecord = require('../models/StaffRecord');
    const records = await StaffRecord.find().populate('claimedBy', 'name email').sort({ createdAt: -1 });
    res.json({ success: true, count: records.length, data: records });
  } catch (error) {
    next(error);
  }
};

// @desc    Create pre-authorized Staff ID record
// @route   POST /api/admin/staff-records
// @access  Private (Admin)
const createStaffRecord = async (req, res, next) => {
  try {
    const StaffRecord = require('../models/StaffRecord');
    const { staffId, role, name, email, department } = req.body;

    const existing = await StaffRecord.findOne({ staffId: staffId.toUpperCase() });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Staff ID already exists' });
    }

    const record = await StaffRecord.create({
      staffId: staffId.toUpperCase().trim(),
      role,
      name,
      email: email.toLowerCase().trim(),
      department: department || 'Hospital Staff'
    });

    await logAudit(req, 'CREATE_STAFF_ID', 'StaffRecord', record._id, { staffId: record.staffId, role });

    res.status(201).json({ success: true, data: record });
  } catch (error) {
    next(error);
  }
};

module.exports = {
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
};
