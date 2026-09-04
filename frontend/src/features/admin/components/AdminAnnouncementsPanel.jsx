import Button from '../../../components/ui/Button';

export default function AdminAnnouncementsPanel({
  announcements,
  form,
  onChange,
  onSubmit,
  onToggleActive,
  isSaving,
}) {
  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }}
        className="rounded-2xl border bg-white p-6 dark:border-slate-700 dark:bg-slate-900"
      >
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">New announcement</h3>
        <p className="mt-1 text-sm text-slate-500">
          Active announcements notify all users immediately.
        </p>

        <div className="mt-4 space-y-4">
          <input
            type="text"
            value={form.title}
            onChange={(event) => onChange({ title: event.target.value })}
            placeholder="Title"
            className="w-full rounded-xl border px-3 py-2 dark:border-slate-700 dark:bg-slate-950"
            required
          />
          <textarea
            value={form.content}
            onChange={(event) => onChange({ content: event.target.value })}
            placeholder="Announcement content"
            rows={5}
            className="w-full rounded-xl border px-3 py-2 dark:border-slate-700 dark:bg-slate-950"
            required
          />
          <select
            value={form.priority}
            onChange={(event) => onChange({ priority: event.target.value })}
            className="w-full rounded-xl border px-3 py-2 dark:border-slate-700 dark:bg-slate-950"
          >
            <option value="low">Low priority</option>
            <option value="normal">Normal priority</option>
            <option value="high">High priority</option>
          </select>
          <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(event) => onChange({ isActive: event.target.checked })}
            />
            Publish immediately
          </label>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? 'Publishing…' : 'Create announcement'}
          </Button>
        </div>
      </form>

      <div className="space-y-3">
        {(announcements ?? []).map((announcement) => (
          <div
            key={announcement.id}
            className="rounded-2xl border bg-white p-4 dark:border-slate-700 dark:bg-slate-900"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium text-slate-900 dark:text-white">{announcement.title}</p>
                <p className="mt-1 text-sm text-slate-500">{announcement.content}</p>
              </div>
              <Button
                size="sm"
                variant="secondary"
                disabled={isSaving}
                onClick={() =>
                  onToggleActive(announcement.id, { isActive: !announcement.isActive })
                }
              >
                {announcement.isActive ? 'Deactivate' : 'Activate'}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
