# Suffix Tree Overview
kind: concept
time: Not an algorithmic topic — this lesson describes a data structure. A suffix tree for a string of length n can be built in O(n) time (Ukkonen's algorithm) and then answers whether a pattern of length m occurs in O(m) time, independent of n.
space: Not an algorithmic topic — a compressed suffix tree has at most 2n nodes, but each node stores several pointers, so it typically needs 10 to 20 times the memory of the text; the uncompressed suffix trie needs O(n squared) nodes in the worst case.

## intro
A suffix tree is a compressed trie of all suffixes of a string. Every substring of the text is a prefix of some suffix, so every substring corresponds to a path from the root. That single idea turns a long list of string problems, such as substring search, counting distinct substrings, longest repeated substring and longest common substring, into simple walks over a tree.

## theory
Suffix trie: insert every suffix of `s$` into a trie, where `$` is a unique terminator that appears nowhere else (so no suffix is a prefix of another and every suffix ends at a leaf). For `banana$` there are 7 suffixes. The plain trie has many nodes: the suffixes of `banana$` create 22 nodes plus the root in an uncompressed trie, and for a string of length n with all distinct characters the trie has about n squared over 2 nodes.

Suffix tree: compress every chain of nodes with a single child into one edge labelled with a substring of the text (stored as a pair of indices, start and end, rather than the characters). The result has exactly n leaves (one per suffix), at most n − 1 internal nodes (every internal node has at least two children) and therefore at most 2n nodes, and O(n) space with index labels.

Operations:

- Does pattern P occur? Walk from the root matching P along edge labels; if the walk completes, P is a substring. O(m).
- How many times does P occur, and where? The number of leaves below the node (or edge position) where the walk ends is the number of occurrences, and each leaf stores the starting position of its suffix.
- Longest repeated substring: the deepest internal node (by string depth); its path label occurs at least twice. For `banana` it is `ana`.
- Number of distinct substrings: the number of characters on all edge labels of the suffix tree of the string without terminator (equivalently the non-root nodes of its suffix trie); the distinct non-empty substrings of `banana` number 15.
- Longest common substring of two strings: build a generalised suffix tree of both (with different terminators) and find the deepest node that has leaves from both strings.
- Longest palindromic substring, pattern matching with errors and many more queries combine suffix trees with lowest common ancestor queries (the LCA of two leaves gives the longest common prefix of those suffixes).

Construction algorithms:

- Naive: insert each suffix into the tree, O(n squared)
- Weiner's algorithm (1973): the first linear time algorithm, inserting suffixes from the shortest to the longest with suffix links
- McCreight's algorithm (1976): inserts from the longest to the shortest, easier to understand
- Ukkonen's algorithm (1995): online, processes the string left to right, extending all suffixes of the current prefix with implicit suffix links, O(n) for fixed alphabets
- From a suffix array and LCP array: a suffix tree can be built in linear time by a stack based algorithm, which is the practical route in many libraries

Suffix links: an internal node for string xα has a link to the node for α. They allow moving to the next suffix without restarting from the root, which is the source of the linear time bound.

Comparison with suffix arrays:

- Suffix tree: O(m) search, rich structure (every algorithm becomes a tree walk), big memory, harder to implement
- Suffix array with LCP and range minimum queries: O(m + log n) or O(m log n) search, a quarter of the memory, easier to build and more cache friendly, and able to simulate suffix tree traversals
- Suffix automaton: a smaller structure recognising all substrings, with O(n) states, handy for counting distinct substrings and for substring queries
- In practice most programs use suffix arrays (or the FM-index) for large texts such as genomes

Example (distinct substrings): the string `banana` has 21 non-empty substrings counted with repetition by position (n(n + 1)/2), but only 15 are distinct, since `a`, `an`, `ana`, `n`, `na`, `nan`... repeat. The sample code builds the uncompressed suffix trie and counts its non-root nodes, which equals the number of distinct non-empty substrings: 15 for `banana`. The compressed form would store the same information in 11 nodes.

Applications: bioinformatics (genome indexing, finding repeats and common motifs), data compression (Lempel-Ziv factorisation, the Burrows-Wheeler transform via suffix arrays), plagiarism detection, text editors with substring search, and spell checking with substring dictionaries.

Pitfalls: forgetting the terminator, which makes some suffixes end in the middle of an edge, building the plain trie for long strings (quadratic memory), mixing character-based and index-based labels and assuming pattern search is O(n).

## explain
1. Append a unique terminator to the text.
2. Think of all suffixes inserted into a trie, then compress single-child chains into edges.
3. Search a pattern by walking along edge labels from the root.
4. Read the number of occurrences from the leaves below the end of the walk.
5. Use the deepest internal node for the longest repeated substring.
6. Prefer a suffix array with LCP when memory or simplicity matters.

## example
The Python program builds the suffix trie of `banana$`, counts its nodes and its distinct non-empty substrings (15), answers substring queries and finds the deepest node with at least two leaves below it, `ana`. The JavaScript program counts the distinct substrings of several words by brute force.

## real
Genome indexers, plagiarism checkers and data compressors rely on suffix trees or their array and automaton equivalents to answer substring queries quickly.

## pros
- Substring queries in time proportional to the pattern length
- Answers many string questions as simple tree walks
- Linear time construction exists

## cons
- Large memory footprint compared with suffix arrays
- Ukkonen's algorithm is intricate to implement
- Needs a terminator and careful edge label handling

## uses
- Substring search and occurrence counting
- Finding the deepest repeated and shared substrings
- Computing how many different substrings a text contains
- Genome indexing

## mistakes
- Omitting the unique terminator
- Building the uncompressed trie for long strings
- Assuming construction is simple and linear in a naive implementation
- Confusing the suffix tree with a plain trie of the words

## interview
**Q:** What is a suffix tree?
**A:** A compressed trie of all suffixes of a string, with at most 2n nodes, in which every substring of the string is a prefix of some root-to-leaf path.

**Q:** How long does it take to check whether a pattern is a substring using a suffix tree?
**A:** O(m) for a pattern of length m, independent of the length of the text, by walking down from the root along matching edge labels.

**Q:** Why do practical systems often prefer suffix arrays?
**A:** They use much less memory, are easier to build and cache friendly, and with the LCP array and range minimum queries they can answer most of the questions a suffix tree can.

## summary
A suffix tree compresses the trie of all suffixes into at most 2n nodes and answers substring, repeat and common substring queries by tree walks, with linear time construction by Ukkonen's algorithm. Suffix arrays offer a lighter alternative.

## codenote
The Python sample builds a suffix trie and answers queries. The JavaScript sample counts distinct substrings.

## code
### python
```python
def suffix_trie(text):
    root = {}
    for start in range(len(text)):
        node = root
        for ch in text[start:]:
            node = node.setdefault(ch, {})
    return root

def count_nodes(node):
    return sum(1 + count_nodes(child) for child in node.values())

def contains(root, pattern):
    node = root
    for ch in pattern:
        if ch not in node:
            return False
        node = node[ch]
    return True

def leaves_below(node):
    return 1 if not node else sum(leaves_below(child) for child in node.values())

def deepest_repeat(node, path=""):
    best = ""
    for ch, child in node.items():
        if leaves_below(child) >= 2:
            candidate = deepest_repeat(child, path + ch)
            best = max(best, candidate or path + ch, key=len)
    return best

text = "banana"
trie = suffix_trie(text + "$")
plain = suffix_trie(text)
print(count_nodes(trie), count_nodes(plain), len({text[i:j] for i in range(6) for j in range(i + 1, 7)}))
print(contains(trie, "nan"), contains(trie, "nab"), contains(trie, "ana"))
print(deepest_repeat(trie))
```
Output:
```text
22 15 15
True False True
ana
```
### javascript
```javascript
function distinctSubstrings(word) {
  const seen = new Set();
  for (let i = 0; i < word.length; i++) {
    for (let j = i + 1; j <= word.length; j++) seen.add(word.slice(i, j));
  }
  return seen.size;
}

for (const word of ["banana", "abcd", "aaaa", "abab"]) {
  console.log(word, distinctSubstrings(word), (word.length * (word.length + 1)) / 2);
}
```
Output:
```text
banana 15 21
abcd 10 10
aaaa 4 10
abab 7 10
```

## quiz
1. What does a suffix tree store?
   - [ ] All words of a dictionary
   - [x] A compressed trie of all suffixes of a string
   - [ ] The sorted letters of a string
   - [ ] The prefix function
   > Every substring is a prefix of some suffix.
2. How long does a substring query take in a suffix tree?
   - [ ] O(n)
   - [x] O(m) for a pattern of length m
   - [ ] O(n log n)
   - [ ] O(n m)
   > It is independent of the text length.
3. Why is a unique terminator appended?
   - [ ] To mark the pattern
   - [x] So that no suffix is a prefix of another and each ends at a leaf
   - [ ] To save memory
   - [ ] To sort the suffixes
   > Without it, some suffixes end inside an edge.
4. How many leaves does the suffix tree of a string of length n have?
   - [ ] n squared
   - [x] n, one per suffix
   - [ ] 2n
   - [ ] log n
   > Each suffix ends at its own leaf.

# Longest Palindromic Substring
kind: algorithm
time: O(n squared) for expanding around every center or for the dynamic programming table, and O(n) with Manacher's algorithm.
space: O(1) extra for the expand-around-center method, O(n squared) for the dynamic programming table and O(n) for Manacher's algorithm.

## intro
A palindrome reads the same forwards and backwards. Finding the longest palindromic substring of a string is a classic problem with three solutions of increasing sophistication: a quadratic table, a quadratic but memory-free expansion around centers, and Manacher's linear time algorithm that reuses the symmetry of palindromes.

## theory
Observation: every palindrome has a center, either a character (odd length) or the gap between two characters (even length). There are 2n − 1 centers in a string of length n. A palindrome grows outward from its center as long as the characters on both sides match.

Expand around center:

- For each center, expand left and right while the characters are equal and in bounds, tracking the best range
- Each expansion costs up to O(n), so the total is O(n squared) in the worst case (a string of all equal letters), and about O(n) for random strings where expansions stop quickly
- Memory O(1)

Examples: `babad` has the longest palindromic substrings `bab` and `aba` (either is acceptable); `cbbd` has `bb`; `forgeeksskeegfor` has `geeksskeeg` of length 10.

Dynamic programming: `dp[i][j]` is true if `s[i..j]` is a palindrome, which holds when `s[i] == s[j]` and the inner substring `dp[i + 1][j − 1]` is a palindrome (or the length is at most 2). Fill by increasing length; track the longest true entry. O(n squared) time and memory, so the center method is usually preferable.

Manacher's algorithm (O(n)): transform the string by inserting a separator between characters (`#a#b#a#`) so that all palindromes have odd length. Compute `radius[i]`, the palindrome radius around each position. Maintain the center `c` and the right edge `r` of the rightmost palindrome found. For a position i inside this palindrome (`i < r`), the mirror position `mirror = 2c − i` has the same radius, truncated to `r − i`: `radius[i] = min(r − i, radius[mirror])`. Then try to expand beyond. If the palindrome at i extends past r, update c and r. Each expansion step moves r forward, so the total work is O(n). The longest palindrome has length equal to the maximum radius in the transformed string.

Other approaches:

- Suffix array or suffix tree of s and its reverse, with LCP queries: O(n log n) or O(n)
- Hashing with binary search on the length for odd and even palindromes: O(n log n) (check whether a palindrome of a given length exists by comparing forward and reverse hashes)
- Longest common substring of s and reverse(s) with a position check (careful: the substring must correspond to the same indices)

Related problems:

- Count palindromic substrings: sum over centers of the number of expansions, or sum of (radius + 1) / 2 from Manacher
- Palindrome partitioning (earlier lesson) and minimum cuts
- Shortest palindrome by adding characters in front: longest palindromic prefix with KMP
- Longest palindromic subsequence: dynamic programming, not contiguous
- Valid palindrome II (delete at most one character): two pointers with one retry

Pitfalls: forgetting even length centers, returning only the length when the substring is needed, off-by-one when converting indices from the transformed string back to the original, slicing strings in the inner loop (extra copies) and assuming uniqueness of the answer (several palindromes can share the maximum length).

Testing: compare expansion and Manacher with the brute force over all substrings on random strings over a small alphabet.

## explain
1. Treat each character and each gap between characters as a possible center.
2. Expand outward while the characters on both sides are equal.
3. Remember the longest range found.
4. For linear time, insert separators and reuse mirrored radii inside the rightmost palindrome.
5. Convert the best center and radius back to a substring of the original string.
6. Check against a brute force on random strings.

## example
The Python program finds `bab` for `babad`, `bb` for `cbbd` and `geeksskeeg` for `forgeeksskeegfor`, computes the answer with Manacher's algorithm and checks both methods against brute force on 200 random strings. The JavaScript program counts the palindromic substrings of a few words.

## real
Text analysis, DNA structure analysis (palindromic sequences are binding sites) and puzzle generators search for the longest palindromes.

## pros
- The center expansion needs no extra memory
- Manacher's algorithm is linear
- The same idea counts palindromic substrings

## cons
- Quadratic worst case for the simple method
- Manacher's index conversions are error prone
- Several answers may share the maximum length

## uses
- Finding the longest palindrome in text
- Counting palindromic substrings
- Palindromic structure in DNA
- Interview problems on strings

## mistakes
- Considering only odd length centers
- Returning the length instead of the substring
- Mixing indices of the transformed and original strings
- Building a full table when constant memory suffices

## interview
**Q:** How do you find the longest palindromic substring in O(n squared) with O(1) memory?
**A:** Expand around each of the 2n − 1 centers (characters and gaps between them) while the characters on both sides match, and keep the longest range.

**Q:** How does Manacher's algorithm achieve linear time?
**A:** It uses the symmetry inside the rightmost known palindrome: the radius at a position is at least the radius of its mirror position (limited by the right edge), so the right edge only moves forward and each character is expanded at most a constant number of times amortised.

**Q:** Why insert separators in Manacher's algorithm?
**A:** They make every palindrome odd-length in the transformed string, so one case handles both odd and even palindromes.

## summary
The longest palindromic substring is found by expanding around 2n − 1 centers in O(n squared) with constant memory, or in O(n) with Manacher's algorithm that reuses mirrored radii. Remember even-length centers and index conversions.

## codenote
The Python sample implements both methods. The JavaScript sample counts palindromic substrings.

## code
### python
```python
import random

def expand(s):
    best = (0, 0)
    for center in range(2 * len(s) - 1):
        left, right = center // 2, center // 2 + center % 2
        while left >= 0 and right < len(s) and s[left] == s[right]:
            left, right = left - 1, right + 1
        if right - left - 1 > best[1] - best[0]:
            best = (left + 1, right)
    return s[best[0]:best[1]]

def manacher(s):
    t = "#" + "#".join(s) + "#"
    radius = [0] * len(t)
    center = edge = 0
    for i in range(len(t)):
        if i < edge:
            radius[i] = min(edge - i, radius[2 * center - i])
        while i - radius[i] - 1 >= 0 and i + radius[i] + 1 < len(t) and t[i - radius[i] - 1] == t[i + radius[i] + 1]:
            radius[i] += 1
        if i + radius[i] > edge:
            center, edge = i, i + radius[i]
    best = max(range(len(t)), key=lambda i: radius[i])
    return s[(best - radius[best]) // 2:(best + radius[best]) // 2]

for word in ("babad", "cbbd", "forgeeksskeegfor"):
    print(expand(word), manacher(word))

def brute(s):
    return max((s[i:j] for i in range(len(s)) for j in range(i + 1, len(s) + 1) if s[i:j] == s[i:j][::-1]), key=len)

rng = random.Random(8)
ok = True
for _ in range(200):
    word = "".join(rng.choice("ab") for _ in range(rng.randint(1, 14)))
    ok = ok and len(expand(word)) == len(brute(word)) == len(manacher(word))
print(ok)
```
Output:
```text
bab bab
bb bb
geeksskeeg geeksskeeg
True
```
### javascript
```javascript
function countPalindromes(s) {
  let count = 0;
  for (let center = 0; center < 2 * s.length - 1; center++) {
    let left = Math.floor(center / 2);
    let right = left + (center % 2);
    while (left >= 0 && right < s.length && s[left] === s[right]) {
      count++;
      left--;
      right++;
    }
  }
  return count;
}

console.log(["abc", "aaa", "abba", "racecar"].map(countPalindromes).join(" "));
```
Output:
```text
3 6 6 10
```

## quiz
1. How many centers does a string of length n have?
   - [ ] n
   - [x] 2n − 1
   - [ ] n squared
   - [ ] 2n + 1
   > Characters and the gaps between them.
2. What is the complexity of Manacher's algorithm?
   - [ ] O(n squared)
   - [x] O(n)
   - [ ] O(n log n)
   - [ ] O(n cubed)
   > The right edge of the known palindrome only moves forward.
3. Why can the expand-around-center method be quadratic?
   - [ ] It uses recursion
   - [x] In a string of equal letters every center expands almost the whole string
   - [ ] It sorts the string
   - [ ] It builds a table
   > Each expansion may cost O(n).
4. What does inserting separators achieve in Manacher's algorithm?
   - [ ] It speeds up the comparison
   - [x] Every palindrome becomes odd length, unifying the cases
   - [ ] It removes duplicates
   - [ ] It reverses the string
   > One loop then handles all centers.

# Longest Repeating Substring
kind: algorithm
time: O(n log n) with binary search on the length and a hash set of window hashes (expected), O(n squared) with a dynamic programming table, and O(n) after building a suffix array with LCP.
space: O(n) for the set of hashes or substrings, O(n squared) for the dynamic programming table.

## intro
What is the longest substring that appears at least twice in a string? The occurrences may overlap in the classic version. The answer reveals repeated structure: duplicated code, repeated DNA motifs, repeated phrases. There are three neat solutions: dynamic programming, binary search on the length with hashing, and the suffix array with its LCP array.

## theory
Problem variants: with overlapping occurrences allowed, `banana` has the longest repeating substring `ana` (positions 1 and 3 overlap). With non-overlapping occurrences required, the answer for `banana` is `an` (positions 1 and 3 do not overlap since 1 + 2 = 3). Check which version is asked.

Solution 1: dynamic programming (overlap allowed). Let `dp[i][j]` be the length of the longest common suffix of the prefixes ending at i and j, for i less than j: if `s[i] == s[j]` then `dp[i][j] = dp[i − 1][j − 1] + 1`, else 0. The maximum entry is the answer length. O(n squared) time and memory (rolling rows reduce memory to O(n)).

Solution 2: binary search on the length with hashing. The property "some substring of length L occurs at least twice" is monotone: if it holds for L it holds for every smaller length (shorten both occurrences). So binary search on L, and for each L check whether any two windows of length L are equal using a set of the substrings (O(n L)) or of rolling hashes (O(n) expected, verifying candidate collisions). The total is O(n log n) expected. For `aabaabaaba` the longest repeat is `aabaaba` (length 7, positions 0 and 3), found by testing lengths 5 (yes), 8 (no), 6 (yes), 7 (yes).

Solution 3: suffix array and LCP. Sort the suffixes; adjacent suffixes in sorted order share the longest prefixes, so the answer is the maximum LCP value between adjacent suffixes. For `banana`: LCP values 0, 1, 3, 0, 0, 2, maximum 3 giving `ana`. Time O(n log n) or O(n) with linear construction.

Solution 4: suffix tree. The deepest internal node, measured by the length of its path label, is the longest repeated substring.

Non-overlapping variant: add the condition that the two occurrences are at least L apart. With binary search: store for each window the first position at which it occurs and test `position − first >= L`. The property is still monotone. With the DP: cap the length by `j − i`.

Variants:

- Longest repeating substring appearing at least k times: binary search with counts (hash map from window to count)
- Longest duplicate substring (the well known hard problem): binary search with rolling hash, expected O(n log n)
- Longest common substring of two strings: the same machinery over the concatenation with a separator
- Longest repeating character replacement (a different sliding window problem; be careful with the name)
- Finding all repeats and tandem repeats (an adjacent repeated block such as abab) in bioinformatics

Pitfalls: confusing substring with subsequence, forgetting whether overlap is allowed, using the binary search on a non-monotone predicate (adding the non-overlap condition keeps it monotone, but a naive implementation can break it), hash collisions without verification, and slicing substrings of length L for each window in a long string (O(n L) memory use).

Testing: compare the three methods with a brute force over all substrings on random strings over a small alphabet.

## explain
1. Decide whether overlapping occurrences are allowed.
2. For small strings fill the table of longest common suffixes of prefix pairs.
3. For long strings binary search on the length and test with a set of hashes or substrings.
4. Alternatively take the maximum LCP between adjacent suffixes in the suffix array.
5. Return the substring, not just its length, from the stored start position.
6. Verify against brute force on random inputs.

## example
The Python program finds `ana` for `banana`, the empty string for `abcd` and `aabaaba` for `aabaabaaba` with binary search and the dynamic programming table, shows the non-overlapping answer `an` for `banana`, and checks both methods against brute force on 200 random strings. The JavaScript program finds the longest repeating substring with the suffix sorting method.

## real
Plagiarism and duplicate code detectors, DNA repeat finders and compression algorithms search for long repeated substrings.

## pros
- Several methods from simple to fast
- Binary search works because the property is monotone
- The suffix array gives the answer directly from LCP values

## cons
- The table method uses quadratic memory
- Hashing needs verification of collisions
- The overlap rule changes the solution details

## uses
- Detecting duplicated content
- Finding repeats in DNA sequences
- Compression dictionary construction
- String analysis in interviews

## mistakes
- Confusing substrings with subsequences
- Ignoring whether occurrences may overlap
- Skipping collision verification when hashing
- Building the full table for very long strings

## interview
**Q:** Why can binary search be used for the longest repeating substring?
**A:** If a substring of length L occurs twice, every shorter prefix of it also occurs twice, so the property is monotone in L and the largest L can be found by binary search with an O(n) check per length.

**Q:** How does the suffix array give the answer?
**A:** Sort the suffixes; the longest repeated substring is the longest common prefix between two adjacent suffixes in sorted order, so the answer is the maximum LCP value.

**Q:** What changes if occurrences must not overlap?
**A:** The two occurrences must start at least L apart, so the check stores the first position of each window and compares the distance, and the table method limits the length by the distance between the two end positions.

## summary
The longest repeating substring is found with a quadratic table, with binary search on the length plus hashing in O(n log n), or from the maximum LCP of the suffix array. State whether overlaps are allowed.

## codenote
The Python sample implements the table and the binary search. The JavaScript sample sorts suffixes.

## code
### python
```python
import random

def by_table(s, allow_overlap=True):
    n, best, end = len(s), 0, 0
    dp = [[0] * (n + 1) for _ in range(n + 1)]
    for i in range(1, n + 1):
        for j in range(i + 1, n + 1):
            if s[i - 1] == s[j - 1]:
                dp[i][j] = dp[i - 1][j - 1] + 1
                if not allow_overlap:
                    dp[i][j] = min(dp[i][j], j - i)
                if dp[i][j] > best:
                    best, end = dp[i][j], i
    return s[end - best:end]

def by_binary_search(s):
    def find(length):
        seen = set()
        for i in range(len(s) - length + 1):
            window = s[i:i + length]
            if window in seen:
                return window
            seen.add(window)
        return None

    low, high, answer = 1, len(s) - 1, ""
    while low <= high:
        mid = (low + high) // 2
        found = find(mid)
        if found:
            answer, low = found, mid + 1
        else:
            high = mid - 1
    return answer

for word in ("banana", "abcd", "aabaabaaba"):
    print(repr(by_table(word)), repr(by_binary_search(word)))
print(by_table("banana", allow_overlap=False))

def brute(s):
    best = ""
    for i in range(len(s)):
        for j in range(i + 1, len(s) + 1):
            if len(s[i:j]) > len(best) and s.count(s[i:j]) < 2 and s.find(s[i:j], i + 1) != -1:
                best = s[i:j]
            elif len(s[i:j]) > len(best) and s.find(s[i:j], i + 1) != -1:
                best = s[i:j]
    return best

rng = random.Random(13)
ok = True
for _ in range(200):
    word = "".join(rng.choice("ab") for _ in range(rng.randint(1, 12)))
    ok = ok and len(by_table(word)) == len(by_binary_search(word)) == len(brute(word))
print(ok)
```
Output:
```text
'ana' 'ana'
'' ''
'aabaaba' 'aabaaba'
an
True
```
### javascript
```javascript
function longestRepeat(s) {
  const order = Array.from({ length: s.length }, (_, i) => i).sort((a, b) => (s.slice(a) < s.slice(b) ? -1 : 1));
  let best = "";
  for (let i = 1; i < order.length; i++) {
    const a = s.slice(order[i - 1]);
    const b = s.slice(order[i]);
    let k = 0;
    while (k < a.length && k < b.length && a[k] === b[k]) k++;
    if (k > best.length) best = a.slice(0, k);
  }
  return best;
}

console.log(["banana", "mississippi", "abcd", "aaaa"].map((w) => w + ":" + longestRepeat(w)).join(" "));
```
Output:
```text
banana:ana mississippi:issi abcd: aaaa:aaa
```

## quiz
1. Why is binary search valid for the longest repeating substring?
   - [ ] The string is sorted
   - [x] If a length L repeats, every shorter length repeats too
   - [ ] The hash is monotone
   - [ ] The pattern is unique
   > Shorter prefixes of a repeat also repeat.
2. How does the suffix array give the answer?
   - [ ] It stores the repeats directly
   - [x] The largest LCP between adjacent sorted suffixes is the answer length
   - [ ] The longest suffix is the answer
   - [ ] The first suffix is the answer
   > Adjacent suffixes share the longest prefixes.
3. What is the longest repeating substring of banana when overlaps are allowed?
   - [ ] an
   - [x] ana
   - [ ] nan
   - [ ] anan
   > The occurrences at positions 1 and 3 overlap.
4. What must be verified when comparing windows by hash?
   - [ ] Nothing
   - [x] That equal hashes really mean equal substrings
   - [ ] That hashes are sorted
   - [ ] That windows are palindromes
   > Collisions can produce false repeats.

# Aho Corasick Intro
kind: algorithm
time: O(total pattern length) to build the automaton and O(n + z) to scan a text of length n that contains z pattern occurrences, regardless of the number of patterns.
space: O(total pattern length times alphabet size) with a full transition table, or O(total pattern length) with sparse children and failure links.

## intro
Searching a text for thousands of patterns one by one is slow, and a plain trie scan can re-read characters. The Aho-Corasick algorithm combines a trie of the patterns with failure links, the same idea as KMP generalised to many patterns, so the text is read exactly once and every occurrence of every pattern is reported in linear time.

## theory
Components:

- Trie of the patterns, with a node for every prefix of every pattern; nodes where a pattern ends carry the pattern (or its id)
- Failure link of a node u (representing string x): the node for the longest proper suffix of x that is also a prefix of some pattern (a node in the trie). The root's link is the root. Failure links are the multi-pattern analogue of the KMP prefix function.
- Output link (dictionary suffix link): from a node to the nearest node along its failure chain where a pattern ends, so that all patterns that end at the current text position are listed without walking the whole chain

Building failure links by breadth first search: the children of the root get failure link root. For a node v reached from u by character c, follow the failure links of u until a node with a child for c is found; the failure link of v is that child (or the root). Processing the nodes in order of depth guarantees the needed links already exist. Total O(total pattern length) (times alphabet size if a full automaton table is built).

Scanning the text: keep the current state (a trie node). For each text character c: while the state has no child for c and is not the root, move to its failure link; if a child exists, move to it; then report the patterns ending at this state, following output links. Each text character is consumed once, and the number of failure moves is amortised by the depth increases, as in KMP, so the scan is O(n + z).

Example: patterns `he`, `she`, `his`, `hers` and the text `ushers`. The automaton reads u (stays at the root), s, h, e: reaching the node for `she`, which reports `she` and, via its output link (the failure link of `she` is the node `he`), also `he`, both ending at index 4 (0-based). Then r and s extend to `hers` at the end, reporting `hers` at index 5. The occurrences found: she at 1 to 3, he at 2 to 3, hers at 2 to 5.

Full automaton (goto function): precompute the transition for every state and character so that scanning does a single table lookup per character: for a missing child, use the transition of the failure link. The scan is then exactly one step per character.

Applications:

- Multi-pattern search: virus signatures, intrusion detection (Snort uses variants), keyword filters, network packet inspection
- Plagiarism and dictionary matching, searching for thousands of words in a document
- Bioinformatics: scanning genomes for many motifs
- The Unix command fgrep (grep -F with multiple patterns) is the original application
- Counting occurrences of each pattern, or counting how many patterns occur (dynamic programming over the automaton, e.g., counting strings of a given length that avoid forbidden words)
- Word segmentation and tokenisation with maximal munch

Comparison with other methods: running KMP for each of P patterns costs O(P n + total); a trie scan costs O(n L); hashing handles patterns of one length; Aho-Corasick costs O(total + n + z) for any number of patterns of any lengths.

Pitfalls: building failure links in the wrong order (needs breadth first order), forgetting output links so that patterns that are suffixes of others (he inside she) are missed, reporting only one pattern per position, counting z as small when many patterns end at the same place (the output size can be large) and memory blow up with a full table for large alphabets.

Testing: compare the matches with a brute force that searches every pattern with the language's find on random inputs.

## explain
1. Insert all patterns into a trie, marking the end nodes.
2. Compute failure links breadth first, starting from the root's children.
3. Compute output links so all patterns ending at a node are reachable.
4. Scan the text, following failure links on mismatches and children on matches.
5. Report every pattern found at each state through its output chain.
6. Compare against a brute force search on random inputs.

## example
The Python program builds the automaton for the four patterns, scans `ushers` and prints the matches she@1, he@2, hers@2, and verifies against brute force on 200 random inputs. The JavaScript program counts how many times each of three short DNA motifs occurs in a sequence.

## real
Network intrusion detection, antivirus scanners, the fgrep utility and content filters use Aho-Corasick to match thousands of patterns at once.

## pros
- Linear time for any number of patterns
- Reads the text once and works on streams
- Reports all occurrences, including nested ones

## cons
- Memory grows with the total pattern length and alphabet
- More complex than a plain trie scan
- Output size can be large when many patterns match

## uses
- Multi-pattern text search
- Virus and intrusion signature scanning
- Keyword filtering
- Counting strings that avoid forbidden words

## mistakes
- Computing failure links in the wrong order
- Missing output links for patterns that are suffixes of other patterns
- Reporting only the longest match at a position
- Building a full table for a huge alphabet

## interview
**Q:** What is a failure link in Aho-Corasick?
**A:** For a trie node representing a string x, the link to the node for the longest proper suffix of x that is also a prefix of some pattern; it plays the role of the KMP prefix function for many patterns.

**Q:** What is the time complexity of Aho-Corasick?
**A:** O(m) to build for total pattern length m and O(n + z) to scan a text of length n with z occurrences, independent of the number of patterns.

**Q:** Why are output links needed?
**A:** A state can end several patterns at once when one pattern is a suffix of another, such as he inside she, and the output link chain lists them all without scanning the whole failure chain.

## summary
Aho-Corasick adds failure and output links to a trie of patterns so a text is scanned once to find all occurrences of all patterns in O(n + z). It is the standard tool for multi-pattern matching.

## codenote
The Python sample builds and checks the automaton. The JavaScript sample counts DNA motifs.

## code
### python
```python
import random
from collections import deque

class Automaton:
    def __init__(self, patterns):
        self.children, self.fail, self.out = [{}], [0], [[]]
        for pattern in patterns:
            node = 0
            for ch in pattern:
                if ch not in self.children[node]:
                    self.children.append({})
                    self.fail.append(0)
                    self.out.append([])
                    self.children[node][ch] = len(self.children) - 1
                node = self.children[node][ch]
            self.out[node].append(pattern)
        queue = deque(self.children[0].values())
        while queue:
            node = queue.popleft()
            for ch, child in self.children[node].items():
                link = self.fail[node]
                while link and ch not in self.children[link]:
                    link = self.fail[link]
                self.fail[child] = self.children[link].get(ch, 0)
                self.out[child] += self.out[self.fail[child]]
                queue.append(child)

    def search(self, text):
        state, found = 0, []
        for i, ch in enumerate(text):
            while state and ch not in self.children[state]:
                state = self.fail[state]
            state = self.children[state].get(ch, 0)
            for pattern in self.out[state]:
                found.append((i - len(pattern) + 1, pattern))
        return found

patterns = ["he", "she", "his", "hers"]
print(Automaton(patterns).search("ushers"))

rng = random.Random(21)
ok = True
for _ in range(200):
    pats = list({"".join(rng.choice("ab") for _ in range(rng.randint(1, 3))) for _ in range(3)})
    text = "".join(rng.choice("ab") for _ in range(rng.randint(0, 14)))
    expected = sorted((i, p) for p in pats for i in range(len(text)) if text.startswith(p, i))
    ok = ok and sorted(Automaton(pats).search(text)) == expected
print(ok)
```
Output:
```text
[(1, 'she'), (2, 'he'), (2, 'hers')]
True
```
### javascript
```javascript
function countMotifs(sequence, motifs) {
  const counts = Object.fromEntries(motifs.map((m) => [m, 0]));
  const trie = [{}];
  const fail = [0];
  const ends = [[]];
  for (const motif of motifs) {
    let node = 0;
    for (const ch of motif) {
      if (!trie[node][ch]) {
        trie.push({});
        fail.push(0);
        ends.push([]);
        trie[node][ch] = trie.length - 1;
      }
      node = trie[node][ch];
    }
    ends[node].push(motif);
  }
  const queue = Object.values(trie[0]);
  for (let head = 0; head < queue.length; head++) {
    const node = queue[head];
    for (const [ch, child] of Object.entries(trie[node])) {
      let link = fail[node];
      while (link && !trie[link][ch]) link = fail[link];
      fail[child] = trie[link][ch] ?? 0;
      ends[child] = ends[child].concat(ends[fail[child]]);
      queue.push(child);
    }
  }
  let state = 0;
  for (const ch of sequence) {
    while (state && !trie[state][ch]) state = fail[state];
    state = trie[state][ch] ?? 0;
    for (const motif of ends[state]) counts[motif]++;
  }
  return counts;
}

console.log(JSON.stringify(countMotifs("ACGTACGTTACG", ["ACG", "CGT", "TAC"])));
```
Output:
```text
{"ACG":3,"CGT":2,"TAC":2}
```

## quiz
1. What does a failure link point to?
   - [ ] The parent node
   - [x] The node of the longest proper suffix that is also a prefix of some pattern
   - [ ] The root always
   - [ ] The last pattern
   > It generalises the KMP prefix function.
2. What is the scan time for a text of length n with z occurrences?
   - [ ] O(n times the number of patterns)
   - [x] O(n + z)
   - [ ] O(n squared)
   - [ ] O(z squared)
   > Each character is consumed once.
3. Why are output links needed?
   - [ ] To sort patterns
   - [x] To report patterns that are suffixes of the matched string, like he inside she
   - [ ] To build the trie
   - [ ] To save memory
   > Several patterns can end at one position.
4. In which order are failure links computed?
   - [ ] Depth first
   - [x] Breadth first, by increasing depth
   - [ ] In pattern order
   - [ ] Randomly
   > Shorter suffix links must exist first.

# String Hashing Pitfalls
kind: concept
time: Not an algorithmic topic — this lesson is about the reliability of hashing. Correct polynomial hashing of a string costs O(n) to build and O(1) per substring query, but the probability of a collision depends on the modulus, the base and the number of comparisons.
space: Not an algorithmic topic — prefix hash arrays use O(n) memory, doubled when two moduli are used.

## intro
Hashing strings turns expensive comparisons into integer comparisons, and it powers rolling hashes, duplicate detection and substring queries. But a hash is a lossy summary, so unlucky or adversarial inputs can make different strings look equal. Knowing exactly how hashing fails, and how to defend against it, separates a solution that passes every test from one that fails a single hidden case.

## theory
Weak hash functions: a hash that ignores order or position collides systematically. The sum of character codes gives the same value for all anagrams (`ab` and `ba`) and for unrelated strings such as `ad` and `bc`. Any additive or xor-only hash has this flaw.

Polynomial hash: `H(s) = s[0] · B^(n−1) + ... + s[n−1] mod M` distinguishes order, but collisions still exist because the number of strings is far larger than M.

Collision probability: for two different strings of length n, hashed with a random base modulo a prime M, the probability of a collision is at most about n / M. With M around 10^9 and n = 1000, that is 10^−6 per comparison, but comparing 10^6 pairs makes a collision likely. The birthday paradox: among k strings, a collision among their hashes appears when k is about the square root of M, around 31,000 strings for M = 10^9. So hashing all substrings of a long text with one modulus below 2^32 almost surely produces false equalities.

Remedies:

- Use a large modulus: 2^61 − 1 (a Mersenne prime) with 128-bit multiplication, giving collision probabilities near 10^−18 per comparison
- Use double hashing: two independent moduli (or bases), combining both values; the probability multiplies
- Randomise the base at run time (from the clock) so an adversary cannot prepare an anti-hash test for a fixed base and modulus; a fixed base with a modulus of 2^64 (natural overflow) is vulnerable to the Thue-Morse string attack, which creates collisions for any base
- Verify matches by direct comparison when the number of candidate matches is small (as in Rabin-Karp)
- Avoid base 0, base values that are multiples of the modulus, and bases smaller than the alphabet size when they cause equal contributions

Implementation pitfalls:

- Overflow: in languages with fixed-width integers, `h * base` overflows before the modulus is applied; use a modulus below 2^31 with 64-bit arithmetic, or 128-bit multiplication. In JavaScript, numbers lose precision above 2^53, so `h * base % mod` is wrong for large moduli unless BigInt or splitting is used. A demonstration compares a floating-point computation with a BigInt computation for the same hash.
- Negative values: after subtracting the outgoing character, the remainder can be negative; add the modulus and take the remainder again
- Character values of zero: if `ord('a') − ord('a') = 0` is used as a digit, strings such as `a` and `aa` hash to the same number; map letters to 1 through 26
- Different lengths: include the length in the comparison (or the hash), because leading zero digits and equal prefixes can collide across lengths
- Python's built-in `hash` for strings is randomised per process (PYTHONHASHSEED), so it is not stable between runs and must not be saved to disk or used for cross-process agreement
- Hash flooding: attackers submit many keys that collide in a hash table to force O(n) lookups; languages respond with randomised seeds and keyed hashes (SipHash)
- Using the same hash for security and for data structures: non-cryptographic hashes are not secure; use SHA-256 or HMAC for integrity and authentication
- Anagram hashing with sorted keys or count tuples avoids collisions completely (an exact canonical form), at some memory cost

When to avoid hashing: if exactness is required and collisions cannot be verified cheaply, use deterministic structures (suffix arrays, KMP, tries) or verify every hit.

Testing: count collisions among all strings of a small alphabet and length with a tiny modulus to see them appear; run hashing algorithms against brute force, and try strings from known anti-hash families (Thue-Morse) with base and modulus 2^64 style hashes.

## explain
1. Choose a hash that depends on order, such as a polynomial hash.
2. Use a large prime modulus and a random base, or two moduli.
3. Map characters to nonzero digits.
4. Keep the arithmetic exact: no overflow, no precision loss, no negative remainders.
5. Verify hash equalities when correctness must be guaranteed.
6. Test with a tiny modulus to confirm the collision handling works.

## example
The Python program shows the additive hash colliding for anagrams and for ad and bc, counts the collisions among the 81 strings of length 4 over a three-letter alphabet: 72 for the additive hash, 74 for a polynomial hash with the tiny modulus 7 and none for the large modulus, and none for double hashing. The JavaScript program shows how floating point arithmetic gives a wrong hash for a large modulus while BigInt gives the right one.

## real
Programming contest anti-hash tests, hash flooding attacks on web servers and bugs in deduplication systems all come from the pitfalls described here.

## pros
- Knowing the failure modes lets you choose safe parameters
- Large moduli and random bases make collisions negligible
- Verification restores exactness cheaply

## cons
- Probabilistic answers need care
- Overflow and precision bugs are silent
- Adversarial inputs can break fixed parameters

## uses
- Choosing parameters for rolling hashes
- Reviewing hash based solutions for correctness
- Defending hash tables against flooding
- Explaining collision probabilities

## mistakes
- Using the sum of character codes as a hash
- Using a modulus around 10^9 for millions of comparisons without double hashing
- Letting multiplication overflow or lose precision
- Treating Python's string hash as stable across runs

## interview
**Q:** Why is the sum of character codes a bad string hash?
**A:** It ignores order, so all anagrams collide, and unrelated strings can also have equal sums, such as ad and bc.

**Q:** How do you reduce the chance of collisions in polynomial hashing?
**A:** Use a large prime modulus such as 2^61 − 1 or two independent moduli, a random base chosen at run time, and verify hash matches when exactness matters.

**Q:** What is a common implementation bug in hashing in JavaScript?
**A:** Multiplying numbers above 2^53 loses precision, so large modulus arithmetic must use BigInt or a split multiplication to stay exact.

## summary
String hashes can collide: avoid additive hashes, use large moduli, random bases or double hashing, keep the arithmetic exact and verify matches when exactness is required. Birthday effects mean small moduli fail quickly.

## codenote
The Python sample counts collisions. The JavaScript sample compares floating point with BigInt.

## code
### python
```python
from itertools import product

def additive(s):
    return sum(map(ord, s))

def polynomial(s, base, mod):
    h = 0
    for ch in s:
        h = (h * base + ord(ch) - 96) % mod
    return h

print(additive("ab") == additive("ba"), additive("ad") == additive("bc"), polynomial("ab", 31, 1000003) == polynomial("ba", 31, 1000003))

words = ["".join(p) for p in product("abc", repeat=4)]

def collisions(hash_function):
    seen, count = {}, 0
    for word in words:
        value = hash_function(word)
        if value in seen:
            count += 1
        seen[value] = word
    return count

print(len(words), collisions(additive), collisions(lambda w: polynomial(w, 31, 7)), collisions(lambda w: polynomial(w, 31, 1_000_000_007)))
print(collisions(lambda w: (polynomial(w, 31, 1_000_000_007), polynomial(w, 37, 998_244_353))))
```
Output:
```text
True True False
81 72 74 0
0
```
### javascript
```javascript
function hashFloat(text, base, mod) {
  let h = 0;
  for (const ch of text) h = (h * base + ch.charCodeAt(0)) % mod;
  return h;
}

function hashBig(text, base, mod) {
  let h = 0n;
  for (const ch of text) h = (h * base + BigInt(ch.charCodeAt(0))) % mod;
  return h;
}

const text = "hello world, hashing pitfalls";
const mod = 2305843009213693951n;
console.log(hashFloat(text, 131, Number(mod)), hashBig(text, 131n, mod).toString());
console.log(Number.isSafeInteger(Number(mod)), Number.MAX_SAFE_INTEGER);
```
Output:
```text
2137870177280622600 1146741805617364362
false 9007199254740991
```

## quiz
1. Why do anagrams collide under the sum of character codes?
   - [ ] They have different lengths
   - [x] Addition ignores the order of the characters
   - [ ] The sum overflows
   - [ ] They are stored in the same bucket
   > Order sensitive hashes avoid this.
2. What does the birthday paradox imply for hashing?
   - [ ] Collisions are impossible
   - [x] Collisions among many values appear after about the square root of the modulus
   - [ ] Hashes must be sorted
   - [ ] Larger bases are always safe
   > A modulus around 10^9 breaks down at tens of thousands of strings.
3. How can adversarial anti-hash tests be defeated?
   - [ ] By using a fixed base
   - [x] By choosing the base randomly at run time and using a large or double modulus
   - [ ] By hashing twice with the same base
   - [ ] By using shorter strings
   > The attacker cannot prepare colliding inputs.
4. Why is mapping letters to zero a problem in polynomial hashing?
   - [ ] Zero is not a number
   - [x] Strings such as a and aa then have the same hash
   - [ ] It slows the hash
   - [ ] It causes overflow
   > Digits should be nonzero.

# String Algorithm Interviews
kind: concept
time: Not an algorithmic topic — this lesson reviews patterns. Most string interview problems are solved in O(n) with the right tool (prefix function, two pointers, hashing) or O(n log n) with sorting or binary search.
space: Not an algorithmic topic — typical extra space is O(1) for two-pointer solutions, O(n) for prefix functions and hash maps, and O(alphabet size) for counting.

## intro
String problems in interviews draw from a small kit: two pointers and sliding windows, hash maps for counts, the prefix function for borders and periods, rolling hashes, tries, and dynamic programming for palindromes and edit distance. The advanced algorithms of this module appear in disguise, and recognising the disguise is the skill that solves the problem quickly.

## theory
Pattern 1: borders, periods and repetition (prefix function or Z algorithm).

- Repeated substring pattern: can the string be built by repeating a shorter block? Compute the prefix function; the smallest period is `n − pi[n − 1]`, and the string is a repetition when that period divides n. `abab` and `abcabcabc` are repetitions; `aba` is not.
- Shortest palindrome by adding characters in front: find the longest palindromic prefix with the prefix function of `s + "#" + reverse(s)`; the answer is the reversed remainder plus s. For `aacecaaa` the answer is `aaacecaaa`; for `abcd` it is `dcbabcd`.
- Longest happy prefix (the longest proper prefix that is also a suffix): the last value of the prefix function. For `level` it is `l`; for `ababab` it is `abab`.
- String rotations: t is a rotation of s if t occurs in s + s (with equal lengths)

Pattern 2: substring search at scale.

- One pattern: KMP or Z, O(n + m); the built-in find is usually fine in practice
- Many patterns: Aho-Corasick
- Many queries on a fixed text: suffix array with binary search or a suffix automaton
- Equal-length windows (duplicates, anagrams): rolling hash, or count arrays with a sliding window

Pattern 3: palindromes. Center expansion, Manacher's algorithm, palindrome partitioning with DP, counting palindromic substrings, valid palindrome with one deletion (two pointers).

Pattern 4: sliding window and two pointers for substrings with constraints: longest substring without repeating characters, minimum window substring, permutation in a string (fixed size window of counts), longest substring with at most k distinct characters.

Pattern 5: dynamic programming on strings: edit distance, longest common subsequence, longest palindromic subsequence, wildcard and regular expression matching, distinct subsequences, interleaving strings.

Pattern 6: hashing and canonical forms: group anagrams (sorted key or count tuple), isomorphic strings, find duplicate substrings, longest duplicate substring by binary search with rolling hash, string compression keys.

Pattern 7: tries and prefix problems: autocomplete, word search on a board, longest common prefix, replace words, maximum xor with a bitwise trie.

Pattern 8: parsing and simulation with stacks: valid parentheses, decode string, basic calculator, simplify path.

Choosing quickly:

- Border or period or rotation: prefix function
- Many patterns: Aho-Corasick or trie
- Repeated or duplicate substrings: suffix array with LCP, or binary search with hashing
- Palindromes: center expansion, Manacher
- Windows with counts: sliding window
- Two strings compared character by character: dynamic programming
- Equality of structure: canonical form or hashing

What interviewers listen for: the complexity (O(n + m) for KMP), the memory (O(m)), the alphabet assumption (26 lowercase letters or Unicode), the handling of empty strings and single characters, and the awareness of language details (immutable strings and the cost of concatenation in loops, slicing creating copies, code points versus bytes).

Talking points on pitfalls: building strings by repeated concatenation is O(n squared) in some languages (use a list and join), comparing strings of length n costs O(n) so hashing or tries save repeated comparisons, and Unicode normalisation matters for user-visible text.

## explain
1. Identify the family: borders and periods, search, palindromes, windows, dynamic programming, hashing or tries.
2. Choose the matching tool from the module: prefix function, Z, Aho-Corasick, Manacher, suffix array.
3. State assumptions about the alphabet and case.
4. Write the solution with attention to empty and single character inputs.
5. State time and space complexity.
6. Test examples such as repeated blocks, palindromes and strings without matches.

## example
The Python program solves the repeated substring pattern with the prefix function (true for abab and abcabcabc, false for aba) and the shortest palindrome by prepending characters (aaacecaaa and dcbabcd). The JavaScript program computes the longest happy prefix for several words.

## real
Search engines, spell checkers, code editors and bioinformatics tools solve these string problems daily, so interviews use small versions of them.

## pros
- A short list of tools covers most problems
- The prefix function solves many disguised questions
- Complexity statements are short and precise

## cons
- The right tool is not always obvious from the statement
- Language specific string details cause bugs
- Advanced structures are overkill for small inputs

## uses
- Preparing for string interviews
- Choosing between KMP, hashing, tries and dynamic programming
- Recognising borders, periods and rotations
- Reviewing string code for complexity

## mistakes
- Concatenating strings in a loop and getting quadratic time
- Assuming a lowercase alphabet when the input may contain other characters
- Forgetting empty strings and single characters
- Reaching for a suffix array when a prefix function is enough

## interview
**Q:** How do you check whether a string is made by repeating a shorter substring?
**A:** Compute the prefix function; the candidate block length is n minus the last value, and the string is a repetition exactly when that length divides n and is less than n.

**Q:** How do you find the shortest palindrome you can make by adding characters in front?
**A:** Compute the prefix function of s + a separator + reverse(s); its last value is the length of the longest palindromic prefix, and the answer is the reverse of the remaining suffix placed in front of s.

**Q:** Which tool would you use to search for many patterns at once?
**A:** The Aho-Corasick automaton, or a trie scan for small cases, which finds all occurrences of all patterns in a single pass.

## summary
String interview questions map to a few tools: prefix function for borders and periods, Aho-Corasick and tries for many patterns, Manacher for palindromes, hashing and binary search for repeats, and sliding windows and dynamic programming otherwise. State the complexity and test empty inputs.

## codenote
The Python sample uses the prefix function twice. The JavaScript sample computes happy prefixes.

## code
### python
```python
def prefix_function(s):
    pi, k = [0] * len(s), 0
    for i in range(1, len(s)):
        while k and s[i] != s[k]:
            k = pi[k - 1]
        if s[i] == s[k]:
            k += 1
        pi[i] = k
    return pi

def repeated_block(s):
    n = len(s)
    period = n - prefix_function(s)[-1]
    return period < n and n % period == 0

def shortest_palindrome(s):
    if not s:
        return s
    combined = s + "#" + s[::-1]
    longest = prefix_function(combined)[-1]
    return s[longest:][::-1] + s

print([repeated_block(w) for w in ("abab", "aba", "abcabcabc", "a")])
print(shortest_palindrome("aacecaaa"), shortest_palindrome("abcd"), shortest_palindrome("a"))
```
Output:
```text
[True, False, True, False]
aaacecaaa dcbabcd a
```
### javascript
```javascript
function longestHappyPrefix(s) {
  const table = new Array(s.length).fill(0);
  let k = 0;
  for (let i = 1; i < s.length; i++) {
    while (k > 0 && s[i] !== s[k]) k = table[k - 1];
    if (s[i] === s[k]) k++;
    table[i] = k;
  }
  return s.slice(0, table[s.length - 1]);
}

console.log(["level", "ababab", "abc", "abcabcabcab"].map((w) => w + ":" + (longestHappyPrefix(w) || "-")).join(" "));
```
Output:
```text
level:l ababab:abab abc:- abcabcabcab:abcabcab
```

## quiz
1. Which tool finds the period of a string?
   - [ ] A trie
   - [x] The prefix function
   - [ ] A heap
   - [ ] Binary search on the length only
   > The period is the length minus the last prefix value.
2. How is a rotation checked in linear time?
   - [ ] By sorting both strings
   - [x] By searching for one string inside the other doubled
   - [ ] By counting letters
   - [ ] By reversing one string
   > All rotations appear in s + s.
3. Which tool searches many patterns at once?
   - [ ] KMP run once
   - [x] The Aho-Corasick automaton
   - [ ] A Fenwick tree
   - [ ] Union-find
   > It reads the text once for all patterns.
4. Why is concatenating strings in a loop risky?
   - [ ] It changes the characters
   - [x] It can copy the string each time, giving quadratic cost
   - [ ] It forbids Unicode
   - [ ] It sorts the result
   > Collect pieces in a list and join once.
