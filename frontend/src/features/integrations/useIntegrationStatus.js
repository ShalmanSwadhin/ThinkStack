import { useCallback, useEffect, useState } from 'react';
import integrationsApi from './integrationsService';

export function useIntegrationStatus() {
  const [status, setStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await integrationsApi.getStatus();
      setStatus(data);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to load integration status');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    status,
    isLoading,
    error,
    refresh,
    geminiComingSoon: status?.gemini?.status === 'coming_soon',
    judge0ComingSoon: status?.judge0?.status === 'coming_soon',
    geminiConfigured: Boolean(status?.gemini?.configured),
    judge0Configured: Boolean(status?.judge0?.configured),
  };
}

export default useIntegrationStatus;
