/**
 * ThinkStack Universal Tracing Engine
 *
 * Pipeline: Source → Language Parser → IR → Execution Engine → Trace Steps → Visualizer
 */

import { TRACING_LANGUAGES, SAMPLE_CODE } from './constants.js';
import { parseToIR } from './parsers/index.js';
import { splitSourceLines } from './parsers/common.js';
import { executeIR } from './engine/executor.js';
import { clearIRCache, getCacheStats } from './cache/irCache.js';
import { normalizeProgram } from './ir/program.js';
import { IR_OPCODES } from './ir/opcodes.js';

export { TRACING_LANGUAGES, SAMPLE_CODE };
export { IR_OPCODES };
export { parseToIR, executeIR, clearIRCache, getCacheStats, normalizeProgram };

/**
 * Build a trace plan from source code.
 * Backward-compatible API — same signature and return shape as legacy traceEngine.
 *
 * @param {string} source
 * @param {string} language
 * @returns {{ steps: object[], language: string, lineCount: number }}
 */
export function buildTracePlan(source, language = 'python') {
  const program = parseToIR(source, language);
  const result = executeIR(program);

  if (!result.steps.length) {
    const sourceLines = splitSourceLines(source);
    const lineCount = sourceLines.length;
    const walkthroughSteps = [];
    for (let i = 0; i < lineCount; i += 1) {
      walkthroughSteps.push({
        line: i + 1,
        sourceLine: sourceLines[i] ?? '',
        type: 'walkthrough',
        variables: {},
        callStack: [{ name: 'main', line: 1 }],
        output: [],
        explanation: 'Add executable statements to begin tracing.',
        irOp: IR_OPCODES.NOOP,
        visualEvent: 'StatementExecuted',
      });
    }
    return { steps: walkthroughSteps, language, lineCount };
  }

  return result;
}

/**
 * Parse source to IR without executing (for testing/debugging).
 */
export function compileToIR(source, language = 'python') {
  return parseToIR(source, language);
}

/**
 * Compare normalized IR across languages for equivalence testing.
 */
export function compareIR(programA, programB) {
  const normA = normalizeProgram(programA);
  const normB = normalizeProgram(programB);
  return JSON.stringify(normA) === JSON.stringify(normB);
}

/**
 * Extract final runtime state from a trace plan.
 */
export function extractFinalState(plan) {
  const last = plan.steps.at(-1);
  return {
    variables: last?.variables ?? {},
    output: last?.output ?? [],
    stepCount: plan.steps.length,
  };
}

export default {
  buildTracePlan,
  compileToIR,
  compareIR,
  extractFinalState,
  parseToIR,
  executeIR,
  TRACING_LANGUAGES,
  SAMPLE_CODE,
  IR_OPCODES,
  clearIRCache,
  getCacheStats,
};
