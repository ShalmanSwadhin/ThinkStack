import api from '../../services/api';

export const gamificationApi = {
  getProfile: async () => {
    const response = await api.get('/gamification');
    return response.data.data;
  },
};

export default gamificationApi;
