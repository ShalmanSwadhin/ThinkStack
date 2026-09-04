import Card, { CardContent } from '../../../components/ui/Card';

export default function StatsPanel({ stats }) {
  const items = [
    { label: 'Comparisons', value: stats?.comparisons ?? 0 },
    { label: 'Swaps', value: stats?.swaps ?? 0 },
    { label: 'Steps', value: stats?.steps ?? 0 },
  ];

  return (
    <Card glass elevated>
      <CardContent className="grid grid-cols-3 gap-2 pt-2 sm:gap-4">
        {items.map((item) => (
          <div key={item.label} className="min-w-0 rounded-xl bg-slate-50/80 px-2 py-3 text-center dark:bg-slate-800/50">
            <p className="truncate text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {item.label}
            </p>
            <p className="mt-1 text-xl font-bold tracking-tight text-brand-600 sm:text-2xl dark:text-brand-400">
              {item.value}
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
