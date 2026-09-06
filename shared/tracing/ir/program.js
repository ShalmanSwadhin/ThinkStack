/**
 * IR Program model — container for parsed intermediate representation.
 */

import { IR_OPCODES } from './opcodes.js';

/**
 * @typedef {object} IRInstruction
 * @property {string} op - Opcode from IR_OPCODES
 * @property {number} line - 1-based source line number
 * @property {string} sourceLine - Original source text
 * @property {number} index - Position in instruction array
 */

/**
 * @typedef {object} IRProgram
 * @property {string} language
 * @property {number} lineCount
 * @property {string} sourceHash
 * @property {IRInstruction[]} instructions
 * @property {object} metadata
 */

export function createInstruction(op, line, sourceLine, fields = {}) {
  return { op, line, sourceLine, ...fields };
}

export function createProgram(language, source, instructions) {
  const lines = source.split('\n');
  return {
    language,
    lineCount: lines.length,
    sourceHash: hashSource(source, language),
    instructions: instructions.map((inst, index) => ({ ...inst, index })),
    metadata: { parsedAt: Date.now() },
  };
}

export function hashSource(source, language) {
  let hash = 2166136261;
  const str = `${language}:${source}`;
  for (let i = 0; i < str.length; i += 1) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36);
}

/** Normalize IR program for cross-language equivalence comparison */
export function normalizeProgram(program) {
  const normalized = [];
  for (const inst of program.instructions) {
    const entry = { op: inst.op };
    switch (inst.op) {
      case IR_OPCODES.DECLARE_VARIABLE:
      case IR_OPCODES.ASSIGN:
        entry.target = inst.target;
        if (inst.valueExpr) entry.value = simplifyExpr(inst.valueExpr);
        break;
      case IR_OPCODES.FOR_EACH:
        entry.variable = inst.variable;
        entry.iterable = simplifyExpr(inst.iterableExpr);
        break;
      case IR_OPCODES.FOR_LOOP:
        entry.condition = inst.conditionSource ?? simplifyExpr(inst.conditionExpr);
        break;
      case IR_OPCODES.WHILE_LOOP:
        entry.condition = inst.conditionSource ?? simplifyExpr(inst.conditionExpr);
        break;
      case IR_OPCODES.PRINT:
        entry.args = (inst.argsExpr ?? []).map(simplifyExpr);
        break;
      case IR_OPCODES.COMPARE:
      case IR_OPCODES.SEARCH_COMPARE:
        entry.left = simplifyExpr(inst.leftExpr);
        entry.right = simplifyExpr(inst.rightExpr);
        entry.operator = inst.operator;
        break;
      case IR_OPCODES.SORT_SWAP:
        entry.left = inst.leftIndex;
        entry.right = inst.rightIndex;
        break;
      case IR_OPCODES.ARRAY_UPDATE:
        entry.array = inst.arrayName;
        entry.index = simplifyExpr(inst.indexExpr);
        break;
      default:
        break;
    }
    normalized.push(entry);
  }
  return normalized;
}

function simplifyExpr(expr) {
  if (!expr) return null;
  if (expr.type === 'literal') return expr.value;
  if (expr.type === 'ident') return `$${expr.name}`;
  if (expr.type === 'unsupported') return expr.source;
  if (expr.type === 'binary' || expr.type === 'logical') {
    return { op: expr.op, l: simplifyExpr(expr.left), r: simplifyExpr(expr.right) };
  }
  if (expr.type === 'array_literal') {
    return expr.elements.map(simplifyExpr);
  }
  if (expr.type === 'array_access') {
    return { arr: simplifyExpr(expr.array), idx: simplifyExpr(expr.index) };
  }
  if (expr.type === 'pre_incdec' || expr.type === 'post_incdec') {
    return { op: expr.op, post: expr.type === 'post_incdec', operand: simplifyExpr(expr.operand) };
  }
  if (expr.type === 'assign') {
    return { op: expr.op, target: simplifyExpr(expr.target), value: simplifyExpr(expr.value) };
  }
  return expr;
}

export default { createInstruction, createProgram, hashSource, normalizeProgram };
