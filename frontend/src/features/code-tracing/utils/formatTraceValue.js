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
    output: 'Output',
    loop: 'Loop',
    condition: 'Condition',
    comment: 'Comment',
    statement: 'Statement',
    walkthrough: 'Walkthrough',
  };
  return labels[type] ?? type ?? '—';
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
