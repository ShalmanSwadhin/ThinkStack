import api from '../../services/api';
import { unwrapApiPayload } from '../../utils/apiPayload';

export const integrationsApi = {
  getStatus: async () => {
    const response = await api.get('/integrations/status');
    return unwrapApiPayload(response);
  },
};

export default integrationsApi;
