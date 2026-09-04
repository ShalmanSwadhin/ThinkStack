import { Link } from 'react-router-dom';
import { cn } from '../../../utils/cn';

export default function QuizCard({ quiz }) {
  return (
    <Link to={`/quizzes/${quiz.id}`} className="card-interactive group flex flex-col">
      <div className="mb-2 flex items-start justify-between gap-3">
        <h3 className="font-semibold tracking-tight text-slate-900 transition-colors group-hover:text-brand-600 dark:text-white dark:group-hover:text-brand-400">
          {quiz.title}
        </h3>
        {quiz.passed ? <span className="badge-success shrink-0">Passed</span> : null}
      </div>

      {quiz.topic ? (
        <p className="mb-3 text-sm text-slate-500 dark:text-slate-400">{quiz.topic.title}</p>
      ) : null}

      <div className="mt-auto flex flex-wrap items-center gap-2">
        <span className="chip">{quiz.questionCount} questions</span>
        <span className="chip">{quiz.passingScore}% to pass</span>
        {quiz.timeLimitMinutes ? <span className="chip">{quiz.timeLimitMinutes} min</span> : null}
        <span className="chip text-brand-600 dark:text-brand-400">+{quiz.xpReward} XP</span>
      </div>

      {quiz.bestScore != null && (
        <p className={cn('mt-3 text-xs font-medium', quiz.passed ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500')}>
          Best score: {quiz.bestScore}%
        </p>
      )}
    </Link>
  );
}
