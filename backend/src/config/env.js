const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const config = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  mongoUri: process.env.MONGODB_URI || 'mongodb+srv://dharanirampongu:dharani1234@cluster0.tzr7n70.mongodb.net/clinovexa?appName=Cluster0',
  jwtSecret: process.env.JWT_SECRET || 'clinovexa_super_secret_jwt_key_2026',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  aiSimulation: process.env.AI_SERVICE_SIMULATION !== 'false'
};

module.exports = config;
