import Card, { CardContent } from '../../../components/ui/Card';

export default function TopicReaderSkeleton() {
  return (
    <div className="page-container animate-pulse py-8">
      <div className="mb-6 h-4 w-24 rounded bg-slate-200 dark:bg-slate-700" />
      <div className="mb-4 h-10 w-2/3 max-w-lg rounded-lg bg-slate-200 dark:bg-slate-700" />
      <div className="mb-8 h-4 w-1/2 rounded bg-slate-200 dark:bg-slate-700" />
      <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
        <div className="hidden h-80 rounded-xl bg-slate-200 dark:bg-slate-700 lg:block" />
        <div className="space-y-6">
          {Array.from({ length: 4 }).map((_, index) => (
            <Card key={index}>
              <CardContent className="h-40" />
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
