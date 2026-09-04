import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import {
  listLanguages,
  runCode,
  listHistory,
  listSnippets,
  getSnippet,
  createSnippet,
  updateSnippet,
  deleteSnippet,
} from '../controllers/playground.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import env from '../config/env.js';
import {
  runCodeValidator,
  snippetBodyValidator,
  updateSnippetValidator,
  snippetIdValidator,
  paginationValidator,
} from '../validators/playground.validator.js';

const router = Router();

const noop = (_req, _res, next) => next();

const runLimiter =
  process.env.NODE_ENV === 'test'
    ? noop
    : rateLimit({
        windowMs: 60 * 1000,
        max: env.rateLimit.codeExecPerMin,
        standardHeaders: true,
        legacyHeaders: false,
        message: {
          success: false,
          error: { message: 'Too many code executions. Try again in 1 minute.' },
        },
      });

router.use(authenticate);

router.get('/languages', listLanguages);
router.post('/run', runLimiter, runCodeValidator, validate, runCode);
router.get('/history', paginationValidator, validate, listHistory);
router.get('/snippets', paginationValidator, validate, listSnippets);
router.post('/snippets', snippetBodyValidator, validate, createSnippet);
router.get('/snippets/:id', snippetIdValidator, validate, getSnippet);
router.patch('/snippets/:id', updateSnippetValidator, validate, updateSnippet);
router.delete('/snippets/:id', snippetIdValidator, validate, deleteSnippet);

export default router;
