import Button from '../../../components/ui/Button';

const DIFFICULTIES = [
  { value: '', label: 'All difficulties' },
  { value: 'easy', label: 'Easy' },
  { value: 'medium', label: 'Medium' },
  { value: 'hard', label: 'Hard' },
];

const STATUSES = [
  { value: '', label: 'All statuses' },
  { value: 'unsolved', label: 'Unsolved' },
  { value: 'attempted', label: 'Attempted' },
  { value: 'solved', label: 'Solved' },
];

export default function ProblemFilters({ filters, onChange }) {
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      <input
        id="problem-search"
        name="search"
        type="search"
        className="input-field"
        placeholder="Search problems..."
        value={filters.search}
        onChange={(event) => onChange({ search: event.target.value })}
        aria-label="Search problems"
      />
      <select
        id="problem-difficulty"
        name="difficulty"
        className="input-field"
        value={filters.difficulty}
        onChange={(event) => onChange({ difficulty: event.target.value })}
        aria-label="Filter by difficulty"
      >
        {DIFFICULTIES.map((option) => (
          <option key={option.value || 'all'} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <select
        id="problem-status"
        name="status"
        className="input-field"
        value={filters.status}
        onChange={(event) => onChange({ status: event.target.value })}
        aria-label="Filter by status"
      >
        {STATUSES.map((option) => (
          <option key={option.value || 'all'} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <input
        id="problem-topic"
        name="topic"
        type="text"
        className="input-field"
        placeholder="Filter by topic (e.g. arrays, trees)…"
        value={filters.topic}
        onChange={(event) => onChange({ topic: event.target.value })}
        aria-label="Filter by topic"
      />
      <div className="md:col-span-2 xl:col-span-4">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onChange({ search: '', difficulty: '', status: '', topic: '', page: 1 })}
        >
          Clear filters
        </Button>
      </div>
    </div>
  );
}
