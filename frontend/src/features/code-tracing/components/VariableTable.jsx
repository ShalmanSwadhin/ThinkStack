function formatDisplayValue(value) {
  if (value === undefined) return 'undefined';
  if (value === null) return 'null';
  if (typeof value === 'string') return `"${value}"`;
  if (Array.isArray(value)) return `[${value.map(formatDisplayValue).join(', ')}]`;
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  return String(value);
}

function valueType(value) {
  if (Array.isArray(value)) return 'array';
  if (value === null) return 'null';
  return typeof value;
}

export default function VariableTable({ variables }) {
  const entries = Object.entries(variables ?? {});

  return (
    <div className="overflow-hidden rounded-xl border dark:border-slate-700">
      <div className="border-b bg-slate-100 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:bg-slate-900">
        Variable Watch
      </div>
      {entries.length ? (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-xs uppercase text-slate-400">
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Type</th>
              <th className="px-4 py-2">Value</th>
            </tr>
          </thead>
          <tbody>
            {entries.map(([name, value]) => (
              <tr key={name} className="border-b last:border-0 dark:border-slate-700">
                <td className="px-4 py-2 font-mono text-brand-600 dark:text-brand-400">{name}</td>
                <td className="px-4 py-2 text-xs capitalize text-slate-500">{valueType(value)}</td>
                <td className="px-4 py-2 font-mono text-slate-700 dark:text-slate-300">
                  {formatDisplayValue(value)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="px-4 py-6 text-sm text-slate-500">
          No variables yet. Run or step through your code to see memory values.
        </p>
      )}
    </div>
  );
}
