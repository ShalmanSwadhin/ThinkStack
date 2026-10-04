/**
 * C / C++ → IR parser
 */

import { createProgram } from '../ir/program.js';
import { parseLines } from './common.js';
import { parseStatementBlock } from './blockParser.js';

// Each entry's `pattern` decides whether a line is a directive at all; its
// `directiveType`/`directiveSubtype` are what the parser stamps onto the resulting
// DIRECTIVE instruction (see parsers/common.js's `buildDirectiveInstruction`) —
// classification is decided HERE, at parse time, by which specific pattern
// matched, not re-derived later from source text.
const SKIP = [
  { pattern: /^#include\b/, directiveType: 'Preprocessor Directive', directiveSubtype: 'Include' },
  { pattern: /^#define\b/, directiveType: 'Preprocessor Directive', directiveSubtype: 'Define' },
  { pattern: /^#(if|ifdef|ifndef|else|elif|endif|pragma|undef)\b/, directiveType: 'Preprocessor Directive', directiveSubtype: 'Directive' },
  { pattern: /^using\b/, directiveType: 'Preprocessor Directive', directiveSubtype: 'Using' },
  { pattern: /^namespace\b/, directiveType: 'Preprocessor Directive', directiveSubtype: 'Namespace' },
  { pattern: /^(int|void)\s+main\s*\([^)]*\)\s*\{?$/, directiveType: 'Function Declaration', directiveSubtype: 'Main' },
];

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
