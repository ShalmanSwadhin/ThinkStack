/**
 * Per-language type semantics for the tracing engine.
 *
 * This is the piece that was entirely missing before: the old evaluator treated every
 * number as a JS `number` (IEEE-754 double) with no memory of whether the source
 * declared it `int` or `float`, so `int / int` always produced JS's float division
 * result instead of the target language's integer-truncating division. See
 * NEXT_PHASE_MANUAL_TRACING_FIX_REPORT.md for the full root-cause writeup.
 *
 * Types are tracked per-variable in a hidden, non-enumerable side-channel on the
 * runtime scope object (see runtime.js's `getVarType`/`setVarType`) rather than
 * changing the shape of `scope` itself — every existing call site that reads
 * `scope[name]` for a value keeps working unchanged; only code that needs to know
 * *how* to combine two values calls into this module.
 */

// Integral kinds truncate on division; floating kinds don't.
const INTEGRAL_KINDS = new Set(['int', 'long', 'short', 'byte', 'char']);
const FLOATING_KINDS = new Set(['float', 'double']);

/** Languages with a real, distinct integer type where int/int division truncates. */
const STATICALLY_TYPED = new Set(['c', 'cpp', 'java']);

export function isIntegralKind(kind) {
  return INTEGRAL_KINDS.has(kind);
}

export function isFloatingKind(kind) {
  return FLOATING_KINDS.has(kind);
}

/** Maps a language's declaration keyword (`int`, `float`, `String`, `auto`, ...) to a normalized kind. */
export function normalizeDeclaredType(keyword, language) {
  if (!keyword) return undefined;
  const kw = keyword.trim();
  const map = {
    int: 'int',
    long: 'long',
    short: 'short',
    byte: 'byte',
    char: 'char',
    float: 'float',
    double: 'double',
    bool: 'bool',
    boolean: 'bool',
    string: 'string',
    String: 'string',
    'std::string': 'string',
    auto: 'auto',
    var: 'auto',
    let: 'auto',
    const: 'auto',
  };
  return map[kw] ?? (language === 'java' && /^[A-Z]/.test(kw) ? 'object' : 'auto');
}

/** Infers the kind of a literal token from its lexical form, per-language. */
export function inferLiteralKind(token, language) {
  if (token.type === 'string') return 'string';
  if (token.type === 'char') return 'char';
  if (token.type === 'keyword') return token.value === 'true' || token.value === 'false' ? 'bool' : 'null';
  if (token.type === 'number') {
    if (token.isFloat) return 'double';
    // Python has no separate int/float declaration syntax — a literal with no
    // decimal point is a Python `int` (arbitrary precision in real Python, modeled
    // here as a JS number since traced programs use small values); with one, `float`.
    if (language === 'python') return token.isFloat ? 'float' : 'int';
    return 'int';
  }
  return 'auto';
}

/** True if a language gives `int / int` truncating (toward zero) integer division. */
function usesIntegerDivision(leftKind, rightKind, language) {
  if (!STATICALLY_TYPED.has(language)) return false;
  const l = leftKind ?? 'auto';
  const r = rightKind ?? 'auto';
  // `auto`/unknown operands are treated as their runtime JS-number appearance —
  // if both look like whole numbers we still don't assume int (a language-agnostic
  // caller with no declared types gets ordinary division); only genuinely-tracked
  // integral kinds trigger truncation, so this never surprises Python/JS callers.
  return isIntegralKind(l) && isIntegralKind(r);
}

/**
 * Result kind of combining two operand kinds under the "usual arithmetic
 * conversions" (simplified): floating beats integral beats bool/char.
 */
export function resultKind(leftKind, rightKind) {
  const l = leftKind ?? 'auto';
  const r = rightKind ?? 'auto';
  if (isFloatingKind(l) || isFloatingKind(r)) return isFloatingKind(l) ? l : r;
  if (isIntegralKind(l) && isIntegralKind(r)) return l === 'long' || r === 'long' ? 'long' : 'int';
  return l !== 'auto' ? l : r;
}

/** Truncates a value toward zero to fit an integral kind (matches C/Java assignment narrowing). */
export function coerceToKind(value, kind) {
  if (typeof value !== 'number') return value;
  if (isIntegralKind(kind)) return Math.trunc(value);
  return value;
}

/**
 * Type-aware `/`. This is the fix for the headline bug: `24 / 3` as `int / int` in
 * C/C++/Java must truncate toward zero (never produce a float), while the exact same
 * source text in Python (true division) or with either operand `float`/`double`
 * must produce a real quotient.
 */
export function typedDivide(left, right, leftKind, rightKind, language) {
  if (right === 0) return { value: undefined, kind: resultKind(leftKind, rightKind) };
  const raw = left / right;
  if (usesIntegerDivision(leftKind, rightKind, language)) {
    return { value: Math.trunc(raw), kind: resultKind(leftKind, rightKind) };
  }
  return { value: raw, kind: resultKind(leftKind, rightKind) };
}

/**
 * Type-aware `%`. C/C++/Java/JavaScript's `%` is a truncated remainder (result takes
 * the sign of the dividend) — which is exactly JS's native `%`, so those languages
 * need no special handling. Python's `%` is a *floored* modulo (result takes the sign
 * of the divisor), which genuinely differs from JS for mixed-sign operands and must
 * be computed explicitly.
 */
export function typedModulo(left, right, leftKind, rightKind, language) {
  if (right === 0) return { value: undefined, kind: resultKind(leftKind, rightKind) };
  if (language === 'python') {
    const value = ((left % right) + right) % right;
    return { value, kind: resultKind(leftKind, rightKind) };
  }
  return { value: left % right, kind: resultKind(leftKind, rightKind) };
}

export default {
  isIntegralKind,
  isFloatingKind,
  normalizeDeclaredType,
  inferLiteralKind,
  resultKind,
  coerceToKind,
  typedDivide,
  typedModulo,
};
