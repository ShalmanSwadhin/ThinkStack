/**
 * Classifies every line of a displayed source listing so the code-sync highlighter can
 * only ever land on a line that is actually executable.
 *
 *   blank       — nothing on the line
 *   comment     — only a comment (// …, # …, or inside a block comment)
 *   structural  — only closing/opening punctuation (`}`, `};`, `)`), no statement
 *   code        — an executable statement or a control-flow header
 *
 * `code` on each entry is the statement text with trailing comments removed and
 * whitespace collapsed, which is what event anchors are matched against — so an anchor
 * can never accidentally match words that appear only inside a comment.
 */

// `//` is floor division in Python, so Python can only use `#`. The pseudocode
// listings use `//`. Every brace-language uses `//` and `/* … */`.
const LINE_COMMENT_MARKERS = {
  python: ['#'],
  pseudocode: ['//'],
};
const DEFAULT_MARKERS = ['//'];
const NO_BLOCK_COMMENTS = new Set(['python', 'pseudocode']);

const QUOTES = new Set(['"', "'", '`']);

function stripComments(text, markers, allowBlock, state) {
  let out = '';
  let quote = null;

  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];

    if (state.inBlock) {
      if (ch === '*' && text[i + 1] === '/') {
        state.inBlock = false;
        i += 1;
      }
      continue;
    }

    if (quote) {
      out += ch;
      if (ch === '\\') {
        out += text[i + 1] ?? '';
        i += 1;
      } else if (ch === quote) {
        quote = null;
      }
      continue;
    }

    if (QUOTES.has(ch)) {
      quote = ch;
      out += ch;
      continue;
    }

    if (allowBlock && ch === '/' && text[i + 1] === '*') {
      state.inBlock = true;
      i += 1;
      continue;
    }

    if (markers.some((marker) => text.startsWith(marker, i))) break;

    out += ch;
  }

  return out;
}

const STRUCTURAL = /^[{}()[\];,]+$/;

export function analyzeSource(source, language = 'python') {
  const markers = LINE_COMMENT_MARKERS[language] ?? DEFAULT_MARKERS;
  const allowBlock = !NO_BLOCK_COMMENTS.has(language);
  const state = { inBlock: false };

  return String(source ?? '')
    .split('\n')
    .map((text, index) => {
      const code = stripComments(text, markers, allowBlock, state).replace(/\s+/g, ' ').trim();
      let kind;
      if (!text.trim()) kind = 'blank';
      else if (!code) kind = 'comment';
      else if (STRUCTURAL.test(code)) kind = 'structural';
      else kind = 'code';
      return { number: index + 1, text, code, kind };
    });
}

export const isExecutableKind = (kind) => kind === 'code';

const analysisCache = new Map();

/** Memoized analysis keyed by the source text itself, so a changed listing is never stale. */
export function getAnalysis(source, language) {
  const key = `${language}\u0000${source}`;
  let analysis = analysisCache.get(key);
  if (!analysis) {
    analysis = analyzeSource(source, language);
    if (analysisCache.size > 400) analysisCache.clear();
    analysisCache.set(key, analysis);
  }
  return analysis;
}

export default { analyzeSource, getAnalysis, isExecutableKind };
