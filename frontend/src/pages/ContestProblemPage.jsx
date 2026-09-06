import { useEffect } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import Button from '../components/ui/Button';
import CodeEditor from '../features/playground/components/CodeEditor';
import useEditorPreferences from '../features/settings/useEditorPreferences';
import OutputPanel from '../features/playground/components/OutputPanel';
import SubmissionResult from '../features/problems/components/SubmissionResult';
import ProblemDescription from '../features/problems/components/ProblemDescription';
import { useContestProblem } from '../features/contests/useContestProblem';
import LiveContestCountdown from '../features/contests/components/LiveContestCountdown';
import { useContestCountdown } from '../features/contests/useContestCountdown';
import { LANGUAGE_LIST } from '../features/playground/constants';
import ComingSoonPlaceholder, { COMING_SOON_COPY } from '../components/ui/ComingSoonPlaceholder';
import useIntegrationStatus from '../features/integrations/useIntegrationStatus';

export default function ContestProblemPage() {
  const { slug, problemSlug } = useParams();
  const editorPrefs = useEditorPreferences();
  const integrations = useIntegrationStatus();
  const {
    contest,
    problem,
    canSubmit,
    language,
    sourceCode,
    runResult,
    submitResult,
    isLoading,
    isRunning,
    isSubmitting,
    error,
    comingSoon,
    mockMode,
    editorTheme,
    setSourceCode,
    setLanguage,
    runSample,
    submitSolution,
  } = useContestProblem(slug, problemSlug);

  const { canSubmit: liveCanSubmit } = useContestCountdown({
    startTime: contest?.startTime ?? contest?.endTime ?? new Date().toISOString(),
    endTime: contest?.endTime ?? new Date().toISOString(),
    status: contest?.status ?? 'scheduled',
  });

  const submissionAllowed = (canSubmit ?? false) && liveCanSubmit;
  const executionUnavailable = integrations.judge0ComingSoon || comingSoon;
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

  if (!contest || !problem) {
    return <Navigate to={`/contests/${slug}`} replace />;
  }

  const problemForDescription = {
    ...problem,
    hiddenTestCount: 0,
    totalTestCount: problem.publicTestCases?.length ?? 0,
    userStatus: problem.status,
    xpReward: problem.points,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="page-container py-6 pb-24 lg:pb-8"
    >
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link
          to={`/contests/${slug}`}
          className="text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400"
        >
          ← Back to {contest.title}
        </Link>
        <LiveContestCountdown
          startTime={contest.startTime ?? contest.endTime}
          endTime={contest.endTime}
          status={contest.status}
        />
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

      {!submissionAllowed && contest.status === 'completed' && (
        <div className="mb-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
          This contest has ended. Submissions are closed.
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="glass-card min-w-0 p-4 sm:p-6">
          <ProblemDescription problem={problemForDescription} />
        </div>

        <div className="space-y-4">
          <div className="glass-card overflow-hidden">
            <div className="flex flex-col gap-3 border-b px-4 py-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between dark:border-slate-700">
              <select
                value={language}
                onChange={(event) => setLanguage(event.target.value)}
                className="input-field w-full sm:w-auto sm:min-w-[140px]"
              >
                {LANGUAGE_LIST.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.label}
                  </option>
                ))}
              </select>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={runSample}
                  disabled={isRunning || executionUnavailable}
                  title={runDisabledReason}
                >
                  {isRunning ? 'Running…' : 'Run sample'}
                </Button>
                <Button
                  size="sm"
                  onClick={submitSolution}
                  disabled={!submissionAllowed || isSubmitting || executionUnavailable}
                  title={runDisabledReason}
                >
                  {isSubmitting ? 'Submitting…' : 'Submit'}
                </Button>
              </div>
            </div>
            <CodeEditor
              language={language}
              value={sourceCode}
              onChange={setSourceCode}
              theme={editorTheme}
              fontSize={editorPrefs.fontSize}
              tabSize={editorPrefs.tabSize}
            />
          </div>

          {runResult && (
            <div className="glass-card h-44 overflow-hidden">
              <OutputPanel
                output={{
                  verdict: runResult.verdict,
                  stdout: runResult.stdout,
                  stderr: runResult.stderr,
                  executionTime: runResult.executionTime,
                }}
                mockMode={mockMode}
              />
            </div>
          )}
          {submitResult && (
            <SubmissionResult
              submission={{
                verdict: submitResult.verdict,
                testCasesPassed: submitResult.accepted ? 1 : 0,
                testCasesTotal: 1,
              }}
              mockMode={mockMode}
            />
          )}
        </div>
      </div>
    </motion.div>
  );
}
