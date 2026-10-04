import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import {
  register,
  login,
  createGuest,
  resumeGuest,
  upgradeGuest,
  refresh,
  logout,
  logoutAll,
  getMe,
  forgotPassword,
  resetPassword,
} from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import {
  registerValidator,
  guestResumeValidator,
  loginValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
} from '../validators/auth.validator.js';

const router = Router();

const noop = (_req, _res, next) => next();

const authLimiter =
  process.env.NODE_ENV === 'test'
    ? noop
    : rateLimit({
        windowMs: 60 * 1000,
        max: 5,
        standardHeaders: true,
        legacyHeaders: false,
        message: {
          success: false,
          error: { message: 'Too many auth attempts. Try again in 1 minute.' },
        },
      });

const guestLimiter =
  process.env.NODE_ENV === 'test'
    ? noop
    : rateLimit({
        windowMs: 60 * 60 * 1000,
        max: 30,
        standardHeaders: true,
        legacyHeaders: false,
        message: {
          success: false,
          error: { message: 'Too many guest sessions started. Try again later.' },
        },
      });

const guestResumeLimiter =
  process.env.NODE_ENV === 'test'
    ? noop
    : rateLimit({
        windowMs: 60 * 1000,
        max: 60,
        standardHeaders: true,
        legacyHeaders: false,
        message: { success: false, error: { message: 'Too many requests. Try again shortly.' } },
      });

router.post('/guest', guestLimiter, createGuest);
router.post('/guest/resume', guestResumeLimiter, guestResumeValidator, validate, resumeGuest);
router.post('/guest/upgrade', authenticate, authLimiter, registerValidator, validate, upgradeGuest);
router.post('/register', authLimiter, registerValidator, validate, register);
router.post('/login', authLimiter, loginValidator, validate, login);
router.post('/refresh', refresh);
router.post('/logout', logout);
router.post('/forgot-password', authLimiter, forgotPasswordValidator, validate, forgotPassword);
router.post('/reset-password', authLimiter, resetPasswordValidator, validate, resetPassword);

router.get('/me', authenticate, getMe);
router.post('/logout-all', authenticate, logoutAll);

export default router;
