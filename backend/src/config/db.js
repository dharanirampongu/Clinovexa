const mongoose = require('mongoose');
const config = require('./env');
const logger = require('../utils/logger');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(config.mongoUri, {
      serverSelectionTimeoutMS: 5000
    });
    logger.info(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    logger.warn(`Primary MongoDB Connection failed (${error.message}). Attempting in-memory fallback for development/testing...`);
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongoServer = await MongoMemoryServer.create();
      const mongoUri = mongoServer.getUri();
      const conn = await mongoose.connect(mongoUri);
      logger.info(`MongoDB In-Memory Server Connected successfully: ${conn.connection.host}`);
      return conn;
    } catch (memErr) {
      logger.error(`MongoDB In-Memory Fallback failed: ${memErr.message}`);
      process.exit(1);
    }
  }
};

module.exports = connectDB;
