import { body, param } from 'express-validator';

export const slugParamValidator = [
  param('slug')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Valid topic slug required')
    .matches(/^[a-z0-9-]+$/)
    .withMessage('Invalid topic slug format'),
];

export const updateProgressValidator = [
  ...slugParamValidator,
  body('status')
    .optional()
    .isIn(['in_progress', 'completed'])
    .withMessage('Status must be in_progress or completed'),
  body('addMinutes')
    .optional()
    .isInt({ min: 1, max: 240 })
    .withMessage('addMinutes must be between 1 and 240'),
  body().custom((value) => {
    if (!value.status && !value.addMinutes) {
      throw new Error('Either status or addMinutes is required');
    }
    return true;
  }),
];

export default { slugParamValidator, updateProgressValidator };
