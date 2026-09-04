import { useCallback, useEffect, useState } from 'react';
import Button from '../../../components/ui/Button';
import { cn } from '../../../utils/cn';

export function AdminToolbar({
  search,
  onSearchChange,
  searchPlaceholder = 'Search…',
  filters,
  sort,
  onSortChange,
  sortOptions = [],
  bulkActions,
  selectedCount = 0,
}) {
  return (
    <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-1 flex-wrap items-center gap-2">
        <input
          type="search"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder={searchPlaceholder}
          className="input-field max-w-xs"
        />
        {filters}
        {sortOptions.length > 0 && (
          <select
            value={sort}
            onChange={(event) => onSortChange(event.target.value)}
            className="input-field w-auto"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        )}
      </div>
      {selectedCount > 0 && bulkActions && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-slate-500">{selectedCount} selected</span>
          {bulkActions}
        </div>
      )}
    </div>
  );
}

export function AdminPagination({ meta, page, onPageChange }) {
  if (!meta || meta.pages <= 1) return null;

  return (
    <div className="mt-4 flex items-center justify-between text-sm text-slate-600 dark:text-slate-400">
      <span>
        Page {meta.page} of {meta.pages} ({meta.total} total)
      </span>
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="secondary"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          Previous
        </Button>
        <Button
          size="sm"
          variant="secondary"
          disabled={page >= meta.pages}
          onClick={() => onPageChange(page + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}

export function useAdminList(fetchFn, { defaultSort = '-updatedAt', pageSize = 20 } = {}) {
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState(null);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState(defaultSort);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = { page, limit: pageSize, sort };
      if (search.trim()) params.search = search.trim();
      if (statusFilter) params.status = statusFilter;
      const data = await fetchFn(params);
      const listKey = Object.keys(data).find((key) => Array.isArray(data[key]));
      setItems(data[listKey] ?? []);
      setMeta(data.meta ?? null);
      setSelectedIds([]);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  }, [fetchFn, page, pageSize, search, sort, statusFilter]);

  useEffect(() => {
    const timer = setTimeout(load, search ? 300 : 0);
    return () => clearTimeout(timer);
  }, [load, search]);

  const toggleSelect = (id) => {
    setSelectedIds((current) =>
      current.includes(id) ? current.filter((value) => value !== id) : [...current, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === items.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(items.map((item) => item.id));
    }
  };

  return {
    items,
    meta,
    search,
    setSearch,
    sort,
    setSort,
    page,
    setPage,
    statusFilter,
    setStatusFilter,
    isLoading,
    error,
    selectedIds,
    toggleSelect,
    toggleSelectAll,
    reload: load,
  };
}

export default function AdminDataTable({
  columns,
  rows,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
  onEdit,
  onDelete,
  onDuplicate,
  onArchive,
  onRestore,
  onPreview,
  onStatusChange,
  statusOptions = ['draft', 'published', 'archived'],
  emptyMessage = 'No records found',
}) {
  if (!rows?.length) {
    return (
      <div className="empty-state py-8">
        <span className="empty-state-icon" aria-hidden="true">
          📋
        </span>
        <p className="empty-state-title">{emptyMessage}</p>
      </div>
    );
  }

  const allSelected = rows.length > 0 && selectedIds?.length === rows.length;

  return (
    <div className="data-table-wrap overflow-x-auto">
      <table className="data-table">
        <thead>
          <tr>
            {onToggleSelectAll && (
              <th className="w-10">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={onToggleSelectAll}
                  aria-label="Select all"
                />
              </th>
            )}
            {columns.map((column) => (
              <th key={column.key}>{column.label}</th>
            ))}
            <th>Status</th>
            <th className="text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className={cn(selectedIds?.includes(row.id) && 'bg-brand-50/50 dark:bg-brand-950/20')}>
              {onToggleSelect && (
                <td>
                  <input
                    type="checkbox"
                    checked={selectedIds?.includes(row.id)}
                    onChange={() => onToggleSelect(row.id)}
                    aria-label={`Select ${row.title ?? row.name ?? row.slug}`}
                  />
                </td>
              )}
              {columns.map((column) => (
                <td key={column.key}>
                  {column.render ? column.render(row) : row[column.key]}
                </td>
              ))}
              <td>
                {onStatusChange ? (
                  <select
                    value={row.status ?? row.storedStatus}
                    onChange={(event) => onStatusChange(row.id, event.target.value)}
                    className="input-field w-auto py-1.5 text-xs"
                  >
                    {statusOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                ) : (
                  row.status
                )}
              </td>
              <td>
                <div className="flex flex-wrap justify-end gap-1">
                  {onPreview && (
                    <Button size="sm" variant="ghost" onClick={() => onPreview(row)}>
                      Preview
                    </Button>
                  )}
                  {onEdit && (
                    <Button size="sm" variant="secondary" onClick={() => onEdit(row)}>
                      Edit
                    </Button>
                  )}
                  {onDuplicate && (
                    <Button size="sm" variant="ghost" onClick={() => onDuplicate(row)}>
                      Duplicate
                    </Button>
                  )}
                  {onArchive && row.status !== 'archived' && (
                    <Button size="sm" variant="ghost" onClick={() => onArchive(row)}>
                      Archive
                    </Button>
                  )}
                  {onRestore && row.status === 'archived' && (
                    <Button size="sm" variant="ghost" onClick={() => onRestore(row)}>
                      Restore
                    </Button>
                  )}
                  {onDelete && (
                    <Button size="sm" variant="ghost" className="text-rose-600" onClick={() => onDelete(row)}>
                      Delete
                    </Button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
