import { Router } from 'express';
import { getIntegrationStatusHandler } from '../controllers/integrations.controller.js';

const router = Router();

router.get('/status', getIntegrationStatusHandler);

export default router;
