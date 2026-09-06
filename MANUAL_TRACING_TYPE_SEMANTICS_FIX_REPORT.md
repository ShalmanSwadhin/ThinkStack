# ThinkStack — Manual Tracing Engine Type-Semantics Fix Report

## A. Root Cause

The reported program:

```c
int sum=24, i=23;
i=i%4;
sum=sum/i++;
printf("sum=%5d i=%d\n", --sum, ++i);
sum*=i--;
printf("sum=%5d i=%d", sum++, i--);
```

produced `sum=7.6666666666667` instead of `sum=    7 i=5`. This was **two separate bugs
compounding**, both in the pre-existing expression-handling layer
(`shared/tracing/ir/expressions.js` + `shared/tracing/parsers/common.js` +
`shared/tracing/engine/evaluator.js`):

1. **Multi-declaration mis-parsing.** `parseAssignment("int sum=24, i=23")` matched a
   single regex that captured `target: "sum"`, `expr: "24, i=23"` — the *entire*
   remainder of the line, including the second declaration. `i` was never separately
   declared at all.

2. **Unsound raw-expression fallback.** Any expression the old "structured" evaluator
   didn't recognize (which included `"24, i=23"`, and separately `i++`/`i--` embedded
   in a larger expression, since a naive right-to-left character scan for `+`/`-`
   would split `i++` into garbage) fell through to:
   ```js
   new Function(...keys, `return (${expr});`)
   ```
   Evaluating `"24, i=23"` this way executed JavaScript's **comma operator**:
   `i = 23` ran as a real assignment inside a sloppy-mode dynamic function with no
   declaration for `i` — creating an **implicit global** `globalThis.i = 23`. A
   *later, unrelated* evaluation of `i % 4` then read this leaked global via the
   scope chain (since `new Function`'s closures see `globalThis`, not
   `runtime.scope`), computing `23 % 4 = 3` — a value that looked plausible but came
   from global-state leakage, not from the program's real variable.
   Separately, `i++` embedded inside `sum = sum / i++` lost its side effect entirely:
   `new Function`'s parameters are local copies, so incrementing `i` inside the
   function never wrote back to `runtime.scope.i`. And `sum *= i--` never even
   reached this fallback — no regex recognized compound-assignment operators at all,
   so the whole line silently became a no-op `STATEMENT`.
   The combination of a leaked/mis-assigned `i` and lost side effects is exactly what
   produced `sum / i++` → `24 / 3.9999...`-shaped float math instead of `24 / 4` (int).

Neither bug is something a special case for "the reported line" could fix correctly
— both are structural: no real tokenizer/parser existed for expressions, and no
per-language type model existed to know that C's `int / int` truncates while
Python's doesn't.

A related, independently-discovered bug (found via property testing while verifying
this fix, not part of the original report) had the same root shape: **`if`/`elif`/
`else` chains — in every language including Python — only ever condition-gated the
first clause.** `if (x>10) {y=1;} else if (x>3) {y=2;} else {y=3;}` with `x=5`
produced `y=3` (the *last* clause always won), because each `elif`/`else if`/`else`
was parsed as an unrelated, independent construct with no link back to the earlier
clause, so after a taken branch's body finished, execution fell straight through
into the next clause's body instead of skipping the rest of the chain — and for
brace languages, an `else if (...)` condition was never evaluated at all (the line
`} else if (x > 3) {` matched no recognized pattern and its body ran unconditionally).
This is now fixed as part of the same effort since it is squarely inside "full
control-flow tracing" and was actively corrupting traces for one of the most common
constructs in any real program.

## B. Files Changed

| File | Why |
|---|---|
| `shared/tracing/engine/tokenizer.js` (new) | Real tokenizer: numbers (int/float/suffixes), strings, chars, identifiers/keywords, and every multi-character operator (`++ -- == != <= >= && \|\| += -= *= /= %= &= \|= ^= << >> === !== // <<= >>=`), longest-match-first. Replaces ad-hoc substring scanning that couldn't distinguish `i++` from `i + +`. |
| `shared/tracing/engine/expressionParser.js` (new) | Precedence-climbing recursive-descent parser producing a real AST (`literal, ident, unary, pre_incdec, post_incdec, binary, logical, ternary, assign, array_literal, array_access, member_access, call, unsupported`). Deliberately has no comma operator — top-level commas are split by the caller before reaching it, closing off the exact failure mode that leaked a global before. |
| `shared/tracing/engine/typeSystem.js` (new) | Per-language type semantics: `normalizeDeclaredType`, `inferLiteralKind`, `resultKind`, `coerceToKind`, `typedDivide` (truncates only for `int`-kind operands in `c`/`cpp`/`java`), `typedModulo` (floored for Python, truncated elsewhere). |
| `shared/tracing/engine/runtime.js` | `createRuntime(language)` now threads the source language and a hidden per-variable type map (`__lang__`, `__types__`, non-enumerable) through the existing `scope` object shape, so no other call site needed to change its signature. `getVarType`/`setVarType`/`getLanguage` added. |
| `shared/tracing/ir/expressions.js` | `parseExpressionString` now delegates to the real parser instead of the old right-to-left character scan. `exprToString` extended for the new node kinds. |
| `shared/tracing/ir/program.js` | `normalizeProgram`'s `simplifyExpr` updated for the new node kinds (`logical`, `pre_incdec`/`post_incdec`, `assign`); the removed `'raw'` node type is gone (replaced by `'unsupported'`, which now throws instead of silently mistracing). |
| `shared/tracing/parsers/common.js` | `parseAssignment` rewritten: recognizes compound-assignment operators (`+= -= *= /= %= &= \|= ^= <<= >>=`) as their own case; splits genuine multi-declarations (`int a=1, b=2;`) into a `{multiDeclare, declarations:[...]}` shape via comma-depth-aware splitting (respecting nested parens/array literals), instead of swallowing everything after the first `=` into one expression. `parsePrint` now separately captures a `printf` format string from its arguments. |
| `shared/tracing/parsers/blockParser.js` | (1) Handles the new `multiDeclare` shape — one `DECLARE_VARIABLE` instruction per variable. (2) **`parseIfChain`** (new): parses a full `if [elif]* [else]` chain — Python indentation-based or brace-based `} else if (...) {` / `} else {` — as one linked structure instead of independent constructs, fixing the chain-branching bug described in section A. |
| `shared/tracing/engine/evaluator.js` | Rewritten. `evaluateTyped` is the core: a full switch over every AST node kind, type-aware at every step (assignment, compound assignment, prefix/postfix inc/dec, binary ops). `evaluateRawExpression` is now `evaluateExpr(parseExpression(...), scope)` — **no `eval`/`new Function` anywhere**. New `evaluatePrintf` implements real `%d/%5d/%.2f/%x/%c/%s`-style interpolation. Fixed two more bugs found during verification: `range()`'s argument handling was reading `.value` off already-unwrapped plain numbers (silently producing empty ranges — this broke every Python sample using `range()`); `Math.floor`/`Math.abs`/etc. calls were never recognized because the callee-name lookup only handled bare identifiers, not `Math.` member access. Also added char-to-numeric-code promotion for arithmetic in C/C++/Java (`'a' + 1 === 98`), scoped to those languages only since JS/Python have no distinct char type. |
| `shared/tracing/engine/executor.js` | `createRuntime(program.language)` (was called with no argument, defaulting every trace to Python's type rules). `DECLARE_VARIABLE`/`ASSIGN` now records an explicit declared type (`int`, `float`, ...) before evaluating the initializer, so it isn't overwritten by the literal's inferred kind. `PRINT` routes through `evaluatePrintf` when a format string is present. `applyIncrement` (standalone `i++;`/for-loop init/increment clauses) rewritten to go through the same tokenizer/parser/evaluator pipeline instead of its own separate regexes, so a for-loop's typed index variable behaves correctly in later arithmetic. Added an `ifStack` mechanism (`advancePastClosedBlocks`, `discardStaleIfFrames`) so a taken if-chain clause skips the rest of its chain, and `break`/`continue`/`return` correctly discard stale chain state when they jump past it. |
| `backend/tests/unit/tracingTypeSemantics.test.js` (new) | 26 tests: the 9 mandatory regression cases, 9 cross-language equivalence cases, an unsupported-construct-throws case, 6 if/elif/else chain cases (including the newly-found bug), and the char-arithmetic case. |

No routes, controllers, services, models, or frontend components were touched —
this is entirely inside the pre-existing `shared/tracing` engine that both the
frontend's Manual Tracing page and the visualizer's code-sync panel already
consumed. No new opcodes, no parallel tracing system, no API changes.

## C. Architecture

```
source text
   │
   ▼
tokenizer.js ──► expressionParser.js ──► AST (ir/expressions.js's EXPR_TYPES)
   │                                         │
   ▼                                         ▼
parsers/common.js, blockParser.js       evaluator.js (evaluateTyped)
(statements → IR instructions)              │
   │                                        uses typeSystem.js for
   ▼                                        per-language +/-/*/÷/% rules,
executor.js (executeIR)                     runtime.js for per-variable
   - createRuntime(language)                 declared-type tracking
   - walks IR, calls evaluateExpr/
     evaluateCondition/evaluatePrintf
   - ifStack + loopStack for chain/
     loop control flow
   │
   ▼
trace steps (unchanged shape) → visualizer/stepEmitter.js, explain/explanations.js
```

- **Types**: every variable's declared type (`int`, `float`, `char`, ...) is stored in
  a hidden, non-enumerable `scope.__types__` map, keyed by variable name — the
  visible `scope` object (what steps/UI read) is untouched in shape.
- **Expressions**: a real AST replaces string-splitting. Every node evaluates to a
  `{value, kind}` pair internally (`evaluateTyped`); `evaluateExpr` unwraps to the
  plain value for every existing caller.
- **Prefix vs. postfix**: distinct AST node kinds (`pre_incdec` returns the value
  *after* mutation; `post_incdec` returns the value *before*), both applying their
  side effect to the real scope via a resolved lvalue (identifier or array element).
- **Compound assignment**: the RHS is evaluated exactly once (so its own side effects,
  e.g. `i--` inside `sum *= i--`, happen first), then combined with the target's
  *current* value, then written back and (for declared-typed targets) coerced.
- **Control flow**: if/elif/else clauses are now parsed and linked as one chain
  (`nextClauseIndex` for a false branch, `chainEndIndex` for a taken branch to skip
  the rest); loops are unchanged from before.
- **Output**: `printf`-style prints carry their own format string and are
  interpolated positionally (widths, precision, `%x/%c/%s/...`); other print styles
  (`print`, `console.log`, `System.out.println`, `cout <<`) are unchanged.
- **Failure mode**: a construct the parser can't represent becomes an `unsupported`
  AST node, which `evaluateTyped` throws a `TraceError` for — never a guessed value.

## D. Language Coverage

Actually executed and verified (automated tests + a manual browser session) for:
**Python, JavaScript, Java, C, C++** — the 5 languages this engine has ever supported.
No new language was added or removed.

## E. Tests

All of the following were actually run (`npm run test -w backend`), not just written.

| Test | Expected | Actual | Status |
|---|---|---|---|
| Full reported bug (C) | `sum=    7 i=5` then `sum=   35 i=4` | exact match | ✅ |
| Integer division, evenly divisible (C) | `10/2` truncates | `5` (int) | ✅ |
| Integer division, non-even (C) | `7/2` truncates toward zero | `3` | ✅ |
| Float division (C) | `7.0/2.0` real quotient | `3.5` | ✅ |
| Postfix increment | old value returned, var incremented | `j=5, i=6` | ✅ |
| Prefix increment | new value returned | `j=6, i=6` | ✅ |
| Postfix decrement | old value returned, var decremented | `j=5, i=4` | ✅ |
| Prefix decrement | new value returned | `j=4, i=4` | ✅ |
| Compound assign (`sum *= i--`) | RHS evaluated once, old `i` used | `sum=30, i=2` | ✅ |
| Cross-lang int division (5 langs) | `7 // 2` / `Math.floor(7/2)` / `7/2` (typed) = `3` | `3` everywhere | ✅ |
| Cross-lang float division (5 langs) | `3.5` everywhere | `3.5` everywhere | ✅ |
| Cross-lang prefix/postfix (JS/Java/C/C++) | consistent old/new semantics | consistent | ✅ |
| Cross-lang compound assign (JS/Java/C/C++) | `sum=30, i=2` | matches | ✅ |
| Cross-lang operator precedence (5 langs) | `2+3*4-1=13` | `13` everywhere | ✅ |
| `&&` short-circuit (JS/C/C++) | RHS not evaluated | confirmed (`calls=0`) | ✅ |
| For-loop sum 1..5 (5 langs) | `15` | `15` everywhere | ✅ |
| While-loop to 5 (5 langs) | `n=5` | `5` everywhere | ✅ |
| Array mutation (5 langs) | `[1,99,3]` | matches | ✅ |
| Unsupported expression | throws, doesn't guess | `TraceError` thrown | ✅ |
| Else-if chain (C) selects correct branch | `y=2` for `x=5` | `2` (was `3` before fix) | ✅ |
| Taken if-branch doesn't fall through | `y=1` for `x=20` | `1` | ✅ |
| Python elif/else selects correct branch | `y=2` for `x=5` | `2` (was `3` before fix) | ✅ |
| 5-way elif chain, 10 boundary values | matches manual classification | all match | ✅ |
| `break` inside `if` inside `for` | exits the loop, not just the `if` | `sum=3, i=3` | ✅ |
| `continue` inside `if` inside `for` | skips one iteration only | `sum=8` | ✅ |
| Char arithmetic (`'a'+1`, C/C++/Java) | `98` (numeric promotion) | `98` (was `"a1"` string concat before fix) | ✅ |
| Existing `tracing.test.js` (19 tests, incl. bubble-sort/linear-search/binary-search/recursion cross-language) | all pass | all pass | ✅ |
| Existing `algorithms.test.js` and full backend suite | all pass | **227/227 pass** | ✅ |
| Randomized property test: 500 random `(a,b)` int divisions/mod vs. `Math.trunc`/native `%` | 0 mismatches | 0 mismatches | ✅ |
| Randomized property test: 300 random 5-way if/elif/else chains vs. reference classifier | 0 mismatches | 0 mismatches | ✅ |
| Randomized property test: 200 random prefix/postfix increment start values | 0 mismatches | 0 mismatches | ✅ |
| Lint (`npm run lint`) | 0 errors | 0 errors (13 pre-existing unrelated warnings) | ✅ |
| Production build (`npm run build -w frontend`) | succeeds | succeeds | ✅ |
| Browser (Playwright): paste the exact bug program into Manual Tracing (C), step to the end | Output Console shows `sum=    7 i=5` / `sum=   35 i=4`; Variable Watch shows `sum=36, i=3` | confirmed, 0 console errors, 0 network failures | ✅ |
| Browser (Playwright): else-if chain program in Manual Tracing (C) | Output shows `y=2` | confirmed | ✅ |
| Browser (Playwright): existing 5-language stepping regression (unchanged from Phase 3) | line-highlight/variable-watch/final-value checks | identical results to the pre-existing Phase 3 baseline report — no new regression | ✅ (one harness-only line-highlight check remains a known pre-existing Playwright selector limitation, unrelated to this fix, documented in Phase 3's report) |

One unrelated, pre-existing integration test (`problems.test.js`'s `$text` search
filter) failed once mid-session with `text index required for $text query` (a
MongoDB index-availability timing issue in the test DB, nothing to do with tracing)
and passed cleanly on every other run before and after — not a regression from this
work; no file in that subsystem was touched.

## F. Regression Confirmation

The exact reported program, run through the fixed engine:

```
Output: ["sum=    7 i=5\n", "sum=   35 i=4"]
```

matching the required `sum=    7 i=5` then `sum=   35 i=4` exactly — both via a
direct engine call and via a real browser session (Manual Tracing page, C language,
stepped to completion; Variable Watch showed the correct final `sum=36, i=3`).

## G. Remaining Limitations

Being explicit rather than claiming blanket correctness:

- **User-defined function calls are not traced.** `evaluateCall` recognizes a small
  built-in set (`range, len, int, float/double, str/String, abs, Math.floor/ceil/
  round/abs/pow/sqrt/max/min`); any other call evaluates its arguments (for side
  effects) and returns `undefined` rather than actually invoking the function body.
  Recursion, custom helper functions, and their return values are not modeled. This
  was true before this fix too — it's called out here rather than left implicit.
- **`switch`/`do-while` are not implemented at all.** The IR defines `SWITCH` and
  `DO_WHILE` opcodes, but no parser ever emits them and the executor has no case for
  them (they fall through to a silent no-op `STATEMENT`). This is a pre-existing gap
  in the parser/executor, not something introduced or fixed in this pass — building
  real switch/do-while support is a separate, comparably-sized parsing feature and
  was out of scope for a type/expression-semantics and if-chain fix.
- **Allman-style `else` formatting** (`}` alone on its own line, with `else`/`else
  if` starting a *separate* following line) is not recognized as a chain
  continuation — only the far more common `} else if (...) {` / `} else {` same-line
  style is. Code written this way falls back to the old (still-broken) behavior for
  that one construct. Every sample and generated template in this codebase already
  uses the same-line style.
- **Ternary via Python's `a if cond else b` syntax is not supported** — the parser
  only implements the C-style `cond ? a : b` ternary. This fails loudly (`TraceError:
  Unable to trace this construct`) rather than mistracing, per the fail-loud
  requirement, but is a real Python-source gap.
- **A Python single-quoted multi-character string** (`'hello'`) is tokenized as a
  `CHAR` token (the tokenizer doesn't distinguish Python's "single and double quotes
  are both plain strings" rule from C's "single quotes are one character"). Its
  `value` is still the correct full string, so most uses are unaffected, but its
  `litType` is `'char'` rather than `'string'`, which could misclassify it if it
  were later used in numeric arithmetic (an unusual thing to do to a multi-character
  string in any language, so not verified either way).
- **Char-to-code arithmetic promotion is scoped to `+ - * / % & | ^ << >>`** for
  `c`/`cpp`/`java`, matching how it was actually tested. Comparisons (`==, <, >`, ...)
  were left comparing the raw single-character strings, which already produces the
  same ordering as numeric comparison for ASCII and was not touched to minimize risk.
- **Property/random testing was scoped to**: integer division/modulo, if/elif/else
  branch selection, and prefix/postfix increment — the constructs most directly
  implicated in the reported bug and the newly-found chain bug. Compound assignment,
  bitwise operators, and array-index expressions were tested with hand-written cases
  (see section E) but not with a randomized generator; a fuller property-test harness
  covering the complete grammar was not built in this pass.
- Pointer/reference semantics, C-style fixed-size array *declarations* (`int arr[5];`
  with no initializer), structs/classes, and scope shadowing (a variable
  re-declared inside a nested block with the same name as an outer one) are not
  specifically modeled — arrays are supported when initialized with a literal;
  everything else in this list was true before this fix and is unchanged.
