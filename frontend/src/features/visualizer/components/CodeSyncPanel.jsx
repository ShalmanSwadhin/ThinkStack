import { useEffect, useRef, useMemo } from 'react';
import Editor from '@monaco-editor/react';
import { motion } from 'framer-motion';
import {
  CODE_LANGUAGES,
  getAlgorithmCode,
  getMonacoLanguage,
  getStepCodeExplanation,
} from 'shared/algorithms/codeSync/index.js';
import { cn } from '../../../utils/cn';
import { createMonacoMountHandler, syncMonacoModel } from '../../../utils/monacoHelpers.js';

export default function CodeSyncPanel({
  algorithmId,
  category,
  algorithmName,
  currentStep,
  language,
  onLanguageChange,
  theme = 'vs-dark',
  sideBySide = false,
}) {
  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  const decorationIdsRef = useRef([]);

  const codeData = useMemo(
    () => getAlgorithmCode(algorithmId, language, category),
    [algorithmId, language, category]
  );

  const currentLine = currentStep?.currentCodeLine ?? currentStep?.codeLine ?? 1;
  const monacoLanguage = getMonacoLanguage(language);
  const editorHeight = sideBySide ? 'min(360px, 50vh)' : '280px';

  useEffect(() => {
    syncMonacoModel(editorRef.current, monacoRef.current, {
      language: monacoLanguage,
      source: codeData.source || '// Loading source code…',
    });
  }, [monacoLanguage, codeData.source, algorithmId]);

  useEffect(() => {
    const editor = editorRef.current;
    const monaco = monacoRef.current;
    if (!editor || !monaco) return;

    decorationIdsRef.current = editor.deltaDecorations(decorationIdsRef.current, [
      {
        range: new monaco.Range(currentLine, 1, currentLine, 1),
        options: {
          isWholeLine: true,
          className: 'code-sync-active-line',
          glyphMarginClassName: 'code-sync-active-glyph',
        },
      },
      ...(currentLine > 1
        ? [
            {
              range: new monaco.Range(1, 1, currentLine - 1, 1),
              options: {
                isWholeLine: true,
                className: 'code-sync-inactive-line',
              },
            },
          ]
        : []),
    ]);

    editor.revealLineInCenter(currentLine, 1);
  }, [currentLine, codeData.source]);

  const handleMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
    createMonacoMountHandler('viz-code-editor')(editor, monaco);
  };

  return (
    <div
      className={cn(
        'flex flex-col overflow-hidden rounded-2xl border bg-white dark:bg-slate-800',
        sideBySide ? 'min-h-[420px] lg:min-h-[480px]' : 'min-h-[420px]'
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3 dark:border-slate-700">
        <div>
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Source Code</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Line {currentLine} · synchronized with visualization
          </p>
        </div>
        <select
          id="viz-code-language"
          name="viz-code-language"
          value={language}
          onChange={(event) => onLanguageChange(event.target.value)}
          className="rounded-lg border bg-white px-3 py-1.5 text-sm dark:border-slate-600 dark:bg-slate-900"
          aria-label="Programming language"
        >
          {CODE_LANGUAGES.map((lang) => (
            <option key={lang.id} value={lang.id}>
              {lang.label}
            </option>
          ))}
        </select>
      </div>

      <div
        className={cn(
          'relative overflow-hidden',
          sideBySide ? 'h-[min(360px,50vh)] sm:h-[360px]' : 'h-[280px]'
        )}
      >
        <Editor
          height={editorHeight}
          language={monacoLanguage}
          theme={theme}
          value={codeData.source || '// Loading source code…'}
          keepCurrentModel
          options={{
            readOnly: true,
            domReadOnly: true,
            minimap: { enabled: false },
            fontSize: 13,
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            automaticLayout: true,
            wordWrap: 'on',
            renderLineHighlight: 'none',
            glyphMargin: true,
            padding: { top: 8 },
          }}
          onMount={handleMount}
        />
      </div>

      {currentStep && (
        <motion.div
          key={`${currentLine}-${currentStep.description}`}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="border-t bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-900"
        >
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-brand-600 dark:text-brand-400">
            Current Step
          </p>
          <p className="text-sm text-slate-800 dark:text-slate-200">{currentStep.description}</p>
        </motion.div>
      )}
    </div>
  );
}

export function CodeExplanationPanel({ algorithmName, currentStep, className }) {
  const explanation = useMemo(
    () => getStepCodeExplanation(currentStep, algorithmName),
    [currentStep, algorithmName]
  );

  if (!currentStep) {
    return (
      <div className={cn('rounded-2xl border bg-white p-4 dark:bg-slate-800', className)}>
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Code Explanation</h3>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Run the visualization to see line-by-line explanations.
        </p>
      </div>
    );
  }

  return (
    <div className={cn('rounded-2xl border bg-white p-4 dark:bg-slate-800', className)}>
      <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Code Explanation</h3>
      <div className="mt-3 space-y-3 text-sm">
        <div>
          <p className="font-medium text-slate-700 dark:text-slate-300">What happens</p>
          <p className="mt-1 text-slate-600 dark:text-slate-400">{explanation.what}</p>
        </div>
        <div>
          <p className="font-medium text-slate-700 dark:text-slate-300">Why</p>
          <p className="mt-1 text-slate-600 dark:text-slate-400">{explanation.why}</p>
        </div>
        <div>
          <p className="font-medium text-slate-700 dark:text-slate-300">How</p>
          <p className="mt-1 text-slate-600 dark:text-slate-400">{explanation.how}</p>
        </div>
        <div>
          <p className="font-medium text-slate-700 dark:text-slate-300">When</p>
          <p className="mt-1 text-slate-600 dark:text-slate-400">{explanation.when}</p>
        </div>
      </div>
    </div>
  );
}
