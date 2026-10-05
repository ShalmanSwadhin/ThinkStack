# Building Prefix Sum Arrays
kind: algorithm
time: O(n) to build a prefix array in one pass over n elements; each later query that uses it is O(1).
space: O(n) for the prefix array, or O(1) extra when the input array is overwritten with its own running totals.

## intro
A prefix array stores the result of combining the first i elements for every i. Sums are the best-known case, but the same idea works for any operation that can be undone or that has a useful identity: exclusive or, counts of elements with a property, products and maxima. Building it correctly, including the choice of its length and the first entry, is the foundation for everything that follows in this module.

## theory
Definition for a combining operation `⊕` with identity `e`: `prefix[0] = e` and `prefix[i] = prefix[i − 1] ⊕ a[i − 1]` for i from 1 to n. The array has n + 1 entries, and `prefix[i]` summarises the first i elements. Using one extra leading entry for the empty prefix avoids special cases when a query starts at index 0.

Ways to build it:

- A loop appending the running total: `prefix.append(prefix[-1] + x)`
- `itertools.accumulate(a)` in Python, which returns the inclusive running totals (without the leading zero, so prepend it if needed) and accepts any binary function: `accumulate(a, operator.xor)` or `accumulate(a, max)`
- `numpy.cumsum` for numeric arrays, or `reduce`-based scans in JavaScript and Java streams
- In place: `a[i] += a[i − 1]` overwrites the input with inclusive running totals, saving memory when the original values are not needed

Variants and what they answer:

- Sum: totals of any range by subtraction, `prefix[r + 1] − prefix[l]`
- XOR: the XOR of a range is `prefix[r + 1] ^ prefix[l]`, because XOR is its own inverse; used for queries such as "XOR of subarray" and for the XOR basis problems
- Counts of a property: build a prefix of 1 and 0 indicators (is the element even, is the character a vowel) to count matches in any range in O(1)
- Product: invertible only when no element is zero (or by tracking zeros separately) and when modular inverses exist; commonly replaced by prefix and suffix products without division
- Maximum or minimum: `accumulate(a, max)` gives the best value seen so far, but a range maximum cannot be recovered by subtraction; such prefix maxima answer "largest value up to here" and help in problems like trapping rain water, while range maxima need sparse tables or segment trees
- Character frequencies: one prefix array per symbol, or a prefix of count vectors, to answer "how many times does c occur in s[l..r]"

Example with `[3, 1, 4, 1, 5, 9, 2, 6]`: the running sums are `[3, 4, 8, 9, 14, 23, 25, 31]`, the running XORs `[3, 2, 6, 7, 2, 11, 9, 15]` and the running maxima `[3, 3, 4, 4, 5, 9, 9, 9]`. The prefix of even-element indicators is `[0, 0, 1, 1, 1, 1, 2, 3]`: the three even numbers are 4, 2 and 6.

Practical concerns:

- Integer overflow for sums of large values in fixed-width languages; use 64-bit integers or wider
- Floating-point accumulation errors for long prefix arrays; prefer integer representations or compensated summation
- The prefix array is a snapshot: if elements change, it is stale; use a Fenwick tree for point updates
- Memory for very large arrays: compute prefixes on the fly in a single pass when only the running value is needed
- Off-by-one conventions: decide whether the array is inclusive (`prefix[i]` includes a[i]) or exclusive with a leading zero, and be consistent in queries

## explain
1. Decide the operation and its identity element: zero for sums and XOR, a very small number for maximum.
2. Create the array with the identity as the first entry.
3. For each element, combine the previous prefix with it and store the result.
4. Document the convention: n + 1 entries, `prefix[i]` covers the first i elements.
5. Answer later queries from the stored values using the inverse operation where one exists.
6. Test with empty input, one element, negatives and extreme values.

## example
The Python lines build running sums, XORs and maxima for the eight numbers with `accumulate`, and a prefix of even indicators whose last value 3 counts the even elements. The JavaScript program builds the prefix array with a leading zero and computes the sum of a range from two entries.

## real
Database engines keep cumulative counters for fast range aggregates, image libraries use summed-area tables, and analytics dashboards compute totals over any date range from cumulative columns.

## pros
- One linear pass enables constant-time queries
- Works for any invertible combining operation
- Simple and cache-friendly

## cons
- Needs extra memory unless done in place
- Becomes invalid when the data changes
- Operations without an inverse need other structures for range queries

## uses
- Preparing for many range sum or XOR queries
- Counting elements with a property in any range
- Computing running totals and maxima
- Building blocks for difference arrays and two-dimensional sums

## mistakes
- Forgetting the leading identity entry and mishandling ranges that start at zero
- Using prefix maxima to answer range maximum queries
- Mixing inclusive and exclusive conventions between building and querying
- Overflowing a narrow integer type with large totals

## interview
**Q:** What operations can be used to build a prefix array that supports range queries by subtraction?
**A:** Operations with an inverse, such as addition (inverse is subtraction) and XOR (its own inverse). Maximum and minimum have no inverse, so a prefix array cannot answer their range queries.

**Q:** Why does the prefix array have n plus 1 entries?
**A:** The first entry holds the identity for the empty prefix, so a range starting at index 0 is answered by the same formula as every other range.

**Q:** How do you count the even numbers in a range in constant time?
**A:** Build a prefix array of indicators, 1 for even elements and 0 otherwise, and subtract the two prefix entries that bound the range.

## summary
A prefix array stores the combination of the first i elements, built in O(n) with a leading identity entry. It answers range queries by subtraction for sums, XOR and counts, and gives running maxima for one-sided questions.

## codenote
The Python sample builds different kinds of prefix arrays. The JavaScript sample builds a sum prefix and answers a range.

## code
### python
```python
import operator
from itertools import accumulate

numbers = [3, 1, 4, 1, 5, 9, 2, 6]
print(list(accumulate(numbers)))
print(list(accumulate(numbers, operator.xor)))
print(list(accumulate(numbers, max)))
print(list(accumulate(1 if n % 2 == 0 else 0 for n in numbers)))
```
Output:
```text
[3, 4, 8, 9, 14, 23, 25, 31]
[3, 2, 6, 7, 2, 11, 9, 15]
[3, 3, 4, 4, 5, 9, 9, 9]
[0, 0, 1, 1, 1, 1, 2, 3]
```
### javascript
```javascript
const numbers = [3, 1, 4, 1, 5, 9, 2, 6];
const prefix = [0];
for (const n of numbers) prefix.push(prefix[prefix.length - 1] + n);

const rangeSum = (left, right) => prefix[right + 1] - prefix[left];
console.log(prefix.join(" "));
console.log(rangeSum(1, 3), rangeSum(0, 7));
```
Output:
```text
0 3 4 8 9 14 23 25 31
6 31
```

## quiz
1. What does prefix[i] hold when the array has a leading zero?
   - [ ] Only the element at index i
   - [x] The combined value of the first i elements
   - [ ] The maximum so far
   - [ ] The average
   > It summarises everything before position i.
2. Which operation lets a prefix array answer range queries by undoing the earlier part?
   - [ ] Maximum
   - [x] XOR
   - [ ] Minimum
   - [ ] Bitwise AND
   > XOR is its own inverse, like subtraction for sums.
3. What does itertools.accumulate return by default?
   - [ ] Pairs of adjacent elements
   - [x] The running totals of the input
   - [ ] The sorted input
   - [ ] The reversed input
   > It starts with the first element and has no leading zero.
4. Why can a prefix of maxima not answer range maximum queries?
   - [ ] It is too large
   - [x] A maximum cannot be undone to remove the elements before the range
   - [ ] It needs sorting
   - [ ] It overflows
   > There is no inverse operation for it.

# Range Sum Queries
kind: algorithm
time: O(n) to preprocess the array once and O(1) per query, so q queries cost O(n + q); the direct method costs O(n) per query.
space: O(n) for the prefix array.

## intro
A common workload is to build a structure once and answer many questions about the same data: what is the total of the sales between day 5 and day 90, how many requests arrived in this interval? When the data does not change between queries, prefix sums turn each question into a subtraction, and the design question becomes how to package the structure and where it stops being enough.

## theory
Static range sum: given an array that never changes and many queries `(l, r)`, return the sum of `a[l..r]` inclusive. Precompute `prefix[0..n]` with `prefix[0] = 0`; each query is `prefix[r + 1] − prefix[l]`.

Packaging as a small class (a typical interview and library design):

- The constructor builds the prefix array in O(n)
- The method `sum_range(l, r)` returns the difference in O(1)
- The object is immutable, which makes it safe to share and cache

For `[-2, 0, 3, -5, 2, -1]`, the sums of ranges (0, 2), (2, 5) and (0, 5) are 1, −1 and −3. Negative numbers pose no problem for the subtraction.

Batching: when all queries are known in advance, one pass over them after preprocessing gives O(n + q) in total. Offline techniques for more complex questions (sorting queries, Mo's algorithm) are generalisations when simple subtraction is not enough.

Complexity comparison: answering q queries by summing each range costs O(q · n) in the worst case; with a prefix array it is O(n + q). For n = q = 100,000 that is 10 billion operations versus 200,000.

When prefix sums are not enough:

- The array changes: point updates make the prefix array stale (an update costs O(n) to repair). Use a Fenwick tree (binary indexed tree) or segment tree, which support both updates and range sums in O(log n).
- Range queries with other aggregates: minimum, maximum or greatest common divisor have no inverse, so use a sparse table (static, O(1) queries after O(n log n) preparation) or a segment tree
- Range updates with range queries: lazy propagation or two Fenwick trees
- Multi-dimensional queries: a two-dimensional prefix table, covered later in this module
- Queries about counts of distinct values: need offline processing with a Fenwick tree

Design decisions: use closed ranges `[l, r]` consistently or half-open `[l, r)`, validate that `0 <= l <= r < n`, and decide what happens for an empty range (return zero). Return type: wide integers for sums.

Correctness argument: `prefix[r + 1]` is the sum of elements 0 through r, `prefix[l]` the sum of elements 0 through l − 1, so their difference is exactly elements l through r. Associativity and the existence of an inverse for addition make the subtraction valid.

## explain
1. Confirm that the data is static and that there are many queries.
2. Build the prefix array with a leading zero.
3. Answer each query by subtracting two entries, after checking the bounds.
4. Wrap the preparation and queries in a class so the array can be reused.
5. If updates are needed, switch to a Fenwick tree.
6. Test single-element ranges, the full range and ranges with negative values.

## example
The Python `NumArray` class stores the prefix array of `[-2, 0, 3, -5, 2, -1]`; `sum_range(0, 2)` gives 1, `sum_range(2, 5)` gives −1 and `sum_range(0, 5)` gives −3. The JavaScript program answers three queries over the same data after a single preprocessing pass and prints the results.

## real
Dashboards compute totals for arbitrary date ranges, spreadsheet pivot features aggregate cumulative columns, and online judges use prefix sums as the standard answer to static range sum problems.

## pros
- Constant-time queries after linear preparation
- Immutable and easy to reason about
- Works with negative numbers and arbitrary ranges

## cons
- Invalid once the data changes
- Only works for operations with inverses
- Uses extra memory proportional to the array

## uses
- Answering many sum queries on a fixed array
- Computing cumulative reports over date ranges
- Counting events in intervals
- Serving as the first stage of more advanced range structures

## mistakes
- Updating the array and forgetting to rebuild the prefix array
- Using inclusive and exclusive range ends inconsistently
- Re-summing each range with a loop for every query
- Failing to validate the query bounds

## interview
**Q:** How do you answer many range sum queries on an unchanging array efficiently?
**A:** Precompute prefix sums in O(n) and answer each query as the difference of two prefix entries in O(1), for O(n plus q) total.

**Q:** What data structure would you use if the array also receives point updates?
**A:** A Fenwick tree or a segment tree, which support updates and range sums in O(log n) each.

**Q:** Why can the same technique not answer range minimum queries?
**A:** Subtraction undoes sums but nothing undoes a minimum, so a prefix array cannot isolate the minimum of a range; a sparse table or segment tree is used instead.

## summary
Range sum queries on a static array reduce to a subtraction of two prefix entries: O(n) preparation, O(1) per query. Wrap it in an immutable object, use consistent range conventions and switch to a Fenwick tree when updates appear.

## codenote
The Python sample implements a small immutable query object. The JavaScript sample answers a batch of queries.

## code
### python
```python
class NumArray:
    def __init__(self, numbers):
        self.prefix = [0]
        for value in numbers:
            self.prefix.append(self.prefix[-1] + value)

    def sum_range(self, left, right):
        return self.prefix[right + 1] - self.prefix[left]

array = NumArray([-2, 0, 3, -5, 2, -1])
print(array.sum_range(0, 2), array.sum_range(2, 5), array.sum_range(0, 5))
```
Output:
```text
1 -1 -3
```
### javascript
```javascript
const data = [5, 2, 8, 1, 9, 3];
const prefix = [0];
for (const value of data) prefix.push(prefix[prefix.length - 1] + value);

const queries = [[0, 1], [2, 4], [0, 5], [3, 3]];
const answers = queries.map(([l, r]) => prefix[r + 1] - prefix[l]);
console.log(answers.join(","));
```
Output:
```text
7,18,28,1
```

## quiz
1. What is the cost of q range sum queries with prefix sums on n elements?
   - [ ] O(n times q)
   - [x] O(n + q)
   - [ ] O(q log n)
   - [ ] O(q squared)
   > One preparation pass and constant work per query.
2. What changes if the array receives updates between queries?
   - [ ] Nothing
   - [x] The prefix array becomes stale, so a Fenwick or segment tree is better
   - [ ] Queries become O(1) faster
   - [ ] Prefix sums are rebuilt for free
   > Updates must be reflected in the structure.
3. Which structure answers range minimum queries on static data in O(1)?
   - [ ] A prefix array of sums
   - [x] A sparse table
   - [ ] A stack
   - [ ] A hash map
   > Minimum has no inverse, so subtraction does not work.
4. What does the leading zero in the prefix array allow?
   - [ ] Faster building
   - [x] Ranges that start at index 0 to use the same formula as others
   - [ ] Negative indexes
   - [ ] Sorting
   > It represents the empty prefix.

# Prefix Sum with Hash Map
kind: algorithm
time: O(n) for a single pass, since each element needs one map lookup and one update with O(1) average cost.
space: O(n) for the map of prefix values, or O(k) when the prefix is reduced modulo k.

## intro
A prefix sum tells you what happened up to a point. A hash map of earlier prefix sums tells you when the running total last looked like something else. Together they find subarrays whose total satisfies a relationship, without trying every pair of endpoints. The counting version for a fixed target was covered in the window module; this lesson uses the idea for balance, divisibility and longest-subarray questions.

## theory
Core idea: a subarray from j to i − 1 has the property if a relation holds between `prefix[i]` and `prefix[j]`. Scan the array once, keep the map of what earlier prefixes looked like (as value, count or first index) and look up the partner of the current prefix.

Three useful variants:

- Longest balanced subarray (equal number of zeros and ones): replace each 0 by −1 and 1 by +1; a subarray is balanced when its sum is zero, that is, when two prefix sums are equal. Store the first index at which each prefix value occurs; when the same value appears again at index i, the subarray between the two has sum zero and length `i − first[value]`. For `[0, 1, 0, 0, 1, 1, 0]` the longest balanced subarray has length 6; for `[0, 1]` it has length 2; for `[1, 1, 1]` none exists, so the result is 0. Storing the first, not the latest, index is what maximises the length.
- Subarrays with sum divisible by k: `sum(j..i−1) = prefix[i] − prefix[j]` is divisible by k exactly when the two prefixes have the same remainder modulo k. Keep a count of each remainder; for each element, add the number of earlier prefixes with the same remainder to the answer and then record the current one. Start with remainder 0 counted once for the empty prefix. In Python the modulo of a negative number is already non-negative; in C, C++ and Java add k and take the remainder again. For `[4, 5, 0, −2, −3, 1]` and k = 5 there are 7 such subarrays.
- Longest subarray with a given sum: store the first index of each prefix value and look for `prefix − target`

Why it works: equality or modular equality of two prefix values is an equivalence relation, so grouping prefixes by value groups all valid starting points together; the pigeonhole principle also shows that among k + 1 prefix remainders two must coincide, which proves that any n ≥ k numbers contain a nonempty contiguous block whose sum is divisible by k.

Implementation points:

- Initialise the map with the empty prefix: value 0 at index −1 (for lengths) or count 1 (for counts)
- Insert first-occurrence indexes only when the value is new, never overwriting
- Update the map after querying it, so that an element does not pair with itself unless the empty subarray is intended
- Choose between counts (for how many) and first indexes (for how long)
- Use modulo before storing to keep the map small

Complexity: one pass, O(n) average time; memory O(n) for exact sums and O(k) for remainders.

Extensions: counting subarrays with sum in a range requires ordered structures; two-dimensional versions apply to submatrices with equal numbers of ones and zeros by fixing a pair of rows; the technique also applies to XOR (equal prefix XOR means a zero-XOR subarray) and to character counts (equal count vectors mean balanced substrings).

## explain
1. Transform the array so that the property becomes a statement about sums, for example mapping zeros to −1.
2. Compute running prefix values.
3. Use a map keyed by the quantity that must match: the prefix value, the remainder or the prefix minus the target.
4. Seed the map with the empty prefix.
5. For each position, query the map and update the answer, then record the current prefix.
6. Test empty arrays, arrays with no valid subarray, and negative values.

## example
The Python function `longest_balanced` returns 6 for `[0, 1, 0, 0, 1, 1, 0]`, 2 for `[0, 1]` and 0 for `[1, 1, 1]`. The divisibility counter returns 7 for `[4, 5, 0, -2, -3, 1]` with k = 5 and 0 for `[5]` with k = 9. The JavaScript function counts subarrays with an equal number of zeros and ones in `[0, 1, 0, 1]`, which is 4.

## real
Monitoring systems look for windows where positive and negative events cancel, financial systems find periods with zero net change and checksum algorithms rely on equal remainders.

## pros
- Linear time for relationships between two prefixes
- One technique solves balance, divisibility and target-sum questions
- Handles negative values

## cons
- Needs extra memory for the map
- First versus latest index and the empty prefix are easy to get wrong
- Negative remainders differ across languages

## uses
- Longest balanced binary subarray
- Counting subarrays with sums divisible by k
- Finding the longest subarray with a target sum
- Zero-XOR and balanced-character substring problems

## mistakes
- Overwriting the first index of a prefix value and shortening the longest subarray
- Forgetting to count the empty prefix
- Taking the remainder of a negative sum incorrectly in languages that keep the sign
- Updating the map before querying it

## interview
**Q:** How do you find the longest subarray with equal numbers of zeros and ones?
**A:** Treat zeros as minus one, compute running sums and store the first index of each sum. When a sum repeats at index i, the subarray after its first occurrence has sum zero, and its length is i minus that first index; keep the maximum.

**Q:** How do you count subarrays whose sum is divisible by k?
**A:** Track the running sum modulo k and a count of how often each remainder occurred, starting with remainder zero counted once. Each element adds the number of earlier prefixes with the same remainder to the answer.

**Q:** Why store the first index rather than the latest?
**A:** To maximise the length of the subarray between two equal prefix values, the earlier start is better, so later occurrences must not overwrite it.

## summary
Equal prefix values mark subarrays with zero total, and equal remainders mark subarrays with sums divisible by k. A hash map from prefix value to first index or count answers longest and counting questions in one pass.

## codenote
The Python sample finds the longest balanced subarray and counts divisible sums. The JavaScript sample counts balanced subarrays.

## code
### python
```python
from collections import defaultdict

def longest_balanced(bits):
    first = {0: -1}
    balance = best = 0
    for i, bit in enumerate(bits):
        balance += 1 if bit else -1
        if balance in first:
            best = max(best, i - first[balance])
        else:
            first[balance] = i
    return best

print(longest_balanced([0, 1, 0, 0, 1, 1, 0]), longest_balanced([0, 1]), longest_balanced([1, 1, 1]))

def divisible_by(values, k):
    counts = defaultdict(int)
    counts[0] = 1
    running = total = 0
    for value in values:
        running = (running + value) % k
        total += counts[running]
        counts[running] += 1
    return total

print(divisible_by([4, 5, 0, -2, -3, 1], 5), divisible_by([5], 9))
```
Output:
```text
6 2 0
7 0
```
### javascript
```javascript
function countBalanced(bits) {
  const seen = new Map([[0, 1]]);
  let balance = 0;
  let total = 0;
  for (const bit of bits) {
    balance += bit ? 1 : -1;
    total += seen.get(balance) ?? 0;
    seen.set(balance, (seen.get(balance) ?? 0) + 1);
  }
  return total;
}

console.log(countBalanced([0, 1, 0, 1]));
```
Output:
```text
4
```

## quiz
1. When does a subarray between two positions have sum zero?
   - [ ] When the prefix values differ by one
   - [x] When the two prefix values are equal
   - [ ] When the prefix values are zero
   - [ ] When the array is sorted
   > Their difference is the sum of the elements between them.
2. Why map zeros to minus one in the balanced subarray problem?
   - [ ] To make the numbers smaller
   - [x] Equal numbers of zeros and ones then correspond to a sum of zero
   - [ ] To sort the array
   - [ ] To avoid overflow
   > The balance becomes a plain sum.
3. Why store the first index of each prefix value?
   - [ ] It saves memory
   - [x] Earlier starts give longer subarrays
   - [ ] Later indexes are invalid
   - [ ] The map requires it
   > Overwriting would shorten the result.
4. When is the sum of a subarray divisible by k?
   - [ ] When its length is divisible by k
   - [x] When the two prefix sums have the same remainder modulo k
   - [ ] When its first element is divisible by k
   - [ ] When it is sorted
   > The difference of equal remainders is a multiple of k.

# Difference Arrays
kind: algorithm
time: O(1) per range update on the difference array and O(n) to recover the final array, so q updates cost O(n + q) instead of O(n · q).
space: O(n) for the difference array, with one extra slot at the end.

## intro
Adding a value to every element of a range looks like a loop, and with many updates that loop is slow. A difference array turns each range update into two point updates, and a single prefix-sum pass at the end produces the final array. It is the exact inverse of the prefix sum, and it is the key to problems with many overlapping intervals.

## theory
Definition: the difference array `d` of an array `a` has `d[0] = a[0]` and `d[i] = a[i] − a[i − 1]` for i greater than 0. It stores how much each element changes compared with its predecessor, and the prefix sums of `d` give back `a`.

Range update: to add `v` to `a[l..r]` (inclusive), do `d[l] += v` and `d[r + 1] −= v`. After taking prefix sums, every element from l to r increases by v, because the increase starts at l and is cancelled right after r. The elements outside the range are unaffected. The difference array needs length n + 1 so that index r + 1 exists when r is the last position.

Procedure for many updates:

- Start with `d` all zeros (when the initial array is all zeros), or with the differences of the initial array
- Apply each update in O(1)
- Compute the prefix sums of `d` once, in O(n), to obtain the final array

Cost: O(n + q) for q updates compared with O(n · q) when each update loops over its range.

Worked example: n = 5, all zeros, updates (1, 3, +2), (2, 4, +3) and (0, 2, −1). The differences become `[-1, 2, 1, 0, −2, −3]`? Applying each update: first adds 2 at index 1 and subtracts 2 at index 4; the second adds 3 at 2 and subtracts 3 at 5; the third subtracts 1 at 0 and adds 1 at 3. The prefix sums of the first five entries give the final array `[-1, 1, 4, 5, 3]`, which can be verified by adding the three ranges directly.

Typical problems:

- Corporate flight bookings: add seats to a range of flights per booking and report the totals
- Car pooling and meeting-room occupancy: add at the start time, subtract at the end time and scan for the peak
- Range add queries followed by a read of the whole array
- Painting or covering intervals and counting how many intervals cover each point
- Image processing: adding a constant over a rectangle using a two-dimensional difference array with four corner updates
- Event-time sweep lines: the same idea in the time dimension, with sorted events

Relation to prefix sums: prefix sum and difference are inverse operations, like integration and differentiation. A range update on `a` is a point update on `d`; a point update on `a` is two nearby changes on `d`.

Limitations: the final array is only available after the prefix pass; interleaving reads between updates requires a Fenwick tree (range update, point query) or segment tree with lazy propagation. For updates over a huge coordinate range, use coordinate compression or a sorted map of events.

Pitfalls: forgetting the extra slot for `r + 1`, using exclusive end indexes inconsistently, and forgetting that the initial array may be non-zero (take its differences first).

## explain
1. Create a difference array of length n + 1 filled with zeros.
2. For each range update, add v at l and subtract v at r + 1.
3. After all updates, compute prefix sums of the first n entries.
4. If the original array was non-zero, add it to the result or start from its differences.
5. For occupancy or overlap counts, treat each interval as an update of +1.
6. Check the first and last positions and updates that cover the whole array.

## example
The Python function applies three updates to an array of five zeros with a difference array and returns `[-1, 1, 4, 5, 3]`, matching the sums of the ranges added directly. The JavaScript program uses the same idea to find the maximum number of overlapping meetings: it records +1 at each start and −1 at each end for the meetings (1, 4), (2, 6) and (5, 8) and finds that at most 2 overlap.

## real
Reservation systems, event schedulers and sweep-line geometry programs use difference arrays or their sorted-event cousins to compute occupancy over time without looping over every time unit for every booking.

## pros
- Range updates in constant time
- Linear final reconstruction
- Natural fit for interval overlap counting

## cons
- Values are not readable until the prefix pass
- Needs a tree structure for interleaved updates and queries
- Off-by-one with the end index is common

## uses
- Applying many range additions
- Counting overlaps of intervals
- Computing maximum occupancy
- Image and grid updates over rectangles

## mistakes
- Not allocating the extra slot for index r plus one
- Mixing inclusive and exclusive end positions
- Reading values before the prefix pass
- Forgetting to include the initial array when it is not all zeros

## interview
**Q:** How does a difference array speed up many range updates?
**A:** Each update changes only two entries, adding the value at the start and subtracting it just after the end, so it costs O(1); one prefix-sum pass at the end produces the final array, for O(n plus q) overall.

**Q:** What is the relationship between prefix sums and difference arrays?
**A:** They are inverse operations: the prefix sum of the difference array recovers the original array, and the difference of a prefix sum array recovers the original values.

**Q:** How would you find the maximum number of meetings overlapping at any time?
**A:** Add one at each start and subtract one at each end in a difference array (or a sorted event list), take running sums and report the maximum.

## summary
A difference array turns range additions into two point changes and recovers the result with one prefix pass. It computes final values or overlap counts for many intervals in O(n plus q).

## codenote
The Python sample applies range updates and recovers the array. The JavaScript sample finds maximum overlap of meetings.

## code
### python
```python
from itertools import accumulate

def apply_updates(size, updates):
    diff = [0] * (size + 1)
    for left, right, amount in updates:
        diff[left] += amount
        diff[right + 1] -= amount
    return list(accumulate(diff[:size]))

print(apply_updates(5, [(1, 3, 2), (2, 4, 3), (0, 2, -1)]))
```
Output:
```text
[-1, 1, 4, 5, 3]
```
### javascript
```javascript
const meetings = [[1, 4], [2, 6], [5, 8]];
const diff = Array(10).fill(0);
for (const [start, end] of meetings) {
  diff[start] += 1;
  diff[end] -= 1;
}

let running = 0;
let busiest = 0;
for (const change of diff) {
  running += change;
  busiest = Math.max(busiest, running);
}
console.log(busiest);
```
Output:
```text
2
```

## quiz
1. How is a range update on a[l..r] recorded in the difference array?
   - [ ] Add v to every element of the range
   - [x] Add v at index l and subtract v at index r plus one
   - [ ] Subtract v at index l
   - [ ] Multiply the range by v
   > The effect starts at l and is cancelled after r.
2. What recovers the final array from the difference array?
   - [ ] Sorting
   - [x] A prefix sum pass
   - [ ] A second difference
   - [ ] Reversing
   > Prefix sums undo the differencing.
3. What is the cost of q range updates on an array of size n with a difference array?
   - [ ] O(n times q)
   - [x] O(n + q)
   - [ ] O(q log n)
   - [ ] O(q squared)
   > Each update is constant time and the rebuild is linear.
4. Why does the difference array need length n plus one?
   - [ ] To store the sum
   - [x] The cancelling update at r plus one must exist even when r is the last index
   - [ ] For sorting
   - [ ] For the identity
   > Otherwise the last range would index out of bounds.

# 2D Prefix Sum
kind: algorithm
time: O(r · c) to build the table for an r by c grid and O(1) per rectangle sum query.
space: O(r · c) for the table, with an extra row and column of zeros.

## intro
The idea of prefix sums extends from lines to grids. A summed-area table stores, for every cell, the total of the rectangle from the top-left corner down to that cell. Any rectangle inside the grid can then be summed with four lookups, whatever its size, which makes questions about regions of a matrix or an image cheap.

## theory
Definition: let `P[i][j]` be the sum of all cells `grid[x][y]` with x less than i and y less than j. The table has r + 1 rows and c + 1 columns, with row 0 and column 0 equal to zero.

Building it: each entry combines the cell above, the cell on the left and the current cell, and removes the overlap that was counted twice:

`P[i+1][j+1] = grid[i][j] + P[i][j+1] + P[i+1][j] − P[i][j]`

One pass over the grid in row-major order is enough: O(r · c).

Querying: the sum of the rectangle with top-left `(r1, c1)` and bottom-right `(r2, c2)`, inclusive, is

`P[r2+1][c2+1] − P[r1][c2+1] − P[r2+1][c1] + P[r1][c1]`

Geometric reading (inclusion and exclusion): take the big rectangle from the origin to the bottom-right corner, subtract the strip above the region and the strip to its left, and add back the corner rectangle that was subtracted twice.

Example grid:

`3 0 1 4 2` / `5 6 3 2 1` / `1 2 0 1 5` / `4 1 0 1 7` / `1 0 3 0 5`

The sum of the rectangle from row 2, column 1 to row 4, column 3 is 8, the 2 by 2 square at rows 1 to 2 and columns 1 to 2 sums to 11 (6 + 3 + 2 + 0), and the whole grid sums to 58.

Applications:

- Fast region sums in images (box blur, integral images in computer vision such as the Viola-Jones detector)
- Counting items in rectangular regions of a map or board
- Finding the largest square or rectangle with a sum constraint, by testing candidate sizes with O(1) queries (often combined with binary search on the side length)
- Maximum sum submatrix, by fixing pairs of rows and applying one-dimensional methods
- Number of submatrices with a given sum, using a hash map over row pairs
- Two-dimensional difference arrays for adding a value over a rectangle with four corner updates `+v` at (r1, c1), `−v` at (r1, c2 + 1), `−v` at (r2 + 1, c1) and `+v` at (r2 + 1, c2 + 1)
- Prefix XOR and prefix counts in two dimensions, for example the number of ones in a rectangle of a binary matrix

Limits: the table is static; for changing cells use a two-dimensional Fenwick tree. Memory is proportional to the grid, so for very large images tiles are processed separately. Integer overflow matters for large sums in images with 8-bit pixels summed over millions of cells, so use 64-bit totals.

Pitfalls: off-by-one between inclusive coordinates and the shifted table, forgetting the added-back corner term, and mixing up row and column order in the arguments.

## explain
1. Create a table with one extra row and column of zeros.
2. Fill it with the recurrence: cell plus above plus left minus above-left.
3. For a query, apply inclusion and exclusion with the four corners, shifting the bottom-right by one.
4. Check coordinates are inclusive and in range.
5. For updates over rectangles, use the four-corner difference version and a prefix pass.
6. Verify with a brute-force sum on small random grids.

## example
The Python code builds the table for the five by five grid. The rectangle from (2, 1) to (4, 3) sums to 8, the square from (1, 1) to (2, 2) sums to 11 and the whole grid sums to 58, each computed with four table lookups. The JavaScript program builds a table for a smaller grid and queries a rectangle.

## real
Computer vision libraries use integral images for fast feature computation, GIS systems total values over map regions, and game engines count units inside rectangles with these tables.

## pros
- Constant-time rectangle sums after one pass
- Simple recurrence and query formula
- Extends to counts, XOR and updates via difference arrays

## cons
- Static data only
- Memory proportional to the grid
- Four-term formulas invite sign and index mistakes

## uses
- Sums over rectangular regions of images and matrices
- Counting items in map regions
- Searching for squares and rectangles with sum conditions
- Adding values over many rectangles with a difference table

## mistakes
- Forgetting to add back the doubly subtracted corner
- Using exclusive and inclusive coordinates inconsistently
- Not shifting indexes for the padded row and column
- Rebuilding the table after changing a single cell instead of using a tree

## interview
**Q:** How do you compute the sum of any rectangle in a matrix in constant time?
**A:** Precompute a table where each entry is the sum of the rectangle from the top-left corner to that cell, then combine four entries: the big corner, minus the strip above, minus the strip to the left, plus the doubly subtracted corner.

**Q:** What is the recurrence for building the two-dimensional prefix table?
**A:** P at (i plus 1, j plus 1) equals the cell value plus P above plus P to the left minus P at the up-left diagonal, which removes the overlapping region counted twice.

**Q:** How would you add a value to a whole rectangle many times efficiently?
**A:** Use a two-dimensional difference array: add the value at the top-left corner, subtract it just beyond the right edge and just below the bottom edge, add it back at the opposite corner, and take two-dimensional prefix sums at the end.

## summary
A summed-area table stores rectangle totals from the origin, built in O(r times c) with inclusion and exclusion and queried with four lookups. Use difference tables for rectangle updates and mind the index shift.

## codenote
The Python sample builds the table and queries rectangles. The JavaScript sample builds a smaller table.

## code
### python
```python
grid = [
    [3, 0, 1, 4, 2],
    [5, 6, 3, 2, 1],
    [1, 2, 0, 1, 5],
    [4, 1, 0, 1, 7],
    [1, 0, 3, 0, 5],
]
rows, cols = len(grid), len(grid[0])
table = [[0] * (cols + 1) for _ in range(rows + 1)]
for i in range(rows):
    for j in range(cols):
        table[i + 1][j + 1] = grid[i][j] + table[i][j + 1] + table[i + 1][j] - table[i][j]

def rectangle(r1, c1, r2, c2):
    return table[r2 + 1][c2 + 1] - table[r1][c2 + 1] - table[r2 + 1][c1] + table[r1][c1]

print(rectangle(2, 1, 4, 3), rectangle(1, 1, 2, 2), rectangle(0, 0, 4, 4))
```
Output:
```text
8 11 58
```
### javascript
```javascript
const grid = [
  [1, 2, 3],
  [4, 5, 6],
  [7, 8, 9],
];
const table = Array.from({ length: 4 }, () => Array(4).fill(0));
for (let i = 0; i < 3; i++) {
  for (let j = 0; j < 3; j++) {
    table[i + 1][j + 1] = grid[i][j] + table[i][j + 1] + table[i + 1][j] - table[i][j];
  }
}

const rectangle = (r1, c1, r2, c2) =>
  table[r2 + 1][c2 + 1] - table[r1][c2 + 1] - table[r2 + 1][c1] + table[r1][c1];
console.log(rectangle(1, 1, 2, 2), rectangle(0, 0, 2, 2));
```
Output:
```text
28 45
```

## quiz
1. How many table lookups does a rectangle sum query need?
   - [ ] 1
   - [ ] 2
   - [ ] 3
   - [x] 4
   > Big corner, strip above, strip left and the added-back corner.
2. Why is the top-left overlap added back in the query?
   - [ ] To make the sum bigger
   - [x] It was subtracted twice, once with each strip
   - [ ] To handle negatives
   - [ ] It is a padding value
   > Inclusion and exclusion corrects the double subtraction.
3. What is the time to build the table for an r by c grid?
   - [ ] O(r plus c)
   - [x] O(r times c)
   - [ ] O(r squared times c)
   - [ ] O(log r)
   > Each cell is computed once from three neighbours.
4. What structure supports cell updates between queries?
   - [ ] A larger table
   - [x] A two-dimensional Fenwick tree
   - [ ] A sorted list
   - [ ] A stack
   > Static tables become stale after updates.

# Binary Search on Prefix
kind: algorithm
time: O(n) to build the prefix array and O(log n) per search on it; the shortest-subarray search runs one binary search per end position, so O(n log n) in total.
space: O(n) for the prefix array.

## intro
For arrays of non-negative numbers, prefix sums never decrease, and a sorted sequence is exactly what binary search needs. Searching a prefix array answers "where does the total first reach this amount?", which is the idea behind weighted random choice, locating the cut points of a running total and finding the shortest subarray that reaches a target sum.

## theory
Monotonicity: if all elements are non-negative, `prefix[0] ≤ prefix[1] ≤ ... ≤ prefix[n]`. With strictly positive elements the sequence is strictly increasing. Binary search on this array finds positions by value in O(log n) instead of scanning in O(n).

Typical uses:

- First index where the running total reaches a target: `bisect_left(prefix, target)` returns the smallest i with `prefix[i] >= target`. This finds the first day when cumulative sales exceed a goal.
- Weighted random pick: with weights `[1, 3, 2]` the cumulative array is `[1, 4, 6]`. Draw a random integer r from 1 to the total (6), and find the first index whose prefix is at least r. The draws 1 to 6 map to the indexes `[0, 1, 1, 1, 2, 2]`, so index 1 is chosen three times out of six, in proportion to its weight. Each pick costs O(log n) after O(n) preparation, instead of O(n) per pick.
- Shortest subarray with sum at least a target (positive numbers): for each end position i, look for the latest start j with `prefix[i] − prefix[j] >= target`, which is the largest j with `prefix[j] <= prefix[i] − target`, found with `bisect_right(prefix, prefix[i] − target) − 1`. The length is `i − j`; take the minimum over i. For `[2, 3, 1, 2, 4, 3]` and target 7 the shortest length is 2, and for `[1, 1, 1, 1, 1]` with target 11 there is none. This runs in O(n log n) and is an alternative to the sliding window, with the advantage of extending to some variants.
- Locating which segment a position belongs to: given lengths of consecutive pieces, the cumulative lengths let you find the piece containing offset x (lines in a text buffer, chunks in a file, rows in a table)
- Searching for the split points that divide a total into equal shares

Rules and pitfalls:

- The binary search requires monotonic prefix values, so negative numbers break the approach; use a sliding window with a deque or other methods in that case
- Choose between `bisect_left` and `bisect_right` carefully: left gives the first index with a value not less than the target, right gives the first index with a value greater than it
- The prefix array has n + 1 entries including the leading zero, so convert indexes back to element positions with care
- Floating-point weights need tolerance, or integer scaling for exact proportions
- For repeated random draws, build the cumulative array once

Related structures: a Fenwick tree supports prefix queries with updates and offers a descent that finds the smallest index with a given prefix sum in O(log n), the dynamic analogue of this lesson.

## explain
1. Check that the elements are non-negative so the prefix array is non-decreasing.
2. Build the prefix array once with a leading zero.
3. Decide whether you need the first index at or above a value (left) or strictly above (right).
4. Binary search the prefix array for the value derived from your question.
5. Convert the found index to the answer, adjusting for the leading zero.
6. Test targets below the first total, above the last total and exactly equal to a total.

## example
The Python code builds the cumulative array `[1, 4, 6]` for the weights `[1, 3, 2]` and maps the draws 1 to 6 to indexes `[0, 1, 1, 1, 2, 2]`. The function `shortest_at_least` returns 2 for `[2, 3, 1, 2, 4, 3]` with target 7 and 0 for the unreachable target 11 on five ones. The JavaScript program finds on which day a running total first reaches 100.

## real
Games choose loot by weighted random draws, load balancers pick servers in proportion to capacity, and text editors find the line that contains a character offset with cumulative line lengths.

## pros
- Logarithmic search over cumulative totals
- Efficient weighted random selection after one preparation pass
- Works for locating positions in concatenated pieces

## cons
- Requires non-negative values
- Index conversion between prefix and element positions causes off-by-one errors
- Updates require a different structure

## uses
- Weighted random choice
- Finding the first time a running total reaches a goal
- Shortest subarray with a minimum sum on positive data
- Locating the piece that contains a given offset

## mistakes
- Using it with negative numbers
- Choosing left and right bisection incorrectly
- Forgetting that the prefix array is one longer than the data
- Rebuilding the cumulative array for every random pick

## interview
**Q:** How do you pick an index at random in proportion to weights efficiently?
**A:** Build the cumulative weights once, draw a random integer up to the total, and binary search for the first cumulative value at least as large as the draw. Each pick costs O(log n).

**Q:** Why can you binary search a prefix sum array?
**A:** With non-negative elements the prefix sums never decrease, so the array is sorted and binary search applies.

**Q:** How does binary search on prefix sums find the shortest subarray with sum at least a target?
**A:** For each end position, search for the latest start whose prefix is at most the end prefix minus the target; the difference of positions is a candidate length, and the minimum over all ends is the answer.

## summary
Prefix sums of non-negative numbers are sorted, so binary search locates where a running total reaches a value: weighted random choice, first day reaching a goal and shortest subarray reaching a target, in O(log n) per search.

## codenote
The Python sample picks by weight and finds the shortest subarray. The JavaScript sample finds the day a total passes a target.

## code
### python
```python
from bisect import bisect_left, bisect_right
from itertools import accumulate

weights = [1, 3, 2]
cumulative = list(accumulate(weights))
print(cumulative, [bisect_left(cumulative, draw) for draw in range(1, 7)])

def shortest_at_least(target, values):
    prefix = [0] + list(accumulate(values))
    best = float("inf")
    for end in range(1, len(prefix)):
        start = bisect_right(prefix, prefix[end] - target) - 1
        if start >= 0 and prefix[end] - prefix[start] >= target:
            best = min(best, end - start)
    return 0 if best == float("inf") else best

print(shortest_at_least(7, [2, 3, 1, 2, 4, 3]), shortest_at_least(11, [1, 1, 1, 1, 1]))
```
Output:
```text
[1, 4, 6] [0, 1, 1, 1, 2, 2]
2 0
```
### javascript
```javascript
const daily = [30, 25, 20, 40, 15];
const running = [];
daily.reduce((total, amount) => {
  running.push(total + amount);
  return total + amount;
}, 0);

let low = 0;
let high = running.length - 1;
while (low < high) {
  const mid = (low + high) >> 1;
  if (running[mid] >= 100) high = mid;
  else low = mid + 1;
}
console.log(running.join(","), low + 1);
```
Output:
```text
30,55,75,115,130 4
```

## quiz
1. Why can prefix sums of non-negative numbers be binary searched?
   - [ ] They are always small
   - [x] They form a non-decreasing sequence
   - [ ] They are stored in a hash map
   - [ ] They have no leading zero
   > Sorted order is the requirement of binary search.
2. How does weighted random pick work with a cumulative array?
   - [ ] Pick the largest weight
   - [x] Draw a random number up to the total and find the first cumulative value at least that large
   - [ ] Pick uniformly
   - [ ] Shuffle the weights
   > Each index owns a share of draws proportional to its weight.
3. What breaks the approach?
   - [ ] Large arrays
   - [x] Negative numbers, since the prefix sums are no longer sorted
   - [ ] Duplicate weights
   - [ ] Zero weights only
   > Binary search needs monotonic data.
4. What does bisect_left return on the prefix array for a target?
   - [ ] The last index equal to the target
   - [x] The first index whose value is not less than the target
   - [ ] The number of elements
   - [ ] The middle index
   > It finds the leftmost position that reaches the target.
