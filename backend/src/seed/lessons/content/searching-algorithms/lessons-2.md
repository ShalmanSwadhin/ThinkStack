# Search in Rotated Arrays
kind: algorithm
time: O(log n) for distinct elements, because every step discards half of the range; arrays with many duplicates can force O(n) in the worst case.
space: O(1) extra space for the iterative version.
viz: binary-search

## intro
A rotated sorted array is a sorted array whose front part has been moved to the back, such as 4, 5, 6, 7, 0, 1, 2. It is no longer sorted, yet it is made of two sorted pieces, and a modified binary search can still find any element in logarithmic time. The problem is a staple of interviews because it tests whether you understand why binary search works.

## theory
Structure: a rotation of a sorted array by k places consists of a left run (larger values) followed by a right run (smaller values), both ascending, with a single drop at the rotation point. Example: rotating `[0, 1, 2, 4, 5, 6, 7]` by 4 positions gives `[4, 5, 6, 7, 0, 1, 2]`; the minimum 0 sits at index 4, the rotation point.

Key observation: at any `mid`, at least one of the two halves `[lo, mid]` and `[mid, hi]` is sorted. Compare `a[lo]` with `a[mid]`:

- If `a[lo] <= a[mid]`, the left half is sorted. If the target lies in `[a[lo], a[mid])`, search left (`hi = mid - 1`); otherwise search right (`lo = mid + 1`).
- Otherwise the right half is sorted. If the target lies in `(a[mid], a[hi]]`, search right; otherwise search left.

Each step discards half of the range, so the time is O(log n).

Finding the rotation point (the minimum): while `lo < hi`, compare `a[mid]` with `a[hi]`. If `a[mid] > a[hi]`, the minimum is to the right of mid (`lo = mid + 1`); otherwise it is at mid or to its left (`hi = mid`). After the loop `lo` is the index of the minimum, and the number of rotations. Once the rotation point is known, you can run an ordinary binary search on the correct run, or on the whole array with an index offset `(i + pivot) % n`.

Duplicates: with repeated values such as `[2, 2, 2, 0, 2]`, the comparison `a[lo] <= a[mid]` cannot tell which half is sorted when `a[lo] == a[mid] == a[hi]`. The fix is to shrink the range by one on both ends in that case, which makes the worst case O(n). Whether duplicates are allowed is a question to ask.

Edge cases: an array that is not rotated (rotation point 0), a single element, two elements, a target that is absent, and targets at the rotation boundary.

## explain
1. Ask whether the elements are distinct and whether the array could be unrotated.
2. Compute mid and decide which half is sorted by comparing a[lo] with a[mid].
3. Check whether the target lies within the sorted half's value range.
4. Discard the half that cannot contain the target.
5. For the minimum or rotation count, compare a[mid] with a[hi] instead.
6. Test with the target at each end, at the pivot, absent and with tiny arrays.

## example
In `[4, 5, 6, 7, 0, 1, 2]` the search for 0 returns index 4, for 5 returns index 1 and for the missing 3 returns -1. The rotation point of this array is index 4, of the unrotated array `[1, 2, 3]` it is 0 and of `[2, 1]` it is 1. The JavaScript function finds the rotation point first and then runs a plain binary search on the virtual sorted order using the offset.

## real
Circular buffers that keep sorted data, logs that wrap around and cyclic schedules sometimes store sorted values with a moving start, and the same idea applies when searching in a sorted ring.

## pros
- Keeps the logarithmic time of binary search
- Teaches reasoning about which half is sorted
- Works in constant space

## cons
- Many edge cases and off-by-one choices
- Duplicates can degrade it to linear time
- Easy to write conditions that are subtly wrong

## uses
- Searching rotated sorted arrays
- Finding the minimum or the rotation count
- Searching circular sorted structures
- Practising binary search reasoning for interviews

## mistakes
- Assuming the left half is always the sorted one
- Using a strict inequality when a[lo] can equal a[mid]
- Ignoring duplicates in the specification
- Forgetting that the array may not be rotated at all

## interview
**Q:** How do you search a rotated sorted array in O(log n)?
**A:** At each step find which half is sorted by comparing the left end with the middle, check whether the target lies in that sorted half's range, and keep only the half that can contain it.

**Q:** How do you find the rotation point?
**A:** Binary search comparing the middle element with the last element: if the middle is larger the minimum is to its right, otherwise it is at the middle or to its left. The final index is the position of the minimum.

**Q:** How do duplicates affect the algorithm?
**A:** When the left, middle and right values are equal you cannot tell which half is sorted, so you shrink the range by one element, and the worst case becomes linear.

## summary
A rotated sorted array is two ascending runs. Binary search still works by identifying the sorted half at each step and checking whether the target belongs to it, in O(log n) for distinct values.

## codenote
The Python sample searches directly and finds the rotation point. The JavaScript sample searches using the rotation point as an offset.

## code
### python
```python
def search_rotated(items, target):
    lo, hi = 0, len(items) - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        if items[mid] == target:
            return mid
        if items[lo] <= items[mid]:
            if items[lo] <= target < items[mid]:
                hi = mid - 1
            else:
                lo = mid + 1
        else:
            if items[mid] < target <= items[hi]:
                lo = mid + 1
            else:
                hi = mid - 1
    return -1

def rotation_point(items):
    lo, hi = 0, len(items) - 1
    while lo < hi:
        mid = (lo + hi) // 2
        if items[mid] > items[hi]:
            lo = mid + 1
        else:
            hi = mid
    return lo

rotated = [4, 5, 6, 7, 0, 1, 2]
print(search_rotated(rotated, 0), search_rotated(rotated, 5), search_rotated(rotated, 3))
print(rotation_point(rotated), rotation_point([1, 2, 3]), rotation_point([2, 1]))
```
Output:
```text
4 1 -1
4 0 1
```
### javascript
```javascript
function findRotated(items, target) {
  let lo = 0;
  let hi = items.length - 1;
  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2);
    if (items[mid] > items[hi]) lo = mid + 1;
    else hi = mid;
  }
  const pivot = lo;
  const n = items.length;
  let left = 0;
  let right = n - 1;
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    const value = items[(mid + pivot) % n];
    if (value === target) return (mid + pivot) % n;
    if (value < target) left = mid + 1;
    else right = mid - 1;
  }
  return -1;
}

console.log(findRotated([6, 7, 8, 1, 2, 3, 4, 5], 2), findRotated([6, 7, 8, 1, 2, 3, 4, 5], 9));
```
Output:
```text
4 -1
```

## quiz
1. In a rotated sorted array, what is true at any middle element?
   - [ ] Both halves are unsorted
   - [x] At least one of the two halves is sorted
   - [ ] The left half is always sorted
   - [ ] The right half is always sorted
   > The single drop can be in only one half.
2. How do you find the minimum of a rotated array with distinct values?
   - [ ] Scan it all
   - [x] Binary search comparing the middle with the last element
   - [ ] Sort it
   - [ ] Use the first element
   > If the middle is larger than the last, the minimum is to its right.
3. What do duplicates do to the worst case?
   - [ ] Nothing
   - [x] They can make it linear
   - [ ] They make it constant
   - [ ] They make it logarithmic squared
   > Equal ends hide which half is sorted.
4. What is the rotation point of an unrotated sorted array?
   - [ ] The last index
   - [x] Index 0
   - [ ] The middle
   - [ ] There is none
   > The minimum is at the start.

# Search in 2D Matrices
kind: algorithm
time: O(log m + log n) for a matrix whose rows are sorted and whose row ranges do not overlap, O(m log n) when only each row is sorted, and O(m + n) with the staircase method for row- and column-sorted matrices, for an m by n matrix.
space: O(1) extra space for all the methods.
viz: binary-search

## intro
How you search a matrix depends entirely on what order it has. A matrix sorted in reading order behaves like one long sorted array, a matrix whose rows are individually sorted needs a search per row, and one sorted in both directions has its own shortcut. The first job is always to identify exactly which promise the data makes.

## theory
Variants and their best methods:

- Rows sorted, and each row starts after the previous one ends (fully sorted in reading order): treat the matrix as a flat array of m · n elements and binary search with index conversion `row = k // n`, `col = k % n`, in O(log(m · n)). Alternatively, first binary search the column of row ends to find the candidate row (O(log m)) and then binary search inside that row (O(log n)).
- Each row sorted, rows independent: binary search each row separately, O(m log n); stop at the first hit if one occurrence is enough. If the columns are not sorted nothing better is possible than looking at every row, because any row can contain the target.
- Rows and columns both sorted (rows may overlap in range): the staircase search from the top-right corner removes a row or column per step, O(m + n); it is covered in the sorted-matrix lesson in the matrix module.
- Sorted columns only: transpose the thinking and binary search each column.
- Count how many values are below a threshold, or find the k-th smallest in a row-and-column-sorted matrix: binary search on the value range, counting with the staircase walk in O(m + n) per probe.

Row selection by row ends: with `rows = [row[-1] for row in matrix]`, the candidate row is the first whose last element is at least the target, which `bisect_left(rows, target)` finds. Building the list of row ends costs O(m) per query unless it is cached, so for repeated queries, search the matrix directly by column index instead of building a new list.

Pitfalls:

- Empty matrix or empty rows
- Treating a matrix with only sorted rows as fully sorted
- Flat index conversion using the wrong dimension (rows instead of columns for the divisor)
- Integer overflow in `m * n` in fixed-width languages
- Returning positions as (row, column) consistently

State assumptions explicitly in an interview: "Is each row's first element greater than the last element of the previous row?" changes the answer completely.

## explain
1. Ask or determine which ordering the matrix guarantees.
2. Choose: flat binary search, row selection then binary search, per-row search or the staircase.
3. Implement with the proper index conversion.
4. Handle empty inputs.
5. Return the position in the format required.
6. Test a target in each corner, in the middle, absent and between rows.

## example
In the matrix with rows `[1, 3, 5, 7]`, `[10, 11, 16, 20]` and `[23, 30, 34, 60]`, the row ends are `[7, 20, 60]`. Searching for 3 selects row 0 and finds column 1; searching for 13 selects row 1 but the row does not contain it, so the result is None; searching for 60 finds row 2, column 3. The JavaScript program searches rows that are sorted individually (rows may repeat values across rows) and reports which rows contain the value 4: rows 0 and 1.

## real
Spreadsheets with sorted columns, calendar grids and tile maps indexed by ranges, plus coding interviews, all use these searches.

## pros
- Large savings over scanning every cell
- Reuses binary search in several forms
- Each variant has a simple argument for its cost

## cons
- Easy to apply the wrong method for the actual ordering
- Index conversion mistakes
- Little can be done when only rows are sorted

## uses
- Looking up values in tables ordered by row ranges
- Counting values below a threshold
- Selecting order statistics in a matrix by bisecting on values
- Selecting a row by range and then searching inside it

## mistakes
- Assuming reading-order sortedness when only rows are sorted
- Using the row count instead of the column count in the index conversion
- Crashing on a matrix with no rows or with empty rows
- Rebuilding the row-end list for every query

## interview
**Q:** How would you search a matrix whose rows are sorted and each row begins after the previous row's last element?
**A:** Treat it as a single sorted array of m times n elements and binary search, converting a flat index to a row by integer division by the column count and to a column by the remainder, for O(log(m n)) time.

**Q:** What is the best you can do if only each row is sorted?
**A:** Binary search each row separately for O(m log n), since nothing relates one row to another.

**Q:** Why must you clarify the ordering before writing code?
**A:** Different guarantees allow different algorithms, from logarithmic to linear, and applying the wrong one gives incorrect results or wasted time.

## summary
Identify the ordering first: fully sorted allows one flat binary search, rows-only needs a search per row and row-and-column order allows the staircase. Convert flat indexes with the column count and test the edges.

## codenote
The Python sample chooses a row by its last element and then searches the row. The JavaScript sample searches each independently sorted row.

## code
### python
```python
from bisect import bisect_left

def find_two_step(matrix, target):
    row_ends = [row[-1] for row in matrix]
    r = bisect_left(row_ends, target)
    if r == len(matrix):
        return None
    c = bisect_left(matrix[r], target)
    return (r, c) if matrix[r][c] == target else None

matrix = [[1, 3, 5, 7], [10, 11, 16, 20], [23, 30, 34, 60]]
print(find_two_step(matrix, 3), find_two_step(matrix, 13), find_two_step(matrix, 60))
```
Output:
```text
(0, 1) None (2, 3)
```
### javascript
```javascript
function rowsContaining(matrix, target) {
  const hits = [];
  matrix.forEach((row, index) => {
    let lo = 0;
    let hi = row.length - 1;
    while (lo <= hi) {
      const mid = (lo + hi) >> 1;
      if (row[mid] === target) {
        hits.push(index);
        break;
      }
      if (row[mid] < target) lo = mid + 1;
      else hi = mid - 1;
    }
  });
  return hits;
}

console.log(rowsContaining([[1, 4, 9], [2, 4, 6], [0, 3, 8]], 4));
```
Output:
```text
[ 0, 1 ]
```

## quiz
1. How do you convert a flat index k into a row in a matrix with n columns?
   - [ ] k modulo n
   - [x] k divided by n using integer division
   - [ ] k plus n
   - [ ] k times n
   > The quotient is the row and the remainder is the column.
2. What is the cost of searching a matrix where only each row is sorted, using binary search per row?
   - [ ] O(log n)
   - [x] O(m log n)
   - [ ] O(m plus n)
   - [ ] O(1)
   > Each of the m rows costs log n.
3. Why must the ordering be clarified first?
   - [ ] To lengthen the answer
   - [x] Different ordering guarantees allow very different algorithms
   - [ ] Because matrices are always sorted
   - [ ] To avoid recursion
   > The wrong assumption yields wrong or slow solutions.
4. How can you pick the candidate row quickly in a fully sorted matrix?
   - [ ] Scan every row
   - [x] Binary search the list of last elements of the rows
   - [ ] Sort the rows again
   - [ ] Use the first column only
   > The first row whose last element is at least the target can hold it.

# Lower and Upper Bound
kind: algorithm
time: O(log n) for each bound on a sorted array of n elements, so counting occurrences of a value costs two binary searches, O(log n), instead of O(n).
space: O(1) extra space.
practice: binary-search-position

## intro
Plain binary search answers "is it there?" but real programs also need "where would it go?" and "how many are there?". The lower bound and upper bound are two variations that answer those questions, handle duplicates properly and form the foundation of sorted-collection libraries.

## theory
Definitions on a sorted array `a` for a value x:

- Lower bound: the index of the first element that is not less than x (the first position where x could be inserted while keeping order, before any equal elements). In Python this is `bisect_left`, in C++ `std::lower_bound`.
- Upper bound: the index of the first element that is greater than x (the position after the last equal element). In Python `bisect_right`, in C++ `std::upper_bound`.

Both return a value from 0 to n; the value n means that every element is smaller (for lower bound) or not greater (for upper bound).

Consequences:

- Membership: x is present exactly when `lower_bound(x) < n` and `a[lower_bound(x)] == x`
- Count of x: `upper_bound(x) - lower_bound(x)`
- Range of equal values: the half-open interval `[lower_bound(x), upper_bound(x))`
- Insertion point keeping the array sorted: either bound; lower bound inserts before equal elements, upper bound after them (stability matters for records)
- Number of elements less than x: `lower_bound(x)`; at most x: `upper_bound(x)`; between low and high inclusive: `upper_bound(high) - lower_bound(low)`
- First and last occurrence: `lower_bound(x)` and `upper_bound(x) - 1` (if present)

Implementation (half-open range `[lo, hi)`): initialise `lo = 0` and `hi = n`; while `lo < hi`: `mid = (lo + hi) // 2`; for lower bound, if `a[mid] < x` then `lo = mid + 1` else `hi = mid`; for upper bound, if `a[mid] <= x` then `lo = mid + 1` else `hi = mid`. The loop ends with `lo == hi`, the answer. The half-open convention avoids the off-by-one choices of the classic closed-range version, and the two functions differ only in `<` versus `<=`.

Generalisation: with any monotonic predicate, the bounds find the first index where the predicate becomes true; keys can be extracted by a function (the `key` argument of bisect in newer Python versions).

## explain
1. Decide whether you need the first element not less than x or the first element greater than x.
2. Use half-open bounds, lo = 0 and hi = n.
3. In the loop compare a[mid] with x using strictly less than for lower bound and less than or equal for upper bound.
4. When the loop ends, lo is the answer; check the array bounds before reading a[lo].
5. Combine two calls to count or to get the range of equal elements.
6. Test an empty array, x smaller than all, larger than all, present once and present many times.

## example
For the sorted array `[1, 2, 2, 2, 3, 5, 5, 8]`, `bisect_left(a, 2)` is 1 and `bisect_right(a, 2)` is 4, so there are 3 twos. The value 4 is absent: `bisect_left(a, 4)` is 5, the position where it would be inserted. Searching for 9 gives 8 (the end) and for 0 with the upper bound gives 0. The JavaScript functions implement both bounds with the half-open loop and count the 5s as 2, and report the insertion index 5 for 4.

## real
Sorted maps and sets in standard libraries, range queries in databases (count the rows between two keys), interval scheduling and leaderboard rank lookups use lower and upper bounds.

## pros
- Handles duplicates and absent values uniformly
- Counting occurrences in logarithmic time
- Two functions covering nearly every sorted-array query

## cons
- Easy to confuse lower and upper bound
- Must check the index against the length before reading
- Requires sorted data

## uses
- Counting how many times a value occurs
- Computing where a new record belongs in a sorted collection
- Range queries between two values
- Finding the first and last occurrence of a value

## mistakes
- Using the wrong comparison, less than versus less than or equal, in the loop
- Reading a[lo] when lo equals the length
- Mixing the closed-range and half-open conventions
- Counting occurrences by scanning when two binary searches suffice

## interview
**Q:** What is the difference between lower bound and upper bound?
**A:** Lower bound is the first index whose element is not less than the value, while upper bound is the first index whose element is greater than the value. For equal elements they bracket the run.

**Q:** How do you count the occurrences of a value in a sorted array in O(log n)?
**A:** Compute the upper bound minus the lower bound of the value; the difference is the number of equal elements.

**Q:** Where would you insert a new value that is already present to keep the array stable?
**A:** At the upper bound, after the existing equal elements, so that equal items keep their insertion order; the lower bound would put it before them.

## summary
Lower bound is the first position not less than x and upper bound the first position greater than x. Together they give membership, counts, ranges and insertion points in O(log n), using a half-open binary search where only one comparison differs.

## codenote
The Python sample uses the library functions. The JavaScript sample implements both bounds with the same loop and one different comparison.

## code
### python
```python
from bisect import bisect_left, bisect_right

a = [1, 2, 2, 2, 3, 5, 5, 8]
print(bisect_left(a, 2), bisect_right(a, 2), bisect_right(a, 2) - bisect_left(a, 2))
print(bisect_left(a, 4), bisect_left(a, 9), bisect_right(a, 0))
```
Output:
```text
1 4 3
5 8 0
```
### javascript
```javascript
function bound(items, x, inclusive) {
  let lo = 0;
  let hi = items.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (inclusive ? items[mid] <= x : items[mid] < x) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}

const items = [1, 2, 2, 2, 3, 5, 5, 8];
console.log(bound(items, 5, true) - bound(items, 5, false), bound(items, 4, false));
```
Output:
```text
2 5
```

## quiz
1. What does the lower bound of x return?
   - [ ] The last index of x
   - [x] The first index whose element is not less than x
   - [ ] The first index greater than x
   - [ ] The smallest element
   > It is the leftmost insertion point.
2. How do you count occurrences of x in a sorted array?
   - [ ] Scan the array
   - [x] Upper bound minus lower bound
   - [ ] Lower bound plus upper bound
   - [ ] Binary search once
   > The two bounds bracket the run of equal elements.
3. Which comparison differs between the loops for lower and upper bound?
   - [ ] The assignment to hi
   - [x] Less than for lower bound and less than or equal for upper bound
   - [ ] The initial lo
   - [ ] The midpoint formula
   > That single change moves the boundary past equal elements.
4. What does the lower bound return for a value larger than every element?
   - [ ] -1
   - [ ] 0
   - [x] The length of the array
   - [ ] An error
   > Every element is smaller, so the insertion point is the end.

# Search Space Reduction
kind: algorithm
time: O(log n) when each probe discards half of the remaining candidates; O(m + n) when each probe discards a row or a column of an m by n grid.
space: O(1) extra space for the iterative forms shown.
viz: binary-search

## intro
Every efficient search works the same way underneath: each probe or comparison eliminates part of the remaining possibilities, and the speed of the algorithm is how quickly the candidate set shrinks. Seeing searches this way lets you design new ones for problems that do not look like looking something up in a sorted list.

## theory
The principle: maintain a set of candidates that is guaranteed to contain the answer. A probe tests one element or value and uses the result to discard a large part of the set without examining it. Repeat until one candidate remains.

Typical reductions:

- Halving the range: sorted arrays and any monotonic yes or no condition. About log2 of the number of candidates probes.
- Discarding a row or column: the staircase search in matrices sorted both ways, m + n probes.
- Discarding a third: ternary search on a unimodal function.
- Discarding by direction of the slope: finding a peak by comparing a[mid] with a[mid + 1] and moving toward the larger neighbour
- Eliminating by invariant: two pointers on sorted data discard one end per step
- Bisection on real numbers: shrinking an interval containing a root by evaluating the sign of the function at the midpoint

Examples beyond lookup:

- First bad version: versions are good until some release and bad afterwards; "is version v bad?" is a monotonic question, so about log2 n checks find the first bad version, which is how the bisecting commands of revision-control tools locate the change that introduced a bug
- Guess the number: each answer "higher" or "lower" halves the range
- Find a peak element: any local maximum will do, and following the rising side always leads to one
- Square roots and other inverse functions by bisection

How to design one: state the candidate set, find a question whose answer eliminates a fixed fraction of it, prove that the answer is never in the discarded part (the invariant), and make sure the set strictly shrinks so that the loop ends.

Cost model: the number of probes is the number of times you can shrink the set by the chosen factor, and the total cost is probes times the cost per probe. Reductions by a constant factor give logarithmic time; reductions by a constant amount give linear time.

Common errors: discarding a part that might contain the answer, not shrinking the range when the midpoint equals an end, and probing in a way that depends on data that is not actually monotonic.

## explain
1. List what the answer could be: positions, values or candidates.
2. Find a cheap test whose result lets you eliminate a large fraction of the possibilities.
3. Check the invariant: the answer remains in the kept part under both outcomes of the test.
4. Choose the update so the range always strictly shrinks.
5. Count how many tests are needed to reach a single candidate.
6. Verify against a brute-force search on small inputs.

## example
The Python function `first_bad` looks for the first bad version among 1,000, where every version from 617 on is bad. It calls the check only 10 times, as many as the halvings needed, and returns 617. The peak finder compares each middle element with its right neighbour and walks uphill, returning index 2 for `[1, 3, 5, 4, 2]` and index 5 for `[1, 2, 1, 3, 5, 6, 4]`, a different valid peak than a scan would report first. The JavaScript program finds a peak in the second array the same way.

## real
Bug hunting with bisect tools in version control, calibration of instruments, game guessing and root finding in numerical libraries all use search space reduction.

## pros
- A general method for designing searches
- Logarithmic cost when a constant fraction is discarded
- Works on abstract answer spaces, not only on arrays

## cons
- Requires a test with a monotonic or directional structure
- Easy to break the invariant
- Can loop forever if the range does not shrink

## uses
- Finding the first failing version or commit
- Finding peaks and thresholds
- Guessing games and calibration
- Root finding by bisection

## mistakes
- Discarding a range that could still hold the answer
- Using a test that is not monotonic
- Not guaranteeing progress when the midpoint equals an end
- Counting the cost of the test as constant when it is not

## interview
**Q:** How does a bisecting tool find the change that introduced a bug?
**A:** It treats the history as good commits followed by bad ones, tests the middle commit, and discards half the range based on the result, so it finds the first bad commit in about log base 2 of the number of commits tests.

**Q:** How can you find a peak element without scanning the array?
**A:** Compare the middle element with its right neighbour: if the neighbour is larger, a peak lies to the right; otherwise a peak lies at the middle or to the left. Repeat on that half.

**Q:** What property must a search test have to allow halving?
**A:** Its result must tell you which part of the candidate set can be discarded for certain, typically because the answers form a monotonic sequence of no and yes.

## summary
Fast searching is shrinking the candidate set by a constant fraction per probe. Define the candidates, find a test whose outcome eliminates a large part safely, preserve the invariant and guarantee progress.

## codenote
The Python sample finds the first bad version and peaks. The JavaScript sample finds a peak.

## code
### python
```python
def first_bad(n, is_bad):
    lo, hi, calls = 1, n, 0
    while lo < hi:
        mid = (lo + hi) // 2
        calls += 1
        if is_bad(mid):
            hi = mid
        else:
            lo = mid + 1
    return lo, calls

print(first_bad(1000, lambda version: version >= 617))

def find_peak(values):
    lo, hi = 0, len(values) - 1
    while lo < hi:
        mid = (lo + hi) // 2
        if values[mid] < values[mid + 1]:
            lo = mid + 1
        else:
            hi = mid
    return lo

print(find_peak([1, 3, 5, 4, 2]), find_peak([1, 2, 1, 3, 5, 6, 4]))
```
Output:
```text
(617, 10)
2 5
```
### javascript
```javascript
function findPeak(values) {
  let lo = 0;
  let hi = values.length - 1;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (values[mid] < values[mid + 1]) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}

const heights = [3, 4, 6, 9, 7, 2, 1];
console.log(findPeak(heights), heights[findPeak(heights)]);
```
Output:
```text
3 9
```

## quiz
1. How many checks does it take to find the first bad version among 1,000 versions?
   - [ ] About 1,000
   - [ ] About 500
   - [x] About 10
   - [ ] Exactly 1
   > Each check halves the range, and log base 2 of 1000 is about 10.
2. Which neighbour comparison moves a peak search?
   - [ ] Compare the first and last elements
   - [x] Compare the middle with its right neighbour and move toward the larger side
   - [ ] Compare random elements
   - [ ] Compare the sums
   > A rising slope guarantees a peak ahead.
3. What does the invariant of a search say?
   - [ ] The array is sorted
   - [x] The answer is always within the remaining candidates
   - [ ] The loop runs n times
   - [ ] The probes are random
   > Discarding is only safe if the answer is never in the discarded part.
4. What is the cost of a search that discards a constant amount per probe?
   - [ ] Logarithmic
   - [x] Linear
   - [ ] Constant
   - [ ] Exponential
   > Only a fixed number of candidates disappear at each step.

# Searching Interview Patterns
kind: algorithm
time: O(log n) for the binary search family on sorted data or a monotonic answer, O(n) for linear and hash-based scans, and O(n log n) when sorting is needed first.
space: O(1) for the binary search patterns and two pointers, and O(n) for hash-based lookups.
viz: binary-search

## intro
Searching problems in interviews come in a handful of recognisable shapes. Naming the shape quickly, and knowing the one trick that each shape needs, is more valuable than memorising solutions. This lesson is a field guide: the clue in the statement, the pattern it points to and the pitfall to watch for.

## theory
The patterns, with the signal in the problem statement:

- Plain binary search: "sorted array", "find index or insert position". Pitfalls: bounds and duplicates.
- Lower and upper bound: "first or last occurrence", "count occurrences", "insert position". Use the half-open versions.
- Rotated or bitonic arrays: "sorted but rotated", "mountain array". Decide which half is sorted, or which side of the peak you are on.
- Binary search on the answer: "minimise the maximum", "smallest capacity or speed such that", "largest distance such that". Define a monotonic feasibility check.
- Binary search on a real range: "square root", "precision 1e-6". Fixed number of iterations.
- Matrix search: "sorted matrix". Flat binary search, row selection or staircase, depending on ordering.
- Unknown size or infinite sequence: "array reader" or "stream". Exponential probing then binary search.
- Two pointers: "sorted array, pair with sum", "remove duplicates in place". Move the end that improves the sum.
- Hash lookup: "unsorted, find pair or duplicate". O(n) time with O(n) space.
- Sentinel and early exit: "first element satisfying a condition", linear scan.
- Peak finding and local extremes: compare with the neighbour and move uphill.

Process for an interview:

- Clarify: sorted or not, duplicates, size limits, what to return when absent
- Start from the brute force and state its cost
- Identify what structure can be exploited: order, monotonicity, symmetry
- Choose the pattern, define the invariant and the exact loop condition
- Test on tiny cases, including empty, single element, all equal, target at the ends and absent

A validation habit: compare your fast function against a brute-force one on many random small inputs. The Python sample does exactly this for lower-bound lookup and checks 200 random cases against `list.index`, a technique that catches boundary bugs quickly.

Complexity talking points: binary search is O(log n) per query, so for q queries on sorted data the total is O(q log n) after an O(n log n) sort; hash tables are O(1) average per query but need O(n) memory; linear scans need no preparation.

## explain
1. Read the statement for the clue: sorted, monotonic, rotated, unknown length, matrix, pair.
2. Map the clue to a pattern from the list.
3. Write the brute force in a sentence and state its cost.
4. Define the invariant and loop condition of the chosen pattern.
5. Implement, then test on tiny and degenerate inputs.
6. Cross-check against the brute force on random data, and state the final complexity.

## example
The Python program fixes a random seed and compares 200 binary searches (built on `bisect_left`) against the plain `list.index` on random sorted arrays of up to 20 numbers, including empty arrays and absent targets; the printed result is True because all of them agree. The JavaScript program prints a small table that maps statement clues to patterns.

## real
Interview coaches and competitive programmers keep a mental index like this one, and teams use the same habit of cross-checking a clever implementation against a simple one when testing critical lookup code.

## pros
- Faster recognition of what a problem is asking
- A consistent process reduces mistakes
- Cross-checking with brute force finds boundary bugs

## cons
- Real problems mix patterns and disguise their clues
- Memorising patterns without understanding invariants fails on variations
- Randomised cross-checks cannot prove correctness

## uses
- Preparing for coding interviews
- Choosing between binary search, hashing and two pointers
- Reviewing search code for boundary errors
- Writing randomised tests for lookup functions

## mistakes
- Using binary search before checking that the data is sorted or monotonic
- Starting to code without writing down the naive solution first
- Mishandling duplicates and absent targets
- Not testing empty and single-element inputs

## interview
**Q:** How do you decide between a hash map and binary search for lookups?
**A:** If the data is unsorted and you can afford O(n) memory, a hash map gives O(1) average lookups. If the data is already sorted or memory is tight, binary search gives O(log n) lookups with no extra memory.

**Q:** What clues in a problem statement suggest binary search on the answer?
**A:** Phrases such as the minimum possible maximum, the smallest value that satisfies a condition, or the largest value that still works, especially when checking one candidate is easy and feasibility is monotonic.

**Q:** How can you test a binary search implementation thoroughly?
**A:** Compare it against a linear scan on many random small arrays, including empty arrays, duplicates, targets below and above all elements, and absent targets between elements.

## summary
Recognise the shape of the search problem, pick the matching pattern, define the invariant, test the degenerate cases and cross-check with a brute-force version. State complexity for both the preparation and each query.

## codenote
The Python sample cross-checks a lookup against a linear scan on random data. The JavaScript sample prints the clue to pattern table.

## code
### python
```python
import random
from bisect import bisect_left

random.seed(7)
all_agree = True
for _ in range(200):
    items = sorted(random.sample(range(100), random.randint(0, 20)))
    target = random.randint(0, 99)
    expected = items.index(target) if target in items else -1
    position = bisect_left(items, target)
    found = position if position < len(items) and items[position] == target else -1
    all_agree = all_agree and found == expected

print(all_agree)
```
Output:
```text
True
```
### javascript
```javascript
const clues = [
  ["sorted array, find index", "binary search"],
  ["first or last occurrence", "lower and upper bound"],
  ["sorted but rotated", "which half is sorted"],
  ["minimise the maximum", "binary search on the answer"],
  ["unknown length", "exponential probing"],
  ["unsorted, find pair", "hash lookup"],
];

for (const [clue, pattern] of clues) console.log(clue + " -> " + pattern);
```
Output:
```text
sorted array, find index -> binary search
first or last occurrence -> lower and upper bound
sorted but rotated -> which half is sorted
minimise the maximum -> binary search on the answer
unknown length -> exponential probing
unsorted, find pair -> hash lookup
```

## quiz
1. Which phrase suggests binary search on the answer?
   - [ ] Sort the list
   - [x] Find the smallest capacity such that all packages ship in D days
   - [ ] Reverse the string
   - [ ] Count the vowels
   > A monotonic feasibility check over a numeric range is the signature.
2. What is a good way to test a binary search implementation?
   - [ ] Run it once on a typical input
   - [x] Compare it with a linear scan on many random small arrays
   - [ ] Remove the edge cases
   - [ ] Only test large arrays
   > Random cross-checks catch boundary errors.
3. When is a hash map preferable to binary search?
   - [ ] When memory is extremely limited
   - [x] When the data is unsorted and extra O(n) memory is acceptable
   - [ ] When the data is sorted and tiny
   - [ ] Never
   > It gives O(1) average lookups without sorting.
4. What should you state before optimising in an interview?
   - [ ] Nothing
   - [x] The brute-force approach and its cost
   - [ ] The final answer only
   - [ ] The programming language version
   > The baseline shows what the optimisation improves.

# Search in Infinite Arrays
kind: algorithm
time: O(log p) where p is the position of the target (or the first element not smaller than it): about log p probes to find an upper bound and another log p to binary search inside it.
space: O(1) extra space.
viz: exponential-search

## intro
What if you must search a sorted sequence whose length you do not know, or that has no end at all, such as a stream of increasing readings or a function evaluated at each integer? You cannot start with the middle if there is no end. The trick is to find an upper bound by doubling and then use ordinary binary search.

## theory
The setting: elements are sorted, accessed through a function `get(i)` that returns the i-th element. Out-of-range reads either return a very large sentinel value (as in some interview formulations), raise an error, or do not occur because the sequence really is unbounded.

Algorithm:

- Start with `bound = 1`. While `get(bound) < target`, double the bound. This takes about log2(p) probes where p is the index of the target.
- The target, if present, lies between `bound / 2` (whose value was smaller than the target) and `bound`
- Run binary search on `[bound / 2, bound]`, which takes about log2(p) more probes

Total probes about `2 log2 p`, so O(log p). The cost depends on where the target is, not on the (unknown) size of the sequence, which is exactly what makes the method work with infinite data.

Handling the end: if reading beyond the end raises an exception or returns a sentinel, treat the sentinel as larger than every possible target so that the doubling stops, and make sure binary search compares correctly with it. With a real error, catch it and treat it as "too large".

Related problems:

- Find the first x for which a monotonic condition becomes true when the upper limit is unknown: double x until the condition holds, then binary search below
- Find the smallest n such that f(n) exceeds a value for an increasing function f, such as the first triangular number above a threshold
- Searching a sorted file or a remote sorted store whose size is unknown
- The galloping step in merge algorithms

Edge cases: a target smaller than the first element, equal to the first element (return index 0), a bound that jumps far beyond the end, and probing index 0 for an empty sequence. Count the probes if the access is expensive (a network call): the doubling phase wastes up to about half of its probes beyond the target range, but only logarithmically many.

## explain
1. Check the first element in case it matches or is already larger than the target.
2. Double the bound until the element at the bound is at least the target (or the sentinel appears).
3. Define the range from half the bound to the bound.
4. Run a standard binary search in that range, treating reads past the end as too large.
5. Return the index or -1.
6. Count probes and compare with 2 times the logarithm of the target's position.

## example
A reader object wraps the sorted list `0, 3, 6, ..., 2997` and returns a huge sentinel for indexes past the end, counting its calls. Searching for 777 doubles the bound up to 512 and binary searches between 256 and 512, finding index 259 after 16 reads. Searching for the absent value 778 needs 18 reads and returns -1. The JavaScript program searches the infinite increasing sequence of squares for 144: the doubling phase reads indexes 1, 2, 4, 8 and 16, the binary phase reads index 12, and the answer 12 is found after 6 reads.

## real
Streaming systems that must locate a timestamp in a growing log, search engines scanning inverted lists whose length varies, and remote services with paged sorted data use doubling probes before binary search.

## pros
- Works without knowing the length
- Cost depends on the target's position, not the sequence size
- Reuses binary search

## cons
- Needs a sorted, monotonic sequence
- Reads beyond the target range in the doubling phase
- Needs a safe way to read past the end

## uses
- Searching unbounded or streaming sorted data
- Finding thresholds of increasing functions with unknown bounds
- Locating positions in remote paged data
- Galloping in merges

## mistakes
- Starting the binary phase at index 0 instead of half the bound
- Not handling reads past the end
- Trying to bracket the target in a sequence that is not in ascending order
- Forgetting that the first element may already exceed the target

## interview
**Q:** How do you binary search a sorted array of unknown length?
**A:** Double an index bound until the element there is at least the target or reads past the end, then binary search between half the bound and the bound.

**Q:** How many probes does searching for the element at position p take?
**A:** About 2 log base 2 of p: roughly log p doublings to find the bound and another log p steps of binary search inside it.

**Q:** How should reads past the end of the data be treated?
**A:** As a value larger than any possible target, such as a sentinel or an exception handled as too large, so that the doubling stops and binary search moves left.

## summary
For sorted data of unknown or infinite length, double a bound until it passes the target, then binary search the last interval. The cost is O(log p) probes, independent of the total size.

## codenote
The Python sample counts the reads of a reader that returns a sentinel past the end. The JavaScript sample searches an unbounded sequence of squares.

## code
### python
```python
class Reader:
    def __init__(self, data):
        self.data = data
        self.calls = 0

    def get(self, i):
        self.calls += 1
        return self.data[i] if i < len(self.data) else 2 ** 31 - 1

def search_infinite(reader, target):
    bound = 1
    while reader.get(bound) < target:
        bound *= 2
    lo, hi = bound // 2, bound
    while lo <= hi:
        mid = (lo + hi) // 2
        value = reader.get(mid)
        if value == target:
            return mid
        if value < target:
            lo = mid + 1
        else:
            hi = mid - 1
    return -1

data = list(range(0, 3000, 3))
first = Reader(data)
print(search_infinite(first, 777), first.calls)
second = Reader(data)
print(search_infinite(second, 778), second.calls)
```
Output:
```text
259 16
-1 18
```
### javascript
```javascript
let reads = 0;
const square = (i) => {
  reads++;
  return i * i;
};

function searchSquares(target) {
  let bound = 1;
  while (square(bound) < target) bound *= 2;
  let lo = bound >> 1;
  let hi = bound;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    const value = square(mid);
    if (value === target) return mid;
    if (value < target) lo = mid + 1;
    else hi = mid - 1;
  }
  return -1;
}

console.log(searchSquares(144), reads);
```
Output:
```text
12 6
```

## quiz
1. How do you find a first upper bound in an unbounded sorted sequence?
   - [ ] Scan from the start
   - [x] Double an index until its value is at least the target
   - [ ] Pick a random index
   - [ ] Sort the sequence
   > Doubling brackets the target in logarithmically many probes.
2. In the second phase of an unbounded search, where does the range begin?
   - [ ] At index 0
   - [x] At half the final bound
   - [ ] At the last index
   - [ ] At index 1 always
   > The element at half the bound was smaller than the target.
3. What is the cost in terms of the target's position p?
   - [ ] O(p)
   - [x] O(log p)
   - [ ] O(p squared)
   - [ ] O(1)
   > Both phases take about log p probes.
4. How should reads beyond the end be treated?
   - [ ] As zero
   - [x] As larger than any target
   - [ ] As errors that stop the program
   - [ ] As negative values
   > That makes the doubling stop and binary search move left.
