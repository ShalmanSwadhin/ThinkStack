import Card, { CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';

export default function PlaceholderPage({ title, description, icon = '🚧' }) {
  return (
    <div className="page-container py-8">
      <Card className="mx-auto max-w-lg text-center">
        <CardHeader>
          <span className="text-5xl">{icon}</span>
          <CardTitle className="mt-4">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            This module will be implemented in an upcoming milestone.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
