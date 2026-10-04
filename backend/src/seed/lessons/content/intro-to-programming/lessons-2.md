# Using an IDE Effectively
kind: concept
time: Not applicable — an IDE is a tool, not an algorithm. The cost that matters is your own time: how many keystrokes, searches and debugging rounds it takes to get from an idea to working code.
space: Not applicable — an IDE's memory use depends on the project size and installed extensions; it is not an algorithmic quantity. Large projects and many extensions are what make an editor feel heavy.

## intro
An integrated development environment (IDE) puts the editor, terminal, debugger, search and version control in one window. Using its features deliberately — not just as a text box — is one of the quickest ways to write and fix code faster.

## theory
Most IDEs (Visual Studio Code, IntelliJ IDEA, PyCharm, Visual Studio) share the same building blocks:

- Project explorer — the folder tree of the workspace; open the project folder, not single files, so the tooling can see every file
- Editor intelligence — syntax highlighting, autocomplete, inline error squiggles, hover documentation, go to definition and find all references
- Integrated terminal — a shell opened in the project folder, so you can run the program and tools without switching windows
- Run and debug configurations — saved recipes for how to start your program (which file, arguments, environment)
- Debugger — breakpoints, step over / step into / step out, a variables panel, watch expressions and the call stack
- Search and refactoring — search across all files, and rename symbol that updates every reference safely
- Extensions and formatters — linters, formatters and language support you can add
- Source-control panel — see changed files, diffs, stage and commit without leaving the editor

An IDE does not make code correct; it shortens the loop between writing, running and understanding it.

## explain
1. Open the project folder so the IDE indexes every file and resolves imports.
2. Select the right interpreter or SDK (for Python, the virtual environment) — wrong selection causes false "module not found" warnings.
3. Write with assistance: accept autocomplete, read the squiggles, hover a name to see its type and docs.
4. Navigate by meaning, not by scrolling: go to definition, find references, search by symbol.
5. Run from the editor or terminal using a saved run configuration.
6. Debug instead of guessing: set a breakpoint on the suspicious line, run in debug mode, inspect variables, step line by line.
7. Refactor safely: use rename symbol rather than find-and-replace.
8. Review before you commit: check the diff in the source-control panel.

## example
A debugging session with the sample program: the second order prints the wrong discount and you do not know why.

- Click the gutter next to the `final = apply_discount(...)` line to set a breakpoint.
- Start the Debug configuration. Execution pauses on that line.
- In the Variables panel you see `price = 40.0`, `percent = 10`.
- Step into `apply_discount`; add `discount` as a watch expression and watch it become `4.0`.
- Step over to the `return` line and step out back to the caller; `final` becomes `36.0`.

You confirmed every value without adding a single `print`. The JSON sample is the `launch.json` run configuration that makes the Debug button work for the current file.

## real
Teams commit shared editor settings (formatter, linter rules, run configurations) in the repository so every developer's IDE checks and formats code the same way, which removes style disagreements from code review.

## pros
- Autocomplete and inline errors catch mistakes while you type
- The debugger shows real values and execution flow instead of guesses
- Rename and find-references refactor across many files safely
- Terminal, tests, debugger and version control stay in one window

## cons
- A heavy IDE can feel slow on large projects or with many extensions
- Relying on autocomplete can slow learning of syntax and APIs
- Misconfigured interpreters or paths produce confusing false errors

## uses
- Debugging with breakpoints and watch expressions
- Navigating and refactoring large codebases
- Running tests and programs from saved configurations
- Reviewing changes before a commit

## mistakes
- Opening a single file instead of the project folder, so imports are not resolved
- Using the wrong Python interpreter or SDK and trusting the resulting warnings
- Debugging with scattered print statements when a breakpoint would show everything
- Using find-and-replace to rename a variable and changing unrelated text
- Ignoring squiggles and warnings until the code will not run

## interview
**Q:** What is the difference between a text editor and an IDE?
**A:** A text editor edits text. An IDE integrates language-aware editing (completion, error checking, navigation) with running, debugging, testing and version control in one tool.

**Q:** What do step over, step into and step out do?
**A:** Step over runs the current line without entering any function it calls; step into enters the called function to follow it line by line; step out runs until the current function returns to its caller.

**Q:** Why use "rename symbol" instead of find-and-replace?
**A:** It understands the language, so it renames only references to that exact variable or function (respecting scope), whereas text replacement can change unrelated words, comments or strings.

## summary
An IDE is most useful when you use its navigation, debugger and refactoring tools on purpose. Open the whole project, set the right interpreter, debug with breakpoints instead of guessing, and review diffs before committing.

## codenote
The Python file is a small program worth debugging: put a breakpoint on the line that calls apply_discount and step into it. The JSON is a VS Code launch.json configuration that tells the debugger to run whichever file is currently open.

## code
### python
```python
def apply_discount(price, percent):
    discount = price * percent / 100
    return price - discount

orders = [("book", 40.0, 10), ("lamp", 25.0, 20)]

for name, price, percent in orders:
    final = apply_discount(price, percent)   # breakpoint here, then step into apply_discount
    print(name, final)
```
Output:
```text
book 36.0
lamp 20.0
```
### json
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug current file",
      "type": "debugpy",
      "request": "launch",
      "program": "${file}",
      "console": "integratedTerminal"
    }
  ]
}
```

## quiz
1. Why should you open the project folder rather than a single file?
   - [ ] Single files cannot be saved
   - [x] The IDE can then index every file and resolve imports, search and references
   - [ ] It makes the code run faster
   - [ ] Folders are required to use a keyboard
   > Language features depend on the IDE seeing the whole project, not one isolated file.
2. In the debugger, what does "step into" do on a line that calls a function?
   - [ ] Skips the function and continues
   - [ ] Ends the program
   - [x] Enters the function so you can follow it line by line
   - [ ] Deletes the breakpoint
   > Step into descends into the call, while step over executes it as a single step.
3. What is the main advantage of "rename symbol" over find-and-replace?
   - [ ] It is always faster to type
   - [x] It updates only the real references to that symbol, respecting scope
   - [ ] It rewrites comments automatically
   - [ ] It removes the need for testing
   > The IDE understands what a name refers to, so it avoids changing unrelated text.
4. Your IDE reports "module not found" for a package you installed. What should you check first?
   - [ ] Whether the keyboard is plugged in
   - [x] That the IDE is using the interpreter or environment where the package is installed
   - [ ] The font size
   - [ ] The monitor resolution
   > A mismatch between the selected interpreter and the environment holding the package causes false warnings.

# Version Control Basics
kind: concept
time: Not applicable — version control is a workflow, not an algorithm. Everyday Git commands (commit, branch, switch) are near-instant; cloning or fetching scales with repository size and network speed.
space: Not applicable — a repository stores compressed snapshots, so its size grows with the history you keep and the size of the files you add (large binaries are what inflate it).

## intro
Version control records every change to your files as a history you can inspect, compare, undo and share. Git, the most widely used system, lets you experiment on a separate branch without risking working code and lets many people collaborate on the same project.

## theory
The core vocabulary:

- Repository (repo) — the project plus its complete history, stored in a hidden `.git` folder
- Working tree — the files you actually edit
- Staging area (index) — the set of changes you have chosen to include in the next commit
- Commit — a saved snapshot with an author, a message and a pointer to its parent commit
- Branch — a movable label pointing at a commit, used for independent lines of work (`main` is the usual default)
- Merge — combining the history of one branch into another; a merge conflict happens when both changed the same lines
- Remote — a copy of the repository hosted elsewhere (such as GitHub); clone copies it, push sends your commits, pull fetches and integrates others' commits

The essential cycle is: edit, then stage (`git add`), then commit (`git commit`). Staging lets you build a commit from related changes only. Git is distributed: every clone holds the full history, so most operations work offline.

## explain
1. `git init` creates the repository in the current folder.
2. Edit files, then `git status` to see what changed.
3. `git add <file>` stages the change; `git commit -m "message"` records it permanently.
4. `git switch -c feature/x` creates and moves to a new branch so `main` stays stable.
5. Commit your work on the branch; `git log` shows the history.
6. `git switch main` and `git merge feature/x` bring the finished work into `main`. If both branches edited the same lines, Git stops and marks the conflicts for you to resolve, after which you stage and commit.
7. With a remote: `git clone <url>` to start, `git pull` to get updates, `git push` to publish yours.

## example
The sample creates a project, commits a README, works on a `feature/todo` branch, then merges it back:

- `main` has one commit, "Add README".
- On `feature/todo` you add a line and commit it as "Add todo item".
- Switching to `main` and merging fast-forwards `main` to that commit.
- `git log --format=%s` lists the commit messages newest first: Add todo item, then Add README.

Nothing about the work on the branch touched `main` until the merge — that isolation is the point of branching. (Before your first commit, tell Git who you are with `git config --global user.name` and `git config --global user.email`.)

## real
Open-source projects and companies use branches and pull requests so that every change is reviewed and tested before it joins main, and the history lets them find which commit introduced a bug or roll back a bad release.

## pros
- Complete history lets you see what changed, when and why, and return to any earlier state
- Branches isolate experiments from stable code
- Distributed copies mean no single point of failure and most work happens offline
- Makes collaboration and code review practical

## cons
- Concepts such as staging, rebasing and detached HEAD take time to learn
- Merge conflicts need manual resolution
- Large binary files bloat the repository and are awkward to diff
- Committed secrets stay in the history even after the file is deleted

## uses
- Tracking and sharing a project's history
- Collaborating through branches, pull requests and code review
- Rolling back a faulty change or finding the commit that introduced a bug
- Deploying from a tagged, known-good commit

## mistakes
- Forgetting to commit (or committing everything in one huge, unexplained commit)
- Confusing commit with push — a commit is local until you push it
- Working directly on main instead of a branch
- Committing secrets such as passwords or API keys, or generated files that belong in .gitignore
- Resolving a merge conflict by accepting one side blindly without reading both

## interview
**Q:** What is the difference between git add, git commit and git push?
**A:** git add stages changes for the next commit, git commit records the staged snapshot in the local history, and git push uploads local commits to a remote repository.

**Q:** What is a branch in Git?
**A:** A lightweight, movable pointer to a commit. Creating one is cheap, and it lets you develop a feature or fix independently from main until it is merged.

**Q:** What causes a merge conflict and how do you resolve it?
**A:** Two branches changed the same lines (or one deleted what the other edited), so Git cannot decide automatically. You open the marked file, choose or combine the correct content, remove the conflict markers, stage the file and commit.

## summary
Version control keeps a history of your project as commits, lets you work in isolated branches, and lets teams share and merge work. Learn the edit → add → commit cycle first, then branches, merging and remotes.

## codenote
These shell commands create a repository, commit a README, develop on a branch, merge it into main and list the commit messages. They use only local repositories, so they run anywhere Git is installed.

## code
### bash
```bash
git init -q -b main
echo "# Notes" > README.md
git add README.md
git commit -q -m "Add README"

git switch -q -c feature/todo
echo "- write lesson" >> README.md
git commit -q -am "Add todo item"

git switch -q main
git merge -q feature/todo
git log --format=%s
```
Output:
```text
Add todo item
Add README
```

## quiz
1. What does git commit do?
   - [ ] Uploads your code to GitHub
   - [x] Records the staged changes as a snapshot in the local history
   - [ ] Deletes the working files
   - [ ] Downloads other people's changes
   > Commit saves a snapshot locally; pushing is a separate step that sends commits to a remote.
2. Why create a branch before starting a new feature?
   - [ ] Branches make the code compile faster
   - [x] Work stays isolated from main until it is ready to merge
   - [ ] Git forbids commits on main
   - [ ] Branches delete old history
   > A branch is an independent line of work that does not affect main until you merge it.
3. What is the staging area for?
   - [ ] Storing passwords
   - [ ] Backing up the remote
   - [x] Choosing exactly which changes go into the next commit
   - [ ] Running the tests
   > Staging lets you build a commit from related changes rather than everything modified.
4. You committed a file containing an API key and then deleted the file in a new commit. Is the key safe?
   - [ ] Yes, deleted files vanish from history
   - [x] No, it remains in earlier commits and must be revoked and rotated
   - [ ] Yes, as long as you push
   - [ ] Only on Windows
   > History keeps every committed version, so a leaked secret has to be revoked, not just removed from the latest files.

# Writing Pseudocode
kind: concept
time: Not applicable — pseudocode is a way of describing an algorithm, not an algorithm itself. (The find-the-largest example in this lesson takes O(n) time for a list of n numbers.)
space: Not applicable — writing pseudocode has no memory cost. (The example needs only O(1) extra space: one variable holding the best value so far.)

## intro
Pseudocode describes an algorithm in clear, structured, language-neutral steps. Writing it first lets you check the logic before you fight with syntax, and gives you something you can explain to anyone.

## theory
Pseudocode has no official standard; its job is to be unambiguous to a human reader. Good pseudocode:

- Uses a small set of structure words — `IF / ELSE`, `FOR EACH`, `WHILE`, `RETURN` — and indentation to show blocks
- Names the data (`numbers`, `best`) and says what each step does to it
- Is precise about decisions and loops (what is compared, when the loop ends) but ignores language details such as semicolons, types or imports
- Works at one level of detail — each line is something you could implement in a few lines of code
- Is independent of any language, so it can be translated into Python, Java or C

A common convention is an arrow (`←`) for assignment and `=` for comparison, to avoid the confusion programming languages create between the two.

## explain
1. Restate the task in one sentence: "Return the largest number in a list."
2. Decide the inputs and output: a list `numbers`; the output is one number.
3. Think of the simplest method: remember the biggest value seen so far and update it while scanning.
4. Write each decision and repetition as a structured line.
5. Walk through the pseudocode by hand with a small example, e.g. `[3, 9, 4]`.
6. Translate line by line into code.

## example
Pseudocode for "largest number in a list" (the full listing is in the Real Code section below):

- set best to the first item of numbers
- for each n in numbers: if n is greater than best, set best to n
- return best

Hand trace with `[3, 9, 4]`: start `best = 3`; n = 3 (not greater); n = 9 (greater) so `best = 9`; n = 4 (not greater); return 9. The Python version is a direct translation, one line per pseudocode line.

## real
Engineers sketch pseudocode on whiteboards and in design documents before implementing, and interviewers expect candidates to describe their approach in pseudocode-like steps before writing any code.

## pros
- Lets you validate the logic before dealing with syntax
- Easy to read, review and discuss with non-programmers
- Maps to any programming language

## cons
- With no standard, different people write it differently
- It cannot be run, so mistakes only show up when it is translated into code
- Too much detail makes it as hard to write as the real program

## uses
- Planning a solution before coding
- Explaining an algorithm in documentation or interviews
- Comparing alternative approaches quickly
- Teaching, since it hides language-specific syntax

## mistakes
- Writing vague lines like "sort the data somehow" that cannot be turned into steps
- Copying real code syntax so closely that the pseudocode is just code in disguise
- Never tracing the pseudocode by hand on an example before implementing
- Mixing different levels of detail (one line "process everything", the next an index calculation)

## interview
**Q:** Why write pseudocode before code?
**A:** It separates designing the logic from handling language syntax, makes the plan easy to review and trace, and exposes missing cases early when they are cheap to fix.

**Q:** What makes pseudocode good?
**A:** It is unambiguous, structured with clear conditions and loops, at a consistent level of detail, and independent of any particular language.

**Q:** How would you check that your pseudocode is correct?
**A:** Trace it by hand on small inputs, including edge cases like a single item or all-equal values, and confirm each step does what the description claims.

## summary
Pseudocode is structured, language-free description of an algorithm. Write the steps precisely, trace them by hand on an example, then translate them one line at a time into real code.

## codenote
The text block shows the pseudocode; the Python function is its line-by-line translation. Running it on [3, 9, 4] returns 9, matching the hand trace.

## code
### text
```text
FUNCTION largest(numbers)
    best ← first item of numbers
    FOR EACH n IN numbers
        IF n > best THEN
            best ← n
    RETURN best
```
### python
```python
def largest(numbers):
    best = numbers[0]
    for n in numbers:
        if n > best:
            best = n
    return best

print("largest([3, 9, 4]) =", largest([3, 9, 4]))
```
Output:
```text
largest([3, 9, 4]) = 9
```

## quiz
1. What is the main purpose of pseudocode?
   - [ ] To be executed by the computer
   - [x] To describe the logic clearly without language-specific syntax
   - [ ] To replace testing
   - [ ] To make programs run faster
   > Pseudocode is for human understanding and planning; it cannot be run directly.
2. In the largest-number pseudocode, what happens when n is not greater than best?
   - [ ] best is replaced by n
   - [ ] The function returns immediately
   - [x] best is left unchanged and the loop moves on
   - [ ] The list is cleared
   > Only a larger value updates best, so smaller or equal values change nothing.
3. Which line is too vague to be good pseudocode?
   - [ ] IF n > best THEN best ← n
   - [ ] FOR EACH n IN numbers
   - [x] Process the numbers in a smart way
   - [ ] RETURN best
   > A line must be precise enough to translate directly into code; "smart way" is not a step.
4. What should you do with pseudocode before translating it to code?
   - [ ] Nothing — translate immediately
   - [x] Trace it by hand on a small example to check the logic
   - [ ] Delete the indentation
   - [ ] Run it in a compiler
   > Hand tracing catches logic mistakes while they are cheap to fix.

# Problem Decomposition
kind: concept
time: Not applicable — decomposition is a design technique. Its payoff is that each small function is easier to get right; the total running time depends on the pieces you choose.
space: Not applicable — decomposition itself has no memory cost; splitting a program into functions adds only small call overhead.

## intro
Problem decomposition means breaking a large task into smaller, well-defined sub-problems you can solve and test independently. It is the main way programmers handle problems that are too big to hold in their head at once.

## theory
Key ideas:

- Top-down design — start with the whole task ("print a word-frequency report"), split it into steps, then split any step that is still too big
- Each piece has a clear contract — what it takes in, what it returns, and nothing else it should touch
- Pieces are independent — you can test one function without running the whole program
- Pieces are reusable — a well-defined step such as "normalise the text" can serve other programs
- Stop splitting when a piece is simple enough to write directly in a few lines

A useful test: can you describe each piece in one sentence without using the word "and"? If not, it probably hides two sub-problems.

## explain
1. State the whole problem: given a paragraph of text, print each distinct word with how many times it appears, most frequent first.
2. List the major steps in order: normalise the text, split into words, count the words, sort by count, print.
3. Write each step as a function with an explicit input and output.
4. Check each function alone on a tiny example.
5. Connect them in a short main function that just calls the steps in order.
6. If a step turns out to be complicated, decompose it again.

## example
Decomposing the word-frequency report gives four functions: `normalise(text)` (lowercase, strip punctuation), `count_words(words)` (build a word → count dictionary), `rank(counts)` (sort by count descending, then alphabetically), and a main function that wires them together. Testing `count_words(["a", "b", "a"])` by itself is easy, whereas hunting a wrong total inside one 40-line function would not be.

## real
A web service handling a "place order" request is decomposed into validate input, check stock, charge payment, record the order and send confirmation — each owned by a separate function or service so teams can build and test them independently.

## pros
- Each piece is small enough to understand, test and debug on its own
- Pieces can be reused in other programs
- Different people can work on different pieces in parallel
- Changes stay local to the piece that needs them

## cons
- Too many tiny pieces make the program harder to follow
- A poor split creates pieces that depend on each other's internals
- Passing data between pieces adds some overhead

## uses
- Designing any program larger than a few lines
- Dividing work among team members
- Breaking interview problems into manageable parts
- Locating a bug by testing the pieces one at a time

## mistakes
- Writing one huge function that does everything
- Splitting by arbitrary line count instead of by purpose
- Letting pieces share hidden global state so they cannot be tested alone
- Skipping the "contract" (inputs and outputs) and discovering the mismatch only at integration

## interview
**Q:** How do you break down a large problem?
**A:** I identify the main stages in order, define each stage's input and output, split any stage that is still too big, and implement and test each small piece before combining them.

**Q:** What makes a good sub-problem?
**A:** It has a single clear purpose, a defined input and output, and can be tested independently of the rest of the program.

**Q:** Why does decomposition help debugging?
**A:** If each piece is tested separately, a failing end-to-end result points to the one piece or connection that is wrong instead of the whole program.

## summary
Decompose a big problem top-down into pieces with clear inputs and outputs, test each piece alone, then compose them. Stop splitting when a piece is simple enough to write directly.

## codenote
The word-frequency report is built from three single-purpose functions and a short main flow. Each can be tested on its own, and the output confirms that the pieces fit together.

## code
### python
```python
import re

def normalise(text):
    return re.sub(r"[^a-z\s]", "", text.lower())

def count_words(words):
    counts = {}
    for word in words:
        counts[word] = counts.get(word, 0) + 1
    return counts

def rank(counts):
    return sorted(counts.items(), key=lambda pair: (-pair[1], pair[0]))

text = "The cat saw the dog. The dog saw the cat!"
for word, count in rank(count_words(normalise(text).split())):
    print(word, count)
```
Output:
```text
the 4
cat 2
dog 2
saw 2
```
### javascript
```javascript
const normalise = (text) => text.toLowerCase().replace(/[^a-z\s]/g, "");

function countWords(words) {
  const counts = {};
  for (const word of words) counts[word] = (counts[word] || 0) + 1;
  return counts;
}

const rank = (counts) =>
  Object.entries(counts).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));

const text = "The cat saw the dog. The dog saw the cat!";
for (const [word, count] of rank(countWords(normalise(text).split(/\s+/)))) {
  console.log(word, count);
}
```
Output:
```text
the 4
cat 2
dog 2
saw 2
```

## practice
count-vowels-in-string

## quiz
1. What is a good way to decide whether a piece is small enough?
   - [ ] It has exactly ten lines
   - [x] You can describe its purpose in one sentence without "and"
   - [ ] It never calls another function
   - [ ] It has no inputs
   > A piece that needs "and" to describe it probably contains two sub-problems.
2. Why define each piece's input and output before coding it?
   - [ ] It is required by the compiler
   - [x] So the pieces fit together and can be tested independently
   - [ ] It makes the program shorter automatically
   - [ ] Because comments are mandatory
   > Contracts let you build and verify pieces in isolation and connect them without surprises.
3. In the word-frequency example, which function should handle punctuation and capital letters?
   - [ ] rank
   - [ ] count_words
   - [x] normalise
   - [ ] The main flow after printing
   > Cleaning the text is the job of normalise, so counting and ranking can assume tidy words.
4. The total output is wrong but you have tests for each piece that pass. Where is the bug most likely?
   - [ ] In every function
   - [x] In how the pieces are connected or in a case the tests did not cover
   - [ ] In the operating system
   - [ ] Nowhere — tests cannot be wrong
   > Passing unit tests narrow the fault to the wiring between pieces or to missing test cases.

# Computational Thinking
kind: concept
time: Not applicable — computational thinking is a way of approaching problems rather than an algorithm. (Individual solutions you produce with it do have running times you can analyse later.)
space: Not applicable — it describes mental techniques, not a data structure; there is no memory cost to measure.

## intro
Computational thinking is the set of habits programmers use to turn a messy real-world problem into something a computer can solve: break it down, spot patterns, ignore irrelevant detail, and write precise steps. You can use it without writing any code.

## theory
Four widely taught pillars:

- Decomposition — splitting a problem into smaller parts
- Pattern recognition — noticing similarities within or between problems, so one solution can be reused
- Abstraction — keeping the details that matter and ignoring those that do not (a subway map ignores real distances and shows only stations and connections)
- Algorithm design — writing the precise, ordered steps that solve the problem

Evaluating the solution (is it correct? is there a simpler or faster way?) and generalising it (does it work for any input of this kind, not just my example?) complete the loop.

## explain
1. Take a concrete problem: "Add up the squares of the even numbers in a list."
2. Decompose: pick the even numbers → square each → add them.
3. Recognise the pattern: "go through a collection, keep some items, transform them, combine" appears everywhere.
4. Abstract: the actual numbers do not matter; only the rule "even", the transformation "square" and the combination "sum".
5. Design the algorithm: loop over items; if even, add its square to a total.
6. Generalise and test: try an empty list (answer 0), all-odd numbers (0) and negatives.

## example
Planning a school timetable is the same style of thinking. Decompose it into rooms, teachers, classes and time slots. Recognise the pattern of constraints ("a teacher cannot be in two places"). Abstract each class to just a name, a teacher and a length. Design steps that place classes one by one and check conflicts. None of that needed a computer, but it produces exactly the structure a program needs. The code sample applies the same moves to the squares-of-evens task.

## real
Search engines, route planners and recommendation systems all rest on abstraction (reducing a map to nodes and roads or a user to a list of interests) followed by algorithms over those abstractions.

## pros
- Gives a repeatable method for problems you have never seen before
- Helps reuse earlier solutions through pattern recognition
- Applies beyond programming, to planning and analysis

## cons
- Over-abstracting can discard a detail that actually matters
- Seeing patterns that are not really there can lead to the wrong reuse
- Needs practice before it becomes automatic

## uses
- Approaching unfamiliar interview and coursework problems
- Modelling real-world systems (maps, schedules, networks) as data
- Designing reusable functions from repeated code
- Explaining a solution clearly to someone else

## mistakes
- Jumping to code without decomposing the problem first
- Abstracting away a constraint that changes the answer
- Solving only the single example given instead of generalising
- Forgetting to evaluate whether a simpler solution exists

## interview
**Q:** What are the four pillars of computational thinking?
**A:** Decomposition, pattern recognition, abstraction and algorithm design.

**Q:** What is abstraction, with an example?
**A:** Hiding or ignoring unnecessary detail to focus on what matters. A subway map shows only stations and connections, not exact distances or street layouts.

**Q:** How does pattern recognition make you a faster problem solver?
**A:** Many problems share a structure (filter-then-transform-then-combine, two pointers, grouping). Recognising it lets me reuse a known approach instead of starting from scratch.

## summary
Computational thinking is decomposing, spotting patterns, abstracting away irrelevant detail and designing precise steps, then evaluating and generalising the result. It is the thinking that comes before any code.

## codenote
The Python function expresses the pattern "keep some items, transform them, combine": filter the evens, square them, sum. The checks cover the general cases — empty input and all-odd input — not just the example.

## code
### python
```python
def sum_of_even_squares(numbers):
    return sum(n * n for n in numbers if n % 2 == 0)

print(sum_of_even_squares([1, 2, 3, 4]))   # 4 + 16
print(sum_of_even_squares([]))             # nothing to add
print(sum_of_even_squares([1, 3, 5]))      # no evens
```
Output:
```text
20
0
0
```
### javascript
```javascript
const sumOfEvenSquares = (numbers) =>
  numbers.filter((n) => n % 2 === 0).reduce((total, n) => total + n * n, 0);

console.log(sumOfEvenSquares([1, 2, 3, 4]));
console.log(sumOfEvenSquares([]));
console.log(sumOfEvenSquares([1, 3, 5]));
```
Output:
```text
20
0
0
```

## practice
check-palindrome-string

## quiz
1. A subway map shows stations and connections but not the real distances. Which pillar does this illustrate?
   - [ ] Decomposition
   - [x] Abstraction
   - [ ] Debugging
   - [ ] Compilation
   > Abstraction keeps the details that matter and ignores the rest.
2. "Filter, transform, then combine" appears in many different problems. Spotting this is:
   - [ ] Decomposition
   - [ ] Syntax checking
   - [x] Pattern recognition
   - [ ] Linking
   > Recognising a shared structure lets you reuse an approach across problems.
3. Why test the sum-of-even-squares function with an empty list?
   - [ ] Empty lists are slow
   - [x] To check that the solution generalises correctly to edge cases
   - [ ] Because Python crashes on lists
   - [ ] To make the output longer
   > Generalising means the method works for every valid input, including the empty one.
4. Which is the first step when applying computational thinking to a big problem?
   - [ ] Write the final code
   - [x] Break the problem into smaller parts
   - [ ] Optimise the slowest line
   - [ ] Choose a font
   > Decomposition makes the rest — patterns, abstraction, algorithm design — tractable.

# Career Paths in Software
kind: concept
time: Not applicable — a career path is not an algorithm. The time that matters is yours: depth in a role typically takes years of practice, while the foundations in this course take months.
space: Not applicable — there is no memory cost; careers are described by roles and skills, not data structures.

## intro
"Software engineer" covers many different jobs. Knowing the main paths helps you choose what to learn next and see how the fundamentals in this course — programming, data structures and algorithms — show up in each role.

## theory
Common roles and what they focus on:

- Front-end engineer — builds what users see and click in the browser (HTML, CSS, JavaScript, UI frameworks, accessibility, performance)
- Back-end engineer — builds servers, APIs and business logic (databases, authentication, scaling, reliability)
- Full-stack engineer — works across both front end and back end
- Mobile engineer — builds iOS and Android apps (Swift, Kotlin, or cross-platform tools)
- Data analyst / data engineer / data scientist — analyse data, build data pipelines, or build models (SQL, Python, statistics)
- Machine-learning engineer — trains, deploys and monitors ML models in production
- DevOps / site-reliability engineer — automates deployment, infrastructure and monitoring so services stay up
- Security engineer — finds and prevents vulnerabilities
- QA / test automation engineer — designs tests and tooling that verify software works
- Embedded / systems engineer — writes low-level software for devices, operating systems and performance-critical code

Everywhere you will need clear problem solving, version control, testing and communication. Data structures and algorithms matter most for interviews, performance-sensitive code and systems work.

## explain
1. Explore by building small projects in different areas: a web page, a script that processes a file, a simple API.
2. Notice what you enjoy — visual work, data puzzles, systems and reliability, or building tools for other developers.
3. Learn the shared core first: one language well, version control, debugging, basic data structures and algorithms.
4. Specialise gradually by adding the role's tools (a front-end framework, SQL and a database, cloud and containers).
5. Show your work with projects and a portfolio, and keep learning — tools change faster than fundamentals.

## example
One small task looks different in three roles. A data analyst computes the average order value from a list of orders. A back-end engineer writes the function that handles an "order total" request and returns JSON. A DevOps engineer counts error lines in a log to see whether a deployment is healthy. The three code samples are exactly those tasks — different goals, same programming fundamentals.

## real
A typical product team combines several of these roles: front-end and back-end engineers build features, a data engineer feeds analytics, QA automates tests, and DevOps keeps the whole service deployed and monitored.

## pros
- Many paths exist, so you can match a role to your interests
- Core skills (programming, debugging, version control) transfer between roles
- Demand is broad across industries, not just technology companies

## cons
- The number of tools and roles can be overwhelming for beginners
- Specialising deeply can make switching roles harder
- Technologies change quickly, so continuous learning is required

## uses
- Choosing which topics and tools to study next
- Preparing for interviews targeted at a specific role
- Understanding how teams are organised
- Planning a long-term learning path

## mistakes
- Trying to learn every tool at once instead of mastering fundamentals first
- Choosing a path only for salary headlines without trying the work
- Neglecting soft skills such as communication and collaboration
- Treating a job title as a guarantee of what the daily work will be

## interview
**Q:** What is the difference between front-end and back-end development?
**A:** Front-end code runs in the user's browser or app and shapes what users see and interact with; back-end code runs on servers, handling data, business logic, security and APIs.

**Q:** What does a DevOps or site-reliability engineer do?
**A:** They automate building, deploying and monitoring software and manage the infrastructure so that services are reliable, scalable and recoverable.

**Q:** Which skills are common to almost every software role?
**A:** Programming in at least one language, debugging, version control, writing and reading tests, and communicating clearly with teammates.

## summary
Software careers range from front-end and back-end to data, ML, DevOps, security, QA and embedded work. Build the shared fundamentals first, explore with small projects, and specialise as you learn what you enjoy.

## codenote
One everyday task per role: a data analyst's average order value (Python), a back-end handler that builds an order-total response (JavaScript), and a DevOps-style count of error lines in a log (shell).

## code
### python
```python
orders = [24.0, 18.5, 31.5, 26.0]
average = sum(orders) / len(orders)
print(f"Average order value: ${average:.2f}")
```
Output:
```text
Average order value: $25.00
```
### javascript
```javascript
// Back-end style: handle a request and return a JSON-shaped response
function handleOrderTotal(items) {
  const total = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  return { status: 200, body: { total: Number(total.toFixed(2)) } };
}

console.log(JSON.stringify(handleOrderTotal([{ price: 9.99, qty: 2 }, { price: 5, qty: 1 }])));
```
Output:
```text
{"status":200,"body":{"total":24.98}}
```
### bash
```bash
printf 'INFO start\nERROR disk full\nINFO retry\nERROR timeout\n' > app.log
grep -c ERROR app.log
```
Output:
```text
2
```

## quiz
1. Which role is mainly responsible for the part of an application running in the user's browser?
   - [ ] Back-end engineer
   - [x] Front-end engineer
   - [ ] Site-reliability engineer
   - [ ] Database administrator only
   > Front-end engineers build the browser-side interface that users see and interact with.
2. Which skill is shared by almost every software role?
   - [ ] Writing machine code by hand
   - [ ] Designing logos
   - [x] Debugging and version control
   - [ ] Soldering circuits
   > Debugging and version control are used in every kind of software work.
3. Counting error lines in a log to check a deployment's health best fits which role?
   - [ ] Mobile app designer
   - [x] DevOps or site-reliability engineer
   - [ ] Front-end animator
   - [ ] Technical illustrator
   > Monitoring and verifying running systems is a core DevOps/SRE responsibility.
4. What is a sensible way for a beginner to decide on a path?
   - [ ] Pick the one with the highest advertised salary and ignore everything else
   - [x] Build small projects in different areas, learn the shared fundamentals, then specialise
   - [ ] Learn every framework before writing a program
   - [ ] Wait until you are an expert in all areas
   > Exploration plus solid fundamentals lets you discover what you enjoy before committing.

# Setting Up Your Learning Environment
kind: concept
time: Not applicable — setting up an environment is a one-time task, not an algorithm. A good setup is measured by how little time it takes you to go from an idea to running code.
space: Not applicable — disk and memory needs depend on the tools you install (a language runtime and an editor use a few hundred megabytes), not on an algorithmic formula.

## intro
A reliable setup — a language runtime, an editor, a terminal, version control and a tidy project folder — removes friction so you can spend your time learning to program instead of fighting your tools. Setting it up once and verifying it works saves hours later.

## theory
What a beginner-friendly environment needs:

- A language runtime — for this course, Python 3 (and Node.js for JavaScript examples). The runtime runs your code.
- A code editor or IDE — such as Visual Studio Code, with the language extension installed
- A terminal — to run programs and tools (`python`, `node`, `git`)
- Version control — Git installed and configured with your name and email
- A project layout — one folder per project (for example `learn-dsa/week1/`), kept out of system folders
- An isolated environment for dependencies — a Python virtual environment (`python -m venv .venv`) keeps one project's packages from affecting another

"Works on my machine" problems usually trace back to different versions or missing tools, so check versions deliberately.

## explain
1. Install the runtime from the official site or your package manager, and tick the option to add it to your PATH on Windows.
2. Verify it by opening a new terminal and running `python --version` (or `python3 --version`).
3. Install an editor and its Python extension; open your project folder in it.
4. Install Git and set `git config --global user.name` and `user.email`.
5. Create a project folder and, inside it, a virtual environment: `python -m venv .venv`, then activate it.
6. Write and run a first script in the editor's terminal to prove everything is wired together.
7. Commit the folder to a Git repository as your first save point.

## example
You create `learn-dsa/week1`, open `learn-dsa` in the editor, and write `check.py` that tests the Python version. The terminal prints `Python ok`. The shell sample shows the folder setup commands, and `ls` confirms the `week1` folder exists. If the version check had printed `Upgrade Python`, you would know the problem before starting any lesson instead of in the middle of one.

## real
Companies provide new hires a scripted setup (a README, a setup script or a development container) that installs the right versions and tools, so everyone starts from the same, working environment.

## pros
- Verifying the setup once prevents confusing failures later
- Virtual environments keep each project's dependencies separate
- A consistent folder layout makes projects easy to find and share

## cons
- Initial installation and PATH configuration can be fiddly on some systems
- Multiple Python versions installed side by side can cause confusion
- Tools and versions change over time, so instructions age

## uses
- Preparing a new computer for programming
- Starting a course or project with a known-good toolchain
- Reproducing a teammate's environment
- Isolating a project's dependencies with a virtual environment

## mistakes
- Editing PATH or installing the runtime and then not opening a new terminal before testing
- Installing packages globally and breaking another project
- Saving projects in random folders, including system directories
- Skipping the first "hello world" check and discovering a broken install later
- Mixing up python and python3, or running a different version than the editor uses

## interview
**Q:** What is a Python virtual environment and why use one?
**A:** An isolated folder containing its own Python and installed packages. It prevents version conflicts between projects and makes dependencies reproducible.

**Q:** Why do you set user.name and user.email in Git?
**A:** Every commit records an author. Without them Git cannot attribute your commits (and may refuse to commit).

**Q:** How do you check which Python version a script will run on?
**A:** Run python --version in the same terminal that will run the script, or print sys.version from inside it — and make sure the editor is configured to use that same interpreter.

## summary
Install a runtime, an editor and Git, keep each project in its own folder with a virtual environment, and verify the whole chain with a first script. A checked setup removes a whole class of confusing problems.

## codenote
The Python script checks the version and prints a clear result. The shell commands create the project folders and list them to confirm the structure.

## code
### python
```python
import sys

print("Python ok" if sys.version_info >= (3, 9) else "Upgrade Python")
```
Output:
```text
Python ok
```
### bash
```bash
mkdir -p learn-dsa/week1
cd learn-dsa
ls
```
Output:
```text
week1
```

## quiz
1. After installing a new tool and changing PATH, why open a new terminal before testing?
   - [ ] Terminals expire daily
   - [x] An already-open terminal keeps the old environment, so it may not see the change
   - [ ] To clear the screen
   - [ ] New terminals run faster
   > Environment variables are read when a terminal starts; changes apply to new sessions.
2. What problem does a virtual environment solve?
   - [ ] It speeds up the CPU
   - [x] It isolates each project's packages so versions do not conflict
   - [ ] It encrypts your code
   - [ ] It removes the need for Git
   > Per-project dependencies avoid one project's packages breaking another.
3. Why configure Git's user.name and user.email?
   - [ ] They are your login for GitHub only
   - [ ] They make commits smaller
   - [x] They identify the author of each commit
   - [ ] They install Python
   > Every commit records an author, so Git needs your name and email.
4. Your editor says a package is missing, but you installed it in the terminal. What is the likely cause?
   - [ ] The package is corrupted by the keyboard
   - [x] The editor is using a different Python interpreter than the one you installed into
   - [ ] Packages only work at night
   - [ ] Python no longer exists
   > Two Python installations (or environments) are common; make the editor use the one that has the package.
