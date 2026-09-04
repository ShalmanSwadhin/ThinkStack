import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '../../../utils/cn';
import useGlobalSearch from '../useGlobalSearch';

const TYPE_LABELS = {
  topic: 'Topic',
  problem: 'Problem',
  note: 'Note',
};

const TYPE_ICONS = {
  topic: '📚',
  problem: '💻',
  note: '📝',
};

function ResultSection({ title, items, emptyLabel, onNavigate }) {
  if (!items?.length) {
    return null;
  }

  return (
    <div className="py-2">
      <p className="px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
        {title}
      </p>
      <ul>
        {items.map((item) => (
          <li key={`${title}-${item.id}`}>
            <Link
              to={item.href}
              onClick={onNavigate}
              className="flex items-start gap-3 px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/80"
            >
              <span className="mt-0.5 text-base" aria-hidden="true">
                {TYPE_ICONS[item.type ?? title.toLowerCase().slice(0, -1)] ?? '🔎'}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-slate-900 dark:text-white">
                  {item.title}
                </span>
                <span className="block truncate text-xs text-slate-500 dark:text-slate-400">
                  {item.subtitle || item.categoryLabel || item.difficulty}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SearchDropdown({
  query,
  results,
  suggestions,
  history,
  isLoading,
  error,
  onNavigate,
  onSelectHistory,
  onClearHistory,
  onRemoveHistoryEntry,
}) {
  const hasSuggestions = suggestions.length > 0;
  const hasResults =
    results &&
    (results.topics?.length || results.problems?.length || results.notes?.length);

  if (!query.trim()) {
    if (history?.length) {
      return (
        <div className="max-h-[min(70vh,420px)] overflow-y-auto py-1">
          <div className="flex items-center justify-between px-3 py-1">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              Recent searches
            </p>
            <button
              type="button"
              onClick={onClearHistory}
              className="text-[11px] font-medium text-brand-600 hover:underline dark:text-brand-400"
            >
              Clear
            </button>
          </div>
          <ul>
            {history.map((entry) => (
              <li key={entry.id} className="flex items-center gap-2 px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/80">
                <button
                  type="button"
                  className="min-w-0 flex-1 truncate text-left text-sm text-slate-700 dark:text-slate-200"
                  onClick={() => onSelectHistory(entry.query)}
                >
                  {entry.query}
                </button>
                <button
                  type="button"
                  aria-label="Remove search history entry"
                  className="text-xs text-slate-400 hover:text-slate-600"
                  onClick={() => onRemoveHistoryEntry(entry.id)}
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        </div>
      );
    }

    return (
      <div className="px-4 py-6 text-center text-sm text-slate-500 dark:text-slate-400">
        Search topics, problems, and your notes
      </div>
    );
  }

  if (query.trim().length < 2) {
    return (
      <div className="px-4 py-6 text-center text-sm text-slate-500 dark:text-slate-400">
        Type at least 2 characters
      </div>
    );
  }

  if (isLoading && !hasSuggestions && !hasResults) {
    return (
      <div className="space-y-2 p-3">
        {[1, 2, 3].map((item) => (
          <div key={item} className="h-10 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 py-4 text-sm text-red-600 dark:text-red-300">{error}</div>
    );
  }

  if (hasResults) {
    const topicItems = results.topics.map((item) => ({
      ...item,
      type: 'topic',
      subtitle: item.categoryLabel,
    }));
    const problemItems = results.problems.map((item) => ({
      ...item,
      type: 'problem',
      subtitle: item.difficulty,
    }));
    const noteItems = results.notes.map((item) => ({
      ...item,
      type: 'note',
      subtitle: item.topic?.title || item.problem?.title || 'Personal note',
    }));

    if (!topicItems.length && !problemItems.length && !noteItems.length) {
      return (
        <div className="px-4 py-6 text-center text-sm text-slate-500 dark:text-slate-400">
          No results for &ldquo;{query}&rdquo;
        </div>
      );
    }

    return (
      <div className="max-h-[min(70vh,420px)] overflow-y-auto py-1">
        <ResultSection title="Topics" items={topicItems} onNavigate={onNavigate} />
        <ResultSection title="Problems" items={problemItems} onNavigate={onNavigate} />
        <ResultSection title="Notes" items={noteItems} onNavigate={onNavigate} />
      </div>
    );
  }

  if (hasSuggestions) {
    return (
      <div className="max-h-[min(70vh,420px)] overflow-y-auto py-1">
        <p className="px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
          Suggestions
        </p>
        <ul>
          {suggestions.map((item) => (
            <li key={`${item.type}-${item.id}`}>
              <Link
                to={item.href}
                onClick={onNavigate}
                className="flex items-start gap-3 px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/80"
              >
                <span className="mt-0.5 text-base" aria-hidden="true">
                  {TYPE_ICONS[item.type]}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-slate-900 dark:text-white">
                    {item.title}
                  </span>
                  <span className="block truncate text-xs text-slate-500 dark:text-slate-400">
                    {TYPE_LABELS[item.type]} · {item.subtitle}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 text-center text-sm text-slate-500 dark:text-slate-400">
      No results for &ldquo;{query}&rdquo;
    </div>
  );
}

export default function GlobalSearchBar({ className }) {
  const containerRef = useRef(null);
  const {
    query,
    results,
    suggestions,
    history,
    isLoading,
    error,
    isOpen,
    updateQuery,
    submitSearch,
    selectHistoryQuery,
    clearHistory,
    removeHistoryEntry,
    openSearch,
    closeSearch,
    resetSearch,
  } = useGlobalSearch();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        closeSearch();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, closeSearch]);

  const handleNavigate = () => {
    resetSearch();
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    openSearch();
    submitSearch();
  };

  return (
    <div ref={containerRef} className={cn('relative w-full', className)}>
      <form onSubmit={handleSubmit} className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">
          🔎
        </span>
        <input
          id="global-search"
          name="q"
          type="search"
          value={query}
          onChange={(event) => {
            openSearch();
            updateQuery(event.target.value, 'suggest');
          }}
          onFocus={openSearch}
          placeholder="Search topics, problems, notes…"
          className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm text-slate-900 outline-none ring-brand-500 placeholder:text-slate-400 focus:border-brand-400 focus:bg-white focus:ring-2 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:bg-slate-950"
          aria-label="Global search"
          aria-expanded={isOpen}
          aria-controls="global-search-results"
          autoComplete="off"
        />
      </form>

      {isOpen ? (
        <div
          id="global-search-results"
          className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-50 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-950"
        >
          <SearchDropdown
            query={query}
            results={results}
            suggestions={suggestions}
            history={history}
            isLoading={isLoading}
            error={error}
            onNavigate={handleNavigate}
            onSelectHistory={(historyQuery) => {
              selectHistoryQuery(historyQuery);
              openSearch();
            }}
            onClearHistory={clearHistory}
            onRemoveHistoryEntry={removeHistoryEntry}
          />
        </div>
      ) : null}
    </div>
  );
}
