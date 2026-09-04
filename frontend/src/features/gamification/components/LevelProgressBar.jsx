import Card, { CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/Card';

export default function LevelProgressBar({ levelProgress, xp }) {
  if (!levelProgress) return null;

  return (
    <Card
      className="overflow-hidden border-brand-200/60 bg-gradient-to-br from-brand-50 via-white to-indigo-50/50 dark:border-brand-900/40 dark:from-brand-950/80 dark:via-slate-800/90 dark:to-slate-900/50"
      elevated
    >
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <CardTitle>Level {levelProgress.currentLevel}</CardTitle>
          <span className="badge-brand">+{levelProgress.nextLevel - levelProgress.currentLevel} to go</span>
        </div>
        <CardDescription>
          {xp ?? 0} total XP · {levelProgress.xpIntoLevel} / {levelProgress.xpForNextLevel} to level{' '}
          {levelProgress.nextLevel}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${levelProgress.percent}%` }} />
        </div>
        <p className="mt-2.5 text-right text-xs font-medium text-slate-500 dark:text-slate-400">
          {levelProgress.percent}% to next level
        </p>
      </CardContent>
    </Card>
  );
}
