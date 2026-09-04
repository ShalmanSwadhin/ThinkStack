function formatDate(value) {
  if (!value) return '';
  return new Date(value).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function NoteSidebar({
  notes,
  activeNoteId,
  isLoading,
  onSelect,
  onNewNote,
}) {
  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-slate-200 p-3 dark:border-slate-700">
        <button
          type="button"
          onClick={onNewNote}
          className="btn-primary w-full text-sm"
        >
          + New Note
        </button>
      </div>

      <div className="flex-1 overflow-auto p-2">
        {isLoading ? (
          <div className="space-y-2 p-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="h-16 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800"
              />
            ))}
          </div>
        ) : notes.length === 0 ? (
          <p className="p-3 text-center text-sm text-slate-500 dark:text-slate-400">
            No notes yet. Create your first study note.
          </p>
        ) : (
          <ul className="space-y-2">
            {notes.map((note) => (
              <li key={note.id}>
                <button
                  type="button"
                  onClick={() => onSelect(note.id)}
                  className={`w-full rounded-xl border p-3 text-left transition-colors ${
                    activeNoteId === note.id
                      ? 'border-brand-500 bg-brand-50 dark:border-brand-400 dark:bg-brand-950/30'
                      : 'border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <p className="truncate font-medium text-slate-800 dark:text-slate-100">
                    {note.title}
                  </p>
                  <p className="mt-1 line-clamp-2 text-xs text-slate-500 dark:text-slate-400">
                    {note.content?.slice(0, 80) || 'No content'}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-1 text-[10px] text-slate-400">
                    {note.topic ? (
                      <span className="rounded bg-slate-100 px-1.5 py-0.5 dark:bg-slate-800">
                        {note.topic.title}
                      </span>
                    ) : null}
                    {note.problem ? (
                      <span className="rounded bg-slate-100 px-1.5 py-0.5 dark:bg-slate-800">
                        {note.problem.title}
                      </span>
                    ) : null}
                    <span>{formatDate(note.updatedAt)}</span>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
