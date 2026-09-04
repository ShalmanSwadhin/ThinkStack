import { cn } from '../../../utils/cn';

const rankStyles = {
  1: 'text-amber-500',
  2: 'text-slate-400',
  3: 'text-orange-600',
};

function Avatar({ entry }) {
  if (entry.avatar) {
    return (
      <img
        src={entry.avatar}
        alt=""
        className="h-9 w-9 rounded-full object-cover ring-2 ring-white dark:ring-slate-800"
      />
    );
  }

  const initial = (entry.displayName || entry.username || '?').charAt(0).toUpperCase();
  return (
    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-brand-100 to-brand-200 text-sm font-semibold text-brand-700 ring-2 ring-white dark:from-brand-900 dark:to-brand-950 dark:text-brand-300 dark:ring-slate-800">
      {initial}
    </div>
  );
}

export default function LeaderboardTable({ entries, period, emptyMessage }) {
  if (!entries.length) {
    return (
      <div className="empty-state">
        <span className="empty-state-icon" aria-hidden="true">
          🏆
        </span>
        <p className="empty-state-title">No rankings yet</p>
        <p className="empty-state-desc">
          {emptyMessage || 'Complete topics, quizzes, and problems to earn XP and climb the leaderboard.'}
        </p>
      </div>
    );
  }

  return (
    <div className="data-table-wrap">
      <div className="overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Learner</th>
              <th>Level</th>
              <th>{period === 'weekly' ? 'Weekly XP' : 'XP'}</th>
              <th>Solved</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <tr
                key={entry.userId}
                className={cn(
                  entry.isCurrentUser &&
                    'bg-brand-50/80 dark:bg-brand-950/30 ring-1 ring-inset ring-brand-200 dark:ring-brand-900'
                )}
              >
                <td>
                  <span
                    className={cn(
                      'font-semibold',
                      rankStyles[entry.rank] || 'text-slate-700 dark:text-slate-200'
                    )}
                  >
                    #{entry.rank}
                  </span>
                </td>
                <td>
                  <div className="flex items-center gap-3">
                    <Avatar entry={entry} />
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">
                        {entry.displayName}
                        {entry.isCurrentUser && <span className="badge-brand ml-2">You</span>}
                      </p>
                      <p className="text-xs text-slate-500">@{entry.username}</p>
                    </div>
                  </div>
                </td>
                <td>{entry.level}</td>
                <td className="font-semibold text-slate-900 dark:text-white">{entry.xp}</td>
                <td>{entry.problemsSolved}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
