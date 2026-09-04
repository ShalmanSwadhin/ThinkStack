import { useState } from 'react';
import { motion } from 'framer-motion';
import Button from '../components/ui/Button';
import { useNotesPage } from '../features/notes/useNotesPage';
import NoteSidebar from '../features/notes/components/NoteSidebar';
import NoteEditor from '../features/notes/components/NoteEditor';

export default function NotesPage() {
  const notes = useNotesPage();
  const [showPreview, setShowPreview] = useState(false);

  const contextLabel = notes.contextTopic
    ? `Topic: ${notes.contextTopic}`
    : notes.contextProblem
      ? `Problem: ${notes.contextProblem}`
      : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="page-container py-6 pb-24 lg:pb-8"
    >
      <div className="mb-6">
        <h1 className="page-heading">Notes</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Personal study notes linked to topics and problems. Supports Markdown formatting.
        </p>
        {contextLabel ? (
          <p className="mt-2 text-sm text-brand-600 dark:text-brand-400">
            Creating note for {contextLabel}
          </p>
        ) : null}
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <input
          type="search"
          className="input-field min-w-0 w-full sm:max-w-md sm:flex-1"
          placeholder="Search notes…"
          value={notes.filters.search}
          onChange={(event) => notes.updateFilters({ search: event.target.value })}
        />
        <input
          type="text"
          className="input-field min-w-0 w-full sm:max-w-xs"
          placeholder="Filter by tag"
          value={notes.filters.tag}
          onChange={(event) => notes.updateFilters({ tag: event.target.value })}
        />
        {(notes.filters.topicSlug || notes.filters.problemSlug) && (
          <Button
            variant="secondary"
            size="sm"
            onClick={() =>
              notes.updateFilters({ topicSlug: '', problemSlug: '', search: '', tag: '' })
            }
          >
            Clear filters
          </Button>
        )}
      </div>

      {notes.listError && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-300">
          <span>{notes.listError}</span>
          <Button size="sm" variant="secondary" onClick={notes.fetchNotes}>
            Retry
          </Button>
        </div>
      )}

      <div className="grid min-h-[640px] min-w-0 gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="glass-card min-h-[320px] overflow-hidden lg:min-h-[640px]">
          <NoteSidebar
            notes={notes.notes}
            activeNoteId={notes.activeNoteId}
            isLoading={notes.isLoadingList}
            onSelect={notes.selectNote}
            onNewNote={notes.startNewNote}
          />
        </aside>

        <section className="glass-card min-h-[640px] overflow-hidden">
          <NoteEditor
            draft={notes.draft}
            linkedTopic={notes.linkedTopic}
            linkedProblem={notes.linkedProblem}
            isCreating={notes.isCreating}
            isLoading={notes.isLoadingNote}
            isSaving={notes.isSaving}
            isDeleting={notes.isDeleting}
            error={notes.editorError}
            saveMessage={notes.saveMessage}
            showPreview={showPreview}
            onTogglePreview={() => setShowPreview((value) => !value)}
            onChange={notes.updateDraft}
            onSave={notes.saveNote}
            onDelete={notes.deleteNote}
          />
        </section>
      </div>
    </motion.div>
  );
}
