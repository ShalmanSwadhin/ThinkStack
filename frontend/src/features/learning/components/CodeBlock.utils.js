export function buildCodeExplanation(code, explanation) {
  if (explanation) return explanation;
  const lines = (code ?? '').split('\n').filter(Boolean);
  if (!lines.length) {
    return 'This code demonstrates the concept step by step. Read each commented line to understand what happens during execution.';
  }
  return `This example contains ${lines.length} lines of code. Each important line includes a comment that explains what it does, why it is needed, and when it runs during execution. Follow the comments from top to bottom to understand the full algorithm.`;
}
