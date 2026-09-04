import { Link } from 'react-router-dom';
import Button from '../../../components/ui/Button';
import MarkdownContent from '../../learning/components/MarkdownContent';

export default function NoteEditor({
  draft,
  linkedTopic,
  linkedProblem,
  isCreating,
  isLoading,
  isSaving,
  isDeleting,
  error,
  saveMessage,
  showPreview,
  onTogglePreview,
  onChange,
  onSave,
  onDelete,
}) {
  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-slate-500">
        Loading note…
      </div>
    );
  }

  const hasNote = isCreating || draft.title || draft.content;

  if (!hasNote) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 p-8 text-center">
        <span className="text-4xl">📝</span>
        <p className="font-medium text-slate-700 dark:text-slate-200">Select or create a note</p>
        <p className="max-w-sm text-sm text-slate-500 dark:text-slate-400">
          Capture study notes in Markdown, link them to topics or problems, and search anytime.
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 px-4 py-3 dark:border-slate-700">
        <div className="flex flex-wrap items-center gap-2">
          {linkedTopic ? (
            <Link
              to={`/learn/${linkedTopic.slug}`}
              className="rounded-full bg-brand-100 px-2.5 py-0.5 text-xs font-medium text-brand-700 hover:underline dark:bg-brand-950 dark:text-brand-300"
            >
              Topic: {linkedTopic.title}
            </Link>
          ) : null}
          {linkedProblem ? (
            <Link
              to={`/problems/${linkedProblem.slug}`}
              className="rounded-full bg-violet-100 px-2.5 py-0.5 text-xs font-medium text-violet-700 hover:underline dark:bg-violet-950 dark:text-violet-300"
            >
              Problem: {linkedProblem.title}
            </Link>
          ) : null}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onTogglePreview}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              showPreview
                ? 'bg-brand-100 text-brand-700 dark:bg-brand-950 dark:text-brand-300'
                : 'text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
            }`}
          >
            {showPreview ? 'Edit' : 'Preview'}
          </button>
          <Button size="sm" onClick={onSave} disabled={isSaving || isDeleting}>
            {isSaving ? 'Saving…' : isCreating ? 'Create' : 'Save'}
          </Button>
          {!isCreating ? (
            <Button
              size="sm"
              variant="danger"
              onClick={onDelete}
              disabled={isSaving || isDeleting}
            >
              {isDeleting ? 'Deleting…' : 'Delete'}
            </Button>
          ) : null}
        </div>
      </div>

      {error ? (
        <div className="mx-4 mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-200">
          {error}
        </div>
      ) : null}

      {saveMessage ? (
        <p className="mx-4 mt-3 text-sm font-medium text-emerald-600 dark:text-emerald-400">
          {saveMessage}
        </p>
      ) : null}

      <div className="flex-1 overflow-auto p-4">
        {showPreview ? (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              {draft.title || 'Untitled'}
            </h2>
            {draft.tags ? (
              <div className="flex flex-wrap gap-2">
                {draft.tags.split(',').map((tag) => {
                  const trimmed = tag.trim();
                  if (!trimmed) return null;
                  return (
                    <span
                      key={trimmed}
                      className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                    >
                      {trimmed}
                    </span>
                  );
                })}
              </div>
            ) : null}
            <MarkdownContent content={draft.content} />
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label htmlFor="note-title" className="mb-1 block text-xs font-semibold uppercase text-slate-500">
                Title
              </label>
              <input
                id="note-title"
                type="text"
                className="input-field"
                placeholder="Note title"
                value={draft.title}
                onChange={(event) => onChange({ title: event.target.value })}
              />
            </div>

            <div>
              <label htmlFor="note-tags" className="mb-1 block text-xs font-semibold uppercase text-slate-500">
                Tags
              </label>
              <input
                id="note-tags"
                type="text"
                className="input-field"
                placeholder="arrays, interview, review"
                value={draft.tags}
                onChange={(event) => onChange({ tags: event.target.value })}
              />
            </div>

            <div>
              <label
                htmlFor="note-content"
                className="mb-1 block text-xs font-semibold uppercase text-slate-500"
              >
                Content (Markdown)
              </label>
              <textarea
                id="note-content"
                className="input-field min-h-[360px] resize-y font-mono text-sm leading-relaxed"
                placeholder="Write notes in Markdown…"
                value={draft.content}
                onChange={(event) => onChange({ content: event.target.value })}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
