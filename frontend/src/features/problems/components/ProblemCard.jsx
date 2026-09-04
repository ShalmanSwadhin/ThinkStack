import { Link } from 'react-router-dom';
import { cn } from '../../../utils/cn';
import { DIFFICULTY_COLORS, DIFFICULTY_LABELS, STATUS_COLORS, STATUS_LABELS } from '../constants';
import BookmarkButton from '../../bookmarks/components/BookmarkButton';

export default function ProblemCard({ problem }) {
  return (
    <Link to={`/problems/${problem.slug}`} className="card-interactive group flex flex-col">
      <div className="mb-3 flex items-start justify-between gap-3">
        <h3 className="font-semibold tracking-tight text-slate-900 transition-colors group-hover:text-brand-600 dark:text-white dark:group-hover:text-brand-400">
          {problem.title}
        </h3>
        <div className="flex shrink-0 items-center gap-2">
          <BookmarkButton targetType="problem" targetId={problem.id} targetSlug={problem.slug} />
          <span className={cn('badge shrink-0 ring-0', DIFFICULTY_COLORS[problem.difficulty])}>
            {DIFFICULTY_LABELS[problem.difficulty] ?? problem.difficulty}
          </span>
        </div>
      </div>

      <div className="mb-3 flex flex-wrap gap-2">
        {(problem.tags ?? []).slice(0, 3).map((tag) => (
          <span key={tag} className="chip">
            {tag}
          </span>
        ))}
      </div>

      <div className="mt-auto flex flex-wrap items-center gap-2">
        <span className={cn('chip font-medium', STATUS_COLORS[problem.userStatus])}>
          {STATUS_LABELS[problem.userStatus] ?? problem.userStatus}
        </span>
        <span className="chip">{problem.acceptanceRate}% acceptance</span>
        <span className="chip text-brand-600 dark:text-brand-400">+{problem.xpReward} XP</span>
      </div>
    </Link>
  );
}
