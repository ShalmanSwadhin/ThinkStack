import { Router } from 'express';
import { getGamificationProfile } from '../controllers/gamification.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/', authenticate, getGamificationProfile);

export default router;
