/**
 * C / C++ → IR parser
 */

import { createProgram } from '../ir/program.js';
import { parseLines } from './common.js';
import { parseStatementBlock } from './blockParser.js';

const SKIP = [/^(#include|#define|using|namespace|\{)\b/];

export function parseC(source, language = 'c') {
  const lines = parseLines(source);
  const instructions = [];
  parseStatementBlock(lines, 0, lines.length - 1, instructions, language, {
    blockStyle: 'brace',
    skipPatterns: SKIP,
  });
  return createProgram(language, source, instructions);
}

export default parseC;
