import { useCallback, useEffect, useState } from 'react';
import progressApi from './progressService';

export function useProgress() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProgress = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await progressApi.getProgress();
      setData(result);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to load progress');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  return {
    overview: data?.overview ?? null,
    categoryProgress: data?.categoryProgress ?? [],
    activityTimeline: data?.activityTimeline ?? [],
    timeByCategory: data?.timeByCategory ?? [],
    topicDetails: data?.topicDetails ?? [],
    weakAreas: data?.weakAreas ?? null,
    isLoading,
    error,
    refetch: fetchProgress,
  };
}

export default useProgress;
