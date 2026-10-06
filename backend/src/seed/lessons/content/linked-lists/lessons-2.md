# Detect Cycle Floyd
kind: algorithm
time: O(n) because the fast pointer meets the slow pointer within a number of steps proportional to the list length, and finding the cycle start adds another linear pass.
space: O(1) since only two references are used, in contrast to the O(n) hash set approach.

## intro
A linked list has a cycle when following next references eventually leads back to a node already visited, so the walk never ends. Floyd's tortoise and hare algorithm detects this with two pointers and no extra memory: the slow pointer moves one step at a time, the fast pointer two, and if there is a cycle they must meet.

## theory
Algorithm:

- Start both pointers at the head
- Repeat: move `slow` by one node and `fast` by two nodes
- If `fast` or `fast.next` becomes null, the list ends and there is no cycle
- If `slow` and `fast` ever refer to the same node, there is a cycle

Why they meet: once both pointers are inside the cycle, the distance between them (measured around the cycle) shrinks by one in every step, because the fast pointer gains one node per step. A gap of d closes in d steps, so they cannot jump over each other and must meet. If the cycle has length c, the meeting happens within c steps after the slow pointer enters, so the total number of steps is O(n).

Finding the cycle length: after the meeting, keep one pointer fixed and move the other around until they meet again, counting the steps.

Finding the start of the cycle: let the head be at distance a from the cycle start, and the meeting point at distance b past the start inside the cycle, with cycle length c. When they meet, slow has travelled `a + b`, fast has travelled `2(a + b)`, and the difference `a + b` is a whole number of laps: `a + b = k · c`. Therefore `a = k · c − b`, which means that a pointer starting at the head and a pointer starting at the meeting point, both moving one step at a time, arrive at the cycle start together after a steps. The second phase: reset one pointer to the head, move both pointers one step at a time, and the node where they meet is the cycle start.

Example: the list 1 → 2 → 3 → 4 → 5 → 6 → back to 3. Detection returns true, the cycle starts at the node holding 3, and the cycle length is 4 (3, 4, 5, 6). For a plain list 1 → 2 → 3 the fast pointer reaches the end, so the answer is false.

Alternatives and their costs:

- Hash set of visited nodes: O(n) time and O(n) memory, simple and returns the first repeated node directly
- Marking nodes (modifying the list): O(1) memory but destroys data and is unsafe for shared structures
- Brent's algorithm: a variation with teleporting pointer that uses fewer node accesses
- Floyd's algorithm is the standard answer when constant memory is required

Beyond lists: the same idea finds duplicates in an array of n + 1 numbers in the range 1 to n by treating `i → a[i]` as a next pointer (the duplicate is the cycle entrance), for example the duplicate of 2 in 1, 3, 4, 2, 2 and of 3 in 3, 1, 3, 4, 2, and it detects cycles in pseudo-random number generators and iterated functions (Pollard's rho factoring uses it).

Edge cases: empty list, one node pointing to itself (cycle of length 1), two nodes pointing to each other, and a cycle whose start is the head (a = 0).

Testing tip: build lists of various lengths with every possible cycle start and check the detection against a hash set version.

## explain
1. Set slow and fast to the head.
2. Move slow one step and fast two steps while fast and fast.next exist.
3. If they meet, a cycle exists; otherwise the list ends.
4. To find the start, reset one pointer to the head and move both one step at a time until they meet.
5. To measure the length, move one pointer around the cycle until it returns.
6. Test lists with no cycle, a self loop and a cycle at the head.

## example
The Python functions build the list 1, 2, 3, 4, 5, 6 with the last node linked back to the node holding 3 and report that a cycle exists, that it starts at the node with value 3 and that its length is 4; a plain list reports no cycle. The JavaScript function treats an array as a next pointer function and finds the duplicate values 2 and 3 in two arrays.

## real
Memory debuggers use cycle detection to find circular references, garbage collectors and serializers must avoid infinite loops on cyclic structures, and Pollard's rho algorithm uses the idea to factor integers.

## pros
- Detects a cycle using only two references
- Linear time
- Also locates the cycle start and length

## cons
- Less direct than a hash set for reporting all repeated nodes
- The proof for the cycle start is subtle
- Only detects cycles reachable from the starting node

## uses
- Detecting infinite loops in linked data
- Finding the entry node of a cycle
- Finding the duplicate number in an array
- Cycle detection in iterated functions

## mistakes
- Not checking fast.next before moving fast two steps
- Starting the second phase from the meeting point for both pointers
- Using a hash set when the problem requires constant memory
- Comparing node values instead of node identities

## interview
**Q:** How do the tortoise and hare pointers prove that a cycle exists?
**A:** A slow pointer advances one node and a fast pointer two nodes per step; if the list has a cycle the fast pointer laps the slow one and they meet, otherwise the fast pointer reaches the end.

**Q:** How is the entry node of a cycle located after detection?
**A:** After the pointers meet, move one pointer back to the head and advance both one step at a time; they meet at the cycle start because the distance from the head to the start equals the distance from the meeting point to the start going around the cycle.

**Q:** Why compare nodes rather than values?
**A:** Different nodes may hold equal values, so only reference identity shows that the walk has returned to a node it already visited.

## summary
Floyd's tortoise and hare detects a cycle in O(n) time and O(1) space by moving two pointers at different speeds, and a second pass finds where the cycle begins. The same idea finds duplicates in arrays and cycles in iterated functions.

## codenote
The Python sample detects, measures and locates a cycle. The JavaScript sample finds a duplicate number with the same technique.

## code
### python
```python
class Node:
    def __init__(self, value):
        self.value, self.next = value, None

def make(values, cycle_to=None):
    nodes = [Node(v) for v in values]
    for a, b in zip(nodes, nodes[1:]):
        a.next = b
    if cycle_to is not None:
        nodes[-1].next = nodes[cycle_to]
    return nodes[0]

def analyse(head):
    slow = fast = head
    while fast and fast.next:
        slow, fast = slow.next, fast.next.next
        if slow is fast:
            length, probe = 1, slow.next
            while probe is not slow:
                probe, length = probe.next, length + 1
            start, meet = head, slow
            while start is not meet:
                start, meet = start.next, meet.next
            return True, start.value, length
    return False, None, 0

print(analyse(make([1, 2, 3, 4, 5, 6], cycle_to=2)))
print(analyse(make([1, 2, 3])))
```
Output:
```text
(True, 3, 4)
(False, None, 0)
```
### javascript
```javascript
function findDuplicate(numbers) {
  let slow = numbers[0];
  let fast = numbers[0];
  do {
    slow = numbers[slow];
    fast = numbers[numbers[fast]];
  } while (slow !== fast);
  slow = numbers[0];
  while (slow !== fast) {
    slow = numbers[slow];
    fast = numbers[fast];
  }
  return slow;
}

console.log(findDuplicate([1, 3, 4, 2, 2]), findDuplicate([3, 1, 3, 4, 2]));
```
Output:
```text
2 3
```

## quiz
1. How fast does the fast pointer move in Floyd's algorithm?
   - [ ] One node per step
   - [x] Two nodes per step
   - [ ] Three nodes per step
   - [ ] Backwards
   > It gains one node per step on the slow pointer.
2. What does it mean if the fast pointer reaches null?
   - [ ] There is a cycle
   - [x] The list has no cycle
   - [ ] The list is sorted
   - [ ] The pointers met
   > A cycle has no end for the pointer to reach.
3. What is the space complexity of Floyd's algorithm?
   - [ ] O(n)
   - [x] O(1)
   - [ ] O(log n)
   - [ ] O(n squared)
   > Only two references are stored.
4. How is the cycle start found after the pointers meet?
   - [ ] By sorting the nodes
   - [x] Move one pointer to the head and advance both one step at a time until they meet
   - [ ] By doubling the speed
   - [ ] By reversing the list
   > The head-to-start distance equals the meeting-point-to-start distance around the cycle.

# Find Middle Node
kind: algorithm
time: O(n) with a single pass using the slow and fast pointer technique, compared with two passes when counting the length first; both are linear.
space: O(1), because only two references are kept.

## intro
Finding the middle node of a linked list is a small problem with a big idea: use two pointers that move at different speeds, so that when the faster one reaches the end, the slower one is halfway. The technique avoids counting the length first and returns in a single pass, and it is the first step of many bigger algorithms.

## theory
Slow and fast pointers:

- Start both at the head
- While `fast` and `fast.next` exist: move `slow` one node and `fast` two nodes
- When the loop stops, `slow` is at the middle

For a list with an odd number of nodes, slow ends at the exact middle: for 1 → 2 → 3 → 4 → 5 the answer is 3. For an even number of nodes there are two middles, and the standard loop returns the second one: for 1 → 2 → 3 → 4 → 5 → 6 it returns 4. If you need the first middle (3 in the list of six nodes), change the loop condition to `fast.next and fast.next.next`, or stop one step earlier. Always read the problem statement to know which middle it wants, because the choice also changes how you split the list.

Why it works: fast travels at twice the speed, so after k steps slow has moved k nodes and fast 2k nodes. The loop ends when fast has covered the whole list, about n nodes, meaning k is about n / 2.

Comparison with the counting method: count n in one pass, then walk n / 2 steps in a second pass. Both are O(n), but the pointer method makes one pass over the list (about n / 2 steps for slow and n for fast), which matters when traversal is costly, for example when nodes are fetched from disk or from a stream.

Where the middle is needed:

- Merge sort on a linked list: split at the middle (cut the list by setting the previous node's next to null), sort each half recursively and merge. Sorting a linked list this way takes O(n log n) time with O(log n) stack space and no random access.
- Palindrome check: find the middle, reverse the second half, compare with the first half
- Reorder list: find the middle, reverse the second half and interleave
- Convert a sorted list to a balanced binary search tree: use the middle node as the root of each subtree
- Detect the median of data stored in a list

Splitting detail: to cut the list into two halves, track the node before the slow pointer (`prev`), then set `prev.next = null` so that the first half ends before the middle. For a one-node list the first half is empty and the second half has the node, so check the base case before splitting.

Edge cases: empty list (no middle), one node (it is the middle), two nodes (the middle is the second node with the standard loop), and very long lists where counting would overflow a small counter.

Doubly linked lists with both a head and a tail can find the middle by moving inwards from both ends.

Testing: lists of length 1 to 8, verifying that the returned position equals the integer division of the length, and that the split halves have sizes differing by at most one.

## explain
1. Set slow and fast to the head.
2. While fast and fast.next exist, move slow one step and fast two steps.
3. Return slow as the middle (second middle for even lengths).
4. For the first middle, use the condition fast.next and fast.next.next.
5. To split, remember the node before slow and set its next to null.
6. Test lengths 1 to 8 for both versions.

## example
The Python functions return the middle value 3 for the list 1 to 5, the second middle 4 for the list 1 to 6, and the first middle 3 for the list 1 to 6, and the split of the list 1 to 6 gives halves 1, 2, 3 and 4, 5, 6. The JavaScript function prints the middle value for lists of length 1 to 6, showing the second middle for even lengths.

## real
Merge sort for linked lists, database systems that split sorted runs and balanced tree builders all start by locating the middle of a chain.

## pros
- One traversal without knowing the length in advance
- Needs only two references and no counter
- Reusable as the first step of many list algorithms

## cons
- Even-length lists have two middles that must be handled consistently
- Fast pointer null checks are easy to get wrong
- Splitting needs the node before the middle

## uses
- Splitting lists for merge sort
- Palindrome checks on linked data
- Building balanced trees from sorted lists
- Reordering lists

## mistakes
- Dereferencing fast.next.next without checking fast.next
- Returning the wrong middle for even lengths
- Forgetting to cut the first half's last next reference when splitting
- Counting the length and then walking from the head in code that must be single pass

## interview
**Q:** How do you find the middle of a linked list in one pass?
**A:** Move a slow pointer one node and a fast pointer two nodes at a time; when the fast pointer reaches the end, the slow pointer is at the middle.

**Q:** Which middle does the standard loop return for an even-length list?
**A:** The second of the two middle nodes, such as 4 for the list 1 to 6; use a stricter loop condition to get the first.

**Q:** How is the middle used in sorting a linked list?
**A:** The list is split at the middle, each half is sorted recursively and the sorted halves are merged, giving O(n log n) time without random access.

## summary
The slow and fast pointer technique finds the middle of a linked list in one pass and constant space. Decide which middle you need for even lengths and cut the list correctly when splitting.

## codenote
The Python sample returns both middles and splits a list. The JavaScript sample shows the middle for several lengths.

## code
### python
```python
class Node:
    def __init__(self, value, next_node=None):
        self.value, self.next = value, next_node

def build(count):
    head = None
    for value in range(count, 0, -1):
        head = Node(value, head)
    return head

def second_middle(head):
    slow = fast = head
    while fast and fast.next:
        slow, fast = slow.next, fast.next.next
    return slow.value

def first_middle(head):
    slow = fast = head
    while fast.next and fast.next.next:
        slow, fast = slow.next, fast.next.next
    return slow.value

def split(head):
    before, slow, fast = None, head, head
    while fast and fast.next:
        before, slow, fast = slow, slow.next, fast.next.next
    before.next = None
    return head, slow

def values(head):
    out = []
    while head:
        out.append(head.value)
        head = head.next
    return out

print(second_middle(build(5)), second_middle(build(6)), first_middle(build(6)))
left, right = split(build(6))
print(values(left), values(right))
```
Output:
```text
3 4 3
[1, 2, 3] [4, 5, 6]
```
### javascript
```javascript
function middleValue(count) {
  let head = null;
  for (let value = count; value >= 1; value--) head = { value, next: head };
  let slow = head;
  let fast = head;
  while (fast && fast.next) {
    slow = slow.next;
    fast = fast.next.next;
  }
  return slow.value;
}

console.log([1, 2, 3, 4, 5, 6].map(middleValue).join(" "));
```
Output:
```text
1 2 2 3 3 4
```

## quiz
1. Where is the slow pointer when the fast pointer reaches the end?
   - [ ] At the head
   - [x] At the middle
   - [ ] At the tail
   - [ ] At null
   > Fast moves twice as far as slow.
2. Which middle does the standard loop return for the list 1 to 6?
   - [ ] 3
   - [x] 4
   - [ ] 2
   - [ ] 5
   > The second of the two middles is returned.
3. What must be done to split a list at the middle?
   - [ ] Reverse the list
   - [x] Set the next of the node before the middle to null
   - [ ] Double the speed of the fast pointer
   - [ ] Delete the head
   > Otherwise the first half would still be linked to the second.
4. How many passes does the pointer technique need?
   - [ ] Two
   - [x] One
   - [ ] Three
   - [ ] n
   > It does not need the length in advance.

# Merge Two Sorted Lists
kind: algorithm
time: O(n + m) for lists of lengths n and m, since every node is attached exactly once.
space: O(1) extra when nodes are relinked in place, or O(n + m) for the recursive version's call stack.
practice: merge-two-sorted-arrays

## intro
Given two linked lists that are each sorted, produce a single sorted list. Because linked nodes can simply be relinked, the merge needs no copying and no extra array: it walks both lists, always attaching the smaller front node to the result. It is the combine step of merge sort for linked lists and a staple of interviews.

## theory
Iterative merge with a dummy node:

- Create a dummy node and a `tail` reference pointing to it
- While both lists have nodes: if `a.value <= b.value`, attach `a` to `tail.next` and advance `a`; otherwise attach `b` and advance `b`; then advance `tail`
- When one list runs out, attach the remainder of the other list in one step, since it is already sorted
- Return `dummy.next`

Taking `a` on ties keeps the merge stable (equal values from the first list come first). The dummy node removes the special case of choosing the first node.

Example: merging 1 → 2 → 4 with 1 → 3 → 4 gives 1 → 1 → 2 → 3 → 4 → 4. Merging 2 → 5 → 8 with 1 → 6 → 9 → 10 gives 1, 2, 5, 6, 8, 9, 10: the nodes alternate between the lists according to value, and the last nodes of the longer list are attached as a block.

Recursive merge:

- If one list is empty, return the other
- If `a.value <= b.value`, set `a.next = merge(a.next, b)` and return `a`; otherwise `b.next = merge(a, b.next)` and return `b`

It is elegant but uses O(n + m) stack space, which can overflow on long lists.

Complexity: each loop iteration moves one node into the result, so the number of iterations is at most n + m, which gives O(n + m) time. Only a few references are stored, so the iterative form is O(1) space because the nodes are reused rather than copied.

Uses and extensions:

- Merge sort on a linked list: split at the middle, sort halves, merge
- Merge k sorted lists: repeatedly merge pairs (divide and conquer, O(N log k) for N total nodes) or use a min-heap of the k heads (also O(N log k))
- Merge two sorted arrays (the same algorithm with indices, but an extra array is needed unless merging from the back)
- Insertion sort for lists uses the same idea of inserting a node into a sorted prefix
- Union of two sorted sets, or intersection by advancing the smaller side and keeping equal values

Pitfalls: forgetting to attach the leftover nodes, leaving the last node of the result pointing at an old node that creates an accidental cycle (when the leftover tail was already linked this does not matter, but when building with new nodes ensure the final next is null), and mixing up which list is advanced after a comparison.

Testing: one or both lists empty, all values of one list smaller than the other, identical lists and lists with duplicates.

## explain
1. Create a dummy node and a tail reference.
2. Compare the front nodes of both lists.
3. Attach the smaller node to the tail and advance that list and the tail.
4. When a list ends, attach the rest of the other list.
5. Return the dummy's next.
6. Test empty lists, disjoint ranges and duplicates.

## example
The Python function merges 1, 2, 4 with 1, 3, 4 into 1, 1, 2, 3, 4, 4, handles an empty list by returning the other one and merges 5, 6 with 1, 2 into 1, 2, 5, 6. The JavaScript recursive function merges 2, 5, 8 with 1, 6, 9, 10 into 1, 2, 5, 6, 8, 9, 10.

## real
Databases merge sorted runs from disk, search engines merge posting lists of documents, and version control tools merge sorted sequences of changes.

## pros
- Linear time with relinking and no copying
- Stable when ties favour the first list
- Core step of linked list merge sort

## cons
- Requires both inputs to be sorted
- The recursive version can overflow the stack
- Pointer errors can create cycles or lose nodes

## uses
- Merging two sorted chains
- Sorting linked lists with merge sort
- Merging k sorted lists
- Combining sorted result sets

## mistakes
- Forgetting to append the remaining nodes of the longer list
- Advancing the wrong list after a comparison
- Not using a dummy node and mishandling the first node
- Merging lists that are not sorted

## interview
**Q:** How do you merge two sorted linked lists in place?
**A:** Use a dummy node and a tail reference; repeatedly attach the smaller front node of the two lists and advance, then attach the remaining list, giving O(n + m) time and O(1) space.

**Q:** How would you merge k sorted lists?
**A:** Either merge them pairwise in rounds, like a tournament, or keep the k current heads in a min-heap and repeatedly extract the smallest; both take O(N log k) for N total nodes.

**Q:** What is the advantage of a dummy node in merging?
**A:** It avoids special handling for choosing the first node of the result, since the result is always built by appending to the tail starting from the dummy.

## summary
Merging two sorted lists relinks the smaller front node repeatedly in O(n + m) time and O(1) space. A dummy node simplifies the code, and the same step drives linked list merge sort and k-way merges.

## codenote
The Python sample merges iteratively with a dummy node. The JavaScript sample merges recursively.

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

def merge(a, b):
    dummy = tail = Node(None)
    while a and b:
        if a.value <= b.value:
            tail.next, a = a, a.next
        else:
            tail.next, b = b, b.next
        tail = tail.next
    tail.next = a or b
    return dummy.next

print(to_list(merge(build([1, 2, 4]), build([1, 3, 4]))))
print(to_list(merge(None, build([7, 8]))), to_list(merge(build([5, 6]), build([1, 2]))))
```
Output:
```text
[1, 1, 2, 3, 4, 4]
[7, 8] [1, 2, 5, 6]
```
### javascript
```javascript
function merge(a, b) {
  if (!a) return b;
  if (!b) return a;
  if (a.value <= b.value) {
    a.next = merge(a.next, b);
    return a;
  }
  b.next = merge(a, b.next);
  return b;
}

const build = (values) => values.reduceRight((next, value) => ({ value, next }), null);
const out = [];
for (let node = merge(build([2, 5, 8]), build([1, 6, 9, 10])); node; node = node.next) out.push(node.value);
console.log(out.join(" "));
```
Output:
```text
1 2 5 6 8 9 10
```

## quiz
1. Which node is attached to the result at each step?
   - [ ] The larger front node
   - [x] The smaller front node
   - [ ] The head of the first list always
   - [ ] A random node
   > Choosing the smaller front keeps the result sorted.
2. What happens when one list is exhausted?
   - [ ] The merge restarts
   - [x] The remainder of the other list is attached as it is
   - [ ] The remainder is discarded
   - [ ] The result is sorted again
   > The leftover nodes are already in order.
3. What is the space complexity of the iterative merge?
   - [ ] O(n + m)
   - [x] O(1)
   - [ ] O(log n)
   - [ ] O(n squared)
   > Nodes are relinked rather than copied.
4. What keeps the merge stable?
   - [ ] Sorting the result at the end
   - [x] Taking from the first list when values are equal
   - [ ] Using a hash table
   - [ ] Reversing the second list
   > Equal values from the first list stay ahead.

# Remove Nth From End
kind: algorithm
time: O(L) for a list of length L, in a single pass with two pointers that keep a fixed gap of n nodes.
space: O(1) extra, since only two references and a dummy node are used.

## intro
Remove the n-th node counting from the end of a linked list. If you know the length, it is easy: delete the node at position length − n. The classic trick does it in one pass without knowing the length, by moving two pointers that are n nodes apart, so when the leading pointer reaches the end, the trailing one stands just before the node to delete.

## theory
Two-pointer gap method:

- Create a dummy node before the head and set both `fast` and `slow` to it
- Move `fast` forward n steps; now it is n nodes ahead of `slow`
- Move both one step at a time until `fast.next` is null (fast is at the last node)
- Now `slow.next` is the node to remove: set `slow.next = slow.next.next`
- Return `dummy.next`

Why the gap works: the distance between the pointers stays n, so when fast is on the last node, slow is on the node that precedes the n-th from the end (the node n positions behind the last, in the sense that there are n − 1 nodes between slow.next and the end). The dummy node makes deleting the head, the case n equal to the length, the same as any other deletion.

Example: from 1 → 2 → 3 → 4 → 5 remove the 2nd from the end (the node 4): the result is 1 → 2 → 3 → 5. Removing the 5th from the end removes the head, leaving 2 → 3 → 4 → 5. For a one-node list with n = 1 the result is the empty list.

Alternative with the length: walk once to count L, then walk L − n steps to the predecessor and unlink. This is two passes, still O(L), and simple; the one-pass version is about elegance and about streams where you cannot revisit nodes.

Validation: assume 1 ≤ n ≤ L as in the common statement; if n can exceed L, the fast pointer would run past the end while advancing, and you should check for null and return the list unchanged.

Related problems using the gap idea:

- Find the n-th node from the end without deleting it
- Rotate a list by k places: find the node k from the end, make it the new head and link the old tail to the old head (use k mod length)
- Swap the k-th node from the start with the k-th from the end
- Find the middle (gap of half the distance, using different speeds instead)
- Intersection of two lists: move the longer list's pointer ahead by the difference in length

Common bugs: forgetting the dummy node and failing when the head is removed, moving fast n + 1 steps in one variant but not adjusting the loop condition, and dereferencing `fast.next` when fast is null.

Two equivalent formulations: stop when fast is null and use `slow` as the node to delete after tracking its previous node, or stop when fast.next is null and use slow as the predecessor. The second is shorter with the dummy node.

Testing: n equal to 1 (remove the tail), n equal to the length (remove the head), one-node list, two-node list, middle removal.

## explain
1. Create a dummy node pointing at the head and set slow and fast to it.
2. Advance fast by n steps.
3. Advance both pointers until fast.next is null.
4. Remove the node after slow by linking slow.next to slow.next.next.
5. Return dummy.next.
6. Test n at both extremes and one-node lists.

## example
The Python function removes the 2nd node from the end of 1 to 5 giving 1, 2, 3, 5, removes the 5th (the head) giving 2, 3, 4, 5, and removes the only node of a one-node list giving an empty list. The JavaScript function removes the last node (n = 1) from 10, 20, 30 and prints 10, 20.

## real
Streaming systems that keep a trailing window, undo features that discard the n-th most recent step, and playlists that remove the n-th from last item use the same gap technique.

## pros
- Finds the target in one traversal of the list
- Uses just two pointers plus a dummy node
- A dummy node covers the head removal case

## cons
- Off-by-one errors with the gap are common
- Assumes n is valid unless extra checks are added
- Not more efficient than the two-pass method in big-O terms

## uses
- Removing the n-th node from the end
- Finding the n-th node from the end
- Rotating lists
- Aligning two lists of different lengths

## mistakes
- Not using a dummy node, which breaks when the head must be removed
- Advancing fast one step too few or too many
- Not handling n larger than the length
- Using the node itself rather than its predecessor for the removal

## interview
**Q:** How do you remove the n-th node from the end in one pass?
**A:** Use a dummy node and two pointers; advance the fast one n steps, then move both until the fast one is at the last node, and unlink the node after the slow pointer.

**Q:** Why is a dummy node useful here?
**A:** When the node to remove is the head, there is no real predecessor; the dummy serves as one so the same code works for every position.

**Q:** What is the time complexity and is the two-pass solution worse?
**A:** The one-pass solution is O(L); the two-pass solution that counts the length first is also O(L), so the difference is only the number of traversals.

## summary
Keeping two pointers n nodes apart lets you find the n-th node from the end in one pass, and a dummy head makes removing the first node routine. The idea also solves rotation and list intersection problems.

## codenote
The Python sample removes nodes at several positions from the end. The JavaScript sample removes the last node.

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

def remove_from_end(head, n):
    dummy = Node(None, head)
    slow = fast = dummy
    for _ in range(n):
        fast = fast.next
    while fast.next:
        slow, fast = slow.next, fast.next
    slow.next = slow.next.next
    return dummy.next

print(to_list(remove_from_end(build([1, 2, 3, 4, 5]), 2)))
print(to_list(remove_from_end(build([1, 2, 3, 4, 5]), 5)))
print(to_list(remove_from_end(build([9]), 1)))
```
Output:
```text
[1, 2, 3, 5]
[2, 3, 4, 5]
[]
```
### javascript
```javascript
function removeFromEnd(head, n) {
  const dummy = { value: null, next: head };
  let slow = dummy;
  let fast = dummy;
  for (let i = 0; i < n; i++) fast = fast.next;
  while (fast.next) {
    slow = slow.next;
    fast = fast.next;
  }
  slow.next = slow.next.next;
  return dummy.next;
}

const head = [10, 20, 30].reduceRight((next, value) => ({ value, next }), null);
const out = [];
for (let node = removeFromEnd(head, 1); node; node = node.next) out.push(node.value);
console.log(out.join(" "));
```
Output:
```text
10 20
```

## quiz
1. How many nodes apart are the two pointers kept?
   - [ ] One
   - [x] n
   - [ ] The length of the list
   - [ ] Half the list
   > The gap equals the position counted from the end.
2. What marks the moment to stop moving the pointers?
   - [ ] When slow is null
   - [x] When the fast pointer is at the last node
   - [ ] After n steps
   - [ ] When values are equal
   > Then slow is at the predecessor of the node to remove.
3. Why use a dummy node?
   - [ ] To count nodes
   - [x] So removing the head follows the same code path
   - [ ] To reverse the list
   - [ ] To make it circular
   > The head then has a predecessor.
4. What is the result of removing the 5th from the end of 1 to 5?
   - [ ] 1, 2, 3, 4
   - [x] 2, 3, 4, 5
   - [ ] 1, 3, 4, 5
   - [ ] An empty list
   > The 5th from the end is the head.

# LRU Cache Design
kind: algorithm
time: O(1) for both get and put, by combining a hash map for lookup with a doubly linked list for recency ordering.
space: O(capacity) for the map entries and list nodes.

## intro
A least recently used cache holds a fixed number of entries and, when full, evicts the entry that has gone unused for the longest time. To make both reading and writing constant time, the design pairs two structures: a hash map that finds an entry instantly, and a doubly linked list that keeps entries ordered by recency and moves any entry to the front in O(1).

## theory
Requirements: `get(key)` returns the value or a miss signal and marks the entry as most recently used; `put(key, value)` inserts or updates the entry, marks it most recently used, and evicts the least recently used entry if the capacity is exceeded. Both must run in O(1).

Why two structures:

- A hash map alone gives O(1) lookup but no order, so finding the oldest entry needs a scan
- A list alone keeps order but needs O(n) to find a key
- Together: the map stores for each key a reference to its list node; the doubly linked list keeps nodes from most recently used (near the head) to least recently used (near the tail)

Operations:

- get: look up the node through the map; if absent return a miss; otherwise detach the node from its place (O(1) thanks to the prev and next links) and reinsert it at the front; return its value
- put: if the key exists, update the value and move the node to the front; otherwise create a node, insert it at the front, add it to the map, and if the size now exceeds the capacity, remove the node at the tail and delete its key from the map
- Sentinel head and tail nodes remove special cases for empty and full lists

The node must store its key as well as its value, because when the tail node is evicted you need its key to delete the map entry.

Trace with capacity 2: put(1, 1), put(2, 2) leaves order 2, 1 (most recent first). get(1) returns 1 and the order becomes 1, 2. put(3, 3) exceeds the capacity, so the tail (key 2) is evicted. get(2) returns a miss (−1). put(4, 4) evicts key 1. get(1) is a miss, get(3) returns 3 and get(4) returns 4.

Language shortcuts: Python's `OrderedDict` provides `move_to_end` and `popitem(last=False)`, JavaScript's `Map` keeps insertion order so deleting and re-inserting a key makes it the newest, and Java's `LinkedHashMap` with access order and `removeEldestEntry` does the whole job. Interviews often ask for the manual design to test understanding of the pointer logic.

Policy variants:

- LFU (least frequently used): evicts by access count; needs frequency buckets with lists, still O(1) with careful design
- FIFO: evicts by insertion time, ignoring reads
- Time to live (TTL): entries expire after a duration
- Approximations such as CLOCK, used in operating system page replacement, avoid updating on every access
- Concurrency: a global lock is simple, sharded caches reduce contention, and approximate recency lists avoid locking on reads

Hit rate depends on the access pattern: LRU works well with temporal locality but suffers on sequential scans larger than the cache (scan pollution), where policies like 2Q or ARC do better.

Testing: capacity 1, updating existing keys, repeated gets, evicting the oldest after many puts, and keys whose value is zero or empty (do not use truthiness to detect misses).

## explain
1. Create a hash map from keys to list nodes and a doubly linked list with head and tail sentinels.
2. On get, find the node, move it to the front and return its value, or report a miss.
3. On put, update and move an existing node, or insert a new node at the front.
4. If the size exceeds the capacity, remove the node before the tail sentinel and delete its key from the map.
5. Store the key in each node so eviction can delete the map entry.
6. Test eviction order, updates and capacity 1.

## example
The Python class implements the map and list design and prints the results of the trace with capacity 2: get(1) gives 1, get(2) gives -1 after eviction, get(1) gives -1 after the second eviction, get(3) gives 3 and get(4) gives 4. The JavaScript class uses a Map and obtains the same sequence.

## real
Web browsers cache recently used pages, databases keep recently used pages in buffer pools, and operating systems evict memory pages with LRU approximations.

## pros
- Constant time get and put
- Keeps frequently used data close
- Clear eviction rule that is easy to reason about

## cons
- Extra memory for the map and list
- Scans of large data can flush useful entries
- Strict recency updates need locking in concurrent settings

## uses
- Caching database pages and web content
- Memoizing expensive function calls with bounded memory
- Operating system page and buffer management
- Session or token caches

## mistakes
- Forgetting to store the key in the node and being unable to evict from the map
- Not moving the node to the front on get
- Evicting before checking whether the key already exists
- Using falsy checks that confuse a stored zero with a miss

## interview
**Q:** Why does an LRU cache use both a hash map and a doubly linked list?
**A:** The map gives O(1) lookup of a node by key, and the doubly linked list gives O(1) removal and reinsertion of a node at the front to track recency, with the least recently used node at the tail.

**Q:** What must be stored in each list node besides the value?
**A:** The key, so that when the tail node is evicted the corresponding entry can be removed from the hash map.

**Q:** How does LRU behave under a sequential scan?
**A:** A scan larger than the cache evicts all useful entries because each new item becomes the most recent, which is why scan-resistant policies such as 2Q or ARC exist.

## summary
An LRU cache combines a hash map with a doubly linked list to give O(1) get and put with eviction of the least recently used entry. Sentinels, keys stored in nodes and moving nodes to the front on every access are the key design points.

## codenote
The Python sample builds the cache from a map and a manual list. The JavaScript sample uses the insertion order of Map.

## code
### python
```python
class Node:
    def __init__(self, key=None, value=None):
        self.key, self.value, self.prev, self.next = key, value, None, None

class LRUCache:
    def __init__(self, capacity):
        self.capacity, self.nodes = capacity, {}
        self.head, self.tail = Node(), Node()
        self.head.next, self.tail.prev = self.tail, self.head

    def _remove(self, node):
        node.prev.next, node.next.prev = node.next, node.prev

    def _push_front(self, node):
        node.next, node.prev = self.head.next, self.head
        self.head.next.prev = node
        self.head.next = node

    def get(self, key):
        node = self.nodes.get(key)
        if node is None:
            return -1
        self._remove(node)
        self._push_front(node)
        return node.value

    def put(self, key, value):
        node = self.nodes.get(key)
        if node:
            node.value = value
            self._remove(node)
        else:
            node = self.nodes[key] = Node(key, value)
            if len(self.nodes) > self.capacity:
                oldest = self.tail.prev
                self._remove(oldest)
                del self.nodes[oldest.key]
        self._push_front(node)

cache = LRUCache(2)
cache.put(1, 1)
cache.put(2, 2)
print(cache.get(1))
cache.put(3, 3)
print(cache.get(2))
cache.put(4, 4)
print(cache.get(1), cache.get(3), cache.get(4))
```
Output:
```text
1
-1
-1 3 4
```
### javascript
```javascript
class LRUCache {
  constructor(capacity) {
    this.capacity = capacity;
    this.entries = new Map();
  }

  get(key) {
    if (!this.entries.has(key)) return -1;
    const value = this.entries.get(key);
    this.entries.delete(key);
    this.entries.set(key, value);
    return value;
  }

  put(key, value) {
    this.entries.delete(key);
    this.entries.set(key, value);
    if (this.entries.size > this.capacity) {
      this.entries.delete(this.entries.keys().next().value);
    }
  }
}

const cache = new LRUCache(2);
cache.put(1, 1);
cache.put(2, 2);
const first = cache.get(1);
cache.put(3, 3);
const second = cache.get(2);
cache.put(4, 4);
console.log(first, second, cache.get(1), cache.get(3), cache.get(4));
```
Output:
```text
1 -1 -1 3 4
```

## quiz
1. Which structure finds a cache entry in O(1)?
   - [ ] The linked list
   - [x] The hash map
   - [ ] A sorted array
   - [ ] A stack
   > The map stores a reference to each node by key.
2. Where is the least recently used entry kept?
   - [ ] At the head
   - [x] At the tail end of the list
   - [ ] In the map only
   - [ ] In a separate array
   > The most recent entries are near the head.
3. Why does each node store its key?
   - [ ] For sorting
   - [x] To delete the map entry when the node is evicted
   - [ ] To save memory
   - [ ] To detect cycles
   > The tail node's key identifies which map entry to remove.
4. What does a get operation do besides returning a value?
   - [ ] Deletes the entry
   - [x] Moves the entry to the front as most recently used
   - [ ] Clears the cache
   - [ ] Doubles the capacity
   > Reading counts as a use.

# Linked List Interview Patterns
kind: concept
time: Not an algorithmic topic — this lesson collects recurring techniques. Most linked list problems run in O(n) time with O(1) extra space once the right pointer pattern is chosen.
space: Not an algorithmic topic — pointer based solutions typically use O(1) space, and hash set based solutions O(n).

## intro
Linked list questions in interviews are rarely about the list itself; they test whether you can manipulate references without losing nodes. A handful of patterns, dummy nodes, two pointers at different speeds or gaps, reversal and merging, cover almost every question, and recognising the pattern is most of the solution.

## theory
Pattern 1: dummy head. When the head may change (deleting, merging, inserting at the front), place a dummy node before it and return `dummy.next`. This removes special cases and is used in merge, remove nth from end, remove elements and partition list.

Pattern 2: slow and fast pointers. Different speeds find the middle (fast moves two), detect cycles (Floyd) and find the cycle entrance. Used for palindrome checks, splitting lists for sorting and converting lists to trees.

Pattern 3: pointer gap. Move one pointer n steps ahead, then advance both, so the second pointer stands n nodes from the end when the first reaches the end. Used for remove n-th from end and for rotate list.

Pattern 4: in-place reversal. Reverse the whole list, a range or groups of k nodes with previous, current and next references. Used for palindrome checks, reorder list and add two numbers.

Pattern 5: merging. Merge two sorted lists with a dummy node and a tail; extend to k lists with a heap or pairwise merging; use inside merge sort and insertion sort for lists.

Pattern 6: hash map for random or extra links. Copy a list with random pointers by mapping old nodes to new nodes (O(n) space), or by weaving copies into the list (O(1) extra space). LRU cache pairs a map with a doubly linked list.

Pattern 7: two lists meeting. Find the intersection of two lists by moving two pointers and switching to the other list's head when each reaches the end; both pointers then travel `a + b` nodes and meet at the intersection or at null together. Alternatively align by the difference in length.

Worked examples:

- Palindrome list: find the middle, reverse the second half, compare, optionally restore. O(n) time and O(1) space. For 1, 2, 2, 1 the answer is true, and for 1, 2, 3 it is false.
- Add two numbers stored as digit lists in reverse order: walk both lists with a carry, creating nodes for each digit sum modulo 10. For 2 → 4 → 3 (342) and 5 → 6 → 4 (465) the result is 7 → 0 → 8 (807).
- Intersection of two lists: with the switching trick, no length computation is needed.
- Partition list around a value: build two lists (less than and not less than) with two dummy heads and concatenate them, keeping relative order.
- Odd even list: group nodes at odd positions followed by nodes at even positions with two interleaved pointers.
- Flatten a multilevel list, and sort a list in O(n log n) using merge sort.

Checklist before coding:

- Ask about the edge cases: empty list, one node, cycles, duplicates, whether values may be modified, whether the list is sorted
- Decide whether nodes can be changed or must be copied
- Draw the nodes and arrows for three or four nodes and step through the pointer changes
- Save the next reference before changing a link
- State complexity: time O(n), space O(1) for pointer methods, O(n) if you use a hash set or recursion

Debugging advice: after each change, ask which node can no longer be reached, and whether any node now has two incoming links or a link back. Test with the list of one node and of two nodes.

Comparison of approaches: arrays make many of these problems trivial through indexing, so interviewers use lists to test pointer reasoning; in real code prefer the structure that fits the access pattern.

## explain
1. Read the problem and name the pattern: dummy, two speeds, gap, reversal, merge or hash map.
2. Draw a small list and trace pointer changes by hand.
3. Handle the empty and single-node lists first.
4. Write the loop with the next reference saved before changing links.
5. Return the new head and check the tail's next.
6. State time and space complexity.

## example
The Python solution checks palindromes by finding the middle, reversing the second half and comparing the halves: 1, 2, 2, 1 is a palindrome and 1, 2, 3 is not. The JavaScript solution adds the numbers 342 and 465 stored as digit lists in reverse order and prints the digits 7, 0, 8.

## real
Operating systems, memory allocators and caches use linked structures daily, and interview questions on lists are adapted from these real pointer manipulation tasks.

## pros
- A small set of patterns covers most problems
- Pointer solutions use constant extra memory
- Drawing nodes makes errors visible early

## cons
- Pointer errors can silently lose nodes or create cycles
- Recursive solutions risk stack overflow on long lists
- Real code often prefers arrays, so the skill is mostly for interviews

## uses
- Rehearsing linked list questions before interviews
- Reviewing pointer-based code
- Choosing between hash set and pointer solutions
- Teaching reference manipulation

## mistakes
- Changing a next reference before saving the old value
- Forgetting to return the new head after a reversal or a merge
- Ignoring cycles when the problem does not exclude them
- Skipping the test with a list of one or two nodes

## interview
**Q:** Which patterns solve most linked list interview problems?
**A:** A dummy head, slow and fast pointers, a gap between two pointers, in-place reversal, merging and a hash map for extra links; most are linear time with constant space.

**Q:** How do you check whether a linked list is a palindrome in O(1) space?
**A:** Find the middle with slow and fast pointers, reverse the second half in place, compare both halves and optionally reverse it back.

**Q:** How do you find the intersection of two linked lists?
**A:** Advance two pointers, switching each to the other list's head at its end; they meet at the intersection node or both reach null after the same number of steps.

## summary
Linked list interview problems reduce to a few patterns: dummy head, two speeds, pointer gap, in-place reversal, merging and hash maps. Draw nodes, save references before changing them and test the one-node cases.

## codenote
The Python sample checks palindromes with reversal. The JavaScript sample adds two digit lists.

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

def is_palindrome(head):
    slow = fast = head
    while fast and fast.next:
        slow, fast = slow.next, fast.next.next
    previous = None
    while slow:
        slow.next, previous, slow = previous, slow, slow.next
    left, right = head, previous
    while right:
        if left.value != right.value:
            return False
        left, right = left.next, right.next
    return True

print(is_palindrome(build([1, 2, 2, 1])), is_palindrome(build([1, 2, 3])), is_palindrome(build([4])))
```
Output:
```text
True False True
```
### javascript
```javascript
function addLists(a, b) {
  const dummy = { value: 0, next: null };
  let tail = dummy;
  let carry = 0;
  while (a || b || carry) {
    const sum = (a ? a.value : 0) + (b ? b.value : 0) + carry;
    tail.next = { value: sum % 10, next: null };
    tail = tail.next;
    carry = Math.floor(sum / 10);
    a = a ? a.next : null;
    b = b ? b.next : null;
  }
  return dummy.next;
}

const build = (digits) => digits.reduceRight((next, value) => ({ value, next }), null);
const out = [];
for (let node = addLists(build([2, 4, 3]), build([5, 6, 4])); node; node = node.next) out.push(node.value);
console.log(out.join(" "));
```
Output:
```text
7 0 8
```

## quiz
1. What does a dummy head node help with?
   - [ ] Sorting values
   - [x] Avoiding special cases when the head changes
   - [ ] Detecting cycles
   - [ ] Reducing memory
   > The result is built after the dummy and returned as dummy.next.
2. Which pattern finds a palindrome in a list with O(1) space?
   - [ ] Hash set of values
   - [x] Find the middle, reverse the second half and compare
   - [ ] Recursion on the whole list
   - [ ] Sorting the nodes
   > Reversal avoids copying values into an array.
3. How can two lists of different lengths be aligned for an intersection check?
   - [ ] By sorting both
   - [x] By switching each pointer to the other list's head at its end
   - [ ] By deleting the head
   - [ ] By doubling the shorter list
   > Both pointers then travel the same total distance.
4. What should be saved before changing a next reference?
   - [ ] The node's value
   - [x] The old next reference
   - [ ] The length of the list
   - [ ] The tail
   > Otherwise the rest of the list becomes unreachable.
