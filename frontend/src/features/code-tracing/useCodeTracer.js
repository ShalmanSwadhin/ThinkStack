import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { buildTracePlan } from './engine/traceEngine.js';

export function useCodeTracer(initialSource, language = 'python') {
  const [source, setSource] = useState(initialSource);
  const [stepIndex, setStepIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const timerRef = useRef(null);

  const plan = useMemo(() => {
    try {
      return buildTracePlan(source, language);
    } catch (error) {
      return {
        steps: [],
        language,
        lineCount: source.split('\n').length,
        error: error?.message ?? 'Unable to trace this code.',
      };
    }
  }, [source, language]);
  const steps = plan.steps;
  const currentStep = steps[stepIndex] ?? null;
  const total = steps.length;

  useEffect(() => {
    if (stepIndex >= total && total > 0) {
      setStepIndex(total - 1);
    }
  }, [stepIndex, total]);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const restart = useCallback(() => {
    stopTimer();
    setPlaying(false);
    setStepIndex(0);
  }, [stopTimer]);

  const parseCode = useCallback((nextSource) => {
    stopTimer();
    setPlaying(false);
    setSource(nextSource);
    setStepIndex(0);
  }, [stopTimer]);

  const next = useCallback(() => {
    setStepIndex((current) => Math.min(current + 1, total - 1));
  }, [total]);

  const prev = useCallback(() => {
    setStepIndex((current) => Math.max(current - 1, 0));
  }, []);

  const jumpToLine = useCallback(
    (lineNumber) => {
      const target = steps.findIndex((step) => step.line === lineNumber);
      if (target >= 0) setStepIndex(target);
    },
    [steps]
  );

  const togglePlay = useCallback(() => {
    setPlaying((current) => !current);
  }, []);

  useEffect(() => {
    stopTimer();
    if (!playing || stepIndex >= total - 1) {
      if (stepIndex >= total - 1) setPlaying(false);
      return undefined;
    }

    timerRef.current = window.setInterval(() => {
      setStepIndex((current) => {
        if (current >= total - 1) {
          setPlaying(false);
          return current;
        }
        return current + 1;
      });
    }, Math.max(200, 1200 / speed));

    return stopTimer;
  }, [playing, speed, stepIndex, total, stopTimer]);

  useEffect(() => () => stopTimer(), [stopTimer]);

  return {
    source,
    language,
    steps,
    currentStep,
    stepIndex,
    total,
    playing,
    speed,
    plan,
    parseCode,
    next,
    prev,
    restart,
    jumpToLine,
    goTo: setStepIndex,
    togglePlay,
    setSpeed,
    isAtStart: stepIndex === 0,
    isAtEnd: stepIndex >= total - 1,
  };
}

export default useCodeTracer;
