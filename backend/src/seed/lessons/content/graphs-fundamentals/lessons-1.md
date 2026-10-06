# Graph Terminology
kind: concept
time: Not an algorithmic topic — terminology has no running time. Operations on graphs are described later in terms of the number of vertices V and edges E, such as O(V + E) for a full traversal.
space: Not an algorithmic topic — a graph with V vertices and E edges needs O(V + E) memory in an adjacency list and O(V squared) in an adjacency matrix.

## intro
A graph is a set of vertices (also called nodes) connected by edges. It is the most general structure for describing relationships: roads between cities, friendships between people, links between web pages, dependencies between tasks. A shared vocabulary lets you state graph problems exactly and recognise them inside everyday questions.

## theory
Basic definitions:

- Vertex (node): an item in the graph, such as a city or a person
- Edge (link, arc): a connection between two vertices; in an undirected graph an edge `{u, v}` has no direction, in a directed graph an edge `(u, v)` goes from u to v
- Graph G = (V, E): the set of vertices V and the set of edges E; the sizes are written |V| (or just V) and |E| (or E)
- Adjacent vertices (neighbours): two vertices joined by an edge
- Degree of a vertex: the number of edges touching it (for directed graphs, the in-degree counts incoming edges and the out-degree counts outgoing edges)
- Self loop: an edge from a vertex to itself; parallel (multiple) edges: several edges between the same pair; a simple graph has neither
- Path: a sequence of vertices in which consecutive vertices are adjacent; its length is the number of edges; a simple path repeats no vertex
- Cycle: a path that starts and ends at the same vertex (with at least one edge, and in a simple cycle no other repeated vertex)
- Connected graph: every pair of vertices is joined by a path; a connected component is a maximal connected piece
- Subgraph: a graph made from a subset of the vertices and edges
- Tree: a connected graph with no cycles; a forest is a graph whose components are trees
- Complete graph K_n: every pair of vertices is adjacent; it has n(n − 1) / 2 edges
- Sparse and dense graphs: a graph is sparse when E is much smaller than V squared (roads) and dense when E is close to V squared (a complete network)

Counting facts for simple undirected graphs: the number of edges is at most V(V − 1) / 2, so 10 vertices allow at most 45 edges; a connected graph has at least V − 1 edges; a tree has exactly V − 1 edges; the density `2E / (V(V − 1))` lies between 0 and 1.

Worked example. Consider the vertices A, B, C, D, E and the edges A-B, A-C, B-C, C-D (E has no edges). There are 5 vertices and 4 edges; the degrees are A 2, B 2, C 3, D 1 and E 0, which sum to 8, twice the number of edges. A-C-D is a path of length 2; A-B-C-A is a cycle of length 3; E is isolated, so the graph is not connected and has 2 components, {A, B, C, D} and {E}. The density is 2 · 4 / (5 · 4) = 0.4.

Kinds of graphs: undirected and directed (next lesson), weighted (edges carry costs), bipartite (vertices split into two groups with edges only between groups), planar (can be drawn without crossings), acyclic (no cycles), labelled and multigraphs.

Why it matters: many problems hide a graph. Cities and roads give shortest paths; tasks and prerequisites give a dependency graph; words that differ by one letter give a word graph; board positions and legal moves give a state graph; and pixels with neighbours give a grid graph. Naming vertices and edges is the first step in solving them.

Terminology differences: books use "node" and "vertex", "edge" and "arc", "neighbour" and "adjacent", and some count path length in vertices; always check the convention. In code, vertices are usually numbered from 0 to V − 1 or identified by names mapped to numbers.

Representations preview: adjacency list, adjacency matrix and edge list store the same information with different costs, covered in the next lessons.

## explain
1. Identify the vertices: what are the entities in the problem?
2. Identify the edges: which pairs are related and is the relation symmetric?
3. Decide whether edges are directed or carry weights.
4. Compute the basic measures: V, E, degrees, density and connectivity.
5. Look for paths, cycles and components that answer the question.
6. Choose a representation that suits the size and density.

## example
The Python program stores the five vertex sample graph, prints the number of vertices and edges, the degrees, the sum of degrees (8), the density 0.4, the components {A, B, C, D} and {E} and the maximum number of edges for 5 vertices (10). The JavaScript program lists how many edges a complete graph has for 4, 10 and 100 vertices.

## real
Maps, social networks, the web, dependency managers and circuit layouts are all graphs, and the vocabulary of degree, path and component appears throughout their documentation.

## pros
- A shared vocabulary makes graph problems precise
- Many different situations map to the same few ideas
- Basic counting facts give quick sanity checks

## cons
- Conventions differ between books and libraries
- Real graphs can be huge, so naive thinking about all pairs fails
- The same relationship can be modelled in several ways

## uses
- Reading and stating graph problems
- Modelling relationships as vertices and edges
- Computing degrees, density and components
- Choosing between sparse and dense representations

## mistakes
- Confusing the number of vertices on a path with its length in edges
- Forgetting isolated vertices when counting components
- Assuming every graph is connected or simple
- Mixing up the maximum edge counts for directed and undirected graphs

## interview
**Q:** What is the difference between a path and a cycle?
**A:** A path is a sequence of adjacent vertices from one vertex to another, while a cycle is a path that returns to its starting vertex.

**Q:** How many edges can a simple undirected graph with V vertices have at most?
**A:** V times V minus 1, divided by 2, which is reached by the complete graph.

**Q:** What defines a connected component?
**A:** A maximal set of vertices in which every pair is joined by a path; adding any other vertex would break the property.

## summary
A graph consists of vertices and edges, described by degree, path, cycle, connectivity and density. Learn the vocabulary and the counting facts, because every graph algorithm and every modelling decision relies on them.

## codenote
The Python sample computes measures for a small graph. The JavaScript sample lists complete graph edge counts.

## code
### python
```python
edges = [("A", "B"), ("A", "C"), ("B", "C"), ("C", "D")]
vertices = ["A", "B", "C", "D", "E"]
adjacent = {v: set() for v in vertices}
for u, v in edges:
    adjacent[u].add(v)
    adjacent[v].add(u)

degrees = {v: len(adjacent[v]) for v in vertices}
print(len(vertices), len(edges), degrees, sum(degrees.values()))
print(round(2 * len(edges) / (len(vertices) * (len(vertices) - 1)), 2), len(vertices) * (len(vertices) - 1) // 2)

def components():
    seen, found = set(), []
    for start in vertices:
        if start in seen:
            continue
        stack, group = [start], set()
        while stack:
            node = stack.pop()
            if node not in group:
                group.add(node)
                stack.extend(adjacent[node] - group)
        seen |= group
        found.append(sorted(group))
    return found

print(components())
```
Output:
```text
5 4 {'A': 2, 'B': 2, 'C': 3, 'D': 1, 'E': 0} 8
0.4 10
[['A', 'B', 'C', 'D'], ['E']]
```
### javascript
```javascript
const completeEdges = (n) => (n * (n - 1)) / 2;
console.log([4, 10, 100].map((n) => n + ":" + completeEdges(n)).join(" "));
```
Output:
```text
4:6 10:45 100:4950
```

## quiz
1. What is the degree of a vertex in an undirected graph?
   - [ ] The number of vertices in the graph
   - [x] The number of edges touching it
   - [ ] The length of the longest path from it
   - [ ] The number of cycles through it
   > Self loops count twice in many conventions.
2. How many edges does a tree with V vertices have?
   - [ ] V
   - [x] V − 1
   - [ ] V + 1
   - [ ] V squared
   > It is connected and has no cycles.
3. What is a connected component?
   - [ ] A single vertex
   - [x] A maximal set of vertices that are all reachable from one another
   - [ ] A cycle
   - [ ] An edge with its two endpoints
   > It cannot be extended by another vertex.
4. How many edges does the complete graph on 10 vertices have?
   - [ ] 10
   - [x] 45
   - [ ] 90
   - [ ] 100
   > It is 10 times 9 divided by 2.

# Directed vs Undirected
kind: concept
time: Not an algorithmic topic — the distinction changes which algorithms apply. Reachability in a directed graph still costs O(V + E), but strongly connected components, topological order and shortest paths behave differently from the undirected case.
space: Not an algorithmic topic — an undirected edge is stored twice in an adjacency list (once per endpoint), a directed edge once, so undirected graphs use about double the list entries for the same number of edges.

## intro
In an undirected graph an edge is a two way street: if u is connected to v, then v is connected to u. In a directed graph (digraph) an edge is a one way street from a source to a target. Choosing the right kind decides what questions make sense, how the data is stored and which algorithms can be used.

## theory
Undirected graph: edges are unordered pairs `{u, v}`. The relation is symmetric. Typical examples: friendships on a mutual friendship network, roads that allow travel both ways, collaboration between authors, electrical connections. Each undirected edge adds 1 to the degree of both endpoints. Connectivity is a single notion: components.

Directed graph: edges are ordered pairs `(u, v)`, drawn as arrows. The relation need not be symmetric. Typical examples: following on a social network, links between web pages, one way streets, task prerequisites, state transitions and call graphs. Each vertex has an in-degree (incoming edges) and an out-degree (outgoing edges); the sum of all in-degrees equals the sum of all out-degrees, which equals E.

Differences that matter:

- Reachability is asymmetric: a path from u to v does not give a path from v to u. In the directed graph with edges A → B, B → C and C → B, A reaches C but C does not reach A.
- Connectivity has two forms: weakly connected (the graph is connected when directions are ignored) and strongly connected (every vertex reaches every other along directed paths). A directed graph can be weakly connected but not strongly connected, such as a single arrow A → B.
- Strongly connected components partition the vertices into maximal groups that reach each other; contracting them gives a directed acyclic graph (DAG)
- Cycles: directed cycles follow arrows; a graph without them is a DAG, which admits a topological order
- Counting edges: an undirected simple graph has at most V(V − 1) / 2 edges, a directed simple graph at most V(V − 1)
- Algorithms: topological sorting, strongly connected components and directed shortest path variants exist only for directed graphs; minimum spanning trees and bridges are for undirected graphs

Conversions:

- Undirected to directed: replace each undirected edge `{u, v}` by two arcs `(u, v)` and `(v, u)`. Algorithms for directed graphs then work on undirected data. The 3 undirected edges of a triangle become 6 arcs.
- Directed to undirected: forget the directions (the underlying undirected graph), which may merge antiparallel arcs
- Transpose (reverse) graph: reverse every arc; used in Kosaraju's algorithm and to compute who points to a vertex. The transpose of A → B, B → C is B → A, C → B.

Representation: an adjacency list for an undirected graph stores each edge twice; for a directed graph only in the source's list, so finding the incoming edges of a vertex needs a scan or a second structure (the reverse graph). In an adjacency matrix an undirected graph is symmetric (`M[u][v] == M[v][u]`), while a directed graph generally is not.

Choosing a model: if the relation is mutual by nature (friendship by agreement), use undirected; if it can be one sided (follows, depends on, links to), use directed. If unsure, ask what the edge means from each side. Modelling a one sided relation as undirected loses information; modelling a mutual one as directed doubles the work.

Examples: in a "who follows whom" graph the celebrity has a large in-degree and small out-degree; in a task graph a task with in-degree zero can start immediately; in a web graph PageRank flows along arrows.

## explain
1. Ask whether the relationship is mutual or can go one way.
2. Use undirected edges for symmetric relations and directed edges for asymmetric ones.
3. For directed graphs track in-degrees and out-degrees separately.
4. Remember that reachability may not be symmetric in directed graphs.
5. Convert an undirected graph to a directed one by adding both arcs when needed.
6. Compute the transpose graph when incoming edges are required.

## example
The Python program computes in-degrees and out-degrees for a small directed graph, shows that the sum of each equals the number of edges, checks reachability both ways between two vertices and builds the transpose. The JavaScript program converts an undirected edge list into arcs and counts them.

## real
Web search treats links as directed edges, social platforms mix directed follows and undirected friendships, and build tools use directed dependency graphs.

## pros
- Directed edges capture one-sided relations precisely
- Undirected edges keep symmetric data simple
- The right model enables the right algorithms

## cons
- Directed graphs need separate incoming and outgoing views
- Modelling mistakes lose or duplicate information
- Some algorithms only exist for one of the two kinds

## uses
- Modelling following, linking and dependency relations
- Modelling roads and mutual friendships
- Choosing between topological sorting and spanning trees
- Converting between directed and undirected forms

## mistakes
- Treating a directed relation as undirected and losing its meaning
- Assuming reachability is symmetric in a directed graph
- Counting an undirected edge once in a directed adjacency list
- Forgetting that in-degree and out-degree differ for most vertices

## interview
**Q:** What is the difference between weakly and strongly connected directed graphs?
**A:** A graph is weakly connected if it is connected when edge directions are ignored, and strongly connected if every vertex can reach every other vertex by following directed edges.

**Q:** How do you represent an undirected graph with a directed adjacency list?
**A:** Add both directions for every edge, so an edge between u and v puts v in the list of u and u in the list of v.

**Q:** How are the in-degrees and out-degrees of a directed graph related?
**A:** The sum of all in-degrees equals the sum of all out-degrees, and both equal the number of edges, since every edge has exactly one source and one target.

## summary
Undirected edges are mutual and stored in both lists, while directed edges have a source and a target, which makes reachability asymmetric and introduces in-degree, out-degree, strong connectivity and DAGs. Pick the model that matches the meaning of the relation.

## codenote
The Python sample computes degrees and the transpose. The JavaScript sample converts edges to arcs.

## code
### python
```python
arcs = [("A", "B"), ("B", "C"), ("C", "B"), ("A", "D")]
vertices = sorted({v for arc in arcs for v in arc})
out_degree = {v: sum(1 for u, _ in arcs if u == v) for v in vertices}
in_degree = {v: sum(1 for _, w in arcs if w == v) for v in vertices}
print(out_degree)
print(in_degree, sum(out_degree.values()) == sum(in_degree.values()) == len(arcs))

def reachable(start):
    seen, stack = set(), [start]
    while stack:
        node = stack.pop()
        if node not in seen:
            seen.add(node)
            stack.extend(w for u, w in arcs if u == node)
    return sorted(seen)

print(reachable("A"), reachable("C"))
print([(w, u) for u, w in arcs])
```
Output:
```text
{'A': 2, 'B': 1, 'C': 1, 'D': 0}
{'A': 0, 'B': 2, 'C': 1, 'D': 1} True
['A', 'B', 'C', 'D'] ['B', 'C']
[('B', 'A'), ('C', 'B'), ('B', 'C'), ('D', 'A')]
```
### javascript
```javascript
const undirected = [[0, 1], [1, 2], [2, 0]];
const arcs = undirected.flatMap(([u, v]) => [[u, v], [v, u]]);
console.log(undirected.length, arcs.length, arcs.map(([u, v]) => u + ">" + v).join(" "));
```
Output:
```text
3 6 0>1 1>0 1>2 2>1 2>0 0>2
```

## quiz
1. What is true of an undirected edge?
   - [ ] It has a source and a target
   - [x] It connects two vertices in both directions
   - [ ] It carries a weight always
   - [ ] It forms a cycle
   > The relation is symmetric.
2. How does the sum of in-degrees compare with the sum of out-degrees in a directed graph?
   - [ ] The in-degrees are larger
   - [x] They are equal, and both equal the number of edges
   - [ ] They are twice the number of edges
   - [ ] They are unrelated
   > Each edge contributes one to each sum.
3. What is the transpose of a directed graph?
   - [ ] The graph with weights negated
   - [x] The graph with every edge reversed
   - [ ] The graph without cycles
   - [ ] The graph of strongly connected components
   > It lets you read the incoming edges of vertices easily.
4. What does weakly connected mean?
   - [ ] Each vertex has degree one
   - [x] The graph is connected when directions are ignored
   - [ ] Every vertex reaches every other
   - [ ] The graph has no cycles
   > Strong connectivity needs directed paths.

# Weighted Graphs
kind: concept
time: Not an algorithmic topic — weights change which algorithms are needed. Unweighted shortest paths cost O(V + E) with breadth first search, while weighted shortest paths need Dijkstra's algorithm in O((V + E) log V) or Bellman-Ford in O(V E).
space: Not an algorithmic topic — each stored edge carries one extra number, so adjacency lists hold pairs of (neighbour, weight) and matrices hold weights instead of booleans.

## intro
In a weighted graph every edge carries a number: a distance, a cost, a time, a capacity or a probability. The numbers turn a question of whether two places are connected into questions about how far, how cheap or how reliable the connection is, and they decide which algorithms apply.

## theory
Definition: a weighted graph assigns a weight `w(u, v)` to each edge. The weight of a path is the sum of the weights of its edges; the length of a path in the weighted sense is often called its cost or distance.

What weights can mean:

- Distance or travel time on a road network
- Cost of a flight, a cable, a pipe or a transaction
- Capacity of a link (maximum flow problems)
- Similarity or probability (maximise a product, or minimise the sum of negative logarithms)
- Penalties, such as the cost of a transition between states

Properties that change algorithm choice:

- Non-negative weights: Dijkstra's algorithm works, and greedy ideas hold
- Negative weights: Dijkstra's algorithm can fail; use Bellman-Ford; a negative cycle (a cycle with total negative weight) makes shortest paths undefined because you can loop forever and decrease the cost
- Equal weights: the graph is effectively unweighted, and breadth first search finds shortest paths
- Zero weights: possible and fine, and 0-1 breadth first search handles weights of 0 and 1 with a deque
- Integer versus real weights: floating point comparisons need care; integer weights allow bucket tricks
- Weight on vertices rather than edges: convert by splitting a vertex into an entry and an exit vertex joined by an edge of that weight, or add the vertex weight when entering it

Shortest path versus minimum spanning tree: both use weights but answer different questions. A shortest path from s to t minimises the total weight along one path. A minimum spanning tree connects all vertices with the smallest total weight of edges, regardless of any particular pair's path. The MST is not necessarily a shortest path tree.

Example. Take edges A-B 4, A-C 2, B-C 1, B-D 5, C-D 8 and D-E 3. Paths from A to D: A-B-D costs 9, A-C-D costs 10, A-C-B-D costs 8 and A-B-C-D costs 13. The cheapest has cost 8 and uses three edges, while the path with the fewest edges (A-B-D, A-C-D, both two edges) is more expensive. Counting edges and adding weights can therefore give different answers, which is why breadth first search does not solve weighted problems.

Total weight and degree: the sum of all edge weights is a basic measure of a network; the weighted degree of a vertex is the sum of the weights of its edges.

Representation:

- Adjacency list of pairs: `graph[u] = [(v, w), ...]`
- Adjacency matrix with weights and a special value (infinity or zero) for missing edges, taking care that zero is a valid weight in some problems
- Edge list of triples `(u, v, w)`, convenient for sorting (Kruskal's algorithm) and for Bellman-Ford

Algorithms that rely on weights: Dijkstra's algorithm, Bellman-Ford, Floyd-Warshall, A* search, Prim's and Kruskal's minimum spanning tree algorithms, maximum flow and minimum cost flow, the travelling salesman problem and the Chinese postman problem.

Design hints: choose the weight to be the quantity you want to minimise; combine several criteria into one number only when there is a meaningful exchange rate; watch the sign and the unit; and remember that real networks often have time varying weights.

## explain
1. Decide what the weight of an edge means and in which unit.
2. Store each edge with its weight in the chosen representation.
3. Define the cost of a path as the sum of its edge weights.
4. Check for negative weights, because they rule out some algorithms.
5. Distinguish shortest path questions from spanning tree questions.
6. Choose the algorithm that matches the weight properties.

## example
The Python program enumerates all simple paths from A to D in the sample weighted graph, prints their costs 8, 9, 10 and 13 and shows that the cheapest path is not the one with the fewest edges. The JavaScript program sorts the edge list by weight and computes the total weight and the weighted degree of each vertex.

## real
Navigation systems weight roads by travel time, airlines weight flights by price, networks weight links by latency and logistics planners weight routes by cost.

## pros
- Weights model real costs and distances
- One structure supports many optimisation problems
- Standard algorithms exist for each kind of weight

## cons
- Negative weights and cycles complicate shortest paths
- Floating point weights need careful comparison
- Choosing a single number for several criteria can hide trade-offs

## uses
- Shortest path and route planning
- Planning the cheapest set of links between sites
- Flow and capacity problems
- Modelling transition costs between states

## mistakes
- Using breadth first search when edge weights differ
- Running Dijkstra's algorithm on a graph with negative edges
- Treating a missing edge as weight zero in an adjacency matrix
- Mixing up the shortest path tree with the minimum spanning tree

## interview
**Q:** Why does breadth first search not find shortest paths in weighted graphs?
**A:** It minimises the number of edges, not their total weight, so a path with more edges but smaller weights can be cheaper.

**Q:** What is a negative cycle and why is it a problem?
**A:** A cycle whose edge weights sum to a negative value; going around it repeatedly lowers the path cost without bound, so shortest paths are undefined.

**Q:** How do you store weighted edges in an adjacency list?
**A:** As pairs of neighbour and weight in each vertex's list, such as graph[u] = [(v, w), ...].

## summary
Weighted graphs attach costs to edges, so path cost is a sum of weights and the cheapest path need not have the fewest edges. Negative weights, negative cycles and the shortest path versus spanning tree distinction decide which algorithm to use.

## codenote
The Python sample enumerates path costs. The JavaScript sample sorts edges and sums weights.

## code
### python
```python
graph = {
    "A": [("B", 4), ("C", 2)],
    "B": [("A", 4), ("C", 1), ("D", 5)],
    "C": [("A", 2), ("B", 1), ("D", 8)],
    "D": [("B", 5), ("C", 8), ("E", 3)],
    "E": [("D", 3)],
}

def simple_paths(node, target, path, cost, found):
    if node == target:
        found.append((cost, path))
        return
    for neighbour, weight in graph[node]:
        if neighbour not in path:
            simple_paths(neighbour, target, path + [neighbour], cost + weight, found)

found = []
simple_paths("A", "D", ["A"], 0, found)
for cost, path in sorted(found):
    print(cost, "-".join(path), len(path) - 1, "edges")
```
Output:
```text
8 A-C-B-D 3 edges
9 A-B-D 2 edges
10 A-C-D 2 edges
13 A-B-C-D 3 edges
```
### javascript
```javascript
const edges = [["A", "B", 4], ["A", "C", 2], ["B", "C", 1], ["B", "D", 5], ["C", "D", 8], ["D", "E", 3]];
const sorted = [...edges].sort((a, b) => a[2] - b[2]);
const total = edges.reduce((sum, [, , w]) => sum + w, 0);
const weighted = {};
for (const [u, v, w] of edges) {
  weighted[u] = (weighted[u] ?? 0) + w;
  weighted[v] = (weighted[v] ?? 0) + w;
}
console.log(sorted.map((e) => e.join("")).join(" "), total);
console.log(JSON.stringify(weighted));
```
Output:
```text
BC1 AC2 DE3 AB4 BD5 CD8 23
{"A":6,"B":10,"C":11,"D":16,"E":3}
```

## quiz
1. How is the cost of a path defined in a weighted graph?
   - [ ] The number of its edges
   - [x] The sum of the weights of its edges
   - [ ] The largest weight on it
   - [ ] The number of its vertices
   > Different paths between the same vertices can have different costs.
2. Why can the path with the fewest edges be more expensive?
   - [ ] It cannot be
   - [x] Its edges may have larger weights than a longer path's edges
   - [ ] Because it has a cycle
   - [ ] Because it is undirected
   > Weights, not edge counts, decide the cost.
3. What breaks shortest paths in a graph with a negative cycle?
   - [ ] Nothing
   - [x] The cost can be lowered forever by looping, so no shortest path exists
   - [ ] The graph becomes undirected
   - [ ] The weights become zero
   > Algorithms such as Bellman-Ford detect the cycle.
4. What does a minimum spanning tree minimise?
   - [ ] The distance between two chosen vertices
   - [x] The total weight of edges that connect all vertices
   - [ ] The number of vertices
   - [ ] The longest edge only
   > It differs from a single pair shortest path.

# Adjacency List Representation
kind: algorithm
time: O(1) to add an edge, O(degree of u) to test whether an edge exists or to remove one, and O(V + E) to scan the whole graph; listing the neighbours of a vertex takes time proportional to its degree.
space: O(V + E) for the vertex array and the edge entries, with each undirected edge stored twice.

## intro
An adjacency list stores, for every vertex, the list of its neighbours. It is the standard representation for sparse graphs, since it uses memory proportional to the number of vertices plus the number of edges and lets you walk the neighbours of a vertex without looking at the non-neighbours. Most graph algorithms are written for it.

## theory
Structure: an array (or dictionary) indexed by vertex, where each entry is a list of the vertices adjacent to it. For weighted graphs each list entry is a pair `(neighbour, weight)`. For directed graphs the list of u holds the targets of the edges leaving u.

Building from an edge list: for each edge `(u, v)` append v to `adj[u]` and, for undirected graphs, also u to `adj[v]`. Building takes O(V + E).

Operations and costs:

- Add edge: append to a list, O(1) (check for duplicates first if the graph must stay simple, costing O(degree))
- Remove edge: find it in the list, O(degree), then delete; with sets instead of lists removal is O(1) on average
- Edge test `has_edge(u, v)`: scan u's list, O(degree), or O(1) average with sets
- Neighbours of u: iterate over `adj[u]`, O(degree)
- Degree of u: the length of its list, O(1)
- Iterate over all edges: O(V + E)
- Add a vertex: append an empty list, O(1)
- Remove a vertex: delete its list and remove it from the other lists, O(V + E) in the worst case

Memory: with V vertices and E edges, an undirected graph stores 2E entries and a directed graph E entries, plus V list headers; for a road network with 1 million vertices and 3 million edges that is about 7 million entries, compared with a matrix of 10^12 cells. On a dense graph (E close to V squared) the list uses more memory than a matrix because of per-entry overhead.

Example: the undirected edges A-B, A-C, B-C and C-D give `A: [B, C]`, `B: [A, C]`, `C: [A, B, D]` and `D: [C]`. The degree of C is 3, the total number of list entries is 8 (twice the number of edges) and the neighbours of C are A, B and D.

Choice of container for neighbour collections:

- List (dynamic array): compact, fast iteration, slow edge test and removal
- Set or hash set: fast membership and removal, a larger memory overhead, no ordering
- Sorted list or tree set: ordered neighbours (useful for lexicographic traversal) with O(log degree) tests
- Linked list: cheap insertion and removal when the node is known, slow search; used in C implementations
- Compressed sparse row (CSR): two arrays (offsets and targets) for static graphs; excellent cache behaviour and memory use, used in graph libraries and large scale systems

For vertices that are not integers, use a dictionary from vertex to list, or map names to numbers first.

Parallel edges and self loops: lists allow both by default; decide whether to allow them and check on insertion. A self loop in an undirected graph adds the vertex to its own list once or twice depending on the convention for degree counting.

Compared with an adjacency matrix: lists win on memory and iteration for sparse graphs and on traversals (O(V + E) versus O(V squared)); matrices win on constant time edge tests and on dense graphs.

Common bugs: forgetting to add the reverse direction for undirected edges, sharing one list object across vertices through `[[]] * n` in Python, indexing with out-of-range vertex ids, and removing from a list while iterating over it.

Testing: build from an edge list and compare degrees with a count from the list; check that the total length of the lists is 2E (undirected) or E (directed).

## explain
1. Create an empty list of neighbours for every vertex.
2. For each edge, append the target to the source's list.
3. For undirected edges also append the source to the target's list.
4. Read the neighbours of a vertex by iterating over its list.
5. Test for an edge by scanning the list, or by using sets for faster tests.
6. Check that the total number of entries equals 2E or E.

## example
The Python program builds the adjacency list for the four edges above, prints each vertex with its neighbours, the degrees, the total number of entries (8) and tests a few edges, and shows the shared list bug with `[[]] * 3`. The JavaScript program implements add and remove edge operations on sets and prints the lists after each change.

## real
Road network engines, social network stores and web crawlers hold their graphs as adjacency lists or compressed forms of them because real graphs are sparse.

## pros
- Memory proportional to V plus E
- Fast traversal of neighbours
- Natural for sparse graphs and weighted edges

## cons
- Edge tests cost O(degree) with plain lists
- Removing a vertex touches many lists
- Poor for very dense graphs

## uses
- Breadth first and depth first search
- Dijkstra's algorithm and other shortest path code
- Storing large sparse graphs
- Building graphs from edge lists

## mistakes
- Forgetting the reverse direction for undirected edges
- Creating the lists with a repeated reference like [[]] * n in Python
- Removing items from a list while iterating over it
- Using a list for neighbour membership tests on high degree vertices

## interview
**Q:** What are the space and traversal costs of an adjacency list?
**A:** O(V + E) space, and a full traversal of the graph costs O(V + E) because every list is scanned once.

**Q:** When is an adjacency list better than an adjacency matrix?
**A:** For sparse graphs, where it uses far less memory and iterating over neighbours is faster; the matrix is better when edge tests must be O(1) or the graph is dense.

**Q:** How can edge existence tests be made fast with adjacency lists?
**A:** Store the neighbours in a hash set instead of a list, which gives O(1) average membership tests at the cost of more memory.

## summary
An adjacency list stores the neighbours of each vertex, using O(V + E) memory and giving fast neighbour iteration, which suits sparse graphs and most traversal algorithms. Use sets for fast edge tests and add both directions for undirected edges.

## codenote
The Python sample builds and inspects a list representation. The JavaScript sample adds and removes edges with sets.

## code
### python
```python
edges = [("A", "B"), ("A", "C"), ("B", "C"), ("C", "D")]
adjacency = {}
for u, v in edges:
    adjacency.setdefault(u, []).append(v)
    adjacency.setdefault(v, []).append(u)

for vertex in sorted(adjacency):
    print(vertex, adjacency[vertex], len(adjacency[vertex]))
print(sum(len(neighbours) for neighbours in adjacency.values()), "C" in adjacency["A"], "D" in adjacency["A"])

shared = [[]] * 3
shared[0].append(1)
separate = [[] for _ in range(3)]
separate[0].append(1)
print(shared, separate)
```
Output:
```text
A ['B', 'C'] 2
B ['A', 'C'] 2
C ['A', 'B', 'D'] 3
D ['C'] 1
8 True False
[[1], [1], [1]] [[1], [], []]
```
### javascript
```javascript
class Graph {
  constructor() {
    this.adjacency = new Map();
  }

  addEdge(u, v) {
    for (const [a, b] of [[u, v], [v, u]]) {
      if (!this.adjacency.has(a)) this.adjacency.set(a, new Set());
      this.adjacency.get(a).add(b);
    }
  }

  removeEdge(u, v) {
    this.adjacency.get(u)?.delete(v);
    this.adjacency.get(v)?.delete(u);
  }

  describe() {
    return [...this.adjacency].map(([v, set]) => v + ":" + [...set].join("")).join(" ");
  }
}

const graph = new Graph();
[["A", "B"], ["A", "C"], ["B", "C"], ["C", "D"]].forEach(([u, v]) => graph.addEdge(u, v));
console.log(graph.describe());
graph.removeEdge("B", "C");
console.log(graph.describe());
```
Output:
```text
A:BC B:AC C:ABD D:C
A:BC B:A C:AD D:C
```

## quiz
1. How much memory does an adjacency list need?
   - [ ] O(V squared)
   - [x] O(V + E)
   - [ ] O(E squared)
   - [ ] O(V log E)
   > One list header per vertex and one entry per edge direction.
2. How many entries does an undirected graph with E edges store?
   - [ ] E
   - [x] 2E
   - [ ] E squared
   - [ ] V
   > Each edge appears in both endpoints' lists.
3. What is the cost of listing the neighbours of vertex u?
   - [ ] O(V)
   - [x] O(degree of u)
   - [ ] O(E)
   - [ ] O(1)
   > Only the entries in its list are visited.
4. Which bug does [[]] * n cause in Python?
   - [ ] A syntax error
   - [x] All vertices share one list object
   - [ ] The list becomes immutable
   - [ ] The graph becomes directed
   > Changes to one list appear in all of them.

# Adjacency Matrix Representation
kind: algorithm
time: O(1) to add, remove or test an edge, O(V) to list the neighbours or compute the degree of a vertex, and O(V squared) to scan every possible edge.
space: O(V squared) for a V by V matrix regardless of how many edges exist.

## intro
An adjacency matrix stores a graph as a square table: the cell in row u and column v tells whether there is an edge from u to v, or its weight. It spends memory on every pair of vertices, which is wasteful for sparse graphs, but it makes edge tests constant time, suits dense graphs and turns graph questions into matrix operations.

## theory
Structure: a V by V matrix `M`. For an unweighted graph `M[u][v] = 1` if the edge exists and 0 otherwise. For a weighted graph store the weight, with a sentinel such as infinity (or None) for no edge, since zero can be a valid weight. For an undirected graph the matrix is symmetric (`M[u][v] == M[v][u]`), so only half is needed in principle; for a directed graph it is generally asymmetric. The diagonal holds self loops (usually 0 for none).

Operations and costs:

- Add or remove an edge: set the cell (and its mirror for undirected graphs), O(1)
- Edge test `has_edge(u, v)`: read the cell, O(1)
- Neighbours of u: scan row u, O(V)
- Degree of u: sum row u (out-degree) or column u (in-degree), O(V)
- Add a vertex: needs a new row and column, O(V squared) to copy into a bigger matrix unless space is preallocated
- Memory: V squared cells; with 8 byte integers, 10,000 vertices already need 800 MB, while 1 bit per cell (a bit matrix) needs about 12 MB

Example: for the undirected edges A-B, A-C, B-C and C-D with the vertex order A, B, C, D the matrix is `[[0, 1, 1, 0], [1, 0, 1, 0], [1, 1, 0, 1], [0, 0, 1, 0]]`. The row sums are the degrees 2, 2, 3, 1, and the sum of all cells is 8, twice the number of edges.

Matrix powers count paths: the entry `(M^k)[u][v]` of the k-th power of an unweighted adjacency matrix equals the number of walks of length k from u to v. Squaring the matrix above gives `(M^2)[A][A] = 2` (the walks A-B-A and A-C-A) and `(M^2)[A][D] = 1` (A-C-D). The diagonal of M cubed counts closed walks and its trace divided by 6 counts triangles in a simple graph (the example graph has 1 triangle, A-B-C).

Weighted matrices and shortest paths: the Floyd-Warshall algorithm works directly on the weight matrix, updating `M[i][j]` with `M[i][k] + M[k][j]` in O(V cubed) time; a min-plus matrix product also describes paths.

When to choose a matrix:

- Dense graphs (E close to V squared): memory is no worse than lists and operations are simpler
- Many edge existence queries: O(1) tests
- Small V (a few thousand at most), as in the travelling salesman problem with up to about 20 cities or all pairs shortest paths
- Algorithms phrased in terms of matrix operations (spectral methods, transitive closure with boolean products)
- Bitset tricks: store each row as an integer or bitset and compute neighbour intersections with bitwise operations, which speeds up clique and triangle problems

When not to: large sparse graphs (road networks, web graphs), where V squared cells cannot be allocated or traversing rows wastes time (a breadth first search over a matrix costs O(V squared), against O(V + E) for lists).

Implementation notes: initialise with `[[0] * n for _ in range(n)]`, never `[[0] * n] * n` in Python (shared rows); use infinity for missing weights; mirror updates for undirected graphs; keep vertex-to-index mappings for named vertices.

Compared with an adjacency list: the matrix has O(1) edge tests and O(V) neighbour scans, the list has O(degree) neighbour scans and O(degree) edge tests, and lists use O(V + E) memory.

## explain
1. Create a V by V table initialised with zeros or infinity.
2. For each edge set the cell for (u, v), and also (v, u) when the graph is undirected.
3. Test an edge by reading one cell.
4. List the neighbours of a vertex by scanning its row.
5. Compute degrees by summing rows (and columns for directed graphs).
6. Use matrix powers to count walks and triangles in small graphs.

## example
The Python program builds the matrix for the sample graph, prints the degrees, the number of edges, the square of the matrix with the walk counts above and the number of triangles from the trace of the cube. The JavaScript program builds a weighted matrix with infinity for missing edges and prints a few lookups.

## real
Small dense networks, game boards with all pairs relationships and algorithms such as Floyd-Warshall use matrices, and image segmentation and spectral clustering use matrices derived from graphs.

## pros
- Constant time edge insertion, removal and lookup
- A plain table that is easy to inspect and debug
- Matrix operations count paths and triangles

## cons
- Uses O(V squared) memory even for sparse graphs
- Neighbour iteration costs O(V)
- Growing the vertex set means allocating a larger table

## uses
- Dense graphs and small graphs
- Frequent edge existence checks
- All pairs shortest paths with Floyd-Warshall
- Counting walks and triangles

## mistakes
- Creating rows with [[0] * n] * n in Python so all rows are one list
- Forgetting to mirror the update for an undirected edge
- Using zero to mean no edge when zero is a valid weight
- Choosing a matrix for a large sparse graph and running out of memory

## interview
**Q:** What are the trade-offs between an adjacency matrix and an adjacency list?
**A:** The matrix gives O(1) edge tests but O(V squared) memory and O(V) neighbour scans, while the list uses O(V + E) memory and scans neighbours in O(degree) but tests edges in O(degree).

**Q:** What does the k-th power of the adjacency matrix tell you?
**A:** Its (u, v) entry is the number of walks of length k from u to v in an unweighted graph.

**Q:** How do you represent missing edges in a weighted adjacency matrix?
**A:** With a sentinel such as infinity or None, because zero can be a legitimate edge weight.

## summary
An adjacency matrix is a V by V table with O(1) edge tests and O(V squared) memory, suited to dense or small graphs and to matrix based methods such as walk counting and Floyd-Warshall. Use sentinels for weights and avoid shared row bugs.

## codenote
The Python sample builds the matrix and counts walks. The JavaScript sample builds a weighted matrix.

## code
### python
```python
vertices = "ABCD"
index = {v: i for i, v in enumerate(vertices)}
matrix = [[0] * 4 for _ in range(4)]
for u, v in [("A", "B"), ("A", "C"), ("B", "C"), ("C", "D")]:
    matrix[index[u]][index[v]] = matrix[index[v]][index[u]] = 1

def multiply(a, b):
    n = len(a)
    return [[sum(a[i][k] * b[k][j] for k in range(n)) for j in range(n)] for i in range(n)]

square = multiply(matrix, matrix)
cube = multiply(square, matrix)
print(matrix)
print([sum(row) for row in matrix], sum(map(sum, matrix)) // 2)
print(square[0][0], square[0][3], sum(cube[i][i] for i in range(4)) // 6)
```
Output:
```text
[[0, 1, 1, 0], [1, 0, 1, 0], [1, 1, 0, 1], [0, 0, 1, 0]]
[2, 2, 3, 1] 4
2 1 1
```
### javascript
```javascript
const INF = Infinity;
const n = 4;
const weights = Array.from({ length: n }, () => new Array(n).fill(INF));
for (let i = 0; i < n; i++) weights[i][i] = 0;
for (const [u, v, w] of [[0, 1, 4], [0, 2, 2], [1, 2, 1], [2, 3, 8]]) {
  weights[u][v] = w;
  weights[v][u] = w;
}
console.log(weights[0][2], weights[0][3], weights[3][3], weights[1][2] !== INF);
console.log(weights.map((row) => row.map((w) => (w === INF ? "-" : w)).join(" ")).join(" | "));
```
Output:
```text
2 Infinity 0 true
0 4 2 - | 4 0 1 - | 2 1 0 8 | - - 8 0
```

## quiz
1. How much memory does an adjacency matrix use for V vertices?
   - [ ] O(V)
   - [x] O(V squared)
   - [ ] O(E)
   - [ ] O(V + E)
   > One cell for each ordered pair of vertices.
2. What is the cost of testing whether an edge exists?
   - [ ] O(V)
   - [x] O(1)
   - [ ] O(E)
   - [ ] O(log V)
   > Read the cell for the pair.
3. What does the entry (u, v) of the square of the adjacency matrix count?
   - [ ] Edges between u and v
   - [x] Walks of length 2 from u to v
   - [ ] Cycles through u
   - [ ] The shortest distance
   > Matrix multiplication sums over intermediate vertices.
4. Why use infinity for missing edges in a weighted matrix?
   - [ ] To save memory
   - [x] Zero may be a valid weight and must not mean no edge
   - [ ] Because infinity is faster
   - [ ] To make the graph directed
   > A sentinel distinguishes no edge from an edge of weight zero.

# Degree and Handshaking Lemma
kind: concept
time: Not an algorithmic topic — the lemma is a counting fact. Computing all degrees from an edge list costs O(V + E), and checking the handshaking identity is a single pass.
space: Not an algorithmic topic — the degrees need one counter per vertex, O(V) extra space.

## intro
The degree of a vertex counts how many edges touch it. The handshaking lemma says that the degrees in any undirected graph add up to exactly twice the number of edges, so the number of vertices with odd degree is always even. This simple fact checks graph code, rules out impossible graphs and underlies results such as Euler paths.

## theory
Definitions: in an undirected graph, `deg(v)` is the number of edges incident to v (a self loop counts twice). In a directed graph, `indeg(v)` counts edges entering v and `outdeg(v)` counts edges leaving it.

Handshaking lemma (undirected): the sum of the degrees of all vertices equals 2E. Reason: each edge has two endpoints, and so adds exactly 1 to the degree of each of them, 2 in total. Equivalent to counting handshakes: if every person counts the hands they shook, the total is twice the number of handshakes.

Corollary: the number of vertices with odd degree is even. Because the total 2E is even, and the sum of the even degrees is even, the sum of the odd degrees must be even, which is possible only if there is an even number of odd terms. No party can have exactly one guest who shook an odd number of hands.

Directed version: the sum of all in-degrees equals the sum of all out-degrees, and both equal E, because every edge has exactly one tail and one head.

Examples:

- A graph with degrees 3, 3, 2, 2, 2 is possible: the sum is 12, so E = 6, and there are two odd vertices (an even number)
- Degrees 3, 2, 2, 2 are impossible: the sum 9 is odd
- Degrees 3, 3, 3 are impossible: three odd vertices, and the sum 9 is odd
- A regular graph where every vertex has degree k with V vertices has `V · k / 2` edges, so V · k must be even: a 3-regular graph needs an even number of vertices (the complete graph K4 works, with 6 edges, but no 3-regular graph on 5 vertices exists)

Uses and consequences:

- Sanity checks: verify that the degree array computed from an adjacency list sums to 2E; a mismatch exposes a missing reverse edge
- Euler paths and circuits: an undirected connected graph has an Euler circuit (a closed walk using each edge exactly once) if every vertex has even degree, and an Euler path if exactly two vertices have odd degree (the path starts and ends at them). The Königsberg bridges problem had four odd vertices, so no such walk exists. For directed graphs the condition is in-degree equal to out-degree at every vertex for a circuit.
- Degree sequences: a list of numbers is graphical (realisable by a simple graph) only if it satisfies conditions such as the Erdős-Gallai theorem; the Havel-Hakimi algorithm tests it by repeatedly removing the largest degree d and subtracting 1 from the next d largest
- Leaves in trees: every tree with at least two vertices has at least two leaves (degree one vertices); the sum of degrees is 2(V − 1)
- Averages: the average degree is 2E / V, a quick measure of how dense the graph is; social networks often have a few high degree hubs and many low degree vertices (heavy tailed distributions)
- Pigeonhole arguments: in any simple graph with at least two vertices, two vertices have the same degree

Computing degrees: from an edge list, increment a counter for both endpoints (undirected) or the out counter of the source and the in counter of the target (directed). From an adjacency list, take the list lengths. From a matrix, sum rows and columns.

Pitfalls: counting self loops once instead of twice, forgetting the reverse entry for undirected edges when degrees come from lists and miscounting multigraph edges.

Testing: generate random graphs, compute the degrees, check the sum equals twice the number of edges and that the count of odd vertices is even; check the Euler conditions on known examples.

## explain
1. Count how many edges touch each vertex to get the degrees.
2. Add up all the degrees and compare the total with twice the number of edges.
3. Count the vertices with odd degree and check that the count is even.
4. For directed graphs compare the total in-degree and the total out-degree with the number of edges.
5. Use the parity of degrees to decide whether an Euler path or circuit can exist.
6. Reject degree lists whose sum is odd.

## example
The Python program verifies the lemma on 200 seeded random graphs and prints `True`, rejects the degree lists 3, 2, 2, 2 and 3, 3, 3 and computes the Euler classification of two small graphs, a square (circuit possible) and a path of three edges (Euler path from one end to the other). The JavaScript program counts odd degree vertices for the Königsberg bridge multigraph and prints 4 with the answer that no Euler walk exists.

## real
Network engineers check link counts with degree sums, route inspectors reason about Euler paths for snow ploughing or mail delivery, and graph libraries validate input with degree checks.

## pros
- A one line identity that catches many bugs
- Explains when Euler walks exist
- Gives quick feasibility checks for degree lists

## cons
- Says nothing about connectivity by itself
- Euler conditions also require connectivity
- Multigraph and self loop conventions vary

## uses
- Validating graph representations
- Deciding Euler circuit and Euler path existence
- Checking whether a degree sequence can be a graph
- Estimating average degree and density

## mistakes
- Counting a self loop as one instead of two
- Forgetting that Euler conditions also require the graph to be connected
- Computing degrees from a directed list and applying the undirected lemma
- Assuming that an even sum of degrees guarantees that a graph exists

## interview
**Q:** What does the handshaking lemma say?
**A:** In an undirected graph the sum of all vertex degrees equals twice the number of edges, because every edge contributes to the degree of exactly two endpoints.

**Q:** Why is the number of odd degree vertices always even?
**A:** The total of all degrees is even (2E) and even degrees add up to an even number, so the odd degrees must also add up to an even number, which needs an even count of them.

**Q:** When does a connected undirected graph have an Euler circuit?
**A:** When every vertex has even degree; an Euler path exists when exactly two vertices have odd degree.

## summary
The sum of degrees equals twice the number of edges, so the number of odd degree vertices is even, and the parities decide whether Euler circuits and paths exist. Use the identity as a quick check on representations and degree sequences.

## codenote
The Python sample checks the lemma and Euler conditions. The JavaScript sample counts odd vertices of the Königsberg multigraph.

## code
### python
```python
import random

def degrees(vertex_count, edges):
    deg = [0] * vertex_count
    for u, v in edges:
        deg[u] += 1
        deg[v] += 1
    return deg

rng = random.Random(10)
ok = True
for _ in range(200):
    n = rng.randint(1, 9)
    edges = [(rng.randrange(n), rng.randrange(n)) for _ in range(rng.randint(0, 20))]
    deg = degrees(n, edges)
    ok = ok and sum(deg) == 2 * len(edges) and sum(1 for d in deg if d % 2) % 2 == 0
print(ok)

def possible(sequence):
    return sum(sequence) % 2 == 0

print(possible([3, 2, 2, 2]), possible([3, 3, 3]), possible([3, 3, 2, 2, 2]))

def euler(vertex_count, edges):
    odd = sum(1 for d in degrees(vertex_count, edges) if d % 2)
    return "circuit" if odd == 0 else "path" if odd == 2 else "none"

print(euler(4, [(0, 1), (1, 2), (2, 3), (3, 0)]), euler(4, [(0, 1), (1, 2), (2, 3)]))
```
Output:
```text
True
False False True
circuit path
```
### javascript
```javascript
const bridges = [["A", "B"], ["A", "B"], ["A", "C"], ["A", "C"], ["A", "D"], ["B", "D"], ["C", "D"]];
const degree = {};
for (const [u, v] of bridges) {
  degree[u] = (degree[u] ?? 0) + 1;
  degree[v] = (degree[v] ?? 0) + 1;
}
const odd = Object.values(degree).filter((d) => d % 2).length;
console.log(JSON.stringify(degree), odd, odd === 0 || odd === 2 ? "walk exists" : "no Euler walk");
```
Output:
```text
{"A":5,"B":3,"C":3,"D":3} 4 no Euler walk
```

## quiz
1. What is the sum of the degrees in an undirected graph with E edges?
   - [ ] E
   - [x] 2E
   - [ ] E squared
   - [ ] V
   > Each edge adds to two vertices.
2. What can be said about the number of vertices with odd degree?
   - [ ] It is odd
   - [x] It is even
   - [ ] It equals the number of edges
   - [ ] It can be anything
   > The odd degrees must add up to an even sum.
3. When does a connected undirected graph have an Euler circuit?
   - [ ] When it has a cycle
   - [x] When every vertex has even degree
   - [ ] When it is a tree
   - [ ] When it has two odd vertices
   > Each visit enters and leaves a vertex using two edges.
4. Why is the degree list 3, 3, 3 impossible for a graph?
   - [ ] It has too few vertices
   - [x] The sum of degrees is odd
   - [ ] All degrees are equal
   - [ ] It has a vertex of degree 3
   > The sum must be twice the number of edges.
