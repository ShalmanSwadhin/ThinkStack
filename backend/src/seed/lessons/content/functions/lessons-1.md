# Functions as Abstraction
kind: concept
time: Not applicable — a function call has a small fixed overhead, and what a function costs depends on what it does inside. The lesson is about hiding detail behind a name.
space: Not applicable — a call uses a stack frame that disappears on return, but that is a language detail and not the point of abstraction.
practice: absolute-difference

## intro
A function gives a name to a piece of work so that the rest of the program can say what it wants done without repeating how. That separation of "what" from "how" is called abstraction, and it is the main tool for keeping programs understandable as they grow.

## theory
Abstraction means using something through a simple description while ignoring its internals. A function has two sides:

- The interface: its name, its parameters and what it returns. This is all a caller needs.
- The implementation: the statements inside. A caller should not depend on them, so they can be rewritten without breaking anyone.

Benefits that follow:

- Reuse: write the logic once and call it from many places
- Readability: `celsius_to_fahrenheit(c)` explains itself, a bare formula does not
- Independent testing: a function can be checked in isolation
- Change in one place: a corrected formula or a new tax rule is fixed once
- Layering: big tasks are built from medium functions, which are built from small ones

Guidelines for good abstractions:

- Name the function for what it does, usually with a verb
- Make it do one thing at one level of detail
- Keep the number of parameters small
- Document what it expects and returns, so callers need not read the body
- Do not leak details: if callers must know how it works to use it, the abstraction is leaky

A function that is too small to give a useful name, or too large to describe in a sentence, is probably wrongly cut.

## explain
1. Spot a calculation or a block of steps that you use or could name.
2. Decide what goes in (parameters) and what comes out (the return value).
3. Move the steps into a function with a descriptive name.
4. Replace the original code with a call and check that the behavior is unchanged.
5. Make sure the function hides decisions that might change later, such as the formula or the rate.
6. Read the calling code: it should now read like a description of the task.

## example
The function `celsius_to_fahrenheit` hides the formula; calling it for 0, 37 and 100 degrees gives 32.0, 98.6 and 212.0 after rounding to one decimal. Another function, `with_tax`, takes a price and a rate and returns the price including tax, so `with_tax(50, 0.2)` is 60.0 and `with_tax(19.99, 0.2)` is 23.99. A caller that totals a cart does not need to know how tax is computed. The JavaScript sample defines the same helper as an arrow function and uses it twice.

## real
Libraries are collections of abstractions: you call a function to sort a list or send an email without knowing the algorithm or the protocol. Teams often review code by asking whether each function has one clear job.

## pros
- Reduces duplication and the chance of inconsistent copies
- Lets the reader work at a higher level of detail
- Allows implementation changes without affecting callers

## cons
- Too many tiny functions can scatter logic
- A poorly chosen abstraction can mislead
- Each call adds a little indirection

## uses
- Naming formulas and rules
- Building programs in layers
- Providing reusable pieces for a team
- Isolating code that is likely to change

## mistakes
- Writing a long function that does several unrelated things
- Giving a function a vague name such as process or handle
- Leaking implementation details into the interface
- Copying the same code in several places instead of creating a function

## interview
**Q:** What is abstraction in the context of functions?
**A:** Using a function through its name and interface without needing to know its implementation, which lets you reason at a higher level and change the internals freely.

**Q:** What is the difference between a function's interface and its implementation?
**A:** The interface is what callers see: name, parameters and result. The implementation is the code inside, which can change without affecting callers as long as the interface behaves the same.

**Q:** How do you know a function should be split?
**A:** If you cannot describe what it does in one sentence, if it works at several levels of detail, or if parts of it could be reused or tested on their own.

## summary
A function is a named abstraction: callers rely on the interface and ignore the implementation. Give each function one clear job and a good name, and layer small functions into larger ones.

## codenote
The Python sample wraps a formula and a tax rule in named functions. The JavaScript sample uses an arrow function as the abstraction.

## code
### python
```python
def celsius_to_fahrenheit(celsius):
    return round(celsius * 9 / 5 + 32, 1)

def with_tax(price, rate):
    return round(price * (1 + rate), 2)

print([celsius_to_fahrenheit(c) for c in (0, 37, 100)])
print(with_tax(50, 0.2), with_tax(19.99, 0.2))
```
Output:
```text
[32.0, 98.6, 212.0]
60.0 23.99
```
### javascript
```javascript
const withTax = (price, rate) => Math.round(price * (1 + rate) * 100) / 100;

console.log(withTax(50, 0.2));
console.log(withTax(10, 0.07));
```
Output:
```text
60
10.7
```

## quiz
1. What does a caller of a function need to know?
   - [ ] Every line of its body
   - [x] Its name, parameters and what it returns
   - [ ] The names of its local variables
   - [ ] Which editor wrote it
   > The interface is enough; the implementation can change.
2. What is a benefit of putting a formula inside a named function?
   - [ ] It makes the formula run faster
   - [x] It can be reused, tested and corrected in one place
   - [ ] It hides the formula from the computer
   - [ ] It removes the need for variables
   > One definition means one place to fix.
3. Which name best describes a function's job?
   - [ ] process
   - [ ] handle_it
   - [x] calculate_shipping_cost
   - [ ] stuff
   > A specific verb phrase tells readers what the function does.
4. What is a leaky abstraction?
   - [ ] A function that returns nothing
   - [x] One where callers must know implementation details to use it correctly
   - [ ] A function with a long name
   - [ ] A function with no parameters
   > Hidden details that matter defeat the purpose of the interface.

# Parameters and Arguments
kind: concept
time: Not applicable — passing arguments is a constant-time step for a normal call. The topic is how values are matched to names.
space: Not applicable — arguments are bound to parameter names; whether they are copied is covered in the lesson on pass by value and reference.

## intro
Parameters are the names a function declares for its inputs, and arguments are the actual values a caller supplies. Understanding how the two are matched, by position, by name or in variable numbers, explains most call-related errors and lets you design flexible interfaces.

## theory
Terminology: a parameter is a variable in the function definition (`def area(width, height)`), an argument is a value in the call (`area(3, 4)`). People use the words loosely, but the distinction helps when reading error messages.

Ways of passing arguments in Python:

- Positional: matched to parameters in order, `area(3, 4)`
- Keyword: matched by name, `area(height=4, width=3)`, order free; clearer when a function has several parameters of the same type
- Variable positional: `*args` collects extra positional arguments into a tuple
- Variable keyword: `**kwargs` collects extra named arguments into a dictionary
- Keyword-only parameters, written after `*args` or a bare `*`, must be passed by name
- Positional-only parameters, written before a `/`, cannot be passed by name

Rules: positional arguments come before keyword arguments in a call, a parameter cannot receive two values, and missing or extra arguments raise TypeError.

JavaScript differs: arguments are matched by position only; missing ones become undefined, extra ones are ignored, and rest parameters (`...nums`) collect extras into a real array. Destructuring an object in the parameter list simulates named arguments: `function greet({ name, greeting = "Hello" })`. The spread operator `...` expands an array into separate arguments in a call.

Good design: few parameters (more than about four suggests a missing object), consistent order across related functions, and no boolean flags that change the whole meaning of the function.

## explain
1. Decide the inputs the function needs and give each a descriptive name.
2. Put required parameters first, then optional ones.
3. When calling, use positional arguments for obvious ones and keyword arguments when the meaning is not clear from the value alone.
4. Use variable arguments only when the number of inputs is truly open-ended.
5. Check what happens with too few and too many arguments in your language.
6. Group many related parameters into one object or record.

## example
The Python function `describe(name, age, *tags, city="unknown", **extra)` receives "Ada" and 36 as positional values, collects "math" and "code" into the tuple `tags`, takes `city` as a keyword-only parameter and puts the leftover `job="engineer"` into `extra`; the formatted result shows all four. Calling it with only a name raises a TypeError, which the program reports. In JavaScript, a rest parameter sums three numbers to 6, the spread operator passes an array to `Math.max` giving 9, and a destructured parameter with a default produces the greeting "Hello Ada".

## real
Library APIs use keyword arguments heavily for readability, such as the mode and encoding options of the built-in open function, and command-line wrappers use variable arguments to forward options to other functions.

## pros
- Keyword arguments make calls self-documenting
- Variable arguments allow flexible interfaces
- Destructuring and defaults in JavaScript simulate named parameters

## cons
- Long parameter lists are error prone
- Variable arguments can hide mistakes in the call
- Positional order is easy to mix up between same-typed values

## uses
- Writing functions with required and optional inputs
- Forwarding arguments to another function
- Creating functions such as sum or max that accept any number of values
- Designing readable APIs with named options

## mistakes
- Passing arguments in the wrong order
- Supplying a value both positionally and by keyword
- Using a boolean flag whose meaning is unclear at the call site
- Accepting variable arguments when a list would be clearer

## interview
**Q:** What is the difference between a parameter and an argument?
**A:** A parameter is the variable named in the function definition, while an argument is the actual value passed in a call.

**Q:** What do args and kwargs collect in Python?
**A:** Extra positional arguments are collected into a tuple, and extra keyword arguments are collected into a dictionary.

**Q:** What happens in JavaScript if you call a function with fewer arguments than parameters?
**A:** The missing parameters are undefined; JavaScript does not raise an error for the wrong number of arguments.

## summary
Match arguments to parameters by position or name, use variable arguments sparingly, and keep parameter lists short and clear. Remember how your language handles missing and extra arguments.

## codenote
The Python sample shows positional, variable, keyword-only and variable keyword parameters, and a call with a missing argument. The JavaScript sample shows rest, spread and destructured parameters.

## code
### python
```python
def describe(name, age, *tags, city="unknown", **extra):
    return f"{name} {age} {tags} {city} {sorted(extra)}"

print(describe("Ada", 36, "math", "code", city="London", job="engineer"))

try:
    describe("Ada")
except TypeError as error:
    print(type(error).__name__)
```
Output:
```text
Ada 36 ('math', 'code') London ['job']
TypeError
```
### javascript
```javascript
function sum(...numbers) {
  return numbers.reduce((a, b) => a + b, 0);
}

function greet({ name, greeting = "Hello" }) {
  return `${greeting} ${name}`;
}

console.log(sum(1, 2, 3));
console.log(Math.max(...[3, 9, 2]));
console.log(greet({ name: "Ada" }));
```
Output:
```text
6
9
Hello Ada
```

## quiz
1. What is the difference between a parameter and an argument?
   - [ ] They are the same thing in every case
   - [x] A parameter is named in the definition; an argument is the value passed in the call
   - [ ] Parameters are only used in loops
   - [ ] Arguments are only strings
   > The parameter is the placeholder, and the argument fills it.
2. Which Python call style makes the meaning of values clearest when many parameters have the same type?
   - [ ] Positional
   - [x] Keyword
   - [ ] Random
   - [ ] Reverse
   > Names at the call site document each value.
3. What does JavaScript do when a function receives fewer arguments than it has parameters?
   - [ ] Raises an error
   - [x] The missing parameters are undefined
   - [ ] The function is not called
   - [ ] The extra parameters are deleted
   > JavaScript does not check argument counts.
4. What does the rest syntax collect in JavaScript?
   - [ ] A string
   - [x] The remaining arguments in an array
   - [ ] The function body
   - [ ] The return value
   > The rest parameter gathers extras into a real array.

# Return Values
kind: concept
time: Not applicable — returning a value is a constant-time operation. The lesson is about what a function hands back and how callers use it.
space: Not applicable — a returned value may be a reference to existing data or a newly created object, depending on the case.
practice: maximum-of-two-numbers

## intro
A return value is how a function hands its result back to the caller. Choosing what to return, and the difference between returning a value and printing one, determines whether a function can be reused, tested and combined with others.

## theory
Key points:

- `return value` ends the function immediately and sends the value to the caller; statements after it do not run
- A function without a return statement returns `None` in Python and `undefined` in JavaScript, so a caller who uses its result gets that special value
- A function can have several return statements, for example one per case, which is often clearer than a single exit
- Several results can be returned together: a tuple in Python (unpacked into names by the caller), an object or array in JavaScript, a struct in C
- Returning versus printing: print shows something to a human and gives nothing back to the program; return gives the value to the caller, which can store, test or format it. Functions that compute should return, and only the top-level code should print.
- The type and meaning of the result should be consistent. Returning a number in one case and None or a string in another makes callers add checks. Use an exception for errors or a documented sentinel.

Language gotchas:

- In JavaScript, a line break directly after `return` ends the statement, so `return\n 42` returns undefined because of automatic semicolon insertion
- Python returns the object itself, not a copy; mutating a returned list affects any other holder of it
- Arrow functions with an expression body return that expression without the word return

A function that returns a boolean should be named as a question (`is_valid`), and one that returns a collection should return an empty collection, not None, when there is nothing.

## explain
1. Decide what result the caller needs and its type.
2. Compute it without printing inside the function.
3. Use early returns for special cases so the main path stays flat.
4. If there are several results, return them as a tuple, object or small record and document the order.
5. Make every path return a value of the same kind.
6. At the call site, store or use the result; do not ignore it.

## example
In Python, `min_max([4, 9, 1])` returns two values that the caller unpacks into low and high, printing `1 9`. A function `shout` prints its argument in capitals but returns nothing, so assigning its result gives None, shown by the second print. `sign` uses three returns for the three cases and gives `[1, -1, 0]` for 5, -2 and 0. In JavaScript, a function returns an object with two fields, a function with no return gives undefined, and a function with the value on the line after `return` also gives undefined.

## real
APIs return results rather than printing them so they can be used in web responses, tests and other programs. A frequent bug is a function that prints its answer when the caller expected to receive it.

## pros
- Returned values can be combined, stored and tested
- Early returns make cases explicit
- Multiple return values avoid global variables

## cons
- Forgetting to return gives None or undefined silently
- Inconsistent return types force callers to check
- Returning a mutable object can expose internal state

## uses
- Computing a result for the caller
- Returning several related values together
- Signalling success or failure with a boolean
- Producing data to be formatted elsewhere

## mistakes
- Printing a result instead of returning it
- Forgetting the return statement in one branch
- Putting the returned expression on a new line in JavaScript
- Returning different types depending on the case

## interview
**Q:** What does a Python function return if it has no return statement?
**A:** It returns None, the special value meaning no value, so a caller that stores the result gets None.

**Q:** What is the difference between returning and printing a value?
**A:** Printing displays text for a person and gives nothing back to the program, whereas returning passes the value to the caller, which can store, test or format it.

**Q:** Why can return followed by a line break in JavaScript be a bug?
**A:** Automatic semicolon insertion ends the statement after return, so the function returns undefined and the expression on the next line never runs.

## summary
Compute and return values rather than printing them, keep return types consistent, use early returns for special cases and remember what each language returns when you forget.

## codenote
The Python sample covers multiple values, a missing return and early returns. The JavaScript sample shows an object result and two ways of getting undefined.

## code
### python
```python
def min_max(values):
    return min(values), max(values)

low, high = min_max([4, 9, 1])
print(low, high)

def shout(text):
    print(text.upper())

result = shout("hi")
print(result)

def sign(n):
    if n > 0:
        return 1
    if n < 0:
        return -1
    return 0

print([sign(x) for x in (5, -2, 0)])
```
Output:
```text
1 9
HI
None
[1, -1, 0]
```
### javascript
```javascript
function minMax(values) {
  return { low: Math.min(...values), high: Math.max(...values) };
}

function noReturn() {}

function broken() {
  return
  42;
}

console.log(minMax([4, 9, 1]));
console.log(noReturn());
console.log(broken());
```
Output:
```text
{ low: 1, high: 9 }
undefined
undefined
```

## quiz
1. What does a Python function without a return statement give back?
   - [ ] 0
   - [ ] An empty string
   - [x] None
   - [ ] An error
   > None is the default result.
2. Why should a computing function return its result rather than print it?
   - [ ] Printing is slower
   - [x] The caller can then store, test or reuse the value
   - [ ] Printing is not allowed in functions
   - [ ] Returns use less memory
   > A printed value cannot be used by other code.
3. What does this JavaScript function return: return, line break, 42?
   - [ ] 42
   - [x] undefined
   - [ ] null
   - [ ] An error
   > Automatic semicolon insertion ends the return statement at the line break.
4. How can a Python function return two results?
   - [ ] It cannot
   - [x] As a tuple that the caller unpacks
   - [ ] By printing twice
   - [ ] By using two return keywords in a row
   > The values are packed into a tuple and unpacked by the caller.

# Pass by Value vs Reference
kind: concept
time: Not applicable — how arguments are passed does not change the number of steps, except that copying a large value costs time proportional to its size.
space: Not applicable — whether an argument is copied or shared is the subject, but the effect depends on the language and type.

## intro
When you call a function with a variable, does the function get a copy of the value or access to the original? The answer decides whether the function can change the caller's data, and different languages answer differently. Python and JavaScript use a middle path that is often misdescribed.

## theory
The classic models:

- Pass by value: the function receives a copy; changes to the parameter do not affect the caller's variable. C passes everything by value, including pointers (the pointer is copied, but it still points to the same data, which is how C functions modify caller data).
- Pass by reference: the parameter is an alias for the caller's variable, so assigning to the parameter changes the caller's variable. C++ reference parameters (`int& x`) work like this.

Python and JavaScript (and Java for objects) pass references to objects by value; Python's community calls it pass by assignment or call by sharing. The parameter becomes another name for the same object. Two consequences:

- Mutating the object through the parameter (appending to a list, changing a property) is visible to the caller, because both names refer to one object
- Rebinding the parameter (assigning a new object to it) affects only the local name; the caller's variable still refers to the old object

Immutable values such as numbers, strings and tuples cannot be mutated, so a function appears to be pass by value for them: `n += 1` creates a new number and rebinds the local name.

To avoid surprising a caller, a function should either mutate its argument deliberately and document it (like `list.sort()`), or leave it alone and return a new object (like `sorted()`). Copy explicitly when needed: `list(items)`, `items.copy()`, `copy.deepcopy`, or `structuredClone` in JavaScript. A shallow copy copies only the top level; nested objects remain shared.

## explain
1. Ask: is the argument mutable (list, dictionary, object) or immutable (number, string, tuple)?
2. Decide whether the function should change the caller's data. If not, do not mutate; copy first if you need a working version.
3. If the function mutates, document it and consider returning None to signal in-place change, as the standard library does.
4. Remember that assigning to the parameter never changes the caller's variable in Python and JavaScript.
5. For nested data, use a deep copy when you need independence.
6. In C, pass a pointer when a function must modify the caller's variable.

## example
In Python, `append_item(data)` adds 99 to the list that the caller passed, so printing `data` afterwards shows `[1, 2, 99]`. `rebind(data)` assigns a new list to its parameter, which leaves the caller's list untouched, so the second print still shows `[1, 2, 99]`. `bump(x)` for the integer 5 returns 6 but x remains 5. The JavaScript functions behave the same: `reassign` does not change `obj.a`, which stays 1, but `mutate` sets it to 3. The C sample, which is not run here, swaps two integers by receiving their addresses.

## real
A well-known source of bugs is a function that mutates a list passed by the caller, which then shows unexpected data elsewhere; style guides tell developers to avoid mutating arguments unless the function name or documentation says so.

## pros
- Sharing objects avoids copying large data
- Immutable values are safe to share
- Explicit copies keep ownership clear

## cons
- Accidental mutation of shared data causes bugs far from the cause
- Terminology is inconsistent, so explanations are often wrong
- Shallow copies still share nested objects

## uses
- Writing functions that update records in place deliberately
- Passing large data without copying
- Protecting caller data by copying first
- Swapping or updating variables through pointers in C

## mistakes
- Assuming that assigning to a parameter changes the caller's variable
- Mutating a list argument without documenting it
- Using a shallow copy where a deep copy is needed
- Believing that Python is pass by reference in the C++ sense

## interview
**Q:** Is Python pass by value or pass by reference?
**A:** Neither exactly. It passes references to objects by value, sometimes called pass by assignment: the parameter refers to the same object, so mutation is visible to the caller but rebinding the name is not.

**Q:** Why does the caller's integer not change when a function does n += 1?
**A:** Integers are immutable, so n += 1 creates a new integer and rebinds the local name, leaving the caller's variable unchanged.

**Q:** How do you protect the caller's list from changes inside a function?
**A:** Work on a copy, for example list(items) or items.copy(), and use a deep copy if the list contains nested mutable objects.

## summary
In Python and JavaScript the parameter is a new name for the same object: mutation is shared, rebinding is local. Copy deliberately, document functions that mutate and use pointers or references where the language requires them.

## codenote
The Python sample shows mutation, rebinding and immutable arguments. The JavaScript sample shows the same for objects. The C sample passes addresses to change caller variables.

## code
### python
```python
def append_item(items):
    items.append(99)

def rebind(items):
    items = [0]

def bump(n):
    n += 1
    return n

data = [1, 2]
append_item(data)
print(data)
rebind(data)
print(data)

x = 5
print(bump(x), x)
```
Output:
```text
[1, 2, 99]
[1, 2, 99]
6 5
```
### javascript
```javascript
function reassign(o) {
  o = { a: 2 };
}

function mutate(o) {
  o.a = 3;
}

const obj = { a: 1 };
reassign(obj);
console.log(obj.a);
mutate(obj);
console.log(obj.a);
```
Output:
```text
1
3
```
### c
```c
#include <stdio.h>

void swap(int *a, int *b) {
    int temp = *a;
    *a = *b;
    *b = temp;
}

int main(void) {
    int x = 1;
    int y = 2;
    swap(&x, &y);
    printf("%d %d\n", x, y);
    return 0;
}
```

## quiz
1. After a Python function assigns a new list to its parameter, what happens to the caller's list?
   - [ ] It is replaced
   - [x] It is unchanged
   - [ ] It is deleted
   - [ ] It becomes empty
   > Rebinding a parameter only changes the local name.
2. After a function appends to a list parameter, what does the caller see?
   - [ ] The original list
   - [x] The list with the new item, because the object is shared
   - [ ] A copy
   - [ ] An error
   > Mutation acts on the one shared object.
3. How does a C function modify the caller's integer?
   - [ ] By assigning to its parameter
   - [x] By receiving a pointer to the integer
   - [ ] By returning void
   - [ ] It cannot
   > C passes copies, so the address is passed to give access to the original.
4. What does a shallow copy of a list of lists share with the original?
   - [ ] Nothing
   - [x] The inner lists
   - [ ] The length
   - [ ] The variable name
   > Only the outer list is duplicated.

# Function Overloading
kind: concept
time: Not applicable — overload selection happens at compile time in languages that support it, or through a small dispatch check at run time elsewhere. It is not an algorithmic cost.
space: Not applicable — overloading is a naming and dispatch feature and does not change data storage.

## intro
Function overloading means using one name for several functions that differ in their parameters, with the language choosing the right one for each call. It exists in Java, C++ and C#, but not in Python or JavaScript, where other techniques give the same flexibility.

## theory
In languages with overloading, each version has a distinct signature: a different number of parameters, different parameter types, or a different order of types. The compiler resolves a call by matching the arguments to the best signature at compile time. The return type alone cannot distinguish overloads.

Rules and pitfalls:

- Implicit conversions can make a call ambiguous (for example passing an integer where both a long and a double version exist)
- Overloads should do the same conceptual thing for different inputs: `print(int)` and `print(String)`. Different behavior under one name misleads.
- Resolution happens at compile time on the declared types of the arguments, in contrast with overriding, which selects an implementation at run time based on the object's actual class

Python and JavaScript have a single function per name; a second definition simply replaces the first. Alternatives:

- Default parameters and keyword arguments cover many cases
- Checking the type or count of arguments inside one function (`isinstance`, `typeof`, `arguments.length`)
- `functools.singledispatch` in Python, which registers implementations for different types of the first argument
- Separate, clearly named functions: `parse_from_string` and `parse_from_file` are often better than one overloaded `parse`
- Multiple constructors via class methods such as `Date.from_timestamp`

Overloading is about convenience and naming consistency, and many style guides prefer distinct names when the operations are not truly the same.

## explain
1. Decide whether the variants really do the same thing for different input kinds.
2. In Java or C++, give each variant a distinct signature and call it with arguments that match exactly.
3. Avoid overloads that differ only by implicit conversions, which can become ambiguous.
4. In Python, use defaults, `singledispatch` or separate names.
5. In JavaScript, branch on argument types or counts, or use an options object.
6. Test each variant, including the case where no variant matches.

## example
In Python, the second definition of `area` replaces the first, so calling it with one argument raises a TypeError and the program prints "first definition is gone". With `singledispatch`, a base `describe` function handles any object, and registered versions handle integers and strings, so `describe(3)`, `describe("hi")` and `describe(2.5)` give "int 3", "text hi" and "object 2.5". The JavaScript function inspects its arguments to behave differently for one number, two numbers and a string. The Java sample, which is not run here, shows true overloading by type.

## real
Java's println method accepts any primitive type or object through overloads, and C++ libraries overload operators and constructors. Python code that needs the same flexibility uses defaults and dispatch decorators.

## pros
- One name for conceptually one operation across types
- The compiler picks the correct version without run-time checks
- Reduces the number of names a user must learn

## cons
- Ambiguous calls and surprising conversions
- Not available in Python and JavaScript
- Hard to read if overloads behave differently

## uses
- Providing the same operation for several argument types
- Offering optional parameters in Java and C++
- Defining several constructors
- Replacing explicit type checks with dispatch in Python

## mistakes
- Expecting two definitions of the same name to coexist in Python
- Overloading with different behavior under the same name
- Relying on implicit conversions that cause ambiguity
- Trying to overload by return type

## interview
**Q:** What is function overloading?
**A:** Defining multiple functions with the same name but different parameter lists, so the compiler chooses which one to call based on the arguments.

**Q:** Does Python support overloading?
**A:** Not directly. A later definition replaces an earlier one with the same name. Default arguments, type checks or functools.singledispatch provide similar flexibility.

**Q:** What is the difference between overloading and overriding?
**A:** Overloading chooses among functions with the same name and different parameters at compile time. Overriding replaces an inherited method in a subclass and is selected at run time by the object's actual type.

## summary
Overloading gives one name to several signatures in Java and C++. Python and JavaScript need defaults, type checks or dispatch tools instead, and clear separate names are often best.

## codenote
The Python sample shows redefinition and singledispatch. The JavaScript sample branches on arguments. The Java sample shows a pair of compile-time overloads.

## code
### python
```python
from functools import singledispatch

def area(radius):
    return 3 * radius * radius

def area(width, height):
    return width * height

try:
    area(2)
except TypeError:
    print("first definition is gone")

@singledispatch
def describe(value):
    return f"object {value}"

@describe.register
def _(value: int):
    return f"int {value}"

@describe.register
def _(value: str):
    return f"text {value}"

print(describe(3), describe("hi"), describe(2.5))
```
Output:
```text
first definition is gone
int 3 text hi object 2.5
```
### javascript
```javascript
function size() {
  if (arguments.length === 1 && typeof arguments[0] === "number") return arguments[0] ** 2;
  if (arguments.length === 2) return arguments[0] * arguments[1];
  if (typeof arguments[0] === "string") return arguments[0].length;
  return 0;
}

console.log(size(4), size(3, 5), size("hello"));
```
Output:
```text
16 15 5
```
### java
```java
public class Printer {
    static String show(int value) {
        return "int " + value;
    }

    static String show(String value) {
        return "text " + value;
    }

    public static void main(String[] args) {
        System.out.println(show(3));
        System.out.println(show("hi"));
    }
}
```

## quiz
1. What happens in Python when two functions share a name?
   - [ ] Both stay and the best match is chosen
   - [x] The later definition replaces the earlier one
   - [ ] A syntax error
   - [ ] They are merged
   > Names are rebound, so only the last definition remains.
2. Which part of a signature can distinguish overloads in Java?
   - [ ] The return type only
   - [x] The number or types of parameters
   - [ ] The name of the file
   - [ ] The comments
   > The return type alone cannot separate overloads.
3. What does functools.singledispatch do?
   - [ ] Runs functions in parallel
   - [x] Chooses an implementation based on the type of the first argument
   - [ ] Deletes functions
   - [ ] Makes functions faster
   > It brings type-based dispatch to Python.
4. When is overloading resolved in Java and C++?
   - [ ] At run time
   - [x] At compile time, from the declared argument types
   - [ ] When the program exits
   - [ ] Never
   > The compiler picks the matching signature.

# Default Parameters
kind: concept
time: Not applicable — supplying a default is a constant-time step when the call is made. The relevant question is when the default is evaluated.
space: Not applicable — the issue is whether a default object is created once or on every call.

## intro
A default parameter gives an argument a value when the caller omits it, which makes simple calls short and keeps rarely used options out of the way. The feature is easy to use and has one famous trap in Python, caused by the moment the default is evaluated.

## theory
Syntax: `def connect(host, port=5432)` in Python and `function connect(host, port = 5432)` in JavaScript. Parameters with defaults come after those without in Python (and by convention in JavaScript).

When is the default evaluated?

- Python evaluates default expressions once, when the function is defined. The same object is reused on every call that omits the argument. For immutable defaults (numbers, strings, None, tuples) this is harmless. For a mutable default such as `[]` or `{}`, changes made by one call stay visible to the next.
- JavaScript evaluates defaults every time the function is called, so `function f(a = [])` gives a fresh array on each call, and defaults can refer to earlier parameters: `function f(x, y = x * 2)`.

The standard Python fix is the None sentinel: declare `tags=None` and create the list inside the function with `if tags is None: tags = []`.

Other details:

- In JavaScript a default applies only to `undefined`, not to `null`, `0` or an empty string, so `f(2, null)` keeps null
- Defaults should be sensible for the common case. If there is no sensible default, make the parameter required.
- A default that changes behavior significantly (a boolean flag) can make call sites unclear; keyword arguments help
- Changing a default in a public function changes its behavior for all existing callers, so treat it as part of the interface

## explain
1. Identify the parameters that most callers would leave at the same value.
2. Give those parameters defaults and place them after the required ones.
3. For Python, use immutable defaults or the None pattern for lists, dictionaries and sets.
4. Document what each default means and why it was chosen.
5. In JavaScript, remember that null does not trigger the default.
6. Test calls with the default, with an explicit value and with the awkward values such as zero or None.

## example
In Python, `add_tag("a")` returns `['a']` and then `add_tag("b")` returns `['a', 'b']`, because both calls share the one default list created at definition time. The corrected version with `tags=None` creates a new list for each call and returns `['a']` then `['b']`. In JavaScript, `f(2)` computes `y` as 4 from the default expression, `f(2, 5)` uses 5, `f(2, undefined)` uses the default again, and `f(2, null)` keeps null.

## real
Standard libraries are full of defaults, such as the encoding of an opened file or the number of retries, and the shared mutable default is a classic bug that linters in Python explicitly warn about.

## pros
- Short calls for common cases
- Optional behavior without overloading
- Defaults document the typical value

## cons
- Mutable defaults in Python are shared between calls
- Behavior hidden in defaults can surprise callers
- Changing a default alters existing programs

## uses
- Providing standard options such as ports and timeouts
- Making parameters optional
- Letting later parameters depend on earlier ones in JavaScript
- Reducing the number of overloads or variants

## mistakes
- Using a list or dictionary as a default in Python
- Expecting null to trigger a JavaScript default
- Putting a parameter without a default after one with a default
- Choosing a default that is unsafe, such as disabling security checks

## interview
**Q:** Why is a mutable default argument a problem in Python?
**A:** The default object is created once when the function is defined and shared by every call that omits the argument, so changes persist between calls.

**Q:** How do you write the safe version?
**A:** Use None as the default and create a new list inside the function when the argument is None.

**Q:** When does a default value apply in JavaScript?
**A:** Only when the argument is undefined, meaning it was omitted or passed as undefined explicitly. Null, 0 and the empty string are kept.

## summary
Defaults make calls shorter, but understand when they are evaluated: once in Python, on every call in JavaScript. Avoid mutable defaults, document the choices and keep defaults safe.

## codenote
The Python sample shows the shared list bug and the None fix. The JavaScript sample shows a default that depends on an earlier parameter and how undefined and null differ.

## code
### python
```python
def add_tag(tag, tags=[]):
    tags.append(tag)
    return tags

print(add_tag("a"))
print(add_tag("b"))

def add_tag_safe(tag, tags=None):
    if tags is None:
        tags = []
    tags.append(tag)
    return tags

print(add_tag_safe("a"))
print(add_tag_safe("b"))
```
Output:
```text
['a']
['a', 'b']
['a']
['b']
```
### javascript
```javascript
function f(x, y = x * 2) {
  return [x, y];
}

console.log(f(2), f(2, 5));
console.log(f(2, undefined), f(2, null));
```
Output:
```text
[ 2, 4 ] [ 2, 5 ]
[ 2, 4 ] [ 2, null ]
```

## quiz
1. When does Python evaluate a default parameter expression?
   - [ ] On every call
   - [x] Once, when the function is defined
   - [ ] When the program exits
   - [ ] Never
   > That is why a mutable default is shared between calls.
2. What is the usual safe replacement for tags=[] in Python?
   - [ ] tags={}
   - [x] tags=None, creating the list inside the function
   - [ ] tags=0
   - [ ] tags=tags
   > The None sentinel creates a fresh list per call.
3. In JavaScript, which value triggers a default parameter?
   - [ ] null
   - [ ] 0
   - [x] undefined
   - [ ] An empty string
   > Defaults apply only to undefined.
4. Why is a default of False for a security check risky?
   - [ ] It is syntactically invalid
   - [x] Callers may unknowingly skip an important protection
   - [ ] It slows the function down
   - [ ] Booleans cannot be defaults
   > Defaults should be safe for the common case.

# Pure vs Impure Functions
kind: concept
time: Not applicable — purity concerns the behavior of a function, not its speed. Pure functions can sometimes be cached because of it.
space: Not applicable — it describes side effects, not memory use.

## intro
A pure function depends only on its arguments and does nothing except return a result. An impure function reads or changes something outside itself, such as a global variable, a file or the clock. Knowing which is which makes code easier to test, reason about and run in parallel.

## theory
A function is pure if both are true:

- Deterministic: the same arguments always produce the same result
- No side effects: it does not modify its arguments, global state, files, the screen, the network or the database, and does not read hidden state such as the current time or a random number generator

Examples: arithmetic, `max`, `sorted` (which returns a new list). Impure examples: `print`, `list.sort()` (changes the list in place), anything reading `random` or the clock, a function that updates a global counter, one that reads a file or a network response.

Benefits of purity:

- Easy testing: call with inputs, compare the output; no setup or cleanup
- Referential transparency: a call can be replaced by its result, which enables caching (memoization), reordering and parallel execution
- Easier reasoning: no hidden interactions between calls
- Fewer bugs from shared state

But real programs must have side effects, since reading input, writing output and storing data is their purpose. The practical design is to push impurity to the edges: keep the core logic as pure functions and have a thin layer that reads input, calls the pure core and performs output. Impure inputs such as the current time can be passed in as parameters, making the function pure and testable.

Mutating an argument is a side effect, which is why `sorted(items)` is pure and `items.sort()` is not. In JavaScript, `sort`, `reverse`, `push` and `splice` mutate the array, while `map`, `filter` and `slice` return new ones.

## explain
1. Ask whether the function's result depends only on its parameters.
2. Ask whether it changes anything outside itself, including its arguments.
3. If not pure, decide whether the impurity is necessary. If it is, isolate it in a small function.
4. Pass in values such as the current time or a random generator instead of reading them inside.
5. Return new data instead of mutating inputs.
6. Test the pure core with plain inputs and outputs.

## example
`pure_add(2, 3)` returns 5 every time. `impure_add(n)` adds to a global total and returns it, so calling it twice with 2 gives 2 and then 4. `sorted_copy(nums)` returns a sorted copy and leaves `[3, 1, 2]` unchanged, while `sort_in_place(nums)` modifies the list so it becomes `[1, 2, 3]`. In JavaScript, copying the array before sorting leaves the original `[ 3, 1, 2 ]` while the copy is sorted, whereas calling `sort` on the original array changes it.

## real
Functional programming languages and frameworks such as React encourage pure functions for predictable behavior, and test suites for business logic are far simpler when the logic is pure and only a thin outer layer talks to databases and users.

## pros
- Very easy to test and reason about
- Results can be cached and calls reordered or run in parallel
- No hidden dependencies between parts of the program

## cons
- Everything useful eventually needs side effects
- Returning new data instead of mutating can use more memory
- Strict purity can complicate simple scripts

## uses
- Business rules and calculations
- Functions that can be cached
- Code that runs in parallel
- Building testable cores with thin impure edges

## mistakes
- Believing a function is pure while it reads a global or the clock
- Mutating an argument without saying so
- Sprinkling input and output through the calculation logic
- Calling the sort method when a sorted copy was intended

## interview
**Q:** What makes a function pure?
**A:** It always returns the same result for the same arguments and has no side effects: it does not change anything outside itself and does not depend on hidden state.

**Q:** What advantage does purity give to automated tests?
**A:** The output depends only on the inputs, so a test needs no setup of external state and no cleanup, and the result is repeatable.

**Q:** How do you structure a program with side effects?
**A:** Keep the core logic in pure functions and confine input, output and state changes to a thin outer layer that calls the core.

## summary
Pure functions depend only on their inputs and change nothing outside, which makes them testable and cacheable. Keep your logic pure where you can and isolate side effects at the edges.

## codenote
The Python sample contrasts pure and impure addition and sorting. The JavaScript sample shows the difference between copying before sorting and sorting in place.

## code
### python
```python
def pure_add(a, b):
    return a + b

total = 0

def impure_add(n):
    global total
    total += n
    return total

print(pure_add(2, 3), pure_add(2, 3))
print(impure_add(2), impure_add(2))

def sorted_copy(items):
    return sorted(items)

def sort_in_place(items):
    items.sort()

nums = [3, 1, 2]
print(sorted_copy(nums), nums)
sort_in_place(nums)
print(nums)
```
Output:
```text
5 5
2 4
[1, 2, 3] [3, 1, 2]
[1, 2, 3]
```
### javascript
```javascript
const original = [3, 1, 2];
const copy = [...original].sort();
console.log(original, copy);

original.sort();
console.log(original);
```
Output:
```text
[ 3, 1, 2 ] [ 1, 2, 3 ]
[ 1, 2, 3 ]
```

## quiz
1. Which of these is a side effect?
   - [ ] Returning a number
   - [x] Modifying a global variable
   - [ ] Adding two arguments
   - [ ] Using a local variable
   > Changing state outside the function makes it impure.
2. Why is sorted(items) pure while items.sort() is not?
   - [ ] sorted is faster
   - [x] sorted returns a new list and leaves the input unchanged, while sort mutates the list
   - [ ] sort returns a list
   - [ ] sorted needs a key
   > Mutating an argument is a side effect.
3. What is the benefit of passing the current time into a function as a parameter?
   - [ ] It is shorter
   - [x] The function becomes deterministic and easy to test
   - [ ] It makes the clock faster
   - [ ] It avoids parameters
   > Hidden inputs make functions impure; explicit ones do not.
4. Where should side effects be placed in a well-structured program?
   - [ ] Everywhere
   - [x] In a thin layer at the edges, around a pure core
   - [ ] Only in comments
   - [ ] Inside every function
   > Isolating them keeps the logic easy to test.
