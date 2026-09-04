import ModuleSection from './ModuleSection';

export default function CurriculumContent({ curriculumGroups }) {
  return (
    <div className="space-y-10">
      {curriculumGroups.map((group) => (
        <section key={group.category} id={`category-${group.category}`} className="scroll-mt-24">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">{group.label}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {group.modules.length} modules ·{' '}
              {group.modules.reduce((n, m) => n + m.total, 0)} lessons
            </p>
          </div>
          <div className="space-y-8">
            {group.modules.map((module) => (
              <ModuleSection key={module.id} module={module} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
