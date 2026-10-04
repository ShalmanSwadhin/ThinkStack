/**
 * Enriches visualization steps with debugger-like fields:
 * currentCodeLine, currentVariables, currentExplanation
 */
import { inferCodeLine } from './codeSync/lineMapper.js';

function formatArray(values) {
  if (!values?.length) return '[]';
  return `[${values.join(', ')}]`;
}

function extractSearchingVariables(step, config = {}) {
  const { state, description } = step;
  const vars = {
    target: config.target ?? '?',
    result: 'Not Found',
  };

  if (state?.values) {
    vars.array = formatArray(state.values);
    vars.length = state.values.length;
  }

  if (state?.secondary?.length === 2) {
    vars.low = state.secondary[0];
    vars.high = state.secondary[1];
  }

  if (state?.highlights?.length === 1) {
    vars.mid = state.highlights[0];
    vars.currentIndex = state.highlights[0];
    if (state.values) {
      vars.currentValue = state.values[state.highlights[0]];
    }
  } else if (state?.highlights?.length === 2) {
    vars.leftIndex = state.highlights[0];
    vars.rightIndex = state.highlights[1];
  } else if (state?.highlights?.length === 1 || description?.includes('index')) {
    const match = description?.match(/index (\d+)/i);
    if (match) {
      vars.currentIndex = Number(match[1]);
      if (state?.values) vars.currentValue = state.values[vars.currentIndex];
    }
  }

  const desc = (description ?? '').toLowerCase();
  if (desc.includes('found at')) {
    const match = description.match(/index (\d+)/i);
    vars.result = match ? `Found at index ${match[1]}` : 'Found';
  } else if (desc.includes('not found')) {
    vars.result = 'Not Found';
  }

  return vars;
}

function extractSortingVariables(step) {
  const { state, description } = step;
  const vars = {};

  if (state?.values) {
    vars.array = formatArray(state.values);
    vars.n = state.values.length;
  }

  const iMatch = description?.match(/\b(i|pass|outer)\s*=?\s*(\d+)/i);
  const jMatch = description?.match(/\b(j|index)\s*(\d+)/i);
  const compareMatch = description?.match(/Compare (\d+) (?:and|with) (\d+)/i);

  if (compareMatch) {
    vars.leftValue = Number(compareMatch[1]);
    vars.rightValue = Number(compareMatch[2]);
  }

  if (state?.highlights?.length >= 2) {
    vars.i = state.highlights[0];
    vars.j = state.highlights[1];
  } else if (state?.highlights?.length === 1) {
    vars.keyIndex = state.highlights[0];
    if (state.values) vars.key = state.values[state.highlights[0]];
  }

  if (iMatch) vars.pass = Number(iMatch[2]);
  if (jMatch && !vars.j) vars.j = Number(jMatch[2]);

  if (step.stats) {
    vars.comparisons = step.stats.comparisons;
    vars.swaps = step.stats.swaps;
  }

  return vars;
}

function extractGraphVariables(step) {
  const { state, description } = step;
  const vars = {};

  if (state?.distances) {
    vars.distances = { ...state.distances };
  }
  if (state?.visited?.length) {
    vars.visited = [...state.visited];
  }
  if (state?.queue?.length) {
    vars.queue = [...state.queue];
  }
  if (state?.start) vars.start = state.start;
  if (state?.goal) vars.goal = state.goal;

  const nodeMatch = description?.match(/node (\w+)/i);
  if (nodeMatch) vars.currentNode = nodeMatch[1];

  return vars;
}

function extractTreeVariables(step) {
  const { state, description } = step;
  const vars = {};

  if (state?.nodes?.length) {
    vars.nodeCount = state.nodes.length;
    const highlighted = state.nodes.filter((n) => n.highlighted);
    if (highlighted.length) {
      vars.currentNode = highlighted[0].value;
    }
  }

  const valueMatch = description?.match(/value (\d+)/i);
  if (valueMatch) vars.insertValue = Number(valueMatch[1]);

  return vars;
}

function extractVariables(step, category, config) {
  switch (category) {
    case 'searching':
      return extractSearchingVariables(step, config);
    case 'sorting':
      return extractSortingVariables(step);
    case 'graphs':
      return extractGraphVariables(step);
    case 'trees':
      return extractTreeVariables(step);
    default:
      return extractSortingVariables(step);
  }
}

function buildExplanation(step, algorithmName, variables) {
  const desc = step?.description ?? 'Executing algorithm step.';
  const varSummary = Object.entries(variables)
    .filter(([key]) => !['array', 'distances'].includes(key))
    .slice(0, 4)
    .map(([key, val]) => `${key} = ${val}`)
    .join(', ');

  return {
    what: desc,
    why: varSummary
      ? `This step updates the algorithm state (${varSummary}) to narrow the search space or reorder elements toward the final result.`
      : `This step advances ${algorithmName} by applying its core logic to the current data structure state.`,
    how: variables.currentValue !== undefined
      ? `The active element at index ${variables.currentIndex ?? variables.mid} holds value ${variables.currentValue}, which is compared against the target or neighbor elements.`
      : 'The highlighted line in the source code performs the operation described in the step message.',
    when: desc.toLowerCase().includes('found') || desc.toLowerCase().includes('complete')
      ? 'This is a terminal or milestone step — the algorithm has reached a conclusion for this branch.'
      : 'This runs whenever the algorithm reaches this point in its control flow during forward execution.',
  };
}

export function enrichStepWithSyncFields(step, algorithmId, category, config, algorithmName, index, total) {
  // Steps normally arrive with `codeLine` already set (see codeSync/lineMapper.js); if one
  // does not, resolve it through the same executable-statement mapping rather than a
  // second, separate table of line numbers.
  const codeLine =
    step.codeLine ??
    step.currentCodeLine ??
    inferCodeLine(algorithmId, category, step.description, index, total);

  const variables = {
    ...extractVariables(step, category, config),
    ...(step.variables ?? {}),
  };

  const explanation = step.explanation ?? step.currentExplanation ?? buildExplanation(step, algorithmName, variables);

  return {
    ...step,
    codeLine,
    currentCodeLine: codeLine,
    variables,
    currentVariables: variables,
    explanation,
    currentExplanation: explanation,
  };
}

export function enrichAllSteps(steps, algorithmId, category, config = {}, algorithmName = algorithmId) {
  const total = steps.length;
  return steps.map((step, index) =>
    enrichStepWithSyncFields(step, algorithmId, category, config, algorithmName, index, total)
  );
}

export default { enrichStepWithSyncFields, enrichAllSteps };
