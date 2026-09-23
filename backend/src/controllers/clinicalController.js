const ClinicalNote = require('../models/ClinicalNote');
const Prescription = require('../models/Prescription');
const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const { generateClinicalSummary, generatePatientExplanation } = require('../services/aiService');
const { logAudit } = require('../middleware/auditMiddleware');
const { APPOINTMENT_STATUS, ROLES } = require('../utils/constants');

// @desc    Get Clinical Notes for a patient or appointment
// @route   GET /api/clinical/notes
// @access  Private (Doctor, Admin, Patient)
const getClinicalNotes = async (req, res, next) => {
  try {
    const { patientId, appointmentId } = req.query;
    const query = {};

    if (patientId) query.patient = patientId;
    if (appointmentId) query.appointment = appointmentId;

    if (req.user.role === ROLES.PATIENT) {
      const patient = await Patient.findOne({ user: req.user._id });
      if (patient) {
        query.patient = patient._id;
      } else {
        return res.json({ success: true, count: 0, data: [] });
      }
    }

    const notes = await ClinicalNote.find(query)
      .populate({ path: 'doctor', populate: { path: 'user', select: 'name specialization' } })
      .populate({ path: 'patient', populate: { path: 'user', select: 'name' } })
      .populate('appointment')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: notes.length, data: notes });
  } catch (error) {
    next(error);
  }
};

// @desc    Create Clinical SOAP Note & auto-generate AI summary
// @route   POST /api/clinical/notes
// @access  Private (Doctor)
const createClinicalNote = async (req, res, next) => {
  try {
    const { appointmentId, patientId, vitals, subjective, objective, assessment, plan } = req.body;

    const doctor = await Doctor.findOne({ user: req.user._id });
    if (!doctor && req.user.role !== ROLES.ADMIN) {
      return res.status(403).json({ success: false, message: 'Only registered doctors can record clinical notes' });
    }

    const doctorId = doctor ? doctor._id : req.body.doctorId;

    // Generate AI Clinical Summary
    const aiSummary = await generateClinicalSummary({
      subjective,
      objective,
      assessment,
      plan,
      vitals
    });

    const note = await ClinicalNote.create({
      appointment: appointmentId,
      patient: patientId,
      doctor: doctorId,
      vitals: vitals || {},
      subjective,
      objective: objective || '',
      assessment,
      plan: plan || '',
      aiSummary
    });

    // Optionally mark appointment status COMPLETED or IN_PROGRESS
    if (appointmentId) {
      await Appointment.findByIdAndUpdate(appointmentId, { status: APPOINTMENT_STATUS.COMPLETED });
    }

    await logAudit(req, 'CREATE', 'ClinicalNote', note._id, { appointmentId, patientId, assessment });

    res.status(201).json({ success: true, data: note });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Prescriptions
// @route   GET /api/clinical/prescriptions
// @access  Private
const getPrescriptions = async (req, res, next) => {
  try {
    const { patientId, appointmentId } = req.query;
    const query = {};

    if (patientId) query.patient = patientId;
    if (appointmentId) query.appointment = appointmentId;

    if (req.user.role === ROLES.PATIENT) {
      const patient = await Patient.findOne({ user: req.user._id });
      if (patient) {
        query.patient = patient._id;
      } else {
        return res.json({ success: true, count: 0, data: [] });
      }
    }

    const prescriptions = await Prescription.find(query)
      .populate({ path: 'doctor', populate: { path: 'user', select: 'name' } })
      .populate({ path: 'patient', populate: { path: 'user', select: 'name' } })
      .sort({ createdAt: -1 });

    res.json({ success: true, count: prescriptions.length, data: prescriptions });
  } catch (error) {
    next(error);
  }
};

// @desc    Create Prescription & auto-generate AI Plain Language Patient Explanation
// @route   POST /api/clinical/prescriptions
// @access  Private (Doctor)
const createPrescription = async (req, res, next) => {
  try {
    const { appointmentId, patientId, medications, followUpDate, generalInstructions } = req.body;

    const doctor = await Doctor.findOne({ user: req.user._id });
    if (!doctor && req.user.role !== ROLES.ADMIN) {
      return res.status(403).json({ success: false, message: 'Only doctors can issue prescriptions' });
    }

    const doctorId = doctor ? doctor._id : req.body.doctorId;

    // AI Integration #2: Generate plain language patient instructions
    const aiPatientExplanation = await generatePatientExplanation({
      medications,
      generalInstructions,
      followUpDate
    });

    const prescription = await Prescription.create({
      appointment: appointmentId,
      patient: patientId,
      doctor: doctorId,
      medications: medications || [],
      followUpDate: followUpDate ? new Date(followUpDate) : null,
      generalInstructions: generalInstructions || '',
      aiPatientExplanation
    });

    // Notify Patient
    try {
      const Notification = require('../models/Notification');
      const targetPatient = await Patient.findById(patientId);
      if (targetPatient && targetPatient.user) {
        await Notification.create({
          user: targetPatient.user,
          title: 'New Prescription Available',
          message: `Dr. ${req.user.name || 'your doctor'} issued a new prescription with ${medications?.length || 1} medication(s).`,
          type: 'PRESCRIPTION',
          link: '/patient/dashboard#prescriptions'
        });
      }
    } catch (notifErr) {
      console.error('Failed to send prescription notification:', notifErr);
    }

    await logAudit(req, 'CREATE', 'Prescription', prescription._id, { appointmentId, patientId, count: medications?.length });

    res.status(201).json({ success: true, data: prescription });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getClinicalNotes,
  createClinicalNote,
  getPrescriptions,
  createPrescription
};
