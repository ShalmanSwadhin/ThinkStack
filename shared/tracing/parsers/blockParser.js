/**
 * Recursive statement block parser — shared across all language parsers.
 */

import { IR_OPCODES } from '../ir/opcodes.js';
import { createInstruction } from '../ir/program.js';
import { parseExpressionString } from '../ir/expressions.js';
import {
  stripComment,
  isCommentOnly,
  findPythonBlockEnd,
  findBraceBlockEnd,
  parseAssignment,
  parsePrint,
  parseSwap,
  buildAssignInstruction,
  buildArrayUpdateInstruction,
  buildPrintInstruction,
  buildCommentInstruction,
  buildStatementInstruction,
} from './common.js';

export function parseStatementBlock(lines, startIndex, endIndex, instructions, language, options = {}) {
  const blockStyle = options.blockStyle ?? (language === 'python' ? 'indent' : 'brace');
  let i = startIndex;

  while (i <= endIndex && i < lines.length) {
    const { raw, index } = lines[i];
    const line = stripComment(raw, language);

    if (!line.trim() || isCommentOnly(raw, language)) {
      instructions.push(buildCommentInstruction(index, raw));
      i += 1;
      continue;
    }

    if (options.skipPatterns?.some((p) => p.test(line.trim()))) {
      instructions.push(buildStatementInstruction(index, raw));
      i += 1;
      continue;
    }

    if (blockStyle === 'brace' && (line.trim() === '}' || line.trim() === '};' || line.trim() === '{')) {
      instructions.push(buildStatementInstruction(index, raw));
      i += 1;
      continue;
    }

    // Python for loop
    const pyFor = language === 'python' ? line.trim().match(/^for\s+(\w+)\s+in\s+(.+):$/) : null;
    if (pyFor) {
      const bodyEndLine = findPythonBlockEnd(lines, i, lines[i].indent);
      const headerIdx = instructions.length;
      instructions.push(
        createInstruction(IR_OPCODES.FOR_EACH, index + 1, raw, {
          variable: pyFor[1],
          iterableExpr: parseExpressionString(pyFor[2]),
          iterableSource: pyFor[2],
          bodyStartIndex: headerIdx + 1,
          bodyEndIndex: headerIdx + 1,
        })
      );
      parseStatementBlock(lines, i + 1, bodyEndLine, instructions, language, options);
      instructions[headerIdx].bodyEndIndex = instructions.length - 1;
      i = bodyEndLine + 1;
      continue;
    }

    // JS/Java/C for-of / for-each
    const forEachMatch = language !== 'python'
      ? line.trim().match(/^for\s*\(\s*(?:const|let|var|int|String|char|\w+)\s+(\w+)\s*(?::|\s+in\s+|\s+of\s+)\s*(.+)\)\s*\{?$/)
      : null;
    if (forEachMatch) {
      const bodyEndLine = findBraceBlockEnd(lines, i);
      const headerIdx = instructions.length;
      const iterableSource = forEachMatch[2].replace(/\{$/, '').trim();
      instructions.push(
        createInstruction(IR_OPCODES.FOR_EACH, index + 1, raw, {
          variable: forEachMatch[1],
          iterableExpr: parseExpressionString(iterableSource),
          iterableSource,
          bodyStartIndex: headerIdx + 1,
          bodyEndIndex: headerIdx + 1,
        })
      );
      parseStatementBlock(lines, i + 1, bodyEndLine - 1, instructions, language, options);
      instructions[headerIdx].bodyEndIndex = instructions.length - 1;
      i = bodyEndLine + 1;
      continue;
    }

    // C-style for loop
    const cFor = line.trim().match(/^for\s*\(\s*(.+?);\s*(.+?);\s*(.+?)\)\s*\{?$/);
    if (cFor) {
      const bodyEndLine = findBraceBlockEnd(lines, i);
      const headerIdx = instructions.length;
      instructions.push(
        createInstruction(IR_OPCODES.FOR_LOOP, index + 1, raw, {
          initSource: cFor[1],
          conditionSource: cFor[2],
          incrementSource: cFor[3],
          bodyStartIndex: headerIdx + 1,
          bodyEndIndex: headerIdx + 1,
        })
      );
      parseStatementBlock(lines, i + 1, bodyEndLine - 1, instructions, language, options);
      instructions[headerIdx].bodyEndIndex = instructions.length - 1;
      i = bodyEndLine + 1;
      continue;
    }

    // While loop
    const pyWhile = language === 'python' ? line.trim().match(/^while\s+(.+):$/) : null;
    const braceWhile = language !== 'python' ? line.trim().match(/^while\s*\(\s*(.+?)\s*\)\s*\{?$/) : null;
    const whileCond = pyWhile?.[1] ?? braceWhile?.[1];
    if (whileCond) {
      const bodyEndLine = blockStyle === 'indent'
        ? findPythonBlockEnd(lines, i, lines[i].indent)
        : findBraceBlockEnd(lines, i);
      const headerIdx = instructions.length;
      instructions.push(
        createInstruction(IR_OPCODES.WHILE_LOOP, index + 1, raw, {
          conditionExpr: parseExpressionString(whileCond),
          conditionSource: whileCond,
          bodyStartIndex: headerIdx + 1,
          bodyEndIndex: headerIdx + 1,
        })
      );
      const bodyEnd = blockStyle === 'indent' ? bodyEndLine : bodyEndLine - 1;
      parseStatementBlock(lines, i + 1, bodyEnd, instructions, language, options);
      instructions[headerIdx].bodyEndIndex = instructions.length - 1;
      i = (blockStyle === 'indent' ? bodyEndLine : bodyEndLine) + 1;
      continue;
    }

    // Python if / elif / else chain
    const pyIf = language === 'python' ? line.trim().match(/^if\s+(.+):$/) : null;
    const pyElif = language === 'python' ? line.trim().match(/^elif\s+(.+):$/) : null;
    const pyElse = language === 'python' && line.trim() === 'else:';
    const braceIf = language !== 'python' ? line.trim().match(/^if\s*\(\s*(.+?)\s*\)/) : null;
    const ifCond = pyIf?.[1] ?? braceIf?.[1];
    if (ifCond || pyElif || pyElse) {
      const cond = pyElif?.[1] ?? ifCond ?? 'true';
      const bodyEndLine = blockStyle === 'indent'
        ? findPythonBlockEnd(lines, i, lines[i].indent)
        : findBraceBlockEnd(lines, i);
      const headerIdx = instructions.length;
      instructions.push(
        createInstruction(IR_OPCODES.IF, index + 1, raw, {
          conditionExpr: parseExpressionString(cond),
          conditionSource: cond,
          thenStartIndex: headerIdx + 1,
          endIndex: headerIdx + 1,
          isElse: pyElse,
        })
      );
      const bodyEnd = blockStyle === 'indent' ? bodyEndLine : bodyEndLine - 1;
      if (!pyElse) {
        parseStatementBlock(lines, i + 1, bodyEnd, instructions, language, options);
      } else {
        parseStatementBlock(lines, i + 1, bodyEnd, instructions, language, options);
      }
      instructions[headerIdx].endIndex = instructions.length - 1;
      i = bodyEndLine + 1;
      continue;
    }

    // Skip Python function/class definitions (body ignored for tracing)
    if (language === 'python' && /^(def|class)\s+\w+/.test(line.trim())) {
      const bodyEndLine = findPythonBlockEnd(lines, i, lines[i].indent);
      instructions.push(buildStatementInstruction(index, raw));
      i = bodyEndLine + 1;
      continue;
    }

    // Simple statements
    parseSimpleStatement(lines, i, instructions, language);
    i += 1;
  }
}

function parseSimpleStatement(lines, i, instructions, language) {
  const { raw, index } = lines[i];
  const line = stripComment(raw, language);

  const assign = parseAssignment(line);
  if (assign?.arrayUpdate) {
    instructions.push(buildArrayUpdateInstruction(index, raw, assign));
    return;
  }
  if (assign) {
    const isDeclare = detectDeclaration(line, language);
    instructions.push(buildAssignInstruction(index, raw, assign, isDeclare));
    return;
  }

  const print = parsePrint(line);
  if (print) {
    instructions.push(buildPrintInstruction(index, raw, print));
    return;
  }

  const swap = parseSwap(line);
  if (swap) {
    instructions.push(
      createInstruction(IR_OPCODES.SORT_SWAP, index + 1, raw, {
        arrayName: swap.arrayName,
        leftSource: swap.leftSource,
        rightSource: swap.rightSource,
      })
    );
    return;
  }

  if (line.trim() === 'break' || line.trim() === 'break;') {
    instructions.push(createInstruction(IR_OPCODES.BREAK, index + 1, raw));
    return;
  }
  if (line.trim() === 'continue' || line.trim() === 'continue;') {
    instructions.push(createInstruction(IR_OPCODES.CONTINUE, index + 1, raw));
    return;
  }
  if (line.trim().match(/^return\b/)) {
    instructions.push(createInstruction(IR_OPCODES.RETURN, index + 1, raw));
    return;
  }

  instructions.push(buildStatementInstruction(index, raw));
}

function detectDeclaration(line, language) {
  const trimmed = line.trim();
  if (language === 'python') return !trimmed.includes('=') ? false : true;
  if (language === 'javascript') return /^(const|let|var)\s/.test(trimmed);
  if (language === 'java') return /^(int|long|float|double|char|String|boolean)\b/.test(trimmed);
  return /^(int|long|float|double|char|string|auto)\b/.test(trimmed);
}

export default { parseStatementBlock };
