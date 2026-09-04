import { Link } from 'react-router-dom';
import { cn } from '../../../utils/cn';
import ProgressBadge from './ProgressBadge';
import BookmarkButton from '../../bookmarks/components/BookmarkButton';

const difficultyColors = {
  beginner: 'text-emerald-600 dark:text-emerald-400',
  intermediate: 'text-amber-600 dark:text-amber-400',
  advanced: 'text-rose-600 dark:text-rose-400',
};

export default function TopicCard({ topic }) {
  return (
    <Link to={`/learn/${topic.slug}`} className="card-interactive group flex flex-col">
      <div className="mb-3 flex items-start justify-between gap-2">
        <h3 className="font-semibold tracking-tight text-slate-900 transition-colors group-hover:text-brand-600 dark:text-white dark:group-hover:text-brand-400">
          {topic.title}
        </h3>
        <div className="flex shrink-0 items-center gap-2">
          <BookmarkButton targetType="topic" targetId={topic.id} targetSlug={topic.slug} />
          <ProgressBadge status={topic.progress?.status} />
        </div>
      </div>

      <div className="mt-auto flex flex-wrap items-center gap-2">
        <span className={cn('chip capitalize font-medium', difficultyColors[topic.difficulty])}>
          {topic.difficulty}
        </span>
        <span className="chip">~{topic.estimatedMinutes} min</span>
        <span className="chip text-brand-600 dark:text-brand-400">+{topic.xpReward} XP</span>
      </div>
    </Link>
  );
}
