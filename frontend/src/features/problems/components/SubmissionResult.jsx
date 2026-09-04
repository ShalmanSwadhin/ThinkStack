import { VERDICT_COLORS, VERDICT_LABELS } from '../../playground/constants';

export default function SubmissionResult({ submission, xpAwarded }) {
  if (!submission) return null;

  const verdictClass = VERDICT_COLORS[submission.verdict] ?? VERDICT_COLORS.pending;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
      <div className="flex flex-wrap items-center gap-3">
        <span className={`text-sm font-semibold ${verdictClass}`}>
          {VERDICT_LABELS[submission.verdict] ?? submission.verdict}
        </span>
        <span className="text-sm text-slate-500 dark:text-slate-400">
          {submission.testCasesPassed}/{submission.testCasesTotal} test cases passed
        </span>
        {xpAwarded > 0 && (
          <span className="text-sm font-medium text-brand-600 dark:text-brand-400">
            +{xpAwarded} XP
          </span>
        )}
      </div>
      {submission.stderr ? (
        <pre className="mt-3 whitespace-pre-wrap rounded-lg bg-slate-900 p-3 font-mono text-xs text-red-300">
          {submission.stderr}
        </pre>
      ) : null}
    </div>
  );
}
