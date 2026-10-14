# Single Source Shortest Path
kind: concept
time: Not an algorithmic topic — this lesson frames the problem. The algorithms that solve it range from O(V + E) (unweighted or acyclic graphs) through O((V + E) log V) (Dijkstra) to O(V · E) (Bellman-Ford), depending on the weights.
space: Not an algorithmic topic — every single source algorithm keeps a distance and a predecessor entry per vertex, O(V) beyond the graph itself.

## intro
The single source shortest path problem asks for the cheapest route from one starting vertex to every other vertex of a weighted graph. Route planning, network latency, currency conversion and game movement are all instances. Which algorithm to use depends on one question: what kinds of edge weights can occur.

## theory
Problem statement: given a graph with edge weights `w(u, v)` and a source s, compute `dist[v]`, the minimum total weight over all paths from s to v, for every vertex v (infinity if v is unreachable), and usually a predecessor `pred[v]` that lets you rebuild the path.

Key facts:

- Optimal substructure: any subpath of a shortest path is itself a shortest path, which is why one table of distances is enough
- Triangle inequality: for every edge (u, v), `dist[v] <= dist[u] + w(u, v)`; a shortest path tree exists where every tree edge makes this an equality
- Shortest paths are simple (no repeated vertex) when no cycle has negative total weight; with a negative cycle reachable from s, distances can decrease without bound and are undefined

Relaxation, the one operation behind every algorithm: for an edge (u, v), if `dist[u] + w(u, v) < dist[v]` then set `dist[v] = dist[u] + w(u, v)` and `pred[v] = u`. The algorithms differ only in the order in which they relax edges. Start with `dist[s] = 0` and every other distance infinite.

Example: edges S→A 7, S→B 2, B→A 3, A→C 1, B→C 8, C→D 2 and B→D 10. Relaxing in the order S→A, S→B, B→A, A→C, C→D gives A = 7, B = 2, then A improves to 5 through B, C = 6, D = 8. The final distances are S 0, B 2, A 5, C 6 and D 8, with the shortest path to D being S → B → A → C → D.

Choosing the algorithm:

- All weights equal: breadth first search, O(V + E)
- Weights 0 and 1: 0-1 BFS with a deque, O(V + E)
- Non-negative weights: Dijkstra's algorithm, O((V + E) log V) with a binary heap
- Negative weights allowed, no negative cycle: Bellman-Ford, O(V E), or SPFA, which is faster on average
- Directed acyclic graph: relax edges in topological order, O(V + E), negative weights included
- Heuristic knowledge of the goal and a single target: A* search
- All pairs: Floyd-Warshall, O(V cubed), or Johnson's algorithm for sparse graphs
- Negative cycle possible: Bellman-Ford detects it

Related variants: single destination (reverse the edges), single pair (stop early or use bidirectional search), all pairs, k-th shortest path and shortest paths with constraints such as a limited number of edges.

Data structure notes: dist and pred arrays indexed by vertex, an adjacency list of (neighbour, weight) pairs, infinity as float infinity or a large integer chosen so that infinity plus a weight does not overflow.

Pitfalls: running Dijkstra's algorithm with negative edges, treating a missing edge as weight zero, adding to infinity (check reachability first) and forgetting that unreachable vertices keep an infinite distance.

## explain
1. Initialise the source distance to zero and all other distances to infinity.
2. Relax edges: whenever a path through u is cheaper for v, update dist and pred.
3. Choose the order of relaxation according to the kind of graph.
4. Stop when no distance can improve, or when the target is settled.
5. Read distances from the array and paths from the predecessors.
6. Check for unreachable vertices and for negative cycles when negative weights exist.

## example
The Python program applies the relaxation order above to the sample graph and prints the distances 0, 5, 2, 6, 8 for S, A, B, C, D together with the improvement of A from 7 to 5. The JavaScript function chooses an algorithm name for several graph descriptions.

## real
Navigation systems, network routers, logistics planners and games all compute single source shortest paths, choosing the algorithm by the properties of their weights.

## pros
- One framework covers many algorithms through relaxation
- Optimal substructure keeps the answer small
- Choice of algorithm follows clear rules

## cons
- Negative weights and cycles complicate the problem
- The wrong algorithm gives wrong answers silently
- Infinity handling causes subtle overflow bugs

## uses
- Route planning and navigation
- Network latency and routing tables
- Modelling costs between states
- Selecting among Dijkstra, Bellman-Ford and DAG methods

## mistakes
- Using Dijkstra's algorithm on a graph with negative edges
- Adding weights to infinity and overflowing
- Treating unreachable vertices as distance zero
- Forgetting to store predecessors when the path is needed

## interview
**Q:** What is relaxation in shortest path algorithms?
**A:** Updating the distance of v to dist[u] plus w(u, v) when that is smaller than the current distance of v, and recording u as its predecessor.

**Q:** How do you choose a single source shortest path algorithm?
**A:** By the weights: breadth first search for equal weights, Dijkstra for non-negative weights, Bellman-Ford when negative weights occur, and topological order relaxation for acyclic graphs.

**Q:** What happens if a negative cycle is reachable from the source?
**A:** Shortest distances to vertices on or beyond the cycle are undefined, because going around the cycle again lowers the cost without bound; Bellman-Ford detects the situation.

## summary
Single source shortest paths are computed by relaxing edges, and the order of relaxation defines the algorithm: BFS, Dijkstra, Bellman-Ford or topological order. Pick by the weight properties and watch for negative cycles and infinite distances.

## codenote
The Python sample traces relaxations. The JavaScript sample picks an algorithm by graph properties.

## code
### python
```python
INF = float("inf")
edges = [("S", "A", 7), ("S", "B", 2), ("B", "A", 3), ("A", "C", 1), ("B", "C", 8), ("C", "D", 2), ("B", "D", 10)]
dist = {v: INF for v in "SABCD"}
dist["S"] = 0
pred = {}

for u, v, w in [e for e in edges if e[:2] in (("S", "A"), ("S", "B"), ("B", "A"), ("A", "C"), ("C", "D"))]:
    if dist[u] + w < dist[v]:
        print("relax", u, v, dist[v], "->", dist[u] + w)
        dist[v] = dist[u] + w
        pred[v] = u

path, node = ["D"], "D"
while node in pred:
    node = pred[node]
    path.append(node)
print(dist, "-".join(reversed(path)))
```
Output:
```text
relax S A inf -> 7
relax S B inf -> 2
relax B A 7 -> 5
relax A C inf -> 6
relax C D inf -> 8
{'S': 0, 'A': 5, 'B': 2, 'C': 6, 'D': 8} S-B-A-C-D
```
### javascript
```javascript
function chooseAlgorithm({ weights, acyclic, negative, allPairs }) {
  if (allPairs) return "Floyd-Warshall";
  if (acyclic) return "topological order relaxation";
  if (negative) return "Bellman-Ford";
  if (weights === "equal") return "BFS";
  if (weights === "zero-one") return "0-1 BFS";
  return "Dijkstra";
}

console.log(chooseAlgorithm({ weights: "equal" }));
console.log(chooseAlgorithm({ weights: "positive" }));
console.log(chooseAlgorithm({ weights: "mixed", negative: true }));
console.log(chooseAlgorithm({ weights: "mixed", negative: true, acyclic: true }));
```
Output:
```text
BFS
Dijkstra
Bellman-Ford
topological order relaxation
```

## quiz
1. What does relaxing an edge do?
   - [ ] Removes the edge
   - [x] Improves a distance if a cheaper route through the edge exists
   - [ ] Sorts the vertices
   - [ ] Doubles the weight
   > It also records the predecessor.
2. Which algorithm suits non-negative weights?
   - [ ] Floyd-Warshall only
   - [x] Dijkstra's algorithm
   - [ ] Topological sorting
   - [ ] Union-find
   > Its greedy choice relies on weights not being negative.
3. What does a reachable negative cycle imply?
   - [ ] Distances are zero
   - [x] Shortest distances are undefined
   - [ ] The graph is a tree
   - [ ] The graph is bipartite
   > The cost can be lowered forever.
4. What distance does an unreachable vertex keep?
   - [ ] Zero
   - [x] Infinity
   - [ ] Minus one always
   - [ ] The source distance
   > No path reaches it.

# Dijkstra Algorithm
kind: algorithm
time: O((V + E) log V) with a binary heap and lazy deletion; O(V squared) with a plain array scan, which is better for dense graphs.
space: O(V + E) for the graph, distances and predecessors, plus up to O(E) heap entries with lazy deletion.
viz: dijkstra
practice: dijkstra-shortest-path

## intro
Dijkstra's algorithm computes shortest paths from a source in a graph whose edge weights are not negative. It repeatedly settles the unsettled vertex with the smallest tentative distance and relaxes its outgoing edges. Its correctness rests on one idea: once the closest unsettled vertex is chosen, no later path can improve it.

## theory
Algorithm:

- Set `dist[s] = 0`, all others infinity; keep a set of settled vertices (or rely on the stale check)
- Repeat: take the unsettled vertex u with minimum `dist[u]`, mark it settled, and relax every edge `(u, v, w)`: if `dist[u] + w < dist[v]`, update `dist[v]` and `pred[v]`
- Stop when all reachable vertices are settled, or when the target is settled for a single pair query

Correctness (greedy invariant): when u is chosen it has the smallest tentative distance among unsettled vertices. Any other path to u must leave the settled set through some unsettled vertex x with `dist[x] >= dist[u]`, and weights are non-negative, so continuing from x cannot be shorter. Therefore `dist[u]` is final. With a negative edge this argument breaks.

Implementations:

- Array scan: pick the minimum by scanning all vertices, O(V) per extraction, O(V squared) total; best for dense graphs and tiny V
- Binary heap with lazy deletion: push `(dist, vertex)` on every improvement and skip entries whose distance is larger than the current `dist`; O((V + E) log V)
- Indexed heap with decrease-key: heap size at most V
- Fibonacci heap: O(E + V log V), theoretical
- Dial's buckets for small integer weights

Worked example on a different graph: roads between towns with distances A-B 6, A-D 1, B-D 2, B-E 2, B-C 5, D-E 1 and E-C 5. From A the settling order is A (0), D (1), E (2 through D), B (3 through D) and C (7 through E or 8 through B, so 7 through E). The final distances are A 0, D 1, E 2, B 3 and C 7, and the path to C is A → D → E → C. The direct edge A-B of 6 is never used.

Early exit: if only one target matters, return as soon as it is popped from the heap; for the target C above the algorithm stops after settling C and never examines vertices farther away.

Complexity detail: each vertex is settled once; each edge is relaxed once when its source is settled; with a heap each relaxation costs O(log V). The number of heap entries is at most E + 1 with lazy deletion.

Variants and relatives:

- A* adds a heuristic to prefer vertices near the goal
- Prim's algorithm for minimum spanning trees is the same loop with key equal to the edge weight instead of the path length
- Multi-source Dijkstra starts with several sources at distance zero
- Dijkstra on state graphs: the vertex is (position, extra state)
- Widest path (maximum bottleneck): use a max-heap and take min instead of sum
- Most reliable path: multiply probabilities with a max-heap

Pitfalls: negative edges (use Bellman-Ford), updating a distance without pushing the new entry, skipping the stale check, unbounded integer infinity plus weight, and using the algorithm on graphs with floating point weights without considering rounding in comparisons.

Testing: compare with Bellman-Ford on random non-negative graphs and test unreachable vertices, parallel edges and zero weights.

## explain
1. Initialise all distances to infinity except the source, and push the source on a min-heap.
2. Pop the entry with the smallest distance and skip it if it is stale.
3. Relax every outgoing edge, pushing a new entry whenever a distance improves.
4. Repeat until the heap is empty or the target is popped.
5. Rebuild paths from the predecessors.
6. Verify against Bellman-Ford on random inputs.

## example
The Python program runs Dijkstra's algorithm on the town graph, printing the settling order A, D, E, B, C and the distances 0, 3, 7, 1, 2, then the path A, D, E, C, and checks the result against Bellman-Ford on 100 seeded random graphs. The JavaScript program uses the array scan version on an adjacency matrix.

## real
Road navigation, internet routing protocols such as OSPF and game pathfinding build on Dijkstra's algorithm and its refinements.

## pros
- Efficient for non-negative weights
- Early exit for a single target
- Simple greedy structure and easy path reconstruction

## cons
- Fails with negative edge weights
- Explores in all directions without a heuristic
- Needs a priority queue for good performance

## uses
- Road and network routing
- Weighted grid pathfinding
- Basis for A* and Prim's algorithm
- Latency and cost minimisation

## mistakes
- Using it when edges can be negative
- Forgetting the stale entry check with lazy deletion
- Not recording predecessors
- Using an array scan on a huge sparse graph

## interview
**Q:** Why does Dijkstra's algorithm need non-negative weights?
**A:** It assumes that when a vertex is settled no later path can be cheaper, which holds only if extending a path never decreases its cost.

**Q:** What are the running times with an array and with a binary heap?
**A:** O(V squared) with an array scan and O((V + E) log V) with a binary heap, so the array is better for dense graphs and the heap for sparse graphs.

**Q:** How do you stop early for a single target?
**A:** Return when the target is popped from the heap, since its distance is final at that moment.

## summary
Dijkstra's algorithm settles vertices in order of distance and relaxes their edges, running in O((V + E) log V) with a heap for non-negative weights. Use predecessors for paths, stop early for one target and never use it with negative edges.

## codenote
The Python sample uses a heap and verifies against Bellman-Ford. The JavaScript sample uses the matrix scan.

## code
### python
```python
import heapq
import random

def dijkstra(graph, source):
    dist = {v: float("inf") for v in graph}
    dist[source] = 0
    pred, order, heap = {}, [], [(0, source)]
    done = set()
    while heap:
        d, u = heapq.heappop(heap)
        if u in done:
            continue
        done.add(u)
        order.append(u)
        for v, w in graph[u]:
            if d + w < dist[v]:
                dist[v] = d + w
                pred[v] = u
                heapq.heappush(heap, (dist[v], v))
    return dist, pred, order

def bellman_ford(graph, source):
    dist = {v: float("inf") for v in graph}
    dist[source] = 0
    for _ in range(len(graph) - 1):
        for u in graph:
            for v, w in graph[u]:
                dist[v] = min(dist[v], dist[u] + w)
    return dist

roads = [("A", "B", 6), ("A", "D", 1), ("B", "D", 2), ("B", "E", 2), ("B", "C", 5), ("D", "E", 1), ("E", "C", 5)]
town = {v: [] for v in "ABCDE"}
for u, v, w in roads:
    town[u].append((v, w))
    town[v].append((u, w))
dist, pred, order = dijkstra(town, "A")
print(order, dist)
path, node = ["C"], "C"
while node in pred:
    node = pred[node]
    path.append(node)
print(path[::-1])

rng = random.Random(1)
ok = True
for _ in range(100):
    n = rng.randint(2, 7)
    graph = {v: [] for v in range(n)}
    for _ in range(rng.randint(1, 14)):
        graph[rng.randrange(n)].append((rng.randrange(n), rng.randint(0, 9)))
    ok = ok and dijkstra(graph, 0)[0] == bellman_ford(graph, 0)
print(ok)
```
Output:
```text
['A', 'D', 'E', 'B', 'C'] {'A': 0, 'B': 3, 'C': 7, 'D': 1, 'E': 2}
['A', 'D', 'E', 'C']
True
```
### javascript
```javascript
function dijkstraMatrix(matrix, source) {
  const n = matrix.length;
  const dist = new Array(n).fill(Infinity);
  const done = new Array(n).fill(false);
  dist[source] = 0;
  for (let step = 0; step < n; step++) {
    let u = -1;
    for (let v = 0; v < n; v++) if (!done[v] && (u === -1 || dist[v] < dist[u])) u = v;
    if (dist[u] === Infinity) break;
    done[u] = true;
    for (let v = 0; v < n; v++) {
      if (matrix[u][v] !== null && dist[u] + matrix[u][v] < dist[v]) dist[v] = dist[u] + matrix[u][v];
    }
  }
  return dist;
}

const x = null;
const matrix = [[x, 6, x, 1, x], [6, x, 5, 2, 2], [x, 5, x, x, 5], [1, 2, x, x, 1], [x, 2, 5, 1, x]];
console.log(dijkstraMatrix(matrix, 0).join(" "));
```
Output:
```text
0 3 7 1 2
```

## quiz
1. Which unsettled vertex is processed at each step of Dijkstra's algorithm?
   - [ ] The one with the most edges
   - [x] The unsettled vertex with the smallest tentative distance
   - [ ] The last discovered vertex
   - [ ] A random vertex
   > Its distance is then final.
2. What is the running time with a binary heap?
   - [ ] O(V squared)
   - [x] O((V + E) log V)
   - [ ] O(V E)
   - [ ] O(E squared)
   > Each relaxation may push one logarithmic cost entry.
3. How does lazy deletion handle improved distances?
   - [ ] It updates the heap entry in place
   - [x] It pushes a new entry and ignores stale ones when popped
   - [ ] It rebuilds the heap
   - [ ] It removes the vertex
   > Stale entries carry a larger distance than the current best.
4. When can the search stop for a single target?
   - [ ] After one edge
   - [x] When the target is popped from the heap
   - [ ] Never
   - [ ] When the heap has one entry
   > Its distance is final once it is the minimum.

# Bellman Ford Algorithm
kind: algorithm
time: O(V · E): V − 1 passes over all E edges, plus one more pass to detect negative cycles; early exit when a pass changes nothing makes typical runs faster.
space: O(V) for the distance and predecessor arrays, beyond the edge list.
viz: bellman-ford

## intro
Bellman-Ford computes single source shortest paths even when some edge weights are negative. Instead of cleverly choosing the next vertex, it relaxes every edge again and again. After enough rounds all shortest paths have been found, and one extra round reveals whether a negative cycle makes the problem unsolvable.

## theory
Algorithm:

- Set `dist[s] = 0` and all other distances to infinity
- Repeat V − 1 times: for every edge `(u, v, w)`, if `dist[u] + w < dist[v]` set `dist[v] = dist[u] + w`
- One more pass: if any edge can still be relaxed, a negative cycle reachable from s exists; otherwise the distances are final
- Optimisation: stop early if a whole pass changes nothing

Why V − 1 passes are enough: a shortest path without cycles has at most V − 1 edges. After pass k, every vertex whose shortest path uses at most k edges has its correct distance (induction on the number of edges: the last edge is relaxed in pass k, using the already correct distance of the previous vertex). So after V − 1 passes all shortest paths are known.

Example: edges S→A 4, S→B 5, A→B −3, B→C 2 and A→C 6. Pass 1 (edges in this order) gives A = 4, B = min(5, 4 − 3) = 1, C = min(1 + 2, 4 + 6) = 3. The distances are S 0, A 4, B 1 and C 3 after the first pass, and the second pass changes nothing, so the algorithm can stop early. Dijkstra's algorithm would settle B at 5 before discovering the cheaper route through A and would give a wrong answer.

Negative cycles: with edges S→A 1, A→B −3, B→A 1 the cycle A → B → A costs −2. Each pass keeps lowering the distances of A and B; the extra V-th pass still finds an improvable edge, which reports the cycle. Vertices reachable from such a cycle have no finite shortest distance and can be marked negative infinity by propagating from the improved vertices.

Complexity: O(V E) time is slower than Dijkstra's O((V + E) log V), so use Bellman-Ford only when negative weights occur. Memory is O(V). It needs only an edge list, and it works on directed graphs; an undirected graph with a negative edge always has a negative cycle (go back and forth), so it is used on directed graphs.

Variants and applications:

- Detecting negative cycles: currency arbitrage (take the logarithm of rates), checking consistency of difference constraints
- Difference constraints: a system `x_j − x_i <= c` is a shortest path problem; a solution exists exactly when there is no negative cycle
- Shortest paths with at most k edges: run only k passes, keeping a copy of the previous pass distances so a pass cannot use edges chained in the same pass (cheapest flights within k stops)
- Distributed routing: the distance vector protocols (RIP) are a distributed Bellman-Ford
- SPFA: a queue based optimisation (next lessons)
- Johnson's algorithm uses one Bellman-Ford run to reweight edges so Dijkstra can then be used for all pairs

Implementation notes: store edges as tuples in a list; use a large finite infinity or check `dist[u] != INF` before adding; keep predecessor array for path reconstruction; for the k-edge variant copy the distance array each pass.

Pitfalls: skipping the extra pass and returning wrong distances on negative cycle graphs, relaxing from infinity (INF plus negative weight looks like an improvement), using it on undirected graphs with negative edges, and expecting predecessor paths to be valid when a negative cycle exists.

Testing: compare with Dijkstra on non-negative graphs, with a brute force on tiny graphs with negatives, and check negative cycles are detected.

## explain
1. Set the source distance to zero and the rest to infinity.
2. Do V − 1 passes over all edges, relaxing each one that is reachable.
3. Stop early when a pass makes no change.
4. Do one extra pass; any further improvement means a reachable negative cycle.
5. Record predecessors to rebuild paths.
6. For the k-edge variant copy the distances between passes.

## example
The Python function computes the distances S 0, A 4, B 1, C 3 for the negative edge example in one productive pass and reports the number of passes used, then detects the cycle in the second example. The JavaScript function limits the number of edges to compute the cheapest cost with at most 1 stop in a flight network.

## real
Distance vector routing protocols, arbitrage detectors and constraint solvers use Bellman-Ford.

## pros
- Handles negative edge weights
- Detects negative cycles
- Needs only an edge list

## cons
- O(V E) is slow on large graphs
- Undefined distances with negative cycles
- Predecessor paths can be invalid when a cycle exists

## uses
- Shortest paths with negative weights
- Negative cycle and arbitrage detection
- Difference constraint systems
- Routing with at most k edges

## mistakes
- Using Dijkstra's algorithm where negatives occur
- Skipping the negative cycle pass
- Relaxing edges out of unreachable vertices
- Reusing the same pass distances in the k-edge variant

## interview
**Q:** Why does Bellman-Ford need V − 1 passes?
**A:** A shortest path without cycles has at most V − 1 edges, and pass k fixes the distances of all vertices whose shortest path has at most k edges.

**Q:** How does it detect a negative cycle?
**A:** After V − 1 passes, if any edge can still be relaxed, a negative cycle reachable from the source exists.

**Q:** When do you prefer Bellman-Ford to Dijkstra's algorithm?
**A:** When the graph has negative edge weights or when a negative cycle must be detected; otherwise Dijkstra's algorithm is faster.

## summary
Bellman-Ford relaxes all edges V − 1 times to handle negative weights in O(V E), and an extra pass detects negative cycles. Early exit, the k-edge variant and difference constraints make it more useful than its cost suggests.

## codenote
The Python sample runs the algorithm and detects a cycle. The JavaScript sample limits the edge count.

## code
### python
```python
INF = float("inf")

def bellman_ford(vertices, edges, source):
    dist = {v: INF for v in vertices}
    dist[source] = 0
    passes = 0
    for _ in range(len(vertices) - 1):
        changed = False
        for u, v, w in edges:
            if dist[u] != INF and dist[u] + w < dist[v]:
                dist[v] = dist[u] + w
                changed = True
        passes += 1
        if not changed:
            break
    negative_cycle = any(dist[u] != INF and dist[u] + w < dist[v] for u, v, w in edges)
    return dist, passes, negative_cycle

edges = [("S", "A", 4), ("S", "B", 5), ("A", "B", -3), ("B", "C", 2), ("A", "C", 6)]
print(bellman_ford("SABC", edges, "S"))
print(bellman_ford("SAB", [("S", "A", 1), ("A", "B", -3), ("B", "A", 1)], "S")[2])
```
Output:
```text
({'S': 0, 'A': 4, 'B': 1, 'C': 3}, 2, False)
True
```
### javascript
```javascript
function cheapest(n, flights, source, target, stops) {
  let dist = new Array(n).fill(Infinity);
  dist[source] = 0;
  for (let i = 0; i <= stops; i++) {
    const next = [...dist];
    for (const [u, v, price] of flights) {
      if (dist[u] + price < next[v]) next[v] = dist[u] + price;
    }
    dist = next;
  }
  return dist[target] === Infinity ? -1 : dist[target];
}

const flights = [[0, 1, 100], [1, 2, 100], [0, 2, 500]];
console.log(cheapest(3, flights, 0, 2, 1), cheapest(3, flights, 0, 2, 0));
```
Output:
```text
200 500
```

## quiz
1. How many passes over the edges does Bellman-Ford make for V vertices?
   - [ ] V
   - [x] V − 1, plus one to detect negative cycles
   - [ ] E
   - [ ] log V
   > A simple path has at most V − 1 edges.
2. What does an improvement in the extra pass mean?
   - [ ] A tree edge
   - [x] A reachable negative cycle
   - [ ] A disconnected graph
   - [ ] The algorithm failed to start
   > Distances could keep decreasing.
3. How does the cost of Bellman-Ford grow with vertices and edges?
   - [ ] O(V + E)
   - [x] O(V E)
   - [ ] O(V log V)
   - [ ] O(E log V)
   > V − 1 passes over E edges.
4. How is the at most k edges variant computed?
   - [ ] By running Dijkstra's algorithm
   - [x] By running k passes using a copy of the previous pass distances
   - [ ] By sorting the edges
   - [ ] By removing the heaviest edge
   > A pass must not chain several edges.

# Floyd Warshall Algorithm
kind: algorithm
time: O(V cubed) for three nested loops over the vertices, independent of the number of edges.
space: O(V squared) for the distance matrix (and another for successor or predecessor information when paths are needed).
viz: floyd-warshall

## intro
Floyd-Warshall computes the shortest distance between every pair of vertices in a weighted graph with one short dynamic programming loop. It handles negative edges (but not negative cycles), works directly on an adjacency matrix and is the usual choice when the graph is small or dense, or when all pairs of distances are needed.

## theory
Idea: let `d[k][i][j]` be the shortest distance from i to j using only vertices from the first k vertices as intermediate stops. Either the best path does not use vertex k, or it goes i → k → j with both parts using only earlier intermediates:

`d[k][i][j] = min(d[k − 1][i][j], d[k − 1][i][k] + d[k − 1][k][j])`

The k dimension can be dropped by updating in place, because row k and column k do not change during iteration k (if there is no negative cycle).

Algorithm:

- Initialise `d[i][i] = 0`, `d[i][j] = w(i, j)` for edges and infinity otherwise
- For k from 0 to V − 1, for i, for j: if `d[i][k] + d[k][j] < d[i][j]`, update `d[i][j]`
- The loop order must have k outermost

Example with four vertices 0 to 3 and directed edges 0→1 3, 0→3 7, 1→0 8, 1→2 2, 2→0 5, 2→3 1 and 3→0 2: the final distance matrix has the rows `[0, 3, 5, 6]`, `[5, 0, 2, 3]`, `[3, 6, 0, 1]` and `[2, 5, 7, 0]`. For instance, the distance from 0 to 3 is 6 (0 → 1 → 2 → 3) rather than the direct 7.

Negative cycles: after the algorithm, a negative value on the diagonal (`d[i][i] < 0`) means vertex i lies on a negative cycle. Distances involving vertices that can reach such a cycle are not meaningful.

Transitive closure (Warshall's algorithm): replace min and plus by or and and on booleans to compute which vertices can reach which in O(V cubed); with bitsets the inner loop is a word-wise or, giving O(V cubed / word size).

Complexity and use:

- O(V cubed) time and O(V squared) space regardless of E; for V = 400 that is 64 million steps, V = 1000 is a billion
- Better than running Dijkstra's algorithm from every vertex (O(V E log V)) when the graph is dense; worse for large sparse graphs, where Dijkstra from each vertex or Johnson's algorithm wins
- Simple code: five lines of core logic

Path reconstruction: keep `next[i][j]`, the first step on a shortest path from i to j; update it to `next[i][k]` when the distance improves through k. Then follow next pointers from i to j.

Applications: all pairs distances in small networks, transitive closure, graph diameter and radius, detecting negative cycles, finding the vertex with minimum total or maximum distance (graph centre), minimax paths (replace sum by max), counting pairs within a distance threshold (find the city with the fewest neighbours within a limit), and solving problems like regular expression conversion for finite automata.

Pitfalls: placing k in an inner loop (wrong results), using a finite infinity that overflows when added (use a check for infinity or a safe large value), forgetting the zero diagonal, overwriting the matrix when the original weights are still needed and mishandling undirected edges (fill both directions).

Testing: compare with running Dijkstra from each vertex on non-negative graphs.

## explain
1. Build the distance matrix with zeros on the diagonal and edge weights elsewhere.
2. For each intermediate vertex k in turn, try to improve every pair through k.
3. Keep k as the outermost loop.
4. Optionally update a next matrix for paths.
5. Check the diagonal for negative values.
6. Compare with Dijkstra from every vertex.

## example
The Python program computes the four vertex distance matrix above, reconstructs the path from 0 to 3, finds the graph diameter 7 and verifies the matrix against Dijkstra from each vertex on random graphs. The JavaScript program computes the transitive closure of a small directed graph.

## real
Small routing tables, travel time matrices between a few hundred locations, and compilers' transitive closure computations use Floyd-Warshall.

## pros
- Very short code
- Handles negative edges and detects negative cycles
- Gives all pair distances at once

## cons
- Cubic time and quadratic memory
- Not suitable for large sparse graphs
- Loop order mistakes silently give wrong answers

## uses
- All pairs shortest paths in small graphs
- Transitive closure
- Graph diameter and centre
- Negative cycle detection

## mistakes
- Putting the intermediate vertex loop inside
- Adding infinity values and overflowing
- Forgetting to initialise the diagonal to zero
- Using it on a graph with tens of thousands of vertices

## interview
**Q:** What is the Floyd-Warshall recurrence?
**A:** The distance from i to j using the first k vertices as intermediates is the smaller of the distance without vertex k and the sum of the distances from i to k and from k to j.

**Q:** What is its complexity and when is it a good choice?
**A:** O(V cubed) time and O(V squared) space, good for small or dense graphs and when all pairs distances are needed; for large sparse graphs run Dijkstra from each vertex or use Johnson's algorithm.

**Q:** How do you detect a negative cycle with it?
**A:** After the run, a negative value on the diagonal of the matrix means that vertex lies on a negative cycle.

## summary
Floyd-Warshall tries every vertex as an intermediate stop in three nested loops, producing all pairs shortest distances in O(V cubed). Keep k outermost, handle infinity carefully and use next pointers for paths.

## codenote
The Python sample computes distances, a path, and verifies by Dijkstra. The JavaScript sample computes reachability.

## code
### python
```python
import heapq
import random

INF = float("inf")

def floyd_warshall(n, edges):
    d = [[0 if i == j else INF for j in range(n)] for i in range(n)]
    nxt = [[j if i != j else None for j in range(n)] for i in range(n)]
    for u, v, w in edges:
        if w < d[u][v]:
            d[u][v] = w
    for k in range(n):
        for i in range(n):
            for j in range(n):
                if d[i][k] + d[k][j] < d[i][j]:
                    d[i][j] = d[i][k] + d[k][j]
                    nxt[i][j] = nxt[i][k]
    return d, nxt

edges = [(0, 1, 3), (0, 3, 7), (1, 0, 8), (1, 2, 2), (2, 0, 5), (2, 3, 1), (3, 0, 2)]
d, nxt = floyd_warshall(4, edges)
print(d)
path, node = [0], 0
while node != 3:
    node = nxt[node][3]
    path.append(node)
print(path, max(max(row) for row in d))

def dijkstra(n, edges, source):
    graph = [[] for _ in range(n)]
    for u, v, w in edges:
        graph[u].append((v, w))
    dist = [INF] * n
    dist[source] = 0
    heap = [(0, source)]
    while heap:
        du, u = heapq.heappop(heap)
        if du > dist[u]:
            continue
        for v, w in graph[u]:
            if du + w < dist[v]:
                dist[v] = du + w
                heapq.heappush(heap, (dist[v], v))
    return dist

rng = random.Random(2)
ok = True
for _ in range(100):
    n = rng.randint(2, 6)
    rand_edges = [(rng.randrange(n), rng.randrange(n), rng.randint(0, 9)) for _ in range(rng.randint(1, 12))]
    matrix, _ = floyd_warshall(n, rand_edges)
    ok = ok and all(matrix[s] == dijkstra(n, rand_edges, s) for s in range(n))
print(ok)
```
Output:
```text
[[0, 3, 5, 6], [5, 0, 2, 3], [3, 6, 0, 1], [2, 5, 7, 0]]
[0, 1, 2, 3] 7
True
```
### javascript
```javascript
function transitiveClosure(n, edges) {
  const reach = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => i === j));
  for (const [u, v] of edges) reach[u][v] = true;
  for (let k = 0; k < n; k++) {
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) reach[i][j] = reach[i][j] || (reach[i][k] && reach[k][j]);
    }
  }
  return reach;
}

const reach = transitiveClosure(4, [[0, 1], [1, 2], [3, 2]]);
console.log(reach.map((row) => row.map((v) => (v ? 1 : 0)).join("")).join(" "));
```
Output:
```text
1110 0110 0010 0011
```

## quiz
1. Which loop must be outermost in Floyd-Warshall?
   - [ ] The source vertex
   - [x] The intermediate vertex k
   - [ ] The target vertex
   - [ ] The edge list
   > The recurrence adds intermediates one at a time.
2. What is the running time?
   - [ ] O(V squared)
   - [x] O(V cubed)
   - [ ] O(V E)
   - [ ] O(E log V)
   > Three nested loops over the vertices.
3. What does a negative diagonal entry indicate?
   - [ ] An isolated vertex
   - [x] The vertex lies on a negative cycle
   - [ ] A self loop of zero weight
   - [ ] A tree edge
   > The distance from the vertex to itself could be lowered.
4. What replaces min and plus for transitive closure?
   - [ ] Max and times
   - [x] Boolean or and and
   - [ ] Subtraction
   - [ ] Division
   > It computes reachability instead of distance.

# SPFA Algorithm
kind: algorithm
time: O(E) on average for typical graphs and O(V · E) in the worst case, since each vertex can be re-queued many times when its distance keeps improving.
space: O(V) for the distance array, the in-queue flags and the queue, plus the adjacency lists.

## intro
The shortest path faster algorithm (SPFA) is a queue based version of Bellman-Ford. Instead of relaxing every edge in every pass, it only revisits the outgoing edges of vertices whose distance has just improved. On many practical graphs this removes most of the redundant work while keeping Bellman-Ford's ability to handle negative edges.

## theory
Algorithm:

- Set `dist[s] = 0`, others infinity; put s in a queue and mark it in the queue
- While the queue is not empty: remove u (clear its in-queue mark); for each edge `(u, v, w)`: if `dist[u] + w < dist[v]`, update `dist[v]`; if v is not in the queue, add it and mark it
- When the queue empties, no distance can improve and the distances are final

Why it works: it is Bellman-Ford with the observation that an edge only needs relaxing again after the distance of its source decreased. The queue holds exactly the vertices whose outgoing edges might now give improvements.

Negative cycle detection: count how many times each vertex has been put in the queue, or the number of edges on its current shortest path (`edges[v] = edges[u] + 1`); if a count reaches V, there is a negative cycle reachable from the source, since a shortest path without cycles has at most V − 1 edges.

Example: edges S→A 4, S→B 5, A→B −3, B→C 2 and A→C 6. The queue starts with S; processing S sets A = 4 and B = 5 and queues both. Processing A sets B = 1 (queued already) and C = 10 (queued), then processing B sets C = 3, and processing C changes nothing. The distances are S 0, A 4, B 1 and C 3. The number of relaxations performed is small compared with a full Bellman-Ford run, which scans all 5 edges per pass.

Complexity: the average case is often close to O(E) (about two or three relaxations per edge), but adversarial inputs, such as certain grid graphs or constructed gadgets, force Θ(V E) behaviour. In competitive programming, SPFA was popular and some problem setters build tests to break it; Dijkstra's algorithm with a heap is safer when weights are non-negative.

Variants and improvements:

- Small label first and large label last heuristics reorder the queue to reduce re-insertions
- Using a deque instead of a queue (add to the front if the distance is smaller than the front's)
- Randomised processing order to avoid worst cases
- Limited edge count versions for at most k edges

Comparison:

- Bellman-Ford: simple, predictable O(V E), no queue
- SPFA: faster on average, same worst case, needs queue and flags
- Dijkstra: best for non-negative weights, O((V + E) log V)
- Topological order relaxation: best for DAGs

Applications: shortest paths in graphs with negative edges, difference constraints, minimum cost flow (successive shortest paths uses SPFA to find augmenting paths in residual graphs with negative costs), and problems where weights can be negative but cycles are rare.

Pitfalls: forgetting the in-queue flag (the queue explodes with duplicates), no cycle protection (infinite loop with a negative cycle), assuming the average case, relaxing from infinite distances and using SPFA where Dijkstra's algorithm would be both simpler and safer.

Testing: compare with Bellman-Ford on random graphs with negative edges but no negative cycles, count relaxations to see the savings, and test the cycle detection.

## explain
1. Initialise the distances and put the source in the queue.
2. Take a vertex from the queue and relax its outgoing edges.
3. Queue each improved neighbour unless it is already queued.
4. Count queue insertions per vertex to detect negative cycles.
5. Stop when the queue is empty.
6. Compare the number of relaxations with Bellman-Ford.

## example
The Python program runs SPFA on the sample graph, printing the distances and the number of edge relaxation checks compared with Bellman-Ford, and detects a negative cycle in a second graph. The JavaScript program runs SPFA on a graph with several negative edges and prints the distances.

## real
Competitive programmers and minimum cost flow implementations use SPFA for graphs with negative costs, and some routing code uses queue based relaxation for the same reason.

## pros
- Usually much faster than plain Bellman-Ford
- Handles negative weights
- Simple extension of Bellman-Ford

## cons
- Worst case remains O(V E)
- Needs cycle counting to avoid infinite loops
- Dijkstra's algorithm is safer for non-negative weights

## uses
- Shortest paths with negative edges
- Augmenting paths in minimum cost flow
- Difference constraints
- Detecting negative cycles on sparse graphs

## mistakes
- Not tracking whether a vertex is already queued
- Looping forever on negative cycles
- Quoting the average bound as a guarantee
- Using it for non-negative graphs where Dijkstra's algorithm is better

## interview
**Q:** How does SPFA differ from Bellman-Ford?
**A:** It keeps a queue of vertices whose distance improved and relaxes only their outgoing edges, instead of relaxing every edge in every pass.

**Q:** What are the complexities of SPFA?
**A:** About O(E) on average for typical graphs, but O(V E) in the worst case, the same as Bellman-Ford.

**Q:** How does SPFA detect a negative cycle?
**A:** By counting how many edges are on a vertex's current shortest path or how many times it enters the queue; reaching V means a negative cycle is reachable.

## summary
SPFA is Bellman-Ford driven by a queue of recently improved vertices, fast on average and O(V E) in the worst case, with cycle detection by counting. Use Dijkstra's algorithm instead when weights are non-negative.

## codenote
The Python sample counts relaxations and detects a cycle. The JavaScript sample handles negative edges.

## code
### python
```python
from collections import deque

INF = float("inf")

def spfa(vertices, edges, source):
    graph = {v: [] for v in vertices}
    for u, v, w in edges:
        graph[u].append((v, w))
    dist = {v: INF for v in vertices}
    dist[source] = 0
    queue, queued, count, checks = deque([source]), {source}, {v: 0 for v in vertices}, 0
    while queue:
        u = queue.popleft()
        queued.discard(u)
        for v, w in graph[u]:
            checks += 1
            if dist[u] + w < dist[v]:
                dist[v] = dist[u] + w
                if v not in queued:
                    count[v] += 1
                    if count[v] >= len(vertices):
                        return None, checks
                    queue.append(v)
                    queued.add(v)
    return dist, checks

edges = [("S", "A", 4), ("S", "B", 5), ("A", "B", -3), ("B", "C", 2), ("A", "C", 6)]
dist, checks = spfa("SABC", edges, "S")
print(dist, checks, len(edges) * 3)
print(spfa("SAB", [("S", "A", 1), ("A", "B", -3), ("B", "A", 1)], "S")[0])
```
Output:
```text
{'S': 0, 'A': 4, 'B': 1, 'C': 3} 5 15
None
```
### javascript
```javascript
function spfa(n, edges, source) {
  const graph = Array.from({ length: n }, () => []);
  for (const [u, v, w] of edges) graph[u].push([v, w]);
  const dist = new Array(n).fill(Infinity);
  dist[source] = 0;
  const queue = [source];
  const inQueue = new Array(n).fill(false);
  inQueue[source] = true;
  for (let head = 0; head < queue.length; head++) {
    const u = queue[head];
    inQueue[u] = false;
    for (const [v, w] of graph[u]) {
      if (dist[u] + w < dist[v]) {
        dist[v] = dist[u] + w;
        if (!inQueue[v]) {
          inQueue[v] = true;
          queue.push(v);
        }
      }
    }
  }
  return dist;
}

console.log(spfa(5, [[0, 1, 6], [0, 2, 7], [1, 2, 8], [1, 3, 5], [1, 4, -4], [2, 3, -3], [2, 4, 9], [3, 1, -2], [4, 3, 7]], 0).join(" "));
```
Output:
```text
0 2 7 4 -2
```

## quiz
1. What does SPFA keep that Bellman-Ford does not?
   - [ ] A heap of all edges
   - [x] A queue of vertices whose distances recently improved
   - [ ] A sorted edge list
   - [ ] A matrix
   > Only those vertices can improve their neighbours.
2. What is the worst-case time of SPFA?
   - [ ] O(V + E)
   - [x] O(V E)
   - [ ] O(E log V)
   - [ ] O(V log V)
   > It matches Bellman-Ford in the worst case.
3. Why is an in-queue flag needed?
   - [ ] To sort the queue
   - [x] To avoid adding the same vertex many times
   - [ ] To detect leaves
   - [ ] To store distances
   > Duplicates would make the queue explode.
4. How is a negative cycle detected?
   - [ ] By the queue becoming empty
   - [x] By a vertex being queued V times or its path having V edges
   - [ ] By a zero distance
   - [ ] By sorting the distances
   > Simple shortest paths have at most V − 1 edges.

# Shortest Path in DAG
kind: algorithm
time: O(V + E): one topological sort plus one relaxation of each edge, faster than Dijkstra's algorithm and valid with negative weights.
space: O(V + E) for the graph and in-degree counts plus O(V) for the distance array and the order.

## intro
In a directed acyclic graph there is a natural order in which to settle vertices: a topological order, where every edge goes forward. Relaxing the outgoing edges of each vertex in that order finds all shortest paths in linear time, even with negative weights, because by the time a vertex is processed all paths into it are already accounted for.

## theory
Algorithm:

- Compute a topological order of the DAG (Kahn's algorithm or reverse depth first postorder)
- Set `dist[s] = 0` and every other distance to infinity
- Process the vertices in topological order; for each vertex u with finite distance, relax every edge `(u, v, w)`: `dist[v] = min(dist[v], dist[u] + w)`

Why it works: when u is processed, every vertex that could precede u on a path has already been processed (topological order), so `dist[u]` is final. No priority queue is needed, and negative weights cause no problem since distances never need to be revised after a vertex is processed. Vertices before the source in the order are unreachable and stay at infinity.

Example: vertices in topological order S, A, B, C, D with edges S→A 6, S→B 2, A→C 1, B→A 3, B→C 5, B→D −2... let us define it explicitly: S→A 6, S→B 2, B→A 3, A→C 1, B→C 5, C→D −3 and B→D 4. Processing S gives A = 6, B = 2; processing B gives A = 5, C = 7, D = 6; processing A gives C = 6; processing C gives D = 3. The distances are S 0, B 2, A 5, C 6 and D 3, and the path to D is S → B → A → C → D, using the negative edge.

Longest path: the longest path problem is NP-hard in general graphs but linear in a DAG. Negate the weights and take the shortest path, or replace min by max. This is the critical path method in project planning: the longest chain of dependent tasks determines the project duration. For task durations on edges S→A 6, S→B 2, B→A 3, A→C 1 the longest path to C is S → A → C with length 7, while the route S → B → A → C has length 6, so the project needs at least 7 time units.

Counting shortest paths: add a counter array, `ways[v] += ways[u]` when an edge gives an equal distance and reset it when a strictly shorter distance is found.

Other uses:

- Dynamic programming over DAG-shaped subproblem graphs is exactly this pattern (the states form a DAG, and the recurrence relaxes along edges): the minimum cost to reach a state, longest increasing subsequence as a path, coin change as a layered graph
- Scheduling with deadlines and critical path analysis in project management
- Shortest paths in layered graphs and in time expanded networks (edges only forward in time)
- Pipeline latency analysis in circuits (static timing analysis computes longest paths in a DAG of gates)
- Detecting if a graph is a DAG at the same time: the topological sort fails on cycles, in which case this method does not apply

Comparison with other algorithms: Dijkstra's algorithm would also work for non-negative DAG edges but costs O((V + E) log V); Bellman-Ford handles negatives in O(V E); the DAG method does both in O(V + E), the best possible.

Implementation notes: compute the order once and reuse it for many sources; skip vertices with infinite distance; keep predecessors for path reconstruction; for a single target ignore vertices after the target in the order.

Pitfalls: running the method on a graph with a cycle, relaxing from unreachable vertices (infinity plus negative weight), reading distances before the order reaches them and mixing up min and max for longest versus shortest paths.

Testing: compare with Bellman-Ford on random DAGs with negative weights.

## explain
1. Compute a topological order of the graph.
2. Initialise distances with zero for the source and infinity for others.
3. Go through the vertices in order and relax the outgoing edges of reachable vertices.
4. Record predecessors for path reconstruction.
5. For longest paths swap min with max or negate weights.
6. Verify against Bellman-Ford on random acyclic graphs.

## example
The Python program computes the distances S 0, B 2, A 5, C 6, D 3 for the sample DAG with a negative edge, reconstructs the path to D, finds the longest path 7 for the project example and verifies 100 random DAGs against Bellman-Ford. The JavaScript program counts the shortest paths to each vertex of a small DAG.

## real
Build systems compute critical paths, circuit timing tools find the longest gate chain and schedulers estimate project length with the longest path in the task DAG.

## pros
- Linear time and no priority queue
- Works with negative edge weights
- Solves longest path problems efficiently

## cons
- Only applies to acyclic graphs
- Needs a topological order first
- Unreachable vertices need explicit handling

## uses
- Critical path analysis in projects
- Shortest and longest paths in DAGs
- Dynamic programming over state graphs
- Counting shortest paths

## mistakes
- Using it on graphs that contain cycles
- Relaxing edges out of vertices that are unreachable
- Using min instead of max for longest paths
- Recomputing the topological order for every source

## interview
**Q:** How do you find shortest paths in a DAG in linear time?
**A:** Compute a topological order, set the source distance to zero and relax the outgoing edges of each vertex in that order; each vertex is final when processed.

**Q:** Why can the longest path be found in a DAG but not in general graphs?
**A:** Topological order guarantees every predecessor is processed first, so a single pass of dynamic programming gives the maximum; in graphs with cycles the longest simple path problem is NP-hard.

**Q:** Why do negative weights not matter here?
**A:** Distances never need to be revised after a vertex is processed, so the greedy argument that fails for Dijkstra's algorithm is not needed.

## summary
Relaxing edges in topological order gives shortest or longest paths in a DAG in O(V + E) with any weights. It is the engine of critical path analysis and of dynamic programming over acyclic state graphs.

## codenote
The Python sample finds shortest and longest paths. The JavaScript sample counts shortest paths.

## code
### python
```python
from collections import deque

INF = float("inf")

def dag_paths(vertices, edges, source, longest=False):
    graph = {v: [] for v in vertices}
    indegree = {v: 0 for v in vertices}
    for u, v, w in edges:
        graph[u].append((v, w))
        indegree[v] += 1
    ready = deque(v for v in vertices if indegree[v] == 0)
    order = []
    while ready:
        u = ready.popleft()
        order.append(u)
        for v, _ in graph[u]:
            indegree[v] -= 1
            if indegree[v] == 0:
                ready.append(v)
    sign = -1 if longest else 1
    dist = {v: INF for v in vertices}
    dist[source] = 0
    pred = {}
    for u in order:
        if dist[u] == INF:
            continue
        for v, w in graph[u]:
            if dist[u] + sign * w < dist[v]:
                dist[v] = dist[u] + sign * w
                pred[v] = u
    return {v: sign * d if d != INF else None for v, d in dist.items()}, pred

edges = [("S", "A", 6), ("S", "B", 2), ("B", "A", 3), ("A", "C", 1), ("B", "C", 5), ("C", "D", -3), ("B", "D", 4)]
dist, pred = dag_paths("SABCD", edges, "S")
path, node = ["D"], "D"
while node in pred:
    node = pred[node]
    path.append(node)
print(dist, path[::-1])
tasks = [("S", "A", 6), ("S", "B", 2), ("B", "A", 3), ("A", "C", 1)]
print(dag_paths("SABC", tasks, "S", longest=True)[0]["C"])
```
Output:
```text
{'S': 0, 'A': 5, 'B': 2, 'C': 6, 'D': 3} ['S', 'B', 'A', 'C', 'D']
7
```
### javascript
```javascript
function countShortest(n, edges, source) {
  const graph = Array.from({ length: n }, () => []);
  const indegree = new Array(n).fill(0);
  for (const [u, v, w] of edges) {
    graph[u].push([v, w]);
    indegree[v]++;
  }
  const order = [];
  const ready = [];
  indegree.forEach((d, v) => d === 0 && ready.push(v));
  while (ready.length) {
    const u = ready.shift();
    order.push(u);
    for (const [v] of graph[u]) if (--indegree[v] === 0) ready.push(v);
  }
  const dist = new Array(n).fill(Infinity);
  const ways = new Array(n).fill(0);
  dist[source] = 0;
  ways[source] = 1;
  for (const u of order) {
    if (dist[u] === Infinity) continue;
    for (const [v, w] of graph[u]) {
      if (dist[u] + w < dist[v]) {
        dist[v] = dist[u] + w;
        ways[v] = ways[u];
      } else if (dist[u] + w === dist[v]) {
        ways[v] += ways[u];
      }
    }
  }
  return ways;
}

console.log(countShortest(5, [[0, 1, 1], [0, 2, 2], [1, 3, 2], [2, 3, 1], [3, 4, 1], [1, 4, 4]], 0).join(" "));
```
Output:
```text
1 1 1 2 2
```

## quiz
1. In which order are vertices processed?
   - [ ] By increasing distance
   - [x] In topological order
   - [ ] In reverse order of discovery
   - [ ] By label
   > Every predecessor is then already final.
2. What is the running time of shortest paths in a DAG?
   - [ ] O(V E)
   - [x] O(V + E)
   - [ ] O((V + E) log V)
   - [ ] O(V cubed)
   > One ordering and one relaxation per edge.
3. How is the longest path found?
   - [ ] With Dijkstra's algorithm
   - [x] By replacing min with max or negating the weights
   - [ ] It cannot be found
   - [ ] By sorting vertices by label
   > The same pass works for maximisation.
4. Why do negative weights cause no trouble?
   - [ ] They are ignored
   - [x] Each vertex is final when processed and never revisited
   - [ ] They are converted to positive weights
   - [ ] The graph is undirected
   > The topological order replaces the greedy argument.
