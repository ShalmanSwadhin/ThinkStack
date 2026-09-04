import { body, param, query } from 'express-validator';
import { LANGUAGES } from 'shared/constants';

const supportedLanguages = Object.values(LANGUAGES).map((lang) => lang.monaco);

export const runCodeValidator = [
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
  body('stdin').optional().isString().isLength({ max: 65536 }).withMessage('stdin too long'),
];

export const snippetBodyValidator = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 100 })
    .withMessage('Title must be at most 100 characters'),
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
  body('stdin').optional().isString().isLength({ max: 65536 }).withMessage('stdin too long'),
];

export const updateSnippetValidator = [
  param('id').isMongoId().withMessage('Valid snippet ID required'),
  body('title').optional().trim().isLength({ min: 1, max: 100 }).withMessage('Invalid title'),
  body('language')
    .optional()
    .trim()
    .isIn(supportedLanguages)
    .withMessage(`Language must be one of: ${supportedLanguages.join(', ')}`),
  body('sourceCode')
    .optional()
    .isString()
    .isLength({ min: 1, max: 65536 })
    .withMessage('Source code must be between 1 and 65536 characters'),
  body('stdin').optional().isString().isLength({ max: 65536 }).withMessage('stdin too long'),
];

export const snippetIdValidator = [param('id').isMongoId().withMessage('Valid snippet ID required')];

export const paginationValidator = [
  query('page').optional().isInt({ min: 1 }).withMessage('page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit must be between 1 and 100'),
];

export default {
  runCodeValidator,
  snippetBodyValidator,
  updateSnippetValidator,
  snippetIdValidator,
  paginationValidator,
};
