# Opposite Direction Two Pointer
kind: algorithm
time: O(n) for a single pass, since each step moves one pointer inward and the pointers meet after at most n − 1 moves; preparation such as sorting adds O(n log n).
space: O(1) extra space, only two indexes are kept.
viz: two-pointer
practice: two-sum-indices

## intro
Two pointers that start at opposite ends of a sequence and move toward each other solve a surprising range of problems in a single linear pass. When the data is sorted, or symmetric in some way, comparing the two ends tells you which pointer to move, and every step discards at least one candidate for good.

## theory
Setup: `left = 0` and `right = n − 1`. While `left < right`, examine the pair at the two positions, decide from the comparison which end cannot be part of a better answer, and move that pointer inward. The loop ends when the pointers meet or cross, after at most n − 1 moves.

Why it is correct: the pattern relies on a monotonic property. Take the pair sum on a sorted array. If `a[left] + a[right]` is smaller than the target, then `a[left]` cannot pair with any element at or before `right`, because all of those are no larger than `a[right]`; so `left` can safely move up. If the sum is larger, `a[right]` cannot pair with anything at or after `left`; so `right` moves down. Each move eliminates a whole row of possible pairs, which is how n²/2 pairs are examined in n steps.

Problems that fit:

- Two sum on a sorted array, and the sorted variants of three sum and four sum (fix one or two elements and run the pointers on the rest)
- Reversing an array or a string in place by swapping the ends
- Palindrome checks, including versions that skip non-alphanumeric characters
- Container with most water and trapping rain water, where the shorter wall decides which pointer moves
- Partitioning an array around a value
- Sorted squares of a sorted array containing negatives: the largest squares are at the ends
- Merging from the back and checking pairs in a sorted list

Conditions for using it: the order must give a reason to discard an end, either because the array is sorted or because the problem is symmetric. On unsorted data, sort first (O(n log n)) if the indexes do not matter, or use a hash map instead.

Implementation details: use `left < right` for pair problems (the same element cannot be used twice) and `left <= right` when a single middle element must be processed; handle empty and single-element inputs; skip duplicates for unique-triplet problems; and return indexes in terms of the original array if you sorted a copy of pairs.

Cost summary: a single pass is O(n) and the space is O(1), improving on the O(n²) of checking all pairs and on the O(n) extra memory of the hash-map approach.

## explain
1. Confirm that the order or symmetry lets you discard one end on each comparison.
2. Initialise left to the first index and right to the last.
3. Compute the quantity of interest from the two elements.
4. If it matches the goal, record or return the answer.
5. Otherwise move the pointer whose element cannot improve the result.
6. Stop when the pointers meet, and test empty, single and two-element inputs.

## example
In the sorted array `[1, 2, 4, 7, 11, 15]` with target 15, the Python function starts at 1 and 15 (sum 16, too large, so move right down), then 1 and 11 (12, too small, move left up), then 2 and 11 (13) and finally 4 and 11 (15): the indices (2, 4) are found after 4 steps, far fewer than the 15 pairs of a brute-force search. For `[1, 2, 4]` and target 10 it gives up after 2 steps. The JavaScript lines check the palindrome "A man, a plan, a canal: Panama" by comparing the letters from both ends and reverse an array in place.

## real
Spell checkers compare strings from both ends, finance tools match buys and sells that net to zero in sorted ledgers, and graphics code tests symmetry of shapes using the same inward scan.

## pros
- Linear time with constant memory
- Short loops with an easy invariant
- Replaces nested loops over pairs

## cons
- Requires sorted or symmetric data
- Sorting loses original indexes unless saved
- Off-by-one errors in the loop condition and pointer updates

## uses
- Finding pairs and triplets with a target sum in sorted data
- Reversing and palindrome checks
- Maximising an area between two bounds
- Squaring and merging sorted data from the ends

## mistakes
- Applying it to unsorted data without sorting first
- Moving both pointers on every step
- Using left less than or equal to right when the same element must not be reused
- Forgetting to skip duplicates when unique answers are required

## interview
**Q:** Why does the two-pointer method find a pair with a given sum in a sorted array in linear time?
**A:** Each comparison lets you discard one end for good: if the sum is too small the left element cannot pair with anything remaining, and if it is too large the right element cannot, so one pointer moves per step and there are at most n minus 1 steps.

**Q:** When can't you use opposite-direction pointers?
**A:** When the data has no order or symmetry that justifies discarding an end, for example an unsorted array where indexes must be preserved; then a hash map is the better tool.

**Q:** How do you extend the technique to three sum?
**A:** Sort the array, fix one element and run the two-pointer pair search on the elements after it, skipping duplicates, for a total of O(n squared).

## summary
Start one pointer at each end of ordered data and move the one that cannot improve the answer. Each step eliminates candidates, giving O(n) time and O(1) space for pair sums, reversals, palindromes and area problems.

## codenote
The Python sample finds a sorted pair and counts steps. The JavaScript sample checks a palindrome and reverses in place.

## code
### python
```python
def pair_with_sum(items, target):
    left, right, steps = 0, len(items) - 1, 0
    while left < right:
        steps += 1
        total = items[left] + items[right]
        if total == target:
            return (left, right), steps
        if total < target:
            left += 1
        else:
            right -= 1
    return None, steps

print(pair_with_sum([1, 2, 4, 7, 11, 15], 15), pair_with_sum([1, 2, 4], 10))
```
Output:
```text
((2, 4), 4) (None, 2)
```
### javascript
```javascript
function isPalindrome(text) {
  const clean = text.toLowerCase().replace(/[^a-z0-9]/g, "");
  let left = 0;
  let right = clean.length - 1;
  while (left < right) {
    if (clean[left] !== clean[right]) return false;
    left++;
    right--;
  }
  return true;
}

console.log(isPalindrome("A man, a plan, a canal: Panama"), isPalindrome("race a car"));

const items = [1, 2, 3, 4];
for (let l = 0, r = items.length - 1; l < r; l++, r--) {
  [items[l], items[r]] = [items[r], items[l]];
}
console.log(items.join(","));
```
Output:
```text
true false
4,3,2,1
```

## quiz
1. Where do the pointers start in the opposite-direction technique?
   - [ ] Both at the first element
   - [x] At the first and last elements
   - [ ] At the middle
   - [ ] At random positions
   > They move toward each other.
2. In a sorted pair-sum search, which pointer moves when the sum is too large?
   - [ ] The left pointer up
   - [x] The right pointer down
   - [ ] Both
   - [ ] Neither
   > The right element is too big to pair with anything remaining.
3. What is the time complexity of the single pass?
   - [ ] O(n squared)
   - [x] O(n)
   - [ ] O(log n)
   - [ ] O(1)
   > Each step moves a pointer and they meet after at most n minus 1 moves.
4. Why is sorting needed for the pair-sum version?
   - [ ] To save memory
   - [x] Order tells which end to discard on each comparison
   - [ ] To find duplicates
   - [ ] Python requires it
   > Without order the discarded element might still pair with others.

# Same Direction Two Pointer
kind: algorithm
time: O(n) for a single pass, since each pointer only moves forward and each moves at most n times in total.
space: O(1) extra space when the array is modified in place; O(n) if a new array is built.
viz: two-pointer
practice: merge-two-sorted-arrays

## intro
Not all pointer pairs travel toward each other. In the same-direction pattern both indexes move forward, but at different speeds or with different roles: one scans, the other marks where to write; or each walks along its own sequence. The pattern compacts arrays in place, merges sorted lists and matches subsequences, all in one pass.

## theory
Two common roles:

- Reader and writer: the reader visits every element; the writer marks the next position to fill. The reader never falls behind the writer, so unread data is never overwritten. When the reader finds an element worth keeping, it is copied to the writer's position and the writer advances. At the end the writer index is the length of the kept prefix. This removes duplicates from a sorted array, removes all occurrences of a value, moves zeros to the end, and filters in place.
- Two sequences, each with its own pointer: advance the pointer of the sequence whose element should be consumed next. Merging two sorted arrays takes the smaller front element each time; checking whether a string is a subsequence of another advances the second pointer on every step and the first only on a match; intersecting two sorted lists advances the smaller one.

Invariants to state: for the in-place compaction, "`a[0..w-1]` holds the answer for `a[0..r-1]`"; for merging, "the output holds the smallest `i + j` elements in order".

Complexity: each pointer moves at most n times, so O(n) total (O(n + m) for two sequences of lengths n and m); space O(1) for in-place variants, a new list for the merge unless merging from the back into a pre-sized array.

Merging in place from the back: if the first array has spare room at its end (as in the classic problem of merging into `nums1`), use three pointers starting at the ends of the real elements and the end of the buffer, writing the larger element at the back, which avoids overwriting unread data.

Distinguishing from related patterns:

- Fast and slow pointers move at different speeds through one sequence, for cycles and midpoints
- Sliding windows keep both ends moving forward and track what lies between them
- Opposite-direction pointers move toward each other

Edge cases: an empty input, all elements kept or none, a single element, and sequences of different lengths with leftovers to append after one runs out.

## explain
1. Decide what each pointer represents: reader and writer, or one pointer per sequence.
2. Initialise them, usually the writer at the first position to fill and the reader at the first element to inspect.
3. Loop while the reader (or both sequences) has elements.
4. Copy or consume according to the rule, and advance the pointer or pointers involved.
5. After the loop, append leftovers or return the writer index as the new length.
6. Verify the invariant on a small example and test empty and degenerate inputs.

## example
The in-place `dedupe` function on the sorted array `[1, 1, 2, 2, 3]` keeps a write index: it ends with the length 3 and the first three elements `[1, 2, 3]`. Merging `[1, 3, 5]` and `[2, 4, 6, 8]` takes the smaller front element repeatedly and appends the leftover 8, giving `[1, 2, 3, 4, 5, 6, 8]`. The subsequence check finds "ace" in "abcde" but not "aec". The JavaScript function removes the value 3 from `[3, 2, 2, 3]` and returns the new length 2 with prefix `2,2`.

## real
Database engines merge sorted runs and intersect sorted index lists with this pattern, text tools filter lines in place and compilers compact arrays during passes without allocating new ones.

## pros
- One pass and constant extra memory for in-place filtering
- Natural fit for sorted merges
- Simple invariants that are easy to prove

## cons
- Changes the original array, which the caller may not expect
- Harder to see the invariant than for a plain loop
- Needs care with leftovers when sequences differ in length

## uses
- Removing duplicates and specific values in place
- Merging and intersecting sorted sequences
- Subsequence matching
- Filtering large arrays without allocating

## mistakes
- Letting the writer overtake the reader and overwriting unread data
- Forgetting to append the leftover tail after one sequence ends
- Returning the writer index minus one instead of the new length
- Using it on unsorted data for deduplication

## interview
**Q:** How do you remove duplicates from a sorted array in place?
**A:** Keep a write index at the last unique element; scan with a read index and, whenever the element differs from the one at the write index, advance the writer and copy it there. The writer index plus one is the new length.

**Q:** How do you check whether one string is a subsequence of another?
**A:** Walk through the longer string with one pointer and advance the pointer in the shorter string only when the characters match; the shorter is a subsequence if its pointer reaches the end.

**Q:** Why can the writer never overwrite unread elements?
**A:** The writer index is always at most the reader index, since it advances only when the reader has consumed an element, so positions the writer fills have already been read.

## summary
In the same-direction pattern both pointers move forward: a reader and a writer for in-place compaction, or one pointer per sorted sequence for merging and matching. It is linear, uses constant space for in-place work and rests on a simple invariant.

## codenote
The Python sample dedupes in place, merges and checks a subsequence. The JavaScript sample removes a value in place.

## code
### python
```python
def dedupe(items):
    write = 0
    for read in range(1, len(items)):
        if items[read] != items[write]:
            write += 1
            items[write] = items[read]
    return write + 1

data = [1, 1, 2, 2, 3]
length = dedupe(data)
print(length, data[:length])

def merge(a, b):
    i = j = 0
    merged = []
    while i < len(a) and j < len(b):
        if a[i] <= b[j]:
            merged.append(a[i])
            i += 1
        else:
            merged.append(b[j])
            j += 1
    return merged + a[i:] + b[j:]

print(merge([1, 3, 5], [2, 4, 6, 8]))

def is_subsequence(small, big):
    i = 0
    for char in big:
        if i < len(small) and small[i] == char:
            i += 1
    return i == len(small)

print(is_subsequence("ace", "abcde"), is_subsequence("aec", "abcde"))
```
Output:
```text
3 [1, 2, 3]
[1, 2, 3, 4, 5, 6, 8]
True False
```
### javascript
```javascript
function removeValue(items, value) {
  let write = 0;
  for (const item of items) {
    if (item !== value) items[write++] = item;
  }
  return write;
}

const items = [3, 2, 2, 3];
const length = removeValue(items, 3);
console.log(length, items.slice(0, length).join(","));
```
Output:
```text
2 2,2
```

## quiz
1. What are the two roles in the reader and writer pattern?
   - [ ] Sorter and searcher
   - [x] One pointer scans every element, the other marks where to write
   - [ ] Left and right ends
   - [ ] Fast and slow
   > Kept elements are copied to the writer position.
2. Why can the writer not pass the reader?
   - [ ] The array is read only
   - [x] It advances only after the reader has consumed an element
   - [ ] It starts at the end
   - [ ] Python forbids it
   > Positions the writer fills were already read.
3. What do you do when one sorted sequence runs out during a merge?
   - [ ] Stop and return
   - [x] Append the remaining elements of the other sequence
   - [ ] Sort the result
   - [ ] Restart the merge
   > The leftover tail is already in order.
4. What is the time of deduplicating a sorted array with this method?
   - [ ] O(n squared)
   - [x] O(n)
   - [ ] O(n log n)
   - [ ] O(1)
   > Each element is read once.

# Fast and Slow Pointers
kind: algorithm
time: O(n) to find the middle, detect a cycle or locate the cycle's start in a sequence with n nodes, since the fast pointer travels at most about 2n steps.
space: O(1) extra space, in contrast with the O(n) of a visited set.
viz: two-pointer

## intro
Send two runners around a track at different speeds and the faster one will lap the slower one only if the track is a loop. Fast and slow pointers, also called Floyd's tortoise and hare, use exactly this idea to detect cycles in linked lists and sequences, find the middle of a list in one pass and discover where a cycle begins, all with constant memory.

## theory
Setup: both pointers start at the head. In each step the slow pointer advances by one node and the fast pointer by two.

Finding the middle: when the fast pointer reaches the end (`fast` is null or `fast.next` is null), the slow pointer is at the middle, because it has travelled half as far. For a list of 5 nodes the middle is the third; for a list of 6 nodes this loop condition returns the second of the two middle nodes (the fourth).

Detecting a cycle: if the list has no cycle, the fast pointer reaches the end. If it has a cycle, both pointers eventually enter it, and inside the cycle the gap between them (measured along the cycle) shrinks by one each step, so the fast pointer must land on the slow one: they meet. The meeting happens within a number of steps proportional to the list length.

Finding the start of the cycle: when they meet, move one pointer back to the head and leave the other at the meeting point; advance both one step at a time. They meet again at the first node of the cycle. Why: let the distance from the head to the cycle start be a, the distance from the start to the meeting point b, and the cycle length c. The slow pointer has travelled `a + b`, the fast has travelled `2(a + b)`, and the difference `a + b` is a multiple of c. So `a = k·c − b`: walking a steps from the meeting point lands on the cycle start, exactly as walking a steps from the head does.

Other problems with the same idea:

- Find the duplicate number in an array of n + 1 integers from 1 to n: treat `i → nums[i]` as a linked list; the duplicate is the cycle entrance. For `[1, 3, 4, 2, 2]` the answer is 2 and for `[3, 1, 3, 4, 2]` it is 3, without modifying the array or extra memory.
- Happy number: repeatedly replace a number by the sum of the squares of its digits; the process either reaches 1 or enters a cycle, and fast and slow pointers detect which
- Is a linked list a palindrome: find the middle, reverse the second half, compare
- Remove the n-th node from the end: advance one pointer n steps ahead (a gap of n) and move both until the front reaches the end
- Circular array loop detection and the length of a cycle (count steps while moving one pointer around after meeting)

Comparison with a hash set of visited nodes: the set approach is O(n) time and O(n) space and also reports the first repeated node; Floyd's method needs O(1) space.

Edge cases: an empty list, a single node, a node pointing to itself (a one-node cycle), and checking both `fast` and `fast.next` before dereferencing.

## explain
1. Place both pointers at the head.
2. Move slow by one and fast by two in each iteration.
3. For the middle, stop when fast cannot move two more steps and return slow.
4. For a cycle, stop and report true if the two pointers are the same node; report false if fast reaches the end.
5. To find the cycle start, reset one pointer to the head and advance both by one until they meet.
6. Test a list without a cycle, a self-loop, and lists of even and odd length.

## example
For the lists built in Python, the middle of 1 to 5 is 3 and of 1 to 6 is 4. A list 1 to 6 whose last node points back to the node with value 3 has its cycle start reported as 3, and a plain list 1, 2, 3 reports no cycle. Finding the duplicate with the array-as-list trick gives 2 for `[1, 3, 4, 2, 2]` and 3 for `[3, 1, 3, 4, 2]`. The JavaScript function decides that 19 is a happy number and 2 is not by running the digit-square sequence with fast and slow pointers.

## real
Garbage collectors and memory debuggers detect reference cycles, operating systems check for loops in linked structures, and cryptanalysis uses cycle finding in Pollard's rho factoring.

## pros
- Constant memory instead of a visited set
- One pass for the middle and cycle detection
- Works on implicit sequences defined by a function

## cons
- The proof of the cycle start step is not obvious
- Modifies pointers' roles and is easy to get off by one
- Cannot report the whole cycle without further steps

## uses
- Detecting cycles in linked lists and functional sequences
- Finding the middle of a list in one pass
- Finding the duplicate number without extra memory
- Deciding happy numbers and similar iterated functions

## mistakes
- Dereferencing fast.next.next without checking fast and fast.next
- Moving both pointers at the same speed
- Forgetting that for even lengths the loop returns the second middle node
- Resetting both pointers instead of one when finding the cycle start

## interview
**Q:** How does Floyd's algorithm detect a cycle?
**A:** A slow pointer moves one step and a fast pointer two steps. In a list with a cycle the fast pointer eventually catches the slow one inside the cycle, so they meet; if the list ends, there is no cycle.

**Q:** How do you find the start of the cycle?
**A:** After the pointers meet, move one pointer to the head and advance both one step at a time; they meet again at the first node of the cycle, because the distance from the head to the cycle start equals the distance from the meeting point to it, modulo the cycle length.

**Q:** How do you find the middle node of a linked list in one pass?
**A:** Advance a slow pointer by one and a fast pointer by two; when the fast pointer reaches the end, the slow pointer is at the middle.

## summary
Fast and slow pointers move at one and two steps per iteration. They find the middle of a list, detect cycles when they meet and locate the cycle's start with a second walk, all in O(n) time and O(1) space.

## codenote
The Python sample builds linked lists and finds the middle, the cycle start and a duplicate. The JavaScript sample decides happy numbers.

## code
### python
```python
class Node:
    def __init__(self, value):
        self.value = value
        self.next = None

def build(values, cycle_to=None):
    nodes = [Node(v) for v in values]
    for first, second in zip(nodes, nodes[1:]):
        first.next = second
    if cycle_to is not None:
        nodes[-1].next = nodes[cycle_to]
    return nodes[0]

def middle(head):
    slow = fast = head
    while fast and fast.next:
        slow, fast = slow.next, fast.next.next
    return slow.value

def cycle_start(head):
    slow = fast = head
    while fast and fast.next:
        slow, fast = slow.next, fast.next.next
        if slow is fast:
            slow = head
            while slow is not fast:
                slow, fast = slow.next, fast.next
            return slow.value
    return None

print(middle(build([1, 2, 3, 4, 5])), middle(build([1, 2, 3, 4, 5, 6])))
print(cycle_start(build([1, 2, 3, 4, 5, 6], cycle_to=2)), cycle_start(build([1, 2, 3])))

def find_duplicate(numbers):
    slow = fast = numbers[0]
    while True:
        slow, fast = numbers[slow], numbers[numbers[fast]]
        if slow == fast:
            break
    slow = numbers[0]
    while slow != fast:
        slow, fast = numbers[slow], numbers[fast]
    return slow

print(find_duplicate([1, 3, 4, 2, 2]), find_duplicate([3, 1, 3, 4, 2]))
```
Output:
```text
3 4
3 None
2 3
```
### javascript
```javascript
const step = (n) => String(n).split("").reduce((sum, digit) => sum + digit * digit, 0);

function isHappy(n) {
  let slow = n;
  let fast = step(n);
  while (fast !== 1 && slow !== fast) {
    slow = step(slow);
    fast = step(step(fast));
  }
  return fast === 1;
}

console.log(isHappy(19), isHappy(2));
```
Output:
```text
true false
```

## quiz
1. How fast do the slow and fast pointers move?
   - [ ] Both one step
   - [x] Slow one step, fast two steps per iteration
   - [ ] Slow two steps, fast one step
   - [ ] Both two steps
   > The speed difference makes the fast pointer catch up inside a cycle.
2. What tells you that a list has a cycle?
   - [ ] The fast pointer reaches the end
   - [x] The two pointers become the same node
   - [ ] The slow pointer reaches the end
   - [ ] The list has an even length
   > The fast pointer laps the slow one in a loop.
3. How do you find the node where the cycle begins?
   - [ ] Move the slow pointer back one step
   - [x] Reset one pointer to the head and advance both one step at a time until they meet
   - [ ] Count the nodes
   - [ ] Reverse the list
   > The two distances are equal modulo the cycle length.
4. What is the extra space used by Floyd's algorithm?
   - [ ] O(n)
   - [x] O(1)
   - [ ] O(log n)
   - [ ] O(n squared)
   > Only two pointers are kept.

# Fixed Size Sliding Window
kind: algorithm
time: O(n) for a window of fixed size k over n elements, because each element enters and leaves the window once; recomputing every window from scratch would cost O(n · k).
space: O(1) for sums and counts, O(k) for structures that store the window such as a deque.
viz: sliding-window
practice: sliding-window-maximum

## intro
When a question asks about every contiguous block of k elements, such as the best total of three days or the maximum in each window of a stream, the key observation is that neighbouring windows share all but two elements. Instead of recomputing from scratch, slide the window by adding the new element and removing the old one.

## theory
Pattern: keep a summary of the current window, such as its sum, count or maximum. When the window moves one position to the right, update the summary by incorporating the element that enters (`a[i]`) and discarding the element that leaves (`a[i − k]`). The first window is built from the first k elements.

For sums the update is a constant-time arithmetic step: `window += a[i] − a[i − k]`. The total cost is O(k) for the first window plus O(1) for each of the remaining n − k slides: O(n) overall, compared with O(n · k) for recomputation.

Typical problems:

- Maximum (or minimum) sum of a subarray of size k: for `[4, 2, 1, 7, 8, 1, 2, 8, 1, 0]` and k = 3 the best sum is 16, found in the windows `1, 7, 8` and `7, 8, 1`
- Moving average, as in monitoring dashboards: `[1, 2, 3, 4, 5, 6]` with k = 3 gives `[2, 3, 4, 5]`
- Number of distinct elements in every window (maintain counts in a hash map)
- Substrings of fixed length with a property, such as counting windows with a given number of vowels
- Averages and other aggregates that can be updated incrementally
- Sliding window maximum: updating a maximum when the old maximum leaves is not O(1) with a plain variable. A monotonic deque of indexes solves it: keep indexes in the deque whose values are in decreasing order; before adding index i, pop from the back every index whose value is not greater than `a[i]`, because those elements can never be the maximum while `a[i]` is in the window; pop from the front if its index has left the window; the front is then the maximum. Each index is pushed and popped at most once, so the cost is O(n). For `[1, 3, -1, -3, 5, 3, 6, 7]` and k = 3 the maxima are `[3, 3, 5, 5, 6, 7]`.

Choosing the data structure for the summary: a number for sums and counts; a hash map for frequencies; a deque for extremes; a sorted container or two heaps for medians (with lazy deletion).

Edge cases: k larger than the array (no complete window), k equal to 1 or to n, empty input, negative numbers (they do not break fixed windows, unlike variable windows), and the off-by-one in the index of the leaving element.

Related ideas: prefix sums can answer any window sum in O(1) after O(n) preparation and are an alternative for sums, but they do not extend to maxima or distinct counts; sliding windows also apply to streams where the data cannot be stored.

## explain
1. Decide what to maintain for the window: sum, counts, extremes.
2. Initialise it from the first k elements.
3. For each next index, add the entering element and remove the element that is k positions back.
4. Record or compare the summary after each slide.
5. For maxima use a deque of indexes in decreasing value order.
6. Test k equal to the length, k of one and k larger than the length.

## example
The `best_window` function builds the first sum and slides: for `[4, 2, 1, 7, 8, 1, 2, 8, 1, 0]` and k = 3 it returns 16. The deque version of the window maximum returns `[3, 3, 5, 5, 6, 7]` for `[1, 3, -1, -3, 5, 3, 6, 7]`. The JavaScript program computes the moving averages 2, 3, 4 and 5 for `[1, 2, 3, 4, 5, 6]`.

## real
Monitoring systems compute moving averages and maxima over the last minutes of metrics, trading platforms keep rolling statistics, and network devices track traffic in sliding time windows.

## pros
- Linear time instead of recomputing each window
- Constant memory for sums and counts
- The deque technique extends it to maxima and minima

## cons
- Aggregates that cannot be updated incrementally need richer structures
- Off-by-one errors on the leaving element are common
- Incomplete windows at the start need special handling

## uses
- Maximum or average over every block of k elements
- Rolling statistics over streams
- Counting distinct values or matches in fixed-length substrings
- Sliding window maximum and minimum

## mistakes
- Recomputing the whole window sum at each step
- Removing the wrong element when the window slides
- Failing to pop expired indexes from the front of the deque
- Starting to record results before the first full window exists

## interview
**Q:** How do you compute the maximum sum of a subarray of size k efficiently?
**A:** Compute the sum of the first k elements, then slide: add the new element and subtract the one that left, keeping the best sum seen. This takes O(n) time and O(1) space.

**Q:** How does a monotonic deque give the sliding window maximum in O(n)?
**A:** It stores indexes of candidates in decreasing order of value. New elements remove smaller ones from the back, expired indexes are removed from the front, and the front is always the maximum; each index enters and leaves once.

**Q:** Why not use prefix sums for the sliding window maximum?
**A:** Prefix sums answer sum queries only; a maximum cannot be obtained by subtracting prefix values, so a deque or similar structure is needed.

## summary
A fixed window slides over the data, updating a summary by adding the entering element and removing the leaving one. Sums and counts take O(1) per step and maxima need a monotonic deque, giving O(n) overall.

## codenote
The Python sample computes the best window sum and the window maximum with a deque. The JavaScript sample computes moving averages.

## code
### python
```python
from collections import deque

def best_window(values, k):
    window = sum(values[:k])
    best = window
    for i in range(k, len(values)):
        window += values[i] - values[i - k]
        best = max(best, window)
    return best

print(best_window([4, 2, 1, 7, 8, 1, 2, 8, 1, 0], 3))

def window_max(values, k):
    candidates, result = deque(), []
    for i, value in enumerate(values):
        while candidates and values[candidates[-1]] <= value:
            candidates.pop()
        candidates.append(i)
        if candidates[0] <= i - k:
            candidates.popleft()
        if i >= k - 1:
            result.append(values[candidates[0]])
    return result

print(window_max([1, 3, -1, -3, 5, 3, 6, 7], 3))
```
Output:
```text
16
[3, 3, 5, 5, 6, 7]
```
### javascript
```javascript
const values = [1, 2, 3, 4, 5, 6];
const k = 3;
let window = 0;
const averages = [];

for (let i = 0; i < values.length; i++) {
  window += values[i];
  if (i >= k) window -= values[i - k];
  if (i >= k - 1) averages.push(window / k);
}
console.log(averages.join(","));
```
Output:
```text
2,3,4,5
```

## quiz
1. What changes when a fixed window slides one position?
   - [ ] All elements are replaced
   - [x] One element enters and one leaves
   - [ ] The window doubles
   - [ ] The array is sorted
   > The window shares k minus 1 elements with its neighbour.
2. What is the time to compute all window sums for window size k over n elements?
   - [ ] O(n times k)
   - [x] O(n)
   - [ ] O(k)
   - [ ] O(n squared)
   > Each slide is a constant-time update.
3. What structure maintains the window maximum in O(n) total?
   - [ ] A stack of sums
   - [x] A monotonic deque of indexes
   - [ ] A sorted copy of the window
   - [ ] A hash set
   > Indexes with dominated values are removed.
4. When should the first result be recorded?
   - [ ] At the first element
   - [x] After the first k elements have been read
   - [ ] At the last element only
   - [ ] Before reading anything
   > A full window needs k elements.

# Variable Size Sliding Window
kind: algorithm
time: O(n) because the right end advances n times and the left end advances at most n times in total, so each element enters and leaves the window at most once.
space: O(1) for sums and counters, O(k) for a map of up to k tracked items.
viz: sliding-window

## intro
In many problems the best block of elements has no fixed length: the shortest subarray whose sum reaches a target, the longest run with at most k bad elements. The variable window grows from the right until a condition breaks or is met, then shrinks from the left, and the two ends together make only one pass over the data.

## theory
Template: keep `left` and `right` as the window ends and a summary of what is inside. For each `right`, add `a[right]` to the summary. While the window violates the rule (or, for shortest-window problems, while it satisfies the goal), remove `a[left]` and advance `left`. Record the best length at the right moment.

Two families:

- Longest window satisfying a constraint (the rule is "at most something"): expand every step; whenever the constraint is broken, shrink until it holds again; update the maximum length after restoring the constraint. Example: the longest run of ones if at most k zeros may be flipped.
- Shortest window satisfying a condition (the goal is "at least something"): expand until the condition holds; while it holds, record the length and shrink from the left to try to make it smaller. Example: the shortest subarray with sum at least a target.

Why it is linear: although there is a loop inside a loop, `left` never moves backward and moves at most n times; each element is added once and removed at most once.

When it works: the condition must be monotonic with respect to the window, so that extending the window can only make a "at most" condition harder and a "at least" condition easier. This holds for non-negative numbers with sums, for counts of bad elements and for distinct-element limits. It fails for sums with negative numbers, because adding an element may decrease the sum, so shrinking from the left no longer follows a predictable direction; use prefix sums and a hash map in that case.

Examples with results:

- Shortest subarray with sum at least 7 in `[2, 3, 1, 2, 4, 3]` has length 2 (the elements 4 and 3); with target 100 on `[1, 2]` there is none, so the answer is 0
- Longest run of ones in `[1, 1, 0, 0, 1, 1, 1, 0, 1, 1]` if at most two zeros may be flipped is 7
- In JavaScript, the longest subarray of `[3, 1, 2, 7, 4, 2, 1, 1, 5]` with sum at most 10 has length 4

Details: initialise the best length to infinity for shortest searches and to zero for longest searches; handle the empty window and a window that becomes empty after shrinking; update `best` inside the shrinking loop for shortest searches and after it for longest searches; and mind that the sum may need a wide integer type.

Variants: windows measured in time or in characters, circular arrays (double the array), counting windows rather than measuring the best one (add `right − left + 1` for the number of valid windows ending at right), and "exactly k" problems solved as "at most k" minus "at most k − 1".

## explain
1. Decide whether you want the longest window under a limit or the shortest window meeting a goal.
2. Maintain a summary of the window: sum, count of bad items, or frequency map.
3. Advance right one element at a time, adding it.
4. Shrink from the left while the window is invalid (longest) or while it is valid (shortest).
5. Record the best length at the proper moment.
6. Check the monotonic assumption, especially for negative numbers.

## example
The Python `min_len` returns 2 for target 7 in `[2, 3, 1, 2, 4, 3]` and 0 when the target cannot be reached. The `max_ones` function allows two flips and returns 7 for the ones-and-zeros array. The JavaScript function finds that the longest subarray with sum at most 10 in `[3, 1, 2, 7, 4, 2, 1, 1, 5]` has length 4.

## real
Rate limiters and traffic analysers check bursts over variable periods, text editors highlight the shortest span that contains all search terms, and data tools find the longest stretch meeting a quality threshold.

## pros
- Linear time for many subarray problems
- Constant memory for sums and counts
- A reusable template with a clear invariant

## cons
- Requires a monotonic condition
- Fails with negative values for sums
- Updating the best length at the wrong moment gives off-by-one errors

## uses
- Shortest subarray with a minimum sum
- Longest run with a limited number of defects
- Longest segment with bounded distinct elements
- Counting valid windows

## mistakes
- Using it for sums that contain negative numbers
- Updating the best answer before the window is valid
- Shrinking with an if instead of a while, leaving the window invalid
- Forgetting to return zero when no window qualifies

## interview
**Q:** What is the difference between the longest-window and shortest-window templates?
**A:** For the longest window you shrink only when the window becomes invalid and record the length after restoring validity. For the shortest window you shrink while the window is valid, recording its length each time.

**Q:** Why is the variable sliding window O(n) despite the nested loop?
**A:** The left pointer only moves forward and moves at most n times across the whole run, so the total number of pointer moves is at most 2n.

**Q:** When does the sliding window fail?
**A:** When the condition is not monotonic, such as subarray sums with negative numbers, because shrinking or growing the window no longer moves the sum in a known direction.

## summary
The variable window expands on the right and shrinks on the left while a condition holds or fails, finding the longest or shortest valid block in O(n). It needs a monotonic condition and careful placement of the best-length update.

## codenote
The Python sample finds the shortest subarray for a sum and the longest run after flips. The JavaScript sample finds the longest subarray under a sum limit.

## code
### python
```python
def shortest_with_sum(target, values):
    left = total = 0
    best = float("inf")
    for right, value in enumerate(values):
        total += value
        while total >= target:
            best = min(best, right - left + 1)
            total -= values[left]
            left += 1
    return 0 if best == float("inf") else best

print(shortest_with_sum(7, [2, 3, 1, 2, 4, 3]), shortest_with_sum(100, [1, 2]))

def longest_ones(values, flips):
    left = zeros = best = 0
    for right, value in enumerate(values):
        zeros += value == 0
        while zeros > flips:
            zeros -= values[left] == 0
            left += 1
        best = max(best, right - left + 1)
    return best

print(longest_ones([1, 1, 0, 0, 1, 1, 1, 0, 1, 1], 2))
```
Output:
```text
2 0
7
```
### javascript
```javascript
function longestSumAtMost(values, limit) {
  let left = 0;
  let sum = 0;
  let best = 0;
  for (let right = 0; right < values.length; right++) {
    sum += values[right];
    while (sum > limit) sum -= values[left++];
    best = Math.max(best, right - left + 1);
  }
  return best;
}

console.log(longestSumAtMost([3, 1, 2, 7, 4, 2, 1, 1, 5], 10));
```
Output:
```text
4
```

## quiz
1. In the shortest-window template, when do you shrink the window?
   - [ ] When it is invalid
   - [x] While it still satisfies the goal
   - [ ] Never
   - [ ] Only at the end
   > Each valid window is a candidate that might be made smaller.
2. Why is the algorithm still linear with a loop inside a loop?
   - [ ] The inner loop never runs
   - [x] The left pointer only moves forward, at most n times in total
   - [ ] The data is sorted
   - [ ] The right pointer moves twice
   > Each element is added once and removed at most once.
3. When does a sliding window with sums fail?
   - [ ] When the numbers are positive
   - [x] When the array contains negative numbers
   - [ ] When the array is sorted
   - [ ] When the window is short
   > The sum is no longer monotonic in the window size.
4. What does the longest-run example allow?
   - [ ] At most two ones
   - [x] At most two zeros to be flipped to ones
   - [ ] Exactly two windows
   - [ ] Only sorted input
   > The window may contain up to that many zeros.

# Window with Hash Map
kind: algorithm
time: O(n) for the window techniques, since each character enters and leaves once and every map update is O(1) on average; comparing two frequency maps of alphabet size k costs O(k) per step in the anagram example.
space: O(k) for a frequency map over k distinct symbols, at most O(n).
viz: sliding-window
practice: longest-substring-without-repeat

## intro
A plain sliding window can summarise its contents with a single number, but many problems need to know which elements are inside and how many of each. Pairing the window with a hash map of counts gives that knowledge in constant time per update and unlocks problems about distinct elements, anagrams and required characters.

## theory
Pattern: the window `[left, right]` is paired with `counts`, a dictionary from element to its number of occurrences in the window. Adding an element increments its count. Removing an element decrements its count and, if the count reaches zero, deletes the key, so `len(counts)` is the number of distinct elements in the window. This lets conditions such as "at most k distinct" and "contains all required characters" be checked in O(1).

Representative problems:

- Longest substring with at most k distinct characters: expand right, add the character; while `len(counts) > k`, remove the leftmost character; track the maximum length. For "eceba" with k = 2 the answer is 3 (the substring "ece"), and for "aa" with k = 1 it is 2. In JavaScript the same method gives 4 for "araaci" with two distinct characters.
- Find all anagrams of a pattern p in a text s: maintain a fixed window of length `len(p)`; compare the window's counts with the pattern's counts after each slide (or maintain a count of how many characters are satisfied to avoid comparing whole maps). For s = "cbaebabacd" and p = "abc" the start indexes are `[0, 6]`.
- Fruit into baskets (longest subarray with at most two distinct values), permutation in string, longest repeating character replacement, minimum window substring (next lessons), longest substring with all characters unique (the later lesson)
- Count subarrays with at most k distinct values, and "exactly k distinct" as at most k minus at most k − 1

Design details:

- Delete keys whose count reaches zero; otherwise `len(counts)` overstates the distinct elements
- For fixed-size windows, remove the element at `i − len(p)` as the window slides
- With a small alphabet, an array of counters (26 or 256 entries) replaces the dictionary and speeds up comparisons; comparing two arrays costs O(alphabet), still constant
- To avoid O(k) comparisons at each step, keep an integer `matched` counting how many distinct characters have the required count, updating it when counts cross the target

Complexity: linear in the text length, times the cost of the map operations; memory proportional to the number of distinct symbols.

Pitfalls: using `counts[x] -= 1` without deleting at zero when `len` is used as the distinct measure, mixing up the window bounds when the window length is fixed, and counting overlapping anagram matches incorrectly.

## explain
1. Decide whether the window is fixed or variable.
2. Maintain a count map of the window contents.
3. When adding or removing an element, update the map and delete keys that reach zero.
4. Check the condition using the map: its size for distinct counts, or comparison with the target counts.
5. Move the window and record the result when the condition holds.
6. Test empty strings, a single character and patterns longer than the text.

## example
The Python function `at_most_k` returns 3 for "eceba" with k = 2 and 2 for "aa" with k = 1. The anagram finder slides a window of length 3 over "cbaebabacd" and compares its counter to the counter of "abc", reporting the start indexes 0 and 6. The JavaScript function finds that the longest substring of "araaci" with at most two distinct characters has length 4 and that "aabbcc" also gives 4.

## real
Plagiarism and copy detectors, search engines highlighting spans with query terms, and DNA tools looking for motifs with a given composition use windows with count maps.

## pros
- Constant-time checks of window composition
- Handles distinct and required-character conditions
- Linear time over the data

## cons
- More memory than a plain sum
- Forgetting to delete zero counts breaks distinct-count logic
- Comparing whole maps at every step can be costly for large alphabets

## uses
- Longest substring with limited distinct characters
- Finding anagrams and permutations in text
- Fruit and basket style problems
- Windows that must contain required symbols

## mistakes
- Leaving zero counts in the map and miscounting distinct elements
- Shrinking with an if instead of a while
- Rebuilding the count map from scratch on every slide
- Mixing up window length and the index of the leaving character

## interview
**Q:** How do you find the longest substring with at most k distinct characters?
**A:** Use a window and a frequency map. Add each new character, and while the map has more than k keys, remove characters from the left, deleting a key when its count reaches zero. Track the maximum window length.

**Q:** How do you find all anagrams of a pattern in a string efficiently?
**A:** Slide a window of the pattern's length and update a count map by adding the entering character and removing the leaving one; whenever the window's counts equal the pattern's, record the start index. This is linear.

**Q:** Why delete a key when its count reaches zero?
**A:** The number of keys is the number of distinct elements in the window, and a leftover zero entry would overcount.

## summary
Pair the window with a frequency map to know what it contains: update counts on entry and exit, delete zeros and test conditions in constant time. This solves distinct-element limits and anagram searches in linear time.

## codenote
The Python sample finds the longest substring with at most k distinct characters and anagram positions. The JavaScript sample solves the two-distinct case.

## code
### python
```python
from collections import Counter, defaultdict

def longest_with_k_distinct(text, k):
    counts = defaultdict(int)
    left = best = 0
    for right, char in enumerate(text):
        counts[char] += 1
        while len(counts) > k:
            counts[text[left]] -= 1
            if counts[text[left]] == 0:
                del counts[text[left]]
            left += 1
        best = max(best, right - left + 1)
    return best

print(longest_with_k_distinct("eceba", 2), longest_with_k_distinct("aa", 1))

def find_anagrams(text, pattern):
    need, window, starts = Counter(pattern), Counter(), []
    for i, char in enumerate(text):
        window[char] += 1
        if i >= len(pattern):
            old = text[i - len(pattern)]
            window[old] -= 1
            if window[old] == 0:
                del window[old]
        if window == need:
            starts.append(i - len(pattern) + 1)
    return starts

print(find_anagrams("cbaebabacd", "abc"))
```
Output:
```text
3 2
[0, 6]
```
### javascript
```javascript
function longestTwoDistinct(text) {
  const counts = new Map();
  let left = 0;
  let best = 0;
  for (let right = 0; right < text.length; right++) {
    counts.set(text[right], (counts.get(text[right]) ?? 0) + 1);
    while (counts.size > 2) {
      const char = text[left++];
      counts.set(char, counts.get(char) - 1);
      if (counts.get(char) === 0) counts.delete(char);
    }
    best = Math.max(best, right - left + 1);
  }
  return best;
}

console.log(longestTwoDistinct("araaci"), longestTwoDistinct("aabbcc"));
```
Output:
```text
4 4
```

## quiz
1. What does the size of the count map represent?
   - [ ] The window length
   - [x] The number of distinct elements in the window, if zero counts are deleted
   - [ ] The total count
   - [ ] The array length
   > Each key stands for one distinct element.
2. When the count of a character drops to zero, what should you do?
   - [ ] Leave the key with value zero
   - [x] Delete the key
   - [ ] Double the count
   - [ ] Restart the window
   > Otherwise the distinct count is wrong.
3. How does a fixed-size window find anagrams of a pattern?
   - [ ] By sorting the text
   - [x] It slides a window of the pattern's length and compares its counts with the pattern's counts
   - [ ] By reversing the pattern
   - [ ] By recursion
   > Equal counts mean the window is a rearrangement of the pattern.
4. What is the time complexity of the longest-substring window with a map?
   - [ ] O(n squared)
   - [x] O(n)
   - [ ] O(n log n)
   - [ ] O(2 to the n)
   > Each character enters and leaves once, with constant-time map updates.

# Longest Substring Without Repeat
kind: algorithm
time: O(n) for a string of n characters, since the right pointer visits each character once and the left pointer only moves forward.
space: O(min(n, a)) for the map of last seen positions, where a is the alphabet size.
practice: longest-substring-without-repeat

## intro
Given a string, find the length of the longest stretch in which no character appears twice. It is one of the most asked sliding window problems because the obvious solution checks every substring in cubic time, while a window that jumps its left edge past a repeated character does it in a single pass.

## theory
Idea: keep a window `[left, right]` that contains no repeated character. Extend `right` one character at a time. If the new character already appears inside the window, move `left` just past its previous occurrence; otherwise the window simply grows. After each step the window is again free of repeats, and its length is a candidate answer.

Two implementations:

- Set with a shrinking loop: add `s[right]`; while it is already in the set, remove `s[left]` and advance left. Simple, but each character may be added and removed once, so it is O(n) amortised.
- Dictionary of last positions: store the index where each character last appeared. When `s[right]` was seen at index `p` and `p >= left`, set `left = p + 1`. The jump avoids the inner loop, and the condition `p >= left` is essential: an earlier occurrence outside the current window must be ignored.

For "abcabcbb" the longest window is "abc" of length 3; for "bbbbb" it is "b" of length 1; for "pwwkew" it is "wke" of length 3 (the substring "pwke" would not be contiguous); for the empty string it is 0. In JavaScript the same function gives 3, 1, 3 and, for "dvdf", also 3, a case that breaks solutions that simply restart the window at the repeated character instead of moving the left edge after the earlier occurrence.

To report the substring as well as its length, record the start index when a new best is found.

Complexity: O(n) time, and the map holds at most min(n, a) entries, where a is 26 for lowercase letters, 128 for ASCII, or the number of distinct code points for Unicode text. With a small known alphabet, a fixed-size array of last positions replaces the dictionary.

Common errors:

- Forgetting the `p >= left` check and moving left backward
- Using `left = p` instead of `p + 1`
- Storing counts instead of positions and mishandling the removal of characters
- Resetting the whole window when a repeat is found (which loses valid parts and can give wrong answers on "dvdf")
- Failing on the empty string
- Treating surrogate pairs and combining characters as separate characters in Unicode text

Related problems: longest substring with at most k distinct characters, longest repeating character replacement, minimum window substring, longest subarray with distinct elements, and the longest substring without repeating characters when characters are compared case-insensitively.

## explain
1. Keep a map from character to the index of its most recent occurrence, and a left edge starting at zero.
2. For each right index, check whether the current character occurred at an index at or after the left edge.
3. If so, set left to one past that index.
4. Update the stored last position of the current character.
5. Update the best length with right minus left plus one.
6. Test the empty string, all-equal characters, all-distinct characters and the case "dvdf".

## example
The Python function returns the pair of length and substring: `(3, 'abc')` for "abcabcbb", `(1, 'b')` for "bbbbb", `(3, 'wke')` for "pwwkew" and `(0, '')` for the empty string. The JavaScript function returns only the lengths 3, 1, 3 and 3 for "abcabcbb", "bbbbb", "pwwkew" and "dvdf".

## real
Text editors measure unique runs for highlighting, network tools search for the longest unique sequence in logs, and the problem is a standard interview exercise for the sliding window.

## pros
- Linear time with a short implementation
- Works on any sequence of hashable elements
- The jumping left edge avoids an inner loop

## cons
- The last-position check is easy to get wrong
- Unicode handling needs care
- Memory depends on the alphabet size

## uses
- Finding the longest run of distinct characters
- Extracting the longest duplicate-free segment of any sequence
- Building blocks for harder window problems
- Interview practice for sliding windows

## mistakes
- Omitting the check that the previous position lies inside the window
- Setting the left edge to the old position instead of one past it
- Restarting the window from the current character after a repeat
- Not handling an empty input

## interview
**Q:** How do you find the longest substring without repeating characters in O(n)?
**A:** Use a window and a map from characters to their last index. On a repeat inside the window, move the left edge to one past the earlier occurrence; update the best length each step.

**Q:** Why must the previous index be compared with the left edge?
**A:** A character may have appeared before the window started; such an old occurrence is not in the window and must not move the left edge backward or forward incorrectly.

**Q:** What is the space complexity?
**A:** O(min(n, a)) for the map of last positions, where a is the size of the alphabet.

## summary
Maintain a window without repeats: when the new character was seen inside the window, move the left edge just past its previous index. One pass with a map of last positions gives the answer in O(n).

## codenote
The Python sample returns length and substring for several inputs. The JavaScript sample returns lengths, including the tricky case.

## code
### python
```python
def longest_unique(text):
    last = {}
    left = best = start = 0
    for right, char in enumerate(text):
        if char in last and last[char] >= left:
            left = last[char] + 1
        last[char] = right
        if right - left + 1 > best:
            best = right - left + 1
            start = left
    return best, text[start:start + best]

for text in ["abcabcbb", "bbbbb", "pwwkew", ""]:
    print(longest_unique(text))
```
Output:
```text
(3, 'abc')
(1, 'b')
(3, 'wke')
(0, '')
```
### javascript
```javascript
function longestUnique(text) {
  const last = new Map();
  let left = 0;
  let best = 0;
  for (let right = 0; right < text.length; right++) {
    if (last.has(text[right]) && last.get(text[right]) >= left) {
      left = last.get(text[right]) + 1;
    }
    last.set(text[right], right);
    best = Math.max(best, right - left + 1);
  }
  return best;
}

console.log(longestUnique("abcabcbb"), longestUnique("bbbbb"), longestUnique("pwwkew"), longestUnique("dvdf"));
```
Output:
```text
3 1 3 3
```

## quiz
1. What does the map store in the last-position solution?
   - [ ] The count of each character
   - [x] The index of the most recent occurrence of each character
   - [ ] The longest substring so far
   - [ ] The characters sorted
   > It lets the left edge jump past a repeat.
2. When a repeated character is found inside the window, where does left move?
   - [ ] To zero
   - [ ] To the repeated character's old index
   - [x] To one past its old index
   - [ ] To the current index plus one
   > The window must exclude the earlier occurrence.
3. What is the longest substring without repeats in "pwwkew"?
   - [ ] pww
   - [ ] pwke
   - [x] wke
   - [ ] kew only counts as length 2
   > "wke" has length 3, and "pwke" is not contiguous.
4. What is the time complexity?
   - [ ] O(n squared)
   - [x] O(n)
   - [ ] O(n cubed)
   - [ ] O(log n)
   > Both pointers only move forward.
