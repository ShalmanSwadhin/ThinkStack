import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import {
  ALGORITHM_MAP,
  ALGORITHM_CATEGORIES,
  resolveAlgorithmId,
  runAlgorithm,
} from 'shared/algorithms/catalog.js';
import { DEFAULT_CODE_LANGUAGE } from 'shared/algorithms/codeSync/index.js';
import { useVisualizerPlayer } from '../features/visualizer/useVisualizerPlayer';
import ControlPanel from '../features/visualizer/components/ControlPanel';
import StatsPanel from '../features/visualizer/components/StatsPanel';
import DataInputPanel from '../features/visualizer/components/DataInputPanel';
import VisualizerStage from '../features/visualizer/components/VisualizerStage';
import CodeSyncPanel, { CodeExplanationPanel } from '../features/visualizer/components/CodeSyncPanel';
import VariableWatchPanel from '../features/visualizer/components/VariableWatchPanel';
import Button from '../components/ui/Button';
import { selectTheme } from '../features/theme/themeSlice';

export default function VisualizerWorkspacePage() {
  const { algorithmId: slugOrId } = useParams();
  const resolvedId = resolveAlgorithmId(slugOrId);
  const algorithm = resolvedId ? ALGORITHM_MAP[resolvedId] : null;

  const [customInput, setCustomInput] = useState('');
  const [target, setTarget] = useState(algorithm?.defaultTarget ?? 42);
  const [steps, setSteps] = useState([]);
  const [error, setError] = useState(null);
  const [runKey, setRunKey] = useState(0);
  const [codeLanguage, setCodeLanguage] = useState(DEFAULT_CODE_LANGUAGE);
  const skipInputRegenerateRef = useRef(false);
  const theme = useSelector(selectTheme);
  const editorTheme = theme === 'dark' ? 'vs-dark' : 'vs-light';

  const player = useVisualizerPlayer(steps);

  const applyGeneratedSteps = useCallback((result, algorithmDef) => {
    setSteps(result.steps);
    setRunKey((current) => current + 1);
    if (algorithmDef.inputType !== 'graph' && result.input) {
      setCustomInput(result.input.join(', '));
    }
  }, []);

  const generateSteps = useCallback(
    (options = {}) => {
      if (!algorithm) return;
      setError(null);
      try {
        const input = options.inputOverride ?? customInput;
        const targetValue = options.targetOverride ?? target;
        const result = runAlgorithm(algorithm.id, input, { target: targetValue });
        applyGeneratedSteps(result, algorithm);
      } catch (err) {
        setError(err.message || 'Failed to generate visualization steps');
        setSteps([]);
      }
    },
    [algorithm, applyGeneratedSteps, customInput, target]
  );

  const handleRandomize = useCallback(() => {
    if (!algorithm) return;
    if (algorithm.inputType === 'graph') {
      generateSteps({ inputOverride: '' });
      return;
    }
    const randomValues = algorithm.randomInput();
    const inputText = randomValues.join(', ');
    if (algorithm.inputType === 'words') {
      setCustomInput(inputText);
      generateSteps({ inputOverride: inputText });
    } else if (algorithm.inputType === 'array-target') {
      const newTarget = randomValues[Math.floor(Math.random() * randomValues.length)];
      setCustomInput(inputText);
      setTarget(newTarget);
      generateSteps({ inputOverride: inputText, targetOverride: newTarget });
    } else {
      setCustomInput(inputText);
      generateSteps({ inputOverride: inputText });
    }
  }, [algorithm, generateSteps]);

  useEffect(() => {
    if (!algorithm) return;

    skipInputRegenerateRef.current = true;
    setSteps([]);
    setError(null);

    const defaultTarget = algorithm.defaultTarget ?? 42;
    setTarget(defaultTarget);
    setCustomInput('');

    try {
      const result = runAlgorithm(algorithm.id, '', { target: defaultTarget });
      applyGeneratedSteps(result, algorithm);
    } catch (err) {
      setError(err.message || 'Failed to generate visualization steps');
      setSteps([]);
    }
  }, [algorithm, applyGeneratedSteps]);

  useEffect(() => {
    if (!algorithm) return;
    if (skipInputRegenerateRef.current) {
      skipInputRegenerateRef.current = false;
      return undefined;
    }

    const timer = window.setTimeout(() => {
      generateSteps();
    }, 300);

    return () => window.clearTimeout(timer);
  }, [algorithm, customInput, target, generateSteps]);

  const playerRef = useRef(player);
  playerRef.current = player;

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') return;
      if (event.code === 'Space') {
        event.preventDefault();
        playerRef.current.togglePlay();
      } else if (event.code === 'ArrowRight') {
        event.preventDefault();
        playerRef.current.next();
      } else if (event.code === 'ArrowLeft') {
        event.preventDefault();
        playerRef.current.prev();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const rendererType = useMemo(() => algorithm?.renderer ?? 'array', [algorithm]);

  if (!resolvedId || !algorithm) {
    return <Navigate to="/visualizer" replace />;
  }

  if (slugOrId !== resolvedId && slugOrId !== algorithm.id) {
    return <Navigate to={`/visualizer/${resolvedId}`} replace />;
  }

  return (
    <div className="page-container py-8 pb-24 lg:pb-8">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <Link
          to="/visualizer"
          className="mb-4 inline-flex text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400"
        >
          ← All algorithms
        </Link>

        <div className="mb-6">
          <p className="text-sm capitalize text-slate-500">{ALGORITHM_CATEGORIES[algorithm.category]}</p>
          <h1 className="text-balance text-2xl font-bold text-slate-900 sm:text-3xl dark:text-white">{algorithm.name}</h1>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-300">
            {error}
          </div>
        )}

        <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,320px)_1fr]">
          <div className="order-2 space-y-4 xl:order-1">
            <StatsPanel stats={player.currentStep?.stats} />
            <VariableWatchPanel
              variables={
                player.currentStep?.currentVariables ?? player.currentStep?.variables
              }
            />
            <div className="rounded-2xl border bg-white p-4 dark:bg-slate-800">
              <h2 className="mb-3 text-sm font-semibold text-slate-900 dark:text-white">Data Input</h2>
              <DataInputPanel
                algorithm={algorithm}
                customInput={customInput}
                target={target}
                onCustomInputChange={setCustomInput}
                onTargetChange={setTarget}
                onRandomize={handleRandomize}
                onGenerate={() => generateSteps()}
              />
            </div>
            <div className="rounded-2xl border bg-white p-4 dark:bg-slate-800">
              <h2 className="mb-3 text-sm font-semibold text-slate-900 dark:text-white">Controls</h2>
              <ControlPanel
                playing={player.playing}
                isAtStart={player.isAtStart}
                isAtEnd={player.isAtEnd}
                index={player.index}
                total={player.total}
                speed={player.speed}
                onTogglePlay={player.togglePlay}
                onPrev={player.prev}
                onNext={player.next}
                onReset={player.reset}
                onSpeedChange={player.setSpeed}
              />
            </div>
          </div>

          <div className="order-1 min-w-0 space-y-6 xl:order-2">
            {/* minmax(0, …) lets each track shrink below its content's minimum width. A bare
                `3fr` is really minmax(auto, 3fr), so a wide visualization (many input values)
                used to push the code panel out of the viewport. */}
            <div className="grid min-w-0 grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
              <VisualizerStage
                key={`${resolvedId}-${runKey}`}
                rendererType={rendererType}
                step={player.currentStep}
                className="min-h-[380px] min-w-0 sm:min-h-[480px] lg:min-h-[560px]"
              />
              <CodeSyncPanel
                algorithmId={resolvedId}
                category={algorithm.category}
                algorithmName={algorithm.name}
                currentStep={player.currentStep}
                language={codeLanguage}
                onLanguageChange={setCodeLanguage}
                theme={editorTheme}
                sideBySide
              />
            </div>
            <CodeExplanationPanel
              algorithmName={algorithm.name}
              currentStep={player.currentStep}
            />
          </div>
        </div>

        {player.total > 1 && (
          <div className="mt-4">
            <input
              id="viz-timeline-scrub"
              name="viz-timeline-scrub"
              type="range"
              min={0}
              max={player.total - 1}
              value={player.index}
              onChange={(event) => player.goTo(Number(event.target.value))}
              className="w-full accent-brand-600"
              aria-label="Scrub timeline"
            />
          </div>
        )}

        <div className="mt-4 flex justify-end">
          <Button variant="secondary" size="sm" onClick={handleRandomize}>
            New Random Run
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
