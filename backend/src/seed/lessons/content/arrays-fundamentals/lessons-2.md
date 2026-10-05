# Rotating Array Elements
kind: algorithm
time: O(n) for both the slicing approach and the three-reversal approach, since every element is moved a constant number of times; the brute-force method of rotating by one position k times is O(n · k).
space: O(1) extra space for the reversal method, O(n) for the slicing method that builds a new list.

## intro
Rotating an array shifts every element by k positions and wraps the ones that fall off one end around to the other. It is a small problem with several instructive solutions, and the three-reversal trick shows how a clever idea turns a seemingly awkward rearrangement into simple in-place swaps.

## theory
Definitions: a right rotation by k moves each element k places toward the end, and the last k elements wrap to the front. `[1, 2, 3, 4, 5, 6, 7]` rotated right by 3 becomes `[5, 6, 7, 1, 2, 3, 4]`. A left rotation by k is the same as a right rotation by n - k.

Normalising k: rotating by n returns the original array, so only `k % n` matters. Rotating by 10 an array of 7 is the same as rotating by 3. An empty array must be handled before taking the remainder.

Approaches:

- Repeated single rotation: shift all elements by one, k times. Simple but O(n · k).
- Extra array: place element i at index `(i + k) % n` in a new array. O(n) time and O(n) space.
- Slicing: `items[n - k:] + items[:n - k]` builds the result in one expression, O(n) time and space.
- Three reversals, in place: reverse the whole array, then reverse the first k elements, then reverse the remaining n - k elements. O(n) time and O(1) space. For the example, reversing everything gives `[7, 6, 5, 4, 3, 2, 1]`, reversing the first three gives `[5, 6, 7, ...]`, reversing the last four gives `[1, 2, 3, 4]`.
- Cycle-leader method: move elements along the cycles of the index permutation, also O(n) and O(1), but harder to get right.
- Library support: `collections.deque.rotate` in Python rotates in O(k) time, and a deque is the right structure when rotations happen often.

Why the reversal trick works: reversing the whole array puts the last k elements first but in reverse order, and reversing each part restores the order within each block.

## explain
1. Reduce k modulo the length, after handling empty arrays.
2. Decide whether you may use extra memory. If so, slicing is short and clear.
3. If not, apply the three reversals: whole array, first k, the rest.
4. Write a helper that reverses a range with two pointers.
5. Check the edge cases: k equal to 0, k equal to the length, k larger than the length, and one-element arrays.
6. Verify that left and right rotations are consistent.

## example
The slicing function `rotate_right` turns `[1, 2, 3, 4, 5, 6, 7]` into `[5, 6, 7, 1, 2, 3, 4]` for k = 3. The reversal function, asked to rotate another copy by 10, reduces k to 3 and produces the same result, so the equality check prints True. A `deque` rotated by -2 moves two items from the front to the back, giving `[3, 4, 5, 1, 2]`. The JavaScript function rotates left by 2 with two slices.

## real
Circular buffers, image rotation by 90 degree steps, scheduling round-robin turns and text-editing operations all rely on rotation, and the three-reversal method is a standard interview solution.

## pros
- The reversal method needs no extra memory
- Slicing is short and easy to verify
- Normalising k makes large shifts cheap

## cons
- Easy to get the direction or the reduction of k wrong
- The slicing method copies the whole array
- Cycle-based in-place methods are tricky

## uses
- Implementing circular buffers and round-robin schedulers
- Shifting data in place in memory-constrained code
- Rotating images and grids in steps
- Solving a common interview problem

## mistakes
- Forgetting to reduce k modulo the length
- Dividing by zero when the array is empty
- Rotating in the wrong direction
- Using the repeated single-step method on large k

## interview
**Q:** How do you rotate an array by k positions in place in linear time?
**A:** Reverse the entire array, then reverse the first k elements and then the remaining n minus k elements. Each reversal uses two pointers, so the total work is linear and the extra space is constant.

**Q:** Why take k modulo the array length?
**A:** Rotating by the length returns the original array, so only the remainder changes the result, and it avoids unnecessary work for large k.

**Q:** How is a left rotation related to a right rotation?
**A:** A left rotation by k equals a right rotation by n minus k, so one routine can serve both.

## summary
Rotation wraps elements around the ends. Reduce k modulo n, use slicing when memory is no concern, and use three reversals for an in-place linear-time solution.

## codenote
The Python sample implements rotation with slices, with three reversals and with a deque. The JavaScript sample rotates left with slices.

## code
### python
```python
from collections import deque

def rotate_right(items, k):
    n = len(items)
    k %= n
    items[:] = items[n - k:] + items[:n - k]

def reverse_part(items, i, j):
    while i < j:
        items[i], items[j] = items[j], items[i]
        i += 1
        j -= 1

def rotate_by_reversal(items, k):
    n = len(items)
    k %= n
    reverse_part(items, 0, n - 1)
    reverse_part(items, 0, k - 1)
    reverse_part(items, k, n - 1)

first = [1, 2, 3, 4, 5, 6, 7]
rotate_right(first, 3)
print(first)

second = [1, 2, 3, 4, 5, 6, 7]
rotate_by_reversal(second, 10)
print(second, first == second)

queue = deque([1, 2, 3, 4, 5])
queue.rotate(-2)
print(list(queue))
```
Output:
```text
[5, 6, 7, 1, 2, 3, 4]
[5, 6, 7, 1, 2, 3, 4] True
[3, 4, 5, 1, 2]
```
### javascript
```javascript
function rotateLeft(items, k) {
  const shift = k % items.length;
  return items.slice(shift).concat(items.slice(0, shift));
}

console.log(rotateLeft([1, 2, 3, 4, 5], 2).join(" "));
```
Output:
```text
3 4 5 1 2
```

## quiz
1. What is the result of rotating [1, 2, 3, 4, 5] right by 1?
   - [ ] [2, 3, 4, 5, 1]
   - [x] [5, 1, 2, 3, 4]
   - [ ] [5, 4, 3, 2, 1]
   - [ ] [1, 2, 3, 4, 5]
   > The last element wraps around to the front.
2. Why can rotating by the length of the array be skipped?
   - [ ] It is not allowed
   - [x] The result equals the original array
   - [ ] It raises an error
   - [ ] It reverses the array
   > Only k modulo n changes the outcome.
3. What are the steps of the three-reversal method?
   - [ ] Reverse the first half twice
   - [x] Reverse the whole array, then the first k elements, then the rest
   - [ ] Sort, reverse, sort
   - [ ] Swap the middle element
   > Each block regains its original order after the final reversals.
4. What is the extra space of the in-place reversal method?
   - [ ] O(n)
   - [x] O(1)
   - [ ] O(k)
   - [ ] O(log n)
   > Only a few index variables are needed.

# Frequency Counting with Arrays
kind: algorithm
time: O(n + k) to count n items into k buckets and then read the buckets; each item is counted in constant time because its bucket is found directly by index.
space: O(k) for the counts, where k is the number of distinct possible values, for example 26 letters or 10 digits; this is O(1) when k is a fixed constant.

## intro
When the values you want to count come from a small, known range, an array makes a very fast counter: the value itself is the index. This direct-address counting underlies anagram checks, character statistics and counting-based sorting, and it is the simplest case of the hash-table idea.

## theory
The technique:

- Create an array of k counters, all zero, one for each possible value
- For every item, map it to an index (a digit is its own index; a lowercase letter is `ord(letter) - ord("a")`) and add one to that counter
- Read the counters afterwards to answer questions: which value is most frequent, which values are missing, whether two collections have identical counts

The cost is one pass over the data plus one pass over the counters, so O(n + k) time and O(k) space. Compared with sorting (O(n log n)) or a nested loop (O(n²)) this is very fast when k is small.

Typical applications:

- Character frequencies and anagram detection: two strings are anagrams if their count arrays are equal
- Finding duplicates or the first non-repeating item
- Counting sort, which rebuilds the sorted sequence from the counts
- Histograms
- Checking whether a collection is a permutation of a range

Limits and alternatives: the array approach requires a small, dense range of non-negative integer keys. For arbitrary keys (words, large numbers, mixed characters), use a dictionary (`collections.Counter` in Python, `Map` in JavaScript), which has the same idea with hashing. Be careful about the alphabet: Unicode text needs a dictionary, and uppercase and lowercase letters need a decision about folding.

A frequent refinement is to count with one array while scanning and to adjust the counts in the other direction (add for the first string, subtract for the second) and check that all counters end at zero.

## explain
1. Decide the range of possible values and the index for each.
2. Create the count array with that many zeros.
3. Scan the data once and increment the counter at each item's index.
4. Scan the counters to extract the answer: maximum, non-zero entries or equality of two arrays.
5. Use a dictionary instead when the range is large or not integer.
6. Normalise the input first, for example by lowercasing, so the index mapping is valid.

## example
Counting the letters of "mississippi" into 26 counters and printing the non-zero ones gives `{'i': 4, 'm': 1, 'p': 2, 's': 4}`. `Counter(text).most_common(2)` returns `[('i', 4), ('s', 4)]`, with the tie kept in the order the letters first appeared. Two strings are anagrams exactly when their count arrays are equal, which is True for "listen" and "silent". The JavaScript sample counts the digits of "1223334444" into ten counters and prints them separated by spaces.

## real
Spell checkers, text analytics, DNA sequence statistics and network traffic counters use frequency tables, and counting sort uses the same array to sort integers in linear time.

## pros
- Linear time and very fast thanks to direct indexing
- Simple code with no hashing
- Memory is small when the range is small

## cons
- Only works for small, dense integer-like keys
- Wastes memory when the range is large and sparse
- Needs an explicit mapping from items to indexes

## uses
- Counting characters and digits
- Detecting anagrams and permutations
- Finding the most or least frequent value
- Building histograms and counting-sort buckets

## mistakes
- Using an index outside the array because the input has unexpected characters
- Forgetting to lowercase or otherwise normalise
- Allocating a huge array for a sparse range instead of using a dictionary
- Assuming the tie order of most_common is meaningful

## interview
**Q:** How do you check whether two strings are anagrams in linear time?
**A:** Count the letters of each string in an array indexed by letter and compare the arrays, or count one up and the other down and check that all counters are zero. This takes O(n) time and constant space for a fixed alphabet.

**Q:** When is a counting array better than a hash map?
**A:** When keys are small non-negative integers in a known range, because direct indexing is faster and uses less memory than hashing.

**Q:** What is the time complexity of counting n items into k buckets and reading the result?
**A:** O(n + k): one pass over the items and one pass over the buckets.

## summary
For a small known range, use the value as an index into a counter array. It gives linear-time counting, anagram checks and histograms; switch to a dictionary for large or non-integer keys.

## codenote
The Python sample counts letters by index and compares with Counter, then tests anagrams. The JavaScript sample counts digits.

## code
### python
```python
from collections import Counter

text = "mississippi"
counts = [0] * 26
for letter in text:
    counts[ord(letter) - ord("a")] += 1

print({chr(i + ord("a")): c for i, c in enumerate(counts) if c})
print(Counter(text).most_common(2))

def letter_counts(word):
    table = [0] * 26
    for letter in word:
        table[ord(letter) - ord("a")] += 1
    return table

print(letter_counts("listen") == letter_counts("silent"))
```
Output:
```text
{'i': 4, 'm': 1, 'p': 2, 's': 4}
[('i', 4), ('s', 4)]
True
```
### javascript
```javascript
const counts = new Array(10).fill(0);
for (const digit of "1223334444") {
  counts[Number(digit)]++;
}
console.log(counts.join(" "));
```
Output:
```text
0 1 2 3 4 0 0 0 0 0
```

## quiz
1. What does the value being counted serve as in a counting array?
   - [ ] The array length
   - [x] The index of its counter
   - [ ] A key in a dictionary
   - [ ] The sum
   > Direct addressing is what makes it fast.
2. How can two strings be tested as anagrams with count arrays?
   - [ ] Compare their lengths only
   - [x] Check that their letter counts are identical
   - [ ] Sort them with a nested loop
   - [ ] Compare the first letters
   > Anagrams contain the same letters the same number of times.
3. When should a dictionary replace a counting array?
   - [ ] When the range is tiny
   - [x] When keys are many, sparse or not small integers
   - [ ] Never
   - [ ] When the data is sorted
   > The array would waste memory or be impossible to index.
4. What is the complexity of counting n items into k buckets?
   - [ ] O(n squared)
   - [x] O(n + k)
   - [ ] O(log n)
   - [ ] O(k squared)
   > One pass over items and one over buckets.

# Prefix Sum Introduction
kind: algorithm
time: O(n) to build the prefix array once; each range-sum query then takes O(1), compared with O(n) per query for summing the range directly.
space: O(n) for the prefix array, one extra slot beyond the input length.
viz: prefix-sum
practice: sum-of-array-elements

## intro
A prefix sum array stores the running total of the elements so far. With it, the sum of any contiguous range comes from subtracting two stored values, no matter how long the range is. If you need many range sums over the same data, this simple precomputation changes the cost from slow to instant.

## theory
Definition: for an array `a` of length n, the prefix array `p` has length n + 1 with `p[0] = 0` and `p[i] = a[0] + a[1] + ... + a[i - 1]`. In other words `p[i] = p[i - 1] + a[i - 1]`.

Range query: the sum of `a[l..r]` (inclusive) is `p[r + 1] - p[l]`. The total up to r contains everything before l as well, so subtracting the total before l leaves exactly the range.

Why the extra leading zero: it makes the formula work for ranges that start at index 0 without a special case.

Complexity trade-off: building costs O(n) once. A query costs O(1) instead of O(r - l + 1). For q queries on n elements, the direct method costs O(n · q) and the prefix method O(n + q).

Variants and extensions:

- Prefix counts for yes/no conditions (how many even numbers in a range): prefix of 0/1 flags
- Two-dimensional prefix sums for sums over rectangles in a grid, with four lookups per query
- Difference arrays, the inverse operation: add a value to a whole range in O(1) and recover the final array with one prefix-sum pass
- Prefix maximum, minimum, XOR or product (when invertible) for related questions
- Combined with a hash map to count subarrays with a given sum: store how often each prefix value has been seen

Cautions: the structure assumes the data does not change. If values are updated between queries, use a Fenwick tree or a segment tree instead. Beware of integer overflow when totals can be large in fixed-width languages.

## explain
1. Create the prefix array with a leading zero.
2. Fill it by adding each element to the previous prefix value.
3. To answer the sum from l to r inclusive, compute `prefix[r + 1] - prefix[l]`.
4. Check the formula on a range of one element and on the whole array.
5. For repeated updates, switch to a tree-based structure.
6. For counting conditions, build the prefix of an indicator array.

## example
For `[3, 1, 4, 1, 5, 9, 2, 6]` the prefix array is `[0, 3, 4, 8, 9, 14, 23, 25, 31]`. The sum of indexes 2 to 5, which is 4 + 1 + 5 + 9, is `prefix[6] - prefix[2]`, giving 23 - 4 = 19, and the whole array sums to 31. The JavaScript sample builds the same array with a loop and checks every possible range against direct summation, confirming that the two methods agree.

## real
Analytics dashboards answer date-range totals from precomputed cumulative sums, image processing uses integral images (two-dimensional prefix sums) for fast box filters, and many coding problems on subarray sums start with a prefix array.

## pros
- Constant-time range sums after linear preprocessing
- Simple to implement and to verify
- Generalises to counts, grids and other combinable values

## cons
- Requires extra memory for the prefix array
- Becomes invalid if the underlying values change
- Off-by-one mistakes in the range formula are common

## uses
- Answering many range-sum queries quickly
- Counting items satisfying a condition in a range
- Finding subarrays with a target sum
- Computing integral images for fast filters

## mistakes
- Forgetting the leading zero and mishandling ranges that start at 0
- Using prefix[r] - prefix[l] and losing an element
- Reusing the prefix array after the data has been modified
- Overflowing a fixed-width integer when totals are large

## interview
**Q:** What is a prefix sum array?
**A:** An array where each entry holds the sum of all input elements before a position, so it stores running totals. With a leading zero, the sum of any range is the difference of two entries.

**Q:** What is the complexity of answering q range-sum queries with and without prefix sums?
**A:** Without prefix sums it is O(n times q) in the worst case; with them it is O(n) to build plus O(1) per query, so O(n + q) in total.

**Q:** What should you use if the array is updated between queries?
**A:** A Fenwick tree or a segment tree, which support both point updates and range queries in O(log n).

## summary
A prefix sum array stores running totals so any range sum is one subtraction. Build it once in linear time, include a leading zero and use it whenever the data is static and queries are many.

## codenote
The Python sample builds the prefix array and answers two range queries. The JavaScript sample builds it and verifies every range against a direct sum.

## code
### python
```python
nums = [3, 1, 4, 1, 5, 9, 2, 6]

prefix = [0]
for value in nums:
    prefix.append(prefix[-1] + value)
print(prefix)

def range_sum(left, right):
    return prefix[right + 1] - prefix[left]

print(range_sum(2, 5), range_sum(0, 7))
```
Output:
```text
[0, 3, 4, 8, 9, 14, 23, 25, 31]
19 31
```
### javascript
```javascript
const nums = [3, 1, 4, 1, 5, 9, 2, 6];
const prefix = [0];
for (const value of nums) prefix.push(prefix[prefix.length - 1] + value);

let allMatch = true;
for (let l = 0; l < nums.length; l++) {
  for (let r = l; r < nums.length; r++) {
    const direct = nums.slice(l, r + 1).reduce((a, b) => a + b, 0);
    if (direct !== prefix[r + 1] - prefix[l]) allMatch = false;
  }
}
console.log(prefix.join(" "), allMatch);
```
Output:
```text
0 3 4 8 9 14 23 25 31 true
```

## quiz
1. What is the sum of a[l..r] using a prefix array p with a leading zero?
   - [ ] p[r] - p[l]
   - [x] p[r + 1] - p[l]
   - [ ] p[r] + p[l]
   - [ ] p[l] - p[r + 1]
   > The leading zero shifts the indexes by one.
2. What is the cost of one range query after building the prefix array?
   - [ ] O(n)
   - [x] O(1)
   - [ ] O(log n)
   - [ ] O(n squared)
   > It is a single subtraction.
3. Why is the leading zero included?
   - [ ] To waste space
   - [x] So ranges starting at index 0 need no special case
   - [ ] To store the length
   - [ ] To mark the end
   > It represents the empty prefix.
4. Which structure fits when values change between queries?
   - [ ] A plain prefix array
   - [x] A Fenwick tree or segment tree
   - [ ] A string
   - [ ] A stack
   > They support both updates and range queries efficiently.

# Array Interview Patterns
kind: algorithm
time: O(n) for the hash lookup, two-pointer and sliding-window solutions shown; the brute-force alternatives are O(n²) for pair problems and O(n · k) for windows.
space: O(n) for the hash map in the pair problem; O(1) for the window and the in-place compaction.
practice: two-sum-indices

## intro
Array problems in interviews fall into a short list of recurring patterns. Recognising the pattern is most of the solution: the problem statement contains clues such as "sorted", "contiguous", "pair" or "in place", and each clue points to a technique that replaces a quadratic search with a linear one.

## theory
The core patterns:

- Hash map for complements: for "find two numbers that sum to a target", store each value seen with its index; for the current number, look up `target - number`. One pass, O(n) time, O(n) space.
- Two pointers on sorted data: pointers at both ends move inward depending on whether the current sum is too small or too large. O(n) time, O(1) space.
- Read and write pointers: compact or filter in place, for example removing duplicates from a sorted array.
- Sliding window: for a contiguous range of fixed or variable size, add the new element and drop the old one instead of recomputing the sum. Fixed-size window sums and "longest subarray with property" problems.
- Prefix sums: many range-sum or subarray-sum queries; combined with a hash map for "number of subarrays with sum k".
- Sorting first: sorting (O(n log n)) turns many problems into a linear scan, such as merging intervals or finding duplicates or closest pairs.
- Frequency counting: counts in an array or dictionary for duplicates, majority elements and anagram-like questions.
- Binary search on sorted data or on an answer range
- Monotonic stack for "next greater element" questions
- Kadane's algorithm for the maximum subarray sum, a running best ending at each position

How to choose: ask whether the array is sorted, whether the target is a contiguous subarray or any subset, whether extra memory is allowed, and whether the array may be modified. State the brute-force solution first, find the repeated work, and eliminate it with the pattern.

Always discuss edge cases: empty array, one element, all equal values, negatives, duplicates and very large values.

## explain
1. Restate the problem and the constraints, including size and whether the input is sorted.
2. Describe the brute-force solution and its complexity.
3. Identify the wasted work: repeated sums, repeated searches, repeated comparisons.
4. Pick the pattern that removes it: hash map, two pointers, window or prefix sums.
5. Write the solution, then trace it on a small example.
6. Test edge cases and state the final time and space complexity.

## example
`two_sum` scans `[2, 7, 11, 15]` for target 9: at 7 the complement 2 is already stored with index 0, so it returns the index pair `(0, 1)` after seeing only two elements. `best_window` finds the best sum of 3 consecutive elements in `[2, 1, 5, 1, 3, 2]` by adding the entering element and removing the leaving one, giving 9 for the window 5, 1, 3. The JavaScript function removes duplicates from the sorted array `[1, 1, 2, 2, 2, 3]` with a read and a write pointer; it reports 3 unique values and the compacted prefix `1,2,3`.

## real
These patterns are asked in technical interviews and used daily: duplicate detection in data pipelines, moving averages in monitoring, and merge steps in database engines.

## pros
- Turns quadratic solutions into linear ones
- A small toolbox applies to a large family of problems
- Each pattern has a clear invariant to reason about

## cons
- Misidentifying the pattern leads to complicated code
- Hash maps cost extra memory
- Edge cases such as negatives break some window techniques

## uses
- Pair and complement problems
- Maximum or minimum over fixed-length ranges
- In-place deduplication and filtering
- Preparing for technical interviews

## mistakes
- Jumping to code without stating the brute-force baseline
- Using two pointers on unsorted data
- Using a sliding window when negative numbers break monotonic behavior
- Forgetting empty and single-element inputs

## interview
**Q:** How do you solve two sum in linear time?
**A:** Scan the array while storing each value and its index in a hash map. For each number, check whether target minus the number is already in the map; if so, return both indexes. This is O(n) time and O(n) space.

**Q:** When can two pointers be used to find a pair with a target sum?
**A:** When the array is sorted: move the left pointer up if the sum is too small and the right pointer down if it is too large, which finds the pair in O(n) time and constant space.

**Q:** What is the idea of a sliding window sum?
**A:** Keep the sum of the current window and update it by adding the incoming element and subtracting the outgoing one, so each shift costs O(1) rather than recomputing the whole sum.

## summary
Match the problem to a pattern: hash map for complements, two pointers for sorted pairs, a window for contiguous ranges, prefix sums for range queries and read-write pointers for in-place changes. State the brute force, remove the repeated work and check the edge cases.

## codenote
The Python sample solves two sum with a hash map and a fixed window with a running sum. The JavaScript sample compacts a sorted array in place.

## code
### python
```python
def two_sum(nums, target):
    seen = {}
    for index, value in enumerate(nums):
        if target - value in seen:
            return seen[target - value], index
        seen[value] = index

print(two_sum([2, 7, 11, 15], 9))

def best_window(nums, k):
    window = sum(nums[:k])
    best = window
    for i in range(k, len(nums)):
        window += nums[i] - nums[i - k]
        best = max(best, window)
    return best

print(best_window([2, 1, 5, 1, 3, 2], 3))
```
Output:
```text
(0, 1)
9
```
### javascript
```javascript
function dedupe(sorted) {
  let write = 0;
  for (let read = 1; read < sorted.length; read++) {
    if (sorted[read] !== sorted[write]) {
      write++;
      sorted[write] = sorted[read];
    }
  }
  return write + 1;
}

const data = [1, 1, 2, 2, 2, 3];
const unique = dedupe(data);
console.log(unique, data.slice(0, unique).join(","));
```
Output:
```text
3 1,2,3
```

## quiz
1. Which pattern solves "find two numbers in an unsorted array that add to a target" in linear time?
   - [ ] Nested loops
   - [x] A hash map of seen values
   - [ ] Reversing the array
   - [ ] Recursion without memory
   > Looking up the complement replaces the inner loop.
2. When do two pointers work for a pair sum?
   - [ ] When the array is unsorted
   - [x] When the array is sorted
   - [ ] Only for strings
   - [ ] Only for empty arrays
   > Sorted order tells you which pointer to move.
3. What does a sliding window avoid?
   - [ ] Reading the array
   - [x] Recomputing the sum of the whole window at every position
   - [ ] Using variables
   - [ ] Returning results
   > It updates the sum in constant time per shift.
4. What is a good first step in an interview problem?
   - [ ] Write the final code immediately
   - [x] State the brute-force solution and find the repeated work
   - [ ] Ask to skip the problem
   - [ ] Optimise memory use first
   > The baseline shows what to improve.

# Common Array Pitfalls
kind: concept
time: Not applicable — the pitfalls listed are correctness issues; where one has a performance side, such as repeated slicing, the lessons on copying and complexity cover it.
space: Not applicable — this is a catalogue of mistakes rather than an analysis of one algorithm.

## intro
Arrays look simple, and that is exactly why the same few mistakes keep appearing: off-by-one loops, accidentally shared rows, functions that sort in place and return nothing, and numbers that compare as text. Knowing the list in advance lets you recognise each one on sight.

## theory
The most common pitfalls:

- Off-by-one errors: looping to `len(a)` inclusive, forgetting that the last index is length minus one, or mixing inclusive and exclusive range ends
- Shared references: building a grid with repetition (`[[0] * 3] * 3`) or filling an array with one mutable object, so every slot is the same object
- In-place versus copy confusion: `list.sort()`, `reverse()` and JavaScript's `sort` mutate and (in Python) return None, so `result = items.sort()` loses the data; `sorted(items)` returns a new list
- Modifying a list while iterating over it, which skips elements
- Default sort behavior: JavaScript's `sort()` compares elements as strings, so `[10, 9, 1]` becomes `[1, 10, 9]` unless you pass a numeric comparator
- Out-of-range access: IndexError in Python, undefined in JavaScript, undefined behavior in C
- Negative index surprises: -1 is valid in Python, so a computed index that goes negative silently reads from the end
- Aliasing: two names for one array, so a function changes the caller's data
- Shallow copies of nested arrays
- Equality gotchas: comparing arrays with `==` in JavaScript compares references, and `[NaN].indexOf(NaN)` is -1 because NaN never equals itself while `includes` finds it
- Integer overflow when summing in fixed-width languages
- Assuming an empty array has a first element, a maximum or an average

Habits that prevent them: iterate over values directly, use library functions instead of index arithmetic, copy before mutating when others may share the array, test with empty and one-element inputs, and read documentation for return values of mutating methods.

## explain
1. Before writing a loop, write the first and last index it must visit.
2. Ask of every operation: does it mutate, or does it return a new array?
3. When you create a collection of collections, check that each inner one is distinct.
4. Pass a comparator to sort when the elements are not plain strings.
5. Test with the empty array, one element, duplicates and extreme values.
6. Review the code for places where an index could become negative or reach the length.

## example
In Python, `result = nums.sort()` leaves `result` as None while `nums` becomes `[1, 2, 3]`. A list `rows = [[]] * 2` shares one inner list, so appending "x" to the first row shows `[['x'], ['x']]`. A loop written as `range(len(nums) + 1)` fails at index 3 with an IndexError, which the program catches and reports. In JavaScript, `[10, 9, 1].sort()` gives `[ 1, 10, 9 ]` because of text comparison, while a numeric comparator gives `[ 1, 9, 10 ]`, and `indexOf(NaN)` is -1 while `includes(NaN)` is true.

## real
These mistakes appear in code reviews and bug trackers every day; the shared-row grid, the string sort of numbers and the lost sort result are classics that linters and tests catch if you know to look.

## pros
- A short checklist prevents most array bugs
- Each pitfall has a simple, standard remedy
- Tests on boundary inputs expose most of them

## cons
- Languages differ, so habits can mislead after a switch
- Some pitfalls produce wrong output with no error
- The mistakes remain easy to make even for experienced programmers

## uses
- Reviewing array-heavy code
- Writing test cases for boundaries
- Teaching and learning array behavior in a new language
- Debugging unexpected output from list operations

## mistakes
- Assigning the result of an in-place method and getting None
- Sorting numbers in JavaScript without a comparator
- Creating a grid by repetition
- Indexing with the length instead of the length minus one

## interview
**Q:** Why does [10, 9, 1].sort() give [1, 10, 9] in JavaScript?
**A:** The default sort converts elements to strings and compares them lexicographically, so "10" comes before "9". A numeric comparator such as a minus b sorts by value.

**Q:** What is the value of x after x = items.sort() in Python?
**A:** None. The method sorts the list in place and returns None; use sorted(items) to get a new sorted list.

**Q:** Name two ways to create off-by-one bugs.
**A:** Looping to the length inclusive instead of exclusive, and treating the last valid index as the length rather than the length minus one.

## summary
Watch for off-by-one loops, shared inner arrays, in-place methods that return nothing, text-based default sorting, negative index surprises and unhandled empty arrays. Test the edges and know what each method mutates.

## codenote
The Python sample demonstrates the lost sort result, shared rows and an off-by-one failure. The JavaScript sample shows default sorting and NaN searches.

## code
### python
```python
nums = [3, 1, 2]
result = nums.sort()
print(result, nums)

rows = [[]] * 2
rows[0].append("x")
print(rows)

try:
    for i in range(len(nums) + 1):
        nums[i]
except IndexError:
    print("off-by-one at index", i)
```
Output:
```text
None [1, 2, 3]
[['x'], ['x']]
off-by-one at index 3
```
### javascript
```javascript
console.log([10, 9, 1].sort());
console.log([10, 9, 1].sort((a, b) => a - b));
console.log([NaN].indexOf(NaN), [NaN].includes(NaN));
```
Output:
```text
[ 1, 10, 9 ]
[ 1, 9, 10 ]
-1 true
```

## quiz
1. A programmer writes result = items.sort() in Python. What does result hold afterwards?
   - [ ] The sorted list
   - [x] None
   - [ ] A copy of the list
   - [ ] The smallest element
   > The method sorts in place, so its return value is None.
2. Why does the default JavaScript sort misorder numbers?
   - [ ] It is random
   - [x] It compares elements as strings
   - [ ] It only sorts letters
   - [ ] It reverses the array
   > Pass a numeric comparator to sort by value.
3. What is a typical cause of an IndexError at the last iteration?
   - [ ] Too few elements
   - [x] A loop bound that includes the length instead of stopping before it
   - [ ] A negative index
   - [ ] Using enumerate
   > The valid indexes stop at length minus one.
4. How do you avoid sharing one inner list among rows?
   - [ ] Multiply the outer list
   - [x] Build each row separately, for example with a comprehension
   - [ ] Sort the rows
   - [ ] Use the same variable name
   > Each row needs to be its own object.

# Array Algorithm Patterns Summary
kind: algorithm
time: The patterns summarised run in O(n) for scans, two pointers, windows and frequency tables; O(n) to build and O(1) per query for prefix sums; and O(n log n) when a sort is needed first.
space: O(1) for scans, pointers and windows; O(n) for prefix sums and hash lookups; O(k) for frequency tables over k distinct values.

## intro
This lesson pulls the whole module together as a decision guide. Instead of memorising solutions, learn the handful of patterns that array problems reduce to, what each costs and what clue in a problem statement points to it.

## theory
The toolbox, with the cost of each:

- Single scan: running total, minimum, maximum, count; O(n) time, O(1) space
- Two pointers: sorted pairs, reversal, palindromes, partitioning; O(n) time, O(1) space
- Sliding window: best contiguous range of fixed or variable size; O(n) time, O(1) space
- Prefix sums: many range-sum queries; O(n) build, O(1) per query, O(n) space
- Frequency table: counting, anagrams, duplicates; O(n + k) time, O(k) space
- Hash lookup: pair and complement searches; O(n) time, O(n) space
- Sort then scan: grouping, intervals, closest pairs; O(n log n) time
- Binary search: sorted data or a monotonic answer; O(log n) per query
- In place read and write pointers: filtering and compaction; O(n) time, O(1) space

Clues in a problem statement:

- "sorted array" suggests two pointers or binary search
- "contiguous subarray" suggests a window or prefix sums
- "pair that sums to" suggests a hash map or two pointers
- "in place, constant extra space" suggests swaps and read-write pointers
- "many queries" suggests precomputation
- "count or find duplicates" suggests a frequency table or a set
- "a small range of values" suggests a counting array

Process: state constraints, give the brute-force solution and its cost, find the repeated work, choose the pattern, write it, test the edges and state the final complexity. The difference between the brute-force and the pattern solution is usually a whole factor of n: for n = 1000 the pair search compares 499,500 pairs but the hash lookup does 1,000 lookups.

This module's earlier lessons supply the foundation: layout and indexing explain the costs, traversal and in-place techniques give the moves, and copying and pitfalls tell you what can go wrong.

## explain
1. Read the problem for clues: sorted or not, contiguous or not, number of queries, memory limits.
2. Match the clues to a pattern from the list.
3. Compare the pattern's cost with the brute force and the constraints.
4. Implement the pattern with attention to boundaries.
5. Test with the empty array, one element, duplicates and extremes.
6. Explain the complexity in terms of n and any other parameter.

## example
The table printed by the Python program lists seven patterns with their time and space costs and a typical use for each, aligned in columns. The last line compares the brute-force pair count for n = 1000, which is 499,500, with the 1,000 lookups of the hash-based approach. The JavaScript sample classifies a few problem descriptions by their clues and prints the suggested pattern.

## real
Technical interviews, competitive programming and everyday data processing all draw on the same short list, and engineers who can name the pattern quickly spend their time on the details instead of searching for an idea.

## pros
- A small set of patterns covers most array problems
- Costs are known in advance, so choices are quick
- The decision guide transfers to strings and other sequences

## cons
- Real problems often combine patterns
- Memorising without understanding fails on variations
- Constants and constraints can change which option is best

## uses
- Choosing an approach before coding
- Estimating whether a solution meets the time limit
- Reviewing and explaining solutions
- Revising for interviews

## mistakes
- Picking a pattern by habit rather than by the problem's clues
- Ignoring the cost of sorting when counting complexity
- Forgetting the space cost of hash maps and prefix arrays
- Skipping the brute-force baseline

## interview
**Q:** How do you choose between a hash map and two pointers for a pair-sum problem?
**A:** If the array is sorted or may be sorted cheaply and extra memory is restricted, use two pointers; if it is unsorted and memory is available, a hash map solves it in one pass.

**Q:** When are prefix sums the right tool?
**A:** When there are many queries for sums of contiguous ranges on data that does not change, because they give O(1) per query after linear preprocessing.

**Q:** What is the cost of sorting first and then scanning?
**A:** O(n log n) for the sort plus O(n) for the scan, so O(n log n) overall; it is worth it when sorted order makes the scan simple.

## summary
Most array problems reduce to scans, two pointers, windows, prefix sums, frequency tables, hash lookups, sorting or binary search. Read the clues, compare with the brute force, pick the pattern and test the edges.

## codenote
The Python sample prints the pattern table and compares brute-force and hash-based pair counts. The JavaScript sample maps problem clues to patterns.

## code
### python
```python
PATTERNS = [
    ("single scan", "O(n)", "O(1)", "totals, extremes, counts"),
    ("two pointers", "O(n)", "O(1)", "sorted pairs, reversal, palindromes"),
    ("sliding window", "O(n)", "O(1)", "best contiguous range of fixed size"),
    ("prefix sums", "O(n) + O(1)", "O(n)", "many range-sum queries"),
    ("frequency table", "O(n + k)", "O(k)", "counting, anagrams, duplicates"),
    ("hash lookup", "O(n)", "O(n)", "pair and complement searches"),
    ("sort then scan", "O(n log n)", "O(1)", "grouping, intervals, closest pairs"),
]

for name, time, space, use in PATTERNS:
    print(f"{name:<16}{time:<13}{space:<7}{use}")

n = 1000
print(n * (n - 1) // 2, n)
```
Output:
```text
single scan     O(n)         O(1)   totals, extremes, counts
two pointers    O(n)         O(1)   sorted pairs, reversal, palindromes
sliding window  O(n)         O(1)   best contiguous range of fixed size
prefix sums     O(n) + O(1)  O(n)   many range-sum queries
frequency table O(n + k)     O(k)   counting, anagrams, duplicates
hash lookup     O(n)         O(n)   pair and complement searches
sort then scan  O(n log n)   O(1)   grouping, intervals, closest pairs
499500 1000
```
### javascript
```javascript
const clues = {
  "sorted array, find a pair": "two pointers",
  "contiguous subarray of size k": "sliding window",
  "many range-sum queries": "prefix sums",
  "count letters": "frequency table",
};

for (const [clue, pattern] of Object.entries(clues)) {
  console.log(clue + " -> " + pattern);
}
```
Output:
```text
sorted array, find a pair -> two pointers
contiguous subarray of size k -> sliding window
many range-sum queries -> prefix sums
count letters -> frequency table
```

## quiz
1. Which pattern fits "many queries for the sum of a range"?
   - [ ] Single scan per query
   - [x] Prefix sums
   - [ ] Recursion
   - [ ] Reversal
   > Precomputation gives constant-time queries.
2. A problem gives a sorted array and asks for a pair with a target sum. What is a natural approach?
   - [ ] Nested loops
   - [x] Two pointers moving inward
   - [ ] Sorting again
   - [ ] Frequency table
   > Sorted order tells which pointer to move.
3. What is the cost of sorting first and then scanning?
   - [ ] O(n)
   - [x] O(n log n)
   - [ ] O(n squared)
   - [ ] O(1)
   > The sort dominates the linear scan.
4. For n = 1000, how many pairs does the brute-force pair search compare?
   - [ ] 1,000
   - [ ] 10,000
   - [x] 499,500
   - [ ] 1,000,000
   > It is n times n minus 1, divided by 2.
