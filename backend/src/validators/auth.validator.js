import { body } from 'express-validator';

const emailNormalizer = body('email')
  .trim()
  .isEmail()
  .withMessage('Valid email required')
  .normalizeEmail({ gmail_remove_dots: false, gmail_remove_subaddress: false });

export const registerValidator = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be 3-30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  emailNormalizer,
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/[a-z]/)
    .withMessage('Password must contain a lowercase letter')
    .matches(/[A-Z]/)
    .withMessage('Password must contain an uppercase letter')
    .matches(/[0-9]/)
    .withMessage('Password must contain a number'),
];

export const guestResumeValidator = [
  body('guestKey').isString().isHexadecimal().isLength({ min: 64, max: 64 }).withMessage('Invalid guest key'),
];

export const loginValidator = [
  emailNormalizer,
  body('password').notEmpty().withMessage('Password is required'),
];

export const forgotPasswordValidator = [emailNormalizer];

export const resetPasswordValidator = [
  emailNormalizer,
  body('token').notEmpty().withMessage('Reset token is required'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/[a-z]/)
    .withMessage('Password must contain a lowercase letter')
    .matches(/[A-Z]/)
    .withMessage('Password must contain an uppercase letter')
    .matches(/[0-9]/)
    .withMessage('Password must contain a number'),
];
