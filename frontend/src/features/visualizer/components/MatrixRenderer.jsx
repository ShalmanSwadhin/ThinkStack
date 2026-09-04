export default function MatrixRenderer({ state }) {
  const labels = state?.labels ?? [];
  const values = state?.values ?? [];

  if (!labels.length) {
    return <div className="flex h-64 items-center justify-center text-slate-400">No matrix data</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-collapse text-sm">
        <thead>
          <tr>
            <th className="border px-3 py-2 text-slate-400"> </th>
            {labels.map((label) => (
              <th key={label} className="border px-3 py-2 font-medium text-slate-600 dark:text-slate-300">
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {values.map((row, rowIndex) => (
            <tr key={labels[rowIndex] ?? rowIndex}>
              <th className="border px-3 py-2 font-medium text-slate-600 dark:text-slate-300">
                {labels[rowIndex]}
              </th>
              {row.map((cell, colIndex) => {
                const highlighted = state.highlights?.some(
                  ([r, c]) => r === rowIndex && c === colIndex
                );
                const display = cell === Infinity ? '∞' : cell;
                return (
                  <td
                    key={`${rowIndex}-${colIndex}`}
                    className={`border px-3 py-2 text-center ${
                      highlighted
                        ? 'bg-brand-100 font-semibold text-brand-700 dark:bg-brand-950 dark:text-brand-300'
                        : 'text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {display}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
