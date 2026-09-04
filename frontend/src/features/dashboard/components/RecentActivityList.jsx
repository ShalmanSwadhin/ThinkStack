import { Link } from 'react-router-dom';
import Card, { CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/Card';

const verdictStyles = {
  accepted: 'text-emerald-600 dark:text-emerald-400',
  wrong_answer: 'text-rose-600 dark:text-rose-400',
  tle: 'text-amber-600 dark:text-amber-400',
  runtime_error: 'text-orange-600 dark:text-orange-400',
  compile_error: 'text-orange-600 dark:text-orange-400',
  pending: 'text-slate-500 dark:text-slate-400',
};

const formatDate = (value) => {
  const date = new Date(value);
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatVerdict = (verdict) =>
  verdict?.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase()) ?? 'Pending';

export default function RecentActivityList({ activities }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Your latest submissions and quiz scores</CardDescription>
      </CardHeader>
      <CardContent>
        {!activities?.length ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <span className="text-4xl">📭</span>
            <p className="mt-3 font-medium text-slate-600 dark:text-slate-300">No activity yet</p>
            <p className="mt-1 text-sm text-slate-400">
              Start learning or solve your first problem to see activity here.
            </p>
            <Link
              to="/learn"
              className="mt-4 text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400"
            >
              Explore topics →
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100 dark:divide-slate-700">
            {activities.map((item) => (
              <li key={`${item.type}-${item.id}`} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                <span className="mt-0.5 text-xl" aria-hidden="true">
                  {item.type === 'quiz' ? '✅' : '💻'}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-slate-900 dark:text-white">{item.title}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {item.type === 'quiz' ? (
                      <>
                        Score: {item.score}% · {item.passed ? 'Passed' : 'Failed'}
                      </>
                    ) : (
                      <span className={verdictStyles[item.verdict] ?? verdictStyles.pending}>
                        {formatVerdict(item.verdict)}
                        {item.language ? ` · ${item.language}` : ''}
                      </span>
                    )}
                  </p>
                </div>
                <time className="shrink-0 text-xs text-slate-400" dateTime={item.createdAt}>
                  {formatDate(item.createdAt)}
                </time>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
