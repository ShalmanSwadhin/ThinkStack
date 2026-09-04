import api from '../../services/api';
import { unwrapApiPayload } from '../../utils/apiPayload';

export const contestsApi = {
  listContests: async (params = {}) => {
    const response = await api.get('/contests', { params });
    return response.data.data;
  },

  getContest: async (slug) => {
    const response = await api.get(`/contests/${slug}`);
    return response.data.data;
  },

  register: async (slug) => {
    const response = await api.post(`/contests/${slug}/register`);
    return response.data.data;
  },

  getLeaderboard: async (slug, params = {}) => {
    const response = await api.get(`/contests/${slug}/leaderboard`, { params });
    return response.data.data;
  },

  getProblem: async (contestSlug, problemSlug) => {
    const response = await api.get(`/contests/${contestSlug}/problems/${problemSlug}`);
    return response.data.data;
  },

  runSample: async (contestSlug, problemSlug, payload) => {
    const response = await api.post(
      `/contests/${contestSlug}/problems/${problemSlug}/run`,
      payload
    );
    return unwrapApiPayload(response);
  },

  submitSolution: async (contestSlug, problemSlug, payload) => {
    const response = await api.post(
      `/contests/${contestSlug}/problems/${problemSlug}/submit`,
      payload
    );
    return unwrapApiPayload(response);
  },
};

export default contestsApi;
