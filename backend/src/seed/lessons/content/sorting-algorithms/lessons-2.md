# Heap Sort Overview
kind: algorithm
time: Θ(n log n) in all cases: building the heap takes O(n) and each of the n extractions takes O(log n).
space: O(1) extra space, since the heap lives inside the input array and the sort works in place.
viz: heap-sort
practice: kth-largest-element

## intro
Heap sort turns the array into a binary max-heap, then repeatedly moves the largest element to the end and repairs the heap. It guarantees n log n time like merge sort and sorts in place like quick sort, which makes it the dependable fallback of hybrid algorithms, though it is slower in practice than a good quick sort.

## theory
A binary heap stored in an array: the children of index i are at 2i + 1 and 2i + 2, and its parent is at (i − 1) // 2. In a max-heap every parent is at least as large as its children, so the root is the maximum. The tree is complete, so the array has no gaps.

Core operation, sift-down: if a node is smaller than a child, swap it with the larger child and continue downward. It costs O(log n), the height of the tree.

Algorithm:

- Build the max-heap by calling sift-down on every non-leaf node, from index `n // 2 − 1` down to 0. Although there are n/2 calls, most are on low nodes, and the total cost is O(n), not O(n log n).
- For `end` from n − 1 down to 1: swap the root (the maximum) with `a[end]`, shrink the heap size to `end`, and sift the new root down. After each step the largest remaining element sits in its final place at the end.

Properties:

- Time Θ(n log n) in best, average and worst cases; not adaptive, so sorted input costs as much as random input
- Space O(1); in place
- Not stable: the swaps of the root with the last element can reorder equal keys
- Poor cache behavior compared with quick sort, since sift-down jumps between distant parents and children
- Worst-case guarantee makes it the fallback in introsort, which switches to it when quick sort recursion gets too deep

Related uses of heaps:

- Priority queues: `heapq` in Python provides a min-heap; `heapq.nlargest(k, items)` returns the k largest elements in O(n log k)
- Selecting the k-th largest element by keeping a min-heap of size k
- Partial sorting: stop after k extractions to get the top k in O(n + k log n)
- Merging k sorted streams, and Dijkstra's algorithm

Variants: bottom-up heap sort reduces comparisons in sift-down; smoothsort adapts to presorted input; a min-heap variant sorts descending, or writes to a separate output.

## explain
1. Understand the array layout of the heap: parent and child index formulas.
2. Build a max-heap in place with sift-down from the last parent to the root.
3. Swap the root with the last element of the current heap and reduce the heap size by one.
4. Sift the new root down to restore the heap property.
5. Repeat until the heap has one element.
6. Test sorted, reversed, duplicates, single-element and empty inputs.

## example
The Python implementation builds the heap for `[5, 2, 9, 1, 5, 6, 3, 8]` and sorts it into `[1, 2, 3, 5, 5, 6, 8, 9]`. The library function `heapq.nlargest(3, [5, 2, 9, 1, 5, 6])` returns `[9, 6, 5]` without sorting everything. The JavaScript version uses the same sift-down to sort `[5, 2, 9, 1, 5, 6]` and prints the result.

## real
Operating system schedulers and event simulators rely on heaps as priority queues, embedded systems use heap sort for its predictable time and constant memory, and introsort uses it as a safety net.

## pros
- Guaranteed O(n log n) with O(1) extra space
- No worst-case surprises
- The same heap serves priority queues and top-k selection

## cons
- Not stable
- Slower than quick sort in practice because of poor locality
- Not adaptive to presorted input

## uses
- Sorting with strict memory limits
- Selecting the k largest or smallest elements
- Fallback inside introsort
- Teaching heaps and priority queues

## mistakes
- Starting heap construction from the root instead of the last parent
- Forgetting to reduce the heap size after each swap
- Using the wrong child indexes
- Expecting it to preserve the order of equal keys

## interview
**Q:** What are the time and space complexities of heap sort?
**A:** Theta of n log n time in all cases and O(1) extra space because the heap is built inside the input array.

**Q:** Why is building a heap O(n) and not O(n log n)?
**A:** Most nodes are near the bottom and sift down only a short distance; summing the work over all levels gives a total proportional to n.

**Q:** Why is heap sort not stable?
**A:** Swapping the root with the last element moves equal keys across each other, so their original order is not preserved.

## summary
Heap sort builds a max-heap in O(n) and extracts the maximum n times at O(log n) each, sorting in place with guaranteed n log n time. It is not stable and is cache-unfriendly, but heaps give top-k selection and priority queues.

## codenote
The Python sample sorts with an explicit sift-down and uses the library for the top three. The JavaScript sample implements the same sort.

## code
### python
```python
import heapq

def heap_sort(items):
    items = items[:]
    n = len(items)

    def sift_down(i, size):
        while True:
            left, right, largest = 2 * i + 1, 2 * i + 2, i
            if left < size and items[left] > items[largest]:
                largest = left
            if right < size and items[right] > items[largest]:
                largest = right
            if largest == i:
                return
            items[i], items[largest] = items[largest], items[i]
            i = largest

    for i in range(n // 2 - 1, -1, -1):
        sift_down(i, n)
    for end in range(n - 1, 0, -1):
        items[0], items[end] = items[end], items[0]
        sift_down(0, end)
    return items

print(heap_sort([5, 2, 9, 1, 5, 6, 3, 8]))
print(heapq.nlargest(3, [5, 2, 9, 1, 5, 6]))
```
Output:
```text
[1, 2, 3, 5, 5, 6, 8, 9]
[9, 6, 5]
```
### javascript
```javascript
function heapSort(items) {
  const a = [...items];
  const siftDown = (i, size) => {
    for (;;) {
      let largest = i;
      const left = 2 * i + 1;
      const right = 2 * i + 2;
      if (left < size && a[left] > a[largest]) largest = left;
      if (right < size && a[right] > a[largest]) largest = right;
      if (largest === i) return;
      [a[i], a[largest]] = [a[largest], a[i]];
      i = largest;
    }
  };
  for (let i = (a.length >> 1) - 1; i >= 0; i--) siftDown(i, a.length);
  for (let end = a.length - 1; end > 0; end--) {
    [a[0], a[end]] = [a[end], a[0]];
    siftDown(0, end);
  }
  return a;
}

console.log(heapSort([5, 2, 9, 1, 5, 6]).join(","));
```
Output:
```text
1,2,5,5,6,9
```

## quiz
1. Where are the children of index i in an array-based binary heap?
   - [ ] i + 1 and i + 2
   - [x] 2i + 1 and 2i + 2
   - [ ] i / 2 and i / 3
   - [ ] 2i and 2i + 3
   > The tree is stored level by level in the array.
2. What is the cost of building a heap from n elements?
   - [ ] O(n log n)
   - [x] O(n)
   - [ ] O(log n)
   - [ ] O(n squared)
   > Most nodes sift down only a short distance.
3. What does heap sort do after building the max-heap?
   - [ ] Reverses the array
   - [x] Repeatedly swaps the root with the last heap element and sifts down
   - [ ] Merges two halves
   - [ ] Counts the keys
   > Each swap puts the current maximum in its final position.
4. What is a weakness of heap sort?
   - [ ] Quadratic worst case
   - [x] It is not stable and has poor cache locality
   - [ ] It needs O(n) extra space
   - [ ] It cannot sort numbers
   > Its jumps across the array are slower than the sequential scans of quick sort.

# Counting Sort
kind: algorithm
time: Θ(n + k) for n items whose keys are integers in a range of size k; linear when k is O(n).
space: O(n + k) for the output array and the counts, so it is not in place.
viz: counting-sort

## intro
Counting sort does not compare elements at all. When the keys are small integers, it counts how many times each value occurs and uses those counts to write the elements directly into their final positions. By stepping outside the comparison model it beats the n log n lower bound, but only when the range of keys is small.

## theory
Algorithm for non-negative integer keys in `0..k-1`:

- Count: make an array `count` of size k and increment `count[key]` for each item
- Prefix sums: replace each `count[i]` by the sum of all counts up to i, so `count[i]` becomes the number of items with key at most i, which is also one past the last output position for key i
- Place: walk the input from right to left; for each item decrement `count[key]` and write the item to `output[count[key]]`

Walking from the right and decrementing makes the sort stable: equal keys are placed in their original order. This is what allows counting sort to serve as the digit sort inside radix sort.

Complexity: one pass to count (n), one over the counts (k), one to place (n): Θ(n + k) time. Memory is O(n + k). When k is much larger than n (sorting 100 numbers between 0 and a billion), counting sort wastes time and space and loses to comparison sorts.

Simplified version: if only the keys matter (not attached records), you can skip the prefix sums and rewrite the array by emitting each value `count[v]` times.

Handling other keys:

- Negative integers: subtract the minimum to shift the range to start at 0
- Characters: use the character code minus the code of "a" or a 256-entry table
- Records: sort by an integer key extracted from each, preserving stability with the prefix-sum method
- Large keys: not suitable, but radix sort can break them into digits
- Floating-point numbers: not suitable directly; bucket sort distributes them into ranges

Properties: stable (with the right-to-left placement), not in place, not comparison-based, and non-adaptive. It is ideal for sorting grades, ages, digits, small identifiers, characters and as a subroutine.

## explain
1. Find the range of keys, minimum and maximum, and confirm that k is small relative to n.
2. Count the occurrences of each key.
3. Convert the counts into cumulative positions.
4. Walk the input from right to left, placing each item at the position given by its decremented count.
5. Copy the output back if the result must be in the original array.
6. Test with duplicates, a single value, negative values (after shifting) and an empty array.

## example
Sorting `[4, 2, 2, 8, 3, 3, 1]` counts the keys, turns the counts into cumulative positions and places the items from right to left, giving `[1, 2, 2, 3, 3, 4, 8]`. The counts after the prefix step show the end position of each key. The JavaScript sample counts the letters of "banana" with a table of 26 entries and rewrites the string in order, giving "aaabnn".

## real
Counting sort sorts exam scores, ages, pixel intensities (histogram equalisation), DNA letters and the digits inside radix sort, always in linear time because the key range is small.

## pros
- Linear time when the key range is small
- Stable when implemented with prefix sums
- Simple, with no comparisons

## cons
- Needs extra memory proportional to n plus the range
- Useless when the range is much larger than n
- Works only for integer-like keys

## uses
- Sorting small integers, characters and bounded scores
- The digit sorting step of radix sort
- Computing histograms and frequency tables
- Sorting records by a small integer key stably

## mistakes
- Allocating a count array for a huge key range
- Placing items from left to right and losing stability
- Forgetting to shift negative keys
- Using it for floating-point keys without a transformation

## interview
**Q:** What is the time complexity of counting sort?
**A:** Theta of n plus k, where n is the number of items and k the size of the key range, so it is linear when k is proportional to n.

**Q:** How does counting sort break the n log n lower bound?
**A:** It never compares elements; it uses the key values as array indexes, which falls outside the comparison model to which the lower bound applies.

**Q:** Why do we iterate from right to left when placing elements?
**A:** Together with decrementing the cumulative count, it places later equal elements in later positions, making the sort stable.

## summary
Counting sort tallies keys, computes cumulative positions and places each item directly, in Θ(n plus k) time and with stability. It is excellent for small key ranges and useless for sparse huge ones.

## codenote
The Python sample sorts integers with prefix sums and shows the cumulative counts. The JavaScript sample sorts the letters of a word.

## code
### python
```python
def counting_sort(items):
    size = max(items) + 1
    counts = [0] * size
    for value in items:
        counts[value] += 1
    for i in range(1, size):
        counts[i] += counts[i - 1]
    cumulative = counts[:]
    output = [0] * len(items)
    for value in reversed(items):
        counts[value] -= 1
        output[counts[value]] = value
    return output, cumulative

result, cumulative = counting_sort([4, 2, 2, 8, 3, 3, 1])
print(result)
print(cumulative)
```
Output:
```text
[1, 2, 2, 3, 3, 4, 8]
[0, 1, 3, 5, 6, 6, 6, 6, 7]
```
### javascript
```javascript
const word = "banana";
const counts = new Array(26).fill(0);
for (const letter of word) counts[letter.charCodeAt(0) - 97]++;

let sorted = "";
counts.forEach((count, index) => {
  sorted += String.fromCharCode(97 + index).repeat(count);
});
console.log(sorted);
```
Output:
```text
aaabnn
```

## quiz
1. What is the running time of counting sort for n items with keys below k?
   - [ ] O(n log n)
   - [x] O(n + k)
   - [ ] O(n squared)
   - [ ] O(k squared)
   > It makes passes over the items and the counts.
2. Why is counting sort not a comparison sort?
   - [ ] It uses recursion
   - [x] It uses the key values as indexes instead of comparing items
   - [ ] It is stable
   - [ ] It sorts only strings
   > The n log n lower bound applies only to comparison-based algorithms.
3. When is counting sort a poor choice?
   - [ ] For ages of people
   - [x] For a few numbers spread over a range of billions
   - [ ] For letters
   - [ ] For small scores
   > The count array would be enormous compared with the data.
4. What makes the prefix-sum version stable?
   - [ ] Sorting the counts
   - [x] Placing items from right to left while decrementing the cumulative count
   - [ ] Using a bigger array
   - [ ] Skipping duplicates
   > Later equal items go to later positions.

# Radix Sort
kind: algorithm
time: Θ(d · (n + b)) for n numbers with d digits in base b; this is linear in n when the number of digits and the base are constant.
space: O(n + b) for the buckets or the output array of each digit pass.
viz: radix-sort

## intro
Radix sort sorts numbers digit by digit instead of comparing them whole. Starting with the least significant digit and using a stable sort for each pass, it orders the numbers after as many passes as they have digits. For fixed-width keys such as 32-bit integers or strings of equal length, it runs in linear time.

## theory
Least significant digit (LSD) radix sort:

- Choose a base b (10 for decimal digits, 256 for bytes) and let d be the number of digits of the largest key
- For each digit position from the least significant to the most significant, stably sort all keys by that digit alone, usually with counting sort or bucket distribution
- After the last pass the keys are fully sorted

Why it works: stability. When the keys are sorted by the digit at position p, the earlier passes, which established the order of the lower digits, are preserved among keys with equal digit p. Induction on p shows that after pass p the keys are sorted by their lowest p + 1 digits.

Example with `[170, 45, 75, 90, 802, 24, 2, 66]`:

- After sorting by ones digit: `[170, 90, 802, 2, 24, 45, 75, 66]`
- After sorting by tens digit: `[802, 2, 24, 45, 66, 170, 75, 90]`
- After sorting by hundreds digit: `[2, 24, 45, 66, 75, 90, 170, 802]`

Complexity: each pass costs Θ(n + b), and there are d passes: Θ(d(n + b)). With 32-bit integers and base 256 there are 4 passes of a counting sort with 256 buckets. If keys have b^d values, the total grows like n log_b(range), so choosing a larger base gives fewer passes but larger buckets.

Variants and comparisons:

- MSD (most significant digit) radix sort starts from the high digit and recurses on buckets; it can stop early and is natural for strings of varying length (like a trie), but needs more bookkeeping
- Negative integers: separate negatives or offset the keys
- Floating-point numbers: reinterpret the bits and fix the sign handling
- Strings: LSD on fixed-length strings, MSD otherwise
- Compared with comparison sorts: faster for large arrays of fixed-width integers; slower or equal when d is large relative to log n, and uses more memory

Properties: stable if each pass is stable, not in place in the usual form, not comparison-based, and cache behavior depends on the base.

## explain
1. Find the maximum key and the number of digits d in the chosen base.
2. For each digit position starting at the least significant, distribute the keys into buckets by that digit, preserving the current order inside buckets.
3. Concatenate the buckets in order to form the new sequence.
4. Repeat for all d positions.
5. Handle negative values separately if they exist.
6. Test with different digit lengths, duplicates and zeros.

## example
The Python program prints the list after each of three passes for `[170, 45, 75, 90, 802, 24, 2, 66]`: first by ones, then by tens, then by hundreds, ending with the sorted list. The number of passes equals the number of digits of the largest number, 802. The JavaScript program computes the number of passes for several maxima and sorts a short list with base 10.

## real
Radix sort sorts large arrays of integers and fixed-length keys in databases and graphics, in GPU libraries, in suffix array construction and in sorting IP addresses and timestamps.

## pros
- Linear time for fixed-width keys
- Stable, so ties keep their input order
- Very fast on large arrays of integers

## cons
- Needs extra memory
- Passes grow with key length
- Less natural for variable-length or floating-point keys

## uses
- Sorting large arrays of integers
- Sorting fixed-length strings and identifiers
- Building suffix arrays
- Sorting timestamps and addresses on GPUs

## mistakes
- Using an unstable sort for the digit passes
- Processing digits from the most significant first in the LSD form
- Forgetting negative numbers
- Choosing a base with too many or too few buckets for the data

## interview
**Q:** Why must each pass of LSD radix sort be stable?
**A:** The order established by the earlier, lower digits must be preserved among keys that tie on the current digit; a stable pass guarantees this, so after the last pass the whole key is in order.

**Q:** What is the complexity of radix sort?
**A:** Theta of d times (n plus b) for d digits in base b, which is linear in n for fixed-width keys.

**Q:** When is radix sort not a good choice?
**A:** When keys are very long, variable in length or floating-point, or when memory is tight, because it needs extra buffers and many passes.

## summary
Radix sort orders numbers digit by digit, least significant first, with a stable sort per digit, taking Θ(d(n plus b)) time. It is linear for fixed-width keys and relies on stability for correctness.

## codenote
The Python sample prints the list after each digit pass. The JavaScript sample counts the passes needed and sorts a list.

## code
### python
```python
def radix_passes(items):
    passes, exp = [], 1
    while max(items) // exp > 0:
        buckets = [[] for _ in range(10)]
        for value in items:
            buckets[(value // exp) % 10].append(value)
        items = [value for bucket in buckets for value in bucket]
        passes.append(items)
        exp *= 10
    return passes

for step in radix_passes([170, 45, 75, 90, 802, 24, 2, 66]):
    print(step)
```
Output:
```text
[170, 90, 802, 2, 24, 45, 75, 66]
[802, 2, 24, 45, 66, 170, 75, 90]
[2, 24, 45, 66, 75, 90, 170, 802]
```
### javascript
```javascript
const passesNeeded = (max) => String(max).length;
console.log(passesNeeded(9), passesNeeded(802), passesNeeded(4294967295));

let items = [329, 457, 657, 839, 436, 720, 355];
for (let exp = 1; Math.max(...items) / exp >= 1; exp *= 10) {
  const buckets = Array.from({ length: 10 }, () => []);
  for (const value of items) buckets[Math.floor(value / exp) % 10].push(value);
  items = buckets.flat();
}
console.log(items.join(","));
```
Output:
```text
1 3 10
329,355,436,457,657,720,839
```

## quiz
1. In which order does LSD radix sort process digits?
   - [ ] From the most significant to the least
   - [x] From the least significant to the most significant
   - [ ] In random order
   - [ ] Only the middle digit
   > Lower digits are sorted first and preserved by later stable passes.
2. Why is stability required in each pass?
   - [ ] To save memory
   - [x] To preserve the order established by lower digits among ties
   - [ ] To avoid counting
   - [ ] To make passes faster
   > Otherwise earlier work would be undone.
3. How many passes does radix sort need for a maximum of 802 in base 10?
   - [ ] 1
   - [ ] 2
   - [x] 3
   - [ ] 802
   > One pass per digit.
4. Which keys suit radix sort well?
   - [ ] Variable-length text with random lengths
   - [x] Fixed-width integers
   - [ ] Floating-point numbers with NaN
   - [ ] Objects with custom comparisons
   > The number of passes is fixed by the key width.

# Stable vs Unstable Sort
kind: concept
time: Not an algorithmic topic — stability is a property of the output order for equal keys, independent of an algorithm's running time, although some stable algorithms cost more time or space.
space: Not an algorithmic topic — some unstable algorithms save memory, which is part of the trade-off discussed here.

## intro
When two records have the same sort key, which one should come first? A stable sort answers: whichever came first in the input. That simple promise makes multi-level sorting, such as by department and then by name, easy to build and is the reason library sorts in Python, Java (for objects) and JavaScript are required to be stable.

## theory
Definition: a sorting algorithm is stable if, whenever two elements compare equal under the sort key, they appear in the output in the same relative order as in the input. If record A came before record B in the input and their keys are equal, A comes before B in the output.

Which algorithms are stable:

- Stable: insertion sort, bubble sort, merge sort, counting sort, radix sort (with stable digit passes), Timsort, and the standard `sorted` in Python and `Array.prototype.sort` in modern JavaScript engines
- Unstable in standard form: selection sort, quick sort, heap sort, Shell sort, and the C++ `std::sort`; C++ offers `std::stable_sort` separately

Why stability matters:

- Multi-key sorting by successive passes: to sort by department and, within each department, by name, first sort by name, then stable-sort by department. The department order is final, and within a department the earlier name order survives. Without stability the name order would be scrambled.
- Predictable results for users: re-sorting a table by a column should not reshuffle rows that tie
- Reproducibility: the same input always gives the same output
- Radix sort correctness

Making an unstable sort stable: decorate each record with its original index and break ties on it (sort by key, then index); this makes any algorithm effectively stable at the cost of extra memory and slightly more comparisons.

Trade-offs: stable algorithms are typically either quadratic and simple (insertion), need O(n) extra memory (merge sort), or have restricted input (counting). The unstable ones (quick sort, heap sort) are often faster or use less memory, which is why they are chosen when stability is irrelevant, for example when sorting plain numbers where equal values are indistinguishable.

Note that stability concerns elements that compare equal under the sort key but are distinguishable in other ways. For identical values it makes no observable difference.

## explain
1. Ask whether elements with equal keys can be told apart and whether their order matters.
2. If it matters, choose a stable algorithm or add the original index as a tiebreaker.
3. For multi-key sorting, sort by the least significant key first and the most significant last, using stable sorts.
4. Check the documentation of the library function for a stability guarantee.
5. Test with records that share keys and verify the order within groups.
6. Accept an unstable sort only when ties are irrelevant.

## example
Four records `("Bob", "B")`, `("Amy", "A")`, `("Cat", "A")` and `("Dan", "B")` sorted by department with Python's stable `sorted` give Amy, Cat, Bob, Dan: within each department the original order is preserved. A quick sort in the Lomuto style applied to `[(2, a), (2, b), (1, c), (2, d)]` by the number returns `[(1, c), (2, d), (2, b), (2, a)]`, so the three records with key 2 changed order. The JavaScript sample sorts employees by name and then stably by department, giving each department's members in name order.

## real
Spreadsheets and data grids that sort by clicking column headers rely on stable sorting to keep earlier sorts as tiebreakers, and the 2019 standardisation of a stable array sort in JavaScript removed a cross-browser inconsistency.

## pros
- Preserves meaningful order among ties
- Makes multi-level sorting a sequence of simple passes
- Gives reproducible, predictable output

## cons
- Stable algorithms often use more memory or time
- Easy to assume stability that is not guaranteed
- Adding index tiebreakers costs memory

## uses
- Sorting tables by several columns
- Maintaining time order within groups
- Implementing radix sort
- Keeping user-visible order consistent after re-sorting

## mistakes
- Assuming that a library sort is stable without checking
- Sorting by the most significant key first when chaining stable sorts
- Using an unstable algorithm for records and being surprised by shuffled ties
- Worrying about stability when sorting plain numbers

## interview
**Q:** What is a stable sort and why does it matter?
**A:** A sort that keeps elements with equal keys in their original relative order. It matters for multi-key sorts, where later sorts should preserve the order from earlier ones among ties.

**Q:** How do you sort records by department and then by name using stable sorts?
**A:** Sort by name first, then sort by department with a stable sort; within each department the name order from the first pass is preserved.

**Q:** Name two stable and two unstable sorting algorithms.
**A:** Merge sort and insertion sort are stable; quick sort and heap sort are unstable in their standard forms.

## summary
A stable sort keeps equal keys in input order, enabling multi-key sorting by chained passes. Know which algorithms and library functions guarantee it, and use an index tiebreaker when you need stability from an unstable algorithm.

## codenote
The Python sample shows stable library sorting and an unstable quick sort. The JavaScript sample chains two stable sorts.

## code
### python
```python
records = [("Bob", "B"), ("Amy", "A"), ("Cat", "A"), ("Dan", "B")]
print(sorted(records, key=lambda record: record[1]))

def quick_sort(items):
    items = items[:]

    def sort(lo, hi):
        if lo >= hi:
            return
        pivot, boundary = items[hi][0], lo
        for j in range(lo, hi):
            if items[j][0] < pivot:
                items[boundary], items[j] = items[j], items[boundary]
                boundary += 1
        items[boundary], items[hi] = items[hi], items[boundary]
        sort(lo, boundary - 1)
        sort(boundary + 1, hi)

    sort(0, len(items) - 1)
    return items

print(quick_sort([(2, "a"), (2, "b"), (1, "c"), (2, "d")]))
```
Output:
```text
[('Amy', 'A'), ('Cat', 'A'), ('Bob', 'B'), ('Dan', 'B')]
[(1, 'c'), (2, 'd'), (2, 'b'), (2, 'a')]
```
### javascript
```javascript
const staff = [
  { name: "Zed", dept: "B" },
  { name: "Amy", dept: "A" },
  { name: "Bob", dept: "B" },
  { name: "Cat", dept: "A" },
];

staff.sort((x, y) => x.name.localeCompare(y.name));
staff.sort((x, y) => x.dept.localeCompare(y.dept));
console.log(staff.map((person) => person.name + "-" + person.dept).join(" "));
```
Output:
```text
Amy-A Cat-A Bob-B Zed-B
```

## quiz
1. What does a stable sort guarantee?
   - [ ] It never fails
   - [x] Elements with equal keys keep their input order
   - [ ] It uses no memory
   - [ ] It is always fastest
   > Equal keys are not reordered.
2. In what order should keys be sorted when chaining stable sorts?
   - [ ] Most significant key first
   - [x] Least significant key first, most significant last
   - [ ] Any order
   - [ ] Only one key can be used
   > The last sort determines the final primary order, with earlier orders preserved among ties.
3. Which of these algorithms is stable?
   - [ ] Heap sort
   - [ ] Quick sort in its standard form
   - [x] Merge sort
   - [ ] Selection sort in its standard form
   > Merge sort takes equal elements from the left half first.
4. How can an unstable sort be made stable?
   - [ ] By sorting twice
   - [x] By adding the original index as a tiebreaker in the key
   - [ ] By reversing the input
   - [ ] It cannot
   > The index makes every key unique and preserves input order.

# Custom Comparators
kind: algorithm
time: O(n log n) comparisons for a comparison sort with a custom ordering; each comparison costs the time of the comparator, so an expensive comparator multiplies the total cost.
space: O(n) for the sort and for any precomputed keys; a key function computes each key once instead of once per comparison.

## intro
Most real data does not sort by its natural order: you want names ignoring case, products by price descending and then by name, or the digits that make the largest number when joined. Sorting APIs let you supply that ordering as a key function or a comparator, and choosing between them well makes the code shorter and faster.

## theory
Two styles:

- Key function: map each item to a sort key, and sort by the keys' natural order. In Python `sorted(items, key=f)`; in Java `Comparator.comparing(f)`; in C++ and JavaScript through a comparator. The key is computed once per item (Python), which is efficient (the decorate-sort-undecorate pattern).
- Comparator function: a function of two items that returns a negative number if the first should come before the second, zero if they are equivalent, and a positive number otherwise. JavaScript's `sort((a, b) => a - b)` is a comparator; Python needs `functools.cmp_to_key` to use one.

Common recipes:

- Case-insensitive: `key=str.lower` (use `casefold` for international text)
- Descending: `reverse=True`, or negate numeric keys, or swap the arguments in a comparator (`b - a`)
- Multiple criteria: return a tuple as the key, as in `(-len(word), word)` for longest first then alphabetical; in a comparator, chain with the or operator: `a.length - b.length || a.localeCompare(b)`
- Mixed directions: negate numbers; for strings use two stable sorts, or a comparator
- Numeric sort in JavaScript: the default sort converts to strings, so always pass `(a, b) => a - b`
- Sort by a derived value: absolute value, distance from a point, a field of an object
- Custom relations that cannot be expressed as a key: the "largest number" problem, where `a` precedes `b` if the concatenation `a + b` is greater than `b + a`; sorting `["3", "30", "34", "5", "9"]` this way and joining gives `9534330`

Rules for a valid comparator:

- Consistency: `cmp(a, b)` must be the negative of `cmp(b, a)` (antisymmetry)
- Transitivity: if a precedes b and b precedes c, then a precedes c
- Equivalence: equal items must compare as zero
- No subtraction tricks that overflow, such as `a - b` on large integers in languages with fixed-width types; return the sign instead
- No randomness or side effects; shuffling via `sort(() => Math.random() - 0.5)` is biased and unreliable

Violating these rules can produce wrong orderings, infinite loops or exceptions (Java's TimSort can throw "Comparison method violates its general contract").

Performance: prefer key functions, which compute each key once, to comparators, which run O(n log n) times; avoid expensive work in a comparator; precompute keys for repeated sorts.

## explain
1. Describe the desired order in words, including ties.
2. If the order is "sort by some value", write a key function, using a tuple for several criteria.
3. If the order depends on a relationship between two items, write a comparator that returns negative, zero or positive.
4. Check the comparator rules: antisymmetry, transitivity and zero for equals.
5. Use the stable-sort property for mixed directions when needed.
6. Test with ties, empty input, and a case that distinguishes your rule from the default order.

## example
Sorting `["pear", "Fig", "apple", "kiwi"]` with `key=str.lower` gives `['apple', 'Fig', 'kiwi', 'pear']`, and with the tuple key `(-len(w), w)` it gives longest first and then alphabetical: `['apple', 'kiwi', 'pear', 'Fig']`. The comparator that compares concatenations orders the numbers 3, 30, 34, 5, 9 so that joining them yields `9534330`, the largest possible number. In JavaScript, the comparator `(a, b) => b - a` sorts numbers descending, and a chained comparator sorts words by length and then alphabetically.

## real
Leaderboards sort by score descending then name, e-commerce sites sort by price, rating or relevance, and file managers sort names naturally ("file2" before "file10") with custom comparators.

## pros
- Key functions are short and efficient
- Comparators handle orderings that depend on pairs
- Chaining criteria with tuples is expressive

## cons
- Inconsistent comparators cause subtle bugs or exceptions
- Comparators run many times, so costly ones slow the sort
- Different languages use different conventions

## uses
- Case-insensitive and locale-aware sorting
- Multi-criteria sorting of records
- Descending and mixed-direction orders
- Special orderings such as the largest concatenated number

## mistakes
- Forgetting to pass a numeric comparator to the JavaScript sort
- Returning only true or false from a comparator in JavaScript
- Writing a comparator that is not transitive
- Doing expensive work inside the comparator for every pair

## interview
**Q:** What is the difference between a key function and a comparator?
**A:** A key function maps each item to a value that is sorted in its natural order and is evaluated once per item, while a comparator takes two items and returns negative, zero or positive, and is evaluated for every pair compared.

**Q:** What conditions must a comparator satisfy?
**A:** It must be consistent and antisymmetric, transitive, and return zero for items that are equivalent, otherwise the sort may misorder or fail.

**Q:** How do you form the largest number from a list of integers?
**A:** Convert them to strings, sort with a comparator that puts a before b when a followed by b is greater than b followed by a, and join the result.

## summary
Describe the order with a key function when possible and with a comparator when it depends on pairs. Keep comparators consistent and cheap, use tuples for multiple criteria and remember JavaScript's numeric default pitfall.

## codenote
The Python sample uses key functions and a comparator. The JavaScript sample uses numeric and chained comparators.

## code
### python
```python
from functools import cmp_to_key

words = ["pear", "Fig", "apple", "kiwi"]
print(sorted(words, key=str.lower), sorted(words, key=lambda w: (-len(w), w)))

def larger_first(a, b):
    return -1 if a + b > b + a else 1

numbers = ["3", "30", "34", "5", "9"]
print("".join(sorted(numbers, key=cmp_to_key(larger_first))))
```
Output:
```text
['apple', 'Fig', 'kiwi', 'pear'] ['apple', 'kiwi', 'pear', 'Fig']
9534330
```
### javascript
```javascript
console.log([10, 9, 1].sort((a, b) => b - a));

const words = ["pear", "Fig", "apple", "kiwi"];
words.sort((a, b) => a.length - b.length || a.localeCompare(b));
console.log(words);
```
Output:
```text
[ 10, 9, 1 ]
[ 'Fig', 'kiwi', 'pear', 'apple' ]
```

## quiz
1. What does a comparator return when the first item should come before the second?
   - [ ] A positive number
   - [x] A negative number
   - [ ] Always zero
   - [ ] true
   > Negative means first, positive means second, zero means equal.
2. Why is a key function usually faster than a comparator?
   - [ ] It uses less code
   - [x] Each key is computed once per item rather than on every comparison
   - [ ] It avoids sorting
   - [ ] It is always stable
   > A comparator is called O(n log n) times.
3. How do you sort strings case-insensitively in Python?
   - [ ] sorted(words, reverse=True)
   - [x] sorted(words, key=str.lower)
   - [ ] sorted(words, key=len)
   - [ ] sorted(words)[::-1]
   > The key makes lowercase forms the basis of comparison.
4. Why is sort(() => Math.random() - 0.5) a bad shuffle?
   - [ ] It is too fast
   - [x] An inconsistent comparator gives biased and unreliable results
   - [ ] It copies the array
   - [ ] It sorts numbers
   > Comparators must be consistent, which random ones are not.

# Sorting Interview Patterns
kind: algorithm
time: O(n log n) for patterns that sort first and then scan, O(n) for the Dutch flag partition and for counting-based approaches when the key range is small, and expected O(n) for quickselect.
space: O(1) to O(n) depending on whether the sort is in place and on the auxiliary structures used.

## intro
Sorting appears in interviews less as a thing to implement than as a tool for solving other problems: once data is sorted, duplicates sit together, overlapping ranges become neighbours and pairs can be found with two pointers. Recognising when sorting first simplifies a problem is the skill being tested.

## theory
Frequent patterns:

- Sort then scan: after sorting, equal items are adjacent, so duplicates, majority candidates, frequencies and closest pairs fall out of one pass. Total O(n log n).
- Sort then two pointers: pair-sum problems, three-sum, container problems, removing duplicates. Sorting costs O(n log n) and the scan O(n).
- Merge intervals: sort by start time, then sweep, extending the current interval while the next start is not after its end. `[[1, 3], [2, 6], [8, 10], [15, 18]]` merges into `[[1, 6], [8, 10], [15, 18]]`, and touching intervals `[[1, 4], [4, 5]]` merge into `[[1, 5]]`. Related: meeting room checks (any overlap after sorting by start), minimum rooms with a heap of end times, inserting an interval.
- Custom ordering: sort by a derived key or comparator, such as the largest number, arranging by frequency, or sorting by two attributes
- Top-k and k-th element: a heap of size k in O(n log k), or quickselect in expected O(n), instead of a full sort
- Counting and bucket methods: when values lie in a small range (ages, letters, colours), count instead of comparing, giving O(n)
- Dutch national flag: sort an array of 0s, 1s and 2s in one pass and constant space with three pointers: `[2, 0, 2, 1, 1, 0]` becomes `[0, 0, 1, 1, 2, 2]`
- Sort the answer space or the queries offline, then sweep or binary search
- Verify sortedness or use a sorted structure for streaming problems (median of a stream with two heaps)
- Merge sorted lists or arrays: two pointers or a heap for k lists

How to decide: ask whether the order of the input matters for the answer (if not, you may sort it), whether you may modify the input, whether O(n log n) is acceptable, and whether a faster method (hash, counting, heap) exists. State that sorting adds O(n log n) to the total.

Pitfalls: forgetting that sorting changes indexes (some problems ask for original indexes, requiring you to sort pairs of value and index), assuming a stable sort when it matters, and sorting when a linear hash-based solution is expected.

## explain
1. Read the problem for clues: duplicates, overlaps, closest, pairs, top k, ordering by a rule.
2. Decide whether sorting first makes the rest simpler, and what it costs.
3. Choose the key or comparator that puts related items next to each other.
4. Apply the scan, two pointers or sweep on the sorted data.
5. For ranks, consider a heap or quickselect instead of a full sort.
6. State the total complexity including the sort and test the empty and single-element cases.

## example
The Python function `merge_intervals` sorts the intervals by start and merges overlapping ones, producing `[[1, 6], [8, 10], [15, 18]]` and `[[1, 5]]` for the touching pair. The Dutch national flag function sorts `[2, 0, 2, 1, 1, 0]` into `[0, 0, 1, 1, 2, 2]` in a single pass with three pointers. The JavaScript function checks whether a person can attend all meetings by sorting them by start time and looking for an overlap: `[[0, 30], [5, 10], [15, 20]]` overlaps and `[[7, 10], [2, 4]]` does not.

## real
Calendar applications merge busy times, schedulers allocate rooms and machines, and data tools deduplicate and group records by sorting first.

## pros
- Sorting turns many problems into simple scans
- Standard library sorts are fast and reliable
- Patterns are reusable across many problems

## cons
- Adds O(n log n) when a linear method might exist
- Loses original positions unless saved
- Modifies the input if sorted in place

## uses
- Merging overlapping intervals
- Checking meeting conflicts and room needs
- Finding pairs, duplicates and closest values
- Partitioning arrays of few distinct values

## mistakes
- Sorting when the original indexes are needed and not keeping them
- Missing touching intervals because of a strict comparison
- Ignoring a linear alternative the interviewer expects
- Sorting the input in place when the caller needs it unchanged

## interview
**Q:** How do you merge overlapping intervals?
**A:** Sort the intervals by start, then scan: if the next interval starts at or before the current end, extend the current end to the larger end; otherwise start a new interval. This takes O(n log n) time for the sort.

**Q:** How do you sort an array containing only 0, 1 and 2 in one pass?
**A:** Use the Dutch national flag algorithm with low, mid and high pointers: swap zeros to the front, leave ones, and swap twos to the back, advancing the pointers accordingly, in O(n) time and O(1) space.

**Q:** When is a full sort unnecessary?
**A:** When you only need the k largest or the k-th element, since a heap of size k or quickselect does it faster, and when a hash table or counting array can answer the question in linear time.

## summary
Use sorting as a tool: sort then scan, sort then two pointers, sort by start for intervals, count for small ranges, and heaps or quickselect for ranks. Include the cost of the sort in your answer and watch for lost indexes.

## codenote
The Python sample merges intervals and sorts colors in one pass. The JavaScript sample checks for meeting conflicts.

## code
### python
```python
def merge_intervals(intervals):
    intervals = sorted(intervals)
    merged = [intervals[0][:]]
    for start, end in intervals[1:]:
        if start <= merged[-1][1]:
            merged[-1][1] = max(merged[-1][1], end)
        else:
            merged.append([start, end])
    return merged

print(merge_intervals([[1, 3], [2, 6], [8, 10], [15, 18]]), merge_intervals([[1, 4], [4, 5]]))

def sort_colors(values):
    low, mid, high = 0, 0, len(values) - 1
    while mid <= high:
        if values[mid] == 0:
            values[low], values[mid] = values[mid], values[low]
            low += 1
            mid += 1
        elif values[mid] == 1:
            mid += 1
        else:
            values[mid], values[high] = values[high], values[mid]
            high -= 1
    return values

print(sort_colors([2, 0, 2, 1, 1, 0]))
```
Output:
```text
[[1, 6], [8, 10], [15, 18]] [[1, 5]]
[0, 0, 1, 1, 2, 2]
```
### javascript
```javascript
function canAttendAll(meetings) {
  const sorted = [...meetings].sort((a, b) => a[0] - b[0]);
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i][0] < sorted[i - 1][1]) return false;
  }
  return true;
}

console.log(canAttendAll([[0, 30], [5, 10], [15, 20]]), canAttendAll([[7, 10], [2, 4]]));
```
Output:
```text
false true
```

## quiz
1. How are overlapping intervals merged?
   - [ ] Sort by length and merge the shortest
   - [x] Sort by start, then extend the current interval while the next start is not after its end
   - [ ] Compare every pair
   - [ ] Sort by end only
   > After sorting by start, only the last merged interval needs checking.
2. What does the Dutch national flag algorithm sort in one pass?
   - [ ] Any numbers
   - [x] An array with three distinct values such as 0, 1 and 2
   - [ ] Strings
   - [ ] Objects with several keys
   > Three pointers partition the array into three regions.
3. When is a heap of size k better than a full sort?
   - [ ] When k equals n
   - [x] When only the k largest elements are needed and k is small
   - [ ] When the array is already sorted
   - [ ] Never
   > It runs in O(n log k) instead of O(n log n).
4. Why must you state the cost of sorting in the answer?
   - [ ] It is optional
   - [x] The sort adds O(n log n) to the overall complexity
   - [ ] Sorting is free
   - [ ] To lengthen the answer
   > The total includes the preparation step.

# External Sorting Overview
kind: algorithm
time: O(n log n) comparisons overall, with the I/O cost measured in block transfers: about 2N/B per pass over N items in blocks of B, and 1 + ⌈log_(k)(runs)⌉ passes for a k-way merge.
space: O(M) main memory, where M is the memory available for run generation and the merge buffers, while the data itself lives on disk.

## intro
Internal sorting assumes everything fits in memory. When the data is larger than memory, such as a log of billions of records or a database table, reading and writing the disk dominates the cost, and algorithms must be designed to touch the data in large sequential passes. The standard answer is external merge sort.

## theory
External merge sort has two phases:

- Run generation: read as much data as fits in memory (a chunk of M items), sort it with an internal sort and write it to disk as a sorted run. With N items there are about N / M runs. A refinement, replacement selection with a heap, produces runs about twice as long as memory on average.
- Merging: merge the sorted runs into longer runs. A k-way merge reads one block from each of k runs into memory and repeatedly outputs the smallest front item using a min-heap (or `heapq.merge` in Python), refilling input buffers and flushing the output buffer as they empty or fill. Each merge pass reads and writes every item once.

Number of passes: with R initial runs and fan-in k, the merge needs ⌈log_k R⌉ passes. With B memory buffers (blocks), the fan-in is at most B − 1 (one buffer is reserved for output). The total number of passes over the data is one for run generation plus the merge passes: `1 + ⌈log_(B−1)(⌈N/B⌉)⌉` when runs are initially one memory-load of B blocks. For N = 1,000 blocks of data and B = 10 buffers, this gives 100 runs, a fan-in of 9, ⌈log₉ 100⌉ = 3 merge passes, and 4 passes in total.

Cost model: the dominant cost is block I/O, `O((N/B) · passes)`, where sequential reads and writes are far cheaper than random ones. Therefore, larger blocks, larger fan-in (more memory) and fewer passes matter more than the number of comparisons.

Design points:

- Use large sequential reads and writes, double-buffering to overlap I/O and computation
- Choose the fan-in to use all available buffers; too small gives extra passes, too large makes blocks tiny and I/O inefficient
- Keep the merge stable if needed, by tie-breaking on run order
- Compress records or sort keys with pointers to reduce I/O
- Parallelise run generation across machines, as in MapReduce: map tasks sort partitions, shuffle and merge combine them
- Alternatives: distribution sorts (sample-based partitioning, as in external quick sort) split the data by key ranges, then sort each part in memory

Practical uses: database engines, the Unix `sort` command (which spills to temporary files), large-scale data processing systems and building indexes.

## explain
1. Measure the data size N and the memory M and compute the number of initial runs.
2. Read a chunk that fits in memory, sort it internally and write it out as a run.
3. Repeat until all data is in sorted runs.
4. Merge up to B − 1 runs at a time with one block buffer per run and an output buffer.
5. Repeat the merge passes until a single sorted run remains.
6. Count passes and block I/Os to estimate the total cost, and tune the buffer sizes.

## example
The Python program splits nine numbers into three runs of three, sorts each to get `[[4, 7, 9], [1, 2, 8], [3, 5, 6]]` and merges them with `heapq.merge` into `[1, 2, 3, 4, 5, 6, 7, 8, 9]`. The pass formula gives 4 passes for 1,000 blocks with 10 buffers: one pass to create 100 runs and three merge passes with fan-in 9. The JavaScript program performs the same k-way merge by repeatedly taking the smallest front element among the runs.

## real
The Unix sort command, database ordering of large tables, indexing in search engines and sorting steps of distributed frameworks all use external merge sort or its parallel variants.

## pros
- Handles data far larger than memory
- Sequential disk access is efficient
- Scales with more memory and parallel machines

## cons
- Disk I/O dominates, so runs and merges are slow compared with in-memory sorting
- Extra temporary storage is needed
- Tuning buffer sizes and fan-in takes care

## uses
- Sorting files larger than memory
- Database sorting and index building
- Large-scale batch data processing
- Merging many sorted log files

## mistakes
- Counting comparisons and ignoring disk I/O
- Using a fan-in of 2 and making many passes
- Reading records randomly instead of in large sequential blocks
- Forgetting to reserve an output buffer

## interview
**Q:** How does external merge sort work?
**A:** It sorts memory-sized chunks internally and writes them as sorted runs, then repeatedly merges groups of runs with a k-way merge that uses one input buffer per run and an output buffer, until a single sorted run remains.

**Q:** What is the cost measure for external sorting?
**A:** The number of disk block transfers, which is roughly the data size in blocks times the number of passes, because disk I/O is far slower than comparisons.

**Q:** How can the number of merge passes be reduced?
**A:** By increasing the fan-in with more memory buffers, and by creating longer initial runs, for example with replacement selection.

## summary
External sorting creates memory-sized sorted runs and merges them k at a time, minimising passes over the disk. Count block transfers, not comparisons, and use as much fan-in as memory allows.

## codenote
The Python sample forms runs, merges them and computes the number of passes. The JavaScript sample does a manual k-way merge.

## code
### python
```python
import heapq
import math

data = [9, 4, 7, 1, 8, 2, 6, 3, 5]
runs = [sorted(data[i:i + 3]) for i in range(0, len(data), 3)]
print(runs)
print(list(heapq.merge(*runs)))

blocks, buffers = 1000, 10
initial_runs = math.ceil(blocks / buffers)
print(1 + math.ceil(math.log(initial_runs, buffers - 1)))
```
Output:
```text
[[4, 7, 9], [1, 2, 8], [3, 5, 6]]
[1, 2, 3, 4, 5, 6, 7, 8, 9]
4
```
### javascript
```javascript
const runs = [[4, 7, 9], [1, 2, 8], [3, 5, 6]];
const positions = runs.map(() => 0);
const merged = [];

for (;;) {
  let best = -1;
  runs.forEach((run, index) => {
    if (positions[index] < run.length && (best === -1 || run[positions[index]] < runs[best][positions[best]])) {
      best = index;
    }
  });
  if (best === -1) break;
  merged.push(runs[best][positions[best]++]);
}
console.log(merged.join(","));
```
Output:
```text
1,2,3,4,5,6,7,8,9
```

## quiz
1. What are the two phases of external merge sort?
   - [ ] Hashing and probing
   - [x] Generating sorted runs and merging them
   - [ ] Partitioning and compressing
   - [ ] Reading and deleting
   > Memory-sized runs are created first and merged afterwards.
2. What usually dominates the cost of external sorting?
   - [ ] Comparisons
   - [x] Disk block transfers
   - [ ] Variable names
   - [ ] Compilation
   > Disk I/O is orders of magnitude slower than computation.
3. How can you reduce the number of merge passes?
   - [ ] Use a fan-in of 2
   - [x] Merge more runs at once with more buffers and make initial runs longer
   - [ ] Sort in descending order
   - [ ] Use smaller blocks
   > Passes are about log base fan-in of the number of runs.
4. Why is a buffer reserved for the output during a merge?
   - [ ] To store the comparator
   - [x] Merged items are written out in blocks as they are produced
   - [ ] To hold the input
   - [ ] To count runs
   > The fan-in is at most the number of buffers minus one.
