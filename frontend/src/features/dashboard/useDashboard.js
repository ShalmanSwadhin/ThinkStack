import { useCallback, useEffect, useState } from 'react';
import dashboardApi from './dashboardService';

const initialState = {
  stats: null,
  categoryProgress: [],
  dailyChallenge: null,
  recommendedTopic: null,
  recentActivity: [],
};

export function useDashboard() {
  const [data, setData] = useState(initialState);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboard = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const dashboard = await dashboardApi.getDashboard();
      setData(dashboard);
    } catch (err) {
      setError(err.response?.data?.error?.message || err.message || 'Failed to load dashboard');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  return {
    ...data,
    isLoading,
    error,
    refetch: fetchDashboard,
  };
}

export default useDashboard;
