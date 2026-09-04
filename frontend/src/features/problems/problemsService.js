import api from '../../services/api';
import { unwrapApiPayload } from '../../utils/apiPayload';

export const problemsApi = {
  listProblems: async (params = {}) => {
    const response = await api.get('/problems', { params });
    return response.data.data;
  },

  getProblem: async (slug) => {
    const response = await api.get(`/problems/${slug}`);
    return response.data.data;
  },

  runSample: async (slug, payload) => {
    const response = await api.post(`/problems/${slug}/run`, payload);
    return unwrapApiPayload(response);
  },

  submitSolution: async (slug, payload) => {
    const response = await api.post(`/problems/${slug}/submit`, payload);
    return unwrapApiPayload(response);
  },

  listSubmissions: async (slug, params = {}) => {
    const response = await api.get(`/problems/${slug}/submissions`, { params });
    return response.data.data;
  },
};

export default problemsApi;
