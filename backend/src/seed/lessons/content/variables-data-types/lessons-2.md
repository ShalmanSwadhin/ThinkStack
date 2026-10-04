# Lifetime and Storage Duration
kind: concept
time: Not applicable — the lifetime of a variable is when it exists, not how long an algorithm takes. Allocation costs differ (stack allocation is very cheap, heap allocation costs more) but there is no Big-O result to state.
space: Not applicable — lifetime determines when memory is released, not how much an algorithm needs as its input grows.

## intro
A variable does not live forever. Its lifetime is the span of time during which its memory is valid, and the storage duration describes where it lives and when it is released. Understanding this prevents dangling references, memory leaks and mysterious values that persist between calls.

## theory
Languages describe lifetime through a few categories, most clearly in C and C++:

- Automatic storage — local variables inside a function live on the stack. They are created when the function is entered and disappear when it returns.
- Static storage — global variables and variables marked `static` live for the entire run of the program. A static local keeps its value between calls.
- Dynamic (heap) storage — memory requested explicitly at run time with `malloc` or `new`, which lives until it is freed or, in managed languages, until nothing refers to it.
- Thread storage — one copy per thread.

Managed languages hide most of this:

- Python objects live on the heap, and CPython frees an object as soon as its reference count reaches zero, which is why a local object is cleaned up when its function returns.
- JavaScript uses garbage collection: an object stays alive as long as something reachable refers to it, and a closure can keep a function's variables alive after it returns.

Lifetime bugs include returning a pointer to a local variable in C (the memory is gone), forgetting to free heap memory (a leak) and keeping references to large objects that are no longer needed (a logical leak).

## explain
1. Ask where the value is stored: stack, static area or heap.
2. Ask who owns it and when it is released: at function exit, at program exit, when freed, or when nothing refers to it.
3. In C and C++, never keep a pointer to a local variable after the function returns.
4. Match every allocation with exactly one release, or use tools that do it for you.
5. In garbage-collected languages, drop references to large objects you no longer need, such as entries in a long-lived cache.
6. Use `with` blocks in Python or `try/finally` for resources such as files whose release must be prompt rather than eventual.

## example
The Python sample defines a class that announces when it is created and destroyed. A function creates one local object and prints a message. The output shows creation, then "working", then destruction as the function returns, then the line after the call. This is CPython releasing the object as soon as its last reference, the local name, disappears. The JavaScript sample shows a closure keeping a local array alive after its function has returned. The C sample shows a static local variable whose value survives between calls.

## real
Server applications must manage lifetimes carefully: database connections and file handles are released on a schedule, and memory leaks in long-running processes eventually exhaust the machine.

## pros
- Automatic storage is fast and cleaned up for free
- Static storage keeps state between calls without globals visible everywhere
- Garbage collection removes most manual release errors

## cons
- Manual heap management invites leaks and double frees
- Dangling references to released memory cause crashes and security flaws
- Garbage collectors give little control over exactly when memory is freed

## uses
- Keeping a counter between calls with a static local
- Managing files, sockets and locks with deterministic cleanup
- Reasoning about why a closure keeps data alive
- Diagnosing memory leaks in long-running programs

## mistakes
- Returning the address of a local variable in C
- Forgetting to free memory obtained with malloc
- Assuming a Python object is destroyed at an exact moment in every implementation
- Holding references in a global list so objects never become collectable

## interview
**Q:** What is the difference between stack and heap allocation?
**A:** Stack memory holds local variables and is released automatically when the function returns; it is fast but limited in size. Heap memory is requested explicitly or by the runtime, lives until released, and is larger but slower to manage.

**Q:** What is a dangling pointer?
**A:** A pointer to memory that has already been released, for example the address of a local variable after its function returned. Using it is undefined behavior.

**Q:** What does a static local variable do in C?
**A:** It is initialized once and keeps its value for the whole program run, even though it is only visible inside its function.

## summary
Every variable has a lifetime tied to where it is stored. Automatic locals vanish with the function, static variables last for the program, and heap data lasts until freed or unreachable. Many serious bugs are lifetime mismatches.

## codenote
The Python sample prints the moments of creation and destruction of an object. The JavaScript sample shows a variable outliving its function through a closure. The C sample, which is not run here, keeps a counter alive with a static local.

## code
### python
```python
class Resource:
    def __init__(self, name):
        self.name = name
        print("create", name)

    def __del__(self):
        print("destroy", self.name)

def work():
    temp = Resource("temp")
    print("working")

work()
print("after work")
```
Output:
```text
create temp
working
destroy temp
after work
```
### javascript
```javascript
function makeReader() {
  const data = [10, 20, 30];
  return () => data.length;
}

const reader = makeReader();
console.log(reader());
```
Output:
```text
3
```
### c
```c
#include <stdio.h>

int next_id(void) {
    static int id = 0;
    id++;
    return id;
}

int main(void) {
    int first = next_id();
    int second = next_id();
    printf("%d %d\n", first, second);
    return 0;
}
```

## quiz
1. Where do ordinary local variables in a C function live?
   - [ ] On the heap until freed
   - [x] On the stack, and they disappear when the function returns
   - [ ] In a file
   - [ ] In static storage for the whole program
   > Automatic storage is tied to the function call.
2. What is wrong with returning the address of a local variable in C?
   - [ ] Nothing, it is a common idiom
   - [x] The memory is released when the function returns, so the pointer dangles
   - [ ] It makes the variable constant
   - [ ] It converts the address to an integer
   > Using the pointer afterwards is undefined behavior.
3. What keeps a JavaScript local variable alive after its function returns?
   - [ ] The garbage collector never frees locals
   - [x] A closure that still refers to it
   - [ ] The var keyword
   - [ ] The console
   > Reachable references prevent the collector from freeing the data.
4. What does a static local variable do?
   - [ ] Resets on each call
   - [x] Keeps its value between calls for the entire program run
   - [ ] Becomes a constant
   - [ ] Is visible to every function
   > Static storage duration means the variable is created once and persists.

# Constants and Literals
kind: concept
time: Not applicable — a literal is a value written directly in source code and is resolved when the program is compiled or loaded. It involves no algorithm.
space: Not applicable — literals are fixed values; the memory they use depends on their type, not on an input-sized bound.

## intro
A literal is a value written straight into the code, like 42, 3.5 or "hello". A constant is a named value that is meant to stay fixed. Knowing the different literal notations makes code shorter and clearer, and naming the important ones keeps it maintainable.

## theory
Common literal forms:

- Integers in several bases: decimal `255`, hexadecimal `0xFF`, binary `0b1010`, octal `0o17` in Python (a leading `0` in C)
- Digit separators for readability: `1_000_000` in Python and JavaScript
- Floating-point numbers: `3.14`, scientific notation `1e3` (which is 1000.0) and `2.5e-3`
- Strings in single, double or triple quotes; raw strings such as `r"C:\new"` keep backslashes literally; JavaScript template literals are written between backticks and insert values through dollar-brace placeholders
- Booleans and null: `True`, `False`, `None` in Python; `true`, `false`, `null` in JavaScript
- Collection literals: `[1, 2]`, `{"a": 1}`, `(1, 2)`

Constants give names to meaningful values:

- `const` in JavaScript and `final` in Java enforce the name cannot be reassigned
- C has `const` and the `#define` preprocessor macro
- Python relies on UPPER_CASE names, and the `enum` module for named groups of constants

A bare literal that carries meaning, such as 86400 or 0.0825, is a magic number. Replace it with a name like `SECONDS_PER_DAY`.

## explain
1. Choose the notation that makes the value's meaning clearest: hexadecimal for colours and bit masks, binary for flags, scientific notation for very large or small numbers.
2. Use digit separators to make long numbers readable.
3. Use raw strings for file paths and regular expressions to avoid doubled backslashes.
4. Replace repeated or meaningful literals with a named constant defined once.
5. For a closed set of related values, such as days or states, use an enum rather than loose integers.
6. Keep obvious values such as 0, 1 and "" as plain literals; naming them adds noise.

## example
In Python, `0xFF` evaluates to 255, `0b101` to 5, `0o17` to 15 and `1_000_000` to one million; `1e3` is the float 1000.0. A normal string "a\nb" has 3 characters because \n is a single newline, while the raw string r"a\nb" has 4 because the backslash is kept. The JavaScript sample builds the same ideas: hexadecimal and binary literals, and a template literal that inserts a computed value into text.

## real
Colour codes in stylesheets are hexadecimal literals, network masks and file permissions are written in binary or octal, and configuration constants for timeouts and limits are collected in one place so they can be reviewed together.

## pros
- The right literal notation makes values self-explanatory
- Named constants remove magic numbers and give one place to change a value
- Raw strings and template literals cut down on escaping mistakes

## cons
- Many notations exist and differ slightly between languages
- A leading zero means octal in C, which surprises beginners
- Too many constants can scatter the meaning of simple code

## uses
- Writing colours, masks and addresses in hexadecimal
- Spelling large numbers readably with separators
- Writing file paths and patterns with raw strings
- Defining configuration limits as named constants

## mistakes
- Writing a leading zero on a decimal number in C and getting octal
- Leaving unexplained numeric literals scattered through calculations
- Forgetting that a normal string interprets backslash escapes
- Using a constant name but then modifying the value anyway

## interview
**Q:** What is the difference between a literal and a constant?
**A:** A literal is a value written directly in the source code. A constant is a name bound to a value that is not supposed to change, which may itself be defined with a literal.

**Q:** What is a magic number and why avoid it?
**A:** An unexplained literal in the middle of code, such as 0.0825. A reader cannot tell what it means, and changing it requires finding every occurrence, so it is better to give it a descriptive named constant.

**Q:** When would you use a raw string?
**A:** When the text contains many backslashes, such as Windows file paths or regular expressions, because a raw string keeps them as written instead of treating them as escape sequences.

## summary
Choose the literal notation that best conveys the value, make long numbers readable with separators, and give important or repeated values a descriptive constant name instead of leaving magic numbers in the code.

## codenote
The Python sample evaluates several integer notations and compares a normal string with a raw one. The JavaScript sample uses hexadecimal, binary and a template literal.

## code
### python
```python
print(0xFF, 0b101, 0o17, 1_000_000, 1e3)

plain = "a\nb"
raw = r"a\nb"
print(len(plain), len(raw))
```
Output:
```text
255 5 15 1000000 1000.0
3 4
```
### javascript
```javascript
const mask = 0xff;
const flags = 0b1010;
const seconds = 60 * 60 * 24;
console.log(mask, flags);
console.log(`a day has ${seconds} seconds`);
console.log(1_000 + 1);
```
Output:
```text
255 10
a day has 86400 seconds
1001
```

## quiz
1. What does 0xFF equal in decimal?
   - [ ] 15
   - [ ] 128
   - [x] 255
   - [ ] 256
   > Hexadecimal FF is 15 times 16 plus 15, which is 255.
2. Why is a raw string useful for a Windows path?
   - [ ] It makes the string shorter
   - [x] Backslashes are kept literally instead of being treated as escapes
   - [ ] It encrypts the path
   - [ ] It converts slashes to dots
   > Normal strings read backslash sequences such as \n or \t as special characters.
3. What is a magic number?
   - [ ] A random number generator
   - [x] An unexplained literal in code whose meaning is not obvious
   - [ ] A number greater than 1000
   - [ ] A prime number
   > Naming the value as a constant explains it and centralises changes.
4. In Python, what type is the literal 1e3?
   - [ ] int
   - [x] float
   - [ ] str
   - [ ] bool
   > Scientific notation always produces a floating-point number.

# Type Inference
kind: concept
time: Not applicable — inference happens while the compiler analyses the program or, in dynamic languages, as values are created at run time. It does not add a measurable cost to your algorithms.
space: Not applicable — inference decides which type a name has; it does not change how much data the program stores.

## intro
Type inference lets a language work out the type of a value without you writing it down. It gives some of the safety of static typing with less typing, and understanding what is inferred versus what is checked clears up many confusions about modern languages.

## theory
There are several situations that are often lumped together:

- Dynamic typing (Python, JavaScript): a name has no fixed type; each value carries its type at run time, and the "inference" is simply what the value is when you look at it.
- Local type inference in static languages: C++ `auto`, Java `var`, C# `var` and Kotlin `val` let the compiler deduce a variable's type from its initializer. The variable is still statically typed afterward: `auto x = 3;` is an int forever.
- Global inference (Haskell, OCaml, Rust to a large degree) deduces types of functions and expressions from how they are used, with few written annotations.
- Gradual typing: Python type hints and TypeScript annotations add optional declared types that tools such as mypy and the TypeScript compiler check. Python itself ignores the hints at run time.

Inference fails or needs help when the initializer is ambiguous, for example an empty list literal or a number that could be an int or a double. Then an explicit annotation documents the intent.

## explain
1. In a dynamic language, find the type by looking at the value assigned and test with `type()` or `typeof`.
2. In C++ or Java, use `auto` or `var` when the type is obvious from the right-hand side, such as `auto count = 3;`.
3. Write the type explicitly when it is not obvious, for public function signatures and for numeric literals where precision matters.
4. Add Python type hints to function parameters and returns so editors and checkers can catch mismatches.
5. Remember that a hint does not enforce anything when the program runs.
6. Use a type checker in your build if you want hints to be verified.

## example
The Python function `double(n: int) -> int` is annotated, yet calling `double("ab")` still runs and returns "abab", because annotations are not checked at run time; they are only stored on the function. In JavaScript, one variable holds a number and then a string, and `typeof` shows the type of the current value. The C++ sample uses `auto` for an integer, a double and a string, each fixed once deduced.

## real
Large Python and JavaScript code bases add type hints or TypeScript so editors can autocomplete and tools can catch errors before runtime, while modern C++ and Java code uses auto and var to cut repetition without losing static checking.

## pros
- Less repetition while keeping many static guarantees
- Type hints give tools enough information to catch mismatches early
- Dynamic languages let you write quick scripts without ceremony

## cons
- Inferred types can be unclear when the initializer is complex
- Python hints are not enforced without a separate checker
- Auto in C++ can deduce a different type than you expected

## uses
- Shortening long type names in C++ and Java with auto and var
- Documenting Python function signatures with hints
- Letting editors suggest completions from inferred types
- Catching type mismatches before running with a checker

## mistakes
- Believing Python type hints raise errors at run time
- Using auto for a literal and not realising it deduced int instead of double
- Leaving a public API without explicit types so users must guess
- Changing the type of a variable in a dynamic language and breaking later code

## interview
**Q:** What does auto do in C++?
**A:** It makes the compiler deduce the variable's type from its initializer. The type is fixed at compile time just as if you had written it out.

**Q:** Are Python type hints enforced?
**A:** Not by the interpreter. They are metadata for tools like type checkers and editors, and a function annotated to take an int will still run if you pass something else.

**Q:** What is the difference between dynamic typing and type inference?
**A:** In dynamic typing, types belong to values and are checked at run time. Type inference is a compile-time mechanism in statically typed languages that works out the types so that you need not write them.

## summary
Inference spares you from spelling out types the compiler can deduce, and gradual typing adds optional hints. Know which of your tools enforce the types and which merely record them.

## codenote
The Python sample shows that hints are stored but not enforced. The JavaScript sample shows a name carrying different types over time. The C++ sample, not run here, shows deduced static types.

## code
### python
```python
def double(n: int) -> int:
    return n * 2

print(double(4))
print(double("ab"))
print(double.__annotations__)
```
Output:
```text
8
abab
{'n': <class 'int'>, 'return': <class 'int'>}
```
### javascript
```javascript
let value = 10;
console.log(typeof value);
value = "ten";
console.log(typeof value);
```
Output:
```text
number
string
```
### cpp
```cpp
#include <iostream>
#include <string>

int main() {
    auto count = 3;
    auto ratio = 2.5;
    auto name = std::string("Ada");
    std::cout << count << " " << ratio << " " << name << "\n";
    return 0;
}
```

## quiz
1. In C++, what is the type of the variable declared as auto ratio = 2.5?
   - [ ] int
   - [x] double
   - [ ] string
   - [ ] It stays undecided
   > The compiler deduces double from the literal and fixes it.
2. Does Python raise an error at run time when you pass the wrong type to an annotated function?
   - [ ] Yes, always
   - [x] No, annotations are not enforced by the interpreter
   - [ ] Only for strings
   - [ ] Only inside classes
   > Hints are read by tools such as type checkers, not by the running program.
3. Which statement about JavaScript variables is correct?
   - [ ] A variable has a fixed type from its first assignment
   - [x] A variable can hold values of different types over time
   - [ ] Types are declared with the int keyword
   - [ ] Types are checked at compile time
   > Types belong to the values, so typeof reports the current one.
4. When should you write a type explicitly even though inference is available?
   - [ ] Never
   - [x] When the type is not obvious from the code, such as in a public function signature
   - [ ] Only for constants
   - [ ] Only for strings
   > Explicit types document intent where the reader would otherwise have to guess.

# Strong vs Weak Typing
kind: concept
time: Not applicable — whether a language is strongly or weakly typed describes how strictly it enforces type rules, not how fast programs run.
space: Not applicable — it concerns conversion rules rather than memory use.

## intro
Strong and weak typing describe how willing a language is to mix values of different types by converting them automatically. It is a separate question from whether types are checked at compile time or at run time, and the two are often confused.

## theory
Two independent axes classify languages:

- Static vs dynamic — when types are checked: before the program runs, or while it runs
- Strong vs weak — how strictly the language prevents operations that mix types

Examples placed on both axes:

- Python: dynamic and strong. Types are checked at run time and `3 + "3"` raises a TypeError, although `"3" * 3` is allowed because the language defines it as repetition.
- JavaScript: dynamic and weak. `3 + "3"` is the string "33", `"3" * "4"` is the number 12 and `true + 1` is 2.
- Java: static and strong. Mixing incompatible types is a compile error, with limited automatic widening.
- C: static and weak. Types are checked at compile time, but integers, characters and pointers convert freely, and casts can reinterpret memory.

The terms are relative rather than precise. A weaker language is not worse; it trades safety against flexibility. Strict typing finds mistakes sooner but requires explicit conversions, while permissive coercion hides mistakes until they produce odd output.

## explain
1. Locate the language on both axes: when are types checked, and how many implicit conversions are allowed?
2. In a strong language, convert explicitly where you combine types and expect a clear error otherwise.
3. In a weak language, be cautious with operators that behave differently by operand type, such as + in JavaScript.
4. Use the strict forms where they exist: === in JavaScript, strict mode and TypeScript.
5. Test the unusual combinations, especially text and numbers, because those are where coercion rules produce surprises.
6. When switching languages, relearn the conversion rules rather than assuming they match.

## example
Python refuses to add the number 3 to the text "3", printing a message instead, yet repeats the text when multiplied: "3" * 3 is "333". JavaScript happily accepts the same mixtures: 3 + "3" is "33", true + 1 is 2, [1, 2] + [3] is the text "1,23" and "3" * "4" is 12. The outputs are printed side by side so the difference in strictness is visible.

## real
Teams building large JavaScript applications move to TypeScript for stricter checks, and languages like Rust and Haskell are chosen for correctness-critical systems partly because they refuse implicit conversions.

## pros
- Strong typing catches mixed-type mistakes early with clear errors
- Weak typing allows short, flexible code
- Understanding both axes makes language choices informed

## cons
- Strong typing can require verbose explicit conversions
- Weak typing hides bugs until they surface as strange output
- The terms are loosely defined, so people use them inconsistently

## uses
- Choosing a language for a project based on safety needs
- Debugging unexpected results from implicit conversion
- Deciding when to add TypeScript or type hints
- Explaining behavior differences when porting code between languages

## mistakes
- Treating static and strong as the same thing
- Assuming JavaScript and Python give the same result for mixed-type expressions
- Relying on coercion and not testing mixed input
- Calling a language weak simply because it is dynamic

## interview
**Q:** What is the difference between strong and static typing?
**A:** Static typing means types are checked before the program runs, and strong typing means the language limits operations between mismatched types. Python is dynamic but strong; C is static but weak.

**Q:** Why is JavaScript called weakly typed?
**A:** It applies many implicit conversions, so operations on mixed types succeed and produce results such as the string "33" for 3 + "3", rather than raising an error.

**Q:** How can you get stricter behavior in a weakly typed language?
**A:** Use the strict operators and modes, validate input types explicitly, and add a type layer such as TypeScript or type hints with a checker.

## summary
Static versus dynamic is about when types are checked, and strong versus weak is about how much mixing is tolerated. Learn where each of your languages sits, and test mixed-type expressions rather than assuming.

## codenote
The Python sample shows the strict refusal and a legitimately defined repetition. The JavaScript sample prints a set of mixed-type results that the language accepts.

## code
### python
```python
print("3" * 3)

try:
    print(3 + "3")
except TypeError:
    print("refused to mix int and str")
```
Output:
```text
333
refused to mix int and str
```
### javascript
```javascript
console.log(3 + "3");
console.log(true + 1);
console.log([1, 2] + [3]);
console.log("3" * "4");
```
Output:
```text
33
2
1,23
12
```

## quiz
1. Which description fits Python?
   - [ ] Static and weak
   - [x] Dynamic and strong
   - [ ] Static and strong
   - [ ] Dynamic and weak
   > Python checks types at run time and refuses most mixed-type operations.
2. What is 3 + "3" in JavaScript?
   - [ ] 6
   - [ ] A TypeError
   - [x] The string 33
   - [ ] NaN
   > The number is converted to text and concatenated.
3. What does static typing refer to?
   - [ ] Types that never change value
   - [x] Types checked before the program runs
   - [ ] Types checked only on Mondays
   - [ ] Only integer types
   > Static checking happens at compile time; strong versus weak is a separate matter.
4. Why might a team adopt TypeScript over plain JavaScript?
   - [ ] It is faster at run time
   - [x] It adds stricter type checking to catch mixed-type mistakes earlier
   - [ ] It removes the need for tests
   - [ ] It runs without a browser
   > Its compiler checks declared types before the code is run.

# Choosing Appropriate Types
kind: concept
time: Not applicable — picking a type is a design decision. The right choice can change correctness and sometimes performance, but there is no single complexity result.
space: Not applicable — different types use different amounts of memory, but the lesson is how to match the type to the data, not to compute a bound.

## intro
The type you choose for a piece of data decides what operations are possible, how exact the values are and how much memory they use. Choosing well at the start prevents rounding errors, invalid states and awkward conversions later.

## theory
Match the type to the meaning of the data:

- Counts and identifiers that are labels, not quantities — integers or strings. A phone number or postal code is text, because you never add two phone numbers and leading zeros matter.
- Money — integers in the smallest unit (cents) or a decimal type, never binary floating point.
- Measurements — floating point, with a tolerance in comparisons.
- Yes or no state — boolean, not the strings "yes" and "no" or the numbers 0 and 1.
- A fixed, closed set of choices — an enumeration, not free text.
- A sequence that changes — a list; a fixed group of related values — a tuple or a record; unique items with fast membership tests — a set; labelled lookups — a dictionary.
- Dates and times — a date-time type, not a string or a number of days.

In fixed-width languages also pick the integer width: `int` for ordinary counts, `long` or 64-bit where values may exceed two billion, and unsigned only when negative values truly cannot occur.

Ask three questions: what values are valid, what operations are needed, and what precision is required.

## explain
1. Describe the data in words: what does it mean and what are the valid values?
2. Decide whether you will do arithmetic on it. If not, it is probably text.
3. Decide how exact it must be. Exact amounts need integers or decimals.
4. Pick a container that fits how the data is used: ordered and changeable (list), unique (set), keyed (dictionary).
5. Make invalid states impossible when you can, for example with an enum rather than free text.
6. Check the extremes: the largest value, the smallest and the empty case.

## example
In Python the multiplication `0.1 * 3` gives 0.30000000000000004, while `Decimal("0.1") * 3` gives exactly 0.3, so prices belong in a decimal type. Storing a price of 19.99 as 1999 integer cents makes arithmetic exact, and integer division and remainder by 100 give the dollars and cents. The JavaScript sample keeps cents as integers and formats only when displaying, and shows why a postal code such as "02134" must stay text.

## real
Shopping carts, banking ledgers and payroll systems store amounts as integers or decimals, and many production bugs come from storing identifiers like account numbers as integers and losing leading zeros.

## pros
- The right type makes invalid data impossible or obvious
- Exact types avoid rounding surprises in money
- Choosing the container to match usage keeps code simple and fast

## cons
- Specialised types add conversions at the boundaries of a program
- Decimal arithmetic is slower than floating point
- Over-designing types for a throwaway script costs more than it saves

## uses
- Designing database columns and API fields
- Storing prices, quantities and identifiers correctly
- Choosing between list, set and dictionary for a collection
- Modelling states with enumerations

## mistakes
- Storing phone numbers or ZIP codes as integers
- Using floating point for money
- Using strings such as "yes" and "no" instead of booleans
- Keeping dates as plain text and comparing them as strings

## interview
**Q:** Why should money not be stored in a float?
**A:** Binary floats cannot represent many decimal fractions exactly, so sums and products accumulate rounding errors. Integer cents or a decimal type keep the amounts exact.

**Q:** Why is a phone number better stored as a string than an integer?
**A:** It is an identifier, not a quantity. You never do arithmetic on it, and an integer would drop leading zeros and cannot hold symbols like a plus sign.

**Q:** How do you choose between a list and a set?
**A:** Use a list when order and duplicates matter, and a set when you need unique items and fast membership checks.

## summary
Pick the type from the meaning of the data: text for identifiers, integers or decimals for money, booleans for flags, enums for closed choices and the container that matches how the data is used.

## codenote
The Python sample contrasts float and Decimal arithmetic and splits integer cents into dollars and cents. The JavaScript sample works in cents and keeps a postal code as text.

## code
### python
```python
from decimal import Decimal

print(0.1 * 3)
print(Decimal("0.1") * 3)

price_cents = 1999
print(price_cents // 100, price_cents % 100)
```
Output:
```text
0.30000000000000004
0.3
19 99
```
### javascript
```javascript
const priceCents = 1999;
const quantity = 3;
const totalCents = priceCents * quantity;
console.log(totalCents);
console.log((totalCents / 100).toFixed(2));

const postalCode = "02134";
console.log(postalCode.length, Number(postalCode));
```
Output:
```text
5997
59.97
5 2134
```

## quiz
1. Why is a postal code best stored as text?
   - [ ] Text uses less memory
   - [x] It is an identifier, and leading zeros must be kept
   - [ ] Numbers cannot be stored in databases
   - [ ] Postal codes contain letters in every country
   > You never calculate with it, and converting to a number would lose the leading zero.
2. Which is the best way to hold the price 19.99 exactly?
   - [ ] A float 19.99
   - [x] The integer 1999 cents or a decimal type
   - [ ] The string "nineteen ninety nine"
   - [ ] A boolean
   > Exact representations avoid binary floating-point rounding.
3. What should you use for a field that can only be one of four fixed statuses?
   - [ ] A free-text string
   - [x] An enumeration
   - [ ] A float
   - [ ] A list of characters
   > Enumerations prevent invalid values and document the allowed set.
4. Which container gives unique items with fast membership tests?
   - [ ] A tuple
   - [ ] A string
   - [x] A set
   - [ ] A file
   > Sets reject duplicates and test membership quickly.

# Type Safety in Practice
kind: concept
time: Not applicable — checking a type or validating a value is a constant-time step for each value. The question is where and how to apply the checks.
space: Not applicable — validation does not change how much data is stored.

## intro
Type safety means a program cannot treat a value as something it is not: a number cannot be used as a list, text cannot be silently used as a date. In practice it comes from a combination of language features, tools and validation at the boundaries where untrusted data enters.

## theory
Type safety has layers:

- Language-level safety — a static type system rejects invalid operations at compile time (Java, Rust, TypeScript), and a strong dynamic one raises errors at run time (Python)
- Tooling — type checkers such as mypy, pyright and the TypeScript compiler analyse annotations before the program runs
- Runtime validation — checks written in code, such as `isinstance`, range checks and schema validators, which are needed because static types cannot know what a user or a network will send
- Safe design — types that make invalid states unrepresentable, for example an enum instead of a free string

The important boundary is between trusted and untrusted data. Inside the program, types describe what values are. At the edges (user input, files, network, databases) data arrives as text or loosely typed JSON and must be parsed and validated once, after which the rest of the code can rely on the types.

Common type-safety failures are null or undefined values used as objects, wrong-type arguments and unchecked conversions. Defensive habits include rejecting bad input early with a clear error, avoiding silent defaults that hide problems and failing fast.

## explain
1. Identify the places where data enters the program.
2. Parse and validate at each entry: check type, range, format and required fields.
3. Raise a specific error for bad data so the caller knows what is wrong and does not receive a half-processed value.
4. Inside the program, rely on the validated types and add annotations so tools can check them.
5. Run a type checker as part of your build.
6. Test the invalid cases: missing values, wrong types and out-of-range numbers.

## example
The Python function `parse_age` takes text, converts it with `int`, rejects values outside 0 to 150 and returns the number. The loop feeds it "42", "-5" and "abc": the first is accepted, the second fails the range check with a clear message and the third fails the conversion. The JavaScript function does the same using `Number.isInteger` and a `typeof` check, and returns an error message rather than a bad value.

## real
Web APIs validate every request body against a schema before touching the database, and many security vulnerabilities, such as injection and buffer overflows, start with unchecked input of an unexpected type or size.

## pros
- Early validation turns hard-to-trace failures into clear, immediate errors
- Type checkers find whole classes of mistakes before the code runs
- Types that make invalid states impossible remove the need for many checks

## cons
- Validation code adds length and must be maintained
- Static typing can feel restrictive in exploratory code
- Checks cost a little time on every call at the boundary

## uses
- Validating form fields and API request bodies
- Parsing configuration files safely
- Adding type hints and a checker to a Python project
- Designing functions that reject invalid arguments with clear errors

## mistakes
- Trusting data from outside the program without validation
- Catching all exceptions and ignoring them so bad data passes through
- Using default values that hide a missing required field
- Validating the type but forgetting the allowed range

## interview
**Q:** What is type safety?
**A:** The guarantee that operations are only applied to values of a suitable type, enforced by the language, by tools or by run-time checks, so a program does not misinterpret data.

**Q:** Where should input validation happen?
**A:** At the boundary where data enters the system, such as user input, files and network requests. After it is validated and converted, the rest of the code can rely on the types.

**Q:** What does fail fast mean?
**A:** Detect invalid data or state as early as possible and stop with a clear error, rather than letting the problem travel and cause confusing failures elsewhere.

## summary
Combine language checks, a type checker and explicit validation at the edges of the program. Reject bad data early with a clear message so the rest of the code can trust its types.

## codenote
Both samples validate text input in three steps: the type or format, the numeric conversion and the allowed range. Invalid input produces a specific rejection message instead of a bad value.

## code
### python
```python
def parse_age(text):
    value = int(text)
    if not 0 <= value <= 150:
        raise ValueError("age out of range")
    return value

for raw in ["42", "-5", "abc"]:
    try:
        print(parse_age(raw))
    except ValueError as error:
        print("rejected:", error)
```
Output:
```text
42
rejected: age out of range
rejected: invalid literal for int() with base 10: 'abc'
```
### javascript
```javascript
function parseAge(input) {
  if (typeof input !== "string") return "error: age must be text";
  const value = Number(input);
  if (!Number.isInteger(value)) return "error: not a whole number";
  if (value < 0 || value > 150) return "error: out of range";
  return value;
}

console.log(parseAge("42"));
console.log(parseAge("4.5"));
console.log(parseAge(42));
console.log(parseAge("200"));
```
Output:
```text
42
error: not a whole number
error: age must be text
error: out of range
```

## quiz
1. Where is validation most important?
   - [ ] Deep inside every helper function
   - [x] At the boundary where untrusted data enters the program
   - [ ] Only in comments
   - [ ] After the data has been saved
   > Checking at the entry point lets the rest of the code trust the validated types.
2. What does fail fast mean?
   - [ ] Make the program run quickly
   - [x] Detect invalid input early and stop with a clear error
   - [ ] Ignore errors until the end
   - [ ] Retry forever
   > Early, clear failures are easier to diagnose than problems that surface later.
3. What does a static type checker like mypy do?
   - [ ] Runs the program faster
   - [x] Analyses annotations before the code runs to find mismatched types
   - [ ] Converts Python to C
   - [ ] Validates user input at run time
   > It is a build-time tool and does not validate data at run time.
4. Why is catching every exception and ignoring it a type-safety problem?
   - [ ] Exceptions are always fatal
   - [x] Bad data passes through silently and causes confusing failures later
   - [ ] It uses too much memory
   - [ ] It changes variable types
   > Errors about invalid values should be reported, not hidden.
