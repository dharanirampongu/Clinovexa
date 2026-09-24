const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const config = require('./src/config/env');
const connectDB = require('./src/config/db');
const logger = require('./src/utils/logger');

// Route imports
const authRoutes = require('./src/routes/authRoutes');
const adminRoutes = require('./src/routes/adminRoutes');
const userRoutes = require('./src/routes/userRoutes');
const appointmentRoutes = require('./src/routes/appointmentRoutes');
const clinicalRoutes = require('./src/routes/clinicalRoutes');
const labRoutes = require('./src/routes/labRoutes');
const billingRoutes = require('./src/routes/billingRoutes');
const aiRoutes = require('./src/routes/aiRoutes');
const notificationRoutes = require('./src/routes/notificationRoutes');

// Middleware imports
const errorHandler = require('./src/middleware/errorHandler');

const app = express();

// Enable CORS & Body Parsing
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.options('*', cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ensure DB connection for serverless/hosted environments
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    logger.error(`Database connection error on ${req.path}: ${err.message}`);
    next(err);
  }
});

if (config.nodeEnv === 'development') {
  app.use(morgan('dev'));
}

// Health Check API
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    service: 'Clinovexa API Backend',
    environment: config.nodeEnv
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/users', userRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/clinical', clinicalRoutes);
app.use('/api/lab', labRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/notifications', notificationRoutes);

// JSON 404 for unknown /api/* paths (so production clients get JSON, not HTML).
// This must sit after the API routes but before the generic error handler.
app.use('/api', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API route not found: ${req.method} ${req.originalUrl}`
  });
});

// Error Handler Middleware
app.use(errorHandler);

// Start Server if executed directly
if (require.main === module) {
  connectDB().then(() => {
    const PORT = config.port;
    app.listen(PORT, '0.0.0.0', () => {
      logger.info(`Clinovexa API Server running on port ${PORT} [${config.nodeEnv}]`);
    });
  });
}

module.exports = app;
