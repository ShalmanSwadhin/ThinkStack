export default function CallStackPanel({ callStack }) {
  const frames = callStack ?? [];

  return (
    <div className="overflow-hidden rounded-xl border dark:border-slate-700">
      <div className="border-b bg-slate-100 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:bg-slate-900">
        Call Stack
      </div>
      {frames.length ? (
        <ol className="space-y-2 px-4 py-3 text-sm">
          {frames.map((frame, index) => (
            <li
              key={`${frame.name}-${index}`}
              className="rounded-lg bg-slate-50 px-3 py-2 font-mono dark:bg-slate-900"
            >
              {frame.name}() <span className="text-slate-400">@ line {frame.line}</span>
            </li>
          ))}
        </ol>
      ) : (
        <p className="px-4 py-6 text-sm text-slate-500">Call stack is empty.</p>
      )}
    </div>
  );
}
