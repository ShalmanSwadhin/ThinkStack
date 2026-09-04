export default function TraceOutputConsole({ output }) {
  return (
    <div className="overflow-hidden rounded-xl border dark:border-slate-700">
      <div className="border-b bg-slate-100 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:bg-slate-900">
        Output Console
      </div>
      <pre className="min-h-[120px] whitespace-pre-wrap bg-slate-950 p-4 font-mono text-sm text-emerald-300">
        {(output ?? []).join('\n') || 'Program output will appear here.'}
      </pre>
    </div>
  );
}
