/**
 * Python → IR parser
 */

import { createProgram } from '../ir/program.js';
import { parseLines } from './common.js';
import { parseStatementBlock } from './blockParser.js';

export function parsePython(source) {
  const lines = parseLines(source);
  const instructions = [];
  parseStatementBlock(lines, 0, lines.length - 1, instructions, 'python', {
    blockStyle: 'indent',
  });
  return createProgram('python', source, instructions);
}

export default parsePython;
