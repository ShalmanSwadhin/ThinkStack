# Knapsack Variants
kind: algorithm
time: O(n · W) for n items and capacity W in the 0/1, unbounded and subset-sum variants, which is pseudo-polynomial because W is a value, not the length of the input.
space: O(n · W) for the full table, reducible to O(W) with a one-dimensional array updated in the right direction.
viz: knapsack-dp

## intro
The knapsack problem asks how to pick items with weights and values to maximise total value without exceeding a capacity. Its variants differ in how many copies of an item you may take, and each variant changes one detail of the dynamic programming loop. Many other problems, such as partitioning an array into equal sums, reduce to a knapsack.

## theory
State: `best[w]` is the maximum value achievable with capacity w (one-dimensional form), or `t[i][w]` for the first i items (two-dimensional form).

Variants:

- 0/1 knapsack: each item may be used at most once. Recurrence: `t[i][w] = max(t[i − 1][w], t[i − 1][w − weight_i] + value_i)` when the item fits. In the one-dimensional form, loop over the capacity downward from W to the item's weight, so that each item is counted once: the entries you read are still from the previous item.
- Unbounded knapsack: each item may be used any number of times. The same one-dimensional recurrence loops over the capacity upward, so an entry may include the same item again.
- Bounded knapsack: each item has a limited count. Treat it as several copies, or use binary splitting of the count into powers of two to reduce the number of copies.
- Subset sum: values equal weights, and the question is whether a subset reaches exactly the target; the table holds booleans. With the array 1, 5, 11, 5 a subset sums to 11, so the array can be split into two halves of equal sum (11 and 11); with 1, 2, 3, 5 the total is 11, which is odd, so the answer is no.
- Counting subsets with a given sum: add instead of or-ing. For the numbers 1, 1, 2, 3, 5 there are 3 subsets with sum 5 (5, 2 + 3, and 1 + 1 + 3), and for 2, 4, 6 and target 5 there are none.
- Multiple dimensions: two capacities, such as weight and volume, need a two-dimensional capacity index
- Fractional knapsack: solved greedily, not by dynamic programming

Example with items (value, weight) = (60, 10), (100, 20), (120, 30) and capacity 50: the 0/1 optimum is 220 (take the last two items), while the unbounded optimum is 300 (five copies of the first item, since value per weight is 6 for it and no other item beats it).

Why the loop direction matters: in the 0/1 one-dimensional form, iterating the capacity upward would let the update for capacity w read an entry that already includes the current item, effectively allowing reuse, which is unbounded knapsack. Iterating downward reads only entries from before the current item. This single detail separates the two variants and is a favourite interview question.

Complexity: O(n · W) is called pseudo-polynomial, because the running time grows with the numeric value of W, which needs only log W bits to write. The knapsack problem is NP-hard in the strict sense, so no algorithm polynomial in the number of bits is known; for large capacities use branch and bound, meet in the middle (O(2^(n/2))) or approximation schemes that scale values.

Recovering the chosen items: keep the two-dimensional table, then walk backward: if `t[i][w]` differs from `t[i − 1][w]`, item i was taken, and reduce w by its weight.

Applications: budget allocation, cargo loading, cutting stock, choosing features to fit a time box, partition problems and target sum questions (assigning plus or minus signs to reach a target reduces to subset sum).

Edge cases: zero capacity, items heavier than the capacity, zero-weight items (which can cause an infinite loop in the unbounded version if mishandled), and negative values (skip those items).

## explain
1. Decide the variant: each item once, many times, or limited.
2. Define best[w] as the best value for capacity w.
3. For 0/1, loop over items and over capacities downward; for unbounded, loop capacities upward.
4. Update best[w] with the maximum of the old value and the value using the item.
5. Read the answer at best[W], or at the target for subset sum.
6. Reconstruct the chosen items with a two-dimensional table if needed.

## example
The Python functions give 220 for the 0/1 knapsack, 300 for the unbounded one, `True` for splitting `[1, 5, 11, 5]` into equal halves and `False` for `[1, 2, 3, 5]`. The JavaScript function counts the subsets of `[1, 1, 2, 3, 5]` with sum 5, which is 3, and the subsets of `[2, 4, 6]` with sum 5, which is 0.

## real
Cloud schedulers pack jobs onto machines, finance teams choose projects under a budget, and logistics planners load containers, each with a knapsack model.

## pros
- One framework covers many selection problems
- Simple recurrence with a clear table
- Space reduces to one array

## cons
- Pseudo-polynomial time grows with the capacity value
- Loop direction mistakes silently change the variant
- Large capacities need other methods

## uses
- Budget and capacity constrained selection
- Partitioning arrays into equal sums
- Counting subsets that reach a target
- Cutting stock and loading problems

## mistakes
- Looping the capacity upward in the 0/1 version
- Using the item index and capacity in the wrong order of dimensions
- Forgetting that the table size is capacity plus one
- Treating the problem as polynomial when the capacity is huge

## interview
**Q:** What is the difference between the 0/1 and unbounded knapsack loops?
**A:** In the one-dimensional 0/1 form the capacity loop runs downward so each item is used once; in the unbounded form it runs upward so an item can be used repeatedly.

**Q:** How do you check whether an array can be partitioned into two subsets of equal sum?
**A:** If the total is odd the answer is no; otherwise run a subset sum dynamic program to see whether half of the total is reachable.

**Q:** Why is the knapsack dynamic programming solution called pseudo-polynomial?
**A:** Its O(n times W) time depends on the numeric value of the capacity W, which can be exponential in the number of bits used to write it.

## summary
Knapsack variants share one table and differ in loop direction and counting: 0/1 goes downward, unbounded upward, subset sum uses booleans and counting uses sums. The cost O(n · W) is pseudo-polynomial.

## codenote
The Python sample covers 0/1, unbounded and partition. The JavaScript sample counts subsets.

## code
### python
```python
def knapsack_01(items, capacity):
    best = [0] * (capacity + 1)
    for value, weight in items:
        for room in range(capacity, weight - 1, -1):
            best[room] = max(best[room], best[room - weight] + value)
    return best[capacity]

def knapsack_unbounded(items, capacity):
    best = [0] * (capacity + 1)
    for value, weight in items:
        for room in range(weight, capacity + 1):
            best[room] = max(best[room], best[room - weight] + value)
    return best[capacity]

def can_partition(numbers):
    total = sum(numbers)
    if total % 2:
        return False
    reachable = [True] + [False] * (total // 2)
    for number in numbers:
        for target in range(total // 2, number - 1, -1):
            reachable[target] = reachable[target] or reachable[target - number]
    return reachable[total // 2]

items = [(60, 10), (100, 20), (120, 30)]
print(knapsack_01(items, 50), knapsack_unbounded(items, 50), can_partition([1, 5, 11, 5]), can_partition([1, 2, 3, 5]))
```
Output:
```text
220 300 True False
```
### javascript
```javascript
function countSubsets(numbers, target) {
  const ways = [1, ...Array(target).fill(0)];
  for (const number of numbers) {
    for (let sum = target; sum >= number; sum--) {
      ways[sum] += ways[sum - number];
    }
  }
  return ways[target];
}

console.log(countSubsets([1, 1, 2, 3, 5], 5), countSubsets([2, 4, 6], 5));
```
Output:
```text
3 0
```

## quiz
1. In which direction does the capacity loop run for the 0/1 knapsack with a one-dimensional array?
   - [ ] Upward
   - [x] Downward
   - [ ] Randomly
   - [ ] From the middle
   > Downward iteration reads only values from before the current item.
2. What is the unbounded knapsack optimum for items (60,10), (100,20), (120,30) with capacity 50?
   - [ ] 220
   - [x] 300
   - [ ] 240
   - [ ] 160
   > Five copies of the best-ratio item fit exactly.
3. Why is knapsack dynamic programming pseudo-polynomial?
   - [ ] It uses recursion
   - [x] Its time depends on the numeric value of the capacity
   - [ ] It needs sorting
   - [ ] It uses floating point
   > The capacity value can be exponential in its bit length.
4. When can an array be partitioned into two equal-sum subsets?
   - [ ] When it is sorted
   - [x] When the total is even and a subset reaches half of it
   - [ ] When it has an even number of elements
   - [ ] Always
   > Subset sum with the half total as the target answers the question.

# Longest Common Subsequence
kind: algorithm
time: O(n · m) for strings of lengths n and m, one constant-time update per cell of the table.
space: O(n · m) for the full table, or O(min(n, m)) if only the length is needed and two rows suffice.

## intro
A subsequence keeps the order of characters but may skip some, so ACE is a subsequence of ABCDE. The longest common subsequence of two sequences is the longest sequence that appears in both. It powers file comparison, version control diffs and DNA alignment, and it is the canonical two-sequence dynamic programming problem.

## theory
State: `t[i][j]` is the length of the longest common subsequence of the first i characters of A and the first j characters of B.

Recurrence:

- If `A[i − 1] == B[j − 1]`, the characters match and extend the best of both shorter prefixes: `t[i][j] = t[i − 1][j − 1] + 1`
- Otherwise the answer is the better of dropping one character from either string: `t[i][j] = max(t[i − 1][j], t[i][j − 1])`
- Base cases: `t[0][j] = 0` and `t[i][0] = 0`, as an empty string has no common characters with anything

The answer is `t[n][m]`. Why the match case is safe: if the last characters are equal, some optimal subsequence can use them as its last pair (an exchange argument), so the problem reduces to the shorter prefixes.

Example: A = `ABCBDAB` and B = `BDCABA`. The table gives length 4, and a backtrack yields the subsequence `BCBA` (other optimal answers such as `BDAB` and `BCAB` also exist, so the subsequence is not unique even though the length is).

Recovering a subsequence: start at `t[n][m]` and walk back. If the characters at the current position match, add the character to the answer and move diagonally; otherwise move to the neighbour with the larger value (up or left). Reverse the collected characters at the end.

Related problems:

- Longest common substring (contiguous): reset the cell to 0 on mismatch and take the maximum over the whole table
- Shortest common supersequence: the length is n + m − LCS
- Minimum insertions and deletions to turn A into B: n + m − 2 · LCS
- Longest palindromic subsequence: LCS of a string and its reverse
- Diff tools: the lines that are not in the LCS are the insertions and deletions of a diff
- Edit distance is a close cousin that also allows substitutions

Space optimisation: since row i depends only on row i − 1, keep two rows (or one row and one saved value) when only the length is needed. For the sample strings, a two-row version also gives 4, using memory proportional to the shorter string. Hirschberg's algorithm recovers the subsequence itself in O(min(n, m)) space by divide and conquer.

Complexity: O(n · m) time. For long inputs with few differences, algorithms such as Myers' diff run in O((n + m) · D) where D is the edit script length, which is why practical diff tools are much faster than the table.

Edge cases: empty strings (LCS is zero), identical strings (LCS is the whole string), and no shared characters (LCS is zero). The length is symmetric in A and B, while the specific subsequence can differ when ties are broken differently.

## explain
1. Create a table with n + 1 rows and m + 1 columns of zeros.
2. For each pair of positions, if the characters match, take the diagonal value plus one.
3. Otherwise take the larger of the value above and the value to the left.
4. Read the length from the bottom-right cell.
5. Walk back through the table to rebuild one subsequence.
6. Use two rows when only the length is required.

## example
The Python function returns `(4, 'BCBA')` for `ABCBDAB` and `BDCABA`, the length together with one optimal subsequence. The JavaScript function computes only lengths: 4 for `AGGTAB` and `GXTXAYB` (the subsequence GTAB), 0 for `abc` and `def`, and 3 for `abcde` and `ace`.

## real
Version control and diff tools use it to show added and removed lines, bioinformatics software compares DNA sequences, and plagiarism detectors measure how much of one document appears in another.

## pros
- Clear recurrence with a simple table
- Reconstructs one optimal common subsequence
- Basis for diff and alignment tools

## cons
- Quadratic time and memory for long inputs
- The optimal subsequence is not unique
- Practical diffs use faster specialised algorithms

## uses
- File comparison and diff tools
- Sequence alignment in bioinformatics
- Measuring document similarity
- Computing the longest palindromic subsequence

## mistakes
- Confusing subsequence with substring
- Off-by-one errors between table indices and string indices
- Breaking ties inconsistently while rebuilding the subsequence
- Allocating the full table for very long strings when two rows suffice

## interview
**Q:** What is the recurrence for the longest common subsequence?
**A:** If the current characters match, t[i][j] = t[i − 1][j − 1] + 1; otherwise t[i][j] = max(t[i − 1][j], t[i][j − 1]), with zeros for empty prefixes.

**Q:** How do you reconstruct the subsequence itself?
**A:** Walk back from the bottom-right cell: on a match record the character and move diagonally, otherwise move toward the neighbour with the larger value, then reverse the result.

**Q:** How can you reduce the space for the length only?
**A:** Keep only the previous row and the current row, since each row depends only on the row before it, using O(min(n, m)) memory.

## summary
The longest common subsequence fills an n by m table with a match-or-skip recurrence in O(n · m) time. A walk back recovers one optimal subsequence, and two rows suffice when only the length matters.

## codenote
The Python sample returns the length and a subsequence. The JavaScript sample returns lengths only.

## code
### python
```python
def lcs(a, b):
    table = [[0] * (len(b) + 1) for _ in range(len(a) + 1)]
    for i in range(1, len(a) + 1):
        for j in range(1, len(b) + 1):
            if a[i - 1] == b[j - 1]:
                table[i][j] = table[i - 1][j - 1] + 1
            else:
                table[i][j] = max(table[i - 1][j], table[i][j - 1])
    i, j, chosen = len(a), len(b), []
    while i and j:
        if a[i - 1] == b[j - 1]:
            chosen.append(a[i - 1])
            i, j = i - 1, j - 1
        elif table[i - 1][j] >= table[i][j - 1]:
            i -= 1
        else:
            j -= 1
    return table[-1][-1], "".join(reversed(chosen))

print(lcs("ABCBDAB", "BDCABA"))
```
Output:
```text
(4, 'BCBA')
```
### javascript
```javascript
function lcsLength(a, b) {
  const table = Array.from({ length: a.length + 1 }, () => Array(b.length + 1).fill(0));
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      table[i][j] = a[i - 1] === b[j - 1]
        ? table[i - 1][j - 1] + 1
        : Math.max(table[i - 1][j], table[i][j - 1]);
    }
  }
  return table[a.length][b.length];
}

console.log(lcsLength("AGGTAB", "GXTXAYB"), lcsLength("abc", "def"), lcsLength("abcde", "ace"));
```
Output:
```text
4 0 3
```

## quiz
1. What is a subsequence?
   - [ ] A contiguous part of a string
   - [x] Characters in the original order, possibly with some skipped
   - [ ] A reversed string
   - [ ] A sorted copy
   > ACE is a subsequence of ABCDE but not a substring.
2. What does the table do when the characters match?
   - [ ] Takes the maximum of the neighbours
   - [x] Adds one to the diagonal value
   - [ ] Resets to zero
   - [ ] Copies the cell above
   > A matching pair extends the best subsequence of the shorter prefixes.
3. What is the length of the LCS of AGGTAB and GXTXAYB?
   - [ ] 3
   - [x] 4
   - [ ] 5
   - [ ] 6
   > The common subsequence is GTAB.
4. How do you compute the shortest common supersequence length from the LCS?
   - [ ] Add the two lengths
   - [x] n plus m minus the LCS length
   - [ ] Take the larger length
   - [ ] Multiply the lengths
   > Characters of the LCS appear only once in the supersequence.

# Longest Increasing Subsequence
kind: algorithm
time: O(n squared) for the standard table where each element looks at all earlier ones, and O(n log n) with the patience sorting method that uses binary search.
space: O(n) for the table in the quadratic solution and O(n) for the tails array in the fast one.
viz: lis-dp

## intro
Given a sequence of numbers, what is the length of the longest subsequence whose values strictly increase? For the sequence 10, 9, 2, 5, 3, 7, 101, 18 it is 4, for example 2, 3, 7, 101. The problem appears in scheduling, in measuring how sorted a sequence is and in tasks like nesting boxes, and it has two instructive solutions.

## theory
Quadratic dynamic programming. Let `d[i]` be the length of the longest increasing subsequence that ends exactly at index i. Every element alone is a subsequence of length 1. For each earlier index j less than i with `a[j] < a[i]`, the subsequence ending at j can be extended by a[i]:

- `d[i] = 1 + max(d[j])` over j < i with `a[j] < a[i]`, or 1 if no such j exists
- The answer is the maximum of all `d[i]`, not the last one, because the best subsequence need not end at the last element

For `10, 9, 2, 5, 3, 7, 101, 18` the table is `1, 1, 1, 2, 2, 3, 4, 4`, so the answer is 4.

Fast method (patience sorting). Maintain an array `tails` where `tails[k]` is the smallest possible last value of an increasing subsequence of length k + 1. Process each number x:

- If x is larger than every tail, append it (a longer subsequence exists)
- Otherwise find the first tail that is greater than or equal to x by binary search and replace it with x (a subsequence of the same length now ends with a smaller value, which is better for future extension)

The length of `tails` at the end is the answer. The array `tails` is always sorted, so binary search works, and each of the n steps costs O(log n). Note that `tails` is not itself the subsequence; it only has the right length. To recover an actual subsequence, store for each element the index of its predecessor and the position where it was placed.

For the sample data both methods give 4. For `0, 1, 0, 3, 2, 3` the answer is 4, and for `7, 7, 7, 7` it is 1 because the subsequence must be strictly increasing; the binary search uses the lower bound (first element not less than x) for strictness and the upper bound for non-decreasing subsequences.

Related problems and uses:

- Longest non-decreasing subsequence: change the comparison
- Longest decreasing subsequence: reverse or negate the values
- Number of longest increasing subsequences: track counts along with lengths
- Box stacking and Russian doll envelopes: sort by one dimension, and take the LIS on the other (for ties in the first dimension sort the second in descending order to prevent nesting equal widths)
- Minimum number of removals to make a sequence sorted: n − LIS
- Longest chain of pairs and scheduling problems with ordering constraints
- Patience sorting card game: the piles formed in the algorithm correspond to the tails array, and the number of piles is the LIS length
- Relation to LCS: the LIS of a permutation equals the LCS of the permutation with the sorted sequence

Both algorithms ignore equal values handling pitfalls: decide strict or non-strict at the start and use the matching comparison in both the table version and the binary search.

Choosing between them: for n up to a few thousand the quadratic version is simple and fine; for n up to a million use the O(n log n) version.

## explain
1. Decide whether the subsequence must be strictly increasing.
2. For the table method, set d[i] to one and extend from every smaller earlier value.
3. Return the maximum over d.
4. For the fast method, keep a sorted tails array.
5. For each number, append it or replace the first tail not smaller than it.
6. Return the size of tails, or reconstruct the sequence with predecessor links.

## example
The Python functions return 4 for `10, 9, 2, 5, 3, 7, 101, 18` with both methods, 4 for `0, 1, 0, 3, 2, 3` and 1 for `7, 7, 7, 7`. The JavaScript function uses a hand-written binary search and returns 6 for the sixteen-element sequence `0, 8, 4, 12, 2, 10, 6, 14, 1, 9, 5, 13, 3, 11, 7, 15` and 1 for the decreasing sequence `5, 4, 3, 2, 1`.

## real
Version tools look for the longest run of ordered revisions, scheduling systems find the largest chain of compatible jobs, and sorting analysis measures how close data is to sorted.

## pros
- Simple quadratic solution and a fast alternative
- Applies to many chain and nesting problems
- The tails idea gives O(n log n) time

## cons
- The tails array does not hold the actual subsequence
- Strict versus non-strict comparisons cause subtle bugs
- Quadratic version is slow for large inputs

## uses
- Measuring how sorted a sequence is
- Stacking and nesting problems
- Finding the longest chain of ordered jobs
- Minimum removals to make a sequence sorted

## mistakes
- Returning d at the last index instead of the maximum over all indices
- Using the wrong bound in binary search, which changes strictness
- Treating the tails array as the answer sequence
- Forgetting the descending tie-break in envelope problems

## interview
**Q:** How do you compute the longest increasing subsequence in O(n log n)?
**A:** Keep an array of the smallest possible tail value for each subsequence length, and for each number replace the first tail that is not smaller with it using binary search, or append it if it is larger than all tails; the final length is the answer.

**Q:** What is the O(n squared) recurrence?
**A:** d[i] = 1 + max of d[j] over earlier indices j with a[j] less than a[i], and the answer is the maximum of all d values.

**Q:** How do you get the minimum number of deletions to sort the sequence into increasing order?
**A:** Subtract the length of the longest increasing subsequence from the length of the sequence.

## summary
The longest increasing subsequence is found by a quadratic table of best lengths ending at each index or in O(n log n) with a binary-searched tails array. Decide strictness first and remember that the answer is the maximum over all end positions.

## codenote
The Python sample implements both methods. The JavaScript sample implements the fast method with its own binary search.

## code
### python
```python
import bisect

def lis_quadratic(values):
    ends_here = [1] * len(values)
    for i in range(len(values)):
        for j in range(i):
            if values[j] < values[i]:
                ends_here[i] = max(ends_here[i], ends_here[j] + 1)
    return max(ends_here) if values else 0

def lis_fast(values):
    tails = []
    for value in values:
        position = bisect.bisect_left(tails, value)
        if position == len(tails):
            tails.append(value)
        else:
            tails[position] = value
    return len(tails)

data = [10, 9, 2, 5, 3, 7, 101, 18]
print(lis_quadratic(data), lis_fast(data), lis_fast([0, 1, 0, 3, 2, 3]), lis_fast([7, 7, 7, 7]))
```
Output:
```text
4 4 4 1
```
### javascript
```javascript
function lis(values) {
  const tails = [];
  for (const value of values) {
    let low = 0;
    let high = tails.length;
    while (low < high) {
      const mid = (low + high) >> 1;
      if (tails[mid] < value) low = mid + 1;
      else high = mid;
    }
    tails[low] = value;
  }
  return tails.length;
}

console.log(lis([0, 8, 4, 12, 2, 10, 6, 14, 1, 9, 5, 13, 3, 11, 7, 15]), lis([5, 4, 3, 2, 1]));
```
Output:
```text
6 1
```

## quiz
1. What does d[i] mean in the quadratic LIS solution?
   - [ ] The best subsequence of the whole array
   - [x] The length of the longest increasing subsequence ending at index i
   - [ ] The smallest value at index i
   - [ ] The number of smaller elements
   > The final answer is the maximum over all d values.
2. What does the tails array hold in the fast method?
   - [ ] The longest subsequence itself
   - [x] The smallest possible last value for each subsequence length
   - [ ] The sorted input
   - [ ] The indices of the maximum values
   > It is always sorted, which makes binary search valid.
3. What is the LIS length of 7, 7, 7, 7 for strictly increasing subsequences?
   - [ ] 4
   - [x] 1
   - [ ] 0
   - [ ] 2
   > Equal values do not strictly increase.
4. How do you compute the fewest removals needed to sort a sequence?
   - [ ] Count the descents
   - [x] Length minus the longest increasing subsequence
   - [ ] Sort and compare
   - [ ] Divide by two
   > The kept elements form an increasing subsequence.

# Edit Distance
kind: algorithm
time: O(n · m) for strings of lengths n and m, with constant work per cell.
space: O(n · m) for the full table, reducible to O(min(n, m)) with two rows when only the distance is needed.
viz: edit-distance-dp
practice: edit-distance

## intro
The edit distance, or Levenshtein distance, between two strings is the minimum number of single-character insertions, deletions and substitutions needed to turn one into the other. It measures how different two words are and underlies spell checkers, fuzzy search and DNA alignment.

## theory
State: `t[i][j]` is the edit distance between the first i characters of A and the first j characters of B.

Base cases:

- `t[i][0] = i`: turning i characters into the empty string needs i deletions
- `t[0][j] = j`: building j characters from nothing needs j insertions

Recurrence for i and j at least 1:

- If `A[i − 1] == B[j − 1]`, no edit is needed: `t[i][j] = t[i − 1][j − 1]`
- Otherwise take the cheapest of three options, each costing one: delete from A (`t[i − 1][j]`), insert into A (`t[i][j − 1]`), or substitute (`t[i − 1][j − 1]`), so `t[i][j] = 1 + min(t[i − 1][j], t[i][j − 1], t[i − 1][j − 1])`

The answer is `t[n][m]`.

Examples: `kitten` to `sitting` takes 3 edits (substitute k with s, substitute e with i, insert g). `horse` to `ros` takes 3 (substitute h with r, delete r, delete e). From the empty string to `abc` the distance is 3 insertions. Both strings the same gives 0. `intention` to `execution` takes 5, and `flaw` to `lawn` takes 2 (delete f, insert n).

Why it works: the last operation in an optimal edit script is one of four things (match, substitute, delete or insert), and what remains is an optimal script for smaller prefixes, so the problem has optimal substructure with overlapping subproblems.

Recovering the edit script: walk back from `t[n][m]`, at each cell moving to the predecessor that explains its value (diagonal for match or substitute, up for delete, left for insert), and record the operation. This gives an alignment of the two strings.

Variants:

- Different costs for each operation: replace the 1 by the cost; weighted edit distance is used for keyboards (adjacent keys are cheaper) and genetics (substitution matrices)
- Damerau-Levenshtein: adds transposition of adjacent characters, which models common typing errors
- Longest common subsequence distance: only insertions and deletions, so the distance is n + m − 2 · LCS
- Hamming distance: only substitutions on equal-length strings, computed in linear time
- Approximate string matching (Sellers algorithm): set the first row to zero to find the best match of a pattern inside a text
- Bounded edit distance: when only distances up to k matter, compute the diagonal band of width 2k + 1 in O(k · n) time

Space optimisation: each row depends only on the previous row, so two rows (or one row plus one saved cell) are enough for the distance, using O(min(n, m)) memory. The JavaScript version below keeps just two rows.

Limits: O(n · m) time is too slow for very long strings, such as whole genomes, where heuristics (BLAST), bit-parallel algorithms (Myers) or hashing methods are used. Under common complexity assumptions, no strongly sub-quadratic exact algorithm exists.

Use in applications: suggest corrections within distance 1 or 2, deduplicate records with slightly different spellings, rank search results by closeness and measure the similarity of source files.

## explain
1. Create a table with n + 1 rows and m + 1 columns.
2. Fill the first row with 0 to m and the first column with 0 to n.
3. For each cell, copy the diagonal when the characters match.
4. Otherwise add one to the minimum of the left, upper and diagonal cells.
5. Read the answer from the bottom-right cell.
6. Optionally trace back the operations, or keep only two rows.

## example
The Python function returns 3 for `kitten` and `sitting`, 3 for `horse` and `ros`, and 3 when comparing the empty string with `abc`. The JavaScript function with two rows returns 5 for `intention` and `execution`, 2 for `flaw` and `lawn`, and 0 for two equal words.

## real
Spell checkers suggest words within a small edit distance, search engines tolerate typos, and bioinformatics tools align DNA and protein sequences with weighted versions.

## pros
- Exact measure of the minimum number of edits
- Easy to extend with weights and new operations
- Supports recovering the edit script

## cons
- Quadratic time and memory for long strings
- Treats all positions equally unless weighted
- Does not understand meaning, only characters

## uses
- Spell checking and autocorrect
- Fuzzy matching and record deduplication
- DNA and protein alignment
- Measuring similarity of texts or code

## mistakes
- Leaving the border row and column of the table unset
- Using the same cost for match and substitute
- Mixing up the table index and the string index by one
- Allocating a full table for very long strings when two rows suffice

## interview
**Q:** What is the recurrence for edit distance?
**A:** If the characters match, t[i][j] = t[i − 1][j − 1]; otherwise t[i][j] = 1 + min of the delete, insert and substitute neighbours, with t[i][0] = i and t[0][j] = j.

**Q:** What is the edit distance between kitten and sitting?
**A:** 3: substitute k with s, substitute e with i and insert g at the end.

**Q:** How can you reduce the memory of the edit distance computation?
**A:** Keep only the previous row and the current row, because each cell depends only on the row above and the cell to the left, giving O(min(n, m)) space.

## summary
Edit distance fills an n by m table where each cell is the cheapest of delete, insert, or substitute, in O(n · m) time. Initialise the borders with prefix lengths, and use two rows when only the distance is required.

## codenote
The Python sample uses the full table. The JavaScript sample keeps two rows.

## code
### python
```python
def edit_distance(a, b):
    table = [[0] * (len(b) + 1) for _ in range(len(a) + 1)]
    for i in range(len(a) + 1):
        table[i][0] = i
    for j in range(len(b) + 1):
        table[0][j] = j
    for i in range(1, len(a) + 1):
        for j in range(1, len(b) + 1):
            if a[i - 1] == b[j - 1]:
                table[i][j] = table[i - 1][j - 1]
            else:
                table[i][j] = 1 + min(table[i - 1][j], table[i][j - 1], table[i - 1][j - 1])
    return table[-1][-1]

print(edit_distance("kitten", "sitting"), edit_distance("horse", "ros"), edit_distance("", "abc"))
```
Output:
```text
3 3 3
```
### javascript
```javascript
function editDistance(a, b) {
  let previous = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    const current = [i];
    for (let j = 1; j <= b.length; j++) {
      current[j] = a[i - 1] === b[j - 1]
        ? previous[j - 1]
        : 1 + Math.min(previous[j], current[j - 1], previous[j - 1]);
    }
    previous = current;
  }
  return previous[b.length];
}

console.log(editDistance("intention", "execution"), editDistance("flaw", "lawn"), editDistance("same", "same"));
```
Output:
```text
5 2 0
```

## quiz
1. Which operations does the Levenshtein edit distance allow?
   - [ ] Only substitutions
   - [x] Insertions, deletions and substitutions
   - [ ] Only transpositions
   - [ ] Sorting and reversing
   > Each of the three operations costs one.
2. What is the value of table[i][0] in the edit distance table?
   - [ ] 0
   - [x] i, the cost of deleting i characters
   - [ ] Infinity
   - [ ] The length of the second string
   > Turning a prefix into the empty string needs that many deletions.
3. What is the edit distance between kitten and sitting?
   - [ ] 2
   - [x] 3
   - [ ] 4
   - [ ] 5
   > Two substitutions and one insertion.
4. What allows the computation to use only O(min(n, m)) memory?
   - [ ] Sorting the strings
   - [x] Each row depends only on the previous row
   - [ ] The table is symmetric
   - [ ] Strings are short
   > Older rows can be discarded as the table fills.

# Bitmask DP Intro
kind: algorithm
time: O(2^n · n) for the assignment style problems and O(2^n · n^2) for the travelling salesman problem, since there are 2^n masks and each state tries n or n squared transitions.
space: O(2^n · n) for the table of masks and last positions in the travelling salesman problem, O(2^n) for assignment.
viz: bitmask-dp

## intro
When a problem involves choosing among a small number of items, such as 15 to 20, the set of items already used can be stored as the bits of an integer. Bitmask dynamic programming uses that integer as part of the state, which handles problems that look like permutations but have overlapping subproblems, with 2^n states instead of n! orderings.

## theory
Bitmask basics: a mask is an integer in which bit i is 1 if item i is in the set.

- Test membership: `mask >> i & 1`
- Add an item: `mask | (1 << i)`
- Remove an item: `mask & ~(1 << i)`
- Count items: the number of set bits (popcount); the masks 0 to 7 have `0, 1, 1, 2, 1, 2, 2, 3` bits set
- Iterate over all subsets: for mask from 0 to 2^n − 1
- Full set: `(1 << n) − 1`

Why it works: the future of many search problems depends only on the set of items already used, not on the order in which they were used. Permutations count n! orderings, but there are only 2^n sets, so storing the best result per set removes the repetition.

Example 1: assignment problem. Assign n tasks to n workers, one task each, to minimise the total cost. Let `dp[mask]` be the minimum cost to give the first popcount(mask) workers the tasks in mask. Worker k = popcount(mask) takes any task not in the mask: `dp[mask | (1 << c)] = min(dp[mask] + cost[k][c])`. For the cost matrix with rows `9 2 7 8`, `6 4 3 7`, `5 8 1 8` and `7 6 9 4` the minimum total cost is 13, found in 16 · 4 steps rather than by listing all 24 permutations (the gap is dramatic for larger n: 20! is about 2.4 × 10^18, while 2^20 · 20 is about 21 million).

Example 2: travelling salesman problem. Visit every city exactly once starting and ending at city 0, with minimal total distance. State `dp[mask][u]` is the minimum distance to start at 0, visit exactly the cities in mask and stand at city u. Transition to an unvisited city v: `dp[mask | (1 << v)][v] = min(dp[mask][u] + d[u][v])`. The answer is the minimum over u of `dp[full][u] + d[u][0]`. For the four cities with distance matrix rows `0 10 15 20`, `10 0 35 25`, `15 35 0 30` and `20 25 30 0` the shortest tour has length 80. The cost is O(2^n · n^2), vastly better than n! for n up to about 20 (Held-Karp algorithm).

Other uses:

- Subset DP over partitions: split a set into groups (minimum number of groups for a limit)
- Counting Hamiltonian paths and perfect matchings in small graphs
- Profile DP for tilings of grids, where the mask encodes the filled cells of the current column
- Sum over subsets (zeta transform), enumerating submasks of a mask in O(3^n) total
- Game states for small boards

Limits: memory and time double with every extra item, so n is limited to about 20 to 25. Use submask enumeration with care: iterating all submasks of every mask costs 3^n in total.

Implementation tips: use an array indexed by mask rather than a hash map; initialise unreachable states with infinity; process masks in increasing order, since adding a bit increases the integer, so dependencies are ready; and use bit tricks such as `mask & (mask − 1)` to remove the lowest set bit and `mask & −mask` to isolate it.

Verification: compare with brute-force permutations for n up to 8 on random matrices.

## explain
1. Decide which small set of items the state must remember.
2. Represent the set of used items as a bitmask.
3. Define dp over masks (and a current item when position matters).
4. Start from the empty mask and try adding each unused item.
5. Update the next mask with the best cost.
6. Read the answer from the full mask.

## example
The Python program solves the travelling salesman problem for four cities with Held-Karp: the shortest tour is 80. It also prints the number of set bits in `0b1011`, which is 3, and the popcounts of the masks 0 to 7. The JavaScript program solves the assignment problem for the 4 by 4 cost matrix and prints the minimum cost 13.

## real
Delivery planners use Held-Karp for small multi-stop routes, circuit designers use subset dynamic programming for placement problems, and puzzle solvers use bitmask states for tile arrangements.

## pros
- Handles permutation-like problems with 2^n states
- Compact states and fast bit operations
- Gives exact answers where brute force is impossible

## cons
- Limited to about 20 to 25 items
- Memory grows exponentially
- Bit manipulation code is harder to read and debug

## uses
- Optimal matching of workers to tasks on small sets
- Exact travelling salesman for few cities
- Tiling and profile dynamic programming
- Subset partition problems

## mistakes
- Using one-based item indices with shifts and getting off-by-one masks
- Forgetting to mark unreachable states with infinity
- Using masks beyond the 32-bit limit in languages with fixed-width integers
- Running exponential algorithms with n far above 25

## interview
**Q:** How does bitmask dynamic programming reduce the travelling salesman problem from n factorial?
**A:** It stores, for each subset of visited cities and the current city, the best distance, giving 2^n times n states with n transitions each, O(2^n · n^2) in total (the Held-Karp algorithm).

**Q:** How do you test, set and clear bit i of a mask?
**A:** Test with mask shifted right by i and ANDed with 1, set with OR of 1 shifted left by i, and clear with AND of the mask with the complement of 1 shifted left by i.

**Q:** Why is it safe to fill a bitmask table in numeric order of the masks?
**A:** Adding a bit to a mask always produces a larger integer, so every state is computed after the states it depends on.

## summary
Bitmask dynamic programming stores the set of used items as an integer and a best value for every set, replacing n! orderings with 2^n states. It solves small assignment, tour and tiling problems exactly, up to about 20 items.

## codenote
The Python sample solves a four-city tour. The JavaScript sample solves a small assignment problem.

## code
### python
```python
INF = 10 ** 9

def shortest_tour(distance):
    n = len(distance)
    best = [[INF] * n for _ in range(1 << n)]
    best[1][0] = 0
    for mask in range(1 << n):
        for last in range(n):
            if best[mask][last] == INF:
                continue
            for city in range(n):
                if not mask >> city & 1:
                    nxt = mask | 1 << city
                    best[nxt][city] = min(best[nxt][city], best[mask][last] + distance[last][city])
    full = (1 << n) - 1
    return min(best[full][last] + distance[last][0] for last in range(1, n))

matrix = [[0, 10, 15, 20], [10, 0, 35, 25], [15, 35, 0, 30], [20, 25, 30, 0]]
print(shortest_tour(matrix), bin(0b1011).count("1"), [bin(m).count("1") for m in range(8)])
```
Output:
```text
80 3 [0, 1, 1, 2, 1, 2, 2, 3]
```
### javascript
```javascript
function cheapestAssignment(cost) {
  const n = cost.length;
  const full = (1 << n) - 1;
  const best = Array(1 << n).fill(Infinity);
  best[0] = 0;
  for (let mask = 0; mask < full; mask++) {
    const worker = mask.toString(2).split("1").length - 1;
    for (let task = 0; task < n; task++) {
      if (mask >> task & 1) continue;
      const next = mask | (1 << task);
      best[next] = Math.min(best[next], best[mask] + cost[worker][task]);
    }
  }
  return best[full];
}

console.log(cheapestAssignment([[9, 2, 7, 8], [6, 4, 3, 7], [5, 8, 1, 8], [7, 6, 9, 4]]));
```
Output:
```text
13
```

## quiz
1. What does bit i of a mask represent?
   - [ ] The i-th digit of the answer
   - [x] Whether item i is in the set
   - [ ] The cost of item i
   - [ ] The position of the mask
   > The mask encodes a subset as an integer.
2. How many masks exist for n items?
   - [ ] n factorial
   - [x] 2^n
   - [ ] n squared
   - [ ] 2n
   > Each item is either in or out of the set.
3. What is the Held-Karp time complexity for n cities?
   - [ ] O(n!)
   - [x] O(2^n · n^2)
   - [ ] O(n log n)
   - [ ] O(n^3)
   > There are 2^n times n states with n transitions each.
4. Why can masks be processed in increasing order?
   - [ ] Because they are sorted by cost
   - [x] Adding a bit always creates a larger integer
   - [ ] Because lower masks are cheaper
   - [ ] Because of recursion
   > Dependencies are therefore computed first.

# DP Space Optimization
kind: algorithm
time: Not changed by space optimisation — the number of operations stays O(states · transitions), though contiguous rolling arrays often run faster in practice because they fit in cache.
space: Reduces O(n · m) tables to O(m) with a single row, or to O(1) for recurrences that look back a fixed number of steps.

## intro
Dynamic programming tables can be large: a 10,000 by 10,000 table of 4-byte integers needs 400 megabytes. Often only the last row or the last few entries are needed to compute the next ones, so older parts can be discarded. Space optimisation keeps the same time and the same answers with far less memory.

## theory
Which entries are still needed? Look at the recurrence and ask how far back it reaches.

- Depends on the previous one or two entries (Fibonacci, house robber, climbing stairs): use two or three variables. Memory goes from O(n) to O(1). Computing the 50th Fibonacci number with two variables gives 12,586,269,025 in constant memory.
- Row depends only on the previous row (grid paths, longest common subsequence, edit distance): keep two rows and swap them, or one row updated in place. Memory goes from O(n · m) to O(m).
- Knapsack row i depends on row i − 1 at the same or smaller capacities: one array updated from high capacity to low (0/1) or from low to high (unbounded)
- Needs all earlier rows (interval dynamic programming, some edit script reconstructions): cannot be reduced directly

Examples:

- 0/1 knapsack with three items and capacity 50: the two-dimensional table has 4 · 51 = 204 cells and gives 220; a single array of 51 entries gives the same 220
- Longest common subsequence length of `ABCBDAB` and `BDCABA` with two rows gives 4, the same as the full table
- Pascal's triangle: the row for 6 rows is `1 5 10 10 5 1`, computed from one previous row without keeping the triangle
- Fibonacci: 55 for n = 10 and 12,586,269,025 for n = 50 with two variables

Techniques:

- Rolling arrays: allocate two rows and index them by `i % 2`, or swap references
- In-place updates: if the recurrence reads entries that will be overwritten later, choose the loop direction that reads old values first (downward for 0/1 knapsack, backward for Pascal's triangle updates in a single array)
- Keeping one extra variable for the diagonal value in two-dimensional recurrences that need the previous row's left neighbour (the single-row edit distance keeps a temporary copy of the old diagonal value)
- Bitset acceleration for boolean tables such as subset sum, where 64 states are updated per machine operation, giving a further constant speed-up
- Divide and conquer reconstruction (Hirschberg): recovers the actual alignment in linear space at about twice the time, by finding the middle of an optimal path using forward and backward linear-space passes

Trade-offs:

- Reconstruction: a reduced table no longer lets you walk back to find the choices. Store only what you need (such as the parent pointer array for one dimension), use Hirschberg's technique, or recompute.
- Clarity: optimised code is harder to read and debug, so write and test the full-table version first and then compare outputs of both versions on random inputs
- Time: unchanged asymptotically, but better cache behaviour can give a real speed-up

Rule of thumb: optimise space when memory limits or cache misses matter, not by default.

Checklist: confirm the dependency range, choose rows or variables, take care with the order of updates, test against the full version, and make sure the answer cell still exists after the last update.

## explain
1. Write and test the full-table solution first.
2. Identify which earlier entries each entry reads.
3. Keep only those entries: a few variables, two rows or one row.
4. Choose the update order so that values are read before being overwritten.
5. Compare the optimised result with the full version on many inputs.
6. If the solution path is needed, add a technique to recover it.

## example
The Python program computes the 0/1 knapsack twice for the items (60, 10), (100, 20), (120, 30) and capacity 50: the full table has 204 cells, and the rolling array has 51, and both give 220. It also computes the longest common subsequence length with two rows and gets 4. The JavaScript program computes Fibonacci with two variables (55 for n = 10 and 12586269025 for n = 50) and Pascal's row for 6 rows with one array: `1 5 10 10 5 1`.

## real
Mobile apps with tight memory budgets use rolling rows for text comparison, large-scale genome alignment uses linear space algorithms, and embedded planners avoid allocating full tables.

## pros
- Large reduction in memory use
- Same time complexity and answers
- Often faster because of better cache locality

## cons
- Cannot reconstruct the solution path directly
- Update order bugs are easy to introduce
- Code is less readable than the full table

## uses
- Large sequence comparisons with limited memory
- Knapsack and subset sum with big item counts
- Embedded and mobile devices
- Contest problems with tight memory limits

## mistakes
- Overwriting a value before it is read in the same pass
- Optimising before the full version is verified
- Losing the information needed for reconstruction
- Forgetting the diagonal value when using a single row

## interview
**Q:** How can the memory of the longest common subsequence table be reduced?
**A:** Each row depends only on the previous row, so keep two rows and swap them, giving O(min(n, m)) memory for the length; recovering the subsequence in linear space needs Hirschberg's algorithm.

**Q:** Why does the 0/1 knapsack single array loop downward?
**A:** Going from high capacity to low guarantees that the entries read, at smaller capacities, still hold the values from before the current item, so the item is used at most once.

**Q:** What is the drawback of space optimisation?
**A:** The discarded rows can no longer be used to trace back which choices produced the optimum, so reconstruction needs extra bookkeeping or a different technique.

## summary
Space optimisation keeps only the part of a dynamic programming table that later states read: a few variables, two rows or one array updated in the right order. It preserves time and answers, but complicates reconstruction.

## codenote
The Python sample compares full and rolling tables. The JavaScript sample uses constant space and a single row.

## code
### python
```python
def knapsack_table(items, capacity):
    table = [[0] * (capacity + 1) for _ in range(len(items) + 1)]
    for i, (value, weight) in enumerate(items, 1):
        for room in range(capacity + 1):
            table[i][room] = table[i - 1][room]
            if room >= weight:
                table[i][room] = max(table[i][room], table[i - 1][room - weight] + value)
    return table[-1][capacity], (len(items) + 1) * (capacity + 1)

def knapsack_row(items, capacity):
    best = [0] * (capacity + 1)
    for value, weight in items:
        for room in range(capacity, weight - 1, -1):
            best[room] = max(best[room], best[room - weight] + value)
    return best[capacity]

def lcs_length(a, b):
    previous = [0] * (len(b) + 1)
    for x in a:
        current = [0]
        for j, y in enumerate(b, 1):
            current.append(previous[j - 1] + 1 if x == y else max(previous[j], current[j - 1]))
        previous = current
    return previous[-1]

items = [(60, 10), (100, 20), (120, 30)]
value, cells = knapsack_table(items, 50)
print(value, cells, knapsack_row(items, 50), 51)
print(lcs_length("ABCBDAB", "BDCABA"))
```
Output:
```text
220 204 220 51
4
```
### javascript
```javascript
function fibonacci(n) {
  let a = 0;
  let b = 1;
  for (let i = 0; i < n; i++) {
    [a, b] = [b, a + b];
  }
  return a;
}

function pascalRow(rows) {
  let row = [1];
  for (let i = 1; i < rows; i++) {
    const next = [1];
    for (let j = 1; j < row.length; j++) next.push(row[j - 1] + row[j]);
    next.push(1);
    row = next;
  }
  return row;
}

console.log(fibonacci(10), fibonacci(50));
console.log(pascalRow(6).join(" "));
```
Output:
```text
55 12586269025
1 5 10 10 5 1
```

## quiz
1. When can a table be reduced to a few variables?
   - [ ] When it has many rows
   - [x] When each entry depends only on a fixed number of recent entries
   - [ ] When values are small
   - [ ] When recursion is used
   > Older entries are never read again.
2. What does the 0/1 knapsack row reduction rely on?
   - [ ] Looping capacities upward
   - [x] Looping capacities downward so old values are read first
   - [ ] Sorting the items
   - [ ] Using recursion
   > Downward iteration prevents using the same item twice.
3. What is the main drawback of keeping only one row?
   - [ ] Slower time complexity
   - [x] The solution path can no longer be traced back
   - [ ] Wrong answers
   - [ ] More memory
   > The earlier rows that contained the choices are discarded.
4. Which algorithm recovers an alignment in linear space?
   - [ ] Dijkstra
   - [x] Hirschberg's divide and conquer method
   - [ ] Kruskal
   - [ ] Quick sort
   > It combines forward and backward linear-space passes.
