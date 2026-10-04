# Infinite Loops and Prevention
kind: concept
time: Not applicable — an infinite loop has no running time because it never finishes. The topic is how to recognise and prevent loops that fail to end, and how to write the ones that are meant to run forever safely.
space: Not applicable — a plain infinite loop reuses its variables, although one that keeps adding to a list can exhaust memory; that is a bug pattern, not an analysis.

## intro
An infinite loop is a loop whose condition never becomes false, so the program never moves on. Some are bugs that freeze a program, and some are deliberate, like the main loop of a server. Knowing the common causes and the habits that prevent them keeps programs responsive.

## theory
Why loops fail to terminate:

- The update is missing, as in `while i < 10:` with no change to i
- The update goes in the wrong direction, such as decrementing a counter that the condition expects to grow
- The condition can never be false: comparing a floating-point value for exact equality (`while x != 0.0` while subtracting 0.1 steps) skips past the target, because the values never land exactly on it
- A `continue` skips the update statement
- The variable is changed in a copy or a different scope, so the loop's condition never sees the change
- The loop waits for an external event that never arrives, such as a closed connection or a missing file

Prevention strategies:

- Prefer bounded forms: `for` over a finite range or collection, which ends by construction
- Use `<` or `>` conditions instead of `!=` for numeric progress
- Add a maximum iteration count or time limit to loops that wait for something, and give up with an error when it is reached
- Use timeouts on network and file operations
- Show a variant: a quantity that strictly decreases toward a bound, and check it in code review
- In tests, run code with a time limit so a hang fails instead of blocking the pipeline

Intentional infinite loops, such as servers, game loops and event loops, are written as `while True` with a clear exit path: a shutdown flag, a signal handler or a `break` on a sentinel. They need to yield or sleep so they do not consume all the CPU.

To debug a hang: interrupt the program with Ctrl+C to get a traceback pointing at the loop, print the loop variables, and check which of the causes above applies.

## explain
1. Before running a new loop, say which quantity moves toward ending and in which direction.
2. Check that the update runs on every path through the body, including after a continue.
3. Avoid exact equality for floating-point exit tests; use comparisons and tolerances.
4. For loops that wait on something external, add an attempt limit or timeout.
5. For deliberate infinite loops, define how they stop and make them sleep or wait for events.
6. If a program hangs, interrupt it and inspect the traceback to find the loop.

## example
The Python loop subtracts 0.1 from 1.0 until the value equals 0.0, but because of rounding the value passes through 1.3877787807814457e-16 and never equals zero, so the guard on the step counter ends it at 20 steps and the output shows `20 False`. A deliberately unbounded `itertools.count` loop ends at the first tick whose square exceeds 50, which happens at tick 8. The JavaScript `while (true)` loop has an explicit attempt limit and a break, and finishes with 3 attempts.

## real
Hangs are among the most frustrating production bugs, often tied to data nobody anticipated. Retry loops without a limit and polling loops without a timeout can silently stall a whole service.

## pros
- Bounded loops cannot hang by construction
- A limit or timeout turns a hang into a clear error
- Deliberate infinite loops with a clean exit path are the basis of servers

## cons
- Limits can end a loop that would eventually have succeeded
- Floating-point conditions are subtle
- Debugging a hang can be hard without tooling

## uses
- Writing main loops for servers and games
- Retrying operations with a limit
- Waiting for a condition with a timeout
- Guarding numeric iterations against drift

## mistakes
- Testing floating-point values for exact equality in a loop condition
- Forgetting to update the counter, or updating it after a continue
- Using a loop that waits for an event with no timeout
- Letting a deliberate infinite loop run without sleeping, using all the CPU

## interview
**Q:** What are common causes of an infinite loop?
**A:** A missing or wrong update, a condition that cannot become false (for example exact equality with floating-point numbers), a continue that skips the update, or waiting for an event that never occurs.

**Q:** How do you protect a retry loop from running forever?
**A:** Add a maximum number of attempts or a timeout and fail with an error when the limit is reached.

**Q:** Why is while x != 0.0 dangerous when subtracting 0.1 repeatedly?
**A:** Rounding error means x may skip over zero without ever equaling it, so the condition stays true. A comparison such as x > 0 is safe.

## summary
Infinite loops come from updates that never reach the exit condition. Prefer bounded loops, avoid exact floating-point equality, limit retries and timeouts, and give deliberate infinite loops a clean way out.

## codenote
The Python samples show a float-drift guard and a bounded use of an unbounded counter. The JavaScript sample caps a while true loop with an attempt counter.

## code
### python
```python
x = 1.0
steps = 0
while x != 0.0 and steps < 20:
    x -= 0.1
    steps += 1
print(steps, x == 0.0)

import itertools

for tick in itertools.count(1):
    if tick * tick > 50:
        break
print(tick)
```
Output:
```text
20 False
8
```
### javascript
```javascript
let attempts = 0;
while (true) {
  attempts++;
  if (attempts >= 3) break;
}
console.log(attempts);
```
Output:
```text
3
```

## quiz
1. Why might while x != 0.0 never end when 0.1 is repeatedly subtracted from 1.0?
   - [ ] Python forbids it
   - [x] Rounding error means x skips past zero without ever equaling it
   - [ ] The loop runs backwards
   - [ ] 0.1 is an integer
   > Floating-point values may not land exactly on the target.
2. What is a good protection for a loop that waits for a resource?
   - [ ] Run it faster
   - [x] A maximum number of attempts or a timeout
   - [ ] Remove the condition
   - [ ] Use a global variable
   > A limit converts a hang into an error that can be handled.
3. Which loop form cannot run forever by construction?
   - [ ] while True
   - [x] A for loop over a finite list
   - [ ] A loop waiting for a network event
   - [ ] A loop with a missing update
   > Iteration over a finite collection ends when the items run out.
4. How can you find a loop that is hanging a Python program?
   - [ ] Restart the computer
   - [x] Interrupt it with Ctrl+C and read the traceback
   - [ ] Rename the file
   - [ ] Delete the variables
   > The traceback shows the line being executed when the interrupt arrived.

# Loop Complexity Preview
kind: algorithm
time: O(n) for a single pass over n items, O(n · m) for nested loops, O(n²) when both bounds are n, and O(log n) for a loop that halves or doubles its variable each pass.
space: O(1) for the loop counters alone; a loop that stores a result per pass uses O(n) additional space.

## intro
How long a program takes depends on how many times its loops run. Counting passes is the simplest and most useful way to predict how an algorithm behaves as its input grows, and it is the foundation of Big-O analysis that later lessons build on.

## theory
Time cost is the number of basic operations as a function of the input size n. For loops:

- A loop that makes one pass per item does work proportional to n: linear time, O(n)
- Two nested loops, each with n passes, give n × n passes: quadratic time, O(n²)
- Nested loops with different sizes give O(n · m)
- A triangular nested loop gives about n²/2 passes, which is still O(n²) because Big-O ignores constant factors
- A loop whose variable is multiplied or divided by a constant each pass (`i *= 2`, `i //= 2`) runs about log₂(n) times: logarithmic time, O(log n)
- A loop with a constant bound, such as always 10 passes, is O(1)
- Sequential loops add: O(n) followed by O(n) is O(2n), which simplifies to O(n)
- A loop whose body itself costs more than constant time multiplies: n passes of an O(m) call is O(n · m)

Rules for simplification: drop constant factors and lower-order terms, so `3n² + 5n + 2` becomes O(n²). Big-O describes growth, not exact speed: an O(n) loop with an expensive body can be slower than an O(n²) loop on tiny inputs, but loses once n is large.

A useful habit is to count passes for a small n, then ask how the count changes when n doubles: unchanged means constant, one more means logarithmic, doubled means linear, quadrupled means quadratic.

## explain
1. Identify the input size, usually the length of a list or the magnitude of a number.
2. For each loop, find how many passes it makes in terms of n.
3. Multiply the passes of nested loops and add the passes of sequential loops.
4. Include the cost of any function called in the body.
5. Simplify by dropping constants and smaller terms.
6. Check with a counter on small inputs, as in the code below.

## example
For n = 16 the Python code counts passes. The single loop makes 16 passes, the nested pair makes 16 × 16 = 256, and the loop that halves a copy of n until it reaches 1 makes 4 passes (16, 8, 4, 2 are the values it processes before reaching 1). The output is `16 256 4`. Doubling n to 32 would change these to 32, 1024 and 5, showing linear, quadratic and logarithmic growth. The JavaScript loop doubles a counter until it reaches 1000 and takes 10 passes, because 2 to the power 10 is 1024.

## real
Choosing between an O(n²) and an O(n log n) approach decides whether a feature handles a million records in seconds or in days, and performance reviews begin by finding the loop with the highest growth rate.

## pros
- Counting loop passes predicts behavior on large inputs
- Simple rules cover most programs
- Independent of the machine

## cons
- Ignores constant factors that matter for small inputs
- Needs care when loop bounds depend on data
- Hidden loops inside library calls are easy to forget

## uses
- Estimating whether an algorithm will scale
- Comparing two solutions to the same problem
- Finding the bottleneck of a slow program
- Explaining running time in interviews

## mistakes
- Forgetting the cost of a function called inside a loop
- Treating the pass count of a halving loop as linear
- Keeping constant factors when stating Big-O
- Ignoring loops hidden in methods like list search or string concatenation

## interview
**Q:** What is the time complexity of two nested loops over the same list?
**A:** O(n squared), since the inner body executes n times for each of n outer passes.

**Q:** Why does a loop that halves its variable each pass take logarithmic time?
**A:** The number of times you can halve n before reaching 1 is about log base 2 of n, so the loop makes that many passes.

**Q:** Why do we ignore constants in Big-O?
**A:** Big-O describes how the cost grows with n, and for large n the growth rate dominates any constant multiplier, so 3n and 100n are both linear.

## summary
Count loop passes in terms of n: linear for one loop, quadratic for nested loops, logarithmic for halving or doubling, and constant for fixed bounds. Multiply nested costs, add sequential ones and drop constants.

## codenote
The Python sample counts the passes of linear, quadratic and logarithmic loops for n = 16. The JavaScript sample counts doubling steps up to 1000.

## code
### python
```python
n = 16

linear = sum(1 for _ in range(n))
quadratic = sum(1 for _ in range(n) for _ in range(n))

logarithmic, i = 0, n
while i > 1:
    i //= 2
    logarithmic += 1

print(linear, quadratic, logarithmic)
```
Output:
```text
16 256 4
```
### javascript
```javascript
let steps = 0;
for (let i = 1; i < 1000; i *= 2) {
  steps++;
}
console.log(steps);
```
Output:
```text
10
```

## quiz
1. What is the complexity of a loop that does i *= 2 until i reaches n?
   - [ ] O(n)
   - [x] O(log n)
   - [ ] O(n squared)
   - [ ] O(1)
   > The counter doubles each pass, so about log2 n passes are needed.
2. What does the complexity become when O(n) work is followed by another O(n) loop?
   - [ ] O(n squared)
   - [x] O(n)
   - [ ] O(n cubed)
   - [ ] O(2)
   > Sequential costs add, and constants are dropped.
3. What happens to the passes of a quadratic loop when n doubles?
   - [ ] They double
   - [x] They quadruple
   - [ ] They stay the same
   - [ ] They halve
   > The count scales with n squared.
4. A loop calls a function costing O(m) on each of n passes. What is the total?
   - [ ] O(n + m)
   - [x] O(n times m)
   - [ ] O(m)
   - [ ] O(log n)
   > The body cost multiplies by the number of passes.

# Choosing the Right Loop
kind: concept
time: Not applicable — the choice of loop construct rarely changes the number of operations; it changes how clearly the code states its intent and how easily mistakes can be avoided.
space: Not applicable — all the loop forms use constant extra space; the question is clarity.

## intro
Most loops can be written in several forms, but one form usually expresses the intent best. Choosing for, while, do-while or for-each deliberately makes code shorter, safer and easier to read, because the form itself tells the reader what to expect.

## theory
A practical decision guide:

- Visiting every item of a collection, in order, without needing the position: for-each (`for item in items`)
- Needing the position as well: `for i, item in enumerate(items)` or an index loop
- A known number of repetitions or a numeric progression: a counted for loop with `range`
- Repeating until a condition changes, with an unknown number of passes: while
- A body that must execute at least once before the test makes sense: do-while (or `while True` with a trailing break in Python)
- A loop that transforms or filters a collection into another: a comprehension or the functional tools `map`, `filter` and `reduce`
- A process that naturally calls itself on smaller parts: recursion, discussed later

Secondary considerations:

- Safety: for-each and range loops cannot go out of bounds or forget the update, while while-loops are open to infinite-loop bugs
- Readability: the construct should show the intent, so someone reading `while` expects a condition that changes unpredictably, and `for` expects a known sequence
- Performance: differences are usually negligible, but built-in functions and comprehensions are often faster in Python than hand-written loops
- Consistency with the surrounding code and team style

Changing the form can remove bugs: replacing an index loop with for-each eliminates off-by-one errors, and replacing a flag-controlled while loop with a for loop and break makes the end clearer.

## explain
1. State in words what the loop does: for each item, n times, until something happens, at least once.
2. Map that wording to the loop form.
3. If you need a result list, see whether a comprehension says it more directly.
4. Check that the form protects against the likely mistake: use for-each to avoid bounds errors.
5. Re-read the loop as a stranger would; if the intent is not obvious, change the form or rename.
6. Compare with an alternative form once, to confirm that the choice is better.

## example
For the list `["Ada", "Max", "Eve"]` the Python snippets use for-each to join names, `enumerate` to number them starting at 1, and a `while` loop with a sentinel to read items until the word "end" is reached. The numbered output is `1.Ada 2.Max 3.Eve`. The JavaScript while loop processes the tokens `3`, `5`, `end` and `9` until it meets "end", adding 3 and 5 to give 8, and stops with the position at 2, leaving 9 unprocessed.

## real
Code reviewers routinely suggest changing an index loop to for-each or a flag-based while to a for loop with break, not because the old version fails but because the new one states its purpose.

## pros
- The loop form documents the intent
- Safer forms remove whole classes of bugs
- Consistent choices make code predictable

## cons
- Several forms are valid, so choices can seem arbitrary
- Style guides differ between teams and languages
- Over-optimising the form wastes effort

## uses
- Reviewing and improving existing loops
- Teaching and learning loop idioms
- Setting team coding conventions
- Choosing the form before writing new code

## mistakes
- Using an index loop where for-each would do
- Using while for a plain counted loop and forgetting the update
- Using a flag variable where break expresses the exit
- Using a loop where a comprehension or built-in is clearer

## interview
**Q:** How do you decide between a for loop and a while loop?
**A:** If the number of passes or the sequence of values is known in advance, use for. If the loop depends on a condition that changes during execution, use while.

**Q:** When is a for-each loop preferable to an index loop?
**A:** When you need every element and not its position, because for-each avoids bounds errors and is easier to read.

**Q:** Why does the form of a loop matter if they all give the same result?
**A:** The form communicates intent and prevents mistakes, so code is quicker to understand and less error prone.

## summary
Match the loop to the intent: for-each to visit every item, counted for for known repetitions, while for condition-driven repetition, do-while for at least one pass and comprehensions for building lists. Choose the form that makes mistakes impossible or obvious.

## codenote
The Python sample uses three loop forms for three different intents. The JavaScript sample reads tokens until a sentinel using while.

## code
### python
```python
names = ["Ada", "Max", "Eve"]

print(" ".join(f"{number}.{name}" for number, name in enumerate(names, start=1)))

tokens = iter(["3", "5", "end", "9"])
total = 0
while (token := next(tokens)) != "end":
    total += int(token)
print(total)

for name in names:
    print(name.upper())
```
Output:
```text
1.Ada 2.Max 3.Eve
8
ADA
MAX
EVE
```
### javascript
```javascript
const tokens = ["3", "5", "end", "9"];
let position = 0;
let sum = 0;
while (tokens[position] !== "end") {
  sum += Number(tokens[position]);
  position++;
}
console.log(sum, position);
```
Output:
```text
8 2
```

## quiz
1. Which loop is the natural choice for visiting every item of a list when the index is not needed?
   - [ ] A do-while loop
   - [x] A for-each loop
   - [ ] A while True loop
   - [ ] A recursive call
   > It states the intent and avoids index errors.
2. Which loop suits reading values until a sentinel word appears?
   - [ ] A counted for loop over range
   - [x] A while loop
   - [ ] A comprehension
   - [ ] No loop
   > The number of passes depends on the data.
3. Why might you replace a flag-controlled while loop with a for loop and break?
   - [ ] It is shorter in every case
   - [x] The exit is stated more clearly and the flag cannot be left inconsistent
   - [ ] Flags are forbidden
   - [ ] It runs faster by a large factor
   > Fewer moving parts make the loop easier to follow.
4. Which form builds a new list from an old one most directly in Python?
   - [ ] A while loop with a counter
   - [x] A list comprehension
   - [ ] A do-while loop
   - [ ] A nested loop
   > It states the transformation in one expression.

# Translating Loops to Recursion
kind: algorithm
time: O(n) for the sum example in both forms; each call or pass does constant work and there are n of them. The recursive version uses the call stack, which has a fixed depth limit.
space: O(1) for the loop version; O(n) for the recursive version, because n stack frames exist at the deepest point.

## intro
Every loop can be rewritten as recursion, and every recursion can be written as a loop. Doing the translation by hand is the clearest way to see what recursion does: the loop's state becomes the function's parameters, and the loop's condition becomes the base case.

## theory
The correspondence:

- Loop variables and accumulators become parameters of the function
- The loop's exit condition becomes the base case, returning the final answer
- The loop body plus update becomes the recursive case: do one pass, then call the function with the updated state
- The initial values of the variables become the arguments of the first call

Example: summing 1 to n. The loop keeps `total` and `k`. The recursion expresses `sum(n) = n + sum(n - 1)` with the base case `sum(0) = 0`. A second form, with an accumulator parameter, `sum(n, acc) = sum(n - 1, acc + n)`, mirrors the loop directly and is tail recursive: the recursive call is the last action, so a language with tail-call optimisation could reuse the frame. Python and JavaScript engines in general do not guarantee that.

Costs and limits:

- Each recursive call uses a stack frame, so depth n needs O(n) memory, whereas the loop uses O(1)
- Languages cap the stack: Python raises RecursionError at a depth of about 1000 by default; JavaScript throws RangeError when the call stack is exhausted
- Recursion shines when the data is naturally recursive (trees, nested structures) or the problem splits into smaller copies of itself; for flat counting, loops are simpler and cheaper

Translating in the other direction, recursion to loop, uses an explicit stack or accumulator, and is the standard cure for stack overflow.

## explain
1. Write the loop with its state variables and exit condition.
2. Turn each state variable into a parameter; the accumulator becomes an extra parameter or part of the return value.
3. Write the base case from the exit condition, returning the accumulator or the identity value.
4. Write the recursive case that performs one pass and calls itself with the updated state.
5. Verify with the first call that the initial values match the loop's initialisation.
6. Test with a small n and with n = 0; then consider the largest n the stack allows.

## example
`sum_loop(10)` adds 1 through 10 with a loop and `sum_rec(10)` computes 10 + sum_rec(9) down to the base case 0; both give 55. Calling `sum_rec(100000)` in Python raises RecursionError because the depth far exceeds the interpreter's limit, which the program catches and reports. The JavaScript version computes the same sum recursively for 10 and catches a RangeError when asked for a million levels.

## real
Language implementers and interviewers use this translation to show that the two forms are equivalent in power, and production code replaces deep recursion with loops or explicit stacks when inputs could be large.

## pros
- Makes the meaning of recursion concrete
- Recursion expresses self-similar problems elegantly
- Tail form maps directly onto a loop

## cons
- Recursive versions use stack space proportional to depth
- Stack limits make deep recursion fail
- Loops are usually faster and use less memory for flat repetition

## uses
- Learning how recursion works
- Converting between styles when a language or problem favors one
- Rewriting deep recursion as iteration to avoid stack overflow
- Expressing definitions like factorial and sums naturally

## mistakes
- Forgetting the base case, so the recursion never ends
- Not passing the accumulator forward and losing the running total
- Assuming Python or JavaScript will optimise tail calls
- Using recursion for very large flat counts

## interview
**Q:** How does a loop's condition correspond to recursion?
**A:** The condition under which the loop stops becomes the base case of the recursion, and the body plus update becomes the recursive case that calls the function with the new state.

**Q:** What is the space cost of a recursive sum compared with a loop?
**A:** The recursion needs O(n) stack space for n pending calls, while the loop needs O(1).

**Q:** What happens when Python recursion goes too deep?
**A:** A RecursionError is raised once the call depth exceeds the interpreter's recursion limit.

## summary
Loop state becomes parameters, the exit condition becomes the base case and one pass becomes the recursive step. The translation shows the equivalence, but stack depth makes loops the safer choice for long flat repetition.

## codenote
The Python sample shows equal results for the two forms and the depth failure. The JavaScript sample shows the same translation and a stack overflow caught as a RangeError.

## code
### python
```python
def sum_loop(n):
    total = 0
    for k in range(1, n + 1):
        total += k
    return total

def sum_rec(n):
    return 0 if n == 0 else n + sum_rec(n - 1)

print(sum_loop(10), sum_rec(10))

try:
    sum_rec(100000)
except RecursionError:
    print("RecursionError")
```
Output:
```text
55 55
RecursionError
```
### javascript
```javascript
function sumRec(n) {
  return n === 0 ? 0 : n + sumRec(n - 1);
}

console.log(sumRec(10));

try {
  sumRec(1000000);
} catch (error) {
  console.log(error.name);
}
```
Output:
```text
55
RangeError
```

## quiz
1. In the translation of a loop to recursion, what does the loop's exit condition become?
   - [ ] The recursive case
   - [x] The base case
   - [ ] A global variable
   - [ ] A comment
   > The base case stops the recursion and returns the final value.
2. What is the extra space used by sum_rec(n) compared with sum_loop(n)?
   - [ ] None
   - [x] O(n) stack frames instead of O(1)
   - [ ] O(log n)
   - [ ] O(n squared)
   > Each pending call holds a frame on the stack.
3. What does Python raise when recursion exceeds its depth limit?
   - [ ] MemoryError
   - [x] RecursionError
   - [ ] ZeroDivisionError
   - [ ] KeyError
   > The interpreter protects itself from stack overflow.
4. What does tail recursion mean?
   - [ ] Recursion over the end of a list
   - [x] The recursive call is the last operation in the function
   - [ ] Recursion that is never called
   - [ ] Recursion with two base cases
   > A compiler can then reuse the stack frame, though Python and JavaScript do not guarantee it.

# Loop Optimization Patterns
kind: algorithm
time: O(n) before and after the changes shown; the techniques reduce the constant work per pass, or the number of passes, but do not change the growth rate unless an early exit finds the answer sooner.
space: O(1) extra space for the patterns shown, except that precomputing a table or set trades O(n) space for faster passes.

## intro
Most loops are fast enough as written. When one is not, a few well-known patterns remove wasted work: moving unchanging calculations out of the loop, exiting as soon as the answer is known, avoiding repeated lookups and using built-in routines. The first rule, though, is to measure before optimising.

## theory
Patterns, from most to least impactful:

- Use a better algorithm: replacing a nested loop with a set lookup changes O(n²) to O(n) and dwarfs every micro-optimisation
- Early exit: stop when the answer is known with `break`, `return`, `any` or `all`
- Hoisting (loop-invariant code motion): compute values that do not change between passes once, before the loop. A call such as `len(items)`, a limit lookup or a regular expression compile inside the body is repeated n times for no reason.
- Caching and precomputing: store expensive results in a variable, dictionary or table, and reuse them
- Reduce work per pass: avoid creating objects, formatting strings or calling functions in the hot path when a cheaper form exists
- Loop fusion: combine two loops over the same data into one pass when both are needed
- Use built-ins and comprehensions: `sum`, `max`, `any`, `sorted` and comprehensions run in optimised native code
- Strength reduction: replace an expensive operation by a cheaper one, such as repeated addition instead of multiplying by the loop counter
- Access patterns: iterate in the order data is stored, as in row-major order for a 2D array, so the processor cache is used well

Cautions: compilers and interpreters already perform some of these; optimised code is often less readable; and a change that is not measured might not help. Profile with a timer or profiler, fix the biggest cost first and keep the readable version unless the gain is real.

## explain
1. Measure the program and find the loop that dominates the time.
2. Check the algorithm: can a different data structure remove an inner loop?
3. Look for invariant work in the body and hoist it.
4. Add an early exit where the answer is known before the end.
5. Replace hand-written loops with built-ins where they say the same thing.
6. Re-measure, and revert if the gain is small and the code is harder to read.

## example
In the Python sample the function `limit()` counts its own calls. The first loop calls it on every one of 10 passes, which gives a total of 3 and 10 calls. After hoisting the call into a variable the same loop produces the same total of 3 with exactly 1 call. The JavaScript sample uses `some`, which stops at the first match: searching `[5, 3, 9, 1, 7]` for 3 needs only 2 checks, whereas a full scan would make 5.

## real
Database engines, game loops and numerical libraries are tuned with exactly these patterns; a profiler usually reveals one or two hot loops, and fixing them gives most of the speed-up.

## pros
- Removes wasted work without changing results
- Early exits and hoisting are simple and safe
- Built-ins express intent and run fast

## cons
- Optimised code can be harder to read
- Gains may be small compared with a better algorithm
- Micro-optimisations without measurement often waste effort

## uses
- Speeding up the hot loop of a program
- Reducing repeated function calls and lookups
- Stopping searches as soon as a result is found
- Combining multiple passes over the same data

## mistakes
- Optimising without profiling first
- Hoisting a value that actually changes during the loop
- Sacrificing readability for a trivial gain
- Rewriting a loop when the real problem is the algorithm

## interview
**Q:** What is loop-invariant code motion?
**A:** Moving a computation whose result does not change between iterations out of the loop, so it is done once instead of every pass.

**Q:** What should you do before optimising a loop?
**A:** Measure with a profiler or timer to confirm the loop is really the bottleneck, then fix the biggest cost first and re-measure.

**Q:** Why can replacing a nested loop with a set lookup matter more than any micro-optimisation?
**A:** It changes the growth rate from quadratic to linear, which grows far faster in benefit as the input gets larger than any constant-factor saving.

## summary
Choose a better algorithm first, then exit early, hoist invariant work, cache results, use built-ins and fuse loops. Measure before and after, and keep code readable unless the gain justifies otherwise.

## codenote
The Python sample counts how many times a helper is called before and after hoisting. The JavaScript sample counts the checks made by a loop that exits early.

## code
### python
```python
calls = 0

def limit():
    global calls
    calls += 1
    return 3

total = 0
for i in range(10):
    if i < limit():
        total += i
print(total, calls)

calls = 0
cap = limit()
total = 0
for i in range(10):
    if i < cap:
        total += i
print(total, calls)
```
Output:
```text
3 10
3 1
```
### javascript
```javascript
let checks = 0;
const list = [5, 3, 9, 1, 7];
const found = list.some((x) => {
  checks++;
  return x === 3;
});
console.log(found, checks);
```
Output:
```text
true 2
```

## quiz
1. What does hoisting a loop-invariant calculation do?
   - [ ] Makes the loop infinite
   - [x] Computes it once before the loop instead of on every pass
   - [ ] Moves it to another file
   - [ ] Deletes it
   > Work that does not change need not be repeated.
2. What is the usual first step when a loop is too slow?
   - [ ] Rewrite it in assembly
   - [x] Measure to find where the time goes
   - [ ] Add more loops
   - [ ] Remove all variables
   > Optimising the wrong thing wastes effort.
3. Why does an early exit help a search?
   - [ ] It improves the worst case
   - [x] It stops as soon as the answer is found, skipping the remaining items
   - [ ] It sorts the list
   - [ ] It removes the loop
   > The saving depends on where the match is, so the worst case is unchanged.
4. Which change usually gives the biggest improvement?
   - [ ] Shorter variable names
   - [x] Replacing a nested scan with a set lookup
   - [ ] Removing comments
   - [ ] Changing quote styles
   > A better algorithm changes the growth rate.
