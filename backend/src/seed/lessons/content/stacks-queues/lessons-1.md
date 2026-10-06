# Stack ADT Operations
kind: algorithm
time: O(1) for push, pop, peek and the emptiness test in any reasonable implementation; processing a sequence of n items with a stack costs O(n) in total.
space: O(n) for n stored elements, with no overhead beyond the container itself.
viz: stack-operations

## intro
A stack is a collection with one rule: the last item added is the first one removed, like a pile of plates. That last in, first out discipline sounds restrictive, but it matches the way programs nest calls, undo edits and match brackets, which is why stacks sit underneath compilers, browsers and editors.

## theory
An abstract data type (ADT) describes what operations a structure offers and what they promise, not how it is stored. The stack ADT has these operations:

- push(x): place x on top of the stack
- pop(): remove and return the top item; popping an empty stack is an error (underflow)
- peek() or top(): return the top item without removing it
- is_empty(): report whether the stack has no items
- size(): the number of items, often tracked by a counter

All of them run in O(1) time. The behaviour is last in, first out: after pushing 1, 2, 3 the pops return 3, 2, 1.

Implementations:

- Array or dynamic array: push appends at the end, pop removes from the end. Fast and cache friendly, with amortised O(1) pushes when the array doubles in size.
- Linked list: push and pop work at the head; each operation is O(1) worst case, without resizing, at the cost of a pointer per node
- Fixed capacity array: simple and predictable but must report overflow when full

Errors to handle: underflow (pop or peek on an empty stack) and, for bounded stacks, overflow (push on a full stack). Choose between returning a sentinel value, raising an exception or returning an optional value, and document it.

Where stacks appear:

- The call stack: each function call pushes a frame with its local variables, and returning pops it; deep recursion exhausts the stack (stack overflow)
- Undo and redo: each action is pushed, undo pops it and pushes it onto a redo stack
- Expression evaluation and conversion: operands and operators are held on stacks, as in the shunting-yard algorithm
- Bracket matching and syntax checking
- Depth first search with an explicit stack instead of recursion
- Backtracking and browser back navigation

Example 1: reversing a string. Push every character and pop them all; the output order is reversed, so `hello` becomes `olleh`.

Example 2: evaluating a postfix expression. Read tokens left to right: push numbers; for an operator, pop two operands (the first popped is the right operand), apply the operator and push the result. The expression `3 4 + 2 *` pushes 3 and 4, pops them to push 7, pushes 2, then multiplies to get 14. The stack holds exactly the pending operands, which is why no parentheses or precedence rules are needed.

Cost model: n pushes and n pops cost O(n) in total, so using a stack to process a sequence is linear. Peeking is useful in loops that compare the new item with the top before deciding to pop.

Testing: push then pop returns the same item, popping all items returns the reverse order, and popping an empty stack follows the documented behaviour.

## explain
1. Choose a representation: dynamic array or linked list.
2. Implement push by adding at the top and pop by removing from the top.
3. Implement peek and is_empty without modifying the stack.
4. Decide how underflow and overflow are reported.
5. Use the stack in a loop that processes input in order and pops when needed.
6. Test the order of pops and the empty stack case.

## example
The Python class wraps a list with push, pop, peek and is_empty, reverses `hello` into `olleh` and raises a clear error when an empty stack is popped. The JavaScript function evaluates the postfix expression `3 4 + 2 *` with an array used as a stack and prints 14.

## real
Every running program uses a call stack, text editors keep an undo stack, and web browsers keep a back stack of visited pages.

## pros
- All core operations take constant time
- Matches nested and reversible processes naturally
- Simple to implement with arrays or linked nodes

## cons
- Only the top is accessible, so searching needs popping
- Bounded stacks can overflow
- Deep recursion can exhaust the call stack

## uses
- Undo and redo history
- Bracket and tag matching
- Expression evaluation
- Explicit stacks for depth first search

## mistakes
- Popping or peeking an empty stack without a check
- Mixing up the order of the two operands when popping for an operator
- Using peek and pop interchangeably
- Forgetting that a bounded stack needs an overflow check

## interview
**Q:** What does last in, first out mean for a stack?
**A:** The most recently pushed item is the first one popped, so items leave in the reverse order of their arrival.

**Q:** What are the time complexities of the stack operations?
**A:** Push, pop, peek and is_empty are all O(1), with array implementations having amortised O(1) pushes because of occasional resizing.

**Q:** How do you evaluate a postfix expression with a stack?
**A:** Push numbers as they are read; for an operator pop the two top operands, apply it and push the result; the final stack item is the answer.

## summary
A stack offers push, pop and peek in constant time with last in, first out order, and it underlies the call stack, undo, bracket matching and expression evaluation. Handle underflow explicitly and keep the operand order straight.

## codenote
The Python sample implements a stack and reverses a string. The JavaScript sample evaluates a postfix expression.

## code
### python
```python
class Stack:
    def __init__(self):
        self._items = []

    def push(self, item):
        self._items.append(item)

    def pop(self):
        if not self._items:
            raise IndexError("pop from empty stack")
        return self._items.pop()

    def peek(self):
        return self._items[-1]

    def is_empty(self):
        return not self._items

def reverse(text):
    stack = Stack()
    for ch in text:
        stack.push(ch)
    out = []
    while not stack.is_empty():
        out.append(stack.pop())
    return "".join(out)

print(reverse("hello"))
try:
    Stack().pop()
except IndexError as error:
    print(error)
```
Output:
```text
olleh
pop from empty stack
```
### javascript
```javascript
function evaluatePostfix(expression) {
  const stack = [];
  for (const token of expression.split(" ")) {
    if (["+", "-", "*", "/"].includes(token)) {
      const right = stack.pop();
      const left = stack.pop();
      stack.push({ "+": left + right, "-": left - right, "*": left * right, "/": left / right }[token]);
    } else {
      stack.push(Number(token));
    }
  }
  return stack.pop();
}

console.log(evaluatePostfix("3 4 + 2 *"));
```
Output:
```text
14
```

## quiz
1. Which item does pop remove from a stack?
   - [ ] The oldest item
   - [x] The most recently pushed item
   - [ ] The smallest item
   - [ ] A random item
   > A stack is last in, first out.
2. What is the cost of push on a linked list stack?
   - [ ] O(n)
   - [x] O(1)
   - [ ] O(log n)
   - [ ] O(n squared)
   > Only the head changes.
3. What condition is called underflow?
   - [ ] Pushing onto a full stack
   - [x] Popping from an empty stack
   - [ ] Peeking at a full stack
   - [ ] Pushing a null value
   > There is no item to remove.
4. What is the value of the postfix expression 3 4 + 2 * ?
   - [ ] 10
   - [x] 14
   - [ ] 24
   - [ ] 9
   > Three plus four is seven, then seven times two.

# Queue ADT Operations
kind: algorithm
time: O(1) for enqueue, dequeue, front and the emptiness test when the queue is implemented with a linked list, a circular array or a deque; a plain array that shifts elements on dequeue costs O(n) per removal.
space: O(n) for n queued items; a circular buffer uses a fixed block of capacity cells.
viz: queue-operations

## intro
A queue serves items in the order they arrived: first in, first out, like people waiting in line. It is the natural structure for anything that must be processed fairly or in sequence, such as print jobs, network packets, task schedulers and breadth first search.

## theory
The queue ADT:

- enqueue(x): add x at the back
- dequeue(): remove and return the front item; an empty queue raises an underflow error or returns a sentinel
- front() or peek(): look at the front item without removing it
- is_empty() and size()

Order: after enqueueing A, B, C the dequeues return A, B, C. Compare with a stack, which would return C, B, A.

Implementations and their costs:

- Linked list with head and tail references: enqueue at the tail, dequeue at the head, both O(1)
- Circular array (ring buffer): a fixed-size array with `head` and `count` indices; enqueue writes at `(head + count) mod capacity`, dequeue reads at `head` and advances it modulo the capacity. All operations are O(1), and no elements are shifted. The queue is full when `count == capacity`.
- Dynamic array that removes from the front: `list.pop(0)` shifts every element, so each dequeue costs O(n); avoid it for queues in Python and use `collections.deque`
- Two stacks: enqueue pushes onto an input stack; dequeue pops from an output stack, refilling it from the input stack only when it is empty. Each element moves at most once, so the amortised cost is O(1).

Why the ring buffer works: the array indices wrap around, so space freed at the front by dequeues is reused by later enqueues. A naive array queue with a moving front index eventually reaches the end of the array even though there is free space at the start.

Variants:

- Priority queue: dequeue returns the highest priority item, not the oldest (implemented with a heap)
- Deque: insertion and removal at both ends
- Blocking queue: producers wait when full and consumers wait when empty, the basis of producer consumer pipelines
- Bounded and unbounded queues, and lock-free queues for concurrent programs

Simulation example: a print queue receives jobs A, B, C and D. The printer takes one job at a time: A, B, C, D in the same order, and a job that arrives while another is printing waits behind all earlier jobs. The ring buffer demonstration with capacity 3: enqueue 1, 2, 3 fills it; a fourth enqueue is rejected; after dequeuing 1, enqueueing 4 succeeds by reusing the freed cell, and the remaining dequeues return 2, 3, 4.

Applications: breadth first search (visit nodes level by level), task scheduling, buffering data between a fast producer and a slower consumer, message queues between services, and handling requests in the order of arrival.

Testing: dequeue from an empty queue, fill and drain repeatedly (to test wraparound), alternate enqueue and dequeue and check the order.

## explain
1. Choose a representation: linked list, ring buffer or deque.
2. Implement enqueue at the back and dequeue at the front.
3. For a ring buffer, keep head and count and use modulo arithmetic.
4. Check for a full queue before enqueue and an empty queue before dequeue.
5. Process items in arrival order.
6. Test wraparound by filling, draining and refilling.

## example
The Python program uses a deque as a queue for print jobs A, B, C and D and prints them in arrival order. The JavaScript class is a ring buffer of capacity 3: the fourth enqueue is refused, a dequeue frees a cell, the next enqueue wraps around and the dequeues return 1, 2, 3 and 4 in order.

## real
Operating systems queue processes and input events, web servers queue incoming requests, and message brokers such as RabbitMQ and Kafka are built around queues.

## pros
- Fair first come, first served ordering
- Constant time operations with the right implementation
- Decouples producers from consumers

## cons
- No access to middle items
- Naive array implementations shift elements on dequeue
- Bounded queues must handle the full condition

## uses
- Task and job scheduling
- Breadth first search traversal
- Buffering between producers and consumers
- Handling requests in order of arrival

## mistakes
- Using a plain list with pop from the front and paying linear time per dequeue
- Forgetting the modulo wraparound in a circular buffer
- Confusing the full and empty conditions of a ring buffer
- Dequeuing from an empty queue without a check

## interview
**Q:** What is the difference between a stack and a queue?
**A:** A stack removes the most recently added item (last in, first out), while a queue removes the oldest item (first in, first out).

**Q:** How does a circular buffer implement a queue?
**A:** It keeps an array with a head index and a count; enqueue writes at head plus count modulo the capacity and dequeue reads at head then advances it modulo the capacity, so all operations are O(1) and space is reused.

**Q:** Why is removing from the front of a Python list a poor queue operation?
**A:** Removing the first element shifts all the others, costing O(n) per dequeue, so collections.deque should be used for O(1) operations.

## summary
A queue enqueues at the back and dequeues from the front in first in, first out order with O(1) operations when built on a linked list, a ring buffer or a deque. Use modulo indices for the ring buffer and avoid array shifting.

## codenote
The Python sample simulates a print queue. The JavaScript sample implements a ring buffer.

## code
### python
```python
from collections import deque

jobs = deque()
for job in ("A", "B", "C", "D"):
    jobs.append(job)

printed = []
while jobs:
    printed.append(jobs.popleft())
print(printed, len(jobs))
```
Output:
```text
['A', 'B', 'C', 'D'] 0
```
### javascript
```javascript
class RingQueue {
  constructor(capacity) {
    this.items = new Array(capacity);
    this.head = 0;
    this.count = 0;
  }

  enqueue(value) {
    if (this.count === this.items.length) return false;
    this.items[(this.head + this.count) % this.items.length] = value;
    this.count++;
    return true;
  }

  dequeue() {
    if (this.count === 0) return undefined;
    const value = this.items[this.head];
    this.head = (this.head + 1) % this.items.length;
    this.count--;
    return value;
  }
}

const queue = new RingQueue(3);
const results = [1, 2, 3, 4].map((v) => queue.enqueue(v));
const first = queue.dequeue();
results.push(queue.enqueue(4));
console.log(results.join(" "), first, queue.dequeue(), queue.dequeue(), queue.dequeue());
```
Output:
```text
true true true false true 1 2 3 4
```

## quiz
1. In which order does a queue return items?
   - [ ] Last in, first out
   - [x] First in, first out
   - [ ] Smallest first
   - [ ] Random order
   > The oldest item is served first.
2. Why is list.pop(0) a poor dequeue in Python?
   - [ ] It returns the wrong item
   - [x] It shifts all remaining elements, costing O(n)
   - [ ] It raises an exception
   - [ ] It sorts the list
   > A deque removes from the front in constant time.
3. How does a ring buffer find the next free cell?
   - [ ] By scanning the array
   - [x] At index (head + count) modulo the capacity
   - [ ] At index 0 always
   - [ ] By sorting the array
   > The modulo makes indices wrap around.
4. How do two stacks implement a queue with O(1) amortised cost?
   - [ ] Each dequeue moves all items
   - [x] Items move from the input stack to the output stack only when the output stack is empty
   - [ ] Both stacks are sorted
   - [ ] The stacks swap on every enqueue
   > Each item is moved at most once.

# Deque Operations
kind: algorithm
time: O(1) for insertion and removal at either end in a doubly linked or block-based deque; O(n) to access or modify an item at an arbitrary position in a linked implementation, and O(1) for indexing in a ring buffer implementation.
space: O(n) for n stored items.

## intro
A deque, pronounced deck, is a double-ended queue: you can add and remove items at both the front and the back. It generalises both the stack and the queue, so one structure can serve as either, and it supports tricks such as sliding window maxima and palindrome checks that need access at both ends.

## theory
Operations:

- push_front(x) or appendleft(x): add at the front
- push_back(x) or append(x): add at the back
- pop_front() or popleft(): remove and return the front item
- pop_back() or pop(): remove and return the back item
- peek_front and peek_back: inspect either end
- Optional rotation: move items from one end to the other, such as `rotate(k)`

All end operations are O(1).

Relation to other structures:

- Stack: use only the back (push_back, pop_back)
- Queue: add at the back and remove from the front (push_back, pop_front)
- Using both ends gives behaviour neither alone can offer, such as removing stale items from the back while expiring old ones from the front

Implementations:

- Doubly linked list: O(1) at both ends with a pointer per direction, no resizing, but poor cache behaviour and no fast indexing
- Circular array (ring buffer) that grows: head index and count, modulo arithmetic, O(1) at both ends and O(1) random access, with amortised O(1) growth
- Block-based (chunked) deque, used by Python's `collections.deque` and the C++ `std::deque`: an array of fixed-size blocks, giving O(1) end operations and cheap middle index access in C++ (Python's deque has O(n) middle access, though it is fast at the ends)
- Using an ordinary array: removing from the front is O(n), so arrays alone make a poor deque

Common uses:

- Sliding window problems: a monotonic deque of indices (next lessons) gives the maximum of every window in O(n)
- Palindrome checks: compare the front and back items while removing them; the string `racecar` is a palindrome and `abca` is not
- Work stealing schedulers: each worker pushes and pops tasks at one end of its deque while idle workers steal from the other end
- Undo history with a limit: add new actions at the back and drop the oldest from the front when the history exceeds a maximum length (a deque with `maxlen`)
- Breadth first search variants such as 0-1 BFS, where edges of weight 0 push to the front and edges of weight 1 push to the back
- Browser tab or card dealing systems that rotate items

Python example: `deque([1, 2, 3])`, then `appendleft(0)` gives 0, 1, 2, 3, `append(4)` gives 0, 1, 2, 3, 4, `popleft()` returns 0 and `pop()` returns 4. `rotate(1)` moves the last item to the front, and `deque(maxlen=3)` keeps only the three most recent items, silently discarding from the opposite end.

Pitfalls: confusing which end a method uses, using index access on a linked implementation in a hot loop, and forgetting that rotation direction conventions differ between libraries.

## explain
1. Decide which operations are needed at the front and at the back.
2. Choose a deque implementation from the language library.
3. Use push and pop at one end to behave as a stack.
4. Use push at one end and pop at the other to behave as a queue.
5. For two-ended algorithms, compare or remove items from both ends.
6. Limit the size with a maximum length if only recent items matter.

## example
The Python program applies the operations to `deque([1, 2, 3])` and prints the contents after each step, including a bounded deque that keeps only the last three of five appended numbers. The JavaScript function checks palindromes with two indices that mimic taking from both ends: `racecar` is a palindrome and `abca` is not.

## real
Work-stealing task schedulers, browser history with a size limit, and sliding window analytics all depend on deques.

## pros
- Constant time operations at both ends
- Can act as a stack or a queue
- Bounded versions discard old data automatically

## cons
- No fast removal from the middle
- Index access may be slow in linked implementations
- More operations mean more chances to use the wrong end

## uses
- Computing window extremes over a moving stream
- Palindrome checks from both ends
- Work stealing task queues
- Bounded history of recent actions

## mistakes
- Using a list for front removals and paying O(n) each time
- Mixing up front and back operations
- Assuming indexing in the middle is as fast as at the ends
- Forgetting that a bounded deque silently drops items

## interview
**Q:** What is a deque and how does it relate to stacks and queues?
**A:** A deque supports insertion and removal at both ends in O(1); using one end gives a stack and using opposite ends for insertion and removal gives a queue.

**Q:** Which operations does Python's collections.deque make cheap?
**A:** append, appendleft, pop and popleft are O(1), and a maxlen limit can discard old items automatically; indexing in the middle is slower.

**Q:** Where does a deque help in algorithms?
**A:** In sliding window maximum, where a monotonic deque of indices is maintained, and in 0-1 breadth first search, where zero-weight edges push to the front and one-weight edges to the back.

## summary
A deque supports O(1) insertion and removal at both ends, which lets it serve as a stack, a queue or both at once. It is the right tool for sliding windows, bounded histories and two-ended scans.

## codenote
The Python sample exercises the main operations. The JavaScript sample checks palindromes from both ends.

## code
### python
```python
from collections import deque

items = deque([1, 2, 3])
items.appendleft(0)
items.append(4)
print(list(items))
print(items.popleft(), items.pop(), list(items))
items.rotate(1)
print(list(items))
recent = deque(maxlen=3)
for value in range(1, 6):
    recent.append(value)
print(list(recent))
```
Output:
```text
[0, 1, 2, 3, 4]
0 4 [1, 2, 3]
[3, 1, 2]
[3, 4, 5]
```
### javascript
```javascript
function isPalindrome(text) {
  let left = 0;
  let right = text.length - 1;
  while (left < right) {
    if (text[left] !== text[right]) return false;
    left++;
    right--;
  }
  return true;
}

console.log(isPalindrome("racecar"), isPalindrome("abca"));
```
Output:
```text
true false
```

## quiz
1. Where can a deque add and remove items?
   - [ ] Only at the back
   - [x] At both the front and the back
   - [ ] Only in the middle
   - [ ] Only at the front
   > Double-ended means both ends are open.
2. How does a deque act as a stack?
   - [ ] By sorting its items
   - [x] By pushing and popping at the same end
   - [ ] By using only the middle
   - [ ] By rotating after each push
   > One end gives last in, first out behaviour.
3. What does deque(maxlen=3) do when a fourth item is appended?
   - [ ] Raises an error
   - [x] Discards an item from the opposite end
   - [ ] Doubles its capacity
   - [ ] Ignores the new item
   > The oldest item falls off.
4. Which problem is classically solved with a monotonic deque?
   - [ ] Binary search
   - [x] Sliding window maximum
   - [ ] Sorting
   - [ ] Hashing
   > The deque keeps candidate maxima in order.

# Implement Stack with Array
kind: algorithm
time: O(1) for push and pop in the amortised sense with a growing array, and O(1) worst case for a fixed-capacity array; a resize costs O(n) but happens rarely.
space: O(capacity) for the backing array, which is at most about twice the number of stored items in a doubling scheme.

## intro
An array is the simplest way to build a stack: keep the items in an array and an index of the top. Pushes and pops touch only the end, so they never shift elements. The interesting questions are what to do when the array is full, how to keep a minimum available in constant time, and how the amortised cost of resizing works out.

## theory
Fixed-capacity array stack:

- Fields: an array of size `capacity` and an integer `top` (the number of items, or the index of the last item)
- push(x): if `top == capacity`, report overflow; otherwise `items[top] = x` and `top += 1`
- pop(): if `top == 0`, report underflow; otherwise `top -= 1` and return `items[top]`
- peek(): return `items[top − 1]` with the same check
- All operations O(1)

Growing array stack: when the array is full, allocate a new array of double the capacity, copy the items and continue. Doubling gives amortised O(1) pushes: copying costs n for an array of n items, but it happens only after n pushes since the last resize, so the cost per push averaged over a sequence is constant. Pushing 10 items starting from capacity 2 triggers resizes when pushing the 3rd, 5th and 9th item, giving capacities 4, 8 and 16; the total number of copied items is 2 + 4 + 8 = 14, under 2 per push.

Shrinking policy: halve the array when it is one quarter full (not one half), so that a push and pop at the boundary do not cause repeated resizing. Many libraries never shrink.

Why not a plain fixed array? Fixed stacks are fine for embedded systems with known limits; otherwise the capacity must adapt. In Python lists and JavaScript arrays the runtime already grows the storage for you, so `append` and `pop` act as push and pop.

Min stack: a stack that also returns the minimum item in O(1). Keep a second stack of minimums, where each push also records `min(x, current minimum)`. For pushes 5, 3, 7 and 3, the minimum stack holds 5, 3, 3, 3, so `get_min` after the pushes is 3; after popping one item the minimum is still 3, after popping again it is 3, and after one more it is 5. Alternatives store pairs (value, minimum so far) in one stack. The same trick works for the maximum, or for any aggregate that can be undone by popping.

Design checks:

- Decide the exception or return convention for overflow and underflow
- Avoid memory leaks in languages with manual memory: after pop, clear the vacated slot if it holds references
- Thread safety: a shared stack needs a lock, or a lock-free design with compare and swap
- Generic types: in typed languages make the stack a template or generic class

Array stack versus linked stack: the array stack has better locality and less memory per item, but occasional resize pauses; the linked stack has worst-case O(1) pushes and no copying, but allocates a node per push.

Testing: push many items and pop all of them in reverse order, interleave pushes and pops across resize boundaries, and check that capacity growth does not lose items.

## explain
1. Allocate an array and keep a top index starting at zero.
2. On push, grow the array if it is full, then store the item and increase top.
3. On pop, check for an empty stack, decrease top and return the item.
4. Keep a parallel stack of minimums if the minimum is needed in O(1).
5. Count resizes to verify the amortised behaviour.
6. Test across resize boundaries and on empty stacks.

## example
The Python class pushes ten items starting from capacity 2 and reports the capacities after each resize (4, 8 and 16) and the 14 copied items in total. The JavaScript min stack pushes 5, 3, 7 and 3 and prints 3 3 3 5, which is the initial minimum followed by the minimum after each of three pops.

## real
Language runtimes allocate call stacks in contiguous memory, interpreters hold operand stacks in arrays, and editors implement bounded undo history with array stacks.

## pros
- Simple, fast and cache friendly
- Amortised constant time pushes with doubling
- Easy to extend with auxiliary data such as a minimum

## cons
- Resizing causes occasional O(n) pauses
- Fixed capacity may overflow
- Unused capacity wastes memory

## uses
- General purpose stacks in application code
- Interpreter operand stacks
- Constant time minimum tracking
- Bounded history buffers

## mistakes
- Growing by a constant amount instead of doubling, which makes pushes quadratic overall
- Shrinking at half capacity and causing thrashing
- Forgetting to check underflow before pop
- Keeping stale references in vacated slots

## interview
**Q:** Why does doubling the capacity give amortised O(1) pushes?
**A:** Each resize copies n items but happens only after n cheap pushes, so spreading the copying cost over those pushes adds a constant per push.

**Q:** How do you design a stack that returns its minimum in O(1)?
**A:** Keep an auxiliary stack of running minimums, pushing the smaller of the new value and the current minimum on every push, and pop both stacks together.

**Q:** Why shrink at one quarter full rather than one half?
**A:** Shrinking at one half lets alternating push and pop operations at the boundary trigger repeated resizes, while one quarter leaves room for either direction without thrashing.

## summary
An array stack stores items contiguously with a top index and doubles its capacity when full, giving amortised O(1) pushes and O(1) pops. An auxiliary stack of minimums extends it to constant time minimum queries.

## codenote
The Python sample counts resizes during pushes. The JavaScript sample implements a min stack.

## code
### python
```python
class ArrayStack:
    def __init__(self):
        self.items = [None] * 2
        self.top = 0
        self.copied = 0
        self.capacities = []

    def push(self, value):
        if self.top == len(self.items):
            bigger = [None] * (2 * len(self.items))
            for i in range(self.top):
                bigger[i] = self.items[i]
            self.copied += self.top
            self.items = bigger
            self.capacities.append(len(bigger))
        self.items[self.top] = value
        self.top += 1

    def pop(self):
        if self.top == 0:
            raise IndexError("underflow")
        self.top -= 1
        value, self.items[self.top] = self.items[self.top], None
        return value

stack = ArrayStack()
for value in range(10):
    stack.push(value)
print(stack.capacities, stack.copied, stack.pop(), stack.pop())
```
Output:
```text
[4, 8, 16] 14 9 8
```
### javascript
```javascript
class MinStack {
  constructor() {
    this.values = [];
    this.minimums = [];
  }

  push(value) {
    this.values.push(value);
    const current = this.minimums.length ? this.minimums[this.minimums.length - 1] : Infinity;
    this.minimums.push(Math.min(value, current));
  }

  pop() {
    this.minimums.pop();
    return this.values.pop();
  }

  min() {
    return this.minimums[this.minimums.length - 1];
  }
}

const stack = new MinStack();
[5, 3, 7, 3].forEach((v) => stack.push(v));
const readings = [stack.min()];
for (let i = 0; i < 3; i++) {
  stack.pop();
  readings.push(stack.min());
}
console.log(readings.join(" "));
```
Output:
```text
3 3 3 5
```

## quiz
1. What does the top index of an array stack track?
   - [ ] The largest value
   - [x] The next free position or the number of items
   - [ ] The array capacity
   - [ ] The smallest value
   > Push writes at top and pop reads below it.
2. What makes capacity doubling better than growing by a fixed step?
   - [ ] To save memory
   - [x] To keep the amortised cost of a push constant
   - [ ] To avoid copying entirely
   - [ ] To sort the items
   > Fixed increments cause copying after every few pushes.
3. How does a min stack answer minimum queries in O(1)?
   - [ ] By scanning the array
   - [x] By keeping a parallel stack of running minimums
   - [ ] By sorting after each push
   - [ ] By using a hash table
   > The top of the minimum stack is the current minimum.
4. When should the array shrink to avoid thrashing?
   - [ ] When it is half full
   - [x] When it is one quarter full
   - [ ] After every pop
   - [ ] Never under any circumstance
   > The gap between growth and shrink thresholds prevents repeated resizing.

# Implement Queue with Linked List
kind: algorithm
time: O(1) worst case for enqueue and dequeue, since a head reference serves removals and a tail reference serves insertions, with no shifting or resizing.
space: O(n) for n nodes, each holding a value and a next reference.

## intro
A linked list gives a queue without any shifting or resizing: new items attach to the tail and removals come off the head. Both ends are reached through stored references, so every operation is constant time in the worst case. This lesson builds the structure, and then shows the other classic construction, a queue made from two stacks.

## theory
Linked queue:

- Fields: `head` (front, where dequeue happens), `tail` (back, where enqueue happens) and optionally `size`
- enqueue(x): create a node; if the queue is empty, set head and tail to it; otherwise set `tail.next = node` and `tail = node`
- dequeue(): if empty, report underflow; otherwise take `head.value`, set `head = head.next`, and if the head became null, also set `tail = null`
- front(): return `head.value`
- is_empty(): `head is None`

The direction matters. If you enqueue at the head and dequeue at the tail of a singly linked list, dequeue would need the node before the tail, costing O(n). Enqueue at the tail and dequeue at the head keeps both operations O(1).

Edge cases that cause bugs:

- Enqueue into an empty queue must set both head and tail
- Dequeue of the last item must reset the tail to null; forgetting this leaves a dangling tail pointing at a removed node, and the next enqueue links into the void
- Dequeue on an empty queue needs an explicit error or sentinel

Comparison with the other implementations:

- Ring buffer: no per-item allocation, best cache behaviour, but a fixed capacity or growth by copying
- Linked list: unbounded without copying and predictable worst-case time, but extra memory per node and slower due to scattered allocation
- Language deques (Python deque, Java ArrayDeque) combine speed and flexibility and are usually the practical choice

Queue from two stacks:

- Maintain an input stack and an output stack
- enqueue pushes onto the input stack
- dequeue pops from the output stack; if the output stack is empty, first pop every item from the input stack and push it onto the output stack, which reverses the order so the oldest item ends up on top
- Each item is moved at most once between the stacks, so the amortised cost per operation is O(1), though a single dequeue can cost O(n)
- After enqueueing 1, 2, 3, dequeuing returns 1, then enqueueing 4 and dequeuing returns 2, 3, 4 in order

Both approaches preserve first in, first out order. The two-stack version appears in interviews because it tests the understanding of amortised analysis and of what reversing twice does.

Applications of linked queues: breadth first search frontiers of unknown size, message buffers, task pipelines and simulation event lists with unpredictable lengths.

Memory behaviour: in garbage-collected languages dequeued nodes are reclaimed once nothing references them; in languages with manual memory management you must free them and avoid leaving the tail pointing to freed memory.

Testing: enqueue then dequeue in order, dequeue until empty and enqueue again (checks the tail reset), and interleaved operations.

## explain
1. Keep head and tail references, both null for an empty queue.
2. On enqueue, link a new node after the tail and update the tail, setting the head too when the queue was empty.
3. On dequeue, take the head value and advance the head.
4. If the head becomes null, set the tail to null as well.
5. For the two-stack version, move items between stacks only when the output stack is empty.
6. Test emptying and refilling the queue.

## example
The Python linked queue enqueues three items, dequeues them in order, empties completely and accepts new items afterwards, printing the sequence 1, 2, 3 and then 9. The JavaScript queue built from two stacks enqueues 1, 2 and 3, dequeues 1, enqueues 4 and dequeues the remaining items, printing 1 2 3 4.

## real
Message brokers, web server request pipelines and breadth first search frontiers all use queues that grow and shrink without a fixed limit, often built on linked blocks.

## pros
- Worst-case constant time for both operations
- No resizing or copying
- Grows and shrinks one item at a time

## cons
- Extra memory for a reference per node
- Poorer cache locality than arrays
- Must keep the tail consistent after removals

## uses
- Breadth first search frontiers
- Task and message buffers
- Event lists in simulations
- Teaching queues from first principles

## mistakes
- Forgetting to reset the tail to null when the queue becomes empty
- Enqueuing at the head and dequeuing at the tail, making dequeue linear
- Not handling the first enqueue into an empty queue
- Moving items between the two stacks on every dequeue instead of only when the output stack is empty

## interview
**Q:** Why enqueue at the tail and dequeue at the head in a singly linked queue?
**A:** The head reference gives immediate removal, and the tail reference gives immediate insertion; the reverse direction would need the node before the tail to dequeue, costing O(n).

**Q:** What bug occurs if the tail is not reset when the last item is dequeued?
**A:** The tail still points to a removed node, so the next enqueue attaches to the wrong node and the new item never becomes reachable from the head.

**Q:** What is the amortised cost of a queue built from two stacks?
**A:** O(1) per operation, because every item is pushed and popped at most twice in total, even though an individual dequeue may transfer many items.

## summary
A linked queue enqueues at the tail and dequeues at the head, giving O(1) worst-case operations with careful handling of the empty state. A queue from two stacks achieves amortised O(1) by reversing items only when the output stack runs dry.

## codenote
The Python sample implements a linked queue. The JavaScript sample builds a queue from two stacks.

## code
### python
```python
class Node:
    def __init__(self, value):
        self.value, self.next = value, None

class LinkedQueue:
    def __init__(self):
        self.head = self.tail = None

    def enqueue(self, value):
        node = Node(value)
        if self.tail is None:
            self.head = self.tail = node
        else:
            self.tail.next = node
            self.tail = node

    def dequeue(self):
        if self.head is None:
            raise IndexError("queue is empty")
        value = self.head.value
        self.head = self.head.next
        if self.head is None:
            self.tail = None
        return value

queue = LinkedQueue()
for value in (1, 2, 3):
    queue.enqueue(value)
print(queue.dequeue(), queue.dequeue(), queue.dequeue())
queue.enqueue(9)
print(queue.dequeue())
```
Output:
```text
1 2 3
9
```
### javascript
```javascript
class TwoStackQueue {
  constructor() {
    this.input = [];
    this.output = [];
  }

  enqueue(value) {
    this.input.push(value);
  }

  dequeue() {
    if (!this.output.length) {
      while (this.input.length) this.output.push(this.input.pop());
    }
    return this.output.pop();
  }
}

const queue = new TwoStackQueue();
[1, 2, 3].forEach((v) => queue.enqueue(v));
const out = [queue.dequeue()];
queue.enqueue(4);
out.push(queue.dequeue(), queue.dequeue(), queue.dequeue());
console.log(out.join(" "));
```
Output:
```text
1 2 3 4
```

## quiz
1. At which end does a linked queue dequeue?
   - [ ] The tail
   - [x] The head
   - [ ] The middle
   - [ ] Either end
   > The head holds the oldest item.
2. What must happen when the last item is dequeued?
   - [ ] The head is kept
   - [x] The tail is reset to null
   - [ ] The queue is sorted
   - [ ] A sentinel is added
   > Otherwise the tail would point to a removed node.
3. When does a two-stack queue move items from the input stack to the output stack?
   - [ ] On every enqueue
   - [x] Only when the output stack is empty during a dequeue
   - [ ] Never
   - [ ] On every dequeue
   > This keeps the amortised cost constant.
4. What is the worst-case cost of enqueue in a linked queue with a tail reference?
   - [ ] O(n)
   - [x] O(1)
   - [ ] O(log n)
   - [ ] O(n squared)
   > Only the tail node and reference change.

# Valid Parentheses Pattern
kind: algorithm
time: O(n) for a string of length n, since each character is pushed at most once and popped at most once.
space: O(n) in the worst case for the stack when the string has many unclosed opening brackets, such as a string of only opening brackets.
practice: valid-parentheses

## intro
Given a string of brackets such as ([]{}), decide whether every opening bracket is closed by the same type in the correct order. The check is the textbook use of a stack: the most recent unmatched opening bracket must be the first to close, which is exactly last in, first out. The same pattern validates HTML tags, arithmetic expressions and nested data formats.

## theory
Algorithm:

- Create an empty stack and a map from each closing bracket to its opening bracket
- For each character: if it is an opening bracket, push it; if it is a closing bracket, the stack must be non-empty and its top must be the matching opening bracket, otherwise the string is invalid; pop the top
- After the last character, the string is valid only if the stack is empty (no unclosed opening brackets)

Why a stack: nesting means that brackets close in the reverse order they were opened. The top of the stack always holds the innermost unclosed bracket.

Results: `()[]{}` is valid, `{[]}` is valid, `([)]` is invalid (the closing bracket does not match the most recent opening one), `(` is invalid (left open at the end), `)` is invalid (closing without opening, the stack is empty) and the empty string is valid.

Counter versus stack: with a single bracket type, a counter suffices (increment on open, decrement on close, never negative, zero at the end). With several types the order matters, so a stack is required.

Variations:

- Minimum number of additions to make the string valid: count unmatched closings (when the stack is empty on a closing bracket) and unmatched openings left in the stack, and add them
- Longest valid parentheses substring: push indices instead of characters; keep a base index of the last unmatched position and, on a match, the length is the current index minus the new top of the stack. For `(()` the answer is 2, for `)()())` it is 4 and for the empty string 0.
- Remove the minimum number of invalid parentheses (backtracking or breadth first search over strings)
- Generate all valid combinations of n pairs (backtracking with counts of opening and closing brackets)
- Wildcard characters that may stand for any bracket or empty: track a range of possible open counts
- Checking HTML or XML tags: push tag names and compare on a closing tag; self-closing tags are not pushed
- Validating nested structures in JSON by the same mechanism

Complexity: single pass, so O(n) time. The stack can hold up to n items. Early termination: if the length is odd, the string cannot be valid; a quick check also rejects strings starting with a closing bracket.

Edge cases: empty string, one character, only opening brackets, only closing brackets, mixed with other characters (decide whether to ignore them, as when checking source code, or to reject them).

Implementation tip: pushing the expected closing bracket instead of the opening one simplifies the check, since the comparison becomes a direct equality with the current character.

## explain
1. Create an empty stack and a mapping between closing and opening brackets.
2. For each opening bracket, push it.
3. For each closing bracket, require a non-empty stack whose top is the matching opening bracket, then pop.
4. After processing all characters, require an empty stack.
5. Reject early on an odd length.
6. Test empty, single, mismatched and unclosed inputs.

## example
The Python function returns True for `()[]{}` and `{[]}`, False for `([)]`, `(` and `)`, and True for the empty string. The JavaScript function computes the length of the longest valid parentheses substring with a stack of indices and prints 2 for `(()`, 4 for `)()())` and 0 for the empty string.

## real
Compilers and editors check balanced brackets, HTML parsers validate tag nesting, and code formatters highlight matching pairs.

## pros
- Single pass with a very small amount of code
- Handles any number of bracket types
- Extends to tags and nested formats

## cons
- Needs O(n) memory for deeply nested input
- Only validates structure, not meaning
- Variants with wildcards need more reasoning

## uses
- Syntax checking in editors and compilers
- Validating HTML and XML nesting
- Checking arithmetic expressions
- Finding the longest balanced substring

## mistakes
- Popping from an empty stack when a closing bracket comes first
- Forgetting to check that the stack is empty at the end
- Comparing the wrong bracket pairs
- Treating unrelated characters as brackets

## interview
**Q:** How do you check that brackets are balanced and correctly nested?
**A:** Push opening brackets on a stack; on a closing bracket require the top to be its matching opening bracket and pop it; the string is valid if no mismatch occurs and the stack is empty at the end.

**Q:** Why does a single counter not work with several bracket types?
**A:** A counter cannot tell which type is open, so it would accept an interleaving like ([)] whose counts balance but whose nesting is wrong.

**Q:** How do you find the length of the longest valid parentheses substring?
**A:** Keep a stack of indices starting with a base marker; push the index of an opening bracket, and on a closing bracket pop and measure the distance from the new top, or push the index as the new base when the stack becomes empty.

## summary
Balanced bracket checking pushes openings and matches each closing bracket against the top of a stack in O(n) time. The pattern extends to tags, longest valid substrings and expression validation.

## codenote
The Python sample validates bracket strings. The JavaScript sample finds the longest valid substring.

## code
### python
```python
def is_valid(text):
    pairs = {")": "(", "]": "[", "}": "{"}
    stack = []
    for ch in text:
        if ch in pairs.values():
            stack.append(ch)
        elif ch in pairs:
            if not stack or stack.pop() != pairs[ch]:
                return False
    return not stack

for sample in ["()[]{}", "{[]}", "([)]", "(", ")", ""]:
    print(repr(sample), is_valid(sample))
```
Output:
```text
'()[]{}' True
'{[]}' True
'([)]' False
'(' False
')' False
'' True
```
### javascript
```javascript
function longestValid(text) {
  const stack = [-1];
  let best = 0;
  for (let i = 0; i < text.length; i++) {
    if (text[i] === "(") {
      stack.push(i);
    } else {
      stack.pop();
      if (stack.length === 0) stack.push(i);
      else best = Math.max(best, i - stack[stack.length - 1]);
    }
  }
  return best;
}

console.log(longestValid("(()"), longestValid(")()())"), longestValid(""));
```
Output:
```text
2 4 0
```

## quiz
1. What does the top of the stack represent during bracket matching?
   - [ ] The first bracket seen
   - [x] The innermost unclosed opening bracket
   - [ ] The last closing bracket
   - [ ] The number of brackets
   > A closing bracket must match it.
2. What does a non-empty stack at the end mean?
   - [ ] The string is valid
   - [x] Some opening brackets were never closed
   - [ ] Some closing brackets were extra
   - [ ] The string has odd length only
   > Unclosed openings remain on the stack.
3. Why is ([)] invalid?
   - [ ] The counts are unequal
   - [x] The closing bracket does not match the most recent opening bracket
   - [ ] It is too short
   - [ ] It contains a square bracket
   > Nesting order is violated.
4. What is the time complexity of the check?
   - [ ] O(n squared)
   - [x] O(n)
   - [ ] O(log n)
   - [ ] O(1)
   > Each character is pushed and popped at most once.
