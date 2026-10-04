# What Is a Variable
kind: concept
time: Not applicable — a variable is a named reference to a value, and reading or assigning it is a single step. There is no algorithm whose running time grows with input.
space: Not applicable — each variable refers to one value; how much memory that value needs depends on its type, not on a Big-O result.

## intro
A variable is a name attached to a value so the program can store it, read it later and replace it. Without variables every calculation would have to be repeated from scratch, and no program could remember anything between steps.

## theory
Think of a variable as a labelled box or, more accurately in many languages, a label stuck onto a value:

- Name — the identifier you use in code, such as `age` or `total_price`
- Value — the data it currently refers to
- Type — what kind of data it is, which decides what you can do with it
- Assignment — the operation `=` that connects a name to a value

In Python a name is a reference to an object. Writing `y = x` makes both names point to the same object, which matters for mutable values: changing a list through one name is visible through the other. For numbers and strings, which cannot be changed in place, "changing" a variable really means pointing the name at a new value.

Rules for names: they usually start with a letter or underscore, cannot contain spaces, are case sensitive (`Total` and `total` are different) and cannot be a reserved keyword.

## explain
1. Choose a name that describes the content, such as `remaining_seats`.
2. Assign a first value with `=`. The program now has something to remember.
3. Read the variable by using its name in an expression. Its current value is substituted.
4. Reassign when the value changes: `remaining_seats = remaining_seats - 1` reads the old value, computes the new one and stores it.
5. Check the type if you are unsure: `type(remaining_seats)` in Python or `typeof` in JavaScript.
6. Remember that two names can refer to the same mutable object, so a change through one name shows up through the other.

## example
A cinema starts with 120 seats. After selling 3 tickets the variable `seats` is updated from 120 to 117, and `type(seats)` reports int the whole time. The second part of the sample creates a list called `row`, binds a second name `copy_name` to the same list, appends an item through one name and prints the list through the other. Both names show the new item because there is only one list.

## real
Every piece of state in an application is held in variables: the current user, the items in a cart, the score of a game. Bugs such as a counter that never resets or a list that changes unexpectedly are variable bugs.

## pros
- Names make the meaning of a value visible to the reader
- A value stored once can be reused many times without recalculating
- Reassignment lets a program track changing state over time

## cons
- A variable that can change at any point is harder to reason about than a fixed value
- Poor names hide meaning and cause mistakes
- Shared references can cause one part of a program to change data used by another

## uses
- Storing user input for later steps
- Keeping running totals and counters
- Holding intermediate results of a calculation
- Remembering program state such as the current screen or logged-in user

## mistakes
- Using a variable before giving it a value
- Reusing one variable name for unrelated purposes in the same function
- Expecting a copy when two names actually refer to the same list
- Misspelling a name and creating a new variable by accident

## interview
**Q:** What is a variable?
**A:** A named storage location, or in Python a name bound to an object, that holds a value which the program can read and replace while it runs.

**Q:** What is the difference between assigning a value and comparing two values?
**A:** Assignment stores a value under a name, written with a single equals sign. Comparison asks whether two values are equal and is written with a double equals sign in most languages.

**Q:** If y = x and x is a list, what happens when you append to y?
**A:** The list seen through x also changes, because both names refer to the same object. To get an independent list you must make a copy.

## summary
A variable gives a name to a value so a program can store, read and update it. Choose descriptive names, remember that assignment replaces the value, and be aware that two names may share one mutable object.

## codenote
The first part shows one name being given a value, updated and inspected. The second part shows two names bound to the same list. The JavaScript version demonstrates reassignment with a counter.

## code
### python
```python
seats = 120
seats = seats - 3
print(seats, type(seats).__name__)

row = ["A1", "A2"]
copy_name = row
copy_name.append("A3")
print(row)
```
Output:
```text
117 int
['A1', 'A2', 'A3']
```
### javascript
```javascript
let visitors = 0;
visitors = visitors + 1;
visitors += 4;
console.log(visitors);
console.log(typeof visitors);
```
Output:
```text
5
number
```

## quiz
1. In seats = seats - 3, what happens first?
   - [ ] The variable is deleted
   - [x] The current value is read and the subtraction is computed, then the result is stored
   - [ ] The name seats is renamed
   - [ ] Nothing, because the equals sign means equality
   > The right-hand side is evaluated using the old value before the result is assigned.
2. After y = x where x is a list, y.append(5) is called. What does x show?
   - [ ] The original list without 5
   - [x] The list with 5 added, because both names refer to the same list
   - [ ] An error
   - [ ] An empty list
   > Assignment of a list copies the reference, not the contents.
3. Which name is valid in most languages?
   - [ ] 2nd_place
   - [ ] total price
   - [x] total_price
   - [ ] class
   > Names cannot start with a digit, contain spaces or be reserved keywords.
4. Why are descriptive variable names valuable?
   - [ ] They make the program run faster
   - [x] They tell the reader what the value means without extra comments
   - [ ] They reduce memory use
   - [ ] They are required for loops
   > Meaningful names are the cheapest documentation a program has.

# Declaration and Initialization
kind: concept
time: Not applicable — declaring or initializing a variable is a constant-effort step with no growth in input to analyse.
space: Not applicable — a declaration reserves or names a single slot; total memory depends on the types and data involved.

## intro
Declaring a variable introduces its name to the language, and initializing it gives it a first value. Languages differ in whether those two steps are separate, required or implicit, and getting them wrong is one of the oldest sources of bugs.

## theory
Two distinct ideas:

- Declaration — telling the compiler or interpreter that a name exists (and, in typed languages, what type it has)
- Initialization — storing the first value in it

How common languages handle them:

- C and Java require a declared type: `int count;` declares, `int count = 0;` declares and initializes. A local C variable that is declared but not initialized contains whatever bytes were in that memory, so reading it is undefined behavior.
- Python has no separate declaration. The first assignment creates the name, and reading a name that was never assigned raises NameError.
- JavaScript uses `let`, `const` and `var`. A `let` or `const` name exists from the start of its block but cannot be read before its declaration line runs; doing so raises a ReferenceError (the temporal dead zone). A `var` is hoisted and reads as `undefined` before assignment.

Good practice is to initialize at the point of declaration with a meaningful value, and to declare variables as close as possible to where they are first used.

## explain
1. Decide the name and, in typed languages, the type.
2. Declare and give it a first value in the same statement whenever you can.
3. In Python, assign before any read; use a placeholder such as `None` or `0` if the real value comes later.
4. In C, never read a local variable before it has been written.
5. In JavaScript, prefer `const` unless the value must change, then `let`; avoid `var`.
6. Multiple assignment such as `a, b = 1, 2` initializes several names at once, and `a, b = b, a` swaps them.

## example
In Python the sample first tries to print `total` before it exists and catches the NameError, then assigns 0 and prints it, then swaps two variables with a single statement. In JavaScript, reading a `let` variable above its declaration throws a ReferenceError, while a `var` read before its assignment quietly gives the value reported by `typeof` as undefined. The contrast shows why `let` and `const` are safer.

## real
Static analysis tools and compilers warn about uninitialized variables, and a large share of security bugs in C programs come from reading memory that was declared but never initialized.

## pros
- Initializing at declaration leaves no moment where a variable has a meaningless value
- Declared types let compilers catch mistakes before running
- Block-scoped declarations in JavaScript make misuse an error rather than a silent bug

## cons
- Separate declaration and initialization allow the uninitialized state
- Languages disagree on the rules, so habits can be unsafe in a new language
- Hoisted var declarations behave surprisingly

## uses
- Setting counters and totals to a starting value before a loop
- Declaring constants for configuration with const
- Swapping two values with multiple assignment
- Reserving a name with None in Python when the value arrives later

## mistakes
- Reading a C variable that was declared but never set
- Using a Python name in a branch where it was never assigned
- Relying on var hoisting in JavaScript
- Declaring all variables at the top of a long function, far from where they are used

## interview
**Q:** What is the difference between declaring and initializing a variable?
**A:** Declaring introduces the name, and its type in a typed language; initializing stores the first value. They can happen together, as in int count = 0, or separately.

**Q:** What happens if you read an uninitialized local variable in C?
**A:** The result is undefined behavior: it typically holds leftover garbage from the stack, which makes bugs unpredictable and sometimes a security risk.

**Q:** What is the temporal dead zone in JavaScript?
**A:** The period between entering a block and executing the let or const declaration, during which the name exists but reading it throws a ReferenceError.

## summary
Declare variables close to where they are used and give them a meaningful first value at the same time. Know your language's rules: C leaves garbage, Python raises NameError, and JavaScript distinguishes let, const and var.

## codenote
The Python sample catches the NameError for a name that does not exist yet and demonstrates tuple swapping. The JavaScript sample contrasts the temporal dead zone of let with the hoisting of var. The C sample is not executed here but shows declaration with initialization.

## code
### python
```python
try:
    print(total)
except NameError:
    print("total does not exist yet")

total = 0
print(total)

first, second = 1, 2
first, second = second, first
print(first, second)
```
Output:
```text
total does not exist yet
0
2 1
```
### javascript
```javascript
try {
  console.log(late);
} catch (error) {
  console.log(error.name);
}
let late = 1;

console.log(typeof hoisted);
var hoisted = 5;
console.log(hoisted);
```
Output:
```text
ReferenceError
undefined
5
```
### c
```c
#include <stdio.h>

int main(void) {
    int count = 0;
    int limit = 10;
    printf("%d of %d\n", count, limit);
    return 0;
}
```

## quiz
1. In Python, what happens if you read a name that was never assigned?
   - [ ] It evaluates to 0
   - [x] A NameError is raised
   - [ ] It evaluates to None
   - [ ] The program waits for input
   > Python has no declaration step; a name exists only after its first assignment.
2. What does reading an uninitialized local int in C give you?
   - [ ] Always zero
   - [ ] A compile error in every case
   - [x] An unpredictable value, because the behavior is undefined
   - [ ] The last value printed
   > Local variables are not cleared automatically, so they hold whatever was in memory.
3. Which JavaScript keyword should you prefer when the value will never be reassigned?
   - [ ] var
   - [ ] let
   - [x] const
   - [ ] global
   > const documents intent and turns accidental reassignment into an error.
4. What does first, second = second, first do in Python?
   - [ ] Deletes both names
   - [x] Swaps the two values without a temporary variable
   - [ ] Compares the two values
   - [ ] Copies first into second only
   > The right-hand tuple is built first, then unpacked into the two names.

# Primitive Types Overview
kind: concept
time: Not applicable — a primitive type describes what a value is, not how long an algorithm takes. Operations on primitives are treated as constant time.
space: Not applicable — each primitive occupies a small fixed amount of memory (for example 1, 4 or 8 bytes in C), which is a property of the type rather than an input-dependent bound.

## intro
Primitive types are the simplest built-in kinds of data: whole numbers, decimal numbers, single characters or text, true and false values. Every richer structure in a program is eventually built from them.

## theory
The common primitives are:

- Integer — whole numbers such as 7 or -12
- Floating point — numbers with a fractional part such as 3.14, stored approximately
- Boolean — exactly two values, true and false
- Character or string — a single character, or a sequence of characters of text
- Null or none — a value that means "nothing here"

Languages organise them differently:

- C and Java have fixed-size types such as `char`, `int`, `long`, `float`, `double` and, in Java, `boolean`; the size decides the range of values.
- Python has `int` (unlimited size), `float`, `bool`, `str` and `NoneType`. There is no separate character type, and even a single letter is a string.
- JavaScript has `number`, `bigint`, `string`, `boolean`, `undefined`, `null` and `symbol`. Its `typeof null` returns "object", a historical quirk.

Primitives are generally stored by value and compared by value, in contrast with objects, which are compared by reference unless defined otherwise.

## explain
1. Identify what a value represents: a count, a measurement, a flag, a piece of text.
2. Pick the primitive that matches: integer for counts, floating point for measurements, boolean for flags, string for text.
3. Inspect it with `type(value)` in Python or `typeof value` in JavaScript when in doubt.
4. Watch the special cases: in Python `bool` is a subclass of `int`, so `True + True` is 2.
5. Treat null or None as "no value" rather than zero or an empty string.

## example
The Python sample walks over five values and prints each one with its type name: 42 is an int, 3.14 a float, "hi" a str, True a bool and None a NoneType. It also shows that True counts as 1 in arithmetic. The JavaScript sample prints the typeof of six values, including the surprising "object" for null and the separate bigint type.

## real
Database columns, JSON fields and API parameters are all described using these primitive types, and a mismatch such as sending the string "5" where a number is expected is a common integration bug.

## pros
- Primitives are fast and compact
- A small set of types covers most data a program needs
- Their behavior is well defined and consistent within a language

## cons
- Names and sizes differ between languages
- Floating point values are approximate
- Quirks such as typeof null being "object" catch beginners out

## uses
- Representing counts, prices, ages and other basic data
- Holding flags that control program flow
- Building strings of text for display
- Describing fields in a database schema or JSON document

## mistakes
- Using a float for a value that should be an exact integer count
- Treating None, 0 and an empty string as the same thing
- Assuming typeof null returns "null" in JavaScript
- Forgetting that Python strings have no separate character type

## interview
**Q:** What are the primitive data types in a typical language?
**A:** Integers, floating-point numbers, booleans, characters or strings, and a null value. Exact names and sizes depend on the language.

**Q:** What is the difference between null and undefined in JavaScript?
**A:** undefined means a variable has been declared but has no value assigned, while null is an explicit value meaning there is no object or value, assigned on purpose.

**Q:** Why is bool a subclass of int in Python?
**A:** For historical reasons: True and False behave as the integers 1 and 0 in arithmetic, so True + True equals 2.

## summary
Primitive types are the basic building blocks: integers, floating-point numbers, booleans, text and the null value. Pick the one that matches the meaning of the data, and learn the quirks of the language you use.

## codenote
Both samples print the type of each value. In Python bool is shown to behave like an integer in arithmetic; in JavaScript the typeof results include the well-known quirk for null.

## code
### python
```python
for value in [42, 3.14, "hi", True, None]:
    print(repr(value), type(value).__name__)

print(True + True, isinstance(True, int))
```
Output:
```text
42 int
3.14 float
'hi' str
True bool
None NoneType
2 True
```
### javascript
```javascript
console.log(typeof 42, typeof "hi", typeof true);
console.log(typeof undefined, typeof null, typeof 10n);
```
Output:
```text
number string boolean
undefined object bigint
```

## quiz
1. In Python, what type name does a single letter such as "A" report?
   - [ ] char
   - [x] str
   - [ ] byte
   - [ ] letter
   > Python has no character type; a single letter is a string of length one.
2. What does typeof null return in JavaScript?
   - [ ] null
   - [ ] undefined
   - [x] object
   - [ ] boolean
   > This is a long-standing quirk of the language kept for compatibility.
3. Which primitive is best for a yes or no setting?
   - [ ] Integer
   - [ ] Float
   - [x] Boolean
   - [ ] String
   > A boolean has exactly two states, matching a yes or no value.
4. What does True + True evaluate to in Python?
   - [ ] True
   - [ ] An error
   - [x] 2
   - [ ] 11
   > bool is a subclass of int, with True equal to 1.

# Integers and Floating Point
kind: concept
time: Not applicable — adding or multiplying two numbers is a constant-time hardware operation for fixed-size types. The topic here is the range and precision of numeric types.
space: Not applicable — integers and floats occupy fixed sizes in most languages, for example 4 or 8 bytes. Python integers grow as needed, but that is a property of the type.

## intro
Integers store whole numbers exactly and floating-point numbers store fractional values approximately. Knowing the difference explains why 0.1 + 0.2 is not exactly 0.3 and why a counter can overflow in some languages but not in others.

## theory
Integers:

- Fixed-width integers (C, Java) have a limited range: a 32-bit signed int holds about -2.1 billion to 2.1 billion, and exceeding it wraps around or is undefined.
- Python integers have arbitrary size, limited only by memory, so `2 ** 100` is exact.
- JavaScript has one `number` type (a 64-bit float) that represents integers exactly only up to 2^53 - 1, which is `Number.MAX_SAFE_INTEGER`, plus a separate `BigInt` for larger exact integers.

Floating point (IEEE 754):

- Numbers are stored as a sign, an exponent and a fraction in binary.
- Many decimal fractions, such as 0.1, have no exact binary representation, so they are stored as the nearest approximation.
- Results carry tiny rounding errors, so comparing floats with `==` is unreliable. Compare with a tolerance, for example `math.isclose` in Python.
- Special values exist: infinity and not-a-number.

Use integers when you need exact counts and floats for measurements. For money, use integer cents or a decimal type.

## explain
1. Ask whether the quantity is a count (integer) or a measurement (float).
2. For integers, know the range of the type so a loop counter or product cannot overflow.
3. For floats, expect small errors; never test for exact equality after arithmetic.
4. Use a tolerance such as `abs(a - b) < 1e-9`, or the library helper, for comparisons.
5. Reach for big integers (Python int, JavaScript BigInt) when numbers can exceed the safe range, as in factorials and cryptography.
6. Convert for display with formatting such as `round` or `toFixed`, but keep full precision in the calculation.

## example
Adding 0.1 and 0.2 in Python or JavaScript gives 0.30000000000000004, so comparing the sum with 0.3 using `==` is False, while a tolerance comparison is True. Python computes `2 ** 100` exactly as 1267650600228229401496703205376. In JavaScript, adding 2 to the largest safe integer 9007199254740991 gives 9007199254740992, which is off by one, while the same sum with BigInt values is exact.

## real
Financial systems avoid floats for money, graphics and physics engines accept small float errors for speed, and cryptography relies on exact big integers with hundreds of digits.

## pros
- Integers are exact and fast within their range
- Floating point covers a huge range of magnitudes in a fixed size
- Big integers remove overflow concerns when exactness matters

## cons
- Fixed-width integers can overflow silently
- Floats cannot represent most decimal fractions exactly
- Big integers are slower and use more memory

## uses
- Counting items, indexing and looping with integers
- Storing measurements such as temperature or speed as floats
- Computing very large exact values such as factorials
- Choosing integer cents instead of floats for currency

## mistakes
- Comparing two floats with == after arithmetic
- Using a float for currency amounts
- Assuming JavaScript numbers are exact beyond 2 to the 53rd power
- Overflowing a 32-bit integer in C or Java without noticing

## interview
**Q:** Why is 0.1 + 0.2 not exactly 0.3?
**A:** Binary floating point cannot represent 0.1 or 0.2 exactly, so each is stored as the nearest approximation, and the sum of those approximations is slightly more than 0.3.

**Q:** How should you compare two floating-point numbers?
**A:** Check whether their difference is smaller than a small tolerance, or use a helper such as math.isclose, instead of testing exact equality.

**Q:** What happens when a fixed-width integer overflows?
**A:** In Java the value wraps around, and for signed integers in C the behavior is undefined. Languages with big integers, such as Python, simply grow the number.

## summary
Integers are exact within their range, floats are approximations with tiny errors. Compare floats with a tolerance, avoid them for money, and use big integers when the size can exceed the safe range.

## codenote
Both samples show the classic floating-point sum and a tolerance comparison. The Python sample adds an exact huge integer, and the JavaScript sample shows the safe-integer limit and the BigInt fix.

## code
### python
```python
import math

total = 0.1 + 0.2
print(total)
print(total == 0.3, math.isclose(total, 0.3))
print(2 ** 100)
```
Output:
```text
0.30000000000000004
False True
1267650600228229401496703205376
```
### javascript
```javascript
console.log(0.1 + 0.2);
console.log(Math.abs(0.1 + 0.2 - 0.3) < 1e-9);
console.log(Number.MAX_SAFE_INTEGER + 2);
console.log(String(BigInt(Number.MAX_SAFE_INTEGER) + 2n));
```
Output:
```text
0.30000000000000004
true
9007199254740992
9007199254740993
```

## quiz
1. Why should money not be stored as a float?
   - [ ] Floats are too large
   - [x] Many decimal fractions cannot be stored exactly, so rounding errors accumulate
   - [ ] Floats cannot be printed
   - [ ] Floats are slower than strings
   > Cents as integers or a decimal type keep amounts exact.
2. What is the safe way to compare two floats after arithmetic?
   - [ ] Use the double equals operator
   - [x] Check that their difference is smaller than a tolerance
   - [ ] Convert them to strings
   - [ ] Add them first
   > Tiny representation errors make exact equality unreliable.
3. How large can a Python integer be?
   - [ ] 32 bits
   - [ ] 64 bits
   - [x] As large as memory allows
   - [ ] Exactly 2 to the 53rd power
   > Python integers have arbitrary precision.
4. What is Number.MAX_SAFE_INTEGER in JavaScript?
   - [ ] The largest value any number can hold
   - [x] The largest integer that can be represented exactly, 9007199254740991
   - [ ] The smallest positive float
   - [ ] The number of digits allowed
   > Beyond it some integers cannot be represented, so BigInt is needed for exactness.

# Characters and Booleans
kind: concept
time: Not applicable — comparing two characters or evaluating a boolean is a constant-time step. This topic is about how text and truth values are represented.
space: Not applicable — a boolean needs one bit of information and a character a small code, but the stored size depends on the language and encoding.

## intro
Characters are the individual symbols of text, and booleans are the two-valued truth type that drives every decision in a program. Both look simple, yet text encoding and truthiness rules cause some of the most puzzling bugs.

## theory
Characters:

- Computers store a character as a number. ASCII assigns codes to 128 characters, so `A` is 65 and `a` is 97.
- Unicode extends this to every writing system and emoji; each symbol has a code point.
- Encodings such as UTF-8 and UTF-16 describe how code points are turned into bytes. In UTF-8 a character takes from 1 to 4 bytes, so `é` takes 2 and an emoji takes 4.
- JavaScript strings use UTF-16, so an emoji counts as length 2, while Python counts code points, so it has length 1.
- Comparing characters compares their codes, which makes uppercase letters sort before lowercase letters.

Booleans:

- A boolean is `true` or `false` (`True` or `False` in Python).
- Comparisons and logical operators produce booleans.
- Many languages also treat other values as truthy or falsy in conditions. In Python, zero, an empty string, an empty collection and `None` are falsy. In JavaScript the falsy set includes `0`, `""`, `null`, `undefined` and NaN.

## explain
1. Remember that a character is a number under the surface; `ord` in Python and `charCodeAt` in JavaScript reveal it, and `chr` and `fromCharCode` go back.
2. When counting characters, decide whether you mean code points or bytes. They differ for non-English text.
3. Compare text with a case rule in mind: convert both sides with `lower()` before comparing if case should not matter.
4. Use real booleans for flags and conditions.
5. Learn the falsy values of your language so a condition such as `if items:` does what you expect.
6. Prefer explicit comparisons when zero or an empty string is a valid value, for example `if count is not None`.

## example
The Python sample prints the code of "A" (65), turns 97 back into "a", shows that "A" is less than "a", and measures the length of "é" as text (1) and as UTF-8 bytes (2). It also shows empty collections as False. The JavaScript sample prints the same character codes and reveals that the emoji has length 2 as a string but 1 when spread into code points.

## real
Text processing in every global application depends on correct Unicode handling, and bugs like a name being cut in half or a database column rejecting an emoji come from confusing characters with bytes.

## pros
- Numeric codes let characters be compared and ordered quickly
- Unicode lets one program handle every language
- Booleans make conditions precise and readable

## cons
- Length can mean code points, bytes or UTF-16 units depending on the language
- Truthiness rules differ between languages
- Case-sensitive comparison surprises people expecting letter equality

## uses
- Validating and transforming text input
- Converting between letters and numeric codes
- Counting characters correctly in international text
- Writing conditions using boolean flags

## mistakes
- Assuming one character is always one byte
- Measuring string length in JavaScript and expecting emoji to count as one
- Comparing strings without handling case
- Testing a value with if x when 0 or an empty string is legitimate data

## interview
**Q:** What is the difference between ASCII and Unicode?
**A:** ASCII defines 128 characters, mostly English letters, digits and punctuation. Unicode is a much larger standard that assigns a code point to characters from all writing systems and emoji.

**Q:** Why does an emoji have length 2 in JavaScript?
**A:** JavaScript strings are sequences of UTF-16 units, and an emoji lies outside the basic range so it is stored as two units, even though it is a single character to a reader.

**Q:** What values are falsy in Python?
**A:** False, None, zero in any numeric type, and empty sequences or collections such as an empty string, list, tuple, dict or set.

## summary
Characters are numbers interpreted through an encoding, so length and comparison depend on that encoding. Booleans drive decisions, and every language has its own list of falsy values to learn.

## codenote
Both samples reveal the numeric codes behind characters and the difference between character count and byte or unit count. Python also lists several falsy values.

## code
### python
```python
print(ord("A"), chr(97), "A" < "a")
print(len("é"), len("é".encode("utf-8")))
print(bool(0), bool(""), bool([]), bool(None), bool("False"))
```
Output:
```text
65 a True
1 2
False False False False True
```
### javascript
```javascript
console.log("A".charCodeAt(0), String.fromCharCode(97));
const face = "😀";
console.log(face.length, [...face].length);
```
Output:
```text
65 a
2 1
```

## quiz
1. What does ord("A") return in Python?
   - [ ] 1
   - [x] 65
   - [ ] 97
   - [ ] The letter A
   > ord gives the Unicode code point, which for A is 65.
2. Why is the Python expression "A" < "a" True?
   - [ ] Because A comes first in the alphabet only
   - [x] Because comparison uses character codes and 65 is less than 97
   - [ ] Because strings are compared by length
   - [ ] Because lowercase letters are bigger objects
   > Character comparison is numeric, so uppercase letters order before lowercase ones.
3. Which of these is falsy in Python?
   - [ ] The string "False"
   - [ ] The list [0]
   - [x] The empty string
   - [ ] The number 1
   > Empty containers and zero are falsy; a non-empty string such as "False" is truthy.
4. How many bytes does the letter é take in UTF-8?
   - [ ] 1
   - [x] 2
   - [ ] 3
   - [ ] 8
   > UTF-8 uses one byte for ASCII and two for letters in this range.

# Type Casting and Conversion
kind: concept
time: Not applicable — converting a single value takes constant time (parsing a string is proportional to its length, but that is rarely the concern). The topic is correctness of conversions.
space: Not applicable — a conversion normally creates one new value; there is no Big-O memory result to discuss.

## intro
Casting is the deliberate act of turning a value from one type into another. Doing it explicitly, at the right place and with a plan for bad input, is what separates robust programs from ones that crash when a user types a letter instead of a digit.

## theory
Casting functions exist in every language: `int()`, `float()`, `str()` and `bool()` in Python; `Number()`, `parseInt()`, `parseFloat()` and `String()` in JavaScript; the cast operator `(int)` in C and Java.

Conversion directions behave differently:

- Widening conversion goes to a type that can hold every value (int to float) and is safe.
- Narrowing conversion may lose information: float to int discards the fraction, a large long to a short wraps or truncates.
- Text to number parsing can fail. Python's `int("12.5")` raises ValueError; `parseInt("12px")` in JavaScript stops at the first bad character and returns 12; `Number("12px")` returns not-a-number.
- Number to text is always possible, and formatting chooses the layout.

Rounding choices matter when going from float to integer: `int()` and `Math.trunc` cut toward zero, `math.floor` goes down, `math.ceil` goes up, `round` goes to the nearest. Negative numbers show the differences.

## explain
1. Decide the source and target types and whether information can be lost.
2. Choose the function that expresses the exact rule you want: truncate, floor, ceil or round.
3. When converting text from outside the program, assume it can be invalid and handle the failure.
4. Check that the result is within range for the target type.
5. For text parsing in JavaScript, prefer `Number()` when the whole string must be numeric, and `parseInt` only when a prefix is acceptable.
6. Convert once, early, and keep the rest of the code in the target type.

## example
Take -3.9. In Python `int(-3.9)` is -3 because it truncates toward zero, `math.floor(-3.9)` is -4 and `math.ceil(3.1)` is 4. The text "12.5" cannot go through `int` directly, so the program converts it with `float` first. The JavaScript sample shows that `parseInt("12px")` is 12, `Number("12px")` is not a number, `Math.trunc(-3.9)` is -3 and `(255).toString(16)` produces the hexadecimal text "ff".

## real
Web forms, CSV files and command-line arguments all deliver text, so every real program has conversion code at its edges, and security-sensitive code checks the converted value's range before using it as an index or size.

## pros
- Explicit casts document intent and prevent accidental behavior
- Library conversion functions handle many formats and bases
- Widening conversions are safe and lossless

## cons
- Narrowing conversions can silently lose data
- Parsing can fail and needs error handling
- Different functions truncate, round or floor, and the choice is easy to get wrong

## uses
- Turning typed or file input into numbers
- Converting floating-point results to integer indexes
- Formatting numbers as text in different bases
- Parsing values in configuration, JSON and command-line arguments

## mistakes
- Using int() on a string that contains a decimal point
- Expecting int() to round to the nearest value
- Using parseInt in JavaScript without the radix argument for other bases
- Not handling the failure of a conversion on user input

## interview
**Q:** What is the difference between widening and narrowing conversion?
**A:** Widening converts to a type that can represent every original value, such as int to float, and is safe. Narrowing converts to a smaller or less precise type and may lose information, such as float to int.

**Q:** How does int(-3.9) differ from math.floor(-3.9) in Python?
**A:** int truncates toward zero and gives -3, while floor rounds toward negative infinity and gives -4.

**Q:** What is the difference between Number and parseInt in JavaScript?
**A:** Number converts the whole string and gives not-a-number if any part is invalid. parseInt reads from the start and stops at the first character that cannot be part of an integer, so "12px" becomes 12.

## summary
Cast deliberately, know whether the conversion widens or narrows, choose truncate, floor, ceil or round on purpose, and always plan for text that does not parse.

## codenote
The Python sample contrasts truncation, floor and ceiling, and converts a decimal string in two steps. The JavaScript sample compares lenient and strict parsing, then converts a number to hexadecimal text.

## code
### python
```python
import math

print(int(-3.9), math.floor(-3.9), math.ceil(3.1))

text = "12.5"
try:
    print(int(text))
except ValueError:
    print("int() rejects", text)
print(int(float(text)))
print(list("abc"))
```
Output:
```text
-3 -4 4
int() rejects 12.5
12
['a', 'b', 'c']
```
### javascript
```javascript
console.log(parseInt("12px"), Number("12px"));
console.log(parseFloat("3.5kg"), Math.trunc(-3.9));
console.log((255).toString(16), parseInt("ff", 16));
```
Output:
```text
12 NaN
3.5 -3
ff 255
```

## quiz
1. What does int(-3.9) return in Python?
   - [ ] -4
   - [x] -3
   - [ ] -3.9
   - [ ] 4
   > int truncates toward zero, so the fractional part is simply dropped.
2. Why does int("12.5") fail in Python?
   - [ ] Because the string is too long
   - [x] Because the text is not a valid integer literal, so a ValueError is raised
   - [ ] Because 12.5 is negative
   - [ ] It does not fail
   > int accepts only integer text; convert with float first if decimals are possible.
3. Which JavaScript call returns a number for the text "12px"?
   - [ ] Number("12px")
   - [x] parseInt("12px")
   - [ ] Boolean("12px")
   - [ ] String("12px")
   > parseInt reads the leading digits and ignores the rest.
4. Which conversion can lose information?
   - [ ] int to float for small values
   - [x] float to int
   - [ ] int to its text form
   - [ ] bool to int
   > Converting to int discards the fractional part.

# Variable Scope Rules
kind: concept
time: Not applicable — name lookup is a fast constant-time step in practice. The topic is which names are visible where, not how long something takes.
space: Not applicable — scope controls visibility, not the amount of memory a program needs.

## intro
Scope rules decide which variable a name refers to at each point in a program. They explain why a function can read a global value but not change it by default, how closures remember data, and why a JavaScript loop sometimes captures the wrong counter.

## theory
When a name is used, the language searches a chain of scopes. Python calls the order LEGB:

- Local — inside the current function
- Enclosing — in any outer function that contains this one
- Global — at the top level of the module
- Built-in — names such as `len` and `print`

Assignment inside a function creates a local variable unless you declare otherwise:

- `global name` makes assignments refer to the module-level variable.
- `nonlocal name` makes them refer to the variable in the nearest enclosing function.

A closure is a function that keeps access to variables of the scope where it was created, even after that scope has finished. This is how counters and callbacks remember state.

JavaScript scope rules: `let` and `const` are block scoped; `var` is function scoped and hoisted. Because a `var` loop variable is shared by the whole function, callbacks created in the loop all see its final value, while a `let` variable gets a fresh binding on each iteration.

## explain
1. For any name, look in the current function, then outward through enclosing functions, then the module, then built-ins.
2. If you assign to a name in a function, Python treats it as local for the entire function.
3. To update an outer variable, use `global` for module level and `nonlocal` for an enclosing function, or better, return a new value instead.
4. Use closures when a small function needs private state.
5. In JavaScript use `let` and `const` so loop variables and block variables are scoped as expected.
6. Keep global state to a minimum, since any code may change it.

## example
In Python a function `bump` declares `global count` and increments it twice, giving 2. A function `make_counter` defines `n = 0` and an inner function that uses `nonlocal n`, so each call to the returned counter yields 1, 2, 3. In JavaScript, three callbacks created in a `var` loop all return 3 when called later, while three created in a `let` loop return 0, 1 and 2.

## real
Callbacks in web pages, decorators in Python and module patterns in JavaScript all depend on closures capturing variables, and the loop-variable bug is a classic interview and production issue.

## pros
- Scope rules keep names from colliding between functions
- Closures give functions private, persistent state without classes
- Block scope in modern JavaScript removes a class of loop bugs

## cons
- Global and nonlocal declarations make data flow harder to follow
- Closures keep their captured variables alive and can hold memory
- The var rules in JavaScript are surprising

## uses
- Creating counters, accumulators and factories with closures
- Registering callbacks that remember data
- Isolating helper variables inside functions
- Choosing let over var to avoid shared loop variables

## mistakes
- Assigning to a global name in a function without declaring it global
- Reading a variable and assigning it in the same function, which makes Python treat it as local and raise UnboundLocalError
- Using var in loops that create callbacks
- Overusing global variables for convenience

## interview
**Q:** What is the LEGB rule in Python?
**A:** It is the order in which Python looks up a name: Local, Enclosing function, Global, then Built-in.

**Q:** What is a closure?
**A:** A function together with the variables of the scope where it was defined. It can keep using and updating those variables after the outer function has returned.

**Q:** Why do callbacks created in a var loop all print the same number in JavaScript?
**A:** A var variable has function scope, so every callback shares one variable whose value is the final one after the loop ends. A let variable creates a new binding for each iteration.

## summary
Names are resolved from the innermost scope outward. Use return values over global and nonlocal when you can, use closures for private state, and prefer let and const in JavaScript to avoid shared-variable surprises.

## codenote
The Python sample shows a global update and a closure with nonlocal. The JavaScript sample shows the var and let loop difference by collecting callbacks and calling them later.

## code
### python
```python
count = 0

def bump():
    global count
    count += 1

bump()
bump()
print(count)

def make_counter():
    n = 0
    def step():
        nonlocal n
        n += 1
        return n
    return step

counter = make_counter()
print(counter(), counter(), counter())
```
Output:
```text
2
1 2 3
```
### javascript
```javascript
const withVar = [];
const withLet = [];

for (var i = 0; i < 3; i++) withVar.push(() => i);
for (let j = 0; j < 3; j++) withLet.push(() => j);

console.log(withVar.map((f) => f()), withLet.map((f) => f()));
```
Output:
```text
[ 3, 3, 3 ] [ 0, 1, 2 ]
```

## quiz
1. What does the LEGB acronym stand for?
   - [ ] Loop, Expression, Global, Block
   - [x] Local, Enclosing, Global, Built-in
   - [ ] Line, Edit, Group, Branch
   - [ ] Lambda, Eval, Generator, Bytecode
   > It lists the scopes Python searches, innermost first.
2. Which keyword lets an inner function rebind a variable of the enclosing function in Python?
   - [ ] global
   - [x] nonlocal
   - [ ] static
   - [ ] extern
   > nonlocal refers to the nearest enclosing function scope rather than the module.
3. Why do callbacks made in a var loop all see the last value?
   - [ ] The callbacks run in parallel
   - [x] They share one function-scoped variable that ends at its final value
   - [ ] var is converted to a string
   - [ ] The loop runs backwards
   > Each iteration with let gets its own binding, which fixes the problem.
4. What is a closure?
   - [ ] A way to close a file
   - [x] A function that remembers variables from the scope where it was created
   - [ ] A syntax error
   - [ ] A loop that ends early
   > Closures keep access to captured variables even after the outer function returns.
