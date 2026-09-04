import { useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { createMonacoMountHandler } from '../../../utils/monacoHelpers.js';

export default function TraceCodeEditor({
  source,
  onChange,
  language,
  theme,
  currentLine,
  followExecution = false,
  readOnly = false,
}) {
  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  const decorationIdsRef = useRef([]);

  useEffect(() => {
    const editor = editorRef.current;
    const monaco = monacoRef.current;
    if (!editor || !monaco || !currentLine) return;

    decorationIdsRef.current = editor.deltaDecorations(decorationIdsRef.current, [
      {
        range: new monaco.Range(currentLine, 1, currentLine, 1),
        options: {
          isWholeLine: true,
          className: 'code-sync-active-line',
        },
      },
    ]);

    if (followExecution) {
      editor.revealLineInCenter(currentLine, 1);
    }
  }, [currentLine, followExecution]);

  return (
    <div className="min-h-[360px] overflow-hidden rounded-xl border dark:border-slate-700">
      <Editor
        height="360px"
        language={language}
        theme={theme}
        value={source}
        onChange={(value) => onChange?.(value ?? '')}
        options={{
          readOnly,
          minimap: { enabled: false },
          fontSize: 13,
          lineNumbers: 'on',
          scrollBeyondLastLine: false,
          automaticLayout: true,
          wordWrap: 'on',
          glyphMargin: true,
        }}
          onMount={(editor, monaco) => {
            editorRef.current = editor;
            monacoRef.current = monaco;
            createMonacoMountHandler('trace-code-editor')(editor, monaco);
          }}
      />
    </div>
  );
}
