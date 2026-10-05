# Minimum Window Substring
kind: algorithm
time: O(n + m) for a text of length n and a target of length m: the right pointer visits each character once, the left pointer moves forward at most n times, and each step does constant work with a counter that tracks how many required characters are still missing.
space: O(a) for the count table over the alphabet of size a, at most O(m + n) for arbitrary symbols.
viz: sliding-window

## intro
Find the smallest contiguous piece of a text that contains every character of a target string, with the right multiplicity. It is the hardest of the classic sliding window problems, and it combines everything from the earlier lessons: a variable window, a count map, and a careful rule for when to shrink.

## theory
Problem: given strings s and t, return the shortest substring of s that contains every character of t, counting duplicates (if t has two a's, the window needs at least two a's), or the empty string if none exists. For s = "ADOBECODEBANC" and t = "ABC" the answer is "BANC".

Approach: expand the right edge until the window is valid, then shrink the left edge as far as validity allows, record the window, and continue.

Bookkeeping:

- `need[c]`: how many copies of each character c the target requires, initially the counts of t
- `missing`: the number of required characters still absent from the window (starting at len(t) and counting duplicates)
- When the right edge adds a character c, if `need[c] > 0` then one required copy is satisfied, so decrement `missing`; then decrement `need[c]` regardless. After that `need[c]` can be negative, meaning the window has surplus copies of c.
- The window is valid exactly when `missing == 0`
- While valid, the left edge can advance as long as the character leaving has a negative `need` (a surplus copy): remove it by incrementing `need[c]`. When the leftmost character is one that is required with no surplus (its `need` is 0), the window is as small as it can be for this right edge; record it, then drop that character to make the window invalid (increment `need` and `missing`) and continue expanding.

This design avoids comparing whole maps at every step: validity is a single integer test.

Complexity: both pointers move forward only, so the total work is linear: O(n + m) time and O(a) space.

Details and edge cases:

- If t is longer than s, there is no window
- Duplicates in t: "aa" requires two a's, so a text "a" yields the empty string
- Case sensitivity: "a" and "A" differ unless normalised
- When several windows tie in length, the first (leftmost) one is returned in this implementation
- Return the substring itself, or its indexes, depending on the problem
- The target characters need not appear in any order

Related problems: smallest window containing all distinct characters of s, shortest subarray containing all required values, permutation in string (fixed window), longest substring with at most k distinct characters, and minimum window subsequence (order matters, solved with dynamic programming).

Common pitfalls: shrinking only once instead of in a while loop; counting distinct characters rather than total required copies so duplicates break; and returning a window that is valid but not minimal because shrinking stopped too early.

## explain
1. Count the characters required by t in a map.
2. Initialise the left edge and the number of missing characters to the length of t.
3. For each right index, add the character: if it is still needed decrement missing, then decrement its need.
4. While missing is zero, shrink from the left past characters with a surplus, record the best window, then drop one required character to break validity.
5. Continue until the right edge reaches the end.
6. Test duplicates in the target, a target longer than the text and a whole-string answer.

## example
For "ADOBECODEBANC" and "ABC" the Python function returns "BANC", which is the shortest window containing A, B and C. With the text "a" and the target "aa" it returns the empty string because two copies are required, and with "a" and "a" it returns "a". The JavaScript function returns "ba" for text "bba" and target "ab" (shorter than the whole string "bba") and "aa" for "aa" and "aa".

## real
Search engines highlight the shortest passage that contains all query words, log analysis finds the shortest span of events covering all required types, and genome tools find the shortest region that contains a set of markers.

## pros
- Linear time over the text
- Validity is a single integer comparison
- The template handles duplicates in the target

## cons
- Fiddly bookkeeping with surplus counts
- Easy to stop shrinking too early
- Only handles unordered containment, not ordered subsequences

## uses
- Shortest passage containing all query terms
- Smallest segment covering a required multiset
- Finding minimal spans in logs and genomes
- Practising the hardest sliding window pattern

## mistakes
- Tracking distinct characters instead of required copies
- Shrinking with an if so the window is not minimal
- Forgetting to restore the counts after recording a window
- Returning the window when the target is longer than the text

## interview
**Q:** How do you find the minimum window substring in linear time?
**A:** Keep counts of required characters and a counter of how many are missing. Expand right until nothing is missing, shrink left while the window stays valid, record the smallest window, then give up one required character and continue.

**Q:** How do you handle duplicate characters in the target?
**A:** Count total required copies, so the missing counter starts at the length of the target and only decreases when a character that is still needed is added.

**Q:** What is the complexity?
**A:** O(n plus m) time, since each pointer moves forward at most n times and the counts are updated in constant time, and O(a) space for the counts.

## summary
Expand until all required characters are covered, shrink while that remains true, and record the smallest window. A missing-characters counter makes validity a constant-time check and gives O(n plus m) overall.

## codenote
The Python sample returns minimal windows for several inputs. The JavaScript sample solves duplicate-heavy cases.

## code
### python
```python
from collections import Counter

def min_window(text, target):
    need = Counter(target)
    missing = len(target)
    left = 0
    best = (float("inf"), 0, 0)
    for right, char in enumerate(text):
        if need[char] > 0:
            missing -= 1
        need[char] -= 1
        if missing == 0:
            while need[text[left]] < 0:
                need[text[left]] += 1
                left += 1
            if right - left + 1 < best[0]:
                best = (right - left + 1, left, right + 1)
            need[text[left]] += 1
            missing += 1
            left += 1
    return text[best[1]:best[2]] if best[0] < float("inf") else ""

print(min_window("ADOBECODEBANC", "ABC"), repr(min_window("a", "aa")), min_window("a", "a"))
```
Output:
```text
BANC '' a
```
### javascript
```javascript
function minWindow(text, target) {
  const need = new Map();
  for (const char of target) need.set(char, (need.get(char) ?? 0) + 1);
  let missing = target.length;
  let left = 0;
  let best = "";
  for (let right = 0; right < text.length; right++) {
    const char = text[right];
    if ((need.get(char) ?? 0) > 0) missing--;
    need.set(char, (need.get(char) ?? 0) - 1);
    if (missing === 0) {
      while (need.get(text[left]) < 0) {
        need.set(text[left], need.get(text[left]) + 1);
        left++;
      }
      if (best === "" || right - left + 1 < best.length) best = text.slice(left, right + 1);
      need.set(text[left], need.get(text[left]) + 1);
      missing++;
      left++;
    }
  }
  return best;
}

console.log(minWindow("bba", "ab"), JSON.stringify(minWindow("a", "aa")), minWindow("aa", "aa"));
```
Output:
```text
ba "" aa
```

## quiz
1. What does the missing counter represent?
   - [ ] The number of distinct characters in the window
   - [x] How many required characters (counting duplicates) are still absent from the window
   - [ ] The window length
   - [ ] The number of shrinks
   > The window is valid exactly when it reaches zero.
2. When can the left edge advance while keeping the window valid?
   - [ ] Always
   - [x] While the character leaving is a surplus copy
   - [ ] Never
   - [ ] Only at the end
   > Required copies cannot be dropped without breaking validity.
3. What is the minimum window of "ADOBECODEBANC" containing "ABC"?
   - [ ] ADOBEC
   - [x] BANC
   - [ ] CODEBA
   - [ ] ODEBANC
   > It is the shortest substring with A, B and C.
4. What running time does the minimum window search achieve for text length n and target length m?
   - [ ] O(n times m)
   - [x] O(n + m)
   - [ ] O(n squared)
   - [ ] O(2 to the m)
   > Both pointers move forward only.

# Subarray Sum Equals K
kind: algorithm
time: O(n) using a hash map of prefix sums, with one lookup and one update per element; the brute force over all subarrays is O(n²) or O(n³).
space: O(n) for the map of prefix sums seen so far.
practice: two-sum-indices

## intro
Count the contiguous subarrays whose elements add up to k. With positive numbers a sliding window would do, but if negative numbers are allowed, extending a window no longer moves the sum in a fixed direction, and the window logic breaks. The reliable tool is prefix sums plus a hash map, which is the two sum idea applied to running totals.

## theory
Observation: let `prefix[i]` be the sum of the first i elements, with `prefix[0] = 0`. The sum of the subarray from index j to i − 1 equals `prefix[i] − prefix[j]`. So a subarray ending at position i has sum k exactly when there is an earlier prefix with value `prefix[i] − k`.

Algorithm: scan the array keeping the running sum `s`. A dictionary `seen` maps each prefix value to how many times it has occurred; it starts with `{0: 1}` to represent the empty prefix, which lets subarrays that start at the beginning be counted. For each element:

- Add it to `s`
- Add `seen[s − k]` to the answer, since each earlier prefix with that value starts a subarray with sum k ending here
- Increment `seen[s]`

Order matters: look up `s − k` before recording the current prefix, so that when k = 0 an empty subarray is not counted.

Examples: for `[1, 1, 1]` and k = 2 there are 2 subarrays (positions 0 to 1 and 1 to 2); for `[1, 2, 3]` and k = 3 there are 2 (`[1, 2]` and `[3]`); for `[3, 4, 7, 2, −3, 1, 4, 2]` and k = 7 there are 4 (`[3, 4]`, `[7]`, `[7, 2, −3, 1]` and `[1, 4, 2]`); for `[1, −1, 1, 1]` and k = 2 there are 2.

Why a window fails: with negative values, a window whose sum exceeds k can become valid by adding more elements, and one below k can overshoot; so neither growing nor shrinking has a consistent effect. The prefix-sum method has no such assumption.

Complexity: O(n) time with average O(1) dictionary operations, and O(n) space for up to n + 1 distinct prefix sums. For arrays of non-negative numbers, a sliding window achieves the same time with O(1) space.

Variants:

- Existence only: store the first index of each prefix to also get the longest subarray with sum k
- Longest subarray with sum k: store the earliest index for each prefix and take the largest `i − index[s − k]`
- Subarrays with sum divisible by k: store counts of prefix sums modulo k (with correct handling of negative remainders)
- Equal numbers of zeros and ones: map 0 to −1 and look for sum 0
- Two-dimensional version: prefix sums on a grid with a map over row pairs
- Subarray sum in a circular array and with a range of allowed sums (needing ordered structures)

Edge cases: k equal to 0 (zero-sum subarrays), arrays with zeros, the whole array summing to k, and large values where sums may overflow fixed-width types.

## explain
1. Introduce the running prefix sum and a dictionary of prefix counts with the empty prefix recorded.
2. For each element update the running sum.
3. Add the number of earlier prefixes equal to the running sum minus k to the answer.
4. Record the current prefix sum in the dictionary.
5. For longest-subarray variants store the first index instead of a count.
6. Test negative numbers, zeros, k of zero and the whole array.

## example
The Python function `count_k` returns 2 for `[1, 1, 1]` with k = 2, 2 for `[1, 2, 3]` with k = 3 and 4 for the array containing negatives with k = 7, where a sliding window would fail. The JavaScript version uses a Map and returns 2 for `[1, 2, 3]` with k = 3 and also 2 for `[1, -1, 1, 1]` with k = 2.

## real
Financial tools find spans of transactions that net to a target, analytics look for periods with a given total change, and signal processing finds intervals with zero net drift.

## pros
- Works with negative numbers and zeros
- Counts every matching subarray in one pass with simple code
- The same idea answers existence, counting and longest-length questions

## cons
- Needs O(n) extra memory
- Easy to forget the empty prefix
- Order of lookup and update matters

## uses
- Counting subarrays with a given sum
- Finding the longest subarray with a given sum
- Counting subarrays with sums divisible by k
- Balanced binary subarray problems

## mistakes
- Forgetting to initialise the map with the empty prefix
- Recording the current prefix before looking up the complement
- Using a sliding window when negative numbers are present
- Mishandling negative remainders in the modulo variant

## interview
**Q:** How do you count subarrays with sum k when the array can contain negative numbers?
**A:** Keep a running prefix sum and a hash map of how many times each prefix sum has occurred. For each position add the count of the prefix sum minus k to the result, then record the current prefix.

**Q:** Why is the empty prefix put into the map initially?
**A:** So that subarrays starting at index zero are counted: their prefix minus k equals zero, which must be present once.

**Q:** Why does a sliding window not work here?
**A:** With negative numbers, adding elements can reduce the sum and removing elements can increase it, so there is no monotonic rule for moving the window ends.

## summary
Subarray sum is a difference of prefix sums, so count earlier prefixes equal to the current prefix minus k, using a hash map seeded with the empty prefix. It runs in O(n) and handles negative numbers where windows fail.

## codenote
The Python sample counts subarrays with negatives. The JavaScript sample counts with a Map.

## code
### python
```python
from collections import Counter

def count_with_sum(values, k):
    seen = Counter({0: 1})
    running = total = 0
    for value in values:
        running += value
        total += seen[running - k]
        seen[running] += 1
    return total

print(count_with_sum([1, 1, 1], 2), count_with_sum([1, 2, 3], 3))
print(count_with_sum([3, 4, 7, 2, -3, 1, 4, 2], 7))
```
Output:
```text
2 2
4
```
### javascript
```javascript
function countWithSum(values, k) {
  const seen = new Map([[0, 1]]);
  let running = 0;
  let total = 0;
  for (const value of values) {
    running += value;
    total += seen.get(running - k) ?? 0;
    seen.set(running, (seen.get(running) ?? 0) + 1);
  }
  return total;
}

console.log(countWithSum([1, 2, 3], 3), countWithSum([1, -1, 1, 1], 2));
```
Output:
```text
2 2
```

## quiz
1. What does prefix[i] minus prefix[j] represent?
   - [ ] The element at i
   - [x] The sum of the elements from index j up to i minus one
   - [ ] The number of elements
   - [ ] The average
   > Differences of running totals give subarray sums.
2. What is stored in the dictionary?
   - [ ] Subarrays
   - [x] How many times each prefix sum has occurred
   - [ ] Indexes of negative numbers
   - [ ] The values of k
   > Each earlier occurrence starts a matching subarray.
3. Why does the dictionary start with the prefix 0 counted once?
   - [ ] For speed
   - [x] To count subarrays that begin at the first element
   - [ ] To remove zeros
   - [ ] To handle k equal to one
   > Their prefix minus k equals zero.
4. Why can a sliding window fail with negative numbers?
   - [ ] They are not integers
   - [x] The sum does not change monotonically as the window grows or shrinks
   - [ ] Windows need sorting
   - [ ] They overflow
   > The rule for moving the ends no longer holds.

# Container With Most Water
kind: algorithm
time: O(n) for a single pass of two pointers, compared with O(n²) for trying every pair of lines.
space: O(1) extra space.

## intro
Vertical lines of various heights stand side by side. Choose two of them as the walls of a container: the water held is limited by the shorter wall and spans the distance between them. Which pair holds the most? The two-pointer solution is a textbook example of an argument that lets you discard candidates without examining them.

## theory
Problem: given heights `h[0..n−1]`, maximise `min(h[i], h[j]) · (j − i)` over pairs i < j.

Brute force examines all n(n − 1)/2 pairs: O(n²).

Two-pointer algorithm: start with the widest container, `left = 0` and `right = n − 1`. Compute its area and update the best. Then move the pointer at the shorter wall inward by one position and repeat until the pointers meet.

Why moving the shorter wall is safe: consider the pair (left, right) with `h[left] < h[right]`. Any container formed by `left` and some `j` strictly between left and right is narrower than the current one, and its height is still limited by `h[left]` (or less), so its area is at most `h[left] · (j − left)`, which is smaller than the current area `h[left] · (right − left)`. Therefore `left` cannot be part of any better pair with a position inside the current range, and it can be discarded. Moving the taller wall instead could never help for the same reason mirrored. When the heights are equal, either pointer may move.

So each step eliminates one wall and the loop runs n − 1 times: O(n) time, O(1) space.

Example: for heights `[1, 8, 6, 2, 5, 4, 8, 3, 7]` the best container uses the walls of heights 8 (index 1) and 7 (index 8), area `7 · 7 = 49`. For `[1, 1]` the answer is 1. In JavaScript, `[4, 3, 2, 1, 4]` gives 16 (the two outer walls of height 4, spanning width 4) and `[1, 2, 1]` gives 2.

Related problems and extensions:

- Trapping rain water is a different problem on the same data (water held over bars, not between two lines), also solved with two pointers, in the next lesson
- Largest rectangle in a histogram uses a stack
- Maximum area when lines can be reordered or removed
- Best time to buy and sell stock, a different single-pass maximisation, uses a running minimum
- Three-dimensional versions and weighted widths need different arguments

Common mistakes: moving the taller pointer, computing the area with `max` instead of `min`, using index difference plus one for the width (the width is `right − left`), and forgetting that equal heights allow either move.

## explain
1. Start with the widest container: left at the first line and right at the last.
2. Compute the area as the smaller height times the distance between the indexes.
3. Update the best area seen.
4. Move the pointer at the shorter line inward.
5. Repeat until the pointers meet.
6. Test two lines, equal heights, increasing and decreasing heights.

## example
The Python function returns 49 for `[1, 8, 6, 2, 5, 4, 8, 3, 7]` and 1 for `[1, 1]`. The width is the difference of indexes, 7 between index 1 and index 8, and the height is the smaller of 8 and 7. The JavaScript function returns 16 for `[4, 3, 2, 1, 4]` and 2 for `[1, 2, 1]`.

## real
The problem is a standard interview question, and the elimination argument it teaches appears in optimisation problems with monotone structure, such as finding the best pair in sorted data.

## pros
- Linear time with constant space
- Elegant proof by discarding dominated candidates
- Short code

## cons
- The correctness argument is not obvious at first
- Easy to move the wrong pointer
- Applies to this specific objective only

## uses
- Maximising the area between two vertical lines
- Teaching candidate elimination in two-pointer algorithms
- Optimising pairs where one dimension shrinks as the other grows
- Interview preparation

## mistakes
- Moving the taller pointer inward
- Using the larger height instead of the smaller
- Computing the width as the index difference plus one
- Confusing the problem with trapping rain water

## interview
**Q:** How do you solve container with most water in O(n)?
**A:** Use two pointers at the ends; compute the area from the shorter height and the distance, then move the pointer at the shorter line inward, since keeping it could only give narrower containers limited by the same height.

**Q:** Why is it safe to discard the shorter line?
**A:** Any other container using that line has smaller width and its height is at most the shorter line's height, so its area cannot exceed the current one.

**Q:** What is the difference from trapping rain water?
**A:** Container with most water chooses just two lines and ignores the lines between them, while trapping rain water counts all the water held above every bar, using the heights of all bars.

## summary
Start with the widest pair of lines, record the area, and always move the shorter line inward, since it cannot do better with any narrower partner. The result is O(n) time and O(1) space.

## codenote
The Python and JavaScript samples compute the maximal area with two pointers.

## code
### python
```python
def max_area(heights):
    left, right, best = 0, len(heights) - 1, 0
    while left < right:
        best = max(best, min(heights[left], heights[right]) * (right - left))
        if heights[left] < heights[right]:
            left += 1
        else:
            right -= 1
    return best

print(max_area([1, 8, 6, 2, 5, 4, 8, 3, 7]), max_area([1, 1]))
```
Output:
```text
49 1
```
### javascript
```javascript
function maxArea(heights) {
  let left = 0;
  let right = heights.length - 1;
  let best = 0;
  while (left < right) {
    best = Math.max(best, Math.min(heights[left], heights[right]) * (right - left));
    if (heights[left] < heights[right]) left++;
    else right--;
  }
  return best;
}

console.log(maxArea([4, 3, 2, 1, 4]), maxArea([1, 2, 1]));
```
Output:
```text
16 2
```

## quiz
1. How is the area of a container computed?
   - [ ] Larger height times width
   - [x] Smaller height times the distance between the lines
   - [ ] Sum of the heights
   - [ ] Product of the heights
   > Water spills over the shorter wall.
2. Which pointer moves after computing an area?
   - [ ] The pointer at the taller line
   - [x] The pointer at the shorter line
   - [ ] Both
   - [ ] Neither
   > The shorter line cannot improve with a narrower partner.
3. How long does the single two-pointer pass take?
   - [ ] O(n squared)
   - [x] O(n)
   - [ ] O(n log n)
   - [ ] O(1)
   > Each step discards one line.
4. What is the best area for [1, 1]?
   - [ ] 0
   - [x] 1
   - [ ] 2
   - [ ] 11
   > The height is 1 and the width is 1.

# Trapping Rain Water
kind: algorithm
time: O(n) for the two-pointer solution and for the prefix and suffix maximum solution; brute force that scans left and right for every bar is O(n²).
space: O(1) for the two-pointer solution, O(n) for the precomputed maximum arrays.
practice: trapping-rain-water

## intro
Bars of various heights stand next to each other. After rain, how much water is trapped between them? A bar holds water up to the height of the lower of the tallest bars on its left and on its right. That one sentence leads to a clear solution in linear time, and then to an elegant two-pointer version that needs no extra memory.

## theory
Key fact: the water above bar i is `min(left_max[i], right_max[i]) − height[i]`, where `left_max[i]` is the tallest bar at or to the left of i and `right_max[i]` the tallest at or to the right. If that quantity would be negative, the bar holds nothing (it cannot be, since each maximum includes the bar itself).

Solutions:

- Brute force: for each bar scan to the left and right for the maxima: O(n²) time, O(1) space
- Prefix and suffix maxima: compute `left_max` in a left-to-right pass and `right_max` in a right-to-left pass, then sum the water over all bars: O(n) time and O(n) space. For `[0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1]` the total is 6.
- Two pointers: maintain `left` and `right` and the running maxima `left_max` and `right_max` of what each has seen. At each step compare the bars at the two pointers. If `height[left] < height[right]`, the water above the left bar depends only on `left_max`, because the right side is known to contain a bar at least as tall as `height[left]`, so the limit is `left_max` (the true right maximum is at least as large as the right pointer's bar, which exceeds the left bar). Add `left_max − height[left]` after updating `left_max`, and advance left. Otherwise do the mirror image on the right. O(n) time, O(1) space.
- Monotonic stack: keep indexes of decreasing bars; when a taller bar arrives, pop and compute the water in the basin between the new bar, the popped bar's neighbour on the stack and the popped bar. O(n) time, O(n) space, and generalises to related problems.

Why the two-pointer rule is correct: suppose `height[left] < height[right]`. Then every bar between them is bounded on the right by something at least `height[right]`, which is higher than `height[left]`. So the water above `left` is limited by the left side alone: `left_max − height[left]`. Nothing on the right side can lower that, so the bar at `left` can be finished and discarded.

More examples: `[4, 2, 0, 3, 2, 5]` traps 9 units, `[3, 0, 2, 0, 4]` traps 7 and `[1, 2, 3]` (a staircase) traps 0.

Pitfalls: confusing the maximum seen so far with the maximum of the whole array, forgetting to update the maximum before computing the water, and mistaking the problem for container with most water (which uses only two lines).

Extensions: trapping rain water in two dimensions (a heightmap) uses a priority queue to find the lowest boundary, with a breadth-first flood of cells; water that can flow out through gaps; and counting the number of basins.

## explain
1. Understand the rule: water over a bar is the smaller of the highest bars on each side minus the bar's own height.
2. For the simplest linear solution, precompute prefix and suffix maxima and sum the differences.
3. For constant space, use two pointers and running maxima, always processing the side with the lower bar.
4. Update the running maximum for that side first, then add the water above the bar.
5. Move the pointer inward.
6. Test empty input, a single bar, monotonic bars and valleys of different depths.

## example
The Python two-pointer function and the prefix and suffix maximum version both return 6 for `[0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1]`, and the two-pointer version returns 9 for `[4, 2, 0, 3, 2, 5]`. The JavaScript function returns 7 for `[3, 0, 2, 0, 4]` and 0 for the staircase `[1, 2, 3]`.

## real
Hydrology models, terrain analysis and graphics use the same idea for basins and fill levels, and the problem is a favourite for interviews because it has several solutions of increasing elegance.

## pros
- Several solutions with clear trade-offs
- The two-pointer version uses constant memory
- Teaches reasoning about local bounds from global maxima

## cons
- The correctness argument of the two-pointer rule is subtle
- Order of updating the maximum and adding water is easy to get wrong
- Two-dimensional versions need heaps and flooding

## uses
- Computing trapped water between bars
- Terrain and basin analysis
- Practising two-pointer, prefix and stack techniques
- Interview preparation

## mistakes
- Using the global maximum instead of the maximum on each side
- Adding water before updating the running maximum
- Moving the pointer at the taller bar
- Confusing it with the container problem

## interview
**Q:** How much water is trapped above a bar?
**A:** The smaller of the tallest bar to its left and the tallest bar to its right, minus the bar's own height.

**Q:** How does the two-pointer solution achieve constant space?
**A:** It moves the pointer at the lower bar, because for that side the other side is guaranteed to have a taller bar, so the water depends only on the running maximum of the side being processed.

**Q:** What are three ways to solve trapping rain water in linear time?
**A:** Prefix and suffix maximum arrays with O(n) space, two pointers with O(1) space, and a monotonic stack that accumulates water basin by basin with O(n) space.

## summary
Water above a bar is the lower of its two side maxima minus its height. Compute it with prefix and suffix maxima in O(n) space, or with two pointers and running maxima in O(1), always advancing the lower side.

## codenote
The Python sample compares the two-pointer and prefix-suffix solutions. The JavaScript sample uses two pointers.

## code
### python
```python
def trap_two_pointers(heights):
    left, right = 0, len(heights) - 1
    left_max = right_max = water = 0
    while left < right:
        if heights[left] < heights[right]:
            left_max = max(left_max, heights[left])
            water += left_max - heights[left]
            left += 1
        else:
            right_max = max(right_max, heights[right])
            water += right_max - heights[right]
            right -= 1
    return water

def trap_prefix(heights):
    n = len(heights)
    left_max, right_max = [0] * n, [0] * n
    for i in range(n):
        left_max[i] = max(left_max[i - 1] if i else 0, heights[i])
    for i in range(n - 1, -1, -1):
        right_max[i] = max(right_max[i + 1] if i < n - 1 else 0, heights[i])
    return sum(min(left_max[i], right_max[i]) - heights[i] for i in range(n))

bars = [0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1]
print(trap_two_pointers(bars), trap_prefix(bars), trap_two_pointers([4, 2, 0, 3, 2, 5]))
```
Output:
```text
6 6 9
```
### javascript
```javascript
function trap(heights) {
  let left = 0;
  let right = heights.length - 1;
  let leftMax = 0;
  let rightMax = 0;
  let water = 0;
  while (left < right) {
    if (heights[left] < heights[right]) {
      leftMax = Math.max(leftMax, heights[left]);
      water += leftMax - heights[left];
      left++;
    } else {
      rightMax = Math.max(rightMax, heights[right]);
      water += rightMax - heights[right];
      right--;
    }
  }
  return water;
}

console.log(trap([3, 0, 2, 0, 4]), trap([1, 2, 3]));
```
Output:
```text
7 0
```

## quiz
1. What limits the water above a bar?
   - [ ] The tallest bar overall
   - [x] The smaller of the tallest bars on its left and right
   - [ ] The bar next to it
   - [ ] The average height
   > Water spills over the lower side.
2. Which pointer moves in the two-pointer solution?
   - [ ] The one at the taller bar
   - [x] The one at the lower bar
   - [ ] Always the left pointer
   - [ ] Both
   > For that side the other side is guaranteed to be at least as tall.
3. What is the space of the prefix and suffix maxima solution?
   - [ ] O(1)
   - [x] O(n)
   - [ ] O(log n)
   - [ ] O(n squared)
   > Two arrays of length n are stored.
4. How much water does a strictly increasing staircase trap?
   - [ ] The sum of the heights
   - [x] None
   - [ ] The largest height
   - [ ] One unit per bar
   > There is no taller bar on the left to hold water in.

# Two Pointer Interview Patterns
kind: algorithm
time: O(n) for the pointer passes after any sorting, so O(n log n) overall when the input must be sorted first, and O(n²) for three sum which repeats a pair search for each fixed element.
space: O(1) extra for the in-place patterns, O(n) for the output of sorted squares and similar.
viz: two-pointer
practice: reverse-array-print

## intro
Two pointers is one of the most frequently tested techniques, and almost every variant is a small change to one of a handful of templates. This lesson is a recognition guide: the clue in the problem, the template it points to and the detail that usually goes wrong.

## theory
Templates and the clues that suggest them:

- Opposite ends moving inward: "sorted array", "pair with target sum", "palindrome", "reverse", "container", "squares of a sorted array". Move the pointer that cannot improve the answer.
- Reader and writer in the same direction: "in place", "remove duplicates", "remove element", "move zeros", "merge sorted arrays". The writer is never ahead of the reader.
- Fast and slow: "linked list cycle", "middle of the list", "duplicate number", "happy number". Different speeds along one sequence.
- Sliding window, fixed size: "every subarray of size k", "average", "maximum in each window"
- Sliding window, variable size: "longest or shortest subarray such that", "at most k", "minimum window"
- Prefix sums and hash map when the window method fails: negative numbers, "number of subarrays with sum"
- Sort then pointers: "three sum", "four sum", "closest sum", where sorting enables the inward scan
- Partition pointers: Dutch national flag with low, mid and high

Three sum: sort the array, then for each index i (skipping duplicate values) run the opposite-end search on the remaining suffix for pairs summing to `−a[i]`; after finding a triple, move both pointers and skip duplicates. For `[-1, 0, 1, 2, -1, -4]` the unique triplets are `[[-1, -1, 2], [-1, 0, 1]]`. Time O(n²), better than the O(n³) of three nested loops. A closest-sum variant keeps the best difference and moves the pointers by comparing the sum with the target: for `[-1, 2, 1, -4]` and target 1 the closest sum is 2.

Sorted squares: given a sorted array that contains negatives, the squares are largest at the ends. Fill the output from the back, comparing the absolute values at both pointers and placing the larger square, which gives `[0, 1, 9, 16, 100]` for `[-4, -1, 0, 3, 10]` in O(n) without sorting again.

Checklist for choosing and writing a solution:

- State the brute force and its cost
- Ask whether the data is sorted or may be sorted, and whether original indexes matter
- Decide which template fits and define what each pointer means
- Write the invariant and the loop condition (strictly less than, or less than or equal to)
- Decide how duplicates are handled and what to return when nothing is found
- Test empty, one element, two elements, all equal and extreme values

Common mistakes across templates: wrong loop condition, moving the wrong pointer, forgetting to skip duplicates, mutating the input when the caller needs it unchanged, using a window for data with negative numbers, and an off-by-one in the length of a window or in the returned index.

Complexity talk: say what dominates. A pointer pass is linear; sorting is O(n log n); three sum is O(n²) because of the nested loop; windows are linear even with nested loops because pointers do not move back; hash-map alternatives trade space for avoiding the sort.

## explain
1. Read the problem for clues: sorted, in place, cycle, subarray, window, pairs.
2. Match the clue to a template from the list.
3. Define the roles of the pointers and the invariant in words.
4. Write the loop with the correct condition and the rule for moving pointers.
5. Handle duplicates and edge cases explicitly.
6. State the final time and space complexity, including any sort.

## example
The Python `three_sum` sorts `[-1, 0, 1, 2, -1, -4]` and returns the two unique triplets `[[-1, -1, 2], [-1, 0, 1]]`. `sorted_squares` turns `[-4, -1, 0, 3, 10]` into `[0, 1, 9, 16, 100]` by filling from the back. The JavaScript function finds the three-element sum closest to the target 1 in `[-1, 2, 1, -4]`, which is 2, and returns 0 for the array `[0, 0, 0]` and target 1.

## real
Interviewers use these problems to check pattern recognition, and engineers use the same templates when deduplicating records, merging sorted feeds and scanning logs for bounded windows.

## pros
- A small set of templates covers most problems
- Each template is linear after sorting
- Clear invariants make solutions easy to verify

## cons
- Choosing the wrong template wastes time
- Duplicate handling adds fiddly conditions
- Sorting changes indexes and costs O(n log n)

## uses
- Three sum, four sum and closest sum problems
- Sorted squares and merging from the back
- In-place compaction and partitioning
- Choosing between windows, pointers and hash maps in interviews

## mistakes
- Using a window when the array has negative numbers
- Forgetting to skip duplicate values in three sum
- Mutating the input array when the original order is needed
- Quoting the complexity without including the sorting step

## interview
**Q:** How do you solve three sum in O(n squared)?
**A:** Sort the array, then for each element run the opposite-end pair search on the rest for the negated value, skipping duplicate values for the fixed element and for the found pairs.

**Q:** How can you square a sorted array that contains negative numbers in linear time?
**A:** Use two pointers at the ends: the larger absolute value gives the larger square, so fill the result from the last position backward, moving the pointer whose element had the larger absolute value.

**Q:** How do you choose between a hash map and two pointers for pair problems?
**A:** If the data is sorted or sorting is acceptable and extra memory is limited, use two pointers; if the data is unsorted, the original indexes are needed or sorting is too costly, a hash map gives a one-pass solution.

## summary
Match the clue to a template: opposite pointers, reader and writer, fast and slow, fixed or variable windows, prefix sums, or sort then scan. State the invariant, handle duplicates and edges and include sorting in the complexity.

## codenote
The Python sample solves three sum and sorted squares. The JavaScript sample finds the closest three sum.

## code
### python
```python
def three_sum(values):
    values = sorted(values)
    triplets = []
    for i in range(len(values) - 2):
        if i and values[i] == values[i - 1]:
            continue
        low, high = i + 1, len(values) - 1
        while low < high:
            total = values[i] + values[low] + values[high]
            if total == 0:
                triplets.append([values[i], values[low], values[high]])
                low += 1
                high -= 1
                while low < high and values[low] == values[low - 1]:
                    low += 1
            elif total < 0:
                low += 1
            else:
                high -= 1
    return triplets

print(three_sum([-1, 0, 1, 2, -1, -4]))

def sorted_squares(values):
    result = [0] * len(values)
    low, high = 0, len(values) - 1
    for i in range(len(values) - 1, -1, -1):
        if abs(values[low]) > abs(values[high]):
            result[i] = values[low] ** 2
            low += 1
        else:
            result[i] = values[high] ** 2
            high -= 1
    return result

print(sorted_squares([-4, -1, 0, 3, 10]))
```
Output:
```text
[[-1, -1, 2], [-1, 0, 1]]
[0, 1, 9, 16, 100]
```
### javascript
```javascript
function closestSum(numbers, target) {
  const sorted = [...numbers].sort((a, b) => a - b);
  let best = Infinity;
  for (let i = 0; i < sorted.length - 2; i++) {
    let left = i + 1;
    let right = sorted.length - 1;
    while (left < right) {
      const sum = sorted[i] + sorted[left] + sorted[right];
      if (Math.abs(sum - target) < Math.abs(best - target)) best = sum;
      if (sum < target) left++;
      else if (sum > target) right--;
      else return sum;
    }
  }
  return best;
}

console.log(closestSum([-1, 2, 1, -4], 1), closestSum([0, 0, 0], 1));
```
Output:
```text
2 0
```

## quiz
1. What is the time complexity of three sum with sorting and two pointers?
   - [ ] O(n)
   - [ ] O(n log n)
   - [x] O(n squared)
   - [ ] O(n cubed)
   > One linear pointer pass for each of n fixed elements.
2. Why fill sorted squares from the back?
   - [ ] To save memory
   - [x] The largest squares come from the ends, so the larger one goes last
   - [ ] Python requires it
   - [ ] To avoid negative numbers
   > Absolute values are largest at the two ends.
3. Which clue suggests fast and slow pointers?
   - [ ] A sorted array
   - [x] A linked list cycle or middle
   - [ ] Sum of a pair
   - [ ] A palindrome
   > The two speeds detect loops and midpoints in one pass.
4. What should the complexity of a sort-then-pointers solution include?
   - [ ] Only the pointer pass
   - [x] The O(n log n) sorting cost as well
   - [ ] Nothing
   - [ ] The memory of the input
   > Sorting dominates the linear scan.
