# Recursion Tree Analysis
kind: algorithm
time: Depends on the recurrence: O(n) for T(n) = T(n - 1) + O(1), O(n log n) for T(n) = 2T(n / 2) + O(n), and about O(1.618^n) for the naive Fibonacci recurrence T(n) = T(n - 1) + T(n - 2). The tree method finds these by summing the work in every level.
space: O(depth of the tree), because only one root-to-node path of frames exists at a time; this is O(n) for the linear and Fibonacci recurrences and O(log n) for the halving recurrence.

## intro
A recursion tree draws every call as a node, with its children being the calls it makes. Counting the nodes, the levels and the work at each level turns a recursive program into a number you can add up, and it is the most intuitive way to find the running time of a recursive algorithm.

## theory
How to build and read the tree:

- The root is the original call. Each node represents one call, labelled with its input size and the work it does itself, excluding the recursive calls.
- Children of a node are the calls it makes directly
- The depth of the tree is the number of levels, determined by how fast the input shrinks toward the base case
- The total work is the sum, over all nodes, of the work each does. Often it is easiest to sum level by level.

Common recurrences and their trees:

- Linear chain, `T(n) = T(n - 1) + c`: a tree with one node per level and n levels; total work is proportional to n
- Halving with one call, `T(n) = T(n / 2) + c`: log n levels with constant work each, so O(log n)
- Two halves with linear combining work, `T(n) = 2T(n / 2) + n`: level k has 2^k nodes, each of size n / 2^k, so every level does n work in total; there are log n levels, giving n log n
- Two overlapping calls, `T(n) = T(n - 1) + T(n - 2) + c`: the tree is almost complete with branching 2 for the first levels, and the number of nodes grows exponentially, about 1.618^n, with depth n
- Unbalanced splits (as in a poor quicksort pivot) give deeper trees and more work

Relationship to space: the stack holds one path from the root to the current node, so the space is proportional to the depth, not the number of nodes.

The recursion tree method is also a step toward the master theorem, which gives the answer directly for recurrences of the form `T(n) = aT(n / b) + f(n)`.

## explain
1. Write the recurrence from the code: how many calls, on what size, and how much work outside the calls.
2. Draw the first few levels: the root, its children, their children.
3. Find the size and number of nodes at level k and the work per node.
4. Compute the work per level and find a pattern.
5. Find the number of levels from the point where the size reaches the base case.
6. Sum over all levels, simplify and state the bound.

## example
Counting nodes in the Fibonacci call tree for n from 1 to 7 gives 1, 3, 5, 9, 15, 25 and 41, which grows by a factor of about 1.6 each step. For the halving recurrence with linear work, the function `halving_work` returns 4, 12, 32 and 80 for n of 2, 4, 8 and 16, which equals n times log2(n) plus n: each of the log n levels contributes n and the leaves add another n. The JavaScript sample prints the number of nodes per level of a binary split of 8, which is 1, 2, 4 and 8.

## real
Engineers sketch recursion trees to explain why merge sort is O(n log n) and naive Fibonacci is exponential, and the same picture shows where memoization can prune repeated nodes.

## pros
- A visual, intuitive method to find running time
- Shows both total work and depth at once
- Reveals repeated subproblems that caching can remove

## cons
- Drawing large trees by hand is impractical
- Unbalanced or irregular trees need careful reasoning
- The method gives an estimate unless the sums are checked

## uses
- Deriving the complexity of divide-and-conquer algorithms
- Seeing why naive Fibonacci is exponential
- Spotting repeated subproblems for memoization
- Estimating stack depth

## mistakes
- Counting the work of the recursive calls twice
- Confusing the number of nodes with the depth of the tree
- Forgetting that the leaves can contribute significant work
- Assuming the tree is balanced when the splits are uneven

## interview
**Q:** How do you find the running time of a recursive algorithm using a recursion tree?
**A:** Draw the tree of calls, compute the work done at each level, add up the levels, and express the result in terms of n using the number of levels.

**Q:** Why does the recurrence T(n) = 2T(n/2) + n give n log n?
**A:** Each level of the tree does a total of n work because the sizes of the nodes at a level sum to n, and there are about log n levels before the size reaches 1.

**Q:** Is the space used by recursion equal to the number of nodes in the tree?
**A:** No. Only the calls on the current path from the root are alive at once, so the space is proportional to the depth of the tree.

## summary
A recursion tree turns a recurrence into levels you can sum: count nodes per level, multiply by the work per node, and multiply by the number of levels. The depth gives the stack space, and the total gives the time.

## codenote
The Python sample counts nodes in the Fibonacci tree and sums work for a halving recurrence. The JavaScript sample prints the number of nodes at each level of a binary split.

## code
### python
```python
def tree_size(n):
    return 1 if n < 2 else 1 + tree_size(n - 1) + tree_size(n - 2)

print([tree_size(n) for n in range(1, 8)])

def halving_work(n):
    if n <= 1:
        return 1
    return n + 2 * halving_work(n // 2)

print([halving_work(n) for n in (2, 4, 8, 16)])
```
Output:
```text
[1, 3, 5, 9, 15, 25, 41]
[4, 12, 32, 80]
```
### javascript
```javascript
const levels = [];
let size = 8;
let nodes = 1;
while (size >= 1) {
  levels.push(nodes);
  size = size / 2;
  nodes *= 2;
}
console.log(levels);
```
Output:
```text
[ 1, 2, 4, 8 ]
```

## quiz
1. What does one node of a recursion tree represent?
   - [ ] A variable
   - [x] One call of the function
   - [ ] One line of code
   - [ ] One loop
   > The children of a node are the calls it makes.
2. How much work does each level of the tree for T(n) = 2T(n/2) + n do in total?
   - [ ] 1
   - [ ] log n
   - [x] n
   - [ ] n squared
   > The node sizes at every level add up to n.
3. What determines the stack space used by recursion?
   - [ ] The total number of nodes
   - [x] The depth of the tree, since one path is alive at a time
   - [ ] The size of the input array only
   - [ ] The number of leaves
   > Frames for finished calls are already gone.
4. Why does the Fibonacci call tree grow so fast?
   - [ ] It has a deep chain
   - [x] Each node spawns two children and the same values are recomputed
   - [ ] It uses a loop
   - [ ] It has no base case
   > The number of nodes grows roughly by a constant factor with each level of n.

# When Recursion Fails
kind: concept
time: Not applicable — this lesson is a catalogue of failure modes. Where the failure is slowness (exponential blow-up), the earlier lessons on recursion trees give the analysis.
space: Not applicable — the memory failures here, stack overflow and unbounded growth, are described as problems rather than bounded.

## intro
Recursion is elegant until it is not. It fails in a handful of well-known ways: stack overflow on deep inputs, exponential slowness from repeated work, infinite recursion from missing base cases, and bugs from shared mutable state. Recognising each symptom saves hours of debugging.

## theory
The main failure modes:

- Stack overflow. Every call uses a frame, and the stack is finite. Python stops at a recursion limit (about 1000) and raises RecursionError; in JavaScript the engine raises a RangeError; in C the program crashes with a segmentation fault. Inputs with a depth of 100,000 or more, such as a long list processed one element at a time, trigger it.
- Exponential blow-up. When a function calls itself several times on overlapping subproblems, the work explodes. Naive Fibonacci for n = 25 makes 242,785 calls, and for n = 50 more than forty billion.
- Missing or unreachable base case. The recursion never ends and ends with the same overflow as above. Typical causes: a base case that tests for equality when the argument can skip past it (n == 0 when n starts negative or odd steps by 2), or a recursive step that does not shrink the problem.
- Wrong base value. The function ends but returns incorrect results, for example returning 0 instead of 1 as the base of a product.
- Shared mutable state. Recursion that appends to a list defined outside, uses a mutable default argument or forgets to undo a change (in backtracking) gives results polluted across calls.
- Hidden cost per call. Slicing a list or string in each call (`items[1:]`) copies data and turns a linear recursion into a quadratic one.

Mitigation strategies:

- Add the base case first and test it separately
- Memoize or use dynamic programming for overlapping subproblems
- Convert deep linear recursion to a loop, or process with an explicit stack
- Pass indices instead of slices
- Raise the recursion limit only as a last resort and only with a proven bound on depth, because it risks crashing the interpreter
- Use language features such as tail-call-friendly loops, iterators or generators

## explain
1. Estimate the maximum depth for the largest input; is it below the limit?
2. Check whether the function can call itself more than once on overlapping inputs; if so, count the calls for a small case.
3. Verify the base case for every kind of input, including empty, negative and odd values.
4. Look for state outside the function that the recursion modifies.
5. Look for copies made in each call.
6. Choose the fix: memoize, loop, explicit stack, indices or restructure.

## example
In Python, `depth(500)` returns 500 because 500 frames fit, but `depth(10**6)` raises RecursionError, which the program catches and reports. Counting the calls of the naive Fibonacci function for n = 25 gives 242785, a pointer to the exponential growth. In JavaScript, a function recursing one million levels fails with a RangeError, while the same count of calls made by a loop is trivial.

## real
Production incidents have been caused by recursive parsers given maliciously deep input, and by recursive functions that worked in tests with ten items and crashed on real data with a hundred thousand.

## pros
- Knowing the failure modes lets you test for them deliberately
- Each failure has a standard remedy
- Awareness of cost prevents unpleasant surprises in production

## cons
- Failures often appear only on large or unusual inputs
- Raising limits can hide problems and crash the interpreter
- Fixes can make the code less elegant

## uses
- Reviewing recursive code before release
- Choosing between recursion and loops for a data size
- Writing tests for deep and degenerate inputs
- Diagnosing slow or crashing recursive functions

## mistakes
- Testing only with small inputs
- Raising the recursion limit instead of fixing the algorithm
- Using a base case that can be skipped over
- Mutating shared state in recursive calls without restoring it

## interview
**Q:** What causes a stack overflow in recursion?
**A:** Recursion deeper than the stack can hold, either because the recursion is unbounded (no reachable base case) or because the input is simply too deep for the language's limit.

**Q:** Why can a recursive function be correct but still unusable?
**A:** If it makes repeated calls on overlapping subproblems its running time is exponential, as in naive Fibonacci, so it never finishes for moderately large inputs.

**Q:** Is raising Python's recursion limit a good fix for RecursionError?
**A:** Usually not. It only postpones the problem and risks crashing the interpreter with a real stack overflow; converting to a loop or using memoization is safer.

## summary
Recursion fails by running too deep, by repeating work exponentially, by missing base cases and by sharing state. Test with large inputs, count calls, and be ready to switch to memoization, loops or an explicit stack.

## codenote
The Python sample demonstrates depth failure and call explosion. The JavaScript sample shows the stack failure and the loop alternative.

## code
### python
```python
def depth(n):
    return 0 if n == 0 else 1 + depth(n - 1)

print(depth(500))
try:
    depth(10 ** 6)
except RecursionError:
    print("RecursionError")

calls = 0

def fib(n):
    global calls
    calls += 1
    return n if n < 2 else fib(n - 1) + fib(n - 2)

fib(25)
print(calls)
```
Output:
```text
500
RecursionError
242785
```
### javascript
```javascript
function depth(n) {
  return n === 0 ? 0 : 1 + depth(n - 1);
}

try {
  depth(1000000);
} catch (error) {
  console.log(error.name);
}

let count = 0;
for (let i = 0; i < 1000000; i++) count++;
console.log(count);
```
Output:
```text
RangeError
1000000
```

## quiz
1. Which language error is raised by too-deep recursion in Python?
   - [ ] MemoryError
   - [x] RecursionError
   - [ ] KeyError
   - [ ] ValueError
   > The interpreter enforces a recursion depth limit.
2. Why does naive Fibonacci of 25 make hundreds of thousands of calls?
   - [ ] The number 25 is large
   - [x] The same subproblems are recomputed many times
   - [ ] It uses a loop
   - [ ] Each call prints output
   > Overlapping subproblems cause exponential growth.
3. What is the better fix for a legitimate need for very deep recursion?
   - [ ] Raise the recursion limit as high as possible
   - [x] Convert to a loop or use an explicit stack
   - [ ] Add more print statements
   - [ ] Remove the base case
   > Iteration is not limited by the call stack.
4. Why can slicing a list in each call be a problem?
   - [ ] Slices are illegal
   - [x] Each slice copies data, turning linear work into quadratic work
   - [ ] It changes the original list
   - [ ] It prevents the base case
   > Passing indices avoids the copies.

# Converting Recursion to Iteration
kind: algorithm
time: O(n) for the nested-list flattening, since each item is pushed and popped once; the other examples are also linear in their input size.
space: O(d) for the explicit stack, where d is the depth of the nesting in the worst case, but allocated on the heap, so it is not limited by the call stack; simple accumulator conversions need only O(1).

## intro
Anything a recursive function does can be done with a loop. Converting recursion to iteration removes the call-stack limit and the overhead of calls, and it is the standard remedy when a recursive solution fails on large inputs. The method depends on the shape of the recursion.

## theory
Three situations, from easiest to hardest:

- Tail recursion (or linear recursion with an accumulator) converts directly to a loop: the parameters become loop variables, and each recursive call becomes an assignment to them followed by another pass. Euclid's gcd, `gcd(a, b) = gcd(b, a % b)`, is the classic example.
- Linear recursion that combines after the call, like `n * factorial(n - 1)`, is first rewritten with an accumulator, or it is converted by running the loop in the opposite direction and building the answer up from the base case: start at 1 and multiply up to n.
- Branching recursion (tree recursion), such as tree traversal or flattening nested lists, needs an explicit stack: a list used as a stack holds the pending work. Push the starting item; while the stack is not empty, pop an item, and if it has children, push them (in reverse if order matters); otherwise handle the item. This simulates the call stack but lives on the heap and has no depth limit.

Some recursions can be turned into bottom-up dynamic programming, where a table is filled from the smallest subproblems upward; Fibonacci with two variables is an example.

Trade-offs:

- Iteration avoids stack overflow and call overhead, and usually uses less memory
- The converted code is often longer and less readable, especially with an explicit stack
- Not every recursion needs converting: depth bounded by a small constant or logarithm is safe

Always test that the iterative version gives identical results to the recursive one on a range of inputs, including the empty case.

## explain
1. Classify the recursion: tail, linear with combine, or tree.
2. For tail or accumulator forms, turn parameters into variables and the call into a loop.
3. For combine-after forms, loop from the base case upward, building the result.
4. For tree forms, create an explicit stack holding the pending items and process until it is empty.
5. Maintain the order: push children in reverse if you want left-to-right processing.
6. Compare the outputs of the two versions on many inputs, including very deep ones.

## example
The explicit-stack function `flatten_iter` pops an item; if it is a list, it pushes the elements in reverse, otherwise it appends the value to the result. For `[1, [2, [3, 4]], 5]` it returns `[1, 2, 3, 4, 5]`, equal to the recursive version. It also flattens a list nested 5000 levels deep, which the recursive version could not, and returns `[1]`. The JavaScript sample shows Euclid's algorithm in recursive and loop form, both giving a greatest common divisor of 6 for 48 and 18.

## real
Production libraries convert recursive algorithms to iterative ones to handle untrusted deep input, such as JSON documents with enormous nesting, and tree walkers in compilers often use explicit stacks.

## pros
- No call-stack limit or recursion overhead
- Handles inputs of any depth
- Often uses less memory than recursion

## cons
- Explicit stack code is longer and harder to read
- Easy to get the traversal order wrong
- Conversion can introduce bugs if not tested against the original

## uses
- Making a deep recursive routine safe for large inputs
- Walking nested data structures without a stack limit
- Converting simple tail recursion such as gcd to a loop
- Replacing recursive algorithms in performance-critical code

## mistakes
- Pushing children in the wrong order and changing the traversal order
- Forgetting to handle the empty input
- Not comparing the iterative result against the recursive one
- Converting recursion that was shallow and clear to begin with

## interview
**Q:** How do you convert a tail-recursive function to a loop?
**A:** Turn the parameters into variables, replace the recursive call by assigning the new argument values to them, and repeat in a loop until the base case condition holds.

**Q:** When do you need an explicit stack?
**A:** When the recursion branches, as in tree traversals, because there is no single accumulator to carry; the stack stores the pending branches that the call stack would have held.

**Q:** Why might you not convert a recursion at all?
**A:** If its depth is small or logarithmic, the recursive version is safe and usually clearer than the iterative one.

## summary
Tail and accumulator recursion become loops directly, combine-after recursion becomes a bottom-up loop, and branching recursion needs an explicit stack. Check equality with the recursive version and keep the recursion where it is safe and clear.

## codenote
The Python sample flattens nested lists with an explicit stack, including a very deep one. The JavaScript sample converts Euclid's algorithm to a loop.

## code
### python
```python
def flatten_rec(data):
    out = []
    for item in data:
        out.extend(flatten_rec(item) if isinstance(item, list) else [item])
    return out

def flatten_iter(data):
    result, stack = [], [data]
    while stack:
        item = stack.pop()
        if isinstance(item, list):
            stack.extend(reversed(item))
        else:
            result.append(item)
    return result

nested = [1, [2, [3, 4]], 5]
print(flatten_iter(nested), flatten_rec(nested) == flatten_iter(nested))

deep = [1]
for _ in range(5000):
    deep = [deep]
print(flatten_iter(deep))
```
Output:
```text
[1, 2, 3, 4, 5] True
[1]
```
### javascript
```javascript
const gcdRecursive = (a, b) => (b === 0 ? a : gcdRecursive(b, a % b));

function gcdLoop(a, b) {
  while (b !== 0) {
    [a, b] = [b, a % b];
  }
  return a;
}

console.log(gcdRecursive(48, 18), gcdLoop(48, 18));
```
Output:
```text
6 6
```

## quiz
1. What converts a tail-recursive function into a loop?
   - [ ] Adding more parameters
   - [x] Replacing the recursive call with assignment to the parameters and repeating
   - [ ] Deleting the base case
   - [ ] Using a global variable
   > The loop keeps the current state in variables instead of frames.
2. Which kind of recursion needs an explicit stack?
   - [ ] Simple counting
   - [x] Branching recursion such as tree traversal
   - [ ] Recursion with an accumulator
   - [ ] Recursion with one base case
   > The stack holds the pending branches.
3. Why are children pushed in reverse order onto the stack?
   - [ ] To make the stack smaller
   - [x] So that the first child is popped first, preserving the left-to-right order
   - [ ] To avoid duplicates
   - [ ] Stacks require it
   > A stack returns the most recently pushed item first.
4. What is a benefit of the iterative version?
   - [ ] It is always shorter
   - [x] It has no call-stack depth limit
   - [ ] It needs no testing
   - [ ] It is always faster
   > The explicit stack lives on the heap and can grow as needed.

# Divide and Conquer Preview
kind: algorithm
time: O(n) for finding the maximum by halving (the combine step is constant and there are n leaves), and O(log n) for fast exponentiation, where the problem halves and only one half is solved.
space: O(log n) recursion depth for both examples, because the problem size is halved at every level.

## intro
Divide and conquer solves a problem by splitting it into smaller parts of the same kind, solving each recursively, and combining the answers. It is one of the most important algorithm design ideas and the reason that sorting, searching and multiplication can be done so much faster than by brute force.

## theory
Three steps appear in every divide-and-conquer algorithm:

- Divide: split the input into two or more smaller subproblems, usually of about equal size
- Conquer: solve each subproblem recursively; when it is small enough (the base case), solve it directly
- Combine: merge the sub-answers into the answer for the whole

The efficiency comes from how the cost splits. For `T(n) = a * T(n / b) + f(n)` with a subproblems of size n / b and combine cost f(n):

- Merge sort splits in two halves (a = 2, b = 2) and merges in linear time, so T(n) = 2T(n / 2) + n, which is O(n log n)
- Binary search keeps one half (a = 1, b = 2) with constant combine, so T(n) = T(n / 2) + 1, which is O(log n)
- Fast exponentiation computes `x^(n/2)` once and squares it, which is O(log n) multiplications, instead of n

Not every split helps. Finding the maximum by halving is still O(n), just like a loop, because every element must be looked at. The benefit appears when the combine step is cheap, when half the problem can be discarded, or when the structure allows work to be shared or done in parallel.

Divide and conquer also maps well to parallel computing, since independent subproblems can run on separate processors, and to memory hierarchies, since small subproblems fit in cache.

Important design questions: how to split so subproblems are balanced (unbalanced splits degrade performance), what the base case size should be, and what the combine step costs.

## explain
1. Find a way to split the problem into smaller independent versions of itself.
2. Define the base case, the size at which the answer is immediate.
3. Write the recursive calls on the parts.
4. Write the combine step and find its cost.
5. Write the recurrence and solve it with a recursion tree.
6. Test the split points carefully: odd sizes, size one and size zero.

## example
`max_dc(data, 0, 5)` splits the list `[7, 2, 9, 4, 11, 3]` into halves, finds the maximum of each half recursively and returns the larger, giving 11. Fast exponentiation computes 2 to the power 30 by solving for 15, then 7, 3, 1 and 0, squaring on the way back, and makes only 6 calls; the result is 1073741824. The JavaScript function sums the numbers 1 to 8 by splitting the array in half and adding the two partial sums, producing 36.

## real
Merge sort, quicksort, binary search, fast Fourier transforms, Strassen's matrix multiplication and the closest pair of points are all divide-and-conquer algorithms, and distributed systems use the same idea to split work across machines.

## pros
- Gives efficient algorithms such as O(n log n) sorting
- Subproblems are independent, which enables parallel execution
- Recursive structure keeps the code short and the proof by induction natural

## cons
- Splitting and combining can add overhead for small inputs
- Unbalanced splits remove the speed advantage
- Recursion uses stack space proportional to the depth

## uses
- Sorting large collections
- Searching sorted data
- Computing powers and products quickly
- Splitting work across processors

## mistakes
- Forgetting the base case for sizes one and zero
- Splitting at the wrong middle and recursing on the same size forever
- Assuming a split always gives a speed-up
- Doing too much work in the combine step

## interview
**Q:** What are the three steps of divide and conquer?
**A:** Divide the problem into smaller subproblems, conquer them by solving them recursively, and combine their solutions into the solution of the original problem.

**Q:** Why is merge sort O(n log n)?
**A:** The list is halved log n times, and at every level of the recursion the merging work adds up to n, so the total is n times log n.

**Q:** Why does computing x to the power n by squaring take only O(log n) steps?
**A:** It computes x to the power n/2 once and squares it, so the exponent halves with each call and only about log n calls are needed.

## summary
Divide and conquer splits a problem, solves the parts recursively and combines the results. It pays off when halves are balanced and the combine step is cheap, giving algorithms such as merge sort and fast exponentiation.

## codenote
The Python sample finds a maximum by halving and counts the calls of fast exponentiation. The JavaScript sample sums an array by recursively splitting it.

## code
### python
```python
def max_dc(items, lo, hi):
    if lo == hi:
        return items[lo]
    mid = (lo + hi) // 2
    return max(max_dc(items, lo, mid), max_dc(items, mid + 1, hi))

data = [7, 2, 9, 4, 11, 3]
print(max_dc(data, 0, len(data) - 1))

calls = 0

def fast_pow(base, exp):
    global calls
    calls += 1
    if exp == 0:
        return 1
    half = fast_pow(base, exp // 2)
    return half * half if exp % 2 == 0 else half * half * base

print(fast_pow(2, 30), calls)
```
Output:
```text
11
1073741824 6
```
### javascript
```javascript
function sumHalves(items) {
  if (items.length === 1) return items[0];
  const mid = Math.floor(items.length / 2);
  return sumHalves(items.slice(0, mid)) + sumHalves(items.slice(mid));
}

console.log(sumHalves([1, 2, 3, 4, 5, 6, 7, 8]));
```
Output:
```text
36
```

## quiz
1. Which is the correct order of the steps of divide and conquer?
   - [ ] Combine, divide, conquer
   - [x] Divide, conquer, combine
   - [ ] Conquer, combine, divide
   - [ ] Divide, combine, conquer
   > Split the problem, solve the parts, then merge the answers.
2. Why does fast exponentiation need only about log n multiplications?
   - [ ] It uses a lookup table
   - [x] The exponent is halved at every call
   - [ ] It skips odd numbers
   - [ ] It uses floating point
   > Each call solves a problem half as large.
3. Why is finding the maximum by halving still O(n)?
   - [ ] The recursion is too deep
   - [x] Every element must still be examined and the combine step is constant
   - [ ] It uses extra memory
   - [ ] Because of Python
   > Divide and conquer does not always beat a simple loop.
4. What is a risk of an unbalanced split?
   - [ ] The base case disappears
   - [x] The recursion becomes deeper and the efficiency advantage is lost
   - [ ] The results change
   - [ ] Memory is freed
   > Balanced halves keep the depth logarithmic.

# Backtracking Preview
kind: algorithm
time: O(2^n · n) for generating all subsets of n items, because there are 2^n subsets and copying each costs up to n; permutations take O(n! · n). Pruning can cut the work sharply on constrained problems.
space: O(n) recursion depth plus the current partial solution; the list of results, if stored, is additional.
viz: backtracking-subsets

## intro
Backtracking builds a solution one decision at a time, and when a choice leads to a dead end it undoes that choice and tries the next one. It is a systematic way to search through all possibilities, the method behind puzzle solvers, constraint problems and the generation of all subsets or permutations.

## theory
The pattern is choose, explore, unchoose:

- Choose: make one decision and add it to the current partial solution
- Explore: recurse to make the next decisions
- Unchoose: undo the decision (remove it from the partial solution) so the next alternative starts from a clean state

When the partial solution is complete, record it; when it can no longer lead to a valid solution, stop early. That early stop is pruning, and it is what makes backtracking practical compared with generating everything and filtering afterwards.

The search can be pictured as a tree of decisions. Backtracking walks it depth-first, going down a branch until it succeeds or fails, then returning to the nearest branching point with unexplored options.

Examples:

- Subsets of n items: for each item decide in or out, giving 2^n leaves
- Permutations: at each position choose one of the unused items, giving n! leaves
- N-Queens, Sudoku and maze solving: place a piece, check constraints, backtrack on conflict

Key implementation detail: the partial solution is shared and mutated, so you must undo the change after the recursive call, and you must store a copy (for example `current[:]`) when saving a result, otherwise all the stored results end up pointing at the same list.

Complexity is usually exponential in the worst case. The art lies in pruning with good constraints and in ordering the choices.

## explain
1. Describe a solution as a sequence of decisions, and what the choices are at each step.
2. Define the state: the partial solution and the information needed to check validity.
3. Write the recursive function: if complete, record; otherwise for each valid choice, choose, recurse, unchoose.
4. Add pruning checks before recursing to skip dead ends early.
5. Save copies of solutions, not references to the shared state.
6. Test on tiny inputs and count the results against the known formula, such as 2^n.

## example
The Python function `subsets` decides for each item whether to skip or include it, and explores after both choices. For `[1, 2, 3]` it produces eight subsets in the order `[]`, `[3]`, `[2]`, `[2, 3]`, `[1]`, `[1, 3]`, `[1, 2]`, `[1, 2, 3]`. The pop after the recursive call is the unchoose step. The JavaScript function generates all permutations of the letters a, b and c by marking letters as used, choosing one, recursing and then releasing it, producing six results.

## real
Sudoku and crossword solvers, parsers with ambiguity, configuration checkers, route planners and many puzzle games use backtracking, usually with strong pruning to avoid the exponential worst case.

## pros
- A general method for searching combinations under constraints
- Pruning can make hard problems solvable in practice
- Short recursive code with a clear pattern

## cons
- Exponential worst-case running time
- Needs careful undoing of shared state
- Less suitable when a greedy or dynamic programming solution exists

## uses
- Generating subsets, permutations and combinations
- Solving Sudoku, N-Queens and maze problems
- Finding all solutions that satisfy constraints
- Exploring game positions

## mistakes
- Forgetting to undo the choice after the recursive call
- Storing a reference to the working list instead of a copy
- Pruning too late or not at all
- Using backtracking when overlapping subproblems call for dynamic programming

## interview
**Q:** What are the three steps in the backtracking pattern?
**A:** Choose an option and add it to the partial solution, explore by recursing, then unchoose by removing the option so the next alternative can be tried.

**Q:** What is pruning?
**A:** Abandoning a branch of the search as soon as it is known that it cannot lead to a valid solution, which avoids exploring everything below it.

**Q:** Why do you need to copy the current solution when saving it?
**A:** The working list is modified as the search continues, so saving a reference would show later changes; a copy preserves the solution as it was.

## summary
Backtracking tries choices depth-first, undoes them when they fail and prunes impossible branches. Remember choose, explore, unchoose, and copy results before the shared state changes.

## codenote
The Python sample enumerates subsets with an explicit unchoose step. The JavaScript sample enumerates permutations with a used array.

## code
### python
```python
def subsets(items):
    result, current = [], []

    def explore(i):
        if i == len(items):
            result.append(current[:])
            return
        explore(i + 1)
        current.append(items[i])
        explore(i + 1)
        current.pop()

    explore(0)
    return result

print(subsets([1, 2, 3]))
```
Output:
```text
[[], [3], [2], [2, 3], [1], [1, 3], [1, 2], [1, 2, 3]]
```
### javascript
```javascript
function permutations(chars) {
  const out = [];
  const used = Array(chars.length).fill(false);
  const path = [];

  function choose() {
    if (path.length === chars.length) {
      out.push(path.join(""));
      return;
    }
    for (let i = 0; i < chars.length; i++) {
      if (used[i]) continue;
      used[i] = true;
      path.push(chars[i]);
      choose();
      path.pop();
      used[i] = false;
    }
  }

  choose();
  return out;
}

console.log(permutations(["a", "b", "c"]));
```
Output:
```text
[ 'abc', 'acb', 'bac', 'bca', 'cab', 'cba' ]
```

## quiz
1. What is the unchoose step for?
   - [ ] To print the result
   - [x] To undo a decision so the next alternative starts from a clean state
   - [ ] To end the program
   - [ ] To sort the results
   > Shared state must be restored after exploring a choice.
2. How many subsets does a set of 3 items have?
   - [ ] 3
   - [ ] 6
   - [x] 8
   - [ ] 9
   > Each item is in or out, giving 2 to the power 3.
3. Why save a copy of the current list when recording a solution?
   - [ ] Copies are faster
   - [x] The working list keeps changing, so a reference would reflect later changes
   - [ ] Python requires it
   - [ ] To save memory
   > A copy fixes the solution at the moment it was complete.
4. What does pruning achieve?
   - [ ] It adds more branches
   - [x] It skips branches that cannot lead to a valid solution
   - [ ] It sorts the input
   - [ ] It turns recursion into a loop
   > Early rejection avoids exploring large parts of the search tree.

# Memoization Preview
kind: algorithm
time: O(n) for memoized Fibonacci, because each of the n values is computed once and later calls are constant-time lookups; the naive version without caching is exponential.
space: O(n) for the cache plus O(n) recursion depth, so the speed is bought with memory.
viz: fibonacci-dp

## intro
Memoization means remembering the result of a function call so that calling it again with the same arguments returns the stored answer instead of recomputing it. For recursive functions with overlapping subproblems, such as Fibonacci, this turns exponential time into linear time with a few lines of code.

## theory
Requirements for memoization to be correct and useful:

- The function must be deterministic and free of side effects (a pure function), so the same arguments always give the same result
- The arguments must be usable as a lookup key: hashable in Python (numbers, strings, tuples)
- The subproblems must overlap; if every call is on distinct arguments, the cache only costs memory

Implementations:

- A dictionary: check `if n in cache: return cache[n]`, compute, store, return
- A decorator: `functools.lru_cache(maxsize=None)` or `functools.cache` in Python does it automatically and exposes `cache_info()` with hits and misses
- A `Map` keyed by the arguments in JavaScript; BigInt is needed when values exceed 2^53

Top-down versus bottom-up: memoization is top-down dynamic programming. The recursion decides which subproblems are needed and caches them. The bottom-up alternative fills a table from the smallest subproblems upward, avoids recursion depth, and is often faster, but computes subproblems that may never be needed.

Costs and cautions:

- The cache grows with the number of distinct arguments; bound it (`maxsize`) in long-running programs to avoid memory leaks
- A mutable default dictionary shared between functions can cause hidden coupling
- Recursion depth is still n, so memoized Fibonacci for very large n still overflows the stack unless the table is built bottom-up
- Cache keys for floating-point arguments are unreliable

Memoization is a first look at dynamic programming, which the later module treats fully.

## explain
1. Identify the repeated subproblems by drawing the call tree or counting calls.
2. Check that the function is pure and its arguments are hashable.
3. Add a cache lookup at the top of the function and a store before returning.
4. Count the calls again to confirm that each distinct input is computed once.
5. Consider a bound on the cache size, or a bottom-up version, if inputs are large.
6. Test that results are identical to the unmemoized version for small inputs.

## example
The dictionary-based `fib` computes `fib(50)` as 12586269025 with only 51 real computations, one for each value from 0 to 50. With `lru_cache`, the cache statistics after computing the same value report 48 hits and 51 misses, showing how many calls were answered from the cache. The JavaScript version stores BigInt values in a `Map` and computes `fib(90)` exactly as 2880067194370816120, a value too large for ordinary numbers.

## real
Web frameworks cache the results of expensive pure computations, compilers cache the results of analyses, and dynamic programming solutions for routing, text alignment and game strategy rely on memoization.

## pros
- Turns exponential recursion into linear with minimal code
- Preserves the natural recursive structure
- Library decorators make it a one-line change

## cons
- Uses extra memory proportional to the number of distinct inputs
- Only valid for pure functions
- Recursion depth limits remain

## uses
- Speeding up recursive definitions such as Fibonacci
- Caching expensive pure computations
- Top-down dynamic programming
- Avoiding repeated work in search over states

## mistakes
- Memoizing a function with side effects or randomness
- Using unhashable arguments such as lists as keys
- Letting an unbounded cache grow without limit
- Memoizing when subproblems do not overlap

## interview
**Q:** What is memoization?
**A:** Storing the results of function calls keyed by their arguments so that repeated calls with the same arguments return the stored result instead of recomputing it.

**Q:** Why does memoization make Fibonacci linear?
**A:** Each value from 0 to n is computed only once; every later request for it is a constant-time lookup, so the total number of computations is n plus one.

**Q:** What is the difference between memoization and bottom-up dynamic programming?
**A:** Memoization is top-down: the recursion runs and caches results as needed. Bottom-up fills a table from the smallest subproblems up, with no recursion.

## summary
Memoization caches the results of a pure function so overlapping subproblems are solved once. It trades memory for time, needs hashable arguments, and is the gateway to dynamic programming.

## codenote
The Python sample uses a dictionary and then the library decorator with its statistics. The JavaScript sample caches BigInt results in a Map.

## code
### python
```python
from functools import lru_cache

cache = {}
computed = 0

def fib(n):
    global computed
    if n in cache:
        return cache[n]
    computed += 1
    cache[n] = n if n < 2 else fib(n - 1) + fib(n - 2)
    return cache[n]

print(fib(50), computed)

@lru_cache(maxsize=None)
def fib_cached(n):
    return n if n < 2 else fib_cached(n - 1) + fib_cached(n - 2)

fib_cached(50)
info = fib_cached.cache_info()
print(info.hits, info.misses)
```
Output:
```text
12586269025 51
48 51
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

console.log(fib(90).toString());
```
Output:
```text
2880067194370816120
```

## quiz
1. What does memoization store?
   - [ ] The source code
   - [x] The results of function calls, keyed by their arguments
   - [ ] The call stack
   - [ ] The exceptions
   > A later call with the same arguments returns the stored result.
2. Which functions are safe to memoize?
   - [ ] Functions that read the clock
   - [ ] Functions that print
   - [x] Pure functions with hashable arguments
   - [ ] Functions with random results
   > The same arguments must always give the same result.
3. Why does memoized Fibonacci run in linear time?
   - [ ] It skips odd numbers
   - [x] Each value is computed once and later calls are lookups
   - [ ] It uses a loop
   - [ ] It avoids recursion
   > The number of distinct subproblems is n plus one.
4. What cost does memoization add?
   - [ ] Slower first calls only
   - [x] Memory for the cache
   - [ ] More recursion depth only
   - [ ] Nothing
   > The cache grows with the number of distinct inputs.

# Debugging Recursive Programs
kind: concept
time: Not applicable — debugging is a process. Tracing output slows a run, but that cost is only paid while investigating.
space: Not applicable — the topic is how to find mistakes, not a memory bound.

## intro
Recursive bugs are hard to debug because the same code runs at many depths at once, and a failure may only show far from its cause. A small set of techniques, tracing with depth, testing the base case alone, checking progress and shrinking inputs, makes them manageable.

## theory
Typical recursive bugs and their symptoms:

- Missing or unreachable base case: RecursionError or stack overflow, with a traceback of thousands of identical lines
- Wrong base value: finishes, but the answer is off by a consistent factor or offset
- No progress or wrong direction: also an overflow; the arguments in the traceback do not get smaller
- Off-by-one in the split point: duplicate or missing elements, or infinite recursion when a range of two splits into the same two
- Shared mutable state: results from earlier calls leak into later ones
- Forgetting to return the recursive result: the function returns None at some levels

Techniques:

- Trace with indentation: print the arguments on entry and the result on exit, indented by depth. A decorator can add this without changing the function.
- Test the base case in isolation, then the smallest recursive case (one step above the base), then slightly bigger ones; a bug usually appears at the lowest failing size
- Check the invariants: what should be true of the arguments at each call, and does the progress measure decrease?
- Shrink the input to the smallest value that still fails
- Read the traceback: its repeating lines show the cycle and the arguments
- Use a debugger with a call-stack view, setting conditional breakpoints on the interesting depth
- Compare with a simple, obviously correct (possibly slow) version on many small inputs
- Add assertions for preconditions, such as `n >= 0`, so bad calls fail at the source

Resist the urge to trace a deep recursion by hand; reason by induction instead. If the base case is right and the step is right assuming the smaller call is right, the function is right.

## explain
1. Reproduce the failure with the smallest input possible.
2. Add a trace of the arguments and results with depth indentation.
3. Look at the first call whose result is wrong: its children are right, so the bug is in this call's own logic.
4. Check the base case, then the progress, then the combine step.
5. Fix one thing and rerun the small failing input.
6. Add the failing input to your tests so it stays fixed.

## example
The `traced` decorator prints the function name and arguments when a call begins, adds a level of indentation, prints the result when the call returns and removes a level. Applied to a recursive `gcd`, it shows `gcd(12, 8)` calling `gcd(8, 4)` and then `gcd(4, 0)`, which returns 4, and each level passing 4 back up. The trace makes it obvious that the arguments shrink and where the base case is reached. The JavaScript sample records the sequence of arguments in an array, which gives the same information without printing in the function.

## real
Recursive functions in parsers and tree algorithms are routinely debugged with trace output and small test inputs, and many teams keep a simple brute-force version around as an oracle to check the clever one.

## pros
- Tracing exposes the call structure directly
- Small inputs make failures understandable
- An oracle version catches subtle mistakes

## cons
- Traces of deep recursions are long
- Debuggers show many identical frames, which is tiring to read
- Tracing code must be removed or disabled afterwards

## uses
- Finding missing base cases
- Understanding why a recursion returns the wrong answer
- Explaining a recursive algorithm to others
- Verifying an optimised version against a simple one

## mistakes
- Starting with a large input instead of the smallest failing one
- Fixing symptoms without checking the base case
- Forgetting to return the result of the recursive call
- Leaving trace output in production code

## interview
**Q:** How do you debug a recursive function that returns the wrong answer?
**A:** Trace the calls with their arguments and results on a small input, find the first call whose result is wrong although its sub-results are right, and examine the base case and the combine step there.

**Q:** What does a repeating traceback tell you?
**A:** That the recursion is cycling, usually because the arguments do not progress toward the base case or the base case is missing, and the repeated lines show the arguments involved.

**Q:** Why test the base case first?
**A:** Every other level depends on it; if it is wrong, all results are wrong, and it is the easiest case to check on its own.

## summary
Debug recursion by tracing arguments and results with indentation, testing the base case and the first recursive step, shrinking failing inputs and comparing with a simple version. Reason by induction instead of tracing everything by hand.

## codenote
The Python decorator prints an indented trace for any recursive function. The JavaScript sample records arguments in an array.

## code
### python
```python
def traced(func):
    depth = 0

    def wrapper(*args):
        nonlocal depth
        print("  " * depth + f"{func.__name__}{args}")
        depth += 1
        result = func(*args)
        depth -= 1
        print("  " * depth + f"-> {result}")
        return result

    return wrapper

@traced
def gcd(a, b):
    return a if b == 0 else gcd(b, a % b)

gcd(12, 8)
```
Output:
```text
gcd(12, 8)
  gcd(8, 4)
    gcd(4, 0)
    -> 4
  -> 4
-> 4
```
### javascript
```javascript
const seen = [];

function countdown(n) {
  seen.push(n);
  if (n === 0) return "done";
  return countdown(n - 1);
}

console.log(countdown(3), seen);
```
Output:
```text
done [ 3, 2, 1, 0 ]
```

## quiz
1. What does a repeating line in a RecursionError traceback usually indicate?
   - [ ] A syntax error
   - [x] The arguments are cycling or not progressing toward the base case
   - [ ] A slow disk
   - [ ] A missing import
   > Identical frames mean the recursion is not getting closer to stopping.
2. Which is the best first step when a recursive function fails?
   - [ ] Increase the input size
   - [x] Reduce the input to the smallest case that still fails
   - [ ] Rewrite the whole function
   - [ ] Remove the base case
   > Small failing inputs expose the bug directly.
3. Why is the first wrong call in a trace important?
   - [ ] It is the longest
   - [x] Its sub-calls returned correct results, so the bug is in its own logic
   - [ ] It is always the base case
   - [ ] It is the deepest call
   > The error appears at the level where correct inputs produce a wrong output.
4. What can a simple brute-force version be used for?
   - [ ] Production deployment
   - [x] Checking the recursive version on many small inputs
   - [ ] Replacing tests
   - [ ] Increasing the recursion limit
   > A slow but obviously correct oracle reveals disagreements.

# Recursion vs Iteration Tradeoffs
kind: concept
time: Not applicable — recursion and iteration can solve the same problem with the same asymptotic running time; the differences are constant factors, stack use and readability, discussed in the lesson.
space: Not applicable — recursion uses stack space proportional to depth and loops usually use constant extra space, but the lesson compares the approaches rather than bounding one algorithm.

## intro
Any problem solvable by recursion can be solved by a loop and the other way round. The real question is which one is clearer, safer and fast enough for the problem at hand. This lesson gives a way to decide instead of picking a favourite.

## theory
Points of comparison:

- Clarity. Recursion matches problems defined in terms of themselves (trees, nested data, divide and conquer, backtracking). A loop matches flat repetition over a sequence or a counter.
- Memory. Recursion keeps a stack frame per pending call, so depth n costs O(n) space and is limited by the language. A loop keeps a few variables.
- Speed. Function calls cost more than loop passes, so a recursive version of a linear task is usually somewhat slower. Algorithmic differences matter much more: naive tree recursion can be exponential where a loop or memoized form is linear.
- Safety. Deep recursion can fail; loops cannot overflow the call stack. An explicit stack gives recursion's flexibility without the limit.
- State. A loop mutates variables in place. Recursion passes state through parameters and return values, which is easier to reason about and to test, and fits functional style.
- Language support. Languages with guaranteed tail-call elimination make recursive loops free; Python and most JavaScript do not.
- Debugging. Loops are easier to step through; recursion needs call-stack awareness.

Guidelines:

- Use recursion when the data or the problem is recursive and the depth is bounded (balanced trees, logarithmic splitting)
- Use loops for simple counting, accumulation and long flat sequences
- Use an explicit stack for deep or unbounded tree-like structures
- Use memoization or bottom-up loops for overlapping subproblems
- Choose the clearer solution first, measure, and change only for a reason

## explain
1. Look at the shape of the problem: flat sequence, counter, tree, nested data, divide in parts?
2. Estimate the maximum depth for the largest input.
3. Write the clearer version first.
4. If depth or speed is a concern, measure; consider an explicit stack, memoization or a loop.
5. Verify that both forms give identical results on many inputs.
6. Document the reason for the choice when it is not the obvious one.

## example
The digit sum of a number can be written recursively as the last digit plus the digit sum of the rest, or with a loop that adds the remainders. The program checks that both agree for several values, including 100-digit number made of nines, and prints True and the digit sum 900. The recursion depth equals the number of digits, 100 in the largest case, which is safe. The JavaScript Towers of Hanoi function shows a problem where recursion is much clearer than iteration: moving 3 disks takes 7 moves, listed in order.

## real
Production code mixes both: parsers and tree walkers use recursion while data pipelines, counters and long scans use loops, and style guides often say "prefer iteration unless the problem is naturally recursive and the depth is bounded".

## pros
- Choosing deliberately gives clearer, safer code
- Recursion expresses nested problems naturally
- Loops give predictable memory use

## cons
- No universal rule decides every case
- Converting later costs effort
- Personal preference often overrides evidence

## uses
- Deciding how to implement a tree or graph traversal
- Choosing between a loop and recursion in code review
- Teaching the equivalence of the two styles
- Planning for deep or untrusted inputs

## mistakes
- Using recursion for a long flat sequence
- Avoiding recursion for naturally recursive problems and writing an unreadable explicit stack
- Optimising for speed before measuring
- Assuming recursive code is always slower or always cleaner

## interview
**Q:** When would you choose recursion over iteration?
**A:** When the problem or data is naturally recursive, such as trees, nested structures, divide and conquer or backtracking, and the recursion depth is bounded and small.

**Q:** When is iteration the better choice?
**A:** For simple counting, accumulation or scanning of long flat sequences, and whenever the depth could exceed the stack limit, because loops use constant extra space and have no stack limit.

**Q:** Do recursion and iteration have different expressive power?
**A:** No. Anything computable with one can be computed with the other, with an explicit stack if needed; the difference is in clarity, speed and resource use.

## summary
Recursion and iteration are equally powerful. Choose recursion for naturally recursive, bounded-depth problems, iteration or an explicit stack for flat or deep ones, write the clearer version first and measure before optimising.

## codenote
The Python sample compares the two styles on a digit sum. The JavaScript sample solves Towers of Hanoi recursively, a task where recursion is far clearer.

## code
### python
```python
def digits_rec(n):
    return n if n < 10 else n % 10 + digits_rec(n // 10)

def digits_iter(n):
    total = 0
    while n:
        total += n % 10
        n //= 10
    return total

values = [7, 95, 1234, 98765, 10 ** 100 - 1]
print(all(digits_rec(v) == digits_iter(v) for v in values))
print(digits_iter(10 ** 100 - 1))
```
Output:
```text
True
900
```
### javascript
```javascript
function hanoi(n, from, to, via, moves = []) {
  if (n === 0) return moves;
  hanoi(n - 1, from, via, to, moves);
  moves.push(`${from}->${to}`);
  hanoi(n - 1, via, to, from, moves);
  return moves;
}

const moves = hanoi(3, "A", "C", "B");
console.log(moves.length, moves.join(" "));
```
Output:
```text
7 A->C A->B C->B A->C B->A B->C A->C
```

## quiz
1. Which problem is naturally recursive?
   - [ ] Summing numbers 1 to 100 with a counter
   - [x] Walking a tree of nested folders
   - [ ] Printing a line ten times
   - [ ] Reading a single value
   > Nested structures are defined in terms of smaller copies of themselves.
2. What is a main advantage of loops over recursion for long sequences?
   - [ ] They are always shorter
   - [x] They use constant extra space and have no call-stack limit
   - [ ] They allow more parameters
   - [ ] They avoid variables
   > Loops cannot overflow the call stack.
3. Can recursion solve problems that loops cannot?
   - [ ] Yes, many
   - [x] No, both are equally powerful, possibly needing an explicit stack
   - [ ] Only trees
   - [ ] Only numbers
   > Anything computable one way can be done the other way.
4. What is a sensible first rule for choosing between them?
   - [ ] Always use recursion
   - [x] Write the clearer version first, then measure before changing it
   - [ ] Always use loops
   - [ ] Pick the shorter one
   > Readability first, optimisation backed by measurement.
