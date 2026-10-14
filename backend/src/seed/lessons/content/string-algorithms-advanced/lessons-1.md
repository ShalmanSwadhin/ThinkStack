# Naive String Matching
kind: algorithm
time: O(n · m) in the worst case for a text of length n and a pattern of length m, since every alignment may compare up to m characters; O(n) on typical text where mismatches occur early.
space: O(1) extra space beyond the input.

## intro
String matching asks where a pattern occurs inside a longer text. The naive method slides the pattern along the text one position at a time and compares character by character. It is the baseline against which every cleverer algorithm is measured, it is perfectly adequate for short inputs, and understanding exactly when it becomes slow explains why algorithms such as KMP exist.

## theory
Algorithm:

- For each start position `i` from 0 to `n − m`, compare `text[i + j]` with `pattern[j]` for j from 0 upward
- If all m characters match, report i as an occurrence
- On the first mismatch, abandon this alignment and move to `i + 1`, forgetting everything learned

Example: pattern `aba` in the text `ababa` is found at positions 0 and 2 (the occurrences overlap). Searching `abc` in `ababa` fails at every position after at most three comparisons.

Cost analysis:

- Best case: the first character of the pattern never matches, so each alignment costs one comparison, n − m + 1 comparisons in total
- Worst case: the text and pattern make long partial matches that fail late. For text `aaaa...a` (n characters) and pattern `aaa...ab` (m characters), every alignment compares m − 1 characters before failing on the last, about (n − m + 1) · m comparisons, quadratic when m is about n / 2. With n = 20 and m = 10 the naive method makes 110 comparisons while the text has only 20 characters.
- Average case on random text over a large alphabet: about n comparisons, since mismatches occur almost immediately, which is why the naive method is fine in practice for natural language

Why it wastes work: after a failed alignment the naive method discards the information that the first j characters matched. For instance, after matching `abab` and failing at `c` the next alignments `1, 2, 3` could be rejected without any comparisons, since the matched characters tell what the text contains there. KMP and the Z algorithm use that information to avoid re-reading text characters, achieving O(n + m).

Improvements within the naive framework:

- Compare the last character of the pattern first (it fails faster for many patterns)
- Use the standard library: `str.find` in Python, `indexOf` in JavaScript, which use optimised algorithms (Python uses a mix of Boyer-Moore-Horspool and two-way ideas; many C libraries use two-way matching)
- Skip impossible start positions: stop at `n − m`
- Use memchr style vectorised scans for the first character

Variants and related tasks:

- Find all occurrences, including overlapping ones, versus non-overlapping occurrences
- Count occurrences, find the first or last occurrence
- Case-insensitive matching: normalise both strings or compare lowercased characters
- Matching with wildcards (a single-character wildcard can be compared directly; arbitrary wildcards need dynamic programming)
- Approximate matching with at most k mismatches: the naive method extends naturally by counting mismatches (Hamming distance) per alignment
- Two-dimensional matching and matching in bytes versus Unicode code points (decide the unit)

When naive is good enough: short patterns (a few characters), small texts, one-off searches, and when a library routine already handles it. When it is not: long repetitive texts such as DNA, patterns longer than a few dozen characters with repeats, many searches over the same text (index it instead with a suffix array or automaton), and adversarial input.

Instrumentation: count character comparisons to see the difference between cases; the sample code prints the comparison counts for a benign and a worst-case input.

Pitfalls: off-by-one in the last start position (`n − m` inclusive), returning after the first match when all matches are needed, treating overlapping matches inconsistently, using slicing in the inner loop (which creates copies and makes it O(n m) in memory operations) and comparing bytes with characters in multi-byte encodings.

## explain
1. For every possible start position in the text, compare the pattern characters one by one.
2. Report the position if all characters match.
3. Otherwise move to the next start position and start over.
4. Stop at the last position where the pattern still fits.
5. Count comparisons to observe the best and worst cases.
6. Prefer a library function or a linear algorithm for long or repetitive inputs.

## example
The Python program finds `aba` in `ababa` at positions 0 and 2, and counts the comparisons: 7 for the first search, 18 for a text with no partial matches and 110 for the worst case (twenty a's against nine a's followed by a b). The JavaScript program lists all occurrences of a pattern in a sentence, including overlapping ones.

## real
Text editors search short strings with simple scans, and standard libraries use the naive idea for small patterns while switching to smarter algorithms for longer ones.

## pros
- Simple to write and verify
- No preprocessing and no extra memory
- Fast on typical text with early mismatches

## cons
- Quadratic in the worst case
- Rereads text characters after each failure
- Poor for long repetitive inputs

## uses
- Short pattern searches in small texts
- A reference implementation for testing faster algorithms
- Approximate matching with a mismatch budget
- Teaching the idea of an alignment

## mistakes
- Stopping the loop one position too early
- Returning after the first match when all are needed
- Using string slicing inside the inner loop
- Forgetting the empty pattern and the pattern longer than the text

## interview
**Q:** What is the time complexity of naive string matching?
**A:** O((n − m + 1) · m) in the worst case, which is O(n m), and about O(n) on typical text where mismatches occur early.

**Q:** Which input makes it slow?
**A:** A text like aaaa…a with a pattern like aaa…ab, where every alignment matches almost the whole pattern before failing on the last character.

**Q:** What information does the naive method throw away?
**A:** After a mismatch it forgets the characters it already matched, which algorithms like KMP reuse to avoid comparing the same text characters again.

## summary
Naive string matching tries every alignment and compares characters until a mismatch, costing O(n m) in the worst case and about O(n) on typical text. Its wasted work motivates KMP, the Z algorithm and hashing.

## codenote
The Python sample counts comparisons. The JavaScript sample lists overlapping occurrences.

## code
### python
```python
def naive(text, pattern):
    found, comparisons = [], 0
    for i in range(len(text) - len(pattern) + 1):
        j = 0
        while j < len(pattern):
            comparisons += 1
            if text[i + j] != pattern[j]:
                break
            j += 1
        if j == len(pattern):
            found.append(i)
    return found, comparisons

print(naive("ababa", "aba"))
print(naive("qwertyuiopasdfghjklz", "xyz"))
print(naive("a" * 20, "a" * 9 + "b"))
```
Output:
```text
([0, 2], 7)
([], 18)
([], 110)
```
### javascript
```javascript
function allOccurrences(text, pattern) {
  const positions = [];
  for (let i = 0; i + pattern.length <= text.length; i++) {
    if (text.startsWith(pattern, i)) positions.push(i);
  }
  return positions;
}

const sentence = "the theme of the thesis";
console.log(allOccurrences(sentence, "the").join(" "), allOccurrences("aaaa", "aa").join(" "));
```
Output:
```text
0 4 13 17 0 1 2
```

## quiz
1. How many alignments does the naive method try for text length n and pattern length m?
   - [ ] n
   - [x] n − m + 1
   - [ ] m
   - [ ] n times m
   > The pattern must fit inside the text.
2. What is the worst-case comparison count?
   - [ ] O(n)
   - [x] O(n · m)
   - [ ] O(m)
   - [ ] O(log n)
   > Each alignment may compare almost the whole pattern.
3. Which input is a worst case?
   - [ ] Random text
   - [x] Many a's in the text and many a's followed by b in the pattern
   - [ ] An empty text
   - [ ] A pattern of one letter
   > Long partial matches fail only at the end.
4. What does naive matching discard after a mismatch?
   - [ ] The pattern
   - [x] The information about the characters already matched
   - [ ] The text
   - [ ] The start position
   > Smarter algorithms reuse that information.

# KMP Algorithm
kind: algorithm
time: O(n + m) for a text of length n and a pattern of length m: O(m) to build the failure table and O(n) to scan the text, because the text pointer never moves backwards.
space: O(m) for the failure table (also called the prefix function or LPS array).
viz: kmp-search

## intro
The Knuth-Morris-Pratt algorithm finds every occurrence of a pattern in a text without ever re-reading a text character. Before searching, it studies the pattern itself to learn, for each prefix, how long a border it has. On a mismatch it uses that table to slide the pattern forward by exactly as much as is safe, giving guaranteed linear time.

## theory
Border: a border of a string is a proper prefix that is also a suffix. The string `abab` has the border `ab`; `aaaa` has borders `a`, `aa` and `aaa`; `abc` has none.

Failure table (prefix function) `pi[i]`: the length of the longest proper border of the pattern prefix `pattern[0..i]`. Example for the pattern `abababca`: the table is `[0, 0, 1, 2, 3, 4, 0, 1]`. For `aabaaab` it is `[0, 1, 0, 1, 2, 2, 3]`.

Building the table in O(m): keep `k`, the length of the current border. For i from 1 to m − 1: while `k > 0` and `pattern[i] != pattern[k]`, set `k = pi[k − 1]` (fall back to a shorter border); if `pattern[i] == pattern[k]`, increase k; store `pi[i] = k`. The total number of fallbacks is bounded by the number of increments, so the loop is linear.

Searching: keep `k`, the number of pattern characters currently matched. For each text character c: while `k > 0` and `c != pattern[k]`, set `k = pi[k − 1]`; if `c == pattern[k]`, increase k; if `k == m`, record an occurrence ending here (start `i − m + 1`) and set `k = pi[k − 1]` to continue looking for overlapping matches.

Why it is correct: when the match of length k fails at the next character, the longest pattern prefix that can still align with the end of the matched text is the longest border of `pattern[0..k−1]`, which is `pi[k − 1]`. Shifting the pattern so that this border lines up skips alignments that cannot possibly match, and no text character is compared twice in a way that moves the text pointer back.

Worked example: searching `abab` in `abababab` gives the occurrences at positions 0, 2 and 4. With the failure table `[0, 0, 1, 2]` the search never moves the text pointer backwards, uses 8 text steps and a few fallbacks, instead of the naive method's repeated comparisons.

Complexity: O(m) preprocessing and O(n) matching, independent of the alphabet; at most 2n character comparisons in the matching phase and at most 2m in the table construction. The table needs O(m) memory.

Other uses of the prefix function:

- Period of a string: the smallest period of a string of length m is `m − pi[m − 1]`; the string is a repetition of a shorter block exactly when that period divides m. For `abcabcabc` the period is 3, for `abab` it is 2 and for `abcab` it is 3 (but 3 does not divide 5, so it is not a repetition).
- Count occurrences of each prefix, and the number of distinct substrings (with the incremental approach)
- Shortest palindrome by prepending characters: compute the prefix function of `s + "#" + reverse(s)`
- Finding the longest prefix that is also a suffix (the border) of a whole string
- Matching in streams, since the state is just the integer k, and building the Aho-Corasick automaton (multiple patterns) from the same idea

Comparison with other algorithms: the Z algorithm computes similar information in a different form; Boyer-Moore is often faster in practice on natural language (sublinear skips) but has a more complex worst-case analysis; Rabin-Karp uses hashing; KMP has the cleanest worst-case guarantee and works on streams.

Pitfalls: mixing up the table index (`pi[k − 1]` and not `pi[k]` on fallback), forgetting to fall back after a full match, building the table with the wrong loop start (k begins at 0 and i at 1), handling the empty pattern and confusing the failure function with a table of shifts.

Testing: compare with the naive method and with the language's find on random strings over a small alphabet, where partial matches are frequent.

## explain
1. Compute the prefix function of the pattern: for each prefix, the length of its longest proper border.
2. Scan the text, keeping k, the number of pattern characters matched so far.
3. On a mismatch, fall back to pi[k − 1] until a match is possible or k is zero.
4. On a match, increase k; when k equals the pattern length, record an occurrence.
5. After an occurrence, fall back to pi[k − 1] to find overlapping matches.
6. Test against the naive method on random strings.

## example
The Python program builds the failure tables for `abababca` and `aabaaab`, finds `abab` in `abababab` at positions 0, 2 and 4, computes the periods of three strings and verifies KMP against the naive search on 200 random strings. The JavaScript program prints the failure table for a pattern and the number of text steps used.

## real
Text editors, intrusion detection systems and bioinformatics tools use KMP-like automata to search streams in linear time without backing up.

## pros
- Guaranteed linear time
- Never moves backwards in the text, so it works on streams
- The prefix function has many other uses

## cons
- More intricate than the naive method
- Often slower than Boyer-Moore on natural language in practice
- The fallback logic is easy to get wrong

## uses
- Linear time substring search
- Finding string periods and repetitions
- Shortest palindrome and border problems
- Matching in streaming input

## mistakes
- Using pi[k] instead of pi[k − 1] when falling back
- Not falling back after a complete match
- Starting the failure table loop at the wrong index
- Expecting the table to hold shift distances

## interview
**Q:** What does the KMP failure table store?
**A:** For each prefix of the pattern, the length of its longest proper border, meaning the longest proper prefix that is also a suffix of that prefix.

**Q:** Why is KMP linear?
**A:** The text pointer never moves back, and the number of fallbacks of the match length k is bounded by the number of times it was increased, so the total work is at most about 2n comparisons plus the O(m) table construction.

**Q:** How does the prefix function find the period of a string?
**A:** The smallest period is the length minus the last prefix function value; the string is a repetition of its period when that period divides the length.

## summary
KMP precomputes the longest border of every pattern prefix and uses it to skip impossible alignments, matching in O(n + m) without re-reading text. The prefix function also gives periods, borders and shortest palindromes.

## codenote
The Python sample builds tables, searches and checks periods. The JavaScript sample prints a table and the step count.

## code
### python
```python
import random

def prefix_function(pattern):
    pi, k = [0] * len(pattern), 0
    for i in range(1, len(pattern)):
        while k and pattern[i] != pattern[k]:
            k = pi[k - 1]
        if pattern[i] == pattern[k]:
            k += 1
        pi[i] = k
    return pi

def kmp(text, pattern):
    pi, k, found = prefix_function(pattern), 0, []
    for i, c in enumerate(text):
        while k and c != pattern[k]:
            k = pi[k - 1]
        if c == pattern[k]:
            k += 1
        if k == len(pattern):
            found.append(i - len(pattern) + 1)
            k = pi[k - 1]
    return found

def period(text):
    p = len(text) - prefix_function(text)[-1]
    return p, len(text) % p == 0

print(prefix_function("abababca"), prefix_function("aabaaab"))
print(kmp("abababab", "abab"))
print(period("abcabcabc"), period("abab"), period("abcab"))

rng = random.Random(10)
ok = True
for _ in range(200):
    text = "".join(rng.choice("ab") for _ in range(rng.randint(0, 20)))
    pattern = "".join(rng.choice("ab") for _ in range(rng.randint(1, 4)))
    expected = [i for i in range(len(text) - len(pattern) + 1) if text.startswith(pattern, i)]
    ok = ok and kmp(text, pattern) == expected
print(ok)
```
Output:
```text
[0, 0, 1, 2, 3, 4, 0, 1] [0, 1, 0, 1, 2, 2, 3]
[0, 2, 4]
(3, True) (2, True) (3, False)
True
```
### javascript
```javascript
function failureTable(pattern) {
  const table = new Array(pattern.length).fill(0);
  let k = 0;
  for (let i = 1; i < pattern.length; i++) {
    while (k > 0 && pattern[i] !== pattern[k]) k = table[k - 1];
    if (pattern[i] === pattern[k]) k++;
    table[i] = k;
  }
  return table;
}

function search(text, pattern) {
  const table = failureTable(pattern);
  let k = 0;
  let steps = 0;
  const found = [];
  for (let i = 0; i < text.length; i++) {
    while (k > 0 && text[i] !== pattern[k]) {
      k = table[k - 1];
      steps++;
    }
    if (text[i] === pattern[k]) k++;
    steps++;
    if (k === pattern.length) {
      found.push(i - k + 1);
      k = table[k - 1];
    }
  }
  return [found, steps];
}

console.log(failureTable("ababaca").join(" "));
console.log(JSON.stringify(search("ababababaca", "ababaca")));
```
Output:
```text
0 0 1 2 3 0 1
[[4],13]
```

## quiz
1. What is a border of a string?
   - [ ] Its first character
   - [x] A proper prefix that is also a suffix
   - [ ] Its longest repeated substring
   - [ ] Its middle part
   > The string abab has the border ab.
2. What is the complexity of KMP?
   - [ ] O(n m)
   - [x] O(n + m)
   - [ ] O(n log m)
   - [ ] O(m squared)
   > The text pointer never moves backwards.
3. On a mismatch with k matched characters, what does KMP do?
   - [ ] Restarts from the next text position
   - [x] Sets k to pi[k − 1] and retries
   - [ ] Sets k to zero always
   - [ ] Stops the search
   > It keeps the longest border that can still match.
4. How is the smallest period of a string computed?
   - [ ] As its length
   - [x] As the length minus the last prefix function value
   - [ ] As the number of distinct letters
   - [ ] As half its length
   > The border determines how far the string overlaps itself.

# Rabin Karp Rolling Hash
kind: algorithm
time: O(n + m) expected for a text of length n and a pattern of length m with a good hash, and O(n · m) in the worst case when many hash collisions force full comparisons.
space: O(1) extra space for the rolling hash values, plus a table of pattern hashes when several patterns are searched.
viz: rabin-karp

## intro
Rabin-Karp compares numbers instead of strings. It computes a hash of the pattern and a hash of every window of the text of the same length; only windows whose hash equals the pattern's hash can be matches, and those are confirmed by a direct comparison. The trick that makes it fast is that the hash of the next window is computed from the previous one in constant time, a rolling hash.

## theory
Polynomial rolling hash: treat a window `s[0..m−1]` as a number in base B modulo a prime M:

`H = (s[0] · B^(m−1) + s[1] · B^(m−2) + ... + s[m−1]) mod M`

Rolling update: to slide the window one character to the right, remove the leading character and append the new one:

`H_new = ((H − s[i] · B^(m−1)) · B + s[i + m]) mod M`

Precompute `B^(m−1) mod M` once. Each update costs O(1). Computing the first window costs O(m), so all window hashes cost O(n + m).

Algorithm:

- Compute the hash of the pattern and of the first text window
- For each window position, if the hashes are equal, compare the actual characters to rule out a collision (a spurious hit) and report the match if they agree
- Roll the hash to the next window

Small worked example with base 10 on digit strings (so the hash is the number modulo 13): pattern `31`, text `5723157231`. The pattern hash is 31 mod 13 = 5. The windows `57` also have hash 57 mod 13 = 5, so they trigger a comparison that fails: these are spurious hits. Only the windows `31` at positions 3 and 8 are confirmed matches.

Choosing parameters: the base B should be larger than the alphabet size (256 or a prime like 131); the modulus M a large prime (around 10^9 or 2^61 − 1) so collisions are rare. The probability that two different strings of length m collide is about m / M for a random base, so with M around 10^9 and moderate lengths, spurious hits are rare. A fixed base and modulus can be attacked by adversarial inputs; randomise the base.

Expected cost: O(n + m) when spurious hits are rare; each true match costs O(m) to confirm, so finding k occurrences costs O(n + k m). Worst case O(n m) if almost every window collides (a poor hash such as the sum of characters).

Strengths:

- Multiple pattern search: store the hashes of all patterns of the same length in a set; one pass over the text finds all of them in O(n + total) expected time, which KMP cannot do directly
- Two-dimensional pattern matching and plagiarism detection (fingerprints of shingles)
- Finding duplicate substrings of length L, and the longest repeated substring through binary search on L with a set of window hashes
- Streaming comparison of large files (rsync uses a rolling checksum)

Weaknesses: probabilistic (Monte Carlo without the verification step, Las Vegas with it), constant factors from modular arithmetic, integer overflow bugs, and sensitivity to a bad modulus or base.

Implementation tips: keep hash values non-negative after subtraction (`(h − out · power) % M` can be negative in some languages, add M), use 64-bit arithmetic with a modulus below 2^31 to avoid overflow in the multiplication, or use Python's big integers; use double hashing (two moduli) to reduce collisions; compare the actual substrings on hash equality unless a Monte Carlo answer is acceptable.

Pitfalls: forgetting to verify hits, negative hash values, overflow when the modulus is large in fixed-width integers, hashing with the sum of characters (anagrams collide), and a base of 0 or 1.

Testing: compare with a naive search on random strings, count the spurious hits for a small modulus (they happen often) and a large one (almost never).

## explain
1. Choose a base and a large prime modulus.
2. Compute the hash of the pattern and of the first window.
3. Compare hashes; on equality verify the characters directly.
4. Roll the hash: remove the outgoing character, shift by the base and add the incoming character.
5. Keep hash values non-negative using the modulus.
6. Count spurious hits and compare with a naive search in tests.

## example
The Python program searches `abc` in `aabcabcabc` with the rolling hash, finds the positions 1, 4 and 7, finds the digit string occurrences at positions 3 and 8, shows that spurious hits occur for the tiny modulus 13 (True) and that there are none for the large modulus 1000000007 (0), and compares with the naive search on 200 random strings. The JavaScript program searches several patterns of the same length in one pass using a set of hashes.

## real
File synchronisation tools use rolling checksums, plagiarism detectors compare fingerprints of text fragments and bioinformatics tools hash k-mers of DNA to find shared sequences.

## pros
- Expected linear time with a simple idea
- Searches many patterns of one length in a single pass
- Extends to two dimensions and duplicate detection

## cons
- Probabilistic, so verification is needed
- Modular arithmetic costs time and invites overflow bugs
- A bad modulus or a fixed base can be attacked

## uses
- Multiple pattern search
- Detecting duplicate or plagiarised text
- Longest repeated substring with binary search
- Rolling checksums in file synchronisation

## mistakes
- Skipping verification of hash matches
- Letting the rolled hash become negative
- Using a tiny modulus and getting constant collisions
- Overflowing fixed-width integers in the multiplication

## interview
**Q:** How does a rolling hash work?
**A:** The hash of the next window is obtained from the previous one by removing the contribution of the outgoing character, multiplying by the base and adding the incoming character, all modulo a prime, in O(1).

**Q:** What happens when two different windows have the same hash?
**A:** It is a spurious hit; the algorithm compares the actual characters and rejects the window if they differ, so the result is always correct, only slower when collisions are frequent.

**Q:** When is Rabin-Karp preferable to KMP?
**A:** When searching for many patterns of the same length at once, for duplicate substring detection and for two-dimensional matching, where hashing generalises more easily.

## summary
Rabin-Karp slides a rolling polynomial hash over the text and verifies windows whose hash equals the pattern's, giving expected O(n + m) time and natural multi-pattern search. Verify matches, randomise parameters and watch overflow.

## codenote
The Python sample counts spurious hits for two moduli. The JavaScript sample searches several patterns at once.

## code
### python
```python
import random

def rabin_karp(text, pattern, base=256, mod=1_000_000_007):
    n, m = len(text), len(pattern)
    if m > n:
        return [], 0
    power = pow(base, m - 1, mod)
    target = window = 0
    for i in range(m):
        target = (target * base + ord(pattern[i])) % mod
        window = (window * base + ord(text[i])) % mod
    found, spurious = [], 0
    for i in range(n - m + 1):
        if window == target:
            if text[i:i + m] == pattern:
                found.append(i)
            else:
                spurious += 1
        if i + m < n:
            window = ((window - ord(text[i]) * power) * base + ord(text[i + m])) % mod
    return found, spurious

text = "aabcabcabc"
print(rabin_karp(text, "abc"))
digits = "5723157231"
print(rabin_karp(digits, "31", base=10, mod=13)[0], rabin_karp(digits, "31", base=10, mod=13)[1] > 0)
print(rabin_karp(digits, "31", base=10, mod=1_000_000_007)[1])

rng = random.Random(12)
ok = True
for _ in range(200):
    t = "".join(rng.choice("abc") for _ in range(rng.randint(0, 25)))
    p = "".join(rng.choice("abc") for _ in range(rng.randint(1, 4)))
    expected = [i for i in range(len(t) - len(p) + 1) if t.startswith(p, i)]
    ok = ok and rabin_karp(t, p)[0] == expected
print(ok)
```
Output:
```text
([1, 4, 7], 0)
[3, 8] True
0
True
```
### javascript
```javascript
function multiSearch(text, patterns, base = 131n, mod = 1000000007n) {
  const m = patterns[0].length;
  const hash = (s) => [...s].reduce((h, ch) => (h * base + BigInt(ch.charCodeAt(0))) % mod, 0n);
  const targets = new Map(patterns.map((p) => [hash(p), p]));
  let power = 1n;
  for (let i = 1; i < m; i++) power = (power * base) % mod;
  let window = hash(text.slice(0, m));
  const found = [];
  for (let i = 0; i + m <= text.length; i++) {
    const candidate = targets.get(window);
    if (candidate && text.startsWith(candidate, i)) found.push(candidate + "@" + i);
    if (i + m < text.length) {
      window = ((window - BigInt(text.charCodeAt(i)) * power) % mod + mod) % mod;
      window = (window * base + BigInt(text.charCodeAt(i + m))) % mod;
    }
  }
  return found;
}

console.log(multiSearch("abracadabra", ["abr", "cad", "ara"]).join(" "));
```
Output:
```text
abr@0 cad@4 abr@7
```

## quiz
1. What does the rolling update do?
   - [ ] Recomputes the whole hash
   - [x] Removes the outgoing character, shifts and adds the incoming one in O(1)
   - [ ] Sorts the window
   - [ ] Reverses the window
   > That makes all window hashes cost O(n).
2. What is a spurious hit?
   - [ ] A missed occurrence
   - [x] Equal hashes for different strings
   - [ ] A repeated pattern
   - [ ] A negative hash
   > It is rejected by comparing the characters.
3. Why must the hash be kept non-negative?
   - [ ] For speed only
   - [x] Subtraction can make the remainder negative in some languages, breaking comparisons
   - [ ] To avoid recursion
   - [ ] Because strings are positive
   > Add the modulus after subtracting.
4. What can Rabin-Karp do that plain KMP cannot do directly?
   - [ ] Run in linear time
   - [x] Search many patterns of one length in a single pass with a hash set
   - [ ] Work on streams
   - [ ] Find periods
   > All pattern hashes are looked up at each window.

# Z Algorithm
kind: algorithm
time: O(n) to compute the Z array of a string of length n, and O(n + m) to search a pattern of length m in a text of length n by building the Z array of the pattern, a separator and the text.
space: O(n) for the Z array.

## intro
The Z algorithm computes, for every position i of a string, the length of the longest substring starting at i that is also a prefix of the whole string. That array answers pattern matching, period detection and many repeated-prefix questions in linear time, with an algorithm that is often easier to remember than KMP.

## theory
Definition: for a string s of length n, `Z[i]` is the length of the longest common prefix of s and the suffix `s[i..]`. By convention `Z[0]` is either n or 0 (it is not used). Examples: for `aabxaab` the Z array is `[7, 1, 0, 0, 3, 1, 0]`: at position 4 the suffix `aab` matches the prefix `aab` fully (3 characters); at position 1 only `a` matches. For `aaaaa` the array is `[5, 4, 3, 2, 1]`.

Linear time construction: maintain a window `[l, r)` that is the rightmost segment found so far that matches a prefix of s (so `s[l..r) == s[0..r − l)`). For each i from 1 to n − 1:

- If `i < r`, we already know a lower bound: `Z[i] = min(r − i, Z[i − l])`, because the substring at i mirrors the substring at `i − l` inside the prefix
- Then extend naively while `i + Z[i] < n` and `s[Z[i]] == s[i + Z[i]]`, increasing `Z[i]`
- If `i + Z[i] > r`, update the window to `[i, i + Z[i])`

Why it is linear: the right end r only moves forward and each character comparison in the extension step either moves r forward or fails once per position; the total number of successful comparisons is at most n, and failures at most n.

Pattern matching: build `s = pattern + "$" + text`, where `$` is a character that appears in neither. Then every position i in the text part with `Z[i] == m` marks an occurrence of the pattern starting at `i − m − 1` in the text. For the pattern `aab` and the text `aabxaabxaab` occurrences are at 0, 4 and 8. The separator guarantees Z values never exceed m.

Other applications:

- Smallest period: the smallest p such that `p + Z[p] == n` and p divides n gives the string's repetition (`abcabcabc` has p = 3 because Z[3] = 6)
- Counting distinct occurrences of prefixes and the number of times each prefix appears
- Longest substring that is both a prefix and a suffix (a border): the largest `Z[i]` with `i + Z[i] == n`
- Comparing a string with all its rotations
- String compression and finding the minimal unit of a repeated string
- Checking whether one string is a rotation of another: search for t inside s + s
- Shortest palindrome: compute the Z array of `s + "#" + reverse(s)`

Relationship to KMP: the Z array and the prefix function carry the same information and can be converted to each other in linear time. The Z algorithm looks forward from each position (matching the suffix against the prefix), while the prefix function looks backward (borders of prefixes). The Z algorithm is often considered simpler to reason about; KMP processes a stream online, while Z needs the whole text in memory because of the concatenation (although the text part can be handled with the pattern's Z array alone using a modified matching loop).

Pitfalls: choosing a separator that occurs in the strings, the off-by-one in the position conversion (`i − m − 1`), forgetting to update the window, setting `Z[0]` wrongly in code that uses it and inefficient recomputation inside the window (the min step is essential).

Testing: compare with a naive computation of Z (compare prefixes directly) and with naive search on random strings over a small alphabet.

## explain
1. Keep a window [l, r) of the rightmost prefix-matching segment found so far.
2. For position i inside the window, start from min(r − i, Z[i − l]).
3. Extend the match character by character while it continues.
4. If the match extends beyond r, move the window to [i, i + Z[i]).
5. For pattern matching, build pattern, separator and text and look for Z values equal to the pattern length.
6. Verify the array against a naive implementation.

## example
The Python program prints the Z arrays of `aabxaab` and `aaaaa`, finds `aab` in `aabxaabxaab` at 0, 4 and 8, computes the smallest period of `abcabcabc` as 3, and checks 200 random strings against the naive Z computation. The JavaScript program tests whether one string is a rotation of another using the Z search.

## real
Genome analysis tools find repeated prefixes and periodic structure, and competitive programmers use the Z algorithm for many string problems because of its short code.

## pros
- Short, linear time algorithm
- Gives matching, periods and borders from one array
- Easy to verify against a naive version

## cons
- Needs the concatenated string in memory
- The window logic is subtle at first
- Requires a separator character not in the data

## uses
- Linear time pattern matching
- Finding the smallest period of a string
- Rotation and border problems
- Counting prefix occurrences

## mistakes
- Using a separator that appears in the text
- Forgetting to take the minimum with the window length
- Converting positions from the concatenated string incorrectly
- Not extending the match after the lower bound is applied

## interview
**Q:** What does Z[i] represent?
**A:** The length of the longest substring starting at position i that matches a prefix of the whole string.

**Q:** How do you use the Z array for pattern matching?
**A:** Build the string pattern + separator + text and compute its Z array; every position in the text part whose Z value equals the pattern length is the start of an occurrence.

**Q:** Why is the Z algorithm linear?
**A:** The window's right end never moves backwards, and each comparison either extends it or ends the extension for that position, so the total comparisons are O(n).

## summary
The Z array stores, for each position, the longest match with the string's prefix, and it is computed in O(n) with a sliding window of the rightmost match. It gives pattern matching, periods and borders with short code.

## codenote
The Python sample builds Z arrays and searches. The JavaScript sample checks rotations.

## code
### python
```python
import random

def z_array(s):
    n = len(s)
    z = [0] * n
    z[0] = n
    left = right = 0
    for i in range(1, n):
        if i < right:
            z[i] = min(right - i, z[i - left])
        while i + z[i] < n and s[z[i]] == s[i + z[i]]:
            z[i] += 1
        if i + z[i] > right:
            left, right = i, i + z[i]
    return z

def z_search(text, pattern):
    z = z_array(pattern + "$" + text)
    m = len(pattern)
    return [i - m - 1 for i in range(m + 1, len(z)) if z[i] == m]

def naive_z(s):
    return [next(k for k in range(len(s) - i + 1) if k == len(s) - i or s[k] != s[i + k]) for i in range(len(s))]

print(z_array("aabxaab"), z_array("aaaaa"))
print(z_search("aabxaabxaab", "aab"))
word = "abcabcabc"
z = z_array(word)
print(next(p for p in range(1, len(word) + 1) if p == len(word) or (p + z[p] == len(word) and len(word) % p == 0)))

rng = random.Random(3)
print(all(z_array(w) == naive_z(w) for w in ("".join(rng.choice("ab") for _ in range(rng.randint(1, 15))) for _ in range(200))))
```
Output:
```text
[7, 1, 0, 0, 3, 1, 0] [5, 4, 3, 2, 1]
[0, 4, 8]
3
True
```
### javascript
```javascript
function zArray(s) {
  const n = s.length;
  const z = new Array(n).fill(0);
  z[0] = n;
  let left = 0;
  let right = 0;
  for (let i = 1; i < n; i++) {
    if (i < right) z[i] = Math.min(right - i, z[i - left]);
    while (i + z[i] < n && s[z[i]] === s[i + z[i]]) z[i]++;
    if (i + z[i] > right) {
      left = i;
      right = i + z[i];
    }
  }
  return z;
}

function isRotation(a, b) {
  if (a.length !== b.length) return false;
  const z = zArray(b + "$" + a + a);
  return z.some((value, i) => i > b.length && value === b.length);
}

console.log(isRotation("waterbottle", "erbottlewat"), isRotation("abcd", "acbd"), isRotation("aa", "aaa"));
```
Output:
```text
true false false
```

## quiz
1. What does Z[i] measure?
   - [ ] The number of distinct characters
   - [x] The longest common prefix of the string and its suffix starting at i
   - [ ] The position of the next match
   - [ ] The border length
   > It compares the suffix with the whole string's prefix.
2. How is the pattern searched with the Z array?
   - [ ] By hashing
   - [x] By computing Z for pattern, separator and text and finding values equal to the pattern length
   - [ ] By sorting suffixes
   - [ ] By building a trie
   > The separator keeps values from exceeding the pattern length.
3. What is the complexity of the Z algorithm?
   - [ ] O(n squared)
   - [x] O(n)
   - [ ] O(n log n)
   - [ ] O(n m)
   > The window's right end only moves forward.
4. How can a rotation be detected with it?
   - [ ] By sorting both strings
   - [x] By searching for one string inside the other doubled
   - [ ] By counting letters
   - [ ] By reversing one string
   > Every rotation of s appears inside s + s.

# Trie Pattern Matching
kind: algorithm
time: O(total length of patterns) to build the trie and O(n · L) to scan a text of length n for patterns of maximum length L by walking the trie from every start position; O(n + total + matches) with the Aho-Corasick automaton.
space: O(total length of the patterns) for the trie nodes.

## intro
When many patterns must be found in the same text, such as a dictionary of banned words or a list of gene motifs, searching each pattern separately repeats the scan. Putting all patterns in a trie lets one pass over the text test all of them at once: from each text position, walk down the trie as long as the characters match and report every pattern whose end marker you pass.

## theory
Idea: build a trie of the patterns, with an end marker (and the pattern identity) at the node where each pattern finishes. To find all matches, for each start position `i` in the text, follow the trie along `text[i], text[i + 1], ...`; each time you reach an end-marked node, report a match; stop when no child matches or the text ends.

Cost: building the trie costs O(sum of pattern lengths). The scan costs at most O(n · L) where L is the length of the longest pattern, since each start position walks at most L steps. In typical text the walk dies after one or two characters, so the practical cost is close to O(n). Compared with searching each of P patterns separately (O(P · n) with a linear algorithm), the trie saves work when P is large, because shared prefixes are matched once.

Example: patterns `he`, `she`, `his`, `hers` and the text `ushers`. Starting at position 1 the walk s-h-e matches `she` at 1; at position 2 h-e matches `he` at 2 and h-e-r-s matches `hers` at 2; no walk matches `his`. The matches are she@1, he@2 and hers@2.

Variations:

- Longest match only (tokenisation): at each start keep the longest end marker reached; used for maximal munch lexers and word segmentation
- Prefix matching in a dictionary: does any word start with the given prefix (the trie lesson)
- Matching with wildcards in the patterns: at a wildcard, branch into all children
- Case-insensitive search: normalise the text and patterns, or fold keys when branching
- Censoring words: replace the characters of every match with asterisks
- Longest word in the text that is in a dictionary, and word break problems that use the trie to enumerate dictionary words starting at each position (dynamic programming over positions)
- Replace words with their shortest prefix root in a sentence

Limitations and the upgrade: the plain trie scan may re-read characters (the walk from position i and from i + 1 overlap), giving O(n L). The Aho-Corasick automaton adds failure links so that after a mismatch the walk continues from the longest proper suffix that is also a trie prefix, never moving the text pointer backwards, with total O(n + total + matches) (next lessons).

Memory notes: use dictionaries for children with large alphabets, arrays of 26 for lowercase letters (fast, memory heavy), and compact tries for static dictionaries.

Implementation tips: store the pattern (or its index) at the end node so reporting a match is immediate; collect matches as (start, pattern) pairs; handle patterns that are prefixes of others (several end markers along one walk); decide whether overlapping matches are reported; and avoid recursion by looping over characters.

Pitfalls: forgetting that one walk can report several matches (a short pattern inside a longer one), stopping at the first end marker, rebuilding the trie for every search, off-by-one in the reported end position and ignoring empty patterns.

Testing: compare with searching each pattern separately via the language's find on random strings and patterns.

## explain
1. Insert every pattern into a trie and mark each pattern's last node.
2. For every start position in the text, walk down the trie following the text characters.
3. Whenever the current node ends a pattern, report the match.
4. Stop the walk when the next character has no child or the text ends.
5. Collect all matches with their start positions.
6. Compare with per-pattern searches on random inputs.

## example
The Python program finds the matches in `ushers` for the four patterns: she at 1, he at 2 and hers at 2, then censors the words in a sentence and checks the trie scan against per-pattern search on 200 random inputs. The JavaScript program finds the longest dictionary word starting at each position of a string.

## real
Profanity filters, malware scanners and keyword extraction tools match many patterns with trie based scans or their Aho-Corasick refinement.

## pros
- One pass handles many patterns
- Shared prefixes are matched once
- Easy to extend with wildcards and longest-match rules

## cons
- Worst case O(n L) because of repeated walks
- Memory proportional to the total pattern length
- Plain tries do not exploit overlaps between starts

## uses
- Keyword spotting and content filters
- Dictionary based tokenisation
- Replacing or censoring words
- Word break and segmentation

## mistakes
- Stopping at the first match along a walk
- Forgetting to mark patterns that are prefixes of others
- Rebuilding the trie for every query
- Reporting end positions where start positions are expected

## interview
**Q:** How does a trie speed up searching for many patterns?
**A:** The patterns share prefixes in the trie, so one walk from a text position tests all patterns that start there at once, instead of running a separate search for each pattern.

**Q:** What is the worst-case cost of the trie scan?
**A:** O(n · L) for text length n and longest pattern length L, because each start position may walk up to L characters; Aho-Corasick removes the factor L.

**Q:** How can the same structure find the longest dictionary word at each position?
**A:** Walk from the position and remember the last end-marked node passed; the longest match is the one recorded when the walk stops.

## summary
A trie of the patterns lets one scan of the text test all patterns that start at each position, in O(n L) worst case and close to O(n) in practice. Aho-Corasick adds failure links to make it truly linear.

## codenote
The Python sample finds matches and censors words. The JavaScript sample finds the longest match from each position.

## code
### python
```python
import random

def build(patterns):
    root = {}
    for pattern in patterns:
        node = root
        for ch in pattern:
            node = node.setdefault(ch, {})
        node["$"] = pattern
    return root

def scan(text, root):
    matches = []
    for start in range(len(text)):
        node = root
        for ch in text[start:]:
            if ch not in node:
                break
            node = node[ch]
            if "$" in node:
                matches.append((start, node["$"]))
    return matches

def censor(text, root):
    chars = list(text)
    for start, word in scan(text, root):
        chars[start:start + len(word)] = "*" * len(word)
    return "".join(chars)

root = build(["he", "she", "his", "hers"])
print(scan("ushers", root))
print(censor("she saw his hat", root))

rng = random.Random(5)
ok = True
for _ in range(200):
    patterns = list({"".join(rng.choice("ab") for _ in range(rng.randint(1, 3))) for _ in range(3)})
    text = "".join(rng.choice("ab") for _ in range(rng.randint(0, 12)))
    expected = sorted((i, p) for p in patterns for i in range(len(text)) if text.startswith(p, i))
    ok = ok and sorted(scan(text, build(patterns))) == expected
print(ok)
```
Output:
```text
[(1, 'she'), (2, 'he'), (2, 'hers')]
*** saw *** hat
True
```
### javascript
```javascript
function longestMatches(text, words) {
  const root = {};
  for (const word of words) {
    let node = root;
    for (const ch of word) node = node[ch] ??= {};
    node.word = word;
  }
  const result = [];
  for (let start = 0; start < text.length; start++) {
    let node = root;
    let best = null;
    for (let i = start; i < text.length && node[text[i]]; i++) {
      node = node[text[i]];
      if (node.word) best = node.word;
    }
    result.push(best ?? "-");
  }
  return result.join(" ");
}

console.log(longestMatches("catsand", ["cat", "cats", "and", "sand", "an"]));
```
Output:
```text
cats - - sand and - -
```

## quiz
1. Why is a trie useful when matching many patterns?
   - [ ] It sorts the text
   - [x] Patterns share prefixes, so one walk tests all patterns starting at a position
   - [ ] It removes the need for a text
   - [ ] It compresses the text
   > Each prefix is matched once.
2. What is the worst-case scan time of the plain trie method?
   - [ ] O(n)
   - [x] O(n · L) for the longest pattern length L
   - [ ] O(n squared) always
   - [ ] O(log n)
   > Each start walks up to L characters.
3. How are overlapping or nested patterns reported?
   - [ ] Only the longest one
   - [x] Each end-marked node passed during the walk is reported
   - [ ] Only the first one
   - [ ] None of them
   > A walk can report several patterns that share a start.
4. What removes the factor L from the scan cost?
   - [ ] A bigger alphabet
   - [x] The Aho-Corasick automaton with failure links
   - [ ] Sorting the patterns
   - [ ] Reversing the text
   > Failure links avoid re-reading characters.

# Suffix Array Construction
kind: algorithm
time: O(n log squared n) with the simple sort-based doubling method, O(n log n) with radix sort in each round, and O(n) with SA-IS; the LCP array via Kasai's algorithm takes O(n).
space: O(n) for the suffix array, ranks and the LCP array.

## intro
A suffix array lists the starting positions of all suffixes of a string in sorted order. With it, any substring can be found by binary search, and together with the longest-common-prefix array it answers questions about repeated and distinct substrings. It carries nearly the power of a suffix tree with a fraction of the memory and simpler code.

## theory
Definition: for a string s of length n, the suffix array `SA` is the permutation of 0..n−1 such that the suffixes `s[SA[0]..]`, `s[SA[1]..]`, ... are in lexicographic order. For `banana`, the suffixes sorted are `a` (5), `ana` (3), `anana` (1), `banana` (0), `na` (4), `nana` (2), so `SA = [5, 3, 1, 0, 4, 2]`.

Naive construction: sort the suffixes by comparison, O(n² log n) in the worst case because each comparison can take O(n); fine for short strings and as a test oracle.

Prefix doubling (Manber-Myers): rank suffixes by their first 1 character, then by their first 2, 4, 8 ... characters. In round k, the rank of suffix i is the pair `(rank[i], rank[i + 2^k])` from the previous round (with −1 for positions past the end); sorting by these pairs orders suffixes by their first 2^(k+1) characters. After ⌈log₂ n⌉ rounds all ranks are distinct. With comparison sorting each round costs O(n log n), giving O(n log² n); with radix sort on pairs each round is O(n), giving O(n log n).

Searching a pattern: binary search on SA comparing the pattern with each suffix's prefix, O(m log n); the matching suffixes form a contiguous block of the array whose size is the number of occurrences. For `banana` the pattern `ana` occupies SA positions 1 and 2 (suffixes 3 and 1): two occurrences at positions 1 and 3.

LCP array: `LCP[i]` is the length of the longest common prefix of the suffixes `SA[i − 1]` and `SA[i]`. For `banana`: `LCP = [0, 1, 3, 0, 0, 2]` (a / ana share 1, ana / anana share 3, anana / banana share 0, banana / na share 0, na / nana share 2). Kasai's algorithm computes it in O(n) using the inverse suffix array `rank[SA[i]] = i`: process positions in text order, keep a running length h, which decreases by at most one when moving to the next suffix.

What the arrays give:

- Number of distinct substrings: `n(n + 1) / 2 − sum(LCP)`. For `banana`: 21 − 6 = 15.
- Longest repeated substring: the maximum LCP value and the corresponding prefix; for `banana` it is `ana` (length 3)
- Longest common substring of two strings: concatenate with a separator and find the largest LCP between suffixes from different strings
- Counting occurrences of a pattern in O(m log n) with a range of SA
- k-th smallest substring, lexicographically smallest rotation (for the doubled string), and Burrows-Wheeler transform (take the character preceding each suffix in SA order: `banana$` gives `annb$aa`)
- Range minimum queries over LCP give the LCP of any two suffixes in O(1) after preprocessing, enabling fast substring comparison

Comparison with suffix trees: suffix arrays need about 4 to 8 bytes per character instead of 20 or more, are cache friendly, and with LCP and range minimum queries can replace a suffix tree for most applications. Suffix trees offer simpler theoretical constant-time navigation.

Implementation tips: append a sentinel smaller than all characters (`$`) when needed; use `sorted(range(n), key=lambda i: s[i:])` as the test oracle (O(n² log n), small inputs only); store ranks in arrays and sort keys as tuples in the doubling loop; use SA-IS or libraries for large inputs (millions of characters).

Pitfalls: comparing suffixes with slices in loops for large strings (quadratic memory use), mixing up SA and its inverse, forgetting the sentinel when characters repeat at the end, off-by-one at the end of the string in the doubling ranks and treating LCP indexes inconsistently (LCP[i] relates SA[i − 1] and SA[i]).

Testing: compare with the sorted suffix oracle on random strings; compute distinct substrings by brute force with a set for small strings.

## explain
1. Rank the suffixes by their first character.
2. In each round, sort suffixes by the pair (rank of the first half, rank of the second half).
3. Reassign ranks; stop when all ranks are distinct.
4. Read the suffix array as the order of positions.
5. Compute the LCP array with Kasai's algorithm using the inverse array.
6. Verify against sorting the suffixes directly.

## example
The Python program builds the suffix array of `banana` by prefix doubling, prints `[5, 3, 1, 0, 4, 2]`, the LCP array `[0, 1, 3, 0, 0, 2]`, the number of distinct substrings 15, the longest repeated substring `ana`, and checks 200 random strings against the sorted suffix oracle. The JavaScript program searches patterns by binary search in the suffix array.

## real
Genome indexers, full text search tools and compression programs (the Burrows-Wheeler transform in bzip2) are built on suffix arrays.

## pros
- Compact and cache friendly compared with suffix trees
- Substring search by binary search
- With LCP, answers many repeated substring questions

## cons
- Construction is more complex than sorting suffixes naively
- Pattern search is O(m log n), not O(m)
- Large inputs need linear-time construction like SA-IS

## uses
- Full text indexing and substring search
- Counting distinct substrings
- Longest repeated and longest common substrings
- Burrows-Wheeler transform

## mistakes
- Sorting suffix slices for long strings
- Forgetting the sentinel for strings with equal suffix prefixes
- Mixing up the suffix array and its inverse
- Misaligning the LCP array with the suffix array

## interview
**Q:** What is a suffix array?
**A:** The array of starting positions of all suffixes of a string, ordered by the lexicographic order of the suffixes.

**Q:** How do you count the distinct substrings of a string using a suffix array?
**A:** Every suffix contributes its length in prefixes, and the LCP array counts the prefixes already counted by the previous suffix, so the answer is n(n + 1)/2 minus the sum of the LCP array.

**Q:** How does prefix doubling work?
**A:** It ranks suffixes by their first 2^k characters using pairs of ranks from the previous round, sorting by the pair; after about log n rounds all ranks are distinct and give the suffix array.

## summary
A suffix array sorts all suffixes, built by prefix doubling in O(n log n) and paired with the LCP array from Kasai's algorithm to answer pattern search, distinct substring and longest repeat questions. It is the compact alternative to the suffix tree.

## codenote
The Python sample builds the arrays and verifies them. The JavaScript sample searches by binary search.

## code
### python
```python
import random

def suffix_array(s):
    n = len(s)
    rank = [ord(c) for c in s]
    k = 1
    order = list(range(n))
    while True:
        key = lambda i: (rank[i], rank[i + k] if i + k < n else -1)
        order.sort(key=key)
        new_rank = [0] * n
        for position in range(1, n):
            new_rank[order[position]] = new_rank[order[position - 1]] + (key(order[position]) != key(order[position - 1]))
        rank = new_rank
        if rank[order[-1]] == n - 1:
            return order
        k *= 2

def lcp_array(s, sa):
    n = len(s)
    rank = [0] * n
    for i, p in enumerate(sa):
        rank[p] = i
    lcp, h = [0] * n, 0
    for i in range(n):
        if rank[i]:
            j = sa[rank[i] - 1]
            while i + h < n and j + h < n and s[i + h] == s[j + h]:
                h += 1
            lcp[rank[i]] = h
            h = max(h - 1, 0)
        else:
            h = 0
    return lcp

s = "banana"
sa = suffix_array(s)
lcp = lcp_array(s, sa)
print(sa, lcp)
n = len(s)
longest = max(range(n), key=lambda i: lcp[i])
print(n * (n + 1) // 2 - sum(lcp), s[sa[longest]:sa[longest] + lcp[longest]])

rng = random.Random(11)
ok = True
for _ in range(200):
    word = "".join(rng.choice("abc") for _ in range(rng.randint(1, 12)))
    ok = ok and suffix_array(word) == sorted(range(len(word)), key=lambda i: word[i:])
print(ok)
```
Output:
```text
[5, 3, 1, 0, 4, 2] [0, 1, 3, 0, 0, 2]
15 ana
True
```
### javascript
```javascript
function suffixArray(s) {
  return Array.from({ length: s.length }, (_, i) => i).sort((a, b) => (s.slice(a) < s.slice(b) ? -1 : 1));
}

function countOccurrences(s, sa, pattern) {
  let low = 0;
  let high = sa.length;
  while (low < high) {
    const mid = (low + high) >> 1;
    if (s.slice(sa[mid], sa[mid] + pattern.length) < pattern) low = mid + 1;
    else high = mid;
  }
  let end = low;
  while (end < sa.length && s.startsWith(pattern, sa[end])) end++;
  return [end - low, sa.slice(low, end).sort((a, b) => a - b)];
}

const text = "banana";
const sa = suffixArray(text);
console.log(sa.join(" "));
console.log(JSON.stringify(countOccurrences(text, sa, "ana")), JSON.stringify(countOccurrences(text, sa, "nab")));
```
Output:
```text
5 3 1 0 4 2
[2,[1,3]] [0,[]]
```

## quiz
1. What does a suffix array contain?
   - [ ] The suffixes themselves as strings
   - [x] The starting positions of the suffixes in sorted order
   - [ ] The positions of repeated letters
   - [ ] The lengths of the suffixes
   > It is a permutation of the positions.
2. How is a pattern found with it?
   - [ ] By hashing the suffixes
   - [x] By binary search comparing the pattern with suffix prefixes
   - [ ] By scanning the text once
   - [ ] By building a trie
   > Matches form a contiguous block.
3. How are distinct substrings counted?
   - [ ] As n squared
   - [x] As n(n + 1)/2 minus the sum of the LCP array
   - [ ] As the sum of the LCP array
   - [ ] As the number of suffixes
   > The LCP removes prefixes already counted.
4. What does prefix doubling sort by in each round?
   - [ ] The whole suffix
   - [x] Pairs of ranks covering twice as many characters as the previous round
   - [ ] The last character
   - [ ] The suffix length
   > After log n rounds ranks are distinct.
