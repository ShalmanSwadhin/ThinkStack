# Game Theory Basics
kind: concept
time: Not an algorithmic topic — game theory is a modelling framework. Solving a small impartial game by memoised search costs O(states times moves), and many classic games collapse to O(1) formulas.
space: Not an algorithmic topic — a memo table for win and loss positions uses O(states) space.

## intro
Game theory studies decisions when the outcome depends on what another player does too. In programming problems the usual setting is a two-player game with perfect information in which both sides play optimally and someone eventually cannot move. The task is to decide who wins from a given start, and a small set of ideas settles most such questions.

## theory
Game model used in interviews and contests: two players alternate moves, the game is finite, there is no hidden information and no chance, and the player who cannot move loses (normal play). If the last mover loses instead, it is called misère play. Games where both players have the same moves from every position are impartial; games where moves depend on the player, like chess, are partisan.

Winning and losing positions: label every position either N (the player to move wins, "next player") or P (the player to move loses, "previous player wins").

- A position with no moves is P
- A position is N if at least one move leads to a P position
- A position is P if every move leads to an N position

This recursive definition is correct because the game is finite and acyclic, so labels can be computed from terminal positions upward.

Example, the subtraction game: a pile of n stones, a move removes 1, 2 or 3 stones, the player taking the last stone wins. Position 0 is P. Positions 1, 2 and 3 are N since they move to 0. Position 4 is P, since all moves lead to 1, 2 or 3. In general n is P exactly when n is a multiple of 4: if the opponent leaves a multiple of 4, whatever you take, you can answer by taking the complement to 4.

Strategy ideas:

- Symmetry strategy: the second player copies or mirrors the first player's move (a coin game on a round table)
- Pairing strategy: group positions into pairs and always answer in the pair
- Strategy stealing: for some games a second-player win would let the first player steal it, proving the first player cannot lose (without constructing the strategy)
- Invariants: keep a quantity such as the pile size modulo 4 under control

Algorithmic solution: memoised recursion over positions. For subtraction games with move set S, `win[n] = any(not win[n − s] for s in S if s ≤ n)`. For a few thousand positions that is instantaneous. When the state space is large, find a pattern by printing the first positions: many games have a periodic pattern, as the subtraction game with period 4 shows. Larger structures use Sprague-Grundy numbers (see the lessons on Nim and Grundy numbers) to combine independent sub-games.

Beyond the win and lose classification:

- Minimax for scoring games (next lessons)
- Zero-sum games: one player's gain is the other's loss; payoff matrices and saddle points
- Nash equilibrium: a set of strategies where no player gains by deviating alone; the prisoner's dilemma has defection as its equilibrium although cooperation is better for both
- Mixed strategies: randomising between options (rock-paper-scissors has the uniform mixture as equilibrium)
- Cooperative and repeated games, auction design and mechanism design in economics
- Combinatorial game theory: sums of games, surreal numbers, Hackenbush

Applications: competitive programming game problems, AI for board games (search with evaluation), economics and auctions, network protocols with selfish agents, security games and multi-agent reinforcement learning.

Pitfalls: mixing up who moves last and who wins, forgetting misère variants, assuming optimal play for both sides when the problem says otherwise, state spaces that are too big for memoisation, and cycles in the game graph (positions can repeat, so plain labeling needs retrograde analysis).

Testing: print the win table for small n, compare with the proposed formula, and brute force every starting position up to a limit.

## explain
1. Fix the rules: who moves, how the game ends and who wins.
2. Mark terminal positions as losing for the player to move.
3. Mark a position winning if it has a move to a losing position.
4. Mark a position losing if all of its moves lead to winning positions.
5. Print the table for small sizes and look for a period or formula.
6. Use Grundy values when the game splits into independent parts.

## example
The Python program labels the subtraction game with moves 1, 2 and 3 up to 20, shows that the losing positions are the multiples of 4, repeats the analysis for moves 1 and 4 (losing positions 0, 2, 5, 7, 10, ...), and plays a short game optimally. The JavaScript program computes the 1-or-2 stone game and shows that the second player wins exactly when the pile is a multiple of 3.

## real
Game-playing programs, auction and pricing models, and security analyses all begin with exactly this classification of positions.

## pros
- A small recursive definition solves many puzzles
- Patterns and formulas often replace search
- The ideas carry over to AI and economics

## cons
- State spaces can be huge
- Rules variations change the answer
- Real opponents are not always optimal

## uses
- Deciding the winner of two-player puzzles
- Designing game AI
- Modelling competition and auctions
- Finding periodic winning patterns

## mistakes
- Confusing normal play with misère play
- Mislabeling terminal positions
- Ignoring cycles in the position graph
- Assuming a pattern holds without testing it

## interview
**Q:** How do you decide whether the first player wins a finite impartial game?
**A:** Label terminal positions as losing for the player to move, then a position is winning if some move reaches a losing position and losing if all moves reach winning positions.

**Q:** Who wins the subtraction game with moves 1 to 3 and n stones?
**A:** The first player wins unless n is a multiple of 4, because the winner can always restore a multiple of 4 after each opposing move.

**Q:** What is a Nash equilibrium?
**A:** A combination of strategies in which no player can improve their own payoff by changing only their own strategy.

## summary
Two-player perfect information games are solved by labeling positions as winning or losing from the end backwards, and many games reduce to patterns, symmetry or invariants. Nash equilibria and mixed strategies extend the ideas to simultaneous play.

## codenote
The Python sample computes win tables for two subtraction games and a perfect play. The JavaScript sample prints the pile sizes lost by the first player.

## code
### python
```python
def win_table(limit, moves):
    win = [False] * (limit + 1)
    for n in range(1, limit + 1):
        win[n] = any(not win[n - m] for m in moves if m <= n)
    return win

table = win_table(20, (1, 2, 3))
print([n for n in range(21) if not table[n]])
table = win_table(20, (1, 4))
print([n for n in range(21) if not table[n]])

def play(n, moves):
    win = win_table(n, moves)
    path = [n]
    turn = 0
    while n > 0:
        choice = next((m for m in moves if m <= n and not win[n - m]), min(m for m in moves if m <= n))
        n -= choice
        path.append(n)
        turn ^= 1
    return path, "first" if turn == 1 else "second"

print(play(10, (1, 2, 3)))
```
Output:
```text
[0, 4, 8, 12, 16, 20]
[0, 2, 5, 7, 10, 12, 15, 17, 20]
([10, 8, 7, 4, 3, 0], 'first')
```
### javascript
```javascript
// Players alternately take 1 or 2 stones and the last stone wins; find the piles lost by the first player.
function secondPlayerWins(n) {
  const win = [false];
  for (let i = 1; i <= n; i++) win[i] = [1, 2].some((m) => m <= i && !win[i - m]);
  return !win[n];
}

console.log([0, 1, 2, 3, 4, 5, 6, 9, 12].map((n) => n + ":" + secondPlayerWins(n)).join(" "));
```
Output:
```text
0:true 1:false 2:false 3:true 4:false 5:false 6:true 9:true 12:true
```

## quiz
1. What is the status of a position with no legal moves under normal play?
   - [ ] Winning for the player to move
   - [x] Losing for the player to move
   - [ ] A draw
   - [ ] Undefined
   > The player who cannot move loses.
2. When is a position winning?
   - [ ] When all moves lead to winning positions
   - [x] When some move leads to a losing position
   - [ ] When it has no moves
   - [ ] When the pile is odd
   > The mover can send the opponent to a lost position.
3. Which starting piles are lost for the first player in the 1-2-3 subtraction game?
   - [ ] Odd piles
   - [x] Multiples of 4
   - [ ] Primes
   - [ ] Powers of two
   > The opponent keeps restoring a multiple of 4.
4. What does a Nash equilibrium describe?
   - [ ] The best joint outcome
   - [x] Strategies where no player gains by deviating alone
   - [ ] A game with no moves
   - [ ] A winning first move
   > It is stable against single player deviations.

# Nim Game Analysis
kind: algorithm
time: O(k) to decide a position with k piles by XOR-ing the pile sizes, and O(k) more to find a winning move.
space: O(1) beyond the pile list.

## intro
Nim is the model that explains all impartial games. There are several piles of stones, players alternate removing any positive number of stones from one pile, and the player who takes the last stone wins. Despite the large number of positions the winner is decided by a single XOR of the pile sizes, an elegant result proved by Charles Bouton in 1901.

## theory
Theorem (Bouton): let `s = a1 XOR a2 XOR ... XOR ak` be the nim-sum of the pile sizes. The position is losing (P) for the player to move exactly when s = 0. Otherwise the player to move can win.

Proof idea:

- The terminal position (all piles empty) has nim-sum 0 and is lost for the mover
- From a position with s = 0, any move changes exactly one pile and therefore changes the XOR, so the opponent faces a nonzero nim-sum
- From a position with s ≠ 0, there is always a move to nim-sum 0: take the highest set bit of s; some pile has that bit set; reduce this pile from a to `a XOR s`, which is smaller than a because that bit is cleared

Winning move: find a pile with `a XOR s < a` and remove `a − (a XOR s)` stones. Example: piles 3, 4, 5 have nim-sum 3 XOR 4 XOR 5 = 2, so the first player wins. The pile 3 satisfies 3 XOR 2 = 1 < 3, so remove 2 stones from the pile 3, leaving 1, 4, 5 with nim-sum 0. Piles 1, 2, 3 have nim-sum 0 and lose for the mover.

Special cases:

- One pile: the first player takes all and wins
- Two piles: first player wins unless the piles are equal (mirror strategy)
- Piles of size 1 only: the parity of the number of piles decides

Misère Nim (last stone loses): play as normal Nim until every pile has size at most 1 is about to occur. If some pile has at least two stones, the winning strategy is the same as in normal play (nim-sum zero is lost for the mover) except when all piles are of size at most 1 after the move, where the parity is reversed. The rule: if all piles are 0 or 1, the player to move wins exactly when the number of 1-piles is even; otherwise use the normal rule.

Variants:

- Staircase Nim: stones on stairs move down one step; only the odd-numbered steps matter, so the answer is the XOR of piles at odd positions
- Moore's Nim_k: remove from up to k piles at once; write pile sizes in binary and check that each bit column sum is divisible by k + 1
- Subtraction restrictions and bounded moves: use Grundy numbers
- Wythoff's game (two piles, may take equally from both): losing positions come from the golden ratio

Connection to other games (Sprague-Grundy theorem): every impartial game position is equivalent to a Nim pile of some size, its Grundy number. The sum of independent games is decided by the XOR of their Grundy numbers, so Nim analysis is the universal tool; see the next lesson.

Applications: contest problems about stone games, analysis of take-away games, and teaching examples of invariants and XOR tricks. In interviews, the XOR criterion and constructing the winning move are the usual questions.

Pitfalls: forgetting that the last stone wins (versus loses), applying the XOR formula to games whose piles interact (for example moves that split piles require Grundy numbers), mistaking the nim-sum for the sum, and reducing a pile to a larger value when searching for a move.

Testing: brute force win tables for small piles and compare with the XOR rule for every position with up to three piles of size at most 10.

## explain
1. Compute the XOR of all pile sizes.
2. If the result is zero, the player to move loses against perfect play.
3. Otherwise find the highest set bit of the XOR.
4. Choose a pile that has that bit set and reduce it to the pile XOR the nim-sum.
5. Remove the difference from that pile.
6. Verify the new nim-sum is zero.

## example
The Python program decides Nim positions by the XOR rule, finds the winning move for piles 3, 4, 5, and checks the rule against a brute force solver for every position with three piles up to size 6. The JavaScript program plays a full game in which a perfect player beats a naive one.

## real
Nim and its variants are the standard teaching and testing ground for combinatorial game solvers, and the XOR criterion appears in many programming contests.

## pros
- A one-line criterion decides the winner
- The winning move is constructive
- It underlies all impartial games

## cons
- Misère play needs a special case
- Variants with splitting moves need Grundy numbers
- XOR reasoning is not obvious without the proof

## uses
- Deciding take-away and stone games
- Building the winning move
- Analysing staircase and Moore variants
- Teaching invariants

## mistakes
- Using the sum rather than the XOR of pile sizes
- Forgetting the exception in misère Nim
- Applying the rule to games where moves split piles
- Reducing a pile above its current size

## interview
**Q:** Who wins Nim with piles of sizes 3, 4 and 5?
**A:** The first player, since the XOR 3 xor 4 xor 5 is 2, nonzero; reducing the pile of 3 to 1 gives nim-sum zero.

**Q:** How do you prove a position with zero nim-sum is lost?
**A:** Any move changes one pile and so changes the XOR to nonzero, while from a nonzero nim-sum there is always a move back to zero, and the empty position has zero.

**Q:** How does misère Nim differ?
**A:** Play like normal Nim until all remaining piles would have size at most one, then reverse the parity decision: the mover wins when the number of single-stone piles is even.

## summary
Nim positions are lost for the mover exactly when the XOR of pile sizes is zero, and a winning move reduces one pile to its size XOR the nim-sum. Misère play needs a small correction, and Nim is the model for all impartial games.

## codenote
The Python sample finds moves and checks by brute force. The JavaScript sample plays a perfect player against a naive one.

## code
### python
```python
from functools import lru_cache
from itertools import product
from functools import reduce

def nim_sum(piles):
    return reduce(lambda a, b: a ^ b, piles, 0)

def winning_move(piles):
    s = nim_sum(piles)
    if s == 0:
        return None
    for i, a in enumerate(piles):
        if a ^ s < a:
            return i, a - (a ^ s)

print(nim_sum([3, 4, 5]), winning_move([3, 4, 5]), winning_move([1, 2, 3]))

@lru_cache(maxsize=None)
def wins(piles):
    for i, a in enumerate(piles):
        for take in range(1, a + 1):
            nxt = tuple(sorted(piles[:i] + (a - take,) + piles[i + 1:]))
            if not wins(nxt):
                return True
    return False

print(all(wins(tuple(sorted(p))) == (nim_sum(p) != 0) for p in product(range(7), repeat=3)))
print(wins((1, 1, 1)), wins((2, 2)), wins((5,)))
```
Output:
```text
2 (0, 2) None
True
True False True
```
### javascript
```javascript
const nimSum = (piles) => piles.reduce((a, b) => a ^ b, 0);

function perfectMove(piles) {
  const s = nimSum(piles);
  if (s === 0) return { pile: piles.findIndex((p) => p > 0), take: 1 };
  const pile = piles.findIndex((p) => (p ^ s) < p);
  return { pile, take: piles[pile] - (piles[pile] ^ s) };
}

const piles = [7, 5, 9, 3];
let turn = 0;
const log = [];
while (nimSum(piles) !== 0 || piles.some((p) => p > 0)) {
  if (piles.every((p) => p === 0)) break;
  let move;
  if (turn === 0) move = perfectMove(piles);
  else {
    const pile = piles.findIndex((p) => p > 0);
    move = { pile, take: 1 };
  }
  piles[move.pile] -= move.take;
  log.push(turn === 0 ? "P" : "N");
  turn ^= 1;
}
console.log(log.length, "last mover:", log[log.length - 1], piles.join(","));
```
Output:
```text
15 last mover: P 0,0,0,0
```

## quiz
1. When is a Nim position lost for the player to move?
   - [ ] When the total number of stones is even
   - [x] When the XOR of the pile sizes is zero
   - [ ] When there are two piles
   - [ ] When the largest pile is odd
   > Every move from nim-sum zero produces a nonzero nim-sum.
2. What is the nim-sum of piles 3, 4 and 5?
   - [ ] 12
   - [x] 2
   - [ ] 0
   - [ ] 6
   > 3 xor 4 equals 7 and 7 xor 5 equals 2.
3. How is the winning move found?
   - [ ] Take one stone
   - [x] Reduce a pile a to a XOR s where s is the nim-sum and the result is smaller
   - [ ] Take the largest pile
   - [ ] Halve every pile
   > This makes the new nim-sum zero.
4. Who wins two equal piles?
   - [ ] The first player
   - [x] The second player, by mirroring
   - [ ] Nobody
   - [ ] Depends on the size parity
   > The XOR of equal numbers is zero.

# Grundy Numbers Intro
kind: algorithm
time: O(states times moves) to compute the Grundy value of every position by memoised search; combining independent games costs one XOR per component.
space: O(states) for the table of Grundy values.

## intro
Nim has a neat XOR rule, but most games are not played on plain piles. The Sprague-Grundy theorem says that every impartial game position behaves exactly like a Nim pile of some size called its Grundy number. Once you can compute that number for the pieces of a game, the XOR of the numbers tells you who wins the combined game.

## theory
Mex: the minimum excludant of a set of non-negative integers is the smallest non-negative integer not in the set. mex({0, 1, 3}) = 2, mex({}) = 0, mex({1, 2}) = 0.

Grundy number of a position: `g(position) = mex({g(next) for each position reachable in one move})`. A position with no moves has g = 0. A position has g = 0 exactly when it is losing for the player to move.

Example: the subtraction game with moves 1 and 2. g(0) = 0. g(1) = mex({g(0)}) = mex({0}) = 1. g(2) = mex({g(1), g(0)}) = mex({1, 0}) = 2. g(3) = mex({g(2), g(1)}) = mex({2, 1}) = 0. g(4) = mex({g(3), g(2)}) = mex({0, 2}) = 1. The values repeat 0, 1, 2 with period 3, so g(n) = n mod 3.

Sum of games: if a game is a collection of independent components and a move acts on exactly one component, its Grundy number is the XOR of the components' Grundy numbers. The sum is losing for the mover exactly when that XOR is zero. This generalises Nim, where a pile of size a has g = a.

Why it works: from any position with g = v, you can move to a position with every smaller value 0..v−1 (that is the definition of mex), and never to one with value v. This is exactly the behaviour of a Nim pile of size v.

Algorithm:

- Define states and moves
- Compute g by recursion with memoisation or bottom-up in order of dependency
- Combine components with XOR
- If the result is nonzero find a component and a move that makes the XOR zero (reduce one component to the Grundy value `g XOR total`)

Examples with larger value sets:

- Game where a move removes any number of stones from 1 to k: g(n) = n mod (k + 1)
- Game where a pile can be split into two smaller non-empty piles (Lasker's Nim: remove any number or split into two piles): the values follow a pattern with g(4k+1) = 4k+1, g(4k+2) = 4k+2, g(4k+3) = 4k+4, g(4k+4) = 4k+3
- Kayles (knock down one or two adjacent pins in a row): Grundy numbers are periodic with period 12 after the first 71 values
- Grid and graph games: a token moving along a directed acyclic graph has g equal to the mex over successors; several tokens form a sum
- Cutting a stick or strip game: removing a segment splits a row into two independent rows, so g of a row is the mex of g(left) XOR g(right) over all moves

Complexity: for a game with state count S and at most M moves per state, memoised computation costs O(S·M). For piles up to n with splitting, it is O(n²) per pile size. When values show a pattern, extrapolate after verifying by brute force.

Applications: contest problems with several independent games on one board, combinatorial puzzles, analysis of impartial games on graphs and certain AI planning problems with decomposable structure.

Limitations: the theorem needs impartial games with normal play and independent components, and does not apply to partisan games (use surreal numbers) or to misère games in general (misère needs different theory). Games with cycles need extra care; the standard method requires an acyclic move graph.

Pitfalls: computing mex incorrectly (it must start at 0 and ignore duplicates), adding Grundy numbers instead of XOR-ing them, treating the game as a single state instead of splitting it into independent components and mixing misère and normal rules.

Testing: compare the XOR criterion with brute force win tables for sums of two small games.

## explain
1. Split the game into independent components.
2. For each component, compute the Grundy number with a mex of the successor values.
3. Memoise the values, working from terminal positions up.
4. XOR the component values.
5. A zero result means the mover loses.
6. Otherwise choose a component and a move to a state with Grundy number equal to the value XOR the total.

## example
The Python program computes Grundy numbers for the subtraction game with moves 1 and 2 (period 3), for moves 2, 3 and 7 and for Kayles, and checks the XOR criterion for sums of two games by brute force. The JavaScript program shows the mex function and a Grundy table for the splitting game.

## real
Contest platforms use these ideas for multi-pile and board games, and the theory is the basis of combinatorial game solvers.

## pros
- Reduces every impartial game to Nim
- Handles sums of independent games with XOR
- Memoised computation is straightforward

## cons
- Requires independence and normal play
- Needs a state space small enough to enumerate
- Patterns must be verified, not assumed

## uses
- Games with several independent boards
- Take-away games with custom move sets
- Games that split a structure into parts
- Directed acyclic graph token games

## mistakes
- Adding instead of XOR-ing Grundy values
- Computing mex from a list with duplicates incorrectly
- Using the theorem on misère games
- Ignoring that components must be independent

## interview
**Q:** What is the Grundy number of a game position?
**A:** The minimum excludant of the Grundy numbers of all positions reachable in one move, with zero for positions without moves.

**Q:** How do you decide the winner of a sum of games?
**A:** XOR the Grundy numbers of the components; the player to move wins when the result is nonzero.

**Q:** Why does a Grundy number of zero mean the position is losing?
**A:** Every move leads to a position with a nonzero value, because zero is not among the reachable values, so the opponent can always respond to return to a zero position.

## summary
Grundy numbers, defined by the mex of successor values, map every impartial game position to an equivalent Nim pile, and independent components combine by XOR. A zero total means the player to move loses.

## codenote
The Python sample computes tables and checks sums. The JavaScript sample shows the mex helper.

## code
### python
```python
from functools import lru_cache
from itertools import product

def mex(values):
    seen = set(values)
    m = 0
    while m in seen:
        m += 1
    return m

def grundy_table(limit, moves):
    g = [0] * (limit + 1)
    for n in range(1, limit + 1):
        g[n] = mex(g[n - m] for m in moves if m <= n)
    return g

print(grundy_table(12, (1, 2)))
print(grundy_table(12, (2, 3, 7)))

@lru_cache(maxsize=None)
def kayles(n):
    if n <= 0:
        return 0
    options = [kayles(a) ^ kayles(n - 1 - a) for a in range(n)]
    options += [kayles(a) ^ kayles(n - 2 - a) for a in range(n - 1)]
    return mex(options)

print([kayles(n) for n in range(13)])

g = grundy_table(12, (1, 2))
@lru_cache(maxsize=None)
def wins(a, b):
    for m in (1, 2):
        if a >= m and not wins(a - m, b):
            return True
        if b >= m and not wins(a, b - m):
            return True
    return False

print(all(wins(a, b) == ((g[a] ^ g[b]) != 0) for a, b in product(range(13), repeat=2)))
```
Output:
```text
[0, 1, 2, 0, 1, 2, 0, 1, 2, 0, 1, 2, 0]
[0, 0, 1, 1, 2, 0, 0, 1, 1, 2, 0, 0, 1]
[0, 1, 2, 3, 1, 4, 3, 2, 1, 4, 2, 6, 4]
True
```
### javascript
```javascript
function mex(values) {
  const seen = new Set(values);
  let m = 0;
  while (seen.has(m)) m++;
  return m;
}

console.log(mex([0, 1, 3]), mex([]), mex([1, 2]));

const grundy = [0];
for (let n = 1; n <= 12; n++) {
  const options = [];
  for (let take = 1; take <= n; take++) options.push(grundy[n - take]);
  for (let a = 1; 2 * a <= n; a++) options.push(grundy[a] ^ grundy[n - a]);
  grundy.push(mex(options));
}
console.log(grundy.join(" "));
```
Output:
```text
2 0 0
0 1 2 4 3 5 6 8 7 9 10 12 11
```

## quiz
1. What is mex of the set 0, 1, 3?
   - [ ] 0
   - [x] 2
   - [ ] 3
   - [ ] 4
   > Two is the smallest non-negative integer missing from the set.
2. How are the Grundy numbers of independent components combined?
   - [ ] Added
   - [x] XOR-ed
   - [ ] Multiplied
   - [ ] Maximised
   > The XOR is zero exactly when the sum game is lost.
3. What does a Grundy number of zero mean?
   - [ ] The game is a draw
   - [x] The player to move loses
   - [ ] The game has one move
   - [ ] The pile is empty only
   > No move leads to a zero position.
4. Which kind of game does the theorem cover?
   - [ ] Partisan games
   - [x] Impartial games under normal play
   - [ ] Games of chance
   - [ ] Misère games in general
   > Both players must have identical options from every position.

# Minimax Algorithm
kind: algorithm
time: O(b^d) positions for branching factor b and search depth d, since every legal move is explored down to the depth limit.
space: O(b·d) for storing moves on the recursion path, or O(d) when moves are generated one at a time.

## intro
In a game with scores, such as tic-tac-toe, checkers or chess, one player tries to maximise the final score while the opponent tries to minimise it. Minimax looks ahead through the tree of possible moves, assumes both sides choose their best option at every turn, and passes the best guaranteed value up to the current position.

## theory
Setting: two-player, zero-sum, turn-based game with perfect information. Each terminal position has a value from the point of view of the maximising player (for example +1 win, 0 draw, −1 loss). The two players alternate: the maximiser picks the child with the largest value, the minimiser picks the child with the smallest value.

Recursive definition:

- If the position is terminal (or the depth limit is reached), return its value or an evaluation estimate
- If it is the maximiser's turn, return the maximum of minimax over all moves
- If it is the minimiser's turn, return the minimum

The value at the root is the best result the maximiser can guarantee against an optimal opponent. The move that achieves it is chosen at the root.

Small example: a root with two moves A and B. After A the minimiser can choose between leaf values 3 and 5 and picks 3. After B the minimiser can choose between 2 and 9 and picks 2. The maximiser compares 3 and 2 and plays A with value 3, even though the leaf 9 is the largest value in the tree: the opponent will not allow it.

Complexity: with b moves per position and depth d, the tree has about b^d leaves. Tic-tac-toe has fewer than 9! = 362,880 move sequences (549,946 nodes counting all positions of the full game tree), small enough to search completely. Chess has b ≈ 35 and games last about 80 half-moves, so the full tree is astronomically large; engines search to a fixed depth with an evaluation function of material, mobility and position.

Evaluation functions: when the depth limit stops the search before the game ends, a heuristic scores the position (piece values, centre control, king safety). The quality of the evaluation determines the playing strength of a depth-limited search. For tic-tac-toe the exact terminal values suffice.

Improvements:

- Alpha-beta pruning (next lesson) returns the same value while skipping branches that cannot matter
- Move ordering: try promising moves first (captures, previous best moves) to make pruning effective
- Transposition tables: cache values of positions reached by different move orders
- Iterative deepening: search depth 1, 2, 3, ... until time runs out, reusing the best move for ordering
- Quiescence search: extend the search in unstable positions such as ongoing captures
- Negamax: a compact form for zero-sum games using `value = max(−negamax(child))`, removing the separate maximiser and minimiser code

Applications: board game engines, turn-based video game AI, decision making against adversaries, and interview questions about tic-tac-toe or coin game optimal play. Games where one value per player is needed or chance events occur use expectiminimax, which averages over chance nodes.

Optimal play facts: tic-tac-toe is a draw with perfect play; minimax from the empty board evaluates to 0. The first move in the corner or the centre keeps the draw, and any perfect opponent never loses.

Pitfalls: mixing the player's perspective (values must always be from one fixed side, or use negamax consistently), forgetting to undo the move after the recursive call, no depth limit in large games, unclear tie-breaking among equal moves, and evaluating terminal positions too late so that quicker wins are not preferred (add the depth to the score to prefer faster wins and slower losses).

Testing: check tic-tac-toe values (empty board 0, immediate winning positions +1), compare with a brute force enumeration for small trees and verify the same value with and without pruning.

## explain
1. Define terminal conditions and their values from one player's point of view.
2. Generate all legal moves for the current player.
3. For each move, apply it, recurse for the opponent and undo it.
4. Maximiser takes the highest child value, minimiser the lowest.
5. Return the best value, and at the root remember the move.
6. Add a depth limit and an evaluation function for large games.

## example
The Python program solves tic-tac-toe completely: the empty board has value 0, an almost won position has value +1, and the node count is printed (549,946 positions visited from the empty board). It also evaluates the small tree from the theory section. The JavaScript program applies minimax to the take-away game with scoring.

## real
Chess and checkers engines, game AI and adversarial planning all build on minimax with pruning and heuristic evaluation.

## pros
- Finds the optimal move against a perfect opponent
- Simple recursive structure
- Extends easily with pruning and caching

## cons
- Exponential in depth
- Quality depends on the evaluation function
- Assumes the opponent plays optimally

## uses
- Tic-tac-toe and board game engines
- Turn-based game AI
- Adversarial decision problems
- Interview optimal-play puzzles

## mistakes
- Mixing perspectives between maximiser and minimiser
- Not undoing the move after recursion
- Searching without any depth limit in a large game
- Ignoring depth when ranking wins

## interview
**Q:** What does minimax compute?
**A:** The best value the maximising player can guarantee, assuming both players choose optimally; maximiser nodes take the maximum of their children and minimiser nodes the minimum.

**Q:** What is the complexity and how is it reduced?
**A:** O(b to the d) for branching factor b and depth d; alpha-beta pruning, move ordering, transposition tables and depth limits with evaluation functions reduce the effective cost.

**Q:** What is the result of tic-tac-toe under perfect play?
**A:** A draw, so minimax from the empty board returns zero.

## summary
Minimax searches the game tree, maximising on one player's turns and minimising on the other's, and returns the value guaranteed under optimal play. It costs O(b to the d) and is improved by pruning, ordering, caching and depth-limited evaluation.

## codenote
The Python sample solves tic-tac-toe and a tiny tree. The JavaScript sample applies minimax to a scoring game.

## code
### python
```python
LINES = [(0, 1, 2), (3, 4, 5), (6, 7, 8), (0, 3, 6), (1, 4, 7), (2, 5, 8), (0, 4, 8), (2, 4, 6)]
nodes = 0

def winner(board):
    for a, b, c in LINES:
        if board[a] != "." and board[a] == board[b] == board[c]:
            return board[a]
    return None

def minimax(board, player):
    global nodes
    nodes += 1
    w = winner(board)
    if w:
        return 1 if w == "X" else -1
    if "." not in board:
        return 0
    values = []
    for i in range(9):
        if board[i] == ".":
            board[i] = player
            values.append(minimax(board, "O" if player == "X" else "X"))
            board[i] = "."
    return max(values) if player == "X" else min(values)

print(minimax(list("........."), "X"), nodes)
print(minimax(list("XX.OO...."), "X"), minimax(list("XX.OO...."), "O"))

tree = [[3, 5], [2, 9]]
print(max(min(branch) for branch in tree))
```
Output:
```text
0 549946
1 -1
3
```
### javascript
```javascript
// Take 1, 2 or 3 stones; each stone taken scores a point for the mover. Maximiser is player 0.
function minimax(stones, maximising) {
  if (stones === 0) return 0;
  let best = maximising ? -Infinity : Infinity;
  for (let take = 1; take <= Math.min(3, stones); take++) {
    const gain = maximising ? take : -take;
    const value = gain + minimax(stones - take, !maximising);
    best = maximising ? Math.max(best, value) : Math.min(best, value);
  }
  return best;
}

console.log([1, 2, 3, 4, 5, 6, 7].map((n) => n + ":" + minimax(n, true)).join(" "));
```
Output:
```text
1:1 2:2 3:3 4:2 5:1 6:0 7:1
```

## quiz
1. What does the maximiser choose at its node?
   - [ ] The smallest child value
   - [x] The largest child value
   - [ ] The first child
   - [ ] The average of the children
   > The opponent node takes the smallest instead.
2. What is the work of minimax for branching factor b and depth d?
   - [ ] O(b times d)
   - [x] O(b to the power d)
   - [ ] O(d squared)
   - [ ] O(log d)
   > Every move sequence is explored.
3. What is the value of tic-tac-toe with perfect play?
   - [ ] A win for the first player
   - [x] A draw
   - [ ] A win for the second player
   - [ ] Undefined
   > Neither side can force a win.
4. Why add an evaluation function?
   - [ ] To stop the recursion from working
   - [x] To score non-terminal positions when the search depth is limited
   - [ ] To remove the opponent
   - [ ] To avoid generating moves
   > It estimates how good the unfinished position is.

# Alpha Beta Pruning
kind: algorithm
time: O(b^d) in the worst case with poor move ordering and O(b^(d/2)) with the best ordering, so the search can go twice as deep in the same time.
space: O(d) for the recursion, plus any transposition table.

## intro
Minimax examines every branch, but many branches cannot change the final decision. Alpha-beta pruning keeps two bounds while searching and cuts off a branch as soon as it is clear that the opponent would never allow the position to arise. The answer is identical to plain minimax, yet far fewer positions are visited, which is why every serious game engine uses it.

## theory
Bounds: alpha is the best value the maximiser can already guarantee along the current path (a lower bound); beta is the best value the minimiser can already guarantee (an upper bound). At the root alpha = −∞ and beta = +∞. The window narrows as the search proceeds.

Cutoff rule: when `alpha >= beta` at a node, stop exploring its remaining children. If the maximiser's lower bound at some node already reaches the minimiser's upper bound from above, the minimiser has a better alternative earlier in the tree and will avoid this node, so the rest of its children cannot matter.

Algorithm:

- Maximiser node: for each child, `value = max(value, search(child, alpha, beta))`, then `alpha = max(alpha, value)`; if `alpha >= beta`, break
- Minimiser node: `value = min(...)`, `beta = min(beta, value)`; if `alpha >= beta`, break
- Terminal or depth limit: return the evaluation

Example: root (max) with child A (min) holding leaves 3 and 5, and child B (min) holding leaves 2 and 9. After A the root has alpha = 3. In B the first leaf is 2, so B's minimiser can reach at most 2, which is below alpha = 3, so the leaf 9 is skipped. The answer is the same as minimax, 3, with one fewer leaf evaluated.

Efficiency:

- Worst case (children ordered worst first): no pruning, O(b^d)
- Best case (best move first at every node): about b^(d/2) positions, equivalent to doubling the search depth for the same effort
- Random ordering: about b^(3d/4)
- Chess engines reach effective branching factors near 2 to 6 with good ordering instead of 35

Move ordering heuristics: try captures before quiet moves, the move that was best in the previous iteration (iterative deepening), killer moves that caused cutoffs at the same depth, history heuristic scores, and a hash move from the transposition table.

Related techniques:

- Principal variation search (NegaScout): search the first move with a full window and the rest with a null window, re-searching only if one beats alpha
- Aspiration windows: start with a narrow window around the previous value and widen if the search fails
- Transposition tables with Zobrist hashing store the exact value, lower bound or upper bound of positions
- Negamax formulation with `alpha-beta` where the window flips sign at each ply: `value = -search(child, -beta, -alpha)`
- Late move reductions and null move pruning reduce depth for unpromising moves (heuristic, not exact)

Correctness: alpha-beta returns exactly the minimax value at the root, but values at internal nodes may only be bounds, so do not reuse them as exact numbers without storing the bound type.

Applications: chess, checkers, Othello, Go engines in older designs, any adversarial search where an evaluation function is available, and interview questions that ask for minimax with pruning on a small tree.

Pitfalls: passing the wrong window to children (swap in negamax), using `>` instead of `>=` for cutoffs when exact node counts matter (both return correct values), updating alpha at a minimiser node by mistake, caching values without bound types, and expecting a speed-up with bad move ordering.

Testing: compare results with plain minimax on random trees and positions, count visited nodes with different orderings.

## explain
1. Start with alpha minus infinity and beta plus infinity.
2. At maximiser nodes raise alpha as better children are found.
3. At minimiser nodes lower beta as better children are found.
4. Stop searching a node once alpha reaches beta.
5. Order moves so strong candidates are searched first.
6. Verify that the root value matches plain minimax.

## example
The Python program evaluates random game trees with minimax and alpha-beta, shows both give the same root value, and counts leaf evaluations on a tree of branching 4 and depth 6 (656 of 4096 leaves with the original order, 127 after ordering the best moves first). The JavaScript program searches the small example tree and reports which leaf is skipped.

## real
Chess and checkers engines depend on alpha-beta to reach the search depths that make them strong.

## pros
- Same answer as minimax with far fewer nodes
- Can double the search depth with good ordering
- Combines with caching and iterative deepening

## cons
- Gains depend on move ordering
- Internal values are bounds, not exact
- More complex than plain minimax

## uses
- Game engines for chess and checkers
- Adversarial search with evaluations
- Reducing search effort in puzzles
- Teaching pruning logic

## mistakes
- Passing the wrong window to child nodes
- Caching bounds as exact values
- Expecting a gain with poor move ordering
- Updating the wrong bound at a node

## interview
**Q:** What do alpha and beta represent?
**A:** Alpha is the best value the maximiser can already guarantee on the current path and beta is the best the minimiser can guarantee, and a node is cut off as soon as alpha reaches beta.

**Q:** Does pruning change the result?
**A:** No, the root value and best move equal those of plain minimax; only the number of visited nodes changes.

**Q:** How good can pruning be?
**A:** With perfect move ordering the work drops from b to the d to about b to the d over two, so the search can go twice as deep.

## summary
Alpha-beta pruning keeps lower and upper bounds along the path and cuts off branches the opponent would avoid, returning the exact minimax value with up to square root of the nodes when moves are well ordered.

## codenote
The Python sample compares ordering and counts leaves. The JavaScript sample shows the skipped leaf.

## code
### python
```python
import random

def make_tree(depth, branching, rng):
    if depth == 0:
        return rng.randint(-20, 20)
    return [make_tree(depth - 1, branching, rng) for _ in range(branching)]

def minimax(node, maximising):
    if isinstance(node, int):
        return node
    values = [minimax(child, not maximising) for child in node]
    return max(values) if maximising else min(values)

visited = 0

def alphabeta(node, maximising, alpha=float("-inf"), beta=float("inf")):
    global visited
    if isinstance(node, int):
        visited += 1
        return node
    if maximising:
        best = float("-inf")
        for child in node:
            best = max(best, alphabeta(child, False, alpha, beta))
            alpha = max(alpha, best)
            if alpha >= beta:
                break
        return best
    best = float("inf")
    for child in node:
        best = min(best, alphabeta(child, True, alpha, beta))
        beta = min(beta, best)
        if alpha >= beta:
            break
    return best

rng = random.Random(5)
trees = [make_tree(6, 4, rng) for _ in range(30)]
print(all(minimax(t, True) == alphabeta(t, True) for t in trees))

def order(node, maximising):
    if isinstance(node, int):
        return node
    children = [order(c, not maximising) for c in node]
    children.sort(key=lambda c: minimax(c, not maximising), reverse=maximising)
    return children

tree = trees[0]
visited = 0
alphabeta(tree, True)
random_order = visited
best_tree = order(tree, True)
visited = 0
alphabeta(best_tree, True)
best_order = visited
print(4 ** 6, random_order, best_order, best_order <= random_order)
```
Output:
```text
True
4096 656 127 True
```
### javascript
```javascript
const tree = [[3, 5], [2, 9]];
const skipped = [];

function search(node, maximising, alpha, beta, path) {
  if (typeof node === "number") return node;
  let best = maximising ? -Infinity : Infinity;
  for (let i = 0; i < node.length; i++) {
    const value = search(node[i], !maximising, alpha, beta, path + i);
    if (maximising) {
      best = Math.max(best, value);
      alpha = Math.max(alpha, best);
    } else {
      best = Math.min(best, value);
      beta = Math.min(beta, best);
    }
    if (alpha >= beta) {
      for (let j = i + 1; j < node.length; j++) skipped.push(path + j);
      break;
    }
  }
  return best;
}

console.log(search(tree, true, -Infinity, Infinity, ""), "skipped branches:", skipped.join(","));
```
Output:
```text
3 skipped branches: 11
```

## quiz
1. When is a branch pruned?
   - [ ] When it has more than two children
   - [x] When alpha is at least beta at the node
   - [ ] When the value is zero
   - [ ] When it is the last child
   > The opponent would already avoid this position.
2. Does pruning change the minimax value at the root?
   - [ ] Yes, it lowers it
   - [x] No, only the visited node count changes
   - [ ] Yes, it raises it
   - [ ] Only for odd depths
   > Pruned branches cannot influence the decision.
3. What is the best case node count with perfect ordering?
   - [ ] b to the d
   - [x] About b to the d over 2
   - [ ] d
   - [ ] b times d
   > That lets the search go roughly twice as deep.
4. Which technique tries strong moves first?
   - [ ] Random shuffling
   - [x] Move ordering with captures and previous best moves
   - [ ] Deleting the evaluation
   - [ ] Reversing the player roles
   > Early strong moves tighten the bounds quickly.

# Computational Geometry Points
kind: concept
time: Not an algorithmic topic — this lesson covers the representation of points and basic operations. Distance, midpoint and dot product between two points cost O(1), and most geometry algorithms start by sorting n points in O(n log n).
space: Not an algorithmic topic — a point stores two or three coordinates, so n points use O(n) space.

## intro
Computational geometry turns shapes into numbers a program can manipulate. Everything starts with the point: a pair of coordinates in the plane. Distances, directions, areas and relations such as left or right of a line are all computed from point coordinates, and choosing exact integer arithmetic over floating point is the habit that keeps geometry code correct.

## theory
Representation: a point is `(x, y)`, a vector from the origin is the same pair. A vector between two points is `b − a = (bx − ax, by − ay)`. In code use a small struct, pair or tuple, with integer coordinates whenever the input is integral.

Basic operations:

- Distance: `sqrt((bx − ax)² + (by − ay)²)`. Compare squared distances to avoid square roots and rounding: the squared distance between (0, 0) and (3, 4) is 25, so the distance is 5
- Manhattan distance `|dx| + |dy|` and Chebyshev distance `max(|dx|, |dy|)` for grid movement
- Midpoint: `((ax + bx)/2, (ay + by)/2)`
- Vector addition, subtraction and scaling
- Dot product: `a · b = ax·bx + ay·by = |a||b|cos(θ)`; it is zero for perpendicular vectors, positive for acute angles and negative for obtuse ones
- Cross product (2D scalar): `a × b = ax·by − ay·bx = |a||b|sin(θ)`; its sign says the turning direction and its absolute value is the area of the parallelogram (next lesson)
- Polar angle: `atan2(y, x)` returns the angle in (−π, π], and sorting points by angle is the basis of many algorithms

Exact versus floating point: floating point comparisons for equality fail (0.1 + 0.2 is not 0.3). Prefer integers: squared distances, cross products and dot products of integer points stay exact in 64 bits when coordinates are below about 10^9 (products up to 10^18). If floating point is unavoidable, compare with a small tolerance epsilon such as 1e-9 and be consistent.

Common computations on points:

- Area of a triangle from three points: `|cross(b − a, c − a)| / 2`
- Area of a polygon by the shoelace formula: `½ |sum over edges of (x_i·y_{i+1} − x_{i+1}·y_i)|`; the unit square has area 1
- Centroid of a set of points: average of coordinates
- Bounding box: min and max coordinates in each axis
- Rotation by angle θ about the origin: `(x cosθ − y sinθ, x sinθ + y cosθ)`; rotation by 90 degrees is `(−y, x)` exactly in integers
- Collinearity of three points: cross product is zero
- Point in rectangle and point in circle tests: comparisons and squared distances
- Nearest neighbour search with grids or k-d trees; closest pair with divide and conquer (later lesson)

Coordinates and conventions: screen coordinates often put the y-axis downward, which reverses the meaning of clockwise and counter-clockwise; define the convention once and test it with a known example. In 3D the cross product becomes a vector, and distances add a z term.

Sorting points: lexicographic order by x, then y, is the starting step of convex hulls and sweep line algorithms. Use integer comparisons. Points can also be sorted by angle around a pivot using the cross product as a comparator.

Applications: collision detection in games, map and routing software, computer graphics, robotics, clustering and nearest neighbour search in machine learning, geographic information systems and contest geometry problems.

Pitfalls: floating point equality, integer overflow in cross products, forgetting duplicate points, degenerate inputs (all points on a line or identical), integer division when taking midpoints, and a flipped y-axis.

Testing: use right triangles and unit squares with known answers, collinear points, duplicate points and extreme coordinates.

## explain
1. Store points with integer coordinates when possible.
2. Compare squared distances instead of taking square roots.
3. Use the cross product for orientation and area, and the dot product for angles.
4. Sort points lexicographically or by angle with exact comparisons.
5. Use an epsilon only when floating point values cannot be avoided.
6. Test degenerate inputs such as duplicates and collinear points.

## example
The Python program computes squared distance, Manhattan distance, a dot product and a cross product, the area of a triangle and a polygon with the shoelace formula (the unit square gives 1.0 and a 4 by 3 rectangle 12.0), checks collinearity, and rotates a point by 90 degrees exactly. The JavaScript program shows floating point equality failing with the epsilon fix, and a cross product whose exact value 1,999,999,999 is printed as 2,000,000,000 because products near 10^18 exceed 2^53.

## real
Games detect collisions with point and vector arithmetic, and mapping software computes distances and areas from coordinates.

## pros
- Simple, exact operations on integer coordinates
- Building blocks for all geometry algorithms
- Cheap constant-time primitives

## cons
- Floating point errors cause subtle bugs
- Degenerate cases are easy to miss
- Conventions on axes cause sign mistakes

## uses
- Distance and nearest point queries
- Area and orientation computations
- Collision detection
- Preparing points for hulls and sweeps

## mistakes
- Testing two decimal results for exact equality
- Overflowing in cross products
- Ignoring duplicate or collinear points
- Mixing clockwise conventions with a flipped y-axis

## interview
**Q:** Why compare squared distances instead of distances?
**A:** The square root is monotone and costly and introduces rounding error, so comparing squared distances gives the same ordering exactly with integer arithmetic.

**Q:** What do the dot and cross products tell you?
**A:** The dot product reveals the angle type and zero means perpendicular vectors, while the 2D cross product gives the oriented area whose sign shows the turning direction and zero means collinear.

**Q:** How do you compute a polygon's area?
**A:** With the shoelace formula, summing the cross products of consecutive vertices and halving the absolute value.

## summary
Points and vectors, with distance, dot product, cross product, area and rotation, form the toolkit of computational geometry. Prefer exact integer arithmetic, compare squared quantities and test degenerate cases.

## codenote
The Python sample covers basic operations and the shoelace formula. The JavaScript sample shows epsilon comparison.

## code
### python
```python
def sub(a, b):
    return (a[0] - b[0], a[1] - b[1])

def dist2(a, b):
    dx, dy = sub(a, b)
    return dx * dx + dy * dy

def dot(a, b):
    return a[0] * b[0] + a[1] * b[1]

def cross(a, b):
    return a[0] * b[1] - a[1] * b[0]

def polygon_area(points):
    total = 0
    for i, p in enumerate(points):
        q = points[(i + 1) % len(points)]
        total += cross(p, q)
    return abs(total) / 2

print(dist2((0, 0), (3, 4)), abs(3) + abs(4), dot((1, 0), (0, 5)), cross((1, 0), (0, 5)))
a, b, c = (0, 0), (4, 0), (0, 3)
print(abs(cross(sub(b, a), sub(c, a))) / 2)
print(polygon_area([(0, 0), (1, 0), (1, 1), (0, 1)]), polygon_area([(0, 0), (4, 0), (4, 3), (0, 3)]))
print(cross(sub((2, 2), (0, 0)), sub((5, 5), (0, 0))) == 0, cross(sub((2, 3), (0, 0)), sub((5, 5), (0, 0))) == 0)
print((lambda p: (-p[1], p[0]))((3, 2)))
```
Output:
```text
25 7 0 5
6.0
1.0 12.0
True False
(-2, 3)
```
### javascript
```javascript
console.log(0.1 + 0.2 === 0.3, Math.abs(0.1 + 0.2 - 0.3) < 1e-9);

const cross = (a, b) => a[0] * b[1] - a[1] * b[0];
// products near 1e18 exceed 2^53, so the exact value 1999999999 is lost
const big = [1e9, 1e9 - 1];
console.log(cross(big, [1e9 - 1, 1e9]), cross([3, 4], [6, 8]));
```
Output:
```text
false true
2000000000 0
```

## quiz
1. Why compare squared distances?
   - [ ] They are more accurate than the square root
   - [x] They avoid square roots and rounding while keeping the order
   - [ ] They are always smaller
   - [ ] They handle negative numbers
   > Squaring is monotone for non-negative values.
2. What does a zero 2D cross product of two vectors mean?
   - [ ] They are perpendicular
   - [x] They are parallel or collinear
   - [ ] They have equal length
   - [ ] One is the zero point
   > The oriented parallelogram area is zero.
3. What formula gives the area of a polygon from its vertices?
   - [ ] Pythagoras
   - [x] The shoelace formula
   - [ ] The law of sines
   - [ ] Heron's formula for polygons
   > It sums cross products of consecutive vertices.
4. Why prefer integer arithmetic?
   - [ ] It is always faster
   - [x] It gives exact comparisons without rounding error
   - [ ] It handles any size
   - [ ] It removes the need for tests
   > Floating point equality is unreliable.
