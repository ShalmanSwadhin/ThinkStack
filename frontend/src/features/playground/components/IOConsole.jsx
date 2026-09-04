export default function IOConsole({ label, value, onChange, rows = 4, placeholder }) {
  return (
    <div className="flex h-full flex-col">
      <label className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
        {label}
      </label>
      <textarea
        className="input-field min-h-0 flex-1 resize-none font-mono text-xs"
        rows={rows}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        spellCheck={false}
      />
    </div>
  );
}
