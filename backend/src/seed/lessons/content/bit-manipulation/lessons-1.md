# Binary Number System
kind: concept
time: Not applicable — converting between number bases takes time proportional to the number of digits, but the lesson is about what the digits mean, not about an algorithm's growth.
space: Not applicable — an n-bit pattern needs n bits by definition; the lesson explains how many values and which signs those bits can represent.

## intro
Everything a computer stores, from numbers to text to images, is a pattern of bits. The binary number system explains how a pattern of ones and zeros becomes a number, how negative numbers are encoded, and why integer types have the ranges they do, which is the foundation for every bit trick that follows.

## theory
Positional notation: a binary number is a sum of powers of two. The pattern `1011` means 1·8 + 0·4 + 1·2 + 1·1 = 11. The rightmost bit is the least significant bit (bit 0) and the leftmost is the most significant. An n-bit unsigned integer holds the values 0 through 2ⁿ − 1, so 8 bits give 0 to 255 and 32 bits give about four billion values.

Converting:

- Decimal to binary: divide by 2 repeatedly and read the remainders from last to first, or subtract the largest power of two that fits
- Binary to decimal: add the powers of two for the positions that hold a one
- Hexadecimal groups bits in fours: one hex digit is exactly 4 bits, so `0xFF` is `11111111`, which makes hex the compact way to write bit patterns; octal groups by three
- Language helpers: `bin`, `hex`, `oct` and `int(text, base)` in Python; `toString(2)` and `parseInt(text, 2)` in JavaScript; printf has no binary format in C, so programs loop over bits

Negative numbers use two's complement: in n bits, the value −x is stored as 2ⁿ − x, which is the bit pattern of x inverted plus one. The most significant bit acts as the sign (1 means negative). Advantages: addition and subtraction use the same circuit for signed and unsigned values, and there is one representation of zero. The signed range for n bits is −2ⁿ⁻¹ to 2ⁿ⁻¹ − 1, so 8 bits give −128 to 127, and the range is asymmetric: there is one more negative value than positive.

The pattern `11111011` read as unsigned is 251, and read as signed 8-bit it is −5, because 256 − 5 = 251. The same bits, two interpretations: the type decides.

Other representations: sign-magnitude and one's complement (historic), floating point (sign, exponent and fraction, covered under numeric precision), binary-coded decimal. Python integers are arbitrary precision and behave as if they had infinitely many sign bits, so masking with `& 0xFF` is how you view the low bits of a negative number.

## explain
1. Write the number as a sum of powers of two, or divide repeatedly by two, to convert.
2. Group the bits in fours to move between binary and hexadecimal.
3. For a fixed width, decide whether the pattern is signed or unsigned before interpreting it.
4. To negate in two's complement, invert the bits and add one.
5. To see the bits of a negative number in Python, mask with the width: `value & 0xFF`.
6. Check ranges: the largest unsigned value is 2ⁿ − 1 and the signed range is −2ⁿ⁻¹ to 2ⁿ⁻¹ − 1.

## example
In Python, `bin(10)` is `'0b1010'`, `int("1010", 2)` is 10, `hex(255)` is `'0xff'` and `oct(8)` is `'0o10'`. Formatting 5 in 8 bits gives `00000101`, and masking −5 with 255 gives `11111011`, the two's complement pattern. For 8 bits, the signed range is −128 to 127 and the unsigned maximum is 255. The helper `to_signed` turns the pattern `11111011` back into −5. The JavaScript lines do the same conversions with `toString` and `parseInt`.

## real
Network masks, file permissions, colour codes, hardware registers and cryptographic keys are all written in binary or hexadecimal, and misreading the signedness of a bit pattern is a classic source of bugs in low-level code.

## pros
- A simple positional system that hardware implements directly
- Two's complement unifies signed and unsigned arithmetic
- Hexadecimal gives a compact human-readable form

## cons
- Long binary strings are hard for people to read
- The signed range is asymmetric
- The same pattern means different numbers under different types

## uses
- Reading and writing bit patterns, masks and flags
- Understanding integer ranges and overflow
- Interpreting raw bytes from files and networks
- Working with hexadecimal colours and addresses

## mistakes
- Forgetting that the most significant bit is a sign bit in signed types
- Mixing up bit numbering from the left and from the right
- Assuming that negating a number only flips its sign bit
- Printing a negative number in Python with bin and expecting a fixed-width pattern

## interview
**Q:** What is two's complement and why is it used?
**A:** It represents a negative number x in n bits as 2 to the n minus x, equivalent to inverting the bits and adding one. It lets the same adder handle signed and unsigned arithmetic and gives a single zero.

**Q:** What range of values does an 8-bit signed integer hold?
**A:** From minus 128 to 127, which is minus 2 to the 7 up to 2 to the 7 minus 1.

**Q:** How do you convert a binary number to hexadecimal?
**A:** Split the bits into groups of four starting from the right, and replace each group by its hexadecimal digit.

## summary
Binary numbers are sums of powers of two; hex groups four bits per digit; two's complement encodes negatives by inversion plus one. Always know the width and signedness before reading a bit pattern.

## codenote
The Python sample converts between bases, shows two's complement and decodes it. The JavaScript sample does the equivalent conversions.

## code
### python
```python
print(bin(10), int("1010", 2), hex(255), oct(8))
print(format(5, "08b"), format(-5 & 0xFF, "08b"))

bits = 8
print(-(1 << (bits - 1)), (1 << (bits - 1)) - 1, (1 << bits) - 1)

def to_signed(value, width):
    return value - (1 << width) if value >= 1 << (width - 1) else value

print(to_signed(0b11111011, 8))
```
Output:
```text
0b1010 10 0xff 0o10
00000101 11111011
-128 127 255
-5
```
### javascript
```javascript
console.log((10).toString(2), parseInt("1010", 2), (255).toString(16));
console.log(((-5) & 0xff).toString(2).padStart(8, "0"));
console.log((-5 >>> 0).toString(2).length);
```
Output:
```text
1010 10 ff
11111011
32
```

## quiz
1. What does the binary pattern 1011 represent?
   - [ ] 13
   - [x] 11
   - [ ] 10
   - [ ] 9
   > It is 8 plus 2 plus 1.
2. How is minus 5 stored in 8-bit two's complement?
   - [ ] 10000101
   - [x] 11111011
   - [ ] 00000101
   - [ ] 11111010
   > Invert 00000101 to get 11111010 and add one.
3. How many bits does one hexadecimal digit represent?
   - [ ] 2
   - [ ] 3
   - [x] 4
   - [ ] 8
   > Sixteen values need four bits.
4. What is the largest unsigned value in 8 bits?
   - [ ] 128
   - [ ] 127
   - [x] 255
   - [ ] 256
   > It is 2 to the power 8 minus 1.

# Bitwise AND OR XOR NOT
kind: concept
time: Not applicable — a bitwise operation on machine words is one instruction. The lesson explains what each operator does to individual bits and the algebraic laws that make them useful.
space: Not applicable — the operators work on values already in registers and produce one result word.
practice: count-even-numbers

## intro
The four bitwise operators combine the bits of integers position by position. Each has a simple truth table, and each plays a specific role: AND selects bits, OR forces them on, XOR flips them and detects differences, and NOT inverts everything. Knowing the laws they obey lets you rewrite and simplify bit expressions with confidence.

## theory
For a single pair of bits:

- AND: 1 only if both are 1. Used to mask (keep only chosen bits) and to test bits.
- OR: 1 if at least one is 1. Used to set bits.
- XOR (exclusive or): 1 if exactly one is 1, so it is 1 when the bits differ. Used to toggle bits and compare.
- NOT: flips each bit. For a signed two's complement integer `~x` equals `-x - 1`; for a fixed width unsigned value, mask the result to keep the width.

Applied to whole numbers, each operator acts on every bit position independently. For example 12 is `1100` and 10 is `1010`: their AND is `1000`, OR is `1110`, XOR is `0110`, and NOT of 12 in four bits is `0011`.

Laws worth knowing:

- Identity: `x | 0 = x`, `x & all_ones = x`, `x ^ 0 = x`
- Domination: `x & 0 = 0`, `x | all_ones = all_ones`
- XOR is its own inverse: `x ^ x = 0` and `(x ^ y) ^ y = x`. This makes XOR the basis of simple encryption, checksums and the swap trick.
- Commutative and associative: the order and grouping of a chain of ANDs, ORs or XORs do not matter
- Distributive: `x & (y | z) = (x & y) | (x & z)`
- De Morgan: `~(x & y) = ~x | ~y` and `~(x | y) = ~x & ~y`
- Absorption: `x | (x & y) = x`

Useful idioms: `x & 1` is the lowest bit, which is the parity (1 for odd, 0 for even); `x & (x - 1)` clears the lowest set bit; XOR of two values has a 1 exactly where they differ, so `x ^ y == 0` tests equality.

Swapping two variables without a temporary uses three XORs: `x ^= y; y ^= x; x ^= y`. It is a curiosity, since a plain tuple assignment is clearer and faster, and it fails if both names refer to the same location.

Precedence warning: in C-family languages and JavaScript, comparison operators bind tighter than the bitwise ones, so `x & 1 == 0` means `x & (1 == 0)`; always parenthesise. Python orders them the other way, but parentheses still document the intent.

## explain
1. Write the operands in binary, padded to the same width.
2. Apply the operator column by column using the truth table.
3. For NOT, decide the width and mask the result.
4. Use AND with a mask to isolate bits, OR to set them and XOR to flip or compare them.
5. Simplify expressions with the laws, especially XOR cancelling itself.
6. Parenthesise every bitwise expression that is part of a comparison.

## example
For a = 12 and b = 10 the Python line prints the four results in four-bit form: `1000`, `1110`, `0110` and `0011` (the NOT is masked with 15). XOR cancels itself: `a ^ a` is 0, `a ^ 0` is 12 and `(a ^ b) ^ b` equals a again. Three XOR steps swap 5 and 9. De Morgan's law holds for the pair: `~(a & b)` equals `~a | ~b`. The parity check `a & 1` gives 0 for even and 1 for odd numbers. The JavaScript sample repeats the results and shows that the parity test needs parentheses.

## real
Permission checks, packet filtering with network masks, graphics blending and error-detecting codes all use these operators, and XOR-based parity bits detect single-bit errors in memory.

## pros
- Constant-time operations on whole words
- Simple algebra that supports reliable rewrites
- XOR gives reversible mixing without extra storage

## cons
- Easy to mix up with the logical operators
- Precedence differs between languages
- Readability suffers if used without comments

## uses
- Masking, setting and flipping bits
- Testing parity and equality quickly
- Simple checksums and symmetric encryption primitives
- Swapping values and finding differences

## mistakes
- Writing x & 1 == 0 in a C-family language without parentheses
- Using the XOR swap when both operands are the same location
- Forgetting to mask the result of NOT when a fixed width is intended
- Confusing the bitwise and logical forms of AND and OR

## interview
**Q:** What does x XOR x equal, and why is that useful?
**A:** Zero, because every bit matches itself. Combined with the fact that x XOR 0 is x and that XOR is commutative, it lets duplicates cancel out, as in the single-number problem.

**Q:** What is the bitwise NOT of x in two's complement?
**A:** Minus x minus one, because inverting all bits of x gives the pattern for 2 to the n minus 1 minus x, which reads as minus x minus 1 when signed.

**Q:** How do you test whether a number is odd using bitwise operators?
**A:** AND it with 1; the result is 1 for odd numbers and 0 for even ones, since only the lowest bit decides parity.

## summary
AND masks, OR sets, XOR flips and compares, and NOT inverts. Learn the identities, XOR cancelling itself and De Morgan's laws, and always parenthesise bit expressions inside comparisons.

## codenote
The Python sample prints the four operations in four bits and checks the laws. The JavaScript sample shows the precedence trap.

## code
### python
```python
a, b = 0b1100, 0b1010
print(f"{a & b:04b} {a | b:04b} {a ^ b:04b} {~a & 0xF:04b}")
print(a ^ a, a ^ 0, (a ^ b) ^ b == a)
print(~(a & b) == (~a | ~b), a & 1)

x, y = 5, 9
x ^= y
y ^= x
x ^= y
print(x, y)
```
Output:
```text
1000 1110 0110 0011
0 12 True
True 0
9 5
```
### javascript
```javascript
console.log((12 & 10).toString(2), (12 | 10).toString(2), (12 ^ 10).toString(2));
console.log(6 & 1 === 0, (6 & 1) === 0);
```
Output:
```text
1000 1110 110
0 true
```

## quiz
1. What is 12 XOR 10 in decimal?
   - [ ] 2
   - [x] 6
   - [ ] 8
   - [ ] 14
   > 1100 XOR 1010 equals 0110.
2. What does x XOR x always give?
   - [ ] x
   - [x] 0
   - [ ] 1
   - [ ] All ones
   > Every bit is compared with itself and cancels.
3. Which expression is the safe way to test whether x is even in C or JavaScript?
   - [ ] x & 1 == 0
   - [x] (x & 1) == 0
   - [ ] x && 1 == 0
   - [ ] x | 1 == 0
   > Parentheses are needed because comparison binds tighter than bitwise AND there.
4. According to De Morgan's laws, what equals NOT of (x AND y)?
   - [ ] NOT x AND NOT y
   - [x] NOT x OR NOT y
   - [ ] x OR y
   - [ ] x XOR y
   > Negation turns an AND into an OR of the negated operands.

# Left and Right Shifts
kind: concept
time: Not applicable — a shift is a single instruction, which is why multiplying by a power of two with a shift is cheap. The lesson explains the semantics and the traps.
space: Not applicable — shifts operate on a word in a register.

## intro
A shift slides all the bits of a number left or right. Shifting left by k multiplies by 2 to the k, shifting right divides by 2 to the k and rounds down, and a handful of rules about sign and width decide whether the result is what you expect. Shifts also build and take apart packed values such as colours and flags.

## theory
Left shift `x << k`: moves bits toward the most significant end and fills the vacated low bits with zeros. For values that do not overflow, it equals x · 2ᵏ. In fixed-width types, bits shifted past the top are lost: in 8 bits, `0b10010000 << 1` becomes `0b00100000`.

Right shift `x >> k`: moves bits toward the least significant end. Two flavours:

- Arithmetic shift: the vacated high bits copy the sign bit, so negative numbers stay negative. It is floor division by 2ᵏ: `-17 >> 2` is −5, because −17 / 4 is −4.25 and floors to −5. Python's `>>` and JavaScript's `>>` and Java's `>>` are arithmetic.
- Logical shift: the vacated high bits are filled with zeros, treating the pattern as unsigned. JavaScript and Java write it `>>>`. C leaves right shift of negative signed values implementation-defined. In Python, emulate a 32-bit logical shift with `(x & 0xFFFFFFFF) >> k`.

Rules and hazards:

- Shifting by a count greater than or equal to the width is undefined in C and C++; in JavaScript the count is taken modulo 32, so `1 << 32` is 1; Python has unlimited integers and shifts normally
- Shifting a one into the sign bit of a signed type changes its sign: `1 << 31` is negative in 32-bit signed arithmetic
- Negative shift counts are errors in Python and undefined in C
- Operator precedence: shifts bind looser than addition, so `1 << n + 1` means `1 << (n + 1)`

Common uses:

- Powers of two: `1 << k` creates a mask with only bit k set
- Fast multiplication and division by powers of two (compilers do this automatically, so write the clear form unless working with bit patterns)
- Packing and unpacking fields: an RGB colour as `(r << 16) | (g << 8) | b`, extracted by `(color >> 16) & 0xFF`
- Reading a bit: `(x >> i) & 1`
- Computing the midpoint without overflow and building bit sets

## explain
1. Decide the width and signedness of the value.
2. Choose a left shift for scaling up or building masks and a right shift for scaling down or extracting fields.
3. For negative numbers, decide whether you want arithmetic (keep the sign) or logical (treat as unsigned) shifting.
4. Mask after shifting to keep only the field you need.
5. Check that the shift count is smaller than the width.
6. Parenthesise shifts that appear inside larger arithmetic expressions.

## example
In Python, `1 << 10` is 1024, `17 >> 2` is 4 and `-17 >> 2` is −5. Treating −17 as a 32-bit unsigned pattern and shifting logically gives `(-17 & 0xFFFFFFFF) >> 28`, which is 15. An RGB colour with red 255, green 128 and blue 64 packs into 16,744,512 and unpacks into the same three fields. The JavaScript lines show the difference between the arithmetic and the logical right shift on −17, and that a shift count of 32 wraps around to 0.

## real
Graphics code packs colours into integers, network code builds addresses and flags from fields, hash functions mix bits with shifts and rotations, and compilers turn multiplications by powers of two into shifts.

## pros
- Constant time and compact
- Natural tool for packing and unpacking fields
- Exact multiplication and floor division by powers of two

## cons
- Sign and width rules differ between languages
- Overflow and large shift counts are undefined in C
- Less readable than arithmetic for ordinary multiplication

## uses
- Creating bit masks with a single set bit
- Packing and extracting colour channels and flags
- Dividing and multiplying by powers of two in bit-level code
- Reading individual bits of a value

## mistakes
- Using an arithmetic shift where an unsigned logical shift was intended
- Shifting by the full width or more
- Forgetting that left shifts can overflow and change the sign
- Assuming right shift rounds toward zero for negative numbers

## interview
**Q:** What is the difference between arithmetic and logical right shift?
**A:** An arithmetic shift fills the vacated high bits with copies of the sign bit and so preserves the sign, while a logical shift fills them with zeros and treats the value as unsigned.

**Q:** What is minus 17 shifted right by 2 in Python and why?
**A:** Minus 5, because the arithmetic shift floors the quotient minus 17 divided by 4, which is minus 4.25, to minus 5.

**Q:** How do you extract the green channel from a packed colour value?
**A:** Shift right by 8 bits and mask with 255, as in (color >> 8) & 0xFF.

## summary
Left shifts multiply by powers of two and build masks; right shifts divide by powers of two, arithmetically for signed values and logically for unsigned. Mind the width, the sign and the shift count, and mask extracted fields.

## codenote
The Python sample shows arithmetic and emulated logical shifts and colour packing. The JavaScript sample contrasts the two right shifts and a wrapped count.

## code
### python
```python
print(1 << 10, 17 >> 2, -17 >> 2)
print((-17 & 0xFFFFFFFF) >> 28)

color = (255 << 16) | (128 << 8) | 64
print(color, (color >> 16) & 0xFF, (color >> 8) & 0xFF, color & 0xFF)
```
Output:
```text
1024 4 -5
15
16744512 255 128 64
```
### javascript
```javascript
console.log(-17 >> 2, -17 >>> 28);
console.log(1 << 31, 1 << 32);
```
Output:
```text
-5 15
-2147483648 1
```

## quiz
1. What does x << 3 compute for a non-overflowing integer x?
   - [ ] x plus 3
   - [x] x times 8
   - [ ] x divided by 8
   - [ ] x to the power 3
   > Each left shift doubles the value.
2. What is minus 17 right-shifted arithmetically by 2?
   - [ ] -4
   - [x] -5
   - [ ] 4
   - [ ] -17
   > The shift floors the quotient of minus 4.25.
3. Which JavaScript operator performs a logical right shift?
   - [ ] >>
   - [x] >>>
   - [ ] <<
   - [ ] >=
   > The triple form fills with zeros and treats the value as unsigned.
4. What does 1 << 32 evaluate to in JavaScript?
   - [ ] 4294967296
   - [ ] 0
   - [x] 1
   - [ ] An error
   > The shift count is reduced modulo 32.

# Setting Clearing Toggling Bits
kind: algorithm
time: O(1) for each of the operations, which are single bitwise instructions on a machine word.
space: O(1) extra space; a set of up to 64 flags fits in one integer.

## intro
Treating an integer as a row of switches is one of the oldest and most useful bit techniques. Four operations cover almost every need: set a bit, clear it, toggle it and test it. Combined with named flag constants, they pack many yes or no options into a single value that is cheap to store, copy and compare.

## theory
Each operation builds a mask with a single one in position i, `mask = 1 << i`, and combines it with the value:

- Set bit i: `n | mask` — forces the bit to 1 whatever it was
- Clear bit i: `n & ~mask` — forces the bit to 0; the inverted mask has zeros only at position i
- Toggle bit i: `n ^ mask` — flips the bit
- Test bit i: `(n >> i) & 1` or `(n & mask) != 0`
- Write bit i with a value v (0 or 1): clear then set, `(n & ~mask) | (v << i)`

Multiple bits at once: use a mask with several ones. `n | (A | B)` sets both flags, `n & ~(A | B)` clears both, `n & (A | B) == (A | B)` tests that all are set, and `n & (A | B) != 0` tests that at least one is set.

Flag sets: define constants as powers of two, `READ = 1 << 0`, `WRITE = 1 << 1`, `EXEC = 1 << 2`, and combine with OR. Permissions `READ | EXEC` is 5. Remove a flag with AND NOT. This is how Unix file modes, many API option arguments (such as open flags) and enumerations used as sets work.

Extracting and replacing a field of w bits starting at position p: extract with `(n >> p) & ((1 << w) - 1)`; replace by clearing the field with `n & ~(((1 << w) - 1) << p)` and OR-ing the new value shifted into place.

Cautions: in C, shifting a signed `1` into the sign bit is undefined, so use `1u` or an unsigned type; keep the mask the same width as the value; JavaScript integer bit operations act on 32 bits, so bit indexes above 31 need BigInt; Python integers have no width limit, and `~mask` is negative, which works correctly with AND.

Bit sets are also a compact data structure: a set of small integers stored in one word, with union as OR, intersection as AND, difference as AND NOT, and membership by testing a bit; each operation is O(1) for up to the word size.

## explain
1. Decide the bit positions or define named flags as powers of two.
2. Build the mask by shifting 1 to the position.
3. Use OR to set, AND with the inverted mask to clear, XOR to toggle.
4. Test with shift-and-mask or AND against the mask.
5. For several flags, combine masks with OR before applying the operation.
6. Verify with a small value written in binary, one operation at a time.

## example
For n = 1010 in binary, the Python helpers give: setting bit 0 yields 1011, clearing bit 1 yields 1000, toggling bit 3 yields 0010, and testing bit 3 returns 1. The permissions example builds `READ | EXEC` as 5, tests that write is not allowed, grants write to get 7 and removes execute to get 3. The JavaScript sample uses the same operations to maintain a set of enabled features.

## real
File permission bits, hardware control registers, feature flags, graphics state options and compact sets in algorithms are all managed with these four operations.

## pros
- Constant-time operations
- Many flags in one small value
- Union, intersection and difference of small sets in single instructions

## cons
- Readability suffers without named constants
- Limited by the word width
- Easy to forget the inversion when clearing

## uses
- Storing permission and option flags
- Representing small sets of integers
- Controlling hardware registers
- Packing state in compact structures

## mistakes
- Clearing a bit with AND and the mask itself instead of its inverse
- Using a signed one in C and shifting into the sign bit
- Exceeding the 32-bit limit of JavaScript bit operations
- Testing a combined flag with a non-zero check when all bits are required

## interview
**Q:** How do you set, clear and toggle the i-th bit of n?
**A:** Set with n OR (1 shifted left by i), clear with n AND the complement of that mask, and toggle with n XOR the mask.

**Q:** How do you check that several flags are all set in a value?
**A:** Combine the flags into a mask and check that n AND mask equals mask; a non-zero result alone only shows that at least one is set.

**Q:** How can an integer represent a set of small numbers?
**A:** Bit i is 1 when i is a member. Union is OR, intersection is AND, difference is AND with the complement, and membership is a bit test.

## summary
Set with OR, clear with AND and the inverted mask, toggle with XOR and test with shift and AND. Name your flags, keep widths consistent and use the same idea for compact sets.

## codenote
The Python sample implements the four operations and a permission set. The JavaScript sample manages feature flags.

## code
### python
```python
def set_bit(n, i):
    return n | (1 << i)

def clear_bit(n, i):
    return n & ~(1 << i)

def toggle_bit(n, i):
    return n ^ (1 << i)

def test_bit(n, i):
    return (n >> i) & 1

n = 0b1010
print(f"{set_bit(n, 0):04b} {clear_bit(n, 1):04b} {toggle_bit(n, 3):04b} {test_bit(n, 3)}")

READ, WRITE, EXEC = 1, 2, 4
permissions = READ | EXEC
print(permissions, bool(permissions & WRITE))
permissions |= WRITE
permissions &= ~EXEC
print(permissions)
```
Output:
```text
1011 1000 0010 1
5 False
3
```
### javascript
```javascript
const DARK = 1 << 0;
const BETA = 1 << 1;
const SOUND = 1 << 2;

let features = DARK | SOUND;
features ^= BETA;
features &= ~DARK;
console.log(features, (features & BETA) !== 0, (features & DARK) !== 0);
```
Output:
```text
6 true false
```

## quiz
1. How do you clear bit i of n?
   - [ ] n OR the mask
   - [x] n AND the complement of the mask
   - [ ] n XOR the mask
   - [ ] n AND the mask
   > The inverted mask keeps every bit except position i.
2. What does n XOR (1 << i) do?
   - [ ] Sets bit i
   - [ ] Clears bit i
   - [x] Toggles bit i
   - [ ] Tests bit i
   > XOR with a one flips that position.
3. How do you test that both flags A and B are set in n?
   - [ ] n AND A
   - [ ] n OR (A OR B)
   - [x] (n AND (A OR B)) equals (A OR B)
   - [ ] n XOR (A OR B)
   > All required bits must survive the mask.
4. Why use 1u instead of 1 when building masks in C?
   - [ ] To make the code shorter
   - [x] Shifting a signed one into the sign bit is undefined
   - [ ] To avoid overflow of the loop counter
   - [ ] Because 1 is not an integer
   > An unsigned type has no sign bit to overflow.

# Count Set Bits
kind: algorithm
time: O(k) for Brian Kernighan's method, where k is the number of set bits; O(w) for the simple shift loop on a w-bit word; O(1) with a lookup table or the hardware popcount instruction.
space: O(1) for the loops; O(2^b) for a lookup table of b-bit chunks, or O(n) for a table of counts for 0 to n.

## intro
Counting the ones in a number's binary form, its population count or Hamming weight, is a classic small problem with real uses: the size of a bit set, parity, Hamming distance between two values and the number of subsets in a mask. The solutions range from a simple loop to a trick that runs only as many steps as there are ones.

## theory
Methods:

- Shift and test: loop over all w bits, adding `n & 1` and shifting right. O(w) regardless of the value; careful with negative numbers in languages that sign-extend.
- Brian Kernighan's algorithm: `n & (n - 1)` clears the lowest set bit. Repeat until n is zero, counting iterations. Each iteration removes one set bit, so the loop runs k times for k set bits. For 1024 (a single bit) it needs one step, while for 255 it needs 8.
- Lookup table: precompute the counts for every value of a small chunk (8 or 16 bits) and add the counts of the chunks. O(w / chunk) per query.
- Dynamic programming over a range: `ones[i] = ones[i >> 1] + (i & 1)` computes counts for 0 to n in O(n) total, because dropping the lowest bit gives a smaller number whose count is already known. The first values are 0, 1, 1, 2, 1, 2, 2, 3.
- Parallel bit counting (SWAR): add adjacent bits, then pairs, then nibbles with masks and a multiply, in constant time without a table
- Hardware: the POPCNT instruction, exposed as `int.bit_count()` in Python 3.10 and later, `Integer.bitCount` in Java and `__builtin_popcount` in GCC and Clang

Why `n & (n - 1)` works: subtracting 1 flips the lowest set bit to 0 and all the zeros below it to 1; ANDing with the original clears exactly that lowest set bit and leaves everything above it unchanged. Example: `40 = 101000`, `39 = 100111`, `40 & 39 = 100000`.

Applications:

- Hamming distance of two values: the count of set bits in `x ^ y`
- Parity: the count modulo 2
- Subset size when a subset is a bitmask
- Checking whether a number is a power of two (exactly one set bit)
- Counting differing positions in bit-packed data and in similarity hashing

Negative numbers: Python's `bin(-5)` shows a minus sign and the magnitude; to count bits of the two's complement pattern, mask to the desired width first. JavaScript operators work on 32-bit values, so use `>>> 0` to treat a value as unsigned.

## explain
1. Decide the word width and whether negative numbers need two's complement treatment.
2. For few expected set bits, use Kernighan's loop.
3. For many queries on small values, build a table once.
4. For a range of values, use the shift-by-one dynamic programming recurrence.
5. When available, use the built-in popcount.
6. Test 0, a power of two, all ones and alternating patterns.

## example
Kernighan's function returns 8 for 255 after 8 loop passes and 1 for 1024 after a single pass. `bin(i).count("1")` and the recurrence both give the counts `[0, 1, 1, 2, 1, 2, 2, 3]` for the numbers 0 to 7, and Python's `int.bit_count` agrees. The Hamming distance between 93 and 73 is the number of ones in their XOR, which is 2. The JavaScript function counts the set bits of a 32-bit value using the same loop.

## real
Compression and error-correcting codes use Hamming weights, search engines compare bit signatures, chess engines count pieces on bitboards and cryptographic code measures bit differences.

## pros
- Kernighan's method depends only on the number of set bits
- Tables and hardware give constant time
- The recurrence builds all counts in linear time

## cons
- The simple loop always costs the full width
- Tables use memory and add cache pressure
- Sign handling differs between languages

## uses
- Computing Hamming weight and Hamming distance
- Sizing subsets represented as bitmasks
- Parity checks
- Counting set cells in bitboards

## mistakes
- Looping on a negative number in a language where right shift keeps the sign and never reaches zero
- Using the shift loop when few bits are set and Kernighan would be faster
- Forgetting that Python's bin of a negative number is not a fixed-width pattern
- Reimplementing popcount where the built-in is available

## interview
**Q:** How does Brian Kernighan's algorithm count set bits?
**A:** It repeatedly replaces n with n AND (n minus 1), which clears the lowest set bit, and counts the iterations until n is zero, so it runs once per set bit.

**Q:** How do you compute the Hamming distance between two integers?
**A:** XOR them to get ones where the bits differ and count the set bits of the result.

**Q:** How can you count the set bits of all numbers from 0 to n in linear time?
**A:** Use the recurrence count[i] equals count[i shifted right by one] plus the lowest bit of i, filling the array in increasing order.

## summary
Count set bits with Kernighan's loop in O(k), a table or hardware popcount in constant time, or a recurrence for whole ranges. Use XOR plus popcount for Hamming distance and mask negatives to a fixed width.

## codenote
The Python sample implements the loop, the recurrence and the built-in. The JavaScript sample counts bits of a 32-bit value.

## code
### python
```python
def kernighan(n):
    count = 0
    while n:
        n &= n - 1
        count += 1
    return count

print(kernighan(255), kernighan(1024))

ones = [0] * 8
for i in range(1, 8):
    ones[i] = ones[i >> 1] + (i & 1)
print(ones, [i.bit_count() for i in range(8)] == ones)
print(kernighan(93 ^ 73))
```
Output:
```text
8 1
[0, 1, 1, 2, 1, 2, 2, 3] True
2
```
### javascript
```javascript
function popcount(value) {
  let n = value >>> 0;
  let count = 0;
  while (n !== 0) {
    n = (n & (n - 1)) >>> 0;
    count++;
  }
  return count;
}

console.log(popcount(1023), popcount(1024), popcount(-1));
```
Output:
```text
10 1 32
```

## quiz
1. What does n AND (n minus 1) do?
   - [ ] Sets the lowest bit
   - [x] Clears the lowest set bit
   - [ ] Toggles all bits
   - [ ] Doubles n
   > Subtracting one flips the lowest set bit and everything below it.
2. How many iterations does Kernighan's loop need for a value with k set bits?
   - [ ] The word width
   - [x] k
   - [ ] log k
   - [ ] n
   > Each iteration removes one set bit.
3. How do you compute the Hamming distance of x and y?
   - [ ] Count the bits of x plus y
   - [x] Count the set bits of x XOR y
   - [ ] Compare x and y as text
   - [ ] Subtract y from x
   > XOR marks exactly the positions where the bits differ.
4. How many set bits does 1024 have?
   - [ ] 10
   - [x] 1
   - [ ] 0
   - [ ] 1024
   > It is a single power of two.

# Power of Two Check
kind: algorithm
time: O(1) for the bit test and for computing the next power of two with the bit length; the logarithm approach is also O(1) but unreliable for large integers.
space: O(1) extra space.

## intro
A positive integer is a power of two exactly when its binary form has a single one. That observation gives a one-line test using the number and the number minus one that replaces loops and floating-point logarithms, and it generalises to rounding up to the next power of two, a routine step in sizing buffers and hash tables.

## theory
Why the test works: a power of two is 1 followed by zeros, like `1000`. Subtracting one turns it into `0111`, so ANDing the two gives zero. For any other positive number, the highest set bit survives the subtraction, so the AND is not zero. Example: `6 = 110`, `5 = 101`, `6 & 5 = 100`, not zero.

The condition needs a guard for zero and negatives: `n > 0 and (n & (n - 1)) == 0`. Zero would pass the AND test (0 & −1 is 0) but is not a power of two.

Related facts and tricks:

- `n & -n` isolates the lowest set bit; `n` is a power of two exactly when `n & -n == n` and n > 0
- Counting set bits: exactly one set bit means power of two
- Floating-point alternative: `log2(n)` is an integer. This is slower and may be wrong due to rounding for large values.
- Next power of two at or above n (n ≥ 1): `1 << (n - 1).bit_length()` in Python. For 37, `36` has bit length 6, so the result is 64. In languages without bit length, smear the highest bit downward with `n |= n >> 1; n |= n >> 2; n |= n >> 4; ...; n + 1` after subtracting one first.
- Power of four: a power of two whose single bit is at an even position, tested with a mask such as `0x55555555`
- Floor to a power of two: `1 << (n.bit_length() - 1)`
- Log base 2 of a power of two: `n.bit_length() - 1`
- Modulo a power of two: `x % 2**k == x & (2**k - 1)` for non-negative x, a standard hash table optimisation
- Alignment: rounding an address up to a multiple of a power of two with `(x + a - 1) & ~(a - 1)`

Pitfalls: JavaScript's bitwise operators convert numbers to 32 bits, so the test is wrong for values of 2³² and above, giving false positives such as 2⁴⁰ + 8; use BigInt for large integers. In C, apply the test to unsigned types to avoid signed overflow of `n - 1` when n is the minimum value.

Uses of the property: capacity of hash tables and buffers (so modulo becomes a mask), FFT sizes, memory page alignment, ring buffers, and sizes in binary trees such as segment trees.

## explain
1. Check that n is positive.
2. Compute `n & (n - 1)`; if it is zero, n is a power of two.
3. To find the next power of two, take the bit length of n − 1 and shift one by it.
4. To find the exponent, use the bit length minus one.
5. For large values in JavaScript, switch to BigInt.
6. Test 0, 1, 2, 3, large powers and numbers just above and below a power.

## example
Among 1 to 19 the Python test selects `[1, 2, 4, 8, 16]`. Zero is rejected by the positivity guard, and the next power of two at or above 37 is 64. The exponent of 1,024 is 10 from its bit length. In JavaScript, the naive 32-bit test wrongly accepts 2⁴⁰ + 8, printing true, while the BigInt version correctly reports false for the same number.

## real
Hash tables and ring buffers pick capacities that are powers of two so the index is a cheap mask, memory allocators align blocks to powers of two, and FFT libraries require power-of-two lengths.

## pros
- Constant time with one subtraction and one AND
- Avoids floating-point rounding problems
- Enables cheap modulo and alignment

## cons
- Needs a guard for zero and negatives
- Wrong for large values in JavaScript's 32-bit bit operations
- The trick is cryptic without an explanation

## uses
- Validating buffer and table sizes
- Rounding sizes up to the next power of two
- Replacing modulo by a mask in hash tables and ring buffers
- Aligning addresses and sizes

## mistakes
- Forgetting that zero passes the AND test without the positivity check
- Using floating-point log2 and getting rounding errors
- Using 32-bit bit operations on values that exceed 32 bits
- Computing the next power of two for n equal to an exact power and getting the next one up

## interview
**Q:** How do you check whether an integer is a power of two without loops?
**A:** Check that n is greater than zero and that n AND (n minus 1) equals zero, because a power of two has a single set bit and subtracting one flips it and all lower bits.

**Q:** How do you round a number up to the next power of two?
**A:** Take one less than the number, find its bit length, and shift 1 left by that amount. Equivalently, smear the highest set bit into all lower positions and add one.

**Q:** Why is modulo by a power of two cheap?
**A:** For a non-negative x, x modulo 2 to the k equals x AND (2 to the k minus 1), a single mask operation.

## summary
A power of two has exactly one set bit, so n greater than zero and n AND (n minus 1) equal to zero identifies it. The bit length gives exponents and the next power of two, and the same structure makes modulo and alignment cheap.

## codenote
The Python sample filters powers of two and rounds up. The JavaScript sample shows the 32-bit pitfall and the BigInt fix.

## code
### python
```python
def is_power_of_two(n):
    return n > 0 and n & (n - 1) == 0

print([n for n in range(1, 20) if is_power_of_two(n)], is_power_of_two(0))

def next_power_of_two(n):
    return 1 << (n - 1).bit_length()

print(next_power_of_two(37), next_power_of_two(64), (1024).bit_length() - 1)
print(1000 % 64 == 1000 & 63)
```
Output:
```text
[1, 2, 4, 8, 16] False
64 64 10
True
```
### javascript
```javascript
const naive = (n) => n > 0 && (n & (n - 1)) === 0;
const exact = (n) => n > 0n && (n & (n - 1n)) === 0n;

const big = 2 ** 40 + 8;
console.log(naive(big), exact(BigInt(big)));
```
Output:
```text
true false
```

## quiz
1. What does a positive power of two look like in binary?
   - [ ] All ones
   - [x] A single one followed by zeros
   - [ ] Alternating bits
   - [ ] Ending in one
   > Examples are 1, 10, 100 and 1000.
2. Why must the test also check that n is greater than zero?
   - [ ] To avoid overflow
   - [x] Zero satisfies the AND condition but is not a power of two
   - [ ] Because negative numbers are powers of two
   - [ ] For speed
   > 0 AND anything is zero.
3. What is the next power of two at or above 37?
   - [ ] 32
   - [x] 64
   - [ ] 40
   - [ ] 128
   > 36 needs six bits, so the answer is 2 to the sixth power.
4. What does x AND (2 to the k minus 1) compute for non-negative x?
   - [ ] x divided by 2 to the k
   - [x] x modulo 2 to the k
   - [ ] x times 2 to the k
   - [ ] The k-th bit
   > The mask keeps the low k bits, which is the remainder.

# Single Number XOR Trick
kind: algorithm
time: O(n) for a single pass over the array, with one XOR per element.
space: O(1) extra space, in contrast with the O(n) of a hash map or set that counts occurrences.

## intro
Given an array in which every value appears twice except one, find the odd one out. Sorting or a hash map works, but XOR solves it in one pass with no extra memory, because XORing a number with itself cancels it. The same idea extends to two missing values and to finding a missing number.

## theory
Facts about XOR that make the trick work:

- `x ^ x = 0`: a pair cancels
- `x ^ 0 = x`: zero is neutral
- XOR is commutative and associative: the order of the elements does not matter, so all pairs cancel wherever they sit

Single number: XOR all elements. Every value that occurs twice cancels to zero, and the unique value remains. For `[4, 1, 2, 1, 2]` the result is 4. The method is O(n) time and O(1) space, and it works for any elements that appear an even number of times plus one that appears an odd number of times.

Missing number: given n distinct numbers from 0 to n, find the one that is absent. XOR the numbers 0 to n together with all the array elements; every present value appears twice and cancels, leaving the missing one. For `[3, 0, 1]` with n = 3 the answer is 2. Alternative: subtract the array sum from n(n + 1)/2, which can overflow in fixed-width types, while XOR cannot.

Two single numbers: if exactly two values a and b appear once and all others twice, XOR of everything is `a ^ b`, which is non-zero because a ≠ b. Pick any set bit of that result, for example the lowest, found with `x & -x`; a and b differ at that bit. Partition the array by whether that bit is set in each element. Each group contains one of the singles and complete pairs, so XOR each group separately to obtain a and b. For `[1, 2, 1, 3, 2, 5]` the XOR is `3 ^ 5 = 6`, the lowest set bit is 2, and the groups give 3 and 5.

Variations: every number appears three times except one (count bits modulo 3 for each position, or use two accumulator variables), finding duplicates in the range 1 to n, and detecting differences between two collections of the same elements.

Limitations: XOR relies on pairs, so it does not apply directly when the other values appear a different number of times, and it identifies the odd-count value but does not tell its position. For values that are not integers, hash them first or use a map.

Why it matters in practice: it demonstrates algebraic structure, not just a trick: XOR over integers is an abelian group, and the single value is the sum of the group elements with the pairs cancelling. The same cancellation is used in parity checks, RAID parity blocks, which allow recovery of one lost disk by XORing the rest, and network coding.

## explain
1. Identify which values occur an even number of times and which do not.
2. Start the accumulator at zero and XOR each element into it.
3. For two unique values, XOR all, isolate a set bit of the result and split the array into two groups by that bit.
4. XOR within each group to recover the two values.
5. For the missing number problem, include the full range in the XOR.
6. Test with a single element, negative numbers and the largest values.

## example
XORing `[4, 1, 2, 1, 2]` leaves 4. For the two-single case, the program XORs `[1, 2, 1, 3, 2, 5]` to get 6, isolates the bit with `6 & -6` giving 2, splits the numbers by that bit and recovers 3 and 5. The missing number in `[3, 0, 1]` is found by XORing with the range 0 to 3 and equals 2. The JavaScript function finds the single number in a longer list of ids.

## real
RAID arrays store an XOR parity block so that any one failed disk can be rebuilt, communication systems use XOR parity bits to detect errors, and the technique appears frequently in interviews as an elegant constant-space method.

## pros
- One pass and constant extra space
- No overflow, unlike sum-based methods
- Extends to two unique values and missing numbers

## cons
- Works only when the other values come in pairs
- Does not give the position of the value
- The idea is not obvious without knowing XOR properties

## uses
- Finding the unpaired element in an array
- Finding a missing number in a range
- Finding two unique values among pairs
- Parity-based error detection and recovery

## mistakes
- Applying it when other values appear three times or an irregular number of times
- Forgetting to start the accumulator at zero
- Splitting by a bit that is not set in the combined XOR
- Expecting it to work on arbitrary non-integer elements without conversion

## interview
**Q:** How do you find the element that appears once when all others appear twice?
**A:** XOR all elements together. Equal pairs cancel to zero and zero is neutral, so the result is the unique element, using O(n) time and O(1) space.

**Q:** How can XOR find two unique numbers among pairs?
**A:** XOR everything to get the XOR of the two uniques, choose a set bit in it, partition the elements by that bit, and XOR each partition; the two results are the unique numbers.

**Q:** Why is XOR better than summing for the missing number problem?
**A:** The sum can overflow fixed-width integers for large n, while XOR never overflows and needs no arithmetic assumptions.

## summary
Because x XOR x is zero, XORing a whole collection cancels the pairs and leaves the odd one out. Split by a differing bit for two singles, and include the full range for a missing number, all in O(n) time and O(1) space.

## codenote
The Python sample finds a single, two singles and a missing number. The JavaScript sample finds the unique id.

## code
### python
```python
from functools import reduce
from operator import xor

print(reduce(xor, [4, 1, 2, 1, 2]))

def two_singles(values):
    combined = reduce(xor, values)
    low_bit = combined & -combined
    first = reduce(xor, [v for v in values if v & low_bit])
    second = reduce(xor, [v for v in values if not v & low_bit])
    return sorted((first, second))

print(two_singles([1, 2, 1, 3, 2, 5]))

numbers = [3, 0, 1]
print(reduce(xor, numbers) ^ reduce(xor, range(len(numbers) + 1)))
```
Output:
```text
4
[3, 5]
2
```
### javascript
```javascript
const ids = [101, 205, 101, 307, 205, 412, 307];
const unique = ids.reduce((acc, id) => acc ^ id, 0);
console.log(unique);
```
Output:
```text
412
```

## quiz
1. Why does XORing all elements find the single number?
   - [ ] It sorts the array
   - [x] Equal pairs cancel to zero and zero is neutral
   - [ ] It sums the elements
   - [ ] It finds the largest value
   > x XOR x is 0 and x XOR 0 is x.
2. What is the extra space of the XOR solution?
   - [ ] O(n)
   - [x] O(1)
   - [ ] O(log n)
   - [ ] O(n squared)
   > Only an accumulator is needed.
3. How do you separate two unique numbers a and b?
   - [ ] Sort the array
   - [x] Use a set bit of a XOR b to split the elements into two groups
   - [ ] Add them
   - [ ] Use a hash map only
   > The bit differs between a and b, placing them in different groups.
4. What is the missing number in [3, 0, 1] drawn from 0 to 3?
   - [ ] 0
   - [ ] 1
   - [x] 2
   - [ ] 3
   > It is the only value from the range that does not appear.
