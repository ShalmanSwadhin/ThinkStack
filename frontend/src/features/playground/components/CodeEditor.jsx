import Editor from '@monaco-editor/react';

export default function CodeEditor({ value, onChange, language, theme, onRun, fontSize = 14, tabSize = 4 }) {
  return (
    <div className="relative h-full min-h-[320px] overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
      <Editor
        height="100%"
        language={language}
        theme={theme}
        value={value}
        onChange={(next) => onChange(next ?? '')}
        options={{
          minimap: { enabled: false },
          fontSize,
          lineNumbers: 'on',
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize,
          wordWrap: 'on',
        }}
        onMount={(editor, monaco) => {
          editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
            onRun?.();
          });
        }}
      />
    </div>
  );
}
