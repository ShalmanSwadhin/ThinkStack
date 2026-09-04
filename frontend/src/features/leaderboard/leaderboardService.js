import api from '../../services/api';

export const leaderboardApi = {
  getLeaderboard: async ({ period = 'global', limit = 100 } = {}) => {
    const response = await api.get('/leaderboard', {
      params: { period, limit },
    });
    return response.data.data;
  },
};

export default leaderboardApi;
