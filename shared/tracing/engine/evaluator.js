/**
 * IR Expression Evaluator — evaluates the expression AST (engine/expressionParser.js)
 * against runtime scope, with full language-aware type semantics and side-effect
 * tracking for `++`/`--`/compound-assignment embedded inside larger expressions.
 *
 * This REPLACES the previous implementation's `new Function(...)`-based fallback
 * (`evaluateRawExpression`'s old body), which:
 *   - always performed JavaScript float division, never the source language's
 *     integer-truncating division for typed `int`/`int` operands;
 *   - could not represent `++`/`--` as anything other than "parse the whole line as
 *     one JS expression and hope for the best", so any side effect embedded inside a
 *     larger expression (`sum = sum / i++`) was silently discarded — `i` never
 *     actually changed;
 *   - ran arbitrary source text as sloppy-mode JavaScript, which for a malformed
 *     multi-declaration like `24, i=23` (the comma operator) created an *implicit
 *     global variable* `i` on `globalThis` as a side effect of an assignment inside
 *     the dynamically-created function — a genuine state-leak bug, not just a wrong
 *     answer. See NEXT_PHASE_MANUAL_TRACING_FIX_REPORT.md for the full trace.
 *
 * The public API below (`evaluateExpr`, `evaluateRawExpression`, `evaluateCondition`,
 * `evaluatePrintArgs`, `formatValue`) is unchanged so executor.js and every other
 * caller keeps working without modification.
 */

import { EXPR_TYPES, exprToString } from '../ir/expressions.js';
import { parseExpression } from './expressionParser.js';
import { getVarType, setVarType, getLanguage, recordSideEffect } from './runtime.js';
import {
  inferLiteralKind,
  resultKind,
  coerceToKind,
  typedDivide,
  typedModulo,
  isIntegralKind,
} from './typeSystem.js';

export class TraceError extends Error {
  constructor(message) {
    super(message);
    this.name = 'TraceError';
  }
}

/**
 * Evaluates an expression AST node against `scope`, applying any side effects
 * (assignment, `++`/`--`) directly to `scope` as they occur. Returns the plain
 * JS value (matching the old signature) — callers that need the inferred type use
 * `evaluateTyped` instead.
 */
export function evaluateExpr(expr, scope) {
  return evaluateTyped(expr, scope).value;
}

/** Same as `evaluateExpr` but also returns the inferred/declared type kind. */
export function evaluateTyped(expr, scope) {
  if (!expr) return { value: undefined, kind: 'auto' };
  const language = getLanguage(scope);

  switch (expr.type) {
    case EXPR_TYPES.LITERAL:
      return { value: expr.value, kind: expr.litType ?? 'auto' };

    case EXPR_TYPES.IDENT:
      return { value: scope[expr.name], kind: getVarType(scope, expr.name) ?? 'auto' };

    case EXPR_TYPES.UNARY: {
      const operand = evaluateTyped(expr.operand, scope);
      if (expr.op === 'NEGATE') return { value: -operand.value, kind: operand.kind };
      if (expr.op === 'NOT') return { value: !operand.value, kind: 'bool' };
      if (expr.op === 'BITNOT') return { value: ~operand.value, kind: operand.kind ?? 'int' };
      return operand;
    }

    case EXPR_TYPES.PRE_INCDEC: {
      const lvalue = resolveLValue(expr.operand, scope, language);
      if (!lvalue) throw new TraceError(`Cannot ${expr.op === 'INC' ? 'increment' : 'decrement'} a non-variable expression.`);
      const current = Number(lvalue.get() ?? 0);
      const next = expr.op === 'INC' ? current + 1 : current - 1;
      lvalue.set(next);
      // Prefix: the expression's VALUE is the NEW value, after the mutation — the
      // value used by whatever this expression is embedded in (an assignment, a
      // print argument, ...) is the SAME value the variable holds afterward.
      recordSideEffect(scope, {
        kind: 'incdec',
        form: 'prefix',
        op: expr.op === 'INC' ? 'increment' : 'decrement',
        target: exprToString(expr.operand),
        before: current,
        after: next,
        usedValue: next,
      });
      return { value: next, kind: lvalue.getKind() ?? 'int' };
    }

    case EXPR_TYPES.POST_INCDEC: {
      const lvalue = resolveLValue(expr.operand, scope, language);
      if (!lvalue) throw new TraceError(`Cannot ${expr.op === 'INC' ? 'increment' : 'decrement'} a non-variable expression.`);
      const current = Number(lvalue.get() ?? 0);
      const next = expr.op === 'INC' ? current + 1 : current - 1;
      lvalue.set(next);
      // Postfix: the expression's VALUE is the OLD value, before the mutation — the
      // value used by whatever this expression is embedded in is the value the
      // variable held BEFORE this side effect, even though the variable itself now
      // holds `next`.
      recordSideEffect(scope, {
        kind: 'incdec',
        form: 'postfix',
        op: expr.op === 'INC' ? 'increment' : 'decrement',
        target: exprToString(expr.operand),
        before: current,
        after: next,
        usedValue: current,
      });
      return { value: current, kind: lvalue.getKind() ?? 'int' };
    }

    case EXPR_TYPES.BINARY: {
      const left = evaluateTyped(expr.left, scope);
      const right = evaluateTyped(expr.right, scope);
      return applyBinaryOp(expr.op, left, right, language);
    }

    case EXPR_TYPES.LOGICAL: {
      const left = evaluateTyped(expr.left, scope);
      if (expr.op === 'AND' && !left.value) return { value: false, kind: 'bool' };
      if (expr.op === 'OR' && left.value) return { value: true, kind: 'bool' };
      // Short-circuit: the right operand is only evaluated (and its side effects
      // only applied) when actually needed — matches every supported language.
      const right = evaluateTyped(expr.right, scope);
      return { value: Boolean(right.value), kind: 'bool' };
    }

    case EXPR_TYPES.TERNARY: {
      const cond = evaluateTyped(expr.cond, scope);
      return cond.value ? evaluateTyped(expr.then, scope) : evaluateTyped(expr.else, scope);
    }

    case EXPR_TYPES.ASSIGN: {
      const lvalue = resolveLValue(expr.target, scope, language);
      if (!lvalue) throw new TraceError('Left-hand side of assignment is not a variable.');

      // Evaluate the RHS exactly once — critical for `sum *= i--`, where the RHS
      // (`i--`) has its own side effect (decrementing i) that must happen before
      // the compound operation combines it with the current value of `sum`.
      const rhs = evaluateTyped(expr.value, scope);

      if (expr.op === '=') {
        const targetKind = lvalue.getKind();
        const coerced = targetKind && targetKind !== 'auto' ? coerceToKind(rhs.value, targetKind) : rhs.value;
        lvalue.set(coerced);
        if (!targetKind || targetKind === 'auto') lvalue.setKind(rhs.kind);
        return { value: coerced, kind: targetKind && targetKind !== 'auto' ? targetKind : rhs.kind };
      }

      // Compound assignment: target = target OP rhs, using the TARGET's own
      // current value/kind (read fresh, since the RHS may have just mutated it —
      // e.g. `x = x + x++` — real compilers read the LHS's current value at the
      // point of combination, after all side effects of evaluating operands).
      const current = { value: lvalue.get(), kind: lvalue.getKind() ?? 'auto' };
      const op = expr.op.slice(0, -1); // '+=' -> '+'
      const combined = applyBinaryOp(binaryOpName(op), current, rhs, language);
      const targetKind = lvalue.getKind();
      const coerced = targetKind && targetKind !== 'auto' ? coerceToKind(combined.value, targetKind) : combined.value;
      lvalue.set(coerced);
      return { value: coerced, kind: targetKind && targetKind !== 'auto' ? targetKind : combined.kind };
    }

    case EXPR_TYPES.ARRAY_LITERAL:
      return { value: expr.elements.map((el) => evaluateExpr(el, scope)), kind: 'array' };

    case EXPR_TYPES.ARRAY_ACCESS: {
      const arr = evaluateExpr(expr.array, scope);
      const idx = evaluateExpr(expr.index, scope);
      const elementKind = expr.array.type === EXPR_TYPES.IDENT ? getVarType(scope, expr.array.name) : 'auto';
      if (Array.isArray(arr) && Number.isFinite(idx)) {
        return { value: arr[Math.trunc(idx)], kind: elementKind ?? 'auto' };
      }
      if (typeof arr === 'string' && Number.isFinite(idx)) {
        return { value: arr[Math.trunc(idx)], kind: 'char' };
      }
      return { value: undefined, kind: 'auto' };
    }

    case EXPR_TYPES.MEMBER_ACCESS: {
      const obj = evaluateExpr(expr.object, scope);
      if (expr.property === 'length') {
        if (Array.isArray(obj) || typeof obj === 'string') return { value: obj.length, kind: 'int' };
      }
      return { value: undefined, kind: 'auto' };
    }

    case EXPR_TYPES.CALL:
      return evaluateCall(expr, scope, language);

    case EXPR_TYPES.UNSUPPORTED:
      throw new TraceError(`Unable to trace this construct: ${expr.source}${expr.reason ? ` (${expr.reason})` : ''}`);

    default:
      return { value: undefined, kind: 'auto' };
  }
}

function binaryOpName(symbol) {
  const map = {
    '+': 'ADD',
    '-': 'SUBTRACT',
    '*': 'MULTIPLY',
    '/': 'DIVIDE',
    '%': 'MODULO',
    '&': 'BITAND',
    '|': 'BITOR',
    '^': 'BITXOR',
    '<<': 'SHL',
    '>>': 'SHR',
  };
  return map[symbol] ?? symbol;
}

function resolveLValue(node, scope, language) {
  if (node.type === EXPR_TYPES.IDENT) {
    return {
      get: () => scope[node.name],
      set: (v) => {
        scope[node.name] = v;
      },
      getKind: () => getVarType(scope, node.name),
      setKind: (k) => setVarType(scope, node.name, k),
    };
  }
  if (node.type === EXPR_TYPES.ARRAY_ACCESS) {
    const arr = evaluateExpr(node.array, scope);
    const idx = Math.trunc(evaluateExpr(node.index, scope));
    const arrayKind = node.array.type === EXPR_TYPES.IDENT ? getVarType(scope, node.array.name) : undefined;
    return {
      get: () => (Array.isArray(arr) ? arr[idx] : undefined),
      set: (v) => {
        if (Array.isArray(arr)) arr[idx] = v;
      },
      getKind: () => arrayKind,
      setKind: () => {}, // element type is inherited from the array's own declared type
    };
  }
  return null;
}

// Languages where `char` is a real numeric type — `'a' + 1` must promote to `int`
// arithmetic (98), not string concatenation. JS/Python have no distinct char type,
// so a quoted single character there really is just a (one-character) string, and
// `'a' + 1` genuinely means string concatenation ("a1") under those languages' own
// rules — this coercion is deliberately NOT applied to them.
const CHAR_IS_NUMERIC_LANG = new Set(['c', 'cpp', 'java']);

/** Converts a char-kind operand to its numeric char code for languages where `char`
 * is a real integral type; leaves every other operand's value untouched. */
function arithmeticValue(operand, language) {
  if (operand.kind === 'char' && typeof operand.value === 'string' && CHAR_IS_NUMERIC_LANG.has(language)) {
    return operand.value.charCodeAt(0);
  }
  return operand.value;
}

function applyBinaryOp(op, left, right, language) {
  if (left.value === undefined || right.value === undefined) return { value: undefined, kind: 'auto' };

  const lv = arithmeticValue(left, language);
  const rv = arithmeticValue(right, language);

  switch (op) {
    case 'ADD':
      // String concatenation if either side is a genuine string — matches every
      // supported language's `+` overload; otherwise numeric addition (a `char`
      // operand was already converted to its numeric code above, where applicable).
      if (typeof lv === 'string' || typeof rv === 'string') {
        return { value: String(lv) + String(rv), kind: 'string' };
      }
      return { value: lv + rv, kind: resultKind(left.kind, right.kind) };
    case 'SUBTRACT':
      return { value: lv - rv, kind: resultKind(left.kind, right.kind) };
    case 'MULTIPLY':
      return { value: lv * rv, kind: resultKind(left.kind, right.kind) };
    case 'DIVIDE':
      return typedDivide(lv, rv, left.kind, right.kind, language);
    case 'MODULO':
      return typedModulo(lv, rv, left.kind, right.kind, language);
    case 'FLOOR_DIV':
      return { value: Math.floor(lv / rv), kind: resultKind(left.kind, right.kind) };
    case 'EQ':
      return { value: left.value === right.value, kind: 'bool' };
    case 'NEQ':
      return { value: left.value !== right.value, kind: 'bool' };
    case 'LT':
      return { value: left.value < right.value, kind: 'bool' };
    case 'LTE':
      return { value: left.value <= right.value, kind: 'bool' };
    case 'GT':
      return { value: left.value > right.value, kind: 'bool' };
    case 'GTE':
      return { value: left.value >= right.value, kind: 'bool' };
    case 'BITAND':
      return { value: lv & rv, kind: resultKind(left.kind, right.kind) || 'int' };
    case 'BITOR':
      return { value: lv | rv, kind: resultKind(left.kind, right.kind) || 'int' };
    case 'BITXOR':
      return { value: lv ^ rv, kind: resultKind(left.kind, right.kind) || 'int' };
    case 'SHL':
      return { value: lv << rv, kind: left.kind ?? 'int' };
    case 'SHR':
      return { value: lv >> rv, kind: left.kind ?? 'int' };
    default:
      return { value: undefined, kind: 'auto' };
  }
}

/** Resolves a call's callee to a dotted name (`Math.floor`, `foo`), or null if the
 * callee isn't a plain identifier/member-access chain (e.g. a call expression). */
function resolveCallName(node) {
  if (node.type === EXPR_TYPES.IDENT) return node.name;
  if (node.type === EXPR_TYPES.MEMBER_ACCESS) {
    const base = resolveCallName(node.object);
    return base ? `${base}.${node.property}` : node.property;
  }
  return null;
}

/** Minimal built-in function support — matches what the previous engine special-cased. */
function evaluateCall(expr, scope, language) {
  const name = resolveCallName(expr.callee);

  if (name === 'Math.floor') {
    return { value: Math.floor(evaluateExpr(expr.args[0], scope)), kind: 'int' };
  }
  if (name === 'Math.ceil') {
    return { value: Math.ceil(evaluateExpr(expr.args[0], scope)), kind: 'int' };
  }
  if (name === 'Math.round') {
    return { value: Math.round(evaluateExpr(expr.args[0], scope)), kind: 'int' };
  }
  if (name === 'Math.abs' || name === 'abs') {
    return { value: Math.abs(evaluateExpr(expr.args[0], scope)), kind: 'auto' };
  }
  if (name === 'Math.pow' || name === 'pow') {
    const args = expr.args.map((a) => evaluateExpr(a, scope));
    return { value: Math.pow(args[0], args[1]), kind: 'auto' };
  }
  if (name === 'Math.sqrt' || name === 'sqrt') {
    return { value: Math.sqrt(evaluateExpr(expr.args[0], scope)), kind: 'double' };
  }
  if (name === 'Math.max' || name === 'max') {
    return { value: Math.max(...expr.args.map((a) => evaluateExpr(a, scope))), kind: 'auto' };
  }
  if (name === 'Math.min' || name === 'min') {
    return { value: Math.min(...expr.args.map((a) => evaluateExpr(a, scope))), kind: 'auto' };
  }

  if (name === 'range') {
    const args = expr.args.map((a) => evaluateExpr(a, scope));
    return { value: buildRange(args), kind: 'array' };
  }
  if (name === 'len') {
    const arg = evaluateExpr(expr.args[0], scope);
    if (Array.isArray(arg) || typeof arg === 'string') return { value: arg.length, kind: 'int' };
    return { value: undefined, kind: 'int' };
  }
  if (name === 'int') {
    const arg = evaluateExpr(expr.args[0], scope);
    return { value: Math.trunc(Number(arg)), kind: 'int' };
  }
  if (name === 'float' || name === 'double') {
    const arg = evaluateExpr(expr.args[0], scope);
    return { value: Number(arg), kind: 'float' };
  }
  if (name === 'str' || name === 'String') {
    const arg = evaluateExpr(expr.args[0], scope);
    return { value: String(arg), kind: 'string' };
  }
  if (name === 'abs' || name === 'Math.abs') {
    const arg = evaluateExpr(expr.args[0], scope);
    return { value: Math.abs(arg), kind: 'auto' };
  }

  // Unrecognized function call (custom user function). Evaluating arguments for
  // their side effects is reasonable, but the call's return value genuinely can't
  // be known without invoking real function-call tracing, which this pass doesn't
  // implement — surfaced as `undefined`, not a guessed value, consistent with the
  // "don't silently mistrace" principle for constructs the engine can't model yet.
  expr.args.forEach((a) => evaluateExpr(a, scope));
  return { value: undefined, kind: 'auto' };
}

function buildRange(args) {
  // `args` are plain evaluated values (evaluateCall passes them through evaluateExpr,
  // not evaluateTyped), not {value, kind} pairs.
  let start = 0;
  let end = 0;
  let step = 1;
  if (args.length === 1) {
    end = args[0];
  } else if (args.length === 2) {
    start = args[0];
    end = args[1];
  } else if (args.length >= 3) {
    start = args[0];
    end = args[1];
    step = args[2];
  }
  const result = [];
  if (step > 0) {
    for (let i = start; i < end; i += step) result.push(i);
  } else if (step < 0) {
    for (let i = start; i > end; i += step) result.push(i);
  }
  return result;
}

/**
 * Evaluates a raw source string. Now a thin wrapper around the same tokenize/parse/
 * evaluate pipeline as `evaluateExpr` — no more `new Function`/`eval`. Kept as a
 * separate export because several callers (array-index sources, loop-increment
 * clauses) still pass raw strings rather than pre-parsed AST nodes.
 */
export function evaluateRawExpression(source, scope) {
  const trimmed = (source ?? '').trim();
  if (!trimmed) return undefined;
  return evaluateExpr(parseExpression(trimmed), scope);
}

export function evaluateCondition(expr, scope) {
  if (typeof expr === 'string') {
    return Boolean(evaluateRawExpression(expr, scope));
  }
  return Boolean(evaluateExpr(expr, scope));
}

export function evaluatePrintArgs(argsExpr, scope) {
  if (!argsExpr?.length) return '';
  return argsExpr
    .map((arg) => {
      if (typeof arg === 'string') return evaluateRawExpression(arg, scope);
      return evaluateExpr(arg, scope);
    })
    .map((v) => (v === undefined ? '' : String(v)))
    .join(' ');
}

/**
 * Evaluates printf-style arguments and interpolates them into the format string's
 * `%d`/`%5d`/`%.2f`/`%s`/`%c` placeholders, in order. The previous engine discarded
 * the format string entirely and just space-joined the (mis-evaluated) arguments —
 * which is why `printf("sum=%5d i=%d\n", --sum, ++i)` printed a single space instead
 * of `sum=    7 i=5`.
 */
export function evaluatePrintf(formatSource, argsExpr, scope) {
  const format = parseCLikeStringLiteral(formatSource);
  const values = (argsExpr ?? []).map((arg) => (typeof arg === 'string' ? evaluateRawExpression(arg, scope) : evaluateExpr(arg, scope)));
  let argIndex = 0;

  const text = format.replace(/%([-+0]*)(\d*)(?:\.(\d+))?([diouxXfFeEgGscn%])/g, (whole, flags, width, precision, conv) => {
    if (conv === '%') return '%';
    const value = values[argIndex++];
    return formatConversion(value, conv, flags, width ? Number(width) : undefined, precision ? Number(precision) : undefined);
  });

  return text;
}

function formatConversion(value, conv, flags, width, precision) {
  let out;
  switch (conv) {
    case 'd':
    case 'i':
    case 'u':
      out = String(Math.trunc(Number(value ?? 0)));
      break;
    case 'f':
    case 'F':
      out = Number(value ?? 0).toFixed(precision ?? 6);
      break;
    case 'e':
    case 'E':
      out = Number(value ?? 0).toExponential(precision ?? 6);
      break;
    case 'x':
      out = Math.trunc(Number(value ?? 0)).toString(16);
      break;
    case 'X':
      out = Math.trunc(Number(value ?? 0)).toString(16).toUpperCase();
      break;
    case 'o':
      out = Math.trunc(Number(value ?? 0)).toString(8);
      break;
    case 'c':
      out = typeof value === 'number' ? String.fromCharCode(value) : String(value ?? '');
      break;
    case 's':
      out = value === undefined ? '' : String(value);
      break;
    default:
      out = value === undefined ? '' : String(value);
  }

  if (width && out.length < width) {
    const pad = width - out.length;
    if (flags.includes('-')) out = out + ' '.repeat(pad);
    else if (flags.includes('0') && /^-?\d/.test(out)) {
      const negative = out.startsWith('-');
      const digits = negative ? out.slice(1) : out;
      out = (negative ? '-' : '') + '0'.repeat(pad) + digits;
    } else out = ' '.repeat(pad) + out;
  }
  return out;
}

function parseCLikeStringLiteral(source) {
  const trimmed = (source ?? '').trim();
  const match = trimmed.match(/^"(.*)"$/s);
  const inner = match ? match[1] : trimmed;
  return inner
    .replace(/\\n/g, '\n')
    .replace(/\\t/g, '\t')
    .replace(/\\r/g, '\r')
    .replace(/\\"/g, '"')
    .replace(/\\\\/g, '\\');
}

export function formatValue(value) {
  if (typeof value === 'string') return `"${value}"`;
  if (Array.isArray(value)) return `[${value.map(formatValue).join(', ')}]`;
  if (value === undefined) return 'undefined';
  if (value === null) return 'null';
  return String(value);
}

export default {
  evaluateExpr,
  evaluateTyped,
  evaluateRawExpression,
  evaluateCondition,
  evaluatePrintArgs,
  evaluatePrintf,
  formatValue,
  TraceError,
};
