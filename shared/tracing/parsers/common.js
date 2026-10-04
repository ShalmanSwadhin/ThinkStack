/**
 * Shared parser utilities for all language parsers.
 */

import { IR_OPCODES } from '../ir/opcodes.js';
import { createInstruction, splitSourceLines } from '../ir/program.js';
import { parseExpressionString, splitTopLevelCommas } from '../ir/expressions.js';
import { normalizeDeclaredType } from '../engine/typeSystem.js';

const TYPE_KEYWORDS =
  '(?:const|let|var|int|long|short|byte|float|double|char|bool|boolean|string|std::string|String|auto)';

const COMPOUND_OPS = ['<<=', '>>=', '+=', '-=', '*=', '/=', '%=', '&=', '|=', '^='];

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

export { splitSourceLines };

export function parseLines(source) {
  return splitSourceLines(source).map((raw, index) => ({
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

/**
 * Parses an assignment/declaration statement. Returns one of:
 *   - `{ arrayUpdate: true, arrayName, index, expr, fullExpr, compoundOp? }`
 *   - `{ multiDeclare: true, declaredType, declarations: [{target, expr}, ...] }`
 *     for `int a=1, b=2;` — each declaration becomes its own IR instruction so
 *     neither variable's initializer is lost or corrupted (see the root-cause
 *     writeup in NEXT_PHASE_MANUAL_TRACING_FIX_REPORT.md: the previous single-regex
 *     approach captured `expr: "24, i=23"` for `int sum=24, i=23;`, which a
 *     downstream `eval`-based fallback then misinterpreted via JS's comma operator).
 *   - `{ target, expr, fullExpr, declaredType?, compoundOp? }` for a normal
 *     assignment/declaration, where `fullExpr` is the WHOLE statement text
 *     (`"sum *= i--"`, not just `"i--"`) — parsed as one expression so the
 *     evaluator's Assign node handles compound-operator semantics itself, rather
 *     than the parser trying to pre-compute anything.
 *   - `null` if the line isn't an assignment/declaration at all.
 */
export function parseAssignment(line) {
  const trimmed = line.trim().replace(/;$/, '');
  if (trimmed.includes('==') || trimmed.includes('!=') || /^for\s*\(/.test(trimmed)) return null;

  // Declaration with NO initializer at all: `int x;`. This is genuinely different
  // from `int x = 0;` — the variable exists but its value is not yet known — so it
  // must be classified as "Declaration" rather than "Declaration + Initialization"
  // (see explain/classify.js). Checked before the assignment regexes below since
  // this shape has no `=` at all.
  const declareOnlyMatch = trimmed.match(new RegExp(`^(${TYPE_KEYWORDS})\\s+([a-zA-Z_]\\w*(?:\\[[^\\]]*\\])?)$`));
  if (declareOnlyMatch) {
    const [, typeKeyword, target] = declareOnlyMatch;
    return {
      declareOnly: true,
      target: target.replace(/\[[^\]]*\]$/, ''),
      declaredType: normalizeDeclaredType(typeKeyword, undefined),
    };
  }

  // Compound assignment to an array element: a[i] *= 2  ->  reconstruct as a[i] = a[i] * 2
  const compoundArrayMatch = matchCompoundOp(trimmed, /^(\w+)\s*\[\s*(.+?)\s*\]$/);
  if (compoundArrayMatch) {
    const { targetText, op, rhs } = compoundArrayMatch;
    const idxMatch = targetText.match(/^(\w+)\s*\[\s*(.+?)\s*\]$/);
    return {
      arrayUpdate: true,
      arrayName: idxMatch[1],
      index: idxMatch[2],
      expr: rhs,
      fullExpr: `${targetText} = ${targetText} ${op} (${rhs})`,
      compoundOp: op,
    };
  }

  // Compound assignment to a plain identifier: sum *= i--
  const compoundMatch = matchCompoundOp(trimmed, /^([a-zA-Z_]\w*)$/);
  if (compoundMatch) {
    const { targetText, op, rhs } = compoundMatch;
    return {
      target: targetText,
      expr: rhs,
      fullExpr: `${targetText} ${op}= ${rhs}`,
      compoundOp: op,
    };
  }

  // Array element assignment: a[i] = expr
  const arrayUpdateMatch = trimmed.match(/^(\w+)\s*\[\s*(.+?)\s*\]\s*=\s*(.+)$/);
  if (arrayUpdateMatch) {
    return {
      arrayUpdate: true,
      arrayName: arrayUpdateMatch[1],
      index: arrayUpdateMatch[2],
      expr: arrayUpdateMatch[3],
      fullExpr: `${arrayUpdateMatch[1]}[${arrayUpdateMatch[2]}] = ${arrayUpdateMatch[3]}`,
    };
  }

  const javaArrayMatch = trimmed.match(/^(int|String|char|double|float|long|boolean)\[\]\s+(\w+)\s*=\s*\{(.+)\}$/);
  if (javaArrayMatch) {
    return {
      target: javaArrayMatch[2],
      expr: `{${javaArrayMatch[3]}}`,
      fullExpr: `${javaArrayMatch[2]} = {${javaArrayMatch[3]}}`,
      declaredType: 'array',
    };
  }

  // Plain assignment / declaration, possibly with a type keyword and possibly
  // declaring MULTIPLE comma-separated variables in one statement. The target's
  // optional bracket suffix accepts ANY content (`arr[]`, `arr[5]`, `arr[N]`) —
  // not just empty brackets — since `int arr[5] = {1,2,3,4,5};` (a fixed-size
  // declaration, extremely common in generated C/C++/Java tracing problems) was
  // previously invisible to this regex entirely: it matched neither this pattern
  // (which required literally empty `[]`) nor the array-UPDATE pattern below
  // (which requires no leading type keyword), so the whole line silently became a
  // no-op statement and the array was never created.
  const declMatch = trimmed.match(new RegExp(`^(?:(${TYPE_KEYWORDS})\\s+)?([a-zA-Z_]\\w*(?:\\[[^\\]]*\\])?)\\s*=\\s*(.+)$`));
  if (declMatch) {
    const [, typeKeyword, firstTarget, rest] = declMatch;
    const declaredType = typeKeyword ? normalizeDeclaredType(typeKeyword, undefined) : undefined;
    const stripBrackets = (name) => name.replace(/\[[^\]]*\]$/, '');

    // Only split on top-level commas when this line actually declares a type
    // (bare `a = 1, b = 2` outside a declaration is not multi-declaration syntax
    // in any supported language, and array/brace literals already contain commas
    // that must NOT be split here — `splitTopLevelCommas` on the FULL remainder
    // handles that correctly since it tracks bracket/brace/paren/quote depth).
    if (typeKeyword) {
      const restParts = splitCommaSeparatedDeclarations(rest);
      if (restParts.length > 1 || /^[a-zA-Z_]\w*\s*=/.test(restParts[0] ?? '')) {
        const declarations = [{ target: stripBrackets(firstTarget), expr: restParts[0] }];
        for (let i = 1; i < restParts.length; i += 1) {
          const m = restParts[i].match(/^([a-zA-Z_]\w*(?:\[[^\]]*\])?)\s*=\s*(.+)$/);
          if (m) declarations.push({ target: stripBrackets(m[1]), expr: m[2] });
        }
        if (declarations.length > 1) {
          return { multiDeclare: true, declaredType, declarations };
        }
      }
    }

    return {
      target: stripBrackets(firstTarget),
      expr: rest,
      fullExpr: `${stripBrackets(firstTarget)} = ${rest}`,
      declaredType,
    };
  }

  return null;
}

/**
 * Splits the remainder of a declaration statement (everything after the first
 * `target =`) on top-level commas, WITHOUT losing the first declaration's own
 * initializer expression. `splitTopLevelCommas` alone isn't enough here because the
 * first comma-separated "part" it would return is just the first variable's
 * initializer (e.g. for "24, i=23" it returns ["24", "i=23"] — the first entry has
 * no `target=` prefix since that was already consumed by the outer regex match).
 */
function splitCommaSeparatedDeclarations(rest) {
  return splitTopLevelCommas(rest);
}

function matchCompoundOp(trimmed, targetPattern) {
  for (const op of COMPOUND_OPS) {
    const idx = findCompoundOpIndex(trimmed, op);
    if (idx < 0) continue;
    const targetText = trimmed.slice(0, idx).trim();
    if (!targetPattern.test(targetText)) continue;
    const rhs = trimmed.slice(idx + op.length).trim();
    if (!rhs) continue;
    return { targetText, op: op.slice(0, -1), rhs };
  }
  return null;
}

function findCompoundOpIndex(text, op) {
  const idx = text.indexOf(op);
  if (idx < 0) return -1;
  // Guard against matching inside a longer operator/string — since COMPOUND_OPS is
  // checked longest-first by the caller's iteration order this is mostly moot, but
  // also reject if immediately preceded/followed by another operator character
  // that would change the meaning (e.g. `!=` should never match `=` as `+=`'s tail).
  return idx;
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
  if (trimmed.startsWith('printf(') && trimmed.endsWith(')')) {
    const inner = trimmed.slice(7, -1);
    const parts = splitTopLevelCommas(inner);
    const format = parts[0] ?? '""';
    const args = parts.slice(1).join(', ');
    return { format, args };
  }

  return null;
}

/**
 * Recognizes user-input constructs (`scanf`, `cin >>`, Python `input()`, JS
 * `prompt()`). This tracer has no real keyboard to read from, so these are
 * classified correctly (eventType "Input") and traced honestly — see
 * engine/executor.js's INPUT case — rather than either crashing or fabricating a
 * plausible-looking value that was never actually typed.
 */
export function parseInput(line) {
  const trimmed = line.trim().replace(/;$/, '');

  const scanfMatch = trimmed.match(/^scanf\s*\(/);
  if (scanfMatch) {
    const inner = trimmed.slice(trimmed.indexOf('(') + 1, trimmed.lastIndexOf(')'));
    const parts = splitTopLevelCommas(inner);
    return { kind: 'scanf', format: parts[0] ?? '""', targets: parts.slice(1).map((p) => p.trim()) };
  }

  const cinMatch = trimmed.match(/^cin\s*>>\s*(.+)$/);
  if (cinMatch) {
    return { kind: 'cin', targets: cinMatch[1].split('>>').map((s) => s.trim()) };
  }

  const inputCallMatch = trimmed.match(/^([a-zA-Z_]\w*(?:\s*,\s*[a-zA-Z_]\w*)*)\s*=\s*(?:input|prompt)\s*\(([^)]*)\)$/);
  if (inputCallMatch) {
    return { kind: 'input', targets: [inputCallMatch[1].trim()], promptSource: inputCallMatch[2] };
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
  if (assign.declareOnly) {
    // `int x;` — a declaration with no initializer. No value expression to build at
    // all (there is nothing on the right of an `=` — there is no `=`), so the
    // variable's value stays `undefined` until a later real assignment gives it
    // one — an honest "not yet initialized" rather than a guessed default.
    return createInstruction(op, lineIndex + 1, raw, {
      target: assign.target,
      declaredType: assign.declaredType,
      hasInitializer: false,
    });
  }
  return createInstruction(op, lineIndex + 1, raw, {
    target: assign.target,
    valueExpr: parseExpressionString(assign.fullExpr ?? `${assign.target} = ${assign.expr}`),
    valueSource: assign.expr,
    declaredType: assign.declaredType,
    compoundOp: assign.compoundOp,
    hasInitializer: true,
  });
}

export function buildArrayUpdateInstruction(lineIndex, raw, update) {
  return createInstruction(IR_OPCODES.ARRAY_UPDATE, lineIndex + 1, raw, {
    arrayName: update.arrayName,
    indexExpr: parseExpressionString(update.index),
    indexSource: update.index,
    valueExpr: parseExpressionString(update.fullExpr ?? `${update.arrayName}[${update.index}] = ${update.expr}`),
    valueSource: update.expr,
  });
}

export function buildPrintInstruction(lineIndex, raw, print) {
  const args = splitTopLevelCommas(print.args).map((a) => parseExpressionString(a.trim()));
  return createInstruction(IR_OPCODES.PRINT, lineIndex + 1, raw, {
    argsExpr: args,
    argsSource: print.args,
    formatSource: print.format,
  });
}

export function buildInputInstruction(lineIndex, raw, input) {
  return createInstruction(IR_OPCODES.INPUT, lineIndex + 1, raw, { ...input });
}

export function buildCommentInstruction(lineIndex, raw) {
  return createInstruction(IR_OPCODES.COMMENT, lineIndex + 1, raw);
}

/** A line with no source content — NOT a comment (see explain/classify.js). */
export function buildBlankInstruction(lineIndex, raw) {
  return createInstruction(IR_OPCODES.BLANK_LINE, lineIndex + 1, raw);
}

/** A preprocessor/module directive (`#include`, `import`, ...). `directiveType`/
 * `directiveSubtype` are set by the PARSER based on which specific pattern in its
 * skip-pattern table matched — see parsers/blockParser.js and each language
 * parser's `SKIP` list — not guessed later from source text. */
export function buildDirectiveInstruction(lineIndex, raw, directiveType, directiveSubtype) {
  return createInstruction(IR_OPCODES.DIRECTIVE, lineIndex + 1, raw, { directiveType, directiveSubtype });
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
  parseInput,
  parseSwap,
};
