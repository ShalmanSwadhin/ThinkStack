import api from '../../services/api';

export const quizzesApi = {
  listQuizzes: async (params = {}) => {
    const response = await api.get('/quizzes', { params });
    return response.data.data;
  },

  getQuiz: async (id) => {
    const response = await api.get(`/quizzes/${id}`);
    return response.data.data;
  },

  submitAttempt: async (id, payload) => {
    const response = await api.post(`/quizzes/${id}/submit`, payload);
    return response.data.data;
  },

  listAttempts: async (id, params = {}) => {
    const response = await api.get(`/quizzes/${id}/attempts`, { params });
    return response.data.data;
  },

  getAttempt: async (id, attemptId) => {
    const response = await api.get(`/quizzes/${id}/attempts/${attemptId}`);
    return response.data.data;
  },
};

export default quizzesApi;
