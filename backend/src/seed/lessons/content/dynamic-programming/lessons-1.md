# Overlapping Subproblems
kind: concept
time: Not an algorithmic topic — overlapping subproblems are a property of a problem, not an algorithm. The property explains why naive recursion on such problems is exponential, for example 21,891 calls to compute the 20th Fibonacci number, while caching reduces it to 39.
space: Not an algorithmic topic — exploiting the property costs memory for a cache or table, typically one entry per distinct subproblem.

## intro
A problem has overlapping subproblems when solving it recursively requires the same smaller question to be answered again and again. Recognising this property is the first step toward dynamic programming, because it tells you that remembering answers will save an enormous amount of work.

## theory
Definition: when the recursion tree of a problem contains the same subproblem (same parameters) at many nodes, the subproblems overlap. Contrast with divide and conquer, where the subproblems are independent and each appears once, as in merge sort.

Classic example: Fibonacci numbers, defined by `fib(n) = fib(n − 1) + fib(n − 2)`. The call `fib(5)` calls `fib(4)` and `fib(3)`; `fib(4)` calls `fib(3)` and `fib(2)` again; `fib(3)` is computed twice, `fib(2)` three times, and so on. The number of calls grows like the Fibonacci numbers themselves, about 1.618 to the power n. Computing `fib(20)` this way makes 21,891 calls, although only 21 distinct values (0 to 20) exist. Computing `fib(10)` makes 177 calls for 11 distinct values.

With a cache, each distinct subproblem is computed once, and later requests return the stored answer. For `fib(20)` the number of calls drops from 21,891 to 39, and for `fib(10)` from 177 to 19. The time becomes proportional to the number of distinct subproblems times the work per subproblem, here O(n).

How to detect overlap:

- Draw the recursion tree for a small input and look for repeated nodes
- Count the distinct parameter combinations: if it is polynomial (n, n squared) while the number of calls is exponential, the subproblems overlap
- Look for recursion that splits into branches which both reduce one parameter by small amounts, such as n − 1 and n − 2, or that combine prefixes of two strings

Other problems with overlapping subproblems: climbing stairs, counting grid paths (the number of paths to a cell is the sum of the numbers for the cell above and to the left), minimum coins for an amount, longest common subsequence, edit distance and knapsack. In each case the state is described by a small number of integers, which makes a table or a dictionary a natural cache.

Problems without overlap: merge sort, binary search, tree traversals and the n queens search have subproblems that are independent or nearly so, so caching does not help (the n queens states are rarely repeated). Listing all subsets or permutations also has no overlap, because each leaf is a different answer that must be produced.

Two requirements for dynamic programming to apply, in addition to overlap: optimal substructure (the next lesson) and a state that is small enough to enumerate. If the number of distinct states is as large as the number of calls, caching only adds overhead.

Measuring the benefit: add a counter to the recursive function and compare the calls with and without a cache; the gap is the savings. Mathematically, the cost is states times transitions per state.

Related terms: memoization stores results as the recursion discovers them (top-down), and tabulation fills a table in dependency order (bottom-up). Both exploit overlap; they differ in the order of evaluation and in overhead.

## explain
1. Write the recursive definition of the problem in terms of smaller inputs.
2. Draw or simulate the recursion for a small input and look for repeated calls.
3. Count the distinct parameter combinations to find the number of states.
4. If the number of states is much smaller than the number of calls, the subproblems overlap.
5. Store each answer the first time it is computed and reuse it.
6. Verify that the result is unchanged and that the call count dropped.

## example
The Python program counts the calls of plain recursive Fibonacci for n = 20, which is 21,891, and the calls with a dictionary cache, which is 39; both return 6765. The JavaScript program does the same for n = 10: 177 calls without a cache and 19 with a Map, both returning 55.

## real
Spreadsheet engines cache cell values for repeated references, compilers cache results of repeated analysis of the same expression, and routing software reuses sub-route costs when planning many trips.

## pros
- Identifying overlap shows exactly where caching pays off
- Reveals why caching can cut exponential recursion down to polynomial time
- Simple to verify by counting calls

## cons
- Detecting overlap needs analysis of the recursion tree
- Caches use extra memory
- Does not help when subproblems are independent

## uses
- Deciding whether dynamic programming applies
- Explaining why naive recursion is slow
- Finding the state definition of a new problem
- Comparing memoization with plain recursion

## mistakes
- Adding a cache to a recursion that has no repeated subproblems
- Defining a state that is too large to enumerate
- Forgetting that the cache key must include every changing parameter
- Counting only the answers instead of the number of calls when analysing cost

## interview
**Q:** What are overlapping subproblems?
**A:** Subproblems that appear many times in the recursion tree of a problem, so the same question is answered repeatedly and storing its answer avoids redundant work.

**Q:** Why is naive recursive Fibonacci exponential while there are only n distinct subproblems?
**A:** Each call branches into two calls with smaller inputs and nothing is remembered, so the same values are recomputed over and over; the number of calls grows like the Fibonacci numbers.

**Q:** How do overlapping subproblems differ from divide and conquer?
**A:** Divide and conquer subproblems are independent and each appears once, while overlapping subproblems repeat, which is why dynamic programming stores their answers.

## summary
Overlapping subproblems are repeated smaller questions in a recursion, and they are the reason caching turns exponential recursion into polynomial time. Count distinct states against total calls to see whether dynamic programming will help.

## codenote
The Python sample counts calls with and without a cache for n = 20. The JavaScript sample does the same for n = 10.

## code
### python
```python
calls = 0

def fib(n):
    global calls
    calls += 1
    return n if n < 2 else fib(n - 1) + fib(n - 2)

cached_calls = 0

def fib_cached(n, memo):
    global cached_calls
    cached_calls += 1
    if n < 2:
        return n
    if n not in memo:
        memo[n] = fib_cached(n - 1, memo) + fib_cached(n - 2, memo)
    return memo[n]

print(fib(20), calls)
print(fib_cached(20, {}), cached_calls)
```
Output:
```text
6765 21891
6765 39
```
### javascript
```javascript
let plainCalls = 0;
function fib(n) {
  plainCalls++;
  return n < 2 ? n : fib(n - 1) + fib(n - 2);
}

let cachedCalls = 0;
const memo = new Map();
function fibCached(n) {
  cachedCalls++;
  if (n < 2) return n;
  if (memo.has(n)) return memo.get(n);
  const value = fibCached(n - 1) + fibCached(n - 2);
  memo.set(n, value);
  return value;
}

const plain = fib(10);
console.log(plain, plainCalls, fibCached(10), cachedCalls);
```
Output:
```text
55 177 55 19
```

## quiz
1. What does it mean for subproblems to overlap?
   - [ ] They are all solved once
   - [x] The same subproblem appears many times in the recursion
   - [ ] They have different parameters each time
   - [ ] They are solved in parallel
   > Repeated subproblems are what a cache can reuse.
2. How many calls does plain recursive Fibonacci make for n = 10?
   - [ ] 10
   - [x] 177
   - [ ] 11
   - [ ] 1024
   > Only 11 distinct values exist, yet the recursion recomputes them.
3. Which algorithm has independent rather than overlapping subproblems?
   - [ ] Edit distance
   - [x] Merge sort
   - [ ] Knapsack
   - [ ] Grid paths
   > Each half is sorted once and never needed again.
4. What gives the cost of a memoized solution?
   - [ ] The recursion depth only
   - [x] The number of distinct states times the work per state
   - [ ] The size of the output
   - [ ] The number of test cases
   > Each state is computed once.

# Optimal Substructure
kind: concept
time: Not an algorithmic topic — optimal substructure is a property of a problem. Algorithms that use it, such as coin change by dynamic programming, cost the number of states times the transitions per state, for example O(amount · coins).
space: Not an algorithmic topic — using the property requires storing the best answer for each subproblem, usually one value per state.

## intro
A problem has optimal substructure when an optimal solution to the whole problem contains optimal solutions to its subproblems. This is the second requirement of dynamic programming: if you can build the best answer from the best answers of smaller pieces, you can compute those pieces first, store them and combine them.

## theory
Definition: if an optimal solution of a problem of size n can be written as a choice plus optimal solutions of smaller instances, then the problem has optimal substructure. The proof is usually a cut-and-paste argument: suppose the sub-solution inside the optimal solution were not optimal; replace it with a better one, and the whole would improve, contradicting optimality.

Examples where it holds:

- Minimum coins for an amount: the best way to make amount a with a last coin c is one coin plus the best way to make a − c. For coins 1, 5, 10 and 25 the best for 63 is 6 coins, and for coins 1, 15 and 25 the best for 30 is 2 coins (15 + 15), found by trying every last coin and taking the minimum, which is exactly what greedy cannot do.
- Rod cutting: the best revenue for a rod of length n is the maximum over the first cut length j of the price of j plus the best revenue for n − j. With prices 1, 5, 8, 9, 10, 17, 17, 20 for lengths 1 to 8, a rod of length 8 earns 22, and length 4 earns 10 (two pieces of length 2).
- Shortest paths: any subpath of a shortest path is itself a shortest path between its endpoints, which underlies Dijkstra, Bellman-Ford and Floyd-Warshall
- Longest common subsequence, edit distance, matrix chain multiplication and knapsack

Where it fails:

- Longest simple path in a graph: the longest path from a to c through b does not consist of the longest paths from a to b and from b to c, because the two parts might share vertices, so subproblems are not independent
- Problems where the choice for one subproblem restricts the choices for another in a way that the state does not capture

Fix by enlarging the state: if the subproblem needs extra information, include it. For the 0/1 knapsack the state must hold both the item index and the remaining capacity, because the best value for the first i items depends on the capacity left.

How it fits with the rest of dynamic programming:

- State: the parameters that identify a subproblem
- Recurrence: the formula that builds the optimal value of a state from optimal values of smaller states (the substructure)
- Base cases: states that are answered directly
- Order: states are computed so that the dependencies are ready, bottom-up, or discovered recursively with memoization
- Answer: the state that represents the original problem

Reconstructing the solution: optimal substructure gives the value; to recover the choices, store for each state which option achieved the best value (a parent pointer) or recompute backwards through the table.

Greedy comparison: greedy algorithms also need optimal substructure, and in addition the greedy choice property. Dynamic programming needs only the substructure, so it handles more problems, at the price of looking at all choices.

Common test in an interview: write the recurrence on paper for a small example and check that using optimal sub-answers gives the right answer, and ask whether the subproblems could interfere with each other.

## explain
1. Identify what a subproblem looks like and which parameters define it.
2. Express the best answer for a problem as a choice plus the best answers for smaller subproblems.
3. Argue by cut and paste that a better sub-solution would improve the whole.
4. Check that subproblems do not share resources in a way the state does not capture.
5. Add parameters to the state if the argument fails.
6. Write the recurrence and the base cases.

## example
The Python function computes the minimum number of coins by trying every last coin, giving 6 coins for 63 with coins 1, 5, 10 and 25 and 2 coins for 30 with coins 1, 15 and 25. The JavaScript function solves rod cutting with the prices 1, 5, 8, 9, 10, 17, 17 and 20 and obtains revenue 22 for length 8 and 10 for length 4.

## real
Route planners rely on the fact that parts of shortest routes are shortest, text comparison tools build optimal alignments from optimal prefixes, and resource planners compute budget allocations stage by stage.

## pros
- Gives a principled way to define recurrences
- Works for many optimisation problems
- A cut-and-paste proof catches wrong formulations early

## cons
- Not every optimisation problem has it
- The right state can be hard to find
- Proofs need care when subproblems interact

## uses
- Justifying dynamic programming solutions
- Designing recurrences for optimisation problems
- Understanding why shortest path algorithms work
- Identifying problems where dynamic programming fails

## mistakes
- Assuming the property holds for longest simple paths
- Leaving out a parameter that the subproblem depends on
- Confusing the optimal value with the optimal choices when reconstructing
- Using greedy choices where only the substructure property has been proven

## interview
**Q:** What is optimal substructure?
**A:** The property that an optimal solution contains optimal solutions to its subproblems, so the best answer can be assembled from the best answers of smaller instances.

**Q:** Give a problem that lacks optimal substructure.
**A:** The longest simple path in a graph, because optimal sub-paths can share vertices and cannot be combined into a valid simple path.

**Q:** How do you prove optimal substructure?
**A:** With a cut-and-paste argument: if a sub-solution inside an optimal solution were not optimal, replacing it with a better one would give a better overall solution, which is a contradiction.

## summary
Optimal substructure means the best solution is built from best solutions of smaller instances, which lets dynamic programming store and combine sub-answers. Check it with a cut-and-paste argument and enlarge the state when subproblems depend on extra information.

## codenote
The Python sample computes minimum coins from the best sub-answers. The JavaScript sample solves rod cutting.

## code
### python
```python
def fewest_coins(amount, coins):
    best = [0] + [10 ** 9] * amount
    for current in range(1, amount + 1):
        for coin in coins:
            if coin <= current:
                best[current] = min(best[current], best[current - coin] + 1)
    return best[amount]

print(fewest_coins(63, [1, 5, 10, 25]), fewest_coins(30, [1, 15, 25]))
```
Output:
```text
6 2
```
### javascript
```javascript
function rodRevenue(prices, length) {
  const best = [0];
  for (let size = 1; size <= length; size++) {
    best[size] = 0;
    for (let cut = 1; cut <= Math.min(size, prices.length); cut++) {
      best[size] = Math.max(best[size], prices[cut - 1] + best[size - cut]);
    }
  }
  return best[length];
}

const prices = [1, 5, 8, 9, 10, 17, 17, 20];
console.log(rodRevenue(prices, 8), rodRevenue(prices, 4));
```
Output:
```text
22 10
```

## quiz
1. What does optimal substructure mean?
   - [ ] The input is sorted
   - [x] An optimal solution contains optimal solutions of its subproblems
   - [ ] The problem has one solution only
   - [ ] The recursion has no base case
   > The best whole can be built from the best parts.
2. Which problem lacks optimal substructure?
   - [ ] Rod cutting
   - [x] Longest simple path in a graph
   - [ ] Minimum coins
   - [ ] Shortest path in a graph
   > Sub-paths may share vertices, so parts cannot be combined freely.
3. How is optimal substructure typically proven?
   - [ ] By testing one input
   - [x] By a cut-and-paste argument that a better sub-solution would improve the whole
   - [ ] By sorting the subproblems
   - [ ] By measuring running time
   > The contradiction shows the sub-solution must be optimal.
4. What do you do if a subproblem depends on extra information?
   - [ ] Ignore it
   - [x] Add that information to the state
   - [ ] Switch to a greedy algorithm
   - [ ] Remove the base case
   > The state must contain everything the best answer depends on.

# Top Down Memoization
kind: algorithm
time: O(S · T) where S is the number of distinct states and T the work per state; Fibonacci has n states with constant work for O(n) time, and grid paths has rows times columns states.
space: O(S) for the cache plus O(depth) for the recursion stack, which can be as deep as n for linear recurrences.
viz: fibonacci-dp

## intro
Top-down dynamic programming, or memoization, keeps the natural recursive solution and adds a cache: before computing a subproblem, check whether its answer is stored; after computing it, store the answer. The recursion then does the minimum necessary work, visiting only the subproblems that are actually needed.

## theory
Recipe:

- Write the plain recursive function from the recurrence, with base cases
- Create a cache (dictionary, array or decorator) keyed by the parameters of the function
- At the start of the function, return the cached value if present
- Before returning a computed value, store it in the cache

Example: Fibonacci with `functools.lru_cache`. The call `f(50)` returns 12,586,269,025 with only 51 computations (cache misses) and 48 cache hits. Without the cache the same call would need trillions of operations. The cache turns each distinct input into a one-time computation.

Example: unique paths in a grid. The number of paths from the top-left corner to a cell (r, c) moving right or down is the sum of the numbers for the cell above and the cell to the left, with 1 along the first row and column. A memoized `paths(2, 6)`, the answer for a 3 by 7 grid, is 28, and the cache holds 20 entries.

Characteristics:

- Lazy: only the states reachable from the requested one are computed, which helps when many states are never needed (for example subset sum with a sparse set of reachable sums)
- Natural: the code mirrors the recurrence, so it is easy to write and to verify
- Overhead: recursive calls and hash lookups are slower than array loops, and deep recursion can overflow the stack; Python's default limit is about 1000 frames, and a recursion of depth n with n = 100,000 needs either `sys.setrecursionlimit` with care or a bottom-up rewrite

Cache design:

- Use immutable, hashable keys (tuples of integers); for lists or strings convert them to indices or tuples
- Use arrays when parameters are small integers, which is faster than a dictionary
- Mutable default arguments (a dictionary as a default parameter) persist between calls in Python, which can be convenient or a bug; pass a fresh dictionary explicitly or use a decorator
- Clear caches between independent test cases when state leaks
- In JavaScript use a `Map` keyed by a string built from the row and the column or by a combined integer

Large values: Fibonacci numbers beyond the 78th exceed the safe integer limit of JavaScript numbers (2^53), so use BigInt. The 90th Fibonacci number is 2880067194370816120.

Correctness conditions: the function must be pure (the same arguments always give the same result) and must not depend on global state that changes between calls, otherwise the cache returns stale answers.

When to prefer top-down: when the order of evaluation is hard to define, when only some states are needed, or when prototyping. Prefer bottom-up when the stack depth is a risk or when you want to optimise space.

## explain
1. Write the recursive solution and its base cases.
2. Decide the cache key from the parameters that change.
3. Check the cache before computing and return the stored value if present.
4. Compute the value recursively and store it before returning.
5. Check the recursion depth against the language limit.
6. Count the cache misses to confirm that each state is computed once.

## example
The Python program decorates Fibonacci with a cache and prints 12586269025, 51 cache misses and 48 hits for `f(50)`, then counts the paths in a 3 by 7 grid with memoization: 28 paths and 20 cached states. The JavaScript program uses a Map with BigInt values and prints the 50th and 90th Fibonacci numbers, 12586269025 and 2880067194370816120.

## real
Parsers and compilers memoize the results of parsing rules (packrat parsing), game engines cache evaluated positions in transposition tables, and web frameworks cache the results of pure functions.

## pros
- Mirrors the recurrence, so it is easy to write correctly
- Computes only the states that are needed
- Adding a cache can be a one-line change

## cons
- Recursion depth can cause stack overflow
- Hash lookups and calls add overhead
- Harder to reduce memory than with tabulation

## uses
- Quickly turning a recursive solution into a polynomial one
- Problems with sparse sets of reachable states
- Prototyping dynamic programming recurrences
- Caching pure functions in applications

## mistakes
- Using a cache key that omits a parameter that changes the answer
- Letting a mutable default dictionary leak between independent runs
- Ignoring the recursion limit for large inputs
- Memoizing a function with side effects

## interview
**Q:** How would you define memoization?
**A:** Storing the results of a function for the arguments it has been called with, so repeated calls return the stored value instead of recomputing it; combined with recursion it gives top-down dynamic programming.

**Q:** What are the drawbacks of top-down memoization?
**A:** Recursion overhead, the risk of exceeding the stack depth for large inputs, and less control over memory than a bottom-up table.

**Q:** What is the time complexity of a memoized recursion?
**A:** The number of distinct states times the work per state, because each state is computed once.

## summary
Memoization adds a cache to a recursive solution so each state is computed once, giving O(states · work per state) time with code that mirrors the recurrence. Watch the cache key, the recursion depth and purity of the function.

## codenote
The Python sample uses a cache decorator for Fibonacci and grid paths. The JavaScript sample uses a Map with BigInt.

## code
### python
```python
from functools import lru_cache

@lru_cache(maxsize=None)
def fib(n):
    return n if n < 2 else fib(n - 1) + fib(n - 2)

@lru_cache(maxsize=None)
def paths(row, col):
    if row == 0 or col == 0:
        return 1
    return paths(row - 1, col) + paths(row, col - 1)

answer = fib(50)
info = fib.cache_info()
print(answer, info.misses, info.hits)
print(paths(2, 6), paths.cache_info().currsize)
```
Output:
```text
12586269025 51 48
28 20
```
### javascript
```javascript
const memo = new Map();

function fib(n) {
  if (n < 2) return BigInt(n);
  if (memo.has(n)) return memo.get(n);
  const value = fib(n - 1) + fib(n - 2);
  memo.set(n, value);
  return value;
}

console.log(fib(50).toString(), fib(90).toString());
```
Output:
```text
12586269025 2880067194370816120
```

## quiz
1. What does a memoization cache hold?
   - [ ] The input array
   - [x] The result of each function call keyed by its arguments
   - [ ] The recursion depth
   - [ ] The output format
   > A repeated call returns the stored value.
2. How many distinct states does fib(50) have?
   - [ ] 2^50
   - [x] 51
   - [ ] 100
   - [ ] 1
   > One state for each value from 0 to 50.
3. Which risk is specific to deep top-down recursion?
   - [ ] Wrong answers
   - [x] Exceeding the call stack limit
   - [ ] Unsorted output
   - [ ] Duplicate keys
   > Each pending call uses a stack frame.
4. What must be true of a function whose results are cached?
   - [ ] It prints output
   - [x] It must return the same result for the same arguments
   - [ ] It must be iterative
   - [ ] It must use a global counter
   > Side effects or hidden state make cached answers wrong.

# Bottom Up Tabulation
kind: algorithm
time: O(S · T) for S states and T transitions per state, such as O(n) for Fibonacci and O(amount · coins) for counting ways to make change.
space: O(S) for the full table, which can often be reduced by keeping only the entries that later states still need.
practice: coin-change-minimum

## intro
Bottom-up dynamic programming, or tabulation, fills a table of answers starting from the smallest subproblems and moving toward the full problem, so every value needed is already in the table when it is used. There is no recursion, no cache lookups and no stack depth to worry about, which makes it the preferred form in production code.

## theory
Recipe:

- Define the state: what the table index means (for example, `t[i]` is the answer for the first i items)
- Fill the base cases in the table
- Iterate over the states in an order such that every dependency has been computed before it is used
- Apply the recurrence to compute each entry from earlier entries
- Read the answer from the entry that corresponds to the original problem

Example 1: Fibonacci. The table `t[0] = 0`, `t[1] = 1`, and `t[i] = t[i − 1] + t[i − 2]` for i from 2 upward. For n = 10 the table is `0, 1, 1, 2, 3, 5, 8, 13, 21, 34, 55`. JavaScript's fastest version of the idea is the climbing stairs recurrence with `t[0] = t[1] = 1`, giving 89 for 10 steps and 1,836,311,903 for 45 steps.

Example 2: counting the ways to make change (combinations, order ignored). Let `t[a]` be the number of ways to make amount a. Start with `t[0] = 1` (one way to make zero: use no coins). For each coin c, for each amount a from c to the target, add `t[a − c]` to `t[a]`. The outer loop over coins ensures each combination is counted once, not as several orderings. With coins 1, 2 and 5 there are 11 ways to make 11 and 4 ways to make 5 (5, 2+2+1, 2+1+1+1, 1+1+1+1+1).

Order of evaluation matters:

- For one-dimensional recurrences depending on smaller indices, loop upward
- For two-dimensional tables, loop rows then columns when each cell depends on the cell above and to the left
- For interval problems (matrix chain, palindromic substrings), loop by increasing interval length
- For subset problems with bitmasks, loop over masks in increasing numeric order, because a subset has a smaller number than its supersets
- When the dependency is on larger indices, loop downward

Comparison with memoization:

- Tabulation computes all states, including ones that are never needed; memoization computes only the reachable ones
- Tabulation avoids recursion overhead and stack limits and is usually faster by a constant factor
- Tabulation makes space optimisation straightforward, since you can see which earlier rows are still needed
- Memoization is easier when the dependency order is complicated

Pitfalls: off-by-one errors in table sizes (allocate n + 1 entries to include the zero case), uninitialised entries that should be infinity rather than zero for minimisation, and looping in the wrong order, for instance iterating amounts in an outer loop when counting combinations instead of permutations (which counts orderings separately).

Testing: compare the table solution with a memoized or brute-force solution on small inputs, and print the table for a small example to verify the base cases and the order.

## explain
1. Define what each table entry means.
2. Choose the table size and fill in the base cases.
3. Pick an iteration order that respects dependencies.
4. Compute each entry from earlier entries with the recurrence.
5. Return the entry for the original problem.
6. Check small cases by hand and against a brute-force solution.

## example
The Python program builds the Fibonacci table for n = 10 and counts the ways to make change for 11 and 5 with coins 1, 2 and 5: 11 and 4 ways. The JavaScript program tabulates climbing stairs and returns 89 ways for 10 steps and 1836311903 ways for 45 steps.

## real
Spell checkers and diff tools fill alignment tables, finance software computes option values backwards through a lattice, and route planners fill cost tables for time-expanded networks.

## pros
- No recursion, so no stack overflow
- Usually faster than memoization by a constant factor
- Easy to optimise memory by keeping only needed rows

## cons
- Computes states that may not be needed
- Requires choosing the right evaluation order
- Less natural than the recursive formulation

## uses
- Production dynamic programming solutions
- Counting ways and optimising sums over large inputs
- Problems with a clear order of dependencies
- Preparing for space optimisation

## mistakes
- Allocating a table one entry too small
- Initialising minimisation tables with zero instead of a large value
- Looping over amounts in the outer loop when counting combinations
- Reading from entries that have not been computed yet

## interview
**Q:** What is the difference between memoization and tabulation?
**A:** Memoization is top-down recursion with a cache and computes only needed states, while tabulation is bottom-up iteration over a table in dependency order and computes all states without recursion.

**Q:** How do you count combinations rather than permutations of coins that make an amount?
**A:** Put the loop over coins on the outside and the loop over amounts inside, so each combination of coins is added in a fixed order and counted once.

**Q:** Why allocate a table of size n plus one?
**A:** To hold the base case for zero, so indices from 0 to n are all valid and the answer for n is a regular entry.

## summary
Tabulation fills a table from base cases upward in dependency order, giving the same complexity as memoization without recursion. Choose the loop order carefully, initialise correctly and keep the table size consistent with the base cases.

## codenote
The Python sample builds a Fibonacci table and counts change combinations. The JavaScript sample tabulates climbing stairs.

## code
### python
```python
def fib_table(n):
    table = [0] * (n + 1)
    if n >= 1:
        table[1] = 1
    for i in range(2, n + 1):
        table[i] = table[i - 1] + table[i - 2]
    return table

def change_ways(amount, coins):
    ways = [1] + [0] * amount
    for coin in coins:
        for current in range(coin, amount + 1):
            ways[current] += ways[current - coin]
    return ways[amount]

print(fib_table(10))
print(change_ways(11, [1, 2, 5]), change_ways(5, [1, 2, 5]))
```
Output:
```text
[0, 1, 1, 2, 3, 5, 8, 13, 21, 34, 55]
11 4
```
### javascript
```javascript
function climb(steps) {
  const ways = [1, 1];
  for (let i = 2; i <= steps; i++) {
    ways[i] = ways[i - 1] + ways[i - 2];
  }
  return ways[steps];
}

console.log(climb(10), climb(45));
```
Output:
```text
89 1836311903
```

## quiz
1. In which order does tabulation compute states?
   - [ ] Randomly
   - [x] So that every dependency is computed before it is used
   - [ ] From the answer to the base cases
   - [ ] Alphabetically
   > The recurrence reads earlier entries only.
2. Why is the coin loop on the outside when counting combinations?
   - [ ] To speed up the code
   - [x] So each combination is counted once rather than as several orderings
   - [ ] To avoid base cases
   - [ ] To use less memory
   > A fixed coin order prevents counting 1 + 2 and 2 + 1 separately.
3. How many ways are there to make 5 with coins 1, 2 and 5?
   - [ ] 3
   - [x] 4
   - [ ] 5
   - [ ] 6
   > The ways are 5, 2+2+1, 2+1+1+1 and five ones.
4. What is a main advantage of tabulation over memoization?
   - [ ] It computes fewer states
   - [x] It avoids recursion and its stack limits
   - [ ] It needs no table
   - [ ] It works for any recurrence without ordering
   > Iteration over a table has no call overhead or depth limit.

# 1D DP Patterns
kind: algorithm
time: O(n) for the standard one-dimensional patterns, as each entry is computed from a constant number of earlier entries; patterns with an inner loop over earlier entries are O(n squared).
space: O(n) for the table, reducible to O(1) when each entry depends only on the previous one or two.

## intro
A large share of dynamic programming problems have a state described by one number: a position in an array, an amount, a number of steps. The table is a single row, and the recurrence connects each entry to a few earlier ones. Learning the handful of one-dimensional patterns lets you solve many problems quickly.

## theory
Pattern 1: Fibonacci-like recurrences. The value at i depends on the values at i − 1 and i − 2. Examples: climbing stairs (ways to reach step n using steps of 1 or 2), tiling a 2 by n board with dominoes, and counting binary strings with no two adjacent ones.

Pattern 2: take or skip. At each item either take it (and skip its neighbour) or skip it. House robber: `best[i] = max(best[i − 1], best[i − 2] + value[i])`. For the values 2, 7, 9, 3 and 1 the maximum is 12 (2 + 9 + 1), and for 1, 2, 3 and 1 it is 4 (1 + 3).

Pattern 3: minimum cost to reach the end. Min cost climbing stairs: pay the cost of a step to climb one or two steps. `best[i] = min(best[i − 1] + cost[i − 1], best[i − 2] + cost[i − 2])`. For the costs 10, 15 and 20 the minimum is 15, and for 1, 100, 1, 1, 1, 100, 1, 1, 100 and 1 it is 6.

Pattern 4: counting decodings. The string of digits `226` can be decoded as letters in 3 ways (BZ, VF, BBF); `12` in 2 ways; `06` in 0 ways, because a leading zero is invalid. The recurrence adds the count for the previous position when the single digit is valid (1 to 9) and the count from two positions back when the pair forms a number from 10 to 26.

Pattern 5: unbounded choices over amounts. Coin change and rod cutting loop over all choices for each amount: `best[a] = min over coins c of best[a − c] + 1`. Counting versions use additions.

Pattern 6: longest or best ending at i. Define `d[i]` as the best value of a structure that ends at position i, then combine with the best over earlier positions (longest increasing subsequence, maximum subarray with Kadane's recurrence `d[i] = max(a[i], d[i − 1] + a[i])`).

Pattern 7: word break. `ok[i]` is true if the prefix of length i can be split into dictionary words, which is true when some j less than i has `ok[j]` and the substring from j to i is in the dictionary. This has an inner loop and costs O(n squared) substring checks.

Steps for any one-dimensional problem:

- Say in words what `d[i]` means (best for the first i items, best ending at i, ways to reach i)
- Write the recurrence in terms of earlier entries
- Set the base cases for i = 0 (and 1 if needed)
- Decide the answer: `d[n]` or the maximum over all entries
- Check the recurrence on a tiny input by hand
- Reduce space if only the last one or two entries are needed

Space reduction: for patterns that look back one or two positions, keep two variables instead of an array, as the house robber function does with `prev` and `cur`.

Edge cases: an empty array (answer zero), one element, and inputs with zeros or negative numbers; check that the base cases agree with the problem statement (for example, houses with all zero values).

## explain
1. State what d[i] means in plain words.
2. Write the recurrence using a few earlier entries.
3. Fill the base cases for the smallest indices.
4. Loop from the smallest index to n and compute each entry.
5. Choose the answer entry or the maximum over the table.
6. Replace the array with two variables when only the last two entries are used.

## example
The Python function solves house robber with two variables and returns 12 for `[2, 7, 9, 3, 1]` and 4 for `[1, 2, 3, 1]`. The JavaScript functions compute the minimum cost of climbing stairs, 15 for `[10, 15, 20]` and 6 for the ten-step example, and count the decodings of digit strings: 3 for `226`, 2 for `12` and 0 for `06`.

## real
Pricing engines compute best purchase schedules, text messaging systems count the ways to decode encoded streams, and planners choose non-adjacent time slots to maximise value.

## pros
- Small, regular recurrences that are easy to implement
- Linear time for most patterns
- Constant space is often possible

## cons
- Choosing the meaning of d[i] needs practice
- Patterns with an inner loop become quadratic
- Edge cases with zeros and empty input are easy to miss

## uses
- Stair, tiling and path counting problems
- Selecting non-adjacent items for maximum value
- Counting decodings and segmentations
- Best subsequence ending at each position

## mistakes
- Using the wrong base case for the empty or one-element input
- Taking adjacent elements in a take-or-skip pattern
- Not treating a leading zero as invalid in decoding problems
- Returning the last entry when the answer is the maximum over all entries

## interview
**Q:** What is the recurrence for the house robber problem?
**A:** best[i] = max(best[i − 1], best[i − 2] + value[i]): either skip house i, or rob it and add the best from two houses back; two variables suffice.

**Q:** How do you count decodings of a digit string?
**A:** Add the count at the previous position when the current digit is not zero, and add the count from two positions back when the last two digits form a number from 10 to 26.

**Q:** When can a one-dimensional table be replaced by variables?
**A:** When each entry depends only on a fixed number of immediately preceding entries, so older entries can be discarded.

## summary
One-dimensional dynamic programming covers stairs, take-or-skip, minimum cost, decoding and best-ending-at-i patterns, each with a short recurrence and linear time. Define d[i] clearly, fix the base cases and reduce the space when only recent entries matter.

## codenote
The Python sample solves house robber. The JavaScript sample solves two other one-dimensional patterns.

## code
### python
```python
def rob(values):
    skipped, best = 0, 0
    for value in values:
        skipped, best = best, max(best, skipped + value)
    return best

print(rob([2, 7, 9, 3, 1]), rob([1, 2, 3, 1]))
```
Output:
```text
12 4
```
### javascript
```javascript
function minCost(costs) {
  let two = 0;
  let one = 0;
  for (let i = 2; i <= costs.length; i++) {
    [two, one] = [one, Math.min(one + costs[i - 1], two + costs[i - 2])];
  }
  return one;
}

function decodings(digits) {
  let previous = 1;
  let current = digits[0] === "0" ? 0 : 1;
  for (let i = 2; i <= digits.length; i++) {
    let next = 0;
    if (digits[i - 1] !== "0") next += current;
    const pair = Number(digits.slice(i - 2, i));
    if (pair >= 10 && pair <= 26) next += previous;
    [previous, current] = [current, next];
  }
  return current;
}

console.log(minCost([10, 15, 20]), minCost([1, 100, 1, 1, 1, 100, 1, 1, 100, 1]));
console.log(decodings("226"), decodings("12"), decodings("06"));
```
Output:
```text
15 6
3 2 0
```

## quiz
1. What does best[i] represent in the house robber recurrence?
   - [ ] The value of house i
   - [x] The maximum value obtainable from the first i houses
   - [ ] The number of houses robbed
   - [ ] The cost of house i
   > It includes the choice to skip or take each house.
2. How many ways can the digits 226 be decoded?
   - [ ] 1
   - [ ] 2
   - [x] 3
   - [ ] 4
   > BZ, VF and BBF are the valid decodings.
3. Why can the house robber table be replaced by two variables?
   - [ ] The array is small
   - [x] Each entry depends only on the previous two entries
   - [ ] The values are positive
   - [ ] The recurrence has no base case
   > Older entries are never read again.
4. What is the minimum cost to climb the cost array 10, 15, 20?
   - [ ] 10
   - [x] 15
   - [ ] 20
   - [ ] 45
   > Start at the 15 step and jump past the end.

# 2D DP Patterns
kind: algorithm
time: O(R · C) for a table with R rows and C columns where each cell takes constant time; O(n · m) for problems on two sequences of lengths n and m.
space: O(R · C) for the full table, reducible to O(C) or O(min(R, C)) when each row depends only on the previous row.

## intro
When the state needs two numbers, such as a row and a column in a grid or positions in two strings, the dynamic programming table becomes two-dimensional. Most classical problems fit a handful of grid-shaped recurrences, so learning to read the dependency arrows between neighbouring cells is the key skill.

## theory
Shapes of two-dimensional state:

- Grid paths: `t[r][c]` depends on the cell above `t[r − 1][c]` and the cell to the left `t[r][c − 1]`. Unique paths counts routes with `t = above + left`; minimum path sum uses `t = grid[r][c] + min(above, left)`.
- Two sequences: `t[i][j]` is the answer for the first i items of one sequence and the first j of the other, depending on `t[i − 1][j − 1]`, `t[i − 1][j]` and `t[i][j − 1]` (longest common subsequence, edit distance)
- Interval: `t[i][j]` is the answer for the range from i to j, computed by increasing length (matrix chain multiplication, palindromic substrings, burst balloons)
- Items and capacity: `t[i][w]` is the best value using the first i items with capacity w (knapsack)
- Position and a small extra parameter: day and holdings in stock trading, index and remaining budget, node and mask in bitmask problems

Example 1: minimum path sum. In the grid with rows `1 3 1`, `1 5 1` and `4 2 1`, the table gives the best cost to reach each cell by moving right or down. The first row accumulates to `1, 4, 5`, the first column to `1, 2, 6`, and the final cell is 7, along the path 1 → 3 → 1 → 1 → 1.

Example 2: unique paths with obstacles. A cell with an obstacle has zero paths; other cells add the counts from above and the left. In a 3 by 3 grid with an obstacle in the centre there are 2 paths.

Example 3: the number of paths in an empty 3 by 7 grid is 28, in a 3 by 3 grid it is 6, and in a 10 by 10 grid it is 48,620, matching the binomial coefficient C(18, 9). The table version computes this in 100 additions.

Procedure:

- Name the axes (row and column, or the two prefix lengths) and say what `t[i][j]` means
- Set the first row and first column from the base cases
- Fill row by row so that the cell above and to the left are ready
- State the answer cell, often the bottom-right corner
- Check one cell by hand against the recurrence

Reconstructing the path: store parent choices or walk back from the answer, at each cell moving to the neighbour that produced its value.

Cost and memory: R times C cells, constant work each. If each row depends only on the previous row, keep two rows, or even one row updated in place when the direction of updates avoids overwriting needed values (see the space optimisation lesson).

Common mistakes: swapping row and column indices, reading outside the table on the border (handle row 0 and column 0 explicitly), initialising with zero when the problem needs infinity, and forgetting that a blocked start or end cell makes the answer zero.

Larger dimensions: three-dimensional tables appear when a third parameter is needed (for example two strings plus a third, or k transactions in stock trading). The same ideas apply, with more memory.

## explain
1. Decide the two parameters of the state and what each entry means.
2. Initialise the first row and column from the base cases.
3. Fill the table row by row with the recurrence.
4. Handle borders and blocked cells explicitly.
5. Read the answer from the final cell.
6. Optionally reconstruct the path and reduce memory.

## example
The Python programs compute the minimum path sum 7 for the grid with rows `1 3 1`, `1 5 1` and `4 2 1`, and the number of paths 2 in a 3 by 3 grid whose centre is blocked. The JavaScript function fills the path counting table and prints 28 for a 3 by 7 grid, 6 for 3 by 3 and 48620 for 10 by 10.

## real
Image seam carving finds minimal energy paths through a grid, robots plan routes on occupancy grids, and sequence alignment tools in genomics fill two-dimensional tables.

## pros
- Handles grids and two-sequence problems uniformly
- Straightforward row by row evaluation
- Path reconstruction is easy from the table

## cons
- Memory grows with the product of dimensions
- Border cases cause many off-by-one bugs
- Larger state spaces become too big quickly

## uses
- Counting and optimising grid paths
- Comparing two sequences
- Interval problems solved by length
- Knapsack and budgeted choices

## mistakes
- Mixing up row and column indices
- Reading the cell above or left on the border without a check
- Not setting blocked cells to zero paths
- Initialising minimisation tables with zero

## interview
**Q:** What is the recurrence for the minimum path sum in a grid?
**A:** t[r][c] = grid[r][c] + min(t[r − 1][c], t[r][c − 1]), with the first row and column accumulating from the start, and the answer is the bottom-right cell.

**Q:** How do obstacles change the unique paths recurrence?
**A:** A cell with an obstacle gets zero paths, and every other cell is the sum of the paths from above and from the left.

**Q:** How can the memory of a grid dynamic programming table be reduced?
**A:** Keep only the previous row, or a single row updated in place, because each cell depends only on the cell above and the cell to the left.

## summary
Two-dimensional dynamic programming handles grids, pairs of sequences, intervals and item-capacity tables with R times C cells and constant work per cell. Define the table, set the borders, fill in dependency order and consider row-wise space reduction.

## codenote
The Python sample covers minimum path sum and obstacles. The JavaScript sample counts grid paths.

## code
### python
```python
def min_path_sum(grid):
    rows, cols = len(grid), len(grid[0])
    table = [[0] * cols for _ in range(rows)]
    for r in range(rows):
        for c in range(cols):
            best = min(table[r - 1][c] if r else float("inf"), table[r][c - 1] if c else float("inf"))
            table[r][c] = grid[r][c] + (0 if best == float("inf") else best)
    return table[-1][-1]

def paths_with_obstacles(grid):
    rows, cols = len(grid), len(grid[0])
    table = [[0] * cols for _ in range(rows)]
    for r in range(rows):
        for c in range(cols):
            if grid[r][c]:
                continue
            if r == 0 and c == 0:
                table[r][c] = 1
            else:
                table[r][c] = (table[r - 1][c] if r else 0) + (table[r][c - 1] if c else 0)
    return table[-1][-1]

print(min_path_sum([[1, 3, 1], [1, 5, 1], [4, 2, 1]]))
print(paths_with_obstacles([[0, 0, 0], [0, 1, 0], [0, 0, 0]]))
```
Output:
```text
7
2
```
### javascript
```javascript
function countPaths(rows, cols) {
  const table = Array.from({ length: rows }, () => Array(cols).fill(1));
  for (let r = 1; r < rows; r++) {
    for (let c = 1; c < cols; c++) {
      table[r][c] = table[r - 1][c] + table[r][c - 1];
    }
  }
  return table[rows - 1][cols - 1];
}

console.log(countPaths(3, 7), countPaths(3, 3), countPaths(10, 10));
```
Output:
```text
28 6 48620
```

## quiz
1. Which neighbours does a grid path count depend on?
   - [ ] The cells diagonally below
   - [x] The cell above and the cell to the left
   - [ ] All cells in the column
   - [ ] The last cell only
   > Moves go right or down, so paths arrive from above or from the left.
2. How many paths exist in a 3 by 3 grid moving right or down?
   - [ ] 3
   - [x] 6
   - [ ] 9
   - [ ] 27
   > The table gives C(4, 2) = 6.
3. What is the table value for a cell containing an obstacle?
   - [ ] One
   - [x] Zero paths
   - [ ] The value of the cell above
   - [ ] Infinity
   > No path can pass through a blocked cell.
4. What is the minimum path sum of the grid with rows 1 3 1, 1 5 1, 4 2 1?
   - [ ] 5
   - [x] 7
   - [ ] 9
   - [ ] 11
   > The path 1, 3, 1, 1, 1 costs 7.
