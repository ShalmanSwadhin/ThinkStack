import { ARR, RETURN_VALUE, call, entryRule, rule, swapOf } from './helpers.js';

const RETURN = RETURN_VALUE;

export const SORTING = {
  'bubble-sort': [
    entryRule(/starting bubble sort/i, 'bubble_?sort'),
    rule(/compare/i, new RegExp(`${ARR}\\[j\\]\\s*>\\s*${ARR}\\[j\\s*\\+\\s*1\\]`)),
    rule(/swap/i, swapOf('j', 'j\\s*\\+\\s*1'), 'first'),
    // A pass finishing is the outer loop moving on: the first `for` header.
    rule(/final position/i, /\bfor\b/, 'first'),
    rule(/complete/i, [RETURN, '@last'], 'last'),
  ],

  'selection-sort': [
    entryRule(/starting selection sort/i, 'selection_?sort'),
    rule(/compare .* current minimum/i, new RegExp(`${ARR}\\[j\\]\\s*<\\s*${ARR}\\[(?:min_idx|minIdx|minIndex)\\]`)),
    rule(/place minimum/i, swapOf('i', '\\w+'), 'first'),
    rule(/complete/i, [RETURN, '@last'], 'last'),
  ],

  'insertion-sort': [
    entryRule(/starting insertion sort/i, 'insertion_?sort'),
    rule(/insert .* into sorted portion/i, new RegExp(`\\bkey\\s*=\\s*${ARR}\\[i\\]`)),
    rule(/compare .* with key/i, /\bwhile\b.*\bkey\b/),
    rule(/shift/i, new RegExp(`${ARR}\\[j\\s*\\+\\s*1\\]\\s*=\\s*${ARR}\\[j\\]`)),
    rule(/place key/i, new RegExp(`${ARR}\\[j\\s*\\+\\s*1\\]\\s*=\\s*key`)),
    rule(/complete/i, [RETURN, '@last'], 'last'),
  ],

  'merge-sort': [
    entryRule(/starting merge sort/i, 'merge_?sort'),
    // The merge call when the listing has the divide step, else the merge routine itself.
    rule(/merge subarrays/i, [call('merge'), /\bmerge\s*\(/], 'first'),
    rule(/compare/i, [/\w+\[i\]\s*<=\s*\w+\[j\]/, /take smaller front/], 'first'),
    rule(
      /merged segment/i,
      [/\breturn\s+(?:result|combined)/, /\bwhile\s*\(?\s*j\s*<\s*(?:\(int\))?\s*(?:n2|R\.length|R\.size\(\))/],
      'first'
    ),
    rule(/complete/i, [RETURN, '@last'], 'last'),
  ],

  'quick-sort': [
    entryRule(/starting quick sort/i, 'quick_?sort'),
    rule(/choose pivot/i, new RegExp(`\\bpivot\\s*=\\s*${ARR}\\[high\\]`)),
    rule(/compare .* with pivot/i, new RegExp(`${ARR}\\[j\\]\\s*<=\\s*pivot`)),
    rule(/move smaller/i, [...swapOf('(?:\\+\\+)?i', 'j'), /\bi\s*(?:\+\+|\+=\s*1)/], 'first'),
    rule(/place pivot/i, swapOf('i\\s*\\+\\s*1', 'high'), 'first'),
    rule(/complete/i, [RETURN, '@last'], 'last'),
  ],

  'heap-sort': [
    // The first `heapify(...)` call is the build loop; the listing shows no heapify body,
    // so the compare/swap sub-steps happen inside that call.
    rule(/build max heap/i, /\bn\s*\/+\s*2\b/),
    rule(/compare left child|compare right child|swap to maintain/i, call('heapify'), 'first'),
    rule(/extract max/i, swapOf('0', 'i'), 'first'),
    rule(/complete/i, [RETURN, '@last'], 'last'),
  ],

  'counting-sort': [
    entryRule(/starting counting sort/i, 'counting_?sort'),
    // Counting frequencies is the first loop over the input.
    rule(/frequency array/i, /\bfor\b/, 'first'),
    rule(/place .* in output/i, /\boutput\s*\[.*\]\s*=[^=]/, 'first'),
    rule(/complete/i, [RETURN, '@last'], 'last'),
  ],

  'radix-sort': [
    entryRule(/starting radix sort/i, 'radix_?sort'),
    rule(/sorted by digit place/i, /counting_?sort_?by_?digit\s*\(/i, 'first'),
    rule(/complete/i, [RETURN, '@last'], 'last'),
  ],

  'bucket-sort': [
    entryRule(/starting bucket sort/i, 'bucket_?sort'),
    rule(/place .* into bucket/i, /buckets\[[^\]]*\]\s*\.\s*(?:append|push_back|add|push)\s*\(/, 'first'),
    rule(/sort bucket/i, /\.sort\s*\(|\bsort\s*\(/, 'first'),
    rule(/complete/i, [RETURN, '@last'], 'last'),
  ],

  'shell-sort': [
    entryRule(/starting shell sort/i, 'shell_?sort'),
    rule(/use gap size/i, /\bgap\s*=|\bint\s+gap\b/, 'first'),
    rule(/compare .* at gap/i, /\bwhile\b.*\bgap\b.*\btemp\b/),
    rule(/insert .* at index/i, new RegExp(`${ARR}\\[j\\]\\s*=\\s*temp`)),
    rule(/complete/i, [RETURN, '@last'], 'last'),
  ],

  'tim-sort': [
    entryRule(/starting tim sort/i, 'tim_?sort'),
    rule(/sorted by insertion sort|within run/i, /insertion_?sort(?:_?run)?\s*\(/i, 'first'),
    rule(/merge runs|while merging|copy remaining/i, /\bmerge\s*\(/, 'first'),
    rule(/complete/i, [RETURN, '@last'], 'last'),
  ],
};
