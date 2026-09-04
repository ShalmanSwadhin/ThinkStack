import { Router } from 'express';
import { getProgress } from '../controllers/progress.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/', authenticate, getProgress);

export default router;
