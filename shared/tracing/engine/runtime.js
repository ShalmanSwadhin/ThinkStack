/**
 * IR Runtime State — execution context for the universal engine.
 */

/**
 * `scope` carries two hidden, non-enumerable side-channels alongside the plain
 * variable bindings that every existing caller already reads via `scope[name]`:
 *   - `__types__`: variable name -> declared/inferred type kind ('int', 'float', ...),
 *     consulted by the typed evaluator so `int / int` truncates like the source
 *     language actually does, instead of always producing a JS float.
 *   - `__lang__`: the program's language id, so evaluator.js can apply the right
 *     language's arithmetic/division/modulo rules without every call site in
 *     executor.js having to thread a `language` parameter through.
 * A third hidden channel, `__sideEffects__`, is a mutable array that the evaluator
 * appends to whenever it applies a side effect (currently: `++`/`--`) that is NOT
 * the instruction's own primary action — e.g. the `i++` inside `sum = sum / i++`,
 * or the `--sum`/`++i` inside `printf(..., --sum, ++i)`. The executor drains this
 * list after evaluating an instruction and hands it to explain/explanations.js so
 * notes can describe embedded side effects generically, for ANY expression, rather
 * than only describing the instruction's own top-level target.
 *
 * All three channels are non-enumerable so `Object.keys(scope)` / `Object.entries(scope)`
 * (used by `cloneScope` below and by the variable-watch UI) never see them — they are
 * purely internal bookkeeping, not traced variables.
 */
export function createRuntime(language = 'python') {
  const scope = {};
  Object.defineProperty(scope, '__types__', { value: {}, enumerable: false, writable: true, configurable: true });
  Object.defineProperty(scope, '__lang__', { value: language, enumerable: false, writable: true, configurable: true });
  Object.defineProperty(scope, '__sideEffects__', { value: [], enumerable: false, writable: true, configurable: true });

  return {
    scope,
    output: [],
    callStack: [{ name: 'main', line: 1 }],
    stacks: {},
    queues: {},
    pointers: {},
    visitedNodes: [],
    // Names the trace has assigned to at least once so far — the source of truth for
    // "is this a declaration (first binding) or an update (already exists)", which is
    // more reliable than a per-line syntactic guess (Python, for instance, has no
    // declaration keyword at all, so every `x = ...` line looks identical whether `x`
    // is brand new or being reassigned for the tenth time).
    declaredNames: new Set(),
  };
}

export function getVarType(scope, name) {
  return scope?.__types__?.[name];
}

export function setVarType(scope, name, kind) {
  if (!scope) return;
  if (!scope.__types__) {
    Object.defineProperty(scope, '__types__', { value: {}, enumerable: false, writable: true, configurable: true });
  }
  scope.__types__[name] = kind;
}

export function getLanguage(scope) {
  return scope?.__lang__ ?? 'python';
}

/** Records a side effect (currently: a `++`/`--` applied to something other than
 * the instruction's own top-level target) so it can be described in the trace's
 * educational notes. See the `__sideEffects__` doc comment above. */
export function recordSideEffect(scope, effect) {
  if (!scope) return;
  if (!scope.__sideEffects__) {
    Object.defineProperty(scope, '__sideEffects__', { value: [], enumerable: false, writable: true, configurable: true });
  }
  scope.__sideEffects__.push(effect);
}

/** Returns and clears the side effects recorded since the last drain — call this
 * once per executed instruction, after evaluating its expression(s). */
export function drainSideEffects(scope) {
  const list = scope?.__sideEffects__ ?? [];
  if (scope) scope.__sideEffects__ = [];
  return list;
}

export function cloneScope(scope) {
  const copy = {};
  for (const [key, value] of Object.entries(scope)) {
    if (Array.isArray(value)) {
      copy[key] = [...value];
    } else if (value && typeof value === 'object' && value.type === 'matrix') {
      copy[key] = { ...value, data: value.data.map((row) => [...row]) };
    } else {
      copy[key] = value;
    }
  }
  return copy;
}

export function pushCallFrame(runtime, name, line) {
  runtime.callStack.push({ name, line });
}

export function popCallFrame(runtime) {
  if (runtime.callStack.length > 1) {
    runtime.callStack.pop();
  }
}

export default {
  createRuntime,
  cloneScope,
  pushCallFrame,
  popCallFrame,
  getVarType,
  setVarType,
  getLanguage,
  recordSideEffect,
  drainSideEffects,
};
