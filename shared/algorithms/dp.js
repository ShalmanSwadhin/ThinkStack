import { initStats, pushArrayStep, cloneStats } from './core.js';

const finish = (steps, stats, arr, description = 'Complete.') => {
  pushArrayStep(steps, stats, description, arr, [], Array.from({ length: arr.length }, (_, i) => i));
};

/** Fibonacci with memoization table visualization */
export const fibonacciMemo = (input) => {
  const n = input[0] ?? 6;
  const memo = new Array(n + 1).fill(-1);
  const steps = [];
  const stats = initStats();

  const fib = (k) => {
    if (k <= 1) {
      memo[k] = k;
      pushArrayStep(steps, stats, `Base case fib(${k}) = ${k}.`, memo.slice(0, n + 1), [k]);
      return k;
    }
    if (memo[k] !== -1) {
      pushArrayStep(steps, stats, `Memo hit fib(${k}) = ${memo[k]}.`, memo.slice(0, n + 1), [k]);
      return memo[k];
    }
    pushArrayStep(steps, stats, `Compute fib(${k}) from subproblems.`, memo.slice(0, n + 1), [k]);
    memo[k] = fib(k - 1) + fib(k - 2);
    pushArrayStep(steps, stats, `fib(${k}) = ${memo[k]}.`, memo.slice(0, n + 1), [k]);
    return memo[k];
  };

  pushArrayStep(steps, stats, `Compute fib(${n}) with memoization.`, memo.slice(0, n + 1));
  const result = fib(n);
  finish(steps, stats, memo.slice(0, n + 1), `fib(${n}) = ${result}.`);
  return steps;
};

/** 0/1 Knapsack tabulation (small demo) */
export const knapsackDP = (input) => {
  const weights = input.length >= 2 ? input.slice(0, Math.floor(input.length / 2)) : [1, 2, 3];
  const values = input.length >= 2 ? input.slice(Math.floor(input.length / 2)) : [6, 10, 12];
  const capacity = 5;
  const n = weights.length;
  const dp = Array.from({ length: n + 1 }, () => new Array(capacity + 1).fill(0));
  const flat = [];
  const steps = [];
  const stats = initStats();

  pushArrayStep(steps, stats, `Knapsack DP table ${n + 1}×${capacity + 1}.`, flat);

  for (let i = 1; i <= n; i++) {
    for (let w = 0; w <= capacity; w++) {
      if (weights[i - 1] <= w) {
        dp[i][w] = Math.max(dp[i - 1][w], dp[i - 1][w - weights[i - 1]] + values[i - 1]);
      } else {
        dp[i][w] = dp[i - 1][w];
      }
      flat.length = 0;
      flat.push(...dp[i]);
      pushArrayStep(steps, stats, `dp[${i}][${w}] = ${dp[i][w]}.`, flat, [w]);
    }
  }

  finish(steps, stats, dp[n], `Max value = ${dp[n][capacity]}.`);
  return steps;
};

/** Coin change minimum coins tabulation */
export const coinChangeDP = (input) => {
  const coins = input.length ? input : [1, 2, 5];
  const amount = 11;
  const dp = new Array(amount + 1).fill(Infinity);
  dp[0] = 0;
  const steps = [];
  const stats = initStats();

  pushArrayStep(steps, stats, `Coin change for amount ${amount}.`, dp);

  for (let a = 1; a <= amount; a++) {
    for (const coin of coins) {
      if (coin <= a) {
        dp[a] = Math.min(dp[a], dp[a - coin] + 1);
      }
    }
    pushArrayStep(steps, stats, `dp[${a}] = ${dp[a] === Infinity ? 'INF' : dp[a]}.`, [...dp], [a]);
  }

  finish(steps, stats, dp, `Minimum coins for ${amount}: ${dp[amount]}.`);
  return steps;
};

/** LIS length DP */
export const lisDP = (input) => {
  const arr = [...(input.length ? input : [10, 9, 2, 5, 3, 7, 101, 18])];
  const dp = new Array(arr.length).fill(1);
  const steps = [];
  const stats = initStats();

  pushArrayStep(steps, stats, 'Initialize LIS lengths to 1.', dp);

  for (let i = 1; i < arr.length; i++) {
    for (let j = 0; j < i; j++) {
      if (arr[j] < arr[i]) {
        dp[i] = Math.max(dp[i], dp[j] + 1);
      }
    }
    pushArrayStep(steps, stats, `LIS ending at index ${i} (value ${arr[i]}) = ${dp[i]}.`, [...dp], [i]);
  }

  finish(steps, stats, dp, `LIS length = ${Math.max(...dp)}.`);
  return steps;
};

/** Bitmask DP — track achievable subset sums as bits of an integer (dp |= dp << num) to find the minimum partition difference */
export const bitmaskDP = (input) => {
  const arr = input.length ? input : [1, 6, 11, 5];
  const total = arr.reduce((a, b) => a + b, 0);
  const steps = [];
  const stats = initStats();
  let dpMask = 1n; // bit 0 (sum 0) is always achievable

  const maskToArray = (mask) => {
    const bits = [];
    for (let i = 0; i <= total; i += 1) {
      bits.push((mask & (1n << BigInt(i))) !== 0n ? 1 : 0);
    }
    return bits;
  };

  pushArrayStep(steps, stats, `Bitmask DP: track achievable subset sums of [${arr.join(', ')}] as bits (target total = ${total}).`, maskToArray(dpMask));

  arr.forEach((num) => {
    const before = dpMask;
    dpMask |= dpMask << BigInt(num);
    stats.swaps += 1;
    pushArrayStep(steps, stats, `dp |= dp << ${num}  (newly achievable sums include +${num} to every previous achievable sum).`, maskToArray(dpMask), []);
    void before;
  });

  let best = 0;
  for (let s = Math.floor(total / 2); s >= 0; s -= 1) {
    stats.comparisons += 1;
    if ((dpMask & (1n << BigInt(s))) !== 0n) {
      best = s;
      break;
    }
  }
  const difference = total - 2 * best;

  finish(steps, stats, maskToArray(dpMask), `Best achievable half-sum = ${best}. Minimum partition difference = ${difference}.`);
  return steps;
};

/** Real 2D edit-distance DP (Levenshtein), flattened row-by-row like the Knapsack demo above.
 *  Two short "words" are derived deterministically from the numeric input (value % 26 -> letter). */
export const editDistanceDP = (input) => {
  const source = input.length ? input : [1, 2, 3, 4, 5, 6];
  const mid = Math.max(1, Math.floor(source.length / 2));
  const toWord = (nums) => nums.map((v) => String.fromCharCode(97 + (Math.abs(Math.trunc(v)) % 26)));
  const word1 = toWord(source.slice(0, mid));
  const word2 = toWord(source.slice(mid).length ? source.slice(mid) : source.slice(0, mid));
  const m = word1.length;
  const n = word2.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  const flat = [];
  const steps = [];
  const stats = initStats();

  for (let i = 0; i <= m; i += 1) dp[i][0] = i;
  for (let j = 0; j <= n; j += 1) dp[0][j] = j;

  pushArrayStep(steps, stats, `Edit distance DP table for "${word1.join('')}" -> "${word2.join('')}" (${m + 1}x${n + 1}).`, flat);

  for (let i = 1; i <= m; i += 1) {
    for (let j = 1; j <= n; j += 1) {
      stats.comparisons += 1;
      if (word1[i - 1] === word2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
        flat.length = 0;
        flat.push(...dp[i]);
        pushArrayStep(steps, stats, `'${word1[i - 1]}' == '${word2[j - 1]}': dp[${i}][${j}] = dp[${i - 1}][${j - 1}] = ${dp[i][j]} (no edit).`, flat, [j]);
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
        stats.swaps += 1;
        flat.length = 0;
        flat.push(...dp[i]);
        pushArrayStep(steps, stats, `'${word1[i - 1]}' != '${word2[j - 1]}': dp[${i}][${j}] = 1 + min(delete, insert, replace) = ${dp[i][j]}.`, flat, [j]);
      }
    }
  }

  finish(steps, stats, dp[m], `Edit distance("${word1.join('')}", "${word2.join('')}") = ${dp[m][n]}.`);
  return steps;
};

export default {
  fibonacciMemo,
  knapsackDP,
  coinChangeDP,
  lisDP,
  bitmaskDP,
  editDistanceDP,
};
