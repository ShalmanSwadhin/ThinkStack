import Button from '../../../components/ui/Button';

function formatDate(value) {
  if (!value) return '';
  return new Date(value).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function SnippetSidebar({
  snippets,
  history,
  activeTab,
  onTabChange,
  activeSnippetId,
  onLoadSnippet,
  onDeleteSnippet,
  onLoadHistoryItem,
}) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex border-b border-slate-200 dark:border-slate-700">
        {[
          { id: 'snippets', label: 'Saved' },
          { id: 'history', label: 'History' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            className={`flex-1 px-3 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'border-b-2 border-brand-600 text-brand-600 dark:text-brand-400'
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-auto p-2">
        {activeTab === 'snippets' ? (
          snippets.length === 0 ? (
            <p className="p-3 text-center text-sm text-slate-500 dark:text-slate-400">
              No saved snippets yet
            </p>
          ) : (
            <ul className="space-y-2">
              {snippets.map((snippet) => (
                <li key={snippet.id}>
                  <div
                    className={`rounded-xl border p-3 transition-colors ${
                      activeSnippetId === snippet.id
                        ? 'border-brand-500 bg-brand-50 dark:border-brand-400 dark:bg-brand-950/30'
                        : 'border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <button
                      type="button"
                      className="w-full text-left"
                      onClick={() => onLoadSnippet(snippet)}
                    >
                      <p className="truncate font-medium text-slate-800 dark:text-slate-100">
                        {snippet.title}
                      </p>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        {snippet.language} · {formatDate(snippet.updatedAt)}
                      </p>
                    </button>
                    <div className="mt-2 flex justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700 dark:text-red-400"
                        onClick={() => onDeleteSnippet(snippet.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )
        ) : history.length === 0 ? (
          <p className="p-3 text-center text-sm text-slate-500 dark:text-slate-400">
            No runs yet
          </p>
        ) : (
          <ul className="space-y-2">
            {history.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => onLoadHistoryItem(item)}
                  className="w-full rounded-xl border border-slate-200 p-3 text-left transition-colors hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800/50"
                >
                  <p className="truncate font-medium capitalize text-slate-800 dark:text-slate-100">
                    {item.language} · {item.verdict.replace('_', ' ')}
                  </p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    {formatDate(item.createdAt)}
                  </p>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
