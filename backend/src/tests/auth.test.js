const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../../server');
const User = require('../models/User');

jest.setTimeout(30000);

let mongoServer;

beforeAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
}, 30000);

afterAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  if (mongoServer) {
    await mongoServer.stop();
  }
});

beforeEach(async () => {
  await User.deleteMany({});
});

describe('Auth API Endpoints', () => {
  it('should register a new patient user successfully', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test Patient',
        email: 'testpatient@example.com',
        password: 'Password123!',
        phone: '+15551234'
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toEqual('testpatient@example.com');
  });

  it('should reject registration with duplicate email', async () => {
    await User.create({
      name: 'Existing User',
      email: 'duplicate@example.com',
      password: 'Password123!',
      role: 'PATIENT',
      phone: '+15551111111'
    });

    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Another User',
        email: 'duplicate@example.com',
        password: 'Password123!',
        phone: '+15552222222'
      });

    expect(res.statusCode).toEqual(400);
    expect(res.body.success).toBe(false);
  });

  it('should login an existing user and return JWT token', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Login User',
        email: 'login@example.com',
        password: 'Password123!',
        phone: '+15553333333'
      });

    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'login@example.com',
        password: 'Password123!'
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
  });

  it('should reject login with wrong password', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Login User',
        email: 'login@example.com',
        password: 'Password123!',
        phone: '+15551234567'
      });

    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'login@example.com',
        password: 'WrongPassword'
      });

    expect(res.statusCode).toEqual(401);
    expect(res.body.success).toBe(false);
  });

  it('should reject registration with duplicate mobile number returning 409 Conflict', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({
        name: 'User One',
        email: 'userone@example.com',
        password: 'Password123!',
        phone: '+91 98765 43210'
      });

    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'User Two',
        email: 'usertwo@example.com',
        password: 'Password123!',
        phone: '919876543210'
      });

    expect(res.statusCode).toEqual(409);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toEqual('This mobile number is already registered.');
  });

  it('should reject registration with invalid phone number', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'User Three',
        email: 'userthree@example.com',
        password: 'Password123!',
        phone: '123'
      });

    expect(res.statusCode).toEqual(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('valid mobile number');
  });
});
