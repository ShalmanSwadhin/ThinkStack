import TopicCard from './TopicCard';
import { ModuleJumpLink } from './CurriculumIndex';

export default function ModuleSection({ module }) {
  if (!module?.topics?.length) return null;

  return (
    <section id={`module-${module.id}`} className="scroll-mt-6 mb-8 last:mb-0">
      <div className="mb-3 flex flex-wrap items-end justify-between gap-2 border-b border-slate-200 pb-2 dark:border-slate-700">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{module.title}</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {module.completed} of {module.total} lessons completed
          </p>
        </div>
        <ModuleJumpLink moduleId={module.id} firstLessonSlug={module.firstLessonSlug} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {module.topics.map((topic) => (
          <TopicCard key={topic.id} topic={topic} />
        ))}
      </div>
    </section>
  );
}
