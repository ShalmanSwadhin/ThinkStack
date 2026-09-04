import { body, param, query } from 'express-validator';
import { DIFFICULTY, LANGUAGES } from 'shared/constants';

const supportedLanguages = Object.values(LANGUAGES).map((lang) => lang.monaco);

export const slugParamValidator = [
  param('slug')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Valid problem slug required')
    .matches(/^[a-z0-9-]+$/)
    .withMessage('Invalid problem slug format'),
];

export const listProblemsValidator = [
  query('page').optional().isInt({ min: 1 }).withMessage('page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit must be between 1 and 100'),
  query('difficulty')
    .optional()
    .isIn([DIFFICULTY.EASY, DIFFICULTY.MEDIUM, DIFFICULTY.HARD])
    .withMessage('Invalid difficulty filter'),
  query('status')
    .optional()
    .isIn(['all', 'solved', 'attempted', 'unsolved'])
    .withMessage('Invalid status filter'),
  query('topic').optional().trim().isLength({ min: 1, max: 100 }).withMessage('Invalid topic filter'),
  query('search').optional().trim().isLength({ max: 100 }).withMessage('Search query too long'),
];

export const codeSubmissionValidator = [
  ...slugParamValidator,
  body('language')
    .trim()
    .notEmpty()
    .withMessage('Language is required')
    .isIn(supportedLanguages)
    .withMessage(`Language must be one of: ${supportedLanguages.join(', ')}`),
  body('sourceCode')
    .isString()
    .withMessage('Source code is required')
    .isLength({ min: 1, max: 65536 })
    .withMessage('Source code must be between 1 and 65536 characters'),
];

export const runSampleValidator = [
  ...codeSubmissionValidator,
  body('stdin').optional().isString().isLength({ max: 65536 }).withMessage('stdin too long'),
];

export default {
  slugParamValidator,
  listProblemsValidator,
  codeSubmissionValidator,
  runSampleValidator,
};
