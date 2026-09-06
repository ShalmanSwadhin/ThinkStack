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

export const ternarySearch = (input, target) => {
  const arr = [...input].sort((a, b) => a - b);
  const steps = [];
  const stats = initStats();
  pushArrayStep(steps, stats, `Ternary search for ${target} on sorted array.`, arr);

  let low = 0;
  let high = arr.length - 1;

  while (low <= high) {
    const third = (high - low) / 3;
    const mid1 = Math.floor(low + third);
    const mid2 = Math.ceil(high - third);

    compare(stats, arr[mid1], target);
    pushArrayStep(steps, stats, `Check first third index ${mid1} (value ${arr[mid1]}).`, arr, [mid1, mid2], [low, high]);
    if (arr[mid1] === target) {
      pushArrayStep(steps, stats, `Target ${target} found at index ${mid1}.`, arr, [mid1]);
      return steps;
    }

    compare(stats, arr[mid2], target);
    pushArrayStep(steps, stats, `Check second third index ${mid2} (value ${arr[mid2]}).`, arr, [mid1, mid2], [low, high]);
    if (arr[mid2] === target) {
      pushArrayStep(steps, stats, `Target ${target} found at index ${mid2}.`, arr, [mid2]);
      return steps;
    }

    if (target < arr[mid1]) {
      high = mid1 - 1;
      pushArrayStep(steps, stats, `Target is in the first third.`, arr, [], [low, high]);
    } else if (target > arr[mid2]) {
      low = mid2 + 1;
      pushArrayStep(steps, stats, `Target is in the third third.`, arr, [], [low, high]);
    } else {
      low = mid1 + 1;
      high = mid2 - 1;
      pushArrayStep(steps, stats, `Target is in the middle third.`, arr, [], [low, high]);
    }
  }

  pushArrayStep(steps, stats, `Target ${target} not found.`, arr);
  return steps;
};

export const exponentialSearch = (input, target) => {
  const arr = [...input].sort((a, b) => a - b);
  const steps = [];
  const stats = initStats();
  pushArrayStep(steps, stats, `Exponential search for ${target} on sorted array.`, arr);

  if (arr.length === 0) {
    pushArrayStep(steps, stats, `Target ${target} not found.`, arr);
    return steps;
  }

  compare(stats, arr[0], target);
  pushArrayStep(steps, stats, `Check index 0 (value ${arr[0]}) as starting bound.`, arr, [0]);
  if (arr[0] === target) {
    pushArrayStep(steps, stats, `Target ${target} found at index 0.`, arr, [0]);
    return steps;
  }

  let bound = 1;
  while (bound < arr.length && arr[bound] <= target) {
    compare(stats, arr[bound], target);
    pushArrayStep(steps, stats, `Double range to index ${bound} (value ${arr[bound]}).`, arr, [bound], [0, bound]);
    bound *= 2;
  }

  let low = Math.floor(bound / 2);
  let high = Math.min(bound, arr.length - 1);
  pushArrayStep(steps, stats, `Binary search within range [${low}, ${high}].`, arr, [], [low, high]);

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

export default {
  linearSearch,
  binarySearch,
  jumpSearch,
  interpolationSearch,
  ternarySearch,
  exponentialSearch,
};
