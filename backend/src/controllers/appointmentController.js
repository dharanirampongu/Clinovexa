const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const { checkDoctorAvailability } = require('../services/conflictDetection');
const { logAudit } = require('../middleware/auditMiddleware');
const { APPOINTMENT_STATUS, ROLES } = require('../utils/constants');

// @desc    Get all appointments (Filtered by role, date, status, doctor, patient)
// @route   GET /api/appointments
// @access  Private
const getAppointments = async (req, res, next) => {
  try {
    const { doctorId, patientId, date, status } = req.query;
    const query = {};

    // Role-based restrictions
    if (req.user.role === ROLES.PATIENT) {
      const patient = await Patient.findOne({ user: req.user._id });
      if (patient) {
        query.patient = patient._id;
      } else {
        return res.json({ success: true, count: 0, data: [] });
      }
    } else if (req.user.role === ROLES.DOCTOR) {
      const doctor = await Doctor.findOne({ user: req.user._id });
      if (doctor) {
        query.doctor = doctor._id;
      }
    }

    if (doctorId) query.doctor = doctorId;
    if (patientId) query.patient = patientId;
    if (status) query.status = status;

    if (date) {
      const targetDate = new Date(date);
      const startOfDay = new Date(targetDate);
      startOfDay.setUTCHours(0, 0, 0, 0);
      const endOfDay = new Date(targetDate);
      endOfDay.setUTCHours(23, 59, 59, 999);
      query.appointmentDate = { $gte: startOfDay, $lte: endOfDay };
    }

    const appointments = await Appointment.find(query)
      .populate({ path: 'patient', populate: { path: 'user', select: 'name email phone' } })
      .populate({ path: 'doctor', populate: { path: 'user', select: 'name email' } })
      .populate('service')
      .sort({ appointmentDate: 1, startTime: 1 });

    res.json({ success: true, count: appointments.length, data: appointments });
  } catch (error) {
    next(error);
  }
};

// @desc    Create / Schedule new appointment
// @route   POST /api/appointments
// @access  Private (Admin, Receptionist, Patient)
const createAppointment = async (req, res, next) => {
  try {
    let { patientId, doctorId, serviceId, appointmentDate, startTime, endTime, reasonForVisit } = req.body;

    // If logged in user is a patient booking for self
    if (req.user.role === ROLES.PATIENT) {
      const patient = await Patient.findOne({ user: req.user._id });
      if (!patient) {
        return res.status(400).json({ success: false, message: 'Patient profile not found' });
      }
      patientId = patient._id;
    }

    if (!patientId || !doctorId || !appointmentDate || !startTime) {
      return res.status(400).json({ success: false, message: 'Missing required appointment parameters' });
    }

    // Default end time to +30 mins if not supplied
    if (!endTime) {
      const [h, m] = startTime.split(':').map(Number);
      const endM = (m + 30) % 60;
      const endH = h + Math.floor((m + 30) / 60);
      endTime = `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;
    }

    // 1. Conflict detection check
    const conflictResult = await checkDoctorAvailability({
      doctorId,
      appointmentDate,
      startTime,
      endTime
    });

    if (conflictResult.hasConflict) {
      return res.status(409).json({
        success: false,
        message: conflictResult.reason || 'Appointment conflict detected for specified doctor and time slot.'
      });
    }

    // Calculate queue number for doctor on that date
    const targetDate = new Date(appointmentDate);
    const startOfDay = new Date(targetDate);
    startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setUTCHours(23, 59, 59, 999);

    const countOnDate = await Appointment.countDocuments({
      doctor: doctorId,
      appointmentDate: { $gte: startOfDay, $lte: endOfDay }
    });

    const appointment = await Appointment.create({
      patient: patientId,
      doctor: doctorId,
      service: serviceId || null,
      appointmentDate: targetDate,
      startTime,
      endTime,
      reasonForVisit: reasonForVisit || 'General Consultation',
      queueNumber: countOnDate + 1,
      status: APPOINTMENT_STATUS.SCHEDULED,
      createdBy: req.user._id
    });

    const populatedAppt = await Appointment.findById(appointment._id)
      .populate({ path: 'patient', populate: { path: 'user', select: 'name email phone' } })
      .populate({ path: 'doctor', populate: { path: 'user', select: 'name' } })
      .populate('service');

    await logAudit(req, 'CREATE', 'Appointment', appointment._id, {
      patientId,
      doctorId,
      appointmentDate,
      startTime
    });

    res.status(201).json({ success: true, data: populatedAppt });
  } catch (error) {
    next(error);
  }
};

// @desc    Update appointment status / Reschedule
// @route   PUT /api/appointments/:id
// @access  Private
const updateAppointment = async (req, res, next) => {
  try {
    const { status, appointmentDate, startTime, endTime, cancellationReason } = req.body;
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    // Reschedule check if date/time changing
    if (appointmentDate || startTime) {
      const newDate = appointmentDate || appointment.appointmentDate;
      const newStart = startTime || appointment.startTime;
      const newEnd = endTime || appointment.endTime;

      const conflictResult = await checkDoctorAvailability({
        doctorId: appointment.doctor,
        appointmentDate: newDate,
        startTime: newStart,
        endTime: newEnd,
        excludeAppointmentId: appointment._id
      });

      if (conflictResult.hasConflict) {
        return res.status(409).json({
          success: false,
          message: conflictResult.reason || 'Conflict detected during appointment rescheduling'
        });
      }

      appointment.appointmentDate = newDate;
      appointment.startTime = newStart;
      appointment.endTime = newEnd;
    }

    if (status) appointment.status = status;
    if (cancellationReason) appointment.cancellationReason = cancellationReason;

    await appointment.save();

    const updated = await Appointment.findById(appointment._id)
      .populate({ path: 'patient', populate: { path: 'user', select: 'name email phone' } })
      .populate({ path: 'doctor', populate: { path: 'user', select: 'name' } });

    await logAudit(req, 'UPDATE', 'Appointment', appointment._id, { status, appointmentDate, startTime });

    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAppointments,
  createAppointment,
  updateAppointment
};
