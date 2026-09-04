import api from '../../services/api';

export const adminApi = {
  getAnalytics: async () => {
    const response = await api.get('/admin/analytics');
    return response.data.data;
  },

  exportReport: async (type) => {
    const response = await api.get(`/admin/export/${type}`, { responseType: 'blob' });
    return response.data;
  },

  listUsers: async (params = {}) => {
    const response = await api.get('/admin/users', { params });
    return response.data.data;
  },

  updateUser: async (id, payload) => {
    const response = await api.patch(`/admin/users/${id}`, payload);
    return response.data.data;
  },

  listTopics: async (params = {}) => {
    const response = await api.get('/admin/topics', { params });
    return response.data.data;
  },

  getTopic: async (id) => {
    const response = await api.get(`/admin/topics/${id}`);
    return response.data.data;
  },

  createTopic: async (payload) => {
    const response = await api.post('/admin/topics', payload);
    return response.data.data;
  },

  updateTopic: async (id, payload) => {
    const response = await api.patch(`/admin/topics/${id}`, payload);
    return response.data.data;
  },

  deleteTopic: async (id) => {
    const response = await api.delete(`/admin/topics/${id}`);
    return response.data.data;
  },

  duplicateTopic: async (id) => {
    const response = await api.post(`/admin/topics/${id}/duplicate`);
    return response.data.data;
  },

  bulkUpdateTopics: async (payload) => {
    const response = await api.patch('/admin/topics/bulk', payload);
    return response.data.data;
  },

  listProblems: async (params = {}) => {
    const response = await api.get('/admin/problems', { params });
    return response.data.data;
  },

  getProblem: async (id) => {
    const response = await api.get(`/admin/problems/${id}`);
    return response.data.data;
  },

  createProblem: async (payload) => {
    const response = await api.post('/admin/problems', payload);
    return response.data.data;
  },

  updateProblem: async (id, payload) => {
    const response = await api.patch(`/admin/problems/${id}`, payload);
    return response.data.data;
  },

  deleteProblem: async (id) => {
    const response = await api.delete(`/admin/problems/${id}`);
    return response.data.data;
  },

  duplicateProblem: async (id) => {
    const response = await api.post(`/admin/problems/${id}/duplicate`);
    return response.data.data;
  },

  bulkUpdateProblems: async (payload) => {
    const response = await api.patch('/admin/problems/bulk', payload);
    return response.data.data;
  },

  listQuizzes: async (params = {}) => {
    const response = await api.get('/admin/quizzes', { params });
    return response.data.data;
  },

  getQuiz: async (id) => {
    const response = await api.get(`/admin/quizzes/${id}`);
    return response.data.data;
  },

  createQuiz: async (payload) => {
    const response = await api.post('/admin/quizzes', payload);
    return response.data.data;
  },

  updateQuiz: async (id, payload) => {
    const response = await api.patch(`/admin/quizzes/${id}`, payload);
    return response.data.data;
  },

  deleteQuiz: async (id) => {
    const response = await api.delete(`/admin/quizzes/${id}`);
    return response.data.data;
  },

  duplicateQuiz: async (id) => {
    const response = await api.post(`/admin/quizzes/${id}/duplicate`);
    return response.data.data;
  },

  bulkUpdateQuizzes: async (payload) => {
    const response = await api.patch('/admin/quizzes/bulk', payload);
    return response.data.data;
  },

  listContests: async (params = {}) => {
    const response = await api.get('/admin/contests', { params });
    return response.data.data;
  },

  getContest: async (id) => {
    const response = await api.get(`/admin/contests/${id}`);
    return response.data.data;
  },

  createContest: async (payload) => {
    const response = await api.post('/admin/contests', payload);
    return response.data.data;
  },

  updateContest: async (id, payload) => {
    const response = await api.patch(`/admin/contests/${id}`, payload);
    return response.data.data;
  },

  deleteContest: async (id) => {
    const response = await api.delete(`/admin/contests/${id}`);
    return response.data.data;
  },

  duplicateContest: async (id) => {
    const response = await api.post(`/admin/contests/${id}/duplicate`);
    return response.data.data;
  },

  bulkUpdateContests: async (payload) => {
    const response = await api.patch('/admin/contests/bulk', payload);
    return response.data.data;
  },

  listAnnouncements: async (params = {}) => {
    const response = await api.get('/admin/announcements', { params });
    return response.data.data;
  },

  createAnnouncement: async (payload) => {
    const response = await api.post('/admin/announcements', payload);
    return response.data.data;
  },

  updateAnnouncement: async (id, payload) => {
    const response = await api.patch(`/admin/announcements/${id}`, payload);
    return response.data.data;
  },

  deleteAnnouncement: async (id) => {
    const response = await api.delete(`/admin/announcements/${id}`);
    return response.data.data;
  },

  bulkUpdateAnnouncements: async (payload) => {
    const response = await api.patch('/admin/announcements/bulk', payload);
    return response.data.data;
  },

  listBadges: async (params = {}) => {
    const response = await api.get('/admin/badges', { params });
    return response.data.data;
  },

  getBadge: async (id) => {
    const response = await api.get(`/admin/badges/${id}`);
    return response.data.data;
  },

  createBadge: async (payload) => {
    const response = await api.post('/admin/badges', payload);
    return response.data.data;
  },

  updateBadge: async (id, payload) => {
    const response = await api.patch(`/admin/badges/${id}`, payload);
    return response.data.data;
  },

  deleteBadge: async (id) => {
    const response = await api.delete(`/admin/badges/${id}`);
    return response.data.data;
  },

  listVisualizers: async (params = {}) => {
    const response = await api.get('/admin/visualizers', { params });
    return response.data.data;
  },

  getVisualizer: async (id) => {
    const response = await api.get(`/admin/visualizers/${id}`);
    return response.data.data;
  },

  createVisualizer: async (payload) => {
    const response = await api.post('/admin/visualizers', payload);
    return response.data.data;
  },

  updateVisualizer: async (id, payload) => {
    const response = await api.patch(`/admin/visualizers/${id}`, payload);
    return response.data.data;
  },

  deleteVisualizer: async (id) => {
    const response = await api.delete(`/admin/visualizers/${id}`);
    return response.data.data;
  },

  listCertificates: async (params = {}) => {
    const response = await api.get('/admin/certificates', { params });
    return response.data.data;
  },

  getCertificate: async (id) => {
    const response = await api.get(`/admin/certificates/${id}`);
    return response.data.data;
  },

  createCertificate: async (payload) => {
    const response = await api.post('/admin/certificates', payload);
    return response.data.data;
  },

  updateCertificate: async (id, payload) => {
    const response = await api.patch(`/admin/certificates/${id}`, payload);
    return response.data.data;
  },

  deleteCertificate: async (id) => {
    const response = await api.delete(`/admin/certificates/${id}`);
    return response.data.data;
  },

  getPlatformSettings: async () => {
    const response = await api.get('/admin/settings');
    return response.data.data;
  },

  updatePlatformSettings: async (payload) => {
    const response = await api.patch('/admin/settings', payload);
    return response.data.data;
  },

  listDailyChallenges: async (params = {}) => {
    const response = await api.get('/admin/daily-challenges', { params });
    return response.data.data;
  },

  createDailyChallenge: async (payload) => {
    const response = await api.post('/admin/daily-challenges', payload);
    return response.data.data;
  },

  updateDailyChallenge: async (id, payload) => {
    const response = await api.patch(`/admin/daily-challenges/${id}`, payload);
    return response.data.data;
  },

  deleteDailyChallenge: async (id) => {
    const response = await api.delete(`/admin/daily-challenges/${id}`);
    return response.data.data;
  },
};

export default adminApi;
