import { initStats, pushArrayStep, compare } from './core.js';

export const linearSearch = (input, target) => {
  const arr = [...input];
  const steps = [];
  const stats = initStats();
  pushArrayStep(steps, stats, `Search for target ${target} using linear search.`, arr);

  for (let i = 0; i < arr.length; i += 1) {
    compare(stats, arr[i], target);
    pushArrayStep(steps, stats, `Check index ${i}: value ${arr[i]}.`, arr, [i]);
    if (arr[i] === target) {
      pushArrayStep(steps, stats, `Target ${target} found at index ${i}.`, arr, [i]);
      return steps;
    }
  }

  pushArrayStep(steps, stats, `Target ${target} not found.`, arr);
  return steps;
};

export const binarySearch = (input, target) => {
  const arr = [...input].sort((a, b) => a - b);
  const steps = [];
  const stats = initStats();
  pushArrayStep(steps, stats, `Binary search for ${target} on sorted array.`, arr);

  let low = 0;
  let high = arr.length - 1;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    compare(stats, arr[mid], target);
    pushArrayStep(steps, stats, `Inspect middle index ${mid} (value ${arr[mid]}).`, arr, [mid], [low, high]);

    if (arr[mid] === target) {
      pushArrayStep(steps, stats, `Target ${target} found at index ${mid}.`, arr, [mid]);
      return steps;
    }

    if (arr[mid] < target) {
      low = mid + 1;
      pushArrayStep(steps, stats, `Target is in right half.`, arr, [], [low, high]);
    } else {
      high = mid - 1;
      pushArrayStep(steps, stats, `Target is in left half.`, arr, [], [low, high]);
    }
  }

  pushArrayStep(steps, stats, `Target ${target} not found.`, arr);
  return steps;
};

export const jumpSearch = (input, target) => {
  const arr = [...input].sort((a, b) => a - b);
  const steps = [];
  const stats = initStats();
  const jump = Math.floor(Math.sqrt(arr.length));
  pushArrayStep(steps, stats, `Jump search for ${target} with block size ${jump}.`, arr);

  let prev = 0;
  let step = Math.min(jump, arr.length) - 1;

  while (prev < arr.length) {
    const idx = Math.min(step, arr.length - 1);
    compare(stats, arr[idx], target);
    pushArrayStep(steps, stats, `Jump to index ${idx} (value ${arr[idx]}).`, arr, [idx], [prev, idx]);
    if (arr[idx] >= target) break;
    prev = step + 1;
    step += jump;
  }

  for (let i = prev; i <= Math.min(step, arr.length - 1); i += 1) {
    compare(stats, arr[i], target);
    pushArrayStep(steps, stats, `Linear scan index ${i}.`, arr, [i]);
    if (arr[i] === target) {
      pushArrayStep(steps, stats, `Target ${target} found at index ${i}.`, arr, [i]);
      return steps;
    }
  }

  pushArrayStep(steps, stats, `Target ${target} not found.`, arr);
  return steps;
};

export const interpolationSearch = (input, target) => {
  const arr = [...input].sort((a, b) => a - b);
  const steps = [];
  const stats = initStats();
  pushArrayStep(steps, stats, `Interpolation search for ${target}.`, arr);

  let low = 0;
  let high = arr.length - 1;

  while (low <= high && target >= arr[low] && target <= arr[high]) {
    if (low === high) {
      compare(stats, arr[low], target);
      pushArrayStep(steps, stats, `Single element check at index ${low}.`, arr, [low]);
      if (arr[low] === target) {
        pushArrayStep(steps, stats, `Target found at index ${low}.`, arr, [low]);
      } else {
        pushArrayStep(steps, stats, `Target not found.`, arr);
      }
      return steps;
    }

    const pos =
      low +
      Math.floor(((target - arr[low]) * (high - low)) / (arr[high] - arr[low] || 1));
    const probe = Math.min(high, Math.max(low, pos));
    compare(stats, arr[probe], target);
    pushArrayStep(steps, stats, `Probe index ${probe} (value ${arr[probe]}).`, arr, [probe], [low, high]);

    if (arr[probe] === target) {
      pushArrayStep(steps, stats, `Target ${target} found at index ${probe}.`, arr, [probe]);
      return steps;
    }

    if (arr[probe] < target) low = probe + 1;
    else high = probe - 1;
  }

  pushArrayStep(steps, stats, `Target ${target} not found.`, arr);
  return steps;
};

export default {
  linearSearch,
  binarySearch,
  jumpSearch,
  interpolationSearch,
};
