/**
 * IR Step Emitter — converts IR execution events into trace steps for the UI.
 */

import { IR_VISUAL_EVENTS } from '../ir/opcodes.js';
import { cloneScope } from '../engine/runtime.js';
import { explainInstruction, opcodeToStepType } from '../explain/explanations.js';

export function createStepEmitter(runtime, steps, maxSteps) {
  const pushStep = (inst, extra = {}) => {
    if (steps.length >= maxSteps) {
      throw new Error('Trace step limit reached. Check for infinite loops or simplify your code.');
    }

    const stepType = extra.type ?? opcodeToStepType(inst.op);
    const explanation = extra.explanation ?? explainInstruction(inst, runtime.scope, runtime.output, extra);

    steps.push({
      line: inst.line,
      sourceLine: inst.sourceLine ?? '',
      type: stepType,
      variables: cloneScope(runtime.scope),
      callStack: runtime.callStack.map((frame) => ({ ...frame })),
      output: [...runtime.output],
      explanation,
      irOp: inst.op,
      visualEvent: IR_VISUAL_EVENTS[inst.op] ?? 'StatementExecuted',
      ...extra,
    });
  };

  return { pushStep };
}

export default { createStepEmitter };
