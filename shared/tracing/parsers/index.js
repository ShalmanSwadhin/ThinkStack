/**
 * Language parser router — Source → AST-like IR Program
 */

import { hashSource } from '../ir/program.js';
import { getCachedIR, setCachedIR } from '../cache/irCache.js';
import parsePython from './pythonParser.js';
import parseJavaScript from './javascriptParser.js';
import parseJava from './javaParser.js';
import parseC from './cParser.js';
import parseCpp from './cppParser.js';

const PARSERS = {
  python: parsePython,
  javascript: parseJavaScript,
  java: parseJava,
  c: parseC,
  cpp: parseCpp,
};

export function parseToIR(source, language = 'python') {
  const sourceHash = hashSource(source, language);
  const cached = getCachedIR(sourceHash);
  if (cached) return cached;

  const parser = PARSERS[language];
  if (!parser) {
    throw new Error(`Unsupported tracing language: ${language}`);
  }

  const program = parser(source);
  setCachedIR(sourceHash, program);
  return program;
}

export function getSupportedLanguages() {
  return Object.keys(PARSERS);
}

export default { parseToIR, getSupportedLanguages, PARSERS };
