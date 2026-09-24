const mongoose = require('mongoose');
const config = require('./env');
const logger = require('../utils/logger');

const syncUserIndexes = async () => {
  try {
    const User = require('../models/User');
    await User.syncIndexes();
    logger.info('User collection indexes synchronized successfully');
  } catch (err) {
    logger.warn(`User index sync notice: ${err.message}`);
  }
};

const connectDB = async () => {
  if (mongoose.connection && mongoose.connection.readyState >= 1) {
    return mongoose.connection;
  }
  try {
    const conn = await mongoose.connect(config.mongoUri, {
      serverSelectionTimeoutMS: 5000
    });
    logger.info(`MongoDB Connected: ${conn.connection.host}`);
    await syncUserIndexes();
    return conn;
  } catch (error) {
    logger.warn(`Primary MongoDB Connection failed (${error.message}). Attempting in-memory fallback for development/testing...`);
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongoServer = await MongoMemoryServer.create();
      const mongoUri = mongoServer.getUri();
      const conn = await mongoose.connect(mongoUri);
      logger.info(`MongoDB In-Memory Server Connected successfully: ${conn.connection.host}`);
      await syncUserIndexes();
      return conn;
    } catch (memErr) {
      logger.error(`MongoDB In-Memory Fallback failed: ${memErr.message}`);
      process.exit(1);
    }
  }
};

module.exports = connectDB;
