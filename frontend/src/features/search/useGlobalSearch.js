import { useCallback, useEffect, useRef, useState } from 'react';
import searchApi from './searchService';

const DEBOUNCE_MS = 300;
const MIN_QUERY_LENGTH = 2;

export function useGlobalSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const debounceRef = useRef(null);

  const loadHistory = useCallback(async () => {
    try {
      const data = await searchApi.listHistory({ limit: 8 });
      setHistory(data.history ?? []);
    } catch {
      setHistory([]);
    }
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const clearResults = useCallback(() => {
    setResults(null);
    setSuggestions([]);
    setError(null);
  }, []);

  const runSearch = useCallback(
    async (nextQuery, mode = 'full') => {
      const trimmed = nextQuery.trim();

      if (trimmed.length < MIN_QUERY_LENGTH) {
        clearResults();
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        if (mode === 'suggest') {
          const data = await searchApi.suggest({ q: trimmed });
          setSuggestions(data.suggestions ?? []);
          setResults(null);
        } else {
          const data = await searchApi.search({ q: trimmed });
          setResults(data);
          setSuggestions([]);
          await loadHistory();
        }
      } catch (err) {
        setError(err.response?.data?.error?.message || 'Search failed');
        clearResults();
      } finally {
        setIsLoading(false);
      }
    },
    [clearResults, loadHistory]
  );

  const updateQuery = useCallback(
    (nextQuery, mode = 'suggest') => {
      setQuery(nextQuery);

      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      if (nextQuery.trim().length < MIN_QUERY_LENGTH) {
        clearResults();
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      debounceRef.current = setTimeout(() => {
        runSearch(nextQuery, mode);
      }, DEBOUNCE_MS);
    },
    [clearResults, runSearch]
  );

  const submitSearch = useCallback(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    runSearch(query, 'full');
  }, [query, runSearch]);

  const selectHistoryQuery = useCallback(
    (historyQuery) => {
      setQuery(historyQuery);
      runSearch(historyQuery, 'full');
    },
    [runSearch]
  );

  const clearHistory = useCallback(async () => {
    await searchApi.clearHistory();
    setHistory([]);
  }, []);

  const removeHistoryEntry = useCallback(
    async (id) => {
      await searchApi.removeHistoryEntry(id);
      await loadHistory();
    },
    [loadHistory]
  );

  const openSearch = useCallback(() => {
    setIsOpen(true);
    loadHistory();
  }, [loadHistory]);

  const closeSearch = useCallback(() => {
    setIsOpen(false);
  }, []);

  const resetSearch = useCallback(() => {
    setQuery('');
    clearResults();
    setIsOpen(false);
    setIsLoading(false);
  }, [clearResults]);

  useEffect(
    () => () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    },
    []
  );

  return {
    query,
    results,
    suggestions,
    history,
    isLoading,
    error,
    isOpen,
    updateQuery,
    submitSearch,
    selectHistoryQuery,
    clearHistory,
    removeHistoryEntry,
    openSearch,
    closeSearch,
    resetSearch,
  };
}

export default useGlobalSearch;
