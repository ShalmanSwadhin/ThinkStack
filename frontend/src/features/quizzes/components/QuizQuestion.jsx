import { cn } from '../../../utils/cn';

export default function QuizQuestion({ question, index, selectedIndex, onSelect, disabled }) {
  return (
    <div className="card-base">
      <p className="mb-5 font-medium leading-relaxed tracking-tight text-slate-900 dark:text-white">
        <span className="mr-2 inline-flex h-7 w-7 items-center justify-center rounded-lg bg-brand-100 text-sm font-bold text-brand-700 dark:bg-brand-950 dark:text-brand-300">
          {index + 1}
        </span>
        {question.question}
      </p>
      <div className="space-y-2.5">
        {question.options.map((option, optionIndex) => {
          const isSelected = selectedIndex === optionIndex;
          return (
            <button
              key={optionIndex}
              type="button"
              disabled={disabled}
              onClick={() => onSelect(optionIndex)}
              className={cn(
                'w-full rounded-xl border px-4 py-3.5 text-left text-sm transition-colors duration-150',
                isSelected
                  ? 'border-brand-500 bg-brand-50 text-brand-700 shadow-soft ring-1 ring-brand-200 dark:border-brand-400 dark:bg-brand-950/40 dark:text-brand-200 dark:ring-brand-800/50'
                  : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:hover:border-slate-600 dark:hover:bg-slate-800/50',
                disabled && 'cursor-default opacity-80'
              )}
            >
              <span className="mr-2 font-semibold text-brand-600 dark:text-brand-400">
                {String.fromCharCode(65 + optionIndex)}.
              </span>
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}
