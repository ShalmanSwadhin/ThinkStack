import { ARR, RETURN_NOT_FOUND, entryRule, rule } from './helpers.js';

// Order matters: the first rule whose `test` matches the step description wins.
export const SEARCHING = {
  'linear-search': [
    entryRule(/search for/i, 'linear_?search'),
    rule(/check index/i, /\[i\]\s*={2,3}\s*target/),
    rule(/not found/i, RETURN_NOT_FOUND, 'last'),
    rule(/found at index/i, /\breturn\s+i\b/),
  ],

  'binary-search': [
    rule(/binary search for/i, /\blow\b[^=]*=\s*0\b/),
    rule(/inspect middle/i, /\bmid\s*=/),
    rule(/not found/i, RETURN_NOT_FOUND, 'last'),
    rule(/found at index/i, /\breturn\s+mid\b/),
    rule(/right half/i, /\blow\s*=\s*mid\s*\+\s*1/),
    rule(/left half/i, /\bhigh\s*=\s*mid\s*-\s*1/),
  ],

  'jump-search': [
    entryRule(/jump search for/i, 'jump_?search'),
    rule(/jump to index/i, new RegExp(`${ARR}\\[[^\\]]*step[^\\]]*\\]\\s*<\\s*target`)),
    rule(/linear scan index/i, new RegExp(`${ARR}\\[i\\]\\s*={2,3}\\s*target`)),
    rule(/not found/i, RETURN_NOT_FOUND, 'last'),
    rule(/found at index/i, /\breturn\s+i\b/),
  ],

  'interpolation-search': [
    entryRule(/interpolation search for/i, 'interpolation_?search'),
    rule(/probe index|single element/i, /\b(?:pos|probe)\s*=/),
    rule(/not found/i, RETURN_NOT_FOUND, 'last'),
    rule(/found at index/i, /\breturn\s+(?:pos|probe)\b/),
  ],

  'ternary-search': [
    entryRule(/ternary search for/i, 'ternary_?search'),
    rule(/check first third/i, /\[mid1\]\s*={2,3}\s*target/),
    rule(/check second third/i, /\[mid2\]\s*={2,3}\s*target/),
    rule(/not found/i, RETURN_NOT_FOUND, 'last'),
    rule(/found at index/i, /\breturn\s+mid[12]\b/, 'first'),
    rule(/first third/i, /\bhigh\b[^=]*=\s*mid1\s*-\s*1/),
    rule(/third third/i, /\blow\b[^=]*=\s*mid2\s*\+\s*1/),
    rule(/middle third/i, /\blow\b[^=]*=\s*mid1\s*\+\s*1/),
  ],

  'exponential-search': [
    entryRule(/exponential search for/i, 'exponential_?search'),
    rule(/starting bound/i, new RegExp(`${ARR}\\[0\\]\\s*={2,3}\\s*target`)),
    rule(/double range/i, /\bbound\s*(\*=\s*2|=\s*bound\s*\*\s*2)/),
    rule(/binary search within range/i, /\blow\b[^=]*=\s*(?:Math\.floor\()?\s*bound\s*\/+\s*2/),
    rule(/inspect middle/i, /\bmid\s*=/),
    rule(/not found/i, RETURN_NOT_FOUND, 'last'),
    rule(/found at index/i, /\breturn\s+mid\b/),
    rule(/right half/i, /\blow\s*=\s*mid\s*\+\s*1/),
    rule(/left half/i, /\bhigh\s*=\s*mid\s*-\s*1/),
  ],
};
