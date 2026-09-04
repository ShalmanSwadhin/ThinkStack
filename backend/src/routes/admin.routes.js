import { Router } from 'express';
import * as adminController from '../controllers/admin.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { ROLES } from 'shared/constants';
import {
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
  idParamValidator,
  bulkUpdateValidator,
  createBadgeValidator,
  updateBadgeValidator,
  createVisualizerValidator,
  updateVisualizerValidator,
  createCertificateValidator,
  updateCertificateValidator,
  updatePlatformSettingsValidator,
  createDailyChallengeValidator,
  updateDailyChallengeValidator,
} from '../validators/admin.validator.js';

const router = Router();

router.use(authenticate, authorize(ROLES.ADMIN));

router.get('/analytics', adminController.getAnalytics);
router.get('/export/:type', exportTypeValidator, validate, adminController.exportReport);

router.get('/users', listUsersValidator, validate, adminController.listUsers);
router.patch('/users/:id', updateUserValidator, validate, adminController.updateUser);

router.get('/topics', adminController.listTopics);
router.get('/topics/:id', idParamValidator, validate, adminController.getTopic);
router.post('/topics', createTopicValidator, validate, adminController.createTopic);
router.patch('/topics/:id', updateTopicValidator, validate, adminController.updateTopic);
router.delete('/topics/:id', idParamValidator, validate, adminController.deleteTopic);
router.post('/topics/:id/duplicate', idParamValidator, validate, adminController.duplicateTopic);
router.patch('/topics/bulk', bulkUpdateValidator, validate, adminController.bulkUpdateTopics);

router.get('/problems', adminController.listProblems);
router.get('/problems/:id', idParamValidator, validate, adminController.getProblem);
router.post('/problems', createProblemValidator, validate, adminController.createProblem);
router.patch('/problems/:id', updateProblemValidator, validate, adminController.updateProblem);
router.delete('/problems/:id', idParamValidator, validate, adminController.deleteProblem);
router.post('/problems/:id/duplicate', idParamValidator, validate, adminController.duplicateProblem);
router.patch('/problems/bulk', bulkUpdateValidator, validate, adminController.bulkUpdateProblems);

router.get('/quizzes', adminController.listQuizzes);
router.get('/quizzes/:id', idParamValidator, validate, adminController.getQuiz);
router.post('/quizzes', createQuizValidator, validate, adminController.createQuiz);
router.patch('/quizzes/:id', updateQuizValidator, validate, adminController.updateQuiz);
router.delete('/quizzes/:id', idParamValidator, validate, adminController.deleteQuiz);
router.post('/quizzes/:id/duplicate', idParamValidator, validate, adminController.duplicateQuiz);
router.patch('/quizzes/bulk', bulkUpdateValidator, validate, adminController.bulkUpdateQuizzes);

router.get('/contests', adminController.listContests);
router.get('/contests/:id', idParamValidator, validate, adminController.getContest);
router.post('/contests', createContestValidator, validate, adminController.createContest);
router.patch('/contests/:id', updateContestValidator, validate, adminController.updateContest);
router.delete('/contests/:id', idParamValidator, validate, adminController.deleteContest);
router.post('/contests/:id/duplicate', idParamValidator, validate, adminController.duplicateContest);
router.patch('/contests/bulk', bulkUpdateValidator, validate, adminController.bulkUpdateContests);

router.get('/announcements', adminController.listAnnouncements);
router.post('/announcements', createAnnouncementValidator, validate, adminController.createAnnouncement);
router.patch('/announcements/:id', updateAnnouncementValidator, validate, adminController.updateAnnouncement);
router.delete('/announcements/:id', idParamValidator, validate, adminController.deleteAnnouncement);
router.patch('/announcements/bulk', bulkUpdateValidator, validate, adminController.bulkUpdateAnnouncements);

router.get('/badges', adminController.listBadges);
router.get('/badges/:id', idParamValidator, validate, adminController.getBadge);
router.post('/badges', createBadgeValidator, validate, adminController.createBadge);
router.patch('/badges/:id', updateBadgeValidator, validate, adminController.updateBadge);
router.delete('/badges/:id', idParamValidator, validate, adminController.deleteBadge);

router.get('/visualizers', adminController.listVisualizers);
router.get('/visualizers/:id', idParamValidator, validate, adminController.getVisualizer);
router.post('/visualizers', createVisualizerValidator, validate, adminController.createVisualizer);
router.patch('/visualizers/:id', updateVisualizerValidator, validate, adminController.updateVisualizer);
router.delete('/visualizers/:id', idParamValidator, validate, adminController.deleteVisualizer);

router.get('/certificates', adminController.listCertificates);
router.get('/certificates/:id', idParamValidator, validate, adminController.getCertificate);
router.post('/certificates', createCertificateValidator, validate, adminController.createCertificate);
router.patch('/certificates/:id', updateCertificateValidator, validate, adminController.updateCertificate);
router.delete('/certificates/:id', idParamValidator, validate, adminController.deleteCertificate);

router.get('/settings', adminController.getPlatformSettings);
router.patch('/settings', updatePlatformSettingsValidator, validate, adminController.updatePlatformSettings);

router.get('/daily-challenges', adminController.listDailyChallenges);
router.post('/daily-challenges', createDailyChallengeValidator, validate, adminController.createDailyChallenge);
router.patch('/daily-challenges/:id', updateDailyChallengeValidator, validate, adminController.updateDailyChallenge);
router.delete('/daily-challenges/:id', idParamValidator, validate, adminController.deleteDailyChallenge);

export default router;
