# Singly Linked List Structure
kind: algorithm
time: O(1) to insert or remove at the head, O(n) to search, to reach the k-th element or to insert at the tail without a tail pointer, because nodes can only be reached by following links from the head.
space: O(n) for n nodes, each holding a value and one next reference, plus O(1) extra for traversals.
viz: linked-list-insert

## intro
A singly linked list stores a sequence as a chain of nodes, each holding a value and a reference to the next node. Unlike an array, the nodes can live anywhere in memory, so the list grows one node at a time and inserting at the front never shifts any elements. The price is that you cannot jump to the k-th element; you must walk there.

## theory
Anatomy of a singly linked list:

- Node: a small object with a data field and a next field that points to the following node or to nothing (null or None) at the end
- Head: a reference to the first node; an empty list has no head
- Optional tail reference and size counter, which make appends and length queries constant time
- The list is defined entirely by the head: lose it, and the rest of the nodes are unreachable

Core operations and costs:

- Push front: create a node whose next is the current head, then make it the head. O(1).
- Traverse: start at the head and follow next until you reach the end. O(n).
- Search by value: traverse and compare. O(n).
- Get the k-th element: follow k links. O(k).
- Insert after a node you already hold: link the new node to the successor, then link the node to the new node. O(1).
- Delete after a node you already hold: point the node to its successor's successor. O(1).
- Length: traverse, or keep a counter. O(n) or O(1).

Order of pointer updates matters. To insert node X after node P: first set `X.next = P.next`, then `P.next = X`. If you swap the two steps, the old successor of P is lost, and the rest of the list becomes unreachable.

Comparison with an array:

- Arrays give O(1) indexing and compact, cache-friendly storage; inserting or deleting in the middle shifts elements, O(n)
- Linked lists give O(1) insertion and deletion at a known position, no resizing, and no copying of elements when growing; but each node carries pointer overhead (8 bytes per reference on a 64-bit system), scattered memory hurts the CPU cache, and indexing is O(n)
- In practice, arrays and dynamic arrays beat linked lists for most workloads; linked lists shine when you hold node references and splice often, or when stable references to elements are needed while the collection changes

Typical code patterns:

- Walk with a cursor: `node = head; while node: ...; node = node.next`
- A dummy (sentinel) head node before the real head removes special cases for inserting or deleting at the front
- Two cursors (previous and current) allow deletion of the current node
- Always check for the empty list and the single-node list

Example: pushing 3, then 2, then 1 to the front produces the list 1 → 2 → 3, with length 3; searching for 2 takes two steps from the head, and searching for 9 walks the whole list and fails.

Memory behaviour: in languages with garbage collection, unreachable nodes are freed automatically; in C or C++ you must free removed nodes yourself and avoid dangling pointers. A singly linked list also cannot be traversed backwards without extra work.

Where it appears: the building block of stacks, queues, hash table buckets, adjacency lists in graphs and many operating system structures such as free lists.

## explain
1. Define a node with a value and a next reference.
2. Keep a head reference, null for the empty list.
3. To push at the front, create a node, set its next to the head, and move the head to it.
4. To traverse, start at the head and follow next until the end.
5. To insert or delete after a known node, update the next references in the safe order.
6. Handle the empty list and a single node explicitly.

## example
The Python class builds the list by pushing 3, 2 and 1 at the front, prints the values 1, 2 and 3, and reports the length 3; it also searches for 2, found after two steps, and for 9, which is not found after visiting all three nodes. The JavaScript function walks a list built from an array and returns the position of the first node greater than 10.

## real
Operating systems keep free memory blocks and process queues in linked lists, hash tables chain colliding keys in them, and undo histories link states with pointers.

## pros
- Constant time insertion and removal at the head
- Grows without reallocation or copying
- Stable node references while the list changes

## cons
- No random access, so reaching the k-th item takes k steps
- Each node carries pointer overhead
- Poor cache locality compared with arrays

## uses
- Implementing stacks and queues
- Chaining entries in hash table buckets
- Storing adjacency lists of graphs
- Managing free lists in allocators

## mistakes
- Updating next references in the wrong order and losing the rest of the list
- Forgetting the empty list case when reading head.next
- Losing the head reference during traversal
- Walking past the end because the loop condition checks the wrong node

## interview
**Q:** What is the time complexity of inserting at the head of a singly linked list?
**A:** O(1), because you create a node, point it at the old head and move the head reference, without touching any other node.

**Q:** Why is accessing the k-th element O(k) in a linked list?
**A:** Nodes are connected only by next references, so you must start at the head and follow k links; there is no address arithmetic as in an array.

**Q:** How do you insert a node after a given node safely?
**A:** First set the new node's next to the given node's next, then set the given node's next to the new node, so the rest of the list is never disconnected.

## summary
A singly linked list is a chain of nodes linked by next references, with O(1) head operations and O(n) searching and indexing. Updating references in the right order and handling empty lists are the essential skills.

## codenote
The Python sample implements a minimal list with push and search. The JavaScript sample walks an array-built list.

## code
### python
```python
class Node:
    def __init__(self, value, next_node=None):
        self.value = value
        self.next = next_node

class LinkedList:
    def __init__(self):
        self.head = None
        self.size = 0

    def push_front(self, value):
        self.head = Node(value, self.head)
        self.size += 1

    def values(self):
        out, node = [], self.head
        while node:
            out.append(node.value)
            node = node.next
        return out

    def find(self, target):
        steps, node = 0, self.head
        while node:
            steps += 1
            if node.value == target:
                return steps
            node = node.next
        return -steps

items = LinkedList()
for value in (3, 2, 1):
    items.push_front(value)
print(items.values(), items.size)
print(items.find(2), items.find(9))
```
Output:
```text
[1, 2, 3] 3
2 -3
```
### javascript
```javascript
function fromArray(values) {
  let head = null;
  for (let i = values.length - 1; i >= 0; i--) head = { value: values[i], next: head };
  return head;
}

function firstAbove(head, limit) {
  let position = 0;
  for (let node = head; node; node = node.next) {
    if (node.value > limit) return position;
    position++;
  }
  return -1;
}

const list = fromArray([4, 8, 15, 16, 23, 42]);
console.log(firstAbove(list, 10), firstAbove(list, 50));
```
Output:
```text
2 -1
```

## quiz
1. What does each node of a singly linked list contain?
   - [ ] Only a value
   - [x] A value and a reference to the next node
   - [ ] Two references
   - [ ] An index
   > The next reference chains the nodes together.
2. What is the cost of pushing at the head?
   - [ ] O(n)
   - [x] O(1)
   - [ ] O(log n)
   - [ ] O(n squared)
   > Only the new node and the head reference change.
3. Why does the order of pointer updates matter during insertion?
   - [ ] It affects the value stored
   - [x] The wrong order loses the rest of the list
   - [ ] It changes the node size
   - [ ] It makes the list circular
   > The successor must be saved in the new node before the link is replaced.
4. Which operation is slow compared with an array?
   - [ ] Pushing at the head
   - [x] Reading the k-th element
   - [ ] Inserting after a held node
   - [ ] Checking whether the list is empty
   > Reaching position k needs k link hops.

# Doubly Linked List Structure
kind: algorithm
time: O(1) to insert or remove at either end or next to a node you hold, because each node knows both neighbours; O(n) to search or to reach the k-th element.
space: O(n) with two references per node, so about twice the pointer overhead of a singly linked list.
viz: linked-list-insert

## intro
A doubly linked list gives every node two references, one to the next node and one to the previous node. That makes it possible to walk in both directions and, more importantly, to remove a node in constant time when you hold a reference to it, without searching for its predecessor.

## theory
Structure:

- Node: value, `prev` and `next`
- The list keeps a `head` and a `tail`, so both ends are reachable in O(1)
- The first node's prev and the last node's next are null, or point to sentinel nodes

Operations:

- Insert after node P: set `X.prev = P`, `X.next = P.next`, then fix the neighbour: if `P.next` exists set `P.next.prev = X`, finally `P.next = X`. If P was the tail, X becomes the tail.
- Remove node X: `X.prev.next = X.next` and `X.next.prev = X.prev`, with special cases when X is the head or the tail. No traversal needed, so the cost is O(1) when you already have X.
- Insert and remove at either end: O(1) with head and tail pointers
- Traverse forwards from head or backwards from tail: O(n)
- Search: O(n), though you can start from the nearer end when the position is known (about n / 2 steps at worst)

Sentinel nodes: use two dummy nodes, a head sentinel and a tail sentinel, that always exist. Then every real node has both neighbours, and insert and remove need no special cases for the ends. This is the style used in many production implementations and in the LRU cache design later in this module.

Costs and trade-offs against a singly linked list:

- Memory: one extra reference per node
- Updates touch more pointers, so there are more places to make mistakes; each insert changes up to four references and each removal changes two
- Removal of a held node is O(1) instead of O(n), and reverse traversal is natural

Invariant to test: for every node X with a next node Y, `Y.prev == X`. After each operation walk forwards and backwards and compare the sequences; a broken invariant shows up as different forward and backward lists.

Example: build 1, 2, 3 by appending, then remove the node holding 2: the forward values are 1, 3 and the backward values are 3, 1, and the length is 2. Removing the head leaves 3 only, and the head and tail then both point to it.

Uses: browsers move back and forward through history, text editors track cursor positions and undo stacks, music players navigate previous and next tracks, and caches that need to move entries to the front quickly use a doubly linked list together with a hash map. Language libraries expose it as `LinkedList` in Java and `std::list` in C++; Python's `collections.deque` is implemented as a doubly linked list of blocks.

## explain
1. Define a node with value, prev and next.
2. Create head and tail sentinel nodes that point to each other.
3. To insert between two nodes, link the new node to both neighbours and update both neighbours.
4. To remove a node, connect its previous and next nodes to each other.
5. Traverse forwards or backwards by following next or prev.
6. Check the invariant that next and prev agree after each change.

## example
The Python class appends 1, 2 and 3, removes the node holding 2 and prints the forward values 1 and 3 and the backward values 3 and 1. The JavaScript function reads the list from both ends to test whether the sequence 1, 2, 3, 2, 1 is a palindrome.

## real
Browser history, undo and redo stacks and music playlists navigate in both directions, and operating systems keep doubly linked lists of tasks and memory regions for quick removal.

## pros
- Constant time removal of a node you hold
- Traversal in both directions
- Both ends are reachable quickly

## cons
- Extra memory for the second reference
- More pointer updates and more chances for bugs
- Still no random access

## uses
- Browser history and undo redo navigation
- Caches that move entries to the front
- Playlist and carousel navigation
- Double-ended queues

## mistakes
- Updating next references but forgetting the matching prev references
- Special-casing the head or tail incorrectly instead of using sentinels
- Removing a node without clearing its own references, leaving a dangling link
- Reading prev of the head as if it always existed

## interview
**Q:** Why can a doubly linked list remove a node in O(1) when given the node?
**A:** The node holds a reference to its predecessor, so the predecessor and successor can be linked to each other directly, with no search for the predecessor.

**Q:** What are the costs of a doubly linked list compared with a singly linked list?
**A:** Each node needs an extra reference and every update changes more pointers, in exchange for backward traversal and O(1) deletion of a held node.

**Q:** What is the benefit of sentinel nodes?
**A:** They guarantee that every real node has two neighbours, so insert and remove need no special cases at the ends.

## summary
A doubly linked list links every node to both neighbours, which gives O(1) removal of a held node and traversal in both directions at the cost of extra memory and more pointer updates. Sentinels simplify edge cases.

## codenote
The Python sample uses sentinel nodes and checks forward and backward order. The JavaScript sample tests a palindrome from both ends.

## code
### python
```python
class DNode:
    def __init__(self, value=None):
        self.value, self.prev, self.next = value, None, None

class DoublyLinkedList:
    def __init__(self):
        self.head, self.tail = DNode(), DNode()
        self.head.next, self.tail.prev = self.tail, self.head

    def append(self, value):
        node, last = DNode(value), self.tail.prev
        node.prev, node.next = last, self.tail
        last.next = self.tail.prev = node
        return node

    def remove(self, node):
        node.prev.next, node.next.prev = node.next, node.prev

    def forward(self):
        out, node = [], self.head.next
        while node is not self.tail:
            out.append(node.value)
            node = node.next
        return out

    def backward(self):
        out, node = [], self.tail.prev
        while node is not self.head:
            out.append(node.value)
            node = node.prev
        return out

items = DoublyLinkedList()
nodes = [items.append(v) for v in (1, 2, 3)]
items.remove(nodes[1])
print(items.forward(), items.backward())
```
Output:
```text
[1, 3] [3, 1]
```
### javascript
```javascript
function build(values) {
  const nodes = values.map((value) => ({ value, prev: null, next: null }));
  nodes.forEach((node, i) => {
    node.prev = nodes[i - 1] ?? null;
    node.next = nodes[i + 1] ?? null;
  });
  return [nodes[0], nodes[nodes.length - 1]];
}

function isPalindrome(head, tail) {
  while (head && tail && head !== tail && head.prev !== tail) {
    if (head.value !== tail.value) return false;
    head = head.next;
    tail = tail.prev;
  }
  return true;
}

console.log(isPalindrome(...build([1, 2, 3, 2, 1])), isPalindrome(...build([1, 2, 3, 4])));
```
Output:
```text
true false
```

## quiz
1. What extra reference does a doubly linked node hold?
   - [ ] A reference to the head
   - [x] A reference to the previous node
   - [ ] A reference to the tail
   - [ ] A hash of the value
   > The prev reference enables backward traversal.
2. How long does removing a node you already hold take?
   - [ ] O(n)
   - [x] O(1)
   - [ ] O(log n)
   - [ ] O(n squared)
   > Its neighbours are linked to each other directly.
3. What do sentinel nodes remove?
   - [ ] The need for values
   - [x] Special cases at the ends of the list
   - [ ] The prev references
   - [ ] The head pointer
   > Every real node then has two neighbours.
4. Which invariant must hold between neighbouring nodes?
   - [ ] Values are equal
   - [x] If X.next is Y then Y.prev is X
   - [ ] Values are sorted
   - [ ] Both references are null
   > Inconsistent links make forward and backward traversals differ.

# Circular Linked List
kind: algorithm
time: O(1) to insert or remove at the head or tail when a tail reference is kept, O(n) to search or to go around the whole ring; a rotation by k positions costs O(k) hops or O(1) by moving the entry pointer.
space: O(n) for the nodes, with no null references because the last node points back to the first.

## intro
In a circular linked list the last node points back to the first instead of to null, so following next references never reaches an end. This is the natural shape for round-robin scheduling, rotating buffers of tasks and games such as the Josephus problem, where participants sit in a circle and the counting never stops.

## theory
Structure and variants:

- Singly circular: the last node's next is the head. Keeping a reference to the tail instead of the head lets you reach the head in one step (`tail.next`) and append in O(1) as well.
- Doubly circular: prev and next both wrap around, so you can walk either way around the ring
- A one-node list points to itself; an empty list has no entry node

Traversal needs a different stopping rule, since the usual test for null never succeeds. Start at an entry node and stop when you come back to it: with a do-while style loop, process the node, advance, and stop when the cursor equals the start. A loop that tests the condition first would skip the single-node case or never run on the first node.

Insertion and removal:

- Insert after the tail: new.next = tail.next (the head), tail.next = new, tail = new. O(1).
- Insert at the head: the same, without moving the tail pointer. O(1).
- Remove a node: find its predecessor (walk the ring), connect predecessor to successor; if the removed node was the only node, the list becomes empty; if it was the tail, move the tail pointer back to the predecessor
- Rotate: moving the entry pointer one step forward is a rotation by one in O(1)

Josephus problem: n people stand in a circle and every k-th person is eliminated until one remains. With n = 7 and k = 3 the elimination order is 3, 6, 2, 7, 5, 1 and the survivor is person 4. Simulating with a circular list takes O(n · k): move the cursor k − 1 steps, then delete the next node. A closed form recurrence `J(1) = 0`, `J(n) = (J(n − 1) + k) mod n` (zero-based) computes the survivor in O(n), and for k = 2 there is a bit trick for O(1).

Applications:

- Round-robin CPU scheduling: the scheduler cycles through tasks, giving each a time slice and moving on
- Ring buffers and playlists that repeat
- Multiplayer turn order
- Network token ring protocols
- Representing polygons by their vertex ring, and Fibonacci heaps use circular lists of roots

Dangers:

- Infinite loops: a traversal without a start check never ends
- Detecting a cycle in an ordinary list reports true here, by design; make sure your cycle detection logic knows the list is meant to be circular
- When removing the node that the tail or the cursor refers to, update those references first

Testing: an empty list, one node (points to itself), two nodes, removal of the head, removal of the tail and a full lap traversal that visits each node once.

## explain
1. Create nodes whose last next points back to the first.
2. Keep a reference to the tail so that both the head and the append position are cheap.
3. Traverse with a do-while loop that stops when the cursor returns to the start.
4. Insert by linking the new node between two existing nodes.
5. Remove by linking the predecessor to the successor and adjusting the tail.
6. Handle the empty and single-node ring.

## example
The Python function simulates the Josephus problem for seven people and every third elimination: the order is 3, 6, 2, 7, 5, 1 and the survivor is 4, and the recurrence gives the same survivor. The JavaScript function schedules three tasks round robin with time slices of two units and shows the sequence of runs until all finish.

## real
Operating system schedulers cycle through runnable tasks, audio software loops through ring buffers, and multiplayer games rotate turns among players.

## pros
- No end, so cyclic processing is natural
- O(1) append with a tail reference
- Every node has a successor, which simplifies rotation

## cons
- Easy to create infinite loops in traversals
- Removal needs care when the removed node is the entry point
- Generic cycle detection cannot distinguish intended rings

## uses
- Round-robin scheduling
- Ring buffers and repeating playlists
- Turn order in games
- Josephus-style elimination simulations

## mistakes
- Using a null check as the loop condition and never terminating
- Forgetting to update the tail when removing the last node
- Breaking the ring by leaving the last next as null after an insertion
- Not handling the single node that points to itself

## interview
**Q:** How do you traverse a circular linked list once?
**A:** Start at a node, process it, advance, and stop when the cursor returns to the starting node, using a do-while style loop so the first node is processed.

**Q:** Why keep a tail reference instead of a head reference?
**A:** The head is tail.next, so both ends are reachable in O(1) and appending takes constant time.

**Q:** How is the Josephus problem solved with a circular list?
**A:** Move the cursor k minus 1 steps around the ring, remove the next node, and repeat until one node remains; a recurrence also gives the survivor in O(n).

## summary
A circular linked list closes the chain so the last node points to the first, which suits round-robin and ring-shaped problems. Traversals need a return-to-start condition, and a tail reference makes appends constant time.

## codenote
The Python sample solves the Josephus problem with a ring. The JavaScript sample runs a round-robin schedule.

## code
### python
```python
class Node:
    def __init__(self, value):
        self.value, self.next = value, None

def josephus(people, step):
    nodes = [Node(p) for p in range(1, people + 1)]
    for i, node in enumerate(nodes):
        node.next = nodes[(i + 1) % people]
    cursor = nodes[-1]
    order = []
    while cursor.next is not cursor:
        for _ in range(step - 1):
            cursor = cursor.next
        order.append(cursor.next.value)
        cursor.next = cursor.next.next
    return order, cursor.value

def survivor(people, step):
    result = 0
    for n in range(2, people + 1):
        result = (result + step) % n
    return result + 1

print(josephus(7, 3), survivor(7, 3))
```
Output:
```text
([3, 6, 2, 7, 5, 1], 4) 4
```
### javascript
```javascript
function roundRobin(tasks, slice) {
  const queue = tasks.map(([name, remaining]) => ({ name, remaining }));
  const order = [];
  let i = 0;
  while (queue.length) {
    const task = queue[i];
    order.push(task.name);
    task.remaining -= slice;
    if (task.remaining <= 0) queue.splice(i, 1);
    else i++;
    if (i >= queue.length) i = 0;
  }
  return order;
}

console.log(roundRobin([["A", 3], ["B", 5], ["C", 2]], 2).join(" "));
```
Output:
```text
A B C A B B
```

## quiz
1. What does the last node of a circular list point to?
   - [ ] Null
   - [x] The first node
   - [ ] Itself always
   - [ ] The middle node
   > The ring has no end.
2. How does a traversal of a circular list know when to stop?
   - [ ] It reaches null
   - [x] The cursor returns to the starting node
   - [ ] The value is zero
   - [ ] The list is sorted
   > A null check would never succeed.
3. What does a tail reference give in a singly circular list?
   - [ ] Faster sorting
   - [x] Both the tail and the head, since the head is tail.next
   - [ ] Reverse traversal
   - [ ] A smaller memory use
   > Appending is then constant time too.
4. Who survives the Josephus problem with 7 people and every third eliminated?
   - [ ] Person 1
   - [ ] Person 7
   - [x] Person 4
   - [ ] Person 3
   > The elimination order is 3, 6, 2, 7, 5, 1.

# Insert at Head and Tail
kind: algorithm
time: O(1) at the head always; O(1) at the tail when a tail reference is kept, but O(n) when only a head reference exists because the whole list must be walked to find the last node.
space: O(1) extra per insertion, since only one new node is created.

## intro
Inserting at the two ends is the most frequent operation on linked lists, and the difference between a head-only list and a list with a tail reference is the difference between O(n) and O(1) appends. Getting the edge cases right, the empty list in particular, is the heart of this lesson.

## theory
Insert at head:

- Create a node whose next is the current head
- Make the new node the head
- If the list was empty, also set the tail to the new node (when a tail is kept)

Cost O(1). Inserting 1, 2, 3 at the head one after another produces 3 → 2 → 1, the reverse of the insertion order, which is exactly the behaviour of a stack.

Insert at tail without a tail reference:

- If the list is empty, the new node becomes the head
- Otherwise walk from the head until `node.next` is null, then link the new node there

Cost O(n) per append, so n appends cost O(n squared) overall, a common performance bug.

Insert at tail with a tail reference:

- Create the node; if the list is empty, set head and tail to it
- Otherwise set `tail.next = node` and `tail = node`

Cost O(1). Appending 1, 2, 3 yields 1 → 2 → 3, the order of insertion, which is the behaviour of a queue (add at the tail, remove at the head).

Counting work. Appending 1000 items without a tail reference walks roughly 0 + 1 + 2 + ... + 999, about half a million node visits in total, while with a tail reference it touches only the new node each time. The demonstration code counts the hops: for 5 appends without a tail the walk hops 0, 0, 1, 2 and 3 times, a total of 6.

Insert at a position:

- Position 0 is insertion at head
- Otherwise walk to the node at index position − 1, set `new.next = prev.next`, `prev.next = new`; cost O(position)
- Check bounds: a position beyond the length is an error, and a position equal to the length is an append
- Tracking size lets you validate the position quickly

Using a dummy head node simplifies all of these: with `dummy.next = head`, inserting at position i is always "walk i steps from dummy, then link", which covers the head case without a special branch, and the real head is `dummy.next` afterwards.

Doubly linked or circular variants use the same ideas with extra pointer updates.

Edge cases to test: empty list, one node, insert at the head of a non-empty list, append after several nodes, insert at an invalid position, and verification of the tail after removal and re-insertion.

Interfaces: most library lists provide `addFirst` and `addLast` (Java), `appendleft` and `append` (Python deque) and `push_front` and `push_back` (C++); knowing their costs helps pick the right structure.

## explain
1. For a head insertion, create a node pointing to the old head and update the head.
2. If a tail is kept and the list was empty, point the tail to the new node too.
3. For a tail insertion with a tail reference, link tail.next to the new node and advance the tail.
4. Without a tail reference, walk to the last node first.
5. For a position, walk to the previous node and link the new node in.
6. Test the empty and single-node cases and keep size and tail consistent.

## example
The Python class tracks head, tail and the number of hops used for appends: with a tail reference the five appends cost 0 hops each and give 1, 2, 3, 4, 5, while without it they cost 0, 0, 1, 2 and 3 hops, a total of 6. Head insertions of 1, 2, 3 give 3, 2, 1. The JavaScript function inserts at a given position using a dummy head node and prints the list after inserting 9 at position 0, 7 at position 2 and 5 at the end.

## real
Queues append at the tail and remove from the head, stacks push and pop at the head, and logging systems append entries at the tail of a chain while keeping the tail reference to avoid scanning.

## pros
- Head insertion is always constant time
- A tail reference makes appends constant time
- A dummy head removes most special cases

## cons
- Tail appends without a tail reference are linear
- A tail reference must be kept consistent after every removal
- Positional insertion still needs a walk

## uses
- Stacks that push at the head
- Queues that append at the tail
- Building a list in input order
- Inserting into sorted or indexed positions

## mistakes
- Appending by walking the list every time and getting quadratic behaviour
- Forgetting to set the tail when the first node is inserted
- Not updating the tail after removing the last node
- Allowing a position beyond the size without a check

## interview
**Q:** Why is appending to a singly linked list O(n) without a tail reference?
**A:** You must walk from the head to the last node to find where to link the new node, which takes time proportional to the length.

**Q:** What must you update when inserting the first node into an empty list that keeps a tail?
**A:** Both the head and the tail must point to the new node, and the size becomes one.

**Q:** How does a dummy head node simplify insertion?
**A:** It makes every position, including the first, have a preceding node, so the same walk and link code works without a special case for the head.

## summary
Head insertion is O(1) in every linked list, while tail insertion is O(1) only with a tail reference. Dummy nodes and careful updates of head, tail and size remove most edge-case bugs.

## codenote
The Python sample counts hops for appends with and without a tail. The JavaScript sample inserts at positions with a dummy head.

## code
### python
```python
class Node:
    def __init__(self, value):
        self.value, self.next = value, None

class Chain:
    def __init__(self, keep_tail):
        self.head = self.tail = None
        self.keep_tail, self.hops = keep_tail, 0

    def push_front(self, value):
        node = Node(value)
        node.next = self.head
        self.head = node
        if self.tail is None:
            self.tail = node

    def append(self, value):
        node = Node(value)
        if self.head is None:
            self.head = self.tail = node
        elif self.keep_tail:
            self.tail.next = node
            self.tail = node
        else:
            last = self.head
            while last.next:
                last = last.next
                self.hops += 1
            last.next = node

    def values(self):
        out, node = [], self.head
        while node:
            out.append(node.value)
            node = node.next
        return out

fast, slow, stack = Chain(True), Chain(False), Chain(True)
for value in range(1, 6):
    fast.append(value)
    slow.append(value)
for value in (1, 2, 3):
    stack.push_front(value)
print(fast.values(), fast.hops, slow.values(), slow.hops)
print(stack.values())
```
Output:
```text
[1, 2, 3, 4, 5] 0 [1, 2, 3, 4, 5] 6
[3, 2, 1]
```
### javascript
```javascript
function insertAt(head, position, value) {
  const dummy = { value: null, next: head };
  let before = dummy;
  for (let i = 0; i < position; i++) before = before.next;
  before.next = { value, next: before.next };
  return dummy.next;
}

function toArray(head) {
  const out = [];
  for (let node = head; node; node = node.next) out.push(node.value);
  return out;
}

let head = null;
for (const value of [3, 4]) head = insertAt(head, toArray(head).length, value);
head = insertAt(head, 0, 9);
head = insertAt(head, 2, 7);
head = insertAt(head, toArray(head).length, 5);
console.log(toArray(head).join(" "));
```
Output:
```text
9 3 7 4 5
```

## quiz
1. What is the cost of inserting at the head?
   - [ ] O(n)
   - [x] O(1)
   - [ ] O(log n)
   - [ ] O(n squared)
   > No node other than the new one is touched.
2. Why is tail insertion O(n) without a tail reference?
   - [ ] The list must be sorted
   - [x] The last node must be found by walking from the head
   - [ ] The head is null
   - [ ] The node is large
   > Finding the end takes time proportional to the length.
3. What happens when the first node is inserted into an empty list that keeps a tail?
   - [ ] Only the head is set
   - [x] Both head and tail refer to the new node
   - [ ] Only the tail is set
   - [ ] Neither is set
   > A one-node list has the same node at both ends.
4. What order does repeated head insertion of 1, 2, 3 produce?
   - [ ] 1, 2, 3
   - [x] 3, 2, 1
   - [ ] 2, 1, 3
   - [ ] Random
   > The most recently inserted node is at the front.

# Delete Node Operations
kind: algorithm
time: O(1) to delete the head or the node after a node you hold, O(n) to delete by value or to delete the tail of a singly linked list, because the predecessor must be found by walking.
space: O(1) extra, since deletion only relinks existing nodes.

## intro
Deleting a node from a linked list means making the previous node skip over it. The operation is simple in principle, yet many bugs hide here: deleting the head, deleting the only node, deleting the tail and forgetting that the predecessor is needed. A dummy node and a careful look at each case make deletion reliable.

## theory
Cases for a singly linked list:

- Delete the head: `head = head.next`. O(1). If the list had one node it becomes empty.
- Delete a node after a known node P: `P.next = P.next.next`. O(1).
- Delete by value: walk with a `previous` and `current` cursor; when `current.value` matches, set `previous.next = current.next`. If the match is the head, move the head instead. O(n).
- Delete the tail: walk to the node before the last one and set its next to null. O(n) in a singly linked list even with a tail reference, since the tail's predecessor cannot be reached directly.
- Delete at position k: walk k − 1 steps to the predecessor, then skip the node. O(k).

The dummy head technique removes the special case for the head: create `dummy` with `dummy.next = head`, run the same predecessor loop starting from the dummy, and return `dummy.next`. A single loop then handles deleting the head, the middle and the tail.

Deleting all nodes with a value. A common problem is to remove every occurrence, for example the value 6 from 1 → 2 → 6 → 3 → 6. With a dummy node and a loop that either skips the next node or advances, the result is 1 → 2 → 3 in one pass. The loop must not advance the cursor after a deletion, because the node that follows may also match; for a list 6 → 6 → 6 → 1 the head case is handled naturally by the dummy.

The trick of deleting a node given only a reference to it, not its predecessor: copy the next node's value into the node and delete the next node. This works for any node except the tail and changes the identity of nodes, so it is a puzzle solution rather than normal practice (other references to the next node become invalid).

Doubly linked lists delete a held node in O(1) using prev and next.

Memory: in garbage-collected languages the removed node is reclaimed once no references remain; in C or C++ you must free it and set freed pointers to null. A removed node that still points to the list can keep the rest alive in some languages, so clear its next reference when releasing nodes.

Verification: check the length before and after, the order of the remaining nodes, and the tail pointer, which must be updated when the last node is removed. Test deleting from an empty list, deleting a missing value (no change), deleting the only node and deleting several adjacent matches.

Complexity summary: O(1) when you hold the predecessor, O(n) when you must search for it; deleting by value always needs at least a search.

## explain
1. Create a dummy node in front of the head.
2. Walk with a cursor positioned on the node before the candidate.
3. If the candidate matches, link the cursor to the candidate's successor and do not advance.
4. Otherwise advance the cursor.
5. Return the dummy's next as the new head and fix the tail if the last node was removed.
6. Test empty, single, adjacent matches, head and tail deletions.

## example
The Python function removes every node equal to 6 from the list 1, 2, 6, 3, 6 in one pass and returns 1, 2, 3; deleting a missing value changes nothing, and deleting from 6, 6, 6, 1 leaves only 1. The JavaScript function deletes the node at a given position using a dummy head and prints 10, 30, 40 after deleting position 1 of 10, 20, 30, 40.

## real
Operating systems remove finished tasks from run queues, caches evict entries by unlinking them, and text editors remove characters stored in linked buffers.

## pros
- Deletion is cheap once the predecessor is known
- A dummy node unifies the head and middle cases
- No shifting of other elements

## cons
- Finding the predecessor needs a walk in a singly linked list
- Deleting the tail is linear without a doubly linked structure
- Easy to leave stale head or tail references

## uses
- Removing finished tasks from queues
- Cache eviction with doubly linked lists
- Filtering nodes by value
- Implementing pop operations

## mistakes
- Advancing the cursor after a deletion and skipping the next matching node
- Forgetting to update the head when the first node is deleted
- Leaving the tail pointing to a removed node
- Dereferencing next of a null node when the value is not found

## interview
**Q:** How do you delete all nodes with a given value in one pass?
**A:** Use a dummy node before the head and a cursor on the previous node: if the next node matches, skip it without advancing, otherwise advance the cursor; return dummy.next.

**Q:** Why is deleting the tail of a singly linked list O(n)?
**A:** The node before the tail must have its next set to null, and there is no reference from the tail back to it, so you have to walk from the head to find it.

**Q:** How can a node be deleted when you only have a reference to that node?
**A:** Copy the next node's value into it and unlink the next node, which works unless the node is the last one and changes which node holds the data.

## summary
Deleting a node relinks its predecessor to its successor, which is O(1) with the predecessor and O(n) to find it. A dummy head, a cursor that does not advance after a deletion and careful tail updates prevent the usual bugs.

## codenote
The Python sample removes all nodes with a value. The JavaScript sample deletes by position.

## code
### python
```python
class Node:
    def __init__(self, value, next_node=None):
        self.value, self.next = value, next_node

def build(values):
    head = None
    for value in reversed(values):
        head = Node(value, head)
    return head

def to_list(head):
    out = []
    while head:
        out.append(head.value)
        head = head.next
    return out

def remove_all(head, target):
    dummy = Node(None, head)
    before = dummy
    while before.next:
        if before.next.value == target:
            before.next = before.next.next
        else:
            before = before.next
    return dummy.next

print(to_list(remove_all(build([1, 2, 6, 3, 6]), 6)))
print(to_list(remove_all(build([6, 6, 6, 1]), 6)), to_list(remove_all(build([1, 2]), 9)))
```
Output:
```text
[1, 2, 3]
[1] [1, 2]
```
### javascript
```javascript
function deleteAt(head, position) {
  const dummy = { value: null, next: head };
  let before = dummy;
  for (let i = 0; i < position && before.next; i++) before = before.next;
  if (before.next) before.next = before.next.next;
  return dummy.next;
}

function fromArray(values) {
  return values.reduceRight((next, value) => ({ value, next }), null);
}

function toArray(head) {
  const out = [];
  for (let node = head; node; node = node.next) out.push(node.value);
  return out;
}

console.log(toArray(deleteAt(fromArray([10, 20, 30, 40]), 1)).join(" "));
```
Output:
```text
10 30 40
```

## quiz
1. What does deleting a node from a singly linked list do?
   - [ ] Clears its value only
   - [x] Makes its predecessor point to its successor
   - [ ] Reverses the list
   - [ ] Moves it to the tail
   > The node is skipped and becomes unreachable.
2. Why is a dummy head helpful for deletion?
   - [ ] It stores the length
   - [x] It lets the head be deleted with the same code as other nodes
   - [ ] It sorts the list
   - [ ] It avoids the cursor
   > Every real node then has a predecessor.
3. Why is deleting the tail O(n) in a singly linked list?
   - [ ] The tail is large
   - [x] Its predecessor must be found by walking from the head
   - [ ] The list must be sorted
   - [ ] The tail has no value
   > No reference leads backward from the tail.
4. Why does the cursor not advance after skipping a matching node?
   - [ ] To save time
   - [x] The following node might also match
   - [ ] The cursor would become null
   - [ ] The dummy would move
   > Advancing could skip a second consecutive match.

# Reverse Linked List
kind: algorithm
time: O(n) because every node is visited once, whether the reversal is done iteratively or recursively.
space: O(1) extra for the iterative version with three references, and O(n) call stack for the recursive version.

## intro
Reversing a linked list changes the direction of every link, so the last node becomes the head. It is one of the most asked linked list questions, because it exercises careful pointer handling and appears inside bigger problems such as palindrome checks, reorder list and reversing nodes in groups.

## theory
Iterative reversal. Keep three references: `previous` (starts null), `current` (starts at the head) and a temporary for the next node. For each node:

- Save `next = current.next`
- Reverse the link: `current.next = previous`
- Advance: `previous = current`, `current = next`

When `current` becomes null, `previous` is the new head. Trace for 1 → 2 → 3: after the first step the list is 1 → null with remaining 2 → 3; after the second 2 → 1 → null; after the third 3 → 2 → 1 → null. The order of the three assignments is essential: overwriting `current.next` before saving it loses the rest of the list.

Recursive reversal. Reverse the rest of the list, then attach the head at the end of the reversed part:

- Base case: an empty list or a single node is its own reverse
- Recursive step: `new_head = reverse(head.next)`, then `head.next.next = head` and `head.next = null`; return `new_head`

This uses O(n) stack space, so very long lists may overflow the call stack.

Variants built on the same step:

- Reverse a portion from position m to n: walk to the node before m, reverse n − m + 1 nodes using the iterative loop, then reconnect both ends. With the list 1 → 2 → 3 → 4 → 5 and the range 2 to 4 the result is 1 → 4 → 3 → 2 → 5.
- Reverse in groups of k: reverse each block of k nodes and connect the blocks; the leftover tail shorter than k stays as it is or is reversed according to the problem statement
- Palindrome check: find the middle, reverse the second half in place, compare both halves, and optionally restore the list
- Reorder list (L0 → Ln → L1 → Ln−1 ...): find the middle, reverse the second half and interleave
- Add two numbers stored in reverse digit order, or in forward order after reversing

Doubly linked lists reverse by swapping prev and next in every node and swapping the head and tail. Arrays can be reversed in place by swapping from the ends, which is simpler but needs random access.

Iterative versus recursive: iterative is preferred for production code because of constant space and no stack risk; recursive is elegant and shows the structure. Both are O(n) time.

Testing: the empty list, one node, two nodes (a common edge case where `head.next.next` is used), a long list, and verification that the old head now has next null (otherwise a cycle forms).

A frequent bug is forgetting to set the old head's next to null in the recursive version, which creates a cycle between the first two nodes.

## explain
1. Set previous to null and current to the head.
2. While current exists, save its next node.
3. Point current.next at previous.
4. Move previous to current and current to the saved next.
5. Return previous as the new head.
6. For partial reversals, reverse only the chosen segment and reconnect its ends.

## example
The Python functions reverse 1, 2, 3, 4, 5 iteratively and recursively and both give 5, 4, 3, 2, 1, and the empty and one-node lists are unchanged. The JavaScript function reverses positions 2 to 4 of 1, 2, 3, 4, 5 and prints 1, 4, 3, 2, 5.

## real
Reversal is used in undo logic, in algorithms that read linked data backwards such as big-number addition on digit chains, and in palindrome checks of linked data without extra memory.

## pros
- Linear time with constant extra space when iterative
- Building block for many other list algorithms
- Works in place without copying values

## cons
- Easy to break by overwriting next too early
- Recursive form risks stack overflow on long lists
- Partial reversal needs careful reconnection

## uses
- Reversing the order of a chain in place
- Checking palindromes in linked data
- Reordering and interleaving nodes
- Reversing groups or ranges of nodes

## mistakes
- Overwriting current.next before saving the next node
- Forgetting to set the old head's next to null in the recursive version
- Returning the old head instead of the previous reference
- Mishandling the boundary links in partial reversal

## interview
**Q:** How do you reverse a singly linked list in place?
**A:** Walk through the list with previous and current references, saving the next node, pointing current.next to previous and advancing both; the final previous is the new head. Time is O(n) and space O(1).

**Q:** What is the space cost of the recursive reversal?
**A:** O(n) for the call stack, because each node adds one frame before the recursion unwinds.

**Q:** How can reversal help check whether a list is a palindrome?
**A:** Find the middle with slow and fast references, reverse the second half in place, compare it node by node with the first half, and optionally reverse it back.

## summary
Reversing a linked list walks the nodes once and flips each next reference, using three references and O(1) space in the iterative form. The same step underlies range reversal, palindrome checks and list reordering.

## codenote
The Python sample reverses iteratively and recursively. The JavaScript sample reverses a range.

## code
### python
```python
class Node:
    def __init__(self, value, next_node=None):
        self.value, self.next = value, next_node

def build(values):
    head = None
    for value in reversed(values):
        head = Node(value, head)
    return head

def to_list(head):
    out = []
    while head:
        out.append(head.value)
        head = head.next
    return out

def reverse_iterative(head):
    previous = None
    while head:
        head.next, previous, head = previous, head, head.next
    return previous

def reverse_recursive(head):
    if head is None or head.next is None:
        return head
    new_head = reverse_recursive(head.next)
    head.next.next = head
    head.next = None
    return new_head

print(to_list(reverse_iterative(build([1, 2, 3, 4, 5]))))
print(to_list(reverse_recursive(build([1, 2, 3, 4, 5]))))
print(to_list(reverse_iterative(None)), to_list(reverse_iterative(build([7]))))
```
Output:
```text
[5, 4, 3, 2, 1]
[5, 4, 3, 2, 1]
[] [7]
```
### javascript
```javascript
function reverseBetween(head, left, right) {
  const dummy = { value: null, next: head };
  let before = dummy;
  for (let i = 1; i < left; i++) before = before.next;
  let previous = null;
  let current = before.next;
  for (let i = left; i <= right; i++) {
    const next = current.next;
    current.next = previous;
    previous = current;
    current = next;
  }
  before.next.next = current;
  before.next = previous;
  return dummy.next;
}

const head = [1, 2, 3, 4, 5].reduceRight((next, value) => ({ value, next }), null);
const out = [];
for (let node = reverseBetween(head, 2, 4); node; node = node.next) out.push(node.value);
console.log(out.join(" "));
```
Output:
```text
1 4 3 2 5
```

## quiz
1. How many references does the iterative reversal keep while walking?
   - [ ] One
   - [x] Previous, current and the saved next
   - [ ] Two stacks
   - [ ] A full copy of the list
   > The saved next prevents losing the remainder of the list.
2. What is the space cost of iterative reversal?
   - [ ] O(n)
   - [x] O(1)
   - [ ] O(log n)
   - [ ] O(n squared)
   > Only a few references are kept.
3. Which mistake creates a cycle in the recursive version?
   - [ ] Returning the new head
   - [x] Not setting the old head's next to null
   - [ ] Testing the empty list
   - [ ] Using a dummy node
   > The first two nodes would point to each other.
4. What is the result of reversing positions 2 to 4 of 1, 2, 3, 4, 5?
   - [ ] 5, 4, 3, 2, 1
   - [x] 1, 4, 3, 2, 5
   - [ ] 1, 2, 4, 3, 5
   - [ ] 2, 1, 3, 4, 5
   > Only the middle segment is reversed.
