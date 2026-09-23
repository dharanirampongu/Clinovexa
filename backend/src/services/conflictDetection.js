const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const { APPOINTMENT_STATUS } = require('../utils/constants');

/**
 * Checks whether a doctor is available for a given date and start/end time slot.
 * Returns { hasConflict: boolean, reason?: string }
 */
const checkDoctorAvailability = async ({ doctorId, appointmentDate, startTime, endTime, excludeAppointmentId = null }) => {
  const doctor = await Doctor.findById(doctorId).populate('user', 'name');
  if (!doctor) {
    return { hasConflict: true, reason: 'Doctor record not found' };
  }

  const targetDate = new Date(appointmentDate);
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayName = daysOfWeek[targetDate.getUTCDay()];

  // 1. Check if doctor works on target day
  if (doctor.workingDays && doctor.workingDays.length > 0) {
    if (!doctor.workingDays.includes(dayName)) {
      return {
        hasConflict: true,
        reason: `Dr. ${doctor.user ? doctor.user.name : ''} does not work on ${dayName}s`
      };
    }
  }

  // 2. Normalize date bounds for query (start of day to end of day in UTC)
  const startOfDay = new Date(targetDate);
  startOfDay.setUTCHours(0, 0, 0, 0);

  const endOfDay = new Date(targetDate);
  endOfDay.setUTCHours(23, 59, 59, 999);

  // 3. Find active existing appointments for this doctor on this day
  const query = {
    doctor: doctorId,
    appointmentDate: { $gte: startOfDay, $lte: endOfDay },
    status: { $in: [APPOINTMENT_STATUS.SCHEDULED, APPOINTMENT_STATUS.CHECKED_IN, APPOINTMENT_STATUS.IN_PROGRESS] }
  };

  if (excludeAppointmentId) {
    query._id = { $ne: excludeAppointmentId };
  }

  const existingAppointments = await Appointment.find(query);

  // Helper to convert "HH:mm" to total minutes from midnight
  const timeToMinutes = (tStr) => {
    const [h, m] = tStr.split(':').map(Number);
    return h * 60 + m;
  };

  const reqStart = timeToMinutes(startTime);
  const reqEnd = timeToMinutes(endTime);

  for (const appt of existingAppointments) {
    const apptStart = timeToMinutes(appt.startTime);
    const apptEnd = timeToMinutes(appt.endTime);

    // Overlap condition: reqStart < apptEnd AND reqEnd > apptStart
    if (reqStart < apptEnd && reqEnd > apptStart) {
      return {
        hasConflict: true,
        reason: `Doctor has a conflicting appointment from ${appt.startTime} to ${appt.endTime}`
      };
    }
  }

  return { hasConflict: false };
};

module.exports = { checkDoctorAvailability };
