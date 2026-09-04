/**
 * IR Expression AST — language-independent expression representation.
 */

export const EXPR_TYPES = Object.freeze({
  LITERAL: 'literal',
  IDENT: 'ident',
  UNARY: 'unary',
  BINARY: 'binary',
  ARRAY_LITERAL: 'array_literal',
  ARRAY_ACCESS: 'array_access',
  ARRAY_UPDATE: 'array_update',
  MEMBER_ACCESS: 'member_access',
  FUNCTION_CALL: 'function_call',
  STRING_CONCAT: 'string_concat',
  RAW: 'raw',
});

/** @typedef {object} IRExpression */

/**
 * Parse a source expression string into an IR expression tree.
 * Used by language parsers when they encounter inline expressions.
 */
export function parseExpressionString(expr, scope = {}) {
  const trimmed = (expr ?? '').trim();
  if (!trimmed) return { type: EXPR_TYPES.LITERAL, value: undefined };

  if (/^["'].*["']$/.test(trimmed)) {
    return { type: EXPR_TYPES.LITERAL, value: trimmed.slice(1, -1) };
  }
  if (/^-?\d+(\.\d+)?$/.test(trimmed)) {
    return { type: EXPR_TYPES.LITERAL, value: Number(trimmed) };
  }
  if (/^(true|false)$/i.test(trimmed)) {
    return { type: EXPR_TYPES.LITERAL, value: trimmed.toLowerCase() === 'true' };
  }
  if (trimmed === 'null') {
    return { type: EXPR_TYPES.LITERAL, value: null };
  }

  const arrayMatch = trimmed.match(/^\[(.*)\]$/s) || trimmed.match(/^\{(.*)\}$/s);
  if (arrayMatch) {
    const inner = arrayMatch[1].trim();
    if (!inner) return { type: EXPR_TYPES.ARRAY_LITERAL, elements: [] };
    const elements = splitTopLevelCommas(inner).map((part) => parseExpressionString(part.trim(), scope));
    return { type: EXPR_TYPES.ARRAY_LITERAL, elements };
  }

  const indexMatch = trimmed.match(/^(\w+)\s*\[\s*(.+?)\s*\]$/);
  if (indexMatch) {
    return {
      type: EXPR_TYPES.ARRAY_ACCESS,
      array: { type: EXPR_TYPES.IDENT, name: indexMatch[1] },
      index: parseExpressionString(indexMatch[2], scope),
    };
  }

  const binOps = [
    ['//', 'FLOOR_DIV'],
    ['+', 'ADD'],
    ['-', 'SUBTRACT'],
    ['*', 'MULTIPLY'],
    ['/', 'DIVIDE'],
    ['%', 'MODULO'],
  ];
  for (const [sym, op] of binOps) {
    const idx = findTopLevelOperator(trimmed, sym);
    if (idx >= 0) {
      return {
        type: EXPR_TYPES.BINARY,
        op,
        left: parseSubExpression(trimmed.slice(0, idx).trim(), scope),
        right: parseSubExpression(trimmed.slice(idx + sym.length).trim(), scope),
      };
    }
  }

  if (/^[a-zA-Z_]\w*$/.test(trimmed)) {
    return { type: EXPR_TYPES.IDENT, name: trimmed };
  }

  return { type: EXPR_TYPES.RAW, source: trimmed };
}

function parseSubExpression(part, scope) {
  const trimmed = part.trim();
  if (trimmed.startsWith('(') && trimmed.endsWith(')')) {
    let depth = 0;
    let wraps = true;
    for (let i = 0; i < trimmed.length; i += 1) {
      if (trimmed[i] === '(') depth += 1;
      if (trimmed[i] === ')') depth -= 1;
      if (depth === 0 && i < trimmed.length - 1) {
        wraps = false;
        break;
      }
    }
    if (wraps) return parseExpressionString(trimmed.slice(1, -1), scope);
  }
  return parseExpressionString(trimmed, scope);
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

function findTopLevelOperator(expr, op) {
  let quote = null;
  let depth = 0;
  for (let i = expr.length - op.length; i >= 0; i -= 1) {
    const ch = expr[i];
    if (quote) {
      if (ch === quote && expr[i - 1] !== '\\') quote = null;
      continue;
    }
    if (ch === '"' || ch === "'") {
      quote = ch;
      continue;
    }
    if (')]}'.includes(ch)) depth += 1;
    if ('([{'.includes(ch)) depth -= 1;
    if (depth === 0 && expr.slice(i, i + op.length) === op) {
      if (op === '-' && i > 0 && /[\d\w)]/.test(expr[i - 1])) continue;
      return i;
    }
  }
  return -1;
}

export function exprToString(expr) {
  if (!expr) return '';
  switch (expr.type) {
    case EXPR_TYPES.LITERAL:
      return typeof expr.value === 'string' ? `"${expr.value}"` : String(expr.value);
    case EXPR_TYPES.IDENT:
      return expr.name;
    case EXPR_TYPES.BINARY:
      return `${exprToString(expr.left)} ${expr.op} ${exprToString(expr.right)}`;
    case EXPR_TYPES.ARRAY_LITERAL:
      return `[${expr.elements.map(exprToString).join(', ')}]`;
    case EXPR_TYPES.ARRAY_ACCESS:
      return `${exprToString(expr.array)}[${exprToString(expr.index)}]`;
    case EXPR_TYPES.RAW:
      return expr.source;
    default:
      return String(expr);
  }
}
