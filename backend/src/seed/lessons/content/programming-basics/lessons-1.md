# Syntax and Semantics
kind: concept
time: Not applicable — syntax and semantics are properties of a language, not of a running algorithm. Checking syntax is part of compiling or parsing and is fast compared with running the program.
space: Not applicable — they describe rules about code, not data held in memory.

## intro
Syntax is the grammar of a programming language: which sequences of symbols count as a valid program. Semantics is what a valid program actually means and does. A program can have perfect syntax and still do the wrong thing.

## theory
Every language defines two separate layers of rules:

- Syntax — the form. Where the brackets, colons, keywords and operators may appear. The parser checks it before anything runs, and a violation produces a syntax error.
- Semantics — the meaning. What each valid construct does when executed, including the types involved and the order of evaluation.

Two kinds of mistakes follow from this:

- A syntax error means the code is not a legal sentence of the language, so nothing runs.
- A semantic error (a logic error) means the code is legal and runs, but does not mean what you intended.

The same text can even mean different things in different languages. In Python, `7 / 2` is `3.5` and `7 // 2` is `3`; in C, `7 / 2` between two integers is `3`. The symbols are valid in both, the semantics differ.

## explain
1. The parser reads your source and checks it against the grammar. If a rule is broken, it reports the location and stops.
2. If the grammar is satisfied, the program is turned into something executable.
3. At run time each construct is carried out according to its semantics: types are checked (in some languages), operators are applied, functions are called.
4. A result you did not expect after step 3 is a semantic mistake. The parser could not have caught it, because the code was well formed.
5. To tell the two apart, ask: did the program start? If it refused to start, look for a syntax problem. If it ran and gave wrong output, look at the meaning of what you wrote.

## example
Take three small snippets. `7 / 2` is valid and evaluates to 3.5. `7 // 2` is also valid and evaluates to 3 — same shape, different meaning, because `//` is floor division. `7 /` is not valid at all: an operator is missing its right operand, so the parser rejects it before evaluating anything. The sample program evaluates each one and reports what happens.

## real
Editors underline syntax errors as you type because the grammar can be checked instantly, while tests and code review are needed for semantic mistakes such as using the wrong rounding rule in a price calculation.

## pros
- Strict syntax lets tools highlight, autocomplete and reject malformed code immediately
- Clear semantics let a program behave the same way on every machine
- Separating the two ideas helps you diagnose whether a failure is about form or meaning

## cons
- Syntax rules differ between languages, which is a cost every time you switch
- Semantic mistakes are invisible to the parser and only appear when you test
- Subtle semantics, such as integer versus floating-point division, surprise newcomers

## uses
- Understanding why a program refuses to start versus why it gives a wrong answer
- Reading compiler and interpreter error messages correctly
- Learning a second language by comparing its syntax and semantics with the first
- Building tools such as linters, formatters and syntax highlighters

## mistakes
- Assuming that code which runs must therefore be correct
- Treating a syntax error message as a statement about the logic
- Assuming the same operator means the same thing in every language
- Fixing syntax errors by guesswork without reading where the parser stopped

## interview
**Q:** What is the difference between syntax and semantics?
**A:** Syntax is the set of rules for writing a well-formed program; semantics is the meaning of a well-formed program, that is, what it does when it runs.

**Q:** Which kind of error can a compiler or parser find without running the code?
**A:** Syntax errors, because they violate the grammar. Semantic errors such as a wrong formula or wrong condition are only found by running and testing the program.

**Q:** Give an example of a construct that is syntactically valid in two languages but means different things.
**A:** Dividing two integers: in Python 3 the expression 7 / 2 gives 3.5, while in C and Java it gives 3 because both operands are integers.

## summary
Syntax decides whether code is well formed; semantics decides what well-formed code does. Syntax errors stop the program from starting, semantic errors let it run and produce the wrong thing.

## codenote
The Python loop evaluates three expressions. The first two are valid but mean different things; the third has invalid syntax and raises SyntaxError before any evaluation. The JavaScript sample shows the same split: two valid expressions with different results, and one that the parser rejects.

## code
### python
```python
for source in ["7 / 2", "7 // 2", "7 /"]:
    try:
        print(source, "=>", eval(source))
    except SyntaxError:
        print(source, "=> SyntaxError (not a valid expression)")
```
Output:
```text
7 / 2 => 3.5
7 // 2 => 3
7 / => SyntaxError (not a valid expression)
```
### javascript
```javascript
console.log(7 / 2);
console.log(Math.floor(7 / 2));

try {
  new Function("return 7 /");
} catch (error) {
  console.log(error.name);
}
```
Output:
```text
3.5
3
SyntaxError
```

## quiz
1. A program fails to start and the message points at a missing closing bracket. What kind of problem is this?
   - [ ] A semantic error
   - [x] A syntax error
   - [ ] A hardware error
   - [ ] A logic error found at run time
   > A missing bracket breaks the grammar, so the parser stops before anything runs.
2. A program runs to the end but prints 3 when you expected 3.5. This is most likely:
   - [ ] A syntax error
   - [ ] A parser bug
   - [x] A semantic (logic) error such as integer division
   - [ ] A missing semicolon
   > The code was well formed and ran; the meaning of the operation differed from your intent.
3. Why can an editor underline syntax errors instantly but not logic errors?
   - [ ] Logic errors do not exist
   - [x] The grammar can be checked statically, but meaning depends on what the code is supposed to do
   - [ ] Editors only know Python
   - [ ] Syntax errors are more important
   > Grammar rules are mechanical; correctness of logic depends on your intent and on run-time values.
4. In Python 3, what does 7 // 2 evaluate to?
   - [ ] 3.5
   - [ ] 4
   - [x] 3
   - [ ] A syntax error
   > The double slash is floor division, which rounds the quotient down.

# Statements and Expressions
kind: concept
time: Not applicable — the distinction between statements and expressions is about language structure, not running time.
space: Not applicable — it concerns how code is classified, not how much memory it uses.

## intro
An expression is a piece of code that produces a value; a statement is a piece of code that does something. Knowing which is which explains why you can pass an expression to a function but not an if statement.

## theory
Programs are built from two kinds of units:

- An expression evaluates to a value: `2 + 3`, `price * qty`, `name.upper()`, `x > 10`, a function call that returns something.
- A statement performs an action and usually has no value of its own: an assignment `x = 5`, a loop, an `if`, a `return`, an `import`.

Expressions can be nested inside bigger expressions: `(a + b) * c` contains `a + b`. Statements contain expressions: the statement `total = price * qty` contains the expression `price * qty`.

Languages differ in where they draw the line. In Python an assignment is a statement, so you cannot write it where a value is expected. In JavaScript and C an assignment is also an expression, which is why `if (x = 5)` is legal and a famous bug. Many languages also have a conditional expression (`a if cond else b` in Python, `cond ? a : b` in C-family languages) because the `if` statement itself produces no value.

## explain
1. To decide what a line is, ask whether it can stand where a value is needed — as a function argument or on the right of `=`.
2. `y = x * 2 + 1` is a statement. Its right-hand side `x * 2 + 1` is an expression that evaluates to 11 when x is 5.
3. `label = "big" if y > 10 else "small"` is also a statement; the part after `=` is a conditional expression with a value.
4. A list comprehension such as `[n * n for n in range(4)]` is an expression that produces a list, so it can be printed directly.
5. Use expressions to compute values and statements to sequence actions.

## example
With x = 5: the statement `x = 5` stores a value and produces none. The expression `x * 2 + 1` produces 11. The statement `y = x * 2 + 1` stores that 11. Then `"big" if y > 10 else "small"` is an expression that evaluates to "big", and the list comprehension builds `[0, 1, 4, 9]`. Each result appears in the output of the sample.

## real
Spreadsheet formulas are pure expressions, while macros and scripts are sequences of statements. In JavaScript frameworks, templates expect expressions (values to display), which is why you cannot put an if statement inside curly braces there.

## pros
- Thinking in expressions makes code easier to combine and reuse
- Statements make the order of actions explicit
- Knowing the difference helps you read syntax errors about "expected an expression"

## cons
- Languages draw the line in different places, so habits do not always transfer
- Assignment-as-expression allows bugs such as using = instead of ==
- Very long nested expressions are hard to read

## uses
- Writing a value inline as a function argument or return value
- Choosing between an if statement and a conditional expression
- Understanding template and formula syntax in other tools
- Reading unfamiliar code by identifying what produces values

## mistakes
- Trying to use a statement, such as an if block, where a value is required
- Writing a long chain of nested expressions that nobody can read
- Using = in a condition where == was intended in languages that allow it
- Assuming an assignment returns a value in every language

## interview
**Q:** What is the difference between a statement and an expression?
**A:** An expression evaluates to a value and can be used inside other expressions; a statement performs an action, such as assigning, looping or returning, and is not generally usable as a value.

**Q:** Why is if (x = 5) a notorious bug in C and JavaScript?
**A:** Because assignment is an expression there: it stores 5 in x and yields 5, which is truthy, so the condition is always true instead of comparing x with 5.

**Q:** When would you prefer a conditional expression over an if statement?
**A:** When you only need to choose between two values for a single assignment or return, such as label = "big" if y > 10 else "small". For multi-step branches the statement form is clearer.

## summary
Expressions produce values and statements perform actions. Statements contain expressions, expressions nest inside expressions, and each language decides exactly where the boundary lies.

## codenote
Each line is labelled as a statement or an expression in the comments. The values printed are the results of the expressions: 11, "big", and the list of squares.

## code
### python
```python
x = 5                                   # statement: assignment, produces no value
y = x * 2 + 1                           # right side is an expression that evaluates to 11
label = "big" if y > 10 else "small"    # conditional expression chooses a value
print(y, label)
print([n * n for n in range(4)])        # a comprehension is an expression too
```
Output:
```text
11 big
[0, 1, 4, 9]
```
### javascript
```javascript
let x = 5;
const y = x * 2 + 1;
const label = y > 10 ? "big" : "small";
console.log(y, label);
console.log([0, 1, 2, 3].map((n) => n * n));
```
Output:
```text
11 big
[ 0, 1, 4, 9 ]
```

## quiz
1. Which of these is an expression?
   - [ ] x = 5
   - [ ] for i in range(3):
   - [x] price * quantity
   - [ ] import math
   > price * quantity evaluates to a value; the others are statements that perform an action.
2. In Python, where is a conditional expression like "big" if y > 10 else "small" most useful?
   - [ ] To start a loop
   - [x] To choose one of two values in an assignment or argument
   - [ ] To import a module
   - [ ] To define a function
   > A conditional expression yields a value, so it fits wherever a value is expected.
3. Why can if (x = 5) be a bug in JavaScript?
   - [ ] Because 5 is not allowed
   - [x] Because assignment is an expression whose value 5 is truthy, so the condition is always true
   - [ ] Because if cannot contain a variable
   - [ ] Because x is read-only
   > The assignment overwrites x and yields its value instead of comparing.
4. The statement total = price * qty contains which expression?
   - [x] price * qty
   - [ ] total =
   - [ ] total = price
   - [ ] qty only
   > The right-hand side computes a value; the assignment as a whole is the statement.

# Code Blocks and Scope Preview
kind: concept
time: Not applicable — blocks and scope are about where names are visible, not about running time.
space: Not applicable — scope decides which names you can use, and local variables usually disappear when a function returns, but there is no Big-O memory result here.

## intro
A code block groups statements so they run together, and scope decides which parts of a program can see a given variable. Getting these two ideas right prevents a whole family of "name is not defined" and "wrong variable changed" bugs.

## theory
Blocks are marked differently by language:

- Python uses indentation: lines indented by the same amount after a colon form a block.
- C, C++, Java and JavaScript use curly braces: everything between { and } is a block.

Scope is the region where a name can be used. The common levels are:

- Global scope — names defined at the top level, visible almost everywhere
- Function (local) scope — names created inside a function, visible only there and discarded when it returns
- Block scope — in JavaScript `let` and `const` (and in C-family languages), a name belongs to the nearest enclosing block

When the same name exists at two levels, the innermost one wins inside its region; this is called shadowing. Python has function scope but no separate block scope: a variable created inside an if or for is visible in the rest of the function. JavaScript `var` is function-scoped, which is why `let` and `const` are preferred.

## explain
1. Find the block: the lines indented under a colon (Python) or between braces.
2. Look for where each name is first assigned or declared — that fixes its scope.
3. When you use a name, the language searches the innermost scope first, then each enclosing scope outward.
4. If the name is not found anywhere, you get a NameError (Python) or ReferenceError (JavaScript).
5. An assignment inside a function creates a new local variable by default, so it does not change a global of the same name.
6. Keep variables in the smallest scope that works, and pass values in and out through parameters and return values.

## example
The sample defines `message = "global"` at the top, then a function that assigns `message = "local"` and prints it. Calling the function prints "local", yet printing `message` afterwards still shows "global", because the function assigned to its own local variable. A second function creates `inner`; using `inner` outside the function fails with NameError because it never existed in the global scope.

## real
Large programs rely on narrow scope so two developers can use a loop variable named i in different functions without interfering, and so a temporary value cannot be modified from far away.

## pros
- Local scope keeps functions independent, so they can be tested alone
- Name reuse is safe because inner names shadow outer ones only where intended
- Narrow scope limits how much code can accidentally change a variable

## cons
- Shadowing can hide a bug when you think you are changing the outer variable
- Python's lack of block scope surprises people from C-family languages
- Overusing globals makes data flow hard to follow

## uses
- Keeping loop counters and temporaries local to a function
- Avoiding accidental changes to shared configuration values
- Understanding closures and callbacks later in the course
- Reading NameError and ReferenceError messages

## mistakes
- Expecting an assignment inside a function to change the global variable
- Using a variable outside the block or function where it was created
- Using var in JavaScript and being surprised that it escapes a block
- Reusing one generic name such as data at several levels and shadowing it by accident

## interview
**Q:** What is the difference between local and global scope?
**A:** A global name is defined at the top level and visible throughout the module; a local name is created inside a function and is visible only there, disappearing when the function returns.

**Q:** What is shadowing?
**A:** Declaring a name in an inner scope that is already defined in an outer scope. Inside the inner scope the new name hides the outer one without changing it.

**Q:** How do let, const and var differ in JavaScript scoping?
**A:** let and const are block scoped; var is function scoped, so a var declared inside an if or loop is visible in the whole function.

## summary
A block is a group of statements, and scope is where a name can be used. Names are looked up from the innermost scope outward, assignments inside a function create locals, and keeping scope small makes programs easier to reason about.

## codenote
The Python sample shows a function-local variable shadowing a global one without changing it, and a name that does not exist outside its function. The JavaScript sample shows that let stays inside its block while var does not.

## code
### python
```python
message = "global"

def show():
    message = "local"      # a new local variable, not the global one
    print(message)

def define():
    inner = 1              # exists only while define() runs

show()
print(message)

define()
try:
    print(inner)
except NameError:
    print("inner is not visible here")
```
Output:
```text
local
global
inner is not visible here
```
### javascript
```javascript
{
  let blockScoped = 1;
  var functionScoped = 2;
}

console.log(typeof blockScoped);
console.log(functionScoped);
```
Output:
```text
undefined
2
```

## quiz
1. A function assigns message = "local" while a global message exists. What happens to the global?
   - [ ] It is replaced by "local"
   - [x] It is unchanged; the function created its own local variable
   - [ ] It is deleted
   - [ ] Python raises an error
   > Assignment inside a function creates a local name by default, shadowing the global.
2. Which JavaScript keyword gives a variable block scope?
   - [ ] var
   - [ ] function
   - [x] let
   - [ ] static
   > let and const are scoped to the nearest enclosing block; var is function scoped.
3. What does Python do when you use a name that was only defined inside another function?
   - [ ] It uses 0
   - [x] It raises NameError because the name does not exist in the current scope
   - [ ] It looks it up in the other function
   - [ ] It creates it automatically
   > Local names are discarded when their function returns and are not visible elsewhere.
4. Why is it good practice to keep variables in the narrowest scope that works?
   - [ ] It makes programs compile faster
   - [x] Less code can see or change them, which reduces accidental interference
   - [ ] Global variables are not allowed
   - [ ] It removes the need for functions
   > Small scope limits the places a bug can come from and keeps functions independent.

# Comments and Documentation
kind: concept
time: Not applicable — comments are ignored when a program runs, so they have no running time. Their cost is the effort to keep them accurate.
space: Not applicable — comments and docstrings are text; they do not affect an algorithm's memory use.

## intro
Comments and documentation explain code to the next reader, who is often you in six months. The aim is not to repeat what the code says but to record why it is written that way and how to use it.

## theory
Several layers of explanation exist:

- Inline comments — short notes beside or above a line, written with # in Python or // in C-family languages
- Block comments — a longer explanation of a tricky section
- Documentation comments — structured text attached to a function, class or module: a docstring in Python, JSDoc in JavaScript, Javadoc in Java. Tools read these to build reference pages and editor hints.
- Project documentation — README files, usage examples and architecture notes

Good comments explain intent, constraints and surprises: why a workaround exists, what unit a value uses, what an algorithm assumes. They do not narrate obvious code (`i += 1  # add one to i`). A comment that disagrees with the code is worse than none, so update comments when you change code.

A docstring should state what a function does, its parameters, what it returns and any exceptions it can raise. In Python it is available at run time as the `__doc__` attribute and through help().

## explain
1. Write code that explains itself first: clear names and small functions.
2. Add a comment where the reason is not obvious from the code: a business rule, a performance trick, a bug workaround with a reference.
3. Add a docstring to each public function describing purpose, arguments and result.
4. When you change behavior, change the comment and docstring in the same commit.
5. Delete commented-out code; version control already remembers it.
6. Keep a README that tells a newcomer what the project is, how to run it and where to start.

## example
The sample function `area` has a docstring saying what it returns and a comment explaining why the approximate value of pi is acceptable. The docstring is not just a comment: printing `area.__doc__` returns it at run time, which is how help() and editors show it. Calling `area(2)` prints 12.57, matching the formula pi times radius squared.

## real
API libraries are used almost entirely through their documentation comments: hovering over a function in an editor shows its docstring or JSDoc, and documentation sites are generated from those same comments.

## pros
- Comments record the reason behind a decision, which the code alone cannot show
- Docstrings feed editor hints and generated reference documentation
- Good documentation shortens onboarding for new teammates

## cons
- Comments can become outdated and mislead
- Too many comments clutter the code and hide the ones that matter
- Writing and maintaining documentation takes time

## uses
- Explaining a business rule or a non-obvious calculation
- Documenting a public function's inputs, outputs and errors
- Leaving a warning about a known limitation
- Generating API reference pages from source

## mistakes
- Writing comments that repeat the code instead of explaining the reason
- Leaving old comments that no longer match the code
- Keeping large blocks of commented-out code
- Skipping documentation for public functions and assuming the name is enough

## interview
**Q:** What makes a good code comment?
**A:** It explains why the code does something or a non-obvious constraint, not what the line obviously does. It stays short and is updated whenever the code changes.

**Q:** What is the difference between a comment and a docstring in Python?
**A:** A comment is ignored by the interpreter. A docstring is a string literal placed as the first statement of a function, class or module; it is stored on the object as its documentation attribute and used by help() and documentation tools.

**Q:** Why should you delete commented-out code?
**A:** It adds noise and confusion about whether it is still needed, and version control already keeps the old version if you ever need it back.

## summary
Use clear names first, comments for the reasons the code cannot show, and docstrings for public functions. Keep all of them accurate and remove dead commented-out code.

## codenote
The docstring describes what the function returns and is readable at run time through help() and editor hints. The inline comment records a reason, not a restatement of the code. The JavaScript version uses a JSDoc block in the same way.

## code
### python
```python
def area(radius):
    """Return the area of a circle with the given radius."""
    # 3.14159 is precise enough for on-screen display; use math.pi for exact work
    return 3.14159 * radius ** 2

print(area.__doc__)
print(round(area(2), 2))
```
Output:
```text
Return the area of a circle with the given radius.
12.57
```
### javascript
```javascript
/**
 * Return the area of a circle with the given radius.
 * @param {number} radius
 * @returns {number}
 */
function area(radius) {
  // 3.14159 is precise enough for display; use Math.PI for exact work
  return 3.14159 * radius ** 2;
}

console.log(area(2).toFixed(2));
```
Output:
```text
12.57
```

## quiz
1. Which comment is most useful?
   - [ ] A note saying: add one to i, placed beside i += 1
   - [x] A note saying: retry up to 3 times because the payment API is occasionally rate limited
   - [ ] A note saying: loop
   - [ ] A note saying: end of function
   > Good comments explain a reason or constraint that the code cannot show on its own.
2. Where does Python store a function's docstring at run time?
   - [ ] In a separate file
   - [ ] In the global variable doc
   - [x] In the function's documentation attribute
   - [ ] Docstrings are discarded
   > The docstring becomes the documentation attribute of the function, which help() and editors read.
3. You changed a function to return a list instead of a number. What else must you update?
   - [ ] Nothing, comments are ignored
   - [x] The docstring and any comments that describe the return value
   - [ ] Only the file name
   - [ ] The monitor resolution
   > Out-of-date documentation misleads readers, so it should change with the code.
4. What should you do with an old block of commented-out code?
   - [ ] Keep it forever just in case
   - [x] Delete it, since version control remembers the old version
   - [ ] Move it to the top of the file
   - [ ] Convert it to a docstring
   > Dead code adds clutter; history is the safe place to keep old versions.

# Naming Conventions
kind: concept
time: Not applicable — names have no effect on running time. Their cost is human: how quickly a reader understands the code.
space: Not applicable — a name does not change what the program stores.

## intro
Names are the main way code explains itself. Following your language's naming conventions, and choosing names that say what a thing is, makes a program readable without a single comment.

## theory
Conventions are shared agreements about how names look:

- snake_case (words joined by underscores) — Python variables, functions and modules
- camelCase (first word lowercase, later words capitalised) — JavaScript and Java variables and methods
- PascalCase (every word capitalised) — class and type names in most languages
- UPPER_SNAKE_CASE — constants such as MAX_RETRIES
- A leading underscore marks an internal name in Python

Good names follow a few rules:

- Describe the content or purpose: `unpaid_invoices`, not `list2`
- Use verbs for functions (`calculate_total`) and nouns for data (`total`)
- Name booleans as questions: `is_valid`, `has_access`
- Avoid abbreviations nobody else would guess, and avoid single letters except for short loop indexes
- Be consistent: do not call the same idea `user`, `usr` and `person` in different places

Languages also reserve keywords such as `class` and `return`, which cannot be used as names.

## explain
1. Check the convention of the language and the project before naming anything.
2. Ask what the thing represents. A list of prices is `prices`, not `p` or `data`.
3. Make the name as long as needed to be clear, but no longer.
4. Make functions describe an action and its result: `parse_date`, `send_email`.
5. Name booleans so the condition reads naturally: `if is_logged_in:`.
6. Rename when understanding improves. Use the IDE's rename feature so every reference changes together.

## example
A helper converts snake_case names to camelCase, the kind of translation needed when a Python backend talks to a JavaScript front end. `total_item_count` becomes `totalItemCount` and `is_valid_user` becomes `isValidUser`. The function itself follows the rules: a verb-based name, and parameters that say what they hold.

## real
APIs often use camelCase in JSON while the Python code behind them uses snake_case, so serializers include a conversion step like this one; inconsistent naming is a common source of missing fields.

## pros
- Clear names reduce the number of comments needed
- Conventions let experienced readers recognise a variable, a constant or a class instantly
- Consistency makes searching and refactoring reliable

## cons
- Conventions differ between languages and teams
- Long descriptive names can make lines wide
- Renaming without tooling risks missing references

## uses
- Making code readable for reviewers and future maintainers
- Matching an existing code base's style
- Converting field names between systems with different conventions
- Following linters that enforce naming rules

## mistakes
- Using vague names such as data, temp, stuff or x for important values
- Mixing styles in the same file, such as userName next to user_name
- Naming a function with a noun, so its purpose is unclear
- Choosing a name that shadows a built-in, such as list or id

## interview
**Q:** What naming convention does Python use for functions and variables?
**A:** snake_case, with PascalCase for classes and UPPER_SNAKE_CASE for constants, as described in PEP 8.

**Q:** Why are descriptive names better than short ones?
**A:** The reader can understand the purpose from the name without searching for the definition, which makes the code faster to read and less error prone.

**Q:** How should boolean variables be named?
**A:** As a yes or no question or state, such as is_valid, has_permission or can_retry, so conditions read like sentences.

## summary
Follow the language's convention, name things for what they are, make functions verbs and booleans questions, and stay consistent. Good names are the cheapest documentation.

## codenote
The Python function turns a snake_case name into camelCase by capitalising every word after the first. The JavaScript function does the reverse with a regular expression.

## code
### python
```python
def snake_to_camel(name):
    first, *rest = name.split("_")
    return first + "".join(word.capitalize() for word in rest)

print(snake_to_camel("total_item_count"))
print(snake_to_camel("is_valid_user"))
```
Output:
```text
totalItemCount
isValidUser
```
### javascript
```javascript
function camelToSnake(name) {
  return name.replace(/[A-Z]/g, (letter) => "_" + letter.toLowerCase());
}

console.log(camelToSnake("totalItemCount"));
console.log(camelToSnake("isValidUser"));
```
Output:
```text
total_item_count
is_valid_user
```

## quiz
1. Which name best follows Python conventions for a function?
   - [ ] CalcTotalFunction
   - [ ] calculateTotal
   - [x] calculate_total
   - [ ] calculate-total-now
   > Python functions use snake_case; PascalCase is for classes, and hyphens are not allowed in names.
2. Which is the best name for a boolean that records whether a user may edit a page?
   - [ ] edit
   - [ ] flag
   - [x] can_edit
   - [ ] x
   > A question-style name makes conditions such as if can_edit: read naturally.
3. Why should you avoid naming a variable list or id in Python?
   - [ ] They are reserved words that cause a syntax error
   - [x] They shadow built-in names, which can cause confusing bugs later
   - [ ] They are too short to compile
   - [ ] Python forbids lowercase names
   > They are legal but hide the built-in list type and id function in that scope.
4. What is the safest way to rename a variable used in many places?
   - [ ] Find and replace across the whole project
   - [x] Use the IDE's rename symbol so only real references change
   - [ ] Rename it in one file only
   - [ ] Leave the old name and add a comment
   > Symbol-aware renaming updates exactly the references, not unrelated text.

# Code Style and Readability
kind: concept
time: Not applicable — formatting and style do not change how long a program takes to run. Their payoff is the time people spend reading and changing it.
space: Not applicable — style affects readers, not the memory a program uses.

## intro
Code is read far more often than it is written, so style matters. Consistent formatting, short functions and straightforward structure let other people (and your future self) understand a program quickly.

## theory
Readable code follows a few widely accepted habits:

- Consistent formatting — the same indentation, spacing and line length everywhere, ideally applied by a tool such as Black or Prettier
- A style guide — PEP 8 for Python, the project's guide for JavaScript — so teams do not argue about taste
- Small functions that do one thing and have clear names
- Early returns (guard clauses) that handle the unusual case first and keep the main path unindented
- Limited nesting — deep pyramids of if statements are hard to follow
- No magic numbers — give a meaningful name to a bare 0.08 or 86400
- Meaningful blank lines that separate steps

Style is separate from correctness: two programs can behave identically and differ greatly in how easy they are to understand.

## explain
1. Pick the style guide and set up an auto-formatter so formatting is never discussed in review.
2. Write the simplest structure that works; prefer straight-line code to clever one-liners.
3. Replace nested conditions with early returns where it shortens the main path.
4. Replace unexplained numbers with named constants.
5. Read the code as if you had never seen it. If you have to pause, rename or restructure that spot.
6. Run a linter to catch unused variables, unreachable code and style drift.

## example
The sample shows the same function written twice. The cramped version `f(a,b,c)` packs a condition, arithmetic and a result into one line with single-letter names. The readable version `price_with_shipping` names the parts, handles the invalid price first with an early return, then computes the normal case. The program checks that both give identical results for the same inputs, so the only difference is how easy they are to read.

## real
Companies enforce style automatically: a formatter and linter run on every commit, so code reviews focus on design and bugs instead of spacing and naming.

## pros
- Consistent style lets any team member read any file quickly
- Auto-formatting removes style arguments from code review
- Simple structure makes bugs easier to spot

## cons
- Strict rules can feel arbitrary until they become habit
- Reformatting an existing code base creates large, noisy diffs
- Over-engineering for readability can add needless indirection

## uses
- Maintaining shared code bases
- Preparing code for review and interviews
- Setting up formatters and linters in a new project
- Reducing the cost of future changes

## mistakes
- Mixing tabs and spaces or several indentation widths in one file
- Writing clever one-liners that are hard to debug
- Leaving unexplained magic numbers in calculations
- Nesting conditions five levels deep instead of returning early

## interview
**Q:** Why does code style matter if the program works?
**A:** Because code is maintained far longer than it is written. Readable, consistent code is cheaper to debug, review and extend, and has fewer misunderstandings.

**Q:** What is a guard clause?
**A:** An early check at the top of a function that returns or raises for an invalid or special case, so the rest of the function handles the normal case without extra nesting.

**Q:** What is a magic number and how do you fix it?
**A:** An unexplained literal value in code, such as 0.08 for a tax rate. Give it a named constant like SALES_TAX_RATE so its meaning is clear and it can be changed in one place.

## summary
Readable code uses consistent formatting, descriptive names, small functions, early returns and named constants. Use a formatter and linter so style stays consistent without effort.

## codenote
Both functions compute the same result; the sample checks that for a valid and an invalid price. The second version uses a guard clause and descriptive names, which is the style the lesson recommends.

## code
### python
```python
def f(a,b,c):
    return a*b+c if a>0 else c

def price_with_shipping(unit_price, quantity, shipping):
    if unit_price <= 0:
        return shipping
    return unit_price * quantity + shipping

print(f(4,3,5) == price_with_shipping(4, 3, 5))
print(f(0,3,5) == price_with_shipping(0, 3, 5))
print(price_with_shipping(4, 3, 5))
```
Output:
```text
True
True
17
```
### javascript
```javascript
function priceWithShipping(unitPrice, quantity, shipping) {
  if (unitPrice <= 0) return shipping;
  return unitPrice * quantity + shipping;
}

console.log(priceWithShipping(4, 3, 5));
console.log(priceWithShipping(0, 3, 5));
```
Output:
```text
17
5
```

## quiz
1. What is the main benefit of an automatic code formatter?
   - [ ] It makes the program run faster
   - [x] It keeps formatting consistent so reviews can focus on logic
   - [ ] It finds all bugs
   - [ ] It removes the need for names
   > A formatter applies one style everywhere, ending debates about spacing and layout.
2. What does a guard clause do?
   - [ ] Guards a variable from being changed
   - [x] Handles an invalid or special case early so the main path stays unindented
   - [ ] Adds a comment to a function
   - [ ] Imports a module
   > Early returns reduce nesting and make the normal flow easy to follow.
3. Which of these is a magic number problem?
   - [ ] total = price * TAX_RATE
   - [x] total = price * 1.0825
   - [ ] total = price + shipping
   - [ ] total = price
   > A bare 1.0825 hides its meaning; a named constant explains it and centralises the value.
4. Two functions produce identical output but one is much easier to read. Which is better for a team?
   - [ ] The shorter one
   - [ ] The cleverer one
   - [x] The easier to read one, because correctness is equal and maintenance cost is lower
   - [ ] Neither
   > When behavior is the same, readability decides which is cheaper to maintain.

# Constants and Immutability
kind: concept
time: Not applicable — whether a value can change is a property of the program's design, not of its running time.
space: Not applicable — immutable and mutable values are stored in the same way; the difference is whether the value may be modified after creation.

## intro
A constant is a name whose value should never change after it is set, and an immutable value is one that cannot be modified once created. Using them where you can prevents accidental changes and makes programs easier to reason about.

## theory
Several related ideas:

- Constants — named values meant to stay fixed, such as `MAX_RETRIES = 3`. In JavaScript the `const` keyword enforces that the name cannot be reassigned. Python has only a convention: UPPER_SNAKE_CASE names are treated as constants by agreement.
- Immutable values cannot be changed after creation. In Python: numbers, strings, tuples and frozenset. Changing one produces a new value instead.
- Mutable values can be modified in place: Python lists, dicts and sets; JavaScript arrays and objects.
- const in JavaScript prevents reassigning the name, not changing the contents of an object or array it refers to. `Object.freeze` makes an object's properties read only.

Benefits of immutability: values are safe to share (nobody can change them behind your back), they can be used as dictionary keys (tuples), and code that never mutates is simpler to test and to run concurrently.

## explain
1. Replace repeated or meaningful literals with a named constant at the top of the file.
2. Choose the right container: a tuple for a fixed group of values like a coordinate, a list for a collection that will change.
3. Where the language offers it, use const or final so accidental reassignment becomes an error.
4. Remember what is protected: reassignment of the name, or modification of the value, or both.
5. When you need a changed value, create a new one — for example a new tuple built from an old one — rather than modifying shared data.

## example
In the Python sample, `MAX_RETRIES` is a constant by convention, and `point = (2, 5)` is an immutable tuple. Trying `point[0] = 9` raises a TypeError, so the coordinate cannot be altered by accident. The JavaScript sample shows both limits of const: reassigning a const name throws, and a frozen object ignores writes to its properties.

## real
Configuration such as a service's timeout, a tax rate or a maximum file size lives in constants so one edit changes it everywhere, and shared data structures are often kept immutable so many parts of a program can read them safely.

## pros
- Named constants remove magic numbers and centralise changes
- Immutable values cannot be corrupted by another part of the program
- Immutable objects are safe to share and to use as dictionary keys

## cons
- Python's constants are only a convention and are not enforced
- Immutability means creating new values for every change, which can cost time or memory
- const in JavaScript does not make objects deeply unchangeable

## uses
- Defining configuration values and limits
- Representing fixed records such as coordinates or RGB colours
- Using tuples as dictionary keys
- Protecting shared data in larger programs

## mistakes
- Believing a JavaScript const object cannot be modified
- Changing a constant at run time in Python because the language allows it
- Using a mutable default or shared list where a tuple would be safer
- Scattering the same literal across many files instead of naming it once

## interview
**Q:** What does const guarantee in JavaScript?
**A:** That the binding cannot be reassigned. The object or array it points to can still be mutated unless it is frozen.

**Q:** Name a mutable and an immutable collection in Python.
**A:** A list is mutable and a tuple is immutable; likewise set is mutable and frozenset is immutable.

**Q:** Why are tuples usable as dictionary keys while lists are not?
**A:** Dictionary keys must be hashable, which requires a value that cannot change. Tuples of hashable items are immutable and hashable; lists are mutable and are not.

## summary
Use named constants for fixed values and immutable data where sharing is likely. Know what your language really enforces: Python relies on convention and immutable types, JavaScript const stops reassignment but not mutation.

## codenote
Python: the tuple rejects item assignment with a TypeError while the constant is read normally. JavaScript: reassigning a const throws a TypeError, and assigning to a property of a frozen object is silently ignored in this non-strict script.

## code
### python
```python
MAX_RETRIES = 3
point = (2, 5)

try:
    point[0] = 9
except TypeError as error:
    print("TypeError:", error)

print(point, MAX_RETRIES)
```
Output:
```text
TypeError: 'tuple' object does not support item assignment
(2, 5) 3
```
### javascript
```javascript
const MAX_RETRIES = 3;
try {
  MAX_RETRIES = 4;
} catch (error) {
  console.log(error.name + ": " + error.message);
}

const point = Object.freeze({ x: 2, y: 5 });
point.x = 9;
console.log(point.x);
```
Output:
```text
TypeError: Assignment to constant variable.
2
```

## quiz
1. In JavaScript, what does declaring an array with const prevent?
   - [ ] Adding items to the array
   - [x] Reassigning the variable to a different array
   - [ ] Reading the array
   - [ ] Sorting the array
   > const protects the binding; the contents of the array can still be changed.
2. Which Python type is immutable?
   - [ ] list
   - [ ] dict
   - [x] tuple
   - [ ] set
   > Tuples cannot be changed after creation, so they are hashable and can be dictionary keys.
3. How does Python mark a value as a constant?
   - [ ] With the const keyword
   - [x] By convention: an UPPER_SNAKE_CASE name that nobody reassigns
   - [ ] With a compiler flag
   - [ ] It cannot represent constants at all
   > Python has no enforced constants; the naming convention signals intent.
4. Why is immutability helpful for data shared across many parts of a program?
   - [ ] It makes it faster to type
   - [x] No part can change it unexpectedly, so everyone sees the same value
   - [ ] It removes the need for variables
   - [ ] It encrypts the data
   > If a value cannot be modified, other code cannot corrupt it.
