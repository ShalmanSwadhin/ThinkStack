/**
 * Java → IR parser
 */

import { createProgram } from '../ir/program.js';
import { parseLines } from './common.js';
import { parseStatementBlock } from './blockParser.js';

const SKIP = [/^(public|private|protected|class|import|package|\{)\b/];

export function parseJava(source) {
  const lines = parseLines(source);
  const instructions = [];
  parseStatementBlock(lines, 0, lines.length - 1, instructions, 'java', {
    blockStyle: 'brace',
    skipPatterns: SKIP,
  });
  return createProgram('java', source, instructions);
}

export default parseJava;
