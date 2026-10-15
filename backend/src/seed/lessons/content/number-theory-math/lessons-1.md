# Modular Arithmetic
kind: concept
time: Not an algorithmic topic — modular arithmetic is a number system. Addition, subtraction and multiplication modulo m cost O(1) for word-sized values, and a modular inverse costs O(log m) with the extended Euclidean algorithm.
space: Not an algorithmic topic — residues modulo m fit in the same word size as m, so working modulo a prime near 10^9 keeps every intermediate value within 64 bits.

## intro
Modular arithmetic works with remainders. Clocks wrap around after 12, days of the week repeat after 7, and hash tables fold keys into buckets. Computing with remainders keeps numbers small, makes huge results such as 2 to the power 10^18 tractable, and underlies cryptography, checksums and almost every counting problem that asks for the answer modulo 1,000,000,007.

## theory
Definition: for an integer m greater than 0, `a mod m` is the remainder of dividing a by m, taken in the range 0 to m − 1. Two integers are congruent modulo m, written `a ≡ b (mod m)`, if m divides a − b. Congruence is an equivalence relation, so each integer belongs to exactly one residue class.

Arithmetic rules (the key reason modular arithmetic is useful):

- `(a + b) mod m = ((a mod m) + (b mod m)) mod m`
- `(a − b) mod m = ((a mod m) − (b mod m) + m) mod m`
- `(a · b) mod m = ((a mod m) · (b mod m)) mod m`
- Powers follow from repeated multiplication, and the modulus can be applied after every step

So any expression built from addition, subtraction and multiplication can be reduced at every step without changing the final residue. For example (123456789 · 987654321) mod 1000 = (789 · 321) mod 1000 = 253,269 mod 1000 = 269.

Division is different: there is no general rule `(a / b) mod m = ...`. Instead you multiply by the modular inverse of b: the number `b⁻¹` with `b · b⁻¹ ≡ 1 (mod m)`. The inverse exists exactly when gcd(b, m) = 1. For example 3 · 5 = 15 ≡ 1 (mod 7), so the inverse of 3 modulo 7 is 5, and "10 divided by 3 modulo 7" is 10 · 5 mod 7 = 1. Compute inverses with the extended Euclidean algorithm, or with Fermat's little theorem when m is prime (`b^(m − 2) mod m`). In Python 3.8 and later, `pow(b, -1, m)` does it.

Negative numbers: the sign convention of the remainder operator differs between languages. Python's `%` always returns a result with the sign of the divisor (so `-7 % 5` is 3), while C, C++, Java and JavaScript return a result with the sign of the dividend (`-7 % 5` is −2). Normalise with `((a % m) + m) % m`.

Overflow: the product of two residues below m can reach m squared. For m around 10^9 the product reaches 10^18, which fits in a signed 64-bit integer (limit about 9.2 × 10^18). For moduli above about 3 × 10^9 use 128-bit arithmetic, `BigInt`, or a mulmod routine. JavaScript numbers lose precision above 2^53, so use BigInt for products of large residues.

Common moduli: 1,000,000,007 and 998,244,353 are primes used so that inverses exist for every nonzero residue and so results fit in 32 bits; 998,244,353 additionally supports the number theoretic transform.

Applications:

- Counting problems whose answers are huge (paths, subsets, arrangements) reported modulo a prime
- Hashing: polynomial hashes are computed modulo a prime
- Cryptography: RSA works with modular exponentiation and inverses; Diffie-Hellman uses modular powers
- Checksums and check digits (ISBN, credit cards use modulo 10 or 11)
- Calendar and clock calculations: day of week for a date, time after n hours
- Cyclic structures: circular buffers and rotating arrays use indices modulo the length
- Periodicity: Fibonacci numbers modulo m repeat with the Pisano period

Example: what day of the week is it 100 days after a Monday? 100 mod 7 = 2, so Wednesday. What is the last digit of 7 to the power 2025? The powers of 7 modulo 10 cycle with period 4 (7, 9, 3, 1), and 2025 mod 4 = 1, so the last digit is 7.

Pitfalls: forgetting to normalise negative remainders, dividing with the ordinary operator under a modulus, overflowing intermediate products, applying the modulus only at the end (numbers blow up) and using a composite modulus when an inverse is required.

## explain
1. Reduce operands modulo m before combining them.
2. Apply the modulus after every addition, subtraction or multiplication.
3. Add m before taking the remainder when subtracting, to avoid negative results.
4. Replace division by multiplication with the modular inverse.
5. Check that the inverse exists: the divisor must be coprime to the modulus.
6. Use wide integers or BigInt when residues multiply beyond the word size.

## example
The Python program shows the rules on numbers (the product 269, the inverse of 3 modulo 7 is 5), the sign convention of `%` for negative numbers, and the last digit of 7 to the power 2025. The JavaScript program shows the negative remainder behaviour and a correct large product with BigInt.

## real
Cryptographic libraries, hash tables, calendars and checksums all compute with remainders, and programming contests report huge counts modulo a prime.

## pros
- Keeps numbers small and computations fast
- Makes enormous results computable
- Underlies hashing and cryptography

## cons
- Division needs an inverse that may not exist
- Sign and overflow conventions differ by language
- Results are only residues, not the true values

## uses
- Counting modulo a prime
- Hashing and checksums
- Cryptographic primitives
- Cyclic indexing and calendars

## mistakes
- Leaving negative remainders unnormalised
- Dividing normally inside a modular expression
- Overflowing a product of two residues
- Using a composite modulus where an inverse is needed

## interview
**Q:** Why can you take the modulus after every operation?
**A:** Addition, subtraction and multiplication respect congruence, so reducing intermediate results modulo m gives the same final residue while keeping numbers small.

**Q:** How do you divide in modular arithmetic?
**A:** Multiply by the modular inverse of the divisor, which exists when the divisor is coprime to the modulus and is found with the extended Euclidean algorithm or Fermat's little theorem for a prime modulus.

**Q:** What is the difference between Python's and JavaScript's remainder for negative numbers?
**A:** Python returns a result with the sign of the divisor, so -7 % 5 is 3, while JavaScript returns a result with the sign of the dividend, so -7 % 5 is -2; add the modulus and take the remainder again to normalise.

## summary
Modular arithmetic reduces numbers to remainders so that sums, differences and products can be reduced at every step, and division becomes multiplication by an inverse that exists for coprime divisors. Normalise negatives and avoid overflow.

## codenote
The Python sample demonstrates the rules and inverse. The JavaScript sample shows signs and BigInt products.

## code
### python
```python
m = 1000
a, b = 123456789, 987654321
print((a * b) % m, ((a % m) * (b % m)) % m)
print(pow(3, -1, 7), (10 * pow(3, -1, 7)) % 7)
print(-7 % 5, 7 % -5, (-7) % 5 == ((-7 % 5) + 5) % 5)
print(pow(7, 2025, 10), [pow(7, k, 10) for k in range(1, 6)], 100 % 7)
```
Output:
```text
269 269
5 1
3 -3 True
7 [7, 9, 3, 1, 7] 2
```
### javascript
```javascript
const normalise = (a, m) => ((a % m) + m) % m;
console.log(-7 % 5, normalise(-7, 5), normalise(7, 5));

const m = 1000000007n;
const x = 999999999n;
const y = 888888888n;
console.log(((x * y) % m).toString(), Number(x) * Number(y));
```
Output:
```text
-2 3 2
888888952 888888887111111200
```

## quiz
1. What does a congruent b modulo m mean?
   - [ ] a equals b
   - [x] m divides a − b
   - [ ] a is larger than b
   - [ ] a and b are prime
   > Both have the same remainder when divided by m.
2. When does a modular inverse of b exist?
   - [ ] Always
   - [x] When b and m are coprime
   - [ ] When b is even
   - [ ] When m is prime only
   > The inverse requires gcd(b, m) = 1.
3. What is -7 % 5 in Python?
   - [ ] -2
   - [x] 3
   - [ ] 2
   - [ ] -3
   > Python's remainder takes the sign of the divisor.
4. Why use BigInt for products of large residues in JavaScript?
   - [ ] It is faster
   - [x] Ordinary numbers lose precision above 2 to the power 53
   - [ ] Remainders are not supported
   - [ ] It avoids negative numbers
   > Precision loss gives wrong residues.

# GCD and Euclidean Algorithm
kind: algorithm
time: O(log(min(a, b))) divisions for the Euclidean algorithm, since the remainder at least halves every two steps; the worst case occurs for consecutive Fibonacci numbers.
space: O(1) for the iterative version and O(log min(a, b)) stack for the recursive version.

## intro
The greatest common divisor of two integers is the largest number that divides both. Euclid described a method for finding it more than two thousand years ago, and it is still the standard: replace the larger number by its remainder modulo the smaller until the remainder is zero. The method is fast, simple and extends to solve linear equations in integers, which gives modular inverses.

## theory
Definition: `gcd(a, b)` is the largest positive integer dividing both a and b, with `gcd(a, 0) = a`. Numbers with gcd 1 are called coprime. For example gcd(48, 18) = 6 and gcd(17, 5) = 1.

Euclidean algorithm: use the identity `gcd(a, b) = gcd(b, a mod b)`. Reason: any common divisor of a and b also divides `a − q·b = a mod b`, and conversely any common divisor of b and a mod b divides a, so the sets of common divisors are equal.

Iteration for gcd(48, 18): 48 mod 18 = 12, then gcd(18, 12); 18 mod 12 = 6, then gcd(12, 6); 12 mod 6 = 0, so the answer is 6, after 3 divisions.

Complexity: Lamé's theorem says the number of steps is at most about 5 times the number of decimal digits of the smaller number. The worst case is two consecutive Fibonacci numbers: gcd(89, 55) takes 9 steps. For 64-bit inputs at most about 92 steps are needed. After every two steps the remainder is less than half the larger number, which gives the O(log) bound.

Extended Euclidean algorithm: besides the gcd, find integers x and y with `a·x + b·y = gcd(a, b)` (Bézout's identity). Recursion: if b = 0 then (gcd, x, y) = (a, 1, 0); otherwise compute (g, x1, y1) for (b, a mod b) and return (g, y1, x1 − (a // b)·y1). For (240, 46): gcd 2 with x = −9, y = 47 since 240·(−9) + 46·47 = −2160 + 2162 = 2. Uses:

- Modular inverse: if gcd(a, m) = 1 then `a·x + m·y = 1` gives `a·x ≡ 1 (mod m)`, so x mod m is the inverse
- Solving linear Diophantine equations `a x + b y = c`: solutions exist iff gcd(a, b) divides c
- Chinese remainder theorem for non-coprime moduli
- Simplifying fractions: divide numerator and denominator by their gcd

Properties:

- `gcd(a, b) = gcd(b, a)`, `gcd(a, b) = gcd(a, b − a)`, `gcd(ka, kb) = k·gcd(a, b)`
- gcd of many numbers: fold, `gcd(a1, a2, ..., an) = gcd(gcd(a1, a2), a3, ...)`; the result only decreases, so it reaches 1 quickly
- `gcd(a, b) · lcm(a, b) = a · b` (next lesson)
- gcd of consecutive Fibonacci numbers is 1; `gcd(F_m, F_n) = F_gcd(m, n)`
- Binary gcd (Stein's algorithm) uses shifts and subtraction instead of division: gcd(a, b) with both even = 2·gcd(a/2, b/2), one even halves it, both odd replaces the larger by the difference; it avoids division and is fast on hardware without a fast divide

Applications: reducing fractions, finding the period of repeating events, checking coprimality in cryptography (RSA key generation requires gcd(e, φ(n)) = 1), computing tiling and grid problems (the number of lattice points on a line segment is gcd of the differences plus 1), and the water jug puzzle (a target amount is reachable iff it is a multiple of the gcd of the jug sizes and fits in a jug).

Library support: `math.gcd` in Python (variadic since 3.9), `std::gcd` in C++17, `BigInteger.gcd` in Java; JavaScript has none built in.

Pitfalls: negative inputs (take absolute values), gcd(0, 0) (conventionally 0), recursion depth for huge numbers (still small, logarithmic), overflow in lcm computed as a·b/gcd (divide first) and applying the extended algorithm without checking the coprimality requirement for inverses.

## explain
1. While b is not zero, replace (a, b) by (b, a mod b).
2. When b is zero, the answer is a.
3. For Bézout coefficients, recurse and combine with y1 and x1 − (a // b)·y1.
4. Use the coefficient x as a modular inverse when the gcd is 1.
5. For many numbers fold the gcd across the list.
6. Handle zero and negative inputs explicitly.

## example
The Python program computes gcd(48, 18) = 6 with the number of steps, the worst case for 89 and 55 (9 steps), the extended result (2, −9, 47) for (240, 46), and the inverse of 17 modulo 3120 (2753). The JavaScript program reduces fractions and folds a gcd over an array.

## real
Fraction arithmetic, RSA key generation, calendar and scheduling periods, and graphics code that reduces ratios use gcd constantly.

## pros
- Very fast: logarithmic number of steps
- Tiny code
- Extends to modular inverses and linear equations

## cons
- Division based loops are slower than shifts on some hardware
- Negative and zero inputs need care
- The extended version is easy to implement incorrectly

## uses
- Simplifying fractions
- Modular inverses
- Solving linear Diophantine equations
- Checking coprimality in cryptography

## mistakes
- Forgetting that gcd(a, 0) is a
- Applying the algorithm to negative numbers without absolute values
- Computing the inverse when the gcd is not 1
- Computing lcm as a times b divided by gcd and overflowing

## interview
**Q:** How does the Euclidean algorithm work and why is it correct?
**A:** It replaces the pair (a, b) by (b, a mod b) until the second number is zero; every common divisor of a and b also divides a mod b and vice versa, so the gcd is preserved at each step.

**Q:** How many steps does the Euclidean algorithm take?
**A:** O(log(min(a, b))), since the remainder at least halves every two steps, with Fibonacci numbers as the worst case.

**Q:** What does the extended Euclidean algorithm provide?
**A:** Integers x and y with a·x + b·y equal to gcd(a, b), which gives modular inverses when the gcd is 1 and solutions of linear Diophantine equations.

## summary
The Euclidean algorithm computes the gcd with repeated remainders in O(log) steps, and its extended form yields Bézout coefficients for modular inverses and Diophantine equations. Handle zero, negatives and overflow carefully.

## codenote
The Python sample counts steps and uses the extended version. The JavaScript sample reduces fractions.

## code
### python
```python
def gcd(a, b):
    steps = 0
    while b:
        a, b = b, a % b
        steps += 1
    return a, steps

def extended(a, b):
    if b == 0:
        return a, 1, 0
    g, x1, y1 = extended(b, a % b)
    return g, y1, x1 - (a // b) * y1

print(gcd(48, 18), gcd(89, 55), gcd(17, 5))
g, x, y = extended(240, 46)
print((g, x, y), 240 * x + 46 * y)
g, x, _ = extended(17, 3120)
print(x % 3120, (17 * (x % 3120)) % 3120)
```
Output:
```text
(6, 3) (1, 9) (1, 3)
(2, -9, 47) 2
2753 1
```
### javascript
```javascript
function gcd(a, b) {
  while (b) [a, b] = [b, a % b];
  return Math.abs(a);
}

const reduce = (n, d) => {
  const g = gcd(n, d);
  return n / g + "/" + d / g;
};

console.log(reduce(84, 36), reduce(10, 25), reduce(7, 13));
console.log([48, 36, 120, 84].reduce(gcd), [17, 5, 9].reduce(gcd));
```
Output:
```text
7/3 2/5 7/13
12 1
```

## quiz
1. What is gcd(48, 18)?
   - [ ] 3
   - [x] 6
   - [ ] 12
   - [ ] 18
   > Repeated remainders give 12, then 6, then 0.
2. Which identity drives the Euclidean algorithm?
   - [ ] gcd(a, b) = a times b
   - [x] gcd(a, b) = gcd(b, a mod b)
   - [ ] gcd(a, b) = a plus b
   - [ ] gcd(a, b) = gcd(a, a)
   > The common divisors stay the same.
3. What inputs give the most steps?
   - [ ] Two equal numbers
   - [x] Consecutive Fibonacci numbers
   - [ ] Powers of two
   - [ ] Two primes of equal size
   > Each quotient is 1, so the remainders shrink slowly.
4. When does a modular inverse of a modulo m exist?
   - [ ] When a is prime
   - [x] When gcd(a, m) equals 1
   - [ ] When m is even
   - [ ] Always
   > The extended algorithm then gives Bézout coefficients.

# LCM Properties
kind: concept
time: Not an algorithmic topic — the least common multiple is computed from the gcd in O(log) time per pair, so the lcm of n numbers costs O(n log M) for numbers up to M.
space: Not an algorithmic topic — a running lcm needs O(1) extra space, but its value can grow very quickly and overflow word sizes.

## intro
The least common multiple of two integers is the smallest positive number that both divide. It answers when two cycles line up again: buses leaving every 12 and 18 minutes meet again every 36 minutes. Its properties tie it closely to the greatest common divisor and to prime factorisations, and its tendency to grow fast is a common source of overflow bugs.

## theory
Definition: `lcm(a, b)` is the smallest positive integer that is a multiple of both a and b. For a, b > 0: `lcm(4, 6) = 12`, `lcm(5, 7) = 35`, `lcm(12, 18) = 36`.

Core identity: `gcd(a, b) · lcm(a, b) = a · b`. So `lcm(a, b) = a / gcd(a, b) · b`. Divide before multiplying to reduce the intermediate size and avoid overflow: `lcm(a, b) = (a // gcd(a, b)) · b`.

Prime factorisation view: write each number as a product of prime powers. The gcd takes the minimum exponent of each prime, and the lcm takes the maximum exponent. For 12 = 2² · 3 and 18 = 2 · 3²: gcd = 2 · 3 = 6 and lcm = 2² · 3² = 36.

Properties:

- Commutative and associative: `lcm(a, lcm(b, c)) = lcm(lcm(a, b), c)`, so the lcm of a list is a fold
- `lcm(a, a) = a`, `lcm(a, 1) = a`, `lcm(a, b) = a · b` exactly when a and b are coprime
- `lcm(ka, kb) = k · lcm(a, b)`
- Distributes with gcd: `lcm(a, gcd(b, c)) = gcd(lcm(a, b), lcm(a, c))`
- a divides lcm(a, b), and every common multiple of a and b is a multiple of lcm(a, b)
- The multiples of both a and b are exactly the multiples of the lcm

Growth: the lcm of 1..n grows like e^n (by the prime number theorem). lcm(1..10) = 2520, lcm(1..20) = 232,792,560, and lcm(1..40) is already about 5.3 × 10^15; lcm(1..50) exceeds 3 × 10^21, which overflows 64-bit integers. When computing an lcm of many numbers, either use big integers (Python integers or BigInt), compute modulo a prime when only a residue is needed (take the maximum exponent of each prime), or cap the value.

Applications:

- Synchronising periodic events: gears with 12 and 18 teeth return to the starting alignment after lcm teeth passes, i.e. after 3 and 2 full turns; traffic lights, rotating schedules and cron-like jobs
- Adding fractions: the least common denominator is the lcm of the denominators; 1/6 + 1/4 = 2/12 + 3/12 = 5/12
- Smallest number divisible by all of 1..n (the classic puzzle: 2520 for 1..10)
- Scheduling and tiling: the smallest square tiled by rectangles a by b has side lcm(a, b)
- Finding when two arithmetic progressions meet: with periods p and q the common terms form a progression with period lcm(p, q)
- Counting numbers up to N divisible by both a and b: N // lcm(a, b) (inclusion-exclusion)
- Cycle structure of permutations: the order of a permutation is the lcm of its cycle lengths

Extended view: for several numbers the lcm via prime exponents is the efficient way when factorisations are known; for pairs use the gcd.

Pitfalls: computing `a * b // gcd` and overflowing, mixing up gcd and lcm in identities, taking the lcm with zero (undefined or zero by convention), using floating point division (precision loss) and forgetting that the running lcm over a long list can exceed the integer range.

Testing: compare with a brute force search for the first common multiple, and verify the identity gcd times lcm equals the product on random pairs.

## explain
1. Compute the gcd of the two numbers.
2. Divide one number by the gcd, then multiply by the other.
3. For a list, fold the pairwise lcm across the elements.
4. Use big integers or modular prime exponents when the value can grow large.
5. Use the maximum exponent rule when prime factorisations are available.
6. Verify gcd times lcm equals the product for pairs.

## example
The Python program computes lcm(12, 18) = 36, lcm(1..10) = 2520 and lcm(1..20) = 232,792,560, verifies the identity on 200 random pairs and finds when two schedules (every 12 and every 18 days) next coincide, 36 days. The JavaScript program adds fractions using the lcm of the denominators and shows the lcm of 1 to 50 with BigInt.

## real
Schedulers align periodic jobs, music software aligns rhythms of different lengths and fraction arithmetic uses the least common denominator.

## pros
- Simple formula from the gcd
- Natural tool for synchronisation and fractions
- The prime exponent view gives structure

## cons
- Grows very fast and overflows easily
- Zero input needs a convention
- Float division gives wrong results

## uses
- Finding when periodic events coincide
- Adding fractions with a common denominator
- Smallest number divisible by a range
- Counting common multiples

## mistakes
- Computing a times b before dividing by the gcd and overflowing
- Using floating point division for the lcm
- Forgetting that the lcm of a range explodes in size
- Mixing up the minimum exponent rule of the gcd with the maximum exponent rule of the lcm

## interview
**Q:** How is the lcm of two numbers computed from the gcd?
**A:** lcm(a, b) = a divided by gcd(a, b), times b; dividing first keeps the intermediate value from overflowing.

**Q:** How do prime factorisations relate to gcd and lcm?
**A:** The gcd takes the minimum exponent of each prime and the lcm takes the maximum exponent, which is why gcd times lcm equals the product.

**Q:** Why can the lcm of a list overflow?
**A:** The lcm of 1 to n grows exponentially (about e to the n), exceeding 64-bit integers around n = 43, so use big integers or work with prime exponents modulo a prime.

## summary
The lcm is the smallest common multiple, computed as a / gcd(a, b) · b, using the maximum prime exponents. It models synchronisation of cycles and fractions, but it grows quickly, so divide first and watch for overflow.

## codenote
The Python sample checks the identity and ranges. The JavaScript sample adds fractions and uses BigInt.

## code
### python
```python
import random
from math import gcd
from functools import reduce

def lcm(a, b):
    return a // gcd(a, b) * b

print(lcm(12, 18), lcm(4, 6), lcm(5, 7))
print(reduce(lcm, range(1, 11)), reduce(lcm, range(1, 21)), reduce(lcm, range(1, 41)))
rng = random.Random(1)
print(all(gcd(a, b) * lcm(a, b) == a * b for a, b in ((rng.randint(1, 1000), rng.randint(1, 1000)) for _ in range(200))))
print(lcm(12, 18) // 12, lcm(12, 18) // 18)
```
Output:
```text
36 12 35
2520 232792560 5342931457063200
True
3 2
```
### javascript
```javascript
const gcd = (a, b) => (b ? gcd(b, a % b) : a);
const lcm = (a, b) => (a / gcd(a, b)) * b;

const [n1, d1, n2, d2] = [1, 6, 1, 4];
const denominator = lcm(d1, d2);
const numerator = n1 * (denominator / d1) + n2 * (denominator / d2);
console.log(numerator + "/" + denominator);

const gcdBig = (a, b) => (b ? gcdBig(b, a % b) : a);
let value = 1n;
for (let k = 1n; k <= 50n; k++) value = (value / gcdBig(value, k)) * k;
console.log(value.toString(), value > BigInt(Number.MAX_SAFE_INTEGER));
```
Output:
```text
5/12
3099044504245996706400 true
```

## quiz
1. What is lcm(12, 18)?
   - [ ] 6
   - [x] 36
   - [ ] 216
   - [ ] 72
   > The gcd is 6, and 12 times 18 divided by 6 is 36.
2. Which identity links gcd and lcm?
   - [ ] gcd plus lcm equals a plus b
   - [x] gcd times lcm equals a times b
   - [ ] gcd equals lcm for coprime numbers
   - [ ] lcm divides gcd
   > It follows from min and max exponents of the primes.
3. Why divide by the gcd before multiplying?
   - [ ] To make the result smaller
   - [x] To avoid overflow in the intermediate product
   - [ ] To keep the result prime
   - [ ] To avoid recursion
   > The final value is the same either way.
4. What is the lcm of two coprime numbers?
   - [ ] 1
   - [x] Their product
   - [ ] Their sum
   - [ ] The larger one
   > The gcd is 1, so the lcm is a times b.

# Prime Number Tests
kind: algorithm
time: O(sqrt n) for trial division, O(k log³ n) for the Miller-Rabin test with k rounds, and O(log^6 n) in theory for the deterministic AKS test; Miller-Rabin with a fixed witness set is deterministic for all 64-bit integers.
space: O(1) for trial division and Miller-Rabin.

## intro
Is a number prime? For small numbers trial division answers instantly. For numbers with hundreds of digits, as in cryptography, trial division is hopeless, and probabilistic tests such as Miller-Rabin decide primality in microseconds with error probabilities lower than hardware failure. Choosing the right test for the size of the number is the practical skill.

## theory
Definition: a prime is an integer greater than 1 whose only positive divisors are 1 and itself. 2 is the only even prime. Every composite number n has a prime factor at most sqrt(n), which is the basis of trial division.

Trial division:

- If n < 2, not prime; check 2 and 3 directly
- Test divisors d from 2 up to sqrt(n); if any divides n, it is composite
- Optimisation: test only 2, 3 and numbers of the form 6k ± 1, because every prime above 3 has that form, cutting the work to a third of the odd candidates
- Cost O(sqrt n): fine for n up to about 10^12, hopeless for 10^18

Examples: 97 is prime (no divisor up to 9), 91 = 7 · 13 is composite, 561 = 3 · 11 · 17 is composite, 1,000,000,007 is prime.

Fermat test: if p is prime, then `a^(p − 1) ≡ 1 (mod p)` for any a not divisible by p. A number failing this for some a is composite. Carmichael numbers such as 561 pass for every coprime a, so the Fermat test alone is not reliable.

Miller-Rabin test: write `n − 1 = 2^s · d` with d odd. For a base a, n passes the test if `a^d ≡ 1 (mod n)` or `a^(2^r · d) ≡ −1 (mod n)` for some r from 0 to s − 1. If n is prime it passes for every base; if n is composite, it passes for at most a quarter of the bases. Repeating with k random bases makes the error probability at most 4^(−k). Each round costs one modular exponentiation, O(log³ n) bit operations, and uses fast exponentiation.

Deterministic Miller-Rabin: for bounded n, a fixed set of bases suffices. The bases 2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31 and 37 are enough for all n < 3.3 × 10^24, and the first 7 bases {2, 325, 9375, 28178, 450775, 9780504, 1795265022} for all 64-bit integers. For n < 3,215,031,751 the bases 2, 3, 5 and 7 suffice.

Other tests:

- Lucas and Baillie-PSW: no known counterexample, used in many libraries (Python's sympy, Java's BigInteger.isProbablePrime uses Miller-Rabin and Lucas)
- AKS (2002): the first deterministic polynomial time test, but too slow in practice
- Sieve for ranges: if many numbers up to N are tested, use the sieve of Eratosthenes (next lesson), O(N log log N) total
- Precomputed small primes: divide by primes below 100 first to reject most composites cheaply

Applications: RSA key generation (find large random primes by testing random odd numbers), hash table sizing, random number generators, primality in contest problems and factoring (trial division by primes up to the cube root plus a primality test of the remainder).

Implementation notes: use modular multiplication that does not overflow (128-bit or `BigInt`/Python integers); handle n < 2, even numbers and small primes first; use `pow(a, d, n)` in Python.

Pitfalls: forgetting 1 is not prime, testing divisors up to n instead of sqrt(n), computing sqrt with floating point errors for large n (use integer square root), using the Fermat test and trusting it on Carmichael numbers, and overflowing in the modular multiplication of Miller-Rabin.

Testing: compare with trial division for all n below 10^5 and test known pseudoprimes (561, 1105, 1729, 2465, 2821, 6601) and large known primes.

## explain
1. Reject numbers below 2 and handle 2 and 3 directly.
2. Reject multiples of 2 and 3.
3. For moderate n, test divisors of the form 6k ± 1 up to the integer square root.
4. For large n, write n − 1 as 2 to the s times d and run Miller-Rabin with fixed or random bases.
5. Use modular exponentiation without overflow.
6. Verify against trial division and known pseudoprimes.

## example
The Python program tests 97, 91, 561 and 1,000,000,007 with trial division and Miller-Rabin, shows that 561 fools the Fermat test with base 2 but not Miller-Rabin, and verifies the deterministic Miller-Rabin against trial division for all numbers below 20,000. The JavaScript program uses 6k ± 1 trial division and counts the primes below 100.

## real
Cryptographic libraries generate RSA primes with Miller-Rabin and Lucas tests, and programming contests use deterministic Miller-Rabin for 64-bit inputs.

## pros
- Trial division is trivial and exact for small numbers
- Miller-Rabin is fast and extremely reliable
- Deterministic base sets exist for 64-bit integers

## cons
- Trial division is exponential in the number of digits
- Probabilistic tests need correct modular arithmetic
- Fermat tests alone are fooled by Carmichael numbers

## uses
- Checking primes in programs and contests
- Generating cryptographic primes
- Factoring with trial division plus a primality check
- Hash table sizing

## mistakes
- Treating 1 as prime
- Testing divisors up to n
- Trusting the Fermat test alone
- Overflowing in the modular multiplication of the test

## interview
**Q:** Why is it enough to test divisors up to the square root of n?
**A:** If n = a · b with a at most b, then a is at most sqrt(n), so a composite number always has a divisor not exceeding its square root.

**Q:** What is the Miller-Rabin test?
**A:** A probabilistic primality test that writes n minus 1 as 2 to the s times d and checks whether a base a produces 1 or minus 1 in the sequence a to the d, a to the 2d, and so on; composites fail for at least three quarters of the bases, so a few rounds give very high confidence.

**Q:** Why is the Fermat test not enough?
**A:** Carmichael numbers like 561 satisfy the Fermat condition for every coprime base although they are composite.

## summary
Small numbers are tested by trial division up to the square root, large ones by Miller-Rabin with fixed bases for 64-bit values or random bases beyond. Use exact modular arithmetic and beware of Carmichael numbers.

## codenote
The Python sample compares trial division and Miller-Rabin. The JavaScript sample uses 6k ± 1.

## code
### python
```python
from math import isqrt

def trial(n):
    if n < 2:
        return False
    if n < 4:
        return True
    if n % 2 == 0 or n % 3 == 0:
        return False
    d = 5
    while d <= isqrt(n):
        if n % d == 0 or n % (d + 2) == 0:
            return False
        d += 6
    return True

def miller_rabin(n):
    if n < 2:
        return False
    for p in (2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37):
        if n % p == 0:
            return n == p
    d, s = n - 1, 0
    while d % 2 == 0:
        d //= 2
        s += 1
    for a in (2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37):
        x = pow(a, d, n)
        if x in (1, n - 1):
            continue
        for _ in range(s - 1):
            x = x * x % n
            if x == n - 1:
                break
        else:
            return False
    return True

for n in (97, 91, 561, 1_000_000_007):
    print(n, trial(n), miller_rabin(n))
print(pow(2, 560, 561), all(trial(n) == miller_rabin(n) for n in range(20000)))
```
Output:
```text
97 True True
91 False False
561 False False
1000000007 True True
1 True
```
### javascript
```javascript
function isPrime(n) {
  if (n < 2) return false;
  if (n < 4) return true;
  if (n % 2 === 0 || n % 3 === 0) return false;
  for (let d = 5; d * d <= n; d += 6) {
    if (n % d === 0 || n % (d + 2) === 0) return false;
  }
  return true;
}

const primes = Array.from({ length: 100 }, (_, i) => i).filter(isPrime);
console.log(primes.length, primes.slice(-5).join(" "));
console.log([1, 2, 91, 97, 561].map((n) => n + ":" + isPrime(n)).join(" "));
```
Output:
```text
25 73 79 83 89 97
1:false 2:true 91:false 97:true 561:false
```

## quiz
1. Up to what value must trial division test divisors?
   - [ ] n
   - [x] The square root of n
   - [ ] n divided by 2
   - [ ] log n
   > A composite number has a divisor at most its square root.
2. Why is 561 important?
   - [ ] It is the smallest prime
   - [x] It is a Carmichael number that fools the Fermat test for coprime bases
   - [ ] It is a power of two
   - [ ] It is perfect
   > It equals 3 times 11 times 17.
3. What is the error probability of Miller-Rabin with k random bases?
   - [ ] 1 divided by k
   - [x] At most 4 to the power minus k
   - [ ] Exactly one half
   - [ ] Zero always
   > Composites fail for at least three quarters of the bases.
4. Which form do all primes above 3 have?
   - [ ] 4k + 1
   - [x] 6k ± 1
   - [ ] 5k
   - [ ] 2k + 1 only
   > Numbers 6k, 6k + 2, 6k + 3 and 6k + 4 are divisible by 2 or 3.

# Sieve of Eratosthenes
kind: algorithm
time: O(n log log n) to find all primes up to n, which is nearly linear; a linear sieve achieves O(n).
space: O(n) for the boolean array (n bits with a bitset), or O(sqrt n) for a segmented sieve.

## intro
The sieve of Eratosthenes finds all primes up to a limit by crossing out multiples. Instead of testing each number separately, it starts from 2, marks every multiple of 2 as composite, then moves to the next unmarked number, 3, and marks its multiples, and so on. What remains unmarked is prime. It is one of the oldest algorithms still in everyday use.

## theory
Algorithm:

- Create a boolean array `is_prime[0..n]` initialised to true, and set 0 and 1 to false
- For p from 2 while `p · p <= n`: if `is_prime[p]` is true, mark `p², p² + p, p² + 2p, ...` up to n as false
- Every index still true is prime

Why start at p²: any smaller multiple `p · k` with k < p has a smaller prime factor and was already marked when that factor was processed. Why stop at sqrt(n): any composite up to n has a prime factor at most sqrt(n), so after processing primes up to sqrt(n) all composites are marked.

Complexity: the marking work is `sum over primes p ≤ sqrt n of n / p`, which is about `n log log n`. For n = 10 million this takes under a second in compiled languages and a few seconds in plain Python (faster with slice assignment or bytearrays). There are 25 primes up to 100, 168 up to 1000, 9,592 up to 100,000 and 78,498 up to 1,000,000.

Optimisations:

- Skip even numbers entirely: store only odd numbers (halves the memory and time)
- Bitset: one bit per number instead of one byte
- Wheel factorisation: skip multiples of 2, 3 and 5 up front
- Segmented sieve: process the range in blocks of size about sqrt(n) that fit in cache, using the primes up to sqrt(n); it finds primes in a window [L, R] with memory O(sqrt R + (R − L)), essential for ranges like 10^12 to 10^12 + 10^6
- Linear sieve (Euler's sieve): each composite is marked exactly once by its smallest prime factor, giving O(n) time and producing the smallest prime factor array as a by-product

Smallest prime factor (SPF) sieve: store for each number its smallest prime factor. Then factorisation of any number up to n takes O(log n) steps by repeatedly dividing by `spf[x]`. For 360 = 2³ · 3² · 5 the SPF chain is 2, 2, 2, 3, 3, 5. This is the standard way to factor many numbers quickly.

Related quantities computed in sieve passes:

- Euler's totient function φ(n) for all n up to N
- Number of divisors and sum of divisors via multiplicative functions
- Möbius function for inclusion-exclusion
- Counting primes π(n) with prefix sums of the boolean array

Applications: prime generation for number theory problems and contests, cryptography preparation, hash table sizes, prime counting, factorisation of many numbers and range queries like the number of primes in an interval.

Comparison with trial division: testing every number up to n with trial division costs about n sqrt(n) / log n; the sieve is far cheaper when all primes in a range are needed, but wasteful for testing a single large number (use Miller-Rabin).

Pitfalls: starting the inner marking at 2p instead of p² (correct but slower), forgetting to mark 0 and 1, memory overflow for n around 10^9 (use a segmented sieve), off-by-one at the limit (allocate n + 1 entries) and using the sieve for sparse queries of huge numbers.

Testing: compare with trial division for n up to a few thousand, and check known counts: 25, 168, 1229 primes up to 100, 1000, 10000.

## explain
1. Allocate a boolean array of size n + 1 filled with true.
2. Mark 0 and 1 as not prime.
3. For each p from 2 up to the square root of n, if p is still marked prime, mark p squared, p squared plus p, and so on as composite.
4. Collect the indices that remain marked.
5. For factorisation, store the smallest prime factor while sieving.
6. For huge ranges use a segmented sieve.

## example
The Python program sieves up to one million and prints the counts 25, 168 and 78,498 for the limits 100, 1000 and 1,000,000, factors 360 and 9,973 using the smallest prime factor array, and checks the sieve against trial division below 2,000. The JavaScript program counts the primes below 100,000, which is 9,592.

## real
Cryptography toolkits, contest solutions and number theory software use sieves to produce primes and factorisations for ranges of numbers.

## pros
- Nearly linear time for all primes up to n
- Simple and extremely fast in practice
- The SPF variant gives fast factorisation

## cons
- Memory grows with n
- Wasteful for testing single huge numbers
- Needs segmentation for very large ranges

## uses
- Generating all primes up to a limit
- Factoring many numbers quickly
- Computing Euler's totient for a range
- Counting primes in intervals

## mistakes
- Marking multiples starting at 2p rather than p squared (slower)
- Forgetting to mark 0 and 1 as non-prime
- Allocating a huge array for a limit near a billion
- Using it to test one very large number

## interview
**Q:** Why does the sieve start marking at p squared?
**A:** Smaller multiples of p have a prime factor smaller than p and were already marked when that prime was processed.

**Q:** How fast is the sieve of Eratosthenes?
**A:** O(n log log n), because each prime p marks about n over p numbers and the sum of 1 over p for primes up to n grows like log log n.

**Q:** How do you factor numbers quickly after sieving?
**A:** Keep the smallest prime factor of each number from the sieve and divide repeatedly by it, giving O(log n) steps per factorisation.

## summary
The sieve of Eratosthenes marks multiples of each prime from its square onward, listing all primes up to n in O(n log log n). Smallest prime factor arrays and segmented versions extend it to fast factorisation and huge ranges.

## codenote
The Python sample sieves, counts and factors. The JavaScript sample counts primes below 100,000.

## code
### python
```python
def sieve(n):
    is_prime = bytearray([1]) * (n + 1)
    is_prime[0:2] = b"\x00\x00"
    for p in range(2, int(n ** 0.5) + 1):
        if is_prime[p]:
            is_prime[p * p::p] = bytearray(len(range(p * p, n + 1, p)))
    return is_prime

flags = sieve(1_000_000)
print([sum(flags[:limit + 1]) for limit in (100, 1000, 1_000_000)])

def smallest_factors(n):
    spf = list(range(n + 1))
    for p in range(2, int(n ** 0.5) + 1):
        if spf[p] == p:
            for multiple in range(p * p, n + 1, p):
                if spf[multiple] == multiple:
                    spf[multiple] = p
    return spf

spf = smallest_factors(10_000)

def factor(x):
    out = []
    while x > 1:
        out.append(spf[x])
        x //= spf[x]
    return out

print(factor(360), factor(9973), factor(10_000))
small = sieve(2000)
print(all(bool(small[i]) == (i > 1 and all(i % d for d in range(2, int(i ** 0.5) + 1))) for i in range(2001)))
```
Output:
```text
[25, 168, 78498]
[2, 2, 2, 3, 3, 5] [9973] [2, 2, 2, 2, 5, 5, 5, 5]
True
```
### javascript
```javascript
function countPrimes(limit) {
  const composite = new Uint8Array(limit + 1);
  let count = 0;
  for (let p = 2; p <= limit; p++) {
    if (composite[p]) continue;
    count++;
    for (let multiple = p * p; multiple <= limit; multiple += p) composite[multiple] = 1;
  }
  return count;
}

console.log(countPrimes(100), countPrimes(100000));
```
Output:
```text
25 9592
```

## quiz
1. What does the sieve of Eratosthenes do?
   - [ ] Tests one number for primality
   - [x] Marks the multiples of each prime to leave only the primes
   - [ ] Factors a single number
   - [ ] Sorts numbers
   > The unmarked numbers are prime.
2. What running time does the sieve have for limit n?
   - [ ] O(n squared)
   - [x] O(n log log n)
   - [ ] O(n log n)
   - [ ] O(sqrt n)
   > Each prime p marks about n over p entries.
3. Why can the outer loop stop at the square root of n?
   - [ ] Larger primes are not needed
   - [x] Every composite up to n has a prime factor at most its square root
   - [ ] Memory is limited
   - [ ] Larger numbers are all prime
   > All composites have been marked by then.
4. What does a segmented sieve save?
   - [ ] Time on small limits
   - [x] Memory, by sieving blocks using the primes up to the square root of the range end
   - [ ] The need for primes
   - [ ] The factorisation step
   > It works on windows that fit in cache.

# Fast Exponentiation
kind: algorithm
time: O(log e) multiplications to compute a^e, instead of e − 1; with a modulus, each multiplication is followed by a remainder.
space: O(1) for the iterative version and O(log e) for the recursive version.

## intro
Computing a to the power e by multiplying a by itself e times takes e − 1 multiplications, which is hopeless when e is a billion. Exponentiation by squaring needs only about log₂ e multiplications by repeatedly squaring the base and using the binary digits of the exponent. Combined with a modulus it is the engine of RSA, hashing and modular counting.

## theory
Idea: write the exponent in binary. Since `a^e = a^(e/2) · a^(e/2)` for even e and `a · a^(e − 1)` for odd e, the exponent halves at every step.

Recursive form: `power(a, 0) = 1`; for e > 0 let `half = power(a, e // 2)`; the result is `half · half` if e is even and `half · half · a` if e is odd. Depth ⌊log₂ e⌋ + 1.

Iterative (binary) form: keep `result = 1`, `base = a`; while e > 0: if the lowest bit of e is set, `result *= base`; then `base *= base`; `e >>= 1`. This multiplies in the powers a, a², a⁴, a⁸, ... that correspond to the set bits of e. For 3¹³ with 13 = 1101 in binary the result is 3¹ · 3⁴ · 3⁸ = 3 · 81 · 6561 = 1,594,323, using 4 squarings and 3 multiplications instead of 12 multiplications.

Modular exponentiation: reduce after each multiplication: `result = result · base % m`, `base = base · base % m`. All values stay below m, so the numbers never grow. Python's built-in `pow(a, e, m)` does exactly this. Computing 2^1000000 mod 1,000,000,007 takes about 20 squarings.

Overflow: with m around 10^9 the product of two residues fits in 64 bits; for larger moduli use 128-bit multiplication or a mulmod based on addition (binary multiplication) or BigInt. Binary exponentiation of integers without a modulus produces big numbers whose size grows linearly with e; use big integers for that.

Variants and uses:

- Negative exponent: `a^(−e) = (a^(−1))^e` modulo m using the modular inverse
- Huge exponents given as strings: reduce the exponent modulo φ(m) when a and m are coprime (Euler's theorem), or use the generalised form for non-coprime cases
- Modular inverse for prime m: `a^(m − 2) mod m` (Fermat's little theorem)
- Matrix exponentiation (next lesson): the same algorithm with matrix multiplication computes linear recurrences in O(k³ log n)
- Exponentiation in any associative structure (a monoid): polynomials, permutations, functions, strings (repeat), 2D transforms
- RSA encryption `c = m^e mod n` and decryption `m = c^d mod n`
- Diffie-Hellman key exchange, discrete logarithm problems and primality tests (Fermat, Miller-Rabin)
- Super power and digit problems: last digits of a^b, such as the last digit of 7^2025 (use period 4 or pow(7, 2025, 10) = 7)
- Computing polynomial hash powers and binomial coefficients with inverses

Right-to-left versus left-to-right binary methods: the right-to-left method above squares the base; the left-to-right method scans bits from the top: `result = result²`, then multiply by a if the bit is set. Both need O(log e) multiplications; left-to-right needs only a fixed small multiplier (a), which helps in hardware and with sliding windows.

Pitfalls: forgetting to apply the modulus to the base initially (a may exceed m), overflow in the product of two residues, integer exponent zero (the result is 1, including 0 to the power 0 by convention), negative exponents without inverses and using floating point `pow` for large exact results (precision loss).

Testing: compare with Python's `pow(a, e, m)` for random inputs, and with repeated multiplication for small exponents.

## explain
1. Start with result 1 and base a (reduced modulo m).
2. While the exponent is positive, multiply the result by the base when the exponent is odd.
3. Square the base and halve the exponent.
4. Apply the modulus after every multiplication.
5. Use wide integers when the modulus is large.
6. Compare with the built-in power in tests.

## example
The Python program implements binary exponentiation, shows 3 to the 13 equals 1,594,323 using 7 multiplications, computes 2 to the power one million modulo 1,000,000,007 and verifies the function against `pow` on 200 random inputs. The JavaScript program uses BigInt to compute modular powers and an RSA toy example.

## real
RSA and Diffie-Hellman rely on modular exponentiation with enormous numbers, and contest solutions use it for counting answers modulo a prime.

## pros
- Only O(log e) multiplications
- Works in any associative structure
- Short iterative code

## cons
- Overflow in the intermediate product needs wide integers
- Negative exponents need inverses
- Floating point versions lose precision

## uses
- Modular powers in counting and hashing
- Modular inverses for prime moduli
- RSA and Diffie-Hellman
- Matrix and polynomial powers

## mistakes
- Not reducing the base modulo m first
- Overflowing in the product of two residues
- Using floating point pow for exact large results
- Treating a negative exponent as if it were positive

## interview
**Q:** How does exponentiation by squaring work?
**A:** It halves the exponent at each step, squaring the base, and multiplies the result by the current base whenever the exponent's lowest bit is set, using O(log e) multiplications.

**Q:** How do you compute a power modulo m without huge numbers?
**A:** Reduce modulo m after every multiplication, so all intermediate values stay below m, and use 128-bit or big integers if m is large enough for the product to overflow.

**Q:** How do you compute a modular inverse with exponentiation?
**A:** For a prime modulus p, the inverse of a is a to the power p minus 2 modulo p by Fermat's little theorem.

## summary
Exponentiation by squaring computes a^e in O(log e) multiplications by using the binary digits of e, and with a modulus after every step it handles astronomically large exponents. It extends to matrices and any associative operation.

## codenote
The Python sample counts multiplications and checks against pow. The JavaScript sample uses BigInt.

## code
### python
```python
import random

def power(a, e, m=None):
    result, multiplications = 1, 0
    while e > 0:
        if e & 1:
            result = result * a if m is None else result * a % m
            multiplications += 1
        a = a * a if m is None else a * a % m
        multiplications += 1
        e >>= 1
    return result, multiplications

print(power(3, 13), 3 ** 13)
print(power(2, 1_000_000, 1_000_000_007)[0], pow(2, 1_000_000, 1_000_000_007))
rng = random.Random(7)
print(all(power(a, e, m)[0] == pow(a, e, m) for a, e, m in ((rng.randint(0, 10**9), rng.randint(0, 10**6), rng.randint(2, 10**9)) for _ in range(200))))
print(pow(7, 2025, 10), power(7, 2025, 10)[0])
```
Output:
```text
(1594323, 7) 1594323
235042059 235042059
True
7 7
```
### javascript
```javascript
function modPow(base, exponent, modulus) {
  let result = 1n;
  base %= modulus;
  while (exponent > 0n) {
    if (exponent & 1n) result = (result * base) % modulus;
    base = (base * base) % modulus;
    exponent >>= 1n;
  }
  return result;
}

console.log(modPow(2n, 1000000n, 1000000007n).toString());
const [p, q, e] = [61n, 53n, 17n];
const n = p * q;
const d = 2753n;
const message = 65n;
const cipher = modPow(message, e, n);
console.log(n.toString(), cipher.toString(), modPow(cipher, d, n).toString());
```
Output:
```text
235042059
3233 2790 65
```

## quiz
1. How many multiplications does exponentiation by squaring need for exponent e?
   - [ ] e
   - [x] About log2 e
   - [ ] e squared
   - [ ] sqrt e
   > The exponent halves at every step.
2. When is the result multiplied by the base?
   - [ ] Always
   - [x] When the lowest bit of the exponent is 1
   - [ ] When the exponent is zero
   - [ ] Only at the end
   > The set bits select which powers of the base are combined.
3. Why apply the modulus after every multiplication?
   - [ ] To make the answer odd
   - [x] To keep intermediate values below the modulus
   - [ ] To speed up the final division only
   - [ ] To avoid squaring
   > The final remainder is unchanged.
4. How is the inverse of a modulo a prime p computed with it?
   - [ ] a to the power p
   - [x] a to the power p minus 2 modulo p
   - [ ] p to the power a
   - [ ] a divided by p
   > Fermat's little theorem gives a to the p minus 1 equal to 1.
