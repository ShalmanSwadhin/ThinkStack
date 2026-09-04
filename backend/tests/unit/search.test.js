import { sanitizeSearchQuery } from '../../src/services/SearchService.js';

describe('SearchService helpers', () => {
  it('sanitizes search query text', () => {
    expect(sanitizeSearchQuery('  binary   search!  ')).toBe('binary search');
    expect(sanitizeSearchQuery('"graph"')).toBe('graph');
  });
});
