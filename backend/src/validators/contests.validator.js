import { body, param, query } from 'express-validator';

export const slugParamValidator = [param('slug').trim().notEmpty().withMessage('Contest slug required')];

export const problemSlugParamValidator = [
  param('problemSlug').trim().notEmpty().withMessage('Problem slug required'),
];

export const listContestsValidator = [
  query('status')
    .optional()
    .isIn(['all', 'upcoming', 'active', 'past', 'scheduled', 'completed', 'cancelled'])
    .withMessage('Invalid status filter'),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
];

export const codeSubmissionValidator = [
  body('language').trim().notEmpty().withMessage('Language is required'),
  body('sourceCode').isString().withMessage('Source code is required'),
];

export const runSampleValidator = [
  ...codeSubmissionValidator,
  body('stdin').optional().isString(),
];

export const createContestValidator = [
  body('title').trim().isLength({ min: 3, max: 120 }).withMessage('Title must be 3-120 characters'),
  body('slug')
    .trim()
    .matches(/^[a-z0-9-]+$/)
    .withMessage('Slug must be lowercase letters, numbers, and hyphens'),
  body('description').optional().isString(),
  body('startTime').isISO8601().withMessage('Valid startTime required'),
  body('endTime').isISO8601().withMessage('Valid endTime required'),
  body('problemSlugs').isArray({ min: 1 }).withMessage('At least one problem slug required'),
  body('problemSlugs.*').trim().notEmpty(),
];

export default {
  slugParamValidator,
  problemSlugParamValidator,
  listContestsValidator,
  codeSubmissionValidator,
  runSampleValidator,
  createContestValidator,
};
