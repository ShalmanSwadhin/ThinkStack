import { useEffect } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import Button from '../components/ui/Button';
import { useProblem } from '../features/problems/useProblem';
import ProblemDescription from '../features/problems/components/ProblemDescription';
import SubmissionResult from '../features/problems/components/SubmissionResult';
import CodeEditor from '../features/playground/components/CodeEditor';
import useEditorPreferences from '../features/settings/useEditorPreferences';
import OutputPanel from '../features/playground/components/OutputPanel';
import { LANGUAGE_LIST, VERDICT_LABELS } from '../features/playground/constants';
import ComingSoonPlaceholder, { COMING_SOON_COPY } from '../components/ui/ComingSoonPlaceholder';
import useIntegrationStatus from '../features/integrations/useIntegrationStatus';

function formatDate(value) {
  if (!value) return '';
  return new Date(value).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function ProblemDetailPage() {
  const { slug } = useParams();
  const editorPrefs = useEditorPreferences();
  const integrations = useIntegrationStatus();
  const problemState = useProblem(slug);
  const {
    problem,
    submissions,
    language,
    sourceCode,
    runResult,
    submitResult,
    lastXpAwarded,
    isLoading,
    isRunning,
    isSubmitting,
    error,
    comingSoon,
    editorTheme,
    setSourceCode,
    setLanguage,
    runSample,
    submitSolution,
  } = problemState;

  const executionUnavailable = integrations.judge0ComingSoon || comingSoon;
  const runDisabled = isRunning || isSubmitting || executionUnavailable;
  const runDisabledReason = executionUnavailable ? 'Coming Soon' : undefined;

  useEffect(() => {
    const onKeyDown = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
        event.preventDefault();
        runSample();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [runSample]);

  if (isLoading) {
    return (
      <div className="page-container py-8">
        <div className="h-96 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800" />
      </div>
    );
  }

  if (!problem) {
    return <Navigate to="/problems" replace />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="page-container py-6 pb-24 lg:pb-8"
    >
      <div className="mb-4">
        <Link
          to="/problems"
          className="text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400"
        >
          ← Back to problems
        </Link>
      </div>

      {executionUnavailable && (
        <ComingSoonPlaceholder
          className="mb-4"
          compact
          service="judge0"
          title={COMING_SOON_COPY.judge0.title}
          message={COMING_SOON_COPY.judge0.message}
        />
      )}

      {error && !executionUnavailable && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-200">
          {error}
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="glass-card min-w-0 p-4 sm:p-6">
          <ProblemDescription problem={problem} />
        </div>

        <div className="flex min-h-[640px] flex-col gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <select
              className="input-field w-full sm:w-auto sm:min-w-[140px]"
              value={language}
              onChange={(event) => setLanguage(event.target.value)}
            >
              {LANGUAGE_LIST.map((lang) => (
                <option key={lang.monaco} value={lang.monaco}>
                  {lang.name}
                </option>
              ))}
            </select>
            <Button onClick={runSample} disabled={runDisabled} title={runDisabledReason}>
              {isRunning ? 'Running…' : 'Run Sample'}
            </Button>
            <Button
              variant="secondary"
              onClick={submitSolution}
              disabled={runDisabled}
              title={runDisabledReason}
            >
              {isSubmitting ? 'Submitting…' : 'Submit'}
            </Button>
          </div>

          <div className="glass-card min-h-[360px] flex-1 p-2">
            <CodeEditor
              value={sourceCode}
              onChange={setSourceCode}
              language={language}
              theme={editorTheme}
              onRun={executionUnavailable ? undefined : runSample}
              fontSize={editorPrefs.fontSize}
              tabSize={editorPrefs.tabSize}
            />
          </div>

          <div className="glass-card h-44 overflow-hidden">
            <OutputPanel
              output={
                runResult
                  ? {
                      verdict: runResult.verdict,
                      stdout: runResult.stdout,
                      stderr: runResult.stderr,
                      executionTime: runResult.executionTime,
                      memoryUsed: runResult.memoryUsed,
                    }
                  : null
              }
              isRunning={isRunning}
            />
          </div>

          {submitResult && (
            <SubmissionResult submission={submitResult} xpAwarded={lastXpAwarded} />
          )}

          {submissions.length > 0 && (
            <div className="glass-card p-4">
              <h3 className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-200">
                Recent submissions
              </h3>
              <ul className="space-y-2">
                {submissions.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700"
                  >
                    <span className="capitalize text-slate-700 dark:text-slate-200">
                      {VERDICT_LABELS[item.verdict] ?? item.verdict}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {item.testCasesPassed}/{item.testCasesTotal} · {formatDate(item.createdAt)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
