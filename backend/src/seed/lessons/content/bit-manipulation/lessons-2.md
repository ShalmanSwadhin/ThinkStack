# Bitmask Subsets
kind: algorithm
time: O(2ⁿ · n) to enumerate all subsets of n items and process each one; enumerating all submasks of a mask with k set bits costs O(2ᵏ), and over all masks the total is O(3ⁿ).
space: O(1) extra for the enumeration itself, since each subset is just an integer; O(n) if a subset is materialised as a list.

## intro
A set of up to a few dozen items can be stored in one integer, with bit i telling whether item i is in the set. Counting from 0 to 2ⁿ − 1 then visits every subset exactly once. This simple loop is the basis of brute-force subset search, of dynamic programming over subsets and of many contest and interview solutions.

## theory
Representation: for n items numbered 0 to n − 1, the integer `mask` stands for the subset containing item i exactly when bit i of the mask is 1. The empty set is 0 and the full set is `(1 << n) - 1`. There are 2ⁿ masks, so n is practical up to about 20 for enumeration with work per subset, and up to about 25 to 30 for lighter processing.

Enumerating all subsets: `for mask in range(1 << n)`, and for each mask collect the items whose bit is set: `[items[i] for i in range(n) if mask >> i & 1]`. For `["a", "b", "c"]` the masks 0 to 7 give the subsets in this order: empty, a, b, ab, c, ac, bc, abc, which follows the binary counting pattern and is not the same order as the recursive backtracking enumeration.

Set operations on masks, each one instruction:

- Union: `a | b`; intersection: `a & b`; difference: `a & ~b`; symmetric difference: `a ^ b`
- Membership: `mask >> i & 1`; add item: `mask | (1 << i)`; remove item: `mask & ~(1 << i)`
- Size: the number of set bits; complement within the universe: `full ^ mask`
- Subset test: `a & b == a` means a is a subset of b

Enumerating the submasks of a given mask (the non-empty subsets of a subset): start with `sub = mask` and repeat `sub = (sub - 1) & mask` until it reaches 0, handling 0 separately if wanted. Subtracting one flips the lowest set bit and the zeros below it, and AND with the mask discards the bits that are not allowed. For mask `101` the submasks are `101`, `100`, `001` and `000`, in decreasing order. Summing over all masks, the total number of (mask, submask) pairs is 3ⁿ, because each item is in neither, in the mask only, or in both.

Typical problems:

- Subset sum, partition and knapsack for small n by checking each mask
- Finding the best group of items under constraints, such as the largest set with no conflicting pair, by testing each mask against a conflict mask
- Generating power sets, combinations of a given size (filter by popcount) and permutations by dynamic programming over masks
- Tracking which items have been used in a search state

Alternatives: recursion with backtracking generates the same subsets without the integer encoding, and avoids the 32 or 64-bit width limit, but masks make state compact and easily storable in arrays and dictionaries.

## explain
1. Index the items from 0 to n − 1 and check that n is small enough for 2ⁿ states.
2. Loop over every mask from 0 to 2ⁿ − 1.
3. For each mask decode the chosen items with a shift and AND, or compute what you need directly with bit operations.
4. Apply the test or accumulate the total for the subset.
5. For nested subsets use the submask recurrence.
6. Compare with the recursive version on small input to validate.

## example
The Python function lists all eight subsets of `["a", "b", "c"]` in mask order. Enumerating the submasks of 5 (binary 101) with `sub = (sub - 1) & mask` yields `[5, 4, 1, 0]`. The JavaScript program counts the subsets of `[1, 2, 3, 4]` whose sum equals 5 by trying all 16 masks and finds 2, namely the subsets with 1 and 4 and with 2 and 3.

## real
Scheduling, team selection with conflicts, set cover on small universes and puzzle solvers use bitmask enumeration, and bitboards in chess engines are a 64-item bitmask of the squares.

## pros
- One integer per subset, with set operations in single instructions
- Visits all subsets without recursion
- Compact, hashable states for dynamic programming

## cons
- Exponential in the number of items
- Limited by the word width unless big integers are used
- Bit-level code is harder to read than set operations

## uses
- Brute-force search over small sets of choices
- Subset sum and partition checks for few items
- Representing visited sets in dynamic programming
- Chess bitboards and similar compact set encodings

## mistakes
- Using it for n beyond about 25 and expecting fast results
- Forgetting the empty set or the full set in the range
- Starting the submask loop incorrectly and skipping the mask itself
- Overflowing a 32-bit integer in languages with fixed width

## interview
**Q:** How do you enumerate all subsets of an n-element set with bit manipulation?
**A:** Loop the integer mask from 0 to 2 to the n minus 1; the set bits of each mask mark which elements are in that subset.

**Q:** How do you iterate over the submasks of a mask?
**A:** Start with the mask itself and repeatedly compute sub equal to (sub minus 1) AND mask until it becomes zero, then process zero if the empty subset is needed.

**Q:** What is the total number of submask pairs over all masks of n bits?
**A:** 3 to the n, because each element is independently excluded from the mask, included in the mask only, or included in both the mask and the submask.

## summary
Encode subsets as bitmasks, count from 0 to 2ⁿ − 1 to visit them all, use bit operations for set algebra and the submask recurrence for nested subsets. It is exact and compact but limited to small n.

## codenote
The Python sample lists subsets and submasks. The JavaScript sample counts subsets with a given sum.

## code
### python
```python
def subsets(items):
    n = len(items)
    return [[items[i] for i in range(n) if mask >> i & 1] for mask in range(1 << n)]

print(subsets(["a", "b", "c"]))

mask, sub, found = 0b101, 0b101, []
while True:
    found.append(sub)
    if sub == 0:
        break
    sub = (sub - 1) & mask
print(found)
```
Output:
```text
[[], ['a'], ['b'], ['a', 'b'], ['c'], ['a', 'c'], ['b', 'c'], ['a', 'b', 'c']]
[5, 4, 1, 0]
```
### javascript
```javascript
const values = [1, 2, 3, 4];
const target = 5;
let matches = 0;

for (let mask = 0; mask < 1 << values.length; mask++) {
  let sum = 0;
  for (let i = 0; i < values.length; i++) {
    if ((mask >> i) & 1) sum += values[i];
  }
  if (sum === target) matches++;
}
console.log(matches, 1 << values.length);
```
Output:
```text
2 16
```

## quiz
1. How many subsets does a set of n elements have?
   - [ ] n
   - [ ] n squared
   - [x] 2 to the power n
   - [ ] n factorial
   > Each element is either in or out.
2. What does a set bit i in a mask mean?
   - [ ] The i-th subset
   - [x] Element i belongs to the subset
   - [ ] Element i is missing
   - [ ] The subset has i elements
   > The mask is an indicator vector.
3. What is the recurrence for iterating over submasks of a mask?
   - [ ] sub equals sub plus 1
   - [x] sub equals (sub minus 1) AND mask
   - [ ] sub equals sub OR mask
   - [ ] sub equals mask XOR sub
   > It steps down through all subsets of the set bits.
4. Roughly up to what n is enumerating all subsets practical with work per subset?
   - [ ] 5
   - [ ] 10,000
   - [x] About 20 to 25
   - [ ] 1,000
   > The count doubles with every extra element.

# Bit Manipulation in DP
kind: algorithm
time: O(2ⁿ · n) for the assignment example with n workers and jobs, because each of the 2ⁿ masks tries n jobs; the general pattern costs states times transitions.
space: O(2ⁿ) for the table indexed by mask.

## intro
When a problem asks for the best way to use each of a small number of items exactly once, the state of the search can be a bitmask of which items are already used. Bitmask dynamic programming replaces an n! brute force over orderings with 2ⁿ states, which turns an impossible computation at n = 15 into a feasible one.

## theory
The idea: define `dp[mask]` as the best value achievable for the set of items in `mask`, where the meaning of the value is problem specific. Fill the table in increasing mask order, which guarantees that every smaller subset is complete before it is needed: a mask is always larger than any of its proper submasks.

Transitions typically add one item: from `mask`, for every item `i` not in the mask, update `dp[mask | (1 << i)]` with the best of its current value and `dp[mask] + cost(...)`. The number of states is 2ⁿ and each has up to n transitions, so the total is O(2ⁿ · n) (or O(2ⁿ · n²) when the cost depends on the last item as well).

Classic problems:

- Assignment problem: assign n workers to n jobs, each job once, minimising total cost. `dp[mask]` is the cheapest way to give the first popcount(mask) workers the jobs in mask; the next worker is determined by the number of set bits. For the cost matrix `[[9, 2, 7], [6, 4, 3], [5, 8, 1]]` the best total is 9.
- Travelling salesman (Held-Karp): `dp[mask][last]` is the shortest path that visits the cities in mask and ends at last, giving O(2ⁿ · n²) instead of O(n!). Practical up to about n = 20.
- Hamiltonian path existence: `dp[mask]` is the set of vertices at which a path visiting exactly the vertices in mask can end
- Partitioning into groups, scheduling with dependencies, covering a set with the fewest subsets, and counting arrangements under constraints
- Subset sums and partitions of small sets
- Profile DP on grids (broken profile), where the mask records a row's boundary state

Implementation tips: precompute popcounts or compute them with `int.bit_count`; use `1 << n` states in an array; initialise unreachable states to infinity or false; iterate masks in increasing order; iterate over unset bits with `~mask & full`; and use `mask & -mask` to extract the lowest bit. For memory limits, store only what is required (for example, only masks of the current popcount).

Limits: n above about 20 to 25 is too large for time and memory; for larger sizes use heuristics, branch and bound, or algorithms specific to the problem such as the Hungarian algorithm for assignment (O(n³)).

## explain
1. Decide what the mask represents and what dp[mask] stores.
2. Choose the base case, usually dp[0] equal to the identity of the optimisation.
3. Order the computation by increasing mask.
4. For each mask, loop over the items not yet used and relax the next state.
5. Read the answer from the full mask.
6. Check against a brute-force permutation search on tiny inputs.

## example
The Python function `min_assignment` fills `dp` over 8 masks for a 3 by 3 cost matrix. The number of workers already assigned is the popcount of the mask, so the next worker's cost for each unused job is added. The final entry is 9, from worker 0 on job 1 (cost 2), worker 1 on job 0 (6) and worker 2 on job 2 (1). The JavaScript function checks for a Hamiltonian path with a mask table: a chain of four vertices has one and a star with three leaves does not.

## real
Route planning for a handful of stops, tournament and schedule construction, exact set cover on small instances and puzzle solvers use bitmask dynamic programming, and it is a staple of contest problems.

## pros
- Turns factorial searches into exponential ones with fewer states
- Compact state and fast transitions
- Systematic recipe that applies to many problems

## cons
- Still exponential, so limited to about 20 items
- Memory grows as 2 to the n
- Needs a careful definition of the state

## uses
- Assignment and matching on small sets
- Travelling salesman for few cities
- Path existence and covering problems
- Counting arrangements under constraints

## mistakes
- Defining a state that does not capture everything needed for later decisions
- Filling the table in an order where dependencies are not ready
- Forgetting to initialise unreachable states
- Using it for sizes where 2 to the n is too large

## interview
**Q:** What does dp[mask] represent in bitmask dynamic programming?
**A:** The best value (cost, count or feasibility) for having processed exactly the set of items whose bits are set in the mask, with transitions that add one item at a time.

**Q:** What is the complexity of the Held-Karp algorithm for the travelling salesman problem?
**A:** O(2 to the n times n squared) time and O(2 to the n times n) space, far better than the n factorial of brute force, but still exponential.

**Q:** Why can the table be filled in increasing order of the mask?
**A:** Every transition goes from a mask to a larger one by setting an extra bit, so all smaller states are finished before they are used.

## summary
Bitmask dynamic programming indexes states by the set of used items, fills them in increasing mask order and answers from the full mask. It lowers factorial searches to exponential ones, which suffices for about 20 items.

## codenote
The Python sample solves a small assignment problem. The JavaScript sample checks Hamiltonian paths with a mask table.

## code
### python
```python
def min_assignment(cost):
    n = len(cost)
    inf = float("inf")
    dp = [inf] * (1 << n)
    dp[0] = 0
    for mask in range(1 << n):
        worker = mask.bit_count()
        if worker >= n or dp[mask] == inf:
            continue
        for job in range(n):
            if not (mask >> job) & 1:
                nxt = mask | (1 << job)
                dp[nxt] = min(dp[nxt], dp[mask] + cost[worker][job])
    return dp[-1]

print(min_assignment([[9, 2, 7], [6, 4, 3], [5, 8, 1]]))
```
Output:
```text
9
```
### javascript
```javascript
function hasHamiltonianPath(n, edges) {
  const adjacent = Array(n).fill(0);
  for (const [a, b] of edges) {
    adjacent[a] |= 1 << b;
    adjacent[b] |= 1 << a;
  }
  const ends = Array(1 << n).fill(0);
  for (let v = 0; v < n; v++) ends[1 << v] = 1 << v;

  for (let mask = 1; mask < 1 << n; mask++) {
    for (let last = 0; last < n; last++) {
      if (!((ends[mask] >> last) & 1)) continue;
      for (let next = 0; next < n; next++) {
        if (((adjacent[last] >> next) & 1) && !((mask >> next) & 1)) {
          ends[mask | (1 << next)] |= 1 << next;
        }
      }
    }
  }
  return ends[(1 << n) - 1] !== 0;
}

console.log(hasHamiltonianPath(4, [[0, 1], [1, 2], [2, 3]]));
console.log(hasHamiltonianPath(4, [[0, 1], [0, 2], [0, 3]]));
```
Output:
```text
true
false
```

## quiz
1. What does the mask index in bitmask dynamic programming?
   - [ ] The position in a string
   - [x] The set of items already used
   - [ ] The number of iterations
   - [ ] A hash of the input
   > Each state is a subset of the items.
2. What is the complexity of the assignment DP for n workers and jobs?
   - [ ] O(n factorial)
   - [x] O(2 to the n times n)
   - [ ] O(n cubed)
   - [ ] O(n)
   > There are 2 to the n states with n transitions each.
3. Why can masks be processed in increasing numeric order?
   - [ ] Because bits are sorted
   - [x] A transition adds a bit, so each successor mask is larger than its predecessor
   - [ ] Because dp is an array
   - [ ] Because of recursion
   > Smaller states are always complete first.
4. For roughly how many items does the technique stop being practical?
   - [ ] 5
   - [ ] 10
   - [x] 20 to 25
   - [ ] 100
   > The table has 2 to the n entries.

# Endianness
kind: concept
time: Not applicable — byte order concerns how multi-byte values are laid out in memory and on the wire, not an algorithm's growth; swapping the bytes of a word is a single instruction.
space: Not applicable — the same number of bytes is used in either order.

## intro
A 32-bit number occupies four bytes, and the question is which byte comes first. Endianness is the answer a machine or a protocol gives: big-endian puts the most significant byte first, little-endian puts it last. Getting it wrong turns the number 1 into 16,777,216 when data crosses between systems.

## theory
For the value `0x12345678` stored in four bytes:

- Big-endian: the bytes appear as `12 34 56 78`, most significant first, like writing digits left to right. Used by network protocols ("network byte order"), many file formats and older processor families (SPARC, PowerPC in classic mode, Motorola 68000).
- Little-endian: the bytes appear as `78 56 34 12`, least significant first. Used by x86, x86-64, and by ARM in its usual configuration, so most computers today are little-endian.
- Bi-endian processors can be configured for either

The names come from Gulliver's Travels, where factions disagreed on which end of an egg to crack. Neither order is better; little-endian makes it easy to treat a number as a smaller width by reading its first bytes, and big-endian matches the way people read numbers and makes memory dumps easier to read.

Where it matters:

- Network protocols: IP, TCP and many others specify big-endian fields, so programs convert with functions such as `htons`, `htonl`, `ntohs` and `ntohl` (host to network and back)
- Binary file formats: each format fixes its byte order, for example PNG and Java class files are big-endian while BMP and WAV are little-endian
- Reading raw memory or hardware registers, casting a byte buffer to an integer pointer in C, and inter-language data exchange
- Serialisation libraries: they choose a byte order explicitly, or use a text format to avoid the issue

Endianness affects the order of bytes, never the order of bits inside a byte, and it does not change the arithmetic on a value in a register; it appears only when a value is viewed as bytes. Single-byte data (characters in ASCII or UTF-8 text) has no order issue, but UTF-16 and UTF-32 do, which is why a byte order mark can precede them.

Detecting the host's order: store a known multi-byte value and inspect its first byte; Python has `sys.byteorder`; JavaScript typed arrays use the platform order, while `DataView` takes an explicit flag for each access, which is the portable approach.

Best practice: always specify the byte order of stored and transmitted data, convert at the boundaries and never rely on casting memory between types for portable data.

## explain
1. Identify where a value is turned into bytes or bytes into a value.
2. Look up the specified byte order of the format or protocol.
3. Use explicit conversion functions that take the order as a parameter.
4. Convert multi-byte fields individually, never the whole buffer.
5. Test with a known value whose bytes are all different, such as 0x12345678.
6. Check the byte order of the hardware only when interfacing at the lowest level.

## example
In Python, `(0x12345678).to_bytes(4, "big").hex()` is `'12345678'` and with `"little"` it is `'78563412'`. Reading the little-endian bytes back with `int.from_bytes` restores the number, and `struct.pack(">I", 1)` gives `00000001` while `"<I"` gives `01000000`. In JavaScript, a `DataView` writes the same value with the little-endian flag false or true and the bytes read back as `12345678` and `78563412`.

## real
Packets on the internet are big-endian on the wire, so every network stack converts integers when sending and receiving, and image and audio tools handle both orders when reading files from different platforms.

## pros
- Explicit byte orders make data portable
- Standard conversion functions exist in every platform
- Little-endian allows cheap reading of narrower values from the start of a number

## cons
- Mixing orders silently corrupts numbers
- Byte-order bugs appear only when data crosses machines
- Both orders are in common use

## uses
- Implementing network protocols
- Reading and writing binary file formats
- Exchanging data between machines and languages
- Debugging memory dumps

## mistakes
- Casting a byte buffer to an integer pointer and assuming a byte order
- Forgetting to convert multi-byte fields from network order
- Swapping the bytes of single-byte fields
- Assuming bit order inside a byte changes with endianness

## interview
**Q:** What is the difference between big-endian and little-endian?
**A:** Big-endian stores the most significant byte of a multi-byte value at the lowest address, little-endian stores the least significant byte there. The value 0x12345678 appears as 12 34 56 78 in the first and 78 56 34 12 in the second.

**Q:** What is network byte order?
**A:** Big-endian, the order mandated for multi-byte fields in internet protocols; programs convert with functions such as htonl and ntohl.

**Q:** How do you handle endianness portably in code?
**A:** Specify the byte order of the data format explicitly and use conversion routines or APIs that take the order as a parameter instead of reinterpreting memory.

## summary
Endianness is the byte order of multi-byte values in memory or on the wire: most significant first (big) or last (little). Always fix the order of stored and transmitted data and convert explicitly at the boundaries.

## codenote
The Python sample converts the same number to bytes in both orders and back. The JavaScript sample uses DataView with an explicit flag.

## code
### python
```python
import struct

value = 0x12345678
print(value.to_bytes(4, "big").hex(), value.to_bytes(4, "little").hex())
print(int.from_bytes(bytes.fromhex("78563412"), "little") == value)
print(struct.pack(">I", 1).hex(), struct.pack("<I", 1).hex())
```
Output:
```text
12345678 78563412
True
00000001 01000000
```
### javascript
```javascript
const view = new DataView(new ArrayBuffer(4));
const hex = () => [...new Uint8Array(view.buffer)].map((b) => b.toString(16).padStart(2, "0")).join("");

view.setUint32(0, 0x12345678, false);
console.log(hex());
view.setUint32(0, 0x12345678, true);
console.log(hex());
```
Output:
```text
12345678
78563412
```

## quiz
1. How is 0x12345678 laid out in big-endian memory?
   - [ ] 78 56 34 12
   - [x] 12 34 56 78
   - [ ] 21 43 65 87
   - [ ] 87 65 43 21
   > The most significant byte comes first.
2. Which byte order do internet protocols use?
   - [ ] Little-endian
   - [x] Big-endian, known as network byte order
   - [ ] Random order
   - [ ] Whatever the sender uses
   > Fields are converted with htons and htonl on little-endian hosts.
3. Does endianness change the order of bits within a byte?
   - [ ] Yes
   - [x] No, only the order of bytes
   - [ ] Only for signed values
   - [ ] Only for text
   > A byte is the unit that is ordered.
4. What is the portable way to read a multi-byte integer from a buffer?
   - [ ] Cast the buffer to an integer pointer
   - [x] Use a routine that takes the byte order explicitly
   - [ ] Reverse all bytes always
   - [ ] Use the host order
   > Explicit conversion avoids dependence on the machine.

# Bit Tricks for Interviews
kind: algorithm
time: O(1) for the single-word tricks such as isolating the lowest set bit or the sign test; O(w) for reversing the bits of a w-bit word with a simple loop; O(n) for the Gray code of the numbers 0 to n − 1.
space: O(1) extra space for the tricks; the Gray sequence of n numbers needs O(n) to store.

## intro
A small collection of bit identities turns up again and again in interviews and in low-level code. None is deep on its own, but each replaces a loop or a branch with an expression, and recognising them quickly is useful. This lesson collects the most useful ones, each with the reason it works.

## theory
The toolbox:

- Isolate the lowest set bit: `n & -n`. In two's complement, `-n` is `~n + 1`, which flips all bits above the lowest set bit and keeps that bit and the zeros below it; ANDing leaves just that bit. For 40 (`101000`) the result is 8.
- Clear the lowest set bit: `n & (n - 1)`. For 40 it gives 32.
- Test for a power of two: `n > 0 and n & (n - 1) == 0`
- Check whether two integers have opposite signs: `(a ^ b) < 0`, since the sign bit of the XOR is 1 exactly when the signs differ
- Absolute value without a branch (32-bit): `(x ^ (x >> 31)) - (x >> 31)`, where `x >> 31` is 0 for non-negatives and −1 (all ones) for negatives
- Minimum and maximum without branches: `y ^ ((x ^ y) & -(x < y))`, mainly of historical interest since compilers do better
- Swap two variables with XOR (a curiosity; prefer tuple assignment)
- Gray code: `n ^ (n >> 1)`. Consecutive Gray codes differ in exactly one bit: 0, 1, 3, 2, 6, 7, 5, 4 for the numbers 0 to 7. Used in rotary encoders, error reduction in hardware and in Karnaugh maps.
- Reverse the bits of a word: loop shifting bits out of one end and into the other, or use lookup tables and the divide-and-conquer swap of halves, quarters and so on
- Rounding up to a multiple of a power of two a: `(x + a - 1) & ~(a - 1)`
- Parity of the number of set bits: fold with XOR: `x ^= x >> 16; x ^= x >> 8; x ^= x >> 4; x ^= x >> 2; x ^= x >> 1; x & 1`
- Set the lowest zero bit: `n | (n + 1)`; clear the trailing ones: `n & (n + 1)`
- Extract the rightmost zero bit: `~n & (n + 1)`
- Subset enumeration with `(sub - 1) & mask`
- Check if two numbers differ by exactly one bit: `x ^ y` is a power of two
- Count the bits that must change to turn one number into another: popcount of the XOR

In interviews: explain each trick with a short example, mention that clarity matters more than cleverness in production code, state the word width assumed, and handle negative numbers and zero.

When not to use them: when a readable arithmetic or library expression is just as fast, since compilers optimise `x % 2` and `x * 8` automatically; use tricks where they express a bit-level idea or where speed in a hot path is measured.

## explain
1. Write the number in binary and apply the trick by hand to confirm it.
2. Reason about what each operator does to the lowest set bit and to the bits above and below it.
3. State the assumptions: width, signed or unsigned.
4. Check zero and negative inputs.
5. Prefer the readable form unless the bit-level form is the point.
6. Test with a few values and compare with the straightforward implementation.

## example
For 40, the Python lines isolate the lowest set bit as 8 and clear it to leave 32. The Gray codes for 0 to 7 are `[0, 1, 3, 2, 6, 7, 5, 4]`, and each differs from the previous in a single bit. Reversing the 8-bit pattern of 6 (`00000110`) gives `01100000`, which is 96. The JavaScript lines test the opposite signs of 3 and −5, find the absolute value of −7 without a branch and check that two numbers differ in exactly one bit.

## real
Embedded and graphics code use these identities in tight loops, Gray codes encode positions in mechanical sensors, and interviewers ask for them to test fluency with two's complement and bit operators.

## pros
- Compact expressions that replace loops and branches
- Each has a short explanation in terms of two's complement
- Useful building blocks for larger bit algorithms

## cons
- Obscure to readers who do not know them
- Often no faster than what the compiler already generates
- Assumptions about width and sign must be stated

## uses
- Isolating and clearing bits quickly
- Generating Gray code sequences
- Comparing signs and computing absolute values without branches
- Reversing bits and aligning sizes

## mistakes
- Using the tricks on a width other than the one assumed
- Forgetting that n AND minus n is zero for zero
- Applying branchless tricks to clarity-critical code
- Misreading precedence in the combined expressions

## interview
**Q:** How do you isolate the lowest set bit of n?
**A:** Compute n AND minus n. In two's complement minus n flips every bit above the lowest set bit and keeps that bit, so the AND leaves only the lowest set bit.

**Q:** What is a Gray code and how do you compute it?
**A:** A sequence in which consecutive numbers differ in exactly one bit. The Gray code of n is n XOR (n shifted right by one).

**Q:** How can you tell whether two integers differ in exactly one bit?
**A:** XOR them and check that the result is a power of two, meaning it has exactly one set bit.

## summary
A few identities cover most bit puzzles: n AND minus n isolates the lowest bit, n AND n minus one clears it, XOR detects sign and bit differences, and n XOR (n shifted right) gives Gray code. Know why each works and state the width you assume.

## codenote
The Python sample isolates and clears the lowest bit, builds Gray codes and reverses bits. The JavaScript sample tests signs, absolute value and a one-bit difference.

## code
### python
```python
n = 40
print(n & -n, n & (n - 1))
print([i ^ (i >> 1) for i in range(8)])

def reverse_bits(value, width):
    result = 0
    for _ in range(width):
        result = (result << 1) | (value & 1)
        value >>= 1
    return result

print(format(reverse_bits(0b00000110, 8), "08b"), reverse_bits(0b00000110, 8))
```
Output:
```text
8 32
[0, 1, 3, 2, 6, 7, 5, 4]
01100000 96
```
### javascript
```javascript
const oppositeSigns = (a, b) => (a ^ b) < 0;
const abs = (x) => (x ^ (x >> 31)) - (x >> 31);
const differByOneBit = (a, b) => {
  const diff = a ^ b;
  return diff !== 0 && (diff & (diff - 1)) === 0;
};

console.log(oppositeSigns(3, -5), oppositeSigns(3, 5));
console.log(abs(-7), abs(7));
console.log(differByOneBit(8, 10), differByOneBit(8, 11));
```
Output:
```text
true false
7 7
true false
```

## quiz
1. What does n AND minus n produce?
   - [ ] The highest set bit
   - [x] The lowest set bit
   - [ ] Zero
   - [ ] The number of set bits
   > Negation flips all bits above the lowest set bit.
2. How do you compute the Gray code of n?
   - [ ] n AND (n shifted right by one)
   - [x] n XOR (n shifted right by one)
   - [ ] n OR (n shifted left by one)
   - [ ] NOT n
   > Neighbouring values differ by a single bit.
3. How do you test whether two numbers have opposite signs?
   - [ ] a AND b is negative
   - [x] a XOR b is negative
   - [ ] a OR b is zero
   - [ ] a minus b is positive
   > The sign bit of the XOR is 1 when the sign bits differ.
4. Why use the tricks sparingly in production code?
   - [ ] They are always slower
   - [x] They are cryptic and compilers often generate equally fast code from readable expressions
   - [ ] They do not work on integers
   - [ ] They cause overflow always
   > Clarity matters unless the bit-level idea itself is the point.

# Bit Manipulation Pitfalls
kind: concept
time: Not applicable — this lesson lists the correctness traps around bit operations; none of them is about running time.
space: Not applicable — the traps concern values and widths, not memory use.

## intro
Bit manipulation looks simple and goes wrong in surprising ways: operators that bind differently than you expect, shifts that wrap, signs that creep in, and integer widths that change silently. Most bugs come from a short list of causes, and knowing them in advance turns hours of debugging into a quick review checklist.

## theory
The main pitfalls:

- Operator precedence. In C, C++, Java and JavaScript, comparison and equality operators bind tighter than `&`, `^` and `|`, so `x & 1 == 0` parses as `x & (1 == 0)`. The shifts bind looser than `+` and `-`, so `1 << n + 1` is `1 << (n + 1)`. Python orders comparisons below the bitwise operators, but parentheses keep code portable and readable. Always parenthesise.
- Bitwise versus logical operators: `&` and `|` evaluate both operands and work bit by bit, while `&&` and `||` short-circuit on truth values. Using `&` where `&&` was meant gives surprising results for values other than 0 and 1, such as `2 & 1` being 0.
- Signed shifts and sign extension. Right shift of a negative number keeps the sign in Python, Java and JavaScript (`>>`), so a loop that shifts until the value is zero never ends for negatives (in Python `-1 >> 100` is still −1). In C, right shift of a negative signed value is implementation-defined and left shift into the sign bit is undefined.
- Shift counts beyond the width. In C the behavior is undefined when the count is at least the width; in JavaScript the count is reduced modulo 32, so `1 << 32` is 1; Java reduces modulo 32 or 64 depending on the type.
- Fixed width conversions. JavaScript converts operands to 32-bit signed integers: `2 ** 32 | 0` is 0, `2 ** 31 | 0` is −2147483648 and `~~-3.7` truncates to −3 (unlike `Math.floor`, which gives −4). Values beyond 32 bits lose their high bits silently; use BigInt.
- Python's unlimited integers. `~5` is −6, not a 32-bit pattern, so to see the fixed-width result mask it: `~5 & 0xFF` is 250. Results of `<<` never overflow, so code ported from C may behave differently.
- Integer promotion and mixing signed and unsigned types in C: comparing a signed negative value with an unsigned one converts the negative to a huge unsigned number
- Endianness and byte order when casting memory
- Using bit tricks on floating-point numbers by mistake, since bit operators apply to integers (JavaScript silently truncates floats)
- Forgetting the width when inverting: `~mask` in a language with fixed-width types flips unused high bits too, which can be harmful when comparing or storing
- Off-by-one in bit positions: bits are numbered from 0 at the least significant end, and `1 << n` sets bit n, which is the (n + 1)-th bit
- Overflow of the mask itself: `1 << 31` in a signed 32-bit type is negative, and `1 << 63` in a 64-bit signed type is the sign bit

Defensive practices: name masks and widths with constants, add comments for non-obvious tricks, use unsigned types in C, use BigInt or explicit masking in JavaScript and Python, write tests with extreme values (0, 1, −1, the maximum and minimum), and run compilers with warnings and sanitizers enabled to catch undefined shifts.

## explain
1. Parenthesise every bitwise sub-expression inside comparisons and arithmetic.
2. Decide the integer width and signedness for each value and write it down.
3. Choose arithmetic or logical shift deliberately; use unsigned types or masking for logical behavior.
4. Mask results to the intended width after `~` and left shifts.
5. Keep shift counts below the width.
6. Test with 0, 1, −1, the extreme values and values with the highest bit set.

## example
In Python, `~5` is −6 and `~5 & 0xFF` is 250, while `-1 >> 100` stays −1, which would make a shift-until-zero loop run forever without a width guard. In JavaScript, `~~-3.7` is −3 but `Math.floor(-3.7)` is −4, `2 ** 32 | 0` is 0 and `2 ** 31 | 0` is −2147483648, showing the 32-bit conversion at work. The sample prints these values side by side.

## real
Security bugs, protocol parsing errors and hard-to-reproduce numeric glitches often trace to one of these pitfalls, and coding standards for C and embedded systems have rules against signed shifts and unparenthesised bit expressions.

## pros
- A short checklist catches most mistakes
- Tests on extreme values expose width and sign problems
- Compiler warnings and sanitizers find many cases automatically

## cons
- Behavior differs between languages, so experience does not transfer
- Some pitfalls produce wrong results silently
- Undefined behavior in C can appear to work until the compiler changes

## uses
- Reviewing code that uses masks and shifts
- Porting bit-level code between languages
- Writing tests for low-level utilities
- Teaching safe habits for bit manipulation

## mistakes
- Relying on right shift of a negative number to reach zero
- Using 32-bit JavaScript operators on larger values
- Mixing signed and unsigned comparisons in C
- Leaving out parentheses around bitwise expressions

## interview
**Q:** Why is x & 1 == 0 a bug in C and JavaScript?
**A:** Because the equality operator has higher precedence than bitwise AND, so it is parsed as x AND (1 equals 0), which is always zero; the correct form is (x AND 1) equals 0.

**Q:** What happens when you shift by an amount equal to or greater than the width of the type?
**A:** In C it is undefined behavior, and in JavaScript the count is taken modulo 32, so shifting 1 left by 32 gives 1. Always keep the count below the width.

**Q:** Why does Python's bitwise NOT of 5 give minus 6?
**A:** Python integers behave as if they had infinitely many sign bits, so inverting every bit gives minus x minus one; mask with the desired width to see a fixed-width pattern.

## summary
Parenthesise bit expressions, know the width and signedness of every value, keep shifts within the width, mask after inversion and remember language differences: 32-bit operators in JavaScript, unlimited integers in Python, undefined shifts in C.

## codenote
The Python sample shows unlimited-width behavior of NOT and arithmetic shifts. The JavaScript sample shows 32-bit conversions and truncation.

## code
### python
```python
print(~5, ~5 & 0xFF, -1 >> 100)

steps = 0
value = -8
while value != 0 and steps < 10:
    value >>= 1
    steps += 1
print(value, steps)
```
Output:
```text
-6 250 -1
-1 10
```
### javascript
```javascript
console.log(~~-3.7, Math.floor(-3.7));
console.log(2 ** 32 | 0, 2 ** 31 | 0);
```
Output:
```text
-3 -4
0 -2147483648
```

## quiz
1. How is x & 1 == 0 parsed in C and JavaScript?
   - [ ] (x & 1) == 0
   - [x] x & (1 == 0)
   - [ ] x == (1 & 0)
   - [ ] It is a syntax error
   > Equality binds tighter than bitwise AND there.
2. What is -1 >> 100 in Python?
   - [ ] 0
   - [x] -1
   - [ ] 1
   - [ ] An error
   > The arithmetic shift keeps filling with the sign bit.
3. Why does OR-ing 2 to the power 32 with zero give 0 in JavaScript?
   - [ ] Because the power is wrong
   - [x] Bitwise operators convert operands to 32-bit integers, dropping the high bits
   - [ ] Because OR with zero clears it
   - [ ] Because of floating-point rounding
   > Only the low 32 bits survive the conversion.
4. What do you do to view a fixed-width pattern of a negative number in Python?
   - [ ] Use bin directly
   - [x] Mask it with the width, for example AND 0xFF
   - [ ] Multiply by 2
   - [ ] Convert it to a float
   > Masking selects the low bits of the two's complement pattern.
