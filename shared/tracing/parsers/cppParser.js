/**
 * C++ → IR parser (extends C parser with cout support)
 */

import { parseC } from './cParser.js';

export function parseCpp(source) {
  return parseC(source, 'cpp');
}

export default parseCpp;
