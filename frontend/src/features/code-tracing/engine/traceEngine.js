/**
 * Manual Tracing Engine — thin wrapper over shared/tracing IR architecture.
 * Maintains backward compatibility with existing imports and API.
 */
export {
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
} from 'shared/tracing/index.js';

import tracing from 'shared/tracing/index.js';
export default tracing;
