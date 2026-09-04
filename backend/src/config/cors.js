import env from './env.js';

export const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = [env.frontendUrl, 'http://localhost:5173', 'http://127.0.0.1:5173'];

    if (!origin || allowedOrigins.includes(origin) || !env.isProduction) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

export default corsOptions;
