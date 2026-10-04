# Handling Invalid Input
kind: concept
time: Not applicable — validating one answer costs a handful of comparisons. What matters is how the program behaves when the answer is wrong, not how long the check takes.
space: Not applicable — retry loops keep only the current attempt, so there is no memory bound to analyse.

## intro
Real users type letters where numbers are expected, leave fields empty and paste surprises. A program that handles invalid input explains what went wrong and lets the user try again, instead of crashing or, worse, carrying on with garbage.

## theory
A robust input routine has a predictable shape:

- Prompt clearly, including the expected format and range
- Read the raw text and convert it inside a try block
- Check the meaning of the value: range, length, membership in an allowed set
- On failure, show a specific message and ask again
- Limit the number of attempts, or provide a way to quit, so a script reading from a closed or scripted input cannot loop forever
- Return a clearly defined result for giving up, such as None or an exception

The messages matter. "Invalid input" helps nobody; "Enter a whole number between 0 and 120" tells the user exactly what to fix. Error text should never include sensitive data, and for non-interactive sources (files, network) the same checks should report which record and field failed.

Where to handle errors is a design decision:

- Reject and re-ask: interactive prompts
- Use a default: optional settings, with the default documented
- Skip and log: bulk data where one bad row should not stop the job
- Fail fast: when continuing would corrupt results

Catch specific exceptions (`ValueError`) rather than everything, so unrelated bugs are not hidden.

## explain
1. List the ways an answer can be wrong: not a number, out of range, empty, too long.
2. Write a function that returns a valid value or a clear failure.
3. Wrap it in a loop with a maximum number of attempts.
4. Print a message that names the problem and the expected form.
5. Decide what the program does when the limit is reached.
6. Test with a list of scripted bad and good answers.

## example
The Python sample feeds the answers "abc", "-3", "250" and "42" to a function that asks for an age. The first fails conversion and prints "not a number", the second and third parse but fall outside 0 to 120 and print "out of range", and the fourth is accepted so the function returns 42. The scripted list stands in for a user typing. The JavaScript sample checks three email-like strings and prints "ok", "missing @" and "incomplete address", each message naming the specific rule that failed.

## real
Online forms highlight the faulty field with a message next to it, data import tools produce a report listing which rows were rejected and why, and command-line installers re-ask a question until the answer is usable.

## pros
- Specific messages let users correct mistakes quickly
- Retry loops make programs forgiving without accepting bad data
- Catching specific errors prevents hiding unrelated bugs

## cons
- Every input needs validation code and good wording
- Endless loops are possible without an attempt limit
- Too-strict validation frustrates legitimate users

## uses
- Prompting for ages, quantities and menu choices
- Importing rows from a data file with a rejection report
- Validating form fields in a web application
- Checking command-line options

## mistakes
- Catching every exception and printing a vague message
- Looping forever when input is exhausted
- Accepting a value that parses but is outside the meaningful range
- Showing technical error text to end users

## interview
**Q:** How do you make an input prompt robust?
**A:** Convert inside a try block, validate the range or format, show a specific message on failure, and repeat with a limit on the number of attempts.

**Q:** When is it better to fail fast than to re-ask?
**A:** In non-interactive or automated settings, such as a batch job, where continuing with bad data would corrupt results and no one is present to correct it.

**Q:** Why catch ValueError instead of Exception?
**A:** A specific handler deals only with the expected conversion failure, while a broad one also swallows unrelated errors and makes real bugs invisible.

## summary
Validate every answer, tell the user precisely what is wrong, allow retries within a limit, and choose between re-asking, defaults, skipping and failing based on the situation.

## codenote
The Python sample simulates a user with a list of answers and shows the three outcomes of validation. The JavaScript sample returns one message per failed rule.

## code
### python
```python
answers = iter(["abc", "-3", "250", "42"])

def ask(prompt):
    value = next(answers)
    print(prompt, value)
    return value

def read_age():
    for attempt in range(4):
        text = ask("Age?")
        try:
            age = int(text)
        except ValueError:
            print("  not a number")
            continue
        if not 0 <= age <= 120:
            print("  out of range")
            continue
        return age
    return None

print("result:", read_age())
```
Output:
```text
Age? abc
  not a number
Age? -3
  out of range
Age? 250
  out of range
Age? 42
result: 42
```
### javascript
```javascript
function validateEmail(text) {
  if (!text.includes("@")) return "missing @";
  if (text.startsWith("@") || text.endsWith("@")) return "incomplete address";
  return "ok";
}

for (const text of ["ada@example.com", "ada.example.com", "@example.com"]) {
  console.log(text, "->", validateEmail(text));
}
```
Output:
```text
ada@example.com -> ok
ada.example.com -> missing @
@example.com -> incomplete address
```

## quiz
1. What should an error message for a bad age ideally say?
   - [ ] Invalid input
   - [x] The expected format and range, such as a whole number from 0 to 120
   - [ ] Something went wrong
   - [ ] The Python traceback
   > Specific guidance lets the user fix the problem immediately.
2. Why add a limit to the number of retries?
   - [ ] To make the program faster
   - [x] So a program reading scripted or closed input cannot loop forever
   - [ ] Because users dislike asking twice
   - [ ] To save memory
   > Without a limit, repeated invalid or exhausted input can trap the program.
3. When is skipping an invalid record and logging it a good policy?
   - [ ] When one bad row must stop the whole job
   - [x] In bulk imports where other rows are still valuable
   - [ ] For a login password
   - [ ] Never
   > The report of rejected rows keeps the rest of the data usable.
4. Why catch ValueError rather than every exception?
   - [ ] It is shorter
   - [x] Unrelated bugs are not swallowed by the handler
   - [ ] Python forbids catching Exception
   - [ ] ValueError is the only exception
   > Specific handlers keep real defects visible.

# Competitive Programming I O
kind: concept
time: Not applicable — this lesson is about the mechanics of reading and printing in timed contests, where input handling can matter as much as the logic. It does not analyse an algorithm.
space: Not applicable — the concern is how input is consumed and output assembled, not a space bound.

## intro
In programming contests and online judges, your program is fed fixed-format text on standard input and must produce exactly the expected text on standard output within a time limit. Knowing the usual formats and the fast ways to read and print removes a whole class of avoidable failures.

## theory
Typical conventions:

- No prompts: print only what the problem asks for, because the judge compares output character by character (usually ignoring trailing whitespace, but not extra words)
- The first line often holds the number of test cases, followed by the cases; each case starts with its own sizes and then the data
- Values are separated by spaces or newlines, so token-based reading is the most robust approach
- Answers are printed one per line, or in a format such as `Case #3: 15`
- Limits can be large, so reading a million numbers with a call per number is too slow in some languages

Efficient patterns in Python:

- Read everything once with `sys.stdin.read().split()` and consume tokens through an iterator
- Collect output lines in a list and print them with a single `"\n".join(...)`
- `sys.stdin.readline` is faster than `input()` when called very many times

In JavaScript read all of standard input (for example with `fs.readFileSync(0)`), split on whitespace and build the output as one string.

In C++, the usual speed-up is to disable synchronisation with the C streams (`ios::sync_with_stdio(false)`) and untie `cin` from `cout`. Common pitfalls include integer overflow in sums, off-by-one reading of counts and printing floating-point numbers with the wrong precision.

## explain
1. Read the input specification carefully: the order of values, the limits and the output format.
2. Read all tokens at once and keep an iterator, which makes the structure of the input irrelevant.
3. For each test case, read its parameters, then the data, then compute the answer.
4. Build output lines in a list and print them at the end in one call.
5. Match the output format exactly, including capitalisation and spacing.
6. Test on the sample input from the statement and on edge cases such as the smallest sizes.

## example
The input text is `2`, then `3`, `4 9 2`, `2`, `5 5`: two cases, the first with three numbers and the second with two. The Python sample reads all tokens, takes the case count, and for each case reads its size and that many values. It stores the line `Case #1: 15 9` and `Case #2: 10 5`, each giving the sum and the maximum, and prints both lines with one call to join. The JavaScript sample does the same with a split on whitespace.

## real
Contest judges and automated grading systems run thousands of submissions against identical input files, and the most common reason for a failed submission with correct logic is a formatting or input-reading mistake rather than a wrong algorithm.

## pros
- Token-based reading makes programs insensitive to line layout
- A single bulk read and a single bulk print are fast
- Following the exact format makes results comparable by machine

## cons
- Prompts and debug output, helpful to humans, make an answer wrong
- Fast I/O styles are less readable than the plain versions
- Judges differ in how strictly they compare output

## uses
- Solving problems on online judges
- Preparing for timed technical interviews with stdin input
- Writing test harnesses that feed data through standard input
- Processing large data files quickly

## mistakes
- Printing prompts such as "Enter n:" in a judged program
- Calling input() a million times in a slow language
- Leaving debug prints in the submitted code
- Mishandling the number of test cases in the first line

## interview
**Q:** Why should a judged program not print prompts?
**A:** The judge compares your output with the expected text, so any extra words make the answer wrong even if the numbers are correct.

**Q:** What is a fast way to read large input in Python?
**A:** Read all of standard input at once with sys.stdin.read, split it into tokens and iterate over them, or use sys.stdin.readline when reading line by line.

**Q:** Why build the output in a list and join it?
**A:** One large write is much faster than many small ones, and it makes it easy to check the whole output before printing.

## summary
Read the format precisely, read tokens in bulk, print only what is asked, build output in one piece and test the statement's sample before submitting.

## codenote
Both samples read a case count and then each case's size and values from the same token stream, and print one result line per case.

## code
### python
```python
import io
import sys

sys.stdin = io.StringIO("2\n3\n4 9 2\n2\n5 5\n")

tokens = iter(sys.stdin.read().split())
cases = int(next(tokens))
lines = []
for number in range(1, cases + 1):
    size = int(next(tokens))
    values = [int(next(tokens)) for _ in range(size)]
    lines.append(f"Case #{number}: {sum(values)} {max(values)}")

print("\n".join(lines))
```
Output:
```text
Case #1: 15 9
Case #2: 10 5
```
### javascript
```javascript
const input = "2\n3\n4 9 2\n2\n5 5\n";
const tokens = input.split(/\s+/).filter(Boolean).map(Number);

let position = 0;
const cases = tokens[position++];
const lines = [];
for (let number = 1; number <= cases; number++) {
  const size = tokens[position++];
  const values = tokens.slice(position, position + size);
  position += size;
  lines.push(`Case #${number}: ${values.reduce((a, b) => a + b, 0)} ${Math.max(...values)}`);
}
console.log(lines.join("\n"));
```
Output:
```text
Case #1: 15 9
Case #2: 10 5
```

## quiz
1. Why is printing "Enter a number:" a mistake in a judged program?
   - [ ] It is slow
   - [x] The judge compares the whole output, so extra text makes it wrong
   - [ ] The judge cannot read text
   - [ ] Prompts are encrypted
   > Output must match the expected text exactly.
2. What is a robust way to read the input of unknown layout?
   - [ ] One input() call per character
   - [x] Read all tokens and consume them in order
   - [ ] Guess the line lengths
   - [ ] Use eval
   > Token-based reading ignores where the line breaks are.
3. Why join output lines and print once?
   - [ ] Printing is forbidden otherwise
   - [x] A single large write is faster than many small ones
   - [ ] It converts numbers
   - [ ] It sorts the lines
   > Fewer write operations reduce overhead.
4. In many contest formats, what does the first line usually contain?
   - [ ] The answer
   - [x] The number of test cases
   - [ ] A blank line
   - [ ] The program name
   > The statement tells you the structure, and the case count is a common start.

# JSON and Structured Data
kind: concept
time: Not applicable — converting between text and structures is proportional to the size of the data, which is expected for any parser. The lesson is about the format and its pitfalls.
space: Not applicable — a parsed structure uses memory similar to the text length, but this is not the focus of the lesson.

## intro
JSON is a plain-text format for structured data, and it has become the default way programs exchange information over networks and store settings. Reading and writing it correctly means knowing which values it can represent and what is lost in translation.

## theory
JSON has a small set of building blocks:

- Objects: unordered collections of key-value pairs, written `{"name": "Ada"}`; keys must be strings in double quotes
- Arrays: ordered lists, written `[1, 2, 3]`
- Values: strings in double quotes, numbers, `true`, `false` and `null`

There are no comments, no trailing commas, no single-quoted strings, no dates and no special numbers such as NaN or Infinity in strict JSON.

Mapping between languages:

- Python: dict, list, str, int or float, True or False, None map to object, array, string, number, true or false, null. Tuples become arrays, and dictionary keys that are numbers are turned into strings.
- JavaScript: `JSON.stringify` skips properties whose value is undefined or a function, turns NaN and Infinity into `null`, and converts a Date to an ISO text through its `toJSON` method.

Functions: `json.dumps` and `json.loads` convert to and from text in Python (with `indent` and `sort_keys` for readability and stable output); `JSON.stringify` and `JSON.parse` do the same in JavaScript. Values that JSON cannot represent, such as a Python set, raise TypeError, and malformed text raises JSONDecodeError (Python) or SyntaxError (JavaScript).

Structured data should be validated after parsing: required fields, types and ranges, because a well-formed JSON document can still have the wrong shape.

## explain
1. Decide the structure: which values are objects, which are arrays, and what each field means.
2. Convert program data to a JSON-compatible form, replacing sets, dates and custom objects with lists and text.
3. Serialise with `dumps` or `stringify`, using indentation for files people read and compact output for network traffic.
4. When reading, wrap the parse call in error handling for malformed text.
5. Validate the parsed result before using it.
6. Keep the format versioned or documented, so both sides agree on field names and types.

## example
The Python sample builds a record with a name, a list of scores, a boolean and a None, converts it to text and parses it back. The text reads `{"name": "Ada", "scores": [90, 85], "active": true, "manager": null}` and the round trip gives an equal dictionary containing a list. A second dump with `sort_keys=True` and `indent=2` produces an ordered, readable document, and trying to dump a set raises a TypeError. In JavaScript, a value with undefined, a function, NaN and a date shows what `JSON.stringify` drops or changes, and parsing broken text throws a SyntaxError.

## real
Web APIs send and receive JSON, configuration files such as package manifests and editor settings are JSON, and log aggregators ingest JSON lines so that each event is a structured record.

## pros
- Human-readable and supported by every mainstream language
- Simple enough to parse quickly and reliably
- Nested structures represent most real data

## cons
- No comments, dates or binary data
- Large numbers can lose precision when parsed as floating point
- Verbose compared with binary formats

## uses
- Exchanging data between a web client and server
- Storing application settings and records
- Logging events as structured lines
- Saving and reloading program state

## mistakes
- Trying to serialise objects JSON cannot represent, such as sets
- Writing JSON by hand with single quotes or trailing commas
- Assuming parsed data has the expected fields without checking
- Relying on the order of object keys

## interview
**Q:** Which values can JSON represent?
**A:** Objects, arrays, strings, numbers, true, false and null. Anything else, such as dates, sets, functions or binary data, must be converted to one of these.

**Q:** What happens to undefined in JSON.stringify?
**A:** A property with an undefined value is omitted from objects, and an undefined element in an array becomes null.

**Q:** Why validate after parsing JSON?
**A:** Parsing only proves the text is syntactically valid. The data may still lack required fields or contain values of the wrong type, which must be rejected before use.

## summary
JSON is a simple, universal text format built from objects, arrays and a few primitive values. Know what it cannot represent, handle parse errors, and validate the shape of the data you receive.

## codenote
The Python sample demonstrates round-tripping, ordered output and an unserialisable type. The JavaScript sample shows what stringify drops and a parse failure. The JSON sample is a small record of the kind both programs exchange.

## code
### python
```python
import json

record = {"name": "Ada", "scores": [90, 85], "active": True, "manager": None}
text = json.dumps(record)
print(text)

back = json.loads(text)
print(back == record, type(back["scores"]).__name__)
print(json.dumps({"b": 1, "a": 2}, sort_keys=True, indent=2))

try:
    json.dumps({"tags": {1, 2}})
except TypeError as error:
    print("TypeError:", error)
```
Output:
```text
{"name": "Ada", "scores": [90, 85], "active": true, "manager": null}
True list
{
  "a": 2,
  "b": 1
}
TypeError: Object of type set is not JSON serializable
```
### javascript
```javascript
const value = { a: undefined, b: () => 1, c: NaN, d: new Date(0) };
console.log(JSON.stringify(value));

try {
  JSON.parse("{bad");
} catch (error) {
  console.log(error.name);
}
```
Output:
```text
{"c":null,"d":"1970-01-01T00:00:00.000Z"}
SyntaxError
```
### json
```json
{
  "name": "Ada",
  "scores": [90, 85],
  "active": true,
  "manager": null
}
```

## quiz
1. Which of these is valid in strict JSON?
   - [ ] Single-quoted strings
   - [ ] Comments
   - [x] Double-quoted keys and strings
   - [ ] Trailing commas
   > JSON requires double quotes and does not allow comments or trailing commas.
2. What does JSON.stringify do with a property whose value is undefined?
   - [ ] Writes null
   - [x] Omits the property
   - [ ] Throws an error
   - [ ] Writes the text undefined
   > Undefined and functions are skipped in objects.
3. What does Python raise when dumping a set with json.dumps?
   - [ ] ValueError
   - [x] TypeError
   - [ ] KeyError
   - [ ] Nothing, it becomes a list
   > Sets are not JSON serialisable and must be converted first.
4. Why check the fields after json.loads?
   - [ ] Parsing can silently change values
   - [x] Valid syntax does not guarantee the right fields and types
   - [ ] loads returns text only
   - [ ] The data might be encrypted
   > Syntax validity is separate from the shape your program expects.

# Logging vs Printing
kind: concept
time: Not applicable — a log call costs a small amount of time that depends on the handlers attached. The lesson is about when to choose logging over printing, not a complexity bound.
space: Not applicable — log records are written out as they occur; memory depends on the handler, not on an algorithm.

## intro
Printing shows a program's results; logging records what a program did and why. For anything beyond a small script, a logging system gives levels, timestamps, destinations and control that print statements cannot, and it lets you keep diagnostics in production without drowning users in output.

## theory
Differences between the two:

- Purpose: print produces the program's output for the user or the next program; logging records events for developers and operators
- Levels: logging ranks messages as DEBUG, INFO, WARNING, ERROR and CRITICAL, and you choose a threshold; lower-level messages are dropped without any code change
- Destinations: handlers send records to the console, files, rotating files, syslog or a network service, several at once
- Format: formatters add the time, level, logger name and location in a consistent layout
- Control: you can enable detailed logging for one module in production and turn it off again, which is impossible with scattered prints
- Streams: logging to the console defaults to stderr, keeping standard output free for results

Python's `logging` module has loggers (named, hierarchical), handlers, formatters and levels. A message is formatted lazily: `logger.info("order %d created", 17)` builds the string only if the record will be emitted, which is cheaper than an f-string. In JavaScript the console methods `console.warn` and `console.error` write to stderr, and production code usually uses a logging library with the same ideas.

Good practice: log events with enough context (identifiers, values), never log secrets or personal data, use exceptions with tracebacks for errors, and keep user-facing output separate from diagnostics.

## explain
1. Decide what is output (results the user wants) and what is an event (something that happened).
2. Create a named logger per module rather than using the root logger.
3. Attach a handler and a formatter, and choose a level appropriate to the environment: DEBUG in development, INFO or WARNING in production.
4. Replace diagnostic prints with calls at the right level.
5. Pass values as arguments instead of building strings, so unused messages cost nothing.
6. Review the logs for secrets and add rotation for files.

## example
The Python sample creates a logger named `shop` with a handler writing to standard output so the result can be shown, and a format of level, name and message. The level is INFO, so the debug call produces nothing, while `info` prints `INFO shop: order 17 created` and `warning` prints `WARNING shop: stock low for pen`. The JavaScript sample builds a tiny logger with a minimum level: debug is hidden, and info and warn are printed with a bracketed label.

## real
Production systems collect logs from thousands of machines and search them to diagnose outages; alerts fire on the rate of ERROR records, and developers raise the level temporarily to investigate a single problem.

## pros
- Levels let one codebase serve development and production
- Messages carry timestamps, names and context automatically
- Output can be redirected and rotated without changing the code

## cons
- Setting up handlers and formats takes more effort than a print
- Logging too much slows programs and fills disks
- Sensitive data can leak into logs

## uses
- Recording errors with tracebacks in a server
- Following the steps of a long-running job
- Auditing important events such as logins and payments
- Turning verbose diagnostics on for one component only

## mistakes
- Using print for diagnostics in production code
- Logging passwords, tokens or personal data
- Building the message with string formatting even when the level is disabled
- Configuring logging on the root logger inside a library

## interview
**Q:** Why prefer logging to print for diagnostics?
**A:** Logging gives levels, timestamps, handlers and filtering, so you can keep detailed messages in the code, switch them on only when needed and send them to the right destination.

**Q:** What are the standard logging levels in Python, from lowest to highest?
**A:** DEBUG, INFO, WARNING, ERROR and CRITICAL.

**Q:** Why pass arguments to the logger instead of using an f-string?
**A:** The logger formats the message only if the record will actually be emitted, so disabled messages do not cost the string construction.

## summary
Print is for results; logging is for events. Use named loggers, levels and handlers, keep secrets out of the logs, and pass arguments for lazy formatting.

## codenote
The Python sample configures a logger with a handler and format and shows that a message below the threshold is dropped. The JavaScript sample implements the same threshold idea in a few lines.

## code
### python
```python
import logging
import sys

logger = logging.getLogger("shop")
handler = logging.StreamHandler(sys.stdout)
handler.setFormatter(logging.Formatter("%(levelname)s %(name)s: %(message)s"))
logger.addHandler(handler)
logger.propagate = False
logger.setLevel(logging.INFO)

logger.debug("hidden detail")
logger.info("order %d created", 17)
logger.warning("stock low for %s", "pen")
```
Output:
```text
INFO shop: order 17 created
WARNING shop: stock low for pen
```
### javascript
```javascript
const LEVELS = { debug: 10, info: 20, warn: 30 };

function makeLogger(minimum) {
  return (level, message) => {
    if (LEVELS[level] >= LEVELS[minimum]) {
      console.log(`[${level.toUpperCase()}] ${message}`);
    }
  };
}

const log = makeLogger("info");
log("debug", "hidden");
log("info", "server started");
log("warn", "disk 90 percent full");
```
Output:
```text
[INFO] server started
[WARN] disk 90 percent full
```

## quiz
1. Which Python logging level is the lowest?
   - [ ] INFO
   - [ ] WARNING
   - [x] DEBUG
   - [ ] CRITICAL
   > DEBUG messages are the most detailed and are shown only when the threshold is lowered.
2. Why is logger.info("order %d created", 17) preferable to an f-string?
   - [ ] It prints more digits
   - [x] The message is only built if the record is emitted
   - [ ] f-strings are not allowed
   - [ ] It hides the number
   > Lazy formatting avoids wasted work for disabled levels.
3. Which stream does the default console handler of Python's logging write to?
   - [ ] Standard output
   - [x] Standard error
   - [ ] A file named log.txt
   - [ ] The network
   > Using stderr keeps standard output free for results.
4. What should never be written to logs?
   - [ ] Order numbers
   - [x] Passwords and secret tokens
   - [ ] Timestamps
   - [ ] Log levels
   > Logs are widely accessible and often stored for a long time.

# I O Performance Considerations
kind: concept
time: Not applicable — input and output are limited by devices rather than by an algorithm's steps. What you can control is how many operations you make, and that is a constant-factor concern for this lesson.
space: Not applicable — the trade-off is between reading data in pieces and loading it entirely, which depends on the case rather than a general bound.

## intro
Input and output are among the slowest things a program does: a disk, a terminal or a network is orders of magnitude slower than the processor. Most I/O speed-ups come from making fewer, larger operations and from not waiting when you do not have to.

## theory
The main levers:

- Batch the work: one large write beats thousands of tiny ones, because every call has a fixed overhead for system calls, locks and flushes. In Python, `print` makes a separate write for the text and for the line ending, so a loop of print calls makes twice as many writes as lines.
- Let buffering work: use buffered files, avoid flushing after every line and avoid unbuffered mode unless you need immediacy
- Choose the reading style by size: reading line by line keeps memory small for large files, while reading a small file in one call is simplest and fastest
- Avoid per-character I/O and repeated open and close of the same file
- Reduce what you write: formatting and conversion cost time too, so avoid redundant work such as formatting values that are never shown
- Overlap with other work: asynchronous or streaming I/O lets a program do something else while waiting for a slow device
- Measure: use a timer or profiler on realistic data before optimising, because the bottleneck is often not where intuition suggests

Terminal output is especially slow. Printing a million lines to a console can take far longer than the computation that produced them; redirecting to a file or reducing the output is the fix.

## explain
1. Measure first: find out whether I/O is really the bottleneck.
2. Count operations: how many reads, writes and file opens does the program make per item?
3. Combine small operations: build a string or list and write it once.
4. Keep files open for the duration of the job and use buffered streams.
5. Process large inputs as streams instead of loading them whole.
6. Re-measure to confirm that the change helped.

## example
The Python sample writes the same 100 lines to two in-memory sinks that count how often `write` is called. Using `print` for each line calls write 200 times, once for the text and once for the newline. Joining the lines with newlines and writing them once calls write exactly once, and the final text is identical, so the result shows `200 1 True`. The JavaScript sample counts calls for 100 individual writes versus one joined write, printing `100 1`.

## real
Data pipelines are tuned by batching rows into bulk inserts instead of one insert per row, logging systems buffer records and flush them in groups, and web servers stream large files rather than loading them whole.

## pros
- Fewer, larger operations reduce overhead dramatically
- Streaming keeps memory use steady for huge inputs
- Measuring prevents wasted optimisation effort

## cons
- Batching delays output and can lose data if the program crashes
- Streaming code is more complex than loading everything
- Optimising without measurement often changes nothing

## uses
- Speeding up programs that print or read large amounts of data
- Bulk-loading data into databases and files
- Serving large files without exhausting memory
- Reducing log overhead in busy services

## mistakes
- Printing inside a tight loop to a terminal
- Reading a huge file entirely into memory
- Opening and closing the same file on every iteration
- Optimising I/O without measuring first

## interview
**Q:** Why is one large write faster than many small writes?
**A:** Every write has a fixed cost for the system call and buffer handling, so merging data into a few large writes pays that cost far fewer times.

**Q:** When is it better to stream a file than to read it whole?
**A:** When the file may be larger than available memory, or when you can process each piece independently, because streaming keeps memory use constant.

**Q:** How do you find an I/O bottleneck?
**A:** Measure with a timer or profiler on realistic data and compare the time spent waiting on I/O with the time spent computing.

## summary
Make fewer and larger I/O operations, rely on buffering, stream large data, and measure before and after any change.

## codenote
The Python sample compares the number of write calls made by print and by a single joined write. The JavaScript sample counts calls in the same two styles.

## code
### python
```python
import io

class CountingSink(io.StringIO):
    def __init__(self):
        super().__init__()
        self.calls = 0

    def write(self, text):
        self.calls += 1
        return super().write(text)

lines = [str(n) for n in range(100)]

many = CountingSink()
for line in lines:
    print(line, file=many)

once = CountingSink()
once.write("\n".join(lines) + "\n")

print(many.calls, once.calls, many.getvalue() == once.getvalue())
```
Output:
```text
200 1 True
```
### javascript
```javascript
let calls = 0;
const sink = { write() { calls++; } };

for (let i = 0; i < 100; i++) sink.write(i + "\n");
const individual = calls;

calls = 0;
sink.write(Array.from({ length: 100 }, (_, i) => i).join("\n") + "\n");
console.log(individual, calls);
```
Output:
```text
100 1
```

## quiz
1. Why does print in a loop make twice as many write calls in Python as lines printed?
   - [ ] It writes everything twice
   - [x] It writes the text and the line ending separately
   - [ ] It flushes twice
   - [ ] Python is slow
   > Each print call performs one write for the text and one for the end string.
2. What is usually the best first step when a program is slow at I/O?
   - [ ] Rewrite it in another language
   - [x] Measure where the time is actually spent
   - [ ] Remove all output
   - [ ] Buy a faster disk
   > Measurement shows whether I/O is really the bottleneck.
3. When should you stream a file instead of reading it whole?
   - [ ] When the file is tiny
   - [x] When it may not fit comfortably in memory
   - [ ] When the file is empty
   - [ ] Never
   > Streaming handles large inputs with constant memory.
4. Which output destination is typically slowest for millions of lines?
   - [ ] A file
   - [ ] A pipe
   - [x] A terminal window
   - [ ] An in-memory buffer
   > Rendering text on screen is much slower than writing to a file or memory.

# Cross Platform I O Differences
kind: concept
time: Not applicable — the differences between operating systems concern behavior and compatibility, not running time.
space: Not applicable — they affect how text and paths are represented, not memory use.

## intro
A program that works on one computer can fail on another because Windows, Linux and macOS disagree about line endings, path separators, case sensitivity and default text encodings. Writing portable I/O means using the library features that hide these differences.

## theory
The main differences:

- Line endings: Unix-like systems end a line with a line feed (`\n`), Windows traditionally uses a carriage return and line feed (`\r\n`), and very old Mac systems used a lone `\r`. Text mode translates endings on read and write; binary mode does not, which is why files copied between systems may show stray `\r` characters.
- Path separators: Windows uses a backslash and drive letters (`C:\data\report.txt`), Unix uses forward slashes with a single root (`/home/ada/report.txt`). Joining paths with string concatenation breaks; use `os.path.join` or `pathlib` in Python and `path.join` in Node.
- Case sensitivity: Linux file systems usually distinguish `Report.txt` from `report.txt`, Windows and default macOS volumes do not
- Reserved names and characters: Windows forbids names such as `CON` and characters such as `:` and `?` in file names
- Text encoding: the default may be UTF-8 on one system and a legacy code page on another, so always name the encoding
- Permissions and executable bits exist on Unix and are modelled differently on Windows
- Console behavior: Windows consoles may need different handling for colours and Unicode output

Python's `pathlib` offers pure path classes that let you reason about either style on any machine. `os.linesep` gives the native ending, but when writing files in text mode simply write `\n` and let the runtime translate. When reading files of unknown origin, `splitlines()` handles all conventions.

## explain
1. Never build paths with string concatenation; use the path library.
2. Open text files with an explicit encoding, normally UTF-8.
3. Write `\n` in text mode and let the runtime translate; read with universal newline handling.
4. Treat file names as case sensitive in your logic, even if your development machine is not, so the program works on Linux servers.
5. Avoid characters in file names that are invalid on any target system.
6. Test on every platform you claim to support, or at least in a continuous integration job that runs on several.

## example
The Python sample uses pure path classes so it behaves the same everywhere: a Windows path splits into drive and parts, a Unix path gives its file name and a Windows path its suffix. `"a\r\nb\nc".splitlines()` returns `['a', 'b', 'c']` regardless of which style produced the line endings. A replace of `\r\n` with `\n` normalises text. The Node sample uses the explicit `win32` and `posix` flavours of the path module to join the same parts with different separators, takes a base name from a Windows path and splits text on `\r?\n`.

## real
Teams on mixed Windows, Mac and Linux machines hit these differences constantly: scripts failing because of carriage returns, builds that pass on a laptop but fail on a case-sensitive server, and paths with spaces or drive letters in configuration files.

## pros
- Path and text libraries hide most platform details
- Explicit encodings make files portable
- Universal newline handling reads any line ending

## cons
- Differences still leak through in file names, permissions and consoles
- Case-insensitive development machines hide bugs that surface on servers
- Testing every platform costs time

## uses
- Building command-line tools that run everywhere
- Sharing data files between operating systems
- Writing deployment scripts and build tools
- Handling uploaded files from unknown systems

## mistakes
- Concatenating paths with a hard-coded slash or backslash
- Relying on the platform default encoding
- Writing the carriage return explicitly in text mode
- Assuming file names are case insensitive

## interview
**Q:** Why do text files from Windows sometimes show extra characters on Linux?
**A:** Windows ends lines with carriage return plus line feed, and tools that expect only a line feed show the extra carriage return. Reading in text mode with universal newlines or using splitlines avoids it.

**Q:** How do you build a file path portably?
**A:** Use os.path.join or pathlib in Python and path.join in Node, never string concatenation with a hard-coded separator.

**Q:** Why can a program work on Windows but fail on a Linux server because of file names?
**A:** Linux file systems are usually case sensitive, so a program that opens Report.txt when the file is named report.txt fails there, while Windows treats them as the same file.

## summary
Use library functions for paths and line endings, name encodings explicitly, assume case-sensitive file names and test on every target platform.

## codenote
Both samples use style-specific path classes so the outputs are the same on any host. The line-ending lines show how to read text from any origin.

## code
### python
```python
from pathlib import PurePosixPath, PureWindowsPath

print(PureWindowsPath("C:/data/report.txt").parts)
print(PurePosixPath("/home/ada/report.txt").name, PureWindowsPath("C:\\data\\report.txt").suffix)
print("a\r\nb\nc".splitlines())
print(repr("a\r\nb".replace("\r\n", "\n")))
```
Output:
```text
('C:\\', 'data', 'report.txt')
report.txt .txt
['a', 'b', 'c']
'a\nb'
```
### javascript
```javascript
const path = require("path");

console.log(path.win32.join("data", "reports"), path.posix.join("data", "reports"));
console.log(path.win32.basename("C:\\data\\report.txt"));
console.log("a\r\nb".split(/\r?\n/));
```
Output:
```text
data\reports data/reports
report.txt
[ 'a', 'b' ]
```

## quiz
1. How do Windows text files traditionally end a line?
   - [ ] With a line feed only
   - [x] With a carriage return followed by a line feed
   - [ ] With a semicolon
   - [ ] With a tab
   > Unix-like systems use just the line feed.
2. How should you join path pieces in a portable program?
   - [ ] Concatenate strings with a forward slash
   - [x] Use os.path.join or pathlib
   - [ ] Hard-code the Windows separator
   - [ ] Use spaces
   > Path libraries pick the correct separator for the platform.
3. Why should you specify the file encoding explicitly?
   - [ ] To change the file size
   - [x] The default encoding differs between systems and may garble text
   - [ ] Encodings are optional in every language
   - [ ] To make the file read only
   > Naming the encoding makes the same bytes read the same way everywhere.
4. Which file system behavior commonly breaks code moved from Windows to Linux?
   - [ ] File names become shorter
   - [x] File names become case sensitive
   - [ ] Files lose their contents
   - [ ] Folders cannot be nested
   > A different capitalisation then refers to a different, possibly missing, file.
