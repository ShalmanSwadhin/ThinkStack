import { VERDICT_COLORS, VERDICT_LABELS } from '../constants';

export default function OutputPanel({ output, isRunning, mockMode }) {
  if (isRunning) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-slate-500 dark:text-slate-400">
        Running code…
      </div>
    );
  }

  if (!output) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-slate-500 dark:text-slate-400">
        Run your code to see output here
      </div>
    );
  }

  const verdictClass = VERDICT_COLORS[output.verdict] ?? VERDICT_COLORS.pending;

  return (
    <div className="flex h-full flex-col gap-3 overflow-auto p-4">
      {mockMode && (
        <div className="badge badge-warning w-fit" title="No real compiler is configured — this result is simulated and does not verify your code actually works.">
          Mock execution — result is simulated, not verified
        </div>
      )}
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <span className="font-medium text-slate-600 dark:text-slate-300">Verdict:</span>
        <span className={`font-semibold ${verdictClass}`}>
          {VERDICT_LABELS[output.verdict] ?? output.verdict}
        </span>
        {output.executionTime != null && (
          <span className="text-slate-500 dark:text-slate-400">
            {output.executionTime}s
          </span>
        )}
        {output.memoryUsed != null && (
          <span className="text-slate-500 dark:text-slate-400">
            {output.memoryUsed} KB
          </span>
        )}
      </div>

      <div>
        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">stdout</p>
        <pre className="min-h-[4rem] whitespace-pre-wrap rounded-lg bg-slate-900 p-3 font-mono text-xs text-emerald-300">
          {output.stdout || '(empty)'}
        </pre>
      </div>

      {output.stderr ? (
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">stderr</p>
          <pre className="min-h-[3rem] whitespace-pre-wrap rounded-lg bg-slate-900 p-3 font-mono text-xs text-red-300">
            {output.stderr}
          </pre>
        </div>
      ) : null}
    </div>
  );
}
