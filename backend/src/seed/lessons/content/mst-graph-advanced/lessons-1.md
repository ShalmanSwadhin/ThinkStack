# Minimum Spanning Tree Definition
kind: concept
time: Not an algorithmic topic — this lesson defines the problem. The standard algorithms solve it in O(E log V) (Kruskal's and Prim's with a heap) and the best known randomised algorithm runs in expected O(E).
space: Not an algorithmic topic — a spanning tree of V vertices has exactly V − 1 edges, so the output is O(V), while the input graph needs O(V + E) memory.

## intro
Given a connected, undirected graph with weighted edges, a minimum spanning tree (MST) is a set of edges that connects all vertices, contains no cycle, and has the smallest possible total weight. It answers the question of how to wire up a set of sites as cheaply as possible, and it is the foundation of several advanced graph techniques.

## theory
Definitions:

- Spanning tree: a subgraph that includes all V vertices, is connected and has no cycles; equivalently, a connected subgraph with exactly V − 1 edges
- Minimum spanning tree: a spanning tree whose total edge weight is minimal among all spanning trees
- Minimum spanning forest: for a disconnected graph, an MST for each connected component

Properties:

- A graph has a spanning tree exactly when it is connected
- The number of spanning trees of the complete graph on n vertices is n^(n − 2) (Cayley's formula): 16 for 4 vertices, 125 for 5, 1,296 for 6, so brute force is hopeless beyond tiny graphs. The matrix tree theorem counts spanning trees of any graph as a determinant.
- If all edge weights are distinct, the MST is unique; with ties there can be several MSTs, but they all have the same total weight and the same multiset of edge weights
- Adding any non-tree edge to an MST creates exactly one cycle, and removing any tree edge splits it into exactly two components
- The MST is not a shortest path tree: it minimises total weight, not distances from a root
- The MST of a graph also minimises the largest edge on the tree (bottleneck), a property used in later lessons

Example: the complete graph on vertices A, B, C, D with edge weights AB 1, AC 4, AD 3, BC 2, BD 5, CD 6. There are 16 spanning trees. The cheapest uses AB 1, BC 2 and AD 3 for a total weight of 6; the most expensive uses AC 4, BD 5 and CD 6 for 15. Enumerating all 16 trees by brute force confirms the minimum is 6.

Uses:

- Network design: laying cable, pipelines, roads or fibre to connect sites at minimum cost
- Clustering: cutting the k − 1 heaviest edges of an MST gives k clusters (single linkage clustering)
- Approximation algorithms: the MST gives a 2-approximation for the metric travelling salesman problem
- Image segmentation and taxonomy trees
- Maze generation: a random spanning tree of a grid is a perfect maze
- Circuit design and broadcasting in networks

Checking a candidate: a set of edges is a spanning tree if it has V − 1 edges and connects all vertices (equivalently, has V − 1 edges and no cycle); it is an MST if no spanning tree has a smaller sum, which can be verified with the cut and cycle properties or by comparing with a known algorithm.

The two classical algorithms:

- Kruskal's algorithm: sort the edges and add each edge that joins two different components (union-find); grows a forest
- Prim's algorithm: grow a single tree from a start vertex, always adding the cheapest edge leaving the tree (priority queue)

Both are greedy and correct because of the cut property (next lessons). Related problems: maximum spanning tree, second best MST, minimum bottleneck spanning tree, Steiner tree (connect only some vertices, NP-hard), degree constrained spanning trees and directed minimum spanning arborescences (Edmonds' algorithm).

Pitfalls: confusing MST with shortest paths, forgetting that disconnected graphs have no spanning tree, assuming uniqueness with tied weights and counting V edges instead of V − 1.

## explain
1. Make sure the graph is connected and undirected.
2. Aim to pick V − 1 edges that connect all vertices without cycles.
3. Among all such edge sets, minimise the total weight.
4. Use Kruskal's or Prim's algorithm rather than brute force.
5. Verify the result has V − 1 edges and is connected.
6. Remember that ties can give several different MSTs of equal weight.

## example
The Python program enumerates all spanning trees of the four vertex example, prints their count 16 and the minimum and maximum total weights 6 and 15. The JavaScript program checks whether given edge sets are spanning trees.

## real
Telecommunication and utility companies plan the cheapest network layouts, and data scientists use MSTs for hierarchical clustering and visualising distances.

## pros
- Gives the cheapest way to connect all vertices
- Computable by simple greedy algorithms
- Useful for clustering and approximation

## cons
- Not the same as shortest paths from a root
- Ties make the MST non-unique
- Requires a connected graph

## uses
- Cheapest network and cable layouts
- Hierarchical clustering of data points
- Building tour approximations from a spanning tree
- Random maze generation

## mistakes
- Confusing the minimum spanning tree with a shortest path tree
- Selecting V edges instead of V minus 1
- Assuming the MST is unique when weights tie
- Applying it to a disconnected graph without producing a forest

## interview
**Q:** What is a minimum spanning tree?
**A:** A subset of edges of a connected weighted undirected graph that connects all vertices without cycles and has the smallest possible total weight.

**Q:** How many edges does a spanning tree of a graph with V vertices have?
**A:** Exactly V − 1, since a tree on V vertices has V − 1 edges.

**Q:** Is the minimum spanning tree always unique?
**A:** No; it is unique when all edge weights are distinct, but with equal weights several different trees can share the minimum total weight.

## summary
A minimum spanning tree connects all vertices with V − 1 edges of minimum total weight, and it is found greedily by Kruskal's or Prim's algorithm. It is unique for distinct weights and differs from shortest path trees.

## codenote
The Python sample enumerates spanning trees of a small graph. The JavaScript sample checks edge sets.

## code
### python
```python
from itertools import combinations

edges = {("A", "B"): 1, ("A", "C"): 4, ("A", "D"): 3, ("B", "C"): 2, ("B", "D"): 5, ("C", "D"): 6}
vertices = "ABCD"

def is_spanning_tree(subset):
    parent = {v: v for v in vertices}

    def find(x):
        while parent[x] != x:
            x = parent[x]
        return x

    for u, v in subset:
        ru, rv = find(u), find(v)
        if ru == rv:
            return False
        parent[ru] = rv
    return True

trees = [c for c in combinations(edges, len(vertices) - 1) if is_spanning_tree(c)]
weights = sorted(sum(edges[e] for e in tree) for tree in trees)
print(len(trees), weights[0], weights[-1])
print(min(trees, key=lambda tree: sum(edges[e] for e in tree)))
```
Output:
```text
16 6 15
(('A', 'B'), ('A', 'D'), ('B', 'C'))
```
### javascript
```javascript
function isSpanningTree(n, edgeSet) {
  if (edgeSet.length !== n - 1) return false;
  const parent = Array.from({ length: n }, (_, i) => i);
  const find = (x) => {
    while (parent[x] !== x) x = parent[x] = parent[parent[x]];
    return x;
  };
  for (const [u, v] of edgeSet) {
    const a = find(u);
    const b = find(v);
    if (a === b) return false;
    parent[a] = b;
  }
  return true;
}

console.log(isSpanningTree(4, [[0, 1], [1, 2], [0, 3]]), isSpanningTree(4, [[0, 1], [1, 2], [2, 0]]), isSpanningTree(4, [[0, 1], [2, 3]]));
```
Output:
```text
true false false
```

## quiz
1. How many edges does a spanning tree of 6 vertices have?
   - [ ] 6
   - [x] 5
   - [ ] 7
   - [ ] 15
   > A tree on V vertices has V minus 1 edges.
2. When is the minimum spanning tree guaranteed to be unique?
   - [ ] Always
   - [x] When all edge weights are distinct
   - [ ] When the graph is complete
   - [ ] When the graph has no cycles
   > Ties allow several trees of equal weight.
3. How does an MST differ from a shortest path tree?
   - [ ] They are always the same
   - [x] The MST minimises total weight, not distances from a root
   - [ ] The MST ignores weights
   - [ ] The shortest path tree has cycles
   > The two trees can be different.
4. How many spanning trees does the complete graph on 4 vertices have?
   - [ ] 4
   - [x] 16
   - [ ] 24
   - [ ] 6
   > Cayley's formula gives n to the power n minus 2.

# Prim Algorithm
kind: algorithm
time: O(E log V) with a binary heap and adjacency lists, O(V squared) with an array scan (best for dense graphs) and O(E + V log V) with a Fibonacci heap.
space: O(V + E) for the graph plus O(V) for the keys, parents and the tree membership flags.
viz: prim

## intro
Prim's algorithm grows a minimum spanning tree from a single starting vertex. At each step it adds the cheapest edge that connects a vertex already in the tree to a vertex outside it. The tree expands like a drop of ink, always along the lightest available edge, and when every vertex is included the tree is minimal.

## theory
Algorithm:

- Choose any start vertex and put it in the tree
- Maintain for every outside vertex v a key `key[v]`, the weight of the cheapest edge connecting v to the tree (infinity at first) and `parent[v]`, the tree vertex at the other end
- Repeat V − 1 times: pick the outside vertex u with the smallest key, add the edge `(parent[u], u)` to the tree, and for each neighbour v of u still outside with `w(u, v) < key[v]`, update `key[v] = w(u, v)` and `parent[v] = u`

Implementation with a heap: push `(weight, vertex)` entries; pop the smallest; skip vertices already in the tree (lazy deletion); add the vertex and push the edges to its outside neighbours. Total O(E log V).

Why it works (cut property): at every step the vertices inside the tree and those outside form a cut. The lightest edge crossing this cut belongs to some MST, so adding it is safe. Repeating gives a tree of V − 1 safe edges, hence an MST.

Example: the graph with edges A-B 4, A-C 4, B-C 2, C-D 3, C-E 4, C-F 4, D-F 3, E-F 3. Starting at A, the order of additions is A-B (4), B-C (2), C-D (3), D-F (3), F-E (3), with total weight 4 + 2 + 3 + 3 + 3 = 15. The edge A-C (4) is skipped because C was already reached more cheaply through B, and the edges C-E and C-F (both 4) lose to F-E (3) and D-F (3).

Comparison with Kruskal's algorithm:

- Prim grows one tree; Kruskal merges a forest of components
- Prim needs adjacency lists and a priority queue; Kruskal needs a sorted edge list and union-find
- Prim is generally better for dense graphs (array version O(V squared)); Kruskal is simpler for sparse graphs given as edge lists
- Both produce an MST of the same total weight; with ties the trees may differ
- Prim gives a spanning tree of the start vertex's component only; to handle disconnected graphs run it from each unvisited vertex

Relationship to Dijkstra's algorithm: the structure is almost identical, with the key being the edge weight to the tree instead of the distance from the source. A bug common to both is using the path length where the edge weight belongs.

Variants and uses:

- Dense graph version: scan an array of keys in O(V) per step; on a complete graph of points (Euclidean MST with n points) it runs in O(n squared) without building n squared edges explicitly
- Minimum cost to connect points: edges are Manhattan or Euclidean distances between all pairs
- Maximum spanning tree: take the largest key instead
- Network design, clustering and approximation algorithms use it as a subroutine

Implementation notes: store `in_tree` flags; push neighbours only if they are outside; record parents to output the edges; handle a graph with isolated vertices by reporting a spanning forest or an error.

Pitfalls: pushing edges to vertices already in the tree and forgetting to skip them, treating the key as an accumulated distance, using a stale key after an update (use lazy deletion), starting from a vertex in a small component of a disconnected graph and assuming it covers all vertices.

Testing: compare the total weight with Kruskal's algorithm on random connected graphs.

## explain
1. Pick a start vertex and mark it as part of the tree.
2. Push the edges from the tree to outside neighbours into a min-heap.
3. Pop the cheapest edge; skip it if its endpoint is already in the tree.
4. Add the vertex and edge to the tree and push the new outgoing edges.
5. Stop when the tree has V − 1 edges.
6. Compare the total weight with Kruskal's algorithm.

## example
The Python program runs Prim's algorithm on the six vertex graph, printing the edges in order of addition and the total weight 15, and checks the total against Kruskal's algorithm on 100 seeded random graphs. The JavaScript program implements the array scan version on an adjacency matrix.

## real
Network planners lay cable with Prim's algorithm, and the dense array version is used when connecting thousands of points in the plane.

## pros
- Simple greedy growth of a single tree
- O(V squared) array version suits dense graphs
- Works from adjacency lists with a heap

## cons
- Slower than Kruskal's algorithm on very sparse edge lists in some settings
- Needs a priority queue for good performance on sparse graphs
- Only spans the component of the start vertex

## uses
- Minimum cost networks
- MST of complete graphs on points
- Clustering and approximation algorithms
- Maze generation by randomised Prim

## mistakes
- Not skipping heap entries whose vertex is already in the tree
- Using accumulated path length instead of the single edge weight
- Forgetting disconnected components
- Updating keys without recording parents

## interview
**Q:** How does Prim's algorithm work?
**A:** It starts from one vertex and repeatedly adds the cheapest edge that connects a vertex inside the tree to one outside, using a priority queue of candidate edges, until all vertices are included.

**Q:** What is its complexity?
**A:** O(E log V) with a binary heap and adjacency lists, and O(V squared) with an array, which is better for dense graphs.

**Q:** When would you choose Prim's algorithm over Kruskal's?
**A:** For dense graphs or when the graph is given as adjacency lists or implicitly as a complete graph of points, since Prim's array version avoids sorting all the edges.

## summary
Prim's algorithm grows an MST from a start vertex by adding the lightest edge leaving the tree, in O(E log V) with a heap or O(V squared) with an array. Skip stale heap entries and use edge weights, not path lengths.

## codenote
The Python sample uses a heap and compares with Kruskal's algorithm. The JavaScript sample uses the matrix scan.

## code
### python
```python
import heapq
import random

def prim(n, edges, start=0):
    graph = [[] for _ in range(n)]
    for u, v, w in edges:
        graph[u].append((w, v, u))
        graph[v].append((w, u, v))
    in_tree, chosen, total = {start}, [], 0
    heap = list(graph[start])
    heapq.heapify(heap)
    while heap and len(in_tree) < n:
        w, v, u = heapq.heappop(heap)
        if v in in_tree:
            continue
        in_tree.add(v)
        chosen.append((u, v, w))
        total += w
        for item in graph[v]:
            if item[1] not in in_tree:
                heapq.heappush(heap, item)
    return chosen, total

def kruskal_total(n, edges):
    parent = list(range(n))

    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x

    total = 0
    for u, v, w in sorted(edges, key=lambda e: e[2]):
        if find(u) != find(v):
            parent[find(u)] = find(v)
            total += w
    return total

names = "ABCDEF"
raw = [("A", "B", 4), ("A", "C", 4), ("B", "C", 2), ("C", "D", 3), ("C", "E", 4), ("C", "F", 4), ("D", "F", 3), ("E", "F", 3)]
edges = [(names.index(u), names.index(v), w) for u, v, w in raw]
chosen, total = prim(6, edges)
print([(names[u], names[v], w) for u, v, w in chosen], total)

rng = random.Random(15)
ok = True
for _ in range(100):
    n = rng.randint(2, 8)
    edges = [(i, rng.randrange(i), rng.randint(1, 9)) for i in range(1, n)]
    edges += [(rng.randrange(n), rng.randrange(n), rng.randint(1, 9)) for _ in range(rng.randint(0, 8))]
    edges = [e for e in edges if e[0] != e[1]]
    ok = ok and prim(n, edges)[1] == kruskal_total(n, edges)
print(ok)
```
Output:
```text
[('A', 'B', 4), ('B', 'C', 2), ('C', 'D', 3), ('D', 'F', 3), ('F', 'E', 3)] 15
True
```
### javascript
```javascript
function primMatrix(matrix) {
  const n = matrix.length;
  const inTree = new Array(n).fill(false);
  const key = new Array(n).fill(Infinity);
  const parent = new Array(n).fill(-1);
  key[0] = 0;
  let total = 0;
  for (let step = 0; step < n; step++) {
    let u = -1;
    for (let v = 0; v < n; v++) if (!inTree[v] && (u === -1 || key[v] < key[u])) u = v;
    inTree[u] = true;
    total += key[u];
    for (let v = 0; v < n; v++) {
      if (!inTree[v] && matrix[u][v] > 0 && matrix[u][v] < key[v]) {
        key[v] = matrix[u][v];
        parent[v] = u;
      }
    }
  }
  return [total, parent.slice(1).map((p, i) => p + "-" + (i + 1)).join(" ")];
}

const matrix = [[0, 2, 0, 6, 0], [2, 0, 3, 8, 5], [0, 3, 0, 0, 7], [6, 8, 0, 0, 9], [0, 5, 7, 9, 0]];
console.log(primMatrix(matrix));
```
Output:
```text
[ 16, '0-1 1-2 0-3 1-4' ]
```

## quiz
1. Which edge does Prim's algorithm add next?
   - [ ] The globally cheapest remaining edge
   - [x] The cheapest edge connecting the tree to an outside vertex
   - [ ] The most expensive edge
   - [ ] A random edge
   > It always grows the single tree.
2. How long does Prim's algorithm take with a binary heap and adjacency lists?
   - [ ] O(V cubed)
   - [x] O(E log V)
   - [ ] O(V + E)
   - [ ] O(E squared)
   > Each edge may cause one heap operation.
3. How does Prim's algorithm differ from Dijkstra's key?
   - [ ] It uses a stack
   - [x] The key is the weight of a single connecting edge, not the path length from the source
   - [ ] It handles negative cycles
   - [ ] It ignores edge weights
   > Mixing the two gives wrong trees.
4. When is the array version preferable?
   - [ ] For very sparse graphs
   - [x] For dense graphs, where O(V squared) beats a heap with many edges
   - [ ] For disconnected graphs
   - [ ] For directed graphs
   > It avoids heap overhead.

# Kruskal Algorithm
kind: algorithm
time: O(E log E) for sorting the edges plus O(E α(V)) for the union-find operations, which is O(E log V) overall; O(E α(V)) if the edges are already sorted.
space: O(V) for the union-find structure plus O(E) for the sorted edge list.
viz: kruskal

## intro
Kruskal's algorithm builds a minimum spanning tree by considering edges from the lightest to the heaviest and keeping each edge that does not close a cycle. It works directly on an edge list, handles disconnected graphs by producing a forest, and is the algorithm to know for clustering and for problems where the edges arrive pre-sorted. This lesson looks at its behaviour with ties, forests and early stopping.

## theory
Recap of the loop: sort edges by weight; for each edge `(u, v, w)`, if `find(u) != find(v)` then add it to the result and `union(u, v)`. Stop after V − 1 edges are chosen (or when the component count reaches 1).

Correctness through the cycle and cut properties: an edge rejected by Kruskal's algorithm closes a cycle in which it is the heaviest edge considered so far (all other cycle edges are already in the forest and are no heavier), so by the cycle property it can be dropped without increasing the weight of the tree. An accepted edge is the lightest edge leaving its component, a cut crossing edge, hence safe by the cut property.

Behaviour with ties: edges of equal weight can be considered in any order, and different orders may produce different MSTs, but all have the same total weight. Example: a triangle with all edges of weight 1 has three MSTs; Kruskal's algorithm returns the first two edges in sorted order. Use a stable sort on a secondary key (such as the endpoint ids) if reproducible output is needed.

Disconnected graphs: the algorithm needs no special case; it ends with a minimum spanning forest of V − C edges for C components. Checking whether the number of chosen edges is V − 1 tells whether the graph was connected.

Early stopping and clustering: stopping when k components remain gives single linkage clustering into k clusters, and the weight of the next rejected-or-accepted edge is the minimum distance between clusters (the spacing). For points on a line at positions 1, 2, 4, 8, 16 with edge weights equal to differences, the algorithm merges 1-2 (1), then 2-4 (2), then 4-8 (4) and 8-16 (8); stopping at 3 clusters after the first two merges leaves {1, 2, 4}, {8} and {16}.

Cost model: sorting dominates. Tricks:

- If weights are small integers, use counting sort for O(E + W)
- If only the k lightest edges are likely needed, use a heap or partial sort (build a heap in O(E) and pop edges lazily); stop when the tree is complete
- Filter-Kruskal partitions edges around a pivot weight and filters edges inside one component, which speeds up dense graphs
- Borůvka's algorithm contracts the lightest edge of each component in rounds and parallelises well

Verifying an MST: the total weight must equal that from Prim's algorithm; every non-tree edge must be at least as heavy as the heaviest edge on the tree path between its endpoints (the cycle property).

Applications beyond connection cost: clustering (single linkage), approximating the Steiner tree and the travelling salesman problem, image segmentation (Felzenszwalb), and the Kruskal reconstruction tree that answers minimax path queries via lowest common ancestor.

Pitfalls: sorting by the wrong tuple position, comparing endpoints rather than roots, forgetting to union after accepting an edge, not handling the disconnected case, and using recursion in find on long chains.

Testing: compare the total with Prim's algorithm, with brute force enumeration on small graphs and test equal weight graphs for the same total.

## explain
1. Sort the edges by weight, using a stable tie breaker if reproducibility matters.
2. Start with each vertex in its own component.
3. Accept an edge only when its endpoints have different roots, and union them.
4. Stop at V minus 1 accepted edges, or when k components remain for clustering.
5. Check the accepted count to see whether the graph was connected.
6. Compare the total weight with Prim's algorithm in tests.

## example
The Python program runs Kruskal's algorithm on the six vertex graph (total 15), shows that the triangle with equal weights gives the same two edges for both input orders because of the deterministic tie break (another tie break would pick another pair), produces a spanning forest of two trees for a disconnected graph, and clusters the points 1, 2, 4, 8, 16 into three groups. The JavaScript program counts the edges accepted and rejected.

## real
Clustering libraries use Kruskal's algorithm for single linkage hierarchies, and network planners use it when the candidate links arrive as a sorted price list.

## pros
- Works directly on edge lists
- Naturally handles disconnected graphs
- Early stopping gives clusterings

## cons
- Sorting dominates the cost
- Needs union-find as a helper
- Tie behaviour depends on the sort

## uses
- Minimum spanning trees and forests
- Grouping points into k clusters by merging nearest groups
- Network design from a price list of links
- Building reconstruction trees for minimax queries

## mistakes
- Sorting by the wrong field of the edge tuple
- Comparing the endpoints instead of their roots
- Forgetting to union after accepting an edge
- Expecting a unique tree when weights tie

## interview
**Q:** Why can Kruskal's algorithm skip an edge that joins two vertices of the same component?
**A:** Adding it would close a cycle, and since all edges already chosen are no heavier than this one, it is the heaviest edge of that cycle and an MST can omit it.

**Q:** What does Kruskal's algorithm return for a disconnected graph?
**A:** A minimum spanning forest with V minus C edges, one MST per component, where C is the number of components.

**Q:** How can Kruskal's algorithm perform clustering?
**A:** Stop when the number of components reaches the desired number of clusters k; the remaining components are the single linkage clusters.

## summary
Kruskal's algorithm sorts the edges and keeps those joining different components, in O(E log E), producing a spanning forest for disconnected graphs and clusterings when stopped early. Ties give different trees of the same weight.

## codenote
The Python sample covers ties, forests and clustering. The JavaScript sample counts accepted and rejected edges.

## code
### python
```python
def kruskal(n, edges, stop_at=1):
    parent = list(range(n))

    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x

    chosen, components = [], n
    for u, v, w in sorted(edges, key=lambda e: (e[2], e[0], e[1])):
        if components == stop_at:
            break
        ru, rv = find(u), find(v)
        if ru != rv:
            parent[ru] = rv
            chosen.append((u, v, w))
            components -= 1
    return chosen, components, [find(v) for v in range(n)]

names = "ABCDEF"
raw = [("A", "B", 4), ("A", "C", 4), ("B", "C", 2), ("C", "D", 3), ("C", "E", 4), ("C", "F", 4), ("D", "F", 3), ("E", "F", 3)]
edges = [(names.index(u), names.index(v), w) for u, v, w in raw]
chosen, components, _ = kruskal(6, edges)
print(sum(w for _, _, w in chosen), len(chosen), components)

triangle = [(0, 1, 1), (1, 2, 1), (0, 2, 1)]
print(kruskal(3, triangle)[0], kruskal(3, list(reversed(triangle)))[0])
forest, count, _ = kruskal(5, [(0, 1, 1), (1, 2, 2), (3, 4, 5)])
print(len(forest), count)

points = [1, 2, 4, 8, 16]
point_edges = [(i, j, abs(points[i] - points[j])) for i in range(5) for j in range(i + 1, 5)]
_, _, labels = kruskal(5, point_edges, stop_at=3)
groups = {}
for index, label in enumerate(labels):
    groups.setdefault(label, []).append(points[index])
print(sorted(groups.values()))
```
Output:
```text
15 5 1
[(0, 1, 1), (0, 2, 1)] [(0, 1, 1), (0, 2, 1)]
3 2
[[1, 2, 4], [8], [16]]
```
### javascript
```javascript
function kruskalStats(n, edges) {
  const parent = Array.from({ length: n }, (_, i) => i);
  const find = (x) => {
    while (parent[x] !== x) x = parent[x] = parent[parent[x]];
    return x;
  };
  let accepted = 0;
  let rejected = 0;
  for (const [u, v] of [...edges].sort((a, b) => a[2] - b[2])) {
    const a = find(u);
    const b = find(v);
    if (a === b) rejected++;
    else {
      parent[a] = b;
      accepted++;
    }
  }
  return [accepted, rejected];
}

console.log(kruskalStats(5, [[0, 1, 3], [0, 2, 1], [1, 2, 2], [1, 3, 4], [2, 3, 5], [3, 4, 6], [2, 4, 7]]).join(" "));
```
Output:
```text
4 3
```

## quiz
1. Which edges does Kruskal's algorithm accept?
   - [ ] Every edge in sorted order
   - [x] Those whose endpoints are in different components
   - [ ] Only the heaviest edges
   - [ ] Edges that touch the first vertex
   > Others would close cycles.
2. What does it return for a disconnected graph with C components?
   - [ ] An error
   - [x] A spanning forest with V − C edges
   - [ ] A spanning tree with V − 1 edges
   - [ ] An empty set
   > Each component gets its own minimum tree.
3. How does it produce k clusters?
   - [ ] By deleting vertices
   - [x] By stopping when k components remain
   - [ ] By sorting vertices by label
   - [ ] By running it k times
   > Merging stops before the heaviest links are added.
4. Why can different runs give different trees on the same graph?
   - [ ] Union-find is random
   - [x] Edges of equal weight can be considered in different orders
   - [ ] The algorithm is not greedy
   - [ ] Weights change
   > All the resulting trees have the same total weight.

# MST Cut Property
kind: concept
time: Not an algorithmic topic — this lesson explains why the greedy algorithms are correct. The property lets both Kruskal's and Prim's algorithms make a safe choice in constant time per decision after the sorting or heap work.
space: Not an algorithmic topic — verifying the property for a given cut needs O(E) time to scan the crossing edges and O(V) space to record which side each vertex is on.

## intro
Why does picking the cheapest edge again and again produce the cheapest tree? The answer is the cut property, a short but powerful statement about edges that cross a partition of the vertices. It justifies Prim's and Kruskal's algorithms and gives a toolkit for proving that any new greedy MST variant is correct.

## theory
Definitions:

- A cut is a partition of the vertices into two non-empty sets S and its complement
- An edge crosses the cut if one endpoint is in S and the other is not
- A set of edges A is safe for a cut if no edge of A crosses the cut (the cut respects A)

Cut property: let A be a subset of the edges of some MST, and let (S, V − S) be a cut that respects A. If e is a lightest edge crossing the cut, then `A ∪ {e}` is also a subset of some MST. In other words, the lightest edge crossing any cut that respects the chosen edges can safely be added.

Proof sketch (exchange argument): take an MST T that contains A. If e is already in T, done. Otherwise adding e to T creates a cycle, and that cycle must cross the cut at least twice, so it contains another edge f crossing the cut. Since e is a lightest crossing edge, `w(e) <= w(f)`. Removing f and adding e gives a spanning tree T′ with weight at most that of T, so T′ is also an MST, and it contains A and e (f was not in A because A does not cross the cut).

Cycle property (the companion): for any cycle in the graph, an edge of strictly maximum weight on the cycle belongs to no MST. Equivalently, the heaviest edge on a cycle can be discarded without affecting the MST weight.

How the algorithms use it:

- Prim's algorithm: the cut is (tree vertices, other vertices); the lightest edge leaving the tree is added
- Kruskal's algorithm: at each step the lightest edge joining two different components is the lightest edge crossing the cut between one of those components and the rest
- Borůvka's algorithm: each component picks its lightest outgoing edge (a cut for each component), and all picks are safe simultaneously when weights are distinct

Example: the graph with edges A-B 4, B-C 2, A-C 5, C-D 3, B-D 6. Consider the cut S = {A, B}, V − S = {C, D}. The crossing edges are A-C 5, B-C 2 and B-D 6; the lightest is B-C 2, so B-C belongs to some MST. For the cut S = {A}, the crossing edges are A-B 4 and A-C 5, so A-B is safe. The cycle A-B-C with weights 4, 2, 5 has the heaviest edge A-C, which can be dropped, and the MST has weight 4 + 2 + 3 = 9 using A-B, B-C and C-D.

Uniqueness and ties: if the lightest crossing edge is unique, it belongs to every MST; with ties, at least one lightest edge belongs to some MST (the property is stated with "a lightest edge"). If all weights are distinct, the MST is unique and every MST edge is the unique lightest edge across some cut (the cut obtained by removing that edge from the tree).

Consequences and uses:

- Correctness of every greedy MST algorithm follows by instantiating the property
- MST edges characterised: an edge (u, v) is in the MST exactly when it is a lightest edge across the cut that results from removing it from the MST
- Verification of a candidate tree: for each tree edge, the fundamental cut (removing the edge) has no lighter crossing edge, or equivalently for each non-tree edge, it is no lighter than the maximum edge on the tree path between its endpoints
- Reverse delete algorithm: considers edges from the heaviest, deleting an edge if the graph stays connected (by the cycle property)
- Dynamic MST maintenance: inserting an edge creates one cycle, where the heaviest edge is removed; deleting a tree edge requires finding the lightest replacement edge crossing the resulting cut
- Bottleneck property: the MST minimises the maximum edge on the path between any two vertices

Limitations: the cut property needs undirected graphs and says nothing about directed spanning trees (arborescences), where Edmonds' algorithm is needed.

Pitfalls: choosing a cut that does not respect the chosen edges (the guarantee fails), assuming a lightest edge of any cut is in every MST when ties exist, and confusing the property with shortest paths, where the cheapest edge out of a cut is not always safe.

## explain
1. Pick a set of edges already known to be in some MST.
2. Choose a cut that none of those edges crosses.
3. Find the lightest edge crossing that cut.
4. Add that edge, since it is safe.
5. Repeat until the edges form a spanning tree.
6. Use the cycle property to discard the heaviest edge of any cycle.

## example
The Python program tests the cut property on the sample graph, printing the lightest crossing edge for the cuts above and verifying on 200 seeded random graphs and random cuts that the lightest crossing edge always has the same weight as an edge of the MST that crosses the cut. The JavaScript program lists crossing edges for a cut and picks the lightest.

## real
Network design tools and proofs of correctness for clustering algorithms rely on the cut property, and dynamic MST structures use it to update trees as edges change.

## pros
- One short statement proves many algorithms correct
- Gives a simple test for whether an edge can be in an MST
- Extends to dynamic and parallel algorithms

## cons
- Requires care with ties
- Requires the cut to respect the chosen edges
- Does not apply to directed spanning trees

## uses
- Proving Prim's, Kruskal's and Borůvka's algorithms correct
- Verifying a candidate MST
- Updating an MST when an edge is added or removed
- Reasoning about bottleneck paths

## mistakes
- Choosing a cut that is crossed by an already selected edge
- Assuming that with ties every lightest crossing edge is in every MST
- Applying the property to directed graphs
- Mixing up the cut property and the cycle property

## interview
**Q:** State the cut property of minimum spanning trees.
**A:** For any cut of the vertices that no chosen edge crosses, the lightest edge crossing the cut can be added to the chosen edges and still be extended to a minimum spanning tree.

**Q:** How does the cycle property relate to it?
**A:** It says the maximum weight edge on any cycle belongs to no MST (when it is strictly the heaviest), so it can be discarded; it is the dual view that justifies deleting edges.

**Q:** How does Prim's algorithm use the cut property?
**A:** At each step the cut separates the tree vertices from the rest, and Prim's algorithm adds the lightest edge crossing that cut, which is safe by the property.

## summary
The cut property says that the lightest edge crossing a cut that respects the chosen edges is safe to add, which proves Prim's, Kruskal's and Borůvka's algorithms correct. Its dual, the cycle property, lets you discard the heaviest edge of a cycle.

## codenote
The Python sample tests the property on random graphs. The JavaScript sample finds the lightest crossing edge.

## code
### python
```python
import random

def crossing(edges, side):
    return [e for e in edges if side[e[0]] != side[e[1]]]

def mst_edges(n, edges):
    parent = list(range(n))

    def find(x):
        while parent[x] != x:
            x = parent[x]
        return x

    tree = []
    for u, v, w in sorted(edges, key=lambda e: e[2]):
        if find(u) != find(v):
            parent[find(u)] = find(v)
            tree.append((u, v, w))
    return tree

sample = [(0, 1, 4), (1, 2, 2), (0, 2, 5), (2, 3, 3), (1, 3, 6)]
for side in ({0: 0, 1: 0, 2: 1, 3: 1}, {0: 0, 1: 1, 2: 1, 3: 1}):
    print(min(crossing(sample, side), key=lambda e: e[2]))

rng = random.Random(17)
ok = True
for _ in range(200):
    n = rng.randint(3, 8)
    edges = [(i, rng.randrange(i), rng.randint(1, 9)) for i in range(1, n)]
    edges += [(rng.randrange(n), rng.randrange(n), rng.randint(1, 9)) for _ in range(rng.randint(0, 8))]
    edges = [e for e in edges if e[0] != e[1]]
    side = {v: rng.randint(0, 1) for v in range(n)}
    if len(set(side.values())) < 2:
        continue
    lightest = min(e[2] for e in crossing(edges, side))
    tree = mst_edges(n, edges)
    ok = ok and min(e[2] for e in crossing(tree, side)) == lightest
print(ok)
print(sum(w for _, _, w in mst_edges(4, sample)))
```
Output:
```text
(1, 2, 2)
(0, 1, 4)
True
9
```
### javascript
```javascript
function lightestCrossing(edges, inSet) {
  const crossing = edges.filter(([u, v]) => inSet.has(u) !== inSet.has(v));
  return crossing.sort((a, b) => a[2] - b[2])[0];
}

const edges = [["A", "B", 4], ["B", "C", 2], ["A", "C", 5], ["C", "D", 3], ["B", "D", 6]];
console.log(lightestCrossing(edges, new Set(["A", "B"])).join(""), lightestCrossing(edges, new Set(["A"])).join(""));
```
Output:
```text
BC2 AB4
```

## quiz
1. What does the cut property say?
   - [ ] The heaviest edge across a cut is safe
   - [x] The lightest edge crossing a cut that respects the chosen edges can be added safely
   - [ ] Every edge across a cut is in the MST
   - [ ] A cut has only one edge
   > It justifies the greedy choice.
2. What does the cycle property say?
   - [ ] The lightest edge of a cycle is in every MST
   - [x] A strictly heaviest edge on a cycle belongs to no MST
   - [ ] All cycles must be removed by weight
   - [ ] Cycles do not exist in graphs
   > It can be discarded safely.
3. What does it mean for a cut to respect a set of edges?
   - [ ] All the edges cross it
   - [x] None of the chosen edges crosses it
   - [ ] It contains the edges
   - [ ] It has equal sides
   > Both endpoints of each chosen edge lie on the same side.
4. How does Kruskal's algorithm use the property?
   - [ ] By always choosing the heaviest edge
   - [x] The lightest edge between two components is the lightest edge across a cut between one component and the rest
   - [ ] By ignoring cuts
   - [ ] By sorting vertices
   > Such an edge is safe.

# Maximum Spanning Tree
kind: algorithm
time: O(E log E) with Kruskal's algorithm sorting in descending order, or O(E log V) with Prim's algorithm taking the maximum key; the same as the minimum spanning tree.
space: O(V + E) for the graph, the edge list and the union-find structure.

## intro
The maximum spanning tree connects all vertices with the largest possible total edge weight. It is the right tool when weights measure benefit, capacity or similarity rather than cost: strongest links in a network, most reliable connections, or the best compatibility among items. It needs no new algorithm, only a change of direction.

## theory
Reduction: a maximum spanning tree of a graph with weights w is a minimum spanning tree of the same graph with weights −w (or with weights `M − w` for a constant M larger than every weight). Therefore any MST algorithm solves it after negating the weights, and the total is the negation of the result.

Direct approaches:

- Kruskal's algorithm: sort the edges by decreasing weight and keep each edge that joins two different components
- Prim's algorithm: keep the key as the largest edge weight to the tree and always add the vertex with the maximum key (a max-heap)
- Both are correct because the cut property and the cycle property have mirror images: the heaviest edge across a cut is safe, and the lightest edge on a cycle can be dropped

Example: edges A-B 4, A-C 5, B-C 2, C-D 3, B-D 6. Sorted in descending order: B-D 6, A-C 5, A-B 4, C-D 3, B-C 2. Kruskal's algorithm accepts B-D (6), A-C (5) and A-B (4); C-D (3) would close the cycle C-A-B-D-C, and B-C (2) would close a cycle. The maximum spanning tree has weight 6 + 5 + 4 = 15, while the minimum spanning tree of the same graph has weight 2 + 3 + 4 = 9.

Maximum bottleneck paths: in a maximum spanning tree, the path between any two vertices maximises the minimum edge weight (the widest path). To find the largest capacity route between two sites, build the maximum spanning tree and take the minimum edge on the tree path; for the example the widest path from C to D has the bottleneck min of the tree path C – A – B – D, which is min(5, 4, 6) = 4.

Applications:

- Network reliability: connect all nodes through the most reliable links (use log probabilities or maximise the product by taking logarithms)
- Highest bandwidth backbone and widest path queries
- Clustering by similarity: maximum spanning tree of a similarity graph, then cut the weakest tree edges to form clusters
- Chow-Liu trees: the maximum spanning tree of pairwise mutual information gives the best tree structured approximation of a joint probability distribution
- Phylogeny and dependency parsing: maximum spanning tree parsers pick the highest scoring dependency tree (for directed trees the Chu-Liu/Edmonds algorithm)
- Image and document similarity networks

Differences to remember: if all weights are negative, the maximum spanning tree still has V − 1 edges (it selects the least negative); the number of edges never changes; weights may be zero or negative without breaking the algorithm.

Directed version: the maximum spanning arborescence (directed rooted tree) needs the Chu-Liu/Edmonds algorithm, not Kruskal's algorithm.

Implementation notes: simply pass `reverse=True` to the sort or negate the weights; if using a min-heap library for Prim's algorithm, push negative weights; avoid mixing the two techniques accidentally; print the total with the right sign.

Pitfalls: sorting in the wrong direction after copying minimum spanning tree code, forgetting to negate the total, using the maximum spanning tree to find shortest paths (it gives widest paths instead) and confusing the maximum spanning tree with the longest path (a different, hard problem).

Testing: compare with a brute force over spanning trees on small graphs, and verify that negating the weights and finding the MST gives the same tree.

## explain
1. Decide that larger weights are better.
2. Sort the edges by decreasing weight, or negate the weights.
3. Run Kruskal's algorithm (or Prim's algorithm with a max-heap).
4. Sum the original weights of the chosen edges.
5. For widest paths, take the minimum edge on the tree path between two vertices.
6. Verify with brute force on small graphs.

## example
The Python program computes the maximum spanning tree (total 15) and the minimum spanning tree (total 9) of the sample graph, confirms the negation trick gives the same tree, and finds the widest path bottleneck 4 between C and D. The JavaScript program applies the idea to reliability: it prints the tree built from the most reliable links.

## real
Network operators choose the highest bandwidth backbone, machine learning uses Chow-Liu trees to model dependencies and linguists use maximum spanning tree parsers for dependency structure.

## pros
- No new algorithm, only a reversed order
- Gives widest paths between all pairs
- Applies to similarity and reliability problems

## cons
- Easy to forget to reverse the order or the sign
- Not the same as the longest path problem
- Directed versions need a different algorithm

## uses
- Highest bandwidth backbone selection
- Widest path queries
- Similarity based clustering
- Chow-Liu tree learning

## mistakes
- Sorting ascending after copying minimum spanning tree code
- Forgetting to negate the total after using negated weights
- Using it to find shortest paths
- Applying Kruskal's algorithm to directed trees

## interview
**Q:** How do you compute a maximum spanning tree?
**A:** Run any minimum spanning tree algorithm on the negated weights, or run Kruskal's algorithm with the edges sorted in decreasing order of weight.

**Q:** What property does the path in a maximum spanning tree have?
**A:** It maximises the minimum edge weight among all paths between its endpoints, so it is a widest (maximum bottleneck) path.

**Q:** Is the maximum spanning tree the same as the longest path?
**A:** No; the longest simple path problem is NP-hard, while the maximum spanning tree is solvable in O(E log V).

## summary
A maximum spanning tree is found by running Kruskal's or Prim's algorithm with the order reversed, and its tree paths are widest paths. It serves reliability, bandwidth and similarity problems.

## codenote
The Python sample compares maximum and minimum trees. The JavaScript sample builds a reliability backbone.

## code
### python
```python
def spanning_tree(n, edges, maximum):
    parent = list(range(n))

    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x

    tree = []
    for u, v, w in sorted(edges, key=lambda e: e[2], reverse=maximum):
        if find(u) != find(v):
            parent[find(u)] = find(v)
            tree.append((u, v, w))
    return tree

names = "ABCD"
raw = [("A", "B", 4), ("A", "C", 5), ("B", "C", 2), ("C", "D", 3), ("B", "D", 6)]
edges = [(names.index(u), names.index(v), w) for u, v, w in raw]
biggest = spanning_tree(4, edges, True)
smallest = spanning_tree(4, edges, False)
print(sum(w for *_, w in biggest), sum(w for *_, w in smallest))
negated = spanning_tree(4, [(u, v, -w) for u, v, w in edges], False)
print(sorted(biggest) == sorted((u, v, -w) for u, v, w in negated))

def widest(tree, source, target):
    graph = {}
    for u, v, w in tree:
        graph.setdefault(u, []).append((v, w))
        graph.setdefault(v, []).append((u, w))
    stack = [(source, float("inf"))]
    seen = {source}
    while stack:
        node, bottleneck = stack.pop()
        if node == target:
            return bottleneck
        for nxt, w in graph[node]:
            if nxt not in seen:
                seen.add(nxt)
                stack.append((nxt, min(bottleneck, w)))

print(widest(biggest, names.index("C"), names.index("D")))
```
Output:
```text
15 9
True
4
```
### javascript
```javascript
function backbone(n, links) {
  const parent = Array.from({ length: n }, (_, i) => i);
  const find = (x) => {
    while (parent[x] !== x) x = parent[x] = parent[parent[x]];
    return x;
  };
  const chosen = [];
  for (const [u, v, reliability] of [...links].sort((a, b) => b[2] - a[2])) {
    if (find(u) !== find(v)) {
      parent[find(u)] = find(v);
      chosen.push(u + "-" + v + ":" + reliability);
    }
  }
  return chosen.join(" ");
}

console.log(backbone(5, [[0, 1, 0.9], [0, 2, 0.5], [1, 2, 0.8], [2, 3, 0.95], [3, 4, 0.7], [1, 4, 0.6]]));
```
Output:
```text
2-3:0.95 0-1:0.9 1-2:0.8 3-4:0.7
```

## quiz
1. How is a maximum spanning tree computed with Kruskal's algorithm?
   - [ ] By sorting edges ascending
   - [x] By sorting edges in decreasing order of weight
   - [ ] By deleting the lightest edge
   - [ ] By running it twice
   > The same loop with a reversed order.
2. What happens if all weights are negated and the MST is found?
   - [ ] It fails
   - [x] The result is a maximum spanning tree of the original weights
   - [ ] It returns the longest path
   - [ ] It returns a random tree
   > Minimising the negated weights maximises the originals.
3. What do paths in a maximum spanning tree maximise?
   - [ ] The total weight of the path
   - [x] The minimum edge weight along the path
   - [ ] The number of edges
   - [ ] The longest edge
   > They are widest paths.
4. Is the maximum spanning tree problem NP-hard?
   - [ ] Yes
   - [x] No, it is solvable in O(E log V)
   - [ ] Only for directed graphs
   - [ ] Only for complete graphs
   > The longest path problem is hard, not this one.

# Second Best MST
kind: algorithm
time: O(E log V + V squared) with the maximum-edge-on-path table, or O(E log V) with binary lifting; the brute force of removing each MST edge costs O(V E α(V)).
space: O(V) for the tree, plus O(V squared) for the path maximum table or O(V log V) for binary lifting.

## intro
The second best minimum spanning tree is the spanning tree with the smallest total weight among all spanning trees that differ from the MST. It tells you how robust the optimum is: how much more it costs if the best tree is unavailable, and it is also what you need to decide whether an edge is critical. It differs from the MST by exactly one edge swap.

## theory
Key fact: for any graph there exists a second best spanning tree that differs from a minimum spanning tree T in exactly one edge: it is `T − {f} + {e}` for some non-tree edge e and tree edge f. So it is enough to examine all single swaps.

Which swap to choose: for a non-tree edge e = (u, v) with weight w(e), adding e to T creates a unique cycle, consisting of e and the tree path from u to v. To obtain a spanning tree again, remove an edge f on that path. The best choice removes the heaviest edge of the path, giving the cost increase `w(e) − max(path(u, v))`. The second best tree minimises this increase over all non-tree edges e:

`second_best = total(T) + min over non-tree edges e of (w(e) − maxEdgeOnPath(u, v))`

Strictness: if the swap has increase zero (an equal weight edge replaces a tree edge), the result is a different MST of the same weight. Whether this counts as "second best" depends on the definition: some problems want the best tree with strictly larger weight, in which case you also need the second maximum edge on the path to handle the case where e has the same weight as the path maximum.

Example: the graph with edges A-B 1, B-C 2, C-D 3, A-D 4, A-C 5. The MST is A-B, B-C and C-D with total 6. The non-tree edges are A-D (4) and A-C (5). For A-D, the tree path A-B-C-D has maximum edge 3, so the increase is 4 − 3 = 1. For A-C the path A-B-C has maximum 2, so the increase is 5 − 2 = 3. The smallest increase is 1, so the second best tree has total weight 7, replacing C-D by A-D.

Computing the maximum edge on the tree path efficiently:

- For small V, run a depth first search from each vertex and fill a table `best[u][v]` of path maxima: O(V squared)
- With binary lifting on the rooted MST, store for each vertex its 2^k-th ancestor and the maximum edge along that jump; a query for (u, v) takes O(log V) via the lowest common ancestor
- Offline with union-find while building the MST in Kruskal order: the maximum edge on the path of two vertices is the weight of the Kruskal edge that first connected them (the Kruskal reconstruction tree)

Alternative brute force: for each MST edge f, remove it and compute the MST of the graph without f (the cost of excluding f), then take the minimum. This is simple, and costs O(V · E α(V)) with a sorted edge list, which suits small graphs.

Uses:

- Robustness and sensitivity analysis: how expensive is the next best network layout if the best one fails?
- Checking uniqueness of the MST: the MST is unique exactly when no swap has an increase of zero
- Finding the minimum increase for which an MST edge can be replaced (the replacement edge for a failing link)
- Competitive programming and interviews on k-th best spanning trees; the k best trees can be enumerated with the Lawler or Gabow methods
- Deciding which edges are critical or pseudo-critical (appear in all MSTs or in some MST)

Pitfalls: assuming the second best tree uses a completely different set of edges (it differs in one swap), forgetting the maximum along the path (using the edge with the same weight as e), mixing non-strict and strict definitions, and ignoring graphs where the second best does not exist (a tree graph has only one spanning tree).

Testing: compare with the brute force of removing each tree edge, and with enumeration of all spanning trees on tiny graphs.

## explain
1. Build an MST T with Kruskal's or Prim's algorithm.
2. For every non-tree edge e, find the maximum edge on the tree path between its endpoints.
3. Compute the cost increase as w(e) minus that maximum.
4. Take the smallest increase and add it to the MST weight.
5. For a strict second best, use the second maximum on the path when the increase would be zero.
6. Verify with the brute force of removing each tree edge.

## example
The Python program computes the MST (6) and the second best (7) for the sample, verifies the swap formula against removing each MST edge and recomputing, and checks 100 random graphs by enumerating all spanning trees. The JavaScript program does the brute force version on another graph.

## real
Network planners compute the backup layout cost if the cheapest design is unavailable, and sensitivity analysis tools report the cost increase when a link is excluded.

## pros
- Needs only single edge swaps
- Quantifies how robust the optimum is
- Reuses the MST and path maximum queries

## cons
- Definition (strict or non-strict) must be settled first
- Efficient path maximum queries add code
- Does not exist for trees

## uses
- Backup network cost estimation
- Testing uniqueness of the MST
- Finding critical and pseudo-critical edges
- Sensitivity analysis of an optimal network

## mistakes
- Looking for a second best tree with many differing edges
- Using the wrong path maximum
- Mixing up strict and non-strict second best definitions
- Forgetting that a tree has no second spanning tree

## interview
**Q:** How is the second best MST obtained from the MST?
**A:** It differs from the MST by one edge swap: add a non-tree edge e and remove the heaviest edge on the tree path between its endpoints, choosing the swap with the smallest weight increase.

**Q:** How do you find the heaviest edge on a tree path quickly?
**A:** Use binary lifting with maximum edge weights on the rooted MST for O(log V) queries, or the Kruskal reconstruction tree, or a precomputed table for small graphs.

**Q:** How can you test whether the MST is unique?
**A:** Check that no non-tree edge has the same weight as the maximum edge on its tree path; if one does, swapping gives another MST of equal weight.

## summary
The second best MST differs from the MST by a single edge swap that minimises the weight increase, which is the non-tree edge weight minus the heaviest edge on its tree path. It measures robustness and tests uniqueness.

## codenote
The Python sample uses the swap formula and verifies it. The JavaScript sample uses brute force exclusion.

## code
### python
```python
import random
from itertools import combinations

def kruskal(n, edges, banned=None):
    parent = list(range(n))

    def find(x):
        while parent[x] != x:
            x = parent[x]
        return x

    tree, total = [], 0
    for edge in sorted(edges, key=lambda e: e[2]):
        if edge == banned:
            continue
        u, v, w = edge
        if find(u) != find(v):
            parent[find(u)] = find(v)
            tree.append(edge)
            total += w
    return tree, total

def second_best(n, edges):
    tree, total = kruskal(n, edges)
    adjacent = {v: [] for v in range(n)}
    for u, v, w in tree:
        adjacent[u].append((v, w))
        adjacent[v].append((u, w))

    def path_max(source, target):
        stack = [(source, -1, 0)]
        while stack:
            node, parent, best = stack.pop()
            if node == target:
                return best
            for nxt, w in adjacent[node]:
                if nxt != parent:
                    stack.append((nxt, node, max(best, w)))

    increases = [w - path_max(u, v) for u, v, w in edges if (u, v, w) not in tree]
    return total, total + min(increases) if increases else None

names = "ABCD"
raw = [("A", "B", 1), ("B", "C", 2), ("C", "D", 3), ("A", "D", 4), ("A", "C", 5)]
edges = [(names.index(u), names.index(v), w) for u, v, w in raw]
print(second_best(4, edges))
brute = min((kruskal(4, edges, banned=e)[1] for e in kruskal(4, edges)[0] if len(kruskal(4, edges, banned=e)[0]) == 3))
print(brute)

def spanning_totals(n, edges):
    totals = []
    for subset in combinations(edges, n - 1):
        parent = list(range(n))

        def find(x):
            while parent[x] != x:
                x = parent[x]
            return x

        if all(find(u) != find(v) and not parent.__setitem__(find(u), find(v)) for u, v, _ in subset):
            totals.append(sum(w for *_, w in subset))
    return sorted(totals)

rng = random.Random(23)
ok = True
for _ in range(100):
    n = rng.randint(3, 6)
    edges = [(i, rng.randrange(i), rng.randint(1, 9)) for i in range(1, n)]
    edges += [(rng.randrange(n), rng.randrange(n), rng.randint(1, 9)) for _ in range(rng.randint(1, 5))]
    edges = list({(min(u, v), max(u, v), w) for u, v, w in edges if u != v})
    totals = spanning_totals(n, edges)
    if len(totals) < 2:
        continue
    ok = ok and second_best(n, edges)[1] == totals[1]
print(ok)
```
Output:
```text
(6, 7)
7
True
```
### javascript
```javascript
function mstTotal(n, edges, skip) {
  const parent = Array.from({ length: n }, (_, i) => i);
  const find = (x) => {
    while (parent[x] !== x) x = parent[x] = parent[parent[x]];
    return x;
  };
  let total = 0;
  let used = 0;
  for (const edge of [...edges].sort((a, b) => a[2] - b[2])) {
    if (edge === skip) continue;
    const a = find(edge[0]);
    const b = find(edge[1]);
    if (a !== b) {
      parent[a] = b;
      total += edge[2];
      used++;
    }
  }
  return used === n - 1 ? total : Infinity;
}

const edges = [[0, 1, 2], [1, 2, 3], [2, 3, 1], [0, 3, 5], [0, 2, 4], [1, 3, 6]];
const best = mstTotal(4, edges, null);
const second = Math.min(...edges.map((e) => mstTotal(4, edges, e)).filter((t) => t > best));
console.log(best, second);
```
Output:
```text
6 7
```

## quiz
1. How does the second best MST differ from the MST?
   - [ ] In all edges
   - [x] By one edge swap
   - [ ] By one extra edge
   - [ ] By the removal of a vertex
   > A non-tree edge replaces a tree edge.
2. Which tree edge is removed when a non-tree edge is added?
   - [ ] The lightest edge of the cycle
   - [x] The heaviest edge on the tree path between its endpoints
   - [ ] A random edge of the cycle
   - [ ] The newly added edge
   > This keeps the weight increase smallest.
3. What indicates that the MST is not unique?
   - [ ] A graph with a cycle
   - [x] A non-tree edge with the same weight as the maximum edge on its tree path
   - [ ] An edge of weight zero
   - [ ] A vertex of degree one
   > Swapping gives another MST of equal weight.
4. What is the second best spanning tree of a tree graph?
   - [ ] The tree itself
   - [x] It does not exist
   - [ ] The empty tree
   - [ ] A forest
   > A tree has only one spanning tree.

# Minimum Bottleneck Spanning Tree
kind: algorithm
time: O(E log V) to build an MST (every MST is a minimum bottleneck spanning tree), and O(E) to find the bottleneck value of the graph alone with a selection method; a query for the minimax path between two vertices takes O(V) on the tree or O(log V) with binary lifting.
space: O(V + E) for the graph and tree, plus O(V log V) for binary lifting tables.

## intro
In some networks the total cost does not matter as much as the weakest link: the largest edge on a connection decides the latency, the toll or the cable length that must be supported. A minimum bottleneck spanning tree minimises the heaviest edge in the tree. Surprisingly, every minimum spanning tree already does so, which also solves the minimax path problem between any two vertices.

## theory
Definitions:

- The bottleneck of a spanning tree is the weight of its heaviest edge
- A minimum bottleneck spanning tree (MBST) is a spanning tree with the smallest possible bottleneck
- The bottleneck (minimax) distance between two vertices u and v is the minimum, over all paths from u to v, of the heaviest edge on the path

Theorem: every minimum spanning tree is a minimum bottleneck spanning tree. Proof idea: suppose an MST T has bottleneck b and some spanning tree T′ has a smaller bottleneck b′ < b. Remove the heaviest edge e of T (weight b); this splits T into two components. T′ is connected, so it contains an edge f crossing the same cut, with weight at most b′ < b. By the cut property reasoning, swapping e for f would give a lighter spanning tree, contradicting that T is an MST. Therefore no tree has a smaller bottleneck.

The converse does not hold: a minimum bottleneck spanning tree need not be a minimum spanning tree. A spanning tree with the same heaviest edge but heavier other edges is also an MBST. Example: edges A-B 1, B-C 5, C-D 1, A-D 5, A-C 5. The MST has weight 1 + 1 + 5 = 7 and bottleneck 5. A spanning tree using A-D 5, B-C 5 and A-B 1 has weight 11 and the same bottleneck 5, so it is an MBST but not an MST.

Minimax path between two vertices: the unique path between u and v in an MST is a minimax path, i.e., its heaviest edge equals the bottleneck distance of u and v in the graph. To answer queries: build the MST, root it, and take the maximum edge along the tree path (by walking up with the lowest common ancestor, binary lifting, or by processing with union-find).

Offline approach with union-find: sort the edges and union them in order; the bottleneck distance between u and v is the weight of the edge at which they first become connected. This also works for path queries "can I get from u to v using only edges of weight at most L?" (offline queries with DSU).

Examples of questions:

- Bottleneck of a graph: the smallest L such that the subgraph of edges with weight at most L is connected; equal to the heaviest edge of any MST
- Path with minimum effort or maximum edge: for a grid of heights where the effort of a step is the height difference, the minimax path can be found with a shortest path search using max instead of sum, or with sorted edges and union-find
- Widest path (maximin): the dual problem on a maximum spanning tree
- Kruskal reconstruction tree: a binary tree built while running Kruskal's algorithm where each merge creates a node weighted with the edge; the bottleneck between two vertices is the weight of their lowest common ancestor, giving constant time queries after preprocessing

Example: for the graph with edges A-B 1, B-C 5, C-D 1, A-D 5, A-C 5, the minimax distance from A to D is 1 + ... the MST path A-B-C-D has edges 1, 5, 1 so the bottleneck is 5; and between A and B it is 1 (direct light edge), between B and D it is 5.

Applications: low latency routing (minimise the slowest link), designing power or communication networks with a limit on the longest cable, clustering (the bottleneck distance is the single linkage distance), checking feasibility under capacity or toll limits, and image segmentation by minimum weight edge criteria.

Complexity: O(E α(V)) after sorting, so O(E log E) overall; Prim's algorithm yields the same tree; a linear time algorithm for the bottleneck value uses repeated median selection (Camerini).

Pitfalls: believing an MBST is always an MST, summing weights for a minimax problem, treating the minimax path as the shortest path and forgetting that the path in the MST is unique while other minimax paths may exist.

Testing: compare MST path maxima with a brute force over all simple paths on small graphs, and compare with a binary search on the threshold with a connectivity check.

## explain
1. Build a minimum spanning tree of the graph.
2. The tree's heaviest edge is the bottleneck of the graph.
3. For two vertices, find the path in the tree between them.
4. The heaviest edge on that path is their minimax distance.
5. For many queries use binary lifting or union-find in sorted order.
6. Verify with a threshold search and a connectivity test.

## example
The Python program shows an MST and a non-MST tree sharing the bottleneck 5, computes minimax distances between pairs from the MST path and verifies them against brute force enumeration of simple paths on random graphs. The JavaScript program finds the earliest threshold at which two vertices become connected.

## real
Network engineers minimise the longest hop latency, planners limit the longest cable run and analysts use bottleneck distances for single linkage clustering.

## pros
- Any MST solves the bottleneck problem
- Gives minimax path queries between all pairs
- Works with simple union-find

## cons
- An MBST is not necessarily a cheapest tree
- Multiple minimax paths may exist
- Easy to confuse with shortest or widest paths

## uses
- Minimising the heaviest link in a network
- Minimax path queries
- Single linkage clustering distances
- Threshold based connectivity questions

## mistakes
- Assuming a minimum bottleneck tree is a minimum spanning tree
- Summing edge weights when a maximum is required
- Using the shortest path where the minimax path is requested
- Not rebuilding the tree after the weights change

## interview
**Q:** What is a minimum bottleneck spanning tree and how is it found?
**A:** A spanning tree whose heaviest edge is as small as possible; any minimum spanning tree is one, so Kruskal's or Prim's algorithm finds it.

**Q:** How do you find the minimax path between two vertices?
**A:** Build the MST and take the heaviest edge on the unique tree path between them, or union edges in sorted order and report the weight at which the two vertices first become connected.

**Q:** Is every minimum bottleneck spanning tree an MST?
**A:** No; a tree can have the same heaviest edge as an MST and still have a larger total weight.

## summary
Every minimum spanning tree minimises the heaviest edge, and the MST path between two vertices is a minimax path. Use Kruskal's order with union-find or a rooted MST with binary lifting for queries.

## codenote
The Python sample compares trees and checks minimax paths. The JavaScript sample finds the connecting threshold.

## code
### python
```python
import random

def mst(n, edges):
    parent = list(range(n))

    def find(x):
        while parent[x] != x:
            x = parent[x]
        return x

    tree = []
    for u, v, w in sorted(edges, key=lambda e: e[2]):
        if find(u) != find(v):
            parent[find(u)] = find(v)
            tree.append((u, v, w))
    return tree

def tree_minimax(tree, n, source, target):
    graph = {v: [] for v in range(n)}
    for u, v, w in tree:
        graph[u].append((v, w))
        graph[v].append((u, w))
    stack = [(source, -1, 0)]
    while stack:
        node, parent, best = stack.pop()
        if node == target:
            return best
        for nxt, w in graph[node]:
            if nxt != parent:
                stack.append((nxt, node, max(best, w)))

def brute_minimax(n, edges, source, target):
    graph = {v: [] for v in range(n)}
    for u, v, w in edges:
        graph[u].append((v, w))
        graph[v].append((u, w))
    best = [float("inf")]

    def walk(node, seen, worst):
        if node == target:
            best[0] = min(best[0], worst)
            return
        for nxt, w in graph[node]:
            if nxt not in seen:
                walk(nxt, seen | {nxt}, max(worst, w))

    walk(source, {source}, 0)
    return best[0]

edges = [(0, 1, 1), (1, 2, 5), (2, 3, 1), (0, 3, 5), (0, 2, 5)]
tree = mst(4, edges)
other = [(0, 3, 5), (1, 2, 5), (0, 1, 1)]
print(sum(w for *_, w in tree), max(w for *_, w in tree), sum(w for *_, w in other), max(w for *_, w in other))
print([tree_minimax(tree, 4, a, b) for a, b in ((0, 1), (1, 3), (0, 3))])

rng = random.Random(29)
ok = True
for _ in range(100):
    n = rng.randint(2, 6)
    edges = [(i, rng.randrange(i), rng.randint(1, 9)) for i in range(1, n)]
    edges += [(rng.randrange(n), rng.randrange(n), rng.randint(1, 9)) for _ in range(rng.randint(0, 5))]
    edges = [e for e in edges if e[0] != e[1]]
    tree = mst(n, edges)
    ok = ok and all(tree_minimax(tree, n, a, b) == brute_minimax(n, edges, a, b) for a in range(n) for b in range(a + 1, n))
print(ok)
```
Output:
```text
7 5 11 5
[1, 5, 5]
True
```
### javascript
```javascript
function connectingThreshold(n, edges, source, target) {
  const parent = Array.from({ length: n }, (_, i) => i);
  const find = (x) => {
    while (parent[x] !== x) x = parent[x] = parent[parent[x]];
    return x;
  };
  for (const [u, v, w] of [...edges].sort((a, b) => a[2] - b[2])) {
    parent[find(u)] = find(v);
    if (find(source) === find(target)) return w;
  }
  return -1;
}

const edges = [[0, 1, 7], [1, 2, 3], [0, 2, 9], [2, 3, 4], [3, 4, 2], [1, 4, 8]];
console.log(connectingThreshold(5, edges, 0, 4), connectingThreshold(5, edges, 2, 4), connectingThreshold(5, edges, 3, 4));
```
Output:
```text
7 4 2
```

## quiz
1. What is the bottleneck of a spanning tree?
   - [ ] The sum of its edges
   - [x] The weight of its heaviest edge
   - [ ] The number of its edges
   - [ ] The weight of its lightest edge
   > A minimum bottleneck tree minimises it.
2. Which trees are minimum bottleneck spanning trees?
   - [ ] Only unique MSTs
   - [x] Every minimum spanning tree is one
   - [ ] Only shortest path trees
   - [ ] None of them
   > The cut property proves it.
3. How is the minimax path between two vertices found?
   - [ ] With Dijkstra's algorithm using sums
   - [x] As the heaviest edge on the MST path between them
   - [ ] As the lightest edge of the graph
   - [ ] By counting edges
   > The MST path minimises the heaviest edge.
4. Does a minimum bottleneck tree have to minimise the total weight?
   - [ ] Yes
   - [x] No, it can have a larger total weight than the MST
   - [ ] Only for complete graphs
   - [ ] Only for trees
   > Only the heaviest edge is minimised.
