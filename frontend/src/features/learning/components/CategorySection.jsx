import TopicCard from './TopicCard';

export default function CategorySection({ category }) {
  if (!category?.topics?.length) return null;

  return (
    <section className="mb-10">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">{category.label}</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {category.topics.filter((t) => t.progress?.status === 'completed').length} of{' '}
            {category.topics.length} completed
          </p>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {category.topics.map((topic) => (
          <TopicCard key={topic.id} topic={topic} />
        ))}
      </div>
    </section>
  );
}
