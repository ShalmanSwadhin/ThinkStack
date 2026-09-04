import Button from '../../../components/ui/Button';

function formatDate(value) {
  if (!value) return '';
  return new Date(value).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function ChatSidebar({
  conversations,
  activeConversationId,
  isLoading,
  onSelect,
  onNewChat,
  onDelete,
}) {
  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-slate-200 p-3 dark:border-slate-700">
        <Button className="w-full" size="sm" onClick={onNewChat}>
          New chat
        </Button>
      </div>

      <div className="flex-1 overflow-auto p-2">
        {isLoading ? (
          <div className="space-y-2 p-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-14 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
            ))}
          </div>
        ) : conversations.length === 0 ? (
          <p className="p-3 text-center text-sm text-slate-500 dark:text-slate-400">
            No conversations yet
          </p>
        ) : (
          <ul className="space-y-2">
            {conversations.map((conversation) => (
              <li key={conversation.id}>
                <div
                  className={`rounded-xl border p-3 transition-colors ${
                    activeConversationId === conversation.id
                      ? 'border-brand-500 bg-brand-50 dark:border-brand-400 dark:bg-brand-950/30'
                      : 'border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <button type="button" className="w-full text-left" onClick={() => onSelect(conversation.id)}>
                    <p className="truncate font-medium text-slate-800 dark:text-slate-100">
                      {conversation.title}
                    </p>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      {conversation.messageCount} messages · {formatDate(conversation.updatedAt)}
                    </p>
                  </button>
                  <div className="mt-2 flex justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700 dark:text-red-400"
                      onClick={() => onDelete(conversation.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
