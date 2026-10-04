# Arithmetic Operators
kind: concept
time: Not applicable — a single arithmetic operation on machine numbers takes constant time. Division and exponentiation are slower than addition, but that is a hardware detail and not a growth rate.
space: Not applicable — an operator produces one new value; there is no input-sized memory to analyse.

## intro
Arithmetic operators add, subtract, multiply, divide and combine numbers. They look familiar from school mathematics, but division, remainders and negative numbers behave in ways that differ between languages and cause many early bugs.

## theory
The core operators are:

- Addition `+`, subtraction `-` and multiplication `*`
- Division `/` — in Python and JavaScript it always gives a floating-point result; in C and Java, dividing two integers gives an integer with the fraction discarded
- Floor division `//` (Python) — divides and rounds down to the nearest integer
- Remainder or modulo `%` — what is left after division
- Exponent `**` in Python and JavaScript (`pow` in C)
- Unary minus, which negates a value

Signs make a difference. Python floors the quotient, so `-7 // 2` is -4, and its remainder takes the sign of the divisor, so `-7 % 2` is 1. JavaScript and C truncate toward zero, so `-7 % 2` is -1. The identity `a == (a // b) * b + a % b` always holds within one language.

Division by zero is an error in Python (ZeroDivisionError) and for integers in C, while in JavaScript floating-point division by zero yields Infinity or -Infinity. `divmod(a, b)` in Python returns the quotient and remainder together.

## explain
1. Decide whether you want a true quotient or a whole-number quotient, and choose `/` or `//` accordingly.
2. Use `%` for questions about remainders: even or odd, wrapping around a range, converting seconds to minutes.
3. Check the sign rules of your language before using `%` with negative numbers.
4. Guard against a zero divisor before dividing.
5. Use `divmod` when you need both quotient and remainder, such as splitting 125 minutes into hours and minutes.
6. Mix integers and floats deliberately; the result of a mixed operation is a float.

## example
In Python `7 / 2` is 3.5, `7 // 2` is 3 and `7 % 2` is 1, so 7 equals 3 times 2 plus 1. With a negative dividend the results shift: `-7 // 2` is -4 and `-7 % 2` is 1. `divmod(17, 5)` returns the pair (3, 2). The JavaScript sample shows `-7 % 2` equal to -1, the exponent operator giving 1024 and division by zero giving Infinity.

## real
Clocks and calendars use remainders to wrap around, games use them to cycle through frames, and hash tables use them to turn a large number into a table position.

## pros
- A small set of operators covers most numeric calculations
- The remainder operator solves a wide range of wrap-around problems
- Operators are fast, since they map onto processor instructions

## cons
- Integer and floating-point division differ between languages
- Remainder with negative numbers is inconsistent across languages
- Division by zero is handled differently from one language to the next

## uses
- Converting units such as seconds to hours and minutes
- Testing whether a number is even or divisible by another
- Wrapping an index around the end of a list
- Computing averages, percentages and growth rates

## mistakes
- Expecting 7 / 2 to be 3 in Python or JavaScript
- Using % on negative numbers without checking the language's sign rule
- Dividing by a value that can be zero
- Forgetting that two integers divide to an integer in C and Java

## interview
**Q:** What is the difference between / and // in Python?
**A:** The single slash always returns a float, the true quotient. The double slash performs floor division and returns the quotient rounded down to the nearest whole number.

**Q:** What is the result of -7 % 2 in Python and in JavaScript?
**A:** Python gives 1, because the remainder takes the sign of the divisor and the quotient is floored. JavaScript gives -1, because the quotient is truncated toward zero and the remainder keeps the sign of the dividend.

**Q:** How can you test whether a number is even?
**A:** Check whether the remainder after dividing by 2 equals zero, written n % 2 == 0. This works for negative numbers in both Python and JavaScript when compared with zero.

## summary
Arithmetic operators are simple until division, remainders and negative numbers meet. Know whether your language floors or truncates, guard against dividing by zero, and use divmod or the remainder operator for wrap-around logic.

## codenote
The Python sample prints all the basic operators, the negative-number results and divmod. The JavaScript sample highlights the sign of the remainder and the behavior of division by zero.

## code
### python
```python
print(7 + 2, 7 - 2, 7 * 2)
print(7 / 2, 7 // 2, 7 % 2)
print(-7 // 2, -7 % 2, divmod(17, 5))
print(2 ** 10)
```
Output:
```text
9 5 14
3.5 3 1
-4 1 (3, 2)
1024
```
### javascript
```javascript
console.log(7 / 2, Math.floor(7 / 2));
console.log(-7 % 2, 2 ** 10);
console.log(5 / 0, -5 / 0);
```
Output:
```text
3.5 3
-1 1024
Infinity -Infinity
```

## quiz
1. What is 7 // 2 in Python?
   - [ ] 3.5
   - [x] 3
   - [ ] 4
   - [ ] 1
   > Floor division rounds the quotient down to the nearest integer.
2. What does -7 % 2 evaluate to in Python?
   - [ ] -1
   - [ ] 0
   - [x] 1
   - [ ] -3
   > Python's remainder takes the sign of the divisor, so the result is 1.
3. What does 5 / 0 give in JavaScript?
   - [ ] A ZeroDivisionError
   - [ ] 0
   - [x] Infinity
   - [ ] null
   > JavaScript follows floating-point rules, which define division by zero as infinity.
4. Which expression tests that n is divisible by 3?
   - [ ] n / 3 == 0
   - [x] n % 3 == 0
   - [ ] n // 3 == 3
   - [ ] n - 3 == 0
   > A remainder of zero means the division leaves nothing over.

# Relational Operators
kind: concept
time: Not applicable — comparing two numbers is a single constant-time operation. Comparing two strings or lists takes time proportional to the length of the common prefix, but this lesson is about meaning rather than cost.
space: Not applicable — a comparison produces a single boolean value.

## intro
Relational operators compare two values and produce a boolean: equal, not equal, less than, greater than and their inclusive forms. They are the raw material of every condition, and a handful of subtleties around types, strings and special values trip up even experienced programmers.

## theory
The six comparisons are `==`, `!=`, `<`, `>`, `<=` and `>=`. A few things to know:

- Python allows chained comparisons: `1 < x < 10` means `1 < x and x < 10`, and x is evaluated once.
- Strings compare lexicographically, one character code at a time. So `"apple" < "banana"` is true, and `"10" < "9"` is also true because the character "1" comes before "9". Numbers compare numerically, so `10 < 9` is false.
- Sequences compare element by element, so `[1, 2] < [1, 3]` is true.
- Python separates equality from identity: `==` asks whether values are equal, `is` asks whether two names refer to the very same object.
- JavaScript has loose equality `==`, which converts types first (`1 == "1"` is true), and strict equality `===`, which does not (`1 === "1"` is false). `null == undefined` is true but `null === undefined` is false.
- NaN, the not-a-number value, is not equal to anything, including itself. Test it with `Number.isNaN` in JavaScript or `math.isnan` in Python.

Comparing floating-point results with `==` is unreliable because of rounding.

## explain
1. Make sure both sides have the same type before comparing; convert text input to numbers first.
2. Use `===` in JavaScript unless you have a specific reason to allow coercion.
3. For ranges in Python, write the chained form `low <= x <= high`; in other languages combine two comparisons with a logical and.
4. Remember that strings compare by code, so compare numbers as numbers, and handle upper and lower case explicitly.
5. Use `is` only for comparisons with `None`, `True` and `False`, not for ordinary values.
6. Compare floats with a tolerance and test for NaN with the dedicated function.

## example
With x = 5 in Python, `1 < x < 10` is True and `x != 5` is False. Comparing the strings "10" and "9" gives True, but comparing the numbers 10 and 9 gives False, which is why numeric input must be converted before comparing. Two lists compare element by element. NaN is not equal to itself. In JavaScript, `1 == "1"` is true while `1 === "1"` is false, and `NaN === NaN` is false.

## real
Form validation checks that an age lies in a range, sorting uses comparisons of keys, and an access check compares a user's level against a required one. A great many production bugs involve comparing a string with a number.

## pros
- Comparisons are cheap and universal
- Chained comparisons in Python read like mathematics
- Strict equality in JavaScript removes coercion surprises

## cons
- Loose equality in JavaScript produces confusing results
- String comparison by character code does not match numeric or alphabetical expectations
- NaN breaks the usual rules of equality

## uses
- Validating that a value lies within a range
- Choosing a branch in an if statement
- Checking for the end of a loop
- Comparing version numbers, dates and prices

## mistakes
- Comparing a string to a number and getting the lexicographic answer
- Writing a single equals sign in a condition where a comparison was meant
- Using == in JavaScript where === is intended
- Testing x == NaN instead of using the proper NaN check

## interview
**Q:** Why is loose equality in JavaScript considered risky compared with strict equality?
**A:** Loose equality converts the operands first, so 1 == "1" and null == undefined are both true, which hides type mistakes. Strict equality compares type and value with no conversion, so 1 === "1" is false.

**Q:** What is the difference between == and is in Python?
**A:** == checks whether two values are equal; is checks whether both names refer to the same object in memory. Use is for None and singletons, == for values.

**Q:** Why is "10" < "9" true?
**A:** Strings are compared character by character using character codes. The first characters are "1" and "9", and "1" has the smaller code, so the comparison stops there.

## summary
Relational operators compare values and return booleans. Check the types first, use strict equality where available, know that text compares by character code, and never test floats or NaN with plain equality.

## codenote
The Python sample demonstrates chaining, string versus number comparison and sequence comparison. The JavaScript sample contrasts loose and strict equality and the unusual behavior of NaN.

## code
### python
```python
x = 5
print(1 < x < 10, x != 5)
print("apple" < "banana", "10" < "9", 10 < 9)
print([1, 2] < [1, 3])

nan = float("nan")
print(nan == nan)
```
Output:
```text
True False
True True False
True
False
```
### javascript
```javascript
console.log(1 == "1", 1 === "1");
console.log(null == undefined, null === undefined);
console.log(NaN === NaN, Number.isNaN(NaN));
console.log("10" < "9", 10 < 9);
```
Output:
```text
true false
true false
false true
true false
```

## quiz
1. Why is the string comparison "10" < "9" true?
   - [ ] Because 10 is smaller than 9
   - [x] Because strings compare character by character and "1" comes before "9"
   - [ ] Because strings are converted to floats
   - [ ] Because of a bug in Python
   > The comparison is lexicographic, so numeric order does not apply.
2. What does 1 < x < 10 mean in Python?
   - [ ] A syntax error
   - [x] Both 1 < x and x < 10 hold
   - [ ] Compare 1 with x, then compare the boolean with 10
   - [ ] x is either 1 or 10
   > Python supports chained comparisons that read like mathematical ranges.
3. Which JavaScript comparison is true?
   - [ ] 1 === "1"
   - [x] 1 == "1"
   - [ ] NaN === NaN
   - [ ] null === undefined
   > Loose equality converts the string to a number, while strict equality does not.
4. How should you test whether a value is NaN?
   - [ ] value == NaN
   - [ ] value === NaN
   - [x] Number.isNaN(value)
   - [ ] value is null
   > NaN is the only value not equal to itself, so a dedicated function is needed.

# Logical Operators
kind: concept
time: Not applicable — logical operators combine booleans in constant time. The topic is truth tables and how values are combined, not growth rates.
space: Not applicable — each operation yields a single value.

## intro
Logical operators combine true and false values: and, or and not. They let a program express compound conditions such as "the user is logged in and has paid", and understanding how they actually return values, not just booleans, is essential in Python and JavaScript.

## theory
The three operators, written `and`, `or`, `not` in Python and `&&`, `||`, `!` in C-family languages:

- AND is true only when both operands are true
- OR is true when at least one operand is true
- NOT inverts a value

A truth table lists every combination of inputs. For two inputs there are four rows, and AND is true only in the row where both are true.

Important laws:

- De Morgan: `not (a and b)` equals `(not a) or (not b)`, and `not (a or b)` equals `(not a) and (not b)`. They are used to simplify and invert conditions.
- Double negation: `not not a` is the truthiness of a.

In Python and JavaScript, `and`/`&&` and `or`/`||` return one of their operands rather than strictly True or False. `"" or "guest"` gives "guest", `"Ada" or "guest"` gives "Ada", `0 and 5` gives 0. This makes them useful for defaults, but also a source of surprises. JavaScript adds `??`, which falls back only for null and undefined, so `0 ?? 5` stays 0 while `0 || 5` becomes 5.

## explain
1. Write the condition in plain words first: "the account is active and the balance is positive".
2. Translate each part into a comparison that yields a boolean.
3. Combine them with AND and OR, adding parentheses where the grouping is not obvious.
4. To negate a compound condition, apply De Morgan's laws instead of guessing.
5. Use the operand-returning behavior for defaults only when the falsy values you might receive are acceptable.
6. Test the corner combinations: all true, all false and each single one true.

## example
The Python sample prints the three basic results: `True and False` is False, `True or False` is True and `not True` is False. It then shows `"" or "guest"` giving "guest", `"Ada" or "guest"` giving "Ada", `0 and 5` giving 0 and `3 and 5` giving 5. A final check loops over all four input pairs and confirms that De Morgan's law holds. In JavaScript, `0 || 5` is 5 but `0 ?? 5` is 0, and `null ?? "n/a"` is "n/a".

## real
Access control, search filters and feature flags are all logical expressions, and subtle logic mistakes in them lead directly to security holes, such as treating "not admin or not owner" as if it meant "neither admin nor owner".

## pros
- A tiny set of operators can express any condition
- De Morgan's laws help simplify and invert conditions
- Returning operands makes concise default values possible

## cons
- Mixing and and or without parentheses is error prone
- Negated compound conditions are hard to read
- Using or for defaults replaces valid falsy values such as zero

## uses
- Combining several validation checks into one condition
- Providing default values for missing input
- Building search and filter rules
- Expressing permissions and feature flags

## mistakes
- Misapplying negation to a compound condition instead of using De Morgan's laws
- Writing x == 1 or 2, which is always truthy, instead of x == 1 or x == 2
- Using or for a default and losing a legitimate zero or empty string
- Forgetting parentheses when mixing AND with OR

## interview
**Q:** State De Morgan's laws.
**A:** The negation of an AND is the OR of the negations, and the negation of an OR is the AND of the negations. In symbols, not (a and b) equals (not a) or (not b), and not (a or b) equals (not a) and (not b).

**Q:** What does "Ada" or "guest" evaluate to in Python?
**A:** It evaluates to "Ada". The or operator returns its first truthy operand, or the last operand if none are truthy, rather than strictly True or False.

**Q:** When would you use ?? instead of || in JavaScript?
**A:** When zero, an empty string or false are valid values that must be kept. The nullish operator falls back only when the left side is null or undefined.

## summary
AND, OR and NOT build compound conditions. Use truth tables and De Morgan's laws to reason about them, remember that Python and JavaScript return an operand rather than a plain boolean, and prefer the nullish operator for defaults where falsy values are valid.

## codenote
The Python sample prints basic results, operand-returning behavior and an exhaustive De Morgan check. The JavaScript sample compares the or operator with the nullish operator.

## code
### python
```python
print(True and False, True or False, not True)
print("" or "guest", "Ada" or "guest", 0 and 5, 3 and 5)

holds = all(
    (not (a and b)) == ((not a) or (not b))
    for a in (True, False)
    for b in (True, False)
)
print(holds)
```
Output:
```text
False True False
guest Ada 0 5
True
```
### javascript
```javascript
console.log(true && false, true || false, !true);
console.log(0 || 5, 0 ?? 5, null ?? "n/a");
```
Output:
```text
false true false
5 0 n/a
```

## quiz
1. When is a logical AND true?
   - [ ] When at least one operand is true
   - [x] Only when both operands are true
   - [ ] When both operands are false
   - [ ] Always
   > AND requires every operand to be true.
2. What is the negation of (a and b) according to De Morgan's laws?
   - [ ] (not a) and (not b)
   - [x] (not a) or (not b)
   - [ ] a or b
   - [ ] not a
   > Negating AND turns it into OR of the negated operands.
3. What does 0 or 5 evaluate to in Python?
   - [ ] 0
   - [x] 5
   - [ ] True
   - [ ] False
   > The or operator returns the first truthy operand, and zero is falsy.
4. Why is x == 1 or 2 usually a bug?
   - [ ] It is a syntax error
   - [x] The second operand, 2, is always truthy, so the whole condition is always truthy
   - [ ] It compares strings
   - [ ] It is slower
   > Each side of or must be a complete comparison, such as x == 1 or x == 2.

# Bitwise Operators Intro
kind: concept
time: Not applicable — a bitwise operation on a machine word is a single constant-time processor instruction. This is an introduction to what the operators mean, not an analysis of an algorithm.
space: Not applicable — bitwise operators work on values that are already stored, and each result occupies one word.

## intro
Bitwise operators work on the individual binary digits of integers. They look obscure at first, but they power flags and permission sets, low-level protocols, graphics and many compact tricks that are impossible with ordinary arithmetic.

## theory
Every integer is stored as bits. The bitwise operators combine two numbers bit by bit:

- AND `&` — a bit is 1 only if both bits are 1 (used to test or clear bits)
- OR `|` — a bit is 1 if either is 1 (used to set bits)
- XOR `^` — a bit is 1 if exactly one is 1 (used to toggle bits)
- NOT `~` — flips every bit; for signed integers `~x` equals `-x - 1`
- Left shift `<<` — moves bits left, which multiplies by powers of two
- Right shift `>>` — moves bits right, which divides by powers of two, rounding down

For example 12 is `1100` in binary and 10 is `1010`. Their AND is `1000` (8), their OR is `1110` (14) and their XOR is `0110` (6).

Do not confuse them with the logical operators: `&` works on bits of whole numbers, while `and` / `&&` works on truth values. Also note that in JavaScript the bitwise operators first convert numbers to 32-bit signed integers, so `1 << 31` is negative; `>>> 0` reinterprets the result as unsigned.

A common use is a set of flags stored in one integer: READ is 1, WRITE is 2, EXECUTE is 4, and combining them with `|` gives a permission number that `&` can test.

## explain
1. Write the numbers in binary and line the bits up in columns.
2. Apply the operator column by column.
3. To test a bit, AND with a mask that has only that bit set; a non-zero result means the bit is on.
4. To set a bit, OR with the mask. To clear it, AND with the inverted mask. To toggle it, XOR with the mask.
5. Use shifts to build masks: `1 << n` has only bit n set.
6. Remember the language's integer width, especially in JavaScript where it is 32 bits.

## example
In Python, `12 & 10` is 8, `12 | 10` is 14 and `12 ^ 10` is 6, `~12` is -13, `1 << 4` is 16 and `256 >> 2` is 64. A permission example sets READ = 1, WRITE = 2 and EXECUTE = 4; combining READ and WRITE gives 3, and `perms & WRITE` is non-zero, so writing is allowed while `perms & EXECUTE` is zero. In JavaScript the sample shows `1 << 31` becoming negative and `(1 << 31) >>> 0` reinterpreting it as 2147483648.

## real
File permission bits in operating systems, network masks, colour channels packed into one integer and feature flags in configuration are all stored and manipulated with bitwise operators.

## pros
- Very fast and memory efficient
- Many boolean flags fit into one integer
- Shifts give quick multiplication and division by powers of two

## cons
- Hard to read for people who do not think in binary
- Easy to confuse with logical operators
- Integer width and signedness differ between languages

## uses
- Storing permissions and options as flags in one number
- Extracting or packing fields such as colour channels
- Testing whether a number is even with n & 1
- Low-level work with protocols and hardware registers

## mistakes
- Using & where && was intended, or the reverse
- Forgetting that JavaScript converts operands to 32-bit integers
- Shifting by an amount larger than the integer width
- Assuming ~x is simply the negative of x

## interview
**Q:** How do you test whether a particular bit is set?
**A:** AND the number with a mask containing only that bit, such as n & (1 << k). A non-zero result means the bit is set.

**Q:** What is the difference between & and && ?
**A:** The single ampersand combines the bits of two integers. The double ampersand is a logical operator working on truth values, and it short-circuits.

**Q:** What does shifting left by one position do?
**A:** It doubles the value, as long as no bits overflow the integer width, because every bit moves to the next higher place value.

## summary
Bitwise operators act on the binary digits of integers: AND, OR, XOR, NOT and shifts. They are the tool for flags, masks and packed data, and they are different from the logical operators.

## codenote
The Python sample shows the operators on 12 and 10 and a small permission set. The JavaScript sample shows 32-bit signed behavior and the unsigned reinterpretation with the triple right shift.

## code
### python
```python
print(12 & 10, 12 | 10, 12 ^ 10, ~12)
print(1 << 4, 256 >> 2, bin(12))

READ, WRITE, EXECUTE = 1, 2, 4
perms = READ | WRITE
print(perms, bool(perms & WRITE), bool(perms & EXECUTE))
```
Output:
```text
8 14 6 -13
16 64 0b1100
3 True False
```
### javascript
```javascript
console.log(12 & 10, 12 | 10, 12 ^ 10, ~12);
console.log(1 << 31);
console.log((1 << 31) >>> 0);
```
Output:
```text
8 14 6 -13
-2147483648
2147483648
```

## quiz
1. What is 12 & 10 in decimal?
   - [ ] 2
   - [x] 8
   - [ ] 14
   - [ ] 22
   > 1100 AND 1010 equals 1000, which is 8.
2. Which operator sets a bit regardless of its current value?
   - [ ] AND
   - [x] OR
   - [ ] NOT
   - [ ] Right shift
   > OR with a mask that has the bit on forces that bit to 1.
3. What does n & 1 tell you about a non-negative integer n?
   - [ ] Whether it is prime
   - [x] Whether it is odd
   - [ ] Its square
   - [ ] Its sign
   > The lowest bit is 1 exactly for odd numbers.
4. Why is 1 << 31 negative in JavaScript?
   - [ ] Shifts always give negative numbers
   - [x] The result is treated as a 32-bit signed integer and bit 31 is the sign bit
   - [ ] Because of a rounding error
   - [ ] Because it overflowed to infinity
   > JavaScript converts operands to 32-bit signed integers for bitwise operations.

# Assignment Operators
kind: concept
time: Not applicable — assigning a value or applying a compound assignment is constant-time work for ordinary values.
space: Not applicable — assignment rebinds a name or overwrites a slot; the topic is the meaning of each form of assignment.

## intro
The assignment operator stores a value in a variable, and compound forms such as += combine an operation with the store. They are the most frequently written operators in any program, and their exact semantics for lists and objects hide a few surprises.

## theory
The forms of assignment:

- Simple assignment `=`: evaluate the right side, then bind or store it on the left
- Augmented (compound) assignment: `+=`, `-=`, `*=`, `/=`, `//=`, `%=`, `**=`, `<<=`, `>>=`, `&=`, `|=`, `^=`; `x += 5` is a shorthand for `x = x + 5` with x evaluated once
- Multiple assignment: `a = b = 0`, and unpacking `x, y = 1, 2`
- Walrus operator `:=` (Python 3.8 and later): assigns inside an expression
- Logical assignment in JavaScript: `??=` assigns only if the target is null or undefined, `||=` only if it is falsy, `&&=` only if it is truthy

In many languages assignment is an expression with a value (C, JavaScript); in Python the ordinary form is a statement, and only `:=` is an expression.

For mutable objects the compound form can differ from the long form. In Python `a += [2]` extends the existing list in place, so any other name bound to that list sees the change, whereas `a = a + [3]` builds a new list and rebinds `a`. For numbers and strings, which are immutable, both forms create a new value.

## explain
1. Evaluate the right-hand side completely, using the old values of any variables involved.
2. Store the result in the target.
3. For a compound operator, read the target, apply the operation with the right-hand side, and store the result back.
4. When the target is a list or another mutable object, decide whether you want to change it in place or create a new object.
5. Use the walrus operator when you need to both test and keep a value, such as a computed length.
6. Use the logical assignment operators in JavaScript for defaults and conditional updates.

## example
Starting from x = 10 in Python, the chain `x += 5`, `x -= 3`, `x *= 2`, `x //= 5` and `x **= 2` goes through 15, 12, 24, 4 and finally 16. Next, with `a = [1]` and `b = a`, running `a += [2]` changes the list that b also refers to, so b prints `[1, 2]`; afterwards `a = a + [3]` creates a new list, leaving b unchanged. The walrus operator tests `(n := len(data)) > 3` and keeps n. In JavaScript the logical assignments set a missing name, replace a falsy count and update a truthy flag.

## real
Counters, running totals and accumulators in loops use compound assignment constantly, and the in-place behavior of += on lists is the root of many shared-state bugs in real Python code.

## pros
- Compound operators are shorter and avoid repeating the variable name
- In-place update of lists can be more efficient than building a new one
- Logical assignment makes defaults concise

## cons
- In-place change is visible through every name bound to the object
- Assignment as an expression invites bugs such as if (x = 5)
- Several variants must be learned

## uses
- Maintaining running totals and counters in loops
- Setting default values for missing settings
- Swapping and unpacking multiple variables
- Updating flags with bitwise compound operators such as |=

## mistakes
- Assuming a += b always creates a new object
- Writing a = a + b in a loop for long lists and creating many copies
- Writing a single equals sign in an if condition where a comparison was intended
- Forgetting that a chained assignment shares one object between names

## interview
**Q:** Is x += 1 always identical to x = x + 1?
**A:** For numbers and strings the result is the same. For mutable objects such as lists, += may modify the object in place, which is visible through other references, while the long form creates a new object.

**Q:** What does the walrus operator do?
**A:** It assigns a value to a name inside an expression, for example if (n := len(data)) > 3, letting you both use and keep the value.

**Q:** What does ??= do in JavaScript?
**A:** It assigns the right-hand value only when the left-hand side is null or undefined, which makes it a safe way to set defaults without overwriting zero or an empty string.

## summary
Assignment stores values, and compound operators combine the operation with the store. Know when an operator mutates an object in place, use the walrus and logical assignments for concise code, and avoid assignment inside conditions where a comparison is meant.

## codenote
The Python sample steps through compound assignments, shows in-place versus new-list behavior and uses the walrus operator. The JavaScript sample uses the three logical assignments.

## code
### python
```python
x = 10
x += 5
x -= 3
x *= 2
x //= 5
x **= 2
print(x)

a = [1]
b = a
a += [2]
print(b)
a = a + [3]
print(a, b)

data = [1, 2, 3, 4]
if (n := len(data)) > 3:
    print("long", n)
```
Output:
```text
16
[1, 2]
[1, 2, 3] [1, 2]
long 4
```
### javascript
```javascript
let name = null;
name ??= "guest";

let count = 0;
count ||= 7;

let flag = 1;
flag &&= 9;

console.log(name, count, flag);
```
Output:
```text
guest 7 9
```

## quiz
1. In Python, a and b refer to the same list and a += [2] is executed. What does b show?
   - [ ] The original list
   - [x] The extended list, because += modified it in place
   - [ ] An error
   - [ ] An empty list
   > Augmented assignment on a list extends the existing object.
2. What does the expression x //= 5 do?
   - [ ] Compares x with 5
   - [x] Replaces x with the floor division of x by 5
   - [ ] Multiplies x by 5
   - [ ] Deletes x
   > It is shorthand for x = x // 5.
3. What does count ||= 7 do in JavaScript?
   - [ ] Always sets count to 7
   - [x] Sets count to 7 only if it is falsy
   - [ ] Sets count to 7 only if it is null
   - [ ] Adds 7 to count
   > Logical OR assignment replaces falsy values and keeps truthy ones.
4. What is the walrus operator used for?
   - [ ] Deleting a variable
   - [x] Assigning a value as part of an expression
   - [ ] Declaring a constant
   - [ ] Importing a module
   > It lets you name a value while testing it.

# Operator Precedence
kind: concept
time: Not applicable — precedence is a parsing rule that is resolved before the program runs, so it has no running time.
space: Not applicable — it determines how an expression is grouped, not how much data is stored.

## intro
Operator precedence decides which operations happen first when an expression contains several. A single misjudged precedence turns correct-looking arithmetic into a wrong answer, so it pays to know the main rules and to add parentheses wherever a reader might hesitate.

## theory
Precedence ranks operators; higher-ranked ones bind more tightly. Associativity decides the grouping among operators of the same rank: left to right for most, right to left for exponentiation and assignment.

A simplified Python order from highest to lowest:

- Parentheses
- Exponentiation `**` (right to left)
- Unary plus, minus and bitwise not
- Multiplication, division, floor division and remainder
- Addition and subtraction
- Shifts, then bitwise AND, XOR and OR
- Comparisons
- `not`, then `and`, then `or`
- Conditional expressions and assignment

Results worth memorising:

- `2 + 3 * 4` is 14 because multiplication binds tighter
- `2 ** 3 ** 2` is 2 to the power 9, which is 512, because exponentiation groups right to left
- `-2 ** 2` is -4 in Python because the exponent binds tighter than the unary minus; `(-2) ** 2` is 4
- `not` binds tighter than `and`, which binds tighter than `or`, so `True or False and False` is True
- Subtraction is left to right: `10 - 4 - 3` is 3
- In JavaScript `1 + 2 + "3"` is "33" (left to right, then concatenation) while `"1" + 2 + 3` is "123"

The best rule for readers is: if you need to look it up, add parentheses.

## explain
1. Mark the highest-precedence operators and evaluate them first, working from the inside of any parentheses.
2. For equal precedence, apply the associativity: usually left to right.
3. Evaluate the remaining operators in descending precedence.
4. Pay particular attention to unary minus with exponents, to not with and/or, and to bitwise operators mixed with comparisons.
5. Add parentheses to anything that is not obvious at a glance, even if they are not strictly needed.
6. Test an unfamiliar expression with simple numbers in a REPL.

## example
In Python, `2 + 3 * 4` gives 14 and `(2 + 3) * 4` gives 20. The expression `2 ** 3 ** 2` gives 512. `-2 ** 2` gives -4 while `(-2) ** 2` gives 4. `not True or True` is True because the not applies first, and `True or False and False` is True because the and applies before the or. Finally `2 + 3 * 4 ** 2 / 8` is 8.0: the exponent gives 16, the multiplication 48, the division 6.0 and the addition 8.0. The JavaScript lines show how precedence and left-to-right grouping combine with string concatenation.

## real
Style guides for most languages tell developers to parenthesise mixed expressions, and linters warn about expressions like a & b == c, where the comparison binds tighter than the bitwise AND in C.

## pros
- Precedence lets short expressions follow familiar mathematical rules
- Knowing the rules prevents surprising results
- Parentheses make the intended grouping explicit

## cons
- The full table is long and differs between languages
- Mixing bitwise, comparison and logical operators is a known trap
- Over-reliance on memorised rules makes code hard to read

## uses
- Writing arithmetic formulas correctly
- Reading conditions that combine and with or
- Debugging unexpected values in a calculation
- Understanding how string concatenation and addition interact in JavaScript

## mistakes
- Assuming the minus sign binds tighter than the exponent, so that minus two squared is expected to be 4
- Mixing and with or without parentheses
- Writing a & b == c in C and getting b == c evaluated first
- Relying on an operator table instead of making the grouping visible

## interview
**Q:** What is the value of 2 + 3 * 4 and why?
**A:** 14, because multiplication has higher precedence than addition, so 3 * 4 is evaluated first and then added to 2.

**Q:** How is a chain of two exponent operators, such as 2 to the power 3 to the power 2, grouped in Python?
**A:** Right to left, as 2 to the power of (3 to the power of 2), which is 2 to the power 9 and gives 512, because exponentiation is right associative.

**Q:** Why add parentheses when they are not required?
**A:** They document the intended grouping, so the next reader does not have to remember precedence tables, and they prevent mistakes when the expression is edited.

## summary
Precedence and associativity determine the grouping of an expression. Learn the main rules, especially for exponents, unary minus, not, and, or, and use parentheses to make anything non-obvious explicit.

## codenote
The Python sample checks arithmetic grouping, exponent associativity, unary minus and logical precedence. The JavaScript sample shows left-to-right grouping with strings.

## code
### python
```python
print(2 + 3 * 4, (2 + 3) * 4, 2 ** 3 ** 2)
print(-2 ** 2, (-2) ** 2)
print(not True or True, True or False and False)
print(10 - 4 - 3, 2 + 3 * 4 ** 2 / 8)
```
Output:
```text
14 20 512
-4 4
True True
3 8.0
```
### javascript
```javascript
console.log(2 + 3 * 4, (2 + 3) * 4, 2 ** 3 ** 2);
console.log(1 + 2 + "3", "1" + 2 + 3);
```
Output:
```text
14 20 512
33 123
```

## quiz
1. What is 2 + 3 * 4?
   - [ ] 20
   - [x] 14
   - [ ] 24
   - [ ] 9
   > Multiplication binds tighter than addition.
2. In Python, what does negative two to the power two evaluate to when written without any parentheses?
   - [ ] 4
   - [x] -4
   - [ ] 0
   - [ ] A syntax error
   > The exponent is applied before the unary minus, so the result is the negative of 2 squared.
3. Which logical operator has the lowest precedence in Python?
   - [ ] not
   - [ ] and
   - [x] or
   - [ ] They are all equal
   > The order from tightest to loosest is not, then and, then or.
4. What is the best way to avoid precedence mistakes in readable code?
   - [ ] Memorise the whole table
   - [x] Use parentheses to make the grouping explicit
   - [ ] Write everything on one line
   - [ ] Avoid arithmetic
   > Explicit grouping removes the need to recall rules and survives edits.

# Short Circuit Evaluation
kind: concept
time: Not applicable — short-circuiting can skip work, but its effect depends on the operands and is not a growth rate. The purpose of the lesson is how evaluation stops early and what that means for correctness.
space: Not applicable — it affects which operands are evaluated, not how much memory they need.

## intro
Short-circuit evaluation means that logical operators stop as soon as the answer is known. In an AND, if the left side is false the right side is never evaluated; in an OR, if the left side is true it is skipped. This is both an optimisation and a safety feature that programmers use deliberately.

## theory
The rules:

- `a and b` (or `a && b`): if a is falsy, the result is a and b is not evaluated
- `a or b` (or `a || b`): if a is truthy, the result is a and b is not evaluated
- JavaScript also has `??` (evaluates the right side only when the left is null or undefined) and optional chaining `?.` (stops and gives undefined when a link in the chain is null or undefined)

Consequences:

- Guard conditions: `x != 0 and 10 / x > 1` never divides by zero, because the division is skipped when x is zero
- Null guards: `user and user.name` avoids reading a property of nothing
- Side effects: if the right operand is a function call, it only runs when needed. Relying on that for important work is fragile and unclear.
- Cheap-first ordering: put a quick test before an expensive one so the expensive one often does not run

The non-short-circuit forms are the bitwise operators `&` and `|`, which always evaluate both sides, and in JavaScript the older tricks that depend on them are best avoided.

## explain
1. Read the left operand first; decide whether it already determines the result.
2. For AND, a false left side ends the evaluation; for OR, a true left side does.
3. Place guards first: the check that makes the later operand safe must come before it.
4. Put cheap checks before expensive or risky ones.
5. Avoid hiding essential side effects in the right operand.
6. In JavaScript use `?.` and `??` to handle missing values without long chains of and.

## example
In Python a helper function prints its label when it runs. For `check("a", False) and check("b", True)` only "check a" is printed, because the right side is skipped. For `check("c", True) or check("d", False)` only "check c" is printed. The expression `values and values[0]` with an empty list gives the empty list instead of raising IndexError. With x = 0, the guarded expression `x != 0 and 10 / x > 1` yields False without dividing. In JavaScript, `user?.name` on null gives undefined, `user && user.name` gives null, and `cfg.retries || 3` replaces a valid zero while `cfg.retries ?? 3` keeps it.

## real
Production code is full of guards such as "if the cache exists and it is fresh", and a missing guard order is a common source of null-pointer and index errors.

## pros
- Guards make code safe without nested if statements
- Skipping unnecessary work can improve speed
- Optional chaining shortens null checks dramatically

## cons
- Side effects in the skipped operand may never happen
- The returned operand can be surprising when it is not a boolean
- Order of operands becomes meaningful and fragile

## uses
- Protecting a division or index with a preceding check
- Avoiding property access on missing objects
- Running an expensive validation only when a cheap one passes
- Providing fallback values

## mistakes
- Putting the guard after the risky operand
- Depending on a skipped function call to perform necessary work
- Using or for a default and replacing valid zero values
- Using bitwise & where a short-circuit && was intended and evaluating both sides

## interview
**Q:** What is short-circuit evaluation?
**A:** The logical operators and and or stop evaluating as soon as the result is determined: and stops at the first falsy operand, or stops at the first truthy operand.

**Q:** Why does x != 0 and 10 / x > 1 not raise an error when x is zero?
**A:** When x != 0 is false, the and expression is already known to be false, so the division on the right is never evaluated.

**Q:** What is the difference between || and ?? in JavaScript?
**A:** The double bar falls back whenever the left side is falsy, including zero and the empty string. The nullish operator falls back only when the left side is null or undefined.

## summary
Logical operators stop as soon as the outcome is known. Use that for guards and cheap-first checks, keep essential side effects out of the right operand, and choose the nullish operator when falsy values are valid.

## codenote
The Python sample traces which function calls actually happen and demonstrates the empty-list and zero guards. The JavaScript sample shows optional chaining and the difference between the two fallback operators.

## code
### python
```python
def check(label, result):
    print("check", label)
    return result

print(check("a", False) and check("b", True))
print(check("c", True) or check("d", False))

values = []
print(values and values[0])

x = 0
print(x != 0 and 10 / x > 1)
```
Output:
```text
check a
False
check c
True
[]
False
```
### javascript
```javascript
const user = null;
console.log(user?.name, user && user.name);

const cfg = { retries: 0 };
console.log(cfg.retries || 3, cfg.retries ?? 3);
```
Output:
```text
undefined null
3 0
```

## quiz
1. In a and b, when is b not evaluated?
   - [ ] When a is true
   - [x] When a is falsy
   - [ ] Never, both sides always run
   - [ ] When b is falsy
   > A falsy left operand already decides the result of an and.
2. Why is x != 0 and 10 / x > 1 safe?
   - [ ] Division by zero is allowed in Python
   - [x] The division is skipped when x is zero
   - [ ] The compiler removes the division
   - [ ] x can never be zero
   > Short-circuiting stops evaluation after the failed guard.
3. What does cfg.retries ?? 3 return when retries is 0?
   - [ ] 3
   - [x] 0
   - [ ] null
   - [ ] false
   > The nullish operator only replaces null and undefined, so zero is kept.
4. Which operator always evaluates both operands?
   - [ ] &&
   - [ ] and
   - [x] The bitwise &
   - [ ] The or operator
   > Bitwise operators work on both values and do not short-circuit.
