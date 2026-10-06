# Monotonic Stack
kind: algorithm
time: O(n) for the whole array, because every element is pushed once and popped at most once, even though the inner while loop looks quadratic.
space: O(n) for the stack in the worst case, such as a strictly decreasing array in a next greater element problem.
viz: monotonic-stack

## intro
A monotonic stack keeps its items in increasing or decreasing order by popping everything that would break the order before pushing a new item. That one rule turns a family of problems that look quadratic, such as finding the next warmer day for each day, into a single linear pass, because each pop settles a question about the item removed.

## theory
Definition: a monotonic stack maintains the invariant that, from bottom to top, the values (or the values at the stored indices) are strictly or non-strictly increasing, or decreasing. Typical template for a decreasing stack of indices:

- For each index `i` from left to right, while the stack is not empty and `values[stack top] < values[i]`, pop the top index `j`: the value at `i` is the first value to the right of `j` that is larger, so record the answer for `j`
- Push `i`
- Indices left on the stack at the end have no larger value to their right

Why it is linear: each index is pushed exactly once and popped at most once, so the total number of operations over the whole array is at most 2n.

Which direction and strictness: a decreasing stack finds the next greater element; an increasing stack finds the next smaller element. Choose strict or non-strict comparison depending on how equal values should be treated.

What an element means when it is popped: the element is popped by the first element that beats it, so the new element is the answer for the popped one, and the element below it on the stack is the previous element that was not beaten (the previous greater element). A single pass therefore gives both the next greater to the right and the previous greater to the left for every element.

Example 1: daily temperatures. For the temperatures 73, 74, 75, 71, 69, 72, 76, 73 the number of days to wait for a warmer temperature is 1, 1, 4, 2, 1, 1, 0, 0: day 2 (75) waits four days for 76, and the final days never see a warmer day, so they get 0.

Example 2: largest rectangle in a histogram. With bar heights 2, 1, 5, 6, 2, 3 the largest rectangle has area 10 (the bars of heights 5 and 6 can be combined at height 5 and width 2). Maintain an increasing stack of indices; when a lower bar arrives, pop bars taller than it, and each popped bar of height h forms a rectangle whose width extends from the new stack top plus one to the current index minus one. A sentinel bar of height 0 at the end flushes the remaining indices. The same technique gives the maximal rectangle of ones in a binary matrix, row by row.

Other problems:

- Next smaller element, stock span, online stock span
- Trapping rain water (alternative to two pointers)
- Remove k digits to make the smallest number, and remove duplicate letters in lexicographically smallest order
- Sum of subarray minimums or maximums (count how many subarrays each element is the minimum of using previous and next smaller)
- 132 pattern detection and buildings with an ocean view
- Car fleet and asteroid collisions use a stack with a comparison rule instead of a monotone invariant

Pitfalls:

- Storing values instead of indices when the distance or position is needed
- Mixing up strict and non-strict comparisons with duplicates, which double counts or misses elements in subarray minimum sums
- Forgetting to process the elements that remain on the stack at the end
- Circular arrays: loop over the array twice (indices modulo n) to find next greater elements across the wrap

Complexity summary: O(n) time, O(n) space, and a sentinel often removes the need for a cleanup loop.

## explain
1. Decide whether you need the next greater or smaller element, and choose the stack order accordingly.
2. Iterate over the elements, storing indices on the stack.
3. While the new element breaks the order, pop and record the answer for the popped index.
4. Push the new index.
5. After the loop, handle the indices left on the stack (no answer, or flush with a sentinel).
6. Check duplicates against the strictness of the comparison.

## example
The Python function returns 1, 1, 4, 2, 1, 1, 0, 0 for the temperatures 73, 74, 75, 71, 69, 72, 76 and 73. The JavaScript function computes the largest rectangle in the histogram 2, 1, 5, 6, 2, 3 and returns 10, and for the single bar histogram 4 it returns 4.

## real
Financial charts compute stock spans and breakout levels with monotonic stacks, text editors find matching structures in documents, and rendering engines use them for visibility and skyline problems.

## pros
- Linear time for problems that look quadratic
- Answers are settled at the moment an element is popped
- One pass gives both previous and next greater elements

## cons
- The invariant and the strictness of comparisons are subtle
- Storing indices rather than values is easy to forget
- Not applicable when no monotone ordering helps

## uses
- Next greater and next smaller element problems
- Stock span and daily temperature questions
- Largest rectangle in a histogram
- Counting subarrays by their minimum

## mistakes
- Using a nested loop instead of letting pops settle answers
- Pushing values when positions are required
- Ignoring the leftover items after the last element
- Choosing the wrong strictness when elements are equal

## interview
**Q:** What is a monotonic stack?
**A:** A stack whose items are kept in increasing or decreasing order by popping the items that violate the order before each push, which lets each pop resolve a question about the removed item.

**Q:** Why is the monotonic stack algorithm O(n) even with a loop inside a loop?
**A:** Every element is pushed once and popped at most once, so the total number of pops over the whole run is at most n.

**Q:** How does the largest rectangle in a histogram use a monotonic stack?
**A:** An increasing stack of bar indices is maintained; when a shorter bar arrives, the taller bars are popped and each defines a rectangle spanning from the previous stack item to the current index, with the best area kept.

## summary
A monotonic stack pops items that break its order before pushing, which makes next greater or smaller queries and histogram rectangles solvable in O(n). Store indices, mind the strictness for duplicates and flush the remaining items.

## codenote
The Python sample solves the daily temperatures problem. The JavaScript sample finds the largest rectangle in a histogram.

## code
### python
```python
def days_to_warmer(temperatures):
    answer = [0] * len(temperatures)
    stack = []
    for day, temperature in enumerate(temperatures):
        while stack and temperatures[stack[-1]] < temperature:
            earlier = stack.pop()
            answer[earlier] = day - earlier
        stack.append(day)
    return answer

print(days_to_warmer([73, 74, 75, 71, 69, 72, 76, 73]))
```
Output:
```text
[1, 1, 4, 2, 1, 1, 0, 0]
```
### javascript
```javascript
function largestRectangle(heights) {
  const stack = [];
  let best = 0;
  for (let i = 0; i <= heights.length; i++) {
    const height = i === heights.length ? 0 : heights[i];
    while (stack.length && heights[stack[stack.length - 1]] > height) {
      const tall = heights[stack.pop()];
      const left = stack.length ? stack[stack.length - 1] : -1;
      best = Math.max(best, tall * (i - left - 1));
    }
    stack.push(i);
  }
  return best;
}

console.log(largestRectangle([2, 1, 5, 6, 2, 3]), largestRectangle([4]));
```
Output:
```text
10 4
```

## quiz
1. What does a monotonic stack maintain?
   - [ ] Alphabetical order
   - [x] Items in increasing or decreasing order from bottom to top
   - [ ] Random order
   - [ ] The sum of items
   > Violating items are popped before each push.
2. Why is the algorithm linear?
   - [ ] It uses binary search
   - [x] Each element is pushed once and popped at most once
   - [ ] The stack is small
   - [ ] It sorts first
   > The inner loop's work is amortised across the array.
3. What happens when an element is popped in the next greater element algorithm?
   - [ ] It is discarded without a result
   - [x] The new element is the next greater element of the popped one
   - [ ] The stack is cleared
   - [ ] The array is sorted
   > The popping element is the first larger value to its right.
4. What is the largest rectangle in the histogram 2, 1, 5, 6, 2, 3?
   - [ ] 8
   - [x] 10
   - [ ] 12
   - [ ] 6
   > Bars 5 and 6 give a rectangle of height 5 and width 2.

# Monotonic Queue
kind: algorithm
time: O(n) for scanning n items, since each index enters the deque once and leaves it once; each query for the current minimum or maximum is O(1).
space: O(k) for a window of size k, or O(n) for windows defined by a value condition.
practice: sliding-window-maximum

## intro
A monotonic queue is a deque that keeps its items sorted by value while also following the arrival order, so the front always holds the minimum or maximum of the items currently in the window. It answers questions about the extremes of a moving window in constant time per step, which a plain queue or a heap cannot do without extra work.

## theory
Invariant for a window minimum: the deque stores indices whose values increase from front to back, and all indices are inside the current window.

For each new index `i`:

- Remove from the back every index whose value is greater than or equal to `values[i]`: such items can never be the minimum while `i` is in the window, because `i` is both newer (leaves later) and smaller or equal
- Append `i` at the back
- Remove from the front any index that has left the window (index at most `i − k` for a window of size k)
- The front of the deque is the index of the minimum of the current window

Because each index is appended once and removed once, the total work is O(n), whereas scanning every window costs O(n · k) and a heap costs O(n log n) (with lazy deletion).

Example: values 1, 3, −1, −3, 5, 3, 6, 7 and window size 3 give the minima −1, −3, −3, −3, 3, 3 for the six windows. The maximum version flips the comparison and gives 3, 3, 5, 5, 6, 7.

Why dominated items can be discarded: if an older item is not smaller than a newer one, it will expire first and can never be the answer while the newer one is present. The deque therefore holds only candidates that could still become the minimum later.

Other uses of the same structure:

- Longest subarray whose maximum minus minimum is at most a limit: keep two monotonic deques (one for the maximum, one for the minimum) and move the left edge forward while the difference exceeds the limit. For the values 8, 2, 4, 7 and limit 4 the answer is 2 (the pair 2, 4 or 4, 7), and for 10, 1, 2, 4, 7, 2 with limit 5 it is 4 (the values 2, 4, 7, 2).
- Dynamic programming optimisation: when `dp[i] = max(dp[j]) + cost` over a sliding range of j (constrained subsequence sum, jump game with a window), a monotonic deque of candidate j values gives O(n) instead of O(n · k)
- Shortest subarray with sum at least K (with negative numbers allowed), using prefix sums and a deque of increasing prefix values
- Moving averages are simpler, but moving extremes need this structure

Relation to the monotonic stack: the stack handles next greater queries without a window; the queue adds expiry at the front, so it serves windows. Both rely on the same argument that dominated items are useless.

Implementation details:

- Store indices, not values, so you can test whether the front has expired and look up values
- Use a real deque (collections.deque in Python, a head index over an array in JavaScript), since removing from the front of a plain list is O(n)
- Decide whether equal values are removed from the back (usually yes for minima and maxima queries)
- Windows shorter than k at the start: begin recording answers when `i` reaches `k − 1`

Edge cases: window size 1 (the answer is the array itself), window larger than the array, all equal values and strictly monotone input (the deque grows to the window size).

## explain
1. Keep a deque of indices in order of increasing value for minima.
2. For each new item, pop from the back while the back value is greater than or equal to the new value.
3. Append the new index.
4. Pop from the front while the front index has left the window.
5. Read the front as the window minimum once the window is full.
6. Flip the comparison for maxima.

## example
The Python function returns the sliding window minima −1, −3, −3, −3, 3, 3 for the values 1, 3, −1, −3, 5, 3, 6, 7 with window size 3. The JavaScript function finds the longest subarray whose range is at most the limit with two monotonic deques: 2 for 8, 2, 4, 7 with limit 4 and 4 for 10, 1, 2, 4, 7, 2 with limit 5.

## real
Monitoring systems compute rolling minimum latencies, trading engines track moving highs and lows, and constrained dynamic programming problems use the structure for speed.

## pros
- Constant amortised time per step for window extremes
- Simple invariant based on dominated items
- Works for windows defined by values as well as sizes

## cons
- Needs a true deque for efficiency
- Index bookkeeping is easy to get wrong
- Only handles extremes, not medians

## uses
- Sliding window minimum and maximum
- Longest subarray with a bounded range
- Optimising dynamic programming over windows
- Rolling statistics in monitoring tools

## mistakes
- Storing values and then being unable to tell when the front expired
- Using a list and popping from the front in linear time
- Removing from the back with strict instead of non-strict comparison when ties matter
- Reporting an answer before the first window is full

## interview
**Q:** What does a monotonic queue store and why?
**A:** Indices of candidate extreme values in sorted order, because an older item that is not better than a newer one can never be the extreme of a window containing both, so it is discarded.

**Q:** What is the time complexity of the sliding window minimum with a monotonic queue?
**A:** O(n) overall, since each index enters and leaves the deque once, with O(1) amortised work per step.

**Q:** How do you find the longest subarray where the difference between maximum and minimum is at most a limit?
**A:** Use two monotonic deques for the window maximum and minimum and advance the left end while their difference exceeds the limit, recording the longest window.

## summary
A monotonic queue keeps window candidates sorted by value and by age, so the front is always the extreme and every item enters and leaves once. It gives O(n) sliding extremes and powers bounded-range subarray and windowed dynamic programming solutions.

## codenote
The Python sample computes window minima. The JavaScript sample finds the longest subarray with a bounded range.

## code
### python
```python
from collections import deque

def window_minimums(values, size):
    candidates, result = deque(), []
    for i, value in enumerate(values):
        while candidates and values[candidates[-1]] >= value:
            candidates.pop()
        candidates.append(i)
        if candidates[0] <= i - size:
            candidates.popleft()
        if i >= size - 1:
            result.append(values[candidates[0]])
    return result

print(window_minimums([1, 3, -1, -3, 5, 3, 6, 7], 3))
```
Output:
```text
[-1, -3, -3, -3, 3, 3]
```
### javascript
```javascript
function longestBounded(values, limit) {
  const high = [];
  const low = [];
  let left = 0;
  let best = 0;
  for (let right = 0; right < values.length; right++) {
    while (high.length && values[high[high.length - 1]] <= values[right]) high.pop();
    while (low.length && values[low[low.length - 1]] >= values[right]) low.pop();
    high.push(right);
    low.push(right);
    while (values[high[0]] - values[low[0]] > limit) {
      left++;
      if (high[0] < left) high.shift();
      if (low[0] < left) low.shift();
    }
    best = Math.max(best, right - left + 1);
  }
  return best;
}

console.log(longestBounded([8, 2, 4, 7], 4), longestBounded([10, 1, 2, 4, 7, 2], 5));
```
Output:
```text
2 4
```

## quiz
1. What does the front of a monotonic queue hold for a window minimum?
   - [ ] The newest index
   - [x] The index of the smallest value in the window
   - [ ] The largest value
   - [ ] The median
   > Values increase from front to back.
2. Why can an older item be discarded when a newer one is not larger for a minimum query?
   - [ ] It is stored twice
   - [x] The newer item stays in the window longer and is at least as small
   - [ ] Old items are invalid
   - [ ] It would waste memory
   > The older item can never be the unique minimum again.
3. What must the deque store to detect expired items?
   - [ ] Only values
   - [x] Indices
   - [ ] Sums
   - [ ] Booleans
   > The front index is compared with the left edge of the window.
4. What are the window minima of 1, 3, -1, -3, 5, 3, 6, 7 with window size 3?
   - [ ] 1, 3, -1, -3
   - [x] -1, -3, -3, -3, 3, 3
   - [ ] 3, 3, 5, 5, 6, 7
   - [ ] -3, -3, -3, 3, 3, 6
   > The minima flip into maxima 3, 3, 5, 5, 6, 7 when the comparison is reversed.

# Next Greater Element
kind: algorithm
time: O(n) for one array using a monotonic stack, and O(n + m) when answering lookups for a second array through a hash map.
space: O(n) for the stack and the result.

## intro
For every element in an array, the next greater element is the first larger value to its right, or −1 if there is none. Checking each element against everything to its right takes quadratic time; a stack that remembers the elements still waiting for a larger partner solves the problem in one pass.

## theory
Stack method (scan from the left):

- Keep a stack of indices whose next greater element has not been found; their values are non-increasing from bottom to top
- For each index `i`, while the stack is not empty and the value at the stack top is smaller than `values[i]`, pop the index and set its answer to `values[i]`
- Push `i`
- Whatever remains on the stack has answer −1

For `[4, 5, 2, 25]` the answers are 5, 25, 25, −1. The element 4 waits until 5 arrives, 5 and 2 both wait for 25, and 25 has nothing larger to its right.

Scanning from the right is an equivalent formulation: keep a stack of candidates, pop while the top is not greater than the current value, then the top (if any) is the answer, and push the current value. It also runs in O(n).

Circular variant: the array is treated as circular, so the search for an element continues from the start after the end. Loop over indices from 0 to 2n − 1 using `i mod n` and push only the first n indices. For `[1, 2, 1]` the answers are 2, −1, 2: the last 1 wraps around and finds 2.

Next Greater Element I (two arrays): for each value of `nums1`, which is a subset of `nums2`, find its next greater element within `nums2`. Compute a map from each value of `nums2` to its next greater element with the stack method, then look up every value of `nums1`. For `nums1 = [4, 1, 2]` and `nums2 = [1, 3, 4, 2]` the answers are −1, 3, −1.

Related questions:

- Next greater element II (circular), as above
- Next smaller element and previous greater or smaller element, by changing the direction and comparison
- Daily temperatures, which asks for the distance (index difference) instead of the value
- Stock span: the number of consecutive days before today with a price at most today's price (previous greater element index)
- Buildings with an ocean view and visible people in a queue
- Largest rectangle and sum of subarray minimums, which need both previous and next smaller elements

Duplicates: the comparison decides what counts as greater. With a strict comparison, equal values do not pop each other, so the next greater element of an equal pair is the first strictly larger value. State this in the code, and test with equal elements.

Complexity: each element is pushed and popped at most once, so the loop is linear. The brute-force version is O(n squared) and fine only for small arrays.

Pitfalls: pushing values and then not knowing the position, forgetting to initialise the answers to −1, and in the circular variant pushing indices beyond n, which inserts duplicates.

Testing: strictly increasing (each answer is the next element), strictly decreasing (all −1), all equal (all −1), single element and random arrays compared with the brute force version.

## explain
1. Initialise the answers to −1 and an empty stack of indices.
2. For each index from left to right, pop indices whose value is less than the current value and set their answers to it.
3. Push the current index.
4. For the circular variant, loop twice around the array and push only during the first loop.
5. For two arrays, store the answers in a map and look up the values of the first array.
6. Test increasing, decreasing and equal inputs.

## example
The Python functions return 5, 25, 25, −1 for `[4, 5, 2, 25]` and 2, −1, 2 for the circular array `[1, 2, 1]`. The JavaScript function answers the two-array version with `nums1 = [4, 1, 2]` and `nums2 = [1, 3, 4, 2]` and prints −1, 3, −1.

## real
Charting tools find the next higher price, schedulers find the next task with higher priority, and skyline renderers find the next taller building.

## pros
- Linear time compared with the quadratic scan
- Short code with a clear invariant
- Adapts to circular arrays and two-array lookups

## cons
- Positions are lost if values are pushed instead of indices
- The circular version needs a second pass
- Handling equal values depends on a strictness choice

## uses
- Finding the next larger value for each element
- Circular array variants
- Looking up answers for a subset of values
- Building blocks for stock span and rectangle problems

## mistakes
- Not initialising the result with minus one
- Pushing indices from the second loop in the circular version
- Using a non-strict comparison when equal values should not count as greater
- Comparing against the stack values without checking that the stack is non-empty

## interview
**Q:** How do you find the next greater element for every item in O(n)?
**A:** Scan left to right with a stack of unresolved indices; when the current value is larger than the value at the top, pop and record the current value as its answer, then push the current index.

**Q:** How do you handle a circular array?
**A:** Iterate over 2n indices using the index modulo n and push indices only during the first n steps, so elements near the end can find larger values at the beginning.

**Q:** How do you solve the two-array version where nums1 is a subset of nums2?
**A:** Compute each element's next greater element within nums2 using the stack, store the results in a hash map by value and look up every element of nums1.

## summary
The next greater element is found for all items in O(n) with a stack of indices that are still waiting for a larger value. Circular arrays loop twice, and two-array lookups use a hash map of the computed answers.

## codenote
The Python sample handles linear and circular arrays. The JavaScript sample answers the two-array version.

## code
### python
```python
def next_greater(values, circular=False):
    n = len(values)
    answer = [-1] * n
    stack = []
    for i in range(2 * n if circular else n):
        value = values[i % n]
        while stack and values[stack[-1]] < value:
            answer[stack.pop()] = value
        if i < n:
            stack.append(i)
    return answer

print(next_greater([4, 5, 2, 25]))
print(next_greater([1, 2, 1], circular=True))
```
Output:
```text
[5, 25, 25, -1]
[2, -1, 2]
```
### javascript
```javascript
function nextGreaterLookup(nums1, nums2) {
  const greater = new Map();
  const stack = [];
  for (const value of nums2) {
    while (stack.length && stack[stack.length - 1] < value) greater.set(stack.pop(), value);
    stack.push(value);
  }
  return nums1.map((value) => greater.get(value) ?? -1);
}

console.log(nextGreaterLookup([4, 1, 2], [1, 3, 4, 2]).join(" "));
```
Output:
```text
-1 3 -1
```

## quiz
1. What is the next greater element of the last item of an array?
   - [ ] Itself
   - [x] -1, because nothing lies to its right
   - [ ] The first item
   - [ ] Zero
   > There is no element to its right in the linear version.
2. When is an index popped from the stack?
   - [ ] When it is the largest
   - [x] When a larger value arrives to its right
   - [ ] When the array ends
   - [ ] When it is duplicated
   > The arriving value is its next greater element.
3. How does the circular version treat the array?
   - [ ] It reverses the array
   - [x] It scans twice around using the index modulo the length
   - [ ] It sorts the array
   - [ ] It removes duplicates
   > Elements near the end can then see larger values at the start.
4. What is the answer for the item 1 in nums1 = [4, 1, 2] with nums2 = [1, 3, 4, 2]?
   - [ ] 4
   - [x] 3
   - [ ] -1
   - [ ] 2
   > The first larger value to the right of 1 in nums2 is 3.

# Sliding Window Maximum Queue
kind: algorithm
time: O(n) for an array of n numbers, since every index is appended to and removed from the deque at most once; brute force costs O(n · k) and a heap solution O(n log n).
space: O(k) for the deque holding at most the indices of one window, plus O(n − k + 1) for the output.
viz: deque-sliding-window
practice: sliding-window-maximum

## intro
Given an array and a window size k, report the maximum of every window of k consecutive elements. The answer for a window can be read from the front of a deque that holds candidate indices in decreasing order of value, which turns an O(n · k) scan into one linear pass. It is the standard showcase for combining a queue with the monotonic idea.

## theory
Deque invariant: the deque contains indices of the current window, ordered by index from front to back, and the values at those indices are strictly decreasing from front to back. The front is therefore the maximum of the window.

Processing index `i`:

- Drop from the front the index that has left the window, that is `deque[0] <= i − k`
- Drop from the back every index whose value is less than or equal to `values[i]`; they can never be the maximum while `i` is present, since `i` is newer and at least as large
- Append `i` at the back
- Once `i >= k − 1`, record `values[deque[0]]` as the maximum of the window that ends at `i`

Each index is appended once and removed once (from the back or the front), so the total work is O(n). The deque holds at most k indices.

Example: for the array 1, 3, −1, −3, 5, 3, 6, 7 and k = 3, the window maxima are 3, 3, 5, 5, 6, 7. Window by window: 1 3 −1 gives 3; 3 −1 −3 gives 3; −1 −3 5 gives 5; −3 5 3 gives 5; 5 3 6 gives 6; 3 6 7 gives 7. When the value 5 arrives, it removes 3, −1 and −3 from the back, since none of them can ever beat it while it is in the window.

Alternatives and trade-offs:

- Brute force: take the maximum of each window, O(n · k), simple and fine for small k
- Max-heap with lazy deletion: push (value, index), and pop the top while its index is outside the window; O(n log n)
- Two arrays of block maxima (prefix and suffix maxima inside blocks of size k): O(n) without a deque, using the fact that any window spans at most two blocks
- Sparse table or segment tree: answers arbitrary range maximum queries after preprocessing, which is overkill for fixed windows
- Monotonic deque: O(n) and O(k) extra, the usual best choice

Edge cases: k = 1 (output equals the input), k equal to n (a single maximum), k larger than n (invalid or empty depending on the problem), equal values (remove with less-than-or-equal to keep the deque strictly decreasing, or keep ties but remember that the older equal item expires first), and negative numbers (the algorithm uses comparisons only, so it works unchanged).

Implementation notes: in Python use `collections.deque` with `popleft`; in JavaScript use a head pointer over an array or a deque class, because `shift` on a large array is O(n) in the worst case. Store indices so the expiry test is a simple comparison. Pre-size the output list for n − k + 1 windows.

Variations: the minimum (flip the comparison), the maximum with a moving window defined by time stamps instead of counts (expire by time), and the maximum of each window in two dimensions by applying the method along rows and then columns.

## explain
1. Create an empty deque of indices and an empty result list.
2. For each index, remove the front index if it is outside the window.
3. Remove indices from the back while their values are not greater than the new value.
4. Append the new index.
5. When the first full window is reached, append the front value to the result at every step.
6. Test k equal to 1, k equal to n and equal values.

## example
The Python function returns 3, 3, 5, 5, 6, 7 for 1, 3, −1, −3, 5, 3, 6, 7 with k = 3. The JavaScript function returns 7 and 4 for 7, 2, 4 with k = 2, and 1 and −1 for 1, −1 with k = 1, which is the input itself.

## real
Signal processing computes rolling peaks, trading dashboards show the highest price in the last minutes, and network monitors track the maximum latency in a moving interval.

## pros
- Linear time regardless of window size
- Small memory proportional to the window
- Handles negative numbers without special cases

## cons
- Index bookkeeping is error prone
- Needs a real deque for efficient front removal
- Does not directly support arbitrary changing windows

## uses
- Maximum of every window of fixed size
- Rolling peak detection in streams
- Constrained dynamic programming transitions
- Moving high and low indicators

## mistakes
- Using the wrong expiry condition, such as index minus k less than or equal to the front
- Removing from the back with a strict comparison and keeping dominated equal items inconsistently
- Recording results before the first full window
- Using an array shift for the front removal on large inputs

## interview
**Q:** How does the deque solution compute the maximum of every window in O(n)?
**A:** It keeps indices of candidate maxima with decreasing values, removing expired indices from the front and smaller values from the back, so the front always holds the window maximum and each index is processed once.

**Q:** Why are smaller values removed from the back when a larger one arrives?
**A:** The new value stays in the window longer and is larger, so the smaller older values can never become the maximum again.

**Q:** What are the alternatives to the deque and their costs?
**A:** A heap with lazy deletion takes O(n log n), the block prefix and suffix maxima method takes O(n), and brute force takes O(n times k).

## summary
A deque of decreasing candidate values gives every window maximum in one pass, with the front as the answer and O(n) time overall. Store indices, expire from the front and drop dominated values from the back.

## codenote
The Python sample returns the window maxima. The JavaScript sample runs the same method on small inputs.

## code
### python
```python
from collections import deque

def window_maximums(values, size):
    candidates, result = deque(), []
    for i, value in enumerate(values):
        if candidates and candidates[0] <= i - size:
            candidates.popleft()
        while candidates and values[candidates[-1]] <= value:
            candidates.pop()
        candidates.append(i)
        if i >= size - 1:
            result.append(values[candidates[0]])
    return result

print(window_maximums([1, 3, -1, -3, 5, 3, 6, 7], 3))
```
Output:
```text
[3, 3, 5, 5, 6, 7]
```
### javascript
```javascript
function windowMaximums(values, size) {
  const candidates = [];
  let head = 0;
  const result = [];
  values.forEach((value, i) => {
    if (candidates.length > head && candidates[head] <= i - size) head++;
    while (candidates.length > head && values[candidates[candidates.length - 1]] <= value) candidates.pop();
    candidates.push(i);
    if (i >= size - 1) result.push(values[candidates[head]]);
  });
  return result;
}

console.log(windowMaximums([7, 2, 4], 2).join(" "), "|", windowMaximums([1, -1], 1).join(" "));
```
Output:
```text
7 4 | 1 -1
```

## quiz
1. What does the front of the deque hold in this algorithm?
   - [ ] The newest index
   - [x] The index of the current window maximum
   - [ ] The smallest value
   - [ ] The window size
   > Values decrease from front to back.
2. Why are smaller values removed from the back when a larger value arrives?
   - [ ] To sort the output
   - [x] They can never be the maximum while the larger newer value is in the window
   - [ ] To save time on the front
   - [ ] They are duplicates
   > The newer value outlasts and beats them.
3. How many window maxima does an array of n numbers have with window size k?
   - [ ] n
   - [x] n − k + 1
   - [ ] n − k
   - [ ] k
   > The first window ends at index k minus one.
4. What is the main cost advantage over a heap?
   - [ ] Less code
   - [x] O(n) time instead of O(n log n)
   - [ ] No memory needed
   - [ ] Works only for sorted input
   > Each index enters and leaves the deque once.

# BFS Queue Applications
kind: algorithm
time: O(V + E) for a graph with V vertices and E edges, and O(R · C) for a grid with R rows and C columns, because every cell is enqueued at most once.
space: O(V) or O(R · C) for the queue and the visited set in the worst case.
practice: bfs-shortest-path-length

## intro
Breadth first search explores a graph or grid level by level: all cells at distance 1, then all at distance 2, and so on. A queue is what produces that order, since the cells discovered first are expanded first. This makes BFS the standard way to find shortest paths in unweighted grids and graphs and to simulate processes that spread in rounds.

## theory
BFS template:

- Put the start (or all starts) in a queue and mark it visited; record distance 0
- While the queue is not empty: dequeue a cell, and for each neighbour that is valid and not visited, mark it visited, set its distance to the current distance plus 1, and enqueue it
- Mark cells as visited when they are enqueued, not when dequeued, otherwise the same cell may be queued many times

Why BFS finds shortest paths in unweighted graphs: the queue holds cells in nondecreasing order of distance, so the first time a cell is discovered it is through a shortest route.

Level by level processing: to know the current level, process the queue in rounds, using the queue length at the start of each round. This gives a natural counter for minutes, steps or generations.

Applications:

- Shortest path in a grid with obstacles: for a 4 by 4 grid with walls, BFS returns the minimum number of moves from the start to the goal, or −1 if the goal is unreachable
- Multi-source BFS: put several sources in the queue at distance 0, for example all rotten oranges, and the spread is simulated simultaneously. In the grid with rows `2 1 1`, `1 1 0` and `0 1 1`, every orange becomes rotten after 4 minutes; if some fresh orange is isolated by an empty cell, the answer is −1.
- Level order traversal of a tree: collect node values level by level
- Word ladder: transform one word into another changing one letter at a time, where each word is a vertex; the shortest transformation length is a BFS depth
- Number of islands and flood fill (BFS or DFS both work)
- Shortest path with state: add extra state to the vertex, such as the number of obstacles removed, to find paths with limited changes
- Social network distance: degrees of separation between two users
- 0-1 BFS: a deque variant for edges with weights 0 and 1
- Bipartite checking by colouring levels alternately
- Topological sort with Kahn's algorithm uses a queue of vertices with no remaining dependencies

Comparison with DFS: BFS uses a queue and finds shortest paths in unweighted graphs but can use a lot of memory for wide graphs; DFS uses a stack or recursion, needs memory proportional to depth, and suits connectivity and ordering problems rather than shortest distances.

Complexity: each vertex is enqueued once and each edge examined once (twice for undirected graphs), so O(V + E). On a grid with 4 neighbours it is O(R · C).

Pitfalls: marking visited too late (queues explode), forgetting bounds checks, reconstructing the path (store parents or predecessors), using BFS on weighted graphs (use Dijkstra), and bidirectional improvements (searching from both ends meets in the middle and reduces the explored area from b to the power d to about twice b to the power d over two).

Testing: start equals goal (distance 0), unreachable goal (−1), a grid with no obstacles (the Manhattan distance) and a single cell.

## explain
1. Enqueue the start cells and mark them visited with distance zero.
2. Dequeue a cell and look at its neighbours.
3. For each valid unvisited neighbour, mark it, record the distance and enqueue it.
4. Stop when the goal is dequeued or the queue is empty.
5. For simulations, process the queue one level at a time and count levels.
6. Check unreachable targets and the start equal to the goal.

## example
The Python function finds the shortest path length in a 4 by 4 grid with walls using BFS: it returns 6 when the target is reachable and −1 when a wall blocks it. The JavaScript function simulates rotting oranges with a multi-source BFS and returns 4 for the grid with rows `2 1 1`, `1 1 0` and `0 1 1` and −1 when a fresh orange is isolated.

## real
Navigation grids in games use BFS for shortest paths, social networks compute degrees of separation, and crawlers visit pages level by level from a seed.

## pros
- Finds shortest paths in unweighted graphs
- Natural level by level processing
- Linear time in the size of the graph

## cons
- Queue memory can grow large for wide graphs
- Not suitable for weighted edges
- Needs parent tracking for path reconstruction

## uses
- Shortest paths in unweighted grids and graphs
- Multi-source spreading simulations
- Level order traversal of trees
- Word ladder and state space puzzles

## mistakes
- Marking cells visited when dequeued instead of when enqueued
- Skipping the bounds and wall checks for neighbours
- Using BFS for graphs whose edges have different weights
- Not distinguishing levels when the answer counts rounds

## interview
**Q:** Why does BFS find the shortest path in an unweighted graph?
**A:** The queue processes vertices in order of increasing distance from the start, so the first time a vertex is reached is along a path with the fewest edges.

**Q:** When should a vertex be marked visited in BFS?
**A:** When it is added to the queue, so that it cannot be enqueued again by other neighbours before it is processed.

**Q:** How does multi-source BFS work?
**A:** All source vertices are enqueued at distance zero at the start, and the search then expands from all of them simultaneously, which gives each cell its distance to the nearest source.

## summary
BFS uses a queue to expand a graph or grid in order of distance, giving shortest paths in unweighted settings and simulating spreading processes in O(V + E). Mark visited on enqueue and process level by level when counting rounds.

## codenote
The Python sample finds a grid shortest path. The JavaScript sample runs a multi-source BFS.

## code
### python
```python
from collections import deque

def shortest_path(grid, start, goal):
    rows, cols = len(grid), len(grid[0])
    queue = deque([(start, 0)])
    seen = {start}
    while queue:
        (r, c), steps = queue.popleft()
        if (r, c) == goal:
            return steps
        for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nr, nc = r + dr, c + dc
            if 0 <= nr < rows and 0 <= nc < cols and grid[nr][nc] == 0 and (nr, nc) not in seen:
                seen.add((nr, nc))
                queue.append(((nr, nc), steps + 1))
    return -1

grid = [[0, 0, 0, 0],
        [1, 1, 0, 1],
        [0, 0, 0, 0],
        [0, 1, 1, 0]]
print(shortest_path(grid, (0, 0), (3, 3)))
grid[1][2] = 1
print(shortest_path(grid, (0, 0), (3, 3)))
```
Output:
```text
6
-1
```
### javascript
```javascript
function minutesToRot(grid) {
  const rows = grid.length;
  const cols = grid[0].length;
  const queue = [];
  let fresh = 0;
  grid.forEach((row, r) => row.forEach((cell, c) => {
    if (cell === 2) queue.push([r, c]);
    if (cell === 1) fresh++;
  }));
  let minutes = 0;
  while (queue.length && fresh) {
    const level = queue.length;
    for (let i = 0; i < level; i++) {
      const [r, c] = queue.shift();
      for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nr = r + dr;
        const nc = c + dc;
        if (nr >= 0 && nc >= 0 && nr < rows && nc < cols && grid[nr][nc] === 1) {
          grid[nr][nc] = 2;
          fresh--;
          queue.push([nr, nc]);
        }
      }
    }
    minutes++;
  }
  return fresh ? -1 : minutes;
}

console.log(minutesToRot([[2, 1, 1], [1, 1, 0], [0, 1, 1]]), minutesToRot([[2, 1, 1], [0, 1, 1], [1, 0, 1]]));
```
Output:
```text
4 -1
```

## quiz
1. Which structure drives breadth first search?
   - [ ] A stack
   - [x] A queue
   - [ ] A heap
   - [ ] A hash set only
   > The queue expands vertices in order of discovery.
2. When should a cell be marked visited?
   - [ ] When it is dequeued
   - [x] When it is enqueued
   - [ ] When the search ends
   - [ ] Never
   > Otherwise the same cell can enter the queue several times.
3. What does multi-source BFS start with?
   - [ ] One source with distance one
   - [x] All sources enqueued at distance zero
   - [ ] An empty queue
   - [ ] A sorted list
   > The spread then proceeds from all sources at once.
4. Why is BFS unsuitable for weighted graphs with different edge weights?
   - [ ] It is too slow always
   - [x] The first discovery of a vertex is not necessarily along the cheapest path
   - [ ] It cannot visit all vertices
   - [ ] It needs recursion
   > Dijkstra's algorithm handles the weighted case.

# Stack Queue Interview Patterns
kind: concept
time: Not an algorithmic topic — this lesson reviews patterns. Typical stack and queue solutions run in O(n) time because every element is pushed and popped a bounded number of times.
space: Not an algorithmic topic — most pattern solutions use O(n) auxiliary space for the stack or queue, with sliding window variants using O(k).

## intro
Stack and queue problems in interviews rarely say stack or queue; they describe nesting, reversal, undoing, level order or waiting lines, and the work is to notice which structure fits. A short catalogue of patterns, each with a trigger phrase, a template and a known complexity, makes these questions routine.

## theory
Pattern 1: matching and nesting, solved with a stack. Trigger words: balanced, valid, nested, matching, closing. Template: push openings, pop on closings and compare. Examples: valid parentheses, longest valid parentheses, simplifying a file path, removing adjacent duplicates.

Pattern 2: evaluation of expressions. Trigger: calculator, postfix, prefix, operators. Template: operand stack, optionally an operator stack with precedence (shunting-yard). For the reverse Polish expression `2 1 + 3 *` the result is 9. Integer division in such problems usually truncates toward zero, so check the language's division semantics.

Pattern 3: decoding nested structures. Trigger: repeat, encode, decode, k followed by brackets. Template: a stack of (current string, repeat count). Decoding `3[a2[c]]` gives `accaccacc`.

Pattern 4: monotonic stack. Trigger: next greater, next smaller, span, previous, histogram, trapping. Template: keep indices in monotone order, pop while the new element breaks it (covered in earlier lessons).

Pattern 5: monotonic deque. Trigger: sliding window maximum or minimum, bounded range window, optimisation over a window. Template: deque of indices, expire at the front, dominate at the back.

Pattern 6: level order and shortest steps, solved with a queue. Trigger: minimum number of moves, spread, rounds, levels, nearest. Template: BFS with a visited set, process by levels.

Pattern 7: building one structure from another. Trigger: implement a queue using stacks (two stacks, amortised O(1)), implement a stack using queues (rotate the queue after each push, or use one queue), min stack, max stack, stack with increment operation, design a browser history with back and forward stacks, design a circular queue.

Pattern 8: scheduling and simulation. Trigger: round robin, process in order of arrival, cooldown. Template: queue of tasks with remaining time, or a deque of recent events for hit counters and rate limiters.

Pattern 9: undo and history. Trigger: undo, redo, back, forward. Template: two stacks, with the redo stack cleared on a new action.

Choosing between them:

- Reverse order or nested closing leads to a stack
- Arrival order or nearest-first expansion leads to a queue
- Both ends or a window leads to a deque
- Priorities lead to a heap, not a plain queue

Complexity talk: say that each element is pushed and popped at most once, so the loop is linear even when there is a while loop inside, and give the space as the maximum number of items held at once.

Common traps: forgetting the empty stack case before pop or peek, mixing the operand order for subtraction and division, using list.pop(0) as a queue in Python, and returning too early before the final stack contents are processed.

Practice approach: for each pattern write the template from memory, then solve two or three problems with it, writing the trigger phrase and the invariant in a comment. Test with empty input, one element and inputs that leave items on the stack.

## explain
1. Read the problem and find the trigger phrase that points to a pattern.
2. Choose the stack, queue, deque or monotone variant.
3. State the invariant that the structure maintains.
4. Write the loop and handle the empty structure before pop or peek.
5. Process the leftover items at the end if the problem needs it.
6. Give the time complexity using the push and pop count, and the space as the maximum stack size.

## example
The Python function evaluates the reverse Polish expression `2 1 + 3 *` and the expression `4 13 5 / +` with truncating division, giving 9 and 6. The JavaScript function decodes the encoded strings `3[a2[c]]` into `accaccacc` and `2[ab]c` into `ababc` with a stack of previous strings and repeat counts.

## real
Calculators, template engines, text editors with undo, browsers with back and forward buttons and job schedulers all rely on the same stack and queue patterns that interviews test.

## pros
- A small catalogue of patterns covers most questions
- Trigger phrases make the choice of structure quick
- Complexity arguments are short and uniform

## cons
- Several different structures can look plausible at first
- Edge cases with empty input and operand order cause many bugs
- Language specific details such as division semantics matter

## uses
- Getting ready for stack and queue interview questions
- Choosing between stack, queue and deque in design
- Reviewing code that uses nested or ordered processing
- Teaching amortised analysis

## mistakes
- Using the wrong structure because the trigger phrase was missed
- Mixing up the operand order in subtraction and division
- Forgetting to flush or check the structure after the loop ends
- Quoting the complexity as quadratic because of the inner while loop

## interview
**Q:** How do you evaluate a reverse Polish notation expression?
**A:** Push numbers on a stack; for each operator pop the right operand and then the left operand, apply the operator and push the result; the single remaining item is the answer.

**Q:** How do you decode a string such as 3[a2[c]]?
**A:** Keep a stack of the string built so far and the repeat count; on an opening bracket push both and start fresh, and on a closing bracket pop them and append the current string repeated that many times.

**Q:** How do you choose between a stack, a queue and a deque in a problem?
**A:** Use a stack for nesting and reversal, a queue for first come first served and level by level expansion, and a deque when both ends or a sliding window matter.

## summary
Most stack and queue interview problems match a few patterns: matching, expression evaluation, decoding, monotonic stacks and deques, BFS and building one structure from another. Identify the trigger phrase, state the invariant and mind the empty cases and operand order.

## codenote
The Python sample evaluates postfix expressions with truncating division. The JavaScript sample decodes nested repeated strings.

## code
### python
```python
def evaluate(tokens):
    stack = []
    for token in tokens:
        if token in "+-*/" and len(token) == 1:
            right, left = stack.pop(), stack.pop()
            if token == "+":
                stack.append(left + right)
            elif token == "-":
                stack.append(left - right)
            elif token == "*":
                stack.append(left * right)
            else:
                stack.append(int(left / right))
        else:
            stack.append(int(token))
    return stack[0]

print(evaluate("2 1 + 3 *".split()), evaluate("4 13 5 / +".split()))
```
Output:
```text
9 6
```
### javascript
```javascript
function decode(text) {
  const stack = [];
  let current = "";
  let count = 0;
  for (const ch of text) {
    if (ch >= "0" && ch <= "9") {
      count = count * 10 + Number(ch);
    } else if (ch === "[") {
      stack.push([current, count]);
      current = "";
      count = 0;
    } else if (ch === "]") {
      const [previous, repeat] = stack.pop();
      current = previous + current.repeat(repeat);
    } else {
      current += ch;
    }
  }
  return current;
}

console.log(decode("3[a2[c]]"), decode("2[ab]c"));
```
Output:
```text
accaccacc ababc
```

## quiz
1. Which structure fits matching nested brackets?
   - [ ] A queue
   - [x] A stack
   - [ ] A heap
   - [ ] A hash table
   > The most recent opening bracket must close first.
2. Which structure fits finding the minimum number of moves in a maze?
   - [ ] A stack
   - [x] A queue used by breadth first search
   - [ ] A min stack
   - [ ] A set
   > The queue expands cells in order of distance.
3. Why is a monotonic stack solution still linear despite its inner loop?
   - [ ] The inner loop is empty
   - [x] Each element is pushed and popped at most once
   - [ ] The stack is sorted
   - [ ] It stops early
   > The total number of pops is bounded by the number of pushes.
4. In reverse Polish evaluation, which operand is popped first?
   - [ ] The left operand
   - [x] The right operand
   - [ ] The operator
   - [ ] Neither
   > The right operand is on top, and the left operand lies below it.
