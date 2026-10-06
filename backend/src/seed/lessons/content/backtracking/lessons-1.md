# Backtracking Template
kind: algorithm
time: Exponential in the worst case, such as O(2^n) for subsets or O(n!) for permutations, because the search tree can contain every candidate; pruning reduces the visited part of the tree but not the worst-case bound.
space: O(n) for the recursion stack and the partial solution, where n is the depth of the search tree, plus the space for stored results.

## intro
Backtracking builds a solution one decision at a time and abandons a partial solution the moment it cannot lead to a valid answer, undoing the last decision and trying the next. It is the standard way to enumerate combinatorial objects and to solve constraint problems such as puzzles, scheduling and parsing when no efficient formula is known.

## theory
The backtracking template has three moves around a recursive call:

- Choose: add one option to the partial solution
- Explore: recurse to make the next decision
- Unchoose: remove the option again (the backtrack), restoring the state so the next option starts clean

Skeleton:

- If the partial solution is complete, record it and return
- Otherwise, for each candidate option that is valid now, choose it, recurse, and unchoose it

The search forms a tree: each node is a partial solution, each edge is a choice, and each leaf is a complete solution or a dead end. Backtracking is a depth-first traversal of this tree, which is why it needs only memory proportional to the depth.

Three questions define every backtracking solution:

- What is a decision? (pick the next element, place a queen in the next row, choose a letter)
- When is a partial solution complete? (length reached, target sum hit, board full)
- Which options are valid? (not already used, no conflict with earlier choices, sum not exceeded) — this check is where pruning happens

Example 1: all binary strings of length 3 with no two adjacent ones. At each position try 0 and 1, skip the 1 when the previous character is 1. The results are 000, 001, 010, 100 and 101. The test on the previous character cuts every branch containing 11 early, so those strings are never built.

Example 2: combination sum. Given the candidates 2, 3, 6, 7 and the target 7, choose numbers (with repetition allowed) that add up to the target. Sorting the candidates lets the loop stop as soon as a candidate exceeds the remaining amount. The answers are `[2, 2, 3]` and `[7]`. Recursing with the same start index allows reuse of a number while avoiding duplicate orderings such as 3, 2, 2.

State management matters: if the partial solution is a list, append before the recursive call and pop after it; if it is a board, set the cell and clear it afterwards; if it uses sets of used columns, add and remove the same entries. Storing a copy of the solution when you record it prevents later mutation from changing stored results (in Python, record `path[:]` rather than `path`).

Avoiding duplicates: iterate options in a fixed order with a start index so that the same combination is not built in different orders, and skip equal neighbours in sorted input when each value may be used only once.

Complexity: the number of nodes in the search tree times the work per node. For subsets it is 2^n leaves, for permutations n! leaves. Backtracking is not a way to make hard problems easy; it is a way to avoid exploring parts of the tree that cannot contain answers.

Comparison: brute force generates all candidates and then filters; backtracking filters while generating, so invalid branches are never expanded. Dynamic programming fits when subproblems repeat; backtracking fits when you must list the solutions or when the state is too varied to memoize.

## explain
1. Define what a partial solution and a complete solution are.
2. Write the recursive function with the current state as parameters or shared variables.
3. If the state is complete, record a copy of the solution and return.
4. Loop over the options that are valid in the current state.
5. For each option, choose it, recurse, and then undo the choice.
6. Add pruning checks as early as possible, and test on tiny inputs.

## example
The Python function lists the binary strings of length 3 without adjacent ones: 000, 001, 010, 100 and 101. The JavaScript function solves combination sum for candidates 2, 3, 6 and 7 with target 7 and prints the two combinations `[[2,2,3],[7]]`.

## real
Compilers and regular expression engines backtrack over alternative parses, puzzle solvers and scheduling tools search assignments with it, and package managers backtrack when version choices conflict.

## pros
- Simple recursive structure for many search problems
- Uses memory proportional to the depth of the search
- Prunes invalid branches early

## cons
- Exponential time in the worst case
- Needs careful undoing of state after each choice
- Can be slow without good pruning or ordering

## uses
- Enumerating subsets, permutations and combinations of items
- Solving puzzles such as sudoku and n queens
- Searching assignments that satisfy constraints
- Parsing with alternatives

## mistakes
- Forgetting to undo a choice after the recursive call
- Storing a reference to the mutable path instead of a copy
- Checking validity too late instead of before recursing
- Generating duplicates by revisiting earlier options

## interview
**Q:** What are the steps of a backtracking algorithm?
**A:** Choose an option, explore by recursing on the remaining decisions, and unchoose to restore the state; a complete solution is recorded and invalid partial solutions are abandoned.

**Q:** How is backtracking different from brute force?
**A:** Brute force generates every candidate and then tests it, while backtracking tests partial candidates and abandons a branch as soon as it cannot succeed, so it explores a smaller tree.

**Q:** Why must the recorded solution be copied?
**A:** The partial solution is modified in place as the search continues, so storing a reference would make all recorded results change or become empty by the end of the search.

## summary
Backtracking explores a decision tree depth first with the pattern choose, explore and unchoose, abandoning partial solutions that cannot be completed. Correct state restoration, early validity checks and copied results are what make the template work.

## codenote
The Python sample generates restricted binary strings. The JavaScript sample solves combination sum.

## code
### python
```python
def no_adjacent_ones(length):
    results, path = [], []

    def explore():
        if len(path) == length:
            results.append("".join(path))
            return
        for bit in "01":
            if bit == "1" and path and path[-1] == "1":
                continue
            path.append(bit)
            explore()
            path.pop()

    explore()
    return results

print(no_adjacent_ones(3))
```
Output:
```text
['000', '001', '010', '100', '101']
```
### javascript
```javascript
function combinationSum(candidates, target) {
  const results = [];
  const path = [];
  const sorted = [...candidates].sort((a, b) => a - b);

  function explore(start, remaining) {
    if (remaining === 0) {
      results.push([...path]);
      return;
    }
    for (let i = start; i < sorted.length && sorted[i] <= remaining; i++) {
      path.push(sorted[i]);
      explore(i, remaining - sorted[i]);
      path.pop();
    }
  }

  explore(0, target);
  return results;
}

console.log(JSON.stringify(combinationSum([2, 3, 6, 7], 7)));
```
Output:
```text
[[2,2,3],[7]]
```

## quiz
1. What are the three moves of the backtracking template?
   - [ ] Sort, split, merge
   - [x] Choose, explore, unchoose
   - [ ] Push, pop, peek
   - [ ] Read, write, close
   > Each option is tried and then undone before the next one.
2. When does backtracking abandon a partial solution?
   - [ ] After it has been recorded
   - [x] As soon as it cannot lead to a valid complete solution
   - [ ] Only at the leaves
   - [ ] Never
   > Early abandonment is what separates it from brute force.
3. Why is a copy of the path stored when a solution is found?
   - [ ] To save memory
   - [x] Because the path keeps changing as the search continues
   - [ ] To sort the results
   - [ ] To avoid the base case
   > A stored reference would be emptied by the later pops.
4. How much memory does the recursion itself need for a decision tree of depth n?
   - [ ] O(2^n)
   - [x] O(n)
   - [ ] O(n!)
   - [ ] O(1)
   > Depth first search keeps only the current path.

# Subsets Generation
kind: algorithm
time: O(n · 2^n) because there are 2^n subsets and copying each into the result list costs up to O(n); the recursion itself visits 2^(n+1) − 1 nodes.
space: O(n) for the recursion stack and current subset, excluding the O(n · 2^n) output.
viz: backtracking-subsets

## intro
The subsets problem asks for all possible selections from a set of items, the power set. A set of n elements has 2^n subsets, so the output grows quickly, and the task is a clean first exercise in backtracking: for each element, decide whether it is in or out.

## theory
Two standard formulations of the include or exclude recursion:

- Decision by element: at index i, either skip nums[i] or include it, then continue at i + 1. When i reaches the end of the array, record the current subset. This builds a binary tree of depth n with 2^n leaves, one per subset.
- Start index loop: record the current subset at every node, then for each index j from start to the end, add nums[j], recurse with start j + 1, and remove nums[j]. Each node of the tree is a subset, so there are exactly 2^n nodes, and no duplicates arise because elements are always taken in increasing index order.

For `[1, 2, 3]` the first formulation visits the exclude branch before the include branch and returns `[]`, `[3]`, `[2]`, `[2, 3]`, `[1]`, `[1, 3]`, `[1, 2]` and `[1, 2, 3]`, eight subsets. The count for an array of 10 elements is 1024. The number of subsets of size k is the binomial coefficient C(n, k), and the sizes add up to 2^n.

Bitmask alternative: every subset corresponds to a number from 0 to 2^n − 1, where bit i says whether element i is included. Looping over the masks and testing bits generates all subsets without recursion and is convenient for n up to about 20. The backtracking version generalises to constraints, such as subsets with a given sum, which a plain mask loop checks only after building each subset.

Duplicates in the input. For a multiset such as `[1, 2, 2]`, naive generation would list `[1, 2]` twice. The standard fix is to sort the array and, in the start-index loop, skip an element equal to the previous one at the same level: `if j > start and nums[j] == nums[j − 1]: continue`. The result has 6 distinct subsets: `[]`, `[1]`, `[1, 2]`, `[1, 2, 2]`, `[2]` and `[2, 2]`.

Variations built on the same skeleton:

- Subsets with a given sum or size: prune when the partial sum exceeds the target or when the remaining elements cannot reach the size
- Subset sum and partition problems: the same tree, but dynamic programming is faster for moderate sums
- Letter case permutations and generating all parenthesis strings: decision per position
- Lexicographic or Gray code order: change the ordering of the tree to meet an output requirement

Cost: any algorithm that outputs all subsets needs at least 2^n steps, so exponential time is unavoidable; but the memory needed is only O(n) if results are processed as they are produced (for example in a generator) instead of stored.

## explain
1. Choose the formulation: include or exclude per element, or the start index loop.
2. Keep the current subset in a list shared by the recursive calls.
3. Record a copy of the current subset when the rule says it is complete.
4. Add an element, recurse, and remove it again.
5. For inputs with duplicates, sort and skip equal neighbours at the same level.
6. Check the count against 2^n.

## example
The Python function returns the eight subsets of `[1, 2, 3]` in the exclude-first order and 1024 subsets for ten elements. The JavaScript function with sorting and the duplicate skip returns the 6 distinct subsets of `[1, 2, 2]`.

## real
Feature toggling tests enumerate combinations of options, compilers explore subsets of optimisation passes, and recommendation systems evaluate item bundles.

## pros
- Straightforward recursive pattern
- Easily extended with pruning for constrained subsets
- Output can be streamed with O(n) memory

## cons
- Output size is exponential
- Duplicates need extra handling
- Impractical for more than about 25 elements

## uses
- Listing all selections of a set
- Subset sum and bundle search with constraints
- Generating test cases for feature combinations
- Teaching include or exclude recursion

## mistakes
- Appending the same list object instead of a copy to the result
- Producing duplicates for inputs with repeated values
- Using the loop index incorrectly so that subsets repeat in different orders
- Forgetting the empty subset

## interview
**Q:** How many subsets does a set of n elements have and why?
**A:** 2^n, because each element is either included or excluded independently.

**Q:** How do you avoid duplicate subsets when the input has repeated values?
**A:** Sort the input and, in the loop over choices at a given level, skip an element that equals the previous one, so equal values are chosen only in a consistent order.

**Q:** What is the time complexity of generating all subsets?
**A:** O(n · 2^n), as there are 2^n subsets and copying each one into the output costs up to n steps.

## summary
Subset generation decides for each element whether to include it, producing 2^n subsets in O(n · 2^n) time. Sorting plus skipping equal neighbours removes duplicates, and pruning extends it to constrained subsets.

## codenote
The Python sample uses the include or exclude recursion. The JavaScript sample uses the start index loop with duplicate handling.

## code
### python
```python
def subsets(values):
    results, path = [], []

    def explore(index):
        if index == len(values):
            results.append(path[:])
            return
        explore(index + 1)
        path.append(values[index])
        explore(index + 1)
        path.pop()

    explore(0)
    return results

result = subsets([1, 2, 3])
print(result)
print(len(result), len(subsets(list(range(10)))))
```
Output:
```text
[[], [3], [2], [2, 3], [1], [1, 3], [1, 2], [1, 2, 3]]
8 1024
```
### javascript
```javascript
function uniqueSubsets(values) {
  const sorted = [...values].sort((a, b) => a - b);
  const results = [];
  const path = [];

  function explore(start) {
    results.push([...path]);
    for (let i = start; i < sorted.length; i++) {
      if (i > start && sorted[i] === sorted[i - 1]) continue;
      path.push(sorted[i]);
      explore(i + 1);
      path.pop();
    }
  }

  explore(0);
  return results;
}

const found = uniqueSubsets([1, 2, 2]);
console.log(found.length, JSON.stringify(found));
```
Output:
```text
6 [[],[1],[1,2],[1,2,2],[2],[2,2]]
```

## quiz
1. How many subsets does a set of 10 elements have?
   - [ ] 100
   - [x] 1024
   - [ ] 3628800
   - [ ] 10
   > Each element is in or out, giving 2 to the power 10.
2. How are duplicates avoided for the input 1, 2, 2?
   - [ ] By using a hash table of numbers
   - [x] By sorting and skipping equal neighbours at the same level
   - [ ] By removing the input duplicates first
   - [ ] They cannot be avoided
   > Equal values are then chosen in only one consistent order.
3. What does the bitmask approach to subsets use?
   - [ ] A sorted list
   - [x] Numbers from 0 to 2^n − 1 whose bits mark included elements
   - [ ] A stack
   - [ ] A hash of each element
   > Every mask corresponds to exactly one subset.
4. Why is the time complexity O(n · 2^n) rather than O(2^n)?
   - [ ] The recursion is deeper
   - [x] Copying each subset into the output costs up to n steps
   - [ ] Sorting is required
   - [ ] Duplicates are checked
   > The 2^n subsets have an average length of n over 2.

# Permutations Generation
kind: algorithm
time: O(n · n!) because there are n! permutations and each one costs O(n) to record; the search tree has about e · n! nodes.
space: O(n) for the recursion stack and the working array, excluding the O(n · n!) output.

## intro
A permutation is an ordering of items, and a list of n distinct items has n factorial of them: 6 for three items, 24 for four and 3,628,800 for ten. Generating them all is the standard example of backtracking over a decision where each step picks one unused element for the next position.

## theory
Two common ways to build permutations by backtracking:

- Used flags: keep a boolean array `used` and a path; at each position try every element not yet used, append it, recurse, then pop it and clear the flag. This yields the permutations in lexicographic order if the input is sorted.
- In-place swapping: at position k, swap each element from index k to the end into position k, recurse on k + 1, and swap back. It needs no used array and no path copy beyond the final record.

For `[1, 2, 3]` the swapping method produces `[1, 2, 3]`, `[1, 3, 2]`, `[2, 1, 3]`, `[2, 3, 1]`, `[3, 2, 1]` and `[3, 1, 2]`. The count for four elements is 24. The branching shrinks with depth: n choices for the first position, n − 1 for the second and so on, which multiplies to n factorial leaves.

Permutations with duplicate values. For the string `aab` there are only three distinct permutations, `aab`, `aba` and `baa`, not six. Sort the elements and skip an element if it equals its predecessor and the predecessor is not currently used; this ensures equal elements are placed in a fixed order. With the swapping method, track the values already placed at the current position in a set and skip repeats.

Related generation tasks:

- The next permutation algorithm produces the following permutation in lexicographic order in O(n) without recursion: find the rightmost position where the sequence increases, swap with the smallest larger element to its right and reverse the suffix. Repeating it enumerates all permutations with O(1) extra space.
- Heap's algorithm generates all permutations with exactly one swap between consecutive outputs
- k-permutations (arrangements of k out of n): stop recursion at depth k, giving n!/(n − k)! results
- Permutation with constraints (for example no element in its original position, called derangements): prune partial permutations that violate the rule
- The k-th permutation can be computed directly using the factorial number system in O(n²) time, without generating the earlier ones

Practical limits: 10 items give 3.6 million permutations, 12 give 479 million and 20 give about 2.4 × 10^18, so full enumeration is only feasible for about 10 to 12 items. Problems such as the travelling salesman need pruning, dynamic programming over subsets, or heuristics.

Choosing between the two methods: the used flags method is easier to extend with constraints and to produce lexicographic order; swapping is compact and faster but changes the order of output and needs care with duplicates.

## explain
1. Decide how to track what has been used: a used array or swapping.
2. At each position, try every available element.
3. When the position reaches n, record a copy of the permutation.
4. Undo the choice (pop and unmark, or swap back).
5. For duplicates, sort the elements and skip equal ones that would repeat an arrangement.
6. Verify the count against n factorial or the multiset formula.

## example
The Python function with swapping lists the six permutations of `[1, 2, 3]` and counts 24 for `[1, 2, 3, 4]`. The JavaScript function with a used array and the duplicate rule returns the three distinct permutations `aab aba baa` of the string `aab`.

## real
Test generators try all orderings of operations, route planners evaluate visiting orders for small stop lists, and cryptanalysis tools enumerate key orderings.

## pros
- Complete enumeration of all orderings
- Easily extended with constraints and pruning
- Swapping version needs very little extra memory

## cons
- Factorial growth makes it impractical beyond about 12 items
- Duplicate handling adds complexity
- Output order depends on the method chosen

## uses
- Listing all orderings of a small set
- Brute-force search for ordering problems
- Generating test inputs
- Solving small puzzles with ordering constraints

## mistakes
- Forgetting to swap back after the recursive call
- Treating equal elements as distinct and producing repeated results
- Recording the working array without copying it
- Expecting enumeration to scale to 20 items

## interview
**Q:** How many permutations does a list of n distinct items have?
**A:** n factorial, because there are n choices for the first position, n minus 1 for the second, and so on.

**Q:** How do you generate permutations of a list with duplicate values without repeats?
**A:** Sort the list and skip an element when it equals the previous one and the previous one is not in use, so equal elements always appear in the same relative order.

**Q:** What is the complexity of generating all permutations?
**A:** O(n · n!) time, since n! permutations are produced and each takes O(n) to copy, and O(n) extra space for the recursion.

## summary
Permutation generation picks an unused element for each position, undoing the choice afterwards, and produces n! results in O(n · n!) time. Sorting and skipping equal neighbours handles duplicates.

## codenote
The Python sample uses swapping. The JavaScript sample uses used flags with duplicate handling.

## code
### python
```python
def permutations(values):
    results, work = [], list(values)

    def explore(position):
        if position == len(work):
            results.append(work[:])
            return
        for i in range(position, len(work)):
            work[position], work[i] = work[i], work[position]
            explore(position + 1)
            work[position], work[i] = work[i], work[position]

    explore(0)
    return results

print(permutations([1, 2, 3]))
print(len(permutations([1, 2, 3, 4])))
```
Output:
```text
[[1, 2, 3], [1, 3, 2], [2, 1, 3], [2, 3, 1], [3, 2, 1], [3, 1, 2]]
24
```
### javascript
```javascript
function uniquePermutations(text) {
  const chars = [...text].sort();
  const used = Array(chars.length).fill(false);
  const results = [];
  const path = [];

  function explore() {
    if (path.length === chars.length) {
      results.push(path.join(""));
      return;
    }
    for (let i = 0; i < chars.length; i++) {
      if (used[i] || (i > 0 && chars[i] === chars[i - 1] && !used[i - 1])) continue;
      used[i] = true;
      path.push(chars[i]);
      explore();
      path.pop();
      used[i] = false;
    }
  }

  explore();
  return results;
}

console.log(uniquePermutations("aab").join(" "));
```
Output:
```text
aab aba baa
```

## quiz
1. How many permutations do four distinct items have?
   - [ ] 16
   - [x] 24
   - [ ] 12
   - [ ] 4
   > Four factorial is 4 × 3 × 2 × 1.
2. Why must the swap be undone after the recursive call?
   - [ ] To save time
   - [x] So that the next choice at this position starts from the original order
   - [ ] To sort the array
   - [ ] To avoid recursion
   > Backtracking restores the state before trying the next option.
3. How many distinct permutations does the string aab have?
   - [ ] Six
   - [x] Three
   - [ ] Two
   - [ ] Nine
   > Equal letters make the six orderings collapse into three.
4. Which method generates the next permutation in lexicographic order without recursion?
   - [ ] Binary search
   - [x] The next permutation algorithm with a swap and a suffix reversal
   - [ ] Kadane's algorithm
   - [ ] Topological sort
   > It runs in linear time using O(1) extra space.

# Combinations Generation
kind: algorithm
time: O(k · C(n, k)) to produce all C(n, k) combinations of size k, since each one costs O(k) to record; the search tree itself visits fewer than twice that many nodes when pruned by the remaining count.
space: O(k) for the recursion stack and the current combination, excluding the output.

## intro
A combination is a selection of k items from n where the order does not matter, so choosing 1, 2 is the same as 2, 1. There are n! / (k! · (n − k)!) of them. Generating combinations with backtracking is the basis of subset enumeration with a size limit, lottery-style counting and many search problems.

## theory
Standard backtracking with a start index:

- Keep the current combination in a list and a `start` value, the smallest number that may be chosen next
- If the list has k items, record a copy and return
- Otherwise loop `i` from `start` to n, append i, recurse with `start = i + 1`, and pop i

Because the loop never looks back, each combination appears once in increasing order, and the order of choosing is never permuted. For n = 4 and k = 2 the result is `[1, 2]`, `[1, 3]`, `[1, 4]`, `[2, 3]`, `[2, 4]` and `[3, 4]`: six combinations, matching C(4, 2) = 6.

Counting: C(n, k) = C(n − 1, k − 1) + C(n − 1, k), which mirrors the include or exclude recursion, and C(10, 3) = 120. Backtracking enumerates them; the binomial formula only counts them. The values grow fast: C(30, 15) is already over 155 million.

Pruning by remaining count. If the combination needs r more items and only m numbers remain in the range, then stop when m is less than r. This changes the loop bound to `i <= n − (k − len(path)) + 1`. For n = 5 and k = 3 this limit prevents starting a combination at 4 or 5, since not enough numbers would remain, and yields exactly C(5, 3) = 10 combinations (`123 124 125 134 135 145 234 235 245 345`) without dead ends. The first four are `123 124 125 134`.

Variations:

- Combination sum: choose from candidates until a target sum is reached, with or without repetition, pruning when the sum exceeds the target
- Combinations of a multiset: sort and skip equal neighbours at each level
- Letter combinations of a phone number: a product over digits rather than a start index
- k-subsets of an array by index rather than values
- Iterative generation in lexicographic order with an index array (increment the rightmost index that can still increase)
- Gosper's hack enumerates all bitmasks with exactly k ones in increasing order, useful for dynamic programming over subsets of fixed size

Contrast with permutations: combinations ignore order, so the loop moves only forward; permutations need all unused elements at every step. The numbers differ by the factor k!: choosing 3 of 10 gives 120 combinations but 720 arrangements.

Typical use of bounds: when the target is a sum, sorting the candidates lets the loop break at the first candidate that is too large. When k is close to n, enumerate the complement instead, because choosing k items equals leaving out n − k.

Applications: poker hand analysis, choosing teams, testing pairs and triples of features in software, and the inner loop of many exhaustive searches.

## explain
1. Decide the range of values and the size k.
2. Use a start index so each combination is built in increasing order.
3. When the current list has k items, record a copy.
4. Loop from the start index, add the value, recurse with start plus one, and remove the value.
5. Limit the loop so that enough values remain to fill the combination.
6. Check the count against the binomial coefficient.

## example
The Python function returns the six combinations `[1, 2]` to `[3, 4]` for n = 4 and k = 2, and it finds 120 combinations for n = 10 and k = 3, matching the binomial coefficient 120. The JavaScript function with the pruned loop returns 10 combinations for n = 5 and k = 3, beginning `123 124 125 134`.

## real
Sampling tools pick k records out of n, bioinformatics pipelines test combinations of genes, and test frameworks use pairwise or triple combination of parameters.

## pros
- Produces each combination exactly once
- Pruning by remaining count removes dead ends
- Same skeleton extends to sum and constraint problems

## cons
- The number of results grows combinatorially
- Duplicate values need extra care
- Order-sensitive problems need permutations instead

## uses
- Selecting k items from n
- Combination sum and target problems
- Pairwise and triple testing of options
- Exhaustive search over fixed-size subsets

## mistakes
- Starting each recursive call at the beginning, which creates permutations and duplicates
- Using start plus zero instead of start plus one and repeating an element
- Not limiting the loop, which wastes time on branches that cannot be completed
- Forgetting to copy the list when recording a result

## interview
**Q:** How do you generate all combinations of k numbers out of 1 to n?
**A:** Use backtracking with a start index: add a number, recurse with the next index, remove the number, and record the list when it has k elements.

**Q:** How can you prune the search for combinations?
**A:** Stop the loop when the numbers remaining are fewer than the places left to fill, so branches that cannot reach size k are never expanded.

**Q:** How do combinations differ from permutations?
**A:** Combinations ignore order, so each set is produced once, while permutations count every ordering; the ratio is k factorial.

## summary
Combination generation uses a start index so each selection appears once in increasing order, with a loop bound that prunes branches without enough remaining values. The number of results is the binomial coefficient.

## codenote
The Python sample generates combinations and counts them. The JavaScript sample adds the remaining-count bound.

## code
### python
```python
import math

def combinations(n, k):
    results, path = [], []

    def explore(start):
        if len(path) == k:
            results.append(path[:])
            return
        for value in range(start, n + 1):
            path.append(value)
            explore(value + 1)
            path.pop()

    explore(1)
    return results

print(combinations(4, 2))
print(len(combinations(10, 3)), math.comb(10, 3))
```
Output:
```text
[[1, 2], [1, 3], [1, 4], [2, 3], [2, 4], [3, 4]]
120 120
```
### javascript
```javascript
function combine(n, k) {
  const results = [];
  const path = [];

  function explore(start) {
    if (path.length === k) {
      results.push(path.join(""));
      return;
    }
    for (let value = start; value <= n - (k - path.length) + 1; value++) {
      path.push(value);
      explore(value + 1);
      path.pop();
    }
  }

  explore(1);
  return results;
}

const found = combine(5, 3);
console.log(found.length, found.slice(0, 4).join(" "));
```
Output:
```text
10 123 124 125 134
```

## quiz
1. How many combinations of 2 items can be chosen from 4?
   - [ ] 4
   - [x] 6
   - [ ] 8
   - [ ] 12
   > The binomial coefficient C(4, 2) equals 6.
2. Why does the recursion pass start plus one?
   - [ ] To skip the last element
   - [x] To prevent reusing an element and building the same set in another order
   - [ ] To reverse the order
   - [ ] To avoid the base case
   > Moving only forward gives each combination exactly once.
3. What prunes combination search?
   - [ ] Sorting the results
   - [x] Stopping when too few values remain to fill the combination
   - [ ] Using a hash set of results
   - [ ] Reversing the loop
   > A branch that cannot reach size k is never expanded.
4. How many arrangements correspond to one combination of size 3?
   - [ ] 3
   - [x] 6
   - [ ] 9
   - [ ] 1
   > Three items can be ordered in 3 factorial ways.

# N Queens Problem
kind: algorithm
time: Exponential — the pruned search for n queens visits roughly O(n!) nodes in the worst case, far fewer than n^n; counting all solutions for n = 8 visits 2057 nodes and finds 92 solutions.
space: O(n) for the recursion stack, the chosen columns and the sets of occupied columns and diagonals.
practice: n-queens-count

## intro
Place n chess queens on an n by n board so that no two attack each other: no two share a row, a column or a diagonal. It is the classic backtracking problem, small enough to code in minutes yet rich enough to show how early pruning shrinks an astronomically large search space.

## theory
Modelling: since each row can hold at most one queen, and a solution needs n queens, exactly one queen sits in each row. A partial solution is the list of columns chosen for rows 0 to r − 1. The decision at row r is which column to use, and a column c is valid if it is not attacked by any earlier queen.

Attack checks in O(1) with sets:

- Column: `c` is not in the set of used columns
- Main diagonal: all cells on one diagonal share the value `r − c`, so keep a set of used `r − c` values
- Anti-diagonal: cells on the other diagonal share `r + c`, so keep a set of used `r + c` values

Algorithm:

- If r equals n, a full solution exists: count it or save the board
- For each column c from 0 to n − 1, skip it if column, diagonal or anti-diagonal is taken; otherwise place the queen (add c, r − c, r + c to the sets), recurse on row r + 1, and remove them again

Known results: the number of solutions for n = 1 to 8 is 1, 0, 0, 2, 10, 4, 40 and 92. There are no solutions for n = 2 and n = 3. The first solution found for n = 6 is the columns `[1, 3, 5, 0, 2, 4]`, meaning the queen in row 0 is in column 1, in row 1 in column 3, and so on.

Why pruning matters: placing 8 queens anywhere on 64 squares gives about 4.4 billion arrangements; one queen per row gives 8^8 = 16,777,216; the column constraint reduces it to 8! = 40,320 permutations; and the backtracking search with diagonal checks visits only 2057 nodes in total for n = 8 (17 for n = 4 and 153 for n = 6). Each rejected placement removes an entire subtree.

Improvements:

- Symmetry: the board has 8 symmetries (rotations and reflections), so one can find the fundamental solutions (12 for n = 8) and generate the rest. A simple use is to place the first queen only in the left half of the first row and double the count (adding the middle column once for odd n).
- Bitmasks: represent columns and diagonals as bits of integers and compute the available positions with bitwise operations; this makes the fastest known counters, which handle n = 15 or more in seconds
- Heuristics for large n: min-conflicts local search places a million queens quickly by repairing conflicts rather than searching systematically
- The problem has solutions for all n at least 4, and explicit constructions exist for any n

Variations: print all boards, count solutions, find one solution (stop at the first), n queens with obstacles, and queens that must also avoid specified squares.

Output format: a board is often shown as strings of dots and Q, built from the column list: row r has Q at column cols[r].

## explain
1. Place queens row by row, one per row.
2. Keep sets for occupied columns, diagonals (row minus column) and anti-diagonals (row plus column).
3. For the current row, try each column that is not attacked.
4. Place the queen, recurse on the next row, and remove the queen afterwards.
5. When all rows are filled, record the solution or increase the count.
6. Verify known counts such as 92 for n = 8.

## example
The Python solver counts the solutions for n = 1 to 8 as 1, 0, 0, 2, 10, 4, 40, 92 and returns `[1, 3, 5, 0, 2, 4]` as the first solution for n = 6. The JavaScript solver also counts the search nodes: 2 solutions for n = 4 after 17 nodes, and 92 solutions for n = 8 after 2057 nodes.

## real
The problem is a standard benchmark for constraint solvers and backtracking implementations, and its techniques appear in scheduling, register allocation and layout problems where objects must not conflict.

## pros
- Shows how constraints prune the search dramatically
- O(1) conflict checks with sets or bitmasks
- Extends naturally to counting and printing solutions

## cons
- Still exponential for large n
- Symmetry handling complicates the code
- Printing all solutions is infeasible for large boards

## uses
- Teaching backtracking and pruning
- Benchmarking constraint solvers
- Modelling placement problems with conflicts
- Practising set and bitmask techniques

## mistakes
- Checking diagonals with an O(n) loop at every step instead of O(1) sets
- Forgetting to remove the queen's entries from the sets after recursion
- Using the wrong diagonal formula, such as mixing row minus column with row plus column
- Searching all 64 squares instead of one queen per row

## interview
**Q:** How do you represent attacks in the n queens problem efficiently?
**A:** Keep sets of used columns, of row minus column values for one diagonal direction, and of row plus column values for the other, so each placement check takes constant time.

**Q:** Why can the search go row by row?
**A:** Two queens cannot share a row, and n queens need n rows, so exactly one queen is in each row, which cuts the search from all squares to one choice per row.

**Q:** How many solutions does the 8 queens problem have?
**A:** 92 solutions in total, of which 12 are distinct when rotations and reflections are considered the same.

## summary
N queens places one queen per row and uses sets for columns and diagonals to reject conflicting squares at once, pruning most of the search. For n = 8 the search finds 92 solutions after 2057 nodes instead of examining millions of boards.

## codenote
The Python sample counts solutions for small boards. The JavaScript sample also counts the search nodes.

## code
### python
```python
def solve(n):
    columns, diagonals, anti = set(), set(), set()
    path, state = [], {"count": 0, "first": None}

    def place(row):
        if row == n:
            state["count"] += 1
            if state["first"] is None:
                state["first"] = path[:]
            return
        for col in range(n):
            if col in columns or row - col in diagonals or row + col in anti:
                continue
            columns.add(col)
            diagonals.add(row - col)
            anti.add(row + col)
            path.append(col)
            place(row + 1)
            path.pop()
            columns.remove(col)
            diagonals.remove(row - col)
            anti.remove(row + col)

    place(0)
    return state["count"], state["first"]

print([solve(n)[0] for n in range(1, 9)])
print(solve(6)[1])
```
Output:
```text
[1, 0, 0, 2, 10, 4, 40, 92]
[1, 3, 5, 0, 2, 4]
```
### javascript
```javascript
function queens(n) {
  const columns = new Set();
  const diagonals = new Set();
  const anti = new Set();
  let count = 0;
  let nodes = 0;

  function place(row) {
    nodes++;
    if (row === n) {
      count++;
      return;
    }
    for (let col = 0; col < n; col++) {
      if (columns.has(col) || diagonals.has(row - col) || anti.has(row + col)) continue;
      columns.add(col);
      diagonals.add(row - col);
      anti.add(row + col);
      place(row + 1);
      columns.delete(col);
      diagonals.delete(row - col);
      anti.delete(row + col);
    }
  }

  place(0);
  return [count, nodes];
}

console.log(queens(4).join(" "));
console.log(queens(8).join(" "));
```
Output:
```text
2 17
92 2057
```

## quiz
1. How many queens can a valid solution place in each row?
   - [ ] Two
   - [x] Exactly one
   - [ ] None
   - [ ] As many as columns
   > Two queens in a row would attack each other.
2. Which value is shared by all cells on one diagonal?
   - [ ] Row plus column on every diagonal
   - [x] Row minus column on one direction and row plus column on the other
   - [ ] Column only
   - [ ] Row only
   > Each diagonal direction has its own constant.
3. How many solutions does the 8 queens puzzle have?
   - [ ] 12
   - [x] 92
   - [ ] 40
   - [ ] 64
   > Twelve of them are distinct up to rotation and reflection.
4. For which board size does the puzzle have no solutions besides n = 2?
   - [ ] n = 4
   - [x] n = 3
   - [ ] n = 5
   - [ ] n = 6
   > Neither a 2 by 2 nor a 3 by 3 board can hold the queens.

# Sudoku Solver
kind: algorithm
time: Exponential in the worst case, O(9^m) for m empty cells, but constraint checks and good ordering make typical puzzles solve in milliseconds; the classic sample puzzle needs 4208 placements.
space: O(m) for the recursion stack, plus O(1) for the 9 by 9 grid that is modified in place.

## intro
A sudoku puzzle is a 9 by 9 grid in which every row, every column and every 3 by 3 box must contain the digits 1 to 9 exactly once. A solver fills the empty cells by backtracking: pick an empty cell, try each digit that does not conflict with the numbers already placed, recurse, and undo the digit if the rest of the puzzle becomes impossible.

## theory
Constraints: a digit v may be placed at (r, c) only if v does not already appear in row r, in column c, or in the 3 by 3 box whose top-left corner is `(3·(r div 3), 3·(c div 3))`.

Basic algorithm:

- Find the next empty cell, scanning row by row; if none exists, the puzzle is solved
- For each digit from 1 to 9, if placing it is legal, write it into the cell and recurse
- If the recursion succeeds, return success immediately; otherwise reset the cell to empty (the backtrack) and try the next digit
- If no digit works, return failure to the caller, which retries with its next digit

The function returns a boolean so that success propagates up and stops the search at the first solution, leaving the solved grid in place. For the well-known puzzle whose first row is `530070000`, the solver finds the unique solution, with the first row `534678912` and the last row `345286179`, after 4208 successful placements (digits placed, including those later undone).

Speeding up:

- Keep bitmasks or sets for every row, column and box so the validity check is O(1) instead of scanning 27 cells
- Choose the empty cell with the fewest legal candidates first (the most constrained variable heuristic), which fails earlier and often solves hard puzzles with a tiny search
- Apply constraint propagation before and during the search (see the later lesson): fill cells that have only one candidate, and digits that fit in only one place of a row, column or box
- Exact cover formulation with Knuth's dancing links solves any sudoku in a fraction of a millisecond

Uniqueness and validity: a proper puzzle has exactly one solution; to check, continue the search after the first solution and count up to two. A puzzle generator removes digits from a full grid while testing that the solution count stays at one.

Validity checks of the first grid: the helper that tests a placement is also used to validate input. For the sample puzzle, the digit 1 can be placed at row 0, column 2, but 5 cannot (5 is already in the row) and neither can 8 (8 is already in the top-left box).

Generalisations: 16 by 16 grids (hexadecimal sudoku), irregular regions, additional diagonal constraints (sudoku X) and the general problem of Latin squares. Solving n squared by n squared sudoku is NP-complete.

Testing: use puzzles with a known solution, an unsolvable puzzle (the solver must return false and leave the grid unchanged) and an already complete grid.

## explain
1. Find the first empty cell, or declare the puzzle solved if none remain.
2. Try digits 1 to 9 and keep those that do not appear in the row, column or box.
3. Place a digit and recurse on the rest of the grid.
4. If the recursion fails, clear the cell and try the next digit.
5. If no digit fits, return failure to the previous cell.
6. Speed up with candidate sets and by choosing the most constrained cell first.

## example
The Python solver fills the standard sample puzzle in place and reports `True`, the first row 534678912, the last row 345286179 and 4208 placements. The JavaScript helper checks single placements on the unsolved puzzle: digit 1 can go at row 0, column 2, while 5 and 8 cannot, so it prints `true false false`.

## real
Puzzle apps use backtracking solvers to check puzzles and to give hints, and the same constraint-search approach appears in timetabling, resource assignment and configuration tools.

## pros
- Short and general backtracking solution
- Solves any valid puzzle given enough time
- Easy to speed up with candidate sets and heuristics

## cons
- Exponential in the worst case
- Naive cell ordering explores many dead ends
- Needs a separate approach to prove uniqueness

## uses
- Solving and checking sudoku puzzles
- Generating puzzles with a unique solution
- Teaching constraint satisfaction
- Modelling grid-based assignment problems

## mistakes
- Forgetting to reset a cell to empty after a failed recursion
- Calculating the box corner incorrectly
- Not returning a boolean, so the search continues after the solution is found
- Scanning from the start for each cell instead of keeping candidate sets

## interview
**Q:** How does a backtracking sudoku solver work?
**A:** It finds an empty cell, tries each digit not conflicting with its row, column and box, recurses on the next empty cell, and resets the cell if the recursion fails, returning true as soon as the grid is full.

**Q:** How can you make the solver faster?
**A:** Track used digits per row, column and box with bitmasks, and choose the empty cell with the fewest candidates first, together with constraint propagation for single candidates.

**Q:** How do you find the box that contains a cell?
**A:** Use the integer division of the row and the column by 3, which gives the top-left corner of the box as three times each result.

## summary
A sudoku solver fills empty cells with legal digits, recurses, and clears the cell on failure, stopping at the first full grid. Candidate sets and choosing the most constrained cell first make it fast in practice.

## codenote
The Python sample solves a standard puzzle. The JavaScript sample checks placements.

## code
### python
```python
PUZZLE = ["530070000", "600195000", "098000060", "800060003",
          "400803001", "700020006", "060000280", "000419005", "000080079"]
grid = [[int(ch) for ch in row] for row in PUZZLE]
placements = 0

def legal(r, c, v):
    if any(grid[r][i] == v or grid[i][c] == v for i in range(9)):
        return False
    top, left = 3 * (r // 3), 3 * (c // 3)
    return all(grid[top + i][left + j] != v for i in range(3) for j in range(3))

def solve():
    global placements
    for r in range(9):
        for c in range(9):
            if grid[r][c] == 0:
                for v in range(1, 10):
                    if legal(r, c, v):
                        grid[r][c] = v
                        placements += 1
                        if solve():
                            return True
                        grid[r][c] = 0
                return False
    return True

print(solve(), "".join(map(str, grid[0])), "".join(map(str, grid[8])), placements)
```
Output:
```text
True 534678912 345286179 4208
```
### javascript
```javascript
const rows = ["530070000", "600195000", "098000060", "800060003",
  "400803001", "700020006", "060000280", "000419005", "000080079"].map((r) => [...r].map(Number));

function canPlace(grid, r, c, v) {
  for (let i = 0; i < 9; i++) {
    if (grid[r][i] === v || grid[i][c] === v) return false;
  }
  const top = r - (r % 3);
  const left = c - (c % 3);
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (grid[top + i][left + j] === v) return false;
    }
  }
  return true;
}

console.log(canPlace(rows, 0, 2, 1), canPlace(rows, 0, 2, 5), canPlace(rows, 0, 2, 8));
```
Output:
```text
true false false
```

## quiz
1. Which three groups must contain each digit once in sudoku?
   - [ ] Diagonals, rows and corners
   - [x] Rows, columns and 3 by 3 boxes
   - [ ] Odd cells, even cells and borders
   - [ ] Pairs, triples and quads
   > These are the three constraint groups of the puzzle.
2. What does the solver do when no digit fits a cell?
   - [ ] Picks a random digit
   - [x] Returns failure so the previous cell tries its next digit
   - [ ] Skips the cell
   - [ ] Ends with a solution
   > Failure propagates upward until a different digit works.
3. Why does the solve function return a boolean?
   - [ ] To count the digits
   - [x] To stop the search at the first complete grid
   - [ ] To sort the cells
   - [ ] To print the answer
   > Success travels up the recursion, leaving the grid solved.
4. What is the most constrained variable heuristic?
   - [ ] Fill cells in reading order
   - [x] Choose the empty cell with the fewest legal digits next
   - [ ] Choose the cell with the most digits
   - [ ] Fill the corners first
   > It fails early and shrinks the search tree.
