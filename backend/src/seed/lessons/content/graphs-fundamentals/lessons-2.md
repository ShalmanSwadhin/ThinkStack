# DAG Properties
kind: algorithm
time: O(V + E) to compute a topological order with Kahn's algorithm, and O(V + E) for dynamic programming along that order, such as the longest path or the number of paths.
space: O(V + E) for the graph plus O(V) for in-degree counts, the queue and the DP table.

## intro
A directed acyclic graph, or DAG, is a directed graph with no directed cycles. Task dependencies, course prerequisites, build systems and spreadsheet formulas are all DAGs, and the absence of cycles gives them a powerful property: the vertices can be laid out in a line so that every edge points forward. That ordering turns hard looking path problems into simple dynamic programming.

## theory
Key properties:

- A directed graph is a DAG exactly when it has a topological order: a listing of the vertices in which every edge goes from an earlier to a later vertex
- Every DAG has at least one source (in-degree zero) and at least one sink (out-degree zero); removing a source leaves a DAG
- A DAG can have several valid topological orders; the order is unique exactly when there is a directed path through all the vertices
- A DAG with V vertices has at most V(V − 1) / 2 edges (the transitive tournament), and no vertex can reach itself
- The longest path in a DAG is finite and can be computed in linear time, unlike in general graphs where it is NP-hard
- Strongly connected components of any directed graph can be contracted to form a DAG (the condensation)

Kahn's algorithm for topological order:

- Compute the in-degree of every vertex and put the vertices with in-degree zero in a queue
- Repeatedly remove a vertex from the queue, append it to the order, and decrease the in-degree of each of its out-neighbours; neighbours reaching zero join the queue
- If the order contains all V vertices the graph is a DAG; if fewer, the remaining vertices lie on or behind a cycle

For the tasks A → B, A → C, B → D, C → D and D → E (A before B and C, both before D, then E) the order is A, B, C, D, E (or A, C, B, D, E). Adding the edge E → A creates a cycle, and Kahn's algorithm stalls at once with an empty queue and no vertex removed.

Dynamic programming over a topological order:

- Longest path: process vertices in topological order; `longest[v] = max(longest[u] + w(u, v))` over incoming edges; with unit weights the answer for the example is 3 edges (A → B → D → E). This is the critical path method in project scheduling: the longest path through the task graph is the minimum project duration.
- Shortest path: the same recurrence with minimum, in O(V + E), even with negative weights (no Dijkstra needed)
- Number of paths: `paths[v] = sum of paths[u]` over incoming edges. From A to E in the example there are 2 paths (through B or through C) and the count from A to each vertex is A 1, B 1, C 1, D 2, E 2.
- Reachability and transitive closure by propagating sets or bitsets in order
- Counting topological orders is hard in general (it counts linear extensions), but the count for tiny DAGs can be done with a bitmask DP over subsets

Verification and uses:

- Cycle detection in directed graphs: a failed topological sort proves a cycle
- Build systems (Make, Bazel), package managers and spreadsheets order their work by a topological sort of dependencies
- Course scheduling: can all courses be finished, and in what order
- Data pipelines and workflow engines (Airflow) define tasks as DAGs
- Version control: the commit history is a DAG
- Dynamic programming itself: the dependency graph between subproblems must be a DAG

Layering: grouping vertices by the length of the longest path from any source gives levels, and all vertices at the same level can run in parallel; the number of levels is the minimum number of parallel rounds.

Alternative order: a depth first search that appends vertices after exploring their descendants (reverse postorder) also yields a topological order and detects cycles with the three colour method.

Pitfalls: applying topological sort to an undirected graph, forgetting that several orders exist (tests should check validity, not equality), counting paths with overflow on large DAGs (use big integers or modulo) and mistakes in initialising the DP for vertices without incoming edges.

## explain
1. Compute the in-degree of every vertex.
2. Put all vertices with in-degree zero in a queue.
3. Remove a vertex, append it to the order and decrease its neighbours' in-degrees, queueing those that reach zero.
4. If the order has fewer than V vertices, report a cycle.
5. Process the vertices in that order to compute longest paths or path counts.
6. Verify that every edge goes from an earlier to a later position.

## example
The Python program computes the order A, B, C, D, E for the sample task graph with Kahn's algorithm, the longest path length 3, the numbers of paths from A (1, 1, 1, 2, 2) and detects the cycle after adding the edge E → A. The JavaScript program counts the paths from the source to the sink in a layered DAG by dynamic programming.

## real
Build tools order compilation by dependencies, workflow schedulers run jobs as DAGs, and project managers use the critical path of the task DAG to estimate the shortest completion time.

## pros
- A topological order exists exactly when there is no cycle
- Linear time dynamic programming on paths
- Natural model for dependencies and workflows

## cons
- Several orders exist, so results must be tested by validity
- Only applies to directed graphs without cycles
- Path counts grow quickly and can overflow

## uses
- Ordering tasks with dependencies
- Critical path and longest path computations
- Counting paths between vertices
- Detecting cycles in dependency graphs

## mistakes
- Using topological sort on undirected graphs
- Comparing the order with a single expected sequence
- Ignoring leftover vertices as a sign of a cycle
- Allowing integer overflow when counting paths

## interview
**Q:** What is a topological order?
**A:** A linear ordering of the vertices of a directed graph such that every edge goes from an earlier to a later vertex; it exists exactly when the graph has no directed cycle.

**Q:** How does Kahn's algorithm detect a cycle?
**A:** It repeatedly removes vertices with in-degree zero; if it stops before removing all vertices, the remaining ones lie on cycles or depend on them, so the graph is not a DAG.

**Q:** Why can the longest path be found in linear time in a DAG?
**A:** Processing the vertices in topological order guarantees that all predecessors of a vertex are done before it, so a single pass of dynamic programming over the edges computes every longest path.

## summary
A DAG has a topological order, found by Kahn's algorithm in O(V + E), and that order lets longest paths, shortest paths and path counts be computed by one dynamic programming pass. Failure to order every vertex reveals a cycle.

## codenote
The Python sample orders tasks and runs path dynamic programming. The JavaScript sample counts paths in a layered DAG.

## code
### python
```python
from collections import deque

def topological_order(vertices, edges):
    out = {v: [] for v in vertices}
    indegree = {v: 0 for v in vertices}
    for u, v in edges:
        out[u].append(v)
        indegree[v] += 1
    queue = deque(sorted(v for v in vertices if indegree[v] == 0))
    order = []
    while queue:
        node = queue.popleft()
        order.append(node)
        for nxt in out[node]:
            indegree[nxt] -= 1
            if indegree[nxt] == 0:
                queue.append(nxt)
    return order, out

vertices = "ABCDE"
edges = [("A", "B"), ("A", "C"), ("B", "D"), ("C", "D"), ("D", "E")]
order, out = topological_order(vertices, edges)
print(order)

longest = {v: 0 for v in vertices}
paths = {v: 1 if v == "A" else 0 for v in vertices}
for node in order:
    for nxt in out[node]:
        longest[nxt] = max(longest[nxt], longest[node] + 1)
        paths[nxt] += paths[node]
print(max(longest.values()), paths)

cyclic_order, _ = topological_order(vertices, edges + [("E", "A")])
print(len(cyclic_order) < len(vertices), cyclic_order)
```
Output:
```text
['A', 'B', 'C', 'D', 'E']
3 {'A': 1, 'B': 1, 'C': 1, 'D': 2, 'E': 2}
True []
```
### javascript
```javascript
function countPaths(vertexCount, edges, source, target) {
  const out = Array.from({ length: vertexCount }, () => []);
  const indegree = new Array(vertexCount).fill(0);
  for (const [u, v] of edges) {
    out[u].push(v);
    indegree[v]++;
  }
  const queue = [];
  indegree.forEach((d, v) => d === 0 && queue.push(v));
  const ways = new Array(vertexCount).fill(0);
  ways[source] = 1;
  while (queue.length) {
    const node = queue.shift();
    for (const next of out[node]) {
      ways[next] += ways[node];
      if (--indegree[next] === 0) queue.push(next);
    }
  }
  return ways[target];
}

const layered = [[0, 1], [0, 2], [1, 3], [2, 3], [1, 4], [3, 5], [4, 5], [2, 4]];
console.log(countPaths(6, layered, 0, 5), countPaths(6, layered, 0, 3));
```
Output:
```text
4 2
```

## quiz
1. What does a topological order guarantee?
   - [ ] The shortest path between any two vertices
   - [x] Every edge goes from an earlier to a later vertex
   - [ ] The graph is connected
   - [ ] The order is unique
   > It exists exactly for directed acyclic graphs.
2. What does Kahn's algorithm signal when it cannot list every vertex?
   - [ ] The graph is a tree
   - [x] The graph contains a directed cycle
   - [ ] The graph is bipartite
   - [ ] The graph has a source
   > The remaining vertices never reach in-degree zero.
3. How is the longest path in a DAG computed?
   - [ ] With Dijkstra's algorithm
   - [x] By dynamic programming along the topological order
   - [ ] By brute force over all subsets
   - [ ] It cannot be computed
   > Predecessors are processed before each vertex.
4. What is a source vertex?
   - [ ] A vertex with out-degree zero
   - [x] A vertex with in-degree zero
   - [ ] A vertex on a cycle
   - [ ] The vertex with the most edges
   > Every DAG has at least one source.

# Graph Modeling Problems
kind: concept
time: Not an algorithmic topic — modelling is the step before algorithms. Once the graph is built, the cost is usually O(V + E) for a breadth first search; the modelling choices decide how large V and E become.
space: Not an algorithmic topic — implicit graphs, such as grids and state spaces, are generated on demand so memory stays proportional to the frontier instead of the whole graph.

## intro
Most graph problems in practice do not arrive as a list of edges. They arrive as a maze, a set of words, a lock with rotating wheels or a set of tasks, and the real skill is deciding what the vertices and edges should be. A good model turns the problem into a standard one, such as shortest path or cycle detection, and a poor model makes it intractable.

## theory
The modelling recipe:

- Vertices are the states you can be in: a position, a configuration, a word, a person, a task
- Edges are the legal moves or relations between states: a step, a rotation, a one letter change, a friendship, a prerequisite
- Weights (if any) are the cost of a move
- A query becomes a graph question: reachability, shortest path, connected components, cycle, ordering, matching

Examples:

- Grid and maze: cells are vertices; edges join neighbouring open cells; the minimum number of steps is a breadth first search. A chess knight on an 8 by 8 board moving from the corner (0, 0) to the opposite corner (7, 7) needs at least 6 moves, found by breadth first search over positions with 8 possible jumps.
- Word ladder: words are vertices; edges join words that differ in exactly one letter; the shortest transformation is the shortest path. Instead of comparing all pairs (quadratic), build buckets by replacing each letter with a wildcard (`h*t` groups hot, hat and hit), so words in the same bucket are neighbours. For the words hot, dot, dog, lot, log, cog and hit the buckets create 9 distinct neighbour pairs.
- Puzzles and games: each configuration of a sliding puzzle, a Rubik's cube or a lock with four wheels is a vertex, each legal move an edge; breadth first search gives the minimum number of moves; the state space can be huge, so the graph is implicit and generated on the fly
- Dependencies: tasks or courses as vertices with directed edges for prerequisites; a topological sort orders them and a cycle means the schedule is impossible
- Social and web networks: people or pages as vertices; edges for friendship (undirected) or links and follows (directed); questions such as degrees of separation, influencers and communities
- Maps and transport: intersections or stations as vertices, roads or routes as weighted edges; state expansions model constraints such as "at most k stops" by using (vertex, stops used) as the state
- Constraint problems: two colouring (bipartite check) models "can these people be split into two groups with no conflicts"; graph colouring models scheduling conflicts (exams sharing students must not share a time slot)
- Currency exchange: currencies as vertices, exchange rates as edges; a negative cycle after taking logarithms means an arbitrage opportunity
- Matching and assignment: workers and jobs as the two sides of a bipartite graph, with edges for suitable pairs, and maximum matching as the question
- Equivalence: items that are declared equal form components (union-find)

Choices that matter:

- Implicit versus explicit graph: build the adjacency structure beforehand when it is small, or generate neighbours on demand when the state space is large or infinite
- State design: include everything that affects future moves (keys collected, fuel left, direction faced); too little breaks correctness, too much explodes the size
- Directed or undirected, weighted or not: decides the algorithm
- Reduction of size: symmetries, canonical forms and pruning of unreachable states keep the graph small
- Multi-source search: start from several sources at once (all rotten oranges, all gates)
- Reverse graph: sometimes it is easier to search backward from the goal

Verification: model a tiny instance by hand, compute the answer manually and compare with the program; check that every legal move is an edge and no illegal move is.

Typical traps: forgetting the visited set (infinite loops in cyclic state graphs), using depth first search for shortest paths in unweighted graphs, building all pairs edges (quadratic) when buckets or hashing give linear construction, and undercounting states by ignoring part of the configuration.

## explain
1. Decide what a state is and make it a vertex.
2. Decide what a legal move is and make it an edge, with a weight if moves have costs.
3. Check whether the graph is directed or weighted.
4. Choose an implicit or explicit representation.
5. Translate the question into a standard graph problem and pick the algorithm.
6. Test the model on a tiny instance by hand.

## example
The Python program models the knight on the chessboard, runs breadth first search and prints the minimum number of moves from (0, 0) to (7, 7), which is 6, and from (0, 0) to (1, 2), which is 1. The JavaScript program builds the word ladder graph with wildcard buckets for the words above and prints the number of edges and the neighbours of hot.

## real
Route planners model maps as weighted graphs, puzzle solvers explore implicit state graphs, and build tools model dependencies as directed graphs, with the modelling step deciding whether the problem is easy.

## pros
- Turns varied problems into a few standard algorithms
- Implicit graphs avoid storing enormous state spaces
- A clear model makes correctness easier to argue

## cons
- Choosing the wrong state can make the graph far too large
- Missing information in the state silently breaks answers
- Edge construction can be quadratic without a clever indexing trick

## uses
- Maze and grid shortest paths
- Word transformations and puzzle solving
- Dependency and scheduling problems
- Conflict and colouring problems

## mistakes
- Leaving part of the configuration out of the state
- Building edges by comparing all pairs of items
- Forgetting the visited set in a cyclic state graph
- Picking depth first search when the shortest number of moves is needed

## interview
**Q:** How do you model a word ladder problem as a graph?
**A:** Words are vertices and two words are connected if they differ in exactly one letter; to build edges efficiently, group words by wildcard patterns such as h*t, and the shortest transformation is found by breadth first search.

**Q:** What should a state in a graph model contain?
**A:** Everything that influences which moves are possible and what the goal is, such as the position and the keys collected or the remaining fuel, and nothing that does not matter.

**Q:** What is an implicit graph?
**A:** A graph whose vertices and edges are computed on demand from the rules of the problem, so a search can explore a huge state space without storing it.

## summary
Modelling decides what the vertices and edges are, whether the graph is explicit or implicit and which algorithm applies. Include the whole relevant state, build edges efficiently and test the model on a tiny case.

## codenote
The Python sample models a knight on a chessboard. The JavaScript sample builds the word graph with buckets.

## code
### python
```python
from collections import deque

def knight_moves(start, goal, size=8):
    moves = [(1, 2), (2, 1), (-1, 2), (-2, 1), (1, -2), (2, -1), (-1, -2), (-2, -1)]
    queue, seen = deque([(start, 0)]), {start}
    while queue:
        (r, c), steps = queue.popleft()
        if (r, c) == goal:
            return steps
        for dr, dc in moves:
            nxt = (r + dr, c + dc)
            if 0 <= nxt[0] < size and 0 <= nxt[1] < size and nxt not in seen:
                seen.add(nxt)
                queue.append((nxt, steps + 1))
    return -1

print(knight_moves((0, 0), (7, 7)), knight_moves((0, 0), (1, 2)), knight_moves((0, 0), (0, 0)))
```
Output:
```text
6 1 0
```
### javascript
```javascript
function buildLadder(words) {
  const buckets = new Map();
  for (const word of words) {
    for (let i = 0; i < word.length; i++) {
      const pattern = word.slice(0, i) + "*" + word.slice(i + 1);
      if (!buckets.has(pattern)) buckets.set(pattern, []);
      buckets.get(pattern).push(word);
    }
  }
  const edges = new Set();
  const neighbours = {};
  for (const group of buckets.values()) {
    for (const a of group) {
      for (const b of group) {
        if (a < b) edges.add(a + "-" + b);
        if (a !== b) (neighbours[a] ??= new Set()).add(b);
      }
    }
  }
  return [edges.size, [...neighbours.hot].sort().join(" ")];
}

console.log(buildLadder(["hot", "dot", "dog", "lot", "log", "cog", "hit"]));
```
Output:
```text
[ 9, 'dot hit lot' ]
```

## quiz
1. What should a vertex represent in a puzzle graph?
   - [ ] A single move
   - [x] A complete configuration of the puzzle
   - [ ] The number of moves
   - [ ] The goal only
   > Edges are the legal moves between configurations.
2. Why use wildcard buckets in the word ladder model?
   - [ ] To sort the words
   - [x] To find neighbouring words without comparing all pairs
   - [ ] To remove duplicates
   - [ ] To make the graph directed
   > Words in a bucket differ only at the wildcard position.
3. What is an implicit graph?
   - [ ] A graph without edges
   - [x] A graph whose neighbours are generated on demand from rules
   - [ ] A graph stored in a matrix
   - [ ] A directed acyclic graph
   > It avoids storing a huge state space.
4. Which search finds the minimum number of knight moves on a board?
   - [ ] Depth first search
   - [x] Breadth first search
   - [ ] Topological sorting
   - [ ] Binary search
   > Unit cost moves are explored level by level.

# Bipartite Graph Check
kind: algorithm
time: O(V + E) with a breadth first or depth first traversal that colours each vertex once and checks each edge once.
space: O(V) for the colour array and the queue or recursion stack.

## intro
A graph is bipartite if its vertices can be split into two groups so that every edge joins a vertex of one group to a vertex of the other, with no edge inside a group. Equivalently, it can be coloured with two colours so that adjacent vertices differ. The check is a graph search that alternates colours, and a failure points to an odd cycle.

## theory
Characterisation: a graph is bipartite exactly when it contains no cycle of odd length. A triangle (3 cycle) or a 5 cycle makes a graph non bipartite; a 4 cycle or 6 cycle does not. Trees and grids are bipartite.

Algorithm (two colouring by search):

- Keep a colour array initialised to "uncoloured"
- For each uncoloured vertex (the graph may have several components), give it colour 0 and start a breadth first search
- When visiting vertex u, give each uncoloured neighbour the opposite colour of u and enqueue it; if a neighbour already has the same colour as u, the edge joins two vertices of one group, so the graph is not bipartite
- If the search ends without conflicts, the colouring is a valid bipartition

Example: the square 0-1, 1-2, 2-3, 3-0 gets colours 0, 1, 0, 1 for the vertices 0 to 3, so groups {0, 2} and {1, 3}: bipartite. The triangle 0-1, 1-2, 2-0 fails: vertex 0 gets colour 0, vertices 1 and 2 get colour 1, and the edge 1-2 joins two vertices of the same colour. A 5 cycle also fails.

Why it works: along any path colours alternate, so a cycle returns to its start with the same colour only if its length is even. An odd cycle forces a conflict, and a conflict implies an odd cycle (the two conflicting vertices have paths of the same parity from the start, and the edge between them closes an odd cycle).

Depth first version: recursive colouring with the same rule; careful about recursion depth on large graphs.

Union-find version: for each edge `(u, v)`, union u with the opposite copy of v (and v with the opposite of u) using 2V nodes, then check no vertex is connected to its own copy. Useful for streams of edges.

Complexity: each vertex is coloured once and each edge looked at twice (undirected), O(V + E). Isolated vertices are trivially coloured.

Applications:

- Can people be divided into two teams so that no pair of dislikes lies in the same team (possible bipartition): vertices are people, edges are dislikes, and the check says whether such a split exists. For 4 people with dislikes 1-2, 1-3, 2-4 the split {1, 4} and {2, 3} works; with dislikes 1-2, 2-3, 1-3 it is impossible.
- Scheduling with two time slots or two resources
- Matching and assignment problems: maximum matching in bipartite graphs (Hopcroft-Karp), König's theorem (the maximum matching equals the minimum vertex cover), the assignment problem
- Verifying that a graph is a valid two-sided structure, such as a user to item graph in recommendation systems
- Is a graph a tree or a grid: bipartite checks for sanity
- Chessboard colouring arguments: tiling problems with dominoes

Extension: a k-colouring generalises it; checking 2-colourability is linear, while 3-colourability is NP-complete.

Directed graphs: bipartiteness ignores direction; treat edges as undirected.

Pitfalls: only starting the search at vertex 0 (the graph may be disconnected), marking the colour of a vertex after pushing it twice, treating a self loop as fine (a self loop makes the graph non bipartite because the vertex is adjacent to itself), and forgetting that vertices may be numbered from 1.

Testing: compare with brute force over all 2-colourings on tiny graphs; check cycles of length 3 to 8, trees, disconnected graphs and self loops.

## explain
1. Create a colour array with no colour assigned.
2. For every uncoloured vertex start a breadth first search with colour 0.
3. Give each uncoloured neighbour the opposite colour and enqueue it.
4. If a neighbour has the same colour as the current vertex, report that the graph is not bipartite.
5. If every component is coloured without conflict, report bipartite and optionally return the two groups.
6. Remember to handle disconnected graphs and self loops.

## example
The Python function reports the square as bipartite with the groups {0, 2} and {1, 3}, the triangle and the 5 cycle as not bipartite and a disconnected graph with a path and an isolated vertex as bipartite. The JavaScript function solves the possible bipartition problem for the dislikes above and prints `true` and `false`.

## real
Recommendation systems model users and items as bipartite graphs, scheduling tools split conflicting jobs into two shifts and matching algorithms rely on bipartite structure.

## pros
- Linear time check with a simple traversal
- Provides the two groups when the answer is yes
- Equivalent to the absence of odd cycles

## cons
- Must handle every component of a disconnected graph
- A single conflict gives no further information beyond an odd cycle
- Does not extend easily to three or more colours

## uses
- Splitting people or tasks into two conflict free groups
- Checking the precondition for bipartite matching
- Detecting odd cycles
- Chessboard style colouring arguments

## mistakes
- Starting from one vertex only and missing other components
- Ignoring self loops
- Colouring a vertex twice and creating false conflicts
- Treating directed edges as one way constraints

## interview
**Q:** How do you check whether a graph is bipartite?
**A:** Colour vertices with two colours by breadth first or depth first search, giving each neighbour the opposite colour; if an edge connects two vertices of the same colour the graph is not bipartite, and the search must be started from every uncoloured vertex.

**Q:** What property characterises bipartite graphs?
**A:** A graph is bipartite exactly when it has no cycle of odd length.

**Q:** Why must the search be restarted for each component?
**A:** A disconnected graph can have vertices that the first search never reaches, and each component must be coloured and checked separately.

## summary
A graph is bipartite when a breadth first or depth first search can two-colour it without conflicts, which happens exactly when it has no odd cycle. The check takes O(V + E) and must cover every component.

## codenote
The Python sample colours several small graphs. The JavaScript sample solves a two team split.

## code
### python
```python
from collections import deque

def two_colour(vertex_count, edges):
    adjacent = [[] for _ in range(vertex_count)]
    for u, v in edges:
        adjacent[u].append(v)
        adjacent[v].append(u)
    colour = [None] * vertex_count
    for start in range(vertex_count):
        if colour[start] is not None:
            continue
        colour[start] = 0
        queue = deque([start])
        while queue:
            node = queue.popleft()
            for nxt in adjacent[node]:
                if colour[nxt] is None:
                    colour[nxt] = 1 - colour[node]
                    queue.append(nxt)
                elif colour[nxt] == colour[node]:
                    return None
    return [[v for v in range(vertex_count) if colour[v] == c] for c in (0, 1)]

print(two_colour(4, [(0, 1), (1, 2), (2, 3), (3, 0)]))
print(two_colour(3, [(0, 1), (1, 2), (2, 0)]), two_colour(5, [(i, (i + 1) % 5) for i in range(5)]))
print(two_colour(5, [(0, 1), (1, 2)]))
```
Output:
```text
[[0, 2], [1, 3]]
None None
[[0, 2, 3, 4], [1]]
```
### javascript
```javascript
function possibleBipartition(n, dislikes) {
  const graph = Array.from({ length: n + 1 }, () => []);
  for (const [a, b] of dislikes) {
    graph[a].push(b);
    graph[b].push(a);
  }
  const side = new Array(n + 1).fill(-1);
  const visit = (node, colour) => {
    side[node] = colour;
    for (const next of graph[node]) {
      if (side[next] === colour) return false;
      if (side[next] === -1 && !visit(next, 1 - colour)) return false;
    }
    return true;
  };
  for (let person = 1; person <= n; person++) {
    if (side[person] === -1 && !visit(person, 0)) return false;
  }
  return true;
}

console.log(possibleBipartition(4, [[1, 2], [1, 3], [2, 4]]), possibleBipartition(3, [[1, 2], [2, 3], [1, 3]]));
```
Output:
```text
true false
```

## quiz
1. When is a graph bipartite?
   - [ ] When it has an even number of vertices
   - [x] When it can be two-coloured so that every edge joins different colours
   - [ ] When it is a tree only
   - [ ] When it is connected
   > The two colour classes are the two groups.
2. Which cycles make a graph non bipartite?
   - [ ] Cycles of even length
   - [x] Cycles of odd length
   - [ ] Cycles through the first vertex
   - [ ] Cycles of length four only
   > Colours alternate along a path, so an odd cycle must clash.
3. Why must the search start from every uncoloured vertex?
   - [ ] To speed up the algorithm
   - [x] The graph may be disconnected and each component needs colouring
   - [ ] To avoid recursion
   - [ ] To detect self loops
   > A single search only reaches one component.
4. How long does the two-colouring check take on V vertices and E edges?
   - [ ] O(V squared)
   - [x] O(V + E)
   - [ ] O(E squared)
   - [ ] O(V log V)
   > Each vertex is coloured once and each edge examined a constant number of times.

# Cycle Detection Overview
kind: algorithm
time: O(V + E) for depth first search based detection in directed and undirected graphs, and O(V + E) for Kahn's algorithm on directed graphs; union-find takes O(E α(V)) for undirected graphs.
space: O(V) for visited flags, colours or in-degree counts, plus O(V) for the recursion stack in depth first search.

## intro
A cycle is a path that returns to where it started. Detecting one is needed to validate dependencies, find deadlocks, check whether a graph is a tree and decide whether a topological order exists. The method depends on the graph: undirected and directed graphs need different rules, because an edge back to the parent in an undirected graph is not a cycle.

## theory
Undirected graphs:

- Depth first search with parent tracking: when exploring from u, a neighbour v that is already visited and is not the parent of u closes a cycle. Without the parent check, every edge would look like a cycle because it leads back to where you came from. With parallel edges treat the second edge to the parent as a cycle (track edge ids rather than parent vertices).
- Union-find: process the edges; an edge whose endpoints are already connected closes a cycle
- Counting: a connected undirected graph is a tree (acyclic) exactly when E = V − 1; a graph with C components is acyclic (a forest) exactly when E = V − C
- Leaf stripping: repeatedly remove vertices of degree one; if vertices remain, they lie on cycles

Directed graphs: following the arrows, a back edge to a vertex that is on the current recursion path closes a cycle. A cross edge or forward edge to a vertex that is already fully explored does not.

- Depth first search with three states: white (unvisited), grey (on the current path, being explored) and black (finished). An edge to a grey vertex is a back edge and proves a cycle. An edge to a black vertex is fine. The grey set is the recursion stack.
- Kahn's algorithm: repeatedly remove vertices of in-degree zero; if some vertices are never removed the graph has a cycle (the leftover vertices include at least one cycle)
- Topological sort by depth first search reports a cycle when it meets a grey vertex
- Extracting the cycle: record the parent pointers during depth first search; when a back edge from u to the grey vertex v is found, follow the parents from u up to v to list the cycle

Comparison of the results on small graphs:

- Undirected path 0-1-2-3: no cycle (parent check avoids false alarm)
- Undirected 0-1-2-0 plus 2-3: cycle
- Directed 0 → 1 → 2 → 3: no cycle
- Directed 0 → 1 → 2 → 0: cycle
- Directed diamond 0 → 1, 0 → 2, 1 → 3, 2 → 3: no cycle although vertex 3 is reached twice (a cross edge to a black vertex), which a single visited set would wrongly report as a cycle
- Self loops: a directed edge u → u is a cycle of length 1; in an undirected graph a self loop is also a cycle

Why the colour method is needed in directed graphs: with only a visited set, the diamond looks cyclic because vertex 3 is seen twice. The grey and black distinction separates "on the current path" from "seen before and finished".

Complexity: all depth first search methods visit every vertex and edge once, O(V + E). The recursion depth can reach V, so use an explicit stack for large graphs.

Uses:

- Course schedule feasibility: prerequisites form a directed graph; a cycle means the courses cannot all be taken
- Build systems and package managers reject circular dependencies
- Deadlock detection in operating systems and databases: a cycle in the wait-for graph is a deadlock
- Spreadsheets detect circular references
- Validating that a structure is a tree or a DAG
- Detecting infinite loops in state machines and linked structures (Floyd's algorithm for linked lists is a special case)

Choosing a method: for a stream of undirected edges use union-find; for directed graphs use depth first search colours or Kahn's algorithm (which also gives an order); for finding the actual cycle use depth first search with parents.

Pitfalls: forgetting the parent check in undirected graphs, using one visited set for directed graphs, forgetting to start the search from every unvisited vertex, and mixing up recursion stack membership with visited status.

Testing: paths, triangles, diamonds, self loops, disconnected graphs and compare the directed methods against each other on random graphs.

## explain
1. Decide whether the graph is directed or undirected.
2. For undirected graphs run depth first search and report a visited neighbour that is not the parent, or use union-find.
3. For directed graphs colour vertices white, grey and black during depth first search.
4. Report a cycle when an edge leads to a grey vertex.
5. Alternatively run Kahn's algorithm and compare the number of ordered vertices with V.
6. Start from every unvisited vertex so all components are covered.

## example
The Python program runs the undirected parent check and the directed three colour search on the sample graphs, reporting no cycle for the path and the diamond and a cycle for the others, and shows that a plain visited set wrongly flags the diamond. The JavaScript program detects the directed cycles with Kahn's algorithm and prints which vertices remain.

## real
Operating systems detect deadlocks with wait-for graphs, build tools reject circular dependencies and spreadsheet programs warn about circular references.

## pros
- Linear time methods for both graph types
- Several complementary techniques for different needs
- Cycle extraction is possible with parent tracking

## cons
- Directed and undirected rules differ and are easy to mix up
- Recursion depth can overflow on large graphs
- A visited set alone is wrong for directed graphs

## uses
- Course schedule and dependency validation
- Deadlock detection
- Checking whether a graph is a tree or a DAG
- Finding the vertices that lie on cycles

## mistakes
- Treating the edge back to the parent as a cycle in an undirected graph
- Using a single visited set for directed cycle detection
- Starting the search from one vertex only
- Confusing finished vertices with vertices on the current path

## interview
**Q:** How do you detect a cycle in a directed graph with depth first search?
**A:** Colour vertices white, grey and black; mark a vertex grey when entering it and black when leaving; an edge to a grey vertex is a back edge and means a cycle.

**Q:** Why does an undirected graph need the parent check?
**A:** Every undirected edge leads back to the vertex you came from, which is not a cycle; a visited neighbour that is not the parent indicates a real cycle.

**Q:** How can Kahn's algorithm detect a directed cycle?
**A:** It repeatedly removes vertices with in-degree zero; if it removes fewer than V vertices, the remaining ones contain a cycle.

## summary
Cycle detection uses a parent check in undirected depth first search, grey and black colours or Kahn's algorithm in directed graphs, and union-find for undirected edge streams, all in near linear time. Mixing the rules of the two graph kinds is the classic mistake.

## codenote
The Python sample compares the undirected and directed methods. The JavaScript sample uses Kahn's algorithm.

## code
### python
```python
def undirected_cycle(n, edges):
    adjacent = [[] for _ in range(n)]
    for u, v in edges:
        adjacent[u].append(v)
        adjacent[v].append(u)
    seen = set()

    def visit(node, parent):
        seen.add(node)
        for nxt in adjacent[node]:
            if nxt == parent:
                continue
            if nxt in seen or visit(nxt, node):
                return True
        return False

    return any(visit(v, -1) for v in range(n) if v not in seen)

def directed_cycle(n, edges):
    out = [[] for _ in range(n)]
    for u, v in edges:
        out[u].append(v)
    colour = [0] * n

    def visit(node):
        colour[node] = 1
        for nxt in out[node]:
            if colour[nxt] == 1 or (colour[nxt] == 0 and visit(nxt)):
                return True
        colour[node] = 2
        return False

    return any(visit(v) for v in range(n) if colour[v] == 0)

def naive_directed(n, edges):
    out = [[] for _ in range(n)]
    for u, v in edges:
        out[u].append(v)
    seen = set()

    def visit(node):
        seen.add(node)
        return any(nxt in seen or visit(nxt) for nxt in out[node])

    return any(visit(v) for v in range(n) if v not in seen)

print(undirected_cycle(4, [(0, 1), (1, 2), (2, 3)]), undirected_cycle(4, [(0, 1), (1, 2), (2, 0), (2, 3)]))
print(directed_cycle(4, [(0, 1), (1, 2), (2, 3)]), directed_cycle(3, [(0, 1), (1, 2), (2, 0)]))
diamond = [(0, 1), (0, 2), (1, 3), (2, 3)]
print(directed_cycle(4, diamond), naive_directed(4, diamond))
```
Output:
```text
False True
False True
False True
```
### javascript
```javascript
function remainingAfterKahn(n, edges) {
  const out = Array.from({ length: n }, () => []);
  const indegree = new Array(n).fill(0);
  for (const [u, v] of edges) {
    out[u].push(v);
    indegree[v]++;
  }
  const queue = [];
  indegree.forEach((d, v) => d === 0 && queue.push(v));
  const removed = new Set();
  while (queue.length) {
    const node = queue.shift();
    removed.add(node);
    for (const next of out[node]) if (--indegree[next] === 0) queue.push(next);
  }
  return [...Array(n).keys()].filter((v) => !removed.has(v));
}

console.log(JSON.stringify(remainingAfterKahn(4, [[0, 1], [1, 2], [2, 3]])));
console.log(JSON.stringify(remainingAfterKahn(5, [[0, 1], [1, 2], [2, 1], [2, 3], [3, 4]])));
```
Output:
```text
[]
[1,2,3,4]
```

## quiz
1. Why does undirected cycle detection ignore the parent?
   - [ ] To save memory
   - [x] Every edge leads back to the vertex it came from, which is not a cycle
   - [ ] To avoid recursion
   - [ ] Because parents are always visited last
   > A visited neighbour other than the parent closes a real cycle.
2. What does an edge to a grey vertex mean in a directed depth first search?
   - [ ] A forward edge
   - [x] A back edge, so the graph has a cycle
   - [ ] A cross edge
   - [ ] A finished vertex
   > Grey vertices are on the current recursion path.
3. Why is a single visited set wrong for directed cycle detection?
   - [ ] It is too slow
   - [x] A vertex reached twice by different paths, like the diamond, would be reported as a cycle
   - [ ] It uses too much memory
   - [ ] It cannot store vertices
   > Finished vertices must be distinguished from vertices on the path.
4. What does Kahn's algorithm leave behind in a cyclic graph?
   - [ ] Nothing
   - [x] Vertices that never reach in-degree zero
   - [ ] Only the sources
   - [ ] Isolated vertices only
   > They lie on a cycle or depend on one.

# Graph Complexity Basics
kind: concept
time: Not an algorithmic topic — this lesson explains how to count the cost of graph operations. A full traversal costs O(V + E) with adjacency lists and O(V squared) with an adjacency matrix; edge tests cost O(degree) or O(1).
space: Not an algorithmic topic — memory is O(V + E) for lists and O(V squared) for matrices, and the density E / V squared decides which is smaller.

## intro
Graph algorithms are described in terms of two numbers, the vertex count V and the edge count E, and the representation changes the constants and sometimes the exponents. Knowing how to read and compare these costs lets you predict whether an algorithm will finish on a graph with a million vertices, and which representation to choose before writing any code.

## theory
Parameters: V is the number of vertices and E the number of edges. For simple graphs, E ranges from 0 to V(V − 1) / 2 (undirected) or V(V − 1) (directed), so E is between 0 and about V squared. Density is E divided by the maximum possible number of edges.

Typical regimes:

- Sparse graphs: E is O(V), roads, trees, grids (E about 2V to 4V), social networks with bounded average degree
- Dense graphs: E is Θ(V squared), complete or nearly complete graphs, similarity matrices
- Real networks are usually sparse: a road network with 10 million intersections has about 25 million road segments, nowhere near 5 × 10^13 possible pairs

Costs by representation:

- Adjacency list: space O(V + E), traversal O(V + E), edge test O(degree), neighbours in O(degree)
- Adjacency matrix: space O(V squared), traversal O(V squared), edge test O(1), neighbours O(V)
- Edge list: space O(E), edge test O(E), good for sorting edges (Kruskal) and for Bellman-Ford

Algorithm costs in terms of V and E:

- Breadth first search and depth first search: O(V + E) with lists
- Topological sort, connected components, bipartite test, cycle detection: O(V + E)
- Dijkstra with a binary heap: O((V + E) log V); with an array on dense graphs O(V squared)
- Bellman-Ford: O(V E)
- Floyd-Warshall: O(V cubed)
- Kruskal: O(E log E); Prim with a heap: O(E log V)
- Maximum flow (Edmonds-Karp): O(V E squared); Dinic: O(V squared E)

Comparing for a given size: for V = 1,000,000 and E = 5,000,000, an O(V + E) traversal takes about 6 million steps, a heap Dijkstra about 6 million times 20, and an O(V squared) matrix algorithm 10^12 steps, which is far beyond reach, as is the 10^12 cell matrix itself. For V = 1,000 and E = 400,000 (dense), the matrix uses 10^6 cells, a list 800,000 entries, and either works.

Counting operations in code: instrument the traversal with counters for the vertices dequeued and edges examined; for a list-based breadth first search on the graph with 6 vertices and 7 edges, the counts are V = 6 vertices processed and 2E = 14 edge examinations (undirected). With a matrix, each vertex scans a full row: V times V = 36 cell reads. The sample code prints both counts.

Choosing between list and matrix:

- Is E much smaller than V squared? Use lists
- Do you need O(1) edge tests many times, or is V small (up to a few thousand)? Use a matrix or bitsets
- Is the graph static and huge? Consider compressed sparse row arrays
- Are edges only needed in sorted order? Use an edge list

Common pitfalls in analysis: writing O(E) when E can be V squared (say O(V + E)), forgetting that undirected edges are stored twice (a factor of 2 that big-O hides), assuming matrix traversals are as cheap as list traversals, and ignoring the log factor in heap based algorithms.

Memory also matters: 10^7 edges stored as Python tuples of ints occupy hundreds of megabytes, while arrays of 32 bit integers need 80 MB for two endpoints; use compact representations for big graphs.

Practical advice: estimate V and E first, write down the cost formula of the candidate algorithm, and compare it with a budget of about 10^8 simple operations per second.

## explain
1. Estimate V and E for the real input, and the density.
2. Look up the cost of the algorithm in terms of V and E.
3. Choose the representation that makes those costs smallest.
4. Substitute the numbers to estimate time and memory.
5. Instrument the code with counters to confirm the formula on a small graph.
6. Use compact structures when the graph is huge.

## example
The Python program counts the vertices dequeued and edges examined by a breadth first search on a six vertex graph with seven edges using lists (6 and 14) and the cell reads of a matrix based search (36), and prints the memory cells needed by each representation for V = 1,000 and E = 5,000. The JavaScript program prints a table of V, E, list entries and matrix cells for three sizes.

## real
Mapping services choose compact adjacency structures and heap based shortest path algorithms, while small all pairs problems with a few hundred nodes use matrices and Floyd-Warshall.

## pros
- Simple formulas predict running time and memory
- The sparse versus dense distinction guides representation choice
- Counting operations in code validates the analysis

## cons
- Big-O hides constants such as the factor 2 for undirected edges
- Cache behaviour can matter more than the formula for large graphs
- Real graphs have skewed degrees that averages do not capture

## uses
- Choosing between list, matrix and edge list representations
- Estimating whether an algorithm fits a time limit
- Comparing algorithms such as Dijkstra and Bellman-Ford
- Justifying running time claims about graph algorithms

## mistakes
- Quoting O(E) without noting that E can be V squared
- Choosing a matrix for a graph with millions of vertices
- Forgetting the log factor in heap based shortest paths
- Ignoring that undirected edges are stored twice

## interview
**Q:** What is the complexity of breadth first search?
**A:** O(V + E) with an adjacency list, because each vertex is dequeued once and each edge is examined once or twice; with an adjacency matrix it is O(V squared).

**Q:** When is an adjacency matrix a better choice than lists?
**A:** For dense graphs or small V where O(1) edge tests are needed, since the matrix then uses a comparable amount of memory and simplifies the code.

**Q:** How do Dijkstra's and Bellman-Ford's running times compare?
**A:** Dijkstra with a binary heap is O((V + E) log V) but needs non-negative weights, while Bellman-Ford is O(V E) and handles negative weights and detects negative cycles.

## summary
Graph costs are expressed in V and E and depend on the representation: lists give O(V + E) traversals and O(V + E) space, matrices O(V squared) for both. Estimate the numbers, pick the representation and algorithm accordingly and confirm with counters.

## codenote
The Python sample counts operations for lists and matrices. The JavaScript sample prints a size table.

## code
### python
```python
from collections import deque

edges = [(0, 1), (0, 2), (1, 2), (1, 3), (2, 4), (3, 4), (4, 5)]
n = 6
adjacent = [[] for _ in range(n)]
for u, v in edges:
    adjacent[u].append(v)
    adjacent[v].append(u)

def bfs_list():
    seen, queue, vertices, examined = {0}, deque([0]), 0, 0
    while queue:
        node = queue.popleft()
        vertices += 1
        for nxt in adjacent[node]:
            examined += 1
            if nxt not in seen:
                seen.add(nxt)
                queue.append(nxt)
    return vertices, examined

matrix = [[0] * n for _ in range(n)]
for u, v in edges:
    matrix[u][v] = matrix[v][u] = 1

def bfs_matrix():
    seen, queue, reads = {0}, deque([0]), 0
    while queue:
        node = queue.popleft()
        for nxt in range(n):
            reads += 1
            if matrix[node][nxt] and nxt not in seen:
                seen.add(nxt)
                queue.append(nxt)
    return reads

print(bfs_list(), bfs_matrix())
V, E = 1000, 5000
print(V + 2 * E, V * V)
```
Output:
```text
(6, 14) 36
11000 1000000
```
### javascript
```javascript
const sizes = [[1000, 5000], [100000, 300000], [1000000, 5000000]];
for (const [V, E] of sizes) {
  const listEntries = V + 2 * E;
  const matrixCells = V * V;
  console.log(V, E, listEntries, matrixCells, (matrixCells / listEntries).toFixed(0));
}
```
Output:
```text
1000 5000 11000 1000000 91
100000 300000 700000 10000000000 14286
1000000 5000000 11000000 1000000000000 90909
```

## quiz
1. What is the space needed by an adjacency list?
   - [ ] O(V squared)
   - [x] O(V + E)
   - [ ] O(E squared)
   - [ ] O(V log V)
   > One header per vertex and an entry per edge direction.
2. What does breadth first search cost on an adjacency matrix?
   - [ ] O(V + E)
   - [x] O(V squared)
   - [ ] O(E log V)
   - [ ] O(V)
   > Each vertex scans a full row.
3. What is the running time of Bellman-Ford?
   - [ ] O((V + E) log V)
   - [x] O(V E)
   - [ ] O(V + E)
   - [ ] O(V cubed)
   > It relaxes all edges V minus 1 times.
4. Why are real graphs usually stored as lists?
   - [ ] Lists are always faster for edge tests
   - [x] They are sparse, so matrices would waste memory on absent edges
   - [ ] Matrices cannot hold weights
   - [ ] Lists use less code
   > E is far below V squared in roads, webs and social graphs.

# Graph Interview Foundations
kind: concept
time: Not an algorithmic topic — this lesson reviews foundations. Most basic graph questions run in O(V + E) time with a traversal, and recognising the model is the main difficulty.
space: Not an algorithmic topic — expect O(V + E) memory for the adjacency structure and O(V) for visited arrays, queues and recursion stacks, which is worth stating in an interview.

## intro
Graph questions in interviews rarely say graph. They describe a grid, a set of dependencies, people who trust each other or words that transform into one another. The foundation skills are the same each time: choose the vertices and edges, pick a representation, traverse with breadth first or depth first search and read the answer off the traversal. This lesson collects those basics and the checks interviewers expect.

## theory
Step 1: build the graph. Convert the input (edge list, matrix, grid, list of pairs) to an adjacency list. Decide if it is directed. Allocate for vertices that have no edges, because they matter for counts (components, courses without prerequisites). Watch for 0-based versus 1-based labels.

Step 2: choose the traversal.

- Breadth first search for shortest paths in unweighted graphs, level by level processing and multi-source spreading
- Depth first search for connectivity, cycle detection, topological order, path finding with backtracking and component labelling
- Union-find for connectivity questions on a stream of edges
- Dijkstra or Bellman-Ford when edges have weights

Step 3: track visited vertices to avoid infinite loops in cyclic graphs; mark vertices when they are enqueued (breadth first search) or entered (depth first search).

Step 4: cover all components. Loop over every vertex and start a traversal from each unvisited one.

Basic problems and their one line solutions:

- Find the town judge: a person who trusts nobody and is trusted by everybody else. Compute the in-degree minus out-degree of each person; the judge is the only person with the value n − 1. For 3 people and the trust pairs (1, 3) and (2, 3), the judge is person 3; for the pairs (1, 3), (2, 3), (3, 1) there is none.
- Find the centre of a star graph: the vertex that appears in every edge, found by comparing the first two edges. For the edges (1, 2), (2, 3), (4, 2) the centre is 2.
- Valid path: does a path exist between two vertices? Breadth first search, depth first search or union-find; for the edges (0, 1), (1, 2), (3, 4) there is a path from 0 to 2 but none from 0 to 4.
- Find the number of provinces or components: count traversal starts
- Clone a graph: traverse with a map from old nodes to copies
- Course schedule: cycle detection on the prerequisite graph; the order comes from a topological sort
- Number of islands, flood fill and rotting oranges: grid graphs
- Shortest path in a binary matrix, word ladder and open the lock: breadth first search over implicit graphs
- Is the graph a tree: V − 1 edges and connected
- Bipartite check, possible bipartition: colouring by traversal
- All paths from source to target in a DAG: depth first search with a path list

What interviewers look for:

- Correct representation and handling of edge cases (empty graph, single vertex, disconnected components, self loops, duplicate edges)
- Appropriate traversal and the reason for it
- The complexity: O(V + E) time and space, with the recursion depth discussion for depth first search
- Iterative versus recursive trade-offs
- Verification with a small example

Checklist before coding:

- Is the graph directed? Weighted? Can it have cycles, parallel edges or self loops?
- How large are V and E, and is the input an adjacency list, a matrix or implicit rules?
- What is asked: existence, count, shortest length, the path itself or all paths?

Common mistakes: forgetting to mark visited, using depth first search for the shortest path, ignoring disconnected parts, building a directed graph when the problem is undirected (or the reverse), mutating the input while iterating and mixing vertex labels with indices.

Practice approach: for each type (components, shortest path, ordering, cycles, colouring) write the template from memory and solve two or three problems with it.

## explain
1. Read the input format and build an adjacency list, including isolated vertices.
2. Decide whether edges are directed and whether they carry weights.
3. Choose a traversal that matches the question.
4. Mark vertices visited and loop over all components.
5. Compute the answer from the traversal or from degree counts.
6. State the complexity and test a small example with a disconnected case.

## example
The Python program finds the town judge by in-degree minus out-degree for the three pairs of inputs above and returns 3 for the first and −1 for the second. The JavaScript program finds the centre of a star graph and checks whether a path exists between vertices with a breadth first search.

## real
Contact graphs, build dependencies, route planning and recommendation features all appear in interviews as small versions of the same graph tasks.

## pros
- A small set of steps solves most basic graph questions
- Traversal templates are short and reusable
- Degree counting solves several problems without any traversal

## cons
- Choosing the wrong traversal gives wrong or slow answers
- Edge cases with disconnected graphs and self loops are easy to miss
- Input formats vary and cause indexing mistakes

## uses
- Preparing for graph interview questions
- Choosing between breadth first, depth first and union-find
- Checking edge cases and complexity claims
- Reviewing graph code for correctness

## mistakes
- Forgetting to mark vertices visited in cyclic graphs
- Using depth first search for shortest path questions in unweighted graphs
- Starting the traversal from one vertex only and missing other components
- Mixing 1-based labels with 0-based arrays

## interview
**Q:** How do you find the town judge among n people given trust pairs?
**A:** Compute for each person the number of people who trust them minus the number they trust; the judge is the person with exactly n − 1, which means everyone else trusts them and they trust nobody.

**Q:** How do you decide between breadth first search and depth first search?
**A:** Use breadth first search when the shortest number of edges or level by level processing is needed, and depth first search for connectivity, ordering, cycle detection and exploring all paths.

**Q:** What are the edge cases to check in graph problems?
**A:** An empty graph, a single vertex, disconnected components, self loops, duplicate edges, cycles and the difference between directed and undirected edges.

## summary
Basic graph questions follow the same steps: build the adjacency list, pick breadth first search, depth first search, union-find or a weighted algorithm, track visited vertices and cover every component. State O(V + E) complexity and test disconnected inputs.

## codenote
The Python sample finds the town judge. The JavaScript sample finds a star centre and tests path existence.

## code
### python
```python
def town_judge(n, trust):
    score = [0] * (n + 1)
    for truster, trusted in trust:
        score[truster] -= 1
        score[trusted] += 1
    for person in range(1, n + 1):
        if score[person] == n - 1:
            return person
    return -1

print(town_judge(3, [(1, 3), (2, 3)]), town_judge(3, [(1, 3), (2, 3), (3, 1)]), town_judge(1, []))
```
Output:
```text
3 -1 1
```
### javascript
```javascript
function starCenter(edges) {
  const [a, b] = edges[0];
  return edges[1].includes(a) ? a : b;
}

function pathExists(n, edges, source, target) {
  const graph = Array.from({ length: n }, () => []);
  for (const [u, v] of edges) {
    graph[u].push(v);
    graph[v].push(u);
  }
  const seen = new Set([source]);
  const queue = [source];
  while (queue.length) {
    const node = queue.shift();
    if (node === target) return true;
    for (const next of graph[node]) {
      if (!seen.has(next)) {
        seen.add(next);
        queue.push(next);
      }
    }
  }
  return false;
}

console.log(starCenter([[1, 2], [2, 3], [4, 2]]));
console.log(pathExists(5, [[0, 1], [1, 2], [3, 4]], 0, 2), pathExists(5, [[0, 1], [1, 2], [3, 4]], 0, 4));
```
Output:
```text
2
true false
```

## quiz
1. Which traversal finds the fewest edges between two vertices in an unweighted graph?
   - [ ] Depth first search
   - [x] Breadth first search
   - [ ] Topological sort
   - [ ] Binary search
   > It explores vertices in order of distance.
2. Why must a traversal be started from every unvisited vertex?
   - [ ] To save memory
   - [x] The graph may have several components that one search does not reach
   - [ ] To detect self loops
   - [ ] To sort the vertices
   > Counts of components need every start.
3. How is the town judge recognised?
   - [ ] By the largest out-degree
   - [x] By trust score in minus out equal to n − 1
   - [ ] By being the first person
   - [ ] By appearing in no pair
   > Everybody else trusts them and they trust nobody.
4. What is the typical complexity of a graph traversal with an adjacency list?
   - [ ] O(V squared)
   - [x] O(V + E)
   - [ ] O(E squared)
   - [ ] O(V log E)
   > Each vertex and edge is processed a constant number of times.
