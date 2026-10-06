# Depth First Search
kind: algorithm
time: O(V + E) with an adjacency list, since every vertex is entered once and every edge is examined once (twice in an undirected graph); O(V squared) with an adjacency matrix.
space: O(V) for the visited set plus O(V) for the recursion stack or explicit stack, which is the height of the search tree and can reach V on a long path.
viz: dfs

## intro
Depth first search explores a graph by going as deep as possible along each branch before backing up. From a vertex it follows one unexplored edge to a new vertex, repeats, and only when a vertex has no new neighbours does it return to the previous one. This simple strategy is the foundation of cycle detection, topological sorting, connected components and many puzzle solvers.

## theory
Recursive definition:

- `visit(u)`: mark u as visited; for each neighbour v of u, if v is not visited, call `visit(v)`
- To cover all components, call `visit` from every unvisited vertex

The explicit stack version replaces recursion with a stack: push the start vertex; while the stack is not empty, pop a vertex, and if it is unvisited mark it and push its unvisited neighbours (in reverse order to mimic the recursive order). The recursive and iterative versions can differ in the order in which neighbours are explored unless neighbours are pushed in reverse.

Example graph (directed): 0 → 1, 0 → 2, 1 → 3, 2 → 3, 2 → 4, 3 → 5 and 4 → 5. Depth first search from 0 with neighbours in the listed order visits 0, 1, 3, 5, then backs up to 0 and continues with 2, then 4 (3 and 5 are already visited): the visiting order is 0, 1, 3, 5, 2, 4.

Timestamps: record a discovery time when a vertex is first reached and a finish time when its exploration is complete. For the example (counting from 1): vertex 0 is discovered at 1 and finished at 12; vertex 1 is discovered at 2 and finished at 7 (after 3 and 5); the vertex 5 finishes first, at time 5. The nesting of the intervals mirrors the search tree: a vertex's interval contains the intervals of its descendants.

Edge classification in a directed graph:

- Tree edge: leads to an undiscovered vertex (it becomes a child)
- Back edge: leads to an ancestor still being explored, which indicates a cycle
- Forward edge: leads to a finished descendant
- Cross edge: leads to a finished vertex that is neither an ancestor nor a descendant

In an undirected graph only tree edges and back edges exist. This classification powers cycle detection, topological sorting, bridges and strongly connected components.

What depth first search gives you:

- Reachability: the set of vertices reachable from the start
- A spanning tree of the component (the depth first tree) and parent pointers for paths (not shortest ones)
- Preorder and postorder sequences of the vertices
- Connected components, cycle detection, topological order (reverse postorder), strongly connected components, bridges and articulation points
- Backtracking over the choices of a search problem

Complexity: every vertex is visited once and every edge examined once or twice, giving O(V + E). The recursion depth equals the length of the deepest path, up to V, which overflows the default recursion limits (about 1000 in Python) for long chains; use an explicit stack, or raise the limit and run in a thread with a larger stack, for large graphs.

Comparison with breadth first search: depth first search uses memory proportional to the depth of the search, suits problems that need complete exploration or ordering, and does not find shortest paths; breadth first search uses memory proportional to the widest level and finds shortest paths in unweighted graphs (next lessons).

Applications: solving mazes and puzzles with backtracking, finding all paths between two vertices, detecting cycles, ordering dependencies, labelling components, analysing the structure of directed graphs and generating mazes.

Implementation notes: use a visited array, not recursion on the graph structure itself; pass parent information when needed (undirected cycle detection); keep neighbour iteration order consistent if the output order must be reproducible.

Pitfalls: forgetting to mark a vertex before recursing (infinite loops), marking vertices when popping rather than pushing in the iterative version without checking again (duplicates in the stack), stack overflow on deep graphs and assuming the path found is shortest.

## explain
1. Create a visited set and an empty result list.
2. For each vertex that is not visited, call the visit procedure.
3. In visit, mark the vertex, record it and recurse into every unvisited neighbour.
4. Optionally record discovery and finish times.
5. For deep graphs use an explicit stack instead of recursion.
6. Remember that the first path found is not necessarily the shortest.

## example
The Python program runs recursive and iterative depth first search on the sample graph, printing the visiting order 0, 1, 3, 5, 2, 4 for both, the discovery times and the finish times; the edges 2 → 3 and 4 → 5 are cross edges because their targets are already finished when they are examined. The JavaScript program finds a path between two vertices with depth first search and prints it.

## real
Maze solvers, dependency resolvers, file system walkers and web crawlers that follow links deeply use depth first search.

## pros
- Linear time and simple to implement
- Memory proportional to the search depth
- Basis for many advanced graph algorithms

## cons
- Does not find shortest paths
- Recursion can overflow on deep graphs
- The visiting order depends on neighbour order

## uses
- Reachability and path finding
- Cycle detection and topological ordering
- Connected and strongly connected components
- Backtracking and maze solving

## mistakes
- Forgetting to mark vertices visited before exploring
- Assuming the first path found is the shortest
- Using recursion for very deep graphs
- Pushing vertices onto the stack without checking visited status when popping

## interview
**Q:** How does depth first search work?
**A:** From the current vertex it visits an unvisited neighbour and repeats from there, going as deep as possible, and backs up when no unvisited neighbours remain, marking vertices visited to avoid repeating work.

**Q:** What is the time and space complexity of depth first search?
**A:** O(V + E) time with adjacency lists, and O(V) space for the visited set and the recursion or explicit stack.

**Q:** What does a back edge indicate?
**A:** An edge from a vertex to one of its ancestors in the depth first tree, which closes a cycle.

## summary
Depth first search explores each branch to the end before backtracking, in O(V + E) time with O(V) memory, and its edge types and timestamps drive cycle detection, topological sorting and component algorithms. It does not find shortest paths.

## codenote
The Python sample shows orders and timestamps. The JavaScript sample finds a path.

## code
### python
```python
graph = {0: [1, 2], 1: [3], 2: [3, 4], 3: [5], 4: [5], 5: []}

def dfs_recursive(start):
    order, seen = [], set()
    clock, discovered, finished = [0], {}, {}

    def visit(node):
        seen.add(node)
        order.append(node)
        clock[0] += 1
        discovered[node] = clock[0]
        for nxt in graph[node]:
            if nxt not in seen:
                visit(nxt)
        clock[0] += 1
        finished[node] = clock[0]

    visit(start)
    return order, discovered, finished

def dfs_iterative(start):
    order, seen, stack = [], set(), [start]
    while stack:
        node = stack.pop()
        if node in seen:
            continue
        seen.add(node)
        order.append(node)
        stack.extend(reversed(graph[node]))
    return order

order, discovered, finished = dfs_recursive(0)
print(order, dfs_iterative(0) == order)
print(discovered)
print(finished)
```
Output:
```text
[0, 1, 3, 5, 2, 4] True
{0: 1, 1: 2, 3: 3, 5: 4, 2: 8, 4: 9}
{5: 5, 3: 6, 1: 7, 4: 10, 2: 11, 0: 12}
```
### javascript
```javascript
const graph = { A: ["B", "C"], B: ["D"], C: ["D", "E"], D: [], E: ["F"], F: [] };

function findPath(start, goal, path = [start], seen = new Set([start])) {
  if (start === goal) return path;
  for (const next of graph[start]) {
    if (seen.has(next)) continue;
    seen.add(next);
    const found = findPath(next, goal, [...path, next], seen);
    if (found) return found;
  }
  return null;
}

console.log(findPath("A", "F").join(" -> "), findPath("D", "A"));
```
Output:
```text
A -> C -> E -> F null
```

## quiz
1. What does depth first search do after reaching a vertex with no unvisited neighbours?
   - [ ] Stops completely
   - [x] Backtracks to the previous vertex and continues from there
   - [ ] Restarts from the first vertex
   - [ ] Visits all vertices at the same depth
   > Backing up is what gives it its depth-first character.
2. What data structure does an iterative depth first search use?
   - [ ] A queue
   - [x] A stack
   - [ ] A heap
   - [ ] A hash map only
   > The stack replaces the recursion.
3. What does a back edge in a directed graph show?
   - [ ] A shortest path
   - [x] A cycle
   - [ ] A disconnected component
   - [ ] A tree edge
   > It leads to an ancestor that is still being explored.
4. What is the time complexity of depth first search with adjacency lists?
   - [ ] O(V squared)
   - [x] O(V + E)
   - [ ] O(E squared)
   - [ ] O(V log V)
   > Each vertex and edge is processed a constant number of times.

# Breadth First Search
kind: algorithm
time: O(V + E) with an adjacency list, since each vertex is enqueued once and each edge is examined once or twice; O(V squared) with an adjacency matrix.
space: O(V) for the visited set and the queue, which can hold a whole level of the graph at once.
viz: bfs

## intro
Breadth first search explores a graph in rings around the start: first the start itself, then everything one edge away, then everything two edges away, and so on. A queue enforces this order. The ring structure is what makes it the right algorithm for the fewest number of steps in an unweighted graph and for any process that spreads level by level.

## theory
Algorithm:

- Put the start vertex in a queue and mark it visited
- While the queue is not empty: remove the front vertex u, process it, and for each neighbour v not yet visited, mark v visited and add it to the back of the queue
- Marking at enqueue time (not at dequeue time) guarantees each vertex enters the queue once

Why it explores by levels: the queue holds first the vertices at distance d and then the vertices at distance d + 1, because the neighbours of the distance d vertices are appended behind the other distance d vertices. So vertices come out in non-decreasing order of distance from the start.

Distances and parents: store `dist[v] = dist[u] + 1` when v is first discovered, and `parent[v] = u`. Following parents from any vertex back to the start gives a shortest path in terms of the number of edges. Unreachable vertices keep an infinite distance.

Example graph (undirected): 0-1, 0-2, 1-3, 2-3, 2-4, 3-5 and 4-5. From vertex 0 the visiting order is 0, 1, 2, 3, 4, 5 and the distances are 0 for vertex 0, 1 for vertices 1 and 2, 2 for vertices 3 and 4 and 3 for vertex 5. The shortest path to 5 has three edges, for instance 0 → 1 → 3 → 5.

Level by level processing: process the queue in rounds, using the queue length at the start of each round, to obtain the list of vertices at each distance: `[[0], [1, 2], [3, 4], [5]]`. The number of rounds is the eccentricity of the start vertex (the largest distance reached).

Properties:

- Finds the shortest path (fewest edges) from the start to every reachable vertex in an unweighted graph
- The breadth first tree contains shortest paths from the root
- Visits each connected component starting from a vertex; loop over all vertices to cover disconnected graphs
- Works on directed and undirected graphs, on explicit graphs and on implicit state spaces

Complexity: O(V + E) time and O(V) space; the memory is the widest level. In a grid of size n by n the queue can hold O(n) cells; in a tree with branching factor b and depth d the last level holds b^d vertices, which can be too large, where depth first search or iterative deepening would use far less memory.

Applications:

- Shortest path in unweighted graphs and grids, such as mazes and the number of moves in puzzles
- Level order traversal of trees
- Finding connected components, checking bipartiteness (two-colouring), and testing whether the graph is connected
- Spreading and propagation: rotting oranges, flood fill, infection models, social network distance (degrees of separation)
- Web crawling by link depth, garbage collection (copying collectors use breadth first scanning), peer to peer broadcast
- Shortest path with state in implicit graphs: lock combinations, word ladders, sliding puzzles

Implementation notes: use a real queue (`collections.deque` in Python; an array with `shift` is O(n) in some engines for large queues, so use an index pointer); mark visited when enqueuing; store distances in an array initialised to −1; keep parents if the path is needed.

Pitfalls: marking visited at dequeue time (vertices enter the queue many times), using a list with pop(0) as the queue (quadratic time), applying it to weighted graphs where edges have different costs (use Dijkstra) and forgetting multiple components.

Testing: start equals target (distance 0), unreachable vertices, graphs with cycles and a long path.

## explain
1. Create a queue with the start vertex and mark it visited with distance zero.
2. Remove the front vertex and look at its neighbours.
3. For every unvisited neighbour, mark it, set its distance and parent, and enqueue it.
4. Repeat until the queue is empty.
5. Read distances, levels or the path from the parent pointers.
6. Run it from each unvisited vertex when all components are needed.

## example
The Python program runs breadth first search on the sample graph and prints the order 0, 1, 2, 3, 4, 5, the distances, the levels `[[0], [1, 2], [3, 4], [5]]` and a shortest path to vertex 5: 0, 1, 3, 5. The JavaScript program computes distances for a graph with an unreachable vertex and prints −1 for it.

## real
Social networks compute degrees of separation, routing protocols flood messages level by level, and games compute the minimum number of moves with breadth first search.

## pros
- Gives fewest-edge routes without needing weights
- Natural level by level structure
- Linear time and simple code

## cons
- Queue memory can be large for wide graphs
- Not suitable for weighted shortest paths
- Needs care to mark vertices when enqueuing

## uses
- Shortest paths in unweighted graphs and grids
- Level order processing
- Spreading and flood processes
- Finding connected components and testing bipartiteness

## mistakes
- Marking vertices visited only when they are dequeued
- Using list.pop(0) as the queue in Python
- Using it for weighted graphs
- Forgetting to restart for other components

## interview
**Q:** Why does breadth first search find shortest paths in unweighted graphs?
**A:** It visits vertices in order of increasing distance because of the queue, so the first time a vertex is discovered it is reached by a path with the fewest edges.

**Q:** When should visited be set in breadth first search?
**A:** When a vertex is added to the queue, so that it cannot be enqueued again through another neighbour before it is processed.

**Q:** What is the space complexity and when can it be a problem?
**A:** O(V), dominated by the queue, which holds a whole level; for graphs or trees with a huge branching factor the last level can be too big, and depth first search may be preferable.

## summary
Breadth first search uses a queue to explore a graph by increasing distance in O(V + E), giving shortest paths and levels in unweighted graphs. Mark vertices on enqueue and keep distances and parents.

## codenote
The Python sample prints order, levels and a path. The JavaScript sample marks unreachable vertices.

## code
### python
```python
from collections import deque

graph = {0: [1, 2], 1: [0, 3], 2: [0, 3, 4], 3: [1, 2, 5], 4: [2, 5], 5: [3, 4]}

def bfs(start):
    dist, parent, order = {start: 0}, {start: None}, []
    queue = deque([start])
    while queue:
        node = queue.popleft()
        order.append(node)
        for nxt in graph[node]:
            if nxt not in dist:
                dist[nxt] = dist[node] + 1
                parent[nxt] = node
                queue.append(nxt)
    return order, dist, parent

order, dist, parent = bfs(0)
print(order, dist)
levels = {}
for node, d in dist.items():
    levels.setdefault(d, []).append(node)
print([levels[d] for d in sorted(levels)])
path, node = [], 5
while node is not None:
    path.append(node)
    node = parent[node]
print(path[::-1])
```
Output:
```text
[0, 1, 2, 3, 4, 5] {0: 0, 1: 1, 2: 1, 3: 2, 4: 2, 5: 3}
[[0], [1, 2], [3, 4], [5]]
[0, 1, 3, 5]
```
### javascript
```javascript
function distances(graph, start) {
  const dist = Object.fromEntries(Object.keys(graph).map((v) => [v, -1]));
  dist[start] = 0;
  const queue = [start];
  for (let head = 0; head < queue.length; head++) {
    const node = queue[head];
    for (const next of graph[node]) {
      if (dist[next] === -1) {
        dist[next] = dist[node] + 1;
        queue.push(next);
      }
    }
  }
  return dist;
}

const graph = { a: ["b"], b: ["a", "c"], c: ["b"], d: ["e"], e: ["d"] };
console.log(JSON.stringify(distances(graph, "a")));
```
Output:
```text
{"a":0,"b":1,"c":2,"d":-1,"e":-1}
```

## quiz
1. Which structure does breadth first search use?
   - [ ] A stack
   - [x] A queue
   - [ ] A priority queue
   - [ ] A hash set only
   > It processes vertices in the order they were discovered.
2. When is a vertex marked as visited?
   - [ ] When it is dequeued
   - [x] When it is enqueued
   - [ ] After its neighbours are done
   - [ ] Never
   > This prevents repeated insertions.
3. What does breadth first search compute in an unweighted graph?
   - [ ] Longest paths
   - [x] Shortest paths in number of edges from the start
   - [ ] Topological order
   - [ ] Spanning trees of minimum weight
   > Vertices are reached in non-decreasing distance.
4. How much memory does breadth first search need in the worst case?
   - [ ] O(1)
   - [x] O(V)
   - [ ] O(V squared)
   - [ ] O(E squared)
   > The visited set and queue hold up to all vertices.

# DFS vs BFS Comparison
kind: concept
time: Not an algorithmic topic — both traversals cost O(V + E) with adjacency lists. The comparison concerns which one is correct for a given question and how much memory each needs.
space: Not an algorithmic topic — depth first search needs memory proportional to the depth of the search (up to V), breadth first search proportional to the widest level (up to V); which is smaller depends on the shape of the graph.

## intro
Depth first search and breadth first search visit the same vertices in the same total time, yet they are not interchangeable. They differ in the order of exploration, in the memory they need, in the guarantees they give about paths and in the problems they suit. Knowing which to reach for is a basic graph skill.

## theory
Mechanics:

- DFS: a stack (explicitly or via recursion); explores one branch fully before trying another
- BFS: a queue; explores all vertices at distance d before distance d + 1
- Replacing the stack by a queue in the iterative template turns DFS into BFS, and the rest of the code stays the same

Guarantees:

- Shortest path (fewest edges) in an unweighted graph: BFS guarantees it, DFS does not. In a graph where the start A has neighbours B and C, B leads to D, which leads to the goal G, and C leads to G directly, DFS going through B first returns the path A → B → D → G (length 3) while BFS returns A → C → G (length 2).
- Completeness: both visit every reachable vertex in a finite graph; in an infinite or very deep graph DFS may never return from a branch that does not contain the goal, while BFS finds a goal at finite depth
- Path found: DFS returns some path, BFS returns a shortest one
- Weighted graphs: neither finds cheapest paths in general (use Dijkstra)

Memory:

- DFS stores the current path (depth) plus visited marks. For a balanced binary tree with 2^20 nodes the stack depth is about 20.
- BFS stores a whole level. For the same tree the last level has 2^19 nodes, over 500,000 entries in the queue.
- For a long path-like graph (a linked list) DFS stores V entries while BFS stores one or two at a time
- Rule of thumb: bushy graphs favour DFS for memory; long thin graphs favour BFS; iterative deepening DFS combines the depth-limited memory of DFS with the shortest-path guarantee of BFS at the price of repeating work

Problems and the natural choice:

- Shortest number of moves, minimum steps, levels, nearest target: BFS
- Spreading from several sources at once: multi-source BFS
- Detecting cycles, finding bridges, articulation points and strongly connected components: DFS (needs discovery and finish times)
- Topological sorting: DFS (reverse postorder) or BFS (Kahn's algorithm)
- Connected components: either works; DFS is often shorter
- Enumerating all paths or solutions, backtracking, permutations, sudoku, maze generation: DFS
- Bipartite checking: either
- Checking if a path exists: either; DFS uses less memory on wide graphs, BFS gives the length too
- Game trees: DFS with pruning (alpha-beta); BFS is rarely feasible because of the memory

Order of visits on the same graph: for the graph 0 → 1, 0 → 2, 1 → 3, 2 → 3, 2 → 4, 3 → 5, 4 → 5 starting at 0, DFS visits 0, 1, 3, 5, 2, 4 and BFS visits 0, 1, 2, 3, 4, 5. The DFS order dives down the first branch to the end; the BFS order lists distance one vertices before distance two.

Recursion limits: DFS recursion can overflow the call stack on deep graphs; BFS uses an explicit queue and has no such limit. An iterative DFS removes the limitation too.

Hybrid and related strategies: iterative deepening depth first search (IDDFS), bidirectional BFS (search from both ends and meet, reducing b^d to 2 b^(d/2)), best first search and A* (priority queue ordered by estimated cost), and beam search.

Decision procedure: ask whether the question concerns distance or levels (BFS), structure such as cycles and ordering (DFS), exhaustive search (DFS), or memory limits (look at depth versus width).

## explain
1. State what the question asks: shortest distance, existence, structure or exhaustive enumeration.
2. Choose BFS for shortest paths and level based questions.
3. Choose DFS for ordering, cycles, components and backtracking.
4. Estimate depth and width to compare memory use.
5. Replace the stack with a queue (or the reverse) to switch strategies in the same template.
6. Consider iterative deepening or bidirectional search for huge graphs.

## example
The Python program searches for a goal with both strategies on a small graph and prints the path found by each, the longer DFS path and the shortest BFS path, plus the maximum size of the stack and of the queue on a complete binary tree with depth 10. The JavaScript program prints the visiting orders of both traversals on the sample graph.

## real
Navigation and puzzle solvers use breadth first search for fewest moves, compilers and build tools use depth first search for dependency ordering, and game engines use depth first search with pruning for move search.

## pros
- Both run in linear time, so the choice is about fit
- Swapping the data structure converts one into the other
- Hybrid methods combine their strengths

## cons
- DFS can return long paths and overflow the recursion stack
- BFS can use huge amounts of memory on wide graphs
- Neither handles weighted shortest paths

## uses
- Choosing a traversal for a new problem
- Comparing memory use on trees and graphs
- Explaining shortest path guarantees
- Selecting strategies for search and puzzle solving

## mistakes
- Using DFS to find the fewest steps
- Using BFS on a huge branching tree and running out of memory
- Assuming one traversal is always faster
- Forgetting the recursion limit in depth first search

## interview
**Q:** When would you choose BFS over DFS?
**A:** When you need the shortest path in terms of edges, the minimum number of steps or level by level processing, because BFS reaches vertices in order of distance.

**Q:** When is DFS preferable?
**A:** For exploring all possibilities, detecting cycles, topological sorting, finding strongly connected components and when the graph is wide and memory is limited, since DFS stores only the current path.

**Q:** How can you combine the memory advantage of DFS with the shortest path guarantee of BFS?
**A:** Use iterative deepening depth first search, which runs depth limited searches with increasing limits, repeating some work but keeping memory proportional to the depth.

## summary
DFS and BFS both cost O(V + E) but differ in the order of exploration, memory profile and guarantees: BFS finds shortest paths and uses width-sized memory, DFS finds structure and uses depth-sized memory. Pick by the question asked and the shape of the graph.

## codenote
The Python sample compares paths and memory. The JavaScript sample prints the two visiting orders.

## code
### python
```python
from collections import deque

graph = {"A": ["B", "C"], "B": ["D"], "C": ["G"], "D": ["G"], "G": []}

def search(start, goal, use_queue):
    frontier = deque([(start, [start])])
    seen = {start}
    while frontier:
        node, path = frontier.popleft() if use_queue else frontier.pop()
        if node == goal:
            return path
        for nxt in (graph[node] if use_queue else reversed(graph[node])):
            if nxt not in seen:
                seen.add(nxt)
                frontier.append((nxt, path + [nxt]))

print(search("A", "G", False), search("A", "G", True))

def peak(depth, use_queue):
    frontier, best = deque([0]), 1
    while frontier:
        node = frontier.popleft() if use_queue else frontier.pop()
        if node < 2 ** depth - 1:
            frontier.extend((2 * node + 1, 2 * node + 2))
        best = max(best, len(frontier))
    return best

print(peak(10, False), peak(10, True))
```
Output:
```text
['A', 'B', 'D', 'G'] ['A', 'C', 'G']
11 1024
```
### javascript
```javascript
const graph = { 0: [1, 2], 1: [3], 2: [3, 4], 3: [5], 4: [5], 5: [] };

function traverse(start, useQueue) {
  const order = [];
  const seen = new Set();
  const frontier = [start];
  while (frontier.length) {
    const node = useQueue ? frontier.shift() : frontier.pop();
    if (seen.has(node)) continue;
    seen.add(node);
    order.push(node);
    const next = useQueue ? graph[node] : [...graph[node]].reverse();
    frontier.push(...next);
  }
  return order.join(" ");
}

console.log("dfs", traverse(0, false), "| bfs", traverse(0, true));
```
Output:
```text
dfs 0 1 3 5 2 4 | bfs 0 1 2 3 4 5
```

## quiz
1. Which traversal guarantees the path with the fewest edges?
   - [ ] Depth first search
   - [x] Breadth first search
   - [ ] Both always
   - [ ] Neither
   > Vertices are reached in order of distance.
2. What does depth first search store in memory in addition to visited marks?
   - [ ] The whole level of the graph
   - [x] The current path or recursion stack
   - [ ] All paths found so far
   - [ ] Nothing
   > Its memory is proportional to the depth.
3. Which data structure change turns the iterative DFS template into BFS?
   - [x] Replacing the stack with a queue
   - [ ] Sorting the neighbours
   - [ ] Adding a heap
   - [ ] Removing the visited set
   > Only the order in which the frontier is removed changes.
4. What does iterative deepening combine?
   - [ ] Sorting and hashing
   - [x] The memory profile of DFS with the shortest path property of BFS
   - [ ] Two stacks
   - [ ] Dijkstra and Prim
   > It runs depth limited searches with growing limits.

# Topological Sort Kahn
kind: algorithm
time: O(V + E) because every vertex is removed from the queue once and every edge is relaxed once when its source is removed.
space: O(V + E) for the adjacency lists plus O(V) for the in-degree array, the queue and the output order.
viz: topological-sort

## intro
A topological order lists the vertices of a directed acyclic graph so that every edge points from an earlier vertex to a later one: prerequisites before the things that depend on them. Kahn's algorithm builds such an order by repeatedly taking a vertex that has no unfinished prerequisites. It needs no recursion, produces the order naturally and detects cycles as a side effect.

## theory
Algorithm:

- Compute the in-degree (number of incoming edges) of every vertex
- Put all vertices with in-degree zero in a queue; they have no prerequisites
- While the queue is not empty: remove a vertex u, append it to the order, and for each edge `(u, v)` decrease `indegree[v]`; when `indegree[v]` reaches zero, put v in the queue
- At the end, if the order has V vertices it is a valid topological order; if it has fewer, the remaining vertices are on cycles or depend on them, so the graph has a cycle

Why it is correct: a vertex enters the queue only when all its predecessors have already been emitted, so every edge goes forward in the output. If a cycle exists, no vertex on it ever reaches in-degree zero, so none is emitted.

Example: courses 0 to 5 with prerequisites 5 → 2, 5 → 0, 4 → 0, 4 → 1, 2 → 3 and 3 → 1. The sources are 4 and 5 (in-degree zero), vertices 0 and 1 have in-degree 2, and vertices 2 and 3 have in-degree 1. A plain queue gives the order 4, 5, 2, 0, 3, 1, while a min-heap (always take the smallest available vertex) gives the lexicographically smallest order 4, 5, 0, 2, 3, 1. Both are valid, since the graph has several valid orders.

Properties and variants:

- The order is not unique unless the queue holds one vertex at every step; if the queue ever holds two vertices, they can be output in either order
- Lexicographically smallest order: use a min-heap instead of a queue (O((V + E) log V))
- Layered order (parallel scheduling): process the queue in rounds; vertices in the same round have no dependencies on each other and can run in parallel. The number of rounds is the length of the longest path plus one. In the example the rounds are `[4, 5]`, `[0, 2]`, `[3]`, `[1]`, so at least 4 time steps are needed.
- Counting orders and longest paths: dynamic programming along the order
- Cycle detection: compare the number of emitted vertices with V
- Course schedule: can all courses be completed? Yes exactly when the order contains all courses; the order itself answers "course schedule II"
- Alien dictionary: derive precedence edges between letters from adjacent words, then topologically sort; a cycle or an invalid prefix order means no valid alphabet
- Build systems and package managers order compilation or installation steps this way

Comparison with the DFS method: Kahn's algorithm is iterative, easy to parallelise and gives layers; the depth first method (next lesson) uses reverse postorder, needs recursion or a stack and detects cycles with colours. Both are O(V + E).

Implementation details:

- Build `indegree` while reading the edges; store adjacency as lists of out-neighbours
- Start with every zero in-degree vertex (all components)
- Use `collections.deque` (or an index pointer) for the queue
- Return the order together with a success flag, or an empty list on failure
- For multiple edges between the same pair, count each edge in the in-degree and decrease once per edge

Pitfalls: forgetting isolated vertices (they have in-degree zero and must appear in the order), decreasing in-degrees only for the first edge of a duplicate pair, using Kahn's algorithm on an undirected graph and treating the result as meaningful, and comparing the order with a single expected sequence in tests rather than checking validity.

Testing: verify that for every edge the source appears before the target; verify the length equals V for DAGs and is less for cyclic graphs.

## explain
1. Compute the in-degree of each vertex and the out-neighbour lists.
2. Put all vertices with in-degree zero into the queue.
3. Remove a vertex, output it and decrease the in-degree of each out-neighbour.
4. Enqueue each neighbour whose in-degree becomes zero.
5. If fewer than V vertices were output, report a cycle.
6. Validate the order by checking every edge.

## example
The Python program produces the orders 4, 5, 2, 0, 3, 1 (queue) and 4, 5, 0, 2, 3, 1 (min-heap) for the sample prerequisites, the layers `[[4, 5], [0, 2], [3], [1]]`, the lexicographically smallest order with a heap and the failure on a graph with a cycle. The JavaScript program checks the validity of an order against the edge list.

## real
Package managers install libraries in dependency order, build systems compile files after the files they include and course planners find the sequence of classes that respects prerequisites.

## pros
- Iterative and easy to implement
- Detects cycles without extra work
- Yields layers for parallel scheduling

## cons
- Needs in-degree bookkeeping
- Gives one of many valid orders
- Only meaningful for directed graphs

## uses
- Sequencing steps so that prerequisites come first
- Course schedule problems
- Parallel scheduling by layers
- Deriving an alphabet order from sorted words

## mistakes
- Forgetting vertices with no edges
- Not decreasing the in-degree once per edge for duplicate edges
- Testing the order by equality with a fixed sequence
- Ignoring the cycle case when fewer vertices are emitted

## interview
**Q:** How does Kahn's algorithm produce a topological order?
**A:** It repeatedly removes vertices with in-degree zero from the graph, appending them to the order and decreasing the in-degree of their neighbours, so a vertex is emitted only after all of its prerequisites.

**Q:** How do you detect a cycle with Kahn's algorithm?
**A:** If the algorithm outputs fewer than V vertices, the remaining ones can never reach in-degree zero because they lie on a cycle or depend on one.

**Q:** How can the algorithm give the earliest rounds for parallel execution?
**A:** Process the queue level by level: all vertices in one round have no pending prerequisites, and the number of rounds equals the length of the longest path plus one.

## summary
Kahn's algorithm outputs vertices with no remaining prerequisites in O(V + E), producing a topological order or revealing a cycle, and it yields layers for parallel scheduling. Check validity rather than a fixed sequence.

## codenote
The Python sample orders courses and layers. The JavaScript sample validates an order.

## code
### python
```python
import heapq
from collections import deque

n = 6
edges = [(5, 2), (5, 0), (4, 0), (4, 1), (2, 3), (3, 1)]

def kahn(vertex_count, edge_list, smallest_first=False):
    out = [[] for _ in range(vertex_count)]
    indegree = [0] * vertex_count
    for u, v in edge_list:
        out[u].append(v)
        indegree[v] += 1
    ready = [v for v in range(vertex_count) if indegree[v] == 0]
    if smallest_first:
        heapq.heapify(ready)
    else:
        ready = deque(ready)
    order = []
    while ready:
        node = heapq.heappop(ready) if smallest_first else ready.popleft()
        order.append(node)
        for nxt in out[node]:
            indegree[nxt] -= 1
            if indegree[nxt] == 0:
                heapq.heappush(ready, nxt) if smallest_first else ready.append(nxt)
    return order

def layers_of(vertex_count, edge_list):
    out = [[] for _ in range(vertex_count)]
    indegree = [0] * vertex_count
    for u, v in edge_list:
        out[u].append(v)
        indegree[v] += 1
    layer, result = [v for v in range(vertex_count) if indegree[v] == 0], []
    while layer:
        result.append(sorted(layer))
        following = []
        for node in layer:
            for nxt in out[node]:
                indegree[nxt] -= 1
                if indegree[nxt] == 0:
                    following.append(nxt)
        layer = following
    return result

print(kahn(n, edges), kahn(n, edges, True))
print(layers_of(n, edges))
print(len(kahn(3, [(0, 1), (1, 2), (2, 1)])) < 3)
```
Output:
```text
[4, 5, 2, 0, 3, 1] [4, 5, 0, 2, 3, 1]
[[4, 5], [0, 2], [3], [1]]
True
```
### javascript
```javascript
function isValidOrder(order, edges) {
  const position = new Map(order.map((v, i) => [v, i]));
  return edges.every(([u, v]) => position.get(u) < position.get(v));
}

const edges = [[5, 2], [5, 0], [4, 0], [4, 1], [2, 3], [3, 1]];
console.log(isValidOrder([4, 5, 0, 2, 3, 1], edges), isValidOrder([0, 1, 2, 3, 4, 5], edges));
```
Output:
```text
true false
```

## quiz
1. Which vertices does Kahn's algorithm start with?
   - [ ] Vertices with the largest out-degree
   - [x] Vertices with in-degree zero
   - [ ] Vertices on cycles
   - [ ] The vertex with the smallest label only
   > They have no prerequisites.
2. What does it mean if fewer than V vertices are output?
   - [ ] The graph is a tree
   - [x] The graph contains a cycle
   - [ ] The graph is undirected
   - [ ] The graph is bipartite
   > Vertices on a cycle never reach in-degree zero.
3. What does processing in rounds provide?
   - [ ] A shorter order
   - [x] Layers of vertices that can be done in parallel
   - [ ] A sorted adjacency list
   - [ ] A unique order
   > Each layer has no internal dependencies.
4. How do you obtain the lexicographically smallest topological order?
   - [ ] Use a stack
   - [x] Use a min-heap instead of a queue
   - [ ] Sort the edges
   - [ ] Run it twice
   > The smallest available vertex is always taken next.

# Topological Sort DFS
kind: algorithm
time: O(V + E) since the depth first search visits each vertex and edge once and the order is read off the finish times.
space: O(V) for the visited colours, the recursion stack and the output list.
viz: topological-sort

## intro
Depth first search gives a second way to order a directed acyclic graph: when a vertex has been fully explored (all vertices reachable from it are finished), put it at the front of the order. The vertices finish in reverse topological order, so reversing the finishing sequence produces the topological order, and meeting a vertex that is still being explored reveals a cycle.

## theory
Algorithm:

- Colour all vertices white (unvisited)
- For each white vertex, run `visit(u)`: colour u grey (in progress); for each out-neighbour v, if v is grey there is a cycle, if v is white recurse; after all neighbours colour u black (finished) and append u to a list
- The reverse of the list (reverse postorder) is a topological order

Why it works: consider an edge `(u, v)`. When u is explored, v is either unvisited (then v will finish before u, as a descendant), or already finished (v finished before u), or grey (v is an ancestor still in progress, a back edge, which means a cycle). In an acyclic graph the first two cases hold, so v finishes before u, hence u appears before v in the reversed list.

Example: the graph 5 → 2, 5 → 0, 4 → 0, 4 → 1, 2 → 3 and 3 → 1. Visiting the vertices in numerical order: start at 0 (no out-edges) finishing 0; start at 1, finishing 1; start at 2 → 3 → 1 (finished), finishing 3 then 2; vertex 4 finishes after 0 and 1; vertex 5 finishes last. The finishing sequence is 0, 1, 3, 2, 4, 5 and the reverse, 5, 4, 2, 3, 1, 0, is a valid topological order (every edge goes forward). This differs from the order Kahn's algorithm gave, since many orders are valid.

Cycle handling: with the three colour scheme an edge to a grey vertex means a back edge. Report the failure (or return an empty list). A graph like 0 → 1, 1 → 2, 2 → 0 is detected at the edge 2 → 0 when 0 is still grey.

Recursion and large graphs: the recursion depth can reach V, so for large inputs use an explicit stack storing (vertex, neighbour index) pairs, or raise the recursion limit carefully. The iterative version pushes a vertex, advances through its neighbours, and appends it to the postorder list when its neighbour pointer is exhausted.

Comparison with Kahn's algorithm:

- DFS: recursive structure, finds the order in a single traversal, gives the finish times used by other algorithms (strongly connected components), detects cycles with colours, produces an order biased toward the last vertices
- Kahn: iterative, needs in-degrees, produces layers and a lexicographic variant easily, easy to parallelise

Variants:

- Course schedule II: return the order, or an empty list if a cycle exists
- Alien dictionary: build edges from the first difference between adjacent words and sort the letters topologically
- Longest path in a DAG: process vertices in reverse finishing order and relax edges
- All topological orders: backtracking over the available sources (exponential)
- Strongly connected components with Kosaraju's algorithm use finishing times from a first DFS on the graph and a second DFS on the transpose graph
- Dependency resolution in build systems uses DFS with a "visiting" mark to print a helpful cycle message

Pitfalls: appending the vertex before exploring its neighbours (gives preorder, not postorder), forgetting to reverse the list, treating a visited (black) neighbour as a cycle (only grey indicates one) and starting the search from only one vertex.

Testing: validate each edge direction in the output, compare with Kahn's algorithm for existence of an order, and test cyclic graphs, graphs with isolated vertices and a long chain (to check recursion depth).

## explain
1. Colour all vertices white and prepare an empty finishing list.
2. For each white vertex start a depth first visit.
3. Mark the vertex grey, explore the out-neighbours, and report a cycle if one is grey.
4. When all neighbours are done, mark the vertex black and append it to the list.
5. Reverse the list to get the topological order.
6. Use an explicit stack when the graph can be deep.

## example
The Python program prints the finishing sequence 0, 1, 3, 2, 4, 5 and the reversed order 5, 4, 2, 3, 1, 0 for the sample graph, validates the order edge by edge, and reports the cycle for the 3 cycle graph. The JavaScript program uses the same method for a course schedule and prints a valid order or an empty list.

## real
Compilers order declarations and modules, spreadsheets recompute formulas after their inputs and package managers print a dependency cycle when depth first search finds a back edge.

## pros
- Single traversal with a clear correctness argument
- Detects cycles with the grey colour
- Provides finish times useful for other algorithms

## cons
- Deep dependency chains can exhaust the call stack
- The resulting order is one of many valid ones
- Slightly less intuitive than Kahn's algorithm

## uses
- Topological ordering of dependencies
- Course schedule and build ordering
- Cycle detection in directed graphs
- A first pass in strongly connected component algorithms

## mistakes
- Recording vertices in preorder instead of postorder
- Forgetting to reverse the finishing list
- Treating any visited neighbour as a cycle instead of only a grey one
- Starting the depth first search from a single vertex

## interview
**Q:** How does depth first search produce a topological order?
**A:** It appends each vertex to a list after all vertices reachable from it have finished; reversing that list gives an order in which every edge goes forward.

**Q:** How do you detect a cycle during this process?
**A:** Keep three colours; if the search reaches a grey vertex, which is still on the current recursion path, there is a back edge and therefore a cycle.

**Q:** What is the difference between this method and Kahn's algorithm?
**A:** The depth first method uses reverse postorder and colours with recursion or a stack, while Kahn's algorithm repeatedly removes vertices of in-degree zero using in-degree counts and a queue; both run in O(V + E).

## summary
A depth first search that appends vertices when they finish and then reverses the list yields a topological order in O(V + E), and an edge to a grey vertex signals a cycle. It is the basis of finish time based algorithms.

## codenote
The Python sample orders vertices by finishing time. The JavaScript sample solves a course schedule.

## code
### python
```python
n = 6
edges = [(5, 2), (5, 0), (4, 0), (4, 1), (2, 3), (3, 1)]

def topological_sort(vertex_count, edge_list):
    out = [[] for _ in range(vertex_count)]
    for u, v in edge_list:
        out[u].append(v)
    colour = [0] * vertex_count
    finished = []

    def visit(node):
        colour[node] = 1
        for nxt in out[node]:
            if colour[nxt] == 1:
                return False
            if colour[nxt] == 0 and not visit(nxt):
                return False
        colour[node] = 2
        finished.append(node)
        return True

    for vertex in range(vertex_count):
        if colour[vertex] == 0 and not visit(vertex):
            return None, finished
    return finished[::-1], finished

order, finished = topological_sort(n, edges)
print(finished)
print(order)
position = {v: i for i, v in enumerate(order)}
print(all(position[u] < position[v] for u, v in edges))
print(topological_sort(3, [(0, 1), (1, 2), (2, 0)])[0])
```
Output:
```text
[0, 1, 3, 2, 4, 5]
[5, 4, 2, 3, 1, 0]
True
None
```
### javascript
```javascript
function courseOrder(count, prerequisites) {
  const out = Array.from({ length: count }, () => []);
  for (const [course, requires] of prerequisites) out[requires].push(course);
  const state = new Array(count).fill(0);
  const finished = [];
  const visit = (node) => {
    state[node] = 1;
    for (const next of out[node]) {
      if (state[next] === 1) return false;
      if (state[next] === 0 && !visit(next)) return false;
    }
    state[node] = 2;
    finished.push(node);
    return true;
  };
  for (let course = 0; course < count; course++) {
    if (state[course] === 0 && !visit(course)) return [];
  }
  return finished.reverse();
}

console.log(courseOrder(4, [[1, 0], [2, 0], [3, 1], [3, 2]]).join(" "), courseOrder(2, [[1, 0], [0, 1]]).length);
```
Output:
```text
0 2 1 3 0
```

## quiz
1. When is a vertex added to the finishing list?
   - [ ] When it is first discovered
   - [x] After all vertices reachable from it have finished
   - [ ] When its first neighbour is visited
   - [ ] When it is coloured grey
   > Postorder gives reverse topological order.
2. What do you do with the finishing list to get the topological order?
   - [ ] Sort it
   - [x] Reverse it
   - [ ] Use it as it is
   - [ ] Remove duplicates
   > Vertices finish after their successors.
3. What does reaching a grey vertex mean?
   - [ ] The vertex was finished earlier
   - [x] A back edge, so the graph has a cycle
   - [ ] A new component
   - [ ] A source vertex
   > Grey vertices are on the current recursion path.
4. What is the time complexity of this method?
   - [ ] O(V squared)
   - [x] O(V + E)
   - [ ] O(E log V)
   - [ ] O(V log V)
   > Each vertex and edge is processed once.

# Connected Components DFS
kind: algorithm
time: O(V + E) for labelling all components with depth first search, since each vertex is entered once and each edge examined once or twice.
space: O(V) for the component labels, the visited marks and the stack or recursion.

## intro
A connected component of an undirected graph is a maximal group of vertices that can reach each other. Depth first search labels components by starting a fresh search at every unvisited vertex: everything reached from that start is one component. Counting components, finding their sizes and asking whether two vertices are connected all follow from the labels.

## theory
Algorithm:

- Create a label array filled with "unlabelled" and a counter `components = 0`
- For each vertex v in order: if v is unlabelled, increase the counter and run a depth first search from v that gives every reached vertex the current component number
- After the loop the counter is the number of components, and `label[v]` identifies the component of v

Component sizes: count how many vertices received each label, or return the size from each search. The largest component is the maximum.

Example: the graph on vertices 0 to 9 with edges 0-1, 1-2, 3-4, 5-6, 6-7, 7-5 and 8 with no edges and 9 with no edges has five components: {0, 1, 2}, {3, 4}, {5, 6, 7}, {8} and {9}, with sizes 3, 2, 3, 1 and 1. Two vertices are connected exactly when their labels are equal: 0 and 2 are connected, 2 and 3 are not.

Grid version (flood fill): the vertices are the cells and the neighbours are the four adjacent cells with the same value (or land). Counting islands is counting components of land cells; the largest island is the largest component. For the grid with rows `1100`, `1010`, `0011` and `0001`, with the 1 cells as land and four-neighbour connectivity, there are 2 islands, of sizes 3 and 4, because diagonal cells are not connected.

Variants:

- Number of provinces (adjacency matrix input): the same algorithm over rows of the matrix
- Largest component size and the number of vertices in each component
- Components after removing a vertex or an edge: rerun the algorithm, or use union-find offline
- Strongly connected components in directed graphs need other algorithms (Kosaraju, Tarjan)
- Weakly connected components in directed graphs: ignore directions
- Connected components in an implicit graph: the same search with generated neighbours (for example, words that share a letter pattern)
- Counting components of a graph with colours or constraints: edges only between vertices that satisfy a rule

Alternatives:

- Breadth first search labels components in the same time and avoids deep recursion
- Union-find handles edge streams and incremental connectivity
- For a static graph, all three are linear; depth first search is shortest to write, union-find is best for dynamic additions

Implementation notes: use an iterative stack for large graphs; keep adjacency lists for undirected graphs with both directions; mark vertices when pushing in the iterative version to avoid duplicates; treat isolated vertices as components of size one.

Pitfalls: forgetting to loop over all vertices (only searching from vertex 0 finds one component), missing isolated vertices because they have no adjacency entry (initialise lists for every vertex), mixing up directed and undirected edges and recursion depth overflow on long paths.

Testing: graphs with no edges (V components), a single vertex, complete graphs (1 component) and comparison with union-find on random graphs.

## explain
1. Initialise labels and a component counter.
2. Loop over all vertices.
3. When a vertex is unlabelled, increase the counter and search from it, labelling every reached vertex.
4. Collect sizes by counting labels.
5. Answer connectivity questions by comparing labels.
6. Use an explicit stack for deep graphs.

## example
The Python program labels the five components of the sample graph with their sizes 3, 2, 3, 1 and 1 and answers two connectivity queries. The JavaScript program counts the islands of the grid above with depth first search flood fill and prints the count 2 and the largest size 4.

## real
Network tools find isolated subnets, image software labels blobs of connected pixels and social platforms measure the size of the largest connected group.

## pros
- Linear time and short code
- Labels give instant connectivity queries
- Works on explicit graphs, grids and implicit graphs

## cons
- Only describes undirected connectivity
- Recursion depth can overflow on long chains
- Does not handle edge insertions after the fact without recomputation

## uses
- Counting islands and provinces
- Finding the largest connected group
- Labelling regions in images and grids
- Checking whether two items are connected

## mistakes
- Searching from a single start vertex only
- Forgetting isolated vertices
- Using the algorithm for directed strong connectivity
- Recomputing the whole labelling after every small change when union-find would do

## interview
**Q:** How do you count connected components with depth first search?
**A:** Loop over all vertices and, whenever a vertex is unvisited, increase a counter and run a depth first search that marks every vertex reachable from it; the counter is the number of components.

**Q:** How do you find the size of the largest component?
**A:** Count the vertices reached in each search, or count how many vertices share each component label, and take the maximum.

**Q:** When would you prefer union-find to depth first search for components?
**A:** When edges arrive over time and the number of components must be reported after each addition, because union-find updates the answer in near constant time.

## summary
Connected components are found by starting a depth first search from each unvisited vertex and labelling everything it reaches, in O(V + E). Labels give counts, sizes and instant connectivity checks, and the same idea works on grids as flood fill.

## codenote
The Python sample labels graph components. The JavaScript sample counts grid islands.

## code
### python
```python
def components(vertex_count, edges):
    adjacent = [[] for _ in range(vertex_count)]
    for u, v in edges:
        adjacent[u].append(v)
        adjacent[v].append(u)
    label = [-1] * vertex_count
    sizes = []
    for start in range(vertex_count):
        if label[start] != -1:
            continue
        label[start] = len(sizes)
        stack, size = [start], 0
        while stack:
            node = stack.pop()
            size += 1
            for nxt in adjacent[node]:
                if label[nxt] == -1:
                    label[nxt] = label[start]
                    stack.append(nxt)
        sizes.append(size)
    return label, sizes

label, sizes = components(10, [(0, 1), (1, 2), (3, 4), (5, 6), (6, 7), (7, 5)])
print(label)
print(sizes, len(sizes))
print(label[0] == label[2], label[2] == label[3])
```
Output:
```text
[0, 0, 0, 1, 1, 2, 2, 2, 3, 4]
[3, 2, 3, 1, 1] 5
True False
```
### javascript
```javascript
function islands(grid) {
  const seen = grid.map((row) => row.map(() => false));
  const sizes = [];
  const fill = (r, c) => {
    if (r < 0 || c < 0 || r >= grid.length || c >= grid[0].length) return 0;
    if (seen[r][c] || grid[r][c] !== "1") return 0;
    seen[r][c] = true;
    return 1 + fill(r + 1, c) + fill(r - 1, c) + fill(r, c + 1) + fill(r, c - 1);
  };
  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid[0].length; c++) {
      const size = fill(r, c);
      if (size) sizes.push(size);
    }
  }
  return [sizes.length, Math.max(...sizes)];
}

console.log(islands(["1100", "1010", "0011", "0001"].map((row) => [...row])).join(" "));
```
Output:
```text
2 4
```

## quiz
1. How is the number of connected components counted?
   - [ ] By counting the edges
   - [x] By counting how many times a new search must be started from an unvisited vertex
   - [ ] By counting the leaves
   - [ ] By sorting the vertices
   > Each start corresponds to a new component.
2. When are two vertices connected?
   - [ ] When they have the same degree
   - [x] When they have the same component label
   - [ ] When they are adjacent only
   - [ ] When their numbers are consecutive
   > Labels identify the reachable set.
3. What counts as a component of size one?
   - [ ] A vertex in a cycle
   - [x] An isolated vertex with no edges
   - [ ] A leaf of a tree
   - [ ] A source vertex
   > It reaches nothing but itself.
4. Why can union-find be better than repeated depth first search?
   - [ ] It uses recursion
   - [x] It updates component counts as edges arrive without recomputing everything
   - [ ] It finds shortest paths
   - [ ] It needs no memory
   > Incremental connectivity is its strength.
