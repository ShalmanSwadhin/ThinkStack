import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Button from '../components/ui/Button';
import { usePlayground } from '../features/playground/usePlayground';
import CodeEditor from '../features/playground/components/CodeEditor';
import useEditorPreferences from '../features/settings/useEditorPreferences';
import OutputPanel from '../features/playground/components/OutputPanel';
import IOConsole from '../features/playground/components/IOConsole';
import SnippetSidebar from '../features/playground/components/SnippetSidebar';
import ComingSoonPlaceholder, { COMING_SOON_COPY } from '../components/ui/ComingSoonPlaceholder';
import useIntegrationStatus from '../features/integrations/useIntegrationStatus';

export default function PlaygroundPage() {
  const playground = usePlayground();
  const integrations = useIntegrationStatus();
  const editorPrefs = useEditorPreferences();
  const { runCode } = playground;
  const executionUnavailable = integrations.judge0ComingSoon || playground.comingSoon;
  const runDisabled = playground.isRunning || executionUnavailable;
  const runDisabledReason = executionUnavailable ? 'Coming Soon' : undefined;
  const [saveTitle, setSaveTitle] = useState('');
  const [showSaveInput, setShowSaveInput] = useState(false);

  const handleSave = useCallback(async () => {
    const title = saveTitle.trim() || `Snippet ${new Date().toLocaleDateString()}`;
    const result = await playground.saveSnippet(title);
    if (result) {
      setShowSaveInput(false);
      setSaveTitle('');
    }
  }, [playground, saveTitle]);

  useEffect(() => {
    const onKeyDown = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
        event.preventDefault();
        runCode();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [runCode]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="page-container py-6 pb-24 lg:pb-8"
    >
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="page-heading">Code Playground</h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Write and run code in 5 languages. Press Ctrl+Enter to run.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            className="input-field w-full sm:w-auto sm:min-w-[140px]"
            value={playground.language}
            onChange={(event) => playground.setLanguage(event.target.value)}
          >
            {playground.languages.map((lang) => (
              <option key={lang.monaco} value={lang.monaco}>
                {lang.name}
              </option>
            ))}
          </select>
          <Button onClick={playground.runCode} disabled={runDisabled} title={runDisabledReason}>
            {playground.isRunning ? 'Running…' : 'Run'}
          </Button>
          <Button variant="secondary" onClick={() => setShowSaveInput((value) => !value)}>
            Save
          </Button>
          <Button variant="ghost" onClick={playground.copyCode}>
            Copy
          </Button>
          <Button variant="ghost" onClick={playground.downloadCode}>
            Download
          </Button>
          <Button variant="ghost" onClick={playground.newSnippet}>
            New
          </Button>
        </div>
      </div>

      {executionUnavailable && (
        <ComingSoonPlaceholder
          className="mb-4"
          service="judge0"
          title={COMING_SOON_COPY.judge0.title}
          message={COMING_SOON_COPY.judge0.message}
        />
      )}

      {playground.error && !executionUnavailable && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-200">
          {playground.error}
        </div>
      )}

      {showSaveInput && (
        <div className="mb-4 flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800 sm:flex-row sm:items-center">
          <input
            type="text"
            className="input-field flex-1"
            placeholder="Snippet title"
            value={saveTitle}
            onChange={(event) => setSaveTitle(event.target.value)}
          />
          <Button onClick={handleSave} disabled={playground.isSaving}>
            {playground.isSaving ? 'Saving…' : 'Save snippet'}
          </Button>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="flex min-h-[640px] flex-col gap-4">
          <div className="glass-card min-h-[360px] flex-1 p-2">
            <CodeEditor
              value={playground.sourceCode}
              onChange={playground.setSourceCode}
              language={playground.language}
              theme={playground.editorTheme}
              onRun={executionUnavailable ? undefined : playground.runCode}
              fontSize={editorPrefs.fontSize}
              tabSize={editorPrefs.tabSize}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="glass-card h-40 p-3">
              <IOConsole
                label="stdin"
                value={playground.stdin}
                onChange={playground.setStdin}
                placeholder="Optional input for your program"
              />
            </div>
            <div className="glass-card h-40 overflow-hidden">
              <OutputPanel
                output={playground.output}
                isRunning={playground.isRunning}
                mockMode={playground.mockMode}
              />
            </div>
          </div>
        </div>

        <aside className="glass-card min-h-[320px] overflow-hidden lg:min-h-[640px]">
          <SnippetSidebar
            snippets={playground.snippets}
            history={playground.history}
            activeTab={playground.sidebarTab}
            onTabChange={playground.setSidebarTab}
            activeSnippetId={playground.activeSnippetId}
            onLoadSnippet={playground.loadSnippet}
            onDeleteSnippet={playground.deleteSnippet}
            onLoadHistoryItem={playground.loadHistoryItem}
          />
        </aside>
      </div>
    </motion.div>
  );
}
