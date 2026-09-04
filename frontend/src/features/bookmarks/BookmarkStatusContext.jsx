import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import bookmarksApi from './bookmarksService';

const BookmarkStatusContext = createContext(null);

const BATCH_SIZE = 100;

async function fetchBookmarkedIds(targetType, ids) {
  if (!ids.length) return [];

  const bookmarked = new Set();
  for (let i = 0; i < ids.length; i += BATCH_SIZE) {
    const chunk = ids.slice(i, i + BATCH_SIZE);
    const data = await bookmarksApi.getStatus(targetType, chunk);
    for (const id of data.bookmarkedIds ?? []) {
      bookmarked.add(id);
    }
  }
  return bookmarked;
}

export function BookmarkStatusProvider({ targetType, targetIds = [], children }) {
  const [bookmarkedIds, setBookmarkedIds] = useState(() => new Set());
  const [isReady, setIsReady] = useState(false);

  const idsKey = useMemo(() => targetIds.join(','), [targetIds]);

  useEffect(() => {
    let cancelled = false;

    if (!targetType || !targetIds.length) {
      setBookmarkedIds(new Set());
      setIsReady(true);
      return undefined;
    }

    setIsReady(false);
    fetchBookmarkedIds(targetType, targetIds)
      .then((set) => {
        if (!cancelled) {
          setBookmarkedIds(set);
          setIsReady(true);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setBookmarkedIds(new Set());
          setIsReady(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [targetType, idsKey, targetIds]);

  const isBookmarked = useCallback((id) => bookmarkedIds.has(id), [bookmarkedIds]);

  const setBookmarked = useCallback((id, bookmarked) => {
    setBookmarkedIds((prev) => {
      const next = new Set(prev);
      if (bookmarked) next.add(id);
      else next.delete(id);
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({ targetType, isReady, isBookmarked, setBookmarked }),
    [targetType, isReady, isBookmarked, setBookmarked]
  );

  return (
    <BookmarkStatusContext.Provider value={value}>{children}</BookmarkStatusContext.Provider>
  );
}

export function useBookmarkStatusContext() {
  return useContext(BookmarkStatusContext);
}

export default BookmarkStatusContext;
