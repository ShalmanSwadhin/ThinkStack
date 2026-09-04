/**
 * Educational explanations for IR instructions — language-independent.
 */

import { IR_OPCODES } from '../ir/opcodes.js';
import { formatValue } from '../engine/evaluator.js';

export function explainInstruction(inst, scope, output, extra = {}) {
  const trimmed = (inst.sourceLine ?? '').trim();

  switch (inst.op) {
    case IR_OPCODES.COMMENT:
      return 'This comment is ignored during execution. It documents the code for readers.';

    case IR_OPCODES.DECLARE_VARIABLE:
      return `A new variable "${inst.target}" is created with value ${formatValue(scope[inst.target])}.`;

    case IR_OPCODES.ASSIGN:
      if (inst.target && scope[inst.target] !== undefined) {
        const prev = extra.previousValue;
        if (prev !== undefined && typeof scope[inst.target] === 'number' && typeof prev === 'number') {
          if (scope[inst.target] === prev + 1) {
            return `The value of ${inst.target} increases by one.`;
          }
          if (scope[inst.target] === prev - 1) {
            return `The value of ${inst.target} decreases by one.`;
          }
        }
        return `The value ${formatValue(scope[inst.target])} is stored in variable "${inst.target}".`;
      }
      return `The value ${formatValue(scope[inst.target])} is stored in variable "${inst.target}".`;

    case IR_OPCODES.ARRAY_UPDATE:
      return `Element at index ${extra.index ?? '?'} of array "${inst.arrayName}" is updated to ${formatValue(extra.newValue)}.`;

    case IR_OPCODES.PRINT:
      return `Output is sent to the console: ${JSON.stringify(output.at(-1) ?? '')}.`;

    case IR_OPCODES.FOR_EACH:
    case IR_OPCODES.FOR_LOOP:
    case IR_OPCODES.WHILE_LOOP:
      return extra.condition || 'The loop prepares the next iteration.';

    case IR_OPCODES.COMPARE:
    case IR_OPCODES.IF:
      return extra.condition || 'A condition is evaluated to choose the next branch.';

    case IR_OPCODES.SEARCH_COMPARE:
      return extra.condition || `Comparing ${extra.left ?? '?'} with ${extra.right ?? '?'} during search.`;

    case IR_OPCODES.SORT_SWAP:
      return `Swapping elements at positions ${inst.leftIndex ?? '?'} and ${inst.rightIndex ?? '?'} to sort the array.`;

    case IR_OPCODES.FUNCTION_CALL:
    case IR_OPCODES.RECURSIVE_CALL:
      return `Function "${inst.functionName ?? 'unknown'}" is called.`;

    case IR_OPCODES.FUNCTION_RETURN:
      return `Function "${inst.functionName ?? 'unknown'}" returns ${formatValue(extra.returnValue)}.`;

    case IR_OPCODES.STACK_PUSH:
      return `Value ${formatValue(extra.value)} is pushed onto the stack.`;

    case IR_OPCODES.STACK_POP:
      return `Top element ${formatValue(extra.value)} is popped from the stack.`;

    case IR_OPCODES.QUEUE_PUSH:
      return `Value ${formatValue(extra.value)} is enqueued.`;

    case IR_OPCODES.QUEUE_POP:
      return `Front element ${formatValue(extra.value)} is dequeued.`;

    case IR_OPCODES.GRAPH_VISIT:
      return `Graph node "${inst.nodeId ?? '?'}" is visited.`;

    case IR_OPCODES.TREE_VISIT:
      return `Tree node "${inst.nodeId ?? '?'}" is visited.`;

    case IR_OPCODES.INCREMENT:
      return `The value of ${inst.target} increases by one.`;

    case IR_OPCODES.RETURN:
      return 'The function returns control to the caller.';

    case IR_OPCODES.BREAK:
      return 'The loop is exited early.';

    case IR_OPCODES.CONTINUE:
      return 'The current loop iteration is skipped.';

    default:
      if (trimmed.startsWith('for ') || trimmed.startsWith('while')) {
        return 'This loop controls repetition until its condition becomes false.';
      }
      return 'This line runs as part of the program and may update memory or control flow.';
  }
}

/** Map IR opcode to legacy trace step type for backward compatibility */
export function opcodeToStepType(op) {
  switch (op) {
    case IR_OPCODES.COMMENT:
      return 'comment';
    case IR_OPCODES.DECLARE_VARIABLE:
    case IR_OPCODES.ASSIGN:
    case IR_OPCODES.ARRAY_UPDATE:
    case IR_OPCODES.INCREMENT:
      return 'assign';
    case IR_OPCODES.PRINT:
      return 'output';
    case IR_OPCODES.FOR_EACH:
    case IR_OPCODES.FOR_LOOP:
    case IR_OPCODES.WHILE_LOOP:
    case IR_OPCODES.LOOP_INCREMENT:
      return 'loop';
    case IR_OPCODES.COMPARE:
    case IR_OPCODES.IF:
    case IR_OPCODES.SEARCH_COMPARE:
      return 'condition';
    case IR_OPCODES.SORT_SWAP:
      return 'assign';
    default:
      return 'statement';
  }
}

export default { explainInstruction, opcodeToStepType };
