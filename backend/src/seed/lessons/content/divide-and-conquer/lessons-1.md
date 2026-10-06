# Divide Conquer Framework
kind: concept
time: Not an algorithmic topic — the framework is a design pattern. The cost of any divide and conquer algorithm follows a recurrence of the form T(n) = a·T(n/b) + f(n), solved with the master theorem.
space: Not an algorithmic topic — memory depends on the recursion depth, typically O(log n) for the call stack when the problem is halved each time.

## intro
Divide and conquer is a way of designing algorithms: split a problem into smaller independent subproblems of the same kind, solve each recursively, and combine their answers. Merge sort, quick sort, binary search, fast exponentiation and the fast Fourier transform all follow this framework, and recognising the pattern is the first step to analysing them.

## theory
Every divide and conquer algorithm has three parts:

- Divide: break the input into a subproblems, each of size about n / b
- Conquer: solve every subproblem recursively; a small base case, such as an array of one element, is solved directly
- Combine: merge the sub-answers into the answer for the whole input, in f(n) time

The running time satisfies the recurrence T(n) = a · T(n / b) + f(n). For example, merge sort has a = 2, b = 2 and f(n) = n for the merge, so T(n) = 2T(n/2) + n, which is O(n log n). Binary search has a = 1, b = 2 and f(n) = 1, so T(n) = T(n/2) + 1, which is O(log n).

Properties that make the framework work:

- The subproblems are independent: unlike dynamic programming, they do not share work, so nothing needs to be stored between calls. If the same subproblem appears many times, memoization or dynamic programming fits better.
- The recursion depth is small when the split is balanced: halving an array of 8 elements reaches single elements after 3 levels, which is the logarithm of 8
- The base case must be reached for every input, including empty and one-element inputs, or the recursion never ends

Simple examples. Summing an array by splitting it in the middle gives the same total as a loop (31 for the data 3, 1, 4, 1, 5, 9, 2, 6), and finding the maximum by taking the larger of the two halves' maxima gives 9. The recursion for 8 elements is 3 levels deep. These are not faster than loops, but they show the structure: split, solve both halves, combine with one operation. Fast exponentiation computes x to the power n by computing x to the power n / 2 once and squaring it, with one extra multiplication when n is odd, which needs only O(log n) multiplications instead of n.

Where work is spent determines the cost. When f(n) is small compared with the number of subproblems, the leaves dominate; when the combine step is expensive, the top dominates; when they balance, every level costs about the same and the total is f(n) times the number of levels. The master theorem, covered in a later lesson, turns this into three rules.

Design checklist:

- Is the problem decomposable into independent smaller instances of the same problem?
- Does the combine step cost less than solving the problem outright?
- Can the base case handle size 0 and 1?
- Are the pieces balanced? Unbalanced splits, such as quick sort with a bad pivot, can degrade the time to O(n squared)
- Is the recursion depth acceptable for the language stack, or should it be converted to a loop?

Comparison with other paradigms: greedy makes one choice and moves on; dynamic programming reuses overlapping subproblems; divide and conquer splits into independent parts. Backtracking explores choices with undo. Many problems mix them, for example a dynamic programming table filled by divide and conquer in Knuth's optimisation.

Practical notes: switching to a simple method such as insertion sort for tiny subarrays speeds up real implementations, because recursion overhead dominates for small sizes; splitting without copying (passing indices) avoids extra memory; and independent subproblems are natural candidates for parallel execution.

## explain
1. Identify how the input can be split into smaller instances of the same problem.
2. Write the base case for the smallest inputs.
3. Recursively solve each part.
4. Combine the partial answers with a single well-defined step.
5. Write the recurrence T(n) = a·T(n/b) + f(n) and solve it with the master theorem.
6. Check the depth of the recursion and the extra memory used.

## example
The Python functions sum and maximise the array `[3, 1, 4, 1, 5, 9, 2, 6]` by splitting at the midpoint, and report 31, 9 and a recursion depth of 3. The JavaScript function raises numbers to a power by squaring the result of the half exponent: 2 to the power 10 is 1024 and 3 to the power 13 is 1594323, using about log n multiplications.

## real
Database engines sort large tables with external merge sort, graphics libraries use the fast Fourier transform, and search tools use binary search, all of which are divide and conquer algorithms.

## pros
- Gives clean recursive solutions to many problems
- Often reaches O(n log n) where a naive method is O(n squared)
- Independent subproblems can run in parallel

## cons
- Recursion adds call overhead and stack usage
- Needs an efficient combine step to pay off
- Gains nothing when subproblems overlap heavily

## uses
- Sorting with merge sort and quick sort
- Searching sorted data with binary search
- Fast multiplication of numbers and matrices
- Computational geometry such as closest pair

## mistakes
- Forgetting a base case, causing infinite recursion
- Splitting unevenly and getting quadratic behaviour
- Copying subarrays at every level and wasting memory
- Using divide and conquer where subproblems overlap, instead of memoization

## interview
**Q:** Name the three phases of a divide and conquer algorithm.
**A:** Divide the problem into smaller subproblems, conquer each by recursion (with a direct base case), and combine the sub-answers into the final answer.

**Q:** How do you analyse a divide and conquer algorithm?
**A:** Write the recurrence T(n) = a·T(n/b) + f(n) from the number of subproblems, their size and the combine cost, then solve it with the master theorem or a recursion tree.

**Q:** How does divide and conquer differ from dynamic programming?
**A:** Divide and conquer solves independent subproblems with no reuse, while dynamic programming stores answers because subproblems overlap and repeat.

## summary
The divide and conquer framework splits a problem, solves the parts recursively and combines the answers, with cost given by a recurrence of the form T(n) = a·T(n/b) + f(n). It works best with balanced, independent subproblems and a cheap combine step.

## codenote
The Python sample splits arrays to sum and maximise them. The JavaScript sample uses fast exponentiation.

## code
### python
```python
def dc_sum(values, low=0, high=None):
    if high is None:
        high = len(values)
    if high - low == 1:
        return values[low]
    mid = (low + high) // 2
    return dc_sum(values, low, mid) + dc_sum(values, mid, high)

def dc_max(values, low, high):
    if high - low == 1:
        return values[low]
    mid = (low + high) // 2
    return max(dc_max(values, low, mid), dc_max(values, mid, high))

def depth(size):
    return 0 if size == 1 else 1 + depth((size + 1) // 2)

data = [3, 1, 4, 1, 5, 9, 2, 6]
print(dc_sum(data), dc_max(data, 0, len(data)), depth(len(data)))
```
Output:
```text
31 9 3
```
### javascript
```javascript
function power(base, exponent) {
  if (exponent === 0) return 1;
  const half = power(base, Math.floor(exponent / 2));
  return exponent % 2 ? half * half * base : half * half;
}

console.log(power(2, 10), power(3, 13));
```
Output:
```text
1024 1594323
```

## quiz
1. What are the three phases of divide and conquer?
   - [ ] Sort, search, merge
   - [x] Divide, conquer, combine
   - [ ] Read, write, delete
   - [ ] Push, pop, peek
   > The problem is split, solved recursively and then merged.
2. Which recurrence describes merge sort?
   - [ ] T(n) = T(n − 1) + 1
   - [x] T(n) = 2T(n/2) + n
   - [ ] T(n) = T(n/2) + 1
   - [ ] T(n) = 3T(n/3) + 1
   > Two halves are sorted and then merged in linear time.
3. When is divide and conquer a poor fit?
   - [ ] When subproblems are independent
   - [x] When subproblems overlap heavily and repeat
   - [ ] When the input is large
   - [ ] When recursion is allowed
   > Overlapping subproblems call for memoization or dynamic programming.
4. Why must a divide and conquer function have a base case?
   - [ ] To speed up sorting
   - [x] To stop the recursion on the smallest inputs
   - [ ] To save memory
   - [ ] To avoid the combine step
   > Without it the function keeps calling itself forever.

# Merge Sort as D and C
kind: algorithm
time: O(n log n) in the best, average and worst cases, since there are log n levels and each level merges n elements in linear time.
space: O(n) for the temporary arrays used while merging, plus O(log n) for the recursion stack.
viz: merge-sort
practice: merge-two-sorted-arrays

## intro
Merge sort is the cleanest example of divide and conquer: split the array in half, sort each half recursively, then merge the two sorted halves into one sorted array. Its running time is the same on every input, which makes it a dependable choice when guaranteed performance matters.

## theory
Structure of merge sort viewed as divide and conquer:

- Divide: compute the midpoint and split the array into a left half and a right half; this takes constant time when indices are used
- Conquer: sort both halves recursively; an array with zero or one element is already sorted and forms the base case
- Combine: merge two sorted halves with two pointers, repeatedly moving the smaller front element to the output; this takes time linear in the number of elements

Recurrence: T(n) = 2T(n/2) + O(n), which the master theorem solves as O(n log n). The recursion tree has about log₂ n levels, and every level processes all n elements once during merging.

The merge step in detail: keep an index into each half; compare the two front elements; copy the smaller one (taking the left one on ties, which keeps the sort stable); when one half is exhausted, copy the rest of the other half. For two halves of sizes p and q, merging does at most p + q − 1 comparisons.

Example: sort `38, 27, 43, 3, 9, 82, 10`. The array is split into `38, 27, 43` and `3, 9, 82, 10`, then further down to single elements. Merging builds `27, 38`, then `27, 38, 43`; on the other side `3, 9` and `10, 82` merge into `3, 9, 10, 82`. The final merge produces `3, 9, 10, 27, 38, 43, 82`, using 13 comparisons in total.

Properties:

- Stable: equal elements keep their original order, if ties favour the left half
- Not in place with arrays: it needs an auxiliary buffer of size n (linked-list versions need only O(1) extra space for merging, and an in-place merge sort exists but is complicated)
- Predictable: the time does not depend on the initial order, unlike quick sort
- Excellent for external sorting, since it reads sequentially and merges runs from disk
- Parallelism: the two recursive calls are independent
- Adaptive variants such as natural merge sort and Timsort detect existing sorted runs, giving O(n) on already sorted input, and Timsort is the standard sort in Python and in Java for objects

Compared with quick sort: merge sort has a better worst case and is stable, but needs extra memory and is usually a little slower in practice because of copying. Compared with heap sort: merge sort is stable and cache-friendlier for sequential access, but heap sort uses O(1) extra space.

Implementation tips: allocate the buffer once instead of at every level, switch to insertion sort for small ranges (roughly under 16 elements), skip the merge if the last element of the left half is not greater than the first of the right half, and pass indices rather than slicing to avoid copying. Bottom-up merge sort avoids recursion by merging runs of length 1, 2, 4 and so on.

Counting work: the number of comparisons is at most n·⌈log₂ n⌉ and at least about (n/2)·log₂ n, so the cost is Θ(n log n) either way.

## explain
1. If the array has at most one element, return it.
2. Split at the midpoint into left and right.
3. Sort the left and right halves recursively.
4. Merge the two sorted halves with two pointers, taking the left element on ties.
5. Return the merged result.
6. Optionally count comparisons or reuse a single buffer.

## example
The Python function sorts `[38, 27, 43, 3, 9, 82, 10]` into `[3, 9, 10, 27, 38, 43, 82]` and reports 13 comparisons made in the merge steps. The JavaScript function merges two sorted arrays `[1, 4, 9]` and `[2, 3, 10, 11]` into `1 2 3 4 9 10 11`, which is the combine step on its own.

## real
Standard library sorts for objects, such as Python's built-in list sort and Java's object sort, are based on merge sort variants, and database engines merge sorted runs when sorting data larger than memory.

## pros
- Guaranteed O(n log n) time on every input
- Stable, so equal keys keep their order
- Works well on linked lists and on data read from disk

## cons
- Needs O(n) extra memory for arrays
- Slower than quick sort on many small in-memory arrays
- Recursive copying adds overhead without optimisation

## uses
- Sorting objects where stability matters
- External sorting of data larger than memory
- Counting inversions in an array
- Sorting linked lists efficiently

## mistakes
- Allocating new arrays at every recursion level instead of reusing a buffer
- Breaking stability by taking the right element on ties
- Computing the midpoint as low plus high over two in languages with overflow
- Forgetting to copy the leftover elements after one half runs out

## interview
**Q:** What are the time and space costs of sorting with merge sort?
**A:** O(n log n) time in all cases, because there are about log n levels of merging and each level is linear, and O(n) auxiliary space for the merge buffer.

**Q:** Why is merge sort stable and how can you break stability?
**A:** When two elements compare equal, the merge copies the one from the left half first, which preserves the original order; copying the right one first on ties breaks stability.

**Q:** When would you pick merge sort over quick sort?
**A:** When stability or a guaranteed worst case is needed, for linked lists, or for external sorting where data is read sequentially.

## summary
Merge sort splits the array, sorts each half recursively and merges the sorted halves in linear time, giving stable O(n log n) sorting at the price of O(n) extra memory.

## codenote
The Python sample sorts and counts comparisons. The JavaScript sample shows the merge step on its own.

## code
### python
```python
def merge_sort(values):
    if len(values) <= 1:
        return values, 0
    mid = len(values) // 2
    left, left_cost = merge_sort(values[:mid])
    right, right_cost = merge_sort(values[mid:])
    merged, i, j, cost = [], 0, 0, left_cost + right_cost
    while i < len(left) and j < len(right):
        cost += 1
        if left[i] <= right[j]:
            merged.append(left[i])
            i += 1
        else:
            merged.append(right[j])
            j += 1
    merged += left[i:] + right[j:]
    return merged, cost

print(merge_sort([38, 27, 43, 3, 9, 82, 10]))
```
Output:
```text
([3, 9, 10, 27, 38, 43, 82], 13)
```
### javascript
```javascript
function merge(left, right) {
  const out = [];
  let i = 0;
  let j = 0;
  while (i < left.length && j < right.length) {
    out.push(left[i] <= right[j] ? left[i++] : right[j++]);
  }
  return out.concat(left.slice(i), right.slice(j));
}

console.log(merge([1, 4, 9], [2, 3, 10, 11]).join(" "));
```
Output:
```text
1 2 3 4 9 10 11
```

## quiz
1. What is the worst-case running time of merge sort?
   - [ ] O(n)
   - [x] O(n log n)
   - [ ] O(n squared)
   - [ ] O(log n)
   > It does not depend on the order of the input.
2. How much extra memory does array merge sort need?
   - [ ] O(1)
   - [x] O(n)
   - [ ] O(n squared)
   - [ ] None at all
   > The merge step uses a buffer of size n.
3. What does the merge step do?
   - [ ] Splits an array in two
   - [x] Combines two sorted halves into one sorted array
   - [ ] Picks a pivot
   - [ ] Reverses the halves
   > Two pointers repeatedly copy the smaller front element.
4. Which tie-breaking rule keeps merge sort stable?
   - [ ] Take the right element first
   - [x] Take the left element first
   - [ ] Take a random element
   - [ ] Drop equal elements
   > Equal elements then keep their original relative order.

# Quick Sort as D and C
kind: algorithm
time: O(n log n) on average and in the best case; O(n squared) in the worst case when pivots split the array very unevenly.
space: O(log n) average stack depth for the recursion (O(n) in the worst case unless the smaller side is recursed first); the partitioning itself is in place.
viz: quick-sort

## intro
Quick sort is divide and conquer with the work moved to the divide step: pick a pivot, partition the array so that smaller elements come before it and larger ones after it, then sort the two sides recursively. No combine step is needed, because after partitioning the pivot is already in its final position.

## theory
Quick sort as divide and conquer:

- Divide: choose a pivot and partition the array into elements not greater than the pivot, the pivot itself, and elements greater than the pivot; the partition takes linear time
- Conquer: sort the left and right parts recursively
- Combine: nothing to do, because the parts already sit in the right places

Lomuto partition (pivot is the last element): keep an index `i` for the boundary of the small elements; scan `j` from the start; whenever `a[j]` is at most the pivot, swap it with `a[i]` and advance `i`; finally swap the pivot into position `i`. For `[10, 7, 8, 9, 1, 5]` the pivot 5 moves to index 1, giving a left part `[1]` and a right part `[7, 8, 9, 10]`, and recursion yields `[1, 5, 7, 8, 9, 10]`.

Hoare partition uses two pointers that move toward each other and swap out-of-place elements; it performs fewer swaps on average.

Running time: if the pivot splits the array evenly, T(n) = 2T(n/2) + n, which is O(n log n). If the pivot is always the smallest or largest element (a sorted array with the last element as pivot), T(n) = T(n − 1) + n, which is O(n squared). Randomly chosen pivots make the expected time O(n log n) for every input.

Pivot strategies:

- Random pivot: simple and robust against adversarial inputs
- Median of three (first, middle, last): avoids bad behaviour on sorted data in practice
- Three-way partitioning (smaller, equal, greater): handles many duplicate keys in linear time instead of quadratic, as in the Dutch national flag algorithm

Properties:

- In place: only O(log n) extra stack space, if the recursion always continues on the smaller side first and loops over the larger one
- Not stable: swaps can reorder equal elements
- Cache-friendly: sequential scans make it fast in practice, which is why it is the default in many libraries (introsort combines quick sort, heap sort as a fallback for deep recursion, and insertion sort for small ranges)

Quickselect: the same partition finds the k-th smallest element in expected O(n) time by recursing into only the side that contains index k. For `[7, 10, 4, 3, 20, 15]` the third smallest element (index 2) is 7. Median of medians guarantees worst-case O(n).

Comparison with merge sort: quick sort needs no extra array and has smaller constants, but it has a quadratic worst case and is not stable.

## explain
1. Choose a pivot, preferably at random or by median of three.
2. Partition so that smaller elements go left and larger go right, and put the pivot in its final position.
3. Recursively sort the left part and the right part.
4. Stop when a part has zero or one element.
5. For selection, recurse only into the part containing the wanted index.
6. Use insertion sort for tiny parts and recurse on the smaller side first.

## example
The Python partition and recursion sort `[10, 7, 8, 9, 1, 5]` into `[1, 5, 7, 8, 9, 10]`, and quickselect returns 7 for the element at index 2 of `[7, 10, 4, 3, 20, 15]`. The JavaScript partition of `[3, 6, 8, 10, 1, 2, 1]` around the last element returns the pivot index 1 and leaves the array as `1 1 8 10 3 2 6`.

## real
Language libraries such as the C++ standard sort use introsort, which is quick sort with safeguards, and database engines use quickselect to compute medians and percentiles.

## pros
- Fast in practice with small constants
- Sorts in place with logarithmic extra stack space
- The partition idea also gives quickselect

## cons
- Worst case is O(n squared) with bad pivots
- Equal elements may be reordered
- Naive versions are slow with many duplicates

## uses
- Sorting arrays held in memory for general programs
- Finding the k-th smallest element or the median
- Splitting data into smaller and larger groups around a value
- Introsort in language libraries

## mistakes
- Always choosing the first or last element as the pivot on sorted data
- Recursing on both sides without limiting the stack depth
- Forgetting that equal elements need handling, which causes quadratic time on duplicates
- Placing the pivot incorrectly after partitioning

## interview
**Q:** What is the average and worst-case complexity of quick sort?
**A:** O(n log n) on average and O(n squared) in the worst case, when each pivot is the smallest or largest element; random pivots make the bad case very unlikely.

**Q:** Why is there no combine step in quick sort?
**A:** After partitioning, the pivot is in its final position and everything to its left is not larger and everything to its right is not smaller, so sorting the two sides sorts the whole array.

**Q:** How does quickselect find the k-th smallest element?
**A:** It partitions around a pivot and then recurses into only the side containing index k, giving expected linear time.

## summary
Quick sort partitions around a pivot and recursively sorts the two sides in place, averaging O(n log n) with a quadratic worst case that random pivots make unlikely. The same partition powers quickselect.

## codenote
The Python sample sorts with Lomuto partitioning and runs quickselect. The JavaScript sample shows a single partition.

## code
### python
```python
def partition(values, low, high):
    pivot, boundary = values[high], low
    for j in range(low, high):
        if values[j] <= pivot:
            values[boundary], values[j] = values[j], values[boundary]
            boundary += 1
    values[boundary], values[high] = values[high], values[boundary]
    return boundary

def quick_sort(values, low, high):
    if low < high:
        pivot_index = partition(values, low, high)
        quick_sort(values, low, pivot_index - 1)
        quick_sort(values, pivot_index + 1, high)

def quick_select(values, k):
    values = values[:]
    low, high = 0, len(values) - 1
    while True:
        pivot_index = partition(values, low, high)
        if pivot_index == k:
            return values[pivot_index]
        if pivot_index < k:
            low = pivot_index + 1
        else:
            high = pivot_index - 1

data = [10, 7, 8, 9, 1, 5]
quick_sort(data, 0, len(data) - 1)
print(data)
print(quick_select([7, 10, 4, 3, 20, 15], 2))
```
Output:
```text
[1, 5, 7, 8, 9, 10]
7
```
### javascript
```javascript
function partition(values, low, high) {
  const pivot = values[high];
  let boundary = low;
  for (let j = low; j < high; j++) {
    if (values[j] <= pivot) {
      [values[boundary], values[j]] = [values[j], values[boundary]];
      boundary++;
    }
  }
  [values[boundary], values[high]] = [values[high], values[boundary]];
  return boundary;
}

const data = [3, 6, 8, 10, 1, 2, 1];
const index = partition(data, 0, data.length - 1);
console.log(index, data.join(" "));
```
Output:
```text
1 1 1 8 10 3 2 6
```

## quiz
1. What does the partition step do in quick sort?
   - [ ] Merges two sorted halves
   - [x] Places the pivot in its final position with smaller elements before it
   - [ ] Sorts the whole array
   - [ ] Reverses the array
   > After partitioning, the pivot never moves again.
2. What input causes quick sort's worst case with a last-element pivot?
   - [ ] Random data
   - [x] An already sorted array
   - [ ] An array of one element
   - [ ] An empty array
   > Each partition removes only one element.
3. Which is a property of quick sort?
   - [ ] It is always stable
   - [x] It sorts in place with small extra memory
   - [ ] It needs a merge buffer of size n
   - [ ] It never recurses
   > Only the recursion stack uses extra space.
4. What result does quickselect produce?
   - [ ] The whole sorted array
   - [x] The k-th smallest element in expected linear time
   - [ ] The median of medians always
   - [ ] The largest element only
   > It recurses into only one side of each partition.

# Binary Search as D and C
kind: algorithm
time: O(log n) because each step discards half of the remaining range; O(1) in the best case when the middle element matches.
space: O(log n) for the recursive version because of the call stack, and O(1) for the iterative version.
viz: binary-search
practice: binary-search-position

## intro
Binary search finds a target in a sorted array by comparing it with the middle element and discarding the half that cannot contain it. Seen as divide and conquer, it is the extreme case with a single subproblem of half the size and no combine step: the answer to the half is the answer to the whole.

## theory
Divide and conquer view:

- Divide: compute the middle index of the current range
- Conquer: if the middle element equals the target, return its index; if it is smaller than the target, search the right half; otherwise search the left half
- Combine: nothing, because the result of the single recursive call is returned as it is

Recurrence: T(n) = T(n/2) + O(1), so T(n) = O(log n). With a = 1 subproblem, b = 2 and f(n) = 1, the master theorem gives log n. A sorted array of 1,000,000 elements needs at most 20 comparisons.

Invariant: if the target is in the array, it lies within the current range `[low, high]`. Each step keeps that true while shrinking the range, and the search ends when the range is empty (target absent) or the middle element matches.

Example: in `[2, 5, 8, 12, 16, 23, 38, 56, 72, 91]` the recursive search for 23 compares with 16 (index 4), goes right, compares with 56, goes left, compares with 23 and returns index 5. The search for 7 ends with an empty range and returns −1.

Recursive versus iterative: the recursive form mirrors the divide and conquer structure; the iterative form loops with `low` and `high` and uses constant space, which most libraries prefer. Both are tail recursive, so the recursion is easily converted to a loop.

Generalisations that use the same halving idea:

- Lower and upper bound: find the first position where the value is at least the target, which handles duplicates and insertion points
- Search on the answer: binary search over a numeric range with a monotonic yes/no test, for example the smallest capacity that ships all packages in D days, or an integer square root
- Rotated sorted arrays, and peak finding: halving works when you can decide which half to keep from the middle element and its neighbour
- Fractional search: bisection for roots of continuous functions, with the number of iterations set by the required precision

Common pitfalls:

- Midpoint overflow: compute `low + (high − low) / 2` instead of `(low + high) / 2` in languages with fixed-width integers
- Infinite loops from the wrong update (`low = mid` instead of `mid + 1`)
- Applying binary search to unsorted data, which silently gives wrong answers
- Off-by-one errors with inclusive or exclusive upper bounds

Comparison with linear search: linear search is O(n) but works on any data and has no sorting cost; binary search needs sorted data (or a monotonic predicate) and wins when many searches follow one sort.

## explain
1. Set the range to the whole array.
2. Compute the middle index safely.
3. If the middle element is the target, return its index.
4. If it is smaller than the target, continue in the right half; otherwise continue in the left half.
5. If the range is empty, report that the target is absent.
6. Choose recursive or iterative form according to stack constraints.

## example
The Python recursive search finds 23 at index 5 and returns −1 for 7 in `[2, 5, 8, 12, 16, 23, 38, 56, 72, 91]`. The JavaScript function uses the same halving idea to compute integer square roots without floating point: 4 for 17, 10 for 100 and 9 for 99.

## real
Database indexes, dictionary lookups, version control tools that find the commit introducing a bug by bisection, and autocomplete systems all use binary search on ordered data.

## pros
- Logarithmic time on sorted data
- Very little code and memory
- Generalises to search on any monotonic condition

## cons
- Requires sorted data or a monotonic predicate
- Easy to get wrong with off-by-one errors
- Poor fit for structures without random access, such as linked lists

## uses
- Looking up keys in sorted arrays
- Finding insertion points and bounds
- Computing integer roots and thresholds
- Searching for answers in a numeric range

## mistakes
- Using binary search on data that is not sorted
- Writing the midpoint formula in a way that overflows
- Updating the bounds to mid instead of mid plus one, which loops forever
- Mixing inclusive and exclusive bounds within one loop

## interview
**Q:** Why is binary search O(log n)?
**A:** Each comparison discards half of the remaining range, so after k steps n divided by 2 to the power k elements remain, and the range is empty after about log base 2 of n steps.

**Q:** How do you avoid integer overflow when computing the midpoint?
**A:** Compute low plus (high minus low) divided by 2 instead of adding low and high first.

**Q:** Where else does the binary search idea apply besides sorted arrays?
**A:** To any monotonic yes/no condition over a range, such as the smallest value that satisfies a feasibility test or an integer square root.

## summary
Binary search is divide and conquer with one half-sized subproblem and no combine step, which gives O(log n) lookups in sorted data. Careful bounds and a safe midpoint avoid the classic bugs.

## codenote
The Python sample is a recursive binary search. The JavaScript sample applies halving to an integer square root.

## code
### python
```python
def search(values, target, low, high):
    if low > high:
        return -1
    mid = low + (high - low) // 2
    if values[mid] == target:
        return mid
    if values[mid] < target:
        return search(values, target, mid + 1, high)
    return search(values, target, low, mid - 1)

data = [2, 5, 8, 12, 16, 23, 38, 56, 72, 91]
print(search(data, 23, 0, len(data) - 1), search(data, 7, 0, len(data) - 1))
```
Output:
```text
5 -1
```
### javascript
```javascript
function isqrt(n) {
  let low = 0;
  let high = n;
  while (low < high) {
    const mid = Math.floor((low + high + 1) / 2);
    if (mid * mid <= n) low = mid;
    else high = mid - 1;
  }
  return low;
}

console.log(isqrt(17), isqrt(100), isqrt(99));
```
Output:
```text
4 10 9
```

## quiz
1. What does binary search require of the data?
   - [ ] To be unique
   - [x] To be sorted or monotonic
   - [ ] To be stored in a hash table
   - [ ] To contain integers only
   > Discarding half the range is only valid with an order.
2. How many subproblems does binary search create at each step?
   - [ ] Two
   - [x] One
   - [ ] Zero
   - [ ] n
   > It continues into only one half.
3. How many comparisons does binary search need for 1,000,000 sorted elements at most?
   - [ ] About 1,000
   - [x] About 20
   - [ ] About 500,000
   - [ ] About 100
   > The base 2 logarithm of a million is close to 20.
4. How should the midpoint be computed to avoid overflow?
   - [ ] (low + high) / 2
   - [x] low + (high − low) / 2
   - [ ] high − low
   - [ ] low × high
   > The subtraction keeps intermediate values within range.

# Maximum Subarray Divide Conquer
kind: algorithm
time: O(n log n) from the recurrence T(n) = 2T(n/2) + O(n), where the linear term is the scan for the best subarray crossing the midpoint.
space: O(log n) for the recursion stack, and no additional arrays are needed.

## intro
Given an array of integers, which contiguous subarray has the largest sum? Kadane's algorithm solves it in linear time, but the divide and conquer solution is a classic teaching example: the best subarray lies entirely in the left half, entirely in the right half, or crosses the midpoint, and each case is easy to compute.

## theory
Divide and conquer solution for the maximum subarray problem:

- Divide: split the array at the middle index into a left half and a right half
- Conquer: find the maximum subarray sum in the left half and in the right half recursively
- Combine: also find the best subarray that crosses the midpoint, and return the largest of the three values

The crossing subarray must contain the last element of the left half and the first element of the right half. Its best sum is the best suffix of the left half plus the best prefix of the right half: scan from the midpoint leftwards, tracking the running sum and its maximum, then scan from the midpoint plus one rightwards, doing the same, and add the two maxima. That scan costs O(n).

Recurrence: T(n) = 2T(n/2) + O(n), the same as merge sort, so the time is O(n log n).

Example: for `[-2, 1, -3, 4, -1, 2, 1, -5, 4]` the answer is 6, from the subarray `[4, -1, 2, 1]`. The middle index is 4; the left half is `[-2, 1, -3, 4, -1]` and the right half `[2, 1, -5, 4]`. The best crossing subarray ends at index 4 and extends into the right half: its best left suffix is `4, -1` with sum 3 and its best right prefix is `2, 1` with sum 3, so the crossing sum is 6, which beats the best found inside either half.

Base case: a single element is its own maximum subarray, even if it is negative. This matches the convention that the subarray must be non-empty; if empty subarrays are allowed, the answer is at least zero, so adjust the base case and the scans accordingly.

Alternatives and comparison:

- Brute force over all pairs of endpoints with prefix sums is O(n squared)
- Kadane's algorithm keeps the best sum ending at each position and runs in O(n) time with O(1) space; it is the practical solution
- A segment-tree style variant stores four values per node (total, best prefix, best suffix, best subarray) so that range queries and point updates are O(log n); this is the same divide and conquer combine, packaged as a data structure

Why teach the divide and conquer version: it shows how a combine step can handle the "crossing" case, a pattern that recurs in other problems such as the closest pair of points, counting inversions and longest common prefix variants. Knowing the pattern lets you solve new problems by asking: what can span the split, and how do I compute it in linear time?

Edge cases: all negative values (the answer is the largest single element), one element, and arrays with zeros. Overflow can matter for very large inputs in fixed-width languages.

## explain
1. If the range has one element, return it.
2. Compute the midpoint and recurse on the left and right halves.
3. Scan left from the midpoint to find the best suffix sum, and scan right from the midpoint plus one for the best prefix sum.
4. Add them to get the best crossing sum.
5. Return the maximum of the left, right and crossing results.
6. Compare the result with Kadane's linear algorithm in tests.

## example
The Python function returns 6 for `[-2, 1, -3, 4, -1, 2, 1, -5, 4]` with the crossing case contributing the winning subarray. The JavaScript function returns 10 for `[5, -9, 6, -2, 3, -1, 4, -8, 2]`, using the subarray `6, -2, 3, -1, 4`.

## real
Finance tools search for the period with the best cumulative gain in a series of daily changes, and genomics tools look for the stretch of a sequence with the highest score.

## pros
- Illustrates how to handle the crossing case in a combine step
- Needs no extra arrays
- The idea extends to segment trees

## cons
- Slower than Kadane's linear algorithm
- The crossing scan is easy to get wrong
- More code than the iterative solution

## uses
- Teaching combine steps that handle spanning solutions
- Finding the best period in a series of gains and losses
- Building segment trees that answer range maximum subarray queries
- Cross-checking Kadane's algorithm in tests

## mistakes
- Forgetting the crossing subarray and returning only the best of the two halves
- Starting the running maximum at zero, which wrongly allows empty subarrays
- Mixing up the split indices so the halves overlap
- Using this version for large inputs where Kadane's is expected

## interview
**Q:** What are the three cases for the maximum subarray in divide and conquer?
**A:** The best subarray lies entirely in the left half, entirely in the right half, or crosses the midpoint; the algorithm computes all three and returns the maximum.

**Q:** How do you compute the best crossing sum?
**A:** Add the best suffix sum of the left half, scanning left from the midpoint, to the best prefix sum of the right half, scanning right from the next element; both scans are linear.

**Q:** Why is the time O(n log n) and what is faster?
**A:** The recurrence is T(n) = 2T(n/2) + O(n); Kadane's algorithm solves the problem in O(n) with constant space.

## summary
The maximum subarray can be found by recursing on both halves and computing the best crossing subarray in linear time, for O(n log n) overall. Kadane's algorithm is faster, but this solution teaches how combine steps handle solutions that span the split.

## codenote
The Python sample uses a standard test array. The JavaScript sample uses a different array.

## code
### python
```python
def best_sum(values, low, high):
    if low == high:
        return values[low]
    mid = (low + high) // 2
    left_best, total = float("-inf"), 0
    for i in range(mid, low - 1, -1):
        total += values[i]
        left_best = max(left_best, total)
    right_best, total = float("-inf"), 0
    for i in range(mid + 1, high + 1):
        total += values[i]
        right_best = max(right_best, total)
    return max(best_sum(values, low, mid), best_sum(values, mid + 1, high), left_best + right_best)

data = [-2, 1, -3, 4, -1, 2, 1, -5, 4]
print(best_sum(data, 0, len(data) - 1))
```
Output:
```text
6
```
### javascript
```javascript
function bestSum(values, low, high) {
  if (low === high) return values[low];
  const mid = Math.floor((low + high) / 2);
  let leftBest = -Infinity;
  let total = 0;
  for (let i = mid; i >= low; i--) {
    total += values[i];
    leftBest = Math.max(leftBest, total);
  }
  let rightBest = -Infinity;
  total = 0;
  for (let i = mid + 1; i <= high; i++) {
    total += values[i];
    rightBest = Math.max(rightBest, total);
  }
  return Math.max(bestSum(values, low, mid), bestSum(values, mid + 1, high), leftBest + rightBest);
}

const data = [5, -9, 6, -2, 3, -1, 4, -8, 2];
console.log(bestSum(data, 0, data.length - 1));
```
Output:
```text
10
```

## quiz
1. Which three cases does the divide and conquer maximum subarray consider?
   - [ ] Positive, negative and zero
   - [x] Entirely left, entirely right, and crossing the midpoint
   - [ ] First, middle and last element
   - [ ] Sorted, reversed and random
   > The crossing case is the one that the recursion cannot see.
2. How is the crossing sum built?
   - [ ] From the whole array total
   - [x] From the best suffix of the left half plus the best prefix of the right half
   - [ ] From the two largest elements
   - [ ] From the median
   > Both pieces must touch the midpoint to form a contiguous subarray.
3. What is the running time of this approach?
   - [ ] O(n)
   - [x] O(n log n)
   - [ ] O(n squared)
   - [ ] O(log n)
   > The recurrence is the same as the one for merge sort.
4. What is the maximum subarray sum if all numbers are negative?
   - [ ] Zero
   - [x] The largest single element
   - [ ] The sum of all elements
   - [ ] Undefined
   > A non-empty subarray must contain at least one element.

# Closest Pair of Points
kind: algorithm
time: O(n log n) with the strip step done by sorting by y once and merging, or O(n log squared n) if the strip is sorted at every level; brute force is O(n squared).
space: O(n) for the sorted copies and the strip array, plus O(log n) for the recursion.

## intro
Given n points in the plane, which two are closest together? Checking all pairs takes quadratic time. Divide and conquer splits the points by a vertical line, finds the closest pair on each side, and then checks only the narrow strip around the line where a closer cross-pair could hide, giving O(n log n) time.

## theory
Algorithm:

- Sort the points by x coordinate once
- Divide: split at the median x into a left half and a right half with equal numbers of points
- Conquer: find the smallest distance `d_left` in the left half and `d_right` in the right half, and let `d = min(d_left, d_right)`; a base case of two or three points is solved by brute force
- Combine: a pair with one point on each side can only beat `d` if both points lie within distance `d` of the dividing line, so collect the points in that strip, sort them by y, and compare each point with the next few points whose y difference is less than `d`

Why only a constant number of neighbours must be checked: inside the strip, consider a rectangle of width 2d and height d. Each half of it is a d by d square, and no two points in the same half are closer than d, so at most four points fit in each square, and at most eight in the whole rectangle. So every point needs to be compared with only a bounded number of points above it in y order (at most seven), making the strip scan linear after sorting.

Recurrence: T(n) = 2T(n/2) + O(n) if the strip is already ordered by y (obtained by merging the sorted halves as in merge sort), which is O(n log n). If the strip is sorted afresh at every level, the cost is T(n) = 2T(n/2) + O(n log n), which is O(n log squared n); both are far better than O(n squared).

Example with points `(2, 3)`, `(12, 30)`, `(40, 50)`, `(5, 1)`, `(12, 10)` and `(3, 4)`: the closest pair is `(2, 3)` and `(3, 4)` at distance √2, about 1.4142. A brute-force check agrees, and a randomised comparison of the divide and conquer result against brute force on 100 small point sets finds no differences.

Implementation notes:

- Use squared distances to avoid square roots, converting at the end
- Duplicate points give distance zero, so handle them naturally
- Ties in the x coordinate need a consistent split, for example splitting by index in the sorted order
- Keep the strip test as `abs(x − mid_x) < d`

Extensions: the same idea works in higher dimensions with a larger constant, the closest pair can also be found by randomised incremental grid algorithms in expected linear time, and spatial structures such as k-d trees answer nearest neighbour queries for many query points.

Comparison: brute force is simple and fine for a few hundred points; the divide and conquer algorithm matters for large data sets, for example a million points, where quadratic time is impossible.

## explain
1. Sort the points by x coordinate.
2. Solve small inputs by brute force.
3. Split at the median x and recursively find the closest pair on each side.
4. Let d be the smaller of the two distances.
5. Collect the points within d of the dividing line, sort them by y, and compare each with the following points whose y difference is less than d.
6. Return the smallest distance found.

## example
The Python implementation returns 1.4142 for the six points above, matching the brute-force distance, and a check on 100 random point sets confirms they always agree. The JavaScript function compares only the brute-force squared distances for a small point set, to show the baseline that the strip step improves on, and reports the squared distance 2 for the closest pair `(1, 1)` and `(2, 2)` among four points.

## real
Air traffic control systems check for aircraft that are too close, collision detection in games finds nearby objects, and geographic tools find the nearest pair of stores or stations.

## pros
- Reduces the time from quadratic to O(n log n)
- Demonstrates a bounded-neighbour combine step
- Extends to higher dimensions

## cons
- More complex than the brute-force method
- Needs care with ties and duplicate points
- Floating-point distances can cause comparison issues

## uses
- Collision and proximity detection
- Finding the nearest pair of locations
- Clustering and data analysis preprocessing
- Teaching geometric divide and conquer

## mistakes
- Checking every pair in the strip and losing the linear bound
- Using the wrong strip width, such as d instead of the distance from the line
- Splitting at an index without sorting by x first
- Forgetting the base case of two or three points

## interview
**Q:** How does the divide and conquer closest pair algorithm work?
**A:** Sort by x, split in half, find the closest pair in each half, take the smaller distance d, then check the strip of width 2d around the dividing line for a closer cross pair by comparing points sorted by y.

**Q:** Why does each point in the strip need only a constant number of comparisons?
**A:** Within a d by 2d rectangle only a bounded number of points can exist without two being closer than d, so at most a handful of points above each point need checking.

**Q:** How does the running time compare with checking all pairs?
**A:** O(n log n), compared with O(n squared) for comparing all pairs.

## summary
The closest pair of points is found by splitting along x, solving both halves and scanning a narrow strip, where a packing argument bounds the number of comparisons. The result is O(n log n) instead of quadratic time.

## codenote
The Python sample implements the algorithm and checks it against brute force. The JavaScript sample shows the brute-force baseline.

## code
### python
```python
import math
import random

def brute(points):
    return min(math.dist(points[i], points[j]) for i in range(len(points)) for j in range(i + 1, len(points)))

def closest(by_x):
    n = len(by_x)
    if n <= 3:
        return brute(by_x)
    mid = n // 2
    mid_x = by_x[mid][0]
    best = min(closest(by_x[:mid]), closest(by_x[mid:]))
    strip = sorted((p for p in by_x if abs(p[0] - mid_x) < best), key=lambda p: p[1])
    for i in range(len(strip)):
        for j in range(i + 1, len(strip)):
            if strip[j][1] - strip[i][1] >= best:
                break
            best = min(best, math.dist(strip[i], strip[j]))
    return best

points = [(2, 3), (12, 30), (40, 50), (5, 1), (12, 10), (3, 4)]
print(round(closest(sorted(points)), 4), round(brute(points), 4))

rng = random.Random(8)
agree = True
for _ in range(100):
    sample = list({(rng.randint(0, 50), rng.randint(0, 50)) for _ in range(rng.randint(2, 12))})
    if len(sample) >= 2:
        agree = agree and abs(closest(sorted(sample)) - brute(sample)) < 1e-9
print(agree)
```
Output:
```text
1.4142 1.4142
True
```
### javascript
```javascript
function closestSquared(points) {
  let best = Infinity;
  for (let i = 0; i < points.length; i++) {
    for (let j = i + 1; j < points.length; j++) {
      const dx = points[i][0] - points[j][0];
      const dy = points[i][1] - points[j][1];
      best = Math.min(best, dx * dx + dy * dy);
    }
  }
  return best;
}

console.log(closestSquared([[1, 1], [2, 2], [7, 5], [9, 9]]));
```
Output:
```text
2
```

## quiz
1. How does the algorithm split the points?
   - [ ] By random sampling
   - [x] By a vertical line at the median x coordinate
   - [ ] By distance from the origin
   - [ ] By the smallest y
   > Each side then holds half of the points.
2. Which points must be examined for a closer cross pair?
   - [ ] All points
   - [x] Those within distance d of the dividing line
   - [ ] Only the leftmost points
   - [ ] Those with equal y
   > A closer pair across the line cannot be farther than d from it.
3. Why is only a constant number of comparisons needed per strip point?
   - [ ] The strip has few points always
   - [x] A packing argument limits how many points fit in a d by 2d rectangle
   - [ ] Sorting removes duplicates
   - [ ] Distances are integers
   > More points would force two within distance d on the same side.
4. What is the overall time complexity?
   - [ ] O(n squared)
   - [x] O(n log n)
   - [ ] O(n)
   - [ ] O(log n)
   > The recurrence has two half-sized subproblems and a linear combine.
