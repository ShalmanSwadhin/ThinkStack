import { useCallback, useEffect, useState } from 'react';
import bookmarksApi from './bookmarksService';
import { useBookmarkStatusContext } from './BookmarkStatusContext';

export function useBookmark({ targetType, targetId, targetSlug, initialBookmarked = false }) {
  const batchContext = useBookmarkStatusContext();
  const hasBatchProvider =
    batchContext != null && batchContext.targetType === targetType && Boolean(targetId);

  const [localBookmarked, setLocalBookmarked] = useState(initialBookmarked);
  const [isLoading, setIsLoading] = useState(false);

  const isBookmarked =
    hasBatchProvider && batchContext.isReady
      ? batchContext.isBookmarked(targetId)
      : localBookmarked;

  useEffect(() => {
    if (hasBatchProvider || !targetId) return undefined;

    let cancelled = false;
    bookmarksApi
      .getStatus(targetType, [targetId])
      .then((data) => {
        if (!cancelled) {
          setLocalBookmarked(data.bookmarkedIds?.includes(targetId) ?? false);
        }
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [targetId, targetType, hasBatchProvider]);

  useEffect(() => {
    if (!hasBatchProvider) {
      setLocalBookmarked(initialBookmarked);
    }
  }, [initialBookmarked, targetId, targetSlug, hasBatchProvider]);

  const toggleBookmark = useCallback(
    async (event) => {
      event?.preventDefault?.();
      event?.stopPropagation?.();

      setIsLoading(true);
      try {
        if (isBookmarked) {
          await bookmarksApi.removeBookmark({ targetType, targetId, targetSlug });
          if (hasBatchProvider) batchContext.setBookmarked(targetId, false);
          else setLocalBookmarked(false);
        } else {
          await bookmarksApi.addBookmark({ targetType, targetId, targetSlug });
          if (hasBatchProvider) batchContext.setBookmarked(targetId, true);
          else setLocalBookmarked(true);
        }
      } catch {
        // Keep prior state on failure
      } finally {
        setIsLoading(false);
      }
    },
    [isBookmarked, targetId, targetSlug, targetType, hasBatchProvider, batchContext]
  );

  return { isBookmarked, isLoading, toggleBookmark };
}

export function useBookmarksList() {
  const [bookmarks, setBookmarks] = useState([]);
  const [meta, setMeta] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBookmarks = useCallback(async (params = {}) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await bookmarksApi.listBookmarks(params);
      setBookmarks(data.bookmarks ?? []);
      setMeta(data.meta ?? null);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to load bookmarks');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookmarks();
  }, [fetchBookmarks]);

  const removeBookmark = useCallback(
    async (bookmarkId) => {
      await bookmarksApi.removeBookmark({ bookmarkId });
      await fetchBookmarks();
    },
    [fetchBookmarks]
  );

  return { bookmarks, meta, isLoading, error, removeBookmark, refetch: fetchBookmarks };
}

export default useBookmark;
