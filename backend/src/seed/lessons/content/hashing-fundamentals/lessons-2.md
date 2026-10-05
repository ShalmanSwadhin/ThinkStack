# Hash Maps in Practice
kind: algorithm
time: O(1) average for insert, lookup and delete of a key, and O(n) in the worst case with many collisions; iterating over all entries is O(n).
space: O(n) for n entries, with some spare capacity kept free to hold the load factor down.

## intro
The hash map, called a dictionary in Python, an object or Map in JavaScript and HashMap in Java, is probably the most used data structure in everyday programming. It maps keys to values with constant-time lookups. Using it well means knowing what can be a key, how it behaves when you iterate or modify it, and which of its idioms save code.

## theory
What a hash map guarantees: given a key, find, insert or remove its value in O(1) on average. It does not keep keys sorted (use a tree map for that) and it requires keys to be hashable, which means they have a hash value that does not change and an equality test consistent with it.

Keys:

- Immutable values are the usual keys: numbers, strings, tuples of hashable values, frozen sets
- Mutable containers such as lists and dictionaries cannot be keys in Python, since their contents could change and invalidate the hash; the attempt raises a TypeError
- JavaScript objects (`{}`) convert keys to strings, so `1` and `"1"` collide; `Map` keeps keys as they are, including numbers, objects and even NaN, and preserves insertion order
- Custom classes need `__hash__` and `__eq__` (Python), or `hashCode` and `equals` (Java), defined consistently

Order: Python dictionaries preserve insertion order since version 3.7, JavaScript's Map does too, Java's HashMap does not (use LinkedHashMap).

Common idioms in Python:

- `d.get(key, default)` reads without a KeyError
- `d.setdefault(key, default)` inserts a default if the key is missing and returns the stored value
- `collections.defaultdict(list)` creates the default automatically for grouping, and `collections.Counter` counts
- Dictionary comprehensions, `dict(zip(keys, values))`, merging with `{**a, **b}` or `a | b`
- `d.pop(key, None)` removes safely; `del d[key]` raises if missing
- Iterating with `.items()`, `.keys()` and `.values()`

Modification during iteration: adding or removing keys while iterating over a dictionary raises an error in Python ("dictionary changed size during iteration") and is unsafe in many other languages, because a resize can rearrange the table; iterate over a copy of the keys instead.

Performance habits: avoid repeated lookups of the same key (store the result), pre-size when the size is known, use tuples as compound keys, and do not use floating-point numbers as keys when equality is fuzzy.

When to prefer something else: ordered traversal or range queries need a sorted structure; a small fixed set of keys may be clearer as an enumeration or a class; memory-tight situations may favour arrays indexed by small integers.

## explain
1. Decide what identifies an item: that is the key, and it must be immutable and hashable.
2. Choose the value: a count, a list for grouping, an object.
3. Use get, setdefault or defaultdict to avoid KeyError and repeated membership checks.
4. Iterate with items when you need both keys and values.
5. Never change the size of the dictionary while iterating over it.
6. Remember the order guarantees of your language and do not rely on them where they are not promised.

## example
The Python inventory dictionary starts with one item, uses `get` to add 5 pears even though the key was missing, and `setdefault` adds a fig with count 0, ending with three entries. A `defaultdict(list)` groups the words ant, bee, ape and bat by first letter into `{'a': ['ant', 'ape'], 'b': ['bee', 'bat']}`. Using a list as a key raises a TypeError complaining that the list is unhashable, while a tuple works. The JavaScript lines show that an object collapses the keys 1 and "1" into one entry but a Map keeps them apart, and that a Map can use NaN as a key.

## real
Caches, indexes, symbol tables, counters, group-by operations and configuration objects are all hash maps, and a large share of everyday algorithmic speed-ups come from replacing a scan with a dictionary lookup.

## pros
- Constant average time for the three basic operations
- Flexible keys and values
- Rich idioms for grouping and counting

## cons
- Keys must be hashable and immutable
- Worst-case performance can degrade with collisions
- Extra memory for spare capacity

## uses
- Caching computed results by input
- Grouping records by a key
- Looking up objects by identifier
- Counting occurrences and building indexes

## mistakes
- Using a mutable list as a key
- Modifying a dictionary while iterating over it
- Using plain JavaScript objects for arbitrary keys and meeting inherited properties or string conversion
- Reading a missing key with brackets and getting an exception

## interview
**Q:** What requirements does a key of a hash map have?
**A:** It must be hashable: its hash value must not change during its lifetime, and equal keys must have equal hashes. In Python this means immutable types such as numbers, strings and tuples of hashable items.

**Q:** What is the difference between get and indexing on a Python dictionary?
**A:** Indexing raises a KeyError for a missing key, while get returns None or a supplied default, which avoids a separate membership check.

**Q:** Why can't you add keys to a dictionary while iterating over it?
**A:** Insertion can trigger a resize that rearranges the table, so the iterator could skip or repeat entries; Python detects the change and raises an error.

## summary
Hash maps give O(1) average lookups for hashable keys. Use get, setdefault and defaultdict to write less code, avoid mutable keys and mid-iteration changes, and remember ordering guarantees per language.

## codenote
The Python sample shows inventory updates, grouping and the unhashable key error. The JavaScript sample contrasts objects and Maps.

## code
### python
```python
from collections import defaultdict

inventory = {"apple": 3}
inventory["pear"] = inventory.get("pear", 0) + 5
inventory.setdefault("fig", 0)
print(inventory, len(inventory))

groups = defaultdict(list)
for word in ["ant", "bee", "ape", "bat"]:
    groups[word[0]].append(word)
print(dict(groups))

try:
    {[1, 2]: "x"}
except TypeError:
    print("a list cannot be a key")

print({(1, 2): "ok"}[(1, 2)], 1 in {1: "a"}, {**inventory, "apple": 9}["apple"])
```
Output:
```text
{'apple': 3, 'pear': 5, 'fig': 0} 3
{'a': ['ant', 'ape'], 'b': ['bee', 'bat']}
a list cannot be a key
ok True 9
```
### javascript
```javascript
const map = new Map();
map.set(1, "number");
map.set("1", "string");

const object = {};
object[1] = "number";
object["1"] = "string";

console.log(map.size, Object.keys(object).length, map.get(1), object[1]);
console.log(new Map([[NaN, "found"]]).get(NaN));
```
Output:
```text
2 1 number string
found
```

## quiz
1. Why can a Python list not be a dictionary key?
   - [ ] Lists are too long
   - [x] It is mutable and therefore unhashable
   - [ ] Lists have no length
   - [ ] Keys must be strings
   > A changing hash would make the entry unfindable.
2. What does setdefault do?
   - [ ] Deletes a key
   - [x] Inserts a default value if the key is missing and returns the stored value
   - [ ] Sorts the keys
   - [ ] Copies the dictionary
   > It combines a membership test and an insertion.
3. What happens to the keys 1 and "1" in a plain JavaScript object?
   - [ ] They stay separate
   - [x] Both become the string "1" and share one property
   - [ ] An error is thrown
   - [ ] The number is deleted
   > Object keys are converted to strings, unlike Map keys.
4. What is the safe way to remove keys while looping?
   - [ ] Delete them inside the loop over the dictionary
   - [x] Iterate over a copy of the keys
   - [ ] Sort the dictionary first
   - [ ] Use recursion
   > Changing the size during iteration is unsafe.

# Hash Sets in Practice
kind: algorithm
time: O(1) average for add, remove and membership tests; union, intersection and difference of sets of sizes a and b cost O(a + b) or O(min(a, b)) depending on the operation.
space: O(n) for n elements, which is why a set can turn a quadratic search into a linear one at the cost of memory.

## intro
A hash set stores unique values and answers "is this in the set?" in constant time. It is a hash map without the values, and it is the quickest way to remove duplicates, to test membership and to combine collections with set algebra. Reaching for a set instead of a list is one of the most common single-line performance fixes.

## theory
Core operations (Python names; Java has `HashSet`, JavaScript `Set`, C++ `unordered_set`):

- `add(x)` inserts if absent, `remove(x)` raises when missing while `discard(x)` does not, `x in s` tests membership
- Elements must be hashable, so sets cannot contain lists or other sets (use tuples and frozen sets)
- Duplicates are ignored: `len({"a", "A", "a"})` is 2
- Iteration order is arbitrary in Python's set (insertion order is preserved in dictionaries, but sets do not promise it), while JavaScript's Set keeps insertion order

Set algebra, each in about linear time:

- Union `a | b`, intersection `a & b`, difference `a - b`, symmetric difference `a ^ b`
- Subset tests `a <= b`, proper subset `a < b`, disjointness `a.isdisjoint(b)`
- JavaScript has newer `union`, `intersection` and `difference` methods in recent engines, and older code uses spread and filter

Frequent patterns:

- Deduplicate: `set(items)`, or `list(dict.fromkeys(items))` to remove duplicates while keeping the first occurrence's order
- Membership in a loop: converting a list to a set once turns each `x in items` from O(n) into O(1), making a nested search linear
- Detect duplicates: add items one by one and stop when `add` finds the item already present
- Visited sets in graph and search algorithms
- Common elements, missing elements and differences between two collections
- Sliding window problems that need the distinct values in the window
- Frozen sets as dictionary keys or as elements of other sets

Costs and cautions: sets use more memory per element than lists (they need room for the hash table), floating-point values as members behave according to equality (NaN is never equal to itself in Python lists but is found in a set by identity), and a set built from mutable objects needs hashing defined carefully. For ordered or range queries, use a sorted structure.

## explain
1. Ask whether you need uniqueness, fast membership or set algebra.
2. Build the set once, outside the loop that queries it.
3. Use discard instead of remove when absence is not an error.
4. Use union, intersection and difference instead of hand-written loops.
5. Preserve order with dict.fromkeys when needed.
6. Check the memory cost for very large collections.

## example
For the sets `{1, 2, 3, 4}` and `{3, 4, 5}` the Python program prints the union `[1, 2, 3, 4, 5]`, the intersection `[3, 4]`, the difference `[1, 2]` and the symmetric difference `[1, 2, 5]`. Deduplicating `[3, 1, 3, 2, 1]` while keeping order with `dict.fromkeys` gives `[3, 1, 2]`. Subset and disjointness tests give True, and the set of "a", "A", "a" has 2 elements. The JavaScript sample performs the same algebra with spread syntax and filters.

## real
Spam filters and blocklists test membership in huge sets, graph algorithms track visited nodes in sets, and data cleaning routinely deduplicates records with them.

## pros
- Constant-time membership
- Built-in set algebra
- Ideal for deduplication

## cons
- Elements must be hashable
- No inherent order in some languages
- More memory than a list of the same elements

## uses
- Removing duplicates
- Fast membership tests inside loops
- Comparing collections with set algebra
- Tracking visited items in searches

## mistakes
- Testing membership in a list inside a loop instead of building a set first
- Expecting a set to keep insertion order in Python
- Trying to put a list inside a set
- Using remove when the element may be missing

## interview
**Q:** How do you remove duplicates from a list while keeping the first occurrence order?
**A:** In Python use list(dict.fromkeys(items)), because dictionaries preserve insertion order and discard repeated keys; a plain set would lose the order.

**Q:** Why is membership in a set faster than in a list?
**A:** A set hashes the element and checks one bucket, O(1) on average, while a list compares against its elements one by one, O(n).

**Q:** What is the difference between remove and discard on a Python set?
**A:** remove raises a KeyError if the element is absent, while discard silently does nothing.

## summary
Sets give O(1) average membership, add and remove, and linear-time set algebra. Build them once, use them for deduplication and visited tracking, and remember that order and hashability rules differ from lists.

## codenote
The Python sample shows set algebra, order-preserving deduplication and comparisons. The JavaScript sample uses Set with spread and filter.

## code
### python
```python
a, b = {1, 2, 3, 4}, {3, 4, 5}
print(sorted(a | b), sorted(a & b), sorted(a - b), sorted(a ^ b))
print(list(dict.fromkeys([3, 1, 3, 2, 1])))
print({1, 2} <= a, a.isdisjoint({9}), len({"a", "A", "a"}))
```
Output:
```text
[1, 2, 3, 4, 5] [3, 4] [1, 2] [1, 2, 5]
[3, 1, 2]
True True 2
```
### javascript
```javascript
const a = new Set([1, 2, 3, 4]);
const b = new Set([3, 4, 5]);

console.log([...new Set([...a, ...b])].join(","));
console.log([...a].filter((x) => b.has(x)).join(","));
console.log([...a].filter((x) => !b.has(x)).join(","));
console.log([...new Set([3, 1, 3, 2, 1])].join(","));
```
Output:
```text
1,2,3,4,5
3,4
1,2
3,1,2
```

## quiz
1. What is the average cost of a membership test on a hash set?
   - [ ] O(n)
   - [x] O(1)
   - [ ] O(log n)
   - [ ] O(n squared)
   > One bucket is examined.
2. How do you deduplicate a list and keep the order in Python?
   - [ ] set(items)
   - [x] list(dict.fromkeys(items))
   - [ ] sorted(items)
   - [ ] items.unique()
   > Dictionary keys preserve insertion order.
3. What does a.isdisjoint(b) test?
   - [ ] Whether a is a subset of b
   - [x] Whether a and b have no elements in common
   - [ ] Whether a equals b
   - [ ] Whether b is empty
   > It is true when the intersection is empty.
4. Why can a list not be an element of a set?
   - [ ] Lists are empty
   - [x] It is mutable and therefore unhashable
   - [ ] Sets only hold numbers
   - [ ] Lists are too slow
   > Set members need stable hashes.

# Frequency Maps
kind: algorithm
time: O(n) to count n items, since each increment is an O(1) average hash map update; extracting the k most frequent takes O(n log k) with a heap or O(n log n) with a sort.
space: O(d) for d distinct items, which is at most n.
practice: group-anagrams-count

## intro
A frequency map counts how many times each distinct item occurs: words in a document, characters in a string, values in a column. It is the hash map pattern used most often, and many problems that look hard, such as finding the most common element, checking whether one text can be built from another, or finding the first unique character, become a counting step followed by a lookup.

## theory
Building the map:

- Manual: `counts[x] = counts.get(x, 0) + 1`
- Python's `collections.Counter(iterable)`, a dictionary subclass that counts and provides `most_common(k)`, arithmetic between counters and missing keys default to 0
- JavaScript: a `Map` with `counts.set(x, (counts.get(x) ?? 0) + 1)`, or an object for string keys
- When the keys are small integers or letters, an array of counters is faster and simpler (see counting arrays)

Typical queries on a frequency map:

- Most or least common items: sort by count, or keep the best k in a heap (`Counter.most_common(k)` uses a heap internally for small k)
- First non-repeating element: count in one pass, then scan the original order for the first item whose count is 1. `"swiss"` gives index 1, the letter w; `"aabb"` has none, giving −1.
- Does a message fit in a supply of letters (ransom note): `Counter(note) - Counter(magazine)` is empty exactly when every needed letter is available in sufficient quantity. Counter subtraction keeps only positive counts.
- Majority element: an item with count above n/2 (or the Boyer-Moore voting algorithm for O(1) space)
- Equality of multisets: two collections are permutations of each other if their counters are equal; anagram checks and grouping by a count signature work the same way
- Top k frequent: count, then use a heap or bucket sort by frequency (buckets indexed by count give O(n))
- Sliding window with counts: add the incoming item, remove the outgoing one, and track how many distinct items or how many match a required count
- Detect duplicates: any count above 1

Remember tie-breaking: when two items have the same count, `most_common` returns them in first-encountered order, which is stable but not meaningful, so specify a secondary rule (such as alphabetical) when the output order matters.

Memory and scale: the map holds one entry per distinct item, which may be large for text or log data; approximate structures such as count-min sketches and Misra-Gries summaries trade accuracy for bounded memory on streams.

Pitfalls: counting before normalising (case, whitespace, punctuation) so that "The" and "the" are separate; floating-point keys; forgetting that counters can hold zero or negative counts after arithmetic; and sorting by count with an unstable or wrongly specified key.

## explain
1. Decide what an item is and normalise it: lowercase, strip punctuation, split into words.
2. Build the map in one pass over the data.
3. Answer the query: top k, uniqueness, comparison with another counter.
4. For ties, define a deterministic secondary order.
5. Use an array of counters if the keys are small integers.
6. For huge streams, consider approximate summaries.

## example
Counting the words of "the cat and the hat and the bat" gives `the` three times and `and` twice, so `most_common(2)` returns `[('the', 3), ('and', 2)]`. `first_unique("swiss")` returns 1 and `first_unique("aabb")` returns −1. The ransom note "aab" can be built from the magazine "baaa" (the counter difference is empty) but "aabb" cannot be built from "abc". The JavaScript program counts the same words with a Map and sorts by count and then alphabetically.

## real
Search engines count term frequencies, log analysers find the most common errors, spell checkers compare letter counts and recommendation systems count co-occurrences.

## pros
- One pass and simple code
- Supports many questions after a single count
- Works for any hashable item

## cons
- Memory grows with the number of distinct items
- Ties need explicit ordering
- Normalisation is easy to forget

## uses
- Finding the most frequent words or errors
- Checking whether one text can be built from another
- Finding the first unique character
- Comparing multisets and grouping by composition

## mistakes
- Counting words without normalising case and punctuation
- Relying on the order of tied counts
- Subtracting counters and forgetting that negatives are dropped
- Using a map where a small array of counters would do

## interview
**Q:** How do you find the most frequent element in a list?
**A:** Build a frequency map in one pass and take the key with the maximum count, which is O(n); for the top k use a heap of size k or a bucket sort by count.

**Q:** How do you find the first non-repeating character in a string?
**A:** Count the characters in a first pass, then scan the string again in order and return the first character whose count is one.

**Q:** How can you check whether a ransom note can be built from a magazine?
**A:** Count the letters of both and verify that the magazine has at least as many of every letter the note needs; with Counter, the difference note minus magazine must be empty.

## summary
A frequency map counts items in one pass and then answers questions about most common, unique or buildable. Normalise first, define tie-breaking and use arrays of counters for small integer keys.

## codenote
The Python sample uses Counter for top words, the first unique character and the ransom note test. The JavaScript sample builds the map manually and sorts it.

## code
### python
```python
from collections import Counter

text = "the cat and the hat and the bat"
print(Counter(text.split()).most_common(2))

def first_unique(s):
    counts = Counter(s)
    return next((i for i, char in enumerate(s) if counts[char] == 1), -1)

print(first_unique("swiss"), first_unique("aabb"))
print(not (Counter("aab") - Counter("baaa")), not (Counter("aabb") - Counter("abc")))
```
Output:
```text
[('the', 3), ('and', 2)]
1 -1
True False
```
### javascript
```javascript
const counts = new Map();
for (const word of "the cat and the hat and the bat".split(" ")) {
  counts.set(word, (counts.get(word) ?? 0) + 1);
}

const top = [...counts].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, 2);
console.log(top);
```
Output:
```text
[ [ 'the', 3 ], [ 'and', 2 ] ]
```

## quiz
1. What does Counter.most_common(2) return?
   - [ ] The two rarest items
   - [x] The two items with the highest counts, with their counts
   - [ ] The first two items
   - [ ] The sorted keys
   > It lists items by descending frequency.
2. How do you find the first non-repeating character?
   - [ ] Sort the string
   - [x] Count characters, then scan in order for the first count of one
   - [ ] Use recursion
   - [ ] Reverse the string
   > The second pass preserves the original order.
3. What does Counter subtraction keep?
   - [ ] Negative counts
   - [x] Only positive counts
   - [ ] Zero counts
   - [ ] All keys
   > An empty result means the first multiset fits within the second.
4. Why define a secondary order for tied counts?
   - [ ] Ties cannot occur
   - [x] Without it, the output order of equal counts is arbitrary
   - [ ] It speeds up counting
   - [ ] It reduces memory
   > A deterministic rule makes results reproducible.

# Two Sum with Hashing
kind: algorithm
time: O(n) for a single pass over n numbers, with an O(1) average dictionary lookup per element; the brute-force alternative is O(n²).
space: O(n) for the dictionary of values already seen.
practice: two-sum-indices

## intro
Find two numbers in a list that add up to a target. The pairwise comparison is the obvious answer and takes quadratic time. A hash map turns it into a single pass: for each number, ask whether its complement, target minus that number, has been seen already. It is the standard demonstration of how a dictionary replaces an inner loop.

## theory
Algorithm: create an empty dictionary from value to index. For each element `x` at index `i`:

- Compute `need = target − x`
- If `need` is in the dictionary, the answer is the stored index of `need` and `i`
- Otherwise record `x` with index `i` and continue

Why store after checking: it prevents using the same element twice. If the target is 6 and the list is `[3, 2, 4]`, then at 3 the complement 3 is not yet stored, so the element is not paired with itself, and the pair (2, 4) at indices 1 and 2 is found later.

Complexity: one pass, one dictionary operation per element: O(n) time and O(n) space. The two-pointer approach on a sorted array uses O(1) extra space but costs O(n log n) for sorting and loses the original indexes unless they are stored.

Variants:

- All pairs and counting pairs: count how many pairs add to k, using a frequency map of seen values; for each element add the number of earlier occurrences of the complement. For `[1, 5, 7, -1, 5]` and k = 6 there are 3 pairs (1 with each 5, and 7 with −1). Duplicates require counts instead of simple presence.
- Unique pairs: use a set to avoid reporting the same pair twice
- Three sum: sort, fix one element, and run the pair search on the rest, O(n²)
- Four sum and k sum: nesting or a map of pair sums
- Subarray sum equals k: the same complement idea applies to prefix sums (store counts of prefix sums seen so far)
- Pairs with a given difference: look up `x + d` and `x − d`
- Streaming: keep the dictionary as data arrives, answering whether any earlier element completes the pair
- Two sum in a sorted array: two pointers, or binary search for the complement

Edge cases to ask about: whether exactly one solution exists, whether the same element may be used twice (a pair like 3 + 3 requires two separate occurrences), negative numbers and zero, an empty or single-element list, and what to return when there is no pair.

Hash quality does not matter much for small integers, but anti-hash inputs against naive tables in some contest settings can degrade the dictionary; in practice standard dictionaries handle it.

## explain
1. Clarify the requirements: indices or values, one pair or all pairs, duplicates allowed.
2. Create the dictionary and scan the elements in order.
3. For each element compute its complement and look it up.
4. If found, return both indexes; otherwise store the current element.
5. For counting problems store frequencies, not just indexes.
6. Test duplicates, negatives, no solution and the same value twice.

## example
`two_sum([2, 7, 11, 15], 9)` returns `(0, 1)` after seeing only the first two numbers, and `two_sum([3, 2, 4], 6)` returns `(1, 2)`, not pairing the 3 with itself. The pair counter on `[1, 5, 7, -1, 5]` with k = 6 returns 3. The JavaScript function uses a Map and returns the indices `[1,2]` for the same input.

## real
Payment reconciliation matches amounts that sum to a total, recommendation engines look for complementary items, and the problem is among the most frequently used interview warm-ups to test knowledge of hash maps.

## pros
- Linear time instead of quadratic
- Short, clear code
- Easy to adapt to streaming and counting variants

## cons
- Needs O(n) extra memory
- Duplicates and self-pairing need care
- Does not preserve sorted order or find all pairs without extra work

## uses
- Finding pairs that sum to a target
- Counting pairs with a given sum or difference
- Finding subarrays with a given sum using prefix sums
- Matching complementary records

## mistakes
- Storing the current element before checking, and pairing it with itself
- Using a set when a count or index is needed
- Forgetting that duplicates can form a valid pair
- Returning values instead of the required indices

## interview
**Q:** How do you solve two sum in O(n) time?
**A:** Scan the list while keeping a dictionary of values to indexes. For each element look up target minus the element; if present, return the stored index and the current one, otherwise store the element.

**Q:** Why do you check the dictionary before inserting the current element?
**A:** So that an element cannot be paired with itself; a number equal to half the target needs a second occurrence to form a pair.

**Q:** What changes when you must count all pairs rather than find one?
**A:** Store frequencies instead of single indexes and add the number of earlier occurrences of the complement for each element, which handles duplicates correctly.

## summary
Two sum becomes linear by looking up each element's complement in a dictionary of earlier elements. Check before inserting, store counts for counting variants and clarify duplicates and the return format.

## codenote
The Python sample finds a pair and counts pairs. The JavaScript sample returns indices with a Map.

## code
### python
```python
from collections import Counter

def two_sum(numbers, target):
    seen = {}
    for index, value in enumerate(numbers):
        if target - value in seen:
            return seen[target - value], index
        seen[value] = index

def count_pairs(numbers, target):
    earlier, total = Counter(), 0
    for value in numbers:
        total += earlier[target - value]
        earlier[value] += 1
    return total

print(two_sum([2, 7, 11, 15], 9), two_sum([3, 2, 4], 6))
print(count_pairs([1, 5, 7, -1, 5], 6))
```
Output:
```text
(0, 1) (1, 2)
3
```
### javascript
```javascript
function twoSum(numbers, target) {
  const seen = new Map();
  for (let i = 0; i < numbers.length; i++) {
    const need = target - numbers[i];
    if (seen.has(need)) return [seen.get(need), i];
    seen.set(numbers[i], i);
  }
  return null;
}

console.log(JSON.stringify(twoSum([3, 2, 4], 6)));
console.log(JSON.stringify(twoSum([1, 2], 10)));
```
Output:
```text
[1,2]
null
```

## quiz
1. What does the dictionary map in the hash-based two sum?
   - [ ] Indexes to values
   - [x] Values already seen to their indexes
   - [ ] Targets to pairs
   - [ ] Sums to counts
   > Looking up the complement finds an earlier partner.
2. What is the time complexity of the hash-based solution?
   - [ ] O(n squared)
   - [x] O(n)
   - [ ] O(log n)
   - [ ] O(1)
   > One pass with constant average lookups.
3. Why check for the complement before storing the current value?
   - [ ] It is faster
   - [x] It prevents pairing an element with itself
   - [ ] It sorts the dictionary
   - [ ] Python requires it
   > A value needs a second occurrence to pair with itself.
4. What must be stored to count all pairs correctly with duplicates?
   - [ ] Only the last index
   - [x] The frequency of each value seen so far
   - [ ] The sorted array
   - [ ] Nothing
   > Each earlier occurrence of the complement forms a pair.

# Consistent Hashing Intro
kind: algorithm
time: O(log V) per lookup with a sorted ring of V virtual points using binary search, and O(V) to add or remove a server's points if the ring is rebuilt; only about K/N keys move when one of N servers is added or removed, for K keys.
space: O(V) for the ring, where V is the number of nodes times the virtual points per node.

## intro
Spreading keys across several servers by taking the hash of the key modulo the server count works until N changes: adding or removing one server remaps almost every key, so caches go cold and data must be moved everywhere. Consistent hashing solves this by arranging servers and keys on a circle, so that adding or removing a server moves only the keys next to it.

## theory
The ring: map the output range of a hash function onto a circle, from 0 up to the maximum and wrapping around. Hash each server (by name or address) to a point on the circle. To find the owner of a key, hash the key to a point and walk clockwise to the first server point at or after it; wrap around if none is found. A sorted list of server points and a binary search implement the walk.

Why it moves few keys: when a new server is inserted, it takes over only the arc between its predecessor's point and its own point; keys elsewhere keep their owners. Removing a server hands its arc to the next server clockwise. On average, adding the (N + 1)-th server moves K/(N + 1) of K keys, and all of those move to the new server. Modulo hashing moves about N/(N + 1) of the keys, nearly all of them.

Virtual nodes: with one point per server, the arcs are uneven, so some servers get much more load than others. Giving each server many points (50 to 200 virtual nodes) smooths the distribution toward equal shares and lets heterogeneous servers receive proportionally more points. It also spreads the load of a failed server across all the others rather than dumping it onto a single neighbour.

Replication: store each key on the next R distinct servers clockwise (its preference list), as Dynamo and Cassandra do, so that a failure does not lose data and reads can use any replica.

Properties and costs:

- Lookup O(log V) by binary search on the sorted ring, or O(1) with extra structures such as jump hash or rendezvous (highest random weight) hashing
- Balanced load needs enough virtual nodes: the standard deviation of load shrinks like 1/√V
- Membership changes are cheap and local
- Hash quality matters: the hash must spread both server points and keys uniformly, so use a good non-cryptographic hash (MurmurHash, xxHash) or MD5-style hashes for simplicity

Alternatives: rendezvous hashing assigns each key to the server with the highest hash of (server, key), needs no ring and moves the same minimal fraction of keys; jump consistent hash needs no memory but only supports adding or removing the last bucket; maglev hashing builds a lookup table for fast routing.

Uses: distributed caches such as Memcached clients, key-value stores (Dynamo, Cassandra, Riak), content delivery networks, load balancers that need session affinity, and sharded databases.

## explain
1. Choose a hash function with a large output range and uniform spread.
2. Place each server on the ring at several points, for example by hashing "server#i".
3. Keep the points sorted by hash value.
4. To find the owner of a key, hash it and find the first server point greater than or equal to the key's hash, wrapping at the end.
5. When servers change, add or remove their points and let the affected arcs change owners.
6. Measure the load distribution and the fraction of keys that move.

## example
The Python ring hashes three servers A, B and C with 20 virtual points each into a space of 10,000 positions and assigns 1,000 keys. Adding a fourth server D moves only 208 keys, all of them to D, while recomputing `hash % 3` versus `hash % 4` would change the owner of 747 keys. The final load is A 325, B 215, C 252 and D 208, uneven because 20 virtual points are few. The JavaScript program repeats the experiment with a 32-bit hash and confirms that every moved key went to the new server and that the modulo scheme moves more keys.

## real
Amazon's Dynamo, Cassandra, Memcached client libraries, content delivery networks and many load balancers use consistent hashing or its relatives to scale clusters without remapping the whole key space.

## pros
- Adding or removing a server moves only a small fraction of the keys
- Works with replication and weighting through virtual nodes
- Lookup is logarithmic in the ring size

## cons
- Needs enough virtual nodes for balance
- More complex than modulo hashing
- The ring metadata must be consistent across clients

## uses
- Distributed caches and key-value stores
- Sharding databases and queues
- Load balancing with session affinity
- Content delivery routing

## mistakes
- Using one point per server and getting very uneven load
- Using a weak hash that clusters points
- Forgetting to wrap around past the largest point
- Letting clients disagree about the ring membership

## interview
**Q:** What problem does consistent hashing solve?
**A:** With modulo hashing, changing the number of servers remaps nearly all keys. Consistent hashing places servers and keys on a ring so that adding or removing a server affects only the keys in its neighbouring arc.

**Q:** What are virtual nodes and why are they used?
**A:** Several points on the ring per physical server. They even out the load, allow weighting by capacity and spread a failed server's keys across many others.

**Q:** What fraction of keys moves when the N-th server joins a consistent hash ring?
**A:** About 1 over N of the keys, all of them moving to the new server, compared with almost all keys for modulo hashing.

## summary
Consistent hashing places servers and keys on a ring and assigns each key to the next server clockwise, so cluster changes move only about 1/N of the keys. Use many virtual nodes for balance and replication for durability.

## codenote
The Python sample builds a ring with virtual nodes and compares movement with modulo hashing. The JavaScript sample confirms that moved keys go only to the new server.

## code
### python
```python
import bisect
import hashlib
from collections import Counter

def h(text):
    return int(hashlib.md5(text.encode()).hexdigest(), 16) % 10000

def build_ring(servers, virtual=20):
    return sorted((h(f"{server}#{v}"), server) for server in servers for v in range(virtual))

def owner(ring, key):
    position = bisect.bisect(ring, (h(key), "~")) % len(ring)
    return ring[position][1]

keys = [f"key{i}" for i in range(1000)]
three = build_ring(["A", "B", "C"])
four = build_ring(["A", "B", "C", "D"])

moved = sum(owner(three, k) != owner(four, k) for k in keys)
modulo_moved = sum(h(k) % 3 != h(k) % 4 for k in keys)
print(moved, modulo_moved)
print(sorted(Counter(owner(four, k) for k in keys).items()))
```
Output:
```text
208 747
[('A', 325), ('B', 215), ('C', 252), ('D', 208)]
```
### javascript
```javascript
const fnv = (text) => {
  let hash = 0x811c9dc5;
  for (const char of text) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
};

const makeRing = (servers, virtual = 20) =>
  servers.flatMap((s) => Array.from({ length: virtual }, (_, v) => [fnv(s + "#" + v), s])).sort((a, b) => a[0] - b[0]);

const owner = (ring, key) => {
  const position = fnv(key);
  for (const [point, server] of ring) if (point >= position) return server;
  return ring[0][1];
};

const keys = Array.from({ length: 1000 }, (_, i) => "key" + i);
const three = makeRing(["A", "B", "C"]);
const four = makeRing(["A", "B", "C", "D"]);

const moved = keys.filter((k) => owner(three, k) !== owner(four, k));
console.log(moved.every((k) => owner(four, k) === "D"));
console.log(keys.filter((k) => fnv(k) % 3 !== fnv(k) % 4).length > moved.length);
```
Output:
```text
true
true
```

## quiz
1. What happens to most keys when a server is added with modulo hashing?
   - [ ] They stay put
   - [x] They are remapped to different servers
   - [ ] They are deleted
   - [ ] They are duplicated
   > The modulus changes, so nearly every key gets a new owner.
2. How does consistent hashing find the server for a key?
   - [ ] By sorting the keys
   - [x] It hashes the key onto the ring and takes the next server point clockwise
   - [ ] By asking every server
   - [ ] By modulo of the key
   > The ring defines ownership by arcs.
3. Why use virtual nodes?
   - [ ] To reduce the number of servers
   - [x] To balance the load and spread a failed server's keys across the others
   - [ ] To make hashes shorter
   - [ ] To avoid replication
   > Many points per server smooth out uneven arcs.
4. Which fraction of keys moves when the N-th server joins a consistent ring?
   - [ ] Almost all
   - [x] About 1 over N
   - [ ] Half
   - [ ] None
   > Only the arc taken over by the new server moves.

# Hashing Security Overview
kind: concept
time: Not an algorithmic topic — security hashing deliberately costs time, as with password hashing functions that are tuned to be slow; the lesson covers what to use where and why.
space: Not an algorithmic topic — memory-hard password functions such as scrypt and Argon2 intentionally use configurable amounts of memory.

## intro
Hash functions protect passwords, verify downloads, sign messages and defend servers from crafted inputs, but each job needs a different kind of hash and using the wrong one is a classic security mistake. A fast hash is wonderful for tables and dangerous for passwords, and a cryptographic hash is not by itself a way to authenticate a message.

## theory
Families and what they are for:

- Table hashes (MurmurHash, xxHash, FNV, SipHash): fast, non-cryptographic. SipHash is keyed with a random secret to resist hash flooding; the others are unsafe against adversaries who can choose keys.
- Cryptographic hashes (SHA-256, SHA-3, BLAKE2/3): one-way functions with pre-image, second pre-image and collision resistance. Use for integrity checks, fingerprints, commit schemes and as building blocks. MD5 and SHA-1 are broken for collision resistance and must not be used for signatures or certificates, though they remain in non-security checksums.
- Message authentication codes (HMAC-SHA-256): a keyed hash that proves a message came from someone holding the secret key and was not altered. A plain hash does not authenticate, because anyone can compute it; and naive constructions like `hash(key + message)` are vulnerable to length-extension attacks on Merkle–Damgård hashes such as SHA-256.
- Password hashing functions (Argon2id, scrypt, bcrypt, PBKDF2): deliberately slow and, for the first three, memory hard, so attackers cannot test billions of guesses per second. They take a per-password random salt and a cost parameter.
- Checksums (CRC32, Adler-32): detect accidental corruption only; trivial to forge

Password storage rules:

- Never store passwords in plain text or with a fast hash such as SHA-256 or MD5 alone: GPUs can try billions of guesses per second against leaked hashes
- Use a unique random salt per password so identical passwords have different hashes and precomputed rainbow tables are useless; the salt is stored beside the hash and need not be secret
- Use a slow, memory-hard function with current parameters (for example PBKDF2 with hundreds of thousands of iterations, bcrypt with cost 12 or more, or Argon2id) and plan to raise them over time
- Optionally add a pepper, a secret key stored outside the database
- Compare hashes in constant time to avoid timing leaks (`hmac.compare_digest` in Python, `crypto.timingSafeEqual` in Node)
- Never invent your own scheme; use the library or framework facility

Other threats and defences:

- Hash flooding (algorithmic complexity attacks): crafted keys all collide in a table and turn O(1) operations into O(n), tying up a server. Defences: randomised or keyed hashes (SipHash), universal hashing, balanced-tree buckets, and request size limits.
- Collision attacks on signatures: chosen-prefix collisions in MD5 and SHA-1 allowed forged certificates, which is why they were retired
- Length extension: prefer HMAC or SHA-3 and BLAKE for keyed uses
- Rainbow tables: defeated by salts
- Birthday bound: a collision in an n-bit hash takes about 2^(n/2) attempts, which is why 128-bit digests are no longer considered safe against collisions and 256 bits is the standard

Examples of outputs: SHA-256 of "abc" begins `ba7816bf8f01cfea`; the PBKDF2-HMAC-SHA-256 of the password "password" with the salt "salt" and 1,000 iterations begins `632c2812e46d4604`; the HMAC-SHA-256 of "message" under the key "key" begins `6e9ef29b75fffc5b`.

## explain
1. Name the purpose: table, integrity, authentication, password storage or fingerprinting.
2. Pick the matching primitive: table hash, SHA-2 or SHA-3, HMAC, or Argon2 and friends.
3. For passwords, generate a random salt, choose cost parameters, store the algorithm, parameters, salt and hash together.
4. Compare secrets and authentication tags with a constant-time function.
5. Randomise or key table hashes in services that accept untrusted keys.
6. Review the choices as hardware improves and standards change.

## example
The Python lines compute the SHA-256 digest of "abc", whose first 16 hexadecimal digits are `ba7816bf8f01cfea`, derive a key from a password with PBKDF2 (1,000 iterations, shown only for the demonstration, as real systems use many more), compute an HMAC and compare two strings in constant time. The JavaScript sample uses the Node crypto module for the same SHA-256 and HMAC results and confirms that `timingSafeEqual` accepts equal buffers.

## real
Every login system, software update channel, TLS certificate chain and blockchain depends on these primitives, and breaches regularly reveal whether a company used salted, slow password hashes or fast unsalted ones.

## pros
- Well-studied standard primitives exist for each purpose
- Salting and slow hashing make stolen password databases much harder to crack
- HMAC and keyed hashes provide authentication and flood resistance

## cons
- Easy to pick a primitive that does not fit the purpose
- Parameters must be tuned and updated over time
- Constant-time comparison and key handling are easy to forget

## uses
- Storing user passwords safely
- Verifying file integrity and signatures
- Authenticating API requests with HMAC
- Protecting hash tables from crafted keys

## mistakes
- Storing passwords with a fast unsalted hash such as MD5 or SHA-256
- Using hash of key plus message instead of HMAC
- Comparing hashes with an ordinary equality check
- Using non-cryptographic hashes for security decisions

## interview
**Q:** How should passwords be stored?
**A:** With a unique random salt and a slow, memory-hard password hashing function such as Argon2id, scrypt, bcrypt or PBKDF2 with a high iteration count, storing the parameters with the hash and comparing in constant time.

**Q:** Why is a plain SHA-256 of a password not enough?
**A:** It is very fast, so attackers can test enormous numbers of guesses per second, and without a salt identical passwords share a hash and precomputed tables work.

**Q:** What is the difference between a hash and an HMAC?
**A:** A hash is computed from data alone, so anyone can recompute it, while an HMAC mixes in a secret key, so only holders of the key can produce a valid tag, which authenticates the message.

## summary
Choose the hash for the job: fast keyed hashes for tables, SHA-2 or SHA-3 for integrity, HMAC for authentication and salted slow functions for passwords. Compare secrets in constant time and avoid broken algorithms such as MD5 and SHA-1.

## codenote
The Python sample computes SHA-256, PBKDF2, HMAC and a constant-time comparison. The JavaScript sample uses the Node crypto module.

## code
### python
```python
import hashlib
import hmac

print(hashlib.sha256(b"abc").hexdigest()[:16])
print(hashlib.pbkdf2_hmac("sha256", b"password", b"salt", 1000).hex()[:16])
print(hmac.new(b"key", b"message", hashlib.sha256).hexdigest()[:16])
print(hmac.compare_digest("abc", "abc"), hmac.compare_digest("abc", "abd"))
```
Output:
```text
ba7816bf8f01cfea
632c2812e46d4604
6e9ef29b75fffc5b
True False
```
### javascript
```javascript
const crypto = require("crypto");

console.log(crypto.createHash("sha256").update("abc").digest("hex").slice(0, 16));
console.log(crypto.createHmac("sha256", "key").update("message").digest("hex").slice(0, 16));
console.log(crypto.timingSafeEqual(Buffer.from("abc"), Buffer.from("abc")));
```
Output:
```text
ba7816bf8f01cfea
6e9ef29b75fffc5b
true
```

## quiz
1. Why is a fast hash a poor choice for passwords?
   - [ ] It is too slow
   - [x] Attackers can test huge numbers of guesses per second
   - [ ] It produces long output
   - [ ] It cannot hash text
   > Password hashing should be deliberately expensive.
2. What does a salt do?
   - [ ] Encrypts the password
   - [x] Makes each password hash unique and defeats precomputed tables
   - [ ] Speeds up hashing
   - [ ] Replaces the password
   > It is random per user and stored with the hash.
3. What does HMAC add to a hash?
   - [ ] A longer digest
   - [x] A secret key, so only key holders can produce a valid tag
   - [ ] Reversibility
   - [ ] Compression
   > A plain hash can be recomputed by anyone.
4. How can hash flooding of a server be reduced?
   - [ ] Use a faster hash
   - [x] Use randomised or keyed hashing such as SipHash
   - [ ] Remove the table
   - [ ] Sort the keys first
   > Attackers cannot predict which keys collide.
