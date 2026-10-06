# B Plus Tree Overview
kind: concept
time: Not an algorithmic topic — this lesson describes a structure. Point lookups cost O(log_m n) page reads for fanout m, and a range scan costs one lookup plus a sequential walk over the linked leaves, O(log_m n + k / leaf size) pages for k results.
space: Not an algorithmic topic — internal nodes hold only keys and child pointers, so they are small and often cached in memory, while all records live in the leaf level.

## intro
A B+ tree is a variant of the B-tree in which every record is stored in the leaves, the internal nodes hold only separator keys, and the leaves are linked together in a chain. These two changes make the internal nodes denser and make range scans a straight walk along the leaf level, which is why B+ trees are the standard index structure in relational databases and file systems.

## theory
Structure:

- Internal nodes contain separator keys and child pointers, no records. A node with k keys has k + 1 children, and the keys guide the search as in a B-tree.
- Leaf nodes contain the keys together with their records (or pointers to records) in sorted order, and every leaf is at the same depth
- Leaves are linked in a sequential chain (a singly or doubly linked list), so scanning in key order never climbs back up the tree
- Separator keys in internal nodes are copies that guide the search; a key can appear both in an internal node and in a leaf

Comparison with a B-tree:

- B-tree: keys and records are stored in all nodes; a lookup may stop at an internal node; a full ordered scan has to move between levels
- B+ tree: records only in leaves, so every lookup goes down to a leaf (a predictable number of page reads); internal nodes are smaller, so more of them fit in a page and the fanout is higher, making the tree shallower

Fanout example: a 4096 byte page with 8 byte keys, 8 byte child pointers and 8 byte record pointers. A B-tree node with keys, record pointers and child pointers uses about 24 bytes per entry and holds about 170 keys. A B+ tree internal node needs only a key and a child pointer, about 16 bytes per entry, so it holds about 256 keys. For one billion records, the B-tree needs 5 levels and the B+ tree about 4.

Search: descend through the internal nodes using the separator keys until you reach the leaf that could contain the key, then search inside the leaf (binary search in the page). The cost is the height in page reads, typically 3 or 4 for databases with billions of rows, with the top levels cached in memory.

Range query: find the leaf containing the lower bound, then follow the leaf links, collecting records until the upper bound is passed. For leaves holding 1, 5, 9 and 12, 15, 18 and 22, 27, 30 and 35, 40, 44 with separators 12, 22 and 35, the range from 15 to 40 reads the second, third and fourth leaves in sequence and returns 15, 18, 22, 27, 30, 35, 40. The cost is one lookup plus sequential page reads, which storage devices handle well.

Insertion and deletion: insert into the right leaf; if it overflows, split the leaf and copy (not move) the first key of the new right leaf into the parent as a separator; the split may propagate upward and create a new root. Deletion removes the key from the leaf and, if the leaf underflows, borrows from a sibling or merges with it, adjusting the separators in the parent.

Variants and refinements:

- B* trees keep nodes at least two thirds full by redistributing among siblings before splitting
- Prefix B+ trees store shortened separator keys (the shortest prefix that separates two leaves) to increase fanout for string keys
- Clustered indexes store the full rows in the leaves (InnoDB's primary key index), while secondary indexes store primary keys or row locators
- Bulk loading: building the tree bottom up from sorted data fills pages nearly full and is much faster than repeated inserts
- Copy on write B+ trees (LMDB, Btrfs) never modify pages in place, which gives snapshots and crash safety
- Log structured merge trees (LSM trees) are an alternative that favours write throughput by batching writes

Applications: indexes in PostgreSQL, MySQL, SQLite and Oracle, file system structures (NTFS indexes, XFS and Btrfs metadata, ReFS) and key value stores such as BoltDB and LMDB.

Trade-offs: B+ trees give predictable lookups and fast ordered scans, but random writes touch several pages and can cause splits; for write heavy workloads LSM trees may be preferred, and for pure equality lookups a hash index may be faster.

## explain
1. Keep all records in the leaves and only separator keys in the internal nodes.
2. Link the leaves in key order.
3. Search by descending the internal nodes to the right leaf, then searching within the leaf.
4. For a range query, find the first leaf and follow the leaf links until the upper bound is passed.
5. On leaf overflow, split the leaf and copy the first key of the new leaf into the parent.
6. Bulk load sorted data from the bottom up when building an index.

## example
The Python program searches a small B+ tree for the first leaf containing 15, then follows the leaf links to return the range 15 to 40 and counts the pages read, 3 leaves plus the 1 internal page. The JavaScript program computes the fanout and the height of a B tree and a B+ tree for a billion records with 4096 byte pages.

## real
Database engines store table indexes as B+ trees so that equality and range queries read a few pages, and file systems use them for directories and extent maps.

## pros
- Predictable lookups with a high fanout
- Fast ordered and range scans along the leaf chain
- Shallow trees whose upper levels fit in memory

## cons
- Splits and merges make writes more complex
- Every lookup goes to a leaf, even for keys found higher up in a B-tree
- Random writes touch several pages

## uses
- Relational database indexes
- File system directories and metadata
- Ordered key value storage engines
- Range scans over sorted data

## mistakes
- Moving instead of copying the separator key when a leaf splits
- Forgetting to maintain the leaf links during splits and merges
- Comparing the number of keys per node without considering the page size
- Using a B+ tree for a workload that only needs equality lookups and chooses a hash index

## interview
**Q:** How does a B+ tree differ from a B-tree?
**A:** In a B+ tree all records live in the leaves, internal nodes hold only separator keys, and the leaves are linked in order, so internal nodes have a higher fanout and range scans follow the leaf chain.

**Q:** Why are B+ trees good for range queries?
**A:** After one lookup to the first matching leaf, the query reads the following leaves through the sibling links without going back up the tree, which is sequential disk access.

**Q:** What happens to the separator key when a B+ tree leaf splits?
**A:** The first key of the new right leaf is copied up into the parent as the separator, while the key remains in the leaf because all records are stored there.

## summary
A B+ tree keeps records in linked leaves and only separator keys in internal nodes, giving a high fanout, shallow height and efficient range scans. It is the standard index structure of databases and file systems.

## codenote
The Python sample runs a range query over linked leaves. The JavaScript sample compares fanout and height.

## code
### python
```python
import bisect

separators = [12, 22, 35]
leaves = [[1, 5, 9], [12, 15, 18], [22, 27, 30], [35, 40, 44]]

def range_query(low, high):
    pages = 1
    leaf = bisect.bisect_right(separators, low)
    result = []
    while leaf < len(leaves):
        pages += 1
        for key in leaves[leaf]:
            if key > high:
                return result, pages
            if key >= low:
                result.append(key)
        leaf += 1
    return result, pages

print(range_query(15, 40))
print(range_query(1, 9))
```
Output:
```text
([15, 18, 22, 27, 30, 35, 40], 4)
([1, 5, 9], 3)
```
### javascript
```javascript
const pageBytes = 4096;
const key = 8;
const child = 8;
const record = 8;

const treeKeys = Math.floor(pageBytes / (key + child + record));
const plusKeys = Math.floor(pageBytes / (key + child));
const height = (fanout) => Math.ceil(Math.log(1e9) / Math.log(fanout));
console.log(treeKeys, plusKeys, height(treeKeys), height(plusKeys));
```
Output:
```text
170 256 5 4
```

## quiz
1. Where are the records stored in a B+ tree?
   - [ ] In every node
   - [x] Only in the leaves
   - [ ] Only in the root
   - [ ] In a separate hash table
   > Internal nodes hold only separator keys.
2. Why are range scans fast in a B+ tree?
   - [ ] The tree is binary
   - [x] The leaves are linked in key order
   - [ ] Keys are hashed
   - [ ] Internal nodes store the records
   > The scan follows the leaf chain after the first lookup.
3. Why do B+ trees have a higher fanout than B-trees for the same page size?
   - [ ] They use larger pages
   - [x] Internal nodes store no record pointers, so more keys fit
   - [ ] They use fewer levels of leaves
   - [ ] They store keys in compressed form only
   > Smaller entries mean more children per page.
4. What happens to the separator key when a leaf splits?
   - [ ] It is deleted from the leaf
   - [x] It is copied into the parent while remaining in the leaf
   - [ ] It is moved to the root
   - [ ] It is replaced by the largest key
   > Records stay in the leaves.

# Self Balancing Tradeoffs
kind: concept
time: Not an algorithmic topic — this lesson compares designs. All self-balancing structures give O(log n) search, insert and delete in the worst case or in expectation; they differ in constants, rotation counts and memory per node.
space: Not an algorithmic topic — memory per node ranges from one colour bit (red-black) to a stored height or a random priority (AVL, treap), plus pointers.

## intro
Several self-balancing trees keep the height logarithmic automatically, and each pays for balance in a different currency: extra bits per node, more rotations per update, randomness, or a more complex node layout. Choosing among AVL, red-black, treaps, splay trees, skip lists and B-trees means understanding what each guarantees and what each costs.

## theory
The main candidates:

- AVL tree: strict height balance (subtree heights differ by at most one). Height at most about 1.44 log2 n. Lookups are the fastest of the binary trees because the tree is shallowest. Insertion needs at most one rotation, deletion up to O(log n). Stores a height or balance factor per node.
- Red-black tree: looser balance (the longest path is at most twice the shortest), height at most 2 log2(n + 1). At most two rotations per insertion and three per deletion, so update heavy workloads do less restructuring. Stores one colour bit per node. This is the common choice in standard libraries.
- Treap: a binary search tree on the keys that is also a heap on random priorities. The shape is that of a random BST, expected height about 2 ln n, with simple code based on rotations. Guarantees are probabilistic.
- Splay tree: moves each accessed node to the root with rotations, so no balance data is stored; operations are O(log n) amortised, and frequently used keys stay near the top (good locality), but a single operation can take O(n)
- Skip list: layered linked lists with random promotion; expected O(log n), simple to implement and friendly to lock free concurrency (used in Redis sorted sets and some concurrent maps)
- B-tree and B+ tree: multiway nodes for storage that is read in pages; far fewer page reads, but more complex nodes
- Weight balanced trees (BB[alpha]): balance by subtree sizes, which supports order statistics and is used in some functional libraries
- Scapegoat tree: no balance data at nodes, rebuilds a subtree when it becomes too deep

Measured example: inserting the sorted keys 1 to 1023 into a plain binary search tree creates a chain of height 1023; an AVL tree holds the same keys at height 10; a treap with seeded random priorities ends at a height around 20; the red-black bound for 1023 keys is at most 20. For one million keys the worst case heights are about 28 for an AVL tree and about 39 for a red-black tree, while a B-tree with fanout 128 needs about 3 levels.

How to choose:

- Mostly lookups, few updates: AVL (shallowest tree) or a sorted array if updates are batched
- Mixed or update heavy workloads in memory: red-black tree
- Simplicity and expected performance with randomness acceptable: treap or skip list
- Skewed access patterns where recently used keys are reused: splay tree
- Data on disk or large pages, or cache sensitive in-memory code: B-tree variants (Rust's BTreeMap uses them in memory too)
- Concurrency: skip lists or concurrent B-trees, since rotations in binary trees touch several nodes at once
- Persistent (immutable) maps in functional languages: red-black or weight balanced trees, because path copying updates only O(log n) nodes
- Need for rank, select and range aggregates: augment any balanced tree with sizes or sums (an order statistics tree)

Costs to consider beyond big-O: pointer chasing causes cache misses, so the real speed depends on node size and memory layout; allocation costs matter for small nodes; and implementation complexity affects bugs (red-black deletion is notorious). Many programs would be better served by a hash map or a sorted array with binary search plus a small buffer for recent inserts.

Guarantees in practice: worst-case bounds (AVL, red-black, B-tree) protect against adversarial inputs; expected bounds (treap, skip list) hold for any input as long as the random choices stay hidden from the adversary; amortised bounds (splay) bound the total over a sequence.

## explain
1. List the operations that matter: lookups, updates, ordered scans, ranks, concurrency.
2. Decide whether worst-case, expected or amortised guarantees are acceptable.
3. Consider the memory per node and cache behaviour.
4. For disk or paged storage, prefer B-tree variants.
5. Prefer the library implementation unless there is a specific reason to write your own.
6. Benchmark with realistic data and access patterns.

## example
The Python program inserts the sorted keys 1 to 1023 into a plain tree, an AVL tree and a seeded treap and prints the heights 1023 and 10 for the first two and True when the treap height lies between 12 and 40. The JavaScript program prints the worst-case height bounds of AVL, red-black and B-tree structures for one million keys.

## real
Standard libraries use red-black trees for ordered maps, databases use B+ trees, Redis uses skip lists for sorted sets and many allocators and kernels use red-black trees for ordered bookkeeping.

## pros
- Several designs let you match balance guarantees to the workload
- Worst-case options protect against adversarial input
- Libraries already provide tuned implementations

## cons
- Each design trades complexity, memory or randomness for balance
- Real performance depends on cache behaviour as much as height
- Hand-written balanced trees are error prone

## uses
- Choosing an ordered map for a library or application
- Explaining design choices in interviews
- Selecting an index structure for memory or disk
- Reviewing code that implements custom ordered containers

## mistakes
- Choosing a structure by big-O alone without measuring
- Writing a custom red-black tree when a library one would do
- Using an expected-case structure where adversarial inputs matter
- Ignoring the cost of pointer chasing and allocation

## interview
**Q:** When would you prefer an AVL tree over a red-black tree?
**A:** When lookups dominate, because the stricter balance makes the tree shallower, while red-black trees suit update heavy workloads because they perform fewer rotations.

**Q:** What guarantee does a treap give and how?
**A:** Each node has a random priority and the tree is a heap on priorities and a search tree on keys, so the shape equals that of a random BST and the expected height is O(log n).

**Q:** Why do databases use B+ trees instead of AVL trees?
**A:** Each node fills a disk page with many keys, so the tree is much shallower and a lookup needs only a few page reads, whereas a binary tree would need many random reads.

## summary
AVL, red-black, treap, splay, skip list and B-tree structures all keep operations logarithmic but differ in guarantees, rotation counts, memory and cache behaviour. Choose by workload, prefer library implementations and measure.

## codenote
The Python sample compares heights for sorted insertion. The JavaScript sample prints worst-case bounds.

## code
### python
```python
import random
import sys

sys.setrecursionlimit(5000)

class Node:
    def __init__(self, key, priority=0):
        self.key, self.priority, self.left, self.right, self.height = key, priority, None, None, 1

def h(node):
    return node.height if node else 0

def update(node):
    node.height = 1 + max(h(node.left), h(node.right))
    return node

def rotate_right(y):
    x = y.left
    y.left, x.right = x.right, y
    update(y)
    return update(x)

def rotate_left(x):
    y = x.right
    x.right, y.left = y.left, x
    update(x)
    return update(y)

def plain(root, key):
    if root is None:
        return Node(key)
    side = "left" if key < root.key else "right"
    setattr(root, side, plain(getattr(root, side), key))
    return update(root)

def avl(root, key):
    if root is None:
        return Node(key)
    side = "left" if key < root.key else "right"
    setattr(root, side, avl(getattr(root, side), key))
    update(root)
    balance = h(root.left) - h(root.right)
    if balance > 1:
        if key > root.left.key:
            root.left = rotate_left(root.left)
        return rotate_right(root)
    if balance < -1:
        if key < root.right.key:
            root.right = rotate_right(root.right)
        return rotate_left(root)
    return root

def treap(root, key, priority):
    if root is None:
        return Node(key, priority)
    if key < root.key:
        root.left = treap(root.left, key, priority)
        update(root)
        if root.left.priority > root.priority:
            root = rotate_right(root)
    else:
        root.right = treap(root.right, key, priority)
        update(root)
        if root.right.priority > root.priority:
            root = rotate_left(root)
    return root

rng = random.Random(3)
a = b = c = None
for key in range(1, 1024):
    a = plain(a, key)
    b = avl(b, key)
    c = treap(c, key, rng.random())
print(h(a), h(b), 12 <= h(c) <= 40)
```
Output:
```text
1023 10 True
```
### javascript
```javascript
const n = 1_000_000;
const avlBound = Math.floor(1.44 * Math.log2(n + 2));
const redBlackBound = Math.floor(2 * Math.log2(n + 1));
const bTreeLevels = Math.ceil(Math.log(n) / Math.log(128));
console.log(avlBound, redBlackBound, bTreeLevels);
```
Output:
```text
28 39 3
```

## quiz
1. Which tree has the shallowest height among the common binary balanced trees?
   - [ ] Red-black tree
   - [x] AVL tree
   - [ ] Splay tree
   - [ ] Treap
   > Its balance rule is the strictest.
2. Why do red-black trees suit update heavy workloads?
   - [ ] They store heights
   - [x] They need fewer rotations per insertion or deletion
   - [ ] They are not binary
   - [ ] They have no colour rule
   > At most two rotations per insertion and three per deletion.
3. What kind of guarantee does a treap give?
   - [ ] Worst-case logarithmic height
   - [x] Expected logarithmic height from random priorities
   - [ ] Amortised constant time
   - [ ] No guarantee at all
   > The shape equals that of a randomly built tree.
4. Which structure is best for data stored in disk pages?
   - [ ] AVL tree
   - [x] B-tree variants such as B+ trees
   - [ ] Splay tree
   - [ ] Plain BST
   > A wide fanout reduces the number of page reads.

# Order Statistics Tree
kind: algorithm
time: O(h) for select (find the k-th smallest) and rank (count smaller keys) when each node stores its subtree size, which is O(log n) in a balanced tree; insertions and deletions update the sizes along one path in O(h).
space: O(n) with one extra integer, the subtree size, stored per node.

## intro
How would you find the median of a changing set of numbers, or the 1,000th smallest key, or the number of keys smaller than a given value? A plain binary search tree can answer only by walking the inorder sequence. Storing the size of each subtree in every node turns these questions into a single root to leaf descent. The result is called an order statistics tree.

## theory
Augmentation: each node stores `size`, the number of nodes in its subtree including itself, so `size = 1 + size(left) + size(right)` with the size of an empty subtree being 0.

Select(k) (k-th smallest, counting from 1):

- Let `left = size(node.left)`
- If `k == left + 1`, the node itself is the answer
- If `k <= left`, the answer is in the left subtree: select(node.left, k)
- Otherwise it is in the right subtree, and the keys before it are `left + 1`, so select(node.right, k − left − 1)

Rank(key) (the number of keys less than or equal to the key, or the 1-based position of an existing key):

- Descend as in a search, keeping a running count
- When you go right from a node, add `size(node.left) + 1` to the count (that node and its whole left subtree are smaller)
- When you find the key, add `size(node.left) + 1` to the count (for the position of the key itself)

Example on the tree with root 20, children 10 and 30, and grandchildren 5, 15, 25, 35 (7 keys): select(3) returns 15 and select(7) returns 35; rank of 25 is 5 (the keys 5, 10, 15, 20, 25 are at most 25); the number of keys smaller than 12 is 2 (5 and 10).

Maintaining the sizes:

- Insertion: increment `size` of each node on the path from the root to the new leaf (or recompute with the recursive formula on the way back)
- Deletion: decrement along the path; with two-child deletion, the successor's removal updates the sizes of the nodes it passes
- Rotations (in AVL or red-black trees): recompute the sizes of the two nodes involved, rotated child first, in O(1)

Generalisations:

- Augment with sums instead of counts to answer prefix sums and range sums of values in O(log n) under updates
- Augment with minima or maxima for range queries
- Interval trees augment a BST with the maximum endpoint in each subtree to find overlapping intervals
- Counting inversions and counting smaller elements to the right, by inserting elements while querying the rank
- Fenwick trees and segment trees solve many of the same problems on arrays with smaller constants when the key universe is fixed

Applications:

- Running median of a stream (find the median with select(n / 2) after each insertion), though two heaps are simpler for that case
- Leaderboards with rank queries: find a player's position, or the player at position k
- Order book depth queries and percentile estimation
- Database indexes that support OFFSET and LIMIT queries efficiently
- Rope data structures for text editors, which augment balanced trees with lengths

Language support: Java's TreeSet does not expose rank, C++ has `__gnu_pbds` trees with `find_by_order` and `order_of_key`, and Python's `sortedcontainers.SortedList` provides indexing and `bisect` for rank in O(log n) practically.

Pitfalls: forgetting to update sizes after rotations, off-by-one errors between 0-based and 1-based ranks, and assuming select works in a tree that is not balanced (it is still correct but costs O(h)).

## explain
1. Store the subtree size in every node.
2. To select the k-th smallest, compare k with the size of the left subtree and go left, return the node or go right with an adjusted k.
3. To compute a rank, add the left size plus one each time the search goes right or finds the key.
4. Update sizes along the insertion or deletion path.
5. Recompute sizes in rotations for balanced variants.
6. Choose a 0-based or 1-based convention and test small trees by hand.

## example
The Python program builds the seven key tree, then prints select(1), select(3) and select(7) as 5, 15 and 35, the rank of 25 as 5 and the number of keys at most 12 as 2. The JavaScript program uses the same tree with its own functions and also prints the median key 20.

## real
Leaderboards, percentile calculations, database OFFSET queries and text editors with ropes all use balanced trees augmented with sizes.

## pros
- k-th smallest and rank queries in O(h)
- A small extra field per node
- The augmentation idea generalises to sums and intervals

## cons
- Sizes must be maintained on every update and rotation
- Needs a balanced tree to guarantee logarithmic queries
- Libraries often do not expose rank operations directly

## uses
- Finding the k-th smallest element in a dynamic set
- Rank queries for leaderboards and percentiles
- Counting inversions with online insertion
- Efficient OFFSET queries in ordered indexes

## mistakes
- Not updating the subtree sizes after insertions or rotations
- Mixing 0-based and 1-based ranks
- Using inorder traversal for each query and paying O(n)
- Forgetting to adjust k when moving to the right subtree

## interview
**Q:** How do you find the k-th smallest element in a BST in O(h)?
**A:** Store the subtree size in each node; compare k with the left subtree size plus one, return the node if equal, go left if k is smaller, otherwise go right with k reduced by the left size plus one.

**Q:** How do you compute the rank of a key?
**A:** Descend as in a search; each time you move right from a node, or find the key, add the size of that node's left subtree plus one to a counter.

**Q:** How are sizes maintained during rotations?
**A:** After a rotation recompute the sizes of the two nodes involved, the lower one first, using one plus the sizes of the children, which takes O(1).

## summary
An order statistics tree stores subtree sizes so that select and rank take O(h) time, which is O(log n) in a balanced tree. Keep the sizes correct through insertions, deletions and rotations.

## codenote
The Python sample implements select and rank. The JavaScript sample repeats them and finds the median.

## code
### python
```python
class Node:
    def __init__(self, key):
        self.key, self.left, self.right, self.size = key, None, None, 1

def size(node):
    return node.size if node else 0

def insert(node, key):
    if node is None:
        return Node(key)
    if key < node.key:
        node.left = insert(node.left, key)
    else:
        node.right = insert(node.right, key)
    node.size = 1 + size(node.left) + size(node.right)
    return node

def select(node, k):
    left = size(node.left)
    if k == left + 1:
        return node.key
    if k <= left:
        return select(node.left, k)
    return select(node.right, k - left - 1)

def rank(node, key):
    count = 0
    while node:
        if key < node.key:
            node = node.left
        else:
            count += size(node.left) + 1
            if key == node.key:
                return count
            node = node.right
    return count

root = None
for key in (20, 10, 30, 5, 15, 25, 35):
    root = insert(root, key)
print(select(root, 1), select(root, 3), select(root, 7))
print(rank(root, 25), rank(root, 12))
```
Output:
```text
5 15 35
5 2
```
### javascript
```javascript
function insert(node, key) {
  if (!node) return { key, left: null, right: null, size: 1 };
  if (key < node.key) node.left = insert(node.left, key);
  else node.right = insert(node.right, key);
  node.size = 1 + (node.left ? node.left.size : 0) + (node.right ? node.right.size : 0);
  return node;
}

function select(node, k) {
  const left = node.left ? node.left.size : 0;
  if (k === left + 1) return node.key;
  return k <= left ? select(node.left, k) : select(node.right, k - left - 1);
}

let root = null;
for (const key of [20, 10, 30, 5, 15, 25, 35]) root = insert(root, key);
console.log(select(root, Math.ceil(root.size / 2)), root.size);
```
Output:
```text
20 7
```

## quiz
1. What extra data does an order statistics tree store in each node?
   - [ ] The node's depth
   - [x] The size of its subtree
   - [ ] The parent's key
   - [ ] A colour bit only
   > Sizes guide the descent for select and rank.
2. How does select(k) decide where to go?
   - [ ] By comparing keys with k
   - [x] By comparing k with the size of the left subtree plus one
   - [ ] By picking the left child always
   - [ ] By a random choice
   > The left subtree holds the smallest keys.
3. What is added to the rank when the search moves right from a node?
   - [ ] One
   - [x] The size of its left subtree plus one
   - [ ] The node's key
   - [ ] The depth of the node
   > The node and its left subtree are all smaller.
4. What must be recomputed after a rotation?
   - [ ] The sizes of the two rotated nodes
   - [x] The sizes of the two nodes involved, starting with the lower one
   - [ ] The sizes of all nodes
   - [ ] Only the root
   > Only the two nodes change their subtrees.

# Range Queries on BST
kind: algorithm
time: O(h + k) for a range containing k keys, since the search prunes whole subtrees outside the range and only visits the nodes on the boundary paths plus the k results; counting with subtree sizes takes O(h).
space: O(h) for the recursion stack, plus O(k) if the keys are collected.

## intro
A range query asks for all the keys between a low and a high bound, or their count or sum. A binary search tree answers it without scanning every node: the ordering property lets the search skip every subtree that lies entirely outside the range. This is the operation that makes tree based indexes more useful than hash tables for queries such as "all orders between two dates".

## theory
Recursive range search for the interval `[low, high]`:

- If the node is empty, return
- If `node.key > low`, the left subtree may contain keys in the range, so search it (otherwise every key to the left is smaller than low and can be skipped)
- If `low <= node.key <= high`, the node itself is in the range: report it
- If `node.key < high`, search the right subtree (otherwise everything to the right is larger than high)

Because the search visits nodes in inorder (left, node, right), the reported keys come out sorted.

Cost: the search follows the path to the lower bound and the path to the upper bound, which cost O(h) each, and visits every node inside the range once, which costs O(k) for k results. Subtrees outside the range are never entered, so the total is O(h + k). Compare this with scanning the whole tree, O(n).

Example: in the tree with root 8, children 3 and 10, 3 having children 1 and 6 (6 having 4 and 7), and 10 having the right child 14 (with left child 13), a query for keys from 4 to 10 returns 4, 6, 7, 8, 10 with sum 35; the pruned search visits 6 of the 9 nodes, skipping the leaf 1 and the subtree rooted at 14, while the unpruned traversal visits all 9.

Variants:

- Range sum (sum of the keys or values within the range), as in the classic problem: the same recursion with accumulation, and with a stored subtree sum the query can be answered in O(h) by combining whole subtrees
- Range count: with subtree sizes, count = rank(high) − rank(low − 1), each computed in O(h)
- Trim a BST so that all keys lie within `[low, high]`: if the node is below low return the trimmed right subtree, if above high return the trimmed left subtree, else trim both children
- Closest keys: floor and ceiling queries as special cases
- Iterator for a range: start at the lower bound successor and advance with a stack, giving O(1) amortised per result, so a client can stop early
- Interval overlap queries use an interval tree, where each node stores the maximum endpoint of its subtree
- Multi-dimensional ranges need k-d trees or range trees, which nest BSTs, with O(log^d n + k) queries

Compared with other structures:

- Sorted array with binary search: finds both ends in O(log n) and returns the range as a slice, but inserts cost O(n)
- B+ tree: the same idea on disk, with linked leaves for the scan
- Hash table: cannot answer range queries without a full scan
- Fenwick tree and segment tree: range sums over an index range of an array, with O(log n) updates

Pitfalls: using inclusive and exclusive bounds inconsistently, searching both subtrees unconditionally (turning the query into a full traversal), and forgetting that the answer can be empty.

Testing: ranges that cover everything, nothing or a single key, bounds that are not present in the tree, equal low and high, and a comparison with filtering the sorted keys.

## explain
1. Define the bounds and whether each end is inclusive.
2. Search the left subtree only if the node's key is above the lower bound.
3. Report the node if its key lies in the range.
4. Search the right subtree only if the node's key is below the upper bound.
5. Collect or accumulate results during the traversal.
6. Compare the visited node count with the total to confirm the pruning.

## example
The Python function returns the keys 4, 6, 7, 8, 10 of the example tree with their sum 35 and reports that the pruned search visits 6 of its 9 nodes. The JavaScript function counts the keys in a range with the help of stored subtree sizes and prints 5 for the range 4 to 10 and 9 for a range covering everything.

## real
Databases answer BETWEEN queries with index range scans, calendars list events between two dates, and monitoring tools fetch time series points within a window using ordered trees.

## pros
- Skips every subtree outside the range
- Results come out in sorted order
- Cost depends on the output size, not the tree size

## cons
- Needs the tree to be balanced for the O(h) part to be logarithmic
- Multi-dimensional ranges need more complex structures
- Easy to introduce off-by-one errors in the bounds

## uses
- Retrieving keys between two bounds
- Range sums and counts
- Trimming a tree to a range
- Index scans in databases

## mistakes
- Visiting both subtrees without pruning
- Treating inclusive and exclusive bounds inconsistently
- Forgetting that the lower bound may not exist in the tree
- Collecting results out of order by changing the traversal order

## interview
**Q:** How do you find all keys within a range in a binary search tree?
**A:** Traverse inorder but only descend left when the node's key is above the lower bound and only descend right when it is below the upper bound, reporting nodes within the range; the time is O(h + k).

**Q:** How can the number of keys in a range be found in O(log n)?
**A:** Store subtree sizes and compute rank(high) minus rank(low − 1) with two descents.

**Q:** How do you trim a BST to a given range?
**A:** If a node is smaller than the low bound return the trimmed right subtree, if larger than the high bound return the trimmed left subtree, otherwise keep the node and trim both children.

## summary
Range queries on a BST prune subtrees outside the bounds and cost O(h + k) for k results, delivering sorted output. Subtree sizes or sums make counts and sums O(h), and trimming follows the same pruning rule.

## codenote
The Python sample finds keys, a sum and the visited node count. The JavaScript sample counts keys using subtree sizes.

## code
### python
```python
class Node:
    def __init__(self, key, left=None, right=None):
        self.key, self.left, self.right = key, left, right

def range_keys(node, low, high, found, visited):
    if node is None:
        return
    visited.append(node.key)
    if node.key > low:
        range_keys(node.left, low, high, found, visited)
    if low <= node.key <= high:
        found.append(node.key)
    if node.key < high:
        range_keys(node.right, low, high, found, visited)

tree = Node(8, Node(3, Node(1), Node(6, Node(4), Node(7))), Node(10, None, Node(14, Node(13))))
found, visited = [], []
range_keys(tree, 4, 10, found, visited)
print(found, sum(found), len(visited), 9)
```
Output:
```text
[4, 6, 7, 8, 10] 35 6 9
```
### javascript
```javascript
function size(node) {
  return node ? node.size : 0;
}

function make(key, left = null, right = null) {
  return { key, left, right, size: 1 + size(left) + size(right) };
}

function rank(node, key) {
  let count = 0;
  while (node) {
    if (key < node.key) node = node.left;
    else {
      count += size(node.left) + 1;
      node = node.right;
    }
  }
  return count;
}

const tree = make(8, make(3, make(1), make(6, make(4), make(7))), make(10, null, make(14, make(13))));
console.log(rank(tree, 10) - rank(tree, 3), rank(tree, 100) - rank(tree, 0));
```
Output:
```text
5 9
```

## quiz
1. When does the range search skip the left subtree?
   - [ ] When the node is a leaf
   - [x] When the node's key is not above the lower bound
   - [ ] When the key is in the range
   - [ ] Never
   > All keys to the left would be smaller than the node.
2. What is the cost of a range query returning k keys?
   - [ ] O(n)
   - [x] O(h + k)
   - [ ] O(k squared)
   - [ ] O(1)
   > Two boundary paths plus the reported nodes.
3. How can a count of keys in a range be computed in O(log n)?
   - [ ] By collecting the keys
   - [x] As rank(high) minus rank(low minus one) using subtree sizes
   - [ ] By a full inorder traversal
   - [ ] By hashing the range
   > Two descents give the counts of keys at most each bound.
4. How is a BST trimmed to a range?
   - [ ] By deleting keys one by one from the root
   - [x] By returning the trimmed right subtree for small nodes and the trimmed left subtree for large nodes
   - [ ] By rebuilding it from scratch
   - [ ] By sorting its keys again
   > Nodes outside the range are skipped along with their wrong side.

# Convert Sorted Array to BST
kind: algorithm
time: O(n) when the recursion passes index bounds, since each element becomes exactly one node; slicing the array at each level adds O(n log n) of copying.
space: O(log n) for the recursion stack of the balanced result, plus O(n) for the tree itself.

## intro
Given a sorted array, build a binary search tree that is height balanced. The idea is to choose the middle element as the root, so that half of the remaining elements go to the left subtree and half to the right, and repeat for each half. The result has the smallest possible height, about log2 n, and an inorder traversal reproduces the array.

## theory
Recursive construction:

- If the range of the array is empty, return an empty tree
- Choose the middle index `mid` of the range and create a node for `array[mid]`
- Build the left subtree from the part before `mid` and the right subtree from the part after `mid`

Passing indices `(low, high)` instead of slicing keeps the work linear: each call does O(1) work besides its recursive calls, and there are n calls with a non-empty range plus n + 1 empty ones, so the total is O(n).

For the sorted array −10, −3, 0, 5, 9 (five elements), the middle is 0, the left half −10, −3 gives −3 as its root (with left child −10) and the right half 5, 9 gives 9 as its root with left child 5 (using the upper middle when a range has an even length). The preorder sequence is 0, −3, −10, 9, 5 and the height is 3. Choosing the lower middle instead produces a different but equally valid balanced tree, and the problem usually accepts any height balanced answer.

Why it is balanced: at every node the sizes of the two subtrees differ by at most one, so their heights differ by at most one. The height of the tree with n nodes is ⌈log2(n + 1)⌉ (in nodes). An array of 1,000 elements gives height 10, and one of 1,023 gives a perfect tree of height 10.

Related problems:

- Sorted linked list to BST: counting the nodes and building the tree in inorder fashion (consume the list as the recursion visits the nodes in sorted order) gives O(n) time with O(log n) stack, without finding the middle repeatedly (which would cost O(n log n))
- Balancing an existing BST: take its inorder traversal (a sorted array) and rebuild from the middle, or use the Day-Stout-Warren algorithm with rotations in O(n) time and O(1) space
- Building a perfect tree: when n + 1 is a power of two the result is perfect
- Merging two BSTs: take the two inorder sequences, merge them as sorted arrays and build a balanced tree, in O(m + n)
- Bulk loading an index: building a B+ tree or a balanced tree from sorted data is much faster than repeated insertion, which also avoids the chain that sorted insertion would create
- Constructing a BST from preorder traversal and verifying its shape with bounds

Why not insert the elements one at a time? Inserting sorted data into a plain BST creates a chain with height n, and each insertion costs O(n), O(n squared) overall; with a self balancing tree each insertion costs O(log n) and the total is O(n log n), more than the O(n) of the direct construction.

Output checks: the inorder traversal of the result must equal the input array, the BST property must hold and the height must be minimal; test with empty input, one element, two elements (one child) and large inputs.

Duplicates: with duplicates the array is non-decreasing; the BST property needs a policy (for example duplicates to the right), and the middle rule may place equal keys on both sides, which some policies forbid, so check the problem's definition.

## explain
1. Handle the empty range by returning an empty tree.
2. Take the middle element of the range as the root.
3. Recursively build the left subtree from the elements before the middle.
4. Recursively build the right subtree from the elements after the middle.
5. Pass index bounds instead of slices to keep the work linear.
6. Verify the inorder output, the BST property and the height.

## example
The Python program converts the array −10, −3, 0, 5, 9 into a tree with root 0, preorder 0, −3, −10, 9, 5 and height 3, and checks that the inorder traversal equals the input and that 1,000 elements produce height 10. The JavaScript program builds a balanced tree from a sorted list using the count based inorder construction and prints the same preorder.

## real
Databases bulk load indexes from sorted data, ordered collections are rebuilt after bulk updates, and compilers build balanced lookup tables from sorted constant lists.

## pros
- Produces a minimum height tree
- Linear time with index bounds
- Simple recursive code

## cons
- Requires the input to be sorted
- Slicing adds hidden copying costs
- Different valid answers exist, so tests must check properties

## uses
- Building balanced trees from sorted data
- Rebalancing a skewed tree via its inorder sequence
- Bulk loading index structures
- Merging ordered collections

## mistakes
- Slicing the array at each level and paying extra time and memory
- Inserting sorted elements one by one into a plain tree
- Comparing the output with a single expected shape when several are valid
- Mishandling the middle index for even lengths and getting off-by-one errors

## interview
**Q:** How do you convert a sorted array into a height balanced BST?
**A:** Make the middle element the root, build the left subtree from the elements before it and the right subtree from the elements after it, recursively; the sizes of the subtrees differ by at most one.

**Q:** Why is the result balanced?
**A:** Splitting at the middle gives subtrees whose sizes differ by at most one at every node, so their heights also differ by at most one.

**Q:** How do you convert a sorted linked list to a balanced BST in O(n)?
**A:** Count the nodes, then build the tree recursively over index ranges while advancing a single list pointer in inorder order, so each list node is consumed once as the recursion visits it.

## summary
Building a BST from sorted data by recursively choosing the middle element gives a minimum height tree in O(n) time with index bounds. The same idea rebalances skewed trees and bulk loads indexes.

## codenote
The Python sample builds from an array and checks properties. The JavaScript sample builds from a list in inorder fashion.

## code
### python
```python
class Node:
    def __init__(self, key, left=None, right=None):
        self.key, self.left, self.right = key, left, right

def build(values, low=0, high=None):
    if high is None:
        high = len(values) - 1
    if low > high:
        return None
    mid = (low + high + 1) // 2
    return Node(values[mid], build(values, low, mid - 1), build(values, mid + 1, high))

def preorder(node):
    return [node.key] + preorder(node.left) + preorder(node.right) if node else []

def inorder(node):
    return inorder(node.left) + [node.key] + inorder(node.right) if node else []

def height(node):
    return 0 if node is None else 1 + max(height(node.left), height(node.right))

values = [-10, -3, 0, 5, 9]
tree = build(values)
print(preorder(tree), height(tree), inorder(tree) == values)
print(height(build(list(range(1000)))))
```
Output:
```text
[0, -3, -10, 9, 5] 3 True
10
```
### javascript
```javascript
function fromSortedList(list) {
  let index = 0;
  function build(count) {
    if (count === 0) return null;
    const leftCount = Math.floor((count - 1) / 2) + ((count - 1) % 2);
    const left = build(leftCount);
    const node = { key: list[index++], left, right: null };
    node.right = build(count - 1 - leftCount);
    return node;
  }
  return build(list.length);
}

const preorder = (n) => (n ? [n.key, ...preorder(n.left), ...preorder(n.right)] : []);
console.log(preorder(fromSortedList([-10, -3, 0, 5, 9])).join(" "));
```
Output:
```text
0 -3 -10 9 5
```

## quiz
1. Which element becomes the root when building from a sorted array?
   - [ ] The smallest element
   - [x] The middle element
   - [ ] The largest element
   - [ ] A random element
   > The halves then have almost equal sizes.
2. Why is passing index bounds better than slicing?
   - [ ] Slicing gives wrong answers
   - [x] Slicing copies elements at each level and adds time and memory
   - [ ] Indices sort the array
   - [ ] Bounds avoid recursion
   > Index bounds keep the work linear.
3. What does the inorder traversal of the built tree return?
   - [ ] The reverse of the array
   - [x] The original sorted array
   - [ ] The level order
   - [ ] A shuffled array
   > A BST keeps its keys in sorted order.
4. What is the problem with inserting sorted elements one by one into a plain BST?
   - [ ] The keys get lost
   - [x] It creates a chain of height n
   - [ ] The tree becomes a heap
   - [ ] The keys must be negative
   > Every insertion goes to the right of the previous node.

# Balanced Tree Interview Patterns
kind: concept
time: Not an algorithmic topic — this lesson reviews patterns. Most balanced tree questions are answered by O(h) descents or O(n) traversals, with h equal to O(log n) in balanced trees.
space: Not an algorithmic topic — recursive solutions use O(h) stack space, and iterator based solutions with an explicit stack also use O(h).

## intro
Interviews on search trees rarely ask you to code a red-black tree. They ask whether you can use the ordering property: find the successor, validate a tree, trim it, find two keys with a given sum, or locate the closest value. This lesson collects the patterns, with the one idea that makes each of them work.

## theory
Pattern 1: use the ordering to prune. Search, insert, floor, ceiling, closest value and range queries descend a single path, discarding a subtree at every step. Closest value to a target: walk down from the root, remembering the closest key seen; go left if the target is smaller than the current key, otherwise right. For the tree with root 4, children 2 and 5, and the node 2 having children 1 and 3, the closest value to 3.714 is 4.

Pattern 2: inorder is sorted. K-th smallest (stop after k visits), validate BST (strictly increasing), minimum absolute difference (adjacent keys in the inorder sequence), recover a swapped pair (find the two inversions in the inorder sequence), convert to a sorted array or list, and merge two BSTs.

Pattern 3: successor and predecessor. The successor of a node is the leftmost node of its right subtree, or, if there is no right child, the lowest ancestor for which the node lies in the left subtree. Without parent pointers, search from the root keeping the last node at which you turned left. For the keys 2, 1, 3 the successor of 1 is 2, and the successor of 3 does not exist.

Pattern 4: two pointers over the BST. Two sum in a BST: run two iterators, one ascending (inorder) and one descending (reverse inorder), and move them like the two pointers on a sorted array, with O(h) extra space. For the keys 1 to 7 and the target 9 the pair 2 and 7 is found; or put the keys in a hash set while traversing.

Pattern 5: validate with bounds. Pass `(low, high)` down, as in the validation lesson, and use the same technique to construct a BST from preorder traversal in O(n): consume values while they are within the current bounds.

Pattern 6: structural transformations. Trim a BST to a range, insert and delete, convert a sorted array or list to a balanced BST, flatten the BST into a linked list in inorder, merge two BSTs, and rebuild a balanced tree from an unbalanced one.

Pattern 7: lowest common ancestor in a BST: the first node whose key lies between the two keys, in O(h) without recursion.

Pattern 8: augmentation. Store sizes or sums to answer rank, k-th and range count queries in O(h) under updates; store interval maxima for overlap queries.

Pattern 9: design with ordered maps. Calendar booking (check overlap with the floor and ceiling entries), sliding window median with two multisets, stock price with highest and lowest queries, and range module problems. When the language has no tree map, use a sorted list with binary search, or a heap with lazy deletion if only extremes are needed.

How to talk about balance: say that all operations are O(h), that h is logarithmic only if the tree is balanced, and that an interview BST is usually not self balancing, so mention the skewed worst case and name AVL or red-black trees as the production answer; also mention that language libraries provide them (Java TreeMap, C++ std::map).

Checklist for each problem: ask whether duplicates are allowed, whether the tree is guaranteed to be a valid BST, whether parent pointers exist, and whether recursion depth is a concern; test the empty tree, a single node and skewed trees.

Complexity summary: descents O(h); full traversals O(n); iterators O(h) space with O(1) amortised next.

## explain
1. Decide whether the problem uses the ordering to prune, or needs the sorted inorder sequence.
2. For search style problems, write a loop that descends one path and keeps the best candidate.
3. For sequence style problems, use an inorder traversal and compare neighbours.
4. For pair problems, use two inorder iterators or a hash set.
5. State the cost as O(h), and mention balance and the skewed worst case.
6. Test duplicates, empty and single node trees.

## example
The Python program finds the inorder successor of keys in a small BST (2 for the key 1, none for the largest key) and solves two sum on the BST with the keys 1 to 7 by a two pointer scan over the inorder list, finding 2 and 7 for the target 9. The JavaScript program finds the closest value to 3.714286 in the tree 4, 2, 5, 1, 3, which is 4.

## real
Order books, calendar systems and index lookups rely on these operations, and interviewers use them to test whether you can exploit ordering instead of scanning.

## pros
- A small number of ideas cover most search tree questions
- Descents are logarithmic in balanced trees
- The patterns carry over to ordered maps in libraries

## cons
- Interview trees are often not balanced, so the worst case is linear
- Recursion depth may be an issue
- Edge cases with duplicates and missing parents are easy to miss

## uses
- Preparing for coding interviews about search trees
- Designing features with ordered maps
- Choosing between traversal, descent and iterator solutions
- Reviewing code that uses sorted structures

## mistakes
- Scanning the whole tree when a single descent would do
- Forgetting that a node without a right child needs an ancestor as its successor
- Assuming the input is a valid BST without checking
- Quoting O(log n) without mentioning balance

## interview
**Q:** How do you find the inorder successor of a node in a BST?
**A:** If the node has a right child, the successor is the leftmost node of that subtree; otherwise it is the lowest ancestor whose left subtree contains the node, which you find by searching from the root and remembering the last node where you went left.

**Q:** How do you find two keys in a BST that sum to a target?
**A:** Use a pair of iterators, one ascending and one descending, moving them toward each other like two pointers on a sorted array, or store seen keys in a hash set during a traversal.

**Q:** What should you say about the complexity of BST operations in an interview?
**A:** That they cost O(h), which is O(log n) for a balanced tree and O(n) for a skewed one, and that production code uses a self-balancing tree such as an AVL or red-black tree.

## summary
Search tree interview problems use the ordering to prune, the sorted inorder sequence, successor and predecessor logic, two pointer iterators and augmentation. Always state the cost in terms of the height and mention balance.

## codenote
The Python sample finds a successor and solves two sum on a BST. The JavaScript sample finds the closest value.

## code
### python
```python
class Node:
    def __init__(self, key, left=None, right=None):
        self.key, self.left, self.right = key, left, right

def successor(root, key):
    best = None
    node = root
    while node:
        if key < node.key:
            best, node = node.key, node.left
        else:
            node = node.right
    return best

def inorder(node):
    return inorder(node.left) + [node.key] + inorder(node.right) if node else []

def two_sum(root, target):
    keys = inorder(root)
    low, high = 0, len(keys) - 1
    while low < high:
        total = keys[low] + keys[high]
        if total == target:
            return keys[low], keys[high]
        low, high = (low + 1, high) if total < target else (low, high - 1)
    return None

tree = Node(4, Node(2, Node(1), Node(3)), Node(6, Node(5), Node(7)))
print(successor(tree, 1), successor(tree, 4), successor(tree, 7))
print(two_sum(tree, 9), two_sum(tree, 20))
```
Output:
```text
2 5 None
(2, 7) None
```
### javascript
```javascript
function closestValue(root, target) {
  let best = root.key;
  for (let node = root; node; ) {
    if (Math.abs(node.key - target) < Math.abs(best - target)) best = node.key;
    node = target < node.key ? node.left : node.right;
  }
  return best;
}

const tree = {
  key: 4,
  left: { key: 2, left: { key: 1 }, right: { key: 3 } },
  right: { key: 5 },
};
console.log(closestValue(tree, 3.714286), closestValue(tree, 1.2));
```
Output:
```text
4 1
```

## quiz
1. How is the closest value to a target found in a BST?
   - [ ] By scanning every node
   - [x] By descending one path and remembering the closest key seen
   - [ ] By sorting the keys
   - [ ] By hashing the target
   > The ordering tells which subtree can hold something closer.
2. What is the successor of a node without a right child?
   - [ ] Its left child
   - [x] The lowest ancestor whose left subtree contains the node
   - [ ] The root always
   - [ ] None exists
   > It is the next larger key encountered going up.
3. How does two sum work on a BST?
   - [ ] By checking every pair with two loops over the nodes
   - [x] With two pointers over the ascending and descending inorder order
   - [ ] By inserting the target into the tree
   - [ ] By rotating the tree
   > It is the sorted array technique applied to the tree.
4. What caveat should accompany an O(log n) claim for BST operations?
   - [ ] The keys must be strings
   - [x] It holds only if the tree is balanced
   - [ ] The tree must be perfect
   - [ ] The values must be unique
   > A skewed tree makes the cost linear.
