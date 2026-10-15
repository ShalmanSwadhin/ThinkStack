# Matrix Exponentiation
kind: algorithm
time: O(k³ log n) to compute the n-th term of a linear recurrence of order k, since each of the O(log n) squarings multiplies two k by k matrices in O(k³).
space: O(k²) for the matrices.

## intro
Fibonacci numbers computed by the plain recurrence need n steps, which is far too slow for n near 10^18. Writing the recurrence as a matrix multiplication turns the n-th term into the n-th power of a small matrix, and the squaring trick from fast exponentiation computes that power in logarithmic time. Any linear recurrence with constant coefficients yields to the same idea.

## theory
Recurrence as a matrix: the Fibonacci rule F(n+1) = F(n) + F(n−1) is the multiplication of the column vector (F(n), F(n−1)) by the matrix with rows [1 1] and [1 0]. Applying it n times gives `M^n` whose top-right entry is F(n). So `[[1,1],[1,0]]^n = [[F(n+1), F(n)], [F(n), F(n−1)]]`.

Algorithm: compute `M^n` by binary exponentiation, using matrix multiplication instead of integer multiplication. The identity matrix plays the role of 1. Matrix multiplication is associative, so the same halving works: M^n = (M^(n/2))² for even n and M · M^(n−1) for odd n. Matrices of size k need O(k³) per multiplication and O(log n) multiplications.

Generalisation: for an order-k recurrence `a(n) = c1·a(n−1) + c2·a(n−2) + ... + ck·a(n−k)`, build a k by k companion matrix with the coefficients in the first row and ones on the sub-diagonal. Raise it to the power n − k + 1 and multiply by the initial vector. For the tribonacci sequence k = 3, giving 27 operations per multiplication.

Modulus: results grow exponentially, so answers are asked modulo a prime such as 1,000,000,007, and every entry is reduced after each multiplication. F(10^18) mod 1,000,000,007 is then found with about 60 squarings of a 2 by 2 matrix, or around 500 elementary multiplications.

Beyond recurrences:

- Counting walks of length n in a graph: entry (i, j) of the n-th power of the adjacency matrix is the number of walks from i to j (shortest paths with a min-plus matrix product)
- Dynamic programming with transitions that do not depend on the step number, such as counting tilings of a 3 by n board or strings avoiding a pattern (the transition matrix of an automaton)
- Linear transforms applied repeatedly in graphics, Markov chain state distributions after n steps and Leslie population models
- Computing sums of sequences by adding an accumulator row to the matrix (for example sum of the first n Fibonacci numbers)
- Affine recurrences a(n) = c·a(n−1) + d via an extra constant coordinate

Alternatives: the fast doubling formulas for Fibonacci, `F(2k) = F(k)(2F(k+1) − F(k))` and `F(2k+1) = F(k)² + F(k+1)²`, use only O(log n) scalar operations and are faster for this single sequence. The Kitamasa method and Cayley-Hamilton based polynomial approaches reduce general recurrences to O(k² log n) or O(k log k log n). Use plain matrices when k is small (below about 50).

Pitfalls: using the wrong initial vector or exponent offset (off-by-one in the power), forgetting the modulus on every entry, overflow when the modulus is large, zero exponent returning the identity and not copying matrices when updating the result in place.

Testing: compare against the iterative recurrence for n up to a few hundred and check known values (F(10) = 55, F(50) = 12,586,269,025, F(90) = 2,880,067,194,370,816,120).

## explain
1. Express the recurrence as a transition matrix times a state vector.
2. Start the result with the identity matrix.
3. Square the matrix and multiply it into the result according to the bits of the exponent.
4. Reduce every entry modulo the prime after each product.
5. Read the answer from the proper entry, minding the offset.
6. Verify against the straightforward recurrence for small inputs.

## example
The Python program computes Fibonacci numbers with 2 by 2 matrix powers, checks them against the loop for the first 200 terms, prints F(90) and F(10^18) modulo 1,000,000,007, and counts walks of length 5 in a triangle graph. The JavaScript program does the tribonacci sequence with a 3 by 3 matrix.

## real
Contest solutions, Markov chain analysis and transition-based counting use matrix powers when the step count is astronomically large.

## pros
- Turns linear time into logarithmic time for linear recurrences
- Works for any constant coefficient recurrence
- Also counts walks and automaton paths

## cons
- Cubic cost in the matrix size
- Only handles linear recurrences with constant coefficients
- Easy to make offset mistakes

## uses
- Fibonacci and tribonacci at huge indices
- Counting walks of fixed length in graphs
- Automaton and tiling counting
- Markov chain distributions

## mistakes
- Using the wrong exponent offset for the initial vector
- Skipping the modulus on entries
- Starting the result with the zero matrix instead of the identity
- Applying it to recurrences whose coefficients change with n

## interview
**Q:** How do you compute the billionth Fibonacci number quickly?
**A:** Write the recurrence as a 2 by 2 matrix, raise it to the n-th power by repeated squaring and read the answer from an off-diagonal entry, with every entry reduced modulo the required prime.

**Q:** How do you handle a recurrence of order k?
**A:** Build a k by k companion matrix with the coefficients in the first row and ones below the diagonal, raise it to a power of the index and multiply by the initial state vector, costing O(k³ log n).

**Q:** What else can matrix powers count?
**A:** The entries of the n-th power of an adjacency matrix count walks of length n between vertices, and transition matrices of automata count strings of a given length.

## summary
Matrix exponentiation expresses constant coefficient linear recurrences as repeated matrix multiplication and applies binary exponentiation, giving O(k³ log n). It also counts walks and automaton paths, provided the exponent offsets and the modulus are handled with care.

## codenote
The Python sample covers Fibonacci and walk counting. The JavaScript sample does tribonacci with BigInt.

## code
### python
```python
MOD = 1_000_000_007

def mat_mul(a, b, mod=None):
    n = len(a)
    out = [[sum(a[i][t] * b[t][j] for t in range(n)) for j in range(n)] for i in range(n)]
    return out if mod is None else [[x % mod for x in row] for row in out]

def mat_pow(m, e, mod=None):
    size = len(m)
    result = [[int(i == j) for j in range(size)] for i in range(size)]
    while e:
        if e & 1:
            result = mat_mul(result, m, mod)
        m = mat_mul(m, m, mod)
        e >>= 1
    return result

def fib(n, mod=None):
    return mat_pow([[1, 1], [1, 0]], n, mod)[0][1]

loop = [0, 1]
for _ in range(200):
    loop.append(loop[-1] + loop[-2])
print(all(fib(i) == loop[i] for i in range(200)), fib(10), fib(90))
print(fib(10 ** 18, MOD))
triangle = [[0, 1, 1], [1, 0, 1], [1, 1, 0]]
print(mat_pow(triangle, 5))
```
Output:
```text
True 55 2880067194370816120
209783453
[[10, 11, 11], [11, 10, 11], [11, 11, 10]]
```
### javascript
```javascript
function multiply(a, b) {
  return a.map((row, i) => b[0].map((_, j) => row.reduce((sum, _, t) => sum + a[i][t] * b[t][j], 0n)));
}

function power(m, e) {
  let result = m.map((row, i) => row.map((_, j) => (i === j ? 1n : 0n)));
  while (e > 0) {
    if (e & 1) result = multiply(result, m);
    m = multiply(m, m);
    e >>= 1;
  }
  return result;
}

const companion = [[1n, 1n, 1n], [1n, 0n, 0n], [0n, 1n, 0n]];
const tribonacci = (n) => power(companion, n)[2][0];
console.log([0, 1, 2, 3, 4, 5, 10, 30].map(tribonacci).join(" "));
```
Output:
```text
0 0 1 1 2 4 81 15902591
```

## quiz
1. What does the matrix with rows [1 1] and [1 0] raised to the n-th power contain?
   - [ ] Only ones
   - [x] Fibonacci numbers F(n+1), F(n) and F(n−1)
   - [ ] Powers of two
   - [ ] Prime numbers
   > The top-right entry is F(n).
2. What is the cost of the n-th term of an order k recurrence?
   - [ ] O(n)
   - [x] O(k cubed times log n)
   - [ ] O(k times n)
   - [ ] O(log k)
   > It takes log n matrix products of cost k cubed.
3. What should the result start as?
   - [ ] The zero matrix
   - [x] The identity matrix
   - [ ] The transition matrix
   - [ ] A vector of ones
   > The identity is the neutral element for the product.
4. What does entry (i, j) of the n-th power of an adjacency matrix give?
   - [ ] The shortest distance
   - [x] The number of walks of length n from i to j
   - [ ] The degree of i
   - [ ] The number of cycles
   > Each product step extends walks by one edge.

# Combinatorics Basics
kind: concept
time: Not an algorithmic topic — combinatorics is a branch of counting. Computing a binomial coefficient costs O(k) multiplications, a full Pascal triangle row costs O(n), and factorial tables with modular inverses answer many queries in O(1) after O(n) preparation.
space: Not an algorithmic topic — tables of factorials and inverse factorials use O(n) space for queries up to n.

## intro
How many ways can five people line up, how many three-person teams can be chosen from ten, how many paths cross a grid? Combinatorics counts arrangements and selections without listing them. A few basic rules, permutations, combinations and the binomial coefficient, solve a large share of counting questions in interviews and contests.

## theory
Rule of sum and product: if one task has a ways and an alternative has b ways, together they have a + b ways; if a task needs two independent choices with a and b options, it has a · b ways.

Factorial: `n! = n · (n−1) ··· 1` with `0! = 1`. It counts the orderings of n distinct items: 5! = 120. It grows quickly: 10! = 3,628,800 and 20! = 2,432,902,008,176,640,000, which is near the 64-bit limit.

Permutations: ordered selections of k items from n distinct items, `P(n, k) = n! / (n−k)!`. P(10, 3) = 720.

Combinations: unordered selections, `C(n, k) = n! / (k! (n−k)!)`. C(10, 3) = 120, because every group of 3 is counted 3! = 6 times among the 720 ordered picks. Symmetry: `C(n, k) = C(n, n−k)`.

Pascal's rule: `C(n, k) = C(n−1, k−1) + C(n−1, k)`, giving Pascal's triangle. Row sums are `2^n` (the number of subsets of an n-element set), and `C(n, 0) + ... + C(n, n) = 2^n`. The binomial theorem: `(x + y)^n = sum of C(n, k) x^k y^(n−k)`.

Computing C(n, k):

- Multiplicative formula in O(k): `C = C·(n − i)/(i + 1)` for i = 0 .. k−1, dividing exactly at each step (the product of i+1 consecutive integers is divisible by (i+1)!), so integers stay exact
- Pascal's triangle DP in O(n·k) time, which handles small n without division
- Modulo a prime p: precompute factorials and inverse factorials up to n in O(n), then each query is `fact[n] · inv_fact[k] · inv_fact[n−k] mod p` in O(1), using Fermat's little theorem for the inverses (needs n < p)
- Lucas' theorem for n beyond the prime modulus

More counting formulas:

- Permutations with repeated items: `n! / (n1! n2! ...)`; the letters of MISSISSIPPI: 11! / (4! 4! 2!) = 34,650
- Combinations with repetition (stars and bars): choosing k items from n types with repetition allowed is `C(n + k − 1, k)`; distributing 10 identical candies among 4 children: C(13, 3) = 286
- Circular arrangements of n distinct items: (n−1)!
- Lattice paths: moving only right or down across an a by b grid takes `C(a + b, a)` paths, so 20 by 20 gives C(40, 20) = 137,846,528,820
- Catalan numbers: `C(2n, n) / (n+1)` counts balanced parenthesisations (n = 3 gives 5), binary tree shapes and non-crossing partitions
- Derangements, Stirling numbers and partitions (reach into inclusion-exclusion and DP)

Pigeonhole principle: if more than n items go into n boxes, some box holds at least two. Applications: guaranteeing a duplicate, hash collisions, Dirichlet-style arguments.

Applications: probability and expected values, counting dynamic programming states, enumeration limits in backtracking (the number of subsets 2^n and permutations n! predict running time), password counting, combinatorial game analysis, string and tree counting problems.

Pitfalls: confusing ordered with unordered selections, forgetting division by repeated items, overflow in factorials (use the multiplicative form or modular tables), dividing by a factorial modulo a prime without an inverse, and floating-point binomials.

Testing: verify identities such as the row sum 2^n and C(n,k) = C(n,n−k) by code, and compare brute-force enumeration with formulas for small n.

## explain
1. Decide whether order matters.
2. Use the product rule for independent choices.
3. Use P(n, k) for ordered and C(n, k) for unordered selections.
4. Divide by factorials of repeated items.
5. Use stars and bars when repetition is allowed.
6. Precompute factorial tables for many modular queries.

## example
The Python program counts permutations and combinations, checks the formulas against enumeration with `itertools`, prints MISSISSIPPI arrangements (34,650), the 20 by 20 lattice paths (137,846,528,820) and the stars-and-bars example (286), and builds a modular binomial table. The JavaScript program prints a Pascal triangle and the Catalan numbers.

## real
Probability calculations, password strength estimates, tournament scheduling and many programming problems depend on counting arrangements and selections.

## pros
- A handful of formulas cover a large class of problems
- Predicts the size of search spaces
- Modular tables answer queries in constant time

## cons
- Factorials overflow quickly
- Choosing between ordered and unordered cases causes errors
- Hard cases need inclusion-exclusion or DP

## uses
- Counting arrangements and selections
- Estimating brute-force running time
- Probability and expectation
- Grid path and tree shape counting

## mistakes
- Mixing up permutations and combinations
- Forgetting to divide by repeated item factorials
- Overflowing when computing factorials directly
- Using floating-point numbers for binomial coefficients

## interview
**Q:** What is the difference between a permutation and a combination?
**A:** A permutation counts ordered selections, n! over (n−k)!, while a combination counts unordered ones, n! over k!(n−k)!, which is smaller by a factor of k!.

**Q:** How many paths lead across an a by b grid moving only right or down?
**A:** C(a + b, a), because each path is a sequence of a + b moves of which a are horizontal and the order picks the positions.

**Q:** How do you compute many binomial coefficients modulo a prime?
**A:** Precompute factorials and inverse factorials up to n using Fermat's little theorem, then each coefficient is three table lookups and two multiplications.

## summary
Combinatorics counts arrangements with the product rule, factorials, permutations, combinations and stars and bars. Binomial coefficients come from Pascal's rule or factorial tables, and care is needed with order, repetition and overflow.

## codenote
The Python sample verifies formulas by brute force. The JavaScript sample prints Pascal's triangle and Catalan numbers.

## code
### python
```python
from itertools import combinations, permutations
from math import comb, factorial, perm

items = range(7)
print(len(list(permutations(items, 3))) == perm(7, 3), len(list(combinations(items, 3))) == comb(7, 3), perm(10, 3), comb(10, 3))
print(factorial(11) // (factorial(4) * factorial(4) * factorial(2)), comb(40, 20), comb(13, 3))
print(sum(comb(10, k) for k in range(11)) == 2 ** 10, comb(10, 4) == comb(10, 6))

MOD = 1_000_000_007
N = 1000
fact = [1] * (N + 1)
for i in range(1, N + 1):
    fact[i] = fact[i - 1] * i % MOD
inv_fact = [pow(f, MOD - 2, MOD) for f in fact]

def binom(n, k):
    return fact[n] * inv_fact[k] % MOD * inv_fact[n - k] % MOD

print(binom(1000, 500) == comb(1000, 500) % MOD, binom(10, 3))
```
Output:
```text
True True 720 120
34650 137846528820 286
True True
True 120
```
### javascript
```javascript
const rows = [[1]];
for (let n = 1; n < 6; n++) {
  const prev = rows[n - 1];
  rows.push(Array.from({ length: n + 1 }, (_, k) => (prev[k - 1] || 0) + (prev[k] || 0)));
}
rows.forEach((row) => console.log(row.join(" ")));

const catalan = [1];
for (let n = 0; n < 8; n++) catalan.push((catalan[n] * 2 * (2 * n + 1)) / (n + 2));
console.log(catalan.join(" "));
```
Output:
```text
1
1 1
1 2 1
1 3 3 1
1 4 6 4 1
1 5 10 10 5 1
1 1 2 5 14 42 132 429 1430
```

## quiz
1. How many ways can 5 distinct people line up?
   - [ ] 25
   - [x] 120
   - [ ] 60
   - [ ] 5
   > Five factorial equals 120.
2. What is C(10, 3)?
   - [ ] 720
   - [x] 120
   - [ ] 30
   - [ ] 1000
   > Divide the 720 ordered picks by 3 factorial.
3. How many ways can k identical items go to n recipients?
   - [ ] n to the power k
   - [x] C(n + k − 1, k)
   - [ ] n times k
   - [ ] C(n, k)
   > Stars and bars places n − 1 dividers among the items.
4. What is the sum of a row of Pascal's triangle with index n?
   - [ ] n squared
   - [x] 2 to the power n
   - [ ] n factorial
   - [ ] n plus 1
   > It counts all subsets of an n-element set.

# Inclusion Exclusion
kind: algorithm
time: O(2^k) terms for k sets when every intersection is evaluated; with structured intersections such as divisibility by pairwise coprime numbers each term costs O(k), and with symmetry the sum can collapse to O(k) terms.
space: O(k) for the recursion or the bitmask, or O(1) beyond the inputs.

## intro
Adding the sizes of two overlapping groups counts the shared members twice. Inclusion-exclusion corrects this: add the sizes of the groups, subtract the sizes of pairwise overlaps, add back the triple overlaps, and so on alternately. It counts the elements that satisfy at least one of several conditions, or none of them, without listing the elements.

## theory
Two sets: `|A ∪ B| = |A| + |B| − |A ∩ B|`. Three sets: `|A ∪ B ∪ C| = |A| + |B| + |C| − |A∩B| − |A∩C| − |B∩C| + |A∩B∩C|`.

General principle: for sets A1..Ak, `|A1 ∪ ... ∪ Ak| = sum over non-empty subsets S of (−1)^(|S|+1) · |intersection of the sets in S|`. The complement form counts the elements in none of the sets: `N − |union| = sum over all subsets S of (−1)^|S| · |intersection of S|`, with the empty subset contributing N.

Why it works: an element belonging to exactly m ≥ 1 of the sets is counted `C(m,1) − C(m,2) + ... ± C(m,m) = 1` times in the signed sum, because the alternating sum of binomial coefficients `sum (−1)^j C(m, j)` is zero for m ≥ 1.

Computing it: enumerate the subsets with a bitmask loop from 1 to 2^k − 1, take the intersection size for each subset and add or subtract by parity of its size. This costs O(2^k) terms, practical for k up to about 20.

Classic example: numbers up to 100 divisible by 2, 3 or 5. Single sets: 50 + 33 + 20 = 103; pairs (divisible by 6, 10, 15): 16 + 10 + 6 = 32; triple (divisible by 30): 3. Union = 103 − 32 + 3 = 74. So 26 numbers up to 100 are divisible by none of them; these are 1, the 22 primes above 5 and composites such as 49, 77 and 91.

Typical applications:

- Counting integers up to N coprime to a number: use the distinct prime factors of that number, with intersections being divisibility by the products of the primes. The count of integers in 1..n coprime to n equals Euler's totient `φ(n) = n·∏(1 − 1/p)`, which is inclusion-exclusion collapsed into a product
- Counting derangements (permutations with no fixed point): `D(n) = n! · sum over j of (−1)^j / j!`. D(4) = 9 and D(5) = 44
- Counting surjections from n elements onto k targets: `sum (−1)^j C(k, j) (k − j)^n`
- Counting strings or arrays that avoid forbidden patterns, by counting those violating a chosen subset of constraints
- Counting solutions of `x1 + ... + xk = n` with upper bounds on the variables: unconstrained stars and bars minus the solutions that violate bounds, added back in pairs
- Number of lattice paths avoiding blocked cells, probability of unions of events, Möbius inversion in number theory and counting sets with gcd conditions
- Subset sums over bitmasks: in dynamic programming over subsets, "SOS DP" is related to inclusion-exclusion in structure

When a union of conditions is hard but intersections are easy, inclusion-exclusion transforms the problem. When k is large but conditions are symmetric, group subsets by size: the term for size j is `(−1)^j C(k, j) · f(j)`, so only k + 1 distinct terms exist.

Pitfalls: sign errors (parity of the subset size), forgetting the empty-set term in complement counting, computing intersections wrongly (the lcm is needed for divisibility, not the product, unless the numbers are coprime), exponential blow-up for large k and integer overflow in the products.

Testing: compare with brute force enumeration over a small range, and verify classic values (74 for the example, D(4) = 9, φ(36) = 12).

## explain
1. Define the sets whose union or complement you count.
2. Loop over all non-empty subsets, tracking subset size.
3. Compute the intersection size of each subset, using the lcm for divisibility conditions.
4. Add the term for odd subset sizes and subtract it for even sizes.
5. For complement counting, start from the total and alternate signs from the empty set.
6. Group symmetric terms to reduce the exponential cost.

## example
The Python program counts the numbers up to 100 divisible by 2, 3 or 5 (74), those coprime to 30 (26), derangements of 4 and 5 items (9 and 44), the totient of 36 (12), and checks each result against brute force. The JavaScript program counts surjections with the symmetric formula.

## real
Probability of unions of events, counting under constraints in contests, totient computation and derangement style puzzles all use alternating sums.

## pros
- Turns hard union counts into easy intersections
- General formula with a clear correctness proof
- Collapses to closed forms for symmetric problems

## cons
- Exponential number of terms
- Sign and intersection mistakes are common
- Big intermediate values

## uses
- Counting numbers coprime to a given number
- Derangements and surjections
- Counting with forbidden patterns
- Probability of unions

## mistakes
- Getting the alternating signs wrong
- Using the product instead of the lcm for non-coprime divisors
- Forgetting the empty subset in complement counting
- Applying it with too many sets without symmetry

## interview
**Q:** What does inclusion-exclusion compute and how?
**A:** It computes the size of a union by adding single set sizes, subtracting pairwise intersections, adding triples and so on, alternating signs so that each element is counted exactly once.

**Q:** How many integers up to N are divisible by at least one of k given numbers?
**A:** Sum over non-empty subsets with sign (−1) to the size plus one of N divided by the lcm of the subset, costing O(2^k).

**Q:** How can the exponential cost be reduced?
**A:** If the sets are symmetric, group subsets by size and use binomial coefficients, as in the closed formulas for derangements and surjections.

## summary
Inclusion-exclusion counts unions and complements by alternating sums over intersections, giving totients, derangements and constrained counts. The cost is exponential in the number of sets unless symmetry collapses the sum.

## codenote
The Python sample runs the bitmask version and checks by brute force. The JavaScript sample counts surjections.

## code
### python
```python
from math import comb, factorial, gcd

def lcm(a, b):
    return a // gcd(a, b) * b

def divisible_by_any(n, numbers):
    total = 0
    for mask in range(1, 1 << len(numbers)):
        chosen = [numbers[i] for i in range(len(numbers)) if mask >> i & 1]
        step = 1
        for value in chosen:
            step = lcm(step, value)
        total += (-1) ** (len(chosen) + 1) * (n // step)
    return total

any_count = divisible_by_any(100, [2, 3, 5])
print(any_count, 100 - any_count, sum(1 for x in range(1, 101) if x % 2 == 0 or x % 3 == 0 or x % 5 == 0))

def derangements(n):
    return sum((-1) ** j * factorial(n) // factorial(j) for j in range(n + 1))

print(derangements(4), derangements(5))
n = 36
phi = n - divisible_by_any(n, [2, 3])
print(phi, sum(1 for x in range(1, n + 1) if gcd(x, n) == 1))
```
Output:
```text
74 26 74
9 44
12 12
```
### javascript
```javascript
const choose = (n, k) => {
  let result = 1;
  for (let i = 0; i < k; i++) result = (result * (n - i)) / (i + 1);
  return result;
};

function surjections(n, k) {
  let total = 0;
  for (let j = 0; j <= k; j++) total += (j % 2 ? -1 : 1) * choose(k, j) * (k - j) ** n;
  return total;
}

console.log(surjections(4, 2), surjections(4, 3), surjections(5, 3));
```
Output:
```text
14 36 150
```

## quiz
1. What is the union formula for two sets?
   - [ ] The product of the two set sizes
   - [x] Sum of sizes minus the size of the intersection
   - [ ] The difference of the set sizes
   - [ ] Sum of sizes plus the size of the intersection
   > The intersection would otherwise be counted twice.
2. What sign does the term for a subset of three sets get in the union formula?
   - [ ] Negative
   - [x] Positive
   - [ ] Zero
   - [ ] It varies
   > Odd sized subsets are added and even ones subtracted.
3. Which value is needed for divisibility by two numbers at once?
   - [ ] Their sum
   - [x] Their least common multiple
   - [ ] Their difference
   - [ ] Their gcd
   > A number divisible by both is a multiple of the lcm.
4. How many terms does the general formula have for k sets?
   - [ ] k
   - [x] 2 to the power k minus 1
   - [ ] k squared
   - [ ] k factorial
   > There is one term for each non-empty subset.

# Fermat Little Theorem
kind: concept
time: Not an algorithmic topic — Fermat's little theorem is a mathematical fact. Using it to compute a modular inverse costs O(log p) multiplications through fast exponentiation.
space: Not an algorithmic topic — the inverse computation needs only O(1) extra values.

## intro
Fermat's little theorem says that raising a number to a prime power behaves in a surprisingly regular way: for a prime p, any a not divisible by p satisfies a to the power p−1 equal to 1 modulo p. This one fact gives a one-line modular inverse, shortens huge exponents and powers a primality check, which is why it appears throughout competitive programming and cryptography.

## theory
Statement: if p is prime and p does not divide a, then `a^(p−1) ≡ 1 (mod p)`. Equivalent form for every integer a: `a^p ≡ a (mod p)`.

Examples: 2⁶ = 64 = 9·7 + 1, so 2⁶ ≡ 1 (mod 7). For p = 13 and a = 5, 5¹² ≡ 1. For p = 11 and a = 3, 3¹⁰ = 59049 = 11·5368 + 1.

Proof idea: multiply each of the residues 1, 2, ..., p−1 by a. Because a is invertible modulo p, the results are a permutation of 1..p−1. So the products are equal: `a^(p−1) · (p−1)! ≡ (p−1)! (mod p)`. Cancel the unit (p−1)! to obtain the claim.

Modular inverse: from `a · a^(p−2) ≡ 1`, the inverse of a is `a^(p−2) mod p`. Compute it with fast exponentiation in O(log p). For p = 1,000,000,007 and a = 2, the inverse is 500,000,004, since 2 · 500,000,004 = 1,000,000,008 ≡ 1. Division by b in a modular expression becomes multiplication by `b^(p−2)`.

Reducing exponents: since the powers of a repeat with period dividing p−1, `a^e ≡ a^(e mod (p−1))`. This lets you compute towers such as a^(b^c) mod p by evaluating b^c modulo p−1 first. For a composite modulus the generalisation is Euler's theorem: `a^φ(m) ≡ 1 (mod m)` when gcd(a, m) = 1, and a generalised version with the extra condition on the exponent when it is not.

Primality testing: the Fermat test checks `a^(n−1) ≡ 1 (mod n)` for a few bases. It is quick but fails for Carmichael numbers like 561, which pass for every coprime base; Miller-Rabin repairs this with square roots of 1.

Consequences and related facts:

- Wilson's theorem: `(p−1)! ≡ −1 (mod p)` exactly when p is prime
- The multiplicative order of a modulo p divides p−1; primitive roots have order exactly p−1 (used in discrete logarithms and number theoretic transforms)
- Lucas' theorem: binomial coefficients modulo p computed digit by digit in base p
- Factorial tables with inverse factorials: `inv_fact[n] = fact[n]^(p−2)`, then going downward `inv_fact[i−1] = inv_fact[i] · i`
- Hashing: polynomial hash collisions analysed with modular arithmetic over a prime field
- RSA correctness is based on the Euler version of the theorem

Limitations: the modulus must be prime for the inverse formula, so for composite moduli use the extended Euclidean algorithm; a must not be a multiple of p; for p up to 3·10^9 the products fit in 64 bits, otherwise use wider arithmetic.

Pitfalls: using p−1 instead of p−2 for the inverse, applying the formula with a non-prime modulus (such as 10^9 or 998,244,350), exponentiating a zero residue (no inverse exists) and trusting the Fermat test as a proof of primality.

Testing: check a^(p−1) mod p equals 1 for all a in 1..p−1 for a few primes, and compare inverses with the extended Euclidean results.

## explain
1. Confirm that the modulus p is prime and a is not a multiple of p.
2. Use a to the power p minus 1 equals 1 to reason about periodicity.
3. Compute the inverse as a to the power p minus 2 by fast exponentiation.
4. Reduce huge exponents modulo p minus 1.
5. Use Euler's totient for composite moduli.
6. Do not treat a passed Fermat test as proof of primality.

## example
The Python program verifies the theorem for several primes, shows the inverse of 2 (500,000,004), builds inverse factorial tables, reduces an exponent tower and demonstrates that 561 passes the Fermat test for base 2. The JavaScript program checks `a^p mod p` equals a and computes inverses by exponentiation.

## real
Almost every counting solution modulo 1,000,000,007 divides using this theorem, and RSA and primality tests are built on it.

## pros
- One-line modular inverse for prime moduli
- Shrinks gigantic exponents
- Foundation for primality tests and cryptography

## cons
- Requires a prime modulus
- Useless for multiples of the prime
- The converse is false because of Carmichael numbers

## uses
- Modular division in counting problems
- Factorial and binomial tables
- Reducing exponent towers
- Probabilistic primality tests

## mistakes
- Using the exponent p minus 1 instead of p minus 2 for the inverse
- Applying it with a composite modulus
- Taking the inverse of a multiple of the prime
- Treating a passed Fermat test as a proof

## interview
**Q:** State Fermat's little theorem and its use for inverses.
**A:** For a prime p and a not divisible by p, a to the p minus 1 is congruent to 1 modulo p, so a to the p minus 2 is the inverse of a, computed by fast exponentiation in O(log p).

**Q:** Why does the theorem fail as a primality proof?
**A:** Carmichael numbers such as 561 satisfy the congruence for every coprime base although they are composite, so more refined tests are needed.

**Q:** How do you reduce a huge exponent modulo a prime?
**A:** The powers repeat with period dividing p minus 1, so replace the exponent by its remainder modulo p minus 1, provided a is not a multiple of p.

## summary
Fermat's little theorem says a to the p−1 is 1 modulo a prime p, giving inverses as a to the p−2, exponent reduction modulo p−1 and the basis of primality tests. It needs a prime modulus and a non-multiple base.

## codenote
The Python sample verifies the theorem and uses inverses. The JavaScript sample checks a to the p.

## code
### python
```python
MOD = 1_000_000_007

for p in (7, 13, 101, 997):
    print(p, all(pow(a, p - 1, p) == 1 for a in range(1, p)), all(pow(a, p, p) == a % p for a in range(p)))

inv2 = pow(2, MOD - 2, MOD)
print(inv2, 2 * inv2 % MOD, pow(2, -1, MOD) == inv2)

n = 10
fact = [1] * (n + 1)
for i in range(1, n + 1):
    fact[i] = fact[i - 1] * i % MOD
inv = [0] * (n + 1)
inv[n] = pow(fact[n], MOD - 2, MOD)
for i in range(n, 0, -1):
    inv[i - 1] = inv[i] * i % MOD
print(all(fact[i] * inv[i] % MOD == 1 for i in range(n + 1)))

b, c = 123456789, 987654321
tower = pow(3, pow(b, c, MOD - 1), MOD)
print(tower, pow(2, 560, 561))
```
Output:
```text
7 True True
13 True True
101 True True
997 True True
500000004 1 True
True
721930938 1
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

const p = 1000000007n;
console.log([2n, 3n, 10n].map((a) => modPow(a, p - 2n, p).toString()).join(" "));
console.log(modPow(5n, 12n, 13n).toString(), modPow(7n, 13n, 13n).toString());
```
Output:
```text
500000004 333333336 700000005
1 7
```

## quiz
1. What does Fermat's little theorem state for a prime p?
   - [ ] a to the p equals p
   - [x] a to the p minus 1 is congruent to 1 modulo p for a not divisible by p
   - [ ] p divides a
   - [ ] a plus p is prime
   > Equivalently a to the p is congruent to a.
2. How is the inverse of a modulo a prime p computed?
   - [ ] a to the power p
   - [x] a to the power p minus 2
   - [ ] p minus a
   - [ ] a divided by p
   > Multiplying by a gives a to the p minus 1, which is 1.
3. Why does the theorem not prove primality?
   - [ ] It is false
   - [x] Carmichael numbers satisfy it for every coprime base
   - [ ] It needs even numbers
   - [ ] It only works for small p
   > The converse is not true.
4. How can the exponent of a huge power be reduced modulo a prime p?
   - [ ] Modulo p
   - [x] Modulo p minus 1
   - [ ] Modulo 2
   - [ ] It cannot be reduced
   > The powers have period dividing p minus 1.

# Chinese Remainder Theorem Intro
kind: algorithm
time: O(k log M) for combining k congruences with pairwise coprime moduli whose product is M, using one extended Euclidean computation per step.
space: O(1) beyond the inputs when combined incrementally, with the combined modulus growing up to M.

## intro
A general counts soldiers by lining them up in rows of 3, then of 5, then of 7, and only records the leftovers: 2, 3 and 2. From those three remainders the total, within a range of 105, is determined uniquely. The Chinese remainder theorem is the rule behind this trick, and it lets you work with several small moduli instead of one huge one.

## theory
Theorem: let m1, m2, ..., mk be pairwise coprime positive integers and M their product. For any remainders r1..rk, the system `x ≡ r1 (mod m1), ..., x ≡ rk (mod mk)` has exactly one solution modulo M.

Example: `x ≡ 2 (mod 3)`, `x ≡ 3 (mod 5)`, `x ≡ 2 (mod 7)`. M = 105 and the unique solution is x = 23, since 23 mod 3 = 2, 23 mod 5 = 3, 23 mod 7 = 2. All solutions are 23 + 105t.

Construction (Gauss): for each i let `Mi = M / mi`, find the inverse `yi` of Mi modulo mi (it exists because Mi is coprime to mi), and set `x = sum of ri · Mi · yi (mod M)`. Each term is 0 modulo every modulus except mi, where it equals ri. For the example: M1 = 35 with inverse 2 modulo 3, M2 = 21 with inverse 1 modulo 5, M3 = 15 with inverse 1 modulo 7, so x = 2·35·2 + 3·21·1 + 2·15·1 = 140 + 63 + 30 = 233, and 233 mod 105 = 23.

Incremental merging: solve two congruences at a time. Given `x ≡ a (mod m)` and `x ≡ b (mod n)`, write `x = a + m·t` and solve `m·t ≡ b − a (mod n)`, which uses the extended Euclidean algorithm to find the inverse of m modulo n. The combined congruence has modulus m·n. This is simpler to code and handles the general case.

Non-coprime moduli: the system `x ≡ a (mod m)`, `x ≡ b (mod n)` is solvable exactly when `a ≡ b (mod gcd(m, n))`, and then the solution is unique modulo `lcm(m, n)`. Example: `x ≡ 1 (mod 4)` and `x ≡ 5 (mod 6)` has gcd 2 and 1 ≡ 5 (mod 2), so it is solvable: x = 5 modulo 12. The system `x ≡ 1 (mod 4)`, `x ≡ 2 (mod 6)` has no solution because 1 and 2 differ modulo 2.

Why it matters:

- Computing with big numbers using several small moduli: do additions and multiplications in each residue system separately and recombine at the end, as in residue number systems and multi-modular arithmetic (computing exact results of a large determinant or a convolution with several NTT primes, then recombining)
- Speeding up RSA decryption: decrypt modulo p and modulo q separately, then combine, which is about four times faster
- Counting problems modulo a composite number: factor the modulus into prime powers, solve each, and combine with CRT (for example binomial coefficients modulo 10^9 + 6 or modulo 1000)
- Calendar and scheduling puzzles: when do events with different cycles coincide (two periodic events with offsets)
- Secret sharing and error correction (Mignotte and Asmuth-Bloom schemes)
- Puzzles from ancient texts such as Sun Tzu's remainder problem

Complexity details: each merge needs O(log m) for the extended Euclidean algorithm, and the numbers grow to M, so use big integers or modulus below 10^9 per step to avoid overflow in products (reduce intermediate products).

Pitfalls: assuming the moduli are coprime without checking, forgetting to normalise remainders into [0, m), overflow in the product of the moduli, mistaking the unique solution modulo M for a unique integer and returning no solution when only the consistency condition fails.

Testing: compare with brute force search over the range 0..M−1, test non-coprime systems and detect inconsistency correctly.

## explain
1. Check whether the moduli are pairwise coprime, or test the gcd consistency condition when merging.
2. Merge two congruences at a time using the extended Euclidean algorithm.
3. Keep the combined residue and the lcm of the moduli.
4. Report no solution when the remainders disagree modulo the gcd.
5. Normalise the answer into the range 0 to M minus 1.
6. Verify the result against each original congruence.

## example
The Python program solves Sun Tzu's system (answer 23 modulo 105), a system with non-coprime moduli (answer 5 modulo 12), detects an inconsistent system, and checks results by brute force. The JavaScript program decomposes a large number into residues modulo three primes and rebuilds it.

## real
RSA implementations, modular counting with composite moduli and residue-number-system hardware use the theorem to split big computations into small independent ones.

## pros
- Splits one big modulus into small independent problems
- Gives a unique solution modulo the product
- Extends to non-coprime moduli with a consistency check

## cons
- Needs coprimality or a consistency check
- Requires modular inverses
- Combined modulus can overflow

## uses
- Speeding up RSA decryption
- Counting modulo composite numbers
- Multi-modular big number arithmetic
- Periodic event coincidence

## mistakes
- Assuming pairwise coprime moduli without checking
- Forgetting the consistency check for non-coprime moduli
- Overflowing when forming the product of the moduli
- Returning an unnormalised negative remainder

## interview
**Q:** What does the Chinese remainder theorem guarantee?
**A:** For pairwise coprime moduli, any set of remainders is matched by exactly one integer modulo the product of the moduli.

**Q:** How do you merge two congruences?
**A:** Write x as a plus m times t, solve m times t congruent to b minus a modulo n using the extended Euclidean algorithm, and the result is a congruence modulo the lcm of m and n, solvable only if the remainders agree modulo the gcd.

**Q:** Where is it used in practice?
**A:** In RSA decryption speedups, in multi-modular big number arithmetic and in counting problems with composite moduli split into prime powers.

## summary
The Chinese remainder theorem combines congruences with coprime moduli into one unique solution modulo the product, and generalises with a gcd consistency check. It splits big modular problems into small ones and recombines them.

## codenote
The Python sample merges congruences. The JavaScript sample splits and rebuilds a number.

## code
### python
```python
from math import gcd

def merge(a, m, b, n):
    g = gcd(m, n)
    if (b - a) % g:
        return None
    lcm = m // g * n
    t = ((b - a) // g * pow(m // g, -1, n // g)) % (n // g)
    return (a + m * t) % lcm, lcm

def crt(congruences):
    residue, modulus = 0, 1
    for r, m in congruences:
        merged = merge(residue, modulus, r % m, m)
        if merged is None:
            return None
        residue, modulus = merged
    return residue, modulus

print(crt([(2, 3), (3, 5), (2, 7)]))
print(crt([(1, 4), (5, 6)]), crt([(1, 4), (2, 6)]))
residue, modulus = crt([(2, 3), (3, 5), (2, 7)])
print([x for x in range(modulus) if x % 3 == 2 and x % 5 == 3 and x % 7 == 2])
print(crt([(3, 11), (4, 13), (5, 17)]))
```
Output:
```text
(23, 105)
(5, 12) None
[23]
(498, 2431)
```
### javascript
```javascript
const moduli = [1000003, 1000033, 1000037];
const value = 987654321987n;
const residues = moduli.map((m) => Number(value % BigInt(m)));

const inverse = (a, m) => {
  for (let x = 1; x < m; x++) if ((a * x) % m === 1) return x;
};
let result = 0n;
let product = 1n;
residues.forEach((r, i) => {
  const m = BigInt(moduli[i]);
  const current = Number(product % m);
  const step = BigInt((((r - Number(result % m)) % moduli[i] + moduli[i]) % moduli[i]) * inverse(current, moduli[i]) % moduli[i]);
  result += product * step;
  product *= m;
});
console.log(residues.join(" "), result.toString(), result === value);
```
Output:
```text
359034 730494 780158 987654321987 true
```

## quiz
1. What does the Chinese remainder theorem state for pairwise coprime moduli?
   - [ ] No solution exists
   - [x] A unique solution exists modulo the product of the moduli
   - [ ] Infinitely many solutions modulo each modulus
   - [ ] The solution is always prime
   > Every combination of remainders is realised once.
2. When is a system with non-coprime moduli m and n solvable?
   - [ ] Always
   - [x] When the remainders agree modulo gcd(m, n)
   - [ ] When m divides n
   - [ ] Never
   > The solution is then unique modulo the lcm.
3. What tool finds the multiplier when merging congruences?
   - [ ] Sorting
   - [x] The extended Euclidean algorithm
   - [ ] The sieve
   - [ ] Binary search
   > It gives the modular inverse of m modulo n.
4. How does CRT speed up RSA decryption?
   - [ ] It uses smaller messages
   - [x] It computes modulo p and q separately, then combines
   - [ ] It avoids exponentiation
   - [ ] It skips the private key
   > The exponentiations use half sized numbers.

# Math for Competitive Programming
kind: concept
time: Not an algorithmic topic — this lesson collects number theory habits. The typical tools cost O(log n) for gcd and fast powers, O(n log log n) for sieves and O(sqrt n) for factoring or divisor enumeration of one number.
space: Not an algorithmic topic — precomputed tables of factorials, inverses and primes use O(n) space for limits near 10^6 to 10^7.

## intro
Contest problems often hide a number theory trick behind a story about counting, grids or schedules. Knowing a small kit of mathematical tools, and the limits at which each one is needed, turns an impossible-looking brute force into a few lines of code. This lesson lists the kit, the thresholds and the traps that decide whether a solution passes.

## theory
Read the constraints first. The value of n tells the intended complexity: n up to 10^5 allows O(n log n); n up to 10^7 needs a sieve or linear solution; n up to 10^18 demands O(log n) or O(sqrt n) with care, meaning arithmetic formulas, fast exponentiation or number theory rather than loops.

The standard modulus: answers "modulo 1,000,000,007" or "modulo 998,244,353", both primes. Keep every intermediate value reduced, normalise subtraction with `+ MOD`, and multiply in 64-bit before reducing. Use a factorial table, inverse factorials and `nCr` in O(1).

Toolkit with typical costs:

- Fast exponentiation for powers and inverses, O(log e)
- GCD and LCM, O(log n); extended GCD for inverses and Diophantine equations
- Sieve of Eratosthenes for primes up to about 10^7 and smallest-prime-factor tables for fast factorisation
- Trial division up to sqrt(n) for a single number up to 10^12; Miller-Rabin and Pollard's rho for 64-bit numbers
- Divisor enumeration in O(sqrt n); number of divisors and sum of divisors from the prime factorisation (for 360 = 2³·3²·5 the count is 4·3·2 = 24)
- Euler's totient φ(n) from the factorisation, or by sieve for a range
- Combinatorics: binomials, Pascal's rule, stars and bars, Catalan numbers, inclusion-exclusion
- Matrix exponentiation for linear recurrences with huge n
- Chinese remainder theorem for combining congruences
- Digit tricks: parity, last digits via modulo 10, digit sum modulo 9 for divisibility by 9
- Floor sum and harmonic series: `sum over i of floor(n / i)` takes only about 2·sqrt(n) distinct values, so iterate over blocks of equal quotient; iterating multiples for each i totals n·(1 + 1/2 + ... + 1/n) ≈ n ln n steps
- Prefix sums, difference arrays and closed-form arithmetic series (n(n+1)/2) instead of loops
- Bit tricks: powers of two check `x & (x−1)`, counting set bits, XOR properties (a ^ a = 0), subset enumeration with masks
- Parity and invariants: use them to prove impossibility or to reduce a problem (checkerboard colouring, sum parity)
- Pigeonhole and monotonic arguments for existence proofs
- Binary search on the answer when feasibility is monotone

Overflow discipline: a product of two numbers below 10^9 fits in 64 bits, a product of three does not. Python has big integers but is slower; in C++ use `long long` or `__int128`, in Java `long` or `BigInteger`, in JavaScript use `BigInt` beyond 2^53.

Typical patterns:

- "Count pairs with gcd 1" uses Möbius inversion or inclusion-exclusion over divisors
- "Sum over all subarrays" uses a contribution technique: each element contributes its value times the number of subarrays containing it, `(i+1)(n−i)`
- "Find the n-th term of a recurrence" uses matrix exponentiation or fast doubling
- "Answer for every k from 1 to n" often uses harmonic sums (n log n)
- "Compare huge numbers" uses logarithms or modular fingerprints, with the risk of collisions

Practice routine: derive the formula on small cases, write a brute force, then compare it against the optimised solution on random small inputs; check boundary values (n = 0, 1, prime, perfect square, maximum constraints).

Pitfalls: forgetting the modulus on one term, dividing without an inverse, integer overflow in intermediate products, using floating point for exact values, off-by-one in closed formulas and relying on a brute force that is already too slow for the largest tests.

## explain
1. Read constraints and infer the target complexity.
2. Pick the matching tool from the toolkit.
3. Reduce every intermediate result modulo the prime.
4. Replace loops by formulas when the structure is arithmetic.
5. Write a brute force and compare with the optimised code on random tests.
6. Test boundaries and the largest inputs for overflow.

## example
The Python program shows three recurring tricks: the number of divisors of 360 from its factorisation (24), the sum of floor(n / i) computed in O(sqrt n) blocks compared with the direct loop, and the contribution technique for the sum over all subarrays of an array, checked against brute force.

## real
Contest problems, coding interviews with arithmetic puzzles and performance sensitive code all draw on this toolkit.

## pros
- A small kit solves many problems
- Constraints give clear hints about the method
- Brute force comparison catches formula errors

## cons
- Formulas are easy to get off by one
- Overflow and modulus errors are silent
- Proofs of correctness take time

## uses
- Counting problems modulo a prime
- Divisor, prime and totient queries
- Closed form sums and contribution counting
- Huge-index recurrences

## mistakes
- Forgetting the modulus on one term of an expression
- Overflowing a product of three values
- Relying on floating point for exact results
- Not comparing the formula with a brute force

## interview
**Q:** How do constraints guide the solution?
**A:** Sizes up to 10^5 allow O(n log n), up to 10^7 point to sieves or linear passes, and up to 10^18 require logarithmic or square-root methods based on formulas, fast exponentiation or number theory.

**Q:** How do you sum floor(n over i) for all i quickly?
**A:** The quotient takes only about 2 times the square root of n distinct values, so process blocks of consecutive i with equal quotient, finishing in O(sqrt n).

**Q:** How do you validate an optimised formula?
**A:** Write a simple brute force, run both on many small random inputs, and also test boundary cases such as 0, 1, primes and the maximum constraints.

## summary
Competitive programming mathematics is a toolkit: modular arithmetic, fast powers, gcd, sieves, factorisation, combinatorics, matrix powers, CRT and contribution counting, chosen from the constraints and verified against a brute force with attention to overflow.

## codenote
The Python sample shows three recurring tricks and verifies each by brute force.

## code
### python
```python
import random
from math import isqrt

def divisor_count(n):
    count, p = 1, 2
    while p * p <= n:
        exponent = 0
        while n % p == 0:
            n //= p
            exponent += 1
        count *= exponent + 1
        p += 1
    return count * 2 if n > 1 else count

print(divisor_count(360), sum(1 for d in range(1, 361) if 360 % d == 0), divisor_count(97))

def floor_sum(n):
    total, i = 0, 1
    while i <= n:
        q = n // i
        j = n // q
        total += q * (j - i + 1)
        i = j + 1
    return total

print(floor_sum(10 ** 6), sum(10 ** 6 // i for i in range(1, 10 ** 6 + 1)), isqrt(10 ** 6))

def subarray_sum(values):
    n = len(values)
    return sum(v * (i + 1) * (n - i) for i, v in enumerate(values))

rng = random.Random(3)
sample = [rng.randint(1, 9) for _ in range(30)]
brute = sum(sum(sample[i:j]) for i in range(30) for j in range(i + 1, 31))
print(subarray_sum(sample) == brute, subarray_sum([1, 2, 3]))
```
Output:
```text
24 24 2
13970034 13970034 1000
True 20
```

## quiz
1. What does n up to 10^18 usually imply?
   - [ ] A simple loop over n
   - [x] A logarithmic or formula based solution
   - [ ] A quadratic algorithm
   - [ ] A sieve up to n
   > Loops over such a range are far too slow.
2. How many distinct values does floor(n over i) take?
   - [ ] n
   - [x] About two times the square root of n
   - [ ] log n
   - [ ] 2
   > Blocks of equal quotient make the sum O(sqrt n).
3. What does the contribution technique count?
   - [ ] Duplicate elements
   - [x] How many subarrays include each element
   - [ ] The median
   - [ ] Prime elements
   > An element at index i appears in (i + 1)(n − i) subarrays.
4. Why compare an optimised formula with a brute force?
   - [ ] To make it slower
   - [x] To catch off-by-one and overflow errors on small random inputs
   - [ ] To avoid reading constraints
   - [ ] To skip proofs entirely
   > Random comparison finds errors that reasoning misses.
