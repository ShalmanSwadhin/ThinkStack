import { useCallback, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';
import { selectTheme } from '../theme/themeSlice';
import applyGamificationResult from '../gamification/applyGamificationResult';
import { notifyBadges } from '../gamification/badgeNotify';
import problemsApi from './problemsService';
import { isComingSoonPayload } from '../../utils/apiPayload';

export function useProblem(slug) {
  const dispatch = useDispatch();
  const themeMode = useSelector(selectTheme);
  const [problem, setProblem] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [language, setLanguage] = useState('python');
  const [sourceCode, setSourceCode] = useState('');
  const [runResult, setRunResult] = useState(null);
  const [submitResult, setSubmitResult] = useState(null);
  const [lastXpAwarded, setLastXpAwarded] = useState(0);
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
    if (!slug) return;
    setIsLoading(true);
    setError(null);
    try {
      const [detail, history] = await Promise.all([
        problemsApi.getProblem(slug),
        problemsApi.listSubmissions(slug, { limit: 10 }),
      ]);
      setProblem(detail);
      setSubmissions(history.submissions ?? []);
      setLanguage('python');
      setSourceCode(detail.starterCode?.python || '# Write your solution here\n');
      setRunResult(null);
      setSubmitResult(null);
      setLastXpAwarded(0);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to load problem');
    } finally {
      setIsLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    loadProblem();
  }, [loadProblem]);

  const handleLanguageChange = useCallback(
    (nextLanguage) => {
      if (!problem) return;
      setLanguage(nextLanguage);
      setSourceCode(problem.starterCode?.[nextLanguage] || `# Write your solution here\n`);
      setRunResult(null);
      setSubmitResult(null);
      setLastXpAwarded(0);
    },
    [problem]
  );

  const runSample = useCallback(async () => {
    if (!slug) return;
    setIsRunning(true);
    setError(null);
    try {
      const data = await problemsApi.runSample(slug, { language, sourceCode });
      if (isComingSoonPayload(data)) {
        setComingSoon(true);
        setError(null);
        setRunResult(null);
        return;
      }
      setComingSoon(false);
      setRunResult(data.run);
      setMockMode(Boolean(data.mockMode));
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to run sample');
      setRunResult(null);
    } finally {
      setIsRunning(false);
    }
  }, [slug, language, sourceCode]);

  const submitSolution = useCallback(async () => {
    if (!slug) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const data = await problemsApi.submitSolution(slug, { language, sourceCode });
      if (isComingSoonPayload(data)) {
        setComingSoon(true);
        setError(null);
        setSubmitResult(null);
        return;
      }
      setComingSoon(false);
      setSubmitResult(data.submission);
      setLastXpAwarded(data.xpAwarded ?? 0);
      setMockMode(Boolean(data.mockMode));

      const newBadges = applyGamificationResult(dispatch, data);
      notifyBadges(newBadges);

      if (data.submission.verdict === 'accepted') {
        setProblem((current) => (current ? { ...current, userStatus: 'solved' } : current));
      } else if (problem?.userStatus === 'unsolved') {
        setProblem((current) => (current ? { ...current, userStatus: 'attempted' } : current));
      }

      const history = await problemsApi.listSubmissions(slug, { limit: 10 });
      setSubmissions(history.submissions ?? []);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to submit solution');
    } finally {
      setIsSubmitting(false);
    }
  }, [slug, language, sourceCode, dispatch, problem?.userStatus]);

  return {
    problem,
    submissions,
    language,
    sourceCode,
    runResult,
    submitResult,
    lastXpAwarded,
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

export default useProblem;
