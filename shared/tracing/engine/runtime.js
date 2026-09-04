/**
 * IR Runtime State — execution context for the universal engine.
 */

export function createRuntime() {
  return {
    scope: {},
    output: [],
    callStack: [{ name: 'main', line: 1 }],
    stacks: {},
    queues: {},
    pointers: {},
    visitedNodes: [],
  };
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

export default { createRuntime, cloneScope, pushCallFrame, popCallFrame };
