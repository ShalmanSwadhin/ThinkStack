import { useCallback, useEffect, useState } from 'react';
import learningApi from './learningService';

export function useTopics() {
  const [data, setData] = useState({ categories: [], summary: null });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTopics = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await learningApi.listTopics();
      setData(result);
    } catch (err) {
      setError(err.response?.data?.error?.message || err.message || 'Failed to load topics');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTopics();
  }, [fetchTopics]);

  return { ...data, isLoading, error, refetch: fetchTopics };
}

export default useTopics;
