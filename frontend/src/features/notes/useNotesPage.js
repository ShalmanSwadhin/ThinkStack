import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import notesApi from './notesService';
import { clearDraft, draftKeys, readDraft, writeDraft } from '../../utils/draftStorage';
import useBeforeUnload from '../../utils/useBeforeUnload';

const emptyDraft = () => ({
  title: '',
  content: '',
  tags: '',
});

const AUTOSAVE_MS = 2000;

export function useNotesPage() {
  const { id: routeNoteId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const contextTopic = searchParams.get('topic') || '';
  const contextProblem = searchParams.get('problem') || '';

  const [filters, setFilters] = useState({
    page: 1,
    limit: 50,
    search: '',
    tag: '',
    topicSlug: contextTopic,
    problemSlug: contextProblem,
  });
  const [notes, setNotes] = useState([]);
  const [meta, setMeta] = useState(null);
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [listError, setListError] = useState(null);

  const [activeNoteId, setActiveNoteId] = useState(null);
  const [draft, setDraft] = useState(emptyDraft);
  const [savedDraft, setSavedDraft] = useState(emptyDraft);
  const [linkedTopic, setLinkedTopic] = useState(null);
  const [linkedProblem, setLinkedProblem] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isLoadingNote, setIsLoadingNote] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editorError, setEditorError] = useState(null);
  const [saveMessage, setSaveMessage] = useState('');
  const autosaveTimerRef = useRef(null);

  const draftKey = useMemo(
    () => draftKeys('note-draft', activeNoteId ?? (isCreating ? 'new' : 'none')),
    [activeNoteId, isCreating]
  );

  const isDirty = useMemo(
    () => JSON.stringify(draft) !== JSON.stringify(savedDraft),
    [draft, savedDraft]
  );

  useBeforeUnload(isDirty);

  useEffect(() => {
    setFilters((current) => ({
      ...current,
      topicSlug: contextTopic,
      problemSlug: contextProblem,
      page: 1,
    }));
  }, [contextTopic, contextProblem]);

  const fetchNotes = useCallback(async () => {
    setIsLoadingList(true);
    setListError(null);
    try {
      const params = Object.fromEntries(
        Object.entries(filters).filter(([, value]) => value !== '' && value != null)
      );
      const data = await notesApi.listNotes(params);
      setNotes(data.notes ?? []);
      setMeta(data.meta ?? null);
    } catch (err) {
      setListError(err.response?.data?.error?.message || 'Failed to load notes');
    } finally {
      setIsLoadingList(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const loadNote = useCallback(async (noteId) => {
    setIsLoadingNote(true);
    setEditorError(null);
    setSaveMessage('');
    try {
      const note = await notesApi.getNote(noteId);
      const loaded = {
        title: note.title,
        content: note.content,
        tags: (note.tags ?? []).join(', '),
      };
      setActiveNoteId(note.id);
      setIsCreating(false);
      setDraft(loaded);
      setSavedDraft(loaded);
      setLinkedTopic(note.topic);
      setLinkedProblem(note.problem);
      clearDraft(draftKeys('note-draft', noteId));
    } catch (err) {
      setEditorError(err.response?.data?.error?.message || 'Failed to load note');
    } finally {
      setIsLoadingNote(false);
    }
  }, []);

  useEffect(() => {
    if (routeNoteId) {
      loadNote(routeNoteId);
    }
  }, [routeNoteId, loadNote]);

  const startNewNote = useCallback(() => {
    setActiveNoteId(null);
    setIsCreating(true);
    const stored = readDraft(draftKeys('note-draft', 'new'), emptyDraft());
    setDraft(stored);
    setSavedDraft(emptyDraft());
    setLinkedTopic(null);
    setLinkedProblem(null);
    setEditorError(null);
    setSaveMessage('');

    if (contextTopic) {
      setLinkedTopic({ slug: contextTopic, title: contextTopic });
    }
    if (contextProblem) {
      setLinkedProblem({ slug: contextProblem, title: contextProblem });
    }

    navigate(contextTopic || contextProblem ? `/notes?${searchParams.toString()}` : '/notes', {
      replace: true,
    });
  }, [contextTopic, contextProblem, navigate, searchParams]);

  useEffect(() => {
    if (!routeNoteId && (contextTopic || contextProblem) && !activeNoteId && !isCreating) {
      startNewNote();
    }
  }, [routeNoteId, contextTopic, contextProblem, activeNoteId, isCreating, startNewNote]);

  const selectNote = useCallback(
    (noteId) => {
      navigate(`/notes/${noteId}`);
    },
    [navigate]
  );

  const updateDraft = useCallback((updates) => {
    setDraft((current) => ({ ...current, ...updates }));
    setSaveMessage('');
  }, []);

  useEffect(() => {
    if (!isCreating && !activeNoteId) return;
    writeDraft(draftKey, draft);
  }, [draft, draftKey, isCreating, activeNoteId]);

  const parseTags = (value) =>
    value
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean);

  const saveNote = useCallback(async () => {
    const title = draft.title.trim();
    if (!title) {
      setEditorError('Title is required');
      return null;
    }

    setIsSaving(true);
    setEditorError(null);
    setSaveMessage('');

    const payload = {
      title,
      content: draft.content,
      tags: parseTags(draft.tags),
    };

    if (isCreating) {
      if (linkedTopic?.slug) payload.topicSlug = linkedTopic.slug;
      if (linkedProblem?.slug) payload.problemSlug = linkedProblem.slug;
    }

    try {
      let saved;
      if (isCreating || !activeNoteId) {
        saved = await notesApi.createNote(payload);
        setIsCreating(false);
        setActiveNoteId(saved.id);
        clearDraft(draftKeys('note-draft', 'new'));
        navigate(`/notes/${saved.id}`, { replace: true });
      } else {
        saved = await notesApi.updateNote(activeNoteId, payload);
      }

      const normalized = {
        title: saved.title,
        content: saved.content ?? '',
        tags: (saved.tags ?? []).join(', '),
      };
      setDraft(normalized);
      setSavedDraft(normalized);
      setLinkedTopic(saved.topic);
      setLinkedProblem(saved.problem);
      setSaveMessage('Saved');
      await fetchNotes();
      return saved;
    } catch (err) {
      setEditorError(err.response?.data?.error?.message || 'Failed to save note');
      return null;
    } finally {
      setIsSaving(false);
    }
  }, [draft, isCreating, activeNoteId, linkedTopic, linkedProblem, navigate, fetchNotes]);

  useEffect(() => {
    if (!isDirty || isSaving || isLoadingNote) return undefined;
    if (!draft.title.trim()) return undefined;

    autosaveTimerRef.current = window.setTimeout(() => {
      saveNote();
    }, AUTOSAVE_MS);

    return () => {
      if (autosaveTimerRef.current) window.clearTimeout(autosaveTimerRef.current);
    };
  }, [draft, isDirty, isSaving, isLoadingNote, saveNote]);

  const deleteNote = useCallback(async () => {
    if (!activeNoteId) return false;

    setIsDeleting(true);
    setEditorError(null);
    try {
      await notesApi.deleteNote(activeNoteId);
      clearDraft(draftKeys('note-draft', activeNoteId));
      setActiveNoteId(null);
      setIsCreating(false);
      setDraft(emptyDraft());
      setSavedDraft(emptyDraft());
      setLinkedTopic(null);
      setLinkedProblem(null);
      navigate('/notes', { replace: true });
      await fetchNotes();
      return true;
    } catch (err) {
      setEditorError(err.response?.data?.error?.message || 'Failed to delete note');
      return false;
    } finally {
      setIsDeleting(false);
    }
  }, [activeNoteId, navigate, fetchNotes]);

  const updateFilters = useCallback((updates) => {
    setFilters((current) => ({ ...current, ...updates, page: updates.page ?? 1 }));
  }, []);

  return {
    notes,
    meta,
    filters,
    isLoadingList,
    listError,
    activeNoteId,
    draft,
    linkedTopic,
    linkedProblem,
    isCreating,
    isLoadingNote,
    isSaving,
    isDeleting,
    isDirty,
    editorError,
    saveMessage,
    contextTopic,
    contextProblem,
    fetchNotes,
    startNewNote,
    selectNote,
    updateDraft,
    saveNote,
    deleteNote,
    updateFilters,
  };
}

export default useNotesPage;
