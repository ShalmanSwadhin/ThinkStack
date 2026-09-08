/**
 * Recursive statement block parser — shared across all language parsers.
 */

import { IR_OPCODES } from '../ir/opcodes.js';
import { createInstruction } from '../ir/program.js';
import { parseExpressionString, EXPR_TYPES } from '../ir/expressions.js';
import {
  stripComment,
  isCommentOnly,
  findPythonBlockEnd,
  findBraceBlockEnd,
  parseAssignment,
  parsePrint,
  parseInput,
  parseSwap,
  buildAssignInstruction,
  buildArrayUpdateInstruction,
  buildPrintInstruction,
  buildInputInstruction,
  buildCommentInstruction,
  buildBlankInstruction,
  buildDirectiveInstruction,
  buildStatementInstruction,
} from './common.js';

export function parseStatementBlock(lines, startIndex, endIndex, instructions, language, options = {}) {
  const blockStyle = options.blockStyle ?? (language === 'python' ? 'indent' : 'brace');
  let i = startIndex;

  while (i <= endIndex && i < lines.length) {
    const { raw, index } = lines[i];
    const line = stripComment(raw, language);

    // A blank line is not a comment — it carries no content of either kind, so it
    // gets its own instruction kind (see ir/opcodes.js's BLANK_LINE) rather than
    // being folded into COMMENT the way it previously was. Checked against the RAW
    // line, not the comment-stripped `line` — `stripComment` removes a trailing
    // `//...`/`#...` from an ENTIRE-comment line too, which would otherwise make
    // every real comment look blank and get misclassified.
    if (!raw.trim()) {
      instructions.push(buildBlankInstruction(index, raw));
      i += 1;
      continue;
    }
    if (isCommentOnly(raw, language)) {
      instructions.push(buildCommentInstruction(index, raw));
      i += 1;
      continue;
    }

    if (language === 'python' && /^(import\s+\w|from\s+\w+\s+import\b)/.test(line.trim())) {
      instructions.push(buildDirectiveInstruction(index, raw, 'Module Directive', 'Import'));
      i += 1;
      continue;
    }

    // Preprocessor/module directives (`#include`, `import`, `package`, ...). Each
    // language parser's `skipPatterns` is a list of `{pattern, directiveType,
    // directiveSubtype}` descriptors — the PARSER decides the classification by
    // which specific pattern matched, not a later guess from raw source text.
    const directiveMatch = options.skipPatterns?.find((p) => p.pattern.test(line.trim()));
    if (directiveMatch) {
      instructions.push(buildDirectiveInstruction(index, raw, directiveMatch.directiveType, directiveMatch.directiveSubtype));
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

    // C-style for loop. Extracted via paren-depth matching (not a non-greedy regex
    // stopping at the FIRST `;`/`)`) so a condition or increment clause containing
    // its own parens — `for (int i = 0; i < max(a, b); i++)` — is captured whole
    // instead of being truncated at the inner call's closing paren.
    const cForParts = matchParenHeader(line.trim(), 'for');
    if (cForParts) {
      const segments = splitTopLevelSemicolons(cForParts.inner).map((s) => s.trim());
      if (segments.length === 3) {
        const bodyEndLine = findBraceBlockEnd(lines, i);
        const headerIdx = instructions.length;
        instructions.push(
          createInstruction(IR_OPCODES.FOR_LOOP, index + 1, raw, {
            initSource: segments[0],
            conditionSource: segments[1],
            incrementSource: segments[2],
            bodyStartIndex: headerIdx + 1,
            bodyEndIndex: headerIdx + 1,
          })
        );
        parseStatementBlock(lines, i + 1, bodyEndLine - 1, instructions, language, options);
        instructions[headerIdx].bodyEndIndex = instructions.length - 1;
        i = bodyEndLine + 1;
        continue;
      }
    }

    // do-while loop (C/C++/Java/JS only — Python has no do-while statement).
    if (language !== 'python' && /^do\s*\{?\s*$/.test(line.trim())) {
      const openBraceIdx = line.indexOf('{');
      let bodyStartLine;
      let doBodyCloseLine;
      if (openBraceIdx >= 0) {
        doBodyCloseLine = findBraceBlockEndFrom(lines, i, openBraceIdx + 1);
        bodyStartLine = i + 1;
      } else {
        const nextTrimmed = i + 1 < lines.length ? stripComment(lines[i + 1].raw, language).trim() : '';
        if (nextTrimmed.startsWith('{')) {
          const braceCharIdx = lines[i + 1].raw.indexOf('{');
          doBodyCloseLine = findBraceBlockEndFrom(lines, i + 1, braceCharIdx + 1);
          bodyStartLine = i + 2;
        }
      }

      if (doBodyCloseLine !== undefined) {
        // The `while (...)` may share the closing `}`'s own line (`} while (cond);`)
        // or — same Allman/GNU layout issue as else-if — start on its own SEPARATE
        // following line.
        const closeLineText = stripComment(lines[doBodyCloseLine].raw, language);
        const closeBraceIdx = closeLineText.indexOf('}');
        let whileLineIdx = doBodyCloseLine;
        let whileSearchText = closeBraceIdx >= 0 ? closeLineText.slice(closeBraceIdx + 1) : closeLineText;
        if (!whileSearchText.trim()) {
          let probe = doBodyCloseLine + 1;
          while (probe < lines.length && (!lines[probe].raw.trim() || isCommentOnly(lines[probe].raw, language))) probe += 1;
          if (probe < lines.length) {
            whileLineIdx = probe;
            whileSearchText = stripComment(lines[probe].raw, language);
          }
        }

        const whileHeaderMatch = whileSearchText.trim().match(/^while\s*\(/);
        if (whileHeaderMatch) {
          const openIdx = whileSearchText.indexOf('(', whileSearchText.indexOf('while'));
          const closeIdx = findMatchingDelimiter(whileSearchText, openIdx, '(', ')');
          const cond = closeIdx >= 0 ? whileSearchText.slice(openIdx + 1, closeIdx).trim() : '';

          const headerIdx = instructions.length;
          instructions.push(
            createInstruction(IR_OPCODES.DO_WHILE, index + 1, raw, {
              conditionExpr: parseExpressionString(cond),
              conditionSource: cond,
              bodyStartIndex: headerIdx + 1,
              bodyEndIndex: headerIdx + 1,
            })
          );
          parseStatementBlock(lines, bodyStartLine, doBodyCloseLine - 1, instructions, language, options);
          instructions[headerIdx].bodyEndIndex = instructions.length - 1;
          i = whileLineIdx + 1;
          continue;
        }
      }
    }

    // While loop
    const pyWhile = language === 'python' ? line.trim().match(/^while\s+(.+):$/) : null;
    const braceWhileParts = language !== 'python' ? matchParenHeader(line.trim(), 'while') : null;
    const whileCond = pyWhile?.[1] ?? braceWhileParts?.inner.trim();
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

    // switch statement (C/C++/Java/JS — Python has no switch statement in the
    // versions this tracer targets). The body is parsed completely NORMALLY
    // (nested if/for/while inside a case work exactly as anywhere else) — `case`/
    // `default` labels are recognized as plain marker instructions wherever they
    // occur (see parseSimpleStatement's CASE_LABEL handling above), and the
    // SWITCH instruction itself just needs to know where each label ended up so
    // it can jump straight to the matching one at runtime.
    if (language !== 'python') {
      const switchParts = matchParenHeader(line.trim(), 'switch');
      if (switchParts) {
        const bodyEndLine = findBraceBlockEnd(lines, i);
        const headerIdx = instructions.length;
        instructions.push(
          createInstruction(IR_OPCODES.SWITCH, index + 1, raw, {
            switchExprSource: switchParts.inner.trim(),
            bodyStartIndex: headerIdx + 1,
            bodyEndIndex: headerIdx + 1,
          })
        );
        parseStatementBlock(lines, i + 1, bodyEndLine - 1, instructions, language, options);
        instructions[headerIdx].bodyEndIndex = instructions.length - 1;
        // Record where each case/default label landed in the flat instruction
        // array, so the executor can jump straight there without re-scanning.
        const cases = [];
        let defaultIndex;
        for (let idx = headerIdx + 1; idx <= instructions[headerIdx].bodyEndIndex; idx += 1) {
          const candidate = instructions[idx];
          if (candidate.op !== IR_OPCODES.CASE_LABEL) continue;
          if (candidate.isDefault) defaultIndex = idx;
          else cases.push({ valueExpr: candidate.caseValueExpr, index: idx });
        }
        instructions[headerIdx].cases = cases;
        instructions[headerIdx].defaultIndex = defaultIndex;
        i = bodyEndLine + 1;
        continue;
      }
    }

    // if / elif / else chain (Python indentation-based, or brace-based with
    // `} else if (...) {` / `} else {` continuations). Parsed as one linked chain —
    // see parseIfChain's doc comment for why a single IF opcode per clause used to
    // silently mis-trace every branch past the first.
    const pyIf = language === 'python' ? line.trim().match(/^if\s+(.+):$/) : null;
    const braceIf = language !== 'python' ? line.trim().match(/^if\s*\(\s*(.+?)\s*\)/) : null;
    if (pyIf || braceIf) {
      i = parseIfChain(lines, i, instructions, language, blockStyle, options);
      continue;
    }

    // Skip Python function/class definitions (body ignored for tracing) — classified
    // as a real FUNCTION_DEF/CLASS_DEF event rather than a generic statement, since
    // the parser already knows exactly what construct this is.
    if (language === 'python' && /^(def|class)\s+\w+/.test(line.trim())) {
      const kind = /^def\s+/.test(line.trim()) ? 'function' : 'class';
      const bodyEndLine = findPythonBlockEnd(lines, i, lines[i].indent);
      instructions.push(
        createInstruction(IR_OPCODES.FUNCTION_DEF, index + 1, raw, {
          definitionKind: kind,
          bodyTraced: false,
        })
      );
      i = bodyEndLine + 1;
      continue;
    }

    // Skip C/C++/Java/JS function definitions OTHER than `main` — this engine does
    // not implement real function-call tracing (see the documented limitation), so
    // a helper function's body must not be executed as if it were more top-level
    // program code. Before this fix, ANY function defined before/after `main` had
    // its body treated as ordinary top-level statements — and since `return` halts
    // the ENTIRE trace (there is no call-stack to unwind), a single-line helper
    // like `int square(int x) { return x*x; }` silently stopped the whole program
    // before `main` ever ran. `main` itself is deliberately NOT skipped: its body
    // already traces correctly today by falling through as ordinary statements.
    if (blockStyle === 'brace' && !/\bclass\b/.test(line)) {
      const funcMatch = line.match(/^[A-Za-z_][\w:*&<>,\s]*?\s+(\w+)\s*\([^;{}]*\)\s*\{\s*$/);
      if (funcMatch && funcMatch[1] !== 'main') {
        const bodyEndLine = findBraceBlockEnd(lines, i);
        instructions.push(
          createInstruction(IR_OPCODES.FUNCTION_DEF, index + 1, raw, {
            definitionKind: 'function',
            functionName: funcMatch[1],
            bodyTraced: false,
          })
        );
        i = bodyEndLine + 1;
        continue;
      }
    }

    // Simple statements — but first, if this line looks like the START of a
    // statement wrapped across multiple physical lines for readability (e.g. a
    // long `printf(...)`/function call with its closing paren on a LATER line),
    // merge the continuation lines into one logical statement before parsing it.
    // Without this, the first physical line is missing its closing `)` (so
    // nothing recognizes it as a printf/call at all) and the following line(s)
    // are independent-looking fragments that match nothing either — the whole
    // statement (and any side effects/output it has) silently vanishes instead
    // of running. Only engages when parens are genuinely unbalanced on this line;
    // every ordinary single-line statement is completely unaffected.
    if (countUnclosedParens(line) > 0) {
      const merged = mergeContinuationLines(lines, i, language);
      parseSimpleStatement(
        [{ raw: merged.raw, index: lines[i].index, indent: lines[i].indent }],
        0,
        instructions,
        language
      );
      i = merged.endIndex + 1;
      continue;
    }

    parseSimpleStatement(lines, i, instructions, language);
    i += 1;
  }
}

/** Counts net unclosed `(` depth in a single stripped line (quote-aware, so a
 * literal paren character inside a string doesn't skew the count). */
function countUnclosedParens(text) {
  let depth = 0;
  let quote = null;
  for (let idx = 0; idx < text.length; idx += 1) {
    const ch = text[idx];
    if (quote) {
      if (ch === quote && text[idx - 1] !== '\\') quote = null;
      continue;
    }
    if (ch === '"' || ch === "'") {
      quote = ch;
      continue;
    }
    if (ch === '(') depth += 1;
    else if (ch === ')') depth -= 1;
  }
  return depth;
}

/** Joins physical lines starting at `startIdx` until parens balance (or a small
 * safety bound is hit), attributing the merged text to the FIRST line — matching
 * how a reader would mentally treat a wrapped statement as one logical line. The
 * merged/reconstructed text is what appears as this instruction's `sourceLine` in
 * the trace table; it may not be byte-identical to the original multi-line
 * formatting, but accurately represents the statement that actually ran. */
function mergeContinuationLines(lines, startIdx, language) {
  let raw = stripComment(lines[startIdx].raw, language).trim();
  let endIndex = startIdx;
  let guard = 0;
  while (countUnclosedParens(raw) > 0 && endIndex + 1 < lines.length && guard < 20) {
    endIndex += 1;
    const next = stripComment(lines[endIndex].raw, language).trim();
    if (next) raw += ' ' + next;
    guard += 1;
  }
  return { raw, endIndex };
}

/**
 * Parses a full `if [elif]* [else]` chain as one linked structure, instead of a
 * sequence of unrelated IF instructions. Before this fix, an `elif`/`else` clause
 * (Python) or a `} else if (...) {` / `} else {` continuation (brace languages) was
 * parsed with no link back to the earlier clause in the chain — so after running
 * the first TRUE branch's body, execution fell straight through into the NEXT
 * clause's body/condition-check instead of skipping the rest of the chain, and for
 * brace languages a `} else if (...)`/`} else {` line didn't match any recognized
 * construct at all, so its body ran completely unconditionally. Confirmed live:
 * `if (x>10) {y=1;} else if (x>3) {y=2;} else {y=3;}` with x=5 produced y=3 (the
 * LAST clause always won) in every language, including Python's `elif`, instead of
 * the correct y=2.
 *
 * Each clause becomes its own IR_OPCODES.IF instruction carrying `nextClauseIndex`
 * (where to jump when THIS clause's condition is false — the next clause, or the
 * end of the chain if there is none) and a shared `chainEndIndex` (where every
 * clause's TAKEN body jumps to once it finishes, skipping the remaining clauses).
 * See executor.js's `ifStack` for the runtime half of this.
 *
 * Returns the 0-based line index to resume top-level parsing from.
 */
function parseIfChain(lines, startIndex, instructions, language, blockStyle, options) {
  if (blockStyle === 'brace') {
    // Try the whole chain as a single physical line first (`if (...) { ... } else
    // { ... }` all on one line) — a valid, if unusual, style that the general
    // per-line loop below cannot represent (it assumes each clause's body starts
    // on the line AFTER its header). `tryParseSingleLineIfChain` returns null the
    // moment anything doesn't fit that shape, so normal multi-line code is
    // completely unaffected.
    const singleLineResult = tryParseSingleLineIfChain(lines, startIndex, instructions, language);
    if (singleLineResult !== null) return singleLineResult;
  }

  const headerIndices = [];
  const startIndent = blockStyle === 'indent' ? lines[startIndex].indent : null;
  let i = startIndex;
  let clauseNumber = 0;

  for (;;) {
    // Allman/GNU brace style: a clause's body closes with a BARE `}` on its own
    // line, and the next clause's `else`/`else if` starts a SEPARATE following
    // line — not `} else if (...) {` sharing one line. Before this fix, a bare
    // `}` with nothing after it was treated as "no continuation" (chain ends
    // here), so the `else if (...)` line on the NEXT line was never recognized
    // as part of the chain at all — it fell through as an unrecognized top-level
    // statement (a silent no-op), and everything physically after it in the
    // source ran completely UNCONDITIONALLY, as ordinary top-level code. Confirmed
    // live: an if/else-if/else written in this (extremely common) style executed
    // its else-if body regardless of the condition. Skip forward past blank/
    // comment lines here so the rest of this loop iteration sees the REAL next
    // clause header, exactly as if it had shared the line with the `}`.
    if (blockStyle === 'brace' && clauseNumber > 0) {
      const bareBraceOnly = stripComment(lines[i].raw, language).trim() === '}';
      if (bareBraceOnly) {
        let probe = i + 1;
        while (probe < lines.length && (!lines[probe].raw.trim() || isCommentOnly(lines[probe].raw, language))) {
          probe += 1;
        }
        if (probe < lines.length && /^else\b/.test(stripComment(lines[probe].raw, language).trim())) {
          i = probe;
        }
      }
    }

    const { raw, index } = lines[i];
    const line = stripComment(raw, language);
    const trimmed = line.trim();

    let cond = null;
    let isElse = false;
    let matched = true;
    let bodyStartLine;
    let bodyEndLine;
    let isBraceless = false;

    if (blockStyle === 'indent') {
      if (clauseNumber > 0 && lines[i].indent !== startIndent) {
        matched = false;
      } else if (clauseNumber === 0) {
        cond = trimmed.match(/^if\s+(.+):$/)[1];
      } else if (/^elif\s+/.test(trimmed)) {
        cond = trimmed.match(/^elif\s+(.+):$/)[1];
      } else if (trimmed === 'else:') {
        isElse = true;
      } else {
        matched = false;
      }
      if (matched) {
        bodyEndLine = findPythonBlockEnd(lines, i, lines[i].indent);
        bodyStartLine = i + 1;
      }
    } else {
      // For clause 0, `line` is the `if (...) {` header itself. For later clauses,
      // `line` is the PREVIOUS clause's own closing-brace line, which — for the
      // common `} else if (...) {` / `} else {` style — also carries this clause's
      // header text right after the `}`.
      const closeBraceIdx = line.indexOf('}');
      const afterBrace = closeBraceIdx >= 0 ? line.slice(closeBraceIdx + 1).trim() : trimmed;

      if (clauseNumber === 0) {
        // Paren-depth matching (not a non-greedy regex stopping at the FIRST `)`)
        // so `if (max(a, b) > c) {` captures the whole condition, not just `max(a`.
        const ifHeaderMatch = trimmed.match(/^if\s*\(/);
        const openIdx = ifHeaderMatch[0].length - 1;
        const closeIdx = findMatchingDelimiter(trimmed, openIdx, '(', ')');
        cond = closeIdx >= 0 ? trimmed.slice(openIdx + 1, closeIdx).trim() : trimmed.slice(openIdx + 1).trim();
      } else {
        const elseIfHeaderMatch = afterBrace.match(/^else\s+if\s*\(/);
        if (elseIfHeaderMatch) {
          const openIdx = elseIfHeaderMatch[0].length - 1;
          const closeIdx = findMatchingDelimiter(afterBrace, openIdx, '(', ')');
          if (closeIdx >= 0) cond = afterBrace.slice(openIdx + 1, closeIdx).trim();
          else matched = false;
        } else if (/^else\b/.test(afterBrace)) {
          isElse = true;
        } else {
          matched = false;
        }
      }

      if (matched) {
        const searchFrom = clauseNumber === 0 ? 0 : closeBraceIdx + 1;
        const openBraceIdx = line.indexOf('{', searchFrom);
        if (openBraceIdx >= 0) {
          bodyEndLine = findBraceBlockEndFrom(lines, i, openBraceIdx + 1);
          bodyStartLine = i + 1;
        } else {
          const nextTrimmed = i + 1 < lines.length ? stripComment(lines[i + 1].raw, language).trim() : '';
          if (nextTrimmed.startsWith('{')) {
            // Allman style: the `{` opens on its own following line.
            const braceCharIdx = lines[i + 1].raw.indexOf('{');
            bodyEndLine = findBraceBlockEndFrom(lines, i + 1, braceCharIdx + 1);
            bodyStartLine = i + 2;
          } else {
            // No braces anywhere: C/C++/Java/JS all allow a single-statement body
            // with no braces at all (`if (cond)\n  stmt;`). Before this fix, this
            // fell through to `findBraceBlockEnd`, which — finding no braces to
            // balance anywhere in the rest of the file — returned a wildly wrong
            // line, so the "body" swallowed everything up to and including the
            // `else` clause (or beyond), and BOTH branches ended up executing.
            // Delegate exactly one line to the normal statement dispatcher — if
            // that line itself opens a multi-line construct (a nested braceless
            // `if`/`for`/`while`, or a braced one), the dispatcher's own handlers
            // find its true extent independently of the tight range passed here,
            // so this remains correct even for a single (possibly compound,
            // possibly multi-line) statement, not just a one-liner.
            bodyStartLine = i + 1;
            bodyEndLine = i + 1;
            isBraceless = true;
          }
        }
      }
    }

    if (!matched) break; // `i` still points at this (unconsumed) line for the caller.

    const headerIdx = instructions.length;
    headerIndices.push(headerIdx);
    instructions.push(
      createInstruction(IR_OPCODES.IF, index + 1, raw, {
        conditionExpr: cond ? parseExpressionString(cond) : undefined,
        conditionSource: cond,
        isElse,
        // Set by the PARSER from its own clause position, not guessed later from
        // source text — drives the eventType/eventSubtype classification (Condition
        // vs. Branch, If vs. ElseIf vs. Else) in explain/classify.js.
        clauseKind: clauseNumber === 0 ? 'if' : isElse ? 'else' : 'else-if',
        thenStartIndex: headerIdx + 1,
      })
    );

    const bodyEnd = blockStyle === 'indent' || isBraceless ? bodyEndLine : bodyEndLine - 1;
    parseStatementBlock(lines, bodyStartLine, bodyEnd, instructions, language, options);
    instructions[headerIdx].bodyEndIndex = instructions.length - 1;

    if (isElse) {
      i = bodyEndLine + 1;
      break;
    }

    clauseNumber += 1;
    // Brace style: the next clause's header may share the same physical line as
    // this clause's closing `}` (`} else if (...) {`) — re-enter the loop AT that
    // line so the `clauseNumber > 0` branch above can look past the `}` for it.
    // Indent style, and a braceless body (no `}` to share a line with), always
    // start their next candidate line fresh, right after the body.
    i = blockStyle === 'indent' || isBraceless ? bodyEndLine + 1 : bodyEndLine;
    if (i >= lines.length) break;
  }

  const chainEndIndex = instructions.length;
  headerIndices.forEach((headerIdx, c) => {
    instructions[headerIdx].nextClauseIndex = headerIndices[c + 1];
    instructions[headerIdx].chainEndIndex = chainEndIndex;
  });

  return i;
}

/** Like `findBraceBlockEnd`, but starts counting from a given character offset on
 * `lineIndex` with depth already at 1 (used when the opening `{` shares a line with
 * the previous clause's closing `}`, so a plain re-scan of that whole line would
 * miscount). */
function findBraceBlockEndFrom(lines, lineIndex, charOffset) {
  let depth = 1;
  for (let i = lineIndex; i < lines.length; i += 1) {
    const text = i === lineIndex ? lines[i].raw.slice(charOffset) : lines[i].raw;
    for (const ch of text) {
      if (ch === '{') depth += 1;
      else if (ch === '}') {
        depth -= 1;
        if (depth === 0) return i;
      }
    }
  }
  return lines.length - 1;
}

/**
 * Attempts to parse a FULL `if (...) { ... } else if (...) { ... } else { ... }`
 * chain that lives entirely on ONE physical source line. Returns the line index to
 * resume from on success, or `null` the moment anything doesn't match this exact
 * shape — callers fall back to the normal multi-line-oriented per-clause loop,
 * which is unaffected by this attempt (nothing is pushed to `instructions` unless
 * the WHOLE chain parses this way).
 */
function tryParseSingleLineIfChain(lines, startIndex, instructions, language) {
  const { raw, index } = lines[startIndex];
  const line = stripComment(raw, language);
  const headerIndices = [];
  const startLength = instructions.length;
  let pos = 0;
  let clauseNumber = 0;

  for (;;) {
    const rest = line.slice(pos);
    let cond = null;
    let isElse = false;

    if (clauseNumber === 0) {
      const m = rest.match(/^\s*if\s*\(/);
      if (!m) {
        instructions.length = startLength;
        return null;
      }
      const condStart = pos + m[0].length - 1;
      const condEnd = findMatchingDelimiter(line, condStart, '(', ')');
      if (condEnd < 0) {
        instructions.length = startLength;
        return null;
      }
      cond = line.slice(condStart + 1, condEnd).trim();
      pos = condEnd + 1;
    } else {
      const elseIfMatch = rest.match(/^\s*else\s+if\s*\(/);
      if (elseIfMatch) {
        const condStart = pos + elseIfMatch[0].length - 1;
        const condEnd = findMatchingDelimiter(line, condStart, '(', ')');
        if (condEnd < 0) {
          instructions.length = startLength;
          return null;
        }
        cond = line.slice(condStart + 1, condEnd).trim();
        pos = condEnd + 1;
      } else if (/^\s*else\b/.test(rest)) {
        isElse = true;
        pos += rest.match(/^\s*else\b/)[0].length;
      } else {
        break;
      }
    }

    const braceMatch = line.slice(pos).match(/^\s*\{/);
    if (!braceMatch) {
      // A braceless clause mixed into what looked like a one-line chain — bail
      // completely rather than commit a partial chain; the normal multi-line path
      // (which also handles braceless bodies) will re-parse this from scratch.
      instructions.length = startLength;
      return null;
    }
    const openBraceIdx = pos + braceMatch[0].length - 1;
    const closeBraceIdx = findMatchingDelimiter(line, openBraceIdx, '{', '}');
    if (closeBraceIdx < 0) {
      // This clause's block doesn't actually close on this same line — not a
      // single-line chain after all.
      instructions.length = startLength;
      return null;
    }

    const headerIdx = instructions.length;
    headerIndices.push(headerIdx);
    instructions.push(
      createInstruction(IR_OPCODES.IF, index + 1, raw, {
        conditionExpr: cond ? parseExpressionString(cond) : undefined,
        conditionSource: cond,
        isElse,
        clauseKind: clauseNumber === 0 ? 'if' : isElse ? 'else' : 'else-if',
        thenStartIndex: headerIdx + 1,
      })
    );
    parseInlineFragmentStatements(line.slice(openBraceIdx + 1, closeBraceIdx), index, raw, instructions, language);
    instructions[headerIdx].bodyEndIndex = instructions.length - 1;

    pos = closeBraceIdx + 1;
    if (isElse) break;
    clauseNumber += 1;
    if (!/^\s*else\b/.test(line.slice(pos))) break;
  }

  if (!headerIndices.length) {
    instructions.length = startLength;
    return null;
  }

  const chainEndIndex = instructions.length;
  headerIndices.forEach((headerIdx, c) => {
    instructions[headerIdx].nextClauseIndex = headerIndices[c + 1];
    instructions[headerIdx].chainEndIndex = chainEndIndex;
  });

  return startIndex + 1;
}

/** Parses a fragment of inline statement text (from a same-line `{ ... }` block)
 * as one or more semicolon-separated simple statements, attributed to `sourceIndex`
 * (so line-highlighting still points at the real source line). Naive top-level
 * semicolon splitting — a fragment containing its own nested block construct
 * (`if`/`for`/`while`) is a residual limitation of this rare same-line style. */
function parseInlineFragmentStatements(fragment, sourceIndex, raw, instructions, language) {
  const parts = fragment
    .split(';')
    .map((part) => part.trim())
    .filter(Boolean);
  for (const part of parts) {
    parseSimpleStatement([{ raw: part, index: sourceIndex, indent: 0 }], 0, instructions, language);
  }
}

/**
 * Matches `<keyword> ( ... ) {?` at the start of `trimmedLine`, using real
 * paren-depth counting to find the TRUE matching close paren — not a non-greedy
 * regex that stops at the first `)` it sees, which truncates any condition
 * containing its own parens (`while (abs(x) > 5)`, `if (max(a,b) > c)`,
 * `for (int i = 0; i < max(a, b); i++)`). Returns `{ inner }` (the raw text between
 * the parens) on success, or `null` if the line isn't actually a paren-header for
 * this keyword, or its close paren isn't followed by only whitespace/`{`.
 */
function matchParenHeader(trimmedLine, keyword) {
  const m = trimmedLine.match(new RegExp(`^${keyword}\\s*\\(`));
  if (!m) return null;
  const openIdx = m[0].length - 1;
  const closeIdx = findMatchingDelimiter(trimmedLine, openIdx, '(', ')');
  if (closeIdx < 0) return null;
  const after = trimmedLine.slice(closeIdx + 1).trim();
  if (after !== '' && after !== '{') return null;
  return { inner: trimmedLine.slice(openIdx + 1, closeIdx) };
}

/** Splits on top-level `;` only (respecting nested parens/brackets/braces/quotes) —
 * used for a C-style for-loop's `init; condition; increment` header, where the
 * condition or increment clause may itself contain a semicolon-free but paren-ful
 * expression (a function call) that must not be mistaken for a segment boundary. */
function splitTopLevelSemicolons(str) {
  const parts = [];
  let current = '';
  let depth = 0;
  let quote = null;
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
    if (ch === ';' && depth === 0) {
      parts.push(current);
      current = '';
      continue;
    }
    current += ch;
  }
  parts.push(current);
  return parts;
}

function findMatchingDelimiter(text, openIdx, openChar, closeChar) {
  let depth = 0;
  for (let j = openIdx; j < text.length; j += 1) {
    if (text[j] === openChar) depth += 1;
    else if (text[j] === closeChar) {
      depth -= 1;
      if (depth === 0) return j;
    }
  }
  return -1;
}

function parseSimpleStatement(lines, i, instructions, language) {
  const { raw, index } = lines[i];
  const line = stripComment(raw, language);

  const assign = parseAssignment(line);
  if (assign?.declareOnly) {
    instructions.push(buildAssignInstruction(index, raw, assign, true));
    return;
  }
  if (assign?.multiDeclare) {
    // `int sum=24, i=23;` -> one DECLARE_VARIABLE instruction per variable, all
    // attributed to this source line (multiple steps per line is already how loop
    // headers and if-conditions work in this engine — nothing new for the UI).
    // Each instruction carries `declaratorIndex`/`declaratorCount`/`declaratorNames`
    // so explain/explanations.js can label them "declaration 1 of 2 (sum)" etc.
    // instead of two identical-looking, unlabeled "assign" steps on the same line.
    const declaratorNames = assign.declarations.map((decl) => decl.target);
    assign.declarations.forEach((decl, declaratorIndex) => {
      const inst = buildAssignInstruction(
        index,
        raw,
        { target: decl.target, expr: decl.expr, declaredType: assign.declaredType },
        true
      );
      inst.declaratorIndex = declaratorIndex;
      inst.declaratorCount = assign.declarations.length;
      inst.declaratorNames = declaratorNames;
      instructions.push(inst);
    });
    return;
  }
  if (assign?.arrayUpdate) {
    instructions.push(buildArrayUpdateInstruction(index, raw, assign));
    return;
  }
  if (assign) {
    const isDeclare = detectDeclaration(line, language) && !assign.compoundOp;
    instructions.push(buildAssignInstruction(index, raw, assign, isDeclare));
    return;
  }

  const print = parsePrint(line);
  if (print) {
    instructions.push(buildPrintInstruction(index, raw, print));
    return;
  }

  const input = parseInput(line);
  if (input) {
    instructions.push(buildInputInstruction(index, raw, input));
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

  // `case <value>:` / `default:` — a pure LABEL inside a switch body (see the
  // `switch` handling in parseStatementBlock), not a block construct of its own:
  // it doesn't recurse into a body range, it just marks a jump target that
  // ordinary statements (including nested if/for/while, parsed completely
  // normally) follow linearly until a `break` or the switch's own end.
  const caseMatch = line.trim().match(/^case\s+(.+?)\s*:$/);
  if (caseMatch) {
    instructions.push(createInstruction(IR_OPCODES.CASE_LABEL, index + 1, raw, { caseValueExpr: parseExpressionString(caseMatch[1]) }));
    return;
  }
  if (line.trim() === 'default:') {
    instructions.push(createInstruction(IR_OPCODES.CASE_LABEL, index + 1, raw, { isDefault: true }));
    return;
  }

  // Bare expression statement with its own side effect: standalone `i++;`, `++i;`,
  // or a bare function call `foo();`. None of the checks above recognize these
  // (they all require an `=` or a specific keyword), so without this they silently
  // became no-op STATEMENT instructions and the increment/decrement/call never
  // actually happened — a real, generally-impacting gap, not specific to any one
  // example (a standalone `count++;` on its own line is an extremely common
  // pattern in generated tracing problems).
  const trimmedForExpr = line.trim().replace(/;$/, '');
  if (trimmedForExpr) {
    const exprNode = parseExpressionString(trimmedForExpr);
    if (exprNode.type === EXPR_TYPES.PRE_INCDEC || exprNode.type === EXPR_TYPES.POST_INCDEC) {
      instructions.push(createInstruction(IR_OPCODES.INCREMENT, index + 1, raw, { valueExpr: exprNode }));
      return;
    }
    if (exprNode.type === EXPR_TYPES.CALL) {
      // A bare function-call statement (`foo();`) — its own real classification
      // (FUNCTION_CALL), not the increment/decrement bucket. Arguments are still
      // evaluated for side effects by the same evaluator path as INCREMENT used.
      instructions.push(createInstruction(IR_OPCODES.FUNCTION_CALL, index + 1, raw, { valueExpr: exprNode }));
      return;
    }
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
