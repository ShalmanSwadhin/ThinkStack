import { useState } from 'react';
import Button from '../../../components/ui/Button';

export default function ChatInput({ onSend, disabled, placeholder, disabledReason }) {
  const [value, setValue] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    setValue('');
    await onSend(trimmed);
  };

  return (
    <form onSubmit={handleSubmit} className="border-t border-slate-200 p-4 dark:border-slate-700">
      <div className="flex gap-2">
        <textarea
          className="input-field min-h-[80px] flex-1 resize-none"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault();
              handleSubmit(event);
            }
          }}
        />
        <Button
          type="submit"
          disabled={disabled || !value.trim()}
          className="self-end"
          title={disabled && disabledReason ? disabledReason : undefined}
        >
          Send
        </Button>
      </div>
      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
        Press Enter to send, Shift+Enter for a new line
      </p>
    </form>
  );
}
