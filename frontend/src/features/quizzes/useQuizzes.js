import { useCallback, useEffect, useState } from 'react';
import quizzesApi from './quizzesService';

export function useQuizzes(initialFilters = {}) {
  const [filters, setFilters] = useState({ page: 1, limit: 20, search: '', ...initialFilters });
  const [debouncedSearch, setDebouncedSearch] = useState(filters.search);
  const [quizzes, setQuizzes] = useState([]);
  const [meta, setMeta] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(filters.search), 300);
    return () => window.clearTimeout(timer);
  }, [filters.search]);

  const fetchQuizzes = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = { page: filters.page, limit: filters.limit };
      if (debouncedSearch.trim()) params.search = debouncedSearch.trim();

      const data = await quizzesApi.listQuizzes(params);
      setQuizzes(data.quizzes ?? []);
      setMeta(data.meta ?? null);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to load quizzes');
    } finally {
      setIsLoading(false);
    }
  }, [filters.page, filters.limit, debouncedSearch]);

  useEffect(() => {
    fetchQuizzes();
  }, [fetchQuizzes]);

  const updateFilters = useCallback((updates) => {
    setFilters((current) => ({ ...current, ...updates, page: updates.page ?? 1 }));
  }, []);

  return { quizzes, meta, filters, isLoading, error, updateFilters, refetch: fetchQuizzes };
}

export default useQuizzes;
