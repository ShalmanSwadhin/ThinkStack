# Hash Table Internals
kind: algorithm
time: O(1) expected for insert, lookup and delete when the hash function spreads keys evenly and the load factor is bounded; O(n) in the worst case when many keys collide into one bucket or probe sequence.
space: O(n) for n entries plus slack, since the bucket array is kept larger than the number of entries, typically between 1.3 and 2 times.
viz: hash-linear-probing

## intro
A hash table stores key and value pairs in an array and finds a pair by computing where the key belongs instead of searching for it. Understanding the pieces inside, the hash function, the index calculation, collision handling and resizing, explains why lookups are usually constant time and what makes them occasionally slow.

## theory
The core pipeline for a lookup:

- Hash: turn the key into an integer with a hash function; equal keys must always produce equal hashes
- Compress: map the integer to a bucket index, usually `hash mod capacity`, or a bit mask when the capacity is a power of two
- Probe: inspect the bucket (and, on collision, further buckets or a chain) until the key is found or the search proves it is absent
- Compare: confirm with an equality test, since different keys can share a hash and an index

Collisions are unavoidable: more possible keys than buckets means some keys share an index (the pigeonhole principle). Two main strategies:

- Separate chaining: each bucket holds a small list of entries; a collision appends to the list
- Open addressing: all entries live in the array itself; a collision makes you probe other slots, for example the next free slot (linear probing)

Linear probing example with capacity 7 and the hash `key mod 7`: inserting 10, 20, 30, 15 and 22 places 10 at index 3, 20 at 6, 30 at 2 and 15 at 1. The key 22 also hashes to 1, which is taken, so the probe tries 2 (taken), 3 (taken) and stops at 4. Lookups follow the same probe order: searching for 22 starts at 1 and takes four probes. A missing key stops at the first empty slot.

Deletion in open addressing cannot simply empty the slot, because later keys in the same probe run would become unreachable. Use a tombstone marker that lookups skip and inserts may reuse, and rebuild the table when tombstones accumulate.

Load factor: α = entries divided by capacity. Chaining stays fast for α around 1; linear probing degrades quickly above about 0.7 because clusters of occupied slots grow, so implementations resize at a threshold such as 0.5 to 0.75. Resizing allocates a larger array (usually double) and reinserts every entry with the new capacity, which costs O(n) but happens rarely, leaving the amortised cost of an insert at O(1).

Hash function qualities: deterministic, fast, uniform over the buckets and sensitive to every part of the key. Poor functions, such as using only the first character of a string or taking the modulo of numbers that share a factor with the capacity, create heavy collisions. Production hash tables mix bits (multiply and shift, or use a randomised seed) and may switch to balanced trees for long chains (Java's HashMap treeifies a chain beyond eight entries).

Security: predictable hashes let an attacker craft many colliding keys and force O(n) behaviour per operation, a hash flooding denial of service attack; languages therefore randomise the seed of string hashes (Python and many others do this per process).

Keys must be immutable or at least must not change while stored, because a changed key hashes to a different bucket and the entry becomes unreachable.

Order: a hash table has no inherent key order; Python dictionaries preserve insertion order as an implementation of a compact design, and other tables may iterate in arbitrary order.

## explain
1. Compute the hash of the key and reduce it to a bucket index.
2. Check the bucket: for chaining search the chain, for open addressing follow the probe sequence.
3. Compare the stored key with the query key using equality.
4. On insert, add the entry in the chain or the first free slot, and update the size.
5. When the load factor exceeds the threshold, allocate a larger array and reinsert every entry.
6. For deletions in open addressing, mark a tombstone instead of emptying the slot.

## example
The Python class implements linear probing with capacity 7 and prints where 10, 20, 30, 15 and 22 land: the key 22 ends at index 4 after probing three occupied slots. The JavaScript class uses separate chaining with a load factor limit of 0.75 and reports the capacities as ten keys are inserted starting from capacity 4.

## real
Dictionaries and sets in Python, objects and maps in JavaScript, and HashMap in Java are all hash tables, and databases use hash indexes and hash joins built on the same ideas.

## pros
- Constant expected time for lookups and inserts
- Simple key to value interface
- Resizing keeps the cost amortised constant

## cons
- Worst case is linear with bad hashes or attacks
- No natural ordering of keys
- Extra memory is needed to keep the load factor low

## uses
- Dictionaries, caches and symbol tables
- Counting and deduplicating items
- Database hash indexes and hash joins
- Memoizing function results

## mistakes
- Using a mutable object as a key and changing it after insertion
- Deleting from an open addressing table by clearing the slot
- Choosing a capacity and hash that share a common factor
- Forgetting to confirm with an equality test after the hash matches

## interview
**Q:** How does a hash table find a value for a key?
**A:** It hashes the key to an integer, reduces it to a bucket index, then searches that bucket or probe sequence comparing keys with equality until it finds the entry or an empty slot.

**Q:** What is the load factor and why does it matter?
**A:** It is the number of entries divided by the number of buckets; as it grows, collisions and probe lengths increase, so tables resize at a threshold to keep operations near constant time.

**Q:** Why can deletion be tricky in open addressing?
**A:** Emptying a slot can break probe sequences of other keys that were placed past it, so deleted slots are marked with tombstones that lookups skip.

## summary
A hash table hashes keys to buckets, handles collisions by chaining or probing and resizes when the load factor grows, giving O(1) expected operations. The quality of the hash function and the discipline of immutable keys and tombstones keep it correct and fast.

## codenote
The Python sample implements linear probing. The JavaScript sample shows chaining with resizing.

## code
### python
```python
class ProbingTable:
    def __init__(self, capacity):
        self.slots = [None] * capacity

    def insert(self, key):
        index = key % len(self.slots)
        probes = 1
        while self.slots[index] is not None:
            index = (index + 1) % len(self.slots)
            probes += 1
        self.slots[index] = key
        return index, probes

    def find(self, key):
        index = key % len(self.slots)
        probes = 1
        while self.slots[index] is not None:
            if self.slots[index] == key:
                return index, probes
            index = (index + 1) % len(self.slots)
            probes += 1
        return None, probes

table = ProbingTable(7)
print([table.insert(key) for key in (10, 20, 30, 15, 22)])
print(table.slots)
print(table.find(22), table.find(99))
```
Output:
```text
[(3, 1), (6, 1), (2, 1), (1, 1), (4, 4)]
[None, 15, 30, 10, 22, None, 20]
(4, 4) (None, 5)
```
### javascript
```javascript
class ChainedTable {
  constructor() {
    this.buckets = Array.from({ length: 4 }, () => []);
    this.size = 0;
    this.capacities = [4];
  }

  put(key, value) {
    const bucket = this.buckets[key % this.buckets.length];
    const entry = bucket.find((e) => e[0] === key);
    if (entry) entry[1] = value;
    else {
      bucket.push([key, value]);
      this.size++;
    }
    if (this.size / this.buckets.length > 0.75) this.grow();
  }

  grow() {
    const old = this.buckets.flat();
    this.buckets = Array.from({ length: this.buckets.length * 2 }, () => []);
    old.forEach(([k, v]) => this.buckets[k % this.buckets.length].push([k, v]));
    this.capacities.push(this.buckets.length);
  }
}

const table = new ChainedTable();
for (let key = 1; key <= 10; key++) table.put(key, key * key);
console.log(table.capacities.join(" "), table.size);
```
Output:
```text
4 8 16 10
```

## quiz
1. What does the hash function produce for a key?
   - [ ] A sorted position
   - [x] An integer that is reduced to a bucket index
   - [ ] A copy of the value
   - [ ] A random string
   > Equal keys must always give equal hashes.
2. What does the load factor measure?
   - [ ] The size of each key
   - [x] Entries divided by the number of buckets
   - [ ] The number of deleted items
   - [ ] The hash quality
   > It controls how often collisions occur.
3. Why are tombstones used in open addressing?
   - [ ] To save memory
   - [x] To keep probe sequences of later keys intact after a deletion
   - [ ] To sort the table
   - [ ] To compress keys
   > Clearing a slot could hide keys placed beyond it.
4. Why must keys not change after insertion?
   - [ ] They would use more memory
   - [x] A changed key hashes to a different bucket and the entry is lost
   - [ ] Keys are always numbers
   - [ ] The table would shrink
   > The stored entry stays in the bucket of the old hash.

# HashMap API Patterns
kind: algorithm
time: O(1) expected for get, put, contains and remove; iterating over all n entries is O(n), and building a map from n items is O(n).
space: O(n) for the entries stored in the map.

## intro
Most programs use a hash map (the HashMap API of Java, dict in Python, Map in JavaScript) through a small set of recurring operations: look up with a default, insert if absent, update in place, group items by a key and merge maps. Knowing the idiomatic way to do each in your language avoids double lookups, missing key errors and subtle bugs, and it makes code shorter and faster.

## theory
Core operations: put (set key to value), get (read the value or a default), contains (test for a key), remove and iteration over keys, values or pairs.

Pattern 1: lookup with a default. Reading a missing key either raises an error (Python's `d[k]` raises `KeyError`) or returns an undefined marker (JavaScript's `Map.get` returns `undefined`). Use `d.get(k, default)` in Python and `map.get(k) ?? default` in JavaScript, so a missing key is an ordinary case, not a crash.

Pattern 2: insert if absent. `d.setdefault(k, value)` inserts the value only when the key is missing and returns the stored value. In JavaScript check `has` first or use `map.get(k) ?? ...` and then `set`.

Pattern 3: grouping. Collect items under a computed key. `defaultdict(list)` creates the list the first time a key is used, so `groups[key].append(item)` works without checking. The groups of words by their length for `a, to, it, cat, dog, is` are length 1: a; length 2: to, it, is; length 3: cat, dog.

Pattern 4: counting and accumulating. `counts[k] = counts.get(k, 0) + 1`, or `collections.Counter`, or `defaultdict(int)`. The same shape accumulates sums, maxima and last seen positions.

Pattern 5: merging and updating. Python 3.9 offers `a | b` (values from b win) and `a.update(b)`; JavaScript offers `new Map([...a, ...b])`. Define which side wins on conflicts, or combine values explicitly.

Pattern 6: inverting a mapping. Build a new map from values to keys. This is lossy if values repeat, so decide whether to keep lists of keys.

Pattern 7: caching or memoization. Check the map before computing, store afterwards. `functools.lru_cache` and `Map` based memo functions are common.

Pattern 8: iteration while modifying. Changing the key set of a map while iterating over it raises errors in Python (`RuntimeError: dictionary changed size during iteration`) and may skip entries elsewhere. Iterate over a copy (`list(d)`) or collect keys to delete first.

Key requirements: keys must be hashable and stable. In Python lists and dicts are not hashable, but tuples of hashables are, so use a tuple for composite keys such as coordinates `(row, col)`. In JavaScript object keys are converted to strings, so `{1: 'a'}` and `{'1': 'a'}` collide; use `Map` when keys can be numbers or objects (Map compares keys with the SameValueZero rule, not by converting to strings).

Ordering: Python dictionaries and JavaScript maps iterate in insertion order, which can be relied on in modern versions but is not sorted order. Sort explicitly when output order matters.

Complexity notes: operations are O(1) expected, but computing a key (for example sorting a string for a grouping key) may cost more than the lookup, so count that in the total cost.

## explain
1. Decide what the key and the value represent for the problem.
2. Use get with a default or defaultdict to avoid missing key errors.
3. Update in place rather than reading, modifying and writing in separate lookups where possible.
4. Choose how to handle conflicts when merging or inverting.
5. Use immutable composite keys such as tuples for pairs of values.
6. Sort keys explicitly when a specific output order is needed.

## example
The Python program groups the words `a`, `to`, `it`, `cat`, `dog`, `is` by length, counts letters with get and a default, and merges two dictionaries where the second wins on a conflict. The JavaScript program uses a Map to count words and invert a mapping, printing the counts in insertion order.

## real
Web frameworks represent request headers and query parameters as maps, configuration loaders merge layered settings maps, and analytics code groups events by user or day with the grouping and counting patterns.

## pros
- A few idioms cover most map tasks
- Defaults avoid crashes on missing keys
- Grouping and counting are short and fast

## cons
- Missing key behaviour differs between languages
- Mutating while iterating causes errors
- Object keys in JavaScript are converted to strings

## uses
- Grouping records by a computed key
- Counting occurrences
- Merging layered configuration
- Inverting lookups and memoizing results

## mistakes
- Reading a missing key without a default and crashing
- Using a list as a Python dictionary key
- Adding or deleting dictionary keys inside a loop over that dictionary
- Relying on object key order or number keys in plain JavaScript objects

## interview
**Q:** How do you count occurrences of items using a hash map?
**A:** Loop over the items and increase the count for each with a default of zero, such as counts[x] = counts.get(x, 0) + 1, or use Counter; the cost is O(n).

**Q:** Why can a plain JavaScript object be a poor map?
**A:** Keys are converted to strings, so 1 and the string 1 collide, and inherited properties such as toString can interfere; Map accepts any key and has size and ordering guarantees.

**Q:** How can you group items by a key in Python without checking for the key first?
**A:** Use defaultdict with list as the factory, so appending to a missing key creates its list automatically.

## summary
Hash map work follows a few patterns: lookup with a default, insert if absent, group, count, merge and invert. Use the language idioms, immutable keys and explicit ordering to keep the code short and correct.

## codenote
The Python sample groups, counts and merges. The JavaScript sample counts and inverts with a Map.

## code
### python
```python
from collections import defaultdict

words = ["a", "to", "it", "cat", "dog", "is"]
by_length = defaultdict(list)
for word in words:
    by_length[len(word)].append(word)
print(dict(by_length))

letters = {}
for ch in "banana":
    letters[ch] = letters.get(ch, 0) + 1
print(letters)

defaults = {"theme": "light", "size": 12}
overrides = {"size": 14, "lang": "en"}
print({**defaults, **overrides})
```
Output:
```text
{1: ['a'], 2: ['to', 'it', 'is'], 3: ['cat', 'dog']}
{'b': 1, 'a': 3, 'n': 2}
{'theme': 'light', 'size': 14, 'lang': 'en'}
```
### javascript
```javascript
const counts = new Map();
for (const word of "the cat and the hat and the bat".split(" ")) {
  counts.set(word, (counts.get(word) ?? 0) + 1);
}
console.log([...counts].map(([word, n]) => word + ":" + n).join(" "));

const inverted = new Map([...counts].map(([word, n]) => [n, word]));
console.log([...inverted].map(([n, word]) => n + "=" + word).join(" "));
```
Output:
```text
the:3 cat:1 and:2 hat:1 bat:1
3=the 1=bat 2=and
```

## quiz
1. What does d.get(key, default) do for a missing key?
   - [ ] Raises an error
   - [x] Returns the default without modifying the dictionary
   - [ ] Inserts the key
   - [ ] Deletes the dictionary
   > It makes a missing key an ordinary case.
2. Which Python container creates a list automatically the first time a key is used?
   - [ ] dict
   - [x] defaultdict(list)
   - [ ] set
   - [ ] tuple
   > The factory function supplies the initial value.
3. Why use a Map rather than a plain object in JavaScript for numeric keys?
   - [ ] Objects are faster always
   - [x] Object keys become strings, while Map keeps the key types
   - [ ] Maps cannot store numbers
   - [ ] Objects cannot be iterated
   > The numbers 1 and the string 1 would otherwise be the same key.
4. What happens when a dictionary is modified during iteration in Python?
   - [ ] Nothing
   - [x] A RuntimeError can be raised
   - [ ] The dictionary is sorted
   - [ ] Keys are duplicated
   > Iterate over a copy of the keys instead.

# HashSet API Patterns
kind: algorithm
time: O(1) expected for add, contains and remove; building a set from n items is O(n); set operations such as union and intersection cost O(n + m) for sets of sizes n and m.
space: O(n) for the distinct items stored.

## intro
A hash set (the HashSet API in Java, set in Python) stores unique items and answers membership questions in constant expected time. It is a hash map without values, and it is the right tool whenever the question is whether something has been seen, whether two collections overlap or how to remove duplicates.

## theory
Operations: add, remove (or discard), contains, size, iteration and the mathematical set operations:

- Union: items in either set (`a | b`)
- Intersection: items in both (`a & b`)
- Difference: items in a but not in b (`a - b`)
- Symmetric difference: items in exactly one of the sets (`a ^ b`)
- Subset and superset tests (`a <= b`)

For `a = {1, 2, 3, 4}` and `b = {3, 4, 5}` the union is {1, 2, 3, 4, 5}, the intersection {3, 4}, the difference a minus b {1, 2} and the symmetric difference {1, 2, 5}.

Pattern 1: membership instead of scanning. Replacing `if x in list` (O(n)) with `if x in set` (O(1) expected) turns many quadratic loops into linear ones. Convert the list once, then query repeatedly.

Pattern 2: duplicate detection. Add items while scanning and report when an item is already present. For the array 3, 1, 4, 1, 5 the first duplicate is 1. This costs O(n) time and O(n) space, compared with O(n log n) time for sorting.

Pattern 3: deduplication. `set(items)` removes duplicates but loses order. To keep the first occurrence order, track a seen set while building a new list, or use `dict.fromkeys(items)` in Python, which preserves insertion order.

Pattern 4: intersection and difference of collections. The common elements of `[1, 2, 2, 1]` and `[2, 2]` as a set is {2}; if multiplicities matter use counters (Counter intersection).

Pattern 5: visited sets in searches. Graph and grid searches record visited nodes in a set to avoid revisiting, with coordinates stored as tuples.

Pattern 6: two-sum style complements. For each number, test whether `target - number` has been seen.

Pattern 7: longest consecutive sequence. Put all numbers in a set, and for each number that starts a run (the number minus one is not in the set) count upward while the next number is present. The total work is linear, since every number is visited at most twice. For 100, 4, 200, 1, 3, 2 the longest run is 1, 2, 3, 4 with length 4.

Requirements: items must be hashable (immutable). In Python use tuples or frozensets for composite elements. In JavaScript, `Set` compares objects by reference, so two equal-looking arrays are different elements; convert to a string key such as `JSON.stringify` or `join` when you need value equality.

Ordering: Python's set has no guaranteed order (use `sorted(s)` for stable output), while JavaScript's Set iterates in insertion order.

Memory: sets carry overhead per entry; for small collections a list scan can be as fast, and for dense integer ranges a boolean array or bitset is faster and smaller.

## explain
1. Decide whether the question is about membership, uniqueness or overlap.
2. Build a set from the collection that is queried repeatedly.
3. Use contains checks instead of list scans.
4. Use union, intersection and difference for collection comparisons.
5. Track a visited set during traversals.
6. Sort the set for deterministic output when printing or testing.

## example
The Python program prints the union, intersection, difference and symmetric difference of two sets in sorted order, removes duplicates while keeping order and finds the first repeated number in `3, 1, 4, 1, 5`. The JavaScript program computes the intersection of two arrays with a Set and finds the length of the longest consecutive run in `100, 4, 200, 1, 3, 2`.

## real
Spam filters check addresses against blocklists, graph algorithms keep visited node sets, and data pipelines deduplicate records before loading them.

## pros
- Constant expected time membership tests
- Built in set operations express overlap questions clearly
- Removes duplicates in linear time

## cons
- Items must be hashable and unordered in Python
- Object elements compare by reference in JavaScript
- Extra memory compared with a sorted array

## uses
- Detecting duplicates
- Checking membership in large collections
- Comparing the overlap of two collections
- Tracking visited states in searches

## mistakes
- Using a list for repeated membership tests in a loop
- Putting unhashable items such as lists in a set
- Expecting a Python set to keep insertion order
- Comparing arrays by reference in a JavaScript Set

## interview
**Q:** How do you find the first duplicate in an array in linear time?
**A:** Scan the array while adding items to a set; the first item that is already in the set is the first duplicate, giving O(n) time and O(n) space.

**Q:** How do you find the longest consecutive sequence in an unsorted array in O(n)?
**A:** Put all numbers in a set and start counting only from numbers whose predecessor is absent, extending while the next number is present; each number is visited at most twice.

**Q:** What is the difference between a set and a list for membership tests?
**A:** A set tests membership in O(1) expected time through hashing, while a list scans in O(n).

## summary
Sets answer membership, uniqueness and overlap questions in constant expected time per item, with union, intersection and difference operations built in. Use hashable elements and sort for deterministic output.

## codenote
The Python sample covers set algebra and duplicates. The JavaScript sample finds an intersection and a consecutive run.

## code
### python
```python
a, b = {1, 2, 3, 4}, {3, 4, 5}
print(sorted(a | b), sorted(a & b), sorted(a - b), sorted(a ^ b))

def unique_in_order(items):
    seen, result = set(), []
    for item in items:
        if item not in seen:
            seen.add(item)
            result.append(item)
    return result

def first_duplicate(items):
    seen = set()
    for item in items:
        if item in seen:
            return item
        seen.add(item)
    return None

print(unique_in_order([3, 1, 3, 2, 1]), first_duplicate([3, 1, 4, 1, 5]), first_duplicate([1, 2]))
```
Output:
```text
[1, 2, 3, 4, 5] [3, 4] [1, 2] [1, 2, 5]
[3, 1, 2] 1 None
```
### javascript
```javascript
function intersection(a, b) {
  const lookup = new Set(a);
  return [...new Set(b.filter((x) => lookup.has(x)))];
}

function longestRun(numbers) {
  const present = new Set(numbers);
  let best = 0;
  for (const n of present) {
    if (present.has(n - 1)) continue;
    let length = 1;
    while (present.has(n + length)) length++;
    best = Math.max(best, length);
  }
  return best;
}

console.log(intersection([1, 2, 2, 1], [2, 2]).join(" "), longestRun([100, 4, 200, 1, 3, 2]));
```
Output:
```text
2 4
```

## quiz
1. What is the expected cost of a membership test in a hash set?
   - [ ] O(n)
   - [x] O(1)
   - [ ] O(log n)
   - [ ] O(n squared)
   > The hash leads directly to the bucket.
2. What does the symmetric difference of two sets contain?
   - [ ] Items in both sets
   - [x] Items in exactly one of the sets
   - [ ] All items of both
   - [ ] Items in neither
   > It removes the common elements from the union.
3. Why does the longest consecutive sequence algorithm start only at numbers with no predecessor?
   - [ ] To sort the numbers
   - [x] So each run is counted once and the total work stays linear
   - [ ] To remove duplicates
   - [ ] Because sets are ordered
   > Counting from every number would repeat work inside runs.
4. Why can two equal-looking arrays both appear in a JavaScript Set?
   - [ ] Sets allow duplicates
   - [x] Arrays are compared by reference, not by contents
   - [ ] Arrays cannot be hashed
   - [ ] Sets sort their items
   > Convert to a string key for value equality.

# Frequency Counting
kind: algorithm
time: O(n) to count n items with a hash map, plus O(d log k) to find the k most frequent among d distinct items with a heap, or O(d log d) with a full sort.
space: O(d) for d distinct items.

## intro
Counting how often each item occurs is probably the most common use of a hash map. It answers questions about duplicates, the most popular items, anagrams and the first unique element, and it often turns a nested loop into a single pass. The count table also acts as a compact summary that can be compared or updated as a window slides.

## theory
Basic counting loop: for each item, increase `counts[item]`. In Python `collections.Counter(items)` does this and offers `most_common(k)`; in JavaScript use a Map or an object with `(counts[x] ?? 0) + 1`. Cost is O(n) time and O(d) space for d distinct items.

Common questions answered by counts:

- Is there a duplicate? Any count above one
- First unique character: build counts, then scan the string again and return the first position with a count of one. For `leetcode` the answer is index 0 (the letter l) and for `loveleetcode` it is index 2 (the letter v); a string where every letter repeats gives −1.
- Are two strings anagrams? Equal count tables (or equal sorted strings, which costs O(n log n)). `listen` and `silent` are anagrams; `rat` and `car` are not. For lowercase letters an array of 26 counters is faster than a hash map, and one pass can increment for one string and decrement for the other.
- Majority element: the item whose count exceeds half the length; Boyer-Moore voting finds it in O(1) space
- Top k frequent elements: count, then take the k largest counts. Options: sort the distinct items by count (O(d log d)), a min-heap of size k (O(d log k)) or bucket sort by frequency (O(n)), where bucket i holds the items that occurred i times. For `1, 1, 1, 2, 2, 3` with k = 2 the answer is 1 and 2.
- Ransom note: the magazine's letter counts must cover the note's counts
- Find all anagrams or permutations of a pattern in a text: keep the counts of a sliding window and compare with the pattern's counts as the window moves, updating two counts per step
- Sorting by frequency, and the minimum number of deletions to make all letter frequencies unique

Counting with a fixed alphabet: for lowercase letters use an array of size 26 indexed by `ord(ch) − ord('a')`; for bytes an array of 256. This avoids hashing and is faster.

Counting versus sorting: sorting needs O(n log n) and moves data; counting is linear and needs memory proportional to the number of distinct items. When items come from a small range, counting sort uses the same idea.

Pitfalls:

- Case and whitespace: normalise the input first (lowercase, strip punctuation) when the problem calls for it
- Ties in top-k results: decide an order (by first occurrence or value) so the output is deterministic
- Counter arithmetic: subtracting counters in Python drops non-positive counts, which is useful for difference checks but can hide negatives
- Large streams: exact counts need memory proportional to distinct items; approximate structures such as count-min sketches trade accuracy for fixed memory
- Overflow of counts is rarely a problem in Python but can happen in fixed-width integer languages

Testing: empty input, all items equal, all distinct, ties for the most frequent item and Unicode characters.

## explain
1. Decide the unit to count: characters, words, numbers or composite keys.
2. Normalise the input if case or punctuation should not matter.
3. Build the count table in one pass.
4. Answer the question by scanning the table, or by a second pass over the input to respect the original order.
5. For top k results use a heap or bucket sort by frequency.
6. Test empty input, ties and single-item inputs.

## example
The Python program finds the first unique character index for `leetcode` (0), `loveleetcode` (2) and `aabb` (−1), checks that `listen` and `silent` are anagrams while `rat` and `car` are not, and prints the top two most common numbers of a list. The JavaScript program returns the two most frequent numbers of `1, 1, 1, 2, 2, 3` with bucket sort by frequency.

## real
Search engines count term frequencies, log analysis tools find the most frequent errors, and spell checkers rank candidate words by how often they occur in a corpus.

## pros
- Single pass linear time
- The count table is a reusable summary
- Replaces nested loops for duplicate and anagram questions

## cons
- The count table can become as large as the set of distinct items
- Ties and normalisation need decisions
- Exact counting of huge streams can be too costly

## uses
- Finding duplicates and the most common items
- Anagram and permutation checks
- First unique element questions
- Ranking terms and events by frequency

## mistakes
- Forgetting to normalise case before counting
- Sorting the whole table when only the top few items are needed
- Counting in one pass and answering in table order when the original order matters
- Using a hash map when a fixed size array would be faster

## interview
**Q:** Which two passes find the first non-repeating character of a string?
**A:** Count every character in one pass, then scan the string again and return the index of the first character whose count is one, in O(n) time with O(1) space for a fixed alphabet.

**Q:** How can you find the k most frequent elements efficiently?
**A:** Count the elements, then use a min-heap of size k for O(d log k) time, or bucket the elements by their frequency for O(n) time.

**Q:** How do you check whether two strings are anagrams?
**A:** Compare their character count tables, or increment counts for one string and decrement for the other and verify all counts return to zero.

## summary
Frequency counting builds a table of occurrences in O(n) and answers duplicate, anagram, first unique and top k questions from it. Use fixed arrays for small alphabets, heaps or buckets for top k and a second pass when the original order matters.

## codenote
The Python sample answers first unique, anagram and top counts. The JavaScript sample uses bucket sort for the top k.

## code
### python
```python
from collections import Counter

def first_unique(text):
    counts = Counter(text)
    for index, ch in enumerate(text):
        if counts[ch] == 1:
            return index
    return -1

print(first_unique("leetcode"), first_unique("loveleetcode"), first_unique("aabb"))
print(Counter("listen") == Counter("silent"), Counter("rat") == Counter("car"))
print(Counter([4, 4, 4, 9, 9, 7, 1]).most_common(2))
```
Output:
```text
0 2 -1
True False
[(4, 3), (9, 2)]
```
### javascript
```javascript
function topK(numbers, k) {
  const counts = new Map();
  for (const n of numbers) counts.set(n, (counts.get(n) ?? 0) + 1);
  const buckets = Array.from({ length: numbers.length + 1 }, () => []);
  for (const [n, count] of counts) buckets[count].push(n);
  const result = [];
  for (let count = buckets.length - 1; count > 0 && result.length < k; count--) {
    result.push(...buckets[count]);
  }
  return result.slice(0, k);
}

console.log(topK([1, 1, 1, 2, 2, 3], 2).join(" "));
```
Output:
```text
1 2
```

## quiz
1. What is the cost of counting n items with a hash map?
   - [ ] O(n squared)
   - [x] O(n) expected
   - [ ] O(log n)
   - [ ] O(1)
   > Each item takes a constant expected update.
2. How is the first unique character found?
   - [ ] By sorting the string
   - [x] By counting, then scanning the string for the first count of one
   - [ ] By reversing the string
   - [ ] By hashing the whole string
   > A second pass preserves the original order.
3. What does bucket sort by frequency use as the bucket index?
   - [ ] The item value
   - [x] The number of occurrences
   - [ ] The item length
   - [ ] The hash
   > Items with the same count share a bucket.
4. When is a fixed array better than a hash map for counting?
   - [ ] For unbounded keys
   - [x] For a small known alphabet such as 26 lowercase letters
   - [ ] For floating point keys
   - [ ] Never
   > Direct indexing avoids hashing.

# Group Anagrams
kind: algorithm
time: O(n · k log k) for n words of length at most k when each word is sorted to form its key, or O(n · k) when a letter count signature is used.
space: O(n · k) for the groups and keys.
practice: group-anagrams-count

## intro
Words that contain exactly the same letters, such as eat, tea and ate, are anagrams. Grouping a list of words into sets of anagrams is a clean exercise in choosing a canonical key: if every word in a group maps to the same key and different groups map to different keys, a hash map does the grouping in one pass.

## theory
Canonical key idea: find a function `key(word)` that returns the same value for any two anagrams and different values for non-anagrams. Then `groups[key(word)].append(word)` for every word.

Two standard keys:

- Sorted letters: `''.join(sorted(word))`, so eat, tea and ate all give `aet`. Cost O(k log k) per word of length k.
- Letter count signature: for lowercase letters, a tuple of 26 counts (or a string such as `a1e1t1`). Cost O(k) per word and O(26) for building the key; the tuple is hashable and can be used directly in Python.

Algorithm:

- Create a map from key to a list of words
- For each word, compute its key and append the word to the list for that key
- Return the lists (or just their number)

For the input `eat`, `tea`, `tan`, `ate`, `nat`, `bat` there are three groups: eat, tea and ate under the key `aet`; tan and nat under `ant`; and bat under `abt`. The number of groups is 3.

Complexity: with sorting keys, O(n · k log k) time; with count keys, O(n · k) time. The space is O(n · k) because the words themselves are stored. For long words and large n the count key is better; for short words (k below about 20) sorting is simple and fast.

Variations:

- Valid anagram of two strings: compare keys directly
- Find all anagrams of a pattern in a text: sliding window of counts (see the frequency lesson)
- Group shifted strings: the key is the sequence of differences between consecutive letters modulo 26, so `abc` and `bcd` share a key
- Group by a different equivalence, such as words that are the same after sorting digits, numbers with the same digit multiset, or strings that are isomorphic
- Anagram checks with Unicode: sort by code points, or normalise and use a map instead of a fixed 26 array
- Case insensitivity: lowercase the word before computing the key, and decide whether spaces and punctuation are part of the key

Output order: dictionary order is insertion order in modern Python and JavaScript, so groups appear in the order of their first word, and words keep input order inside each group. Tests often compare after sorting the groups, because the expected order is not part of the problem statement.

Pitfalls: using a list as a key (unhashable), computing a key that collides for different multisets (such as summing character codes, where `ad` and `bc` have the same sum), and forgetting that words of different lengths cannot be anagrams, which count keys handle automatically.

Related idea: the canonical form technique applies to many grouping problems, such as normalising paths, sorting the elements of a pair so that (a, b) and (b, a) match, and fingerprinting documents.

## explain
1. Choose a canonical key function: sorted letters or a count signature.
2. Create an empty map from keys to lists.
3. For each word compute its key and append the word to that group.
4. Return the values of the map, or their count.
5. Normalise case if needed and decide about spaces.
6. Test empty input, a single word, identical words and words of different lengths.

## example
The Python program groups `eat`, `tea`, `tan`, `ate`, `nat`, `bat` with the sorted-letter key into three groups and also shows that the count-signature key gives the same grouping. The JavaScript program uses a count signature string and prints the number of groups and their sizes for the same words.

## real
Search and text tools find rearranged words, puzzle and word game solvers look up anagrams of a rack of letters, and deduplication tools group records by a normalised fingerprint.

## pros
- One pass with a hash map
- Works for any equivalence with a canonical key
- Count keys avoid the sorting cost

## cons
- Sorted keys cost extra time on long words
- Keys use additional memory
- Incorrect keys silently merge or split groups

## uses
- Grouping words that are anagrams
- Grouping strings shifted by a constant
- Deduplicating records by a normalised form
- Building lookups for word games

## mistakes
- Using the sum of character codes as the key and getting collisions
- Using a list as a dictionary key
- Forgetting to lowercase the words when case should be ignored
- Assuming the groups come out in a particular order

## interview
**Q:** How do you group anagrams efficiently?
**A:** Compute a canonical key for each word, such as its sorted letters or a count signature, and collect the words in a hash map from key to list, in O(n · k log k) or O(n · k) time.

**Q:** Why is summing the character codes a bad key?
**A:** Different letter multisets can have the same sum, for example ad and bc, so non-anagrams would be grouped together.

**Q:** When is the count signature better than the sorted key?
**A:** For long words, since building counts is linear in the word length while sorting costs k log k, and the counts for a fixed alphabet make a compact tuple key.

## summary
Grouping anagrams maps each word to a canonical key, its sorted letters or letter counts, and collects words with equal keys in a hash map. The same canonical form idea solves many equivalence grouping problems.

## codenote
The Python sample uses both key types. The JavaScript sample uses a count signature.

## code
### python
```python
from collections import defaultdict

words = ["eat", "tea", "tan", "ate", "nat", "bat"]

def group_sorted(items):
    groups = defaultdict(list)
    for word in items:
        groups["".join(sorted(word))].append(word)
    return list(groups.values())

def group_counts(items):
    groups = defaultdict(list)
    for word in items:
        counts = [0] * 26
        for ch in word:
            counts[ord(ch) - ord("a")] += 1
        groups[tuple(counts)].append(word)
    return list(groups.values())

print(group_sorted(words))
print(group_sorted(words) == group_counts(words), len(group_sorted(words)))
```
Output:
```text
[['eat', 'tea', 'ate'], ['tan', 'nat'], ['bat']]
True 3
```
### javascript
```javascript
function groupAnagrams(words) {
  const groups = new Map();
  for (const word of words) {
    const counts = Array(26).fill(0);
    for (const ch of word) counts[ch.charCodeAt(0) - 97]++;
    const key = counts.join(",");
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(word);
  }
  return [...groups.values()];
}

const result = groupAnagrams(["eat", "tea", "tan", "ate", "nat", "bat"]);
console.log(result.length, result.map((group) => group.length).join(" "));
```
Output:
```text
3 3 2 1
```

## quiz
1. What must a canonical key satisfy for anagram grouping?
   - [ ] It must be the longest word
   - [x] Anagrams give equal keys and non-anagrams give different keys
   - [ ] It must be a number
   - [ ] It must be sorted alphabetically across words
   > The key identifies the multiset of letters.
2. What key do eat, tea and ate share when letters are sorted?
   - [ ] eat
   - [x] aet
   - [ ] tea
   - [ ] ate
   > Sorting the letters gives the same string for all three.
3. Why is a sum of character codes an unreliable key?
   - [ ] It is too slow
   - [x] Different letter sets can produce the same sum
   - [ ] It cannot be hashed
   - [ ] It depends on the language
   > ad and bc both sum to the same value.
4. Which key avoids the cost of sorting?
   - [ ] The word itself
   - [x] A tuple of letter counts
   - [ ] The word length
   - [ ] The first letter
   > Building counts takes linear time.

# Subarray Sum Hash Map
kind: algorithm
time: O(n) for an array of n numbers, since each element updates a running prefix sum and does one expected O(1) hash lookup.
space: O(n) for the map of prefix sums seen so far.
practice: two-sum-indices

## intro
How many contiguous subarrays add up to a target k, even when the numbers can be negative? Sliding windows fail with negatives, but a hash map of prefix sums works: a subarray from i to j sums to k exactly when the prefix sum at j minus the prefix sum before i equals k. Counting such pairs becomes a lookup per element.

## theory
Prefix sums: let `prefix[j]` be the sum of the first j numbers. The sum of the subarray from index i to j − 1 is `prefix[j] − prefix[i]`. So a subarray ending at position j has sum k exactly when some earlier prefix equals `prefix[j] − k`.

Algorithm for counting subarrays with sum k:

- Keep `running` (the prefix sum so far) and a map `seen` from prefix sum to the number of times it has occurred; start with `seen[0] = 1` for the empty prefix
- For each number, add it to `running`, then add `seen[running − k]` (zero if missing) to the answer
- Increase `seen[running]` by one

Example: the array 1, 1, 1 with k = 2 has 2 subarrays (positions 0 to 1 and 1 to 2). The array 1, 2, 3 with k = 3 has 2 subarrays: the single element 3 and the pair 1, 2. With negatives, the array 3, −3, 3 and k = 3 has 3 subarrays: 3 at the start, 3 at the end and the whole array 3, −3, 3.

The initial entry `seen[0] = 1` accounts for subarrays that start at index 0; forgetting it misses them.

Complexity: one pass, O(n) expected time, O(n) space. The brute force with nested loops is O(n squared), and prefix sums with a double loop remain O(n squared).

Variations using the same idea:

- Longest subarray with sum k: store the earliest index at which each prefix sum occurred, and for each position compute the length from the earliest matching prefix. For 1, −1, 5, −2, 3 with k = 3 the longest has length 4 (the elements 1, −1, 5, −2).
- Subarray sum divisible by k: store prefix sums modulo k, since two equal remainders mean the sum between them is a multiple of k (for negative numbers normalise the remainder to a non-negative value)
- Continuous subarray sum of at least two elements that is a multiple of k: store the earliest index for each remainder and require a distance of two or more
- Binary arrays with equal numbers of zeros and ones: map zeros to −1 and look for a zero sum
- Count of subarrays with sum in a range: needs ordered structures or two-pass counting
- 2D version: fix top and bottom rows and apply the 1D method on column sums, giving O(R squared · C)
- Two-sum is the same idea with pairs instead of prefix sums: look up the complement of each number in a map of seen values

When not to use it: if all numbers are non-negative, a sliding window with two pointers uses O(1) space; with negatives it is invalid, and the hash map method is the standard answer.

Overflow and large values: prefix sums can exceed 32-bit integers for large inputs, so use 64-bit integers where the language requires it.

Testing: the empty array, k equal to zero (the map counts repeated prefix sums, so zero-sum subarrays are counted), all zeros (many subarrays), and single elements equal to k.

## explain
1. Initialise the running sum to zero and the map with the prefix sum zero seen once.
2. For each number, add it to the running sum.
3. Add the count of earlier prefix sums equal to running minus k to the answer.
4. Record the current running sum in the map.
5. For the longest subarray, store the first index of each prefix sum and compare lengths.
6. Test zeros, negatives and the case where the whole array sums to k.

## example
The Python function counts 2 subarrays with sum 2 in `1, 1, 1`, 2 with sum 3 in `1, 2, 3` and 3 with sum 3 in `3, -3, 3`. The JavaScript function finds the longest subarray with sum 3 in `1, -1, 5, -2, 3`, which has length 4, and in `-2, -1, 2, 1` with sum 1, which has length 2.

## real
Financial tools find periods whose net change hits a target, fraud detectors look for runs of transactions summing to a threshold, and analytics pipelines count windows that match exact totals.

## pros
- Handles negative numbers where sliding windows fail
- Linear time with a single pass
- Extends to divisibility and longest subarray variants

## cons
- Needs O(n) extra space
- Forgetting the initial zero entry gives wrong counts
- Modulo variants need careful handling of negative remainders

## uses
- Counting the contiguous ranges that add up to a chosen total
- Locating the longest stretch of an array that adds up to a target
- Divisibility and remainder based subarray questions
- Pair sum lookups with complements

## mistakes
- Not seeding the map with the empty prefix sum zero
- Updating the map before looking up the complement when k is zero
- Applying a two pointer window to input that contains negative numbers
- Taking the remainder of a negative sum without normalising it

## interview
**Q:** How do you count subarrays whose sum equals k in O(n)?
**A:** Maintain the running prefix sum and a map of how many times each prefix sum has occurred; for every element add the count of the prefix sum equal to running minus k, then record the current prefix sum.

**Q:** Why does the map start with the prefix sum zero seen once?
**A:** It represents the empty prefix, so subarrays that start at the first element, whose sum equals the running sum itself, are counted.

**Q:** Why does the two-pointer method fail for this problem?
**A:** With negative numbers, extending a window can decrease its sum and shrinking it can increase the sum, so the monotonic movement of pointers is no longer valid.

## summary
A map of prefix sums turns subarray sum questions into lookups: a subarray sums to k when an earlier prefix equals the current prefix minus k. It works with negatives, runs in O(n) and extends to longest, modulo and range variants.

## codenote
The Python sample counts subarrays. The JavaScript sample finds the longest one.

## code
### python
```python
def count_subarrays(numbers, target):
    seen = {0: 1}
    running = count = 0
    for number in numbers:
        running += number
        count += seen.get(running - target, 0)
        seen[running] = seen.get(running, 0) + 1
    return count

print(count_subarrays([1, 1, 1], 2), count_subarrays([1, 2, 3], 3), count_subarrays([3, -3, 3], 3))
```
Output:
```text
2 2 3
```
### javascript
```javascript
function longestWithSum(numbers, target) {
  const first = new Map([[0, -1]]);
  let running = 0;
  let best = 0;
  numbers.forEach((number, i) => {
    running += number;
    if (first.has(running - target)) best = Math.max(best, i - first.get(running - target));
    if (!first.has(running)) first.set(running, i);
  });
  return best;
}

console.log(longestWithSum([1, -1, 5, -2, 3], 3), longestWithSum([-2, -1, 2, 1], 1));
```
Output:
```text
4 2
```

## quiz
1. When does a subarray ending at position j sum to k?
   - [ ] When the prefix at j equals k
   - [x] When some earlier prefix equals the prefix at j minus k
   - [ ] When the prefix at j is zero
   - [ ] When the array is sorted
   > The difference of two prefix sums is the subarray sum.
2. Why does the map start with {0: 1}?
   - [ ] To avoid empty maps
   - [x] To count subarrays that begin at the first element
   - [ ] To store the target
   - [ ] To sort the sums
   > The empty prefix has sum zero.
3. Why does a sliding window fail with negative numbers?
   - [ ] It uses too much memory
   - [x] Extending or shrinking the window no longer changes the sum monotonically
   - [ ] Negative numbers are not allowed in arrays
   - [ ] Hash maps cannot hold negatives
   > The two-pointer logic relies on a monotone sum.
4. What does the longest subarray version store in the map?
   - [ ] The latest index of each prefix sum
   - [x] The earliest index of each prefix sum
   - [ ] The count of each prefix sum
   - [ ] The sum of all values
   > An earlier start gives a longer subarray.
