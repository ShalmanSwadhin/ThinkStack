import api from '../../services/api';

export const dashboardApi = {
  getDashboard: async () => {
    const response = await api.get('/dashboard');
    return response.data.data;
  },
};

export default dashboardApi;
