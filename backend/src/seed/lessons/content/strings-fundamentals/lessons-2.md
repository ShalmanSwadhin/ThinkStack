# Regular Expressions Intro
kind: algorithm
time: O(n) for simple patterns on a text of length n using an automaton-based engine; backtracking engines such as those in Python and JavaScript can take exponential time, O(2^n), on nested quantifiers such as (a+)+ applied to a failing input.
space: O(m) for a compiled pattern of size m, plus the stack needed by a backtracking engine for the match in progress.
practice: regex-wildcard-matching

## intro
A regular expression is a compact pattern language for describing sets of strings: a phone number, an email-like address, a date, any run of digits. One line of pattern can replace pages of hand-written scanning code for validating, extracting and rewriting text, and it is available in nearly every language.

## theory
Building blocks of the common syntax:

- Literal characters match themselves; `.` matches any character except a newline
- Character classes: `[abc]` any of those characters, `[a-z]` a range, `[^0-9]` anything except digits; shortcuts `\d` digit, `\w` word character, `\s` whitespace, and their capitals for the opposites
- Anchors: `^` start of the text, `$` end, `\b` a word boundary
- Quantifiers: `?` zero or one, `*` zero or more, `+` one or more, `{3}` exactly three, `{2,4}` two to four
- Alternation: `cat|dog` matches either
- Groups: parentheses capture the matched part and allow quantifiers on a whole sub-pattern; `(?:...)` groups without capturing and `(?P<name>...)` or `(?<name>...)` names a group
- Escaping: a backslash turns special characters into literals, as in `\.` for a dot

Greedy versus lazy: quantifiers are greedy by default and take as much as possible; adding `?` makes them lazy. Against `<a><b>`, the pattern `<.+>` matches the whole string, while `<.+?>` matches `<a>` and then `<b>`.

Python functions: `re.search` finds the first match anywhere, `re.match` only at the start, `re.fullmatch` requires the entire string, `re.findall` returns all matches, `re.sub` replaces, `re.split` splits, `re.compile` precompiles. A match object gives `group()`, `groups()` and `span()`. Use raw strings (`r"..."`) so backslashes reach the engine unchanged. JavaScript uses `/pattern/flags` literals, with `test`, `match`, `matchAll` and `replace`.

Cautions: do not use regular expressions to parse nested structures like HTML; catastrophic backtracking can freeze a program on crafted input (a denial of service known as ReDoS); anchor validation patterns with `fullmatch` or `^...$`; and keep patterns readable with comments in verbose mode or by splitting them.

## explain
1. Describe the text you want to match in words: three digits, a dash, four digits.
2. Translate each part into a pattern element and put them in order.
3. Decide whether it must match the whole string (use fullmatch or anchors) or just somewhere in it.
4. Add groups around the parts you want to extract.
5. Decide between greedy and lazy quantifiers if the text can contain several candidates.
6. Test on valid input, invalid input and tricky near-misses, and avoid nested quantifiers on overlapping alternatives.

## example
`re.fullmatch(r"\d{3}-\d{4}", "555-1234")` is True while the same pattern on "5551234" is False. Searching "mail ada@example.com now" with `(\w+)@(\w+)\.com` captures "ada" and "example" and reports the span (5, 20). `re.sub(r"\s+", " ", "a   b \t c")` collapses whitespace to "a b c". On "<a><b>" the greedy pattern returns one long match and the lazy one returns two tags. The JavaScript lines use named groups to pull the year and month from "2026-10-04".

## real
Form validation, log analysis, search-and-replace in editors, routers that map URLs to handlers and data cleaning scripts all use regular expressions, and ReDoS vulnerabilities have taken down well-known services.

## pros
- Very concise for pattern matching and extraction
- Available in almost every language and editor
- Powerful search-and-replace with captured groups

## cons
- Hard to read and maintain when patterns grow
- Backtracking engines can be exploited with pathological inputs
- Not suitable for nested or recursive structures

## uses
- Validating formats such as phone numbers and dates
- Extracting fields from log lines
- Cleaning and normalising text
- Defining token patterns for a scanner

## mistakes
- Forgetting anchors and accepting input that merely contains a valid part
- Using greedy quantifiers and capturing too much
- Parsing HTML or other nested formats with a pattern
- Writing nested quantifiers that backtrack catastrophically

## interview
**Q:** What is the difference between greedy and lazy quantifiers?
**A:** A greedy quantifier matches as much text as possible and backs off only if needed, while a lazy one, written with a trailing question mark, matches as little as possible.

**Q:** What is the difference between re.match, re.search and re.fullmatch in Python?
**A:** match tries only at the start of the string, search finds the first occurrence anywhere, and fullmatch requires that the pattern match the entire string.

**Q:** What is catastrophic backtracking?
**A:** Exponential running time caused by a pattern with nested or overlapping quantifiers on an input that almost matches, because the engine tries an enormous number of ways to split the text.

## summary
Regular expressions describe text patterns with literals, classes, quantifiers, anchors, alternation and groups. Anchor validations, choose greedy or lazy deliberately, avoid nested quantifiers and keep patterns readable.

## codenote
The Python sample validates, extracts, substitutes and contrasts greedy with lazy matching. The JavaScript sample uses named groups.

## code
### python
```python
import re

print(bool(re.fullmatch(r"\d{3}-\d{4}", "555-1234")), bool(re.fullmatch(r"\d{3}-\d{4}", "5551234")))

found = re.search(r"(\w+)@(\w+)\.com", "mail ada@example.com now")
print(found.group(1), found.group(2), found.span())

print(re.sub(r"\s+", " ", "a   b \t c"))
print(re.findall(r"<.+>", "<a><b>"), re.findall(r"<.+?>", "<a><b>"))
```
Output:
```text
True False
ada example (5, 20)
a b c
['<a><b>'] ['<a>', '<b>']
```
### javascript
```javascript
const match = "2026-10-04".match(/(?<year>\d{4})-(?<month>\d{2})/);
console.log(match.groups.year, match.groups.month);
console.log("a1b22c333".replace(/\d+/g, "#"));
```
Output:
```text
2026 10
a#b#c#
```

## quiz
1. What does the pattern \d{3}-\d{4} match?
   - [ ] Any seven characters
   - [x] Three digits, a dash and four digits
   - [ ] Three letters and four digits
   - [ ] A date
   > The shortcut \d stands for a digit and the braces set the counts.
2. Which function requires the whole string to match in Python?
   - [ ] re.search
   - [ ] re.match
   - [x] re.fullmatch
   - [ ] re.findall
   > fullmatch fails if any part of the string is left over.
3. What does adding a question mark after a quantifier do?
   - [ ] Makes the match optional
   - [x] Makes it lazy, matching as little as possible
   - [ ] Makes it case insensitive
   - [ ] Repeats the match
   > Lazy quantifiers prefer the shortest match.
4. Why is parsing nested HTML with a regular expression discouraged?
   - [ ] HTML has no tags
   - [x] Regular expressions cannot reliably handle arbitrarily nested structures
   - [ ] HTML is binary
   - [ ] Patterns cannot contain angle brackets
   > A proper parser is needed for recursive structure.

# Palindrome Techniques
kind: algorithm
time: O(n) for the two-pointer check of a string of length n; finding the longest palindromic substring by expanding around centers is O(n²), and Manacher's algorithm achieves O(n).
space: O(1) extra space for the two-pointer check on the original string, O(n) when a cleaned copy is built, and O(1) for expansion around centers.
practice: check-palindrome-string

## intro
A palindrome reads the same forward and backward: "level", "racecar", or "A man, a plan, a canal: Panama" once punctuation and case are ignored. Palindrome problems are small, but they showcase the main string techniques: reversal, two pointers, normalisation and expanding from the middle.

## theory
Checking a palindrome:

- Reverse and compare: `text == text[::-1]`. Simple, O(n) time and O(n) extra space.
- Two pointers: compare the characters at the left and right ends and move inward, stopping at the first mismatch or when the pointers meet. O(n) time, O(1) extra space, and it can skip characters that should be ignored without building a copy.
- Normalisation first: remove non-alphanumeric characters and fold case when the definition ignores them. Decide the policy with the problem statement, and decide how to treat the empty string (usually a palindrome).
- Recursive: the string is a palindrome if the ends match and the middle is a palindrome; elegant but uses stack space.
- Numbers: convert to text, or reverse the digits arithmetically using the remainder and division by 10.

Longest palindromic substring:

- Expand around center: each palindrome has a center, either one character (odd length) or between two (even length). For each of the 2n - 1 centers, expand outward while the characters match, and keep the longest. O(n²) time, O(1) space.
- Dynamic programming over substrings: a table says whether `s[i..j]` is a palindrome, O(n²) time and space.
- Manacher's algorithm: reuses information between centers to reach O(n).

Related questions: count all palindromic substrings (expand around every center), make a string a palindrome by deleting at most one character (two pointers with one retry), shortest palindrome by prepending characters, palindromic permutations (at most one character with an odd count).

Pitfalls: forgetting even-length centers, off-by-one when slicing the result, ignoring Unicode normalisation and combining characters in international text.

## explain
1. Decide the exact definition: case, punctuation and spaces.
2. For a yes or no answer, use two pointers on the (optionally cleaned) text.
3. For the longest palindromic substring, loop over centers and expand while the ends match.
4. Handle both odd and even centers.
5. Record the best start and length, and slice once at the end.
6. Test empty, single-character, even and odd length, all-equal and no-palindrome inputs.

## example
The two-pointer function filters the characters to letters and digits, lowercases them and compares the ends moving inward; it accepts "Never odd or even" and rejects "ThinkStack". The expansion function applied to "babad" returns "bab" and to "cbbd" returns "bb", showing both odd and even centers. The JavaScript sample checks a phrase, a non-palindrome and a number reversed as text, and prints `true false true`.

## real
Palindromes appear in interview problems, DNA analysis, where reverse complement sequences matter, and text games; the techniques of two pointers and center expansion carry over to many other sequence problems.

## pros
- Two pointers check a palindrome in linear time with constant extra space
- Center expansion is simple and needs no table
- The ideas generalise to other symmetric patterns

## cons
- Normalisation rules differ between problems and cause mistakes
- Center expansion is quadratic in the worst case
- Faster algorithms like Manacher's are hard to remember

## uses
- Validating palindromic words and phrases
- Finding the longest symmetric segment in text or DNA
- Counting symmetric substrings
- Practising two-pointer techniques

## mistakes
- Forgetting to handle even-length palindromes
- Comparing without normalising case and punctuation when the problem requires it
- Building reversed copies when constant space was required
- Slicing with the wrong boundaries after expansion

## interview
**Q:** How do you check whether a string is a palindrome in constant extra space?
**A:** Use two pointers at the start and end, compare the characters and move inward until they cross or a mismatch is found. No copy of the string is needed.

**Q:** How does expanding around the center find the longest palindromic substring?
**A:** For each of the 2n minus 1 possible centers it grows a window outward while the characters on both sides match, keeping the longest found, which takes O(n squared) time and constant space.

**Q:** When can the letters of a string be rearranged into a palindrome?
**A:** When at most one distinct character appears an odd number of times, because every other character needs a partner to place on the opposite side.

## summary
Check palindromes with two pointers after deciding the normalisation rules, and find the longest palindromic substring by expanding around every odd and even center. Test small and degenerate cases.

## codenote
The Python sample implements the pointer check and center expansion. The JavaScript sample checks a phrase, a word and a number.

## code
### python
```python
def is_palindrome(text):
    cleaned = [c.lower() for c in text if c.isalnum()]
    left, right = 0, len(cleaned) - 1
    while left < right:
        if cleaned[left] != cleaned[right]:
            return False
        left += 1
        right -= 1
    return True

print(is_palindrome("Never odd or even"), is_palindrome("ThinkStack"))

def longest_palindrome(s):
    best = ""
    for center in range(len(s)):
        for lo, hi in ((center, center), (center, center + 1)):
            while lo >= 0 and hi < len(s) and s[lo] == s[hi]:
                lo -= 1
                hi += 1
            if hi - lo - 1 > len(best):
                best = s[lo + 1:hi]
    return best

print(longest_palindrome("babad"), longest_palindrome("cbbd"))
```
Output:
```text
True False
bab bb
```
### javascript
```javascript
function isPalindrome(text) {
  const cleaned = text.toLowerCase().replace(/[^a-z0-9]/g, "");
  return cleaned === [...cleaned].reverse().join("");
}

const digits = String(12321);
console.log(isPalindrome("Was it a car or a cat I saw?"), isPalindrome("hello"), digits === [...digits].reverse().join(""));
```
Output:
```text
true false true
```

## quiz
1. How many centers must be tried when expanding around centers in a string of length n?
   - [ ] n
   - [x] 2n minus 1
   - [ ] n squared
   - [ ] n divided by 2
   > There are n single-character centers and n minus 1 gaps between characters.
2. What is the extra space of the two-pointer palindrome check on the original string?
   - [ ] O(n)
   - [x] O(1)
   - [ ] O(log n)
   - [ ] O(n squared)
   > Only two indexes are needed.
3. Which strings can be rearranged into a palindrome?
   - [ ] Those with all distinct characters
   - [x] Those with at most one character of odd count
   - [ ] Only those of even length
   - [ ] Only those already palindromes
   > Characters must pair up except possibly one in the middle.
4. What is the longest palindromic substring of cbbd?
   - [ ] c
   - [ ] cbb
   - [x] bb
   - [ ] cbbd
   > It is an even-length palindrome centered between the two b characters.

# Anagram Detection
kind: algorithm
time: O(k log k) per word of length k when sorting the letters to build a signature; O(k) with a letter-count signature over a fixed alphabet; grouping m words costs O(m · k log k) or O(m · k).
space: O(k) per signature, and O(m · k) to store the groups of m words.
practice: group-anagrams-count

## intro
Two words are anagrams if they contain exactly the same letters with the same counts, like "listen" and "silent". Anagram problems teach a pattern that reaches far beyond word games: reduce each item to a canonical signature, and items with equal signatures are equivalent.

## theory
Ways to test two strings:

- Sort both and compare: `sorted(a) == sorted(b)`. O(k log k) per string, very short to write.
- Count letters: build a frequency table for each string (an array of 26 counters for lowercase English, a dictionary otherwise) and compare. O(k) time and O(1) space for a fixed alphabet.
- One table: add counts for the first string and subtract for the second, then check that all entries are zero. Exits early if a count goes negative.
- Product of primes: map each letter to a prime and multiply; equal products imply anagrams, but the numbers overflow fixed-width integers quickly, so it is mainly a curiosity.

Decisions to state: case sensitivity, whether spaces and punctuation count, and the alphabet. "Dormitory" and "dirty room" are anagrams only after removing spaces and ignoring case.

Grouping anagrams: compute the signature of each word, either the sorted letters as text or the tuple of counts, and use it as a dictionary key whose value is the list of words. Words with the same key form a group. A defaultdict with list values keeps the code brief. The number of groups is the number of distinct signatures.

Related problems: find all anagram occurrences of a pattern inside a text (a sliding window of counts, O(n)), check whether one string can be formed from another's letters (a ransom note), find the first non-repeating character, and test for palindromic permutations.

Unicode: counting by code points works for simple text, but composed and decomposed forms of the same letter differ, so normalise first for international input.

## explain
1. Fix the rules: case, spaces, alphabet.
2. Normalise both strings the same way.
3. If lengths differ, they cannot be anagrams.
4. Compare sorted strings, or compare frequency tables.
5. For grouping, derive a signature per word and collect words under the same key.
6. Test with repeated letters, different lengths, empty strings and mixed case.

## example
`is_anagram("listen", "silent")` is True and `is_anagram("rat", "car")` is False using sorted letters. Grouping the words eat, tea, tan, ate, nat and bat by their sorted letters yields three groups: `['eat', 'tea', 'ate']`, `['tan', 'nat']` and `['bat']`, so `len(groups)` is 3. The JavaScript sample builds the same groups with a `Map` and prints them as JSON.

## real
Search engines and spell checkers use canonical signatures to find related words, plagiarism detectors compare multisets of tokens, and bioinformatics tools compare sequences by their composition.

## pros
- The signature idea turns a pairwise comparison into a hash lookup
- Sorting-based code is very short
- Count-based methods are linear

## cons
- Sorting costs more than counting
- Rules about case and punctuation must be settled up front
- Unicode text needs normalisation

## uses
- Checking word pairs for anagrams
- Grouping words that share letters
- Finding rearranged patterns inside text
- Testing whether a message can be built from available letters

## mistakes
- Forgetting to compare lengths or to normalise case
- Using a set of letters, which ignores repeated counts
- Sorting each word inside a nested loop of pairs and getting quadratic grouping
- Using a mutable list as a dictionary key

## interview
**Q:** How do you check two strings for being anagrams?
**A:** Either sort both and compare, or count the letters of each and compare the counts. The counting method is linear for a fixed alphabet.

**Q:** How do you group a list of words into anagram sets efficiently?
**A:** Compute a canonical key for each word, such as its sorted letters or its letter-count tuple, and collect the words in a dictionary keyed by it. Each word is processed once instead of being compared with every other word.

**Q:** Why is comparing sets of letters wrong for anagrams?
**A:** A set ignores how many times a letter occurs, so "aab" and "abb" would look identical even though they are not anagrams.

## summary
Anagrams share the same multiset of letters. Test them by sorting or counting, and group many words by a canonical signature stored as a dictionary key.

## codenote
The Python sample tests pairs and groups words by sorted letters. The JavaScript sample groups with a Map.

## code
### python
```python
from collections import defaultdict

def is_anagram(a, b):
    return sorted(a) == sorted(b)

print(is_anagram("listen", "silent"), is_anagram("rat", "car"))

groups = defaultdict(list)
for word in ["eat", "tea", "tan", "ate", "nat", "bat"]:
    groups["".join(sorted(word))].append(word)

print(list(groups.values()))
print(len(groups))
```
Output:
```text
True False
[['eat', 'tea', 'ate'], ['tan', 'nat'], ['bat']]
3
```
### javascript
```javascript
const groups = new Map();
for (const word of ["eat", "tea", "tan", "ate", "nat", "bat"]) {
  const key = word.split("").sort().join("");
  if (!groups.has(key)) groups.set(key, []);
  groups.get(key).push(word);
}
console.log(JSON.stringify([...groups.values()]));
```
Output:
```text
[["eat","tea","ate"],["tan","nat"],["bat"]]
```

## quiz
1. What must two anagrams have in common?
   - [ ] The same first letter
   - [x] The same letters with the same counts
   - [ ] The same position of vowels
   - [ ] The same meaning
   > They are rearrangements of each other.
2. Which key groups anagrams together?
   - [ ] The word length alone
   - [x] The sorted letters of the word
   - [ ] The first letter
   - [ ] The number of vowels
   > Anagrams have identical sorted forms.
3. Why does a set of letters fail as an anagram test?
   - [ ] Sets are slow
   - [x] It ignores how many times each letter appears
   - [ ] Sets cannot hold letters
   - [ ] It reverses the word
   > Counts matter for anagrams.
4. What is the time for comparing two strings of length k by counting over a fixed alphabet?
   - [ ] O(k squared)
   - [x] O(k)
   - [ ] O(k log k)
   - [ ] O(1)
   > Each string is scanned once.

# String Matching Overview
kind: algorithm
time: Naive search is O(n · m) in the worst case for a text of length n and a pattern of length m. The Knuth-Morris-Pratt algorithm is O(n + m), and Rabin-Karp is O(n + m) on average with rolling hashes but O(n · m) in the worst case.
space: O(1) for the naive method, O(m) for the KMP failure table, and O(1) for the Rabin-Karp hash state.
viz: kmp-search

## intro
String matching asks where a pattern occurs inside a larger text. Every find, search box and search tool answers it. The simple method works well in practice for short patterns, but understanding the smarter algorithms shows how to avoid redoing comparisons that were already made.

## theory
Problem: given a text T of length n and a pattern P of length m, report every index i where `T[i..i+m-1]` equals P.

Approaches:

- Naive (brute force): try each starting position and compare character by character, stopping at the first mismatch. Worst case O(n · m), such as a text of many a's and a pattern like aaaaab. On typical text most attempts fail at the first character, so it is fast in practice.
- Knuth-Morris-Pratt (KMP): preprocess the pattern into a failure (prefix) table, whose entry i is the length of the longest proper prefix of `P[0..i]` that is also a suffix. When a mismatch occurs after matching k characters, the table says how many of them can be reused, so the text pointer never moves backward. O(n + m) time, O(m) space.
- Rabin-Karp: compare a rolling hash of each window of the text with the hash of the pattern, and verify only when the hashes match. Updating the hash costs O(1). Good for searching many patterns at once and for plagiarism detection.
- Boyer-Moore: compare the pattern from its end and use bad-character and good-suffix rules to skip ahead, often examining fewer than n characters; the basis of many practical search tools.
- Z-algorithm and suffix structures (suffix arrays, suffix automata) for repeated queries over the same text
- Aho-Corasick: matches many patterns simultaneously in one pass using a trie with failure links

Practical notes: language libraries (`str.find`, `indexOf`, `strstr`) use optimised variants, so write your own only for learning or special needs. Regular expressions generalise matching to patterns with wildcards, at higher cost.

Example of the KMP table for the pattern abcabd: the entries are 0, 0, 0, 1, 2, 0. After matching abcab and failing on the next character, the table says that the final ab can serve as the start of a new match, so the search resumes with two characters already matched.

## explain
1. State what you need: the first match, all matches (overlapping or not) or just a yes or no.
2. For short patterns or one-off searches, use the library function.
3. For the naive algorithm, slide the pattern over the text and compare, counting comparisons if analysing.
4. For KMP, build the prefix table first, then scan the text once; on a mismatch, fall back using the table.
5. For many patterns, consider Aho-Corasick or hashing.
6. Test with overlapping matches, a pattern longer than the text and repeated characters.

## example
The naive search for "abab" in "abababcabab" finds matches at indexes 0, 2 and 7 after 19 comparisons, because failed attempts usually stop quickly. The KMP prefix table of "abcabd" is `[0, 0, 0, 1, 2, 0]`, and the KMP search returns the same matches as the naive search, so the equality check prints True. The JavaScript sample finds all overlapping occurrences of "ab" in "ababab" at indexes 0, 2 and 4 using `indexOf` repeatedly.

## real
Text editors, grep, databases, antivirus scanners and DNA alignment tools search enormous texts, and the choice of algorithm decides whether a scan takes seconds or hours.

## pros
- KMP and Aho-Corasick give guaranteed linear time
- Rabin-Karp extends naturally to many patterns
- The naive method is simple and fast on typical data

## cons
- Naive search degrades to quadratic on repetitive data
- KMP and Boyer-Moore are harder to implement correctly
- Hash-based methods can have collisions and need verification

## uses
- Find and replace in editors
- Searching logs and source code
- Plagiarism and duplicate detection
- Scanning for virus signatures or biological sequences

## mistakes
- Using the naive method on adversarial repetitive input
- Missing overlapping matches by advancing past the whole match
- Skipping verification after a hash match
- Reimplementing a search that the standard library already does well

## interview
**Q:** What is the worst-case time of naive string matching and when does it occur?
**A:** O(n times m), for example when the text is a long run of the same letter and the pattern is that letter repeated followed by a different one, so every attempt matches almost all of the pattern before failing.

**Q:** What does the KMP failure table contain?
**A:** For each position of the pattern, the length of the longest proper prefix that is also a suffix of the pattern up to that position. It tells the search how much of the matched part can be reused after a mismatch.

**Q:** How does Rabin-Karp avoid comparing every window character by character?
**A:** It compares a rolling hash of the window with the hash of the pattern, updated in constant time as the window slides, and checks the characters only when the hashes are equal.

## summary
String matching can be done naively, with KMP's reuse of prefix information, with rolling hashes or with skipping rules like Boyer-Moore. Use the library function by default, and know the linear-time ideas for repetitive or large inputs.

## codenote
The Python sample implements naive search with a comparison count, the KMP prefix table and KMP search, and checks that the results agree. The JavaScript sample finds overlapping matches.

## code
### python
```python
def naive_search(text, pattern):
    hits, comparisons = [], 0
    for i in range(len(text) - len(pattern) + 1):
        for j in range(len(pattern)):
            comparisons += 1
            if text[i + j] != pattern[j]:
                break
        else:
            hits.append(i)
    return hits, comparisons

def prefix_function(pattern):
    table = [0] * len(pattern)
    k = 0
    for i in range(1, len(pattern)):
        while k and pattern[i] != pattern[k]:
            k = table[k - 1]
        if pattern[i] == pattern[k]:
            k += 1
        table[i] = k
    return table

def kmp_search(text, pattern):
    table = prefix_function(pattern)
    hits, k = [], 0
    for i, char in enumerate(text):
        while k and char != pattern[k]:
            k = table[k - 1]
        if char == pattern[k]:
            k += 1
        if k == len(pattern):
            hits.append(i - k + 1)
            k = table[k - 1]
    return hits

text = "abababcabab"
print(naive_search(text, "abab"))
print(prefix_function("abcabd"))
print(kmp_search(text, "abab") == naive_search(text, "abab")[0])
```
Output:
```text
([0, 2, 7], 19)
[0, 0, 0, 1, 2, 0]
True
```
### javascript
```javascript
const text = "ababab";
const hits = [];
let from = 0;
while (true) {
  const index = text.indexOf("ab", from);
  if (index === -1) break;
  hits.push(index);
  from = index + 1;
}
console.log(hits.join(" "));
```
Output:
```text
0 2 4
```

## quiz
1. What is the worst-case time of naive string matching?
   - [ ] O(n)
   - [ ] O(log n)
   - [x] O(n times m)
   - [ ] O(m)
   > Each of the n starting positions may compare up to m characters.
2. What does the KMP search avoid?
   - [ ] Reading the text
   - [x] Moving the text position backward and redoing comparisons
   - [ ] Building a table
   - [ ] Using the pattern
   > The failure table lets matched characters be reused.
3. Why must a Rabin-Karp hash match be verified?
   - [ ] Hashes are always wrong
   - [x] Different windows can have the same hash value
   - [ ] The hash changes the text
   - [ ] To save memory
   > A collision would otherwise produce a false match.
4. Which approach is best for matching many patterns in one pass?
   - [ ] Naive search repeated
   - [x] The Aho-Corasick automaton
   - [ ] Sorting the text
   - [ ] Reversing the text
   > It combines all patterns into one trie with failure links.

# String Complexity Analysis
kind: algorithm
time: Indexing O(1); length O(1) or O(n) for null-terminated strings; slicing and copying O(k); concatenation O(n + m); equality and comparison O(min(m, n)); substring search O(n · m) worst case; join of k pieces O(total length).
space: O(k) for each new string produced by slicing, copying or concatenation; O(1) extra for in-place index-based algorithms.

## intro
Strings are arrays of characters, so their operations inherit array costs, with extras: immutability forces copies, comparison and search depend on lengths, and a seemingly harmless slice inside a loop can turn a linear algorithm into a quadratic one. A cost table for string operations is as important as the one for lists.

## theory
Typical costs for a string of length n:

- Indexing a character, getting the length (in languages that store it): O(1)
- Slicing k characters: O(k), since the characters are copied in languages with immutable strings
- Concatenating strings of lengths n and m: O(n + m); doing it in a loop for k pieces totals O(k²) in the worst case
- Join of k pieces with total length L: O(L)
- Equality and ordering comparison: O(min(m, n)), and O(1) in the best case when lengths differ and are stored
- Searching a pattern of length m in a text of length n: O(n · m) naive worst case, O(n + m) with KMP
- Reversing, upper- and lowercasing, stripping: O(n)
- Splitting into k parts: O(n)
- Hashing a string (for a dictionary key): O(n) the first time, cached afterwards in many languages
- Building a frequency table: O(n)
- Sorting the characters: O(n log n), or O(n + k) with counting

Where hidden costs appear:

- Slicing inside recursion: a function that handles `s[1:]` at each level copies n - 1, then n - 2, and so on, adding up to O(n²)
- Concatenation in a loop
- Repeated `in` or `find` on a long text inside a loop, O(n) each
- `len()` on null-terminated C strings in the loop condition
- Converting between types (text and bytes, or lists of characters) repeatedly

When n is the length of the string, an algorithm that treats each character a constant number of times is linear. When strings are compared or hashed as keys, their length enters the cost of dictionary operations: looking up a key of length k costs O(k), not O(1).

Remedies: pass indexes instead of slices, build with join or a builder, convert once, precompute or cache, use the right data structure (set for membership), and consider the model of cost the language uses.

## explain
1. List the string operations in your algorithm and their costs.
2. Look for operations inside loops or recursion and multiply by the number of repetitions.
3. Identify copies hidden in slicing, concatenation and conversions.
4. Replace repeated copies with indexes, builders or one-time conversions.
5. Express the total in terms of the string length n and other parameters, such as the number of words.
6. Validate by counting operations on a small and a larger input.

## example
The recursive function `reverse_slicing` takes `s[1:]` at every level; for a 100-character string it copies 99 + 98 + ... + 1 = 4,950 characters, even though the string is only 100 long, and the result is correct. The program prints `4950 100 True`. The JavaScript function counts character comparisons in a naive search: looking for "aaaaab" in twenty a's takes 90 comparisons (15 positions times 6), while looking for "baaaaa" fails at the first character each time and takes only 15.

## real
Performance problems in text-heavy programs usually come from hidden copies, repeated searches and quadratic concatenation, and profilers often point to string functions as hot spots in log parsers and template engines.

## pros
- A cost table makes performance predictable
- Fixes are usually simple once the hidden copy is found
- The same reasoning applies to arrays and lists

## cons
- Costs depend on the language and implementation
- Hidden copies are invisible in the source
- Constant factors can matter as much as the growth rate

## uses
- Reviewing code for hidden quadratic behavior
- Choosing between slicing and index-based recursion
- Estimating whether a text-processing job will finish in time
- Explaining the cost of dictionary lookups with string keys

## mistakes
- Slicing in recursive functions
- Calling find or in on a long string inside a loop
- Assuming dictionary lookups with long string keys are free
- Ignoring the cost of repeated conversions

## interview
**Q:** What is the cost of slicing a string in Python?
**A:** O(k) for a slice of k characters, because a new string is created and the characters are copied.

**Q:** Why is the recursive reversal that uses s[1:] quadratic?
**A:** Each call copies almost the whole remaining string, so the copying adds up to n plus n minus 1 plus down to 1, which is about n squared over 2.

**Q:** What affects the cost of a dictionary lookup with string keys?
**A:** Hashing the key takes time proportional to its length, and equal hashes are confirmed by comparing the strings, so the cost is O(k) for keys of length k.

## summary
String costs follow array costs plus copying: indexing is constant, slicing and concatenation are linear, comparison depends on the common prefix and search can be quadratic. Hunt for hidden copies and repeated scans.

## codenote
The Python sample counts the characters copied by a slicing recursion. The JavaScript sample counts comparisons in a worst-case and a best-case search.

## code
### python
```python
copied = 0

def reverse_slicing(s):
    global copied
    if len(s) <= 1:
        return s
    copied += len(s) - 1
    return reverse_slicing(s[1:]) + s[0]

text = "abcdefghij" * 10
result = reverse_slicing(text)
print(copied, len(result), result == text[::-1])
```
Output:
```text
4950 100 True
```
### javascript
```javascript
function comparisons(text, pattern) {
  let count = 0;
  for (let i = 0; i + pattern.length <= text.length; i++) {
    for (let j = 0; j < pattern.length; j++) {
      count++;
      if (text[i + j] !== pattern[j]) break;
    }
  }
  return count;
}

const text = "a".repeat(20);
console.log(comparisons(text, "aaaaab"), comparisons(text, "baaaaa"));
```
Output:
```text
90 15
```

## quiz
1. What is the cost of concatenating strings of lengths n and m in a language with immutable strings?
   - [ ] O(1)
   - [x] O(n + m)
   - [ ] O(log n)
   - [ ] O(n times m)
   > A new string is built with all the characters.
2. Why is recursion that slices the string quadratic?
   - [ ] Slices are free
   - [x] Each level copies almost the entire remaining string
   - [ ] Recursion is always quadratic
   - [ ] Slicing is O(n log n)
   > The copied lengths add up to about n squared over 2.
3. What is the cost of comparing two strings for equality in the worst case?
   - [ ] O(1)
   - [x] O(min(m, n))
   - [ ] O(m times n)
   - [ ] O(log n)
   > Comparison stops at the first difference.
4. What is a simple remedy for slicing inside recursion?
   - [ ] Use longer strings
   - [x] Pass start and end indexes instead of slices
   - [ ] Remove the base case
   - [ ] Use global variables
   > Indexes avoid copying.

# Unicode and Internationalization
kind: concept
time: Not applicable — handling international text correctly is a matter of choosing the right abstractions; normalising or segmenting text costs time proportional to its length.
space: Not applicable — the lesson concerns correctness across languages and regions, not memory.

## intro
Software used around the world must handle text in every script, written in either direction, compared by many different rules and formatted according to local custom. Unicode provides the foundation, and internationalization, often abbreviated i18n, is the discipline of building on it without assuming that every user writes like you.

## theory
Layers beyond simple encodings:

- Code points versus characters as readers see them: a user-perceived character is a grapheme cluster, which may be several code points. The letter é can be one code point or e followed by a combining accent; the flag of Bangladesh is two regional indicator code points; a family emoji joins three people with zero-width joiners. Counting code points, UTF-16 units or bytes all give different answers from counting what the reader sees.
- Normalization: NFC composes characters where possible, NFD decomposes them, and NFKC and NFKD also replace compatibility variants. Normalise before comparing, searching or storing identifiers.
- Case mapping is language dependent and not one-to-one: German ß uppercases to SS (two characters), Turkish has dotted and dotless i so the lowercase of capital I is ı in a Turkish locale, and capital İ lowercases to i plus a combining dot. Use locale-aware functions and casefold for caseless matching.
- Collation: sort order is defined per language (in Swedish, å sorts after z). Use `Intl.Collator` or a library such as ICU.
- Text direction: Arabic and Hebrew are written right to left; the bidirectional algorithm governs mixed text; user interfaces need mirroring
- Locale-aware formatting of numbers, dates, currencies and plurals: German writes 1.234.567,891, many countries use different calendars, and languages have different plural rules (some have more than two forms)
- Time zones and daylight saving, handled with a proper library and stored in UTC
- Names, addresses and phone numbers do not fit a single format; avoid assumptions about first and last names or postal codes
- Translation: externalise user-facing strings, do not build sentences by concatenation, and leave room for text that grows by 30 percent or more

Tools: the ICU library underlies `Intl` in JavaScript, Java's text classes and many others. Python's `unicodedata`, `locale` and third-party libraries such as Babel and PyICU provide similar features.

## explain
1. Store and exchange text as UTF-8, and treat strings as Unicode throughout.
2. Normalise text before comparison, searching and use as keys.
3. Count user-visible characters with a grapheme-aware tool when it matters for truncation or limits.
4. Use locale-aware functions for case mapping, sorting and formatting, with the user's locale.
5. Put user-facing text in resource files and use plural and format placeholders.
6. Test with a pseudo-locale, long strings, right-to-left text, emoji and accented input.

## example
In Python, the composed and decomposed forms of é have lengths 1 and 2, are unequal, and become equal after normalising to NFC. The flag of Bangladesh has two code points, "ß".upper() is "SS" and the capital dotted İ lowercases to two characters. The JavaScript lines count a family emoji: its string length is 8 UTF-16 units, spreading it gives 5 code points, and `Intl.Segmenter` reports 1 grapheme. The German number format shows 1.234.567,891, and the Turkish lowercase of capital I is the dotless ı.

## real
Products that skip internationalization fail in surprising ways: names truncated through the middle of an emoji, searches that miss accented words, sorted lists that look random to users and dates that are ambiguous between day-first and month-first locales.

## pros
- Correct i18n opens software to the whole world
- Standard libraries encapsulate decades of linguistic knowledge
- Normalised, locale-aware handling makes search and sorting behave as users expect

## cons
- Many special cases that simple code cannot ignore
- Translation and testing across locales cost effort
- Behavior varies between platforms and library versions

## uses
- Truncating and measuring text for display
- Searching and sorting international names
- Formatting dates, numbers and currencies by locale
- Building user interfaces that support right-to-left languages

## mistakes
- Assuming one character is one code point or one UTF-16 unit
- Using lower and upper for locale-sensitive comparisons
- Concatenating translated fragments into sentences
- Storing local time without a time zone

## interview
**Q:** What is a grapheme cluster?
**A:** A user-perceived character, which can consist of several code points, such as a letter with combining accents or an emoji sequence joined by zero-width joiners.

**Q:** Why normalise Unicode text before comparing it?
**A:** The same visible text can be encoded in different code point sequences, such as a composed é and e followed by a combining accent, and normalising makes equivalent text compare equal.

**Q:** What is the difference between internationalization and localization?
**A:** Internationalization is designing software so it can be adapted to different languages and regions without code changes; localization is the actual adaptation for a specific locale, such as translating text and formats.

## summary
Treat text as Unicode, normalise before comparing, count what readers see with grapheme-aware tools and use locale-aware libraries for case, sorting and formatting. Externalise strings and test with diverse input.

## codenote
The Python sample demonstrates normalization and special case mappings. The JavaScript sample shows grapheme counting and locale-specific formatting.

## code
### python
```python
import unicodedata

composed = "é"
decomposed = "é"
print(len(composed), len(decomposed), composed == decomposed)
print(unicodedata.normalize("NFC", decomposed) == composed)

flag = "\U0001F1E7\U0001F1E9"
print(len(flag), "ß".upper(), len("İ".lower()))
```
Output:
```text
1 2 False
True
2 SS 2
```
### javascript
```javascript
const family = "\u{1F468}‍\u{1F469}‍\u{1F467}";
const graphemes = [...new Intl.Segmenter().segment(family)];
console.log(family.length, [...family].length, graphemes.length);

console.log(new Intl.NumberFormat("de-DE").format(1234567.891));
console.log("I".toLocaleLowerCase("tr"));
```
Output:
```text
8 5 1
1.234.567,891
ı
```

## quiz
1. What is a grapheme cluster?
   - [ ] A kind of font
   - [x] What a reader perceives as one character, possibly several code points
   - [ ] A byte order mark
   - [ ] A compression format
   > Counting code points can differ from counting visible characters.
2. Why does the uppercase of the German letter ß differ in length?
   - [ ] It is a bug
   - [x] Its uppercase form is two letters, SS
   - [ ] Because of Python
   - [ ] It uses an emoji
   > Case mapping is not always one-to-one.
3. What does normalizing text to NFC help with?
   - [ ] Compressing it
   - [x] Making equivalent sequences of code points compare equal
   - [ ] Translating it
   - [ ] Changing its direction
   > Composed and decomposed forms become the same.
4. Why should translated fragments not be concatenated to form sentences?
   - [ ] They are too short
   - [x] Word order and grammar differ between languages
   - [ ] Concatenation is slow
   - [ ] Fragments contain emoji
   > Whole sentences with placeholders translate correctly.
