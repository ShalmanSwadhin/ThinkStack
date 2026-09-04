import { useCallback, useEffect, useState } from 'react';
import leaderboardApi from './leaderboardService';
import { notifyBadges } from '../gamification/badgeNotify';

export function useLeaderboard(initialPeriod = 'global') {
  const [period, setPeriod] = useState(initialPeriod);
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchLeaderboard = useCallback(
    async (nextPeriod = period) => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await leaderboardApi.getLeaderboard({ period: nextPeriod });
        setData(result);
        if (result.newBadges?.length) {
          notifyBadges(result.newBadges);
        }
      } catch (err) {
        setError(err.response?.data?.error?.message || 'Failed to load leaderboard');
      } finally {
        setIsLoading(false);
      }
    },
    [period]
  );

  const changePeriod = useCallback(
    async (nextPeriod) => {
      setPeriod(nextPeriod);
      await fetchLeaderboard(nextPeriod);
    },
    [fetchLeaderboard]
  );

  useEffect(() => {
    fetchLeaderboard(period);
  }, [fetchLeaderboard, period]);

  return {
    period,
    entries: data?.entries ?? [],
    currentUser: data?.currentUser ?? null,
    periodStart: data?.periodStart ?? null,
    periodEnd: data?.periodEnd ?? null,
    isLoading,
    error,
    changePeriod,
    refetch: () => fetchLeaderboard(period),
  };
}

export default useLeaderboard;
