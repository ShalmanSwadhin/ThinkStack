import { useMemo, useRef, useState, useCallback } from 'react';

import Button from '../../../components/ui/Button';
import { cn } from '../../../utils/cn';
import buildTraceTableModel from '../utils/traceTable.js';
import { downloadTraceAsPdf, downloadTraceAsPng } from '../utils/traceExport.js';

function ConditionBadge({ result }) {
  if (result === null) return null;
  return (
    <span
      className={cn(
        'ml-2 inline-flex rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide',
        result ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
      )}
    >
      {result ? 'True' : 'False'}
    </span>
  );
}

function TraceTableContent({ model, currentStepIndex, forExport = false }) {
  const { rows, variableNames, source, language, stepCount } = model;

  return (
    <div className={cn(forExport ? 'bg-white text-slate-900' : '')}>
      <div className={cn('mb-4', forExport ? 'border-b border-slate-200 pb-4' : '')}>
        <h3
          className={cn(
            'font-semibold',
            forExport ? 'text-lg text-slate-900' : 'text-sm text-slate-800 dark:text-slate-200'
          )}
        >
          Manual Tracing Results
        </h3>
        <p className={cn('mt-1 text-xs', forExport ? 'text-slate-600' : 'text-slate-500')}>
          Language: {language} · Steps: {stepCount} · Generated:{' '}
          {new Date(model.generatedAt).toLocaleString()}
        </p>
      </div>

      <div className={cn('mb-4', forExport ? 'rounded-lg border border-slate-200 bg-slate-50 p-3' : '')}>
        <p
          className={cn(
            'mb-2 text-xs font-semibold uppercase tracking-wide',
            forExport ? 'text-slate-500' : 'text-slate-400'
          )}
        >
          Source Code
        </p>
        <pre
          className={cn(
            'overflow-x-auto font-mono text-xs leading-relaxed',
            forExport
              ? 'whitespace-pre-wrap text-slate-800'
              : 'max-h-40 rounded-lg bg-slate-950 p-3 text-slate-100 dark:bg-slate-950'
          )}
        >
          {source || '(empty)'}
        </pre>
      </div>

      <div className="overflow-x-auto">
        <table
          className={cn(
            'w-full min-w-[720px] border-collapse text-left text-xs',
            forExport ? 'border border-slate-300' : ''
          )}
        >
          <thead>
            <tr
              className={cn(
                forExport
                  ? 'bg-slate-100 text-slate-700'
                  : 'bg-slate-100 text-slate-500 dark:bg-slate-900 dark:text-slate-400'
              )}
            >
              <th className="border px-2 py-2 font-semibold">Step</th>
              <th className="border px-2 py-2 font-semibold">Line</th>
              <th className="border px-2 py-2 font-semibold min-w-[140px]">Statement</th>
              <th className="border px-2 py-2 font-semibold">Event</th>
              <th className="border px-2 py-2 font-semibold min-w-[120px]">Condition</th>
              {variableNames.map((name) => (
                <th key={name} className="border px-2 py-2 font-mono font-semibold">
                  {name}
                </th>
              ))}
              <th className="border px-2 py-2 font-semibold min-w-[100px]">Output</th>
              <th className="border px-2 py-2 font-semibold min-w-[160px]">Notes</th>
            </tr>
          </thead>
          <tbody>
            {rows.length ? (
              rows.map((row, index) => {
                const isActive = !forExport && index === currentStepIndex;
                const isConditionRow = row.conditionResult !== null;
                return (
                  <tr
                    key={row.step}
                    className={cn(
                      forExport
                        ? index % 2 === 0
                          ? 'bg-white'
                          : 'bg-slate-50'
                        : isActive
                          ? 'bg-brand-50 dark:bg-brand-950/40'
                          : isConditionRow
                            ? 'bg-sky-50/60 dark:bg-sky-950/20'
                            : 'dark:bg-slate-800/50'
                    )}
                  >
                    <td className="border px-2 py-1.5 font-medium">{row.step}</td>
                    <td className="border px-2 py-1.5">{row.line}</td>
                    <td className="border px-2 py-1.5 font-mono text-[11px]">{row.statement}</td>
                    <td className="border px-2 py-1.5">{row.event}</td>
                    <td className="border px-2 py-1.5">
                      <span>{row.condition}</span>
                      <ConditionBadge result={row.conditionResult} />
                    </td>
                    {row.variables.map((cell) => (
                      <td
                        key={cell.name}
                        className={cn(
                          'border px-2 py-1.5 font-mono text-[11px]',
                          row.changed === cell.name &&
                            (forExport
                              ? 'bg-amber-50 font-semibold text-amber-900'
                              : 'bg-amber-100/80 font-semibold text-amber-800 dark:bg-amber-950/50 dark:text-amber-300')
                        )}
                      >
                        {cell.value}
                      </td>
                    ))}
                    <td className="border px-2 py-1.5 font-mono text-[11px]">{row.output}</td>
                    <td
                      className={cn(
                        'border px-2 py-1.5 text-[11px]',
                        forExport ? 'text-slate-700' : 'text-slate-600 dark:text-slate-400'
                      )}
                      title={row.explanation}
                    >
                      {forExport ? row.explanation : row.explanation.slice(0, 80)}
                      {!forExport && row.explanation.length > 80 ? '…' : ''}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan={6 + variableNames.length}
                  className="border px-4 py-8 text-center text-slate-500"
                >
                  No trace steps yet. Parse and run your code to build the tracing table.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function TraceResultsTable({ steps, source, language, currentStepIndex = 0 }) {
  const exportRef = useRef(null);
  const [exporting, setExporting] = useState(false);

  const model = useMemo(
    () => buildTraceTableModel(steps, source, language),
    [steps, source, language]
  );

  const exportFilename = useMemo(
    () => `thinkstack-tracing-${language}-${model.stepCount}steps`,
    [language, model.stepCount]
  );

  const handleExport = useCallback(
    async (format) => {
      if (!exportRef.current || !model.rows.length) return;
      setExporting(true);
      try {
        if (format === 'png') {
          await downloadTraceAsPng(exportRef.current, exportFilename);
        } else {
          await downloadTraceAsPdf(exportRef.current, exportFilename);
        }
      } catch (error) {
        console.error('Trace export failed:', error);
      } finally {
        setExporting(false);
      }
    },
    [exportFilename, model.rows.length]
  );

  return (
    <div className="rounded-2xl border bg-white dark:bg-slate-800">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3 dark:border-slate-700">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-600 dark:text-brand-400">
            Full Tracing Table
          </p>
          <p className="mt-0.5 text-xs text-slate-500">
            All steps from start to end — variables, conditions, and output
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="secondary"
            disabled={!model.rows.length || exporting}
            onClick={() => handleExport('png')}
          >
            {exporting ? 'Exporting…' : 'Download PNG'}
          </Button>
          <Button
            size="sm"
            variant="secondary"
            disabled={!model.rows.length || exporting}
            onClick={() => handleExport('pdf')}
          >
            {exporting ? 'Exporting…' : 'Download PDF'}
          </Button>
        </div>
      </div>

      <div className="max-h-[480px] overflow-auto p-4">
        <TraceTableContent model={model} currentStepIndex={currentStepIndex} />
      </div>

      <div
        aria-hidden
        className="pointer-events-none fixed left-[-9999px] top-0 z-[-1] w-[1100px] p-8"
      >
        <div ref={exportRef} className="bg-white p-6 text-slate-900">
          <TraceTableContent model={model} forExport />
        </div>
      </div>
    </div>
  );
}

export { TraceTableContent };
