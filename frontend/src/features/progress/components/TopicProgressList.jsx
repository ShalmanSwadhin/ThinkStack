import { Link } from 'react-router-dom';
import Card, { CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/Card';
import ProgressBadge from '../../learning/components/ProgressBadge';

export default function TopicProgressList({ topicDetails }) {
  const items = topicDetails.slice(0, 12);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Topic Progress</CardTitle>
        <CardDescription>Your latest topic activity</CardDescription>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-500 dark:text-slate-400">
            Start reading topics to track progress here.
          </p>
        ) : (
          <ul className="space-y-2">
            {items.map((topic) => (
              <li key={topic.slug}>
                <Link
                  to={`/learn/${topic.slug}`}
                  className="flex items-center justify-between gap-3 rounded-xl border px-4 py-3 transition-colors hover:border-brand-300 hover:bg-brand-50 dark:hover:border-brand-700 dark:hover:bg-brand-950"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium text-slate-900 dark:text-white">
                      {topic.title}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {topic.categoryLabel}
                      {topic.timeSpentMinutes > 0 ? ` · ${topic.timeSpentMinutes} min` : ''}
                    </p>
                  </div>
                  <ProgressBadge status={topic.status} />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
