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

export default {
  fibonacciMemo,
  knapsackDP,
  coinChangeDP,
  lisDP,
};
