import Button from '../../../components/ui/Button';

export default function AdminEntityTable({
  columns,
  rows,
  onStatusChange,
  statusOptions = ['draft', 'published'],
}) {
  if (!rows?.length) {
    return (
      <div className="empty-state py-8">
        <span className="empty-state-icon" aria-hidden="true">
          📋
        </span>
        <p className="empty-state-title">No records found</p>
        <p className="empty-state-desc">There are no items to display in this table yet.</p>
      </div>
    );
  }

  return (
    <div className="data-table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key}>{column.label}</th>
            ))}
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              {columns.map((column) => (
                <td key={column.key}>
                  {column.render ? column.render(row) : row[column.key]}
                </td>
              ))}
              <td>
                {onStatusChange ? (
                  <select
                    value={row.status}
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
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function AdminQuickCreate({
  title,
  fields,
  values,
  onChange,
  onSubmit,
  isSaving,
}) {
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
      className="card-base mb-6"
    >
      <h3 className="font-semibold tracking-tight text-slate-900 dark:text-white">{title}</h3>
      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {fields.map((field) => (
          <input
            key={field.name}
            type={field.type || 'text'}
            placeholder={field.placeholder}
            value={values[field.name] ?? ''}
            onChange={(event) => onChange(field.name, event.target.value)}
            className="input-field"
          />
        ))}
      </div>
      <Button type="submit" size="sm" className="mt-4" disabled={isSaving}>
        {isSaving ? 'Saving...' : 'Create'}
      </Button>
    </form>
  );
}
