# BFS Shortest Path Unweighted
kind: algorithm
time: O(V + E) for a graph, or O(R · C) for a grid with R rows and C columns, since every cell is enqueued at most once and has a constant number of neighbours.
space: O(V) or O(R · C) for the distance (or visited) array, the parent pointers and the queue.
practice: bfs-shortest-path-length

## intro
When every move costs the same, the shortest route is the one with the fewest moves, and breadth first search finds it. Mazes, word ladders, puzzle states and social network distances are all unweighted shortest path problems. This lesson builds the standard solution: distances, parent pointers and path reconstruction, with the grid and graph versions and the checks that make it correct.

## theory
Why breadth first search works: it processes vertices in order of increasing distance. When a vertex is first discovered, it is reached through a vertex of minimum distance, so its distance is minimal and never needs updating. No priority queue is required, unlike Dijkstra's algorithm for weighted graphs.

Algorithm:

- Initialise `dist` to −1 (unvisited) for every vertex and set `dist[start] = 0`; enqueue the start
- Dequeue u; for each neighbour v with `dist[v] == −1`: set `dist[v] = dist[u] + 1`, `parent[v] = u` and enqueue v
- Stop early when the target is dequeued (or discovered) if only the distance to it is needed
- The distance to the target is `dist[target]`; −1 means unreachable
- The path is reconstructed by following parents from the target back to the start and reversing

Grid version: the vertices are cells, neighbours are the four (or eight) adjacent cells within bounds that are not walls. Define the directions as a list of offsets to avoid repeated code. For a maze with the rows `S.#....`, `..#.##.`, `...#...`, `.#...#E`, the shortest route from S at the top left to E at the bottom right has 11 moves; there may be several shortest routes, and breadth first search returns one of them depending on the order of the directions.

Variants:

- Eight-direction movement (shortest path in a binary matrix): the neighbours include diagonals; the path length counts cells, so the answer for a matrix of size n is at least n, and for the 3 by 3 matrix of zeros with 1 at positions blocking, the answer might be 4
- Word ladder: vertices are words, an edge joins words differing in one letter; the answer is the number of words in the shortest transformation sequence
- Open the lock and sliding puzzles: vertices are configurations; the answer is the number of moves
- Minimum genetic mutation, jump games and shortest bridge are the same pattern with different neighbour rules
- Shortest path with a state: when you may break k walls or need keys, the vertex is (position, extra state) and the visited array has another dimension
- Bidirectional breadth first search: search from both the start and the target and stop when the frontiers meet; with branching factor b and distance d it explores about 2 b^(d/2) vertices instead of b^d
- All shortest paths and counting them: store, for each vertex, the number of shortest paths reaching it (add the parent's count when `dist[v] == dist[u] + 1`)

Implementation details:

- Check the start and target for being blocked or equal (distance 0)
- Mark the start visited before the loop and each neighbour when enqueuing
- Use `collections.deque`; store `(row, col)` or an encoded index
- For path reconstruction store parents in a dictionary or an array of the same shape as the grid
- Level by level loops give the distance without a separate array: increment a counter after each round

Why not depth first search? A depth first search can find a path quickly but not the shortest one, and exploring all paths to find the shortest is exponential. Why not Dijkstra? It also works but adds a log factor and a heap for no benefit when all weights are equal.

When edges have weights 0 and 1, use 0-1 BFS (a lesson in this module); with general positive weights use Dijkstra; with negative weights use Bellman-Ford.

Pitfalls: marking visited on dequeue (duplicates in the queue and slowdowns), forgetting that the number of cells on a path is the number of moves plus one when the problem counts cells, off-by-one at bounds and using diagonal moves unintentionally.

## explain
1. Set all distances to unvisited and the start distance to zero, then enqueue the start.
2. Dequeue a vertex and visit its valid, unvisited neighbours.
3. Set the neighbour's distance to one more than the current vertex and record its parent.
4. Enqueue the neighbour and continue until the target is found or the queue is empty.
5. Rebuild the path by following the parents from the target.
6. Decide whether the answer counts moves or cells and handle unreachable targets.

## example
The Python program finds the shortest route in the sample maze, prints its length 11 and the path as a list of coordinates, and returns None when the target is walled in. The JavaScript program computes the shortest path in a binary matrix with eight-direction moves and prints its length in cells for three matrices: 2, 4 and −1 when the start is blocked.

## real
Navigation on grids in games, robot path planning on occupancy maps and network hop counts all use unweighted breadth first search.

## pros
- Gives the fewest moves with a simple loop
- Path reconstruction is easy with parents
- Works on grids, graphs and implicit state spaces

## cons
- Only valid when all moves cost the same
- Memory grows with the frontier
- Counting moves versus cells is easy to confuse

## uses
- Shortest paths in mazes and grids
- Minimum number of moves in puzzles and locks
- Word transformation sequences
- Hop counts in networks

## mistakes
- Setting the visited flag only when a cell leaves the queue
- Using depth first search and expecting the shortest route
- Returning the number of moves when the problem asks for cells, or the reverse
- Forgetting to handle a blocked start or target

## interview
**Q:** How do you find the shortest path in an unweighted graph or grid?
**A:** Run breadth first search from the start, recording distances and parents when vertices are discovered; the first time the target is reached gives the minimum number of edges, and the path follows the parents back.

**Q:** Why is the first discovery of a vertex always on a shortest path?
**A:** The queue processes vertices in non-decreasing distance order, so a vertex is first reached through a vertex of minimum distance.

**Q:** How can the search be sped up when both ends are known?
**A:** Run bidirectional breadth first search and stop when the two frontiers meet, which explores about the square root of the vertices that a single search would visit.

## summary
Breadth first search finds shortest paths in unweighted graphs and grids in O(V + E) by recording distances and parents on first discovery. Mark on enqueue, handle blocked cells and unreachable targets, and reconstruct paths from the parent pointers.

## codenote
The Python sample finds a maze path. The JavaScript sample uses eight-direction moves.

## code
### python
```python
from collections import deque

maze = ["S.#....",
        "..#.##.",
        "...#...",
        ".#...#E"]

def shortest_path(grid):
    rows, cols = len(grid), len(grid[0])
    start = next((r, c) for r in range(rows) for c in range(cols) if grid[r][c] == "S")
    goal = next((r, c) for r in range(rows) for c in range(cols) if grid[r][c] == "E")
    parent = {start: None}
    queue = deque([start])
    while queue:
        r, c = queue.popleft()
        if (r, c) == goal:
            path = []
            while (r, c) != start:
                path.append((r, c))
                r, c = parent[(r, c)]
            return [start] + path[::-1]
        for dr, dc in ((0, 1), (1, 0), (0, -1), (-1, 0)):
            nr, nc = r + dr, c + dc
            if 0 <= nr < rows and 0 <= nc < cols and grid[nr][nc] != "#" and (nr, nc) not in parent:
                parent[(nr, nc)] = (r, c)
                queue.append((nr, nc))
    return None

path = shortest_path(maze)
print(len(path) - 1, path)
blocked = ["S#E"]
print(shortest_path(blocked))
```
Output:
```text
11 [(0, 0), (0, 1), (1, 1), (2, 1), (2, 2), (3, 2), (3, 3), (3, 4), (2, 4), (2, 5), (2, 6), (3, 6)]
None
```
### javascript
```javascript
function shortestBinaryPath(grid) {
  const n = grid.length;
  if (grid[0][0] || grid[n - 1][n - 1]) return -1;
  const queue = [[0, 0, 1]];
  grid[0][0] = 1;
  for (let head = 0; head < queue.length; head++) {
    const [r, c, length] = queue[head];
    if (r === n - 1 && c === n - 1) return length;
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        const nr = r + dr;
        const nc = c + dc;
        if (nr >= 0 && nc >= 0 && nr < n && nc < n && grid[nr][nc] === 0) {
          grid[nr][nc] = 1;
          queue.push([nr, nc, length + 1]);
        }
      }
    }
  }
  return -1;
}

console.log(shortestBinaryPath([[0, 1], [1, 0]]), shortestBinaryPath([[0, 0, 0], [1, 1, 0], [1, 1, 0]]), shortestBinaryPath([[1, 0], [0, 0]]));
```
Output:
```text
2 4 -1
```

## quiz
1. What guarantees that breadth first search finds a shortest path in an unweighted graph?
   - [ ] It uses recursion
   - [x] Vertices are processed in order of increasing distance
   - [ ] It sorts the edges
   - [ ] It visits the target first
   > The first discovery of a vertex is along a minimum length path.
2. How is the path rebuilt after the search?
   - [ ] By running the search backwards
   - [x] By following parent pointers from the target to the start
   - [ ] By sorting the visited vertices
   - [ ] By storing every path in the queue
   > Each vertex records the vertex it was discovered from.
3. What does a distance of −1 mean in the array?
   - [ ] The start vertex
   - [x] The vertex was never reached
   - [ ] A cycle
   - [ ] A negative edge
   > Unreachable vertices keep their initial value.
4. Which algorithm replaces breadth first search when edge weights differ?
   - [ ] Depth first search
   - [x] Dijkstra's algorithm
   - [ ] Topological sort
   - [ ] Union-find
   > BFS minimises edge count, not total weight.

# Multi Source BFS
kind: algorithm
time: O(V + E) or O(R · C) for a grid, the same as a single source search, because all sources enter the queue at the start and every vertex is still enqueued once.
space: O(V) or O(R · C) for the distance array and the queue.

## intro
Sometimes the question is not how far a vertex is from one place but how far it is from the nearest of several places: the distance of each cell to the nearest zero, the nearest exit, the nearest gate or the nearest rotten orange. Running one search per source would be too slow. Multi-source breadth first search puts all the sources in the queue at distance zero and expands them together, so each vertex learns its nearest source in a single pass.

## theory
Idea: imagine a virtual super source connected with weight zero to every real source. A normal breadth first search from the super source reaches each vertex at the distance to its nearest real source (minus the zero cost step). In practice you skip the virtual vertex and initialise the queue with all sources, each at distance 0.

Algorithm:

- Initialise `dist` to −1 or infinity; for every source s set `dist[s] = 0` and enqueue it
- Run the usual loop: dequeue u, and for each unvisited neighbour v set `dist[v] = dist[u] + 1` and enqueue
- When the queue is empty, `dist[v]` is the distance from v to the nearest source, and −1 means no source can reach it
- Optionally store which source reached each vertex (the Voronoi region of a source)

Cost: the same O(V + E) as a single source search, versus O(S · (V + E)) for S separate searches.

Example 1: nearest zero in a binary matrix. For the matrix `[[0, 0, 0], [0, 1, 0], [1, 1, 1]]` the distances to the nearest 0 are `[[0, 0, 0], [0, 1, 0], [1, 2, 1]]`: the bottom middle cell is two steps from the nearest zero. All the zero cells are the sources.

Example 2: walls and gates. Rooms are infinite (empty), −1 (walls) or 0 (gates). Filling every empty room with its distance to the nearest gate starts the search from all gates. For the grid with rows `INF -1 0 INF`, `INF INF INF -1`, `INF -1 INF -1` and `0 -1 INF INF` the result is `3 -1 0 1`, `2 2 1 -1`, `1 -1 2 -1` and `0 -1 3 4`.

Example 3: rotting oranges: all rotten oranges are sources, each minute is one level, and the answer is the number of levels needed to reach all fresh oranges (or −1 if some stay unreachable).

More applications:

- Shortest distance from every cell to the coast, a fire, an exit or a service point (as in as-far-as-possible placement problems: the cell with the largest distance to land)
- Spreading processes: infections, fire, flooding, rumours and signal propagation, where each level is a time step
- Distance transforms in image processing (distance to the nearest foreground pixel)
- Nearest facility assignment on road networks
- Finding the shortest bridge between two islands: use all cells of one island as sources and search until a cell of the other island is reached
- Level order computations across a forest of roots, such as the depth of nodes in several trees
- Multi-source with weights (distance to the nearest source in a weighted graph): multi-source Dijkstra with all sources in the heap at distance 0

Why it is correct: the queue always holds vertices ordered by distance to their nearest source, because all sources start at distance 0 and each expansion adds exactly 1. A vertex is first discovered by the nearest source's wave.

Implementation details:

- Collect the sources in one scan of the grid and enqueue them all before starting the loop
- Mark sources visited before the loop to avoid revisiting them
- Use the level by level loop to count time steps in spread simulations
- Walls (−1) must not be enqueued or overwritten
- Handle the case with no sources (everything stays unreachable)

Pitfalls: running a separate search for every source (slow), enqueuing the sources lazily so that early distances are wrong, overwriting walls or gates with distances and forgetting the unreachable value.

Testing: compare with a brute force that takes the minimum Manhattan or path distance over all sources on random small grids with and without walls.

## explain
1. Collect every source vertex.
2. Mark all sources visited with distance zero and enqueue them together.
3. Run the usual breadth first search loop, giving each new vertex one more than its parent.
4. Skip walls and already visited vertices.
5. Read the distance of every vertex to its nearest source from the array.
6. Treat vertices never reached as unreachable.

## example
The Python program computes the nearest zero distances for the matrix above and verifies the result against a brute force on 100 seeded random matrices. The JavaScript program fills the rooms of the walls and gates grid and prints the result rows.

## real
Fire spread and evacuation models, distance maps in games, and facility location tools compute distances to the nearest of many points with multi-source breadth first search.

## pros
- One pass instead of one search per source
- Same simple loop as ordinary breadth first search
- Natural for spreading and nearest facility questions

## cons
- Only for unweighted distances
- Memory for the frontier can be large
- Needs care so that sources are all initialised first

## uses
- Distance to the nearest zero or gate
- Rotting oranges and spreading simulations
- Shortest bridge between regions
- Distance maps for games and images

## mistakes
- Running a separate search from each source
- Forgetting to mark all sources visited before the loop
- Overwriting wall or gate cells with distances
- Not handling the case where some cells are unreachable

## interview
**Q:** What is multi-source breadth first search?
**A:** A breadth first search whose queue is initialised with all source vertices at distance zero, so every vertex gets its distance to the nearest source in a single O(V + E) pass.

**Q:** Why does it give the nearest source for each vertex?
**A:** The waves from all sources expand in lockstep, one level per step, and a vertex is first reached by the wave of the closest source.

**Q:** How would you fill each empty room with its distance to the nearest gate?
**A:** Enqueue every gate, then run breadth first search through the empty rooms, setting each room's value to one more than the room it was reached from and never entering walls.

## summary
Multi-source breadth first search starts from all sources at once and gives every vertex its distance to the nearest source in O(V + E). It solves distance maps, spreading processes and nearest facility questions without repeated searches.

## codenote
The Python sample computes nearest zero distances and checks them by brute force. The JavaScript sample fills rooms with the distance to a gate.

## code
### python
```python
import random
from collections import deque

def nearest_zero(matrix):
    rows, cols = len(matrix), len(matrix[0])
    dist = [[-1] * cols for _ in range(rows)]
    queue = deque()
    for r in range(rows):
        for c in range(cols):
            if matrix[r][c] == 0:
                dist[r][c] = 0
                queue.append((r, c))
    while queue:
        r, c = queue.popleft()
        for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nr, nc = r + dr, c + dc
            if 0 <= nr < rows and 0 <= nc < cols and dist[nr][nc] == -1:
                dist[nr][nc] = dist[r][c] + 1
                queue.append((nr, nc))
    return dist

print(nearest_zero([[0, 0, 0], [0, 1, 0], [1, 1, 1]]))

rng = random.Random(7)
ok = True
for _ in range(100):
    rows, cols = rng.randint(1, 5), rng.randint(1, 5)
    grid = [[rng.choice([0, 1, 1]) for _ in range(cols)] for _ in range(rows)]
    zeros = [(r, c) for r in range(rows) for c in range(cols) if grid[r][c] == 0]
    if not zeros:
        continue
    expected = [[min(abs(r - zr) + abs(c - zc) for zr, zc in zeros) for c in range(cols)] for r in range(rows)]
    ok = ok and nearest_zero(grid) == expected
print(ok)
```
Output:
```text
[[0, 0, 0], [0, 1, 0], [1, 2, 1]]
True
```
### javascript
```javascript
const INF = 2147483647;

function wallsAndGates(rooms) {
  const rows = rooms.length;
  const cols = rooms[0].length;
  const queue = [];
  rooms.forEach((row, r) => row.forEach((value, c) => value === 0 && queue.push([r, c])));
  for (let head = 0; head < queue.length; head++) {
    const [r, c] = queue[head];
    for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nr = r + dr;
      const nc = c + dc;
      if (nr >= 0 && nc >= 0 && nr < rows && nc < cols && rooms[nr][nc] === INF) {
        rooms[nr][nc] = rooms[r][c] + 1;
        queue.push([nr, nc]);
      }
    }
  }
  return rooms;
}

const rooms = [[INF, -1, 0, INF], [INF, INF, INF, -1], [INF, -1, INF, -1], [0, -1, INF, INF]];
console.log(wallsAndGates(rooms).map((row) => row.join(" ")).join(" | "));
```
Output:
```text
3 -1 0 1 | 2 2 1 -1 | 1 -1 2 -1 | 0 -1 3 4
```

## quiz
1. How is multi-source breadth first search started?
   - [ ] With one source at a time
   - [x] With all sources in the queue at distance zero
   - [ ] With the farthest vertex
   - [ ] With an empty queue
   > The waves then expand together.
2. What does each vertex's distance represent afterwards?
   - [ ] The distance to the first source found
   - [x] The distance to its nearest source
   - [ ] The distance to the farthest source
   - [ ] The number of sources
   > Lockstep expansion makes the nearest wave arrive first.
3. What is the running time compared with a separate search from each of S sources?
   - [ ] Slower by a factor of S
   - [x] Faster by a factor of about S, since it is one O(V + E) pass
   - [ ] The same
   - [ ] Quadratic
   > All sources share a single traversal.
4. What happens to cells that no source can reach?
   - [ ] They get distance zero
   - [x] They keep the unreachable marker
   - [ ] They become sources
   - [ ] They are deleted
   > Their distance stays infinite or −1.

# 0 1 BFS
kind: algorithm
time: O(V + E) because each vertex is finalised once and each edge is relaxed a constant number of times, with O(1) deque operations instead of the O(log V) heap operations of Dijkstra's algorithm.
space: O(V) for the distance array and the deque, plus the adjacency lists.

## intro
Dijkstra's algorithm handles any non-negative weights, but when every weight is either 0 or 1 it is overkill. A deque lets you keep the frontier ordered by distance without a heap: edges of weight 0 push the neighbour to the front of the deque (it has the same distance as the current vertex), and edges of weight 1 push it to the back. The result is shortest paths in linear time.

## theory
Observation: in breadth first search the queue holds vertices of distance d followed by vertices of distance d + 1. With weight 0 edges, a neighbour of a distance d vertex can also have distance d, so it belongs at the front, with the other distance d vertices. The deque keeps this order: the front holds distance d vertices, the back distance d + 1 vertices.

Algorithm:

- Set `dist` to infinity for all vertices except the source (0) and push the source into a deque
- Pop a vertex u from the front
- For each edge `(u, v, w)` with w equal to 0 or 1: if `dist[u] + w < dist[v]`, set `dist[v] = dist[u] + w` and push v to the front if w = 0 and to the back if w = 1
- Skip stale entries (a vertex may be pushed more than once when its distance improves); when popped, you can check that the stored distance still matches
- When the deque is empty, `dist` holds the shortest distances

Why it is correct: it is Dijkstra's algorithm with a two-level priority queue. The deque always contains at most two distinct distance values (d and d + 1) in sorted order, so popping from the front gives the minimum.

Example graph (undirected) with edge weights: 0-1 weight 1, 0-2 weight 0, 2-1 weight 0, 1-3 weight 1, 2-3 weight 1, 3-4 weight 0. From vertex 0 the distances are 0 for vertices 0, 1 and 2 (reached through zero-weight edges), 1 for vertices 3 and 4. Breadth first search ignoring weights would claim distance 1 for vertex 1 and 2 for vertex 4.

Typical problems:

- Minimum cost to make a path valid in a grid with arrows: each cell has a direction; moving in that direction costs 0, moving in another direction (changing the arrow) costs 1. The answer is the distance to the bottom right cell. For the grid with rows `1 1 3`, `3 2 2` and `1 1 4` (1 right, 2 left, 3 down, 4 up) the cost is 0, and for the grid `1 2` and `4 3` it is 1.
- Minimum obstacles to remove to reach the target in a grid where a free cell costs 0 and an obstacle cell costs 1
- Shortest path where some edges are free (walking versus taking a free transport)
- Number of edge flips or direction reversals to connect two vertices in a directed graph: add each edge with weight 0 and its reverse with weight 1
- Graph problems on bit operations, such as the minimum number of operations when some moves are free
- Layered graphs for shortest paths with a limited number of free moves

Generalisation: Dial's algorithm (bucket queue) handles small integer weights up to W in O(E + V W); 0-1 BFS is the special case W = 1. For arbitrary positive weights use Dijkstra with a heap.

Comparison:

- Plain BFS: unit weights only
- 0-1 BFS: weights 0 and 1, O(V + E), uses a deque
- Dijkstra: any non-negative weights, O((V + E) log V)
- Bellman-Ford: negative weights, O(V E)

Implementation notes: use `collections.deque` in Python with `appendleft` and `append`; in JavaScript use an array deque (or two arrays for the two levels); initialise distances to infinity; avoid pushing a vertex repeatedly by checking `dist[u] + w < dist[v]` strictly.

Pitfalls: pushing weight 0 neighbours to the back (turns into incorrect breadth first search), allowing weights other than 0 and 1, forgetting that zero-weight edges can form cycles (fine, the strict improvement test stops them) and mixing up the front and the back.

Testing: compare with Dijkstra's algorithm on random graphs with weights 0 and 1.

## explain
1. Initialise the distances to infinity and the source to zero, and put the source in a deque.
2. Pop a vertex from the front.
3. For each edge, compute the candidate distance through this vertex.
4. If it improves the neighbour, update it and push the neighbour to the front for a zero weight edge or to the back for a weight one edge.
5. Continue until the deque is empty.
6. Compare with Dijkstra's algorithm in tests.

## example
The Python program runs 0-1 BFS on the sample weighted graph and prints the distances 0, 0, 0, 1, 1, then checks the results against Dijkstra's algorithm on 100 seeded random graphs: True. The JavaScript program solves the arrow grid problem and prints 0 and 1 for the two sample grids.

## real
Routing with free transfers, grid puzzles where some moves are free and flipping minimum edges to make a path exist are solved with 0-1 breadth first search.

## pros
- Linear time for shortest paths with weights 0 and 1
- Simple deque operations instead of a heap
- Correct for graphs with zero weight edges

## cons
- Restricted to weights 0 and 1 (or small integers with buckets)
- A deque with both ends must be implemented efficiently
- Stale entries must be handled

## uses
- Grid problems with free and costly moves
- Minimum obstacle removal
- Minimum edge reversals
- Layered graph shortest paths

## mistakes
- Pushing zero weight neighbours to the back
- Using it for weights other than 0 and 1
- Forgetting the strict improvement check and looping on zero cycles
- Using plain breadth first search on a graph with zero weight edges

## interview
**Q:** What is 0-1 BFS and when is it used?
**A:** A shortest path algorithm for graphs whose edge weights are 0 or 1, using a deque where weight 0 edges push to the front and weight 1 edges push to the back, running in O(V + E).

**Q:** Why is the deque order correct?
**A:** The deque holds vertices of distance d at the front and d + 1 at the back, since a zero weight edge keeps the same distance and a one weight edge increases it by one, so popping from the front always gives the minimum distance vertex.

**Q:** How would you solve the minimum cost to make a grid path valid?
**A:** Treat cells as vertices, moving in the direction of the arrow costs 0 and moving in any other direction costs 1, and run 0-1 BFS from the top left to the bottom right.

## summary
0-1 BFS finds shortest paths when edge weights are 0 or 1 by using a deque, pushing free moves to the front and costly moves to the back, in O(V + E). It replaces Dijkstra's heap for this special case.

## codenote
The Python sample runs 0-1 BFS and compares it with Dijkstra. The JavaScript sample solves the arrow grid problem.

## code
### python
```python
import heapq
import random
from collections import deque

def zero_one_bfs(n, edges, source):
    graph = [[] for _ in range(n)]
    for u, v, w in edges:
        graph[u].append((v, w))
        graph[v].append((u, w))
    dist = [float("inf")] * n
    dist[source] = 0
    queue = deque([source])
    while queue:
        u = queue.popleft()
        for v, w in graph[u]:
            if dist[u] + w < dist[v]:
                dist[v] = dist[u] + w
                queue.appendleft(v) if w == 0 else queue.append(v)
    return dist

def dijkstra(n, edges, source):
    graph = [[] for _ in range(n)]
    for u, v, w in edges:
        graph[u].append((v, w))
        graph[v].append((u, w))
    dist = [float("inf")] * n
    dist[source] = 0
    heap = [(0, source)]
    while heap:
        d, u = heapq.heappop(heap)
        if d > dist[u]:
            continue
        for v, w in graph[u]:
            if d + w < dist[v]:
                dist[v] = d + w
                heapq.heappush(heap, (dist[v], v))
    return dist

sample = [(0, 1, 1), (0, 2, 0), (2, 1, 0), (1, 3, 1), (2, 3, 1), (3, 4, 0)]
print(zero_one_bfs(5, sample, 0))
rng = random.Random(3)
ok = True
for _ in range(100):
    n = rng.randint(2, 8)
    edges = [(rng.randrange(n), rng.randrange(n), rng.choice([0, 1])) for _ in range(rng.randint(1, 14))]
    ok = ok and zero_one_bfs(n, edges, 0) == dijkstra(n, edges, 0)
print(ok)
```
Output:
```text
[0, 0, 0, 1, 1]
True
```
### javascript
```javascript
function minCost(grid) {
  const rows = grid.length;
  const cols = grid[0].length;
  const dist = grid.map((row) => row.map(() => Infinity));
  const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]];
  const front = [[0, 0]];
  const back = [];
  dist[0][0] = 0;
  while (front.length || back.length) {
    const [r, c] = front.length ? front.pop() : back.shift();
    for (let d = 0; d < 4; d++) {
      const nr = r + directions[d][0];
      const nc = c + directions[d][1];
      if (nr < 0 || nc < 0 || nr >= rows || nc >= cols) continue;
      const cost = grid[r][c] === d + 1 ? 0 : 1;
      if (dist[r][c] + cost < dist[nr][nc]) {
        dist[nr][nc] = dist[r][c] + cost;
        (cost === 0 ? front : back).push([nr, nc]);
      }
    }
  }
  return dist[rows - 1][cols - 1];
}

console.log(minCost([[1, 1, 3], [3, 2, 2], [1, 1, 4]]), minCost([[1, 2], [4, 3]]));
```
Output:
```text
0 1
```

## quiz
1. Where does a zero weight edge push the neighbour in 0-1 BFS?
   - [ ] To the back of the deque
   - [x] To the front of the deque
   - [ ] Into a heap
   - [ ] It is not pushed
   > The neighbour has the same distance as the current vertex.
2. What is the running time of 0-1 BFS?
   - [ ] O(V log V)
   - [x] O(V + E)
   - [ ] O(V E)
   - [ ] O(V squared)
   > Deque operations are constant time.
3. Why does ordinary breadth first search fail on a graph with zero weight edges?
   - [ ] It uses a queue
   - [x] It counts every edge as cost one
   - [ ] It cannot visit all vertices
   - [ ] It needs recursion
   > Free edges would be charged a unit cost.
4. Which problem fits 0-1 BFS?
   - [ ] Finding the longest path
   - [x] Minimum obstacles to remove in a grid
   - [ ] Topological sorting
   - [ ] Sorting an array
   > Free cells cost 0 and obstacles cost 1.

# Strongly Connected Components
kind: algorithm
time: O(V + E) for both Kosaraju's algorithm (two depth first searches) and Tarjan's algorithm (a single search with low-link values).
space: O(V + E) for the graph and its transpose in Kosaraju's algorithm, and O(V) for the stacks and arrays in Tarjan's algorithm.
viz: scc-kosaraju

## intro
In a directed graph a strongly connected component (SCC) is a maximal set of vertices in which every vertex can reach every other along directed paths. The components partition the vertices, and squeezing each component into a single vertex produces a directed acyclic graph that summarises the structure. Two linear time depth first search algorithms find them.

## theory
Definition: vertices u and v are in the same SCC exactly when there is a path from u to v and a path from v to u. The relation is an equivalence relation, so the SCCs partition the vertex set. A single vertex without a cycle through it is its own component.

Condensation: contract each SCC to a node; the edges between components form a DAG, which can be topologically sorted. This reveals the large scale flow of the graph: which groups depend on which.

Example graph: 0 → 1, 1 → 2, 2 → 0, 2 → 3, 3 → 4, 4 → 5, 5 → 3, 6 → 5 and 6 → 7. The SCCs are {0, 1, 2} (a cycle), {3, 4, 5} (another cycle), {6} and {7}. The condensation has edges {0, 1, 2} → {3, 4, 5}, {6} → {3, 4, 5} and {6} → {7}.

Kosaraju's algorithm (two passes):

- Run a depth first search on the original graph and record the vertices in order of finishing time
- Build the transpose graph (all edges reversed)
- Process the vertices in decreasing finishing time: for each unvisited vertex, run a depth first search on the transpose graph; the set of vertices reached is one SCC

Why it works: the vertex that finishes last in the first search lies in a source component of the condensation. In the transpose graph that component cannot reach any other component (edges between components are reversed), so the search is confined to the component. Removing it and repeating peels off components in topological order.

Tarjan's algorithm (single pass): during one depth first search, assign each vertex a discovery index `index[v]` and a `lowlink[v]`, the smallest discovery index reachable from v through its subtree and at most one back or cross edge to a vertex still on the stack. Keep a stack of vertices in the current search. When a vertex v finishes with `lowlink[v] == index[v]`, it is the root of an SCC: pop the stack down to v, and those vertices form the component. Components are produced in reverse topological order of the condensation (sink components first).

Both run in O(V + E). Tarjan's uses one traversal and no transpose; Kosaraju's is easier to understand and prove.

Uses:

- Condensing a graph to a DAG for dependency analysis
- Detecting groups of mutually dependent modules (circular dependencies)
- 2-SAT: a formula is satisfiable exactly when no variable and its negation lie in the same SCC of the implication graph
- Web graph analysis: the bow-tie structure with a giant strongly connected core
- Finding the minimum number of edges to add to make a graph strongly connected (sources and sinks of the condensation)
- Model checking and compilers (loops in control flow graphs)
- Counting how many vertices can reach all others (the source SCC)

Properties and checks:

- A graph is strongly connected when it has exactly one SCC
- The number of SCCs is between 1 and V; a DAG has V components (all singletons)
- Within an SCC any vertex can serve as a root for reachability

Pitfalls: forgetting to reverse the edges in the second pass of Kosaraju's algorithm, processing vertices in increasing instead of decreasing finishing time, not resetting the visited array between passes, confusing the stack used for lowlinks with the recursion stack and recursion depth limits on large graphs (use iterative versions).

Testing: compare both algorithms and a brute force (reachability matrix) on random small directed graphs.

## explain
1. Run a depth first search on the graph and record the finishing order.
2. Reverse all edges to build the transpose graph.
3. Take the vertices in decreasing finishing time.
4. For each unvisited vertex, run a depth first search on the transpose and collect the vertices reached as a component.
5. Build the condensation edges from the component labels if needed.
6. Alternatively use Tarjan's lowlink method to find components in one pass.

## example
The Python program finds the components {0, 1, 2}, {3, 4, 5}, {6} and {7} with Kosaraju's algorithm and builds the condensation edges, then checks Tarjan's algorithm gives the same partition. The JavaScript program uses reachability to verify the components of the same graph by brute force.

## real
Compilers find loops in control flow graphs, package managers find circular dependency groups and satisfiability solvers use components of implication graphs.

## pros
- Linear time algorithms with clear structure
- The condensation reveals the DAG structure of any directed graph
- Enables 2-SAT solving

## cons
- Needs two depth first searches or lowlink bookkeeping
- Recursion depth can be large
- Tarjan's lowlink logic is subtle

## uses
- Condensing a directed graph to a DAG
- Finding circular dependency groups
- Solving 2-SAT
- Analysing the structure of the web

## mistakes
- Forgetting to transpose the graph for the second pass
- Processing vertices in the wrong finishing order
- Not clearing the visited marks between passes
- Using strongly connected algorithms on undirected graphs where connected components suffice

## interview
**Q:** What is a strongly connected component?
**A:** A maximal set of vertices in a directed graph such that every vertex in the set can reach every other vertex in the set by directed paths.

**Q:** How does Kosaraju's algorithm find them?
**A:** It records vertices by finishing time in a depth first search of the graph, then runs depth first searches on the transposed graph in decreasing finishing order, and each search tree is one component.

**Q:** What is special about the condensation of a graph?
**A:** Contracting each strongly connected component to a single vertex gives a directed acyclic graph, which can be topologically sorted.

## summary
Strongly connected components partition a directed graph into mutually reachable groups and are found in O(V + E) with Kosaraju's two passes or Tarjan's lowlink method. Contracting them yields a DAG that summarises the graph.

## codenote
The Python sample implements Kosaraju's and Tarjan's algorithms. The JavaScript sample verifies by reachability.

## code
### python
```python
import sys

sys.setrecursionlimit(5000)
edges = [(0, 1), (1, 2), (2, 0), (2, 3), (3, 4), (4, 5), (5, 3), (6, 5), (6, 7)]
n = 8

def kosaraju():
    graph = [[] for _ in range(n)]
    reverse = [[] for _ in range(n)]
    for u, v in edges:
        graph[u].append(v)
        reverse[v].append(u)
    seen, order = set(), []

    def first(node):
        seen.add(node)
        for nxt in graph[node]:
            if nxt not in seen:
                first(nxt)
        order.append(node)

    for v in range(n):
        if v not in seen:
            first(v)
    seen.clear()
    components = []

    def second(node, group):
        seen.add(node)
        group.append(node)
        for nxt in reverse[node]:
            if nxt not in seen:
                second(nxt, group)

    for v in reversed(order):
        if v not in seen:
            group = []
            second(v, group)
            components.append(sorted(group))
    return components

def tarjan():
    graph = [[] for _ in range(n)]
    for u, v in edges:
        graph[u].append(v)
    index, low, on_stack, stack, components = {}, {}, set(), [], []

    def visit(node):
        index[node] = low[node] = len(index)
        stack.append(node)
        on_stack.add(node)
        for nxt in graph[node]:
            if nxt not in index:
                visit(nxt)
                low[node] = min(low[node], low[nxt])
            elif nxt in on_stack:
                low[node] = min(low[node], index[nxt])
        if low[node] == index[node]:
            group = []
            while True:
                top = stack.pop()
                on_stack.discard(top)
                group.append(top)
                if top == node:
                    break
            components.append(sorted(group))

    for v in range(n):
        if v not in index:
            visit(v)
    return components

kosaraju_result, tarjan_result = kosaraju(), tarjan()
print(kosaraju_result)
print(sorted(kosaraju_result) == sorted(tarjan_result), tarjan_result)
label = {v: i for i, group in enumerate(kosaraju_result) for v in group}
print(sorted({(label[u], label[v]) for u, v in edges if label[u] != label[v]}))
```
Output:
```text
[[6], [7], [0, 1, 2], [3, 4, 5]]
True [[3, 4, 5], [0, 1, 2], [7], [6]]
[(0, 1), (0, 3), (2, 3)]
```
### javascript
```javascript
const edges = [[0, 1], [1, 2], [2, 0], [2, 3], [3, 4], [4, 5], [5, 3], [6, 5], [6, 7]];
const n = 8;
const reach = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => i === j));
for (const [u, v] of edges) reach[u][v] = true;
for (let k = 0; k < n; k++) {
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) if (reach[i][k] && reach[k][j]) reach[i][j] = true;
  }
}
const seen = new Set();
const components = [];
for (let v = 0; v < n; v++) {
  if (seen.has(v)) continue;
  const group = [...Array(n).keys()].filter((u) => reach[v][u] && reach[u][v]);
  group.forEach((u) => seen.add(u));
  components.push(group.join(""));
}
console.log(components.join(" "), components.length);
```
Output:
```text
012 345 6 7 4
```

## quiz
1. When are two vertices in the same strongly connected component?
   - [ ] When they are adjacent
   - [x] When each can reach the other along directed paths
   - [ ] When they have equal degree
   - [ ] When one can reach the other
   > Reachability must hold in both directions.
2. What does contracting the components produce?
   - [ ] A tree
   - [x] A directed acyclic graph
   - [ ] A complete graph
   - [ ] A cycle
   > A cycle between components would merge them into one.
3. In which order does Kosaraju's second pass process vertices?
   - [ ] By increasing finishing time
   - [x] By decreasing finishing time of the first pass
   - [ ] By vertex label
   - [ ] Randomly
   > The last finished vertex lies in a source component.
4. What do Kosaraju's and Tarjan's algorithms have in common in cost?
   - [ ] O(V squared)
   - [x] Both run in O(V + E)
   - [ ] Both need a heap
   - [ ] Both are exponential
   > Each performs a constant number of depth first traversals.

# Bridges in Graph
kind: algorithm
time: O(V + E) with a single depth first search computing discovery times and low-link values.
space: O(V) for the discovery times, low-link values and the recursion stack.
viz: bridges-tarjan
practice: articulation-points-count

## intro
A bridge is an edge whose removal disconnects the graph, or more precisely increases the number of connected components. Bridges are the critical links of a network: if one fails, parts of the network lose contact. Tarjan's algorithm finds all bridges in one depth first search by tracking how far back each subtree can reach.

## theory
Definitions: in an undirected connected graph an edge is a bridge if the graph minus that edge is disconnected. Equivalent: a bridge lies on no cycle. Graphs without bridges (and connected) are 2-edge-connected; the maximal 2-edge-connected pieces are connected by bridges, forming a tree (the bridge tree).

Depth first search facts for undirected graphs: every edge is either a tree edge (to a new vertex) or a back edge (to an ancestor). A tree edge `(u, v)`, where u is the parent of v, is a bridge exactly when no back edge from the subtree of v reaches u or an ancestor of u: then the subtree is attached to the rest by that one edge only.

Low-link values:

- `disc[v]`: the discovery time of v in the depth first search
- `low[v]`: the smallest discovery time reachable from v by following tree edges down, then at most one back edge
- Computation: when visiting v, `low[v] = disc[v]`; for each neighbour w of v other than the parent: if w is unvisited, recurse and set `low[v] = min(low[v], low[w])`; if w is already visited (a back edge), set `low[v] = min(low[v], disc[w])`
- The edge `(u, v)` with u the parent of v is a bridge iff `low[v] > disc[u]` (the subtree of v cannot get back to u or above)

Parallel edges: if there are two edges between the same pair, neither is a bridge, since the other provides an alternative; handle it by skipping only the specific edge id used to enter the vertex rather than every edge to the parent.

Example graph: a triangle {0, 1, 2}, the edge 1-3, a triangle {3, 4, 5} and the edge 5-6. The bridges are 1-3 and 5-6; the triangle edges are on cycles. Removing 1-3 splits the graph into the two triangles' sides; removing 5-6 isolates vertex 6.

Complexity: one depth first search, O(V + E). Recursion depth up to V requires an iterative version for large graphs.

Applications:

- Critical connections in a network (the classic problem)
- Network reliability: identifying single points of failure among links
- Building the bridge tree: contract each 2-edge-connected component to find the minimum number of edges to add so that the graph becomes bridgeless (number of leaves of the bridge tree plus one, divided by two, rounded up)
- Road networks: roads whose closure cuts off areas
- Graph decomposition for other algorithms (counting paths between components)

Related problems:

- Articulation points (cut vertices), the vertex version, covered in the next lesson
- 2-vertex-connected components (biconnected components)
- Finding all cycles' structure and checking whether an edge belongs to a cycle
- Dynamic connectivity with edge deletions of bridges

Alternatives: brute force removes each edge and counts components in O(E (V + E)); the chain decomposition algorithm and union-find based offline methods also work.

Pitfalls: treating the parent edge as a back edge (this makes every tree edge look cyclic), using `>=` instead of `>` in the bridge test (that is the condition for articulation points), forgetting to handle disconnected graphs (start from every unvisited vertex), parallel edges and recursion depth.

Testing: compare with the brute force that removes each edge and checks connectivity, on random small graphs.

## explain
1. Run a depth first search that records the discovery time of each vertex.
2. Compute low values from the children and from back edges, ignoring the edge to the parent.
3. For each tree edge from u to a child v, check whether low[v] is greater than disc[u].
4. If so, report the edge as a bridge.
5. Start the search from every unvisited vertex to cover all components.
6. Verify with a brute force on small graphs.

## example
The Python program finds the bridges (1, 3) and (5, 6) in the sample graph and verifies the result against the brute force edge removal on 100 seeded random graphs. The JavaScript program lists the critical connections of a small server network.

## real
Network operators identify links whose failure splits the network, road planners find roads that connect otherwise separate regions and reliability tools list single points of failure.

## pros
- Linear time with one depth first search
- Clear characterisation through low-link values
- Basis for the bridge tree and reliability analysis

## cons
- Parent edge handling and parallel edges are subtle
- Large networks can exhaust the call stack in the recursive version
- Only for undirected graphs

## uses
- Finding critical links in networks
- Building the bridge tree
- Computing the edges to add for 2-edge-connectivity
- Reliability analysis

## mistakes
- Treating the edge to the parent as a back edge
- Using greater or equal instead of strictly greater in the bridge test
- Ignoring parallel edges
- Searching only the component that contains vertex zero

## interview
**Q:** How do you find bridges in an undirected graph?
**A:** Run a depth first search recording discovery times and low-link values, and report a tree edge from u to v as a bridge when low[v] is greater than disc[u], meaning no back edge from the subtree of v reaches u or above.

**Q:** What does the low-link value of a vertex represent?
**A:** The earliest discovery time reachable from the vertex's subtree using tree edges and at most one back edge.

**Q:** What is the difference between the bridge condition and the articulation point condition?
**A:** For a bridge the test is low[v] greater than disc[u], while for an articulation point u the test is low[v] greater than or equal to disc[u], because the vertex itself may be the connection back.

## summary
Bridges are edges on no cycle, found in O(V + E) by a depth first search that compares each child's low-link value with its parent's discovery time. Ignore the parent edge, handle parallel edges and cover all components.

## codenote
The Python sample finds bridges and checks them by brute force. The JavaScript sample counts critical connections.

## code
### python
```python
import random
import sys

sys.setrecursionlimit(5000)

def bridges(n, edges):
    graph = [[] for _ in range(n)]
    for index, (u, v) in enumerate(edges):
        graph[u].append((v, index))
        graph[v].append((u, index))
    disc, low, found, timer = {}, {}, [], [0]

    def visit(node, entry_edge):
        disc[node] = low[node] = timer[0]
        timer[0] += 1
        for nxt, index in graph[node]:
            if index == entry_edge:
                continue
            if nxt in disc:
                low[node] = min(low[node], disc[nxt])
            else:
                visit(nxt, index)
                low[node] = min(low[node], low[nxt])
                if low[nxt] > disc[node]:
                    found.append(tuple(sorted((node, nxt))))

    for v in range(n):
        if v not in disc:
            visit(v, -1)
    return sorted(found)

def components(n, edges):
    parent = list(range(n))

    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x

    for u, v in edges:
        parent[find(u)] = find(v)
    return len({find(v) for v in range(n)})

sample = [(0, 1), (1, 2), (2, 0), (1, 3), (3, 4), (4, 5), (5, 3), (5, 6)]
print(bridges(7, sample))

rng = random.Random(21)
ok = True
for _ in range(100):
    n = rng.randint(2, 8)
    edges = list({tuple(sorted((rng.randrange(n), rng.randrange(n)))) for _ in range(rng.randint(1, 10))})
    edges = [e for e in edges if e[0] != e[1]]
    expected = sorted(e for e in edges if components(n, [x for x in edges if x != e]) > components(n, edges))
    ok = ok and bridges(n, edges) == expected
print(ok)
```
Output:
```text
[(1, 3), (5, 6)]
True
```
### javascript
```javascript
function criticalConnections(n, connections) {
  const graph = Array.from({ length: n }, () => []);
  connections.forEach(([u, v], index) => {
    graph[u].push([v, index]);
    graph[v].push([u, index]);
  });
  const disc = new Array(n).fill(-1);
  const low = new Array(n).fill(0);
  const result = [];
  let timer = 0;
  const visit = (node, entry) => {
    disc[node] = low[node] = timer++;
    for (const [next, index] of graph[node]) {
      if (index === entry) continue;
      if (disc[next] !== -1) low[node] = Math.min(low[node], disc[next]);
      else {
        visit(next, index);
        low[node] = Math.min(low[node], low[next]);
        if (low[next] > disc[node]) result.push([node, next]);
      }
    }
  };
  for (let v = 0; v < n; v++) if (disc[v] === -1) visit(v, -1);
  return result;
}

console.log(JSON.stringify(criticalConnections(4, [[0, 1], [1, 2], [2, 0], [1, 3]])));
```
Output:
```text
[[1,3]]
```

## quiz
1. What is a bridge in an undirected graph?
   - [ ] A vertex of high degree
   - [x] An edge whose removal disconnects the graph
   - [ ] An edge on a cycle
   - [ ] The longest edge
   > A bridge lies on no cycle.
2. When is the tree edge from u to its child v a bridge?
   - [ ] When low[v] is less than disc[u]
   - [x] When low[v] is greater than disc[u]
   - [ ] When v is a leaf only
   - [ ] When disc[v] equals disc[u]
   > No back edge from the subtree reaches u or above.
3. Why is the edge to the parent skipped when computing low values?
   - [ ] To save time
   - [x] Otherwise every tree edge would look like it lies on a cycle
   - [ ] The parent is always visited
   - [ ] To handle directed graphs
   > It would let every child reach its parent trivially.
4. What is the time complexity of finding all bridges?
   - [ ] O(E squared)
   - [x] O(V + E)
   - [ ] O(V E)
   - [ ] O(V log V)
   > A single depth first search suffices.

# Articulation Points
kind: algorithm
time: O(V + E) with one depth first search computing discovery times and low-link values for every vertex.
space: O(V) for the discovery times, low-link values, the flags and the recursion stack.
viz: articulation-points
practice: articulation-points-count

## intro
An articulation point, or cut vertex, is a vertex whose removal increases the number of connected components of an undirected graph. In a network these are the single points of failure among the nodes: a router, a junction or a person whose absence splits the rest. They are found with the same depth first search idea as bridges, with a slightly different condition.

## theory
Definition: in a connected undirected graph, a vertex is an articulation point if removing it (and its edges) leaves the graph disconnected. Graphs with no articulation points (and at least three vertices) are biconnected (2-vertex-connected); the maximal biconnected pieces are the biconnected components (blocks), which share articulation points.

Depth first search characterisation. Run a depth first search, recording `disc[v]` and `low[v]` as in the bridge algorithm. A vertex u is an articulation point if:

- u is the root of the search tree and has at least two children in the depth first tree (the children's subtrees are connected only through the root), or
- u is not the root and has a child v with `low[v] >= disc[u]`: the subtree of v cannot reach any ancestor of u without passing through u, so removing u separates the subtree

The difference from bridges is `>=` here against `>` for bridges, because for a vertex a back edge to u itself does not help the subtree escape once u is removed.

Example graph: the triangle {0, 1, 2}, the edge 1-3, the triangle {3, 4, 5} and the edge 5-6. Removing 1 separates {0, 2} from the rest; removing 3 separates {0, 1, 2} from {4, 5, 6}; removing 5 isolates 6 and separates it from {3, 4}. So the articulation points are 1, 3 and 5. For the path 0-1-2-3 the articulation points are 1 and 2 (interior vertices), and for a cycle there are none.

The root rule: for the root, any non-root condition would be wrong since the root has no ancestors; instead count the children in the depth first tree. A root with a single child is not an articulation point, because the rest of the graph hangs below it.

Algorithm outline:

- For each unvisited vertex start `visit(root)` with parent −1 and a child counter
- In `visit(u, parent)`: set `disc[u] = low[u] = time`; for each neighbour v other than the parent: if v is visited, `low[u] = min(low[u], disc[v])`; otherwise recurse, set `low[u] = min(low[u], low[v])`, increase the child count and, if `parent != −1 and low[v] >= disc[u]`, mark u
- After the loop, if `parent == −1` and the number of children is at least 2, mark u as an articulation point

Complexity O(V + E) time and O(V) space; iterative versions avoid deep recursion.

Applications:

- Network and infrastructure resilience: which nodes are single points of failure
- Social network analysis: individuals connecting otherwise separate groups (brokers)
- Circuit design and road networks: critical junctions
- Biconnected components and block-cut tree: decomposing a graph into blocks joined at articulation points, used in planar graph algorithms and in counting problems
- Counting how many vertices are articulation points (the common interview variant)
- Minimum number of edges to add to make a graph biconnected

Relation to other concepts: every endpoint of a bridge that has other edges is an articulation point (unless it is a leaf); a vertex of degree one is never an articulation point; articulation points need at least three vertices in a path.

Pitfalls: not treating the root separately, using `>` instead of `>=`, forgetting to skip the parent (or handle parallel edges), marking the same vertex several times (use a set or a flag), and missing other components by starting from only one vertex.

Testing: compare with a brute force that removes each vertex and counts the components, on random small graphs.

## explain
1. Run a depth first search recording discovery times and low-link values.
2. For each non-root vertex u with a child v, check whether low[v] is at least disc[u].
3. For the root, count its children in the depth first tree and mark it if there are two or more.
4. Collect the marked vertices in a set.
5. Start the search from every unvisited vertex.
6. Verify with a brute force vertex removal on small graphs.

## example
The Python program finds the articulation points 1, 3 and 5 in the sample graph and verifies the result against vertex removal on 100 seeded random graphs. The JavaScript program prints the articulation points for the path graph 0-1-2-3 (1 and 2) and for a cycle (none).

## real
Network engineers locate routers whose failure partitions the network, social scientists find people who link communities and infrastructure planners find critical junctions.

## pros
- Linear time with the same machinery as bridges
- Identifies single points of failure among vertices
- Leads to biconnected components and block-cut trees

## cons
- The root needs a special case
- The condition differs subtly from the bridge condition
- Deep graphs need an iterative version to avoid a stack overflow

## uses
- Finding single points of failure in networks
- Counting cut vertices
- Biconnected component decomposition
- Social network brokerage analysis

## mistakes
- Using the non-root test for the root
- Using strictly greater instead of greater or equal
- Marking a vertex repeatedly and counting it twice
- Forgetting vertices in other components

## interview
**Q:** What is an articulation point and how do you find all of them?
**A:** A vertex whose removal disconnects the graph; run a depth first search with discovery and low-link values and mark a non-root vertex u if some child v has low[v] at least disc[u], and the root if it has two or more children in the search tree.

**Q:** Why does the root need a different rule?
**A:** The root has no ancestors for the subtrees to reach, so the low-link test would always be true; the root is a cut vertex exactly when it has at least two depth first search children, since those subtrees are connected only through it.

**Q:** How does the articulation point condition differ from the bridge condition?
**A:** For a bridge the child's low value must be strictly greater than the parent's discovery time, for an articulation point it must be greater than or equal, because a back edge to the vertex itself does not keep the subtree connected after the vertex is removed.

## summary
Articulation points are found in O(V + E) by a depth first search: a non-root vertex qualifies when some child's low-link value is at least its own discovery time, and the root qualifies with two or more children. Treat the root separately and use the greater-or-equal test.

## codenote
The Python sample finds articulation points and verifies by vertex removal. The JavaScript sample prints them for a path and a cycle.

## code
### python
```python
import random
import sys

sys.setrecursionlimit(5000)

def articulation_points(n, edges):
    graph = [[] for _ in range(n)]
    for u, v in edges:
        graph[u].append(v)
        graph[v].append(u)
    disc, low, points, timer = {}, {}, set(), [0]

    def visit(node, parent):
        disc[node] = low[node] = timer[0]
        timer[0] += 1
        children = 0
        for nxt in graph[node]:
            if nxt == parent:
                continue
            if nxt in disc:
                low[node] = min(low[node], disc[nxt])
            else:
                children += 1
                visit(nxt, node)
                low[node] = min(low[node], low[nxt])
                if parent != -1 and low[nxt] >= disc[node]:
                    points.add(node)
        if parent == -1 and children >= 2:
            points.add(node)

    for v in range(n):
        if v not in disc:
            visit(v, -1)
    return sorted(points)

def component_count(n, edges, skip=None):
    graph = {v: [] for v in range(n) if v != skip}
    for u, v in edges:
        if u != skip and v != skip:
            graph[u].append(v)
            graph[v].append(u)
    seen, count = set(), 0
    for start in graph:
        if start not in seen:
            count += 1
            stack = [start]
            while stack:
                node = stack.pop()
                if node not in seen:
                    seen.add(node)
                    stack.extend(graph[node])
    return count

sample = [(0, 1), (1, 2), (2, 0), (1, 3), (3, 4), (4, 5), (5, 3), (5, 6)]
print(articulation_points(7, sample))

rng = random.Random(14)
ok = True
for _ in range(100):
    n = rng.randint(2, 8)
    edges = list({tuple(sorted((rng.randrange(n), rng.randrange(n)))) for _ in range(rng.randint(1, 10))})
    edges = [e for e in edges if e[0] != e[1]]
    base = component_count(n, edges)
    expected = [v for v in range(n) if component_count(n, edges, skip=v) > base - (1 if not any(v in e for e in edges) else 0)]
    ok = ok and articulation_points(n, edges) == expected
print(ok)
```
Output:
```text
[1, 3, 5]
True
```
### javascript
```javascript
function cutVertices(n, edges) {
  const graph = Array.from({ length: n }, () => []);
  for (const [u, v] of edges) {
    graph[u].push(v);
    graph[v].push(u);
  }
  const disc = new Array(n).fill(-1);
  const low = new Array(n).fill(0);
  const points = new Set();
  let timer = 0;
  const visit = (node, parent) => {
    disc[node] = low[node] = timer++;
    let children = 0;
    for (const next of graph[node]) {
      if (next === parent) continue;
      if (disc[next] !== -1) low[node] = Math.min(low[node], disc[next]);
      else {
        children++;
        visit(next, node);
        low[node] = Math.min(low[node], low[next]);
        if (parent !== -1 && low[next] >= disc[node]) points.add(node);
      }
    }
    if (parent === -1 && children >= 2) points.add(node);
  };
  for (let v = 0; v < n; v++) if (disc[v] === -1) visit(v, -1);
  return [...points].sort();
}

console.log(cutVertices(4, [[0, 1], [1, 2], [2, 3]]).join(" "), "|", cutVertices(4, [[0, 1], [1, 2], [2, 3], [3, 0]]).length);
```
Output:
```text
1 2 | 0
```

## quiz
1. What is an articulation point?
   - [ ] A vertex with the highest degree
   - [x] A vertex whose removal increases the number of connected components
   - [ ] A vertex on a cycle
   - [ ] The first vertex visited
   > It is a single point of failure.
2. When is the root of the search tree an articulation point?
   - [ ] Always
   - [x] When it has two or more children in the depth first tree
   - [ ] When it has degree one
   - [ ] Never
   > The subtrees are connected only through it.
3. Which comparison identifies a non-root articulation point?
   - [ ] low[v] less than disc[u]
   - [x] low[v] greater than or equal to disc[u] for some child v
   - [ ] low[v] equal to zero
   - [ ] disc[v] greater than disc[u] for all children
   > The child's subtree cannot reach above u.
4. Which vertices in a path of four vertices are articulation points?
   - [ ] The two endpoints
   - [x] The two interior vertices
   - [ ] All four
   - [ ] None
   > Removing an interior vertex splits the path.
