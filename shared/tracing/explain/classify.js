/**
 * Semantic event classification for the tracing engine.
 *
 * Maps a parsed IR instruction (plus the executor's runtime decision for THIS
 * particular execution of it — `extra`) to a structured `{eventType, eventSubtype,
 * executionStatus, conditionResult}` tuple. Every input here comes from the
 * PARSER's own structural decisions (`inst.op`, `inst.clauseKind`, `inst.compoundOp`,
 * `inst.hasInitializer`, `inst.directiveType`, ...) or the EXECUTOR's own runtime
 * decisions (`extra.branchTaken`, `extra.loopContinues`, ...) — never a fresh regex
 * scan of `inst.sourceLine` at classification time. That keeps this module a pure
 * lookup over already-structured data, so it works identically for every supported
 * language (the parsers are what normalize each language's syntax into the same
 * opcode/field vocabulary in the first place).
 *
 * `executionStatus` is one of:
 *   'Executed'      — this line's own effect actually ran.
 *   'Skipped'       — a condition/branch that did NOT run (but was "reached").
 *   'NotApplicable' — not a runtime action at all (a comment, blank line, directive,
 *                     or a function/class definition whose body isn't traced).
 *   'NotSimulated'  — a real runtime action this static tracer cannot perform
 *                     (reading real keyboard input).
 */
import { IR_OPCODES } from '../ir/opcodes.js';

export function classifyEvent(inst, extra = {}) {
  switch (inst.op) {
    case IR_OPCODES.DIRECTIVE:
      return {
        eventType: inst.directiveType ?? 'Preprocessor Directive',
        eventSubtype: inst.directiveSubtype ?? 'Directive',
        executionStatus: 'NotApplicable',
        conditionResult: null,
      };

    case IR_OPCODES.COMMENT:
      return { eventType: 'Comment', eventSubtype: 'Comment', executionStatus: 'NotApplicable', conditionResult: null };

    case IR_OPCODES.BLANK_LINE:
      return { eventType: 'Blank', eventSubtype: 'BlankLine', executionStatus: 'NotApplicable', conditionResult: null };

    case IR_OPCODES.DECLARE_VARIABLE:
    case IR_OPCODES.ASSIGN: {
      // `extra.isDeclaration` is the EXECUTOR's runtime-tracked truth ("has this
      // name been bound before, right now") — not `inst.op` alone. This matters
      // for Python, which has no declaration keyword at all: its parser marks
      // EVERY `x = ...` line as DECLARE_VARIABLE (there is no syntactic way to
      // tell "x = 5" the first time from "x = 5" the tenth time), so trusting the
      // opcode alone would misclassify every Python reassignment as a Declaration.
      const isDeclaration = extra.isDeclaration ?? inst.op === IR_OPCODES.DECLARE_VARIABLE;
      if (isDeclaration) {
        return {
          eventType: 'Declaration',
          eventSubtype: inst.hasInitializer === false ? 'Declaration' : 'DeclarationAndInitialization',
          executionStatus: 'Executed',
          conditionResult: null,
        };
      }
      return {
        eventType: 'Assignment',
        eventSubtype: inst.compoundOp ? 'CompoundAssignment' : 'Assignment',
        executionStatus: 'Executed',
        conditionResult: null,
      };
    }

    case IR_OPCODES.ARRAY_UPDATE:
      return { eventType: 'Assignment', eventSubtype: 'ArrayElementUpdate', executionStatus: 'Executed', conditionResult: null };

    case IR_OPCODES.SORT_SWAP:
      return { eventType: 'Assignment', eventSubtype: 'Swap', executionStatus: 'Executed', conditionResult: null };

    case IR_OPCODES.INCREMENT:
      return { eventType: 'ControlFlow', eventSubtype: 'IncrementDecrement', executionStatus: 'Executed', conditionResult: null };

    case IR_OPCODES.PRINT:
      return { eventType: 'Output', eventSubtype: 'Print', executionStatus: 'Executed', conditionResult: null };

    case IR_OPCODES.INPUT:
      return { eventType: 'Input', eventSubtype: 'Read', executionStatus: 'NotSimulated', conditionResult: null };

    case IR_OPCODES.IF: {
      const isCondition = inst.clauseKind !== 'else';
      const subtype = inst.clauseKind === 'if' ? 'If' : inst.clauseKind === 'else-if' ? 'ElseIf' : 'Else';
      const skipped = extra.branchTaken === false;
      return {
        eventType: isCondition ? 'Condition' : 'Branch',
        eventSubtype: subtype,
        executionStatus: skipped ? 'Skipped' : 'Executed',
        conditionResult: isCondition ? extra.branchTaken ?? null : null,
      };
    }

    case IR_OPCODES.FOR_LOOP:
      if (extra.phase === 'init') {
        return { eventType: 'Declaration', eventSubtype: 'LoopInitialization', executionStatus: 'Executed', conditionResult: null };
      }
      if (extra.phase === 'update') {
        return { eventType: 'Assignment', eventSubtype: 'LoopUpdate', executionStatus: 'Executed', conditionResult: null };
      }
      return { eventType: 'Loop', eventSubtype: 'For', executionStatus: 'Executed', conditionResult: extra.loopContinues ?? null };
    case IR_OPCODES.WHILE_LOOP:
      return { eventType: 'Loop', eventSubtype: 'While', executionStatus: 'Executed', conditionResult: extra.loopContinues ?? null };
    case IR_OPCODES.FOR_EACH:
      return { eventType: 'Loop', eventSubtype: 'ForEach', executionStatus: 'Executed', conditionResult: null };
    case IR_OPCODES.DO_WHILE:
      return { eventType: 'Loop', eventSubtype: 'DoWhile', executionStatus: 'Executed', conditionResult: extra.loopContinues ?? null };

    case IR_OPCODES.COMPARE:
    case IR_OPCODES.SEARCH_COMPARE:
      return { eventType: 'Comparison', eventSubtype: 'Compare', executionStatus: 'Executed', conditionResult: null };

    case IR_OPCODES.SWITCH:
      return { eventType: 'Selection', eventSubtype: 'Switch', executionStatus: 'Executed', conditionResult: null };
    case IR_OPCODES.CASE_LABEL:
      return {
        eventType: 'Case',
        eventSubtype: inst.isDefault ? 'Default' : 'Case',
        executionStatus: 'Executed',
        conditionResult: null,
      };

    case IR_OPCODES.BREAK:
      return { eventType: 'ControlFlow', eventSubtype: 'Break', executionStatus: 'Executed', conditionResult: null };
    case IR_OPCODES.CONTINUE:
      return { eventType: 'ControlFlow', eventSubtype: 'Continue', executionStatus: 'Executed', conditionResult: null };
    case IR_OPCODES.RETURN:
      return { eventType: 'ControlFlow', eventSubtype: 'Return', executionStatus: 'Executed', conditionResult: null };

    case IR_OPCODES.FUNCTION_DEF:
      return {
        eventType: 'FunctionDeclaration',
        eventSubtype: inst.definitionKind === 'class' ? 'Class' : 'Function',
        executionStatus: 'NotApplicable',
        conditionResult: null,
      };
    case IR_OPCODES.FUNCTION_CALL:
      return { eventType: 'FunctionCall', eventSubtype: 'Call', executionStatus: 'Executed', conditionResult: null };

    case IR_OPCODES.NOOP:
    case IR_OPCODES.STATEMENT:
    default:
      return { eventType: 'Statement', eventSubtype: 'Generic', executionStatus: 'Executed', conditionResult: null };
  }
}

export default { classifyEvent };
