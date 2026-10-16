/**
 * Pure helper for keeping the active item of a horizontally scrolling visualization in view
 * (e.g. the bar being compared in a long array). It only computes a number so it can be unit
 * tested without a browser; the renderer applies it to its own scroll container, never to the page.
 *
 * All horizontal positions are in the same coordinate space (client rects work), `scrollLeft` is
 * the container's current scroll offset, and the result is the scroll offset that shows the item
 * fully with `margin` pixels to spare — or the unchanged offset when it is already visible.
 */
export function horizontalScrollTarget({ viewportLeft, viewportWidth, scrollLeft, itemLeft, itemRight, margin = 16 }) {
  const viewportRight = viewportLeft + viewportWidth;
  const itemWidth = itemRight - itemLeft;
  const room = viewportWidth - 2 * margin;

  if (itemWidth >= room) {
    // Wider than the window: line its left edge up with the left margin.
    return Math.max(0, scrollLeft + (itemLeft - viewportLeft - margin));
  }
  if (itemLeft < viewportLeft + margin) {
    return Math.max(0, scrollLeft - (viewportLeft + margin - itemLeft));
  }
  if (itemRight > viewportRight - margin) {
    return Math.max(0, scrollLeft + (itemRight - (viewportRight - margin)));
  }
  return scrollLeft;
}

export default horizontalScrollTarget;
