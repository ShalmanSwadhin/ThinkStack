import { body, param, query } from 'express-validator';

export const listNotesValidator = [
  query('page').optional().isInt({ min: 1 }).withMessage('page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit must be between 1 and 100'),
  query('search').optional().isString().isLength({ max: 200 }).withMessage('search too long'),
  query('topicId').optional().isMongoId().withMessage('Invalid topic ID'),
  query('problemId').optional().isMongoId().withMessage('Invalid problem ID'),
  query('topicSlug').optional().trim().isLength({ max: 100 }).withMessage('Invalid topic slug'),
  query('problemSlug').optional().trim().isLength({ max: 100 }).withMessage('Invalid problem slug'),
  query('tag').optional().trim().isLength({ max: 50 }).withMessage('Invalid tag'),
];

export const noteBodyValidator = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 200 })
    .withMessage('Title must be at most 200 characters'),
  body('content').optional().isString().isLength({ max: 50000 }).withMessage('Content too long'),
  body('tags').optional().isArray({ max: 20 }).withMessage('Tags must be an array'),
  body('tags.*').optional().trim().isLength({ min: 1, max: 50 }).withMessage('Invalid tag'),
  body('topicId').optional().isMongoId().withMessage('Invalid topic ID'),
  body('problemId').optional().isMongoId().withMessage('Invalid problem ID'),
  body('topicSlug').optional().trim().isLength({ max: 100 }).withMessage('Invalid topic slug'),
  body('problemSlug').optional().trim().isLength({ max: 100 }).withMessage('Invalid problem slug'),
];

export const updateNoteValidator = [
  param('id').isMongoId().withMessage('Valid note ID required'),
  body('title').optional().trim().isLength({ min: 1, max: 200 }).withMessage('Invalid title'),
  body('content').optional().isString().isLength({ max: 50000 }).withMessage('Content too long'),
  body('tags').optional().isArray({ max: 20 }).withMessage('Tags must be an array'),
  body('tags.*').optional().trim().isLength({ min: 1, max: 50 }).withMessage('Invalid tag'),
  body('topicId').optional().isMongoId().withMessage('Invalid topic ID'),
  body('problemId').optional().isMongoId().withMessage('Invalid problem ID'),
  body('topicSlug').optional().trim().isLength({ max: 100 }).withMessage('Invalid topic slug'),
  body('problemSlug').optional().trim().isLength({ max: 100 }).withMessage('Invalid problem slug'),
  body('unlinkTopic').optional().isBoolean().withMessage('unlinkTopic must be boolean'),
  body('unlinkProblem').optional().isBoolean().withMessage('unlinkProblem must be boolean'),
];

export const noteIdValidator = [param('id').isMongoId().withMessage('Valid note ID required')];

export default {
  listNotesValidator,
  noteBodyValidator,
  updateNoteValidator,
  noteIdValidator,
};
