import { useCallback, useEffect, useState } from 'react';
import problemsApi from './problemsService';

export function useProblems(initialFilters = {}) {
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    difficulty: '',
    topic: '',
    status: '',
    search: '',
    ...initialFilters,
  });
  const [problems, setProblems] = useState([]);
  const [meta, setMeta] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProblems = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = Object.fromEntries(
        Object.entries(filters).filter(([, value]) => value !== '' && value != null)
      );
      const data = await problemsApi.listProblems(params);
      setProblems(data.problems ?? []);
      setMeta(data.meta ?? null);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to load problems');
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchProblems();
  }, [fetchProblems]);

  const updateFilters = useCallback((updates) => {
    setFilters((current) => ({ ...current, ...updates, page: updates.page ?? 1 }));
  }, []);

  return {
    problems,
    meta,
    filters,
    isLoading,
    error,
    updateFilters,
    refetch: fetchProblems,
  };
}

export default useProblems;
