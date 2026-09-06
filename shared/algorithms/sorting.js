import {
  initStats,
  pushArrayStep,
  compare,
  swap,
  cloneStats,
} from './core.js';

const finish = (steps, stats, arr, description = 'Algorithm complete.') => {
  pushArrayStep(steps, stats, description, arr, [], Array.from({ length: arr.length }, (_, i) => i));
};

export const bubbleSort = (input) => {
  const arr = [...input];
  const steps = [];
  const stats = initStats();
  pushArrayStep(steps, stats, 'Starting bubble sort.', arr);

  for (let i = 0; i < arr.length - 1; i += 1) {
    for (let j = 0; j < arr.length - i - 1; j += 1) {
      compare(stats, arr[j], arr[j + 1]);
      pushArrayStep(steps, stats, `Compare ${arr[j]} and ${arr[j + 1]}.`, arr, [j, j + 1]);
      if (arr[j] > arr[j + 1]) {
        swap(stats, arr, j, j + 1);
        pushArrayStep(steps, stats, `Swap ${arr[j]} and ${arr[j + 1]}.`, arr, [j, j + 1]);
      }
    }
    pushArrayStep(
      steps,
      stats,
      `Element at index ${arr.length - i - 1} is in final position.`,
      arr,
      [],
      Array.from({ length: arr.length - i }, (_, idx) => arr.length - 1 - idx)
    );
  }

  finish(steps, stats, arr);
  return steps;
};

export const selectionSort = (input) => {
  const arr = [...input];
  const steps = [];
  const stats = initStats();
  pushArrayStep(steps, stats, 'Starting selection sort.', arr);

  for (let i = 0; i < arr.length - 1; i += 1) {
    let minIdx = i;
    for (let j = i + 1; j < arr.length; j += 1) {
      compare(stats, arr[j], arr[minIdx]);
      pushArrayStep(steps, stats, `Compare ${arr[j]} with current minimum ${arr[minIdx]}.`, arr, [j, minIdx]);
      if (arr[j] < arr[minIdx]) minIdx = j;
    }
    if (minIdx !== i) {
      swap(stats, arr, i, minIdx);
      pushArrayStep(steps, stats, `Place minimum ${arr[i]} at index ${i}.`, arr, [i, minIdx]);
    }
  }

  finish(steps, stats, arr);
  return steps;
};

export const insertionSort = (input) => {
  const arr = [...input];
  const steps = [];
  const stats = initStats();
  pushArrayStep(steps, stats, 'Starting insertion sort.', arr);

  for (let i = 1; i < arr.length; i += 1) {
    const key = arr[i];
    let j = i - 1;
    pushArrayStep(steps, stats, `Insert ${key} into sorted portion.`, arr, [i], Array.from({ length: i }, (_, idx) => idx));

    while (j >= 0) {
      compare(stats, arr[j], key);
      pushArrayStep(steps, stats, `Compare ${arr[j]} with key ${key}.`, arr, [j, i]);
      if (arr[j] > key) {
        arr[j + 1] = arr[j];
        stats.swaps += 1;
        j -= 1;
        pushArrayStep(steps, stats, `Shift ${arr[j + 1]} right.`, arr, [j + 1, i]);
      } else {
        break;
      }
    }
    arr[j + 1] = key;
    pushArrayStep(steps, stats, `Place key ${key} at index ${j + 1}.`, arr, [j + 1]);
  }

  finish(steps, stats, arr);
  return steps;
};

const mergeSortSteps = (arr, left, right, steps, stats, aux) => {
  if (left >= right) return;

  const mid = Math.floor((left + right) / 2);
  mergeSortSteps(arr, left, mid, steps, stats, aux);
  mergeSortSteps(arr, mid + 1, right, steps, stats, aux);

  pushArrayStep(steps, stats, `Merge subarrays [${left}..${mid}] and [${mid + 1}..${right}].`, arr, [], [left, right]);

  let i = left;
  let j = mid + 1;
  let k = left;

  while (i <= mid && j <= right) {
    compare(stats, arr[i], arr[j]);
    pushArrayStep(steps, stats, `Compare ${arr[i]} and ${arr[j]}.`, arr, [i, j]);
    if (arr[i] <= arr[j]) {
      aux[k++] = arr[i++];
    } else {
      aux[k++] = arr[j++];
    }
  }

  while (i <= mid) aux[k++] = arr[i++];
  while (j <= right) aux[k++] = arr[j++];

  for (let idx = left; idx <= right; idx += 1) {
    arr[idx] = aux[idx];
  }
  pushArrayStep(steps, stats, `Merged segment [${left}..${right}].`, arr, [], Array.from({ length: right - left + 1 }, (_, idx) => left + idx));
};

export const mergeSort = (input) => {
  const arr = [...input];
  const steps = [];
  const stats = initStats();
  const aux = Array(arr.length);
  pushArrayStep(steps, stats, 'Starting merge sort.', arr);
  mergeSortSteps(arr, 0, arr.length - 1, steps, stats, aux);
  finish(steps, stats, arr);
  return steps;
};

const partition = (arr, low, high, steps, stats) => {
  const pivot = arr[high];
  pushArrayStep(steps, stats, `Choose pivot ${pivot} at index ${high}.`, arr, [high], [high]);
  let i = low - 1;

  for (let j = low; j < high; j += 1) {
    compare(stats, arr[j], pivot);
    pushArrayStep(steps, stats, `Compare ${arr[j]} with pivot ${pivot}.`, arr, [j, high]);
    if (arr[j] < pivot) {
      i += 1;
      swap(stats, arr, i, j);
      pushArrayStep(steps, stats, `Move smaller element to left partition.`, arr, [i, j]);
    }
  }

  swap(stats, arr, i + 1, high);
  pushArrayStep(steps, stats, `Place pivot ${pivot} at index ${i + 1}.`, arr, [i + 1]);
  return i + 1;
};

const quickSortSteps = (arr, low, high, steps, stats) => {
  if (low >= high) return;
  const pi = partition(arr, low, high, steps, stats);
  quickSortSteps(arr, low, pi - 1, steps, stats);
  quickSortSteps(arr, pi + 1, high, steps, stats);
};

export const quickSort = (input) => {
  const arr = [...input];
  const steps = [];
  const stats = initStats();
  pushArrayStep(steps, stats, 'Starting quick sort.', arr);
  quickSortSteps(arr, 0, arr.length - 1, steps, stats);
  finish(steps, stats, arr);
  return steps;
};

const heapify = (arr, n, i, steps, stats) => {
  let largest = i;
  const left = 2 * i + 1;
  const right = 2 * i + 2;

  if (left < n) {
    compare(stats, arr[left], arr[largest]);
    pushArrayStep(steps, stats, `Compare left child ${arr[left]} with root ${arr[largest]}.`, arr, [left, largest]);
    if (arr[left] > arr[largest]) largest = left;
  }

  if (right < n) {
    compare(stats, arr[right], arr[largest]);
    pushArrayStep(steps, stats, `Compare right child ${arr[right]} with largest ${arr[largest]}.`, arr, [right, largest]);
    if (arr[right] > arr[largest]) largest = right;
  }

  if (largest !== i) {
    swap(stats, arr, i, largest);
    pushArrayStep(steps, stats, `Swap to maintain heap property.`, arr, [i, largest]);
    heapify(arr, n, largest, steps, stats);
  }
};

export const heapSort = (input) => {
  const arr = [...input];
  const steps = [];
  const stats = initStats();
  pushArrayStep(steps, stats, 'Build max heap.', arr);

  for (let i = Math.floor(arr.length / 2) - 1; i >= 0; i -= 1) {
    heapify(arr, arr.length, i, steps, stats);
  }

  for (let i = arr.length - 1; i > 0; i -= 1) {
    swap(stats, arr, 0, i);
    pushArrayStep(steps, stats, `Extract max ${arr[i]} to sorted region.`, arr, [0, i], Array.from({ length: arr.length - i }, (_, idx) => arr.length - 1 - idx));
    heapify(arr, i, 0, steps, stats);
  }

  finish(steps, stats, arr);
  return steps;
};

export const countingSort = (input) => {
  const arr = [...input];
  const steps = [];
  const stats = initStats();
  pushArrayStep(steps, stats, 'Starting counting sort.', arr);

  const max = Math.max(...arr, 0);
  const min = Math.min(...arr, 0);
  const range = max - min + 1;
  const count = Array(range).fill(0);

  for (const value of arr) {
    count[value - min] += 1;
    stats.comparisons += 1;
  }
  pushArrayStep(steps, stats, 'Built frequency array.', arr);

  for (let i = 1; i < range; i += 1) count[i] += count[i - 1];

  const output = Array(arr.length);
  for (let i = arr.length - 1; i >= 0; i -= 1) {
    const value = arr[i];
    output[count[value - min] - 1] = value;
    count[value - min] -= 1;
    stats.swaps += 1;
    pushArrayStep(steps, stats, `Place ${value} in output position.`, output.filter((v) => v !== undefined).concat(Array(arr.length).fill(undefined)).slice(0, arr.length), [count[value - min]]);
  }

  for (let i = 0; i < arr.length; i += 1) arr[i] = output[i];
  finish(steps, stats, arr);
  return steps;
};

export const radixSort = (input) => {
  const arr = [...input.map((v) => Math.abs(Math.trunc(v)))];
  const steps = [];
  const stats = initStats();
  pushArrayStep(steps, stats, 'Starting radix sort (LSD).', arr);

  const max = Math.max(...arr);
  for (let exp = 1; Math.floor(max / exp) > 0; exp *= 10) {
    const output = Array(arr.length);
    const count = Array(10).fill(0);

    for (const value of arr) {
      const digit = Math.floor(value / exp) % 10;
      count[digit] += 1;
      stats.comparisons += 1;
    }

    for (let i = 1; i < 10; i += 1) count[i] += count[i - 1];

    for (let i = arr.length - 1; i >= 0; i -= 1) {
      const digit = Math.floor(arr[i] / exp) % 10;
      output[count[digit] - 1] = arr[i];
      count[digit] -= 1;
      stats.swaps += 1;
    }

    for (let i = 0; i < arr.length; i += 1) arr[i] = output[i];
    pushArrayStep(steps, stats, `Sorted by digit place ${exp}.`, arr);
  }

  finish(steps, stats, arr);
  return steps;
};

export const bucketSort = (input) => {
  const arr = [...input];
  const steps = [];
  const stats = initStats();
  pushArrayStep(steps, stats, 'Starting bucket sort.', arr);

  const max = Math.max(...arr, 1);
  const bucketCount = Math.min(5, arr.length);
  const buckets = Array.from({ length: bucketCount }, () => []);

  for (const value of arr) {
    const idx = Math.min(bucketCount - 1, Math.floor((value / max) * bucketCount));
    buckets[idx].push(value);
    stats.comparisons += 1;
    pushArrayStep(steps, stats, `Place ${value} into bucket ${idx + 1}.`, arr, [arr.indexOf(value)]);
  }

  const sorted = [];
  buckets.forEach((bucket, index) => {
    bucket.sort((a, b) => {
      stats.comparisons += 1;
      return a - b;
    });
    pushArrayStep(steps, stats, `Sort bucket ${index + 1}.`, bucket.length ? bucket : [0]);
    sorted.push(...bucket);
  });

  for (let i = 0; i < sorted.length; i += 1) arr[i] = sorted[i];
  finish(steps, stats, arr);
  return steps;
};

export const shellSort = (input) => {
  const arr = [...input];
  const steps = [];
  const stats = initStats();
  pushArrayStep(steps, stats, 'Starting shell sort.', arr);

  for (let gap = Math.floor(arr.length / 2); gap > 0; gap = Math.floor(gap / 2)) {
    pushArrayStep(steps, stats, `Use gap size ${gap}.`, arr, [], []);
    for (let i = gap; i < arr.length; i += 1) {
      const temp = arr[i];
      let j = i;
      while (j >= gap) {
        compare(stats, arr[j - gap], temp);
        pushArrayStep(steps, stats, `Compare ${arr[j - gap]} with ${temp} at gap ${gap}.`, arr, [j - gap, j]);
        if (arr[j - gap] > temp) {
          arr[j] = arr[j - gap];
          stats.swaps += 1;
          j -= gap;
        } else {
          break;
        }
      }
      arr[j] = temp;
      pushArrayStep(steps, stats, `Insert ${temp} at index ${j}.`, arr, [j]);
    }
  }

  finish(steps, stats, arr);
  return steps;
};

const RUN = 4;

const insertionSortRun = (arr, left, right, steps, stats) => {
  for (let i = left + 1; i <= right; i += 1) {
    const key = arr[i];
    let j = i - 1;
    while (j >= left) {
      compare(stats, arr[j], key);
      pushArrayStep(steps, stats, `Within run [${left}..${right}]: compare ${arr[j]} with key ${key}.`, arr, [j, i]);
      if (arr[j] > key) {
        arr[j + 1] = arr[j];
        stats.swaps += 1;
        j -= 1;
      } else {
        break;
      }
    }
    arr[j + 1] = key;
  }
  pushArrayStep(steps, stats, `Run [${left}..${right}] sorted by insertion sort.`, arr, [], Array.from({ length: right - left + 1 }, (_, idx) => left + idx));
};

const mergeRuns = (arr, left, mid, right, steps, stats) => {
  const leftPart = arr.slice(left, mid + 1);
  const rightPart = arr.slice(mid + 1, right + 1);
  pushArrayStep(steps, stats, `Merge runs [${left}..${mid}] and [${mid + 1}..${right}].`, arr, [], [left, right]);

  let i = 0;
  let j = 0;
  let k = left;
  while (i < leftPart.length && j < rightPart.length) {
    compare(stats, leftPart[i], rightPart[j]);
    if (leftPart[i] <= rightPart[j]) {
      arr[k] = leftPart[i];
      i += 1;
    } else {
      arr[k] = rightPart[j];
      j += 1;
    }
    pushArrayStep(steps, stats, `Place ${arr[k]} at index ${k} while merging.`, arr, [k]);
    k += 1;
  }
  while (i < leftPart.length) {
    arr[k] = leftPart[i];
    pushArrayStep(steps, stats, `Copy remaining left-run value ${arr[k]} to index ${k}.`, arr, [k]);
    i += 1;
    k += 1;
  }
  while (j < rightPart.length) {
    arr[k] = rightPart[j];
    pushArrayStep(steps, stats, `Copy remaining right-run value ${arr[k]} to index ${k}.`, arr, [k]);
    j += 1;
    k += 1;
  }
};

/** Simplified Tim Sort: insertion-sort small runs, then merge runs pairwise (real hybrid, not a mergeSort alias) */
export const timSort = (input) => {
  const arr = [...input];
  const steps = [];
  const stats = initStats();
  const n = arr.length;
  pushArrayStep(steps, stats, `Starting Tim Sort with run size ${RUN}.`, arr);

  for (let start = 0; start < n; start += RUN) {
    const end = Math.min(start + RUN - 1, n - 1);
    insertionSortRun(arr, start, end, steps, stats);
  }

  for (let size = RUN; size < n; size *= 2) {
    for (let left = 0; left < n; left += 2 * size) {
      const mid = Math.min(left + size - 1, n - 1);
      const right = Math.min(left + 2 * size - 1, n - 1);
      if (mid < right) {
        mergeRuns(arr, left, mid, right, steps, stats);
      }
    }
  }

  finish(steps, stats, arr);
  return steps;
};

export default {
  bubbleSort,
  selectionSort,
  insertionSort,
  mergeSort,
  quickSort,
  heapSort,
  countingSort,
  radixSort,
  bucketSort,
  shellSort,
  timSort,
};
