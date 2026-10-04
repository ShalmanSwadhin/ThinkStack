import { RETURN_VALUE, entryRule, rule } from './helpers.js';

const COMPLETE = rule(/complete|done|ready/i, [RETURN_VALUE, '@last'], 'last');

export const STRUCTURES = {
  'stack-operations': [
    // The declaration of the stack: first line that names it (`stack_demo(` is a different word).
    rule(/initialize empty stack/i, /\bstack\b/, 'first'),
    rule(/push .* onto stack/i, /\bstack\s*(?:\.\s*(?:append|push)\s*\(|\[\s*\+\+top)/, 'first'),
    rule(/peek top/i, /\b(?:top|topVal)\s*=\s*stack\b/),
    rule(/pop from stack/i, /\bstack\s*\.\s*pop\s*\(|\btop--/, 'first'),
    rule(/operations complete/i, [RETURN_VALUE, '@last'], 'last'),
  ],

  'queue-operations': [
    rule(/initialize empty queue/i, /\bqueue\b/, 'first'),
    rule(/enqueue/i, /\bqueue\s*(?:\.\s*(?:append|enqueue|add|push|offer)\s*\(|\[\s*back\+\+)/, 'first'),
    rule(/front element/i, /\b(?:front|frontVal)\s*=\s*queue\b/),
    rule(/dequeue/i, /\bqueue\s*\.\s*(?:pop|dequeue|poll|popleft|shift)\s*\(|\bfront\+\+/, 'first'),
    rule(/operations complete/i, [RETURN_VALUE, '@last'], 'last'),
  ],

  'linked-list-insert': [
    entryRule(/start with empty linked list/i, 'insert_?at_?tail'),
    // Linking the new node after the current tail is the insertion itself.
    rule(/insert .* at tail/i, /\bcurrent\s*(?:\.|->)\s*next\s*=\s*new_?node/i),
    rule(/build complete/i, /\breturn\s+head\b/, 'last'),
  ],

  'hash-linear-probing': [
    entryRule(/create hash table/i, 'insert'),
    rule(/^hash /i, /\bindex\s*=\s*(?:hash\s*\(\s*value\s*\)|value)\s*%/),
    rule(/collision at index/i, /\bwhile\b.*\btable\s*\[\s*index\s*\]/),
    rule(/place .* at index/i, /\btable\s*\[\s*index\s*\]\s*=\s*value/),
    rule(/insertion complete/i, [RETURN_VALUE, '@last'], 'last'),
  ],

  'monotonic-stack': [
    rule(/initialize empty monotonic/i, /\bstack\b.*(?:=\s*\[\s*\]|top\s*=\s*-1|=\s*new\b)|\bstd::stack\b/, 'first'),
    // The loop header that visits each element (the last `for`: C also has a fill loop first).
    rule(/consider arr/i, /\bfor\b/, 'last'),
    rule(/pop index/i, /\bresult\s*\[.*(?:pop|top--|top\s*\(\s*\)).*\]\s*=\s*arr/i, 'first'),
    rule(/push index/i, /\bstack\s*(?:\.\s*(?:append|push)\s*\(\s*i\s*\)|\[\s*\+\+top\s*\]\s*=\s*i)/),
    rule(/next greater elements/i, [RETURN_VALUE, '@last'], 'last'),
  ],

  'deque-sliding-window': [
    entryRule(/sliding window maximum with window size/i, 'sliding_?window_?max'),
    rule(/process index/i, /\b(?:deque|dq)\s*(?:\.\s*(?:append|pushBack|addLast|push_back|push)\s*\(\s*i\s*\)|\[\s*back\+\+\s*\]\s*=\s*i)/, 'first'),
    rule(/window ending at/i, /\bresult\b.*\b(?:deque|dq)\b/, 'first'),
    rule(/window maximums/i, [RETURN_VALUE, '@last'], 'last'),
  ],
};

export { COMPLETE };
