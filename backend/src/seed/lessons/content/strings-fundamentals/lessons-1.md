# String Representation
kind: concept
time: Not applicable — the representation decides which operations are cheap, such as asking for the length, but the lesson describes models of storage rather than one algorithm.
space: Not applicable — a string of n characters takes about n units in a simple encoding, and more in wider encodings; the details depend on the language.

## intro
A string is a sequence of characters, but how a language stores that sequence determines what is cheap, what is expensive and what can go wrong. Looking at the representation explains why C strings need a terminator, why Java strings are immutable and why the length of a string is a surprisingly slippery idea.

## theory
Common models:

- Null-terminated array (C): the characters are stored contiguously, followed by a zero byte that marks the end. The length is found by scanning to the zero, which is O(n), and a missing terminator makes functions read past the end of the buffer.
- Length-prefixed or length-tracking (Pascal, Go, Rust, C++ `std::string`): the length is stored next to the data, so asking for it is O(1) and the string may contain zero bytes.
- Immutable object with an internal array (Java, Python, JavaScript, C#): the language owns the storage, tracks the length, and prevents changes to the characters in place.
- Rope or tree of pieces (editors, some engines): concatenation is cheap because pieces are linked rather than copied.

What the elements are depends on the language and encoding:

- A Python `str` is a sequence of Unicode code points, so `len("héllo")` is 5 and indexing returns a one-character string; there is no separate character type
- A JavaScript string is a sequence of 16-bit UTF-16 units, so characters outside the basic plane count as two
- A Java `char` is also a 16-bit unit
- A C `char` is one byte, so multibyte characters span several elements
- A Rust `String` holds UTF-8 bytes and does not allow indexing by position because positions in bytes do not correspond to characters

Literals use quotes and escape sequences: `\n` for a newline, `\t` for a tab, `\\` for a backslash, `é` for a Unicode character. Python's `repr` shows the escaped form of a string so invisible characters can be seen. Raw strings keep backslashes as written.

Strings convert to and from bytes through an encoding. A string is text; bytes are data; mixing them up is the root of many encoding bugs.

## explain
1. Ask what the elements are in your language: bytes, UTF-16 units or code points.
2. Ask how the length is stored: computed by scanning or kept as a field.
3. Remember that indexing and slicing work on those elements, not necessarily on what a reader sees as characters.
4. Use repr or a debugger display to reveal escapes and invisible characters.
5. Keep text (strings) and binary data (bytes) separate, converting at the boundaries with an explicit encoding.
6. In C, always make room for the terminator and bound every copy.

## example
In Python, the string "Stack" has length 5, its first and last characters are "S" and "k", and `list` splits it into single-character strings. The string `"tab\there"` has length 8 because the escape is one tab character, and `repr` shows the escape instead of the tab; encoding it gives the bytes `b'tab\there'`. The first byte of the ASCII encoding of "Stack" is 83. The JavaScript lines show the length and the code unit of a character, and the C program, not run here, shows an array with its terminating zero.

## real
Many security flaws come from string handling in C, where a missing terminator or an unchecked copy corrupts memory, while a large share of everyday bugs in web applications come from confusing text with bytes.

## pros
- Length-tracking strings make length and slicing cheap
- Immutable strings are safe to share
- Unicode-aware strings let programs handle any language

## cons
- Null-terminated strings make length slow and invite overflow
- Counting characters is subtle with variable-width encodings
- Hidden characters make strings that look identical compare different

## uses
- Storing names, messages and identifiers
- Building and parsing text formats
- Converting between text and bytes for files and networks
- Debugging with repr to see escapes

## mistakes
- Treating the byte count of a string as its character count
- Forgetting the terminator when sizing a C buffer
- Treating bytes and text as interchangeable
- Trusting the displayed text to reveal tabs and trailing spaces

## interview
**Q:** How does a C string differ from a Python string?
**A:** A C string is an array of bytes ended by a zero byte, so its length must be found by scanning and it is easy to overflow. A Python string is an immutable object that knows its length and holds Unicode code points.

**Q:** Why is strlen O(n) in C?
**A:** Because the string carries no length field; the function must walk the characters until it finds the terminating zero byte.

**Q:** What is the difference between text and bytes?
**A:** Text is a sequence of characters, while bytes are raw data. An encoding such as UTF-8 defines how to turn one into the other, and both directions must name the encoding.

## summary
A string is stored as a null-terminated array, a length-tracked array or an immutable object, with elements of bytes, UTF-16 units or code points. Know your language's model, separate text from bytes and use escapes and repr to see what is really there.

## codenote
The Python sample prints length, indexing, escapes and encoded bytes. The JavaScript sample shows the string as UTF-16 units. The C program shows the terminator.

## code
### python
```python
word = "Stack"
print(len(word), word[0], word[-1], list(word))

tabbed = "tab\there"
print(repr(tabbed), len(tabbed))
print(tabbed.encode())
print(bytes(word, "ascii")[0])
```
Output:
```text
5 S k ['S', 't', 'a', 'c', 'k']
'tab\there' 8
b'tab\there'
83
```
### javascript
```javascript
const word = "Stack";
console.log(word.length, word.charAt(1), word.charCodeAt(1));
console.log(word.split(""));
```
Output:
```text
5 t 116
[ 'S', 't', 'a', 'c', 'k' ]
```
### c
```c
#include <stdio.h>
#include <string.h>

int main(void) {
    char word[6] = {'S', 't', 'a', 'c', 'k', '\0'};
    printf("%s has %zu characters and needs %zu bytes\n",
           word, strlen(word), sizeof(word));
    return 0;
}
```

## quiz
1. What marks the end of a string in C?
   - [ ] A length field
   - [x] A zero byte
   - [ ] A newline
   - [ ] A semicolon
   > Functions scan for the terminator to find the end.
2. What is the element of a Python str?
   - [ ] A byte
   - [ ] A 16-bit unit
   - [x] A Unicode code point, held as a one-character string
   - [ ] A grapheme cluster
   > Indexing yields a string of length one.
3. What does repr show that print does not?
   - [ ] The memory address
   - [x] Escape sequences for invisible characters such as tabs and newlines
   - [ ] The encoding
   - [ ] The type
   > It reveals what is really in the string.
4. Why is the length of a null-terminated string slow to find?
   - [ ] Strings are stored on disk
   - [x] The program must scan until it reaches the zero byte
   - [ ] The length changes constantly
   - [ ] Because of Unicode
   > There is no stored length.

# Immutable vs Mutable Strings
kind: concept
time: Not applicable — immutability changes what each operation costs, since a change means building a new string, but this lesson explains the concept before the complexity lessons measure it.
space: Not applicable — every modification of an immutable string creates a new string, and old ones are reclaimed by the garbage collector.

## intro
In Python, Java, JavaScript and C#, a string can never be changed after it is created; every operation that seems to modify it actually builds a new string. In C and in byte buffers the characters can be rewritten in place. The difference drives design choices, performance and safety.

## theory
Immutable strings:

- Cannot be altered: assigning to a character position raises an error (Python's TypeError) or is silently ignored (JavaScript in sloppy mode)
- Methods such as `replace`, `upper`, `strip` and `+` return new strings and leave the original unchanged, so you must use the returned value
- Safe to share: many variables can refer to one string without risk, so the runtime may reuse (intern) identical literals, and strings work as dictionary keys because their hash cannot change
- Thread-safe without locks
- Cost: modifying a long string repeatedly creates many temporary copies

Mutable alternatives:

- C character arrays and C++ `std::string`, which can be changed in place
- Python `bytearray` for byte data, and lists of characters converted back with `"".join(...)`
- Java `StringBuilder` and `StringBuffer`, JavaScript arrays of pieces joined at the end, C# `StringBuilder`
- Ropes and gap buffers in text editors

Mutable strings are efficient for heavy editing, but sharing them requires care, and they cannot safely be used as hash keys if changed afterwards.

A typical mistake is calling `text.replace("a", "b")` and ignoring the result, expecting `text` to change. Another is building a long string with `+=` in a loop, which can copy the growing string on every pass.

Design guidance: keep strings immutable by default; for many edits, collect pieces in a list or builder and create the final string once; use bytes or bytearray when processing binary data.

## explain
1. Remember that string methods return new strings; assign the result.
2. To change a single character, build a new string from slices or convert to a list, change it and join.
3. For many small changes, use a builder or a list of pieces.
4. Use immutable strings as dictionary keys and set members.
5. Use a mutable byte buffer when the algorithm needs to overwrite positions in place.
6. When memory or speed matters, avoid creating many intermediate strings.

## example
In Python, `s[0] = "X"` on the string "abc" raises a TypeError, which the program catches and names. `s.replace("a", "X")` returns "Xbc" while `s` is still "abc". A `bytearray` of the same bytes can be changed in place, and decoding it afterwards gives "Xbc". The JavaScript sample assigns to an index of a string and shows that the string is unchanged. The result of `toUpperCase` is a new value that must be captured.

## real
Strings that are keys in caches, routing tables and configuration are immutable so their hashes stay valid; text editors, on the other hand, keep documents in ropes or gap buffers because rebuilding a whole file on each keystroke would be far too slow.

## pros
- Immutable strings are safe to share and to use as keys
- Predictable behavior: nobody can change a string behind your back
- Interning saves memory for repeated literals

## cons
- Every change creates a new string
- Repeated concatenation in a loop can be slow
- Beginners expect methods to modify in place

## uses
- Using strings as dictionary keys and set members
- Passing text between functions without defensive copies
- Choosing builders and byte arrays for heavy editing
- Reasoning about thread safety of shared text

## mistakes
- Ignoring the return value of replace, strip or upper
- Trying to assign to an index of a string
- Building long strings with repeated addition
- Using a mutable object that later changes as a dictionary key

## interview
**Q:** Why are strings immutable in Java and Python?
**A:** Immutability makes strings safe to share between threads and variables, allows hash codes to be cached so they work as dictionary keys, and allows the runtime to reuse identical literals.

**Q:** What happens when you call replace on a Python string?
**A:** It returns a new string with the replacements and leaves the original unchanged, so the result must be assigned to a variable.

**Q:** What would you use for many in-place edits to text?
**A:** A mutable structure such as a list of characters, a bytearray, or a StringBuilder, and convert to a string once at the end.

## summary
Immutable strings never change; operations return new ones. They are safe and shareable but costly to edit repeatedly, so use builders, lists or byte arrays for heavy modification and always capture the result of string methods.

## codenote
The Python sample shows the error from assigning to a character, a method returning a new string and a mutable bytearray. The JavaScript sample shows that assignment to an index is ignored.

## code
### python
```python
s = "abc"
try:
    s[0] = "X"
except TypeError as error:
    print(type(error).__name__)

t = s.replace("a", "X")
print(s, t)

buffer = bytearray(b"abc")
buffer[0] = ord("X")
print(buffer.decode())
```
Output:
```text
TypeError
abc Xbc
Xbc
```
### javascript
```javascript
let s = "abc";
s[0] = "X";
console.log(s);

s.toUpperCase();
console.log(s);

s = s.toUpperCase();
console.log(s);
```
Output:
```text
abc
abc
ABC
```

## quiz
1. What does "abc".replace("a", "X") do to the original string?
   - [ ] Changes it to Xbc
   - [x] Leaves it unchanged and returns a new string
   - [ ] Deletes it
   - [ ] Raises an error
   > Strings are immutable, so methods return new strings.
2. Why can immutable strings be used as dictionary keys?
   - [ ] They are short
   - [x] Their hash cannot change after creation
   - [ ] They are stored on disk
   - [ ] They are always numbers
   > A key must keep the same hash for lookups to work.
3. Which Python type allows changing bytes in place?
   - [ ] str
   - [ ] tuple
   - [x] bytearray
   - [ ] frozenset
   > A bytearray is a mutable sequence of bytes.
4. What is a better approach than += in a loop for building a long string?
   - [ ] More variables
   - [x] Collect pieces in a list and join once
   - [ ] Use eval
   - [ ] Sort the pieces
   > Joining creates the final string a single time.

# Character Encoding ASCII Unicode
kind: concept
time: Not applicable — encoding and decoding take time proportional to the text length, but the lesson concerns what the bytes mean, not an algorithm.
space: Not applicable — the encoded size depends on the characters and the encoding, which is part of the lesson.

## intro
Computers store only numbers, so text needs an agreed mapping from characters to numbers and from numbers to bytes. ASCII was the early answer for English, Unicode is the universal one, and UTF-8 is the way almost everything stores it today. Misunderstanding the layers produces the garbled text known as mojibake.

## theory
Three separate layers:

- Character set: a table assigning each character a number. ASCII uses 7 bits (0 to 127): digits, English letters, punctuation and control codes, so `A` is 65 and `a` is 97. Unicode defines more than 150,000 characters across all scripts, each with a code point written `U+0041` for A.
- Encoding: how a code point becomes bytes. ASCII is one byte per character. UTF-8 uses 1 to 4 bytes: ASCII characters keep their one-byte form, so ASCII text is valid UTF-8, while `é` takes 2 bytes (`c3 a9`), `€` takes 3 (`e2 82 ac`) and emoji take 4. UTF-16 uses 2 or 4 bytes, and UTF-32 always 4.
- Rendering: fonts turn the characters into shapes

Historical encodings such as Latin-1 (ISO 8859-1) use one byte for 256 characters and are still found in old files and protocols. The byte values 128 to 255 mean different things in different legacy encodings.

Mojibake appears when bytes are decoded with the wrong encoding. The UTF-8 bytes of `é` read as Latin-1 become `Ã©`. The fix is to know the encoding of the data and to state it explicitly when reading and writing.

Other ideas:

- A byte order mark (BOM) at the start of a file may signal UTF-8 or the byte order of UTF-16
- Invalid byte sequences raise errors when decoding strictly, or can be replaced with a replacement character with an error handler
- Surrogate pairs represent code points above U+FFFF in UTF-16
- Python 3 separates `str` (text) and `bytes`; `encode` goes from text to bytes and `decode` back
- Web pages declare their encoding in HTTP headers and meta tags, and UTF-8 is the recommended default

Best practice: use UTF-8 everywhere, decode on input, work with text internally and encode on output.

## explain
1. Identify the layer of the problem: wrong character set, wrong encoding or rendering.
2. Know the encoding of every input and name it explicitly in code.
3. Decode bytes to text on the way in and encode text to bytes on the way out.
4. If text looks garbled, guess the mismatch: UTF-8 bytes shown as Latin-1 is the classic case.
5. Handle invalid bytes deliberately with an error policy.
6. Test with non-ASCII data such as accented letters, symbols and emoji.

## example
The Python lines encode "A" as a single byte, "é" as the two bytes `c3 a9` and "€" as three bytes `e2 82 ac` in UTF-8 and as `ac 20` in UTF-16, shown in hexadecimal. Decoding the UTF-8 bytes of "é" as Latin-1 gives the two-character mojibake "Ã©". The JavaScript sample uses a `TextEncoder` to show that the UTF-8 length of "€" is 3 bytes while the string length is 1, and decodes bytes back with a `TextDecoder`.

## real
Databases, email and web pages all carry text through several encodings, and garbled names in a customer database are almost always an encoding mismatch somewhere in the chain.

## pros
- UTF-8 is compatible with ASCII and compact for English
- Unicode covers all scripts in one scheme
- Explicit encodings make behavior predictable

## cons
- Variable width means byte length differs from character count
- Legacy encodings still exist in old data
- Wrong guesses produce confusing garbled text

## uses
- Reading and writing text files and network data
- Fixing garbled characters in imported data
- Calculating byte sizes for storage limits
- Choosing database and file encodings

## mistakes
- Letting the operating system choose the encoding when files are opened
- Decoding bytes with a different encoding than they were written with
- Assuming string length equals byte length
- Ignoring a byte order mark at the start of a file

## interview
**Q:** What is the difference between Unicode and UTF-8?
**A:** Unicode is the standard that assigns a code point to each character; UTF-8 is one encoding that turns code points into bytes, using 1 to 4 bytes per character.

**Q:** Why is ASCII text also valid UTF-8?
**A:** UTF-8 encodes code points 0 to 127 as single bytes with the same values as ASCII, so the bytes of an ASCII file are identical in UTF-8.

**Q:** What causes mojibake and how do you fix it?
**A:** It is caused by decoding bytes with a different encoding than the one used to produce them. The fix is to determine the real encoding and use it explicitly when decoding.

## summary
Characters get numbers from a character set, and numbers become bytes through an encoding. Use UTF-8, name encodings explicitly, keep text and bytes apart, and recognise mojibake as a wrong-encoding symptom.

## codenote
The Python sample prints the bytes of characters in two encodings and demonstrates mojibake. The JavaScript sample compares string length with encoded byte length.

## code
### python
```python
print("A".encode().hex(), "é".encode().hex(), "€".encode().hex())
print("€".encode("utf-16-le").hex())

garbled = "é".encode("utf-8").decode("latin-1")
print(garbled, len(garbled))
```
Output:
```text
41 c3a9 e282ac
ac20
Ã© 2
```
### javascript
```javascript
const euro = "€";
const bytes = new TextEncoder().encode(euro);
console.log(euro.length, bytes.length, Array.from(bytes));
console.log(new TextDecoder("utf-8").decode(bytes) === euro);
```
Output:
```text
1 3 [ 226, 130, 172 ]
true
```

## quiz
1. How many bytes does the euro sign take in UTF-8?
   - [ ] 1
   - [ ] 2
   - [x] 3
   - [ ] 8
   > Characters above U+07FF up to U+FFFF use three bytes.
2. Why is ASCII text valid UTF-8?
   - [ ] UTF-8 was invented before ASCII
   - [x] UTF-8 encodes code points 0 to 127 with the same single bytes as ASCII
   - [ ] Both use two bytes per character
   - [ ] UTF-8 ignores ASCII
   > Backward compatibility was a design goal.
3. What causes mojibake?
   - [ ] A broken keyboard
   - [x] Decoding bytes with a different encoding than they were written with
   - [ ] Too many characters
   - [ ] Slow networks
   > The bytes are interpreted with the wrong table.
4. What is the best default practice for text storage?
   - [ ] Use the system default encoding
   - [x] Use UTF-8 and name it explicitly
   - [ ] Mix encodings freely
   - [ ] Store text as numbers only
   > An explicit, universal encoding avoids surprises.

# String Comparison
kind: algorithm
time: O(min(m, n)) to compare two strings of lengths m and n, since the comparison stops at the first difference; equality of strings with different lengths can be answered in O(1) in languages that store the length.
space: O(1) for the comparison itself; normalising or case-folding creates new strings and costs O(m + n).

## intro
Comparing strings sounds trivial until the questions arise: is "apple" less than "Banana"? Are "straße" and "STRASSE" the same word? Do two strings that look identical but use different Unicode forms compare equal? The answers depend on whether you compare by code, by case rules or by a locale's alphabetical order.

## theory
Basic comparison is lexicographic: compare the first characters; if they differ, the string with the smaller code comes first; if they are equal, move to the next. If one string is a prefix of the other, the shorter one is smaller. The comparison costs time proportional to the length of the common prefix.

Consequences of comparing by code:

- Uppercase letters have smaller codes than lowercase ones, so `"Banana" < "apple"` is true and a default sort places "Cherry" before "apple"
- Digits compare as characters: `"10" < "9"` is true
- Accented letters have codes beyond the English alphabet and sort after "z"

Variants:

- Case-insensitive comparison: convert both sides with `casefold()` in Python (stronger than `lower()`, so "straße" and "STRASSE" match) or `toLowerCase()` in JavaScript, or use a comparison function that ignores case
- Locale-aware collation: sort according to a language's alphabet. JavaScript offers `localeCompare` and `Intl.Collator`; Python needs `locale.strxfrm` or a library. In many locales a, A, á and b sort together as the reader expects.
- Unicode normalization: the same visible character can be a single code point or a base letter plus a combining mark. `unicodedata.normalize("NFC", text)` puts both in the same form before comparing.
- Natural sort: orders "file2" before "file10" by treating digit runs as numbers

Equality versus identity: use `==` to compare contents; `is` in Python or reference comparison in Java asks whether the two names refer to the same object and can be false for equal strings.

For secrets such as passwords or tokens, use a constant-time comparison (`hmac.compare_digest`) so that the time taken does not reveal how many leading characters matched.

## explain
1. Decide what equal means for the task: exact, ignoring case, ignoring accents, same canonical Unicode form.
2. Normalise both strings in the same way before comparing.
3. For ordering shown to users, use locale-aware comparison, not raw code order.
4. Use contents comparison, not identity.
5. Compare secrets with a constant-time function.
6. Test with mixed case, accents, digits and different lengths.

## example
In Python, `"apple" < "Banana"` is False because lowercase "a" has a larger code than uppercase "B". Sorting `["banana", "Cherry", "apple"]` by code gives `['Cherry', 'apple', 'banana']`, but sorting with `str.casefold` as the key gives `['apple', 'banana', 'Cherry']`. `casefold` makes "straße" equal "STRASSE" while `lower` does not. The accented letter written as one code point differs from the form with a combining accent until both are normalised. The JavaScript lines show `localeCompare` ordering "a" before "B", and a default sort versus a locale-aware sort.

## real
User interfaces sort names and file lists with locale rules, search boxes fold case and accents, and login systems compare tokens in constant time to avoid leaking information through timing.

## pros
- Lexicographic comparison is simple and fast
- Folding and normalization allow user-friendly matching
- Locale-aware sorting matches reader expectations

## cons
- Code order does not match alphabetical order for users
- Unicode equivalence needs explicit normalization
- Locale comparison is slower and depends on the platform data

## uses
- Sorting names and titles
- Case-insensitive search and matching
- Deduplicating text that differs only in form
- Comparing secrets safely

## mistakes
- Sorting user-facing text by raw character codes
- Using lower where casefold is needed for international text
- Comparing strings with identity instead of equality
- Forgetting to normalise before comparing Unicode text

## interview
**Q:** How does lexicographic string comparison work?
**A:** It compares characters pairwise from the start and decides at the first difference by character code; if one string is a prefix of the other, the shorter one is smaller.

**Q:** Why is a plain sort of mixed-case words often wrong for users?
**A:** Uppercase letters have smaller codes than lowercase letters, so all capitalised words come before lowercase ones. Case-insensitive or locale-aware comparison gives the order users expect.

**Q:** Why compare secrets with a constant-time function?
**A:** An ordinary comparison stops at the first mismatch, so its running time can reveal how many leading characters were correct, which attackers can exploit.

## summary
Strings compare character by character by code. For humans, fold case, normalise Unicode and use locale-aware collation; use equality rather than identity, and constant-time comparison for secrets.

## codenote
The Python sample shows code order, case folding, special-case folding and Unicode normalization. The JavaScript sample shows locale-aware comparison.

## code
### python
```python
import unicodedata

print("apple" < "Banana")
words = ["banana", "Cherry", "apple"]
print(sorted(words), sorted(words, key=str.casefold))
print("straße".casefold() == "STRASSE".casefold(), "straße".lower() == "strasse")

one = "é"
two = "é"
print(one == two, unicodedata.normalize("NFC", two) == one)
```
Output:
```text
False
['Cherry', 'apple', 'banana'] ['apple', 'banana', 'Cherry']
True False
False True
```
### javascript
```javascript
console.log("a" < "B", "a".localeCompare("B"));
console.log(["b", "a", "C"].sort());
console.log(["b", "a", "C"].sort((x, y) => x.localeCompare(y)));
```
Output:
```text
false -1
[ 'C', 'a', 'b' ]
[ 'a', 'b', 'C' ]
```

## quiz
1. Why is "apple" < "Banana" false in Python?
   - [ ] Because apple is longer
   - [x] The lowercase letter a has a larger code than the uppercase B
   - [ ] Because strings cannot be compared
   - [ ] Because of locale settings
   > Comparison by code puts uppercase before lowercase.
2. What does casefold do better than lower?
   - [ ] It is faster
   - [x] It handles special cases such as the German sharp s for caseless matching
   - [ ] It removes spaces
   - [ ] It sorts the string
   > It is designed for caseless comparisons across languages.
3. Why normalise Unicode strings before comparing?
   - [ ] To make them shorter
   - [x] The same visible character can have different code point sequences
   - [ ] To convert to bytes
   - [ ] To change the case
   > Canonical forms make equivalent text compare equal.
4. What is the problem with comparing a secret token with an ordinary equality check?
   - [ ] It is too slow
   - [x] The time taken can reveal how many leading characters matched
   - [ ] It changes the token
   - [ ] It requires Unicode
   > Constant-time comparison avoids the timing leak.

# Substring Operations
kind: algorithm
time: O(k) to extract a slice of k characters because the characters are copied; searching for a substring with find is O(n · m) in the worst case for a text of length n and a pattern of length m, though library implementations use faster methods in practice.
space: O(k) for each extracted substring, as slices of immutable strings are new strings in most languages.

## intro
Most text processing consists of cutting strings into pieces and asking where a piece occurs. Slicing, searching and splitting are the everyday substring operations, and knowing their exact conventions, especially half-open ranges and what happens when nothing is found, prevents a steady stream of small bugs.

## theory
Extracting:

- Python slicing `text[start:stop]` takes characters from start up to but not including stop; both ends may be omitted, negative values count from the end, and a step is allowed (`text[::-1]` reverses). Out-of-range bounds are clipped instead of raising errors.
- JavaScript offers `slice(start, end)` (negative values count from the end), `substring(start, end)` (negative values become 0 and swapped arguments are reordered) and the legacy `substr(start, length)`. Prefer `slice`.
- Java and C# use `substring(begin, end)` with the same half-open rule

Searching:

- `find(sub)` in Python returns the index of the first occurrence or -1; `index` raises ValueError instead. `rfind` searches from the right.
- JavaScript `indexOf` returns -1 when missing; `includes` returns a boolean
- `startswith` and `endswith` check the ends; `count` counts non-overlapping occurrences; `in` tests membership
- `partition(sep)` splits at the first separator into three parts (before, separator, after), always returning three items, even if the separator is missing

Windows of fixed length (all substrings of length k) are produced by `text[i:i + k]` for i from 0 to n - k, giving n - k + 1 windows.

Costs: slicing copies, so slicing inside a loop makes quadratic behavior possible; use indexes where possible. Searching a substring naively compares at each starting position, which costs O(n · m) in the worst case.

Boundary conditions: empty substring (found at index 0), substring longer than the text (never found), overlapping matches (count ignores them), and case sensitivity.

## explain
1. Decide whether you need the position, the text or just a yes or no.
2. Use find or indexOf for positions, `in` or includes for membership.
3. Handle the not found result (-1) before using the index.
4. Use half-open ranges consistently.
5. For repeated extraction in a loop, pass indexes instead of slicing.
6. Test empty strings, a missing substring and matches at the very start and end.

## example
For "the quick brown fox", the slice `[4:9]` is "quick", `[-3:]` is "fox" and the first three characters of the reversed string are "xof". `find("quick")` is 4 while `find("cat")` is -1, and the letter "o" is counted twice. `index("cat")` raises ValueError instead. `partition(" ")` gives `('the', ' ', 'quick brown fox')`. Windows of length 3 from "abcde" are `['abc', 'bcd', 'cde']`. The JavaScript sample compares `slice` and `substring` with negative and swapped arguments.

## real
Parsers, log analysers and URL handlers cut strings with these operations all day, and one-off errors at the slice boundaries or an unchecked -1 from a search are among the most common bugs.

## pros
- Compact slicing syntax in Python
- Library searches are optimised
- Partition gives a safe three-way split

## cons
- Slices copy data
- Differences between slice and substring in JavaScript surprise people
- The not found value -1 is easy to misuse as an index

## uses
- Extracting fields from fixed-format text
- Locating markers and delimiters
- Generating all substrings of a given length
- Checking prefixes and suffixes

## mistakes
- Using a -1 result from find as a valid index
- Forgetting that the stop index of a slice is excluded
- Using substring with negative numbers expecting them to count from the end
- Slicing in a loop where indexes would avoid copies

## interview
**Q:** What does text[a:b] return in Python?
**A:** The characters from index a up to but not including index b, as a new string; out-of-range bounds are clipped rather than causing errors.

**Q:** What is the difference between find and index in Python?
**A:** Both locate a substring, but find returns -1 when it is missing, while index raises ValueError.

**Q:** How many substrings of length k does a string of length n contain?
**A:** n minus k plus 1, one starting at each index from 0 up to n minus k.

## summary
Extract with half-open slices, search with find, indexOf or in, handle the not found result, and avoid repeated slicing in hot loops. Test empty, missing and boundary cases.

## codenote
The Python sample covers slices, searches, partition and windows. The JavaScript sample shows how slice and substring treat negative and swapped arguments.

## code
### python
```python
text = "the quick brown fox"
print(text[4:9], text[-3:], text[::-1][:3])
print(text.find("quick"), text.find("cat"), text.count("o"))

try:
    text.index("cat")
except ValueError:
    print("index raises ValueError")

print(text.partition(" "))
word = "abcde"
print([word[i:i + 3] for i in range(len(word) - 2)])
```
Output:
```text
quick fox xof
4 -1 2
index raises ValueError
('the', ' ', 'quick brown fox')
['abc', 'bcd', 'cde']
```
### javascript
```javascript
const word = "hello";
console.log(word.slice(1, 3), word.slice(-3));
console.log(word.substring(3, 1), word.substring(-3));
```
Output:
```text
el llo
el hello
```

## quiz
1. Is the stop index of a Python slice included?
   - [ ] Yes
   - [x] No, the slice ends just before it
   - [ ] Only for negative values
   - [ ] Only with a step
   > Slices are half-open.
2. What does "abc".find("z") return?
   - [ ] 0
   - [x] -1
   - [ ] None
   - [ ] It raises an error
   > Find reports a missing substring with -1.
3. How many windows of length 3 does a string of length 8 have?
   - [ ] 3
   - [ ] 5
   - [x] 6
   - [ ] 8
   > The count is 8 minus 3 plus 1.
4. What does partition return when the separator is missing?
   - [ ] An error
   - [x] The whole string followed by two empty strings
   - [ ] None
   - [ ] An empty list
   > It always returns three items.

# String Builder Patterns
kind: algorithm
time: O(n) in the total length of the result when pieces are collected and joined once; repeated concatenation to an immutable string copies the growing result each time, making the total work O(n²) in the worst case.
space: O(n) for the pieces and the final string; a builder may hold up to about twice the final size because of over-allocation.

## intro
Building a long string from many small pieces is one of the most common tasks in programming, and doing it naively is a classic source of slowness. A string builder, in whatever form the language provides, collects the pieces and creates the final string once.

## theory
Why naive concatenation is slow with immutable strings: `result = result + piece` creates a new string containing all the previous characters plus the new ones. After k steps the work done is 1 + 2 + ... + k copies, roughly k²/2, so appending 100 one-character pieces copies 5,050 characters in total, though the final string has just 100. Some runtimes (CPython in simple cases, JavaScript engines with ropes) optimise repeated concatenation, but you should not rely on that.

Builder patterns:

- Python: append pieces to a list and call `"".join(parts)` once; `io.StringIO` is another buffer with `write`
- Java: `StringBuilder` (not thread-safe, fast) and `StringBuffer` (synchronised); the compiler turns simple concatenations into builder calls, but not those inside loops
- JavaScript: push to an array and `join`, or use template literals for fixed-shape text; modern engines also make `+=` reasonably fast
- C#: `StringBuilder`
- C++: `std::string` is mutable and `append` has amortised constant cost; `reserve` avoids reallocation
- C: allocate a buffer, track the used length and use `snprintf` or `strncat` with explicit bounds

Related practices:

- `join` is also the correct way to insert separators between items, avoiding trailing separators
- Format strings and f-strings are clearer than manual concatenation for mixed values
- Pre-size the builder if the final length is known
- For output, writing to a stream directly avoids building the whole string at all

Measure rather than guess: for a few pieces, the difference is invisible, and clarity matters more.

## explain
1. Decide whether you are producing a string from many pieces in a loop.
2. Create an empty list or builder before the loop.
3. Append each piece in the loop, converting values to text as needed.
4. After the loop, join the pieces once, with the separator you need.
5. If the output is destined for a file or socket, consider writing as you go.
6. Keep the code readable: use f-strings for short, fixed templates.

## example
The Python program appends 100 one-character pieces to a string by repeated addition and counts the characters copied: 5,050, while the joined result has just 100 characters. A list joined once copies each character a single time. The JavaScript sample builds comma-separated text from an array with `join`, which places separators only between items. The Java class, not run here, shows a `StringBuilder` filled in a loop.

## real
Report generators, template engines and serialisers build very large strings, and replacing repeated concatenation with a builder is a standard performance fix; the same advice applies to building SQL, HTML and log lines.

## pros
- Linear total time instead of quadratic
- Cleaner handling of separators with join
- Predictable memory use

## cons
- More verbose than simple addition
- Builders need an explicit final conversion
- For small strings, the benefit is negligible

## uses
- Assembling output from loops
- Generating HTML, SQL or CSV text
- Joining items with separators
- Producing large log or report files

## mistakes
- Using += on strings in a long loop
- Adding a trailing separator by hand and then removing it
- Converting the builder to a string repeatedly inside the loop
- Optimising tiny concatenations that do not matter

## interview
**Q:** Why can repeated string concatenation in a loop be slow?
**A:** Immutable strings are copied on every concatenation, so the total work grows with the square of the number of pieces, while collecting pieces and joining once is linear.

**Q:** What is the idiomatic way to build a string from many pieces in Python?
**A:** Append the pieces to a list and call "".join on it once at the end.

**Q:** When is a StringBuilder not needed in Java?
**A:** For a single expression with a few concatenations, because the compiler optimises it; builders matter inside loops.

## summary
Collect pieces and create the string once: join in Python and JavaScript, StringBuilder in Java and C#. Avoid repeated concatenation in loops and measure before optimising small cases.

## codenote
The Python sample counts the characters copied by repeated concatenation. The JavaScript sample joins items with a separator. The Java sample uses StringBuilder.

## code
### python
```python
pieces = ["x"] * 100

copied = 0
result = ""
for piece in pieces:
    copied += len(result) + len(piece)
    result = result + piece

print(copied, len("".join(pieces)))
```
Output:
```text
5050 100
```
### javascript
```javascript
const items = ["red", "green", "blue"];
console.log(items.join(", "));

const parts = [];
for (let i = 1; i <= 3; i++) parts.push(`row ${i}`);
console.log(parts.join(" | "));
```
Output:
```text
red, green, blue
row 1 | row 2 | row 3
```
### java
```java
public class Builder {
    public static void main(String[] args) {
        StringBuilder text = new StringBuilder();
        for (int i = 1; i <= 3; i++) {
            if (i > 1) {
                text.append(", ");
            }
            text.append("item").append(i);
        }
        System.out.println(text.toString());
    }
}
```

## quiz
1. Why is repeated concatenation of immutable strings in a loop slow?
   - [ ] Strings are stored on disk
   - [x] Each step copies the whole growing string
   - [ ] Loops are slow
   - [ ] Concatenation is not allowed
   > The total copying grows quadratically.
2. What is the idiomatic Python approach to building a string from a loop?
   - [ ] Use += on the string
   - [x] Append to a list and join once
   - [ ] Use recursion
   - [ ] Use eval
   > The join creates the result with a single pass.
3. What is the advantage of join for separators?
   - [ ] It sorts the items
   - [x] Separators appear only between items, with no trailing one
   - [ ] It changes the case
   - [ ] It removes duplicates
   > No special handling of the last item is needed.
4. How many characters are copied in total when adding 100 one-character pieces by repeated concatenation?
   - [ ] 100
   - [ ] 200
   - [x] 5050
   - [ ] 10000
   > The sum 1 + 2 + ... + 100 equals 5050.

# Parsing and Tokenization
kind: algorithm
time: O(n) for a single pass that splits or tokenizes a text of length n, since each character is examined a constant number of times; a poorly written regular expression can take much longer on adversarial input.
space: O(t) for the list of t tokens produced, which is at most O(n).

## intro
Parsing is turning text into structured data, and tokenization is its first step: breaking the text into meaningful pieces such as numbers, words, operators and punctuation. Whether you are reading a CSV line, a command or an arithmetic expression, the same two-stage idea applies.

## theory
Stages:

- Tokenization (lexing): scan the characters and group them into tokens with a type and a value. For `3 + 4.5*(2 - 1)` the tokens are `3`, `+`, `4.5`, `*`, `(`, `2`, `-`, `1` and `)`. Whitespace is skipped.
- Parsing: arrange tokens into a structure, such as a tree, following a grammar. Evaluation or processing then walks the structure.

Tools for tokenization:

- `split`: break at a separator. `"a,b,,c".split(",")` yields an empty string for the empty field, and `split()` with no argument splits on any run of whitespace and drops empty pieces. A maximum number of splits (`"k=v=w".split("=", 1)`) keeps the rest intact.
- Regular expressions: `re.findall` or `String.match` with an alternation of token patterns, listing longer patterns before shorter ones
- Hand-written scanners using a state machine, which handle quoting and escapes
- Libraries for standard formats (csv, json, URL parsing) which should be preferred to custom parsers because they handle quotes, escapes and edge cases

Pitfalls:

- Splitting a CSV line on commas breaks when a field contains a quoted comma
- Greedy patterns that swallow too much
- Not handling empty fields, leading or trailing separators, or Unicode whitespace
- Silent failure on unexpected characters: scanners should report a clear error with the position
- Parsing untrusted input without limits on size or nesting

Design tips: separate the tokenizer from the parser, keep track of positions for error messages and test with malformed input.

## explain
1. Define the token types: numbers, operators, identifiers, punctuation, whitespace.
2. Write patterns for each, ordered so that longer matches come first.
3. Scan the text and produce the list of tokens, skipping whitespace.
4. Report unknown characters with their position.
5. Hand the token list to the next stage, which interprets it.
6. Test with empty input, extra whitespace and invalid characters.

## example
The Python tokenizer uses one regular expression with two alternatives, a number with an optional fraction and a single operator or bracket. For `3 + 4.5*(2 - 1)` it returns nine tokens, with `4.5` kept whole because the number pattern comes first. The split examples show that `"a,b,,c".split(",")` has an empty field, that `"a  b".split()` ignores the extra spaces and that a limit of one split keeps `v=w` together. The JavaScript tokenizer produces the same tokens, joined by a vertical bar for display.

## real
Compilers, query languages, configuration readers, chat commands and search boxes all begin with a tokenizer, and a large fraction of security bugs come from parsers that treat unexpected input carelessly.

## pros
- Splitting the work into tokenizer and parser simplifies both
- Regular expressions make small tokenizers short
- Library parsers handle the awkward cases for you

## cons
- Hand-rolled parsers miss edge cases
- Regular expressions can be hard to read and, if careless, slow
- Error reporting needs positions that simple split loses

## uses
- Reading fields from delimited text
- Evaluating arithmetic expressions
- Processing commands and queries
- Extracting words and numbers from free text

## mistakes
- Splitting CSV on commas without handling quotes
- Ordering token patterns so that a short one hides a longer one
- Ignoring empty fields created by consecutive separators
- Discarding the position needed for error messages

## interview
**Q:** What is the difference between tokenizing and parsing?
**A:** Tokenizing breaks the text into meaningful pieces such as numbers and operators; parsing arranges those tokens into a structure according to a grammar so the program can interpret them.

**Q:** Why is split(",") unsafe for CSV data?
**A:** Fields may contain quoted commas or line breaks, which a plain split treats as separators. A CSV library handles quoting correctly.

**Q:** Why order alternatives from longest to shortest in a token pattern?
**A:** Alternation picks the first alternative that matches, so a short pattern could match a prefix of a longer token and split it incorrectly.

## summary
Tokenize first, then parse. Use split for simple separators, regular expressions for token patterns and libraries for standard formats; report errors with positions and test with odd input.

## codenote
The Python sample shows a regular-expression tokenizer and the behavior of split. The JavaScript sample tokenizes the same expression.

## code
### python
```python
import re

def tokenize(text):
    return re.findall(r"\d+\.?\d*|[()+\-*/]", text)

print(tokenize("3 + 4.5*(2 - 1)"))
print("a,b,,c".split(","), "a  b".split(), "k=v=w".split("=", 1))
```
Output:
```text
['3', '+', '4.5', '*', '(', '2', '-', '1', ')']
['a', 'b', '', 'c'] ['a', 'b'] ['k', 'v=w']
```
### javascript
```javascript
const tokens = "3 + 4.5*(2 - 1)".match(/\d+\.?\d*|[()+\-*/]/g);
console.log(tokens.join("|"));
```
Output:
```text
3|+|4.5|*|(|2|-|1|)
```

## quiz
1. What is the first stage of processing a text expression?
   - [ ] Evaluation
   - [x] Tokenization
   - [ ] Compilation
   - [ ] Printing
   > The text is broken into tokens before structure is built.
2. What does "a,b,,c".split(",") contain?
   - [ ] Three items
   - [x] Four items, one of them empty
   - [ ] Two items
   - [ ] An error
   > Consecutive separators produce an empty field.
3. Why not parse CSV with a plain split on commas?
   - [ ] Commas are not separators
   - [x] Quoted fields can contain commas
   - [ ] Split is too slow
   - [ ] CSV has no fields
   > A CSV library respects quoting rules.
4. Why should error messages include a position?
   - [ ] To make them longer
   - [x] To help the user find the offending character quickly
   - [ ] Because tokens are numbered
   - [ ] To speed up the scanner
   > Positions turn an error into an actionable message.
