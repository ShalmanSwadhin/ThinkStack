# Network Flow Intro
kind: algorithm
time: O(V · E squared) for Edmonds-Karp (breadth first augmenting paths), O(V squared · E) for Dinic's algorithm, and O(E · maximum flow value) for plain Ford-Fulkerson with integer capacities.
space: O(V + E) for the residual graph, which stores each edge together with its reverse edge.

## intro
A flow network is a directed graph whose edges have capacities, with a source where material enters and a sink where it leaves. The maximum flow problem asks how much can be pushed from the source to the sink without exceeding any capacity. It models pipelines, traffic, data networks and assignment problems, and it has a beautiful companion result: the maximum flow equals the capacity of the smallest cut.

## theory
Definitions:

- Flow: assigns to each edge a value `f(u, v)` with `0 <= f(u, v) <= c(u, v)` (capacity constraint), and for every vertex except the source and sink the flow in equals the flow out (conservation)
- Value of a flow: the net flow leaving the source
- Maximum flow: a flow of largest value
- Cut: a partition of the vertices into S containing the source and T containing the sink; its capacity is the sum of the capacities of edges from S to T
- Max-flow min-cut theorem: the maximum flow value equals the minimum capacity over all cuts

Residual graph: for every edge (u, v) with capacity c and flow f, the residual graph has a forward edge (u, v) with residual capacity c − f and a backward edge (v, u) with capacity f. The backward edge allows undoing flow already sent, which is what lets greedy augmentation reach the optimum.

Ford-Fulkerson method:

- Start with zero flow
- While there is a path from the source to the sink in the residual graph (an augmenting path), push flow along it equal to the smallest residual capacity on the path (its bottleneck), updating forward and backward residual edges
- When no augmenting path exists, the flow is maximum; the vertices reachable from the source in the final residual graph form the source side of a minimum cut

Choosing augmenting paths:

- Depth first search: simple, but with large capacities can take as many iterations as the flow value (and may not terminate with irrational capacities)
- Edmonds-Karp: always use a shortest augmenting path (breadth first search), which bounds the number of augmentations by O(V E) and the total time by O(V E squared)
- Dinic's algorithm: build level graphs by breadth first search and push blocking flows with depth first search, O(V squared E), and much faster in practice; O(E sqrt V) on unit capacity bipartite graphs
- Push-relabel: another family with O(V cubed) bounds, strong in practice

Example (the classic network): edges s→v1 16, s→v2 13, v2→v1 4, v1→v3 12, v3→v2 9, v2→v4 14, v4→v3 7, v3→t 20, v4→t 4. The maximum flow from s to t is 23. A minimum cut separates {s, v1, v2, v4} from {v3, t}: the crossing edges v1→v3 (12), v4→v3 (7) and v4→t (4) have total capacity 23, matching the flow.

Applications:

- Bipartite matching (next lesson): add a source connected to one side and a sink to the other, all capacities 1
- Edge-disjoint and vertex-disjoint paths (Menger's theorem): maximum number of disjoint paths equals the minimum cut
- Project selection and image segmentation (min cut separates foreground and background)
- Baseball elimination, airline scheduling and supply chains
- Minimum cost flow adds a cost per unit of flow
- Circulations with lower bounds

Implementation notes:

- Store edges in an array with paired reverse edges (edge i and i XOR 1) for easy residual updates
- Use adjacency lists of edge indices
- Capacities can be integers; real capacities need tolerance
- To find the min cut, run a final search from the source in the residual graph and report the saturated edges leaving the reachable set

Pitfalls: forgetting the reverse residual edges (gives non-maximal flows), treating undirected edges as a single directed edge (add two directed edges with the same capacity), augmenting with the wrong bottleneck and parallel edges handled incorrectly.

Testing: compare the flow value with the min cut capacity, verify conservation at inner vertices and compare with a brute force over cuts for tiny graphs.

## explain
1. Build the residual graph with forward capacities and zero-capacity reverse edges.
2. Find a path from the source to the sink with positive residual capacity.
3. Push the bottleneck amount along the path and update forward and reverse residuals.
4. Repeat until no augmenting path exists.
5. The total pushed is the maximum flow, and the reachable side gives a minimum cut.
6. Check conservation and the min-cut equality.

## example
The Python program runs Edmonds-Karp on the classic network and prints the maximum flow 23 and the minimum cut edges with total capacity 23. The JavaScript program runs a depth first Ford-Fulkerson on a small network and prints its flow.

## real
Traffic and pipeline planning, bipartite assignment, image segmentation and data centre scheduling reduce to network flow.

## pros
- One framework solves many matching and routing problems
- Max-flow min-cut gives a certificate of optimality
- Efficient algorithms exist in theory and practice

## cons
- Residual graph bookkeeping is easy to get wrong
- Plain Ford-Fulkerson can be slow with large capacities
- Modelling a problem as a flow needs insight

## uses
- Maximum bipartite matching
- Edge-disjoint paths
- Minimum cuts and image segmentation
- Capacity planning in networks

## mistakes
- Omitting the backward residual edges
- Treating undirected edges as a single arc
- Forgetting that conservation applies to inner vertices only
- Using depth first augmentation with huge capacities

## interview
**Q:** What is the max-flow min-cut theorem?
**A:** The maximum value of a flow from the source to the sink equals the minimum capacity of a cut separating them.

**Q:** Why does the residual graph contain backward edges?
**A:** They allow flow already sent along an edge to be cancelled, so a later augmenting path can reroute flow and the greedy augmentation reaches the true maximum.

**Q:** How do Edmonds-Karp and Ford-Fulkerson differ?
**A:** Edmonds-Karp always augments along a shortest path found by breadth first search, which bounds the number of augmentations by O(V E) and gives O(V E squared) time, while plain Ford-Fulkerson uses any path and may take as many steps as the flow value.

## summary
Maximum flow pushes flow along augmenting paths in a residual graph that includes backward edges, and it equals the minimum cut capacity. Edmonds-Karp and Dinic's algorithm give polynomial time bounds and many problems reduce to flow.

## codenote
The Python sample implements Edmonds-Karp and finds a minimum cut. The JavaScript sample uses depth first augmentation.

## code
### python
```python
from collections import deque

def max_flow(n, edges, source, sink):
    capacity = [[0] * n for _ in range(n)]
    for u, v, c in edges:
        capacity[u][v] += c
    original = [row[:] for row in capacity]
    flow = 0
    while True:
        parent = [-1] * n
        parent[source] = source
        queue = deque([source])
        while queue and parent[sink] == -1:
            u = queue.popleft()
            for v in range(n):
                if parent[v] == -1 and capacity[u][v] > 0:
                    parent[v] = u
                    queue.append(v)
        if parent[sink] == -1:
            break
        bottleneck, v = float("inf"), sink
        while v != source:
            bottleneck = min(bottleneck, capacity[parent[v]][v])
            v = parent[v]
        v = sink
        while v != source:
            capacity[parent[v]][v] -= bottleneck
            capacity[v][parent[v]] += bottleneck
            v = parent[v]
        flow += bottleneck
    reachable = {v for v in range(n) if parent[v] != -1}
    cut = [(u, v, original[u][v]) for u in reachable for v in range(n) if v not in reachable and original[u][v] > 0]
    return flow, cut

edges = [(0, 1, 16), (0, 2, 13), (2, 1, 4), (1, 3, 12), (3, 2, 9), (2, 4, 14), (4, 3, 7), (3, 5, 20), (4, 5, 4)]
flow, cut = max_flow(6, edges, 0, 5)
print(flow, cut, sum(c for *_, c in cut))
```
Output:
```text
23 [(1, 3, 12), (4, 3, 7), (4, 5, 4)] 23
```
### javascript
```javascript
function fordFulkerson(n, edges, source, sink) {
  const capacity = Array.from({ length: n }, () => new Array(n).fill(0));
  for (const [u, v, c] of edges) capacity[u][v] += c;
  const augment = (node, limit, seen) => {
    if (node === sink) return limit;
    seen.add(node);
    for (let next = 0; next < n; next++) {
      if (!seen.has(next) && capacity[node][next] > 0) {
        const pushed = augment(next, Math.min(limit, capacity[node][next]), seen);
        if (pushed > 0) {
          capacity[node][next] -= pushed;
          capacity[next][node] += pushed;
          return pushed;
        }
      }
    }
    return 0;
  };
  let total = 0;
  for (let pushed; (pushed = augment(source, Infinity, new Set())) > 0; ) total += pushed;
  return total;
}

console.log(fordFulkerson(4, [[0, 1, 3], [0, 2, 2], [1, 2, 1], [1, 3, 2], [2, 3, 3]], 0, 3));
```
Output:
```text
5
```

## quiz
1. What does the conservation constraint require?
   - [ ] Every edge carries its full capacity
   - [x] For every vertex except the source and sink, flow in equals flow out
   - [ ] The source receives flow
   - [ ] Edges have equal flow
   > Flow is neither created nor lost at inner vertices.
2. What does the max-flow min-cut theorem state?
   - [ ] Flow is always at most one
   - [x] The maximum flow value equals the minimum cut capacity
   - [ ] Cuts equal edges
   - [ ] Flows are unique
   > The cut gives a certificate of optimality.
3. Why are backward residual edges needed?
   - [ ] To make the graph undirected
   - [x] To allow earlier flow to be cancelled and rerouted
   - [ ] To double the capacity
   - [ ] To detect cycles
   > Without them greedy augmentation can get stuck below the maximum.
4. How does Edmonds-Karp choose augmenting paths?
   - [ ] Randomly
   - [x] It uses shortest paths found by breadth first search
   - [ ] It uses the widest paths only
   - [ ] It uses depth first search
   > That bounds the number of augmentations.

# Bipartite Matching Intro
kind: algorithm
time: O(V · E) for Kuhn's augmenting path algorithm, O(E · sqrt V) for Hopcroft-Karp, and the same bounds as maximum flow with unit capacities when solved by flow.
space: O(V + E) for the adjacency lists and the match arrays.

## intro
In a bipartite graph the vertices are split into two groups, such as workers and jobs, and edges join only vertices from different groups. A matching is a set of edges with no shared vertex, meaning each worker gets at most one job and each job at most one worker. Finding the largest matching is the classic assignment problem, and augmenting paths solve it.

## theory
Definitions:

- Matching: a set of edges no two of which share an endpoint
- Maximum matching: a matching with the most edges
- Perfect matching: every vertex is matched (possible only if both sides have equal size)
- Matched and free vertices; alternating path: a path whose edges alternate between non-matching and matching edges
- Augmenting path: an alternating path that starts and ends at free vertices; flipping the roles of its edges increases the matching size by one

Berge's theorem: a matching is maximum exactly when it has no augmenting path. This gives the basic algorithm: repeatedly find an augmenting path and flip it.

Kuhn's algorithm (augmenting paths by depth first search):

- For each vertex u on the left side, try to find a partner: for each neighbour v on the right, if v is unvisited in this attempt, mark it; if v is free or the current partner of v can be re-matched elsewhere (recursive attempt), assign v to u
- Each attempt uses a fresh visited set; the total work is O(V E)

Example: three workers and three jobs with the allowed pairs W1: {J1, J2}, W2: {J1}, W3: {J2, J3}. A greedy assignment W1→J1 blocks W2, but Kuhn's algorithm reroutes W1 to J2 and W3 to J3 so all three are matched: W1-J2, W2-J1, W3-J3. The maximum matching has size 3, and it is perfect.

Hopcroft-Karp: finds a maximal set of vertex-disjoint shortest augmenting paths in each phase using breadth first search followed by depth first search, giving O(E sqrt V). It is the choice for large graphs.

Reduction to maximum flow: add a source connected to every left vertex and a sink connected from every right vertex, all capacities 1 (middle edges also capacity 1). The maximum flow equals the maximum matching size, and the saturated middle edges are the matching.

König's theorem: in a bipartite graph the size of the maximum matching equals the size of the minimum vertex cover (the smallest set of vertices touching every edge). Also, the maximum independent set has size V minus the maximum matching. These dualities solve problems such as the minimum number of rooks or guards that cover all cells.

Hall's marriage theorem: a matching that saturates the left side exists exactly when every subset S of left vertices has at least |S| neighbours. A quick check: if two workers can only do the same single job, no perfect matching exists.

Applications:

- Job and worker assignment, course scheduling, kidney exchange, stable assignment variants
- Domino tiling of boards with holes (cells coloured like a chessboard)
- Minimum path cover in a DAG (V minus the maximum matching of the split graph)
- Maximum independent set and minimum vertex cover in bipartite graphs
- Weighted assignment: the Hungarian algorithm finds a minimum cost perfect matching in O(V cubed)
- Stable marriage uses a different (Gale-Shapley) algorithm with preferences

Pitfalls: reusing the visited set across attempts (produces wrong results), forgetting that edges must go between sides only, applying it to non-bipartite graphs (needs Edmonds' blossom algorithm) and confusing the maximum matching with the maximum flow in a graph with other capacities.

Testing: compare Kuhn's algorithm with the brute force over assignments on small graphs and with the flow reduction.

## explain
1. Represent the allowed pairs as adjacency lists from the left side.
2. For each left vertex, try to find an augmenting path with a depth first search and a fresh visited set.
3. If the target on the right is free, or its partner can be rematched, assign it.
4. Count the successful attempts as the matching size.
5. Read the pairs from the match array.
6. Check the result against a brute force or the flow formulation.

## example
The Python program matches the three workers to jobs with Kuhn's algorithm, prints the pairs and size 3, checks the matching size against a brute-force maximum on 100 random graphs. The JavaScript program computes the maximum number of dominoes: 6 on a 3 by 4 board and 2 on a board with holes.

## real
Assignment of drivers to rides, residents to hospitals and tasks to servers uses matching algorithms, and domino tiling counts use bipartite matching.

## pros
- Augmenting paths give a simple exact algorithm
- Hopcroft-Karp scales to large graphs
- König's theorem links matching with covers

## cons
- Kuhn's algorithm is O(V E) in the worst case
- General graphs need the blossom algorithm
- Weighted versions need the Hungarian algorithm

## uses
- Worker and task assignment
- Domino tilings
- Minimum vertex cover in bipartite graphs
- Path covers in DAGs

## mistakes
- Sharing the visited set between attempts
- Allowing edges within one side
- Applying the algorithm to a non-bipartite graph
- Confusing maximal and maximum matchings

## interview
**Q:** What is an augmenting path?
**A:** An alternating path that starts and ends at unmatched vertices; flipping its edges between matched and unmatched increases the matching size by one, and a matching is maximum exactly when no augmenting path exists.

**Q:** How can maximum bipartite matching be solved with maximum flow?
**A:** Add a source connected to all left vertices and a sink connected from all right vertices, give every edge capacity one, and the maximum flow equals the size of the maximum matching.

**Q:** What does König's theorem state?
**A:** In a bipartite graph the size of a maximum matching equals the size of a minimum vertex cover.

## summary
Maximum bipartite matching is found by repeatedly flipping augmenting paths (Kuhn's algorithm) or by Hopcroft-Karp and flow, and König's theorem links it to vertex covers. Keep the visited set fresh for every attempt.

## codenote
The Python sample implements Kuhn's algorithm and verifies it. The JavaScript sample counts dominoes on a board.

## code
### python
```python
import random

def kuhn(left_count, adjacent):
    match_right = {}

    def try_assign(u, seen):
        for v in adjacent[u]:
            if v in seen:
                continue
            seen.add(v)
            if v not in match_right or try_assign(match_right[v], seen):
                match_right[v] = u
                return True
        return False

    size = sum(try_assign(u, set()) for u in range(left_count))
    return size, sorted((u, v) for v, u in match_right.items())

workers = {0: ["J1", "J2"], 1: ["J1"], 2: ["J2", "J3"]}
print(kuhn(3, workers))

rng = random.Random(4)
ok = True
for _ in range(100):
    left, right = rng.randint(1, 4), rng.randint(1, 4)
    adjacent = {u: [v for v in range(right) if rng.random() < 0.5] for u in range(left)}
    best = 0
    options = [[None] + adjacent[u] for u in range(left)]

    def search(index, used, count):
        global best
        if index == left:
            best = max(best, count)
            return
        for choice in options[index]:
            if choice is None:
                search(index + 1, used, count)
            elif choice not in used:
                search(index + 1, used | {choice}, count + 1)

    search(0, frozenset(), 0)
    ok = ok and kuhn(left, adjacent)[0] == best
print(ok)
```
Output:
```text
(3, [(0, 'J2'), (1, 'J1'), (2, 'J3')])
True
```
### javascript
```javascript
function maxDominoes(board) {
  const rows = board.length;
  const cols = board[0].length;
  const matchOf = new Map();
  const neighbours = (r, c) => [[1, 0], [-1, 0], [0, 1], [0, -1]]
    .map(([dr, dc]) => [r + dr, c + dc])
    .filter(([nr, nc]) => nr >= 0 && nc >= 0 && nr < rows && nc < cols && board[nr][nc] === ".");
  const assign = (cell, seen) => {
    const [r, c] = cell;
    for (const [nr, nc] of neighbours(r, c)) {
      const key = nr + "," + nc;
      if (seen.has(key)) continue;
      seen.add(key);
      if (!matchOf.has(key) || assign(matchOf.get(key), seen)) {
        matchOf.set(key, cell);
        return true;
      }
    }
    return false;
  };
  let count = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (board[r][c] === "." && (r + c) % 2 === 0 && assign([r, c], new Set())) count++;
    }
  }
  return count;
}

console.log(maxDominoes(["....", "....", "...."].map((row) => [...row])), maxDominoes(["..#", ".#.", "#.."].map((row) => [...row])));
```
Output:
```text
6 2
```

## quiz
1. What is a matching?
   - [ ] A set of vertices
   - [x] A set of edges with no shared endpoint
   - [ ] A cycle
   - [ ] A spanning tree
   > Each vertex is used at most once.
2. What does an augmenting path do?
   - [ ] Removes an edge
   - [x] Increases the matching size by one when its edges are flipped
   - [ ] Splits the graph
   - [ ] Finds a cycle
   > It starts and ends at free vertices.
3. What does König's theorem say?
   - [ ] Matchings are unique
   - [x] In a bipartite graph the maximum matching size equals the minimum vertex cover size
   - [ ] Every graph is bipartite
   - [ ] Flows are integers
   > It links matchings with covers.
4. Why must the visited set be fresh for each left vertex?
   - [ ] To save memory
   - [x] Otherwise earlier attempts block right vertices that this attempt could use
   - [ ] To detect cycles
   - [ ] To sort the vertices
   > Each attempt is a separate augmenting path search.

# Euler Path and Circuit
kind: algorithm
time: O(V + E) to check the degree conditions and to construct an Euler circuit or path with Hierholzer's algorithm, since each edge is traversed exactly once.
space: O(V + E) for the adjacency lists, the pointer array and the output path.

## intro
An Euler path walks along every edge of a graph exactly once; an Euler circuit does so and returns to its start. The question began with the bridges of Königsberg in 1736 and founded graph theory. Unlike the Hamiltonian problem of visiting every vertex, the Euler problem has a simple degree test and a linear time construction.

## theory
Existence conditions (undirected graphs, ignoring isolated vertices, with all edges in one connected component):

- Euler circuit exists if and only if every vertex has even degree
- Euler path (not closed) exists if and only if exactly two vertices have odd degree; the path must start at one and end at the other
- Königsberg: the four land masses had degrees 5, 3, 3 and 3, all odd, so no Euler path exists

Directed graphs (edges must be in one weakly connected component):

- Euler circuit exists if and only if every vertex has in-degree equal to out-degree
- Euler path exists if and only if at most one vertex has out-degree minus in-degree equal to 1 (the start), at most one has in-degree minus out-degree equal to 1 (the end), and all others are balanced

Hierholzer's algorithm builds the path in O(V + E):

- Pick a start vertex (an odd degree vertex for a path, any vertex with edges for a circuit)
- Follow unused edges, marking them used, until you get stuck; you are stuck at the start for a circuit
- Use a stack: push the start; while the stack is not empty, look at the top vertex u; if it has an unused edge (u, v), mark it used and push v; otherwise pop u and append it to the result
- Reverse the result to obtain the Euler path

The pop order produces a path that splices sub-circuits into the main trail automatically. For the graph with edges A-B, B-C, C-A, C-D, D-E, E-C (two triangles sharing vertex C) every degree is even, and Hierholzer's algorithm produces a circuit such as A, B, C, D, E, C, A that uses each of the six edges once.

Checking the path: a candidate is an Euler path if it uses E edges, each exactly once, in sequence.

Related problems:

- Reconstruct itinerary (flight tickets): the directed Euler path that is lexicographically smallest, found by Hierholzer's algorithm with neighbours sorted. For the tickets JFK→MUC, MUC→LHR, LHR→SFO, SFO→SJC the itinerary is JFK, MUC, LHR, SFO, SJC.
- De Bruijn sequences: an Euler circuit in the de Bruijn graph gives a cyclic string containing every possible k-length word exactly once; the sequence for binary words of length 3 is 00010111 (cyclic)
- Chinese postman problem: find the shortest closed walk that covers every edge at least once; if the graph has odd vertices, pair them up by shortest paths and duplicate those paths, which can be done with matching
- Cracking safes and DNA fragment assembly use Euler paths in overlap graphs
- Drawing a figure without lifting the pen

Hamiltonian versus Eulerian: the Euler problem visits every edge once and is solvable in linear time; the Hamilton problem visits every vertex once and is NP-complete.

Pitfalls: forgetting that all edges must lie in one connected component, mistaking vertices of degree zero for violations, choosing an even degree start for an Euler path (must start at an odd vertex), mixing up directed and undirected degree rules and building the path in the wrong order (the result of Hierholzer's algorithm is reversed).

Testing: validate the produced path uses each edge exactly once; compare existence with the degree conditions on random graphs.

## explain
1. Check that all edges lie in one connected component.
2. Count odd degree vertices (or in-degree and out-degree differences).
3. Choose the start vertex: an odd one for a path, any one for a circuit.
4. Run Hierholzer's algorithm with a stack, marking edges used.
5. Reverse the collected vertices to obtain the path.
6. Verify that every edge appears exactly once.

## example
The Python program finds an Euler circuit for the two triangles sharing a vertex, prints it with its length 7 vertices for 6 edges, finds an Euler path for a graph with two odd vertices and verifies both. The JavaScript program reconstructs a lexicographically smallest flight itinerary.

## real
Snow plough and mail routes, DNA sequence assembly, circuit board drilling paths and itinerary reconstruction use Euler paths.

## pros
- A simple degree test decides existence
- Linear time construction
- Applies to directed and undirected graphs

## cons
- Requires all edges in one connected component
- The path is not unique
- Weighted versions (Chinese postman) are harder

## uses
- Itinerary reconstruction
- De Bruijn sequences
- Route inspection problems
- Sequence assembly in bioinformatics

## mistakes
- Starting an Euler path at an even degree vertex
- Ignoring disconnected edges
- Using undirected rules for directed graphs
- Forgetting to reverse the Hierholzer output

## interview
**Q:** When does an undirected graph have an Euler circuit?
**A:** When all edges belong to one connected component and every vertex has even degree.

**Q:** How does Hierholzer's algorithm construct the path?
**A:** It walks along unused edges using a stack, and when a vertex has no unused edges left it is popped into the result, so sub-circuits are spliced in; reversing the result gives the Euler path in O(E).

**Q:** How does an Euler path differ from a Hamiltonian path?
**A:** An Euler path uses every edge exactly once and is found in linear time, while a Hamiltonian path visits every vertex exactly once and the problem is NP-complete.

## summary
Euler paths and circuits exist by simple degree conditions and are built in linear time by Hierholzer's algorithm. They solve itinerary reconstruction, de Bruijn sequences and route inspection problems.

## codenote
The Python sample builds and verifies Euler walks. The JavaScript sample reconstructs an itinerary.

## code
### python
```python
from collections import defaultdict

def euler_walk(edges, start):
    graph = defaultdict(list)
    for index, (u, v) in enumerate(edges):
        graph[u].append((v, index))
        graph[v].append((u, index))
    used, stack, walk = set(), [start], []
    while stack:
        node = stack[-1]
        while graph[node] and graph[node][-1][1] in used:
            graph[node].pop()
        if graph[node]:
            nxt, index = graph[node].pop()
            used.add(index)
            stack.append(nxt)
        else:
            walk.append(stack.pop())
    return walk[::-1]

def valid(edges, walk):
    steps = [tuple(sorted(pair)) for pair in zip(walk, walk[1:])]
    return sorted(steps) == sorted(tuple(sorted(e)) for e in edges)

triangles = [("A", "B"), ("B", "C"), ("C", "A"), ("C", "D"), ("D", "E"), ("E", "C")]
circuit = euler_walk(triangles, "A")
print(circuit, len(circuit), valid(triangles, circuit), circuit[0] == circuit[-1])
path_edges = [("A", "B"), ("B", "C"), ("C", "A"), ("C", "D")]
degrees = defaultdict(int)
for u, v in path_edges:
    degrees[u] += 1
    degrees[v] += 1
odd = sorted(v for v, d in degrees.items() if d % 2)
path = euler_walk(path_edges, odd[0])
print(odd, path, valid(path_edges, path))
```
Output:
```text
['A', 'C', 'E', 'D', 'C', 'B', 'A'] 7 True True
['C', 'D'] ['C', 'A', 'B', 'C', 'D'] True
```
### javascript
```javascript
function findItinerary(tickets) {
  const graph = {};
  for (const [from, to] of tickets) (graph[from] ??= []).push(to);
  for (const from of Object.keys(graph)) graph[from].sort().reverse();
  const route = [];
  const visit = (airport) => {
    while (graph[airport] && graph[airport].length) visit(graph[airport].pop());
    route.push(airport);
  };
  visit("JFK");
  return route.reverse();
}

console.log(findItinerary([["MUC", "LHR"], ["JFK", "MUC"], ["SFO", "SJC"], ["LHR", "SFO"]]).join(" "));
console.log(findItinerary([["JFK", "SFO"], ["JFK", "ATL"], ["SFO", "ATL"], ["ATL", "JFK"], ["ATL", "SFO"]]).join(" "));
```
Output:
```text
JFK MUC LHR SFO SJC
JFK ATL JFK SFO ATL SFO
```

## quiz
1. When does an undirected connected graph have an Euler circuit?
   - [ ] When it has a cycle
   - [x] When every vertex has even degree
   - [ ] When it is a tree
   - [ ] When it has two odd vertices
   > Each visit uses two edges at a vertex.
2. How many odd degree vertices does a graph with an Euler path but no circuit have?
   - [ ] None
   - [x] Exactly two
   - [ ] Exactly four
   - [ ] One
   > The path starts at one and ends at the other.
3. What is the running time of Hierholzer's algorithm?
   - [ ] O(V squared)
   - [x] O(V + E)
   - [ ] O(E squared)
   - [ ] Exponential
   > Each edge is used exactly once.
4. Which problem is NP-complete?
   - [ ] Finding an Euler circuit
   - [x] Finding a Hamiltonian cycle
   - [ ] Checking degrees
   - [ ] Finding a spanning tree
   > Hamiltonian problems visit vertices, not edges.

# Hamilton Path Intro
kind: algorithm
time: O(n!) for the naive search over orderings, O(n · 2^n) states and O(n squared · 2^n) time for the bitmask dynamic programming (Held-Karp style), and exponential in general since the problem is NP-complete.
space: O(n · 2^n) for the dynamic programming table over subsets and end vertices; O(n) for the backtracking recursion.

## intro
A Hamiltonian path visits every vertex of a graph exactly once; a Hamiltonian cycle also returns to the start. It sounds like the Euler problem with vertices instead of edges, but the change makes it NP-complete: no known algorithm avoids exponential time in the worst case. This lesson shows how to search for such paths for small graphs and which sufficient conditions exist.

## theory
Definitions: a Hamiltonian path in a graph with n vertices is a path of n − 1 edges visiting every vertex once; a Hamiltonian cycle has n edges and closes up. A graph with a Hamiltonian cycle is called Hamiltonian. The travelling salesman problem asks for the cheapest Hamiltonian cycle in a weighted complete graph.

Difficulty: the decision problem is NP-complete (Karp, 1972). There is no simple degree test like the Euler one. Some conditions help:

- Necessary conditions: the graph must be connected; a vertex of degree one can only be an end of a path; removing k vertices cannot leave more than k components for a Hamiltonian cycle
- Sufficient (Dirac's theorem): if every vertex has degree at least n / 2 (n at least 3), a Hamiltonian cycle exists
- Ore's theorem: if the degrees of every pair of non-adjacent vertices add up to at least n, the graph is Hamiltonian
- Complete graphs, cycles and hypercubes are Hamiltonian; the Petersen graph famously has a Hamiltonian path but no Hamiltonian cycle

Backtracking search: extend a path one vertex at a time, trying neighbours not yet used; backtrack when stuck; succeed when n vertices are on the path (and for a cycle, the last is adjacent to the first). Prune with degree and connectivity checks, order the neighbours by fewest options (Warnsdorff's rule for knight tours). Worst case O(n!), but practical for graphs up to about 20 to 30 vertices with pruning.

Bitmask dynamic programming: let `dp[mask][v]` be true if there is a path that visits exactly the vertices in `mask` and ends at v. Initialise `dp[1 << v][v] = true` for every v. Transition: `dp[mask | (1 << w)][w]` is true if `dp[mask][v]` is true, w is not in mask and v-w is an edge. A Hamiltonian path exists if `dp[full][v]` is true for some v. Time O(2^n · n^2), memory O(2^n · n), practical up to about n = 20 to 23, and with bitsets for the end vertices O(2^n · n).

Example: the path graph 0-1-2-3 has exactly one Hamiltonian path up to reversal (0, 1, 2, 3) and no Hamiltonian cycle. The 4-cycle 0-1-2-3-0 has a Hamiltonian cycle and 8 directed Hamiltonian paths. A star with centre 0 and leaves 1, 2, 3 has no Hamiltonian path, because the centre would have to be visited between two leaves, and the third leaf cannot be reached. The complete graph on 4 vertices has 24 directed Hamiltonian paths (4 factorial).

Counting Hamiltonian paths: the same dynamic programming with counts instead of booleans; for the complete graph K_n the answer is n!.

Related problems:

- Travelling salesman problem: minimum cost Hamiltonian cycle; Held-Karp O(n^2 2^n); approximations (Christofides for metric instances within 1.5 of optimal; MST doubling within 2)
- Knight's tour on a chessboard: Hamiltonian path on the knight graph; Warnsdorff's heuristic solves it quickly
- Gray codes: Hamiltonian cycles in hypercubes
- Hamiltonian paths in DAGs: solvable in linear time (the topological order must be a path)
- Longest path, which generalises the Hamiltonian path
- Euler versus Hamilton: edges versus vertices, linear versus NP-complete

Pitfalls: confusing Hamiltonian with Eulerian, forgetting to check that the last vertex connects back for a cycle, double counting reversed paths and cyclic rotations when counting cycles, and using adjacency matrices without bitmask operations in large searches.

Testing: compare backtracking and bitmask results on random small graphs, and check with known graphs (cycles, paths, complete graphs, stars).

## explain
1. Represent the graph as adjacency lists or bitmasks.
2. For small graphs, backtrack from every start vertex, extending the path with unused neighbours.
3. Stop when the path has n vertices (and check the closing edge for cycles).
4. For slightly larger graphs use the subset dynamic programming table.
5. Use necessary conditions to rule out impossible graphs quickly.
6. Compare both methods on random graphs.

## example
The Python program tests a path, a 4-cycle, a star and the complete graph on 4 vertices with backtracking and bitmask dynamic programming, printing whether a Hamiltonian path exists and the number of directed paths: 2, 8, 0 and 24 for the four graphs, and confirms agreement on 100 random graphs. The JavaScript program checks Dirac's condition for several graphs.

## real
Logistics planning, circuit board drilling, genome assembly and puzzle solving involve Hamiltonian paths or their weighted version, the travelling salesman problem.

## pros
- Bitmask dynamic programming beats factorial search
- Sufficient conditions give quick yes answers for dense graphs
- Heuristics solve many practical instances

## cons
- NP-complete in general
- Exponential memory for the dynamic programming
- No simple exact test like the Euler degrees

## uses
- Route planning that must visit every site once
- Knight's tour and puzzle solving
- Gray code construction
- Understanding NP-completeness

## mistakes
- Confusing Hamiltonian paths with Euler paths
- Forgetting to check the closing edge of a cycle
- Counting reversed paths as the same without noting it
- Running the factorial search on graphs with more than about 12 vertices without pruning

## interview
**Q:** What is the difference between Euler and Hamiltonian paths?
**A:** An Euler path uses every edge exactly once and can be found in linear time with a degree test, while a Hamiltonian path visits every vertex exactly once and the problem is NP-complete.

**Q:** How can small instances be solved exactly?
**A:** With backtracking and pruning, or with dynamic programming over subsets where dp[mask][v] says whether a path covering mask can end at v, in O(2^n n squared) time.

**Q:** What does Dirac's theorem guarantee?
**A:** If every vertex of a graph with at least three vertices has degree at least n over two, the graph has a Hamiltonian cycle.

## summary
Hamiltonian paths visit every vertex once and are NP-complete, so small graphs use backtracking or subset dynamic programming and dense graphs can be certified by Dirac's or Ore's conditions. Do not confuse them with Euler paths.

## codenote
The Python sample compares backtracking with subset dynamic programming. The JavaScript sample checks Dirac's condition.

## code
### python
```python
import random

def backtrack(n, edges):
    adjacent = {v: set() for v in range(n)}
    for u, v in edges:
        adjacent[u].add(v)
        adjacent[v].add(u)

    def extend(path, used):
        if len(path) == n:
            return 1
        return sum(extend(path + [w], used | {w}) for w in adjacent[path[-1]] if w not in used)

    return sum(extend([s], {s}) for s in range(n))

def bitmask(n, edges):
    adjacent = [0] * n
    for u, v in edges:
        adjacent[u] |= 1 << v
        adjacent[v] |= 1 << u
    ways = [[0] * n for _ in range(1 << n)]
    for v in range(n):
        ways[1 << v][v] = 1
    for mask in range(1 << n):
        for v in range(n):
            if ways[mask][v]:
                for w in range(n):
                    if adjacent[v] >> w & 1 and not mask >> w & 1:
                        ways[mask | 1 << w][w] += ways[mask][v]
    return sum(ways[(1 << n) - 1])

graphs = {
    "path": (4, [(0, 1), (1, 2), (2, 3)]),
    "cycle": (4, [(0, 1), (1, 2), (2, 3), (3, 0)]),
    "star": (4, [(0, 1), (0, 2), (0, 3)]),
    "complete": (4, [(a, b) for a in range(4) for b in range(a + 1, 4)]),
}
for name, (n, edges) in graphs.items():
    print(name, backtrack(n, edges), bitmask(n, edges))

rng = random.Random(6)
ok = True
for _ in range(100):
    n = rng.randint(2, 6)
    edges = [(a, b) for a in range(n) for b in range(a + 1, n) if rng.random() < 0.5]
    ok = ok and backtrack(n, edges) == bitmask(n, edges)
print(ok)
```
Output:
```text
path 2 2
cycle 8 8
star 0 0
complete 24 24
True
```
### javascript
```javascript
function satisfiesDirac(n, edges) {
  const degree = new Array(n).fill(0);
  for (const [u, v] of edges) {
    degree[u]++;
    degree[v]++;
  }
  return n >= 3 && degree.every((d) => d >= n / 2);
}

const complete = (n) => Array.from({ length: n * n }, (_, i) => [Math.floor(i / n), i % n]).filter(([a, b]) => a < b);
console.log(satisfiesDirac(5, complete(5)), satisfiesDirac(4, [[0, 1], [1, 2], [2, 3], [3, 0]]), satisfiesDirac(5, [[0, 1], [1, 2], [2, 3], [3, 4], [4, 0]]));
```
Output:
```text
true true false
```

## quiz
1. What does a Hamiltonian path visit exactly once?
   - [ ] Every edge
   - [x] Every vertex
   - [ ] Every cycle
   - [ ] Every component
   > Euler paths use every edge once.
2. What is the complexity class of deciding whether a graph has a Hamiltonian cycle?
   - [ ] Linear time
   - [x] NP-complete
   - [ ] Polynomial time with Dijkstra
   - [ ] Constant time
   > No known polynomial algorithm exists.
3. What does the bitmask dynamic programming store?
   - [ ] Edge weights
   - [x] Whether a path covering a subset of vertices can end at a given vertex
   - [ ] Component sizes
   - [ ] Vertex degrees only
   > The subset records which vertices are visited.
4. What does Dirac's theorem give?
   - [ ] A necessary condition for Euler paths
   - [x] A sufficient condition: minimum degree at least n over two guarantees a Hamiltonian cycle
   - [ ] A shortest path
   - [ ] A flow value
   > Dense graphs are always Hamiltonian.

# Advanced Graph Interview Patterns
kind: concept
time: Not an algorithmic topic — this lesson reviews patterns. Spanning tree problems cost O(E log V), flow and matching O(V E) or better, and Euler walks O(V + E) once the right model is chosen.
space: Not an algorithmic topic — the memory is O(V + E) for the graph and O(V) for auxiliary arrays, which is worth stating in an interview.

## intro
Advanced graph questions combine ideas from the earlier lessons: spanning trees for connecting things cheaply, flow and matching for assignment, Euler walks for covering edges and bitmask search for small hard problems. The recognition step is the hard part, so this lesson lists the trigger phrases and the standard reductions.

## theory
Pattern 1: connect everything at minimum cost (spanning tree). Trigger: connect all cities, wires, pipes, points at minimum total cost; minimum number of cables with costs. Solve with Kruskal's or Prim's algorithm. For points in the plane with Manhattan distance, Prim's algorithm on the complete graph in O(n squared) avoids building all edges. For the points (0,0), (2,2), (3,10), (5,2), (7,0) the minimum cost to connect them is 20.

Pattern 2: bottleneck and clustering. Trigger: minimise the longest cable, group points into k clusters with maximum separation. MST plus removing the k − 1 heaviest edges, or Kruskal's algorithm stopped at k components.

Pattern 3: critical and pseudo-critical edges. Edges that appear in every MST (critical) or in some MST (pseudo-critical): for each edge, compute the MST weight without it (if larger, critical) and the MST weight when forcing it (if equal to the minimum, it is in some MST).

Pattern 4: assignment and matching. Trigger: assign workers to tasks with compatibility, pair up items, domino tilings, minimum path cover, minimum number of lines to cover points. Solve with Kuhn's algorithm, Hopcroft-Karp or max flow; König's theorem turns minimum vertex cover and maximum independent set questions in bipartite graphs into matching.

Pattern 5: flows and cuts. Trigger: maximum number of disjoint paths, capacity, bandwidth, separating two sets at minimum cost, project selection, image foreground and background. Max-flow with unit or given capacities; min cut by the final residual reachability.

Pattern 6: use every edge once. Trigger: itinerary reconstruction, draw without lifting the pen, rearrange pieces so adjacent ends match, de Bruijn sequences. Euler path via Hierholzer's algorithm. For the tickets JFK→MUC, MUC→LHR, LHR→SFO, SFO→SJC the itinerary is JFK, MUC, LHR, SFO, SJC.

Pattern 7: use every vertex once, small n. Trigger: visit all nodes, tour, n at most 20. Bitmask dynamic programming (Held-Karp) over subsets, or backtracking with pruning; for larger n only heuristics and approximations.

Pattern 8: shortest path and ordering patterns from the previous modules combined with the above: minimum cost with a constraint (state expanded Dijkstra), strongly connected components for condensation then dynamic programming on the DAG, and union-find with offline queries.

Pattern 9: reduce to bipartite or two-colouring. Trigger: split into two groups without conflicts, odd cycle, chessboard colouring arguments. Bipartite check, then matching or flow on the bipartite graph.

How to answer in an interview:

- Name the model: spanning tree, matching, flow, Euler walk, subset dynamic programming
- State the reduction in one sentence (for example "add a source and sink with unit capacities")
- Give the algorithm and the complexity
- Mention special cases: disconnected graphs, ties, negative weights, duplicate edges
- Offer the check that proves the answer (cut equals flow, degrees for Euler, V − 1 edges for a tree)

Common traps: using shortest path algorithms for spanning tree problems, forgetting that matching on a non-bipartite graph needs a different algorithm, applying the Euler degree test without checking connectivity, exponential search on large n and building an O(n squared) edge list when Prim's algorithm on the implicit complete graph suffices.

Edge cases: a single vertex, a disconnected graph (spanning forest or infeasible), parallel edges and self loops, and equal weights.

## explain
1. Read the problem for trigger words: connect, assign, route, cover each edge, visit each vertex.
2. Map it to a model: spanning tree, matching, flow, Euler walk or subset search.
3. State the reduction and build the graph.
4. Choose the algorithm and give its complexity.
5. Handle disconnected inputs, ties and degenerate cases.
6. Verify with a property such as V − 1 edges, equality of flow and cut, or edge counts.

## example
The Python program solves the minimum cost to connect points with Prim's algorithm on the implicit complete graph and prints 20 for the sample points, then lists the critical and pseudo-critical edges of a small graph. The JavaScript program reconstructs the flight itinerary with Hierholzer's algorithm.

## real
Network design, logistics, scheduling and bioinformatics tools reduce to these models, so the pattern recognition is the practical skill.

## pros
- A small set of models covers many problems
- Each model has a clear algorithm and certificate
- Reductions let you reuse library code

## cons
- Recognising the right model takes practice
- Some reductions are non-obvious
- Exponential problems need size limits

## uses
- Preparing for advanced graph interviews
- Choosing between spanning tree, flow and matching models
- Designing networks and assignments
- Reviewing solutions for correct reductions

## mistakes
- Treating a spanning tree problem as shortest paths
- Applying bipartite matching to a general graph
- Ignoring connectivity in the Euler conditions
- Running exponential search on large inputs

## interview
**Q:** How do you find the minimum cost to connect n points in the plane?
**A:** Treat every pair as an edge with its distance as weight and run Prim's algorithm on the implicit complete graph in O(n squared), or Kruskal's algorithm on all pairs in O(n squared log n).

**Q:** How do you recognise a matching problem?
**A:** When items from two groups must be paired with compatibility constraints and each item is used at most once; model it as a bipartite graph and solve with augmenting paths or maximum flow.

**Q:** How would you reconstruct an itinerary from tickets?
**A:** Model the airports as vertices and tickets as directed edges; the itinerary is an Euler path, found with Hierholzer's algorithm visiting neighbours in lexicographic order.

## summary
Advanced graph problems reduce to spanning trees, bottleneck and clustering, matching and flow, Euler walks or subset search. Name the model, state the reduction and mention the certificate and complexity.

## codenote
The Python sample solves a connection problem and classifies edges. The JavaScript sample reconstructs an itinerary.

## code
### python
```python
def connect_points(points):
    n = len(points)
    cost = lambda a, b: abs(points[a][0] - points[b][0]) + abs(points[a][1] - points[b][1])
    in_tree = [False] * n
    key = [float("inf")] * n
    key[0] = 0
    total = 0
    for _ in range(n):
        u = min((v for v in range(n) if not in_tree[v]), key=lambda v: key[v])
        in_tree[u] = True
        total += key[u]
        for v in range(n):
            if not in_tree[v]:
                key[v] = min(key[v], cost(u, v))
    return total

print(connect_points([(0, 0), (2, 2), (3, 10), (5, 2), (7, 0)]))

def mst_weight(n, edges, banned=None, forced=None):
    parent = list(range(n))

    def find(x):
        while parent[x] != x:
            x = parent[x]
        return x

    total, used = 0, 0
    if forced is not None:
        u, v, w = forced
        parent[find(u)] = find(v)
        total, used = w, 1
    for edge in sorted(edges, key=lambda e: e[2]):
        if edge == banned or edge == forced:
            continue
        u, v, w = edge
        if find(u) != find(v):
            parent[find(u)] = find(v)
            total += w
            used += 1
    return total if used == n - 1 else float("inf")

edges = [(0, 1, 1), (1, 2, 1), (2, 3, 2), (0, 3, 2), (0, 4, 3), (3, 4, 3), (1, 4, 6)]
best = mst_weight(5, edges)
critical = [e for e in edges if mst_weight(5, edges, banned=e) > best]
pseudo = [e for e in edges if e not in critical and mst_weight(5, edges, forced=e) == best]
print(best, critical, pseudo)
```
Output:
```text
20
7 [(0, 1, 1), (1, 2, 1)] [(2, 3, 2), (0, 3, 2), (0, 4, 3), (3, 4, 3)]
```
### javascript
```javascript
function itinerary(tickets) {
  const graph = {};
  for (const [from, to] of tickets) (graph[from] ??= []).push(to);
  for (const key of Object.keys(graph)) graph[key].sort().reverse();
  const route = [];
  const visit = (airport) => {
    while (graph[airport]?.length) visit(graph[airport].pop());
    route.push(airport);
  };
  visit("JFK");
  return route.reverse().join(" ");
}

console.log(itinerary([["JFK", "MUC"], ["MUC", "LHR"], ["LHR", "SFO"], ["SFO", "SJC"]]));
```
Output:
```text
JFK MUC LHR SFO SJC
```

## quiz
1. Which model fits connecting n points at minimum total cost?
   - [ ] Shortest path
   - [x] Minimum spanning tree
   - [ ] Maximum flow
   - [ ] Topological sort
   > The goal is to connect everything cheaply.
2. Which model fits pairing workers with compatible tasks?
   - [ ] Spanning tree
   - [x] Bipartite matching or maximum flow
   - [ ] Euler path
   - [ ] Union-find
   > Each worker and task is used at most once.
3. What reconstructs an itinerary from tickets?
   - [ ] A minimum spanning tree
   - [x] An Euler path found with Hierholzer's algorithm
   - [ ] A maximum matching
   - [ ] A bitmask search
   > Every ticket is used exactly once.
4. When is subset dynamic programming appropriate?
   - [ ] For graphs with millions of vertices
   - [x] For visiting every vertex once when n is at most about 20
   - [ ] For spanning trees
   - [ ] For acyclic graphs only
   > The table has 2 to the power n states.
