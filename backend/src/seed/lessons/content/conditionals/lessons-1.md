# Boolean Logic Foundations
kind: concept
time: Not applicable — evaluating a boolean expression is a constant-time step. This lesson is about the algebra of true and false values and how to reason with it.
space: Not applicable — a boolean carries one bit of information, and the lesson concerns the rules for combining them.

## intro
Boolean logic is the algebra of two values, true and false. Every condition in a program, from a login check to a loop test, is a boolean expression, and the laws of this algebra let you simplify, verify and safely rewrite conditions.

## theory
Boolean algebra is built from a few operations:

- AND, true only when both inputs are true
- OR, true when at least one input is true
- NOT, which inverts a value
- XOR (exclusive or), true when exactly one input is true; in most languages written as `a != b` for booleans
- Implication, "if a then b", which is false only when a is true and b is false; it equals `(not a) or b`

A truth table lists every input combination and the output. With n inputs there are 2^n rows, so tables are practical for small expressions and a good way to prove that two expressions are equivalent: if their tables are identical, they are interchangeable.

Laws worth knowing:

- Commutative: `a and b` equals `b and a`
- Associative: grouping of a chain of ANDs or ORs does not matter
- Distributive: `a and (b or c)` equals `(a and b) or (a and c)`
- Absorption: `a or (a and b)` equals `a`
- Identity and domination: `a and True` is `a`, `a or True` is True
- Double negation: `not not a` is `a`
- De Morgan's laws, covered in the logical operators lesson, which let you push negation inward

Simplifying a condition with these laws reduces bugs, because shorter conditions have fewer places to be wrong. Hardware designers use the same algebra to design circuits from gates.

## explain
1. List the inputs of the condition and what each means in plain words.
2. Write the truth table by listing all combinations and filling in the expected output from the specification, not from your code.
3. Compare your expression's table with the specification's table. Any difference is a bug.
4. Simplify with the laws: remove redundant terms using absorption, factor common parts with distribution.
5. Express implication as `not a or b` when a rule says "whenever a, then b".
6. Test the expression on all rows if there are only a few inputs.

## example
The Python sample loops over all four combinations of two booleans using `itertools.product` and prints a row with the inputs and the results of AND, OR and XOR as 0 and 1. The rows are `0 0 0 0 0`, `0 1 0 1 1`, `1 0 0 1 1` and `1 1 1 1 0`. A second line checks absorption on all combinations and prints True. In JavaScript, implication `!a || b` is evaluated for all four inputs; only the pair where a is true and b is false yields false.

## real
Access rules, feature flags and form validation are all boolean expressions. A rule such as "an order ships if it is paid, and also if it is a gift" is easy to get wrong, and a truth table drawn from the specification catches the cases people forget.

## pros
- Truth tables give a complete, mechanical way to verify a condition
- Algebraic laws let you simplify without changing behavior
- The same ideas apply to code, databases, search filters and hardware

## cons
- Tables grow exponentially with the number of inputs
- Natural-language rules are ambiguous, for example whether "or" means exclusive
- Over-simplified expressions can be less readable than the original

## uses
- Proving that a refactored condition behaves like the original
- Designing the rules for permissions and feature flags
- Writing search filters and database queries
- Understanding digital logic circuits

## mistakes
- Treating the everyday word "or" as exclusive when the code uses inclusive OR
- Forgetting that the implication is true whenever the premise is false
- Simplifying without checking the result on all inputs
- Negating part of a compound condition without applying De Morgan correctly

## interview
**Q:** What is a truth table and why is it useful?
**A:** A table listing the output of an expression for every combination of inputs. It lets you verify a condition completely and prove that two expressions are equivalent when their tables match.

**Q:** What is the absorption law?
**A:** a or (a and b) equals a, and a and (a or b) equals a. The extra term never changes the outcome, so it can be removed.

**Q:** How do you express "if a then b" as a boolean expression?
**A:** As (not a) or b. It is false only when a is true and b is false.

## summary
Boolean logic gives you AND, OR, NOT, XOR and implication, truth tables for verification, and laws for simplification. Use them to check conditions against the specification and to rewrite them safely.

## codenote
The Python sample prints a truth table and verifies absorption exhaustively. The JavaScript sample prints the implication table.

## code
### python
```python
from itertools import product

for a, b in product([False, True], repeat=2):
    print(int(a), int(b), int(a and b), int(a or b), int(a != b))

print(all((a or (a and b)) == a for a, b in product([False, True], repeat=2)))
```
Output:
```text
0 0 0 0 0
0 1 0 1 1
1 0 0 1 1
1 1 1 1 0
True
```
### javascript
```javascript
for (const a of [true, false]) {
  for (const b of [true, false]) {
    console.log(a, b, !a || b);
  }
}
```
Output:
```text
true true true
true false false
false true true
false false true
```

## quiz
1. When is an XOR of two booleans true?
   - [ ] When both are true
   - [ ] When both are false
   - [x] When exactly one is true
   - [ ] Always
   > Exclusive or excludes the case where both inputs are true.
2. How many rows does the truth table of an expression with 3 inputs have?
   - [ ] 3
   - [ ] 6
   - [x] 8
   - [ ] 9
   > There are 2 to the power 3 combinations.
3. Which expression is equivalent to the implication "if a then b"?
   - [ ] a and b
   - [x] (not a) or b
   - [ ] a or (not b)
   - [ ] not (a or b)
   > The implication fails only when a is true and b is false.
4. What does the absorption law say?
   - [ ] a and a equals 2a
   - [x] a or (a and b) equals a
   - [ ] not (a and b) equals a
   - [ ] a and b equals b and a only when a is true
   > The extra term never changes the result, so it can be dropped.

# If Else Statements
kind: concept
time: Not applicable — an if statement evaluates a condition once and runs one branch, which is constant work beyond the branch bodies.
space: Not applicable — branching does not allocate memory by itself.
practice: maximum-of-two-numbers, count-even-numbers

## intro
The if statement lets a program choose between actions based on a condition. With an optional else branch it covers "do this or do that", and it is the first tool for making a program respond to its data instead of running the same steps every time.

## theory
The form is the same in every mainstream language, with different punctuation:

- Python: `if condition:` followed by an indented block, then optionally `else:` and another block
- C, Java, JavaScript: `if (condition) { ... } else { ... }`, where braces mark the blocks

How it works:

- The condition is evaluated once. In Python and JavaScript any value can be a condition: zero, empty strings and empty collections count as false, everything else as true.
- If it is true, the first block runs and the else block is skipped; otherwise only the else block runs.
- Exactly one of the two blocks executes. The code after the whole statement runs either way.

Details that cause bugs:

- In C-family languages, braces are optional for a single statement, but omitting them leads to the dangling else problem: an else belongs to the nearest preceding if, whatever the indentation suggests. Always use braces.
- Using `=` instead of `==` in a condition assigns instead of comparing in C and JavaScript.
- Comparing a boolean to True (`if flag == True`) is redundant; write `if flag`.
- Indentation is part of the syntax in Python: a block's extent is decided by it, so mixing tabs and spaces breaks code.

An if without else is perfectly valid and is used when there is nothing to do in the other case.

## explain
1. State the decision in words: "if the buyer is at least 18 and registered, allow it; otherwise refuse".
2. Translate the condition into a boolean expression.
3. Write the true block, then the else block, each doing one clear thing.
4. Make sure that the two blocks cover all situations the condition can produce.
5. Run the code with a value for each side of the decision, plus values at the boundary.
6. Keep the blocks short; move long bodies into functions.

## example
The function `can_vote(age, registered)` returns "eligible" when the age is at least 18 and the person is registered, and "not eligible" otherwise. The calls for (20, True), (17, True) and (30, False) print `eligible`, `not eligible` and `not eligible`, one result per decision side. A second snippet uses an empty list directly as a condition and prints "empty" because an empty list is falsy. In JavaScript a stock count of 0 is falsy and takes the else branch, and the strict comparison prints "zero". The C sample, not run here, shows why braces matter with nested ifs.

## real
Every application is full of these decisions: show an error or continue, apply a discount or not, redirect a logged-out user. Review checklists commonly flag if statements without braces in C because of the dangling else bug.

## pros
- Direct and readable expression of a two-way decision
- Works with any boolean-like value
- The basis for all more advanced branching

## cons
- Long chains of nested ifs become hard to follow
- What counts as true for a non-boolean value is language specific, so porting a condition can change its meaning
- Missing braces in C-family languages invite bugs

## uses
- Validating input before using it
- Choosing between two behaviors based on a value
- Handling optional values that may be missing
- Guarding an action with a permission check

## mistakes
- Writing = where == was intended
- Omitting braces in C-family code and misreading which if an else belongs to
- Comparing booleans to True or False explicitly
- Leaving a branch empty by accident or placing the wrong statement under the else

## interview
**Q:** What happens when the condition of an if statement is false and there is no else?
**A:** The block is skipped and the program continues with the next statement after the if.

**Q:** What is the dangling else problem?
**A:** In languages that allow an if without braces, an else attaches to the nearest unmatched if, which may not be the one the indentation suggests. Always using braces removes the ambiguity.

**Q:** Which values count as false in a Python condition?
**A:** False, None, zero, and empty strings and collections. Everything else is true.

## summary
An if statement runs one block when its condition is true, and the else block otherwise. Use clear boolean conditions, always use braces in C-family languages and test both sides of every decision.

## codenote
The Python sample covers a compound condition and truthiness of an empty list. The JavaScript sample uses falsy zero and a strict comparison. The C sample shows the dangling else with braces added for clarity.

## code
### python
```python
def can_vote(age, registered):
    if age >= 18 and registered:
        return "eligible"
    else:
        return "not eligible"

print(can_vote(20, True), can_vote(17, True), can_vote(30, False))

items = []
if items:
    print("has items")
else:
    print("empty")
```
Output:
```text
eligible not eligible not eligible
empty
```
### javascript
```javascript
const stock = 0;

if (stock) {
  console.log("in stock");
} else {
  console.log("sold out");
}

if (stock === 0) {
  console.log("zero");
}
```
Output:
```text
sold out
zero
```
### c
```c
#include <stdio.h>

int main(void) {
    int a = 1;
    int b = -1;
    if (a > 0) {
        if (b > 0) {
            printf("both\n");
        } else {
            printf("a only\n");
        }
    }
    return 0;
}
```

## quiz
1. What runs when an if condition is false and there is no else branch?
   - [ ] The program stops
   - [x] The block is skipped and execution continues after the if
   - [ ] The else of another if
   - [ ] An error is raised
   > An if without else simply does nothing when the condition is false.
2. Which Python value is falsy?
   - [ ] The string "0"
   - [ ] The list [0]
   - [x] An empty list
   - [ ] The number 1
   > Empty containers are falsy, but a non-empty list is truthy even if it holds zero.
3. Why should braces always be used around if bodies in C-family languages?
   - [ ] They make the code faster
   - [x] They remove the ambiguity of which if an else belongs to
   - [ ] They are required for comparisons
   - [ ] They declare variables
   > Without braces an else attaches to the nearest if, whatever the indentation.
4. What is the preferred way to test a boolean variable named flag?
   - [ ] if flag == True:
   - [x] if flag:
   - [ ] if flag = True:
   - [ ] if True == flag:
   > Comparing to True is redundant; the variable is already a condition.

# Else If Chains
kind: concept
time: Not applicable — a chain evaluates conditions one after another until one matches, which for a handful of branches is negligible work.
space: Not applicable — the chain does not allocate memory; the concern is the logic of ordering the conditions.

## intro
When a decision has more than two outcomes, an else-if chain tests conditions in order and runs the first branch that matches. The order of the tests is part of the logic, and a wrong order is one of the most common causes of subtly incorrect results.

## theory
The shape: `if c1: ... elif c2: ... elif c3: ... else: ...` in Python, and `if (c1) {...} else if (c2) {...} else {...}` in C-family languages.

Rules of evaluation:

- Conditions are tested from top to bottom
- The first true condition wins; its block runs and the rest of the chain is skipped entirely
- The final else, if present, handles everything that matched no condition
- Exactly one branch runs (or none, if there is no else and nothing matched)

Because earlier tests shadow later ones, later conditions can assume the earlier ones failed. In a grade table, `elif score >= 80` implicitly means "at least 80 and below 90", since 90 and above were already handled. This keeps conditions short, but it also means that reordering the branches changes the behavior.

Guidelines:

- Order range tests from the most restrictive end, so each test narrows from one side
- Put the most specific condition before the general ones
- Always consider a final else for unexpected values
- If the conditions test one variable against fixed values, consider a switch or a lookup table
- If the chain is long and growing, a data table is usually clearer than code

## explain
1. List the outcomes and the rule for each, as a table of ranges or categories.
2. Check that the ranges cover everything and do not overlap, or that the ordering resolves overlaps.
3. Write the tests in an order where each one is correct given that earlier ones failed.
4. Add a final else for the leftover case, even if it only raises an error.
5. Test the boundary values of every range, such as exactly 90 and exactly 89.
6. If you reorder branches, retest, because behavior can change.

## example
The function `grade` tests `score >= 90`, then 80, then 70, and falls back to "F". For the scores 95, 90, 85, 70 and 69 it returns A, A, B, C and F; the boundary values 90 and 70 land in the higher grade, as designed. A broken version tests `score >= 70` first, so a score of 95 matches immediately and returns "C". In JavaScript, a ticket-price function checks age under 3, under 13, under 65 and otherwise, giving 0, 5, 12 and 8 for ages 2, 10, 30 and 70.

## real
Tax brackets, shipping rates, grading scales and HTTP status handling are chains of ordered ranges. A misordered test in a pricing chain can undercharge every customer in a bracket without any error message.

## pros
- Handles any number of outcomes with plain, readable code
- Conditions stay short because earlier branches already exclude cases
- A final else gives a natural place for the default

## cons
- Order dependence makes edits risky
- Long chains are tedious to read and extend
- Overlapping or gapped ranges are easy to miss

## uses
- Grading and rating scales
- Pricing tiers and tax brackets
- Mapping numeric ranges to categories
- Dispatching on a small number of conditions

## mistakes
- Testing the broadest condition first so later branches never run
- Forgetting the final else and returning nothing for unexpected values
- Writing overlapping ranges with inconsistent boundaries
- Using separate if statements where one chain was intended, so several branches run

## interview
**Q:** What happens if two conditions in an else-if chain are both true?
**A:** Only the first matching branch runs, because after it executes the rest of the chain is skipped.

**Q:** Why does the order of conditions matter?
**A:** Each test is evaluated only if the earlier ones were false, so putting a broad condition first can swallow cases meant for narrower ones.

**Q:** What is the difference between a chain of elifs and several separate ifs?
**A:** In a chain at most one branch runs. With separate ifs every condition is tested independently, so several blocks can run.

## summary
An else-if chain selects the first matching branch, so order is logic. Plan ranges, order tests from one end, add a final else and test every boundary.

## codenote
The Python sample prints grades for boundary scores and contrasts a correct and a misordered chain. The JavaScript sample selects a ticket price by age range.

## code
### python
```python
def grade(score):
    if score >= 90:
        return "A"
    elif score >= 80:
        return "B"
    elif score >= 70:
        return "C"
    else:
        return "F"

def broken_grade(score):
    if score >= 70:
        return "C"
    elif score >= 90:
        return "A"
    return "F"

print([grade(s) for s in (95, 90, 85, 70, 69)])
print(broken_grade(95))
```
Output:
```text
['A', 'A', 'B', 'C', 'F']
C
```
### javascript
```javascript
function ticketPrice(age) {
  if (age < 3) return 0;
  else if (age < 13) return 5;
  else if (age < 65) return 12;
  else return 8;
}

console.log([2, 10, 30, 70].map(ticketPrice));
```
Output:
```text
[ 0, 5, 12, 8 ]
```

## quiz
1. In an else-if chain, what happens after the first condition that is true?
   - [ ] All remaining conditions are tested as well
   - [x] Its block runs and the rest of the chain is skipped
   - [ ] The chain restarts
   - [ ] The program stops
   > Only one branch of a chain executes.
2. Why does the grade function test score >= 90 before score >= 80?
   - [ ] Alphabetical order
   - [x] A score of 95 would otherwise match the broader condition first
   - [ ] Python requires descending order
   - [ ] It makes the code faster
   > Each test relies on the earlier ones having failed.
3. What is the effect of writing three separate if statements instead of one chain?
   - [ ] Nothing
   - [x] Several of them can run, because each condition is tested independently
   - [ ] Only the first runs
   - [ ] A syntax error
   > A chain makes the branches mutually exclusive.
4. What should you always consider adding at the end of a chain?
   - [ ] A comment
   - [x] A final else for values nobody planned for
   - [ ] A loop
   - [ ] A global variable
   > The default branch handles unexpected input explicitly.

# Switch Case Statements
kind: concept
time: Not applicable — a switch selects a branch by comparing one value with constants. Compilers may turn it into a jump table, but that is an implementation detail rather than something to analyse here.
space: Not applicable — switching between branches uses no extra memory of note.

## intro
A switch statement chooses among many branches by comparing one value with a list of constants. It is neater than a long else-if chain when you are testing the same variable against fixed values, but it has a famous trap, fall-through, that every programmer should recognise.

## theory
In C, Java and JavaScript the shape is the keyword `switch` with the expression in parentheses, followed by a braced block of `case` labels, each usually ending in `break`, and an optional `default` label.

How it behaves:

- The expression is evaluated once and compared with each `case` constant in order
- Execution starts at the first matching case and continues downward through the following cases until a `break`, `return` or the end — this is fall-through
- `default` runs when no case matches, and can appear anywhere though it usually comes last
- JavaScript compares with strict equality, so the string "1" does not match the number 1
- C requires integer-like constants; Java allows strings and enums; JavaScript allows any expression

Fall-through is occasionally useful for grouping: several consecutive `case` labels with no code between them share one body. Accidental fall-through, caused by a forgotten `break`, is a classic bug.

Python has no switch statement before version 3.10. The older idioms are an if/elif chain or a dictionary that maps values to functions or results. Version 3.10 added structural pattern matching with `match` and `case`, which has no fall-through, supports alternatives with `|`, binding of parts of values and a wildcard `_` as the default.

Switch fits when there are many discrete values, such as command names, days or state codes. It does not fit ranges or complex conditions.

## explain
1. Confirm that all branches test the same expression against constants.
2. List the constants and group those that share an action.
3. Write each case with its body and end it with break or return, unless you deliberately want fall-through and have commented it.
4. Add a default branch that handles unknown values.
5. In Python use match, a dictionary or an if/elif chain, depending on the version.
6. Test one value from each case plus an unmatched value.

## example
The JavaScript function `days(month)` returns 28 for "feb", 30 for four grouped months written as consecutive case labels, and 31 by default, so the calls print `28 30 31`. A second switch on the value 2 has no break after cases 1 and 2: the matching case pushes "two", falls through into case 3 and pushes "three", then hits a break, so the log is `['two', 'three']`. The Python function uses `match` to classify "Sun" as weekend, "Wed" as weekday and anything else as unknown.

## real
Interpreters dispatch on opcodes with switches, network code handles message types, and command-line tools select the action from the first argument. Style guides in C require a comment wherever fall-through is intended.

## pros
- Clear mapping from one value to many branches
- Grouped case labels share one body without repetition
- Compilers can optimise dense switches

## cons
- Accidental fall-through when break is forgotten
- Limited to equality tests on constants in most languages
- Python gained it only recently, so older code uses other patterns

## uses
- Handling commands, message types and opcodes
- Mapping codes or names to results
- Implementing state machines
- Selecting behavior from a menu choice

## mistakes
- Forgetting break and falling through into the next case
- Omitting the default branch
- Expecting a JavaScript switch to match "2" with 2
- Trying to use ranges as case labels

## interview
**Q:** What is fall-through in a switch statement?
**A:** After a case matches, execution continues into the following cases until a break, return or the end of the switch, unless something stops it.

**Q:** How does Python handle switch-like logic?
**A:** From version 3.10 with the match statement. Before that, with if/elif chains or dictionaries that map values to results or functions.

**Q:** When is a dictionary a better choice than a switch?
**A:** When the mapping is data rather than control flow, for example turning codes into names or functions, because the table can be built, extended and tested separately.

## summary
Use a switch for many branches on one value, always end cases with break or return, include a default and comment any intentional fall-through. In Python use match or a dictionary.

## codenote
The JavaScript sample shows grouped cases, a default and an accidental fall-through. The Python sample uses structural pattern matching with alternatives and a wildcard.

## code
### python
```python
def day_kind(day):
    match day:
        case "Sat" | "Sun":
            return "weekend"
        case "Mon" | "Tue" | "Wed" | "Thu" | "Fri":
            return "weekday"
        case _:
            return "unknown"

print(day_kind("Sun"), day_kind("Wed"), day_kind("Foo"))
```
Output:
```text
weekend weekday unknown
```
### javascript
```javascript
function days(month) {
  switch (month) {
    case "feb":
      return 28;
    case "apr":
    case "jun":
    case "sep":
    case "nov":
      return 30;
    default:
      return 31;
  }
}
console.log(days("feb"), days("jun"), days("jan"));

const log = [];
switch (2) {
  case 1:
    log.push("one");
  case 2:
    log.push("two");
  case 3:
    log.push("three");
    break;
  default:
    log.push("other");
}
console.log(log);
```
Output:
```text
28 30 31
[ 'two', 'three' ]
```

## quiz
1. What causes fall-through in a switch?
   - [ ] Using default
   - [x] Omitting break at the end of a case
   - [ ] Using strings as constants
   - [ ] Declaring variables
   > Execution simply continues into the next case body.
2. What does the underscore pattern do in a Python match statement?
   - [ ] Matches only the underscore character
   - [x] Acts as a wildcard that matches anything, like a default
   - [ ] Ends the program
   - [ ] Declares a variable named underscore
   > It is the catch-all case.
3. In JavaScript, does switch (1) match case "1"?
   - [ ] Yes, values are converted
   - [x] No, switch uses strict equality
   - [ ] Only inside functions
   - [ ] Only with default
   > The string "1" is not strictly equal to the number 1.
4. Which kind of test does a switch not support well?
   - [ ] Matching command names
   - [ ] Matching day codes
   - [x] Ranges such as scores from 80 to 89
   - [ ] Matching opcodes
   > Ranges need comparisons, so an if-else chain suits them better.

# Nested Conditionals
kind: concept
time: Not applicable — nesting changes how many tests run on a path, but each path is short and the cost is constant for practical purposes.
space: Not applicable — nested conditions allocate nothing; the concern is the shape of the logic.

## intro
A nested conditional places one decision inside another: only after the first condition passes does the program ask the second question. It mirrors how we decompose real choices, but each extra level makes the code harder to read and to test.

## theory
Structure:

- The outer if decides whether the inner decision is relevant at all
- Each leaf of the nested structure is one combination of outcomes, so n yes/no questions create up to 2^n leaves
- Indentation shows the depth. In Python it is the syntax itself; in C-family languages braces plus indentation make it readable.

A nested conditional can be seen as a decision tree. Drawing the tree is the best way to design and review it: each node is a question, each edge an answer, each leaf an action.

Equivalent forms:

- Combine conditions with and: `if a: if b: X` is the same as `if a and b: X`, provided there is no else in between
- Flatten with else-if when the inner questions are alternatives
- Replace with a lookup table or a function when the combinations are many

Use nesting when the inner question truly depends on the outer answer, such as asking about a shipping weight only after knowing the destination. Avoid it when the questions are independent, which is better expressed as separate checks or as one combined condition.

Common problems are mismatched else branches (which if does this else belong to?), duplicated actions on different leaves and missing leaves where a combination was never considered.

## explain
1. Draw the decision tree: the first question at the top, the answers branching below.
2. Check that every leaf has exactly one action and that no combination is missing.
3. Write the code with one level of indentation per question.
4. Make the else of each level match the question it answers.
5. Count the leaves and test each one with a representative input.
6. If the nesting goes deeper than two or three levels, consider flattening it.

## example
The shipping label function asks first whether the country is "US". Inside each answer it asks whether the weight is at most 1. The four leaves return "US light", "US heavy", "Intl light" and "Intl heavy", and the calls for the combinations (US, 0.5), (US, 3), (FR, 0.5) and (FR, 3) print one of each. The JavaScript sample builds the same labels without nesting by computing one part from each question, which shows that independent questions do not need a nested structure.

## real
Insurance quotes, tax forms and support-ticket routing are decision trees. Reviewing them as diagrams exposes missing combinations that are hard to see in code.

## pros
- Mirrors dependent decisions naturally
- Each question is stated once
- Easy to draw and verify as a tree

## cons
- Deep nesting reduces readability
- The number of paths grows quickly with each level
- Duplicated leaf actions are common

## uses
- Decisions where the second question depends on the first answer
- Routing by category and then by detail
- Multi-step validation of related fields
- Interpreting forms with conditional sections

## mistakes
- Nesting independent questions that could be combined
- Misplacing an else so that it answers the wrong question
- Forgetting a leaf, so one combination does nothing
- Letting the depth grow until nobody dares to change it

## interview
**Q:** When is a nested conditional the right structure?
**A:** When the second question only makes sense after the first has been answered, so the inner decision depends on the outer one.

**Q:** How do you test a nested conditional completely?
**A:** Enumerate its leaves, which are the possible combinations of answers, and supply an input for each one, including values at the boundaries of each condition.

**Q:** How can nested ifs be flattened?
**A:** Combine conditions with and when there is no else in between, use early returns for the failure cases, or turn the combinations into a lookup table.

## summary
Nested conditionals express dependent decisions as a tree. Draw the tree, make sure every leaf is covered and tested, and flatten the structure when the questions are independent or the depth grows.

## codenote
The Python sample implements a four-leaf tree. The JavaScript sample computes the same four results without nesting, as the questions are independent.

## code
### python
```python
def shipping_label(country, weight):
    if country == "US":
        if weight <= 1:
            return "US light"
        else:
            return "US heavy"
    else:
        if weight <= 1:
            return "Intl light"
        else:
            return "Intl heavy"

print(shipping_label("US", 0.5), shipping_label("US", 3))
print(shipping_label("FR", 0.5), shipping_label("FR", 3))
```
Output:
```text
US light US heavy
Intl light Intl heavy
```
### javascript
```javascript
function label(country, weight) {
  const zone = country === "US" ? "US" : "Intl";
  const size = weight <= 1 ? "light" : "heavy";
  return zone + " " + size;
}

console.log(label("US", 0.5), label("US", 3));
console.log(label("FR", 0.5), label("FR", 3));
```
Output:
```text
US light US heavy
Intl light Intl heavy
```

## quiz
1. How many leaves can a nested structure of 3 yes-or-no questions have?
   - [ ] 3
   - [ ] 6
   - [x] 8
   - [ ] 9
   > Each question doubles the number of possible paths.
2. When can two nested ifs without else be merged into one?
   - [ ] Never
   - [x] When the condition is combined with and
   - [ ] Only with a switch
   - [ ] Only in Python
   > if a: if b: X is equivalent to if a and b: X.
3. What is a good way to design a nested conditional?
   - [ ] Write code first and see what happens
   - [x] Draw the decision tree and check every leaf
   - [ ] Add more else branches
   - [ ] Use global variables
   > A tree shows missing combinations before they become bugs.
4. When is nesting unnecessary?
   - [ ] When the inner question depends on the outer
   - [x] When the questions are independent and can be answered separately
   - [ ] When there is only one question
   - [ ] When the language is Python
   > Independent questions can be combined or computed side by side.

# Guard Clauses
kind: concept
time: Not applicable — a guard clause is a single test at the top of a function, which is constant work. The benefit is clarity of control flow.
space: Not applicable — guard clauses affect how code is arranged, not how much memory it uses.

## intro
A guard clause is a check at the beginning of a function that handles an invalid or special case immediately by returning, raising an error or skipping to the next item. What remains afterward is the normal path, written without extra indentation.

## theory
Compare two ways to write the same function:

- Nested style: `if valid: if has_items: if paid: do the real work`, with the real work buried at the deepest level and the failure cases scattered in several else branches at the bottom
- Guard style: `if not valid: return ...`, then `if not has_items: return ...`, then `if not paid: return ...`, and then the real work at the base level

Principles:

- Test the exceptional conditions first and leave the function (or the loop iteration) at once
- Each guard states one precondition and the reaction to its violation, close together
- After the guards, the reader knows all of those conditions hold, so the main logic needs no checks
- Use `return` for ordinary outcomes, `raise` (or `throw`) for errors that the caller must not ignore, and `continue` in loops to skip an item
- Keep the order meaningful: cheapest and most fundamental checks first, and the check that makes later ones safe, such as a null test, before them

Guard clauses are not always right. A function with a single, important exit point (some safety rules require this) or with cleanup that must run on every path may need a different structure, such as `try/finally` or `with`. In very short functions, an if/else is perfectly clear.

## explain
1. List the preconditions of the function: what must be true for the main logic to make sense.
2. Write one test for each failure, at the top, with its reaction.
3. Order them so that earlier guards protect later ones.
4. Write the main logic without nesting beneath the guards.
5. Make sure cleanup is handled by `finally` or `with` rather than by a single return.
6. Test each guard with a value that triggers only that one.

## example
The function `ship_order` begins with a guard that raises ValueError if there is no order at all. It then returns "nothing to ship" for an empty item list, "awaiting payment" for an unpaid order, and only after those returns "shipping 2 items" for the normal case. The calls show each guard firing alone and the normal path last. The JavaScript loop uses `continue` as a guard: empty strings and non-numeric text are skipped, so only the valid rows 10 and 7 add up to a total of 17.

## real
Web request handlers begin with guards for authentication, permissions and input validation, and the main logic follows. Code reviewers often ask to turn a deeply nested function into guards because the result reads like a checklist.

## pros
- Removes nesting and shortens the main path
- Keeps each failure next to its test
- Makes preconditions visible at the top of the function

## cons
- Multiple return points complicate functions that need uniform cleanup
- Many guards at the top can look heavy for trivial functions
- Guards that silently return can hide problems if errors should be reported

## uses
- Validating arguments before doing work
- Handling empty or missing input
- Skipping unwanted items inside loops
- Checking permissions at the start of a request handler

## mistakes
- Silently returning for conditions that should raise an error
- Putting the main logic inside an else after a guard that already returns
- Ordering guards so that a later one runs on invalid data
- Using guards where cleanup must run on every path without try/finally

## interview
**Q:** What is a guard clause?
**A:** An early check that handles an invalid or special case by returning, raising or skipping, so that the rest of the function is the normal path with less nesting.

**Q:** When should a guard raise an exception instead of returning a value?
**A:** When the situation is a caller error or an unexpected state that should not be ignored, such as a missing required argument, rather than a normal outcome like an empty list.

**Q:** Why might a function with several returns need try/finally?
**A:** If resources such as files or locks must be released on every path, a finally block guarantees cleanup however the function exits.

## summary
Guard clauses put preconditions first and leave early, leaving a flat, readable main path. Choose return or raise by the kind of condition, order guards sensibly and use finally for mandatory cleanup.

## codenote
The Python sample shows layered guards that return or raise. The JavaScript sample uses continue as a guard inside a loop.

## code
### python
```python
def ship_order(order):
    if order is None:
        raise ValueError("no order")
    if not order["items"]:
        return "nothing to ship"
    if not order["paid"]:
        return "awaiting payment"
    return f"shipping {len(order['items'])} items"

print(ship_order({"items": [], "paid": True}))
print(ship_order({"items": ["pen"], "paid": False}))
print(ship_order({"items": ["pen", "ink"], "paid": True}))

try:
    ship_order(None)
except ValueError as error:
    print("ValueError:", error)
```
Output:
```text
nothing to ship
awaiting payment
shipping 2 items
ValueError: no order
```
### javascript
```javascript
const rows = ["10", "", "x", "7"];
let total = 0;

for (const row of rows) {
  if (row === "") continue;
  const value = Number(row);
  if (Number.isNaN(value)) continue;
  total += value;
}

console.log(total);
```
Output:
```text
17
```

## quiz
1. What is the main advantage of guard clauses?
   - [ ] They make code run faster
   - [x] They remove nesting and keep the normal path flat
   - [ ] They replace loops
   - [ ] They hide errors
   > Handling the exceptional cases first leaves the main logic uncluttered.
2. In a loop, which statement acts as a guard that skips the current item?
   - [ ] break
   - [x] continue
   - [ ] pass
   - [ ] return
   > continue jumps to the next iteration.
3. When should a guard raise an exception?
   - [ ] For every empty input
   - [x] When the caller made a mistake or the state is unexpected
   - [ ] Never
   - [ ] Only inside loops
   > Errors that must not be ignored are better signalled by exceptions.
4. Why order a null check before other guards?
   - [ ] It is shorter
   - [x] Later guards may access the object and fail if it is missing
   - [ ] Null checks are free
   - [ ] The order does not matter
   > Earlier guards protect the checks that follow.

# Comparing Floating Point Values
kind: concept
time: Not applicable — a tolerance comparison is a constant-time arithmetic check. The lesson is about choosing the right test, not about running time.
space: Not applicable — comparing numbers does not use extra memory.

## intro
In a condition, comparing two floating-point numbers with equality often gives the wrong answer because tiny rounding errors separate values that are mathematically equal. Using a tolerance is the standard fix, but choosing the right kind of tolerance is the part that needs care.

## theory
Why equality fails: results such as `0.1 + 0.2` differ from `0.3` by about 5.5e-17, which is the gap between neighbouring representable values at that magnitude. The spacing between floats grows with the size of the number, so the error grows too.

Two kinds of tolerance:

- Absolute tolerance: `abs(a - b) <= eps`. It works well for values near a known scale, but a fixed epsilon is too small for large numbers (neighbouring floats near 1e15 differ by 0.125) and too large for tiny ones.
- Relative tolerance: `abs(a - b) <= rel * max(abs(a), abs(b))`. It scales with the numbers, which suits large magnitudes, but it fails when comparing with zero, since any non-zero value is infinitely far away in relative terms.

The practical answer combines both, which is what Python's `math.isclose(a, b, rel_tol=1e-09, abs_tol=0.0)` does: the values are close if the difference is within the larger of the two allowances. For comparisons with zero you must supply an `abs_tol`.

Other cases:

- Ordering comparisons `<` and `>` are fine for rough thresholds, but values very near the boundary can fall on either side
- NaN is not equal to anything and fails every ordering comparison, so `if x < 0 ... else ...` sends NaN into the else branch
- Check for NaN with `math.isnan` or `Number.isNaN`, and for infinity with `math.isinf`
- Money should use integers or decimals, where exact equality is meaningful

## explain
1. Ask whether floats are needed at all; use integers or decimals for exact quantities.
2. Choose the tolerance from the problem: how close is close enough in the units of the data?
3. Use a relative tolerance for values of varying size, plus an absolute tolerance near zero.
4. Prefer the library function (`math.isclose`, `numpy.isclose`) over a hand-written one.
5. Handle NaN and infinity explicitly before comparing.
6. Test with values around the threshold, including very large and very small ones.

## example
The Python sample compares `0.1 + 0.2` with `0.3`: equality gives False, while an absolute tolerance of 1e-9 and `math.isclose` both give True. Comparing 1e-10 with 0.0 using `isclose` gives False, because a relative tolerance cannot work with zero, but adding `abs_tol=1e-9` makes it True. For two large numbers near 1e15 that differ by 0.125, a fixed absolute tolerance of 1e-9 says they differ while `isclose` with a relative tolerance says they are close. The JavaScript function `nearlyEqual` combines both tolerances.

## real
Simulation and graphics code compares positions and distances with tolerances, test suites compare computed numbers with an expected value plus or minus a tolerance, and a hard-coded equality is a frequent cause of flaky tests.

## pros
- A tolerance makes comparisons reflect the real precision of the data
- Combined absolute and relative tolerances work across scales
- Library helpers encode well-tested rules

## cons
- The right tolerance is a judgement, not a constant
- Tolerance comparisons are not transitive, so equal-within-epsilon is not a true equivalence
- NaN and infinity need separate handling

## uses
- Checking calculation results in tests
- Detecting when an iterative process has converged
- Comparing coordinates and measurements
- Deciding whether two computed prices are effectively the same

## mistakes
- Comparing computed floats with the equality operator
- Using one fixed epsilon for numbers of all magnitudes
- Using only a relative tolerance when one value may be zero
- Forgetting that NaN fails every comparison

## interview
**Q:** Why should floats not be compared with ==?
**A:** Arithmetic introduces tiny rounding errors, so values that are mathematically equal may differ in their last bits. A tolerance accepts values that are close enough.

**Q:** What is the difference between absolute and relative tolerance?
**A:** Absolute tolerance accepts a fixed difference regardless of size, while relative tolerance accepts a difference proportional to the magnitudes. Relative tolerance fails near zero, so both are often combined.

**Q:** What does math.isclose do?
**A:** It returns True if two numbers are within the larger of a relative tolerance and an absolute tolerance of each other.

## summary
Compare floats with a tolerance chosen for the data: relative for varying magnitudes, absolute near zero, and both where unsure. Handle NaN and infinity first and use integers or decimals for exact amounts.

## codenote
The Python sample contrasts equality with several tolerance tests, including comparison with zero and with large values. The JavaScript sample combines relative and absolute tolerance.

## code
### python
```python
import math

a, b = 0.1 + 0.2, 0.3
print(a == b, abs(a - b) < 1e-9, math.isclose(a, b))
print(math.isclose(1e-10, 0.0), math.isclose(1e-10, 0.0, abs_tol=1e-9))

big1, big2 = 1e15 + 0.3, 1e15 + 0.4
print(abs(big1 - big2) < 1e-9, math.isclose(big1, big2, rel_tol=1e-9))
```
Output:
```text
False True True
False True
False True
```
### javascript
```javascript
function nearlyEqual(a, b, rel = 1e-9, abs = 1e-12) {
  return Math.abs(a - b) <= Math.max(rel * Math.max(Math.abs(a), Math.abs(b)), abs);
}

console.log(0.1 + 0.2 === 0.3, nearlyEqual(0.1 + 0.2, 0.3));
console.log(nearlyEqual(1e-10, 0), nearlyEqual(1e-13, 0));
```
Output:
```text
false true
false true
```

## quiz
1. Why does math.isclose(1e-10, 0.0) return False with default settings?
   - [ ] It has a bug
   - [x] The default has no absolute tolerance, and a relative tolerance cannot accept anything against zero
   - [ ] 1e-10 is NaN
   - [ ] Zero is not a number
   > Supply abs_tol when comparing with zero.
2. When is a fixed absolute epsilon a poor choice?
   - [ ] When comparing values near 1
   - [x] When the numbers vary greatly in size, such as around 1e15
   - [ ] When comparing integers
   - [ ] Never
   > Neighbouring floats are far apart for large values, so a tiny epsilon rejects almost everything.
3. What does x < 0 evaluate to when x is NaN?
   - [ ] True
   - [x] False
   - [ ] An error
   - [ ] NaN
   > Every ordinary comparison with NaN is false.
4. What is the best way to compare amounts of money exactly?
   - [ ] Use floats with a small epsilon
   - [x] Use integers in cents or decimal types, where equality is exact
   - [ ] Convert to strings
   - [ ] Use a relative tolerance
   > Exact representations make equality meaningful.

# Range Checks and Boundaries
kind: concept
time: Not applicable — a range check is two comparisons, which is constant work. The lesson concerns getting the edges of the range right.
space: Not applicable — a check allocates nothing; the issue is correct inclusion and exclusion of the end points.

## intro
A range check asks whether a value lies between a lower and an upper limit. The code is short, but the edges are where programs fail: whether each end is included, how adjacent ranges meet, and what happens exactly at the boundary values.

## theory
Intervals can include or exclude each end:

- Closed on both ends: `low <= x <= high`
- Half-open: `low <= x < high` includes the start and excludes the end — the convention used by Python's `range`, slicing, and most array indexing
- Open: `low < x < high`

The half-open form is the most useful because adjacent ranges meet without gaps or overlaps. Ages 0 to 13, 13 to 20 and 20 to 65 written as `0 <= age < 13`, `13 <= age < 20`, `20 <= age < 65` assign every integer to exactly one bucket. With closed ends, 13 would belong to two buckets.

Python allows chained comparisons for ranges; other languages write two comparisons joined with AND. The number of integers in a half-open interval is simply `high - low`: `len(range(10, 20))` is 10.

Boundary testing is the discipline of checking the values at, just below and just above each edge. Bugs live at the edges (off-by-one errors), so tests for a range `[0, 13)` should include -1, 0, 1, 12, 13 and 14.

Related operations:

- Clamping forces a value into a range: `min(max(x, low), high)`
- Validation rejects out-of-range input instead of adjusting it
- Wrapping maps values around a range with the remainder operator, for instance for angles or clock times

Also decide what to do for values outside all ranges: an explicit "invalid" result is better than falling through silently.

## explain
1. Write the ranges as intervals and mark each end as included or excluded.
2. Prefer half-open intervals so neighbouring ranges share edges cleanly.
3. Check that the union of ranges covers everything intended, with no gaps and no overlaps.
4. Write the comparisons directly from the intervals.
5. Handle values outside all ranges explicitly.
6. Test the values at, just below and just above every boundary.

## example
The function `bucket(age)` uses half-open intervals for child, teen and adult, a final `age >= 65` test for senior and "invalid" for negatives. Evaluating it for -1, 0, 12, 13, 19, 20, 64 and 65 gives invalid, child, child, teen, teen, adult, adult and senior, so each boundary value falls into the intended bucket. `len(range(10, 20))` is 10 and 20 is not `in range(10, 20)`. The JavaScript sample clamps the values -5, 5 and 50 into the range 0 to 10, giving 0, 5 and 10.

## real
Pagination, date ranges, price tiers and array slicing all use half-open intervals, and a large share of off-by-one defects in production come from mixing closed and half-open conventions.

## pros
- Half-open intervals tile without gaps or overlaps
- Boundary tests find the most common defects cheaply
- Clamping and wrapping solve many real problems in one line

## cons
- Different conventions in different libraries cause confusion
- Floating-point ranges have fuzzy edges
- Silent clamping can hide invalid data

## uses
- Validating inputs such as ages, percentages and quantities
- Assigning values to buckets, tiers or categories
- Slicing and paging data
- Limiting values to a safe range, such as a volume level

## mistakes
- Mixing inclusive and exclusive ends for adjacent ranges
- Using <= where < was intended and making two buckets overlap
- Forgetting to handle values outside all ranges
- Testing only typical values and never the edges

## interview
**Q:** Why are half-open intervals preferred?
**A:** Consecutive intervals share a boundary without overlap or gap, and the length equals end minus start, which avoids many off-by-one errors.

**Q:** What values should you test for the range 0 up to but excluding 13?
**A:** The boundaries and their neighbours: -1, 0, 1, 12, 13 and 14, plus a typical value in the middle.

**Q:** What is clamping?
**A:** Forcing a value into a range by replacing anything below the minimum with the minimum and anything above the maximum with the maximum.

## summary
Decide inclusion at each end, prefer half-open intervals, cover the whole domain with no gaps or overlaps, and test every boundary and its neighbours.

## codenote
The Python sample buckets ages across every boundary and shows the half-open behavior of range. The JavaScript sample clamps values to a range.

## code
### python
```python
def bucket(age):
    if 0 <= age < 13:
        return "child"
    if 13 <= age < 20:
        return "teen"
    if 20 <= age < 65:
        return "adult"
    if age >= 65:
        return "senior"
    return "invalid"

print([bucket(a) for a in (-1, 0, 12, 13, 19, 20, 64, 65)])
print(len(range(10, 20)), 20 in range(10, 20))
```
Output:
```text
['invalid', 'child', 'child', 'teen', 'teen', 'adult', 'adult', 'senior']
10 False
```
### javascript
```javascript
const clamp = (x, low, high) => Math.min(Math.max(x, low), high);
console.log([-5, 5, 50].map((x) => clamp(x, 0, 10)));
```
Output:
```text
[ 0, 5, 10 ]
```

## quiz
1. Which comparison is half-open, including the start and excluding the end?
   - [ ] low < x < high
   - [ ] low <= x <= high
   - [x] low <= x < high
   - [ ] low < x <= high
   > Python's range and slices follow this convention.
2. How many integers does range(10, 20) contain?
   - [ ] 9
   - [x] 10
   - [ ] 11
   - [ ] 20
   > The count equals end minus start.
3. Which values most deserve tests for a range check?
   - [ ] Only typical values
   - [x] Values at and next to each boundary
   - [ ] Only huge values
   - [ ] Only negative values
   > Off-by-one errors occur at the edges.
4. What does clamping do to a value above the maximum?
   - [ ] Raises an error
   - [x] Replaces it with the maximum
   - [ ] Wraps it to the minimum
   - [ ] Leaves it unchanged
   > Clamping limits the value to the allowed range.
