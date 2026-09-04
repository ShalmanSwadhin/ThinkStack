const items = [
  { key: 'totalUsers', label: 'Users', icon: '👥' },
  { key: 'activeUsers', label: 'Active users', icon: '🟢' },
  { key: 'publishedTopics', label: 'Topics', icon: '📚' },
  { key: 'publishedProblems', label: 'Problems', icon: '🧩' },
  { key: 'publishedQuizzes', label: 'Quizzes', icon: '✅' },
  { key: 'totalContests', label: 'Contests', icon: '⚡' },
  { key: 'totalSubmissions', label: 'Submissions', icon: '📤' },
  { key: 'suspendedUsers', label: 'Suspended', icon: '🚫' },
];

export default function AdminOverviewCards({ overview }) {
  if (!overview) return null;

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <div key={item.key} className="stat-card">
          <div className="flex items-start justify-between gap-2">
            <p className="stat-label">{item.label}</p>
            <span className="text-sm opacity-50" aria-hidden="true">
              {item.icon}
            </span>
          </div>
          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            {overview[item.key] ?? 0}
          </p>
        </div>
      ))}
    </div>
  );
}
