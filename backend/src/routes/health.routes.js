import { Router } from 'express';
import { sendSuccess } from '../utils/apiResponse.js';
import env from '../config/env.js';

const router = Router();

router.get('/', (_req, res) => {
  sendSuccess(res, {
    status: 'ok',
    service: 'ThinkStack API',
    version: '1.0.0',
    environment: env.nodeEnv,
    timestamp: new Date().toISOString(),
  });
});

export default router;
