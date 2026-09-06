/**
 * IR Expression AST — language-independent expression representation.
 *
 * `parseExpressionString` now delegates to engine/expressionParser.js (a real
 * tokenizer + precedence-climbing parser) instead of scanning for the last
 * top-level occurrence of one of six single-character operators. The previous
 * approach could not distinguish `i++` from `i + +`, had no representation for
 * prefix-vs-postfix increment, and had no notion of assignment as an expression —
 * which is why compound-in-expression side effects like `sum = sum / i++` silently
 * fell through to an unsafe `new Function`-based fallback elsewhere in the engine.
 * See NEXT_PHASE_MANUAL_TRACING_FIX_REPORT.md for the full investigation.
 *
 * `EXPR_TYPES` and the node shapes below are kept identical (including the
 * lowercase string values) to what existed before, so every other consumer of this
 * module (ir/program.js's `normalizeProgram`, parsers/common.js, parsers/
 * blockParser.js) keeps working without changes — the new, richer node kinds
 * (`unary`, `pre_incdec`, `post_incdec`, `logical`, `ternary`, `assign`, `call`,
 * `member_access`, `unsupported`) are additive.
 */

import { parseExpression, NODE } from '../engine/expressionParser.js';

export const EXPR_TYPES = NODE;

/** @typedef {object} IRExpression */

/**
 * Parse a source expression string into an IR expression tree.
 */
export function parseExpressionString(expr) {
  return parseExpression(expr);
}

export function splitTopLevelCommas(str) {
  const parts = [];
  let current = '';
  let quote = null;
  let depth = 0;
  for (let i = 0; i < str.length; i += 1) {
    const ch = str[i];
    if (quote) {
      current += ch;
      if (ch === quote && str[i - 1] !== '\\') quote = null;
      continue;
    }
    if (ch === '"' || ch === "'") {
      quote = ch;
      current += ch;
      continue;
    }
    if ('([{'.includes(ch)) depth += 1;
    if (')]}'.includes(ch)) depth -= 1;
    if (ch === ',' && depth === 0) {
      parts.push(current.trim());
      current = '';
      continue;
    }
    current += ch;
  }
  if (current.trim()) parts.push(current.trim());
  return parts;
}

// Maps the evaluator's internal binary opcode names back to their source symbols,
// purely for human-readable reconstructions (explain/explanations.js) — the opcode
// name itself (`expr.op`) is untouched and still drives evaluation.
const BINARY_OP_SYMBOLS = {
  ADD: '+',
  SUBTRACT: '-',
  MULTIPLY: '*',
  DIVIDE: '/',
  MODULO: '%',
  FLOOR_DIV: '//',
  EQ: '==',
  NEQ: '!=',
  LT: '<',
  LTE: '<=',
  GT: '>',
  GTE: '>=',
  BITAND: '&',
  BITOR: '|',
  BITXOR: '^',
  SHL: '<<',
  SHR: '>>',
};

export function exprToString(expr) {
  if (!expr) return '';
  switch (expr.type) {
    case EXPR_TYPES.LITERAL:
      return typeof expr.value === 'string' ? `"${expr.value}"` : String(expr.value);
    case EXPR_TYPES.IDENT:
      return expr.name;
    case EXPR_TYPES.BINARY:
      return `${exprToString(expr.left)} ${BINARY_OP_SYMBOLS[expr.op] ?? expr.op} ${exprToString(expr.right)}`;
    case EXPR_TYPES.LOGICAL:
      return `${exprToString(expr.left)} ${expr.op === 'AND' ? '&&' : '||'} ${exprToString(expr.right)}`;
    case EXPR_TYPES.UNARY:
      return `${expr.op === 'NEGATE' ? '-' : expr.op === 'NOT' ? '!' : '~'}${exprToString(expr.operand)}`;
    case EXPR_TYPES.PRE_INCDEC:
      return `${expr.op === 'INC' ? '++' : '--'}${exprToString(expr.operand)}`;
    case EXPR_TYPES.POST_INCDEC:
      return `${exprToString(expr.operand)}${expr.op === 'INC' ? '++' : '--'}`;
    case EXPR_TYPES.ASSIGN:
      return `${exprToString(expr.target)} ${expr.op} ${exprToString(expr.value)}`;
    case EXPR_TYPES.TERNARY:
      return `${exprToString(expr.cond)} ? ${exprToString(expr.then)} : ${exprToString(expr.else)}`;
    case EXPR_TYPES.ARRAY_LITERAL:
      return `[${expr.elements.map(exprToString).join(', ')}]`;
    case EXPR_TYPES.ARRAY_ACCESS:
      return `${exprToString(expr.array)}[${exprToString(expr.index)}]`;
    case EXPR_TYPES.CALL:
      return `${exprToString(expr.callee)}(${expr.args.map(exprToString).join(', ')})`;
    case EXPR_TYPES.UNSUPPORTED:
      return expr.source;
    default:
      return String(expr);
  }
}

export default { EXPR_TYPES, parseExpressionString, splitTopLevelCommas, exprToString };
