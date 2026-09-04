import { Link } from 'react-router-dom';
import { cn } from '../../../utils/cn';

const statusStyles = {
  solved: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
  attempted: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
  unsolved: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
};

export default function ContestProblemList({ contestSlug, problems, disabled = false }) {
  if (!problems?.length) {
    return (
      <p className="text-sm text-slate-500 dark:text-slate-400">No problems assigned yet.</p>
    );
  }

  return (
    <div className="space-y-2">
      {problems.map((problem) => {
        const content = (
          <div
            className={cn(
              'flex items-center justify-between rounded-xl border px-4 py-3 transition-colors',
              disabled
                ? 'cursor-not-allowed opacity-60'
                : 'hover:border-brand-300 hover:bg-brand-50/50 dark:hover:border-brand-800 dark:hover:bg-brand-950/20'
            )}
          >
            <div>
              <p className="font-medium text-slate-900 dark:text-white">{problem.title}</p>
              <p className="text-xs text-slate-500">
                {problem.difficulty} · {problem.points} pts
              </p>
            </div>
            <span
              className={cn(
                'rounded-full px-2 py-0.5 text-xs font-medium capitalize',
                statusStyles[problem.status] || statusStyles.unsolved
              )}
            >
              {problem.status}
            </span>
          </div>
        );

        if (disabled) {
          return <div key={problem.id}>{content}</div>;
        }

        return (
          <Link key={problem.id} to={`/contests/${contestSlug}/problems/${problem.slug}`}>
            {content}
          </Link>
        );
      })}
    </div>
  );
}
