import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useBookmarksList } from '../features/bookmarks/useBookmarks';
import Button from '../components/ui/Button';

export default function BookmarksPage() {
  const { bookmarks, isLoading, error, removeBookmark } = useBookmarksList();

  return (
    <div className="page-container py-8 pb-24 lg:pb-8">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="page-heading">Bookmarks</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Saved topics, problems, and quizzes
        </p>

        {error && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="mt-6 space-y-3">
            {[1, 2, 3].map((item) => (
              <div key={item} className="h-16 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
            ))}
          </div>
        ) : bookmarks.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-dashed p-10 text-center dark:border-slate-700">
            <p className="text-slate-600 dark:text-slate-300">No bookmarks yet.</p>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Use the star icon on topics, problems, or quizzes to save them here.
            </p>
            <Link to="/learn" className="mt-4 inline-block">
              <Button size="sm">Browse topics</Button>
            </Link>
          </div>
        ) : (
          <ul className="mt-6 space-y-3">
            {bookmarks.map((bookmark) => (
              <li
                key={bookmark.id}
                className="flex items-center justify-between gap-4 rounded-xl border bg-white p-4 dark:bg-slate-800"
              >
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    {bookmark.targetType}
                  </p>
                  <Link
                    to={bookmark.href}
                    className="mt-1 block truncate font-medium text-slate-900 hover:text-brand-600 dark:text-white dark:hover:text-brand-400"
                  >
                    {bookmark.title}
                  </Link>
                  <p className="truncate text-sm text-slate-500 dark:text-slate-400">{bookmark.subtitle}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => removeBookmark(bookmark.id)}>
                  Remove
                </Button>
              </li>
            ))}
          </ul>
        )}
      </motion.div>
    </div>
  );
}
