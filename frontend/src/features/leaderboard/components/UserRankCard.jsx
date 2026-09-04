import Card, { CardContent } from '../../../components/ui/Card';
import { cn } from '../../../utils/cn';

export default function UserRankCard({ currentUser, period }) {
  if (!currentUser) return null;

  const periodXp =
    period === 'weekly' ? (currentUser.weeklyXp ?? 0) : (currentUser.xp ?? currentUser.totalXp ?? 0);
  const rankLabel = currentUser.rank ? `#${currentUser.rank}` : 'Unranked';

  return (
    <Card
      glass
      className={cn(
        'border-brand-200 bg-brand-50/70 dark:border-brand-900 dark:bg-brand-950/40',
        !currentUser.inTopList && 'border-dashed'
      )}
    >
      <CardContent className="flex flex-col gap-4 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-brand-700 dark:text-brand-300">Your rank</p>
          <p className="text-3xl font-bold text-slate-900 dark:text-white">{rankLabel}</p>
          {!currentUser.inTopList && currentUser.rank && (
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              You are outside the top 100 — keep learning to climb!
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">
              {period === 'weekly' ? 'Weekly XP' : 'Total XP'}
            </p>
            <p className="text-xl font-semibold text-slate-900 dark:text-white">{periodXp}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">Level</p>
            <p className="text-xl font-semibold text-slate-900 dark:text-white">
              {currentUser.level ?? 0}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">Total XP</p>
            <p className="text-xl font-semibold text-slate-900 dark:text-white">
              {currentUser.totalXp ?? 0}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">Solved</p>
            <p className="text-xl font-semibold text-slate-900 dark:text-white">
              {currentUser.problemsSolved ?? 0}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
