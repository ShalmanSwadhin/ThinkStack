import { useCallback, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import contestsApi from './contestsService';
import applyGamificationResult from '../gamification/applyGamificationResult';
import { notifyBadges } from '../gamification/badgeNotify';

export function useContest(slug) {
  const dispatch = useDispatch();
  const [contest, setContest] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState(null);

  const loadContest = useCallback(async () => {
    if (!slug) return;
    setIsLoading(true);
    setError(null);
    try {
      const [detail, standings] = await Promise.all([
        contestsApi.getContest(slug),
        contestsApi.getLeaderboard(slug, { limit: 20 }),
      ]);
      setContest(detail);
      setLeaderboard(standings.entries ?? []);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to load contest');
    } finally {
      setIsLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    loadContest();
  }, [loadContest]);

  const register = useCallback(async () => {
    if (!slug) return;
    setIsRegistering(true);
    setError(null);
    try {
      const data = await contestsApi.register(slug);
      const badges = applyGamificationResult(dispatch, data);
      notifyBadges(badges);
      await loadContest();
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to register');
    } finally {
      setIsRegistering(false);
    }
  }, [dispatch, loadContest, slug]);

  return {
    contest,
    leaderboard,
    isLoading,
    isRegistering,
    error,
    register,
    refetch: loadContest,
  };
}

export default useContest;
