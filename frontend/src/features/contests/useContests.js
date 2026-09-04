import { useCallback, useEffect, useState } from 'react';
import contestsApi from './contestsService';

export function useContests(initialStatus = 'all') {
  const [status, setStatus] = useState(initialStatus);
  const [contests, setContests] = useState([]);
  const [meta, setMeta] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchContests = useCallback(async (nextStatus = status) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await contestsApi.listContests({
        status: nextStatus === 'all' ? undefined : nextStatus,
      });
      setContests(data.contests ?? []);
      setMeta(data.meta ?? null);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to load contests');
    } finally {
      setIsLoading(false);
    }
  }, [status]);

  const changeStatus = useCallback(
    async (nextStatus) => {
      setStatus(nextStatus);
      await fetchContests(nextStatus);
    },
    [fetchContests]
  );

  useEffect(() => {
    fetchContests(status);
  }, [fetchContests, status]);

  return {
    status,
    contests,
    meta,
    isLoading,
    error,
    changeStatus,
    refetch: () => fetchContests(status),
  };
}

export default useContests;
