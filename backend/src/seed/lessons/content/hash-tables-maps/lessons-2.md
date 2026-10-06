# LRU Cache Hash Map
kind: algorithm
time: O(1) average for get and put when the ordered hash map moves an entry to the end in constant time; the eviction of the oldest entry is also O(1).
space: O(capacity) for the stored entries, plus the small bookkeeping of the ordering structure.
viz: hash-linear-probing

## intro
A hash map gives constant time lookup but forgets in which order entries were used. A cache with a size limit needs exactly that order, because it must throw away the entry that has not been used for the longest time. Ordered hash maps, which pair a hash index with a recency order, give a compact way to build a least recently used cache without writing the linked list yourself.

## theory
Requirement: a cache holds at most `capacity` entries. A read (`get`) or a write (`put`) makes an entry the most recently used. When a new entry would exceed the capacity, the least recently used entry is evicted.

Ordered map approach: use a hash map that remembers insertion order and lets you move a key to the end:

- Python: `collections.OrderedDict` offers `move_to_end(key)` and `popitem(last=False)` (remove the oldest). Both are O(1).
- JavaScript: a `Map` iterates in insertion order, so deleting a key and setting it again moves it to the end, and `map.keys().next().value` is the oldest key
- Java: `LinkedHashMap` with access order enabled and an overridden `removeEldestEntry`

Operations:

- get(key): if absent, report a miss; otherwise move the key to the end (most recent) and return its value
- put(key, value): if the key exists, update it and move it to the end; otherwise insert it at the end and, if the size exceeds the capacity, remove the first (oldest) key

Trace with capacity 3 and the request sequence 1, 2, 3, 1, 4, 2, 5, 1, where each request reads the key and inserts it on a miss. Requests 1, 2, 3 are misses and fill the cache. The second request for 1 is a hit and moves it to the most recent position (order 2, 3, 1). The key 4 misses and evicts 2; the key 2 misses and evicts 3; the key 5 misses and evicts 1; and the final request for 1 misses again and evicts 4. The result is 1 hit and 7 misses, a hit ratio of 12.5 percent, with the cache holding 2, 5, 1 at the end. A larger capacity would have kept more entries and hit more often.

Hit ratio is the key measurement: hits divided by requests. It depends on the access pattern (temporal locality) and the capacity; plotting it against capacity shows where adding memory stops helping.

Extensions:

- Time to live: store an expiry time with each entry and treat expired entries as misses (check on read and sweep occasionally). A cache entry set at time 0 with a lifetime of 5 is valid at time 3 and expired at time 6.
- Size-based limits: evict until the total weight (bytes) fits rather than counting entries
- Callbacks on eviction, for writing dirty data back
- Thread safety: a lock around operations, or sharding the cache by key hash to reduce contention
- Memoization with a bound: `functools.lru_cache(maxsize=128)` applies the policy to function results and exposes `cache_info()` with hits and misses
- Other policies: LFU (least frequently used), FIFO, random replacement and ARC; LRU is the default because it is simple and works well with locality

Pitfalls:

- Forgetting to refresh recency on a read, which turns the cache into FIFO
- Using falsy checks for hits (a stored zero or empty string is still a hit)
- Evicting before updating an existing key, which can wrongly remove an entry that is about to be rewritten
- Caching mutable objects whose contents change after caching
- Unbounded keys in an LRU on a server, where one user can flush others (use per-tenant caches)

Testing: capacity of one, repeated gets, update of an existing key and eviction order after a long sequence.

## explain
1. Create an ordered hash map and store the capacity.
2. On get, return a miss if the key is absent; otherwise move the key to the end and return its value.
3. On put, update and move an existing key, or insert a new key at the end.
4. If the size exceeds the capacity, remove the first key in the order.
5. Count hits and misses to compute the hit ratio.
6. Optionally store expiry times and treat expired entries as misses.

## example
The Python class uses an `OrderedDict`, replays the request sequence 1, 2, 3, 1, 4, 2, 5, 1 with capacity 3 and prints 1 hit, 7 misses and the final cache contents 2, 5, 1. The JavaScript class keeps an expiry time with each entry and prints the readings of two keys at different times: a value while it is fresh and undefined after it expires.

## real
Web servers cache rendered pages and database query results, content delivery networks evict the least recently requested files, and the memoization decorator in standard libraries uses the same policy.

## pros
- Short code using a built in ordered map
- Every operation stays constant time through the ordered map
- Easy to extend with expiry times and statistics

## cons
- Relies on the ordering guarantees of the library map
- Not scan resistant for long sequential reads
- Needs locking or sharding for concurrent use

## uses
- Caching database query results
- Bounded memoization of function calls
- Page and file caches
- Session or token caches with expiry

## mistakes
- Not moving an entry to the end when it is read
- Treating a stored falsy value as a miss
- Checking the capacity before updating an existing key
- Forgetting that expired entries still occupy space until they are swept

## interview
**Q:** How can an LRU cache be built with an ordered hash map?
**A:** On every get or put move the key to the end of the ordered map, and when the size exceeds the capacity remove the first key, which is the least recently used; all operations are O(1).

**Q:** What measurement shows whether a cache is effective?
**A:** The hit ratio, hits divided by total requests, observed over a realistic request sequence and compared across capacities.

**Q:** How do you add expiry to a cache?
**A:** Store an expiry time with each value, treat entries past their time as misses on read, remove them lazily or with a periodic sweep, and still apply the capacity limit.

## summary
An ordered hash map gives an LRU cache with O(1) get and put by moving used keys to the end and evicting from the front. Track hit ratio, refresh recency on reads and add expiry times when entries can go stale.

## codenote
The Python sample counts hits and misses for a request sequence. The JavaScript sample adds time based expiry.

## code
### python
```python
from collections import OrderedDict

class LRUCache:
    def __init__(self, capacity):
        self.capacity = capacity
        self.entries = OrderedDict()
        self.hits = self.misses = 0

    def request(self, key):
        if key in self.entries:
            self.entries.move_to_end(key)
            self.hits += 1
            return
        self.misses += 1
        self.entries[key] = True
        if len(self.entries) > self.capacity:
            self.entries.popitem(last=False)

cache = LRUCache(3)
for key in (1, 2, 3, 1, 4, 2, 5, 1):
    cache.request(key)
print(cache.hits, cache.misses, list(cache.entries))
```
Output:
```text
1 7 [2, 5, 1]
```
### javascript
```javascript
class TimedCache {
  constructor() {
    this.entries = new Map();
  }

  set(key, value, ttl, now) {
    this.entries.set(key, { value, expires: now + ttl });
  }

  get(key, now) {
    const entry = this.entries.get(key);
    if (!entry) return undefined;
    if (now >= entry.expires) {
      this.entries.delete(key);
      return undefined;
    }
    return entry.value;
  }
}

const cache = new TimedCache();
cache.set("a", 1, 5, 0);
cache.set("b", 2, 10, 0);
console.log(cache.get("a", 3), cache.get("a", 6), cache.get("b", 6), cache.get("b", 11));
```
Output:
```text
1 undefined 2 undefined
```

## quiz
1. Which entry does an LRU cache evict when it is full?
   - [ ] The newest entry
   - [x] The entry unused for the longest time
   - [ ] The largest entry
   - [ ] A random entry
   > Recency of use decides the order.
2. What does a read do in an LRU cache?
   - [ ] Nothing
   - [x] Moves the entry to the most recently used position
   - [ ] Deletes the entry
   - [ ] Doubles the capacity
   > Without this step the cache would behave like FIFO.
3. What is the hit ratio?
   - [ ] Misses divided by hits
   - [x] Hits divided by total requests
   - [ ] The cache size over the key count
   - [ ] Evictions over capacity
   > It measures how often requests find their entry.
4. How does a time to live affect a cached entry?
   - [ ] It increases capacity
   - [x] After its expiry time the entry counts as a miss
   - [ ] It protects the entry from eviction
   - [ ] It sorts the cache
   > Stale data is not returned.

# Design Hash Map
kind: algorithm
time: O(1) average for put, get and remove with a good hash function and a bounded load factor; O(n) worst case when every key lands in one bucket.
space: O(n + capacity) for the entries and the bucket array.
practice: group-anagrams-count

## intro
Designing a hash map from scratch is a classic interview exercise and the best way to understand what a dictionary does for you. You choose a bucket array, a hash function, a collision strategy and a resizing rule, and then implement put, get and remove without using the built in map.

## theory
Design decisions:

- Bucket array: a list of fixed or growing size; each bucket holds the entries that hash there
- Hash function: for integer keys, `key mod capacity` with a prime or power of two capacity (a bit mask is faster); for strings, a polynomial rolling hash such as `h = h · 31 + code` reduced modulo a large number
- Collision strategy: chaining (a small list per bucket) is the easiest to get right and handles deletions naturally
- Resizing: when `size / capacity` exceeds a load factor (0.75 is a common choice), double the capacity and reinsert every entry

Chaining implementation:

- `put(key, value)`: compute the bucket; scan the chain; if the key is found, replace its value; otherwise append a pair and increase the size; if the load factor is exceeded, resize
- `get(key)`: scan the chain of the bucket; return the value or a default (such as −1 or None) when absent
- `remove(key)`: scan the chain; if found, delete the pair and decrease the size
- Each operation scans only one chain, whose expected length is the load factor, so the cost is O(1) on average

Sample run: put (1, 1), put (2, 2), get 1 returns 1, get 3 returns −1 (absent), put (2, 1) updates the existing key, get 2 returns 1, remove 2, and get 2 returns −1. The size goes from 2 to 1.

Fixed-size variants in problem statements: if keys are integers in the range 0 to 10^6, a direct array of that size works as a map, with no hashing needed; for sets the same range fits in a bitset.

Open addressing alternative: keep all entries in the array and probe on collision; deletions require tombstones, and the load factor must stay lower (about 0.5 for linear probing). It uses less memory per entry and has better cache behaviour.

Checks for a correct design:

- Equal keys must give equal bucket indexes (use the key's equality and hash consistently)
- Negative integers: in some languages the remainder of a negative number is negative; normalise with `((h % m) + m) % m`
- Updating an existing key must not create a duplicate
- Resizing must reinsert using the new capacity, not copy buckets as they are
- Iteration order is unspecified; tests should not rely on it
- Keys that are mutable must not be modified while stored

Testing strategy: compare against the language dictionary with random operations (differential testing), include resize boundaries, and check size after updates and removals. For example, inserting 20 keys starting with 8 buckets triggers a resize at the 7th insertion (the load factor passes 0.75) and another at the 13th, leaving a capacity of 32; a 25th key would trigger the next one.

Extensions: iteration support, a generic hash for composite keys, thread safety with per-bucket locks, and shrink on deletions.

Why the exercise matters: it reveals that the speed of a dictionary depends on the hash quality and load factor, which is useful when you diagnose slow code that uses poorly hashed custom keys, such as objects with a constant hash.

## explain
1. Allocate an array of empty buckets and set the size to zero.
2. Hash the key and reduce it to a bucket index, normalising negatives.
3. For put, replace the value if the key exists in the bucket, otherwise append a pair.
4. For get and remove, scan the bucket for the key.
5. Resize and reinsert all entries when the load factor exceeds the limit.
6. Test updates, absent keys, removals and resizing against the built in dictionary.

## example
The Python class implements chaining with doubling, replays the sample operations and prints 1, −1, 1 and −1 for the reads, followed by the size and capacity after inserting 20 keys: 32 buckets. The JavaScript class stores pairs in buckets and checks the result of a long random sequence of operations against a Map, printing `true`.

## real
Standard library dictionaries, caches and symbol tables of compilers follow this structure, and interviewers use the exercise to check understanding of hashing and collisions.

## pros
- Shows exactly how a dictionary works
- Chaining is simple and handles deletions
- Easy to test against the built in map

## cons
- A hand-written table is slower than a tuned library
- Resizing logic is easy to get wrong
- Poor hash functions silently ruin performance

## uses
- Understanding dictionary internals
- Interview design exercises
- Custom tables with special key types
- Teaching hashing and collision handling

## mistakes
- Adding a duplicate pair instead of updating an existing key
- Copying buckets unchanged during a resize
- Using the remainder of a negative hash without normalising it
- Forgetting to decrease the size on removal

## interview
**Q:** How do you design a hash map from scratch?
**A:** Use an array of buckets, a hash function that maps keys to indexes, chaining or probing for collisions and a resize rule based on the load factor; implement put, get and remove so that each touches only one bucket.

**Q:** What must happen during a resize?
**A:** A larger bucket array is allocated and every entry is reinserted using the new capacity, because the bucket index depends on the capacity.

**Q:** When can a plain array replace a hash map?
**A:** When keys are small integers in a known range, because the key can be used directly as an index with no hashing or collisions.

## summary
A hand-built hash map combines a bucket array, a hash function, chaining or probing and a load factor driven resize. Update instead of duplicating, reinsert on resize and test against the built in dictionary.

## codenote
The Python sample implements chaining with resizing. The JavaScript sample tests a map against the built in Map.

## code
### python
```python
class MyHashMap:
    def __init__(self):
        self.buckets = [[] for _ in range(8)]
        self.size = 0

    def _bucket(self, key):
        return self.buckets[key % len(self.buckets)]

    def put(self, key, value):
        bucket = self._bucket(key)
        for pair in bucket:
            if pair[0] == key:
                pair[1] = value
                return
        bucket.append([key, value])
        self.size += 1
        if self.size / len(self.buckets) > 0.75:
            old = [pair for bucket in self.buckets for pair in bucket]
            self.buckets = [[] for _ in range(2 * len(self.buckets))]
            for k, v in old:
                self._bucket(k).append([k, v])

    def get(self, key):
        for k, v in self._bucket(key):
            if k == key:
                return v
        return -1

    def remove(self, key):
        bucket = self._bucket(key)
        for pair in bucket:
            if pair[0] == key:
                bucket.remove(pair)
                self.size -= 1
                return

table = MyHashMap()
table.put(1, 1)
table.put(2, 2)
print(table.get(1), table.get(3))
table.put(2, 1)
print(table.get(2))
table.remove(2)
print(table.get(2), table.size)
for key in range(100, 120):
    table.put(key, key)
print(table.size, len(table.buckets))
```
Output:
```text
1 -1
1
-1 1
21 32
```
### javascript
```javascript
class SimpleMap {
  constructor() {
    this.buckets = Array.from({ length: 8 }, () => []);
    this.size = 0;
  }

  index(key) {
    return ((key % this.buckets.length) + this.buckets.length) % this.buckets.length;
  }

  put(key, value) {
    const bucket = this.buckets[this.index(key)];
    const pair = bucket.find((p) => p[0] === key);
    if (pair) pair[1] = value;
    else {
      bucket.push([key, value]);
      this.size++;
      if (this.size / this.buckets.length > 0.75) this.resize();
    }
  }

  get(key) {
    const pair = this.buckets[this.index(key)].find((p) => p[0] === key);
    return pair ? pair[1] : undefined;
  }

  remove(key) {
    const bucket = this.buckets[this.index(key)];
    const at = bucket.findIndex((p) => p[0] === key);
    if (at >= 0) {
      bucket.splice(at, 1);
      this.size--;
    }
  }

  resize() {
    const old = this.buckets.flat();
    this.buckets = Array.from({ length: this.buckets.length * 2 }, () => []);
    old.forEach(([k, v]) => this.buckets[this.index(k)].push([k, v]));
  }
}

let seed = 7;
const random = () => (seed = (seed * 1103515245 + 12345) % 2147483648);
const mine = new SimpleMap();
const reference = new Map();
let same = true;
for (let step = 0; step < 2000; step++) {
  const key = (random() % 60) - 30;
  const action = random() % 3;
  if (action === 0) {
    mine.put(key, step);
    reference.set(key, step);
  } else if (action === 1) {
    mine.remove(key);
    reference.delete(key);
  } else if (mine.get(key) !== reference.get(key)) {
    same = false;
  }
}
console.log(same, mine.size === reference.size);
```
Output:
```text
true true
```

## quiz
1. What must a resize do with the existing entries?
   - [ ] Copy the buckets as they are
   - [x] Reinsert every entry using the new capacity
   - [ ] Delete them
   - [ ] Sort them by key
   > The bucket index depends on the capacity.
2. What should put do if the key already exists?
   - [ ] Add a second pair
   - [x] Replace the stored value
   - [ ] Raise an error
   - [ ] Ignore the call
   > Duplicates would make lookups ambiguous.
3. When can an array replace a hash map?
   - [ ] When keys are strings
   - [x] When keys are small integers in a known range
   - [ ] When keys are objects
   - [ ] Never
   > The key itself is the index.
4. What is the danger of key modulo capacity for negative keys in some languages?
   - [ ] It is always slower
   - [x] The remainder can be negative, which is an invalid index
   - [ ] It returns zero
   - [ ] It changes the key
   > Normalise the result to a non-negative index.

# Collision Handling Deep Dive
kind: algorithm
time: Expected O(1 + α) per operation for chaining with load factor α, and about 1/2 (1 + 1/(1 − α)) probes for a successful linear probing search and 1/2 (1 + 1/(1 − α)^2) for an unsuccessful one; worst cases are O(n).
space: O(n + m) for n entries and m buckets with chaining; open addressing stores entries in the array itself with m at least n.

## intro
When two keys hash to the same bucket, the table needs a rule for where the second one goes. The choice of that rule decides how performance degrades as the table fills, how deletions work and how well the table uses the CPU cache. This lesson compares chaining with linear probing, quadratic probing, double hashing and a few modern refinements.

## theory
Separate chaining: each bucket holds a collection of entries, normally a short linked list or a small dynamic array. Insert and search cost the chain length. With a uniform hash the expected chain length is the load factor α, so performance degrades gracefully, and α can exceed one. Costs: pointer overhead and poor cache locality. Chains can be turned into balanced trees (Java 8 does it beyond eight entries), which bounds the worst case at O(log n).

Open addressing: all entries live in the table; on a collision the algorithm probes a sequence of other slots.

- Linear probing: try index + 1, + 2, ... It has the best cache behaviour but suffers primary clustering, where runs of occupied slots grow and make later collisions more likely.
- Quadratic probing: try index + 1, + 4, + 9, ... (offsets i squared). It reduces primary clustering but keys with the same start follow the same sequence (secondary clustering), and it needs a table size that guarantees the sequence visits enough slots (a prime size and load factor below 0.5, or a power of two with triangular number offsets).
- Double hashing: a second hash function gives the step size, `index + i · h2(key)`, with h2 never zero and coprime with the table size. Keys with the same first slot usually follow different sequences, which avoids clustering at the cost of cache locality.
- Robin Hood hashing: during insertion, the entry that has travelled farther from its ideal slot takes the slot and the other continues, which evens out probe lengths
- Cuckoo hashing: each key has two possible slots from two hash functions; lookups check at most two places, inserts may kick out and relocate entries
- Hopscotch hashing and Swiss tables (used in Abseil and Rust's HashMap) use metadata bytes and SIMD to check many slots at once

Deletion: chaining removes the entry from the chain. Open addressing needs tombstones (or backward shifting in linear probing and Robin Hood schemes). Too many tombstones lengthen probes, so tables rehash when they pile up.

Worked example. Table size 11, with keys 5, 16, 27, 38, 49, all of which hash to slot 5 (key mod 11). Linear probing places them at 5, 6, 7, 8 and 9 and uses 1 + 2 + 3 + 4 + 5 = 15 probes in total, since each new key must skip all earlier ones. Quadratic probing visits 5, 6, 9, 3 and so on, but because all five keys share the same start they also share the same sequence (secondary clustering), so it needs 15 probes too. Double hashing with the step 7 − (key mod 7) spreads the keys because each has a different step, and it needs only 9 probes. Chaining places all five in one chain of length 5, so the same pathology shows, but each insert costs only the length of the chain, 1 + 2 + 3 + 4 + 5 comparisons for a worst case.

Poor hash functions turn any strategy into a linear scan. The second experiment uses chaining with ten keys that are multiples of 4: with `key mod 4` all ten keys fall into bucket 0 (chain lengths 10, 0, 0, 0), while `key mod 7` spreads them, giving chain lengths of at most two. Using a prime modulus or mixing bits avoids patterns in the keys.

Choosing a strategy:

- Chaining: simple, tolerant of high load, easy deletion; the default in many textbooks
- Linear probing with a good hash and load below 0.7: fastest in practice for small keys because of cache locality
- Double hashing or Robin Hood: when clustering matters
- Cuckoo: when worst-case lookup time matters more than insertion cost

Attack resistance: randomised seeds and hash functions such as SipHash defend against collision flooding.

## explain
1. Choose chaining or an open addressing probe sequence.
2. For chaining, append to the bucket list and search it on lookups.
3. For probing, define the sequence of slots to try for a key and stop at the first empty slot.
4. Handle deletions with removal from chains or tombstones.
5. Watch the load factor and resize before clustering becomes severe.
6. Measure probe counts or chain lengths on realistic keys.

## example
The Python program inserts the keys 5, 16, 27, 38 and 49, which all hash to slot 5 in a table of size 11, with linear probing, quadratic probing and double hashing and prints the total number of probes for each. The JavaScript program prints the chain lengths of ten multiples of 4 under `key mod 4` and under `key mod 7`.

## real
Python dictionaries use open addressing with a perturbed probe sequence, Java's HashMap uses chaining with trees, Rust and C++ libraries use Swiss tables, and network routers use cuckoo hashing for fast lookups.

## pros
- Each strategy offers a different balance of speed and simplicity
- Chaining degrades gracefully above load factor one
- Open addressing is cache friendly

## cons
- Linear probing clusters as the table fills
- Open addressing needs tombstones for deletion
- Double hashing and cuckoo hashing are more complex

## uses
- Choosing the design of a custom hash table
- Understanding the performance of library maps
- Tuning load factors and resize thresholds
- Defending against collision attacks

## mistakes
- Letting an open addressing table fill beyond a load factor of about 0.7
- Using a step size of zero or a step that shares a factor with the table size in double hashing
- Choosing a key pattern that interacts badly with the modulus
- Forgetting that tombstones also count as occupied for load calculations

## interview
**Q:** What is the difference between chaining and open addressing?
**A:** Chaining keeps colliding entries in a list inside each bucket, while open addressing stores all entries in the array and probes other slots when the first one is taken.

**Q:** What does primary clustering mean in linear probing?
**A:** In linear probing, occupied slots form long contiguous runs, and any key that hashes into a run must probe to its end, which makes the run grow even faster.

**Q:** How does double hashing avoid clustering?
**A:** A second hash function determines the step between probes, so keys that share the first slot usually follow different probe sequences.

## summary
Collision handling is chaining or one of several open addressing probe sequences, each trading simplicity, cache behaviour and clustering. Keep the load factor in check, use a good hash and plan for deletions.

## codenote
The Python sample counts probes for three strategies. The JavaScript sample shows chain lengths under good and poor hashing.

## code
### python
```python
SIZE = 11
KEYS = [5, 16, 27, 38, 49]

def total_probes(step):
    slots = [None] * SIZE
    total = 0
    for key in KEYS:
        i = 0
        while True:
            index = (key % SIZE + step(key, i)) % SIZE
            total += 1
            if slots[index] is None:
                slots[index] = key
                break
            i += 1
    return total

linear = total_probes(lambda key, i: i)
quadratic = total_probes(lambda key, i: i * i)
double = total_probes(lambda key, i: i * (7 - key % 7))
print(linear, quadratic, double)
```
Output:
```text
15 15 9
```
### javascript
```javascript
function chainLengths(keys, buckets) {
  const lengths = Array(buckets).fill(0);
  for (const key of keys) lengths[key % buckets]++;
  return lengths;
}

const keys = Array.from({ length: 10 }, (_, i) => 4 * (i + 1));
console.log(chainLengths(keys, 4).join(" "));
console.log(chainLengths(keys, 7).join(" "));
```
Output:
```text
10 0 0 0
1 2 1 1 2 2 1
```

## quiz
1. How does separate chaining handle a collision?
   - [ ] By probing other slots
   - [x] By appending the entry to the bucket's list
   - [ ] By discarding the new key
   - [ ] By doubling the table at once
   > Each bucket can hold several entries.
2. What problem does quadratic probing reduce compared with linear probing?
   - [ ] Deletion cost
   - [x] Primary clustering
   - [ ] Memory use
   - [ ] Hash computation
   > The probe offsets grow faster than one slot at a time.
3. What determines the step in double hashing?
   - [ ] A constant
   - [x] A second hash function of the key
   - [ ] The table size only
   - [ ] The previous key
   > Different keys follow different probe sequences.
4. Why can a bad hash function ruin any collision strategy?
   - [ ] It changes the table size
   - [x] It sends most keys to the same slots, so probes or chains become long
   - [ ] It disables resizing
   - [ ] It makes keys mutable
   > Collision handling cannot repair a poor distribution.

# Amortized O1 Operations
kind: concept
time: Not an algorithmic topic — amortized analysis is a way of accounting for cost. For example, appending n items to a doubling dynamic array costs O(n) in total, so O(1) amortised per append, even though an individual append may cost O(n).
space: Not an algorithmic topic — amortised guarantees often trade extra memory for speed, such as keeping up to twice as much capacity as items.

## intro
Some operations are cheap almost every time and expensive on rare occasions, such as adding to a dynamic array or a hash table that occasionally resizes. Amortised analysis averages the cost over a whole sequence of operations, which is why we can say that appending to a list or inserting into a hash map takes constant time even though a single insert can take linear time.

## theory
Definition: the amortised cost of an operation is the total cost of a sequence of n operations divided by n, taken in the worst case over all sequences. It is a guarantee about the sequence, not about the average over random inputs; no probability is involved.

Three standard methods:

- Aggregate method: compute the total cost of n operations and divide. Doubling array: resizes copy 1, 2, 4, 8, ... items. After n appends the total copies are less than 2n, because 1 + 2 + 4 + ... + n/2 < n and the final resize is at most n, so the total work is at most 3n and the amortised cost per append is at most 3, a constant.
- Accounting (banker's) method: charge each operation a little extra and bank the surplus as credit that pays for later expensive operations. Charge 3 units per append: 1 pays for the append, 1 pays for copying this item at the next resize and 1 pays for copying one of the old items that has no credit left.
- Potential method: define a potential function on the data structure state (for example twice the number of items minus the capacity) and show that amortised cost equals actual cost plus the change in potential.

Examples:

- Dynamic array append: O(1) amortised with doubling (any constant growth factor above 1 works; a constant additive increase does not, because copying then costs quadratic total time)
- Hash table insert: O(1) amortised with resizing when the load factor passes a threshold; the rehash of n items happens after Θ(n) inserts
- Stack with multipop: each element is pushed once and popped at most once, so any sequence of n operations costs O(n), amortised O(1) each
- Binary counter increment: flipping bits costs O(k) in the worst case, but the total for n increments is O(n), since bit i flips n / 2^i times
- Queue from two stacks: each item moves between stacks at most once
- Monotonic stack algorithms: the inner while loop is paid for by the pushes
- Union find with path compression and union by rank: O(α(n)) amortised per operation, where α is the inverse Ackermann function

Why it matters:

- Real-time systems: amortised O(1) does not bound the latency of a single operation; a resize can pause for milliseconds. Use incremental resizing, preallocation or worst-case bounded structures when latency matters.
- Persistent or shared structures: amortised guarantees can fail if old versions are reused (the expensive operation can be repeated on the same state), so persistent data structures need different analysis
- Adversarial inputs: the guarantee holds for every sequence, including adversarial ones, as long as the structure's rules are followed; it does not hold for randomised expected costs, which are a separate notion

Common misconceptions: amortised does not mean average case (no input distribution) and does not mean that each operation is cheap; shrinking policies must also be designed so that alternating insert and delete near a threshold does not cause repeated resizing (shrink at one quarter, not one half).

Measuring: count the elementary steps (copies, probes) in a test harness for n insertions and divide by n; the ratio should approach a constant as n grows. For a doubling array of 1000 appends the number of copied items is 1023 in total.

## explain
1. Identify the cheap common operation and the rare expensive one.
2. Compute or bound the total cost of n operations by summing the expensive ones.
3. Divide by n to obtain the amortised cost per operation.
4. Alternatively assign credits (accounting) or a potential function and verify they never go negative.
5. Check that the growth factor is multiplicative, not additive.
6. State whether single operation latency matters for the application.

## example
The Python program appends 1000 items to a doubling array and reports the total number of copied items and the ratio to n, showing the total stays under 2n. The JavaScript program inserts 1000 keys into a hash table that doubles at load factor 0.75 and prints the total number of rehash moves, 1530 for 1000 inserts, and the final capacity 2048, a ratio of 1.53 moves per insert.

## real
Language runtimes use amortised growth for lists and strings, databases batch index maintenance, and garbage collectors spread large cleanups over many allocations to keep pauses short.

## pros
- Explains why simple growth strategies are efficient
- Gives guarantees for worst-case sequences
- Applies to many structures such as arrays, tables and stacks

## cons
- Single operations can still be slow
- Guarantees can break for persistent versions
- Easily confused with average case analysis

## uses
- Costing array growth and table rehashing over a long sequence
- Justifying multipop and counter algorithms
- Designing resizing and shrinking policies
- Justifying constant time claims for growing containers

## mistakes
- Equating amortised cost with expected cost over random inputs
- Growing a dynamic array by a fixed amount and expecting constant amortised cost
- Shrinking at half capacity and causing repeated resizing
- Ignoring latency spikes in real-time code

## interview
**Q:** Why does doubling make list appends cheap on average over a sequence?
**A:** The array doubles when full, so the total copying over n appends is at most about 2n; spreading it over n operations gives a constant cost per append even though one append may copy every item.

**Q:** What is the difference between amortised and average case cost?
**A:** Amortised cost is a worst-case guarantee over any sequence of operations with no randomness, while average case cost depends on a probability distribution over inputs.

**Q:** Why must a dynamic array grow geometrically rather than by a fixed increment?
**A:** With a fixed increment the number of resizes grows linearly with n, so the total copying becomes quadratic and appends are no longer constant amortised.

## summary
Amortised analysis averages cost over a worst-case sequence, which shows that doubling arrays and resizing hash tables take constant time per operation even though occasional operations are expensive. Use geometric growth and remember that single operations may still be slow.

## codenote
The Python sample counts copies in a doubling array. The JavaScript sample counts rehash moves in a hash table.

## code
### python
```python
def append_many(count):
    capacity, size, copies = 1, 0, 0
    for _ in range(count):
        if size == capacity:
            copies += size
            capacity *= 2
        size += 1
    return copies

copies = append_many(1000)
print(copies, round(copies / 1000, 3), copies < 2 * 1000)
```
Output:
```text
1023 1.023 True
```
### javascript
```javascript
function insertMany(count) {
  let capacity = 8;
  let size = 0;
  let moves = 0;
  for (let i = 0; i < count; i++) {
    size++;
    if (size / capacity > 0.75) {
      moves += size - 1;
      capacity *= 2;
    }
  }
  return [moves, capacity];
}

const [moves, capacity] = insertMany(1000);
console.log(moves, capacity, (moves / 1000).toFixed(2));
```
Output:
```text
1530 2048 1.53
```

## quiz
1. What does amortised O(1) mean?
   - [ ] Every operation takes constant time
   - [x] A sequence of n operations costs O(n) in total
   - [ ] The average over random inputs is constant
   - [ ] The operation never allocates memory
   > Occasional expensive operations are paid for by many cheap ones.
2. Why does doubling give constant amortised appends?
   - [ ] It avoids copying
   - [x] The total copying is less than twice the number of items
   - [ ] It uses linked lists
   - [ ] It sorts the array
   > Geometric growth makes resizes rare.
3. Why is growing by a fixed amount a poor policy?
   - [ ] It wastes no memory
   - [x] The total copying becomes quadratic
   - [ ] It breaks the hash function
   - [ ] It only works for strings
   > Resizes occur after a constant number of inserts.
4. Which statement about amortised analysis is true?
   - [ ] It uses random inputs
   - [x] It gives a worst-case guarantee over any sequence of operations
   - [ ] It bounds each single operation
   - [ ] It applies only to arrays
   > No probability distribution is involved.

# Hash Map vs Tree Map
kind: concept
time: Not an algorithmic topic — this lesson compares two structures. Hash maps give O(1) expected point operations; tree maps (balanced search trees) give O(log n) for point operations and also support ordered queries such as floor, ceiling and range scans.
space: Not an algorithmic topic — both use O(n) memory; hash tables keep spare capacity, tree nodes carry pointers and balance data.

## intro
Both structures map keys to values, but they answer different questions. A hash map is the fastest way to find one key and tells you nothing about order. A tree map keeps keys sorted, so it can answer which key is the next larger one or what lies in a range, at the cost of logarithmic operations. Choosing between them is a matter of the queries your program needs.

## theory
Hash map (hash table): unordered, O(1) expected get, put and remove, O(n) worst case, requires hashable keys with consistent equality, iteration order unspecified (or insertion order in Python and JavaScript). Resizing causes occasional pauses.

Tree map (balanced binary search tree, such as a red-black tree): keys kept in sorted order, O(log n) guaranteed worst-case get, put and remove, requires keys that can be compared (a total order), iterates keys in sorted order. Examples: `TreeMap` in Java, `std::map` in C++, `SortedDict` in the Python `sortedcontainers` library. JavaScript and Python have no built in tree map.

What a tree map adds, beyond lookup:

- Ordered iteration: all keys from smallest to largest in O(n)
- Floor and ceiling: the largest key at most x, the smallest key at least x
- Lower and higher: the strictly smaller and strictly larger neighbours
- Range queries: all keys between a and b in O(log n + output size)
- Min, max, pop first and pop last in O(log n)
- Rank and select with an order statistics tree
- Nearest neighbour lookups, such as finding the closest timestamp or price

With sorted keys 10, 20, 30, 40, the floor of 25 is 20, the ceiling of 25 is 30, the floor of 5 does not exist and the ceiling of 45 does not exist. A binary search on a sorted array of keys gives floor and ceiling in O(log n); the sorted array is a static tree map, with O(n) inserts.

When a hash map is better:

- Only equality lookups are needed (cache, symbol table, counting, deduplication)
- Keys have no natural order, or comparison is expensive
- Speed matters at large scale: hash lookups are typically several times faster for small keys
- Latency spikes from resizing are tolerable

When a tree map is better:

- You need sorted iteration, ranges, neighbours or the minimum and maximum
- You need worst-case guarantees, not expected ones (no hash flooding, no resize spike)
- Keys have a natural order but poor hash functions
- Implementing calendars, order books, interval schedules and leaderboards by score

Hybrids: Python dictionaries keep insertion order, which is not sorted order; `LinkedHashMap` keeps insertion or access order; a hash map plus a heap supports the minimum with lazy deletion; a hash map plus a sorted list (with bisect) supports occasional range queries when updates are rare.

Other ordered structures: skip lists (used in Redis sorted sets and some concurrent maps), B-trees (databases and file systems, cache friendly for large data) and tries for string keys with prefix queries.

Concurrency: concurrent hash maps shard locks by bucket; concurrent ordered maps are harder, often skip lists.

Complexity summary: hash map O(1) average and O(n) worst case; tree map O(log n) worst case; ordered queries only in the tree map.

## explain
1. List the queries the program needs: exact lookups, ordered iteration, neighbours or ranges.
2. Choose a hash map if only exact lookups matter.
3. Choose a tree map or a sorted array if order based queries are needed.
4. Check whether the keys can be hashed or compared consistently.
5. Consider the update rate: sorted arrays are fine for rare updates.
6. Measure with realistic data if performance is critical.

## example
The Python program answers floor and ceiling queries with the `bisect` module over sorted keys, giving floor 20 and ceiling 30 for the query 25, and it shows that the floor of 5 and the ceiling of 45 do not exist. The JavaScript program counts how many keys fall in the range 15 to 35 with two binary searches, getting 2 for the keys 10, 20, 30, 40.

## real
Order books in trading systems use sorted maps keyed by price, calendars find the next free slot with ceiling queries, and leaderboards use sorted structures for ranks, while caches and symbol tables use hash maps.

## pros
- Hash maps give the fastest exact lookups
- Tree maps give ordered queries and worst-case bounds
- Hybrids let you combine both strengths

## cons
- Hash maps cannot answer order or range questions
- Tree maps are slower for plain lookups
- Neither structure is available everywhere as a built in

## uses
- Choosing a map for a feature
- Floor and ceiling queries on timestamps or prices
- Range counting on sorted keys
- Explaining trade-offs in design interviews

## mistakes
- Using a hash map and then sorting the keys on every query
- Choosing a tree map when only equality lookups are needed
- Assuming insertion order equals sorted order
- Using keys with no consistent comparison in a tree map

## interview
**Q:** When would you choose a tree map over a hash map?
**A:** When you need keys in sorted order, range queries, floor and ceiling lookups or the minimum and maximum, or when you need worst-case O(log n) guarantees instead of expected O(1).

**Q:** What are the complexities of point operations in each?
**A:** A hash map has O(1) expected and O(n) worst case for get, put and remove, while a balanced tree map has O(log n) in the worst case for each.

**Q:** How can you answer floor and ceiling queries without a tree map?
**A:** Keep the keys in a sorted array and use binary search, which is O(log n) per query, accepting O(n) cost for inserting new keys.

## summary
Hash maps provide O(1) expected exact lookups with no order, while tree maps keep keys sorted and add floor, ceiling and range queries at O(log n). Pick the structure from the queries the program needs.

## codenote
The Python sample answers floor and ceiling queries with bisect. The JavaScript sample counts keys in a range.

## code
### python
```python
import bisect

keys = [10, 20, 30, 40]

def floor(x):
    i = bisect.bisect_right(keys, x)
    return keys[i - 1] if i else None

def ceiling(x):
    i = bisect.bisect_left(keys, x)
    return keys[i] if i < len(keys) else None

print(floor(25), ceiling(25), floor(5), ceiling(45))
```
Output:
```text
20 30 None None
```
### javascript
```javascript
function lowerBound(sorted, x) {
  let low = 0;
  let high = sorted.length;
  while (low < high) {
    const mid = (low + high) >> 1;
    if (sorted[mid] < x) low = mid + 1;
    else high = mid;
  }
  return low;
}

function countInRange(sorted, from, to) {
  return lowerBound(sorted, to + 1) - lowerBound(sorted, from);
}

console.log(countInRange([10, 20, 30, 40], 15, 35), countInRange([10, 20, 30, 40], 41, 50));
```
Output:
```text
2 0
```

## quiz
1. Which structure keeps keys in sorted order?
   - [ ] A hash map
   - [x] A tree map
   - [ ] A set of strings
   - [ ] A queue
   > A balanced search tree orders its keys.
2. What is the ceiling of 25 in the sorted keys 10, 20, 30, 40?
   - [ ] 20
   - [x] 30
   - [ ] 40
   - [ ] 25
   > The ceiling is the smallest key at least the query.
3. What is the worst-case cost of a point operation in a balanced tree map?
   - [ ] O(1)
   - [x] O(log n)
   - [ ] O(n)
   - [ ] O(n squared)
   > The tree height stays logarithmic.
4. When is a hash map the better choice?
   - [ ] When range queries are required
   - [x] When only exact key lookups are needed and speed matters
   - [ ] When keys must be sorted
   - [ ] When keys cannot be hashed
   > It gives the fastest point operations.

# Hash Table Interview Patterns
kind: concept
time: Not an algorithmic topic — this lesson reviews patterns. Most hash table solutions run in O(n) time by replacing a nested search with one expected O(1) lookup per item.
space: Not an algorithmic topic — the trade is typically O(n) extra space for the table in exchange for removing a loop, which interviewers expect you to state.

## intro
Many interview problems that look quadratic collapse to linear time with a hash table: instead of searching the rest of the data for a partner, you remember what you have seen and look the partner up. Recognising the lookup patterns, complement, seen set, count table, canonical key and prefix map, is most of the work.

## theory
Pattern 1: complement lookup. For each element ask whether the value that completes it has been seen. Two sum: for the array 2, 7, 11, 15 and target 9, when 7 arrives the complement 2 is in the map at index 0, so the answer is the index pair 0 and 1. Cost O(n) time and O(n) space, replacing the O(n squared) pair loop.

Pattern 2: seen set. Detect duplicates, the first repeated element, the first recurring character, cycles in sequences and visited states in searches. A variant is the duplicate within distance k: keep the last index of each value in a map and check the gap. For `1, 2, 3, 1` with k = 3 the answer is true, while for `1, 0, 1, 1` with k = 1 it is true and for `1, 2, 3, 1, 2, 3` with k = 2 it is false.

Pattern 3: count table. Frequency counting, anagram checks, majority and top k elements, sliding window matching with counts.

Pattern 4: canonical key grouping. Group anagrams by sorted letters, group shifted strings, map equivalent records to one normalised key.

Pattern 5: prefix sum map. Count subarrays with a target sum or a given remainder by storing prefix sums and their counts or first indices.

Pattern 6: bijection checks. Isomorphic strings and word pattern problems keep two maps (one for each direction), so that no two characters map to the same target and no character maps to two targets. `egg` and `add` are isomorphic, `foo` and `bar` are not, and `paper` and `title` are; but `badc` and `baba` are not, because the letters b and d would both map to b, which a one direction map would miss.

Pattern 7: index lookup. Store the position of each value so you can jump to it: find the next greater element for a subset, build a tree from preorder and inorder traversals (map from value to inorder index), or answer queries about the last occurrence.

Pattern 8: caches and design. LRU cache, design a hash map, time-based key value store (map of key to a sorted list of (time, value) with binary search), insert, delete and get random in O(1) (array plus map of value to index, swapping with the last element on delete).

Pattern 9: hashing for equality of large objects. Rolling hash for substring search (Rabin-Karp), hashing rows or subtrees to detect duplicates, and checking duplicate subtrees by serialisation as the key.

How to talk about it:

- Name the pattern and the invariant: the table holds everything seen before the current element
- State the cost: O(n) time, O(n) space, and mention the O(n squared) brute force or O(n log n) sorting alternative and when each is preferable (sorting avoids the extra memory, and sorted input allows two pointers with O(1) space)
- Mention collisions and worst case briefly, and say that hash keys must be immutable
- Ask about the input: duplicates, negative numbers, the size of the data, whether order matters and whether the output indices or values are needed

Common traps: using the same element twice in two sum (insert after checking), mapping in one direction only for isomorphism, treating zero as missing because of falsy checks, and mutating a list that is used as a key.

Testing checklist: empty input, one element, all equal elements, no answer, multiple answers and negative values.

## explain
1. Identify what you need to look up for each element: a complement, a previous occurrence, a count or a key.
2. Decide what the table maps from and to.
3. Check the table before inserting the current element when the same element must not pair with itself.
4. Update the table as you go in one pass.
5. State the time and space complexity and the alternatives.
6. Test duplicates, negatives and absent answers.

## example
The Python program solves two sum with a map from value to index, returning the indices 0 and 1 for `2, 7, 11, 15` and target 9, and it answers the duplicate within distance k questions. The JavaScript program checks isomorphic strings with two maps and prints `true`, `false`, `true` and `false` for the pairs `egg`/`add`, `foo`/`bar`, `paper`/`title` and `badc`/`baba`.

## real
Fraud detection looks up transactions by key, compilers map names to symbols, and recommendation systems join records through hash lookups, using the same patterns that interviews test.

## pros
- A few patterns cover most hash table questions
- Each pattern turns a nested loop into a single pass
- Easy to explain with a clear invariant

## cons
- Extra memory is required
- Edge cases with duplicates and falsy values are easy to miss
- Worst-case behaviour is rarely discussed but can matter

## uses
- Rehearsing hash table interview questions
- Choosing between hashing, sorting and two pointers
- Reviewing solutions that use dictionaries and sets
- Teaching the space for time trade-off

## mistakes
- Inserting the current element before checking for its complement and pairing it with itself
- Using one direction mapping for isomorphic strings
- Treating a stored zero as absent with a falsy check
- Forgetting to clear or reset tables between test cases

## interview
**Q:** How do you solve two sum in O(n)?
**A:** Scan once with a map from value to index; for each number look up target minus the number in the map, return the stored index and the current index if found, otherwise store the number.

**Q:** How do you check whether two strings are isomorphic?
**A:** Map each character of the first string to the character at the same position of the second string and also keep the reverse mapping, failing if any character would map to two different characters in either direction.

**Q:** What is the trade-off of using a hash table in these problems?
**A:** You trade O(n) extra space for removing an inner loop, bringing the time from O(n squared) to O(n); sorting uses less space but costs O(n log n).

## summary
Hash table interview problems reduce to complement lookups, seen sets, count tables, canonical keys, prefix maps and bijection checks. State the invariant, give the space for time trade-off and test duplicates and absent answers.

## codenote
The Python sample covers two sum and nearby duplicates. The JavaScript sample checks isomorphic strings.

## code
### python
```python
def two_sum(numbers, target):
    seen = {}
    for index, number in enumerate(numbers):
        if target - number in seen:
            return seen[target - number], index
        seen[number] = index
    return None

def nearby_duplicate(numbers, distance):
    last = {}
    for index, number in enumerate(numbers):
        if number in last and index - last[number] <= distance:
            return True
        last[number] = index
    return False

print(two_sum([2, 7, 11, 15], 9), two_sum([1, 2], 10))
print(nearby_duplicate([1, 2, 3, 1], 3), nearby_duplicate([1, 0, 1, 1], 1), nearby_duplicate([1, 2, 3, 1, 2, 3], 2))
```
Output:
```text
(0, 1) None
True True False
```
### javascript
```javascript
function isomorphic(a, b) {
  if (a.length !== b.length) return false;
  const forward = new Map();
  const backward = new Map();
  for (let i = 0; i < a.length; i++) {
    if (forward.has(a[i]) && forward.get(a[i]) !== b[i]) return false;
    if (backward.has(b[i]) && backward.get(b[i]) !== a[i]) return false;
    forward.set(a[i], b[i]);
    backward.set(b[i], a[i]);
  }
  return true;
}

console.log(isomorphic("egg", "add"), isomorphic("foo", "bar"), isomorphic("paper", "title"), isomorphic("badc", "baba"));
```
Output:
```text
true false true false
```

## quiz
1. What does the table hold during a two sum scan?
   - [ ] The final answer
   - [x] The numbers seen so far with their indices
   - [ ] The sorted array
   - [ ] The target only
   > Each new number looks up its complement among earlier numbers.
2. Why does isomorphism checking need two maps?
   - [ ] To double the speed
   - [x] To forbid two characters from mapping to the same target as well as one character mapping to two targets
   - [ ] To count letters
   - [ ] To sort the strings
   > A single direction misses collisions on the target side.
3. What does the hash table trade away for linear time?
   - [ ] Correctness
   - [x] Extra memory proportional to the input
   - [ ] Readability only
   - [ ] The ability to read the input
   > Sorting would use less space but more time.
4. Why must the complement be checked before storing the current element in two sum?
   - [ ] To keep the map sorted
   - [x] So an element cannot be paired with itself
   - [ ] To avoid hashing twice
   - [ ] To save memory
   > Otherwise a target of twice a number would match the same position.
