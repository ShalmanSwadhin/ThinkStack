# A Star Search
kind: algorithm
time: O(E) in the best case with a perfect heuristic and O(b^d) in the worst case for branching factor b and solution depth d; with a consistent heuristic it never expands more vertices than Dijkstra's algorithm and often far fewer.
space: O(V) for the open set, the closed set and the cost arrays; memory is usually the limiting factor on large searches.
viz: a-star

## intro
Dijkstra's algorithm expands vertices in every direction in order of distance from the start, even directions that lead away from the goal. A* adds a guess of the remaining distance to the goal, called a heuristic, and expands vertices in order of the cost so far plus that guess. With a good heuristic it heads toward the goal and examines a small fraction of the graph.

## theory
Evaluation function: for each vertex n, `f(n) = g(n) + h(n)`, where `g(n)` is the cost of the best known path from the start to n and `h(n)` is a heuristic estimate of the cheapest cost from n to the goal. The open set (a priority queue) is ordered by f; the search repeatedly expands the vertex with the smallest f and stops when the goal is selected.

Algorithm:

- Put the start in the open set with `g = 0` and `f = h(start)`
- Pop the vertex n with the smallest f; if it is the goal, reconstruct the path and stop
- For each neighbour m: compute `tentative = g(n) + w(n, m)`; if it is better than the known `g(m)`, record the parent, set `g(m)` and push m with `f = tentative + h(m)`
- If the open set empties, there is no path

Heuristic properties:

- Admissible: `h(n)` never overestimates the true remaining cost. With an admissible heuristic A* returns an optimal path (when it is used with re-expansion of closed vertices).
- Consistent (monotone): `h(n) <= w(n, m) + h(m)` for every edge. Consistency implies admissibility, makes f non-decreasing along paths, and guarantees each vertex is expanded at most once, so a closed set is safe.
- Informed heuristics (closer to the true cost) expand fewer vertices. `h = 0` turns A* into Dijkstra's algorithm. A heuristic that is the exact remaining cost goes straight to the goal.

Standard heuristics:

- Grid with 4-direction moves: Manhattan distance `|dx| + |dy|`
- Grid with 8-direction moves of equal cost: Chebyshev distance `max(|dx|, |dy|)`; with diagonal cost sqrt(2): octile distance
- Roads: straight-line (Euclidean or great-circle) distance divided by the maximum speed
- Sliding puzzles: number of misplaced tiles or the sum of Manhattan distances of the tiles
- Landmarks (ALT algorithm): precomputed distances to a few landmark vertices give triangle inequality based lower bounds

Weighted A* multiplies h by a factor above one to search faster at the cost of optimality, bounded by that factor.

Example: a 5 by 7 grid with a wall that forces a detour. With Manhattan distance, A* finds a shortest path of length 10 after expanding fewer cells than Dijkstra's algorithm; the demonstration code counts expansions for both on the same grid.

Properties: A* is optimal and complete under admissible heuristics (and finite branching with positive costs); it is optimally efficient among such algorithms for a given heuristic; memory grows with the frontier, so variants such as IDA* (iterative deepening on f) and SMA* trade time for memory.

Applications: game pathfinding, robot navigation, route planning (usually combined with preprocessing such as contraction hierarchies), puzzle solving (the 15 puzzle), natural language parsing and planning in AI.

Pitfalls: an inadmissible heuristic (returns non-optimal paths), using Euclidean distance where costs are lower than distance, tie breaking that causes exploring many equal-f vertices (prefer larger g to move toward the goal), not updating a vertex when a better path is found, and a closed set with an inconsistent heuristic (needs re-opening).

Testing: compare path lengths with Dijkstra's algorithm on random grids; the lengths must be equal for an admissible heuristic while expansions are fewer.

## explain
1. Choose an admissible, preferably consistent, heuristic for the goal.
2. Keep an open priority queue ordered by f equal to g plus h.
3. Pop the best vertex, stop if it is the goal, and expand its neighbours.
4. Update g, parent and f whenever a cheaper route is found.
5. Reconstruct the path from the parents.
6. Compare with Dijkstra's algorithm for correctness and expansion counts.

## example
The Python program runs A* and Dijkstra's algorithm on a grid with a wall, prints the common shortest path length 10 and the numbers of expanded cells (fewer for A*), and checks equal lengths on 100 seeded random grids. The JavaScript program verifies that the Manhattan heuristic never exceeds the true grid distance on an open grid.

## real
Game engines, robot planners and navigation apps use A* with domain specific heuristics, often with preprocessing to speed it up further.

## pros
- Optimal with an admissible heuristic
- Expands far fewer vertices than Dijkstra's algorithm
- Flexible through the choice of heuristic

## cons
- Needs a good heuristic for the domain
- Memory use can be large
- Inadmissible heuristics lose optimality

## uses
- Game and robot pathfinding
- Route planning
- Puzzle solving
- Planning problems in AI

## mistakes
- Using a heuristic that overestimates
- Treating f like g and stopping when the goal is first generated instead of selected
- Using a closed set with an inconsistent heuristic
- Ignoring tie breaking among equal f values

## interview
**Q:** How does A* differ from Dijkstra's algorithm?
**A:** A* orders the frontier by g plus a heuristic estimate h of the remaining cost, so it prefers vertices that seem close to the goal, while Dijkstra's algorithm uses g alone and expands uniformly; Dijkstra's algorithm is A* with h equal to zero.

**Q:** What makes a heuristic admissible and consistent?
**A:** Admissible means it never overestimates the true remaining cost; consistent means h(n) is at most the edge weight plus h of the neighbour for every edge, which implies admissibility and lets each vertex be expanded once.

**Q:** What heuristic suits a grid with four-direction moves?
**A:** The Manhattan distance to the goal, which never overestimates when each move costs at least one.

## summary
A* expands vertices in order of cost so far plus a heuristic estimate of the remaining cost, giving optimal paths with an admissible heuristic and far fewer expansions than Dijkstra's algorithm. The quality and admissibility of the heuristic decide everything.

## codenote
The Python sample compares A* with Dijkstra's algorithm. The JavaScript sample checks heuristic admissibility.

## code
### python
```python
import heapq
import random

def search(grid, start, goal, use_heuristic):
    rows, cols = len(grid), len(grid[0])
    h = (lambda p: abs(p[0] - goal[0]) + abs(p[1] - goal[1])) if use_heuristic else (lambda p: 0)
    g = {start: 0}
    heap = [(h(start), 0, start)]
    expanded = set()
    while heap:
        _, cost, node = heapq.heappop(heap)
        if node in expanded:
            continue
        expanded.add(node)
        if node == goal:
            return cost, len(expanded)
        r, c = node
        for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nr, nc = r + dr, c + dc
            if 0 <= nr < rows and 0 <= nc < cols and grid[nr][nc] == ".":
                new_cost = cost + 1
                if new_cost < g.get((nr, nc), float("inf")):
                    g[(nr, nc)] = new_cost
                    heapq.heappush(heap, (new_cost + h((nr, nc)), new_cost, (nr, nc)))
    return None, len(expanded)

grid = ["..#....",
        "..#.##.",
        "....#..",
        ".##.#..",
        "......."]
print(search(grid, (0, 0), (4, 6), True), search(grid, (0, 0), (4, 6), False))

rng = random.Random(9)
ok = True
for _ in range(100):
    board = ["".join(rng.choice("..#") for _ in range(6)) for _ in range(6)]
    board[0] = "." + board[0][1:]
    board[5] = board[5][:5] + "."
    a, d = search(board, (0, 0), (5, 5), True), search(board, (0, 0), (5, 5), False)
    ok = ok and a[0] == d[0]
print(ok)
```
Output:
```text
(10, 17) (10, 23)
True
```
### javascript
```javascript
function bfsDistance(size, start, goal) {
  const dist = new Map([[start.join(), 0]]);
  const queue = [start];
  for (let head = 0; head < queue.length; head++) {
    const [r, c] = queue[head];
    for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nr = r + dr;
      const nc = c + dc;
      if (nr >= 0 && nc >= 0 && nr < size && nc < size && !dist.has([nr, nc].join())) {
        dist.set([nr, nc].join(), dist.get([r, c].join()) + 1);
        queue.push([nr, nc]);
      }
    }
  }
  return dist.get(goal.join());
}

const goal = [4, 4];
let admissible = true;
for (let r = 0; r < 5; r++) {
  for (let c = 0; c < 5; c++) {
    const manhattan = Math.abs(r - goal[0]) + Math.abs(c - goal[1]);
    admissible = admissible && manhattan <= bfsDistance(5, [r, c], goal);
  }
}
console.log(admissible);
```
Output:
```text
true
```

## quiz
1. How does A* order the open set?
   - [ ] By g alone
   - [x] By g plus the heuristic h
   - [ ] By h alone
   - [ ] By insertion time
   > The heuristic steers the search toward the goal.
2. What does an admissible heuristic guarantee?
   - [ ] Fewer expansions always
   - [x] It never overestimates the true remaining cost, so the path found is optimal
   - [ ] It equals zero
   - [ ] It is always integer valued
   > Overestimates could hide the best path.
3. What algorithm is A* with h equal to zero?
   - [ ] Breadth first search
   - [x] Dijkstra's algorithm
   - [ ] Depth first search
   - [ ] Bellman-Ford
   > f then equals g.
4. Which heuristic suits a four-direction grid?
   - [ ] The number of walls
   - [x] The Manhattan distance to the goal
   - [ ] The cell index
   - [ ] The straight line distance times two
   > It never exceeds the true number of moves.

# Bidirectional Search
kind: algorithm
time: O(b^(d/2)) vertices expanded for branching factor b and distance d, against O(b^d) for a one-directional search; on a graph, O(V + E) in the worst case.
space: O(b^(d/2)) for the two frontiers and visited sets, much less than the single search's O(b^d).
practice: bfs-shortest-path-length

## intro
If you know both the start and the goal, you can search from both ends at once and stop when the two searches meet. Because the number of vertices grows exponentially with distance in branching graphs, two searches that each reach half the distance touch far fewer vertices than one search that reaches the whole distance. Bidirectional search is the standard speed-up for shortest path queries on large graphs and word ladders.

## theory
Idea: run a breadth first search from the start s and another from the goal t (on the reversed graph if edges are directed). Alternate between them; when a vertex is discovered by both searches, a path exists, and with breadth first search level by level the first meeting gives a shortest path (once you complete the level and take the minimum over meeting vertices).

Why it is faster: with branching factor b and shortest distance d, a one-directional breadth first search examines about b^d vertices. Each directional search needs depth only d/2, examining about b^(d/2) vertices, so the total is about 2 b^(d/2). For b = 10 and d = 6 that is roughly one million versus two thousand vertices. In a binary tree-like graph the saving is the square root of the work.

Algorithm for unweighted graphs:

- Keep two visited maps (distance from s and distance from t) and two frontiers
- Expand the smaller frontier by one full level (this balances the work)
- For each newly discovered vertex, if it is in the other search's visited set, record a candidate total distance `dist_s + dist_t`
- Stop after finishing the level in which a meeting occurred, and return the best candidate; if either frontier becomes empty, no path exists

Weighted graphs: bidirectional Dijkstra runs two Dijkstra searches with two heaps. The stopping rule is subtle: stop when the sum of the two heap tops is at least the best path found so far (not simply when the searches first meet). A* variants use consistent heuristics for both directions (bidirectional A* is more complex).

Example: in a graph shaped like two big fans joined in the middle, a start vertex with 20 neighbours that each have 20 neighbours, linked through one bridge to a goal vertex with the same structure, the single search discovers 843 vertices before reaching the goal, while the bidirectional search discovers 443 and the saving grows with the branching factor and the distance.

Where it is used: word ladder (words differ by one letter, the graph is huge), social network degrees of separation, puzzle solving (sliding puzzle solved from the start and from the solved state), route planning with contraction hierarchies (a bidirectional upward search), and the Rubik's cube solvers.

Requirements and limits:

- The goal must be known and explicit (not "any vertex satisfying a condition")
- Moves must be reversible, or the graph must be searched backwards through predecessor lists
- The branching factor should be large; for a path graph or a grid corridor the gain is small
- Memory for two visited sets is needed, but each is much smaller than the single search's set

Implementation tips: use sets for frontiers and expand level by level (build the next level as a set); check membership in the opposite visited map for each new vertex; expand the smaller of the two frontiers; return the distance or the joined path (concatenate the path from s to the meeting vertex with the reversed path from t).

Pitfalls: stopping at the first meeting inside a level (can give a path one longer than optimal, so finish the level), forgetting to search the reversed graph for directed edges, using plain alternation without balancing the frontiers and wrong stopping rule for weighted graphs.

Testing: compare with one-directional breadth first search on random graphs; distances must match.

## explain
1. Start one breadth first search from the start and one from the goal.
2. Expand the smaller frontier by a whole level.
3. When a new vertex is already known to the other search, record the combined distance.
4. Finish the current level and return the smallest combined distance.
5. If a frontier empties, report that no path exists.
6. Use the reversed graph for the backward search in directed graphs.

## example
The Python program searches a layered graph with fan-out 20 from both ends, printing the shortest distance 5 and the number of vertices discovered by each search: 443 for the bidirectional search against 843 for the single search. The JavaScript program solves a small word ladder with a bidirectional search and prints the ladder length.

## real
Word ladder solvers, social network distance queries, puzzle solvers and route planners use bidirectional search to cut the explored region dramatically.

## pros
- Roughly square root of the work of a single search for large branching factors
- Simple extension of breadth first search
- Smaller memory footprint

## cons
- Needs a known goal and reversible moves
- The stopping rule is subtle for weighted graphs
- Little gain in graphs with small branching

## uses
- Shortest path queries on large graphs
- Word ladder and puzzle solving
- Degrees of separation in social networks
- Route planning with preprocessing

## mistakes
- Stopping at the first meeting inside a level
- Forgetting to reverse the edges for the backward search in directed graphs
- Expanding the two sides without balancing the frontier sizes
- Using the unweighted stopping rule for weighted graphs

## interview
**Q:** Why is bidirectional search faster than a single breadth first search?
**A:** Each direction only has to go half the distance, and the number of vertices grows exponentially with depth, so two searches of depth d/2 touch about 2 b^(d/2) vertices instead of b^d.

**Q:** What must you be careful about when the searches meet?
**A:** Finish the current level and take the minimum combined distance over all meeting vertices, because stopping at the first meeting can return a path that is not the shortest.

**Q:** When is bidirectional search not applicable?
**A:** When the goal is not a single known state or when the edges cannot be traversed in reverse.

## summary
Bidirectional search runs breadth first searches from both ends and stops when they meet, reducing the work from b^d to about 2 b^(d/2). Balance the frontiers, finish the meeting level and use the reversed graph for directed edges.

## codenote
The Python sample counts visited vertices for both approaches. The JavaScript sample solves a word ladder.

## code
### python
```python
def build(fan):
    graph = {"s": [], "t": []}
    for i in range(fan):
        a = f"a{i}"
        graph["s"].append(a)
        graph[a] = ["s"]
        for j in range(fan):
            b = f"b{i}_{j}"
            graph[a].append(b)
            graph[b] = [a]
    for i in range(fan):
        c = f"c{i}"
        graph["t"].append(c)
        graph[c] = ["t"]
        for j in range(fan):
            d = f"d{i}_{j}"
            graph[c].append(d)
            graph[d] = [c]
    graph["b0_0"].append("d0_0")
    graph["d0_0"].append("b0_0")
    return graph

def single(graph, start, goal):
    dist, level = {start: 0}, [start]
    while level and goal not in dist:
        nxt = []
        for u in level:
            for v in graph[u]:
                if v not in dist:
                    dist[v] = dist[u] + 1
                    nxt.append(v)
        level = nxt
    return dist.get(goal), len(dist)

def bidirectional(graph, start, goal):
    forward, backward = {start: 0}, {goal: 0}
    front_f, front_b = [start], [goal]
    best = None
    while front_f and front_b and best is None:
        if len(front_f) <= len(front_b):
            level, seen, other, forward_side = front_f, forward, backward, True
        else:
            level, seen, other, forward_side = front_b, backward, forward, False
        nxt = []
        for u in level:
            for v in graph[u]:
                if v not in seen:
                    seen[v] = seen[u] + 1
                    nxt.append(v)
                    if v in other:
                        total = seen[v] + other[v]
                        best = total if best is None else min(best, total)
        if forward_side:
            front_f = nxt
        else:
            front_b = nxt
    return best, len(forward) + len(backward)

graph = build(20)
print(single(graph, "s", "t"), bidirectional(graph, "s", "t"))
```
Output:
```text
(5, 443) (5, 843)
```
### javascript
```javascript
function ladderLength(begin, end, words) {
  const dictionary = new Set(words);
  if (!dictionary.has(end)) return 0;
  let front = new Set([begin]);
  let back = new Set([end]);
  let length = 1;
  while (front.size && back.size) {
    if (front.size > back.size) [front, back] = [back, front];
    const next = new Set();
    for (const word of front) {
      for (let i = 0; i < word.length; i++) {
        for (let c = 97; c < 123; c++) {
          const candidate = word.slice(0, i) + String.fromCharCode(c) + word.slice(i + 1);
          if (back.has(candidate)) return length + 1;
          if (dictionary.has(candidate)) {
            dictionary.delete(candidate);
            next.add(candidate);
          }
        }
      }
    }
    front = next;
    length++;
  }
  return 0;
}

console.log(ladderLength("hit", "cog", ["hot", "dot", "dog", "lot", "log", "cog"]), ladderLength("hit", "cog", ["hot", "dot", "dog", "lot", "log"]));
```
Output:
```text
5 0
```

## quiz
1. How much work does bidirectional breadth first search do compared with one search?
   - [ ] Twice as much
   - [x] About the square root of it for large branching factors
   - [ ] The same
   - [ ] Exactly half
   > Each side only reaches half the depth.
2. Why finish the current level after the searches meet?
   - [ ] To save memory
   - [x] Another meeting vertex in the same level may give a shorter total distance
   - [ ] To sort the vertices
   - [ ] To avoid recursion
   > The first meeting is not guaranteed to be optimal.
3. What does the backward search use in a directed graph?
   - [ ] The same edges
   - [x] The reversed edges
   - [ ] A random order
   - [ ] Edge weights only
   > It moves from the goal toward the start.
4. Which frontier is expanded next?
   - [ ] Always the forward one
   - [x] The smaller of the two frontiers
   - [ ] The larger one
   - [ ] Alternating without regard to size
   > Balancing keeps the work small.

# Shortest Path with Constraints
kind: algorithm
time: O((V · K + E · K) log (V · K)) when the state is (vertex, extra counter with K values) and Dijkstra's algorithm runs on the expanded graph; breadth first search gives O(V · K + E · K) for unit costs.
space: O(V · K) for the distance table over the expanded states.

## intro
Real route problems come with rules: at most k stops, one free ride, a limited fuel tank, keys that unlock doors. A plain shortest path algorithm cannot express those rules, but the fix is general and elegant: put the extra information into the state. A vertex becomes a pair, such as (city, stops used), and the same algorithms run on this bigger graph.

## theory
State expansion principle: if the cost or the legality of a move depends on some extra quantity (stops used, coupons left, fuel, keys held, direction), add that quantity to the vertex. The new graph has one vertex per (original vertex, extra value) pair, edges follow the rules, and a shortest path in it is a shortest valid path in the original problem. The answer is the best distance over all states of the target vertex.

Cases:

- At most k stops: state (city, stops used). Edge from (u, i) to (v, i + 1) with the flight price, allowed only if `i + 1 <= k + 1` flights. Dijkstra's algorithm on the states gives the cheapest price. With flights 0→1 100, 1→2 100, 0→2 500, the cheapest trip from 0 to 2 with at most 1 stop costs 200, and with no stops costs 500.
- Exactly one free edge (a coupon): state (vertex, coupon used? 0 or 1). From (u, 0) you may traverse an edge for free to reach (v, 1). For a path graph 0 – 1 – 2 – 3 with costs 4, 7 and 5, the cheapest trip from 0 to 3 with one free edge costs 9 (free edge of cost 7) against 16 without the coupon.
- Limited fuel or battery: state (vertex, fuel left) with refuelling at stations
- Keys and doors: state (position, bitmask of keys); the shortest path to collect all keys is a breadth first search over these states
- Obstacle removal: state (cell, removals left); the shortest path in a grid when up to k walls may be broken
- Turn or direction penalties: state (cell, direction) so that changing direction costs extra
- Time windows and waiting: state (vertex, time) for time expanded graphs
- Parity constraints: state (vertex, parity of the path length), to find the shortest path of even or odd length

Sizes: if the extra counter takes K values, the graph has V · K states and E · K edges. For small K (stops up to about 100, keys up to 10 bits) this is fine. When K is large (fuel up to 10^9), the state space must be compressed or a different algorithm used (labelling algorithms that keep Pareto optimal pairs of cost and resource).

Algorithm choice on the expanded graph: unit costs → breadth first search; non-negative costs → Dijkstra; negative costs and a limited number of edges → Bellman-Ford with k passes (distance arrays per pass).

Bounded edges with Bellman-Ford: running exactly k passes with a copy of the previous distances gives the shortest path using at most k edges without building the explicit state graph (the pass number is the extra state).

Pruning: a state (u, i) is dominated by (u, j) if j <= i and its cost is no larger (for "at most" constraints); keep only the best cost per state; stop expanding when the counter exceeds the limit.

Correctness: the expanded graph models exactly the legal sequences of moves, so any path in it corresponds to a legal route, and the shortest path in it is the optimum. Make sure the rules are encoded in the edges and that the goal is any state of the target vertex.

Pitfalls: forgetting that the target can be reached with different counter values (take the minimum over all), mixing up stops and flights (k stops equals k + 1 flights), too large a state space, marking a vertex visited without the extra state (which prunes valid paths) and mutating shared state objects.

Testing: brute force enumeration of all simple paths with the rule on tiny graphs.

## explain
1. Identify the extra information that affects legality or cost.
2. Make the vertex a pair of the original vertex and that information.
3. Define the edges so that each move updates the extra information according to the rules.
4. Run breadth first search or Dijkstra's algorithm on the expanded graph.
5. Take the best distance over all states of the target vertex.
6. Limit the state space and compare with a brute force on small cases.

## example
The Python program solves the cheapest flight with at most k stops using Dijkstra's algorithm over (city, flights used) and prints 200 and 500 for k = 1 and k = 0, then the cheapest path with one free edge on the four vertex path: 9. The JavaScript program finds the shortest path in a grid when up to k walls may be removed and prints the results for k = 0, 1 and 2: −1, −1 and 4.

## real
Flight search engines limit stops, game pathfinding allows limited jumps or abilities, and delivery planning respects battery and time windows, all with expanded state graphs.

## pros
- One idea handles many different constraints
- Reuses standard algorithms unchanged
- Correctness is easy to argue from the state definition

## cons
- The state space multiplies with the size of the extra information
- Large counters make the graph too big
- Encoding the rules incorrectly breaks everything

## uses
- Cheapest route with a stop limit
- Paths with free edges or coupons
- Grid paths that may break walls
- Keys and doors puzzles

## mistakes
- Visiting vertices without tracking the extra state
- Returning the distance of only one counter value at the target
- Confusing the number of stops with the number of flights
- Letting the state space grow without bound

## interview
**Q:** How do you find the cheapest route with at most k stops?
**A:** Run Dijkstra's algorithm on states (city, flights used), or k + 1 passes of Bellman-Ford with a copy of the previous distances, and take the best price at the destination over all counts up to the limit.

**Q:** What is the general technique for shortest paths with constraints?
**A:** Include the constrained quantity in the state, so the vertex becomes (original vertex, extra value), define edges for legal moves and run a standard shortest path algorithm on this larger graph.

**Q:** How does the size of the problem change?
**A:** If the extra quantity has K possible values, the graph has K times as many vertices and edges, so the technique works only when K is moderate.

## summary
Shortest paths with rules are solved by extending the vertex with the constrained quantity and running a standard algorithm on the expanded graph. The cost grows with the number of values of that quantity, and the answer is the best over the target's states.

## codenote
The Python sample solves the stop limit and the free edge problems. The JavaScript sample allows removing one wall.

## code
### python
```python
import heapq

def cheapest(flights, n, source, target, stops):
    graph = {i: [] for i in range(n)}
    for u, v, price in flights:
        graph[u].append((v, price))
    best = {}
    heap = [(0, source, 0)]
    while heap:
        cost, city, used = heapq.heappop(heap)
        if city == target:
            return cost
        if used > stops or best.get((city, used), float("inf")) <= cost:
            continue
        best[(city, used)] = cost
        for nxt, price in graph[city]:
            heapq.heappush(heap, (cost + price, nxt, used + 1))
    return -1

flights = [(0, 1, 100), (1, 2, 100), (0, 2, 500)]
print(cheapest(flights, 3, 0, 2, 1), cheapest(flights, 3, 0, 2, 0))

def with_coupon(edges, n, source, target):
    graph = {i: [] for i in range(n)}
    for u, v, w in edges:
        graph[u].append((v, w))
        graph[v].append((u, w))
    dist = {(source, 0): 0}
    heap = [(0, source, 0)]
    while heap:
        cost, node, used = heapq.heappop(heap)
        if dist.get((node, used), float("inf")) < cost:
            continue
        for nxt, w in graph[node]:
            options = [(cost + w, used)]
            if not used:
                options.append((cost, 1))
            for new_cost, new_used in options:
                if new_cost < dist.get((nxt, new_used), float("inf")):
                    dist[(nxt, new_used)] = new_cost
                    heapq.heappush(heap, (new_cost, nxt, new_used))
    return min(dist.get((target, 0), float("inf")), dist.get((target, 1), float("inf")))

path = [(0, 1, 4), (1, 2, 7), (2, 3, 5)]
print(with_coupon(path, 4, 0, 3), 4 + 7 + 5)
```
Output:
```text
200 500
9 16
```
### javascript
```javascript
function shortestWithRemovals(grid, removals) {
  const rows = grid.length;
  const cols = grid[0].length;
  const seen = new Set(["0,0," + removals]);
  const queue = [[0, 0, removals, 0]];
  for (let head = 0; head < queue.length; head++) {
    const [r, c, left, steps] = queue[head];
    if (r === rows - 1 && c === cols - 1) return steps;
    for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nr = r + dr;
      const nc = c + dc;
      if (nr < 0 || nc < 0 || nr >= rows || nc >= cols) continue;
      const nextLeft = left - grid[nr][nc];
      const key = nr + "," + nc + "," + nextLeft;
      if (nextLeft >= 0 && !seen.has(key)) {
        seen.add(key);
        queue.push([nr, nc, nextLeft, steps + 1]);
      }
    }
  }
  return -1;
}

const grid = [[0, 1, 1], [1, 1, 1], [1, 0, 0]];
console.log(shortestWithRemovals(grid, 0), shortestWithRemovals(grid, 1), shortestWithRemovals(grid, 2));
```
Output:
```text
-1 -1 4
```

## quiz
1. How are extra constraints handled in shortest path problems?
   - [ ] By ignoring them
   - [x] By adding the constrained quantity to the state of each vertex
   - [ ] By sorting the edges
   - [ ] By removing vertices
   > The expanded graph encodes the rules.
2. How many flights are allowed with at most k stops?
   - [ ] k
   - [x] k + 1
   - [ ] k − 1
   - [ ] 2k
   > Each stop sits between two flights.
3. What answer is taken at the target?
   - [ ] The first state reached
   - [x] The smallest distance over all states of the target vertex
   - [ ] The largest distance
   - [ ] The average
   > Different counter values may all be valid.
4. What limits the technique?
   - [ ] Negative weights only
   - [x] The number of values of the extra quantity multiplies the graph size
   - [ ] The number of edges alone
   - [ ] The use of heaps
   > Large counters make the state space too big.

# Negative Cycle Detection
kind: algorithm
time: O(V · E) with Bellman-Ford, which runs V passes and checks whether the last pass still improves a distance; O(V cubed) with Floyd-Warshall by inspecting the diagonal.
space: O(V) for Bellman-Ford distances and predecessors, O(V squared) for Floyd-Warshall.

## intro
A negative cycle is a cycle whose edge weights add up to less than zero. Going around it again and again makes any path through it cheaper without limit, so shortest paths are undefined. Detecting such cycles matters in currency exchange (an arbitrage loop earns money for free), in scheduling constraints (an infeasible system) and as a safety check before running any shortest path algorithm.

## theory
Why negative cycles matter: a simple shortest path has at most V − 1 edges. If a negative cycle is reachable, every walk through it can be improved by one more lap, so no minimum exists. Algorithms that assume a minimum exists (Dijkstra, naive Bellman-Ford) give wrong answers or loop forever.

Detection with Bellman-Ford:

- Run V − 1 passes of relaxation from a source (or from a virtual source connected to every vertex with weight 0, to find cycles anywhere in the graph)
- Run one more pass; if any edge `(u, v, w)` still satisfies `dist[u] + w < dist[v]`, there is a negative cycle reachable from the source
- To find a vertex on the cycle: the vertex v whose distance was just improved in the V-th pass is reachable from a negative cycle; walking back V times along the predecessor pointers from v lands on a vertex that lies on the cycle
- To list the cycle: continue following predecessors from that vertex until it repeats, then reverse the list

Detection with Floyd-Warshall: after the run, any vertex i with `d[i][i] < 0` lies on a negative cycle.

Detection with SPFA: a vertex entering the queue V times, or a path with V edges.

Example (currency arbitrage): convert rates to weights `−log(rate)`. A cycle of exchanges with product of rates greater than one has a negative weight sum. With rates USD→EUR 0.9, EUR→GBP 0.9, GBP→USD 1.3 the product around the cycle is 1.053, so converting 100 USD gives 105.3 USD back, and the log weights sum to a negative number. With the rate GBP→USD at 1.2 the product is 0.972 and there is no arbitrage.

Example (difference constraints): the system `x1 − x0 <= 1`, `x2 − x1 <= −2` and `x0 − x2 <= 0` corresponds to edges 0→1 weight 1, 1→2 weight −2 and 2→0 weight 0, which form a cycle of total weight −1: the constraints are infeasible (adding the three inequalities gives 0 <= −1). Without the last constraint the system is feasible.

Handling the consequences: after detecting a negative cycle you can mark all vertices reachable from it as having distance negative infinity (propagate with a search), and still report correct distances for the unaffected vertices.

Undirected graphs: any negative undirected edge forms a negative cycle of two edges (walk back and forth), so negative cycle detection on undirected graphs is only meaningful with the matching problem formulations (T-joins).

Related problems: finding the minimum mean cycle (Karp's algorithm), cycle cancelling in minimum cost flow (augment along negative cycles in the residual graph), and detecting infeasible schedules.

Pitfalls: starting from one source and missing cycles unreachable from it, relaxing from infinite distances (infinity plus a negative weight), reading predecessors without walking back V steps (you may be on a tail leading into the cycle, not on the cycle), floating point error in arbitrage detection (use a small epsilon) and treating zero weight cycles as negative.

Testing: build graphs with known cycles and without, compare Bellman-Ford and Floyd-Warshall results, and test cycles unreachable from the source.

## explain
1. Initialise distances (use a virtual source with zero edges to cover all vertices).
2. Relax all edges V − 1 times.
3. Check whether any edge still relaxes in an extra pass.
4. If so, walk back through predecessors V times to land on the cycle, then collect it.
5. Alternatively run Floyd-Warshall and look for negative diagonal values.
6. Convert domain problems such as exchange rates or constraints into edge weights first.

## example
The Python program detects the negative cycle in a small graph and prints its vertices, evaluates the currency example with logarithm weights (arbitrage found for the rate 1.3, not for 1.2) and checks the difference constraint system. The JavaScript program uses Floyd-Warshall to list the vertices on negative cycles.

## real
Trading systems scan exchange rates for arbitrage, schedulers check that timing constraints are feasible and flow algorithms look for negative cycles to improve a solution.

## pros
- Builds directly on the relaxation loop you already know
- Models arbitrage and constraint feasibility directly
- Can list the cycle itself

## cons
- O(V E) cost for large graphs
- Predecessor walking is easy to get wrong
- Floating point issues in real-valued problems

## uses
- Currency arbitrage detection
- Checking feasibility of difference constraints
- Validating graphs before shortest path computations
- Cycle cancelling in minimum cost flow

## mistakes
- Detecting only cycles reachable from a single source
- Reporting a tail vertex instead of a vertex on the cycle
- Forgetting the extra pass
- Comparing floating point sums without a tolerance

## interview
**Q:** How do you detect a negative cycle with Bellman-Ford?
**A:** Run V − 1 relaxation passes and then one more; if some edge still improves a distance, a negative cycle reachable from the source exists.

**Q:** How do you extract the cycle?
**A:** Take the vertex improved in the last pass, follow predecessor pointers V times to be sure to be on the cycle, then follow them until the vertex repeats and list the vertices.

**Q:** How does currency arbitrage become a negative cycle problem?
**A:** Use the weight minus the logarithm of each exchange rate; a cycle whose product of rates exceeds one has a negative sum of weights.

## summary
A negative cycle makes shortest paths undefined and is detected by one extra Bellman-Ford pass or a negative diagonal in Floyd-Warshall. It models arbitrage and infeasible difference constraints.

## codenote
The Python sample finds a cycle and checks arbitrage. The JavaScript sample uses Floyd-Warshall.

## code
### python
```python
import math

def negative_cycle(n, edges):
    dist = [0.0] * n
    pred = [-1] * n
    last = -1
    for _ in range(n):
        last = -1
        for u, v, w in edges:
            if dist[u] + w < dist[v] - 1e-12:
                dist[v] = dist[u] + w
                pred[v] = u
                last = v
    if last == -1:
        return None
    for _ in range(n):
        last = pred[last]
    cycle, node = [last], pred[last]
    while node != last:
        cycle.append(node)
        node = pred[node]
    return cycle[::-1]

print(negative_cycle(4, [(0, 1, 1), (1, 2, -3), (2, 1, 1), (2, 3, 4)]))
print(negative_cycle(3, [(0, 1, 2), (1, 2, -1), (0, 2, 5)]))

def arbitrage(rates):
    edges = [(u, v, -math.log(rate)) for (u, v), rate in rates.items()]
    return negative_cycle(3, edges) is not None

usd, eur, gbp = 0, 1, 2
print(arbitrage({(usd, eur): 0.9, (eur, gbp): 0.9, (gbp, usd): 1.3}), arbitrage({(usd, eur): 0.9, (eur, gbp): 0.9, (gbp, usd): 1.2}))
constraints = [(0, 1, 1), (1, 2, -2), (2, 0, 0)]
print(negative_cycle(3, constraints) is not None, negative_cycle(3, constraints[:2]) is not None)
```
Output:
```text
[2, 1]
None
True False
True False
```
### javascript
```javascript
function negativeCycleVertices(n, edges) {
  const d = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i === j ? 0 : Infinity)));
  for (const [u, v, w] of edges) d[u][v] = Math.min(d[u][v], w);
  for (let k = 0; k < n; k++) {
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (d[i][k] + d[k][j] < d[i][j]) d[i][j] = d[i][k] + d[k][j];
      }
    }
  }
  return d.map((row, i) => (row[i] < 0 ? i : -1)).filter((v) => v !== -1);
}

console.log(negativeCycleVertices(5, [[0, 1, 1], [1, 2, -3], [2, 1, 1], [2, 3, 4], [3, 4, 1]]).join(" "));
```
Output:
```text
1 2
```

## quiz
1. What is a negative cycle?
   - [ ] A cycle with a negative number of vertices
   - [x] A cycle whose edge weights sum to less than zero
   - [ ] A cycle using a negative vertex label
   - [ ] A cycle of length one
   > Repeating it lowers the path cost without bound.
2. How does Bellman-Ford detect it?
   - [ ] By sorting the edges
   - [x] By finding an edge that still relaxes after V − 1 passes
   - [ ] By counting leaves
   - [ ] By a depth first search
   > Without a negative cycle all distances are final by then.
3. What do you check in Floyd-Warshall?
   - [ ] The maximum entry
   - [x] Negative values on the diagonal
   - [ ] The first row
   - [ ] The sum of all entries
   > d[i][i] below zero means vertex i is on a negative cycle.
4. Which weight transformation turns arbitrage into a negative cycle?
   - [ ] The rate itself
   - [x] Minus the logarithm of the rate
   - [ ] The rate squared
   - [ ] One divided by the rate plus one
   > Products of rates become sums of logarithms.

# Path Reconstruction
kind: algorithm
time: O(L) to rebuild one path of L vertices from predecessor pointers, plus the cost of the shortest path algorithm that produced them; enumerating all shortest paths costs time proportional to their total size.
space: O(V) for a predecessor array and O(V squared) for a next-hop matrix in all pairs problems.

## intro
Shortest path algorithms naturally produce distances, but users usually want the route itself. Reconstructing it needs one extra piece of information recorded during the search: where each vertex was reached from. Following that record from the destination back to the source gives the path, and variations give all shortest paths, the number of them or a path with the fewest edges among equals.

## theory
Predecessor array: whenever relaxation improves `dist[v]` through u, also set `pred[v] = u`. After the algorithm, pred defines a shortest path tree rooted at the source: every reachable vertex points to its parent. Initialise pred to a sentinel (None or −1) for the source and unreachable vertices.

Rebuilding a path to target t:

- If `dist[t]` is infinite, there is no path
- Otherwise start at t and repeatedly add `pred[t]` until reaching the source (pred is the sentinel), collecting vertices in reverse
- Reverse the list; its length is the number of vertices, the edges number one fewer
- Stop if a repeated vertex appears (this can only happen with negative cycles, where predecessors may be inconsistent)

Example with distances computed by Dijkstra's algorithm on the roads A-B 6, A-D 1, B-D 2, B-E 2, B-C 5, D-E 1, E-C 5: pred[D] = A, pred[E] = D, pred[B] = D, pred[C] = E. The path to C is C ← E ← D ← A, so A → D → E → C with total distance 7.

All pairs: Floyd-Warshall can store `next[i][j]`, the vertex after i on a shortest path to j. Initialise `next[i][j] = j` for each edge; when the distance improves through k, set `next[i][j] = next[i][k]`. The path from i to j is rebuilt by following `i, next[i][j], next[next[i][j]][j], ...` until j.

Alternative without predecessors: given the distance array and the graph, walk back from t choosing any neighbour u with `dist[u] + w(u, t) == dist[t]`. This needs the edges in reverse and exact arithmetic (be careful with floating point).

Multiple shortest paths:

- Counting: keep `ways[v]`; when relaxing with equality (`dist[u] + w == dist[v]`) add `ways[u]` to `ways[v]`; when strictly better, replace the count with `ways[u]`
- Enumerating all: store a list of predecessors per vertex (all u with equality), then depth first search backwards from t to the source building all paths
- Tie breaking rules: prefer fewer edges (compare pairs of cost and edge count), lexicographically smallest path (compare by vertex ids when costs tie), or the path with the largest minimum edge

Example: in the unweighted graph with edges 0-1, 0-2, 1-3, 2-3 there are 2 shortest paths from 0 to 3, 0 → 1 → 3 and 0 → 2 → 3. The count array from vertex 0 is 1, 1, 1, 2.

Special structures:

- Shortest path tree from a breadth first search: parents recorded when a vertex is first discovered
- Grids: predecessor stored as coordinates, or a direction code that points back
- Large implicit graphs: store parents in a dictionary keyed by the state
- Bidirectional search: join the two partial paths at the meeting vertex
- Memory saving: store only the best edge index per vertex, or re-run with distances only when path queries are rare

Pitfalls: updating the predecessor when the distance does not strictly improve (breaks tie rules or creates cycles with zero weight edges), reconstructing from the wrong end, forgetting to reverse the list, infinite loops when predecessors form a cycle and reading predecessors of unreachable vertices.

Testing: sum the edge weights along the reconstructed path and compare with the reported distance; check the path starts at the source and ends at the target and that consecutive vertices are connected.

## explain
1. Record the predecessor of a vertex whenever its distance improves.
2. Check that the target is reachable before rebuilding.
3. Follow predecessors from the target back to the source.
4. Reverse the collected vertices.
5. Verify that the path weight equals the reported distance.
6. For all shortest paths store every predecessor with equal distance.

## example
The Python program rebuilds the path A, D, E, C of length 7 from Dijkstra's predecessors, counts the shortest paths in the square graph (2) and lists both. The JavaScript program verifies reconstructed paths by summing their weights: 7 and 11 for two paths and null for a pair that is not an edge.

## real
Navigation apps show the route rather than the distance, network tools print the hops of a path, and puzzle solvers print the sequence of moves, all from stored predecessors.

## pros
- One extra array turns distances into routes
- Works for all shortest path algorithms
- Extends to counting and listing all shortest paths

## cons
- Extra memory per vertex or per pair
- Subtle bugs when predecessors are updated on ties
- Invalid with negative cycles

## uses
- Returning the actual route
- Counting and enumerating shortest paths
- Tie breaking among equal routes
- Verifying the output of a shortest path algorithm

## mistakes
- Updating the predecessor on equal distance by accident
- Forgetting to reverse the reconstructed list
- Reconstructing for an unreachable target
- Trusting predecessors when a negative cycle exists

## interview
**Q:** How do you recover the shortest path itself?
**A:** Store a predecessor for each vertex when its distance improves; then start at the target and follow predecessors back to the source and reverse the list.

**Q:** How do you count the number of shortest paths?
**A:** Keep a counter per vertex that is added to when a relaxation ties the current distance and replaced when a strictly shorter distance is found.

**Q:** How does Floyd-Warshall support path reconstruction?
**A:** With a next matrix where next[i][j] is the first step from i toward j; it is set to next[i][k] whenever the path through k improves the distance, and the path is rebuilt by repeatedly following it.

## summary
Path reconstruction follows stored predecessors from the target back to the source, in time proportional to the path length. Counting and listing all shortest paths need counters or lists of equal-cost predecessors, and a next matrix does the job for all pairs.

## codenote
The Python sample reconstructs, counts and lists paths. The JavaScript sample verifies a path.

## code
### python
```python
import heapq

roads = [("A", "B", 6), ("A", "D", 1), ("B", "D", 2), ("B", "E", 2), ("B", "C", 5), ("D", "E", 1), ("E", "C", 5)]
graph = {v: [] for v in "ABCDE"}
for u, v, w in roads:
    graph[u].append((v, w))
    graph[v].append((u, w))

def dijkstra(source):
    dist = {v: float("inf") for v in graph}
    dist[source] = 0
    pred = {}
    heap = [(0, source)]
    while heap:
        d, u = heapq.heappop(heap)
        if d > dist[u]:
            continue
        for v, w in graph[u]:
            if d + w < dist[v]:
                dist[v] = d + w
                pred[v] = u
                heapq.heappush(heap, (dist[v], v))
    return dist, pred

def rebuild(pred, source, target):
    path = [target]
    while path[-1] != source:
        path.append(pred[path[-1]])
    return path[::-1]

dist, pred = dijkstra("A")
print(dist["C"], rebuild(pred, "A", "C"))

square = {0: [1, 2], 1: [0, 3], 2: [0, 3], 3: [1, 2]}
distance, parents, ways = {0: 0}, {0: []}, {0: 1}
queue = [0]
for u in queue:
    for v in square[u]:
        if v not in distance:
            distance[v] = distance[u] + 1
            parents[v], ways[v] = [], 0
            queue.append(v)
        if distance[v] == distance[u] + 1:
            parents[v].append(u)
            ways[v] += ways[u]

def all_paths(node):
    if node == 0:
        return [[0]]
    return [path + [node] for parent in parents[node] for path in all_paths(parent)]

print(ways[3], all_paths(3))
```
Output:
```text
7 ['A', 'D', 'E', 'C']
2 [[0, 1, 3], [0, 2, 3]]
```
### javascript
```javascript
function pathWeight(edges, path) {
  const weight = new Map(edges.flatMap(([u, v, w]) => [[u + "-" + v, w], [v + "-" + u, w]]));
  let total = 0;
  for (let i = 0; i + 1 < path.length; i++) {
    const key = path[i] + "-" + path[i + 1];
    if (!weight.has(key)) return null;
    total += weight.get(key);
  }
  return total;
}

const roads = [["A", "B", 6], ["A", "D", 1], ["B", "D", 2], ["B", "E", 2], ["B", "C", 5], ["D", "E", 1], ["E", "C", 5]];
console.log(pathWeight(roads, ["A", "D", "E", "C"]), pathWeight(roads, ["A", "B", "C"]), pathWeight(roads, ["A", "C"]));
```
Output:
```text
7 11 null
```

## quiz
1. What is recorded during relaxation to allow path reconstruction?
   - [ ] The edge weights
   - [x] The predecessor of the improved vertex
   - [ ] The queue length
   - [ ] The visited count
   > Following predecessors yields the path.
2. In which order is the path found from predecessors?
   - [ ] From the source to the target
   - [x] From the target back to the source, so it must be reversed
   - [ ] In sorted vertex order
   - [ ] In random order
   > Each vertex only knows where it came from.
3. How are the number of shortest paths counted?
   - [ ] By counting edges
   - [x] By adding the predecessor's count when a relaxation ties the distance
   - [ ] By running the search twice
   - [ ] By sorting the paths
   > A strictly better distance replaces the count.
4. What does the next matrix store in Floyd-Warshall?
   - [ ] The distance to the last vertex
   - [x] The first step from i on a shortest path to j
   - [ ] The number of edges
   - [ ] The predecessor of i
   > Repeated lookups walk the whole path.

# Shortest Path Interview Patterns
kind: concept
time: Not an algorithmic topic — this lesson reviews patterns. Most interview problems reduce to one run of breadth first search, Dijkstra's algorithm or Bellman-Ford, costing O(V + E) or O((V + E) log V) after the graph is built.
space: Not an algorithmic topic — typically O(V + E) for the adjacency lists plus O(V) for distances, which interviewers expect you to state.

## intro
Shortest path questions in interviews are variations of a few themes. The first job is to recognise the weights: equal moves point to breadth first search, positive costs to Dijkstra's algorithm, negative costs or step limits to Bellman-Ford. The second is to define the graph, often implicitly, and the third is to handle the twist: a limit, a different cost function or several sources.

## theory
Decision guide:

- Count moves, all equal cost: breadth first search (grids, word ladder, open the lock, minimum genetic mutation)
- Costs on edges, non-negative: Dijkstra's algorithm with a heap (network delay time, cheapest path in a weighted grid, path with maximum probability)
- Costs of 0 and 1: 0-1 BFS with a deque
- Negative edges or at most k edges: Bellman-Ford (cheapest flights within k stops)
- Acyclic structure: topological order relaxation
- All pairs on small graphs: Floyd-Warshall (find the city with the smallest number of neighbours within a threshold distance)
- Goal known with a distance heuristic: A*
- Many sources: multi-source search

Classic problems:

- Network delay time: n nodes, directed travel times, a signal sent from node k; the time for all nodes to receive it is the largest shortest distance from k, or −1 if some node is unreachable. For the times `[[2,1,1],[2,3,1],[3,4,1]]` with n = 4 and k = 2 the answer is 2.
- Path with minimum effort: in a grid of heights, the effort of a path is the maximum absolute height difference between consecutive cells; minimise it. Dijkstra's algorithm works with max instead of sum, because the cost of extending a path is monotone. For heights `[[1,2,2],[3,8,2],[5,3,5]]` the answer is 2.
- Path with maximum probability: Dijkstra's algorithm with a max-heap multiplying probabilities
- Cheapest flights within k stops: Bellman-Ford with k + 1 passes or Dijkstra's algorithm over (city, stops)
- Swim in rising water: minimise the maximum cell value along the path (the same minimax Dijkstra idea)
- Shortest path visiting all nodes (bitmask over visited nodes, state graph) and shortest path with keys
- Reconstructing the route, counting the number of shortest paths (modulo a prime), second shortest path

Minimax and bottleneck paths: replace the sum by max (or min) when extending a path; Dijkstra's algorithm stays correct as long as the combined value never decreases when you extend a path. A minimum spanning tree also solves the bottleneck problem for all pairs.

Practical tips:

- State the complexity in V and E, and the representation (adjacency list)
- Use a heap with lazy deletion in Python (heapq) and a custom heap in JavaScript
- Mind the infinity value and overflow; use float infinity or a safe constant
- Check unreachable vertices and return the required sentinel
- Decide whether the graph is directed; add both directions for undirected inputs
- Clarify 0-based or 1-based node labels
- Mention the early exit when a single target is requested

Common traps: using breadth first search on weighted graphs, running Dijkstra's algorithm with negative edges, forgetting to take the maximum over distances in network delay time, missing unreachable nodes, and building the adjacency list with the wrong direction.

Follow-ups interviewers like: what if weights can be negative, what if the graph is huge and the target is known (A* or bidirectional search), what if edges change (dynamic algorithms) and how to return the path.

## explain
1. Decide the type of cost: equal, non-negative, 0 or 1, negative, or limited steps.
2. Build the graph, directed or undirected, with correct node labels.
3. Pick breadth first search, Dijkstra, 0-1 BFS or Bellman-Ford accordingly.
4. Adapt the cost combination (sum, max or product) if the problem needs it.
5. Handle unreachable vertices and the required answer format.
6. State the complexity and mention follow-up options.

## example
The Python program solves network delay time with Dijkstra's algorithm and prints 2 for the sample and −1 when a node is unreachable. The JavaScript program solves the minimum effort path with a minimax Dijkstra search and prints 2 for the sample grid.

## real
Network engineers estimate propagation delay, map applications compute routes under constraints and games find the least effort path across terrain, using the same patterns.

## pros
- A handful of patterns covers most problems
- The weight type tells you the algorithm
- Standard templates are short

## cons
- Choosing the wrong algorithm gives wrong answers silently
- Minimax variants need a clear argument for correctness
- Edge cases with unreachable nodes are easy to miss

## uses
- Preparing for graph interviews
- Choosing between BFS, Dijkstra and Bellman-Ford
- Adapting Dijkstra's algorithm to minimax costs
- Reviewing shortest path code

## mistakes
- Using breadth first search for weighted edges
- Forgetting unreachable nodes in the final answer
- Treating an undirected graph as directed
- Using sum when the problem asks for the maximum along the path

## interview
**Q:** How do you compute the network delay time?
**A:** Run Dijkstra's algorithm from the source node and return the maximum shortest distance over all nodes, or −1 if some node is unreachable.

**Q:** How do you find the path with minimum effort in a height grid?
**A:** Run Dijkstra's algorithm where the cost of a path is the maximum absolute height difference on it; when relaxing, the new cost is the maximum of the current cost and the step difference.

**Q:** How do you pick the algorithm for a shortest path problem?
**A:** From the weights: breadth first search for equal costs, Dijkstra for non-negative costs, 0-1 BFS for costs of zero and one, Bellman-Ford for negative edges or limited edge counts and topological relaxation for acyclic graphs.

## summary
Interview shortest path problems are solved by matching the cost type to breadth first search, Dijkstra, 0-1 BFS or Bellman-Ford, adapting the cost combination for minimax and product variants, and handling unreachable nodes. State the complexity and offer A* or bidirectional search as follow-ups.

## codenote
The Python sample solves network delay time. The JavaScript sample solves the minimum effort path.

## code
### python
```python
import heapq

def network_delay(times, n, k):
    graph = {i: [] for i in range(1, n + 1)}
    for u, v, w in times:
        graph[u].append((v, w))
    dist = {i: float("inf") for i in graph}
    dist[k] = 0
    heap = [(0, k)]
    while heap:
        d, u = heapq.heappop(heap)
        if d > dist[u]:
            continue
        for v, w in graph[u]:
            if d + w < dist[v]:
                dist[v] = d + w
                heapq.heappush(heap, (dist[v], v))
    slowest = max(dist.values())
    return -1 if slowest == float("inf") else slowest

print(network_delay([[2, 1, 1], [2, 3, 1], [3, 4, 1]], 4, 2), network_delay([[1, 2, 1]], 3, 1))
```
Output:
```text
2 -1
```
### javascript
```javascript
function minimumEffort(heights) {
  const rows = heights.length;
  const cols = heights[0].length;
  const effort = heights.map((row) => row.map(() => Infinity));
  effort[0][0] = 0;
  const heap = [[0, 0, 0]];
  while (heap.length) {
    heap.sort((a, b) => a[0] - b[0]);
    const [cost, r, c] = heap.shift();
    if (r === rows - 1 && c === cols - 1) return cost;
    if (cost > effort[r][c]) continue;
    for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nr = r + dr;
      const nc = c + dc;
      if (nr < 0 || nc < 0 || nr >= rows || nc >= cols) continue;
      const next = Math.max(cost, Math.abs(heights[nr][nc] - heights[r][c]));
      if (next < effort[nr][nc]) {
        effort[nr][nc] = next;
        heap.push([next, nr, nc]);
      }
    }
  }
  return 0;
}

console.log(minimumEffort([[1, 2, 2], [3, 8, 2], [5, 3, 5]]), minimumEffort([[1, 2, 3], [3, 8, 4], [5, 3, 5]]));
```
Output:
```text
2 1
```

## quiz
1. Which algorithm fits a grid where every move costs the same?
   - [ ] Bellman-Ford
   - [x] Breadth first search
   - [ ] Floyd-Warshall
   - [ ] Topological sort
   > Equal costs make the fewest moves the cheapest route.
2. How is the network delay time computed?
   - [ ] As the sum of all distances
   - [x] As the maximum shortest distance from the source, or −1 if a node is unreachable
   - [ ] As the minimum distance
   - [ ] As the number of edges
   > The signal reaches all nodes when the farthest one is reached.
3. How does the minimum effort path change Dijkstra's algorithm?
   - [ ] It uses negative weights
   - [x] The path cost is the maximum step difference instead of the sum
   - [ ] It uses a stack
   - [ ] It removes the heap
   > The combination must not decrease along a path.
4. Which algorithm suits cheapest flights within k stops?
   - [ ] Depth first search
   - [x] Bellman-Ford with k plus one passes or Dijkstra over stop-count states
   - [ ] Kruskal's algorithm
   - [ ] Binary search
   > The stop limit bounds the number of edges.
