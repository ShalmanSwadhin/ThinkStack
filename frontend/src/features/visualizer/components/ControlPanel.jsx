import Button from '../../../components/ui/Button';

export default function ControlPanel({
  playing,
  isAtStart,
  isAtEnd,
  index,
  total,
  speed,
  onTogglePlay,
  onPrev,
  onNext,
  onReset,
  onSpeedChange,
}) {
  return (
    <div className="control-panel space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" onClick={onTogglePlay} aria-label={playing ? 'Pause' : 'Play'}>
          {playing ? '⏸ Pause' : isAtEnd ? '↺ Replay' : '▶ Play'}
        </Button>
        <Button size="sm" variant="secondary" onClick={onPrev} disabled={isAtStart}>
          ← Prev
        </Button>
        <Button size="sm" variant="secondary" onClick={onNext} disabled={isAtEnd}>
          Next →
        </Button>
        <Button size="sm" variant="ghost" onClick={onReset}>
          Reset
        </Button>
        <span className="chip w-full sm:ml-auto sm:w-auto">
          Step {total ? index + 1 : 0} / {total}
        </span>
      </div>

      <div>
        <label htmlFor="viz-speed" className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Speed · {speed}ms
        </label>
        <input
          id="viz-speed"
          name="viz-speed"
          type="range"
          min={150}
          max={2000}
          step={50}
          value={speed}
          onChange={(event) => onSpeedChange(Number(event.target.value))}
          className="range-brand"
        />
      </div>

      <p className="text-xs text-slate-400 dark:text-slate-500">
        Keyboard: <kbd className="chip px-1.5 py-0.5">Space</kbd> play/pause · <kbd className="chip px-1.5 py-0.5">←</kbd> previous · <kbd className="chip px-1.5 py-0.5">→</kbd> next
      </p>
    </div>
  );
}
