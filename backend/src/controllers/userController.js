const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const ClinicalNote = require('../models/ClinicalNote');
const Prescription = require('../models/Prescription');
const LabOrder = require('../models/LabOrder');
const LabResult = require('../models/LabResult');
const Invoice = require('../models/Invoice');
const { ROLES } = require('../utils/constants');

// @desc    Get all patients
// @route   GET /api/users/patients
// @access  Private (Admin, Doctor, Receptionist)
const getPatients = async (req, res, next) => {
  try {
    const patients = await Patient.find()
      .populate('user', 'name email phone isActive')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: patients.length, data: patients });
  } catch (error) {
    next(error);
  }
};

// @desc    Get patient by ID or User ID with detailed timeline
// @route   GET /api/users/patients/:id
// @access  Private
const getPatientById = async (req, res, next) => {
  try {
    let patient = await Patient.findById(req.params.id).populate('user', 'name email phone');
    if (!patient) {
      // Try searching by user ID
      patient = await Patient.findOne({ user: req.params.id }).populate('user', 'name email phone');
    }

    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient profile not found' });
    }

    // Role check: Patient can only view their own record unless Admin/Doctor/Receptionist
    if (req.user.role === ROLES.PATIENT && patient.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this patient profile' });
    }

    res.json({ success: true, data: patient });
  } catch (error) {
    next(error);
  }
};

// @desc    Get complete unified Patient Timeline
// @route   GET /api/users/patients/:id/timeline
// @access  Private
const getPatientTimeline = async (req, res, next) => {
  try {
    const patientId = req.params.id;
    let patient = await Patient.findById(patientId);
    if (!patient) {
      patient = await Patient.findOne({ user: patientId });
    }

    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    // Guard RBAC for patient viewing timeline
    if (req.user.role === ROLES.PATIENT && patient.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied to this timeline' });
    }

    const actualPatientId = patient._id;

    const [appointments, notes, prescriptions, labOrders, labResults, invoices] = await Promise.all([
      Appointment.find({ patient: actualPatientId }).populate({ path: 'doctor', populate: { path: 'user', select: 'name' } }).sort({ appointmentDate: -1 }),
      ClinicalNote.find({ patient: actualPatientId }).populate({ path: 'doctor', populate: { path: 'user', select: 'name' } }).sort({ createdAt: -1 }),
      Prescription.find({ patient: actualPatientId }).populate({ path: 'doctor', populate: { path: 'user', select: 'name' } }).sort({ createdAt: -1 }),
      LabOrder.find({ patient: actualPatientId }).populate({ path: 'doctor', populate: { path: 'user', select: 'name' } }).sort({ createdAt: -1 }),
      LabResult.find({ patient: actualPatientId }).sort({ createdAt: -1 }),
      Invoice.find({ patient: actualPatientId }).sort({ createdAt: -1 })
    ]);

    res.json({
      success: true,
      data: {
        patient,
        appointments,
        notes,
        prescriptions,
        labOrders,
        labResults,
        invoices
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all doctors
// @route   GET /api/users/doctors
// @access  Public / Private
const getDoctors = async (req, res, next) => {
  try {
    const doctors = await Doctor.find()
      .populate('user', 'name email phone isActive')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: doctors.length, data: doctors });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPatients,
  getPatientById,
  getPatientTimeline,
  getDoctors
};
