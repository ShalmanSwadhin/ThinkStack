import { formatTraceOutput, formatTraceValue, formatEventLabel, parseConditionResult } from './formatTraceValue.js';

/**
 * Build a tabular model for full manual tracing results (start → end).
 */
export function buildTraceTableModel(steps, source = '', language = 'python') {
  const safeSteps = steps ?? [];
  const variableNames = [];
  const seenVars = new Set();

  for (const step of safeSteps) {
    for (const name of Object.keys(step.variables ?? {})) {
      if (!seenVars.has(name)) {
        seenVars.add(name);
        variableNames.push(name);
      }
    }
  }

  const rows = safeSteps.map((step, index) => {
    const { text: conditionText, result: parsedConditionResult } = parseConditionResult(step.condition);
    // `step.conditionResult` is a real structured true/false/null from the executor
    // (see explain/classify.js) — prefer it over parsing it back out of the
    // display-only `condition` text string.
    const conditionResult = step.conditionResult ?? parsedConditionResult;
    return {
      // `executionOrder` is this row's position in ACTUAL execution order (see
      // engine/visualizer/stepEmitter.js) — not derived from `line`/source order,
      // and not necessarily monotonic with `line` (a taken branch's body executes,
      // and only THEN is its sibling branch announced as skipped, even though the
      // sibling's source line comes first).
      step: step.executionOrder ?? index + 1,
      line: step.line,
      statement: (step.sourceLine ?? '').trim() || '—',
      event: formatEventLabel(step),
      eventType: step.eventType ?? null,
      eventSubtype: step.eventSubtype ?? null,
      executionStatus: step.executionStatus ?? null,
      condition: conditionText,
      conditionResult,
      explanation: step.explanation ?? '',
      variables: variableNames.map((name) => ({
        name,
        value: formatTraceValue(step.variables?.[name]),
        raw: step.variables?.[name],
      })),
      output: formatTraceOutput(step.output),
      changed: step.changed ?? step.target ?? null,
      irOp: step.irOp ?? null,
    };
  });

  return {
    language,
    source,
    lineCount: source.split('\n').length,
    stepCount: rows.length,
    variableNames,
    rows,
    generatedAt: new Date().toISOString(),
  };
}

export default buildTraceTableModel;
