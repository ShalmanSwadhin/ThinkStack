/**
 * Universal IR Execution Engine
 * Executes ONLY IR instructions — never language-specific syntax.
 */

import { IR_OPCODES } from '../ir/opcodes.js';
import { createRuntime, setVarType, getLanguage, drainSideEffects } from './runtime.js';
import { parseExpression } from './expressionParser.js';
import { normalizeDeclaredType } from './typeSystem.js';
import {
  evaluateExpr,
  evaluateRawExpression,
  evaluateCondition,
  evaluatePrintArgs,
  evaluatePrintf,
  formatValue,
} from './evaluator.js';
import { createStepEmitter } from '../visualizer/stepEmitter.js';

export const MAX_TRACE_STEPS = 15000;

export function executeIR(program) {
  const runtime = createRuntime(program.language);
  const steps = [];
  const { pushStep } = createStepEmitter(runtime, steps, MAX_TRACE_STEPS);
  const instructions = program.instructions;

  if (!instructions.length) {
    return { steps, language: program.language, lineCount: program.lineCount };
  }

  let ip = 0;
  // A SINGLE unified stack of open blocks (if-chains AND loops), pushed in true
  // nesting order regardless of which kind of block is innermost. This replaces an
  // earlier design with two SEPARATE stacks (one for if-chains, one for loops),
  // which had a real bug: when a loop is the last/only thing inside a taken if
  // branch, the if-chain's `bodyEndIndex` and the loop's own `bodyEndIndex`
  // coincide (they both end at the same final instruction). Checking the if-stack
  // before the loop-stack then popped the if-chain frame on the LOOP's very FIRST
  // iteration boundary (mistaking "the loop paused to check whether to continue"
  // for "the if-branch's body is over") — consuming the frame so that when the
  // loop genuinely finished many iterations later, there was no if-frame left to
  // redirect past the else clause, and the else ran for real. A single stack,
  // always resolving whichever block is TRULY innermost (the top of ONE stack),
  // makes that ordering bug structurally impossible: a loop frame sitting above an
  // if-frame always gets first refusal at the same boundary, and only pops through
  // to the if-frame once the loop has authentically finished.
  const blockStack = [];

  // `break` targets the nearest enclosing LOOP *or* `switch`, whichever is
  // innermost. `continue` only ever targets a loop — it skips right over an
  // enclosing `switch` frame (continuing a switch makes no sense; C requires
  // `continue` inside a switch to affect whatever loop contains it).
  const innermostBreakableIndex = () => {
    for (let idx = blockStack.length - 1; idx >= 0; idx -= 1) {
      if (blockStack[idx].type !== 'if') return idx;
    }
    return -1;
  };
  const innermostLoopIndex = () => {
    for (let idx = blockStack.length - 1; idx >= 0; idx -= 1) {
      const t = blockStack[idx].type;
      if (t !== 'if' && t !== 'switch') return idx;
    }
    return -1;
  };

  const continueLoopFrame = (frame) => {
    if (frame.type === 'for-each') {
      frame.index += 1;
      if (frame.index < frame.iterable.length) {
        runtime.scope[frame.variable] = frame.iterable[frame.index];
        pushStep(instructions[frame.headerIndex], {
          condition: `${frame.variable} = ${formatValue(frame.iterable[frame.index])} (iteration ${frame.index + 1} of ${frame.iterable.length})`,
        });
        ip = frame.bodyStartIndex;
      } else {
        blockStack.pop();
      }
      return;
    }

    if (frame.type === 'c-for') {
      // The increment clause (`i++`) and the condition re-check are two DISTINCT
      // events in real execution order — a C-style for-loop's per-iteration cycle
      // is update, THEN condition, not one combined "update-and-check" step.
      applyIncrement(frame.increment, runtime.scope);
      pushStep(instructions[frame.headerIndex], {
        phase: 'update',
        condition: `update: ${frame.increment}`,
      });
      const pass = evaluateCondition(frame.condition, runtime.scope);
      pushStep(instructions[frame.headerIndex], {
        condition: `${frame.conditionSource ?? frame.condition} → ${pass}`,
        loopContinues: pass,
      });
      if (pass) ip = frame.bodyStartIndex;
      else blockStack.pop();
      return;
    }

    if (frame.type === 'while' || frame.type === 'do-while') {
      // Identical per-iteration re-check for both — the only difference between
      // `while` and `do-while` is how the loop is FIRST entered (while checks
      // before the first pass; do-while enters unconditionally, see the
      // WHILE_LOOP/DO_WHILE opcode cases below), not how it continues afterward.
      const pass = evaluateCondition(frame.condition, runtime.scope);
      pushStep(instructions[frame.headerIndex], {
        condition: `${frame.conditionSource ?? frame.condition} → ${pass}`,
        loopContinues: pass,
      });
      if (pass) ip = frame.bodyStartIndex;
      else blockStack.pop();
      return;
    }
  };

  // Announces the clause(s) that will NOT run (the rest of an if/elif/else chain
  // once an earlier clause matched) as their own trace steps — but only once the
  // TAKEN clause's body has actually finished, so the trace reads in real
  // execution order (condition → body statements → "else: skipped"), not in
  // source order (condition → "else: skipped" → body statements, which is what a
  // naive "announce the skip the moment we know" implementation produces).
  const emitSkippedSiblings = (frame) => {
    for (const siblingIdx of frame.skipSiblingIndices ?? []) {
      const sibling = instructions[siblingIdx];
      pushStep(sibling, {
        condition: sibling.isElse
          ? 'else (skipped — an earlier branch in this chain already matched)'
          : `${sibling.conditionSource ?? 'condition'} (skipped — an earlier branch in this chain already matched)`,
        branchTaken: false,
        skippedDueToEarlierMatch: true,
      });
    }
  };

  // Used by BREAK/CONTINUE/RETURN, which can jump execution past open if-chains
  // without ever naturally reaching the end of their taken clause. Frames above
  // `keepLength` are abandoned along with the rest of the construct they were
  // inside — any if-chain frames among them still get their skip notices emitted
  // (the else genuinely was never going to run, whether or not a break happened
  // afterward), but are discarded rather than redirected through `chainEndIndex`.
  const discardFramesFrom = (keepLength) => {
    while (blockStack.length > keepLength) {
      const frame = blockStack.pop();
      if (frame.type === 'if') emitSkippedSiblings(frame);
    }
  };

  const advancePastClosedBlocks = () => {
    for (;;) {
      const top = blockStack.at(-1);
      if (!top || ip <= top.bodyEndIndex) break;
      if (top.type === 'if') {
        blockStack.pop();
        emitSkippedSiblings(top);
        ip = top.chainEndIndex;
        continue;
      }
      if (top.type === 'switch') {
        // Falling off the end of a switch body with no `break` is not an error —
        // it's just where execution goes next; no redirect needed, unlike an
        // if-chain's "skip the remaining clauses" jump.
        blockStack.pop();
        continue;
      }
      continueLoopFrame(top);
      // Whether the loop just reset `ip` back into its body or genuinely finished
      // and popped itself, re-checking from the top handles both: a reset `ip` is
      // now <= this frame's own bodyEndIndex (loop cleanly re-enters), and a pop
      // exposes whatever frame is next (which may ALSO need resolving at this
      // same `ip`, e.g. an enclosing if-chain whose taken branch was this loop).
    }
  };

  while (ip < instructions.length) {
    advancePastClosedBlocks();

    const inst = instructions[ip];
    // Clear any side effects (`++`/`--` on a variable other than this instruction's
    // own top-level target) left over from a previous instruction, so the drain
    // after evaluating THIS instruction reflects only what just happened.
    drainSideEffects(runtime.scope);

    switch (inst.op) {
      case IR_OPCODES.COMMENT:
        pushStep(inst);
        ip += 1;
        break;

      case IR_OPCODES.NOOP:
      case IR_OPCODES.STATEMENT:
        pushStep(inst);
        ip += 1;
        break;

      case IR_OPCODES.DECLARE_VARIABLE:
      case IR_OPCODES.ASSIGN: {
        const prev = runtime.scope[inst.target];
        // The runtime — not the parser's per-line syntactic guess — is the source of
        // truth for "is this the FIRST time this name is bound" (a declaration) vs.
        // "this name already exists" (an update). This matters most for languages
        // with no declaration keyword at all (Python: `x = 5` looks identical whether
        // `x` is brand new or being reassigned for the tenth time), but is checked for
        // every language so the same rule applies everywhere.
        const isDeclaration = !runtime.declaredNames.has(inst.target);
        runtime.declaredNames.add(inst.target);
        // An explicit declared type (from `int x = ...`, `float x = ...`, etc.) must be
        // recorded BEFORE the value expression is evaluated, so that when the RHS'
        // implicit `target = expr` assignment node reads the target's current kind it
        // sees the DECLARED type rather than falling back to the literal's inferred
        // kind (e.g. `float a = 25;` must stay `float`, not become `int` from `25`).
        if (inst.declaredType) setVarType(runtime.scope, inst.target, inst.declaredType);
        let value = inst.valueExpr ? evaluateExpr(inst.valueExpr, runtime.scope) : undefined;
        if (value === undefined && inst.valueSource) {
          value = evaluateRawExpression(inst.valueSource, runtime.scope);
        }
        runtime.scope[inst.target] = value;
        // Side effects recorded here are ones embedded in the RHS expression on a
        // variable OTHER than `inst.target` itself (e.g. the `i++` inside
        // `sum = sum / i++`) — the assignment to `inst.target` is described directly
        // via `target`/`previousValue` above, not as a "side effect".
        const sideEffects = drainSideEffects(runtime.scope);
        pushStep(inst, {
          target: inst.target,
          changed: inst.target,
          previousValue: prev,
          isDeclaration,
          sideEffects,
          declaratorIndex: inst.declaratorIndex,
          declaratorCount: inst.declaratorCount,
          declaratorNames: inst.declaratorNames,
        });
        ip += 1;
        advancePastClosedBlocks();
        break;
      }

      case IR_OPCODES.ARRAY_UPDATE: {
        const arr = runtime.scope[inst.arrayName];
        const idx = inst.indexExpr
          ? evaluateExpr(inst.indexExpr, runtime.scope)
          : evaluateRawExpression(inst.indexSource, runtime.scope);
        const value = inst.valueExpr
          ? evaluateExpr(inst.valueExpr, runtime.scope)
          : evaluateRawExpression(inst.valueSource, runtime.scope);
        if (Array.isArray(arr) && Number.isFinite(idx)) {
          arr[Math.floor(idx)] = value;
        }
        const sideEffects = drainSideEffects(runtime.scope);
        pushStep(inst, { target: inst.arrayName, index: idx, newValue: value, sideEffects });
        ip += 1;
        advancePastClosedBlocks();
        break;
      }

      case IR_OPCODES.INCREMENT: {
        // A standalone expression-statement with its own side effect: `i++;`,
        // `++i;`, or a bare function call `foo();`. `valueExpr` (a pre-parsed AST
        // node) is used when the parser recognized one of those forms directly;
        // `incrementSource`/`sourceLine` (a raw string re-parsed by `applyIncrement`)
        // remains for callers that only have source text on hand.
        if (inst.valueExpr) {
          evaluateExpr(inst.valueExpr, runtime.scope);
        } else {
          applyIncrement(inst.incrementSource ?? inst.sourceLine, runtime.scope);
        }
        const sideEffects = drainSideEffects(runtime.scope);
        pushStep(inst, { sideEffects });
        ip += 1;
        advancePastClosedBlocks();
        break;
      }

      case IR_OPCODES.LOOP_INCREMENT: {
        applyIncrement(inst.incrementSource ?? inst.sourceLine, runtime.scope);
        pushStep(inst);
        ip += 1;
        break;
      }

      case IR_OPCODES.PRINT: {
        // `printf("sum=%5d i=%d\n", --sum, ++i)` carries its own format string and must
        // be interpolated positionally (field widths, %x/%c/etc.) rather than the plain
        // space-joined rendering every other print style (print/console.log/cout) uses.
        const text = inst.formatSource
          ? evaluatePrintf(inst.formatSource, inst.argsExpr, runtime.scope)
          : inst.argsExpr
            ? evaluatePrintArgs(inst.argsExpr, runtime.scope)
            : evaluatePrintArgs(
                (inst.argsSource ?? '').split(',').map((s) => s.trim()).filter(Boolean),
                runtime.scope
              );
        runtime.output.push(text);
        // Side effects here are `++`/`--` embedded in the print arguments themselves
        // (`printf(..., --sum, ++i)`, `printf(..., sum++, i--)`) — each recorded
        // effect's `usedValue` is what was actually printed, which for postfix is
        // the OLD value even though the variable now holds the new one.
        const sideEffects = drainSideEffects(runtime.scope);
        pushStep(inst, { sideEffects });
        ip += 1;
        advancePastClosedBlocks();
        break;
      }

      case IR_OPCODES.INPUT: {
        // `scanf`, `cin >>`, Python `input()`, JS `prompt()` — this is a STATIC
        // tracer with no real keyboard to read from. Per the "report unsupported
        // constructs honestly instead of faking traces" principle, the target
        // variable(s) are left exactly as they were — NOT overwritten with a
        // fabricated value that was never actually typed — and the step is
        // classified as Input so the trace is still accurate about what KIND of
        // line this is, even though its runtime effect can't be simulated.
        pushStep(inst, { inputNotSimulated: true });
        ip += 1;
        advancePastClosedBlocks();
        break;
      }

      case IR_OPCODES.FUNCTION_CALL: {
        // A bare function-call statement (`foo();`). Arguments are still evaluated
        // for their own side effects (e.g. `foo(x++)`); the call's return value
        // (if any) is not tracked since this engine does not implement real
        // function-body tracing — see the FUNCTION_DEF case's limitation note.
        if (inst.valueExpr) evaluateExpr(inst.valueExpr, runtime.scope);
        const sideEffects = drainSideEffects(runtime.scope);
        pushStep(inst, { sideEffects });
        ip += 1;
        advancePastClosedBlocks();
        break;
      }

      case IR_OPCODES.FUNCTION_DEF: {
        // A function/class definition this engine deliberately does not trace into
        // (no call-stack/return-value model) — its body was already skipped by the
        // parser (see parsers/blockParser.js). Recorded honestly as its own event
        // rather than a generic statement, and rather than pretending it executed.
        pushStep(inst, { bodyTraced: false });
        ip += 1;
        break;
      }

      case IR_OPCODES.FOR_EACH: {
        const iterable = inst.iterableExpr
          ? evaluateExpr(inst.iterableExpr, runtime.scope)
          : evaluateRawExpression(inst.iterableSource, runtime.scope);
        const arr = Array.isArray(iterable) ? iterable : [];
        if (!arr.length) {
          pushStep(inst, { condition: 'Loop skipped — empty collection' });
          ip = inst.bodyEndIndex + 1;
          break;
        }
        blockStack.push({
          type: 'for-each',
          variable: inst.variable,
          iterable: arr,
          index: 0,
          headerIndex: ip,
          bodyStartIndex: inst.bodyStartIndex,
          bodyEndIndex: inst.bodyEndIndex,
        });
        runtime.scope[inst.variable] = arr[0];
        pushStep(inst, {
          condition: `${inst.variable} = ${formatValue(arr[0])} (iteration 1 of ${arr.length})`,
        });
        ip = inst.bodyStartIndex;
        break;
      }

      case IR_OPCODES.FOR_LOOP: {
        // Initialization is its own event, distinct from the condition check that
        // follows it — `for (int i = 0; i < 3; i++)` runs init ONCE, then
        // condition/body/update repeatedly; collapsing init into the first
        // condition check would hide it from the trace entirely.
        if (inst.initSource) {
          applyIncrement(inst.initSource, runtime.scope);
          pushStep(inst, { phase: 'init', condition: `initialize: ${inst.initSource}` });
        }
        const pass = evaluateCondition(inst.conditionSource ?? inst.conditionExpr, runtime.scope);
        if (!pass) {
          pushStep(inst, { condition: `${inst.conditionSource ?? 'condition'} → false (loop finished)`, loopContinues: false });
          ip = inst.bodyEndIndex + 1;
          break;
        }
        blockStack.push({
          type: 'c-for',
          condition: inst.conditionSource ?? inst.conditionExpr,
          conditionSource: inst.conditionSource,
          increment: inst.incrementSource,
          headerIndex: ip,
          bodyStartIndex: inst.bodyStartIndex,
          bodyEndIndex: inst.bodyEndIndex,
        });
        pushStep(inst, { condition: `${inst.conditionSource ?? 'condition'} → true`, loopContinues: true });
        ip = inst.bodyStartIndex;
        break;
      }

      case IR_OPCODES.WHILE_LOOP: {
        const pass = evaluateCondition(inst.conditionSource ?? inst.conditionExpr, runtime.scope);
        pushStep(inst, { condition: `${inst.conditionSource ?? 'condition'} → ${pass}`, loopContinues: pass });
        if (!pass) {
          ip = inst.bodyEndIndex + 1;
          break;
        }
        blockStack.push({
          type: 'while',
          condition: inst.conditionSource ?? inst.conditionExpr,
          conditionSource: inst.conditionSource,
          headerIndex: ip,
          bodyStartIndex: inst.bodyStartIndex,
          bodyEndIndex: inst.bodyEndIndex,
        });
        ip = inst.bodyStartIndex;
        break;
      }

      case IR_OPCODES.DO_WHILE: {
        // Unlike WHILE_LOOP, the body runs unconditionally the FIRST time — the
        // condition is only checked after it, in `continueLoopFrame`'s shared
        // while/do-while branch above.
        blockStack.push({
          type: 'do-while',
          condition: inst.conditionSource ?? inst.conditionExpr,
          conditionSource: inst.conditionSource,
          headerIndex: ip,
          bodyStartIndex: inst.bodyStartIndex,
          bodyEndIndex: inst.bodyEndIndex,
        });
        pushStep(inst, { condition: 'entering the loop body (condition is checked AFTER the first pass)' });
        ip = inst.bodyStartIndex;
        break;
      }

      case IR_OPCODES.SWITCH: {
        const switchValue = evaluateRawExpression(inst.switchExprSource, runtime.scope);
        let target = inst.defaultIndex;
        let matchedCase;
        for (const candidate of inst.cases ?? []) {
          if (evaluateExpr(candidate.valueExpr, runtime.scope) === switchValue) {
            target = candidate.index;
            matchedCase = candidate;
            break;
          }
        }
        pushStep(inst, {
          condition:
            matchedCase !== undefined
              ? `switch (${inst.switchExprSource}) → matches case ${formatValue(evaluateExpr(matchedCase.valueExpr, runtime.scope))}`
              : target !== undefined
                ? `switch (${inst.switchExprSource}) → no case matches, falling to default`
                : `switch (${inst.switchExprSource}) → no case matches, and there is no default (nothing runs)`,
        });
        if (target === undefined) {
          ip = inst.bodyEndIndex + 1;
          break;
        }
        blockStack.push({ type: 'switch', bodyEndIndex: inst.bodyEndIndex });
        ip = target;
        break;
      }

      case IR_OPCODES.CASE_LABEL:
        // A pure jump target — SWITCH already landed `ip` here (or execution fell
        // through into it from the previous case, which is valid C fall-through).
        pushStep(inst);
        ip += 1;
        break;

      case IR_OPCODES.COMPARE:
      case IR_OPCODES.SEARCH_COMPARE: {
        const left = inst.leftExpr
          ? evaluateExpr(inst.leftExpr, runtime.scope)
          : evaluateRawExpression(inst.leftSource, runtime.scope);
        const right = inst.rightExpr
          ? evaluateExpr(inst.rightExpr, runtime.scope)
          : evaluateRawExpression(inst.rightSource, runtime.scope);
        const op = inst.operator ?? '==';
        let result;
        switch (op) {
          case '==':
          case '===':
            result = left === right;
            break;
          case '!=':
          case '!==':
            result = left !== right;
            break;
          case '<':
            result = left < right;
            break;
          case '<=':
            result = left <= right;
            break;
          case '>':
            result = left > right;
            break;
          case '>=':
            result = left >= right;
            break;
          default:
            result = Boolean(left);
        }
        pushStep(inst, {
          condition: `${formatValue(left)} ${op} ${formatValue(right)} → ${result}`,
          left,
          right,
        });
        ip += 1;
        break;
      }

      case IR_OPCODES.SORT_SWAP: {
        const arrName = inst.arrayName;
        const arr = runtime.scope[arrName];
        if (Array.isArray(arr)) {
          const li = inst.leftIndex ?? evaluateRawExpression(inst.leftSource, runtime.scope);
          const ri = inst.rightIndex ?? evaluateRawExpression(inst.rightSource, runtime.scope);
          if (Number.isFinite(li) && Number.isFinite(ri)) {
            const tmp = arr[li];
            arr[li] = arr[ri];
            arr[ri] = tmp;
          }
        }
        pushStep(inst, { target: arrName, changed: arrName });
        ip += 1;
        advancePastClosedBlocks();
        break;
      }

      case IR_OPCODES.IF: {
        const isElse = inst.isElse;
        const pass = isElse ? true : evaluateCondition(inst.conditionSource ?? inst.conditionExpr, runtime.scope);
        pushStep(inst, {
          condition: isElse ? 'else → true' : `${inst.conditionSource ?? 'condition'} → ${pass}`,
          branchTaken: pass,
        });
        if (pass) {
          // Once this clause's own body finishes, skip every remaining elif/else
          // clause in the chain rather than falling through into their condition
          // checks/bodies (a chain with no elif/else has chainEndIndex === bodyEndIndex + 1,
          // so this is a harmless same-target jump in that case). The sibling
          // clauses that will never run are recorded on the frame now (structurally,
          // by walking `nextClauseIndex`) but their "skipped" trace steps are NOT
          // emitted here — see `emitSkippedSiblings`: they fire once this frame is
          // popped, i.e. AFTER the taken branch's body has actually executed, so the
          // trace reads in real execution order rather than announcing the skip
          // before the body that runs first has even started.
          if (inst.bodyEndIndex !== undefined && inst.chainEndIndex !== undefined) {
            const skipSiblingIndices = [];
            let siblingIdx = inst.nextClauseIndex;
            while (siblingIdx !== undefined) {
              skipSiblingIndices.push(siblingIdx);
              siblingIdx = instructions[siblingIdx].nextClauseIndex;
            }
            blockStack.push({
              type: 'if',
              bodyEndIndex: inst.bodyEndIndex,
              chainEndIndex: inst.chainEndIndex,
              skipSiblingIndices,
            });
          }
          ip = inst.thenStartIndex;
        } else {
          ip = inst.nextClauseIndex ?? inst.chainEndIndex ?? inst.elseStartIndex ?? inst.endIndex + 1;
        }
        break;
      }

      case IR_OPCODES.BREAK: {
        // Jump past the nearest enclosing LOOP *or* `switch` (skipping over any
        // if-chain frames nested inside it — those are being abandoned along with
        // the rest of the body, not "closed normally", so they're discarded via
        // `discardFramesFrom` rather than redirected through their `chainEndIndex`;
        // any if-chain among them still gets its "else skipped" step emitted, just
        // AFTER this break step, matching the real order control actually took).
        const breakableIdx = innermostBreakableIndex();
        pushStep(inst);
        if (breakableIdx >= 0) {
          const breakableFrame = blockStack[breakableIdx];
          discardFramesFrom(breakableIdx);
          ip = breakableFrame.bodyEndIndex + 1;
        } else {
          ip += 1;
        }
        break;
      }

      case IR_OPCODES.CONTINUE: {
        // Jump to just past the nearest enclosing loop's body so its own
        // re-check/increment logic runs next, discarding any if-chain frames
        // nested inside the CURRENT iteration but keeping the loop frame itself
        // (still looping).
        const loopIdx = innermostLoopIndex();
        pushStep(inst);
        if (loopIdx >= 0) {
          discardFramesFrom(loopIdx + 1);
          ip = blockStack[loopIdx].bodyEndIndex + 1;
        } else {
          ip += 1;
        }
        break;
      }

      case IR_OPCODES.RETURN:
        pushStep(inst);
        ip = instructions.length;
        discardFramesFrom(0);
        break;

      default:
        pushStep(inst);
        ip += 1;
        break;
    }
  }

  return { steps, language: program.language, lineCount: program.lineCount };
}

// Matches the same leading type-keyword ThinkStack's C-style `for (int i = 0; ...)`
// init clause carries, so it can be stripped before parsing (the expression parser
// has no notion of a declaration keyword) while still recording the declared type.
const LEADING_TYPE_KEYWORD = /^(const|let|var|int|long|short|byte|float|double|char|bool|boolean|string|String|auto)\s+/;

/**
 * Handles standalone `i++;`/`++i;` statements and C-style for-loop init/increment
 * clauses (`for (int i = 0; i < n; i++)`). Now routes through the same tokenizer/
 * parser/type-aware evaluator as every other expression instead of its own separate
 * regex-only logic, so a for-loop's declared index type is tracked correctly (e.g.
 * `for (int i = 0; i < n; i++) { x = 10 / i; }` must truncate-divide by `i`).
 */
function applyIncrement(source, scope) {
  const trimmed = (source ?? '').trim().replace(/;$/, '');
  if (!trimmed) return;

  const typeMatch = trimmed.match(LEADING_TYPE_KEYWORD);
  const stripped = typeMatch ? trimmed.slice(typeMatch[0].length) : trimmed;

  if (typeMatch) {
    const identMatch = stripped.match(/^([a-zA-Z_]\w*)\s*=/);
    if (identMatch) {
      setVarType(scope, identMatch[1], normalizeDeclaredType(typeMatch[1], getLanguage(scope)));
    }
  }

  evaluateExpr(parseExpression(stripped), scope);
}

export default { executeIR, MAX_TRACE_STEPS };
