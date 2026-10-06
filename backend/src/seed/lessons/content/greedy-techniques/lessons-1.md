# Greedy Choice Property
kind: concept
time: Not an algorithmic topic — the greedy choice property is a condition that an optimisation problem must satisfy for a greedy method to work. When it holds, the resulting algorithms are usually fast, often O(n log n) from sorting.
space: Not an algorithmic topic — the property concerns correctness, not memory.

## intro
A greedy algorithm builds a solution one step at a time, always taking the choice that looks best right now and never reconsidering it. That is a risky way to solve a problem unless the problem has a special structure. The greedy choice property is that structure: it says that a locally best choice can always be extended to a globally best solution.

## theory
Two properties together make greedy algorithms correct:

- Greedy choice property: there exists an optimal solution that contains the greedy choice made at the first step. In other words, committing to the locally best option never rules out an optimum.
- Optimal substructure: after making that choice, what remains is a smaller instance of the same problem, and an optimal solution to the whole problem consists of the greedy choice plus an optimal solution to the remainder

When both hold, repeating the greedy step on the remaining problem builds an optimal solution, step by step, without backtracking.

Typical shape of a greedy algorithm:

- Define a selection rule: what counts as best (smallest, largest, earliest, highest ratio)
- Often sort the candidates by that rule first, which is why many greedy algorithms cost O(n log n)
- Repeatedly pick the best candidate that is still feasible (does not violate a constraint) and discard what is no longer possible
- Stop when no candidates remain or the goal is reached

Examples where the property holds:

- Making change with coins of 25, 10, 5 and 1: always taking the largest coin that fits gives the fewest coins. For 63 it chooses 25, 25, 10, 1, 1, 1 (six coins), and a brute-force comparison over the amounts 0 to 99 confirms that it is optimal for every amount with this coin system.
- Activity selection: choosing the activity that finishes earliest leaves the most room for the rest
- Fractional knapsack: taking items with the highest value per unit weight first
- Huffman coding: merging the two least frequent symbols
- Minimum spanning trees (Kruskal's and Prim's) and shortest paths with non-negative weights (Dijkstra's)

Examples where it fails: change with coins 1, 3 and 4 for the amount 6 (greedy takes 4 + 1 + 1 for three coins, but 3 + 3 uses two), and the 0/1 knapsack, where taking the best ratio first can waste capacity. In those problems local optimality does not imply global optimality, and dynamic programming is needed.

How to tell whether a greedy choice is safe: look for an exchange argument (take any optimal solution and show that swapping its first choice for the greedy one does not make it worse) or a stays-ahead argument (show that after every step the greedy solution is at least as good as any other). The next lesson develops both.

Checking by testing: for small inputs compare the greedy result with brute force or dynamic programming on many random cases. A single mismatch disproves the greedy rule; agreement on many cases is evidence, not proof.

Benefits when it works: simplicity, speed and low memory. Risks: plausible rules that are subtly wrong, and rules that depend on the input structure (like the coin system), so a change in the data can invalidate an algorithm that was correct before.

## explain
1. State the objective and the constraints of the problem.
2. Propose a selection rule that picks one item at a time.
3. Test the rule on small examples, including adversarial ones, and against brute force.
4. Prove the greedy choice property with an exchange or stays-ahead argument.
5. Check that the remaining problem has the same form (optimal substructure).
6. Implement with sorting or a priority queue and analyse the cost.

## example
The Python function `greedy_change` gives for 63 cents the coins 25 twice, 10 once and 1 three times, with nothing left over. A loop over every amount from 0 to 99 compares the greedy coin count with the minimum from dynamic programming for the system 1, 5, 10 and 25 and finds that they always agree, so the property holds for that system. The JavaScript function shows the same coin counts as an array.

## real
Operating systems schedule jobs greedily, network routers use greedy shortest-path algorithms, and compression formats rely on Huffman coding. In each case the greedy choice property is what guarantees that the simple rule gives the optimum.

## pros
- Simple, fast algorithms when the property holds
- Often need only sorting or a heap
- No backtracking or large tables

## cons
- The property fails for many problems that look similar
- A wrong rule can look right on small examples
- Correctness needs a proof, not just tests

## uses
- Deciding whether a greedy approach is safe for a problem
- Designing algorithms for scheduling, spanning trees and compression
- Comparing greedy solutions with dynamic programming
- Explaining why some coin systems are canonical

## mistakes
- Assuming that a locally best choice is globally best without a proof
- Testing a greedy rule only on friendly examples
- Forgetting that the data, such as the coin denominations, can break the property
- Confusing optimal substructure with the greedy choice property

## interview
**Q:** What is the greedy choice property?
**A:** The property that some optimal solution includes the locally best choice made at the first step, so the problem can be reduced to a smaller instance after committing to that choice.

**Q:** What two properties must a problem have for a greedy algorithm to be correct?
**A:** The greedy choice property and optimal substructure: the greedy choice is part of an optimal solution, and the rest of the optimum is an optimal solution of the remaining subproblem.

**Q:** How can you quickly check a suspected greedy rule?
**A:** Compare it against a brute-force or dynamic programming solution on many small random inputs and look for a counterexample; a counterexample disproves the rule, while agreement still needs a proof.

## summary
Greedy algorithms are correct exactly when the locally best choice can always be extended to an optimum and the remainder is a smaller instance of the same problem. Test rules against brute force and prove them with an exchange or stays-ahead argument.

## codenote
The Python sample implements greedy change and checks it against dynamic programming for all amounts below 100. The JavaScript sample prints coin counts.

## code
### python
```python
def greedy_change(amount, coins):
    used = {}
    for coin in sorted(coins, reverse=True):
        count, amount = divmod(amount, coin)
        if count:
            used[coin] = count
    return used, amount

print(greedy_change(63, [25, 10, 5, 1]))

def min_coins(limit, coins):
    best = [0] + [10 ** 9] * limit
    for amount in range(1, limit + 1):
        for coin in coins:
            if coin <= amount:
                best[amount] = min(best[amount], best[amount - coin] + 1)
    return best

def greedy_count(amount, coins):
    total = 0
    for coin in sorted(coins, reverse=True):
        count, amount = divmod(amount, coin)
        total += count
    return total

system = [1, 5, 10, 25]
optimal = min_coins(99, system)
print(all(greedy_count(a, system) == optimal[a] for a in range(100)))
```
Output:
```text
({25: 2, 10: 1, 1: 3}, 0)
True
```
### javascript
```javascript
const coins = [25, 10, 5, 1];
let remaining = 63;
const counts = coins.map((coin) => {
  const count = Math.floor(remaining / coin);
  remaining %= coin;
  return count;
});
console.log(counts.join(" "), remaining);
```
Output:
```text
2 1 0 3 0
```

## quiz
1. What does the greedy choice property say?
   - [ ] Every choice is optimal
   - [x] Some optimal solution contains the locally best first choice
   - [ ] The problem has no constraints
   - [ ] The best choice is always the smallest
   > Committing to the greedy choice never rules out an optimum.
2. Why are many greedy algorithms O(n log n)?
   - [ ] They use recursion
   - [x] They sort the candidates by the selection rule first
   - [ ] They store a table
   - [ ] They use hashing
   > The sort dominates the linear selection pass.
3. For which coin system does greedy change fail?
   - [ ] 1, 5, 10, 25
   - [x] 1, 3, 4 for the amount 6
   - [ ] 1, 2, 5 for the amount 10
   - [ ] 1, 10 for the amount 30
   > Greedy takes three coins while two suffice.
4. How can a suspected greedy rule be disproved?
   - [ ] By running it once
   - [x] By finding one input where it differs from the optimum
   - [ ] By measuring its speed
   - [ ] By sorting its input
   > A single counterexample is enough.

# Proving Greedy Correctness
kind: concept
time: Not an algorithmic topic — a proof technique does not have a running time. The associated algorithms typically cost O(n log n) because of sorting.
space: Not an algorithmic topic — the lesson concerns reasoning about correctness.

## intro
A greedy algorithm that looks right is not enough. History is full of plausible rules that fail on a clever input. Two standard proof techniques, the exchange argument and the stays-ahead argument, show that a greedy rule is correct, and a testing habit with brute force catches most wrong rules before you waste time on a proof.

## theory
Exchange argument. Take any optimal solution O. Show that you can transform it, step by step, into the greedy solution G without making it worse. Typical outline:

- Let the greedy algorithm's first choice be g, and suppose O does not contain g
- Find an element o in O that conflicts with g or that can be replaced by it
- Replace o by g to obtain O′ and show that O′ is still feasible and no worse than O
- Conclude that there is an optimal solution containing g, and repeat on the remaining subproblem by induction

Example for activity selection (choose the maximum number of non-overlapping activities by always picking the one that finishes first): let g be the activity with the earliest finish time. Take an optimal solution O whose first activity is o. Because g finishes no later than o, replacing o by g keeps all later activities compatible and leaves the count unchanged. So some optimal solution starts with g, and the rest of the problem is the same kind of problem on the activities starting after g ends.

Stays-ahead argument. Show that after each step the greedy solution is at least as good as the corresponding step of any other solution, by induction on the step number. For activity selection: the k-th activity chosen by greedy finishes no later than the k-th activity of any other feasible schedule, hence greedy can fit at least as many activities.

Other proof tools:

- Contradiction: assume a better solution exists and derive a conflict with the greedy choice
- Structural arguments, such as the cut property for minimum spanning trees: the lightest edge crossing any cut belongs to some minimum spanning tree
- Matroid theory: problems on independence systems with the exchange property are exactly those solvable by the greedy algorithm, which explains spanning trees and many scheduling problems
- Potential functions and invariants for dynamic situations

Finding counterexamples is as important as proving. A wrong rule for activity selection is choosing the activity that starts earliest: on `(0, 10)`, `(1, 2)` and `(3, 4)` it picks the long activity and ends with one activity, while the earliest-finish rule picks two. Other tempting but wrong rules include shortest duration first and fewest conflicts first (the latter can also fail).

Practical testing for greedy rules:

- Write a slow exhaustive solver for small inputs (all subsets or permutations)
- Generate many random small inputs with a fixed seed
- Compare the greedy result with the optimum on each
- When they differ, print the instance, which often reveals why the rule is wrong

The Python test below does exactly that for activity selection: 200 random instances of up to 8 activities all agree with the brute-force optimum.

Common mistakes in proofs: assuming the exchange keeps feasibility without checking, forgetting ties in the greedy rule, and proving only that greedy is not worse for one step without induction.

## explain
1. State the greedy rule precisely, including how ties are broken.
2. Compare it with brute force on many small random inputs to look for counterexamples.
3. Choose a proof method: exchange argument for choices, stays-ahead for sequences, cut or matroid arguments for graphs.
4. Write the induction: the base case, the exchange or comparison, and the reduction to a smaller instance.
5. Check feasibility after the exchange.
6. Record the proof next to the code as a comment so that changes to the rule are reviewed.

## example
The Python program compares the earliest-finish rule with an exhaustive search over all subsets for 200 random sets of up to eight activities, and every comparison agrees, which prints True. The JavaScript program applies the wrong rule, earliest start, to the activities `(0, 10)`, `(1, 2)` and `(3, 4)` and obtains one activity, while the earliest-finish rule obtains two.

## real
Competitive programmers and algorithm engineers write brute-force checkers for every greedy solution, and textbooks prove classical algorithms such as Kruskal's and Huffman's with these arguments.

## pros
- Gives confidence that a greedy rule is truly optimal
- The arguments transfer to many problems
- Brute-force tests find wrong rules quickly

## cons
- Proofs take effort and can be subtle
- Passing tests does not prove correctness
- Matroid arguments require more theory

## uses
- Proving the correctness of scheduling and spanning tree algorithms
- Finding counterexamples to tempting greedy rules
- Justifying design choices in code reviews
- Teaching algorithm analysis

## mistakes
- Proving the first step only and skipping the induction
- Ignoring ties in the greedy rule
- Replacing an element without checking that the result is still feasible
- Trusting a few passing examples as proof

## interview
**Q:** What is an exchange argument?
**A:** A proof that takes any optimal solution and swaps one of its elements for the greedy choice, showing the new solution is still feasible and not worse, so some optimal solution contains the greedy choice; induction then handles the rest.

**Q:** How do you prove that earliest finish time is correct for activity selection?
**A:** The activity that finishes first can replace the first activity of any optimal schedule without causing conflicts, since it finishes no later; this leaves an optimal schedule that starts with it, and the argument repeats on the remaining activities.

**Q:** What is a practical way to test a greedy algorithm?
**A:** Write a brute-force solver, run both on many small random inputs and compare; any difference is a counterexample that disproves the greedy rule.

## summary
Prove a greedy rule with an exchange or stays-ahead argument, and hunt for counterexamples with brute-force comparisons on random small inputs. Plausible rules such as earliest start fail where earliest finish succeeds.

## codenote
The Python sample compares greedy selection with brute force on random cases. The JavaScript sample shows a counterexample for a wrong rule.

## code
### python
```python
import random

def earliest_finish(activities):
    chosen, last_end = [], -1
    for start, end in sorted(activities, key=lambda a: a[1]):
        if start >= last_end:
            chosen.append((start, end))
            last_end = end
    return chosen

def brute_force(activities):
    best = 0
    for mask in range(1 << len(activities)):
        subset = sorted(a for i, a in enumerate(activities) if mask >> i & 1)
        if all(subset[i][1] <= subset[i + 1][0] for i in range(len(subset) - 1)):
            best = max(best, len(subset))
    return best

rng = random.Random(4)
agree = True
for _ in range(200):
    activities = []
    for _ in range(rng.randint(0, 8)):
        start = rng.randint(0, 10)
        activities.append((start, start + rng.randint(1, 5)))
    agree = agree and len(earliest_finish(activities)) == brute_force(activities)
print(agree)
```
Output:
```text
True
```
### javascript
```javascript
function pick(activities, rule) {
  const sorted = [...activities].sort(rule);
  let lastEnd = -1;
  let count = 0;
  for (const [start, end] of sorted) {
    if (start >= lastEnd) {
      count++;
      lastEnd = end;
    }
  }
  return count;
}

const activities = [[0, 10], [1, 2], [3, 4]];
console.log(pick(activities, (a, b) => a[0] - b[0]), pick(activities, (a, b) => a[1] - b[1]));
```
Output:
```text
1 2
```

## quiz
1. What does an exchange argument show?
   - [ ] That the greedy algorithm is fast
   - [x] That swapping an optimal solution's element for the greedy choice keeps it optimal
   - [ ] That the input is sorted
   - [ ] That the problem has no solution
   > Some optimal solution therefore contains the greedy choice.
2. What does the stays-ahead argument compare?
   - [ ] Running times
   - [x] The greedy solution with any other solution after each step
   - [ ] Two sorted arrays
   - [ ] Input sizes
   > Greedy is shown to be at least as good at every step.
3. Why does choosing the earliest start fail for activity selection?
   - [ ] It is slower
   - [x] A long early activity can block many short ones
   - [ ] It needs sorting
   - [ ] It ignores finishes entirely
   > The intervals (0, 10), (1, 2), (3, 4) are a counterexample.
4. What does agreement with brute force on random tests prove?
   - [ ] Correctness
   - [x] Only that no counterexample was found among the tested cases
   - [ ] Optimal speed
   - [ ] Stability
   > Testing supports a proof but does not replace it.

# Activity Selection
kind: algorithm
time: O(n log n) for sorting the n activities by finish time plus O(n) for the selection scan; O(n) if the activities are already sorted.
space: O(1) extra besides the output list, or O(n) for the sorted copy.
viz: greedy-activity

## intro
You have one room (or one machine, or one person) and a list of activities, each with a start and a finish time. Which activities should you accept to fit in as many as possible without any two overlapping? The greedy answer, repeatedly choosing the activity that finishes earliest among those compatible with what you have, is optimal and takes only a sort and a single scan.

## theory
Problem: given n activities `(s_i, f_i)` with `s_i < f_i`, choose a maximum-size subset of pairwise compatible activities, where two activities are compatible if one finishes no later than the other starts (touching at an endpoint is allowed).

Algorithm:

- Sort the activities by finish time
- Select the first activity and remember its finish time
- For each next activity in order, select it if its start is at least the last selected finish time, and update the last finish

Correctness (exchange argument): the earliest-finishing activity can be exchanged into any optimal solution as its first activity without conflicts, because it finishes no later than the one it replaces; so an optimal solution starts with it. Removing it and all activities that overlap it leaves the same kind of problem. By induction the algorithm builds an optimum.

Example: activities `(1,4)`, `(3,5)`, `(0,6)`, `(5,7)`, `(3,9)`, `(5,9)`, `(6,10)`, `(8,11)`, `(8,12)`, `(2,14)`, `(12,16)`. Sorted by finish time, the algorithm selects `(1,4)`, then `(5,7)`, then `(8,11)`, then `(12,16)`: four activities, which is the maximum.

Complexity: sorting dominates, O(n log n); the scan is O(n). If activities arrive already sorted by finish time, the algorithm is linear.

Variations and what changes:

- Ties: if two activities finish at the same time, either may be chosen first; sorting by start as a secondary key is harmless
- Selecting the activity with the earliest start (wrong), the shortest duration (wrong) or the fewest conflicts (wrong in general) are all tempting rules that fail
- Weighted activities (each has a value): greedy fails; dynamic programming with binary search finds the best total value in O(n log n)
- Several rooms: the minimum number of rooms needed or the maximum number of activities with k rooms use a heap of finish times
- Printing the schedule rather than the count: keep the selected activities
- Intervals with half-open versus closed endpoints: decide whether touching intervals are compatible and use the matching comparison, `>=` or `>`
- Online versions, where activities arrive over time, need competitive analysis rather than this algorithm

Related problems: erasing the fewest intervals so that the rest do not overlap is the same problem (the answer is the number of intervals minus the selected count), and bursting balloons with the fewest arrows is solved with the same sort by end and a greedy scan.

Pitfalls: sorting by start instead of finish, using `>` instead of `>=` when touching is allowed, and forgetting that the problem is about counts, not about total time used.

## explain
1. Sort the activities by finish time.
2. Initialise the last finish time to a value earlier than any start.
3. For each activity in order, if its start is at least the last finish, select it and update the last finish.
4. Return the selected list or its size.
5. Decide how ties and touching endpoints are treated.
6. Test empty input, identical intervals, nested intervals and a chain of touching intervals.

## example
The Python function applied to the eleven activities above returns `[(1, 4), (5, 7), (8, 11), (12, 16)]`. The JavaScript function selects from `[[1, 2], [3, 4], [0, 6], [5, 7], [8, 9], [5, 9]]` the activities 1-2, 3-4, 5-7 and 8-9, skipping those that overlap an earlier choice.

## real
Booking systems accept as many reservations as possible for a single resource, schedulers pack jobs onto a machine, and conference organisers fit talks into a room.

## pros
- Optimal and very simple
- O(n log n), dominated by the sort
- Easy to adapt to related interval problems

## cons
- Only maximises the number of activities, not total time or value
- Fails for weighted activities
- Depends on choosing the right sort key

## uses
- Maximising the number of accepted bookings for one resource
- Counting the minimum intervals to erase
- Fitting talks or jobs into a single room or machine
- Teaching exchange arguments

## mistakes
- Sorting by start time or duration
- Comparing with a strict inequality when touching intervals are allowed
- Using it when the activities carry weights
- Forgetting to update the last finish after a selection

## interview
**Q:** How do you choose the maximum number of non-overlapping activities?
**A:** Sort by finish time, then scan and take each activity whose start is at least the finish time of the last chosen one. This greedy rule is optimal and takes O(n log n) time.

**Q:** Why is earliest finish time the right criterion?
**A:** It leaves the largest possible amount of time for the remaining activities, and an exchange argument shows that any optimal schedule can start with it.

**Q:** What changes if activities have weights?
**A:** The greedy rule no longer works; use dynamic programming over activities sorted by finish time, with a binary search for the latest compatible predecessor.

## summary
Sort activities by finish time and take each one that starts after the last chosen finish. This earliest-finish greedy rule is optimal for maximising the count, with O(n log n) cost.

## codenote
The Python sample selects from a classic list of activities. The JavaScript sample selects from another list.

## code
### python
```python
def select_activities(activities):
    chosen, last_end = [], -1
    for start, end in sorted(activities, key=lambda activity: activity[1]):
        if start >= last_end:
            chosen.append((start, end))
            last_end = end
    return chosen

activities = [(1, 4), (3, 5), (0, 6), (5, 7), (3, 9), (5, 9), (6, 10), (8, 11), (8, 12), (2, 14), (12, 16)]
print(select_activities(activities))
```
Output:
```text
[(1, 4), (5, 7), (8, 11), (12, 16)]
```
### javascript
```javascript
function select(activities) {
  const chosen = [];
  let lastEnd = -1;
  for (const [start, end] of [...activities].sort((a, b) => a[1] - b[1])) {
    if (start >= lastEnd) {
      chosen.push(start + "-" + end);
      lastEnd = end;
    }
  }
  return chosen;
}

console.log(select([[1, 2], [3, 4], [0, 6], [5, 7], [8, 9], [5, 9]]).join(" "));
```
Output:
```text
1-2 3-4 5-7 8-9
```

## quiz
1. By what key should activities be sorted?
   - [ ] Start time
   - [x] Finish time
   - [ ] Duration
   - [ ] Name
   > Finishing early leaves the most room for later activities.
2. When is an activity compatible with the last chosen one?
   - [ ] When it starts before the last finish
   - [x] When it starts at or after the last finish
   - [ ] When it is shorter
   - [ ] When it has the same start
   > Touching endpoints are allowed.
3. What is the time complexity?
   - [ ] O(n)
   - [x] O(n log n)
   - [ ] O(n squared)
   - [ ] O(2 to the n)
   > Sorting dominates.
4. What happens with weighted activities?
   - [ ] Greedy still works
   - [x] The greedy rule fails and dynamic programming is needed
   - [ ] Sorting is unnecessary
   - [ ] Every activity is chosen
   > Maximising the total weight is a different problem.

# Interval Scheduling
kind: algorithm
time: O(n log n) for sorting n intervals plus a linear scan, whichever variant is used; the minimum rooms problem adds heap operations of O(log n) per interval.
space: O(1) to O(n) depending on the variant, the room-counting solution needs a heap or sorted arrays of size n.

## intro
Interval problems come in many flavours: choose the most non-overlapping ones, remove as few as needed to avoid overlap, merge overlapping ones, find the minimum number of rooms. They share one toolkit, sort the intervals and sweep through them, but the right sort key differs, and picking it is the entire difficulty.

## theory
Which key for which question:

- Maximum number of non-overlapping intervals, or minimum number to erase so that the rest do not overlap: sort by end time and take an interval whenever it starts at or after the last chosen end. The minimum to erase is the total count minus the number chosen. For `[[1, 2], [2, 3], [3, 4], [1, 3]]` the answer is 1 (erase `[1, 3]`).
- Minimum arrows to burst balloons (intervals on a line, one arrow bursts every balloon it passes through): sort by end, shoot at the end of the first balloon, skip all balloons that start at or before that point, then repeat. For `[[10, 16], [2, 8], [1, 6], [7, 12]]` two arrows suffice.
- Merging overlapping intervals: sort by start time and extend the current interval while the next one starts before or at its end
- Minimum number of rooms (or platforms, or machines) needed so that all intervals can be scheduled: sort the starts and the ends separately, sweep with two pointers and count how many intervals are active, or keep a min-heap of end times for the rooms in use. The answer is the maximum overlap. For meetings `[[0, 30], [5, 10], [15, 20]]` two rooms are needed, and for `[[7, 10], [2, 4]]` only one.
- Can a person attend all meetings: sort by start and check that each starts at or after the previous one ends
- Interval partitioning (colouring): the same as minimum rooms; the greedy rule of assigning each interval, in order of start time, to any free room is optimal and uses exactly as many rooms as the maximum overlap (the depth)
- Maximum weight non-overlapping intervals: greedy fails; use dynamic programming (see the comparison lessons)
- Inserting an interval into a sorted list of disjoint intervals: a linear pass that copies the intervals before, merges those that overlap and copies the rest

Two sweeps for rooms:

- Sorted starts and ends with two pointers: the pointer on starts advances when the next start is before the earliest remaining end (a room is added); otherwise an interval ends and a room is freed; the maximum of the running count is the answer
- Heap of ends: for each interval in start order, pop from the heap every room whose end is at or before this start, push this interval's end, and track the heap size

Edge conventions: decide whether an interval that starts exactly when another ends is compatible (usually yes); use `<=` and `>=` consistently.

Relation to graphs: intervals form an interval graph, and the minimum number of rooms equals the chromatic number, which equals the size of the largest clique (the maximum overlap), a property of interval graphs.

Complexities: all are O(n log n); sweeps are linear after sorting.

## explain
1. Identify the question: how many fit, how many to remove, how many rooms, merge, attendance.
2. Choose the sort key that makes a single sweep work: end time for choosing, start time for merging and attendance.
3. Sweep, keeping the last chosen end, the current merged interval or the count of active intervals.
4. For rooms, use the two-pointer method on sorted starts and ends or a heap of end times.
5. Make the endpoint rule explicit: touching intervals allowed or not.
6. Test empty input, identical intervals, nested intervals and chains.

## example
The Python functions return 1 for the number of intervals to erase in `[[1, 2], [2, 3], [3, 4], [1, 3]]` and 2 arrows for the balloons `[[10, 16], [2, 8], [1, 6], [7, 12]]`. The JavaScript room counter sorts starts and ends and finds that the meetings `[[0, 30], [5, 10], [15, 20]]` need 2 rooms, while `[[7, 10], [2, 4]]` needs 1.

## real
Calendar software, airline gate assignment, operating system schedulers and hospital bed planning solve interval scheduling constantly, often with these sweeps.

## pros
- One sorting idea answers many questions
- O(n log n) with simple code
- Optimal for the count-based variants

## cons
- Choosing the wrong sort key gives wrong answers
- Weighted versions need dynamic programming
- Endpoint conventions are easy to get inconsistent

## uses
- Maximum number of non-overlapping meetings
- Fewest intervals to remove
- Minimum number of rooms or platforms
- Fewest arrows to cover balloons

## mistakes
- Sorting by start for the selection problem
- Treating touching intervals inconsistently across the solution
- Forgetting to free a room before comparing the next start
- Using greedy for intervals with weights

## interview
**Q:** How do you find the minimum number of meeting rooms?
**A:** Sort the start times and end times separately and sweep: a new meeting starting before the earliest end needs another room, otherwise an ended meeting frees a room; the maximum number in use is the answer. A min-heap of end times gives the same result.

**Q:** How do you compute the fewest intervals to remove so that the rest do not overlap?
**A:** Keep the maximum number of non-overlapping intervals by sorting by end time and choosing greedily, then subtract that from the total.

**Q:** Why does the minimum number of rooms equal the maximum overlap?
**A:** At the busiest moment that many meetings are active, so at least that many rooms are needed, and the greedy assignment by start time never needs more.

## summary
Interval problems use sorting plus one sweep: sort by end to choose or erase, by start to merge, and use sorted starts and ends or a heap for rooms. State the endpoint rule and test nested and touching cases.

## codenote
The Python sample computes erasures and arrows. The JavaScript sample counts rooms.

## code
### python
```python
def intervals_to_erase(intervals):
    kept, last_end = 0, float("-inf")
    for start, end in sorted(intervals, key=lambda interval: interval[1]):
        if start >= last_end:
            kept += 1
            last_end = end
    return len(intervals) - kept

def arrows_needed(balloons):
    arrows, last_end = 0, float("-inf")
    for start, end in sorted(balloons, key=lambda balloon: balloon[1]):
        if start > last_end:
            arrows += 1
            last_end = end
    return arrows

print(intervals_to_erase([[1, 2], [2, 3], [3, 4], [1, 3]]))
print(arrows_needed([[10, 16], [2, 8], [1, 6], [7, 12]]))
```
Output:
```text
1
2
```
### javascript
```javascript
function roomsNeeded(meetings) {
  const starts = meetings.map((m) => m[0]).sort((a, b) => a - b);
  const ends = meetings.map((m) => m[1]).sort((a, b) => a - b);
  let rooms = 0;
  let best = 0;
  let end = 0;
  for (const start of starts) {
    if (start < ends[end]) {
      rooms++;
    } else {
      end++;
    }
    best = Math.max(best, rooms);
  }
  return best;
}

console.log(roomsNeeded([[0, 30], [5, 10], [15, 20]]), roomsNeeded([[7, 10], [2, 4]]));
```
Output:
```text
2 1
```

## quiz
1. By what key do you sort intervals to find the maximum number of non-overlapping ones?
   - [ ] Start time
   - [x] End time
   - [ ] Length
   - [ ] Weight
   > Finishing earlier leaves more room.
2. How many rooms are needed for a set of meetings?
   - [ ] The number of meetings
   - [x] The maximum number of meetings overlapping at one time
   - [ ] The average overlap
   - [ ] Always one
   > Each simultaneous meeting needs its own room.
3. How do you compute the intervals to erase?
   - [ ] Count the overlaps
   - [x] Total intervals minus the maximum number of non-overlapping ones
   - [ ] Sort by start and delete the first
   - [ ] Remove the longest
   > Keeping the maximum set means erasing the rest.
4. What sort key is used for merging overlapping intervals?
   - [ ] End time
   - [x] Start time
   - [ ] Duration
   - [ ] Random
   > Overlapping intervals are then adjacent in sorted order.

# Huffman Coding Overview
kind: algorithm
time: O(n log n) to build the code for n distinct symbols, since the algorithm performs n − 1 merges and each heap operation costs O(log n).
space: O(n) for the heap and the tree, which has 2n − 1 nodes.

## intro
Huffman coding compresses data by giving short bit strings to frequent symbols and long ones to rare symbols. The tree that defines the codes is built greedily: repeatedly merge the two least frequent items. The result is an optimal prefix code, a way to encode symbols with variable lengths so that no code is the beginning of another and the total encoded size is the smallest possible.

## theory
Prefix codes: if no codeword is a prefix of another, a concatenated bit string can be decoded without separators by walking down a binary tree from the root: 0 goes left, 1 goes right, and reaching a leaf outputs a symbol and restarts at the root.

Cost of a code: with symbol frequencies `f_i` and code lengths `l_i`, the encoded size is `sum(f_i · l_i)` bits. Huffman's algorithm minimises this among all prefix codes.

Algorithm:

- Count the frequency of each symbol
- Create a leaf node for each symbol and put all nodes in a min-heap ordered by frequency
- While more than one node remains: remove the two nodes with the smallest frequencies, create a parent whose frequency is their sum with them as children, and insert the parent
- The last node is the root; read codes off the tree by following left edges as 0 and right edges as 1

Why the greedy choice is correct: in an optimal tree the two rarest symbols can be placed as siblings at the greatest depth (exchange argument: if a rarer symbol were shallower than a more frequent one, swapping them would reduce the cost). Merging them into one pseudo-symbol with their combined frequency reduces the problem to n − 1 symbols, and the same reasoning applies recursively.

Example: the text `abracadabra` has frequencies a 5, b 2, r 2, c 1, d 1. One resulting code assigns `a` the code `0`, `c` `100`, `d` `101`, `b` `110` and `r` `111`. The encoded size is 5·1 + 2·3 + 2·3 + 1·3 + 1·3 = 23 bits, against 88 bits for 11 characters at 8 bits each. Different tie-breaking produces different trees with the same total cost.

Total cost shortcut: the encoded size equals the sum of the weights of all internal nodes created during merging. For frequencies 5, 2, 2, 1, 1 the merges create nodes of weight 2, 4, 6 and 11, summing to 23.

Properties and practical points:

- The code lengths are not unique, but the total is optimal
- Symbols with equal frequencies may swap codes
- A single distinct symbol still needs one bit (or special handling) in practice
- The decoder needs the tree or the code lengths; canonical Huffman codes transmit only the lengths and rebuild codes in a standard order, which saves header space
- Entropy bound: the average code length is within one bit of the Shannon entropy of the source; arithmetic coding and range coders can approach the entropy more closely by encoding fractional bits
- Adaptive Huffman coding updates the tree as symbols arrive, so no first pass for frequencies is needed
- Huffman coding is the entropy stage of DEFLATE (used in gzip and PNG) and JPEG

Complexity: with a heap, O(n log n); with already sorted frequencies and two queues, O(n).

Limits: it codes each symbol independently, so it cannot exploit repeated phrases (dictionary methods like LZ77 do) and has an integer-bit overhead for very skewed distributions.

## explain
1. Count how often each symbol occurs.
2. Put each symbol in a min-heap as a leaf with its frequency.
3. Repeatedly pop the two smallest nodes, merge them under a new parent whose frequency is the sum and push it back.
4. When one node remains, traverse the tree to assign codes, 0 for left and 1 for right.
5. Encode by replacing each symbol with its code, and store enough information for the decoder.
6. Check that no code is a prefix of another and compute the total size.

## example
The Python implementation builds the code for `abracadabra` with a heap and a tie-breaking counter. It assigns a one-bit code to `a` and three-bit codes to the other four symbols, for a total of 23 bits instead of 88. The JavaScript function computes only the cost of the optimal code for frequencies 5, 2, 2, 1 and 1 by summing the weights of the merged nodes, which is 23.

## real
File compressors such as gzip, image formats such as PNG and JPEG, and many network protocols use Huffman coding as part of their pipelines.

## pros
- Produces an optimal prefix code
- Simple greedy algorithm with a heap
- Fast to encode and decode

## cons
- Codes whole symbols, so repeated phrases are not exploited
- Needs frequency information or an adaptive variant
- Integer code lengths lose efficiency for very skewed distributions

## uses
- Lossless compression of text and images
- The entropy coding stage of DEFLATE and JPEG
- Teaching greedy algorithms and priority queues
- Building compact encodings for known symbol frequencies

## mistakes
- Forgetting to store the code table so the data cannot be decoded
- Expecting a unique tree when frequencies tie
- Using a sorted list instead of a heap and paying quadratic cost
- Assuming it compresses data with uniform frequencies

## interview
**Q:** How does Huffman's algorithm build an optimal prefix code?
**A:** It repeatedly merges the two least frequent nodes into a new node with the combined frequency, using a min-heap, until one tree remains; codes are read from the paths from the root to the leaves.

**Q:** Why is the greedy merge optimal?
**A:** In an optimal tree the two rarest symbols can be siblings at the deepest level, and merging them reduces the problem to one with a symbol fewer, so induction gives optimality.

**Q:** What is the time complexity of building the code?
**A:** O(n log n) for n symbols, from n minus one heap merges with logarithmic cost each.

## summary
Huffman coding repeatedly merges the two least frequent items with a min-heap, producing an optimal prefix code in O(n log n). Frequent symbols receive short codes, and the cost equals the sum of the internal node weights.

## codenote
The Python sample builds the code for a word and totals the bits. The JavaScript sample computes the optimal cost by summing merged weights.

## code
### python
```python
import heapq
import itertools
from collections import Counter

def huffman_codes(text):
    freq = Counter(text)
    order = itertools.count()
    heap = [(count, next(order), symbol) for symbol, count in freq.items()]
    heapq.heapify(heap)
    while len(heap) > 1:
        left_count, _, left = heapq.heappop(heap)
        right_count, _, right = heapq.heappop(heap)
        heapq.heappush(heap, (left_count + right_count, next(order), (left, right)))

    codes = {}

    def walk(node, prefix):
        if isinstance(node, str):
            codes[node] = prefix or "0"
        else:
            walk(node[0], prefix + "0")
            walk(node[1], prefix + "1")

    walk(heap[0][2], "")
    return codes, freq

codes, freq = huffman_codes("abracadabra")
print(sorted(codes.items()))
print(sum(freq[s] * len(codes[s]) for s in freq), len("abracadabra") * 8)
```
Output:
```text
[('a', '0'), ('b', '110'), ('c', '100'), ('d', '101'), ('r', '111')]
23 88
```
### javascript
```javascript
function huffmanCost(frequencies) {
  const nodes = [...frequencies].sort((a, b) => a - b);
  let cost = 0;
  while (nodes.length > 1) {
    const merged = nodes.shift() + nodes.shift();
    cost += merged;
    nodes.push(merged);
    nodes.sort((a, b) => a - b);
  }
  return cost;
}

console.log(huffmanCost([5, 2, 2, 1, 1]));
```
Output:
```text
23
```

## quiz
1. Which two nodes does Huffman's algorithm merge at each step?
   - [ ] The two most frequent
   - [x] The two least frequent
   - [ ] The first two in the input
   - [ ] Two random nodes
   > Rare symbols end up deepest in the tree.
2. What property do Huffman codes have?
   - [ ] All codes have equal length
   - [x] No code is a prefix of another
   - [ ] Codes are sorted alphabetically
   - [ ] Codes use three bits each
   > That allows unambiguous decoding.
3. What data structure makes building the tree O(n log n)?
   - [ ] A stack
   - [x] A min-heap
   - [ ] A hash table
   - [ ] A queue of characters
   > It supplies the two smallest nodes quickly.
4. What does the encoded size of a Huffman code equal?
   - [ ] The number of symbols
   - [x] The sum over symbols of frequency times code length
   - [ ] The alphabet size
   - [ ] The tree height
   > It is the number of bits in the encoded text.

# Fractional Knapsack
kind: algorithm
time: O(n log n) to sort the items by value per unit weight, then O(n) to fill the knapsack; O(n) with a selection algorithm instead of a full sort.
space: O(1) extra besides the sorted copy of the items.

## intro
You can carry a limited weight and must choose among items that have a value and a weight. If you may take part of an item, as with grains, liquids or gold dust, the best strategy is easy and greedy: take the items with the highest value per kilogram first, and fill the last slot with a fraction of the next best item. This is the classic case where greedy is provably optimal, in contrast to the 0/1 version where items cannot be split.

## theory
Problem: n items with values `v_i` and weights `w_i`, a capacity W. Choose amounts `x_i` between 0 and 1 of each item, with `sum(x_i · w_i) <= W`, to maximise `sum(x_i · v_i)`.

Greedy algorithm:

- Compute the ratio `v_i / w_i` for each item
- Sort the items by ratio, highest first
- Take items completely in that order while they fit
- When the next item does not fit, take the fraction that fills the remaining capacity and stop

Example: items `(value, weight)` = (60, 10), (100, 20), (120, 30) with capacity 50. The ratios are 6, 5 and 4. Take the first two completely (weight 30, value 160), then 20/30 of the third for value 80: total 240.

Why it is optimal (exchange argument): suppose an optimal solution uses less of a higher-ratio item while using some of a lower-ratio item. Shifting a small amount of weight from the lower-ratio item to the higher-ratio item keeps the weight the same and increases the value, a contradiction. So an optimal solution fills items in ratio order, which is exactly the greedy solution. The fractional version has the greedy choice property because capacity can be traded perfectly between items.

Why it fails for 0/1 knapsack: with the same items but no splitting, the greedy rule takes (60, 10) and (100, 20) for value 160 and leaves 20 units unused, while the best selection is (100, 20) and (120, 30) for 220. The unusable leftover capacity is the problem, and dynamic programming is required for the 0/1 version (the next lessons cover it).

Implementation notes:

- Use floating-point values for fractions and compare ratios carefully, or compare cross-products `v1 · w2` with `v2 · w1` to avoid division and rounding
- Handle zero weights separately (items with zero weight and positive value are taken for free)
- Stop as soon as the capacity is exhausted
- A linear-time version uses a weighted-median selection on ratios, a refinement of quickselect

Applications: blending ingredients to maximise nutrition under a weight limit, allocating a divisible resource such as bandwidth or budget across options with different returns, and it is the continuous relaxation used as an upper bound in branch and bound for 0/1 knapsack.

Related problems: maximising profit with deadlines (job sequencing), loading containers by value density and the continuous relaxation of integer programs.

## explain
1. Compute the value per unit weight for each item.
2. Sort the items by that ratio in decreasing order.
3. Add whole items while the remaining capacity allows.
4. For the first item that does not fit, add the fraction that fills the capacity.
5. Return the total value.
6. Test zero capacity, items heavier than the capacity and equal ratios.

## example
The Python function returns 240.0 for the items (60, 10), (100, 20), (120, 30) and capacity 50, and it can be compared with the 0/1 greedy value in the lesson on failures. The JavaScript function solves a larger classic instance with capacity 15 and obtains a value of 55.33, taking whole items with the highest ratios and part of the fifth.

## real
Resource allocation tools, portfolio planners for divisible assets and bandwidth schedulers use this rule, and branch-and-bound solvers use it to bound the 0/1 knapsack.

## pros
- Optimal and simple to implement
- O(n log n) time with one sort
- Serves as a bound for harder problems

## cons
- Only valid when items can be split
- Floating-point fractions need care
- Fails for the 0/1 version

## uses
- Allocating divisible resources by return per unit
- Blending materials under a weight limit
- Upper bounds in branch and bound
- Teaching the difference between greedy and dynamic programming

## mistakes
- Using the greedy rule for the 0/1 knapsack and expecting the optimum
- Sorting by value or by weight instead of by ratio
- Dividing by zero for zero-weight items
- Forgetting to stop when the capacity is exactly used

## interview
**Q:** How do you solve the fractional knapsack problem?
**A:** Sort items by value per unit weight in decreasing order and take them whole until the next one does not fit, then take the fraction of it that fills the remaining capacity.

**Q:** Why does greedy work for the fractional version but not for 0/1 knapsack?
**A:** With fractions, capacity can be exchanged between items perfectly, so any solution that favours a lower-ratio item can be improved by shifting weight to a higher-ratio item. Without splitting, leftover capacity may be wasted.

**Q:** What is the complexity of the algorithm?
**A:** O(n log n) for sorting by ratio, plus a linear pass to fill the knapsack.

## summary
Fractional knapsack takes items in order of value per unit weight and a fraction of the last one, optimally and in O(n log n). The 0/1 version needs dynamic programming.

## codenote
The Python sample computes the best value for a small instance. The JavaScript sample solves a larger instance.

## code
### python
```python
def fractional_knapsack(items, capacity):
    total = 0.0
    for value, weight in sorted(items, key=lambda item: item[0] / item[1], reverse=True):
        take = min(weight, capacity)
        total += value * take / weight
        capacity -= take
        if capacity == 0:
            break
    return total

print(fractional_knapsack([(60, 10), (100, 20), (120, 30)], 50))
```
Output:
```text
240.0
```
### javascript
```javascript
function fractional(items, capacity) {
  let total = 0;
  const ordered = [...items].sort((a, b) => b[0] / b[1] - a[0] / a[1]);
  for (const [value, weight] of ordered) {
    const take = Math.min(weight, capacity);
    total += (value * take) / weight;
    capacity -= take;
    if (capacity === 0) break;
  }
  return total;
}

const items = [[10, 2], [5, 3], [15, 5], [7, 7], [6, 1], [18, 4], [3, 1]];
console.log(fractional(items, 15).toFixed(2));
```
Output:
```text
55.33
```

## quiz
1. What is the greedy criterion for fractional knapsack?
   - [ ] Highest value
   - [ ] Lowest weight
   - [x] Highest value per unit weight
   - [ ] Largest weight
   > The ratio measures how well each unit of capacity is used.
2. What happens with the item that does not fit completely?
   - [ ] It is skipped
   - [x] A fraction of it fills the remaining capacity
   - [ ] The knapsack is emptied
   - [ ] The algorithm restarts
   > Splitting is allowed in this version.
3. What is the best value for the items (60,10), (100,20), (120,30) with capacity 50?
   - [ ] 160
   - [ ] 220
   - [x] 240
   - [ ] 280
   > Two whole items plus two thirds of the third.
4. Why does the greedy rule fail for the 0/1 version?
   - [ ] It is too slow
   - [x] Items cannot be split, so leftover capacity can be wasted
   - [ ] Ratios are undefined
   - [ ] Sorting is impossible
   > The best selection may skip a high-ratio item.
