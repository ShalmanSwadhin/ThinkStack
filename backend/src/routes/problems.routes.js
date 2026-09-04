import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import {
  listProblems,
  getProblem,
  runSample,
  submitSolution,
  listSubmissions,
} from '../controllers/problems.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import env from '../config/env.js';
import {
  slugParamValidator,
  listProblemsValidator,
  codeSubmissionValidator,
  runSampleValidator,
} from '../validators/problems.validator.js';

const router = Router();

const noop = (_req, _res, next) => next();

const execLimiter =
  process.env.NODE_ENV === 'test'
    ? noop
    : rateLimit({
        windowMs: 60 * 1000,
        max: env.rateLimit.codeExecPerMin,
        standardHeaders: true,
        legacyHeaders: false,
        message: {
          success: false,
          error: { message: 'Too many submissions. Try again in 1 minute.' },
        },
      });

router.use(authenticate);

router.get('/', listProblemsValidator, validate, listProblems);
router.get('/:slug', slugParamValidator, validate, getProblem);
router.get('/:slug/submissions', slugParamValidator, validate, listSubmissions);
router.post('/:slug/run', execLimiter, runSampleValidator, validate, runSample);
router.post('/:slug/submit', execLimiter, codeSubmissionValidator, validate, submitSolution);

export default router;
