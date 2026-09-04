import { body } from 'express-validator';

export const updatePreferencesValidator = [
  body('theme').optional().isIn(['light', 'dark', 'system']).withMessage('Invalid theme'),
  body('editorFontSize')
    .optional()
    .isInt({ min: 10, max: 24 })
    .withMessage('Editor font size must be between 10 and 24'),
  body('editorTabSize')
    .optional()
    .isInt({ min: 2, max: 8 })
    .withMessage('Editor tab size must be between 2 and 8'),
  body('emailNotifications')
    .optional()
    .isBoolean()
    .withMessage('emailNotifications must be a boolean'),
];

export const updateProfileValidator = [
  body('displayName')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Display name must be at most 100 characters'),
  body('bio').optional().isString().isLength({ max: 500 }).withMessage('Bio must be at most 500 characters'),
  body('github').optional().trim().isLength({ max: 200 }).withMessage('GitHub URL is too long'),
  body('linkedin').optional().trim().isLength({ max: 200 }).withMessage('LinkedIn URL is too long'),
];

export const changePasswordValidator = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters')
    .matches(/[a-z]/)
    .withMessage('New password must contain a lowercase letter')
    .matches(/[A-Z]/)
    .withMessage('New password must contain an uppercase letter')
    .matches(/[0-9]/)
    .withMessage('New password must contain a number'),
];

export const deleteAccountValidator = [
  body('password').notEmpty().withMessage('Password is required'),
  body('confirmation')
    .equals('DELETE')
    .withMessage('Confirmation must be DELETE'),
];

export default {
  updatePreferencesValidator,
  updateProfileValidator,
  changePasswordValidator,
  deleteAccountValidator,
};
