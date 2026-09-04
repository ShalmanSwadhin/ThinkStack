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

export default {
  stackOperations,
  queueOperations,
  linkedListInsert,
  twoPointerScan,
  slidingWindow,
  prefixSum,
};
