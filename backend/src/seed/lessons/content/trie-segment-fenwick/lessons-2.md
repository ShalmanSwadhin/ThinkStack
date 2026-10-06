# Segment Tree Range Update
kind: algorithm
time: O(log n) for a range update that stores tags on O(log n) covering nodes and O(log n) for a point query that adds the tags along one root to leaf path; a range update on a plain array costs O(length of the range).
space: O(n) for the tag array, 2n cells in the iterative layout.
viz: segment-tree-demo

## intro
Point updates are easy for a segment tree, but what if a whole range of elements must change at once, such as adding 10 to every element from index 1 to 3? Changing each element costs the length of the range. A segment tree can record the change once on the few nodes that exactly cover the range, which turns a range update into a logarithmic operation, at least for questions that ask about single elements afterwards.

## theory
Canonical decomposition: any range `[l, r]` can be split into at most about 2 log n tree nodes whose ranges are disjoint and together equal the range. The same decomposition is used for range queries; here it tells you where to leave a note.

Range add with point queries (no lazy propagation needed):

- Store at each node a tag `add[node]`, the amount added to every element of the node's range
- `update(l, r, value)`: descend as in a range query; at every node that is completely inside `[l, r]`, add the value to its tag and stop (do not descend further); at partially overlapping nodes recurse into both children
- `point_query(i)`: walk from the root to the leaf of index i, summing the tags of all nodes on the path, and add the original array value

The answer for element i is its original value plus the sum of the tags of its ancestors (including itself), because every update that covers i placed its tag on exactly one ancestor of the leaf i.

Example: the array `[1, 2, 3, 4, 5, 6]`; add 10 to indices 1 to 3; add 5 to indices 2 to 5. The element values become `[1, 12, 18, 19, 10, 11]`. Each update touched only a few nodes rather than 3 or 4 elements, and the gap grows with the size of the range: for n = 1,000,000 a range update touches at most about 40 nodes instead of up to a million elements.

The iterative version: with leaves at `tree[n + i]`, a range update on `[l, r)` runs `l += n; r += n` and loops while `l < r`: if `l` is odd add to `tree[l]` and increment `l`; if `r` is odd decrement `r` and add to `tree[r]`; halve both. A point query sums `tree[i + n]` and all its ancestors up to the root: `for (p = i + n; p >= 1; p >>= 1) result += tree[p]`. For n = 1024 and the range `[1, 1023)` the update touches 18 nodes.

Limits of this scheme: it answers queries about single elements. Queries about the aggregate of a range (the sum of a range after range additions) need the number of elements each tag covers, or lazy propagation, covered in the next lesson. For range minimum or maximum with range add, the tags can be kept in a separate array and combined along the path, but the node values must also be corrected; lazy propagation handles it uniformly.

Variants of updates:

- Range assign: set every element of a range to a value; tags need a "latest assignment wins" rule with timestamps or an assign marker that overrides earlier add tags
- Range multiply and add (affine updates): compose functions on the tags
- Range xor or toggle for boolean arrays
- Difference array alternative: store `d[i] = a[i] − a[i − 1]`; a range add becomes two point updates, and a point query becomes a prefix sum of d, which a Fenwick tree handles with less code (next lessons)

Complexity comparison:

- Plain array: update O(range length), point query O(1)
- Prefix difference array: update O(1), point query O(n) (prefix sum), or O(1) after one pass if updates are offline
- Segment tree with tags: update O(log n), point query O(log n), balanced
- Fenwick tree on the difference array: update O(log n), point query O(log n), simpler

When updates are all known before queries, a difference array and one prefix sum pass solve everything in O(n + updates); the segment tree is for interleaved updates and queries.

Pitfalls: forgetting to include the tags of all ancestors in the query, applying the update to fully covered nodes and then also descending into them, off-by-one errors between inclusive and half open ranges, and mixing point query answers with range aggregates.

Testing: random updates and queries compared with a brute-force array; include single element ranges, the whole array and overlapping updates.

## explain
1. Keep a tag array with one tag per node, initially zero.
2. For a range update, descend and add the value to the tag of each node fully inside the range.
3. Do not recurse below a node that received the tag.
4. For a point query, sum the tags along the path from the root to the leaf.
5. Add the original element value to that sum.
6. Compare with a brute-force array under random updates.

## example
The Python class applies the two range additions to `[1, 2, 3, 4, 5, 6]` and prints the element values 1, 12, 18, 19, 10, 11. The JavaScript program counts how many tag cells an iterative range update touches for ranges of a tree with 1024 leaves and compares it with the number of elements in the range.

## real
Calendar and booking systems add a delta to a range of time slots, graphics code adds brightness to a range of pixels in a row and analytics code applies adjustments over ranges of days.

## pros
- Logarithmic range updates instead of linear
- No lazy machinery needed for point queries
- The same decomposition as range queries

## cons
- Only answers single element queries without more machinery
- Range aggregates need lazy propagation or counts
- Off-by-one mistakes in range bounds are common

## uses
- Adding a value to a range with later point lookups
- Offline and online difference style updates
- Teaching canonical decomposition
- Preparing for lazy propagation

## mistakes
- Descending below a node that already received the tag
- Forgetting the tags of the ancestors during a point query
- Mixing inclusive and half open ranges between update and query
- Expecting range sums from tags that store only per element amounts

## interview
**Q:** How can a segment tree perform range add with point queries in O(log n)?
**A:** Place the added value as a tag on the O(log n) nodes that exactly cover the range, and answer a point query by summing the tags of all ancestors of the leaf plus the original value.

**Q:** Why does the point query need the tags of all ancestors?
**A:** An update covering the element placed its tag on exactly one ancestor of that element's leaf, so the full effect is the sum along the path.

**Q:** When is a difference array enough?
**A:** When all range updates are known before the queries, because applying all difference changes and taking one prefix sum gives every element in O(n) total.

## summary
A segment tree can add a value to a range by tagging the O(log n) nodes that cover it, and a point query sums the tags on the leaf's path. Range aggregates need lazy propagation, which the next lesson adds.

## codenote
The Python sample applies range additions with tags. The JavaScript sample counts touched nodes.

## code
### python
```python
class RangeAddTree:
    def __init__(self, values):
        self.n = len(values)
        self.values = list(values)
        self.add = [0] * (4 * self.n)

    def update(self, ql, qr, value, node=1, left=0, right=None):
        right = self.n - 1 if right is None else right
        if qr < left or right < ql:
            return
        if ql <= left and right <= qr:
            self.add[node] += value
            return
        mid = (left + right) // 2
        self.update(ql, qr, value, 2 * node, left, mid)
        self.update(ql, qr, value, 2 * node + 1, mid + 1, right)

    def point(self, index):
        node, left, right, total = 1, 0, self.n - 1, self.values[index]
        while True:
            total += self.add[node]
            if left == right:
                return total
            mid = (left + right) // 2
            if index <= mid:
                node, right = 2 * node, mid
            else:
                node, left = 2 * node + 1, mid + 1

tree = RangeAddTree([1, 2, 3, 4, 5, 6])
tree.update(1, 3, 10)
tree.update(2, 5, 5)
print([tree.point(i) for i in range(6)])
```
Output:
```text
[1, 12, 18, 19, 10, 11]
```
### javascript
```javascript
function touched(n, from, to) {
  let count = 0;
  for (let l = from + n, r = to + n; l < r; l >>= 1, r >>= 1) {
    if (l & 1) {
      count++;
      l++;
    }
    if (r & 1) {
      r--;
      count++;
    }
  }
  return count;
}

const n = 1024;
console.log(touched(n, 1, 1023), 1022, touched(n, 0, 1024), touched(n, 5, 6));
```
Output:
```text
18 1022 1 1
```

## quiz
1. Where does a range update leave its tag?
   - [ ] On every leaf in the range
   - [x] On the O(log n) nodes that exactly cover the range
   - [ ] Only on the root
   - [ ] On the parents of the leaves
   > The covering nodes together equal the range.
2. How is a point query answered?
   - [ ] By reading one leaf only
   - [x] By summing the tags on the path from the root to the leaf plus the original value
   - [ ] By summing the whole tree
   - [ ] By rebuilding the tree
   > Each covering update tagged exactly one ancestor.
3. What is the cost of a range update on a plain array?
   - [ ] O(1)
   - [x] O(length of the range)
   - [ ] O(log n)
   - [ ] O(n squared)
   > Every element is changed separately.
4. When can a difference array replace the segment tree?
   - [ ] When queries and updates are interleaved
   - [x] When all updates are known before the queries
   - [ ] Never
   - [ ] Only for minimum queries
   > One prefix sum pass then yields every element.

# Lazy Propagation
kind: algorithm
time: O(log n) for range updates and range queries, since lazy tags postpone the work and each operation touches O(log n) nodes while pushing tags one level down.
space: O(n) for the aggregate array and the lazy tag array, each of size about 4n.

## intro
When updates apply to ranges and queries ask for range aggregates, such as adding 2 to indices 1 to 4 and then asking for the sum of indices 0 to 5, a segment tree needs to know the effect of an update on the aggregate of each affected node. Lazy propagation makes this efficient: an update marks a covering node with a pending tag instead of descending to the leaves, and the tag is pushed to the children only when a later operation needs to look inside.

## theory
Each node stores two things: its aggregate `value` (already correct for all updates applied to it) and a `lazy` tag, the update that is pending for its children but not yet applied to them.

Applying a range add of `v` to a node that covers `len` elements:

- `value += v * len` for a sum tree (for a minimum or maximum tree, `value += v`)
- `lazy += v`, remembering that the children have not yet received this addition

Operations:

- push down (push): before descending into the children of a node whose lazy tag is not empty, apply the tag to both children (update their values and add to their tags), then clear the node's tag
- range update `[ql, qr]`: if the node is completely inside, apply the update to the node and return; if outside, return; otherwise push down, recurse on both children and recompute the node's value from its children
- range query: if completely inside return `value`; if outside return the identity; otherwise push down, recurse on both children and combine

Invariant: a node's `value` is correct with respect to all updates that reached it or an ancestor and have been pushed; any pending effect on descendants is recorded in the lazy tags on the path from the node to those descendants. Because the tag is pushed before descending, the children are correct when read.

Example: start with `[1, 2, 3, 4, 5, 6]` (sum 21). Add 2 to indices 1 to 4: the sum of all elements becomes 21 + 8 = 29, and the sum of indices 1 to 3 is 2 + 3 + 4 plus 6 = 15. Add 3 to the whole array: the sum becomes 29 + 18 = 47. A brute-force array confirms all three answers, and 200 random operations agree with brute force.

Why it is O(log n): updates and queries visit at most O(log n) partially overlapped nodes and O(log n) fully covered nodes, with a constant amount of push work at each, so each operation costs O(log n). Without laziness, the update would descend to the leaves covered by the range, costing O(range length).

Composing tags: the lazy value must be composable. For range add, tags add up. For range assign, the new assignment overwrites older tags (and cancels pending adds). When both assign and add exist, the tag becomes a pair (assign value, add value) or an affine function `x → a·x + b`, composed by `a2·(a1·x + b1) + b2`. The order of composition must match the order of updates.

Aggregate specific details:

- Sum with range add: value changes by `v · len`
- Minimum or maximum with range add: value changes by `v` (no length factor)
- Sum with range assign: value becomes `v · len`
- Counting or flipping bits (range toggle with sum of ones): value becomes `len − value`, and the tag toggles
- Maximum subarray with range assign: the record must be recomputed from the assigned value

When not to use it: if updates are point updates only, plain segment trees suffice; if only range add with sums is needed, two Fenwick trees do it with less code (next lessons); if updates are offline, a sweep line or difference array may do.

Implementation tips: write `apply(node, length, tag)` and `push(node, left, right)` helpers so the logic of tags lives in one place; always push before recursing; recompute the parent after returning from the children; test with a brute-force array and random operations, which finds almost all bugs; initialise the lazy array with the identity tag (0 for add).

Common bugs: forgetting to push down in queries (the answer misses pending updates), forgetting to clear the tag after pushing (double application), using the wrong length for the sum update, and recomputing the parent without having pushed.

## explain
1. Store a value and a lazy tag in every node.
2. To apply an update to a node, change its value according to the node's length and add the tag.
3. Before recursing into children, push the node's tag down to both children and clear it.
4. For a range update, apply to fully covered nodes, recurse on partial ones and recompute from the children.
5. For a range query, push down while descending and combine the children's answers.
6. Compare with brute force on random operations.

## example
The Python class implements range add and range sum with lazy tags and prints the sums 29, 15 and 47 for the sample operations, then compares 200 random operations with a brute-force array: True. The JavaScript class implements range add and range maximum and prints the maximum of the whole array and, after one range add, the maxima of three queries.

## real
Databases with range updates, game engines that scale ranges of objects and competitive programming tasks with range assignment and range sum all use lazy propagation.

## pros
- Logarithmic range updates together with range queries
- Works for many operations with composable tags
- Postpones work until it is needed

## cons
- More complex than plain segment trees
- Tag composition rules are easy to get wrong
- Extra memory for the tag array

## uses
- Range add with range sum or maximum queries
- Range assign with aggregate queries
- Toggling ranges of flags
- Interval scheduling and painting problems

## mistakes
- Not pushing the tag before reading or updating the children
- Forgetting to clear the tag after pushing it
- Using the wrong length when updating a sum
- Composing assign and add tags in the wrong order

## interview
**Q:** What is lazy propagation?
**A:** A technique that stores a pending update on a segment tree node instead of applying it to every element below, and pushes the pending update to the children only when a later operation needs to access them, which keeps range updates at O(log n).

**Q:** How does a sum node change under a range add of v?
**A:** Its value increases by v times the number of elements in the node's range, and its lazy tag increases by v so the children can be updated later.

**Q:** What bugs are typical in lazy segment trees?
**A:** Not pushing down before recursing, not clearing the tag after pushing, using the wrong range length for sums and composing tags in the wrong order; random comparison with brute force finds them.

## summary
Lazy propagation lets a segment tree apply a range update to a node, record a pending tag and push it down only when needed, giving O(log n) range updates and range queries. Keep tags composable, push before descending and test against brute force.

## codenote
The Python sample implements range add with range sum. The JavaScript sample uses range add with range maximum.

## code
### python
```python
import random

class LazyTree:
    def __init__(self, values):
        self.n = len(values)
        self.sum = [0] * (4 * self.n)
        self.lazy = [0] * (4 * self.n)
        self._build(1, 0, self.n - 1, values)

    def _build(self, node, left, right, values):
        if left == right:
            self.sum[node] = values[left]
            return
        mid = (left + right) // 2
        self._build(2 * node, left, mid, values)
        self._build(2 * node + 1, mid + 1, right, values)
        self.sum[node] = self.sum[2 * node] + self.sum[2 * node + 1]

    def _apply(self, node, length, value):
        self.sum[node] += value * length
        self.lazy[node] += value

    def _push(self, node, left, right):
        if self.lazy[node]:
            mid = (left + right) // 2
            self._apply(2 * node, mid - left + 1, self.lazy[node])
            self._apply(2 * node + 1, right - mid, self.lazy[node])
            self.lazy[node] = 0

    def add(self, ql, qr, value, node=1, left=0, right=None):
        right = self.n - 1 if right is None else right
        if qr < left or right < ql:
            return
        if ql <= left and right <= qr:
            self._apply(node, right - left + 1, value)
            return
        self._push(node, left, right)
        mid = (left + right) // 2
        self.add(ql, qr, value, 2 * node, left, mid)
        self.add(ql, qr, value, 2 * node + 1, mid + 1, right)
        self.sum[node] = self.sum[2 * node] + self.sum[2 * node + 1]

    def query(self, ql, qr, node=1, left=0, right=None):
        right = self.n - 1 if right is None else right
        if qr < left or right < ql:
            return 0
        if ql <= left and right <= qr:
            return self.sum[node]
        self._push(node, left, right)
        mid = (left + right) // 2
        return self.query(ql, qr, 2 * node, left, mid) + self.query(ql, qr, 2 * node + 1, mid + 1, right)

tree = LazyTree([1, 2, 3, 4, 5, 6])
tree.add(1, 4, 2)
print(tree.query(0, 5), tree.query(1, 3))
tree.add(0, 5, 3)
print(tree.query(0, 5))

rng = random.Random(4)
values = [rng.randint(-5, 5) for _ in range(12)]
tree, brute, ok = LazyTree(values), values[:], True
for _ in range(200):
    l = rng.randint(0, 11)
    r = rng.randint(l, 11)
    if rng.random() < 0.5:
        delta = rng.randint(-3, 3)
        tree.add(l, r, delta)
        for i in range(l, r + 1):
            brute[i] += delta
    else:
        ok = ok and tree.query(l, r) == sum(brute[l:r + 1])
print(ok)
```
Output:
```text
29 15
47
True
```
### javascript
```javascript
class LazyMax {
  constructor(values) {
    this.n = values.length;
    this.max = new Array(4 * this.n).fill(-Infinity);
    this.lazy = new Array(4 * this.n).fill(0);
    this.build(1, 0, this.n - 1, values);
  }

  build(node, l, r, values) {
    if (l === r) {
      this.max[node] = values[l];
      return;
    }
    const mid = (l + r) >> 1;
    this.build(2 * node, l, mid, values);
    this.build(2 * node + 1, mid + 1, r, values);
    this.max[node] = Math.max(this.max[2 * node], this.max[2 * node + 1]);
  }

  push(node) {
    for (const child of [2 * node, 2 * node + 1]) {
      this.max[child] += this.lazy[node];
      this.lazy[child] += this.lazy[node];
    }
    this.lazy[node] = 0;
  }

  add(ql, qr, value, node = 1, l = 0, r = this.n - 1) {
    if (qr < l || r < ql) return;
    if (ql <= l && r <= qr) {
      this.max[node] += value;
      this.lazy[node] += value;
      return;
    }
    this.push(node);
    const mid = (l + r) >> 1;
    this.add(ql, qr, value, 2 * node, l, mid);
    this.add(ql, qr, value, 2 * node + 1, mid + 1, r);
    this.max[node] = Math.max(this.max[2 * node], this.max[2 * node + 1]);
  }

  query(ql, qr, node = 1, l = 0, r = this.n - 1) {
    if (qr < l || r < ql) return -Infinity;
    if (ql <= l && r <= qr) return this.max[node];
    this.push(node);
    const mid = (l + r) >> 1;
    return Math.max(this.query(ql, qr, 2 * node, l, mid), this.query(ql, qr, 2 * node + 1, mid + 1, r));
  }
}

const tree = new LazyMax([4, 1, 7, 3, 5]);
console.log(tree.query(0, 4));
tree.add(1, 3, 10);
console.log(tree.query(0, 4), tree.query(3, 4), tree.query(4, 4));
```
Output:
```text
7
17 13 5
```

## quiz
1. What does a lazy tag represent?
   - [ ] A finished update
   - [x] An update applied to a node but not yet to its children
   - [ ] The node's depth
   - [ ] The number of elements in the node
   > It is pushed down when the children are needed.
2. When is the tag pushed to the children?
   - [ ] After every query
   - [x] Before recursing into the children of a node with a pending tag
   - [ ] Only at the end of the program
   - [ ] Never
   > The children must be correct when they are read or changed.
3. How does a sum node change under a range add of v?
   - [ ] By v
   - [x] By v times the length of its range
   - [ ] By the number of children
   - [ ] It stays the same
   > Each of the elements in the range increases by v.
4. What is the time complexity of range update and range query with lazy propagation?
   - [ ] O(n)
   - [x] O(log n)
   - [ ] O(1)
   - [ ] O(n log n)
   > Each operation touches O(log n) nodes.

# Fenwick Tree Basics
kind: algorithm
time: O(log n) for a point update and for a prefix sum query, and O(n) to build from an array with the linear construction; a range sum is the difference of two prefix sums, also O(log n).
space: O(n) with a single array of n + 1 cells, much smaller than a segment tree.
viz: fenwick-tree-demo

## intro
A Fenwick tree, or binary indexed tree (BIT), answers prefix sums and applies point updates in logarithmic time using one array and a bit trick. It does what a segment tree does for sums, with less memory and about ten lines of code, which makes it the favourite for counting and frequency problems.

## theory
Idea: each cell `tree[i]` stores the sum of a block of the array whose length is the value of the lowest set bit of i. With 1-based indices, `tree[i]` covers the elements from `i − lowbit(i) + 1` to `i`, where `lowbit(i) = i & (−i)` isolates the lowest set bit.

Examples: `tree[1]` covers 1 element (index 1), `tree[2]` covers 2 (indices 1 to 2), `tree[3]` covers 1 (index 3), `tree[4]` covers 4 (indices 1 to 4), `tree[6]` covers 2 (indices 5 to 6) and `tree[8]` covers 8 elements.

Prefix sum `query(i)`: add `tree[i]`, then remove the lowest set bit (`i −= i & −i`) and repeat until i is 0. For i = 7 (binary 111) the sum adds `tree[7]` (index 7), `tree[6]` (indices 5 to 6) and `tree[4]` (indices 1 to 4). The loop runs once per set bit, at most log2 n times.

Point update `update(i, delta)`: add delta to `tree[i]`, then move to the next cell responsible for i by adding the lowest set bit (`i += i & −i`) until i exceeds n. For i = 5 it updates `tree[5]`, `tree[6]` and `tree[8]`. At most log2 n cells change.

Range sum `[l, r]` is `query(r) − query(l − 1)`.

Build in O(n): instead of n updates (O(n log n)), copy the array into the tree and for each i push its value to its parent cell `i + lowbit(i)` if that index is within n.

Example: the array (1-based) `[3, 2, −1, 6, 5, 4, −3, 3, 7, 2, 3]` has the prefix sum of the first five elements 3 + 2 − 1 + 6 + 5 = 15, and the range sum from index 4 to 8 is 6 + 5 + 4 − 3 + 3 = 15. After adding 10 to index 3, the prefix sum of 5 becomes 25.

Why it works: the lowest set bit decomposes a prefix [1, i] into blocks, one per set bit of i, each exactly covered by one cell; and the update path is the set of cells whose blocks contain the updated index. The two operations are inverses in a sense, one removing bits and the other adding them.

Properties and limits:

- Needs an invertible operation (sum, xor, product modulo prime) for range queries by subtraction; minimum and maximum work only for prefix style queries with updates that only increase (or decrease) values
- 1-based indexing is essential, because index 0 would loop forever (`0 & −0 = 0`)
- Not suited to arbitrary custom records; use a segment tree instead
- Supports finding the smallest index whose prefix sum reaches a target in O(log n) with a binary descent (useful for order statistics and weighted random choice)
- Frequency counting with coordinate compression: a Fenwick tree over ranks counts how many elements are smaller than a value, used for inversions and ranking problems

Comparison: a Fenwick tree has smaller constants and memory than a segment tree for sums (n + 1 cells and tight loops); a segment tree is more general; prefix sums are O(1) for queries but O(n) for updates.

Pitfalls: 0-based indices, forgetting that update goes upward and query goes downward, using the tree for non invertible operations without care, and integer overflow of sums.

Testing: compare with a prefix sum array after random point updates; test boundaries i = 1 and i = n.

## explain
1. Use 1-based indexing and an array of n + 1 cells.
2. Compute lowbit with i & −i.
3. For a prefix sum, add tree[i] and remove the lowest set bit repeatedly.
4. For an update, add delta and move up by adding the lowest set bit while i is at most n.
5. Compute range sums as the difference of two prefix sums.
6. Verify against a plain prefix sum array in tests.

## example
The Python class builds a Fenwick tree for the sample array, prints the prefix sum 15 for five elements, the range sum 15 for indices 4 to 8 and the prefix sum 25 after adding 10 to index 3, and shows the cells updated for index 5: 5, 6 and 8. The JavaScript program builds the tree in linear time and prints its internal array.

## real
Counting and ranking in leaderboards, cumulative frequency tables in compression and statistics, and inversion counting use Fenwick trees for their speed and simplicity.

## pros
- Compact: a single array of n + 1 numbers
- Very short code with fast loops
- Logarithmic prefix queries and point updates

## cons
- Requires an invertible operation for range queries
- 1-based indices are easy to get wrong
- Less flexible than segment trees

## uses
- Prefix and range sums with updates
- Frequency counting and rank queries
- Counting inversions
- Weighted random selection and order statistics

## mistakes
- Using 0-based indices, which causes an infinite loop
- Mixing up the directions of update and query
- Applying it to minimum queries with arbitrary updates
- Overflow in large cumulative sums

## interview
**Q:** What does each cell of a Fenwick tree store?
**A:** The sum of a block of elements ending at its index whose length equals the lowest set bit of the index, so tree[6] covers indices 5 and 6 and tree[8] covers indices 1 to 8.

**Q:** How do prefix queries and updates move through the array?
**A:** A query repeatedly removes the lowest set bit of the index (moving down), while an update repeatedly adds the lowest set bit (moving up), each taking at most log n steps.

**Q:** When would you choose a segment tree over a Fenwick tree?
**A:** When the operation is not invertible, such as minimum or gcd, when custom records are needed or when range updates with range queries and lazy propagation are required.

## summary
A Fenwick tree stores block sums indexed by the lowest set bit, so prefix sums and point updates take O(log n) with one small array. It suits invertible operations such as sums and counts.

## codenote
The Python sample implements queries and updates. The JavaScript sample builds the tree in linear time.

## code
### python
```python
class Fenwick:
    def __init__(self, values):
        self.n = len(values)
        self.tree = [0] * (self.n + 1)
        for i, value in enumerate(values, 1):
            self.update(i, value)

    def update(self, i, delta):
        while i <= self.n:
            self.tree[i] += delta
            i += i & -i

    def prefix(self, i):
        total = 0
        while i > 0:
            total += self.tree[i]
            i -= i & -i
        return total

    def range_sum(self, left, right):
        return self.prefix(right) - self.prefix(left - 1)

values = [3, 2, -1, 6, 5, 4, -3, 3, 7, 2, 3]
tree = Fenwick(values)
print(tree.prefix(5), tree.range_sum(4, 8))
tree.update(3, 10)
print(tree.prefix(5))
path, i = [], 5
while i <= 11:
    path.append(i)
    i += i & -i
print(path)
```
Output:
```text
15 15
25
[5, 6, 8]
```
### javascript
```javascript
function buildFenwick(values) {
  const n = values.length;
  const tree = [0, ...values];
  for (let i = 1; i <= n; i++) {
    const parent = i + (i & -i);
    if (parent <= n) tree[parent] += tree[i];
  }
  return tree;
}

const tree = buildFenwick([3, 2, -1, 6, 5, 4, -3, 3]);
console.log(tree.slice(1).join(" "));
```
Output:
```text
3 5 -1 10 5 9 -3 19
```

## quiz
1. What does lowbit(i) = i & -i return?
   - [ ] The highest set bit
   - [x] The lowest set bit of i
   - [ ] The parity of i
   - [ ] The number of set bits
   > It gives the length of the block that cell i covers.
2. Which direction does a prefix query move?
   - [ ] Up, adding the lowest set bit
   - [x] Down, removing the lowest set bit
   - [ ] To the right child
   - [ ] To the root
   > It adds one block for each set bit of the index.
3. Why must Fenwick trees use 1-based indices?
   - [ ] Arrays are 1-based in all languages
   - [x] Index 0 has no set bit, so the update loop would never advance
   - [ ] It reduces memory
   - [ ] It avoids recursion
   > Zero and its lowbit are both zero.
4. How is a range sum computed?
   - [ ] By summing every cell in the range
   - [x] As the difference of two prefix sums
   - [ ] By a segment tree query
   - [ ] By sorting the range
   > query(r) minus query(l minus 1).

# Fenwick Range Updates
kind: algorithm
time: O(log n) for a range add and O(log n) for a point query using one Fenwick tree on the difference array, and O(log n) for a range add with a range sum query using two Fenwick trees.
space: O(n) for one or two arrays of size n + 1.
viz: fenwick-tree-demo

## intro
The basic Fenwick tree handles point updates and prefix sums. With a clever change of what is stored, it can also handle range updates: adding a value to every element of a range in logarithmic time, and even asking for range sums afterwards. The trick is to store differences between neighbouring elements instead of the elements themselves.

## theory
Difference array: define `d[i] = a[i] − a[i − 1]` (with `a[0] = 0`). Then `a[i]` is the prefix sum of d up to i. Adding v to every element from l to r changes only two differences: `d[l] += v` and `d[r + 1] −= v`, because the elements inside the range keep their relative differences and only the boundaries change.

Range add and point query with one Fenwick tree: keep a Fenwick tree over d. To add v on `[l, r]`: `update(l, v)` and `update(r + 1, −v)`. To read element i: `prefix(i)`, which sums the differences up to i. Both operations cost O(log n). Starting from an all-zero array, adding 10 to `[2, 5]` and then 3 to `[4, 8]` on an array of 8 elements gives the values `0, 10, 10, 13, 13, 3, 3, 3` for indices 1 to 8 (index 1 stays 0).

Range add and range sum with two Fenwick trees: the sum of the first i elements is `sum over j ≤ i of a[j]`, and since `a[j] = sum over k ≤ j of d[k]`, the prefix sum can be rewritten as

`prefix_sum(i) = (i + 1) · sum(d[1..i]) − sum(k · d[k] for k ≤ i)`.

So keep two Fenwick trees: B1 over `d[k]` and B2 over `k · d[k]`. A range add of v on `[l, r]` performs:

- B1: `update(l, v)` and `update(r + 1, −v)`
- B2: `update(l, v · l)` and `update(r + 1, −v · (r + 1))`

The prefix sum is `(i + 1) · B1.prefix(i) − B2.prefix(i)`, and a range sum `[l, r]` is `prefix_sum(r) − prefix_sum(l − 1)`. All four operations are O(log n).

Example: on an array of 8 zeros, add 10 to `[2, 5]` and 3 to `[4, 8]`. The element sum of the whole array is 4 · 10 + 5 · 3 = 55, and the sum of indices 3 to 6 is 10 + 13 + 13 + 3 = 39. A brute-force array confirms both numbers.

Why the formula works: `sum_{j ≤ i} a[j] = sum_{j ≤ i} sum_{k ≤ j} d[k] = sum_{k ≤ i} d[k] · (i − k + 1) = (i + 1) · sum d[k] − sum k · d[k]`, because each d[k] is counted in every a[j] with j from k to i, which is i − k + 1 times.

Comparison:

- Lazy segment tree: also handles range add and range sum in O(log n) and extends to other operations (assign, minimum), at the cost of more code and memory
- Two Fenwick trees: about 20 lines, tiny constants, but limited to sums (and invertible operations)
- Difference array with offline queries: O(n) for all updates followed by a single prefix pass, when no query is interleaved

Applications: counting how many intervals cover a point (range add, point query), range increment contests, scheduling with overlapping bookings (how many bookings at each time), inversion style counting with ranges, and adjusting ranges of a leaderboard.

Related: counting the number of segments covering each point offline needs only a difference array and a prefix sum; a sweep line over events does the same in sorted order.

Pitfalls: forgetting the second update at r + 1 (it can be skipped when r + 1 exceeds n), writing the wrong formula for the weighted tree, 0-based indices, and overflow because the weighted tree stores products of indices and values.

Testing: random range adds and queries compared with a brute-force array; include ranges ending at n and ranges of a single element.

## explain
1. Store differences d between adjacent elements in a Fenwick tree.
2. For a range add of v on [l, r], add v at l and subtract v at r plus one.
3. For a point query, take the prefix sum of the differences.
4. For range sums add a second tree over index times difference.
5. Compute the prefix sum as (i plus one) times the first prefix minus the second prefix.
6. Compare with brute force on random operations.

## example
The Python program shows the values 0, 10, 10, 13, 13, 3, 3, 3 after the two range adds using one tree, then uses two trees to compute the total 55 and the range sum 39 for indices 3 to 6 and verifies 200 random operations against brute force. The JavaScript class implements the two tree range add and range sum and prints the same totals.

## real
Booking systems count overlapping reservations at each time slot, analytics dashboards apply range adjustments to time series and contest problems use the method for range increments with range sums.

## pros
- Range updates with tiny code and memory
- The difference array view explains the whole method
- Fast loops with small constants

## cons
- Limited to sums and similar invertible operations
- The two tree formula is easy to get wrong
- Less general than a lazy segment tree

## uses
- Range add with point queries
- Range add with range sum
- Counting coverage by overlapping intervals
- Online adjustments of ranges in counters

## mistakes
- Forgetting the subtraction at the end of the range
- Using the one tree version for range sum queries
- Mixing 0-based and 1-based indices in the updates
- Overflow in the weighted tree for large values

## interview
**Q:** How can a Fenwick tree support adding a value to a range?
**A:** Store the difference array in the tree; add v at index l and subtract v at index r plus one, and a point query is the prefix sum of the differences.

**Q:** How do you get range sums after range updates?
**A:** Use two Fenwick trees, one over the differences and one over index times difference, and compute the prefix sum as (i + 1) times the first prefix minus the second prefix.

**Q:** When is a difference array without a tree enough?
**A:** When all updates come before the queries, since one pass of prefix sums over the difference array gives every final value in O(n).

## summary
Storing differences turns a range add into two point updates, so one Fenwick tree gives range add with point queries and two trees give range add with range sums, all in O(log n).

## codenote
The Python sample uses one tree and two trees. The JavaScript sample implements the two tree structure.

## code
### python
```python
import random

class Fenwick:
    def __init__(self, n):
        self.n, self.tree = n, [0] * (n + 2)

    def update(self, i, delta):
        while i <= self.n:
            self.tree[i] += delta
            i += i & -i

    def prefix(self, i):
        total = 0
        while i > 0:
            total += self.tree[i]
            i -= i & -i
        return total

class RangeFenwick:
    def __init__(self, n):
        self.n, self.b1, self.b2 = n, Fenwick(n), Fenwick(n)

    def add(self, left, right, value):
        self.b1.update(left, value)
        self.b1.update(right + 1, -value)
        self.b2.update(left, value * left)
        self.b2.update(right + 1, -value * (right + 1))

    def prefix(self, i):
        return (i + 1) * self.b1.prefix(i) - self.b2.prefix(i)

    def range_sum(self, left, right):
        return self.prefix(right) - self.prefix(left - 1)

diffs = Fenwick(8)
for left, right, value in ((2, 5, 10), (4, 8, 3)):
    diffs.update(left, value)
    if right + 1 <= 8:
        diffs.update(right + 1, -value)
print([diffs.prefix(i) for i in range(1, 9)])

tree = RangeFenwick(8)
tree.add(2, 5, 10)
tree.add(4, 8, 3)
print(tree.range_sum(1, 8), tree.range_sum(3, 6))

rng = random.Random(12)
tree, brute, ok = RangeFenwick(10), [0] * 11, True
for _ in range(200):
    l = rng.randint(1, 10)
    r = rng.randint(l, 10)
    if rng.random() < 0.5:
        v = rng.randint(-4, 4)
        tree.add(l, r, v)
        for i in range(l, r + 1):
            brute[i] += v
    else:
        ok = ok and tree.range_sum(l, r) == sum(brute[l:r + 1])
print(ok)
```
Output:
```text
[0, 10, 10, 13, 13, 3, 3, 3]
55 39
True
```
### javascript
```javascript
class RangeFenwick {
  constructor(n) {
    this.n = n;
    this.b1 = new Array(n + 2).fill(0);
    this.b2 = new Array(n + 2).fill(0);
  }

  update(tree, i, delta) {
    for (; i <= this.n; i += i & -i) tree[i] += delta;
  }

  prefixOf(tree, i) {
    let total = 0;
    for (; i > 0; i -= i & -i) total += tree[i];
    return total;
  }

  add(left, right, value) {
    this.update(this.b1, left, value);
    this.update(this.b1, right + 1, -value);
    this.update(this.b2, left, value * left);
    this.update(this.b2, right + 1, -value * (right + 1));
  }

  prefix(i) {
    return (i + 1) * this.prefixOf(this.b1, i) - this.prefixOf(this.b2, i);
  }

  rangeSum(left, right) {
    return this.prefix(right) - this.prefix(left - 1);
  }
}

const tree = new RangeFenwick(8);
tree.add(2, 5, 10);
tree.add(4, 8, 3);
console.log(tree.rangeSum(1, 8), tree.rangeSum(3, 6), tree.rangeSum(1, 1));
```
Output:
```text
55 39 0
```

## quiz
1. What does a range add on [l, r] change in the difference array?
   - [ ] Every element of the range
   - [x] Only d[l] and d[r + 1]
   - [ ] Only the first element
   - [ ] The whole array
   > The inner differences stay the same.
2. How is a point value read from the difference Fenwick tree?
   - [ ] From a single cell
   - [x] As the prefix sum of the differences up to that index
   - [ ] As the maximum of the differences
   - [ ] By summing the whole tree
   > Values are partial sums of differences.
3. How many Fenwick trees give range add with range sum?
   - [ ] One
   - [x] Two
   - [ ] Three
   - [ ] Four
   > One tree over d and one over index times d.
4. What is the prefix sum formula with the two trees?
   - [ ] B1 minus B2
   - [x] (i + 1) times the prefix of B1 minus the prefix of B2
   - [ ] i times B2
   - [ ] B1 times B2
   > Each difference d[k] counts i minus k plus 1 times.

# 2D Segment Tree Intro
kind: concept
time: Not an algorithmic topic — this lesson introduces structures for two dimensions. A 2D segment tree or 2D Fenwick tree answers rectangle queries and point updates in O(log n · log m) time for an n by m grid.
space: Not an algorithmic topic — a 2D segment tree needs about 16 n m cells in the simple layout, while a 2D Fenwick tree needs only n times m cells.

## intro
A one dimensional segment tree answers questions about ranges of an array. Many problems ask about rectangles in a grid: the sum of the cells in a sub-rectangle, with cells that change over time. A 2D segment tree nests one tree inside another to answer them, and a 2D Fenwick tree does the same for sums with far less memory and code.

## theory
Problem: a grid of n rows and m columns, point updates (change one cell) and rectangle queries (aggregate over rows `r1..r2` and columns `c1..c2`).

Static approach: a 2D prefix sum table `P[i][j]` (sum of the rectangle from (1, 1) to (i, j)) answers a rectangle sum in O(1) with `P[r2][c2] − P[r1 − 1][c2] − P[r2][c1 − 1] + P[r1 − 1][c1 − 1]`, but an update costs O(n m) to rebuild the affected part. For the grid with rows `1 2 3`, `4 5 6` and `7 8 9`, the rectangle from (2, 2) to (3, 3) sums 5 + 6 + 8 + 9 = 28.

2D segment tree (tree of trees): the outer tree splits the row range; every outer node holds an inner tree over the columns that aggregates the rows of its range.

- Build: for every outer node build an inner column tree whose leaves are the column aggregates of the node's rows; leaves of the outer tree correspond to single rows, and internal outer nodes merge the inner trees of their children (combine cell by cell). Time O(n m).
- Query rectangle: decompose the row range into O(log n) outer nodes and query each node's inner tree over the column range, O(log m) each; total O(log n · log m)
- Point update: update the leaf row's inner tree, then for each ancestor outer node recompute the affected cell from its two children (an inner update), total O(log n · log m)
- Space: four times n outer nodes, each with an inner tree of about four times m cells, around 16 n m cells

Range updates over rectangles need lazy propagation in two dimensions, which is complicated; alternatives are often better.

2D Fenwick tree (for sums): the same bit tricks in both indices. `update(i, j, delta)` loops `i += i & −i` on the outside and `j += j & −j` on the inside; `prefix(i, j)` loops `i −= i & −i` outside and `j −= j & −j` inside. Rectangle sum by inclusion and exclusion of four prefixes. Both operations cost O(log n · log m) and the memory is n times m. After adding 10 to the cell (2, 2) of the sample grid, the rectangle sum of (2, 2) to (3, 3) becomes 38.

Other approaches:

- Quadtree: recursively divides the plane into four quadrants; adapts to sparse or clustered points and supports region queries and nearest neighbour searches
- k-d tree: alternates the split dimension; good for nearest neighbour and range searches on points
- Range tree: a balanced tree on x whose nodes hold a sorted structure on y, query O(log^2 n + k) for reporting points
- Sparse tables in 2D for static minima queries: O(1) queries with O(n m log n log m) memory
- Sqrt decomposition on blocks of the grid for simple updates
- Offline methods: sort queries and sweep, using a 1D structure over the other dimension (very common for counting points in rectangles)

Choosing: for sums with updates use the 2D Fenwick tree; for minima or other non invertible aggregates use the 2D segment tree; for static data prefix sums or sparse tables; for points in the plane with sparse data prefer k-d trees or range trees; for higher dimensions the log factors multiply, so offline sweeps or specialised structures are used.

Applications: image processing (sum over regions, integral images), heat map statistics, geographic counts in rectangular regions, game maps and spreadsheets with range formulas.

Pitfalls: memory blow up for large grids (a 5000 by 5000 grid with 16 n m cells needs 400 million cells), mixing up the order of loops, 0-based indices in Fenwick versions and handling updates as deltas rather than assignments.

Teaching point: higher dimensions are built by nesting; each added dimension multiplies the cost by a logarithmic factor and the memory by the size of the new dimension.

## explain
1. Decide whether the data is static or updated, and which aggregate is needed.
2. For static sums build a 2D prefix table and use inclusion and exclusion.
3. For updates with sums use a 2D Fenwick tree with nested bit loops.
4. For non invertible aggregates nest segment trees, an outer tree over rows with inner trees over columns.
5. Answer rectangle queries by combining O(log n) outer nodes, each queried in O(log m).
6. Estimate memory before choosing the nested structure for large grids.

## example
The Python program builds a 2D Fenwick tree for the 3 by 3 grid, prints the rectangle sum 28 for the lower right 2 by 2 block, adds 10 to the cell (2, 2) and prints 38. The JavaScript program computes the same rectangle sums with a 2D prefix table and prints the answers for three rectangles.

## real
Image libraries use integral images for fast box filters, map services count points in rectangular regions and spreadsheet engines evaluate range formulas over two dimensions.

## pros
- Rectangle queries with updates in logarithmic factors
- Nesting extends one dimensional ideas to grids
- 2D Fenwick trees are compact and simple for sums

## cons
- Memory grows with the product of the dimensions
- Lazy range updates over rectangles are complex
- Each extra dimension multiplies the log factors

## uses
- Sum over rectangular regions with updates
- Integral images and box filters
- Counting points in rectangles
- Teaching how structures extend to higher dimensions

## mistakes
- Using a 2D segment tree for sums when a 2D Fenwick tree would be simpler
- Forgetting inclusion and exclusion when combining four prefixes
- Underestimating the memory of nested trees
- Mixing the order of the row and column loops

## interview
**Q:** How does a 2D segment tree answer a rectangle query?
**A:** It splits the row range into O(log n) outer nodes and queries the inner column tree of each over the column range in O(log m), for O(log n · log m) in total.

**Q:** How does a 2D Fenwick tree compute a rectangle sum?
**A:** It computes four prefix sums, each with nested bit loops, and combines them by inclusion and exclusion: bottom right, minus the strip above, minus the strip to the left, plus the corner that was removed twice.

**Q:** When is a 2D prefix sum table enough?
**A:** When the grid does not change, since it answers any rectangle sum in O(1) after an O(n m) build.

## summary
Two dimensional range structures nest one dimensional ones: a segment tree of segment trees for general aggregates and a 2D Fenwick tree for sums, both with O(log n · log m) operations. Static data needs only prefix tables, and memory is the main cost of nesting.

## codenote
The Python sample implements a 2D Fenwick tree. The JavaScript sample uses a 2D prefix table.

## code
### python
```python
class Fenwick2D:
    def __init__(self, rows, cols):
        self.rows, self.cols = rows, cols
        self.tree = [[0] * (cols + 1) for _ in range(rows + 1)]

    def update(self, r, c, delta):
        i = r
        while i <= self.rows:
            j = c
            while j <= self.cols:
                self.tree[i][j] += delta
                j += j & -j
            i += i & -i

    def prefix(self, r, c):
        total, i = 0, r
        while i > 0:
            j = c
            while j > 0:
                total += self.tree[i][j]
                j -= j & -j
            i -= i & -i
        return total

    def rectangle(self, r1, c1, r2, c2):
        return (self.prefix(r2, c2) - self.prefix(r1 - 1, c2)
                - self.prefix(r2, c1 - 1) + self.prefix(r1 - 1, c1 - 1))

grid = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
tree = Fenwick2D(3, 3)
for r, row in enumerate(grid, 1):
    for c, value in enumerate(row, 1):
        tree.update(r, c, value)
print(tree.rectangle(2, 2, 3, 3), tree.rectangle(1, 1, 3, 3))
tree.update(2, 2, 10)
print(tree.rectangle(2, 2, 3, 3))
```
Output:
```text
28 45
38
```
### javascript
```javascript
function buildPrefix(grid) {
  const rows = grid.length;
  const cols = grid[0].length;
  const prefix = Array.from({ length: rows + 1 }, () => new Array(cols + 1).fill(0));
  for (let r = 1; r <= rows; r++) {
    for (let c = 1; c <= cols; c++) {
      prefix[r][c] = grid[r - 1][c - 1] + prefix[r - 1][c] + prefix[r][c - 1] - prefix[r - 1][c - 1];
    }
  }
  return prefix;
}

const prefix = buildPrefix([[1, 2, 3], [4, 5, 6], [7, 8, 9]]);
const rectangle = (r1, c1, r2, c2) => prefix[r2][c2] - prefix[r1 - 1][c2] - prefix[r2][c1 - 1] + prefix[r1 - 1][c1 - 1];
console.log(rectangle(2, 2, 3, 3), rectangle(1, 1, 1, 3), rectangle(1, 2, 3, 2));
```
Output:
```text
28 6 15
```

## quiz
1. What does the outer tree of a 2D segment tree split?
   - [ ] The columns
   - [x] The row range, with inner trees over the columns
   - [ ] The values
   - [ ] The updates
   > Each outer node holds an inner tree.
2. What is the cost of a rectangle query on a 2D segment tree?
   - [ ] O(n m)
   - [x] O(log n · log m)
   - [ ] O(1)
   - [ ] O(log n + m)
   > The row range gives O(log n) nodes and each inner query costs O(log m).
3. How is a rectangle sum computed from four prefix sums?
   - [ ] By adding all four
   - [x] By inclusion and exclusion: bottom right minus two strips plus the overlapping corner
   - [ ] By multiplying two prefixes
   - [ ] By taking the maximum
   > The corner is subtracted twice and must be added back.
4. When is a 2D prefix sum table the best choice?
   - [ ] When cells change often
   - [x] When the grid is static and only sums are needed
   - [ ] When minima are required
   - [ ] When the grid is sparse
   > Queries are O(1) after the build.

# Advanced Tree Interview Patterns
kind: concept
time: Not an algorithmic topic — this lesson reviews patterns. Tries give O(L) per word, Fenwick and segment trees give O(log n) per update or query, and offline techniques combine them with sorting for O(n log n) totals.
space: Not an algorithmic topic — expect O(total characters) for tries, O(n) for Fenwick trees and 2n to 4n for segment trees, which is worth stating in an interview.

## intro
Beyond binary trees and heaps, interviews and contests use three specialised structures: tries for strings, Fenwick trees for prefix counts and sums, and segment trees for range queries. Recognising which structure a problem calls for, and the standard trick for using it, is usually most of the work.

## theory
Recognising the structure:

- Words, prefixes, autocomplete, dictionary lookups, replacing or matching many words: a trie
- Counting how many items are less than something, ranks, inversions, frequencies with updates: a Fenwick tree, usually after coordinate compression
- Range minimum, maximum, sum or other aggregate with updates in the middle: a segment tree
- Range updates with range queries: a lazy segment tree (or two Fenwick trees for sums)
- No updates at all: prefix sums, sparse tables or offline sorting are simpler

Pattern 1: replace words with their roots. Given a dictionary of roots and a sentence, replace every word by the shortest root that is its prefix. Insert the roots into a trie; for each word walk down the trie and stop at the first end flag. For the roots `cat`, `bat` and `rat` and the sentence `the cattle was rattled by the battery` the result is `the cat was rat by the bat`. Time O(total characters).

Pattern 2: count smaller numbers after self. For each element, count how many elements to its right are smaller. Scan from the right to the left and use a Fenwick tree indexed by the compressed rank of the values: before inserting the current element, query the number of ranks below it, then add it. For `[5, 2, 6, 1]` the answer is `[2, 1, 1, 0]`. Time O(n log n). The same idea counts inversions (sum of the answers) and handles reverse pairs and range sum counting problems.

Pattern 3: range sum with updates ("range sum query, mutable"): a Fenwick tree for sums, or a segment tree for min and max versions of the problem.

Pattern 4: offline queries. Sort queries by their right endpoint (or by a threshold), sweep through the array and keep a Fenwick tree of the elements seen so far; the answer for each query is a prefix difference. Counting distinct values in ranges is a classic example, using the last occurrence of each value to keep only one mark per distinct value.

Pattern 5: maximum xor of two numbers. Insert the binary representations of the numbers into a trie with two children per node (bits 0 and 1); for each number, walk down choosing the opposite bit whenever possible to maximise the xor. Time O(n · bits).

Pattern 6: prefix and suffix search, stream of characters. A trie of reversed words answers "does the stream end with any word", used in the stream checker problem; a trie with an end marker per word and a combined `suffix#word` key supports prefix and suffix queries.

Pattern 7: segment tree with custom nodes. A node stores a small record so that a combine function answers a richer question: the number of distinct values or the maximum subarray in a range, the longest run of equal values, the number of bracket matches and the point of first value above a threshold (descend by comparing the left child's maximum).

Pattern 8: interval problems with a segment tree: calendar booking with a count of overlapping events (range add, maximum), skyline problems, and falling squares (range assign and range maximum, with coordinate compression).

Pattern 9: descent on a Fenwick tree or segment tree: find the k-th smallest element among the inserted values by walking down the tree comparing counts, giving an order statistics structure in O(log n).

Talking about it:

- State the structure and why it fits: updates plus range queries, prefixes of strings and so on
- Mention coordinate compression when values are large
- Give the complexity: O(n log n) overall, O(log n) per operation
- Mention alternatives and when they are better: sorting plus two pointers for static problems, hash maps for exact lookups, balanced trees for ordered maps
- Test with duplicates, empty input and extreme values

Common traps: forgetting coordinate compression (huge arrays or negative indices in Fenwick trees), 0-based indices in Fenwick trees, mutating a trie while iterating, and using a segment tree where a prefix sum would do.

## explain
1. Identify what is asked: string prefixes, counts below a value, or range aggregates with updates.
2. Choose the structure: trie, Fenwick tree or segment tree.
3. Prepare the data: coordinate compression, reversed words or bit representations.
4. Apply the standard trick: walk the trie, query before insert, or sweep offline.
5. State the time and space complexity.
6. Test duplicates, empty input and extreme values.

## example
The Python program counts the smaller numbers after each element of `[5, 2, 6, 1]` with a Fenwick tree over compressed ranks and gets 2, 1, 1, 0, then finds the maximum xor of pairs in `[3, 10, 5, 25, 2, 8]`, which is 28. The JavaScript program replaces the words of a sentence with their dictionary roots using a trie and prints `the cat was rat by the bat`.

## real
Search engines use tries for completion and spell checking, analytics systems count ranks with Fenwick trees, and databases answer range aggregates with segment tree like structures.

## pros
- A few standard tricks solve many problems
- Each structure has a clear complexity story
- Offline techniques combine them with sorting

## cons
- Coordinate compression and index conventions cause bugs
- Choosing a heavy structure for a static problem wastes effort
- Memory for tries and segment trees can be large

## uses
- Preparing for string and range query interview problems
- Counting inversions and smaller elements to the right
- Prefix matching and word replacement
- Choosing between Fenwick and segment trees

## mistakes
- Skipping coordinate compression for large or negative values
- Using 0-based indices with a Fenwick tree
- Choosing a trie when a hash set would do for exact lookups only
- Using a segment tree for static data where prefix sums suffice

## interview
**Q:** How do you count the smaller elements to the right of each element?
**A:** Process the array from right to left with a Fenwick tree over compressed value ranks: query how many inserted values have a smaller rank, then insert the current value; the total time is O(n log n).

**Q:** How do you find the maximum xor of two numbers in an array?
**A:** Insert each number as a bit path in a trie, and for every number walk down choosing the opposite bit when it exists, which maximises the xor in O(bits) per number.

**Q:** When would you choose a Fenwick tree over a segment tree?
**A:** For prefix sums, counts and ranks with point updates, where the operation is invertible and the Fenwick tree is shorter, smaller and faster; for minimum, maximum and custom aggregates a segment tree is needed.

## summary
Tries, Fenwick trees and segment trees cover prefix strings, rank counting and range queries with updates, each with a standard trick such as shortest root replacement, query before insert or opposite bit walking. Compress coordinates and watch index conventions.

## codenote
The Python sample counts smaller elements and finds a maximum xor. The JavaScript sample replaces words with roots.

## code
### python
```python
def count_smaller(numbers):
    ranks = {value: i + 1 for i, value in enumerate(sorted(set(numbers)))}
    tree = [0] * (len(ranks) + 1)

    def add(i):
        while i < len(tree):
            tree[i] += 1
            i += i & -i

    def prefix(i):
        total = 0
        while i > 0:
            total += tree[i]
            i -= i & -i
        return total

    answer = []
    for value in reversed(numbers):
        answer.append(prefix(ranks[value] - 1))
        add(ranks[value])
    return answer[::-1]

def max_xor(numbers, bits=5):
    root = {}
    for number in numbers:
        node = root
        for bit in range(bits - 1, -1, -1):
            node = node.setdefault((number >> bit) & 1, {})
    best = 0
    for number in numbers:
        node, value = root, 0
        for bit in range(bits - 1, -1, -1):
            want = 1 - ((number >> bit) & 1)
            if want in node:
                value |= 1 << bit
                node = node[want]
            else:
                node = node[1 - want]
        best = max(best, value)
    return best

print(count_smaller([5, 2, 6, 1]), max_xor([3, 10, 5, 25, 2, 8]))
```
Output:
```text
[2, 1, 1, 0] 28
```
### javascript
```javascript
function replaceWords(roots, sentence) {
  const trie = {};
  for (const root of roots) {
    let node = trie;
    for (const ch of root) node = node[ch] ??= {};
    node.end = root;
  }
  return sentence.split(" ").map((word) => {
    let node = trie;
    for (const ch of word) {
      if (node.end || !node[ch]) break;
      node = node[ch];
    }
    return node.end ?? word;
  }).join(" ");
}

console.log(replaceWords(["cat", "bat", "rat"], "the cattle was rattled by the battery"));
```
Output:
```text
the cat was rat by the bat
```

## quiz
1. Which structure suits replacing words by their dictionary roots?
   - [ ] A segment tree
   - [x] A trie of the roots
   - [ ] A Fenwick tree
   - [ ] A heap
   > Walking a word down the trie finds its shortest root.
2. How does a Fenwick tree count smaller elements to the right?
   - [ ] By sorting the array each time
   - [x] By processing from the right, querying the count below the rank and then adding the value
   - [ ] By building a trie
   - [ ] By recursion on halves
   > Each element sees only the values to its right.
3. Why use a trie of bits for the maximum xor?
   - [ ] To sort the numbers
   - [x] To pick the opposite bit at each level whenever possible
   - [ ] To count the set bits
   - [ ] To avoid comparisons altogether
   > A different bit at the highest positions gives the largest xor.
4. Why is coordinate compression often needed with Fenwick trees?
   - [ ] To remove duplicates for all problems
   - [x] Values can be large or negative while the tree needs small positive indices
   - [ ] To speed up the trie
   - [ ] To avoid recursion
   > Ranks map values to indices from 1 to the number of distinct values.
