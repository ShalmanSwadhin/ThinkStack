/**
 * IR Step Emitter — converts IR execution events into trace steps for the UI.
 */

import { IR_VISUAL_EVENTS } from '../ir/opcodes.js';
import { cloneScope } from '../engine/runtime.js';
import { explainInstruction, opcodeToStepType } from '../explain/explanations.js';
import { classifyEvent } from '../explain/classify.js';

export function createStepEmitter(runtime, steps, maxSteps) {
  // The "before" snapshot for step N is simply the "after" snapshot of step N-1
  // (or the empty initial scope for the very first step) — tracked here rather
  // than re-snapshotting inside the executor's main loop, so every call site that
  // already calls `pushStep` gets `variablesBefore`/`variablesAfter` for free.
  let previousVariables = cloneScope(runtime.scope);

  const pushStep = (inst, extra = {}) => {
    if (steps.length >= maxSteps) {
      throw new Error('Trace step limit reached. Check for infinite loops or simplify your code.');
    }

    const stepType = extra.type ?? opcodeToStepType(inst.op);
    const explanation = extra.explanation ?? explainInstruction(inst, runtime.scope, runtime.output, extra);
    const classification = classifyEvent(inst, extra);
    const variablesAfter = cloneScope(runtime.scope);
    const variablesBefore = previousVariables;
    previousVariables = variablesAfter;

    steps.push({
      // 1-based position in ACTUAL EXECUTION order — this is the array index the
      // step lands at, never derived from `sourceLine`/`line`. Two steps can (and
      // routinely do, in any loop) share the same source line while having
      // different, strictly increasing `executionOrder` values; conversely two
      // adjacent execution-order steps do NOT need adjacent source lines (a taken
      // if-branch's body executes before its sibling's "skipped" notice, even
      // though the sibling's source line comes first) — see engine/executor.js's
      // `emitSkippedSiblings`.
      executionOrder: steps.length + 1,
      line: inst.line,
      sourceLine: inst.sourceLine ?? '',
      type: stepType,
      eventType: classification.eventType,
      eventSubtype: classification.eventSubtype,
      executionStatus: classification.executionStatus,
      conditionResult: classification.conditionResult,
      variables: variablesAfter,
      variablesBefore,
      variablesAfter,
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
