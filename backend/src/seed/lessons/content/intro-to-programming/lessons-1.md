# What Is Programming
kind: concept
time: Not applicable — "programming" as a discipline has no running time; what matters in practice is how quickly you can get a correct program, not how fast any one program runs.
space: Not applicable — a program's memory use depends on the program you write, not on programming itself.

## intro
Programming is the craft of describing a task as exact, step-by-step instructions that a computer can follow without guessing. Every app, website, game and smart device you use behaves the way it does because someone wrote instructions like these.

## theory
A program is a sequence of instructions written in a programming language, together with the data those instructions work on. Three ideas hold up almost every program:

- Computers are literal. A computer does exactly what the instructions say, never what you meant. Ambiguity is a bug.
- Instructions are combined in four ways: sequence (do this, then that), selection (do this only if a condition holds), repetition (do this again until done) and abstraction (give a group of steps a name so you can reuse it).
- Data flows through three stages: input (what comes in), processing (what you do to it) and output (what comes out).

A language fixes a vocabulary and grammar (syntax) and fixes what each construct means (semantics). The same idea — "add up the prices in a cart" — can be written in Python, JavaScript or C; only the spelling changes.

## explain
1. State the problem precisely. "Show the cart total" becomes: given the items in a cart and a price for each item, produce the sum of the prices formatted as dollars.
2. Decide what data you need. A mapping from item name to price, and the list of items in the cart.
3. Write the steps in order. Start a running total at zero, look up each item's price, add it to the total, then print the result.
4. Run it. The computer follows the steps from top to bottom.
5. Compare the result with what you expected. If it differs, the instructions are wrong, not the computer — find the step that did something other than you intended.

## example
The cart holds a notebook ($3.50), a pen ($1.25) and a second pen ($1.25). The sample program does this:

- start: total = 0.00
- notebook → price 3.50 → total = 3.50
- pen → price 1.25 → total = 4.75
- pen → price 1.25 → total = 6.00

It then prints `Total: $6.00`. Notice the three stages: the price list and cart are the input, the loop is the processing, and the printed line is the output.

## real
A shop's checkout page runs this same kind of program: it looks up each item's price, adds them up, applies the tax rule and shows the total — thousands of times a minute, identically every time.

## pros
- Turns a repetitive task into something a machine does instantly and identically every time
- Lets one person's solution be copied to millions of users at almost no cost
- Makes ideas testable — you can run a program and see whether the idea actually works

## cons
- The computer cannot guess your intent, so a small mistake in wording produces wrong results or a crash
- Programs need ongoing maintenance as requirements and platforms change
- A correct program takes longer to write than doing a one-off task by hand

## uses
- Websites and mobile apps
- Data analysis and reporting
- Automating repetitive office and system tasks
- Games and simulations
- Embedded software in cars, appliances and medical devices

## mistakes
- Starting to type code before stating exactly what the program should do
- Assuming the computer will "figure out" an obvious step that was left out
- Copying code that works without understanding which part does what
- Testing only the single example you had in mind instead of several different inputs

## interview
**Q:** What is the difference between a program and the programming language it is written in?
**A:** The language is the notation — its syntax and rules. The program is one specific set of instructions written in that notation. The same program logic can be expressed in many languages.

**Q:** Why do programs often behave differently from what their author expected?
**A:** Because the computer executes what was written, not what was meant. The gap is almost always a missing step, a wrong condition, or an unstated assumption about the input.

**Q:** Name the basic building blocks every program is made from.
**A:** Sequence, selection (conditionals), repetition (loops) and abstraction (functions), working on data that flows from input through processing to output.

## summary
Programming is expressing a task as precise instructions that a computer follows literally. Everything else in this course — variables, conditions, loops, functions, data structures — is a tool for writing those instructions clearly and correctly.

## codenote
The program keeps prices in a dictionary, loops over the items in the cart adding each price to a running total, and prints the result: input (prices and cart), processing (the loop), output (the printed total).

## code
### python
```python
prices = {"notebook": 3.50, "pen": 1.25, "folder": 2.00}
cart = ["notebook", "pen", "pen"]

total = 0
for item in cart:
    total += prices[item]

print(f"Total: ${total:.2f}")
```
Output:
```text
Total: $6.00
```
### javascript
```javascript
const prices = { notebook: 3.5, pen: 1.25, folder: 2.0 };
const cart = ["notebook", "pen", "pen"];

let total = 0;
for (const item of cart) {
  total += prices[item];
}

console.log("Total: $" + total.toFixed(2));
```
Output:
```text
Total: $6.00
```

## quiz
1. Why must a program's instructions be precise?
   - [ ] Computers refuse to run programs shorter than ten lines
   - [x] The computer carries out exactly what is written and cannot infer what you meant
   - [ ] Precise instructions make every program run faster
   - [ ] Programming languages do not allow comments
   > A computer has no common sense: a missing or ambiguous step is executed as written, which is why vague instructions become bugs.
2. Which pair names two of the four basic ways instructions are combined?
   - [ ] Compilation and installation
   - [ ] Typing and saving
   - [x] Selection and repetition
   - [ ] Input and hardware
   > Sequence, selection, repetition and abstraction are the four combinators; selection is "if", repetition is a loop.
3. In the cart-total program, which part is the processing stage?
   - [ ] The dictionary of prices
   - [ ] The final print statement
   - [ ] The list of items in the cart
   - [x] The loop that looks up and adds each price
   > Data going in is input, the work done on it (the loop) is processing, and what is shown at the end is output.
4. A program prints $5.50 when the correct total is $6.00. Where should you look first?
   - [ ] At the monitor's display settings
   - [x] At the instructions, to find the step that did something other than you intended
   - [ ] At the computer's processor speed
   - [ ] At the keyboard layout
   > Computers execute faithfully, so a wrong result points to the instructions or the data they were given.

# Programs vs Algorithms
kind: concept
time: Not applicable — the program/algorithm distinction has no running time of its own. (The Euclid's-algorithm example in this lesson takes O(log min(a, b)) steps.)
space: Not applicable — the distinction does not use memory; the Euclid example needs only O(1) extra space.

## intro
An algorithm is an idea — a finite, unambiguous procedure that solves a problem — while a program is that idea written in a specific language for a specific machine. Keeping the two apart lets you design a solution once and implement it anywhere.

## theory
An algorithm has to satisfy five properties (Knuth's list):

- Finiteness — it terminates after a finite number of steps
- Definiteness — every step is precisely and unambiguously specified
- Input — zero or more values supplied before or during execution
- Output — at least one result related to the input
- Effectiveness — every step is basic enough to be carried out exactly

A program is more than an algorithm. It adds a language's exact syntax, choices of data types, reading input and printing output, handling errors, and talking to an operating system. One algorithm can have many programs; one program may contain several algorithms.

An algorithm can be written as plain steps, a flowchart, or pseudocode. It is the method — the same method for finding the greatest common divisor works whether you run it in Python, C or on paper.

## explain
1. Pick a problem with a precise answer. Example: find the greatest common divisor (GCD) of two positive integers.
2. Design the method, ignoring any language. Euclid's algorithm: replace the pair (a, b) by (b, a mod b) until b is 0; the answer is a.
3. Check it terminates. The second number strictly shrinks each round and cannot go below 0.
4. Turn it into a program. Choose a language, name the function, decide how the numbers arrive and how the answer is printed.
5. Add what the algorithm leaves out. Rejecting zero or negative inputs, parsing text into integers, printing a friendly message.

## example
Euclid's algorithm for GCD(48, 18):

- (48, 18) → 48 mod 18 = 12 → (18, 12)
- (18, 12) → 18 mod 12 = 6 → (12, 6)
- (12, 6) → 12 mod 6 = 0 → (6, 0)
- b is 0, so the answer is 6

That list is the algorithm. The Python function below is one program that implements it; a C or Java version would be a different program carrying out the same algorithm.

## real
Navigation apps, databases and encryption libraries all rely on well-known algorithms (shortest path, B-tree search, modular arithmetic) that were designed on paper long before the programs that run them today.

## pros
- Designing the algorithm first lets you reason about correctness before worrying about syntax
- The same algorithm can be reused across languages and platforms
- Separating the two makes it clear which bugs are in the method and which are in the implementation

## cons
- A good algorithm on paper can still become a slow or buggy program if the implementation is careless
- Algorithms ignore practical details — input validation, error handling, units — that a real program must handle
- Some informal descriptions of an "algorithm" are too vague to count as one

## uses
- Choosing between different approaches before writing any code
- Explaining a solution in interviews without committing to a language
- Porting a solution from one language to another
- Documenting a method so others can implement it independently

## mistakes
- Treating any working script as "an algorithm" without checking that it always terminates
- Describing steps vaguely ("sort it somehow") that a machine could not carry out unambiguously
- Confusing speed of the machine with efficiency of the algorithm
- Forgetting that the program must also handle bad input, which the algorithm description usually skips

## interview
**Q:** What properties must a procedure have to be called an algorithm?
**A:** It must be finite (terminate), definite (unambiguous steps), take zero or more inputs, produce at least one output, and be effective (each step is basic enough to execute exactly).

**Q:** Can two different programs implement the same algorithm?
**A:** Yes. A Python function and a C function that both apply Euclid's method are different programs but the same algorithm; they differ in syntax, types and error handling, not in the method.

**Q:** Why do we analyse algorithms rather than programs?
**A:** The algorithm determines how the work grows with input size, independent of language or hardware. A faster computer or language changes constants, not the growth rate.

## summary
An algorithm is the language-independent method; a program is a concrete implementation of one or more algorithms in a particular language. Design the method first, then implement it, and remember the program must also handle everything the algorithm leaves out.

## codenote
The function applies Euclid's method: it repeatedly replaces (a, b) with (b, a mod b) until b is 0. The loop prints each pair so you can compare it with the hand trace above.

## code
### python
```python
def gcd(a, b):
    while b != 0:
        print(f"({a}, {b})")
        a, b = b, a % b
    return a

print("GCD:", gcd(48, 18))
```
Output:
```text
(48, 18)
(18, 12)
(12, 6)
GCD: 6
```
### javascript
```javascript
function gcd(a, b) {
  while (b !== 0) {
    console.log("(" + a + ", " + b + ")");
    [a, b] = [b, a % b];
  }
  return a;
}

console.log("GCD:", gcd(48, 18));
```
Output:
```text
(48, 18)
(18, 12)
(12, 6)
GCD: 6
```

## quiz
1. Which property says an algorithm must stop after a finite number of steps?
   - [x] Finiteness
   - [ ] Definiteness
   - [ ] Effectiveness
   - [ ] Portability
   > Finiteness requires termination; definiteness is about unambiguous steps and effectiveness about steps being basic enough to execute.
2. Euclid's algorithm turns the pair (18, 12) into which pair?
   - [ ] (12, 18)
   - [ ] (6, 12)
   - [x] (12, 6)
   - [ ] (30, 12)
   > The rule is (a, b) → (b, a mod b), and 18 mod 12 = 6, giving (12, 6).
3. A Python function and a C function both implement Euclid's method. How are they related?
   - [ ] They are the same program
   - [ ] They are different algorithms
   - [x] They are different programs implementing the same algorithm
   - [ ] Only the C one is an algorithm
   > The algorithm is the method; each language produces a separate program that carries it out.
4. Which of these belongs to the program but is usually absent from the algorithm description?
   - [ ] The idea of repeatedly reducing the pair
   - [x] Parsing text input into integers and rejecting invalid values
   - [ ] The proof that the loop terminates
   - [ ] The definition of the greatest common divisor
   > Algorithms describe the method; programs add I/O, parsing and error handling for real use.

# Source Code and Compilation
kind: concept
time: Not applicable — compilation is a one-time build cost whose duration depends on program size and the toolchain, not an algorithmic growth rate you reason about with Big-O.
space: Not applicable — what matters here is that the build produces extra artifacts (object files, an executable), not a memory-complexity formula.

## intro
Source code is the human-readable text you write; a computer can only run machine instructions. Compilation is the translation step that turns one into the other, and understanding it explains why some errors appear before your program ever starts.

## theory
Source code is plain text in a programming language. The processor cannot execute it directly, so a translator converts it. A typical compiled pipeline (for example C with `gcc`):

- Preprocessing — expand `#include` and macros
- Compilation — check the syntax and types, then translate each source file into assembly or an object file
- Linking — combine object files and libraries into one executable
- Loading — the operating system places the executable in memory and starts it

Errors fall into three groups by when they are caught: syntax/compile-time errors (the translator refuses to continue), runtime errors (the program starts, then fails — division by zero, missing file), and logic errors (the program runs to the end but produces the wrong answer). Only the first group is found without running the program.

Languages like Python also translate: source text is compiled to bytecode (an intermediate form) which a virtual machine then runs.

## explain
1. You write `hello.c` — just text, which you can open in any editor.
2. The preprocessor expands included headers into the file.
3. The compiler parses the text. If the grammar is broken it reports an error with a line number and stops — no executable is produced.
4. If parsing succeeds, the compiler translates the code to machine-specific instructions in an object file.
5. The linker joins your object file with library code such as the C standard library into one executable.
6. You run the executable; the loader maps it into memory and the CPU begins executing it.

## example
Building a small C program from the command line:

- `gcc -c hello.c` produces `hello.o`, the object file
- `gcc hello.o -o hello` links it into the executable `hello`
- `./hello` runs it

If you delete a semicolon from `hello.c`, step one reports an error such as `expected ';' before 'return'` and produces no `hello.o`. If instead you write `10 / 0` with variables whose values are only known at run time, the build succeeds and the failure appears later, when the program runs — a runtime error.

## real
Large projects such as operating systems and browsers compile thousands of source files; build systems recompile only the files that changed, which is why a change to one file does not take hours to rebuild.

## pros
- Compile-time checks catch many mistakes (typos, type errors) before anything runs
- Compiled executables can be distributed without the source code
- Translating once ahead of time lets the compiler optimise the whole program

## cons
- There is a build step between editing and running, which slows the edit–test loop
- Executables are tied to a platform (operating system and CPU) unless you build for each
- Compiler error messages can be long and cryptic for beginners

## uses
- Building native applications in C, C++, Rust and Go
- Producing bytecode for the Java and Python virtual machines
- Catching syntax and type errors automatically in an editor or CI pipeline
- Shipping software to users without exposing source code

## mistakes
- Editing the source and forgetting to rebuild, then running a stale executable
- Confusing a compile error (nothing runs) with a runtime error (it starts, then fails)
- Ignoring compiler warnings that point at real bugs
- Believing a program that compiles must be correct — compiling only proves the grammar and types are valid

## interview
**Q:** What are the main stages from source code to a running native program?
**A:** Preprocessing, compilation to object code, linking with libraries into an executable, and loading by the operating system. Each stage can fail with its own kind of error.

**Q:** Give an example of an error found at compile time and one found only at run time.
**A:** A missing semicolon or an undeclared variable is rejected at compile time. Dividing by a value that turns out to be zero, or opening a file that does not exist, only fails when the program runs.

**Q:** Does Python compile its source code?
**A:** Yes. CPython compiles source to bytecode (cached on disk for imported modules) and a virtual machine executes that bytecode, so it is compiled and interpreted.

## summary
Source code is human-readable text; a compiler (and, for native programs, a linker) translates it into something a machine can run. Knowing which errors appear at which stage tells you where to look when something breaks.

## codenote
Python's built-in compile turns a string of source into a code object (bytecode) without running it. The sample prints the object's type and the names it references, then executes it — the same translate-then-run split a compiler makes. The JavaScript sample shows a syntax error being caught while parsing, before any code runs.

## code
### python
```python
source = "price = 4\ntotal = price * 3\nprint(total)"

code = compile(source, "<demo>", "exec")   # source text -> bytecode, nothing runs yet
print(type(code).__name__)
print(code.co_names)                       # names the bytecode refers to
exec(code)                                 # now run it
```
Output:
```text
code
('price', 'total', 'print')
12
```
### javascript
```javascript
try {
  new Function("let = ;");        // the parser rejects this before it can ever run
} catch (error) {
  console.log(error.name);
}

console.log(typeof new Function("return 1 + 1"));
```
Output:
```text
SyntaxError
function
```

## quiz
1. In a C build, which stage combines your object file with library code to create the executable?
   - [ ] Preprocessing
   - [ ] Compilation
   - [x] Linking
   - [ ] Loading
   > Linking resolves references to library functions and joins object files into a single executable.
2. A program compiles without errors but prints the wrong total. What kind of error is this?
   - [ ] A syntax error
   - [x] A logic error
   - [ ] A linker error
   - [ ] A preprocessor error
   > The grammar and types were valid, so it built and ran; the instructions themselves were wrong.
3. Which error can be found without running the program?
   - [ ] Dividing by zero because of user input
   - [ ] Opening a file that does not exist
   - [x] A missing semicolon
   - [ ] Using the wrong tax rate
   > Syntax errors violate the grammar and are rejected by the compiler or parser; the other cases only appear while running.
4. What does CPython produce from your source before running it?
   - [ ] A native Windows executable
   - [ ] A PDF listing
   - [x] Bytecode executed by a virtual machine
   - [ ] Nothing — it runs the text directly
   > Python compiles source to bytecode first; the virtual machine then interprets that bytecode.

# Interpreted vs Compiled Languages
kind: concept
time: Not applicable — the compiled-versus-interpreted distinction is about when translation happens, not a growth rate. Practical cost differences (startup time, steady-state speed) vary by language implementation.
space: Not applicable — memory use differs by implementation (an interpreter or virtual machine adds its own runtime), but there is no Big-O result for the distinction.

## intro
Compiled languages are translated to machine code before they run; interpreted languages are translated and executed as they run. In practice most modern languages mix both ideas, so the useful question is when translation happens and what that costs you.

## theory
There are three common models:

- Ahead-of-time (AOT) compiled — e.g. C, C++, Rust, Go. A compiler produces a native executable. Fast to start and fast to run, but you rebuild after each change and build per platform.
- Interpreted — e.g. early shells, classic BASIC. An interpreter reads the source and performs each statement directly. Easy to run anywhere the interpreter exists, but slower per operation.
- Bytecode + virtual machine — e.g. Java, C#, Python. Source is compiled to portable bytecode; a virtual machine runs it. Many VMs add just-in-time (JIT) compilation: hot code is compiled to machine code while the program runs (V8 for JavaScript, the JVM for Java).

"Compiled" and "interpreted" describe an implementation, not the language itself: Python can be compiled (Cython, PyPy's JIT) and C can be interpreted (some REPLs).

## explain
1. In the AOT model you run the compiler once; the output executable runs without the compiler present.
2. In the interpreter model the interpreter must be installed; each run re-reads the source and executes it statement by statement.
3. In the VM model, a compile step turns the source into bytecode; the VM executes bytecode, possibly compiling the busiest parts to machine code on the fly.
4. Choose by the trade-off you need: raw speed and small deployment (AOT), fast iteration and portability (interpreter/VM), or both (VM with JIT).

## example
The Python program below contains a tiny two-phase system. `compile_expr` translates the text `"2 + 3"` into a list of instructions once. `run` is the interpreter loop that executes those instructions, and it can execute the same translated program as many times as you like. Real compilers and virtual machines work the same way, with much richer instruction sets.

## real
Web pages are a mix of all three: JavaScript source is parsed to bytecode in the browser, run by an interpreter first, and the hottest functions are JIT-compiled to native code by engines like V8 while you scroll.

## pros
- Compiled code runs fast and can ship as a single native executable
- Interpreters give instant feedback — run a line and see the result with no build step
- Bytecode VMs let one compiled program run on any platform that has the VM

## cons
- AOT compilation adds a build step and platform-specific binaries
- Pure interpretation is slower per operation than native code
- JIT compilers need warm-up time and extra memory for the compiler itself

## uses
- Choosing a language for performance-critical systems versus quick scripting
- Understanding why Python scripts start instantly but run slower than C
- Explaining why Java and C# programs run on many operating systems
- Picking between shipping source, bytecode, or a native binary

## mistakes
- Saying a language "is" compiled or interpreted, when it is the implementation that decides
- Assuming interpreted always means slow, ignoring JIT compilers
- Believing a compiled program is automatically faster even when the algorithm is poor
- Forgetting that an interpreted program still needs the interpreter installed on the target machine

## interview
**Q:** What is the difference between a compiler and an interpreter?
**A:** A compiler translates the whole program to another form (machine code or bytecode) ahead of running it; an interpreter executes the program directly, translating as it goes. Many systems combine both.

**Q:** What does a JIT compiler do?
**A:** It watches a running program, finds frequently executed code, and compiles that code to native machine code at run time so it runs at near-native speed.

**Q:** Is Java compiled or interpreted?
**A:** Both: javac compiles source to bytecode, then the JVM interprets that bytecode and JIT-compiles hot methods to native code.

## summary
Whether a language is "compiled" or "interpreted" is really about when and how translation happens. AOT compilation favours startup and speed, interpreters favour fast feedback, and bytecode VMs with a JIT try to give you both.

## codenote
compile_expr is the "compiler": it translates the expression text into stack-machine instructions once. run is the "interpreter": it executes those instructions one at a time. Running the already-translated program twice shows that translation is paid once while execution repeats.

## code
### python
```python
def compile_expr(expr):
    """Translate '2 + 3' into stack-machine instructions (done once)."""
    left, op, right = expr.split()
    return [("push", int(left)), ("push", int(right)), ("op", op)]

def run(program):
    """Interpret the instructions one at a time."""
    stack = []
    for instruction, arg in program:
        if instruction == "push":
            stack.append(arg)
        else:
            b, a = stack.pop(), stack.pop()
            stack.append(a + b if arg == "+" else a * b)
    return stack[0]

program = compile_expr("2 + 3")
print(program)
print(run(program))
print(run(program))
```
Output:
```text
[('push', 2), ('push', 3), ('op', '+')]
5
5
```

## quiz
1. Which description best fits Java's normal execution model?
   - [ ] Pure ahead-of-time compilation to a native executable
   - [x] Compilation to bytecode, then execution on a virtual machine that may JIT-compile hot code
   - [ ] Direct interpretation of source text with no translation
   - [ ] Translation to a spreadsheet
   > javac produces bytecode; the JVM runs it and compiles frequently used methods to machine code at run time.
2. What is the main job of a JIT compiler?
   - [ ] To check spelling in comments
   - [x] To compile frequently executed code to native machine code while the program runs
   - [ ] To remove the need for any source code
   - [ ] To encrypt the bytecode
   > JIT stands for just-in-time: it optimises the hot paths during execution.
3. Why is "Python is an interpreted language" an oversimplification?
   - [ ] Because Python has no interpreter
   - [ ] Because Python can only be compiled to .exe files
   - [x] Because CPython compiles to bytecode first, and other implementations such as PyPy use a JIT
   - [ ] Because Python is not a real language
   > Compiled versus interpreted describes an implementation; CPython compiles to bytecode that a VM runs.
4. A team needs one build to run unchanged on Windows, macOS and Linux. Which model helps most?
   - [ ] Native AOT compilation for a single CPU
   - [x] Bytecode run by a virtual machine available on each platform
   - [ ] Hand-writing machine code per platform
   - [ ] Printing the program and typing it again
   > A VM supplies the platform-specific part, so the same bytecode runs everywhere the VM exists.

# The Programming Workflow
kind: concept
time: Not applicable — a workflow is a process, not an algorithm; its "cost" is the number of cycles you need to reach a correct program, which shrinks when you work in small steps and test often.
space: Not applicable — the process has no memory footprint; what grows is the amount of code and tests you must keep consistent.

## intro
Writing software is a loop, not a straight line: understand the problem, plan, write a little, run it, and fix what you find. Working in small, checked steps is what separates calm progress from long debugging sessions.

## theory
A reliable workflow has repeatable stages:

- Understand — restate the problem, list inputs and outputs, and write down two or three concrete examples with expected answers
- Plan — sketch the steps (pseudocode, a list of functions) before typing
- Implement — write the smallest piece you can verify
- Test — run it against the examples, including edge cases (empty input, one item, very large values)
- Debug — when a check fails, find the cause rather than guessing
- Refactor and record — clean up names and duplication, then save the working state (commit)

The loop is short on purpose: the smaller the step between two successful runs, the smaller the set of suspects when something breaks.

## explain
1. Write the examples first: for FizzBuzz, `1 → "1"`, `3 → "Fizz"`, `5 → "Buzz"`, `15 → "FizzBuzz"`.
2. Plan the rule: multiples of 15 first, then of 3, then of 5, otherwise the number itself.
3. Implement just the function `fizzbuzz(n)` — no printing loop yet.
4. Check the function against your examples with assertions. A failing assertion tells you exactly which input is wrong.
5. Only then add the loop that prints 1 to 15.
6. Tidy the code and save the working version.

## example
Suppose your first draft tests `n % 3` before `n % 15`. The assertion `fizzbuzz(15) == "FizzBuzz"` fails immediately and returns `"Fizz"`. Because you only wrote one small function, the cause is obvious: the 15 case must be checked first. Had you written the whole program and printed 100 lines, you would have to hunt through the output to notice that line 15 was wrong.

## real
Professional teams make this loop automatic: a developer writes a small change and a test, runs the test suite locally, and a continuous-integration server repeats the checks on every commit before the change is merged.

## pros
- Small steps keep the set of possible bug locations small
- Writing examples first clarifies the requirements before any code exists
- Saving working states means you can always return to a version that worked

## cons
- Writing examples and checks first feels slower at the very start
- A rigid process can waste time on tiny scripts that do not need it
- Over-planning can delay learning that only running the code would reveal

## uses
- Building any program, from a script to a product, in checked increments
- Learning a new language by solving one tiny task at a time
- Working in a team where others must be able to follow and review each step
- Preparing for coding interviews, where clarifying examples and testing aloud is expected

## mistakes
- Writing a hundred lines before running anything
- Testing only the happy path and never the empty or boundary cases
- Changing several things at once, so you cannot tell which change fixed or broke the result
- Skipping the save-point (commit) until the whole feature is "done"

## interview
**Q:** How do you approach a new programming problem?
**A:** I restate it, work through small examples by hand including edge cases, outline the approach, implement the smallest testable piece, run it against the examples, then extend and refine while keeping each step verified.

**Q:** Why write tests or examples before the full implementation?
**A:** They define what "correct" means, expose misunderstandings early, and give an immediate, specific signal when a change breaks something.

**Q:** What do you do when your program gives the wrong output?
**A:** Reproduce it with the smallest input that fails, check my assumptions step by step (print or use a debugger), form a hypothesis about the cause, change one thing, and re-run.

## summary
The programming workflow is a tight loop of understand, plan, implement, test, debug and save. Keeping every step small and verified is the most effective habit for writing correct code.

## codenote
fizzbuzz is written and checked on its own with assertions before any printing loop exists. The assertions encode the examples from step one, so a wrong rule order would fail on the exact input that exposes it.

## code
### python
```python
def fizzbuzz(n):
    if n % 15 == 0:
        return "FizzBuzz"
    if n % 3 == 0:
        return "Fizz"
    if n % 5 == 0:
        return "Buzz"
    return str(n)

# Step 1 examples, turned into checks
assert fizzbuzz(1) == "1"
assert fizzbuzz(3) == "Fizz"
assert fizzbuzz(5) == "Buzz"
assert fizzbuzz(15) == "FizzBuzz"

# Step 2: only now add the loop
print(", ".join(fizzbuzz(n) for n in range(1, 16)))
```
Output:
```text
1, 2, Fizz, 4, Buzz, Fizz, 7, 8, Fizz, Buzz, 11, Fizz, 13, 14, FizzBuzz
```
### javascript
```javascript
function fizzbuzz(n) {
  if (n % 15 === 0) return "FizzBuzz";
  if (n % 3 === 0) return "Fizz";
  if (n % 5 === 0) return "Buzz";
  return String(n);
}

console.assert(fizzbuzz(15) === "FizzBuzz");
console.assert(fizzbuzz(3) === "Fizz");

const out = [];
for (let n = 1; n <= 15; n++) out.push(fizzbuzz(n));
console.log(out.join(", "));
```
Output:
```text
1, 2, Fizz, 4, Buzz, Fizz, 7, 8, Fizz, Buzz, 11, Fizz, 13, 14, FizzBuzz
```

## quiz
1. Why is it better to write a small function and check it before writing the whole program?
   - [ ] Small functions always run faster
   - [x] When a check fails, only the small piece you just wrote can be the cause
   - [ ] The compiler requires it
   - [ ] It removes the need for any testing later
   > Small verified steps shrink the set of suspects whenever something breaks.
2. In the FizzBuzz plan, why must the multiple-of-15 case be tested first?
   - [ ] Because 15 is the largest number
   - [x] Because 15 is also a multiple of 3 and 5, so an earlier test would answer "Fizz" or "Buzz"
   - [ ] Because Python evaluates the last branch first
   - [ ] Because it makes the loop shorter
   > Branches are checked in order; the most specific condition has to come before the more general ones that it satisfies too.
3. Which set of test inputs best checks FizzBuzz?
   - [ ] Only the number 7
   - [ ] Only numbers above 100
   - [x] A number for each rule (3, 5, 15) and a number matching none of them
   - [ ] Only the numbers the author finds easy
   > Good examples cover each branch of the logic and the "none of the above" case.
4. Your program prints wrong output after you changed four things at once. What is the most effective next step?
   - [ ] Change four more things
   - [ ] Reinstall the language
   - [x] Undo to the last working version and reapply the changes one at a time
   - [ ] Ignore the output
   > Isolating one change at a time identifies which edit introduced the fault.

# Debugging Mindset
kind: concept
time: Not applicable — debugging is a method of investigation, not an algorithm with a running time; its cost is how many hypotheses you must test, which good technique keeps small.
space: Not applicable — the method has no memory footprint. What it uses is evidence: logs, stack traces and reproducible inputs.

## intro
Debugging is finding out why a program does something other than what you intended. Treat it as an investigation — gather evidence, form a hypothesis, test it — instead of a hunt for the line to change.

## theory
Good debugging follows the scientific method:

- Reproduce the problem reliably, ideally with the smallest input that triggers it
- Observe what actually happens (actual output, error, values of variables) and compare it with what you expected
- Hypothesise a specific cause that would explain all the evidence
- Test the hypothesis with one deliberate experiment (a print, a breakpoint, a minimal edit)
- Fix and verify the cause, then confirm no new problem appeared

Useful techniques include print or log debugging, a debugger with breakpoints, divide and conquer (bisecting the code or the input to localise the fault), and rubber-duck debugging — explaining the code aloud line by line until you notice the gap between what you said and what it does.

The mindset matters most: the computer is doing exactly what you wrote. If the result surprises you, one of your assumptions is false — your job is to find which one.

## explain
1. Notice the symptom: `average([2, 4, 6])` returns `4.5`; you expected `4`.
2. Reproduce with a tiny input and keep it fixed while you investigate.
3. Print the intermediate values: the running sum is `12`, the divisor is `4`.
4. Hypothesise: the divisor should be the number of items (3), not `len(values) + 1`.
5. Change that one expression, re-run, and confirm `4.0`.
6. Add an assertion for the case so the bug cannot return unnoticed.

## example
The sample below contains a deliberately buggy `average_buggy`. Printing the sum and the divisor immediately shows the divisor is 4 for three numbers, which points straight at the off-by-one in `len(values) + 1`. The corrected `average` passes the assertion.

## real
In production, engineers cannot attach a debugger to a customer's machine, so they rely on logs, error reports with stack traces and reproducible test cases to follow exactly this reproduce-observe-hypothesise-test cycle.

## pros
- A systematic method finds the real cause instead of masking the symptom
- Narrowing the problem first usually takes far fewer attempts than random changes
- Each bug you track down teaches you something about your own assumptions

## cons
- Bugs that cannot be reproduced reliably (timing, randomness) are slow to investigate
- Inserting prints and then forgetting to remove them leaves noise in the code
- Under pressure it is tempting to guess and change code without evidence

## uses
- Tracking down wrong results, crashes and hangs in your own programs
- Reading someone else's code by watching what it actually does
- Investigating production incidents from logs and traces
- Learning how a library or framework really behaves

## mistakes
- Changing code at random hoping the problem disappears
- Assuming where the bug is without evidence, then looking only there
- Fixing the symptom (patching one bad output) while the cause remains
- Not writing a test after the fix, so the same bug returns later

## interview
**Q:** Walk me through how you debug a failing program.
**A:** I reproduce it with the smallest input, compare actual and expected behaviour, narrow down where state first becomes wrong (prints, a debugger or bisecting), form a specific hypothesis, test it with one change, then confirm the fix and add a regression test.

**Q:** What is rubber-duck debugging and why does it work?
**A:** Explaining your code line by line, even to an inanimate object, forces you to state what each line really does, which often exposes the gap between your assumption and the code.

**Q:** When would you choose a debugger over print statements?
**A:** When I need to inspect many variables, step through control flow, or examine a call stack at the moment of failure; prints are quicker for simple checks or when a debugger cannot attach, such as in production logs.

## summary
Debugging is disciplined investigation: reproduce the failure, observe the evidence, hypothesise, test, fix the cause and lock it in with a test. The computer does what you wrote, so the surprise always comes from a wrong assumption.

## codenote
average_buggy divides by one more than the number of items. Printing the running sum and divisor makes the faulty assumption visible; the corrected function and the assertion show the fix being verified.

## code
### python
```python
def average_buggy(values):
    total = sum(values)
    divisor = len(values) + 1          # the hidden wrong assumption
    print("debug:", "sum =", total, "divisor =", divisor)
    return total / divisor

def average(values):
    return sum(values) / len(values)

print("buggy:", average_buggy([2, 4, 6]))
print("fixed:", average([2, 4, 6]))
assert average([2, 4, 6]) == 4         # keep the case so the bug cannot return
```
Output:
```text
debug: sum = 12 divisor = 4
buggy: 3.0
fixed: 4.0
```

## quiz
1. What should you do first when you discover a bug?
   - [ ] Rewrite the whole function
   - [x] Reproduce it reliably, ideally with a small input
   - [ ] Add random print statements everywhere
   - [ ] Blame the computer
   > A reliable, minimal reproduction lets you test hypotheses and verify the fix.
2. average([2, 4, 6]) returns 3.0 instead of 4.0. What does printing the sum and divisor reveal?
   - [ ] The sum is wrong
   - [ ] The list is empty
   - [x] The divisor is 4, one more than the number of items
   - [ ] Python cannot divide
   > The sum (12) is right; 12 divided by 4 gives 3.0, so the divisor expression is the faulty assumption.
3. Why add an assertion after fixing the bug?
   - [ ] To make the program longer
   - [x] So the same bug is caught automatically if it ever returns
   - [ ] Because assertions are required by Python
   - [ ] To slow down testing
   > A regression check turns a one-time fix into permanent protection.
4. Which technique helps localise a fault by repeatedly cutting the suspect region in half?
   - [ ] Rubber-duck debugging
   - [ ] Syntax highlighting
   - [x] Divide and conquer (bisecting)
   - [ ] Refactoring for style
   > Bisecting the code or the input narrows the failing region quickly, much like binary search.

# Reading Error Messages
kind: concept
time: Not applicable — reading an error message is a skill, not an algorithm. The relevant cost is how quickly you can map the message to a line and a cause.
space: Not applicable — error messages are small text outputs; there is no meaningful memory complexity for the skill itself.

## intro
An error message is the program telling you what failed and where. Learning to read it from the bottom up usually turns a scary wall of text into a precise pointer to the line you need to look at.

## theory
A Python traceback has a fixed anatomy:

- The last line names the exception type and its message — `ValueError: invalid literal for int() with base 10: 'abc'`. Read this first.
- Above it is the stack trace: each frame shows a file, a line number and the source line, with the most recent call last.
- The frame closest to the bottom that is in your code is usually where to start.

Common built-in exception types and what they usually mean:

- `SyntaxError` — the code is not valid grammar; nothing ran
- `NameError` — a name is used before it is defined (often a typo)
- `TypeError` — an operation got a value of the wrong type (`"3" + 4`)
- `ValueError` — the type is right but the value is not (`int("abc")`)
- `IndexError` / `KeyError` — a position or key that does not exist
- `ZeroDivisionError` — division by zero

Other languages differ in wording but share the pattern: an error name, a message, and a location.

## explain
1. Read the last line of the message: the exception type tells you the category, the message tells you the specifics.
2. Find the line number in the lowest frame that points into your own file.
3. Look at that line and the lines just above it — a missing bracket or quote is often reported on the next line.
4. Compare the message with the values involved: print them if needed.
5. Change one thing and run again. If the error changes, you have made progress even if the program is not fixed yet.
6. Copy the exact message into a search engine if it is still unclear — the wording is what other people have asked about.

## example
Running `int("abc")` produces `ValueError: invalid literal for int() with base 10: 'abc'`. The type (`ValueError`) says the argument had the right type (a string) but an unusable value; the message quotes the offending text `'abc'`. The fix is to validate or convert the input, not to change `int`. The code sample triggers four classic errors and prints just the type and message, which is the part worth reading first.

## real
Tools like Sentry and application logs capture the exception type, message and stack trace from production failures, so developers diagnose crashes of software they cannot see by reading exactly these fields.

## pros
- The exception type and message narrow the problem to a category immediately
- Line numbers and stack frames show exactly where and how the failure was reached
- Searching the exact message usually finds explanations and fixes

## cons
- Messages can point to the symptom, not the original cause, further up the call chain
- Syntax errors are sometimes reported one line after the real mistake
- Long frameworks add many stack frames that are not part of your code

## uses
- Locating the line that caused a crash
- Distinguishing a typo from a logic or data problem
- Reporting bugs with the exact information maintainers ask for
- Searching documentation and forums for a precise fix

## mistakes
- Reading the message from the top of the stack trace instead of the bottom
- Fixing the line number mentioned without understanding the message
- Panicking at the length of a trace and ignoring its last line
- Pasting only "it doesn't work" instead of the exact error text when asking for help

## interview
**Q:** In a Python traceback, where do you look first and why?
**A:** At the last line, because it states the exception type and message; then at the lowest stack frame that is in my own code to find the line that triggered it.

**Q:** What is the difference between a TypeError and a ValueError?
**A:** A TypeError means the operation received an object of the wrong type, like adding a string to an int. A ValueError means the type was acceptable but the value was not, like int("abc").

**Q:** A SyntaxError points at a line that looks fine. What do you check?
**A:** The line before it — an unclosed bracket, quote or missing colon there often makes the parser fail on the following line.

## summary
Read the last line of an error first for the type and message, then follow the line numbers into your own code. The exception name tells you the category of mistake, which is usually enough to know what to check next.

## codenote
Each lambda deliberately triggers a different built-in exception. The loop catches it and prints only the exception's type name and message — the two pieces of a traceback you should read first.

## code
### python
```python
tests = [
    lambda: undefined_name,
    lambda: "3" + 4,
    lambda: [1, 2, 3][5],
    lambda: int("abc"),
]

for test in tests:
    try:
        test()
    except Exception as error:
        print(type(error).__name__ + ": " + str(error))
```
Output:
```text
NameError: name 'undefined_name' is not defined
TypeError: can only concatenate str (not "int") to str
IndexError: list index out of range
ValueError: invalid literal for int() with base 10: 'abc'
```

## quiz
1. Which line of a Python traceback names the exception type and message?
   - [ ] The first line
   - [ ] The line in the middle
   - [x] The last line
   - [ ] None — Python hides it
   > Python prints the most recent call last, and the final line gives the exception type and message.
2. What does TypeError: can only concatenate str (not "int") to str tell you?
   - [ ] The string is too long
   - [ ] The integer is negative
   - [x] You tried to add a number to a string without converting one of them
   - [ ] The file is missing
   > The operation + received incompatible types; convert one operand, e.g. with str() or int().
3. int("abc") raises ValueError rather than TypeError. Why?
   - [ ] Because "abc" is a number
   - [x] Because the argument is a string (acceptable type) but its content cannot be converted
   - [ ] Because int is a keyword
   - [ ] Because Python guesses wrongly
   > Right type, wrong value is the definition of ValueError.
4. A SyntaxError is reported on line 12, but line 12 looks correct. Where should you look?
   - [ ] Only line 12 again
   - [x] Just above it, for a missing bracket, quote or colon
   - [ ] At the operating system
   - [ ] At the end of the file only
   > The parser often notices the problem on the next token after the real mistake.
