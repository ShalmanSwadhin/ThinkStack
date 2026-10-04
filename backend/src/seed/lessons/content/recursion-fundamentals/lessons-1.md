# Base Case and Recursive Case
kind: algorithm
time: O(n) for the power and length examples, since each makes n nested calls of constant work, where n is the exponent or the length of the input.
space: O(n) for the call stack, because n calls are pending when the base case is reached; the length example also copies a shrinking slice on each call, which costs more time and memory.

## intro
Every recursive function is built from two pieces: a base case that answers the smallest problem directly, and a recursive case that shrinks the problem and relies on the same function for the rest. If either piece is wrong, the function either never stops or never produces the right answer.

## theory
The base case is the condition under which the function returns without calling itself. It must be reachable from every valid input, and it must return the correct answer for that smallest input, not just any value.

The recursive case must do two things:

- Make progress: the argument of the recursive call must be strictly closer to the base case than the current one (a smaller number, a shorter list, a smaller range)
- Combine: use the answer returned by the smaller call to build the answer for the current input

A useful way to design is the inductive view. Decide what the function returns for the base input. Then assume, as a leap of faith, that the function already works for smaller inputs, and write the answer for the current input in terms of that. This is the same shape as a proof by mathematical induction, and it is why a correct recursive function can be checked step by step.

Typical mistakes and how they behave:

- Missing base case: the calls never stop, the stack fills, and Python raises RecursionError
- Wrong base case: the function returns a wrong value, such as 0 instead of 1 for a product
- No progress: calling with the same argument, or one that moves away from the base case, also loops until the stack is exhausted
- Several base cases: needed when the recursive case reaches back more than one step, as with Fibonacci, which needs both 0 and 1

Examples: `power(b, e)` has the base case `e == 0` returning 1 and the recursive case `b * power(b, e - 1)`. `length(items)` has the base case of an empty sequence returning 0 and the recursive case `1 + length(items[1:])`. Reversing text has the base case of the empty string and the recursive case that moves the first character to the end of the reversed rest.

## explain
1. Identify the smallest input for which you know the answer immediately, and write that as the first lines of the function.
2. Decide how to shrink the input by one step: remove the first element, subtract one, halve the range.
3. Write the recursive call on the smaller input and treat its result as correct.
4. Combine that result with the part you removed to form the current answer.
5. Check that every possible input eventually reaches the base case.
6. Trace a tiny input, such as exponent 2 or a two-letter string, through every call and return.

## example
`power(2, 10)` calls `power(2, 9)` and so on down to `power(2, 0)`, which returns 1; the multiplications then happen on the way back and give 1024. `length("recursion")` removes one character per call until the empty string returns 0, giving 9, and `length([])` is 0 immediately. A function with no base case, `broken(n)` calling `broken(n - 1)` forever, is caught as a RecursionError. The JavaScript function reverses "stack" by placing the first character after the reversed remainder, producing "kcats".

## real
Parsers, file system tools and mathematical definitions are written as a base case plus a recursive rule. In code reviews, the first question about any recursive function is where it stops and why every input gets there.

## pros
- Mirrors definitions that are written in terms of smaller versions of themselves
- The structure makes correctness easy to argue by induction
- Short code for naturally nested problems

## cons
- A missing or unreachable base case produces a crash instead of an answer
- Every call keeps a stack frame alive until it returns
- Slicing in each call, as in the length example, copies data repeatedly

## uses
- Defining mathematical functions such as powers and sums
- Processing sequences by removing one element at a time
- Walking nested structures
- Teaching and proving correctness by induction

## mistakes
- Forgetting the base case entirely
- Returning the wrong value at the base case
- Passing an argument that does not get smaller
- Handling only one base case when the recursion reaches back two steps

## interview
**Q:** What happens if a recursive function has no reachable base case?
**A:** It keeps calling itself until the call stack is exhausted, which raises a RecursionError in Python or a stack overflow error in other languages.

**Q:** How can you convince yourself that a recursive function is correct?
**A:** Check that the base case returns the right answer, that the recursive step moves strictly toward the base case, and that, assuming the smaller call is correct, the combination gives the right answer for the current input.

**Q:** Why does Fibonacci need two base cases?
**A:** Each value depends on the two before it, so the recursion reaches back two steps and must stop at both 0 and 1, otherwise it would call with negative arguments.

## summary
A recursive function needs a base case that returns directly and a recursive case that makes progress toward it and combines the result. Prove both, and trace a tiny input to be sure.

## codenote
The Python sample implements power and length with explicit base cases and shows the failure of a function without one. The JavaScript sample reverses a string recursively.

## code
### python
```python
def power(base, exp):
    if exp == 0:
        return 1
    return base * power(base, exp - 1)

def length(items):
    if not items:
        return 0
    return 1 + length(items[1:])

print(power(2, 10), length("recursion"), length([]))

def broken(n):
    return broken(n - 1)

try:
    broken(5)
except RecursionError:
    print("no base case -> RecursionError")
```
Output:
```text
1024 9 0
no base case -> RecursionError
```
### javascript
```javascript
const reverse = (text) => (text === "" ? "" : reverse(text.slice(1)) + text[0]);

console.log(reverse("stack"));
console.log(reverse(""));
```
Output:
```text
kcats

```

## quiz
1. What is the role of the base case?
   - [ ] To make the function run faster
   - [x] To return an answer directly and stop the recursion
   - [ ] To print the result
   - [ ] To declare variables
   > Without it the function keeps calling itself.
2. What must the recursive case guarantee about its argument?
   - [ ] It stays the same
   - [ ] It becomes larger
   - [x] It moves strictly closer to the base case
   - [ ] It becomes a string
   > Progress toward the base case guarantees termination.
3. Why does a function that defines each value from the previous two need two base cases?
   - [ ] To double the speed
   - [x] The recursion reaches back two steps and would otherwise go below the start
   - [ ] Because Python requires it
   - [ ] To avoid printing
   > Both starting values must be given directly.
4. What does power(2, 0) return in the lesson's implementation?
   - [ ] 0
   - [x] 1
   - [ ] 2
   - [ ] An error
   > Any base raised to the power zero is one.

# Call Stack Visualization
kind: concept
time: Not applicable — the call stack is a mechanism, and this lesson is about picturing it. Pushing and popping a frame is a constant-time operation.
space: Not applicable — the depth of the stack is determined by the program's recursion depth, covered in other lessons as a space cost.

## intro
Whenever a function is called, the runtime pushes a frame onto the call stack, and when it returns the frame is removed. Being able to picture that stack, frame by frame, is the single most useful skill for understanding recursion and for reading error traces.

## theory
A stack frame (activation record) holds what one call needs:

- The values of its parameters and local variables
- The place in the calling function where execution should resume after the call
- Bookkeeping for the runtime

The stack grows as functions call other functions and shrinks as they return. It is last-in, first-out: the most recent call must finish before earlier ones continue. The function currently running is at the top.

For a recursive function, there are many frames of the same function, each with its own copy of the parameters. In `factorial(3)` the stack grows to `factorial(3)`, `factorial(2)`, `factorial(1)`, with the base case on top. Then the frames are popped from the top one at a time, each returning its value to the frame below, which completes its multiplication.

Two phases of every recursion:

- Winding (descending): calls go deeper, each waiting for the next to finish. Work done before the recursive call happens here, in the order of the calls.
- Unwinding (ascending): the base case returns and each frame resumes. Work done after the recursive call happens here, in reverse order.

This explains why printing before the recursive call lists values in call order and printing after lists them in reverse. It also explains stack depth: the maximum number of frames alive at the same time. Python limits this (about 1000 by default), and exceeding it raises RecursionError; in JavaScript it is a RangeError.

Tools: a traceback shows the stack at the moment of an error, a debugger shows frames with their variables, and visualisers such as the one in this course animate pushes and pops.

## explain
1. Draw an empty stack with the top at the highest position.
2. For each call, push a frame with its argument values.
3. When a function calls another, push a new frame above it; the caller is paused.
4. When a function returns, pop its frame and give the value to the frame below.
5. Note the order of the outputs: before the call, in descending order; after the call, in ascending order.
6. Count the maximum number of frames to know the depth.

## example
The Python function `fact` prints its call with indentation proportional to depth, then calls itself, and finally prints what it returns. For `fact(3)` the output shows the calls descending to `fact(1)` and the returns coming back up as 1, 2 and 6, with the indentation mirroring the stack depth. The JavaScript function `walk(4)` increases a depth counter on entry and decreases it on exit, recording the maximum depth. The result is a maximum depth of 5 (calls for 4, 3, 2, 1 and 0) and a final depth of 0, because every frame was popped.

## real
When a program crashes, the traceback is a printout of the call stack, read from the innermost call outward, and debuggers let developers step into and out of frames to inspect their variables.

## pros
- A clear mental model makes recursion predictable
- Tracebacks and debuggers become readable
- Explains order of output and depth limits

## cons
- Large recursions create stacks too deep to draw by hand
- The model hides compiler optimisations such as inlining
- Different languages organise frames differently

## uses
- Tracing recursive functions on paper
- Reading tracebacks to locate errors
- Estimating the memory used by recursion
- Explaining the order of operations before and after the recursive call

## mistakes
- Confusing the order of work done before and after the recursive call
- Forgetting that each frame has its own copy of the variables
- Assuming a deep recursion costs nothing
- Reading a traceback from the wrong end

## interview
**Q:** What is stored in a stack frame?
**A:** The parameters and local variables of one function call, plus the return address, so the runtime knows where to continue after the call finishes.

**Q:** Why does printing after the recursive call produce output in reverse order?
**A:** The statements after the call run only when the deeper calls return, so the innermost call finishes first and the outermost last.

**Q:** What is the maximum stack depth of factorial(n)?
**A:** n frames if the base case is at 1, since a new frame is added for each decrease of the argument until the base case is reached.

## summary
Picture each call as a frame pushed on a stack and each return as a pop. Work before the recursive call happens while winding down, work after it happens while unwinding, and the maximum number of frames is the depth.

## codenote
The Python sample prints an indented trace of factorial. The JavaScript sample tracks the depth to show that all frames are popped in the end.

## code
### python
```python
def fact(n, depth=0):
    pad = "  " * depth
    print(f"{pad}fact({n})")
    result = 1 if n <= 1 else n * fact(n - 1, depth + 1)
    print(f"{pad}return {result}")
    return result

fact(3)
```
Output:
```text
fact(3)
  fact(2)
    fact(1)
    return 1
  return 2
return 6
```
### javascript
```javascript
let depth = 0;
let maxDepth = 0;

function walk(n) {
  depth++;
  maxDepth = Math.max(maxDepth, depth);
  if (n > 0) walk(n - 1);
  depth--;
}

walk(4);
console.log(maxDepth, depth);
```
Output:
```text
5 0
```

## quiz
1. Which end of the call stack holds the function that is currently running?
   - [ ] The bottom
   - [x] The top
   - [ ] The middle
   - [ ] There is no current function
   > The most recent call is at the top.
2. In which order are values printed after the recursive call returns?
   - [ ] The order of the calls
   - [x] The reverse of the order of the calls
   - [ ] Alphabetical order
   - [ ] Random order
   > The deepest call finishes first.
3. How many frames exist at the deepest point of walk(4) in the sample?
   - [ ] 4
   - [x] 5
   - [ ] 6
   - [ ] 1
   > Calls for 4, 3, 2, 1 and 0 are all pending at the same time.
4. What does a traceback show?
   - [ ] The heap contents
   - [x] The sequence of active calls when an error occurred
   - [ ] The file system
   - [ ] The compiler version
   > It is a printout of the call stack.

# Factorial and Fibonacci
kind: algorithm
time: Factorial is O(n) with one call per level. Naive Fibonacci is O(2^n) in the worst case (about 1.618^n calls) because each call spawns two more; with memoization it drops to O(n).
space: O(n) stack depth for both recursive versions; memoized Fibonacci adds O(n) for the cache.
viz: fibonacci-dp
practice: factorial-calculation

## intro
Factorial and Fibonacci are the two classic examples of recursion, and they teach opposite lessons. Factorial recurses once per level and is efficient. Fibonacci recurses twice per level and is a famous example of how elegant code can be exponentially slow.

## theory
Factorial: n! is the product of the integers from 1 to n, with 0! defined as 1. Recursive definition: `n! = n * (n - 1)!` with base case `1! = 1` (and `0! = 1`). Each call makes one recursive call, so there are n calls in a chain. Factorials grow very quickly: 20! is already 2,432,902,008,176,640,000, which exceeds 64-bit signed integers at 21!. Python integers have no limit, but fixed-width languages overflow.

Fibonacci: each term is the sum of the two before it, `F(0) = 0`, `F(1) = 1`, `F(n) = F(n - 1) + F(n - 2)`, giving 0, 1, 1, 2, 3, 5, 8, 13, 21, 34, 55. The direct recursion makes two calls per step and recomputes the same values again and again: `F(5)` computes `F(3)` twice, `F(2)` three times, and so on. The number of calls for `F(n)` is `2 * F(n + 1) - 1`, which for n = 10 is 177 and for n = 30 is more than 2.6 million. The running time is exponential, roughly 1.618 to the power n.

Ways to fix the repeated work:

- Memoization: store each computed value in a dictionary or with `functools.lru_cache` so each `F(k)` is computed once, giving O(n)
- Iteration: keep the last two values in two variables and loop, giving O(n) time and O(1) space
- Closed forms and fast doubling exist but are beyond this lesson

The Fibonacci case is the standard motivation for dynamic programming: when subproblems overlap, remember their answers.

## explain
1. For factorial, write the base case for 0 or 1 and the recursive step `n * factorial(n - 1)`.
2. For Fibonacci, write two base cases and the two-way recursive step.
3. Count the calls for small n to see how work grows: linear for factorial, exponential for the naive Fibonacci.
4. Add a cache around Fibonacci and count the calls again.
5. Compare with an iterative version that uses two variables.
6. Check big values: where does your language overflow?

## example
`fib(10)` returns 55 but makes 177 calls, counted by a global counter. A cached version using `lru_cache` computes the same 55 with only 11 calls, one per value from 0 to 10. `math.factorial(10)` agrees with the recursive 3628800. The JavaScript loop computes `fib(50)` in 50 steps as 12586269025, a value the naive recursion could not produce in reasonable time.

## real
Fibonacci numbers appear in algorithm analysis, heaps, and nature-inspired patterns, and the naive recursive version is the textbook example used to introduce memoization and dynamic programming. Factorials count permutations and appear in probability.

## pros
- Factorial shows a clean linear recursion
- Fibonacci shows clearly why overlapping subproblems need caching
- Both have simple iterative equivalents for comparison

## cons
- Naive Fibonacci becomes unusable for n around 40 to 50
- Factorial overflows fixed-width integers quickly
- Deep recursion for large n hits the stack limit

## uses
- Counting permutations and arrangements
- Introducing memoization and dynamic programming
- Testing the speed of function calls
- Generating sequences in teaching and benchmarks

## mistakes
- Using the naive recursive Fibonacci for large n
- Forgetting one of the two base cases
- Ignoring integer overflow in fixed-width languages
- Starting factorial at 0 with no base case and recursing forever

## interview
**Q:** What is the time complexity of naive recursive Fibonacci and why?
**A:** Exponential, roughly 1.618 to the power n, because each call makes two further calls and the same subproblems are recomputed many times.

**Q:** How can the running time of recursive Fibonacci be reduced to linear?
**A:** By memoizing results so each value is computed once, or by computing iteratively from the bottom with two variables.

**Q:** Why does factorial run in linear time?
**A:** It makes exactly one recursive call per level, so n calls are made, each doing a single multiplication.

## summary
Factorial recurses once and is linear; naive Fibonacci recurses twice and is exponential because of repeated subproblems. Cache the results or iterate to make Fibonacci linear.

## codenote
The Python sample counts calls of the naive and cached versions and checks the factorial against the library. The JavaScript sample computes a large Fibonacci value iteratively.

## code
### python
```python
import math
from functools import lru_cache

calls = 0

def fib(n):
    global calls
    calls += 1
    return n if n < 2 else fib(n - 1) + fib(n - 2)

print(fib(10), calls)

cached_calls = 0

@lru_cache(maxsize=None)
def fib_fast(n):
    global cached_calls
    cached_calls += 1
    return n if n < 2 else fib_fast(n - 1) + fib_fast(n - 2)

print(fib_fast(10), cached_calls)

def factorial(n):
    return 1 if n <= 1 else n * factorial(n - 1)

print(factorial(10) == math.factorial(10), factorial(10))
```
Output:
```text
55 177
55 11
True 3628800
```
### javascript
```javascript
function fibonacci(n) {
  let previous = 0;
  let current = 1;
  for (let i = 0; i < n; i++) {
    [previous, current] = [current, previous + current];
  }
  return previous;
}

console.log(fibonacci(10), fibonacci(50));
```
Output:
```text
55 12586269025
```

## quiz
1. How many recursive calls does naive Fibonacci make per call to the function with n of at least 2?
   - [ ] One
   - [x] Two
   - [ ] Three
   - [ ] None
   > F(n) calls F(n - 1) and F(n - 2).
2. Why is naive recursive Fibonacci slow?
   - [ ] Python is slow
   - [x] It recomputes the same subproblems many times
   - [ ] It uses too many variables
   - [ ] It has no base case
   > The number of calls grows exponentially.
3. What does memoization do for Fibonacci?
   - [ ] Makes the numbers smaller
   - [x] Stores computed values so each one is computed once
   - [ ] Removes the recursion
   - [ ] Prints the values
   > The running time drops from exponential to linear.
4. What is 0 factorial by definition?
   - [ ] 0
   - [x] 1
   - [ ] Undefined
   - [ ] -1
   > The empty product is one, and it serves as the base case.

# Tail Recursion
kind: algorithm
time: O(n) for the accumulator factorial and the loop form, one step per level of the recursion; the trampoline example also does n steps.
space: O(n) for a tail-recursive function in languages without tail-call optimisation, including Python and JavaScript engines in general; O(1) when the optimisation exists, and for the loop and trampoline forms.

## intro
A tail call is a function call that is the very last thing a function does. When the recursive call is in tail position, nothing is left to do after it returns, so a smart compiler can reuse the current frame and run the recursion in constant stack space. Most mainstream languages do not guarantee that, which is why the idea matters mostly as a design pattern.

## theory
Compare two factorials:

- Ordinary recursion: `return n * factorial(n - 1)`. After the call returns, the function still has to multiply, so each frame must stay alive. This is not a tail call.
- Tail recursion: `return fact_tail(n - 1, acc * n)`. The multiplication is done before the call, using an accumulator parameter that carries the result so far. After the call returns there is nothing left to do, so the call is in tail position.

Transforming to tail form usually means adding an accumulator parameter that holds the partial answer, passing it down, and returning it at the base case.

Tail-call optimisation (TCO) means the runtime replaces the call by a jump, reusing the frame. Scheme requires it, and functional languages such as Haskell and Scala (for self calls) support it. C compilers often do it at high optimisation levels. Python deliberately does not, in order to keep complete tracebacks, and JavaScript's specification includes it but only Safari implements it, so you cannot rely on it.

What to do in Python or JavaScript when depth is large:

- Rewrite as a loop, which is what TCO would produce; every tail-recursive function converts mechanically: parameters become loop variables, and the tail call becomes assignment to them
- Use a trampoline: the function returns a small function (a thunk) for the next step instead of calling it, and a loop keeps running thunks until a value comes back; the stack stays flat

Tail recursion is not automatically faster; its benefit is constant stack space where the language supports it.

## explain
1. Identify the work done after the recursive call returns, such as a multiplication.
2. Move that work before the call by adding an accumulator parameter holding the partial result.
3. Return the accumulator at the base case.
4. Check that the recursive call is the last operation, with nothing combined with its result.
5. If your language lacks TCO and depth can be large, convert to a loop or a trampoline.
6. Test with a small n by hand and a large n to see whether the stack survives.

## example
`fact_tail(5)` returns 120 by passing the running product down as the accumulator. Calling `fact_tail(5000)` raises a RecursionError in Python, because the interpreter does not optimise tail calls. The loop form `fact_loop(20)` gives 2432902008176640000 with constant stack. The trampoline version of `sum_to` returns a lambda for each step and the driver loop runs them, so `trampoline(sum_to, 100000)` finishes with 5000050000 without any deep stack. The JavaScript sample does the same with a trampoline.

## real
Functional programs depend on guaranteed tail calls for loops written as recursion, and libraries in JavaScript and Python use trampolines or explicit loops when processing very long lists recursively.

## pros
- Constant stack space where the language optimises tail calls
- The accumulator form maps directly onto a loop
- Trampolines make deep recursion safe in any language

## cons
- Not optimised in Python or most JavaScript engines
- The accumulator makes signatures less natural
- Trampolines add complexity and some overhead

## uses
- Writing loops as recursion in functional languages
- Converting deep recursion to iteration
- Processing long lists recursively without overflow
- Teaching how stack frames are reused

## mistakes
- Assuming Python will optimise a tail call
- Leaving an operation after the recursive call and calling it tail recursion
- Forgetting to return the accumulator at the base case
- Using tail form in Python for large inputs without a loop or trampoline

## interview
**Q:** What is a tail call?
**A:** A call that is the last action of a function, so its result is returned directly with no further computation in the caller.

**Q:** Does Python optimise tail recursion?
**A:** No. Python keeps every frame, so deep tail recursion raises RecursionError, and a loop or trampoline is needed instead.

**Q:** How do you convert a recursive factorial to tail-recursive form?
**A:** Add an accumulator parameter that holds the product so far, multiply into it before the recursive call, and return the accumulator at the base case.

## summary
Tail recursion puts the recursive call last, using an accumulator for the partial result. It runs in constant space only where the language optimises it, so in Python and JavaScript convert it to a loop or use a trampoline for deep inputs.

## codenote
The Python sample shows the accumulator version, its failure at depth, the loop form and a trampoline. The JavaScript sample uses a trampoline.

## code
### python
```python
def fact_tail(n, acc=1):
    return acc if n <= 1 else fact_tail(n - 1, acc * n)

print(fact_tail(5))

try:
    fact_tail(5000)
except RecursionError:
    print("RecursionError even in tail form")

def fact_loop(n):
    acc = 1
    while n > 1:
        acc *= n
        n -= 1
    return acc

print(fact_loop(20))

def trampoline(func, *args):
    result = func(*args)
    while callable(result):
        result = result()
    return result

def sum_to(n, acc=0):
    return acc if n == 0 else lambda: sum_to(n - 1, acc + n)

print(trampoline(sum_to, 100000))
```
Output:
```text
120
RecursionError even in tail form
2432902008176640000
5000050000
```
### javascript
```javascript
function trampoline(fn, ...args) {
  let result = fn(...args);
  while (typeof result === "function") {
    result = result();
  }
  return result;
}

const sumTo = (n, acc = 0) => (n === 0 ? acc : () => sumTo(n - 1, acc + n));

console.log(trampoline(sumTo, 100000));
```
Output:
```text
5000050000
```

## quiz
1. When is a recursive call a tail call?
   - [ ] When it is the first statement
   - [x] When it is the last thing the function does and its result is returned unchanged
   - [ ] When it is inside a loop
   - [ ] When it uses a lambda
   > Nothing remains to be done after it returns.
2. What is the purpose of an accumulator parameter?
   - [ ] To count the calls
   - [x] To carry the partial result down so no work remains after the call
   - [ ] To print values
   - [ ] To store the function name
   > It moves the pending work in front of the call.
3. What does Python do on a deep tail-recursive call?
   - [ ] Optimises it into a loop
   - [x] Raises RecursionError when the depth limit is reached
   - [ ] Skips frames silently
   - [ ] Switches to the heap
   > Python does not eliminate tail calls.
4. How does a trampoline keep the stack flat?
   - [ ] It deletes the stack
   - [x] Each step returns a function for the next step, and a loop runs them one at a time
   - [ ] It sorts the calls
   - [ ] It uses threads
   > Control returns to the loop between steps, so frames do not accumulate.

# Mutual Recursion
kind: algorithm
time: O(n) for the even and odd checks, which make n alternating calls; the number sequences below take O(n) calls for each term computed without caching, though the Hofstadter functions can be slower for large n.
space: O(n) stack depth for the alternating calls, since each pending call keeps a frame.

## intro
In mutual recursion two or more functions call each other in a cycle: A calls B, and B calls A. It sounds exotic, but it is the natural way to express things that are defined in terms of each other, such as the grammar of an expression with its sub-expressions.

## theory
The simplest example defines evenness and oddness in terms of one another. A number is even if it is zero or if the number before it is odd, and odd if it is not zero and the number before it is even. `is_even(n)` calls `is_odd(n - 1)`, which calls `is_even(n - 2)`, and so on until zero is reached.

Requirements are the same as for ordinary recursion, applied to the whole cycle:

- At least one function has a base case, and every cycle through the functions makes progress toward it
- Each function must be defined (or hoisted, in JavaScript) before the call is made at run time; in Python both names only need to exist when the call executes
- The combined stack depth is the total number of pending calls across all the functions

Where mutual recursion is natural:

- Recursive descent parsers: `expression` calls `term`, `term` calls `factor`, and `factor` calls `expression` again for a parenthesised sub-expression. Each rule of the grammar is a function.
- State machines where each state is a function that calls the next
- Sequences defined together, such as Hofstadter's female and male sequences, where `F(n) = n - M(F(n - 1))` and `M(n) = n - F(M(n - 1))`
- Document trees where one kind of node contains another kind and vice versa

Mutual recursion can always be converted to a single function with an extra parameter saying which role to play, or to a loop with an explicit state. Tail-call elimination for mutual recursion is harder than for self recursion.

## explain
1. List the functions and write what each one means in terms of the others.
2. Choose the base case or cases and which function returns them.
3. Make sure the cycle moves toward the base case on every pass.
4. Trace a small input through the alternation: write who calls whom.
5. For a parser, write one function per grammar rule and let the rules call each other.
6. Consider combining into one function if the mutual structure is accidental.

## example
`is_even(10)` calls `is_odd(9)`, which calls `is_even(8)`, down to `is_even(0)`, which is True. The prints show `True True False` for `is_even(10)`, `is_odd(7)` and `is_even(7)`. The Hofstadter functions produce the female sequence `[1, 1, 2, 2, 3, 3, 4, 5, 5, 6]` and the male sequence `[0, 0, 1, 2, 2, 3, 4, 4, 5, 6]` for n from 0 to 9. The JavaScript calculator uses three mutually recursive functions for expressions, terms and factors, evaluating `2+3*4` as 14 and `(2+3)*4` as 20, with multiplication binding tighter than addition because terms sit below expressions.

## real
Compilers and interpreters parse source code with recursive descent, where grammar rules call each other, and tools that process nested documents often have one function for each kind of node.

## pros
- Mirrors grammars and definitions that refer to each other
- Each function stays small and focused
- Keeps parser code organised rule by rule

## cons
- Harder to trace because control alternates between functions
- Stack depth adds up across all the functions
- Easy to create a cycle with no base case

## uses
- Recursive descent parsers
- Defining properties that depend on each other
- Walking documents with several node types
- Implementing state machines with function-per-state

## mistakes
- Forgetting that the cycle needs a base case in one of the functions
- Making progress in one function but undoing it in the other
- Calling a function before it exists in languages that require declaration order
- Underestimating combined stack depth

## interview
**Q:** What is mutual recursion?
**A:** A situation in which two or more functions call each other in a cycle, so that each is defined partly in terms of the others.

**Q:** Where does mutual recursion appear in practice?
**A:** Mainly in recursive descent parsers, where grammar rules such as expression, term and factor call one another, and in processing data with several nested kinds of nodes.

**Q:** How can mutual recursion be removed?
**A:** By merging the functions into one that takes an extra parameter indicating its role, or by using a loop with explicit state.

## summary
Mutual recursion splits a recursive definition across functions that call each other. Make sure the cycle has a base case and makes progress, and expect it mostly in parsers and structures with several node types.

## codenote
The Python sample shows the parity pair and the paired sequences. The JavaScript sample is a small recursive-descent calculator.

## code
### python
```python
def is_even(n):
    return True if n == 0 else is_odd(n - 1)

def is_odd(n):
    return False if n == 0 else is_even(n - 1)

print(is_even(10), is_odd(7), is_even(7))

def female(n):
    return 1 if n == 0 else n - male(female(n - 1))

def male(n):
    return 0 if n == 0 else n - female(male(n - 1))

print([female(n) for n in range(10)])
print([male(n) for n in range(10)])
```
Output:
```text
True True False
[1, 1, 2, 2, 3, 3, 4, 5, 5, 6]
[0, 0, 1, 2, 2, 3, 4, 4, 5, 6]
```
### javascript
```javascript
function evaluate(text) {
  let pos = 0;

  function expression() {
    let value = term();
    while (text[pos] === "+") {
      pos++;
      value += term();
    }
    return value;
  }

  function term() {
    let value = factor();
    while (text[pos] === "*") {
      pos++;
      value *= factor();
    }
    return value;
  }

  function factor() {
    if (text[pos] === "(") {
      pos++;
      const value = expression();
      pos++;
      return value;
    }
    const start = pos;
    while (/[0-9]/.test(text[pos] ?? "")) pos++;
    return Number(text.slice(start, pos));
  }

  return expression();
}

console.log(evaluate("2+3*4"), evaluate("(2+3)*4"));
```
Output:
```text
14 20
```

## quiz
1. What defines mutual recursion?
   - [ ] A function calling itself twice
   - [x] Two or more functions calling each other in a cycle
   - [ ] A recursive function with a loop
   - [ ] Recursion without a base case
   > The calls form a cycle across several functions.
2. Where does mutual recursion most naturally appear?
   - [ ] In sorting numbers
   - [x] In recursive descent parsers
   - [ ] In reading a file
   - [ ] In printing a table
   > Each grammar rule becomes a function that calls other rules.
3. What must hold for a mutually recursive pair to terminate?
   - [ ] Both must have large bases
   - [x] The cycle must make progress toward a base case in at least one function
   - [ ] Each function must call itself
   - [ ] They must be in different files
   > Without progress the alternation never ends.
4. How can mutual recursion be replaced?
   - [ ] It cannot
   - [x] By one function with a parameter for the role, or by a loop with explicit state
   - [ ] By deleting one function
   - [ ] By using global variables only
   > Merging the roles removes the cycle between separate functions.
