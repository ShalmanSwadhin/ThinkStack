import api from '../../services/api';

export const progressApi = {
  getProgress: async () => {
    const response = await api.get('/progress');
    return response.data.data;
  },
};

export default progressApi;
