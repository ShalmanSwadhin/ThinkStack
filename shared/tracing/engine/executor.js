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
  const loopStack = [];
  // Tracks open if/elif/else chains: when execution reaches the end of a TAKEN
  // clause's own body, it must skip past every remaining clause in the chain
  // (`chainEndIndex`) rather than falling through into the next clause's condition
  // check/body — see parsers/blockParser.js's `parseIfChain` for why that fallthrough
  // used to silently run every branch past the first.
  const ifStack = [];

  // BREAK/CONTINUE/RETURN can jump execution past an open if/elif/else chain
  // without ever naturally reaching the end of its taken clause (e.g. `break`
  // inside an `if` inside a `for`) — any ifStack frame whose scope is now entirely
  // behind the new `ip` must be discarded outright, NOT redirected through its
  // `chainEndIndex` (which would otherwise incorrectly jump execution backward,
  // since `advancePastClosedBlocks` only checks "did ip pass this frame's end",
  // not "did we get there via normal fallthrough vs. an explicit jump").
  const discardStaleIfFrames = (targetIp) => {
    while (ifStack.length && ifStack.at(-1).bodyEndIndex < targetIp) {
      ifStack.pop();
    }
  };

  const advancePastClosedBlocks = () => {
    for (;;) {
      if (ifStack.length && ip > ifStack.at(-1).bodyEndIndex) {
        ip = ifStack.pop().chainEndIndex;
        continue;
      }
      if (loopStack.length && ip > loopStack.at(-1).bodyEndIndex) {
        continueLoops();
        continue;
      }
      break;
    }
  };

  const continueLoops = () => {
    if (!loopStack.length) return false;

    const frame = loopStack.at(-1);
    if (ip <= frame.bodyEndIndex) return false;

    if (frame.type === 'for-each') {
      frame.index += 1;
      if (frame.index < frame.iterable.length) {
        runtime.scope[frame.variable] = frame.iterable[frame.index];
        pushStep(instructions[frame.headerIndex], {
          condition: `${frame.variable} = ${formatValue(frame.iterable[frame.index])} (iteration ${frame.index + 1} of ${frame.iterable.length})`,
        });
        ip = frame.bodyStartIndex;
      } else {
        loopStack.pop();
      }
      return true;
    }

    if (frame.type === 'while') {
      const pass = evaluateCondition(frame.condition, runtime.scope);
      pushStep(instructions[frame.headerIndex], {
        condition: `${frame.conditionSource ?? frame.condition} → ${pass}`,
      });
      if (pass) ip = frame.bodyStartIndex;
      else loopStack.pop();
      return true;
    }

    if (frame.type === 'c-for') {
      applyIncrement(frame.increment, runtime.scope);
      const pass = evaluateCondition(frame.condition, runtime.scope);
      pushStep(instructions[frame.headerIndex], {
        condition: `${frame.conditionSource ?? frame.condition} → ${pass}`,
      });
      if (pass) ip = frame.bodyStartIndex;
      else loopStack.pop();
      return true;
    }

    return false;
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
        loopStack.push({
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
        if (inst.initSource) applyIncrement(inst.initSource, runtime.scope);
        const pass = evaluateCondition(inst.conditionSource ?? inst.conditionExpr, runtime.scope);
        if (!pass) {
          pushStep(inst, { condition: `${inst.conditionSource ?? 'condition'} → false (loop finished)` });
          ip = inst.bodyEndIndex + 1;
          break;
        }
        loopStack.push({
          type: 'c-for',
          condition: inst.conditionSource ?? inst.conditionExpr,
          conditionSource: inst.conditionSource,
          increment: inst.incrementSource,
          headerIndex: ip,
          bodyStartIndex: inst.bodyStartIndex,
          bodyEndIndex: inst.bodyEndIndex,
        });
        pushStep(inst, { condition: `${inst.conditionSource ?? 'condition'} → true` });
        ip = inst.bodyStartIndex;
        break;
      }

      case IR_OPCODES.WHILE_LOOP: {
        const pass = evaluateCondition(inst.conditionSource ?? inst.conditionExpr, runtime.scope);
        pushStep(inst, { condition: `${inst.conditionSource ?? 'condition'} → ${pass}` });
        if (!pass) {
          ip = inst.bodyEndIndex + 1;
          break;
        }
        loopStack.push({
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
        pushStep(inst, { condition: isElse ? 'else → true' : `${inst.conditionSource ?? 'condition'} → ${pass}` });
        if (pass) {
          // Once this clause's own body finishes, skip every remaining elif/else
          // clause in the chain rather than falling through into their condition
          // checks/bodies (a chain with no elif/else has chainEndIndex === bodyEndIndex + 1,
          // so this is a harmless same-target jump in that case).
          if (inst.bodyEndIndex !== undefined && inst.chainEndIndex !== undefined) {
            ifStack.push({ bodyEndIndex: inst.bodyEndIndex, chainEndIndex: inst.chainEndIndex });
          }
          ip = inst.thenStartIndex;
        } else {
          ip = inst.nextClauseIndex ?? inst.chainEndIndex ?? inst.elseStartIndex ?? inst.endIndex + 1;
        }
        break;
      }

      case IR_OPCODES.BREAK: {
        if (loopStack.length) {
          ip = loopStack.at(-1).bodyEndIndex + 1;
          loopStack.pop();
        } else {
          ip += 1;
        }
        discardStaleIfFrames(ip);
        pushStep(inst);
        break;
      }

      case IR_OPCODES.CONTINUE: {
        if (loopStack.length) {
          ip = loopStack.at(-1).bodyEndIndex + 1;
        } else {
          ip += 1;
        }
        discardStaleIfFrames(ip);
        pushStep(inst);
        break;
      }

      case IR_OPCODES.RETURN:
        pushStep(inst);
        ip = instructions.length;
        discardStaleIfFrames(ip);
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
