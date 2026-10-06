# Word Search Grid
kind: algorithm
time: O(R · C · 4^L) in the worst case for a grid of R rows and C columns and a word of length L, since every cell may start a search that branches into up to three or four directions at each of L steps; real inputs prune quickly on letter mismatches.
space: O(L) for the recursion stack, with the grid marked in place and restored, so no visited matrix is needed.

## intro
Given a grid of letters and a word, can the word be spelled by moving from cell to adjacent cell, horizontally or vertically, without using any cell twice? Word search is a grid backtracking problem: start at every cell that matches the first letter, extend the path one neighbour at a time, and retreat as soon as the next letter does not match.

## theory
Recursive formulation: `explore(r, c, k)` answers whether the suffix of the word starting at index k can be matched with the path currently at cell (r, c).

- If k equals the word length, every letter has been matched, so return true
- If (r, c) is outside the grid, or the cell does not hold `word[k]`, return false
- Mark the cell as used (for example by replacing its letter with a placeholder such as `#`), try the four neighbours with k + 1, then restore the letter; return true if any neighbour succeeds

The caller loops over every cell as a possible start and returns true on the first success.

Marking in place avoids an extra visited matrix and, because it is restored on the way back, keeps the board unchanged for the next starting cell. Using a placeholder that cannot occur in the word is essential, or a marked cell might wrongly match.

Example on the board with rows `ABCE`, `SFCS` and `ADEE`: the word `ABCCED` exists (A, B, C in the first row, then down to C, then E and D), `SEE` exists (S at the end of the second row, then the E below it and the E to its left), and `ABCB` does not exist because the only B has been used by the time the path would need to return to it. The searches return `True True False`.

Pruning and optimisation:

- Quick rejection: if the grid does not contain enough copies of each letter needed by the word, return false without searching
- Reverse the word when its last letter is rarer in the grid than the first, since fewer starting cells mean fewer searches
- For many words at once (word search II), build a trie of the words and walk it during the search, so a prefix shared by many words is explored only once; remove found words and prune empty trie branches to speed up later searches
- Stop as soon as a match is found

Complexity: each cell can start a search of depth L, and at each step the path can continue in at most three new directions (it cannot go back to the cell it came from), so the bound is O(R · C · 3^L) in practice and written as O(R · C · 4^L) in the loose form. The recursion depth is at most L, so memory is small.

Variants: allow diagonal moves, require paths that reuse cells, find all paths, find the longest word from a dictionary (Boggle), or search a one-dimensional string for a pattern with wildcards. The same flood-like search with marking underlies counting islands and finding paths in mazes, although those use depth-first search without the undo step because they do not need to revisit cells on different paths.

Common correctness checks: single-cell grid, word longer than the number of cells (always false), repeated letters, and cells that must not be reused even if they form a loop.

## explain
1. Loop over all cells as possible starting points.
2. In the recursive function, return true if all letters are matched.
3. Return false if the cell is out of bounds or does not match the next letter.
4. Mark the cell as used and try the four neighbours with the next letter.
5. Restore the cell before returning.
6. Prune with letter counts or a trie when searching many words.

## example
The Python function on the board with rows `ABCE`, `SFCS` and `ADEE` returns `True` for `ABCCED`, `True` for `SEE` and `False` for `ABCB`. The JavaScript function searches the board with rows `oaan`, `etae`, `ihkr` and `iflv` and reports that `oath`, `oat` and `oate` exist while `rain` does not.

## real
Word games such as Boggle solvers, crossword helpers and text puzzle generators use this search, and the same pattern matches paths in game boards and in maze-like data structures.

## pros
- Small amount of memory since the grid is marked in place
- Early mismatch pruning keeps typical searches fast
- Extends to many words with a trie

## cons
- Exponential in the word length in the worst case
- Marking in place makes the function unsafe for concurrent use
- Forgetting to restore the cell corrupts later searches

## uses
- Checking whether a word exists in a letter grid
- Solving Boggle-style games
- Finding paths in grids with a no-reuse rule
- Searching many words with a trie

## mistakes
- Not restoring the cell after the recursive calls
- Using a placeholder character that can match a letter of the word
- Allowing the same cell twice in one path
- Starting the search only from the top-left cell

## interview
**Q:** How do you prevent reusing a cell in word search?
**A:** Mark the cell as visited, for example by overwriting its letter with a placeholder, before exploring neighbours and restore the original letter when the recursive call returns.

**Q:** What is the time complexity of word search?
**A:** About O(R · C · 3^L) to O(R · C · 4^L) for a grid with R rows and C columns and a word of length L, since each of the cells may start a search with a few choices per step.

**Q:** How would you search for a list of words at once?
**A:** Insert the words into a trie and run one backtracking search from each cell that follows trie edges, so shared prefixes are processed only once.

## summary
Word search tries each cell as a start and extends the path through unvisited neighbours that match the next letter, marking cells in place and restoring them after each branch. Prefix pruning and a trie help when many words are searched.

## codenote
The Python sample checks three words on a classic board. The JavaScript sample uses another board.

## code
### python
```python
def exists(board, word):
    rows, cols = len(board), len(board[0])

    def explore(r, c, k):
        if k == len(word):
            return True
        if not (0 <= r < rows and 0 <= c < cols) or board[r][c] != word[k]:
            return False
        saved, board[r][c] = board[r][c], "#"
        found = any(explore(r + dr, c + dc, k + 1) for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)))
        board[r][c] = saved
        return found

    return any(explore(r, c, 0) for r in range(rows) for c in range(cols))

board = [list("ABCE"), list("SFCS"), list("ADEE")]
print(exists(board, "ABCCED"), exists(board, "SEE"), exists(board, "ABCB"))
```
Output:
```text
True True False
```
### javascript
```javascript
function exists(board, word) {
  const rows = board.length;
  const cols = board[0].length;

  function explore(r, c, k) {
    if (k === word.length) return true;
    if (r < 0 || c < 0 || r >= rows || c >= cols || board[r][c] !== word[k]) return false;
    const saved = board[r][c];
    board[r][c] = "#";
    const found = explore(r + 1, c, k + 1) || explore(r - 1, c, k + 1) ||
      explore(r, c + 1, k + 1) || explore(r, c - 1, k + 1);
    board[r][c] = saved;
    return found;
  }

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (explore(r, c, 0)) return true;
    }
  }
  return false;
}

const board = [[..."oaan"], [..."etae"], [..."ihkr"], [..."iflv"]];
console.log(exists(board, "oath"), exists(board, "oat"), exists(board, "oate"), exists(board, "rain"));
```
Output:
```text
true true true false
```

## quiz
1. How does the search avoid using the same cell twice?
   - [ ] It sorts the grid
   - [x] It marks the cell while exploring and restores it afterwards
   - [ ] It uses a queue
   - [ ] It never revisits letters
   > The placeholder blocks the cell only along the current path.
2. From which cells does the search start?
   - [ ] Only the top-left cell
   - [x] Every cell that could match the first letter
   - [ ] Only the border cells
   - [ ] The center cell
   > Any cell might begin the word.
3. Why must the placeholder not be a letter that appears in the word?
   - [ ] It would be slower
   - [x] A marked cell could then match and be reused wrongly
   - [ ] It would change the grid size
   - [ ] It breaks recursion
   > The mark has to fail every comparison with the word.
4. What speeds up searching for many words at once?
   - [ ] A larger grid
   - [x] A trie that shares the prefixes of the words
   - [ ] Sorting the letters
   - [ ] Running each word twice
   > One walk through the trie handles every word with the same prefix.

# Palindrome Partitioning
kind: algorithm
time: O(n · 2^n) in the worst case, since a string of n identical characters has 2^(n − 1) partitions and each costs O(n) to build and check; precomputing which substrings are palindromes reduces the check to O(1).
space: O(n) for the recursion stack and the current partition, plus O(n^2) for an optional palindrome table, excluding the output.

## intro
Palindrome partitioning asks for every way to cut a string into pieces so that each piece reads the same forwards and backwards. For the string aab the answers are a, a, b and aa, b. It is a backtracking problem over cut positions: choose the end of the next piece, keep it only if it is a palindrome, and continue with the rest.

## theory
Recursive structure: `explore(start)` builds partitions of the suffix beginning at `start`.

- If `start` equals the string length, the pieces collected so far form a complete partition, so record a copy
- Otherwise, for each end position `end` from `start` + 1 to the length, let the piece be `s[start:end]`; if it is a palindrome, append it, call `explore(end)`, and remove it

Only palindromic prefixes are ever extended, so branches with a non-palindromic piece are pruned immediately. For `aab` the first piece can be `a` or `aa` (the piece `aab` is not a palindrome), giving `[a, a, b]` and `[aa, b]`.

Counting: a string of n equal characters has 2^(n − 1) partitions, because at each of the n − 1 gaps you may cut or not. The string `aaaa` has 8, and `abc` has just one partition into single letters. So the worst-case output is exponential and backtracking is optimal in the sense that it only spends time proportional to the output plus pruned checks.

Palindrome checks:

- Direct comparison of the piece with its reverse costs O(length) each time
- A table `is_pal[i][j]`, filled by dynamic programming, answers in O(1): a substring is a palindrome if its end characters match and the inside, `is_pal[i + 1][j − 1]`, is a palindrome (or the inside is empty). Precomputing it costs O(n^2) time and memory and removes the repeated work from the search.
- Expanding around centres is an alternative way to build the same table

Related problems:

- Palindrome partitioning II asks for the minimum number of cuts, solved with dynamic programming in O(n^2) using the palindrome table, because there is no need to list the partitions
- Counting the number of palindromic partitions also uses dynamic programming over the same table
- Longest palindromic substring and counting palindromic substrings use the same table or centre expansion
- Restoring IP addresses, splitting a string into dictionary words and generating parenthesis strings use the same cut-position backtracking with a different validity test for a piece

When to use backtracking versus dynamic programming: if the task needs every partition, only enumeration works; if it needs a number (minimum cuts, count), dynamic programming avoids the exponential blow-up.

Edge cases: an empty string has one partition, the empty list; single characters are always palindromes; strings with all different characters have only one partition.

## explain
1. Start at index 0 with an empty list of pieces.
2. If the index reaches the end of the string, record a copy of the pieces.
3. For each possible end index, take the piece between start and end.
4. If the piece is a palindrome, add it, recurse from the end index, and remove it.
5. Optionally precompute a palindrome table to make the check constant time.
6. Compare the counts with 2^(n − 1) for strings of equal letters.

## example
The Python function returns `[['a', 'a', 'b'], ['aa', 'b']]` for the string `aab` and counts 8 partitions for `aaaa`. The JavaScript function counts partitions: 2 for `aab`, 8 for `aaaa` and 1 for `abc`.

## real
Text analysis tools and bioinformatics programs look for palindromic structures, and the cut-position backtracking pattern also appears in tokenizers and in code that splits input into valid words or fields.

## pros
- Straightforward use of the choose, explore, unchoose pattern
- Pruning at the first non-palindromic piece
- The palindrome table removes repeated checks

## cons
- The number of partitions can be exponential
- Repeated palindrome checks cost time without a table
- Counting needs a different method to avoid enumeration

## uses
- Listing all palindrome partitions of a string
- Finding structure in text and sequences
- Practising cut-position backtracking
- Combining backtracking with dynamic programming tables

## mistakes
- Forgetting to remove the piece after the recursive call
- Slicing with the wrong end index and skipping characters
- Checking palindromes by hand every time on long strings
- Enumerating partitions when only the minimum number of cuts is needed

## interview
**Q:** How does palindrome partitioning use backtracking?
**A:** It tries every end position for the next piece, keeps the piece only if it is a palindrome, recurses on the rest of the string, and records the pieces when the end of the string is reached.

**Q:** How do you speed up the palindrome check?
**A:** Precompute a table of whether each substring is a palindrome using dynamic programming, where a substring is a palindrome if its end characters match and its inside is a palindrome.

**Q:** What is the maximum number of partitions of a string of length n?
**A:** 2^(n − 1), reached when all characters are equal, because each gap between characters can be cut or not.

## summary
Palindrome partitioning enumerates cut positions with backtracking and extends only palindromic pieces, using a precomputed table for fast checks. When only a count or minimum cuts is required, dynamic programming is far cheaper than listing partitions.

## codenote
The Python sample lists the partitions. The JavaScript sample counts them.

## code
### python
```python
def partitions(text):
    results, pieces = [], []

    def explore(start):
        if start == len(text):
            results.append(pieces[:])
            return
        for end in range(start + 1, len(text) + 1):
            piece = text[start:end]
            if piece == piece[::-1]:
                pieces.append(piece)
                explore(end)
                pieces.pop()

    explore(0)
    return results

print(partitions("aab"))
print(len(partitions("aaaa")))
```
Output:
```text
[['a', 'a', 'b'], ['aa', 'b']]
8
```
### javascript
```javascript
function countPartitions(text) {
  let count = 0;

  function explore(start) {
    if (start === text.length) {
      count++;
      return;
    }
    for (let end = start + 1; end <= text.length; end++) {
      const piece = text.slice(start, end);
      if (piece === [...piece].reverse().join("")) explore(end);
    }
  }

  explore(0);
  return count;
}

console.log(countPartitions("aab"), countPartitions("aaaa"), countPartitions("abc"));
```
Output:
```text
2 8 1
```

## quiz
1. When is a piece extended in palindrome partitioning?
   - [ ] When it is longer than one character
   - [x] Only when it reads the same forwards and backwards
   - [ ] When it starts with the first letter
   - [ ] Always
   > Non-palindromic pieces are pruned immediately.
2. How many partitions does the string aaaa have?
   - [ ] 4
   - [x] 8
   - [ ] 16
   - [ ] 2
   > Three gaps can each be cut or left, giving 2 to the power 3.
3. What makes the palindrome check constant time?
   - [ ] A hash of the string
   - [x] A table built by dynamic programming over substrings
   - [ ] Sorting the characters
   - [ ] Reversing the entire string
   > The table answers whether any range is a palindrome in O(1).
4. When should you use dynamic programming instead of backtracking here?
   - [ ] When all partitions must be printed
   - [x] When only the minimum number of cuts or a count is needed
   - [ ] When the string is empty
   - [ ] When letters are repeated
   > Enumeration is exponential while the count needs only a table.

# Constraint Propagation
kind: algorithm
time: Each propagation pass over an n by n puzzle costs polynomial time, such as O(n^4) for repeated candidate elimination on sudoku; combined with search it often turns an exponential search into a handful of steps.
space: O(n^3) for candidate sets of every cell in an n by n puzzle, such as 9 · 9 · 9 flags in sudoku.

## intro
Backtracking tries a value and discovers the contradiction later. Constraint propagation does the opposite: it uses the rules of the problem to remove impossible values before and during the search, so contradictions show up earlier and many decisions are forced. Combined with backtracking, it is how practical solvers handle puzzles, scheduling and configuration problems.

## theory
Vocabulary of constraint satisfaction problems (CSPs):

- Variables: the unknowns, such as the cells of a sudoku grid
- Domains: the possible values for each variable, such as the digits 1 to 9
- Constraints: the rules that relate variables, such as all cells of a row being different

Propagation techniques:

- Elimination of candidates: when a cell gets a value, remove that value from the candidate sets of every cell that shares a constraint with it
- Naked single: a cell whose candidate set has exactly one value must take it. In the sample sudoku the cell at row 0, column 2 has candidates 1, 2 and 4 initially, but repeated filling of cells that have a single candidate solves all 51 empty cells in 5 passes without any guessing, whereas plain backtracking needed 4208 placements.
- Hidden single: if a digit can go in only one cell of a row, column or box, that cell must take it, even if it has other candidates
- Arc consistency (AC-3): for every constraint between two variables, remove from one domain the values that have no compatible value in the other domain; repeat until nothing changes
- Forward checking: after assigning a variable during the search, remove the value from the domains of its neighbours and backtrack at once if any domain becomes empty
- Maintaining arc consistency (MAC): run arc consistency after every assignment for stronger pruning, at a higher cost per node

Search heuristics that work with propagation:

- Minimum remaining values: choose the variable with the smallest domain next, which is where contradictions appear soonest
- Degree heuristic: break ties by the number of constraints on unassigned neighbours
- Least constraining value: try first the value that rules out the fewest options for the neighbours

Trade-off: propagation costs time at every node, but the savings in search nodes are usually far larger. Stronger propagation (path consistency, global constraints like all-different) prunes more but costs more per call, so solvers pick a level that fits the problem.

Example scenario: a timetable where lessons conflict. After assigning a teacher to a slot, propagation removes that slot from the teacher's other lessons and from the lessons sharing the room, so the solver never tries those combinations.

Completeness: propagation alone may not solve a puzzle; when no further deductions are possible the solver chooses a variable, assigns a value and propagates, backtracking if a domain empties. This is the DPLL-style loop used by SAT solvers (unit propagation is propagation of single-literal clauses).

Implementation tips: keep domains as bitmasks for fast operations, store the changes made at each decision on a trail so they can be undone in the backtrack step, and detect failure as soon as a domain is empty.

## explain
1. Represent each variable with its set of possible values.
2. After each assignment, remove the value from the domains of related variables.
3. Whenever a domain has a single value, assign it and propagate again.
4. If a domain becomes empty, report a contradiction and backtrack.
5. When no more deductions are possible, pick the variable with the smallest domain and branch.
6. Record changes so that they can be undone when backtracking.

## example
The Python program computes the candidates for the sample sudoku cell at row 0, column 2 as `[1, 2, 4]`, then repeatedly fills every cell that has a single candidate: all 51 empty cells are filled after 5 passes, producing the first row 534678912. The JavaScript program lists the candidates for two cells: `1,2,4` for row 0, column 2 and `5` for the center cell, a single value that is a naked single.

## real
SAT solvers, scheduling engines, compilers that allocate registers and product configurators rely on propagation, and puzzle programs use it to rate the difficulty of sudoku by the techniques needed.

## pros
- Detects contradictions before deep search
- Can solve easy problems with no search at all
- Combines well with ordering heuristics

## cons
- Costs time at every node
- Stronger forms need more memory and code
- Does not solve every instance without branching

## uses
- Solving sudoku and similar puzzles
- Timetabling and resource assignment
- SAT solving with unit propagation
- Configuration and planning tools

## mistakes
- Forgetting to undo propagated removals when backtracking
- Propagating only once instead of until nothing changes
- Not checking for empty domains, which delays failure detection
- Using expensive propagation on tiny problems

## interview
**Q:** What is constraint propagation?
**A:** Using the constraints to remove impossible values from variable domains before or during search, so that forced assignments are made and contradictions are found early.

**Q:** What is the difference between forward checking and arc consistency?
**A:** Forward checking only removes the assigned value from the domains of the neighbours of the assigned variable, while arc consistency repeatedly removes any value that has no supporting value in a related variable, giving stronger pruning at higher cost.

**Q:** Which heuristic picks the next variable to branch on?
**A:** Minimum remaining values, choosing the variable with the fewest candidates, because it is the most likely to fail early.

## summary
Constraint propagation removes impossible values using the rules of the problem, so forced moves are made without search and dead ends appear early. Combined with minimum remaining values branching, it makes backtracking solvers dramatically faster.

## codenote
The Python sample solves a sudoku by naked singles alone. The JavaScript sample lists candidates for cells.

## code
### python
```python
PUZZLE = ["530070000", "600195000", "098000060", "800060003",
          "400803001", "700020006", "060000280", "000419005", "000080079"]
grid = [[int(ch) for ch in row] for row in PUZZLE]

def candidates(r, c):
    used = {grid[r][i] for i in range(9)} | {grid[i][c] for i in range(9)}
    top, left = 3 * (r // 3), 3 * (c // 3)
    used |= {grid[top + i][left + j] for i in range(3) for j in range(3)}
    return {v for v in range(1, 10) if v not in used}

print(sorted(candidates(0, 2)))
empty_before = sum(row.count(0) for row in grid)
passes = 0
while True:
    changed = False
    for r in range(9):
        for c in range(9):
            if grid[r][c] == 0:
                options = candidates(r, c)
                if len(options) == 1:
                    grid[r][c] = options.pop()
                    changed = True
    if not changed:
        break
    passes += 1
print(empty_before, sum(row.count(0) for row in grid), passes, "".join(map(str, grid[0])))
```
Output:
```text
[1, 2, 4]
51 0 5 534678912
```
### javascript
```javascript
const rows = ["530070000", "600195000", "098000060", "800060003",
  "400803001", "700020006", "060000280", "000419005", "000080079"].map((r) => [...r].map(Number));

function candidates(grid, r, c) {
  const used = new Set();
  for (let i = 0; i < 9; i++) {
    used.add(grid[r][i]);
    used.add(grid[i][c]);
  }
  const top = r - (r % 3);
  const left = c - (c % 3);
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) used.add(grid[top + i][left + j]);
  }
  const options = [];
  for (let v = 1; v <= 9; v++) {
    if (!used.has(v)) options.push(v);
  }
  return options;
}

console.log(candidates(rows, 0, 2).join(","), candidates(rows, 4, 4).join(","));
```
Output:
```text
1,2,4 5
```

## quiz
1. What does constraint propagation do?
   - [ ] Adds random values to variables
   - [x] Removes impossible values from domains using the constraints
   - [ ] Sorts the variables
   - [ ] Stops the search permanently
   > Forced assignments and early failures follow from smaller domains.
2. What is a naked single in sudoku?
   - [ ] A cell with all nine candidates
   - [x] A cell with exactly one remaining candidate
   - [ ] A digit that appears once in the puzzle
   - [ ] An empty row
   > That value must be placed in the cell.
3. What does minimum remaining values choose?
   - [ ] The largest domain
   - [x] The variable with the fewest candidates
   - [ ] The first variable in the list
   - [ ] A random variable
   > Small domains reveal contradictions soonest.
4. What must a solver do with propagated removals when it backtracks?
   - [ ] Keep them
   - [x] Undo them, usually using a recorded trail of changes
   - [ ] Double them
   - [ ] Print them
   > Otherwise values would stay wrongly removed in other branches.

# Pruning Strategies
kind: concept
time: Not an algorithmic topic — pruning changes how much of the search tree is visited, not the worst-case bound. For subset sum on 6 numbers, pruning cuts the visited nodes from 125 to 69 while finding the same 2 solutions.
space: Not an algorithmic topic — pruning rarely changes memory, which stays proportional to the recursion depth.

## intro
Pruning means cutting off a branch of the search tree as soon as it is certain that it cannot contain a solution, or a better one than the best known. Good pruning is the difference between a backtracking program that finishes in milliseconds and one that never finishes, so choosing and testing pruning rules is a core skill.

## theory
Types of pruning:

- Feasibility pruning: stop when the partial solution already violates a constraint, for example a running sum that exceeds the target when all values are positive, or a queen placed on an attacked square
- Reachability pruning: stop when the remaining choices cannot complete the solution, for example when the sum of all remaining values is too small to reach the target, or fewer numbers remain than are needed for a combination of size k
- Optimality pruning (bounding): in optimisation problems, stop when an optimistic estimate of the best possible completion is no better than the best solution found so far (the basis of branch and bound, covered in the next lesson)
- Symmetry pruning: skip branches that are mirror images or rotations of branches already explored, such as placing the first queen only in half of the first row
- Duplicate pruning: skip equal values at the same level so identical results are not generated twice, which needs sorted input
- Memoization of failed states: remember states known to fail so they are not searched again, which links backtracking to dynamic programming

Ordering: the order in which options are tried affects how soon good solutions or contradictions are found. Sorting candidates in increasing order lets the loop `break` at the first value that is too large for all later values too, a much stronger cut than `continue`. Trying the most constrained choice first makes failures appear early.

Worked example: count the subsets of `3, 34, 4, 12, 5, 2` that sum to 9. A plain include or exclude recursion calls itself 125 times and finds 2 solutions (4 + 5 and 3 + 4 + 2). If the numbers are first sorted and any branch whose sum already exceeds 9 is cut (all numbers are positive), the same 2 solutions are found with only 69 calls. Adding a reachability test (the sum of the remaining numbers plus the current sum must reach 9) cuts further on other inputs.

Rules for safe pruning:

- A prune must never remove a branch that contains a valid answer; justify each rule with a short argument (for example, all numbers are positive, so a sum above the target can never decrease)
- Test every pruning rule by comparing the result with the unpruned version on many small inputs; the answers must match and only the node count should change
- Measure: count the recursive calls in a debug variable to see the effect
- Apply cheap checks first and expensive checks later, and avoid pruning rules that cost more than the nodes they save

Limits: pruning cannot change the worst case for some inputs (for example when no branch can be cut until the leaves), and a rule that depends on non-negative values becomes wrong when negative numbers are allowed.

## explain
1. Write the unpruned backtracking solution first and verify it on small inputs.
2. List conditions that make a partial solution impossible to complete.
3. Add each condition as an early return, with a short proof of safety.
4. Sort or order the options so that cuts happen earlier.
5. Compare answers and node counts with and without pruning.
6. Keep only the rules that reduce the running time overall.

## example
The Python program counts the subsets of `3, 34, 4, 12, 5, 2` summing to 9 with and without pruning: both find 2 solutions, with 125 calls for the plain version and 69 for the pruned version. The JavaScript program runs the same experiment and prints `2 125 2 69`.

## real
Chess engines prune moves with alpha-beta cutoffs, SAT solvers prune with learned clauses, and route planners prune partial routes that already cost more than the best known route.

## pros
- Can reduce the search by orders of magnitude
- Keeps the answers identical when the rule is safe
- Easy to measure by counting calls

## cons
- A wrong rule silently loses valid solutions
- Rules depend on problem assumptions such as non-negative values
- Expensive checks may cost more than they save

## uses
- Speeding up subset sum and combination searches
- Cutting dead ends in puzzle solvers
- Pruning moves in game tree search
- Bounding partial costs in optimisation

## mistakes
- Pruning based on a property that is false for negative numbers
- Using continue where a break would cut all later options
- Never comparing pruned results with the plain version
- Applying checks that cost more than the saved work

## interview
**Q:** What is pruning in backtracking?
**A:** Abandoning a partial solution as soon as it is known that it cannot lead to a valid or better complete solution, so the entire subtree below it is skipped.

**Q:** How do you make sure a pruning rule is safe?
**A:** Argue that no valid solution can lie in the skipped branch, and test by comparing results with the unpruned search on many small random inputs.

**Q:** Why sort the candidates before a combination search?
**A:** Once a candidate is too large for the remaining target, all later candidates are too, so the loop can break instead of testing each one.

## summary
Pruning removes branches that cannot succeed, using feasibility, reachability, bounding, symmetry and duplicate rules. A safe rule changes only the number of nodes visited, so verify it against the unpruned search.

## codenote
The Python sample compares pruned and plain subset sum searches. The JavaScript sample runs the same experiment.

## code
### python
```python
def count_subsets(numbers, target, prune):
    values = sorted(numbers) if prune else numbers
    calls = found = 0

    def explore(index, total):
        nonlocal calls, found
        calls += 1
        if total == target:
            found += 1
            return
        if index == len(values):
            return
        if prune and total > target:
            return
        explore(index + 1, total + values[index])
        explore(index + 1, total)

    explore(0, 0)
    return found, calls

numbers = [3, 34, 4, 12, 5, 2]
print(count_subsets(numbers, 9, False), count_subsets(numbers, 9, True))
```
Output:
```text
(2, 125) (2, 69)
```
### javascript
```javascript
function countSubsets(numbers, target, prune) {
  const values = prune ? [...numbers].sort((a, b) => a - b) : numbers;
  let calls = 0;
  let found = 0;

  function explore(index, total) {
    calls++;
    if (total === target) {
      found++;
      return;
    }
    if (index === values.length) return;
    if (prune && total > target) return;
    explore(index + 1, total + values[index]);
    explore(index + 1, total);
  }

  explore(0, 0);
  return [found, calls];
}

const numbers = [3, 34, 4, 12, 5, 2];
console.log(countSubsets(numbers, 9, false).join(" "), countSubsets(numbers, 9, true).join(" "));
```
Output:
```text
2 125 2 69
```

## quiz
1. What is the purpose of pruning?
   - [ ] To change the answers
   - [x] To skip branches that cannot lead to a solution
   - [ ] To make recursion iterative
   - [ ] To sort the output
   > The skipped subtrees save the time of exploring them.
2. When is a sum-exceeds-target prune valid?
   - [ ] When values can be negative
   - [x] When all values are non-negative, so sums cannot decrease
   - [ ] Never
   - [ ] Only for even targets
   > A negative value could bring a large sum back down.
3. Why does sorting help pruning?
   - [ ] It removes duplicates automatically
   - [x] A too-large candidate lets the loop break for all later candidates
   - [ ] It makes the target smaller
   - [ ] It reduces the recursion depth
   > Later candidates in sorted order are at least as large.
4. How do you check that a pruning rule is safe?
   - [ ] Run it once
   - [x] Compare its results with the unpruned search on many small inputs
   - [ ] Measure only the time
   - [ ] Read it carefully without running
   > The answers must match while the node count drops.

# Branch and Bound Intro
kind: algorithm
time: Exponential in the worst case, but a good bound cuts the tree sharply; the 0/1 knapsack example with 10 items explores 11 nodes instead of the 2047 nodes of the full tree.
space: O(n) for the depth-first version, and larger for best-first versions that keep a priority queue of open nodes.

## intro
Branch and bound is backtracking for optimisation problems. It branches into subproblems as usual, but keeps track of the best complete solution found so far and computes, for each partial solution, a bound that says how good any completion could possibly be. If even the optimistic bound cannot beat the best known solution, the whole branch is discarded.

## theory
Ingredients:

- Branching rule: how a node splits into children (include or exclude an item, assign a task to a worker, visit the next city)
- Bound: a fast calculation of the best possible value in a subtree. For maximisation it must be an upper bound that never underestimates the true best; for minimisation, a lower bound that never overestimates.
- Incumbent: the best complete solution found so far; the bound of a node is compared with it
- Pruning rule: discard a node if its bound is not better than the incumbent

A good bound is tight (close to the real optimum) and cheap to compute. A loose bound prunes little; an expensive bound may cost more than it saves.

Knapsack example. For the 0/1 knapsack the standard bound relaxes the problem to the fractional knapsack: take the remaining items in order of value per weight and allow a fraction of the last one. That is solved greedily in linear time and never underestimates the integer optimum. For items (value, weight) = (60, 10), (100, 20), (120, 30) and capacity 50 the search finds the optimum 220 after exploring 13 nodes. For a ten-item instance with capacity 20, the search finds the optimum 195 after only 11 nodes, while the complete tree has 2047 nodes, because after the first greedy descent the incumbent is already good and the fractional bound rules out almost all other branches.

Assignment example. Assigning 4 workers to 4 tasks with cost matrix rows `9 2 7 8`, `6 4 3 7`, `5 8 1 8` and `7 6 9 4` has 24 complete assignments. Depth-first search that abandons any partial assignment whose cost already reaches the best complete cost explores 40 nodes instead of the 65 nodes of the full tree and finds the minimum total cost 13.

Search strategies:

- Depth-first: low memory, finds a first incumbent quickly, can waste time in poor regions
- Best-first: always expand the node with the best bound using a priority queue; it expands the fewest nodes for a given bound but may use a lot of memory
- Iterative variants and heuristics ordering children by promise, so that good solutions are found early

Applications: integer programming (the foundation of solvers like CBC and Gurobi, combined with linear programming relaxations and cutting planes), travelling salesman, job scheduling, knapsack variants and many logistics problems.

Relation to other methods: it is backtracking plus bounding; with dynamic programming, it competes when the state space is huge but good bounds exist; with A* search, which is best-first search where the bound is the cost so far plus an admissible heuristic estimate.

Correctness requires the bound to be valid: a bound that sometimes underestimates (for maximisation) can prune the real optimum.

## explain
1. Define the branching rule and what a complete solution is.
2. Find an easy relaxation that gives a valid bound for a partial solution.
3. Keep the best complete solution found so far.
4. Before expanding a node, compare its bound with the incumbent and discard it if it cannot do better.
5. Update the incumbent whenever a better complete solution is found.
6. Choose depth-first or best-first order depending on memory and bound quality.

## example
The Python program solves the knapsack for items (60, 10), (100, 20), (120, 30) and capacity 50, returning 220 after 13 nodes, and then a ten-item instance returning 195 after 11 nodes compared with the full tree size of 2047. The JavaScript program prunes by current cost for a 4 by 4 assignment problem and prints the minimum cost and node count `13 40`.

## real
Industrial optimisation solvers use branch and bound as their core engine, and delivery companies, airlines and chip designers rely on it for routing, crew assignment and layout problems.

## pros
- Finds exact optimal solutions with pruned search
- Works with any valid bound
- Can stop early with a guaranteed gap to the optimum

## cons
- Worst-case time is still exponential
- Needs a good bound for the problem
- Best-first versions can use large amounts of memory

## uses
- Exact solutions to knapsack and assignment problems
- Integer programming solvers
- Travelling salesman for small instances
- Scheduling and routing optimisation

## mistakes
- Using a bound that can underestimate in a maximisation problem
- Updating the incumbent incorrectly so a better solution is lost
- Computing an expensive bound at every node without checking the benefit
- Forgetting that the first complete solution found is not necessarily the best

## interview
**Q:** What is the difference between backtracking and branch and bound?
**A:** Backtracking prunes branches that violate constraints, while branch and bound also prunes branches whose best possible value, given by a bound, cannot beat the best solution found so far in an optimisation problem.

**Q:** What makes a good bound?
**A:** It must be valid (never worse than the true best in the subtree) and as tight and cheap to compute as possible, such as the fractional relaxation for knapsack.

**Q:** When would you use best-first instead of depth-first branch and bound?
**A:** When good bounds make the number of expanded nodes the main cost and memory allows a priority queue, since it expands only nodes whose bound is better than the optimum.

## summary
Branch and bound searches an optimisation tree depth or best first and discards nodes whose bound cannot beat the incumbent. A valid, tight and cheap bound, such as the fractional knapsack relaxation, makes exact solutions possible for much larger inputs.

## codenote
The Python sample solves knapsack with a fractional bound. The JavaScript sample prunes an assignment search by cost.

## code
### python
```python
def knapsack_bb(items, capacity):
    items = sorted(items, key=lambda item: item[0] / item[1], reverse=True)
    state = {"best": 0, "nodes": 0}

    def bound(index, value, weight):
        total, room = value, capacity - weight
        for v, w in items[index:]:
            if w <= room:
                total += v
                room -= w
            else:
                return total + v * room / w
        return total

    def explore(index, value, weight):
        state["nodes"] += 1
        if weight > capacity:
            return
        state["best"] = max(state["best"], value)
        if index == len(items) or bound(index, value, weight) <= state["best"]:
            return
        explore(index + 1, value + items[index][0], weight + items[index][1])
        explore(index + 1, value, weight)

    explore(0, 0, 0)
    return state["best"], state["nodes"]

print(knapsack_bb([(60, 10), (100, 20), (120, 30)], 50))
big = [(10, 5), (40, 4), (30, 6), (50, 3), (25, 2), (15, 7), (35, 5), (20, 4), (45, 6), (5, 1)]
best, nodes = knapsack_bb(big, 20)
print(best, nodes, 2 ** (len(big) + 1) - 1)
```
Output:
```text
(220, 13)
195 11 2047
```
### javascript
```javascript
function cheapestAssignment(cost) {
  const n = cost.length;
  const used = Array(n).fill(false);
  let best = Infinity;
  let nodes = 0;

  function explore(row, sum) {
    nodes++;
    if (sum >= best) return;
    if (row === n) {
      best = sum;
      return;
    }
    for (let col = 0; col < n; col++) {
      if (used[col]) continue;
      used[col] = true;
      explore(row + 1, sum + cost[row][col]);
      used[col] = false;
    }
  }

  explore(0, 0);
  return [best, nodes];
}

console.log(cheapestAssignment([[9, 2, 7, 8], [6, 4, 3, 7], [5, 8, 1, 8], [7, 6, 9, 4]]).join(" "));
```
Output:
```text
13 40
```

## quiz
1. What does branch and bound add to backtracking?
   - [ ] Sorting
   - [x] A bound on the best possible value of each partial solution
   - [ ] Parallel threads
   - [ ] A hash table
   > Nodes whose bound cannot beat the best known solution are discarded.
2. What must a bound for a maximisation problem satisfy?
   - [ ] It must be exact
   - [x] It must never be lower than the true best value in the subtree
   - [ ] It must be an integer
   - [ ] It must be random
   > Otherwise the optimum could be pruned away.
3. Which relaxation gives the standard bound for the 0/1 knapsack?
   - [ ] Doubling the capacity
   - [x] Allowing fractions of items, as in the fractional knapsack
   - [ ] Removing the heaviest item
   - [ ] Sorting by weight
   > The fractional optimum is an upper bound on the integer optimum.
4. What is the incumbent?
   - [ ] The first node of the tree
   - [x] The best complete solution found so far
   - [ ] The bound of the root
   - [ ] The last node visited
   > New nodes are compared with it before expansion.

# Backtracking Complexity
kind: concept
time: Not an algorithmic topic — the cost of backtracking is the size of the search tree it visits. Typical counts are 2^n for subsets, n! for permutations, and for 8 queens only 2057 nodes instead of 8^8 = 16,777,216 candidate boards.
space: Not an algorithmic topic — backtracking memory is the recursion depth, O(n) for most problems, plus any stored results.

## intro
Backtracking looks simple, but its running time is hard to state with one formula because it depends on the pruning. The honest way to analyse it is to count the nodes in the search tree: the number of choices at each level and how deep the tree goes, adjusted for the branches that are cut. Knowing the numbers tells you when backtracking is feasible and when you need another method.

## theory
Upper bound without pruning: if every level has b choices and the depth is d, the tree has about b^d leaves. Typical shapes:

- Subsets: 2 choices per element and depth n, so 2^n leaves; with copying, O(n · 2^n) time
- Permutations: n choices at the first level, n − 1 at the second and so on, so n! leaves; the total number of nodes is about e · n!
- Combinations of size k from n: C(n, k) leaves, which is at most 2^n
- Assignment of m colours to n vertices: m^n leaves before pruning
- Grid path of length L with up to 4 moves: 4^L, tightened to about 3^L when stepping back is not allowed

Growth of the main counts: 2^n for n = 5, 10, 15 and 20 is 32, 1024, 32768 and 1048576, while n! for the same values is 120, 3628800, 1307674368000 and 2432902008176640000. Factorial growth is much worse: feasible up to about n = 11 or 12, whereas 2^n is feasible up to about 25 to 30.

Effect of pruning. The n queens search shows how the tree actually shrinks. Counting every recursive call, the search visits 17 nodes for n = 4, 153 for n = 6 and 2057 for n = 8. Without the attack checks, placing one queen per row independently would give 8^8 = 16,777,216 boards, and requiring different columns gives 8! = 40,320 permutations. The pruned search is therefore thousands of times smaller than the naive tree, although it still grows roughly exponentially with n.

How to estimate the pruned size:

- Instrument the code with a counter for recursive calls and run small cases; plot or tabulate the growth
- Use Knuth's Monte Carlo estimator: follow random root-to-leaf paths and multiply the number of children at each level to estimate the tree size
- Reason about the branching factor after constraints: the average number of valid children per node

Time per node: total cost is nodes times the work done in each node. n queens with set checks costs O(1) per candidate, while a version that scans the board costs O(n), which multiplies the total. Copying results costs extra for output-heavy problems, as in subsets and permutations.

Space: depth of the recursion times the size of the stack frame plus the partial solution, so O(n) for most problems, plus the stored output if results are collected.

When backtracking is the wrong tool:

- Subproblems repeat many times (counting paths, edit distance, knapsack with moderate weights): use dynamic programming or memoization
- A greedy rule is provably optimal: use it
- The problem is an optimisation with a good bound: use branch and bound
- Only a count is required and a formula exists: use the formula, such as the binomial coefficient for combinations
- The input is large and an approximate answer is enough: use heuristics or local search

Reporting complexity in interviews: say "O(n · n!) because there are n! leaves and recording each costs O(n)" rather than only "exponential", mention the recursion depth for space, and note what pruning would do in practice.

## explain
1. Identify the number of choices at each level and the depth of the tree.
2. Multiply to get the unpruned number of leaves, such as 2^n or n!.
3. Estimate the cost per node, including copying and validity checks.
4. Consider the effect of pruning by counting nodes on small inputs.
5. Add the recursion depth as the space cost, plus stored output.
6. Decide whether dynamic programming, greedy or bounding is a better fit.

## example
The Python program counts the nodes visited by the n queens search: 17, 153 and 2057 for n = 4, 6 and 8, compared with 16,777,216 unpruned boards, and prints the first factorials and powers of two. The JavaScript program prints 2^n and n! side by side for n = 5, 10, 15 and 20.

## real
Estimating the size of a search tree decides whether a solver in logistics, games or verification will finish in seconds or in centuries, and engineers use node counters when tuning pruning rules.

## pros
- Counting nodes gives an honest cost estimate
- Makes the benefit of pruning measurable
- Guides the choice between algorithms

## cons
- Pruned tree sizes are hard to predict analytically
- Worst-case bounds can be far from typical behaviour
- Factorial and exponential growth limit all exact methods

## uses
- Estimating whether a search will finish
- Comparing pruning rules by node counts
- Choosing between backtracking and dynamic programming
- Explaining complexity in interviews

## mistakes
- Stating only that backtracking is exponential without the base
- Ignoring the cost of copying results in the time bound
- Forgetting the recursion stack when counting space
- Using backtracking when memoization would remove repeated work

## interview
**Q:** What is the time complexity of generating all permutations of n items?
**A:** O(n · n!) because there are n! permutations and each one costs O(n) to record, with O(n) stack space.

**Q:** Why is the n queens search far cheaper than 8 to the power 8?
**A:** The conflict checks reject attacked squares immediately, so entire subtrees are skipped; for n = 8 only 2057 nodes are visited.

**Q:** How can you estimate how long a backtracking search will take?
**A:** Count the nodes on small instances to see the growth, or sample random root-to-leaf paths and multiply the number of children at each level to estimate the tree size.

## summary
The cost of backtracking is the number of search tree nodes times the work per node: 2^n for subsets, n! for permutations, and far fewer once pruning is applied. Measure the node count and switch to dynamic programming, greedy or branch and bound when the structure allows it.

## codenote
The Python sample counts n queens nodes and lists growth tables. The JavaScript sample prints exponential and factorial values.

## code
### python
```python
import math

def queens_nodes(n):
    columns, diagonals, anti = set(), set(), set()
    nodes = 0

    def place(row):
        nonlocal nodes
        nodes += 1
        if row == n:
            return
        for col in range(n):
            if col in columns or row - col in diagonals or row + col in anti:
                continue
            columns.add(col)
            diagonals.add(row - col)
            anti.add(row + col)
            place(row + 1)
            columns.remove(col)
            diagonals.remove(row - col)
            anti.remove(row + col)

    place(0)
    return nodes

print([queens_nodes(n) for n in (4, 6, 8)], 8 ** 8)
print([math.factorial(n) for n in range(1, 9)])
print([2 ** n for n in range(1, 9)])
```
Output:
```text
[17, 153, 2057] 16777216
[1, 2, 6, 24, 120, 720, 5040, 40320]
[2, 4, 8, 16, 32, 64, 128, 256]
```
### javascript
```javascript
function factorial(n) {
  return n <= 1 ? 1 : n * factorial(n - 1);
}

console.log([5, 10, 15, 20].map((n) => 2 ** n + "/" + factorial(n)).join(" "));
```
Output:
```text
32/120 1024/3628800 32768/1307674368000 1048576/2432902008176640000
```

## quiz
1. How many leaves does the unpruned permutation tree of n items have?
   - [ ] 2^n
   - [x] n!
   - [ ] n squared
   - [ ] n log n
   > The number of choices shrinks by one at each level.
2. How many nodes does the pruned 8 queens search visit?
   - [ ] 16,777,216
   - [x] 2057
   - [ ] 40,320
   - [ ] 64
   > Conflict checks cut almost the whole naive tree.
3. How is the total time of backtracking estimated?
   - [ ] By the input size alone
   - [x] As the number of nodes visited times the work per node
   - [ ] By the recursion depth
   - [ ] By the length of the output only
   > Both the tree size and per-node costs matter.
4. When is dynamic programming better than backtracking?
   - [ ] When all solutions must be listed
   - [x] When subproblems repeat so their results can be reused
   - [ ] When the tree is small
   - [ ] When recursion is not allowed
   > Memoization removes repeated work that backtracking would redo.
