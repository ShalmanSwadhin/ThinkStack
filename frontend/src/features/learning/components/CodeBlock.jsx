import { useMemo, useState } from 'react';
import Editor from '@monaco-editor/react';
import { getMonacoLanguage } from 'shared/algorithms/codeSync/languages.js';
import {
  TOPIC_CODE_LANGUAGES,
  getTopicCodeSource,
} from 'shared/learning/topicCodeExamples.js';
import { buildCodeExplanation } from './CodeBlock.utils';
import { createMonacoMountHandler } from '../../../utils/monacoHelpers.js';
export default function CodeBlock({
  topicSlug,
  language: defaultLanguage = 'python',
  code,
  explanation,
  title,
  examples,
}) {
  const [language, setLanguage] = useState(defaultLanguage);

  const resolved = useMemo(() => {
    const dbExamples = examples ?? [];
    const dbMatch = dbExamples.find((example) => example.language === language);

    if (dbMatch?.code?.trim()) {
      return {
        title: `${language} implementation`,
        source: dbMatch.code,
        explanation: dbMatch.explanation,
      };
    }

    if (topicSlug) {
      const fromShared = getTopicCodeSource(topicSlug, language);
      if (fromShared?.source?.trim()) {
        return fromShared;
      }
    }

    const matchedExample = dbExamples[0];

    if (matchedExample?.code?.trim()) {
      return {
        title: matchedExample.title ?? `${matchedExample.language} implementation`,
        source: matchedExample.code,
        explanation: matchedExample.explanation,
      };
    }

    if (code) {
      return {
        title: title ?? language,
        source: code,
        explanation,
      };
    }

    return null;
  }, [topicSlug, language, examples, code, explanation, title]);

  const codeExplanation = buildCodeExplanation(resolved?.source, resolved?.explanation);

  if (!resolved?.source) {
    return (
      <p className="text-sm text-slate-500 dark:text-slate-400">
        Code examples are not available for this topic yet.
      </p>
    );
  }

  const lineCount = resolved.source.split('\n').length;
  const editorHeight = Math.min(Math.max(lineCount * 20 + 24, 180), 420);

  return (
    <div className="overflow-hidden rounded-xl border dark:border-slate-700">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b bg-slate-100 px-4 py-2 dark:bg-slate-900">
        <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
          {resolved.title}
        </span>
        <select
          id="topic-code-language"
          name="topic-code-language"
          value={language}
          onChange={(event) => setLanguage(event.target.value)}
          className="rounded-lg border bg-white px-3 py-1.5 text-xs font-medium dark:border-slate-600 dark:bg-slate-800"
          aria-label="Programming language"
        >
          {TOPIC_CODE_LANGUAGES.map((lang) => (
            <option key={lang.id} value={lang.id}>
              {lang.label}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-slate-950">
        <Editor
          height={`${editorHeight}px`}
          language={getMonacoLanguage(language)}
          theme="vs-dark"
          value={resolved.source}
          options={{
            readOnly: true,
            domReadOnly: true,
            minimap: { enabled: false },
            fontSize: 13,
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            automaticLayout: true,
            wordWrap: 'on',
            padding: { top: 12, bottom: 12 },
            renderLineHighlight: 'none',
            overviewRulerLanes: 0,
            folding: false,
            scrollbar: { vertical: lineCount > 18 ? 'auto' : 'hidden' },
          }}
          onMount={createMonacoMountHandler('topic-code-editor')}
        />      </div>

      <div className="border-t bg-brand-50/60 px-4 py-4 dark:border-slate-700 dark:bg-brand-950/20">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-600 dark:text-brand-400">
          Code Explanation
        </p>
        <p className="mt-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          {codeExplanation}
        </p>
      </div>
    </div>
  );
}

export { buildCodeExplanation };
