# Lower Bound Implementation
kind: algorithm
time: O(log n) comparisons for a sorted sequence of n elements, because the candidate range halves at every step; with a key function each comparison costs the time of one key evaluation.
space: O(1) extra space for the loop version.
practice: binary-search-position

## intro
Everyone has seen the library function; writing the lower bound yourself, correctly, is a classic test of how well you understand binary search. The trick is to stop thinking about "finding a value" and to think instead about finding the first position where a condition becomes true. With that view the loop is short, uniform and almost impossible to get wrong.

## theory
Specification: for a sorted sequence `a` and a value x, `lower_bound(a, x)` returns the smallest index i in the range 0 to n such that `a[i] >= x`, or n if every element is smaller. It is the position where x would be inserted to keep the sequence sorted, before any equal elements.

The predicate view: define `P(i)` as `a[i] >= x`. In a sorted array P is false for a while and then true forever: `F F F T T T`. The lower bound is the index of the first T, or n if there is none. This turns the task into a general routine, often called partition point or `first_true(lo, hi, pred)`:

- Keep a half-open range `[lo, hi)` that is guaranteed to contain the answer; start with `lo = 0` and `hi = n`
- While `lo < hi`: let `mid = lo + (hi − lo) // 2`. If `P(mid)` is true, the answer is at mid or to its left, so `hi = mid`; otherwise the answer is to the right of mid, so `lo = mid + 1`
- When the loop ends, `lo == hi` is the answer

Invariant: every index below `lo` has P false, and every index at or above `hi` has P true. Initially both are vacuously true. Each step preserves it and shrinks the range, and at the end the two bounds meet at the boundary.

Why the half-open style: it needs no special cases for empty arrays, never produces the off-by-one of the closed `[lo, hi]` version, and the return value is directly an insertion position. The midpoint rounds down, which is safe here because `P(mid)` true moves `hi` to mid (a strict decrease, as mid is less than hi) and false moves `lo` to `mid + 1`.

Generalisations from one routine:

- Lower bound: `first_true(0, n, lambda i: a[i] >= x)`
- Upper bound: `first_true(0, n, lambda i: a[i] > x)`
- By key: `key(a[i]) >= x` for sorting records by one field, as with people sorted by age (the first person with age at least 30 is at index 1)
- With a comparator: any strict weak ordering
- On numbers and answers: any monotone predicate over integers, even when there is no array

Common bugs: using `mid = (lo + hi) // 2` with `lo = mid` (infinite loop), writing `hi = n − 1` with a half-open loop, comparing with the wrong inequality, and forgetting to check `lo < n` before reading `a[lo]`.

Testing: compare against the library on many random sorted arrays, including empty arrays, duplicates and values below and above all elements. The Python test below uses a seeded generator and 300 random cases and finds the two functions agree on every one.

Language equivalents: `bisect_left` in Python (with an optional key argument from version 3.10), `std::lower_bound` in C++, `Arrays.binarySearch` for exact matches only in Java (so write the loop for bounds), and `partitionPoint` style helpers in newer libraries.

## explain
1. Decide the predicate: a condition that is false up to some index and true from then on.
2. Initialise lo to 0 and hi to the length, as a half-open range.
3. While lo is less than hi, compute mid, test the predicate and set hi to mid or lo to mid plus one.
4. Return lo, which is the first index where the predicate is true.
5. Check bounds before using the returned index to read an element.
6. Test against the library on random data and on empty arrays.

## example
The Python `first_true` routine implements the half-open search once, and `lower_bound` is a one-line use of it. A seeded random test of 300 arrays confirms that it matches `bisect_left` every time, which prints True. Applied to the records `(Ann, 22)`, `(Bob, 30)`, `(Cid, 30)` and `(Dee, 41)` with the age as the key, the lower bound of 30 is index 1. The JavaScript version searches an array of objects sorted by price and reports the index of the first product that costs at least 20.

## real
Sorted maps, range queries in databases, schedule lookups and event timelines are built on this routine, and writing it correctly is a common interview question.

## pros
- One uniform loop covers lower bound, upper bound and key-based search
- Half-open ranges avoid off-by-one cases
- The invariant makes correctness easy to argue

## cons
- Easy to mix up with the closed-range version
- Needs sorted data or a monotone predicate
- The returned index may equal the length

## uses
- Finding insertion points in sorted data
- Searching records by a key field
- Implementing counting and range queries
- Binary searching any monotone condition

## mistakes
- Setting lo to mid in the false branch
- Initialising hi to the last index with a half-open loop
- Reading the element at the result without checking against the length
- Testing only on small hand-made inputs

## interview
**Q:** How do you implement lower bound with a half-open range?
**A:** Set lo to 0 and hi to n; while lo is less than hi take mid, and if the element at mid is at least the target set hi to mid, otherwise set lo to mid plus one. The answer is lo.

**Q:** What invariant makes the loop correct?
**A:** All indexes below lo fail the condition and all indexes at or above hi satisfy it, so when lo and hi meet they sit at the first index that satisfies it.

**Q:** How do you adapt the routine to search records by a field?
**A:** Apply the key function to the element at mid inside the predicate, so the comparison uses the field while the array stays sorted by that field.

## summary
Lower bound is the first index where a monotone predicate becomes true. Search a half-open range, move hi to mid when it holds and lo to mid plus one when it does not, and test against the library on random data.

## codenote
The Python sample implements the predicate search, tests it against bisect and uses a key. The JavaScript sample searches objects by price.

## code
### python
```python
import random
from bisect import bisect_left

def first_true(lo, hi, predicate):
    while lo < hi:
        mid = (lo + hi) // 2
        if predicate(mid):
            hi = mid
        else:
            lo = mid + 1
    return lo

def lower_bound(items, x, key=lambda v: v):
    return first_true(0, len(items), lambda i: key(items[i]) >= x)

rng = random.Random(11)
agree = True
for _ in range(300):
    items = sorted(rng.choices(range(20), k=rng.randint(0, 15)))
    x = rng.randint(-1, 21)
    agree = agree and lower_bound(items, x) == bisect_left(items, x)
print(agree)

people = [("Ann", 22), ("Bob", 30), ("Cid", 30), ("Dee", 41)]
print(lower_bound(people, 30, key=lambda person: person[1]))
```
Output:
```text
True
1
```
### javascript
```javascript
function lowerBound(items, predicate) {
  let lo = 0;
  let hi = items.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (predicate(items[mid])) hi = mid;
    else lo = mid + 1;
  }
  return lo;
}

const products = [{ name: "pen", price: 3 }, { name: "book", price: 15 }, { name: "lamp", price: 25 }, { name: "desk", price: 90 }];
const index = lowerBound(products, (product) => product.price >= 20);
console.log(index, products[index].name);
```
Output:
```text
2 lamp
```

## quiz
1. What does lower_bound return?
   - [ ] The last index of x
   - [x] The first index whose element is not less than x
   - [ ] The number of elements equal to x
   - [ ] The middle index
   > It is the leftmost insertion point.
2. What is the loop invariant?
   - [ ] The array is reversed
   - [x] Indexes below lo fail the condition and indexes at or above hi satisfy it
   - [ ] lo equals hi always
   - [ ] mid is constant
   > The boundary stays between lo and hi.
3. What happens if you set lo to mid in the false branch?
   - [ ] Nothing
   - [x] The loop may never terminate
   - [ ] The result becomes the upper bound
   - [ ] The array is sorted
   > Mid can equal lo, so the range does not shrink.
4. What value does the routine return when every element is smaller than x?
   - [ ] -1
   - [ ] 0
   - [x] The length of the array
   - [ ] None
   > The predicate is never true, so the boundary is at the end.

# Upper Bound Implementation
kind: algorithm
time: O(log n) comparisons for a sorted sequence of n elements; a count of equal elements costs two such searches.
space: O(1) extra space.
practice: binary-search-position

## intro
The upper bound is the lower bound's partner: it points just past the last element that is at most x. With the two together you can count how many times a value occurs, find the neighbours of a value that is not present and answer range queries on sorted data. This lesson implements it and shows the small family of queries that follow.

## theory
Specification: `upper_bound(a, x)` returns the smallest index i in 0 to n with `a[i] > x`, or n if there is none. Equivalently, the number of elements that are less than or equal to x.

Implementation with the predicate method: use the same half-open routine as for the lower bound, but with the strict condition `a[i] > x` as the predicate. The two functions differ by a single character, `>=` versus `>`.

Queries built from the two bounds on a sorted array:

- Count of x: `upper_bound(x) − lower_bound(x)`; for `[1, 3, 3, 7, 9]` the number of 3's is 2 and, with the bounds on 3 and 7, the number of elements from 3 up to 7 inclusive is `upper_bound(7) − lower_bound(3) = 5 − 1 = 4`... in the example array `[1, 3, 3, 7, 9]` this difference is 3 for the elements `3, 3, 7`, which the code computes as `upper_bound(a, 7) − lower_bound(a, 3)`.
- Membership: x is present if `lower_bound(x) < n` and the element there equals x
- Floor of x, the largest element not greater than x: `a[upper_bound(x) − 1]` when `upper_bound(x) > 0`; for x = 5 in `[1, 3, 3, 7, 9]` the floor is 3, and for x = 0 there is none
- Ceiling of x, the smallest element not less than x: `a[lower_bound(x)]` when that index is below n; the ceiling of 5 is 7 and the ceiling of 10 does not exist
- Predecessor and successor, strictly less than and strictly greater than, are `a[lower_bound(x) − 1]` and `a[upper_bound(x)]`
- Closest value to x: compare the floor and the ceiling
- Rank of x: the number of elements below it is `lower_bound(x)`, and the number at most x is `upper_bound(x)`

Choosing which bound to use for insertion: inserting at the upper bound places the new element after existing equal ones, which keeps insertion order for equal keys (stable); inserting at the lower bound places it before them.

Range counting: the number of elements in a closed range `[lo, hi]` is `upper_bound(hi) − lower_bound(lo)`; in a half-open range `[lo, hi)` it is `lower_bound(hi) − lower_bound(lo)`. These are the building blocks of interval queries and of counting problems in contests.

Relation to the real numbers: on floating-point data, equality comparisons are fragile, so upper and lower bounds with a tolerance or on integer-converted keys are safer.

Pitfalls: confusing which bound is which, forgetting the boundary cases when the result is 0 or n before indexing, and applying the functions to data that is not sorted by the same key.

## explain
1. Use the same predicate routine as for the lower bound with the strict comparison.
2. Compute the lower and upper bounds when you need counts or ranges.
3. For floor and ceiling, check the index against 0 and the length before reading an element.
4. For insertion, choose the bound that gives the order of equal elements you want.
5. Remember that both functions need the sequence sorted by the same key.
6. Test values below all elements, above all, equal to the first and last and present many times.

## example
For the sorted array `[1, 3, 3, 7, 9]` the Python functions give floor 3 and ceiling 7 for the value 5, floor `None` for 0, ceiling `None` for 10, and floor and ceiling 3 for the present value 3. The number of elements from 3 up to 7 inclusive is 3, computed as `upper_bound(7) − lower_bound(3)`. The JavaScript function counts how many prices lie in a closed range using the two bounds.

## real
Time-series databases count events in intervals, schedulers find the next free slot after a given time and autocomplete features find the first dictionary word at or after a prefix.

## pros
- Two small functions give counts, ranges, floors and ceilings
- Same loop as the lower bound
- Logarithmic time for every query

## cons
- Easy to confuse the two bounds
- Requires boundary checks before indexing
- Only valid on data sorted by the queried key

## uses
- Counting occurrences and range sizes
- Finding the nearest smaller or larger value
- Choosing stable insertion positions
- Computing ranks in sorted data

## mistakes
- Using the lower bound where the upper bound is needed and counting one fewer
- Indexing at the result without checking whether it equals the length
- Computing a range count with the wrong pair of bounds
- Applying them to data that is sorted by a different key

## interview
**Q:** How do you find the largest element not greater than x in a sorted array?
**A:** Compute the upper bound of x; if it is greater than zero, the answer is the element just before it, otherwise no such element exists.

**Q:** How do you count the elements in a closed range from lo to hi?
**A:** Subtract the lower bound of lo from the upper bound of hi on the sorted array, both found in O(log n).

**Q:** Which bound gives a stable insertion position for equal elements?
**A:** The upper bound, because the new element goes after all existing equal elements and so keeps the original order among them.

## summary
The upper bound is the first index with an element greater than x. With the lower bound it yields counts, ranges, floors, ceilings and ranks in O(log n), provided the data is sorted by the same key.

## codenote
The Python sample implements both bounds and answers floor, ceiling and range questions. The JavaScript sample counts values in a range.

## code
### python
```python
def first_true(lo, hi, predicate):
    while lo < hi:
        mid = (lo + hi) // 2
        if predicate(mid):
            hi = mid
        else:
            lo = mid + 1
    return lo

def lower_bound(items, x):
    return first_true(0, len(items), lambda i: items[i] >= x)

def upper_bound(items, x):
    return first_true(0, len(items), lambda i: items[i] > x)

def floor_of(items, x):
    index = upper_bound(items, x)
    return items[index - 1] if index else None

def ceiling_of(items, x):
    index = lower_bound(items, x)
    return items[index] if index < len(items) else None

values = [1, 3, 3, 7, 9]
print(floor_of(values, 5), ceiling_of(values, 5), floor_of(values, 0), ceiling_of(values, 10))
print(floor_of(values, 3), ceiling_of(values, 3), upper_bound(values, 7) - lower_bound(values, 3))
```
Output:
```text
3 7 None None
3 3 3
```
### javascript
```javascript
function bound(items, x, strict) {
  let lo = 0;
  let hi = items.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (strict ? items[mid] > x : items[mid] >= x) hi = mid;
    else lo = mid + 1;
  }
  return lo;
}

const prices = [5, 8, 8, 12, 20, 20, 35];
const countBetween = (low, high) => bound(prices, high, true) - bound(prices, low, false);
console.log(countBetween(8, 20), countBetween(21, 34), countBetween(0, 100));
```
Output:
```text
5 0 7
```

## quiz
1. What does upper_bound(x) return?
   - [ ] The first index whose element is at least x
   - [x] The first index whose element is greater than x
   - [ ] The last index equal to x
   - [ ] The count of x
   > It points just past the run of elements equal to x.
2. How do you compute the floor of x?
   - [ ] a[lower_bound(x) + 1]
   - [x] a[upper_bound(x) - 1] when the bound is positive
   - [ ] a[0]
   - [ ] a[n - 1]
   > The element before the first one greater than x is the largest not greater.
3. How many elements lie in the closed range from lo to hi?
   - [ ] lower_bound(hi) minus upper_bound(lo)
   - [x] upper_bound(hi) minus lower_bound(lo)
   - [ ] hi minus lo
   - [ ] lower_bound(lo) plus upper_bound(hi)
   > The two bounds bracket the range inclusively.
4. Which bound keeps equal elements in insertion order when inserting?
   - [ ] Lower bound
   - [x] Upper bound
   - [ ] Neither
   - [ ] Both
   > The new element goes after existing equal ones.

# Binary Search on Functions
kind: algorithm
time: O(log((hi − lo) / ε)) function evaluations to locate a boundary with precision ε on a real interval, and O(log R) for an integer range of size R, each multiplied by the cost of one evaluation.
space: O(1) extra space.
viz: binary-search

## intro
Binary search does not need an array. Any function that moves in one direction, always increasing or always decreasing, has the same sorted structure hidden inside it. Searching on the function finds roots, inverses and thresholds, such as the square root of 2 or the smallest number whose triangular total reaches a million, without ever storing the values.

## theory
Monotone functions: f is non-decreasing on an interval if `x ≤ y` implies `f(x) ≤ f(y)`. For such a function and a target value t, the set of x with `f(x) >= t` is a suffix of the interval, and binary search finds its start: the inverse of f at t.

Integer domain: search over integers in `[lo, hi]` using the predicate `f(mid) >= t`. For example, the smallest n for which the sum `1 + 2 + ... + n = n(n + 1)/2` reaches 1,000,000 is 1,414, because 1,413 gives 998,991 and 1,414 gives 1,000,405. The loop takes about log₂ of the range, roughly 20 steps.

Real domain: the interval is divided into halves repeatedly, keeping the half in which the sign or comparison changes:

- Root finding by bisection: if `f(lo) < 0 < f(hi)` and f is continuous, the root lies between; evaluate the midpoint and keep the half whose endpoints still have opposite signs
- Square root: find x in `[1, 2]` with `x² = 2` by testing `mid² >= 2`
- Inverse functions: solve `x³ + x = 10` on `[0, 10]`, whose solution is exactly 2

Stopping rules for reals:

- A fixed number of iterations is simplest and avoids comparing floating-point values: 50 halvings of an interval of length 1 give a width near 10⁻¹⁵, close to the limit of double precision, and 100 iterations are plenty for any interval
- Or stop when `hi − lo < ε`, with ε chosen for the required precision and not below the spacing of floating-point numbers near the answer (otherwise the loop may never end)
- Use `lo = mid` and `hi = mid` (no ±1) because the domain is continuous

Requirements and pitfalls:

- The function must be monotone on the interval; for functions with several roots, bracket one root
- The bracket must be valid: the answer must lie between lo and hi
- Floating-point error near the root can flip comparisons; the result is accurate to about the precision of the evaluation
- Integer overflow when evaluating f(mid) for large mid; use wide integers or check bounds
- Choose the predicate and the update direction consistently for non-decreasing and non-increasing functions
- Discontinuities and plateaus: bisection still finds a boundary but not necessarily a point where the function equals the target

Complexity comparison: bisection gains one bit of accuracy per evaluation, which is slower than Newton's method near a simple root (quadratic convergence), but it is robust, needs no derivative and always converges for a bracketed continuous function. Hybrid methods such as Brent's method combine both.

Applications: computing roots and inverses in numerical libraries, finding the break-even point of a cost model, determining the largest input that fits a time budget by measuring a cost function, calibrating parameters (for example finding the smallest number of servers that meets a latency target) and many contest problems where the answer is "the smallest x such that something holds".

## explain
1. Identify the monotone function and the target condition.
2. Choose an interval that certainly contains the answer.
3. For integers use the half-open or closed template with `mid` computed safely; for reals iterate a fixed number of times or until the width is below the tolerance.
4. Update the interval according to the predicate at the midpoint.
5. Return the boundary value, rounding for display as needed.
6. Verify by plugging the result back into the function.

## example
The Python bisection for the square root of 2 on `[1, 2]` after 50 halvings gives 1.414214 when rounded to six decimals, and solving `x³ + x = 10` on `[0, 10]` gives 2.0. The JavaScript program searches the integers from 1 to 100,000 for the first n whose triangular number reaches one million and finds 1,414 with a total of 1,000,405.

## real
Numerical libraries use bisection as a safe fallback for root finding, engineers compute inverse functions this way, and performance tools search for the largest workload that meets a latency goal.

## pros
- Needs only function evaluations, no derivatives
- Always converges for a bracketed continuous function
- Logarithmic number of evaluations

## cons
- Linear convergence, slower than Newton's method near a root
- Requires monotonicity and a valid bracket
- Floating-point precision limits the final accuracy

## uses
- Computing roots and inverses of monotone functions
- Finding thresholds in cost and performance models
- Calibrating parameters against a target
- Finding the smallest integer satisfying a monotone condition

## mistakes
- Choosing an interval that does not contain the answer
- Using a tolerance smaller than floating-point resolution so the loop never ends
- Applying it to non-monotone functions
- Overflowing integers when evaluating the function at large inputs

## interview
**Q:** How can binary search find the square root of a number without an array?
**A:** The condition mid times mid at least the number is monotone in mid, so search an interval that contains the root and keep the half where the condition flips; after enough iterations the interval is as small as the required precision.

**Q:** What does bisection require of the function?
**A:** A continuous function with values of opposite sign at the ends of the interval, or a monotone function with a bracketed target value, so that the answer is guaranteed to lie between the bounds.

**Q:** Why stop after a fixed number of iterations for real-valued searches?
**A:** Comparing floating-point numbers with a tiny tolerance can loop forever when the interval cannot shrink further, while a fixed count such as 50 or 100 halvings always terminates and reaches the precision of the type.

## summary
Any monotone function can be binary searched: over integers for thresholds and inverses, over reals for roots with a fixed number of halvings. Bracket the answer, keep the half where the condition flips and verify the result.

## codenote
The Python sample finds a square root and solves an equation by bisection. The JavaScript sample finds an integer threshold.

## code
### python
```python
lo, hi = 1.0, 2.0
for _ in range(50):
    mid = (lo + hi) / 2
    if mid * mid >= 2:
        hi = mid
    else:
        lo = mid
print(round(hi, 6))

lo, hi = 0.0, 10.0
for _ in range(60):
    mid = (lo + hi) / 2
    if mid ** 3 + mid >= 10:
        hi = mid
    else:
        lo = mid
print(round(hi, 6))
```
Output:
```text
1.414214
2.0
```
### javascript
```javascript
const triangular = (n) => (n * (n + 1)) / 2;
let lo = 1;
let hi = 100000;
while (lo < hi) {
  const mid = Math.floor((lo + hi) / 2);
  if (triangular(mid) >= 1000000) hi = mid;
  else lo = mid + 1;
}
console.log(lo, triangular(lo), triangular(lo - 1));
```
Output:
```text
1414 1000405 998991
```

## quiz
1. What does binary search need from a function?
   - [ ] To be linear
   - [x] To be monotone on the search interval
   - [ ] To have integer values only
   - [ ] To be stored in an array
   > A monotone function splits the domain into a no part and a yes part.
2. Why use a fixed number of iterations for real values?
   - [ ] Real numbers cannot be compared
   - [x] It always terminates, unlike a tolerance smaller than floating-point resolution
   - [ ] It is faster than integers
   - [ ] It avoids the bracket
   > The interval cannot shrink forever in floating point.
3. What is the smallest n whose triangular number reaches one million?
   - [ ] 1,000
   - [ ] 1,413
   - [x] 1,414
   - [ ] 2,000
   > 1,414 gives 1,000,405 while 1,413 gives 998,991.
4. How does bisection compare with Newton's method?
   - [ ] It converges faster
   - [x] It converges more slowly but is robust and needs no derivative
   - [ ] It needs a derivative
   - [ ] It works only on integers
   > One bit of accuracy per step against quadratic convergence for Newton.

# Parametric Search
kind: algorithm
time: O(C · log R), where R is the size of the range of candidate answers and C is the cost of the feasibility check; for the examples below C is O(n), giving O(n log R).
space: O(1) extra space beyond the input.
viz: binary-search

## intro
Some questions ask for the best value of a quantity: the largest minimum distance, the smallest maximum load. Optimisation is hard to attack directly, but the decision version, "can we achieve this value?", is often easy to check, and its answers form a monotone yes and no sequence. Parametric search turns the optimisation into a binary search over the decision problem.

## theory
Pattern:

- Define the parameter x whose best value is wanted
- Write `feasible(x)`: a function that decides whether the goal can be met at level x, usually with a greedy scan of the input
- Show monotonicity: if x is feasible then every easier value is feasible too (or the reverse), so the feasible values form a prefix or a suffix of the range
- Binary search the range for the boundary between the feasible and infeasible values; the answer is the boundary

Two orientations:

- Minimise the maximum (smallest feasible x): feasibility is true for large x. Search for the first true: when `feasible(mid)`, move `hi = mid`, otherwise `lo = mid + 1`.
- Maximise the minimum (largest feasible x): feasibility is true for small x. Search for the last true: use `mid = (lo + hi + 1) // 2`, and when `feasible(mid)` set `lo = mid`, otherwise `hi = mid − 1`. The rounding up prevents an endless loop.

Classic problems:

- Aggressive cows (maximise the minimum distance): place c cows in n stalls at given positions so the smallest gap between any two is as large as possible. The check is greedy: sort the stalls, place the first cow at the first stall, and put each next cow at the first stall at least d away; feasibility means at least c cows fit. For stalls 1, 2, 4, 8, 9 and 3 cows the best minimum distance is 3 (cows at 1, 4, 8); for 2 cows it is 8.
- Split array largest sum (minimise the maximum): cut an array into m contiguous parts so that the largest part sum is as small as possible. The check scans the array and starts a new part whenever adding the next element would exceed the limit x; feasibility means at most m parts. For `[7, 2, 5, 10, 8]` and m = 2 the answer is 18 (parts `[7, 2, 5]` and `[10, 8]`).
- Painters and book allocation, which are the same problem under different names
- Minimum time for workers to complete a number of jobs (the JavaScript example): with trip times `[1, 2, 3]` the fastest way to complete 5 trips in total takes 3 time units, because at time t the machines complete the sum of floor(t / time) trips: at t = 3 that is 3 + 1 + 1 = 5.
- Minimising the maximum distance (gas stations), and the smallest feasible speed, capacity or divisor problems in the following lessons

Choosing bounds: the lower bound is the smallest value that could possibly work (such as the largest single element in the split problem, which no part can be smaller than) and the upper bound is a value that certainly works (the total sum). Tight bounds reduce iterations but any valid bounds are correct.

Complexity: the number of iterations is log of the range size and each iteration costs one linear scan, so O(n log R). That is much better than trying every value or every partition, which grows exponentially.

Why it works, intuition: the feasible region is described by a threshold; checking one point tells which side of the threshold you are on, which is the same information a comparison provides in ordinary binary search.

Pitfalls: a feasibility check that is not monotone, greedy checks that are not actually optimal for the decision (the greedy must correctly decide feasibility), off-by-one in the answer for maximise problems, and overflow of the upper bound.

## explain
1. State the optimisation goal and decide minimise-the-maximum or maximise-the-minimum.
2. Write the decision function and check it with a greedy scan.
3. Confirm monotonicity of the decision.
4. Choose a low bound that may fail and a high bound that surely works (or the reverse).
5. Binary search using the matching template and midpoint rounding.
6. Return the boundary and verify it against a brute force for tiny inputs.

## example
The Python function `aggressive` returns 3 for stalls `[1, 2, 4, 8, 9]` with 3 cows and 8 for two cows placed on `[1, 2, 8, 4, 9]`. The function `split_min_largest` returns 18 for `[7, 2, 5, 10, 8]` split into 2 parts. The JavaScript function finds the minimum time for the machines with trip times `[1, 2, 3]` to complete 5 trips, which is 3, and 2 time units when only one trip is needed on a single machine of time 2.

## real
Capacity planning, load balancing, scheduling and VLSI placement problems are often solved by searching on the answer with a feasibility check, and contest problems use it constantly.

## pros
- Turns a hard optimisation into an easy decision check
- Logarithmic number of checks
- Short code once the check is written

## cons
- Requires a monotone decision problem
- The greedy check must be correct
- Midpoint rounding differs between minimise and maximise forms

## uses
- Placing cows, routers or antennas as far apart as possible
- Minimising the largest part when splitting data
- Scheduling and capacity problems
- Finding the minimum time for parallel workers

## mistakes
- Using the minimise template for a maximise problem and looping forever
- Writing a feasibility check that is not monotone
- Choosing a low bound that is already infeasible
- Forgetting to sort the positions before the greedy placement

## interview
**Q:** What is parametric search?
**A:** Solving an optimisation problem by binary searching the value of the objective and using a decision procedure that says whether a given value can be achieved, relying on that decision being monotone.

**Q:** How do you avoid an infinite loop when maximising the minimum?
**A:** Round the midpoint up and set lo to mid when feasible, hi to mid minus one otherwise, so the range always shrinks.

**Q:** What is the complexity of searching the answer with a linear feasibility check?
**A:** O(n log R), where R is the size of the range of candidate answers, since there are log R checks and each scans the input once.

## summary
Parametric search binary searches the answer using a monotone feasibility check: minimise-the-maximum finds the first feasible value and maximise-the-minimum finds the last. The cost is the check times log of the range.

## codenote
The Python sample solves placement and splitting problems. The JavaScript sample finds a minimum completion time.

## code
### python
```python
def aggressive(stalls, cows):
    stalls = sorted(stalls)

    def feasible(distance):
        placed, last = 1, stalls[0]
        for position in stalls[1:]:
            if position - last >= distance:
                placed += 1
                last = position
        return placed >= cows

    lo, hi = 1, stalls[-1] - stalls[0]
    while lo < hi:
        mid = (lo + hi + 1) // 2
        if feasible(mid):
            lo = mid
        else:
            hi = mid - 1
    return lo

print(aggressive([1, 2, 4, 8, 9], 3), aggressive([1, 2, 8, 4, 9], 2))

def split_min_largest(values, parts):
    def needed(limit):
        count, current = 1, 0
        for value in values:
            if current + value > limit:
                count += 1
                current = 0
            current += value
        return count

    lo, hi = max(values), sum(values)
    while lo < hi:
        mid = (lo + hi) // 2
        if needed(mid) <= parts:
            hi = mid
        else:
            lo = mid + 1
    return lo

print(split_min_largest([7, 2, 5, 10, 8], 2))
```
Output:
```text
3 8
18
```
### javascript
```javascript
function minimumTime(times, totalTrips) {
  let lo = 1;
  let hi = Math.min(...times) * totalTrips;
  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2);
    const trips = times.reduce((sum, t) => sum + Math.floor(mid / t), 0);
    if (trips >= totalTrips) hi = mid;
    else lo = mid + 1;
  }
  return lo;
}

console.log(minimumTime([1, 2, 3], 5), minimumTime([2], 1));
```
Output:
```text
3 2
```

## quiz
1. What does parametric search binary search over?
   - [ ] The input array
   - [x] The value of the objective, using a feasibility check
   - [ ] The sorted indexes
   - [ ] The output list
   > The decision problem is monotone in the objective.
2. How is mid computed when maximising the minimum?
   - [ ] (lo + hi) divided by 2 rounded down
   - [x] (lo + hi + 1) divided by 2, rounded up
   - [ ] lo plus 1
   - [ ] hi minus 1
   > Rounding up prevents the range from stalling when lo is set to mid.
3. What is the answer for stalls 1, 2, 4, 8, 9 and 3 cows?
   - [ ] 2
   - [x] 3
   - [ ] 4
   - [ ] 8
   > Cows at 1, 4 and 8 give a minimum gap of 3.
4. What must be true of the feasibility check?
   - [ ] It must be random
   - [x] It must be monotone in the parameter
   - [ ] It must run in constant time
   - [ ] It must sort the input
   > Otherwise the boundary is not unique.

# Koko Eating Bananas Pattern
kind: algorithm
time: O(n log m) for n piles and a largest pile of m bananas, since each of the log m candidate speeds is checked with one pass over the piles.
space: O(1) extra space.

## intro
A monkey has h hours to eat all the bananas in several piles; each hour it picks one pile and eats up to k bananas from it, and a pile that holds fewer than k takes the full hour anyway. What is the slowest speed k that still finishes in time? The problem is the best-known example of binary searching a speed, and its structure repeats in a whole family of problems: smallest divisor, fastest rate, least time.

## theory
Feasibility check: at speed k, a pile of p bananas takes `ceil(p / k)` hours, so the total is `sum(ceil(p / k))`. Speed k is feasible when this total is at most h. Total time never increases as k grows, so feasibility is monotone: slow speeds fail, fast ones succeed. Search for the smallest feasible k.

Ceiling division without floating point: `ceil(p / k) = (p + k − 1) // k`, or in Python `-(-p // k)`. Floating-point division and `math.ceil` can be slightly off for large values and are slower.

Choosing the bounds carefully:

- Upper bound: `max(piles)` always works if h is at least the number of piles, because every pile then takes one hour
- Lower bound: at least `ceil(total / h)`, since the monkey eats at most k per hour and must clear the total in h hours; starting from 1 is correct but needs a few more iterations. For `[3, 6, 7, 11]` with h = 8 the total is 27, so the lower bound is 4, and the answer is exactly 4 there.
- The problem guarantees `h >= len(piles)`; otherwise no speed works

Examples: `[3, 6, 7, 11]` with 8 hours needs speed 4 (hours 1 + 2 + 2 + 3 = 8; at speed 3 it would be 10). `[30, 11, 23, 4, 20]` needs 30 with 5 hours (one pile per hour) and 23 with 6 hours.

The same skeleton solves many problems, differing only in the check and the direction:

- Smallest divisor given a threshold: find the smallest divisor d such that the sum of `ceil(x / d)` over an array is at most t. For `[1, 2, 5, 9]` and t = 6 the answer is 5; for `[44, 22, 33, 11, 1]` and t = 5 it is 44. It is the same as Koko with different names.
- Minimum days to make m bouquets of k adjacent flowers: day d is feasible if scanning the bloom days, counting runs of k flowers with bloom day at most d, yields at least m bouquets. For bloom days `[1, 10, 3, 10, 2]` with 3 bouquets of 1 flower the answer is 3; `[7, 7, 7, 7, 12, 7, 7]` with 2 bouquets of 3 gives 12; and when m times k exceeds the number of flowers the answer is −1.
- Minimum number of days to ship packages, the next lesson, and splitting arrays
- Minimum time to finish tasks with workers of different speeds
- Maximum candies per child, smallest rate that meets a deadline

Recognition: "smallest speed, rate, capacity, divisor or time such that a condition holds", where checking one candidate is a simple scan and larger candidates only make success easier.

Edge cases: a single pile, h equal to the number of piles (speed equals the maximum pile), huge piles that overflow narrow integers, and h smaller than the number of piles (impossible).

## explain
1. Write the cost at a given speed: the sum of ceiling divisions of the piles by the speed.
2. Decide that feasibility means that cost is at most the allowed hours.
3. Set the range from a safe lower bound to the largest pile.
4. Binary search for the smallest feasible speed with the first-true template.
5. Use integer ceiling division.
6. Test equal piles, one pile and h equal to the number of piles.

## example
The Python `koko` function starts the search at the rounded-up average speed. It returns 4 for `[3, 6, 7, 11]` with 8 hours, and 30 and 23 for the second set of piles with 5 and 6 hours. The smallest-divisor variant returns 5 and 44, and the bouquet variant returns 3, 12 and −1 for the three examples. The JavaScript program finds the fastest rate at which a printer must work to produce 100 pages in 10 hours from batches of different sizes, giving 5.

## real
Capacity and rate planning, such as the minimum bandwidth or processing speed that meets a deadline, uses the same search, and the problem appears in interviews under many disguises.

## pros
- A single template solves a whole family of problems
- Only about log of the speed range needs to be tested
- Tight lower bounds reduce iterations

## cons
- Easy to miscompute the ceiling division
- Wrong bounds give wrong or infinite loops
- Needs the monotone cost structure to hold

## uses
- Slowest speed that finishes within a deadline
- Smallest divisor with a sum threshold
- Minimum days for bouquets or similar batches
- Choosing the lowest rate or capacity that meets a goal

## mistakes
- Using floating-point division and rounding errors in the check
- Setting the lower bound to zero and dividing by zero
- Treating a pile smaller than the speed as taking a fraction of an hour
- Returning the last infeasible value instead of the first feasible one

## interview
**Q:** How do you solve the Koko eating bananas problem?
**A:** Binary search the eating speed between a low bound, such as the rounded-up average, and the largest pile; for each candidate compute the hours as the sum of ceiling divisions of the piles and keep the smallest speed whose total is at most the allowed hours.

**Q:** Why is the largest pile a safe upper bound?
**A:** At that speed every pile takes exactly one hour, which is the minimum possible per pile, so if any speed works this one does.

**Q:** Which other problems share this structure?
**A:** Smallest divisor for a threshold, minimum days to make bouquets, least capacity to ship packages and the minimum time for workers to complete jobs.

## summary
Koko is binary search on the smallest speed whose total hours, computed with ceiling division, fit the limit. The same template solves the smallest divisor, bouquets and capacity problems with a different feasibility check.

## codenote
The Python sample implements Koko with tight bounds, a smallest divisor and a bouquet check. The JavaScript sample finds a required rate.

## code
### python
```python
def koko(piles, hours):
    lo, hi = -(-sum(piles) // hours), max(piles)
    while lo < hi:
        mid = (lo + hi) // 2
        if sum(-(-pile // mid) for pile in piles) <= hours:
            hi = mid
        else:
            lo = mid + 1
    return lo

print(koko([3, 6, 7, 11], 8), koko([30, 11, 23, 4, 20], 5), koko([30, 11, 23, 4, 20], 6))

def smallest_divisor(values, threshold):
    lo, hi = 1, max(values)
    while lo < hi:
        mid = (lo + hi) // 2
        if sum(-(-value // mid) for value in values) <= threshold:
            hi = mid
        else:
            lo = mid + 1
    return lo

print(smallest_divisor([1, 2, 5, 9], 6), smallest_divisor([44, 22, 33, 11, 1], 5))

def min_days(bloom, bouquets, size):
    if bouquets * size > len(bloom):
        return -1

    def enough(day):
        made = run = 0
        for ready in bloom:
            if ready <= day:
                run += 1
                if run == size:
                    made += 1
                    run = 0
            else:
                run = 0
        return made >= bouquets

    lo, hi = min(bloom), max(bloom)
    while lo < hi:
        mid = (lo + hi) // 2
        if enough(mid):
            hi = mid
        else:
            lo = mid + 1
    return lo

print(min_days([1, 10, 3, 10, 2], 3, 1), min_days([7, 7, 7, 7, 12, 7, 7], 2, 3), min_days([1, 2], 5, 1))
```
Output:
```text
4 30 23
5 44
3 12 -1
```
### javascript
```javascript
function slowestRate(batches, hours) {
  let lo = 1;
  let hi = Math.max(...batches);
  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2);
    const needed = batches.reduce((sum, batch) => sum + Math.ceil(batch / mid), 0);
    if (needed <= hours) hi = mid;
    else lo = mid + 1;
  }
  return lo;
}

console.log(slowestRate([10, 20, 30, 40], 20));
```
Output:
```text
5
```

## quiz
1. How many hours does a pile of p bananas take at speed k?
   - [ ] p divided by k as a fraction
   - [x] The ceiling of p divided by k
   - [ ] p minus k
   - [ ] k divided by p
   > A partly eaten hour still counts as a whole hour.
2. Why is the largest pile a valid upper bound for the speed?
   - [ ] It is the average
   - [x] At that speed every pile takes one hour, the minimum possible
   - [ ] Larger speeds are invalid
   - [ ] It equals the number of hours
   > No speed can do better than one hour per pile.
3. What is the smallest speed for piles 3, 6, 7, 11 with 8 hours?
   - [ ] 3
   - [x] 4
   - [ ] 5
   - [ ] 6
   > At speed 4 the total is 8 hours, at speed 3 it is 10.
4. What is the integer way to compute the ceiling of p divided by k?
   - [ ] p // k
   - [x] (p + k - 1) // k
   - [ ] p % k
   - [ ] p * k
   > Adding k minus 1 before integer division rounds up.

# Ship Packages Pattern
kind: algorithm
time: O(n log S) for n packages and a total weight S, since each of the log S candidate capacities is checked with one pass over the packages.
space: O(1) extra space.

## intro
Packages must be shipped in the given order, one ship per day with a fixed capacity. What is the smallest capacity that gets everything delivered within D days? Because the packages must stay in order and are loaded greedily, the check is a simple scan, and the capacity is monotone: more capacity never needs more days. It is binary search on the answer with a greedy feasibility test, and it is the same problem as splitting an array into contiguous parts with the smallest possible largest sum.

## theory
Feasibility check for capacity c: scan the weights, adding each to the current day's load; if the load would exceed c, start a new day. Count the days. Capacity c is feasible when the count is at most D. Raising c can only reduce the count, so feasibility is monotone.

Bounds:

- Lower bound: `max(weights)`, because every package must fit on a ship
- Upper bound: `sum(weights)`, because with that capacity everything ships in one day
- Search the smallest feasible capacity with the first-true template

Examples:

- Weights 1 to 10 in 5 days: the answer is 15 (days: 1 2 3 4 5, 6 7, 8, 9, 10, which is 5 days at capacity 15)
- `[3, 2, 2, 4, 1, 4]` in 3 days: 6 (days 3 2, 2 4, 1 4... each at most 6)
- `[1, 2, 3, 1, 1]` in 4 days: 3

Why greedy works for the check: loading as many consecutive packages as fit each day never delays a package that could have shipped earlier, so it minimises the number of days for a fixed capacity. That is why the decision problem is easy even though the optimisation looks like partitioning.

Connections:

- Split array largest sum: identical problem with m parts instead of D days (the previous lesson found 18 for `[7, 2, 5, 10, 8]` and 2 parts)
- Painter's partition and book allocation: the same with different words
- Allocate minimum pages, minimise the maximum of sums of contiguous groups
- Variants where order may be changed (bin packing) are NP-hard, and this method no longer applies, which is why the "contiguous" condition matters

Complexity: O(n) per check and O(log S) checks; for n = 50,000 and total weight 10⁹ that is about 1.5 million operations. Dynamic programming over partitions would cost O(n² · D), and brute force over cut positions is exponential.

Implementation notes:

- The check starts with one day, not zero, and increments when a package does not fit
- Reset the current load to zero at a new day and then add the package (the package that triggered the new day belongs to it)
- Use `lo = max(weights)` so that the check never has to handle a package heavier than the capacity
- Avoid overflow of the sum for large inputs
- If D is greater than or equal to the number of packages, the answer is the maximum weight

Edge cases: one package, one day (the answer is the sum), as many days as packages, and equal weights.

## explain
1. Write the check: scan the weights, closing the day when the next package would overflow.
2. Set the search range from the heaviest package to the total weight.
3. Binary search for the smallest capacity whose day count is at most D.
4. Make sure the package that overflows starts the next day and is counted.
5. Compare with the split array problem to reuse the same code.
6. Test D of one, D equal to the number of packages and equal weights.

## example
The Python function returns 15 for the weights 1 to 10 with 5 days, 6 for `[3, 2, 2, 4, 1, 4]` with 3 days and 3 for `[1, 2, 3, 1, 1]` with 4 days. The JavaScript version solves `[5, 5, 5, 5, 5, 5]` with 3 days (answer 10), and for `[10, 20, 30]` finds 60 with one day and 30 with three days.

## real
Logistics and scheduling tools size vehicles and shifts this way, and print and storage systems allocate sequential items into fixed-capacity batches.

## pros
- Simple greedy check and short code
- Few capacity candidates are tested because the range is halved each time
- Same code solves several differently named problems

## cons
- Only valid when order must be preserved and groups are contiguous
- Off-by-one errors in the day counting
- Bounds must be right

## uses
- Minimum ship capacity for a deadline
- Splitting arrays to minimise the largest group sum
- Painter's partition and book allocation
- Batching sequential jobs into fixed-capacity runs

## mistakes
- Using a lower bound smaller than the heaviest package
- Forgetting to count the package that starts a new day
- Applying it when packages may be reordered
- Starting the day counter at zero

## interview
**Q:** How do you find the least ship capacity to deliver packages in order within D days?
**A:** Binary search the capacity between the heaviest package and the total weight; for each candidate scan the packages greedily, starting a new day when the next package does not fit, and keep the smallest capacity that needs at most D days.

**Q:** Why is the greedy day count correct for a fixed capacity?
**A:** Loading as many consecutive packages as fit never delays any package, so it uses the fewest possible days for that capacity.

**Q:** How is this related to splitting an array to minimise the largest part sum?
**A:** It is the same problem: contiguous groups with a limit on the group sum, searching for the smallest limit that allows at most the given number of groups.

## summary
Shipping packages in order is binary search over capacity between the heaviest package and the total, with a greedy scan that counts days. It is the same pattern as splitting an array to minimise the largest part.

## codenote
The Python sample finds capacities for three inputs. The JavaScript sample solves other inputs with the same template.

## code
### python
```python
def ship_capacity(weights, days):
    def days_needed(capacity):
        used, load = 1, 0
        for weight in weights:
            if load + weight > capacity:
                used += 1
                load = 0
            load += weight
        return used

    lo, hi = max(weights), sum(weights)
    while lo < hi:
        mid = (lo + hi) // 2
        if days_needed(mid) <= days:
            hi = mid
        else:
            lo = mid + 1
    return lo

print(ship_capacity(list(range(1, 11)), 5), ship_capacity([3, 2, 2, 4, 1, 4], 3), ship_capacity([1, 2, 3, 1, 1], 4))
```
Output:
```text
15 6 3
```
### javascript
```javascript
function capacity(weights, days) {
  const daysNeeded = (limit) => {
    let used = 1;
    let load = 0;
    for (const weight of weights) {
      if (load + weight > limit) {
        used++;
        load = 0;
      }
      load += weight;
    }
    return used;
  };

  let lo = Math.max(...weights);
  let hi = weights.reduce((a, b) => a + b, 0);
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (daysNeeded(mid) <= days) hi = mid;
    else lo = mid + 1;
  }
  return lo;
}

console.log(capacity([5, 5, 5, 5, 5, 5], 3), capacity([10, 20, 30], 1), capacity([10, 20, 30], 3));
```
Output:
```text
10 60 30
```

## quiz
1. What is the lower bound for the ship capacity?
   - [ ] 1
   - [x] The weight of the heaviest package
   - [ ] The average weight
   - [ ] The total weight
   > Every package must fit on the ship.
2. What does the check count for a given capacity?
   - [ ] The number of packages
   - [x] The number of days needed with greedy loading in order
   - [ ] The total weight
   - [ ] The number of ships
   > It must be at most the allowed days.
3. Why does greedy loading minimise days for a fixed capacity?
   - [ ] It sorts the packages
   - [x] Taking as many consecutive packages as fit never delays any package
   - [ ] It reorders packages
   - [ ] Capacity does not matter
   > Delaying a package could not reduce the number of days.
4. Which problem is the same pattern?
   - [ ] Reversing a string
   - [x] Splitting an array into contiguous parts with the smallest largest sum
   - [ ] Sorting an array
   - [ ] Counting inversions
   > Both search for the smallest limit allowing at most the given number of groups.
