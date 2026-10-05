# Sorting Problem Definition
kind: concept
time: Not an algorithmic topic — this lesson defines what sorting means and which properties matter. The cost of particular algorithms is analysed in the lessons that follow.
space: Not an algorithmic topic — the properties below, such as in-place operation, describe how algorithms use memory without bounding a specific one.

## intro
Sorting means rearranging a collection so that its elements follow an agreed order. It looks like the simplest of problems, yet it is the most studied in computer science, because so many other tasks, from searching and deduplication to scheduling and merging, become easy once data is sorted.

## theory
Formal statement: given a sequence of n items and a rule that says when one item comes before another, produce a permutation of the items such that every item is not after the one that follows it. Two conditions must both hold:

- Ordered: for every neighbouring pair, the first is not greater than the second under the rule
- A permutation: the output contains exactly the same items as the input, with the same multiplicities; nothing is lost, duplicated or invented

An algorithm that returns an empty list satisfies the first condition alone, which is why a correct test checks both.

The ordering rule is a comparison. It must behave like a total preorder: transitive (if a precedes b and b precedes c, then a precedes c), and consistent (the same pair always compares the same way). A rule that violates this, such as comparing floating-point values containing NaN, gives unpredictable results.

Keys and records: real data is sorted by a key extracted from each record, such as a surname or a timestamp. Equal keys are common, which raises the question of stability.

Properties by which algorithms are classified:

- Comparison-based or not: most algorithms learn about the order only by comparing pairs and cannot beat n log n comparisons in the worst case; counting, radix and bucket sorts use the structure of the keys to run in linear time on restricted data
- Stable: records with equal keys keep their original relative order
- In place: uses O(1) extra memory (or O(log n) for recursion)
- Adaptive: runs faster when the input is already nearly sorted
- Online: can sort items as they arrive
- Internal or external: fits in memory or needs disk-based techniques

Baseline costs: simple algorithms (bubble, selection, insertion) are O(n²); efficient general ones (merge, heap, quick on average) are O(n log n); special-purpose ones can be O(n + k).

Practical advice: use the library sort (Timsort in Python and Java objects, introsort in C++), supply a key function, and implement your own only for learning, for special data or when constraints demand it.

## explain
1. Identify the items and the key by which they are ordered.
2. Decide the direction and how ties are treated.
3. Check that the comparison is a consistent ordering.
4. State the requirements: stability, memory limits, input size, nearly sorted data.
5. Choose an algorithm that matches them, or the library function.
6. Verify the result by checking both sortedness and that it is a permutation of the input.

## example
The Python program sorts `[5, 2, 9, 1, 5, 6]` with `sorted`, then checks the result with two helper functions. It is in order, and it is a permutation of the input because a `Counter` of the items matches. A list `[1, 2, 2]` fails the permutation test against `[1, 2, 3]` even though it is in order. The JavaScript program sorts records by a numeric key and prints their names: the two records with equal keys keep their original relative order, which is stability.

## real
Databases sort for indexes and ordered query results, search engines sort results by relevance, spreadsheets sort columns, and operating systems sort processes and files. Behind each there are choices about stability, memory and speed.

## pros
- A precise definition allows correctness to be tested mechanically
- Sorted data enables binary search and efficient merging
- A small set of properties explains the differences between algorithms

## cons
- Comparison-based sorting has a hard n log n lower bound
- Ties and unstable algorithms can scramble secondary order
- Inconsistent comparators silently break results

## uses
- Preparing data for binary search and range queries
- Grouping equal items and finding duplicates
- Ordering results for display
- Merging data from several sources

## mistakes
- Testing only that the output is ordered, not that it contains the same items
- Writing a comparator that is not consistent
- Assuming a sort is stable when the documentation does not promise it
- Sorting numbers as text and getting lexicographic order

## interview
**Q:** What two properties define a correct sort?
**A:** The output must be in order under the comparison, and it must be a permutation of the input, containing exactly the same elements with the same multiplicities.

**Q:** What does it mean for a sort to be stable?
**A:** Elements with equal keys appear in the output in the same relative order as in the input.

**Q:** Why can't a comparison sort beat n log n in the worst case?
**A:** There are n factorial possible orderings, and each comparison has two outcomes, so any decision tree that distinguishes all orderings has at least log base 2 of n factorial levels, which is about n log n.

## summary
Sorting produces an ordered permutation of the input under a consistent comparison. Classify algorithms by stability, memory, adaptivity and whether they rely on comparisons, and verify results with both order and permutation checks.

## codenote
The Python sample implements the two correctness checks. The JavaScript sample shows stability of the built-in sort.

## code
### python
```python
from collections import Counter

def is_sorted(items):
    return all(items[i] <= items[i + 1] for i in range(len(items) - 1))

def is_permutation(original, result):
    return Counter(original) == Counter(result)

data = [5, 2, 9, 1, 5, 6]
result = sorted(data)
print(result, is_sorted(result), is_permutation(data, result))
print(is_sorted([1, 2, 2]), is_permutation([1, 2, 3], [1, 2, 2]))
```
Output:
```text
[1, 2, 5, 5, 6, 9] True True
True False
```
### javascript
```javascript
const records = [
  { name: "a", key: 2 },
  { name: "b", key: 1 },
  { name: "c", key: 2 },
];

records.sort((x, y) => x.key - y.key);
console.log(records.map((record) => record.name).join(" "));
```
Output:
```text
b a c
```

## quiz
1. Which two conditions must a sorting result satisfy?
   - [ ] Be shorter and be unique
   - [x] Be in order and be a permutation of the input
   - [ ] Be reversed and be stable
   - [ ] Be in place and be fast
   > Order alone is not enough, because items could be lost or invented.
2. What is a stable sort?
   - [ ] One that never fails
   - [x] One that keeps the relative order of elements with equal keys
   - [ ] One that uses no memory
   - [ ] One that is always fastest
   > Stability matters when sorting records by several keys.
3. Why is a lower bound of n log n comparisons known for comparison sorts?
   - [ ] Because computers are slow
   - [x] The decision tree needs at least log of n factorial levels
   - [ ] Because of memory limits
   - [ ] Because of recursion
   > There are n factorial orderings to distinguish with two-way comparisons.
4. Which type of sort can run in linear time for restricted keys?
   - [ ] Comparison sort
   - [x] Counting sort
   - [ ] Bubble sort
   - [ ] Selection sort
   > It uses the key values themselves, not comparisons.

# Bubble Sort Analysis
kind: algorithm
time: O(n²) comparisons and swaps in the worst and average cases; O(n) in the best case on already sorted input when the early-exit flag is used.
space: O(1) extra space, as it sorts in place with a few variables.
viz: bubble-sort

## intro
Bubble sort repeatedly steps through the list, compares neighbouring elements and swaps those that are out of order, so that large values gradually bubble up to the end. It is rarely used in practice, but its simplicity makes it the standard first example for counting comparisons and swaps and for seeing why quadratic algorithms are slow.

## theory
Algorithm: for pass i from 0 to n - 2, compare each adjacent pair `a[j]` and `a[j + 1]` for j from 0 to n - 2 - i, and swap them if the left is larger. After pass i the largest i + 1 elements are in their final positions at the end, so each pass can ignore the sorted suffix.

Early exit: if a pass makes no swaps, the array is sorted and the algorithm can stop. With this flag, a sorted array needs one pass.

Analysis:

- Comparisons: pass i makes n - 1 - i comparisons. Without early exit the total is `(n - 1) + (n - 2) + ... + 1 = n(n - 1)/2`, which is Θ(n²). With early exit the best case is n - 1 comparisons.
- Swaps: each swap removes exactly one inversion (a pair of elements in the wrong order), so the number of swaps equals the number of inversions: 0 for sorted input, n(n - 1)/2 for reversed input, and about n²/4 on average for random input.
- Best case Θ(n) with early exit; average and worst case Θ(n²)
- Space: O(1); it is in place
- Stable: yes, since equal neighbours are never swapped
- Adaptive: with early exit it benefits from nearly sorted data, though only for elements that need to move toward the end; small elements near the end move only one position per pass (the turtle problem), which cocktail shaker sort addresses by alternating directions

Comparison with the other simple sorts: bubble sort does the most swaps and, on random data, is typically slower than insertion sort, which does fewer data movements, and selection sort, which does at most n - 1 swaps. Its one advantage is the ease with which it detects a sorted array.

Verdict: use library sorting in real programs; use bubble sort to teach inversions, loop invariants and the cost of quadratic algorithms.

## explain
1. Write the outer loop over passes and the inner loop over adjacent pairs, shrinking the inner range by one each pass.
2. Swap when the left element is greater than the right.
3. Track whether any swap happened in the pass and stop when none did.
4. Count comparisons and swaps if you want to confirm the analysis.
5. Verify the invariant: after pass i the last i + 1 elements are the largest, in order.
6. Test sorted, reversed, all-equal, single-element and empty inputs.

## example
The Python function returns the sorted list with the numbers of comparisons and swaps. On the sorted list `[1, 2, 3, 4, 5, 6]` it makes 5 comparisons and 0 swaps in one pass. On the reversed list it makes 15 comparisons and 15 swaps, matching n(n - 1)/2 for n = 6. For `[5, 2, 9, 1, 5, 6]` it makes 14 comparisons and 6 swaps, which is exactly the number of inversions in that list. The JavaScript program prints the array after each pass for `[5, 1, 4, 2, 8]` and stops when a pass makes no swaps.

## real
Bubble sort appears in textbooks, in introductory exercises and occasionally in tiny embedded programs, but standard libraries never use it for general sorting because of its quadratic cost.

## pros
- Very simple, with a short program and an easy invariant
- Stable and in place
- Detects an already sorted input in one pass

## cons
- Quadratic time on average and worst case
- Many swaps compared with selection sort
- Slow even on moderately sized inputs

## uses
- Teaching sorting, loop invariants and inversion counting
- Sorting tiny arrays where simplicity matters
- Checking quickly whether an array is already sorted
- Illustrating why O(n squared) algorithms do not scale

## mistakes
- Forgetting to shrink the inner loop so already sorted elements are compared again
- Omitting the early-exit flag and always doing n squared work
- Swapping on equal elements and losing stability
- Choosing it for large data

## interview
**Q:** What is the time complexity of bubble sort in the best, average and worst cases?
**A:** With an early-exit flag the best case is O(n) on sorted input, and the average and worst cases are O(n squared).

**Q:** How many swaps does bubble sort make?
**A:** Exactly as many as there are inversions in the input, from 0 for a sorted array to n times (n minus 1) over 2 for a reversed one.

**Q:** Is bubble sort stable?
**A:** Yes, because it swaps only when the left element is strictly greater than the right, so equal elements never pass each other.

## summary
Bubble sort swaps adjacent out-of-order pairs, making O(n squared) comparisons and swaps in general and O(n) on sorted input with an early exit. It is stable, in place and mostly of educational value.

## codenote
The Python sample counts comparisons and swaps for three inputs. The JavaScript sample prints the array after each pass.

## code
### python
```python
def bubble_sort(items):
    items = items[:]
    comparisons = swaps = 0
    n = len(items)
    for i in range(n - 1):
        swapped = False
        for j in range(n - 1 - i):
            comparisons += 1
            if items[j] > items[j + 1]:
                items[j], items[j + 1] = items[j + 1], items[j]
                swaps += 1
                swapped = True
        if not swapped:
            break
    return items, comparisons, swaps

print(bubble_sort([1, 2, 3, 4, 5, 6])[1:])
print(bubble_sort([6, 5, 4, 3, 2, 1])[1:])
print(bubble_sort([5, 2, 9, 1, 5, 6]))
```
Output:
```text
(5, 0)
(15, 15)
([1, 2, 5, 5, 6, 9], 14, 6)
```
### javascript
```javascript
const items = [5, 1, 4, 2, 8];
for (let pass = 0; pass < items.length - 1; pass++) {
  let swapped = false;
  for (let j = 0; j < items.length - 1 - pass; j++) {
    if (items[j] > items[j + 1]) {
      [items[j], items[j + 1]] = [items[j + 1], items[j]];
      swapped = true;
    }
  }
  if (!swapped) break;
  console.log(items.join(","));
}
```
Output:
```text
1,4,2,5,8
1,2,4,5,8
```

## quiz
1. How many comparisons does bubble sort without early exit make on n elements?
   - [ ] n
   - [x] n times (n minus 1) divided by 2
   - [ ] n log n
   - [ ] 2n
   > The passes compare n minus 1, n minus 2, down to 1 pairs.
2. What does the number of swaps equal?
   - [ ] The number of passes
   - [x] The number of inversions in the input
   - [ ] The number of distinct values
   - [ ] The array length
   > Each adjacent swap removes exactly one inversion.
3. What does the early-exit flag achieve?
   - [ ] It makes the sort unstable
   - [x] It stops after a pass with no swaps, giving O(n) on sorted input
   - [ ] It reduces the space used
   - [ ] It sorts in descending order
   > No swaps means every neighbouring pair is in order.
4. Why is bubble sort stable?
   - [ ] It uses extra memory
   - [x] It swaps only when the left element is strictly greater
   - [ ] It sorts twice
   - [ ] It compares keys backward
   > Equal elements never exchange places.

# Selection Sort Analysis
kind: algorithm
time: Θ(n²) comparisons in every case, because it always scans the whole unsorted part to find the minimum; at most n − 1 swaps.
space: O(1) extra space; it sorts in place.
viz: selection-sort

## intro
Selection sort builds the sorted list from the front: it finds the smallest element of the unsorted part and swaps it into the next position. Its claim to fame is that it moves data very little, at most one swap per position, which can matter when writing to memory is expensive, but it never speeds up on easy inputs.

## theory
Algorithm: for i from 0 to n - 2, find the index m of the smallest element in `a[i..n-1]`, and swap `a[i]` with `a[m]` if m is different from i. After step i, the first i + 1 elements are the smallest ones in their final order.

Invariant: before step i, the prefix `a[0..i-1]` contains the i smallest elements in sorted order.

Analysis:

- Comparisons: step i scans n − 1 − i elements, so the total is `(n − 1) + (n − 2) + ... + 1 = n(n − 1)/2` regardless of the input. Best, average and worst case are all Θ(n²). It is not adaptive: a sorted array costs as much as a reversed one.
- Swaps: at most n − 1, one per position, and fewer when elements are already in place; this is the minimum among the simple quadratic sorts
- Space: O(1); in place
- Stability: not stable in its usual form. The long-distance swap can jump an element over equal ones. Example: sorting `[(2, a), (2, b), (1, c)]` by the number: the first step swaps `(2, a)` with `(1, c)`, producing `[(1, c), (2, b), (2, a)]`, in which a and b have exchanged order. A stable variant inserts the minimum by shifting instead of swapping, at the cost of more writes.
- Online: no, since it needs all the data to find the minimum

Variants: bidirectional (cocktail) selection finds the minimum and the maximum in the same pass; heap sort improves the selection step by using a heap to find the extreme in O(log n), turning n² into n log n.

When it is useful: tiny arrays; situations where the cost of a swap (writing to flash memory, moving large records) dominates the cost of a comparison; teaching the idea of an invariant and the selection of extremes. Otherwise, insertion sort is usually faster on small or nearly sorted inputs, and merge or quick sort on large ones.

## explain
1. Treat the array as a sorted prefix followed by an unsorted suffix, initially with an empty prefix.
2. Scan the suffix to find the index of its minimum.
3. Swap that element into the first position of the suffix.
4. Extend the sorted prefix by one and repeat until one element remains.
5. Count comparisons and swaps to check against the formulas.
6. Test equal elements to see the instability, and test sorted and reversed inputs.

## example
On `[5, 2, 9, 1, 5, 6]` the Python function makes 15 comparisons and 4 swaps. On the sorted list it also makes 15 comparisons but 0 swaps, and on the reversed list 15 comparisons and 3 swaps, so the comparison count never changes with the input. Sorting the pairs `(2, a)`, `(2, b)`, `(1, c)` by their number gives `[(1, c), (2, b), (2, a)]`, showing the lost stability. The JavaScript program prints the array after each swap for `[64, 25, 12, 22, 11]`.

## real
Selection sort is used in teaching, in very small embedded routines and as the conceptual basis of heap sort, where the selection of the minimum or maximum is made efficient by a data structure.

## pros
- Minimal number of swaps, at most n minus 1
- Simple and in place
- Performance does not depend on input order, which makes it predictable

## cons
- Always quadratic, even on sorted input
- Not stable in its standard form
- Slower than insertion sort for small and nearly sorted data

## uses
- Teaching invariants and selection of extremes
- Sorting when writes are far more expensive than reads
- Finding the k smallest elements by stopping after k steps
- Understanding the idea behind heap sort

## mistakes
- Assuming it is stable and losing the order of equal records
- Swapping even when the minimum is already in place
- Scanning the already sorted prefix again
- Expecting it to be fast on nearly sorted data

## interview
**Q:** What is the number of comparisons made by selection sort?
**A:** Always n times (n minus 1) over 2, whatever the input order, so it is Theta of n squared in the best, average and worst cases.

**Q:** Why is selection sort not stable?
**A:** The swap moves the minimum over a range of elements and can place an earlier element after an equal one, changing the relative order of equal keys.

**Q:** When might selection sort be preferred to insertion sort?
**A:** When writes are very costly, because selection sort makes at most n minus 1 swaps, while insertion sort may shift many elements.

## summary
Selection sort repeatedly places the minimum of the unsorted part at the front, using Θ(n squared) comparisons and at most n minus 1 swaps. It is in place, not adaptive and not stable.

## codenote
The Python sample counts comparisons and swaps on three inputs and shows instability. The JavaScript sample shows the array after each swap.

## code
### python
```python
def selection_sort(items, key=lambda x: x):
    items = items[:]
    comparisons = swaps = 0
    for i in range(len(items) - 1):
        smallest = i
        for j in range(i + 1, len(items)):
            comparisons += 1
            if key(items[j]) < key(items[smallest]):
                smallest = j
        if smallest != i:
            items[i], items[smallest] = items[smallest], items[i]
            swaps += 1
    return items, comparisons, swaps

print(selection_sort([5, 2, 9, 1, 5, 6])[1:])
print(selection_sort([1, 2, 3, 4, 5, 6])[1:], selection_sort([6, 5, 4, 3, 2, 1])[1:])
pairs = [(2, "a"), (2, "b"), (1, "c")]
print(selection_sort(pairs, key=lambda pair: pair[0])[0])
```
Output:
```text
(15, 4)
(15, 0) (15, 3)
[(1, 'c'), (2, 'b'), (2, 'a')]
```
### javascript
```javascript
const items = [64, 25, 12, 22, 11];
for (let i = 0; i < items.length - 1; i++) {
  let smallest = i;
  for (let j = i + 1; j < items.length; j++) {
    if (items[j] < items[smallest]) smallest = j;
  }
  if (smallest !== i) {
    [items[i], items[smallest]] = [items[smallest], items[i]];
    console.log(items.join(","));
  }
}
```
Output:
```text
11,25,12,22,64
11,12,25,22,64
11,12,22,25,64
```

## quiz
1. How many swaps does selection sort make at most?
   - [ ] n squared
   - [ ] n log n
   - [x] n minus 1
   - [ ] 2n
   > It places one element per position.
2. How does the number of comparisons depend on the input order?
   - [ ] Sorted input is cheaper
   - [x] It does not depend on the order at all
   - [ ] Reversed input is cheaper
   - [ ] Random input is cheapest
   > It always scans the whole unsorted part.
3. Why is the standard selection sort unstable?
   - [ ] It uses recursion
   - [x] Its long-distance swap can move an element past equal ones
   - [ ] It compares with greater than or equal
   - [ ] It copies the array
   > The swap can reorder records with equal keys.
4. Which situation favours selection sort?
   - [ ] Nearly sorted data
   - [x] Writes are much more costly than comparisons
   - [ ] Huge arrays
   - [ ] Streaming data
   > Its swap count is minimal.

# Insertion Sort Analysis
kind: algorithm
time: O(n²) in the average and worst cases, O(n) in the best case on sorted input, and O(n + d) in general where d is the number of inversions.
space: O(1) extra space; it sorts in place.
viz: insertion-sort

## intro
Insertion sort works the way many people sort a hand of playing cards: take the next card and slide it into the right place among the cards already in order. It is quadratic in general, but it is fast on small inputs and on data that is already nearly sorted, which is why serious library sorts use it inside their implementation.

## theory
Algorithm: treat `a[0]` as a sorted prefix. For i from 1 to n − 1, take `key = a[i]`, shift every larger element of the prefix one position to the right, and put the key in the gap. After step i, `a[0..i]` is sorted.

Analysis:

- Each step compares the key with prefix elements from the right until it finds one that is not larger, shifting each larger element. The number of shifts in total equals the number of inversions d in the input.
- Best case: sorted input, one comparison per step, n − 1 comparisons, no shifts: Θ(n)
- Worst case: reversed input, step i compares with all i elements and shifts them all: n(n − 1)/2 comparisons and shifts: Θ(n²)
- Average case on random data: about n²/4 comparisons and shifts
- Running time is Θ(n + d), so insertion sort is adaptive: nearly sorted data, with few inversions, is sorted in nearly linear time
- Space: O(1); stable (equal elements are not passed, since the shift stops at an element that is not strictly larger); online (it can sort items as they arrive, maintaining a sorted list)

Why it matters in practice:

- For small arrays (typically fewer than 16 to 32 elements), its low overhead beats O(n log n) algorithms, so hybrid sorts such as Timsort and introsort switch to it for small subarrays and runs
- It is the best choice when the data is almost sorted, such as appending a few items to a sorted list
- Cheap to implement and verify

Improvements: binary insertion sort finds the insertion point by binary search, reducing comparisons to O(n log n) but not the shifts, which remain O(n²) in the worst case; Shell sort generalises the idea with gapped insertion sorts and achieves better than quadratic running time with good gap sequences; linked lists avoid the shifts but make binary search impossible.

## explain
1. Start with the first element as a sorted prefix.
2. For each next element, save it as the key.
3. Move leftward through the prefix, shifting elements greater than the key one place right.
4. Insert the key into the freed position.
5. Count comparisons and shifts to test the formulas.
6. Test sorted, reversed, nearly sorted, all-equal and tiny inputs.

## example
On the sorted list `[1, 2, 3, 4, 5, 6]` the Python function makes 5 comparisons and 0 shifts. On the reversed list it makes 15 comparisons and 15 shifts. The nearly sorted `[1, 2, 4, 3, 5, 6]` has a single inversion and costs 6 comparisons and 1 shift. For `[5, 2, 9, 1, 5, 6]` it makes 9 comparisons and 6 shifts, equal to the 6 inversions. The JavaScript program inserts items from a stream one by one into a sorted list and prints the list after each arrival.

## real
Sorting libraries use insertion sort for short runs, card players and spreadsheet users effectively use it by hand, and online systems that keep a sorted leaderboard insert each new score into place.

## pros
- Linear time on sorted and nearly sorted data
- Stable, in place and online
- Very low overhead for small inputs

## cons
- Quadratic on random and reversed data
- Many element shifts for large arrays
- Not suitable as a general-purpose sort for big inputs

## uses
- Sorting small arrays and short runs inside hybrid algorithms
- Keeping a list sorted as items arrive
- Sorting data that is already nearly in order
- Teaching the idea of an invariant on a sorted prefix

## mistakes
- Using a non-strict comparison in the shift and losing stability
- Writing the key into the wrong slot after the loop
- Applying it to large random inputs
- Forgetting that binary insertion saves comparisons but not shifts

## interview
**Q:** What is the running time of insertion sort in terms of inversions?
**A:** Theta of n plus d, where d is the number of inversions, because each shift removes one inversion and each step makes one extra comparison; this is why nearly sorted input is fast.

**Q:** Why do hybrid sorting algorithms use insertion sort for small subarrays?
**A:** Its simple loop has very low constant overhead, so for a few dozen elements it beats the recursive overhead of merge or quick sort.

**Q:** Is insertion sort stable and in place?
**A:** Yes to both: equal elements are never moved past each other, and only a constant amount of extra memory is used.

## summary
Insertion sort grows a sorted prefix by sliding each new element into place, costing Θ(n plus inversions). It is stable, in place, online and excellent for small or nearly sorted data, but quadratic on random data.

## codenote
The Python sample counts comparisons and shifts on four inputs. The JavaScript sample inserts a stream of values into a sorted list.

## code
### python
```python
def insertion_sort(items):
    items = items[:]
    comparisons = shifts = 0
    for i in range(1, len(items)):
        key = items[i]
        j = i - 1
        while j >= 0:
            comparisons += 1
            if items[j] > key:
                items[j + 1] = items[j]
                shifts += 1
                j -= 1
            else:
                break
        items[j + 1] = key
    return items, comparisons, shifts

print(insertion_sort([1, 2, 3, 4, 5, 6])[1:], insertion_sort([6, 5, 4, 3, 2, 1])[1:])
print(insertion_sort([1, 2, 4, 3, 5, 6])[1:])
print(insertion_sort([5, 2, 9, 1, 5, 6]))
```
Output:
```text
(5, 0) (15, 15)
(6, 1)
([1, 2, 5, 5, 6, 9], 9, 6)
```
### javascript
```javascript
const sorted = [];
for (const value of [5, 2, 8, 1]) {
  let i = sorted.length;
  while (i > 0 && sorted[i - 1] > value) i--;
  sorted.splice(i, 0, value);
  console.log(sorted.join(","));
}
```
Output:
```text
5
2,5
2,5,8
1,2,5,8
```

## quiz
1. What is the best case of insertion sort?
   - [ ] O(n squared)
   - [x] O(n) on already sorted input
   - [ ] O(log n)
   - [ ] O(n log n)
   > Each element needs only one comparison.
2. What does the total number of shifts equal?
   - [ ] The number of passes
   - [x] The number of inversions in the input
   - [ ] The array length
   - [ ] The number of distinct values
   > Each shift removes one inversion.
3. Why do library sorts use insertion sort on short runs?
   - [ ] It is the fastest for all sizes
   - [x] Its low overhead beats O(n log n) algorithms on very small inputs
   - [ ] It needs no comparisons
   - [ ] It is the only stable sort
   > Constant factors dominate for tiny arrays.
4. What does binary insertion sort reduce?
   - [ ] The number of shifts
   - [x] The number of comparisons
   - [ ] The space used
   - [ ] Nothing
   > It finds the position by binary search, but elements still have to be moved.

# Merge Sort Deep Dive
kind: algorithm
time: Θ(n log n) comparisons and moves in the best, average and worst cases, because the array is split into halves log n times and each level of merging does linear work.
space: O(n) auxiliary space for the merge buffers, plus O(log n) recursion depth.
viz: merge-sort
practice: merge-two-sorted-arrays

## intro
Merge sort is the classic divide-and-conquer sort: split the array in half, sort each half recursively, then merge the two sorted halves into one. It guarantees O(n log n) time on every input and is stable, which is why it underlies many library sorts, at the cost of extra memory.

## theory
Algorithm (top-down):

- If the array has zero or one element, it is already sorted
- Split into a left half and a right half at the midpoint
- Sort each half recursively
- Merge: keep one pointer in each sorted half; repeatedly take the smaller front element (taking the left one on ties, which preserves stability) and append it to the output; when one half is exhausted, append the rest of the other

Merging is the heart of the algorithm and is useful by itself: merging two sorted lists of lengths m and n takes O(m + n) time. It makes at most m + n − 1 comparisons.

Complexity: the recurrence is `T(n) = 2T(n/2) + Θ(n)`, which the master theorem solves to Θ(n log n). The recursion tree has log₂ n levels and each level merges n elements in total. The number of comparisons is between `(n/2) log₂ n` and `n log₂ n − n + 1`, close to the information-theoretic minimum, so merge sort makes very few comparisons.

Properties:

- Stable, if ties take from the left half first
- Not in place in the simple version: O(n) extra space for the temporary arrays; in-place merging exists but is complicated and slower
- Not adaptive in its basic form (natural merge sort and Timsort exploit existing runs)
- Parallelisable: the two recursive calls are independent
- Excellent for linked lists, where merging needs no extra space and no random access, and for external sorting of data too big for memory, because it reads sequentially

Bottom-up variant: no recursion; start with runs of length 1 and merge adjacent pairs, doubling the width each pass (1, 2, 4, ...) until one run remains. It is easy to implement iteratively and uses the same O(n log n) time.

Practical improvements: switch to insertion sort for small subarrays, avoid copying by alternating source and destination arrays, skip the merge when the largest element of the left half is not greater than the smallest of the right half, and use galloping as Timsort does.

## explain
1. Write the base case for empty or single-element arrays.
2. Split the array in two halves at the midpoint.
3. Recursively sort each half.
4. Merge with two pointers, using less than or equal to take the left element on ties.
5. Count comparisons if you want to confirm n log n behavior.
6. Test sorted, reversed, duplicates, odd lengths and empty input.

## example
The Python function sorts `[8, 7, 6, 5, 4, 3, 2, 1]` using 12 comparisons, and sorts the already sorted list with the same 12, because the merges compare the same number of elements whatever the order here, matching (n/2) log₂ n = 12 for n = 8. For `[5, 2, 9, 1, 5, 6, 3, 8]` it needs 17 comparisons, within the bound of 8 times 3 − 8 + 1 = 17. The JavaScript bottom-up version prints the array after each doubling of the run width: `2,5,1,9,5,6,3,8`, then `1,2,5,9,3,5,6,8`, then the fully sorted result.

## real
The built-in sort of Python and the object sort of Java use Timsort, a merge sort hybrid; databases use merge sort for large sorts that spill to disk; and the merge step alone is used to combine sorted results from several servers.

## pros
- Guaranteed O(n log n) in every case
- Stable, so equal keys keep their input order
- Parallel-friendly and good for linked lists and external data

## cons
- Needs O(n) extra memory in the usual array version
- Slower than quick sort in practice on small in-memory arrays because of copying
- Not adaptive unless modified

## uses
- Stable sorting of records
- Sorting linked lists
- External sorting of files larger than memory
- Merging sorted lists from several sources

## mistakes
- Taking from the right half on ties and losing stability
- Allocating a new temporary array at every recursive level without need
- Forgetting to append the remainder of the unfinished half
- Computing the midpoint incorrectly for odd lengths

## interview
**Q:** What is the time and space complexity of merge sort?
**A:** O(n log n) time in all cases and O(n) auxiliary space for the temporary arrays used in merging, plus O(log n) recursion depth.

**Q:** Why is merge sort stable?
**A:** When two elements are equal, the merge takes the one from the left half first, so equal elements keep their original relative order.

**Q:** How many comparisons does merging two sorted lists of lengths m and n need at most?
**A:** m plus n minus 1, because each comparison places one element and the last element needs no comparison.

## summary
Merge sort splits, sorts the halves recursively and merges them, guaranteeing Θ(n log n) time and stability at the price of O(n) extra space. Its merge step is a tool of its own for combining sorted data.

## codenote
The Python sample counts comparisons for three inputs. The JavaScript sample runs the bottom-up version and prints each pass.

## code
### python
```python
def merge_sort(items):
    comparisons = 0

    def sort(part):
        nonlocal comparisons
        if len(part) <= 1:
            return part
        mid = len(part) // 2
        left, right = sort(part[:mid]), sort(part[mid:])
        merged, i, j = [], 0, 0
        while i < len(left) and j < len(right):
            comparisons += 1
            if left[i] <= right[j]:
                merged.append(left[i])
                i += 1
            else:
                merged.append(right[j])
                j += 1
        return merged + left[i:] + right[j:]

    return sort(items), comparisons

print(merge_sort([8, 7, 6, 5, 4, 3, 2, 1]))
print(merge_sort([1, 2, 3, 4, 5, 6, 7, 8])[1])
print(merge_sort([5, 2, 9, 1, 5, 6, 3, 8]))
```
Output:
```text
([1, 2, 3, 4, 5, 6, 7, 8], 12)
12
([1, 2, 3, 5, 5, 6, 8, 9], 17)
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

let items = [5, 2, 9, 1, 5, 6, 3, 8];
for (let width = 1; width < items.length; width *= 2) {
  const next = [];
  for (let start = 0; start < items.length; start += 2 * width) {
    next.push(...merge(items.slice(start, start + width), items.slice(start + width, start + 2 * width)));
  }
  items = next;
  console.log(items.join(","));
}
```
Output:
```text
2,5,1,9,5,6,3,8
1,2,5,9,3,5,6,8
1,2,3,5,5,6,8,9
```

## quiz
1. What is the time complexity of merge sort in the worst case?
   - [ ] O(n)
   - [ ] O(n squared)
   - [x] O(n log n)
   - [ ] O(log n)
   > The array is halved log n times and each level merges n elements.
2. What extra memory does the usual array version need?
   - [ ] O(1)
   - [x] O(n)
   - [ ] O(n squared)
   - [ ] O(log n) only
   > The merge needs a buffer for the combined output.
3. How is stability preserved during the merge?
   - [ ] By sorting twice
   - [x] On ties the element from the left half is taken first
   - [ ] By reversing the right half
   - [ ] It is not preserved
   > Equal elements keep their original order.
4. What does bottom-up merge sort do instead of recursion?
   - [ ] Sorts by selection
   - [x] Merges runs of width 1, 2, 4 and so on in repeated passes
   - [ ] Reverses the array
   - [ ] Uses a heap
   > The run length doubles until one run remains.

# Quick Sort Deep Dive
kind: algorithm
time: O(n log n) on average and O(n²) in the worst case, where each partition is as unbalanced as possible, as with a fixed pivot on already sorted input.
space: O(log n) expected stack space when recursing into the smaller side first, and O(n) in the worst case without that precaution; sorting is in place.
viz: quick-sort
practice: kth-largest-element

## intro
Quick sort picks a pivot, rearranges the array so that smaller elements come before it and larger ones after it, and then sorts the two sides recursively. It sorts in place, has tiny constants and is usually the fastest general-purpose comparison sort in memory, but its worst case is quadratic unless the pivot is chosen with care.

## theory
Algorithm: choose a pivot; partition the array into elements less than the pivot, the pivot in its final place, and elements greater than or equal to it; recurse on the left and right parts.

Partition schemes:

- Lomuto: use the last element as the pivot; keep an index i of the boundary of smaller elements; scan j from the start, and when `a[j] < pivot` swap it to position i and increment i; finally swap the pivot into position i. Simple, but does more swaps and handles duplicates poorly.
- Hoare: two indexes move toward each other from both ends, swapping out-of-place pairs; fewer swaps and better with duplicates, but trickier boundaries.
- Three-way (Dutch national flag): split into less than, equal to and greater than the pivot; excellent when many keys are equal.

Pivot choice decides performance:

- First or last element: on sorted or reversed input every partition removes only one element, so the recursion is n deep and the comparisons total n(n − 1)/2: Θ(n²). For a sorted array of 20 elements with the last element as the pivot, the Lomuto version makes exactly 190 comparisons.
- Random pivot: the expected number of comparisons is about 1.39 n log₂ n, whatever the input order, and bad cases are astronomically unlikely
- Median of three (first, middle, last): avoids the worst case on sorted input and is cheap
- Introsort switches to heap sort when the recursion gets too deep, guaranteeing O(n log n); C++'s `std::sort` does this

Recursion depth: always recurse into the smaller part and loop on the larger one to bound the stack to O(log n). Switch to insertion sort for tiny partitions.

Properties: in place, not stable (partitioning swaps distant elements), not adaptive in the simple version, cache-friendly because it scans sequentially.

Quickselect: the same partitioning finds the k-th smallest or largest element in expected O(n) time by recursing into only the side that contains the target position. For the second largest of `[3, 2, 1, 5, 6, 4]` it returns 5, and for the 4th largest of `[3, 2, 3, 1, 2, 4, 5, 5, 6]` it returns 4.

## explain
1. Choose a pivot (random or median of three) and move it to a known position.
2. Partition so that smaller elements come before the pivot's final position and larger ones after.
3. Recurse on the left and right parts, smaller side first.
4. For selection problems, recurse only into the side containing the wanted rank.
5. Count comparisons to see the effect of the pivot rule on sorted data.
6. Test sorted, reversed, all-equal and random inputs.

## example
The Python Lomuto implementation with the last element as the pivot sorts the sorted list of 20 numbers with 190 comparisons, the quadratic worst case, and a shuffled list of the same numbers with 75, far closer to n log n. Quickselect finds the 2nd largest of `[3, 2, 1, 5, 6, 4]` as 5 and the 4th largest of the nine-element list as 4. The JavaScript three-way version sorts `[3, 1, 3, 2, 3, 1, 3]` by splitting into less, equal and greater parts, which handles the many duplicates in one pass.

## real
Many standard library sorts are quick sort derivatives (introsort in C++ and .NET, pattern-defeating quicksort in Rust and Go), and quickselect is used to compute medians and percentiles.

## pros
- Very fast in practice, with small constants
- In place and cache-friendly
- Quickselect gives linear-time selection

## cons
- Quadratic worst case with poor pivot choices
- Not stable
- Recursion depth must be controlled

## uses
- General-purpose in-memory sorting
- Finding the k-th largest element or the median
- Partitioning data around a threshold
- Library sorting in several languages

## mistakes
- Using the first or last element as pivot on data that may be sorted
- Handling many equal keys with a two-way partition and degrading to quadratic time
- Recursing on the larger side first and risking deep recursion
- Assuming the result is stable

## interview
**Q:** What is the time complexity of quick sort and when is it worst?
**A:** O(n log n) on average and O(n squared) in the worst case, which occurs when every partition is maximally unbalanced, for example a fixed first or last pivot on sorted input.

**Q:** How can the worst case be avoided in practice?
**A:** Choose the pivot randomly or by median of three, use three-way partitioning for duplicates, and fall back to heap sort when the recursion is too deep, as introsort does.

**Q:** How does quickselect find the k-th largest element?
**A:** It partitions around a pivot and recurses only into the side that contains the target rank, giving expected O(n) time.

## summary
Quick sort partitions around a pivot and recurses on both sides, averaging O(n log n) in place but degrading to O(n squared) with bad pivots. Randomise or take a median of three, handle duplicates and use quickselect for ranks.

## codenote
The Python sample counts comparisons for sorted and shuffled data and runs quickselect. The JavaScript sample uses a three-way partition on repeated values.

## code
### python
```python
import random

def quick_sort(items):
    items = items[:]
    comparisons = 0

    def sort(lo, hi):
        nonlocal comparisons
        if lo >= hi:
            return
        pivot, boundary = items[hi], lo
        for j in range(lo, hi):
            comparisons += 1
            if items[j] < pivot:
                items[boundary], items[j] = items[j], items[boundary]
                boundary += 1
        items[boundary], items[hi] = items[hi], items[boundary]
        sort(lo, boundary - 1)
        sort(boundary + 1, hi)

    sort(0, len(items) - 1)
    return items, comparisons

ordered = list(range(1, 21))
shuffled = ordered[:]
random.Random(5).shuffle(shuffled)
print(quick_sort(ordered)[1], quick_sort(shuffled)[1])

def kth_largest(items, k):
    items = items[:]
    lo, hi, target = 0, len(items) - 1, len(items) - k
    while True:
        pivot, boundary = items[hi], lo
        for j in range(lo, hi):
            if items[j] < pivot:
                items[boundary], items[j] = items[j], items[boundary]
                boundary += 1
        items[boundary], items[hi] = items[hi], items[boundary]
        if boundary == target:
            return items[boundary]
        if boundary < target:
            lo = boundary + 1
        else:
            hi = boundary - 1

print(kth_largest([3, 2, 1, 5, 6, 4], 2), kth_largest([3, 2, 3, 1, 2, 4, 5, 5, 6], 4))
```
Output:
```text
190 75
5 4
```
### javascript
```javascript
function quickSort(items) {
  if (items.length <= 1) return items;
  const pivot = items[items.length >> 1];
  const less = items.filter((x) => x < pivot);
  const equal = items.filter((x) => x === pivot);
  const greater = items.filter((x) => x > pivot);
  return [...quickSort(less), ...equal, ...quickSort(greater)];
}

console.log(quickSort([3, 1, 3, 2, 3, 1, 3]).join(","));
```
Output:
```text
1,1,2,3,3,3,3
```

## quiz
1. When does quick sort take quadratic time?
   - [ ] On random input only
   - [x] When every partition is maximally unbalanced, such as a fixed end pivot on sorted input
   - [ ] On arrays of length one
   - [ ] On arrays with duplicates only
   > Each step then removes just one element.
2. What does a random pivot guarantee?
   - [ ] A stable sort
   - [x] An expected O(n log n) running time on any input
   - [ ] A constant running time
   - [ ] Fewer swaps always
   > Bad splits become extremely unlikely.
3. What does quickselect return?
   - [ ] The sorted array
   - [x] The k-th smallest or largest element in expected linear time
   - [ ] The median only
   - [ ] The pivot
   > It recurses into one side only.
4. Why recurse into the smaller part first?
   - [ ] To make the sort stable
   - [x] It bounds the recursion depth to O(log n)
   - [ ] It reduces comparisons
   - [ ] It avoids the pivot
   > The larger part is handled by looping.
