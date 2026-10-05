# Why Complexity Matters
kind: concept
time: Not an algorithmic topic — this lesson motivates the analysis of running time rather than analysing one algorithm. The figures below show how steeply cost can grow with input size.
space: Not an algorithmic topic — the same growth reasoning applies to memory, treated in a separate lesson.

## intro
A program that works on ten inputs may be useless on ten million. Complexity analysis is the habit of asking how the cost of an algorithm grows as its input grows, so that you can predict, before running anything, whether a solution will finish in a second, an hour or longer than the age of the universe.

## theory
Why measure growth instead of seconds:

- Wall-clock time depends on the machine, the language, the compiler and what else is running. Counting basic operations as a function of the input size n is independent of all that.
- Small inputs hide the problem. An exponential algorithm and a linear one look equally fast for n = 10 and diverge catastrophically after that.
- Hardware helps only by constant factors. A machine that is a thousand times faster speeds a quadratic algorithm up by a factor of a thousand, but an input that is a thousand times larger makes it a million times slower.

Typical growth classes, from gentle to explosive: constant, logarithmic, linear, linearithmic (n log n), quadratic, cubic, exponential and factorial. For n = 1,000,000 a linear algorithm needs about a million steps, an n log n algorithm about twenty million, and a quadratic algorithm a million million. At a billion simple operations per second, that quadratic run takes about 17 minutes, while the linear one takes a millisecond.

Exponential algorithms are hopeless beyond tiny inputs: 2 to the power 60 operations at a billion per second take about 36 years.

Practical consequences:

- Choosing the right data structure or algorithm usually matters more than micro-optimising code
- Limits in problem statements (n up to 100,000, a one second time limit) tell you which complexity is acceptable
- Scalability: a service that doubles its users should not quadruple its costs
- Energy and cloud costs scale with the work done

Complexity analysis is a tool for decisions, and it complements measurement: analysis predicts the trend, profiling finds the real bottleneck.

## explain
1. Identify what n means in the problem: the number of items, the size of a number, the length of a string.
2. Estimate how many basic steps the algorithm takes as a function of n.
3. Compare with the budget: roughly 10 to the power 8 simple operations per second in a typical contest or service.
4. If the estimate is too large, look for a better algorithm or data structure, not a faster computer.
5. Confirm by measuring on realistic data.
6. Re-check when the expected input size changes.

## example
The Python table lists n, n log n and n squared for n of 10, 100, 1,000 and 1,000,000. At a million items the linear count is 1,000,000, the n log n count is about 19.9 million and the quadratic count is 10 to the power 12, which is a hundred thousand times larger than n log n. The final line converts 2 to the power 60 operations into years at a billion operations per second, about 36.6 years. The JavaScript line shows that at 100,000 items a quadratic algorithm needs 10 seconds at that speed while a linear one needs 0.0001 seconds.

## real
Search engines, databases and recommendation systems operate on billions of items, so only near-linear algorithms are viable, and many production incidents come from a loop that was fine in testing and quadratic in production.

## pros
- Predicts behavior on inputs you have not run yet
- Independent of hardware and language
- Guides the choice of algorithm before any code is written

## cons
- Ignores constant factors that matter in practice
- Needs a clear definition of the input size
- Real costs also depend on memory, caching and input shape

## uses
- Deciding whether a solution can meet a time limit
- Comparing two designs before building them
- Explaining why a system slows down as data grows
- Setting up capacity and cost estimates

## mistakes
- Testing only with small inputs and assuming the program scales
- Optimising code that sits on a bad algorithm
- Ignoring hidden loops inside library calls
- Assuming that faster hardware fixes a bad growth rate

## interview
**Q:** Why do we analyse algorithms by growth rate instead of measuring seconds?
**A:** Seconds depend on hardware, language and load, while the number of operations as a function of input size describes the algorithm itself and predicts how it behaves as inputs grow.

**Q:** Why can't a faster computer rescue an exponential algorithm?
**A:** Each additional input element multiplies the work, so a machine a thousand times faster only handles a few more elements before the cost explodes again.

**Q:** How can input limits in a problem statement guide algorithm choice?
**A:** If n can be 100,000 with a one second limit, an O(n squared) solution needs ten billion steps and is too slow, so you need roughly O(n log n) or better.

## summary
Complexity analysis predicts how cost grows with input size. Count operations, compare against a budget, prefer better growth rates to faster machines, and confirm with measurements.

## codenote
The Python sample prints growth for several sizes and an exponential estimate in years. The JavaScript sample compares linear and quadratic time at a fixed speed.

## code
### python
```python
import math

for n in (10, 100, 1000, 10 ** 6):
    print(n, n, round(n * math.log2(n)), n ** 2)

years = 2 ** 60 / 1e9 / (3600 * 24 * 365)
print(round(years, 1))
```
Output:
```text
10 10 33 100
100 100 664 10000
1000 1000 9966 1000000
1000000 1000000 19931569 1000000000000
36.6
```
### javascript
```javascript
const n = 1e5;
const opsPerSecond = 1e9;
console.log((n * n) / opsPerSecond, n / opsPerSecond);
```
Output:
```text
10 0.0001
```

## quiz
1. Why is analysing growth better than timing a single run?
   - [ ] Timing is impossible
   - [x] Growth is independent of the machine and predicts behavior on larger inputs
   - [ ] Growth is always faster to compute
   - [ ] Timings never change
   > Operation counts describe the algorithm rather than the environment.
2. How does the work of a quadratic algorithm change when the input grows tenfold?
   - [ ] It grows tenfold
   - [x] It grows a hundredfold
   - [ ] It stays the same
   - [ ] It doubles
   > Squaring the input size squares the work.
3. Why are exponential algorithms impractical for large inputs?
   - [ ] They use too many variables
   - [x] Each extra element multiplies the work, so cost explodes
   - [ ] They cannot be written in code
   - [ ] They only work on strings
   > Even small increases in n make the running time astronomically larger.
4. What does a limit of n up to 100,000 and one second suggest about the intended solution?
   - [ ] Brute force over all pairs
   - [x] Something near O(n log n) or better
   - [ ] An exponential search
   - [ ] Any complexity will do
   > Around 10 to the power 8 simple operations fit in a second.

# Counting Operations
kind: algorithm
time: O(n) for a single loop of n passes with a constant-cost body, O(n²) for two nested loops, about n²/2 passes for a triangular nested loop, and about log₂ n passes for a loop that halves its variable.
space: O(1) for the counters used in the examples.

## intro
Every complexity result starts with counting: how many basic steps does the algorithm perform for an input of size n? Learning to count loop passes and statements accurately, then simplifying the count, is the core skill behind Big-O notation.

## theory
What counts as a basic operation: an assignment, an arithmetic operation, a comparison, an array access or a function call with constant cost. The exact set does not matter for growth rate, as long as each costs a constant.

Counting rules:

- Sequence: add the costs of consecutive statements
- Loop: multiply the number of passes by the cost of the body
- Nested loops: multiply the pass counts when they are independent; sum over the outer variable when the inner count depends on it
- Conditional: take the cost of the more expensive branch for a worst-case bound
- Function call: add the cost of the called function, which may itself depend on its arguments
- Loops that halve or double the variable run about log₂ n times

Useful sums: `1 + 2 + ... + n = n(n+1)/2`, which is about n²/2; `1 + 2 + 4 + ... + 2^k = 2^(k+1) - 1`; a constant added n times is `c·n`.

Example: a loop over n items with body of 3 operations plus a constant setup costs `T(n) = 3n + 2`. Dropping the constant factor and the lower-order term gives O(n). A nested loop where the inner loop runs from i + 1 to n makes `n(n-1)/2` comparisons, which is O(n²).

Instrumenting code is a reliable way to check your counting: add a counter, run for several sizes and compare with the formula. If doubling n doubles the count, the cost is linear; if it quadruples, quadratic; if it adds a constant, logarithmic.

Common mistakes are forgetting that library functions hide loops (`in` on a list, slicing, `sum`, `sorted`), mixing up different input sizes (n items versus m queries), and ignoring that the loop bound itself may be an expression like n log n.

## explain
1. Decide what n is and which operations you will count.
2. Count the statements outside the loops.
3. For each loop, find the number of passes and the cost of one pass.
4. Combine with the rules for sequence, nesting and conditionals.
5. Simplify by dropping constants and lower-order terms.
6. Verify by running with a counter on a few sizes.

## example
The Python program counts passes for n of 4, 8 and 16. A single loop makes n passes. Two independent nested loops make n squared passes. A triangular loop with the inner range starting at i + 1 makes 6, 28 and 120 passes, matching n(n-1)/2. A loop that halves its variable until it reaches 1 makes 2, 3 and 4 passes. In JavaScript, a binary search for a value larger than every element of a sorted array of 1,024 items makes 11 iterations.

## real
Profilers count function calls and loop iterations, and engineers estimate costs on paper exactly this way when reviewing designs. A counter inserted into a suspect loop often reveals a hidden quadratic faster than reading the code.

## pros
- Gives exact formulas that can be simplified to Big-O
- Checkable by instrumenting code
- Builds intuition about what loops cost

## cons
- Tedious for complicated control flow
- Depends on deciding what counts as one operation
- Hidden costs in library calls are easy to miss

## uses
- Deriving the running time of loops and nested loops
- Verifying an analysis with counters
- Comparing two implementations of the same task
- Estimating performance in design reviews

## mistakes
- Treating a nested loop with a dependent bound as n squared passes exactly
- Forgetting the cost of operations hidden inside library calls
- Mixing up different input sizes
- Counting only the loops and ignoring work outside them

## interview
**Q:** How many comparisons does the pair loop for i in range(n) with j in range(i + 1, n) make?
**A:** n times (n minus 1) divided by 2, because the inner loop runs n minus 1 times for the first i, n minus 2 for the next, down to zero, and these sum to that value.

**Q:** How do you analyse a loop whose variable is doubled each time?
**A:** It runs about log base 2 of n times, since it takes that many doublings to reach n, so the loop is logarithmic.

**Q:** How can you verify your operation count?
**A:** Instrument the code with a counter, run it for several input sizes and check that the counts match your formula and grow as predicted when n doubles.

## summary
Count basic operations with rules for sequences, loops and nesting, use the standard sums, simplify to the dominant term and confirm with a counter. The count is the bridge between code and Big-O.

## codenote
The Python sample counts passes for four loop shapes. The JavaScript sample counts the iterations of a binary search.

## code
### python
```python
def counts(n):
    linear = sum(1 for _ in range(n))
    quadratic = sum(1 for _ in range(n) for _ in range(n))
    triangular = sum(1 for i in range(n) for _ in range(i + 1, n))
    halving, value = 0, n
    while value > 1:
        value //= 2
        halving += 1
    return linear, quadratic, triangular, halving

for n in (4, 8, 16):
    print(n, *counts(n))
```
Output:
```text
4 4 16 6 2
8 8 64 28 3
16 16 256 120 4
```
### javascript
```javascript
const sorted = Array.from({ length: 1024 }, (_, i) => i);
let low = 0;
let high = sorted.length - 1;
let iterations = 0;
while (low <= high) {
  iterations++;
  const mid = Math.floor((low + high) / 2);
  if (sorted[mid] < 5000) low = mid + 1;
  else high = mid - 1;
}
console.log(iterations);
```
Output:
```text
11
```

## quiz
1. How many passes does a triangular nested loop make for n = 8?
   - [ ] 16
   - [ ] 36
   - [x] 28
   - [ ] 64
   > The count is 8 times 7 divided by 2.
2. How many times does a loop that repeatedly halves 16 until it reaches 1 run?
   - [ ] 2
   - [ ] 3
   - [x] 4
   - [ ] 16
   > The values processed are 16, 8, 4 and 2.
3. What do you do with consecutive statements when counting?
   - [ ] Multiply their costs
   - [x] Add their costs
   - [ ] Take the smaller
   - [ ] Ignore them
   > Sequential work adds.
4. How can you tell from counts that an algorithm is quadratic?
   - [ ] Counts stay constant
   - [x] Doubling n roughly quadruples the count
   - [ ] Doubling n adds one
   - [ ] Doubling n doubles the count
   > That is the signature of n squared growth.

# Big O Notation
kind: concept
time: Not an algorithmic topic — Big O is the language used to state an upper bound on the growth of running time, not an algorithm with its own running time.
space: Not an algorithmic topic — the same notation bounds memory use.

## intro
Big O notation describes how an algorithm's cost grows for large inputs by giving an upper bound that ignores constants and small terms. When someone says a sort is O(n log n) or a lookup is O(1), they are using Big O to compress an exact operation count into a single comparable shape.

## theory
Formal definition: f(n) is O(g(n)) if there exist positive constants c and n₀ such that `f(n) <= c * g(n)` for all `n >= n₀`. In words, beyond some input size, f never exceeds a constant multiple of g.

For example, `f(n) = 3n² + 5n + 2` is O(n²): choosing c = 4, the inequality `3n² + 5n + 2 <= 4n²` holds when `n² >= 5n + 2`, which is true for every n from 6 on. So c = 4 and n₀ = 6 witness the claim.

Simplification rules:

- Drop constant factors: 100n is O(n)
- Drop lower-order terms: n² + n is O(n²)
- Keep the dominant term: the one that grows fastest
- Sums take the larger: O(n) + O(n²) is O(n²)
- Products multiply: nested loops of n and m passes give O(n · m)
- Logarithm bases do not matter: log₂ n and log₁₀ n differ by a constant factor
- Different variables stay separate: O(n + m) does not simplify

Common classes in increasing order: O(1), O(log n), O(√n), O(n), O(n log n), O(n²), O(n³), O(2ⁿ), O(n!). Big O is an upper bound, so a linear algorithm is also, technically, O(n²); in practice we state the tightest bound we can prove.

What Big O does not say: it says nothing about exact speed (an O(n) algorithm with a huge constant can lose to an O(n²) one for small n), nor about which case it describes unless stated (worst case is the usual default), nor about the memory it needs unless space complexity is discussed.

Reading it aloud: "O of n squared" or "order n squared". Typical statements: array index O(1), binary search O(log n), scanning a list O(n), good sorting algorithms O(n log n), comparing all pairs O(n²), subsets O(2ⁿ), permutations O(n!).

## explain
1. Count the operations as a function of n.
2. Keep only the fastest-growing term.
3. Remove its constant coefficient.
4. State it in terms of the right variables, possibly several.
5. Say which case you mean: worst, average or best.
6. If asked to prove it, choose c and n₀ and verify the inequality.

## example
The Python program searches for the smallest n₀ after which `3n² + 5n + 2 <= 4n²` holds for all tested n and finds 6, confirming that 4 and 6 are valid witnesses for O(n²). The JavaScript lines show the ratio of the same function to n squared for n of 10, 100, 1,000 and 10,000: 3.5200, 3.0502, 3.0050 and 3.0005. The ratio approaches the constant 3, which is exactly why the lower-order terms can be ignored for large n.

## real
Documentation of libraries and standard data structures states Big O costs (for example that appending to a dynamic array is amortised O(1) and a hash lookup is O(1) on average), and technical interviews expect fluent use of the notation.

## pros
- Compact, machine-independent summary of scalability
- Easy to compare algorithms at a glance
- Composes simply through the rules for sums and products

## cons
- Hides constants and lower-order terms that matter for small inputs
- An upper bound can be loose and misleading
- Says nothing about memory or real hardware effects

## uses
- Stating and comparing the cost of algorithms
- Documenting the performance of data structure operations
- Reasoning about whether a solution will scale
- Communicating in interviews and design reviews

## mistakes
- Keeping constants and lower-order terms in the final answer
- Confusing O with an exact or tight bound
- Treating a logarithm's base as important
- Adding O(n) and O(m) terms as if they were the same variable

## interview
**Q:** What is the formal definition of f(n) = O(g(n))?
**A:** There are positive constants c and n zero such that f(n) is at most c times g(n) for all n greater than or equal to n zero. Beyond some size, g scaled by a constant bounds f from above.

**Q:** Why is 3n squared plus 5n plus 2 equal to O(n squared)?
**A:** For large n the n squared term dominates; for example with c equal to 4 the inequality holds for every n of at least 6, so the lower-order terms and the coefficient do not change the growth rate.

**Q:** Does the base of a logarithm matter in Big O?
**A:** No. Logarithms of different bases differ by a constant factor, which Big O ignores, so log base 2 and log base 10 are both written O(log n).

## summary
Big O gives an upper bound on growth: drop constants and lower-order terms, keep the dominant term and say which case you mean. It compares algorithms by shape, not by exact speed.

## codenote
The Python sample finds a valid threshold for the definition. The JavaScript sample shows the ratio converging to the leading coefficient.

## code
### python
```python
def f(n):
    return 3 * n * n + 5 * n + 2

c = 4
holds = [n for n in range(1, 1000) if f(n) <= c * n * n]
failing = [n for n in range(1, 1000) if f(n) > c * n * n]
print(max(failing) + 1, holds[-1] == 999)
```
Output:
```text
6 True
```
### javascript
```javascript
const f = (n) => 3 * n * n + 5 * n + 2;
for (const n of [10, 100, 1000, 10000]) {
  console.log(n, (f(n) / (n * n)).toFixed(4));
}
```
Output:
```text
10 3.5200
100 3.0502
1000 3.0050
10000 3.0005
```

## quiz
1. What does f(n) = O(g(n)) say?
   - [ ] f is exactly g
   - [x] Beyond some n, f is bounded above by a constant multiple of g
   - [ ] f is smaller than g for all n
   - [ ] g is smaller than f
   > It is an upper bound up to a constant factor.
2. What is 5n squared plus 100n plus 7 in Big O?
   - [ ] O(n)
   - [x] O(n squared)
   - [ ] O(100n)
   - [ ] O(n cubed)
   > The quadratic term dominates and the constant is dropped.
3. Why is the base of the logarithm ignored?
   - [ ] Logarithms have no base
   - [x] Different bases differ only by a constant factor
   - [ ] Base 2 is always used
   - [ ] It changes the sign
   > Constant factors do not matter in Big O.
4. What should you assume when no case is named?
   - [ ] The best case
   - [x] The worst case
   - [ ] The average of best and worst
   - [ ] The empty input
   > Worst-case bounds are the usual default.

# Big Omega Notation
kind: concept
time: Not an algorithmic topic — Big Omega is notation for a lower bound on growth, used to state that an algorithm or problem needs at least a certain amount of work.
space: Not an algorithmic topic — lower bounds apply to memory as well, though they are less often discussed.

## intro
Big O says an algorithm takes at most a given amount of work; Big Omega says it takes at least that much. Lower bounds are how we know that no cleverness can beat a certain cost, for instance that any algorithm which must look at every element needs at least linear time.

## theory
Definition: f(n) is Ω(g(n)) if there exist positive constants c and n₀ such that `f(n) >= c * g(n)` for all `n >= n₀`. It is the mirror image of Big O: g scaled by a constant bounds f from below.

Examples:

- `3n² + 5n + 2` is Ω(n²): it is at least 3n² for every n of at least 1
- Linear search has best-case time Ω(1) (the item is first) and worst-case time Ω(n); an algorithm that scans everything is Ω(n) in every case
- Any comparison-based sorting algorithm needs Ω(n log n) comparisons in the worst case. The argument: sorting must distinguish between n! possible orderings, each comparison has two outcomes, so at least `log₂(n!)` comparisons are needed, and `log₂(n!)` is about n log₂ n. Thus no comparison sort can beat n log n, and merge sort and heap sort are optimal.
- Finding the maximum of n unordered numbers requires at least n - 1 comparisons, because every element other than the maximum must lose a comparison, so the problem is Ω(n)

Lower bounds for algorithms and for problems differ:

- A lower bound for an algorithm says that this algorithm needs at least that much (for example, insertion sort takes Ω(n) even on sorted input, because it must check every element once)
- A lower bound for a problem says that every algorithm needs at least that much; it requires an argument such as the decision-tree or information-theoretic argument above, and it tells you when to stop looking for a faster algorithm

Big Omega is usually paired with a case: Ω(1) best-case for a lookup, Ω(n) in the worst case for a scan. A common misconception is that Big O means worst case and Big Omega means best case; actually, each notation can describe any case, since they bound functions, and the case is chosen separately.

## explain
1. Decide which function you are bounding: the best, worst or average-case cost, or the cost of the problem.
2. Find a simple function g that the cost cannot fall below, such as the number of elements that must be read.
3. Show a constant c and a starting point n₀ for which the inequality holds.
4. For problems, use an argument that applies to every algorithm, such as counting possible outputs.
5. Combine with an upper bound if you can: if they match, you have a tight bound.
6. State clearly which case the bound refers to.

## example
The Python function `max_with_count` finds the maximum of ten numbers and counts comparisons: it makes exactly 9, matching the lower bound of n minus 1 that holds for any algorithm. A second check confirms that `3n² + 5n + 2 >= 3n²` for every n tested, so it is Ω(n²). The JavaScript sample computes the information-theoretic minimum number of comparisons to sort 5 elements, the ceiling of log₂ of 120, which is 7, and for 10 elements the ceiling of log₂ of 3,628,800, which is 22.

## real
Cryptography and complexity theory depend on lower bounds, and in practice the sorting bound tells engineers not to search for a general comparison sort faster than n log n, while special inputs (small integers) can use non-comparison methods such as counting sort.

## pros
- Tells you when an algorithm cannot be improved
- Completes the picture with upper bounds
- Guides the search for alternatives that change the rules

## cons
- Proving lower bounds for problems is hard
- Easy to misread as best case
- Lower bounds for specific models do not apply when the model changes

## uses
- Showing that an algorithm is asymptotically optimal
- Proving that comparison sorting needs n log n comparisons
- Explaining why reading all input forces linear time
- Stating best-case costs of algorithms

## mistakes
- Equating Big O with the worst case and Big Omega with the best case
- Quoting a lower bound without stating the model of computation
- Assuming a lower bound for one algorithm applies to the problem
- Forgetting that a lower bound can be loose

## interview
**Q:** What does Ω(n log n) mean for comparison-based sorting?
**A:** Every algorithm that sorts using only comparisons needs at least a constant times n log n comparisons in the worst case, because it must distinguish among n factorial orderings and each comparison halves the possibilities at best.

**Q:** Is Big Omega the same as the best case?
**A:** No. Big Omega is a lower bound on a function and can describe the best, average or worst case; which case is a separate choice.

**Q:** Why does finding the maximum need at least n minus 1 comparisons?
**A:** Every element except the maximum must be shown to be smaller than something, and each comparison can eliminate at most one candidate.

## summary
Big Omega gives a lower bound on growth. Use it to state best-case costs and, with problem-level arguments, to prove that no algorithm can do better, as for comparison sorting.

## codenote
The Python sample counts comparisons for finding a maximum and checks a lower bound inequality. The JavaScript sample computes the information-theoretic bound.

## code
### python
```python
def max_with_count(values):
    best = values[0]
    comparisons = 0
    for value in values[1:]:
        comparisons += 1
        if value > best:
            best = value
    return best, comparisons

print(max_with_count([4, 9, 2, 7, 1, 8, 3, 6, 5, 0]))

f = lambda n: 3 * n * n + 5 * n + 2
print(all(f(n) >= 3 * n * n for n in range(1, 1000)))
```
Output:
```text
(9, 9)
True
```
### javascript
```javascript
const factorial = (n) => (n <= 1 ? 1 : n * factorial(n - 1));
const minimumComparisons = (n) => Math.ceil(Math.log2(factorial(n)));
console.log(minimumComparisons(5), minimumComparisons(10));
```
Output:
```text
7 22
```

## quiz
1. What does f(n) = Omega(g(n)) say?
   - [ ] f is bounded above by g
   - [x] Beyond some n, f is bounded below by a constant multiple of g
   - [ ] f equals g
   - [ ] f is smaller than g
   > It is the lower-bound counterpart of Big O.
2. What is the least number of comparisons needed to find the maximum of n numbers?
   - [ ] log n
   - [x] n minus 1
   - [ ] n squared
   - [ ] 1
   > Every other element must lose at least one comparison.
3. Why do comparison sorts need Omega(n log n) comparisons?
   - [ ] Because they are slow
   - [x] There are n factorial orderings and each comparison has two outcomes
   - [ ] Because of recursion
   - [ ] Because of memory
   > The decision tree needs at least log of n factorial levels.
4. Which statement is correct about Big Omega?
   - [ ] It always means the best case
   - [x] It bounds a function from below and can describe any case
   - [ ] It is the same as Big O
   - [ ] It applies only to sorting
   > The case is chosen separately from the type of bound.

# Big Theta Notation
kind: concept
time: Not an algorithmic topic — Big Theta is notation for a tight bound, stating that growth is bounded above and below by the same function.
space: Not an algorithmic topic — it can describe memory growth in the same way.

## intro
Big Theta says that a function grows exactly like another one, up to constant factors: it is both O and Ω of the same function. When people casually say an algorithm is "O(n log n)", they usually mean Θ(n log n), a bound that is neither too generous nor too pessimistic.

## theory
Definition: f(n) is Θ(g(n)) if there exist positive constants c₁, c₂ and n₀ such that `c₁ * g(n) <= f(n) <= c₂ * g(n)` for all `n >= n₀`. Equivalently, f is both O(g) and Ω(g).

Example: `f(n) = 3n² + 5n + 2` is Θ(n²) with c₁ = 3 and c₂ = 4 for all n of at least 6. It is not Θ(n) (it grows faster) and not Θ(n³) (it grows slower), though it is technically O(n³), a loose upper bound.

Why it matters: Big O alone can be a vacuous statement, since a linear algorithm is also O(n²) and O(2ⁿ). Theta pins the growth down. Saying that merge sort is Θ(n log n) in all cases tells you it never degrades and never beats that rate, while saying quicksort is O(n²) and Θ(n log n) on average distinguishes the worst from the typical case.

Properties:

- Reflexive and transitive: f is Θ(f); Θ(g) of Θ(h) is Θ(h)
- Symmetric: f is Θ(g) exactly when g is Θ(f)
- Sums and constants: Θ(f) + Θ(g) is Θ(max(f, g)); a constant factor does not change Θ
- Polynomials: a polynomial of degree d with a positive leading coefficient is Θ(n^d)
- Logarithms: log of any base is Θ(log n)
- Check by limit: if the ratio f(n) / g(n) tends to a positive finite constant, then f is Θ(g). If it tends to zero, f is o(g), strictly slower growth; if it tends to infinity, f grows strictly faster.

Using Theta well: state it when you can prove both bounds (such as for an algorithm that does the same work on every input of size n), and use O or Ω when only one direction is known. A single algorithm can be Θ(n) in its best case and Θ(n²) in its worst case, but there is no single Θ for its running time overall unless the cases match.

## explain
1. Find an upper bound O(g) with a witnessing constant.
2. Find a lower bound Ω(g) with a witnessing constant, using the same g.
3. If both hold, state Θ(g).
4. Alternatively, compute the limit of f(n) divided by g(n) and check that it is a positive constant.
5. Use Θ only for a specific case, such as the worst case, when the algorithm's cost varies with the input.
6. Remember that Θ(n log n) and Θ(n²) are different classes, even though n log n is O(n²).

## example
The Python program checks that `3n² <= 3n² + 5n + 2 <= 4n²` for every n from 6 to 999, giving the two constants. It also prints the ratio `n log₂ n / n²` for n of 10, 100 and 1,000: 0.3322, 0.0664 and 0.0100. The ratio keeps shrinking toward zero, so n log n is strictly slower growth than n² and is not Θ(n²). The JavaScript lines sum the harmonic series up to 1,000, about 7.485, and compare it with the natural logarithm of 1,000, about 6.908, illustrating that the series grows like log n.

## real
Complexity tables in textbooks and documentation report Θ results for algorithms with data-independent cost, such as merge sort, heap sort and matrix multiplication by the definition, and use O and Ω for the others.

## pros
- A tight statement of growth, neither too generous nor too pessimistic
- Easy to check with a limit
- Cleanly separates algorithms that look similar under Big O

## cons
- Requires proving both directions
- Not every algorithm has a single Θ across all inputs
- Informal speech often uses O when Θ is meant

## uses
- Stating exact growth rates of algorithms
- Comparing algorithms of different classes
- Describing worst-case and best-case behavior separately
- Writing precise complexity tables

## mistakes
- Using Big O and calling it tight without a lower bound
- Claiming one Θ for an algorithm whose cost varies by input
- Assuming Θ(n log n) and Θ(n squared) are the same because one is O of the other
- Forgetting that the same function must serve as both bounds

## interview
**Q:** What is the difference between Big O and Big Theta?
**A:** Big O is an upper bound only, so a linear algorithm is also O(n squared). Big Theta is a tight bound: the function is bounded both above and below by constant multiples of the same function.

**Q:** How can you show that f is Theta of g using limits?
**A:** Compute the limit of f(n) divided by g(n) as n grows. If it is a positive finite constant, f is Theta of g.

**Q:** Can a single algorithm have a Theta bound for its running time?
**A:** Only if the cost grows the same way for all inputs of a given size. Otherwise you state separate bounds for the best, average and worst cases.

## summary
Big Theta states a tight bound, both O and Ω of the same function. Use it when you can prove both directions, check it with limits and keep the cases separate when the cost varies with the input.

## codenote
The Python sample checks the two constants and shows a ratio tending to zero. The JavaScript sample compares the harmonic sum with a logarithm.

## code
### python
```python
import math

f = lambda n: 3 * n * n + 5 * n + 2
print(all(3 * n * n <= f(n) <= 4 * n * n for n in range(6, 1000)))

for n in (10, 100, 1000):
    print(n, f"{n * math.log2(n) / n ** 2:.4f}")
```
Output:
```text
True
10 0.3322
100 0.0664
1000 0.0100
```
### javascript
```javascript
let harmonic = 0;
for (let k = 1; k <= 1000; k++) harmonic += 1 / k;
console.log(harmonic.toFixed(3), Math.log(1000).toFixed(3));
```
Output:
```text
7.485 6.908
```

## quiz
1. What does f(n) = Theta(g(n)) mean?
   - [ ] f is at most g
   - [ ] f is at least g
   - [x] f is bounded above and below by constant multiples of g
   - [ ] f equals g exactly
   > It combines the upper and lower bounds.
2. Is 3n squared plus 5n plus 2 in Theta(n)?
   - [ ] Yes
   - [x] No, it grows faster than linear
   - [ ] Only for small n
   - [ ] Only with c equal to 3
   > The quadratic term is not bounded by a multiple of n.
3. What does a limit of f(n) divided by g(n) equal to a positive constant imply?
   - [ ] f is little o of g
   - [x] f is Theta of g
   - [ ] g is larger than f forever
   - [ ] Nothing
   > Constant ratio means the same growth rate.
4. Why is n log n not Theta of n squared?
   - [ ] They have the same constants
   - [x] The ratio of n log n to n squared tends to zero
   - [ ] Logarithms are not allowed
   - [ ] n log n is larger
   > n log n grows strictly slower.

# Best Average Worst Case
kind: algorithm
time: Linear search takes 1 comparison in the best case, n in the worst case and about (n + 1) / 2 on average for a present target. Insertion sort takes about n comparisons on sorted input and about n²/2 on reversed input.
space: O(1) extra space for both examples.

## intro
The same algorithm can run in very different times on different inputs of the same size. Best, average and worst case analysis describes that range: the luckiest input, the typical input and the unluckiest, and tells you which guarantee you can rely on.

## theory
Definitions for inputs of size n:

- Best case: the input that makes the algorithm do the least work. For linear search, the target is the first element: 1 comparison. It is rarely useful for guarantees, but it shows what an algorithm does well, such as insertion sort finishing in linear time on already sorted data.
- Worst case: the input that makes it do the most work: the target is last or absent in linear search, n comparisons. The worst case is a guarantee: no input is slower, which matters for real-time systems and for defending against adversarial inputs.
- Average case: the expected work over a stated probability distribution of inputs. For a successful linear search with a uniformly random position, the average number of comparisons is (n + 1) / 2. Average-case analysis requires assumptions about the inputs, and it can mislead if real data is not distributed like that.

These are separate from the notation. Each case is a function of n, and you may bound it with O, Ω or Θ. Statements like "quicksort is O(n²)" are about the worst case and "quicksort is O(n log n) on average" about the average case.

Examples:

- Linear search: best Θ(1), average Θ(n), worst Θ(n)
- Binary search: best Θ(1), average and worst Θ(log n)
- Insertion sort: best Θ(n) on sorted input, average and worst Θ(n²)
- Quicksort with a poor pivot choice: worst Θ(n²) for sorted input, average Θ(n log n); randomised pivots make the bad case unlikely
- Hash table lookup: average Θ(1), worst Θ(n) when many keys collide
- Merge sort: Θ(n log n) in all three cases

Choosing which to report: use the worst case when a guarantee is needed, the average when inputs are random and the cost is amortised over many runs, and the best case mostly to describe the behavior on nearly ideal inputs. Related ideas are expected time of randomised algorithms (average over the algorithm's random choices rather than the inputs) and amortised cost (average over a sequence of operations, covered separately).

## explain
1. Identify what makes inputs of the same size differ in cost: order, values, position of a match.
2. Construct the input that minimises the work: the best case.
3. Construct the input that maximises it: the worst case.
4. For the average case, state a probability model, then compute the expected number of operations.
5. Express each as a function of n and simplify.
6. Report the case that matches the requirement of the system.

## example
The Python program runs linear search for every possible target position in a list of 10 elements and counts comparisons: the best is 1, the worst 10 and the average 5.5. Insertion sort on the sorted list of six elements needs 5 comparisons, while on the reversed list it needs 15, which is 6 times 5 divided by 2. The JavaScript sample estimates the average successful search over all positions in a list of 100 elements as 50.5.

## real
Systems that must respond within a deadline are designed around worst cases, while databases and compilers rely on average-case performance of hash tables and use randomisation or good hash functions to make the worst case unlikely.

## pros
- Shows the range of behavior instead of a single number
- Worst case gives a guarantee
- Average case predicts typical performance

## cons
- Average case needs assumptions about the input distribution
- The worst case may be rare in practice and overly pessimistic
- The best case is of little use for planning

## uses
- Choosing between algorithms with different worst cases
- Designing real-time systems around the worst case
- Explaining why hash tables are fast on average
- Describing sorting algorithms in documentation

## mistakes
- Quoting the best case as the performance of an algorithm
- Assuming the average case without a defined input distribution
- Confusing Big O with the worst case
- Ignoring adversarial inputs that trigger the worst case

## interview
**Q:** What are the best, average and worst cases of linear search?
**A:** The best case is one comparison when the target is first, the worst is n comparisons when it is last or absent, and the average for a present target with a uniform position is about n plus 1 over 2.

**Q:** Why is the worst case often the reported complexity?
**A:** It is a guarantee that holds for every input of that size, which is essential for deadlines and for protection against inputs crafted to be slow.

**Q:** What is the best case for insertion sort and when does it occur?
**A:** Linear time, when the input is already sorted, because each element is compared once with its predecessor and no shifting happens.

## summary
The cost of an algorithm can vary with the input of the same size. Report best, average and worst cases with their assumptions, rely on the worst case for guarantees and on the average case for typical behavior.

## codenote
The Python sample counts comparisons for every target position and for two insertion sort inputs. The JavaScript sample computes the average position cost.

## code
### python
```python
def linear_search(items, target):
    comparisons = 0
    for item in items:
        comparisons += 1
        if item == target:
            break
    return comparisons

items = list(range(10))
costs = [linear_search(items, t) for t in items]
print(min(costs), max(costs), sum(costs) / len(costs))

def insertion_comparisons(values):
    values = values[:]
    count = 0
    for i in range(1, len(values)):
        key, j = values[i], i - 1
        while j >= 0:
            count += 1
            if values[j] <= key:
                break
            values[j + 1] = values[j]
            j -= 1
        values[j + 1] = key
    return count

print(insertion_comparisons([1, 2, 3, 4, 5, 6]), insertion_comparisons([6, 5, 4, 3, 2, 1]))
```
Output:
```text
1 10 5.5
5 15
```
### javascript
```javascript
const n = 100;
let total = 0;
for (let position = 1; position <= n; position++) total += position;
console.log(total / n);
```
Output:
```text
50.5
```

## quiz
1. What is the worst case of linear search on n elements?
   - [ ] 1 comparison
   - [x] n comparisons
   - [ ] log n comparisons
   - [ ] n squared comparisons
   > The target is last or missing.
2. What input gives insertion sort its best case?
   - [ ] A reversed list
   - [x] An already sorted list
   - [ ] A list of equal length strings
   - [ ] An empty list only
   > Each element needs only one comparison.
3. What does an average-case analysis require?
   - [ ] Nothing
   - [x] An assumption about the probability distribution of inputs
   - [ ] The worst case
   - [ ] A faster computer
   > The expected cost depends on how inputs are distributed.
4. Why design real-time systems around the worst case?
   - [ ] It is the easiest to compute
   - [x] It guarantees that no input takes longer
   - [ ] It is the most common input
   - [ ] It uses less memory
   > Deadlines must be met for every input.
