import { Link } from 'react-router-dom';
import Card, { CardContent } from '../../../components/ui/Card';
import { cn } from '../../../utils/cn';

const statusStyles = {
  scheduled: 'badge-info',
  active: 'badge-success',
  completed: 'badge-neutral',
  cancelled: 'badge-danger',
};

export default function ContestCard({ contest }) {
  return (
    <Link to={`/contests/${contest.slug}`} className="block h-full">
      <Card glass className="h-full">
        <CardContent className="pt-4">
          <div className="mb-3 flex items-start justify-between gap-3">
            <div>
              <h3 className="font-semibold tracking-tight text-slate-900 dark:text-white">{contest.title}</h3>
              <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                {contest.description}
              </p>
            </div>
            <span className={cn('shrink-0 capitalize', statusStyles[contest.status] || statusStyles.scheduled)}>
              {contest.status}
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="chip">{contest.problemCount} problems</span>
            <span className="chip">{new Date(contest.startTime).toLocaleString()}</span>
            {contest.isRegistered && <span className="badge-brand">Registered</span>}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
