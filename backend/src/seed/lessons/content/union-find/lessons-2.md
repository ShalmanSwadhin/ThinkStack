# Kruskal MST with Union Find
kind: algorithm
time: O(E log E) dominated by sorting the E edges, plus O(E α(V)) for the union-find operations; since log E is at most 2 log V, the total is O(E log V).
space: O(V) for the union-find arrays plus O(E) for the sorted edge list.
viz: kruskal

## intro
A minimum spanning tree (MST) connects all vertices of a weighted undirected graph with the smallest possible total edge weight and no cycles. Kruskal's algorithm builds it greedily: look at the edges from the cheapest to the most expensive and keep an edge whenever it joins two components that were not yet connected. Union-find makes the "are these two vertices already connected?" test almost free.

## theory
Algorithm:

- Sort all edges by weight in non-decreasing order
- Create a union-find structure with every vertex in its own set
- For each edge `(u, v, w)` in order: if `find(u) != find(v)`, add the edge to the tree, add `w` to the total and union the two sets; otherwise skip the edge, since it would close a cycle
- Stop when the tree has V − 1 edges (or after all edges); if fewer than V − 1 edges were added the graph is disconnected and the result is a minimum spanning forest

Why it is correct (cut property): at any moment, the cheapest edge that connects two different components is part of some minimum spanning tree, because it is the lightest edge crossing a cut between one component and the rest. Kruskal's rule picks exactly such an edge every time. The skipped edges are cycle edges, and the heaviest edge of a cycle never needs to be in the tree.

Example: vertices A to E and the edges A-B 4, A-C 2, B-C 1, B-D 5, C-D 8, D-E 3. Sorted: B-C 1, A-C 2, D-E 3, A-B 4, B-D 5, C-D 8. Processing: B-C joins {B, C}; A-C joins A into it; D-E joins {D, E}; A-B is skipped (A and B are already connected); B-D joins the two components. The tree edges are B-C, A-C, D-E and B-D with total weight 1 + 2 + 3 + 5 = 11, using V − 1 = 4 edges; the edges A-B and C-D were rejected.

Complexity: sorting costs O(E log E). The union-find part costs O(E α(V)), nearly linear. When the edges are already sorted (or weights are small integers, allowing counting sort) the whole algorithm is nearly linear. For dense graphs Prim's algorithm with a Fibonacci heap or a simple array can be faster; for sparse graphs Kruskal's algorithm is simple and fast.

Comparison with Prim's algorithm:

- Kruskal: edge centric, grows a forest, needs sorting and union-find, handles disconnected graphs naturally (gives a forest), good for sparse graphs and for edge lists
- Prim: vertex centric, grows a single tree from a start vertex with a priority queue, good for dense graphs and adjacency lists

Properties and variations:

- Uniqueness: if all edge weights are distinct, the MST is unique; with ties several MSTs of the same total weight exist
- Maximum spanning tree: sort in descending order
- Minimum spanning forest: run it on a disconnected graph
- Second best MST and the minimum bottleneck spanning tree: the MST also minimises the largest edge on the tree, and the path between two vertices in the MST minimises the maximum edge along any path
- Clustering: stop Kruskal's algorithm when k components remain (single linkage clustering with k clusters)
- Network design: connecting cities with the cheapest cable, laying pipes, building circuits
- Approximation algorithms for the travelling salesman problem use the MST (the Christofides and the doubling heuristics)

Implementation notes:

- Store edges as tuples `(weight, u, v)` so a plain sort works
- Use union by size and path compression
- Count the unions done and stop early at V − 1
- For equal weights, any order gives a valid MST, but sort stability makes results reproducible
- Return both the edges and the total weight in a test, and compare the weight with Prim's algorithm on random graphs

Pitfalls: sorting by the wrong key, forgetting to find the roots before comparing, adding an edge without uniting (so cycles slip in later), not handling disconnected graphs (the result has fewer than V − 1 edges) and integer overflow on big weights.

Testing: graphs with unique weights (compare with a brute-force minimum over all spanning trees for small V), graphs with equal weights, disconnected graphs and a single vertex.

## explain
1. Sort the edges by weight.
2. Create a union-find structure with a set per vertex.
3. Take the next cheapest edge and check whether its endpoints are in different sets.
4. If so, keep the edge, add its weight and union the sets.
5. Otherwise skip it because it would form a cycle.
6. Stop after V minus 1 edges and check that the graph was connected.

## example
The Python program runs Kruskal's algorithm on the five vertex sample graph and prints the chosen edges B-C, A-C, D-E and B-D with the total weight 11, and compares the total weight with a brute-force minimum over all spanning trees. The JavaScript program runs it on a second graph and prints the number of edges rejected.

## real
Utility companies plan the cheapest cable or pipe layout between sites, clustering tools use truncated Kruskal's algorithm for single linkage groups and circuit designers connect pins with minimum wire length.

## pros
- Simple greedy algorithm with a clear correctness proof
- Works directly on an edge list
- Produces a spanning forest for disconnected graphs

## cons
- Sorting dominates the running time
- Needs all edges in memory
- Prim's algorithm can be faster on very dense graphs

## uses
- Minimum cost network design
- Single linkage clustering
- Approximating the travelling salesman problem
- Finding the minimum bottleneck path

## mistakes
- Sorting the edges in descending order for a minimum spanning tree
- Adding an edge without checking whether its endpoints are connected
- Forgetting to detect a disconnected graph
- Mixing up the edge tuple order so that weights are not the sort key

## interview
**Q:** How does Kruskal's algorithm work?
**A:** It sorts the edges by weight and adds each edge to the tree if its endpoints are in different components, tracked with union-find, skipping edges that would form a cycle, until V minus 1 edges are chosen.

**Q:** What is the time complexity of Kruskal's algorithm?
**A:** O(E log E) for sorting plus O(E α(V)) for union-find, which is O(E log V) overall.

**Q:** Why is the greedy choice of the cheapest safe edge correct?
**A:** By the cut property, the cheapest edge crossing any cut that respects the chosen edges belongs to some minimum spanning tree, and Kruskal's algorithm always picks such an edge.

## summary
Kruskal's algorithm sorts the edges and keeps each edge whose endpoints are in different union-find sets, building a minimum spanning tree in O(E log V). The cut property justifies the greedy choice, and the same loop yields spanning forests and clusters.

## codenote
The Python sample runs Kruskal's algorithm and verifies it by brute force. The JavaScript sample counts rejected edges.

## code
### python
```python
from itertools import combinations

class DSU:
    def __init__(self, vertices):
        self.parent = {v: v for v in vertices}

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

def kruskal(vertices, edges):
    dsu, chosen, total = DSU(vertices), [], 0
    for weight, u, v in sorted(edges):
        if dsu.union(u, v):
            chosen.append((u, v, weight))
            total += weight
    return chosen, total

vertices = "ABCDE"
edges = [(4, "A", "B"), (2, "A", "C"), (1, "B", "C"), (5, "B", "D"), (8, "C", "D"), (3, "D", "E")]
chosen, total = kruskal(vertices, edges)
print(chosen, total)

best = None
for subset in combinations(edges, len(vertices) - 1):
    dsu = DSU(vertices)
    if all(dsu.union(u, v) for _, u, v in subset):
        weight = sum(w for w, _, _ in subset)
        best = weight if best is None else min(best, weight)
print(best)
```
Output:
```text
[('B', 'C', 1), ('A', 'C', 2), ('D', 'E', 3), ('B', 'D', 5)] 11
11
```
### javascript
```javascript
function kruskal(n, edges) {
  const parent = Array.from({ length: n }, (_, i) => i);
  const find = (x) => {
    while (parent[x] !== x) x = parent[x] = parent[parent[x]];
    return x;
  };
  let total = 0;
  let rejected = 0;
  const chosen = [];
  for (const [w, u, v] of [...edges].sort((a, b) => a[0] - b[0])) {
    const a = find(u);
    const b = find(v);
    if (a === b) {
      rejected++;
      continue;
    }
    parent[a] = b;
    chosen.push(u + "-" + v);
    total += w;
  }
  return [total, chosen.join(" "), rejected];
}

console.log(kruskal(6, [[7, 0, 1], [5, 0, 3], [8, 1, 2], [9, 1, 3], [7, 1, 4], [5, 2, 4], [15, 3, 4], [6, 3, 5], [8, 4, 5]]));
```
Output:
```text
[ 30, '0-3 2-4 3-5 0-1 1-4', 4 ]
```

## quiz
1. In what order does Kruskal's algorithm consider the edges?
   - [ ] By vertex number
   - [x] From the lightest to the heaviest
   - [ ] From the heaviest to the lightest
   - [ ] Randomly
   > The cheapest safe edge is always selected first.
2. When is an edge skipped?
   - [ ] When it is the heaviest
   - [x] When its endpoints are already connected
   - [ ] When it touches vertex A
   - [ ] When it is the first edge
   > Adding it would close a cycle.
3. How many edges does a minimum spanning tree of V vertices have?
   - [ ] V
   - [x] V − 1
   - [ ] V + 1
   - [ ] 2V
   > A tree with V vertices has V minus 1 edges.
4. What dominates the running time?
   - [ ] The union-find operations
   - [x] Sorting the edges
   - [ ] Reading the vertices
   - [ ] Printing the result
   > Sorting costs O(E log E), while union-find is nearly linear.

# Number of Islands Union Find
kind: algorithm
time: O(R · C · α(R · C)) to count islands in an R by C grid with union-find, which is essentially O(R · C); each cell triggers at most two unions with its right and lower neighbours.
space: O(R · C) for the parent and size arrays over all cells.

## intro
Given a grid of land (1) and water (0), count the islands: groups of land cells connected horizontally or vertically. Depth first search or breadth first search solves it in a few lines, but union-find offers something they cannot do easily: it handles land cells that are added over time, reporting the island count after every addition.

## theory
Static version with union-find:

- Number each cell `r * cols + c` and create a DSU over all cells
- Count the land cells as the initial number of components
- For every land cell, look at its right and lower neighbours; if a neighbour is land, union the two cells and decrease the count whenever the union merges two different sets
- The final count is the number of islands

For the grid with rows `11000`, `11000`, `00100` and `00011` there are 3 islands: the 2 by 2 block in the top left, the single cell in the middle and the two cells in the bottom right. For the grid `11110`, `11010`, `11000`, `00000` there is 1 island.

Comparison with search: depth first search from each unvisited land cell, marking visited cells, costs O(R · C) with recursion (watch the stack depth on large grids) or an explicit stack. Union-find costs about the same, avoids deep recursion and needs the DSU arrays, which is a drawback only for memory.

Online version (islands II): the grid starts as water, and a sequence of positions turns into land one by one; after each addition report the number of islands.

- Maintain the island count; when a cell becomes land, increase the count by one (a new island)
- Union it with each of its four land neighbours, and decrease the count for every union that merged two different sets
- Ignore a position that is already land (duplicates)

For a 3 by 3 grid and the additions (0, 0), (0, 1), (1, 2), (2, 1), (1, 1) the island counts after each addition are 1, 1, 2, 3, 1: the first two cells join into one island, (1, 2) and (2, 1) start new islands, and (1, 1) touches (0, 1), (1, 2) and (2, 1), merging all of them into a single island. Doing this with searches would need a new scan after every addition, O(R · C) per step, while union-find costs about four unions per addition.

Other grid problems solved with the same machinery:

- Largest island: track component sizes with union by size
- Making a large island by flipping a single water cell: for each water cell sum the sizes of its distinct neighbouring islands plus one
- Surrounded regions and closed islands: union border cells with a virtual node that represents the outside
- Number of distinct islands (shape matching) needs canonical forms and is a search problem
- Percolation: does a path of open cells connect the top row to the bottom row? Use two virtual nodes (top and bottom) and union open cells with neighbours; the system percolates when the virtual nodes are connected
- Bricks falling when hit (processed in reverse with union-find)
- 8-directional connectivity (diagonals count): add the diagonal neighbours to the union step

Implementation details:

- Map a cell to an index with `r * cols + c`
- Process only right and down neighbours in the static version to avoid doing every pair twice
- Check bounds before reading a neighbour
- For the online version store land cells in a set or a boolean grid so that duplicate additions are ignored
- Use iterative find with path halving to avoid recursion

Pitfalls: counting components as the number of land cells minus unions but forgetting to ignore duplicate additions, mapping with the wrong column count, treating water cells as islands and mixing up rows and columns for non-square grids.

Testing: compare with a depth first search count on random grids; test all water, all land and single row or column grids.

## explain
1. Index each cell as row times the column count plus the column.
2. Start the island count at the number of land cells.
3. For each land cell, union it with land cells to the right and below.
4. Decrease the count each time a union merges two different sets.
5. For the online version add land one cell at a time and union with its land neighbours.
6. Compare the result with a depth first search on random grids.

## example
The Python program counts the islands of the two sample grids (3 and 1) with union-find and prints the island counts after each of the five additions in the online example: 1, 1, 2, 3, 1. The JavaScript program verifies the static count against a depth first search on 100 seeded random grids and prints `true`.

## real
Satellite image analysis counts land masses and cloud clusters, games compute connected regions on tile maps, and map editors report how many separate areas a region contains.

## pros
- Handles cells that turn into land over time
- Avoids deep recursion on large grids
- The same code gives component sizes

## cons
- Uses extra memory for the DSU arrays
- More code than a simple flood fill for a static grid
- Needs careful index mapping and bounds checks

## uses
- Counting islands and regions in grids
- Online island counting as land is added
- Percolation experiments
- Region sizes and largest island questions

## mistakes
- Counting duplicates when the same cell is added twice
- Using the wrong column count in the index formula
- Forgetting the bounds check for neighbours
- Treating water cells as part of the DSU

## interview
**Q:** How do you count islands with union-find?
**A:** Start with one component per land cell, union each land cell with its land neighbours to the right and below, and decrease the component count every time a union merges two different sets.

**Q:** Why is union-find useful for the version where land is added over time?
**A:** After each addition only the new cell's neighbours need to be unioned, so each step costs a few near constant operations, while a search would rescan the grid every time.

**Q:** How do you test percolation with union-find?
**A:** Add a virtual top node connected to the first row and a virtual bottom node connected to the last row; the system percolates when the two virtual nodes become connected.

## summary
Union-find counts islands by merging adjacent land cells and tracking successful unions, and it also answers the island count after each new land cell in near constant time. The same structure supports sizes, percolation and region problems.

## codenote
The Python sample counts islands statically and online. The JavaScript sample verifies against depth first search.

## code
### python
```python
class DSU:
    def __init__(self, n):
        self.parent = list(range(n))

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

def count_islands(grid):
    rows, cols = len(grid), len(grid[0])
    dsu = DSU(rows * cols)
    islands = sum(row.count("1") for row in grid)
    for r in range(rows):
        for c in range(cols):
            if grid[r][c] != "1":
                continue
            for nr, nc in ((r + 1, c), (r, c + 1)):
                if nr < rows and nc < cols and grid[nr][nc] == "1":
                    if dsu.union(r * cols + c, nr * cols + nc):
                        islands -= 1
    return islands

def online(rows, cols, positions):
    dsu, land, count, out = DSU(rows * cols), set(), 0, []
    for r, c in positions:
        if (r, c) not in land:
            land.add((r, c))
            count += 1
            for nr, nc in ((r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1)):
                if (nr, nc) in land and dsu.union(r * cols + c, nr * cols + nc):
                    count -= 1
        out.append(count)
    return out

print(count_islands(["11000", "11000", "00100", "00011"]), count_islands(["11110", "11010", "11000", "00000"]))
print(online(3, 3, [(0, 0), (0, 1), (1, 2), (2, 1), (1, 1)]))
```
Output:
```text
3 1
[1, 1, 2, 3, 1]
```
### javascript
```javascript
function unionFindCount(grid) {
  const rows = grid.length;
  const cols = grid[0].length;
  const parent = Array.from({ length: rows * cols }, (_, i) => i);
  const find = (x) => {
    while (parent[x] !== x) x = parent[x] = parent[parent[x]];
    return x;
  };
  let islands = 0;
  for (const row of grid) for (const cell of row) islands += cell;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (!grid[r][c]) continue;
      for (const [nr, nc] of [[r + 1, c], [r, c + 1]]) {
        if (nr < rows && nc < cols && grid[nr][nc]) {
          const a = find(r * cols + c);
          const b = find(nr * cols + nc);
          if (a !== b) {
            parent[a] = b;
            islands--;
          }
        }
      }
    }
  }
  return islands;
}

function dfsCount(grid) {
  const seen = grid.map((row) => row.map(() => false));
  let islands = 0;
  const visit = (r, c) => {
    if (r < 0 || c < 0 || r >= grid.length || c >= grid[0].length || !grid[r][c] || seen[r][c]) return;
    seen[r][c] = true;
    [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dr, dc]) => visit(r + dr, c + dc));
  };
  grid.forEach((row, r) => row.forEach((cell, c) => {
    if (cell && !seen[r][c]) {
      islands++;
      visit(r, c);
    }
  }));
  return islands;
}

let seed = 17;
const random = () => (seed = (seed * 48271) % 2147483647) / 2147483647;
let same = true;
for (let t = 0; t < 100; t++) {
  const grid = Array.from({ length: 6 }, () => Array.from({ length: 7 }, () => (random() < 0.45 ? 1 : 0)));
  same = same && unionFindCount(grid) === dfsCount(grid);
}
console.log(same);
```
Output:
```text
true
```

## quiz
1. How is the initial island count set in the static union-find method?
   - [ ] To zero
   - [x] To the number of land cells
   - [ ] To the number of water cells
   - [ ] To the number of rows
   > Each land cell starts as its own component.
2. When does the count decrease?
   - [ ] For every land neighbour
   - [x] Each time a union merges two different sets
   - [ ] For every water cell
   - [ ] Never
   > A merge reduces the number of islands by one.
3. Why is union-find handy when land is added over time?
   - [ ] It needs no memory
   - [x] Each addition needs only a few unions with neighbours instead of a new scan
   - [ ] It sorts the positions
   - [ ] It removes duplicates automatically
   > The previous structure is reused.
4. How can percolation be tested?
   - [ ] By counting all islands
   - [x] With virtual top and bottom nodes and a check whether they are connected
   - [ ] By sorting rows
   - [ ] By a recursion on cells
   > The two virtual nodes connect the first and last rows.

# Dynamic Connectivity
kind: algorithm
time: O(log n) per operation for incremental connectivity with union by size (no path compression) and rollback; offline connectivity with deletions costs O(m log m log n) using divide and conquer over time with a rollback union-find.
space: O(n + m) for the structure and the stack of changes, plus O(m log m) for the interval tree of edge lifetimes in the offline method.

## intro
Dynamic connectivity asks whether two vertices are connected while edges are added and removed over time. Incremental connectivity (only additions) is exactly what union-find does. Deletions break it, because a merge cannot simply be undone. For problems where all operations are known in advance, an offline technique with a rollback union-find handles deletions in polylogarithmic time.

## theory
Three flavours of the problem:

- Incremental: edges are only added. Plain union-find, near constant time per operation.
- Decremental: edges are only removed. Reverse time: process the operations backwards, turning deletions into additions (offline).
- Fully dynamic: both additions and deletions, with connectivity queries in between. Online solutions exist (Holm, de Lichtenberg and Thorup; link-cut trees for forests) but are complex; offline solutions are simpler.

Rollback union-find (undoable union-find): use union by size without path compression (compression makes undoing hard). Each successful union records which root was attached to which (and the size change) on a stack. To undo the last union, pop the record, detach the child root and restore the size. Finds cost O(log n), since the height is at most log n with union by size.

Reverse time for decremental problems: if edges are only removed, start from the final graph (after all deletions), then answer the queries in reverse order, adding the edges back with ordinary union-find. A question such as "after each removal, how many components are there?" is answered by the counts in the reverse process.

Offline dynamic connectivity (divide and conquer over time): every edge exists for a time interval `[start, end)`. Build a segment tree over the time axis `[0, T)` and insert each edge into the O(log T) nodes that cover its interval. Then traverse the segment tree depth first:

- Entering a node: union the endpoints of every edge stored at the node (recording the changes on the rollback stack)
- At a leaf (a single time point): answer the connectivity queries of that time
- Leaving the node: roll back the unions made at it

Each edge is added to O(log T) nodes, and each insertion costs one rollback union (O(log n)), so the total cost is O(m log T log n) for m edge lifetimes. The structure is called offline because all operations must be known before processing.

Example: vertices 0 to 3. Operations over time: add edge (0, 1) at time 0, add (1, 2) at time 1, query (0, 2) at time 2 (connected), delete (1, 2) at time 3, query (0, 2) at time 4 (not connected). An online incremental structure would claim they stay connected forever. The offline method assigns the edge (1, 2) the lifetime [1, 3) and answers both queries correctly: true at time 2 and false at time 4.

Rollback demonstration: unions applied on a stack, with the answers before and after undoing the last union show that connectivity returns to the earlier state. In the sample code the connectivity of 0 and 2 changes from true to false after undoing the second union.

Other variants and tools:

- Offline connectivity with a minimum spanning forest: maintain a forest where each edge's weight is its deletion time, so the edge that disappears last is kept (a maximum spanning forest by deletion time); link-cut trees implement this online-offline
- Bridges and 2-edge-connectivity under insertions: union-find on the bridge tree
- Counting components after each edge removal for a graph given up front: reverse processing
- Bipartiteness under changes: union-find with parity (a DSU that stores whether a node has the same or opposite colour as its parent)

Pitfalls: path compression with rollbacks (breaks the undo records), forgetting to roll back after returning from a recursion branch, giving an edge the wrong interval (half open versus closed), and queries at times when no operation happens.

Testing: compare with a brute-force connectivity check (breadth first search on the current edge set) for each query on small random operation sequences.

## explain
1. Classify the problem: additions only, deletions only or both.
2. For additions only, use the standard union-find.
3. For deletions only, process the operations in reverse as additions.
4. For both with all operations known, assign each edge a time interval and insert it into a segment tree over time.
5. Traverse the segment tree with a rollback union-find, undoing the unions when leaving a node.
6. Compare with a brute-force search on small random inputs.

## example
The Python class implements a rollback union-find, applies two unions, shows that 0 and 2 are connected, rolls back the last union and shows they are disconnected, then answers the timed example offline with a time segment tree: true at time 2 and false at time 4. The JavaScript program solves a decremental problem by reversing time and prints the component counts after each removal.

## real
Network operations tools track which servers can reach each other while links fail and recover, version control systems reason about connectivity between commits under graph changes and some game engines maintain dynamic region connectivity.

## pros
- Offline techniques give polylogarithmic time for deletions
- Rollback union-find is a small extension of the ordinary structure
- Reverse time turns deletions into additions

## cons
- Requires knowing all operations in advance for the simple solutions
- Rollback forbids path compression, so finds are O(log n)
- The time segment tree approach is more complex to implement

## uses
- Connectivity under insertions and deletions
- Counting components after removals
- Offline graph queries over time
- Bipartiteness checks with changing edges

## mistakes
- Using path compression in a structure that must roll back
- Forgetting to undo the unions after leaving a segment tree node
- Misassigning the half open time interval of an edge
- Answering queries after the edge is deleted because of an off-by-one in time

## interview
**Q:** Why can't plain union-find handle edge deletions?
**A:** A union merges two sets into one and the structure does not remember how the merge happened, so removing an edge cannot restore the previous groups; connectivity after a deletion depends on other paths that the structure has not recorded.

**Q:** How can deletions be handled offline?
**A:** Give every edge a lifetime interval, insert the edge into the nodes of a segment tree over time that cover the interval, and traverse the tree with a rollback union-find, applying edges when entering a node and undoing them when leaving.

**Q:** Why does the rollback union-find skip path compression?
**A:** Path compression changes many parent pointers during finds, which would need to be recorded and undone; union by size alone keeps the height logarithmic and each union is a single reversible change.

## summary
Union-find handles edge additions; deletions need either reversed time for removal-only problems or an offline segment tree over time with a rollback union-find. Avoid path compression when undoing is required.

## codenote
The Python sample implements the rollback structure and the offline method. The JavaScript sample processes removals in reverse.

## code
### python
```python
class RollbackDSU:
    def __init__(self, n):
        self.parent = list(range(n))
        self.size = [1] * n
        self.history = []

    def find(self, x):
        while self.parent[x] != x:
            x = self.parent[x]
        return x

    def union(self, x, y):
        a, b = self.find(x), self.find(y)
        if a == b:
            self.history.append(None)
            return
        if self.size[a] < self.size[b]:
            a, b = b, a
        self.parent[b] = a
        self.size[a] += self.size[b]
        self.history.append(b)

    def rollback(self):
        b = self.history.pop()
        if b is not None:
            a = self.parent[b]
            self.size[a] -= self.size[b]
            self.parent[b] = b

    def connected(self, x, y):
        return self.find(x) == self.find(y)

dsu = RollbackDSU(4)
dsu.union(0, 1)
dsu.union(1, 2)
print(dsu.connected(0, 2))
dsu.rollback()
print(dsu.connected(0, 2), dsu.connected(0, 1))

edges = {(0, 1): (0, 100), (1, 2): (1, 3)}
queries = {2: (0, 2), 4: (0, 2)}
horizon = 5
tree = [[] for _ in range(4 * horizon)]

def insert(node, left, right, ql, qr, edge):
    if qr <= left or right <= ql:
        return
    if ql <= left and right <= qr:
        tree[node].append(edge)
        return
    mid = (left + right) // 2
    insert(2 * node, left, mid, ql, qr, edge)
    insert(2 * node + 1, mid, right, ql, qr, edge)

for edge, (start, end) in edges.items():
    insert(1, 0, horizon, start, min(end, horizon), edge)

answers = {}
offline = RollbackDSU(4)

def walk(node, left, right):
    for u, v in tree[node]:
        offline.union(u, v)
    if right - left == 1:
        if left in queries:
            answers[left] = offline.connected(*queries[left])
    else:
        mid = (left + right) // 2
        walk(2 * node, left, mid)
        walk(2 * node + 1, mid, right)
    for _ in tree[node]:
        offline.rollback()

walk(1, 0, horizon)
print(answers)
```
Output:
```text
True
False True
{2: True, 4: False}
```
### javascript
```javascript
function componentsAfterRemovals(n, edges, removalOrder) {
  const removed = new Set(removalOrder);
  const parent = Array.from({ length: n }, (_, i) => i);
  const find = (x) => {
    while (parent[x] !== x) x = parent[x] = parent[parent[x]];
    return x;
  };
  let components = n;
  const add = (index) => {
    const a = find(edges[index][0]);
    const b = find(edges[index][1]);
    if (a !== b) {
      parent[a] = b;
      components--;
    }
  };
  edges.forEach((_, i) => {
    if (!removed.has(i)) add(i);
  });
  const answers = [];
  for (let i = removalOrder.length - 1; i >= 0; i--) {
    answers.push(components);
    add(removalOrder[i]);
  }
  return answers.reverse();
}

console.log(componentsAfterRemovals(5, [[0, 1], [1, 2], [2, 3], [3, 4], [0, 4]], [4, 1, 2]).join(" "));
```
Output:
```text
1 2 3
```

## quiz
1. Why does a standard union-find fail for deletions?
   - [ ] It is too slow
   - [x] It does not record how sets were merged, so a merge cannot be undone
   - [ ] It needs sorting
   - [ ] It cannot store edges
   > Other paths may keep vertices connected.
2. How can removal-only problems be solved?
   - [ ] By ignoring removals
   - [x] By processing the operations in reverse order as additions
   - [ ] By sorting the edges
   - [ ] By path compression
   > A deletion becomes an insertion in reverse time.
3. Why must a rollback union-find avoid path compression?
   - [ ] Compression is slow
   - [x] It changes many parent pointers that would need to be undone
   - [ ] It breaks union by size
   - [ ] It requires recursion
   > Union by size keeps the structure logarithmic and reversible.
4. What does the segment tree over time store?
   - [ ] Component counts
   - [x] Edges at the nodes that cover their lifetime intervals
   - [ ] Queries only
   - [ ] The parent array
   > Each edge is applied when the traversal enters those nodes.

# Offline Queries with DSU
kind: algorithm
time: O((E + Q) log (E + Q)) for sorting E edges and Q queries by a threshold, plus O((E + Q) α(V)) for the union-find operations.
space: O(V + E + Q) for the structure, the sorted edges and the stored answers in the original order.

## intro
Some questions about a graph depend on a threshold: can u reach v using only edges lighter than w? Answering each query by searching the graph is too slow. If all queries are known in advance, they can be sorted by their threshold and answered in one sweep that adds the edges in increasing order of weight to a union-find. Reordering the queries to make an incremental structure applicable is the offline trick.

## theory
Offline processing idea: when queries are given upfront, you may answer them in any order, as long as you report the answers in the original order. Choose an order that lets the data structure only grow.

Weight limited reachability: given edges `(u, v, weight)` and queries `(p, q, limit)`, a query asks whether there is a path from p to q in which every edge has weight strictly less than `limit`.

- Sort the edges by weight
- Sort the queries by limit, remembering their original indices
- Maintain a pointer into the sorted edges; for each query in order of increasing limit, union all edges with weight less than the limit that have not yet been added
- Answer the query with `find(p) == find(q)`
- Store the answer at the query's original index

Example: n = 3, edges `(0, 1, 2)`, `(1, 2, 4)`, `(2, 0, 8)`, `(1, 0, 16)` and queries `(0, 1, 2)` and `(0, 2, 5)`. Sorted queries: limit 2, then limit 5. For limit 2 no edge has a weight below 2, so 0 and 1 are not connected: false. For limit 5 the edges of weight 2 and 4 are added, connecting 0, 1 and 2: true. The answers in the original order are false, true.

Cost: sorting both lists O(E log E + Q log Q), and one pass of unions, O((E + Q) α(V)). Answering each query online with a search would cost O(V + E) per query.

Other problems with the same pattern:

- Minimum time (or weight) until two vertices become connected: sort edges and union until the pair is connected; the weight of the edge that connects them is the answer (the minimum bottleneck path value). For the edges with weights 1, 3, 4 and 7 between 0-1, 1-2, 2-3 and 0-3, the bottleneck from 0 to 2 is 3.
- Earliest moment when everyone is acquainted: logs sorted by timestamp; union the pair of each log and report the timestamp when the component count reaches 1. For 4 people and logs `(2, 0, 1)`, `(5, 1, 2)`, `(9, 2, 3)` the answer is 9; if some person is never connected the answer is −1.
- Graph connectivity with a threshold: cities connected if they share a divisor greater than a threshold; union each number with its multiples, then answer queries
- Checking edge existence under a length limit (as above)
- Kruskal reconstruction tree: a tree built during Kruskal's algorithm that answers bottleneck path queries via the lowest common ancestor
- Sweep line with union-find: process events in sorted order while merging intervals or components, as in the maximum meeting overlap or satisfying bounds

Offline with removals in reverse: queries on a structure that loses items can be answered by adding the items back in reverse (previous lesson).

When offline is not possible: online requests where each query depends on earlier answers need persistent or dynamic structures.

Implementation notes:

- Keep a list of (limit, original index, p, q) and sort by limit
- Use strict or non-strict comparison exactly as the problem says (less than versus less or equal)
- Use iterative find with path halving and union by size
- Store answers in an array indexed by the original positions
- Beware of equal limits: queries with the same limit can be processed in any order

Pitfalls: forgetting to restore the original order, off-by-one in the weight comparison, re-adding edges for every query (the pointer must only move forward) and sorting queries without their indices.

Testing: compare with a brute-force search that uses only edges below the limit for each query, on random graphs.

## explain
1. Sort the edges by weight and the queries by limit, keeping the original query indices.
2. Keep a pointer to the next unprocessed edge.
3. For each query, add all edges whose weight is below the limit by union.
4. Answer the query by comparing the roots of its endpoints.
5. Write the answer to the query's original position.
6. Verify with a brute-force search on random inputs.

## example
The Python function answers the weight limited reachability example, giving false and true, and checks 100 seeded random cases against a breadth first search. The JavaScript function finds the earliest time when all people know each other for the sample logs: 9 for the connected case and −1 when someone is isolated.

## real
Network planners ask whether a route exists under bandwidth or latency limits, social platforms find when a community becomes fully connected and mapping tools answer weight bounded path questions in batches.

## pros
- Turns many expensive searches into one sorted sweep
- Uses the incremental strength of union-find
- Simple to implement and verify

## cons
- Requires all queries in advance
- Answers must be reordered to the original order
- Threshold conditions need careful comparisons

## uses
- Weight limited path existence queries
- Earliest time when a graph becomes connected
- Minimum bottleneck path values
- Batch connectivity questions

## mistakes
- Returning answers in sorted order instead of the original order
- Using the wrong comparison, strict versus non-strict
- Resetting the edge pointer for each query
- Forgetting to sort the queries by their threshold

## interview
**Q:** What does offline processing mean for queries?
**A:** All queries are known in advance, so they can be reordered to suit the algorithm, as long as the answers are reported in the original order.

**Q:** How do you answer whether two nodes are connected using only edges lighter than a limit?
**A:** Sort edges by weight and queries by limit, then sweep through the queries in increasing limit order, adding the edges below the limit to a union-find and comparing the roots of the query nodes.

**Q:** How do you find the earliest time at which everyone knows everyone?
**A:** Sort the logs by time, union the two people in each log and return the timestamp at which the number of components becomes one, or −1 if it never does.

## summary
Sorting queries by threshold and edges by weight lets one union-find sweep answer all connectivity queries in O((E + Q) log (E + Q)). Keep the original indices and the comparison direction right.

## codenote
The Python sample answers limited path queries. The JavaScript sample finds the earliest connection time.

## code
### python
```python
import random
from collections import deque

class DSU:
    def __init__(self, n):
        self.parent = list(range(n))

    def find(self, x):
        while self.parent[x] != x:
            self.parent[x] = self.parent[self.parent[x]]
            x = self.parent[x]
        return x

    def union(self, x, y):
        self.parent[self.find(x)] = self.find(y)

def limited_paths(n, edges, queries):
    dsu, answers, pointer = DSU(n), [False] * len(queries), 0
    edges = sorted(edges, key=lambda e: e[2])
    for limit, index, p, q in sorted((limit, i, p, q) for i, (p, q, limit) in enumerate(queries)):
        while pointer < len(edges) and edges[pointer][2] < limit:
            dsu.union(edges[pointer][0], edges[pointer][1])
            pointer += 1
        answers[index] = dsu.find(p) == dsu.find(q)
    return answers

def brute(n, edges, queries):
    out = []
    for p, q, limit in queries:
        graph = {i: [] for i in range(n)}
        for u, v, w in edges:
            if w < limit:
                graph[u].append(v)
                graph[v].append(u)
        seen, queue = {p}, deque([p])
        while queue:
            for nxt in graph[queue.popleft()]:
                if nxt not in seen:
                    seen.add(nxt)
                    queue.append(nxt)
        out.append(q in seen)
    return out

print(limited_paths(3, [(0, 1, 2), (1, 2, 4), (2, 0, 8), (1, 0, 16)], [(0, 1, 2), (0, 2, 5)]))
rng = random.Random(8)
ok = True
for _ in range(100):
    n = rng.randint(2, 8)
    edges = [(rng.randrange(n), rng.randrange(n), rng.randint(1, 10)) for _ in range(rng.randint(0, 10))]
    queries = [(rng.randrange(n), rng.randrange(n), rng.randint(1, 11)) for _ in range(6)]
    ok = ok and limited_paths(n, edges, queries) == brute(n, edges, queries)
print(ok)
```
Output:
```text
[False, True]
True
```
### javascript
```javascript
function earliestAcquaintance(logs, n) {
  const parent = Array.from({ length: n }, (_, i) => i);
  const find = (x) => {
    while (parent[x] !== x) x = parent[x] = parent[parent[x]];
    return x;
  };
  let groups = n;
  for (const [time, a, b] of [...logs].sort((x, y) => x[0] - y[0])) {
    const ra = find(a);
    const rb = find(b);
    if (ra !== rb) {
      parent[ra] = rb;
      groups--;
      if (groups === 1) return time;
    }
  }
  return -1;
}

console.log(earliestAcquaintance([[5, 1, 2], [2, 0, 1], [9, 2, 3]], 4), earliestAcquaintance([[2, 0, 1], [5, 1, 2]], 4));
```
Output:
```text
9 -1
```

## quiz
1. What does offline processing allow?
   - [ ] Skipping some queries
   - [x] Reordering the queries to suit the algorithm
   - [ ] Changing the graph
   - [ ] Avoiding sorting entirely
   > The answers are returned in the original order afterwards.
2. In which order are the queries processed for threshold problems?
   - [ ] In input order
   - [x] In increasing order of their limit
   - [ ] In decreasing order of their limit
   - [ ] Randomly
   > Edges below the limit are only ever added.
3. Why must the original query index be stored?
   - [ ] To check duplicates
   - [x] To report the answers in the original order after sorting
   - [ ] To index the edges
   - [ ] To compute the limit
   > Sorting destroys the input order.
4. What is the answer when someone never becomes connected in the earliest acquaintance problem?
   - [ ] 0
   - [x] −1
   - [ ] The last timestamp
   - [ ] The number of people
   > The component count never reaches one.

# Union Find Complexity
kind: concept
time: Not an algorithmic topic — this lesson explains the cost analysis. Union by rank with path compression gives O(α(n)) amortised time per operation, where α is the inverse Ackermann function, so m operations on n elements cost O(m α(n)).
space: Not an algorithmic topic — the structure needs O(n) memory: one parent entry and one rank or size entry per element.

## intro
Union-find is famous for a strange bound: nearly constant time, but not quite constant. The cost per operation is the inverse Ackermann function of n, a function that grows so slowly that it is below 5 for any input that fits in the observable universe. Understanding why the structure achieves it, and what each optimisation contributes, explains why union-find is considered practically free.

## theory
Variants and their bounds for m operations on n elements:

- Quick find (label array): `find` O(1), `union` O(n); m operations cost O(m n)
- Quick union (parent array, no rule): `find` and `union` O(n) worst case; m operations cost O(m n)
- Union by size or rank only: tree height at most log2 n, so each operation costs O(log n); m operations cost O(m log n)
- Path compression only: amortised O(log n) per operation (about O(m log_{1 + m/n} n) in general)
- Union by rank and path compression: O(m α(n)) total, optimal for this problem (Fredman and Saks proved the lower bound in the cell probe model: Ω(α(n)) amortised is unavoidable)

The inverse Ackermann function: the Ackermann function A(m, n) is defined recursively with `A(0, n) = n + 1`, `A(m, 0) = A(m − 1, 1)` and `A(m, n) = A(m − 1, A(m, n − 1))`; it grows faster than any primitive recursive function. Small values: A(1, 1) = 3, A(2, 2) = 7, A(3, 3) = 61, and A(4, 4) is a tower of exponents too large to write. The inverse α(n) is the smallest k such that A(k, k) is at least n. Since A(3, 3) = 61 and A(4, 4) is astronomically large, α(n) is at most 4 for every n up to far beyond the number of atoms in the universe, so for all practical purposes it is a constant.

Why compression and rank help together: union by rank limits how tall a tree can become; path compression flattens the trees that are queried, so the cost of repeated finds drops. The proof (Tarjan 1975) charges the cost of each step to a potential function based on ranks and shows that the total number of parent changes is bounded by m α(n). The intuition: a node's parent can only move to a higher rank ancestor, and the number of times it can do so within a rank group is limited, so only a few levels of "rank groups" (about α(n)) matter.

Measurements: counting the parent steps for random unions and finds on 10,000 elements shows the large gap between the variants: quick union without any rule can cost millions of steps on adversarial input, union by size alone stays under about log2 n = 13 steps per find at worst, and both optimisations together average close to 2 steps per find in practice. The sample code counts the steps: for n = 2000 elements joined into a chain by the unions of neighbours followed by 4000 seeded random operations, the total number of parent steps is about 8 million with no rule and about 10 thousand with either optimisation or both.

Single operation versus amortised: a single find can still take O(log n) steps, with the compression making later finds cheap. If a hard real-time system needs a bound on every operation, the amortised guarantee is not enough, and structures with worst case bounds (or bounded variants) are needed.

Memory and constants: the structure is two integer arrays; operations are tight loops with random memory access, so large instances are bounded by cache misses rather than by the arithmetic. Path halving and path splitting need one pass and are slightly faster than the two pass full compression.

Practical advice:

- Always use union by size or rank plus path compression (or halving) unless you need rollbacks
- With rollbacks use union by size only and expect O(log n) finds
- Count steps in tests to verify the optimisations are active (a missing compression is a silent performance bug)
- The α(n) factor can be treated as a constant in complexity statements for interviews, but mention it for accuracy: "O(α(n)) amortised, effectively constant"

Related results: the same bound holds for many linking and compressing variants; the offline version (Tarjan's offline LCA) also runs in near linear time; for restricted union patterns (linking only along a path), linear time algorithms exist.

## explain
1. List the variants: quick find, quick union, with rank only, with compression only, with both.
2. State the cost of each for m operations on n elements.
3. Define the inverse Ackermann function and show how slowly it grows.
4. Explain why rank and compression together are better than either alone.
5. Measure the steps in a test to confirm the optimisations work.
6. Mention rollbacks as the case where compression must be dropped.

## example
The Python program counts the parent steps for 4000 random unions and finds on 2000 elements with no rule, with union by size only, with path halving only and with both, printing the four totals: about 8 million steps with no rule, about 10 thousand with union by size, about 11 thousand with path halving alone and about 10 thousand with both. The JavaScript program prints small values of the Ackermann function: A(1, 1) = 3, A(2, 2) = 7 and A(3, 3) = 61.

## real
Library maintainers and competitive programmers rely on the near constant bound when they use union-find in graph algorithms, and compilers use it for unification where millions of operations run in practice almost linearly.

## pros
- Near constant amortised cost with both optimisations
- Provably optimal in the cell probe model
- Tiny memory and simple loops

## cons
- Individual operations can be slower than the amortised bound
- The analysis is intricate
- Rollbacks and persistence lose the best bound

## uses
- Justifying union-find in algorithm analysis
- Comparing implementation variants
- Explaining amortised bounds in interviews
- Choosing between compression and rollback support

## mistakes
- Stating union-find as O(1) without mentioning the inverse Ackermann factor
- Forgetting that the bound is amortised, not per operation
- Using path compression in a rollback structure and then losing correctness
- Assuming compression alone gives the best bound

## interview
**Q:** What is the time complexity of union-find with union by rank and path compression?
**A:** O(α(n)) amortised per operation, where α is the inverse Ackermann function, so m operations cost O(m α(n)), which is effectively linear in practice.

**Q:** What is the inverse Ackermann function and why is it considered constant?
**A:** It is the inverse of an extremely fast growing function; α(n) is at most 4 for any n that could ever be stored, so it behaves like a constant.

**Q:** What does each optimisation contribute?
**A:** Union by rank bounds the height by log n, giving O(log n) per operation, and path compression flattens queried paths and gives O(log n) amortised alone; together they give O(α(n)) amortised.

## summary
Union-find with union by rank and path compression costs O(α(n)) amortised per operation, practically constant, while either optimisation alone gives logarithmic bounds and neither gives linear time per operation. Verify the optimisations by counting steps.

## codenote
The Python sample measures steps for the four variants. The JavaScript sample prints small Ackermann values.

## code
### python
```python
import random

def run(n, operations, by_size, halving):
    parent = list(range(n))
    size = [1] * n
    steps = 0

    def find(x):
        nonlocal steps
        while parent[x] != x:
            if halving:
                parent[x] = parent[parent[x]]
            x = parent[x]
            steps += 1
        return x

    for a, b in operations:
        ra, rb = find(a), find(b)
        if ra != rb:
            if by_size and size[ra] > size[rb]:
                ra, rb = rb, ra
            parent[ra] = rb
            size[rb] += size[ra]
    return steps

rng = random.Random(5)
n = 2000
operations = [(i, i + 1) for i in range(n - 1)] + [(rng.randrange(n), rng.randrange(n)) for _ in range(4000)]
totals = [run(n, operations, s, h) for s, h in ((False, False), (True, False), (False, True), (True, True))]
print(totals)
```
Output:
```text
[7999971, 9994, 10857, 9994]
```
### javascript
```javascript
function ackermann(m, n) {
  if (m === 0) return n + 1;
  if (n === 0) return ackermann(m - 1, 1);
  return ackermann(m - 1, ackermann(m, n - 1));
}

console.log(ackermann(1, 1), ackermann(2, 2), ackermann(3, 3));
```
Output:
```text
3 7 61
```

## quiz
1. What is the amortised cost per operation with union by rank and path compression?
   - [ ] O(n)
   - [x] O(α(n))
   - [ ] O(log n) in the worst case per operation
   - [ ] O(n log n)
   > The inverse Ackermann function is practically constant.
2. What bound does union by rank alone give?
   - [ ] O(1)
   - [x] O(log n) per operation
   - [ ] O(n)
   - [ ] O(α(n))
   > The height is at most log2 n.
3. Why is α(n) considered a constant?
   - [ ] It equals one
   - [x] It is at most 4 for every n that could be stored
   - [ ] It is defined to be small
   - [ ] It is proven to be zero
   > The Ackermann function grows incredibly fast, so its inverse grows incredibly slowly.
4. What does amortised mean in this bound?
   - [ ] Every operation is cheap
   - [x] The total cost of a sequence divided by its length is small
   - [ ] The average over random inputs
   - [ ] The best case only
   > Single operations may still cost more.

# Union Find Interview Patterns
kind: concept
time: Not an algorithmic topic — this lesson reviews patterns. Union-find solutions typically run in O((n + m) α(n)) after any sorting, which is effectively linear.
space: Not an algorithmic topic — the structure uses O(n) memory, plus the maps needed to convert names or coordinates to indices.

## intro
Union-find questions in interviews seldom mention union-find. They talk about groups, friends, accounts, equivalent items, provinces or connected regions. Recognising that the question is about merging groups and testing membership is the key; the rest is a standard template plus one twist, such as mapping strings to indices or tracking sizes.

## theory
Trigger phrases: connected, group, component, same set, equivalent, merge, friends of friends, redundant edge, region, islands, cluster, "can reach", minimum cost to connect.

Pattern 1: count components. Number of provinces (adjacency matrix), number of connected components in an undirected graph, number of islands, minimum number of operations to connect all computers (components minus one cables are needed, provided there are enough spare cables, otherwise −1). Template: union every given pair, count the successful unions.

Pattern 2: detect a cycle or a redundant edge. Redundant connection, graph valid tree, minimum edges to remove. Template: a failed union identifies the edge.

Pattern 3: group by equivalence with named items. Accounts merge: accounts are lists of emails; two accounts belong to the same person if they share an email. Map each email to an index (or to the first account that owns it), union accounts that share an email, then group the emails by root. For the accounts `John: a, b`, `John: a, c`, `Mary: d` the merged result is one John account with the emails a, b, c and one Mary account with d. Similarly, sentence similarity, synonyms and string swaps.

Pattern 4: equations. Satisfiability of equality equations: process all `==` equations with unions, then check every `!=` equation to ensure the two variables are in different sets. For the equations `a==b`, `b!=a` the answer is false; for `b==a`, `a==b` it is true; for `a==b`, `b==c`, `a==c` it is true. Weighted variants (evaluate division) store a ratio to the parent and multiply along paths.

Pattern 5: smallest string with swaps: pairs of indices that can be swapped freely form components; sort the characters within each component and write them back in sorted index order.

Pattern 6: grid regions. Surrounded regions (connect border land to a virtual node), islands with online additions, largest island, percolation, number of closed islands. Template: cell index = r times columns + c, union with neighbours.

Pattern 7: Kruskal and minimum cost connections. Connecting cities at minimum cost, optimise water distribution (add a virtual well node), minimum cost to connect all points (Manhattan distances), maximum bottleneck paths and clustering (stop when k components remain).

Pattern 8: offline queries sorted by threshold, as in the last lessons. And dynamic problems solved in reverse time (bricks falling after hits).

Pattern 9: bipartite and parity unions. Is the graph bipartite, or possible bipartition (dislike pairs): union each vertex with the opposite of its neighbours (two nodes per vertex, or a parity bit), and fail if a vertex ends up connected to its own opposite.

How to present a solution:

- Name the pattern and the DSU operations needed
- Describe the mapping from problem items to indices
- State the complexity: O((n + m) α(n)), mention sorting if present
- Mention union by size and path compression
- Compare with depth first search: DSU is better for streams and online additions, DFS gives paths and handles directed graphs

Common traps: using DSU for directed graphs, forgetting to find roots before comparing, off-by-one in node ids (1-based labels with 0-based arrays), not mapping non-integer keys, and counting components from parent values without calling find.

Edge cases: n = 1, no edges, duplicate edges, self loops, and unknown keys in queries.

## explain
1. Spot the trigger phrase that means groups or connectivity.
2. Define the items and map them to indices.
3. Decide which pairs to union and what to count or check afterwards.
4. Use union by size and path compression, and count successful unions if needed.
5. Handle equations or conflicts in a second pass.
6. State the complexity and the comparison with depth first search.

## example
The Python program merges accounts by shared emails and prints the merged lists, and counts the cables needed to connect a network. The JavaScript program checks the satisfiability of equality equations and prints false, true and true for the three sample sets.

## real
Contact deduplication, identity resolution, network provisioning and compilers' type unification solve exactly these problems with union-find.

## pros
- One data structure covers many grouping problems
- Near linear time with short code
- Works naturally on streams of pairs

## cons
- Items must be mapped to indices
- It does not handle directed relations
- It cannot answer path questions

## uses
- Merging accounts or records by shared keys
- Checking equality and inequality constraints
- Minimum cost connection problems
- Counting groups, provinces and islands

## mistakes
- Using it for directed graphs
- Forgetting to convert string keys to indices
- Comparing parents rather than the roots of the sets
- Checking inequality constraints before all equalities are merged

## interview
**Q:** How do you merge accounts that share an email using union-find?
**A:** Map each email to the first account that contains it, union the accounts that share an email, then collect the emails by the root of their account and sort them for the output.

**Q:** How do you check satisfiability of equations such as a==b and b!=c?
**A:** First union all variables of the equality equations, then verify for each inequality equation that the two variables have different roots; if any pair has equal roots the system is unsatisfiable.

**Q:** How many cables are needed to connect n computers given a list of existing cables?
**A:** The number of components minus one new cables are needed; if the number of existing cables is smaller than n minus 1 it is impossible, otherwise the answer is components minus one.

## summary
Interview problems about groups, equivalences and connectivity map to union-find: count components, find redundant edges, merge named items, check equations and build minimum cost connections. Map items to indices, merge, then query roots.

## codenote
The Python sample merges accounts and counts needed cables. The JavaScript sample checks equations.

## code
### python
```python
from collections import defaultdict

def merge_accounts(accounts):
    parent = list(range(len(accounts)))

    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x

    owner = {}
    for index, (_, *emails) in enumerate(accounts):
        for email in emails:
            if email in owner:
                parent[find(index)] = find(owner[email])
            else:
                owner[email] = index
    groups = defaultdict(set)
    for email, index in owner.items():
        groups[find(index)].add(email)
    return sorted([accounts[i][0]] + sorted(emails) for i, emails in groups.items())

def cables_needed(n, cables):
    if len(cables) < n - 1:
        return -1
    parent = list(range(n))

    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x

    components = n
    for a, b in cables:
        ra, rb = find(a), find(b)
        if ra != rb:
            parent[ra] = rb
            components -= 1
    return components - 1

print(merge_accounts([["John", "a", "b"], ["John", "a", "c"], ["Mary", "d"]]))
print(cables_needed(6, [(0, 1), (0, 2), (0, 3), (1, 2), (1, 3)]), cables_needed(6, [(0, 1), (0, 2)]))
```
Output:
```text
[['John', 'a', 'b', 'c'], ['Mary', 'd']]
2 -1
```
### javascript
```javascript
function equationsPossible(equations) {
  const parent = Array.from({ length: 26 }, (_, i) => i);
  const find = (x) => {
    while (parent[x] !== x) x = parent[x] = parent[parent[x]];
    return x;
  };
  const id = (ch) => ch.charCodeAt(0) - 97;
  for (const e of equations) {
    if (e[1] === "=") parent[find(id(e[0]))] = find(id(e[3]));
  }
  return equations.every((e) => e[1] === "=" || find(id(e[0])) !== find(id(e[3])));
}

console.log(equationsPossible(["a==b", "b!=a"]), equationsPossible(["b==a", "a==b"]), equationsPossible(["a==b", "b==c", "a==c"]));
```
Output:
```text
false true true
```

## quiz
1. Which phrase hints at union-find in a problem statement?
   - [ ] Sort the array
   - [x] Merge groups that share an item
   - [ ] Find the maximum
   - [ ] Reverse the string
   > Merging and testing membership of groups is the DSU task.
2. How are inequality equations checked?
   - [ ] Before the equalities
   - [x] After all equalities are merged, by comparing the roots of the two variables
   - [ ] By sorting the variables
   - [ ] By a depth first search
   > Their roots must differ.
3. How many extra cables connect a network with c components?
   - [ ] c
   - [x] c − 1, provided enough cables exist
   - [ ] c + 1
   - [ ] 2c
   > Each new cable can merge two components.
4. Why must string keys be mapped to indices?
   - [ ] To save time on sorting
   - [x] The parent array is indexed by integers
   - [ ] To make keys unique
   - [ ] Strings cannot be compared
   > A dictionary based DSU is the alternative.
