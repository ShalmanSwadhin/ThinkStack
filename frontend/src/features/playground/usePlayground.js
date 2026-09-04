import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { selectTheme } from '../theme/themeSlice';
import playgroundApi from './playgroundService';
import { isComingSoonPayload } from '../../utils/apiPayload';
import { DEFAULT_TEMPLATES, LANGUAGE_LIST } from './constants';
import { clearDraft, readDraft, writeDraft } from '../../utils/draftStorage';
import useBeforeUnload from '../../utils/useBeforeUnload';

const PLAYGROUND_DRAFT_KEY = 'playground-draft';

export function usePlayground() {
  const themeMode = useSelector(selectTheme);
  const storedDraft = useMemo(() => readDraft(PLAYGROUND_DRAFT_KEY, null), []);
  const [language, setLanguage] = useState(storedDraft?.language ?? 'python');
  const [sourceCode, setSourceCode] = useState(
    storedDraft?.sourceCode ?? DEFAULT_TEMPLATES.python
  );
  const [stdin, setStdin] = useState(storedDraft?.stdin ?? '');
  const [lastSavedSnapshot, setLastSavedSnapshot] = useState(
    storedDraft
      ? {
          language: storedDraft.language,
          sourceCode: storedDraft.sourceCode,
          stdin: storedDraft.stdin ?? '',
        }
      : null
  );
  const [output, setOutput] = useState(null);
  const [snippets, setSnippets] = useState([]);
  const [history, setHistory] = useState([]);
  const [activeSnippetId, setActiveSnippetId] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [mockMode, setMockMode] = useState(false);
  const [comingSoon, setComingSoon] = useState(false);
  const [sidebarTab, setSidebarTab] = useState('snippets');

  const resolvedTheme =
    themeMode === 'system'
      ? window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'vs-dark'
        : 'light'
      : themeMode === 'dark'
        ? 'vs-dark'
        : 'light';

  const isDirty = useMemo(() => {
    if (!lastSavedSnapshot) {
      return sourceCode !== (DEFAULT_TEMPLATES[language] ?? '');
    }
    return (
      lastSavedSnapshot.language !== language ||
      lastSavedSnapshot.sourceCode !== sourceCode ||
      lastSavedSnapshot.stdin !== stdin
    );
  }, [language, sourceCode, stdin, lastSavedSnapshot]);

  useBeforeUnload(isDirty && !activeSnippetId);

  useEffect(() => {
    writeDraft(PLAYGROUND_DRAFT_KEY, { language, sourceCode, stdin });
  }, [language, sourceCode, stdin]);

  const loadSnippets = useCallback(async () => {
    try {
      const data = await playgroundApi.listSnippets();
      setSnippets(data.snippets ?? []);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to load snippets');
    }
  }, []);

  const loadHistory = useCallback(async () => {
    try {
      const data = await playgroundApi.listHistory({ limit: 20 });
      setHistory(data.submissions ?? []);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to load history');
    }
  }, []);

  useEffect(() => {
    loadSnippets();
    loadHistory();
  }, [loadSnippets, loadHistory]);

  const handleLanguageChange = useCallback(
    (nextLanguage) => {
      setLanguage(nextLanguage);
      setActiveSnippetId(null);
      if (!activeSnippetId) {
        setSourceCode(DEFAULT_TEMPLATES[nextLanguage] ?? '');
      }
    },
    [activeSnippetId]
  );

  const handleRun = useCallback(async () => {
    setIsRunning(true);
    setError(null);
    try {
      const data = await playgroundApi.runCode({ language, sourceCode, stdin });
      if (isComingSoonPayload(data)) {
        setComingSoon(true);
        setError(null);
        setOutput(null);
        return;
      }
      setComingSoon(false);
      setOutput(data.submission);
      setMockMode(Boolean(data.mockMode));
      await loadHistory();
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to run code');
      setOutput(null);
    } finally {
      setIsRunning(false);
    }
  }, [language, sourceCode, stdin, loadHistory]);

  const handleSaveSnippet = useCallback(
    async (title) => {
      if (!title?.trim()) {
        setError('Snippet title is required');
        return null;
      }

      setIsSaving(true);
      setError(null);
      try {
        const payload = { title: title.trim(), language, sourceCode, stdin };
        let snippet;
        if (activeSnippetId) {
          snippet = await playgroundApi.updateSnippet(activeSnippetId, payload);
        } else {
          snippet = await playgroundApi.createSnippet(payload);
          setActiveSnippetId(snippet.id);
        }
        setLastSavedSnapshot({
          language: snippet.language,
          sourceCode: snippet.sourceCode,
          stdin: snippet.stdin ?? '',
        });
        clearDraft(PLAYGROUND_DRAFT_KEY);
        await loadSnippets();
        return snippet;
      } catch (err) {
        setError(err.response?.data?.error?.message || 'Failed to save snippet');
        return null;
      } finally {
        setIsSaving(false);
      }
    },
    [activeSnippetId, language, sourceCode, stdin, loadSnippets]
  );

  const handleLoadSnippet = useCallback((snippet) => {
    setActiveSnippetId(snippet.id);
    setLanguage(snippet.language);
    setSourceCode(snippet.sourceCode);
    setStdin(snippet.stdin ?? '');
    setLastSavedSnapshot({
      language: snippet.language,
      sourceCode: snippet.sourceCode,
      stdin: snippet.stdin ?? '',
    });
    setOutput(null);
    setError(null);
  }, []);

  const handleDeleteSnippet = useCallback(
    async (id) => {
      setError(null);
      try {
        await playgroundApi.deleteSnippet(id);
        if (activeSnippetId === id) {
          setActiveSnippetId(null);
        }
        await loadSnippets();
      } catch (err) {
        setError(err.response?.data?.error?.message || 'Failed to delete snippet');
      }
    },
    [activeSnippetId, loadSnippets]
  );

  const handleLoadHistoryItem = useCallback((item) => {
    setLanguage(item.language);
    setSourceCode(item.sourceCode);
    setStdin(item.stdin ?? '');
    setOutput(item);
    setActiveSnippetId(null);
    setError(null);
  }, []);

  const handleNewSnippet = useCallback(() => {
    setActiveSnippetId(null);
    const nextLanguage = language;
    const nextSource = DEFAULT_TEMPLATES[nextLanguage] ?? '';
    setSourceCode(nextSource);
    setStdin('');
    setLastSavedSnapshot(null);
    setOutput(null);
    setError(null);
  }, [language]);

  const handleCopyCode = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(sourceCode);
    } catch {
      setError('Failed to copy code to clipboard');
    }
  }, [sourceCode]);

  const handleDownloadCode = useCallback(() => {
    const extensions = {
      c: 'c',
      cpp: 'cpp',
      java: 'java',
      python: 'py',
      javascript: 'js',
    };
    const ext = extensions[language] ?? 'txt';
    const blob = new Blob([sourceCode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `thinkstack-snippet.${ext}`;
    link.click();
    URL.revokeObjectURL(url);
  }, [language, sourceCode]);

  return {
    language,
    languages: LANGUAGE_LIST,
    sourceCode,
    stdin,
    output,
    snippets,
    history,
    activeSnippetId,
    isRunning,
    isSaving,
    error,
    mockMode,
    comingSoon,
    setComingSoon,
    sidebarTab,
    editorTheme: resolvedTheme,
    setLanguage: handleLanguageChange,
    setSourceCode,
    setStdin,
    setSidebarTab,
    setError,
    runCode: handleRun,
    saveSnippet: handleSaveSnippet,
    loadSnippet: handleLoadSnippet,
    deleteSnippet: handleDeleteSnippet,
    loadHistoryItem: handleLoadHistoryItem,
    newSnippet: handleNewSnippet,
    copyCode: handleCopyCode,
    downloadCode: handleDownloadCode,
    refreshSnippets: loadSnippets,
    refreshHistory: loadHistory,
  };
}

export default usePlayground;
