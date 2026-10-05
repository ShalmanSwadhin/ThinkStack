# Linear Search
kind: algorithm
time: O(n) in the worst case, where the target is last or absent; O(1) in the best case, where it is first; about n/2 comparisons on average for a present target.
space: O(1) extra space, since only an index and the target are kept.
viz: linear-search
practice: linear-search-position

## intro
Linear search looks at the elements of a collection one after another until it finds the target or runs out of elements. It is the simplest search there is, it works on any collection in any order, and for short lists or one-off lookups it is often exactly the right choice.

## theory
Algorithm: start at the first element; compare it with the target; if equal, return its position; otherwise move to the next; if the end is reached, report that the target is absent (by convention -1, None or an exception).

Properties:

- Needs no preparation: the data may be unsorted, a linked list, a file read sequentially or a stream
- Cost: the number of comparisons depends on where the target is. Best case 1, worst case n, average case (n + 1) / 2 for a present target with equal chances for each position.
- Correctness: the invariant is that none of the elements already inspected equals the target
- It finds the first occurrence by default; continuing after a hit finds all occurrences, and scanning from the end finds the last one

Variants and improvements:

- Sentinel search: place a copy of the target at the end of the array so the loop can drop the index bound check; saves a comparison per step (a micro-optimisation) and requires care to restore the array and handle the not-found case
- Early exit on ordered data: in a sorted list, stop as soon as an element larger than the target is seen
- Move-to-front or transpose heuristics: after a successful search, move the found item toward the front so frequently searched items become cheap
- Searching with a predicate: find the first element satisfying a condition, as `next(x for x in xs if cond(x), None)` in Python or `findIndex` in JavaScript
- Parallel scanning for huge unsorted arrays

When to use it: tiny collections, unsorted data searched once, linked structures, or when building an index would cost more than a few searches. When not to: large collections searched repeatedly, where sorting once and using binary search, or a hash table, wins.

Built-in forms: Python's `list.index`, `in`, `count`; JavaScript's `indexOf`, `includes`, `find`, `findIndex`; Java's `indexOf`. They are linear scans written in optimised native code.

## explain
1. Decide the not-found result and document it.
2. Loop over the positions from the first to the last.
3. Compare each element with the target and return the position on a match.
4. After the loop, return the not-found value.
5. Count comparisons if you want to confirm the cost on test data.
6. Test an empty list, a one-element list, a match at the first, middle and last positions, duplicates and a missing target.

## example
The Python function `linear_search` over `[7, 3, 9, 3, 5]` returns 2 for the target 9 and -1 for 4, `list.index(3)` returns 1 (the first match), and the comprehension collects every position of 3: `[1, 3]`. The sentinel version appends the target to a copy of the list and walks until it finds it; for 5 it returns 4 and for the missing 4 it returns -1 because the found position is the sentinel itself. The JavaScript sample uses `findIndex` with a condition on objects.

## real
Searching a handful of configuration entries, scanning a log file for a keyword, finding a record in an unindexed table and checking membership in small lists are all linear searches, and databases fall back on full scans when no index exists.

## pros
- Works on unsorted data and any sequential structure
- Trivial to write and to get right
- No preprocessing or extra memory

## cons
- Slow for large collections searched many times
- Cost grows linearly with the size
- Does not exploit any order in the data

## uses
- Searching small or unsorted collections
- Finding the first element that satisfies a condition
- Scanning files, streams and linked lists
- Implementing membership tests when an index is not worth building

## mistakes
- Returning 0 for not found, which is a valid index
- Stopping the loop one element too early and missing the last
- Using linear search repeatedly on a large list instead of building a set
- Forgetting to handle duplicates when all matches are needed

## interview
**Q:** What is the time complexity of linear search?
**A:** O(n) in the worst case, when the target is last or missing, O(1) in the best case, and about n over 2 comparisons on average for a present target.

**Q:** What is a sentinel in linear search?
**A:** A copy of the target placed after the last element so the loop is guaranteed to stop there, which removes the need to test the index bound on every step.

**Q:** When is linear search the right choice?
**A:** For small or unsorted collections, structures that only allow sequential access, and searches done only once, where sorting or indexing would cost more than the scan.

## summary
Linear search checks elements one by one in O(n) time and O(1) space, needs no order and is ideal for small or unsorted data. Use binary search or hashing when data is large and searched often.

## codenote
The Python sample shows the plain search, the library methods, all matches and a sentinel version. The JavaScript sample finds an object by a condition.

## code
### python
```python
def linear_search(items, target):
    for index, value in enumerate(items):
        if value == target:
            return index
    return -1

data = [7, 3, 9, 3, 5]
print(linear_search(data, 9), linear_search(data, 4), data.index(3))
print([i for i, value in enumerate(data) if value == 3])

def sentinel_search(items, target):
    padded = items + [target]
    i = 0
    while padded[i] != target:
        i += 1
    return i if i < len(items) else -1

print(sentinel_search(data, 5), sentinel_search(data, 4))
```
Output:
```text
2 -1 1
[1, 3]
4 -1
```
### javascript
```javascript
const users = [
  { id: 1, name: "Ada" },
  { id: 2, name: "Max" },
  { id: 3, name: "Eve" },
];

console.log(users.findIndex((user) => user.name === "Eve"));
console.log(users.findIndex((user) => user.name === "Zed"));
```
Output:
```text
2
-1
```

## quiz
1. What is the worst-case number of comparisons of linear search on n elements?
   - [ ] 1
   - [ ] log n
   - [x] n
   - [ ] n squared
   > The target may be last or absent.
2. Why is 0 a poor value to return for not found?
   - [ ] It is too small
   - [x] It is a valid index
   - [ ] It is not an integer
   - [ ] It cannot be returned
   > Callers could not tell a match at the first position from no match.
3. What does a sentinel remove from the loop?
   - [ ] The comparison with the target
   - [x] The check that the index is within the bounds
   - [ ] The increment
   - [ ] The return statement
   > The loop is guaranteed to stop at the sentinel.
4. When should you avoid repeated linear searches?
   - [ ] For tiny lists
   - [x] On large collections searched many times, where a set or sorted index is better
   - [ ] On unsorted data
   - [ ] On linked lists
   > The repeated O(n) cost adds up.

# Binary Search on Arrays
kind: algorithm
time: O(log n) in the worst case, since the range halves at each step; O(1) in the best case where the middle element matches.
space: O(1) for the iterative version and O(log n) stack space for the recursive version.
viz: binary-search
practice: binary-search-position

## intro
Binary search finds a value in a sorted array by repeatedly comparing the target with the middle element and discarding the half that cannot contain it. It needs about 20 comparisons for a million elements and about 30 for a billion, which is why sorted data and binary search are the backbone of fast lookup.

## theory
Precondition: the array is sorted (ascending, in this lesson). Without order the discarded half could hold the target.

Algorithm (iterative, closed range):

- Keep `lo` and `hi`, the inclusive bounds of the range that may contain the target; initially 0 and n - 1
- While `lo <= hi`: compute `mid = (lo + hi) // 2`; if `a[mid] == target` return mid; if `a[mid] < target`, the target can only be to the right, so `lo = mid + 1`; otherwise `hi = mid - 1`
- If the loop ends, the target is absent

Invariant: if the target is in the array, it lies within `a[lo..hi]`. Each step keeps the invariant and shrinks the range, and the range becomes empty after at most `floor(log2 n) + 1` steps.

Details that cause bugs:

- Use `lo = mid + 1` and `hi = mid - 1`; setting them to `mid` can loop forever
- Computing `mid` as `(lo + hi) / 2` can overflow in fixed-width languages when lo and hi are large; use `lo + (hi - lo) / 2`
- Mixing closed ranges `[lo, hi]` with half-open ranges `[lo, hi)` produces off-by-one errors; pick one style and stick to it
- Duplicates: the plain algorithm returns any matching position; use lower and upper bound versions for first and last occurrences
- The data must stay sorted; inserting into a sorted array keeps O(n) cost for shifting

Costs compared: a million-element array needs at most 20 comparisons, linear search up to a million. Building the sorted order costs O(n log n) once, so binary search pays off when many searches follow.

Library support: `bisect_left` and `bisect_right` in Python, `Arrays.binarySearch` in Java, `std::binary_search` and `std::lower_bound` in C++. Binary search also works on any monotonic predicate, not just sorted arrays (see binary search on the answer).

## explain
1. Confirm that the array is sorted in the order you assume.
2. Set lo to 0 and hi to the last index.
3. Compute mid safely and compare a[mid] with the target.
4. Move lo above mid or hi below mid to discard the half without the target.
5. Stop when found or when lo passes hi.
6. Test an empty array, one element, first and last positions, a missing value smaller than all, larger than all and between elements.

## example
The Python function returns both the position and the number of steps. In the array of the 100 even numbers from 0 to 198, searching for 98 finds the middle element in one step at index 49. Searching for the missing odd value 99 narrows the range for 6 steps and then reports -1; `bisect_left` reports that 99 would be inserted at position 50. The JavaScript version searches an array of words and shows the same halving.

## real
Dictionary lookups on sorted files, database indexes (B-trees follow the same idea), version-control tools finding which change introduced a bug, and library functions for sorted collections all rest on binary search.

## pros
- Logarithmic time makes huge collections cheap to search
- Constant extra space for the iterative form
- Applies to any monotonic condition, not just stored arrays

## cons
- Requires sorted data and random access
- Off-by-one errors are easy to make
- Sorting or maintaining order has its own cost

## uses
- Looking up values in sorted arrays and files
- Finding insertion points in sorted lists
- Searching indexes in databases
- Locating thresholds in monotonic functions

## mistakes
- Applying it to unsorted data
- Setting lo or hi to mid and looping forever
- Overflowing when computing the midpoint in fixed-width integers
- Returning an arbitrary duplicate when the first or last is required

## interview
**Q:** What is the time complexity of binary search and why?
**A:** O(log n), because each comparison halves the remaining range, so at most about log base 2 of n steps are needed.

**Q:** Why compute mid as lo plus (hi minus lo) divided by 2?
**A:** The sum of lo and hi can overflow a fixed-width integer when both are large, while the offset form never exceeds hi.

**Q:** What loop invariant proves binary search correct?
**A:** If the target is in the array, it lies within the current range from lo to hi; each step preserves this and shrinks the range until it is found or empty.

## summary
Binary search halves a sorted range at every comparison, giving O(log n) time and O(1) space. Maintain the invariant carefully, compute the midpoint safely and choose bound conventions consistently.

## codenote
The Python sample counts steps and compares with bisect. The JavaScript sample searches a sorted list of words.

## code
### python
```python
from bisect import bisect_left

def binary_search(items, target):
    lo, hi, steps = 0, len(items) - 1, 0
    while lo <= hi:
        steps += 1
        mid = (lo + hi) // 2
        if items[mid] == target:
            return mid, steps
        if items[mid] < target:
            lo = mid + 1
        else:
            hi = mid - 1
    return -1, steps

data = list(range(0, 200, 2))
print(binary_search(data, 98), binary_search(data, 99), bisect_left(data, 99))
```
Output:
```text
(49, 1) (-1, 6) 50
```
### javascript
```javascript
function binarySearch(items, target) {
  let lo = 0;
  let hi = items.length - 1;
  while (lo <= hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    if (items[mid] === target) return mid;
    if (items[mid] < target) lo = mid + 1;
    else hi = mid - 1;
  }
  return -1;
}

const words = ["apple", "banana", "cherry", "grape", "kiwi", "mango"];
console.log(binarySearch(words, "grape"), binarySearch(words, "lemon"));
```
Output:
```text
3 -1
```

## quiz
1. What must be true of the array for binary search to work?
   - [ ] It has an even length
   - [x] It is sorted
   - [ ] It has no duplicates
   - [ ] It contains numbers only
   > Order tells which half can be discarded.
2. About how many comparisons does binary search need for a million elements?
   - [ ] 1,000
   - [ ] 100
   - [x] 20
   - [ ] 1,000,000
   > Log base 2 of a million is about 20.
3. What happens if lo is set to mid instead of mid plus 1 after a smaller element?
   - [ ] Nothing, it is equivalent
   - [x] The range may stop shrinking and the loop can run forever
   - [ ] The search becomes faster
   - [ ] The array is re-sorted
   > The element at mid was already examined.
4. Why use lo plus (hi minus lo) over 2 for the midpoint?
   - [ ] It is faster
   - [x] It avoids overflow of lo plus hi in fixed-width integers
   - [ ] It rounds up
   - [ ] It works on strings
   > The offset form never exceeds hi.

# Binary Search on Answer
kind: algorithm
time: O(log R · C), where R is the size of the range of possible answers and C is the cost of the feasibility check; for the shipping and eating-speed examples C is O(n), giving O(n log R).
space: O(1) extra space beyond the input.
viz: binary-search
practice: binary-search-position

## intro
Binary search is not limited to searching in arrays. Whenever the answer to a question is a number in a range and you can test quickly whether a candidate answer is large enough, the answers form a monotonic yes or no sequence, and you can binary search the answer itself. This turns many optimisation problems into a short loop.

## theory
Pattern: find the smallest (or largest) value x in a range such that a condition `feasible(x)` holds, where feasibility is monotonic: once true, it stays true for larger x (or the reverse). The sequence of answers looks like `no no no yes yes yes`, and the boundary is what binary search locates.

Template for the minimum feasible value:

- `lo` is the smallest possible answer and `hi` is a value known to be feasible (or the largest possible)
- While `lo < hi`: `mid = (lo + hi) // 2`; if `feasible(mid)`, then `hi = mid` (mid might be the answer); else `lo = mid + 1`
- At the end `lo == hi` is the smallest feasible value

For the largest feasible value, bias the midpoint upward (`mid = (lo + hi + 1) // 2`) and use `lo = mid` when feasible, to avoid an infinite loop.

Typical problems:

- Integer square root: the largest x with x² ≤ n; the check is `x * x <= n`
- Minimum eating speed: the slowest speed at which all piles can be finished in a given number of hours; the check sums `ceil(pile / speed)` over piles
- Shipping packages within D days: the least capacity so that the sequence of packages fits in D trips
- Splitting an array into k parts to minimise the largest sum
- Allocating work or placing items so that the minimum distance is as large as possible
- Searching real values with a precision (square roots, equation roots) by running a fixed number of iterations or until the interval is small

Why it works: the search space has a monotonic structure even though it is not stored anywhere. The cost is the number of halvings, log of the range size, times the cost of one feasibility test.

Checklist for applying it: define the answer variable and its range, prove monotonicity (if x works, does x + 1 work?), write an efficient `feasible` function, and choose the right template for minimum versus maximum.

Pitfalls: wrong bounds (a `hi` that is not feasible), non-monotonic conditions, infinite loops from the wrong midpoint rounding, integer overflow in the check, and floating-point termination.

## explain
1. State what you are minimising or maximising and the range of the answer.
2. Write feasible(x): given a candidate, can it be done?
3. Check monotonicity by reasoning about x and x + 1.
4. Pick the template: lower boundary for the minimum, upper boundary for the maximum.
5. Run the loop, then return lo.
6. Test the extremes of the range and cases where the answer equals a bound.

## example
For the piles `[3, 6, 7, 11]` and 8 hours the slowest speed that finishes in time is 4: at speed 4 the hours are 1 + 2 + 2 + 3 = 8, and at speed 3 they are 10. For `[30, 11, 23, 4, 20]` the answer is 30 with 5 hours and 23 with 6 hours. A custom integer square root searches the range from 0 to n and gives 9 for 99 and 10 for 100. The JavaScript program finds the smallest integer whose square is at least 2,000, which is 45.

## real
Schedulers, load balancers and resource planners use this technique to find minimal capacities, delivery plans and fair splits, and it is a common pattern in contests because it converts optimisation into decision.

## pros
- Turns optimisation problems into simpler decision problems
- Logarithmic number of feasibility checks
- Very short code once the check is written

## cons
- Requires a monotonic condition, which must be justified
- Wrong bounds or midpoint rounding cause subtle bugs
- The feasibility check may be the hard part

## uses
- Integer and real square roots
- Minimum capacity, speed or time problems
- Splitting arrays to minimise the largest part
- Maximising the minimum distance between placed items

## mistakes
- Using it when the condition is not monotonic
- Choosing an upper bound that is not feasible
- Biasing the midpoint the wrong way and looping forever
- Computing the check with integer division when ceiling was needed

## interview
**Q:** When can you binary search on the answer?
**A:** When the candidate answers form a monotonic sequence of feasible and infeasible values and you can test a candidate efficiently, so the boundary between them can be found by halving.

**Q:** How do you find the smallest feasible value with binary search?
**A:** Keep lo and hi with hi feasible; while lo is less than hi, test mid: if feasible set hi to mid, otherwise set lo to mid plus one. The final lo is the smallest feasible value.

**Q:** What is the complexity of the minimum eating speed solution?
**A:** O(n log m), where n is the number of piles and m the largest pile, since there are log m candidate speeds to test and each test sums over n piles.

## summary
Binary search the answer when feasibility is monotonic: define the range, write the check, and use the lower-boundary template for minima and the upper-boundary one for maxima. Cost is log of the range times the check.

## codenote
The Python sample solves the eating speed problem and a custom integer square root. The JavaScript sample finds the smallest integer whose square is large enough.

## code
### python
```python
def min_speed(piles, hours):
    lo, hi = 1, max(piles)
    while lo < hi:
        mid = (lo + hi) // 2
        needed = sum(-(-pile // mid) for pile in piles)
        if needed <= hours:
            hi = mid
        else:
            lo = mid + 1
    return lo

print(min_speed([3, 6, 7, 11], 8), min_speed([30, 11, 23, 4, 20], 5), min_speed([30, 11, 23, 4, 20], 6))

def integer_sqrt(n):
    lo, hi = 0, n
    while lo < hi:
        mid = (lo + hi + 1) // 2
        if mid * mid <= n:
            lo = mid
        else:
            hi = mid - 1
    return lo

print(integer_sqrt(99), integer_sqrt(100))
```
Output:
```text
4 30 23
9 10
```
### javascript
```javascript
let lo = 0;
let hi = 2000;
while (lo < hi) {
  const mid = Math.floor((lo + hi) / 2);
  if (mid * mid >= 2000) hi = mid;
  else lo = mid + 1;
}
console.log(lo);
```
Output:
```text
45
```

## quiz
1. What property must the feasibility condition have?
   - [ ] It must be random
   - [x] It must be monotonic in the candidate answer
   - [ ] It must be true for all values
   - [ ] It must be an equality
   > The boundary between no and yes is what the search finds.
2. How do you search for the largest feasible value without looping forever?
   - [ ] Use the same midpoint as for the minimum
   - [x] Round the midpoint up and set lo to mid when feasible
   - [ ] Reverse the array
   - [ ] Use linear search
   > An upward-biased midpoint guarantees progress.
3. What is the cost of the eating speed solution with n piles and largest pile m?
   - [ ] O(n)
   - [x] O(n log m)
   - [ ] O(m)
   - [ ] O(n squared)
   > There are log m candidate speeds and each check scans the piles.
4. Why must the initial hi be feasible in the minimum template?
   - [ ] To make the loop shorter
   - [x] So that a feasible answer is guaranteed to remain in the range
   - [ ] To avoid sorting
   - [ ] Because lo must be zero
   > The search keeps hi as a known feasible value.

# Ternary Search
kind: algorithm
time: O(log n) for a unimodal sequence of n elements, though each round makes two evaluations and shrinks the range to two thirds, so it uses more comparisons than binary search on a monotonic predicate.
space: O(1) for the iterative version.
viz: ternary-search

## intro
Ternary search finds the maximum or minimum of a function that rises and then falls (or falls and then rises) by comparing two interior points and discarding a third of the range. It solves a different problem from binary search: locating an extreme value of a unimodal function instead of a target in sorted data.

## theory
A function is unimodal on an interval if it strictly increases up to a single peak and then strictly decreases (for a maximum), or the reverse for a minimum. Examples: a downward-opening parabola, a sequence like 1, 3, 8, 12, 9, 4, 2, the distance to a moving object, the profit as a function of price.

Algorithm for a maximum on `[lo, hi]`:

- Choose two points `m1 = lo + (hi - lo) / 3` and `m2 = hi - (hi - lo) / 3`
- If `f(m1) < f(m2)`, the peak cannot lie in `[lo, m1]`, so set `lo = m1`
- Otherwise it cannot lie in `[m2, hi]`, so set `hi = m2`
- Repeat until the interval is small (for real numbers, a fixed number of iterations or until `hi - lo` is below a tolerance; for integers, until two or three candidates remain, then check them)

Each round shrinks the range to 2/3, so the number of rounds is about `log base 1.5 of n`, and each round evaluates the function twice. Binary search on the slope (compare `f(mid)` with `f(mid + 1)`) needs only one evaluation per round with a halving range and is usually better for discrete arrays; ternary search is most useful for real-valued functions where the slope is not available.

Conditions and pitfalls:

- Strict unimodality matters. Plateaus (equal values) can hide the peak and break the discard logic; with flat regions neither ternary nor binary search on slope is reliable
- For real functions use enough iterations (100 is usually ample for doubles) rather than comparing floating-point equality
- Integer versions need care with rounding and small ranges
- It finds a local extreme that is the global one only if the function is unimodal

Variants: golden-section search reuses one of the two evaluations in each round by choosing the points at the golden ratio, using one new evaluation per round; discrete ternary on arrays; searching for the minimum by flipping the comparison.

## explain
1. Confirm that the function or sequence is unimodal on the interval.
2. Decide whether you want the maximum or the minimum and set the comparison accordingly.
3. Compute the two interior points and evaluate the function there.
4. Discard the third that cannot contain the extreme.
5. Repeat until the interval is small, then pick the best remaining candidate.
6. Verify with a brute-force scan on small inputs.

## example
For the unimodal array `[1, 3, 8, 12, 9, 4, 2]` the discrete ternary search narrows the range to indexes 2 through 4 and returns index 3, the value 12. For the continuous function `-(x - 3)² + 10` on [0, 10], one hundred rounds converge to x = 3.0 with maximum value 10.0. The JavaScript program minimises `(x - 2)² + 1` on [-10, 10] and prints x of 2.000 and a value of 1.000.

## real
Tuning a parameter with a single best value, finding the best price or the optimal launch angle, and geometry problems such as the closest point on a convex curve use ternary search when only function values are available.

## pros
- Works for functions given only by evaluation
- Simple and robust for unimodal functions
- No derivatives needed

## cons
- Needs strict unimodality, which is easy to violate
- More function evaluations than binary search on the slope
- Plateaus and floating-point noise cause trouble

## uses
- Finding the maximum or minimum of a unimodal function
- Locating the peak of a bitonic array
- Parameter tuning with a single optimum
- Geometric problems on convex shapes

## mistakes
- Using it on functions with several peaks
- Comparing floating-point values for equality
- Stopping the integer version too late or too early and missing candidates
- Using it where binary search on the slope would be simpler

## interview
**Q:** What kind of function does ternary search work on?
**A:** A unimodal function, one that strictly increases to a single peak and then strictly decreases (or the reverse for a minimum), because comparing two interior points tells which outer third can be discarded.

**Q:** How does the range shrink in ternary search?
**A:** By a third at each round, to two thirds of the previous length, using two evaluations per round.

**Q:** How can the peak of a bitonic array be found faster than with ternary search?
**A:** Use binary search on the slope: compare the middle element with its neighbour and move toward the larger side, which needs one comparison per halving.

## summary
Ternary search locates the extreme of a unimodal function by comparing two interior points and discarding a third. Check unimodality, handle small ranges and prefer binary search on the slope for discrete arrays.

## codenote
The Python sample finds a peak in an array and the maximum of a parabola. The JavaScript sample minimises a real function.

## code
### python
```python
def peak_index(values):
    lo, hi = 0, len(values) - 1
    while hi - lo > 2:
        m1 = lo + (hi - lo) // 3
        m2 = hi - (hi - lo) // 3
        if values[m1] < values[m2]:
            lo = m1
        else:
            hi = m2
    return max(range(lo, hi + 1), key=lambda i: values[i])

print(peak_index([1, 3, 8, 12, 9, 4, 2]))

f = lambda x: -(x - 3) ** 2 + 10
lo, hi = 0.0, 10.0
for _ in range(100):
    m1 = lo + (hi - lo) / 3
    m2 = hi - (hi - lo) / 3
    if f(m1) < f(m2):
        lo = m1
    else:
        hi = m2
print(round(lo, 3), round(f(lo), 3))
```
Output:
```text
3
3.0 10.0
```
### javascript
```javascript
const f = (x) => (x - 2) ** 2 + 1;
let lo = -10;
let hi = 10;
for (let i = 0; i < 100; i++) {
  const m1 = lo + (hi - lo) / 3;
  const m2 = hi - (hi - lo) / 3;
  if (f(m1) > f(m2)) lo = m1;
  else hi = m2;
}
console.log(lo.toFixed(3), f(lo).toFixed(3));
```
Output:
```text
2.000 1.000
```

## quiz
1. What property must the function have for ternary search?
   - [ ] It must be linear
   - [x] It must be unimodal
   - [ ] It must be sorted
   - [ ] It must be integer valued
   > A single peak or valley is required.
2. What fraction of the range remains after one round?
   - [ ] One half
   - [x] Two thirds
   - [ ] One third
   - [ ] Three quarters
   > One third is discarded each time.
3. When f(m1) is less than f(m2) in a maximum search, what do you discard?
   - [ ] The right third
   - [x] The left third
   - [ ] The middle third
   - [ ] Nothing
   > The peak cannot lie to the left of m1.
4. Why is binary search on the slope often better for arrays?
   - [ ] It needs sorted data
   - [x] It halves the range with one comparison per step
   - [ ] It avoids loops
   - [ ] It works with plateaus
   > Ternary search needs two evaluations per round for a smaller reduction.

# Jump Search
kind: algorithm
time: O(√n) for a sorted array of n elements when the block size is √n; the search makes about n/m jumps and then up to m − 1 comparisons inside the block.
space: O(1) extra space.
viz: jump-search

## intro
Jump search sits between linear and binary search. On a sorted array it leaps ahead in fixed-size blocks until it passes the target, then scans backward or forward inside the last block. It does fewer comparisons than a linear scan and, unlike binary search, moves only forward, which matters when going backward is expensive.

## theory
Algorithm for a sorted array of n elements with block size m:

- Jump: look at the last element of each block, indexes `m - 1`, `2m - 1`, and so on, while that element is smaller than the target
- Scan: when the block's last element is at least the target, the target (if present) lies inside that block; scan its elements linearly
- Report found or not found

Choosing m: the worst case costs about `n/m` jumps plus `m - 1` comparisons in the block, which is smallest when `m = √n`, giving roughly 2√n comparisons in total. For 10,000 elements that is about 199 comparisons, compared with up to 10,000 for linear search and about 14 for binary search.

Where jump search is useful:

- Data structures where jumping forward is cheap but moving backward is costly or impossible, such as some tape or sequential storage, or skip pointers in linked lists
- Systems where binary search's random access pattern is expensive (disk seeks), though a block-based B-tree beats both
- Situations where its simplicity matters and the array is moderately sized

Comparison: linear search O(n); jump search O(√n); binary search O(log n). Binary search is faster on arrays with random access, so jump search is mostly of educational and niche interest. It is a good first example of balancing two phases (coarse and fine) with a block size that minimises total work, a pattern that reappears in sqrt decomposition and skip lists.

Edge cases: the last block may be shorter than m; the target can be smaller than the first element; empty arrays; duplicates (returns the first match within the block).

## explain
1. Make sure the array is sorted and compute the block size, usually the integer square root of n.
2. Jump ahead block by block while the last element of the block is below the target.
3. Count each jump if you want to measure the cost.
4. When a block is found, scan its elements linearly for the target.
5. Clamp the block end to the array length so the last block does not run out of bounds.
6. Test targets at the start, in the middle, at the end, below the minimum and above the maximum.

## example
For the sorted array `0, 3, 6, ..., 99` of 34 elements, the block size is 5. Searching for 63 makes 4 jumps (to blocks ending at 12, 27, 42, 57) and then scans the block of indexes 20 to 24, finding 63 at index 21. Searching for the absent 64 makes the same 4 jumps and then fails inside the block. The first element 0 is found without jumping and the last element 99 needs 6 jumps. The JavaScript program shows how the worst-case comparison count `n/m + m - 1` varies with the block size for n = 10,000.

## real
Jump-like strategies appear in skip lists, in indexes with sparse pointers, and in systems that read sorted data in large blocks before scanning within a block.

## pros
- Faster than linear search on sorted data
- Only moves forward, then scans a small block
- Simple to implement

## cons
- Slower than binary search on random-access arrays
- Requires sorted data
- Performance depends on choosing the block size

## uses
- Searching sorted sequential storage
- Teaching how to balance two phases of work
- Skip-pointer style lookups
- Cases where backward movement is costly

## mistakes
- Forgetting to clamp the last block to the array length
- Using a block size of 1 or n, which degenerates to linear search
- Running the block jumps on an array whose order is not guaranteed
- Assuming it beats binary search on arrays

## interview
**Q:** What is the optimal block size for jump search and why?
**A:** The square root of n, because the cost is about n over m jumps plus m minus one comparisons, and this sum is smallest when m equals the square root of n, giving about two times the square root of n steps.

**Q:** When would you prefer jump search to binary search?
**A:** When jumping backward is expensive or impossible, so that an algorithm that only moves forward and scans a small block fits the storage better.

**Q:** What is the time complexity of jump search?
**A:** O(√n), between the O(n) of linear search and the O(log n) of binary search.

## summary
Jump search leaps through a sorted array in blocks of about √n and then scans the block that can contain the target, costing O(√n). It beats linear search, loses to binary search and fits forward-only storage.

## codenote
The Python sample counts jumps for several targets. The JavaScript sample evaluates the cost formula for different block sizes.

## code
### python
```python
import math

def jump_search(items, target):
    n = len(items)
    step = int(math.sqrt(n))
    prev, jumps = 0, 0
    while prev < n and items[min(prev + step, n) - 1] < target:
        prev += step
        jumps += 1
    for i in range(prev, min(prev + step, n)):
        if items[i] == target:
            return i, jumps
    return -1, jumps

data = list(range(0, 100, 3))
print(len(data), jump_search(data, 63), jump_search(data, 64))
print(jump_search(data, 0), jump_search(data, 99))
```
Output:
```text
34 (21, 4) (-1, 4)
(0, 0) (33, 6)
```
### javascript
```javascript
const n = 10000;
const worstCase = (blockSize) => n / blockSize + blockSize - 1;
console.log([10, 100, 1000].map(worstCase));
```
Output:
```text
[ 1009, 199, 1009 ]
```

## quiz
1. What is the best block size for jump search on n elements?
   - [ ] 1
   - [ ] n divided by 2
   - [x] The square root of n
   - [ ] The logarithm of n
   > It balances the number of jumps against the scan inside the block.
2. What is the time complexity of jump search?
   - [ ] O(n)
   - [x] O(√n)
   - [ ] O(log n)
   - [ ] O(1)
   > The jumps and the scan each cost about √n.
3. What must be true of the data?
   - [ ] Distinct values only
   - [x] It must be sorted
   - [ ] It must be small
   - [ ] It must be integers
   > The comparison with block ends relies on order.
4. When does jump search have an advantage over binary search?
   - [ ] On any array
   - [x] When moving backward in the data is costly
   - [ ] When the data is unsorted
   - [ ] When n is tiny
   > It only moves forward.

# Interpolation Search
kind: algorithm
time: O(log log n) on average for sorted data with a roughly uniform distribution, and O(n) in the worst case for skewed data.
space: O(1) extra space.
viz: interpolation-search

## intro
Binary search always probes the middle, but a person looking for "Zebra" in a dictionary does not open it in the middle; they go near the end. Interpolation search does the same: it estimates where the target should be from its value relative to the ends, which on evenly spread data finds it in just a few probes.

## theory
Idea: for a sorted array whose values grow roughly linearly with the index, the position of the target can be estimated by linear interpolation between the values at the ends of the current range:

`pos = lo + (target - a[lo]) * (hi - lo) // (a[hi] - a[lo])`

Algorithm: while the target lies within `[a[lo], a[hi]]`, compute pos, compare `a[pos]` with the target, return if equal, otherwise continue in the part to the right of pos (`lo = pos + 1`) or to the left (`hi = pos - 1`). If `a[lo] == a[hi]` avoid dividing by zero. Stop when the target is outside the range.

Performance depends on how uniform the data is:

- Uniformly distributed keys: about `log2(log2 n)` probes on average, an astonishing 5 or so probes for a billion keys
- Skewed or clustered keys (exponential growth, repeated blocks): the estimate can be consistently wrong, and the algorithm degenerates to linear time, O(n), moving the range by one element at a time
- Mixed approaches (interpolation for a few steps, then binary search) combine the speed of the first with the worst-case guarantee of the second

Requirements and cautions:

- Sorted, numeric (or numerically mappable) keys with random access
- Integer arithmetic overflow in the interpolation product for large values
- Division by zero when the end values are equal
- The cost of computing the estimate is higher than a midpoint; for small arrays binary search wins
- Floating-point rounding can put pos outside the range; clamp it

Related ideas: interpolation search is a form of the secant or regula falsi method for finding roots; hash functions, for evenly distributed keys, perform a similar estimation of position; learned indexes in databases replace the linear formula with a trained model that predicts positions.

## explain
1. Check that the data is sorted and that the keys are numbers that are spread reasonably evenly.
2. Guard against equal end values and targets outside the range.
3. Compute the estimated position with integer arithmetic.
4. Compare, and narrow the range to one side of the estimate.
5. Repeat while the target can still be inside the range.
6. Compare the probe count with binary search on your data and fall back if it behaves badly.

## example
On the 1,000 evenly spaced values `10, 20, ..., 10000`, searching for 7770 computes the position 776 on the very first probe and finds it in one step, where binary search needs 8 steps. On the exponentially growing array `1, 2, 4, ..., 524288` searching for 2 to the power 15 takes 14 probes because the estimate is poor each time, while binary search takes 4. The JavaScript program prints the estimated position for a target in a uniform array.

## real
Searching evenly spread identifiers such as sequence numbers, timestamps or phone book style data benefits from this method, and the idea lives on in learned indexes and in hash tables that spread keys evenly.

## pros
- Very few probes on uniform data
- Simple formula
- Illustrates using the values, not just the order

## cons
- Linear time on skewed data
- Needs numeric keys and careful arithmetic
- Overhead makes it worse than binary search on small arrays

## uses
- Searching uniformly distributed numeric keys
- Teaching how value distribution can speed up search
- Hybrid search routines that switch to binary search
- Estimating positions in sorted logs by timestamp

## mistakes
- Using it on clustered or exponentially distributed data
- Dividing by zero when the end values are equal
- Overflowing the intermediate product
- Not checking that the target lies within the current range

## interview
**Q:** How does interpolation search choose its probe position?
**A:** By linear interpolation of the target between the values at the ends of the range, which estimates where it should be if the values grow evenly.

**Q:** What is the average and worst-case time of interpolation search?
**A:** About log log n probes on average for uniformly distributed keys, and O(n) in the worst case for skewed data.

**Q:** Why is binary search often preferred in practice?
**A:** It guarantees O(log n) for any sorted data, while interpolation search can degrade to linear time when the distribution is not close to uniform.

## summary
Interpolation search guesses the position from the target's value and is extremely fast on uniform data, but it degrades on skewed data. Guard the arithmetic and consider a hybrid with binary search for safety.

## codenote
The Python sample compares probe counts on uniform and exponential data. The JavaScript sample computes the estimate for one target.

## code
### python
```python
def interpolation_search(items, target):
    lo, hi, steps = 0, len(items) - 1, 0
    while lo <= hi and items[lo] <= target <= items[hi]:
        steps += 1
        if items[hi] == items[lo]:
            pos = lo
        else:
            pos = lo + (target - items[lo]) * (hi - lo) // (items[hi] - items[lo])
        if items[pos] == target:
            return pos, steps
        if items[pos] < target:
            lo = pos + 1
        else:
            hi = pos - 1
    return -1, steps

uniform = list(range(10, 10010, 10))
skewed = [2 ** i for i in range(20)]
print(interpolation_search(uniform, 7770))
print(interpolation_search(skewed, 2 ** 15))
```
Output:
```text
(776, 1)
(15, 14)
```
### javascript
```javascript
const values = Array.from({ length: 1000 }, (_, i) => (i + 1) * 10);
const target = 7770;
const lo = 0;
const hi = values.length - 1;
const pos = lo + Math.floor(((target - values[lo]) * (hi - lo)) / (values[hi] - values[lo]));
console.log(pos, values[pos]);
```
Output:
```text
776 7770
```

## quiz
1. On what kind of data does interpolation search shine?
   - [ ] Unsorted data
   - [x] Sorted, evenly distributed numeric keys
   - [ ] Strings of random length
   - [ ] Data with many duplicates
   > The linear estimate is accurate when values grow evenly.
2. What is the average number of probes for uniform data of n keys?
   - [ ] n
   - [ ] log n
   - [x] About log log n
   - [ ] 1 always
   > The estimate squeezes the range extremely fast.
3. What is the worst-case time of interpolation search?
   - [ ] O(log n)
   - [x] O(n)
   - [ ] O(1)
   - [ ] O(n log n)
   > Skewed data makes each probe remove only one element.
4. What must be guarded in the formula?
   - [ ] The sign of the target
   - [x] Division by zero when the end values are equal
   - [ ] The string length
   - [ ] The array name
   > Equal end values make the denominator zero.

# Exponential Search
kind: algorithm
time: O(log i) where i is the position of the target (or of the first element not smaller than it): about log i doublings plus a binary search over a range of size i; O(log n) in the worst case for an array of n elements.
space: O(1) extra space.
viz: exponential-search

## intro
Exponential search finds a target in a sorted array by first locating a range that contains it, doubling a bound 1, 2, 4, 8, ..., and then running binary search inside that range. It is faster than plain binary search when the target is near the start, and it works when the size of the data is unknown or unbounded.

## theory
Algorithm:

- If the first element is the target, return 0
- Set `bound = 1` and double it while `bound < n` and `a[bound] <= target`
- The target, if present, lies in the range `[bound / 2, min(bound, n - 1)]`
- Run binary search on that range

Cost: the doubling phase takes about `log2(i)` steps, where i is the index where the target would be, and the binary search over a range of size about i/2 takes another `log2(i)` steps. The total is O(log i). If the target is near the front, this is much smaller than the O(log n) of binary search over the whole array; if the target is at the end, it is about twice as expensive as plain binary search, but still O(log n).

Strengths and uses:

- Unbounded or infinite sorted sequences, where n is not known: the doubling finds an upper bound without knowing the length. The next lesson covers this case.
- Targets expected near the beginning, such as recently inserted keys in sorted logs
- Streaming data or files read in doubling chunks
- Large arrays on slow storage where you want to avoid probing the far end early

Relation to others: binary search is the second phase; jump search uses fixed steps and costs O(√n); the doubling phase is also called galloping, and TimSort uses galloping mode when merging runs.

Practical details: stop doubling when the bound passes the end and clamp it to the last index; handle empty arrays and the case in which the target equals `a[0]`; use `lo = bound // 2` as the start of the second phase because `a[bound // 2]` was already known to be at most the target.

Variants: exponential probing for monotonic predicates over integers (find the first x for which a condition becomes true, where the upper bound is unknown): double x until the condition holds, then binary search below.

## explain
1. Check small cases first: empty array and first element.
2. Double the bound while it is inside the array and its element does not exceed the target.
3. Define the search range from half the bound up to the bound or the end of the array.
4. Run binary search on that range.
5. Count doublings and binary steps if you want to confirm the O(log i) cost.
6. Test targets near the start, in the middle, at the end and beyond the end.

## example
In the array `1, 2, ..., 1000`, searching for 7 doubles the bound three times (to 2, 4 and 8) and then searches indexes 4 through 8, finding it at index 6. Searching for 777 doubles ten times, to 1024, and then performs a binary search over the upper half, finding index 776. Searching for 1001, which is absent, also doubles ten times and reports -1. The JavaScript program shows how many doublings are needed for targets at different positions.

## real
Search over append-only sorted logs, merging with galloping in sorting libraries, and finding the right size for a resource whose upper limit is unknown all use exponential search or its doubling phase.

## pros
- Efficient when the target is close to the start
- Works when the array length is unknown
- Reuses binary search as the second phase

## cons
- Up to about twice the comparisons of binary search when the target is near the end
- Needs sorted data
- Slightly more code than binary search

## uses
- Searching unbounded or very large sorted sequences
- Galloping in merge routines
- Finding thresholds of monotonic conditions with unknown bounds
- Looking up recent entries in sorted logs

## mistakes
- Forgetting to clamp the bound to the array length
- Starting the second phase at 0 instead of half the bound
- Doubling the bound over data that is not sorted, so the bracket is meaningless
- Not handling the first element specially

## interview
**Q:** How does exponential search work?
**A:** It doubles an index bound until the element at that bound exceeds the target, then runs binary search in the range between half the bound and the bound.

**Q:** What is its time complexity?
**A:** O(log i), where i is the position of the target, which is O(log n) in the worst case and faster than binary search when the target is near the start.

**Q:** When is exponential search better than binary search?
**A:** When the array is unbounded or its length is unknown, or when the target is expected to be near the beginning.

## summary
Exponential search doubles a bound to bracket the target and then binary searches the bracket. It costs O(log i) for a target at position i and works on sequences whose length is not known.

## codenote
The Python sample counts doublings for targets at different positions. The JavaScript sample counts doublings only.

## code
### python
```python
def exponential_search(items, target):
    if not items:
        return -1, 0
    if items[0] == target:
        return 0, 0
    bound, doublings = 1, 0
    while bound < len(items) and items[bound] <= target:
        bound *= 2
        doublings += 1
    lo, hi = bound // 2, min(bound, len(items) - 1)
    while lo <= hi:
        mid = (lo + hi) // 2
        if items[mid] == target:
            return mid, doublings
        if items[mid] < target:
            lo = mid + 1
        else:
            hi = mid - 1
    return -1, doublings

numbers = list(range(1, 1001))
print(exponential_search(numbers, 7))
print(exponential_search(numbers, 777))
print(exponential_search(numbers, 1001))
```
Output:
```text
(6, 3)
(776, 10)
(-1, 10)
```
### javascript
```javascript
function doublings(items, target) {
  let bound = 1;
  let count = 0;
  while (bound < items.length && items[bound] <= target) {
    bound *= 2;
    count++;
  }
  return count;
}

const numbers = Array.from({ length: 1000 }, (_, i) => i + 1);
console.log(doublings(numbers, 2), doublings(numbers, 100), doublings(numbers, 900));
```
Output:
```text
1 7 10
```

## quiz
1. What does the first phase of exponential search do?
   - [ ] Sorts the array
   - [x] Doubles a bound until the element there exceeds the target
   - [ ] Reverses the array
   - [ ] Counts the elements
   > It brackets the target's position.
2. What is the time complexity in terms of the target's position i?
   - [ ] O(i)
   - [x] O(log i)
   - [ ] O(i squared)
   - [ ] O(1)
   > Both phases take about log i steps.
3. When is it better than plain binary search?
   - [ ] When the data is unsorted
   - [x] When the length is unknown or the target is near the start
   - [ ] When there are no duplicates
   - [ ] When the array is tiny
   > The doubling does not need the length.
4. Where does the binary search phase start?
   - [ ] At index 0
   - [x] At half the final bound
   - [ ] At the last index
   - [ ] At a random index
   > The element at half the bound was already known to be at most the target.
