# Higher Order Functions Intro
kind: concept
time: Not applicable — a higher-order function adds one call per element it processes, so map and filter over n items do work proportional to n. This introduction concentrates on the idea rather than analysing running time.
space: Not applicable — functions such as map return a new collection or a lazy iterator, so memory use depends on the function and the data.

## intro
A higher-order function is a function that takes another function as an argument, returns one, or both. Treating functions as ordinary values lets you separate what to do for each item from how to walk through the items, which is the idea behind map, filter, reduce, callbacks and decorators.

## theory
Functions are first-class values in Python and JavaScript: they can be stored in variables, passed to other functions, returned from functions and kept in data structures.

Common higher-order functions:

- map applies a function to every item and collects the results
- filter keeps the items for which a predicate function returns true
- reduce (fold) combines all items into one value by repeatedly applying a two-argument function
- sorting with a key function, where the function says what to compare
- Callbacks: a function given to another to be called later, such as an event handler
- Function factories: a function that builds and returns a new, customised function
- Decorators: a function that takes a function and returns an enhanced version of it

The benefit is separation of concerns: the looping logic is written once, and the varying behavior is passed in. Instead of three nearly identical loops that square, double and negate numbers, you write one `map` and pass the three operations.

Closures matter here: a function returned from another function remembers the variables from where it was created. `make_multiplier(3)` returns a function that always multiplies by 3, because it has captured that value.

In Python, list comprehensions are often preferred to `map` and `filter` for readability, but the underlying idea is the same. `functools.reduce` is available, while `sum`, `max` and `any` cover the most common reductions.

## explain
1. Identify the part of a loop that varies: the transformation, the test or the combination rule.
2. Write that part as a small function.
3. Pass it to a higher-order function that handles the iteration.
4. When you need a customised function, write a factory that captures the parameter.
5. Check that the function you pass has the right number of parameters, one for map and filter, two for reduce.
6. Prefer a comprehension when it reads more clearly.

## example
With the list `[1, 2, 3, 4]` and named functions `square` and `is_even`, `map(square, nums)` gives `[1, 4, 9, 16]`, `filter(is_even, nums)` gives `[2, 4]` and `reduce` with an addition function gives 10. The factory `make_multiplier(2)` returns a function that doubles, so `double(21)` is 42, and `apply_twice(double, 5)` applies it two times to give 20. The JavaScript version uses the array methods `map`, `filter` and `reduce` in the same way.

## real
Web frameworks register callbacks for events and requests, data pipelines chain map and filter stages, and decorators add logging, caching and authorisation to functions without changing their bodies.

## pros
- Removes repeated loop code
- Behavior can be configured by passing functions
- Closures give functions private, customised state

## cons
- Heavily nested functional chains can be hard to read
- Debugging through callbacks is less direct
- Beginners find functions-as-values unfamiliar

## uses
- Transforming and filtering collections
- Registering event handlers and callbacks
- Customising behavior with strategy functions
- Adding cross-cutting behavior with decorators

## mistakes
- Calling the function instead of passing it, writing f() where f was meant
- Passing a function that takes the wrong number of arguments
- Forgetting that Python 3 map and filter return lazy iterators
- Writing deeply nested one-liners that nobody can read

## interview
**Q:** What is a higher-order function?
**A:** A function that takes one or more functions as arguments, returns a function as its result, or both.

**Q:** What do map, filter and reduce do?
**A:** Map applies a function to every item, filter keeps items that satisfy a predicate, and reduce combines all items into a single value using a two-argument function.

**Q:** What is a closure?
**A:** A function together with the variables from the scope where it was created, which it can still use after that scope has finished. Function factories rely on this.

## summary
Functions are values that can be passed and returned. Higher-order functions separate iteration from behavior, and closures let a function remember its configuration.

## codenote
The Python sample uses map, filter and reduce with named functions, then a factory and a function that applies another twice. The JavaScript sample shows the array methods.

## code
### python
```python
from functools import reduce

def square(n):
    return n * n

def is_even(n):
    return n % 2 == 0

def add(a, b):
    return a + b

nums = [1, 2, 3, 4]
print(list(map(square, nums)), list(filter(is_even, nums)), reduce(add, nums))

def make_multiplier(k):
    def multiply(n):
        return n * k
    return multiply

def apply_twice(func, value):
    return func(func(value))

double = make_multiplier(2)
print(double(21), apply_twice(double, 5))
```
Output:
```text
[1, 4, 9, 16] [2, 4] 10
42 20
```
### javascript
```javascript
const nums = [1, 2, 3, 4];

console.log(nums.map((n) => n * n));
console.log(nums.filter((n) => n % 2 === 0));
console.log(nums.reduce((a, b) => a + b, 0));
```
Output:
```text
[ 1, 4, 9, 16 ]
[ 2, 4 ]
10
```

## quiz
1. What makes a function higher-order?
   - [ ] It is very long
   - [x] It takes a function as an argument or returns a function
   - [ ] It has no parameters
   - [ ] It uses recursion
   > Treating functions as values is the defining property.
2. What does filter do?
   - [ ] Changes every item
   - [x] Keeps only the items for which a test function returns true
   - [ ] Sorts the items
   - [ ] Combines items into one value
   > A predicate decides which items survive.
3. What is the effect of writing map(square(), nums) instead of map(square, nums)?
   - [ ] No difference
   - [x] The function is called immediately with no argument instead of being passed
   - [ ] The list is reversed
   - [ ] It runs faster
   > Parentheses call the function; leaving them off passes the function itself.
4. What does make_multiplier(3) return?
   - [ ] The number 3
   - [x] A function that multiplies its argument by 3
   - [ ] A list
   - [ ] None
   > The returned inner function remembers the captured value.

# Lambda and Anonymous Functions
kind: concept
time: Not applicable — a lambda is an ordinary function written inline, so calling it costs the same as calling a named function.
space: Not applicable — a lambda is a function object like any other, and any variables it captures stay alive while it exists.

## intro
A lambda, or anonymous function, is a small function written inline without a name. It is meant for short throwaway operations such as the key of a sort or a callback, where defining a named function would be more ceremony than the code deserves.

## theory
Syntax:

- Python: `lambda parameters: expression`. The body must be a single expression, not statements, and its value is returned automatically.
- JavaScript: arrow functions `(a, b) => a + b`, with a block body `{ ... }` when more than one statement is needed, and the older `function (a, b) { ... }` expression
- Java, C++ and others have similar lambda syntax

Characteristics:

- Anonymous: it has no name of its own, which makes tracebacks and debugging less informative; assigning it to a variable gives it no better name in Python's error messages
- Closures: lambdas capture variables from the enclosing scope
- In JavaScript, arrow functions also differ from ordinary functions in that they do not have their own `this`, which makes them suitable as callbacks inside methods

The late binding trap: a lambda captures the variable, not its value at creation time. In `[lambda: i for i in range(3)]` every lambda refers to the same `i`, which is 2 when the loop ends, so all three return 2. The fix is to bind the current value through a default argument, `lambda i=i: i`.

Style guidance: use lambdas for short one-liners passed to other functions. If the logic needs a name, a comment, several lines or reuse, write a `def`. Python style guides discourage assigning a lambda to a name, because a `def` does the same and shows its name in tracebacks.

## explain
1. Ask whether the function is short, used once and passed directly to another function.
2. If so, write it as a lambda or arrow function in place.
3. Keep the body to a single clear expression.
4. If you capture loop variables, bind the current value explicitly.
5. If you need to reuse it or it grows, turn it into a named function.
6. Remember the Python limit: no statements such as assignments or loops inside a lambda.

## example
Sorting the words `["pear", "fig", "apple", "kiwi"]` with `key=lambda w: (len(w), w)` orders them by length and then alphabetically: `['fig', 'kiwi', 'pear', 'apple']`. Building a list of lambdas in a loop and calling them gives `[2, 2, 2]` because all share the final value of `i`, while binding with a default argument gives `[0, 1, 2]`. The JavaScript arrow function sorts numbers in descending order with `(a, b) => b - a`, producing `[ 3, 2, 1 ]`.

## real
Sorting, filtering and event handling code is full of inline lambdas, such as clicking a button and running a small arrow function that saves the form, and data libraries accept lambdas for column transformations.

## pros
- Compact for short operations passed to other functions
- Keeps the behavior next to the place where it is used
- Closures over local variables are convenient

## cons
- Limited to one expression in Python
- Anonymous functions are harder to debug
- Late binding of captured variables surprises beginners

## uses
- Providing sort keys
- Passing short callbacks and handlers
- Transforming items in map and filter
- Creating small configured functions

## mistakes
- Writing long, complicated lambdas that need a name
- Capturing a loop variable and getting the last value in every function
- Assigning lambdas to names instead of using def
- Trying to put statements inside a Python lambda

## interview
**Q:** What is a lambda function?
**A:** A small anonymous function defined inline. In Python it consists of the lambda keyword, parameters and a single expression whose value is returned.

**Q:** Why do all lambdas created in a loop return the same value in Python?
**A:** They capture the variable itself, not its value at creation time, so when called later they all see its final value. Binding it as a default argument fixes this.

**Q:** When should you prefer def over lambda?
**A:** When the function needs a name, several statements, documentation or reuse, because a named function gives clearer tracebacks and is easier to read.

## summary
Lambdas are short inline functions for sort keys and callbacks. Keep them to one simple expression, watch for late binding of captured variables, and use a named function when it grows.

## codenote
The Python sample shows a lambda sort key and the late-binding trap with its fix. The JavaScript sample uses an arrow function as a comparator.

## code
### python
```python
words = ["pear", "fig", "apple", "kiwi"]
print(sorted(words, key=lambda w: (len(w), w)))

late = [lambda: i for i in range(3)]
print([f() for f in late])

bound = [lambda i=i: i for i in range(3)]
print([f() for f in bound])
```
Output:
```text
['fig', 'kiwi', 'pear', 'apple']
[2, 2, 2]
[0, 1, 2]
```
### javascript
```javascript
const numbers = [3, 1, 2];
numbers.sort((a, b) => b - a);
console.log(numbers);
```
Output:
```text
[ 3, 2, 1 ]
```

## quiz
1. What can the body of a Python lambda contain?
   - [ ] Any number of statements
   - [x] A single expression
   - [ ] Only a return statement
   - [ ] A loop
   > The expression's value is returned automatically.
2. Why do lambdas created in a loop often all return the last value?
   - [ ] Python reuses the first lambda
   - [x] They capture the variable, which has its final value when they are called
   - [ ] The loop runs backwards
   - [ ] Lambdas cannot be stored in lists
   > Late binding looks up the variable at call time.
3. What is the arrow function (a, b) => b - a used for in the lesson?
   - [ ] Printing numbers
   - [x] A comparator that sorts numbers in descending order
   - [ ] Converting to text
   - [ ] Reversing a string
   > A positive result means a should come after b.
4. When should you write a def instead of a lambda?
   - [ ] When the function is one short expression
   - [x] When it needs a name, several statements or reuse
   - [ ] Never
   - [ ] Only for methods
   > Named functions are clearer in tracebacks and easier to read when they grow.

# Recursion Preview in Functions
kind: algorithm
time: O(n) for factorial and countdown with n levels of recursion, and O(n) for flattening a nested array with n total items, since each call does constant work.
space: O(n) for the call stack, because n pending calls exist at the deepest point of the factorial and countdown examples.
practice: factorial-calculation

## intro
A recursive function calls itself to solve a smaller version of the same problem. This preview shows the shape of every recursive function, the base case that stops it and the recursive case that shrinks the problem, before the recursion module treats the subject in depth.

## theory
Every correct recursive function has two parts:

- A base case, the smallest input that can be answered directly, with no further calls
- A recursive case that reduces the problem toward the base case and uses the result of the smaller call

If either is missing, the function either never stops (no base case, or a recursive case that does not shrink) or never produces anything useful.

How it runs: each call gets its own parameters and local variables in a new stack frame. The calls pile up as they descend, then return in reverse order as each base case is reached. For `factorial(3)` the calls are `factorial(3)`, `factorial(2)`, `factorial(1)`, then multiplication happens as they return: 1, then 2 × 1, then 3 × 2.

Recursion fits problems defined in terms of smaller copies: factorials, sums of lists, tree and directory traversal, nested structures like JSON and parse trees, divide-and-conquer methods. The cost is stack space and call overhead, and languages limit stack depth (about 1000 calls by default in Python). Many recursive functions can be rewritten as loops, which is safer for very deep inputs.

To design one, state the answer for the smallest case, assume the function works for a smaller input (the leap of faith), and express the answer for the current input using that smaller result.

## explain
1. Decide the smallest input and its answer; this is the base case.
2. Decide how to make the input smaller by one step or by splitting it.
3. Express the answer in terms of the answer for the smaller input.
4. Check that every call moves strictly closer to the base case.
5. Trace a small input by hand, writing down each call and return.
6. Consider the maximum depth and whether a loop would be safer.

## example
`factorial(n)` returns 1 for n of 1 or less, and otherwise n times `factorial(n - 1)`. Calling it for 5 and 10 gives 120 and 3628800. The function `countdown(3)` prints 3, 2, 1 and then "liftoff" when it reaches zero, showing the order in which the calls happen. The JavaScript function `flatten` handles nested arrays: for each item it either recurses into an array or keeps the plain value, turning `[1, [2, [3, 4]], 5]` into `[ 1, 2, 3, 4, 5 ]`.

## real
File explorers walk directory trees recursively, JSON parsers handle nested objects by recursion, and compilers process expression trees the same way.

## pros
- Direct translation of self-similar definitions
- Short, clear code for tree-like data
- Natural base for divide-and-conquer methods

## cons
- Uses stack space proportional to depth
- Deep recursion can overflow the stack
- Function-call overhead makes it slower than an equivalent loop

## uses
- Computing factorials and similar definitions
- Traversing directories and nested data
- Splitting problems in half
- Evaluating expressions and parse trees

## mistakes
- Omitting the base case
- Making a recursive call that does not move toward the base case
- Recursing too deeply on large inputs
- Recomputing the same sub-problems repeatedly

## interview
**Q:** What are the two essential parts of a recursive function?
**A:** The base case, which returns an answer directly without recursion, and the recursive case, which calls the function on a smaller input and combines the result.

**Q:** What happens if a recursive function lacks a base case?
**A:** It calls itself endlessly until the stack is exhausted, causing a RecursionError in Python or a stack overflow in other languages.

**Q:** Why can recursion use more memory than a loop?
**A:** Each pending call occupies a stack frame, so a recursion of depth n needs space proportional to n, while a loop reuses the same variables.

## summary
Recursive functions need a base case and a recursive case that moves toward it. They suit self-similar problems but cost stack space, so consider loops for very deep inputs.

## codenote
The Python sample shows a value-returning recursion and one that acts on the way down. The JavaScript sample recurses through nested arrays.

## code
### python
```python
def factorial(n):
    if n <= 1:
        return 1
    return n * factorial(n - 1)

print(factorial(5), factorial(10))

def countdown(n):
    if n == 0:
        print("liftoff")
        return
    print(n)
    countdown(n - 1)

countdown(3)
```
Output:
```text
120 3628800
3
2
1
liftoff
```
### javascript
```javascript
const flatten = (items) =>
  items.flatMap((item) => (Array.isArray(item) ? flatten(item) : [item]));

console.log(flatten([1, [2, [3, 4]], 5]));
```
Output:
```text
[ 1, 2, 3, 4, 5 ]
```

## quiz
1. What is the base case of factorial in the lesson?
   - [ ] n greater than 10
   - [x] n less than or equal to 1, which returns 1
   - [ ] n equal to 100
   - [ ] There is none
   > It stops the recursion with a direct answer.
2. What happens if the recursive call does not move toward the base case?
   - [ ] The function returns 0
   - [x] It recurses until the stack overflows
   - [ ] It stops after ten calls
   - [ ] It becomes a loop
   > The calls never reach the base case.
3. What is the space cost of recursive factorial for input n?
   - [ ] O(1)
   - [x] O(n) for the call stack
   - [ ] O(log n)
   - [ ] O(n squared)
   > Each pending call keeps a frame.
4. Which problem suits recursion naturally?
   - [ ] Printing a string once
   - [x] Walking a tree of nested folders
   - [ ] Adding two numbers
   - [ ] Reading one line of input
   > Nested structures are defined in terms of smaller copies of themselves.

# Modular Program Design
kind: concept
time: Not applicable — dividing a program into modules affects maintainability and teamwork rather than running time.
space: Not applicable — modules organise code; they do not define a memory bound.

## intro
A modular program is divided into separate parts, each with a clear responsibility and a small public interface. Good modularity lets a team work in parallel, lets each part be tested and replaced on its own, and keeps the effect of a change local.

## theory
Principles that define good modules:

- Single responsibility: each module or function has one reason to change
- High cohesion: things inside a module belong together and serve one purpose
- Low coupling: modules depend on each other as little as possible and only through narrow interfaces
- Information hiding: internal data and helper functions are not exposed; callers use the public functions
- Separation of concerns: input and output, business rules and data storage are kept apart
- A clear direction of dependencies: high-level logic depends on abstractions, not on low-level details

In practice a program is organised in layers or pipelines. A small program might have functions for parsing input, validating it, computing results and formatting output; a larger one has packages and files for each concern, with an entry point that wires them together.

Language support: Python files are modules imported with `import`; leading underscores signal private names. JavaScript has ES modules (`export` and `import`) and, historically, closures used as the module pattern. Java has packages and access modifiers such as `private`.

Signs of poor modularity: one giant file or function, circular dependencies, modules that need to know each other's internals, a change in one place that breaks distant code, and code that cannot be tested without starting everything.

## explain
1. List the main tasks of the program and group the ones that change for the same reasons.
2. Give each group a function or module with a descriptive name.
3. Decide what each module exposes and keep everything else private.
4. Pass data between modules through parameters and return values rather than shared global state.
5. Test each module on its own.
6. Review the dependencies; remove cycles and unnecessary links.

## example
The Python pipeline has four small functions: `parse` splits a line of text into a name, quantity and price, `line_total` multiplies, `render` formats the result, and `process` wires them together. `process("pen,3,1.50")` returns `pen: 4.50`, and `line_total(2, 2.5)` can be tested directly and gives 5.0. In the JavaScript sample a closure hides the array of items, and only the add and count operations are exposed: after two additions `cart.count()` is 2, while `cart.items` is undefined because the array is private.

## real
Large systems are divided into services and libraries with documented interfaces, and teams own modules. Refactoring a monolithic script into modules is a common first step in making legacy code testable.

## pros
- Parts can be developed, tested and replaced independently
- Changes stay local, so risk is lower
- Interfaces document how the parts fit together

## cons
- Designing good boundaries takes experience
- Too many tiny modules create overhead and indirection
- Poor boundaries can be worse than none

## uses
- Structuring programs that grow beyond one file
- Splitting a code base so teammates can work on separate parts at once
- Making code testable with test doubles for dependencies
- Reusing parts in several programs

## mistakes
- Putting everything in one file or function
- Letting modules reach into each other's internals
- Using global variables to share data between modules
- Creating circular dependencies between modules

## interview
**Q:** What are cohesion and coupling?
**A:** Cohesion is how closely the contents of a module belong together; coupling is how much modules depend on each other. Good designs have high cohesion and low coupling.

**Q:** Why is information hiding useful?
**A:** Callers can only depend on the public interface, so the internals can change freely without breaking anyone.

**Q:** How does modular design help testing?
**A:** Each module can be tested alone, with its dependencies replaced by simple stand-ins, so failures point to a specific part.

## summary
Divide programs into cohesive modules with narrow interfaces, hide internals, avoid shared global state and keep dependencies simple. The payoff is code that is easier to test, change and share.

## codenote
The Python sample splits a task into parse, calculate and render steps joined by one function. The JavaScript sample uses a closure to hide state behind a small interface.

## code
### python
```python
def parse(line):
    name, quantity, price = line.split(",")
    return name, int(quantity), float(price)

def line_total(quantity, price):
    return quantity * price

def render(name, total):
    return f"{name}: {total:.2f}"

def process(line):
    name, quantity, price = parse(line)
    return render(name, line_total(quantity, price))

print(process("pen,3,1.50"))
print(line_total(2, 2.5))
```
Output:
```text
pen: 4.50
5.0
```
### javascript
```javascript
const cart = (() => {
  const items = [];
  return {
    add(item) {
      items.push(item);
    },
    count() {
      return items.length;
    },
  };
})();

cart.add("pen");
cart.add("ink");
console.log(cart.count(), typeof cart.items);
```
Output:
```text
2 undefined
```

## quiz
1. What does low coupling between modules mean?
   - [ ] Modules share many global variables
   - [x] Modules depend on each other as little as possible, through narrow interfaces
   - [ ] Modules are in one file
   - [ ] Modules have no functions
   > Loose connections let one part change without affecting others.
2. What is information hiding?
   - [ ] Deleting source code
   - [x] Keeping internal details private so callers use only the public interface
   - [ ] Encrypting files
   - [ ] Removing comments
   > It protects callers from changes to the internals.
3. Which is a sign of poor modularity?
   - [ ] A function with one purpose
   - [x] A change in one place breaking code in distant places
   - [ ] A short function name
   - [ ] A test for each function
   > Hidden dependencies make changes risky.
4. Why pass data through parameters instead of globals?
   - [ ] Parameters run faster
   - [x] The dependencies are explicit and each module can be tested alone
   - [ ] Globals are not allowed
   - [ ] Parameters use less memory
   > Explicit inputs make the flow visible.

# Testing Functions
kind: concept
time: Not applicable — a test run is a development activity. Fast tests matter for feedback, but the lesson is about how to design tests.
space: Not applicable — tests keep small inputs and expected values.

## intro
Unit tests check a single function in isolation: call it with chosen inputs and compare the result with what you expect. A suite of such tests is the safety net that lets you change code with confidence, and good functions are shaped to be easy to test.

## theory
Concepts:

- Unit test: automated check of the smallest testable part, usually a function
- Arrange, act, assert: set up the inputs, call the function, check the outcome. Each test should check one behavior and have a name that states it.
- Test cases include typical inputs, boundary values (empty, zero, one, maximum), invalid inputs and error conditions
- Fixtures: shared set-up code that creates the data tests need
- Parameterised tests: the same test body run over a table of input and expected pairs
- Test doubles: stand-ins such as stubs and mocks that replace a slow or unreliable dependency (a database, the network, the clock) so the unit can be tested alone
- Isolation and independence: tests must not depend on each other or on execution order
- Regression tests: written for each bug fixed

Tools: Python's `unittest` (built in) and `pytest`; JavaScript's built-in `node:test`, Jest and Vitest; JUnit for Java.

Testability: pure functions are the easiest to test. Functions that read the clock, call the network or write files need those dependencies passed in so a test can substitute them.

Guidelines: tests should be fast, deterministic and readable; failing tests should explain what went wrong; testing behavior rather than implementation details keeps tests from breaking whenever you refactor.

## explain
1. Write down what the function promises: inputs, outputs and errors.
2. List cases: normal, boundary, invalid and special.
3. For each case, write a test with a descriptive name: arrange, act, assert.
4. Run the tests and watch them fail for the right reason if the function is not written yet.
5. Make them pass, then refactor with the tests as protection.
6. Add a test for every bug that you fix.

## example
The function `is_palindrome` ignores case and punctuation. The Python test class has four tests: the word "level", the phrase "A man, a plan, a canal: Panama", the negative case "ThinkStack" and the empty string. The runner executes the suite quietly and the program prints that 4 tests ran and the run was successful. The JavaScript sample keeps a table of cases with expected outputs for a small `clamp` function, runs each in a try block and reports how many passed.

## real
Continuous integration servers run thousands of unit tests on every change, and teams treat a failing test as a blocker. Test-driven development writes the test first and the function second.

## pros
- Catches regressions immediately
- Documents the expected behavior with examples
- Enables safe refactoring

## cons
- Takes time to write and maintain
- Badly designed tests break on harmless changes
- Cannot prove the absence of bugs

## uses
- Verifying functions after changes
- Reproducing bugs and preventing their return
- Specifying behavior before implementation
- Gating merges in continuous integration

## mistakes
- Testing only the typical case
- Tests that depend on the order they run in
- Asserting on implementation details instead of behavior
- Skipping tests for error handling

## interview
**Q:** What is the arrange, act, assert pattern?
**A:** A test structure with three parts: set up the inputs and state, perform the call under test, then check the result against the expectation.

**Q:** Why use test doubles?
**A:** They replace slow, unreliable or unavailable dependencies such as databases and network services, so the unit under test can be tested quickly and deterministically.

**Q:** What makes a function easy to test?
**A:** Pure behavior with explicit inputs and outputs, no hidden dependencies, and a single clear responsibility.

## summary
Test functions in isolation with typical, boundary and invalid inputs, follow arrange-act-assert, keep tests independent and fast, and design functions so their dependencies can be replaced.

## codenote
The Python sample runs a small unittest suite programmatically and reports the outcome. The JavaScript sample drives a table of cases through a function and counts the passes.

## code
### python
```python
import os
import unittest

def is_palindrome(text):
    cleaned = "".join(c.lower() for c in text if c.isalnum())
    return cleaned == cleaned[::-1]

class PalindromeTests(unittest.TestCase):
    def test_simple_word(self):
        self.assertTrue(is_palindrome("level"))

    def test_phrase_with_punctuation(self):
        self.assertTrue(is_palindrome("A man, a plan, a canal: Panama"))

    def test_not_a_palindrome(self):
        self.assertFalse(is_palindrome("ThinkStack"))

    def test_empty_string(self):
        self.assertTrue(is_palindrome(""))

suite = unittest.defaultTestLoader.loadTestsFromTestCase(PalindromeTests)
with open(os.devnull, "w") as quiet:
    result = unittest.TextTestRunner(stream=quiet).run(suite)
print(result.testsRun, result.wasSuccessful())
```
Output:
```text
4 True
```
### javascript
```javascript
const assert = require("assert");

const clamp = (x, low, high) => Math.min(Math.max(x, low), high);

const cases = [
  [5, 0, 10, 5],
  [-3, 0, 10, 0],
  [42, 0, 10, 10],
];

let passed = 0;
for (const [x, low, high, expected] of cases) {
  try {
    assert.strictEqual(clamp(x, low, high), expected);
    passed++;
  } catch (error) {
    console.log("failed for", x);
  }
}
console.log(`${passed}/${cases.length} passed`);
```
Output:
```text
3/3 passed
```

## quiz
1. What are the three steps of the arrange, act, assert pattern?
   - [ ] Plan, build, ship
   - [x] Set up inputs, call the function, check the result
   - [ ] Read, write, delete
   - [ ] Declare, loop, return
   > Each test follows the same simple shape.
2. Why should tests be independent of each other?
   - [ ] To run slower
   - [x] So they can run in any order and a failure points to one cause
   - [ ] Because tests cannot share variables in any language
   - [ ] To avoid assertions
   > Order dependence makes failures confusing and unreliable.
3. What is a test double used for?
   - [ ] Running a test twice
   - [x] Replacing a slow or unreliable dependency so the unit can be tested alone
   - [ ] Copying a test
   - [ ] Formatting output
   > Stubs and mocks give controlled behavior.
4. Which inputs should a test suite for a function include?
   - [ ] Only typical values
   - [x] Typical, boundary and invalid inputs
   - [ ] Only huge values
   - [ ] Only empty values
   > Bugs tend to hide at the edges and in error handling.

# Documenting Function Contracts
kind: concept
time: Not applicable — documentation and contract checks do not change an algorithm's growth. Run-time checks of preconditions cost a little time per call.
space: Not applicable — a contract is a description of behavior, not a data structure.

## intro
A function contract is a precise statement of what a function requires from its callers and what it promises in return. Writing it down, in the docstring, type hints and checks, turns the function into something others can use correctly without reading its body.

## theory
The parts of a contract:

- Preconditions: what must be true before the call (arguments valid, state ready). The caller is responsible for these.
- Postconditions: what will be true after the call if the preconditions held: the return value's meaning, changes made
- Invariants: facts that hold before and after, for example "the balance is never negative"
- Errors: which exceptions or error values the function produces and when
- Side effects: anything changed outside the function, such as a modified argument, a file written or a global updated
- Performance notes: complexity when it matters

Where to put it:

- A docstring (Python) or documentation comment (JSDoc, Javadoc) describing purpose, parameters, return value and exceptions. Common layouts are Google style with Args, Returns and Raises sections, NumPy style and reStructuredText.
- Type hints and annotations that tools can verify
- Assertions and explicit checks that enforce preconditions at run time and fail with a clear message
- Tests that serve as executable examples (doctests in Python run the examples inside the docstring)

The contract is a division of responsibility. If the caller violates a precondition, the function may fail or do anything, and it should preferably fail early and clearly. If the preconditions hold, the function must deliver its postconditions. Writing the contract before the code clarifies what the function should be, and changing the contract later is a change to the interface that affects every caller.

Good documentation states what, not how; mentions units and ranges; says whether arguments are modified; and lists exceptions.

## explain
1. Write one sentence saying what the function does.
2. List the preconditions: valid ranges, types, state.
3. Describe the return value, including its type, units and special cases.
4. List the exceptions raised and the conditions.
5. Note side effects and mutation of arguments.
6. Add checks for the preconditions that matter, and tests for the documented behavior.

## example
The function `withdraw(balance, amount)` documents that the amount must be positive and no more than the balance, returns the new balance, and raises ValueError otherwise. Calling `withdraw(100, 30)` returns 70, while `withdraw(100, 500)` is rejected with the message "invalid withdrawal". The first line of the docstring, "Return the new balance.", is available to tools at run time. The JavaScript version uses a JSDoc comment with parameter, return and throws tags above a function with the same checks.

## real
Editors show a function's documentation when you hover over a call, API documentation sites are generated from these comments, and design-by-contract languages such as Eiffel make preconditions and postconditions part of the language.

## pros
- Callers can use a function without reading its body
- Violations are detected early with clear messages
- The contract serves as a specification for tests

## cons
- Documentation can go out of date
- Run-time checks add small costs and code
- Over-specifying details makes later change harder

## uses
- Documenting public functions and libraries
- Defining the responsibilities of caller and callee
- Generating reference documentation
- Writing tests directly from the contract

## mistakes
- Documenting how the code works instead of what it promises
- Leaving out which exceptions can be raised
- Not mentioning that an argument is modified
- Letting the docstring drift away from the actual behavior

## interview
**Q:** What are preconditions and postconditions?
**A:** A precondition is a condition the caller must satisfy before calling a function; a postcondition is what the function guarantees about its result or state after it returns, provided the preconditions held.

**Q:** Where should a function's contract be written?
**A:** In its docstring or documentation comment, supported by type hints, run-time checks for important preconditions and tests that verify the promised behavior.

**Q:** Why state side effects in the documentation?
**A:** Callers need to know whether the function changes their data or the program's state, because a hidden side effect leads to surprising bugs.

## summary
A contract states preconditions, postconditions, errors and side effects. Write it in a docstring, back it with type hints, checks and tests, and keep it up to date.

## codenote
The Python function documents its preconditions and enforces them; the sample shows the normal result, the rejection and the first docstring line. The JavaScript sample uses JSDoc tags.

## code
### python
```python
def withdraw(balance: float, amount: float) -> float:
    """Return the new balance after taking amount out.

    Preconditions: amount > 0 and amount <= balance.
    Raises ValueError if a precondition is violated.
    """
    if amount <= 0 or amount > balance:
        raise ValueError("invalid withdrawal")
    return balance - amount

print(withdraw(100, 30))

try:
    withdraw(100, 500)
except ValueError as error:
    print("rejected:", error)

print(withdraw.__doc__.splitlines()[0])
```
Output:
```text
70
rejected: invalid withdrawal
Return the new balance after taking amount out.
```
### javascript
```javascript
/**
 * Return the new balance after taking amount out.
 * @param {number} balance - current balance, not modified
 * @param {number} amount - positive and no larger than balance
 * @returns {number}
 * @throws {RangeError} if amount is not within 1..balance
 */
function withdraw(balance, amount) {
  if (amount <= 0 || amount > balance) throw new RangeError("invalid withdrawal");
  return balance - amount;
}

console.log(withdraw(100, 30));
try {
  withdraw(100, 500);
} catch (error) {
  console.log(error.name + ": " + error.message);
}
```
Output:
```text
70
RangeError: invalid withdrawal
```

## quiz
1. Who is responsible for satisfying a function's preconditions?
   - [ ] The function itself
   - [x] The caller
   - [ ] The compiler
   - [ ] The operating system
   > A function promises its postconditions only when the caller meets its preconditions.
2. Which of these belongs in a function's documentation?
   - [ ] The editor theme
   - [x] The exceptions it can raise and when
   - [ ] The author's lunch order
   - [ ] The line count
   > Callers need to know about errors to handle them.
3. What is a postcondition?
   - [ ] A check before the call
   - [x] What the function guarantees after it returns
   - [ ] A comment at the end of the file
   - [ ] A loop condition
   > It describes the result and state if the preconditions held.
4. Why should the documentation say whether arguments are modified?
   - [ ] To make it longer
   - [x] A hidden mutation can surprise callers and cause bugs
   - [ ] Because arguments are never modified
   - [ ] To hide the implementation
   > Side effects are part of the contract.
