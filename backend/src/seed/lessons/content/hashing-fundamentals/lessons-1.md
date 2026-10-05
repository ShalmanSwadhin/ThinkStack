# Hash Function Properties
kind: concept
time: Not an algorithmic topic — a hash function is a building block whose own cost is proportional to the length of its input; the lesson explains what makes one good, not how fast an algorithm grows.
space: Not an algorithmic topic — a hash function produces a fixed-size value, such as 32 or 256 bits, whatever the input size.

## intro
A hash function turns data of any size into a fixed-size number. Hash tables use that number to decide where to store an item, and security tools use it as a fingerprint. The same word covers very different quality requirements, and understanding the properties that make a hash function good is the key to understanding everything built on top of it.

## theory
Basic definition: a function `h` that maps an input (a string, a number, a record) to an integer in a fixed range, such as 0 to 2³² − 1. Different inputs can map to the same value, because there are more possible inputs than outputs; that is a collision, and every hash function has them.

Properties that matter for hash tables:

- Deterministic: the same input must always give the same hash within a run, otherwise lookups cannot find stored items. Some languages deliberately randomise string hashes between runs, as Python does, which is fine as long as it is stable inside one process.
- Uniform: outputs should spread evenly over the range, so that each bucket receives about the same number of keys. Clustering causes long chains and slow lookups.
- Fast: computing the hash must be cheap compared with the operation it enables, and proportional to the key length.
- Consistent with equality: if two keys are equal, their hashes must be equal. Breaking this rule (for example, defining equality but not updating the hash) makes items unfindable.
- Sensitive to all of the key: ignoring parts of the input, like summing character codes, makes anagrams collide, as the example below shows: "listen", "silent", "enlist" and "tinsel" all hash to 7 with a character-sum hash.
- Avalanche effect: flipping one input bit should flip about half of the output bits. Strong mixing makes similar keys land far apart.

Properties added for cryptographic hash functions (SHA-256, SHA-3, BLAKE3):

- Pre-image resistance: given a hash, it is infeasible to find any input that produces it
- Second pre-image resistance: given an input, it is infeasible to find a different input with the same hash
- Collision resistance: it is infeasible to find any two inputs with the same hash
- These are much stronger and slower than what hash tables need; using a cryptographic hash for a table wastes time, and using a table hash for security is dangerous

Examples of non-cryptographic hashes: djb2 (`h = h * 33 + c`), FNV-1a (xor then multiply by a prime), MurmurHash, xxHash, SipHash (keyed, used by Python and Rust to resist flooding attacks).

Choosing a table index from a hash: `hash % size` for any size, or `hash & (size - 1)` when the size is a power of two, which is faster but uses only the low bits, so the hash must mix them well.

Hashing compound keys: combine component hashes with multiplication and addition by primes (as in `31 * h + next`), or use a library facility such as tuples in Python; avoid XOR alone, since it makes `(a, b)` and `(b, a)` equal.

## explain
1. State what the hash will be used for: a hash table, a checksum, a fingerprint or security.
2. Pick a function with the quality that purpose needs.
3. Make sure equal keys give equal hashes, and hash every field that takes part in equality.
4. Test the spread by hashing a realistic sample into buckets and looking at the counts.
5. Check the avalanche behavior on keys that differ by one character.
6. Use a standard library function unless you have a reason to write your own.

## example
The Python djb2 function gives 193485963 for "abc" and 193485964 for "abd": nearby inputs produce nearby hashes, which is acceptable for tables but shows weak mixing. Hashing twelve fruit names into eight buckets with djb2 yields the counts `[2, 1, 1, 2, 1, 1, 2, 2]`, a good spread. A SHA-256 comparison of "hello" and "hellp" differs in 131 of 256 bits, close to half, which is the avalanche effect. The sum of character codes sends the four anagrams to the same bucket. The JavaScript sample uses 32-bit FNV-1a, which gives very different values for "hello" and "hellp", and counts a bucket distribution.

## real
Every dictionary, set and cache in standard libraries depends on well-behaved hash functions, and checksums such as CRC and cryptographic digests protect downloads and signatures.

## pros
- Fixed-size fingerprints of arbitrary data
- Cheap computation enables constant-time table lookups
- Cryptographic variants give strong integrity guarantees

## cons
- Collisions are unavoidable
- Poor hash functions create clustering and slow tables
- Non-cryptographic hashes are unsafe against deliberate attacks

## uses
- Choosing buckets in hash tables and sets
- Fingerprinting files and messages
- Detecting duplicates quickly
- Distributing data across servers

## mistakes
- Using the sum of character codes, so anagrams collide
- Defining equality without a matching hash
- Using a table hash where cryptographic strength is needed
- Hashing only part of a key

## interview
**Q:** What properties make a good hash function for a hash table?
**A:** It must be deterministic, consistent with key equality, fast to compute and spread keys uniformly across the range, ideally with an avalanche effect so that similar keys land in different buckets.

**Q:** What must hold between equality and hashing?
**A:** If two objects are equal, their hash values must be equal; otherwise a lookup could search the wrong bucket and miss an existing key.

**Q:** How do cryptographic hash functions differ from table hash functions?
**A:** They add pre-image, second pre-image and collision resistance, which make them infeasible to invert or collide deliberately, at the price of speed.

## summary
A good hash function is deterministic, equality-consistent, fast, uniform and well mixed. Collisions are inevitable, so quality means spreading them evenly, and security uses need much stronger guarantees than tables do.

## codenote
The Python sample shows djb2, a bucket distribution, an avalanche measurement and the weakness of a character sum. The JavaScript sample uses FNV-1a.

## code
### python
```python
import hashlib

def djb2(text):
    value = 5381
    for char in text:
        value = (value * 33 + ord(char)) & 0xFFFFFFFF
    return value

words = ["apple", "banana", "cherry", "date", "elderberry", "fig",
         "grape", "honeydew", "kiwi", "lemon", "mango", "nectarine"]
buckets = [0] * 8
for word in words:
    buckets[djb2(word) % 8] += 1
print(djb2("abc"), djb2("abd"), buckets)

a = int(hashlib.sha256(b"hello").hexdigest(), 16)
b = int(hashlib.sha256(b"hellp").hexdigest(), 16)
print(bin(a ^ b).count("1"))

print([sum(ord(c) for c in w) % 8 for w in ["listen", "silent", "enlist", "tinsel"]])
```
Output:
```text
193485963 193485964 [2, 1, 1, 2, 1, 1, 2, 2]
131
[7, 7, 7, 7]
```
### javascript
```javascript
const fnv1a = (text) => {
  let hash = 0x811c9dc5;
  for (const char of text) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
};

console.log(fnv1a("hello"), fnv1a("hellp"));

const counts = Array(8).fill(0);
for (const word of ["apple", "banana", "cherry", "date", "elderberry", "fig", "grape", "honeydew", "kiwi", "lemon", "mango", "nectarine"]) {
  counts[fnv1a(word) % 8]++;
}
console.log(counts.join(","));
```
Output:
```text
1335831723 1553940770
5,3,1,0,0,2,0,1
```

## quiz
1. What must hold between key equality and hash values?
   - [ ] Equal hashes imply equal keys
   - [x] Equal keys must have equal hashes
   - [ ] Different keys must have different hashes
   - [ ] Hashes must be random every call
   > Otherwise a lookup could miss an existing key.
2. Why is a character-sum hash weak for words?
   - [ ] It is too slow
   - [x] Anagrams and many similar words produce the same value
   - [ ] It uses too much memory
   - [ ] It cannot handle letters
   > The order of characters is ignored.
3. What is the avalanche effect?
   - [ ] Hashes grow with the input length
   - [x] Flipping one input bit changes about half of the output bits
   - [ ] Hash values are always sorted
   - [ ] The table doubles in size
   > Good mixing spreads similar keys apart.
4. What extra property do cryptographic hashes have?
   - [ ] Speed
   - [x] Resistance to finding collisions and pre-images
   - [ ] Smaller output
   - [ ] Reversibility
   > They are designed so that attacks are computationally infeasible.

# Collision Resolution Chaining
kind: algorithm
time: O(1 + α) expected for insert, lookup and delete with load factor α = n/m; O(n) in the worst case when every key lands in one bucket.
space: O(n + m) for n stored items and m buckets.
practice: group-anagrams-count

## intro
When two keys hash to the same bucket, the table needs a rule for keeping both. Separate chaining is the simplest: each bucket holds a small list of all the entries that landed in it, so a collision just makes that list one element longer. It is the method behind many standard hash maps and a good starting point for understanding collisions.

## theory
Structure: an array of m buckets, each a linked list or small dynamic array of key-value pairs. The bucket index for a key is `hash(key) % m`.

Operations:

- Insert: compute the bucket, scan its chain for an existing key (update it if found), otherwise append the new pair. O(chain length).
- Lookup: compute the bucket and scan the chain, comparing keys with equality. O(chain length).
- Delete: find the entry in the chain and remove it. No special markers are needed.

Analysis: with a good hash function, n keys spread over m buckets give an average chain length of the load factor α = n / m. An unsuccessful lookup scans α entries on average and a successful one about 1 + α/2, so operations cost O(1 + α). Keeping α below a constant (by growing the table) makes them O(1) expected. If a poor hash sends everything to one bucket, the table degenerates into a list and costs O(n).

The anagram example shows how a poor hash hurts: with the character sum hash and 5 buckets, the keys cat, act, tac and bird all land in bucket 2, giving a chain of four and a lookup of "tac" that needs 4 comparisons, while another bucket holds none.

Advantages of chaining:

- Simple to implement and to reason about
- Deletion is trivial
- The table degrades gracefully: α can exceed 1 and it keeps working, only more slowly
- Pointers and per-node allocation can be avoided by using arrays inside buckets for better cache use

Disadvantages:

- Extra memory for links or small arrays
- Pointer chasing in linked lists has poor cache locality
- Long chains under adversarial or poor hashing

Improvements: replace long chains by balanced trees (Java's HashMap does this above 8 entries per bucket, giving O(log n) worst case), move found items to the front of the chain, keep chains sorted to stop searching early, and resize when α exceeds a threshold (see load factor and rehashing).

Chaining in standard libraries: Java's `HashMap` and C++'s `std::unordered_map` use chaining in some form; Python's dict and Go's map use open addressing or hybrid schemes instead.

## explain
1. Create an array of buckets, each an empty list.
2. Compute the bucket index from the key's hash.
3. On insert, search the bucket for the key and update it or append a new entry.
4. On lookup, search only that bucket and compare keys by equality.
5. Track the number of items and the load factor to decide when to grow.
6. Test with colliding keys, deletion and absent keys.

## example
The Python `Chained` class has five buckets and the character-sum hash. After inserting cat, act, dog, god, bird and tac, the bucket sizes are `[0, 0, 4, 0, 2]`: cat, act, bird and tac share bucket 2 and dog and god share bucket 4. Looking up "tac" returns its value 6 after 4 comparisons, and the absent "cow" returns None after scanning 2. The JavaScript lines build the same buckets and print their contents.

## real
Language runtimes, caches and symbol tables use chained tables, and Java's HashMap converts long chains to red-black trees to protect against collision attacks.

## pros
- Simple, with trivial deletion
- Works at load factors above one
- Easy to extend with better chain structures

## cons
- Extra memory for links
- Poor cache behavior with linked nodes
- Long chains under bad hashing

## uses
- General-purpose hash maps and sets
- Symbol tables in compilers
- Caches with unpredictable key sets
- Teaching hash table design

## mistakes
- Using a poor hash function and creating long chains
- Forgetting to compare keys, not just hashes, inside the chain
- Letting the load factor grow without resizing
- Comparing hashes for equality instead of the keys themselves

## interview
**Q:** How does separate chaining resolve collisions?
**A:** Each bucket stores a list of all the entries that hash to it, so colliding keys are simply kept together in the same chain and found by scanning it.

**Q:** What is the expected cost of a lookup with chaining?
**A:** O(1 plus alpha), where alpha is the load factor, because the average chain has alpha entries; with alpha kept constant this is O(1).

**Q:** How can the worst case of chaining be improved?
**A:** By converting long chains into balanced trees, as Java's HashMap does, which turns the worst-case O(n) lookup into O(log n).

## summary
Chaining keeps colliding entries in per-bucket lists, giving O(1 plus load factor) expected operations and simple deletion. A good hash and a bounded load factor keep chains short.

## codenote
The Python sample builds a chained table and shows the effect of a weak hash. The JavaScript sample prints the buckets.

## code
### python
```python
class Chained:
    def __init__(self, size=5):
        self.buckets = [[] for _ in range(size)]

    def _index(self, key):
        return sum(map(ord, key)) % len(self.buckets)

    def put(self, key, value):
        bucket = self.buckets[self._index(key)]
        for pair in bucket:
            if pair[0] == key:
                pair[1] = value
                return
        bucket.append([key, value])

    def get(self, key):
        probes = 0
        for stored, value in self.buckets[self._index(key)]:
            probes += 1
            if stored == key:
                return value, probes
        return None, probes

table = Chained()
for key, value in [("cat", 1), ("act", 2), ("dog", 3), ("god", 4), ("bird", 5), ("tac", 6)]:
    table.put(key, value)
print([len(bucket) for bucket in table.buckets], table.get("tac"), table.get("cow"))
```
Output:
```text
[0, 0, 4, 0, 2] (6, 4) (None, 2)
```
### javascript
```javascript
const buckets = Array.from({ length: 5 }, () => []);
const indexOf = (key) => [...key].reduce((sum, char) => sum + char.charCodeAt(0), 0) % 5;

for (const key of ["cat", "act", "dog", "god", "bird", "tac"]) {
  buckets[indexOf(key)].push(key);
}
console.log(buckets.map((bucket) => bucket.length).join(","), buckets[2].join("|"));
```
Output:
```text
0,0,4,0,2 cat|act|bird|tac
```

## quiz
1. What does each bucket hold in separate chaining?
   - [ ] A single key
   - [x] A list of the entries whose keys hash there
   - [ ] The hash values only
   - [ ] A pointer to the table
   > Collisions are stored together.
2. What is the expected lookup cost with load factor alpha?
   - [ ] O(n)
   - [x] O(1 + alpha)
   - [ ] O(log n)
   - [ ] O(alpha squared)
   > The average chain has alpha entries.
3. Why must keys be compared inside the chain?
   - [ ] Hashes are never equal
   - [x] Different keys can share a bucket and even a hash value
   - [ ] To sort the chain
   - [ ] Comparing keys is optional
   > Only key equality identifies the entry.
4. How does Java's HashMap protect against very long chains?
   - [ ] It deletes entries
   - [x] It converts long chains into balanced trees
   - [ ] It stops accepting keys
   - [ ] It switches to sorting
   > That bounds the worst-case lookup to O(log n).

# Collision Resolution Open Addressing
kind: algorithm
time: O(1/(1 − α)) expected probes for an unsuccessful search and about (1/α) ln(1/(1 − α)) for a successful one with uniform probing at load factor α; linear probing costs about ½(1 + 1/(1 − α)²) for unsuccessful searches. All degrade toward O(n) as α approaches 1.
space: O(m) for a table of m slots, which must exceed the number of items n; there are no per-item pointers.

## intro
Open addressing stores every entry directly in the table array. When a key's preferred slot is taken, the algorithm probes other slots in a fixed sequence until it finds a free one. With no pointers and good cache behavior it is fast, and it is the approach used by Python's dict and by many high-performance tables, but it demands careful handling of deletions and of how full the table gets.

## theory
Insertion: compute the home slot `i = hash(key) % m`; if it is occupied by a different key, try the next slot in the probe sequence; place the key in the first empty slot. Lookup follows the same sequence and stops when it finds the key or an empty slot (which proves the key is absent).

Probe sequences:

- Linear probing: `i, i + 1, i + 2, ...` (mod m). Simple and cache-friendly, but suffers from primary clustering: runs of occupied slots grow and make later collisions more likely to extend them.
- Quadratic probing: `i + 1², i + 2², ...` spreads probes and reduces primary clustering, but needs a table size and constants that guarantee every slot is reachable (a prime size or power of two with triangular numbers)
- Double hashing: the step comes from a second hash, `i + k·h₂(key)`, which gives the best distribution but costs a second hash and the step must be coprime to the table size
- Perturbation-based schemes (Python) mix more bits of the hash into later probes

Deletion needs care. Simply emptying a slot breaks lookups for keys that probed past it. For example with a table of 7 slots, inserting 10, 17 and 24 places them in slots 3, 4 and 5 (they all hash to 3 modulo 7, and probing moves them along); emptying the slot of 17 would make 24 unfindable. The fix is a tombstone marker that means "deleted, keep probing" and that insertion may reuse; tombstones accumulate and force a rebuild occasionally.

Load factor: α = n / m must stay below 1, and performance falls off sharply: around 0.5 is comfortable for linear probing, and 0.7 to 0.9 is the usual maximum for other schemes. Tables are resized before they get that full.

Example: inserting 10, 17, 24, 3 and 5 into 7 slots gives probe counts `[0, 1, 2, 3, 2]` and the final table `[5, None, None, 10, 17, 24, 3]`: the keys 10, 17, 24 and 3 all want slot 3 and form a cluster, which makes inserting 3 cost three extra probes.

Comparison with chaining: open addressing uses less memory per entry and has better locality, but has no graceful degradation above α = 1, needs tombstones and is more sensitive to the hash quality.

## explain
1. Allocate an array of m empty slots, with m larger than the expected item count.
2. Compute the home slot and walk the probe sequence until you find the key or an empty slot.
3. On insert, use the first empty (or tombstone) slot found, after checking that the key is not already present.
4. On delete, mark the slot with a tombstone instead of emptying it.
5. Track the load factor, including tombstones, and rebuild the table when it is too high.
6. Test with keys that all collide, deletions followed by lookups, and a nearly full table.

## example
The Python `Probing` class inserts 10, 17, 24, 3 and 5 into 7 slots; the extra probes needed are 0, 1, 2, 3 and 2, and the final table is `[5, None, None, 10, 17, 24, 3]`, showing a cluster of four consecutive keys. In JavaScript, after inserting 10, 17 and 24, key 24 is found at slot 5. If the slot holding 17 is simply emptied, the lookup of 24 fails and returns -1, which demonstrates why deletions need tombstones.

## real
Python dictionaries and sets, Rust's hash maps (Swiss tables), Go maps and many database and game engines use open addressing for its speed and compactness.

## pros
- No pointers and compact memory
- Excellent cache locality, especially with linear probing
- Very fast lookups at moderate load factors

## cons
- Performance collapses as the table fills
- Deletions need tombstones
- Clustering with weak hash functions or simple probing

## uses
- High-performance in-memory hash tables
- Dictionaries and sets in language runtimes
- Caches with a bounded size
- Embedded systems where memory is tight

## mistakes
- Emptying a slot on delete and breaking later lookups
- Letting the load factor approach one
- Using a table size that makes quadratic probing miss slots
- Forgetting that tombstones count toward the effective load

## interview
**Q:** What is the main difference between chaining and open addressing?
**A:** Chaining stores colliding entries in lists outside the table, while open addressing keeps every entry in the table itself and probes alternative slots when its home slot is occupied.

**Q:** Why can't you simply empty a slot when deleting from an open-addressed table?
**A:** Other keys may have probed past that slot, and a lookup stops at an empty slot, so those keys would become unfindable. A tombstone tells the probe to continue.

**Q:** What is primary clustering?
**A:** With linear probing, collisions form long runs of consecutive occupied slots, and any key hashing into a run extends it, so the runs grow and slow down further operations.

## summary
Open addressing stores entries in the table and resolves collisions by probing: linear, quadratic or double hashing. It is compact and fast but needs tombstones for deletion and a low load factor.

## codenote
The Python sample shows linear probing and clustering. The JavaScript sample demonstrates why deletion needs tombstones.

## code
### python
```python
class Probing:
    def __init__(self, size=7):
        self.size = size
        self.keys = [None] * size

    def put(self, key):
        index = key % self.size
        extra = 0
        while self.keys[index] is not None and self.keys[index] != key:
            index = (index + 1) % self.size
            extra += 1
        self.keys[index] = key
        return extra

table = Probing()
print([table.put(key) for key in [10, 17, 24, 3, 5]], table.keys)
```
Output:
```text
[0, 1, 2, 3, 2] [5, None, None, 10, 17, 24, 3]
```
### javascript
```javascript
const slots = Array(7).fill(null);

function put(key) {
  let i = key % 7;
  while (slots[i] !== null && slots[i] !== key) i = (i + 1) % 7;
  slots[i] = key;
}

function find(key) {
  let i = key % 7;
  for (let steps = 0; steps < 7 && slots[i] !== null; steps++) {
    if (slots[i] === key) return i;
    i = (i + 1) % 7;
  }
  return -1;
}

[10, 17, 24].forEach(put);
console.log(find(24));
slots[slots.indexOf(17)] = null;
console.log(find(24));
```
Output:
```text
5
-1
```

## quiz
1. Where are entries stored in open addressing?
   - [ ] In linked lists outside the table
   - [x] Directly in the table array
   - [ ] In a separate tree
   - [ ] On disk
   > Collisions are resolved by probing other slots.
2. Why are tombstones needed?
   - [ ] To speed up insertion only
   - [x] An emptied slot would stop lookups before they reach keys that probed past it
   - [ ] To count items
   - [ ] To prevent resizing
   > A tombstone says to keep probing.
3. What is primary clustering?
   - [ ] Keys that are numerically close
   - [x] Long runs of occupied slots that grow as collisions are appended to them
   - [ ] Too many buckets
   - [ ] A hash function that is too fast
   > Linear probing extends existing runs.
4. What happens to open addressing performance as the load factor nears 1?
   - [ ] It improves
   - [x] It degrades sharply toward linear probing of the whole table
   - [ ] It stays constant
   - [ ] The table doubles itself
   > There are few empty slots to end a search.

# Load Factor and Rehashing
kind: algorithm
time: O(1) amortised per insertion when the table doubles whenever the load factor exceeds a threshold; a single resize costs O(n) because every entry is reinserted.
space: O(n) with the table holding between about 37 percent and 75 percent occupied slots when the threshold is 0.75.
viz: hash-linear-probing

## intro
A hash table is only fast while it is not too full. The load factor measures fullness, and rehashing, growing the table and reinserting everything, is how the table keeps it under control. Together they explain why inserting into a hash table is constant time on average even though an occasional insertion is slow.

## theory
Load factor: `α = n / m`, the number of stored items divided by the number of buckets (or slots). It controls the expected cost of every operation: chains have length about α in chaining, and probe counts grow like `1/(1 − α)` in open addressing.

Thresholds in practice: Java's HashMap resizes at α = 0.75, Python's dict keeps its usage under two thirds, and open-addressing designs such as Swiss tables use around 7/8. Lower thresholds use more memory and make lookups faster; higher thresholds save memory and slow things down.

Rehashing procedure:

- When an insertion would push α above the threshold, allocate a new table with a larger capacity, typically double
- Reinsert every existing entry, recomputing its bucket index with the new size, because `hash % m` changes when m changes. The stored hash value can be reused, but the position cannot simply be copied.
- Release the old table. Tombstones disappear in the process.
- Cost: O(n) for that one operation

Amortised analysis: with doubling, the resizes happen at sizes 4, 8, 16, ... and cost n each time, so the total rehashing work over n insertions is under 2n and the amortised cost per insertion is O(1), exactly as for dynamic arrays. Growing by a fixed number of buckets instead would make the total cost quadratic.

Example: starting with 4 buckets and threshold 0.75, inserting 100 items triggers resizes when the sizes reach 4, 7, 13, 25, 49 and 97 items, taking the capacity through 8, 16, 32, 64, 128 and 256. The final load factor is 100/256, about 0.39, which is typical: just after a doubling the table is half as full as at the trigger.

Design choices:

- Shrinking: some tables shrink when α falls below a lower threshold (such as a quarter) to give memory back; the gap between thresholds avoids thrashing
- Incremental rehashing (used by Redis and some real-time systems): move a few buckets at a time during each operation so no single operation pays O(n)
- Power-of-two capacities allow the mask `hash & (m − 1)`, and a prime capacity can improve distribution for weak hashes
- Pre-sizing: if you know the number of items, create the table with enough capacity (for example the `HashMap(capacity)` constructor or `dict.fromkeys`) to avoid rehashing altogether
- Latency: the occasional O(n) pause matters in real-time services

Pitfall: a rehash during iteration invalidates iterators, which is why modifying a dictionary while iterating over it raises an error in Python.

## explain
1. Choose a maximum load factor and an initial capacity.
2. After each insertion, or before it, compare the count with the threshold times the capacity.
3. When exceeded, allocate a table of double the capacity.
4. Reinsert all entries using the new modulus.
5. Count the resizes and the total reinserted items to confirm the amortised cost.
6. Pre-size the table when the final size is known.

## example
The Python loop inserts 100 items starting from 4 buckets and resizes when the load factor exceeds 0.75. The resizes happen at the 4th, 7th, 13th, 25th, 49th and 97th insertion and bring the capacity to 8, 16, 32, 64, 128 and 256, with a final load factor of about 0.39. The JavaScript version prints the capacity after each growth, `8 16 32 64 128 256`, and the final capacity 256.

## real
Language runtimes and databases tune their thresholds with care, caches and in-memory stores such as Redis rehash incrementally to avoid pauses, and high-performance code reserves capacity up front.

## pros
- Keeps operations fast as the data grows
- Doubling gives constant amortised insertion
- Pre-sizing can avoid resizing completely

## cons
- A single insertion can be very slow
- Needs extra memory during the copy
- Tables hold unused slots by design

## uses
- Maintaining hash table performance as it grows
- Choosing capacity and thresholds for caches
- Avoiding latency spikes with incremental rehashing
- Estimating memory use of maps and sets

## mistakes
- Growing the table by a fixed increment
- Copying bucket positions instead of recomputing them with the new size
- Ignoring tombstones when measuring the load
- Modifying a table while iterating over it

## interview
**Q:** What is the load factor of a hash table?
**A:** The number of stored entries divided by the number of buckets or slots; it determines the expected length of chains or the number of probes.

**Q:** Why must entries be reinserted rather than copied during a rehash?
**A:** The bucket index is the hash modulo the table size, so a new size changes every entry's position and the entries must be placed again.

**Q:** Why is insertion O(1) amortised even though rehashing is O(n)?
**A:** The table doubles, so rehashing happens rarely and the total reinsertion work over n insertions is less than 2n, which averages to a constant per insertion.

## summary
The load factor controls hash table speed, and doubling the table with a full reinsertion whenever it passes a threshold keeps it low at O(1) amortised cost. Pre-size when possible and watch latency spikes.

## codenote
The Python sample records when the table grows. The JavaScript sample prints the capacities.

## code
### python
```python
capacity, count = 4, 0
resizes = []
for _ in range(100):
    count += 1
    if count / capacity > 0.75:
        capacity *= 2
        resizes.append((count, capacity))

print(resizes)
print(capacity, count / capacity)
```
Output:
```text
[(4, 8), (7, 16), (13, 32), (25, 64), (49, 128), (97, 256)]
256 0.390625
```
### javascript
```javascript
let capacity = 4;
let size = 0;
const grown = [];

for (let i = 0; i < 100; i++) {
  size++;
  if (size / capacity > 0.75) {
    capacity *= 2;
    grown.push(capacity);
  }
}
console.log(grown.join(" "), capacity);
```
Output:
```text
8 16 32 64 128 256 256
```

## quiz
1. How is the load factor computed?
   - [ ] Capacity divided by items
   - [x] Items divided by buckets
   - [ ] Items times buckets
   - [ ] Collisions divided by items
   > It measures how full the table is.
2. Why are entries reinserted during a rehash?
   - [ ] To sort them
   - [x] Their bucket positions depend on the table size, which has changed
   - [ ] To remove duplicates
   - [ ] To compress them
   > The index is the hash modulo the new size.
3. Why is insertion amortised O(1) with doubling?
   - [ ] Because rehashing is free
   - [x] Resizes are rare and their total cost is under 2n for n insertions
   - [ ] Because tables never grow
   - [ ] Because hashing is instant
   > The same argument applies as for dynamic arrays.
4. What does incremental rehashing avoid?
   - [ ] Collisions
   - [x] A long pause from moving all entries at once
   - [ ] Hash functions
   - [ ] Memory use
   > It spreads the work over many operations.

# Universal Hashing
kind: concept
time: Not an algorithmic topic — the lesson explains a probabilistic guarantee about hash families; evaluating one member of the family costs a few arithmetic operations.
space: Not an algorithmic topic — a member of the family is described by a few integers, such as a, b and a prime p.

## intro
Any fixed hash function has inputs that make it perform terribly: choose keys that all land in one bucket and the table degrades to a list. An attacker who knows the function can do exactly that. Universal hashing defeats this by choosing the function at random from a family at start-up, so no input is bad in advance and the expected performance holds for every input.

## theory
Definition: a family H of hash functions mapping keys to `{0, ..., m − 1}` is universal if, for any two distinct keys x and y, the probability over a random choice of h from H that `h(x) = h(y)` is at most `1/m`. That is no worse than if the values were completely random.

Classic family (Carter and Wegman): choose a prime p larger than any key, and pick random a in `{1, ..., p − 1}` and b in `{0, ..., p − 1}`. Define

`h_{a,b}(x) = ((a · x + b) mod p) mod m`

This family is universal (the final reduction modulo m introduces a small slack but the collision probability stays at about 1/m). There are p(p − 1) functions in it. With p = 101 and m = 10, counting over all 10,100 pairs (a, b), the keys 17 and 42 collide in 920 of them, a fraction of 0.0911, below the 1/m = 0.1 bound.

Consequences for hash tables with chaining: for any set of n keys and any new key x, the expected number of keys colliding with x is at most n/m, so the expected chain length is the load factor α and operations are O(1 + α) expected, regardless of how the keys were chosen. The randomness comes from the function, not from the data, so no sequence of keys can force bad behavior unless the attacker guesses the random choice.

Stronger notions: k-independent families guarantee that any k distinct keys hash independently and uniformly, which is needed for some analyses (linear probing needs 5-independence for its expected bounds); tabulation hashing is simple, fast and 3-independent; polynomial hashes over a prime field serve strings.

Related practice:

- Hash flooding attacks: in 2011 researchers showed that web frameworks with predictable string hashes could be brought down with a small request containing thousands of colliding keys. Languages responded by randomising their string hash seeds per process (Python's PYTHONHASHSEED, Java and Ruby changes) and by using keyed hashes such as SipHash.
- Perfect hashing: for a fixed set of keys, a two-level universal scheme gives O(1) worst-case lookups with O(n) space
- Cuckoo hashing and Bloom filters also rely on independent hash functions drawn from a family
- A universal family is not cryptographic; it protects against random collisions, not against someone who learns the secret parameters

Implementation tips: draw a and b once when the table is created, keep them secret, use a prime near a power of two (like 2⁶¹ − 1) for fast modular reduction, and rebuild with new parameters if a table's chains become unusually long.

## explain
1. Choose a prime p larger than the key universe and the table size m.
2. Draw a from 1 to p − 1 and b from 0 to p − 1 at random when creating the table.
3. Hash a key x as `((a * x + b) % p) % m`.
4. Convert non-integer keys to integers first, for example with a base hash.
5. Check collisions empirically by counting how often two fixed keys collide across all parameter choices.
6. Rebuild with new parameters if the observed collisions are far above expectation.

## example
With p = 101 and m = 10, the Python program counts, over every pair (a, b), how often the keys 17 and 42 land in the same bucket: 920 of 10,100 pairs, a rate of 0.0911, within the universal bound of 0.1. The JavaScript sample compares the plain modulo hash with one family member for the keys 10, 20, 30 and 40: modulo 10 sends all four to bucket 0, while the function with a = 57 and b = 13 spreads them to buckets 8, 2, 6 and 1.

## real
Language runtimes randomise their hash seeds to resist flooding attacks, network devices use universal hashing for load distribution, and probabilistic data structures such as count-min sketches and Bloom filters draw their hash functions from universal families.

## pros
- Guarantees expected performance for every input set
- Defeats attacks that rely on predictable hashes
- Simple formulas using modular arithmetic

## cons
- Requires randomness and a way to keep the parameters secret
- Slightly slower than a fixed bit-mixing hash
- Not a cryptographic guarantee

## uses
- Hash tables that must resist adversarial keys
- Randomised data structures and sketches
- Load balancing across servers or shards
- Theoretical analysis of hashing

## mistakes
- Choosing a and b once and publishing them
- Picking a prime smaller than the key range
- Using a equal to zero, which makes every key hash to the same bucket
- Confusing universal hashing with cryptographic hashing

## interview
**Q:** What does it mean for a family of hash functions to be universal?
**A:** For any two distinct keys, the probability over a random choice of function from the family that they collide is at most one over the table size.

**Q:** Why does universal hashing protect against adversarial inputs?
**A:** The function is chosen at random after the keys are fixed, so an adversary cannot know in advance which keys will collide, and the expected chain length is the load factor for every input.

**Q:** What is the Carter-Wegman family?
**A:** The functions h of x equal to ((a times x plus b) mod p) mod m for a prime p, with a random in 1 to p minus 1 and b random in 0 to p minus 1.

## summary
Universal hashing picks the hash function at random from a family so that any two keys collide with probability at most 1/m, giving expected constant-time operations for every input and resistance to crafted collisions. It is a probabilistic, not a cryptographic, guarantee.

## codenote
The Python sample counts collisions over the whole family. The JavaScript sample compares a family member with plain modulo.

## code
### python
```python
P, M = 101, 10
x, y = 17, 42

collisions = 0
for a in range(1, P):
    for b in range(P):
        if ((a * x + b) % P) % M == ((a * y + b) % P) % M:
            collisions += 1

total = (P - 1) * P
print(collisions, total, round(collisions / total, 4))
```
Output:
```text
920 10100 0.0911
```
### javascript
```javascript
const universal = (a, b, x) => ((a * x + b) % 101) % 10;
const keys = [10, 20, 30, 40];

console.log(keys.map((x) => universal(57, 13, x)).join(","));
console.log(keys.map((x) => x % 10).join(","));
```
Output:
```text
8,2,6,1
0,0,0,0
```

## quiz
1. What probability bound defines a universal family?
   - [ ] Zero collisions
   - [x] Two distinct keys collide with probability at most 1 over the table size
   - [ ] Every key collides
   - [ ] Collisions are certain
   > That matches what truly random hashing would give.
2. Why does universal hashing resist adversarial keys?
   - [ ] The keys are encrypted
   - [x] The function is chosen at random after the keys are fixed
   - [ ] The table never grows
   - [ ] It uses SHA-256
   > An attacker cannot predict which keys collide.
3. In the family ((a x plus b) mod p) mod m, what must a not be?
   - [ ] Odd
   - [x] Zero
   - [ ] Less than p
   - [ ] A prime
   > With a equal to zero, every key hashes to the same value.
4. What kind of guarantee does universal hashing give?
   - [ ] A cryptographic one
   - [x] An expected-performance guarantee over the random choice of function
   - [ ] A worst-case guarantee for a fixed function
   - [ ] None
   > It is probabilistic and does not make the function secret-proof.

# Rolling Hash
kind: algorithm
time: O(n + m) expected for finding a pattern of length m in a text of length n, because each window hash is updated in O(1); O(n · m) in the worst case if hashes collide constantly and every candidate must be verified.
space: O(1) extra space for the hash state, plus the pattern.

## intro
Computing a hash for every window of a text would cost m operations per window and n · m in total. A rolling hash updates the hash of the previous window in constant time when the window slides by one position: drop the outgoing character, add the incoming one. This turns a comparison of substrings into a comparison of numbers, and is the idea behind the Rabin-Karp search.

## theory
Polynomial rolling hash: treat a string of length m as a number in some base b modulo a large prime q:

`H(s) = (s[0]·b^(m−1) + s[1]·b^(m−2) + ... + s[m−1]) mod q`

Sliding the window from `s[i..i+m−1]` to `s[i+1..i+m]`:

`H_new = ((H_old − s[i]·b^(m−1)) · b + s[i+m]) mod q`

Precompute `high = b^(m−1) mod q` once. Each step is a few arithmetic operations, independent of m.

Rabin-Karp search:

- Compute the hash of the pattern and of the first window of the text
- For each window, if the hashes are equal, compare the actual characters (to rule out collisions, since different strings can share a hash)
- Slide using the update formula
- Total expected time O(n + m) when collisions are rare, with a prime q large enough

Choices and cautions:

- Base b at least the alphabet size (256 for bytes, 31 or 131 common); modulus a large prime (10⁹ + 7, or 2⁶¹ − 1 with 128-bit intermediate products) to make collisions improbable
- Handle negative numbers after the subtraction by adding q before the modulus
- Overflow: in fixed-width languages multiply carefully so that the product fits; use 64-bit integers with moduli below 2³¹, or 128-bit arithmetic
- Use two different moduli (double hashing) to push the collision probability down for adversarial or very large inputs
- Always verify hash matches unless a false positive is acceptable
- Randomise the base to avoid anti-hash inputs in contests

Uses beyond search: finding duplicate substrings and the longest repeated substring (with binary search on length), plagiarism detection and document fingerprinting (shingling with rolling hashes), searching for multiple patterns simultaneously by storing their hashes in a set, content-defined chunking in backup and deduplication tools (rsync, dedup storage use rolling checksums to find block boundaries), and checking whether a substring is a palindrome in constant time with prefix hashes.

Prefix-hash alternative: precompute `prefix[i]` for all i, then any substring's hash is available in O(1) as `prefix[r] − prefix[l]·b^(r−l)` modulo q, supporting arbitrary-window queries, not only sliding ones.

## explain
1. Choose a base and a large prime modulus.
2. Compute the hash of the pattern and of the first window of the text.
3. Precompute the highest power of the base for the window length.
4. At each position, compare the hashes and verify real equality on a match.
5. Slide the window by removing the outgoing character's contribution and adding the incoming character.
6. Record the match positions and test with overlapping matches and with a pattern longer than the text.

## example
The Python function searches "abracadabra abra" for "abra" with base 256 and modulus 1,000,003. It finds matches at 0, 7 and 12, and the hash comparison triggers exactly 3 character-by-character verifications, so no collision caused extra work. The JavaScript version searches "ababababa" for "aba" and reports the overlapping matches at positions 0, 2, 4 and 6.

## real
Search tools, plagiarism checkers, backup and deduplication systems, and bioinformatics pipelines use rolling hashes to scan large inputs in a single pass.

## pros
- Constant-time update per window
- Simple to implement and to extend to many patterns
- Gives O(n + m) expected search time

## cons
- Hash collisions need verification
- Modular arithmetic and overflow need care
- Worst case is quadratic with adversarial inputs

## uses
- Substring search with Rabin-Karp
- Finding repeated substrings and duplicates
- Content-defined chunking for deduplication
- Comparing substrings in constant time

## mistakes
- Forgetting to add the modulus after a subtraction and getting negative hashes
- Skipping the verification of a hash match
- Using a small modulus that produces many collisions
- Letting the multiplication of the hash by the base exceed the integer range

## interview
**Q:** How does a rolling hash update when the window slides?
**A:** Subtract the outgoing character's contribution, which is its value times base to the power window length minus one, multiply the remainder by the base and add the incoming character, all modulo the prime.

**Q:** Why must Rabin-Karp verify matches?
**A:** Different strings can have the same hash, so equal hashes only suggest a match; comparing the characters rules out false positives.

**Q:** What is the expected time of Rabin-Karp?
**A:** O(n plus m), because each window hash is updated in constant time and verification is rarely needed with a good modulus; the worst case is O(n times m).

## summary
A rolling hash updates the hash of a sliding window in O(1), so substring comparisons become number comparisons. Rabin-Karp uses it for search in O(n plus m) expected time, verifying matches to rule out collisions.

## codenote
The Python sample searches with the rolling update and counts verifications. The JavaScript sample finds overlapping matches.

## code
### python
```python
def rolling_search(text, pattern, base=256, mod=1_000_003):
    m = len(pattern)
    high = pow(base, m - 1, mod)
    target = window = 0
    for i in range(m):
        target = (target * base + ord(pattern[i])) % mod
        window = (window * base + ord(text[i])) % mod

    hits, verifications = [], 0
    for i in range(len(text) - m + 1):
        if window == target:
            verifications += 1
            if text[i:i + m] == pattern:
                hits.append(i)
        if i + m < len(text):
            window = ((window - ord(text[i]) * high) * base + ord(text[i + m])) % mod
    return hits, verifications

print(rolling_search("abracadabra abra", "abra"))
```
Output:
```text
([0, 7, 12], 3)
```
### javascript
```javascript
const text = "ababababa";
const pattern = "aba";
const base = 256;
const mod = 1000003;

let high = 1;
for (let i = 1; i < pattern.length; i++) high = (high * base) % mod;

let target = 0;
let window = 0;
for (let i = 0; i < pattern.length; i++) {
  target = (target * base + pattern.charCodeAt(i)) % mod;
  window = (window * base + text.charCodeAt(i)) % mod;
}

const hits = [];
for (let i = 0; i + pattern.length <= text.length; i++) {
  if (window === target && text.startsWith(pattern, i)) hits.push(i);
  if (i + pattern.length < text.length) {
    const removed = (text.charCodeAt(i) * high) % mod;
    window = (((window - removed + mod) % mod) * base + text.charCodeAt(i + pattern.length)) % mod;
  }
}
console.log(hits.join(","));
```
Output:
```text
0,2,4,6
```

## quiz
1. What does a rolling hash update when the window slides by one?
   - [ ] The whole hash from scratch
   - [x] It removes the outgoing character and adds the incoming one in constant time
   - [ ] It sorts the window
   - [ ] It doubles the base
   > The cost is independent of the window length.
2. Why verify characters after a hash match?
   - [ ] Hashes are never equal
   - [x] Different strings can share the same hash
   - [ ] To lower the modulus
   - [ ] Verification is optional
   > Collisions cause false positives.
3. What is the expected time of Rabin-Karp search?
   - [ ] O(n times m)
   - [x] O(n + m)
   - [ ] O(log n)
   - [ ] O(m squared)
   > Each window hash costs O(1) and verifications are rare.
4. Why add the modulus after a subtraction?
   - [ ] To slow the code
   - [x] The intermediate value can be negative and must be brought back into range
   - [ ] To change the base
   - [ ] To avoid the prefix hash
   > Negative remainders behave differently across languages.
