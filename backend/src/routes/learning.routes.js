import { Router } from 'express';
import { listTopics, getTopic, updateTopicProgress } from '../controllers/learning.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { slugParamValidator, updateProgressValidator } from '../validators/learning.validator.js';

const router = Router();

router.use(authenticate);

router.get('/', listTopics);
router.get('/:slug', slugParamValidator, validate, getTopic);
router.patch('/:slug/progress', updateProgressValidator, validate, updateTopicProgress);

export default router;
