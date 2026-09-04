import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

export function useVisualizerPlayer(steps = [], initialSpeed = 700) {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(initialSpeed);
  const timerRef = useRef(null);

  const total = steps.length;
  const isAtStart = index <= 0;
  const isAtEnd = index >= Math.max(total - 1, 0);
  const currentStep = steps[index] ?? null;

  const pause = useCallback(() => setPlaying(false), []);
  const play = useCallback(() => {
    if (total === 0) return;
    if (index >= total - 1) setIndex(0);
    setPlaying(true);
  }, [index, total]);

  const togglePlay = useCallback(() => {
    if (playing) pause();
    else play();
  }, [playing, pause, play]);

  const next = useCallback(() => {
    setIndex((current) => Math.min(current + 1, Math.max(total - 1, 0)));
  }, [total]);

  const prev = useCallback(() => {
    setIndex((current) => Math.max(current - 1, 0));
  }, []);

  const reset = useCallback(() => {
    pause();
    setIndex(0);
  }, [pause]);

  const goTo = useCallback(
    (target) => {
      setIndex(Math.max(0, Math.min(target, Math.max(total - 1, 0))));
    },
    [total]
  );

  useEffect(() => {
    setIndex(0);
    setPlaying(false);
  }, [steps]);

  useEffect(() => {
    if (!playing || total === 0) {
      if (timerRef.current) clearInterval(timerRef.current);
      return undefined;
    }

    timerRef.current = setInterval(() => {
      setIndex((current) => {
        if (current >= total - 1) {
          setPlaying(false);
          return current;
        }
        return current + 1;
      });
    }, speed);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [playing, speed, total]);

  return useMemo(
    () => ({
      currentStep,
      index,
      total,
      playing,
      speed,
      isAtStart,
      isAtEnd,
      play,
      pause,
      togglePlay,
      next,
      prev,
      reset,
      goTo,
      setSpeed,
    }),
    [
      currentStep,
      index,
      total,
      playing,
      speed,
      isAtStart,
      isAtEnd,
      play,
      pause,
      togglePlay,
      next,
      prev,
      reset,
      goTo,
    ]
  );
}

export default useVisualizerPlayer;
