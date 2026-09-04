import { body, param, query } from 'express-validator';
import { TOPIC_CATEGORIES, DIFFICULTY, ROLES } from 'shared/constants';

export const idParamValidator = [param('id').isMongoId().withMessage('Valid id required')];

export const bulkUpdateValidator = [
  body('ids').isArray({ min: 1 }),
  body('ids.*').isMongoId(),
  body('status').optional().isString(),
  body('visibility').optional().isString(),
  body('isActive').optional().isBoolean(),
];

export const exportTypeValidator = [
  param('type').isIn(['users', 'submissions']).withMessage('Invalid export type'),
];

export const listUsersValidator = [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('role').optional().isIn([ROLES.STUDENT, ROLES.ADMIN]),
  query('status').optional().isIn(['active', 'suspended']),
  query('search').optional().isString(),
];

export const updateUserValidator = [
  ...idParamValidator,
  body('role').optional().isIn([ROLES.STUDENT, ROLES.ADMIN]),
  body('isSuspended').optional().isBoolean(),
  body('isActive').optional().isBoolean(),
];

export const createTopicValidator = [
  body('slug')
    .trim()
    .matches(/^[a-z0-9-]+$/)
    .withMessage('Slug must be lowercase letters, numbers, and hyphens'),
  body('title').trim().isLength({ min: 3, max: 120 }),
  body('category').isIn(Object.values(TOPIC_CATEGORIES)),
  body('difficulty')
    .optional()
    .isIn([DIFFICULTY.BEGINNER, DIFFICULTY.INTERMEDIATE, DIFFICULTY.ADVANCED]),
  body('order').optional().isInt({ min: 0 }),
  body('status').optional().isIn(['draft', 'published']),
  body('xpReward').optional().isInt({ min: 0 }),
];

export const updateTopicValidator = [
  ...idParamValidator,
  body('title').optional().trim().isLength({ min: 3, max: 120 }),
  body('category').optional().isIn(Object.values(TOPIC_CATEGORIES)),
  body('difficulty')
    .optional()
    .isIn([DIFFICULTY.BEGINNER, DIFFICULTY.INTERMEDIATE, DIFFICULTY.ADVANCED]),
  body('order').optional().isInt({ min: 0 }),
  body('status').optional().isIn(['draft', 'published', 'archived']),
  body('visibility').optional().isIn(['public', 'private', 'unlisted']),
  body('xpReward').optional().isInt({ min: 0 }),
  body('estimatedMinutes').optional().isInt({ min: 1 }),
  body('description').optional().isString(),
  body('thumbnail').optional().isString(),
  body('banner').optional().isString(),
  body('tags').optional().isArray(),
  body('content').optional().isObject(),
  body('animationConfig').optional().isObject(),
  body('relatedProblemIds').optional().isArray(),
  body('prerequisiteIds').optional().isArray(),
  body('relatedTopicIds').optional().isArray(),
  body('suggestedTopicIds').optional().isArray(),
  body('navigation').optional().isObject(),
  body('slug').optional().trim().matches(/^[a-z0-9-]+$/),
];

export const createProblemValidator = [
  body('slug')
    .trim()
    .matches(/^[a-z0-9-]+$/)
    .withMessage('Slug must be lowercase letters, numbers, and hyphens'),
  body('title').trim().isLength({ min: 3, max: 120 }),
  body('description').trim().isLength({ min: 10 }),
  body('difficulty').optional().isIn([DIFFICULTY.EASY, DIFFICULTY.MEDIUM, DIFFICULTY.HARD]),
  body('status').optional().isIn(['draft', 'published']),
  body('topicSlugs').optional().isArray(),
  body('testCases').isArray({ min: 1 }),
  body('testCases.*.input').isString(),
  body('testCases.*.expectedOutput').isString(),
];

export const updateProblemValidator = [
  ...idParamValidator,
  body('title').optional().trim().isLength({ min: 3, max: 120 }),
  body('description').optional().trim().isLength({ min: 10 }),
  body('difficulty').optional().isIn([DIFFICULTY.EASY, DIFFICULTY.MEDIUM, DIFFICULTY.HARD]),
  body('status').optional().isIn(['draft', 'published', 'archived']),
  body('topicSlugs').optional().isArray(),
  body('testCases').optional().isArray({ min: 1 }),
  body('hints').optional().isArray(),
  body('companies').optional().isArray(),
  body('editorial').optional().isString(),
  body('starterCode').optional().isObject(),
  body('boilerplateCode').optional().isObject(),
  body('referenceSolution').optional().isObject(),
  body('timeLimitMs').optional().isInt({ min: 100 }),
  body('memoryLimitKb').optional().isInt({ min: 1024 }),
  body('supportedLanguages').optional().isArray(),
  body('slug').optional().trim().matches(/^[a-z0-9-]+$/),
];

export const updateQuizValidator = [
  ...idParamValidator,
  body('title').optional().trim().isLength({ min: 3, max: 120 }),
  body('status').optional().isIn(['draft', 'published', 'archived']),
  body('visibility').optional().isIn(['public', 'private', 'unlisted']),
  body('passingScore').optional().isInt({ min: 0, max: 100 }),
  body('timeLimitMinutes').optional().isInt({ min: 1 }),
  body('xpReward').optional().isInt({ min: 0 }),
  body('questions').optional().isArray({ min: 1 }),
  body('category').optional().isString(),
  body('shuffleQuestions').optional().isBoolean(),
  body('shuffleOptions').optional().isBoolean(),
  body('negativeMarking').optional().isObject(),
];

export const createQuizValidator = [
  body('topicSlug').trim().notEmpty(),
  body('title').trim().isLength({ min: 3, max: 120 }),
  body('status').optional().isIn(['draft', 'published']),
  body('passingScore').optional().isInt({ min: 0, max: 100 }),
  body('timeLimitMinutes').optional().isInt({ min: 1 }),
  body('xpReward').optional().isInt({ min: 0, max: 500 }),
  body('questions').optional().isArray(),
];

export const createContestValidator = [
  body('title').trim().isLength({ min: 3, max: 120 }),
  body('slug')
    .trim()
    .matches(/^[a-z0-9-]+$/)
    .withMessage('Slug must be lowercase letters, numbers, and hyphens'),
  body('description').optional().isString(),
  body('rules').optional().isString(),
  body('difficulty').optional().isIn(['easy', 'medium', 'hard']),
  body('visibility').optional().isIn(['public', 'private']),
  body('timeLimitMinutes').optional().isInt({ min: 1 }),
  body('leaderboardSettings').optional().isObject(),
  body('startTime').isISO8601(),
  body('endTime').isISO8601(),
  body('problemSlugs').isArray({ min: 1 }),
];

export const updateContestValidator = [
  ...idParamValidator,
  body('title').optional().trim().isLength({ min: 3, max: 120 }),
  body('description').optional().isString(),
  body('rules').optional().isString(),
  body('difficulty').optional().isIn(['easy', 'medium', 'hard']),
  body('visibility').optional().isIn(['public', 'private']),
  body('timeLimitMinutes').optional().isInt({ min: 1 }),
  body('leaderboardSettings').optional().isObject(),
  body('startTime').optional().isISO8601(),
  body('endTime').optional().isISO8601(),
  body('status').optional().isIn(['scheduled', 'active', 'completed', 'cancelled', 'archived']),
  body('problemSlugs').optional().isArray({ min: 1 }),
  body('problemIds').optional().isArray(),
  body('thumbnail').optional().isString(),
  body('banner').optional().isString(),
  body('durationMinutes').optional().isInt({ min: 1 }),
  body('scoring').optional().isObject(),
  body('slug').optional().trim().matches(/^[a-z0-9-]+$/),
];

export const createAnnouncementValidator = [
  body('title').trim().isLength({ min: 3, max: 160 }),
  body('content').trim().isLength({ min: 5 }),
  body('priority').optional().isIn(['low', 'normal', 'high']),
  body('isActive').optional().isBoolean(),
  body('startsAt').optional().isISO8601(),
  body('expiresAt').optional().isISO8601(),
];

export const updateAnnouncementValidator = [
  ...idParamValidator,
  body('title').optional().trim().isLength({ min: 3, max: 160 }),
  body('content').optional().trim().isLength({ min: 5 }),
  body('priority').optional().isIn(['low', 'normal', 'high']),
  body('isActive').optional().isBoolean(),
  body('startsAt').optional().isISO8601(),
  body('expiresAt').optional().isISO8601(),
];

export const createBadgeValidator = [
  body('slug').trim().matches(/^[a-z0-9-]+$/),
  body('name').trim().isLength({ min: 2, max: 80 }),
  body('description').trim().isLength({ min: 5 }),
  body('icon').optional().isString(),
  body('category').optional().isString(),
  body('criteria.type').notEmpty(),
  body('criteria.threshold').isInt({ min: 1 }),
  body('xpBonus').optional().isInt({ min: 0 }),
  body('isActive').optional().isBoolean(),
  body('status').optional().isIn(['draft', 'published', 'archived']),
];

export const updateBadgeValidator = [
  ...idParamValidator,
  body('name').optional().trim().isLength({ min: 2, max: 80 }),
  body('description').optional().trim().isLength({ min: 5 }),
  body('icon').optional().isString(),
  body('category').optional().isString(),
  body('criteria').optional().isObject(),
  body('xpBonus').optional().isInt({ min: 0 }),
  body('isActive').optional().isBoolean(),
  body('status').optional().isIn(['draft', 'published', 'archived']),
];

export const createVisualizerValidator = [
  body('algorithmId').trim().matches(/^[a-z0-9-]+$/),
  body('name').trim().isLength({ min: 2, max: 120 }),
  body('category').trim().notEmpty(),
  body('description').optional().isString(),
  body('difficulty').optional().isIn(['beginner', 'intermediate', 'advanced']),
  body('codeExamples').optional().isArray(),
  body('visibility').optional().isIn(['public', 'private', 'unlisted']),
  body('status').optional().isIn(['draft', 'published', 'archived']),
];

export const updateVisualizerValidator = [
  ...idParamValidator,
  body('name').optional().trim().isLength({ min: 2, max: 120 }),
  body('description').optional().isString(),
  body('category').optional().isString(),
  body('difficulty').optional().isIn(['beginner', 'intermediate', 'advanced']),
  body('codeExamples').optional().isArray(),
  body('visibility').optional().isIn(['public', 'private', 'unlisted']),
  body('status').optional().isIn(['draft', 'published', 'archived']),
];

export const createCertificateValidator = [
  body('slug').trim().matches(/^[a-z0-9-]+$/),
  body('name').trim().isLength({ min: 2, max: 120 }),
  body('description').optional().isString(),
  body('criteria.type').notEmpty(),
  body('xpBonus').optional().isInt({ min: 0 }),
  body('isActive').optional().isBoolean(),
  body('status').optional().isIn(['draft', 'published', 'archived']),
];

export const updateCertificateValidator = [
  ...idParamValidator,
  body('name').optional().trim().isLength({ min: 2, max: 120 }),
  body('description').optional().isString(),
  body('template').optional().isObject(),
  body('criteria').optional().isObject(),
  body('xpBonus').optional().isInt({ min: 0 }),
  body('isActive').optional().isBoolean(),
  body('status').optional().isIn(['draft', 'published', 'archived']),
];

export const updatePlatformSettingsValidator = [
  body('xpRules').optional().isObject(),
  body('coinRules').optional().isObject(),
  body('ranks').optional().isArray(),
  body('levels').optional().isArray(),
  body('leaderboardSettings').optional().isObject(),
  body('notificationDefaults').optional().isObject(),
];

export const createDailyChallengeValidator = [
  body('date').isISO8601(),
  body('type').isIn(['problem', 'quiz', 'topic', 'streak']),
  body('target').notEmpty(),
  body('xpReward').optional().isInt({ min: 0 }),
  body('description').optional().isString(),
  body('isActive').optional().isBoolean(),
];

export const updateDailyChallengeValidator = [
  ...idParamValidator,
  body('type').optional().isIn(['problem', 'quiz', 'topic', 'streak']),
  body('target').optional(),
  body('xpReward').optional().isInt({ min: 0 }),
  body('description').optional().isString(),
  body('isActive').optional().isBoolean(),
];

export default {
  idParamValidator,
  exportTypeValidator,
  listUsersValidator,
  updateUserValidator,
  createTopicValidator,
  updateTopicValidator,
  createProblemValidator,
  updateProblemValidator,
  updateQuizValidator,
  createQuizValidator,
  createContestValidator,
  updateContestValidator,
  createAnnouncementValidator,
  updateAnnouncementValidator,
};
