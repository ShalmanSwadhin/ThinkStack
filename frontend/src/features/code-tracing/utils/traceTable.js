import { formatTraceOutput, formatTraceValue, formatStepType, parseConditionResult } from './formatTraceValue.js';

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
    const { text: conditionText, result: conditionResult } = parseConditionResult(step.condition);
    return {
      step: index + 1,
      line: step.line,
      statement: (step.sourceLine ?? '').trim() || '—',
      event: formatStepType(step.type),
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
