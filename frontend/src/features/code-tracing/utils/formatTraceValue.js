export function formatTraceValue(value) {
  if (value === undefined) return '—';
  if (value === null) return 'null';
  if (typeof value === 'string') return `"${value}"`;
  if (Array.isArray(value)) return `[${value.map(formatTraceValue).join(', ')}]`;
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  return String(value);
}

export function formatTraceOutput(output) {
  if (!output?.length) return '—';
  return output.join(' | ');
}

export function formatStepType(type) {
  const labels = {
    assign: 'Assignment',
    declaration: 'Declaration',
    output: 'Output',
    input: 'Input',
    loop: 'Loop',
    condition: 'Condition',
    comment: 'Comment',
    blank: 'Blank Line',
    directive: 'Preprocessor Directive',
    function: 'Function',
    statement: 'Statement',
    walkthrough: 'Walkthrough',
  };
  return labels[type] ?? type ?? '—';
}

/** Renders the richer `eventType`/`eventSubtype` pair a step carries (see
 * shared/tracing/explain/classify.js) as one human-readable label, e.g.
 * "Condition · If" or "Declaration · Declaration + Initialization". Falls back to
 * the legacy `formatStepType` label when a step predates this classification
 * (should not happen for anything produced by the current engine, but keeps this
 * function safe to call on any step shape). */
const SUBTYPE_LABELS = {
  If: 'If',
  ElseIf: 'Else If',
  Else: 'Else',
  For: 'For',
  While: 'While',
  DoWhile: 'Do-While',
  ForEach: 'For-Each',
  Break: 'Break',
  Continue: 'Continue',
  Return: 'Return',
  Declaration: 'Declaration',
  DeclarationAndInitialization: 'Declaration + Initialization',
  Assignment: 'Assignment',
  CompoundAssignment: 'Compound Assignment',
  ArrayElementUpdate: 'Array Element Update',
  Swap: 'Swap',
  LoopInitialization: 'Loop Initialization',
  LoopUpdate: 'Loop Update',
  IncrementDecrement: 'Increment/Decrement',
  Print: 'Print',
  Read: 'Read',
  Call: 'Call',
  Function: 'Function',
  Class: 'Class',
  Include: 'Include',
  Define: 'Define',
  Using: 'Using',
  Namespace: 'Namespace',
  Import: 'Import',
  Export: 'Export',
  Package: 'Package',
  BlankLine: 'Blank Line',
  Comment: 'Comment',
  Generic: '',
};

export function formatEventLabel(step) {
  if (!step?.eventType) return formatStepType(step?.type);
  const subtypeLabel = SUBTYPE_LABELS[step.eventSubtype] ?? step.eventSubtype;
  return subtypeLabel ? `${step.eventType} · ${subtypeLabel}` : step.eventType;
}

export function parseConditionResult(condition) {
  if (!condition) return { text: '—', result: null };
  const arrowMatch = condition.match(/→\s*(true|false)/i);
  if (arrowMatch) {
    return {
      text: condition.replace(/\s*→\s*(true|false)/i, '').trim(),
      result: arrowMatch[1].toLowerCase() === 'true',
    };
  }
  return { text: condition, result: null };
}
