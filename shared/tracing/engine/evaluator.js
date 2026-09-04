/**
 * IR Expression Evaluator — evaluates IR expression AST against runtime scope.
 */

import { EXPR_TYPES } from '../ir/expressions.js';

export function evaluateExpr(expr, scope) {
  if (!expr) return undefined;

  switch (expr.type) {
    case EXPR_TYPES.LITERAL:
      return expr.value;
    case EXPR_TYPES.IDENT:
      return scope[expr.name];
    case EXPR_TYPES.UNARY: {
      const val = evaluateExpr(expr.operand, scope);
      if (expr.op === 'NEGATE') return -val;
      if (expr.op === 'NOT') return !val;
      return val;
    }
    case EXPR_TYPES.BINARY: {
      const left = evaluateExpr(expr.left, scope);
      const right = evaluateExpr(expr.right, scope);
      return applyBinaryOp(expr.op, left, right);
    }
    case EXPR_TYPES.ARRAY_LITERAL:
      return expr.elements.map((el) => evaluateExpr(el, scope));
    case EXPR_TYPES.ARRAY_ACCESS: {
      const arr = evaluateExpr(expr.array, scope);
      const idx = evaluateExpr(expr.index, scope);
      if (Array.isArray(arr) && Number.isFinite(idx)) {
        return arr[Math.floor(idx)];
      }
      return undefined;
    }
    case EXPR_TYPES.STRING_CONCAT: {
      return expr.parts
        .map((p) => evaluateExpr(p, scope))
        .map((v) => (v === undefined ? '' : String(v)))
        .join('');
    }
    case EXPR_TYPES.RAW:
      return evaluateRawExpression(expr.source, scope);
    default:
      return undefined;
  }
}

function applyBinaryOp(op, left, right) {
  if (left === undefined || right === undefined) return undefined;
  switch (op) {
    case 'ADD':
      return left + right;
    case 'SUBTRACT':
      return left - right;
    case 'MULTIPLY':
      return left * right;
    case 'DIVIDE':
      return right !== 0 ? left / right : undefined;
    case 'MODULO':
      return left % right;
    case 'EQ':
      return left === right;
    case 'NEQ':
      return left !== right;
    case 'LT':
      return left < right;
    case 'LTE':
      return left <= right;
    case 'GT':
      return left > right;
    case 'GTE':
      return left >= right;
    case 'FLOOR_DIV':
      return Math.floor(left / right);
    default:
      return undefined;
  }
}

export function evaluateRawExpression(source, scope) {
  const trimmed = preprocessExpression((source ?? '').trim());
  if (!trimmed) return undefined;

  if (/^["'].*["']$/.test(trimmed)) return trimmed.slice(1, -1);
  if (/^-?\d+(\.\d+)?$/.test(trimmed)) return Number(trimmed);
  if (/^(true|false)$/i.test(trimmed)) return trimmed.toLowerCase() === 'true';
  if (trimmed === 'null') return null;
  if (scope[trimmed] !== undefined) return scope[trimmed];

  const arrayLiteral = trimmed.match(/^\[(.*)\]$/s) || trimmed.match(/^\{(.*)\}$/s);
  if (arrayLiteral) {
    const inner = arrayLiteral[1].trim();
    if (!inner) return [];
    return inner.split(',').map((part) => evaluateRawExpression(part.trim(), scope));
  }

  const indexMatch = trimmed.match(/^(\w+)\s*\[\s*(.+?)\s*\]$/);
  if (indexMatch) {
    const arr = scope[indexMatch[1]];
    const idx = evaluateRawExpression(indexMatch[2], scope);
    if (Array.isArray(arr) && Number.isFinite(idx)) {
      return arr[Math.floor(idx)];
    }
  }

  const rangeMatch = trimmed.match(/^range\s*\(\s*(.+?)\s*\)$/);
  if (rangeMatch) {
    return evaluateRange(rangeMatch[1], scope);
  }

  try {
    const keys = Object.keys(scope);
    const values = keys.map((k) => scope[k]);
    const fn = new Function(...keys, `return (${trimmed});`);
    const result = fn(...values);
    if (result !== undefined || trimmed.includes('(')) return result;
  } catch {
    // fall through
  }

  const concatMatch = trimmed.match(/^(.+?)\s*\+\s*(.+)$/);
  if (concatMatch) {
    const left = evaluateRawExpression(concatMatch[1], scope);
    const right = evaluateRawExpression(concatMatch[2], scope);
    if (left !== undefined && right !== undefined) return String(left) + String(right);
  }

  const binMatch = trimmed.match(/^(.+?)\s*([+\-*/%])\s*(.+)$/);
  if (binMatch) {
    const left = evaluateRawExpression(binMatch[1], scope);
    const right = evaluateRawExpression(binMatch[3], scope);
    if (left === undefined || right === undefined) return undefined;
    switch (binMatch[2]) {
      case '+':
        return left + right;
      case '-':
        return left - right;
      case '*':
        return left * right;
      case '/':
        return right !== 0 ? left / right : undefined;
      case '%':
        return left % right;
      default:
        return undefined;
    }
  }

  return trimmed;
}

function evaluateRange(argsStr, scope) {
  const parts = argsStr.split(',').map((p) => evaluateRawExpression(p.trim(), scope));
  let start = 0;
  let end = 0;
  let step = 1;
  if (parts.length === 1) {
    end = parts[0];
  } else if (parts.length === 2) {
    start = parts[0];
    end = parts[1];
  } else if (parts.length >= 3) {
    start = parts[0];
    end = parts[1];
    step = parts[2];
  }
  const result = [];
  if (step > 0) {
    for (let i = start; i < end; i += step) result.push(i);
  } else if (step < 0) {
    for (let i = start; i > end; i += step) result.push(i);
  }
  return result;
}

export function evaluateCondition(expr, scope) {
  if (typeof expr === 'string') {
    const trimmed = preprocessCondition(expr.trim());
    try {
      const keys = Object.keys(scope);
      const values = keys.map((k) => scope[k]);
      return Boolean(new Function(...keys, `return (${trimmed});`)(...values));
    } catch {
      return Boolean(evaluateRawExpression(trimmed, scope));
    }
  }
  return Boolean(evaluateExpr(expr, scope));
}

function preprocessCondition(expr) {
  return preprocessExpression(expr);
}

function preprocessExpression(expr) {
  let result = expr
    .replace(/\band\b/g, '&&')
    .replace(/\bor\b/g, '||')
    .replace(/\bnot\s+/g, '!');
  result = result.replace(/([^/\n]+?)\s*\/\/\s*(\S+)/g, 'Math.floor($1/$2)');
  return result;
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

export function formatValue(value) {
  if (typeof value === 'string') return `"${value}"`;
  if (Array.isArray(value)) return `[${value.map(formatValue).join(', ')}]`;
  if (value === undefined) return 'undefined';
  if (value === null) return 'null';
  return String(value);
}

export default {
  evaluateExpr,
  evaluateRawExpression,
  evaluateCondition,
  evaluatePrintArgs,
  formatValue,
};
