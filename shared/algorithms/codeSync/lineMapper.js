/**
 * Maps a visualizer step to the source line that performs it.
 *
 *   step (event)  →  executable statement  →  source line  →  highlighted line
 *
 * Each algorithm has an ordered list of EVENT RULES (see ./eventMap/). A rule pairs a
 * pattern that recognises the event from the step's description with an ANCHOR: a
 * pattern for the *statement* that performs that event. The anchor is matched against
 * the executable lines of the listing actually on screen (see ./sourceAnalysis.js),
 * never against comments or blank lines, so the answer follows the code wherever it
 * moves — adding, removing or re-wrapping comments, or reordering helper functions,
 * cannot make the highlight land on a comment. No line numbers are stored anywhere.
 */
import { getAlgorithmCode } from './templates.js';
import { getAnalysis } from './sourceAnalysis.js';
import { EVENT_MAP } from './eventMap/index.js';

export { EVENT_MAP };

const pickHit = (hits, nth = 'first') => {
  if (nth === 'last') return hits.at(-1);
  if (Number.isInteger(nth)) return hits[nth];
  return hits[0];
};

/** Resolves the anchor(s) of one rule to a line of this listing (or null). */
export function resolveRule(rule, analysis, language) {
  const spec =
    rule.anchor && !Array.isArray(rule.anchor) && !(rule.anchor instanceof RegExp)
      ? rule.anchor[language] ?? rule.anchor.default
      : rule.anchor;
  const codeLines = analysis.filter((line) => line.kind === 'code');
  const candidates = Array.isArray(spec) ? spec : [spec];

  for (const candidate of candidates) {
    if (candidate === '@first') return { line: codeLines[0]?.number ?? null, hits: codeLines.slice(0, 1) };
    if (candidate === '@last') return { line: codeLines.at(-1)?.number ?? null, hits: codeLines.slice(-1) };
    const hits = codeLines.filter((line) => candidate.test(line.code));
    if (hits.length) return { line: pickHit(hits, rule.nth)?.number ?? null, hits };
  }
  return { line: null, hits: [] };
}

export const firstExecutableLine = (analysis) =>
  analysis.find((line) => line.kind === 'code')?.number ?? 1;

const listingCache = new Map();
function getListing(algorithmId, category, language) {
  const key = `${algorithmId}|${category}|${language}`;
  let listing = listingCache.get(key);
  if (!listing) {
    const { source } = getAlgorithmCode(algorithmId, language, category);
    listing = getAnalysis(source, language);
    listingCache.set(key, listing);
  }
  return listing;
}

export const findEventRule = (algorithmId, description) => {
  const text = description ?? '';
  return EVENT_MAP[algorithmId]?.find((rule) => rule.test.test(text)) ?? null;
};

/**
 * 1-based line of the executable statement that performs the step described by
 * `description` in `language`'s listing. `stepIndex`/`totalSteps` are accepted for
 * backwards compatibility and are not used: the answer depends only on what the step
 * IS, not on where it falls in the run.
 */
export const inferCodeLine = (algorithmId, category, description, _stepIndex, _totalSteps, language = 'python') => {
  const listing = getListing(algorithmId, category, language);
  const rule = findEventRule(algorithmId, description);
  if (rule) {
    const { line } = resolveRule(rule, listing, language);
    if (line) return line;
  }
  // Defensive only: every description an algorithm emits is covered by a rule (enforced
  // by tests). Fall back to the algorithm's entry point, never to an arbitrary line.
  return firstExecutableLine(listing);
};

export const enrichStepsWithCodeSync = (algorithmId, category, steps, language = 'python') =>
  steps.map((step) => ({
    ...step,
    codeLine: step.codeLine ?? inferCodeLine(algorithmId, category, step.description, 0, 1, language),
  }));

export default { inferCodeLine, enrichStepsWithCodeSync, EVENT_MAP, resolveRule, findEventRule };
