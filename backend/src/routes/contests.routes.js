import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import {
  listContests,
  getContest,
  registerForContest,
  getContestLeaderboard,
  getContestProblem,
  runContestSample,
  submitContestSolution,
  createContest,
} from '../controllers/contests.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { ROLES } from 'shared/constants';
import env from '../config/env.js';
import {
  slugParamValidator,
  problemSlugParamValidator,
  listContestsValidator,
  codeSubmissionValidator,
  runSampleValidator,
  createContestValidator,
} from '../validators/contests.validator.js';

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

router.get('/', listContestsValidator, validate, listContests);
router.post('/', authorize(ROLES.ADMIN), createContestValidator, validate, createContest);
router.get('/:slug', slugParamValidator, validate, getContest);
router.post('/:slug/register', slugParamValidator, validate, registerForContest);
router.get('/:slug/leaderboard', slugParamValidator, validate, getContestLeaderboard);
router.get(
  '/:slug/problems/:problemSlug',
  slugParamValidator,
  problemSlugParamValidator,
  validate,
  getContestProblem
);
router.post(
  '/:slug/problems/:problemSlug/run',
  execLimiter,
  slugParamValidator,
  problemSlugParamValidator,
  runSampleValidator,
  validate,
  runContestSample
);
router.post(
  '/:slug/problems/:problemSlug/submit',
  execLimiter,
  slugParamValidator,
  problemSlugParamValidator,
  codeSubmissionValidator,
  validate,
  submitContestSolution
);

export default router;
