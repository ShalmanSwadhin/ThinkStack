import {
  buildTracePlan,
  compileToIR,
  compareIR,
  extractFinalState,
  normalizeProgram,
  SAMPLE_CODE,
  TRACING_LANGUAGES,
  IR_OPCODES,
  clearIRCache,
  getCacheStats,
} from '../../../shared/tracing/index.js';
import {
  ALGORITHM_SAMPLES,
  ALGORITHM_IDS,
  SUPPORTED_LANGS,
} from '../../../shared/tracing/algorithms/samples.js';

describe('Tracing IR engine', () => {
  beforeEach(() => {
    clearIRCache();
  });

  it('registers all 5 tracing languages', () => {
    expect(TRACING_LANGUAGES).toHaveLength(5);
    expect(TRACING_LANGUAGES.map((l) => l.id)).toEqual(
      expect.arrayContaining(['python', 'javascript', 'java', 'c', 'cpp'])
    );
  });

  it.each(SUPPORTED_LANGS)('%s sample code produces output and variables', (lang) => {
    const plan = buildTracePlan(SAMPLE_CODE[lang], lang);
    expect(plan.steps.length).toBeGreaterThan(0);
    expect(plan.language).toBe(lang);

    const { variables, output } = extractFinalState(plan);
    expect(output.length).toBeGreaterThanOrEqual(1);

    if (lang !== 'c') {
      expect(variables.name).toBe('ThinkStack');
    }
    if (lang === 'python' || lang === 'javascript' || lang === 'java') {
      expect(variables.total).toBe(14);
    }
  });

  it('python custom code traces correctly', () => {
    const plan = buildTracePlan(`x = 10
y = "hello"
print(y, x)`, 'python');
    const { variables, output } = extractFinalState(plan);
    expect(variables.x).toBe(10);
    expect(variables.y).toBe('hello');
    expect(output[0]).toBe('hello 10');
  });

  it('parses source into IR with opcodes', () => {
    const program = compileToIR(SAMPLE_CODE.python, 'python');
    expect(program.instructions.length).toBeGreaterThan(0);
    expect(program.language).toBe('python');
    expect(program.sourceHash).toBeTruthy();

    const ops = program.instructions.map((i) => i.op);
    expect(ops).toContain(IR_OPCODES.DECLARE_VARIABLE);
    expect(ops).toContain(IR_OPCODES.FOR_EACH);
    expect(ops).toContain(IR_OPCODES.PRINT);
  });

  it('caches parsed IR for unchanged source', () => {
    compileToIR('x = 1', 'python');
    expect(getCacheStats().size).toBe(1);
    compileToIR('x = 1', 'python');
    expect(getCacheStats().size).toBe(1);
    compileToIR('x = 2', 'python');
    expect(getCacheStats().size).toBe(2);
  });

  it('trace steps include IR metadata for visualizer', () => {
    const plan = buildTracePlan('x = 5\nprint(x)', 'python');
    // `x = 5` is a fresh binding (Python's first assignment to `x`) — correctly
    // classified as a declaration, not a generic "assign" (see explain/classify.js;
    // a real reassignment later would be type 'assign').
    const assignStep = plan.steps.find((s) => s.type === 'declaration');
    expect(assignStep?.irOp).toBe(IR_OPCODES.DECLARE_VARIABLE);
    expect(assignStep?.eventType).toBe('Declaration');
    expect(assignStep?.visualEvent).toBe('VariableCreated');
    expect(assignStep?.explanation).toBeTruthy();
  });
});

describe('Cross-language IR equivalence', () => {
  beforeEach(() => {
    clearIRCache();
  });

  it.each(ALGORITHM_IDS)('%s produces equivalent final state across languages', (algoId) => {
    const samples = ALGORITHM_SAMPLES[algoId];
    const states = SUPPORTED_LANGS.map((lang) => {
      const plan = buildTracePlan(samples[lang], lang);
      return extractFinalState(plan);
    });

    if (algoId === 'bubble-sort') {
      states.forEach((s) => expect(s.variables.arr?.[0]).toBe(1));
    } else if (algoId === 'linear-search' || algoId === 'binary-search') {
      states.forEach((s) => expect(s.variables.found).toBe(2));
    } else if (algoId === 'recursion') {
      states.forEach((s) => expect(s.variables.total).toBe(15));
    }
  });

  it('bubble-sort in all languages sorts array to same result', () => {
    const samples = ALGORITHM_SAMPLES['bubble-sort'];
    const sortedFirst = SUPPORTED_LANGS.map((lang) => {
      const plan = buildTracePlan(samples[lang], lang);
      const { variables } = extractFinalState(plan);
      return variables.arr?.[0];
    });
    sortedFirst.forEach((val) => expect(val).toBe(1));
  });

  it('linear-search in all languages finds target index', () => {
    const samples = ALGORITHM_SAMPLES['linear-search'];
    SUPPORTED_LANGS.forEach((lang) => {
      const plan = buildTracePlan(samples[lang], lang);
      const { variables } = extractFinalState(plan);
      expect(variables.found).toBe(2);
    });
  });

  it('binary-search in all languages finds target index', () => {
    const samples = ALGORITHM_SAMPLES['binary-search'];
    SUPPORTED_LANGS.forEach((lang) => {
      const plan = buildTracePlan(samples[lang], lang);
      const { variables } = extractFinalState(plan);
      expect(variables.found).toBe(2);
    });
  });

  it('recursion sum produces same total across languages', () => {
    const samples = ALGORITHM_SAMPLES.recursion;
    SUPPORTED_LANGS.forEach((lang) => {
      const plan = buildTracePlan(samples[lang], lang);
      const { variables } = extractFinalState(plan);
      expect(variables.total).toBe(15);
    });
  });
});

describe('IR normalization', () => {
  it('normalizes programs for comparison', () => {
    const py = compileToIR('x = 1\nx = 2', 'python');
    const js = compileToIR('let x = 1;\nx = 2;', 'javascript');
    const normPy = normalizeProgram(py);
    const normJs = normalizeProgram(js);
    expect(normPy.filter((i) => i.op === 'DECLARE_VARIABLE' || i.op === 'ASSIGN').length).toBeGreaterThanOrEqual(2);
    expect(normJs.filter((i) => i.op === 'DECLARE_VARIABLE' || i.op === 'ASSIGN').length).toBeGreaterThanOrEqual(2);
  });
});
