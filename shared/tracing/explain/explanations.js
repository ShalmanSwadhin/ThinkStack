/**
 * Educational explanations for IR instructions — language-independent.
 */

import { IR_OPCODES } from '../ir/opcodes.js';
import { EXPR_TYPES, exprToString } from '../ir/expressions.js';
import { formatValue } from '../engine/evaluator.js';

/**
 * Describes an assignment/declaration's RHS using its ACTUAL parsed expression
 * (`a += i` reads back as "a += i", not a guessed "+1" from a before/after value
 * delta that happens to be 1 this particular time). `inst.valueExpr` is always an
 * ASSIGN-shaped AST node (see parsers/common.js's `buildAssignInstruction`), so this
 * works uniformly for every assignment this engine produces, in every language —
 * nothing here is specific to any one variable name or operator.
 */
function describeAssignExpression(inst) {
  const valueExpr = inst.valueExpr;
  if (!valueExpr || valueExpr.type !== EXPR_TYPES.ASSIGN) return null;
  const rhsText = exprToString(valueExpr.value);
  return `${inst.target} ${valueExpr.op} ${rhsText}`;
}

/**
 * Describes one recorded side effect (see engine/runtime.js's `recordSideEffect`) —
 * a `++`/`--` applied to a variable OTHER than the instruction's own primary target,
 * embedded somewhere inside a larger expression (`sum = sum / i++`,
 * `printf(..., --sum, ++i)`). This is entirely driven by what the evaluator actually
 * recorded while evaluating THIS instruction's expression(s) — nothing here is
 * specific to any one example, so it applies identically to any arbitrary generated
 * tracing problem that embeds an increment/decrement inside a larger expression.
 *
 * `contextVerb` names what the value was used FOR from the reader's point of view
 * ("used in this calculation", "printed") so the same describer works for both an
 * assignment's RHS and a print statement's arguments.
 */
function describeSideEffect(effect, contextVerb) {
  const symbol = effect.op === 'increment' ? '++' : '--';
  const changeVerb = effect.op === 'increment' ? 'increases' : 'decreases';
  if (effect.form === 'postfix') {
    // Postfix: the OLD value is what the surrounding expression used; the variable
    // only takes on its new value AFTER that.
    return `"${effect.target}"'s value BEFORE this line, ${formatValue(effect.before)}, is what was ${contextVerb} (postfix ${symbol}); afterward "${effect.target}" ${changeVerb} to ${formatValue(effect.after)}.`;
  }
  // Prefix: the variable is updated FIRST, so the surrounding expression sees the
  // NEW value.
  return `"${effect.target}" ${changeVerb} to ${formatValue(effect.after)} (prefix ${symbol}) before this line uses it, so ${formatValue(effect.after)} is what was ${contextVerb}.`;
}

function incdecSideEffects(sideEffects) {
  return (sideEffects ?? []).filter((effect) => effect.kind === 'incdec');
}

function describeSideEffects(sideEffects, contextVerb) {
  const incdec = incdecSideEffects(sideEffects);
  if (!incdec.length) return '';
  return ' ' + incdec.map((effect) => describeSideEffect(effect, contextVerb)).join(' ');
}

export function explainInstruction(inst, scope, output, extra = {}) {
  const trimmed = (inst.sourceLine ?? '').trim();

  switch (inst.op) {
    case IR_OPCODES.COMMENT:
      return 'This comment is ignored during execution. It documents the code for readers.';

    case IR_OPCODES.DECLARE_VARIABLE:
    case IR_OPCODES.ASSIGN: {
      // The executor tracks, at runtime, which names have already been bound at
      // least once — that (not the opcode the parser guessed from the source line)
      // is the reliable signal for "is this really a declaration". This matters
      // most for languages with no declaration keyword (Python: `x = 5` looks
      // identical whether `x` is brand new or being reassigned for the tenth time).
      const isDeclaration = extra.isDeclaration ?? inst.op === IR_OPCODES.DECLARE_VARIABLE;
      const currentValue = formatValue(scope[inst.target]);
      const sideEffectText = describeSideEffects(extra.sideEffects, 'used in this calculation');

      if (isDeclaration) {
        // `int sum=24, i=23;` declares two variables on one line — each becomes its
        // own step (so the tracer can highlight/step through each initializer), but
        // must say which declarator it is, not look like two unrelated statements.
        const groupLabel =
          extra.declaratorCount > 1
            ? ` (declarator ${extra.declaratorIndex + 1} of ${extra.declaratorCount} declared on this line)`
            : '';
        return `A new variable "${inst.target}" is created with value ${currentValue}${groupLabel}.${sideEffectText}`;
      }

      const prev = extra.previousValue;
      const exprDesc = describeAssignExpression(inst);
      // Describe what actually happened via the parsed expression (`a += i`, using
      // i's CURRENT value) rather than guessing "+1"/"-1" from a value delta that
      // could coincidentally be ±1 for any operator (`a += i` when `i` happens to be
      // 1 looks numerically identical to `a++`, but is a different operation and
      // would say the wrong thing the next time `i` isn't 1).
      const viaText = exprDesc ? ` (via \`${exprDesc}\`)` : '';
      return `"${inst.target}" already existed and is now updated to ${currentValue}${viaText} (previous value ${formatValue(prev)}).${sideEffectText}`;
    }

    case IR_OPCODES.ARRAY_UPDATE: {
      const sideEffectText = describeSideEffects(extra.sideEffects, 'used in this calculation');
      return `Element at index ${extra.index ?? '?'} of array "${inst.arrayName}" is updated to ${formatValue(extra.newValue)}.${sideEffectText}`;
    }

    case IR_OPCODES.PRINT: {
      const base = `Output is sent to the console: ${JSON.stringify(output.at(-1) ?? '')}.`;
      return base + describeSideEffects(extra.sideEffects, 'printed');
    }

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

    case IR_OPCODES.INCREMENT: {
      // A standalone expression-statement: `i++;`, `++i;`, or a bare function call.
      // Driven entirely by what was actually recorded while evaluating it — no
      // assumption that it's always "+1" (it could be `--`, or a call with no
      // increment at all).
      const effects = incdecSideEffects(extra.sideEffects);
      if (effects.length === 1) {
        const effect = effects[0];
        const symbol = effect.op === 'increment' ? '++' : '--';
        const changeVerb = effect.op === 'increment' ? 'increases' : 'decreases';
        return `"${effect.target}" ${changeVerb} from ${formatValue(effect.before)} to ${formatValue(effect.after)} (${effect.form} ${symbol}).`;
      }
      if (effects.length > 1) {
        return `This expression has multiple side effects:${describeSideEffects(extra.sideEffects, 'used')}`;
      }
      return 'This expression (a function call or similar) runs for its side effects; it does not itself change a traced variable.';
    }

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
