/**
 * "Algorithm complete" must highlight where the algorithm ends, not a statement buried in the
 * middle of its loops. In a void C/C++/Java function there is no `return <value>`, and the
 * mapper used to fall back to the file's last executable line — for bubble sort that is the
 * swap inside two nested `for` loops.
 */
import { ALGORITHMS } from '../../../shared/algorithms/catalog.js';
import { CODE_LANGUAGES } from '../../../shared/algorithms/codeSync/index.js';
import { getAlgorithmCode } from '../../../shared/algorithms/codeSync/templates.js';
import { getAnalysis } from '../../../shared/algorithms/codeSync/sourceAnalysis.js';
import { findEventRule, inferCodeLine, resolveRule } from '../../../shared/algorithms/codeSync/lineMapper.js';
import { finalStatementLine, isDeclarationHeader } from '../../../shared/algorithms/codeSync/finalStatement.js';

const languages = CODE_LANGUAGES.map((l) => l.id ?? l.value ?? l);
const indentOf = (line) => line.text.length - line.text.trimStart().length;

const completions = [];
for (const algo of ALGORITHMS) {
  const rule = findEventRule(algo.id, 'Algorithm complete');
  if (!rule) continue;
  for (const language of languages) {
    const { source } = getAlgorithmCode(algo.id, language, algo.category);
    const analysis = getAnalysis(source, language);
    const { line } = resolveRule(rule, analysis, language);
    completions.push({ label: `${algo.id} [${language}]`, algoId: algo.id, category: algo.category, language, analysis, line });
  }
}

describe('finalStatementLine', () => {
  const lines = (src) => src.split('\n').map((text, i) => ({ number: i + 1, text, code: text.trim() }));

  it('climbs out of nested loops to the outermost statement of the function', () => {
    const src = ['void f(int a[], int n) {', '    int x = 0;', '    for (int i = 0; i < n; i++) {', '        for (int j = 0; j < n; j++) {', '            a[j] = x;', '        }', '    }', '}'];
    const code = lines(src.join('\n')).filter((l) => !/^[{}]+$/.test(l.code));
    expect(finalStatementLine(code)).toBe(3);
  });

  it('keeps a plain trailing statement of the function body', () => {
    const src = ['def f(a):', '    for x in a:', '        pass', '    return a'];
    expect(finalStatementLine(lines(src.join('\n')))).toBe(4);
  });

  it('works inside a class (Java style)', () => {
    const src = ['public class A {', '    static void f(int[] a) {', '        int n = a.length;', '        while (n > 0) {', '            n--;', '        }', '    }', '}'];
    const code = lines(src.join('\n')).filter((l) => !/^[{}]+$/.test(l.code));
    expect(finalStatementLine(code)).toBe(4);
  });

  it('recognises signatures and class openers but not statements', () => {
    for (const header of ['void bubble_sort(int arr[], int n) {', 'public static void bubbleSort(int[] arr) {', 'def merge(left, right):', 'fn bubble_sort(arr: &mut Vec<i32>) {', 'func bubbleSort(arr []int) {', 'public class BubbleSort {', 'function bubbleSort(array)']) {
      expect({ header, is: isDeclarationHeader(header) }).toEqual({ header, is: true });
    }
    for (const stmt of ['for (int i = 0; i < n; i++) {', 'int n = arr.length;', 'return arr;', 'heapify(arr, n, i);', 'while (j < n2) arr[k++] = R[j++];', 'if (arr[j] > arr[j + 1]) {']) {
      expect({ stmt, is: isDeclarationHeader(stmt) }).toEqual({ stmt, is: false });
    }
  });
});

describe('the "Algorithm complete" highlight', () => {
  it('covers a meaningful number of algorithms and languages', () => {
    expect(completions.length).toBeGreaterThan(100);
  });

  it.each(completions.map((c) => [c.label, c]))('%s lands on an executable statement that is not a signature', (_label, c) => {
    expect(c.line).not.toBeNull();
    const entry = c.analysis.find((l) => l.number === c.line);
    expect(entry.kind).toBe('code');
    expect(isDeclarationHeader(entry.code)).toBe(false);
  });

  it.each(completions.map((c) => [c.label, c]))('%s sits at the top level of its function, not inside a loop', (_label, c) => {
    const code = c.analysis.filter((l) => l.kind === 'code');
    const at = code.findIndex((l) => l.number === c.line);
    let header = at;
    while (header >= 0 && !isDeclarationHeader(code[header].code)) header -= 1;
    if (header < 0) return; // listings with no signature at all (pseudocode fragments)
    const bodyIndent = indentOf(code[header + 1]);
    expect(indentOf(code[at])).toBe(bodyIndent);
  });

  it.each([
    ['bubble-sort', 'c'], ['bubble-sort', 'cpp'], ['bubble-sort', 'java'],
    ['selection-sort', 'c'], ['heap-sort', 'java'], ['shell-sort', 'cpp'],
  ])('%s in %s ends on the outer loop, not on the swap', (id, language) => {
    const algo = ALGORITHMS.find((a) => a.id === id);
    const { source } = getAlgorithmCode(id, language, algo.category);
    const line = inferCodeLine(id, algo.category, 'Algorithm complete', 0, 1, language);
    const text = source.split('\n')[line - 1].trim();
    expect(text).toMatch(/^for\b/);
    expect(text).not.toMatch(/swap|tmp/);
  });

  it('still points at the returned value in languages that return one', () => {
    for (const language of ['python', 'javascript']) {
      const algo = ALGORITHMS.find((a) => a.id === 'bubble-sort');
      const { source } = getAlgorithmCode('bubble-sort', language, algo.category);
      const line = inferCodeLine('bubble-sort', algo.category, 'Algorithm complete', 0, 1, language);
      expect(source.split('\n')[line - 1].trim()).toMatch(/^return arr/);
    }
  });
});
