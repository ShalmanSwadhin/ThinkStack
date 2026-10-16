/**
 * Finds the statement that stands for "the algorithm has finished" in a listing that has no
 * `return <value>` to point at (a void function in C, C++, Java, …).
 *
 * The listing's last executable line is usually buried inside loops — for bubble sort in C it is
 * the swap inside two nested `for`s — so highlighting it on "Algorithm complete" shows the
 * algorithm sitting in the middle of its work. What actually runs last is the outermost
 * statement of the function body (the outer loop's header, whose condition finally fails), so we
 * climb out of nested blocks until the enclosing block is the function itself.
 */

const MODIFIERS = '(?:(?:public|private|protected|static|async|export|inline|extern|final|abstract|override|pub|const)\\s+)*';
const TYPE_DECLARATION = new RegExp(`^${MODIFIERS}(?:class|struct|interface|enum|object|impl|trait|namespace|module)\\b`);
const KEYWORD_FUNCTION = new RegExp(`^${MODIFIERS}(?:def|function|procedure|fn|func|fun|sub)\\b`, 'i');
const CONTROL = /^(?:if|else|elif|for|foreach|while|do|switch|case|try|catch|finally|return|throw|new|with|except|match)\b/;
// `void bubble_sort(int arr[], int n) {`, `static void BubbleSort(int[] array) {`, `int foo(int x)` …
const TYPED_FUNCTION = /^(?:[\w:<>,[\]&*~]+\s+)+[\w:~]+\s*\([^;]*\)\s*(?:const\s*)?(?:\{|:)?$/;

/** True for a function signature or a class/struct/namespace opener. */
export function isDeclarationHeader(code) {
  const text = String(code ?? '').trim();
  if (!text) return false;
  if (TYPE_DECLARATION.test(text) || KEYWORD_FUNCTION.test(text)) return true;
  if (CONTROL.test(text) || text.endsWith(';') || text.startsWith('}')) return false;
  return TYPED_FUNCTION.test(text);
}

const indentOf = (line) => line.text.length - line.text.trimStart().length;

/**
 * `codeLines` are the executable lines of a listing (see sourceAnalysis.js), in order.
 * Returns the 1-based line number, or null when the listing has no executable line.
 */
export function finalStatementLine(codeLines) {
  if (!codeLines.length) return null;
  let index = codeLines.length - 1;
  let child = null;

  for (;;) {
    const current = codeLines[index];
    // Never settle on the signature itself — fall back to the statement we climbed from.
    if (isDeclarationHeader(current.code)) return (child ?? current).number;

    const indent = indentOf(current);
    let parent = index - 1;
    while (parent >= 0 && indentOf(codeLines[parent]) >= indent) parent -= 1;
    if (parent < 0 || isDeclarationHeader(codeLines[parent].code)) return current.number;

    child = current;
    index = parent;
  }
}

export default finalStatementLine;
