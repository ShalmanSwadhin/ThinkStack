# Strassen Matrix Multiplication
kind: algorithm
time: O(n^2.81), more precisely O(n^(log₂ 7)), compared with O(n^3) for the schoolbook algorithm, because each level of recursion uses 7 half-sized multiplications instead of 8.
space: O(n^2) for the temporary submatrices created at each level of the recursion.

## intro
Multiplying two n by n matrices with the schoolbook method takes n cubed multiplications. In 1969 Volker Strassen showed that two 2 by 2 matrices can be multiplied with only 7 multiplications instead of 8, and applying this trick recursively on blocks lowers the exponent from 3 to about 2.81. It is a landmark example of divide and conquer beating an obvious bound.

## theory
Block decomposition. Split each n by n matrix into four n/2 by n/2 blocks: `A = [[a, b], [c, d]]` and `B = [[e, f], [g, h]]`. The product `C = A · B` has blocks `ae + bg`, `af + bh`, `ce + dg` and `cf + dh`. Computing these directly needs 8 multiplications of half-sized blocks and some additions, so T(n) = 8T(n/2) + O(n^2), which solves to O(n^3), no better than the schoolbook method.

Strassen's seven products:

- `p1 = a(f − h)`
- `p2 = (a + b)h`
- `p3 = (c + d)e`
- `p4 = d(g − e)`
- `p5 = (a + d)(e + h)`
- `p6 = (b − d)(g + h)`
- `p7 = (a − c)(e + f)`

The result blocks are then `C11 = p5 + p4 − p2 + p6`, `C12 = p1 + p2`, `C21 = p3 + p4` and `C22 = p1 + p5 − p3 − p7`. Only additions and subtractions of blocks are needed beyond the seven multiplications; those cost O(n^2) per level.

Recurrence: T(n) = 7T(n/2) + O(n^2). With a = 7, b = 2 and d = 2, the critical exponent log₂ 7 ≈ 2.807 is larger than 2, so the leaves dominate, and the master theorem gives T(n) = O(n^2.807).

Check on the small case `[[1, 2], [3, 4]] × [[5, 6], [7, 8]]`: Strassen's formulas give `[[19, 22], [43, 50]]`, which equals the schoolbook result.

Counting the saving: with k levels of recursion, the schoolbook scheme uses 8^k scalar multiplications and Strassen uses 7^k. For k = 3 that is 512 against 343, and for k = 10 it is 1073741824 against 282475249, so the advantage grows quickly with matrix size.

Practical considerations:

- Matrix sizes should be powers of two; otherwise pad with zeros or peel off a row and a column
- The recursion has a large constant factor from the many additions and from extra memory, so real implementations switch to the ordinary algorithm below a cutoff, often a block size between 64 and 256
- Numerical stability is slightly worse than the schoolbook method, which matters for floating-point computation
- Highly tuned cache-aware libraries (BLAS) usually use the schoolbook method with blocking, because it parallelises and vectorises very well, and use Strassen-like methods only for very large matrices
- Asymptotically faster algorithms exist, such as Coppersmith-Winograd and its refinements with exponents near 2.37, but they are impractical because of their constants; the true exponent is an open research question

Related uses: Strassen-like ideas also speed up other matrix problems that reduce to multiplication, including matrix inversion, determinants, and some graph algorithms such as transitive closure.

Teaching value: it shows that the naive count of subproblems is not sacred. Reducing the number of recursive calls by one changes the exponent of the running time.

## explain
1. Split both matrices into four equal blocks.
2. Compute the seven products p1 to p7 recursively, each of half size.
3. Combine the products with additions and subtractions to form the four result blocks.
4. Assemble the blocks into the result matrix.
5. Below a cutoff size, use the standard algorithm.
6. Pad the matrices to a power of two when needed.

## example
The Python function multiplies the two 2 by 2 matrices using seven products and returns `[[19, 22], [43, 50]]`, the same as the ordinary product. The JavaScript program counts scalar multiplications at recursion depth 3 and 10: 512 and 343 at depth 3, and 1073741824 and 282475249 at depth 10, for the ordinary and Strassen's schemes.

## real
Scientific computing libraries sometimes use Strassen's algorithm for very large dense matrices, and the idea led to a long line of research on the complexity of linear algebra operations.

## pros
- Lower asymptotic cost than the schoolbook method
- Reuses the same divide and conquer pattern with fewer subproblems
- Basis for a large body of fast matrix algorithms

## cons
- Large constant factors and extra memory
- Slightly worse numerical stability
- Needs padding when sizes are not powers of two

## uses
- Multiplying very large dense matrices
- Speeding up related linear algebra routines
- Teaching how reducing subproblems changes complexity
- Studying the complexity of matrix operations

## mistakes
- Using it on small matrices where the schoolbook method is faster
- Forgetting to pad non-square or odd-sized matrices
- Mistyping the seven product formulas
- Ignoring numerical error in floating-point work

## interview
**Q:** How does Strassen's algorithm beat cubic time?
**A:** It multiplies 2 by 2 block matrices with 7 recursive multiplications instead of 8, giving T(n) = 7T(n/2) + O(n squared), which is O(n to the power log base 2 of 7), about n to the 2.81.

**Q:** Why do practical libraries not always use it?
**A:** The constant factors, extra memory and weaker numerical stability make it slower than blocked schoolbook multiplication for most matrix sizes, so a cutoff is used.

**Q:** What recurrence does ordinary block multiplication have?
**A:** T(n) = 8T(n/2) + O(n squared), which solves to O(n cubed), so no asymptotic gain.

## summary
Strassen's algorithm replaces eight block multiplications with seven, lowering the cost of matrix multiplication to O(n^2.81). It is practical only for large matrices, but it is the classic example of a divide and conquer improvement from cutting the number of subproblems.

## codenote
The Python sample multiplies two 2 by 2 matrices with seven products. The JavaScript sample counts multiplications for both schemes.

## code
### python
```python
def strassen_2x2(A, B):
    (a, b), (c, d) = A
    (e, f), (g, h) = B
    p1 = a * (f - h)
    p2 = (a + b) * h
    p3 = (c + d) * e
    p4 = d * (g - e)
    p5 = (a + d) * (e + h)
    p6 = (b - d) * (g + h)
    p7 = (a - c) * (e + f)
    return [[p5 + p4 - p2 + p6, p1 + p2], [p3 + p4, p1 + p5 - p3 - p7]]

print(strassen_2x2([[1, 2], [3, 4]], [[5, 6], [7, 8]]))
```
Output:
```text
[[19, 22], [43, 50]]
```
### javascript
```javascript
function multiplications(depth) {
  return [8 ** depth, 7 ** depth];
}

console.log(multiplications(3).join(" "), multiplications(10).join(" "));
```
Output:
```text
512 343 1073741824 282475249
```

## quiz
1. How many half-sized multiplications does Strassen's algorithm use?
   - [ ] Eight
   - [x] Seven
   - [ ] Six
   - [ ] Four
   > Seven products replace the eight of the direct block method.
2. What is the running time of Strassen's algorithm?
   - [ ] O(n squared)
   - [x] About O(n^2.81)
   - [ ] O(n cubed)
   - [ ] O(n log n)
   > The exponent is log base 2 of 7.
3. Why do real libraries switch to the schoolbook method for small blocks?
   - [ ] It is more accurate for large inputs
   - [x] Strassen's overhead outweighs its savings at small sizes
   - [ ] Strassen cannot multiply integers
   - [ ] Small matrices are always sparse
   > Extra additions and memory dominate for small sizes.
4. Which recurrence does ordinary block multiplication have?
   - [ ] T(n) = 7T(n/2) + n squared
   - [x] T(n) = 8T(n/2) + n squared
   - [ ] T(n) = 2T(n/2) + n
   - [ ] T(n) = T(n/2) + 1
   > Eight half-sized products give cubic time.

# Karatsuba Multiplication
kind: algorithm
time: O(n^1.58), more precisely O(n^(log₂ 3)) for two n-digit numbers, compared with O(n^2) for the schoolbook method, because three half-sized multiplications replace four.
space: O(n) for the intermediate numbers and the recursion.

## intro
Multiplying two n-digit numbers by hand takes about n squared single-digit multiplications. In 1960 Anatoly Karatsuba found that three multiplications of half-sized numbers are enough instead of four, which makes multiplication of large integers faster than quadratic. The trick is the same kind of saving that Strassen later found for matrices.

## theory
Split each number around the middle digit position: with base `B = 10^m`, write `x = a·B + b` and `y = c·B + d`, where a and c are the high halves and b and d the low halves. Then `x·y = ac·B^2 + (ad + bc)·B + bd`. Computing ac, ad, bc and bd directly needs four multiplications of half-sized numbers, giving T(n) = 4T(n/2) + O(n), which is O(n^2), no gain.

Karatsuba's observation: `(a + b)(c + d) = ac + ad + bc + bd`, so `ad + bc = (a + b)(c + d) − ac − bd`. Thus three half-sized multiplications suffice: `ac`, `bd` and `(a + b)(c + d)`. The rest is additions, subtractions and shifts, all linear in the number of digits.

Recurrence: T(n) = 3T(n/2) + O(n). With a = 3, b = 2 and d = 1, the critical exponent log₂ 3 ≈ 1.585 exceeds d, so the leaves dominate and T(n) = O(n^1.585).

Worked example: multiply 1234 by 5678. With m = 2 and B = 100: a = 12, b = 34, c = 56, d = 78. The three products are ac = 672, bd = 2652 and (a + b)(c + d) = 46 · 134 = 6164. The middle term is 6164 − 672 − 2652 = 2840. So the result is 672 · 10000 + 2840 · 100 + 2652 = 6720000 + 284000 + 2652 = 7006652, which is 1234 times 5678.

Details of an implementation:

- Base case: if either number has a single digit (or fits in a machine word), multiply directly
- Choose the split position from the length of the longer number
- The sum (a + b) may have one more digit than the halves, which does not change the recurrence
- Use shifts in base 2 or base 2^32 for speed in real libraries; in base 10 the multiplications by powers of ten are string shifts
- Below a threshold, typically tens of digits, the schoolbook method is faster, so libraries combine the two

Place in the hierarchy of multiplication algorithms:

- Schoolbook: O(n^2)
- Karatsuba: O(n^1.585), used for numbers of a few hundred to a few thousand digits
- Toom-Cook (three-way and more splits): O(n^1.465) and lower exponents
- Schönhage-Strassen using the fast Fourier transform: O(n log n log log n), used for huge numbers
- Harvey and van der Hoeven (2019): O(n log n), proven optimal in theory but not used in practice

Uses: Python's built-in integers use Karatsuba for large operands, Java's BigInteger switches to Karatsuba and then Toom-Cook, and the GNU Multiple Precision library uses a whole ladder of algorithms. Cryptography on integers with thousands of bits, computing digits of pi and polynomial multiplication rely on these ideas. Polynomials can be multiplied the same way because the digit split is a coefficient split.

Pitfalls: the base case must stop recursion for small numbers, an odd number of digits needs consistent split handling, and negative numbers are handled by multiplying magnitudes and fixing the sign.

## explain
1. If either number is small, multiply directly.
2. Split both numbers into high and low halves at the same position.
3. Compute ac, bd and (a + b)(c + d) with three recursive calls.
4. Compute the middle term as (a + b)(c + d) minus ac minus bd.
5. Combine as ac shifted twice plus the middle term shifted once plus bd.
6. Compare the result with the language's built-in multiplication in tests.

## example
The Python function multiplies 1234 by 5678 and obtains 7006652, equal to the built-in product, and a comparison on two 31-digit numbers is also exact. The JavaScript version with BigInt gives 7006652 and checks a product of two 20-digit numbers against direct multiplication, printing `true`.

## real
Big-integer libraries in Python, Java and GMP switch to Karatsuba for operands above a size threshold, and cryptographic software relies on fast big-number multiplication.

## pros
- Faster than schoolbook multiplication for large numbers
- Simple extension of the divide and conquer idea
- Works for polynomials as well as integers

## cons
- Overhead makes it slower for small numbers
- More complex than the schoolbook method
- Beaten by FFT-based methods for huge numbers

## uses
- Multiplying very large integers in big-number libraries
- Cryptographic arithmetic on long keys
- Polynomial multiplication
- Computing digits of constants

## mistakes
- Recursing all the way down to single digits and wasting time
- Splitting the two numbers at different positions
- Forgetting that the sum of the halves can have an extra digit
- Mishandling signs for negative operands

## interview
**Q:** What is Karatsuba's trick?
**A:** It computes the product of two split numbers with three half-sized multiplications, ac, bd and (a + b)(c + d), and recovers the middle term by subtraction, instead of using four multiplications.

**Q:** How fast is Karatsuba multiplication asymptotically?
**A:** T(n) = 3T(n/2) + O(n), which is O(n to the power log base 2 of 3), about n to the 1.585, better than the quadratic schoolbook method.

**Q:** When is it used in practice?
**A:** For big-integer operands beyond a threshold of a few dozen machine words, where libraries switch from schoolbook to Karatsuba and later to Toom-Cook or FFT methods.

## summary
Karatsuba multiplication needs only three half-sized multiplications to multiply two numbers, reducing the cost from O(n^2) to O(n^1.585). It is the classic example of a clever combine step in divide and conquer.

## codenote
The Python sample multiplies two integers and verifies the result. The JavaScript sample uses BigInt.

## code
### python
```python
def karatsuba(x, y):
    if x < 10 or y < 10:
        return x * y
    half = max(len(str(x)), len(str(y))) // 2
    base = 10 ** half
    a, b = divmod(x, base)
    c, d = divmod(y, base)
    ac = karatsuba(a, c)
    bd = karatsuba(b, d)
    middle = karatsuba(a + b, c + d) - ac - bd
    return ac * base * base + middle * base + bd

print(karatsuba(1234, 5678), 1234 * 5678)
x = 3141592653589793238462643383279
y = 2718281828459045235360287471352
print(karatsuba(x, y) == x * y)
```
Output:
```text
7006652 7006652
True
```
### javascript
```javascript
function karatsuba(x, y) {
  if (x < 10n || y < 10n) return x * y;
  const half = BigInt(Math.floor(Math.max(x.toString().length, y.toString().length) / 2));
  const base = 10n ** half;
  const [a, b] = [x / base, x % base];
  const [c, d] = [y / base, y % base];
  const ac = karatsuba(a, c);
  const bd = karatsuba(b, d);
  const middle = karatsuba(a + b, c + d) - ac - bd;
  return ac * base * base + middle * base + bd;
}

const big = 98765432109876543210n * 12345678901234567890n;
console.log(karatsuba(1234n, 5678n).toString(), karatsuba(98765432109876543210n, 12345678901234567890n) === big);
```
Output:
```text
7006652 true
```

## quiz
1. How many half-sized multiplications does Karatsuba use?
   - [ ] Four
   - [x] Three
   - [ ] Two
   - [ ] One
   > The middle term is recovered by subtraction.
2. What identity yields the middle term?
   - [ ] ad + bc = ac + bd
   - [x] ad + bc = (a + b)(c + d) − ac − bd
   - [ ] ad + bc = (a − b)(c − d)
   - [ ] ad + bc = ab + cd
   > Expanding (a + b)(c + d) contains all four cross products.
3. What is the time complexity of Karatsuba multiplication?
   - [ ] O(n)
   - [x] About O(n^1.585)
   - [ ] O(n squared)
   - [ ] O(log n)
   > The recurrence is 3T(n/2) plus a linear term.
4. Why do libraries use schoolbook multiplication for small numbers?
   - [ ] Karatsuba gives wrong results for small values
   - [x] Karatsuba's overhead outweighs its savings at small sizes
   - [ ] Small numbers are always zero
   - [ ] Recursion is forbidden
   > Constant factors matter below a size threshold.

# Master Theorem Applications
kind: concept
time: Not an algorithmic topic — the master theorem is a tool for solving recurrences. It yields running times such as O(log n), O(n log n), O(n^1.585) or O(n^2) depending on the recurrence.
space: Not an algorithmic topic — the theorem concerns time recurrences; stack space usually equals the recursion depth, log n for halving.

## intro
The master theorem gives the asymptotic running time of divide and conquer algorithms directly from their recurrence, without drawing a recursion tree. Given T(n) = a·T(n/b) + f(n), compare the work at the leaves with the work at the root and read off the answer. Knowing it saves time in exams, interviews and design reviews.

## theory
Setting: an algorithm splits a problem of size n into a subproblems of size n/b, solves them, and spends f(n) on dividing and combining. Assume f(n) = Θ(n^d) with d at least 0. Let the critical exponent be `c = log_b a`, the exponent for the number of leaves in the recursion tree (there are n^c leaves).

The three cases:

- Case 1, leaves dominate: if d < c, then T(n) = Θ(n^c)
- Case 2, balanced levels: if d = c, then T(n) = Θ(n^d · log n)
- Case 3, root dominates: if d > c, then T(n) = Θ(n^d), provided the regularity condition a·f(n/b) ≤ k·f(n) for some k < 1 holds (it does automatically for polynomial f)

Why: level i of the recursion tree has a^i subproblems, each with cost f(n/b^i), so the total at that level is a^i · (n/b^i)^d = n^d · (a/b^d)^i. If a / b^d is larger than 1 the levels grow geometrically toward the leaves (case 1), if it equals 1 every level costs the same and there are log n levels (case 2), and if it is smaller than 1 the levels shrink geometrically so the root dominates (case 3).

Applications to algorithms from this module:

- Merge sort: T(n) = 2T(n/2) + n, so a = 2, b = 2, d = 1, c = 1; case 2 gives Θ(n log n)
- Binary search: T(n) = T(n/2) + 1, so a = 1, b = 2, d = 0, c = 0; case 2 gives Θ(log n)
- Karatsuba: T(n) = 3T(n/2) + n, so c = log₂ 3 ≈ 1.58 is larger than d = 1; case 1 gives Θ(n^1.58)
- Strassen: T(n) = 7T(n/2) + n^2, so c ≈ 2.81 is larger than d = 2; case 1 gives Θ(n^2.81)
- A recurrence with a heavy combine step, such as T(n) = 2T(n/2) + n^2, has c = 1 smaller than d = 2; case 3 gives Θ(n^2)
- Maximum subarray by divide and conquer: same as merge sort, Θ(n log n)
- Binary tree traversal over n nodes: T(n) = 2T(n/2) + 1, so c = 1 is larger than d = 0; case 1 gives Θ(n)

When the theorem does not apply:

- Subproblems of unequal sizes, such as quick sort's worst case T(n) = T(n − 1) + n, or T(n) = T(n/3) + T(2n/3) + n, which need the Akra-Bazzi method or a recursion tree (the latter gives Θ(n log n))
- Subtraction recurrences like T(n) = T(n − 1) + 1, which are solved by unrolling
- A combine cost with a logarithmic factor, such as f(n) = n log n with a = b: use the extended case 2 giving Θ(n log squared n)
- Non-constant a or b

Practical advice: write the recurrence first, identify a, b and d, compute log base b of a, compare with d, and state the case. Sanity check the result against the recursion tree or against a numerical evaluation: with T(1) = 1, the recurrence T(n) = 2T(n/2) + n gives T(1024) = 11264, close to n log₂ n + n = 11264, whereas T(n) = T(n/2) + 1 gives 11 for n = 1024.

Common worry: the floor and ceiling in n/b do not change the asymptotic result for standard recurrences.

## explain
1. Write the recurrence in the form T(n) = a·T(n/b) + f(n).
2. Identify a, b and the exponent d of the combine cost.
3. Compute the critical exponent c as the logarithm of a in base b.
4. Compare d with c to pick case 1, 2 or 3.
5. State the bound and check the regularity condition for case 3.
6. If the recurrence does not fit, use a recursion tree or Akra-Bazzi.

## example
The Python function classifies five recurrences: merge sort and binary search fall in case 2, Karatsuba and Strassen in case 1 with exponents about 1.58 and 2.81, and a recurrence with a quadratic combine step in case 3. The JavaScript function evaluates two recurrences numerically for n = 1024: the merge-sort-like recurrence gives 11264 and the binary-search-like recurrence gives 11, matching the predicted n log n and log n growth.

## real
Engineers use the theorem when estimating whether a divide and conquer design will scale, and it appears in textbooks, code reviews of recursive algorithms and technical interviews.

## pros
- Gives running times without drawing a recursion tree
- Covers most textbook divide and conquer algorithms
- Quick sanity check for new designs

## cons
- Does not apply to unequal subproblem sizes
- Requires a combine cost of a regular polynomial form
- Gives asymptotics only, not exact constants

## uses
- Analysing divide and conquer algorithms
- Comparing a new design with a known one
- Checking interview answers on recursive complexity
- Choosing between competing recursive formulations

## mistakes
- Applying it to recurrences with unequal splits
- Mixing up which exponent is d and which is the critical exponent
- Forgetting the extra logarithm in the balanced case
- Using it for recurrences that subtract a constant from n

## interview
**Q:** State the three cases of the master theorem.
**A:** For T(n) = aT(n/b) + Θ(n to the d), compare d with log base b of a: if d is smaller the answer is Θ(n to the log base b of a), if equal it is Θ(n to the d times log n), and if d is larger it is Θ(n to the d).

**Q:** What does the master theorem give for merge sort and for binary search?
**A:** Merge sort has a = 2, b = 2, d = 1, so it is balanced and Θ(n log n); binary search has a = 1, b = 2, d = 0, also balanced, so Θ(log n).

**Q:** What can you use when the theorem does not apply?
**A:** A recursion tree, substitution with induction, or the Akra-Bazzi method for unequal subproblem sizes.

## summary
The master theorem solves recurrences of the form T(n) = aT(n/b) + f(n) by comparing the combine cost with the leaf count: leaves dominate, levels balance, or the root dominates. Use it for quick, reliable estimates, and fall back on recursion trees when the form does not fit.

## codenote
The Python sample classifies recurrences by case. The JavaScript sample evaluates recurrences numerically.

## code
### python
```python
import math

def master(a, b, d):
    critical = math.log(a, b)
    if math.isclose(critical, d):
        return "case 2: n^%g log n" % d if d else "case 2: log n"
    if critical > d:
        return "case 1: n^%.2f" % critical
    return "case 3: n^%g" % d

recurrences = [
    ("merge sort", (2, 2, 1)),
    ("binary search", (1, 2, 0)),
    ("karatsuba", (3, 2, 1)),
    ("strassen", (7, 2, 2)),
    ("root heavy", (2, 2, 2)),
]
for name, args in recurrences:
    print(name, master(*args))
```
Output:
```text
merge sort case 2: n^1 log n
binary search case 2: log n
karatsuba case 1: n^1.58
strassen case 1: n^2.81
root heavy case 3: n^2
```
### javascript
```javascript
function cost(n, parts, combine) {
  return n <= 1 ? 1 : parts * cost(n / 2, parts, combine) + combine(n);
}

console.log(cost(1024, 2, (n) => n), cost(1024, 1, () => 1));
```
Output:
```text
11264 11
```

## quiz
1. What does the master theorem solve?
   - [ ] Sorting problems only
   - [x] Recurrences of the form T(n) = aT(n/b) + f(n)
   - [ ] All recurrences
   - [ ] Graph problems
   > It needs equal-sized subproblems and a polynomial combine cost.
2. What is the result when d equals log base b of a?
   - [ ] Θ(n^d)
   - [x] Θ(n^d log n)
   - [ ] Θ(log n)
   - [ ] Θ(n^c squared)
   > Every level of the recursion tree costs the same.
3. What does the theorem give for T(n) = 3T(n/2) + n?
   - [ ] Θ(n log n)
   - [x] Θ(n^1.58)
   - [ ] Θ(n squared)
   - [ ] Θ(n)
   > The leaf count n^log₂3 dominates the linear combine cost.
4. Which recurrence cannot be solved directly with the theorem?
   - [ ] T(n) = 2T(n/2) + n
   - [x] T(n) = T(n/3) + T(2n/3) + n
   - [ ] T(n) = T(n/2) + 1
   - [ ] T(n) = 4T(n/2) + n
   > The subproblems have unequal sizes.

# Combining Subproblem Results
kind: algorithm
time: O(n log n) for counting inversions with merge sort and O(n) for the summary statistics, since each recursion level combines results in linear or constant time.
space: O(n) for the merge buffer used in inversion counting, and O(log n) for the recursion stack.

## intro
In divide and conquer the recursion usually looks the same from problem to problem; what changes is the combine step. A good design starts by asking: what must each subproblem return so that its parent can combine the answers cheaply? Sometimes the answer is simply a number, and sometimes it is a small bundle of values, such as a sorted list together with a count.

## theory
Designing the return value:

- If the combine step needs more than the answer alone, return extra information. Maximum subarray needs the total, best prefix and best suffix in addition to the best subarray, so that a parent can compute the crossing case in constant time.
- If the answer to the whole is a function of the answers to the parts, the combine step is a simple operation: sum for totals, max for maximum, concatenation for lists
- If the parts interact only across the split, the combine step handles exactly the cross terms, as in the crossing subarray, the closest pair strip and inversion counting

Counting inversions. An inversion is a pair of positions i < j with `a[i] > a[j]`. The number of inversions measures how far an array is from sorted, and it is used in ranking comparison and Kendall tau distance. A brute-force count is O(n squared). The divide and conquer solution modifies merge sort: the inversions are those inside the left half, those inside the right half, and those with one element in each half. While merging two sorted halves, whenever an element from the right half is placed before the remaining elements of the left half, it forms an inversion with every one of those remaining elements, so add the number of elements left in the left half. For `[2, 4, 1, 3, 5]` the inversions are (2, 1), (4, 1) and (4, 3), so the count is 3; for the reversed array `[5, 4, 3, 2, 1]` it is 10, the maximum n(n − 1)/2.

Because the halves are sorted when merged, the cross count is found in linear time, and the algorithm is O(n log n).

Combining summary statistics. Split an array and return a small record `(min, max, sum)` from each half; the parent combines them with `min`, `max` and addition, so the complete statistics come from one pass with a tree of constant-time combines. The records for `[4, -2, 9, 0, 7, 3]` give minimum −2, maximum 9 and sum 21. This is the monoid pattern: any associative combine function lets you split data arbitrarily, which is the basis of MapReduce and of parallel reductions.

Segment trees. Store the combined result of each node's range; a range query combines O(log n) nodes and an update recomputes O(log n) ancestors. The combine function determines what the tree can answer: sum, min, max, gcd or the maximum subarray record.

Checklist for the combine step:

- State the invariant: what does each recursive call promise about its return value?
- Make the combine function associative if it is also to be used in parallel or in segment trees
- Bound its cost; the master theorem then gives the total
- Test with small inputs and brute-force comparisons

Pitfalls: counting cross inversions before the halves are sorted, forgetting to return the merged sorted list, double counting equal elements when the comparison is strict versus non-strict (use less-than-or-equal on the left to count strict inversions only), and returning a result that is correct for the part but insufficient for the parent.

## explain
1. Decide what each recursive call must return, beyond the final answer if needed.
2. Write the combine step using only the returned values.
3. For inversions, merge the sorted halves and add the number of remaining left elements each time a right element is taken.
4. For statistics, combine minimum, maximum and sum with the matching operations.
5. Verify the invariant on small cases and against brute force.
6. Analyse the total cost with the master theorem.

## example
The Python function counts 3 inversions in `[2, 4, 1, 3, 5]` and 10 in the reversed array `[5, 4, 3, 2, 1]`, while sorting the data as a side effect. The JavaScript function returns the minimum, maximum and sum of `[4, -2, 9, 0, 7, 3]` by combining records from the halves: −2, 9 and 21.

## real
Ranking systems measure disagreement between two orderings by counting inversions, and parallel reductions in data processing frameworks combine partial statistics from many machines.

## pros
- Clarifies what each recursive call must return
- Gives O(n log n) inversion counting instead of quadratic
- The pattern generalises to parallel reductions and segment trees

## cons
- Returned records can become complicated
- Easy to miscount cross terms
- Needs an associative combine function for parallel use

## uses
- Counting inversions to compare orderings
- Computing statistics with associative reductions
- Building segment trees for range queries
- Parallel and distributed aggregation

## mistakes
- Counting cross inversions on unsorted halves
- Forgetting to return the merged list along with the count
- Returning too little information for the parent to combine
- Using a combine function that is not associative in a parallel reduction

## interview
**Q:** How do you count inversions in O(n log n)?
**A:** Use merge sort; while merging the sorted halves, each time an element of the right half is taken before the remaining left elements, add the number of remaining left elements to the count.

**Q:** What should a recursive call return so the parent can combine results?
**A:** Everything the combine step needs, which may be more than the final answer, such as total, best prefix, best suffix and best subarray for the maximum subarray problem.

**Q:** Why does associativity of the combine function matter?
**A:** An associative operation can be applied to any grouping of the parts, which allows parallel reductions and segment trees.

## summary
The combine step is the heart of divide and conquer: decide what each call returns, then merge the results in linear or constant time. Counting inversions during merge sort and aggregating statistics with associative operations are the standard examples.

## codenote
The Python sample counts inversions. The JavaScript sample combines summary records.

## code
### python
```python
def sort_and_count(values):
    if len(values) <= 1:
        return values, 0
    mid = len(values) // 2
    left, left_count = sort_and_count(values[:mid])
    right, right_count = sort_and_count(values[mid:])
    merged, i, j, count = [], 0, 0, left_count + right_count
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            merged.append(left[i])
            i += 1
        else:
            merged.append(right[j])
            j += 1
            count += len(left) - i
    merged += left[i:] + right[j:]
    return merged, count

print(sort_and_count([2, 4, 1, 3, 5])[1], sort_and_count([5, 4, 3, 2, 1])[1])
```
Output:
```text
3 10
```
### javascript
```javascript
function summary(values, low, high) {
  if (low === high) return { min: values[low], max: values[low], sum: values[low] };
  const mid = Math.floor((low + high) / 2);
  const left = summary(values, low, mid);
  const right = summary(values, mid + 1, high);
  return {
    min: Math.min(left.min, right.min),
    max: Math.max(left.max, right.max),
    sum: left.sum + right.sum,
  };
}

const result = summary([4, -2, 9, 0, 7, 3], 0, 5);
console.log(result.min, result.max, result.sum);
```
Output:
```text
-2 9 21
```

## quiz
1. How are cross inversions counted during the merge?
   - [ ] By comparing every pair
   - [x] By adding the number of remaining left elements when a right element is taken
   - [ ] By sorting twice
   - [ ] By counting equal elements
   > Each remaining left element is larger than the taken right element.
2. What is the number of inversions in a reversed array of 5 elements?
   - [ ] 5
   - [x] 10
   - [ ] 15
   - [ ] 0
   > It is n(n − 1)/2, the maximum possible.
3. Why might a recursive call return more than the final answer?
   - [ ] To use more memory
   - [x] The parent may need extra information to combine results
   - [ ] To avoid the base case
   - [ ] To sort the input
   > Maximum subarray, for example, needs prefix and suffix sums.
4. Which property lets combine functions run in parallel reductions?
   - [ ] Commutativity of the input
   - [x] Associativity
   - [ ] Idempotence of the base case
   - [ ] Sorted order
   > Any grouping of the parts then gives the same result.

# Parallel Divide and Conquer
kind: concept
time: Not an algorithmic topic — parallel speedup is described by work and span. For summing n values, the work is O(n) and the span with enough processors is O(log n); parallel merge sort has work O(n log n) and span O(log squared n) with a parallel merge.
space: Not an algorithmic topic — parallel versions need memory for per-worker partial results and thread stacks, such as O(p) for p partial sums.

## intro
Divide and conquer creates independent subproblems, which is exactly what parallel hardware needs: each part can be solved on its own core or machine. Parallel divide and conquer assigns subproblems to workers and combines their results, and its performance is limited by the sequential parts, the combine steps and the overhead of starting tasks.

## theory
Why divide and conquer parallelises well: the subproblems share no state, so there are no races on the data they work on. The recursion tree is a ready-made task graph, and the combine step for each node depends only on its children.

Work and span model:

- Work T1: the total number of operations if run on one processor
- Span T∞: the length of the longest chain of dependent operations, the critical path
- With p processors the running time is at least max(T1 / p, T∞); a good scheduler achieves about T1 / p + T∞
- Parallelism is the ratio T1 / T∞, the most processors that can be used effectively

Examples:

- Summing n values: split into chunks, sum each chunk in parallel and add the partial sums. The work is O(n) and, with a balanced tree of additions, the span is O(log n). Summing 1 to 100 in four chunks gives the partial sums 325, 950, 1575 and 2200, and the total 5050.
- Merge sort: the two recursive calls run in parallel, but the sequential merge makes the span O(n); a parallel merge, using binary search to split the work, reduces the span to O(log squared n)
- Quick sort: the partition can be parallelised with prefix sums, and the two recursive calls run in parallel
- Matrix multiplication: the eight (or seven) block products are independent
- Fork-join frameworks: Java's `ForkJoinPool` and `parallelStream`, Intel TBB, OpenMP tasks, Rust's rayon and Go goroutines with wait groups are built for this style

Practical rules:

- Use a sequential cutoff: below a threshold, such as a few thousand elements, run sequentially, because task creation costs more than the work
- Prefer associative combine operations (sum, min, max, concatenation), because they let you group the partial results in any way
- Avoid shared mutable state; return values instead, or give each task its own output range
- Balance the load: split into more chunks than workers so that a slow chunk does not leave other workers idle (work stealing does this automatically)
- Be aware of the memory bandwidth limit: memory-bound tasks such as summing large arrays stop scaling when bandwidth saturates
- In CPython, threads do not speed up pure Python computation because of the global interpreter lock, so use processes or native extensions for CPU-bound work; threads still help for tasks that wait on input or output
- JavaScript uses worker threads or promises; promises run on a single thread, so they model the structure but not the speedup unless work is moved to workers

Distributed form: MapReduce splits data across machines (map), then combines partial results (reduce). The map-reduce word count and the distributed sorting of terabytes (sample sort) are parallel divide and conquer at scale.

Amdahl's law bounds the gain: if a fraction s of the work is sequential, the speedup with p processors is at most 1 / (s + (1 − s)/p), which approaches 1/s. A sequential merge or a final combine can therefore limit scalability.

Correctness concerns: determinism (floating-point addition is not associative, so parallel sums can differ slightly from sequential ones), exceptions inside tasks, and cancellation.

## explain
1. Check that the subproblems are independent of one another.
2. Split the data into chunks, more than the number of workers.
3. Run each chunk as a task, with a cutoff below which it runs sequentially.
4. Collect the partial results as return values, not through shared variables.
5. Combine them with an associative operation.
6. Measure the speedup and compare it with the work and span prediction.

## example
The Python program sums the numbers 1 to 100 with four worker threads by splitting the list into chunks of 25: the partial sums are 325, 950, 1575 and 2200, and the total is 5050. The JavaScript program uses promises over four chunks of the numbers 1 to 20 and prints the partial sums 15, 40, 65 and 90 with the total 210.

## real
Database engines run parallel scans and sorts, scientific codes distribute grids across cores, and big data frameworks split inputs across machines and combine partial aggregates.

## pros
- Independent subproblems map naturally to cores and machines
- Speedup can approach the number of workers for large inputs
- Fork-join libraries handle scheduling automatically

## cons
- Overhead can exceed the gain on small inputs
- Sequential combine steps limit the speedup
- Debugging and nondeterminism add complexity

## uses
- Parallel sorting and searching
- Aggregations over large data sets
- Matrix and image processing
- Distributed map and reduce jobs

## mistakes
- Spawning a task for every tiny subproblem
- Sharing a mutable accumulator between tasks without protection
- Expecting speedup from Python threads on pure computation
- Ignoring that the combine step remains sequential

## interview
**Q:** Why is divide and conquer a good fit for parallelism?
**A:** The subproblems are independent, so they can run on different workers without synchronisation, and only the combine step needs the results.

**Q:** What are work and span?
**A:** Work is the total number of operations, and span is the length of the longest dependency chain; with p processors the time is roughly work divided by p plus span.

**Q:** Why use a sequential cutoff?
**A:** Creating and scheduling tiny tasks costs more than computing them, so below a threshold the recursion switches to a sequential algorithm.

## summary
Parallel divide and conquer runs independent subproblems concurrently and combines their results, with performance limited by span, overhead and sequential combine steps. Use cutoffs, return values instead of shared state, and associative combine operations.

## codenote
The Python sample sums chunks with worker threads. The JavaScript sample combines chunk sums with promises.

## code
### python
```python
from concurrent.futures import ThreadPoolExecutor

def parallel_sum(values, workers=4):
    chunk = -(-len(values) // workers)
    pieces = [values[i:i + chunk] for i in range(0, len(values), chunk)]
    with ThreadPoolExecutor(workers) as pool:
        partial = list(pool.map(sum, pieces))
    return partial, sum(partial)

print(parallel_sum(list(range(1, 101))))
```
Output:
```text
([325, 950, 1575, 2200], 5050)
```
### javascript
```javascript
async function parallelSum(values, workers) {
  const size = Math.ceil(values.length / workers);
  const pieces = [];
  for (let i = 0; i < values.length; i += size) pieces.push(values.slice(i, i + size));
  const partial = await Promise.all(pieces.map(async (piece) => piece.reduce((a, b) => a + b, 0)));
  return [partial, partial.reduce((a, b) => a + b, 0)];
}

parallelSum(Array.from({ length: 20 }, (_, i) => i + 1), 4).then(([partial, total]) => {
  console.log(partial.join(" "), total);
});
```
Output:
```text
15 40 65 90 210
```

## quiz
1. Why does divide and conquer suit parallel hardware?
   - [ ] It uses fewer comparisons
   - [x] Its subproblems are independent and can run at the same time
   - [ ] It avoids recursion
   - [ ] It needs no memory
   > Independent tasks need no synchronisation until the combine step.
2. What does the span of a computation measure?
   - [ ] The total number of operations
   - [x] The length of the longest chain of dependent operations
   - [ ] The memory used
   - [ ] The number of threads
   > It is the critical path that no number of processors can shorten.
3. Why use a sequential cutoff in parallel recursion?
   - [ ] To reduce correctness risks
   - [x] Task creation costs more than computing tiny subproblems
   - [ ] To avoid associative operations
   - [ ] To increase the recursion depth
   > Small tasks are faster when run directly.
4. What does Amdahl's law say?
   - [ ] Speedup is unlimited
   - [x] The sequential fraction limits the achievable speedup
   - [ ] Parallel code is always slower
   - [ ] Threads always share memory
   > Even with unlimited processors the speedup is at most the reciprocal of the sequential fraction.

# D and C Interview Patterns
kind: concept
time: Not an algorithmic topic — this lesson collects recurring interview patterns. The typical results are O(log n) for halving problems, O(n log n) for split-and-merge problems and O(n) for single-subproblem reductions.
space: Not an algorithmic topic — recursion stack depth is usually O(log n) for balanced splits, which interviewers expect you to state.

## intro
Divide and conquer questions in interviews follow a small number of recurring shapes: halve the search space, split into two halves and combine, or partition around a pivot. Recognising the shape tells you the template, the recurrence and the follow-up questions the interviewer is likely to ask.

## theory
Pattern 1: halve the problem (one subproblem, trivial combine). Complexity T(n) = T(n/2) + O(1), so O(log n). Examples: binary search and its variants (first or last occurrence, insertion point, rotated arrays, peak finding), fast exponentiation (compute x to the n by squaring x to the n/2, handling negative exponents by taking the reciprocal; 2 to the power minus 3 is 0.125 and 2 to the power 10 is 1024), and finding the integer square root by bisection.

Pattern 2: split into two halves and combine, T(n) = 2T(n/2) + O(n). Examples: merge sort, counting inversions, maximum subarray, counting smaller elements to the right, and building a balanced binary search tree from a sorted array (O(n) with constant-time combine). The majority element problem fits too: the majority of the whole array, if one exists, must be the majority of at least one half, so recurse on both halves and count the two candidates in the current range. For `[2, 2, 1, 1, 1, 2, 2]` the answer is 2.

Pattern 3: partition around a pivot, T(n) = T(k) + O(n) for selection (expected O(n)) and 2T(n/2) + O(n) for quick sort. Examples: quickselect for the k-th largest element, sort colours (Dutch national flag), and finding the median.

Pattern 4: tree recursion. Many tree problems are divide and conquer: height, diameter, balanced check, lowest common ancestor and validating a binary search tree each combine results from the left and right subtrees. The cost is O(n) because each node is visited once, even though the recurrence has two subproblems (the combine is constant and the tree is not necessarily balanced).

Pattern 5: geometric and numeric splits: closest pair of points, the skyline problem (merge two skylines, like merging sorted lists), large integer multiplication (Karatsuba) and matrix multiplication (Strassen).

Pattern 6: merge k sorted lists by pairwise merging of halves, giving O(N log k) for N total elements, the same as using a heap.

Interview technique:

- State the recurrence and solve it with the master theorem
- Mention the base cases first: empty input, one element, two elements
- Discuss the recursion stack: O(log n) for balanced splits and O(n) for degenerate ones, and offer an iterative version when depth could be a problem
- Offer alternatives and compare them: dynamic programming when subproblems overlap, a heap, a hash table or a sort when they are simpler
- Test with small examples, including duplicates and negative numbers
- Watch the midpoint calculation and the inclusive or exclusive range convention

How to choose between recursion with slicing and index passing: slicing is simpler but copies data at each level, so index passing is preferable when the copy would change the complexity.

Typical follow-ups: "can you do it in place?", "what if the data does not fit in memory?" (external merge sort), "can you parallelise it?" (independent subproblems, see the parallel lesson) and "can you reduce the extra space?" (iterative bottom-up merge, tail recursion elimination for the larger partition).

## explain
1. Identify which pattern the problem matches: halve, split and merge, partition, tree, geometric.
2. Define the recursive function precisely: its arguments, its return value and its base case.
3. Write the combine step and its cost.
4. Derive the recurrence and the total complexity.
5. Check the recursion depth and extra space.
6. Run through a small example, then handle edge cases.

## example
The Python solution finds the majority element of `[2, 2, 1, 1, 1, 2, 2]` by recursing on both halves and counting the two candidates, and it returns 2. The JavaScript function computes powers by halving the exponent: `pw(2, -3)` is 0.125, `pw(2, 10)` is 1024 and `pw(5, 0)` is 1.

## real
Search engines, compilers and databases rely on the same patterns that appear in interviews, such as binary search over sorted indexes, merge-based sorting and tree recursion.

## pros
- A small set of patterns covers most questions
- Recurrences make the analysis systematic
- The patterns transfer to real code, such as sorting and tree processing

## cons
- Recursion depth can be an issue for degenerate inputs
- Slicing arrays hides quadratic copying costs
- Choosing the wrong pattern leads to overcomplicated solutions

## uses
- Practising recursive coding interview questions
- Recognising which recursive template fits a new problem
- Estimating complexity of recursive code quickly
- Reviewing recursive solutions in code reviews

## mistakes
- Starting to code before stating the base cases
- Ignoring the cost of copying subarrays
- Forgetting negative exponents or empty input in edge cases
- Claiming O(log n) when the combine step is linear

## interview
**Q:** What are the common divide and conquer patterns in interviews?
**A:** Halving searches like binary search and fast power, split-and-merge problems like merge sort, inversions and maximum subarray, partitioning like quickselect, and tree recursion such as height, diameter and validation.

**Q:** How do you compute x to the power n efficiently?
**A:** Compute x to the power n divided by 2 once, square it, and multiply by x if n is odd; for negative n take the reciprocal of the positive power. This takes O(log n) multiplications.

**Q:** How do you find the majority element by divide and conquer?
**A:** Find the majority candidate in each half; if they agree return it, otherwise count both candidates over the whole range and return the one that occurs more often.

## summary
Most divide and conquer interview problems fit a few templates: halve the search space, split and merge, partition around a pivot or recurse on a tree. State the recurrence, the base cases and the recursion depth, and mention alternatives such as dynamic programming.

## codenote
The Python sample finds a majority element. The JavaScript sample computes powers including negative exponents.

## code
### python
```python
def majority(values, low, high):
    if low == high:
        return values[low]
    mid = (low + high) // 2
    left = majority(values, low, mid)
    right = majority(values, mid + 1, high)
    if left == right:
        return left
    left_count = sum(1 for i in range(low, high + 1) if values[i] == left)
    right_count = sum(1 for i in range(low, high + 1) if values[i] == right)
    return left if left_count > right_count else right

data = [2, 2, 1, 1, 1, 2, 2]
print(majority(data, 0, len(data) - 1))
```
Output:
```text
2
```
### javascript
```javascript
function pw(base, exponent) {
  if (exponent < 0) return 1 / pw(base, -exponent);
  if (exponent === 0) return 1;
  const half = pw(base, Math.floor(exponent / 2));
  return exponent % 2 ? half * half * base : half * half;
}

console.log(pw(2, -3), pw(2, 10), pw(5, 0));
```
Output:
```text
0.125 1024 1
```

## quiz
1. Which pattern does binary search follow?
   - [ ] Split in two and merge
   - [x] Halve the problem with one subproblem
   - [ ] Tree recursion
   - [ ] Pivot partitioning
   > Only one half is searched, and no combine step is needed.
2. How can the majority element be found by divide and conquer?
   - [ ] Sort and take the middle
   - [x] Find candidates in both halves and count them over the whole range
   - [ ] Take the first element
   - [ ] Use binary search directly
   > A majority of the whole must be a majority of at least one half.
3. How is x to the power n computed in O(log n) multiplications?
   - [ ] By multiplying n times
   - [x] By squaring x to the power n divided by 2
   - [ ] By adding x to itself
   - [ ] By recursion on n minus 1
   > Halving the exponent at each step takes log n steps.
4. Why can slicing arrays in recursive code hurt complexity?
   - [ ] Slices are always shared
   - [x] Each slice copies data, so the copies can add up to more than the intended cost
   - [ ] Slices change the recursion depth
   - [ ] Slices are immutable
   > Passing indices avoids the copying cost.
