# Standard Input Streams
kind: concept
time: Not applicable — reading input is limited by the speed of the source (a person typing, a disk, a network), not by an algorithm. The only meaningful measure is how many read operations a program makes.
space: Not applicable — a stream delivers data piece by piece, so memory use depends on whether you keep all of it or process it as it arrives.

## intro
Standard input is the stream a program reads from by default. Treating it as a flow of text that ends at some point, rather than as a keyboard, is what lets the same program accept typed answers, a file or the output of another command.

## theory
A stream is an ordered sequence of data that can be consumed once, from the beginning. Standard input has these properties:

- It is text by default; every number arrives as characters and must be converted
- It is consumed as you read it: after a line is read, the next read returns the following line
- It ends with an end-of-file (EOF) condition when the source has no more data, for example when a file runs out or the user presses Ctrl+D on Unix or Ctrl+Z on Windows
- It can come from a keyboard, a redirected file (`program < data.txt`) or a pipe from another command

Python offers several ways to read it:

- `input()` reads one line, removes the trailing newline and raises EOFError at the end of input
- `sys.stdin.readline()` returns the line including its newline, and an empty string at EOF
- Iterating over `sys.stdin` yields one line at a time, which suits large inputs
- `sys.stdin.read()` returns everything that remains as one string

In Node.js, standard input is a readable stream; the `readline` module turns it into a sequence of line events.

Because an empty string at EOF is different from a blank line (which still contains a newline), loops that read until EOF must test for the empty result.

## explain
1. Decide whether the program needs one value, a fixed number of lines or everything until the end.
2. For a single value use `input()`; for a known number of lines call it in a loop of that size.
3. For unknown length iterate over the stream or read until `readline()` returns an empty string.
4. Strip the trailing newline when you need the text only: `line.rstrip("\n")`.
5. Convert each piece to the type you need as soon as you read it.
6. Handle EOF explicitly, because a program that works when typed can fail with EOFError when run with less input.

## example
The Python sample replaces standard input with a two-line string. `readline()` returns `'first line\n'` including the newline. Then `input()` returns `'second line'` without it. The next `readline()` returns an empty string because the data has run out, and calling `input()` now raises EOFError. A second input with three lines shows that iterating over the stream collects `['a', 'b', 'c']`. The Node sample feeds two lines to the readline interface and prints each line event followed by a message when the stream closes.

## real
Command-line tools such as formatters and converters read standard input so they can be placed inside shell pipelines, and automated graders feed test data through standard input while checking what the program prints.

## pros
- One program works for typed, file and piped input without changes
- Streams handle inputs larger than memory when processed line by line
- A uniform text interface is simple to test

## cons
- All data arrives as text and needs conversion and validation
- Reading past the end raises an error unless handled
- Interactive and piped runs behave differently when prompts are involved

## uses
- Reading user answers in a console program
- Processing the output of another command in a pipeline
- Feeding test data to a program from a file
- Reading large inputs line by line without loading them whole

## mistakes
- Forgetting that the newline is part of the line returned by readline
- Treating an empty string at EOF as a blank line and looping forever
- Calling input() more times than there are lines
- Assuming the user always types something valid

## interview
**Q:** What is EOF and how does a program detect it?
**A:** End-of-file means the input has no more data. Python's readline returns an empty string, input raises EOFError, and iteration over the stream simply stops.

**Q:** How does readline differ from input in Python?
**A:** readline returns the line with its trailing newline and gives an empty string at the end. input strips the newline, can show a prompt, and raises EOFError at the end.

**Q:** Why is it useful that standard input can be redirected?
**A:** The program does not need to know where the data comes from, so the same code serves interactive use, stored test files and pipelines from other commands.

## summary
Standard input is a consumable stream of text that ends with EOF. Pick the reading method that fits the amount of data, strip newlines, convert types at once and handle the end of input deliberately.

## codenote
The Python sample demonstrates the difference between readline and input, the EOF behavior and line iteration. The JavaScript sample uses an in-memory stream with readline so it runs without a keyboard.

## code
### python
```python
import io
import sys

sys.stdin = io.StringIO("first line\nsecond line\n")
print(repr(sys.stdin.readline()))
print(repr(input()))
print(repr(sys.stdin.readline()))
try:
    input()
except EOFError:
    print("EOFError at end of input")

sys.stdin = io.StringIO("a\nb\nc\n")
print([line.rstrip("\n") for line in sys.stdin])
```
Output:
```text
'first line\n'
'second line'
''
EOFError at end of input
['a', 'b', 'c']
```
### javascript
```javascript
const readline = require("readline");
const { Readable } = require("stream");

const rl = readline.createInterface({ input: Readable.from(["x\ny\n"]) });
rl.on("line", (line) => console.log("line:", line));
rl.on("close", () => console.log("done"));
```
Output:
```text
line: x
line: y
done
```

## quiz
1. What does Python's readline return when the input has run out?
   - [ ] None
   - [x] An empty string
   - [ ] A newline
   - [ ] It raises EOFError
   > An empty string signals EOF, while a blank line would still contain a newline.
2. What does input() do when no more input is available?
   - [ ] Returns an empty string
   - [x] Raises EOFError
   - [ ] Waits forever
   - [ ] Returns zero
   > Unlike readline, input signals the end with an exception.
3. Why can the same program read a file with the command line operator <?
   - [ ] The program is recompiled
   - [x] The operating system connects the file to standard input
   - [ ] The program opens the file itself
   - [ ] Files are always keyboards
   > Redirection replaces the source of the stream without changing the program.
4. Which is the best way to read a very large input?
   - [ ] Read it all with read() into one string
   - [x] Iterate over the stream line by line
   - [ ] Call input() once
   - [ ] Convert everything to a list first
   > Line-by-line processing keeps memory use small.

# Standard Output Streams
kind: concept
time: Not applicable — writing output is dominated by the destination, such as a terminal, file or network. No growth rate applies to the operation itself.
space: Not applicable — output is pushed out as it is produced, and the topic is where the text goes and how it is separated.

## intro
Standard output is where a program sends its normal results. Knowing how print and write differ, how separators and line endings work, and how to capture or redirect output makes programs easier to test and combine.

## theory
The output system has several parts:

- Standard output (stdout) carries results; standard error (stderr) carries diagnostics. They can be redirected separately, for example `program > out.txt 2> errors.txt`.
- `print()` in Python converts each argument to text, joins them with `sep` (a space by default) and finishes with `end` (a newline by default). `sys.stdout.write()` writes exactly the string it is given and adds nothing.
- In JavaScript `console.log` joins its arguments with spaces and adds a newline, `process.stdout.write` writes the string as is, and `console.error` writes to stderr.
- Format specifiers in `console.log` such as `%s` (string), `%d` (number) and `%j` (JSON) insert later arguments into the first one.
- Output can be captured by swapping the stream. Python's `contextlib.redirect_stdout` temporarily points `sys.stdout` at another object, which is the usual way to test code that prints.

A program that mixes results and messages on stdout becomes hard to chain with other programs, so keep results on stdout and everything else on stderr.

## explain
1. Decide what is a result and what is a diagnostic. Results go to stdout, messages go to stderr.
2. Produce each line of output exactly in the format that a reader or the next program expects.
3. Use `sep` and `end` to control joining and line endings without building strings by hand.
4. When you need no newline, use `end=""` in Python or `process.stdout.write` in Node.
5. For testing, capture the output into a buffer and compare the text.
6. Check the final output for trailing spaces and missing or extra blank lines.

## example
In the Python sample, the code under `redirect_stdout` writes to a buffer: one line via `print` and one via `sys.stdout.write`. Nothing appears on the screen at that point; the program then prints the captured text with `repr`, which shows the newline characters, and finally prints a normal line. In JavaScript, `console.log("a", "b", 3)` joins the arguments with spaces, a format string substitutes values, and two `process.stdout.write` calls build one line which `console.log()` then ends.

## real
Build tools and scripts rely on stdout carrying only results so that other tools can parse it, while progress messages go to stderr; test suites capture stdout to verify what a function prints.

## pros
- Redirecting stdout lets the same program feed files, pipes and tests
- print and console.log handle conversion and separation for you
- Separate stderr keeps messages out of data

## cons
- Mixing results and diagnostics on one stream breaks pipelines
- Subtle differences in newline and spacing break exact-match checks
- Output from several threads or processes can interleave

## uses
- Printing results of a calculation or report
- Capturing output in unit tests
- Producing machine-readable output for other programs
- Sending progress messages to stderr while keeping data clean

## mistakes
- Printing debug messages to stdout in a program whose output is parsed
- Forgetting that write does not add a newline
- Leaving a trailing space or extra blank line in expected output
- Expecting captured output to also include stderr

## interview
**Q:** What is the difference between print and sys.stdout.write in Python?
**A:** print converts its arguments to text, joins them with a separator and appends an end string, which is a newline by default. write outputs exactly the string you give it.

**Q:** How would you test a function that prints?
**A:** Temporarily redirect standard output to an in-memory buffer, call the function, then compare the buffer's contents with the expected text.

**Q:** Why send error messages to stderr?
**A:** So they remain visible on the terminal while the real output can be redirected to a file or another program without being polluted.

## summary
Send results to stdout and diagnostics to stderr, control separators and line endings explicitly, and capture the stream when you need to test printing code.

## codenote
The Python sample captures output with redirect_stdout and shows the difference between print and write. The JavaScript sample shows argument joining, format specifiers and write without a newline.

## code
### python
```python
import io
import sys
from contextlib import redirect_stdout

buffer = io.StringIO()
with redirect_stdout(buffer):
    print("captured", 1, 2)
    sys.stdout.write("also captured\n")

print(repr(buffer.getvalue()))
print("visible")
```
Output:
```text
'captured 1 2\nalso captured\n'
visible
```
### javascript
```javascript
console.log("a", "b", 3);
console.log("%s is %d years old", "Ada", 36);
process.stdout.write("no newline,");
process.stdout.write(" then one\n");
```
Output:
```text
a b 3
Ada is 36 years old
no newline, then one
```

## quiz
1. Which stream should hold the results that another program will read?
   - [ ] Standard error
   - [x] Standard output
   - [ ] Standard input
   - [ ] A log file only
   > Pipelines pass stdout from one program to the next.
2. What does sys.stdout.write("hi") print?
   - [ ] hi followed by a newline
   - [x] hi with no newline
   - [ ] Nothing until flushed with print
   - [ ] "hi" including the quotes
   > write outputs the exact string, so any newline must be included by you.
3. How can you test code that prints text?
   - [ ] You cannot test it
   - [x] Redirect stdout to a buffer and compare the captured text
   - [ ] Read the screen with a camera
   - [ ] Remove the print calls
   > Redirecting the stream captures the output for assertions.
4. In Node, which call writes to the error stream?
   - [ ] console.log
   - [ ] process.stdout.write
   - [x] console.error
   - [ ] console.table
   > console.error writes to stderr rather than stdout.

# Formatted Output
kind: concept
time: Not applicable — formatting a value into text takes a small, effectively constant time per value, and the lesson concerns appearance and correctness of text.
space: Not applicable — the produced string is as long as its content and is not an algorithmic space bound.

## intro
Formatted output turns raw values into text that people can read: aligned columns, fixed decimals, thousands separators and percentages. Good formatting makes a report understandable at a glance, and a format specification is more reliable than building strings by hand.

## theory
Python's format mini-language is used in f-strings, `str.format` and the `format()` function. A replacement field has the form `{value:spec}` where the spec is built from these pieces:

- Alignment and width: `<` left, `>` right, `^` centre, followed by a width, such as `>8`
- Fill character: placed before the alignment, such as `*^9`
- Sign: `+` forces a sign
- Grouping: `,` inserts thousands separators
- Precision and type: `.2f` is a float with two decimals, `d` an integer, `x` hexadecimal, `b` binary, `e` scientific, `%` a percentage (multiplies by 100)
- Zero padding: `03d` pads with zeros to width 3

The older printf-style operator, `"%5.1f" % value`, uses the same ideas and is also found in C, where `printf("%5.1f", value)` is the standard.

JavaScript offers `toFixed(n)`, `padStart` and `padEnd` for padding, and `toLocaleString` for locale-aware grouping and currency. Formatting is for display only: do not round a value for printing and then keep using the rounded text in calculations.

Locale matters. In some regions the decimal separator is a comma, so a program meant for international users should rely on locale-aware formatting rather than hard-coded characters.

## explain
1. Decide what the reader needs: columns of equal width, a fixed number of decimals, grouped digits.
2. Pick widths from the longest expected value, not the typical one.
3. Write the format spec: alignment for text (left) and numbers (right), precision for floats.
4. Keep the raw values separate from the formatted strings.
5. Print a header and a sample row, and check that the columns line up.
6. For user-facing text in several regions, use locale-aware formatting.

## example
With name "Ada", score 93.456, count 7, big number 1234567 and ratio 0.256, the Python sample prints the name right-aligned in 8 characters, the score as `93.46` in a field of width 6, the count zero-padded as `007`, the number with commas as `1,234,567` and the ratio as a percentage `25.6%`. A printf-style line with `%5.1f` shows the older syntax. The JavaScript sample reaches the same results with `padStart`, `padEnd`, `toLocaleString` and `toFixed`.

## real
Invoices, tables in command-line tools and monitoring dashboards depend on aligned numbers; misaligned columns or inconsistent decimals are a common reason a report is hard to trust.

## pros
- A specification expresses alignment and precision in a few characters
- Formatting is separate from the data, so values stay accurate
- Locale-aware tools adapt output to the reader

## cons
- The mini-language has many options to learn
- Formatting can hide the true precision of a value
- Hard-coded separators break for other locales

## uses
- Printing tables and reports with aligned columns
- Showing money, percentages and measurements
- Zero-padding identifiers and timestamps
- Producing hexadecimal or binary dumps

## mistakes
- Rounding a value for display and then using the rounded value in later calculations
- Choosing a field width that is too narrow for the largest value
- Forgetting that the percent format multiplies by 100
- Hard-coding commas and periods in international software

## interview
**Q:** What does f"{value:6.2f}" do?
**A:** It formats value as a floating-point number with two digits after the decimal point, padded on the left with spaces to a total width of six characters.

**Q:** Why should you not use rounded text in later calculations?
**A:** Rounding for display discards precision. Formatting should be the last step; calculations should use the original numeric value.

**Q:** How do you add thousands separators in Python?
**A:** Use the comma option in the format spec, as in f"{n:,}", or a locale-aware formatting function when separators should follow the user's region.

## summary
Use the format specification to control width, alignment, precision and grouping. Keep values numeric until the moment of display, and choose widths and locale handling with the reader in mind.

## codenote
Each line of the Python sample demonstrates one part of the format mini-language. The JavaScript sample uses the equivalent string methods.

## code
### python
```python
name, score, count = "Ada", 93.456, 7
big, ratio = 1234567, 0.256

print(f"{name:>8}|")
print(f"{score:6.2f}|")
print(f"{count:03d}|")
print(f"{big:,}")
print(f"{ratio:.1%}")
print("%5.1f" % 3.14159)
```
Output:
```text
     Ada|
 93.46|
007|
1,234,567
25.6%
  3.1
```
### javascript
```javascript
console.log("Ada".padStart(8) + "|");
console.log((93.456).toFixed(2).padStart(6) + "|");
console.log(String(7).padStart(3, "0") + "|");
console.log((1234567).toLocaleString("en-US"));
console.log((0.256 * 100).toFixed(1) + "%");
```
Output:
```text
     Ada|
 93.46|
007|
1,234,567
25.6%
```

## quiz
1. What does the format spec .2f produce?
   - [ ] Two digits before the decimal point
   - [x] A float with two digits after the decimal point
   - [ ] The number 2
   - [ ] A hexadecimal value
   > The precision applies to the digits after the point.
2. What does {ratio:.1%} do to the value 0.256?
   - [ ] Prints 0.3
   - [x] Multiplies by 100 and prints 25.6%
   - [ ] Prints 0.256%
   - [ ] Raises an error
   > The percent type scales the value by 100 and appends a sign.
3. Which JavaScript method pads a string on the left to a given length?
   - [ ] padEnd
   - [x] padStart
   - [ ] trim
   - [ ] repeat
   > padStart adds characters at the beginning until the length is reached.
4. Why format a number only at the moment of display?
   - [ ] Formatted text is faster to calculate with
   - [x] Rounding for display loses precision that later calculations need
   - [ ] Numbers cannot be printed otherwise
   - [ ] Formatting changes the variable type permanently
   > Keep the exact value for logic and use text only for presentation.

# Reading Multiple Values
kind: concept
time: Not applicable — splitting a line and converting its parts takes time proportional to its length, but the topic is how to structure the reading code, not a growth analysis.
space: Not applicable — the values read are stored as needed; the lesson is about input format and parsing steps.

## intro
Most programs need several values at once: two numbers on one line, a count followed by that many items, or a grid of rows. Reading them reliably is mostly about knowing the input format and splitting it correctly.

## theory
Typical input shapes and how to read them:

- Several values on one line separated by spaces: `line.split()` splits on any run of whitespace and ignores leading and trailing spaces. `split(" ")` splits on single spaces and produces empty strings when spaces repeat.
- A count and then the items: read the count first, then exactly that many values, whether they are on one line or several.
- Fixed number of values assigned to names: unpacking, as in `a, b = map(int, line.split())`. A wrong count raises ValueError.
- Rows of a table: read one line per row, and split each.
- All remaining input: `sys.stdin.read().split()` gives a flat list of tokens that you can consume in order, which is robust to different line breaks.

`map(int, tokens)` is lazy in Python, so wrap it in `list(...)` if you need to index it twice. In JavaScript the idiom is `line.split(" ").map(Number)`.

The key discipline is to agree on a format and read according to it. A token-based approach, which ignores where the line breaks fall, is the most forgiving for inputs typed by hand.

## explain
1. Write down the input format: what is on each line and what the counts mean.
2. Read line by line, or read all tokens at once if the layout does not matter.
3. Split each line into tokens and convert them to the right type.
4. Unpack into names when the number of values is fixed.
5. Check that the number of tokens matches the format and report a clear error if it does not.
6. Keep the parsed data in lists or tuples rather than recomputing it.

## example
The input is the three lines `3`, `10 20 30` and `4 5`. The Python sample reads the count 3, then converts the second line to the list `[10, 20, 30]`, then unpacks the last line into a and b, so a + b is 9. The final print shows the count, the list, the sum of the pair and the sum of the list. The JavaScript sample processes the same text by splitting on newlines first and then on spaces.

## real
Programming contests, data-conversion tools and configuration readers all parse several values per line, and a frequent real-world defect is a program that breaks when a file has an extra space or trailing blank line.

## pros
- Token-based reading tolerates different layouts
- Unpacking documents the expected number of values
- map and list comprehensions keep parsing concise

## cons
- Wrong counts cause ValueError or silent misreads
- Lazy iterators such as map can be consumed only once
- Manual splitting on a single space fails on repeated spaces

## uses
- Reading coordinates, dimensions or pairs of numbers
- Reading a list whose length is given first
- Parsing rows of a table or matrix
- Processing whitespace-separated data files

## mistakes
- Using split(" ") on input that may contain multiple spaces
- Forgetting to convert tokens to numbers
- Reusing a map object after it has been consumed
- Reading fewer or more values than the format specifies

## interview
**Q:** What is the difference between split() and split(" ") in Python?
**A:** split() with no argument splits on any run of whitespace and discards empty pieces. split(" ") splits at each single space, so repeated spaces produce empty strings.

**Q:** How do you read a line of integers into a list?
**A:** Split the line and convert each piece, for example list(map(int, line.split())).

**Q:** Why might you read all tokens at once?
**A:** It makes the program independent of where line breaks fall, which is convenient for inputs formatted inconsistently.

## summary
Know the input format, split on whitespace, convert as you go, and use unpacking or token iteration to match it. Validate counts and wrap lazy maps in a list when reused.

## codenote
Both samples read a count, a list of numbers and a pair from three lines. The Python version reads from a replaced standard input; the JavaScript version splits a literal text.

## code
### python
```python
import io
import sys

sys.stdin = io.StringIO("3\n10 20 30\n4 5\n")
n = int(input())
numbers = list(map(int, input().split()))
a, b = map(int, input().split())
print(n, numbers, a + b, sum(numbers))
```
Output:
```text
3 [10, 20, 30] 9 60
```
### javascript
```javascript
const lines = "3\n10 20 30\n4 5".split("\n");
const n = Number(lines[0]);
const numbers = lines[1].split(" ").map(Number);
const [a, b] = lines[2].split(" ").map(Number);
console.log(n, numbers, a + b);
```
Output:
```text
3 [ 10, 20, 30 ] 9
```

## quiz
1. Why is line.split() safer than line.split(" ") for typed input?
   - [ ] It is shorter to type
   - [x] It ignores runs of whitespace instead of producing empty strings
   - [ ] It converts to numbers
   - [ ] It reads the next line
   > Calling split with no argument treats any run of whitespace as one separator.
2. What does a, b = map(int, input().split()) require?
   - [ ] Exactly one number on the line
   - [x] Exactly two values on the line
   - [ ] At least three values
   - [ ] A comma between values
   > Unpacking raises ValueError if the number of values is different.
3. Why wrap map in list when the result is used twice in Python?
   - [ ] map returns a string
   - [x] A map object is a one-time iterator
   - [ ] list makes the numbers integers
   - [ ] It is required by the syntax
   > After one pass the map object is exhausted.
4. What is a benefit of reading all tokens at once?
   - [ ] It uses less memory for huge inputs
   - [x] The program does not depend on where line breaks fall
   - [ ] It validates the input
   - [ ] It converts types automatically
   > A flat list of tokens can be consumed in order whatever the layout.

# File I O Basics
kind: concept
time: Not applicable — reading and writing files is limited by storage speed. What matters is how many operations are made and whether the file is read whole or in pieces.
space: Not applicable — reading a whole file into memory needs space equal to its size, but the lesson concerns the mechanics of opening, reading, writing and closing.

## intro
Files let a program keep data after it exits and exchange data with other programs. The basics are always the same: open the file in a chosen mode, read or write, and make sure it is closed again, which the with statement does for you.

## theory
Key concepts:

- A file path identifies the file; relative paths depend on the current working directory
- A mode says what you intend: `"r"` read (the default), `"w"` write (creates or truncates), `"a"` append (adds at the end), `"x"` create and fail if it exists; adding `"b"` selects binary mode
- Text mode decodes bytes to characters using an encoding, so pass `encoding="utf-8"` explicitly instead of trusting the platform default
- Reading: `read()` for everything, `readline()` for one line, iteration for line by line, `readlines()` for a list
- Writing: `write()` for a string, `writelines()` for several; nothing is guaranteed to be on disk until the file is flushed or closed
- The `with` statement guarantees the file is closed even if an error happens

Common failures are FileNotFoundError (the path does not exist), PermissionError (no rights) and IsADirectoryError. Opening in `"w"` mode destroys existing content, which is a frequent cause of data loss.

In Node.js the `fs` module provides `readFileSync`, `writeFileSync` and `appendFileSync` for simple cases, and asynchronous or streaming variants for large files and servers.

## explain
1. Decide the path and make sure its directory exists.
2. Choose the mode that matches the intent: read, write, append or create.
3. Open with `with` and an explicit encoding.
4. Read the content in the style that fits its size: all at once for small files, line by line for large ones.
5. Write and, if the data is important, flush or close promptly.
6. Handle the errors that can occur and clean up temporary files.

## example
The Python sample creates a temporary folder and a file path inside it. It writes two lines in write mode, appends a third in append mode, then reads the file back and splits it into lines, giving `['alpha', 'beta', 'gamma']` and a count of 3. It confirms the file exists, deletes it and the folder, and confirms that the file is gone. The JavaScript sample does the same with `writeFileSync`, `appendFileSync` and `readFileSync`.

## real
Applications store settings, logs and exports in files, and spreadsheets, backups and data pipelines exchange information through them. A forgotten close or an accidental truncation is a classic source of lost data.

## pros
- Files persist data beyond the lifetime of the program
- The with statement makes cleanup automatic
- Text and binary modes cover documents and arbitrary data

## cons
- File operations can fail for many external reasons
- Write mode silently destroys existing content
- Encoding mismatches corrupt non-English text

## uses
- Saving program settings and user data
- Reading input data sets and writing reports
- Appending entries to a log
- Creating temporary files for intermediate results

## mistakes
- Opening an existing file with mode w and erasing it
- Not specifying an encoding and getting garbled text on another machine
- Forgetting to close a file, so data is never written
- Hard-coding a path that exists only on one computer

## interview
**Q:** What is the difference between modes w and a?
**A:** Mode w truncates an existing file to zero length before writing, while mode a keeps the existing content and adds new data at the end.

**Q:** Why use the with statement when opening files?
**A:** It closes the file automatically when the block ends, even if an exception occurs, which prevents resource leaks and lost writes.

**Q:** What happens if you open a missing file for reading?
**A:** Python raises FileNotFoundError, so code that cannot assume the file exists should catch it or check the path first.

## summary
Open files with an explicit mode and encoding inside a with block, choose reading style by file size, take care with write mode, and handle the errors that real file systems produce.

## codenote
The Python sample writes, appends, reads back and removes a temporary file. The JavaScript sample performs the same steps with the fs module and a temporary directory.

## code
### python
```python
import os
import tempfile

folder = tempfile.mkdtemp()
path = os.path.join(folder, "notes.txt")

with open(path, "w", encoding="utf-8") as handle:
    handle.write("alpha\nbeta\n")
with open(path, "a", encoding="utf-8") as handle:
    handle.write("gamma\n")
with open(path, encoding="utf-8") as handle:
    lines = handle.read().splitlines()

print(lines, len(lines))
print(os.path.exists(path))
os.remove(path)
os.rmdir(folder)
print(os.path.exists(path))
```
Output:
```text
['alpha', 'beta', 'gamma'] 3
True
False
```
### javascript
```javascript
const fs = require("fs");
const os = require("os");
const path = require("path");

const dir = fs.mkdtempSync(path.join(os.tmpdir(), "demo-"));
const file = path.join(dir, "notes.txt");
fs.writeFileSync(file, "alpha\nbeta\n");
fs.appendFileSync(file, "gamma\n");

const lines = fs.readFileSync(file, "utf8").trim().split("\n");
console.log(lines, lines.length);
fs.rmSync(dir, { recursive: true });
console.log(fs.existsSync(file));
```
Output:
```text
[ 'alpha', 'beta', 'gamma' ] 3
false
```

## quiz
1. Which mode erases an existing file before writing?
   - [ ] r
   - [ ] a
   - [x] w
   - [ ] rb
   > Write mode truncates the file to zero length when it is opened.
2. What is the main benefit of the with statement for files?
   - [ ] It makes reading faster
   - [x] The file is closed automatically, even if an error occurs
   - [ ] It converts text to binary
   - [ ] It avoids needing a path
   > The context manager handles cleanup for you.
3. Why pass encoding="utf-8" explicitly?
   - [ ] It compresses the file
   - [x] The platform default may differ, which can garble non-English text
   - [ ] It is required for binary files
   - [ ] It speeds up writing
   > An explicit encoding makes behavior consistent across machines.
4. Which exception does Python raise when opening a file that does not exist for reading?
   - [ ] KeyError
   - [x] FileNotFoundError
   - [ ] IndexError
   - [ ] ZeroDivisionError
   > The error is specific to missing paths.

# Buffering and Flushing
kind: concept
time: Not applicable — buffering exists to reduce the number of slow operations, but its effect is a constant factor that depends on the device, not a growth rate.
space: Not applicable — a buffer is a small fixed region of memory whose size is chosen by the runtime or the programmer.

## intro
Writing every byte straight to a disk or terminal would be slow, so programs collect output in a buffer and send it in larger chunks. The price is that data can sit in memory for a while, which explains prompts that do not appear, logs missing after a crash and output that arrives out of order.

## theory
Three buffering styles are common:

- Unbuffered — every write goes directly to the device; simple but slow for many small writes
- Line buffered — the buffer is sent when a newline is written; the default for output to a terminal
- Fully (block) buffered — the buffer is sent when it fills up; the default when output is redirected to a file or a pipe

Flushing means forcing the buffer to be sent now. It happens automatically when the buffer fills, when the stream is closed and when the program exits normally. It does not happen if the program is killed or crashes hard, so unflushed data is lost.

In Python:

- `print(..., flush=True)` flushes after printing
- `sys.stdout.flush()` flushes explicitly
- `file.flush()` pushes to the operating system, and `os.fsync(fd)` asks the operating system to write to the physical disk
- The `-u` option or the PYTHONUNBUFFERED variable disables buffering of stdout

Typical symptoms of buffering: a prompt written with `print("Name: ", end="")` not showing before the program waits for input (when output is redirected), logs lagging behind in a long job, and standard output and standard error appearing in a different order from the order of the calls.

## explain
1. Identify where the output goes: terminal (usually line buffered) or file and pipe (usually block buffered).
2. If a message must appear immediately, flush after writing it.
3. Before a long-running operation or a possible crash, flush important data.
4. Prefer closing files through a with block, which flushes for you.
5. For durability, such as a database write-ahead log, flush and then ask the operating system to sync to disk.
6. For performance, avoid flushing after every small write; let the buffer work.

## example
The Python sample builds a buffered writer on top of an in-memory byte stream with a small buffer. After writing two bytes, the underlying stream still holds 0 bytes, because the data is waiting in the buffer. After `flush()` the underlying stream holds 2 bytes. Writing 40 more bytes and flushing again leaves 42 bytes in total. The JavaScript sample uses a writable stream with a tiny high-water mark: the first write returns true, the second returns false, meaning the internal buffer is full and the producer should slow down.

## real
Servers flush log lines so that diagnostics survive a crash, databases flush and sync to guarantee that committed transactions are durable, and shell pipelines depend on programs flushing their output promptly for live progress displays.

## pros
- Buffering greatly reduces the number of slow device operations
- Automatic flushing at close keeps ordinary code simple
- Backpressure from a full buffer protects memory in streaming code

## cons
- Unflushed data is lost if the program crashes or is killed
- Output order between streams can look wrong
- Over-flushing removes the performance benefit

## uses
- Making interactive prompts appear immediately
- Ensuring log lines are written before a risky operation
- Writing large files efficiently
- Controlling flow in stream-based network code

## mistakes
- Expecting data to be on disk right after write returns
- Flushing after every tiny write in a hot loop
- Forgetting to close or flush a file before the program exits abnormally
- Assuming flush guarantees a physical disk write

## interview
**Q:** Why is output often buffered?
**A:** Calls to the operating system and devices are expensive, so collecting many small writes and sending them in one operation is much faster.

**Q:** What is the difference between line buffering and full buffering?
**A:** Line buffering sends the data whenever a newline is written, which suits terminals. Full buffering waits until the buffer is full, which suits files and pipes.

**Q:** What does fsync add beyond flush?
**A:** flush moves data from the program's buffer to the operating system. fsync asks the operating system to push its own cache to the physical device so the data survives a power loss.

## summary
Buffers trade immediacy for speed. Know which kind your stream uses, flush when timing or durability matters, and avoid unnecessary flushing elsewhere.

## codenote
The Python sample makes the hidden buffer visible by looking at the underlying stream before and after a flush. The JavaScript sample shows the signal a full buffer gives to the writer.

## code
### python
```python
import io

raw = io.BytesIO()
writer = io.BufferedWriter(raw, buffer_size=16)

writer.write(b"hi")
print(len(raw.getvalue()))

writer.flush()
print(len(raw.getvalue()))

writer.write(b"x" * 40)
writer.flush()
print(len(raw.getvalue()))
```
Output:
```text
0
2
42
```
### javascript
```javascript
const { Writable } = require("stream");

const chunks = [];
const sink = new Writable({
  highWaterMark: 4,
  write(chunk, encoding, done) {
    chunks.push(chunk.toString());
    // a slow device: completion is reported later, so data waits in the buffer
    setTimeout(done, 10);
  },
});

console.log(sink.write("ab"), sink.write("cdef"));
```
Output:
```text
true false
```

## quiz
1. Why might a prompt not appear before the program waits for input when output is redirected?
   - [ ] The prompt is too short
   - [x] The output is block buffered and has not been flushed
   - [ ] Prompts are never displayed
   - [ ] The input is faster
   > Without a newline-triggered flush or an explicit flush, text can stay in the buffer.
2. What does flush do?
   - [ ] Deletes the file
   - [x] Sends buffered data to the underlying stream immediately
   - [ ] Closes the file
   - [ ] Compresses the data
   > Flushing empties the buffer without necessarily closing the stream.
3. When is unflushed data most likely to be lost?
   - [ ] When the program exits normally
   - [x] When the program is killed or crashes before the buffer is sent
   - [ ] When the file is closed with the with statement
   - [ ] When a newline is written
   > Normal exit and closing flush the buffers.
4. Why not flush after every tiny write?
   - [ ] Flushing is forbidden
   - [x] It defeats buffering and makes many small slow operations
   - [ ] It deletes data
   - [ ] It changes the file encoding
   > Buffering exists to batch small writes into larger ones.

# Parsing Input Safely
kind: concept
time: Not applicable — parsing a short piece of text is proportional to its length and negligible; this lesson is about correctness and safety.
space: Not applicable — safe parsing concerns what to accept and reject, not memory bounds.

## intro
Input from users, files and networks cannot be trusted to have the format you expect. Parsing safely means converting it with explicit rules, rejecting anything outside them and never letting a malformed value reach the rest of the program.

## theory
Principles of safe parsing:

- Treat all external text as untrusted until it has been validated
- Trim whitespace first, so that stray spaces do not cause failures
- Convert with functions that fail loudly, such as `int()`, instead of lenient ones that guess
- Validate the result: range, length, allowed characters and required fields
- Be strict about the format: define exactly what is accepted
- Never evaluate input as code (`eval`) and never build commands or queries by joining raw text

Language details that surprise people:

- Python `int()` accepts surrounding whitespace, a leading plus or minus sign and underscores between digits, but not decimals such as "3.0" or trailing text such as "12abc"
- `str.isdigit()` is true for some characters that `int()` cannot convert, such as superscript digits; `str.isdecimal()` is stricter
- JavaScript `Number("")` and `Number(" ")` are 0, which is rarely what you want, while `parseInt("12abc")` happily returns 12 and `Number("12abc")` returns not-a-number
- A regular expression with anchors, such as `^[+-]?\d+$`, states precisely what a valid integer looks like

Return a clear indication of failure, such as None or an exception, instead of a silent default, so the caller decides what to do.

## explain
1. Specify the accepted format in words: for example, an optional sign followed by one or more digits.
2. Strip whitespace from the ends.
3. Parse with a strict function or a fully anchored pattern.
4. Catch the specific exception the parser raises and turn it into a clear result.
5. Validate the meaning: allowed range, length and relationships between fields.
6. Pass only validated, typed values to the rest of the program.

## example
The Python function `read_int` strips the text, calls `int` and returns None on ValueError. Applied to " 42 " it returns 42, "4 2" and "" and "12abc" and "3.0" all give None, and "+7" gives 7. The side example shows that "²".isdigit() is True while "²".isdecimal() is False, which is why isdigit is not a safe pre-check for int. The JavaScript function `parseIntStrict` accepts only text matching an optional sign and digits, printing 42, null and null, and then the contrast between `Number("")` (0) and `parseInt("12abc")` (12).

## real
Most security vulnerabilities, from injection to crashes on malformed files, begin with input that was accepted too leniently, and robust software spends much of its code on validating what enters.

## pros
- Strict parsing turns bad input into clear errors early
- Anchored patterns document the accepted format
- Typed, validated values simplify the rest of the program

## cons
- Strict rules can reject input a user considers reasonable
- Each format needs its own validation code
- Over-lenient shortcuts such as parseInt hide problems

## uses
- Reading numbers typed by users
- Validating configuration files and form fields
- Parsing command-line arguments
- Sanitising data before it is stored or used in queries

## mistakes
- Using parseInt and ignoring trailing garbage
- Assuming isdigit guarantees a successful int conversion
- Trusting input length and format without checks
- Passing raw input to eval or to a shell

## interview
**Q:** Why should input be validated at the point where it enters?
**A:** After validation every other part of the program can rely on the type and range, and malformed or malicious data cannot spread. Validating late means every function must defend itself.

**Q:** Why is Number("") equal to 0 a problem in JavaScript?
**A:** An empty field becomes a valid-looking zero instead of an error, so missing input can silently turn into data. It is safer to check for an empty string first or use a strict pattern.

**Q:** What is wrong with using eval to parse user input?
**A:** It executes the input as code, so a user can run arbitrary commands. Parsing should use dedicated functions that only recognise the intended data format.

## summary
Strip, parse strictly, validate the meaning and return a clear failure for anything unexpected. Avoid lenient conversions and never execute input.

## codenote
The Python sample shows which texts int accepts and the isdigit pitfall. The JavaScript sample contrasts a strict pattern-based parser with the lenient built-in conversions.

## code
### python
```python
def read_int(text, default=None):
    try:
        return int(text.strip())
    except ValueError:
        return default

for raw in [" 42 ", "4 2", "", "+7", "12abc", "3.0"]:
    print(repr(raw), read_int(raw))

print("²".isdigit(), "²".isdecimal())
```
Output:
```text
' 42 ' 42
'4 2' None
'' None
'+7' 7
'12abc' None
'3.0' None
True False
```
### javascript
```javascript
function parseIntStrict(text) {
  const trimmed = String(text).trim();
  return /^[+-]?\d+$/.test(trimmed) ? Number(trimmed) : null;
}

console.log(parseIntStrict(" 42 "), parseIntStrict("12abc"), parseIntStrict(""));
console.log(Number(""), parseInt("12abc"));
```
Output:
```text
42 null null
0 12
```

## quiz
1. Which text does Python's int() reject?
   - [ ] " 42 "
   - [ ] "+7"
   - [x] "12abc"
   - [ ] "-5"
   > Trailing characters make the text an invalid integer literal.
2. What does Number("") return in JavaScript?
   - [ ] NaN
   - [x] 0
   - [ ] null
   - [ ] An error
   > An empty string converts to zero, which can hide missing input.
3. Why is eval a dangerous way to parse input?
   - [ ] It is too slow
   - [x] It executes the input as code
   - [ ] It only handles integers
   - [ ] It trims the input
   > Anything the user types would run with the program's privileges.
4. What makes an anchored regular expression useful for validation?
   - [ ] It runs faster
   - [x] It requires the entire text to match the stated format
   - [ ] It accepts any text
   - [ ] It converts the text to a number
   > Anchors prevent partial matches from being accepted.
