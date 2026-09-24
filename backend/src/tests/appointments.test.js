const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../../server');
const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const StaffRecord = require('../models/StaffRecord');
const { ROLES } = require('../utils/constants');

jest.setTimeout(30000);

let mongoServer;
let adminToken;
let doctorId;
let patientId;

beforeAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);

  await StaffRecord.create({
    staffId: 'ADMIN-TEST-01',
    name: 'Admin Test',
    email: 'admin.appt@example.com',
    role: ROLES.ADMIN
  });

  // Admin user
  const adminRes = await request(app).post('/api/auth/register').send({
    name: 'Admin Test',
    email: 'admin.appt@example.com',
    password: 'Password123!',
    role: ROLES.ADMIN,
    staffId: 'ADMIN-TEST-01',
    phone: '+15559998888'
  });
  adminToken = adminRes.body.token;

  // Create Doctor
  const docUser = await User.create({
    name: 'Dr. Test Cardiology',
    email: 'dr.cardio.test@example.com',
    password: 'Password123!',
    role: ROLES.DOCTOR
  });
  const doc = await Doctor.create({
    user: docUser._id,
    specialization: 'Cardiology',
    department: 'Cardiology',
    licenseNumber: 'LIC-TEST-001',
    consultationFee: 100,
    workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    timeSlots: [{ startTime: '09:00', endTime: '17:00' }]
  });
  doctorId = doc._id;

  // Create Patient
  const patUser = await User.create({
    name: 'Patient Test',
    email: 'patient.appt@example.com',
    password: 'Password123!',
    role: ROLES.PATIENT
  });
  const pat = await Patient.create({
    user: patUser._id,
    dob: new Date('1990-01-01'),
    gender: 'Male'
  });
  patientId = pat._id;
}, 30000);

afterAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  if (mongoServer) {
    await mongoServer.stop();
  }
});

describe('Appointment Booking & Conflict Detection API', () => {
  const targetDate = '2026-10-15';

  it('should book an appointment successfully when slot is open', async () => {
    const res = await request(app)
      .post('/api/appointments')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        patientId,
        doctorId,
        appointmentDate: targetDate,
        startTime: '10:00',
        endTime: '10:30',
        reasonForVisit: 'Routine checkup'
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.startTime).toEqual('10:00');
  });

  it('should detect conflict (409 Conflict) when booking overlapping slot for same doctor', async () => {
    const res = await request(app)
      .post('/api/appointments')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        patientId,
        doctorId,
        appointmentDate: targetDate,
        startTime: '10:15', // Overlaps with 10:00-10:30
        endTime: '10:45',
        reasonForVisit: 'Overlapping request'
      });

    expect(res.statusCode).toEqual(409);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('conflicting appointment');
  });
});
