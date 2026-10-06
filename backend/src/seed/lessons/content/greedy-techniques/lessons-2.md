# Coin Change Greedy Cases
kind: algorithm
time: O(k log k + k) for k coin denominations when taking the largest coin first, independent of the amount because each denomination is handled with one division; verifying a coin system against dynamic programming costs O(amount · k).
space: O(1) for the greedy count, O(amount) for the dynamic programming table used for verification.
practice: coin-change-minimum

## intro
Making change with the fewest coins is the textbook greedy problem, and it is also the textbook warning. With the coins used in most countries, taking the largest coin that fits is always optimal. With other coin systems the same rule gives wrong answers. The skill is knowing which systems are safe and how to check one.

## theory
Greedy change: sort the denominations from largest to smallest; for each, take as many coins as fit (integer division) and continue with the remainder. If the remainder reaches zero the answer is the total count.

Canonical coin systems are those where this rule is optimal for every amount. Examples:

- 1, 5, 10, 25 (US coins) and 1, 2, 5, 10, 20, 50, 100 (euro-like systems) are canonical: for 63 the rule gives 25, 25, 10, 1, 1, 1, six coins, and no combination does better
- Any system where each denomination divides the next larger one, such as 1, 2, 4, 8 or 1, 5, 25, 125, is canonical, since every larger coin is a multiple of the smaller ones
- 1, 3, 4 is not canonical: for 6 the greedy rule takes 4 + 1 + 1 (three coins) but 3 + 3 uses two
- 1, 5, 12 is not canonical: for 15 greedy takes 12 + 1 + 1 + 1 (four coins) while 5 + 5 + 5 uses three

When no coin of value 1 exists, greedy may even fail to find a solution that exists, or return a leftover. For example, with coins 5 and 3 the amount 9 cannot be made greedily (5 leaves 4, which 3 cannot cover) although 3 + 3 + 3 works. Always keep a way to report failure.

Checking a system: compute the optimal counts with dynamic programming, `best[a] = 1 + min(best[a - c])` over coins `c <= a`, and compare with the greedy counts. For the system 1, 3, 4 the amounts up to 20 where greedy is wrong are 6, 10, 14 and 18. For 1, 5, 10, 25 and for 1, 2, 5 there is no mismatch up to 100. A known theorem says it suffices to test amounts below the sum of the two largest coins (Pearson's test gives a polynomial algorithm), so you do not need to test unbounded amounts.

Practical rules:

- Use greedy only for coin systems that you know to be canonical, and document that assumption
- For arbitrary denominations use dynamic programming (the minimum number of coins problem), which is correct for every system
- Counting the number of ways to make an amount is a different problem and also needs dynamic programming
- With unlimited coins greedy needs one division per denomination; with a limited number of coins of each kind the logic needs care, and greedy can fail even for canonical systems

Cost: greedy is O(k) after sorting, independent of the amount, so it works for amounts like 10^18. Dynamic programming costs O(amount · k), which is fine for amounts of up to millions.

Interview angle: interviewers often present this problem hoping for the greedy answer and then add coins like 1, 3, 4 to see whether you notice. Give the dynamic programming solution as the general answer and mention greedy as an optimisation for canonical systems.

## explain
1. Sort the denominations in decreasing order.
2. For each denomination, take amount divided by the coin, and reduce the amount to the remainder.
3. If the remainder is zero at the end, return the coin count; otherwise report that change cannot be made.
4. To trust the result, compare against dynamic programming for small amounts.
5. If any amount disagrees, stop using greedy for this system.
6. Document which systems are supported.

## example
The Python program counts greedy coins for 6 with the system 1, 3 and 4, which gives 3, whereas the dynamic programming optimum is 2. It also lists the amounts up to 20 on which greedy is wrong for this system: 6, 10, 14 and 18. The JavaScript program shows that for the system 1, 5 and 12 greedy needs 4 coins for 15 while 3 are enough, and it lists six failing amounts up to 30.

## real
Cash registers and vending machines use greedy change because national coin systems are canonical, and payment software must fall back to exact algorithms for unusual token or voucher denominations.

## pros
- O(k) per query, independent of the amount
- Trivial to implement for standard currencies
- Easy to verify against dynamic programming

## cons
- Wrong for non-canonical coin systems
- May fail to find change that exists
- Requires a verification step for new denominations

## uses
- Cash registers and vending machines
- Teaching when greedy is safe
- Testing coin systems against dynamic programming
- Interview problems on minimum coins

## mistakes
- Using greedy for arbitrary denominations
- Forgetting a coin of value one, so the remainder may not reach zero
- Mixing up the minimum number of coins with the number of ways to make change
- Verifying only a few amounts instead of a full range

## interview
**Q:** When does greedy give the fewest coins?
**A:** For canonical coin systems such as 1, 5, 10, 25, where taking the largest coin first is optimal for every amount. For general systems you need dynamic programming.

**Q:** Give a coin system where greedy fails.
**A:** With coins 1, 3 and 4 and the amount 6, greedy picks 4, 1, 1 (three coins) but 3 and 3 needs only two.

**Q:** How can you test whether a coin system is canonical?
**A:** Compare the greedy counts with dynamic programming counts for all amounts up to a bound such as the sum of the two largest coins; any mismatch shows the system is not canonical.

## summary
Greedy coin change is optimal only for canonical systems like US coins; for others, such as 1, 3, 4, it fails. Verify a system against dynamic programming and use dynamic programming whenever the denominations are arbitrary.

## codenote
The Python sample compares greedy with dynamic programming and lists the failing amounts. The JavaScript sample does the same for another system.

## code
### python
```python
def greedy_count(amount, coins):
    total = 0
    for coin in sorted(coins, reverse=True):
        count, amount = divmod(amount, coin)
        total += count
    return total if amount == 0 else None

def optimal_counts(limit, coins):
    best = [0] + [10 ** 9] * limit
    for amount in range(1, limit + 1):
        for coin in coins:
            if coin <= amount:
                best[amount] = min(best[amount], best[amount - coin] + 1)
    return best

def failing_amounts(coins, limit):
    best = optimal_counts(limit, coins)
    return [a for a in range(1, limit + 1) if greedy_count(a, coins) != best[a]]

print(greedy_count(6, [1, 3, 4]), optimal_counts(6, [1, 3, 4])[6])
print(failing_amounts([1, 3, 4], 20))
print(failing_amounts([1, 5, 10, 25], 100))
```
Output:
```text
3 2
[6, 10, 14, 18]
[]
```
### javascript
```javascript
function greedy(amount, coins) {
  let total = 0;
  for (const coin of [...coins].sort((a, b) => b - a)) {
    total += Math.floor(amount / coin);
    amount %= coin;
  }
  return total;
}

function optimal(limit, coins) {
  const best = [0];
  for (let amount = 1; amount <= limit; amount++) {
    best[amount] = Infinity;
    for (const coin of coins) {
      if (coin <= amount) best[amount] = Math.min(best[amount], best[amount - coin] + 1);
    }
  }
  return best;
}

const coins = [1, 5, 12];
const best = optimal(30, coins);
const bad = [];
for (let amount = 1; amount <= 30; amount++) {
  if (greedy(amount, coins) !== best[amount]) bad.push(amount);
}
console.log(bad.join(" "));
console.log(greedy(15, coins), best[15]);
```
Output:
```text
15 16 20 21 27 28
4 3
```

## quiz
1. For which coin system is greedy change optimal?
   - [ ] 1, 3, 4
   - [x] 1, 5, 10, 25
   - [ ] 1, 5, 12
   - [ ] 2, 5
   > Canonical systems like US coins are safe for the greedy rule.
2. What does greedy give for the amount 6 with coins 1, 3, 4?
   - [ ] Two coins
   - [x] Three coins
   - [ ] Four coins
   - [ ] It cannot make 6
   > It takes 4, 1, 1 although 3 and 3 is better.
3. What is the correct general algorithm for arbitrary denominations?
   - [ ] Greedy with sorting
   - [x] Dynamic programming over amounts
   - [ ] Binary search
   - [ ] Random choice
   > It is correct for every coin system.
4. Why can greedy report no solution when change exists?
   - [ ] The coins are sorted
   - [x] Taking a large coin can leave a remainder that no coin covers
   - [ ] Division is inexact
   - [ ] Integers overflow
   > With coins 5 and 3, the amount 9 cannot be made after taking 5.

# Minimum Platforms
kind: algorithm
time: O(n log n) to sort arrival and departure times plus O(n) for the sweep; the sorted-input case is O(n).
space: O(1) extra after sorting in place, or O(n) for sorted copies.

## intro
A railway station receives trains with known arrival and departure times. How many platforms must it have so that no train waits? This is the minimum number of resources for overlapping intervals problem, and the greedy sweep over sorted arrival and departure times solves it with a simple counter.

## theory
Problem: given arrival times `a_i` and departure times `d_i`, find the minimum number of platforms such that every train gets a platform for its whole stay. Two trains can share a platform if one departs no later than the other arrives (or strictly before, depending on the rule).

Key observation: the answer equals the maximum number of trains present at the same time, because at the busiest instant each present train needs its own platform, and the greedy assignment never needs more.

Sweep algorithm:

- Sort the arrival times and sort the departure times, separately and independently
- Keep a pointer on the earliest unprocessed departure and a counter of trains present
- For each arrival in sorted order, if it is earlier than the earliest departure, no platform is free, so increase the counter; otherwise a train has left, so advance the departure pointer instead
- Record the maximum counter value

Sorting the two lists separately is allowed because only the number of trains present at each moment matters, not which train is which.

Example (times as hhmm numbers): arrivals 900, 940, 950, 1100, 1500, 1800 and departures 910, 1200, 1120, 1130, 1900, 2000. Sorted departures are 910, 1120, 1130, 1200, 1900, 2000. The 900 train has left by 910, so at 950 the trains from 940 and 950 are present, and at 1100 the trains from 940, 950 and 1100 are all in the station because the earliest remaining departures are 1120 and 1130. The maximum is 3.

Equivalent formulations:

- Event sweep: create an event `(time, +1)` for each arrival and `(time, -1)` for each departure, sort the events, and compute the running sum, taking the maximum. When a departure and arrival have the same time, order them according to the rule: departures first if touching trains may share a platform
- Heap of departures: process trains in arrival order, pop from a min-heap every departure at or before the arrival, push this train's departure, and track the heap size
- Difference array for small integer times: add 1 at arrival, subtract 1 after departure, and take prefix sums

All three are O(n log n), and the difference array is O(n + T) for a time range of T.

Related problems: minimum meeting rooms, minimum number of CPUs for jobs with start and end times, and the maximum number of overlapping intervals (the depth of an interval graph, which equals its chromatic number).

Edge cases: a single train needs one platform; identical times for all trains need n; and equal arrival and departure instants must follow the stated rule (strict or non-strict comparison).

## explain
1. Sort the arrival times and the departure times separately.
2. Start with one platform in use for the first arrival, and set the pointers.
3. For each next arrival, compare it with the earliest remaining departure.
4. If it is earlier, add a platform; otherwise advance the departure pointer.
5. Track the maximum count over the sweep.
6. Decide how an arrival at exactly a departure time is treated.

## example
The Python function returns 3 for the six trains above and 1 for the arrivals `[900, 1100]` with departures `[1000, 1200]`, because the two trains never overlap. The JavaScript function gets 3 for three trains that arrive at 1, 2, 3 and leave at 4, 5, 6 (all overlap) and 1 for arrivals 1 and 5 with departures 3 and 8.

## real
Station planners size platforms and gates this way, and cloud schedulers use the same sweep to estimate the number of servers or workers a batch of timed jobs needs.

## pros
- Simple and optimal sweep
- O(n log n), dominated by sorting
- Works for any resources with start and end times

## cons
- Needs a clear rule for touching times
- Gives only the count, not the assignment of trains
- Sorting both lists separately hides which train is which

## uses
- Sizing platforms, gates or rooms
- Estimating the number of servers for timed jobs
- Finding the maximum overlap of intervals
- Scheduling exams or meetings in the fewest rooms

## mistakes
- Sorting arrivals and departures together as pairs and sweeping incorrectly
- Using inconsistent comparisons for touching times
- Forgetting to take the maximum, and returning the final counter instead
- Assuming that fewer platforms are enough because trains rarely overlap

## interview
**Q:** How do you find the minimum number of platforms for a timetable?
**A:** Sort arrivals and departures separately and sweep through the arrivals: if an arrival comes before the earliest remaining departure a platform is added, otherwise a departure is consumed; the maximum number in use is the answer.

**Q:** Why is it valid to sort arrivals and departures separately?
**A:** The number of trains present at any moment is the number of arrivals so far minus the number of departures so far, which depends only on the two sorted lists, not on which arrival belongs to which departure.

**Q:** What is the time complexity?
**A:** O(n log n) because of the sorting step; the sweep itself is linear.

## summary
The minimum number of platforms equals the maximum number of trains present at once. Sort arrivals and departures separately and sweep with two pointers to count it in O(n log n).

## codenote
The Python sample counts platforms for a timetable. The JavaScript sample runs the same sweep on small integer times.

## code
### python
```python
def min_platforms(arrivals, departures):
    arrivals, departures = sorted(arrivals), sorted(departures)
    platforms = best = 0
    leave = 0
    for arrival in arrivals:
        if arrival < departures[leave]:
            platforms += 1
        else:
            leave += 1
        best = max(best, platforms)
    return best

print(min_platforms([900, 940, 950, 1100, 1500, 1800], [910, 1200, 1120, 1130, 1900, 2000]))
print(min_platforms([900, 1100], [1000, 1200]))
```
Output:
```text
3
1
```
### javascript
```javascript
function platforms(arrivals, departures) {
  const a = [...arrivals].sort((x, y) => x - y);
  const d = [...departures].sort((x, y) => x - y);
  let present = 0;
  let best = 0;
  let leave = 0;
  for (const arrival of a) {
    if (arrival < d[leave]) present++;
    else leave++;
    best = Math.max(best, present);
  }
  return best;
}

console.log(platforms([1, 2, 3], [4, 5, 6]), platforms([1, 5], [3, 8]));
```
Output:
```text
3 1
```

## quiz
1. What does the minimum number of platforms equal?
   - [ ] The number of trains
   - [x] The maximum number of trains present at the same time
   - [ ] The average number of trains
   - [ ] The number of departures
   > The busiest moment decides how many are needed.
2. Why can arrivals and departures be sorted separately?
   - [ ] They are always equal
   - [x] Only the counts of arrivals and departures so far matter
   - [ ] Sorting is optional
   - [ ] Trains are identical
   > Present trains equal arrivals so far minus departures so far.
3. What is the time complexity?
   - [ ] O(1)
   - [x] O(n log n)
   - [ ] O(n squared)
   - [ ] O(2 to the n)
   > Sorting dominates the linear sweep.
4. How many platforms for arrivals 900 and 1100 with departures 1000 and 1200?
   - [ ] Two
   - [x] One
   - [ ] Zero
   - [ ] Three
   > The first train leaves before the second arrives.

# Jump Game Greedy
kind: algorithm
time: O(n) for a single pass over the array in both the reachability check and the minimum jumps problem.
space: O(1) because only a few counters are kept, in contrast to a dynamic programming table.

## intro
You stand at the start of an array in which each value is the maximum number of steps you may jump forward from that position. Can you reach the last index, and if so, with how many jumps at the minimum? Both questions have clean greedy answers that run in a single pass, and they show how a greedy invariant, the farthest position reachable so far, replaces a table of states.

## theory
Reachability (can you get to the end?):

- Keep `far`, the farthest index reachable using the positions seen so far
- Iterate over indices from the start; if the current index is greater than `far`, it cannot be reached and the answer is false
- Otherwise update `far = max(far, i + nums[i])`; if `far` reaches the last index, the answer is true

Why it works: reachable indices form a prefix of the array, because if you can reach index `j` you can reach every index before it that you passed over. So the single number `far` summarises the whole set of reachable positions, and no backtracking is needed.

Examples: for `[2, 3, 1, 1, 4]` the farthest reach grows to 2, 4 and then 4, so the end is reachable. For `[3, 2, 1, 0, 4]` every path gets stuck at index 3, whose value is 0, so the farthest reach is 3 and the end is not reachable.

Minimum number of jumps (a breadth-first search in disguise):

- Treat the positions reachable with k jumps as a window that ends at `current_end`
- While scanning, track `far`, the farthest index reachable with one more jump from any position inside the window
- When the scan reaches `current_end`, you must take another jump: increase the jump count and set `current_end = far`
- Stop before the last index, and the count is the answer

For `[2, 3, 1, 1, 4]` the answer is 2 (index 0 to index 1, then to the end), and for `[2, 3, 0, 1, 4]` it is also 2.

Why this is greedy and correct: from the window of positions reachable with k jumps, the best next jump target is the one reaching farthest, since any later position reachable with k + 1 jumps is within that reach. It is the same layered view as breadth-first search, but the layers are contiguous ranges, so no queue is needed.

Complexity: O(n) time and O(1) space. A dynamic programming solution that stores the minimum jumps to each index is O(n squared) in the plain form, and a breadth-first search with a queue is O(n) with extra memory; the greedy window is the leanest.

Variants:

- Jump game with a fixed jump length given by the value (not a maximum): becomes a graph search
- Jump to the last index with minimum cost, where each landing has a price: dynamic programming
- Frog jump over stones, and jumping with both forward and backward moves: breadth-first search
- Reaching the end when some values are zero: the greedy check handles zeros naturally, because a zero only blocks if no earlier jump passes over it

Edge cases: a single element is already at the end, with 0 jumps; if the array starts with 0 and has more than one element, the end is unreachable; and be careful with the loop bound in the minimum jumps version so that it stops before the last index.

## explain
1. Initialise the farthest reach to zero for the reachability problem.
2. For each index, fail if it exceeds the farthest reach, otherwise extend the reach.
3. Return true once the reach covers the last index.
4. For minimum jumps, keep the end of the current window and the farthest reach.
5. When the index hits the window end, count a jump and move the window end to the farthest reach.
6. Test a single element, leading zeros and large first values.

## example
The Python functions report `True` for `[2, 3, 1, 1, 4]` and `False` for `[3, 2, 1, 0, 4]`, and the minimum number of jumps is 2 for both `[2, 3, 1, 1, 4]` and `[2, 3, 0, 1, 4]`. The JavaScript function reports `false` for `[1, 1, 0, 1]`, which is blocked at the zero, and `true` for `[2, 0, 0]`, where the first jump passes over both zeros.

## real
Game engines check whether a level is completable with limited moves, and route planners use the farthest-reach idea for hop-limited paths such as multi-stop flight or ferry connections.

## pros
- Single pass and constant extra memory
- Handles zeros without special cases
- Shows how an invariant can replace a table

## cons
- Specific to the structure where reachable positions form a prefix
- Does not return the actual path without extra bookkeeping
- Harder to extend to costs or backward moves

## uses
- Checking whether the end of a jump array is reachable
- Computing the minimum number of jumps
- Teaching greedy windows as an alternative to breadth-first search
- Interview problems on arrays

## mistakes
- Looping over the last index in the minimum jumps problem and counting an extra jump
- Forgetting to fail when the current index exceeds the farthest reach
- Using dynamic programming with quadratic time for large inputs
- Confusing the maximum jump length with a fixed jump length

## interview
**Q:** How do you check whether you can reach the last index of a jump array?
**A:** Keep the farthest reachable index while scanning; if an index is beyond the farthest reach the end cannot be reached, otherwise update the reach with the index plus its value, and report true once the reach covers the last index.

**Q:** How do you compute the minimum number of jumps in O(n)?
**A:** Track the end of the current window of positions reachable with the jumps so far and the farthest index reachable with one more jump; when the scan arrives at the window end, count a jump and extend the window to the farthest reach.

**Q:** Why is no backtracking needed?
**A:** The set of reachable positions is always a prefix of the array, so the farthest reach is a complete summary of the state.

## summary
The farthest-reach invariant solves both jump game questions in one pass with constant memory: fail when an index lies beyond it, and count a jump each time the scan leaves the current window.

## codenote
The Python sample answers reachability and minimum jumps. The JavaScript sample checks reachability for two arrays.

## code
### python
```python
def can_jump(nums):
    far = 0
    for index, step in enumerate(nums):
        if index > far:
            return False
        far = max(far, index + step)
    return True

def min_jumps(nums):
    jumps = window_end = far = 0
    for index in range(len(nums) - 1):
        far = max(far, index + nums[index])
        if index == window_end:
            jumps += 1
            window_end = far
    return jumps

print(can_jump([2, 3, 1, 1, 4]), can_jump([3, 2, 1, 0, 4]))
print(min_jumps([2, 3, 1, 1, 4]), min_jumps([2, 3, 0, 1, 4]))
```
Output:
```text
True False
2 2
```
### javascript
```javascript
function canReach(nums) {
  let far = 0;
  for (let i = 0; i < nums.length; i++) {
    if (i > far) return false;
    far = Math.max(far, i + nums[i]);
  }
  return true;
}

console.log(canReach([1, 1, 0, 1]), canReach([2, 0, 0]));
```
Output:
```text
false true
```

## quiz
1. What does the variable far represent in the jump game?
   - [ ] The number of jumps
   - [x] The farthest index reachable so far
   - [ ] The last value
   - [ ] The array length
   > It summarises all reachable positions as a prefix.
2. When is the end unreachable?
   - [ ] When the array has zeros
   - [x] When some index lies beyond the farthest reach
   - [ ] When the first value is large
   - [ ] When the array is sorted
   > A gap that no jump passes over blocks the path.
3. What is the time complexity of the greedy solution?
   - [ ] O(n squared)
   - [x] O(n)
   - [ ] O(n log n)
   - [ ] O(2 to the n)
   > A single pass suffices.
4. When does the minimum jumps algorithm count a jump?
   - [ ] At every index
   - [x] When the scan reaches the end of the current window
   - [ ] At zeros only
   - [ ] At the last index
   > Leaving the window requires one more jump.

# Task Scheduler Greedy
kind: algorithm
time: O(n) to count the task frequencies and apply the formula, or O(n log k) when simulating with a heap for k distinct task types.
space: O(k) for the frequency table, where k is the number of distinct task types (26 for letters).

## intro
A CPU must run a list of tasks, each labelled by a letter. The same task type must wait at least n time units between two runs, and the CPU may idle when nothing is allowed. What is the minimum total time? The greedy insight is that the most frequent task creates the bottleneck, and everything else is used to fill the gaps in its schedule.

## theory
Problem: tasks with types A to Z, a cooldown `n` between two runs of the same type, and the goal of finishing all tasks in the least time (idle slots count).

Greedy view: arrange the most frequent task first, spaced `n + 1` slots apart, and put the other tasks in the gaps.

Let `m` be the highest frequency and `k` the number of task types that have this frequency. The schedule has `m − 1` full frames of length `n + 1` and a final partial frame holding the `k` most frequent tasks:

- Minimum time = `(m − 1) · (n + 1) + k`
- If there are so many tasks that every gap is filled, no idle time is needed and the answer is simply the number of tasks
- So the answer is `max(len(tasks), (m − 1) · (n + 1) + k)`

Examples: for `AAABBB` with `n = 2`, `m = 3` and `k = 2`, so the formula gives `2 · 3 + 2 = 8`, and the schedule `A B idle A B idle A B` has 8 slots. For the same tasks with `n = 0` the formula gives `2 · 1 + 2 = 4`, which is less than the 6 tasks, so the answer is 6. For `AAAAAABCDEFG` with `n = 2`, `m = 6` and `k = 1`, so the formula gives `5 · 3 + 1 = 16`, since the other six tasks cannot fill all the gaps and idle slots remain.

Why the formula is right: each of the `m` copies of the most frequent task needs its own frame start, and consecutive copies are at least `n + 1` apart, so the last copy cannot be earlier than slot `(m − 1)(n + 1) + 1`. All tasks with the maximum frequency must also appear in the last frame. If the formula is below the number of tasks, enough other tasks exist to fill every gap, and then no idle is needed.

Simulation with a heap (useful when the order of tasks is required):

- Put the remaining counts in a max-heap
- In each round of `n + 1` slots, pop up to `n + 1` task types, run one of each, decrement the counts, and push back those with tasks left
- If the heap becomes empty before the round is full and tasks remain, the rest of the round is idle time
- Count the slots used

The heap simulation gives the same totals as the formula, for example 8 for the first example and 16 for the third. It costs O(total time · log k).

Variants:

- Output the actual schedule rather than only the length
- Rearrange a string so that equal characters are at least `n` apart (return empty if impossible): the same heap method
- Tasks with different priorities or deadlines: scheduling with deadlines uses a heap and sorting
- Cooldown between identical tasks as well as a limit on parallel workers: extend the frame view with more machines

Edge cases: no tasks gives zero; a single type needs `(m − 1)(n + 1) + 1` slots; and `n = 0` means no waiting, so the time is the task count.

## explain
1. Count the frequency of every task type.
2. Find the maximum frequency m and the number of types k with that frequency.
3. Compute the frame-based length (m − 1) · (n + 1) + k.
4. Return the larger of that value and the number of tasks.
5. If the order is needed, simulate with a max-heap in rounds of n + 1 slots.
6. Test one task type, a zero cooldown and many types.

## example
The Python function returns 8 for `AAABBB` with a cooldown of 2, 6 for the same tasks with cooldown 0, and 16 for `AAAAAABCDEFG` with a cooldown of 2, and a heap simulation reproduces the values 8 and 16. The JavaScript function returns 11 for `AAAABBBBCC` with a cooldown of 2 and 10 for a cooldown of 1.

## real
Operating systems and job queues space out repeated jobs to avoid overheating or rate limits, and API clients wait between calls to the same endpoint while doing other work in the gaps.

## pros
- O(n) with a closed-form formula
- Shows how the bottleneck item determines the schedule
- The heap simulation yields the actual order

## cons
- The formula gives only the length, not the order
- Subtle to prove without drawing the frames
- Does not extend easily to varying cooldowns

## uses
- Computing the minimum time for tasks with cooldowns
- Rearranging a string so equal letters are spaced apart
- Rate limiting for repeated API calls
- Teaching greedy scheduling with a heap

## mistakes
- Forgetting that the answer is at least the number of tasks
- Ignoring that several task types may share the maximum frequency
- Counting idle slots incorrectly in the heap simulation
- Using a cooldown of n instead of a spacing of n plus one slots

## interview
**Q:** How do you compute the minimum time to run tasks with a cooldown?
**A:** Find the maximum frequency m and the number k of tasks with that frequency; the time is the larger of the task count and (m − 1)(n + 1) + k.

**Q:** Why does the most frequent task decide the schedule?
**A:** Its copies must be at least n + 1 slots apart, which fixes the minimum length, and the other tasks can only fill the gaps in between.

**Q:** How can you build the actual schedule?
**A:** Use a max-heap of remaining counts and, in each round of n + 1 slots, run the most frequent available tasks, adding idle slots when the heap runs out before the round ends.

## summary
The most frequent task creates frames of n + 1 slots; the minimum time is the larger of the task count and (m − 1)(n + 1) + k. A heap simulation produces the actual order with the same total.

## codenote
The Python sample implements the formula and checks it with a heap simulation. The JavaScript sample uses the formula.

## code
### python
```python
import heapq
from collections import Counter

def least_time(tasks, cooldown):
    counts = Counter(tasks).values()
    most = max(counts)
    ties = sum(1 for c in counts if c == most)
    return max(len(tasks), (most - 1) * (cooldown + 1) + ties)

def simulate(tasks, cooldown):
    heap = [-c for c in Counter(tasks).values()]
    heapq.heapify(heap)
    time = 0
    while heap:
        taken = []
        for _ in range(cooldown + 1):
            if heap:
                count = heapq.heappop(heap) + 1
                if count:
                    taken.append(count)
            time += 1
            if not heap and not taken:
                break
        for count in taken:
            heapq.heappush(heap, count)
    return time

print(least_time("AAABBB", 2), least_time("AAABBB", 0), least_time("AAAAAABCDEFG", 2))
print(simulate("AAABBB", 2), simulate("AAAAAABCDEFG", 2))
```
Output:
```text
8 6 16
8 16
```
### javascript
```javascript
function leastTime(tasks, cooldown) {
  const counts = {};
  for (const task of tasks) counts[task] = (counts[task] || 0) + 1;
  const values = Object.values(counts);
  const most = Math.max(...values);
  const ties = values.filter((v) => v === most).length;
  return Math.max(tasks.length, (most - 1) * (cooldown + 1) + ties);
}

console.log(leastTime("AAAABBBBCC", 2), leastTime("AAAABBBBCC", 1));
```
Output:
```text
11 10
```

## quiz
1. What determines the minimum schedule length?
   - [ ] The least frequent task
   - [x] The most frequent task and how many tasks share that frequency
   - [ ] The alphabetical order
   - [ ] The total of all cooldowns
   > Its copies must be spaced n plus one slots apart.
2. What is the formula for the minimum time?
   - [ ] The number of tasks only
   - [x] The larger of the task count and (m − 1)(n + 1) + k
   - [ ] m times n
   - [ ] n plus k
   > The frame length applies when idle slots are needed.
3. What is the minimum time for AAABBB with a cooldown of 0?
   - [ ] 4
   - [x] 6
   - [ ] 8
   - [ ] 3
   > With no waiting, each of the six tasks takes one slot.
4. Which structure builds the actual schedule?
   - [ ] A queue of letters
   - [x] A max-heap of remaining counts
   - [ ] A stack
   - [ ] A binary search tree
   > It picks the most frequent available task in each round.

# When Greedy Fails
kind: concept
time: Not an algorithmic topic — recognising failures is an analysis skill. The exact alternatives, dynamic programming and search, cost more, such as O(n · W) for the 0/1 knapsack.
space: Not an algorithmic topic — memory use depends on the alternative chosen, for example O(W) for the knapsack table.

## intro
A greedy rule can look perfectly reasonable and still give a wrong answer. Learning to spot the situations where greedy fails, and to find a counterexample quickly, protects you from submitting a confident but incorrect solution. The cure is usually dynamic programming or exhaustive search with pruning.

## theory
Greedy fails when a locally best choice closes off a better global solution, which means the greedy choice property does not hold. Warning signs:

- The problem has items that cannot be split, so leftover capacity can be wasted (0/1 knapsack)
- Choices interact in a way that a small early gain causes a large later loss
- Several constraints compete, and the greedy criterion looks at only one of them
- The objective is to count something exactly (the number of ways), not to optimise one quantity
- A seemingly similar problem is solvable by greedy only because of a special structure of the data, such as a canonical coin system

Classic failures:

- Coin change with coins 1, 3 and 4 for the amount 6: greedy takes 4, 1, 1 for three coins while 3 + 3 uses two
- 0/1 knapsack with items `(value, weight)` = (60, 10), (100, 20), (120, 30) and capacity 50: greedy by value per weight takes the first two items for 160, but the best selection is the last two for 220
- Shortest paths with negative edges: choosing the nearest unvisited node (Dijkstra's greedy rule) fails because a later negative edge can shorten an earlier path
- Travelling salesman: always going to the nearest unvisited city gives tours that can be far from optimal
- Weighted interval scheduling: earliest finish ignores values (see the next lesson)
- Graph colouring with a fixed vertex order can use many more colours than needed

How to find a counterexample quickly:

- Try tiny inputs (two or three items) and values that are close
- Make the greedy criterion pick something that blocks a better combination (a large item with a slightly better ratio that leaves a gap)
- Use a brute-force solver and random tests to search automatically
- Think about which constraint the criterion ignores and craft an instance that stresses it

What to do instead:

- Dynamic programming: when the problem has optimal substructure and overlapping subproblems, as in knapsack, coin change and edit distance
- Backtracking or branch and bound: when the state space is large but prunable
- Approximation algorithms: when the exact problem is NP-hard, greedy is often the basis of a provable approximation (for example, greedy set cover within a logarithmic factor, or the 1/2-approximation for the 0/1 knapsack that takes the better of the greedy prefix and the best single item)
- Heuristics: nearest neighbour for travelling salesman, accepted when optimality is not required

The greedy answer is still useful as a fast baseline or an upper bound, and comparing it with the exact answer measures how much a heuristic loses.

Lesson for interviews: if you propose a greedy solution, state why you believe it is correct, test it on a tricky case, and name the alternative if it fails.

## explain
1. Write the greedy rule as a precise sentence.
2. Ask which constraint or interaction it ignores.
3. Construct a small instance that stresses that constraint.
4. Compare the greedy result with a brute-force or dynamic programming result.
5. If they differ, switch to dynamic programming, search or an approximation.
6. If they agree on many tests, look for a proof before trusting it.

## example
The Python program shows both classic counterexamples: greedy coin change uses 3 coins for the amount 6 with coins 1, 3 and 4 while the optimum is 2, and greedy by value-to-weight ratio on the knapsack items takes a value of 160 where dynamic programming finds 220. The JavaScript program repeats the knapsack comparison with another instance and shows greedy 11 against optimal 12.

## real
Logistics and routing software cannot rely on nearest-neighbour heuristics when contracts demand optimal costs, and compiler register allocators use heuristics that sometimes lose to exact solutions.

## pros
- Understanding failures prevents wrong submissions
- Counterexamples are quick to find with small cases
- Greedy remains useful as a fast baseline or bound

## cons
- Exact alternatives are slower and more complex
- A counterexample may be hard to find by hand
- Heuristic answers may be accepted incorrectly if untested

## uses
- Auditing a proposed greedy solution
- Choosing between greedy and dynamic programming
- Building approximation algorithms
- Teaching why proofs matter

## mistakes
- Assuming the greedy rule is correct because it works on the sample input
- Treating 0/1 knapsack like the fractional version
- Using nearest-neighbour as if it were optimal
- Not stating the assumptions under which a greedy solution holds

## interview
**Q:** Give an example where greedy fails.
**A:** The 0/1 knapsack with items (60, 10), (100, 20), (120, 30) and capacity 50: choosing by value per weight gives 160, but the best choice gives 220. Coin change with coins 1, 3 and 4 for 6 is another.

**Q:** How do you find a counterexample for a greedy rule?
**A:** Try small instances that stress what the rule ignores, such as leftover capacity or interacting choices, and compare the rule with brute force or dynamic programming on many random inputs.

**Q:** What are the alternatives when greedy fails?
**A:** Dynamic programming for problems with optimal substructure, backtracking with pruning, or approximation algorithms and heuristics when the exact problem is hard.

## summary
Greedy fails when a locally best choice blocks a better global solution, as in the 0/1 knapsack and coin change with unusual denominations. Search for counterexamples on small inputs and switch to dynamic programming or search when you find one.

## codenote
The Python sample reproduces two failures with exact comparisons. The JavaScript sample compares greedy and exhaustive search on a knapsack instance.

## code
### python
```python
def greedy_knapsack(items, capacity):
    total = 0
    for value, weight in sorted(items, key=lambda item: item[0] / item[1], reverse=True):
        if weight <= capacity:
            total += value
            capacity -= weight
    return total

def best_knapsack(items, capacity):
    best = [0] * (capacity + 1)
    for value, weight in items:
        for room in range(capacity, weight - 1, -1):
            best[room] = max(best[room], best[room - weight] + value)
    return best[capacity]

def greedy_coins(amount, coins):
    count = 0
    for coin in sorted(coins, reverse=True):
        used, amount = divmod(amount, coin)
        count += used
    return count

items = [(60, 10), (100, 20), (120, 30)]
print(greedy_coins(6, [1, 3, 4]), 2)
print(greedy_knapsack(items, 50), best_knapsack(items, 50))
```
Output:
```text
3 2
160 220
```
### javascript
```javascript
function greedyKnapsack(items, capacity) {
  let total = 0;
  const ordered = [...items].sort((a, b) => b[0] / b[1] - a[0] / a[1]);
  for (const [value, weight] of ordered) {
    if (weight <= capacity) {
      total += value;
      capacity -= weight;
    }
  }
  return total;
}

function exhaustive(items, capacity) {
  let best = 0;
  for (let mask = 0; mask < 1 << items.length; mask++) {
    let value = 0;
    let weight = 0;
    items.forEach(([v, w], i) => {
      if (mask >> i & 1) {
        value += v;
        weight += w;
      }
    });
    if (weight <= capacity) best = Math.max(best, value);
  }
  return best;
}

const items = [[11, 5], [6, 3], [6, 3]];
console.log(greedyKnapsack(items, 6), exhaustive(items, 6));
```
Output:
```text
11 12
```

## quiz
1. When does a greedy algorithm fail?
   - [ ] When the data is sorted
   - [x] When a locally best choice blocks a better global solution
   - [ ] When the input is small
   - [ ] When it uses a loop
   > The greedy choice property does not hold in that case.
2. Which problem is a classic greedy failure?
   - [ ] Activity selection
   - [x] The 0/1 knapsack by value per weight
   - [ ] Huffman coding
   - [ ] Fractional knapsack
   > Wasted capacity makes the best-ratio choice suboptimal.
3. How can you find a counterexample quickly?
   - [ ] Run the algorithm on huge inputs
   - [x] Compare it with brute force on many small random inputs
   - [ ] Sort the input
   - [ ] Read the code twice
   > Any difference is a counterexample.
4. What can replace greedy when it fails?
   - [ ] Nothing
   - [x] Dynamic programming or search with pruning
   - [ ] A bigger array
   - [ ] Recursion without a base case
   > These methods consider the interactions between choices.

# Greedy vs Dynamic Programming
kind: concept
time: Not an algorithmic topic — this lesson compares two strategies. Greedy methods are usually O(n log n) or O(n), while dynamic programming typically costs O(n · W) or O(n squared) for the problems discussed.
space: Not an algorithmic topic — greedy uses O(1) to O(n) memory, while dynamic programming stores a table whose size depends on the number of states.

## intro
Greedy algorithms and dynamic programming both exploit optimal substructure, and they are easy to confuse. The difference is how they decide: greedy commits to one choice and never looks back, while dynamic programming tries every choice and keeps the best by remembering results of subproblems. Choosing between them is one of the most common decisions in algorithm design.

## theory
Comparison:

- Greedy: one choice per step, using a local rule, with no revisiting. It needs the greedy choice property. It is fast and uses little memory, but is correct only for special problems.
- Dynamic programming: considers all choices at a step by combining stored answers to subproblems. It needs optimal substructure and overlapping subproblems. It is correct for a broader range of problems but costs more time and memory.
- Backtracking or brute force: enumerates all solutions, so it is correct but exponential unless pruned

Decision procedure:

- If the problem asks to count, enumerate or find the best among combinations with interacting constraints, think about dynamic programming
- If a natural ordering or ratio makes one choice provably safe (earliest finish, highest ratio, smallest weight edge), consider greedy and test it against a brute-force check
- If both seem plausible, write the dynamic programming solution first for correctness, then see whether it collapses into a greedy rule

Pairs of problems that look alike:

- Fractional knapsack (greedy) and 0/1 knapsack (dynamic programming): splitting items makes the greedy choice safe
- Activity selection (greedy) and weighted interval scheduling (dynamic programming): without weights earliest finish is optimal, with weights it is not. For the jobs `(start, end, value)` = (1, 3, 5), (2, 5, 6), (4, 6, 5), (6, 7, 4), (5, 8, 11), (7, 9, 2), dynamic programming gives 17, while earliest-finish greedy ignoring values gives 16
- Coin change with canonical coins (greedy) and arbitrary coins (dynamic programming)
- Dijkstra's shortest paths (greedy, non-negative edges) and Bellman-Ford (dynamic programming, negative edges allowed)
- Minimum spanning trees (greedy, by the cut property) versus the travelling salesman (dynamic programming over subsets, exponential)

Dynamic programming for weighted interval scheduling: sort jobs by end time, define `best[i]` as the best total value using the first `i` jobs, and combine `best[i − 1]` (skip job i) with `value_i + best[p(i)]` (take job i, where `p(i)` is the number of jobs that end no later than job i starts, found by binary search). The cost is O(n log n).

Hybrids: some problems start as dynamic programming and simplify to greedy once a monotonic structure is noticed (for example the optimal strategy in jump game or the longest chain solutions that use a sorted array and binary search), and some greedy algorithms use dynamic programming for part of the decision (for example, assigning values and then scheduling).

Practical advice:

- Do not trust a greedy rule that you have not tested against an exact solution
- Prefer greedy when a proof exists, because it is simpler and faster
- Prefer dynamic programming when in doubt, as long as the state space fits in memory and time
- Document why a greedy rule is correct, so future changes to the problem are checked

Complexity summary: greedy time is dominated by sorting or heap use; dynamic programming time is the number of states times the transitions per state.

## explain
1. Check whether the problem has optimal substructure.
2. Ask whether one choice is provably safe at every step; if so, try greedy.
3. Otherwise define the states and transitions for dynamic programming.
4. Compare the two on small inputs to build confidence or find a counterexample.
5. Choose the simpler method that is correct and fast enough.
6. Write down the justification.

## example
The Python program solves the weighted interval scheduling instance above both ways: dynamic programming with binary search finds the total value 17 and the earliest-finish greedy rule gets 16 because it ignores values. The JavaScript program compares greedy and dynamic programming for the coin system 1, 5 and 12 at the amount 15, showing 4 coins against 3.

## real
Production systems use greedy methods for scheduling and routing heuristics where speed matters, and dynamic programming for exact tasks such as text diffing, sequence alignment and resource planning.

## pros
- Knowing both lets you choose the right tool
- Greedy gives speed and simplicity when it is valid
- Dynamic programming gives correctness on a wider class of problems

## cons
- Dynamic programming needs more time and memory
- Greedy needs a proof and fails silently otherwise
- Hybrids can be harder to reason about

## uses
- Deciding how to solve an optimisation problem
- Comparing similar problems with different solutions
- Reviewing a greedy solution against an exact one
- Interview preparation on scheduling and knapsack variants

## mistakes
- Using greedy because the examples work
- Choosing dynamic programming when a simple provable greedy exists
- Ignoring the memory cost of a large table
- Forgetting that adding weights can break a greedy rule

## interview
**Q:** What is the difference between greedy and dynamic programming?
**A:** Greedy makes one locally optimal choice per step and never revisits it, while dynamic programming evaluates all choices using stored solutions of overlapping subproblems; greedy needs the greedy choice property, dynamic programming needs optimal substructure.

**Q:** Why does activity selection use greedy but weighted interval scheduling use dynamic programming?
**A:** Without weights, the earliest finish time is provably safe. With weights, taking a short early job can block a more valuable one, so you must compare taking and skipping each job.

**Q:** How do you decide between them in practice?
**A:** Test a candidate greedy rule against a brute-force or dynamic programming solution; if there is a counterexample use dynamic programming, and if a proof exists prefer greedy for its speed.

## summary
Greedy commits to one safe choice per step, while dynamic programming compares all choices through stored subproblem results. Use greedy only when its choice is provably safe and dynamic programming when interactions matter, as when weights appear.

## codenote
The Python sample compares greedy and dynamic programming on weighted jobs. The JavaScript sample compares them on coin change.

## code
### python
```python
import bisect

def best_value(jobs):
    jobs = sorted(jobs, key=lambda job: job[1])
    ends = [job[1] for job in jobs]
    best = [0] * (len(jobs) + 1)
    for i, (start, end, value) in enumerate(jobs, 1):
        previous = bisect.bisect_right(ends, start, 0, i - 1)
        best[i] = max(best[i - 1], best[previous] + value)
    return best[-1]

def greedy_value(jobs):
    total, last_end = 0, -1
    for start, end, value in sorted(jobs, key=lambda job: job[1]):
        if start >= last_end:
            total += value
            last_end = end
    return total

jobs = [(1, 3, 5), (2, 5, 6), (4, 6, 5), (6, 7, 4), (5, 8, 11), (7, 9, 2)]
print(best_value(jobs), greedy_value(jobs))
```
Output:
```text
17 16
```
### javascript
```javascript
function greedyCoins(amount, coins) {
  let count = 0;
  for (const coin of [...coins].sort((a, b) => b - a)) {
    count += Math.floor(amount / coin);
    amount %= coin;
  }
  return count;
}

function bestCoins(amount, coins) {
  const best = [0];
  for (let a = 1; a <= amount; a++) {
    best[a] = Infinity;
    for (const coin of coins) {
      if (coin <= a) best[a] = Math.min(best[a], best[a - coin] + 1);
    }
  }
  return best[amount];
}

console.log(greedyCoins(15, [1, 5, 12]), bestCoins(15, [1, 5, 12]));
```
Output:
```text
4 3
```

## quiz
1. How does dynamic programming differ from greedy?
   - [ ] It uses no memory
   - [x] It considers all choices using stored results of subproblems
   - [ ] It never sorts
   - [ ] It always runs in linear time
   > Greedy commits to one choice, while dynamic programming compares them.
2. Which pair shows the effect of adding weights?
   - [ ] Sorting and searching
   - [x] Activity selection and weighted interval scheduling
   - [ ] Stacks and queues
   - [ ] Hashing and sorting
   > With weights the earliest finish rule is no longer optimal.
3. What does weighted interval scheduling give for the sample jobs?
   - [ ] 16
   - [x] 17
   - [ ] 11
   - [ ] 22
   > Dynamic programming reaches 17 while greedy reaches 16.
4. What should you do when unsure whether greedy is correct?
   - [ ] Submit it
   - [x] Compare it with an exact solution on small inputs
   - [ ] Add more loops
   - [ ] Increase the array size
   > A counterexample or agreement across many cases guides the decision.
