import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '../../../utils/cn';

const QUICK_JUMPS = [
  { label: 'Linear Structures', moduleId: 'linked-lists' },
  { label: 'Trees', moduleId: 'trees-fundamentals' },
  { label: 'Graphs', moduleId: 'graphs-fundamentals' },
  { label: 'Dynamic Programming', moduleId: 'dynamic-programming' },
  { label: 'Interview Prep', moduleId: 'interview-prep-mastery' },
];

function scrollToModule(moduleId) {
  const el = document.getElementById(`module-${moduleId}`);
  if (!el) return;

  const scrollRoot = document.getElementById('app-scroll');
  if (scrollRoot) {
    const offset = el.getBoundingClientRect().top - scrollRoot.getBoundingClientRect().top + scrollRoot.scrollTop - 16;
    scrollRoot.scrollTo({ top: offset, behavior: 'smooth' });
    return;
  }

  el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export default function CurriculumIndex({ curriculumGroups }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');

  const flatModules = useMemo(
    () => curriculumGroups.flatMap((group) => group.modules.map((mod) => ({ ...mod, categoryLabel: group.label }))),
    [curriculumGroups]
  );

  const filteredGroups = useMemo(() => {
    if (activeCategory === 'all') return curriculumGroups;
    return curriculumGroups.filter((group) => group.category === activeCategory);
  }, [activeCategory, curriculumGroups]);

  const indexPanel = (
    <div className="space-y-4">
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          Quick jump
        </p>
        <div className="flex flex-wrap gap-2">
          {QUICK_JUMPS.map((jump) => (
            <button
              key={jump.moduleId}
              type="button"
              onClick={() => {
                scrollToModule(jump.moduleId);
                setIsOpen(false);
              }}
              className="rounded-full border border-brand-200 bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-700 transition-colors hover:bg-brand-100 dark:border-brand-800 dark:bg-brand-950/50 dark:text-brand-300 dark:hover:bg-brand-900/50"
            >
              {jump.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        <FilterChip active={activeCategory === 'all'} onClick={() => setActiveCategory('all')} label="All" />
        {curriculumGroups.map((group) => (
          <FilterChip
            key={group.category}
            active={activeCategory === group.category}
            onClick={() => setActiveCategory(group.category)}
            label={group.label.split(' ')[0]}
          />
        ))}
      </div>

      <nav aria-label="Curriculum index" className="pr-1">
        {filteredGroups.map((group) => (
          <div key={group.category} className="mb-4 last:mb-0">
            <p className="mb-1.5 px-1 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              {group.label}
            </p>
            <ul className="space-y-0.5">
              {group.modules.map((mod) => (
                <li key={mod.id}>
                  <button
                    type="button"
                    onClick={() => {
                      scrollToModule(mod.id);
                      setIsOpen(false);
                    }}
                    className="flex w-full items-start justify-between gap-2 rounded-lg px-2 py-1.5 text-left text-sm text-slate-700 transition-colors hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                  >
                    <span className="line-clamp-2 leading-snug">{mod.title}</span>
                    <span className="shrink-0 text-xs text-slate-400">
                      {mod.completed}/{mod.total}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      <p className="text-xs text-slate-400">
        {flatModules.length} modules · {flatModules.reduce((n, m) => n + m.total, 0)} lessons
      </p>
    </div>
  );

  return (
    <>
      <div className="mb-4 lg:hidden">
        <button
          type="button"
          onClick={() => setIsOpen((open) => !open)}
          className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
        >
          <span>📑 Curriculum index ({flatModules.length} modules)</span>
          <span className="text-slate-400">{isOpen ? '▲' : '▼'}</span>
        </button>
        {isOpen && (
          <div className="mt-2 max-h-[min(70vh,560px)] overflow-y-auto rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
            {indexPanel}
          </div>
        )}
      </div>

      <aside className="hidden lg:block">
        <div className="sticky top-4 flex max-h-[calc(100vh-2rem)] flex-col overflow-hidden rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <h2 className="mb-3 shrink-0 text-sm font-bold text-slate-900 dark:text-white">Curriculum index</h2>
          <div className="min-h-0 flex-1 overflow-y-auto">{indexPanel}</div>
        </div>
      </aside>
    </>
  );
}

function FilterChip({ active, onClick, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-full px-2.5 py-1 text-xs font-medium transition-colors',
        active
          ? 'bg-brand-600 text-white'
          : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
      )}
    >
      {label}
    </button>
  );
}

export function ModuleJumpLink({ moduleId, firstLessonSlug, className }) {
  if (!firstLessonSlug) return null;
  return (
    <Link
      to={`/learn/${firstLessonSlug}`}
      className={cn(
        'text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300',
        className
      )}
    >
      Start module →
    </Link>
  );
}
