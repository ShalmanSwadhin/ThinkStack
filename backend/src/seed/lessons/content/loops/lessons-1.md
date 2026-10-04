# Why Loops Matter
kind: concept
time: Not applicable — this lesson explains why repetition exists. The running time of a particular loop depends on how many times it repeats, which later lessons measure.
space: Not applicable — a loop re-uses the same variables on each repetition, so the idea itself needs no extra memory.

## intro
A loop repeats a block of code. Without loops, a program would need one line for every item it processes, and it could never handle input whose size is unknown when the program is written. Loops are what turn a handful of instructions into a computation over thousands or millions of values.

## theory
Repetition solves three problems at once:

- Scale: the same instructions handle 5 values or 5 million without being rewritten
- Unknown size: a loop can run until the data ends or until a condition is met, so the program does not need to know the amount of data in advance
- Maintainability: a calculation written once is fixed once; copy-pasted lines must all be corrected

Every loop has the same four parts, whatever the syntax:

- Initialisation: the starting state, such as a counter set to zero
- Condition: the test that decides whether to run the body again
- Body: the work done on each pass
- Update: the change that moves the loop toward ending, such as incrementing the counter

The main loop families are counted loops (`for`), condition-controlled loops (`while`), loops that run at least once (`do while`) and loops over the items of a collection (`for each`). Each is a different way of expressing the same four parts.

Loops also introduce the idea of a running cost. A loop that executes n times does work proportional to n, and a loop inside a loop multiplies the counts. Choosing and arranging loops is therefore the first step toward understanding how fast a program is.

## explain
1. Notice the repetition: you are about to write the same kind of line twice.
2. Identify what changes from one pass to the next; that becomes the loop variable.
3. Identify what accumulates across passes, such as a total, and initialise it before the loop.
4. Decide how the loop ends: after a count, when the data runs out or when a condition becomes false.
5. Write the body for a single pass and check that the update moves toward the end.
6. Trace the first and last pass by hand to confirm the start and end values.

## example
Adding 1 to 5 by hand needs a line like `1 + 2 + 3 + 4 + 5`, which gives 15. A loop with a running total reaches the same 15 by adding one number per pass. Changing the range to 1 through 1000 requires editing a single number, and the loop produces 500500, whereas the hand-written version would need a thousand terms. A second loop prints rows of stars whose length grows with the row number: one star, two stars, three stars.

## real
Every program that reads a file, draws a frame of a game, serves requests or processes a list of orders is built around loops. The main loop of a game or a server runs for as long as the program is alive.

## pros
- One piece of code handles any amount of data
- Reduces duplication and the chance of copy-paste errors
- Makes it possible to process data whose size is unknown in advance

## cons
- A mistake in the condition or update can run forever or stop early
- Loops hide the cost of repetition, so a slow loop is easy to write
- Off-by-one errors at the start and end are very common

## uses
- Summing, counting and searching through lists
- Reading input until the end of a file
- Drawing repeated shapes or frames
- Retrying an operation until it succeeds

## mistakes
- Forgetting to update the loop variable, so the loop never ends
- Starting or ending one position too early or too late
- Forgetting to initialise the accumulator before the loop
- Copy-pasting the body several times instead of using a loop

## interview
**Q:** What are the parts of a loop?
**A:** Initialisation, a condition that decides whether to continue, a body that does the work and an update that moves the loop toward its end.

**Q:** Why are loops needed when a program could simply repeat statements?
**A:** Repeating statements by hand cannot handle data whose size is unknown in advance, and it multiplies the code to read, test and fix.

**Q:** What is an off-by-one error?
**A:** A mistake where a loop runs one time too many or too few, usually because of a wrong start value or a wrong comparison such as less than versus less than or equal.

## summary
Loops let a short piece of code process any amount of data. Every loop has initialisation, a condition, a body and an update, and getting those four right is most of what writing loops means.

## codenote
The Python sample compares a hand-written sum with loops of different sizes and prints a triangle of stars. The JavaScript sample builds the same triangle with a loop.

## code
### python
```python
print(1 + 2 + 3 + 4 + 5)

total = 0
for n in range(1, 6):
    total += n
print(total)

total = 0
for n in range(1, 1001):
    total += n
print(total)

for row in range(1, 4):
    print("*" * row)
```
Output:
```text
15
15
500500
*
**
***
```
### javascript
```javascript
let line = "";
for (let row = 1; row <= 3; row++) {
  line += "*";
  console.log(line);
}
```
Output:
```text
*
**
***
```

## quiz
1. Which part of a loop makes it move toward ending?
   - [ ] The body
   - [ ] The initialisation
   - [x] The update
   - [ ] The comment
   > Without an update that changes the state, the condition never becomes false.
2. Why is a loop better than writing the same line a thousand times?
   - [ ] It runs on different hardware
   - [x] The code is written once and works for any amount of data
   - [ ] It avoids using variables
   - [ ] It produces smaller numbers
   > Repetition scales with the data, while copied lines do not.
3. What does an off-by-one error in a loop usually mean?
   - [ ] The loop is too fast
   - [x] It repeats one time too many or too few
   - [ ] The variable is the wrong type
   - [ ] The program has no output
   > It is typically caused by a wrong start value or comparison.
4. Where should an accumulator such as a running total be initialised?
   - [ ] Inside the body on every pass
   - [x] Before the loop starts
   - [ ] After the loop
   - [ ] It needs no initial value
   > Initialising inside the body would reset the total on every pass.

# While Loops
kind: algorithm
time: O(k) where k is the number of times the condition stays true. For the digit-sum example below that is O(log n), because the number loses one digit per pass.
space: O(1) — the loop reuses a few variables, whatever the number of passes.
practice: factorial-calculation

## intro
A while loop repeats its body for as long as a condition is true. It is the right tool when you do not know in advance how many repetitions you need, such as reading until the data ends, waiting for a state to change or reducing a number until it reaches a target.

## theory
The structure is `while condition: body`. The condition is tested before every pass, including the first, so the body may run zero times. Three things must be true for a while loop to be correct:

- The state used in the condition is initialised before the loop
- The body changes that state in a way that moves it toward making the condition false
- The loop does the intended thing on the first pass, the last pass and when it runs zero times

The cost is the number of passes times the cost of one pass. A loop that halves a value runs logarithmically many times; one that decreases a counter by one runs linearly many times.

While loops often process numbers digit by digit (dividing by 10 removes the last digit), repeat a step until a measure becomes small enough, or run a procedure whose number of steps is not known until it finishes. Famous examples are the Collatz process, where an even number is halved and an odd number n becomes 3n + 1, repeating until the value reaches 1.

Python and JavaScript also allow `while True` with a `break` inside when the exit test is naturally in the middle of the body.

## explain
1. Initialise the variables that the condition depends on.
2. State the condition that must hold for another pass.
3. In the body, do the work and then change the state toward ending.
4. Check the zero-pass case: what does the loop do if the condition is false initially?
5. Trace the loop for a small input, writing down the state after each pass.
6. Ask whether any input could make the loop run forever, and guard against it.

## example
The Collatz process starting at 6 goes 6, 3, 10, 5, 16, 8, 4, 2, 1, which takes 8 passes of the loop, so the program prints 8. A second loop adds the digits of 1234 by taking the remainder when divided by 10 and then dividing by 10: the passes add 4, 3, 2 and 1 and the loop ends when the number is 0, printing 10. The JavaScript sample does the digit sum with `Math.floor`.

## real
Servers loop while they have not been asked to stop, games run while the window is open, and numeric methods iterate while the error is still above a threshold.

## pros
- Handles repetition whose length is unknown beforehand
- The condition states the stopping rule clearly
- Flexible: any test can control the loop

## cons
- Easy to forget the update and create an infinite loop
- The state is spread across the setup, condition and body
- Zero-pass and boundary cases need deliberate checking

## uses
- Processing digits of a number
- Reading input until it ends
- Iterating until a measure converges
- Running a process such as a retry until it succeeds

## mistakes
- Forgetting to change the variable used in the condition
- Changing it in the wrong direction
- Using a condition that is always true without a break
- Not initialising the state before the loop

## interview
**Q:** When is a while loop preferable to a for loop?
**A:** When the number of repetitions is not known in advance and depends on a condition that changes during the loop, such as reading until the end of input.

**Q:** Can the body of a while loop run zero times?
**A:** Yes. The condition is tested before the first pass, so if it is false initially the body never runs.

**Q:** How many times does a loop that repeatedly halves n run?
**A:** About log base 2 of n times, so it is logarithmic.

## summary
A while loop repeats while a condition holds. Initialise the state, make sure the body moves it toward ending, and check the zero-pass case.

## codenote
The Python sample counts the Collatz steps and sums digits. The JavaScript sample sums digits using integer division by flooring.

## code
### python
```python
n, steps = 6, 0
while n != 1:
    n = n // 2 if n % 2 == 0 else 3 * n + 1
    steps += 1
print(steps)

number, total = 1234, 0
while number > 0:
    total += number % 10
    number //= 10
print(total)
```
Output:
```text
8
10
```
### javascript
```javascript
let number = 1234;
let total = 0;
while (number > 0) {
  total += number % 10;
  number = Math.floor(number / 10);
}
console.log(total);
```
Output:
```text
10
```

## quiz
1. When is the condition of a while loop tested?
   - [ ] Only after the body
   - [x] Before every pass, including the first
   - [ ] Only once
   - [ ] Never
   > That is why the body may run zero times.
2. What will happen if the body never changes the variable used in the condition?
   - [ ] The loop ends immediately
   - [x] The loop may run forever
   - [ ] A syntax error occurs
   - [ ] The variable resets
   > The condition stays true if nothing moves it toward false.
3. How does dividing a number by 10 help in a digit loop?
   - [ ] It doubles the digits
   - [x] It removes the last digit so the number shrinks to zero
   - [ ] It converts it to text
   - [ ] It checks parity
   > Integer division discards the lowest digit each pass.
4. What does the Collatz example in this lesson show about while loops?
   - [ ] They only work with sums
   - [x] They suit processes whose number of steps is not known beforehand
   - [ ] They cannot contain if statements
   - [ ] They always run ten times
   > The number of steps is only found by running the loop to its end.

# Do While Loops
kind: concept
time: Not applicable — a do-while loop differs from a while loop only in when the condition is first tested. Its cost per pass is the same.
space: Not applicable — the loop variables are reused each pass.

## intro
A do-while loop runs its body first and tests the condition afterwards, so the body always executes at least once. It fits situations like showing a menu or asking for input and then deciding whether to ask again.

## theory
The structure in C, Java and JavaScript is `do { body } while (condition);`. Compare it with `while (condition) { body }`:

- while is a pre-test loop: it checks first, so the body can run zero times
- do-while is a post-test loop: it checks last, so the body runs one or more times

Python has no do-while statement. The usual translation is a `while True` loop that ends with an `if not condition: break` as the final statement of the body. The structure is equivalent, because the break test happens after the first pass.

Typical uses:

- Input validation: ask once, check the answer, ask again if it was bad
- Menus: display the menu, handle the choice, repeat until the user chooses to quit
- Retry logic: attempt the operation, check whether it succeeded, try again if not
- Processing that needs one initial step before the exit test makes sense

A common slip is placing the semicolon: in C, Java and JavaScript the do-while statement ends with `;` after the closing parenthesis. Another is declaring a variable inside the body and then using it in the condition, which is out of scope in C-family languages; declare it before the loop.

Use a do-while only when "at least once" is truly the requirement; otherwise a plain while loop is clearer.

## explain
1. Decide whether the body must run before the condition can be evaluated.
2. In C-family languages write the body, then `while (condition);`.
3. In Python write `while True:`, the body, and `if not condition: break` at the end.
4. Declare any variable used in the condition before the loop.
5. Compare with the equivalent while loop and think about the case where the condition is false from the start.
6. Test with an input that makes the condition false immediately, to see the single pass.

## example
With n equal to 10 and the condition `n < 5`, a normal while loop runs zero times, and the Python program reports "while ran 0 times". The do-while version, written as `while True` with a break at the end, executes the body once before discovering that the condition is false, so it reports one run. The JavaScript do-while increments a counter once even though `n < 5` is false from the start. The C sample, which is not run here, shows the menu pattern.

## real
Command-line menus, input prompts and network retry loops use the post-test structure because the first attempt must always happen.

## pros
- Guarantees at least one execution of the body
- Matches natural tasks like prompt-then-validate
- Avoids duplicating the first pass before a while loop

## cons
- The condition at the end is easy to overlook when reading
- Not available in Python and some other languages
- Misuse where zero passes would be correct gives wrong behavior

## uses
- Displaying a menu at least once
- Asking for input until it is valid
- Retrying an operation after the first attempt
- Reading a first record before deciding whether more follow

## mistakes
- Using do-while where zero passes should be possible
- Forgetting the semicolon after the closing parenthesis in C-family code
- Using a variable declared inside the body in the condition
- Forgetting that Python lacks the statement and writing invalid syntax

## interview
**Q:** What is the difference between while and do-while?
**A:** A while loop tests its condition before each pass and may run zero times, while a do-while loop tests after each pass, so the body always runs at least once.

**Q:** How do you write a do-while loop in Python?
**A:** Use while True with the loop body and put if not condition: break as the last statement of the body.

**Q:** Give an example where do-while is natural.
**A:** Displaying a menu: it must be shown once before the user's choice can be tested, then repeated until the user selects exit.

## summary
Do-while is a post-test loop that always runs once. Use it for prompt-and-check patterns, translate it with while True and a trailing break in Python, and use an ordinary while loop when zero passes should be possible.

## codenote
The Python sample contrasts the pre-test and post-test behavior. The JavaScript sample shows the single pass of a do-while. The C sample shows a menu loop, which is not executed here.

## code
### python
```python
n = 10

runs = 0
while n < 5:
    runs += 1
print("while ran", runs, "times")

runs = 0
while True:
    runs += 1
    if not n < 5:
        break
print("do-while style ran", runs, "time")
```
Output:
```text
while ran 0 times
do-while style ran 1 time
```
### javascript
```javascript
const n = 10;
let count = 0;
do {
  count++;
} while (n < 5);
console.log(count);
```
Output:
```text
1
```
### c
```c
#include <stdio.h>

int main(void) {
    int choice = 0;
    int shown = 0;
    do {
        shown++;
        printf("1) play  2) quit\n");
        choice = 2;
    } while (choice != 2);
    printf("menu shown %d time(s)\n", shown);
    return 0;
}
```

## quiz
1. How many times does the body of a do-while loop run if the condition is false from the start?
   - [ ] Zero
   - [x] Once
   - [ ] Twice
   - [ ] Forever
   > The condition is only tested after the first pass.
2. How is a do-while expressed in Python?
   - [ ] With a do keyword
   - [x] A while True loop that breaks at the end when the condition fails
   - [ ] With a for loop
   - [ ] It cannot be expressed
   > Python has no post-test loop statement, so the structure is emulated.
3. Which task fits a do-while loop?
   - [ ] Processing an empty list
   - [x] Showing a menu at least once
   - [ ] Counting to a known number
   - [ ] Iterating over a dictionary
   > The menu must appear before the choice can be examined.
4. What punctuation is required after the closing parenthesis of a do-while in C?
   - [ ] A colon
   - [x] A semicolon
   - [ ] A comma
   - [ ] Nothing
   > The statement ends with a semicolon.

# For Loops
kind: algorithm
time: O(n) for a loop that runs n times with constant work per pass; the cost is the number of passes multiplied by the cost of one pass.
space: O(1) — only the loop variable and a few accumulators are stored, though range in Python never builds the whole sequence in memory.
practice: sum-of-array-elements, count-even-numbers

## intro
A for loop repeats a block for each value in a sequence or for a counter that moves between a start and an end. It is the standard way to say "do this n times" or "do this for every position", and it keeps initialisation, condition and update in one place.

## theory
Two designs exist:

- The C-style counted loop `for (init; condition; update)`, used in C, Java and JavaScript. The three parts are initialisation (run once), condition (tested before each pass) and update (run after each pass).
- The iterator loop `for item in sequence`, used by Python. The loop variable takes each value of an iterable in turn, and Python generates counted sequences with `range(start, stop, step)`.

Details of Python's `range`:

- `range(n)` gives 0 up to n - 1; `range(a, b)` gives a up to b - 1 (the end is excluded); `range(a, b, s)` steps by s, and a negative step counts down
- It is lazy: it produces numbers on demand rather than building a list
- `enumerate(items, start=1)` gives index and item together, and `zip(a, b)` walks two sequences in parallel

JavaScript's classic loop uses `let i` so that each pass has its own binding; the loop variable is available after the loop only if declared with `var`.

Cost: if the body does constant work, a loop of n passes takes time proportional to n. A loop that steps by 2 still takes about n/2 passes, which is O(n).

Do not change the loop variable inside the body of a counted loop, and avoid changing the collection being iterated. Both make the behavior hard to predict.

## explain
1. Decide the first value, the last value and the step.
2. Remember the end convention: Python excludes the stop value, while a C-style condition decides it explicitly with less than or less than or equal.
3. Write the body using the loop variable.
4. Use `enumerate` when you need both position and item, instead of tracking an index by hand.
5. Trace the first and last pass.
6. Check the empty case: what happens if the range has no elements?

## example
In Python, `list(range(2, 10, 3))` gives `[2, 5, 8]` and `list(range(5, 0, -2))` gives `[5, 3, 1]`. `enumerate("abc", start=1)` produces pairs which the loop turns into the strings "1:a", "2:b" and "3:c". The sum of squares `1 + 4 + 9 + 16` equals 30, computed with a generator over `range(1, 5)`. The JavaScript loop collects the squares of 0 through 4 into an array.

## real
Image processing loops over pixels, report generators loop over rows, and simulations loop over time steps. Language designers prefer iterator-style loops because they remove the chance of an off-by-one error in the bounds.

## pros
- All loop control is visible in one place
- Iterator style removes manual index handling
- Suitable for any known or sequence-determined number of repetitions

## cons
- Off-by-one errors in bounds are common in C-style loops
- Modifying the loop variable or collection inside the body is confusing
- The end-exclusive convention surprises beginners

## uses
- Running a block a fixed number of times
- Visiting every index of a list
- Generating sequences of numbers
- Walking two collections together with zip

## mistakes
- Using less than or equal where less than was intended
- Expecting range(1, 5) to include 5
- Changing the loop variable inside the body
- Using an index loop where direct iteration over items is simpler

## interview
**Q:** What does range(2, 10, 3) produce in Python?
**A:** The numbers 2, 5 and 8: it starts at 2, steps by 3 and stops before reaching 10.

**Q:** What are the three parts of a C-style for loop?
**A:** Initialisation, which runs once; the condition, tested before each pass; and the update, run after each pass.

**Q:** What is the running time of a for loop that runs n times with constant work per pass?
**A:** Linear, or O(n), since the work grows in direct proportion to the number of passes.

## summary
A for loop expresses counted or sequence-driven repetition. Know the start, stop and step, the end convention of your language, and prefer iterating over items directly.

## codenote
The Python sample shows range with steps, enumerate and a sum of squares. The JavaScript sample uses the classic three-part loop.

## code
### python
```python
print(list(range(2, 10, 3)))
print(list(range(5, 0, -2)))

for position, letter in enumerate("abc", start=1):
    print(f"{position}:{letter}", end=" ")
print()

print(sum(i * i for i in range(1, 5)))
```
Output:
```text
[2, 5, 8]
[5, 3, 1]
1:a 2:b 3:c
30
```
### javascript
```javascript
const squares = [];
for (let i = 0; i < 5; i++) {
  squares.push(i * i);
}
console.log(squares);
```
Output:
```text
[ 0, 1, 4, 9, 16 ]
```

## quiz
1. Does range(1, 5) in Python include 5?
   - [ ] Yes
   - [x] No, it ends at 4
   - [ ] Only with a step
   - [ ] Only in a list
   > The stop value is excluded.
2. What is the purpose of enumerate in a for loop?
   - [ ] To sort the items
   - [x] To get the position and the item together
   - [ ] To delete items
   - [ ] To reverse the loop
   > It avoids managing an index variable manually.
3. In a C-style for loop, when does the update part run?
   - [ ] Before the first pass
   - [x] After each pass of the body
   - [ ] Only at the end
   - [ ] Never
   > The update runs after the body, before the next condition test.
4. What is the time complexity of a loop with n passes and constant work per pass?
   - [ ] O(1)
   - [x] O(n)
   - [ ] O(log n)
   - [ ] O(n squared)
   > The work grows proportionally to the number of passes.

# Enhanced For Each Loops
kind: concept
time: Not applicable — iterating over every item of a collection costs time proportional to its size, which is the same as an index loop. The focus here is safety and readability.
space: Not applicable — the loop holds one item at a time, but the lesson concerns how the construct behaves, not a space bound.
practice: find-minimum-element

## intro
A for-each loop visits every item of a collection without exposing an index. It reads like the intent, "for each item, do this", and removes a whole class of bounds errors, but it has its own traps, especially when the collection changes during the loop.

## theory
Syntax in common languages:

- Python: `for item in collection:` works with any iterable: lists, strings, dictionaries (keys by default), sets, files and generators
- Java: `for (String name : names)`, the enhanced for statement
- JavaScript: `for (const item of array)` iterates over values; `for (const key in object)` iterates over enumerable property names, which for an array means the index as a string
- C++: range-based `for (auto& item : items)`

Properties:

- The loop variable is a fresh name bound to each item in turn; reassigning it does not change the collection (although mutating the item object does)
- You do not get the position unless you ask: `enumerate` in Python, `entries()` in JavaScript, or an index loop
- Iterating over a list while changing it (adding or removing elements) is unsafe: removing an item shifts later items down, so the iterator skips the one after it. Java throws ConcurrentModificationException; Python silently skips elements.
- The safe approaches are to iterate over a copy, to build a new list with a comprehension or filter, or to collect changes and apply them after the loop
- For-each is not suitable when you need to modify elements in place by position, to iterate backwards, or to work with two positions at once

For dictionaries, `for key, value in d.items()` gives both, and changing the dictionary's size during iteration raises an error in Python.

## explain
1. Use for-each when you need every item once, in order, and not the position.
2. Name the loop variable after one item, such as `order` for `orders`.
3. If you need the index too, use `enumerate` or the language's equivalent.
4. Do not add or remove items from the collection you are iterating over; build a new one instead.
5. If you must change items, change their contents (for mutable objects) or write results into a new list.
6. Prefer the direct loop over an index loop unless indexes are required.

## example
In Python, removing the value 2 from `[1, 2, 2, 3]` while iterating leaves `[1, 2, 3]`: after the first 2 is removed the list shifts down, and the iterator moves on to the next position, skipping the second 2. The safe version `[n for n in nums if n != 2]` removes all occurrences. In JavaScript, `for...in` over `["a", "b"]` collects the keys `'0'` and `'1'`, while `for...of` collects the values `'a'` and `'b'`.

## real
Most business code uses for-each: sending an email to each user, validating each field, rendering each product. Bugs from removing items during iteration are common enough to be a standard interview question.

## pros
- States the intent clearly and avoids index arithmetic
- Cannot go out of bounds
- Works uniformly over lists, sets, dictionaries and streams

## cons
- No position unless requested
- Changing the collection during iteration gives wrong results or errors
- Cannot easily iterate backwards or skip ahead

## uses
- Applying an action to every element
- Accumulating totals and statistics
- Searching for the smallest or largest element
- Validating each record of a data set

## mistakes
- Removing or inserting items while looping over the same list
- Using for...in on arrays in JavaScript and getting index strings
- Assuming that reassigning the loop variable changes the list
- Using for-each when the index is actually needed

## interview
**Q:** Why is it unsafe to remove items from a list while iterating over it?
**A:** The removal shifts the remaining items, so the iterator's position now points past an item, which is then skipped, or in some languages an exception is raised.

**Q:** What is the difference between for...in and for...of in JavaScript?
**A:** for...in iterates over the enumerable property names of an object, which for arrays are index strings; for...of iterates over the values of an iterable.

**Q:** How can you get the index in a Python for-each loop?
**A:** Wrap the iterable in enumerate, which yields (index, item) pairs.

## summary
For-each loops visit every item safely and readably. Use enumerate when you need positions, avoid modifying the collection you iterate over, and know the difference between for...in and for...of in JavaScript.

## codenote
The Python sample demonstrates the skipping bug and the safe comprehension. The JavaScript sample contrasts keys and values.

## code
### python
```python
nums = [1, 2, 2, 3]
for n in nums:
    if n == 2:
        nums.remove(n)
print(nums)

nums = [1, 2, 2, 3]
print([n for n in nums if n != 2])
```
Output:
```text
[1, 2, 3]
[1, 3]
```
### javascript
```javascript
const items = ["a", "b"];

const keys = [];
for (const key in items) keys.push(key);

const values = [];
for (const value of items) values.push(value);

console.log(keys, values);
```
Output:
```text
[ '0', '1' ] [ 'a', 'b' ]
```

## quiz
1. What does for...in produce for the array ["a", "b"] in JavaScript?
   - [ ] The values a and b
   - [x] The index strings 0 and 1
   - [ ] The lengths
   - [ ] Nothing
   > for...in walks property names, and array indexes are property names.
2. Why does removing items inside a for-each loop over a Python list skip elements?
   - [ ] Python has a bug
   - [x] The list shifts down while the iterator keeps its position
   - [ ] Removal is not allowed
   - [ ] The iterator restarts
   > The next item moves into the removed item's place, which has already been passed.
3. What is the safest way to remove all occurrences of a value from a list?
   - [ ] Remove them inside a for-each loop over the same list
   - [x] Build a new list with a comprehension or filter
   - [ ] Use a while True loop
   - [ ] Sort the list first
   > A new list avoids modifying what you iterate over.
4. When is an index loop better than for-each?
   - [ ] Never
   - [x] When you need to modify elements by position or work with two positions
   - [ ] When iterating strings
   - [ ] When the list is short
   > Positions are not available in a plain for-each loop.

# Loop Invariants
kind: concept
time: Not applicable — an invariant is a statement about correctness, not a measure of time.
space: Not applicable — it describes what is true during a loop, not how much memory it uses.

## intro
A loop invariant is a statement that is true before the loop starts and after every pass, and that, combined with the exit condition, proves the loop produced the right answer. Thinking in invariants is the difference between hoping a loop works and knowing why it does.

## theory
To reason about a loop with an invariant you prove three things:

- Initialisation: the invariant is true before the first pass
- Maintenance: if the invariant is true before a pass, it is still true after that pass
- Termination: when the loop ends, the invariant together with the exit condition implies the goal. Also, the loop must actually terminate, usually by showing a quantity (the variant) that strictly decreases and is bounded.

This is mathematical induction applied to loops.

Example: computing the maximum of a list. The invariant "`best` is the maximum of the first i items" holds trivially for i = 1 with `best = values[0]`. Each pass looks at the next item and keeps the larger value, so the invariant holds for i + 1. When i reaches the length, `best` is the maximum of all items, which is the goal.

Why it matters:

- Designing: if you decide the invariant first, the body and the initialisation often follow
- Debugging: find the first pass where the invariant becomes false, and the bug is in that pass
- Explaining: invariants are how correctness of searches, sorts and graph algorithms is justified

You can check invariants at run time with assertions during development (`assert best == max(values[:i])`). They are expensive, so they are removed or disabled in production, but they are excellent during testing.

## explain
1. State what the loop should achieve when it finishes.
2. Choose a statement about the variables that is true at the start and builds toward that goal; this is the invariant.
3. Check initialisation: is it true before the first pass?
4. Check maintenance: assume it holds before a pass, show it holds after.
5. Check termination: when the condition fails, does the invariant imply the goal? Does a variant decrease?
6. Convert the invariant to an assertion and test the loop with it.

## example
The Python function `running_max` starts with `best = values[0]` and loops from the second item. At the top of each pass it asserts that `best` equals the maximum of the items seen so far, then compares the next item and keeps the larger one. After the loop it asserts that `best` equals the maximum of the whole list. For `[3, 9, 4, 9, 1]` all assertions pass and the function returns 9. The JavaScript version asserts that the running total equals the sum of the items processed so far.

## real
Compilers and verification tools can prove invariants for critical software, and programmers use them informally when designing partitioning steps, binary-style searches and other loops where an off-by-one error is easy to make.

## pros
- Gives a systematic way to prove a loop correct
- Helps design loops by working backward from the goal
- Pinpoints bugs to the pass where the invariant breaks

## cons
- Takes practice to find a useful invariant
- Run-time checks can be expensive
- Weak invariants prove nothing useful

## uses
- Proving the correctness of loops
- Designing partitioning and scanning loops
- Debugging with assertions
- Explaining algorithms in interviews

## mistakes
- Choosing an invariant that is true but too weak to imply the goal
- Forgetting to check the initial state, including the empty case
- Not showing that the loop terminates
- Leaving expensive assertions on in production code

## interview
**Q:** What is a loop invariant?
**A:** A condition that is true before the first iteration and remains true after every iteration, which together with the loop's exit condition proves that the loop achieves its goal.

**Q:** What are the three steps in proving something with a loop invariant?
**A:** Initialisation, maintenance and termination: show it holds at the start, show each pass preserves it, and show that at the end it implies the desired result.

**Q:** How can invariants help with debugging?
**A:** Assert the invariant at the top of each pass. The first pass where the assertion fails shows where the logic goes wrong.

## summary
A loop invariant is a fact preserved by every pass. Establish it before the loop, prove each pass keeps it, and show that at exit it gives the answer; use assertions to check it while testing.

## codenote
Both samples assert the invariant at the top of each pass. The Python one tracks the maximum so far, and the JavaScript one tracks the running total.

## code
### python
```python
def running_max(values):
    best = values[0]
    for i in range(1, len(values)):
        assert best == max(values[:i]), "invariant broken"
        if values[i] > best:
            best = values[i]
    assert best == max(values)
    return best

print(running_max([3, 9, 4, 9, 1]))
```
Output:
```text
9
```
### javascript
```javascript
const assert = require("assert");

const numbers = [4, 8, 15, 16];
let total = 0;
for (let i = 0; i < numbers.length; i++) {
  assert.strictEqual(total, numbers.slice(0, i).reduce((a, b) => a + b, 0));
  total += numbers[i];
}
console.log(total);
```
Output:
```text
43
```

## quiz
1. What must be true of a loop invariant before the first pass?
   - [ ] Nothing
   - [x] It must already hold
   - [ ] It must be false
   - [ ] It must equal the answer
   > Initialisation is the first step of the proof.
2. What does the maintenance step show?
   - [ ] That the loop ends
   - [x] That if the invariant holds before a pass, it holds after it
   - [ ] That the loop is fast
   - [ ] That the variable names are correct
   > It works like the induction step.
3. Why is the termination step necessary?
   - [ ] To show the invariant is long
   - [x] To show that at exit the invariant gives the goal and the loop actually stops
   - [ ] To make the loop faster
   - [ ] To remove the variables
   > A correct loop must both end and produce the right result when it does.
4. How can an invariant be used while testing?
   - [ ] By deleting it
   - [x] By turning it into an assertion checked on every pass
   - [ ] By printing it
   - [ ] By commenting out the loop
   > Assertions locate the first pass where the logic fails.

# Break and Continue
kind: concept
time: Not applicable — break and continue change how many passes a loop makes, but how much that saves depends on the data, so no general bound applies.
space: Not applicable — they control flow only, without storing anything.
practice: linear-search-position

## intro
Break and continue give you control over a loop from inside its body. Break leaves the loop at once, and continue abandons the current pass and moves to the next. Used sparingly they make loops clearer; overused they make the flow hard to follow.

## theory
Definitions:

- `break` terminates the innermost loop immediately; execution continues with the statement after the loop
- `continue` skips the rest of the current pass; a `for` loop moves to the next item, and a `while` loop re-tests its condition (so any update that is placed after the continue statement is skipped, which can cause an infinite loop)
- They affect only the innermost loop. To leave several nested loops, use a flag, put the loops in a function and `return`, or use a labelled break in JavaScript and Java

Python adds an unusual feature: a loop may have an `else` clause, which runs when the loop finishes without hitting `break`. It is the natural way to express "if nothing was found". `else` is not run after a break.

Typical patterns:

- Search: loop through items and break when one is found; use the loop's else (or a flag) for the not-found case
- Skip: continue past items that do not qualify, so the rest of the body is not nested inside an if
- Early exit on error or on a sentinel value

Guideline: break and continue are for exceptional exits and filters. If a loop has several breaks in different places, restructure it, perhaps as a function with return statements.

## explain
1. Decide whether you want to stop the loop (break) or only skip one item (continue).
2. Place the test near the top of the body so the reader sees the exit conditions first.
3. Make sure that any update a while loop needs happens before the continue.
4. For nested loops, choose a mechanism to leave the outer loop, such as return from a function or a labelled break.
5. In Python, use `for ... else` when you need a "not found" action.
6. Test the case where the break never happens, and the one where it happens at the first item.

## example
Scanning `[3, 5, 8, 11, 12]` for the first even number, the Python loop breaks on 8 and prints "first even 8". The same loop over `[1, 3, 5]` never breaks, so its else clause prints "no even". Another loop uses `continue` to skip odd numbers and collects `[0, 2, 4]` from `range(6)`. The JavaScript sample uses a labelled break to leave two nested loops as soon as the product of the counters is 6, printing `2 3`.

## real
Search functions stop at the first match, parsers skip blank lines and comments with continue, and long-running loops break when a stop flag is set.

## pros
- Early exit avoids needless work
- Continue keeps the main path unindented
- The for-else clause makes not-found handling clear

## cons
- Multiple exit points make loops harder to reason about
- Continue inside a while loop can skip the update and hang
- Only the innermost loop is affected

## uses
- Stopping a search when an item is found
- Skipping invalid or blank records
- Leaving a loop when an error occurs
- Implementing retry limits

## mistakes
- Putting the update after continue in a while loop and creating an infinite loop
- Expecting break to leave all nested loops
- Misunderstanding that else after a loop runs when there was no break
- Using many breaks where a function with returns would be clearer

## interview
**Q:** What is the difference between break and continue?
**A:** Break ends the loop entirely, while continue ends only the current iteration and goes on with the next one.

**Q:** When does the else clause of a Python loop run?
**A:** When the loop ends normally, by exhausting the iterable or the condition becoming false, and not when it is left through break.

**Q:** How do you exit two nested loops at once?
**A:** Use a flag checked by the outer loop, move the loops into a function and return, or use a labelled break in languages that have it.

## summary
Break leaves the loop, continue skips to the next pass, and a Python loop else runs only when no break happened. Use them for clear early exits and filters, and watch out for skipped updates and nested loops.

## codenote
The Python sample shows break with else, and continue. The JavaScript sample leaves nested loops with a label.

## code
### python
```python
for n in [3, 5, 8, 11, 12]:
    if n % 2 == 0:
        print("first even", n)
        break

for n in [1, 3, 5]:
    if n % 2 == 0:
        break
else:
    print("no even")

evens = []
for n in range(6):
    if n % 2:
        continue
    evens.append(n)
print(evens)
```
Output:
```text
first even 8
no even
[0, 2, 4]
```
### javascript
```javascript
outer: for (let i = 1; i <= 3; i++) {
  for (let j = 1; j <= 3; j++) {
    if (i * j === 6) {
      console.log(i, j);
      break outer;
    }
  }
}
```
Output:
```text
2 3
```

## quiz
1. What does continue do inside a for loop?
   - [ ] Ends the loop
   - [x] Skips the rest of the current pass and goes to the next item
   - [ ] Restarts the loop from the beginning
   - [ ] Exits the program
   > Only the current iteration is abandoned.
2. When does a Python for loop's else clause execute?
   - [ ] Always
   - [ ] Only after a break
   - [x] When the loop finishes without a break
   - [ ] Never
   > It signals that the search did not stop early.
3. What is a danger of continue in a while loop?
   - [ ] It deletes variables
   - [x] It may skip an update placed after it, causing an infinite loop
   - [ ] It changes the loop type
   - [ ] It exits the function
   > The condition is re-tested without the skipped update having run.
4. Which loop does break leave in nested loops?
   - [ ] All of them
   - [ ] The outermost
   - [x] The innermost one containing it
   - [ ] None
   > Leaving several loops needs an extra mechanism.

# Nested Loops
kind: algorithm
time: O(n · m) for an outer loop of n passes containing an inner loop of m passes; O(n²) when both depend on the same size n. A triangular pattern that starts the inner loop after the outer index does about n²/2 passes, which is still O(n²).
space: O(1) — only the loop counters are stored, unless the loops build a result such as a table.

## intro
A nested loop puts one loop inside another: for every pass of the outer loop, the inner loop runs completely. This is how programs walk through tables, compare pairs of items and generate combinations, and it is also where the cost of a program can suddenly become large.

## theory
Execution order: the inner loop restarts from its own beginning on each pass of the outer loop. If the outer loop runs n times and the inner loop m times, the body runs n × m times.

Common shapes:

- Rectangular: both loops cover their full range, as when visiting every cell of a grid or every pair in a multiplication table
- Triangular: the inner range depends on the outer variable, for example `for j in range(i + 1, n)`, which visits each unordered pair once and does n(n - 1)/2 passes
- Independent and dependent ranges: if the inner bound is a function of the outer variable, count the passes by summing

Cost: for n = 1000, a single loop does 1,000 passes but a nested pair does 1,000,000. Doubling n quadruples the work, which is the signature of quadratic growth. A third level gives cubic growth.

Techniques to keep nested loops under control:

- Break or return as soon as the answer is found
- Use the triangular form when pairs are unordered, to avoid duplicates and halve the work
- Replace the inner loop with a lookup in a set or dictionary, which can turn a quadratic algorithm into a linear one
- Keep the inner loop cheap and move work that does not depend on it to the outer loop

Readability: use clear names such as `row` and `column` rather than `i` and `j` mixed up, and avoid more than two or three levels.

## explain
1. Decide what the outer loop represents (rows, first item of a pair) and what the inner loop represents.
2. Write the ranges, being careful that inner ranges may depend on the outer variable.
3. Count the passes: multiply for rectangular shapes, sum for triangular ones.
4. Place work that depends only on the outer variable outside the inner loop.
5. Trace a small case, such as n = 3, completely by hand.
6. Think about whether a set or dictionary lookup could replace the inner loop.

## example
For n = 4, a full pair of loops makes 16 passes, while the triangular version where the inner loop starts at `i + 1` makes 6, which is 4 × 3 / 2. The Python code counts both and prints `16 6`. It then prints a 3 by 3 multiplication table in which row i holds i times 1, 2 and 3: 1 2 3, 2 4 6 and 3 6 9. The JavaScript sample builds the same table by assembling a row string in the inner loop.

## real
Image filters visit every pixel with nested loops, spreadsheets evaluate rows and columns, and naive duplicate detection compares every pair of records. When the data grows from thousands to millions of rows, the quadratic version can be the difference between a second and hours.

## pros
- Natural for tables, grids and pairs
- Simple to write and understand
- Can be shortened with early exits and triangular ranges

## cons
- Quadratic or worse growth of work
- More levels make the code harder to follow
- Easy to repeat work that could be moved outward

## uses
- Traversing two-dimensional data
- Comparing every pair of items
- Generating combinations and tables
- Drawing patterns of text or pixels

## mistakes
- Using the same variable name for both loops
- Letting the inner range depend on the wrong variable
- Doing loop-invariant work inside the inner loop
- Using nested loops when a lookup would give a linear algorithm

## interview
**Q:** What is the time complexity of two nested loops each running n times?
**A:** O(n squared), because the inner body executes n times for each of the n outer passes.

**Q:** How many passes does the loop for i in range(n) with the inner loop for j in range(i + 1, n) make?
**A:** n times (n minus 1) divided by 2, which visits each unordered pair exactly once.

**Q:** How can a nested loop that checks for duplicates be made faster?
**A:** Use a set to remember what has been seen, so each item needs one lookup instead of a full inner scan, giving linear time.

## summary
Nested loops multiply the work: the inner loop runs fully for every outer pass. Count the passes, use triangular ranges for pairs, move invariant work outward and consider lookups to avoid quadratic cost.

## codenote
The Python sample counts passes for the full and triangular shapes and prints a multiplication table. The JavaScript sample assembles the table as strings.

## code
### python
```python
n = 4
full = sum(1 for i in range(n) for j in range(n))
pairs = sum(1 for i in range(n) for j in range(i + 1, n))
print(full, pairs)

for i in range(1, 4):
    print(" ".join(f"{i * j:2}" for j in range(1, 4)))
```
Output:
```text
16 6
 1  2  3
 2  4  6
 3  6  9
```
### javascript
```javascript
for (let row = 1; row <= 3; row++) {
  let text = "";
  for (let column = 1; column <= 3; column++) {
    text += String(row * column).padStart(3);
  }
  console.log(text);
}
```
Output:
```text
  1  2  3
  2  4  6
  3  6  9
```

## quiz
1. How many times does the inner body run for an outer loop of 5 and an inner loop of 4 passes?
   - [ ] 9
   - [x] 20
   - [ ] 54
   - [ ] 5
   > The inner loop runs 4 times for each of the 5 outer passes.
2. What happens to the work of a nested pair of loops when n doubles?
   - [ ] It doubles
   - [x] It roughly quadruples
   - [ ] It stays the same
   - [ ] It halves
   > Quadratic growth means the work scales with the square of n.
3. What does starting the inner loop at i + 1 achieve?
   - [ ] It skips the first row
   - [x] Each unordered pair is visited once
   - [ ] It makes the loop infinite
   - [ ] It sorts the items
   > It avoids both duplicate pairs and pairing an item with itself.
4. How can a set help instead of a nested loop?
   - [ ] It sorts the items
   - [x] It lets you check membership in constant time instead of scanning
   - [ ] It deletes duplicates automatically in the loop
   - [ ] It removes the outer loop only
   > Replacing the inner scan with a lookup can make the algorithm linear.
