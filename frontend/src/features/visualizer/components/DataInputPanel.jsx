import Button from '../../../components/ui/Button';

export default function DataInputPanel({
  algorithm,
  customInput,
  target,
  onCustomInputChange,
  onTargetChange,
  onRandomize,
  onGenerate,
}) {
  const showArray = algorithm?.inputType === 'array' || algorithm?.inputType === 'array-target';
  const showWords = algorithm?.inputType === 'words';
  const showTarget = algorithm?.inputType === 'array-target';
  const showGraphNote = algorithm?.inputType === 'graph';

  return (
    <div className="space-y-4">
      {showArray && (
        <div>
          <label htmlFor="viz-input" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Custom data
          </label>
          <input
            id="viz-input"
            name="viz-input"
            type="text"
            value={customInput}
            onChange={(event) => onCustomInputChange(event.target.value)}
            placeholder="e.g. 8, 3, 5, 1, 9, 2"
            className="input-field"
          />
        </div>
      )}

      {showWords && (
        <div>
          <label htmlFor="viz-words" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Custom words
          </label>
          <input
            id="viz-words"
            name="viz-words"
            type="text"
            value={customInput}
            onChange={(event) => onCustomInputChange(event.target.value)}
            placeholder="cat, car, card, care"
            className="input-field"
          />
        </div>
      )}

      {showTarget && (
        <div>
          <label htmlFor="viz-target" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Search target
          </label>
          <input
            id="viz-target"
            name="viz-target"
            type="number"
            value={target}
            onChange={(event) => onTargetChange(Number(event.target.value))}
            className="input-field"
          />
        </div>
      )}

      {showGraphNote && (
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Uses the preset weighted graph (A–E). Randomize shuffles edge weights for a new run.
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        {!showGraphNote && (
          <Button size="sm" variant="secondary" onClick={onRandomize}>
            Random Data
          </Button>
        )}
        <Button size="sm" onClick={onGenerate}>
          Generate Steps
        </Button>
      </div>
    </div>
  );
}
