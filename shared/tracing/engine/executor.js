/**
 * Universal IR Execution Engine
 * Executes ONLY IR instructions — never language-specific syntax.
 */

import { IR_OPCODES } from '../ir/opcodes.js';
import { createRuntime } from './runtime.js';
import {
  evaluateExpr,
  evaluateRawExpression,
  evaluateCondition,
  evaluatePrintArgs,
  formatValue,
} from './evaluator.js';
import { createStepEmitter } from '../visualizer/stepEmitter.js';

export const MAX_TRACE_STEPS = 15000;

export function executeIR(program) {
  const runtime = createRuntime();
  const steps = [];
  const { pushStep } = createStepEmitter(runtime, steps, MAX_TRACE_STEPS);
  const instructions = program.instructions;

  if (!instructions.length) {
    return { steps, language: program.language, lineCount: program.lineCount };
  }

  let ip = 0;
  const loopStack = [];

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
      applyIncrement(frame.increment, runtime.scope, pushStep, instructions[frame.headerIndex]);
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
    while (loopStack.length && ip > loopStack.at(-1).bodyEndIndex) {
      if (!continueLoops()) break;
    }

    const inst = instructions[ip];

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
        let value = inst.valueExpr ? evaluateExpr(inst.valueExpr, runtime.scope) : undefined;
        if (value === undefined && inst.valueSource) {
          value = evaluateRawExpression(inst.valueSource, runtime.scope);
        }
        runtime.scope[inst.target] = value;
        pushStep(inst, { target: inst.target, changed: inst.target, previousValue: prev });
        ip += 1;
        while (loopStack.length && ip > loopStack.at(-1).bodyEndIndex) {
          if (!continueLoops()) break;
        }
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
        pushStep(inst, { target: inst.arrayName, index: idx, newValue: value });
        ip += 1;
        while (loopStack.length && ip > loopStack.at(-1).bodyEndIndex) {
          if (!continueLoops()) break;
        }
        break;
      }

      case IR_OPCODES.INCREMENT:
      case IR_OPCODES.LOOP_INCREMENT: {
        applyIncrement(inst.incrementSource ?? inst.sourceLine, runtime.scope, pushStep, inst);
        ip += 1;
        break;
      }

      case IR_OPCODES.PRINT: {
        const text = inst.argsExpr
          ? evaluatePrintArgs(inst.argsExpr, runtime.scope)
          : evaluatePrintArgs(
              (inst.argsSource ?? '').split(',').map((s) => s.trim()).filter(Boolean),
              runtime.scope
            );
        runtime.output.push(text);
        pushStep(inst);
        ip += 1;
        while (loopStack.length && ip > loopStack.at(-1).bodyEndIndex) {
          if (!continueLoops()) break;
        }
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
        if (inst.initSource) applyIncrement(inst.initSource, runtime.scope, pushStep, inst);
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
        while (loopStack.length && ip > loopStack.at(-1).bodyEndIndex) {
          if (!continueLoops()) break;
        }
        break;
      }

      case IR_OPCODES.IF: {
        const isElse = inst.isElse;
        const pass = isElse ? true : evaluateCondition(inst.conditionSource ?? inst.conditionExpr, runtime.scope);
        pushStep(inst, { condition: isElse ? 'else → true' : `${inst.conditionSource ?? 'condition'} → ${pass}` });
        if (pass) {
          ip = inst.thenStartIndex;
        } else {
          ip = inst.elseStartIndex ?? inst.endIndex + 1;
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
        pushStep(inst);
        break;
      }

      case IR_OPCODES.CONTINUE: {
        if (loopStack.length) {
          ip = loopStack.at(-1).bodyEndIndex + 1;
        } else {
          ip += 1;
        }
        pushStep(inst);
        break;
      }

      case IR_OPCODES.RETURN:
        pushStep(inst);
        ip = instructions.length;
        break;

      default:
        pushStep(inst);
        ip += 1;
        break;
    }
  }

  return { steps, language: program.language, lineCount: program.lineCount };
}

function applyIncrement(source, scope, pushStep, inst) {
  const trimmed = (source ?? '').trim().replace(/;$/, '');
  const postInc = trimmed.match(/^(\w+)\+\+$/);
  if (postInc) {
    scope[postInc[1]] = (scope[postInc[1]] ?? 0) + 1;
    return;
  }
  const preInc = trimmed.match(/^\+\+(\w+)$/);
  if (preInc) {
    scope[preInc[1]] = (scope[preInc[1]] ?? 0) + 1;
    return;
  }
  const incMatch = trimmed.match(/^(\w+)\s*=\s*(.+)$/);
  if (incMatch) {
    scope[incMatch[1]] = evaluateRawExpression(incMatch[2], scope);
    return;
  }
  const declMatch = trimmed.match(
    /^(?:(?:const|let|var|int|long|float|double|char|string|auto)\s+)?([a-zA-Z_]\w*(?:\[\])?)\s*=\s*(.+)$/
  );
  if (declMatch) {
    const target = declMatch[1].replace('[]', '');
    scope[target] = evaluateRawExpression(declMatch[2], scope);
  }
}

export default { executeIR, MAX_TRACE_STEPS };
