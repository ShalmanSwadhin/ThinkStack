# Interview Problem Solving Framework
kind: concept
time: Not applicable — this is a working method, not an algorithm. Its payoff is that the complexity of the solution you choose is stated and justified within the first few minutes.
space: Not applicable — a framework has no memory footprint; the only space discussed is that of the solution you derive.

## intro
A coding interview lasts about forty-five minutes and the problem is usually new to you. What separates strong candidates is rarely raw speed; it is a repeatable framework for problem solving that turns an unfamiliar prompt into clarified requirements, a brute force baseline, an improved approach, clean code and tested edge cases, in that order.

## theory
The framework in seven steps, with rough time budgets for a 45-minute session:

- Understand (3–5 minutes): restate the problem in your own words, confirm input and output types, and ask about sizes, duplicates, negative values, empty input and whether the input is sorted. Walk through the given example by hand
- Examples (2–3 minutes): invent one small normal case, one edge case (empty, single element, all equal) and one tricky case, and write their expected answers. They become tests later
- Brute force (3–5 minutes): describe the simplest correct solution and its complexity, even if it is slow. This shows you can solve the problem at all and gives a baseline to improve
- Optimise (8–12 minutes): look for what the brute force repeats or wastes, and match the problem to a pattern: hash map for lookups, two pointers or sliding window for ordered scans, sorting plus binary search, stack for nesting, heap for top-k, BFS for shortest paths in unweighted graphs, dynamic programming for overlapping subproblems. Compare options by time and space and say which you choose and why
- Implement (12–15 minutes): write clean code with meaningful names and small helper functions, narrating as you go. Do not start coding before the approach is agreed with the interviewer
- Test (5 minutes): trace your examples through the code line by line, including the edge cases, and fix defects you find. Finding your own bug calmly is a positive signal
- Analyse and discuss (2–3 minutes): state time and space complexity, mention trade-offs and describe how you would extend the solution (larger input, streaming data, concurrency)

Why each step matters: clarifying avoids solving the wrong problem; examples reveal edge cases early; a brute force guarantees partial credit; optimisation is where the real evaluation happens; testing proves correctness; analysis shows engineering judgement.

Worked illustration, two-sum: the prompt asks for indices of two numbers adding to a target. Clarify: one answer guaranteed? negatives? Examples: [2, 7, 11, 15] with target 9 gives (0, 1); an empty array returns nothing. Brute force: two nested loops, O(n²) time, O(1) space. Observation: for each number the partner is target minus the number, so a hash map of seen values answers each lookup in O(1). Optimised solution: one pass, O(n) time, O(n) space. Test with [3, 3] and target 6 to check duplicate handling.

When you are stuck:

- Simplify: solve a smaller or special case first (sorted input, only positives) and generalise
- Draw: sketch the data structure or the recursion tree
- Reduce: ask which known problem this resembles
- Think aloud: interviewers give hints to candidates who explain their reasoning
- Work backwards from the required complexity: n up to 10^5 suggests O(n log n) or better; n up to 20 suggests exponential search with pruning
- Ask for a hint politely rather than staying silent for minutes

Common patterns to try in order: brute force, sort, hash map, two pointers, sliding window, prefix sums, binary search on the answer, recursion or backtracking, dynamic programming, graph traversal.

Practice routine: solve a problem with a timer, write down which framework step took the longest, review solutions that you could not finish, and revisit the same problem after a week without notes. Quality beats quantity: understanding 100 problems deeply is better than skimming 400.

Pitfalls: coding immediately, never stating the brute force, picking a complicated approach without comparing, silent debugging, ignoring edge cases and finishing without stating complexity.

## explain
1. Restate the problem and ask clarifying questions.
2. Write examples, including an edge case.
3. State the brute force and its complexity.
4. Find the wasted work and pick a pattern.
5. Code in small, well-named pieces.
6. Test by tracing examples, then state complexity.

## example
The Python program applies the framework to the two-sum problem: a brute force with its comparison count, the hash map solution with its lookup count, and tests for the normal case, duplicates, no answer and an empty array. The printed counts show the improvement from quadratic to linear work.

## real
Interviewers at large companies use rubrics that score clarification, approach, coding, testing and communication separately, so each framework step maps directly to a graded dimension.

## pros
- Gives a calm repeatable start on unfamiliar problems
- Produces tests and complexity statements as by-products
- Makes your thinking visible to the interviewer

## cons
- Feels slow if applied rigidly to easy problems
- Time budgets need practice to hit
- A framework cannot replace knowing the patterns

## uses
- Structuring a live coding session
- Practising with a timer
- Reviewing failed attempts
- Teaching others how to approach problems

## mistakes
- Starting to code before the approach is agreed
- Skipping the brute force statement
- Never testing with an edge case
- Forgetting to state complexity at the end

## interview
**Q:** What do you do in the first five minutes of a coding problem?
**A:** Restate the problem, ask about input sizes, duplicates, empty input and ordering, and walk through an example by hand before proposing any approach.

**Q:** Why mention a brute force solution you will not submit?
**A:** It proves you can solve the problem, defines the baseline complexity, and exposes the repeated work that the optimised solution removes.

**Q:** What if you cannot see the optimal approach?
**A:** Simplify to a special case, draw the structure, compare with known patterns, think aloud so hints can come, and use the input limits to guess the target complexity.

## summary
The framework of understand, example, brute force, optimise, implement, test and analyse turns an unfamiliar problem into manageable steps with time budgets. It produces correct, well-communicated solutions and works best when practised under a timer.

## codenote
The Python sample walks the two-sum problem through the brute force and optimised steps with tests.

## code
### python
```python
def brute_force(nums, target):
    comparisons = 0
    for i in range(len(nums)):
        for j in range(i + 1, len(nums)):
            comparisons += 1
            if nums[i] + nums[j] == target:
                return (i, j), comparisons
    return None, comparisons

def with_hash_map(nums, target):
    seen, lookups = {}, 0
    for i, value in enumerate(nums):
        lookups += 1
        if target - value in seen:
            return (seen[target - value], i), lookups
        seen[value] = i
    return None, lookups

tests = [([2, 7, 11, 15], 9), ([3, 3], 6), ([1, 2, 3], 10), ([], 5)]
for nums, target in tests:
    print(nums, target, brute_force(nums, target)[0], with_hash_map(nums, target)[0])

big = list(range(2000))
print(brute_force(big, 3997)[1], with_hash_map(big, 3997)[1])
```
Output:
```text
[2, 7, 11, 15] 9 (0, 1) (0, 1)
[3, 3] 6 (0, 1) (0, 1)
[1, 2, 3] 10 None None
[] 5 None None
1999000 2000
```

## quiz
1. What should you do before writing any code?
   - [ ] Start with the optimal solution
   - [x] Clarify the problem and agree on an approach
   - [ ] Memorise the answer
   - [ ] Write the tests last
   > Coding too early often solves the wrong problem.
2. Why state a brute force solution?
   - [ ] To waste time
   - [x] It gives a baseline and shows the wasted work to remove
   - [ ] It is always accepted
   - [ ] Interviewers require it only for hard problems
   > It also proves you can solve the problem.
3. What can input limits like n up to 10^5 tell you?
   - [ ] The programming language to use
   - [x] The target complexity, around O(n log n) or better
   - [ ] That recursion is forbidden
   - [ ] The number of test cases
   > Quadratic work would be too slow.
4. How should you finish a solution?
   - [ ] Submit immediately
   - [x] Trace tests, then state time and space complexity
   - [ ] Rewrite it in another language
   - [ ] Ask for the next problem
   > Testing and analysis complete the answer.

# Communicating Your Approach
kind: concept
time: Not applicable — communication is a skill rather than an algorithm. Good habits cost almost no extra time, because narrating a plan replaces the silent minutes that would otherwise be spent stuck.
space: Not applicable — no data is stored; the useful artefact is a short written outline on the whiteboard or editor.

## intro
The interviewer cannot read your mind. A correct solution reached in silence is scored lower than a nearly correct one explained clearly, because the interview is a sample of how you would work with teammates. Communicating your approach means making your thinking audible: stating assumptions, explaining trade-offs, narrating code and responding well to hints.

## theory
What interviewers listen for:

- Do you ask clarifying questions instead of guessing?
- Can you explain an idea at the right level before diving into code?
- Do you compare alternatives and justify a choice with complexity?
- Do you notice and fix your own mistakes?
- Do you take hints gracefully and build on them?
- Is your code readable, and can you describe it to a colleague?

Structure for explaining a solution (the five-part outline): problem restated, key observation, algorithm in plain words, complexity, edge cases. Example for finding the longest substring without repeating characters: "We need the longest window with all distinct characters. The observation is that when a repeat appears we only need to move the left edge past the previous occurrence, so a sliding window with a map of last positions never re-scans characters. The algorithm walks right once, updating left when a character reappears inside the window, tracking the best length. Time O(n), space O(min(n, alphabet)). Edge cases are the empty string and a string of one repeated character."

Thinking aloud, done well:

- Say what you are considering, not every passing thought: "I could sort first, which costs O(n log n), but a hash set gives O(n), so I will try that"
- Name the pattern: "this looks like a sliding window because the condition is monotone as the window grows"
- State assumptions explicitly and invite correction: "I'm assuming the array has no negative numbers; is that right?"
- Announce transitions: "I'll start with a brute force, then optimise"
- Pause deliberately: "Let me think for a moment" is better than an unexplained silence

While coding: use descriptive names, write a short comment of intent before a tricky block, say what each function does as you write it, and keep the code moving in small testable pieces. Do not apologise repeatedly; if you spot a bug, say "I see an off-by-one here, let me fix it".

Handling hints: a hint is not a failure; it shows the interviewer how you collaborate. Restate the hint in your own words, test whether it changes your approach and say what you learned. Defensive replies hurt more than the missing insight.

Handling being stuck: summarise what you tried and what is blocking you ("The recursion repeats subproblems and I am looking for a way to cache them"). Interviewers can then guide you precisely. Propose a simpler version of the problem to show forward progress.

Whiteboard and shared editor habits: write the examples and the algorithm outline at the side; draw arrays and pointers when tracing; keep a visible list of edge cases; leave space to edit; keep your explanation aligned with what is on the screen.

Remote interviews: speak slightly slower, confirm the interviewer can see your editor, narrate cursor jumps, and keep the video on if possible so they can read your reactions.

Practice: explain solutions to a friend or record yourself, aiming for a two-minute explanation of any solved problem. Rubber-duck your approach out loud while practising so that the habit exists on interview day.

Pitfalls: long silences, over-explaining trivial steps, jargon without definition, arguing with hints, hiding uncertainty, reading code aloud line by line instead of explaining intent and talking so continuously that no one can interject.

## explain
1. Restate the problem and your assumptions.
2. Present the key observation before the code.
3. Give the algorithm in plain words, then complexity.
4. Narrate intent while coding, not every keystroke.
5. Treat hints as collaboration and restate what you learned.
6. Close with edge cases and possible extensions.

## example
The Python program builds a small explanation generator that formats the five-part outline (problem, observation, algorithm, complexity, edge cases) for three solved problems and prints each, showing how a consistent structure keeps a whole explanation to about 35 words.

## real
Hiring committees read interviewer notes that quote how a candidate reasoned and responded to hints, so clear communication directly affects the hire decision.

## pros
- Lets interviewers award credit for partial progress
- Reveals mistakes early so hints can help
- Shows collaboration skills valued in teams

## cons
- Takes practice to speak and code at once
- Can slow you down if you over-explain
- Nerves make narration harder

## uses
- Live coding interviews
- Design discussions
- Code review comments
- Explaining solutions to teammates

## mistakes
- Staying silent for minutes while thinking
- Narrating every keystroke instead of the intent
- Getting defensive when given a hint
- Using unexplained jargon

## interview
**Q:** How do you explain an algorithm briefly and clearly?
**A:** State the problem, the key observation, the algorithm in plain words, its time and space complexity, and the edge cases, in that order.

**Q:** What should you do when the interviewer gives a hint?
**A:** Restate the hint in your own words, say how it changes your plan, and continue building on it instead of defending your previous idea.

**Q:** How do you communicate while stuck?
**A:** Summarise what you have tried and what blocks you, propose a simpler special case, and ask a focused question so the interviewer can guide you.

## summary
Communicating your approach means stating assumptions, comparing options, narrating intent and welcoming hints. A consistent five-part outline makes explanations short and lets interviewers credit your reasoning even when the code is unfinished.

## codenote
The Python sample formats a five-part explanation outline for several solved problems.

## code
### python
```python
OUTLINE = ("Problem", "Observation", "Algorithm", "Complexity", "Edge cases")

solutions = {
    "Longest substring without repeats": (
        "Find the longest window of distinct characters.",
        "A repeat only forces the left edge past its previous position.",
        "Slide a window and store each character's last index.",
        "O(n) time, O(alphabet) space.",
        "Empty string, one repeated character.",
    ),
    "Valid parentheses": (
        "Check that brackets close in the right order.",
        "The most recent opener must close first.",
        "Push openers on a stack and match closers against the top.",
        "O(n) time, O(n) space.",
        "Empty string, a lone closer.",
    ),
}

for title, parts in solutions.items():
    print(title)
    for label, text in zip(OUTLINE, parts):
        print("  " + label + ": " + text)
    print("  words:", sum(len(p.split()) for p in parts))
```
Output:
```text
Longest substring without repeats
  Problem: Find the longest window of distinct characters.
  Observation: A repeat only forces the left edge past its previous position.
  Algorithm: Slide a window and store each character's last index.
  Complexity: O(n) time, O(alphabet) space.
  Edge cases: Empty string, one repeated character.
  words: 36
Valid parentheses
  Problem: Check that brackets close in the right order.
  Observation: The most recent opener must close first.
  Algorithm: Push openers on a stack and match closers against the top.
  Complexity: O(n) time, O(n) space.
  Edge cases: Empty string, a lone closer.
  words: 35
```

## quiz
1. Why does thinking aloud help in an interview?
   - [ ] It fills the time
   - [x] It lets the interviewer follow your reasoning and give useful hints
   - [ ] It replaces writing code
   - [ ] It hides mistakes
   > Silent work cannot be credited or guided.
2. What belongs in a short explanation of a solution?
   - [ ] Only the code
   - [x] Problem, observation, algorithm, complexity and edge cases
   - [ ] The company name
   - [ ] Only the complexity
   > This five-part outline covers what interviewers grade.
3. How should you respond to a hint?
   - [ ] Ignore it
   - [x] Restate it and build on it
   - [ ] Argue that your approach is better
   - [ ] Stop speaking
   > Hints test collaboration.
4. What should you say when you notice your own bug?
   - [ ] Nothing and hope it goes unseen
   - [x] Point it out and fix it calmly
   - [ ] Restart from scratch
   - [ ] Blame the problem statement
   > Self-correction is a positive signal.

# Analyzing Constraints Quickly
kind: concept
time: Not applicable — constraint analysis is a reading skill. Its result is a target complexity, such as O(n log n) or O(2^n), obtained from the input limits in seconds.
space: Not applicable — the analysis itself stores nothing; it tells you what memory budget, often 256 MB, the solution must fit.

## intro
Before thinking about algorithms, read the limits. The maximum input size tells you which complexity class can finish in time, and the value ranges, memory limit and special guarantees tell you which techniques are even possible. Analyzing constraints quickly narrows the search space of ideas and exposes hidden hints that the problem statement carries.

## theory
Rule of thumb: a modern machine executes about 10^8 simple operations per second in compiled languages and around 10^7 in interpreted ones. Time limits are typically one to two seconds. So the number of basic steps should stay under roughly 10^8.

Input size to complexity table (compiled language, about 10^8 operations budget):

- n ≤ 10: O(n!) permutations or O(n² · 2^n) are acceptable
- n ≤ 20: O(2^n) or O(2^n · n) subset enumeration and bitmask DP
- n ≤ 25 to 40: meet in the middle, O(2^(n/2))
- n ≤ 100: O(n³) such as Floyd-Warshall
- n ≤ 500: O(n³) with small constants
- n ≤ 5,000: O(n²) double loops and quadratic dynamic programming
- n ≤ 10^5: O(n log n), the sweet spot for sorting, heaps, segment trees and binary search
- n ≤ 10^6 to 10^7: O(n) or O(n log log n) such as sieves and linear scans, sometimes O(n log n) with a small constant
- n ≤ 10^9 to 10^18: O(log n) or O(sqrt n), so closed forms, binary search on the answer or fast exponentiation
- Tiny n but huge values: think arithmetic, number theory or bit tricks, not iteration over values

Examples: counting pairs with a given sum in an array of 10^5 elements rules out O(n²) (10^10 steps) and points to sorting with two pointers or a hash map. A grid of 1000 by 1000 cells has 10^6 states, so BFS or DP with O(states) is fine but O(states²) is not. Counting subsets of 18 items allows 2^18 = 262,144 masks.

Beyond n:

- Value ranges: values below 10^6 allow counting arrays or bucket sorting; values up to 10^9 need hashing or sorting; values up to 10^18 need 64-bit integers and care for overflow
- Number of queries q: with n and q both 10^5, answer each query in O(log n) or O(1) after preprocessing, not O(n)
- Memory limit: 10^7 integers of 4 bytes use 40 MB; a 5000 by 5000 table of 4-byte entries needs 100 MB, which may be too much, so use rolling rows
- Output size can itself be a bound: printing all subsets is exponential no matter what
- Guarantees: sorted input suggests binary search or two pointers; non-negative numbers allow sliding windows; distinct values allow sets; a graph that is a tree allows linear traversal; small alphabet (26 letters) allows counting arrays of constant size
- Special phrases: "modulo 10^9 + 7" signals counting with DP or combinatorics; "minimum number of operations" often means BFS or DP; "k-th smallest" suggests a heap or binary search; "online" queries prevent offline sorting tricks

Using hidden hints in constraints: a limit like n ≤ 20 is almost never accidental and tells you a bitmask approach is intended. A limit of 10^5 together with q queries suggests a data structure. Constraints that are oddly small in one dimension (such as k ≤ 10) may allow an extra DP dimension.

Estimating quickly: compute the dominant term. A triple loop over 500 elements is 1.25 × 10^8, borderline but typically fine in a compiled language and too slow in plain Python. A sort of 10^6 elements is about 2 × 10^7 comparisons. Recursion depth for 10^5 elements can overflow the call stack in some languages, so prefer iteration.

In an interview: ask for the constraints if they are not given, and state them as part of your plan: "With n up to 10^5 I need roughly n log n, so a nested loop is out." Interviewers value this reasoning.

Pitfalls: ignoring the query count, forgetting that interpreted languages are about ten times slower, overlooking memory, mistaking average for worst-case behaviour, and optimising code when the real fix is a better algorithm class.

## explain
1. Read every limit: sizes, values, queries, time and memory.
2. Estimate the number of steps for the candidate complexity.
3. Compare with roughly 10^8 operations per second.
4. Eliminate approaches that exceed the budget.
5. Look for guarantees such as sorted input or small alphabet.
6. State the target complexity before choosing the algorithm.

## example
The Python program turns an input size into the most complex algorithm class that fits a budget of 10^8 operations, prints a table for several sizes and shows exact operation counts for a few expressions, including the 262,144 masks for n = 18 and the 1.25 × 10^8 steps for a triple loop over 500 elements.

## real
Competitive programming platforms publish limits on purpose, and interviewers use the stated size as a hint about the intended solution.

## pros
- Rules out slow ideas within seconds
- Points directly at the intended technique
- Prevents wasted implementation time

## cons
- Rules of thumb vary with hardware and language
- Constants can matter near the boundary
- Hidden constraints may be missing in interviews

## uses
- Choosing an algorithm class
- Estimating whether a solution will time out
- Deciding between memory and speed
- Interpreting hints in limits

## mistakes
- Forgetting the number of queries when sizing the solution
- Ignoring the memory limit
- Assuming an interpreted language is as fast as a compiled one
- Optimising constants instead of changing the algorithm

## interview
**Q:** What complexity do you aim for with n up to 10^5?
**A:** O(n log n) or better, since n squared would be 10^10 operations, far beyond what runs in a second or two.

**Q:** What does a limit of n at most 20 suggest?
**A:** An exponential approach is intended, such as enumerating subsets with bitmasks or bitmask dynamic programming, because 2 to the 20 is about a million.

**Q:** Besides n, what else do you check in the constraints?
**A:** The value ranges, the number of queries, the memory limit, and guarantees like sorted input or non-negative values that enable specific techniques.

## summary
Constraints translate to a complexity budget of roughly 10^8 simple steps: factorial for tiny n, exponential for n near 20, quadratic for a few thousand, n log n for 10^5 and logarithmic for 10^18. Also read value ranges, queries and memory limits for hidden hints.

## codenote
The Python sample maps input sizes to feasible complexity classes.

## code
### python
```python
from math import factorial, log2

BUDGET = 10 ** 8

CLASSES = [
    ("O(n!)", lambda n: factorial(n) if n <= 12 else float("inf")),
    ("O(2^n)", lambda n: 2 ** n if n < 60 else float("inf")),
    ("O(n^3)", lambda n: n ** 3),
    ("O(n^2)", lambda n: n ** 2),
    ("O(n log n)", lambda n: n * log2(max(n, 2))),
    ("O(n)", lambda n: n),
    ("O(log n)", lambda n: log2(max(n, 2))),
]

def feasible(n):
    return [name for name, cost in CLASSES if cost(n) <= BUDGET]

for n in (10, 20, 500, 5000, 10 ** 5, 10 ** 7, 10 ** 18):
    print(n, feasible(n)[0])

print(2 ** 18, 500 ** 3, 10 ** 5 * int(log2(10 ** 5)))
```
Output:
```text
10 O(n!)
20 O(2^n)
500 O(n^2)
5000 O(n^2)
100000 O(n log n)
10000000 O(n)
1000000000000000000 O(log n)
262144 125000000 1600000
```

## quiz
1. Roughly how many simple operations fit in one second?
   - [ ] 10^3
   - [x] About 10^8 in a compiled language
   - [ ] 10^12
   - [ ] 10^15
   > The budget guides the choice of complexity.
2. Which complexity suits n up to 10^5?
   - [ ] O(n squared)
   - [x] O(n log n)
   - [ ] O(2 to the n)
   - [ ] O(n factorial)
   > Quadratic work would take about 10^10 steps.
3. What does n at most 20 usually suggest?
   - [ ] A greedy solution
   - [x] Subset enumeration or bitmask dynamic programming
   - [ ] A sieve
   - [ ] Binary search
   > 2 to the 20 is about one million states.
4. Which limit is easy to forget?
   - [ ] The title of the problem
   - [x] The number of queries and the memory limit
   - [ ] The font size
   - [ ] The sample output
   > Both can break an otherwise correct solution.

# Pattern Recognition Guide
kind: concept
time: Not applicable — recognising patterns is a skill. The algorithms you choose carry their own costs, typically O(n) to O(n log n) for the common patterns listed here.
space: Not applicable — this lesson is a map from problem features to techniques rather than a data structure.

## intro
Most interview problems are variations of a few dozen patterns. Experienced candidates do not invent algorithms from scratch; they notice features in the prompt, such as a sorted array, a request for the shortest path or a need for all combinations, and map them to a known technique. This pattern recognition guide lists the signals and the standard answer for each.

## theory
Signal to pattern map:

- Sorted array or sorted matrix, find a value or pair: binary search, or two pointers from both ends
- Contiguous subarray or substring with a condition (longest, shortest, at most k distinct): sliding window
- Subarray sums or range sum queries: prefix sums, with a hash map of prefix sums for "sum equals k"
- Pairs, duplicates, complements, frequency counts: hash map or hash set
- Matching brackets, nested structure, next greater element, undo operations: stack, monotonic stack for next greater or smaller
- Level by level traversal, shortest path in an unweighted graph or grid, minimum steps: BFS
- Explore all paths, connected components, cycle detection, tree recursion: DFS
- Top k, k-th largest, merge k sorted lists, running median: heap (priority queue)
- Intervals, merging, scheduling, overlaps: sort by start, then sweep; for meeting rooms use a heap or sweep line
- Cycle in a linked list, middle node, nth from end: fast and slow pointers
- Generate all subsets, permutations, combinations, constraint puzzles: backtracking
- Optimal substructure with overlapping subproblems (min cost, count ways, longest sequence): dynamic programming; start with recursion plus memoisation
- Take the best local choice with a proof (intervals, jump game, coin change with canonical coins): greedy
- Minimum or maximum value for which a condition holds (monotone yes/no): binary search on the answer
- Connectivity under merges: union-find
- Prefix lookups, autocomplete, word search in a dictionary: trie
- Shortest path with weights: Dijkstra for non-negative weights, Bellman-Ford for negative weights
- Dependency ordering: topological sort
- Bit tricks: unique element via XOR, power of two, subsets as masks
- Range queries with updates: segment tree or Fenwick tree

Decision flow: first ask what is being asked (a value, a count, a path, all solutions or a yes/no), then what structure the input has (array, string, tree, graph, intervals) and finally what constraints exist (size and sortedness). Count questions often mean DP or combinatorics; "all solutions" means backtracking; "shortest" means BFS or Dijkstra; "kth" means heap or selection.

Example mappings: "Longest substring with at most two distinct characters" is a sliding window with a frequency map. "Number of subarrays with sum k" is a prefix sum with a hash map. "Merge k sorted lists" is a heap. "Course schedule" is topological sort. "Word ladder" is BFS over words. "Coin change minimum coins" is DP. "Daily temperatures" is a monotonic stack. "Kth largest element" is a min-heap of size k.

Building the skill: group practice by pattern instead of random order, write the template for each pattern from memory, after solving write one sentence on how you recognised the pattern, and revisit failures by asking which signal you missed. Keep a notebook of patterns with signals, template code and a few canonical problems.

Combining patterns: hard problems often chain two patterns, such as sorting then two pointers (3Sum), BFS with a bitmask state, binary search with a greedy check, or DP with a monotonic queue optimisation. Identify the sub-problem you can solve first.

When no pattern fits: fall back on brute force, find the redundant work, and ask whether sorting, hashing or preprocessing removes it.

Pitfalls: forcing a favourite pattern onto every problem, ignoring a constraint that rules a pattern out (greedy needs a proof, sliding window needs a monotone condition), memorising solutions rather than signals and not checking edge cases after choosing a pattern.

## explain
1. Identify what the question asks for.
2. Identify the shape of the input.
3. Match the features to a pattern from the map.
4. Check that the pattern's preconditions hold.
5. Sketch the template and adapt it.
6. Test edge cases specific to the pattern.

## example
The Python program implements a keyword-based classifier that maps short problem descriptions to a pattern name using signals from the guide, prints the pattern chosen for ten classic prompts, and counts how many match the expected answer.

## real
Coaching programs and interview preparation platforms organise their problem lists by pattern because recognising the pattern is what transfers to new questions.

## pros
- Cuts the time to a first idea
- Transfers to unseen problems
- Makes review systematic

## cons
- Patterns can be applied blindly
- Hard problems blend several patterns
- Learning only the answers breaks down on new variations

## uses
- Quickly choosing an approach
- Organising study by technique
- Revisiting problems you could not solve
- Teaching a problem-solving vocabulary

## mistakes
- Applying a pattern without checking its preconditions
- Memorising solutions instead of signals
- Forcing one favourite technique everywhere
- Not practising the templates from memory

## interview
**Q:** How do you decide between BFS and DFS?
**A:** Use BFS for shortest paths in unweighted graphs and level order problems, and DFS for exploring all paths, components, cycle checks and tree recursion.

**Q:** What signals point to a sliding window?
**A:** A request about a contiguous subarray or substring with a condition such as longest, shortest or at most k distinct elements, where extending or shrinking the window changes the condition monotonically.

**Q:** When is dynamic programming a better fit than greedy?
**A:** When local choices cannot be proven optimal but the problem has optimal substructure and overlapping subproblems, such as minimum coin change with arbitrary denominations.

## summary
Pattern recognition maps problem signals to techniques: sorted input to binary search or two pointers, contiguous ranges to sliding window or prefix sums, shortest paths to BFS, top k to heaps and optimal substructure to dynamic programming. Check preconditions and practise by pattern.

## codenote
The Python sample is a small signal-to-pattern classifier.

## code
### python
```python
SIGNALS = [
    ("sliding window", ["contiguous", "substring", "at most k distinct"]),
    ("prefix sum + hash map", ["subarrays with sum", "range sum"]),
    ("heap", ["top k", "kth largest", "merge k sorted", "running median"]),
    ("BFS", ["shortest path in a grid", "minimum steps", "word ladder", "level order"]),
    ("topological sort", ["prerequisites", "dependency order", "course schedule"]),
    ("monotonic stack", ["next greater", "daily temperatures"]),
    ("binary search", ["sorted array", "minimum value such that"]),
    ("dynamic programming", ["number of ways", "minimum coins", "longest common"]),
    ("backtracking", ["all permutations", "all subsets", "n-queens"]),
]

def classify(prompt):
    prompt = prompt.lower()
    for pattern, words in SIGNALS:
        if any(word in prompt for word in words):
            return pattern
    return "brute force first"

cases = [
    ("Longest substring with at most k distinct characters", "sliding window"),
    ("Number of subarrays with sum equal to k", "prefix sum + hash map"),
    ("Find the kth largest element", "heap"),
    ("Shortest path in a grid with obstacles", "BFS"),
    ("Course schedule with prerequisites", "topological sort"),
    ("Daily temperatures until a warmer day", "monotonic stack"),
    ("Search a target in a sorted array", "binary search"),
    ("Number of ways to climb stairs", "dynamic programming"),
    ("Generate all permutations of a list", "backtracking"),
    ("Find the largest rectangle in a histogram", "brute force first"),
]
hits = 0
for prompt, expected in cases:
    found = classify(prompt)
    hits += found == expected
    print(found + " <- " + prompt)
print(hits, "of", len(cases))
```
Output:
```text
sliding window <- Longest substring with at most k distinct characters
prefix sum + hash map <- Number of subarrays with sum equal to k
heap <- Find the kth largest element
BFS <- Shortest path in a grid with obstacles
topological sort <- Course schedule with prerequisites
monotonic stack <- Daily temperatures until a warmer day
binary search <- Search a target in a sorted array
dynamic programming <- Number of ways to climb stairs
backtracking <- Generate all permutations of a list
brute force first <- Find the largest rectangle in a histogram
10 of 10
```

## quiz
1. Which pattern suits the shortest path in an unweighted grid?
   - [ ] Backtracking
   - [x] Breadth-first search
   - [ ] Binary search on the answer
   - [ ] Sorting
   > BFS finds minimum steps level by level.
2. What suits finding the k largest elements?
   - [ ] A stack
   - [x] A heap of size k
   - [ ] A trie
   - [ ] Union-find
   > The heap keeps the best k in O(n log k).
3. What does a monotonic stack answer?
   - [ ] Shortest paths
   - [x] Next greater or smaller element queries
   - [ ] Prime factors
   - [ ] String hashing
   > Each element is pushed and popped once.
4. Why check a pattern's preconditions?
   - [ ] To avoid reading the problem
   - [x] A pattern only works when its assumptions, such as a monotone condition, hold
   - [ ] To use more memory
   - [ ] To slow down
   > Greedy and sliding window both fail without them.

# Mock Interview Strategies
kind: concept
time: Not applicable — mock interviews are a practice method. A useful schedule is about one mock per week of 45 to 60 minutes, followed by 30 minutes of review.
space: Not applicable — no data structure is involved; the artefacts are feedback notes and a log of mistakes.

## intro
Solving problems alone at a desk is different from solving them while someone watches and the clock runs. Mock interview strategies close that gap by rehearsing the real conditions: a timed problem, a partner who plays the interviewer, spoken reasoning and honest feedback. Candidates who do several mocks usually perform noticeably better because the format stops being new.

## theory
Types of mock:

- Peer mocks: swap roles with a friend or study partner; being the interviewer teaches you what good looks like
- Platform mocks: services pair you with other candidates or professional interviewers; free peer matching is common, paid sessions with experts give calibrated feedback
- Self mocks: set a timer, record screen and audio, solve aloud and review the recording
- Mentor or alumni mocks: someone who has interviewed at your target company can reveal its style
- Full loop simulation: several back-to-back sessions (coding, design, behavioural) to practise stamina

Running a good session:

- Choose a problem you have not seen, at medium difficulty, and agree on the rules in advance (language, editor or whiteboard, whether searching is allowed)
- Use the real time limit, usually 35 to 45 minutes per problem
- The interviewer should follow a script: present the problem, answer clarifying questions, give hints only after the candidate is stuck for a while and ask for complexity at the end
- Take notes on a rubric covering understanding, approach, coding quality, testing, communication and handling of hints
- Spend 10 to 15 minutes on feedback: what went well, what was unclear, where time was lost
- Write an action list: two concrete things to practise before the next mock

Feedback rubric (score 1 to 4 each): clarifying questions; approach and complexity; code correctness and style; testing; communication; response to hints. Compare scores across mocks to see trends rather than fixating on one result.

Progression: begin with easy problems to build the habit of the framework, move to medium problems under time pressure, then include harder problems and design or behavioural rounds. Revisit problems you failed after a week to test retention.

Practising communication: explain your plan before typing, keep talking in short sentences, and have the interviewer interrupt with questions as real interviewers do. Practise recovering from a mistake or a blank mind without freezing.

Environment: practise in the same tool you will use (a plain editor without autocomplete or the company's collaborative editor), practise on a whiteboard or paper for on-site interviews, and rehearse video calls for remote interviews including screen sharing and a quiet space.

Managing nerves: interviews feel high stakes, so lower the stakes by repetition. Use breathing, a pause to think and the habit of restating the problem. Treat mistakes as normal; interviewers expect them.

Tracking progress: keep a log with date, problem, pattern, time to solve, hints used and the main lesson. Review the log before real interviews to remember recurring issues such as forgetting edge cases or complexity statements.

Common timeline: start mocks about four to six weeks before the real interviews, increase frequency to two or three per week during the last two weeks, and stop heavy practice the day before.

Pitfalls: only doing mocks with the same partner (feedback gets friendly), choosing problems already memorised, ignoring feedback, skipping the review session, treating hints as failure and never practising in the real interview setting.

## explain
1. Pick a partner, a format and a time limit.
2. Choose an unseen problem of suitable difficulty.
3. Run the session in real conditions with spoken reasoning.
4. Score it on a rubric immediately afterwards.
5. Write two concrete improvements.
6. Repeat weekly and track trends in a log.

## example
The Python program keeps a log of six mock sessions, scores each on the six rubric dimensions, prints the average per dimension and highlights the weakest dimension so that the next session targets it.

## real
Interview coaching services and university career centres run mock interviews because repeated rehearsal under realistic conditions measurably improves performance.

## pros
- Builds comfort with the real format
- Gives external feedback on blind spots
- Teaches you to judge solutions by watching others

## cons
- Takes scheduling effort
- Feedback quality depends on the partner
- Can create anxiety if overdone just before the real interview

## uses
- Rehearsing timed coding rounds
- Practising spoken reasoning
- Finding recurring weaknesses
- Preparing for remote or on-site formats

## mistakes
- Always practising with the same friendly partner
- Using problems you have already memorised
- Skipping the written review after each session
- Stopping mocks entirely until the real interview

## interview
**Q:** How do you get the most from a mock interview?
**A:** Use an unseen problem under the real time limit, speak your reasoning, score the session on a rubric immediately and write concrete actions for the next practice.

**Q:** Why act as the interviewer sometimes?
**A:** Watching someone else solve a problem shows what clear communication and good hint handling look like, and it exposes your own habits.

**Q:** How often should you do mocks?
**A:** About weekly starting a month or two before interviews, rising to two or three per week in the final fortnight, with review after each.

## summary
Mock interviews rehearse real conditions with an unseen problem, a time limit, spoken reasoning and rubric feedback. Track results in a log, act on the weakest dimension and keep a steady schedule until the real interview.

## codenote
The Python sample averages rubric scores and finds the weakest dimension.

## code
### python
```python
DIMENSIONS = ["clarifying", "approach", "code", "testing", "communication", "hints"]

sessions = [
    ("two sum variant", [2, 3, 3, 2, 3, 3]),
    ("sliding window", [3, 3, 3, 2, 3, 2]),
    ("binary tree level order", [3, 3, 3, 3, 3, 3]),
    ("interval merge", [2, 3, 4, 2, 3, 3]),
    ("graph shortest path", [3, 2, 3, 3, 3, 3]),
    ("dp coin change", [3, 3, 3, 2, 4, 3]),
]

totals = [0] * len(DIMENSIONS)
for name, scores in sessions:
    for i, score in enumerate(scores):
        totals[i] += score
    print(name, sum(scores) / len(scores))

averages = {d: round(t / len(sessions), 2) for d, t in zip(DIMENSIONS, totals)}
print(averages)
weakest = min(averages, key=averages.get)
print("focus next on:", weakest)
```
Output:
```text
two sum variant 2.6666666666666665
sliding window 2.6666666666666665
binary tree level order 3.0
interval merge 2.8333333333333335
graph shortest path 2.8333333333333335
dp coin change 3.0
{'clarifying': 2.67, 'approach': 2.83, 'code': 3.17, 'testing': 2.33, 'communication': 3.17, 'hints': 2.83}
focus next on: testing
```

## quiz
1. What makes a mock interview useful?
   - [ ] Using a problem you already know
   - [x] Real time limit, unseen problem, spoken reasoning and feedback
   - [ ] Skipping the review
   - [ ] Practising alone silently
   > Realistic conditions are the point.
2. What should follow each mock?
   - [ ] Nothing
   - [x] A written review with concrete actions
   - [ ] A longer mock without a break
   - [ ] Deleting the notes
   > Feedback only helps when acted upon.
3. Why switch roles with your partner?
   - [ ] To share the work
   - [x] Interviewing others shows what good performance looks like
   - [ ] To avoid feedback
   - [ ] To shorten the session
   > You learn what interviewers notice.
4. When should heavy practice stop?
   - [ ] Never
   - [x] Around the day before the real interview
   - [ ] Six months earlier
   - [ ] During the interview
   > Rest helps recall and calm.

# Behavioral Questions for Engineers
kind: concept
time: Not applicable — behavioural answers are stories, not algorithms. A strong answer usually lasts about two minutes, and a typical behavioural round covers four to six questions in 45 minutes.
space: Not applicable — what matters is a prepared bank of six to eight stories you can adapt to many questions.

## intro
Behavioural questions such as "Tell me about a time you disagreed with a teammate" test how you work with people, handle setbacks and take responsibility. They carry real weight in hiring decisions, especially for senior roles and for companies that value teamwork. Behavioral questions for engineers have predictable themes, so you can prepare stories in advance and tell them with structure.

## theory
The STAR method structures each answer:

- Situation: one or two sentences of context (team, project, stakes)
- Task: your specific responsibility or goal
- Action: what you did, in first person, with decisions and reasons; this is the longest part
- Result: the measurable outcome and what you learned

Aim for about 20 percent situation and task, 60 percent action and 20 percent result and reflection. Use "I" for your own actions and "we" for team context, and quantify results when possible (latency reduced by 40 percent, outage resolved in two hours).

Common themes and what interviewers look for:

- Conflict and disagreement: respect, listening, data-based resolution, willingness to commit after a decision
- Failure and mistakes: ownership without blame, learning, and changes made afterwards (blameless postmortems)
- Leadership without authority: influencing through clarity, mentoring, driving a project
- Ambiguity: breaking down unclear requirements, asking questions, making reasonable assumptions
- Tight deadlines and trade-offs: prioritisation, scope cutting, communication of risks
- Receiving critical feedback: openness and concrete improvement
- Helping others and teamwork: code review habits, pairing, knowledge sharing
- Technical decision making: options considered, trade-offs, reversing a decision when new evidence appears
- Customer or user focus: using feedback or metrics to guide work
- Why this company and role: specific reasons based on the product, culture and your goals

Building a story bank: write six to eight stories from internships, jobs, projects, hackathons, courses or volunteering. Each story should be adaptable to several themes, for example a project where you resolved a conflict, led a decision and delivered under a deadline. For each story note the situation, your role, three key actions, the result with numbers and the lesson.

Students and new graduates: use academic projects, team assignments, open-source contributions, hackathons and part-time work. Interviewers expect smaller scope but the same qualities: ownership, clear communication and learning.

Delivering answers: pause to choose a story, keep to about two minutes, avoid rambling background, avoid blaming people, and finish with the result and what you would do differently. Practise aloud with a timer and record yourself.

Handling the failure question: pick a real failure with moderate stakes, explain your part honestly, describe how you fixed the impact and describe a process change. Avoid fake weaknesses like "I work too hard".

Follow-up questions: interviewers probe for depth ("What would you do differently?" "How did you convince them?"). Know your stories well enough to answer details.

Red flags to avoid: speaking badly about former colleagues, taking all credit, claiming no failures, vague answers without specifics, stories with no outcome and memorised scripts that sound robotic.

Questions to ask at the end: about team practices, onboarding, how success is measured, code review culture and the problems the team is solving. Good questions show interest and judgement.

Pitfalls: overlong context, using only "we" so your contribution is invisible, claiming results you cannot support, forgetting to tie the story to the question and not preparing at all because it feels soft.

## explain
1. List six to eight experiences with clear challenges.
2. Write each story in STAR form with numbers.
3. Map each story to several common themes.
4. Practise aloud to about two minutes each.
5. Prepare honest answers for failure and conflict.
6. Prepare questions to ask the interviewer.

## example
The Python program stores a small story bank, each tagged with themes, checks that every common theme has at least one story, estimates the speaking time of each story at 130 words per minute and flags any story that would run longer than two minutes.

## real
Large technology companies score behavioural answers against written leadership principles, and a weak behavioural round can block an otherwise strong technical candidate.

## pros
- Predictable themes allow advance preparation
- A story bank is reusable across companies
- Shows maturity and teamwork

## cons
- Easy to ramble without structure
- Honest failure stories feel uncomfortable
- Memorised scripts sound unnatural

## uses
- Behavioural interview rounds
- Resume and portfolio discussions
- Performance reviews and promotion cases
- Networking conversations

## mistakes
- Saying we throughout so your role is unclear
- Answering with a hypothetical instead of a real example
- Blaming a teammate in a conflict story
- Giving a fake weakness as the failure example

## interview
**Q:** What is the STAR method?
**A:** A structure for behavioural answers covering the situation, the task, your actions and the result, with most time spent on the actions and a measurable outcome at the end.

**Q:** How do you answer a question about a mistake?
**A:** Describe a real mistake, take ownership without blaming others, explain how you limited the damage and the process change you made so it would not repeat.

**Q:** How should a new graduate prepare without work experience?
**A:** Use team projects, internships, open-source work and hackathons, choosing stories that show ownership, collaboration and learning, and prepare enough detail to survive follow-up questions.

## summary
Behavioural questions test collaboration, ownership and judgement. Prepare a bank of six to eight real stories in STAR form with measurable results, adapt them to common themes, practise to about two minutes and avoid blaming or vague answers.

## codenote
The Python sample checks story coverage and speaking time.

## code
### python
```python
THEMES = {"conflict", "failure", "leadership", "ambiguity", "deadline", "feedback", "teamwork"}

stories = {
    "capstone merge conflict": {"themes": {"conflict", "teamwork"}, "words": 240},
    "missed demo deadline": {"themes": {"deadline", "failure", "feedback"}, "words": 275},
    "unclear client brief": {"themes": {"ambiguity", "leadership"}, "words": 210},
    "mentoring a junior": {"themes": {"leadership", "teamwork", "feedback"}, "words": 300},
}

covered = set().union(*(s["themes"] for s in stories.values()))
print("missing themes:", sorted(THEMES - covered))
for name, story in stories.items():
    seconds = round(story["words"] / 130 * 60)
    print(name, seconds, "seconds", "TOO LONG" if seconds > 120 else "ok")
```
Output:
```text
missing themes: []
capstone merge conflict 111 seconds ok
missed demo deadline 127 seconds TOO LONG
unclear client brief 97 seconds ok
mentoring a junior 138 seconds TOO LONG
```

## quiz
1. What does STAR stand for?
   - [ ] Skill, Time, Attitude, Result
   - [x] Situation, Task, Action, Result
   - [ ] Story, Topic, Answer, Review
   - [ ] Setup, Test, Analyse, Report
   > It organises an answer around what you did.
2. Which part of the answer should be longest?
   - [ ] Situation
   - [x] Action
   - [ ] The question restated
   - [ ] The company description
   > Interviewers evaluate your decisions and actions.
3. How should you describe a failure?
   - [ ] Say you have none
   - [x] Own it, explain the fix and the lesson
   - [ ] Blame the team
   - [ ] Give a weakness that is secretly a strength
   > Honest ownership builds trust.
4. How long should a typical story answer be?
   - [ ] Ten seconds
   - [x] About two minutes
   - [ ] Ten minutes
   - [ ] As long as possible
   > Longer answers lose focus and time.

# System Design Bridge Topics
kind: concept
time: Not applicable — this lesson introduces design vocabulary. In estimates, a request path usually adds latencies in the order of 1 ms for memory, 1 to 10 ms for a database read and 50 to 150 ms for a cross-continent network round trip.
space: Not applicable — system design reasons about storage at scale: for example 1 million daily users writing 1 KB each is about 1 GB per day.

## intro
Coding rounds ask for an algorithm on one machine; system design rounds ask how many machines and components cooperate to serve millions of users. The system design bridge topics are the ideas that connect the data structures you already know to that larger world: hashing becomes sharding, queues become message brokers, caches become CDNs and sorting becomes distributed processing.

## theory
Why a bridge: graduates often know algorithms but not distributed systems. A handful of concepts carries most of an entry-level design interview, and they connect directly to earlier lessons.

Core building blocks:

- Client, server and API: clients send requests to servers over HTTP; REST, JSON and later gRPC define the contract. Stateless servers can be copied freely
- Load balancer: spreads requests over many servers using round robin, least connections or consistent hashing; removes a single point of failure
- Database choices: relational (SQL) for structured data and transactions; document, key-value, wide-column and graph stores for flexibility or scale. Indexes (B-trees) speed up reads at the cost of slower writes
- Caching: keep hot data in memory (Redis, Memcached) with policies such as LRU, a hash map plus a doubly linked list, the classic data structure interview. Cache aside, write-through and write-back are the main strategies, and invalidation is the hard part
- Content delivery network: caches static content near users
- Message queues and streams: decouple producers and consumers, smooth bursts and enable retries (Kafka, RabbitMQ, SQS); a queue is the data structure you know, made durable and distributed
- Sharding (partitioning): split data by a key across machines. Hash of key modulo N moves most keys when N changes, so consistent hashing places keys and servers on a ring so only about 1/N of the keys move
- Replication: copies for availability and read scaling; leader-follower replication means followers can lag, giving eventual consistency
- CAP theorem and consistency: in a network partition you must choose between consistency and availability; many systems choose availability with eventual consistency
- Rate limiting: token bucket or sliding window counters protect services
- Unique IDs and URL shorteners: base62 encoding of counters or hashes; collisions and distributed counters
- Probabilistic structures: Bloom filters test membership with no false negatives and tunable false positives; HyperLogLog counts distinct items
- Search and indexing: inverted indexes map words to document lists; tries support autocomplete
- Monitoring and reliability: metrics, logs, health checks, retries with exponential backoff, timeouts, circuit breakers

Back-of-envelope estimation: convert users into requests per second (RPS). 10 million daily active users each making 20 requests per day is 2 × 10^8 requests per day, about 2,300 per second on average, and peaks of 2 to 3 times that. Storage: 1 KB per record times 10^9 records is 1 TB. Bandwidth: 2,300 RPS times 10 KB per response is about 23 MB per second. Useful numbers: a day has about 86,400 seconds (close to 10^5), and powers of two: 2^10 is about a thousand, 2^20 a million, 2^30 a billion.

Design interview flow:

- Clarify requirements: functional features and non-functional goals (latency, availability, consistency, scale)
- Estimate scale with simple arithmetic
- Define the API and the data model
- Sketch the high-level architecture: clients, load balancer, services, caches, databases, queues
- Deep dive into one or two components the interviewer chooses: schema and indexes, sharding, caching strategy
- Discuss bottlenecks, failure modes and trade-offs, and how the design evolves with growth

Typical practice problems: URL shortener, rate limiter, key-value store, chat application, news feed, notification system, web crawler, parking lot or elevator (object-oriented design) and typeahead search.

Connecting to algorithms: LRU cache combines a hash map and a linked list; consistent hashing uses a sorted ring with binary search; top-k trending items use heaps and counting sketches; a web crawler is BFS with a visited set; topological sort schedules dependent jobs; merge of sorted files is the external sort used in big data.

Pitfalls: jumping to technologies before requirements, over-engineering for scale that is not needed, ignoring failure cases, treating a cache as always correct, forgetting hot keys and uneven shards and giving buzzwords without trade-offs.

## explain
1. Clarify functional and non-functional requirements.
2. Estimate requests, storage and bandwidth.
3. Define the API and the data model.
4. Draw the high-level components and the request path.
5. Deep dive into caching, sharding or the database.
6. Discuss trade-offs, bottlenecks and failures.

## example
The Python program estimates the load of a hypothetical service from daily users (about 2,315 requests per second, 6,944 at peak, roughly 69,618 GB of storage per year and 22.6 MB per second of bandwidth) and compares how many keys move when a server is added under modulo hashing versus consistent hashing with virtual nodes (7,960 of 10,000 keys move with modulo hashing, 2,116 with the ring).

## real
Every large web service uses load balancers, caches, replication and sharding, and entry-level interviews at many companies include a basic design round.

## pros
- Builds on data structures already known
- A small vocabulary covers most basic designs
- Back-of-envelope maths exposes unrealistic designs early

## cons
- Many valid answers with no single correct one
- Needs breadth more than depth at this level
- Easy to hide behind buzzwords

## uses
- Entry-level design interviews
- Capacity estimates
- Choosing between caching and sharding
- Communicating architecture to teammates

## mistakes
- Naming technologies before understanding requirements
- Ignoring failure and consistency trade-offs
- Skipping the scale estimate
- Using modulo hashing where servers join and leave often

## interview
**Q:** Why use consistent hashing for sharding?
**A:** When servers are added or removed only about one over N of the keys move, whereas hashing modulo N reassigns almost every key.

**Q:** How do you estimate requests per second?
**A:** Multiply daily users by requests per user, divide by roughly 86,400 seconds and multiply by a peak factor of two to three.

**Q:** Which data structures sit behind an LRU cache?
**A:** A hash map for constant-time lookup plus a doubly linked list ordered by recency, so both get and put run in constant time.

## summary
System design bridge topics link familiar data structures to distributed building blocks: load balancers, caches, queues, sharding with consistent hashing, replication and the CAP trade-off. Start from requirements and estimates, then discuss trade-offs.

## codenote
The Python sample estimates load and compares two hashing schemes.

## code
### python
```python
import bisect
import hashlib

def estimate(daily_users, requests_per_user, kb_per_request, record_kb):
    per_day = daily_users * requests_per_user
    rps = per_day / 86_400
    return round(rps), round(rps * 3), round(per_day * record_kb / 1024 / 1024 * 365, 1), round(rps * kb_per_request / 1024, 1)

print(estimate(10_000_000, 20, 10, 1))

def h(text):
    return int(hashlib.md5(text.encode()).hexdigest(), 16)

keys = [f"user:{i}" for i in range(10_000)]
moved_modulo = sum(h(k) % 4 != h(k) % 5 for k in keys)

def ring(servers, vnodes=100):
    return sorted((h(f"{s}#{v}"), s) for s in servers for v in range(vnodes))

def owner(points, key):
    positions = [p for p, _ in points]
    return points[bisect.bisect(positions, h(key)) % len(points)][1]

before = ring(["a", "b", "c", "d"])
after = ring(["a", "b", "c", "d", "e"])
moved_ring = sum(owner(before, k) != owner(after, k) for k in keys)
print(moved_modulo, moved_ring)
print(moved_modulo > 2 * moved_ring)
```
Output:
```text
(2315, 6944, 69618.2, 22.6)
7960 2116
True
```

## quiz
1. What does a load balancer do?
   - [ ] Stores all data
   - [x] Spreads requests across servers and removes a single point of failure
   - [ ] Encrypts the database
   - [ ] Compiles code
   > It distributes traffic using strategies like round robin.
2. Why use consistent hashing?
   - [ ] It is simpler than modulo
   - [x] Few keys move when servers join or leave
   - [ ] It sorts keys
   - [ ] It removes the need for replication
   > Only about one over N of the keys are reassigned.
3. Which structure combination implements an LRU cache?
   - [ ] Array and queue
   - [x] Hash map and doubly linked list
   - [ ] Trie and heap
   - [ ] Two stacks
   > Both lookup and recency updates are constant time.
4. What does the CAP theorem say about a network partition?
   - [ ] You can have everything
   - [x] You must trade consistency against availability
   - [ ] Partitions never occur
   - [ ] Latency becomes zero
   > Systems choose which property to relax.
