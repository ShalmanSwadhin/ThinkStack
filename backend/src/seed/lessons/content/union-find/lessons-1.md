# Disjoint Set Union Concept
kind: concept
time: Not an algorithmic topic — this lesson defines a data structure. With the optimisations covered later, each operation costs O(α(n)) amortised, effectively constant, while the naive list based version costs O(n) per merge.
space: Not an algorithmic topic — a disjoint set union over n elements stores one parent reference (and a rank or size) per element, so it uses O(n) memory.

## intro
Many problems ask which items belong together: which computers are on the same network, which friends form one group, which cells make up one island. A disjoint set union (DSU), also called union-find, maintains a collection of non-overlapping groups and answers two questions quickly: which group is this item in, and can two groups be merged?

## theory
A disjoint set is a collection of sets with no element in two sets. Over a universe of n elements, the DSU starts with n singleton sets and supports:

- `make_set(x)`: create a set containing only x (done for all elements at the start)
- `find(x)`: return a representative (the leader or root) of the set containing x, such that two elements are in the same set exactly when their representatives are equal
- `union(x, y)`: merge the sets containing x and y into one set
- Derived query: `connected(x, y)` is `find(x) == find(y)`
- Often also `count`, the current number of sets, which decreases by one for every successful merge

The structure is incremental: groups only ever merge. It cannot split a group again (a deletion needs rollback or an offline approach, covered later).

Example: with 6 friends numbered 0 to 5 and the friendships (0, 1), (2, 3), (1, 3) and (4, 5), the groups after processing them are {0, 1, 2, 3} and {4, 5}, so there are 2 groups, person 0 and person 2 are connected through 1 and 3, and person 0 and person 4 are not.

A first, simple implementation keeps every element's group label in an array (quick find): `find` is a lookup, O(1), but `union` must relabel all elements of one group, O(n). The alternative stores a parent reference per element and walks to the root (quick union, covered next): `union` is cheap but `find` can take O(n) on a long chain. The efficient solution combines trees with two optimisations, union by rank or size and path compression, which makes both operations nearly constant.

Equivalence relations: a DSU maintains an equivalence relation, a relation that is reflexive, symmetric and transitive. "Is connected to" and "is in the same group as" are equivalence relations, so the DSU gives the equivalence classes, which is exactly what is needed whenever the relation is defined by pairs and extended by transitivity.

Typical uses:

- Connected components of an undirected graph, including graphs given as a stream of edges
- Cycle detection in undirected graphs: an edge whose endpoints are already connected closes a cycle
- Kruskal's algorithm for minimum spanning trees
- Grouping equivalent items: merging accounts, synonyms, equal variables in equations
- Percolation and image segmentation: merging adjacent cells or pixels with a similar value
- Offline dynamic connectivity and least common ancestor (Tarjan's offline algorithm)

What it does not do: list the members of a set efficiently (extra bookkeeping needed), split sets, or find paths between nodes (only whether a path exists).

Comparison with graph search: breadth first or depth first search finds components in O(V + E) for a static graph; the DSU does the same incrementally as edges arrive, answering connectivity queries between edge insertions at nearly constant cost per operation, which searches cannot do without restarting.

Complexity story: n elements and m operations cost O(m α(n)) total with both optimisations, where α is the inverse Ackermann function, below 5 for any practical n.

Design notes: elements are usually integers from 0 to n − 1; for other keys, map them to integers with a hash map first (coordinate compression) or use a dictionary based DSU that creates entries on demand.

## explain
1. Start with every element in its own set.
2. To find the set of an element, return its representative.
3. To merge two elements, find their representatives and join the two sets if they differ.
4. Decrease the set count with each successful merge.
5. Test connectivity by comparing representatives.
6. Choose an implementation with union by size or rank and path compression for speed.

## example
The Python program implements the list-of-sets version for the six friends, merges the friendships and prints the groups {0, 1, 2, 3} and {4, 5}, the group count 2 and the answers to two connectivity queries. The JavaScript program implements quick find with component labels and prints the labels after each union.

## real
Network monitoring tools track which machines can reach each other, social networks maintain friend groups and image tools label connected regions of pixels, all using union-find.

## pros
- Answers group membership questions in nearly constant time
- Merges groups incrementally as pairs arrive
- Tiny memory footprint with one or two arrays

## cons
- Cannot split a group once merged
- Does not list the members of a group directly
- Gives connectivity only, not the paths

## uses
- Connected components of graphs and grids
- Cycle detection in undirected graphs
- Kruskal's minimum spanning tree
- Grouping equivalent items

## mistakes
- Comparing elements directly instead of comparing their representatives
- Expecting the structure to support removal of an element or an edge
- Using a naive relabelling union for large inputs
- Forgetting to initialise every element as its own set

## interview
**Q:** What operations does a disjoint set union support?
**A:** Find, which returns the representative of an element's set, and union, which merges two sets; two elements are in the same set exactly when their representatives are equal.

**Q:** When should you prefer a DSU over breadth first search?
**A:** When edges arrive over time and connectivity must be answered between insertions, since the DSU handles each new edge in nearly constant time instead of re-searching the graph.

**Q:** Why can't a DSU undo a union?
**A:** The structure only stores representatives, not the history of merges, so splitting requires a rollback stack or an offline technique.

## summary
A disjoint set union keeps non-overlapping groups and supports find and union, which makes it the standard tool for connectivity that grows over time. Efficient versions use trees with union by size and path compression.

## codenote
The Python sample is a simple list of sets. The JavaScript sample uses quick find labels.

## code
### python
```python
class SimpleDSU:
    def __init__(self, n):
        self.groups = [{i} for i in range(n)]

    def find(self, x):
        for index, group in enumerate(self.groups):
            if x in group:
                return index

    def union(self, x, y):
        a, b = self.find(x), self.find(y)
        if a != b:
            self.groups[a] |= self.groups[b]
            del self.groups[b]

    def connected(self, x, y):
        return self.find(x) == self.find(y)

friends = SimpleDSU(6)
for a, b in [(0, 1), (2, 3), (1, 3), (4, 5)]:
    friends.union(a, b)
print([sorted(group) for group in friends.groups], len(friends.groups))
print(friends.connected(0, 2), friends.connected(0, 4))
```
Output:
```text
[[0, 1, 2, 3], [4, 5]] 2
True False
```
### javascript
```javascript
class QuickFind {
  constructor(n) {
    this.label = Array.from({ length: n }, (_, i) => i);
  }

  connected(x, y) {
    return this.label[x] === this.label[y];
  }

  union(x, y) {
    const from = this.label[x];
    const to = this.label[y];
    if (from === to) return;
    this.label = this.label.map((value) => (value === from ? to : value));
  }
}

const sets = new QuickFind(6);
for (const [a, b] of [[0, 1], [2, 3], [1, 3], [4, 5]]) {
  sets.union(a, b);
  console.log(sets.label.join(" "));
}
console.log(sets.connected(0, 2), sets.connected(0, 4));
```
Output:
```text
1 1 2 3 4 5
1 1 3 3 4 5
3 3 3 3 4 5
3 3 3 3 5 5
true false
```

## quiz
1. What does find(x) return in a disjoint set union?
   - [ ] The size of the set
   - [x] The representative of the set containing x
   - [ ] The list of members
   - [ ] The smallest element only
   > Elements are in the same set exactly when their representatives match.
2. Which operation merges two groups?
   - [ ] Find
   - [x] Union
   - [ ] Connected
   - [ ] Make set
   > Union joins the sets of the two elements.
3. Can a standard DSU split a group?
   - [ ] Yes, in constant time
   - [x] No, groups only merge
   - [ ] Yes, with find
   - [ ] Only for the first element
   > Splitting needs rollback or offline techniques.
4. What relation does a DSU maintain?
   - [ ] A total order
   - [x] An equivalence relation: reflexive, symmetric and transitive
   - [ ] A partial order
   - [ ] A parent child hierarchy only
   > The groups are its equivalence classes.

# Union Find with Array
kind: algorithm
time: O(h) for find and union without optimisations, where h is the height of the tree, which can reach O(n) on a long chain; O(1) for creating the structure per element and O(n) for n elements.
space: O(n) for a single parent array of n integers.
viz: union-find

## intro
The practical way to build a disjoint set union is a forest stored in an array: the entry parent[i] holds the parent of element i, and a root is an element that is its own parent. Finding the set of an element means following parents up to the root, and merging two sets means pointing one root at the other. This is called quick union.

## theory
Representation:

- `parent = list(range(n))`: every element starts as the root of its own tree
- The root of a tree is the representative of its set
- Elements form trees (a forest), with edges pointing from children to parents

Operations:

- `find(x)`: while `parent[x] != x`, set `x = parent[x]`; return x. The cost is the depth of x.
- `union(x, y)`: find `rx = find(x)` and `ry = find(y)`; if they differ, set `parent[rx] = ry` (attach one root under the other) and decrease the set count
- `connected(x, y)`: `find(x) == find(y)`

Trace for 6 elements and the unions (0, 1), (2, 3), (1, 3) and (4, 5), always attaching the root of the first argument under the root of the second:

- Start: `[0, 1, 2, 3, 4, 5]`
- union(0, 1): root 0 goes under 1: `[1, 1, 2, 3, 4, 5]`
- union(2, 3): `[1, 1, 3, 3, 4, 5]`
- union(1, 3): the root of 1 is 1, the root of 3 is 3, so 1 goes under 3: `[1, 3, 3, 3, 4, 5]`
- union(4, 5): `[1, 3, 3, 3, 5, 5]`

There are 2 sets, the one with root 3 (elements 0, 1, 2, 3) and the one with root 5 (elements 4 and 5). Element 0 reaches its root through 1 and 3, a path of two steps.

Worst case: if unions always attach the growing tree below a new element, such as union(0, 1), union(1, 2), union(2, 3), ... with the rule "first root under second", the result is a chain, and `find(0)` takes n − 1 steps; a sequence of n finds then costs O(n squared). The chain forms because the structure ignores how large the trees are. Two simple optimisations, union by size and path compression (next lessons), fix this.

Comparison of the two basic schemes:

- Quick find (label array): `find` O(1), `union` O(n) because every label of one set changes; n unions cost O(n squared)
- Quick union (parent array): `union` O(depth), `find` O(depth); fast when trees stay shallow but a chain makes everything linear
- Weighted quick union (union by size): depth stays O(log n)
- With path compression added: amortised O(α(n))

Implementation details:

- Use iterative `find` to avoid recursion depth problems on long chains
- Keep a `count` of components, starting at n and decreasing on each successful union
- For elements that are not integers, store a dictionary of parents and create entries lazily
- Return a boolean from `union` telling whether a merge happened; this is the signal for cycle detection and for Kruskal's algorithm
- Keep `find` free of side effects when you need to reason about the structure, or add compression deliberately

Typical bugs: attaching x instead of its root (corrupting the forest and creating cycles in the parent array), forgetting to find the roots before comparing, off-by-one initialisation of the array and infinite loops caused by a parent cycle created by such mistakes.

Testing: compare with a simple labelling implementation on random union and connected sequences; verify the count of sets; test n = 1.

## explain
1. Create a parent array where every element is its own parent.
2. To find an element's set, follow parent links until an element is its own parent.
3. To union two elements, find both roots and, if they differ, make one root the parent of the other.
4. Track the number of sets, reducing it on every successful union.
5. Return whether the union merged anything.
6. Compare with a trusted implementation in tests.

## example
The Python class applies the four unions to six elements, printing the parent array after each step and ending with the parents 1, 3, 3, 3, 5, 5 and 2 sets. The JavaScript program shows how a chain forms for the union sequence 0-1, 1-2, 2-3, 3-4 and counts the steps of find on the first element: 4.

## real
Network connectivity trackers, image labelling and Kruskal's algorithm store their union-find forests in plain arrays like this.

## pros
- Very small memory and code
- Union and find are simple loops
- Easy to extend with ranks and compression

## cons
- Trees can become chains and make operations linear
- Naive version is slow for large adversarial inputs
- Recursive find can overflow the stack on long chains

## uses
- Base implementation of union-find
- Connectivity queries in growing graphs
- Teaching how forests represent sets
- Starting point for optimised versions

## mistakes
- Attaching an element instead of its root
- Comparing parents instead of roots
- Using recursion for find on long chains
- Forgetting to decrease the component count only on successful unions

## interview
**Q:** How is a disjoint set stored in an array?
**A:** Each element stores its parent in an array; a root stores itself, and find follows the parent links to the root, while union attaches one root under the other.

**Q:** Why can the simple array version be slow?
**A:** Unions can build a long chain, making find take O(n) steps, so a sequence of operations can cost quadratic time.

**Q:** What should union return?
**A:** Whether a merge actually happened, because a failed union means the two elements were already connected, which signals a cycle or a redundant edge.

## summary
A union-find forest in a parent array finds roots by following links and merges by attaching one root to another. Without size or rank rules the trees can degenerate into chains, so real implementations add union by size and path compression.

## codenote
The Python sample traces the parent array. The JavaScript sample demonstrates a chain.

## code
### python
```python
class DSU:
    def __init__(self, n):
        self.parent = list(range(n))
        self.count = n

    def find(self, x):
        while self.parent[x] != x:
            x = self.parent[x]
        return x

    def union(self, x, y):
        rx, ry = self.find(x), self.find(y)
        if rx == ry:
            return False
        self.parent[rx] = ry
        self.count -= 1
        return True

dsu = DSU(6)
print(dsu.parent)
for a, b in [(0, 1), (2, 3), (1, 3), (4, 5)]:
    dsu.union(a, b)
    print(dsu.parent)
print(dsu.count, dsu.find(0), dsu.find(4), dsu.find(0) == dsu.find(2))
```
Output:
```text
[0, 1, 2, 3, 4, 5]
[1, 1, 2, 3, 4, 5]
[1, 1, 3, 3, 4, 5]
[1, 3, 3, 3, 4, 5]
[1, 3, 3, 3, 5, 5]
2 3 5 True
```
### javascript
```javascript
const parent = Array.from({ length: 6 }, (_, i) => i);

function find(x) {
  let steps = 0;
  while (parent[x] !== x) {
    x = parent[x];
    steps++;
  }
  return [x, steps];
}

for (let i = 0; i < 4; i++) {
  const [root] = find(i);
  parent[root] = i + 1;
}
console.log(parent.join(" "), find(0).join(" steps "));
```
Output:
```text
1 2 3 4 4 5 4 steps 4
```

## quiz
1. How is a root recognised in the parent array?
   - [ ] It has the largest index
   - [x] Its parent is itself
   - [ ] Its parent is zero
   - [ ] It has no children
   > Roots point to themselves.
2. What does union do after finding the two roots?
   - [ ] Swaps them
   - [x] Makes one root the parent of the other if they differ
   - [ ] Deletes one of them
   - [ ] Sorts the array
   > The trees are joined at their roots.
3. Why can the find operation be slow without optimisations?
   - [ ] It uses recursion
   - [x] A long chain of parents makes the walk to the root O(n)
   - [ ] The array is too small
   - [ ] Roots are hard to detect
   > Unions can create tall trees.
4. What does a false return value from union mean?
   - [ ] An error occurred
   - [x] The elements were already in the same set
   - [ ] The array is full
   - [ ] The sets were swapped
   > No merge was needed.

# Path Compression
kind: algorithm
time: O(log n) amortised per find with path compression alone, and O(α(n)) amortised when combined with union by rank or size.
space: O(1) extra for the iterative versions, O(depth) for recursive find.

## intro
Every find walks from an element up to its root. Path compression turns that walk into an investment: after finding the root, make every node on the path point directly at it. The next find from any of those nodes takes one step, and trees become flatter and flatter the more the structure is used.

## theory
Recursive path compression (full compression):

- `find(x)`: if `parent[x] != x`, set `parent[x] = find(parent[x])`; return `parent[x]`
- Every node on the path from x to the root is re-pointed to the root, because the assignment happens on the way back from the recursion

Iterative two pass version: first walk up to find the root; then walk the path again and set each node's parent to the root. It avoids recursion, which matters for long chains (Python's default recursion limit is about 1000).

Path halving: a one pass alternative. While `parent[x] != x`: set `parent[x] = parent[parent[x]]`, then move `x = parent[x]`. Each node on the path is re-pointed to its grandparent. It halves the path length per find, uses a single pass and gives the same asymptotic bounds.

Path splitting: similar, re-pointing every node to its grandparent while moving to the old parent.

Example: a chain `0 → 1 → 2 → 3 → 4 → 5 → 6 → 7` (parent of i is i + 1, with 7 as the root). The first `find(0)` takes 7 steps and, with full compression, makes 0 to 6 all point to 7. A second `find(0)` takes 1 step. Finding every element from 0 to 7 in turn costs 7 + 6 + 5 + ... + 0 = 28 steps without compression and only 13 steps with it, because the first find flattens the whole chain; the gap grows quadratically with the chain length.

Complexity: path compression on its own gives O(log n) amortised per operation (an analysis of Tarjan and van Leeuwen); together with union by rank or size the amortised cost is O(α(n)) per operation, where α is the inverse Ackermann function, at most 4 for any input that fits in the universe. Individual operations can still take O(log n) time; the guarantee is on the average over any sequence.

Effects on the structure:

- Trees become very flat, often depth 1 or 2 after a few finds
- Ranks (used in union by rank) become upper bounds on height rather than exact heights, which is fine
- The parent array changes during queries, so a "read only" find mutates the structure; this matters for concurrent use (races) and for rollbacks, where compression must be avoided
- Compression does not change which element is the representative (the root), only the paths

Implementation advice:

- Prefer path halving or the iterative two pass version in languages with limited recursion depth
- Combine with union by size or rank for the best bound
- When the root must be returned, remember the final value of x after the loop in the halving version
- When rollbacks are needed (offline dynamic connectivity), skip path compression and use union by size only, which gives O(log n) finds

Pitfalls: re-pointing nodes to a node that is not the root (corrupting the sets), forgetting that recursive compression returns the root and not the parent, and assuming the tree depth bounds (like log n) that rely on rank hold exactly after compression.

Testing: random unions and finds compared with a naive structure; check that all nodes on a compressed path point to the root; measure the number of parent steps.

## explain
1. Walk up from the element to find the root.
2. Walk the path again and point each node at the root (or halve while walking).
3. Return the root.
4. Keep using union as before; compression only changes find.
5. Combine with union by size or rank.
6. Verify results against a naive structure and measure steps.

## example
The Python program builds the chain 0 to 7, counts the parent steps taken by finds of every element without compression (28) and with compression (13) and prints the flattened parent array. The JavaScript program implements path halving and prints the parent array before and after two finds.

## real
Union-find libraries in graph tools, compilers (type unification) and image processing include path compression, and it is the reason Kruskal's algorithm spends nearly all of its time on sorting rather than connectivity.

## pros
- Makes later finds much cheaper
- Few lines of code
- Gives near constant amortised cost with union by rank

## cons
- Mutates the structure during reads
- Complicates rollbacks and concurrent access
- Recursive versions can overflow the stack

## uses
- Speeding up every union-find implementation
- Kruskal's algorithm and connectivity problems
- Type unification in compilers
- Large scale component labelling

## mistakes
- Pointing nodes at a non-root ancestor and calling it compression
- Using recursive compression on chains deeper than the recursion limit
- Combining compression with rollback features
- Believing the tree height is exactly the rank after compression

## interview
**Q:** What is path compression?
**A:** After a find locates the root, every node on the traversed path is re-pointed to the root, so later finds from those nodes take a single step.

**Q:** What is the complexity of union-find with path compression?
**A:** O(log n) amortised per operation with compression alone and O(α(n)) amortised when combined with union by rank or size.

**Q:** What is path halving?
**A:** A single pass variant in which each visited node is re-pointed to its grandparent while walking up, which roughly halves the path and gives the same asymptotic bounds.

## summary
Path compression flattens the tree during find by pointing each visited node at the root (or its grandparent in halving), which makes later operations nearly free. Combined with union by size it achieves O(α(n)) amortised cost.

## codenote
The Python sample counts steps with and without compression. The JavaScript sample uses path halving.

## code
### python
```python
def chain(n):
    return [min(i + 1, n - 1) for i in range(n)]

def find_plain(parent, x):
    steps = 0
    while parent[x] != x:
        x = parent[x]
        steps += 1
    return x, steps

def find_compress(parent, x):
    root, steps = x, 0
    while parent[root] != root:
        root = parent[root]
        steps += 1
    while parent[x] != root:
        parent[x], x = root, parent[x]
    return root, steps

plain, compressed = chain(8), chain(8)
plain_steps = sum(find_plain(plain, x)[1] for x in range(8))
compress_steps = sum(find_compress(compressed, x)[1] for x in range(8))
print(plain_steps, compress_steps, compressed)
```
Output:
```text
28 13 [7, 7, 7, 7, 7, 7, 7, 7]
```
### javascript
```javascript
function findHalving(parent, x) {
  while (parent[x] !== x) {
    parent[x] = parent[parent[x]];
    x = parent[x];
  }
  return x;
}

const parent = [1, 2, 3, 4, 5, 6, 7, 7];
console.log(parent.join(" "));
console.log(findHalving(parent, 0), parent.join(" "));
console.log(findHalving(parent, 0), parent.join(" "));
```
Output:
```text
1 2 3 4 5 6 7 7
7 2 2 4 4 6 6 7 7
7 4 2 4 4 7 6 7 7
```

## quiz
1. What does path compression change?
   - [ ] The representative of a set
   - [x] The parents of nodes on the find path, which now point to the root
   - [ ] The number of sets
   - [ ] The elements of the sets
   > Only the shape of the tree changes.
2. When does path halving re-point a node?
   - [ ] After the whole walk
   - [x] While walking, to its grandparent
   - [ ] Never
   - [ ] To the first child
   > It needs just one pass.
3. What is the amortised cost with compression and union by rank?
   - [ ] O(n)
   - [x] O(α(n)), practically constant
   - [ ] O(log n) in the worst case per operation
   - [ ] O(n log n)
   > The inverse Ackermann function grows extremely slowly.
4. Why avoid path compression when rollbacks are needed?
   - [ ] It is incorrect
   - [x] It changes many parents during finds, which are costly to undo
   - [ ] It increases the tree height
   - [ ] It removes the roots
   > Rollback structures use union by size only.

# Union by Rank
kind: algorithm
time: O(log n) per find and union with union by rank or size alone, and O(α(n)) amortised combined with path compression.
space: O(n) for the parent array plus one rank (or size) array of n integers.
viz: union-find

## intro
Union by rank is the rule that keeps union-find trees shallow: when merging two trees, always attach the shorter tree under the root of the taller one. Without the rule, a bad sequence of unions builds a chain of length n; with it, a tree of height h has at least 2^h elements, so the height never exceeds log2 n.

## theory
Rank: each root stores `rank`, an upper bound on the height of its tree. All ranks start at 0 (a single element).

Union rule:

- Find the roots `rx` and `ry`; if equal, do nothing
- If `rank[rx] < rank[ry]`, attach `rx` under `ry`; if `rank[rx] > rank[ry]`, attach `ry` under `rx`
- If the ranks are equal, attach either one under the other and increase the new root's rank by one

The height grows only when two trees of equal height are merged, which is the only case that increases a rank.

Why the height is at most log2 n: by induction, a root with rank r has at least 2^r elements in its tree. Rank 0 has 1 element; a rank r + 1 root arises from merging two rank r trees, each with at least 2^r elements, giving at least 2^(r + 1). So with n elements the rank is at most log2 n, and so is the height; a find takes O(log n) steps.

Union by size: store the number of elements in each tree and attach the smaller tree under the larger. It gives the same height bound (a node's depth increases only when its tree is merged into one at least as large, so the tree size at least doubles each time) and has a side benefit: the size of every set is available directly. Size and rank are interchangeable in practice; size is easier to understand and gives set sizes.

Demonstration: union the sequence (0, 1), (1, 2), (2, 3), ... on 16 elements in the form "first argument's root goes under the second's root". Without a rule, the tree after 15 unions has height 15. With union by size or rank, the height stays at most 4 (log2 16).

Effects together with path compression:

- Union by rank alone: O(log n) per operation
- Path compression alone: O(log n) amortised
- Both: O(α(n)) amortised, the best known and optimal for the problem

After path compression the stored rank may be larger than the actual height, which is fine since it is only used as a heuristic for choosing which root goes on top.

Implementation:

- Arrays `parent` and `rank` (or `size`), both of length n
- `union` returns True when a merge happens (the roots differ), False otherwise
- Ties: when the ranks are equal, pick one consistently and increment its rank; in union by size, ties can be broken arbitrarily
- Merge the component count and track the maximum size if needed (the largest component size is a common query)

Applications of the size array: the size of the largest group (as in "largest component size"), checking if a set has at least k members, and in Kruskal's algorithm the early stop when the tree has n − 1 edges (or the component count is 1).

Pitfalls: updating the rank of the wrong root, comparing the ranks of the elements instead of their roots, forgetting to find roots first, and incrementing the rank when the ranks differ (the height does not grow then).

Testing: verify that after many random unions the maximum depth is at most log2 n, that set sizes add up to n and that connectivity matches a naive implementation.

## explain
1. Keep a rank (or size) for every root, starting at 0 (or 1).
2. Find the roots of both elements and stop if they are equal.
3. Attach the root with the smaller rank under the root with the larger rank.
4. If the ranks are equal, attach either one and increase the rank of the new root.
5. Optionally track set sizes and the component count.
6. Check the maximum depth against log2 n after random unions.

## example
The Python program applies the chain-like union sequence on 16 elements with and without the size rule: the height without the rule is 15 and with the rule is 1, and it prints the size of the largest set, 16. The JavaScript program uses union by size and prints the size array after the sequence of unions and the size of the largest component.

## real
Every serious union-find library, such as those in graph toolkits and competitive programming templates, implements union by rank or size together with path compression.

## pros
- Guarantees logarithmic tree height
- Simple rule with a short proof
- Set sizes come for free with union by size

## cons
- Needs an extra array
- Ranks are only upper bounds after compression
- The rule alone is not enough for the best amortised bound

## uses
- Keeping union-find trees shallow
- Tracking sizes of components
- Building spanning trees with Kruskal's algorithm
- Offline dynamic connectivity with rollback

## mistakes
- Comparing ranks of elements instead of roots
- Increasing the rank when the ranks differ
- Forgetting to update the size of the new root
- Treating rank as the exact height after path compression

## interview
**Q:** What is union by rank?
**A:** When merging two trees, attach the root of the tree with the smaller rank under the root of the larger one, and increase the rank only when the ranks are equal, which keeps the height at most log2 n.

**Q:** Why is the height at most log n with union by size?
**A:** A node's depth increases only when its tree is attached to a tree at least as large, so the tree containing it at least doubles in size every time its depth grows.

**Q:** What is the combined complexity of union by rank and path compression?
**A:** O(α(n)) amortised per operation, where α is the inverse Ackermann function, which is at most 4 for any practical input.

## summary
Union by rank or size attaches the smaller tree under the larger, keeping every tree's height at most log2 n, and together with path compression gives O(α(n)) amortised operations. Size also tells how big each group is.

## codenote
The Python sample compares heights with and without the rule. The JavaScript sample tracks sizes.

## code
### python
```python
def height(parent, x):
    steps = 0
    while parent[x] != x:
        x, steps = parent[x], steps + 1
    return steps

def build(n, by_size):
    parent = list(range(n))
    size = [1] * n

    def find(x):
        while parent[x] != x:
            x = parent[x]
        return x

    for i in range(n - 1):
        a, b = find(i), find(i + 1)
        if by_size and size[a] > size[b]:
            a, b = b, a
        parent[a] = b
        size[b] += size[a]
    return max(height(parent, x) for x in range(n)), size

plain_height, _ = build(16, False)
ranked_height, sizes = build(16, True)
print(plain_height, ranked_height, max(sizes))
```
Output:
```text
15 1 16
```
### javascript
```javascript
class SizeDSU {
  constructor(n) {
    this.parent = Array.from({ length: n }, (_, i) => i);
    this.size = new Array(n).fill(1);
  }

  find(x) {
    while (this.parent[x] !== x) x = this.parent[x];
    return x;
  }

  union(x, y) {
    let a = this.find(x);
    let b = this.find(y);
    if (a === b) return false;
    if (this.size[a] < this.size[b]) [a, b] = [b, a];
    this.parent[b] = a;
    this.size[a] += this.size[b];
    return true;
  }
}

const dsu = new SizeDSU(8);
[[0, 1], [2, 3], [0, 2], [4, 5], [6, 7], [4, 6]].forEach(([a, b]) => dsu.union(a, b));
console.log(dsu.size.join(" "), Math.max(...dsu.size));
```
Output:
```text
4 1 2 1 4 1 2 1 4
```

## quiz
1. In union by rank, which tree is attached under the other?
   - [ ] The taller tree
   - [x] The tree with the smaller rank
   - [ ] The tree with more elements
   - [ ] A random tree
   > A shorter tree under a taller one does not increase the height.
2. When does the rank of the new root increase?
   - [ ] On every union
   - [x] Only when the two ranks are equal
   - [ ] When the ranks differ
   - [ ] Never
   > Only merging equal height trees increases the height.
3. What bound does union by size give on the tree height?
   - [ ] n
   - [x] log2 n
   - [ ] sqrt n
   - [ ] 1
   > A node's tree at least doubles whenever its depth grows.
4. What extra information does union by size provide?
   - [ ] The depth of each node
   - [x] The size of each set
   - [ ] The sorted order of elements
   - [ ] The parent of the root
   > The root's size is the number of elements in its set.

# Connected Components
kind: algorithm
time: O((V + E) α(V)), essentially linear in the number of vertices and edges, since each edge triggers one union and each vertex one find.
space: O(V) for the parent and size arrays.

## intro
A connected component of an undirected graph is a maximal set of vertices that can reach each other. Counting the components, finding their sizes and asking whether two vertices lie in the same one are classic tasks, and union-find solves them as edges arrive, without building adjacency lists or running a search.

## theory
Algorithm:

- Create a DSU with one element per vertex
- For each edge `(u, v)`, call `union(u, v)`
- The number of components is the number of roots, which equals V minus the number of successful unions (count it as you go)
- The size of a component is the size stored at its root; the component of a vertex is `find(v)`

For a graph with 10 vertices (0 to 9) and the edges (0, 1), (1, 2), (3, 4), (5, 6), (6, 7), (7, 5) and (8, 8), the components are {0, 1, 2}, {3, 4}, {5, 6, 7}, {8} and {9}: five components with sizes 3, 2, 3, 1 and 1. The edge (7, 5) closes a cycle inside {5, 6, 7} and the loop (8, 8) does nothing; neither changes the count.

Grouping vertices by component: after all unions, loop over the vertices, group them by `find(v)` in a dictionary. This is O(V α(V)) and gives the lists of members.

Comparison with graph search: depth first or breadth first search computes components in O(V + E) from an adjacency list; it needs the graph stored. Union-find processes a stream of edges without storing them, supports adding edges later while keeping answers current, and is shorter to write for components alone. Searches are better when you also need distances, paths or a traversal order, and for directed graphs (strongly connected components need Kosaraju or Tarjan).

Variations on components:

- Number of provinces: the graph is given as an adjacency matrix; union every pair with a 1 in the matrix, and the answer is the number of components. For the matrix `[[1, 1, 0], [1, 1, 0], [0, 0, 1]]` there are 2 provinces.
- Largest component size: track the maximum size after each union
- Components after removing vertices: process in reverse, adding vertices back (reverse time trick)
- Components of a grid: union neighbouring cells with the same value (flood fill by union-find)
- Graph valid tree: a graph with n vertices is a tree if it has n − 1 edges and a single component, or if no union fails (no cycle) and the count ends at 1
- Satisfiability of equations such as `a == b` and `a != b`: union the equal pairs, then check the unequal pairs are in different sets
- Number of connected computers or minimum number of cables to connect a network: components minus one extra cables are needed provided there are enough spare edges

Implementation details: use 0-based vertex ids; if the vertices are named, map names to ids with a dictionary; process self loops and repeated edges naturally (they do nothing); use union by size and path compression, as the lessons before.

Counting without storing edges: for huge graphs streamed from disk, a DSU holds only O(V) memory while reading E edges once, which makes it suitable when the edge list does not fit in memory.

Pitfalls: counting components as the number of distinct parent values without calling find (unflattened paths give wrong counts), forgetting isolated vertices (they are components of size one), and using union-find for directed reachability (it ignores edge direction).

Testing: compare component counts and sizes with a depth first search implementation on random graphs, including graphs with no edges (V components) and complete graphs (1 component).

## explain
1. Create a union-find structure with one set per vertex.
2. For each edge, union its endpoints and decrease the component count on success.
3. After processing, the count is the number of components.
4. Group vertices by their root to list the components.
5. Read sizes from the size array at the roots.
6. Check against a depth first search on random graphs.

## example
The Python program processes the sample 10 vertex graph, prints the five components and their sizes, and counts the provinces in the adjacency matrix example. The JavaScript program counts the components of a small graph given by an edge list and prints the number of components, 2, together with the size of the largest one, 5.

## real
Network tools identify isolated subnets, social platforms measure the size of the largest connected community, and image analysis labels connected regions of pixels.

## pros
- Near linear time and tiny memory
- Works on a stream of edges
- Easy to extend with sizes and queries

## cons
- Ignores edge direction, so it is not for directed reachability
- Gives no paths or distances
- Isolated vertices must be counted explicitly

## uses
- Counting connected components
- Finding the largest component
- Checking whether a graph is a tree
- Grouping equal items from pairs

## mistakes
- Counting distinct parent values without calling find
- Forgetting vertices that have no edges
- Applying it to directed reachability
- Recounting the components after each union instead of tracking them

## interview
**Q:** How do you count connected components with union-find?
**A:** Start with V components, union the endpoints of every edge, and decrease the count each time a union actually merges two different sets; the final count is the number of components.

**Q:** When would you choose depth first search over union-find for components?
**A:** When the graph is already stored as adjacency lists and you also need traversal order, paths or distances; union-find is better for edge streams and incremental updates.

**Q:** How do you check whether an undirected graph is a tree?
**A:** It must have exactly V minus 1 edges and be connected: every union must succeed (no cycle) and the final component count must be 1.

## summary
Union-find counts components by merging the endpoints of every edge and tracking successful merges, in near linear time and O(V) memory. It also gives component sizes and supports edge streams.

## codenote
The Python sample finds component members and sizes. The JavaScript sample finds the largest component.

## code
### python
```python
from collections import defaultdict

class DSU:
    def __init__(self, n):
        self.parent = list(range(n))
        self.size = [1] * n
        self.count = n

    def find(self, x):
        while self.parent[x] != x:
            self.parent[x] = self.parent[self.parent[x]]
            x = self.parent[x]
        return x

    def union(self, x, y):
        a, b = self.find(x), self.find(y)
        if a == b:
            return False
        if self.size[a] < self.size[b]:
            a, b = b, a
        self.parent[b] = a
        self.size[a] += self.size[b]
        self.count -= 1
        return True

dsu = DSU(10)
for a, b in [(0, 1), (1, 2), (3, 4), (5, 6), (6, 7), (7, 5), (8, 8)]:
    dsu.union(a, b)
groups = defaultdict(list)
for vertex in range(10):
    groups[dsu.find(vertex)].append(vertex)
print(sorted(groups.values()), dsu.count)

matrix = [[1, 1, 0], [1, 1, 0], [0, 0, 1]]
provinces = DSU(3)
for i in range(3):
    for j in range(i + 1, 3):
        if matrix[i][j]:
            provinces.union(i, j)
print(provinces.count)
```
Output:
```text
[[0, 1, 2], [3, 4], [5, 6, 7], [8], [9]] 5
2
```
### javascript
```javascript
function largestComponent(n, edges) {
  const parent = Array.from({ length: n }, (_, i) => i);
  const size = new Array(n).fill(1);
  const find = (x) => {
    while (parent[x] !== x) {
      parent[x] = parent[parent[x]];
      x = parent[x];
    }
    return x;
  };
  let components = n;
  let largest = 1;
  for (const [u, v] of edges) {
    let a = find(u);
    let b = find(v);
    if (a === b) continue;
    if (size[a] < size[b]) [a, b] = [b, a];
    parent[b] = a;
    size[a] += size[b];
    largest = Math.max(largest, size[a]);
    components--;
  }
  return [components, largest];
}

console.log(largestComponent(8, [[0, 1], [1, 2], [2, 0], [3, 4], [5, 6], [6, 7], [4, 5]]));
```
Output:
```text
[ 2, 5 ]
```

## quiz
1. How is the number of connected components tracked?
   - [ ] By counting edges
   - [x] Start at V and subtract one for each successful union
   - [ ] By counting leaves
   - [ ] By sorting the vertices
   > Each merge reduces the number of sets by one.
2. How is a component's size read?
   - [ ] By a depth first search
   - [x] From the size stored at the root of its set
   - [ ] From the number of edges
   - [ ] From the parent array length
   > Union by size maintains it.
3. What is wrong with counting distinct parent values?
   - [ ] Nothing
   - [x] Parents may not be roots until find is called, so the count can be wrong
   - [ ] It is too slow
   - [ ] It ignores edges
   > The root is the representative, not the direct parent.
4. Why is union-find unsuitable for directed reachability?
   - [ ] It is too slow
   - [x] It treats edges as undirected and ignores their direction
   - [ ] It cannot handle cycles
   - [ ] It needs sorted edges
   > Strongly connected components need other algorithms.

# Detect Cycle in Graph
kind: algorithm
time: O(E α(V)) for a graph with E edges and V vertices, since each edge costs two finds and at most one union.
space: O(V) for the parent and size arrays.

## intro
In an undirected graph, an edge closes a cycle exactly when both of its endpoints are already connected. Union-find answers that question for each edge as it arrives, so cycle detection becomes a single pass over the edge list, with no adjacency lists and no recursion.

## theory
Rule: process the edges in any order. For the edge `(u, v)`, find the roots of u and v:

- If the roots are different, the edge connects two components: union them (the graph so far is still a forest)
- If the roots are equal, u and v were already connected by a path, so this edge adds a second route and creates a cycle

The first edge for which `union` fails is an edge on a cycle. If no edge fails, the graph is a forest (acyclic).

Example: edges (0, 1), (1, 2), (2, 3), (3, 1) on 4 vertices. The first three unions succeed. The edge (3, 1) finds that 3 and 1 already share a root, so it closes the cycle 1 → 2 → 3 → 1. The graph with edges (0, 1), (1, 2), (2, 3) has no cycle.

Redundant connection: given a graph that was a tree plus one extra edge, return the edge that can be removed to make it a tree again; with edges given in order, the answer is the last edge that fails to union, which is also the last edge of a cycle in the input order. For the edges (1, 2), (1, 3), (2, 3) the redundant edge is (2, 3); for (1, 2), (2, 3), (3, 4), (1, 4), (1, 5) it is (1, 4).

Counting redundant edges: the number of failed unions equals E − V + C, where C is the number of components (the cyclomatic number or the number of independent cycles). A forest has E = V − C. A graph with 6 vertices and edges (0,1), (1,2), (0,2), (3,4), (4,5), (3,5), (2,3) has E = 7, V = 6 and C = 1, so there are 7 − 6 + 1 = 2 independent cycles, and exactly two unions fail.

Self loops and parallel edges: a self loop (u, u) fails immediately (same root), and a repeated edge fails the second time; both are cycles in a multigraph sense, so decide whether the problem allows them.

Why not use depth first search? DFS also detects a cycle in O(V + E): while exploring, an edge to an already visited vertex that is not the parent is a back edge. Union-find has advantages: it handles a stream of edges, it identifies the offending edge directly in input order, it needs no adjacency lists, and it is shorter. DFS gives the actual cycle path and works for directed graphs with the colour technique, while union-find does not.

Directed graphs: union-find ignores direction, so it cannot detect directed cycles (a directed acyclic graph can look cyclic when directions are dropped). Use DFS with three states or Kahn's topological sort for directed cycles. Union-find can detect cycles in the underlying undirected graph only.

Applications:

- Validating that a set of edges forms a tree or a forest
- Kruskal's algorithm: an edge is added only if its endpoints are in different components
- Finding the redundant connection in network design
- Detecting loops in circuit connectivity and in equivalence declarations
- Checking that a puzzle or maze has no loops (perfect mazes)

Implementation notes: return a boolean from `union`; stop at the first failing edge for a yes or no answer; collect failures for counting; use iterative find with path halving.

Testing: trees (no cycle), a triangle, graphs with isolated vertices, self loops and repeated edges.

## explain
1. Initialise a union-find over the vertices.
2. For each edge, find the roots of both endpoints.
3. If the roots are equal, report the edge as closing a cycle.
4. Otherwise union the two sets.
5. If no edge fails, report that the graph is acyclic.
6. Remember that this works only for undirected graphs.

## example
The Python program reports the cycle closing edge (3, 1) for the first sample, returns the redundant connections (2, 3) and (1, 4) for the two examples and counts 2 independent cycles in the seven edge graph. The JavaScript program checks whether a list of edges forms a valid tree for a few inputs.

## real
Network designers remove redundant links, build systems validate that dependency declarations form a forest and Kruskal's algorithm skips edges that would form cycles.

## pros
- One pass over the edges with near constant work per edge
- Identifies the edge that closes the cycle
- No adjacency lists or recursion

## cons
- Works only for undirected graphs
- Does not return the cycle path itself
- Order of edges decides which edge is reported

## uses
- Detecting a cycle in an undirected graph
- Finding the redundant connection
- Validating that a graph is a tree
- Counting independent cycles

## mistakes
- Applying it to directed graphs
- Reporting the first edge of the cycle rather than the edge that closes it
- Forgetting self loops and repeated edges
- Treating a failed union as an error rather than a signal

## interview
**Q:** How does union-find detect a cycle in an undirected graph?
**A:** For each edge find the roots of its endpoints; if the roots are equal the endpoints are already connected and the edge closes a cycle, otherwise union them.

**Q:** How do you find the redundant connection in a tree with one extra edge?
**A:** Process the edges in order with union-find and return the edge whose endpoints are already connected when it is read; removing it leaves a tree.

**Q:** Why can union-find not detect cycles in directed graphs?
**A:** It ignores direction, so a graph with directed edges a to b, a to c and b to c looks cyclic although it is acyclic; use depth first search colouring or topological sorting instead.

## summary
An edge closes a cycle in an undirected graph exactly when its endpoints already share a root, so one union-find pass over the edges detects cycles, finds redundant connections and counts independent cycles. It does not handle directed graphs.

## codenote
The Python sample detects cycles and redundant edges. The JavaScript sample validates trees.

## code
### python
```python
class DSU:
    def __init__(self, n):
        self.parent = list(range(n + 1))

    def find(self, x):
        while self.parent[x] != x:
            self.parent[x] = self.parent[self.parent[x]]
            x = self.parent[x]
        return x

    def union(self, x, y):
        a, b = self.find(x), self.find(y)
        if a == b:
            return False
        self.parent[a] = b
        return True

def first_cycle_edge(n, edges):
    dsu = DSU(n)
    for u, v in edges:
        if not dsu.union(u, v):
            return (u, v)
    return None

print(first_cycle_edge(4, [(0, 1), (1, 2), (2, 3), (3, 1)]), first_cycle_edge(4, [(0, 1), (1, 2), (2, 3)]))
print(first_cycle_edge(3, [(1, 2), (1, 3), (2, 3)]), first_cycle_edge(5, [(1, 2), (2, 3), (3, 4), (1, 4), (1, 5)]))
edges = [(0, 1), (1, 2), (0, 2), (3, 4), (4, 5), (3, 5), (2, 3)]
dsu = DSU(6)
print(sum(1 for u, v in edges if not dsu.union(u, v)), len(edges) - 6 + 1)
```
Output:
```text
(3, 1) None
(2, 3) (1, 4)
2 2
```
### javascript
```javascript
function isTree(n, edges) {
  if (edges.length !== n - 1) return false;
  const parent = Array.from({ length: n }, (_, i) => i);
  const find = (x) => {
    while (parent[x] !== x) x = parent[x] = parent[parent[x]];
    return x;
  };
  for (const [u, v] of edges) {
    const a = find(u);
    const b = find(v);
    if (a === b) return false;
    parent[a] = b;
  }
  return true;
}

console.log(isTree(5, [[0, 1], [0, 2], [0, 3], [1, 4]]), isTree(5, [[0, 1], [1, 2], [2, 0], [3, 4]]), isTree(4, [[0, 1], [2, 3]]));
```
Output:
```text
true false false
```

## quiz
1. When does an edge close a cycle?
   - [ ] When it has the largest weight
   - [x] When its endpoints already share a root
   - [ ] When it connects a leaf
   - [ ] When it is the first edge
   > There is already a path between the endpoints.
2. What is the redundant connection?
   - [ ] The first edge of the input
   - [x] The edge whose endpoints are already connected when it is processed
   - [ ] The heaviest edge
   - [ ] The shortest edge
   > Removing it leaves a tree.
3. How many independent cycles does a graph with E edges, V vertices and C components have?
   - [ ] E minus V
   - [x] E − V + C
   - [ ] V − E
   - [ ] C
   > A forest has E equal to V minus C and zero cycles.
4. Why is union-find wrong for directed cycles?
   - [ ] It is too slow
   - [x] It ignores the edge directions
   - [ ] It needs weights
   - [ ] It cannot process more than 100 edges
   > Directed acyclic graphs can look like cycles when directions are dropped.
