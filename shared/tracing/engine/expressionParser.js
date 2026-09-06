/**
 * Recursive-descent / precedence-climbing expression parser.
 *
 * Replaces the previous "scan for the last top-level occurrence of one of six
 * operator characters" approach (ir/expressions.js's old `parseExpressionString`),
 * which could not tell `i++` from `i + +`, had no concept of assignment as an
 * expression, and had no way to represent prefix vs postfix `++`/`--` as distinct
 * operations. Precedence (highest to lowest binding):
 *
 *   postfix ++/--, array index, call
 *   unary prefix ! ~ - + ++ --
 *   * / %
 *   + -
 *   << >>
 *   < <= > >=
 *   == !=
 *   &
 *   ^
 *   |
 *   &&              (short-circuit)
 *   ||              (short-circuit)
 *   ?:              (ternary)
 *   = += -= *= /= %= &= |= ^= <<= >>=   (right-associative, lowest)
 *
 * Deliberately NOT supported: the comma operator as a generic expression-level
 * feature. Top-level commas (multi-declarations, function args, print args) are
 * split by the caller via `splitTopLevelCommas` before any single part reaches this
 * parser — this is what the previous engine got catastrophically wrong (see
 * NEXT_PHASE_MANUAL_TRACING_FIX_REPORT.md): routing an unsplit `"24, i=23"` through
 * a JS `new Function` fallback silently invoked JS's comma operator and leaked a
 * global. There is no operator here that can reproduce that failure mode.
 */

import { tokenize, TOKEN_TYPES, TokenizeError } from './tokenizer.js';

// Lowercase string values are deliberate — they match the pre-existing EXPR_TYPES
// convention from ir/expressions.js (literal/ident/binary/array_literal/array_access),
// which ir/program.js's `normalizeProgram`/`simplifyExpr` pattern-matches against with
// hardcoded string literals. Keeping the same convention for the new node kinds avoids
// a second, incompatible AST vocabulary existing side by side.
export const NODE = Object.freeze({
  LITERAL: 'literal',
  IDENT: 'ident',
  ARRAY_LITERAL: 'array_literal',
  ARRAY_ACCESS: 'array_access',
  MEMBER_ACCESS: 'member_access',
  CALL: 'call',
  UNARY: 'unary',
  PRE_INCDEC: 'pre_incdec',
  POST_INCDEC: 'post_incdec',
  BINARY: 'binary',
  LOGICAL: 'logical',
  TERNARY: 'ternary',
  ASSIGN: 'assign',
  UNSUPPORTED: 'unsupported',
});

const ASSIGN_OPS = new Set(['=', '+=', '-=', '*=', '/=', '%=', '&=', '|=', '^=', '<<=', '>>=']);

const BINARY_PRECEDENCE = {
  '||': 1,
  '&&': 2,
  '|': 3,
  '^': 4,
  '&': 5,
  '==': 6,
  '!=': 6,
  '===': 6,
  '!==': 6,
  '<': 7,
  '<=': 7,
  '>': 7,
  '>=': 7,
  '<<': 8,
  '>>': 8,
  '+': 9,
  '-': 9,
  '*': 10,
  '/': 10,
  '%': 10,
  '//': 10,
};

const LOGICAL_OPS = new Set(['&&', '||']);

const BINARY_OP_NAMES = {
  '+': 'ADD',
  '-': 'SUBTRACT',
  '*': 'MULTIPLY',
  '/': 'DIVIDE',
  '%': 'MODULO',
  '==': 'EQ',
  '!=': 'NEQ',
  // A tracing engine doesn't model JS's type-coercion distinction between `==`/`===`
  // — both compare the already-typed values it tracks, so strict equality collapses
  // to the same opcode as loose equality (a documented, deliberate simplification).
  '===': 'EQ',
  '!==': 'NEQ',
  '//': 'FLOOR_DIV',
  '<': 'LT',
  '<=': 'LTE',
  '>': 'GT',
  '>=': 'GTE',
  '&': 'BITAND',
  '|': 'BITOR',
  '^': 'BITXOR',
  '<<': 'SHL',
  '>>': 'SHR',
};

class Parser {
  constructor(tokens, source) {
    this.tokens = tokens;
    this.pos = 0;
    this.source = source;
  }

  peek() {
    return this.tokens[this.pos];
  }

  next() {
    return this.tokens[this.pos++];
  }

  at(type, value) {
    const t = this.peek();
    return t.type === type && (value === undefined || t.value === value);
  }

  atOp(value) {
    return this.at(TOKEN_TYPES.OPERATOR, value);
  }

  expectOp(value) {
    if (!this.atOp(value)) {
      throw new ParseError(`Expected "${value}" in expression: ${this.source}`);
    }
    return this.next();
  }

  parseExpression() {
    return this.parseAssignment();
  }

  // Lowest precedence: assignment (right-associative) — `a = b = 5`, `sum *= i--`.
  parseAssignment() {
    const left = this.parseTernary();
    if (this.peek().type === TOKEN_TYPES.OPERATOR && ASSIGN_OPS.has(this.peek().value)) {
      if (left.type !== NODE.IDENT && left.type !== NODE.ARRAY_ACCESS) {
        // Not an assignable target — this wasn't really an assignment expression.
        return left;
      }
      const op = this.next().value;
      const value = this.parseAssignment();
      return { type: NODE.ASSIGN, op, target: left, value };
    }
    return left;
  }

  parseTernary() {
    const cond = this.parseBinary(1);
    if (this.atOp('?')) {
      this.next();
      const thenExpr = this.parseAssignment();
      this.expectOp(':');
      const elseExpr = this.parseAssignment();
      return { type: NODE.TERNARY, cond, then: thenExpr, else: elseExpr };
    }
    return cond;
  }

  // Precedence-climbing binary/logical operator parser.
  parseBinary(minPrec) {
    let left = this.parseUnary();

    for (;;) {
      const t = this.peek();
      if (t.type !== TOKEN_TYPES.OPERATOR) break;
      const prec = BINARY_PRECEDENCE[t.value];
      if (prec === undefined || prec < minPrec) break;

      const op = this.next().value;
      const right = this.parseBinary(prec + 1);

      if (LOGICAL_OPS.has(op)) {
        left = { type: NODE.LOGICAL, op: op === '&&' ? 'AND' : 'OR', left, right };
      } else {
        left = { type: NODE.BINARY, op: BINARY_OP_NAMES[op], left, right };
      }
    }

    return left;
  }

  parseUnary() {
    if (this.atOp('++') || this.atOp('--')) {
      const op = this.next().value === '++' ? 'INC' : 'DEC';
      const operand = this.parseUnary();
      return { type: NODE.PRE_INCDEC, op, operand };
    }
    if (this.atOp('-') || this.atOp('!') || this.atOp('~') || this.atOp('+')) {
      const op = this.next().value;
      const operand = this.parseUnary();
      if (op === '-') return { type: NODE.UNARY, op: 'NEGATE', operand };
      if (op === '!') return { type: NODE.UNARY, op: 'NOT', operand };
      if (op === '~') return { type: NODE.UNARY, op: 'BITNOT', operand };
      return operand; // unary plus is a no-op
    }
    return this.parsePostfix();
  }

  parsePostfix() {
    let node = this.parsePrimary();
    for (;;) {
      if (this.atOp('[')) {
        this.next();
        const index = this.parseExpression();
        this.expectOp(']');
        node = { type: NODE.ARRAY_ACCESS, array: node, index };
        continue;
      }
      if (this.atOp('.')) {
        this.next();
        const prop = this.next();
        node = { type: NODE.MEMBER_ACCESS, object: node, property: prop.value };
        continue;
      }
      if (this.atOp('(') && (node.type === NODE.IDENT || node.type === NODE.MEMBER_ACCESS)) {
        this.next();
        const args = [];
        if (!this.atOp(')')) {
          args.push(this.parseAssignment());
          while (this.atOp(',')) {
            this.next();
            args.push(this.parseAssignment());
          }
        }
        this.expectOp(')');
        node = { type: NODE.CALL, callee: node, args };
        continue;
      }
      if (this.atOp('++') || this.atOp('--')) {
        const op = this.next().value === '++' ? 'INC' : 'DEC';
        node = { type: NODE.POST_INCDEC, op, operand: node };
        continue;
      }
      break;
    }
    return node;
  }

  parsePrimary() {
    const t = this.peek();

    if (t.type === TOKEN_TYPES.NUMBER) {
      this.next();
      return { type: NODE.LITERAL, value: t.value, litType: t.isFloat ? 'float' : 'int' };
    }
    if (t.type === TOKEN_TYPES.STRING) {
      this.next();
      return { type: NODE.LITERAL, value: t.value, litType: 'string' };
    }
    if (t.type === TOKEN_TYPES.CHAR) {
      this.next();
      return { type: NODE.LITERAL, value: t.value, litType: 'char' };
    }
    if (t.type === TOKEN_TYPES.KEYWORD) {
      this.next();
      if (t.value === 'true') return { type: NODE.LITERAL, value: true, litType: 'bool' };
      if (t.value === 'false') return { type: NODE.LITERAL, value: false, litType: 'bool' };
      return { type: NODE.LITERAL, value: null, litType: 'null' };
    }
    if (t.type === TOKEN_TYPES.IDENT) {
      this.next();
      return { type: NODE.IDENT, name: t.value };
    }
    if (this.atOp('(')) {
      this.next();
      const inner = this.parseExpression();
      this.expectOp(')');
      return inner;
    }
    if (this.atOp('[') || this.atOp('{')) {
      const close = this.next().value === '[' ? ']' : '}';
      const elements = [];
      if (!this.atOp(close)) {
        elements.push(this.parseAssignment());
        while (this.atOp(',')) {
          this.next();
          elements.push(this.parseAssignment());
        }
      }
      this.expectOp(close);
      return { type: NODE.ARRAY_LITERAL, elements };
    }

    throw new ParseError(`Unexpected token "${t.value ?? t.type}" in expression: ${this.source}`);
  }
}

export class ParseError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ParseError';
  }
}

/**
 * Parses an expression string into an AST. Returns an `Unsupported` node (never
 * throws) when the input can't be tokenized or parsed — callers decide whether that
 * should surface as a hard error (see engine/evaluator.js) rather than a guessed
 * value, per the "fail loudly, don't silently mistrace" principle.
 */
export function parseExpression(source) {
  const trimmed = (source ?? '').trim();
  if (!trimmed) return { type: NODE.LITERAL, value: undefined, litType: 'auto' };
  try {
    const tokens = tokenize(trimmed);
    const parser = new Parser(tokens, trimmed);
    const node = parser.parseExpression();
    if (parser.peek().type !== TOKEN_TYPES.EOF) {
      return { type: NODE.UNSUPPORTED, source: trimmed, reason: `Unexpected trailing token "${parser.peek().value}"` };
    }
    return node;
  } catch (err) {
    if (err instanceof TokenizeError || err instanceof ParseError) {
      return { type: NODE.UNSUPPORTED, source: trimmed, reason: err.message };
    }
    throw err;
  }
}

export default { parseExpression, NODE, ParseError };
