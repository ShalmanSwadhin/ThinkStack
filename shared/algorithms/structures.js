import { initStats, pushArrayStep, cloneStats } from './core.js';

const finish = (steps, stats, arr, description = 'Complete.') => {
  pushArrayStep(steps, stats, description, arr, [], Array.from({ length: arr.length }, (_, i) => i));
};

/** Stack push/pop visualization using array representation */
export const stackOperations = (input) => {
  const ops = input.length ? input : [1, 2, 3];
  const stack = [];
  const steps = [];
  const stats = initStats();

  pushArrayStep(steps, stats, 'Initialize empty stack.', stack);

  for (const value of ops) {
    stack.push(value);
    pushArrayStep(steps, stats, `Push ${value} onto stack.`, [...stack], [stack.length - 1]);
  }

  while (stack.length > 0) {
    const top = stack.length - 1;
    pushArrayStep(steps, stats, `Peek top element: ${stack[top]}.`, [...stack], [top]);
    stack.pop();
    pushArrayStep(steps, stats, 'Pop from stack.', [...stack], stack.length ? [stack.length - 1] : []);
  }

  finish(steps, stats, stack, 'Stack operations complete.');
  return steps;
};

/** Queue enqueue/dequeue visualization */
export const queueOperations = (input) => {
  const values = input.length ? input : [10, 20, 30];
  const queue = [];
  const steps = [];
  const stats = initStats();

  pushArrayStep(steps, stats, 'Initialize empty queue.', queue);

  for (const value of values) {
    queue.push(value);
    pushArrayStep(steps, stats, `Enqueue ${value}.`, [...queue], [queue.length - 1]);
  }

  while (queue.length > 0) {
    pushArrayStep(steps, stats, `Front element is ${queue[0]}.`, [...queue], [0]);
    queue.shift();
    pushArrayStep(steps, stats, 'Dequeue front element.', [...queue], queue.length ? [0] : []);
  }

  finish(steps, stats, queue, 'Queue operations complete.');
  return steps;
};

/** Linked list insert visualization (values as array) */
export const linkedListInsert = (input) => {
  const values = input.length ? input : [5, 10, 15];
  const list = [];
  const steps = [];
  const stats = initStats();

  pushArrayStep(steps, stats, 'Start with empty linked list (shown as array).', list);

  for (const value of values) {
    list.push(value);
    pushArrayStep(steps, stats, `Insert ${value} at tail.`, [...list], [list.length - 1]);
  }

  finish(steps, stats, list, 'Linked list build complete.');
  return steps;
};

/** Two-pointer scan on sorted array */
export const twoPointerScan = (input) => {
  const arr = [...(input.length ? input : [1, 2, 3, 4, 5, 6])];
  const steps = [];
  const stats = initStats();
  let left = 0;
  let right = arr.length - 1;

  pushArrayStep(steps, stats, 'Initialize two pointers at both ends.', arr, [left, right]);

  while (left < right) {
    pushArrayStep(steps, stats, `Compare arr[${left}]=${arr[left]} and arr[${right}]=${arr[right]}.`, arr, [left, right]);
    left += 1;
    right -= 1;
    if (left <= right) {
      pushArrayStep(steps, stats, 'Move pointers inward.', arr, left <= right ? [left, right] : [left]);
    }
  }

  finish(steps, stats, arr, 'Two-pointer scan complete.');
  return steps;
};

/** Fixed-size sliding window maximum sketch */
export const slidingWindow = (input) => {
  const arr = [...(input.length ? input : [1, 3, -1, -3, 5, 3, 6, 7])];
  const k = 3;
  const steps = [];
  const stats = initStats();

  pushArrayStep(steps, stats, `Array with window size k=${k}.`, arr);

  for (let i = 0; i <= arr.length - k; i++) {
    const window = arr.slice(i, i + k);
    const max = Math.max(...window);
    const highlights = Array.from({ length: k }, (_, j) => i + j);
    pushArrayStep(steps, stats, `Window [${i}..${i + k - 1}] max = ${max}.`, arr, highlights);
  }

  finish(steps, stats, arr, 'Sliding window pass complete.');
  return steps;
};

/** Prefix sum build */
export const prefixSum = (input) => {
  const arr = [...(input.length ? input : [2, 1, 3, 6, 4])];
  const prefix = [];
  const steps = [];
  const stats = initStats();

  pushArrayStep(steps, stats, 'Build prefix sum array.', arr);

  let running = 0;
  for (let i = 0; i < arr.length; i++) {
    running += arr[i];
    prefix.push(running);
    pushArrayStep(steps, stats, `prefix[${i}] = ${running}.`, prefix, [i]);
  }

  finish(steps, stats, prefix, 'Prefix sum complete.');
  return steps;
};

/** Hash table with linear-probing collision resolution */
export const hashLinearProbing = (input) => {
  const values = input.length ? input : [3, 7, 2, 9, 5];
  const size = Math.max(7, values.length * 2);
  const table = new Array(size).fill(null);
  const steps = [];
  const stats = initStats();

  pushArrayStep(steps, stats, `Create hash table of size ${size} (table[i]=empty shown as 0).`, table.map((v) => v ?? 0));

  values.forEach((value) => {
    let idx = value % size;
    const start = idx;
    let probes = 0;
    stats.comparisons += 1;
    pushArrayStep(steps, stats, `Hash ${value}: index = ${value} % ${size} = ${idx}.`, table.map((v) => v ?? 0), [idx]);

    while (table[idx] !== null) {
      probes += 1;
      idx = (idx + 1) % size;
      stats.comparisons += 1;
      pushArrayStep(steps, stats, `Collision at index ${(idx - 1 + size) % size} — linear probe to index ${idx}.`, table.map((v) => v ?? 0), [idx]);
      if (probes > size) break;
    }

    table[idx] = value;
    pushArrayStep(steps, stats, `Place ${value} at index ${idx}${idx !== start ? ` (probed from ${start})` : ''}.`, table.map((v) => v ?? 0), [idx]);
  });

  finish(steps, stats, table.map((v) => v ?? 0), 'Hash table insertion complete.');
  return steps;
};

/** Monotonic (decreasing) stack — computes next greater element for each index */
export const monotonicStack = (input) => {
  const arr = input.length ? input : [2, 1, 2, 4, 3];
  const result = new Array(arr.length).fill(-1);
  const stack = [];
  const steps = [];
  const stats = initStats();

  pushArrayStep(steps, stats, 'Initialize empty monotonic (decreasing) stack.', arr);

  for (let i = 0; i < arr.length; i += 1) {
    stats.comparisons += 1;
    pushArrayStep(steps, stats, `Consider arr[${i}]=${arr[i]}.`, arr, [i]);

    while (stack.length && arr[stack[stack.length - 1]] < arr[i]) {
      const top = stack.pop();
      result[top] = arr[i];
      stats.swaps += 1;
      pushArrayStep(steps, stats, `arr[${i}]=${arr[i]} > arr[${top}]=${arr[top]}: pop index ${top}, next greater = ${arr[i]}.`, arr, [top, i]);
    }

    stack.push(i);
    pushArrayStep(steps, stats, `Push index ${i} onto stack.`, arr, [...stack]);
  }

  finish(steps, stats, arr, `Next greater elements: [${result.join(', ')}].`);
  return steps;
};

/** Sliding window maximum using a deque of indices — O(n), not the naive O(n*k) scan */
export const dequeSlidingWindowMax = (input) => {
  const arr = input.length ? input : [1, 3, -1, -3, 5, 3, 6, 7];
  const k = Math.min(3, arr.length);
  const deque = [];
  const maxes = [];
  const steps = [];
  const stats = initStats();

  pushArrayStep(steps, stats, `Sliding window maximum with window size k=${k} using a deque of indices.`, arr);

  for (let i = 0; i < arr.length; i += 1) {
    while (deque.length && deque[0] <= i - k) {
      deque.shift();
    }
    stats.comparisons += 1;
    while (deque.length && arr[deque[deque.length - 1]] <= arr[i]) {
      deque.pop();
    }
    deque.push(i);
    pushArrayStep(steps, stats, `Process index ${i}: deque = [${deque.join(', ')}] (front is current max index).`, arr, [...deque], i >= k - 1 ? [deque[0]] : []);

    if (i >= k - 1) {
      maxes.push(arr[deque[0]]);
      pushArrayStep(steps, stats, `Window ending at ${i}: maximum = ${arr[deque[0]]}.`, arr, [deque[0]], Array.from({ length: k }, (_, j) => i - k + 1 + j));
    }
  }

  finish(steps, stats, arr, `Window maximums: [${maxes.join(', ')}].`);
  return steps;
};

/** Fenwick Tree (Binary Indexed Tree) — build via point updates, then a prefix-sum query */
export const fenwickTree = (input) => {
  const values = input.length ? input : [3, 2, -1, 6, 5, 4, -3, 3];
  const n = values.length;
  const tree = new Array(n + 1).fill(0);
  const steps = [];
  const stats = initStats();

  const update = (i, delta) => {
    for (let x = i; x <= n; x += x & -x) {
      tree[x] += delta;
    }
  };

  pushArrayStep(steps, stats, `Build Fenwick tree (BIT) of size ${n} using point updates.`, tree.slice(1));

  values.forEach((value, idx) => {
    update(idx + 1, value);
    stats.swaps += 1;
    pushArrayStep(steps, stats, `Update(index ${idx + 1}, +${value}) — propagate via i += i & -i.`, tree.slice(1), [idx]);
  });

  const query = (i) => {
    let sum = 0;
    for (let x = i; x > 0; x -= x & -x) sum += tree[x];
    return sum;
  };

  const q = Math.min(4, n);
  const prefixSumResult = query(q);
  stats.comparisons += 1;
  pushArrayStep(steps, stats, `Query(prefix sum of first ${q} elements) = ${prefixSumResult} — accumulate via i -= i & -i.`, tree.slice(1), Array.from({ length: q }, (_, i) => i));

  finish(steps, stats, tree.slice(1), `Fenwick tree ready. Prefix sum(1..${q}) = ${prefixSumResult}.`);
  return steps;
};

/** Greedy activity selection — sort by finish time, greedily pick compatible activities */
export const greedyActivitySelection = (input) => {
  const starts = input.length ? input : [1, 3, 0, 5, 8, 5];
  const activities = starts.map((start, i) => ({ start, finish: start + 1 + (i % 3) }));
  const steps = [];
  const stats = initStats();

  const asArr = () => activities.map((a) => a.finish);
  pushArrayStep(steps, stats, 'Activities represented by finish time (sorted next).', asArr());

  activities.sort((a, b) => a.finish - b.finish);
  pushArrayStep(steps, stats, 'Sort activities by finish time (greedy choice).', asArr());

  const selected = [];
  let lastFinish = -Infinity;
  activities.forEach((activity, idx) => {
    stats.comparisons += 1;
    if (activity.start >= lastFinish) {
      selected.push(idx);
      lastFinish = activity.finish;
      pushArrayStep(steps, stats, `Select activity ${idx} (start ${activity.start}, finish ${activity.finish}) — compatible.`, asArr(), [idx]);
    } else {
      pushArrayStep(steps, stats, `Skip activity ${idx} (start ${activity.start} < last finish ${lastFinish}) — overlaps.`, asArr(), [idx]);
    }
  });

  finish(steps, stats, asArr(), `Selected ${selected.length} non-overlapping activities.`);
  return steps;
};

/** Backtracking — generate all subsets of the input via include/exclude recursion */
export const backtrackingSubsets = (input) => {
  const arr = input.length ? input.slice(0, 4) : [1, 2, 3];
  const steps = [];
  const stats = initStats();
  const subsets = [];
  const current = [];

  pushArrayStep(steps, stats, `Generate all subsets of [${arr.join(', ')}] via backtracking.`, arr);

  const backtrack = (index) => {
    if (index === arr.length) {
      subsets.push([...current]);
      pushArrayStep(steps, stats, `Complete subset: [${current.join(', ')}]. Total so far: ${subsets.length}.`, arr, current.map((v) => arr.indexOf(v)));
      return;
    }

    current.push(arr[index]);
    stats.comparisons += 1;
    pushArrayStep(steps, stats, `Include arr[${index}]=${arr[index]}.`, arr, [index]);
    backtrack(index + 1);
    current.pop();

    pushArrayStep(steps, stats, `Exclude arr[${index}]=${arr[index]} (backtrack).`, arr, [index]);
    backtrack(index + 1);
  };

  backtrack(0);
  finish(steps, stats, arr, `Generated ${subsets.length} subsets.`);
  return steps;
};

/** Knuth-Morris-Pratt pattern matching using the failure function */
export const kmpSearch = (input) => {
  const text = input.length ? input : [2, 3, 2, 3, 2, 3, 5, 2, 3, 5];
  const pattern = text.slice(0, Math.min(3, text.length));
  const steps = [];
  const stats = initStats();

  pushArrayStep(steps, stats, `KMP search for pattern [${pattern.join(', ')}] in text.`, text);

  const lps = new Array(pattern.length).fill(0);
  let len = 0;
  let i = 1;
  while (i < pattern.length) {
    stats.comparisons += 1;
    if (pattern[i] === pattern[len]) {
      len += 1;
      lps[i] = len;
      i += 1;
    } else if (len !== 0) {
      len = lps[len - 1];
    } else {
      lps[i] = 0;
      i += 1;
    }
  }
  pushArrayStep(steps, stats, `Built failure function (LPS array): [${lps.join(', ')}].`, text, [], []);

  const matches = [];
  let ti = 0;
  let pi = 0;
  while (ti < text.length) {
    stats.comparisons += 1;
    pushArrayStep(steps, stats, `Compare text[${ti}]=${text[ti]} with pattern[${pi}]=${pattern[pi]}.`, text, [ti]);
    if (text[ti] === pattern[pi]) {
      ti += 1;
      pi += 1;
      if (pi === pattern.length) {
        matches.push(ti - pi);
        pushArrayStep(steps, stats, `Full match found at index ${ti - pi}.`, text, Array.from({ length: pattern.length }, (_, k) => ti - pattern.length + k));
        pi = lps[pi - 1];
      }
    } else if (pi !== 0) {
      pi = lps[pi - 1];
    } else {
      ti += 1;
    }
  }

  finish(steps, stats, text, `KMP complete. Matches at: [${matches.join(', ')}].`);
  return steps;
};

/** Rabin-Karp pattern matching using a rolling hash */
export const rabinKarp = (input) => {
  const text = input.length ? input : [2, 3, 5, 2, 3, 5, 7, 2, 3, 5];
  const pattern = text.slice(0, Math.min(3, text.length));
  const steps = [];
  const stats = initStats();
  const base = 101;

  pushArrayStep(steps, stats, `Rabin-Karp search for pattern [${pattern.join(', ')}] using a rolling hash.`, text);

  const patternHash = pattern.reduce((acc, v) => acc * base + v, 0);
  let windowHash = text.slice(0, pattern.length).reduce((acc, v) => acc * base + v, 0);
  let power = Math.pow(base, pattern.length - 1);
  const matches = [];

  for (let i = 0; i <= text.length - pattern.length; i += 1) {
    stats.comparisons += 1;
    pushArrayStep(steps, stats, `Window [${i}..${i + pattern.length - 1}] hash = ${windowHash} (pattern hash = ${patternHash}).`, text, Array.from({ length: pattern.length }, (_, k) => i + k));

    if (windowHash === patternHash) {
      const slice = text.slice(i, i + pattern.length);
      const isMatch = slice.every((v, k) => v === pattern[k]);
      if (isMatch) {
        matches.push(i);
        pushArrayStep(steps, stats, `Hash match confirmed by direct comparison at index ${i}.`, text, Array.from({ length: pattern.length }, (_, k) => i + k));
      }
    }

    if (i + pattern.length < text.length) {
      windowHash = (windowHash - text[i] * power) * base + text[i + pattern.length];
    }
  }

  finish(steps, stats, text, `Rabin-Karp complete. Matches at: [${matches.join(', ')}].`);
  return steps;
};

export default {
  stackOperations,
  queueOperations,
  linkedListInsert,
  twoPointerScan,
  slidingWindow,
  prefixSum,
  hashLinearProbing,
  monotonicStack,
  dequeSlidingWindowMax,
  fenwickTree,
  greedyActivitySelection,
  backtrackingSubsets,
  kmpSearch,
  rabinKarp,
};
