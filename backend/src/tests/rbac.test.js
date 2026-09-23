const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../../server');
const User = require('../models/User');
const StaffRecord = require('../models/StaffRecord');
const { ROLES } = require('../utils/constants');

jest.setTimeout(30000);

let mongoServer;
let patientToken;
let doctorToken;
let adminToken;

beforeAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);

  await StaffRecord.create([
    {
      staffId: 'ADMIN-RBAC-01',
      name: 'Admin User',
      email: 'admin.test@example.com',
      role: ROLES.ADMIN
    },
    {
      staffId: 'DOC-RBAC-01',
      name: 'Doctor User',
      email: 'doc.test@example.com',
      role: ROLES.DOCTOR
    }
  ]);

  // Setup Admin
  const adminRes = await request(app).post('/api/auth/register').send({
    name: 'Admin User',
    email: 'admin.test@example.com',
    password: 'Password123!',
    role: ROLES.ADMIN,
    staffId: 'ADMIN-RBAC-01'
  });
  adminToken = adminRes.body.token;

  // Setup Doctor
  const docRes = await request(app).post('/api/auth/register').send({
    name: 'Doctor User',
    email: 'doc.test@example.com',
    password: 'Password123!',
    role: ROLES.DOCTOR,
    staffId: 'DOC-RBAC-01'
  });
  doctorToken = docRes.body.token;

  // Setup Patient
  const patRes = await request(app).post('/api/auth/register').send({
    name: 'Patient User',
    email: 'pat.test@example.com',
    password: 'Password123!',
    role: ROLES.PATIENT
  });
  patientToken = patRes.body.token;
}, 30000);

afterAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  if (mongoServer) {
    await mongoServer.stop();
  }
});

describe('RBAC Middleware Guards', () => {
  it('should deny Patient access to Admin stats (403 Forbidden)', async () => {
    const res = await request(app)
      .get('/api/admin/stats')
      .set('Authorization', `Bearer ${patientToken}`);

    expect(res.statusCode).toEqual(403);
    expect(res.body.success).toBe(false);
  });

  it('should allow Admin access to Admin stats (200 OK)', async () => {
    const res = await request(app)
      .get('/api/admin/stats')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
  });

  it('should deny Patient permission to create Clinical Notes (403 Forbidden)', async () => {
    const res = await request(app)
      .post('/api/clinical/notes')
      .set('Authorization', `Bearer ${patientToken}`)
      .send({
        patientId: new mongoose.Types.ObjectId(),
        subjective: 'Headache',
        assessment: 'Migraine'
      });

    expect(res.statusCode).toEqual(403);
  });
});
