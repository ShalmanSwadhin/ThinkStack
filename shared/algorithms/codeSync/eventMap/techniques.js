import { RETURN_VALUE, entryRule, rule } from './helpers.js';

export const TECHNIQUES = {
  'two-pointer': [
    // Some listings (C) don't show the pointer setup, so fall back to the function entry.
    rule(/initialize two pointers/i, [/\bleft\b[^=]*=\s*0\b/, /\btwo_?pointer\s*\(/i, '@first'], 'first'),
    rule(/compare arr\[/i, /\b(?:total|sum)\s*=\s*(?:arr|array)\[\s*\*?left\s*\]/),
    rule(/move pointers inward/i, /\b(?:left|right)\b[^=]*(?:\+=|-=|\+\+|--)/, 'first'),
    rule(/scan complete/i, [RETURN_VALUE, '@last'], 'last'),
  ],

  'sliding-window': [
    entryRule(/array with window size/i, 'sliding_?window'),
    rule(/window \[/i, /\bresults\b\s*(?:\.\s*(?:append|add|push|push_back)\s*\(|\[.*\]\s*=)/, 'first'),
    rule(/pass complete/i, [RETURN_VALUE, '@last'], 'last'),
  ],

  'prefix-sum': [
    entryRule(/build prefix sum array/i, 'build_?prefix_?sum'),
    rule(/prefix\[/i, /\bprefix\s*\[\s*i\s*\]\s*=\s*running/),
    rule(/prefix sum complete/i, [RETURN_VALUE, '@last'], 'last'),
  ],

  'greedy-activity': [
    entryRule(/activities represented by finish time/i, 'activity_?selection'),
    rule(/sort activities/i, /\bsort\b|\bqsort\b|\.sort\s*\(/i, 'first'),
    // The first activity is chosen before the loop; the in-loop selection is the last match.
    rule(/select activity/i, /\bselected\b.*(?:\.\s*(?:append|add|push|push_back)\s*\(|\[.*\]\s*=)/, 'last'),
    rule(/skip activity/i, /\bstart\s*>=\s*last_?finish/i),
    rule(/selected \d+ non-overlapping/i, [RETURN_VALUE, '@last'], 'last'),
  ],

  'backtracking-subsets': [
    entryRule(/generate all subsets/i, 'subsets'),
    rule(/include arr\[/i, /\bcurrent\b.*(?:append|add|push|push_back)\s*\(\s*(?:arr|array)\[\s*index\s*\]|\bcurrent\[\s*csize\s*\]\s*=\s*arr\[\s*index\s*\]/, 'first'),
    rule(/complete subset/i, [/\bresult\b.*(?:append|add|push|push_back)\s*\(/, /memcpy\s*\(\s*result/], 'first'),
    // Un-choosing the element; C passes a size instead of popping, so its exclude branch
    // is the second recursive call.
    rule(/exclude arr\[/i, [/\bcurrent\s*\.\s*(?:pop|pop_back|removeLast|remove)\s*\(/, /\bsubsets\s*\(/], 'last'),
    rule(/generated \d+ subsets/i, [RETURN_VALUE, '@last'], 'last'),
  ],

  'kmp-search': [
    entryRule(/kmp search for pattern/i, 'kmp_?search'),
    rule(/built failure function/i, /\blps\b.*build_?failure_?function/i),
    rule(/compare text\[/i, /\btext(?:\[\s*i\s*\]|\.charAt\s*\(\s*i\s*\))\s*={2,3}\s*pattern/),
    rule(/full match found/i, /\bj\s*={2,3}\s*(?:len\s*\(\s*pattern\s*\)|length\s*\(\s*pattern\s*\)|m\b|pattern\.length(?:\s*\(\s*\))?|\(int\)\s*pattern\.size\s*\(\s*\))/),
    rule(/kmp complete/i, [RETURN_VALUE, '@last'], 'last'),
  ],

  'rabin-karp': [
    entryRule(/rabin-karp search for pattern/i, 'rabin_?karp'),
    rule(/window \[.*\] hash/i, /\bwindow_?hash\s*={2,3}\s*pattern_?hash/i),
    rule(/hash match confirmed/i, /\bmatches\b.*(?:append|add|push|push_back)\s*\(|\bmatches\s*\[.*\]\s*=\s*i|\breport match/i, 'first'),
    rule(/rabin-karp complete/i, [RETURN_VALUE, '@last'], 'last'),
  ],
};
