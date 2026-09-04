import Card, { CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/Card';

export default function BadgeGrid({ badges = [] }) {
  const earned = badges.filter((badge) => badge.earned);
  const locked = badges.filter((badge) => !badge.earned);

  return (
    <div className="space-y-6">
      <Card elevated>
        <CardHeader>
          <CardTitle>Earned Badges</CardTitle>
          <CardDescription>
            {earned.length} of {badges.length} unlocked
          </CardDescription>
        </CardHeader>
        <CardContent>
          {earned.length === 0 ? (
            <div className="empty-state border-0 bg-transparent py-6">
              <span className="empty-state-icon" aria-hidden="true">
                🏅
              </span>
              <p className="empty-state-title">No badges yet</p>
              <p className="empty-state-desc">
                Complete topics, problems, and quizzes to earn your first badge.
              </p>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {earned.map((badge) => (
                <div
                  key={badge.id}
                  className="flex items-start gap-3 rounded-xl border border-emerald-200/80 bg-gradient-to-br from-emerald-50 to-white p-4 shadow-soft dark:border-emerald-900/50 dark:from-emerald-950/40 dark:to-slate-800/50"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-xl dark:bg-emerald-900/50">
                    {badge.icon}
                  </span>
                  <div>
                    <p className="font-semibold tracking-tight text-slate-900 dark:text-white">{badge.name}</p>
                    <p className="mt-0.5 text-sm text-slate-600 dark:text-slate-400">{badge.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Locked Badges</CardTitle>
          <CardDescription>Milestones still to achieve</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {locked.map((badge) => (
              <div
                key={badge.id}
                className="flex items-start gap-3 rounded-xl border border-dashed border-slate-200/80 bg-slate-50/50 p-4 opacity-75 dark:border-slate-700/60 dark:bg-slate-800/30"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-xl grayscale dark:bg-slate-700/50">
                  {badge.icon}
                </span>
                <div>
                  <p className="font-medium text-slate-700 dark:text-slate-200">{badge.name}</p>
                  <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{badge.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
