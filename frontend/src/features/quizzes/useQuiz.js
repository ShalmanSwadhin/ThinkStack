import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import applyGamificationResult from '../gamification/applyGamificationResult';
import { notifyBadges } from '../gamification/badgeNotify';
import quizzesApi from './quizzesService';
import { clearDraft, draftKeys, readDraft, writeDraft } from '../../utils/draftStorage';

const resultKey = (quizId) => `quiz-result:${quizId}`;

export function useQuiz(quizId) {
  const dispatch = useDispatch();
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [attempts, setAttempts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [startedAt, setStartedAt] = useState(null);
  const timerRef = useRef(null);
  const [secondsLeft, setSecondsLeft] = useState(null);

  const draftStorageKey = useMemo(() => draftKeys('quiz-draft', quizId), [quizId]);

  const loadAttempts = useCallback(async () => {
    if (!quizId) return;
    try {
      const data = await quizzesApi.listAttempts(quizId, { limit: 5 });
      setAttempts(data.attempts ?? []);
    } catch {
      setAttempts([]);
    }
  }, [quizId]);

  const loadQuiz = useCallback(async () => {
    if (!quizId) return;
    setIsLoading(true);
    setError(null);

    const storedResult = readDraft(resultKey(quizId), null);
    if (storedResult) {
      setResult(storedResult);
    } else {
      setResult(null);
    }

    try {
      const data = await quizzesApi.getQuiz(quizId);
      setQuiz(data);

      const storedDraft = readDraft(draftStorageKey, null);
      if (storedDraft?.answers && !storedResult) {
        setAnswers(storedDraft.answers);
        setStartedAt(storedDraft.startedAt ?? Date.now());
        if (data.timeLimitMinutes && storedDraft.secondsLeft != null) {
          setSecondsLeft(storedDraft.secondsLeft);
        } else if (data.timeLimitMinutes) {
          setSecondsLeft(data.timeLimitMinutes * 60);
        } else {
          setSecondsLeft(null);
        }
      } else if (!storedResult) {
        setAnswers({});
        setStartedAt(Date.now());
        setSecondsLeft(data.timeLimitMinutes ? data.timeLimitMinutes * 60 : null);
      }

      await loadAttempts();
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to load quiz');
    } finally {
      setIsLoading(false);
    }
  }, [quizId, draftStorageKey, loadAttempts]);

  useEffect(() => {
    loadQuiz();
  }, [loadQuiz]);

  useEffect(() => {
    if (!quiz || result) return;
    writeDraft(draftStorageKey, {
      answers,
      startedAt,
      secondsLeft,
    });
  }, [answers, startedAt, secondsLeft, quiz, result, draftStorageKey]);

  useEffect(() => {
    if (secondsLeft == null || result) return undefined;

    timerRef.current = window.setInterval(() => {
      setSecondsLeft((current) => {
        if (current == null || current <= 1) {
          window.clearInterval(timerRef.current);
          return 0;
        }
        return current - 1;
      });
    }, 1000);

    return () => window.clearInterval(timerRef.current);
  }, [secondsLeft, result, quiz?.id]);

  const setAnswer = useCallback((questionId, optionIndex) => {
    setAnswers((current) => ({ ...current, [questionId]: optionIndex }));
  }, []);

  const allAnswered = useMemo(() => {
    if (!quiz?.questions?.length) return false;
    return quiz.questions.every((question) => Number.isInteger(answers[question.id]));
  }, [quiz, answers]);

  const buildOrderedAnswers = useCallback(() => {
    if (!quiz?.questions?.length) return [];
    return quiz.questions.map((question) =>
      Number.isInteger(answers[question.id]) ? answers[question.id] : 0
    );
  }, [quiz, answers]);

  const submitQuiz = useCallback(
    async ({ allowPartial = false } = {}) => {
      if (!quiz) return;
      if (!allowPartial && !allAnswered) return;

      setIsSubmitting(true);
      setError(null);
      try {
        const orderedAnswers = buildOrderedAnswers();
        const timeTakenSeconds = startedAt
          ? Math.round((Date.now() - startedAt) / 1000)
          : undefined;

        const data = await quizzesApi.submitAttempt(quiz.id, {
          answers: orderedAnswers,
          timeTakenSeconds,
        });

        setResult(data);
        writeDraft(resultKey(quiz.id), data);
        clearDraft(draftStorageKey);

        const newBadges = applyGamificationResult(dispatch, data);
        notifyBadges(newBadges);
        await loadAttempts();
      } catch (err) {
        setError(err.response?.data?.error?.message || 'Failed to submit quiz');
      } finally {
        setIsSubmitting(false);
      }
    },
    [quiz, allAnswered, buildOrderedAnswers, startedAt, dispatch, draftStorageKey, loadAttempts]
  );

  const loadAttempt = useCallback(
    async (attemptId) => {
      if (!quizId) return;
      setIsLoading(true);
      setError(null);
      try {
        const data = await quizzesApi.getAttempt(quizId, attemptId);
        setResult(data);
        writeDraft(resultKey(quizId), data);
      } catch (err) {
        setError(err.response?.data?.error?.message || 'Failed to load attempt');
      } finally {
        setIsLoading(false);
      }
    },
    [quizId]
  );

  const restartQuiz = useCallback(() => {
    clearDraft(resultKey(quizId));
    clearDraft(draftStorageKey);
    setResult(null);
    setAnswers({});
    setStartedAt(Date.now());
    setSecondsLeft(quiz?.timeLimitMinutes ? quiz.timeLimitMinutes * 60 : null);
  }, [quizId, draftStorageKey, quiz?.timeLimitMinutes]);

  useEffect(() => {
    if (secondsLeft === 0 && !result && !isSubmitting) {
      submitQuiz({ allowPartial: true });
    }
  }, [secondsLeft, result, isSubmitting, submitQuiz]);

  return {
    quiz,
    answers,
    result,
    attempts,
    isLoading,
    isSubmitting,
    error,
    secondsLeft,
    allAnswered,
    setAnswer,
    submitQuiz,
    loadAttempt,
    restartQuiz,
    refetch: loadQuiz,
  };
}

export default useQuiz;
