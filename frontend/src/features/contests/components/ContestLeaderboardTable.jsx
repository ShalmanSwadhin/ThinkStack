import { cn } from '../../../utils/cn';

export default function ContestLeaderboardTable({ entries, currentUserId, compact = false }) {
  if (!entries?.length) {
    return (
      <p className="text-sm text-slate-500 dark:text-slate-400">
        No standings yet. Solve problems to climb the board.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className={cn('min-w-full text-left text-sm', compact && 'text-xs')}>
        <thead className="text-xs uppercase tracking-wide text-slate-500">
          <tr>
            <th className="pb-2 pr-4 font-medium">Rank</th>
            <th className="pb-2 pr-4 font-medium">User</th>
            <th className="pb-2 pr-4 font-medium">Score</th>
            <th className="pb-2 font-medium">Penalty</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <tr
              key={`${entry.userId}-${entry.rank}`}
              className={cn(
                'border-t border-slate-100 dark:border-slate-800',
                entry.userId === currentUserId &&
                  'bg-brand-50/70 dark:bg-brand-950/30'
              )}
            >
              <td className="py-2 pr-4 font-semibold">#{entry.rank}</td>
              <td className="py-2 pr-4">@{entry.username}</td>
              <td className="py-2 pr-4">{entry.score}</td>
              <td className="py-2">{entry.penaltyMinutes}m</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
