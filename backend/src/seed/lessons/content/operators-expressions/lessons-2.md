# Increment and Decrement
kind: concept
time: Not applicable — adding or subtracting one is a single constant-time step. The lesson concerns what value the expression produces and when the variable changes.
space: Not applicable — the operators modify one variable in place and allocate nothing of significance.

## intro
Increment and decrement operators add or subtract one from a variable. In C, Java and JavaScript they come in a prefix and a postfix form that differ in the value they return, while Python deliberately leaves them out. Mixing them into larger expressions is a classic source of confusion.

## theory
In C-family languages:

- Postfix `i++` yields the old value of i, then increases i
- Prefix `++i` increases i first, then yields the new value
- `i--` and `--i` work the same way for decrease

When used as a whole statement, `i++;` and `++i;` do the same thing. The difference only matters when the result is used, as in `a = i++`.

Python has no `++` or `--`. The tokens are legal but mean something else: `++i` is two unary plus signs applied to i, which leaves the value unchanged, and `--i` is two unary minus signs, which cancel. The correct way to count in Python is `i += 1`, and the idiomatic loop is `for i in range(n)`. The design choice keeps assignment out of expressions and avoids the ambiguity.

Related guidance from languages that have them:

- Modifying a variable twice in one expression, such as `i = i++ + ++i`, is undefined behavior in C and C++ and should never be written
- Prefer a separate statement for the increment when the surrounding expression is non-trivial
- In loops, `i++` in the update clause of a `for` is conventional

## explain
1. Decide whether you need the value before or after the change; if neither, use the plain statement form.
2. Use postfix when you want the old value, such as reading an index and then moving on.
3. Use prefix when you want the new value immediately.
4. Do not combine an increment with another use of the same variable in one expression.
5. In Python write `i += 1`, and let `range` or `enumerate` handle counting in loops.
6. If the result is confusing to read, split it into two statements.

## example
In JavaScript, start with `i = 5`. The statement `a = i++` stores 5 in a and then increases i to 6. The next statement `b = ++i` first increases i to 7 and stores 7 in b. The final output is `5 7 7`. The C sample does the same with explicit separate statements. In Python, `++i` quietly evaluates to the unchanged value 5, and only `i += 1` really adds one, giving 6.

## real
Almost every array loop in C and Java uses i++ in its update, parsers advance a position with pos++, and the famous rule that a variable should be modified only once between sequence points comes from bugs in expressions that violate it.

## pros
- Compact notation for the most common update in loops
- Prefix and postfix give control over which value is used
- Python's omission removes a source of subtle mistakes

## cons
- Using the value of an increment inside a larger expression is hard to read
- Combining several increments of one variable gives undefined results in C
- Developers moving to Python expect ++ to work and get silent no-ops

## uses
- Counting loop iterations in C, Java and JavaScript
- Advancing an index or pointer while reading a value
- Maintaining counters in event handlers
- Decrementing a remaining-attempts counter

## mistakes
- Writing ++i in Python and expecting it to increase i
- Using i = i++ and expecting the variable to change
- Modifying the same variable twice in one C expression
- Confusing the value returned by prefix and postfix forms

## interview
**Q:** What is the difference between i++ and ++i?
**A:** Both increase i by one. Postfix returns the value before the increase, prefix returns the value after it. The difference is only visible when the result of the expression is used.

**Q:** Why does ++i do nothing in Python?
**A:** Python has no increment operator. The expression is parsed as the unary plus operator applied twice, which leaves the value unchanged, so you must write i += 1.

**Q:** Why is i = i++ + ++i a problem in C?
**A:** It modifies the same variable more than once without a defined order, which is undefined behavior, so different compilers can give different results.

## summary
Increment and decrement add or subtract one, and prefix and postfix differ in the value they return. Keep them as stand-alone statements where possible, and remember that Python uses += 1 instead.

## codenote
The JavaScript sample returns old and new values with postfix and prefix. The Python sample shows the no-op of a doubled plus sign. The C sample, not run here, keeps each increment in its own statement.

## code
### python
```python
i = 5
print(++i)
print(--i)

i += 1
print(i)
```
Output:
```text
5
5
6
```
### javascript
```javascript
let i = 5;
const a = i++;
const b = ++i;
console.log(a, b, i);
```
Output:
```text
5 7 7
```
### c
```c
#include <stdio.h>

int main(void) {
    int i = 5;
    int a = i++;
    int b = ++i;
    printf("%d %d %d\n", a, b, i);
    return 0;
}
```

## quiz
1. In JavaScript with i equal to 5, what does a = i++ store in a?
   - [ ] 6
   - [x] 5
   - [ ] 4
   - [ ] undefined
   > Postfix returns the old value and then increases the variable.
2. What does the Python expression ++i do?
   - [ ] Increments i by one
   - [x] Leaves the value unchanged, since it is two unary plus signs
   - [ ] Raises a SyntaxError
   - [ ] Doubles i
   > Python has no increment operator, so use i += 1.
3. Why should you avoid modifying the same variable twice in one C expression?
   - [ ] It is slower
   - [x] The behavior is undefined because the order of modification is not specified
   - [ ] It uses more memory
   - [ ] The compiler removes both
   > Different compilers may produce different results.
4. When does the choice between prefix and postfix matter?
   - [ ] When the statement stands alone
   - [x] When the value of the expression is used
   - [ ] Only for decrement
   - [ ] Only in loops
   > A stand-alone statement discards the value, so both forms act identically.

# Ternary Conditional Operator
kind: concept
time: Not applicable — a conditional expression evaluates one condition and then one branch, which is constant work beyond the operands themselves.
space: Not applicable — it chooses between two values without allocating extra structures.

## intro
The ternary conditional operator picks one of two values depending on a condition, in a single expression. It is the compact cousin of the if/else statement for the case where all you need is a value, and used with restraint it makes code shorter and clearer.

## theory
Syntax in different languages:

- C, Java, JavaScript: `condition ? value_if_true : value_if_false`
- Python: `value_if_true if condition else value_if_false`

It is called ternary because it takes three operands: the condition and the two results. Only the chosen branch is evaluated, so the other branch can safely contain something that would fail if run, such as a division guarded by the condition.

Because it is an expression, it can appear anywhere a value can: in an assignment, a return statement, a function argument or a template string. An `if` statement is not an expression and cannot do that.

Chaining is possible: `a if c1 else b if c2 else c`. The grouping is right to left, so the first true condition wins. Beyond two levels the code is usually clearer as an if/elif ladder or a lookup table.

Good uses are choosing between simple values. Poor uses include deeply nested ternaries, branches with side effects, and cases where a statement with several actions is needed.

## explain
1. State the choice in words: "the label is adult if age is at least 18, otherwise minor".
2. Make sure the condition yields a boolean-like value and both branches yield values of compatible types.
3. Write the expression, keeping each branch short.
4. Wrap the whole expression in parentheses when it is part of a larger one.
5. If you need a third case, decide whether a second ternary is still readable; if not, use an if/elif chain.
6. Never rely on side effects in the branches.

## example
In Python, `status = "adult" if age >= 18 else "minor"` gives "adult" for age 20. A grade can be chained: for score 72, `"A" if score >= 90 else "B" if score >= 80 else "C" if score >= 70 else "F"` gives "C". The larger of 3 and 8 is `a if a > b else b`, which is 8. The JavaScript version chooses "even" or "odd" for 7 with `n % 2 === 0 ? "even" : "odd"` and a nested example labels 7 as "big" because it exceeds 5.

## real
User interfaces use it to pick a label or a style class, templates use it to show a singular or plural word, and configuration code uses it to choose a default.

## pros
- Compact and expressive for simple two-way choices
- Works wherever a value is needed, including return and argument positions
- Only the selected branch is evaluated

## cons
- Nested ternaries are hard to read
- Not suitable when each branch needs several statements
- Mixed types in the branches can produce surprising results

## uses
- Choosing a label, colour or message
- Selecting between two defaults
- Returning one of two values from a short function
- Building text such as a singular or plural form

## mistakes
- Nesting three or more ternaries in one line
- Putting side-effect calls in the branches
- Using a ternary where a plain boolean already is the answer
- Forgetting that the Python order is value, condition, alternative

## interview
**Q:** What is the ternary conditional operator?
**A:** An operator with three operands that evaluates a condition and returns one of two values. In C-family languages it is written condition ? a : b, and in Python a if condition else b.

**Q:** When is a ternary better than an if statement?
**A:** When you only need to choose a value to assign or return and both choices are short. An if statement is better for multiple actions or more than two outcomes.

**Q:** Is the unused branch of a ternary evaluated?
**A:** No. Only the branch selected by the condition runs, so the other branch can contain an expression that would fail, such as a division by a value that the condition rules out.

## summary
The ternary operator selects between two values in one expression. Use it for short, simple choices, avoid deep nesting and side effects, and switch to an if/elif ladder when a third case or more logic appears.

## codenote
The Python sample covers the basic form, a chained grade and a maximum. The JavaScript sample shows both the simple and the nested form.

## code
### python
```python
age = 20
status = "adult" if age >= 18 else "minor"
print(status)

score = 72
grade = "A" if score >= 90 else "B" if score >= 80 else "C" if score >= 70 else "F"
print(grade)

a, b = 3, 8
print(a if a > b else b)
```
Output:
```text
adult
C
8
```
### javascript
```javascript
const n = 7;
console.log(n % 2 === 0 ? "even" : "odd");
console.log(n > 5 ? "big" : n > 2 ? "medium" : "small");
```
Output:
```text
odd
big
```

## quiz
1. How many operands does the ternary conditional operator take?
   - [ ] One
   - [ ] Two
   - [x] Three
   - [ ] Four
   > It takes a condition and two possible results.
2. Which Python expression selects "adult" when age is at least 18 and "minor" otherwise?
   - [ ] age >= 18 ? "adult" : "minor"
   - [x] "adult" if age >= 18 else "minor"
   - [ ] if age >= 18: "adult" else: "minor"
   - [ ] "adult" when age >= 18 otherwise "minor"
   > Python places the value for the true case first, then the condition.
3. When should you replace a chain of ternaries with something else?
   - [ ] When there are exactly two branches
   - [x] When it becomes hard to read, usually beyond two levels
   - [ ] Never
   - [ ] Only for strings
   > An if/elif ladder or lookup table communicates multi-way choices better.
4. What is true about the branch not selected by the condition?
   - [ ] It is always evaluated first
   - [x] It is not evaluated
   - [ ] It must be a string
   - [ ] It causes an error
   > Only the chosen branch runs.

# Expression Evaluation Order
kind: concept
time: Not applicable — the order in which parts of an expression are evaluated does not change how many steps a program takes in a way that grows with input.
space: Not applicable — the lesson concerns the sequence of evaluation, not memory.

## intro
Precedence says how an expression is grouped, but it does not say which operand is evaluated first. Evaluation order matters whenever operands have side effects or modify shared variables, and languages differ sharply on whether they define it.

## theory
Two separate ideas are often mixed up:

- Precedence and associativity decide the shape of the expression tree: in `f(1) + f(2) * f(3)` the multiplication is grouped first.
- Evaluation order decides the sequence in which operands are computed: Python and JavaScript evaluate operands from left to right, so `f(1)`, `f(2)` and `f(3)` are called in that order regardless of the grouping.

Language rules:

- Python and Java define left-to-right evaluation of operands and function arguments
- JavaScript defines left-to-right order as well, so in `x + (x = 5)` the left operand is read before the assignment happens
- C and C++ leave the order of operand and argument evaluation unspecified in most cases, and modifying a variable twice between sequence points is undefined behavior; the same C code can behave differently with different compilers

In Python assignments the right-hand side is evaluated completely first, and then targets are assigned from left to right. That is why `i, l[i] = 1, 5` assigns i first and then uses the new i for the index.

The practical rule is to avoid relying on order: keep expressions free of side effects, and use separate statements when order matters.

## explain
1. Draw the expression tree using precedence to see the grouping.
2. Then decide the order of evaluating the leaves according to the language: left to right in Python and JavaScript.
3. Look for operands that change state, such as function calls that print or assignments within the expression.
4. If more than one operand has side effects, split the expression into statements.
5. In C and C++, never read and modify the same variable in one expression without a defined sequence.
6. Test with a small trace function that prints when it is called.

## example
The Python function `f(x)` prints "f" and its argument, then returns x. Evaluating `f(1) + f(2) * f(3)` prints f 1, f 2 and f 3 in that order, even though the multiplication is grouped first, and the result is 7. The tuple assignment `i, l[i] = 1, 5` with `i = 0` and `l = [0, 0]` sets i to 1 first, so the 5 is stored at index 1, giving `1 [0, 5]`. In JavaScript `x + (x = 5)` starting from x = 1 yields 1 + 5 = 6, while `(y = 5) + y` yields 5 + 5 = 10.

## real
Bugs from evaluation order appear when someone refactors an expression with function calls, and the undefined behavior in C is the reason compilers can produce different results for the same source.

## pros
- Defined left-to-right order makes Python and JavaScript predictable
- Understanding the distinction explains puzzling outputs
- Writing order-independent code makes programs portable

## cons
- C and C++ leave much of the order unspecified
- Side effects inside expressions make code hard to follow
- Tuple assignment order rules surprise newcomers

## uses
- Debugging expressions with several function calls
- Reasoning about tuple assignment and swaps
- Writing code that behaves the same on every compiler
- Reviewing expressions that mix assignment and use

## mistakes
- Confusing higher precedence with earlier evaluation
- Reading and writing a variable in the same C expression
- Passing arguments that depend on each other's side effects
- Assuming right-to-left evaluation of function arguments

## interview
**Q:** What is the difference between operator precedence and order of evaluation?
**A:** Precedence determines how operators and operands are grouped. Order of evaluation determines which operand is computed first. A multiplication can be grouped before an addition while the left operand of the addition is still evaluated first.

**Q:** Is the order of evaluating function arguments defined in C?
**A:** No, the C standard leaves it unspecified, so code that depends on it is not portable.

**Q:** In Python, what does i, l[i] = 1, 5 do when i starts at 0?
**A:** The right side is evaluated to the pair (1, 5), then the targets are assigned left to right: i becomes 1, and then l[i] refers to l[1], so index 1 receives 5.

## summary
Precedence shapes the expression, while evaluation order sequences its operands. Python and JavaScript evaluate left to right, C does not define the order, and the safest code keeps side effects out of expressions.

## codenote
The Python sample traces the order in which calls run and the tuple-assignment subtlety. The JavaScript sample shows how reading and assigning the same variable depends on which operand comes first.

## code
### python
```python
def f(x):
    print("f", x)
    return x

print(f(1) + f(2) * f(3))

i = 0
l = [0, 0]
i, l[i] = 1, 5
print(i, l)
```
Output:
```text
f 1
f 2
f 3
7
1 [0, 5]
```
### javascript
```javascript
let x = 1;
const r = x + (x = 5);
console.log(r, x);

let y = 1;
const q = (y = 5) + y;
console.log(q);
```
Output:
```text
6 5
10
```

## quiz
1. In Python, which call in f(1) + f(2) * f(3) runs first?
   - [ ] f(3), because multiplication has higher precedence
   - [x] f(1), because operands are evaluated left to right
   - [ ] f(2)
   - [ ] They run at the same time
   > Precedence affects grouping, not the sequence of operand evaluation.
2. What does the C standard say about the order of evaluating function arguments?
   - [ ] They are evaluated right to left
   - [ ] They are evaluated left to right
   - [x] The order is unspecified
   - [ ] They are evaluated in parallel
   > Code that depends on a particular order is not portable.
3. In JavaScript, what is x + (x = 5) when x starts as 1?
   - [ ] 10
   - [x] 6
   - [ ] 2
   - [ ] 5
   > The left operand is read as 1 before the assignment changes x to 5.
4. What is the safest way to deal with expressions that have several side effects?
   - [ ] Rely on the compiler
   - [x] Split them into separate statements
   - [ ] Add more parentheses only
   - [ ] Use shorter variable names
   > Separate statements make the order explicit.

# Overflow and Underflow
kind: concept
time: Not applicable — overflow and underflow are properties of how numbers are represented, not of how long an algorithm runs.
space: Not applicable — they come from the fixed number of bits in a type, not from the amount of memory a program consumes.

## intro
Overflow happens when a calculation produces a number too large for its type, and underflow when it is too small or too close to zero to represent. They are quiet in many languages: no error appears, and the program carries on with a wrong value.

## theory
For integers:

- A fixed-width signed integer with n bits holds values from -2^(n-1) to 2^(n-1) - 1; for 32 bits that is -2147483648 to 2147483647
- Overflow wraps around in languages that define it (Java, and unsigned types in C), so the maximum value plus one becomes the minimum. For signed integers in C and C++ it is undefined behavior.
- Python integers never overflow because they grow as needed, but code that mimics fixed-width arithmetic must wrap explicitly with a mask
- JavaScript bitwise operators convert numbers to 32-bit integers, so `2 ** 31 | 0` is -2147483648, and `Math.imul(65536, 65536)` is 0 because the product 2^32 wraps to zero

For floating point:

- Overflow produces infinity: `1e308 * 10` is `inf` in Python and Infinity in JavaScript
- Underflow: results smaller than the tiniest representable value round to zero. Between zero and the smallest normal number, precision drops gradually (denormal numbers).
- Both can silently destroy a computation, and not-a-number can follow from infinity minus infinity

Unsigned wrap-around is well defined in C: an `unsigned char` holding 255 becomes 0 after adding 1.

## explain
1. Find the range of the type: its width and whether it is signed.
2. Estimate the largest intermediate result of your calculation, not just the final one.
3. Choose a wider type, or a big-integer type, if the range is not enough.
4. Check before the operation when overflow would be catastrophic, for example verify that a + b will not exceed the maximum.
5. For floats, rescale the data or work with logarithms when values become extremely large or small.
6. Test with extreme values: the maximum, the minimum and values just beyond them.

## example
The Python function `to_int32` masks a number to 32 bits and converts values of at least 2^31 to negative numbers. Applying it to 2147483647 + 1 gives -2147483648, and applying it to -2147483648 - 1 gives 2147483647, showing the wrap in both directions. Multiplying 1e308 by 10 gives inf, while dividing the tiny 1e-320 by 1e10 gives 0.0. In JavaScript the same wrap appears with `2 ** 31 | 0` and `Math.imul(65536, 65536)`, and `Number.MAX_VALUE * 2` is Infinity.

## real
Overflow bugs have grounded rockets, corrupted bank balances and created security vulnerabilities when an attacker supplies a length that wraps to a small number, so many secure coding standards require explicit range checks.

## pros
- Fixed-width types are fast and predictable
- Wrap-around is useful for hashing and checksums
- Infinity and zero give floating point a graceful, if lossy, failure mode

## cons
- Silent wrap-around gives wrong answers without any error
- Signed overflow in C is undefined behavior
- Underflow to zero can hide tiny but important values

## uses
- Choosing the integer width for counters and sizes
- Writing checksums and hash functions that rely on wrap-around
- Validating sizes before allocating memory
- Detecting infinity and zero results in numerical code

## mistakes
- Multiplying two large 32-bit numbers without widening first
- Adding without checking against the maximum value
- Assuming signed overflow in C simply wraps
- Ignoring infinity results in floating-point calculations

## interview
**Q:** What is integer overflow?
**A:** It occurs when the result of an operation cannot be represented in the type, for example adding one to the largest 32-bit signed integer. The result may wrap around, saturate or be undefined, depending on the language.

**Q:** Why does Python not have integer overflow?
**A:** Its integers have arbitrary precision and grow as needed, limited only by available memory, so arithmetic never wraps.

**Q:** What is floating-point underflow?
**A:** A result so close to zero that it cannot be represented as a normal number. It becomes a denormal number with reduced precision or rounds to zero.

## summary
Fixed-size numbers have a range, and results beyond it wrap, become undefined or turn into infinity. Estimate intermediate sizes, check before risky operations, choose wider types when needed and test the extremes.

## codenote
The Python sample simulates 32-bit wrap-around and shows float overflow and underflow. The JavaScript sample shows the 32-bit conversion in bitwise operators, wrapped multiplication and float overflow. The C sample is not executed here and shows unsigned wrap-around.

## code
### python
```python
def to_int32(n):
    n &= 0xFFFFFFFF
    return n - (1 << 32) if n >= (1 << 31) else n

print(to_int32(2147483647 + 1))
print(to_int32(-2147483648 - 1))
print(1e308 * 10, 1e-320 / 1e10)
```
Output:
```text
-2147483648
2147483647
inf 0.0
```
### javascript
```javascript
console.log(2 ** 31 | 0);
console.log(Math.imul(65536, 65536));
console.log(Number.MAX_VALUE * 2, 5e-324 / 2);
```
Output:
```text
-2147483648
0
Infinity 0
```
### c
```c
#include <stdio.h>

int main(void) {
    unsigned char c = 255;
    c = c + 1;
    printf("%d\n", c);
    return 0;
}
```

## quiz
1. What is the largest value of a 32-bit signed integer?
   - [ ] 65535
   - [ ] 2147483648
   - [x] 2147483647
   - [ ] 4294967295
   > It is 2 to the power 31 minus 1.
2. What happens to a Java int that holds its maximum value when you add 1?
   - [ ] An exception is thrown
   - [x] It wraps around to the minimum value
   - [ ] It becomes a long
   - [ ] It stays the same
   > Java defines signed integer arithmetic as two's complement wrap-around.
3. What does 1e308 * 10 produce in Python?
   - [ ] An OverflowError
   - [ ] 1e309
   - [x] inf
   - [ ] 0.0
   > Floating-point overflow gives infinity rather than an error.
4. Why do Python integers not overflow?
   - [ ] They are always small
   - [x] They are arbitrary precision and grow as needed
   - [ ] Python checks every sum
   - [ ] They are stored as floats
   > Memory is the only limit on their size.

# Writing Safe Expressions
kind: concept
time: Not applicable — writing safe expressions is a matter of correctness and readability rather than complexity.
space: Not applicable — safe expressions concern which values are valid, not how many are stored.

## intro
A safe expression produces a correct result for every input it can receive, not just the typical one. Writing them means anticipating zero, empty, missing and extreme values, and arranging the code so that a mistake cannot slip through unnoticed.

## theory
Habits that make expressions safe:

- Guard against invalid operands before using them: check for a zero divisor, an empty list, a missing key or a null reference
- Make the grouping explicit with parentheses so the reader and the compiler agree
- Keep expressions free of side effects, so the order of evaluation does not matter
- Split long expressions into named intermediate variables, which both document the steps and make debugging easier
- Compare floating-point numbers with a tolerance, never exact equality
- Prefer conditional expressions to the and/or trick for choosing values, because `flag and 0 or 99` returns 99 even when flag is true, as 0 is falsy
- Validate ranges: percentages between 0 and 100, indexes within bounds
- Use library functions designed for the job, such as `statistics.mean` or `math.isclose`, instead of reinventing them

A safe default for an undefined result, such as an average of nothing, should be a deliberate choice, either an explicit error or a documented value like 0.

## explain
1. List the ways each operand could be invalid: zero, negative, empty, missing, wrong type, very large.
2. Decide what the expression should do for each: return a default, raise an error or skip.
3. Add the guard before the risky operation, using short-circuit evaluation or an explicit condition.
4. Name intermediate results, such as `part_ratio`, so the formula reads step by step.
5. Test the boundary and invalid inputs together with the normal ones.
6. Document the assumptions in a comment or a docstring.

## example
The Python function `average` returns `sum(values) / len(values)` only when the list is not empty, and 0.0 otherwise, so `average([2, 4, 6])` is 4.0 and `average([])` is 0.0 instead of a ZeroDivisionError. `percent` guards a zero denominator and rounds to one decimal place, giving 33.3 for 1 of 3 and 0.0 for 5 of 0. The and/or trap `flag and 0 or 99` returns 99 although flag is True, whereas `0 if flag else 99` correctly gives 0. In JavaScript, comparing 0.1 + 0.2 with 0.3 using strict equality is false but comparing the difference with Number.EPSILON is true.

## real
Financial reports, dashboards and scientific code all divide, average and convert, and each of those operations must survive empty or missing data. A report that crashes on the first empty day is a very common first production bug.

## pros
- Guards turn crashes into controlled behavior
- Named intermediates make complicated formulas understandable
- Using tested library functions reduces mistakes

## cons
- Defensive checks add lines and can clutter simple code
- Choosing the right default for invalid input is a design decision
- Over-guarding can hide real errors that should be reported

## uses
- Computing averages and percentages over data that may be empty
- Dividing by user-provided or computed values
- Validating ranges before indexing or converting
- Comparing floating-point results

## mistakes
- Dividing without checking for zero
- Using the and/or trick when a legitimate value is falsy
- Returning a default that silently hides a data problem
- Packing a long formula into one line with no names

## interview
**Q:** How do you make an average calculation safe?
**A:** Check for an empty collection before dividing, and decide explicitly whether to return a default or raise an error. Using a library function such as statistics.mean also gives a defined behavior.

**Q:** Why is the and/or trick for conditional values dangerous?
**A:** Because it returns the third operand whenever the middle one is falsy, even if the condition is true. A proper conditional expression handles this correctly.

**Q:** What is a good way to simplify a long arithmetic expression?
**A:** Break it into steps with descriptive intermediate variable names, so each line does one thing and can be checked independently.

## summary
Write expressions that stay correct for every possible input: guard operands, group explicitly, avoid side effects, name intermediate steps and choose deliberate defaults. Test the awkward cases first.

## codenote
The Python sample guards a division, handles a zero denominator and contrasts the and/or trap with a conditional expression. The JavaScript sample compares floating-point numbers with a tolerance.

## code
### python
```python
def average(values):
    return sum(values) / len(values) if values else 0.0

def percent(part, whole):
    return 0.0 if whole == 0 else round(part / whole * 100, 1)

print(average([2, 4, 6]), average([]))
print(percent(1, 3), percent(5, 0))

flag = True
print(flag and 0 or 99)
print(0 if flag else 99)
```
Output:
```text
4.0 0.0
33.3 0.0
99
0
```
### javascript
```javascript
console.log(0.1 + 0.2 === 0.3);
console.log(Math.abs(0.1 + 0.2 - 0.3) < Number.EPSILON);
```
Output:
```text
false
true
```

## quiz
1. How can you make an average of a list safe when the list may be empty?
   - [ ] Divide anyway and hope
   - [x] Check for an empty list first and return a defined result or raise a clear error
   - [ ] Add one to the length
   - [ ] Sort the list
   > Dividing by a length of zero would raise an error or give a meaningless value.
2. What does the expression flag and 0 or 99 return when flag is True in Python?
   - [ ] 0
   - [x] 99
   - [ ] True
   - [ ] An error
   > The middle operand 0 is falsy, so the or falls through to 99.
3. Why name intermediate results in a long formula?
   - [ ] Variables run faster than expressions
   - [x] Each step becomes readable and can be checked on its own
   - [ ] It avoids all errors
   - [ ] It reduces memory
   > Names document the meaning of each step and simplify debugging.
4. What is the safest way to compare two computed floating-point numbers?
   - [ ] With the strict equality operator
   - [x] By testing that their difference is smaller than a tolerance
   - [ ] By converting them to strings
   - [ ] By adding them together
   > Rounding error makes exact equality unreliable.

# Numeric Precision and Rounding
kind: concept
time: Not applicable — rounding a number is a constant-time operation. The topic is how many digits can be trusted and which rounding rule applies.
space: Not applicable — it concerns the accuracy of stored values rather than the amount of memory used.

## intro
Computers store most decimal numbers approximately, so the number you see after rounding is not always the number you expect. Choosing a rounding rule on purpose, and using exact types where cents matter, keeps reports, invoices and measurements trustworthy.

## theory
Precision has limits at every level:

- Binary floating point (a 64-bit double) keeps about 15 to 17 significant decimal digits. A value like 2.675 is stored as the nearest binary fraction, which is slightly below 2.675, so rounding it to two decimals gives 2.67 and not the 2.68 that a human expects.
- Rounding modes differ: round half up (2.5 becomes 3), round half to even or "banker's rounding" (2.5 becomes 2 and 3.5 becomes 4), round toward zero, floor and ceiling. Python's `round` uses half to even; JavaScript's `Math.round` rounds halves toward positive infinity.
- Formatting is not the same as calculating: `f"{x:.2f}"` and `toFixed(2)` produce text and apply the same representation issue
- Exact alternatives: the `decimal` module, with `quantize` and an explicit rounding mode, and `fractions.Fraction` for exact ratios

Accumulating many small additions also drifts: ten additions of 0.1 do not sum to exactly 1.0.

Rules of thumb: keep full precision during a calculation and round once at the end, round with an explicit rule, and store money as integers or decimals.

## explain
1. Decide how many decimal places the result needs and which rounding rule the business expects.
2. Choose the number type: a decimal type or integer cents for money, floating point for measurements.
3. Calculate with full precision and round only the final result.
4. Use the rounding function that implements your rule; do not assume the default is half up.
5. Test the tie cases such as x.5 and x.005 explicitly.
6. When displaying, format the number; when storing, keep the precise value.

## example
In Python `round(2.675, 2)` and `f"{2.675:.2f}"` both give 2.67 because the stored value is a hair below 2.675, while `Decimal("2.675").quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)` gives 2.68. Adding 0.1 to a float total ten times does not reach exactly 1.0, but ten Decimal 0.1 values equal 1 exactly, and `Fraction(1, 3) + Fraction(1, 6)` gives exactly 1/2. The JavaScript sample shows `(1.005).toFixed(2)` giving "1.00" and a manual `Math.round(1.005 * 100) / 100` giving 1, then the epsilon adjustment that gives 1.01.

## real
Tax calculations, invoices and interest accrual specify the exact rounding rule in law or contract, and a mismatch of one cent multiplied by millions of transactions becomes a reconciliation problem.

## pros
- Explicit rounding rules make results reproducible
- Decimal types match human expectations for money
- Rounding once at the end limits accumulated error

## cons
- Decimal arithmetic is slower than binary floating point
- Different rounding rules give different results for ties
- Formatting functions can hide the underlying approximation

## uses
- Computing prices, taxes and interest
- Displaying measurements to a fixed number of decimals
- Producing reports that must agree to the cent
- Comparing computed values in tests with a tolerance

## mistakes
- Rounding at every intermediate step instead of once at the end
- Assuming round() always rounds halves up
- Trusting toFixed or format output as if it were exact
- Using binary floats for currency

## interview
**Q:** Why does round(2.675, 2) give 2.67 in Python?
**A:** The float 2.675 cannot be represented exactly and is stored slightly below 2.675, so rounding to two places gives 2.67. A Decimal built from the string "2.675" can be rounded half up to 2.68.

**Q:** What is banker's rounding?
**A:** Round half to even: a value exactly halfway between two integers goes to the even one, so 2.5 becomes 2 and 3.5 becomes 4. It reduces bias when many values are rounded.

**Q:** How should currency be handled in a program?
**A:** Store amounts as integers in the smallest unit or in a decimal type, apply a documented rounding rule at defined points, and only convert to text for display.

## summary
Floating point is approximate, so rounding results may surprise. Use decimal or integer types for money, state your rounding rule, round once at the end and test the tie cases.

## codenote
The Python sample compares float and Decimal rounding, accumulated sums and exact fractions. The JavaScript sample shows the toFixed pitfall and a common adjustment.

## code
### python
```python
from decimal import Decimal, ROUND_HALF_UP
from fractions import Fraction

print(round(2.675, 2), f"{2.675:.2f}")
print(Decimal("2.675").quantize(Decimal("0.01"), rounding=ROUND_HALF_UP))
print(Fraction(1, 3) + Fraction(1, 6))
total = 0.0
for _ in range(10):
    total += 0.1
print(total == 1.0, sum([Decimal("0.1")] * 10) == 1)
```
Output:
```text
2.67 2.67
2.68
1/2
False True
```
### javascript
```javascript
console.log((1.005).toFixed(2), Math.round(1.005 * 100) / 100);
console.log(Math.round((1.005 + Number.EPSILON) * 100) / 100);
```
Output:
```text
1.00 1
1.01
```

## quiz
1. Why does round(2.675, 2) give 2.67 in Python?
   - [ ] Python rounds all halves down
   - [x] The float is stored slightly below 2.675
   - [ ] The function has a bug
   - [ ] Rounding is random
   > Binary floating point cannot represent 2.675 exactly.
2. What does round half to even do with 2.5?
   - [ ] Gives 3
   - [x] Gives 2
   - [ ] Gives 2.5
   - [ ] Raises an error
   > Ties go to the nearest even integer, which reduces bias over many values.
3. When should you round in a multi-step calculation?
   - [ ] After every step
   - [x] Once, at the end
   - [ ] Never
   - [ ] Only at the beginning
   > Intermediate rounding accumulates error.
4. Which type is the better choice for storing prices?
   - [ ] float
   - [x] Decimal or integer cents
   - [ ] bool
   - [ ] set
   > Exact decimal representations avoid binary rounding surprises.
