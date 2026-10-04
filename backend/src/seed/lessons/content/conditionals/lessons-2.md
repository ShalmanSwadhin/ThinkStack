# Decision Tables
kind: concept
time: Not applicable — a decision table is a design and documentation tool. Looking up a row in a table implemented as a dictionary is a constant-time operation, but the value of the technique is completeness and clarity.
space: Not applicable — the table stores one entry per combination of conditions, which is a design size and not an algorithmic bound.

## intro
A decision table lists every combination of conditions in rows and the action for each. Used before writing code, it exposes missing cases and contradictory rules; used inside code, it replaces a thicket of if statements with data that anyone can read and review.

## theory
A decision table has:

- Conditions: the yes/no or categorical questions (is the customer a member? is there a coupon?)
- Rules: one column or row per combination of answers
- Actions: what to do for each rule

With n yes/no conditions a complete table has 2^n rules. Completeness means every combination is present; consistency means no combination appears twice with different actions. Tables are often condensed by merging rules that share an action with a "don't care" marker.

In code the table can be implemented in several ways:

- A dictionary keyed by the tuple of condition values, as in `{(True, False): "member discount"}`
- A list of (predicate, action) rules checked in order, where the first match wins
- A matrix indexed by category numbers

Benefits of table-driven logic:

- The rules are data, so they can be read by non-programmers, validated automatically and changed without touching control flow
- A completeness check is easy: compare the number of rules with the number of possible combinations
- Tests can iterate over the table

Tables do not suit logic that depends on computed values or ranges, unless the ranges are first converted to categories.

## explain
1. List the conditions and the values each can take.
2. Draw the table with every combination and decide the action for each from the specification.
3. Look for rows that are missing, duplicated or contradictory, and resolve them with the owner of the rules.
4. Implement the table as a dictionary or a rule list.
5. Write a test that checks the number of rules against the number of combinations.
6. Iterate over the table in tests to confirm each action.

## example
Two conditions, membership and a coupon, give four combinations. The dictionary `RULES` maps `(True, True)` to "full discount", `(True, False)` to "member discount", `(False, True)` to "coupon discount" and `(False, False)` to "no discount". The loop prints all four rows with their results, and the final check confirms that the number of rules equals 2 to the power of 2. The JavaScript version uses an ordered list of predicate and result pairs where the first rule that applies wins.

## real
Insurance underwriting, tax rules, shipping charges and access control matrices are naturally expressed as tables, and a published table can be audited by people who cannot read code.

## pros
- Complete coverage of combinations can be checked mechanically
- Rules are data that can be reviewed and changed independently
- Replaces tangled if chains with a simple lookup

## cons
- Tables grow exponentially with the number of conditions
- Not suited to continuous values without categorising them
- A separate table must be kept in step with the specification

## uses
- Specifying business rules before coding them
- Implementing discount, pricing and eligibility logic
- Building permission matrices
- Generating test cases for every combination

## mistakes
- Leaving combinations out and getting a KeyError or no action
- Having two rules for the same combination with different actions
- Encoding ranges as categories without defining the boundaries
- Letting the table in code drift away from the documented one

## interview
**Q:** What is a decision table?
**A:** A table of all combinations of conditions with the action to take for each. It makes the rules explicit and lets you check them for completeness and consistency.

**Q:** How many rules does a complete table with 4 yes-or-no conditions have?
**A:** Sixteen, because each condition doubles the number of combinations.

**Q:** What are the advantages of implementing rules as a table instead of nested ifs?
**A:** The rules become data that is easy to review, test and change, and completeness can be verified by counting entries.

## summary
Decision tables enumerate every combination of conditions with its action. Use them to find gaps in the specification, and implement them as dictionaries or ordered rule lists so the logic is reviewable data.

## codenote
The Python sample implements a complete table as a dictionary and checks its size. The JavaScript sample uses an ordered rule list with a default last rule.

## code
### python
```python
RULES = {
    (True, True): "full discount",
    (True, False): "member discount",
    (False, True): "coupon discount",
    (False, False): "no discount",
}

def discount(is_member, has_coupon):
    return RULES[(is_member, has_coupon)]

for member in (True, False):
    for coupon in (True, False):
        print(member, coupon, "->", discount(member, coupon))

print(len(RULES) == 2 ** 2)
```
Output:
```text
True True -> full discount
True False -> member discount
False True -> coupon discount
False False -> no discount
True
```
### javascript
```javascript
const rules = [
  { when: (c) => c.member && c.coupon, then: "full discount" },
  { when: (c) => c.member, then: "member discount" },
  { when: (c) => c.coupon, then: "coupon discount" },
  { when: () => true, then: "no discount" },
];

const decide = (customer) => rules.find((rule) => rule.when(customer)).then;
console.log(decide({ member: true, coupon: false }));
console.log(decide({ member: false, coupon: false }));
```
Output:
```text
member discount
no discount
```

## quiz
1. How many rules are in a complete decision table with 3 yes-or-no conditions?
   - [ ] 3
   - [ ] 6
   - [x] 8
   - [ ] 9
   > Each condition doubles the number of combinations.
2. What does consistency mean for a decision table?
   - [ ] Every rule uses the same action
   - [x] No combination of conditions has two different actions
   - [ ] The table is short
   - [ ] The conditions are all numeric
   > Contradictory rules make the behavior ambiguous.
3. What is a benefit of storing rules as data?
   - [ ] They run faster than code
   - [x] They can be reviewed and changed without altering control flow
   - [ ] They never contain errors
   - [ ] They remove the need for tests
   > Data tables separate the rules from the code that applies them.
4. Which situation is a poor fit for a decision table?
   - [ ] Eligibility based on two yes-or-no facts
   - [x] Logic that depends on continuous computed values without categories
   - [ ] A permission matrix
   - [ ] A discount policy
   > Tables need discrete conditions, so ranges must be turned into categories first.

# Conditional Expressions
kind: concept
time: Not applicable — building a value with a condition inside an expression costs the same constant work as the condition itself.
space: Not applicable — conditional expressions choose among values; any lists they create depend on the data, not on a general bound.
practice: maximum-of-two-numbers

## intro
Conditional expressions let a condition produce a value instead of controlling a block of statements. Used well, they replace temporary variables and small if/else blocks with a single, readable line, and they connect naturally with comprehensions, defaults and the helper functions that most languages provide.

## theory
The idea is expression-oriented conditionals: the result of the decision is a value that you assign, pass or return directly. Forms you will meet:

- The inline conditional (`a if cond else b`, `cond ? a : b`), covered in detail in the operators module
- Conditions inside comprehensions: `[n for n in nums if n > 0]` filters, and `[n if n > 0 else 0 for n in nums]` transforms every item
- Counting and testing with generators: `sum(1 for n in nums if n < 0)` counts matches; `any(...)` is true if at least one item satisfies the test; `all(...)` is true if every item does (and is true for an empty collection)
- Library helpers that embed a decision: `max`, `min`, `abs`, `dict.get(key, default)`
- Short-circuit defaults: `value or default`, with the caveat that falsy values are replaced
- Python's `x if x is not None else default` when zero or empty text are valid

Two cautions. The expression form should stay simple; once it needs a comment, a named function or an if statement is better. And placement of the condition differs in Python comprehensions: a trailing `if` filters, while a conditional expression in the output position transforms.

## explain
1. Ask whether you need a value (use an expression) or an action (use a statement).
2. For choosing one of two values, use the inline conditional.
3. To select items from a collection, put a condition at the end of a comprehension.
4. To change items depending on a test, put the conditional expression in the output position.
5. To summarise a collection, use sum with a generator, any or all.
6. Prefer built-in helpers such as max and dict.get over hand-written conditions.

## example
For `nums = [3, -1, 8, 0, -7]` the comprehension `[n if n > 0 else 0 for n in nums]` replaces every non-positive item by zero and gives `[3, 0, 8, 0, 0]`. `sum(1 for n in nums if n < 0)` counts the negatives and gives 2. `any(n > 5 for n in nums)` is True and `all(n > -10 for n in nums)` is True. `max(3, 8)` is 8 and `{"a": 1}.get("b", "missing")` returns the default "missing". In JavaScript, a plural label is chosen with a conditional, the nullish operator supplies a default, and the array methods `some` and `every` play the roles of any and all.

## real
User interface code uses conditional expressions for labels and styles, data-processing code filters and counts with comprehensions, and configuration code supplies defaults through lookups with fallbacks.

## pros
- Removes temporary variables and short if/else blocks
- Comprehensions state the intent of filtering and transforming directly
- Built-in helpers are tested and well understood

## cons
- Complex conditions inside expressions become unreadable
- The or-default trick replaces legitimate falsy values
- Confusing the filter position and the transform position gives the wrong result

## uses
- Choosing labels and defaults inline
- Filtering and transforming lists
- Counting items that meet a condition
- Checking whether any or all items satisfy a rule

## mistakes
- Putting the condition in the wrong place of a comprehension
- Using value or default when zero is a valid value
- Cramming several conditions and actions into one line
- Forgetting that all returns True for an empty collection

## interview
**Q:** What is the difference between a filtering and a transforming condition in a list comprehension?
**A:** A trailing if removes items that fail the test, so the result may be shorter. A conditional expression in the output position keeps every item but chooses what to produce for each.

**Q:** What does all() return for an empty list?
**A:** True, because there is no item that violates the condition.

**Q:** When is value or default a poor choice for a default?
**A:** When zero, an empty string or an empty list are legitimate values, because they are falsy and would be replaced by the default.

## summary
Use conditional expressions where a decision produces a value, comprehensions for filtering and transforming, any and all for quantified tests, and library helpers instead of hand-written branches. Keep each expression simple.

## codenote
The Python sample demonstrates transform, count, any, all, max and a default lookup. The JavaScript sample uses a conditional for pluralisation, a nullish default and the some and every methods.

## code
### python
```python
nums = [3, -1, 8, 0, -7]

print([n if n > 0 else 0 for n in nums])
print(sum(1 for n in nums if n < 0))
print(any(n > 5 for n in nums), all(n > -10 for n in nums))
print(max(3, 8), {"a": 1}.get("b", "missing"))
```
Output:
```text
[3, 0, 8, 0, 0]
2
True True
8 missing
```
### javascript
```javascript
const count = 1;
console.log(`${count} ${count === 1 ? "item" : "items"}`);

const settings = { retries: 0 };
console.log(settings.retries ?? 3);

const nums = [3, -1, 8, 0, -7];
console.log(nums.some((n) => n > 5), nums.every((n) => n > -10));
```
Output:
```text
1 item
0
true true
```

## quiz
1. What does [n if n > 0 else 0 for n in nums] do?
   - [ ] Removes non-positive numbers
   - [x] Keeps every item, replacing non-positive ones with 0
   - [ ] Sorts the numbers
   - [ ] Raises a syntax error
   > A conditional expression in the output position transforms each item.
2. What does all(x > 0 for x in []) return?
   - [ ] False
   - [x] True
   - [ ] None
   - [ ] It raises an error
   > With no items there is nothing that violates the condition.
3. Why can value or default be wrong for settings?
   - [ ] It is slower than if
   - [x] A legitimate falsy value such as 0 would be replaced by the default
   - [ ] It cannot be used with numbers
   - [ ] It raises an exception
   > Use an explicit test for None or the nullish operator in JavaScript.
4. Which JavaScript array method corresponds to Python's any?
   - [ ] every
   - [x] some
   - [ ] find
   - [ ] reduce
   > some is true when at least one element satisfies the test.

# Avoiding Deep Nesting
kind: concept
time: Not applicable — nesting depth affects how people read code, not how fast the computer runs it.
space: Not applicable — flattening conditional structure does not change memory use.

## intro
Code that drifts further and further to the right, with if inside if inside for inside if, is hard to understand, hard to test and easy to break. A handful of mechanical techniques flatten such code while keeping its behavior.

## theory
Deep nesting is sometimes called the arrow anti-pattern because the indentation forms an arrowhead pointing right. Each level adds a condition the reader must remember, and the code that finally does the work is far from the checks that guard it. A rough rule is to be suspicious beyond two or three levels.

Standard techniques:

- Guard clauses: handle invalid cases first and return, so the main path is not indented
- Combine conditions: replace `if a: if b:` with `if a and b:` when there is no code between
- Extract functions: move an inner block into a function with a descriptive name, which also gives you something to test separately
- Invert the condition in a loop and use `continue` to skip, instead of wrapping the body in an if
- Replace chains with lookup tables or polymorphism when the nested ifs select between behaviors
- Use early exits from loops (`break`, `return`) rather than flag variables
- Use language features: `any`, `all`, comprehensions and the standard library often replace entire nested loops with conditions

Flattening must preserve behavior, so do it in small steps with tests; the transformation is purely structural.

Counting complexity helps too: cyclomatic complexity measures the number of independent paths through a function, and many teams set a limit that triggers a refactoring.

## explain
1. Find the deepest part of the function and ask what conditions lead there.
2. Turn negative cases into guard clauses at the top, one at a time, running the tests after each step.
3. Merge nested conditions that have no code between them.
4. Extract the inner blocks that do one identifiable thing.
5. Replace flags with early exits or built-ins like any and all.
6. Re-read the result: does the main path read from top to bottom?

## example
The function `discount_deep` wraps its logic in three levels: user present, user active, total over 100, with three separate else branches all returning 0.0. The flat version `discount_flat` has one guard for a missing or inactive user and one conditional expression for the total. The code evaluates both functions for four cases, a missing user, an inactive user, a small total and a large total, and prints the same list `[0.0, 0.0, 0.0, 0.1]` for each, then confirms they are equal. The JavaScript sample extracts a named predicate and uses `continue` in a loop.

## real
Maintenance teams routinely refactor deeply nested legacy functions, and static analysis tools report nesting depth and cyclomatic complexity so that the worst offenders are flagged in code review.

## pros
- Shorter, flatter code that reads top to bottom
- Smaller pieces are easier to test
- Fewer paths per function lowers the chance of bugs

## cons
- Many small functions can scatter logic
- Over-eager flattening can obscure the order of decisions
- Behavior must be verified after each transformation

## uses
- Cleaning up legacy functions
- Reviewing code against a nesting-depth limit
- Simplifying request handlers and validation routines
- Making loops with many conditions readable

## mistakes
- Flattening without tests and changing behavior
- Extracting functions with vague names
- Leaving flag variables that an early exit would remove
- Merging conditions in a way that changes which else applies

## interview
**Q:** What is the arrow anti-pattern?
**A:** Code with so many nested conditionals and loops that the indentation forms an arrow pointing right, hiding the main logic at the deepest level.

**Q:** Name three ways to reduce nesting.
**A:** Use guard clauses with early returns, combine conditions with and, and extract inner blocks into well-named functions. Replacing chains with lookup tables is another.

**Q:** How do you make sure a flattening refactor is safe?
**A:** Run tests covering every path before and after, ideally after each small step, so that any change in behavior is caught immediately.

## summary
Flatten nested code with guard clauses, merged conditions, extracted functions and early exits. Make small, tested steps, and aim for a main path that reads from top to bottom.

## codenote
The Python sample compares a deeply nested function with its flat equivalent over the same cases. The JavaScript sample uses a named predicate and a continue statement.

## code
### python
```python
def discount_deep(user, total):
    if user is not None:
        if user["active"]:
            if total > 100:
                return 0.1
            else:
                return 0.0
        else:
            return 0.0
    else:
        return 0.0

def discount_flat(user, total):
    if user is None or not user["active"]:
        return 0.0
    return 0.1 if total > 100 else 0.0

cases = [(None, 200), ({"active": False}, 200), ({"active": True}, 50), ({"active": True}, 200)]
deep = [discount_deep(u, t) for u, t in cases]
flat = [discount_flat(u, t) for u, t in cases]
print(deep)
print(flat)
print(deep == flat)
```
Output:
```text
[0.0, 0.0, 0.0, 0.1]
[0.0, 0.0, 0.0, 0.1]
True
```
### javascript
```javascript
const isAdult = (person) => person.age >= 18;

const people = [{ name: "Ada", age: 36 }, { name: "Max", age: 12 }, { name: "Eve", age: 20 }];
const names = [];
for (const person of people) {
  if (!isAdult(person)) continue;
  names.push(person.name);
}
console.log(names);
```
Output:
```text
[ 'Ada', 'Eve' ]
```

## quiz
1. What does a guard clause do for nesting?
   - [ ] Adds a level of indentation
   - [x] Handles a failure case early so the main path needs no extra level
   - [ ] Replaces loops
   - [ ] Declares variables
   > Early exits keep the normal flow unindented.
2. Which refactoring merges if a: if b: X without any code between?
   - [ ] if a or b: X
   - [x] if a and b: X
   - [ ] if not a: X
   - [ ] if a: X else b
   > Both conditions must hold, which is an AND.
3. What is a safe way to flatten code?
   - [ ] Rewrite everything at once
   - [x] Make small steps and run tests after each
   - [ ] Delete the else branches
   - [ ] Add more comments
   > Structural changes must preserve behavior.
4. What does cyclomatic complexity measure?
   - [ ] Execution time
   - [x] The number of independent paths through code
   - [ ] File size
   - [ ] Memory use
   > A high value indicates many branches that need tests and care.

# Testing Branch Coverage
kind: concept
time: Not applicable — coverage describes how much of the code the tests exercised. Collecting it adds some overhead to a test run, which is a tooling concern.
space: Not applicable — coverage records which lines and branches executed, which is not a space analysis of your algorithm.

## intro
A conditional has more than one way through it, and a test that runs only one way proves nothing about the others. Branch coverage measures how many of those ways your tests actually take, and is the quickest way to find the untested decisions in a program.

## theory
Common coverage measures, from weakest to stronger:

- Statement (line) coverage: the percentage of statements executed at least once
- Branch (decision) coverage: the percentage of branch outcomes, true and false of every condition, that were taken
- Condition coverage: every individual boolean sub-expression takes both values
- Multiple-condition (or MC/DC) coverage: used in safety-critical software; each condition is shown to independently affect the outcome

Statement coverage can be misleading. For `if x < 0: x = -x` followed by a return, a single test with x = -5 executes every statement, yet the false branch (x not negative) was never tried. Branch coverage requires both outcomes.

Compound conditions need more care. `a or b` has four input combinations, but a test suite with `(True, False)` and `(False, False)` leaves the second operand's influence unproven in some cases. Short-circuiting means `b` is not evaluated when `a` is true.

Practical points:

- 100 percent coverage does not prove correctness. It shows that code ran, not that results were checked; tests need assertions
- A low-coverage area is a good place to look for missing tests, especially error handling
- Tools: `coverage.py` and `pytest-cov` for Python, the built-in coverage in Node's test runner and Jest, JaCoCo for Java, gcov for C

Choose test inputs for the conditions: one on each side of each comparison, plus the boundary.

## explain
1. List every decision in the function and its outcomes.
2. Write the minimum tests so that each outcome of each decision is taken at least once.
3. Add boundary values for comparisons.
4. For compound conditions, include inputs where each part decides the result.
5. Run a coverage tool and look at the unexecuted branches.
6. Add assertions that check the outcome, since executing a line without checking its result proves little.

## example
The Python function `classify` records the name of the branch it takes in a set called `hits`. After calling it with 5 and -2 the set contains "negative" and "positive", so two of three branches are covered: `2 of 3 branches`. The zero case was never tested. Calling `classify(0)` adds the third branch, giving three of three. The JavaScript sample tests the OR condition `isAdmin || isOwner` with all four combinations and compares each result with the expected one using `assert`.

## real
Teams set a minimum coverage threshold in continuous integration, so that a change that adds untested branches fails the build, and reviewers look at the uncovered lines in the coverage report first.

## pros
- Quickly reveals decisions the tests never exercise
- Gives an objective, trackable measure
- Highlights untested error-handling paths

## cons
- High coverage can coexist with weak assertions
- Chasing 100 percent can waste effort on trivial code
- Branch coverage still misses interactions between conditions

## uses
- Finding untested branches in new code
- Setting quality gates in continuous integration
- Designing a minimal set of test cases for a function
- Reviewing the tests of safety-related logic

## mistakes
- Treating high line coverage as proof of correctness
- Writing tests that run code but assert nothing
- Ignoring the false outcome of each condition
- Skipping error-handling branches that are hard to trigger

## interview
**Q:** What is the difference between statement coverage and branch coverage?
**A:** Statement coverage counts executed statements; branch coverage counts the true and false outcomes of every decision. An if without else can have full statement coverage but only half its branches covered.

**Q:** Does 100 percent coverage mean the code is correct?
**A:** No. It means every line or branch ran during the tests, but the tests may not check the results, and they may not cover combinations of inputs.

**Q:** How many tests are needed for branch coverage of one if-else?
**A:** At least two, one making the condition true and one making it false.

## summary
Branch coverage tells you which decisions your tests never took. Choose inputs for both outcomes of each condition and at the boundaries, assert the results, and treat the number as a guide rather than a guarantee.

## codenote
The Python sample tracks the branches taken to show coverage growing as tests are added. The JavaScript sample exhaustively tests a two-part condition against expected results.

## code
### python
```python
hits = set()

def classify(n):
    if n < 0:
        hits.add("negative")
        return "negative"
    if n == 0:
        hits.add("zero")
        return "zero"
    hits.add("positive")
    return "positive"

for value in (5, -2):
    classify(value)
print(sorted(hits), f"{len(hits)} of 3 branches")

classify(0)
print(sorted(hits), f"{len(hits)} of 3 branches")
```
Output:
```text
['negative', 'positive'] 2 of 3 branches
['negative', 'positive', 'zero'] 3 of 3 branches
```
### javascript
```javascript
const assert = require("assert");

function canEdit(isAdmin, isOwner) {
  return isAdmin || isOwner;
}

const cases = [
  [true, true, true],
  [true, false, true],
  [false, true, true],
  [false, false, false],
];

for (const [admin, owner, expected] of cases) {
  assert.strictEqual(canEdit(admin, owner), expected);
}
console.log(cases.length + " cases passed");
```
Output:
```text
4 cases passed
```

## quiz
1. A single test with x = -5 runs every statement of a function with one if and no else. What is missing?
   - [ ] Nothing, coverage is complete
   - [x] The case where the condition is false
   - [ ] A loop
   - [ ] A comment
   > Branch coverage needs both outcomes of the decision.
2. Does 100 percent coverage prove that code is correct?
   - [ ] Yes
   - [x] No, tests may run code without checking results
   - [ ] Only for Python
   - [ ] Only with a tool
   > Coverage measures execution, not correctness.
3. How many tests give branch coverage of one if-else?
   - [ ] One
   - [x] Two
   - [ ] Four
   - [ ] Zero
   > One test per outcome is the minimum.
4. What is a good use of a coverage report?
   - [ ] Proving there are no bugs
   - [x] Finding decisions and error paths the tests never reached
   - [ ] Making code faster
   - [ ] Removing comments
   > Uncovered branches point to missing test cases.

# Refactoring Conditional Logic
kind: concept
time: Not applicable — refactoring conditions changes structure and readability while preserving behavior, so running time is unaffected apart from small constant factors.
space: Not applicable — the refactorings in this lesson concern how decisions are expressed, not memory.

## intro
Conditional code tends to grow by accretion: one more case here, one more exception there. Refactoring conditional logic untangles it into named pieces, tables and early exits so that each rule is easy to find and change, while the program does exactly what it did before.

## theory
Well-known refactorings for conditionals:

- Decompose conditional: move a complex condition (or each of its branches) into a function whose name says what it means, such as `is_eligible(age, member)` instead of `age >= 18 and member and not banned`
- Consolidate conditional expression: when several checks lead to the same result, combine them with or or and, and name the combination
- Consolidate duplicate fragments: if the same statement appears in every branch, move it before or after the conditional
- Replace nested conditionals with guard clauses
- Replace a conditional chain with a lookup table when each branch only chooses a value
- Replace a conditional with polymorphism when each branch selects a different behavior depending on an object's type: each type implements its own method and the chain disappears
- Remove control flags: replace a boolean variable that exists only to steer a loop by `break` or `return`
- Introduce a null object or default so that the code does not have to test for missing values everywhere

The process is always: have tests that pin the current behavior, make one small change, run the tests, repeat. Never mix refactoring with adding a new rule, because then a failing test could be due to either.

How to choose: a chain that returns different values for different keys is a lookup table; a chain that does different things based on a type is polymorphism; a single hard-to-read condition is a named function.

## explain
1. Write or confirm tests for every branch of the current behavior.
2. Pick the smell: a long chain, a cryptic condition, repeated code in branches or a flag variable.
3. Apply the matching refactoring in the smallest possible step.
4. Run the tests and commit if they pass; undo the step if they fail.
5. Repeat until each condition and function has a clear name and purpose.
6. Only then add the new rule that motivated the cleanup.

## example
The function `price_before` is a four-branch chain that multiplies the base price by a different factor for students, seniors and children. The refactored `price_after` uses a dictionary `RATES` and `RATES.get(kind, 1.0)`, which also gives adults the default factor. The code checks that both functions agree for the four kinds, then prints the new prices `[50.0, 60.0, 30.0, 100.0]`. Adding a new category now means adding a dictionary entry. In JavaScript, a long condition is replaced by a named predicate `canCheckout`.

## real
Pricing engines, workflow systems and game rule sets accumulate hundreds of conditions, and teams that keep rules in tables or objects find that adding a rule takes minutes instead of days of regression testing.

## pros
- Rules become easy to locate, name and change
- Tables and objects make adding cases a data change
- Small tested steps keep the behavior stable

## cons
- Refactoring takes time and produces no visible new feature
- Indirection through tables or classes can obscure simple logic
- Without tests, each change risks silent breakage

## uses
- Taming long if/elif chains
- Making cryptic compound conditions readable
- Preparing code for new rules or categories
- Removing duplicated code in branches

## mistakes
- Refactoring without tests that pin existing behavior
- Combining a refactor with a behavior change in the same commit
- Replacing a simple if with a class hierarchy that is more complex than the problem
- Choosing names that restate the condition instead of explaining it

## interview
**Q:** When would you replace a conditional chain with a lookup table?
**A:** When every branch simply chooses a value for a key, such as a rate by customer type. The mapping becomes data that is easy to read, extend and test.

**Q:** What does replacing conditional with polymorphism mean?
**A:** Instead of testing an object's type in an if chain, each type implements the behavior in its own method, and the language selects the right one at run time.

**Q:** Why should you not change behavior while refactoring?
**A:** If a test fails you will not know whether the restructuring or the new behavior caused it. Keeping them separate makes failures easy to diagnose.

## summary
Name complex conditions, merge duplicates, flatten with guards, turn value-selecting chains into tables and type-based chains into polymorphism, always in small steps with tests, and never together with new features.

## codenote
The Python sample shows a chain replaced by a table and verifies equal behavior. The JavaScript sample names a compound condition as a predicate.

## code
### python
```python
def price_before(kind, base):
    if kind == "student":
        return base * 0.5
    elif kind == "senior":
        return base * 0.6
    elif kind == "child":
        return base * 0.3
    else:
        return base

RATES = {"student": 0.5, "senior": 0.6, "child": 0.3}

def price_after(kind, base):
    return base * RATES.get(kind, 1.0)

kinds = ["student", "senior", "child", "adult"]
print(all(price_before(k, 100) == price_after(k, 100) for k in kinds))
print([price_after(k, 100) for k in kinds])
```
Output:
```text
True
[50.0, 60.0, 30.0, 100.0]
```
### javascript
```javascript
const canCheckout = (cart) =>
  cart.items.length > 0 && cart.paid && !cart.blocked;

console.log(canCheckout({ items: ["pen"], paid: true, blocked: false }));
console.log(canCheckout({ items: [], paid: true, blocked: false }));
```
Output:
```text
true
false
```

## quiz
1. Which refactoring suits a chain where each branch only returns a different value for a key?
   - [ ] Polymorphism
   - [x] A lookup table
   - [ ] A longer chain
   - [ ] A global flag
   > A dictionary makes the mapping data that is easy to extend.
2. What should exist before refactoring a conditional?
   - [ ] A new feature request
   - [x] Tests that pin down the current behavior
   - [ ] A rewrite plan for the whole system
   - [ ] A faster computer
   > Tests prove that each step preserved behavior.
3. What does decomposing a conditional mean?
   - [ ] Deleting the condition
   - [x] Moving a complex condition or branch into a well-named function
   - [ ] Splitting a file
   - [ ] Converting it to a loop
   > A good name explains the meaning of the test.
4. Why avoid combining refactoring with adding behavior?
   - [ ] It is forbidden by compilers
   - [x] A failing test could be due to either change, making diagnosis hard
   - [ ] It makes code slower
   - [ ] It deletes tests
   > Separate commits keep cause and effect clear.
