/**
 * Shared parser utilities for all language parsers.
 */

import { IR_OPCODES } from '../ir/opcodes.js';
import { createInstruction } from '../ir/program.js';
import { parseExpressionString, splitTopLevelCommas } from '../ir/expressions.js';

export function stripComment(raw, language) {
  let line = raw;
  if (language === 'python') {
    const hash = line.indexOf('#');
    if (hash >= 0) line = line.slice(0, hash);
  } else {
    const slash = line.indexOf('//');
    if (slash >= 0) line = line.slice(0, slash);
  }
  return line.trimEnd();
}

export function isCommentOnly(line, language) {
  const trimmed = line.trim();
  if (!trimmed) return true;
  if (language === 'python') return trimmed.startsWith('#');
  return trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*');
}

export function getIndent(raw) {
  const match = raw.match(/^(\s*)/);
  return match ? match[1].length : 0;
}

export function parseLines(source) {
  return source.split('\n').map((raw, index) => ({
    raw,
    index,
    indent: getIndent(raw),
  }));
}

export function findPythonBlockEnd(lines, startIndex, baseIndent) {
  let lastBodyLine = startIndex;
  for (let i = startIndex + 1; i < lines.length; i += 1) {
    const content = stripComment(lines[i].raw, 'python');
    if (!content.trim()) continue;
    if (getIndent(lines[i].raw) <= baseIndent) return lastBodyLine;
    lastBodyLine = i;
  }
  return lastBodyLine;
}

export function findBraceBlockEnd(lines, startIndex) {
  let depth = 0;
  let started = false;
  for (let i = startIndex; i < lines.length; i += 1) {
    const text = lines[i].raw;
    for (const ch of text) {
      if (ch === '{') {
        depth += 1;
        started = true;
      } else if (ch === '}') {
        depth -= 1;
        if (started && depth === 0) return i;
      }
    }
    if (started && i > startIndex && depth === 0) return i;
  }
  return lines.length - 1;
}

export function parseAssignment(line) {
  const trimmed = line.trim().replace(/;$/, '');

  const pyMatch = trimmed.match(/^([a-zA-Z_]\w*)\s*=\s*(.+)$/);
  if (pyMatch && !trimmed.includes('==') && !trimmed.includes('!=')) {
    return { target: pyMatch[1], expr: pyMatch[2] };
  }

  const declMatch = trimmed.match(
    /^(?:(?:const|let|var|int|long|float|double|char|string|std::string|String|boolean|auto)\s+)?([a-zA-Z_]\w*(?:\[\])?)\s*=\s*(.+)$/
  );
  if (declMatch && !trimmed.includes('==') && !trimmed.match(/^for\s*\(/)) {
    return { target: declMatch[1].replace('[]', ''), expr: declMatch[2] };
  }

  const javaArrayMatch = trimmed.match(/^(int|String|char|double|float)\[\]\s+(\w+)\s*=\s*\{(.+)\}$/);
  if (javaArrayMatch) {
    return { target: javaArrayMatch[2], expr: `{${javaArrayMatch[3]}}` };
  }

  const arrayUpdateMatch = trimmed.match(/^(\w+)\s*\[\s*(.+?)\s*\]\s*=\s*(.+)$/);
  if (arrayUpdateMatch) {
    return {
      arrayUpdate: true,
      arrayName: arrayUpdateMatch[1],
      index: arrayUpdateMatch[2],
      expr: arrayUpdateMatch[3],
    };
  }

  return null;
}

export function parsePrint(line) {
  const trimmed = line.trim().replace(/;$/, '');

  if (trimmed.startsWith('print(') && trimmed.endsWith(')')) {
    return { args: trimmed.slice(6, -1) };
  }
  if (trimmed.startsWith('console.log(') && trimmed.endsWith(')')) {
    return { args: trimmed.slice(12, -1) };
  }
  if (trimmed.match(/System\.out\.println\s*\(/)) {
    const start = trimmed.indexOf('(');
    const end = trimmed.lastIndexOf(')');
    return { args: trimmed.slice(start + 1, end) };
  }
  if (trimmed.includes('cout') && trimmed.includes('<<')) {
    const parts = trimmed
      .replace(/^.*cout\s*<</, '')
      .split('<<')
      .map((p) => p.replace(/;$/, '').replace(/endl.*/, '').trim())
      .filter((p) => p && p !== 'endl');
    return { args: parts.join(', ') };
  }
  if (trimmed.startsWith('printf(')) {
    const start = trimmed.indexOf('(');
    const end = trimmed.lastIndexOf(')');
    const inner = trimmed.slice(start + 1, end);
    const comma = inner.indexOf(',');
    if (comma >= 0) return { args: inner.slice(comma + 1).trim() };
  }

  return null;
}

export function parseSwap(line) {
  const trimmed = line.trim().replace(/;$/, '');
  const match = trimmed.match(
    /^(?:swap\s*\(\s*)?(\w+)\s*\[\s*(.+?)\s*\]\s*,\s*(\w+)\s*\[\s*(.+?)\s*\]\s*\)?$/
  );
  if (match && match[1] === match[3]) {
    return { arrayName: match[1], leftSource: match[2], rightSource: match[4] };
  }
  const tmpMatch = trimmed.match(/^(\w+)\s*=\s*(\w+)\[(\w+)\];\s*(\w+)\[(\w+)\]\s*=\s*(\w+)\[(\w+)\];\s*(\w+)\[(\w+)\]\s*=\s*\1;$/);
  if (tmpMatch) {
    return {
      arrayName: tmpMatch[2],
      leftSource: tmpMatch[3],
      rightSource: tmpMatch[5],
    };
  }
  return null;
}

export function buildAssignInstruction(lineIndex, raw, assign, isDeclare = false) {
  const op = isDeclare ? IR_OPCODES.DECLARE_VARIABLE : IR_OPCODES.ASSIGN;
  return createInstruction(op, lineIndex + 1, raw, {
    target: assign.target,
    valueExpr: parseExpressionString(assign.expr),
    valueSource: assign.expr,
  });
}

export function buildArrayUpdateInstruction(lineIndex, raw, update) {
  return createInstruction(IR_OPCODES.ARRAY_UPDATE, lineIndex + 1, raw, {
    arrayName: update.arrayName,
    indexExpr: parseExpressionString(update.index),
    indexSource: update.index,
    valueExpr: parseExpressionString(update.expr),
    valueSource: update.expr,
  });
}

export function buildPrintInstruction(lineIndex, raw, print) {
  const args = splitTopLevelCommas(print.args).map((a) => parseExpressionString(a.trim()));
  return createInstruction(IR_OPCODES.PRINT, lineIndex + 1, raw, {
    argsExpr: args,
    argsSource: print.args,
  });
}

export function buildCommentInstruction(lineIndex, raw) {
  return createInstruction(IR_OPCODES.COMMENT, lineIndex + 1, raw);
}

export function buildStatementInstruction(lineIndex, raw) {
  return createInstruction(IR_OPCODES.STATEMENT, lineIndex + 1, raw);
}

export default {
  stripComment,
  isCommentOnly,
  getIndent,
  parseLines,
  findPythonBlockEnd,
  findBraceBlockEnd,
  parseAssignment,
  parsePrint,
  parseSwap,
};
