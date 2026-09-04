import Card, { CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/Card';

export default function StreakCard({ streak }) {
  return (
    <Card glass>
      <CardHeader>
        <CardTitle>Learning Streak</CardTitle>
        <CardDescription>Consecutive days with learning activity</CardDescription>
      </CardHeader>
      <CardContent className="flex items-end justify-between gap-4">
        <div>
          <p className="text-4xl font-bold text-brand-600">{streak?.current ?? 0}</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">current streak</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-semibold text-slate-700 dark:text-slate-200">
            {streak?.longest ?? 0}
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400">longest</p>
        </div>
      </CardContent>
    </Card>
  );
}
