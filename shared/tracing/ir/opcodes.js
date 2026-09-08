/**
 * ThinkStack Universal IR — Instruction Opcodes
 * Language-independent execution model for Manual Tracing.
 */

export const IR_OPCODES = Object.freeze({
  // Variables & assignment
  DECLARE_VARIABLE: 'DECLARE_VARIABLE',
  ASSIGN: 'ASSIGN',

  // Arithmetic
  ADD: 'ADD',
  SUBTRACT: 'SUBTRACT',
  MULTIPLY: 'MULTIPLY',
  DIVIDE: 'DIVIDE',
  MODULO: 'MODULO',
  INCREMENT: 'INCREMENT',
  DECREMENT: 'DECREMENT',

  // Comparison & logic
  COMPARE: 'COMPARE',

  // Control flow
  IF: 'IF',
  ELSE: 'ELSE',
  ENDIF: 'ENDIF',
  FOR_LOOP: 'FOR_LOOP',
  FOR_EACH: 'FOR_EACH',
  WHILE_LOOP: 'WHILE_LOOP',
  DO_WHILE: 'DO_WHILE',
  LOOP_BODY_START: 'LOOP_BODY_START',
  LOOP_BODY_END: 'LOOP_BODY_END',
  LOOP_CONTINUE: 'LOOP_CONTINUE',
  LOOP_INCREMENT: 'LOOP_INCREMENT',
  SWITCH: 'SWITCH',
  BREAK: 'BREAK',
  CONTINUE: 'CONTINUE',
  RETURN: 'RETURN',

  // Functions
  FUNCTION_DEF: 'FUNCTION_DEF',
  FUNCTION_CALL: 'FUNCTION_CALL',
  FUNCTION_RETURN: 'FUNCTION_RETURN',
  RECURSIVE_CALL: 'RECURSIVE_CALL',

  // Arrays & collections
  CREATE_ARRAY: 'CREATE_ARRAY',
  ARRAY_ACCESS: 'ARRAY_ACCESS',
  ARRAY_UPDATE: 'ARRAY_UPDATE',
  CREATE_MATRIX: 'CREATE_MATRIX',

  // Objects & classes
  CREATE_OBJECT: 'CREATE_OBJECT',
  OBJECT_ACCESS: 'OBJECT_ACCESS',
  CREATE_CLASS: 'CREATE_CLASS',
  CONSTRUCTOR: 'CONSTRUCTOR',
  METHOD_CALL: 'METHOD_CALL',

  // Pointers & references
  CREATE_POINTER: 'CREATE_POINTER',
  POINTER_DEREFERENCE: 'POINTER_DEREFERENCE',

  // Data structures
  STACK_PUSH: 'STACK_PUSH',
  STACK_POP: 'STACK_POP',
  QUEUE_PUSH: 'QUEUE_PUSH',
  QUEUE_POP: 'QUEUE_POP',
  LINKED_LIST_INSERT: 'LINKED_LIST_INSERT',
  LINKED_LIST_ACCESS: 'LINKED_LIST_ACCESS',
  GRAPH_VISIT: 'GRAPH_VISIT',
  TREE_VISIT: 'TREE_VISIT',
  HASH_MAP_SET: 'HASH_MAP_SET',
  HASH_MAP_GET: 'HASH_MAP_GET',

  // Algorithms
  SORT_SWAP: 'SORT_SWAP',
  SEARCH_COMPARE: 'SEARCH_COMPARE',

  // I/O
  PRINT: 'PRINT',
  INPUT: 'INPUT',

  // Meta
  COMMENT: 'COMMENT',
  STATEMENT: 'STATEMENT',
  NOOP: 'NOOP',
  // A line handled before normal program execution — `#include`/`#define`/`using`/
  // `namespace` (C/C++), `import`/`package` (Java), `import`/`export` (JS). Carries
  // `directiveType`/`directiveSubtype` set by the PARSER (which pattern matched),
  // not guessed later from source text — see parsers/blockParser.js.
  DIRECTIVE: 'DIRECTIVE',
  // A line with no source content at all. Distinct from COMMENT — a blank line is
  // not a comment, and previously both were folded into the same instruction kind.
  BLANK_LINE: 'BLANK_LINE',
  // A `case <value>:` / `default:` label inside a switch body. A pure marker (no
  // body range of its own) that SWITCH jumps directly to — everything after it
  // runs normally, falling through into the next label unless a `break` intervenes.
  CASE_LABEL: 'CASE_LABEL',
});

/** Maps IR opcodes to visualization event types */
export const IR_VISUAL_EVENTS = Object.freeze({
  [IR_OPCODES.DECLARE_VARIABLE]: 'VariableCreated',
  [IR_OPCODES.ASSIGN]: 'VariableUpdated',
  [IR_OPCODES.ARRAY_UPDATE]: 'ArrayModified',
  [IR_OPCODES.FOR_LOOP]: 'LoopStarted',
  [IR_OPCODES.FOR_EACH]: 'LoopStarted',
  [IR_OPCODES.WHILE_LOOP]: 'LoopStarted',
  [IR_OPCODES.LOOP_BODY_END]: 'LoopEnded',
  [IR_OPCODES.COMPARE]: 'ConditionEvaluated',
  [IR_OPCODES.IF]: 'ConditionEvaluated',
  [IR_OPCODES.FUNCTION_CALL]: 'FunctionCalled',
  [IR_OPCODES.FUNCTION_RETURN]: 'FunctionReturned',
  [IR_OPCODES.RECURSIVE_CALL]: 'FunctionCalled',
  [IR_OPCODES.STACK_PUSH]: 'StackFrameCreated',
  [IR_OPCODES.STACK_POP]: 'StackFrameRemoved',
  [IR_OPCODES.CREATE_POINTER]: 'PointerUpdated',
  [IR_OPCODES.POINTER_DEREFERENCE]: 'PointerUpdated',
  [IR_OPCODES.TREE_VISIT]: 'TreeNodeVisited',
  [IR_OPCODES.GRAPH_VISIT]: 'GraphNodeVisited',
  [IR_OPCODES.SORT_SWAP]: 'SwapPerformed',
  [IR_OPCODES.SEARCH_COMPARE]: 'SearchComparison',
  [IR_OPCODES.PRINT]: 'OutputEmitted',
});

export default IR_OPCODES;
