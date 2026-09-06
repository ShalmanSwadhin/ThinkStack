/**
 * Expression tokenizer — turns a source expression string into a flat token list.
 *
 * This exists because the previous implementation scanned for single-character
 * operators with substring search (see git history of ir/expressions.js), which
 * cannot distinguish `i++` from `i + +` or `sum*=x` from `sum * (=x)`. Multi-character
 * operators MUST be recognized before any single-character splitting is attempted,
 * which requires a real token stream, not ad-hoc string scanning.
 */

// Longest-match-first: 3-char operators before 2-char before 1-char.
const OPERATORS_BY_LENGTH = [
  ['<<=', '>>=', '===', '!=='],
  ['++', '--', '==', '!=', '<=', '>=', '&&', '||', '+=', '-=', '*=', '/=', '%=', '&=', '|=', '^=', '<<', '>>', '//'],
  ['+', '-', '*', '/', '%', '=', '<', '>', '!', '&', '|', '^', '~', '(', ')', '[', ']', '{', '}', ',', '.', '?', ':', ';'],
];
const ALL_OPERATORS = OPERATORS_BY_LENGTH.flat().sort((a, b) => b.length - a.length);

export const TOKEN_TYPES = Object.freeze({
  NUMBER: 'number',
  STRING: 'string',
  CHAR: 'char',
  IDENT: 'ident',
  KEYWORD: 'keyword',
  OPERATOR: 'operator',
  EOF: 'eof',
});

const KEYWORDS = new Set(['true', 'false', 'null', 'nullptr', 'None', 'True', 'False']);

/**
 * Word-boundary-safe replacement of language keyword-operators (Python's `and`/`or`/
 * `not`, etc.) with their symbolic equivalents, applied before tokenizing so the rest
 * of the pipeline only ever deals with one operator vocabulary.
 */
export function normalizeKeywordOperators(source) {
  return source
    .replace(/\btrue\b/gi, (m) => (m === 'True' || m === 'TRUE' ? 'true' : 'true'))
    .replace(/\bfalse\b/gi, () => 'false')
    .replace(/\bNone\b/g, 'null')
    .replace(/\bnullptr\b/g, 'null')
    .replace(/\band\b/g, '&&')
    .replace(/\bor\b/g, '||')
    .replace(/\bnot\s+/g, '!');
}

/**
 * Tokenizes an expression string. Throws a descriptive error on genuinely
 * unrecognizable input (an unterminated string, a stray character) rather than
 * silently producing a token stream that would evaluate to something plausible
 * but wrong — callers should catch this and surface "unable to trace this
 * construct" rather than guessing.
 */
export function tokenize(source) {
  const text = normalizeKeywordOperators(source);
  const tokens = [];
  let i = 0;
  const n = text.length;

  while (i < n) {
    const ch = text[i];

    if (ch === ' ' || ch === '\t' || ch === '\n' || ch === '\r') {
      i += 1;
      continue;
    }

    // String literal
    if (ch === '"') {
      let j = i + 1;
      let value = '';
      while (j < n && text[j] !== '"') {
        if (text[j] === '\\' && j + 1 < n) {
          value += unescapeChar(text[j + 1]);
          j += 2;
        } else {
          value += text[j];
          j += 1;
        }
      }
      if (j >= n) throw new TokenizeError(`Unterminated string literal starting at position ${i}`);
      tokens.push({ type: TOKEN_TYPES.STRING, value, raw: text.slice(i, j + 1) });
      i = j + 1;
      continue;
    }

    // Char literal ('a', '\n')
    if (ch === "'") {
      let j = i + 1;
      let value = '';
      while (j < n && text[j] !== "'") {
        if (text[j] === '\\' && j + 1 < n) {
          value += unescapeChar(text[j + 1]);
          j += 2;
        } else {
          value += text[j];
          j += 1;
        }
      }
      if (j >= n) throw new TokenizeError(`Unterminated char literal starting at position ${i}`);
      tokens.push({ type: TOKEN_TYPES.CHAR, value, raw: text.slice(i, j + 1) });
      i = j + 1;
      continue;
    }

    // Number literal (int or float, with optional exponent and C-style suffixes)
    if (/[0-9]/.test(ch) || (ch === '.' && /[0-9]/.test(text[i + 1] ?? ''))) {
      let j = i;
      let isFloat = false;
      while (j < n && /[0-9]/.test(text[j])) j += 1;
      if (text[j] === '.') {
        isFloat = true;
        j += 1;
        while (j < n && /[0-9]/.test(text[j])) j += 1;
      }
      if (text[j] === 'e' || text[j] === 'E') {
        isFloat = true;
        j += 1;
        if (text[j] === '+' || text[j] === '-') j += 1;
        while (j < n && /[0-9]/.test(text[j])) j += 1;
      }
      // C/C++/Java numeric suffixes: 5L, 5.0f, 5.0F, 5UL, etc. — consumed but the
      // float-ness they imply (f/F always float; L/U alone do not) is tracked.
      let suffix = '';
      while (j < n && /[fFlLuUdD]/.test(text[j])) {
        suffix += text[j];
        j += 1;
      }
      if (/[fFdD]/.test(suffix)) isFloat = true;
      const raw = text.slice(i, j);
      tokens.push({
        type: TOKEN_TYPES.NUMBER,
        value: Number(raw.replace(/[fFlLuUdD]+$/, '')),
        isFloat,
        raw,
      });
      i = j;
      continue;
    }

    // Identifier / keyword
    if (/[a-zA-Z_]/.test(ch)) {
      let j = i;
      while (j < n && /[a-zA-Z0-9_]/.test(text[j])) j += 1;
      const word = text.slice(i, j);
      if (KEYWORDS.has(word)) {
        tokens.push({ type: TOKEN_TYPES.KEYWORD, value: word });
      } else {
        tokens.push({ type: TOKEN_TYPES.IDENT, value: word });
      }
      i = j;
      continue;
    }

    // Operator (longest match first)
    const op = ALL_OPERATORS.find((candidate) => text.startsWith(candidate, i));
    if (op) {
      tokens.push({ type: TOKEN_TYPES.OPERATOR, value: op });
      i += op.length;
      continue;
    }

    throw new TokenizeError(`Unrecognized character "${ch}" at position ${i} in expression: ${source}`);
  }

  tokens.push({ type: TOKEN_TYPES.EOF, value: null });
  return tokens;
}

function unescapeChar(ch) {
  switch (ch) {
    case 'n':
      return '\n';
    case 't':
      return '\t';
    case 'r':
      return '\r';
    case '\\':
      return '\\';
    case '"':
      return '"';
    case "'":
      return "'";
    case '0':
      return '\0';
    default:
      return ch;
  }
}

export class TokenizeError extends Error {
  constructor(message) {
    super(message);
    this.name = 'TokenizeError';
  }
}

export default { tokenize, normalizeKeywordOperators, TOKEN_TYPES, TokenizeError };
