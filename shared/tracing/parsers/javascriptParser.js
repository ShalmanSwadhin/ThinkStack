/**
 * JavaScript → IR parser
 */

import { createProgram } from '../ir/program.js';
import { parseLines } from './common.js';
import { parseStatementBlock } from './blockParser.js';

const SKIP = [/^(import|export|class)\b/];

export function parseJavaScript(source) {
  const lines = parseLines(source);
  const instructions = [];
  parseStatementBlock(lines, 0, lines.length - 1, instructions, 'javascript', {
    blockStyle: 'brace',
    skipPatterns: SKIP,
  });
  return createProgram('javascript', source, instructions);
}

export default parseJavaScript;
