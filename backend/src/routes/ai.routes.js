import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import {
  listConversations,
  getConversation,
  createConversation,
  deleteConversation,
  sendMessage,
} from '../controllers/ai.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import env from '../config/env.js';
import {
  conversationIdValidator,
  listConversationsValidator,
  createConversationValidator,
  sendMessageValidator,
} from '../validators/ai.validator.js';

const router = Router();

const noop = (_req, _res, next) => next();

const chatLimiter =
  process.env.NODE_ENV === 'test'
    ? noop
    : rateLimit({
        windowMs: 60 * 60 * 1000,
        max: env.rateLimit.aiPerHour,
        standardHeaders: true,
        legacyHeaders: false,
        keyGenerator: (req) => req.user?.id || req.ip,
        message: {
          success: false,
          error: { message: 'AI tutor rate limit reached. Try again in an hour.' },
        },
      });

router.use(authenticate);

router.get('/conversations', listConversationsValidator, validate, listConversations);
router.post('/conversations', createConversationValidator, validate, createConversation);
router.get('/conversations/:id', conversationIdValidator, validate, getConversation);
router.delete('/conversations/:id', conversationIdValidator, validate, deleteConversation);
router.post('/chat', chatLimiter, sendMessageValidator, validate, sendMessage);

export default router;
