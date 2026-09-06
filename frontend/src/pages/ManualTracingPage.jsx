import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { Navigate } from 'react-router-dom';

import { motion } from 'framer-motion';

import { useSelector } from 'react-redux';

import Button from '../components/ui/Button';

import { selectTheme } from '../features/theme/themeSlice';

import useCodeTracer from '../features/code-tracing/useCodeTracer';

import TraceCodeEditor from '../features/code-tracing/components/TraceCodeEditor';

import VariableTable from '../features/code-tracing/components/VariableTable';

import CallStackPanel from '../features/code-tracing/components/CallStackPanel';

import TraceOutputConsole from '../features/code-tracing/components/TraceOutputConsole';
import TraceResultsTable from '../features/code-tracing/components/TraceResultsTable';

import { TRACING_LANGUAGES, SAMPLE_CODE } from '../features/code-tracing/engine/traceEngine';



const PARSE_DEBOUNCE_MS = 500;



export default function ManualTracingPage() {

  const theme = useSelector(selectTheme);

  const editorTheme = theme === 'dark' ? 'vs-dark' : 'vs-light';

  const [language, setLanguage] = useState('python');

  const [draft, setDraft] = useState(SAMPLE_CODE.python);

  const debounceRef = useRef(null);



  const tracer = useCodeTracer(SAMPLE_CODE.python, language);



  const monacoLanguage = useMemo(

    () => TRACING_LANGUAGES.find((item) => item.id === language)?.monaco ?? 'python',

    [language]

  );



  const parseNow = useCallback(

    (code) => {

      if (debounceRef.current) {

        window.clearTimeout(debounceRef.current);

        debounceRef.current = null;

      }

      tracer.parseCode(code);

    },

    [tracer.parseCode]

  );



  const handleEditorChange = useCallback(

    (value) => {

      setDraft(value);

      if (debounceRef.current) window.clearTimeout(debounceRef.current);

      debounceRef.current = window.setTimeout(() => {

        tracer.parseCode(value);

      }, PARSE_DEBOUNCE_MS);

    },

    [tracer.parseCode]

  );



  const loadExample = useCallback(() => {

    const sample = SAMPLE_CODE[language] ?? SAMPLE_CODE.python;

    setDraft(sample);

    parseNow(sample);

  }, [language, parseNow]);



  const handleLanguageChange = useCallback(

    (nextLanguage) => {

      setLanguage(nextLanguage);

    },

    []

  );



  // Switching languages loads that language's sample code (matching the "Load Example"
  // button's behavior) rather than re-parsing whatever text is currently in the editor.
  // The previous code called `parseNow(draft)` here, which fed the OLD language's leftover
  // source text into the NEW language's parser (e.g. Python's `for num in numbers:` parsed
  // as Java) — producing garbled variable values instead of a real error, since each
  // language parser tries its best to make sense of unexpected tokens rather than failing
  // outright. Confirmed live: this was the actual root cause of Manual Tracing appearing
  // broken after a language switch (see NEXT_PHASE_QA_REPORT.md).
  useEffect(() => {

    const sample = SAMPLE_CODE[language] ?? SAMPLE_CODE.python;

    setDraft(sample);

    parseNow(sample);

  }, [language]); // eslint-disable-line react-hooks/exhaustive-deps -- load & re-trace this language's sample



  useEffect(

    () => () => {

      if (debounceRef.current) window.clearTimeout(debounceRef.current);

    },

    []

  );



  const followExecution = tracer.playing || tracer.stepIndex > 0;



  return (

    <div className="page-container py-8 pb-24 lg:pb-8">

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>

        <div className="mb-6">

          <h1 className="page-heading">Manual Tracing</h1>

          <p className="mt-2 max-w-3xl text-slate-500 dark:text-slate-400">

            Paste your code, choose a language, and step through execution line by line. Variable

            values, strings, arrays, and console output update after each step.

          </p>

        </div>



        <div className="mb-4 flex flex-wrap items-center gap-3">

          <select
            id="trace-code-language"
            name="trace-code-language"
            value={language}
            onChange={(event) => handleLanguageChange(event.target.value)}
            className="input-field w-auto min-w-[160px]"
            aria-label="Programming language"
          >

            {TRACING_LANGUAGES.map((item) => (

              <option key={item.id} value={item.id}>

                {item.label}

              </option>

            ))}

          </select>

          <Button size="sm" variant="secondary" onClick={loadExample}>

            Load Example

          </Button>

          <Button size="sm" variant="secondary" onClick={() => parseNow(draft)}>

            Parse Code

          </Button>

          <Button size="sm" variant="secondary" onClick={tracer.restart}>

            Restart

          </Button>

          <Button size="sm" variant="secondary" onClick={tracer.prev} disabled={tracer.isAtStart}>

            Previous Step

          </Button>

          <Button size="sm" onClick={tracer.togglePlay}>

            {tracer.playing ? 'Pause' : 'Play'}

          </Button>

          <Button size="sm" variant="secondary" onClick={tracer.next} disabled={tracer.isAtEnd}>

            Next Step

          </Button>

          <label htmlFor="trace-playback-speed" className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
            Speed
            <input
              id="trace-playback-speed"
              name="trace-playback-speed"
              type="range"
              min={0.5}
              max={3}
              step={0.5}
              value={tracer.speed}
              onChange={(event) => tracer.setSpeed(Number(event.target.value))}
            />
          </label>

          <label htmlFor="trace-jump-line" className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
            Jump to line
            <input
              id="trace-jump-line"
              name="trace-jump-line"
              type="number"
              min={1}
              className="input-field w-20 py-1"
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  tracer.jumpToLine(Number(event.target.currentTarget.value));
                }
              }}
            />
          </label>

        </div>



        {tracer.plan.error && (

          <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">

            {tracer.plan.error}

          </div>

        )}



        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">

          <div className="space-y-4">

            <TraceCodeEditor

              source={draft}

              onChange={handleEditorChange}

              language={monacoLanguage}

              theme={editorTheme}

              currentLine={tracer.currentStep?.line ?? 1}

              followExecution={followExecution}

            />



            <div className="rounded-2xl border bg-white p-4 dark:bg-slate-800">

              <p className="text-xs font-semibold uppercase tracking-wide text-brand-600 dark:text-brand-400">

                Line Explanation

              </p>

              <p className="mt-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">

                {tracer.currentStep?.explanation ??

                  'Click Play or Next Step to begin tracing execution.'}

              </p>

              {tracer.currentStep?.condition && (

                <p className="mt-2 text-sm text-sky-700 dark:text-sky-400">

                  {tracer.currentStep.condition}

                </p>

              )}

            </div>



            <TraceOutputConsole output={tracer.currentStep?.output} />

          </div>



          <div className="space-y-4">

            <VariableTable variables={tracer.currentStep?.variables} />

            <CallStackPanel callStack={tracer.currentStep?.callStack} />



            <div className="rounded-2xl border bg-white p-4 dark:bg-slate-800">

              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">

                Execution Progress

              </p>

              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">

                Step {tracer.stepIndex + 1} of {tracer.total}

              </p>

              {tracer.total > 1 && (

                <input
                  id="trace-timeline-scrub"
                  name="trace-timeline-scrub"
                  type="range"
                  min={0}
                  max={tracer.total - 1}
                  value={tracer.stepIndex}
                  onChange={(event) => tracer.goTo(Number(event.target.value))}
                  className="mt-3 w-full accent-brand-600"
                  aria-label="Execution timeline"
                />

              )}

            </div>

          </div>

        </div>

        <div className="mt-6">
          <TraceResultsTable
            steps={tracer.steps}
            source={draft}
            language={language}
            currentStepIndex={tracer.stepIndex}
          />
        </div>

      </motion.div>

    </div>

  );

}



export function LegacyCodeTracingRedirect() {

  return <Navigate to="/manual-tracing" replace />;

}

