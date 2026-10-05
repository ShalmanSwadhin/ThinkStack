# Space Complexity
kind: algorithm
time: O(n) to build a reversed copy of n items, O(n) to reverse in place, and O(n) for the recursive sum; the lesson is about memory, so these are the time costs that accompany the space costs below.
space: O(1) auxiliary space for the in-place reversal, O(n) for the reversed copy, and O(n) call-stack space for the recursive sum of depth n.

## intro
Time is not the only resource an algorithm consumes. Space complexity describes how much memory it needs as the input grows, and it often decides whether a solution is usable: a program that is fast but needs more memory than the machine has simply fails.

## theory
Definitions:

- Total space is everything the algorithm uses, including the input
- Auxiliary space is the extra memory beyond the input. When people ask for space complexity, they usually mean auxiliary space. An algorithm is "in place" if its auxiliary space is O(1).
- Space is measured in the same asymptotic way as time: how it grows with n, ignoring constants

What contributes to space:

- Variables and data structures created by the algorithm: copies of the input, hash tables, result lists
- The call stack in recursion: one frame per pending call, so a recursion of depth d needs O(d) space. Binary search written recursively uses O(log n) stack, and a naive recursive sum or list traversal uses O(n).
- Output size is sometimes excluded when it is required by the problem; say which convention you use
- Hidden allocations: slicing, string concatenation, list comprehensions and sorted() all create new objects

Examples:

- Linear scan to find the maximum: O(1)
- Reversing in place with two pointers: O(1); reversing into a new list: O(n)
- Merge sort: O(n) for the temporary arrays; heap sort: O(1); quicksort: O(log n) average for the recursion stack
- Hash table of n entries: O(n); a two-dimensional dynamic programming table: O(rows times columns); with a rolling row: O(columns)
- Breadth-first search: O(width of the graph) for the queue; depth-first search: O(depth) for the stack

Time and space trade-offs are common: a hash set uses O(n) memory to turn an O(n²) duplicate search into O(n); memoization uses a table to replace repeated work; compression trades time for space. Memory also costs time through caching: large working sets cause cache misses and paging.

Measuring: in Python `tracemalloc` reports allocated memory; in other languages use profilers. Typed arrays and packed structures reduce constants: a Float64Array of 1,000 numbers uses 8,000 bytes while an Int8Array uses 1,000.

## explain
1. Identify the data structures the algorithm creates and how their sizes depend on n.
2. Add the maximum depth of recursion, since each pending call keeps a frame.
3. Decide whether to include the input and the output; state the convention.
4. Keep the dominant term and drop constants.
5. Look for hidden copies such as slices and string building.
6. Consider whether a time-space trade-off helps: more memory for speed, or the reverse.

## example
The recursive `sum_rec(100)` keeps up to 101 frames alive at once (for n from 100 down to 0), which the depth counter reports. A reversed copy of a 100,000-element list allocates at least 800,000 bytes for the new list's pointers, while reversing the list in place allocates almost nothing, which the tracemalloc peaks confirm. The JavaScript lines compare the byte size of typed arrays with 1,000 elements: 8,000 bytes for 64-bit floats and 1,000 bytes for 8-bit integers.

## real
Embedded devices, mobile apps and large-scale data processing are limited by memory long before time, and database and streaming systems are designed around algorithms that process data in a single pass with bounded memory.

## pros
- Predicts memory needs before running on large data
- Shows when an in-place or streaming approach is needed
- Reveals time-space trade-offs

## cons
- Hidden allocations and stack use are easy to overlook
- Conventions about counting input and output vary
- Real memory use includes overheads that Big O ignores

## uses
- Choosing between a copy and an in-place algorithm
- Estimating recursion depth and stack use
- Sizing memory for hash tables and tables of dynamic programming
- Designing streaming and external-memory algorithms

## mistakes
- Forgetting the call stack in recursive algorithms
- Ignoring the copies made by slicing and concatenation
- Mixing total and auxiliary space in comparisons
- Trading memory for speed without checking that the memory is available

## interview
**Q:** What is the difference between auxiliary space and total space?
**A:** Total space includes the input, while auxiliary space counts only the extra memory the algorithm allocates. Space complexity analysis usually reports auxiliary space.

**Q:** What is the space complexity of a recursive function of depth n?
**A:** O(n), since every pending call holds a stack frame until it returns.

**Q:** Give an example of a time-space trade-off.
**A:** Using a hash set to detect duplicates uses O(n) extra memory but runs in O(n) time, whereas comparing every pair needs only O(1) extra memory but takes O(n squared) time.

## summary
Space complexity measures extra memory growth, including data structures, copies and the recursion stack. Prefer in-place and streaming designs when memory is tight, and weigh space against time.

## codenote
The Python sample measures recursion depth and the memory allocated by a copy versus an in-place reversal. The JavaScript sample compares typed array sizes.

## code
### python
```python
import tracemalloc

depth = deepest = 0

def sum_rec(n):
    global depth, deepest
    depth += 1
    deepest = max(deepest, depth)
    result = 0 if n == 0 else n + sum_rec(n - 1)
    depth -= 1
    return result

sum_rec(100)
print(deepest)

items = list(range(100000))

def peak(action):
    tracemalloc.start()
    action()
    _, highest = tracemalloc.get_traced_memory()
    tracemalloc.stop()
    return highest

print(peak(lambda: items[::-1]) >= 800_000, peak(lambda: items.reverse()) < 10_000)
```
Output:
```text
101
True True
```
### javascript
```javascript
console.log(new Float64Array(1000).byteLength, new Int8Array(1000).byteLength);
```
Output:
```text
8000 1000
```

## quiz
1. What does auxiliary space mean?
   - [ ] The size of the input
   - [x] The extra memory used beyond the input
   - [ ] The size of the output only
   - [ ] The disk space of the program
   > It excludes the input itself.
2. What is the space used by a recursion of depth d?
   - [ ] O(1)
   - [x] O(d) for the stack frames
   - [ ] O(log d)
   - [ ] O(d squared)
   > Each pending call keeps one frame.
3. Which reversal uses O(1) auxiliary space?
   - [ ] Building a new reversed list
   - [x] Swapping elements in place with two pointers
   - [ ] Slicing with a negative step
   - [ ] Sorting in descending order into a new list
   > Only a few index variables are needed.
4. What trade-off does a hash set make when detecting duplicates?
   - [ ] More time for less memory
   - [x] More memory for less time
   - [ ] No trade-off
   - [ ] Less memory and less correctness
   > O(n) extra space replaces an O(n squared) pair search.

# Amortized Analysis Intro
kind: algorithm
time: O(1) amortised per append to a dynamic array, even though an individual append that triggers a resize costs O(n); a binary counter increment costs O(1) amortised, with a total of fewer than 2n bit flips for n increments.
space: O(n) for the array, which may hold up to twice as much capacity as elements; O(log n) bits for the counter.

## intro
Some operations are cheap most of the time and expensive occasionally. Judged by the worst single call, they look costly, yet a long sequence of them is cheap on average. Amortised analysis averages the cost over a sequence of operations, giving a guarantee that does not depend on luck or on assumptions about the input.

## theory
Amortised cost is the total cost of a sequence of n operations divided by n, in the worst case over sequences. It differs from average-case analysis, which averages over random inputs: amortised bounds hold for every sequence of operations.

Classic example: appending to a dynamic array that doubles its capacity when full.

- Most appends write one slot: cost 1
- When the array is full, a resize copies all k current elements into a new array of size 2k: cost k
- For n appends starting from capacity 1, resizes happen at sizes 1, 2, 4, ..., so the total copying is `1 + 2 + 4 + ... + n/2 < n`
- The total cost is under 3n, so the amortised cost per append is O(1)

For n = 1000, the resizes copy 1 + 2 + ... + 512 = 1,023 elements and the 1,000 writes cost 1,000, a total of 2,023: about 2.02 per append.

Methods of proof:

- Aggregate method: compute the total cost of n operations and divide by n (as above)
- Accounting (banker's) method: charge each operation a fixed amount, store unused credit with elements and use it to pay for expensive operations later. Charging 3 per append to a doubling array pays for the write, for copying the element at the next resize and for copying one older element.
- Potential method: define a potential function on the data structure state, whose increase pays for later expensive steps. For the dynamic array the potential is twice the number of elements minus the capacity.

Another example: a binary counter. Incrementing flips the trailing 1 bits to 0 and one 0 bit to 1, which can cost as many as log n flips, but each bit flips from 0 to 1 at most once per flip back, so n increments cost fewer than 2n flips in total: O(1) amortised.

Other amortised structures: hash tables that resize, splay trees, union-find with path compression (nearly constant amortised), stacks with multipop, queues built from two stacks, and the lazy rebuilding in many persistent structures.

Limits: amortised bounds say nothing about a single operation, which can still be slow. For latency-sensitive systems that cannot tolerate occasional spikes, use structures with worst-case guarantees, or spread out the expensive work incrementally.

## explain
1. Identify the expensive operation and how often it occurs.
2. Compute the total cost of a long sequence of operations, summing the cheap and expensive ones.
3. Divide by the number of operations to get the amortised cost.
4. If the sum is awkward, use the accounting method: assign a charge and show the credit never goes negative.
5. State the result as amortised O(f), distinguishing it from worst case per operation.
6. Consider whether spikes matter for your application.

## example
The Python program simulates 1,000 appends to an array of capacity 1 that doubles when full. It counts 1,023 copied elements, a total cost of 2,023 with the writes included, and an average of 2.023 per append. The JavaScript program increments an eight-bit counter 16 times and counts bit flips, getting 31 flips in total, fewer than 2 times 16 = 32, so each increment costs less than 2 flips on average even though one increment flipped 5 bits.

## real
Standard libraries document appends to vectors and lists as amortised constant time, hash tables as amortised constant time inserts, and interviewers often ask why that is true.

## pros
- Gives a guarantee for any sequence of operations
- Explains why common structures are fast
- Provides several proof techniques

## cons
- Says nothing about the cost of a single operation
- Spikes can be a problem for real-time systems
- Potential functions can be hard to find

## uses
- Analysing dynamic arrays and hash tables
- Justifying the cost of counters and stacks with extra operations
- Choosing data structures for sequences of operations
- Explaining library complexity guarantees

## mistakes
- Treating amortised cost as average-case cost over random input
- Assuming every single operation is fast
- Growing the array by a fixed amount, which loses the constant amortised cost
- Forgetting the cost of the occasional expensive step in latency-sensitive code

## interview
**Q:** What is amortised analysis?
**A:** Averaging the cost of operations over a worst-case sequence, so that expensive operations are paid for by many cheap ones, giving a bound per operation that holds for every sequence.

**Q:** Why is appending to a dynamic array O(1) amortised?
**A:** Resizing doubles the capacity, so the total copying over n appends is less than n; the total cost of n appends is O(n) and the average per append is constant.

**Q:** How does amortised analysis differ from average-case analysis?
**A:** Average-case analysis averages over a distribution of inputs, whereas amortised analysis averages over a sequence of operations and holds in the worst case without any probabilistic assumption.

## summary
Amortised analysis averages cost over a sequence of operations. Dynamic arrays and counters are cheap per operation on average even though single operations can be expensive, and the guarantee holds for every sequence.

## codenote
The Python sample counts the cost of 1,000 appends to a doubling array. The JavaScript sample counts bit flips of a binary counter.

## code
### python
```python
capacity, size, copies = 1, 0, 0
for _ in range(1000):
    if size == capacity:
        copies += size
        capacity *= 2
    size += 1

total = copies + 1000
print(copies, total, total / 1000)
```
Output:
```text
1023 2023 2.023
```
### javascript
```javascript
const bits = new Array(8).fill(0);
let flips = 0;

for (let i = 0; i < 16; i++) {
  let j = 0;
  while (j < bits.length && bits[j] === 1) {
    bits[j] = 0;
    flips++;
    j++;
  }
  if (j < bits.length) {
    bits[j] = 1;
    flips++;
  }
}
console.log(flips, 2 * 16);
```
Output:
```text
31 32
```

## quiz
1. What does amortised O(1) mean for dynamic array appends?
   - [ ] Every append takes exactly one step
   - [x] The average cost per append over any sequence of appends is constant
   - [ ] Appends are fast on random data only
   - [ ] The array never resizes
   > Expensive resizes are paid for by many cheap appends.
2. Why does doubling the capacity give constant amortised cost?
   - [ ] Because arrays are fast
   - [x] The total copying over n appends is less than n elements
   - [ ] Because memory is free
   - [ ] Because the array is sorted
   > The copy sizes form a geometric series.
3. How does amortised analysis differ from average-case analysis?
   - [ ] They are the same
   - [x] Amortised analysis holds for every sequence of operations without assuming a distribution
   - [ ] Average case is a guarantee, amortised is not
   - [ ] Amortised analysis applies only to sorting
   > It is a worst-case bound on the sequence.
4. What does amortised analysis not guarantee?
   - [ ] The total cost of a sequence
   - [x] That each individual operation is cheap
   - [ ] A bound for all sequences
   - [ ] A bound per operation on average
   > A single operation can still be expensive.

# Master Theorem Overview
kind: concept
time: Not an algorithmic topic — the master theorem is a tool for solving recurrences that describe the running time of divide-and-conquer algorithms, not an algorithm itself.
space: Not an algorithmic topic — the theorem concerns time recurrences, though similar reasoning bounds the recursion depth.

## intro
Many divide-and-conquer algorithms have running times that satisfy a recurrence of the form T(n) = aT(n/b) + f(n): solve a smaller problems of size n/b, then spend f(n) work to split and combine. The master theorem reads off the solution for the common cases without drawing a recursion tree each time.

## theory
Setting: `T(n) = a * T(n / b) + f(n)` with a ≥ 1 subproblems, each of size n / b with b > 1, and f(n) the cost of dividing and combining. The key quantity is the critical exponent `log_b(a)`, which measures how fast the number of leaves of the recursion tree grows: there are about `n^(log_b a)` leaves.

For the common case `f(n) = n^d` (a polynomial), compare d with log_b(a):

- Case 1, leaves dominate: d < log_b(a). Then `T(n) = Θ(n^(log_b a))`. Example: T(n) = 8T(n/2) + n² gives Θ(n³).
- Case 2, balanced: d = log_b(a). Every level of the tree does the same work, and there are about log n levels. Then `T(n) = Θ(n^d log n)`. Examples: merge sort T(n) = 2T(n/2) + n gives Θ(n log n); binary search T(n) = T(n/2) + 1 gives Θ(log n).
- Case 3, root dominates: d > log_b(a), subject to a regularity condition. Then `T(n) = Θ(n^d)`. Example: T(n) = T(n/2) + n gives Θ(n).

The general theorem uses `f(n) = O(n^(log_b a - ε))`, `Θ(n^(log_b a))` and `Ω(n^(log_b a + ε))` for the three cases, plus the regularity condition `a f(n/b) <= c f(n)` for some constant c below 1 in case 3.

More examples: Strassen's matrix multiplication T(n) = 7T(n/2) + n² gives Θ(n^(log₂ 7)) ≈ Θ(n^2.81); naive divide-and-conquer multiplication T(n) = 8T(n/2) + n² gives Θ(n³), no better than the standard algorithm; T(n) = 4T(n/2) + n gives Θ(n²).

Limits: the theorem does not cover recurrences where subproblems have different sizes (quicksort with a bad split, T(n) = T(n-1) + n), non-polynomial f(n) between cases, or a that is not constant. For those, use the recursion tree, substitution, or the Akra-Bazzi generalisation.

## explain
1. Write the recurrence from the algorithm: how many subproblems a, what fraction n / b, and the cost f(n) of the non-recursive work.
2. Compute the critical exponent log base b of a.
3. Compare it with the exponent d of f(n).
4. Apply the matching case to read off the bound.
5. Check that the recurrence has the required form; otherwise use another method.
6. Sanity-check with small values or a recursion tree.

## example
The Python function `master(a, b, d)` classifies recurrences of the form T(n) = aT(n/b) + n^d. Merge sort (2, 2, 1) is balanced and gives n to the power 1 times log n, binary search (1, 2, 0) gives log n, Strassen (7, 2, 2) gives about n to the power 2.81, the eight-way split (8, 2, 2) gives n cubed, and T(n) = T(n/2) + n (1, 2, 1) gives n. The JavaScript program evaluates T(n) = 2T(n/2) + n directly for n = 1024 and compares the result 11,264 with the closed form n log₂ n + n.

## real
The theorem is the standard shortcut for analysing sorting, searching, multiplication and many geometric algorithms, and it is often used in algorithm courses and interviews to justify a bound quickly.

## pros
- Gives the answer for many recurrences in seconds
- Explains why merge sort and binary search have their costs
- Shows how splitting and combining costs trade off

## cons
- Applies only to recurrences of the specific form
- Gaps between the cases are not covered
- Easy to misapply without checking conditions

## uses
- Deriving the running time of divide-and-conquer algorithms
- Comparing alternative splitting strategies
- Checking claims of improved multiplication algorithms
- Teaching recurrences

## mistakes
- Applying it to recurrences like T(n) = T(n minus 1) plus n
- Comparing the wrong exponents
- Forgetting the regularity condition in the third case
- Mixing up the number of subproblems and the size reduction factor

## interview
**Q:** State the three cases of the master theorem for T(n) = aT(n/b) + n^d.
**A:** If d is less than log base b of a, the result is Theta of n to the log base b of a. If they are equal, the result is Theta of n to the d times log n. If d is greater, the result is Theta of n to the d.

**Q:** Why does merge sort fall into the balanced case?
**A:** It makes two subproblems of half size and does linear work to merge, so a is 2, b is 2 and d is 1; log base 2 of 2 equals 1, so every level does n work for about log n levels.

**Q:** Name a recurrence the master theorem cannot solve.
**A:** T(n) equals T(n minus 1) plus n, because the subproblem size shrinks by subtraction rather than division by a constant; it solves to Theta of n squared by summing.

## summary
For T(n) = aT(n/b) + n^d, compare d with log base b of a: leaves dominate, levels balance, or the root dominates. Use it for divide-and-conquer recurrences of this form and fall back on recursion trees otherwise.

## codenote
The Python sample classifies several recurrences. The JavaScript sample checks the merge sort recurrence against its closed form.

## code
### python
```python
import math

def master(a, b, d):
    critical = math.log(a, b)
    if abs(critical - d) < 1e-9:
        return f"Theta(n^{d} log n)" if d else "Theta(log n)"
    if critical > d:
        return f"Theta(n^{critical:.2f})"
    return f"Theta(n^{d})"

cases = [("merge sort", 2, 2, 1), ("binary search", 1, 2, 0), ("Strassen", 7, 2, 2),
         ("eight-way split", 8, 2, 2), ("halving with linear work", 1, 2, 1)]
for name, a, b, d in cases:
    print(f"{name}: {master(a, b, d)}")
```
Output:
```text
merge sort: Theta(n^1 log n)
binary search: Theta(log n)
Strassen: Theta(n^2.81)
eight-way split: Theta(n^3.00)
halving with linear work: Theta(n^1)
```
### javascript
```javascript
const T = (n) => (n <= 1 ? 1 : 2 * T(n / 2) + n);
const n = 1024;
console.log(T(n), n * Math.log2(n) + n);
```
Output:
```text
11264 11264
```

## quiz
1. What is the result for T(n) = 2T(n/2) + n?
   - [ ] Theta(n)
   - [x] Theta(n log n)
   - [ ] Theta(n squared)
   - [ ] Theta(log n)
   > The exponent d equals log base 2 of 2, so the work is balanced across levels.
2. What does log base b of a measure?
   - [ ] The depth of the recursion only
   - [x] How fast the number of leaves of the recursion tree grows
   - [ ] The cost of the combine step
   - [ ] The memory use
   > There are about n to that power leaves.
3. For T(n) = 8T(n/2) + n squared, which case applies?
   - [ ] Balanced
   - [ ] Root dominates
   - [x] Leaves dominate, giving Theta(n cubed)
   - [ ] None
   > The critical exponent 3 exceeds d = 2.
4. Which recurrence is outside the master theorem?
   - [ ] T(n) = 3T(n/3) + n
   - [x] T(n) = T(n minus 1) + n
   - [ ] T(n) = T(n/2) + 1
   - [ ] T(n) = 4T(n/2) + n
   > The problem size shrinks by subtraction, not division.

# Analyzing Recursive Algorithms
kind: algorithm
time: O(2ⁿ) for Tower of Hanoi, which makes 2ⁿ − 1 moves; O(log n) for recursive binary search, which halves the range at each call; O(n) for a recursive sum over halves, which makes 2n − 1 calls.
space: O(n) stack depth for Tower of Hanoi, O(log n) for binary search, and O(log n) depth for the halving sum.

## intro
Analysing a recursive algorithm means writing down its running time as a recurrence, a formula that defines T(n) in terms of smaller inputs, and then solving that recurrence. Four steps cover nearly every case: find the base case, count the calls, price one call, and add it all up.

## theory
Procedure:

- Define the input size n and the cost measure (comparisons, moves, calls)
- Write the recurrence: `T(n) = (cost of non-recursive work) + (sum of T of each recursive call)`, together with the base case such as `T(0) = 0` or `T(1) = 1`
- Solve it by one of these methods: expand (unroll) the recurrence, draw the recursion tree and sum levels, guess and verify by induction (substitution), or apply the master theorem when it fits

Standard recurrences and their solutions:

- `T(n) = T(n - 1) + c` solves to `Θ(n)` (a linear chain, as in factorial)
- `T(n) = T(n - 1) + n` solves to `Θ(n²)` (selection sort style, sum of 1 to n)
- `T(n) = T(n / 2) + c` solves to `Θ(log n)` (binary search)
- `T(n) = 2T(n / 2) + n` solves to `Θ(n log n)` (merge sort)
- `T(n) = 2T(n / 2) + c` solves to `Θ(n)` (tree traversals, summing by halves)
- `T(n) = 2T(n - 1) + 1` solves to `Θ(2ⁿ)` (Tower of Hanoi: `T(n) = 2^n - 1`)
- `T(n) = T(n - 1) + T(n - 2) + c` solves to `Θ(φⁿ)`, about 1.618 to the n (naive Fibonacci)

Space analysis: the stack depth equals the longest chain of nested calls: n for a linear chain, log n for halving, and n for Hanoi (the recursion tree is deep on one path but has 2ⁿ nodes). The total time is the number of nodes times the work per node, while the stack space is only the depth.

Verification: count calls with a counter on small n. Tower of Hanoi with n = 1, 2, 3 and 10 disks takes 1, 3, 7 and 1,023 moves. Searching for a missing value in a sorted array of 1,024 elements takes 11 recursive calls. A sum over halves of 8 numbers makes 15 calls, which is 2n − 1.

Pitfalls: forgetting the non-recursive work, using the wrong subproblem size when the input shrinks by different amounts, and ignoring that recursion with overlapping subproblems benefits from memoization.

## explain
1. Decide the measure of work and the meaning of n.
2. Identify the base case and its cost.
3. Count how many recursive calls each call makes and the size of each.
4. Add the work done outside the recursive calls.
5. Solve the recurrence by unrolling, a tree or the master theorem.
6. Confirm by counting calls on small inputs, and state the space as the maximum depth.

## example
The Hanoi recurrence `T(n) = 2T(n - 1) + 1` with `T(0) = 0` produces 1, 3, 7 and 1,023 moves for 1, 2, 3 and 10 disks, which is 2ⁿ − 1. The recursive binary search over 1,024 sorted numbers, looking for a value that is absent, makes 11 calls, about log₂ 1024 + 1. The JavaScript function that sums an array by splitting it in half makes 15 calls for 8 numbers, matching 2n − 1.

## real
The recurrence view explains why merge sort is fast and naive Fibonacci is not, and it guides optimisations: caching turns overlapping subproblems into a linear chain, and balancing splits turns a deep recursion into a shallow one.

## pros
- Gives an exact or asymptotic cost for recursive code
- Several methods cross-check one another
- Counting calls validates the analysis

## cons
- Solving recurrences can need algebra or induction
- Irregular splits are difficult
- Overlapping subproblems make plain analysis pessimistic

## uses
- Finding the cost of divide-and-conquer algorithms
- Comparing recursive and iterative solutions
- Predicting stack depth
- Deciding where memoization pays off

## mistakes
- Forgetting the work done before or after the recursive calls
- Assuming a recursion with two calls is always exponential
- Confusing the number of nodes with the stack depth
- Skipping the base case in the recurrence

## interview
**Q:** What is the recurrence for the Tower of Hanoi and its solution?
**A:** T(n) equals 2 T(n minus 1) plus 1, with T(0) equal to 0, which solves to 2 to the n minus 1 moves, so the time is exponential.

**Q:** How would you analyse recursive binary search?
**A:** Each call does constant work and recurses on half the range, so T(n) equals T(n over 2) plus a constant, which solves to O(log n).

**Q:** Why can a recursion with two calls still be linear?
**A:** If both calls work on halves and the non-recursive work is constant, the tree has about 2n minus 1 nodes, so the total is linear; the cost depends on the sizes of the subproblems and the work per node.

## summary
Write a recurrence with its base case, solve it by unrolling, a tree or the master theorem, check it by counting calls and state the stack depth as the space. Know the standard recurrences by heart.

## codenote
The Python sample counts Hanoi moves and binary search calls. The JavaScript sample counts calls of a halving sum.

## code
### python
```python
def hanoi(n):
    return 0 if n == 0 else 2 * hanoi(n - 1) + 1

print([hanoi(n) for n in (1, 2, 3, 10)])

calls = 0

def search(items, target, lo, hi):
    global calls
    calls += 1
    if lo > hi:
        return -1
    mid = (lo + hi) // 2
    if items[mid] == target:
        return mid
    if items[mid] < target:
        return search(items, target, mid + 1, hi)
    return search(items, target, lo, mid - 1)

data = list(range(1024))
search(data, -5, 0, 1023)
print(calls)
```
Output:
```text
[1, 3, 7, 1023]
11
```
### javascript
```javascript
let calls = 0;

function sumHalves(items) {
  calls++;
  if (items.length === 1) return items[0];
  const mid = items.length >> 1;
  return sumHalves(items.slice(0, mid)) + sumHalves(items.slice(mid));
}

console.log(sumHalves([1, 2, 3, 4, 5, 6, 7, 8]), calls);
```
Output:
```text
36 15
```

## quiz
1. What does the Tower of Hanoi recurrence T(n) = 2T(n-1) + 1 solve to?
   - [ ] n squared
   - [ ] 2n
   - [x] 2 to the power n minus 1
   - [ ] n log n
   > Each extra disk doubles the moves and adds one.
2. What is the time of recursive binary search?
   - [ ] O(n)
   - [x] O(log n)
   - [ ] O(n log n)
   - [ ] O(1)
   > The range halves at each call.
3. How many calls does a halving sum make for n elements?
   - [ ] n
   - [x] 2n minus 1
   - [ ] n squared
   - [ ] log n
   > A full binary tree with n leaves has 2n minus 1 nodes.
4. What determines the stack space of a recursion?
   - [ ] The total number of calls
   - [x] The maximum depth of nested calls
   - [ ] The size of the output
   - [ ] The number of base cases
   > Only the calls on one path are alive at once.

# Comparing Growth Rates
kind: concept
time: Not an algorithmic topic — this lesson ranks the standard growth functions and explains how to compare any two of them.
space: Not an algorithmic topic — the comparisons apply equally to memory.

## intro
To choose between algorithms you need to know how their costs compare as n grows. The standard growth functions form a ladder, and a few techniques, taking limits, plugging in values, and recalling the order, let you place any new function on it quickly.

## theory
The ladder, slowest growth first:

- Constant, 1
- Logarithmic, log n
- Fractional powers such as √n
- Linear, n
- Linearithmic, n log n
- Quadratic, n²
- Cubic, n³ and higher polynomials, n^k
- Exponential, 2ⁿ, then 3ⁿ and so on
- Factorial, n!
- Super-exponential, nⁿ

Each function eventually outgrows all those before it, whatever the constants. A function with a huge constant, such as 1000n, still loses to n² once n exceeds 1000, and 0.01n² loses to 100n once n exceeds 10,000.

Techniques for comparison:

- Limit test: compute the limit of f(n) / g(n). Zero means f grows slower, infinity means faster, a positive constant means the same rate (Θ). L'Hôpital's rule helps for functions of continuous n.
- Logarithms of both: compare log f(n) with log g(n); it turns exponents into products
- Substitution of values: evaluate both at n = 10, 100, 1000 to see the trend, being careful with small n where constants can mislead
- Rules: any polynomial beats any logarithm; any exponential beats any polynomial; a factorial beats any exponential; log of a polynomial is still log n up to a constant; (log n)^k is slower than n^ε for any positive ε
- Crossover point: the smallest n beyond which one function stays above the other. For `2^n` versus `n³` it is n = 10, since 2¹⁰ = 1024 exceeds 10³ = 1000, and stays above forever after.

Practical meaning: with a budget of about 10⁸ operations, n can be roughly 10⁸ for linear, 5 million for n log n, 10,000 for quadratic, 450 for cubic, 26 for exponential and 11 for factorial algorithms. This table is why input limits in programming problems point to the intended complexity.

Do not treat the ladder as the full story: constant factors, memory behavior and the actual size of n decide which algorithm wins for practical inputs, and hybrid algorithms switch strategies by size (for example, insertion sort for small subarrays inside quicksort).

## explain
1. Write down both functions clearly, with the same variable.
2. Simplify each by dropping constants and lower-order terms.
3. Compare their positions on the ladder.
4. If they are in the same class, compare the constants only if practical speed matters.
5. For close cases, take the limit of the ratio or compute the crossover point.
6. Confirm with values at the sizes you actually expect.

## example
The Python lines find the smallest n at which 2ⁿ exceeds n³, which is 10, and the smallest n at which n² exceeds 10,000n, the point where a quadratic algorithm finally loses to a linear one with a large constant, which is 10,001. The JavaScript program evaluates nine standard functions at n = 50 and sorts them by value, printing the order from constant up to factorial. At n = 50, 2ⁿ is already about 10¹⁵ and n! about 3 times 10⁶⁴.

## real
Performance reviews rank candidate algorithms with this ladder before writing code, and experienced engineers memorise the budget table (what n a complexity class can handle in a second) to reject impossible designs instantly.

## pros
- A short ordered list covers nearly all practical cases
- Limit and crossover techniques settle close comparisons
- The budget table links complexity to input size

## cons
- Small n and large constants can reverse the order
- Real hardware effects are not captured
- Two functions in the same class need other criteria

## uses
- Choosing between candidate algorithms
- Interpreting input limits in problem statements
- Estimating the largest feasible input size
- Explaining why exponential algorithms fail

## mistakes
- Declaring an algorithm with a huge constant to be better than one with a smaller class on large inputs
- Forgetting that log factors can matter at scale
- Comparing at one small n and generalising
- Assuming n log n and n squared are close because both are polynomial-ish

## interview
**Q:** Order these from slowest to fastest growing: n squared, 2 to the n, n log n, n.
**A:** n, then n log n, then n squared, then 2 to the n; each eventually outgrows the ones before it.

**Q:** How can you decide whether f grows faster than g?
**A:** Compute the limit of f(n) divided by g(n): zero means f grows slower, infinity means f grows faster and a positive constant means they grow at the same rate.

**Q:** Roughly what input size can an O(n squared) algorithm handle within about 10 to the 8 operations?
**A:** About ten thousand elements, since n squared equals 10 to the 8 at n equal to 10 to the 4.

## summary
Rank growth by the standard ladder from constant through logarithmic, linear, linearithmic, polynomial, exponential and factorial. Use limits and crossover points for close cases and the operation budget to judge feasibility.

## codenote
The Python sample finds two crossover points. The JavaScript sample sorts standard growth functions by their value at n = 50.

## code
### python
```python
exponential_overtakes_cubic = next(n for n in range(2, 100) if 2 ** n > n ** 3)
quadratic_overtakes_linear = next(n for n in range(1, 10 ** 5) if n * n > 10000 * n)
print(exponential_overtakes_cubic, quadratic_overtakes_linear)
```
Output:
```text
10 10001
```
### javascript
```javascript
const factorial = (n) => (n <= 1 ? 1 : n * factorial(n - 1));
const n = 50;

const growth = {
  quadratic: n ** 2,
  factorial: factorial(n),
  linear: n,
  exponential: 2 ** n,
  constant: 1,
  linearithmic: n * Math.log2(n),
  logarithmic: Math.log2(n),
  cubic: n ** 3,
};

const order = Object.entries(growth).sort((a, b) => a[1] - b[1]).map(([name]) => name);
console.log(order.join(" < "));
```
Output:
```text
constant < logarithmic < linear < linearithmic < quadratic < cubic < exponential < factorial
```

## quiz
1. Which grows faster, n squared or 2 to the n?
   - [ ] n squared
   - [x] 2 to the n
   - [ ] They are equal
   - [ ] It depends on the constant
   > Any exponential eventually beats any polynomial.
2. What does a limit of f(n) divided by g(n) equal to zero mean?
   - [ ] f grows faster
   - [x] f grows slower than g
   - [ ] They grow equally
   - [ ] The functions are equal
   > The ratio vanishes when f is eventually negligible against g.
3. What is the smallest n for which 2 to the n exceeds n cubed?
   - [ ] 5
   - [ ] 8
   - [x] 10
   - [ ] 16
   > 1024 is greater than 1000, while 512 is less than 729.
4. Roughly how large an n can an O(n squared) algorithm handle in 10 to the 8 operations?
   - [ ] 100
   - [x] 10,000
   - [ ] 1,000,000
   - [ ] 100,000,000
   > n squared equals 10 to the 8 at n equal to 10 to the 4.

# Complexity in Interviews
kind: concept
time: Not an algorithmic topic — this lesson is about how to state, justify and discuss complexity during a technical interview.
space: Not an algorithmic topic — the same communication habits apply to space.

## intro
Interviewers rarely want the fastest solution alone; they want to hear you reason about cost. Stating the complexity clearly, comparing alternatives and noticing trade-offs is part of the answer, and doing it in a consistent order makes you sound organised even under pressure.

## theory
What interviewers look for:

- You can state time and space complexity of your solution correctly, naming what n and any other variables mean
- You can start from a correct brute-force solution, state its cost and then improve it
- You know the standard costs of data structure operations
- You can explain trade-offs, such as time versus space, simplicity versus speed, average versus worst case
- You consider input limits and edge cases

A reliable structure for an answer:

- Restate the problem and clarify constraints (size of n, sorted or not, duplicates, memory limits)
- Give the brute-force approach and its complexity, even if only to set a baseline
- Identify the bottleneck: repeated scans, nested loops, repeated work
- Propose the improvement and the data structure that supports it
- State the new time and space complexity and the trade-off made
- Test with an example, including edge cases, and check the cost of the actual operations used

Standard costs to know: array index O(1); list append amortised O(1); insert or delete at the front or middle of an array O(n); hash table insert, lookup and delete O(1) on average; balanced tree operations O(log n); heap push and pop O(log n), peek O(1); sorting O(n log n); binary search O(log n); graph traversal O(V + E); building a prefix array O(n); string concatenation in a loop O(n²); slicing O(k).

Common slips to avoid: forgetting the cost of operations hidden in library calls (`in` on a list, `list.pop(0)`, slicing, `sorted`), mixing the variables (n items and m queries), quoting best case as the general case, claiming O(1) space while using recursion, and giving only time or only space.

Language to use: "This is O(n log n) time because of the sort, and O(n) extra space for the result. The brute force would be O(n squared), so this improves it at the cost of linear memory." Be ready for follow-up: "Can you do it in constant space?" "What if the input does not fit in memory?" "What if the array is already sorted?"

## explain
1. Define n (and any other sizes) in your answer.
2. Analyse each part of your solution: loops, sorting, data structure operations, recursion depth.
3. Combine by addition for sequential parts and multiplication for nested ones, then keep the dominant term.
4. State time and space separately and say which case you mean.
5. Compare with the brute force and mention the trade-off.
6. Prepare for the follow-up about improving space, handling larger inputs or different constraints.

## example
The Python lines compare three ways to check a list of 100 numbers for a pair that adds to a target. Comparing every pair examines 4,950 pairs; one pass with a hash set does 100 lookups; sorting first and using two pointers costs about n log₂ n, or 664 comparisons, plus a linear scan. The JavaScript lines check three strategies for n = 1,000,000 against a budget of 100 million operations: linear and n log n pass and quadratic does not.

## real
Large companies use structured interviews where complexity discussion is scored explicitly, and the habit of stating costs carries over to design reviews and code reviews at work.

## pros
- A fixed structure keeps answers clear under pressure
- Knowing standard costs avoids slips
- Comparing alternatives shows depth of understanding

## cons
- Memorised answers without understanding fail on follow-ups
- Over-focusing on Big O can hide practical constants
- Time pressure causes small errors in counting

## uses
- Answering coding interview questions
- Justifying design choices in reviews
- Explaining performance to teammates
- Setting expectations on input limits

## mistakes
- Giving a complexity without defining n
- Forgetting the cost of library operations inside loops
- Ignoring space complexity
- Claiming the optimum without comparing to the brute force

## interview
**Q:** How do you present the complexity of your solution?
**A:** State what n means, give the time and space complexity separately with the dominant term, say which case it is, and explain where each cost comes from, ideally comparing with the brute-force baseline.

**Q:** What is the cost of checking membership in a Python list and in a set?
**A:** Checking a list is O(n) because it scans the elements, while checking a set is O(1) on average because it uses hashing.

**Q:** What would you say when asked whether you can reduce the extra space?
**A:** Discuss in-place alternatives, such as two pointers on sorted data or reusing the input, and state the trade-off, for example sorting costs O(n log n) time but needs no hash table.

## summary
Define n, give time and space separately, compare with brute force, know the standard operation costs and watch for hidden costs in library calls. A consistent structure makes your reasoning visible.

## codenote
The Python sample counts the work of three pair-sum strategies. The JavaScript sample checks strategies against an operation budget.

## code
### python
```python
import math

n = 100
brute_force_pairs = n * (n - 1) // 2
hash_lookups = n
sort_and_scan = round(n * math.log2(n))
print(brute_force_pairs, hash_lookups, sort_and_scan)
```
Output:
```text
4950 100 664
```
### javascript
```javascript
const n = 1e6;
const budget = 1e8;

const strategies = {
  linear: n,
  "n log n": n * Math.log2(n),
  quadratic: n * n,
};

for (const [name, operations] of Object.entries(strategies)) {
  console.log(name, operations <= budget);
}
```
Output:
```text
linear true
n log n true
quadratic false
```

## quiz
1. What should you do first when you answer a complexity question?
   - [ ] Quote Big O immediately
   - [x] Define what n stands for
   - [ ] Start coding
   - [ ] Mention the best case
   > Without a definition the statement is ambiguous.
2. What is the cost of checking membership in a Python set on average?
   - [ ] O(n)
   - [x] O(1)
   - [ ] O(log n)
   - [ ] O(n squared)
   > Hashing gives constant average time.
3. Which hidden cost is easy to miss?
   - [ ] Array indexing
   - [x] Using in on a list inside a loop
   - [ ] Adding two integers
   - [ ] Comparing two numbers
   > The membership test scans the list on every iteration.
4. How does a good answer treat the brute-force solution?
   - [ ] Skips it
   - [x] States it with its cost as a baseline, then improves it
   - [ ] Claims it is optimal
   - [ ] Hides its cost
   > The comparison shows what improved and why.

# Profiling and Benchmarking Tools
kind: concept
time: Not an algorithmic topic — profilers and benchmarks measure running time; the lesson explains how to use them correctly.
space: Not an algorithmic topic — memory profilers are covered as tools, not analysed as algorithms.

## intro
Complexity analysis predicts how code scales; profiling and benchmarking measure what it actually does. Together they answer different questions: analysis says which algorithm should win, a profiler says where this program spends its time right now, and a benchmark says how fast a specific piece of code runs under controlled conditions.

## theory
Definitions:

- Profiling: observing a running program to find where time (or memory) goes. Deterministic profilers record every function call and return; sampling profilers look at the call stack at regular intervals and are cheaper.
- Benchmarking: timing a well-defined piece of code, repeatedly, under controlled conditions to compare implementations.

Principles of trustworthy measurement:

- Measure before optimising: the bottleneck is rarely where you expect
- Use a monotonic high-resolution clock (`time.perf_counter` in Python, `performance.now` and `process.hrtime.bigint` in Node.js), not wall-clock time that can jump
- Repeat the measurement and report the minimum or the median, not a single run; noise comes from other processes, caches, frequency scaling and garbage collection
- Warm up first: just-in-time compilers and caches make the first runs slower
- Use realistic input sizes and shapes; micro-benchmarks on tiny data mislead
- Prevent the compiler or engine from removing the work you are measuring by using its result
- Change one thing at a time and keep the environment constant

Tools:

- Python: `timeit` for small snippets (it disables garbage collection during timing by default and repeats runs), `cProfile` with `pstats` for function-level profiles (call counts and cumulative times), `tracemalloc` for memory, `py-spy` for sampling a running process, `line_profiler` for per-line costs
- JavaScript and Node.js: `console.time`, `performance.now`, the built-in `--cpu-prof` and `--prof` options, Chrome DevTools performance and memory panels, `clinic` and `0x` flame graphs
- Java: JMH for benchmarks, VisualVM and Java Flight Recorder
- C and C++: `perf`, `gprof`, Valgrind's `callgrind`, Google Benchmark
- Flame graphs visualise sampled stacks: wide boxes are where the time goes

What counts are reported: call counts are exact and deterministic, while times vary from run to run. Counting calls and operations remains the most reliable way to confirm a complexity prediction, and timing confirms that the constants are acceptable.

## explain
1. Decide the question: where is the time going, or which of two versions is faster?
2. For the first, run a profiler on a realistic workload and read the functions sorted by cumulative time.
3. For the second, write a benchmark with repeated runs and report the minimum or median.
4. Confirm complexity by timing at several input sizes and checking how the time scales when n doubles.
5. Fix the biggest cost first, then measure again.
6. Record the results and the environment so they can be reproduced.

## example
The Python program profiles a naive recursive Fibonacci of 15 with `cProfile` and reads the call counts from the statistics: the function was called 1,973 times, matching the analysis that it makes 2·F(16) − 1 calls. `timeit` times a small snippet, and the program checks that the result is positive. The JavaScript lines confirm that `performance.now` returns a number, that `process.hrtime.bigint` returns a bigint and that elapsed time is not negative. The text sample shows command lines for profiling in different ecosystems.

## real
Teams run benchmarks in continuous integration to catch performance regressions, and production services use sampling profilers and flame graphs to find expensive code paths without stopping traffic.

## pros
- Shows the true bottlenecks instead of guesses
- Confirms or refutes complexity predictions
- Catches performance regressions early

## cons
- Timings are noisy and environment dependent
- Profilers add overhead and can distort results
- Micro-benchmarks can be unrepresentative

## uses
- Finding the slowest functions in a program
- Comparing two implementations
- Confirming how running time scales with input size
- Tracking performance across releases

## mistakes
- Optimising code without profiling it first
- Timing a single run or including start-up costs
- Using wall-clock time instead of a monotonic clock
- Benchmarking on tiny inputs that fit entirely in the cache

## interview
**Q:** What is the difference between a profiler and a benchmark?
**A:** A profiler observes a whole running program to show where time or memory is spent, while a benchmark times a specific piece of code repeatedly under controlled conditions to compare alternatives.

**Q:** Why repeat a measurement and take the minimum or median?
**A:** Timings vary from run to run because of other processes, caches and garbage collection, and the minimum or median is a more stable estimate of the code's own cost than a single sample.

**Q:** How can profiling confirm a complexity prediction?
**A:** Count calls or time the code at several input sizes and check that the growth matches the formula, for example that doubling the input roughly quadruples the time for a quadratic algorithm.

## summary
Profile to find where the time goes, benchmark to compare versions, and measure carefully with a monotonic clock, repeated runs and realistic data. Use counts to confirm complexity and timings to check constants.

## codenote
The Python sample profiles calls with cProfile and uses timeit. The JavaScript sample uses the high-resolution timers. The text sample lists commands for several ecosystems.

## code
### python
```python
import cProfile
import pstats
import timeit

def fib(n):
    return n if n < 2 else fib(n - 1) + fib(n - 2)

profiler = cProfile.Profile()
profiler.enable()
fib(15)
profiler.disable()

stats = pstats.Stats(profiler)
print([entry[1] for key, entry in stats.stats.items() if key[2] == "fib"])
print(timeit.timeit("sum(range(1000))", number=100) > 0)
```
Output:
```text
[1973]
True
```
### javascript
```javascript
const start = performance.now();
let total = 0;
for (let i = 0; i < 1e6; i++) total += i;
const elapsed = performance.now() - start;

console.log(typeof start, typeof process.hrtime.bigint(), elapsed >= 0);
```
Output:
```text
number bigint true
```
### text
```text
python -m cProfile -s cumtime script.py
python -m timeit -s "data = list(range(1000))" "sum(data)"
node --cpu-prof script.js
perf record -g ./program && perf report
valgrind --tool=callgrind ./program
```

## quiz
1. What does a profiler tell you?
   - [ ] Whether the code is correct
   - [x] Where a running program spends its time or memory
   - [ ] The Big O of the algorithm
   - [ ] The size of the source file
   > It observes the real execution.
2. Why report the minimum or median of repeated timings?
   - [ ] The maximum is not allowed
   - [x] Single runs are noisy because of other processes and caches
   - [ ] The minimum is always exact
   - [ ] It makes the code faster
   > Repetition reduces the effect of noise.
3. Which clock should be used for measuring durations?
   - [ ] The wall-clock date
   - [x] A monotonic high-resolution timer
   - [ ] The system calendar
   - [ ] A random clock
   > Wall-clock time can jump when the system clock is adjusted.
4. What is the most reliable way to confirm a complexity prediction?
   - [ ] Reading the code twice
   - [x] Counting operations or timing at several input sizes and checking the growth
   - [ ] Running once on a small input
   - [ ] Adding comments
   > Growth across sizes shows the shape of the cost.
