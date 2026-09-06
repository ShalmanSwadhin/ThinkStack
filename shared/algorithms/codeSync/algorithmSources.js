/**
 * Multi-language source code for visualizer algorithms.
 * Every algorithm has implementations in C, C++, Java, Python, and JavaScript.
 */

const LANGS = ['c', 'cpp', 'java', 'python', 'javascript'];

const SEARCHING = {
  'linear-search': {
    python: `# Linear Search — scan each element until target is found
def linear_search(arr, target):
    # Iterate through every index in the array
    for i in range(len(arr)):
        # Compare current element with the target value
        if arr[i] == target:
            # Target found — return its index immediately
            return i
    # Exhausted all elements without a match
    return -1`,
    javascript: `// Linear Search — scan each element until target is found
function linearSearch(arr, target) {
  // Iterate through every index in the array
  for (let i = 0; i < arr.length; i++) {
    // Compare current element with the target value
    if (arr[i] === target) {
      // Target found — return its index immediately
      return i;
    }
  }
  // Exhausted all elements without a match
  return -1;
}`,
    c: `// Linear Search — scan each element until target is found
#include <stdio.h>

int linear_search(int arr[], int n, int target) {
    // Iterate through every index in the array
    for (int i = 0; i < n; i++) {
        // Compare current element with the target value
        if (arr[i] == target) {
            // Target found — return its index immediately
            return i;
        }
    }
    // Exhausted all elements without a match
    return -1;
}`,
    cpp: `// Linear Search — scan each element until target is found
#include <vector>

int linearSearch(const std::vector<int>& arr, int target) {
    // Iterate through every index in the array
    for (int i = 0; i < (int)arr.size(); i++) {
        // Compare current element with the target value
        if (arr[i] == target) {
            // Target found — return its index immediately
            return i;
        }
    }
    // Exhausted all elements without a match
    return -1;
}`,
    java: `// Linear Search — scan each element until target is found
public class LinearSearch {
    public static int linearSearch(int[] arr, int target) {
        // Iterate through every index in the array
        for (int i = 0; i < arr.length; i++) {
            // Compare current element with the target value
            if (arr[i] == target) {
                // Target found — return its index immediately
                return i;
            }
        }
        // Exhausted all elements without a match
        return -1;
    }
}`,
  },
  'binary-search': {
    python: `# Binary Search — requires a sorted array
def binary_search(arr, target):
    # Initialize search boundaries
    low, high = 0, len(arr) - 1
    while low <= high:
        # Compute middle index to split search space in half
        mid = (low + high) // 2
        # Check if middle element is the target
        if arr[mid] == target:
            return mid
        # Target lies in the right half — discard left
        elif arr[mid] < target:
            low = mid + 1
        # Target lies in the left half — discard right
        else:
            high = mid - 1
    # Target not present in the sorted array
    return -1`,
    javascript: `// Binary Search — requires a sorted array
function binarySearch(arr, target) {
  // Initialize search boundaries
  let low = 0, high = arr.length - 1;
  while (low <= high) {
    // Compute middle index to split search space in half
    const mid = Math.floor((low + high) / 2);
    // Check if middle element is the target
    if (arr[mid] === target) return mid;
    // Target lies in the right half — discard left
    else if (arr[mid] < target) low = mid + 1;
    // Target lies in the left half — discard right
    else high = mid - 1;
  }
  // Target not present in the sorted array
  return -1;
}`,
    c: `// Binary Search — requires a sorted array
int binary_search(int arr[], int n, int target) {
    // Initialize search boundaries
    int low = 0, high = n - 1;
    while (low <= high) {
        // Compute middle index to split search space in half
        int mid = low + (high - low) / 2;
        // Check if middle element is the target
        if (arr[mid] == target) return mid;
        // Target lies in the right half — discard left
        else if (arr[mid] < target) low = mid + 1;
        // Target lies in the left half — discard right
        else high = mid - 1;
    }
    // Target not present in the sorted array
    return -1;
}`,
    cpp: `// Binary Search — requires a sorted array
int binarySearch(const std::vector<int>& arr, int target) {
    // Initialize search boundaries
    int low = 0, high = (int)arr.size() - 1;
    while (low <= high) {
        // Compute middle index to split search space in half
        int mid = low + (high - low) / 2;
        // Check if middle element is the target
        if (arr[mid] == target) return mid;
        // Target lies in the right half — discard left
        else if (arr[mid] < target) low = mid + 1;
        // Target lies in the left half — discard right
        else high = mid - 1;
    }
    // Target not present in the sorted array
    return -1;
}`,
    java: `// Binary Search — requires a sorted array
public class BinarySearch {
    public static int binarySearch(int[] arr, int target) {
        // Initialize search boundaries
        int low = 0, high = arr.length - 1;
        while (low <= high) {
            // Compute middle index to split search space in half
            int mid = low + (high - low) / 2;
            // Check if middle element is the target
            if (arr[mid] == target) return mid;
            // Target lies in the right half — discard left
            else if (arr[mid] < target) low = mid + 1;
            // Target lies in the left half — discard right
            else high = mid - 1;
        }
        // Target not present in the sorted array
        return -1;
    }
}`,
  },
  'jump-search': {
    python: `# Jump Search — block-based search on a sorted array
def jump_search(arr, target):
    n = len(arr)
    step = int(n ** 0.5)
    prev = 0
    # Jump ahead in blocks while the block end is below target
    while arr[min(step, n) - 1] < target:
        prev = step
        step += int(n ** 0.5)
        if prev >= n:
            return -1
    # Linear scan within the identified block
    for i in range(prev, min(step, n)):
        if arr[i] == target:
            return i
    return -1`,
    javascript: `// Jump Search — block-based search on a sorted array
function jumpSearch(arr, target) {
  const n = arr.length;
  let step = Math.floor(Math.sqrt(n));
  let prev = 0;
  // Jump ahead in blocks while the block end is below target
  while (arr[Math.min(step, n) - 1] < target) {
    prev = step;
    step += Math.floor(Math.sqrt(n));
    if (prev >= n) return -1;
  }
  // Linear scan within the identified block
  for (let i = prev; i < Math.min(step, n); i++) {
    if (arr[i] === target) return i;
  }
  return -1;
}`,
    c: `// Jump Search — block-based search on a sorted array
int jump_search(int arr[], int n, int target) {
    int step = (int)sqrt(n);
    int prev = 0;
    // Jump ahead in blocks while the block end is below target
    while (arr[(step < n ? step : n) - 1] < target) {
        prev = step;
        step += (int)sqrt(n);
        if (prev >= n) return -1;
    }
    // Linear scan within the identified block
    for (int i = prev; i < (step < n ? step : n); i++) {
        if (arr[i] == target) return i;
    }
    return -1;
}`,
    cpp: `// Jump Search — block-based search on a sorted array
int jumpSearch(const std::vector<int>& arr, int target) {
    int n = (int)arr.size();
    int step = (int)sqrt(n);
    int prev = 0;
    // Jump ahead in blocks while the block end is below target
    while (arr[std::min(step, n) - 1] < target) {
        prev = step;
        step += (int)sqrt(n);
        if (prev >= n) return -1;
    }
    // Linear scan within the identified block
    for (int i = prev; i < std::min(step, n); i++) {
        if (arr[i] == target) return i;
    }
    return -1;
}`,
    java: `// Jump Search — block-based search on a sorted array
public class JumpSearch {
    public static int jumpSearch(int[] arr, int target) {
        int n = arr.length;
        int step = (int) Math.sqrt(n);
        int prev = 0;
        // Jump ahead in blocks while the block end is below target
        while (arr[Math.min(step, n) - 1] < target) {
            prev = step;
            step += (int) Math.sqrt(n);
            if (prev >= n) return -1;
        }
        // Linear scan within the identified block
        for (int i = prev; i < Math.min(step, n); i++) {
            if (arr[i] == target) return i;
        }
        return -1;
    }
}`,
  },
  'interpolation-search': {
    python: `# Interpolation Search — estimate the probe position in a sorted array
def interpolation_search(arr, target):
    low, high = 0, len(arr) - 1
    while low <= high and arr[low] <= target <= arr[high]:
        # Estimate probe index using linear interpolation
        pos = low + (target - arr[low]) * (high - low) // (arr[high] - arr[low] or 1)
        if arr[pos] == target:
            return pos
        # Narrow the search range based on the probe
        if arr[pos] < target:
            low = pos + 1
        else:
            high = pos - 1
    return -1`,
    javascript: `// Interpolation Search — estimate the probe position in a sorted array
function interpolationSearch(arr, target) {
  let low = 0, high = arr.length - 1;
  while (low <= high && target >= arr[low] && target <= arr[high]) {
    // Estimate probe index using linear interpolation
    const pos = low + Math.floor(((target - arr[low]) * (high - low)) / ((arr[high] - arr[low]) || 1));
    if (arr[pos] === target) return pos;
    // Narrow the search range based on the probe
    if (arr[pos] < target) low = pos + 1;
    else high = pos - 1;
  }
  return -1;
}`,
    c: `// Interpolation Search — estimate the probe position in a sorted array
int interpolation_search(int arr[], int n, int target) {
    int low = 0, high = n - 1;
    while (low <= high && target >= arr[low] && target <= arr[high]) {
        // Estimate probe index using linear interpolation
        int pos = low + (int)((double)(target - arr[low]) * (high - low) / ((arr[high] - arr[low]) ? (arr[high] - arr[low]) : 1));
        if (arr[pos] == target) return pos;
        // Narrow the search range based on the probe
        if (arr[pos] < target) low = pos + 1;
        else high = pos - 1;
    }
    return -1;
}`,
    cpp: `// Interpolation Search — estimate the probe position in a sorted array
int interpolationSearch(const std::vector<int>& arr, int target) {
    int low = 0, high = (int)arr.size() - 1;
    while (low <= high && target >= arr[low] && target <= arr[high]) {
        // Estimate probe index using linear interpolation
        int pos = low + (int)((double)(target - arr[low]) * (high - low) / ((arr[high] - arr[low]) ? (arr[high] - arr[low]) : 1));
        if (arr[pos] == target) return pos;
        // Narrow the search range based on the probe
        if (arr[pos] < target) low = pos + 1;
        else high = pos - 1;
    }
    return -1;
}`,
    java: `// Interpolation Search — estimate the probe position in a sorted array
public class InterpolationSearch {
    public static int interpolationSearch(int[] arr, int target) {
        int low = 0, high = arr.length - 1;
        while (low <= high && target >= arr[low] && target <= arr[high]) {
            // Estimate probe index using linear interpolation
            int pos = low + (int) ((double) (target - arr[low]) * (high - low) / ((arr[high] - arr[low] != 0) ? (arr[high] - arr[low]) : 1));
            if (arr[pos] == target) return pos;
            // Narrow the search range based on the probe
            if (arr[pos] < target) low = pos + 1;
            else high = pos - 1;
        }
        return -1;
    }
}`,
  },
  'ternary-search': {
    python: `# Ternary Search — split the search range into three parts
def ternary_search(arr, target):
    low, high = 0, len(arr) - 1
    while low <= high:
        third = (high - low) // 3
        mid1 = low + third
        mid2 = high - third
        # Check both third-points against the target
        if arr[mid1] == target:
            return mid1
        if arr[mid2] == target:
            return mid2
        # Narrow to whichever third contains the target
        if target < arr[mid1]:
            high = mid1 - 1
        elif target > arr[mid2]:
            low = mid2 + 1
        else:
            low, high = mid1 + 1, mid2 - 1
    return -1`,
    javascript: `// Ternary Search — split the search range into three parts
function ternarySearch(arr, target) {
  let low = 0, high = arr.length - 1;
  while (low <= high) {
    const third = Math.floor((high - low) / 3);
    const mid1 = low + third;
    const mid2 = high - third;
    // Check both third-points against the target
    if (arr[mid1] === target) return mid1;
    if (arr[mid2] === target) return mid2;
    // Narrow to whichever third contains the target
    if (target < arr[mid1]) high = mid1 - 1;
    else if (target > arr[mid2]) low = mid2 + 1;
    else { low = mid1 + 1; high = mid2 - 1; }
  }
  return -1;
}`,
    c: `// Ternary Search — split the search range into three parts
int ternary_search(int arr[], int n, int target) {
    int low = 0, high = n - 1;
    while (low <= high) {
        int third = (high - low) / 3;
        int mid1 = low + third;
        int mid2 = high - third;
        // Check both third-points against the target
        if (arr[mid1] == target) return mid1;
        if (arr[mid2] == target) return mid2;
        // Narrow to whichever third contains the target
        if (target < arr[mid1]) high = mid1 - 1;
        else if (target > arr[mid2]) low = mid2 + 1;
        else { low = mid1 + 1; high = mid2 - 1; }
    }
    return -1;
}`,
    cpp: `// Ternary Search — split the search range into three parts
int ternarySearch(const std::vector<int>& arr, int target) {
    int low = 0, high = (int)arr.size() - 1;
    while (low <= high) {
        int third = (high - low) / 3;
        int mid1 = low + third;
        int mid2 = high - third;
        // Check both third-points against the target
        if (arr[mid1] == target) return mid1;
        if (arr[mid2] == target) return mid2;
        // Narrow to whichever third contains the target
        if (target < arr[mid1]) high = mid1 - 1;
        else if (target > arr[mid2]) low = mid2 + 1;
        else { low = mid1 + 1; high = mid2 - 1; }
    }
    return -1;
}`,
    java: `// Ternary Search — split the search range into three parts
public class TernarySearch {
    public static int ternarySearch(int[] arr, int target) {
        int low = 0, high = arr.length - 1;
        while (low <= high) {
            int third = (high - low) / 3;
            int mid1 = low + third;
            int mid2 = high - third;
            // Check both third-points against the target
            if (arr[mid1] == target) return mid1;
            if (arr[mid2] == target) return mid2;
            // Narrow to whichever third contains the target
            if (target < arr[mid1]) high = mid1 - 1;
            else if (target > arr[mid2]) low = mid2 + 1;
            else { low = mid1 + 1; high = mid2 - 1; }
        }
        return -1;
    }
}`,
  },
  'exponential-search': {
    python: `# Exponential Search — find a range, then binary search inside it
def exponential_search(arr, target):
    if arr[0] == target:
        return 0
    # Grow the bound exponentially until it overshoots the target
    bound = 1
    while bound < len(arr) and arr[bound] <= target:
        bound *= 2
    low, high = bound // 2, min(bound, len(arr) - 1)
    # Binary search within the discovered range
    while low <= high:
        mid = (low + high) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            low = mid + 1
        else:
            high = mid - 1
    return -1`,
    javascript: `// Exponential Search — find a range, then binary search inside it
function exponentialSearch(arr, target) {
  if (arr[0] === target) return 0;
  // Grow the bound exponentially until it overshoots the target
  let bound = 1;
  while (bound < arr.length && arr[bound] <= target) bound *= 2;
  let low = Math.floor(bound / 2), high = Math.min(bound, arr.length - 1);
  // Binary search within the discovered range
  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    if (arr[mid] === target) return mid;
    else if (arr[mid] < target) low = mid + 1;
    else high = mid - 1;
  }
  return -1;
}`,
    c: `// Exponential Search — find a range, then binary search inside it
int exponential_search(int arr[], int n, int target) {
    if (arr[0] == target) return 0;
    // Grow the bound exponentially until it overshoots the target
    int bound = 1;
    while (bound < n && arr[bound] <= target) bound *= 2;
    int low = bound / 2, high = (bound < n ? bound : n - 1);
    // Binary search within the discovered range
    while (low <= high) {
        int mid = (low + high) / 2;
        if (arr[mid] == target) return mid;
        else if (arr[mid] < target) low = mid + 1;
        else high = mid - 1;
    }
    return -1;
}`,
    cpp: `// Exponential Search — find a range, then binary search inside it
int exponentialSearch(const std::vector<int>& arr, int target) {
    if (arr[0] == target) return 0;
    // Grow the bound exponentially until it overshoots the target
    int bound = 1;
    int n = (int)arr.size();
    while (bound < n && arr[bound] <= target) bound *= 2;
    int low = bound / 2, high = std::min(bound, n - 1);
    // Binary search within the discovered range
    while (low <= high) {
        int mid = (low + high) / 2;
        if (arr[mid] == target) return mid;
        else if (arr[mid] < target) low = mid + 1;
        else high = mid - 1;
    }
    return -1;
}`,
    java: `// Exponential Search — find a range, then binary search inside it
public class ExponentialSearch {
    public static int exponentialSearch(int[] arr, int target) {
        if (arr[0] == target) return 0;
        // Grow the bound exponentially until it overshoots the target
        int bound = 1;
        while (bound < arr.length && arr[bound] <= target) bound *= 2;
        int low = bound / 2, high = Math.min(bound, arr.length - 1);
        // Binary search within the discovered range
        while (low <= high) {
            int mid = (low + high) / 2;
            if (arr[mid] == target) return mid;
            else if (arr[mid] < target) low = mid + 1;
            else high = mid - 1;
        }
        return -1;
    }
}`,
  },
};

const SORTING = {
  'bubble-sort': {
    python: `# Bubble Sort — repeatedly swap adjacent out-of-order elements
def bubble_sort(arr):
    n = len(arr)
    # Outer loop: each pass places one element in final position
    for i in range(n - 1):
        # Inner loop: compare adjacent pairs in unsorted portion
        for j in range(n - i - 1):
            # Swap if left element is greater than right
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
    return arr`,
    javascript: `// Bubble Sort — repeatedly swap adjacent out-of-order elements
function bubbleSort(arr) {
  const n = arr.length;
  // Outer loop: each pass places one element in final position
  for (let i = 0; i < n - 1; i++) {
    // Inner loop: compare adjacent pairs in unsorted portion
    for (let j = 0; j < n - i - 1; j++) {
      // Swap if left element is greater than right
      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
      }
    }
  }
  return arr;
}`,
    c: `// Bubble Sort — repeatedly swap adjacent out-of-order elements
void bubble_sort(int arr[], int n) {
    // Outer loop: each pass places one element in final position
    for (int i = 0; i < n - 1; i++) {
        // Inner loop: compare adjacent pairs in unsorted portion
        for (int j = 0; j < n - i - 1; j++) {
            // Swap if left element is greater than right
            if (arr[j] > arr[j + 1]) {
                int tmp = arr[j]; arr[j] = arr[j + 1]; arr[j + 1] = tmp;
            }
        }
    }
}`,
    cpp: `// Bubble Sort — repeatedly swap adjacent out-of-order elements
void bubbleSort(std::vector<int>& arr) {
    int n = arr.size();
    // Outer loop: each pass places one element in final position
    for (int i = 0; i < n - 1; i++) {
        // Inner loop: compare adjacent pairs in unsorted portion
        for (int j = 0; j < n - i - 1; j++) {
            // Swap if left element is greater than right
            if (arr[j] > arr[j + 1]) std::swap(arr[j], arr[j + 1]);
        }
    }
}`,
    java: `// Bubble Sort — repeatedly swap adjacent out-of-order elements
public class BubbleSort {
    public static void bubbleSort(int[] arr) {
        int n = arr.length;
        // Outer loop: each pass places one element in final position
        for (int i = 0; i < n - 1; i++) {
            // Inner loop: compare adjacent pairs in unsorted portion
            for (int j = 0; j < n - i - 1; j++) {
                // Swap if left element is greater than right
                if (arr[j] > arr[j + 1]) {
                    int tmp = arr[j]; arr[j] = arr[j + 1]; arr[j + 1] = tmp;
                }
            }
        }
    }
}`,
  },
  'selection-sort': {
    python: `# Selection Sort — repeatedly select the minimum and place it in position
def selection_sort(arr):
    n = len(arr)
    for i in range(n - 1):
        min_idx = i
        # Scan the unsorted portion for the minimum value
        for j in range(i + 1, n):
            if arr[j] < arr[min_idx]:
                min_idx = j
        # Swap the found minimum into position i
        arr[i], arr[min_idx] = arr[min_idx], arr[i]
    return arr`,
    javascript: `// Selection Sort — repeatedly select the minimum and place it in position
function selectionSort(arr) {
  const n = arr.length;
  for (let i = 0; i < n - 1; i++) {
    let minIdx = i;
    // Scan the unsorted portion for the minimum value
    for (let j = i + 1; j < n; j++) {
      if (arr[j] < arr[minIdx]) minIdx = j;
    }
    // Swap the found minimum into position i
    [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
  }
  return arr;
}`,
    c: `// Selection Sort — repeatedly select the minimum and place it in position
void selection_sort(int arr[], int n) {
    for (int i = 0; i < n - 1; i++) {
        int minIdx = i;
        // Scan the unsorted portion for the minimum value
        for (int j = i + 1; j < n; j++) {
            if (arr[j] < arr[minIdx]) minIdx = j;
        }
        // Swap the found minimum into position i
        int tmp = arr[i]; arr[i] = arr[minIdx]; arr[minIdx] = tmp;
    }
}`,
    cpp: `// Selection Sort — repeatedly select the minimum and place it in position
void selectionSort(std::vector<int>& arr) {
    int n = (int)arr.size();
    for (int i = 0; i < n - 1; i++) {
        int minIdx = i;
        // Scan the unsorted portion for the minimum value
        for (int j = i + 1; j < n; j++) {
            if (arr[j] < arr[minIdx]) minIdx = j;
        }
        // Swap the found minimum into position i
        std::swap(arr[i], arr[minIdx]);
    }
}`,
    java: `// Selection Sort — repeatedly select the minimum and place it in position
public class SelectionSort {
    public static void selectionSort(int[] arr) {
        int n = arr.length;
        for (int i = 0; i < n - 1; i++) {
            int minIdx = i;
            // Scan the unsorted portion for the minimum value
            for (int j = i + 1; j < n; j++) {
                if (arr[j] < arr[minIdx]) minIdx = j;
            }
            // Swap the found minimum into position i
            int tmp = arr[i]; arr[i] = arr[minIdx]; arr[minIdx] = tmp;
        }
    }
}`,
  },
  'insertion-sort': {
    python: `# Insertion Sort — build the sorted portion one element at a time
def insertion_sort(arr):
    for i in range(1, len(arr)):
        key = arr[i]
        j = i - 1
        # Shift elements greater than key to the right
        while j >= 0 and arr[j] > key:
            arr[j + 1] = arr[j]
            j -= 1
        # Insert key into its correct position
        arr[j + 1] = key
    return arr`,
    javascript: `// Insertion Sort — build the sorted portion one element at a time
function insertionSort(arr) {
  for (let i = 1; i < arr.length; i++) {
    const key = arr[i];
    let j = i - 1;
    // Shift elements greater than key to the right
    while (j >= 0 && arr[j] > key) {
      arr[j + 1] = arr[j];
      j--;
    }
    // Insert key into its correct position
    arr[j + 1] = key;
  }
  return arr;
}`,
    c: `// Insertion Sort — build the sorted portion one element at a time
void insertion_sort(int arr[], int n) {
    for (int i = 1; i < n; i++) {
        int key = arr[i];
        int j = i - 1;
        // Shift elements greater than key to the right
        while (j >= 0 && arr[j] > key) {
            arr[j + 1] = arr[j];
            j--;
        }
        // Insert key into its correct position
        arr[j + 1] = key;
    }
}`,
    cpp: `// Insertion Sort — build the sorted portion one element at a time
void insertionSort(std::vector<int>& arr) {
    for (int i = 1; i < (int)arr.size(); i++) {
        int key = arr[i];
        int j = i - 1;
        // Shift elements greater than key to the right
        while (j >= 0 && arr[j] > key) {
            arr[j + 1] = arr[j];
            j--;
        }
        // Insert key into its correct position
        arr[j + 1] = key;
    }
}`,
    java: `// Insertion Sort — build the sorted portion one element at a time
public class InsertionSort {
    public static void insertionSort(int[] arr) {
        for (int i = 1; i < arr.length; i++) {
            int key = arr[i];
            int j = i - 1;
            // Shift elements greater than key to the right
            while (j >= 0 && arr[j] > key) {
                arr[j + 1] = arr[j];
                j--;
            }
            // Insert key into its correct position
            arr[j + 1] = key;
        }
    }
}`,
  },
  'merge-sort': {
    python: `# Merge Sort — divide array into halves, merge sorted parts
def merge_sort(arr):
    # Base case: single element is already sorted
    if len(arr) <= 1:
        return arr
    # Divide array into two halves
    mid = len(arr) // 2
    left = merge_sort(arr[:mid])
    right = merge_sort(arr[mid:])
    # Merge the two sorted halves
    return merge(left, right)

def merge(left, right):
    result, i, j = [], 0, 0
    # Compare front elements and take the smaller one
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            result.append(left[i]); i += 1
        else:
            result.append(right[j]); j += 1
    return result + left[i:] + right[j:]`,
    javascript: `// Merge Sort — divide array into halves, merge sorted parts
function mergeSort(arr) {
  // Base case: single element is already sorted
  if (arr.length <= 1) return arr;
  // Divide array into two halves
  const mid = Math.floor(arr.length / 2);
  const left = mergeSort(arr.slice(0, mid));
  const right = mergeSort(arr.slice(mid));
  // Merge the two sorted halves
  return merge(left, right);
}

function merge(left, right) {
  const result = []; let i = 0, j = 0;
  // Compare front elements and take the smaller one
  while (i < left.length && j < right.length) {
    if (left[i] <= right[j]) result.push(left[i++]);
    else result.push(right[j++]);
  }
  return result.concat(left.slice(i), right.slice(j));
}`,
    c: `// Merge Sort — divide and conquer with merge step
void merge(int arr[], int l, int m, int r) {
    // Copy halves into temp arrays, merge back in sorted order
    int n1 = m - l + 1, n2 = r - m;
    int L[n1], R[n2];
    for (int i = 0; i < n1; i++) L[i] = arr[l + i];
    for (int j = 0; j < n2; j++) R[j] = arr[m + 1 + j];
    int i = 0, j = 0, k = l;
    // Compare front elements and take the smaller one
    while (i < n1 && j < n2)
        arr[k++] = (L[i] <= R[j]) ? L[i++] : R[j++];
    while (i < n1) arr[k++] = L[i++];
    while (j < n2) arr[k++] = R[j++];
}`,
    cpp: `// Merge Sort — divide array into halves, merge sorted parts
void merge(std::vector<int>& arr, int l, int m, int r) {
    std::vector<int> L(arr.begin() + l, arr.begin() + m + 1);
    std::vector<int> R(arr.begin() + m + 1, arr.begin() + r + 1);
    int i = 0, j = 0, k = l;
    // Compare front elements and take the smaller one
    while (i < (int)L.size() && j < (int)R.size())
        arr[k++] = (L[i] <= R[j]) ? L[i++] : R[j++];
    while (i < (int)L.size()) arr[k++] = L[i++];
    while (j < (int)R.size()) arr[k++] = R[j++];
}`,
    java: `// Merge Sort — divide array into halves, merge sorted parts
public class MergeSort {
    static void merge(int[] arr, int l, int m, int r) {
        int[] L = java.util.Arrays.copyOfRange(arr, l, m + 1);
        int[] R = java.util.Arrays.copyOfRange(arr, m + 1, r + 1);
        int i = 0, j = 0, k = l;
        // Compare front elements and take the smaller one
        while (i < L.length && j < R.length)
            arr[k++] = (L[i] <= R[j]) ? L[i++] : R[j++];
        while (i < L.length) arr[k++] = L[i++];
        while (j < R.length) arr[k++] = R[j++];
    }
}`,
  },
  'quick-sort': {
    python: `# Quick Sort — partition around pivot, recurse on halves
def quick_sort(arr, low, high):
    if low < high:
        # Partition array and get pivot's final index
        pivot = partition(arr, low, high)
        # Recursively sort left and right partitions
        quick_sort(arr, low, pivot - 1)
        quick_sort(arr, pivot + 1, high)

def partition(arr, low, high):
    pivot = arr[high]  # Choose last element as pivot
    i = low - 1
    for j in range(low, high):
        # Move elements smaller than pivot to the left
        if arr[j] <= pivot:
            i += 1; arr[i], arr[j] = arr[j], arr[i]
    arr[i + 1], arr[high] = arr[high], arr[i + 1]
    return i + 1`,
    javascript: `// Quick Sort — partition around pivot, recurse on halves
function quickSort(arr, low = 0, high = arr.length - 1) {
  if (low < high) {
    // Partition array and get pivot's final index
    const pivot = partition(arr, low, high);
    // Recursively sort left and right partitions
    quickSort(arr, low, pivot - 1);
    quickSort(arr, pivot + 1, high);
  }
  return arr;
}

function partition(arr, low, high) {
  const pivot = arr[high]; // Choose last element as pivot
  let i = low - 1;
  for (let j = low; j < high; j++) {
    // Move elements smaller than pivot to the left
    if (arr[j] <= pivot) { i++; [arr[i], arr[j]] = [arr[j], arr[i]]; }
  }
  [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
  return i + 1;
}`,
    c: `// Quick Sort — partition around pivot, recurse on halves
int partition(int arr[], int low, int high) {
    int pivot = arr[high]; // Choose last element as pivot
    int i = low - 1;
    for (int j = low; j < high; j++) {
        // Move elements smaller than pivot to the left
        if (arr[j] <= pivot) { i++; int t=arr[i]; arr[i]=arr[j]; arr[j]=t; }
    }
    int t=arr[i+1]; arr[i+1]=arr[high]; arr[high]=t;
    return i + 1;
}`,
    cpp: `// Quick Sort — partition around pivot, recurse on halves
int partition(std::vector<int>& arr, int low, int high) {
    int pivot = arr[high]; // Choose last element as pivot
    int i = low - 1;
    for (int j = low; j < high; j++) {
        // Move elements smaller than pivot to the left
        if (arr[j] <= pivot) std::swap(arr[++i], arr[j]);
    }
    std::swap(arr[i + 1], arr[high]);
    return i + 1;
}`,
    java: `// Quick Sort — partition around pivot, recurse on halves
public class QuickSort {
    static int partition(int[] arr, int low, int high) {
        int pivot = arr[high]; // Choose last element as pivot
        int i = low - 1;
        for (int j = low; j < high; j++) {
            // Move elements smaller than pivot to the left
            if (arr[j] <= pivot) { i++; int t=arr[i]; arr[i]=arr[j]; arr[j]=t; }
        }
        int t=arr[i+1]; arr[i+1]=arr[high]; arr[high]=t;
        return i + 1;
    }
}`,
  },
  'counting-sort': {
    python: `# Counting Sort — count occurrences, then place by cumulative count
def counting_sort(arr):
    lo, hi = min(arr), max(arr)
    count = [0] * (hi - lo + 1)
    # Count occurrences of each value
    for v in arr:
        count[v - lo] += 1
    # Convert counts to cumulative positions
    for i in range(1, len(count)):
        count[i] += count[i - 1]
    output = [0] * len(arr)
    # Place each value at its final output position
    for v in reversed(arr):
        output[count[v - lo] - 1] = v
        count[v - lo] -= 1
    return output`,
    javascript: `// Counting Sort — count occurrences, then place by cumulative count
function countingSort(arr) {
  const lo = Math.min(...arr), hi = Math.max(...arr);
  const count = new Array(hi - lo + 1).fill(0);
  // Count occurrences of each value
  for (const v of arr) count[v - lo]++;
  // Convert counts to cumulative positions
  for (let i = 1; i < count.length; i++) count[i] += count[i - 1];
  const output = new Array(arr.length);
  // Place each value at its final output position
  for (let i = arr.length - 1; i >= 0; i--) {
    output[count[arr[i] - lo] - 1] = arr[i];
    count[arr[i] - lo]--;
  }
  return output;
}`,
    c: `// Counting Sort — count occurrences, then place by cumulative count
void counting_sort(int arr[], int n, int lo, int hi) {
    int range = hi - lo + 1;
    int* count = calloc(range, sizeof(int));
    // Count occurrences of each value
    for (int i = 0; i < n; i++) count[arr[i] - lo]++;
    // Convert counts to cumulative positions
    for (int i = 1; i < range; i++) count[i] += count[i - 1];
    int* output = malloc(n * sizeof(int));
    // Place each value at its final output position
    for (int i = n - 1; i >= 0; i--) {
        output[count[arr[i] - lo] - 1] = arr[i];
        count[arr[i] - lo]--;
    }
    for (int i = 0; i < n; i++) arr[i] = output[i];
}`,
    cpp: `// Counting Sort — count occurrences, then place by cumulative count
void countingSort(std::vector<int>& arr) {
    int lo = *std::min_element(arr.begin(), arr.end());
    int hi = *std::max_element(arr.begin(), arr.end());
    std::vector<int> count(hi - lo + 1, 0);
    // Count occurrences of each value
    for (int v : arr) count[v - lo]++;
    // Convert counts to cumulative positions
    for (size_t i = 1; i < count.size(); i++) count[i] += count[i - 1];
    std::vector<int> output(arr.size());
    // Place each value at its final output position
    for (int i = (int)arr.size() - 1; i >= 0; i--) {
        output[count[arr[i] - lo] - 1] = arr[i];
        count[arr[i] - lo]--;
    }
    arr = output;
}`,
    java: `// Counting Sort — count occurrences, then place by cumulative count
public class CountingSort {
    static void countingSort(int[] arr, int lo, int hi) {
        int[] count = new int[hi - lo + 1];
        // Count occurrences of each value
        for (int v : arr) count[v - lo]++;
        // Convert counts to cumulative positions
        for (int i = 1; i < count.length; i++) count[i] += count[i - 1];
        int[] output = new int[arr.length];
        // Place each value at its final output position
        for (int i = arr.length - 1; i >= 0; i--) {
            output[count[arr[i] - lo] - 1] = arr[i];
            count[arr[i] - lo]--;
        }
        System.arraycopy(output, 0, arr, 0, arr.length);
    }
}`,
  },
  'radix-sort': {
    python: `# Radix Sort (LSD) — sort by each digit place, least significant first
def radix_sort(arr):
    max_val = max(arr)
    exp = 1
    # Repeat counting sort for each digit place
    while max_val // exp > 0:
        # Stable counting sort keyed on digit (value // exp) % 10
        arr = counting_sort_by_digit(arr, exp)
        exp *= 10
    return arr`,
    javascript: `// Radix Sort (LSD) — sort by each digit place, least significant first
function radixSort(arr) {
  const maxVal = Math.max(...arr);
  let exp = 1;
  // Repeat counting sort for each digit place
  while (Math.floor(maxVal / exp) > 0) {
    // Stable counting sort keyed on digit floor(value / exp) % 10
    arr = countingSortByDigit(arr, exp);
    exp *= 10;
  }
  return arr;
}`,
    c: `// Radix Sort (LSD) — sort by each digit place, least significant first
void radix_sort(int arr[], int n) {
    int max_val = arr[0];
    for (int i = 1; i < n; i++) if (arr[i] > max_val) max_val = arr[i];
    // Repeat counting sort for each digit place
    for (int exp = 1; max_val / exp > 0; exp *= 10) {
        // Stable counting sort keyed on digit (value / exp) % 10
        counting_sort_by_digit(arr, n, exp);
    }
}`,
    cpp: `// Radix Sort (LSD) — sort by each digit place, least significant first
void radixSort(std::vector<int>& arr) {
    int maxVal = *std::max_element(arr.begin(), arr.end());
    // Repeat counting sort for each digit place
    for (int exp = 1; maxVal / exp > 0; exp *= 10) {
        // Stable counting sort keyed on digit (value / exp) % 10
        countingSortByDigit(arr, exp);
    }
}`,
    java: `// Radix Sort (LSD) — sort by each digit place, least significant first
public class RadixSort {
    static void radixSort(int[] arr) {
        int maxVal = java.util.Arrays.stream(arr).max().getAsInt();
        // Repeat counting sort for each digit place
        for (int exp = 1; maxVal / exp > 0; exp *= 10) {
            // Stable counting sort keyed on digit (value / exp) % 10
            countingSortByDigit(arr, exp);
        }
    }
}`,
  },
  'bucket-sort': {
    python: `# Bucket Sort — distribute into buckets, sort each, concatenate
def bucket_sort(arr, bucket_count=5):
    max_val = max(arr) or 1
    buckets = [[] for _ in range(bucket_count)]
    # Distribute each value into its bucket
    for v in arr:
        idx = min(bucket_count - 1, int((v / max_val) * bucket_count))
        buckets[idx].append(v)
    result = []
    # Sort each bucket individually, then concatenate
    for bucket in buckets:
        bucket.sort()
        result.extend(bucket)
    return result`,
    javascript: `// Bucket Sort — distribute into buckets, sort each, concatenate
function bucketSort(arr, bucketCount = 5) {
  const maxVal = Math.max(...arr, 1);
  const buckets = Array.from({ length: bucketCount }, () => []);
  // Distribute each value into its bucket
  for (const v of arr) {
    const idx = Math.min(bucketCount - 1, Math.floor((v / maxVal) * bucketCount));
    buckets[idx].push(v);
  }
  const result = [];
  // Sort each bucket individually, then concatenate
  for (const bucket of buckets) {
    bucket.sort((a, b) => a - b);
    result.push(...bucket);
  }
  return result;
}`,
    c: `// Bucket Sort — distribute into buckets, sort each, concatenate
void bucket_sort(float arr[], int n) {
    std::vector<float> buckets[BUCKET_COUNT];
    // Distribute each value into its bucket
    for (int i = 0; i < n; i++) {
        int idx = (int)(arr[i] * BUCKET_COUNT);
        buckets[idx].push_back(arr[i]);
    }
    int pos = 0;
    // Sort each bucket individually, then concatenate
    for (int i = 0; i < BUCKET_COUNT; i++) {
        std::sort(buckets[i].begin(), buckets[i].end());
        for (float v : buckets[i]) arr[pos++] = v;
    }
}`,
    cpp: `// Bucket Sort — distribute into buckets, sort each, concatenate
void bucketSort(std::vector<float>& arr) {
    std::vector<std::vector<float>> buckets(BUCKET_COUNT);
    // Distribute each value into its bucket
    for (float v : arr) {
        int idx = (int)(v * BUCKET_COUNT);
        buckets[idx].push_back(v);
    }
    arr.clear();
    // Sort each bucket individually, then concatenate
    for (auto& bucket : buckets) {
        std::sort(bucket.begin(), bucket.end());
        for (float v : bucket) arr.push_back(v);
    }
}`,
    java: `// Bucket Sort — distribute into buckets, sort each, concatenate
public class BucketSort {
    static void bucketSort(float[] arr, int bucketCount) {
        List<Float>[] buckets = new List[bucketCount];
        for (int i = 0; i < bucketCount; i++) buckets[i] = new ArrayList<>();
        // Distribute each value into its bucket
        for (float v : arr) buckets[(int) (v * bucketCount)].add(v);
        int pos = 0;
        // Sort each bucket individually, then concatenate
        for (List<Float> bucket : buckets) {
            Collections.sort(bucket);
            for (float v : bucket) arr[pos++] = v;
        }
    }
}`,
  },
  'shell-sort': {
    python: `# Shell Sort — gapped insertion sort, shrinking the gap each pass
def shell_sort(arr):
    n = len(arr)
    gap = n // 2
    while gap > 0:
        # Gapped insertion sort for this gap size
        for i in range(gap, n):
            temp = arr[i]
            j = i
            # Shift elements that are gap apart and out of order
            while j >= gap and arr[j - gap] > temp:
                arr[j] = arr[j - gap]
                j -= gap
            arr[j] = temp
        gap //= 2
    return arr`,
    javascript: `// Shell Sort — gapped insertion sort, shrinking the gap each pass
function shellSort(arr) {
  const n = arr.length;
  for (let gap = Math.floor(n / 2); gap > 0; gap = Math.floor(gap / 2)) {
    // Gapped insertion sort for this gap size
    for (let i = gap; i < n; i++) {
      const temp = arr[i];
      let j = i;
      // Shift elements that are gap apart and out of order
      while (j >= gap && arr[j - gap] > temp) {
        arr[j] = arr[j - gap];
        j -= gap;
      }
      arr[j] = temp;
    }
  }
  return arr;
}`,
    c: `// Shell Sort — gapped insertion sort, shrinking the gap each pass
void shell_sort(int arr[], int n) {
    for (int gap = n / 2; gap > 0; gap /= 2) {
        // Gapped insertion sort for this gap size
        for (int i = gap; i < n; i++) {
            int temp = arr[i];
            int j = i;
            // Shift elements that are gap apart and out of order
            while (j >= gap && arr[j - gap] > temp) {
                arr[j] = arr[j - gap];
                j -= gap;
            }
            arr[j] = temp;
        }
    }
}`,
    cpp: `// Shell Sort — gapped insertion sort, shrinking the gap each pass
void shellSort(std::vector<int>& arr) {
    int n = (int)arr.size();
    for (int gap = n / 2; gap > 0; gap /= 2) {
        // Gapped insertion sort for this gap size
        for (int i = gap; i < n; i++) {
            int temp = arr[i];
            int j = i;
            // Shift elements that are gap apart and out of order
            while (j >= gap && arr[j - gap] > temp) {
                arr[j] = arr[j - gap];
                j -= gap;
            }
            arr[j] = temp;
        }
    }
}`,
    java: `// Shell Sort — gapped insertion sort, shrinking the gap each pass
public class ShellSort {
    static void shellSort(int[] arr) {
        int n = arr.length;
        for (int gap = n / 2; gap > 0; gap /= 2) {
            // Gapped insertion sort for this gap size
            for (int i = gap; i < n; i++) {
                int temp = arr[i];
                int j = i;
                // Shift elements that are gap apart and out of order
                while (j >= gap && arr[j - gap] > temp) {
                    arr[j] = arr[j - gap];
                    j -= gap;
                }
                arr[j] = temp;
            }
        }
    }
}`,
  },
  'tim-sort': {
    python: `# Tim Sort (simplified) — insertion-sort small runs, then merge them
RUN = 32
def tim_sort(arr):
    # Sort every small run with insertion sort
    for start in range(0, len(arr), RUN):
        insertion_sort_run(arr, start, min(start + RUN - 1, len(arr) - 1))
    size = RUN
    # Merge runs pairwise, doubling the merge size each pass
    while size < len(arr):
        for left in range(0, len(arr), 2 * size):
            mid = min(left + size - 1, len(arr) - 1)
            right = min(left + 2 * size - 1, len(arr) - 1)
            if mid < right:
                merge(arr, left, mid, right)
        size *= 2
    return arr`,
    javascript: `// Tim Sort (simplified) — insertion-sort small runs, then merge them
const RUN = 32;
function timSort(arr) {
  // Sort every small run with insertion sort
  for (let start = 0; start < arr.length; start += RUN) {
    insertionSortRun(arr, start, Math.min(start + RUN - 1, arr.length - 1));
  }
  let size = RUN;
  // Merge runs pairwise, doubling the merge size each pass
  while (size < arr.length) {
    for (let left = 0; left < arr.length; left += 2 * size) {
      const mid = Math.min(left + size - 1, arr.length - 1);
      const right = Math.min(left + 2 * size - 1, arr.length - 1);
      if (mid < right) merge(arr, left, mid, right);
    }
    size *= 2;
  }
  return arr;
}`,
    c: `// Tim Sort (simplified) — insertion-sort small runs, then merge them
#define RUN 32
void tim_sort(int arr[], int n) {
    // Sort every small run with insertion sort
    for (int start = 0; start < n; start += RUN) {
        int end = start + RUN - 1 < n - 1 ? start + RUN - 1 : n - 1;
        insertion_sort_run(arr, start, end);
    }
    // Merge runs pairwise, doubling the merge size each pass
    for (int size = RUN; size < n; size *= 2) {
        for (int left = 0; left < n; left += 2 * size) {
            int mid = left + size - 1 < n - 1 ? left + size - 1 : n - 1;
            int right = left + 2 * size - 1 < n - 1 ? left + 2 * size - 1 : n - 1;
            if (mid < right) merge(arr, left, mid, right);
        }
    }
}`,
    cpp: `// Tim Sort (simplified) — insertion-sort small runs, then merge them
const int RUN = 32;
void timSort(std::vector<int>& arr) {
    int n = (int)arr.size();
    // Sort every small run with insertion sort
    for (int start = 0; start < n; start += RUN) {
        insertionSortRun(arr, start, std::min(start + RUN - 1, n - 1));
    }
    // Merge runs pairwise, doubling the merge size each pass
    for (int size = RUN; size < n; size *= 2) {
        for (int left = 0; left < n; left += 2 * size) {
            int mid = std::min(left + size - 1, n - 1);
            int right = std::min(left + 2 * size - 1, n - 1);
            if (mid < right) merge(arr, left, mid, right);
        }
    }
}`,
    java: `// Tim Sort (simplified) — insertion-sort small runs, then merge them
public class TimSort {
    static final int RUN = 32;
    static void timSort(int[] arr) {
        int n = arr.length;
        // Sort every small run with insertion sort
        for (int start = 0; start < n; start += RUN) {
            insertionSortRun(arr, start, Math.min(start + RUN - 1, n - 1));
        }
        // Merge runs pairwise, doubling the merge size each pass
        for (int size = RUN; size < n; size *= 2) {
            for (int left = 0; left < n; left += 2 * size) {
                int mid = Math.min(left + size - 1, n - 1);
                int right = Math.min(left + 2 * size - 1, n - 1);
                if (mid < right) merge(arr, left, mid, right);
            }
        }
    }
}`,
  },
  'heap-sort': {
    python: `# Heap Sort — build a max heap, then repeatedly extract the maximum
def heap_sort(arr):
    n = len(arr)
    # Build max heap from array
    for i in range(n // 2 - 1, -1, -1):
        heapify(arr, n, i)
    for i in range(n - 1, 0, -1):
        # Move current root (the max) to the end
        arr[0], arr[i] = arr[i], arr[0]
        heapify(arr, i, 0)
    return arr`,
    javascript: `// Heap Sort — build a max heap, then repeatedly extract the maximum
function heapSort(arr) {
  const n = arr.length;
  // Build max heap from array
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) heapify(arr, n, i);
  for (let i = n - 1; i > 0; i--) {
    // Move current root (the max) to the end
    [arr[0], arr[i]] = [arr[i], arr[0]];
    heapify(arr, i, 0);
  }
  return arr;
}`,
    c: `// Heap Sort — build a max heap, then repeatedly extract the maximum
void heap_sort(int arr[], int n) {
    // Build max heap from array
    for (int i = n / 2 - 1; i >= 0; i--) heapify(arr, n, i);
    for (int i = n - 1; i > 0; i--) {
        // Move current root (the max) to the end
        int tmp = arr[0]; arr[0] = arr[i]; arr[i] = tmp;
        heapify(arr, i, 0);
    }
}`,
    cpp: `// Heap Sort — build a max heap, then repeatedly extract the maximum
void heapSort(std::vector<int>& arr) {
    int n = (int)arr.size();
    // Build max heap from array
    for (int i = n / 2 - 1; i >= 0; i--) heapify(arr, n, i);
    for (int i = n - 1; i > 0; i--) {
        // Move current root (the max) to the end
        std::swap(arr[0], arr[i]);
        heapify(arr, i, 0);
    }
}`,
    java: `// Heap Sort — build a max heap, then repeatedly extract the maximum
public class HeapSort {
    public static void heapSort(int[] arr) {
        int n = arr.length;
        // Build max heap from array
        for (int i = n / 2 - 1; i >= 0; i--) heapify(arr, n, i);
        for (int i = n - 1; i > 0; i--) {
            // Move current root (the max) to the end
            int tmp = arr[0]; arr[0] = arr[i]; arr[i] = tmp;
            heapify(arr, i, 0);
        }
    }
}`,
  },
};

const GRAPHS = {
  dfs: {
    python: `# DFS — explore as deep as possible before backtracking
def dfs(graph, start):
    visited = set()
    stack = [start]
    while stack:
        # Pop and visit the next node from stack
        node = stack.pop()
        if node in visited:
            continue
        visited.add(node)
        # Push unvisited neighbors onto stack
        for neighbor in graph[node]:
            if neighbor not in visited:
                stack.append(neighbor)
    return visited`,
    javascript: `// DFS — explore as deep as possible before backtracking
function dfs(graph, start) {
  const visited = new Set();
  const stack = [start];
  while (stack.length) {
    // Pop and visit the next node from stack
    const node = stack.pop();
    if (visited.has(node)) continue;
    visited.add(node);
    // Push unvisited neighbors onto stack
    for (const neighbor of graph[node] ?? []) {
      if (!visited.has(neighbor)) stack.push(neighbor);
    }
  }
  return visited;
}`,
    c: `// DFS — explore as deep as possible before backtracking
void dfs(int graph[][MAX], int n, int start, int visited[]) {
    visited[start] = 1;
    // Visit each unvisited neighbor recursively
    for (int v = 0; v < n; v++)
        if (graph[start][v] && !visited[v])
            dfs(graph, n, v, visited);
}`,
    cpp: `// DFS — explore as deep as possible before backtracking
void dfs(const std::vector<std::vector<int>>& g, int u, std::vector<bool>& vis) {
    vis[u] = true;
    // Visit each unvisited neighbor recursively
    for (int v : g[u])
        if (!vis[v]) dfs(g, v, vis);
}`,
    java: `// DFS — explore as deep as possible before backtracking
public class DFS {
    static void dfs(List<List<Integer>> g, int u, boolean[] vis) {
        vis[u] = true;
        // Visit each unvisited neighbor recursively
        for (int v : g.get(u))
            if (!vis[v]) dfs(g, v, vis);
    }
}`,
  },
  bfs: {
    python: `# BFS — explore level by level using a queue
from collections import deque

def bfs(graph, start):
    visited = {start}
    queue = deque([start])
    while queue:
        # Dequeue and visit front node
        node = queue.popleft()
        # Enqueue unvisited neighbors
        for neighbor in graph[node]:
            if neighbor not in visited:
                visited.add(neighbor)
                queue.append(neighbor)
    return visited`,
    javascript: `// BFS — explore level by level using a queue
function bfs(graph, start) {
  const visited = new Set([start]);
  const queue = [start];
  while (queue.length) {
    // Dequeue and visit front node
    const node = queue.shift();
    // Enqueue unvisited neighbors
    for (const neighbor of graph[node] ?? []) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push(neighbor);
      }
    }
  }
  return visited;
}`,
    c: `// BFS — explore level by level using a queue
void bfs(int graph[][MAX], int n, int start, int visited[]) {
    int queue[MAX], front = 0, rear = 0;
    queue[rear++] = start; visited[start] = 1;
    while (front < rear) {
        // Dequeue and visit front node
        int u = queue[front++];
        // Enqueue unvisited neighbors
        for (int v = 0; v < n; v++)
            if (graph[u][v] && !visited[v]) {
                visited[v] = 1; queue[rear++] = v;
            }
    }
}`,
    cpp: `// BFS — explore level by level using a queue
void bfs(const std::vector<std::vector<int>>& g, int start, std::vector<bool>& vis) {
    std::queue<int> q; q.push(start); vis[start] = true;
    while (!q.empty()) {
        // Dequeue and visit front node
        int u = q.front(); q.pop();
        // Enqueue unvisited neighbors
        for (int v : g[u])
            if (!vis[v]) { vis[v] = true; q.push(v); }
    }
}`,
    java: `// BFS — explore level by level using a queue
public class BFS {
    static void bfs(List<List<Integer>> g, int start, boolean[] vis) {
        Queue<Integer> q = new ArrayDeque<>();
        q.add(start); vis[start] = true;
        while (!q.isEmpty()) {
            // Dequeue and visit front node
            int u = q.poll();
            // Enqueue unvisited neighbors
            for (int v : g.get(u))
                if (!vis[v]) { vis[v] = true; q.add(v); }
        }
    }
}`,
  },
  dijkstra: {
    python: `# Dijkstra — shortest paths from source in weighted graph
import heapq

def dijkstra(graph, source):
    # Initialize all distances to infinity except source
    dist = {v: float('inf') for v in graph}
    dist[source] = 0
    pq = [(0, source)]
    while pq:
        # Extract node with minimum distance
        d, u = heapq.heappop(pq)
        if d > dist[u]: continue
        for v, w in graph[u]:
            # Relax edge if shorter path found
            if dist[u] + w < dist[v]:
                dist[v] = dist[u] + w
                heapq.heappush(pq, (dist[v], v))
    return dist`,
    javascript: `// Dijkstra — shortest paths from source in weighted graph
function dijkstra(graph, source) {
  // Initialize all distances to infinity except source
  const dist = Object.fromEntries(Object.keys(graph).map(k => [k, Infinity]));
  dist[source] = 0;
  const pq = [[0, source]];
  while (pq.length) {
    pq.sort((a, b) => a[0] - b[0]);
    // Extract node with minimum distance
    const [d, u] = pq.shift();
    if (d > dist[u]) continue;
    for (const [v, w] of graph[u] ?? []) {
      // Relax edge if shorter path found
      if (dist[u] + w < dist[v]) {
        dist[v] = dist[u] + w;
        pq.push([dist[v], v]);
      }
    }
  }
  return dist;
}`,
    c: `// Dijkstra — shortest paths from source in weighted graph
void dijkstra(int n, int edges[][3], int source, int dist[]) {
    // Initialize all distances to infinity except source
    for (int i = 0; i < n; i++) dist[i] = INT_MAX;
    dist[source] = 0;
    // Repeatedly relax edges from closest unvisited node
    for (int count = 0; count < n - 1; count++) {
        int u = min_dist_node(dist, visited, n);
        visited[u] = 1;
        // Relax all edges from u
        relax_edges(u, edges, dist);
    }
}`,
    cpp: `// Dijkstra — shortest paths from source in weighted graph
std::vector<int> dijkstra(int n, const std::vector<std::vector<std::pair<int,int>>>& g, int src) {
    // Initialize all distances to infinity except source
    std::vector<int> dist(n, INT_MAX);
    dist[src] = 0;
    using P = std::pair<int,int>;
    std::priority_queue<P, std::vector<P>, std::greater<P>> pq;
    pq.push({0, src});
    while (!pq.empty()) {
        // Extract node with minimum distance
        auto [d, u] = pq.top(); pq.pop();
        if (d > dist[u]) continue;
        for (auto [v, w] : g[u])
            // Relax edge if shorter path found
            if (dist[u] + w < dist[v]) { dist[v] = dist[u] + w; pq.push({dist[v], v}); }
    }
    return dist;
}`,
    java: `// Dijkstra — shortest paths from source in weighted graph
public class Dijkstra {
    static int[] dijkstra(int n, List<List<int[]>> g, int src) {
        // Initialize all distances to infinity except source
        int[] dist = new int[n]; java.util.Arrays.fill(dist, Integer.MAX_VALUE);
        dist[src] = 0;
        PriorityQueue<int[]> pq = new PriorityQueue<>((a,b)->a[0]-b[0]);
        pq.add(new int[]{0, src});
        while (!pq.isEmpty()) {
            // Extract node with minimum distance
            int[] cur = pq.poll(); int d = cur[0], u = cur[1];
            if (d > dist[u]) continue;
            for (int[] e : g.get(u)) {
                // Relax edge if shorter path found
                if (dist[u] + e[1] < dist[e[0]]) { dist[e[0]] = dist[u] + e[1]; pq.add(new int[]{dist[e[0]], e[0]}); }
            }
        }
        return dist;
    }
}`,
  },
  'bellman-ford': {
    python: `# Bellman-Ford — shortest paths, tolerates negative weights
def bellman_ford(edges, n, source):
    dist = [float('inf')] * n
    dist[source] = 0
    # Relax every edge V - 1 times
    for _ in range(n - 1):
        for u, v, w in edges:
            # Relax edge if a shorter path is found
            if dist[u] + w < dist[v]:
                dist[v] = dist[u] + w
    return dist`,
    javascript: `// Bellman-Ford — shortest paths, tolerates negative weights
function bellmanFord(edges, n, source) {
  const dist = new Array(n).fill(Infinity);
  dist[source] = 0;
  // Relax every edge V - 1 times
  for (let i = 0; i < n - 1; i++) {
    for (const [u, v, w] of edges) {
      // Relax edge if a shorter path is found
      if (dist[u] + w < dist[v]) dist[v] = dist[u] + w;
    }
  }
  return dist;
}`,
    c: `// Bellman-Ford — shortest paths, tolerates negative weights
void bellman_ford(Edge edges[], int m, int n, int source, int dist[]) {
    for (int i = 0; i < n; i++) dist[i] = INT_MAX;
    dist[source] = 0;
    // Relax every edge V - 1 times
    for (int i = 0; i < n - 1; i++) {
        for (int j = 0; j < m; j++) {
            // Relax edge if a shorter path is found
            if (dist[edges[j].u] + edges[j].w < dist[edges[j].v])
                dist[edges[j].v] = dist[edges[j].u] + edges[j].w;
        }
    }
}`,
    cpp: `// Bellman-Ford — shortest paths, tolerates negative weights
std::vector<int> bellmanFord(std::vector<std::array<int,3>>& edges, int n, int source) {
    std::vector<int> dist(n, INT_MAX);
    dist[source] = 0;
    // Relax every edge V - 1 times
    for (int i = 0; i < n - 1; i++) {
        for (auto& [u, v, w] : edges) {
            // Relax edge if a shorter path is found
            if (dist[u] != INT_MAX && dist[u] + w < dist[v]) dist[v] = dist[u] + w;
        }
    }
    return dist;
}`,
    java: `// Bellman-Ford — shortest paths, tolerates negative weights
public class BellmanFord {
    static int[] bellmanFord(int[][] edges, int n, int source) {
        int[] dist = new int[n]; java.util.Arrays.fill(dist, Integer.MAX_VALUE);
        dist[source] = 0;
        // Relax every edge V - 1 times
        for (int i = 0; i < n - 1; i++) {
            for (int[] e : edges) {
                // Relax edge if a shorter path is found
                if (dist[e[0]] != Integer.MAX_VALUE && dist[e[0]] + e[2] < dist[e[1]]) dist[e[1]] = dist[e[0]] + e[2];
            }
        }
        return dist;
    }
}`,
  },
  'floyd-warshall': {
    python: `# Floyd-Warshall — all-pairs shortest paths via intermediate nodes
def floyd_warshall(dist, n):
    # Try every node k as an intermediate point
    for k in range(n):
        for i in range(n):
            for j in range(n):
                # Relax path i -> j through intermediate k
                if dist[i][k] + dist[k][j] < dist[i][j]:
                    dist[i][j] = dist[i][k] + dist[k][j]
    return dist`,
    javascript: `// Floyd-Warshall — all-pairs shortest paths via intermediate nodes
function floydWarshall(dist, n) {
  // Try every node k as an intermediate point
  for (let k = 0; k < n; k++) {
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        // Relax path i -> j through intermediate k
        if (dist[i][k] + dist[k][j] < dist[i][j]) dist[i][j] = dist[i][k] + dist[k][j];
      }
    }
  }
  return dist;
}`,
    c: `// Floyd-Warshall — all-pairs shortest paths via intermediate nodes
void floyd_warshall(int dist[][MAXN], int n) {
    // Try every node k as an intermediate point
    for (int k = 0; k < n; k++)
        for (int i = 0; i < n; i++)
            for (int j = 0; j < n; j++)
                // Relax path i -> j through intermediate k
                if (dist[i][k] + dist[k][j] < dist[i][j])
                    dist[i][j] = dist[i][k] + dist[k][j];
}`,
    cpp: `// Floyd-Warshall — all-pairs shortest paths via intermediate nodes
void floydWarshall(std::vector<std::vector<int>>& dist, int n) {
    // Try every node k as an intermediate point
    for (int k = 0; k < n; k++)
        for (int i = 0; i < n; i++)
            for (int j = 0; j < n; j++)
                // Relax path i -> j through intermediate k
                if (dist[i][k] + dist[k][j] < dist[i][j])
                    dist[i][j] = dist[i][k] + dist[k][j];
}`,
    java: `// Floyd-Warshall — all-pairs shortest paths via intermediate nodes
public class FloydWarshall {
    static void floydWarshall(int[][] dist, int n) {
        // Try every node k as an intermediate point
        for (int k = 0; k < n; k++)
            for (int i = 0; i < n; i++)
                for (int j = 0; j < n; j++)
                    // Relax path i -> j through intermediate k
                    if (dist[i][k] + dist[k][j] < dist[i][j])
                        dist[i][j] = dist[i][k] + dist[k][j];
    }
}`,
  },
  prim: {
    python: `# Prim's Algorithm — grow a minimum spanning tree from a start node
def prim(graph, start):
    in_mst = {start}
    mst_edges = []
    # Repeat until every node is in the tree
    while len(in_mst) < len(graph):
        # Find the cheapest edge crossing the MST boundary
        best = min_crossing_edge(graph, in_mst)
        mst_edges.append(best)
        in_mst.add(best.other_endpoint)
    return mst_edges`,
    javascript: `// Prim's Algorithm — grow a minimum spanning tree from a start node
function prim(graph, start) {
  const inMst = new Set([start]);
  const mstEdges = [];
  // Repeat until every node is in the tree
  while (inMst.size < graph.nodeCount) {
    // Find the cheapest edge crossing the MST boundary
    const best = minCrossingEdge(graph, inMst);
    mstEdges.push(best);
    inMst.add(best.otherEndpoint);
  }
  return mstEdges;
}`,
    c: `// Prim's Algorithm — grow a minimum spanning tree from a start node
void prim(Graph* g, int start, Edge mst[]) {
    bool inMst[MAXN] = {false};
    inMst[start] = true;
    int count = 0;
    // Repeat until every node is in the tree
    while (count < g->n - 1) {
        // Find the cheapest edge crossing the MST boundary
        Edge best = min_crossing_edge(g, inMst);
        mst[count++] = best;
        inMst[best.to] = true;
    }
}`,
    cpp: `// Prim's Algorithm — grow a minimum spanning tree from a start node
std::vector<Edge> prim(Graph& g, int start) {
    std::vector<bool> inMst(g.n, false);
    inMst[start] = true;
    std::vector<Edge> mstEdges;
    // Repeat until every node is in the tree
    while ((int)mstEdges.size() < g.n - 1) {
        // Find the cheapest edge crossing the MST boundary
        Edge best = minCrossingEdge(g, inMst);
        mstEdges.push_back(best);
        inMst[best.to] = true;
    }
    return mstEdges;
}`,
    java: `// Prim's Algorithm — grow a minimum spanning tree from a start node
public class Prim {
    static List<Edge> prim(Graph g, int start) {
        boolean[] inMst = new boolean[g.n];
        inMst[start] = true;
        List<Edge> mstEdges = new ArrayList<>();
        // Repeat until every node is in the tree
        while (mstEdges.size() < g.n - 1) {
            // Find the cheapest edge crossing the MST boundary
            Edge best = minCrossingEdge(g, inMst);
            mstEdges.add(best);
            inMst[best.to] = true;
        }
        return mstEdges;
    }
}`,
  },
  kruskal: {
    python: `# Kruskal's Algorithm — add cheapest edges that don't form a cycle
def kruskal(edges, n):
    edges.sort(key=lambda e: e.weight)
    parent = list(range(n))
    mst_edges = []
    # Consider edges from cheapest to most expensive
    for e in edges:
        # Only add the edge if it connects two different sets
        if find(parent, e.u) != find(parent, e.v):
            union(parent, e.u, e.v)
            mst_edges.append(e)
    return mst_edges`,
    javascript: `// Kruskal's Algorithm — add cheapest edges that don't form a cycle
function kruskal(edges, n) {
  edges.sort((a, b) => a.weight - b.weight);
  const parent = Array.from({ length: n }, (_, i) => i);
  const mstEdges = [];
  // Consider edges from cheapest to most expensive
  for (const e of edges) {
    // Only add the edge if it connects two different sets
    if (find(parent, e.u) !== find(parent, e.v)) {
      union(parent, e.u, e.v);
      mstEdges.push(e);
    }
  }
  return mstEdges;
}`,
    c: `// Kruskal's Algorithm — add cheapest edges that don't form a cycle
void kruskal(Edge edges[], int m, int n, Edge mst[]) {
    qsort(edges, m, sizeof(Edge), compare_weight);
    int parent[MAXN];
    for (int i = 0; i < n; i++) parent[i] = i;
    int count = 0;
    // Consider edges from cheapest to most expensive
    for (int i = 0; i < m; i++) {
        // Only add the edge if it connects two different sets
        if (find(parent, edges[i].u) != find(parent, edges[i].v)) {
            union_sets(parent, edges[i].u, edges[i].v);
            mst[count++] = edges[i];
        }
    }
}`,
    cpp: `// Kruskal's Algorithm — add cheapest edges that don't form a cycle
std::vector<Edge> kruskal(std::vector<Edge>& edges, int n) {
    std::sort(edges.begin(), edges.end(), [](Edge& a, Edge& b) { return a.weight < b.weight; });
    std::vector<int> parent(n);
    std::iota(parent.begin(), parent.end(), 0);
    std::vector<Edge> mstEdges;
    // Consider edges from cheapest to most expensive
    for (auto& e : edges) {
        // Only add the edge if it connects two different sets
        if (find(parent, e.u) != find(parent, e.v)) {
            unite(parent, e.u, e.v);
            mstEdges.push_back(e);
        }
    }
    return mstEdges;
}`,
    java: `// Kruskal's Algorithm — add cheapest edges that don't form a cycle
public class Kruskal {
    static List<Edge> kruskal(List<Edge> edges, int n) {
        edges.sort((a, b) -> a.weight - b.weight);
        int[] parent = new int[n];
        for (int i = 0; i < n; i++) parent[i] = i;
        List<Edge> mstEdges = new ArrayList<>();
        // Consider edges from cheapest to most expensive
        for (Edge e : edges) {
            // Only add the edge if it connects two different sets
            if (find(parent, e.u) != find(parent, e.v)) {
                union(parent, e.u, e.v);
                mstEdges.add(e);
            }
        }
        return mstEdges;
    }
}`,
  },
  'a-star': {
    python: `# A* Search — best-first search guided by cost + heuristic
def a_star(graph, start, goal, heuristic):
    open_set = {start}
    g_score = {start: 0}
    came_from = {}
    # Explore the most promising node first
    while open_set:
        current = min(open_set, key=lambda n: g_score[n] + heuristic[n])
        if current == goal:
            return reconstruct_path(came_from, current)
        open_set.remove(current)
        # Relax each neighbor via the current node
        for neighbor, weight in graph[current]:
            tentative = g_score[current] + weight
            if tentative < g_score.get(neighbor, float('inf')):
                came_from[neighbor] = current
                g_score[neighbor] = tentative
                open_set.add(neighbor)
    return None`,
    javascript: `// A* Search — best-first search guided by cost + heuristic
function aStar(graph, start, goal, heuristic) {
  const openSet = new Set([start]);
  const gScore = { [start]: 0 };
  const cameFrom = {};
  // Explore the most promising node first
  while (openSet.size) {
    const current = [...openSet].reduce((a, b) => (gScore[a] + heuristic[a] < gScore[b] + heuristic[b] ? a : b));
    if (current === goal) return reconstructPath(cameFrom, current);
    openSet.delete(current);
    // Relax each neighbor via the current node
    for (const [neighbor, weight] of graph[current]) {
      const tentative = gScore[current] + weight;
      if (tentative < (gScore[neighbor] ?? Infinity)) {
        cameFrom[neighbor] = current;
        gScore[neighbor] = tentative;
        openSet.add(neighbor);
      }
    }
  }
  return null;
}`,
    c: `// A* Search — best-first search guided by cost + heuristic
Path a_star(Graph* g, int start, int goal, int heuristic[]) {
    int gScore[MAXN]; for (int i=0;i<g->n;i++) gScore[i]=INT_MAX; gScore[start]=0;
    bool inOpen[MAXN] = {false}; inOpen[start] = true;
    // Explore the most promising node first
    while (any_open(inOpen, g->n)) {
        int current = lowest_f_score(inOpen, gScore, heuristic, g->n);
        if (current == goal) return reconstruct_path(current);
        inOpen[current] = false;
        // Relax each neighbor via the current node
        relax_neighbors(g, current, gScore, inOpen);
    }
    return no_path();
}`,
    cpp: `// A* Search — best-first search guided by cost + heuristic
std::vector<int> aStar(Graph& g, int start, int goal, std::vector<int>& heuristic) {
    std::vector<int> gScore(g.n, INT_MAX);
    gScore[start] = 0;
    std::set<int> openSet{start};
    std::map<int,int> cameFrom;
    // Explore the most promising node first
    while (!openSet.empty()) {
        int current = *std::min_element(openSet.begin(), openSet.end(), [&](int a, int b) {
            return gScore[a] + heuristic[a] < gScore[b] + heuristic[b];
        });
        if (current == goal) return reconstructPath(cameFrom, current);
        openSet.erase(current);
        // Relax each neighbor via the current node
        relaxNeighbors(g, current, gScore, cameFrom, openSet);
    }
    return {};
}`,
    java: `// A* Search — best-first search guided by cost + heuristic
public class AStar {
    static List<Integer> aStar(Graph g, int start, int goal, int[] heuristic) {
        int[] gScore = new int[g.n]; java.util.Arrays.fill(gScore, Integer.MAX_VALUE); gScore[start] = 0;
        Set<Integer> openSet = new HashSet<>(List.of(start));
        Map<Integer,Integer> cameFrom = new HashMap<>();
        // Explore the most promising node first
        while (!openSet.isEmpty()) {
            int current = openSet.stream().min(Comparator.comparingInt(n -> gScore[n] + heuristic[n])).get();
            if (current == goal) return reconstructPath(cameFrom, current);
            openSet.remove(current);
            // Relax each neighbor via the current node
            relaxNeighbors(g, current, gScore, cameFrom, openSet);
        }
        return null;
    }
}`,
  },
  'topological-sort': {
    python: `# Topological Sort (Kahn's algorithm) — order respecting dependencies
def topological_sort(graph, n):
    indegree = compute_indegree(graph, n)
    queue = [v for v in range(n) if indegree[v] == 0]
    order = []
    # Repeatedly remove a node with no remaining dependencies
    while queue:
        node = queue.pop(0)
        order.append(node)
        # Removing node frees up its neighbors
        for neighbor in graph[node]:
            indegree[neighbor] -= 1
            if indegree[neighbor] == 0:
                queue.append(neighbor)
    return order`,
    javascript: `// Topological Sort (Kahn's algorithm) — order respecting dependencies
function topologicalSort(graph, n) {
  const indegree = computeIndegree(graph, n);
  const queue = [...Array(n).keys()].filter((v) => indegree[v] === 0);
  const order = [];
  // Repeatedly remove a node with no remaining dependencies
  while (queue.length) {
    const node = queue.shift();
    order.push(node);
    // Removing node frees up its neighbors
    for (const neighbor of graph[node]) {
      indegree[neighbor]--;
      if (indegree[neighbor] === 0) queue.push(neighbor);
    }
  }
  return order;
}`,
    c: `// Topological Sort (Kahn's algorithm) — order respecting dependencies
void topological_sort(Graph* g, int order[]) {
    int indegree[MAXN]; compute_indegree(g, indegree);
    Queue q = make_queue_of_zero_indegree(g, indegree);
    int count = 0;
    // Repeatedly remove a node with no remaining dependencies
    while (!queue_empty(&q)) {
        int node = dequeue(&q);
        order[count++] = node;
        // Removing node frees up its neighbors
        for (int i = 0; i < g->adjCount[node]; i++) {
            int neighbor = g->adj[node][i];
            if (--indegree[neighbor] == 0) enqueue(&q, neighbor);
        }
    }
}`,
    cpp: `// Topological Sort (Kahn's algorithm) — order respecting dependencies
std::vector<int> topologicalSort(Graph& g, int n) {
    std::vector<int> indegree = computeIndegree(g, n);
    std::queue<int> q;
    for (int v = 0; v < n; v++) if (indegree[v] == 0) q.push(v);
    std::vector<int> order;
    // Repeatedly remove a node with no remaining dependencies
    while (!q.empty()) {
        int node = q.front(); q.pop();
        order.push_back(node);
        // Removing node frees up its neighbors
        for (int neighbor : g.adj[node]) {
            if (--indegree[neighbor] == 0) q.push(neighbor);
        }
    }
    return order;
}`,
    java: `// Topological Sort (Kahn's algorithm) — order respecting dependencies
public class TopologicalSort {
    static List<Integer> topologicalSort(Graph g, int n) {
        int[] indegree = computeIndegree(g, n);
        Queue<Integer> queue = new LinkedList<>();
        for (int v = 0; v < n; v++) if (indegree[v] == 0) queue.add(v);
        List<Integer> order = new ArrayList<>();
        // Repeatedly remove a node with no remaining dependencies
        while (!queue.isEmpty()) {
            int node = queue.poll();
            order.add(node);
            // Removing node frees up its neighbors
            for (int neighbor : g.adj(node)) {
                if (--indegree[neighbor] == 0) queue.add(neighbor);
            }
        }
        return order;
    }
}`,
  },
  'union-find': {
    python: `# Union-Find (Disjoint Set) — track connected components with path compression
def find(parent, x):
    if parent[x] != x:
        parent[x] = find(parent, parent[x])
    return parent[x]

def union(parent, a, b):
    root_a, root_b = find(parent, a), find(parent, b)
    # Only merge if they are in different sets
    if root_a != root_b:
        parent[root_a] = root_b

def process_edges(edges, parent):
    for u, v in edges:
        if find(parent, u) != find(parent, v):
            union(parent, u, v)`,
    javascript: `// Union-Find (Disjoint Set) — track connected components with path compression
function find(parent, x) {
  if (parent[x] !== x) parent[x] = find(parent, parent[x]);
  return parent[x];
}

function union(parent, a, b) {
  const rootA = find(parent, a), rootB = find(parent, b);
  // Only merge if they are in different sets
  if (rootA !== rootB) parent[rootA] = rootB;
}

function processEdges(edges, parent) {
  for (const [u, v] of edges) {
    if (find(parent, u) !== find(parent, v)) union(parent, u, v);
  }
}`,
    c: `// Union-Find (Disjoint Set) — track connected components with path compression
int find(int parent[], int x) {
    if (parent[x] != x) parent[x] = find(parent, parent[x]);
    return parent[x];
}
void union_sets(int parent[], int a, int b) {
    int rootA = find(parent, a), rootB = find(parent, b);
    // Only merge if they are in different sets
    if (rootA != rootB) parent[rootA] = rootB;
}
void process_edges(Edge edges[], int m, int parent[]) {
    for (int i = 0; i < m; i++)
        if (find(parent, edges[i].u) != find(parent, edges[i].v))
            union_sets(parent, edges[i].u, edges[i].v);
}`,
    cpp: `// Union-Find (Disjoint Set) — track connected components with path compression
int find(std::vector<int>& parent, int x) {
    if (parent[x] != x) parent[x] = find(parent, parent[x]);
    return parent[x];
}
void unite(std::vector<int>& parent, int a, int b) {
    int rootA = find(parent, a), rootB = find(parent, b);
    // Only merge if they are in different sets
    if (rootA != rootB) parent[rootA] = rootB;
}
void processEdges(std::vector<Edge>& edges, std::vector<int>& parent) {
    for (auto& e : edges)
        if (find(parent, e.u) != find(parent, e.v)) unite(parent, e.u, e.v);
}`,
    java: `// Union-Find (Disjoint Set) — track connected components with path compression
public class UnionFind {
    static int find(int[] parent, int x) {
        if (parent[x] != x) parent[x] = find(parent, parent[x]);
        return parent[x];
    }
    static void union(int[] parent, int a, int b) {
        int rootA = find(parent, a), rootB = find(parent, b);
        // Only merge if they are in different sets
        if (rootA != rootB) parent[rootA] = rootB;
    }
    static void processEdges(int[][] edges, int[] parent) {
        for (int[] e : edges)
            if (find(parent, e[0]) != find(parent, e[1])) union(parent, e[0], e[1]);
    }
}`,
  },
  'scc-kosaraju': {
    python: `# Kosaraju's Algorithm — two-pass DFS to find strongly connected components
def kosaraju(graph, n):
    visited = [False] * n
    finish_stack = []
    # Pass 1: DFS on the original graph, record finish order
    for node in range(n):
        if not visited[node]:
            dfs1(graph, node, visited, finish_stack)
    transposed = reverse_edges(graph)
    visited2 = [False] * n
    components = []
    # Pass 2: DFS on the transposed graph in reverse finish order
    while finish_stack:
        node = finish_stack.pop()
        if not visited2[node]:
            component = dfs2(transposed, node, visited2)
            components.append(component)
    return components`,
    javascript: `// Kosaraju's Algorithm — two-pass DFS to find strongly connected components
function kosaraju(graph, n) {
  const visited = new Array(n).fill(false);
  const finishStack = [];
  // Pass 1: DFS on the original graph, record finish order
  for (let node = 0; node < n; node++) {
    if (!visited[node]) dfs1(graph, node, visited, finishStack);
  }
  const transposed = reverseEdges(graph);
  const visited2 = new Array(n).fill(false);
  const components = [];
  // Pass 2: DFS on the transposed graph in reverse finish order
  while (finishStack.length) {
    const node = finishStack.pop();
    if (!visited2[node]) components.push(dfs2(transposed, node, visited2));
  }
  return components;
}`,
    c: `// Kosaraju's Algorithm — two-pass DFS to find strongly connected components
void kosaraju(Graph* g, int components[][MAXN], int* compCount) {
    bool visited[MAXN] = {false};
    int finishStack[MAXN], top = 0;
    // Pass 1: DFS on the original graph, record finish order
    for (int node = 0; node < g->n; node++)
        if (!visited[node]) dfs1(g, node, visited, finishStack, &top);
    Graph transposed = reverse_edges(g);
    bool visited2[MAXN] = {false};
    // Pass 2: DFS on the transposed graph in reverse finish order
    while (top > 0) {
        int node = finishStack[--top];
        if (!visited2[node]) dfs2(&transposed, node, visited2, components[(*compCount)++]);
    }
}`,
    cpp: `// Kosaraju's Algorithm — two-pass DFS to find strongly connected components
std::vector<std::vector<int>> kosaraju(Graph& g, int n) {
    std::vector<bool> visited(n, false);
    std::vector<int> finishStack;
    // Pass 1: DFS on the original graph, record finish order
    for (int node = 0; node < n; node++)
        if (!visited[node]) dfs1(g, node, visited, finishStack);
    Graph transposed = reverseEdges(g);
    std::vector<bool> visited2(n, false);
    std::vector<std::vector<int>> components;
    // Pass 2: DFS on the transposed graph in reverse finish order
    while (!finishStack.empty()) {
        int node = finishStack.back(); finishStack.pop_back();
        if (!visited2[node]) components.push_back(dfs2(transposed, node, visited2));
    }
    return components;
}`,
    java: `// Kosaraju's Algorithm — two-pass DFS to find strongly connected components
public class Kosaraju {
    static List<List<Integer>> kosaraju(Graph g, int n) {
        boolean[] visited = new boolean[n];
        Deque<Integer> finishStack = new ArrayDeque<>();
        // Pass 1: DFS on the original graph, record finish order
        for (int node = 0; node < n; node++)
            if (!visited[node]) dfs1(g, node, visited, finishStack);
        Graph transposed = reverseEdges(g);
        boolean[] visited2 = new boolean[n];
        List<List<Integer>> components = new ArrayList<>();
        // Pass 2: DFS on the transposed graph in reverse finish order
        while (!finishStack.isEmpty()) {
            int node = finishStack.pop();
            if (!visited2[node]) components.add(dfs2(transposed, node, visited2));
        }
        return components;
    }
}`,
  },
  'bridges-tarjan': {
    python: `# Tarjan's Bridge-Finding — DFS with discovery and low-link values
def find_bridges(graph, n):
    disc = [-1] * n
    low = [0] * n
    bridges = []
    timer = [0]

    def dfs(u, parent_edge):
        disc[u] = low[u] = timer[0]; timer[0] += 1
        for v, edge_id in graph[u]:
            if edge_id == parent_edge:
                continue
            if disc[v] == -1:
                dfs(v, edge_id)
                low[u] = min(low[u], low[v])
                # No back edge from v's subtree reaches u or above
                if low[v] > disc[u]:
                    bridges.append((u, v))
            else:
                low[u] = min(low[u], disc[v])

    for node in range(n):
        if disc[node] == -1:
            dfs(node, -1)
    return bridges`,
    javascript: `// Tarjan's Bridge-Finding — DFS with discovery and low-link values
function findBridges(graph, n) {
  const disc = new Array(n).fill(-1);
  const low = new Array(n).fill(0);
  const bridges = [];
  let timer = 0;

  function dfs(u, parentEdge) {
    disc[u] = low[u] = timer++;
    for (const [v, edgeId] of graph[u]) {
      if (edgeId === parentEdge) continue;
      if (disc[v] === -1) {
        dfs(v, edgeId);
        low[u] = Math.min(low[u], low[v]);
        // No back edge from v's subtree reaches u or above
        if (low[v] > disc[u]) bridges.push([u, v]);
      } else {
        low[u] = Math.min(low[u], disc[v]);
      }
    }
  }

  for (let node = 0; node < n; node++) if (disc[node] === -1) dfs(node, -1);
  return bridges;
}`,
    c: `// Tarjan's Bridge-Finding — DFS with discovery and low-link values
void dfs_bridges(Graph* g, int u, int parentEdge, int disc[], int low[], int* timer, Edge bridges[], int* bcount) {
    disc[u] = low[u] = (*timer)++;
    for (int i = 0; i < g->adjCount[u]; i++) {
        int v = g->adj[u][i], edgeId = g->edgeId[u][i];
        if (edgeId == parentEdge) continue;
        if (disc[v] == -1) {
            dfs_bridges(g, v, edgeId, disc, low, timer, bridges, bcount);
            low[u] = MIN(low[u], low[v]);
            // No back edge from v's subtree reaches u or above
            if (low[v] > disc[u]) bridges[(*bcount)++] = (Edge){u, v};
        } else {
            low[u] = MIN(low[u], disc[v]);
        }
    }
}`,
    cpp: `// Tarjan's Bridge-Finding — DFS with discovery and low-link values
void dfsBridges(Graph& g, int u, int parentEdge, std::vector<int>& disc, std::vector<int>& low, int& timer, std::vector<Edge>& bridges) {
    disc[u] = low[u] = timer++;
    for (auto& [v, edgeId] : g.adj[u]) {
        if (edgeId == parentEdge) continue;
        if (disc[v] == -1) {
            dfsBridges(g, v, edgeId, disc, low, timer, bridges);
            low[u] = std::min(low[u], low[v]);
            // No back edge from v's subtree reaches u or above
            if (low[v] > disc[u]) bridges.push_back({u, v});
        } else {
            low[u] = std::min(low[u], disc[v]);
        }
    }
}`,
    java: `// Tarjan's Bridge-Finding — DFS with discovery and low-link values
public class TarjanBridges {
    static void dfs(Graph g, int u, int parentEdge, int[] disc, int[] low, int[] timer, List<int[]> bridges) {
        disc[u] = low[u] = timer[0]++;
        for (int[] edge : g.adj(u)) {
            int v = edge[0], edgeId = edge[1];
            if (edgeId == parentEdge) continue;
            if (disc[v] == -1) {
                dfs(g, v, edgeId, disc, low, timer, bridges);
                low[u] = Math.min(low[u], low[v]);
                // No back edge from v's subtree reaches u or above
                if (low[v] > disc[u]) bridges.add(new int[]{u, v});
            } else {
                low[u] = Math.min(low[u], disc[v]);
            }
        }
    }
}`,
  },
  'articulation-points': {
    python: `# Tarjan's Articulation Points — DFS with discovery and low-link values
def find_articulation_points(graph, n):
    disc = [-1] * n
    low = [0] * n
    ap = set()
    timer = [0]

    def dfs(u, parent):
        disc[u] = low[u] = timer[0]; timer[0] += 1
        children = 0
        for v in graph[u]:
            if v == parent:
                continue
            if disc[v] == -1:
                children += 1
                dfs(v, u)
                low[u] = min(low[u], low[v])
                # v cannot reach above u without going through u
                if parent is not None and low[v] >= disc[u]:
                    ap.add(u)
            else:
                low[u] = min(low[u], disc[v])
        if parent is None and children > 1:
            ap.add(u)

    for node in range(n):
        if disc[node] == -1:
            dfs(node, None)
    return ap`,
    javascript: `// Tarjan's Articulation Points — DFS with discovery and low-link values
function findArticulationPoints(graph, n) {
  const disc = new Array(n).fill(-1);
  const low = new Array(n).fill(0);
  const ap = new Set();
  let timer = 0;

  function dfs(u, parent) {
    disc[u] = low[u] = timer++;
    let children = 0;
    for (const v of graph[u]) {
      if (v === parent) continue;
      if (disc[v] === -1) {
        children++;
        dfs(v, u);
        low[u] = Math.min(low[u], low[v]);
        // v cannot reach above u without going through u
        if (parent !== null && low[v] >= disc[u]) ap.add(u);
      } else {
        low[u] = Math.min(low[u], disc[v]);
      }
    }
    if (parent === null && children > 1) ap.add(u);
  }

  for (let node = 0; node < n; node++) if (disc[node] === -1) dfs(node, null);
  return ap;
}`,
    c: `// Tarjan's Articulation Points — DFS with discovery and low-link values
void dfs_ap(Graph* g, int u, int parent, int disc[], int low[], int* timer, bool ap[]) {
    disc[u] = low[u] = (*timer)++;
    int children = 0;
    for (int i = 0; i < g->adjCount[u]; i++) {
        int v = g->adj[u][i];
        if (v == parent) continue;
        if (disc[v] == -1) {
            children++;
            dfs_ap(g, v, u, disc, low, timer, ap);
            low[u] = MIN(low[u], low[v]);
            // v cannot reach above u without going through u
            if (parent != -1 && low[v] >= disc[u]) ap[u] = true;
        } else {
            low[u] = MIN(low[u], disc[v]);
        }
    }
    if (parent == -1 && children > 1) ap[u] = true;
}`,
    cpp: `// Tarjan's Articulation Points — DFS with discovery and low-link values
void dfsAP(Graph& g, int u, int parent, std::vector<int>& disc, std::vector<int>& low, int& timer, std::set<int>& ap) {
    disc[u] = low[u] = timer++;
    int children = 0;
    for (int v : g.adj[u]) {
        if (v == parent) continue;
        if (disc[v] == -1) {
            children++;
            dfsAP(g, v, u, disc, low, timer, ap);
            low[u] = std::min(low[u], low[v]);
            // v cannot reach above u without going through u
            if (parent != -1 && low[v] >= disc[u]) ap.insert(u);
        } else {
            low[u] = std::min(low[u], disc[v]);
        }
    }
    if (parent == -1 && children > 1) ap.insert(u);
}`,
    java: `// Tarjan's Articulation Points — DFS with discovery and low-link values
public class ArticulationPoints {
    static void dfs(Graph g, int u, int parent, int[] disc, int[] low, int[] timer, Set<Integer> ap) {
        disc[u] = low[u] = timer[0]++;
        int children = 0;
        for (int v : g.adj(u)) {
            if (v == parent) continue;
            if (disc[v] == -1) {
                children++;
                dfs(g, v, u, disc, low, timer, ap);
                low[u] = Math.min(low[u], low[v]);
                // v cannot reach above u without going through u
                if (parent != -1 && low[v] >= disc[u]) ap.add(u);
            } else {
                low[u] = Math.min(low[u], disc[v]);
            }
        }
        if (parent == -1 && children > 1) ap.add(u);
    }
}`,
  },
};

const TREES = {
  'bst-insert': {
    python: `# BST Insert — maintain left < node < right ordering
class Node:
    def __init__(self, val):
        self.val = val; self.left = self.right = None

def insert(root, val):
    # Base case: create new node at empty position
    if not root: return Node(val)
    # Recurse left if value is smaller
    if val < root.val: root.left = insert(root.left, val)
    # Recurse right if value is larger
    elif val > root.val: root.right = insert(root.right, val)
    return root`,
    javascript: `// BST Insert — maintain left < node < right ordering
class Node { constructor(val) { this.val = val; this.left = this.right = null; } }

function insert(root, val) {
  // Base case: create new node at empty position
  if (!root) return new Node(val);
  // Recurse left if value is smaller
  if (val < root.val) root.left = insert(root.left, val);
  // Recurse right if value is larger
  else if (val > root.val) root.right = insert(root.right, val);
  return root;
}`,
    c: `// BST Insert — maintain left < node < right ordering
struct Node { int val; struct Node *left, *right; };

struct Node* insert(struct Node* root, int val) {
    // Base case: create new node at empty position
    if (!root) return new_node(val);
    // Recurse left if value is smaller
    if (val < root->val) root->left = insert(root->left, val);
    // Recurse right if value is larger
    else if (val > root->val) root->right = insert(root->right, val);
    return root;
}`,
    cpp: `// BST Insert — maintain left < node < right ordering
struct Node { int val; Node *left, *right; };

Node* insert(Node* root, int val) {
    // Base case: create new node at empty position
    if (!root) return new Node{val, nullptr, nullptr};
    // Recurse left if value is smaller
    if (val < root->val) root->left = insert(root->left, val);
    // Recurse right if value is larger
    else if (val > root->val) root->right = insert(root->right, val);
    return root;
}`,
    java: `// BST Insert — maintain left < node < right ordering
class Node { int val; Node left, right; Node(int v){val=v;} }

class BSTInsert {
    static Node insert(Node root, int val) {
        // Base case: create new node at empty position
        if (root == null) return new Node(val);
        // Recurse left if value is smaller
        if (val < root.val) root.left = insert(root.left, val);
        // Recurse right if value is larger
        else if (val > root.val) root.right = insert(root.right, val);
        return root;
    }
}`,
  },
  'avl-insert': {
    python: `# AVL Tree — insert then rebalance if needed
def avl_insert(node, val):
    # Standard BST insert
    if not node: return Node(val)
    if val < node.val: node.left = avl_insert(node.left, val)
    else: node.right = avl_insert(node.right, val)
    # Update height and balance factor
    balance = height(node.left) - height(node.right)
    # Perform rotation to restore balance
    if balance > 1: return rotate_right(node)
    if balance < -1: return rotate_left(node)
    return node`,
    javascript: `// AVL Tree — insert then rebalance if needed
function avlInsert(node, val) {
  // Standard BST insert
  if (!node) return new Node(val);
  if (val < node.val) node.left = avlInsert(node.left, val);
  else node.right = avlInsert(node.right, val);
  // Update height and balance factor
  const balance = height(node.left) - height(node.right);
  // Perform rotation to restore balance
  if (balance > 1) return rotateRight(node);
  if (balance < -1) return rotateLeft(node);
  return node;
}`,
    c: `// AVL Tree — insert then rebalance if needed
struct Node* avl_insert(struct Node* node, int val) {
    // Standard BST insert
    if (!node) return new_node(val);
    if (val < node->val) node->left = avl_insert(node->left, val);
    else node->right = avl_insert(node->right, val);
    // Update height and balance factor
    int balance = height(node->left) - height(node->right);
    // Perform rotation to restore balance
    if (balance > 1) return rotate_right(node);
    if (balance < -1) return rotate_left(node);
    return node;
}`,
    cpp: `// AVL Tree — insert then rebalance if needed
Node* avlInsert(Node* node, int val) {
    // Standard BST insert
    if (!node) return new Node{val, nullptr, nullptr};
    if (val < node->val) node->left = avlInsert(node->left, val);
    else node->right = avlInsert(node->right, val);
    // Update height and balance factor
    int balance = height(node->left) - height(node->right);
    // Perform rotation to restore balance
    if (balance > 1) return rotateRight(node);
    if (balance < -1) return rotateLeft(node);
    return node;
}`,
    java: `// AVL Tree — insert then rebalance if needed
public class AVLInsert {
    static Node insert(Node node, int val) {
        // Standard BST insert
        if (node == null) return new Node(val);
        if (val < node.val) node.left = insert(node.left, val);
        else node.right = insert(node.right, val);
        // Update height and balance factor
        int balance = height(node.left) - height(node.right);
        // Perform rotation to restore balance
        if (balance > 1) return rotateRight(node);
        if (balance < -1) return rotateLeft(node);
        return node;
    }
}`,
  },
  'trie-insert': {
    python: `# Trie — insert word character by character
def trie_insert(root, word):
    node = root
    for char in word:
        # Move to child or create new node
        if char not in node.children:
            node.children[char] = TrieNode()
        node = node.children[char]
    # Mark end of word
    node.is_end_of_word = True`,
    javascript: `// Trie — insert word character by character
function trieInsert(root, word) {
  let node = root;
  for (const char of word) {
    // Move to child or create new node
    if (!node.children[char]) node.children[char] = new TrieNode();
    node = node.children[char];
  }
  // Mark end of word
  node.isEndOfWord = true;
}`,
    c: `// Trie — insert word character by character
void trie_insert(TrieNode* root, const char* word) {
    TrieNode* node = root;
    for (int i = 0; word[i]; i++) {
        int idx = word[i] - 'a';
        // Move to child or create new node
        if (!node->children[idx]) node->children[idx] = new_trie_node();
        node = node->children[idx];
    }
    // Mark end of word
    node->isEndOfWord = true;
}`,
    cpp: `// Trie — insert word character by character
void trieInsert(TrieNode* root, const std::string& word) {
    TrieNode* node = root;
    for (char c : word) {
        // Move to child or create new node
        if (!node->children.count(c)) node->children[c] = new TrieNode();
        node = node->children[c];
    }
    // Mark end of word
    node->isEndOfWord = true;
}`,
    java: `// Trie — insert word character by character
public class TrieInsert {
    static void insert(TrieNode root, String word) {
        TrieNode node = root;
        for (char c : word.toCharArray()) {
            // Move to child or create new node
            node.children.putIfAbsent(c, new TrieNode());
            node = node.children.get(c);
        }
        // Mark end of word
        node.isEndOfWord = true;
    }
}`,
  },
  heapify: {
    python: `# Heapify — restore the max-heap property at a subtree root
def heapify(arr, n, i):
    largest = i
    left, right = 2 * i + 1, 2 * i + 2
    # Find the largest among node, left child, right child
    if left < n and arr[left] > arr[largest]: largest = left
    if right < n and arr[right] > arr[largest]: largest = right
    # Swap and recurse if the root was not already the largest
    if largest != i:
        arr[i], arr[largest] = arr[largest], arr[i]
        heapify(arr, n, largest)`,
    javascript: `// Heapify — restore the max-heap property at a subtree root
function heapify(arr, n, i) {
  let largest = i;
  const left = 2 * i + 1, right = 2 * i + 2;
  // Find the largest among node, left child, right child
  if (left < n && arr[left] > arr[largest]) largest = left;
  if (right < n && arr[right] > arr[largest]) largest = right;
  // Swap and recurse if the root was not already the largest
  if (largest !== i) {
    [arr[i], arr[largest]] = [arr[largest], arr[i]];
    heapify(arr, n, largest);
  }
}`,
    c: `// Heapify — restore the max-heap property at a subtree root
void heapify(int arr[], int n, int i) {
    int largest = i;
    int left = 2 * i + 1, right = 2 * i + 2;
    // Find the largest among node, left child, right child
    if (left < n && arr[left] > arr[largest]) largest = left;
    if (right < n && arr[right] > arr[largest]) largest = right;
    // Swap and recurse if the root was not already the largest
    if (largest != i) {
        int t = arr[i]; arr[i] = arr[largest]; arr[largest] = t;
        heapify(arr, n, largest);
    }
}`,
    cpp: `// Heapify — restore the max-heap property at a subtree root
void heapify(std::vector<int>& arr, int n, int i) {
    int largest = i;
    int left = 2 * i + 1, right = 2 * i + 2;
    // Find the largest among node, left child, right child
    if (left < n && arr[left] > arr[largest]) largest = left;
    if (right < n && arr[right] > arr[largest]) largest = right;
    // Swap and recurse if the root was not already the largest
    if (largest != i) {
        std::swap(arr[i], arr[largest]);
        heapify(arr, n, largest);
    }
}`,
    java: `// Heapify — restore the max-heap property at a subtree root
public class Heapify {
    static void heapify(int[] arr, int n, int i) {
        int largest = i;
        int left = 2 * i + 1, right = 2 * i + 2;
        // Find the largest among node, left child, right child
        if (left < n && arr[left] > arr[largest]) largest = left;
        if (right < n && arr[right] > arr[largest]) largest = right;
        // Swap and recurse if the root was not already the largest
        if (largest != i) {
            int t = arr[i]; arr[i] = arr[largest]; arr[largest] = t;
            heapify(arr, n, largest);
        }
    }
}`,
  },
  'tree-inorder': {
    python: `# Inorder Traversal — left subtree, node, right subtree
def inorder(node, result):
    if node is None: return
    # Visit left subtree first
    inorder(node.left, result)
    # Then visit this node
    result.append(node.val)
    # Then visit right subtree
    inorder(node.right, result)
    return result`,
    javascript: `// Inorder Traversal — left subtree, node, right subtree
function inorder(node, result) {
  if (!node) return;
  // Visit left subtree first
  inorder(node.left, result);
  // Then visit this node
  result.push(node.val);
  // Then visit right subtree
  inorder(node.right, result);
  return result;
}`,
    c: `// Inorder Traversal — left subtree, node, right subtree
void inorder(struct Node* node, int result[], int* count) {
    if (!node) return;
    // Visit left subtree first
    inorder(node->left, result, count);
    // Then visit this node
    result[(*count)++] = node->val;
    // Then visit right subtree
    inorder(node->right, result, count);
}`,
    cpp: `// Inorder Traversal — left subtree, node, right subtree
void inorder(Node* node, std::vector<int>& result) {
    if (!node) return;
    // Visit left subtree first
    inorder(node->left, result);
    // Then visit this node
    result.push_back(node->val);
    // Then visit right subtree
    inorder(node->right, result);
}`,
    java: `// Inorder Traversal — left subtree, node, right subtree
public class InorderTraversal {
    static void inorder(Node node, List<Integer> result) {
        if (node == null) return;
        // Visit left subtree first
        inorder(node.left, result);
        // Then visit this node
        result.add(node.val);
        // Then visit right subtree
        inorder(node.right, result);
    }
}`,
  },
  'tree-preorder': {
    python: `# Preorder Traversal — node, left subtree, right subtree
def preorder(node, result):
    if node is None: return
    # Visit this node first
    result.append(node.val)
    # Then visit left subtree
    preorder(node.left, result)
    # Then visit right subtree
    preorder(node.right, result)
    return result`,
    javascript: `// Preorder Traversal — node, left subtree, right subtree
function preorder(node, result) {
  if (!node) return;
  // Visit this node first
  result.push(node.val);
  // Then visit left subtree
  preorder(node.left, result);
  // Then visit right subtree
  preorder(node.right, result);
  return result;
}`,
    c: `// Preorder Traversal — node, left subtree, right subtree
void preorder(struct Node* node, int result[], int* count) {
    if (!node) return;
    // Visit this node first
    result[(*count)++] = node->val;
    // Then visit left subtree
    preorder(node->left, result, count);
    // Then visit right subtree
    preorder(node->right, result, count);
}`,
    cpp: `// Preorder Traversal — node, left subtree, right subtree
void preorder(Node* node, std::vector<int>& result) {
    if (!node) return;
    // Visit this node first
    result.push_back(node->val);
    // Then visit left subtree
    preorder(node->left, result);
    // Then visit right subtree
    preorder(node->right, result);
}`,
    java: `// Preorder Traversal — node, left subtree, right subtree
public class PreorderTraversal {
    static void preorder(Node node, List<Integer> result) {
        if (node == null) return;
        // Visit this node first
        result.add(node.val);
        // Then visit left subtree
        preorder(node.left, result);
        // Then visit right subtree
        preorder(node.right, result);
    }
}`,
  },
  'tree-postorder': {
    python: `# Postorder Traversal — left subtree, right subtree, node
def postorder(node, result):
    if node is None: return
    # Visit left subtree first
    postorder(node.left, result)
    # Then visit right subtree
    postorder(node.right, result)
    # Then visit this node last
    result.append(node.val)
    return result`,
    javascript: `// Postorder Traversal — left subtree, right subtree, node
function postorder(node, result) {
  if (!node) return;
  // Visit left subtree first
  postorder(node.left, result);
  // Then visit right subtree
  postorder(node.right, result);
  // Then visit this node last
  result.push(node.val);
  return result;
}`,
    c: `// Postorder Traversal — left subtree, right subtree, node
void postorder(struct Node* node, int result[], int* count) {
    if (!node) return;
    // Visit left subtree first
    postorder(node->left, result, count);
    // Then visit right subtree
    postorder(node->right, result, count);
    // Then visit this node last
    result[(*count)++] = node->val;
}`,
    cpp: `// Postorder Traversal — left subtree, right subtree, node
void postorder(Node* node, std::vector<int>& result) {
    if (!node) return;
    // Visit left subtree first
    postorder(node->left, result);
    // Then visit right subtree
    postorder(node->right, result);
    // Then visit this node last
    result.push_back(node->val);
}`,
    java: `// Postorder Traversal — left subtree, right subtree, node
public class PostorderTraversal {
    static void postorder(Node node, List<Integer> result) {
        if (node == null) return;
        // Visit left subtree first
        postorder(node.left, result);
        // Then visit right subtree
        postorder(node.right, result);
        // Then visit this node last
        result.add(node.val);
    }
}`,
  },
  'level-order-bfs': {
    python: `# Level Order Traversal — visit nodes level by level using a queue
def level_order(root):
    if root is None: return []
    queue = [root]
    result = []
    # Dequeue, visit, and enqueue children
    while queue:
        node = queue.pop(0)
        result.append(node.val)
        if node.left: queue.append(node.left)
        if node.right: queue.append(node.right)
    return result`,
    javascript: `// Level Order Traversal — visit nodes level by level using a queue
function levelOrder(root) {
  if (!root) return [];
  const queue = [root];
  const result = [];
  // Dequeue, visit, and enqueue children
  while (queue.length) {
    const node = queue.shift();
    result.push(node.val);
    if (node.left) queue.push(node.left);
    if (node.right) queue.push(node.right);
  }
  return result;
}`,
    c: `// Level Order Traversal — visit nodes level by level using a queue
void level_order(struct Node* root, int result[], int* count) {
    if (!root) return;
    struct Node* queue[MAXN]; int front = 0, back = 0;
    queue[back++] = root;
    // Dequeue, visit, and enqueue children
    while (front < back) {
        struct Node* node = queue[front++];
        result[(*count)++] = node->val;
        if (node->left) queue[back++] = node->left;
        if (node->right) queue[back++] = node->right;
    }
}`,
    cpp: `// Level Order Traversal — visit nodes level by level using a queue
std::vector<int> levelOrder(Node* root) {
    std::vector<int> result;
    if (!root) return result;
    std::queue<Node*> q;
    q.push(root);
    // Dequeue, visit, and enqueue children
    while (!q.empty()) {
        Node* node = q.front(); q.pop();
        result.push_back(node->val);
        if (node->left) q.push(node->left);
        if (node->right) q.push(node->right);
    }
    return result;
}`,
    java: `// Level Order Traversal — visit nodes level by level using a queue
public class LevelOrderTraversal {
    static List<Integer> levelOrder(Node root) {
        List<Integer> result = new ArrayList<>();
        if (root == null) return result;
        Queue<Node> queue = new LinkedList<>();
        queue.add(root);
        // Dequeue, visit, and enqueue children
        while (!queue.isEmpty()) {
            Node node = queue.poll();
            result.add(node.val);
            if (node.left != null) queue.add(node.left);
            if (node.right != null) queue.add(node.right);
        }
        return result;
    }
}`,
  },
  'segment-tree-demo': {
    python: `# Segment Tree — build bottom-up, then answer a range-sum query
def build(values, size):
    tree = [0] * (2 * size)
    # Leaves hold the original values
    for i, v in enumerate(values):
        tree[size + i] = v
    # Each internal node is the sum of its two children
    for i in range(size - 1, 0, -1):
        tree[i] = tree[2 * i] + tree[2 * i + 1]
    return tree

def query(tree, size, left, right):
    # Combine only the O(log n) nodes covering [left, right]
    return sum_over_range(tree, size, left, right)`,
    javascript: `// Segment Tree — build bottom-up, then answer a range-sum query
function build(values, size) {
  const tree = new Array(2 * size).fill(0);
  // Leaves hold the original values
  values.forEach((v, i) => { tree[size + i] = v; });
  // Each internal node is the sum of its two children
  for (let i = size - 1; i >= 1; i--) tree[i] = tree[2 * i] + tree[2 * i + 1];
  return tree;
}

function query(tree, size, left, right) {
  // Combine only the O(log n) nodes covering [left, right]
  return sumOverRange(tree, size, left, right);
}`,
    c: `// Segment Tree — build bottom-up, then answer a range-sum query
void build(int values[], int n, int size, int tree[]) {
    // Leaves hold the original values
    for (int i = 0; i < n; i++) tree[size + i] = values[i];
    // Each internal node is the sum of its two children
    for (int i = size - 1; i >= 1; i--) tree[i] = tree[2 * i] + tree[2 * i + 1];
}
int query(int tree[], int size, int left, int right) {
    // Combine only the O(log n) nodes covering [left, right]
    return sum_over_range(tree, size, left, right);
}`,
    cpp: `// Segment Tree — build bottom-up, then answer a range-sum query
void build(std::vector<int>& values, int size, std::vector<int>& tree) {
    // Leaves hold the original values
    for (size_t i = 0; i < values.size(); i++) tree[size + i] = values[i];
    // Each internal node is the sum of its two children
    for (int i = size - 1; i >= 1; i--) tree[i] = tree[2 * i] + tree[2 * i + 1];
}
int query(std::vector<int>& tree, int size, int left, int right) {
    // Combine only the O(log n) nodes covering [left, right]
    return sumOverRange(tree, size, left, right);
}`,
    java: `// Segment Tree — build bottom-up, then answer a range-sum query
public class SegmentTree {
    static void build(int[] values, int size, int[] tree) {
        // Leaves hold the original values
        for (int i = 0; i < values.length; i++) tree[size + i] = values[i];
        // Each internal node is the sum of its two children
        for (int i = size - 1; i >= 1; i--) tree[i] = tree[2 * i] + tree[2 * i + 1];
    }
    static int query(int[] tree, int size, int left, int right) {
        // Combine only the O(log n) nodes covering [left, right]
        return sumOverRange(tree, size, left, right);
    }
}`,
  },
  'fenwick-tree-demo': {
    python: `# Fenwick Tree (Binary Indexed Tree) — point update, prefix-sum query
def update(tree, i, delta, n):
    # Propagate the change to every ancestor via i += i & -i
    while i <= n:
        tree[i] += delta
        i += i & (-i)

def query(tree, i):
    total = 0
    # Accumulate partial sums via i -= i & -i
    while i > 0:
        total += tree[i]
        i -= i & (-i)
    return total`,
    javascript: `// Fenwick Tree (Binary Indexed Tree) — point update, prefix-sum query
function update(tree, i, delta, n) {
  // Propagate the change to every ancestor via i += i & -i
  while (i <= n) {
    tree[i] += delta;
    i += i & (-i);
  }
}

function query(tree, i) {
  let total = 0;
  // Accumulate partial sums via i -= i & -i
  while (i > 0) {
    total += tree[i];
    i -= i & (-i);
  }
  return total;
}`,
    c: `// Fenwick Tree (Binary Indexed Tree) — point update, prefix-sum query
void update(int tree[], int i, int delta, int n) {
    // Propagate the change to every ancestor via i += i & -i
    for (; i <= n; i += i & (-i)) tree[i] += delta;
}
int query(int tree[], int i) {
    int total = 0;
    // Accumulate partial sums via i -= i & -i
    for (; i > 0; i -= i & (-i)) total += tree[i];
    return total;
}`,
    cpp: `// Fenwick Tree (Binary Indexed Tree) — point update, prefix-sum query
void update(std::vector<int>& tree, int i, int delta, int n) {
    // Propagate the change to every ancestor via i += i & -i
    for (; i <= n; i += i & (-i)) tree[i] += delta;
}
int query(std::vector<int>& tree, int i) {
    int total = 0;
    // Accumulate partial sums via i -= i & -i
    for (; i > 0; i -= i & (-i)) total += tree[i];
    return total;
}`,
    java: `// Fenwick Tree (Binary Indexed Tree) — point update, prefix-sum query
public class FenwickTree {
    static void update(int[] tree, int i, int delta, int n) {
        // Propagate the change to every ancestor via i += i & -i
        for (; i <= n; i += i & (-i)) tree[i] += delta;
    }
    static int query(int[] tree, int i) {
        int total = 0;
        // Accumulate partial sums via i -= i & -i
        for (; i > 0; i -= i & (-i)) total += tree[i];
        return total;
    }
}`,
  },
};

/** Category fallback templates when algorithm-specific source is not defined */
function buildCategorySource(algorithmId, language, category, name) {
  const comment = `// ${name} — step-by-step implementation`;
  const templates = {
    searching: {
      python: `# ${name}\ndef search(arr, target):\n    for i in range(len(arr)):\n        if arr[i] == target: return i\n    return -1`,
      javascript: `// ${name}\nfunction search(arr, target) {\n  for (let i = 0; i < arr.length; i++) {\n    if (arr[i] === target) return i;\n  }\n  return -1;\n}`,
      c: `// ${name}\nint search(int arr[], int n, int target) {\n    for (int i = 0; i < n; i++)\n        if (arr[i] == target) return i;\n    return -1;\n}`,
      cpp: `// ${name}\nint search(const std::vector<int>& arr, int target) {\n    for (int i = 0; i < (int)arr.size(); i++)\n        if (arr[i] == target) return i;\n    return -1;\n}`,
      java: `// ${name}\npublic class Search {\n    static int search(int[] arr, int target) {\n        for (int i = 0; i < arr.length; i++)\n            if (arr[i] == target) return i;\n        return -1;\n    }\n}`,
    },
    sorting: {
      python: `# ${name}\ndef sort_arr(arr):\n    return sorted(arr)  # See full implementation in lesson code`,
      javascript: `// ${name}\nfunction sortArr(arr) {\n  return [...arr].sort((a, b) => a - b);\n}`,
      c: `// ${name}\nvoid sort_arr(int arr[], int n) {\n    qsort(arr, n, sizeof(int), compare_int);\n}`,
      cpp: `// ${name}\nvoid sortArr(std::vector<int>& arr) {\n    std::sort(arr.begin(), arr.end());\n}`,
      java: `// ${name}\npublic class Sort {\n    static void sortArr(int[] arr) {\n        java.util.Arrays.sort(arr);\n    }\n}`,
    },
    graphs: {
      python: `# ${name}\ndef traverse(graph, start):\n    visited = set([start])\n    stack = [start]\n    while stack:\n        u = stack.pop()\n        for v in graph.get(u, []):\n            if v not in visited:\n                visited.add(v); stack.append(v)\n    return visited`,
      javascript: `// ${name}\nfunction traverse(graph, start) {\n  const visited = new Set([start]);\n  const stack = [start];\n  while (stack.length) {\n    const u = stack.pop();\n    for (const v of graph[u] ?? []) {\n      if (!visited.has(v)) { visited.add(v); stack.push(v); }\n    }\n  }\n  return visited;\n}`,
      c: `// ${name}\nvoid traverse(int g[][MAX], int n, int start, int vis[]) {\n    vis[start] = 1;\n    for (int v = 0; v < n; v++)\n        if (g[start][v] && !vis[v]) traverse(g, n, v, vis);\n}`,
      cpp: `// ${name}\nvoid traverse(const std::vector<std::vector<int>>& g, int u, std::vector<bool>& vis) {\n    vis[u] = true;\n    for (int v : g[u]) if (!vis[v]) traverse(g, v, vis);\n}`,
      java: `// ${name}\npublic class Traverse {\n    static void traverse(List<List<Integer>> g, int u, boolean[] vis) {\n        vis[u] = true;\n        for (int v : g.get(u)) if (!vis[v]) traverse(g, v, vis);\n    }\n}`,
    },
    trees: {
      python: `# ${name}\ndef inorder(root):\n    if not root: return []\n    return inorder(root.left) + [root.val] + inorder(root.right)`,
      javascript: `// ${name}\nfunction inorder(root) {\n  if (!root) return [];\n  return [...inorder(root.left), root.val, ...inorder(root.right)];\n}`,
      c: `// ${name}\nvoid inorder(struct Node* root) {\n    if (!root) return;\n    inorder(root->left);\n    printf("%d ", root->val);\n    inorder(root->right);\n}`,
      cpp: `// ${name}\nvoid inorder(Node* root) {\n    if (!root) return;\n    inorder(root->left);\n    std::cout << root->val << ' ';\n    inorder(root->right);\n}`,
      java: `// ${name}\npublic class TreeTraverse {\n    static void inorder(Node root) {\n        if (root == null) return;\n        inorder(root.left);\n        System.out.print(root.val + " ");\n        inorder(root.right);\n    }\n}`,
    },
    dp: {
      python: `# ${name}\ndef solve(n):\n    dp = [0] * (n + 1)\n    dp[0], dp[1] = 0, 1\n    for i in range(2, n + 1):\n        dp[i] = dp[i-1] + dp[i-2]\n    return dp[n]`,
      javascript: `// ${name}\nfunction solve(n) {\n  const dp = Array(n + 1).fill(0);\n  dp[0] = 0; dp[1] = 1;\n  for (let i = 2; i <= n; i++) dp[i] = dp[i-1] + dp[i-2];\n  return dp[n];\n}`,
      c: `// ${name}\nint solve(int n) {\n    int dp[n+1]; dp[0]=0; dp[1]=1;\n    for (int i=2; i<=n; i++) dp[i]=dp[i-1]+dp[i-2];\n    return dp[n];\n}`,
      cpp: `// ${name}\nint solve(int n) {\n    std::vector<int> dp(n+1); dp[0]=0; dp[1]=1;\n    for (int i=2; i<=n; i++) dp[i]=dp[i-1]+dp[i-2];\n    return dp[n];\n}`,
      java: `// ${name}\npublic class DP {\n    static int solve(int n) {\n        int[] dp = new int[n+1]; dp[0]=0; dp[1]=1;\n        for (int i=2; i<=n; i++) dp[i]=dp[i-1]+dp[i-2];\n        return dp[n];\n    }\n}`,
    },
    structures: {
      python: `# ${name}\nclass Stack:\n    def __init__(self): self.data = []\n    def push(self, x): self.data.append(x)\n    def pop(self): return self.data.pop()`,
      javascript: `// ${name}\nclass Stack {\n  constructor() { this.data = []; }\n  push(x) { this.data.push(x); }\n  pop() { return this.data.pop(); }\n}`,
      c: `// ${name}\ntypedef struct { int data[1000]; int top; } Stack;\nvoid push(Stack* s, int x) { s->data[++s->top] = x; }\nint pop(Stack* s) { return s->data[s->top--]; }`,
      cpp: `// ${name}\nclass Stack { std::vector<int> data; public:\n  void push(int x) { data.push_back(x); }\n  int pop() { int v=data.back(); data.pop_back(); return v; }\n};`,
      java: `// ${name}\nclass Stack {\n    Deque<Integer> data = new ArrayDeque<>();\n    void push(int x) { data.pushLast(x); }\n    int pop() { return data.removeLast(); }\n}`,
    },
    techniques: {
      python: `# ${name}\ndef two_pointer(arr, target):\n    left, right = 0, len(arr) - 1\n    while left < right:\n        s = arr[left] + arr[right]\n        if s == target: return (left, right)\n        elif s < target: left += 1\n        else: right -= 1\n    return (-1, -1)`,
      javascript: `// ${name}\nfunction twoPointer(arr, target) {\n  let left = 0, right = arr.length - 1;\n  while (left < right) {\n    const s = arr[left] + arr[right];\n    if (s === target) return [left, right];\n    else if (s < target) left++;\n    else right--;\n  }\n  return [-1, -1];\n}`,
      c: `// ${name}\nvoid two_pointer(int arr[], int n, int target, int* l, int* r) {\n    *l=0; *r=n-1;\n    while (*l < *r) {\n        int s = arr[*l] + arr[*r];\n        if (s == target) return;\n        else if (s < target) (*l)++;\n        else (*r)--;\n    }\n}`,
      cpp: `// ${name}\npair<int,int> twoPointer(vector<int>& arr, int target) {\n    int l=0, r=arr.size()-1;\n    while (l<r) {\n        int s=arr[l]+arr[r];\n        if (s==target) return {l,r};\n        else if (s<target) l++; else r--;\n    }\n    return {-1,-1};\n}`,
      java: `// ${name}\npublic class TwoPointer {\n    static int[] twoPointer(int[] arr, int target) {\n        int l=0, r=arr.length-1;\n        while (l<r) {\n            int s=arr[l]+arr[r];\n            if (s==target) return new int[]{l,r};\n            else if (s<target) l++; else r--;\n        }\n        return new int[]{-1,-1};\n    }\n}`,
    },
  };

  const cat = templates[category] ?? templates.sorting;
  return cat[language] ?? cat.python;
}

const STRUCTURES_SOURCES = {
  'stack-operations': {
    python: `# Stack — Last In, First Out (LIFO)
def stack_demo(values):
    stack = []
    # Push every value onto the stack
    for v in values:
        stack.append(v)
    # Pop values off until the stack is empty
    while stack:
        top = stack[-1]
        stack.pop()
    return "done"`,
    javascript: `// Stack — Last In, First Out (LIFO)
function stackDemo(values) {
  const stack = [];
  // Push every value onto the stack
  for (const v of values) stack.push(v);
  // Pop values off until the stack is empty
  while (stack.length) {
    const top = stack[stack.length - 1];
    stack.pop();
  }
  return 'done';
}`,
    c: `// Stack — Last In, First Out (LIFO)
void stack_demo(int values[], int n) {
    int stack[1000], top = -1;
    // Push every value onto the stack
    for (int i = 0; i < n; i++) stack[++top] = values[i];
    // Pop values off until the stack is empty
    while (top >= 0) {
        int topVal = stack[top];
        top--;
    }
}`,
    cpp: `// Stack — Last In, First Out (LIFO)
void stackDemo(std::vector<int>& values) {
    std::stack<int> stack;
    // Push every value onto the stack
    for (int v : values) stack.push(v);
    // Pop values off until the stack is empty
    while (!stack.empty()) {
        int top = stack.top();
        stack.pop();
    }
}`,
    java: `// Stack — Last In, First Out (LIFO)
public class StackDemo {
    static void stackDemo(int[] values) {
        Deque<Integer> stack = new ArrayDeque<>();
        // Push every value onto the stack
        for (int v : values) stack.push(v);
        // Pop values off until the stack is empty
        while (!stack.isEmpty()) {
            int top = stack.peek();
            stack.pop();
        }
    }
}`,
  },
  'queue-operations': {
    python: `# Queue — First In, First Out (FIFO)
def queue_demo(values):
    queue = []
    # Enqueue every value at the back
    for v in values:
        queue.append(v)
    # Dequeue values off the front until empty
    while queue:
        front = queue[0]
        queue.pop(0)
    return "done"`,
    javascript: `// Queue — First In, First Out (FIFO)
function queueDemo(values) {
  const queue = [];
  // Enqueue every value at the back
  for (const v of values) queue.push(v);
  // Dequeue values off the front until empty
  while (queue.length) {
    const front = queue[0];
    queue.shift();
  }
  return 'done';
}`,
    c: `// Queue — First In, First Out (FIFO)
void queue_demo(int values[], int n) {
    int queue[1000], front = 0, back = 0;
    // Enqueue every value at the back
    for (int i = 0; i < n; i++) queue[back++] = values[i];
    // Dequeue values off the front until empty
    while (front < back) {
        int frontVal = queue[front];
        front++;
    }
}`,
    cpp: `// Queue — First In, First Out (FIFO)
void queueDemo(std::vector<int>& values) {
    std::queue<int> queue;
    // Enqueue every value at the back
    for (int v : values) queue.push(v);
    // Dequeue values off the front until empty
    while (!queue.empty()) {
        int front = queue.front();
        queue.pop();
    }
}`,
    java: `// Queue — First In, First Out (FIFO)
public class QueueDemo {
    static void queueDemo(int[] values) {
        Queue<Integer> queue = new LinkedList<>();
        // Enqueue every value at the back
        for (int v : values) queue.add(v);
        // Dequeue values off the front until empty
        while (!queue.isEmpty()) {
            int front = queue.peek();
            queue.poll();
        }
    }
}`,
  },
  'linked-list-insert': {
    python: `# Linked List — insert each value at the tail
def insert_at_tail(head, value):
    new_node = Node(value)
    if head is None:
        return new_node
    # Walk to the last node
    current = head
    while current.next is not None:
        current = current.next
    # Link the new node after it
    current.next = new_node
    return head`,
    javascript: `// Linked List — insert each value at the tail
function insertAtTail(head, value) {
  const newNode = new Node(value);
  if (!head) return newNode;
  // Walk to the last node
  let current = head;
  while (current.next) current = current.next;
  // Link the new node after it
  current.next = newNode;
  return head;
}`,
    c: `// Linked List — insert each value at the tail
struct Node* insert_at_tail(struct Node* head, int value) {
    struct Node* newNode = new_node(value);
    if (!head) return newNode;
    // Walk to the last node
    struct Node* current = head;
    while (current->next) current = current->next;
    // Link the new node after it
    current->next = newNode;
    return head;
}`,
    cpp: `// Linked List — insert each value at the tail
Node* insertAtTail(Node* head, int value) {
    Node* newNode = new Node{value, nullptr};
    if (!head) return newNode;
    // Walk to the last node
    Node* current = head;
    while (current->next) current = current->next;
    // Link the new node after it
    current->next = newNode;
    return head;
}`,
    java: `// Linked List — insert each value at the tail
public class LinkedListInsert {
    static Node insertAtTail(Node head, int value) {
        Node newNode = new Node(value);
        if (head == null) return newNode;
        // Walk to the last node
        Node current = head;
        while (current.next != null) current = current.next;
        // Link the new node after it
        current.next = newNode;
        return head;
    }
}`,
  },
  'hash-linear-probing': {
    python: `# Hash Table — linear probing resolves collisions
def insert(table, value, table_size):
    index = value % table_size
    # Probe forward while the slot is occupied
    while table[index] is not None:
        index = (index + 1) % table_size
    # Place the value in the first free slot found
    table[index] = value
    return table`,
    javascript: `// Hash Table — linear probing resolves collisions
function insert(table, value, tableSize) {
  let index = value % tableSize;
  // Probe forward while the slot is occupied
  while (table[index] !== null) {
    index = (index + 1) % tableSize;
  }
  // Place the value in the first free slot found
  table[index] = value;
  return table;
}`,
    c: `// Hash Table — linear probing resolves collisions
void insert(int table[], int size, int value) {
    int index = value % size;
    // Probe forward while the slot is occupied
    while (table[index] != EMPTY) {
        index = (index + 1) % size;
    }
    // Place the value in the first free slot found
    table[index] = value;
}`,
    cpp: `// Hash Table — linear probing resolves collisions
void insert(std::vector<int>& table, int size, int value) {
    int index = value % size;
    // Probe forward while the slot is occupied
    while (table[index] != EMPTY) {
        index = (index + 1) % size;
    }
    // Place the value in the first free slot found
    table[index] = value;
}`,
    java: `// Hash Table — linear probing resolves collisions
public class HashLinearProbing {
    static void insert(Integer[] table, int size, int value) {
        int index = value % size;
        // Probe forward while the slot is occupied
        while (table[index] != null) {
            index = (index + 1) % size;
        }
        // Place the value in the first free slot found
        table[index] = value;
    }
}`,
  },
  'monotonic-stack': {
    python: `# Monotonic Stack — find the next greater element for each index
def next_greater_elements(arr):
    result = [-1] * len(arr)
    stack = []  # holds indices, values kept decreasing
    # Scan left to right, resolving smaller values on the way
    for i in range(len(arr)):
        while stack and arr[stack[-1]] < arr[i]:
            # arr[i] is the next greater element for stack top
            result[stack.pop()] = arr[i]
        stack.append(i)
    return result`,
    javascript: `// Monotonic Stack — find the next greater element for each index
function nextGreaterElements(arr) {
  const result = new Array(arr.length).fill(-1);
  const stack = []; // holds indices, values kept decreasing
  // Scan left to right, resolving smaller values on the way
  for (let i = 0; i < arr.length; i++) {
    while (stack.length && arr[stack[stack.length - 1]] < arr[i]) {
      // arr[i] is the next greater element for stack top
      result[stack.pop()] = arr[i];
    }
    stack.push(i);
  }
  return result;
}`,
    c: `// Monotonic Stack — find the next greater element for each index
void next_greater_elements(int arr[], int n, int result[]) {
    int stack[1000], top = -1;
    for (int i = 0; i < n; i++) result[i] = -1;
    // Scan left to right, resolving smaller values on the way
    for (int i = 0; i < n; i++) {
        while (top >= 0 && arr[stack[top]] < arr[i]) {
            // arr[i] is the next greater element for stack top
            result[stack[top--]] = arr[i];
        }
        stack[++top] = i;
    }
}`,
    cpp: `// Monotonic Stack — find the next greater element for each index
std::vector<int> nextGreaterElements(std::vector<int>& arr) {
    std::vector<int> result(arr.size(), -1);
    std::stack<int> stack; // holds indices, values kept decreasing
    // Scan left to right, resolving smaller values on the way
    for (int i = 0; i < (int)arr.size(); i++) {
        while (!stack.empty() && arr[stack.top()] < arr[i]) {
            // arr[i] is the next greater element for stack top
            result[stack.top()] = arr[i]; stack.pop();
        }
        stack.push(i);
    }
    return result;
}`,
    java: `// Monotonic Stack — find the next greater element for each index
public class MonotonicStack {
    static int[] nextGreaterElements(int[] arr) {
        int[] result = new int[arr.length];
        java.util.Arrays.fill(result, -1);
        Deque<Integer> stack = new ArrayDeque<>(); // holds indices, values kept decreasing
        // Scan left to right, resolving smaller values on the way
        for (int i = 0; i < arr.length; i++) {
            while (!stack.isEmpty() && arr[stack.peek()] < arr[i]) {
                // arr[i] is the next greater element for stack top
                result[stack.pop()] = arr[i];
            }
            stack.push(i);
        }
        return result;
    }
}`,
  },
  'deque-sliding-window': {
    python: `# Deque Sliding Window Maximum — O(n) using a monotonic deque of indices
def sliding_window_max(arr, k):
    deque = []  # holds indices, values kept decreasing
    result = []
    for i in range(len(arr)):
        # Drop indices that have fallen out of the window
        while deque and deque[0] <= i - k:
            deque.pop(0)
        # Drop smaller values — they can never be the max again
        while deque and arr[deque[-1]] <= arr[i]:
            deque.pop()
        deque.append(i)
        if i >= k - 1:
            result.append(arr[deque[0]])
    return result`,
    javascript: `// Deque Sliding Window Maximum — O(n) using a monotonic deque of indices
function slidingWindowMax(arr, k) {
  const deque = []; // holds indices, values kept decreasing
  const result = [];
  for (let i = 0; i < arr.length; i++) {
    // Drop indices that have fallen out of the window
    while (deque.length && deque[0] <= i - k) deque.shift();
    // Drop smaller values — they can never be the max again
    while (deque.length && arr[deque[deque.length - 1]] <= arr[i]) deque.pop();
    deque.push(i);
    if (i >= k - 1) result.push(arr[deque[0]]);
  }
  return result;
}`,
    c: `// Deque Sliding Window Maximum — O(n) using a monotonic deque of indices
void sliding_window_max(int arr[], int n, int k, int result[], int* rcount) {
    int deque[1000], front = 0, back = 0;
    for (int i = 0; i < n; i++) {
        // Drop indices that have fallen out of the window
        while (back > front && deque[front] <= i - k) front++;
        // Drop smaller values — they can never be the max again
        while (back > front && arr[deque[back - 1]] <= arr[i]) back--;
        deque[back++] = i;
        if (i >= k - 1) result[(*rcount)++] = arr[deque[front]];
    }
}`,
    cpp: `// Deque Sliding Window Maximum — O(n) using a monotonic deque of indices
std::vector<int> slidingWindowMax(std::vector<int>& arr, int k) {
    std::deque<int> dq; // holds indices, values kept decreasing
    std::vector<int> result;
    for (int i = 0; i < (int)arr.size(); i++) {
        // Drop indices that have fallen out of the window
        while (!dq.empty() && dq.front() <= i - k) dq.pop_front();
        // Drop smaller values — they can never be the max again
        while (!dq.empty() && arr[dq.back()] <= arr[i]) dq.pop_back();
        dq.push_back(i);
        if (i >= k - 1) result.push_back(arr[dq.front()]);
    }
    return result;
}`,
    java: `// Deque Sliding Window Maximum — O(n) using a monotonic deque of indices
public class DequeSlidingWindowMax {
    static List<Integer> slidingWindowMax(int[] arr, int k) {
        Deque<Integer> deque = new ArrayDeque<>(); // holds indices, values kept decreasing
        List<Integer> result = new ArrayList<>();
        for (int i = 0; i < arr.length; i++) {
            // Drop indices that have fallen out of the window
            while (!deque.isEmpty() && deque.peekFirst() <= i - k) deque.pollFirst();
            // Drop smaller values — they can never be the max again
            while (!deque.isEmpty() && arr[deque.peekLast()] <= arr[i]) deque.pollLast();
            deque.addLast(i);
            if (i >= k - 1) result.add(arr[deque.peekFirst()]);
        }
        return result;
    }
}`,
  },
};

const TECHNIQUES_SOURCES = {
  'two-pointer': {
    python: `# Two Pointer — scan from both ends of a sorted array toward the middle
def two_pointer(arr, target):
    left, right = 0, len(arr) - 1
    # Move pointers inward based on the current sum
    while left < right:
        total = arr[left] + arr[right]
        if total == target:
            return (left, right)
        elif total < target:
            left += 1
        else:
            right -= 1
    return (-1, -1)`,
    javascript: `// Two Pointer — scan from both ends of a sorted array toward the middle
function twoPointer(arr, target) {
  let left = 0, right = arr.length - 1;
  // Move pointers inward based on the current sum
  while (left < right) {
    const total = arr[left] + arr[right];
    if (total === target) return [left, right];
    else if (total < target) left++;
    else right--;
  }
  return [-1, -1];
}`,
    c: `// Two Pointer — scan from both ends of a sorted array toward the middle
void two_pointer(int arr[], int n, int target, int* left, int* right) {
    *left = 0; *right = n - 1;
    // Move pointers inward based on the current sum
    while (*left < *right) {
        int total = arr[*left] + arr[*right];
        if (total == target) return;
        else if (total < target) (*left)++;
        else (*right)--;
    }
}`,
    cpp: `// Two Pointer — scan from both ends of a sorted array toward the middle
std::pair<int,int> twoPointer(std::vector<int>& arr, int target) {
    int left = 0, right = (int)arr.size() - 1;
    // Move pointers inward based on the current sum
    while (left < right) {
        int total = arr[left] + arr[right];
        if (total == target) return {left, right};
        else if (total < target) left++;
        else right--;
    }
    return {-1, -1};
}`,
    java: `// Two Pointer — scan from both ends of a sorted array toward the middle
public class TwoPointer {
    static int[] twoPointer(int[] arr, int target) {
        int left = 0, right = arr.length - 1;
        // Move pointers inward based on the current sum
        while (left < right) {
            int total = arr[left] + arr[right];
            if (total == target) return new int[]{left, right};
            else if (total < target) left++;
            else right--;
        }
        return new int[]{-1, -1};
    }
}`,
  },
  'sliding-window': {
    python: `# Sliding Window — maintain a running window of fixed size k
def sliding_window(arr, k):
    results = []
    # Slide the window one position at a time
    for i in range(len(arr) - k + 1):
        window = arr[i:i + k]
        # Compute the aggregate (max) for this window
        results.append(max(window))
    return results`,
    javascript: `// Sliding Window — maintain a running window of fixed size k
function slidingWindow(arr, k) {
  const results = [];
  // Slide the window one position at a time
  for (let i = 0; i <= arr.length - k; i++) {
    const window = arr.slice(i, i + k);
    // Compute the aggregate (max) for this window
    results.push(Math.max(...window));
  }
  return results;
}`,
    c: `// Sliding Window — maintain a running window of fixed size k
void sliding_window(int arr[], int n, int k, int results[], int* rcount) {
    // Slide the window one position at a time
    for (int i = 0; i <= n - k; i++) {
        int maxVal = arr[i];
        // Compute the aggregate (max) for this window
        for (int j = i; j < i + k; j++) if (arr[j] > maxVal) maxVal = arr[j];
        results[(*rcount)++] = maxVal;
    }
}`,
    cpp: `// Sliding Window — maintain a running window of fixed size k
std::vector<int> slidingWindow(std::vector<int>& arr, int k) {
    std::vector<int> results;
    // Slide the window one position at a time
    for (int i = 0; i <= (int)arr.size() - k; i++) {
        // Compute the aggregate (max) for this window
        int maxVal = *std::max_element(arr.begin() + i, arr.begin() + i + k);
        results.push_back(maxVal);
    }
    return results;
}`,
    java: `// Sliding Window — maintain a running window of fixed size k
public class SlidingWindow {
    static List<Integer> slidingWindow(int[] arr, int k) {
        List<Integer> results = new ArrayList<>();
        // Slide the window one position at a time
        for (int i = 0; i <= arr.length - k; i++) {
            int maxVal = arr[i];
            // Compute the aggregate (max) for this window
            for (int j = i; j < i + k; j++) maxVal = Math.max(maxVal, arr[j]);
            results.add(maxVal);
        }
        return results;
    }
}`,
  },
  'prefix-sum': {
    python: `# Prefix Sum — precompute running totals for O(1) range-sum queries
def build_prefix_sum(arr):
    prefix = [0] * len(arr)
    running = 0
    # Accumulate a running total as we scan
    for i in range(len(arr)):
        running += arr[i]
        prefix[i] = running
    return prefix`,
    javascript: `// Prefix Sum — precompute running totals for O(1) range-sum queries
function buildPrefixSum(arr) {
  const prefix = new Array(arr.length);
  let running = 0;
  // Accumulate a running total as we scan
  for (let i = 0; i < arr.length; i++) {
    running += arr[i];
    prefix[i] = running;
  }
  return prefix;
}`,
    c: `// Prefix Sum — precompute running totals for O(1) range-sum queries
void build_prefix_sum(int arr[], int n, int prefix[]) {
    int running = 0;
    // Accumulate a running total as we scan
    for (int i = 0; i < n; i++) {
        running += arr[i];
        prefix[i] = running;
    }
}`,
    cpp: `// Prefix Sum — precompute running totals for O(1) range-sum queries
std::vector<int> buildPrefixSum(std::vector<int>& arr) {
    std::vector<int> prefix(arr.size());
    int running = 0;
    // Accumulate a running total as we scan
    for (size_t i = 0; i < arr.size(); i++) {
        running += arr[i];
        prefix[i] = running;
    }
    return prefix;
}`,
    java: `// Prefix Sum — precompute running totals for O(1) range-sum queries
public class PrefixSum {
    static int[] buildPrefixSum(int[] arr) {
        int[] prefix = new int[arr.length];
        int running = 0;
        // Accumulate a running total as we scan
        for (int i = 0; i < arr.length; i++) {
            running += arr[i];
            prefix[i] = running;
        }
        return prefix;
    }
}`,
  },
  'greedy-activity': {
    python: `# Activity Selection — greedily pick by earliest finish time
def activity_selection(activities):
    activities.sort(key=lambda a: a.finish)
    selected = [activities[0]]
    last_finish = activities[0].finish
    # Only keep activities that start after the last one finished
    for activity in activities[1:]:
        if activity.start >= last_finish:
            selected.append(activity)
            last_finish = activity.finish
    return selected`,
    javascript: `// Activity Selection — greedily pick by earliest finish time
function activitySelection(activities) {
  activities.sort((a, b) => a.finish - b.finish);
  const selected = [activities[0]];
  let lastFinish = activities[0].finish;
  // Only keep activities that start after the last one finished
  for (const activity of activities.slice(1)) {
    if (activity.start >= lastFinish) {
      selected.push(activity);
      lastFinish = activity.finish;
    }
  }
  return selected;
}`,
    c: `// Activity Selection — greedily pick by earliest finish time
void activity_selection(Activity acts[], int n, Activity selected[], int* count) {
    qsort(acts, n, sizeof(Activity), compare_finish);
    selected[(*count)++] = acts[0];
    int lastFinish = acts[0].finish;
    // Only keep activities that start after the last one finished
    for (int i = 1; i < n; i++) {
        if (acts[i].start >= lastFinish) {
            selected[(*count)++] = acts[i];
            lastFinish = acts[i].finish;
        }
    }
}`,
    cpp: `// Activity Selection — greedily pick by earliest finish time
std::vector<Activity> activitySelection(std::vector<Activity>& acts) {
    std::sort(acts.begin(), acts.end(), [](Activity& a, Activity& b) { return a.finish < b.finish; });
    std::vector<Activity> selected{acts[0]};
    int lastFinish = acts[0].finish;
    // Only keep activities that start after the last one finished
    for (size_t i = 1; i < acts.size(); i++) {
        if (acts[i].start >= lastFinish) {
            selected.push_back(acts[i]);
            lastFinish = acts[i].finish;
        }
    }
    return selected;
}`,
    java: `// Activity Selection — greedily pick by earliest finish time
public class GreedyActivitySelection {
    static List<Activity> activitySelection(List<Activity> acts) {
        acts.sort((a, b) -> a.finish - b.finish);
        List<Activity> selected = new ArrayList<>(List.of(acts.get(0)));
        int lastFinish = acts.get(0).finish;
        // Only keep activities that start after the last one finished
        for (Activity a : acts.subList(1, acts.size())) {
            if (a.start >= lastFinish) {
                selected.add(a);
                lastFinish = a.finish;
            }
        }
        return selected;
    }
}`,
  },
  'backtracking-subsets': {
    python: `# Backtracking — generate all subsets via include/exclude recursion
def subsets(arr, index, current, result):
    if index == len(arr):
        result.append(list(current))
        return
    # Branch 1: include this element
    current.append(arr[index])
    subsets(arr, index + 1, current, result)
    current.pop()
    # Branch 2: exclude this element (backtrack)
    subsets(arr, index + 1, current, result)`,
    javascript: `// Backtracking — generate all subsets via include/exclude recursion
function subsets(arr, index, current, result) {
  if (index === arr.length) {
    result.push([...current]);
    return;
  }
  // Branch 1: include this element
  current.push(arr[index]);
  subsets(arr, index + 1, current, result);
  current.pop();
  // Branch 2: exclude this element (backtrack)
  subsets(arr, index + 1, current, result);
}`,
    c: `// Backtracking — generate all subsets via include/exclude recursion
void subsets(int arr[], int n, int index, int current[], int csize, int result[][MAXN], int* rcount) {
    if (index == n) {
        memcpy(result[(*rcount)++], current, csize * sizeof(int));
        return;
    }
    // Branch 1: include this element
    current[csize] = arr[index];
    subsets(arr, n, index + 1, current, csize + 1, result, rcount);
    // Branch 2: exclude this element (backtrack)
    subsets(arr, n, index + 1, current, csize, result, rcount);
}`,
    cpp: `// Backtracking — generate all subsets via include/exclude recursion
void subsets(std::vector<int>& arr, int index, std::vector<int>& current, std::vector<std::vector<int>>& result) {
    if (index == (int)arr.size()) {
        result.push_back(current);
        return;
    }
    // Branch 1: include this element
    current.push_back(arr[index]);
    subsets(arr, index + 1, current, result);
    current.pop_back();
    // Branch 2: exclude this element (backtrack)
    subsets(arr, index + 1, current, result);
}`,
    java: `// Backtracking — generate all subsets via include/exclude recursion
public class BacktrackingSubsets {
    static void subsets(int[] arr, int index, List<Integer> current, List<List<Integer>> result) {
        if (index == arr.length) {
            result.add(new ArrayList<>(current));
            return;
        }
        // Branch 1: include this element
        current.add(arr[index]);
        subsets(arr, index + 1, current, result);
        current.remove(current.size() - 1);
        // Branch 2: exclude this element (backtrack)
        subsets(arr, index + 1, current, result);
    }
}`,
  },
  'kmp-search': {
    python: `# Knuth-Morris-Pratt — skip re-comparisons using a failure function
def kmp_search(text, pattern):
    lps = build_failure_function(pattern)
    i = j = 0
    while i < len(text):
        # Advance both pointers while characters match
        if text[i] == pattern[j]:
            i += 1; j += 1
        if j == len(pattern):
            report_match(i - j); j = lps[j - 1]
        # Mismatch — fall back using the failure function, not i
        elif i < len(text) and text[i] != pattern[j]:
            j = lps[j - 1] if j != 0 else 0
            if j == 0: i += 1
    return matches`,
    javascript: `// Knuth-Morris-Pratt — skip re-comparisons using a failure function
function kmpSearch(text, pattern) {
  const lps = buildFailureFunction(pattern);
  let i = 0, j = 0;
  while (i < text.length) {
    // Advance both pointers while characters match
    if (text[i] === pattern[j]) { i++; j++; }
    if (j === pattern.length) { reportMatch(i - j); j = lps[j - 1]; }
    // Mismatch — fall back using the failure function, not i
    else if (i < text.length && text[i] !== pattern[j]) {
      if (j !== 0) j = lps[j - 1];
      else i++;
    }
  }
  return matches;
}`,
    c: `// Knuth-Morris-Pratt — skip re-comparisons using a failure function
void kmp_search(char text[], char pattern[], int matches[], int* mcount) {
    int lps[1000]; build_failure_function(pattern, lps);
    int i = 0, j = 0, n = strlen(text), m = strlen(pattern);
    while (i < n) {
        // Advance both pointers while characters match
        if (text[i] == pattern[j]) { i++; j++; }
        if (j == m) { matches[(*mcount)++] = i - j; j = lps[j - 1]; }
        // Mismatch — fall back using the failure function, not i
        else if (i < n && text[i] != pattern[j]) {
            if (j != 0) j = lps[j - 1]; else i++;
        }
    }
}`,
    cpp: `// Knuth-Morris-Pratt — skip re-comparisons using a failure function
std::vector<int> kmpSearch(std::string& text, std::string& pattern) {
    std::vector<int> lps = buildFailureFunction(pattern);
    std::vector<int> matches;
    int i = 0, j = 0;
    while (i < (int)text.size()) {
        // Advance both pointers while characters match
        if (text[i] == pattern[j]) { i++; j++; }
        if (j == (int)pattern.size()) { matches.push_back(i - j); j = lps[j - 1]; }
        // Mismatch — fall back using the failure function, not i
        else if (i < (int)text.size() && text[i] != pattern[j]) {
            if (j != 0) j = lps[j - 1]; else i++;
        }
    }
    return matches;
}`,
    java: `// Knuth-Morris-Pratt — skip re-comparisons using a failure function
public class KMPSearch {
    static List<Integer> kmpSearch(String text, String pattern) {
        int[] lps = buildFailureFunction(pattern);
        List<Integer> matches = new ArrayList<>();
        int i = 0, j = 0;
        while (i < text.length()) {
            // Advance both pointers while characters match
            if (text.charAt(i) == pattern.charAt(j)) { i++; j++; }
            if (j == pattern.length()) { matches.add(i - j); j = lps[j - 1]; }
            // Mismatch — fall back using the failure function, not i
            else if (i < text.length() && text.charAt(i) != pattern.charAt(j)) {
                if (j != 0) j = lps[j - 1]; else i++;
            }
        }
        return matches;
    }
}`,
  },
  'rabin-karp': {
    python: `# Rabin-Karp — compare rolling hashes before confirming a match
def rabin_karp(text, pattern):
    pattern_hash = compute_hash(pattern)
    window_hash = compute_hash(text[:len(pattern)])
    matches = []
    for i in range(len(text) - len(pattern) + 1):
        # Only do a full comparison when hashes agree
        if window_hash == pattern_hash and text[i:i + len(pattern)] == pattern:
            matches.append(i)
        # Roll the hash forward by one character
        if i + len(pattern) < len(text):
            window_hash = roll(window_hash, text[i], text[i + len(pattern)])
    return matches`,
    javascript: `// Rabin-Karp — compare rolling hashes before confirming a match
function rabinKarp(text, pattern) {
  const patternHash = computeHash(pattern);
  let windowHash = computeHash(text.slice(0, pattern.length));
  const matches = [];
  for (let i = 0; i <= text.length - pattern.length; i++) {
    // Only do a full comparison when hashes agree
    if (windowHash === patternHash && text.slice(i, i + pattern.length) === pattern) {
      matches.push(i);
    }
    // Roll the hash forward by one character
    if (i + pattern.length < text.length) {
      windowHash = roll(windowHash, text[i], text[i + pattern.length]);
    }
  }
  return matches;
}`,
    c: `// Rabin-Karp — compare rolling hashes before confirming a match
void rabin_karp(char text[], char pattern[], int matches[], int* mcount) {
    int n = strlen(text), m = strlen(pattern);
    long patternHash = compute_hash(pattern, m);
    long windowHash = compute_hash(text, m);
    for (int i = 0; i <= n - m; i++) {
        // Only do a full comparison when hashes agree
        if (windowHash == patternHash && strncmp(text + i, pattern, m) == 0) {
            matches[(*mcount)++] = i;
        }
        // Roll the hash forward by one character
        if (i + m < n) windowHash = roll(windowHash, text[i], text[i + m], m);
    }
}`,
    cpp: `// Rabin-Karp — compare rolling hashes before confirming a match
std::vector<int> rabinKarp(std::string& text, std::string& pattern) {
    long patternHash = computeHash(pattern);
    long windowHash = computeHash(text.substr(0, pattern.size()));
    std::vector<int> matches;
    for (int i = 0; i <= (int)(text.size() - pattern.size()); i++) {
        // Only do a full comparison when hashes agree
        if (windowHash == patternHash && text.substr(i, pattern.size()) == pattern) {
            matches.push_back(i);
        }
        // Roll the hash forward by one character
        if (i + (int)pattern.size() < (int)text.size()) {
            windowHash = roll(windowHash, text[i], text[i + pattern.size()]);
        }
    }
    return matches;
}`,
    java: `// Rabin-Karp — compare rolling hashes before confirming a match
public class RabinKarp {
    static List<Integer> rabinKarp(String text, String pattern) {
        long patternHash = computeHash(pattern);
        long windowHash = computeHash(text.substring(0, pattern.length()));
        List<Integer> matches = new ArrayList<>();
        for (int i = 0; i <= text.length() - pattern.length(); i++) {
            // Only do a full comparison when hashes agree
            if (windowHash == patternHash && text.substring(i, i + pattern.length()).equals(pattern)) {
                matches.add(i);
            }
            // Roll the hash forward by one character
            if (i + pattern.length() < text.length()) {
                windowHash = roll(windowHash, text.charAt(i), text.charAt(i + pattern.length()));
            }
        }
        return matches;
    }
}`,
  },
};

const DP_SOURCES = {
  'fibonacci-dp': {
    python: `# Fibonacci with Memoization — cache subproblem results
def fib(n, memo):
    if n <= 1:
        return n
    # Reuse a cached result if we have already solved this subproblem
    if memo[n] is not None:
        return memo[n]
    # Otherwise solve it from smaller subproblems and cache it
    memo[n] = fib(n - 1, memo) + fib(n - 2, memo)
    return memo[n]`,
    javascript: `// Fibonacci with Memoization — cache subproblem results
function fib(n, memo) {
  if (n <= 1) return n;
  // Reuse a cached result if we have already solved this subproblem
  if (memo[n] !== undefined) return memo[n];
  // Otherwise solve it from smaller subproblems and cache it
  memo[n] = fib(n - 1, memo) + fib(n - 2, memo);
  return memo[n];
}`,
    c: `// Fibonacci with Memoization — cache subproblem results
int fib(int n, int memo[]) {
    if (n <= 1) return n;
    // Reuse a cached result if we have already solved this subproblem
    if (memo[n] != -1) return memo[n];
    // Otherwise solve it from smaller subproblems and cache it
    memo[n] = fib(n - 1, memo) + fib(n - 2, memo);
    return memo[n];
}`,
    cpp: `// Fibonacci with Memoization — cache subproblem results
int fib(int n, std::vector<int>& memo) {
    if (n <= 1) return n;
    // Reuse a cached result if we have already solved this subproblem
    if (memo[n] != -1) return memo[n];
    // Otherwise solve it from smaller subproblems and cache it
    memo[n] = fib(n - 1, memo) + fib(n - 2, memo);
    return memo[n];
}`,
    java: `// Fibonacci with Memoization — cache subproblem results
public class FibonacciMemo {
    static int fib(int n, int[] memo) {
        if (n <= 1) return n;
        // Reuse a cached result if we have already solved this subproblem
        if (memo[n] != -1) return memo[n];
        // Otherwise solve it from smaller subproblems and cache it
        memo[n] = fib(n - 1, memo) + fib(n - 2, memo);
        return memo[n];
    }
}`,
  },
  'knapsack-dp': {
    python: `# 0/1 Knapsack — tabulate best value for each (item, capacity) pair
def knapsack(weights, values, capacity):
    n = len(weights)
    dp = [[0] * (capacity + 1) for _ in range(n + 1)]
    for i in range(1, n + 1):
        for w in range(capacity + 1):
            # Take the item only if it fits
            if weights[i - 1] <= w:
                dp[i][w] = max(dp[i - 1][w], dp[i - 1][w - weights[i - 1]] + values[i - 1])
            else:
                dp[i][w] = dp[i - 1][w]
    return dp[n][capacity]`,
    javascript: `// 0/1 Knapsack — tabulate best value for each (item, capacity) pair
function knapsack(weights, values, capacity) {
  const n = weights.length;
  const dp = Array.from({ length: n + 1 }, () => new Array(capacity + 1).fill(0));
  for (let i = 1; i <= n; i++) {
    for (let w = 0; w <= capacity; w++) {
      // Take the item only if it fits
      if (weights[i - 1] <= w) {
        dp[i][w] = Math.max(dp[i - 1][w], dp[i - 1][w - weights[i - 1]] + values[i - 1]);
      } else {
        dp[i][w] = dp[i - 1][w];
      }
    }
  }
  return dp[n][capacity];
}`,
    c: `// 0/1 Knapsack — tabulate best value for each (item, capacity) pair
int knapsack(int weights[], int values[], int n, int capacity) {
    int dp[MAXN][MAXCAP] = {0};
    for (int i = 1; i <= n; i++) {
        for (int w = 0; w <= capacity; w++) {
            // Take the item only if it fits
            if (weights[i - 1] <= w) {
                int a = dp[i - 1][w], b = dp[i - 1][w - weights[i - 1]] + values[i - 1];
                dp[i][w] = a > b ? a : b;
            } else {
                dp[i][w] = dp[i - 1][w];
            }
        }
    }
    return dp[n][capacity];
}`,
    cpp: `// 0/1 Knapsack — tabulate best value for each (item, capacity) pair
int knapsack(std::vector<int>& weights, std::vector<int>& values, int capacity) {
    int n = (int)weights.size();
    std::vector<std::vector<int>> dp(n + 1, std::vector<int>(capacity + 1, 0));
    for (int i = 1; i <= n; i++) {
        for (int w = 0; w <= capacity; w++) {
            // Take the item only if it fits
            if (weights[i - 1] <= w) {
                dp[i][w] = std::max(dp[i - 1][w], dp[i - 1][w - weights[i - 1]] + values[i - 1]);
            } else {
                dp[i][w] = dp[i - 1][w];
            }
        }
    }
    return dp[n][capacity];
}`,
    java: `// 0/1 Knapsack — tabulate best value for each (item, capacity) pair
public class Knapsack {
    static int knapsack(int[] weights, int[] values, int capacity) {
        int n = weights.length;
        int[][] dp = new int[n + 1][capacity + 1];
        for (int i = 1; i <= n; i++) {
            for (int w = 0; w <= capacity; w++) {
                // Take the item only if it fits
                if (weights[i - 1] <= w) {
                    dp[i][w] = Math.max(dp[i - 1][w], dp[i - 1][w - weights[i - 1]] + values[i - 1]);
                } else {
                    dp[i][w] = dp[i - 1][w];
                }
            }
        }
        return dp[n][capacity];
    }
}`,
  },
  'coin-change-dp': {
    python: `# Coin Change — minimum coins to make each amount up to the target
def coin_change(coins, amount):
    dp = [float('inf')] * (amount + 1)
    dp[0] = 0
    for a in range(1, amount + 1):
        # Try every coin and keep the best (minimum) result
        for coin in coins:
            if coin <= a:
                dp[a] = min(dp[a], dp[a - coin] + 1)
    return dp[amount]`,
    javascript: `// Coin Change — minimum coins to make each amount up to the target
function coinChange(coins, amount) {
  const dp = new Array(amount + 1).fill(Infinity);
  dp[0] = 0;
  for (let a = 1; a <= amount; a++) {
    // Try every coin and keep the best (minimum) result
    for (const coin of coins) {
      if (coin <= a) dp[a] = Math.min(dp[a], dp[a - coin] + 1);
    }
  }
  return dp[amount];
}`,
    c: `// Coin Change — minimum coins to make each amount up to the target
int coin_change(int coins[], int nc, int amount) {
    int dp[MAXAMT];
    for (int i = 0; i <= amount; i++) dp[i] = INT_MAX;
    dp[0] = 0;
    for (int a = 1; a <= amount; a++) {
        // Try every coin and keep the best (minimum) result
        for (int c = 0; c < nc; c++) {
            if (coins[c] <= a && dp[a - coins[c]] != INT_MAX)
                dp[a] = MIN(dp[a], dp[a - coins[c]] + 1);
        }
    }
    return dp[amount];
}`,
    cpp: `// Coin Change — minimum coins to make each amount up to the target
int coinChange(std::vector<int>& coins, int amount) {
    std::vector<int> dp(amount + 1, INT_MAX);
    dp[0] = 0;
    for (int a = 1; a <= amount; a++) {
        // Try every coin and keep the best (minimum) result
        for (int coin : coins) {
            if (coin <= a && dp[a - coin] != INT_MAX) dp[a] = std::min(dp[a], dp[a - coin] + 1);
        }
    }
    return dp[amount];
}`,
    java: `// Coin Change — minimum coins to make each amount up to the target
public class CoinChange {
    static int coinChange(int[] coins, int amount) {
        int[] dp = new int[amount + 1];
        java.util.Arrays.fill(dp, Integer.MAX_VALUE);
        dp[0] = 0;
        for (int a = 1; a <= amount; a++) {
            // Try every coin and keep the best (minimum) result
            for (int coin : coins) {
                if (coin <= a && dp[a - coin] != Integer.MAX_VALUE) dp[a] = Math.min(dp[a], dp[a - coin] + 1);
            }
        }
        return dp[amount];
    }
}`,
  },
  'lis-dp': {
    python: `# Longest Increasing Subsequence — O(n^2) tabulation
def lis(arr):
    dp = [1] * len(arr)
    for i in range(1, len(arr)):
        for j in range(i):
            # Extend the LIS ending at j if it keeps increasing
            if arr[j] < arr[i]:
                dp[i] = max(dp[i], dp[j] + 1)
    return max(dp)`,
    javascript: `// Longest Increasing Subsequence — O(n^2) tabulation
function lis(arr) {
  const dp = new Array(arr.length).fill(1);
  for (let i = 1; i < arr.length; i++) {
    for (let j = 0; j < i; j++) {
      // Extend the LIS ending at j if it keeps increasing
      if (arr[j] < arr[i]) dp[i] = Math.max(dp[i], dp[j] + 1);
    }
  }
  return Math.max(...dp);
}`,
    c: `// Longest Increasing Subsequence — O(n^2) tabulation
int lis(int arr[], int n) {
    int dp[MAXN]; for (int i = 0; i < n; i++) dp[i] = 1;
    for (int i = 1; i < n; i++) {
        for (int j = 0; j < i; j++) {
            // Extend the LIS ending at j if it keeps increasing
            if (arr[j] < arr[i] && dp[j] + 1 > dp[i]) dp[i] = dp[j] + 1;
        }
    }
    int best = dp[0];
    for (int i = 1; i < n; i++) if (dp[i] > best) best = dp[i];
    return best;
}`,
    cpp: `// Longest Increasing Subsequence — O(n^2) tabulation
int lis(std::vector<int>& arr) {
    std::vector<int> dp(arr.size(), 1);
    for (size_t i = 1; i < arr.size(); i++) {
        for (size_t j = 0; j < i; j++) {
            // Extend the LIS ending at j if it keeps increasing
            if (arr[j] < arr[i]) dp[i] = std::max(dp[i], dp[j] + 1);
        }
    }
    return *std::max_element(dp.begin(), dp.end());
}`,
    java: `// Longest Increasing Subsequence — O(n^2) tabulation
public class LIS {
    static int lis(int[] arr) {
        int[] dp = new int[arr.length];
        java.util.Arrays.fill(dp, 1);
        for (int i = 1; i < arr.length; i++) {
            for (int j = 0; j < i; j++) {
                // Extend the LIS ending at j if it keeps increasing
                if (arr[j] < arr[i]) dp[i] = Math.max(dp[i], dp[j] + 1);
            }
        }
        return java.util.Arrays.stream(dp).max().getAsInt();
    }
}`,
  },
  'bitmask-dp': {
    python: `# Bitmask DP — track achievable subset sums as bits of an integer
def achievable_sums(arr):
    dp = 1  # bit 0 (sum 0) is always achievable
    # Each number ORs in every previously-achievable sum plus itself
    for num in arr:
        dp = dp | (dp << num)
    # Bit s of dp is set if some subset sums to s
    return dp`,
    javascript: `// Bitmask DP — track achievable subset sums as bits of an integer
function achievableSums(arr) {
  let dp = 1n; // bit 0 (sum 0) is always achievable
  // Each number ORs in every previously-achievable sum plus itself
  for (const num of arr) {
    dp = dp | (dp << BigInt(num));
  }
  // Bit s of dp is set if some subset sums to s
  return dp;
}`,
    c: `// Bitmask DP — track achievable subset sums as bits of an integer
unsigned long long achievable_sums(int arr[], int n) {
    unsigned long long dp = 1; // bit 0 (sum 0) is always achievable
    // Each number ORs in every previously-achievable sum plus itself
    for (int i = 0; i < n; i++) {
        dp = dp | (dp << arr[i]);
    }
    // Bit s of dp is set if some subset sums to s
    return dp;
}`,
    cpp: `// Bitmask DP — track achievable subset sums as bits of an integer
unsigned long long achievableSums(std::vector<int>& arr) {
    unsigned long long dp = 1; // bit 0 (sum 0) is always achievable
    // Each number ORs in every previously-achievable sum plus itself
    for (int num : arr) {
        dp = dp | (dp << num);
    }
    // Bit s of dp is set if some subset sums to s
    return dp;
}`,
    java: `// Bitmask DP — track achievable subset sums as bits of an integer
public class BitmaskDP {
    static java.math.BigInteger achievableSums(int[] arr) {
        java.math.BigInteger dp = java.math.BigInteger.ONE; // bit 0 (sum 0) is always achievable
        // Each number ORs in every previously-achievable sum plus itself
        for (int num : arr) {
            dp = dp.or(dp.shiftLeft(num));
        }
        // Bit s of dp is set if some subset sums to s
        return dp;
    }
}`,
  },
  'edit-distance-dp': {
    python: `# Edit Distance (Levenshtein) — min insert/delete/replace to transform word1 -> word2
def edit_distance(word1, word2):
    m, n = len(word1), len(word2)
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    for i in range(m + 1): dp[i][0] = i
    for j in range(n + 1): dp[0][j] = j
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if word1[i - 1] == word2[j - 1]:
                dp[i][j] = dp[i - 1][j - 1]
            else:
                # Otherwise take the cheapest of delete, insert, replace
                dp[i][j] = 1 + min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1])
    return dp[m][n]`,
    javascript: `// Edit Distance (Levenshtein) — min insert/delete/replace to transform word1 -> word2
function editDistance(word1, word2) {
  const m = word1.length, n = word2.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (word1[i - 1] === word2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        // Otherwise take the cheapest of delete, insert, replace
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
  }
  return dp[m][n];
}`,
    c: `// Edit Distance (Levenshtein) — min insert/delete/replace to transform word1 -> word2
int edit_distance(char* word1, char* word2) {
    int m = strlen(word1), n = strlen(word2);
    int dp[MAXN][MAXN];
    for (int i = 0; i <= m; i++) dp[i][0] = i;
    for (int j = 0; j <= n; j++) dp[0][j] = j;
    for (int i = 1; i <= m; i++) {
        for (int j = 1; j <= n; j++) {
            if (word1[i - 1] == word2[j - 1]) {
                dp[i][j] = dp[i - 1][j - 1];
            } else {
                // Otherwise take the cheapest of delete, insert, replace
                dp[i][j] = 1 + MIN3(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
            }
        }
    }
    return dp[m][n];
}`,
    cpp: `// Edit Distance (Levenshtein) — min insert/delete/replace to transform word1 -> word2
int editDistance(std::string& word1, std::string& word2) {
    int m = word1.size(), n = word2.size();
    std::vector<std::vector<int>> dp(m + 1, std::vector<int>(n + 1, 0));
    for (int i = 0; i <= m; i++) dp[i][0] = i;
    for (int j = 0; j <= n; j++) dp[0][j] = j;
    for (int i = 1; i <= m; i++) {
        for (int j = 1; j <= n; j++) {
            if (word1[i - 1] == word2[j - 1]) {
                dp[i][j] = dp[i - 1][j - 1];
            } else {
                // Otherwise take the cheapest of delete, insert, replace
                dp[i][j] = 1 + std::min({dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]});
            }
        }
    }
    return dp[m][n];
}`,
    java: `// Edit Distance (Levenshtein) — min insert/delete/replace to transform word1 -> word2
public class EditDistance {
    static int editDistance(String word1, String word2) {
        int m = word1.length(), n = word2.length();
        int[][] dp = new int[m + 1][n + 1];
        for (int i = 0; i <= m; i++) dp[i][0] = i;
        for (int j = 0; j <= n; j++) dp[0][j] = j;
        for (int i = 1; i <= m; i++) {
            for (int j = 1; j <= n; j++) {
                if (word1.charAt(i - 1) == word2.charAt(j - 1)) {
                    dp[i][j] = dp[i - 1][j - 1];
                } else {
                    // Otherwise take the cheapest of delete, insert, replace
                    dp[i][j] = 1 + Math.min(dp[i - 1][j], Math.min(dp[i][j - 1], dp[i - 1][j - 1]));
                }
            }
        }
        return dp[m][n];
    }
}`,
  },
};

const ALL_SOURCES = { ...SEARCHING, ...SORTING, ...GRAPHS, ...TREES, ...STRUCTURES_SOURCES, ...TECHNIQUES_SOURCES, ...DP_SOURCES };

/** Languages without hand-authored idiomatic source: fall back to the algorithm's own
 *  correct pseudocode text (via PSEUDOCODE_TEMPLATES) rather than ever showing a
 *  different algorithm's code or silently mislabeling Python as this language. */
const PSEUDOCODE_FALLBACK_LANGS = new Set(['csharp', 'go', 'rust', 'kotlin']);

export function getAlgorithmSource(algorithmId, language, category = 'sorting', name = algorithmId, pseudocodeLines = null) {
  const normalized = language === 'pseudocode' ? 'python' : language;
  const entry = ALL_SOURCES[algorithmId];

  if (entry && typeof entry === 'object' && entry[normalized]) {
    return entry[normalized];
  }

  if (PSEUDOCODE_FALLBACK_LANGS.has(language) && pseudocodeLines) {
    return pseudocodeLines.join('\n');
  }

  return buildCategorySource(algorithmId, normalized, category, name);
}

export function hasAlgorithmSource(algorithmId, language) {
  const normalized = language === 'pseudocode' ? 'python' : language;
  return Boolean(ALL_SOURCES[algorithmId]?.[normalized]);
}

export default { getAlgorithmSource, hasAlgorithmSource, ALL_SOURCES };
