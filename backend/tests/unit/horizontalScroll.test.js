import { horizontalScrollTarget } from '../../../shared/ui/horizontalScroll.js';

// A 400px-wide scroller whose left edge is at x = 100; items are 24px wide.
const base = { viewportLeft: 100, viewportWidth: 400, margin: 16 };

describe('horizontalScrollTarget (keeps the active visualizer bar in view)', () => {
  it('does nothing when the item is already comfortably visible', () => {
    expect(horizontalScrollTarget({ ...base, scrollLeft: 50, itemLeft: 250, itemRight: 274 })).toBe(50);
  });

  it('scrolls right just enough to reveal an item beyond the right edge', () => {
    // item right edge 560 vs usable right edge 100 + 400 - 16 = 484 -> 76px further
    expect(horizontalScrollTarget({ ...base, scrollLeft: 0, itemLeft: 536, itemRight: 560 })).toBe(76);
  });

  it('scrolls left to reveal an item before the left edge', () => {
    // item left 60 vs usable left edge 116 -> 56px back
    expect(horizontalScrollTarget({ ...base, scrollLeft: 300, itemLeft: 60, itemRight: 84 })).toBe(244);
  });

  it('never scrolls below zero', () => {
    expect(horizontalScrollTarget({ ...base, scrollLeft: 10, itemLeft: 40, itemRight: 64 })).toBe(0);
  });

  it('keeps an item that is too wide for the window aligned to the left margin', () => {
    expect(horizontalScrollTarget({ ...base, scrollLeft: 0, itemLeft: 300, itemRight: 800 })).toBe(184);
  });

  it('treats an item sitting exactly on the margin as visible', () => {
    expect(horizontalScrollTarget({ ...base, scrollLeft: 5, itemLeft: 116, itemRight: 140 })).toBe(5);
    expect(horizontalScrollTarget({ ...base, scrollLeft: 5, itemLeft: 460, itemRight: 484 })).toBe(5);
  });
});
