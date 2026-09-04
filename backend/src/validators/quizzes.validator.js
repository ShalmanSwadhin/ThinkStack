import { body, param, query } from 'express-validator';

export const quizIdValidator = [param('id').isMongoId().withMessage('Valid quiz ID required')];

export const attemptIdValidator = [
  ...quizIdValidator,
  param('attemptId').isMongoId().withMessage('Valid attempt ID required'),
];

export const listQuizzesValidator = [
  query('page').optional().isInt({ min: 1 }).withMessage('page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit must be between 1 and 100'),
  query('topic').optional().trim().isLength({ min: 1, max: 100 }).withMessage('Invalid topic filter'),
  query('search').optional().trim().isLength({ min: 1, max: 100 }).withMessage('Invalid search query'),
];

export const submitAttemptValidator = [
  ...quizIdValidator,
  body('answers')
    .isArray({ min: 1 })
    .withMessage('Answers array is required')
    .custom((answers) => answers.every((value) => Number.isInteger(value) && value >= 0))
    .withMessage('Each answer must be a non-negative integer index'),
  body('timeTakenSeconds')
    .optional()
    .isInt({ min: 0 })
    .withMessage('timeTakenSeconds must be a non-negative integer'),
];

export default { quizIdValidator, listQuizzesValidator, submitAttemptValidator };
