import { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { selectTheme } from '../../theme/themeSlice';
import CodeEditor from '../../playground/components/CodeEditor';
import { CODE_LANGUAGES, getMonacoLanguage } from 'shared/algorithms/codeSync/languages.js';
import Button from '../../../components/ui/Button';

export default function AdminMultiLangCodeEditor({
  value = {},
  onChange,
  explanations = {},
  onExplanationChange,
  height = 280,
}) {
  const theme = useSelector(selectTheme);
  const editorTheme = theme === 'dark' ? 'vs-dark' : 'vs-light';
  const [language, setLanguage] = useState('python');
  const [preview, setPreview] = useState(false);

  const monacoLanguage = useMemo(() => getMonacoLanguage(language), [language]);
  const currentCode = value[language] ?? '';

  const handleCopy = async () => {
    await navigator.clipboard.writeText(currentCode);
  };

  return (
    <div className="space-y-3 rounded-xl border border-slate-200 p-4 dark:border-slate-700">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <select
          value={language}
          onChange={(event) => setLanguage(event.target.value)}
          className="input-field w-auto"
        >
          {CODE_LANGUAGES.map((lang) => (
            <option key={lang.id} value={lang.id}>
              {lang.label}
            </option>
          ))}
        </select>
        <div className="flex gap-2">
          <Button size="sm" variant="ghost" type="button" onClick={() => setPreview((p) => !p)}>
            {preview ? 'Edit' : 'Preview'}
          </Button>
          <Button size="sm" variant="ghost" type="button" onClick={handleCopy}>
            Copy
          </Button>
        </div>
      </div>

      {preview ? (
        <pre className="overflow-auto rounded-xl bg-slate-950 p-4 text-sm text-slate-100">
          <code>{currentCode || '// No code yet'}</code>
        </pre>
      ) : (
        <div style={{ height }}>
          <CodeEditor
            value={currentCode}
            onChange={(code) => onChange({ ...value, [language]: code })}
            language={monacoLanguage}
            theme={editorTheme}
          />
        </div>
      )}

      {onExplanationChange && (
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase text-slate-500">
            Code explanation ({language})
          </label>
          <textarea
            value={explanations[language] ?? ''}
            onChange={(event) =>
              onExplanationChange({ ...explanations, [language]: event.target.value })
            }
            rows={3}
            className="input-field w-full"
            placeholder="Explain this code block…"
          />
        </div>
      )}
    </div>
  );
}

export function codeExamplesToMap(examples = []) {
  const codeMap = {};
  const explanationMap = {};
  for (const example of examples) {
    codeMap[example.language] = example.code ?? '';
    explanationMap[example.language] = example.explanation ?? '';
  }
  return { codeMap, explanationMap };
}

export function mapToCodeExamples(codeMap, explanationMap = {}) {
  return Object.entries(codeMap)
    .filter(([, code]) => code?.trim())
    .map(([language, code]) => ({
      language,
      code,
      explanation: explanationMap[language] ?? '',
    }));
}
