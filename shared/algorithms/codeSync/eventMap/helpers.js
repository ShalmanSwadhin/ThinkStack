/**
 * Small constructors for event rules. A rule is
 *   { test: RegExp,        // recognises the step from its description text
 *     anchor: RegExp | Array | { default, [language]: … },   // the EXECUTABLE statement
 *     nth?: 'first' | 'last' | number }  // required whenever the anchor can match >1 line
 *
 * Anchors are matched against comment-stripped executable lines only. An array is
 * tried in order (first regex with any hit wins), which lets one rule cover languages
 * that spell the same statement differently (e.g. a tuple swap vs a temp-variable swap).
 * The special anchors '@first' and '@last' mean the first / last executable line.
 */

/** `return -1` (not-found result). */
export const RETURN_NOT_FOUND = /\breturn\s+-1\b/;

/**
 * `return <value>` — the function's result. A bare `return;` is excluded because in void
 * functions it is an early-exit guard (`if (!node) return;`), not the end of the algorithm.
 */
export const RETURN_VALUE = /\breturn\s+[^;\s]/;

/** The function signature: first executable line mentioning `name(` (snake or camel case). */
export const entry = (name) => new RegExp(`\\b${name}\\s*\\(`, 'i');

/**
 * A CALL to `name(…)` as opposed to its definition. Definitions begin with a keyword or
 * return type (`def`, `void`, `static`, …); calls begin with `return`, an assignment
 * target, or the callee itself. Works the same whichever order the language lists them.
 */
export const call = (name) =>
  new RegExp(
    `^(?!(?:def|void|static|int|bool|auto|function|public|private|protected|func|fun|fn|vector|List)\\b).*\\b${name}\\s*\\(`
  );

export const rule = (test, anchor, nth) => (nth === undefined ? { test, anchor } : { test, anchor, nth });

/**
 * "The algorithm starts / is announced" events: the function signature when the listing
 * has it, otherwise the listing's first executable statement (some listings show only a
 * helper, e.g. just `merge()`, with no top-level driver to point at).
 */
export const entryRule = (test, name) => ({ test, anchor: [entry(name), '@first'], nth: 'first' });

/** Alternation for the array parameter: listings use `arr`, the pseudocode uses `array`. */
export const ARR = '(?:arr|array)';

/**
 * Every spelling of "exchange arr[a] and arr[b]" across the listings: tuple assignment
 * (`arr[a], arr[b] = …`), destructuring (`[arr[a], arr[b]] = …`), `swap(arr[a], arr[b])`
 * / `std::swap(…)`, and the temp-variable form (`tmp = arr[a]; …`). `a` and `b` are regex
 * fragments for the two index expressions (e.g. 'j' and 'j\\s*\\+\\s*1').
 */
export const swapOf = (a, b) => [
  new RegExp(`${ARR}\\[${a}\\]\\s*,\\s*${ARR}\\[${b}\\]\\s*=`),
  new RegExp(`\\[\\s*${ARR}\\[${a}\\]\\s*,\\s*${ARR}\\[${b}\\]\\s*\\]\\s*=`),
  new RegExp(`\\bswap\\s*\\(\\s*${ARR}\\[${a}\\]\\s*,\\s*${ARR}\\[${b}\\]`),
  new RegExp(`\\b(?:tmp|temp|t)\\s*=\\s*${ARR}\\[${a}\\]`),
];
