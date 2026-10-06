# Complete Binary Tree Property
kind: concept
time: Not an algorithmic topic — this lesson explains a structural property. Because a complete binary tree with n nodes has height ⌊log2 n⌋, heap operations that follow one root to leaf path cost O(log n).
space: Not an algorithmic topic — the property lets a tree be stored in a plain array of n cells with no pointers, so the memory overhead per node is zero.

## intro
A heap is stored as a complete binary tree: every level is full except possibly the last, which is filled from the left. This shape is not an accident. It is what lets a heap live inside an ordinary array, where the parent and children of any node are found by simple index arithmetic, and it is what keeps the height logarithmic.

## theory
Definition: a binary tree is complete if all levels except possibly the last are completely filled, and the nodes of the last level are as far to the left as possible. A complete tree with n nodes therefore has no gaps when its nodes are read level by level, left to right.

Array layout: store the nodes in level order. With 0-based indices:

- The root is at index 0
- The left child of index i is at `2i + 1`
- The right child of index i is at `2i + 2`
- The parent of index i is at `(i − 1) // 2` (integer division)

With 1-based indices the formulas become `2i`, `2i + 1` and `i // 2`, which is the form seen in many textbooks.

Example: the array `[1, 3, 2, 7, 6, 5, 4]` represents the tree with root 1; its children are 3 (index 1) and 2 (index 2); the children of 3 are 7 and 6 (indices 3 and 4); the children of 2 are 5 and 4. The parent of the element at index 5 (the value 5) is at index 2 (the value 2).

Why completeness gives a logarithmic height: level i holds at most 2^i nodes, so a complete tree with n nodes has height ⌊log2 n⌋ (counting edges). A heap with 1,000,000 elements has height 19, and a heap with 1,023 elements has height 9. Moving a node along a root to leaf path therefore takes at most about log2 n steps, which is the cost of every heap operation.

Number of leaves and internal nodes: in a complete tree with n nodes, the internal nodes are those with indices below ⌊n / 2⌋ and the leaves occupy the rest, so about half of all nodes are leaves. This fact is the key to why building a heap bottom up takes only O(n): most nodes are near the bottom and move very little.

Why not store arbitrary trees in arrays? A tree with gaps would need placeholder cells, so a skewed tree with n nodes would need 2^n cells. Completeness guarantees that the array has exactly n cells and no holes, and that appending a node at the end of the array (index n) keeps the tree complete, while removing the last element keeps it complete too. Heaps use both: insertion adds at the end, deletion moves the last element to the root.

Checks for completeness:

- Level order traversal: after the first missing child appears, no later node may have a child
- Array representation: a tree given as a level order list with no None before the last element is complete
- Node count method: a tree with n nodes is complete if the index of every node, assigned by the formulas above, is less than n

The tree 1, 2, 3, 4, 5 is complete, 1, 2, 3, null, 5 is not (a gap before the last node) and 1, 2, 3, 4, null, null, 7 is not either.

Related definitions: a perfect tree has all levels full (n = 2^(h + 1) − 1); a full tree has nodes with 0 or 2 children; a heap is a complete tree that also satisfies the heap order property, covered in the next lessons. Do not confuse complete with full: a full tree can have gaps in its levels.

Cache behaviour: array storage keeps the nodes of a heap contiguous, so the top levels sit in a few cache lines. The deeper levels are scattered across the array, though, and a sift down touches indices that grow geometrically, so large heaps suffer cache misses; B-heaps and d-ary heaps with higher fanout improve this.

Generalisation: a d-ary heap uses children at `d·i + 1` to `d·i + d` and parent `(i − 1) // d`. A 4-ary heap has a smaller height (log base 4 of n) and often runs faster in practice for insert-heavy workloads.

## explain
1. Place the tree's nodes in an array in level order.
2. Use 2i + 1 and 2i + 2 for the children and (i − 1) // 2 for the parent of index i.
3. Check that no gaps appear before the last element to confirm completeness.
4. Compute the height as the floor of log base 2 of n.
5. Use the first n // 2 indices as internal nodes and the rest as leaves.
6. Append at the end to add a node and remove the last element to delete one while staying complete.

## example
The Python program prints the children and parent of every index of `[1, 3, 2, 7, 6, 5, 4]`, the heights of heaps with 7, 1,000 and 1,000,000 nodes and the result of the completeness test on three level order lists. The JavaScript program lists the level boundaries of a 10 element array and the number of leaves.

## real
Priority queues in operating system schedulers, event simulators and language libraries store their heaps in arrays that rely on this property.

## pros
- No pointers needed to represent the tree
- Logarithmic height guaranteed by the shape
- Appending and removing at the end keep the tree complete

## cons
- Only complete trees fit the array form without waste
- Deep levels cause cache misses in huge heaps
- Index formulas differ between 0-based and 1-based layouts

## uses
- Storing binary heaps in arrays
- Implementing priority queues and heap sort
- Checking whether a level order list describes a complete tree
- Sizing heaps by their height

## mistakes
- Mixing 0-based and 1-based index formulas
- Confusing complete trees with full or perfect trees
- Treating a tree with gaps as storable in an array without placeholders
- Forgetting that about half of the nodes are leaves

## interview
**Q:** What is a complete binary tree?
**A:** A binary tree in which every level is full except possibly the last, and the last level is filled from left to right with no gaps.

**Q:** How do you find the parent and children of a node in the array form?
**A:** With 0-based indices the children of index i are at 2i + 1 and 2i + 2 and the parent is at (i − 1) divided by 2, rounded down.

**Q:** Why is the height of a heap O(log n)?
**A:** The tree is complete, so level i holds up to 2 to the power i nodes and there are no gaps, giving a height of floor of log2 n.

## summary
A complete binary tree has no gaps in level order, so it fits an array with simple index formulas and has height floor of log2 n. This property underlies the O(log n) cost of heap operations.

## codenote
The Python sample prints the index relations and checks completeness. The JavaScript sample lists level boundaries.

## code
### python
```python
import math

heap = [1, 3, 2, 7, 6, 5, 4]
for i in range(len(heap)):
    children = [c for c in (2 * i + 1, 2 * i + 2) if c < len(heap)]
    parent = (i - 1) // 2 if i else None
    print(i, heap[i], "children", [heap[c] for c in children], "parent", heap[parent] if parent is not None else None)

print([math.floor(math.log2(n)) for n in (7, 1000, 1_000_000)])

def is_complete(level_order):
    gap = False
    for value in level_order:
        if value is None:
            gap = True
        elif gap:
            return False
    return True

print(is_complete([1, 2, 3, 4, 5]), is_complete([1, 2, 3, None, 5]), is_complete([1, 2, 3, 4, None, None, 7]))
```
Output:
```text
0 1 children [3, 2] parent None
1 3 children [7, 6] parent 1
2 2 children [5, 4] parent 1
3 7 children [] parent 3
4 6 children [] parent 3
5 5 children [] parent 2
6 4 children [] parent 2
[2, 9, 19]
True False False
```
### javascript
```javascript
function levels(count) {
  const result = [];
  for (let start = 0, size = 1; start < count; start += size, size *= 2) {
    result.push([start, Math.min(start + size, count) - 1]);
  }
  return result;
}

const n = 10;
console.log(levels(n).map(([a, b]) => a + "-" + b).join(" "));
console.log("leaves", n - Math.floor(n / 2), "internal", Math.floor(n / 2));
```
Output:
```text
0-0 1-2 3-6 7-9
leaves 5 internal 5
```

## quiz
1. Where is the left child of the node at index i in a 0-based array heap?
   - [ ] i + 1
   - [x] 2i + 1
   - [ ] i / 2
   - [ ] 2i
   > The right child follows at 2i plus 2.
2. What is the height of a complete binary tree with 1000 nodes?
   - [ ] 1000
   - [x] 9
   - [ ] 100
   - [ ] 500
   > The floor of log base 2 of 1000 is 9.
3. Why can a complete tree be stored in an array without gaps?
   - [ ] Because it has few nodes
   - [x] Its nodes fill each level from the left, so level order positions are contiguous
   - [ ] Because it is sorted
   - [ ] Because it has no leaves
   > Every array cell from 0 to n minus 1 holds a node.
4. Roughly what fraction of the nodes of a complete binary tree are leaves?
   - [ ] One tenth
   - [x] About one half
   - [ ] One quarter
   - [ ] All of them
   > The last level and part of the one above hold the leaves.

# Min Heap Operations
kind: algorithm
time: O(log n) for push (sift up) and pop (sift down), O(1) for peeking at the minimum, and O(n) to build a heap from n items with bottom up heapify.
space: O(n) for the array that stores the heap, with O(1) extra space for the sifting operations.
viz: heapify

## intro
A min heap is a complete binary tree stored in an array in which every node is less than or equal to its children, so the smallest element is always at the root. It supports inserting an element and removing the minimum in logarithmic time, which makes it the engine behind priority queues, schedulers and shortest path algorithms.

## theory
Heap order property (min heap): for every node other than the root, `heap[parent(i)] <= heap[i]`. It orders each root to leaf path, but not siblings or cousins, so the heap is only partially sorted. The minimum is at index 0.

Operations:

- peek: return `heap[0]` in O(1)
- push(x): append x at the end of the array (the next free position keeps the tree complete) and sift it up: while the node is smaller than its parent, swap them. At most one swap per level, so O(log n).
- pop: save `heap[0]` as the result; move the last element to the root; shrink the array; sift down: while the node is larger than its smallest child, swap it with that child. O(log n).
- Sift down compares with the smaller of the two children, otherwise the heap order could break between the two children

Why it works: after appending, only the new node can violate the property (with its parent), and fixing it along the path to the root restores the order everywhere. After moving the last element to the root, only the root can violate the property (with its children), and pushing it down the path fixes it.

Trace: inserting 5, 3, 8, 1, 9, 2 into an empty min heap gives these arrays: `[5]`, then 3 sifts above 5 giving `[3, 5]`, then 8 appends giving `[3, 5, 8]`, then 1 sifts up past 5 and 3 giving `[1, 3, 8, 5]`, then 9 appends giving `[1, 3, 8, 5, 9]`, then 2 sifts up past 8 giving `[1, 3, 2, 5, 9, 8]`. Popping repeatedly returns 1, 2, 3, 5, 8, 9 in sorted order, which is why heap sort works.

Other operations:

- decrease_key: lower a value and sift it up, O(log n) given its position (indexed heaps track positions)
- delete an arbitrary element: replace it with the last element and sift up or down, O(log n) with a known position
- merge two heaps: concatenate and heapify in O(n), or use mergeable heaps such as binomial, Fibonacci or pairing heaps for faster merging
- replace (pop then push) in one sift: `heapq.heapreplace`, useful for fixed-size heaps
- build from an array: bottom up heapify in O(n), covered in a later lesson

Libraries: Python's `heapq` provides a min heap on a list (`heappush`, `heappop`, `heapify`, `heapreplace`, `nsmallest`), Java's `PriorityQueue` is a min heap by default, and C++ `std::priority_queue` is a max heap by default (use `greater<>` for min).

Comparison with other structures for repeated "extract the smallest": a sorted array costs O(n) per insertion; an unsorted array costs O(n) per extraction; a balanced search tree costs O(log n) for both but with larger constants and more memory; a heap gives O(log n) for both with the smallest constants and no pointers, but cannot search for arbitrary keys or iterate in sorted order efficiently.

Pitfalls: popping from an empty heap, comparing with the wrong child in sift down, forgetting that the heap array is not sorted (printing it does not show the sorted order), and storing mutable items whose key changes while in the heap (the heap order silently breaks).

Testing: push random values and check that repeated pops give a sorted list, verify the heap order property after each operation, and test empty and one element heaps.

## explain
1. Keep the elements in an array with the parent and child index formulas.
2. To push, append the element and swap it with its parent while it is smaller.
3. To pop, save the root, move the last element to the root and shrink the array.
4. Sift the new root down by swapping with the smaller child until the order holds.
5. Return the saved root.
6. Check that popping everything gives sorted output.

## example
The Python class implements push and pop with sift up and sift down, prints the heap array after each of the pushes 5, 3, 8, 1, 9, 2 and then pops everything in order: 1, 2, 3, 5, 8, 9. The JavaScript class repeats the idea and shows the array after one pop.

## real
Operating systems keep timers and runnable tasks in heaps, simulators keep the next event at the top, and graph algorithms such as Dijkstra's and Prim's use a min heap to pick the closest vertex.

## pros
- O(log n) insert and extract-min with small constants
- Stored in a compact array without pointers
- O(1) access to the minimum

## cons
- Cannot search for arbitrary elements efficiently
- Not sorted, so ordered iteration costs O(n log n)
- Changing a key requires knowing the position

## uses
- Priority queues and schedulers
- Dijkstra's and Prim's algorithms
- Selecting the k smallest items
- Event simulation

## mistakes
- Swapping with the larger child while sifting down
- Forgetting to shrink the array after removing the last element
- Assuming the array is sorted
- Modifying a key of an element that is already in the heap

## interview
**Q:** How does a min heap insert an element?
**A:** It appends the element at the end of the array to keep the tree complete and then sifts it up, swapping with its parent while it is smaller, which takes O(log n).

**Q:** How does extract-min work?
**A:** Save the root, move the last element to the root, shrink the array and sift the new root down by swapping with its smaller child until the heap order holds, in O(log n).

**Q:** Why does sift down compare with the smaller child?
**A:** If the node were swapped with the larger child, the smaller child would end up below a larger parent and violate the min heap order.

## summary
A min heap keeps the smallest element at the root of a complete tree in an array, with O(log n) push and pop through sift up and sift down and O(1) peek. Compare with the smaller child when sifting down and never rely on the array being sorted.

## codenote
The Python sample implements and traces a min heap. The JavaScript sample shows a pop.

## code
### python
```python
class MinHeap:
    def __init__(self):
        self.a = []

    def push(self, value):
        self.a.append(value)
        i = len(self.a) - 1
        while i and self.a[(i - 1) // 2] > self.a[i]:
            parent = (i - 1) // 2
            self.a[parent], self.a[i] = self.a[i], self.a[parent]
            i = parent

    def pop(self):
        top = self.a[0]
        last = self.a.pop()
        if self.a:
            self.a[0] = last
            i = 0
            while True:
                smallest = i
                for child in (2 * i + 1, 2 * i + 2):
                    if child < len(self.a) and self.a[child] < self.a[smallest]:
                        smallest = child
                if smallest == i:
                    break
                self.a[i], self.a[smallest] = self.a[smallest], self.a[i]
                i = smallest
        return top

heap = MinHeap()
for value in (5, 3, 8, 1, 9, 2):
    heap.push(value)
    print(heap.a)
print([heap.pop() for _ in range(6)])
```
Output:
```text
[5]
[3, 5]
[3, 5, 8]
[1, 3, 8, 5]
[1, 3, 8, 5, 9]
[1, 3, 2, 5, 9, 8]
[1, 2, 3, 5, 8, 9]
```
### javascript
```javascript
class MinHeap {
  constructor() {
    this.a = [];
  }

  push(value) {
    this.a.push(value);
    let i = this.a.length - 1;
    while (i > 0 && this.a[(i - 1) >> 1] > this.a[i]) {
      const p = (i - 1) >> 1;
      [this.a[p], this.a[i]] = [this.a[i], this.a[p]];
      i = p;
    }
  }

  pop() {
    const top = this.a[0];
    const last = this.a.pop();
    if (this.a.length) {
      this.a[0] = last;
      let i = 0;
      for (;;) {
        let smallest = i;
        for (const c of [2 * i + 1, 2 * i + 2]) {
          if (c < this.a.length && this.a[c] < this.a[smallest]) smallest = c;
        }
        if (smallest === i) break;
        [this.a[i], this.a[smallest]] = [this.a[smallest], this.a[i]];
        i = smallest;
      }
    }
    return top;
  }
}

const heap = new MinHeap();
[7, 2, 9, 4, 1, 6].forEach((v) => heap.push(v));
console.log(heap.a.join(" "), "|", heap.pop(), "|", heap.a.join(" "));
```
Output:
```text
1 2 6 7 4 9 | 1 | 2 4 6 7 9
```

## quiz
1. Where is the minimum element in a min heap?
   - [ ] At the last index
   - [x] At the root, index 0
   - [ ] In the middle
   - [ ] At any leaf
   > Every node is at most its children.
2. How does push restore the heap order?
   - [ ] By sorting the array
   - [x] By sifting the new element up while it is smaller than its parent
   - [ ] By swapping with the root
   - [ ] By rebuilding the heap
   > Only the path to the root can be violated.
3. Which child does sift down swap with?
   - [ ] The larger child
   - [x] The smaller child
   - [ ] Always the left child
   - [ ] The parent
   > Otherwise the other child would end up below a larger parent.
4. What is the cost of peeking at the minimum?
   - [ ] O(log n)
   - [x] O(1)
   - [ ] O(n)
   - [ ] O(n log n)
   > It is the first array element.

# Max Heap Operations
kind: algorithm
time: O(log n) for push and pop, O(1) for peeking at the maximum, O(n) for building the heap, and O(n log n) to extract all elements in descending order.
space: O(n) for the array, with O(1) extra space for sifting.

## intro
A max heap is the mirror image of a min heap: every node is greater than or equal to its children, so the largest element sits at the root. It is the natural structure for "give me the biggest item next", as in task scheduling by priority, finding the largest values in a stream and the heap sort algorithm.

## theory
Heap order property (max heap): `heap[parent(i)] >= heap[i]` for every non-root node, so the maximum is at index 0. All the machinery of the min heap applies with the comparisons reversed:

- push(x): append and sift up while the node is larger than its parent
- pop: save the root, move the last element to the root, sift down by swapping with the larger child while it is bigger than the node
- peek: `heap[0]`
- build: bottom up heapify with the reversed comparison, O(n)

Trace: pushing 4, 10, 3, 5, 1 gives `[4]`, then 10 rises above 4 giving `[10, 4]`, then 3 gives `[10, 4, 3]`, then 5 rises above 4 giving `[10, 5, 3, 4]`, then 1 gives `[10, 5, 3, 4, 1]`. Popping returns 10, 5, 4, 3, 1: descending order.

Implementing a max heap with a min heap library: languages that only offer a min heap (Python's `heapq`) support a max heap by storing negated keys (`heappush(h, −x)` and `−heappop(h)`), or by wrapping items in a class with reversed comparison. For tuples such as `(priority, task)` negate the priority only. In Java use `new PriorityQueue<>(Collections.reverseOrder())`; in C++ `std::priority_queue` is already a max heap.

Applications of a max heap:

- Priority scheduling where larger numbers mean more urgent work
- Finding the k smallest elements of a stream: keep a max heap of size k; when a new element is smaller than the root, replace the root. The root is always the k-th smallest seen so far. For the stream 7, 10, 4, 3, 20, 15 and k = 3 the final heap holds 3, 4, 7 with 7 as the root, so the third smallest is 7.
- Heap sort: build a max heap, then repeatedly swap the root with the last element of the unsorted part and sift down, which sorts in place in O(n log n)
- Median maintenance (the lower half is kept in a max heap, see the median lesson)
- Order books: best bid is the highest buy price
- Greedy problems where the largest remaining item is taken each time, such as the last stone weight (smash the two heaviest stones; for the weights 2, 7, 4, 1, 8, 1 the last stone has weight 1)

Complexity table:

- Insert: O(log n) worst case, O(1) average for random input (most new elements stay near the bottom)
- Extract max: O(log n)
- Peek: O(1)
- Merge two heaps: O(n) by rebuilding
- Increase key: sift up, O(log n)

Alternatives: a sorted list gives O(1) extract max but O(n) insert; a balanced BST gives O(log n) for both plus ordered iteration; a heap is simplest and fastest for just the extremes.

Pitfalls: forgetting to negate back when using the negation trick, using the wrong comparison direction, ties between equal priorities causing unstable order (add a sequence counter to keep first in, first out among equals) and comparing incomparable tuple elements when priorities are equal (Python raises a TypeError when tasks themselves cannot be compared, so include a unique counter before the task).

Testing: pop everything and check descending order, compare with sorting on random data, and test equal keys.

## explain
1. Store the elements in an array with parent and child index formulas.
2. To push, append and swap upward while the element exceeds its parent.
3. To pop, save the root, move the last element to the root and sift down with the larger child.
4. Use negated keys when only a min heap is available.
5. For the k smallest items, keep a max heap of size k and replace the root when a smaller item arrives.
6. Check that repeated pops give descending order.

## example
The Python program uses `heapq` with negated values as a max heap for the pushes 4, 10, 3, 5, 1, pops them in descending order 10, 5, 4, 3, 1, keeps the three smallest of the stream 7, 10, 4, 3, 20, 15 and solves the last stone weight problem. The JavaScript class implements the max heap directly and prints the array after the pushes and the popped order.

## real
Job schedulers pick the highest priority task, trading systems read the best bid from a max heap, and streaming analytics keep a bounded set of the smallest values with a max heap.

## pros
- Constant time access to the largest element
- Efficient bounded selection of the k smallest items
- Same machinery as the min heap

## cons
- Libraries often provide only min heaps
- Negation tricks are error prone
- Not sorted and cannot search arbitrary keys

## uses
- Scheduling by highest priority
- Keeping the k smallest values with a bounded heap
- Heap sort
- Greedy algorithms that take the largest item repeatedly

## mistakes
- Forgetting to negate the popped value back when simulating a max heap
- Reversing the comparison only in one of push and pop
- Comparing tasks when priorities tie, causing type errors in Python
- Expecting the heap array to be in descending order

## interview
**Q:** How do you implement a max heap in a language that only has a min heap?
**A:** Store negated keys (or use a comparator that reverses the order), and negate again when reading values out.

**Q:** How can a max heap find the k smallest elements of a stream?
**A:** Keep a max heap of size k; when a new element is smaller than the root, replace the root with it and sift down; the heap then contains the k smallest elements and its root is the k-th smallest.

**Q:** Why add a counter to tuples in a priority queue?
**A:** When two priorities are equal, the comparison moves on to the next tuple element, which may not be comparable; a unique increasing counter breaks ties and keeps first in, first out order.

## summary
A max heap keeps the largest element at the root with O(log n) push and pop, built from the min heap logic with reversed comparisons or negated keys. It supports priority scheduling, bounded k smallest selection and heap sort.

## codenote
The Python sample uses negated keys. The JavaScript sample implements a max heap.

## code
### python
```python
import heapq

heap = []
for value in (4, 10, 3, 5, 1):
    heapq.heappush(heap, -value)
print([-heapq.heappop(heap) for _ in range(5)])

def k_smallest(stream, k):
    heap = []
    for value in stream:
        if len(heap) < k:
            heapq.heappush(heap, -value)
        elif value < -heap[0]:
            heapq.heapreplace(heap, -value)
    return sorted(-x for x in heap), -heap[0]

def last_stone(weights):
    heap = [-w for w in weights]
    heapq.heapify(heap)
    while len(heap) > 1:
        first, second = -heapq.heappop(heap), -heapq.heappop(heap)
        if first != second:
            heapq.heappush(heap, -(first - second))
    return -heap[0] if heap else 0

print(k_smallest([7, 10, 4, 3, 20, 15], 3))
print(last_stone([2, 7, 4, 1, 8, 1]))
```
Output:
```text
[10, 5, 4, 3, 1]
([3, 4, 7], 7)
1
```
### javascript
```javascript
class MaxHeap {
  constructor() {
    this.a = [];
  }

  push(value) {
    this.a.push(value);
    let i = this.a.length - 1;
    while (i > 0 && this.a[(i - 1) >> 1] < this.a[i]) {
      const p = (i - 1) >> 1;
      [this.a[p], this.a[i]] = [this.a[i], this.a[p]];
      i = p;
    }
  }

  pop() {
    const top = this.a[0];
    const last = this.a.pop();
    if (this.a.length) {
      this.a[0] = last;
      let i = 0;
      for (;;) {
        let largest = i;
        for (const c of [2 * i + 1, 2 * i + 2]) {
          if (c < this.a.length && this.a[c] > this.a[largest]) largest = c;
        }
        if (largest === i) break;
        [this.a[i], this.a[largest]] = [this.a[largest], this.a[i]];
        i = largest;
      }
    }
    return top;
  }
}

const heap = new MaxHeap();
[4, 10, 3, 5, 1].forEach((v) => heap.push(v));
console.log(heap.a.join(" "), "|", [1, 2, 3, 4, 5].map(() => heap.pop()).join(" "));
```
Output:
```text
10 5 3 4 1 | 10 5 4 3 1
```

## quiz
1. Where is the largest element of a max heap?
   - [ ] At a leaf
   - [x] At the root
   - [ ] At the last index
   - [ ] In the middle
   > Every node is at least as large as its children.
2. How is a max heap built with Python's heapq?
   - [ ] By calling heapq.maxheap
   - [x] By storing negated values and negating them back when popping
   - [ ] By sorting after each push
   - [ ] By reversing the list
   > heapq only provides a min heap.
3. What does the root of a max heap of size k represent when it holds the k smallest elements seen?
   - [ ] The smallest element
   - [x] The k-th smallest element
   - [ ] The median
   - [ ] The largest element overall
   > It is the largest of the k smallest.
4. Why add a counter to heap tuples?
   - [ ] To make the heap larger
   - [x] To break ties between equal priorities without comparing the payloads
   - [ ] To sort the heap
   - [ ] To avoid sifting
   > Unique counters keep the order stable and comparisons valid.

# Heapify Build Heap
kind: algorithm
time: O(n) to build a heap from n elements with bottom up heapify, compared with O(n log n) for inserting the elements one at a time.
space: O(1) extra space when the heap is built in place in the given array.
viz: heapify

## intro
Given an unsorted array, how fast can you turn it into a heap? Inserting the elements one by one costs O(n log n). Bottom up heapify does it in O(n) by fixing the array from the last internal node upward, and the argument for why it is linear is one of the nicest pieces of analysis in elementary algorithms.

## theory
Bottom up heapify (Floyd's algorithm):

- The leaves are already heaps of size one, so skip them; the last internal node is at index `n // 2 − 1`
- For i from `n // 2 − 1` down to 0, sift the element at index i down until the heap order holds in its subtree
- When the loop finishes, the whole array is a heap

Why this works: when sift down runs at index i, both subtrees below it are already heaps (they were processed earlier, since their indices are larger). Sifting the root of a subtree down through two valid heaps produces a valid heap.

Example (min heap): the array `[9, 4, 7, 1, -2, 6, 5, 2]` has n = 8, so start at index 3. The value 1 at index 3 is already smaller than its child 2, so nothing moves; the value 7 at index 2 swaps with its smaller child 5; the value 4 at index 1 swaps with −2; and the root 9 sifts down through −2, 1 and 2. The final array is `[-2, 1, 5, 2, 4, 6, 7, 9]`, a valid min heap.

Why it takes O(n): sift down at a node of height h costs at most h swaps. In a complete tree with n nodes there are about n / 2^(h + 1) nodes of height h. The total work is bounded by the sum over h of (n / 2^(h + 1)) · h, which equals n times the sum of h / 2^(h + 1), and that series converges to 1. So the total is at most about n swaps. The intuition: half of the nodes are leaves and cost nothing, a quarter have height 1 and cost at most one swap, and only the root can sink the full height.

Top down building (repeated insertion): each insertion sifts up through at most log2 n levels. The sum over all n insertions is O(n log n) in the worst case, as in an input sorted in descending order for a min heap, where every new element rises all the way to the root. For 1000 elements in descending order, the bottom up method performs fewer than 1000 swaps while repeated insertion performs several thousand (the demonstration code counts them).

Properties:

- The resulting heap is not unique; different build methods may produce different valid arrays
- Heapify is in place, so heap sort can start with an O(n) build
- Library functions: `heapq.heapify(list)` in Python, `std::make_heap` in C++, `new PriorityQueue<>(collection)` in Java (which heapifies)
- When many elements are available upfront, always heapify instead of pushing one by one

Selection by heap: heapify then pop k times costs O(n + k log n), better than sorting for small k; this is how `heapq.nsmallest` behaves for moderate k, and a bounded heap of size k costs O(n log k) when streaming.

Pitfalls:

- Starting from the wrong index (it should be the last internal node, `n // 2 − 1` in 0-based layouts)
- Looping upward instead of downward, which breaks the precondition that subtrees below are heaps
- Using sift up for the bottom up build, which gives incorrect results
- Forgetting that the 1-based formula starts at `n // 2`

Testing: heapify random arrays and check the heap property for every index, compare the multiset of elements before and after, and test arrays of size 0, 1 and 2.

## explain
1. Find the last internal node at index n // 2 − 1.
2. For each index from there down to 0, sift the element down.
3. Sift down swaps the element with its smaller child (min heap) until the order holds.
4. After the loop the array satisfies the heap property everywhere.
5. Compare with repeated insertion to see the difference in swaps.
6. Verify the property and the multiset of elements in tests.

## example
The Python program heapifies `[9, 4, 7, 1, -2, 6, 5, 2]` into `[-2, 1, 5, 2, 4, 6, 7, 9]`, and counts the swaps of bottom up heapify and of repeated insertion for 1000 descending elements. The JavaScript program applies heapify to a max heap and prints the array.

## real
Libraries heapify collections passed to priority queue constructors, heap sort starts with heapify, and algorithms such as Dijkstra's can initialise their queue in O(n) when all start distances are known.

## pros
- Builds a heap in linear time
- In place with no extra memory
- Simple loop reusing sift down

## cons
- The linear time analysis is not obvious
- Needs all elements in advance
- The resulting heap arrangement is not unique

## uses
- Building a priority queue from an existing array
- The first phase of heap sort
- Selecting the k smallest or largest items
- Initialising scheduler queues

## mistakes
- Starting the loop at the last element instead of the last internal node
- Iterating upward from the root to the leaves
- Building the heap with n pushes when all data is available
- Mixing 0-based and 1-based formulas for the starting index

## interview
**Q:** Why is building a heap bottom up O(n) and not O(n log n)?
**A:** Most nodes are near the bottom: about half are leaves needing no work and a quarter can move down only one level, so the total number of swaps is bounded by a convergent series that sums to about n.

**Q:** At which index does heapify start?
**A:** At the last internal node, index n divided by 2 minus 1 in a 0-based array, and it proceeds down to index 0.

**Q:** When is repeated insertion worse than heapify?
**A:** Whenever all data is available upfront, since n insertions cost O(n log n) in the worst case, such as input sorted in the opposite order of the heap, while heapify costs O(n).

## summary
Bottom up heapify fixes the array from the last internal node to the root with sift down, building a heap in O(n) time and O(1) space. It is faster than n insertions and is the first step of heap sort.

## codenote
The Python sample heapifies and counts swaps. The JavaScript sample builds a max heap.

## code
### python
```python
def sift_down(a, i, n, counter):
    while True:
        smallest = i
        for child in (2 * i + 1, 2 * i + 2):
            if child < n and a[child] < a[smallest]:
                smallest = child
        if smallest == i:
            return
        a[i], a[smallest] = a[smallest], a[i]
        counter[0] += 1
        i = smallest

def heapify(a):
    counter = [0]
    for i in range(len(a) // 2 - 1, -1, -1):
        sift_down(a, i, len(a), counter)
    return counter[0]

def insert_all(values):
    heap, swaps = [], 0
    for value in values:
        heap.append(value)
        i = len(heap) - 1
        while i and heap[(i - 1) // 2] > heap[i]:
            parent = (i - 1) // 2
            heap[parent], heap[i] = heap[i], heap[parent]
            swaps += 1
            i = parent
    return swaps

data = [9, 4, 7, 1, -2, 6, 5, 2]
heapify(data)
print(data)
big = list(range(1000, 0, -1))
print(heapify(big[:]), insert_all(big))
```
Output:
```text
[-2, 1, 5, 2, 4, 6, 7, 9]
992 7987
```
### javascript
```javascript
function heapifyMax(a) {
  const n = a.length;
  for (let start = Math.floor(n / 2) - 1; start >= 0; start--) {
    let i = start;
    for (;;) {
      let largest = i;
      for (const c of [2 * i + 1, 2 * i + 2]) {
        if (c < n && a[c] > a[largest]) largest = c;
      }
      if (largest === i) break;
      [a[i], a[largest]] = [a[largest], a[i]];
      i = largest;
    }
  }
  return a;
}

console.log(heapifyMax([3, 9, 2, 1, 4, 5]).join(" "));
```
Output:
```text
9 4 5 1 3 2
```

## quiz
1. Where does bottom up heapify begin?
   - [ ] At the root
   - [x] At the last internal node
   - [ ] At the last leaf
   - [ ] At a random index
   > Leaves are already heaps of size one.
2. Why is the order of the loop from the last internal node down to the root important?
   - [ ] For speed only
   - [x] The subtrees below each node must already be heaps when it is sifted down
   - [ ] To sort the array
   - [ ] To remove duplicates
   > Sift down relies on valid child subtrees.
3. What is the time complexity of building a heap with heapify?
   - [ ] O(n log n)
   - [x] O(n)
   - [ ] O(log n)
   - [ ] O(n squared)
   > Most nodes sit near the bottom and move very little.
4. When is repeated insertion especially slow for a min heap?
   - [ ] For random data
   - [x] For input in descending order, where each element rises to the root
   - [ ] For input that is already a heap
   - [ ] For arrays of size one
   > Every insertion then needs the maximum number of swaps.

# Priority Queue ADT
kind: algorithm
time: O(log n) for insert and extract with a binary heap implementation, O(1) for peeking at the highest priority, versus O(n) for one of the two operations in an unsorted or sorted list implementation.
space: O(n) for the stored items.

## intro
A priority queue is an abstract data type in which every item has a priority, and removal always returns the item with the highest (or lowest) priority, regardless of arrival order. Where a queue is first in, first out, a priority queue is most urgent first. It is the interface; a binary heap is the usual implementation.

## theory
Abstract operations:

- insert(item, priority): add an item with a priority
- extract(): remove and return the item with the highest priority (or lowest, depending on the convention)
- peek(): return that item without removing it
- is_empty() and size()
- Optional: change_priority(item, new priority), remove(item), merge(other queue)

Implementations and costs:

- Unsorted array or list: insert O(1), extract O(n) (scan for the best)
- Sorted array or list: insert O(n), extract O(1)
- Balanced binary search tree: both O(log n), plus ordered traversal
- Binary heap: insert O(log n), extract O(log n), peek O(1), the standard choice
- Fibonacci heap: insert and decrease-key O(1) amortised, extract O(log n) amortised, mostly of theoretical interest
- Bucket queue: O(1) operations when priorities are small integers (as in Dial's algorithm for shortest paths)

Choosing the convention: min priority queues serve the smallest key first (distance in Dijkstra, event time in simulations); max priority queues serve the largest first (importance, score). Know which your library offers and invert the key if needed.

Ties and stability: a heap does not preserve insertion order among equal priorities. When fairness among equal priorities matters, store `(priority, sequence number, item)` so that earlier items win ties and the items themselves are never compared. In the example below, tasks with the same priority come out in the order they were added.

Task example: insert ("write report", 2), ("fix bug", 1), ("email", 3), ("deploy", 1), ("lunch", 2) with the convention that a smaller number is more urgent. Extraction order: fix bug, deploy, write report, lunch, email (fix bug before deploy and write report before lunch because of the sequence number).

Changing priorities: many algorithms need decrease-key, such as Dijkstra's when a shorter distance is found. Options: an indexed heap that tracks each item's position (O(log n) update), lazy deletion (push the new entry and ignore stale ones when popped), or mergeable heaps with efficient decrease-key.

Library interfaces:

- Python: `heapq` (functions on a list) and `queue.PriorityQueue` (thread-safe wrapper)
- Java: `PriorityQueue` (min heap by default, with a comparator for custom order), `PriorityBlockingQueue` for concurrency
- C++: `std::priority_queue` (max heap by default)
- JavaScript has no built in priority queue; write a heap class or use a library

Applications: CPU and job scheduling, event driven simulation, Dijkstra's and Prim's algorithms, A* search, Huffman coding, merging sorted streams, bandwidth management, rate limiters, top k selection and load balancing.

Design questions for production: bounded size (drop lowest priority), starvation of low priority items (aging raises priority over time), fairness, persistence and distributed queues (a broker with priority levels).

Testing: items come out in priority order for random inserts, ties follow the documented rule, and operations on an empty queue are handled.

## explain
1. Decide whether the highest or the lowest priority is served first.
2. Implement the queue with a binary heap storing priority, sequence number and item.
3. Insert by pushing the triple, extract by popping the smallest triple.
4. Add a sequence counter to make equal priorities first in, first out.
5. Use lazy deletion or an indexed heap if priorities change.
6. Test the extraction order on mixed priorities and ties.

## example
The Python class wraps `heapq` with a sequence counter, inserts the five tasks and extracts them in the order fix bug, deploy, write report, lunch, email. The JavaScript program implements a small priority queue by inserting into a sorted array with binary search and prints the same order.

## real
Operating systems schedule threads by priority, network devices queue packets by service class, and emergency dispatch systems order incidents by urgency.

## pros
- Serves the most important item first regardless of arrival order
- Efficient with a binary heap
- Applies to many algorithms and systems

## cons
- Not fair among equal priorities without extra care
- Changing priorities needs an indexed or lazy approach
- Low priority items can starve

## uses
- Ordering work items by urgency
- Shortest path and spanning tree algorithms
- Event driven simulation
- Selecting the top items from streams

## mistakes
- Assuming equal priorities come out in insertion order
- Putting non comparable payloads into tuples without a tie breaker
- Mixing up the min and max conventions between libraries
- Changing the priority of an item inside the heap without updating it

## interview
**Q:** What is a priority queue and how is it usually implemented?
**A:** An abstract data type that extracts the item with the highest (or lowest) priority first, usually implemented with a binary heap that gives O(log n) insert and extract and O(1) peek.

**Q:** How do you keep equal priority items first in, first out?
**A:** Store a monotonically increasing sequence number with each item and compare (priority, sequence number), so ties are resolved by arrival order and payloads are never compared.

**Q:** How can a priority queue support decrease-key?
**A:** Use an indexed heap that stores the position of each item so its key can be changed and sifted in O(log n), or push a new entry and discard stale entries when they are popped.

## summary
A priority queue returns the most urgent item first, and a binary heap implements it with O(log n) insert and extract. Add a sequence counter for ties and plan for priority changes with lazy deletion or an indexed heap.

## codenote
The Python sample wraps heapq with a tie breaker. The JavaScript sample uses a sorted array.

## code
### python
```python
import heapq
import itertools

class PriorityQueue:
    def __init__(self):
        self.heap = []
        self.counter = itertools.count()

    def insert(self, item, priority):
        heapq.heappush(self.heap, (priority, next(self.counter), item))

    def extract(self):
        return heapq.heappop(self.heap)[2]

    def __len__(self):
        return len(self.heap)

queue = PriorityQueue()
for task, priority in [("write report", 2), ("fix bug", 1), ("email", 3), ("deploy", 1), ("lunch", 2)]:
    queue.insert(task, priority)
print([queue.extract() for _ in range(len(queue))])
```
Output:
```text
['fix bug', 'deploy', 'write report', 'lunch', 'email']
```
### javascript
```javascript
class SortedPriorityQueue {
  constructor() {
    this.items = [];
    this.sequence = 0;
  }

  insert(item, priority) {
    const entry = { item, priority, sequence: this.sequence++ };
    let low = 0;
    let high = this.items.length;
    while (low < high) {
      const mid = (low + high) >> 1;
      const other = this.items[mid];
      if (other.priority < priority || (other.priority === priority && other.sequence < entry.sequence)) low = mid + 1;
      else high = mid;
    }
    this.items.splice(low, 0, entry);
  }

  extract() {
    return this.items.shift().item;
  }
}

const queue = new SortedPriorityQueue();
[["write report", 2], ["fix bug", 1], ["email", 3], ["deploy", 1], ["lunch", 2]].forEach(([t, p]) => queue.insert(t, p));
const order = [];
while (queue.items.length) order.push(queue.extract());
console.log(order.join(", "));
```
Output:
```text
fix bug, deploy, write report, lunch, email
```

## quiz
1. Which item does a priority queue extract first?
   - [ ] The oldest item
   - [x] The item with the highest priority
   - [ ] The largest payload
   - [ ] A random item
   > Arrival order does not decide.
2. What is the cost of insert and extract in a binary heap implementation?
   - [ ] O(1) and O(n)
   - [x] O(log n) for both
   - [ ] O(n) for both
   - [ ] O(1) for both
   > Each operation follows one path of the tree.
3. How do you keep equal priorities first in, first out?
   - [ ] Sort the heap afterwards
   - [x] Add an increasing sequence number to the comparison key
   - [ ] Use a larger heap
   - [ ] Use a stack
   > The sequence number breaks ties by arrival.
4. What does lazy deletion do for changing priorities?
   - [ ] Updates the key in place
   - [x] Pushes a new entry and ignores stale entries when they are popped
   - [ ] Rebuilds the heap
   - [ ] Deletes the queue
   > It avoids searching for the old entry.

# Heap Sort Connection
kind: algorithm
time: O(n log n) in the best, average and worst cases: O(n) to build the max heap plus n extractions of O(log n) each.
space: O(1) extra space because the sort works in place inside the input array.
viz: heap-sort

## intro
Heap sort turns the heap from a priority queue into a sorting algorithm: build a max heap, then repeatedly move the largest element to the end of the array and shrink the heap. The array sorts itself from the back toward the front, in place, with a guaranteed O(n log n) running time.

## theory
Algorithm (ascending order):

- Build a max heap from the array with bottom up heapify, O(n)
- Repeat for the last index `end` from n − 1 down to 1: swap `a[0]` (the maximum) with `a[end]`, so the maximum lands in its final position; reduce the heap size by one; sift the new root down within `a[0..end − 1]` to restore the heap order

After each step the suffix `a[end..n − 1]` holds the largest elements in sorted order, and the prefix is still a max heap. After n − 1 steps the whole array is sorted.

Trace for `[4, 10, 3, 5, 1]`: the max heap is `[10, 5, 3, 4, 1]`. Swap 10 with 1, shrink, sift: `[5, 4, 3, 1 | 10]`. Swap 5 with 1: `[4, 1, 3 | 5, 10]`. Swap 4 with 3: `[3, 1 | 4, 5, 10]`. Swap 3 with 1: `[1 | 3, 4, 5, 10]`. The result is `[1, 3, 4, 5, 10]`.

Complexity: the build step costs O(n) and each of the n − 1 extractions costs O(log n), so the total is O(n log n) in every case, with no dependence on the input order. A comparison sort cannot beat Ω(n log n) in the worst case, so heap sort is asymptotically optimal.

Properties:

- In place: only a few variables of extra memory
- Not stable: swapping the root with the last element can reorder equal keys
- Not adaptive: nearly sorted input takes as long as random input, unlike insertion sort or Timsort
- Poor cache locality: sift down jumps between distant indices, so it is usually slower than quick sort in practice by a constant factor of 2 to 3
- Worst case guarantee: no O(n squared) behaviour, which is why introsort falls back to heap sort when quick sort recurses too deeply

Comparison:

- Quick sort: faster on average and cache friendly, but O(n squared) worst case unless safeguarded
- Merge sort: stable and O(n log n), but needs O(n) extra space for arrays
- Heap sort: O(n log n) worst case, O(1) space, not stable, slower constants
- Selection sort: also repeatedly selects the maximum, but scans in O(n) each time; heap sort replaces the scan with a heap that finds the next maximum in O(log n)

Variants:

- Min heap approach with an extra output array: pop all elements in ascending order, O(n) extra space
- Partial sort: stop after k extractions to get the k largest elements in O(n + k log n)
- Smoothsort and weak heap sort: reduce comparisons or adapt to presorted input
- Bottom up heap sort: reduces the number of comparisons in sift down by walking to a leaf first and then climbing back

Why it connects to priority queues: the algorithm is "insert all items, then extract all items in order", which is the definition of sorting by a priority queue. The cost depends on the queue implementation: a heap gives heap sort; an unsorted list gives selection sort; a sorted list gives insertion sort; a balanced tree gives tree sort.

Pitfalls: sifting down over the whole array instead of the shrinking heap, forgetting to decrease the heap size after each swap, and building the heap with the wrong comparison direction.

Testing: random arrays, already sorted and reversed arrays, arrays with duplicates, empty and one element arrays, and a comparison with the language's sort.

## explain
1. Build a max heap from the array with bottom up heapify.
2. Swap the root with the last element of the heap, so the maximum goes to its final position.
3. Shrink the heap size by one.
4. Sift the new root down within the smaller heap.
5. Repeat until the heap has one element.
6. Check the result against a trusted sort.

## example
The Python function sorts `[4, 10, 3, 5, 1]` into `[1, 3, 4, 5, 10]` and sorts a longer array with duplicates, printing the result of comparing it with the built in sort on 200 random arrays: True. The JavaScript function prints the array after each extraction for the array `[12, 11, 13, 5, 6, 7]`.

## real
Introspective sorts in standard libraries switch to heap sort to guarantee O(n log n), and embedded systems choose it when memory is tight and worst-case time must be bounded.

## pros
- O(n log n) worst case with no bad inputs
- In place with O(1) extra memory
- Simple reuse of the heap operations

## cons
- Equal keys can change their relative order
- Slower in practice than quick sort because of cache behaviour
- Not adaptive to partially sorted input

## uses
- Sorting with guaranteed time and little memory
- The fallback inside introsort
- Partial sorting to get the k largest values
- Demonstrating how a priority queue sorts

## mistakes
- Sifting down over the full array instead of the shrinking heap
- Leaving the heap size unchanged while extracting maxima
- Building a min heap and expecting ascending output in place
- Expecting equal keys to keep their original order

## interview
**Q:** How does heap sort work?
**A:** It builds a max heap, then repeatedly swaps the root with the last element of the heap, shrinks the heap and sifts the new root down, so the sorted suffix grows from the end of the array.

**Q:** What running time and extra memory does heap sort need?
**A:** O(n log n) time in all cases and O(1) extra space since it sorts in place.

**Q:** Why is heap sort slower than quick sort in practice and is it stable?
**A:** Sift down jumps across the array, causing cache misses, and the extra comparisons add up; it is not stable because swapping the root to the end can reorder equal elements.

## summary
Heap sort builds a max heap and repeatedly moves the maximum to the end, sorting in place in O(n log n) in every case. It is not stable and not cache friendly, but it never degrades, which makes it the safety net of introsort.

## codenote
The Python sample sorts and verifies against the built in sort. The JavaScript sample prints each extraction step.

## code
### python
```python
import random

def sift_down(a, i, size):
    while True:
        largest = i
        for child in (2 * i + 1, 2 * i + 2):
            if child < size and a[child] > a[largest]:
                largest = child
        if largest == i:
            return
        a[i], a[largest] = a[largest], a[i]
        i = largest

def heap_sort(a):
    n = len(a)
    for i in range(n // 2 - 1, -1, -1):
        sift_down(a, i, n)
    for end in range(n - 1, 0, -1):
        a[0], a[end] = a[end], a[0]
        sift_down(a, 0, end)
    return a

print(heap_sort([4, 10, 3, 5, 1]))
rng = random.Random(9)
cases = [[rng.randint(-20, 20) for _ in range(rng.randint(0, 30))] for _ in range(200)]
print(all(heap_sort(c[:]) == sorted(c) for c in cases))
```
Output:
```text
[1, 3, 4, 5, 10]
True
```
### javascript
```javascript
function siftDown(a, i, size) {
  for (;;) {
    let largest = i;
    for (const c of [2 * i + 1, 2 * i + 2]) {
      if (c < size && a[c] > a[largest]) largest = c;
    }
    if (largest === i) return;
    [a[i], a[largest]] = [a[largest], a[i]];
    i = largest;
  }
}

const a = [12, 11, 13, 5, 6, 7];
for (let i = Math.floor(a.length / 2) - 1; i >= 0; i--) siftDown(a, i, a.length);
console.log("heap", a.join(" "));
for (let end = a.length - 1; end > 0; end--) {
  [a[0], a[end]] = [a[end], a[0]];
  siftDown(a, 0, end);
  console.log("end", end, a.join(" "));
}
```
Output:
```text
heap 13 11 12 5 6 7
end 5 12 11 7 5 6 13
end 4 11 6 7 5 12 13
end 3 7 6 5 11 12 13
end 2 6 5 7 11 12 13
end 1 5 6 7 11 12 13
```

## quiz
1. What does heap sort do in each extraction step?
   - [ ] Inserts a new element
   - [x] Swaps the maximum to the end and sifts the new root down in the smaller heap
   - [ ] Reverses the array
   - [ ] Merges two halves
   > The sorted suffix grows by one element.
2. What is the extra space used by heap sort?
   - [ ] O(n)
   - [x] O(1)
   - [ ] O(log n)
   - [ ] O(n squared)
   > It sorts inside the array.
3. Is heap sort stable?
   - [ ] Yes
   - [x] No
   - [ ] Only for integers
   - [ ] Only for sorted input
   > Swaps across the array can reorder equal keys.
4. Why do libraries use heap sort inside introsort?
   - [ ] It is the fastest in practice
   - [x] It guarantees O(n log n) when quick sort recursion gets too deep
   - [ ] It is stable
   - [ ] It uses no comparisons
   > It provides a worst case safety net.
