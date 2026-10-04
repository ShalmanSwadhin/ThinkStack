import { RETURN_VALUE, entryRule, rule } from './helpers.js';

// `dp[i][j] = …` with the loop variables written exactly as the listings use them.
const cell = (a, b) => new RegExp(`\\bdp\\s*\\[\\s*${a}\\s*\\]\\s*\\[\\s*${b}\\s*\\]\\s*=`);

export const DP = {
  'fibonacci-dp': [
    // Order matters: "Memo hit fib(3) = 2." also contains "fib(3) =".
    rule(/memo hit/i, /\breturn\s+memo\s*\[\s*n\s*\]/, 'first'),
    rule(/base case/i, /\breturn\s+n\b/, 'first'),
    entryRule(/with memoization/i, 'fib'),
    rule(/from subproblems/i, /\bmemo\s*\[\s*n\s*\]\s*=\s*fib/),
    rule(/fib\(\d+\) =/i, /\breturn\s+memo\s*\[\s*n\s*\]/, 'last'),
  ],

  'knapsack-dp': [
    entryRule(/knapsack dp table/i, 'knapsack'),
    // The "take the item" update; the "skip" branch is its else-clause.
    rule(/dp\[/i, /\bdp\s*\[\s*i\s*\]\s*\[\s*w\s*\]\s*=/, 'first'),
    rule(/max value/i, /\breturn\s+dp\b/, 'last'),
  ],

  'coin-change-dp': [
    entryRule(/coin change for amount/i, 'coin_?change'),
    rule(/dp\[/i, /\bdp\s*\[\s*a\s*\]\s*=/, 'first'),
    rule(/minimum coins for/i, /\breturn\s+dp\b/, 'last'),
  ],

  'lis-dp': [
    rule(
      /initialize lis lengths/i,
      /\[\s*1\s*\]\s*\*|array of 1s|\bdp\s*\[\s*i\s*\]\s*=\s*1\b|fill\s*\(\s*(?:dp\s*,\s*)?1\s*\)|\bdp\s*\(.*,\s*1\s*\)/,
      'first'
    ),
    rule(/lis ending at index/i, /\bdp\s*\[\s*i\s*\]\s*=\s*(?:(?:Math\.|std::)?max\s*\(|dp\s*\[\s*j\s*\])/i, 'first'),
    rule(/lis length/i, [RETURN_VALUE, '@last'], 'last'),
  ],

  'bitmask-dp': [
    rule(/bitmask dp: track achievable subset sums/i, /\bdp\s*=\s*(?:1\b|1n\b|(?:java\.math\.)?BigInteger\.ONE)/),
    rule(/dp \|= dp <</i, /\bdp\b.*(?:<<|shiftLeft)/, 'first'),
    rule(/best achievable half-sum/i, /\breturn\s+dp\b/, 'last'),
  ],

  'edit-distance-dp': [
    entryRule(/edit distance dp table/i, 'edit_?distance'),
    // Characters differ: 1 + min(delete, insert, replace).
    rule(/'\s*!=\s*'/, /\bdp\s*\[\s*i\s*\]\s*\[\s*j\s*\]\s*=\s*1\s*\+/, 'first'),
    // Characters match: carry the diagonal value over unchanged.
    rule(/'\s*==\s*'/, /\bdp\s*\[\s*i\s*\]\s*\[\s*j\s*\]\s*=\s*dp\s*\[\s*i\s*-\s*1\s*\]\s*\[\s*j\s*-\s*1\s*\]/, 'first'),
    rule(/edit distance\(/i, /\breturn\s+dp\b/, 'last'),
  ],
};

export { cell };
