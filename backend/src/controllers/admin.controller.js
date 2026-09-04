import adminService from '../services/AdminService.js';
import { sendSuccess } from '../utils/apiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import { logAdminAction } from '../utils/adminAudit.js';

const bulkHandler = (entityType, serviceMethod) =>
  asyncHandler(async (req, res) => {
    const { ids, ...payload } = req.body;
    const data = await serviceMethod(ids, payload);
    await logAdminAction(req, `bulk_update_${entityType}`, entityType, null, { ids, ...payload });
    sendSuccess(res, data, 'Bulk update completed');
  });

export const getAnalytics = asyncHandler(async (req, res) => {
  const data = await adminService.getAnalytics();
  sendSuccess(res, data);
});

export const exportReport = asyncHandler(async (req, res) => {
  const { filename, csv } = await adminService.exportReport(req.params.type);
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.status(200).send(csv);
});

export const listUsers = asyncHandler(async (req, res) => {
  const data = await adminService.listUsers(req.query);
  sendSuccess(res, data, 'Success', 200, data.meta);
});

export const updateUser = asyncHandler(async (req, res) => {
  const data = await adminService.updateUser(req.user.id, req.params.id, req.body);
  await logAdminAction(req, 'update_user', 'user', req.params.id, req.body);
  sendSuccess(res, data, 'User updated');
});

export const listTopics = asyncHandler(async (req, res) => {
  const data = await adminService.listTopics(req.query);
  sendSuccess(res, data, 'Success', 200, data.meta);
});

export const getTopic = asyncHandler(async (req, res) => {
  const data = await adminService.getTopic(req.params.id);
  sendSuccess(res, data);
});

export const createTopic = asyncHandler(async (req, res) => {
  const data = await adminService.createTopic(req.user.id, req.body);
  await logAdminAction(req, 'create_topic', 'topic', data.id, { slug: data.slug });
  sendSuccess(res, data, 'Topic created', 201);
});

export const updateTopic = asyncHandler(async (req, res) => {
  const data = await adminService.updateTopic(req.params.id, req.body);
  await logAdminAction(req, 'update_topic', 'topic', req.params.id, req.body);
  sendSuccess(res, data, 'Topic updated');
});

export const deleteTopic = asyncHandler(async (req, res) => {
  await adminService.deleteTopic(req.params.id);
  await logAdminAction(req, 'delete_topic', 'topic', req.params.id);
  sendSuccess(res, { deleted: true }, 'Topic deleted');
});

export const duplicateTopic = asyncHandler(async (req, res) => {
  const data = await adminService.duplicateTopic(req.params.id);
  await logAdminAction(req, 'duplicate_topic', 'topic', req.params.id);
  sendSuccess(res, data, 'Topic duplicated', 201);
});

export const bulkUpdateTopics = bulkHandler('topic', adminService.bulkUpdateTopics.bind(adminService));

export const listProblems = asyncHandler(async (req, res) => {
  const data = await adminService.listProblems(req.query);
  sendSuccess(res, data, 'Success', 200, data.meta);
});

export const getProblem = asyncHandler(async (req, res) => {
  const data = await adminService.getProblem(req.params.id);
  sendSuccess(res, data);
});

export const createProblem = asyncHandler(async (req, res) => {
  const data = await adminService.createProblem(req.user.id, req.body);
  await logAdminAction(req, 'create_problem', 'problem', data.id, { slug: data.slug });
  sendSuccess(res, data, 'Problem created', 201);
});

export const updateProblem = asyncHandler(async (req, res) => {
  const data = await adminService.updateProblem(req.params.id, req.body);
  await logAdminAction(req, 'update_problem', 'problem', req.params.id, req.body);
  sendSuccess(res, data, 'Problem updated');
});

export const deleteProblem = asyncHandler(async (req, res) => {
  await adminService.deleteProblem(req.params.id);
  await logAdminAction(req, 'delete_problem', 'problem', req.params.id);
  sendSuccess(res, { deleted: true }, 'Problem deleted');
});

export const duplicateProblem = asyncHandler(async (req, res) => {
  const data = await adminService.duplicateProblem(req.params.id);
  await logAdminAction(req, 'duplicate_problem', 'problem', req.params.id);
  sendSuccess(res, data, 'Problem duplicated', 201);
});

export const bulkUpdateProblems = bulkHandler('problem', adminService.bulkUpdateProblems.bind(adminService));

export const listQuizzes = asyncHandler(async (req, res) => {
  const data = await adminService.listQuizzes(req.query);
  sendSuccess(res, data, 'Success', 200, data.meta);
});

export const getQuiz = asyncHandler(async (req, res) => {
  const data = await adminService.getQuiz(req.params.id);
  sendSuccess(res, data);
});

export const updateQuiz = asyncHandler(async (req, res) => {
  const data = await adminService.updateQuiz(req.params.id, req.body);
  await logAdminAction(req, 'update_quiz', 'quiz', req.params.id, req.body);
  sendSuccess(res, data, 'Quiz updated');
});

export const createQuiz = asyncHandler(async (req, res) => {
  const data = await adminService.createQuiz(req.body);
  await logAdminAction(req, 'create_quiz', 'quiz', data.id, { title: data.title });
  sendSuccess(res, data, 'Quiz created', 201);
});

export const deleteQuiz = asyncHandler(async (req, res) => {
  await adminService.deleteQuiz(req.params.id);
  await logAdminAction(req, 'delete_quiz', 'quiz', req.params.id);
  sendSuccess(res, { deleted: true }, 'Quiz deleted');
});

export const duplicateQuiz = asyncHandler(async (req, res) => {
  const data = await adminService.duplicateQuiz(req.params.id);
  await logAdminAction(req, 'duplicate_quiz', 'quiz', req.params.id);
  sendSuccess(res, data, 'Quiz duplicated', 201);
});

export const bulkUpdateQuizzes = bulkHandler('quiz', adminService.bulkUpdateQuizzes.bind(adminService));

export const listContests = asyncHandler(async (req, res) => {
  const data = await adminService.listContests(req.query);
  sendSuccess(res, data, 'Success', 200, data.meta);
});

export const getContest = asyncHandler(async (req, res) => {
  const data = await adminService.getContest(req.params.id);
  sendSuccess(res, data);
});

export const createContest = asyncHandler(async (req, res) => {
  const data = await adminService.createContest(req.user.id, req.body);
  await logAdminAction(req, 'create_contest', 'contest', data.id, { slug: data.slug });
  sendSuccess(res, data, 'Contest created', 201);
});

export const updateContest = asyncHandler(async (req, res) => {
  const data = await adminService.updateContest(req.params.id, req.body);
  await logAdminAction(req, 'update_contest', 'contest', req.params.id, req.body);
  sendSuccess(res, data, 'Contest updated');
});

export const deleteContest = asyncHandler(async (req, res) => {
  await adminService.deleteContest(req.params.id);
  await logAdminAction(req, 'delete_contest', 'contest', req.params.id);
  sendSuccess(res, { deleted: true }, 'Contest deleted');
});

export const duplicateContest = asyncHandler(async (req, res) => {
  const data = await adminService.duplicateContest(req.params.id);
  await logAdminAction(req, 'duplicate_contest', 'contest', req.params.id);
  sendSuccess(res, data, 'Contest duplicated', 201);
});

export const bulkUpdateContests = bulkHandler('contest', adminService.bulkUpdateContests.bind(adminService));

export const listAnnouncements = asyncHandler(async (req, res) => {
  const data = await adminService.listAnnouncements(req.query);
  sendSuccess(res, data, 'Success', 200, data.meta);
});

export const createAnnouncement = asyncHandler(async (req, res) => {
  const data = await adminService.createAnnouncement(req.user.id, req.body);
  await logAdminAction(req, 'create_announcement', 'announcement', data.id, {
    title: data.title,
  });
  sendSuccess(res, data, 'Announcement created', 201);
});

export const updateAnnouncement = asyncHandler(async (req, res) => {
  const data = await adminService.updateAnnouncement(req.params.id, req.body);
  await logAdminAction(req, 'update_announcement', 'announcement', req.params.id, req.body);
  sendSuccess(res, data, 'Announcement updated');
});

export const deleteAnnouncement = asyncHandler(async (req, res) => {
  await adminService.deleteAnnouncement(req.params.id);
  await logAdminAction(req, 'delete_announcement', 'announcement', req.params.id);
  sendSuccess(res, { deleted: true }, 'Announcement deleted');
});

export const bulkUpdateAnnouncements = bulkHandler(
  'announcement',
  adminService.bulkUpdateAnnouncements.bind(adminService)
);

export const listBadges = asyncHandler(async (req, res) => {
  const data = await adminService.listBadges(req.query);
  sendSuccess(res, data, 'Success', 200, data.meta);
});

export const getBadge = asyncHandler(async (req, res) => {
  const data = await adminService.getBadge(req.params.id);
  sendSuccess(res, data);
});

export const createBadge = asyncHandler(async (req, res) => {
  const data = await adminService.createBadge(req.body);
  await logAdminAction(req, 'create_badge', 'badge', data.id);
  sendSuccess(res, data, 'Badge created', 201);
});

export const updateBadge = asyncHandler(async (req, res) => {
  const data = await adminService.updateBadge(req.params.id, req.body);
  await logAdminAction(req, 'update_badge', 'badge', req.params.id, req.body);
  sendSuccess(res, data, 'Badge updated');
});

export const deleteBadge = asyncHandler(async (req, res) => {
  await adminService.deleteBadge(req.params.id);
  await logAdminAction(req, 'delete_badge', 'badge', req.params.id);
  sendSuccess(res, { deleted: true }, 'Badge deleted');
});

export const listVisualizers = asyncHandler(async (req, res) => {
  const data = await adminService.listVisualizers(req.query);
  sendSuccess(res, data, 'Success', 200, data.meta);
});

export const getVisualizer = asyncHandler(async (req, res) => {
  const data = await adminService.getVisualizer(req.params.id);
  sendSuccess(res, data);
});

export const createVisualizer = asyncHandler(async (req, res) => {
  const data = await adminService.createVisualizer(req.body);
  await logAdminAction(req, 'create_visualizer', 'visualizer', data.id);
  sendSuccess(res, data, 'Visualizer created', 201);
});

export const updateVisualizer = asyncHandler(async (req, res) => {
  const data = await adminService.updateVisualizer(req.params.id, req.body);
  await logAdminAction(req, 'update_visualizer', 'visualizer', req.params.id, req.body);
  sendSuccess(res, data, 'Visualizer updated');
});

export const deleteVisualizer = asyncHandler(async (req, res) => {
  await adminService.deleteVisualizer(req.params.id);
  await logAdminAction(req, 'delete_visualizer', 'visualizer', req.params.id);
  sendSuccess(res, { deleted: true }, 'Visualizer deleted');
});

export const listCertificates = asyncHandler(async (req, res) => {
  const data = await adminService.listCertificates(req.query);
  sendSuccess(res, data, 'Success', 200, data.meta);
});

export const getCertificate = asyncHandler(async (req, res) => {
  const data = await adminService.getCertificate(req.params.id);
  sendSuccess(res, data);
});

export const createCertificate = asyncHandler(async (req, res) => {
  const data = await adminService.createCertificate(req.body);
  await logAdminAction(req, 'create_certificate', 'certificate', data.id);
  sendSuccess(res, data, 'Certificate created', 201);
});

export const updateCertificate = asyncHandler(async (req, res) => {
  const data = await adminService.updateCertificate(req.params.id, req.body);
  await logAdminAction(req, 'update_certificate', 'certificate', req.params.id, req.body);
  sendSuccess(res, data, 'Certificate updated');
});

export const deleteCertificate = asyncHandler(async (req, res) => {
  await adminService.deleteCertificate(req.params.id);
  await logAdminAction(req, 'delete_certificate', 'certificate', req.params.id);
  sendSuccess(res, { deleted: true }, 'Certificate deleted');
});

export const getPlatformSettings = asyncHandler(async (req, res) => {
  const data = await adminService.getPlatformSettings();
  sendSuccess(res, data);
});

export const updatePlatformSettings = asyncHandler(async (req, res) => {
  const data = await adminService.updatePlatformSettings(req.body);
  await logAdminAction(req, 'update_platform_settings', 'settings', data.id, req.body);
  sendSuccess(res, data, 'Settings updated');
});

export const listDailyChallenges = asyncHandler(async (req, res) => {
  const data = await adminService.listDailyChallenges(req.query);
  sendSuccess(res, data, 'Success', 200, data.meta);
});

export const createDailyChallenge = asyncHandler(async (req, res) => {
  const data = await adminService.createDailyChallenge(req.body);
  await logAdminAction(req, 'create_daily_challenge', 'daily_challenge', data.id);
  sendSuccess(res, data, 'Daily challenge created', 201);
});

export const updateDailyChallenge = asyncHandler(async (req, res) => {
  const data = await adminService.updateDailyChallenge(req.params.id, req.body);
  await logAdminAction(req, 'update_daily_challenge', 'daily_challenge', req.params.id, req.body);
  sendSuccess(res, data, 'Daily challenge updated');
});

export const deleteDailyChallenge = asyncHandler(async (req, res) => {
  await adminService.deleteDailyChallenge(req.params.id);
  await logAdminAction(req, 'delete_daily_challenge', 'daily_challenge', req.params.id);
  sendSuccess(res, { deleted: true }, 'Daily challenge deleted');
});

export default {
  getAnalytics,
  exportReport,
  listUsers,
  updateUser,
  listTopics,
  getTopic,
  createTopic,
  updateTopic,
  deleteTopic,
  duplicateTopic,
  bulkUpdateTopics,
  listProblems,
  getProblem,
  createProblem,
  updateProblem,
  deleteProblem,
  duplicateProblem,
  bulkUpdateProblems,
  listQuizzes,
  getQuiz,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  duplicateQuiz,
  bulkUpdateQuizzes,
  listContests,
  getContest,
  createContest,
  updateContest,
  deleteContest,
  duplicateContest,
  bulkUpdateContests,
  listAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  bulkUpdateAnnouncements,
  listBadges,
  getBadge,
  createBadge,
  updateBadge,
  deleteBadge,
  listVisualizers,
  getVisualizer,
  createVisualizer,
  updateVisualizer,
  deleteVisualizer,
  listCertificates,
  getCertificate,
  createCertificate,
  updateCertificate,
  deleteCertificate,
  getPlatformSettings,
  updatePlatformSettings,
  listDailyChallenges,
  createDailyChallenge,
  updateDailyChallenge,
  deleteDailyChallenge,
};
