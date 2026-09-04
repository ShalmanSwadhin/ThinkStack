import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const requiredInProduction = ['MONGODB_URI', 'JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET'];

const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/thinkstack',
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || 'dev-access-secret-change-me',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret-change-me',
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  judge0: {
    apiUrl: process.env.JUDGE0_API_URL || '',
    apiKey: process.env.JUDGE0_API_KEY || '',
    apiHost: process.env.JUDGE0_API_HOST || 'judge0-ce.p.rapidapi.com',
    mock: process.env.JUDGE0_MOCK === 'true',
  },
  gemini: {
    apiKey: process.env.GEMINI_API_KEY || '',
    model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
    mock: process.env.GEMINI_MOCK === 'true',
  },
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
    apiKey: process.env.CLOUDINARY_API_KEY || '',
    apiSecret: process.env.CLOUDINARY_API_SECRET || '',
  },
  resend: {
    apiKey: process.env.RESEND_API_KEY || '',
    from: process.env.EMAIL_FROM || 'ThinkStack <noreply@thinkstack.dev>',
  },
  rateLimit: {
    aiPerHour: parseInt(process.env.AI_RATE_LIMIT_PER_HOUR || '20', 10),
    codeExecPerMin: parseInt(process.env.CODE_EXEC_RATE_LIMIT_PER_MIN || '10', 10),
  },
  admin: {
    email: process.env.ADMIN_EMAIL || 'admin@thinkstack.dev',
    username: process.env.ADMIN_USERNAME || 'admin',
    password: process.env.ADMIN_PASSWORD || 'ChangeMe123!',
  },
  demo: {
    email: process.env.DEMO_EMAIL || 'student@thinkstack.dev',
    username: process.env.DEMO_USERNAME || 'student',
    password: process.env.DEMO_PASSWORD || 'Student123!',
  },
  bootstrap: {
    onStart: process.env.BOOTSTRAP_ON_START !== 'false',
  },
  isProduction: process.env.NODE_ENV === 'production',
};

if (env.isProduction) {
  for (const key of requiredInProduction) {
    if (!process.env[key]) {
      throw new Error(`Missing required environment variable: ${key}`);
    }
  }
}

export default env;
