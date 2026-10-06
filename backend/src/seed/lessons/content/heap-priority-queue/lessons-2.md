# Kth Largest with Heap
kind: algorithm
time: O(n log k) to process n numbers with a min heap of size k, and O(log k) per number in a stream; O(1) to read the answer.
space: O(k) for the heap, independent of the number of elements processed.
practice: kth-largest-element

## intro
Finding the k-th largest element does not require sorting everything. A min heap that keeps only the k largest elements seen so far has the k-th largest at its root, so each new element costs a single comparison and, if it belongs, one heap replacement. This is the standard way to answer the question for a stream of numbers that never ends.

## theory
Min heap of size k:

- Keep a min heap containing at most k elements
- For each number: if the heap has fewer than k elements, push it; otherwise, if the number is larger than the root (the smallest of the k kept), replace the root with it (pop and push, or `heapreplace`)
- After processing, the root is the k-th largest element, and the heap holds the k largest

Why a min heap for the largest elements: the root of a min heap is the smallest element in the heap, which is exactly the one to evict when a bigger candidate arrives. A max heap of size k would answer the k smallest. Keeping k largest elements means the k-th largest is the minimum of the kept set.

Example: for `[3, 2, 3, 1, 2, 4, 5, 5, 6]` and k = 4, the four largest elements are 6, 5, 5 and 4, so the answer is 4. For the stream class with k = 3 and the initial numbers `[4, 5, 8, 2]`, the heap holds 4, 5, 8 after the initial pass; adding 3 leaves the third largest at 4, adding 5 gives 5, adding 10 gives 5, adding 9 gives 8 and adding 4 gives 8.

Complexity: each element costs O(log k) at most (often O(1) when it is smaller than the root and ignored), so n elements cost O(n log k). The space is O(k), which is the point: for a stream of billions of numbers and k = 100, the memory stays at 100 entries.

Alternatives:

- Sort the array and take the element at position k from the end: O(n log n) time, simple, requires all data in memory
- Quickselect: partition around a pivot and recurse into one side. Expected O(n) time, O(1) extra space, destroys or copies the array, not suitable for streams, worst case O(n squared) unless the pivot is randomised or median of medians is used
- Max heap of all n elements and k pops: O(n + k log n), needs O(n) space
- Counting or bucket approaches when values lie in a small range
- Order statistics tree: supports updates and arbitrary k queries in O(log n) each

When to choose the heap: the data arrives as a stream; k is much smaller than n; memory is limited; you must answer after each insertion. When k is close to n, use a max heap of size n − k + 1 for the smallest, or sort.

Variants:

- k-th smallest: use a max heap of size k
- Top k frequent elements: count frequencies and keep a min heap of size k over (count, value) pairs
- k closest points to the origin: a max heap keyed by distance of size k
- K-th largest element in a sorted matrix: a heap over row heads, popping k times
- Sliding window k-th largest needs two heaps or an ordered structure with deletions
- Distinct k-th largest: deduplicate before pushing

Implementation notes: in Python use `heapq` with a list, `heapq.heappushpop` (push then pop in one step) to handle the full heap case efficiently and `heapq.nlargest(k, data)` for a one-off answer; in Java use `PriorityQueue` with `offer` and `poll`; in JavaScript write a small heap. Tests: k equal to 1 (the maximum), k equal to n (the minimum), duplicates, negative numbers and fewer than k elements (the answer is undefined; decide whether to return null or raise an error).

Pitfalls: using a max heap of size n (wasting memory), using a min heap but comparing in the wrong direction, off-by-one in k (the k-th largest is the minimum of the top k), and not handling the initial fill when the stream has fewer than k elements.

## explain
1. Create an empty min heap.
2. For each number, push it while the heap has fewer than k elements.
3. When the heap is full, replace the root if the new number is larger than it.
4. After processing, read the root as the k-th largest.
5. For a stream, expose an add method that returns the root after every insertion.
6. Test k equal to 1, k equal to n and duplicates.

## example
The Python class `KthLargest` starts from `[4, 5, 8, 2]` with k = 3 and returns 4, 5, 5, 8, 8 after adding 3, 5, 10, 9 and 4. The JavaScript function finds the 4th largest of `[3, 2, 3, 1, 2, 4, 5, 5, 6]` with a min heap of size 4 and prints 4.

## real
Leaderboards keep the top scores, monitoring systems track the slowest requests and recommendation engines maintain the best candidates, all without storing the full stream.

## pros
- Constant memory in k for any stream length
- O(log k) per new element
- Works online as data arrives

## cons
- Slower than quickselect on a static array in practice
- Only the top k are kept, so other queries are impossible
- Changing k requires rebuilding the heap

## uses
- Answering the k-th largest after each insertion
- Finding the top k scores or items
- Monitoring the slowest or largest events
- Selecting candidates from large data streams

## mistakes
- Using a max heap of all elements and paying O(n) memory
- Confusing the min heap root with the maximum
- Forgetting to cap the heap size at k
- Not handling streams with fewer than k elements

## interview
**Q:** How do you find the k-th largest element in a stream?
**A:** Maintain a min heap of the k largest elements seen so far; if the heap is full and the new number exceeds the root, replace the root; the root is always the k-th largest.

**Q:** What are the time and space complexities of the heap approach?
**A:** O(n log k) time for n elements and O(k) space, compared with O(n log n) time for sorting.

**Q:** When would you prefer quickselect to a heap?
**A:** For a one-time query on an array in memory, because quickselect runs in expected O(n) time with O(1) extra space, while a heap is better for streams or repeated queries.

## summary
A min heap of size k holds the k largest elements seen, so its root is the k-th largest, giving O(n log k) time and O(k) space even for infinite streams. Quickselect and sorting are alternatives for static arrays.

## codenote
The Python sample is a streaming class. The JavaScript sample selects from an array with a heap of size k.

## code
### python
```python
import heapq

class KthLargest:
    def __init__(self, k, numbers):
        self.k = k
        self.heap = []
        for number in numbers:
            self.add(number)

    def add(self, number):
        if len(self.heap) < self.k:
            heapq.heappush(self.heap, number)
        elif number > self.heap[0]:
            heapq.heapreplace(self.heap, number)
        return self.heap[0]

stream = KthLargest(3, [4, 5, 8, 2])
print([stream.add(n) for n in (3, 5, 10, 9, 4)])
print(heapq.nlargest(4, [3, 2, 3, 1, 2, 4, 5, 5, 6])[-1])
```
Output:
```text
[4, 5, 5, 8, 8]
4
```
### javascript
```javascript
function kthLargest(numbers, k) {
  const heap = [];
  const push = (value) => {
    heap.push(value);
    for (let i = heap.length - 1; i > 0 && heap[(i - 1) >> 1] > heap[i]; i = (i - 1) >> 1) {
      [heap[i], heap[(i - 1) >> 1]] = [heap[(i - 1) >> 1], heap[i]];
    }
  };
  const replaceRoot = (value) => {
    heap[0] = value;
    let i = 0;
    for (;;) {
      let smallest = i;
      for (const c of [2 * i + 1, 2 * i + 2]) if (c < heap.length && heap[c] < heap[smallest]) smallest = c;
      if (smallest === i) break;
      [heap[i], heap[smallest]] = [heap[smallest], heap[i]];
      i = smallest;
    }
  };
  for (const number of numbers) {
    if (heap.length < k) push(number);
    else if (number > heap[0]) replaceRoot(number);
  }
  return heap[0];
}

console.log(kthLargest([3, 2, 3, 1, 2, 4, 5, 5, 6], 4), kthLargest([7, 6, 5], 1));
```
Output:
```text
4 7
```

## quiz
1. Which heap finds the k-th largest element of a stream?
   - [ ] A max heap of all elements
   - [x] A min heap of size k
   - [ ] A sorted array
   - [ ] A stack
   > The root of the min heap is the smallest of the k largest.
2. What is the memory used by the heap method?
   - [ ] O(n)
   - [x] O(k)
   - [ ] O(n squared)
   - [ ] O(1) always
   > Only the k largest elements are stored.
3. When is a new number added to a full heap?
   - [ ] Always
   - [x] When it is larger than the root
   - [ ] When it is smaller than the root
   - [ ] When it equals the root only
   > Then it displaces the smallest of the kept elements.
4. Which method is expected O(n) for a static array?
   - [ ] Sorting
   - [x] Quickselect
   - [ ] The min heap method
   - [ ] Binary search
   > It partitions and recurses into one side.

# Merge K Sorted Lists
kind: algorithm
time: O(N log k) for N total elements across k sorted lists, since each element is pushed and popped once and each heap operation costs O(log k).
space: O(k) for the heap holding one element from each list, plus the output.
practice: merge-two-sorted-arrays

## intro
Merging two sorted lists is a linear scan. Merging k sorted lists by repeated pairwise merging can cost O(N k), but a min heap that always holds the smallest unconsumed element of each list gives O(N log k). This is the pattern behind external sorting, the merge phase of database engines and combining sorted shards in distributed systems.

## theory
Heap based merge:

- Put the first element of each list in a min heap as a triple `(value, list index, position)`
- Repeat: pop the smallest triple, append its value to the output, and push the next element from the same list (if any)
- When the heap is empty, the output is the merged sorted sequence

The heap size never exceeds k, so each push and pop is O(log k), and each of the N elements goes through the heap once, giving O(N log k).

Example: merging `[1, 4, 5]`, `[1, 3, 4]` and `[2, 6]` gives `[1, 1, 2, 3, 4, 4, 5, 6]`. The heap starts with 1 (list 0), 1 (list 1) and 2 (list 2); popping the first 1 pushes 4; popping the second 1 pushes 3; popping 2 pushes 6; and so on.

Tie handling: the triple's second element (list index) breaks ties between equal values, so items are never compared by anything unorderable. It also makes the merge stable with respect to list order: among equal values, the earlier list wins.

Alternatives:

- Sequential pairwise merge (merge the first two, then merge the result with the third, ...): O(N k) because early elements are copied many times
- Divide and conquer merge (merge lists in pairs like a tournament): O(N log k) too, with O(N) temporary space and simple code, and it parallelises well
- Concatenate and sort: O(N log N), ignores the existing order, simpler for small inputs
- A tournament tree (loser tree): fewer comparisons per element than a heap, used in external sorting
- Library helpers: Python's `heapq.merge` (lazy, returns an iterator), Java's `PriorityQueue` with a comparator, and `std::priority_queue` in C++

Linked list version: the same algorithm with nodes instead of indices; push the head of each list into the heap keyed by value, pop the smallest node, append it to the output list and push its successor. The interview version "merge k sorted linked lists" relinks the existing nodes, using O(1) extra space beyond the heap.

External sorting: sort a file larger than memory by sorting chunks that fit in memory into sorted runs on disk, then merging all runs with a k-way merge using a heap and one buffer per run. The number of passes is log_k(number of runs), so a larger k (limited by memory buffers) reduces passes.

Applications:

- Combining sorted partitions or shards (search engines merge posting lists from shards, databases merge sorted index scans)
- Merging log files from several machines by timestamp
- K-way merge in LSM tree compaction
- Finding the smallest range covering at least one element from each list (push the heap minimum and track the current maximum)
- Smallest k pairs from two sorted arrays and k-th smallest in a sorted matrix, which use the same heap of frontier elements

Complexity detail: comparisons per element are about log2 k for a heap; a tournament tree reduces the constant. With k = 2 the heap is overkill and a simple two pointer merge is preferred.

Pitfalls: pushing all elements of every list at the start (O(N) heap space and O(N log N) time), forgetting to advance within the list that supplied the popped element, and comparing nodes or lists directly when values are equal.

Testing: empty input, lists of different lengths, empty lists inside the input, duplicate values across lists and a single list.

## explain
1. Push the first element of each non-empty list into a min heap with its list and position.
2. Pop the smallest entry and append its value to the output.
3. If its list has another element, push that element.
4. Repeat until the heap is empty.
5. Use the list index as a tie breaker.
6. Test empty lists, unequal lengths and duplicates.

## example
The Python function merges `[1, 4, 5]`, `[1, 3, 4]` and `[2, 6]` into `[1, 1, 2, 3, 4, 4, 5, 6]` and checks the result against `sorted` of the concatenation on 100 seeded random inputs. The JavaScript function merges the lists `[2, 5, 9]`, `[1, 6]` and `[3, 4, 7, 8]` with a simple array based heap and counts how many elements the heap held at most.

## real
Search engines merge sorted posting lists from shards, databases merge sorted runs when sorting data larger than memory, and log aggregators merge streams by timestamp.

## pros
- O(N log k) instead of O(N k) for repeated pairwise merging
- The heap holds only k elements
- Works lazily for streams and external files

## cons
- Heap overhead is wasted when k is small
- Needs care with ties and empty lists
- A tournament or divide and conquer approach can have smaller constants

## uses
- Merging k sorted arrays or linked lists
- External sorting of large files
- Combining sorted shards and logs
- Finding the smallest range covering all lists

## mistakes
- Pushing every element at the start instead of one per list
- Forgetting to push the successor of the popped element
- Comparing lists or nodes when values tie
- Using repeated pairwise merging and paying O(N k)

## interview
**Q:** How do you merge k sorted lists efficiently?
**A:** Keep a min heap with the current front element of each list; pop the smallest, add it to the output and push the next element of the same list, giving O(N log k) time for N total elements.

**Q:** Why is repeated pairwise merging slower?
**A:** The merged prefix is copied again at every step, so elements from early lists are processed up to k times, giving O(N k) time.

**Q:** How is this used for sorting files larger than memory?
**A:** Sort chunks that fit in memory into runs on disk, then k-way merge the runs with a heap and one input buffer per run, so the number of passes is logarithmic in the number of runs.

## summary
A min heap holding one candidate per list merges k sorted lists in O(N log k) time and O(k) extra space. It underlies external sorting and merging sorted shards.

## codenote
The Python sample merges lists and verifies the result. The JavaScript sample tracks the heap size.

## code
### python
```python
import heapq
import random

def merge_k(lists):
    heap = [(values[0], i, 0) for i, values in enumerate(lists) if values]
    heapq.heapify(heap)
    merged = []
    while heap:
        value, i, position = heapq.heappop(heap)
        merged.append(value)
        if position + 1 < len(lists[i]):
            heapq.heappush(heap, (lists[i][position + 1], i, position + 1))
    return merged

print(merge_k([[1, 4, 5], [1, 3, 4], [2, 6]]))
rng = random.Random(2)
ok = True
for _ in range(100):
    lists = [sorted(rng.randint(0, 20) for _ in range(rng.randint(0, 6))) for _ in range(rng.randint(0, 5))]
    ok = ok and merge_k(lists) == sorted(x for values in lists for x in values)
print(ok)
```
Output:
```text
[1, 1, 2, 3, 4, 4, 5, 6]
True
```
### javascript
```javascript
function mergeK(lists) {
  const heap = [];
  let largest = 0;
  const less = (a, b) => a[0] < b[0] || (a[0] === b[0] && a[1] < b[1]);
  const push = (entry) => {
    heap.push(entry);
    for (let i = heap.length - 1; i > 0 && less(heap[i], heap[(i - 1) >> 1]); i = (i - 1) >> 1) {
      [heap[i], heap[(i - 1) >> 1]] = [heap[(i - 1) >> 1], heap[i]];
    }
    largest = Math.max(largest, heap.length);
  };
  const pop = () => {
    const top = heap[0];
    const last = heap.pop();
    if (heap.length) {
      heap[0] = last;
      let i = 0;
      for (;;) {
        let s = i;
        for (const c of [2 * i + 1, 2 * i + 2]) if (c < heap.length && less(heap[c], heap[s])) s = c;
        if (s === i) break;
        [heap[i], heap[s]] = [heap[s], heap[i]];
        i = s;
      }
    }
    return top;
  };
  lists.forEach((list, i) => list.length && push([list[0], i, 0]));
  const merged = [];
  while (heap.length) {
    const [value, i, position] = pop();
    merged.push(value);
    if (position + 1 < lists[i].length) push([lists[i][position + 1], i, position + 1]);
  }
  return [merged, largest];
}

const [merged, largest] = mergeK([[2, 5, 9], [1, 6], [3, 4, 7, 8]]);
console.log(merged.join(" "), largest);
```
Output:
```text
1 2 3 4 5 6 7 8 9 3
```

## quiz
1. What does the heap contain during a k-way merge?
   - [ ] All elements of all lists
   - [x] The current front element of each list
   - [ ] Only the largest elements
   - [ ] The output
   > Its size never exceeds k.
2. What is the time complexity of merging k sorted lists with N elements in total?
   - [ ] O(N k)
   - [x] O(N log k)
   - [ ] O(N squared)
   - [ ] O(k log N)
   > Each element passes through a heap of size k.
3. Why store the list index in the heap entry?
   - [ ] To save memory
   - [x] To know which list to advance and to break ties between equal values
   - [ ] To reverse the order
   - [ ] To avoid the heap
   > The next element comes from the same list.
4. Why is repeated pairwise merging slower?
   - [ ] It uses recursion
   - [x] Early elements are copied again at every merge step
   - [ ] It needs sorting
   - [ ] It uses a heap
   > The cost grows to O(N k).

# Dijkstra with Priority Queue
kind: algorithm
time: O((V + E) log V) with a binary heap and lazy deletion for a graph with V vertices and E edges, since each edge can push one entry and each heap operation costs O(log of the heap size).
space: O(V + E) for the graph and the heap, which can hold up to E entries with lazy deletion.
viz: dijkstra
practice: dijkstra-shortest-path

## intro
Dijkstra's algorithm finds the shortest paths from one source to every other vertex in a graph with non-negative edge weights. It repeatedly picks the unvisited vertex with the smallest known distance and relaxes its outgoing edges. The step "pick the vertex with the smallest distance" is exactly what a priority queue does well, and the choice of queue decides the running time.

## theory
Algorithm:

- Set `dist[source] = 0` and every other distance to infinity; put `(0, source)` in a min priority queue
- While the queue is not empty: pop the entry with the smallest distance `(d, u)`; if `d` is larger than `dist[u]`, the entry is stale, so skip it
- For each edge `(u, v, w)`: if `dist[u] + w < dist[v]`, set `dist[v] = dist[u] + w`, record `u` as the predecessor of `v` and push `(dist[v], v)`

When a vertex is popped with its current best distance, that distance is final, because every other path to it would have to go through a vertex with an equal or larger distance and non-negative weights cannot make it smaller. This greedy invariant fails with negative weights, where Bellman-Ford is required.

Lazy deletion: standard heaps cannot decrease a key in place, so the algorithm pushes a new entry whenever a distance improves and ignores older entries when they are popped (the stale check). The heap may hold up to E entries, so each operation costs O(log E) = O(log V) since E is at most V squared. Total time O(E log V) which is O((V + E) log V) when V terms are included.

Example graph: edges A-B 4, A-C 2, C-B 1, B-D 5, C-D 8, D-E 3 (undirected). From A the distances are A 0, C 2, B 3 (via C, shorter than the direct 4), D 8 (via B, since 3 + 5 beats 2 + 8) and E 11. The path to E is A → C → B → D → E.

Choice of queue and the resulting time:

- Unsorted array: O(V squared), good for dense graphs where E is about V squared
- Binary heap: O((V + E) log V), the usual choice for sparse graphs
- Fibonacci heap: O(E + V log V), the best known bound in theory but rarely used because of constants
- Bucket queue (Dial's algorithm) for small integer weights: O(E + V · maxWeight)
- Indexed heap with decrease-key: avoids stale entries, with heap size at most V

Early termination: when only the distance to a single target is needed, stop when the target is popped, which can save a lot of work; A* adds a heuristic to guide the search toward the target, and bidirectional search runs from both ends.

Path reconstruction: store the predecessor of each vertex when its distance improves, then follow predecessors from the target back to the source and reverse the list.

Variations and relatives:

- Prim's algorithm for minimum spanning trees has the same structure but keys vertices by the weight of the connecting edge instead of the path length
- Shortest paths on grids with different cell costs use the same code with neighbours as edges
- Multi-source Dijkstra: push all sources with distance 0
- Constrained paths (at most k stops): extend the state to (vertex, stops)
- Maximum probability path: multiply probabilities and use a max heap, or take negative logarithms

Pitfalls: negative edges (wrong answers, use Bellman-Ford), forgetting the stale entry check (still correct but slower, and may relax from outdated distances), using a visited set incorrectly, integer overflow for infinity plus weight, and comparing tuples with unorderable payloads (use numbers as vertex ids).

Testing: unreachable vertices stay at infinity, zero weight edges, parallel edges (keep the smaller), the source equal to the target and graphs with ties.

## explain
1. Initialise all distances to infinity except the source, which is zero, and push the source.
2. Pop the smallest entry and skip it if it is stale.
3. For each outgoing edge, compute the new distance through this vertex.
4. If it improves the known distance, update it, record the predecessor and push the new entry.
5. Continue until the queue is empty or the target is popped.
6. Reconstruct the path from the predecessors.

## example
The Python function computes the distances A 0, B 3, C 2, D 8 and E 11 for the sample graph and rebuilds the path A, C, B, D, E. The JavaScript function runs the same graph and counts the heap pushes and the stale pops, showing that lazy deletion discards a few outdated entries.

## real
Navigation software uses Dijkstra's algorithm and its refinements for routing, network protocols such as OSPF compute shortest paths with it, and games use it for movement costs on maps.

## pros
- Efficient for sparse graphs with a binary heap
- Simple greedy structure
- Easy to reconstruct paths and stop early

## cons
- Does not work with negative edge weights
- Lazy deletion can leave many stale entries
- Needs a priority queue implementation or library

## uses
- Shortest paths in road and network graphs
- Routing protocols
- Weighted grid path finding
- The basis of A* search and Prim's algorithm

## mistakes
- Running it on graphs with negative edges
- Forgetting the stale entry check after popping
- Updating a distance without pushing the new entry
- Reconstructing the path without storing predecessors

## interview
**Q:** What is the time complexity of Dijkstra's algorithm with a binary heap?
**A:** O((V + E) log V), because every edge relaxation may push one heap entry and every heap operation costs logarithmic time.

**Q:** Why does Dijkstra's algorithm fail with negative edge weights?
**A:** It assumes that once a vertex is popped its distance is final, but a later negative edge could create a shorter path to it, so the greedy choice is no longer safe.

**Q:** How do you handle a decrease of a distance in a heap that has no decrease-key?
**A:** Push a new entry with the smaller distance and skip older entries when they are popped, because their stored distance is larger than the current best.

## summary
Dijkstra's algorithm uses a min priority queue to repeatedly settle the closest unsettled vertex and relax its edges, running in O((V + E) log V) with a binary heap and lazy deletion. It requires non-negative weights and is the base for A* and Prim's algorithm.

## codenote
The Python sample computes distances and the path. The JavaScript sample counts pushes and stale pops.

## code
### python
```python
import heapq

graph = {
    "A": [("B", 4), ("C", 2)],
    "B": [("A", 4), ("C", 1), ("D", 5)],
    "C": [("A", 2), ("B", 1), ("D", 8)],
    "D": [("B", 5), ("C", 8), ("E", 3)],
    "E": [("D", 3)],
}

def dijkstra(source):
    dist = {node: float("inf") for node in graph}
    previous = {}
    dist[source] = 0
    queue = [(0, source)]
    while queue:
        d, u = heapq.heappop(queue)
        if d > dist[u]:
            continue
        for v, weight in graph[u]:
            if d + weight < dist[v]:
                dist[v] = d + weight
                previous[v] = u
                heapq.heappush(queue, (dist[v], v))
    return dist, previous

dist, previous = dijkstra("A")
path, node = ["E"], "E"
while node in previous:
    node = previous[node]
    path.append(node)
print(dist)
print(path[::-1])
```
Output:
```text
{'A': 0, 'B': 3, 'C': 2, 'D': 8, 'E': 11}
['A', 'C', 'B', 'D', 'E']
```
### javascript
```javascript
const graph = {
  A: [["B", 4], ["C", 2]],
  B: [["A", 4], ["C", 1], ["D", 5]],
  C: [["A", 2], ["B", 1], ["D", 8]],
  D: [["B", 5], ["C", 8], ["E", 3]],
  E: [["D", 3]],
};

function run(source) {
  const dist = Object.fromEntries(Object.keys(graph).map((k) => [k, Infinity]));
  dist[source] = 0;
  let queue = [[0, source]];
  let pushes = 1;
  let stale = 0;
  while (queue.length) {
    queue.sort((a, b) => a[0] - b[0]);
    const [d, u] = queue.shift();
    if (d > dist[u]) {
      stale++;
      continue;
    }
    for (const [v, w] of graph[u]) {
      if (d + w < dist[v]) {
        dist[v] = d + w;
        queue.push([dist[v], v]);
        pushes++;
      }
    }
  }
  return [dist, pushes, stale];
}

const [dist, pushes, stale] = run("A");
console.log(Object.entries(dist).map(([k, v]) => k + "=" + v).join(" "), pushes, stale);
```
Output:
```text
A=0 B=3 C=2 D=8 E=11 7 2
```

## quiz
1. Which vertex does Dijkstra's algorithm settle next?
   - [ ] The one with the largest distance
   - [x] The unsettled vertex with the smallest known distance
   - [ ] A random vertex
   - [ ] The one with the most edges
   > The priority queue returns it.
2. What is the time with a binary heap and lazy deletion?
   - [ ] O(V squared)
   - [x] O((V + E) log V)
   - [ ] O(V + E)
   - [ ] O(E squared)
   > Each relaxation can push one logarithmic cost entry.
3. What happens to an outdated heap entry?
   - [ ] It is processed again
   - [x] It is skipped because its distance exceeds the current best
   - [ ] It is moved to the front
   - [ ] It deletes the vertex
   > This is the stale entry check.
4. Why does the algorithm require non-negative weights?
   - [ ] To make the heap smaller
   - [x] A settled vertex's distance would not be final if later edges could reduce it
   - [ ] Because graphs must be dense
   - [ ] To avoid recursion
   > Negative edges break the greedy invariant.

# Median from Data Stream
kind: algorithm
time: O(log n) per insertion with two heaps and O(1) to read the median, compared with O(n) per insertion for a sorted list and O(n log n) to recompute from scratch.
space: O(n) because every element seen so far is kept in one of the two heaps.

## intro
How do you keep track of the median of numbers that keep arriving? Sorting after every insertion is far too slow. Two heaps solve it elegantly: a max heap holds the smaller half of the numbers and a min heap holds the larger half, so the median sits at the tops of the heaps and can be read instantly.

## theory
Two heap structure:

- `low`: a max heap with the smaller half of the numbers; its top is the largest of the small numbers
- `high`: a min heap with the larger half; its top is the smallest of the large numbers
- Invariants: every element of `low` is at most every element of `high`, and the sizes differ by at most one (`low` may have one extra element)

Insertion of a number x:

- Push x into `low` (as a max heap), then move the largest element of `low` into `high`; this guarantees the ordering invariant
- If `high` now has more elements than `low`, move the smallest of `high` back into `low`
- This costs a constant number of heap operations, so O(log n)

Median:

- If the sizes are equal (an even count), the median is the average of the two tops
- Otherwise `low` has one extra element and its top is the median

Example: the stream 5, 15, 1, 3 gives medians 5 (one number), 10 (average of 5 and 15), 5 (the middle of 1, 5, 15) and 4 (the average of 3 and 5, from 1, 3, 5, 15). The stream 2, 3, 4 gives 2, 2.5 and 3.

Why it works: the median splits the sorted data into two halves, and the two heaps maintain exactly that split with fast access to the boundary elements. Neither heap is sorted internally, and that is enough since only the boundary matters.

Complexity: each insertion costs a few heap operations, O(log n); the median query is O(1). Space is O(n). A sorted array with binary search insertion needs O(n) to shift elements; a balanced tree with order statistics has the same O(log n) but more complexity.

Variants:

- Sliding window median: needs removal of arbitrary elements, handled by lazy deletion with counters or an ordered multiset
- Median with only bounded memory (approximate): use quantile sketches such as t-digest or the P-squared algorithm
- Other quantiles: use two heaps with sizes in a ratio (for the 90th percentile, keep 90 percent of the numbers in the lower heap)
- Running mean and median together, or the median of a fixed range of values using counting arrays (when values are small integers, a count array gives the median in O(range))
- Median of two sorted arrays (a different binary search problem)
- Minimising the sum of absolute deviations: the median is the optimal point, used in facility location on a line

Applications: monitoring dashboards that report median latency, financial tick data, robust statistics in sensor streams and online algorithms that need medians as thresholds.

Implementation notes: Python's `heapq` has only a min heap, so store negated values in `low`; Java's `PriorityQueue` with `Collections.reverseOrder()` for the max heap; keep the balance step after every insertion; use floating point or doubles for averages of even counts (integers divided by two give .5 values).

Pitfalls: forgetting to rebalance, violating the ordering invariant by pushing directly into the wrong heap, using integer division for the average, and querying the median of an empty structure.

Testing: compare with sorting the prefix and taking the middle for every prefix of random streams, including duplicates and negative numbers.

## explain
1. Keep a max heap for the smaller half and a min heap for the larger half.
2. Insert a number into the max heap, then move the max heap's top into the min heap.
3. If the min heap is larger than the max heap, move its top back.
4. Read the median from the tops: one top if the sizes differ, the average if equal.
5. Verify the ordering invariant and the size difference.
6. Compare against sorting each prefix in tests.

## example
The Python class prints the running medians 5, 10, 5, 4 for the stream 5, 15, 1, 3 and checks 200 random streams against sorting the prefix: True. The JavaScript program uses simple sorted halves to show the medians 2, 2.5 and 3 for the stream 2, 3, 4.

## real
Monitoring systems report median response times, trading platforms track median prices and sensors filter noise using running medians.

## pros
- O(log n) updates and O(1) median reads
- Simple invariants with two standard heaps
- Extends to other quantiles

## cons
- Stores every element, so memory grows with the stream
- Sliding windows need deletions, which heaps do not support directly
- Rebalancing logic is easy to get wrong

## uses
- Running median of a data stream
- Percentile tracking in monitoring
- Robust filtering of noisy signals
- Teaching the two heap technique

## mistakes
- Forgetting to rebalance after an insertion
- Pushing a number into the wrong heap and breaking the ordering invariant
- Using integer division for the average of two middle values
- Reading the median before any number has arrived

## interview
**Q:** How do you maintain the median of a data stream?
**A:** Keep the smaller half in a max heap and the larger half in a min heap with sizes differing by at most one; insert through the max heap, rebalance, and read the median from the tops.

**Q:** What are the costs of the two heap approach?
**A:** O(log n) per insertion, O(1) to read the median and O(n) space.

**Q:** How can this approach be adapted to a different percentile?
**A:** Keep the heap sizes in the corresponding ratio, such as 90 percent of the numbers in the lower max heap for the 90th percentile.

## summary
Two heaps, a max heap for the lower half and a min heap for the upper half, track the median of a stream with O(log n) inserts and O(1) reads. Keep the halves ordered and balanced after every insertion.

## codenote
The Python sample implements the two heap structure and verifies it. The JavaScript sample uses sorted halves.

## code
### python
```python
import heapq
import random

class MedianTracker:
    def __init__(self):
        self.low, self.high = [], []

    def add(self, number):
        heapq.heappush(self.low, -number)
        heapq.heappush(self.high, -heapq.heappop(self.low))
        if len(self.high) > len(self.low):
            heapq.heappush(self.low, -heapq.heappop(self.high))

    def median(self):
        if len(self.low) > len(self.high):
            return -self.low[0]
        return (-self.low[0] + self.high[0]) / 2

tracker = MedianTracker()
medians = []
for number in (5, 15, 1, 3):
    tracker.add(number)
    medians.append(tracker.median())
print(medians)

rng = random.Random(6)
ok = True
for _ in range(200):
    stream = [rng.randint(-50, 50) for _ in range(rng.randint(1, 25))]
    tracker, seen = MedianTracker(), []
    for number in stream:
        tracker.add(number)
        seen.append(number)
        ordered = sorted(seen)
        middle = len(ordered) // 2
        expected = ordered[middle] if len(ordered) % 2 else (ordered[middle - 1] + ordered[middle]) / 2
        ok = ok and tracker.median() == expected
print(ok)
```
Output:
```text
[5, 10.0, 5, 4.0]
True
```
### javascript
```javascript
function runningMedians(stream) {
  const low = [];
  const high = [];
  const out = [];
  for (const x of stream) {
    low.push(x);
    low.sort((a, b) => a - b);
    high.push(low.pop());
    high.sort((a, b) => a - b);
    if (high.length > low.length) low.push(high.shift());
    out.push(low.length > high.length ? low[low.length - 1] : (low[low.length - 1] + high[0]) / 2);
  }
  return out;
}

console.log(runningMedians([2, 3, 4]).join(" "), "|", runningMedians([7, 1, 9, 5]).join(" "));
```
Output:
```text
2 2.5 3 | 7 4 7 6
```

## quiz
1. What does the max heap hold in the two heap median method?
   - [ ] The larger half of the numbers
   - [x] The smaller half of the numbers
   - [ ] All numbers sorted
   - [ ] Only duplicates
   > Its top is the largest of the small numbers.
2. How is the median read when both heaps have the same size?
   - [ ] From the max heap top only
   - [x] As the average of the two tops
   - [ ] From the min heap top only
   - [ ] By sorting
   > The two middle values straddle the boundary.
3. What is the cost of each insertion?
   - [ ] O(n)
   - [x] O(log n)
   - [ ] O(1)
   - [ ] O(n log n)
   > A constant number of heap operations.
4. What size relation must the heaps keep?
   - [ ] Equal heights
   - [x] Sizes differing by at most one
   - [ ] The max heap twice as large
   - [ ] No relation
   > The median must lie at the boundary.

# Indexed Priority Queue
kind: algorithm
time: O(log n) for insert, delete, decrease-key and increase-key, O(1) to peek or to look up an item's position, and O(log n) to extract the minimum.
space: O(n) for the heap array plus an index map from each key to its position, using O(n) extra memory.

## intro
A plain heap can return the smallest item but cannot find or update an arbitrary item without scanning. An indexed priority queue adds a map from each item's id to its position in the heap, so the priority of any item can be decreased, increased or removed in O(log n). That capability is what algorithms such as Dijkstra's, Prim's and event schedulers need.

## theory
Structure: a heap array of items ordered by priority, and a position table `pos[id]` giving the index of each id in the heap (or −1 if absent). Every swap of two heap entries also swaps their entries in `pos`, so the table always stays consistent. The ids are usually integers from 0 to n − 1 (vertices, task numbers), which allows `pos` to be a plain array.

Operations:

- insert(id, priority): append at the end, record its position, sift up
- peek_min(): the id at index 0
- extract_min(): swap the root with the last entry, remove the last, set the removed id's position to −1, sift down the new root
- decrease_key(id, new priority): look up `pos[id]`, update the priority, sift up
- increase_key(id, new priority): update and sift down
- remove(id): swap with the last entry, remove it, then sift the moved entry up or down, depending on how it compares with its new neighbours
- contains(id): `pos[id] != −1`

All operations except lookup cost O(log n) because they move an entry along one path.

Why not just use a standard heap? Two common approaches without an index:

- Lazy deletion: push a new entry each time a priority changes and skip the stale entries when they are popped. Simple, but the heap can grow to hold every update (up to E entries in Dijkstra) and stale entries cost extra pops.
- Linear scan to find the item: O(n) per update, too slow.

The indexed version keeps the heap size at most n (one entry per id), which helps cache behaviour and memory for dense graphs, and gives a clean decrease-key. In Dijkstra's algorithm the number of heap operations is V extractions plus up to E decrease-keys, each O(log V), which is O((V + E) log V) with a smaller heap than the lazy version.

Comparison counts: for Dijkstra on the graph with edges A-B 4, A-C 2, C-B 1, B-D 5, C-D 8 and D-E 3, lazy deletion pushes the vertex B twice (distance 4 first, then 3), leaving one stale entry, while the indexed queue performs a decrease-key of B from 4 to 3 and never holds two entries for B.

Variants:

- Fibonacci heaps give O(1) amortised decrease-key but have large constants
- Pairing heaps are simpler and fast in practice
- Dictionary based positions for ids that are not small integers (hash map from id to index)
- Two-level structures: a sorted structure keyed by (priority, id) in a balanced tree, which also supports decrease-key by removal and reinsertion, at O(log n) with larger constants
- Indexed max priority queues for top-k problems with updates

Applications: Dijkstra's and Prim's algorithms with decrease-key, schedulers where tasks change priority or can be cancelled, game AI open sets in A*, order books where orders are modified or cancelled by id, rate limiters and timers (cancelling a timer is a remove).

Pitfalls:

- Forgetting to update `pos` in every swap (the most common bug)
- Not resetting `pos` for removed items
- Calling decrease-key with a larger priority (use increase-key or a general update that sifts both ways)
- Sifting only one direction after remove, when the replacement may need to move up
- Ids that are not within the table range

Testing: after each operation verify the heap order, check that `pos[heap[i].id] == i` for all i, and compare against a brute-force minimum search on random operations.

## explain
1. Keep a heap array and a position table from id to index.
2. Write one swap function that exchanges two entries and updates both positions.
3. Insert by appending, recording the position and sifting up.
4. For decrease-key, look up the position, change the priority and sift up.
5. For extract-min, swap with the last entry, remove it, clear its position and sift down.
6. Check the heap order and the position table after every test operation.

## example
The Python class implements an indexed min queue, runs decrease-key on a small set of tasks and prints the extraction order after priorities change: the item with the improved priority comes out first. The JavaScript program counts the heap entries created by lazy deletion (7) versus an indexed approach (5) in Dijkstra's algorithm on the sample graph.

## real
Routing software, A* path finders and event schedulers use indexed or addressable queues to change priorities efficiently, and standard libraries for graph algorithms include them.

## pros
- Efficient decrease-key and remove by id
- The heap holds at most one entry per id
- Avoids stale entries in shortest path algorithms

## cons
- Extra position table to maintain
- More code and more room for bugs than a plain heap
- Ids must be indexable

## uses
- Dijkstra's and Prim's algorithms with decrease-key
- A* open sets
- Cancelable timers and tasks
- Order books with modify and cancel operations

## mistakes
- Updating the heap array in a swap but not the position table
- Forgetting to clear the position of an extracted item
- Using decrease-key to raise a priority without sifting down
- Sifting in only one direction after a removal

## interview
**Q:** What does an indexed priority queue add to a binary heap?
**A:** A table from each item's id to its position in the heap, so the priority of any item can be changed or the item removed in O(log n) by sifting from its known position.

**Q:** Why is decrease-key useful in Dijkstra's algorithm?
**A:** It lets the queue hold one entry per vertex and update it when a shorter path is found, instead of pushing duplicate entries that must be skipped later.

**Q:** What is the most common bug in an indexed heap?
**A:** Swapping heap entries without updating the position table, which makes later lookups point to the wrong place.

## summary
An indexed priority queue pairs a heap with a position table so that any id can be updated or removed in O(log n). It keeps the queue small in shortest path algorithms and supports cancellable tasks.

## codenote
The Python sample implements the indexed queue. The JavaScript sample compares entry counts for lazy and indexed approaches.

## code
### python
```python
class IndexedMinQueue:
    def __init__(self, size):
        self.heap = []
        self.priority = [None] * size
        self.pos = [-1] * size

    def _swap(self, i, j):
        self.heap[i], self.heap[j] = self.heap[j], self.heap[i]
        self.pos[self.heap[i]], self.pos[self.heap[j]] = i, j

    def _up(self, i):
        while i and self.priority[self.heap[(i - 1) // 2]] > self.priority[self.heap[i]]:
            self._swap(i, (i - 1) // 2)
            i = (i - 1) // 2

    def _down(self, i):
        while True:
            smallest = i
            for c in (2 * i + 1, 2 * i + 2):
                if c < len(self.heap) and self.priority[self.heap[c]] < self.priority[self.heap[smallest]]:
                    smallest = c
            if smallest == i:
                return
            self._swap(i, smallest)
            i = smallest

    def insert(self, ident, priority):
        self.priority[ident] = priority
        self.heap.append(ident)
        self.pos[ident] = len(self.heap) - 1
        self._up(self.pos[ident])

    def decrease_key(self, ident, priority):
        self.priority[ident] = priority
        self._up(self.pos[ident])

    def extract_min(self):
        top = self.heap[0]
        self._swap(0, len(self.heap) - 1)
        self.heap.pop()
        self.pos[top] = -1
        self._down(0)
        return top

queue = IndexedMinQueue(5)
for ident, priority in enumerate((50, 30, 40, 20, 60)):
    queue.insert(ident, priority)
queue.decrease_key(4, 10)
queue.decrease_key(2, 25)
print([queue.extract_min() for _ in range(5)])
```
Output:
```text
[4, 3, 2, 1, 0]
```
### javascript
```javascript
const graph = {
  A: [["B", 4], ["C", 2]],
  B: [["A", 4], ["C", 1], ["D", 5]],
  C: [["A", 2], ["B", 1], ["D", 8]],
  D: [["B", 5], ["C", 8], ["E", 3]],
  E: [["D", 3]],
};

function entries(indexed) {
  const dist = Object.fromEntries(Object.keys(graph).map((k) => [k, Infinity]));
  dist.A = 0;
  const queue = new Map([["A", 0]]);
  let created = 1;
  const stale = [];
  const settled = new Set();
  while (queue.size || stale.length) {
    if (!queue.size) break;
    const [u, d] = [...queue].sort((a, b) => a[1] - b[1])[0];
    queue.delete(u);
    settled.add(u);
    for (const [v, w] of graph[u]) {
      if (settled.has(v) || d + w >= dist[v]) continue;
      if (queue.has(v) && !indexed) stale.push(v);
      if (!queue.has(v) || !indexed) created++;
      dist[v] = d + w;
      queue.set(v, dist[v]);
    }
  }
  return created;
}

console.log(entries(false), entries(true));
```
Output:
```text
7 5
```

## quiz
1. What does the position table store?
   - [ ] The priorities
   - [x] The index of each id inside the heap array
   - [ ] The heights of nodes
   - [ ] The list of children
   > It allows constant time lookups of an id's position.
2. What does decrease-key do after changing the priority?
   - [ ] Sifts the entry down
   - [x] Sifts the entry up from its known position
   - [ ] Rebuilds the heap
   - [ ] Deletes the entry
   > A smaller priority can only violate the order with parents.
3. What is the most common bug in an indexed heap?
   - [ ] Using too many ids
   - [x] Swapping entries without updating the position table
   - [ ] Calling peek twice
   - [ ] Using a min heap
   > The table would then point to the wrong places.
4. What advantage does an indexed queue have in Dijkstra's algorithm?
   - [ ] It allows negative edges
   - [x] It holds at most one entry per vertex and avoids stale entries
   - [ ] It removes the need for relaxation
   - [ ] It sorts the graph
   > Distances are updated in place instead of pushed again.

# Heap Interview Patterns
kind: concept
time: Not an algorithmic topic — this lesson reviews patterns. Heap solutions typically cost O(n log k) or O(n log n) because each element enters and leaves a heap of size k or n at logarithmic cost.
space: Not an algorithmic topic — a bounded heap of size k uses O(k) memory, while heaps over all elements use O(n), which interviewers expect you to state.

## intro
Heap problems in interviews almost always reduce to one of a few shapes: keep the best k items, repeatedly take the best of several candidates, schedule by priority or maintain a boundary like the median. Spotting the shape tells you the heap type, its size and the complexity before you write any code.

## theory
Pattern 1: top k. Keep a heap of size k and compare each new item with its root.

- k largest or k-th largest: min heap of size k
- k smallest or k-th smallest: max heap of size k
- Top k frequent elements: count first, then keep a min heap of size k over (count, value)
- k closest points to the origin: max heap of size k keyed by squared distance. For the points (1, 3), (−2, 2), (5, 8) and (0, 1) the two closest are (0, 1) and (−2, 2).
- Cost: O(n log k) time and O(k) space, better than sorting when k is much smaller than n

Pattern 2: merge sorted sources. A heap of the current front item of each source: merge k sorted lists, smallest range covering k lists, k-th smallest in a sorted matrix, smallest pairs from two sorted arrays.

Pattern 3: repeatedly combine the extremes (greedy with a heap). Take the two smallest or largest items, combine them and push the result back: connect ropes with minimum cost (combine the two shortest ropes each time; for lengths 4, 3, 2 and 6 the cost is 29), last stone weight, Huffman coding, minimum cost to merge files, reorganising a string so that no two neighbours are equal (take the most frequent letter each time), and task scheduling with cooldown.

Pattern 4: scheduling and simulation. Events ordered by time or priority: meeting rooms (a min heap of end times; the heap size at the end is the number of rooms needed), CPU task scheduling by arrival and duration, process the next event while adding new events, k-th closest events, and bandwidth allocation.

Pattern 5: two heaps for the median. A max heap for the lower half and a min heap for the upper half supports running medians, sliding window medians (with lazy deletion) and IPO-style problems (maximise capital: one heap by cost to unlock projects and another by profit to choose).

Pattern 6: shortest paths and spanning trees. Dijkstra's and Prim's algorithms use a min heap of frontier edges or vertices; A* orders by distance plus heuristic; the problems "network delay time" and "cheapest flights within k stops" use the same pattern with small variations.

Pattern 7: custom ordering and lazy deletion. Heaps over tuples with tie breakers; removing arbitrary items by marking them deleted and discarding them when they reach the top; delayed updates of priorities.

Choosing the heap:

- Need the largest next: max heap; smallest next: min heap
- Need the k best of n with k small: bounded heap of size k
- Need a sorted order of everything: sorting is simpler unless you need only a prefix
- Need to remove arbitrary items or change priorities: indexed heap or lazy deletion
- Need both extremes: two heaps, or a balanced tree, or a double-ended priority queue

Language notes: Python's `heapq` is a min heap (negate for max, add counters for ties, use `heapq.nlargest` or `nsmallest` for quick top k), Java's `PriorityQueue` takes a comparator, C++'s `priority_queue` is a max heap, and JavaScript needs a hand-written heap.

Complexity talk: n pushes cost O(n log n); heapify costs O(n); a bounded heap costs O(n log k); extracting k items costs O(k log n). Always say what the heap holds at any time, because that decides the space.

Common traps: using a max heap for k largest (it needs all n elements), forgetting to negate values back, comparing tuples with non-comparable payloads on ties, and recomputing a heap for each query when a single bounded heap would do.

Testing: k equal to 1 and to n, duplicates, negative numbers, empty input and ties.

## explain
1. Identify the pattern: top k, merge, combine extremes, scheduling or median.
2. Decide the heap type and what it holds at each step.
3. Decide how ties are broken and what the elements look like (tuples with counters).
4. Write the loop with pushes and pops, bounding the heap size if the pattern allows.
5. State the time and the space of the solution.
6. Test with small k, duplicates and empty input.

## example
The Python solution finds the two closest points to the origin among `(1, 3)`, `(-2, 2)`, `(5, 8)` and `(0, 1)` with a bounded max heap and counts the meeting rooms needed for the intervals `(0, 30)`, `(5, 10)`, `(15, 20)` with a heap of end times. The JavaScript solution connects the ropes 4, 3, 2 and 6 with minimum cost 29.

## real
Search ranking keeps the top results, schedulers pick the next job, compression builds Huffman trees and monitoring systems track the largest values, all with these heap patterns.

## pros
- A few patterns cover most heap questions
- The heap size and complexity follow directly from the pattern
- Library heaps make the solutions short

## cons
- Easy to pick the wrong heap type
- Tie handling and negation tricks cause bugs
- Language libraries differ in defaults

## uses
- Preparing for heap related interview questions
- Selecting the top items from large inputs
- Scheduling and simulation tasks
- Merging sorted data from several sources

## mistakes
- Using a max heap for the k largest and storing all elements
- Forgetting to restore the sign after negating values
- Comparing unorderable payloads when priorities tie
- Sorting everything when only a bounded heap is needed

## interview
**Q:** How do you find the k closest points to the origin?
**A:** Keep a max heap of size k keyed by squared distance; push each point, and when the heap exceeds k remove the farthest; the heap then holds the k closest points in O(n log k) time.

**Q:** How do you compute the minimum number of meeting rooms?
**A:** Sort meetings by start time and keep a min heap of end times; for each meeting pop the earliest end time if it is not later than the meeting's start, then push the new end time; the heap size at the end is the number of rooms.

**Q:** How do you join ropes with minimum total cost?
**A:** Repeatedly take the two shortest ropes from a min heap, add their sum to the cost and push the sum back, because short ropes should be combined first so they are counted in fewer later merges.

## summary
Heap interview problems fall into top k, merging sources, combining extremes, scheduling and median patterns. Choose the heap type and size from the pattern, break ties explicitly and state the O(n log k) style complexity.

## codenote
The Python sample covers top k points and meeting rooms. The JavaScript sample connects ropes.

## code
### python
```python
import heapq

def closest_points(points, k):
    heap = []
    for x, y in points:
        heapq.heappush(heap, (-(x * x + y * y), x, y))
        if len(heap) > k:
            heapq.heappop(heap)
    return sorted((x, y) for _, x, y in heap)

def meeting_rooms(meetings):
    ends = []
    for start, end in sorted(meetings):
        if ends and ends[0] <= start:
            heapq.heapreplace(ends, end)
        else:
            heapq.heappush(ends, end)
    return len(ends)

print(closest_points([(1, 3), (-2, 2), (5, 8), (0, 1)], 2))
print(meeting_rooms([(0, 30), (5, 10), (15, 20)]), meeting_rooms([(7, 10), (2, 4)]))
```
Output:
```text
[(-2, 2), (0, 1)]
2 1
```
### javascript
```javascript
function connectRopes(ropes) {
  const heap = [...ropes].sort((a, b) => a - b);
  let cost = 0;
  while (heap.length > 1) {
    const sum = heap.shift() + heap.shift();
    cost += sum;
    let i = 0;
    while (i < heap.length && heap[i] < sum) i++;
    heap.splice(i, 0, sum);
  }
  return cost;
}

console.log(connectRopes([4, 3, 2, 6]), connectRopes([5]));
```
Output:
```text
29 0
```

## quiz
1. Which heap finds the k largest elements of a large input?
   - [ ] A max heap of all elements
   - [x] A min heap of size k
   - [ ] A stack
   - [ ] A max heap of size one
   > The root is the smallest of the k kept elements.
2. What does the heap of end times represent in the meeting rooms solution?
   - [ ] The start times
   - [x] The end times of the meetings currently occupying rooms
   - [ ] The sorted meetings
   - [ ] The free rooms
   > Its size is the number of rooms in use.
3. Why combine the two shortest ropes first?
   - [ ] They are easier to find
   - [x] Short ropes then take part in as few later merges as possible
   - [ ] The sum is smaller than the others
   - [ ] To keep the heap sorted
   > Every merge cost is paid again for the rope it contains.
4. What is the complexity of a bounded heap solution for n items and heap size k?
   - [ ] O(n squared)
   - [x] O(n log k)
   - [ ] O(k log n)
   - [ ] O(n)
   > Each item may cause one push and one pop in a heap of size k.
