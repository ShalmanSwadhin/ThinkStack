# Type Coercion Overview
kind: concept
time: Not applicable — converting a value from one type to another is a single small operation. What matters is predictability: knowing which conversions happen and which are refused.
space: Not applicable — a conversion usually creates a new value of the target type, but the cost is a detail of the language rather than an algorithmic result.

## intro
Type coercion is changing a value from one type to another, either because you asked for it or because the language did it for you. Languages disagree about how willing they are to convert, and that difference is behind many surprising results.

## theory
There are two kinds of conversion:

- Explicit conversion (casting) — you ask for it: `int("42")`, `str(7)`, `float("3.5")`, `Number("12")`. The intent is visible in the code.
- Implicit coercion — the language converts automatically to make an operation work, such as adding a number to a string in JavaScript.

Languages sit at different points on this scale:

- Python is strongly typed: it refuses most implicit conversions between unrelated types, so `"5" + 3` raises a TypeError. The exception is numeric widening, where an int mixed with a float becomes a float.
- JavaScript is loosely typed: `"5" + 3` gives the string `"53"` because + prefers concatenation, while `"5" - 3` gives the number 2 because - only works on numbers.
- C converts between numeric types silently, truncating a double to an int when assigned.

Conversions can lose information (`int(3.9)` is 3) or fail (`int("abc")` raises ValueError in Python and `Number("abc")` gives the special not-a-number value in JavaScript). Truthiness is another implicit conversion: empty strings, zero and empty collections count as false in conditions.

## explain
1. Decide what type each value should be before you combine values. Input from users and files arrives as text.
2. Convert at the boundary: turn text into numbers once, right after reading it, and keep the rest of the program in proper types.
3. Prefer explicit conversion so a reader can see where the type changes.
4. Handle failure: wrap the conversion in a check or try block, because bad text is normal input.
5. In JavaScript compare with === so no coercion happens, and be careful with + when one side may be a string.
6. Remember that narrowing conversions discard data: int(3.9) drops the fraction rather than rounding it.

## example
In Python, `int("42") + 1` gives 43 because the text was converted on purpose, while `"5" + 3` raises a TypeError and `int(3.9)` yields 3. In JavaScript the same-looking expressions behave differently: `"5" + 3` is "53", `"5" - 3` is 2, `0 == ""` is true because both sides are coerced, and `0 === ""` is false because the types differ. The samples print each of these results.

## real
Form fields, URL parameters and environment variables arrive as strings, so almost every program converts them to numbers before using them, and many real bugs come from adding a quantity that is still text.

## pros
- Explicit conversion states clearly where the type changes
- Strict languages catch type mix-ups early with an error
- Implicit coercion can make short scripts convenient to write

## cons
- Implicit coercion produces surprising results that are hard to spot
- Narrowing conversions silently lose information
- Rules differ between languages, so intuition does not transfer

## uses
- Converting user input from text to numbers
- Formatting numbers as text for display
- Parsing values read from files, configuration or network requests
- Comparing values safely, for example with === in JavaScript

## mistakes
- Adding numbers that are still strings and getting concatenation instead of a sum
- Assuming int() rounds a decimal when it actually truncates
- Using == in JavaScript and being fooled by coercion
- Converting user text without handling the case where it is not a number

## interview
**Q:** What is the difference between implicit and explicit type conversion?
**A:** Explicit conversion is requested in the code, such as int("42"). Implicit conversion is done automatically by the language to make an operation work, such as JavaScript turning a number into a string for +.

**Q:** Why does "5" + 3 behave differently in Python and JavaScript?
**A:** Python is strongly typed and raises a TypeError because it will not guess. JavaScript coerces the number to a string and concatenates, producing "53".

**Q:** What is the difference between == and === in JavaScript?
**A:** The double equals compares after coercing the operands to a common type, while the triple equals compares value and type with no coercion, so it is the safer choice.

## summary
Convert types deliberately and at the edges of your program. Know whether your language refuses mixed-type operations, as Python does, or coerces them, as JavaScript does, and handle values that cannot be converted.

## codenote
The Python sample shows an explicit conversion succeeding, an implicit one being refused, and a narrowing conversion truncating. The JavaScript sample shows coercion in action and how === avoids it.

## code
### python
```python
print(int("42") + 1)

try:
    print("5" + 3)
except TypeError as error:
    print("TypeError:", error)

print(int(3.9))
print(bool(""), bool("0"), bool([]))
```
Output:
```text
43
TypeError: can only concatenate str (not "int") to str
3
False True False
```
### javascript
```javascript
console.log("5" + 3);
console.log("5" - 3);
console.log(0 == "");
console.log(0 === "");
console.log(Number("abc"));
```
Output:
```text
53
2
true
false
NaN
```

## quiz
1. What does "5" + 3 produce in JavaScript?
   - [ ] 8
   - [x] The string 53
   - [ ] An error
   - [ ] The number 2
   > The + operator prefers string concatenation, so the number 3 is converted to text.
2. What does int(3.9) return in Python?
   - [ ] 4
   - [x] 3
   - [ ] 3.9
   - [ ] An error
   > int() truncates toward zero; it does not round.
3. Why is user input usually converted right after it is read?
   - [ ] Input is always an integer
   - [x] It arrives as text, so numeric work would otherwise concatenate or fail
   - [ ] Conversion makes the program shorter
   - [ ] Text cannot be printed
   > Reading from a user, file or network gives strings, and converting once at the boundary keeps the rest of the code in correct types.
4. Which comparison avoids type coercion in JavaScript?
   - [ ] The double equals operator
   - [x] The triple equals operator
   - [ ] The assignment operator
   - [ ] The plus operator
   > Strict equality compares both value and type without converting either side.

# Standard Input Output Flow
kind: concept
time: Not applicable — input and output describe how a program talks to the outside world. Reading and writing is usually far slower than computation, but this is a design consideration and not a Big-O result.
space: Not applicable — streams are consumed piece by piece, so memory depends on how much you choose to keep.

## intro
Every program receives data from somewhere and sends results somewhere. Standard input, standard output and standard error are the three default channels that make this possible, and they are what allow small programs to be chained together.

## theory
The operating system gives each running program three streams:

- Standard input (stdin) — where the program reads data from; by default the keyboard, but it can be a file or the output of another program
- Standard output (stdout) — where normal results are written; by default the terminal
- Standard error (stderr) — a separate stream for error and diagnostic messages

Because they are streams, they can be redirected without changing the program: `python app.py < data.txt > result.txt` reads from a file and writes to a file. A pipe connects one program's output to another's input.

In Python, `input()` reads one line from stdin and returns it as text without the newline; `print()` writes to stdout and adds a newline unless you set `end`. `sys.stdin`, `sys.stdout` and `sys.stderr` give direct access. In JavaScript running on Node, `console.log` writes to stdout, `console.error` to stderr and `process.stdout.write` writes without adding a newline.

Everything read is text. A number has to be converted, and reading past the end of the input is an error (EOFError in Python).

## explain
1. Decide what the program reads and in what format, for example a name on the first line and a count on the second.
2. Read each piece, one line at a time, and convert text to the type you need.
3. Compute the result.
4. Write the result with print or a write call, choosing the separator and line ending deliberately.
5. Send diagnostics to stderr so they do not mix into data that another program may read from stdout.
6. Test with redirected input so the program can be run without typing every time.

## example
The Python sample replaces standard input with a two-line text so it runs the same everywhere. It reads the name "Ada", converts the second line to the number 3, and prints a greeting that uses both. It then shows the sep and end options of print, which control how items are joined and what ends the line. The JavaScript sample uses process.stdout.write to print on one line in two pieces.

## real
Command-line tools such as search utilities and data converters work by reading stdin and writing stdout, which is why they can be combined in a pipeline, and online judges feed test cases through stdin and compare stdout with the expected text.

## pros
- Redirection and pipes let one program be reused in many setups
- A separate error stream keeps diagnostics out of real output
- Text streams are simple and work the same in every language

## cons
- All data arrives as text and must be converted and validated
- Interactive prompts make programs awkward to automate
- Mixing diagnostics into stdout corrupts output that another program reads

## uses
- Building command-line tools that can be chained in pipelines
- Reading test input and producing exact output in programming exercises
- Logging errors separately from results
- Running a program on a file of data instead of typing it

## mistakes
- Forgetting that input() returns text and adding numbers as strings
- Printing debug messages to stdout and breaking the expected output
- Leaving an unwanted trailing newline or space in output
- Reading more lines than the input provides

## interview
**Q:** What are stdin, stdout and stderr?
**A:** They are the three standard streams of a process: input the program reads, normal output it writes, and a separate stream for error messages.

**Q:** Why is it useful to have a separate stderr?
**A:** It lets error messages appear on screen or in a log without being mixed into the output that is redirected to a file or piped to another program.

**Q:** What does input() return in Python and how do you read a number?
**A:** It returns one line as a string without the trailing newline. To read a number, wrap it in a conversion such as int(input()).

## summary
Programs read from stdin, write results to stdout and report problems on stderr. Everything read is text, so convert it, and keep the streams separate so programs can be redirected and chained.

## codenote
The Python sample assigns an in-memory text to sys.stdin so it can demonstrate input() without a keyboard. print is used with sep and end to control formatting. The JavaScript sample builds one line with process.stdout.write.

## code
### python
```python
import io
import sys

sys.stdin = io.StringIO("Ada\n3\n")

name = input()
count = int(input())
print("Hello", name + ",", "you have", count, "items")
print("a", "b", "c", sep="-", end="!\n")
```
Output:
```text
Hello Ada, you have 3 items
a-b-c!
```
### javascript
```javascript
process.stdout.write("Hello ");
process.stdout.write("Ada");
process.stdout.write("\n");

const [a, b] = "3 4".split(" ").map(Number);
console.log(a + b);
```
Output:
```text
Hello Ada
7
```

## quiz
1. Which stream should error messages be written to?
   - [ ] Standard input
   - [ ] Standard output
   - [x] Standard error
   - [ ] The keyboard buffer
   > A separate error stream keeps diagnostics from mixing with real output.
2. What type does Python's input() return?
   - [ ] int
   - [x] str
   - [ ] float
   - [ ] list
   > input() always returns text, so numbers must be converted explicitly.
3. What does redirecting standard input from a file do?
   - [ ] Deletes the file
   - [x] Makes the program read the file's contents as if they were typed
   - [ ] Compiles the program
   - [ ] Prints the file in colour
   > Redirection changes where the stream comes from without changing the program.
4. How do you stop print from adding a newline in Python?
   - [ ] print(text, stop=True)
   - [ ] print(text, newline=False)
   - [x] print(text, end="")
   - [ ] print(text, sep="")
   > The end argument sets what is written after the text; an empty string adds nothing.

# Building a First Program
kind: concept
time: Not applicable — this lesson is about assembling a small complete program, not about an algorithm's running time.
space: Not applicable — a tiny program's memory use is not the point; the skill is organising input, logic and output.

## intro
Writing a first complete program means combining everything so far: a plan, variables, input, a calculation, output, and a function or two. The aim is a small program that works from start to finish and is easy to read.

## theory
A well-organised small program has the same shape in nearly every language:

- Input — gather the values the program needs, from the user, a file or constants
- Processing — apply the rules or calculations, ideally inside functions with clear names
- Output — present the result in a readable form

Useful habits from the start:

- Write the plan first, in plain words or pseudocode
- Keep calculations in functions that take inputs and return results, so they can be tested without printing
- Put the "run it" code in one place: a `main()` function, and in Python an `if __name__ == "__main__":` guard so the file can also be imported safely
- Start small, run often, and add one feature at a time
- Use named constants and formatted output so results are clear

## explain
1. State the problem in one sentence: given a bill and a tip percentage, show the tip and the total.
2. List the inputs (bill, percentage), the rule (tip = bill times percentage divided by 100) and the outputs (tip, total).
3. Write the calculation as a function and check it with a known value.
4. Write main() to set up the inputs, call the function and print the results.
5. Run it, compare with a hand calculation, then handle edge cases such as zero.
6. Tidy names and comments and run it once more.

## example
A tip calculator. A bill of 48.50 with an 18 percent tip gives a tip of 8.73, since 48.50 times 18 is 873 and dividing by 100 gives 8.73. The total is 57.23. The sample puts the rule in `tip_amount`, builds the report in `main`, and formats money with two decimal places. Because the calculation is a separate function, it can be checked without any printing.

## real
Every application grows from a small program like this: a calculation function that other code can reuse, a main entry point that wires it up, and formatted output for the user.

## pros
- Separating input, processing and output makes each part easy to test
- A main function gives the program a clear start
- Building in small steps catches mistakes early

## cons
- Planning feels slow when the program seems trivial
- Over-structuring a tiny script can add needless ceremony
- Formatting and edge cases take as long as the core formula

## uses
- Writing small utilities and calculators
- Practising problem decomposition on real tasks
- Creating a portfolio of working examples
- Learning how functions, input and output fit together

## mistakes
- Writing everything at the top level in one long block
- Mixing calculation and printing so nothing can be tested alone
- Not checking the result against a hand calculation
- Printing floating-point numbers without formatting

## interview
**Q:** How would you structure a small command-line program?
**A:** Separate input handling, a pure calculation function and output formatting, then call them from a main function so each part is easy to read and test.

**Q:** What does the main-module guard at the bottom of a Python file do?
**A:** It runs the enclosed code only when the file is executed directly, not when it is imported as a module, so the functions can be reused without side effects.

**Q:** How do you know a first program is correct?
**A:** Work out the expected answer by hand for a few inputs, including edge cases, and compare it with what the program prints.

## summary
A first program takes input, processes it in well-named functions and produces formatted output, all started from a main function. Build it in small steps and verify each result by hand.

## codenote
tip_amount holds the rule and returns a number. main supplies the inputs, calls the function and prints formatted results. The guard makes the Python file runnable directly; the JavaScript version calls main at the end.

## code
### python
```python
def tip_amount(bill, percent):
    return round(bill * percent / 100, 2)

def main():
    bill = 48.50
    percent = 18
    tip = tip_amount(bill, percent)
    print(f"Bill:  {bill:.2f}")
    print(f"Tip:   {tip:.2f}")
    print(f"Total: {bill + tip:.2f}")

if __name__ == "__main__":
    main()
```
Output:
```text
Bill:  48.50
Tip:   8.73
Total: 57.23
```
### javascript
```javascript
function tipAmount(bill, percent) {
  return Math.round(bill * percent) / 100;
}

function main() {
  const bill = 48.5;
  const tip = tipAmount(bill, 18);
  console.log("Tip:   " + tip.toFixed(2));
  console.log("Total: " + (bill + tip).toFixed(2));
}

main();
```
Output:
```text
Tip:   8.73
Total: 57.23
```

## quiz
1. Why put the tip calculation in its own function?
   - [ ] Functions run faster than top-level code
   - [x] It can be tested and reused without any printing
   - [ ] Python requires it
   - [ ] It removes the need for variables
   > A function that takes inputs and returns a result is easy to verify on its own.
2. What does the main-module guard at the bottom of a Python file achieve?
   - [ ] It encrypts the file
   - [ ] It stops the program from running
   - [x] The main code runs only when the file is executed directly, not when imported
   - [ ] It speeds up imports
   > Importing the file defines the functions without triggering the program.
3. A bill of 48.50 with an 18 percent tip gives which tip?
   - [ ] 7.83
   - [x] 8.73
   - [ ] 9.73
   - [ ] 87.30
   > 48.50 times 18 is 873.0, and dividing by 100 gives 8.73.
4. What is the best way to verify a new program?
   - [ ] Assume it works if it runs without errors
   - [x] Compare its output with answers worked out by hand, including edge cases
   - [ ] Run it only once
   - [ ] Remove all the comments
   > Running without errors says nothing about whether the answer is right.

# Common Syntax Errors
kind: concept
time: Not applicable — syntax errors are found before a program runs, so there is no running time to analyse. The relevant cost is how long it takes you to find and fix them.
space: Not applicable — a syntax error stops the program before it uses memory for its data.

## intro
Syntax errors are the mistakes the language refuses to accept: a missing colon, an unclosed bracket, a wrong indent. They are the most common early obstacle, and reading the error message carefully fixes most of them in seconds.

## theory
A syntax error means the parser cannot make sense of the text. Typical causes:

- A missing or extra bracket, brace or parenthesis, so a group is never closed
- A missing colon after if, for, while, def or class in Python
- Unterminated strings: an opening quote with no closing quote
- Wrong indentation: Python raises IndentationError when a block is not indented, or when levels are inconsistent
- Misspelled keywords, or using a reserved word as a name
- Using = where a condition is expected, or stray characters from copied text

The reported line is where the parser noticed the problem, which is not always where the mistake is. An unclosed bracket on one line is often reported on the next line, when the parser meets something that cannot follow. Syntax errors are different from runtime errors such as NameError or ZeroDivisionError, which only occur once the program is running, and from logic errors, which produce wrong output without any error.

## explain
1. Read the whole message: the error type, the line number and the pointer to the exact spot.
2. Look at the reported line, then the line above it, because the real mistake is often just before.
3. Check that every opening bracket and quote has a closing partner.
4. In Python check colons and indentation of the block.
5. Fix one error at a time and run again, since one mistake can cause several messages.
6. Use an editor with bracket matching and syntax highlighting so many errors never reach the run step.

## example
The Python sample compiles four broken snippets without running them: an if statement with no colon, a call with an unclosed parenthesis, a string with no closing quote, and a function whose body is not indented. Each one is rejected, and the printed result shows the error type. The three plain ones are SyntaxError and the unindented body is an IndentationError, a more specific kind. The JavaScript sample shows a missing brace being rejected and a ReferenceError that only appears at run time.

## real
Continuous integration systems run a syntax check on every change, and editors underline these mistakes while you type, so a syntax error rarely reaches a user, while the equivalent logic bug still might.

## pros
- Syntax errors are caught before the program runs, so they cannot corrupt data
- Messages point to a line, which narrows the search
- Editors and linters catch most of them as you type

## cons
- The reported line can be after the real mistake
- One missing bracket can produce confusing follow-on errors
- Messages differ between languages and versions

## uses
- Learning to read compiler and interpreter messages
- Setting up editor and linter checks
- Reviewing code copied from other sources
- Running a quick syntax check in a build pipeline

## mistakes
- Looking only at the reported line and not the lines before it
- Fixing several things at once and not knowing which one worked
- Mixing tabs and spaces in indentation
- Ignoring the error type and guessing instead of reading the message

## interview
**Q:** What is the difference between a syntax error and a runtime error?
**A:** A syntax error is found when the code is parsed, before anything runs, because the text breaks the grammar. A runtime error happens while the program runs, for example dividing by zero or using a name that was never defined.

**Q:** Why is the line number in a syntax error sometimes after the real mistake?
**A:** The parser only notices a problem when it meets something that cannot follow the earlier text, such as the line after an unclosed bracket, so the cause may be earlier than the reported location.

**Q:** How do editors reduce syntax errors?
**A:** They highlight matching brackets and quotes, auto-indent blocks and underline invalid code as you type, so mistakes are fixed immediately.

## summary
Syntax errors come from broken grammar: missing colons, unclosed brackets or quotes, bad indentation. Read the full message, check the reported line and the one before it, and fix one error at a time.

## codenote
The Python sample uses compile to check each snippet without running it and prints the error class. The JavaScript sample builds functions from text so a syntax error can be caught, and contrasts it with a run-time ReferenceError.

## code
### python
```python
snippets = {
    "missing colon": "if 1 > 0\n    pass",
    "unclosed parenthesis": "print((1 + 2)\nx = 3",
    "unterminated string": 'name = "Ada',
    "no indentation": "def f():\nreturn 1",
}

for label, source in snippets.items():
    try:
        compile(source, "<snippet>", "exec")
    except SyntaxError as error:
        print(label, "->", type(error).__name__)
```
Output:
```text
missing colon -> SyntaxError
unclosed parenthesis -> SyntaxError
unterminated string -> SyntaxError
no indentation -> IndentationError
```
### javascript
```javascript
try {
  new Function("if (true) { return 1;");
} catch (error) {
  console.log("parse time:", error.name);
}

try {
  new Function("return missingName;")();
} catch (error) {
  console.log("run time:", error.name);
}
```
Output:
```text
parse time: SyntaxError
run time: ReferenceError
```

## quiz
1. Which of these is a syntax error in Python?
   - [ ] Dividing a number by zero
   - [x] Writing an if statement without the colon
   - [ ] Using a variable that was never defined
   - [ ] Printing the wrong total
   > Only the missing colon breaks the grammar; the others are runtime or logic errors.
2. An error is reported on line 8 but line 8 looks correct. Where should you look?
   - [ ] Nowhere, the report is wrong
   - [x] At the lines just before it, such as an unclosed bracket or quote
   - [ ] At the last line of the file only
   - [ ] In another program
   > The parser may only realise the problem when it reaches a later line.
3. Which exception does Python raise for a block that is not indented?
   - [ ] ZeroDivisionError
   - [ ] NameError
   - [x] IndentationError
   - [ ] KeyError
   > IndentationError is a specific kind of SyntaxError for bad indentation.
4. Why fix one syntax error at a time?
   - [ ] The editor only allows one
   - [x] One mistake can cause several messages, so fixing it may clear the others
   - [ ] Errors are always independent
   - [ ] It makes the program shorter
   > Follow-on errors often disappear once the first real cause is fixed.

# Testing Small Programs
kind: concept
time: Not applicable — a small test is a handful of checks. The value of testing is confidence in correctness, not a complexity result.
space: Not applicable — tests hold only the inputs and expected values, and memory is not the concern at this scale.

## intro
Testing means running your code on chosen inputs and checking that the output is what you expect. Even a few simple checks written next to a small program catch mistakes early and make later changes safe.

## theory
The basic ideas of testing:

- A test case is an input together with the expected output
- An assertion states what must be true; if it is false the test fails and shows where
- Good tests cover typical cases, boundary cases (smallest, largest, empty, zero) and invalid input
- A function with no side effects is easiest to test: same input, same output
- Test first or test soon: write tests while the behavior is fresh in your mind
- A regression test is a test added after a bug is fixed so the bug cannot return unnoticed

In Python the `assert` statement is the lightest tool, and the `unittest` and `pytest` frameworks add test discovery and clear reports. In JavaScript Node provides an `assert` module, and frameworks such as Jest do the same job. Automated tests can be run after every change in seconds.

## explain
1. Write down what the function should do in one sentence.
2. Pick inputs: a normal one, the boundaries, and a case that should be handled specially.
3. Work out the expected output by hand, not by running the code.
4. Write an assertion for each case.
5. Run the checks. For a failure, read the expected and actual values before changing anything.
6. Fix the code and rerun all checks, not just the failing one.
7. Keep the tests so they run again after every future change.

## example
Take a leap-year function. The rule: a year is a leap year if it is divisible by 4, except century years, which must also be divisible by 400. The test cases come from the rule: 2024 is a leap year (divisible by 4), 2023 is not, 1900 is not (a century not divisible by 400), and 2000 is (a century divisible by 400). The sample asserts all four and prints a message only if every one passes.

## real
Teams run thousands of automated tests on every change before it is merged, and a failing test is often the first sign that a change broke something far away.

## pros
- Tests catch mistakes immediately after a change
- A test suite lets you refactor with confidence
- Writing examples first clarifies what the code should do

## cons
- Tests take time to write and maintain
- Passing tests do not prove the absence of bugs
- Poorly chosen tests give false confidence

## uses
- Checking that a function handles boundary values
- Preventing a fixed bug from returning
- Verifying that a refactor kept behavior the same
- Running checks automatically before sharing code

## mistakes
- Testing only the typical case and skipping boundaries
- Calculating the expected value by running the code under test
- Writing tests that depend on each other or on a particular order
- Deleting a failing test instead of understanding it

## interview
**Q:** What makes a good test case?
**A:** It has a clear input and an expected output worked out independently, and it targets something that could go wrong, such as a boundary value or an invalid input.

**Q:** What is a regression test?
**A:** A test written after a bug is found, which reproduces the bug and then guards against it returning in the future.

**Q:** Why are pure functions easier to test?
**A:** They depend only on their arguments and have no side effects, so the same input always gives the same output and no setup or cleanup is needed.

## summary
Test with chosen inputs and expected answers worked out by hand, covering normal cases, boundaries and invalid input. Keep the tests so every future change can be checked in seconds.

## codenote
Each assert states one expected result. If any assertion failed, Python or Node would stop with an error naming the failed line; the final message prints only when every check passes.

## code
### python
```python
def is_leap_year(year):
    return year % 4 == 0 and (year % 100 != 0 or year % 400 == 0)

assert is_leap_year(2024) is True
assert is_leap_year(2023) is False
assert is_leap_year(1900) is False
assert is_leap_year(2000) is True
print("4 checks passed")
```
Output:
```text
4 checks passed
```
### javascript
```javascript
const assert = require("assert");

function isLeapYear(year) {
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
}

assert.strictEqual(isLeapYear(2024), true);
assert.strictEqual(isLeapYear(1900), false);
assert.strictEqual(isLeapYear(2000), true);
console.log("3 checks passed");
```
Output:
```text
3 checks passed
```

## quiz
1. Why is 1900 a good test case for a leap-year function?
   - [ ] It is a recent year
   - [x] It is a boundary case: divisible by 4 and 100 but not by 400, so it is not a leap year
   - [ ] It is an even number
   - [ ] It is the first year in the calendar
   > Century years test the exception in the rule that simple examples miss.
2. How should you decide the expected value for a test?
   - [ ] Run the code and copy what it prints
   - [x] Work it out independently from the specification
   - [ ] Guess a plausible value
   - [ ] Use the previous test result
   > If the expected value comes from the code under test, a wrong implementation will pass.
3. What is the purpose of a regression test?
   - [ ] To make the program faster
   - [x] To make sure a bug that was fixed does not come back
   - [ ] To measure memory
   - [ ] To format the code
   > It reproduces the old bug so any future reappearance is detected at once.
4. A test fails. What is the best first step?
   - [ ] Delete the test
   - [x] Compare the expected and actual values to understand why they differ
   - [ ] Rewrite the whole program
   - [ ] Run it until it passes
   > The failure message contains the clue about whether the code or the test is wrong.

# Refactoring Basics
kind: concept
time: Not applicable — refactoring restructures code without changing what it does. Its benefit is the time saved on later changes, not a faster algorithm.
space: Not applicable — refactoring is not about memory; observable behavior is meant to stay identical.

## intro
Refactoring is improving the structure of code without changing its behavior: clearer names, smaller functions, less duplication. It is how a working but messy program becomes something you can safely extend.

## theory
The defining rule of refactoring is that behavior stays the same. You change how the code is organised, not what it produces. That is why tests matter: they prove nothing broke.

Common small refactorings:

- Rename a variable or function so it says what it is
- Extract a function from a block that does one identifiable job
- Remove duplication: when the same logic appears twice, give it a single home
- Replace a magic number with a named constant
- Simplify a condition or flatten nesting with an early return
- Delete dead code and unused variables

Signs that code needs refactoring, sometimes called code smells, include duplicated blocks, very long functions, deep nesting, unclear names and functions with many parameters. The safe method is to work in tiny steps and run the tests after each one. Refactoring and adding features are separate activities: do one at a time.

## explain
1. Make sure the code works and has tests, even a few simple ones.
2. Choose one small improvement, such as extracting a repeated expression into a function.
3. Make that change only.
4. Run the tests. If something breaks, undo the step and try a smaller one.
5. Repeat with the next improvement.
6. Commit each step so you can go back if needed.

## example
Two functions compute shipping for domestic and international orders and repeat the same expression for the free-shipping threshold. The messy version has the rule written out twice. The refactored version extracts `shipping_cost(total, base, free_over)` so the rule exists once, and the two callers pass different numbers. The sample runs the old and new versions on the same orders and shows that the results are identical, which is the proof that behavior was preserved.

## real
Refactoring happens continuously on real projects: each time a developer touches messy code they leave it slightly cleaner, supported by automated tests and by IDE features that rename and extract safely.

## pros
- Removes duplication so a rule needs to be changed in one place
- Makes the next feature easier and less risky to add
- Improves readability for the whole team

## cons
- It produces no visible new feature, which makes it hard to justify
- Without tests it can introduce bugs
- It can be overdone, leading to needless abstraction

## uses
- Cleaning up a prototype before it becomes a product
- Removing copy-pasted logic
- Preparing code for a new feature
- Making old code understandable

## mistakes
- Changing behavior and structure in the same step
- Refactoring without tests or any way to check results
- Making many changes at once and being unable to find what broke
- Introducing abstractions for code that is not actually repeated

## interview
**Q:** What is refactoring?
**A:** Restructuring existing code to improve readability or design without changing its external behavior.

**Q:** Why are tests important when refactoring?
**A:** They check that behavior did not change. Without them there is no reliable way to know whether a restructuring introduced a bug.

**Q:** Name two common refactorings.
**A:** Extract function, where a block of code becomes a named function, and rename, where a variable or function gets a name that describes it better. Removing duplication and replacing magic numbers are other examples.

## summary
Refactoring improves code structure in small, tested steps while behavior stays identical. Remove duplication, clarify names and extract functions, and never mix it with adding features.

## codenote
Both Python versions give the same answers for the same orders, which is checked at the end. The refactored one has the pricing rule written once. The JavaScript sample shows the extracted function used by two callers.

## code
### python
```python
def domestic_before(total):
    if total >= 50:
        return 0
    return 4.99

def international_before(total):
    if total >= 120:
        return 0
    return 14.99

def shipping_cost(total, base, free_over):
    return 0 if total >= free_over else base

def domestic(total):
    return shipping_cost(total, 4.99, 50)

def international(total):
    return shipping_cost(total, 14.99, 120)

orders = [20, 50, 100, 150]
print([domestic(t) for t in orders])
print([international(t) for t in orders])
print(all(domestic(t) == domestic_before(t) for t in orders))
print(all(international(t) == international_before(t) for t in orders))
```
Output:
```text
[4.99, 0, 0, 0]
[14.99, 14.99, 14.99, 0]
True
True
```
### javascript
```javascript
function shippingCost(total, base, freeOver) {
  return total >= freeOver ? 0 : base;
}

const domestic = (total) => shippingCost(total, 4.99, 50);
const international = (total) => shippingCost(total, 14.99, 120);

console.log(domestic(20), domestic(80));
console.log(international(100), international(150));
```
Output:
```text
4.99 0
14.99 0
```

## quiz
1. What must stay the same after a refactoring?
   - [ ] The names of all functions
   - [x] The externally visible behavior
   - [ ] The number of lines
   - [ ] The file structure
   > Refactoring restructures code without changing what it does.
2. Which is a typical refactoring?
   - [ ] Adding a new login feature
   - [x] Extracting repeated logic into one function
   - [ ] Changing the output format for users
   - [ ] Fixing a wrong calculation
   > Extracting a function reorganises code without altering results; the others change behavior.
3. Why work in small steps and run the tests after each one?
   - [ ] Tests make the code faster
   - [x] If a step breaks something, you know exactly which change caused it
   - [ ] It is required by the language
   - [ ] Small steps reduce the file size
   > A small step limits the search area when something goes wrong.
4. Two blocks of code differ only by a number. What is a sensible refactoring?
   - [ ] Keep both copies
   - [x] Extract one function and pass the number as a parameter
   - [ ] Delete one block at random
   - [ ] Add a comment to each
   > Parameterising the difference leaves one copy of the logic to maintain.

# Reading Documentation Effectively
kind: concept
time: Not applicable — reading documentation is a skill, not an algorithm. The relevant cost is how quickly you can find a correct answer.
space: Not applicable — it is about locating information and has no data-structure memory result.

## intro
No one remembers every function and option, so reading documentation well is one of the most useful programming skills. Knowing where to look, what to read first and how to check what you read turns a blocked afternoon into a five-minute search.

## theory
Documentation comes in several kinds, each answering a different question:

- Tutorials and guides — teach a topic from the beginning with worked examples
- How-to guides — show the steps for one goal
- Reference — the exact description of every function, class and option: signature, parameters, return value, errors
- Explanations — the background and reasoning behind a design

A reference entry for a function usually has the same parts: a signature such as `str.split(sep=None, maxsplit=-1)`, a description, parameter details with defaults, the return value, exceptions, notes on edge cases and examples. Version matters: a page for another version may describe options you do not have. Official documentation is the primary source; blog posts and forum answers are helpful but can be out of date.

Important details hide in small places: default values, what happens at boundaries, whether the original is modified or a new value is returned, and warnings about deprecated features.

## explain
1. State what you are trying to do in one sentence, and which language and version you use.
2. Find the right kind of page: a guide if you are new to the topic, the reference if you know the name of the function.
3. Read the signature first, then the parameter list and the return value.
4. Look for edge cases and notes, such as what an empty input returns.
5. Test the example in a REPL or scratch file to confirm your understanding.
6. Write down what you learned in your own words or in a comment with a link, so you do not have to search again.

## example
Reading the reference for Python's `round` shows that for a value exactly halfway between two integers it rounds to the nearest even number, so `round(2.5)` is 2 and `round(3.5)` is 4. JavaScript's `Math.round(2.5)` is 3 and `Math.round(-2.5)` is -2, because it rounds halves toward positive infinity. The signature of `split` also shows an optional second argument that limits the number of splits. The samples try these out, which is the habit to build: read, then confirm by running.

## real
Experienced developers spend a surprising amount of time in reference pages, and a team's own internal documentation, covering its API and set-up steps, is often what decides how fast a new member becomes productive.

## pros
- Official reference gives exact and current behavior
- Examples in the documentation are quick to adapt
- Knowing how to look things up reduces the need to memorise

## cons
- Documentation can be incomplete, dense or out of date
- Finding the right page can take time at first
- Different versions may describe different behavior

## uses
- Learning the options of a function you have not used before
- Checking default values and edge cases
- Following a library's getting-started guide
- Reading the set-up notes of an unfamiliar project

## mistakes
- Reading a page for the wrong language version
- Copying an example without reading the explanation or caveats
- Relying on old blog posts instead of the official reference
- Skipping the parameter defaults and return value

## interview
**Q:** How do you approach an unfamiliar library?
**A:** I read the getting-started guide for the overall idea, then use the reference for exact signatures and return values, and I try small examples in a scratch file to confirm how it really behaves.

**Q:** Why does the version of the documentation matter?
**A:** Functions, parameters and defaults change between versions, so a page for a different version can describe features that are missing or behave differently in the version you actually use.

**Q:** What parts of a function's reference entry do you check first?
**A:** The signature, the parameters with their default values, the return value and any noted exceptions or edge cases.

## summary
Match the kind of documentation to your question, read signatures, defaults and return values, check the version, and confirm what you read with a quick experiment.

## codenote
Each line checks a behavior the documentation describes, in the way the lesson recommends: read it, then test it. The surprising results are the rounding of halves and the limit on splits.

## code
### python
```python
print("a,b,c".split(",", 1))
print(int("ff", 16))
print(round(2.5), round(3.5))
```
Output:
```text
['a', 'b,c']
255
2 4
```
### javascript
```javascript
console.log("a,b,c".split(",", 2));
console.log(parseInt("ff", 16));
console.log(Math.round(2.5), Math.round(-2.5));
```
Output:
```text
[ 'a', 'b' ]
255
3 -2
```

## quiz
1. Which kind of documentation gives the exact signature and return value of a function?
   - [ ] A tutorial
   - [ ] A blog post
   - [x] The reference
   - [ ] A release announcement
   > Reference pages describe every parameter, default and return value precisely.
2. Why should you check the version of the documentation?
   - [ ] Newer pages are always wrong
   - [x] Behavior and options can differ between versions
   - [ ] Version numbers decide the page colour
   - [ ] It is only needed for hardware
   > A page for another version may describe features you do not have.
3. In Python, what does round(2.5) return?
   - [ ] 3
   - [x] 2
   - [ ] 2.5
   - [ ] An error
   > Python rounds halves to the nearest even integer, which the reference explains.
4. What is a good habit after reading how a function works?
   - [ ] Never test it
   - [x] Try a small example to confirm the behavior
   - [ ] Memorise the whole page
   - [ ] Ignore the defaults
   > Running a quick test confirms your understanding and exposes edge cases.
