import { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { selectTheme } from '../theme/themeSlice';
import contestsApi from './contestsService';
import { isComingSoonPayload } from '../../utils/apiPayload';

export function useContestProblem(contestSlug, problemSlug) {
  const themeMode = useSelector(selectTheme);
  const [data, setData] = useState(null);
  const [language, setLanguage] = useState('python');
  const [sourceCode, setSourceCode] = useState('');
  const [runResult, setRunResult] = useState(null);
  const [submitResult, setSubmitResult] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [mockMode, setMockMode] = useState(false);
  const [comingSoon, setComingSoon] = useState(false);

  const resolvedTheme =
    themeMode === 'system'
      ? window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'vs-dark'
        : 'light'
      : themeMode === 'dark'
        ? 'vs-dark'
        : 'light';

  const loadProblem = useCallback(async () => {
    if (!contestSlug || !problemSlug) return;
    setIsLoading(true);
    setError(null);
    try {
      const result = await contestsApi.getProblem(contestSlug, problemSlug);
      setData(result);
      setLanguage('python');
      setSourceCode(result.problem?.starterCode?.python || '# Write your solution here\n');
      setRunResult(null);
      setSubmitResult(null);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to load contest problem');
    } finally {
      setIsLoading(false);
    }
  }, [contestSlug, problemSlug]);

  useEffect(() => {
    loadProblem();
  }, [loadProblem]);

  const handleLanguageChange = useCallback(
    (nextLanguage) => {
      if (!data?.problem) return;
      setLanguage(nextLanguage);
      setSourceCode(data.problem.starterCode?.[nextLanguage] || '# Write your solution here\n');
      setRunResult(null);
      setSubmitResult(null);
    },
    [data]
  );

  const runSample = useCallback(async () => {
    setIsRunning(true);
    setError(null);
    try {
      const result = await contestsApi.runSample(contestSlug, problemSlug, {
        language,
        sourceCode,
      });
      if (isComingSoonPayload(result)) {
        setComingSoon(true);
        setError(null);
        setRunResult(null);
        return;
      }
      setComingSoon(false);
      setRunResult(result.run);
      setMockMode(Boolean(result.mockMode));
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Sample run failed');
    } finally {
      setIsRunning(false);
    }
  }, [contestSlug, problemSlug, language, sourceCode]);

  const submitSolution = useCallback(async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      const result = await contestsApi.submitSolution(contestSlug, problemSlug, {
        language,
        sourceCode,
      });
      if (isComingSoonPayload(result)) {
        setComingSoon(true);
        setError(null);
        setSubmitResult(null);
        return;
      }
      setComingSoon(false);
      setSubmitResult(result);
      setMockMode(Boolean(result.mockMode));
      await loadProblem();
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Submission failed');
    } finally {
      setIsSubmitting(false);
    }
  }, [contestSlug, problemSlug, language, sourceCode, loadProblem]);

  return {
    contest: data?.contest ?? null,
    problem: data?.problem ?? null,
    canSubmit: data?.canSubmit ?? false,
    language,
    sourceCode,
    runResult,
    submitResult,
    isLoading,
    isRunning,
    isSubmitting,
    error,
    mockMode,
    comingSoon,
    setComingSoon,
    editorTheme: resolvedTheme,
    setSourceCode,
    setLanguage: handleLanguageChange,
    runSample,
    submitSolution,
    refetch: loadProblem,
  };
}

export default useContestProblem;
